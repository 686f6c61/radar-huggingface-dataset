# Aobangaming/lightning-105m

## Resumen

Lightning-105m es un modelo de lenguaje autoregresivo de tipo transformer desarrollado por AobanZ (Aobangaming) y publicado en HuggingFace. Se trata de la version ampliada de Lightning-60m, que a su vez deriva de Lightning-30m-ft. Con 105.357.312 parametros, 12 capas y un espacio latente de 512 dimensiones, el modelo esta disenado para generacion de texto conversacional y continuacion de historias en ingles, con un coste computacional muy bajo.

El modelo se entrena integramente sobre el dataset BookSum (kmfoda/booksum), un corpus de resumenes y texto de libros de aproximadamente 300 MB. Utiliza atencion causal con FlashAttention/SDPA, normalizacion previa a cada capa (pre-LN) y codificacion posicional sinusoidal. Su relevancia actual es limitada pero concreta: sirve como banco de pruebas educativo para experimentar con arquitecturas transformer pequenas, fine-tuning sobre dominio literario y despliegue en hardware muy modesto (se entreno en una unica RTX 3050 de 6 GB durante 6 horas).

No es un modelo de proposito general ni compite con modelos de escala media o grande. La propia model card lo situa como herramienta de investigacion, analisis y experimentacion, y advierte explicitamente de que las salidas pueden ser incompletas, inexactas o repetitivas. Su licencia MIT y su tamano (0,4 GB en el repositorio, pesos en FP32) lo hacen facil de ejecutar incluso en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only, 12 capas, pre-layer normalization, atencion causal con scaled dot-product, FlashAttention/SDPA, MHA |
| Parametros totales | 105.357.312 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 230 tokens (segun la tabla de hiperparametros de la model card; dato ambiguo, no confirmado de forma independiente) |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ, GPTQ ni cuantizadas oficiales; los pesos del repositorio estan en FP32) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension del modelo (d_model) | 512 |
| Cabezas de atencion | 8 (64 dimensiones por cabeza) |
| Red feed-forward | GELU con expansion 4x |
| Codificacion posicional | Sinusoidal |
| Embeddings de entrada/salida | No compartidos (untied) |
| Vocabulario | aproximadamente 65.830 tokens |
| Libreria | transformers (requiere `trust_remote_code=True` y tokenizer propio `lightning_tokenizer.json`) |
| Modelos base | Aobangaming/lightning-30m-ft, Aobangaming/lightning-60m |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 210 / 3 |

## Arquitectura y entrenamiento

Lightning-105m es un transformer decoder-only causal de 12 capas con d_model de 512 y 8 cabezas de atencion de 64 dimensiones cada una. Emplea normalizacion previa a la subcapa (pre-LN), atencion causal con scaled dot-product product, una red feed-forward con activacion GELU y factor de expansion 4x, codificacion posicional sinusoidal y embeddings de entrada y salida no compartidos. La model card indica el uso de FlashAttention y SDPA, y MHA (atencion multi-cabeza clasica, sin variantes agrupadas). El modelo se implementa con codigo personalizado (`custom_code`), por lo que su carga requiere `trust_remote_code=True` y un tokenizer propio cargado con la libreria `tokenizers`.

El entrenamiento se realizo sobre el dataset completo BookSum (kmfoda/booksum), con aproximadamente 300 MB de texto de libros y resumenes. Se utilizo precision FP32, optimizador AdamW, learning rate de 5e-4 y batch size de 24, durante 5 epocas. Segun la model card, no se aplico una fase de fine-tuning posterior sobre datasets especificos por limitaciones de memoria. El autor indica que el modelo no fue entrenado con tecnicas de RLHF ni DPO, y la model card no documenta ninguna innovacion tecnica mas alla del uso de FlashAttention y de la sustitucion de la atencion respecto al modelo de 60M. Todo el entrenamiento se ejecuto en una RTX 3050 de 6 GB durante 6 horas (Windows 11, Intel i5-10400), con una emision estimada de 0,17 kg de CO2 equivalente.

## Capacidades

