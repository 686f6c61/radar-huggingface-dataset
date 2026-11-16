# alea-institute/alea-r4-3B-A0.7B-Base

## Resumen

ALEA R4 3B-A0.7B Base es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por ALEA Institute, una organizacion centrada en el entrenamiento de modelos exclusivamente con datos licitos (registros publicos legales, regulatorios y financieros de EE. UU., Diario Oficial de la UE, texto de dominio publico y datos sinteticos propios). El modelo forma parte de la release R0, publicada el 15 de noviembre de 2026, y se distribuye como modelo base sin ajuste por instrucciones, sin alineamiento de preferencias y sin fase de decaimiento de la tasa de aprendizaje.

Tecnicamente es un transformer MoE de 3.315.557.632 parametros totales (3,32B) con unos 673M parametros activos por token, construido sobre la arquitectura estandar `Qwen3MoeForCausalLM` (sin `trust_remote_code`). Cuenta con 32 capas, dimension de modelo 1.280, 16 cabezas de consulta y 8 de clave/valor, QK-norm, RoPE con theta 1e6, 48 expertos enrutados con top-6 y embeddings de entrada/salida atados. Su ventana de contexto es de solo 4.096 tokens.

La relevancia del modelo es doble. Por un lado, explora el entrenamiento con datos estrictamente licitos como restriccion de diseno, lo que lo hace interesante para pipelines legales donde la trazabilidad de la procedencia de los datos es critica. Por otro lado, su model card es inusualmente honesta: documenta de forma explicita que el modelo esta cerca del azar en MMLU y BBH, que falla en razonamiento condicional y que inventa nombres, cifras y citas judiciales al continuar texto legal. Es, por tanto, un modelo base de investigacion, no un asistente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`Qwen3MoeForCausalLM` estandar, sin `trust_remote_code`): 32 capas, d_model 1.280, 16 cabezas Q / 8 KV (head_dim 128), QK-norm, RoPE (theta 1e6), 48 expertos enrutados (FFN 512) con top-6, embeddings entrada/salida atados |
| Parametros totales | 3.315.557.632 (3,32B; 3,36B si se cuenta por separado la cabeza de salida atada) |
| Parametros activos | ~673M por token |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | ingles (`en`) |
| Licencia | CC-BY-4.0 (contenido derivado de WordNet sujeto a `WORDNET_LICENSE.txt`) |
| Formato de pesos | safetensors (un unico fichero bf16 de 6,6 GB) |
| Tokenizer | `alea-v2b-sw32k`: BPE de 32.768 tokens, 226 tokens especiales de control y reservados (ids 0-225), plantilla de chat; `<\|start\|>` (id 0) se antepone automaticamente |
| Tokens de parada | `<\|end\|>` (id 1) y `<\|eot\|>` (id 7) en `generation_config.json` |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3 MoE sin modificaciones: 32 capas transformer con atencion de 16 cabezas de consulta y 8 de clave/valor (GQA), normalizacion QK, RoPE con theta 1e6, y una capa FFN de mezcla de expertos con 48 expertos enrutados de dimension 512 y enrutamiento top-6. Los embeddings de entrada y salida estan atados. No emplea decodificacion especulativa, atencion lineal ni mecanismos hibridos SSM; es un transformer MoE convencional.

El entrenamiento se realizo con OLMo-core sobre una unica GPU NVIDIA GH200, con 1.048.576 tokens por paso, optimizador AdamW (betas 0,9/0,95, weight decay 0,1) y tasa de aprendizaje 4e-4 constante tras un calentamiento de 2.000 pasos. Los pesos publicados no son un checkpoint de entrenamiento directo: R0 es la media aritmetica uniforme de cuatro checkpoints de preentrenamiento (pasos 35.000, 45.000, 55.000 y 65.000), calculada en fp32 y almacenada en bf16, sin entrenamiento posterior a la media. Esos cuatro checkpoints habian visto aproximadamente 36,7B, 47,2B, 57,7B y 68,2B tokens respectivamente, y proceden de cuatro mezclas de datos distintas (segmentos 4, 5, 7 y 8 de la ejecucion R4). El autor justifica la media porque supero a los checkpoints individuales y a otras medias en recall de libro cerrado, pares minimos de grounding y extraccion JSON en su suite de evaluacion.

