# Quazim0t0/Escarda-86M-Identity

## Resumen

Escarda-86M-Identity es un modelo de lenguaje de pequeno tamano (~86M de parametros segun el autor; 97.272.836 parametros reales en los pesos safetensors) publicado por Quazim0t0 (Dean Byrne) en HuggingFace. Se trata de la variante de chat con ajuste de identidad de Escarda-86M, entrenada mediante SFT (epoca 3) sobre una base ya reparada a nivel de "engram", de modo que el modelo se identifica como "Escarda" y responde con un formato de asistente limpio. La licencia es Apache-2.0 y el unico idioma declarado es el ingles.

Tecnicamente es poco convencional: no es un transformer decoder estandar, sino una arquitectura propia denominada SpikeWhaleLM, que combina MLA (Multi-head Latent Attention) con Q/O de rango LoRA 128, RoPE desacoplado (16 dimensiones) mas NoPE (48 dimensiones), atencion multi-query y QK-norm, junto con memoria de n-gramas ("engram"), doble busqueda por hash, hiper-conexiones, un modulo de refinamiento HRM, una cabeza de entrenamiento MTP y un componente JEPA. El contexto es de 4.096 tokens, con 16 capas, hidden de 640 y vocabulario de 16.512 tokens con embeddings atados.

Su relevancia es acotada y muy especifica: sirve como banco de pruebas de arquitecturas experimentales en el rango sub-100M y como modelo de investigacion reproducible (Apache-2.0, safetensors, `trust_remote_code`). No compite en capacidad de razonamiento: el propio autor indica que la precision en benchmarks "permanece cerca del suelo" para un modelo de este tamano y que el SFT solo mejora fluidez y formato de salida, no la capacidad de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpikeWhaleLM (decoder propio con MLA, JEPA y HRM refine); no es un transformer estandar |
| Parametros totales | 97.272.836 (dato real de safetensors); el autor lo denomina "~86M" |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se anuncian GGUF ni otras cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Capas | 16 |
| Dimension oculta | 640 |
| Vocabulario | 16.512 tokens, embeddings atados |
| Tokenizer | SpikeTokenizer (byte-level, greedy longest-match, especiales ChatML atomicos) |
| Formato de chat | ChatML (`<\|im_start\|>role\n...<\|im_end\|>`); la generacion arranca tras `<\|im_start\|>assistant\n` |
| Tamano del repositorio | 0,8 GB |
| Descargas / likes | 58 / 1 |
| Fecha de creacion | 2026-06-20 |
| Ultima actualizacion | 2026-09-19 |

## Arquitectura y entrenamiento

SpikeWhaleLM es una arquitectura personalizada de tipo decoder que integra varios mecanismos poco habituales en el rango de 86-97M de parametros. La atencion usa MLA (Multi-head Latent Attention) con proyecciones Q y O de rango LoRA 128, RoPE desacoplado en 16 dimensiones combinado con 48 dimensiones NoPE, esquema multi-query y QK-norm. Ademas incorpora memoria de n-gramas ("engram") con doble busqueda por hash, hiper-conexiones, un modulo de refinamiento HRM (activo en esta variante: `use_hrm_refine=True`), una cabeza de entrenamiento MTP (multi-token prediction) y un componente JEPA (tambien activo: `use_jepa=True`). El modelo usa 16 capas, hidden 640, contexto de 4.096 tokens y embeddings atados con un vocabulario de 16.512 tokens.

