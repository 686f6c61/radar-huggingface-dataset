# goodmai/NVIDIA-Nemotron-3-Nano-4B-4bit

## Resumen

NVIDIA-Nemotron-3-Nano-4B-4bit es una conversión a formato MLX y cuantización de 4 bits del modelo nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16, desarrollado originalmente por NVIDIA como parte de la familia Nemotron 3. La conversión la firma el usuario goodmai (con el mismo contenido que la versión de mlx-community), y está pensada para ejecutar el modelo de forma eficiente en hardware Apple Silicon mediante la librería mlx-lm.

El modelo es un transformer de tipo nemotron_h con 3.973.556.832 parámetros totales (aproximadamente 4B), orientado a generación de texto y conversación. Su interés radica en que empaqueta un modelo de NVIDIA afinado con datos propios (Nemotron-CC-v2, Nemotron-Post-Training-Dataset-v2, entre otros) en un formato ligero de 2,3 GB, lo que permite desplegarlo en equipos de consumo con memoria unificada en lugar de requerir GPUs de datacenter.

La relevancia actual es doble: por un lado, ofrece una vía práctica de probar la familia Nemotron 3 en local; por otro, ilustra el ecosistema de cuantización y portabilidad (MLX, safetensors) que permite mover modelos open weight entre plataformas. La información pública disponible sobre esta conversión concreta es escasa: la model card se limita a indicar el proceso de conversión y un ejemplo de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo nemotron_h), según tag del repositorio |
| Parametros totales | 3.973.556.832 (~4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (esta versión); el modelo base está en BF16 |
| Idiomas soportados | en (inglés) |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | MLX (safetensors), librería mlx-lm versión 0.31.2 |

## Arquitectura y entrenamiento

La arquitectura declarada es nemotron_h, un transformer de la familia Nemotron 3 de NVIDIA. No se dispone de detalles técnicos específicos sobre el número de capas, dimensión oculta, mecanismo de atención o si incorpora innovaciones como atención lineal o decodificación especulativa; esta información no está disponible en la documentación proporcionada.

Respecto al entrenamiento, los tags del repositorio listan un conjunto amplio de datasets de NVIDIA: Nemotron-CC-v2 (corpus de preentrenamiento), Nemotron-Post-Training-Dataset-v2, Nemotron-Science-v1, Nemotron-Instruction-Following-Chat-v1, Nemotron-Agentic-v1, Nemotron-Competitive-Programming-v1, Nemotron-Math-Proofs-v1, y varios conjuntos de RL (Nemotron-RL-Agentic-Conversational-Tool-Use-Pivot-v1, Nemotron-RL-instruction_following, Nemotron-RL-agent-calendar_scheduling, Nemotron-RL-instruction_following-structured_outputs). Esto sugiere un pipeline de preentrenamiento seguido de post-entrenamiento con instrucciones, datos agénticos, matemáticas, programación competitiva y refuerzo (RL) sobre instrucciones, tool use y salidas estructuradas. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset.

Esta versión concreta es una conversión de pesos BF16 a MLX con cuantización de 4 bits mediante mlx-lm 0.31.2; no se ha reentrenado ni afinado el modelo, solo se ha transformado el formato y la precisión.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline text-generation, tag conversational).
- Razonamiento e instrucciones: el modelo base se ha afinado con Nemotron-Instruction-Following-Chat-v1 y datos de RL sobre instruction following.
- Programación: incluye datos de Nemotron-Competitive-Programming-v1, lo que apunta a capacidad de generación y razonamiento sobre código.
- Matemáticas: entrena con Nemotron-Math-Proofs-v1, orientado a demostraciones y razonamiento matemático.
- Tool calling / function calling: los datasets Nemotron-RL-Agentic-Conversational-Tool-Use-Pivot-v1 y Nemotron-RL-agent-calendar_scheduling indican soporte de uso de herramientas y planificación agéntica.
- Salidas estructuradas: el dataset Nemotron-RL-instruction_following-structured_outputs sugiere capacidad de generar JSON u otros formatos estructurados.
- Capacidades agénticas: Nemotron-Agentic-v1 apunta a tareas multi-paso y uso de agentes.
- Multilingüe: limitado a inglés según el campo language del repositorio.
- No se documentan capacidades de visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Asistente conversacional local en Mac: gracias al formato MLX y a los 2,3 GB del repositorio, se puede cargar con mlx-lm en un Mac con memoria unificada y mantener conversaciones multi-turno sin conexión a servicios externos.
- Generación de código en el editor: el modelo se ha entrenado con datos de programación competitiva; puede usarse para autocompletar funciones, explicar fragmentos o proponer tests en un flujo de desarrollo local.
- Automatización de tareas con tool calling: los datos de RL agéntico y de calendar_scheduling permiten integrarlo en un agente que consulte APIs, gestione calendarios o ejecute acciones encadenadas.
- Generación de salidas estructuradas: útil para extraer información de texto y devolver JSON validable, aprovechando el entrenamiento en instruction following con structured outputs.
- Razonamiento matemático asistido: para resolver problemas paso a paso o verificar demostraciones en entornos educativos o de investigación, apoyándose en los datos de Nemotron-Math-Proofs-v1.
- Prototipado rápido en investigación: al ser un modelo de ~4B cuantizado, sirve para experimentar con pipelines de evaluación, RLHF o generación aumentada por recuperación antes de escalar a modelos mayores.
- Filtrado y clasificación de texto en inglés: su tamaño reducido y su naturaleza conversacional permiten usarlo para etiquetar, resumir o reescribir documentos en lotes pequeños en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 2,3 GB en 4 bits; en la práctica se necesita algo más de memoria para el contexto y el tokenizador, típicamente entre 3 y 5 GB según la longitud de la ventana utilizada.
- GPU recomendadas: al ser un formato MLX, está orientado a Apple Silicon (series M1, M2, M3, M4 y superiores con memoria unificada). No está pensado para GPUs NVIDIA/AMD en este formato.
- Cabe en hardware de consumo: sí, en cualquier Mac con al menos 8 GB de memoria unificada; con 16 GB o más se puede ampliar el contexto con holgura.
- Opciones de despliegue: mlx-lm (librería nativa del formato), con carga mediante `mlx_lm.load` y generación con `mlx_lm.generate`. Para otros entornos habría que usar la versión BF16 original de NVIDIA con vLLM, TGI o llama.cpp, no esta conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3-Nano-4B-4bit (esta versión) | ~4B | no disponible | nvidia-nemotron-open-model-license | MLX safetensors 4 bits | Hugging Face (goodmai / mlx-community) |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | ~4B | no disponible | nvidia-nemotron-open-model-license | safetensors BF16 | Hugging Face (NVIDIA) |
| Otros modelos ~4B open weight | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre esta versión y alternativas de tamaño similar; la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Idioma: el modelo declara únicamente inglés; su rendimiento en castellano no está garantizado y probablemente sea inferior.
- Licencia: la nvidia-nemotron-open-model-license es una licencia propia de NVIDIA con condiciones específicas; es imprescindible revisar sus términos antes de un uso comercial, ya que puede incluir restricciones de redistribución o de uso.
- Cuantización: la versión de 4 bits puede degradar ligeramente la calidad respecto al BF16 original, especialmente en tareas de razonamiento matemático o generación de código complejo.
- Plataforma: al estar en formato MLX, solo es ejecutable de forma nativa en Apple Silicon; no es portable directamente a CUDA sin reconversión.
- Alucinación: como cualquier modelo generativo, puede producir información falsa o inventar referencias; no se han publicado evaluaciones específicas de fiabilidad en la información disponible.
- Sesgos: no se documentan análisis de sesgos en la model card; los corpus web de gran escala suelen arrastrar sesgos de género, raza o ideología.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar su uso en tareas de documentos largos con garantías.
- Datos de benchmark: no hay métricas publicadas para esta conversión, por lo que no se puede comparar objetivamente con alternativas.

## Enlaces

- Hugging Face (esta versión): https://huggingface.co/goodmai/NVIDIA-Nemotron-3-Nano-4B-4bit
- Versión mlx-community referenciada: https://huggingface.co/mlx-community/NVIDIA-Nemotron-3-Nano-4B-4bit
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Librería mlx-lm: no disponible enlace directo en la información proporcionada (instalable vía `pip install mlx-lm`)