No hay RLHF, DPO ni ajuste de instrucciones. Tampoco se aplico fase de decaimiento de la tasa de aprendizaje: el autor probo continuaciones con decaimiento y encontro que mejoraban la recitacion del U.S. Code y la perdida en validacion, pero empeoraban gravemente el formato de respuesta y el comportamiento en sondas de lectura (46 a 74 respuestas "not stated" frente a 20 de R0 en 120 items), por lo que decidio no incluirlas en esta release.

## Capacidades

- Generacion de texto en ingles: continuacion de prosa general y, especialmente, de texto legal, regulatorio y financiero.
- Recitacion y recall de libro cerrado sobre corpus legales publicos (U.S. Code, registros regulatorios, Diario Oficial de la UE).
- Extraccion JSON y tareas en contexto: segun el autor, R0 obtiene mejores resultados que el ultimo checkpoint individual de R4 en estas pruebas.
- Tareas de conocimiento y factual recall en sondas propias de ALEA.
- Plantilla de chat incluida en el tokenizer, aunque el modelo no esta ajustado por instrucciones.
- Compatibilidad con endpoints estandar de transformers (`endpoints_compatible`).
- No soporta de forma fiable: tool calling, function calling, razonamiento multi-paso, matematicas, vision, audio, modo thinking ni capacidades multilingues (solo ingles).

## Casos de uso

- Investigacion sobre entrenamiento con datos licitos: el modelo sirve como punto de partida reproducible para estudiar como afecta restringir el corpus a registros publicos legales y de dominio publico, ya que el autor publica los checkpoints intermedios como ramas del repositorio `alea-r4-3B-A0.7B-Base-ckpts`.
- Generacion de borradores de continuacion de clausulas contractuales: con 4.096 tokens de contexto y entrenamiento sobre texto legal, puede completar fragmentos de contratos (por ejemplo, clausulas de ley aplicable, como muestra el ejemplo de la model card), siempre que un revisor humano valide cada salida.
- Extraccion estructurada en pipelines documentales: su rendimiento relativamente bueno en extraccion JSON dentro de las sondas del autor permite usarlo como componente de prototipos de parsing de documentos legales, con validacion posterior obligatoria.
- Baseline para evaluacion de modelos legales: al ser un modelo base pequeno (3,32B totales, 673M activos) y con licencia permisiva, es util como referencia en comparaciones academicas de modelos legales de bajo coste.
- Clasificacion y ranking de fragmentos contractuales en investigacion: aunque su AUROC en CUAD y ContractNLI (0,653) es inferior al de los Qwen3 base de 0,6B a 4B (0,688 a 0,891), puede emplearse para estudiar el comportamiento de modelos entrenados con datos licitos frente a modelos de proposito general.
- Fine-tuning posterior para dominios legales concretos: al ser un modelo base sin ajuste, es adecuado como inicializacion para SFT o DPO sobre tareas especificas, aprovechando su licencia CC-BY-4.0 y su tamano reducido (6,6 GB en bf16).
- Despliegue en entornos con requisitos de procedencia de datos: organizaciones que necesiten documentar que el modelo no se entreno con datos pirateados o de procedencia dudosa pueden evaluarlo como componente de sistemas internos de generacion asistida.

## Benchmarks y rendimiento

La model card no publica una tabla numerica de benchmarks estandar (MMLU, HumanEval, GSM8K) con valores concretos, pero si describe cualitativamente el rendimiento en varias pruebas. Los unicos datos numericos disponibles son los siguientes:

| Prueba | Resultado |
|---|---|
| MMLU | cerca del azar (sin cifra publicada) |
| BBH | cerca del azar (sin cifra publicada) |
| Sonda de lectura (120 items) | 20 respuestas "not stated" incorrectas |
| RTE formulada como pregunta si/no (200 items) | 29 aciertos de formato |
| LegalBench CUAD y ContractNLI (AUROC) | 0,653 |
| Qwen3 base 0,6B-4B (AUROC, referencia) | 0,688 a 0,891 |
| Sonda de conocimiento (media R0) | 83,2 frente a 82,0 de la mejor media alternativa |

No se han publicado resultados completos de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 8-10 GB para contexto corto.
- Al ser un MoE con 673M parametros activos, el coste computacional por token es bajo en comparacion con un denso de 3,3B, aunque todos los pesos deben residir en memoria.
- GPU recomendadas: NVIDIA GH200 (la usada en entrenamiento), A100, H100 para despliegues con concurrencia; tambien cabe en RTX 4090 (24 GB) y en GPUs consumer con 12 GB o mas en bf16.
- Cabe en GPU consumer: si, en RTX 4090, RTX 4080, RTX 3090 y similares con 12-24 GB. No se documentan cuantizaciones GGUF, por lo que no se puede confirmar su viabilidad en GPUs de 8 GB sin conversion manual.
- Opciones de despliegue: transformers (libreria oficial), endpoints compatibles; no se documenta soporte verificado de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| ALEA R4 3B-A0.7B Base | 3,32B | ~673M | 4.096 | CC-BY-4.0 | MoE, solo ingles, datos licitos, sin instruction tuning |
| Qwen3 base 0,6B-4B | 0,6B-4B | densos | no disponible en la informacion | no disponible en la informacion | Referencia usada por el autor en LegalBench; AUROC 0,688-0,891 frente a 0,653 de ALEA |
| Otros modelos legales de ~3B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la informacion proporcionada |

La unica comparacion con datos concretos es la de LegalBench CUAD y ContractNLI frente a los Qwen3 base de 0,6B a 4B, donde ALEA R4 queda por debajo en AUROC (0,653 frente a 0,688-0,891). No se dispone de comparaciones con otros modelos legales especificos.

## Limitaciones y advertencias

- Rendimiento near-chance en MMLU y BBH: el propio autor lo declara; no es un modelo para tareas de razonamiento general.
- Falla en razonamiento condicional y en el formato de respuesta si/no en tareas RTE.
- Alucinacion grave en dominio legal: inventa nombres, cifras, pies de sentencia y fallos judiciales al continuar texto legal o financiero. Toda cita, dato o referencia debe tratarse como no verificada.
- En una sonda de lectura donde la respuesta aparece literalmente en el pasaje, responde "not stated" en 20 de 120 items.
- No conoce su propia autoria ni informacion basica sobre si mismo.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para documentos legales largos sin troceado.
- Solo soporta ingles; no hay capacidades multilingues.
- Es un modelo base: no tiene ajuste por instrucciones ni alineamiento de seguridad, por lo que puede generar contenido inapropiado o danino sin filtros.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero el contenido derivado de WordNet esta sujeto a `WORDNET_LICENSE.txt`, que debe revisarse antes de redistribuir.
- No es asesoramiento legal: la model card lo indica explicitamente.
- No se documentan cuantizaciones ni soporte verificado en frameworks de inferencia de alto rendimiento (vLLM, TGI), lo que limita su despliegue en produccion a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alea-institute/alea-r4-3B-A0.7B-Base
- Checkpoints intermedios: https://huggingface.co/alea-institute/alea-r4-3B-A0.7B-Base-ckpts
- Preview con pesos identicos: https://huggingface.co/alea-institute/alea-r4-3B-A0.7B-Base-preview
- Proyecto KL3M Data Project: no disponible en la informacion proporcionada
- Paper o blog tecnico de ALEA Institute: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