El entrenamiento parte de Escarda-86M y se estructura en dos fases descritas por el autor. Primero se aplica una "reparacion de engram" que preserva el comportamiento, y despues un SFT corto de instrucciones y formato sobre una mezcla 60/25/15 de ejemplos de HuggingFaceTB/smoltalk, GSM8K-train (con razonamiento en formato `#### N`) y ejemplos estilo MMLU (formato `Answer: <letter>`). El objetivo declarado es mejorar la fluidez conversacional sin sobrescribir los formatos de salida que usan los benchmarks. Los datos concretos de entrenamiento (numero total de tokens, composicion exacta del corpus, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada; el autor si documenta que el SFT no aporta capacidad de razonamiento nueva.

## Capacidades

- Generacion de texto y respuestas conversacionales en ingles con formato ChatML.
- Ajuste de identidad: el modelo se reconoce como "Escarda" y responde como asistente, lo que da coherencia al tono en conversaciones multi-turno.
- Seguimiento de formato de salida: el autor reporta una tasa de formato MMLU de 0,958 tras el SFT (frente a 0,700 antes), y una tasa de 0,735 en el marcador `####` de GSM8K (frente a 0,530).
- Aritmetica basica medida con ArithMark-2.0: 0,3628 en la metrica oficial `acc` (la mas alta de la familia Escarda, segun el autor).
- Modelado de lenguaje: WikiText-2 byte-perplexity de 2,7062 y BLiMP de 0,7133.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor indica explicitamente que el SFT no anade razonamiento.
- Capacidades multilingues: limitadas al ingles declarado.
- Capacidades especiales: modo "thinking" y vision no disponibles. La memoria de n-gramas (engram) y el componente JEPA son rasgos internos de arquitectura, no modos de uso expuestos al usuario.

## Casos de uso

- Investigacion en arquitecturas sub-100M: el modelo permite experimentar con MLA, JEPA, memoria de engram e hiper-conexiones en un tamano que se entrena y se ejecuta en una sola GPU consumer, algo inviable con arquitecturas equivalentes de mayor escala.
- Prototipado de pipelines de chat: dado que sigue ChatML de forma estricta, puede integrarse como sustituto barato de un modelo mayor para validar plantillas de prompt, parseo de turnos y logica de conversacion antes de escalar a un modelo en produccion.
- Generacion de texto a gran escala con coste minimo: con menos de 100M de parametros, se puede desplegar en CPU o en GPUs de gama baja para tareas de autocompletado, resumen extractivo simple o reformulacion de texto en ingles.
- Evaluacion de tokenizers byte-level: el SpikeTokenizer con vocabulario de 16.512 tokens y especiales ChatML atomicos sirve para comparar eficiencia de tokenizacion y comportamiento en dominios con mucho ruido (codigo, texto sin normalizar).
- Reproducibilidad de benchmarks en modelos pequenos: al publicar resultados zero-shot sobre splits completos de validacion y test (ARC, HellaSwag, WinoGrande, PIQA, OpenBookQA, BoolQ), es util como referencia para estudiar como se degradan las metricas en el rango sub-100M.
- Educacion y docencia: su tamano (0,8 GB de repositorio) y licencia Apache-2.0 permiten que estudiantes lo descarguen, inspeccionen el codigo personalizado (`custom_code`) y tracen el forward pass completo en un portatil.
- Filtrado o preprocesado ligero: puede actuar como clasificador generativo de baja latencia en tareas auxiliares donde no se requiere precision alta, aprovechando su coste casi nulo de inferencia.

## Benchmarks y rendimiento

Resultados zero-shot publicados en la model card, sobre splits completos de validacion y test (`acc` = log-verosimilitud de la continuacion en bruto; `acc_norm` = normalizada por longitud en bytes):

| Tarea | acc | acc_norm |
|---|---|---|
| ARC-Easy | 0,3262 | 0,3380 |
| ARC-Challenge | 0,2048 | 0,2415 |
| HellaSwag | 0,2785 | 0,2818 |
| WinoGrande | 0,5020 | no disponible |
| PIQA | 0,5539 | 0,5462 |
| OpenBookQA | 0,1360 | 0,2440 |
| BoolQ | 0,4174 | no disponible |

Otras metricas reportadas:

| Metrica | Valor |
|---|---|
| ArithMark-2.0 (`acc` oficial) | 0,3628 |
| WikiText-2 byte-perplexity (menor es mejor) | 2,7062 |
| BLiMP (mayor es mejor) | 0,7133 |
| MMLU acc (antes -> despues del SFT de formato) | 0,188 -> 0,284 |
| Formato MMLU (antes -> despues) | 0,700 -> 0,958 |
| GSM8K marcador `####` (antes -> despues) | 0,530 -> 0,735 |

El autor advierte que las ganancias de MMLU y GSM8K corresponden a fluidez y formato de salida, no a precision de razonamiento: la propia model card senala que la exactitud en benchmarks "permanece cerca del suelo" para un modelo de este tamano. No se han publicado comparaciones directas contra otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 97,27M de parametros reales: aproximadamente 390 MB en FP32, 195 MB en BF16/FP16, 97 MB en INT8 y 49 MB en INT4. Hay que sumar el coste de activaciones y cache KV, que no esta cuantificado en la informacion disponible.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o en CPU. El repositorio completo ocupa 0,8 GB.
- GPU de centro de datos (A100, H100) no son necesarias para inferencia; solo tendrian sentido para reentrenamiento en lote o para servir muchas replicas en paralelo.
- Despliegue: `transformers` con `trust_remote_code=True` es la via documentada por el autor, tanto para `AutoModelForCausalLM` como para `AutoTokenizer` (la arquitectura y el tokenizer son personalizados).
- vLLM, llama.cpp, Ollama, TGI o formatos GGUF: no disponibles en la informacion proporcionada. Al tratarse de una arquitectura `custom_code` con JEPA y HRM refine, no se puede asumir compatibilidad con esos motores sin verificacion previa.
- Latencia y throughput estimados: no disponibles.
- Existe una demo publica en un Space de HuggingFace para probar el modelo sin despliegue local.

## Comparativa con modelos similares

No se han publicado en la informacion disponible resultados de benchmarks de modelos alternativos, por lo que la comparacion de rendimiento se marca como no disponible. Comparacion estructural con modelos de tamano comparable:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Escarda-86M-Identity | 97,27M reales (etiquetado ~86M) | 4.096 tokens | Apache-2.0 | Pesos safetensors en HuggingFace, requiere `trust_remote_code` | Ver tabla de benchmarks de esta ficha |
| SmolLM-135M (HuggingFaceTB) | 135M | no disponible en esta busqueda | Apache-2.0 | Pesos transformers estandar | no disponible |
| Pythia-70M (EleutherAI) | 70M | no disponible en esta busqueda | Apache-2.0 | Pesos transformers estandar | no disponible |
| GPT-2 (OpenAI) | 124M | no disponible en esta busqueda | MIT | Pesos transformers estandar | no disponible |

La diferencia practica mas relevante frente a estas alternativas no es el rendimiento, sino la integracion: Escarda-86M-Identity exige cargar codigo personalizado (`custom_code`) y no es un decoder transformer estandar, mientras que las alternativas citadas funcionan en los motores de inferencia habituales sin cambios.

## Limitaciones y advertencias

- Precision muy baja en tareas de conocimiento y razonamiento: ARC-Challenge 0,2048, OpenBookQA 0,1360, HellaSwag 0,2785. El propio autor reconoce que la exactitud esta "cerca del suelo" para este tamano.
- Riesgo alto de alucinacion: con 97M de parametros y resultados de MMLU en torno a 0,284, no es fiable para generar contenido factual sin verificacion humana.
- El SFT mejora fluidez y formato, no capacidad. No debe interpretarse el aumento de MMLU de 0,188 a 0,284 como una mejora de razonamiento; el autor lo atribuye a formato y fluidez.
- Idioma: solo ingles declarado. No hay evidencia de competencia en castellano ni en otros idiomas.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos, bases de codigo extensas o conversaciones muy prolongadas.
- Discrepancia en el recuento de parametros: la model card y el nombre del modelo indican ~86M, mientras que los pesos safetensors contienen 97.272.836 parametros. Conviene verificar el dato antes de dimensionar recursos.
- Dependencia de codigo remoto: el uso requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python del repositorio del autor. Es un riesgo de seguridad y de mantenimiento en produccion.
- Compatibilidad de despliegue no garantizada: no se han publicado cuantizaciones GGUF ni confirmacion de soporte en vLLM, llama.cpp, Ollama o TGI.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias; no se documentan evaluaciones de sesgo, toxicidad o seguridad.
- Adopcion muy baja: 58 descargas y 1 like en el momento de los datos, con una unica persona manteniendo el modelo. No hay garantia de soporte ni de actualizaciones.
- La busqueda web realizada no devolvio informacion relevante sobre este modelo: los resultados obtenidos correspondian a contenidos sanitarios sobre tuberculosis, sin relacion con el modelo. No se ha podido validar informacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Quazim0t0/Escarda-86M-Identity
- Modelo base: https://huggingface.co/Quazim0t0/Escarda-86M
- Demo en vivo (Space): https://huggingface.co/spaces/Quazim0t0/Escarda-86M-Chat
- Dataset ArithMark-2.0 (AxiomicLabs): https://huggingface.co/datasets/AxiomicLabs/ArithMark-2.0
- Dataset smoltalk (usado en el SFT): https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Citacion indicada por el autor:
  ```bibtex
  @misc{escarda86midentity,
    title        = {Escarda-86M-Identity: A ~86M-parameter SpikeWhaleLM},
    author       = {Dean Byrne (Quazim0t0)},
    year         = {2026},
    howpublished = {HuggingFace, \url{https://huggingface.co/Quazim0t0/Escarda-86M-Identity}},
    note         = {Quazim0t0/Escarda-86M-Identity}
  }
  ```
- Paper, blog o repositorio adicionales: no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.