- Generacion de texto autoregresiva en ingles: continuacion de prompts, parrafos cortos y respuestas conversacionales basicas.
- Continuacion y generacion de narrativa: el entrenamiento sobre BookSum favorece la produccion de texto con registro literario.
- Modo conversacional declarado en las etiquetas del modelo (`conversational`), aunque no se documenta un formato de chat ni plantilla de mensajes especifica.
- Generacion con parametros de decodificacion configurables mediante la funcion `generate_text` incluida en el codigo del modelo: `top_k`, `top_p`, `temperature`, `penalty` y `max_len`.
- Capacidad de fine-tuning posterior: la model card sugiere ajustarlo para generacion de historias o modelos pequenos de continuacion.
- Idiomas: unicamente ingles. La model card es explicita: el modelo procesa texto en ingles y conversacional exclusivamente.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Vision, audio, thinking mode u otras modalidades: no disponible.

## Casos de uso

- Experimentacion academica con transformers pequenos: permite estudiar el comportamiento de un decoder de 12 capas y 105M parametros entrenado desde cero, sin necesidad de infraestructura GPU dedicada, ya que cabe en cualquier GPU consumer e incluso en CPU.
- Prototipado de generacion de narrativa: para generar borradores o continuaciones de texto con registro literario aprovechando el entrenamiento sobre BookSum, siempre con revision humana posterior.
- Fine-tuning sobre dominios literarios concretos: el modelo sirve como punto de partida (base checkpoint) para ajustes sobre corpus de genero, autores o estilos, dado su tamano reducido y su licencia MIT.
- Educacion y demos de inferencia local: util como ejemplo didactico de carga de modelos con `custom_code` y tokenizer propio, y de decodificacion con `top_k`/`top_p`/`temperature` en un portatil.
- Pruebas de pipelines de evaluacion de modelos: por su bajo coste, es adecuado para validar herramientas de evaluacion de perplejidad, deteccion de repeticiones o analisis de sesgos antes de escalar a modelos mayores.
- Generacion de texto aumentada en aplicaciones de bajo recursos (por ejemplo, juguetes, bots de texto simples o prototipos offline) donde el presupuesto de computo es practicamente nulo.
- Investigacion sobre degeneracion de salidas: la model card advierte de salidas repetitivas o corruptas, lo que lo convierte en un caso de estudio util para tecnicas de mitigacion (penalizacion de repeticion, muestreo nuclear, ajuste de temperatura).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento documentado son las curvas de perdida y perplejidad durante el entrenamiento:

| Epoca | Perdida media | Perplejidad |
|---:|---:|---:|
| 1 | 4,937238495 | 139,384826660 |
| 2 | 4,020790739 | 55,745159149 |
| 3 | 3,596491258 | 36,470046997 |
| 4 | 3,274661109 | 26,434265137 |
| 5 | 3,045641310 | 21,023511887 |

No se proporcionan metricas de evaluacion en un conjunto de validacion o test independiente, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para los pesos: en FP32 (formato publicado) unos 0,42 GB; en FP16/BF16 unos 0,21 GB; en INT8 unos 0,11 GB; en INT4 unos 0,06 GB.
- VRAM total estimada en inferencia: por debajo de 1 GB en FP16 incluyendo overhead del runtime y la cache KV, dado el contexto de 230 tokens y el tamano del modelo.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente; el propio autor lo entreno en una RTX 3050 de 6 GB. Funciona tambien en GTX 1050/1650, RTX 2060/3060/4060, y en GPUs de datacenter (A100, H100) no aporta ninguna ventaja relevante por su tamano.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas e incluso en iGPU con memoria compartida suficiente.
- Ejecucion en CPU: viable, con latencia mayor pero funcional; el modelo es lo bastante pequeno para inferencia en CPU sin cuantizacion.
- Opciones de despliegue: `transformers` es la via oficial y documentada, con `trust_remote_code=True` y el tokenizer `lightning_tokenizer.json`. No hay soporte oficial documentado en vLLM, TGI, llama.cpp u Ollama; al requerir codigo personalizado y tokenizer propio, su integracion en estos motores exigiria registrar la arquitectura o convertir los pesos a GGUF.
- Latencia y throughput estimados: no disponible (no se publican datos de tokens por segundo ni latencia).

## Comparativa con modelos similares

