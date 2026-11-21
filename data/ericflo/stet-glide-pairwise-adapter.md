# ericflo/stet-glide-pairwise-adapter

## Resumen

Stet GLiDE Pairwise Adapter es un adaptador LoRA de rango 8 acompañado de una cabeza de decisión, construido sobre el modelo base fastino/GLiDE-0.4B. Lo desarrolla el usuario ericflo y su función es puntuar el valor educativo y la forma documental de pasajes web extraídos de corpus de curación de datos. Los resultados se emplean para seleccionar sustituciones de prosa emparejadas, ordenar currículos por pares y aplicar replay selectivo dentro del sistema Stet.

El adaptador parte de un ajuste fino previo orientado a calidad y forma documental sobre GLiDE-0.4B (revisión `6bda7ab91aeb36dcad6d27828a8871e548c7fc71`). Una segunda etapa incorpora un objetivo pairwise sobre extractos del mismo dataset de origen, idioma y forma documental, intercalando ejemplos originales muestreados aleatoriamente. Según la model card, la incorporación del objetivo pairwise elevó la concordancia en pares históricos reservados del 76,95 % al 79,05 %.

Se trata de un artefacto muy especializado: no es un modelo generativo de propósito general, sino un componente de scoring para pipelines de curación de datos. Su relevancia radica en que permite filtrar y ordenar documentos por calidad educativa de forma automática, una tarea crítica en la construcción de datasets de entrenamiento y en la selección de contenido web para modelos fundacionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA de rango 8 sobre encoder transformer (base fastino/GLiDE-0.4B) más cabeza de decisión |
| Parámetros totales | No disponible (adaptador LoRA de rango 8 sobre un modelo base de 0,4B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | fastino-community (licencia de la familia Fastino, etiquetada como "other") |
| Formato de pesos | safetensors (adaptador en `adapter/` y cabeza en `lora-head.safetensors`); librería PEFT |

## Arquitectura y entrenamiento

El adaptador se compone de un LoRA de rango 8 aplicado sobre el encoder de GLiDE-0.4B, un modelo base de aproximadamente 0,4 mil millones de parámetros, más una cabeza de decisión separada que implementa el sistema Stet con su propio pooling. La carga se realiza con `transformers.AutoModel` sobre el encoder base, aplicando después el adaptador y cargando la cabeza desde `lora-head.safetensors`.

El entrenamiento se organiza en dos etapas. La primera parte de un ajuste fino de calidad y forma documental sobre GLiDE-0.4B en la revisión indicada. La segunda añade un objetivo pairwise sobre extractos del mismo dataset de origen, idioma y forma documental, con ejemplos originales intercalados aleatoriamente. Los datos de entrenamiento provienen de FineWeb-Edu y FineWeb-C históricos, OpenWebMath, documentación pública de Python y discusiones archivadas, además de ejemplos de navegación redactados por el autor. Los exámenes de Stet se reservaron únicamente para la evaluación del curador, no para entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Puntuación de valor educativo de pasajes web, orientada a la curación de datasets.
- Puntuación de forma documental (estructura y presentación del texto).
- Ranking pairwise: compara dos extractos y determina cuál es preferible según el objetivo entrenado.
- Selección de sustituciones de prosa emparejadas para reemplazar contenido de baja calidad.
- Soporte de replay selectivo dentro del pipeline Stet.
- Evaluación de concordancia en pares reservados (79,05 % tras el entrenamiento pairwise).
- No se documentan capacidades de generación de texto, código, matemáticas, visión, tool calling, agentes ni multilingüismo; el artefacto es un modelo de decisión, no un generador.

## Casos de uso

- Curación de datasets de preentrenamiento: el adaptador puntúa pasajes de corpus web como FineWeb-Edu y permite filtrar o priorizar contenido con mayor valor educativo antes de incorporarlo a un dataset de entrenamiento.
- Construcción de currículos de datos: mediante el ranking pairwise, se pueden ordenar extractos de mayor a menor calidad para diseñar secuencias de entrenamiento progresivas.
- Sustitución de prosa de baja calidad: el modelo identifica pasajes candidatos a reemplazo y apoya la selección de sustituciones emparejadas dentro del mismo idioma y forma documental.
- Replay selectivo en pipelines Stet: permite reintroducir ejemplos de alta calidad en fases posteriores del entrenamiento para reforzar el comportamiento deseado.
- Filtrado de documentación técnica: con datos de documentación pública de Python en el entrenamiento, puede puntuar pasajes técnicos y decidir su idoneidad para corpus de código y documentación.
- Evaluación de calidad en la ingesta de contenido: integrado en un pipeline de datos, permite descartar páginas de navegación o contenido redundante antes de almacenarlas.
- Investigación sobre modelos de decisión pequeños: sirve como referencia para estudiar cómo un adaptador de rango 8 sobre un modelo de 0,4B puede aproximar juicios de calidad con concordancia cercana al 79 % en pares reservados.

## Benchmarks y rendimiento

| Métrica | Antes del objetivo pairwise | Después del objetivo pairwise |
|---|---|---|
| Concordancia en pares históricos reservados | 76,95 % | 79,05 % |

La model card indica que las métricas completas, incluida la correlación de calidad pointwise inferior tras el entrenamiento pairwise, están en `model-info.json`. No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador sobre un modelo base de 0,4B, la huella es reducida y probablemente cabe en GPUs de consumo, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; el tamaño del modelo base (0,4B) sugiere que sería viable en tarjetas consumer, pero no se aportan datos.
- Opciones de despliegue: carga mediante `transformers.AutoModel` y PEFT; la cabeza de decisión requiere la implementación del curador Stet para su pooling. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (scoring de calidad documental o adaptadores de curación de datos) con parámetros, contexto, rendimiento y licencia verificables.

## Limitaciones y advertencias

- El artefacto es un adaptador de decisión, no un modelo generativo; no debe esperarse que produzca texto, código ni respuestas conversacionales.
- La correlación de calidad pointwise empeoró tras el entrenamiento pairwise, según reconoce la propia model card; conviene revisar `model-info.json` antes de usarlo en tareas pointwise.
- El rendimiento se ha medido únicamente en pares históricos reservados del mismo dominio; la generalización a otros idiomas, dominios o formas documentales no está documentada.
- No se especifican los idiomas soportados, lo que impide garantizar un comportamiento adecuado fuera de los corpus de entrenamiento.
- La licencia es fastino-community (etiquetada como "other"); es imprescindible revisar los términos exactos del archivo `LICENSE` antes de cualquier uso comercial.
- Riesgo de sesgo heredado de los corpus de origen (FineWeb-Edu, FineWeb-C, OpenWebMath, documentación de Python) y de los ejemplos de navegación redactados por el autor.
- No se documentan evaluaciones de robustez frente a texto adversarial, spam o contenido manipulado.
- El repositorio no registra descargas ni likes y el tamaño indicado es de 0,0 GB, por lo que la reproducibilidad y el soporte de la comunidad son limitados.

## Enlaces

- Hugging Face: https://huggingface.co/ericflo/stet-glide-pairwise-adapter
- Modelo base: https://huggingface.co/fastino/GLiDE-0.4B
- Revisión del modelo base: `6bda7ab91aeb36dcad6d27828a8871e548c7fc71`
- Métricas completas: `model-info.json` (incluido en el repositorio)
- Licencia: `LICENSE` (incluido en el repositorio)
