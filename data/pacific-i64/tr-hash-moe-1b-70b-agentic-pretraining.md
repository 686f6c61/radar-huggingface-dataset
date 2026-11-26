# Pacific-i64/TR-HASH-MoE-1B-70B-Agentic-Pretraining

## Resumen

TR-HASH-MoE-1B-70B-Agentic-Pretraining es un modelo de lenguaje en fase de preentrenamiento publicado por el usuario Pacific-i64 en Hugging Face. Se trata de un transformer con arquitectura de mezcla de expertos (MoE) de aproximadamente 1.010 millones de parámetros totales, con 8 expertos enrutados y activación top-2, además de una rama compartida (_shared branch_). El objetivo declarado de entrenamiento es de unos 70.000 millones de tokens, de ahí el sufijo "70B" del nombre, que no debe confundirse con el tamaño del modelo.

El modelo se distribuye como checkpoints intermedios de preentrenamiento, no como pesos consolidados de inferencia. El repositorio contiene el estado distribuido del modelo y del optimizador, con un tamaño de 656,8 GB, lo que refleja la presencia de múltiples snapshots (hasta cuatro: los tres checkpoints regulares más recientes y el último checkpoint de interrupción). El fichero `latest.json` identifica el checkpoint verificado y reanudable más reciente, y el historial antiguo se purga automáticamente.

Es relevante ahora porque documenta una receta de preentrenamiento MoE de escala pequeña orientada a cargas agénticas, con contexto de 16K tokens y un tokenizador de 32K entradas. No obstante, al no estar consolidado ni ajustado por instrucciones, no es directamente utilizable como modelo de producción: su interés es principalmente para investigación sobre arquitecturas MoE, reanudación de entrenamiento y preparación de modelos base para posteriores fases de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE): 8 expertos enrutados, activación top-2, rama compartida (_shared branch_) |
| Parametros totales | 1,01B (aproximadamente 1.010 millones) |
| Parametros activos | No disponible (top-2 sobre 8 expertos enrutados más rama compartida; el número exacto de parámetros activos no se especifica) |
| Longitud de contexto | 16K tokens |
| Tipos de cuantizacion | No disponible (solo se publican checkpoints de preentrenamiento en estado distribuido; no hay pesos consolidados ni GGUF) |
| Idiomas soportados | Inglés (en) y francés (fr) |
| Licencia | other (licencia personalizada; condiciones no detalladas en la información disponible) |
| Formato de pesos | Estado distribuido de modelo y optimizador (checkpoints de entrenamiento); pesos de inferencia consolidados pendientes de publicación en la raíz del repositorio |
| Tokenizador | 32K entradas |
| Libreria | complexity |
| Tamano del repositorio | 656,8 GB |
| Estado | Preentrenamiento en curso; no es un modelo ajustado por instrucciones |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos. El modelo cuenta con 8 expertos enrutados con activación top-2, es decir, cada token activa dos de los ocho expertos, y además una rama compartida que procesa todos los tokens con independencia del enrutamiento. Esta combinación de expertos enrutados más una rama densa compartida es una variante habitual para estabilizar el entrenamiento MoE y garantizar una ruta de gradiente común. El contexto es de 16K tokens y el tokenizador tiene 32K entradas.

El entrenamiento se declara en curso, con un objetivo de aproximadamente 70.000 millones de tokens. No se detalla en la información disponible la composición del dataset, la proporción de datos por idioma (inglés y francés), ni si se aplican fases de RLHF, DPO u otras técnicas de alineación; de hecho, el autor indica explícitamente que no es un modelo ajustado por instrucciones. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal.

El repositorio está diseñado para reanudación de entrenamiento: `latest.json` apunta al checkpoint verificado y reanudable más reciente, y se conservan como máximo cuatro snapshots (tres regulares y el último de interrupción). Los checkpoints incluyen estado distribuido de modelo y optimizador, lo que explica el tamaño de 656,8 GB. Los pesos consolidados para inferencia se publicarán en la raíz del repositorio una vez finalice el entrenamiento. La receta de entrenamiento y reanudación está documentada en `training/README.md`.

## Capacidades

- Generación de texto autoregresiva como modelo base de lenguaje, sin ajuste por instrucciones.
- Razonamiento y generación condicionada por prompt únicamente en la medida en que lo permita un modelo en fase de preentrenamiento; no se garantiza seguimiento de instrucciones.
- Capacidad multilingüe limitada a inglés y francés según los metadatos del modelo.
- Procesamiento de contextos de hasta 16K tokens.
- Enrutamiento condicional por token mediante top-2 sobre 8 expertos, lo que en teoría reduce el coste de cómputo por token respecto a un modelo denso del mismo tamaño total.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).
- No se documenta una plantilla de chat ni formato conversacional específico más allá de la etiqueta `conversational` del repositorio.

## Casos de uso