La informacion proporcionada no incluye comparaciones de rendimiento. La tabla siguiente compara unicamente caracteristicas arquitectonicas y de licencia conocidas publicamente de alternativas de tamano similar; los datos de rendimiento de los otros modelos no se han verificado en esta busqueda y deben consultarse en sus propias model cards.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lightning-105m | 105.357.312 | 230 tokens (segun model card) | MIT | HuggingFace, safetensors, requiere `custom_code` |
| GPT-2 (124M) | 124 millones | 1024 tokens | MIT (pesos publicados por OpenAI) | HuggingFace, safetensors, ampliamente integrado en vLLM, llama.cpp y Ollama |
| DistilGPT-2 | 82 millones | 1024 tokens | MIT | HuggingFace, safetensors, integrado en la mayoria de runtimes |
| Pythia-160M | 160 millones | 2048 tokens | Apache 2.0 | HuggingFace, safetensors, integrado en vLLM y TGI |
| SmolLM-135M | 135 millones | 2048 tokens | Apache 2.0 | HuggingFace, safetensors y GGUF, integrado en llama.cpp y transformers |

Diferencias clave: Lightning-105m tiene la ventana de contexto mas corta del grupo y depende de codigo personalizado, lo que reduce su portabilidad frente a alternativas con arquitecturas estandar registradas en los principales motores de inferencia. A cambio, su licencia MIT no impone restricciones adicionales y su huella de memoria es la mas baja del conjunto.

## Limitaciones y advertencias

- Riesgo alto de alucinacion: la model card indica explicitamente que las salidas pueden ser incompletas, inexactas, repetitivas o no relacionadas con la entrada.
- Perplejidad elevada: el mejor valor registrado al final del entrenamiento es 21,02, lo que indica un ajuste limitado incluso sobre el propio dominio de entrenamiento.
- Contexto muy corto: la tabla de hiperparametros apunta a una longitud de secuencia de 230 tokens, insuficiente para conversaciones multiturno largas, documentos extensos o razonamiento multi-paso.
- Dominio restringido: entrenado exclusivamente sobre BookSum (texto de libros y resumenes en ingles), por lo que su comportamiento fuera de ese registro es poco fiable.
- Un solo idioma: soporta unicamente ingles; no hay evidencia de capacidades multilingues.
- Ausencia de benchmarks: no hay evaluaciones publicas estandar que permitan verificar sus capacidades reales ni compararlo de forma objetiva.
- Sin fases de alineacion: no se documenta RLHF, DPO ni filtrado de seguridad, por lo que puede reproducir sesgos presentes en el corpus de libros y no incorpora guardarrailes propios.
- Restricciones de uso segun el autor: la model card indica que no esta destinado a asesoramiento profesional, escritura real ni cargas de trabajo intensivas, y que no debe reentrenarse para dominios distintos del texto en ingles (por ejemplo, robotica).
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion, sin garantias; conviene anadir guardarrailes propios antes de cualquier despliegue en produccion.
- Dependencia de codigo personalizado: `trust_remote_code=True` implica ejecutar codigo del autor al cargar el modelo, un riesgo de seguridad a evaluar en entornos gestionados.
- Tokenizer no estandar: se distribuye como `lightning_tokenizer.json` y se carga con la libreria `tokenizers`, no como un tokenizer de HuggingFace convencional, lo que complica la integracion con herramientas del ecosistema.
- Inconsistencia en los metadatos: el repositorio figura con fecha de creacion 2026-09-20, posterior a la fecha de consulta habitual de los datos; conviene verificar la vigencia y el historial real del repositorio.
- Trazabilidad limitada: se declaran 210 descargas y 3 likes, sin documentacion externa, paper ni evaluaciones de terceros que respalden el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aobangaming/lightning-105m
- Modelo base (fine-tune de 30M): https://huggingface.co/Aobangaming/lightning-30m-ft
- Modelo base (60M): https://huggingface.co/Aobangaming/lightning-60m
- Dataset de entrenamiento (BookSum): https://huggingface.co/datasets/kmfoda/booksum
- Paper de referencia sobre impacto ambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning: https://mlco2.github.io/impact
- Sitio del autor: https://aobanweb.com
- Repositorio de codigo, paper tecnico o demo: no disponible en la informacion proporcionada