- Investigación sobre arquitecturas MoE: el modelo sirve para estudiar el comportamiento de un MoE pequeño con 8 expertos, top-2 y rama compartida, analizando distribución de carga entre expertos y estabilidad del enrutamiento durante el preentrenamiento.
- Reanudación y depuración de entrenamientos distribuidos: los checkpoints con estado de modelo y optimizador, junto con `latest.json` y la receta de `training/README.md`, permiten reproducir y reanudar el entrenamiento en un clúster, lo que es útil para equipos que investigan tolerancia a fallos en pipelines de entrenamiento.
- Base para ajuste supervisado posterior (SFT): al ser un modelo base de 1,01B con contexto de 16K, puede servir como punto de partida para fine-tuning en tareas de inglés o francés una vez consolidados los pesos.
- Experimentos de eficiencia computacional: comparar el coste por token de un MoE top-2 frente a un modelo denso de tamaño similar en tareas de generación de texto, midiendo throughput y uso de memoria en GPUs de gama alta.
- Evaluación de tokenizadores de 32K entradas: analizar el impacto del vocabulario en la compresión de texto en inglés y francés y en el coste de secuencias largas de hasta 16K tokens.
- Estudio de modelos base en cargas agénticas: el nombre del repositorio hace referencia a preentrenamiento agéntico, por lo que puede emplearse para analizar qué capacidades emergen en un modelo base antes de cualquier ajuste por instrucciones o tool calling.
- Docencia y experimentación en entornos académicos: por su tamaño relativamente contenido (1,01B parámetros totales) y su naturaleza de checkpoint intermedio, es adecuado para prácticas sobre entrenamiento y evaluación de MoE, siempre que se disponga de los recursos de almacenamiento necesarios (656,8 GB de repositorio).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no haberse publicado pesos consolidados de inferencia, no puede estimarse con rigor el consumo de VRAM. Como referencia teórica, un modelo de 1,01B parámetros en FP16 requeriría aproximadamente 2 GB solo para pesos, pero la arquitectura MoE, el contexto de 16K y el estado de entrenamiento (modelo más optimizador) elevan sustancialmente los requisitos reales del repositorio.
- Almacenamiento: el repositorio ocupa 656,8 GB, por lo que se necesita espacio en disco de ese orden para descargar los checkpoints completos.
- GPU recomendadas: no disponible. Para el entrenamiento o la reanudación se requeriría un entorno distribuido multi-GPU; no se especifican modelos concretos (A100, H100, RTX 4090 u otros).
- ¿Cabe en GPU de consumo? No puede confirmarse: no hay pesos de inferencia consolidados ni cuantizaciones publicadas. Un modelo de 1,01B en FP16 cabría teóricamente en GPUs de consumo con 8 GB o más, pero el contexto de 16K y el formato de checkpoint distribuido impiden garantizarlo.
- Opciones de despliegue: no disponible. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros motores de inferencia. La librería declarada es `complexity` con código personalizado (`custom_code`), lo que probablemente requiere cargar el código del repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Arquitectura | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| TR-HASH-MoE-1B-70B-Agentic-Pretraining | 1,01B | MoE, 8 expertos, top-2, rama compartida | 16K | other | Preentrenamiento en curso; sin pesos de inferencia consolidados |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (MoE de aproximadamente 1B parámetros con contexto de 16K) en la información proporcionada, por lo que no se puede establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Modelo en fase de preentrenamiento: no está ajustado por instrucciones, por lo que no debe esperarse un seguimiento fiable de instrucciones ni un formato conversacional estable.
- Pesos de inferencia no publicados: los checkpoints contienen estado distribuido de modelo y optimizador; los pesos consolidados para inferencia se publicarán solo al finalizar el entrenamiento.
- Licencia "other": las condiciones exactas de uso, incluido el uso comercial, no están detalladas en la información disponible y deben consultarse en el repositorio antes de cualquier despliegue.
- Idiomas limitados a inglés y francés según los metadatos; no se documenta soporte de castellano ni de otros idiomas.
- Riesgo de alucinación: inherente a un modelo base de 1,01B parámetros sin alineación; no se han publicado evaluaciones de fidelidad.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluación de sesgos ni de seguridad.
- Sin datos de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni otras evaluaciones, lo que impide valorar su calidad objetiva.
- Contexto limitado a 16K tokens: insuficiente para muchos escenarios de documentos largos o conversaciones extensas en producción.
- Requisitos de almacenamiento elevados: 656,8 GB de repositorio para los checkpoints, con purga automática del historial antiguo, lo que implica que versiones anteriores pueden desaparecer.
- Dependencia de código personalizado: la librería `complexity` y el tag `custom_code` sugieren que la carga del modelo requiere código específico del repositorio, con el riesgo de compatibilidad que ello conlleva.
- Fecha de creación y actualización futuras (2026): los metadatos indican fechas posteriores a la fecha actual habitual de consulta, lo que debe tenerse en cuenta al evaluar la madurez del proyecto.

## Enlaces

- Hugging Face: https://huggingface.co/Pacific-i64/TR-HASH-MoE-1B-70B-Agentic-Pretraining
- Receta de entrenamiento y reanudación: https://huggingface.co/Pacific-i64/TR-HASH-MoE-1B-70B-Agentic-Pretraining/blob/main/training/README.md
- Fichero de checkpoint más reciente: https://huggingface.co/Pacific-i64/TR-HASH-MoE-1B-70B-Agentic-Pretraining/blob/main/latest.json
