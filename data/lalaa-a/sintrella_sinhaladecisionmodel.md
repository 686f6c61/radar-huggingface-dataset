# Lalaa-a/sintrella_sinhalaDecisionModel

## Resumen

Sintrella Sinhala Decision Model es un ajuste fino (LoRA) del modelo base `google/gemma-4-E4B-it`, desarrollado por el equipo zeroShot (Lalinda Ravishan, Viman Fernando, Warusha Shamalka y Chamudu Hansana) para la tarea compartida Sinhala MMLU. No es un modelo generativo de texto en el sentido convencional: se ha reconvertido en un *scorer* de opciones de respuesta, de modo que recibe una pregunta con sus alternativas y devuelve la opción con mayor puntuación, sin muestreo ni parseo de texto.

Técnicamente, el modelo parte de los pesos de texto del Gemma 4 original (sin las torres de visión y audio) y se trunca tras la capa decodificadora 24, conservando 24 de las 42 capas. Sobre esa base se aplica LoRA de rango 32 en todas las proyecciones de atención y MLP de las capas conservadas, más una cabeza transformer de 2 capas y anchura 512 que lee el marcador de fin de cada opción. El total de parámetros en inferencia es de aproximadamente 4,64 mil millones.

Su relevancia es acotada pero concreta: demuestra cómo adaptar un modelo grande multilingüe a una tarea de evaluación de opción múltiple en cingalés (sinhala) con recursos limitados, usando una única GPU de consumo (RTX 4080 Laptop de 12 GB) y unos 5-6 GB de VRAM en inferencia. El repositorio es pequeño (0,3 GB) porque solo contiene el adaptador y la cabeza, no los pesos completos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 4) truncado tras la capa 24 de 42, con LoRA y cabeza de elección de 2 capas |
| Parametros totales | ≈ 4,64 B en inferencia (4,58 B del Gemma truncado + 41,9 M de LoRA + 18,4 M de la cabeza) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (único formato documentado); no se mencionan GGUF, int8 ni int4 |
| Idiomas soportados | cingalés (si) |
| Licencia | Gemma |
| Formato de pesos | safetensors (adaptador LoRA) + `head.pt` (cabeza); requiere descargar el modelo base por separado |

## Arquitectura y entrenamiento

El modelo no genera texto: puntúa opciones. Cada pregunta se serializa en una única secuencia que incluye el enunciado y todas las alternativas, con máscaras de atención segmentadas para que cada opción se atienda de forma controlada. Gemma 4 se corta después de la capa 24 (una capa de atención completa), y una cabeza transformer de 2 capas y anchura 512 lee el estado oculto en el marcador de fin de cada opción para producir una puntuación. La respuesta final es la opción con mayor puntuación, lo que elimina el muestreo y el parseo de texto y hace la inferencia determinista.

El entrenamiento consistió en LoRA de rango 32, alpha 64, dropout 0, aplicado a 168 módulos (proyecciones q/k/v/o y gate/up/down de las capas 0-23). El conjunto de entrenamiento final tiene 11.689 preguntas: 1.702 de exámenes pasados reales (grados 6-8), 2.128 de exámenes reales de 2025 (grados 6-11 y A/L), 1.408 de exámenes A/L reales (2022-2025), 307 de O/L (grado 11) de 2020-2024, 41 de historia de grado 6, 4.116 sintéticas y 1.987 de plantilla filtradas. El checkpoint final corresponde al paso 876 de 1.460. No se documenta uso de RLHF ni DPO.

## Capacidades

- Clasificación de opción múltiple en cingalés: selecciona la respuesta correcta entre las alternativas de una pregunta tipo MMLU.
- Puntuación determinista de opciones: sin muestreo, con semilla fija; las ejecuciones repetidas dan las mismas respuestas.
- Procesamiento de preguntas de distintos niveles educativos (grados 6-11 y A/L) y asignaturas variadas.
- No soporta generación de texto libre, tool calling, function calling, agentes, razonamiento multi-paso ni visión/audio (las torres correspondientes se eliminaron del modelo base).
- Capacidad multilingüe limitada al cingalés en la práctica, aunque el modelo base Gemma 4 es multilingüe.

## Casos de uso

- Evaluación automática de exámenes tipo test en cingalés: el modelo puntúa cada opción y devuelve la de mayor score, adecuado para corregir pruebas de MMLU sinhala de forma determinista y reproducible.
- Investigación en adaptación de modelos grandes a lenguas de bajos recursos: sirve como referencia de cómo un LoRA de rango 32 sobre 24 capas permite ajustar Gemma 4 a una tarea concreta con una GPU de 12 GB.
- Construcción de pipelines de evaluación de benchmarks: dado que la salida es un JSONL de predicciones y el script es determinista, se puede integrar en flujos de evaluación tipo Codabench o leaderboards.
- Prototipado de sistemas de tutoría educativa: para preguntas de opción múltiple de grados 6-11, el modelo puede señalar la respuesta correcta y servir de base para sistemas de práctica.
- Reproducción de experimentos académicos: el repositorio incluye código de entrenamiento, datos y configuración, lo que permite replicar el ajuste y comparar variantes (número de capas, rango LoRA).
- Despliegue en hardware de consumo: con 5-6 GB de VRAM en bfloat16 sobre una RTX 4080 Laptop, es viable ejecutarlo en estaciones de trabajo modestas para tareas de scoring por lotes (unas 2.238 preguntas en unos 5 minutos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 5-6 GB en bfloat16; las tablas de búsqueda de tokens permanecen en RAM de CPU.
- RAM de CPU: unos 16 GB durante la carga (se lee el checkpoint completo de 15 GB antes de descartar las capas posteriores a la 24); se usó una máquina con 23 GB disponibles.
- GPU recomendadas: una RTX 4080 Laptop (12 GB) fue la empleada; se recomienda cualquier GPU con soporte nativo de bfloat16 (Ampere o posterior: A100, L4, A10, RTX 30xx/40xx). Las Turing (T4) no tienen bfloat16 nativo y no se probaron.
- Cabe en GPU de consumo: sí, en RTX 30xx/40xx con al menos 6 GB de VRAM.
- Opciones de despliegue: el repositorio proporciona `inference.py` con `requirements.txt` (Python 3.10.12); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 5 minutos para 2.238 preguntas tras descargar los ~15 GB del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sintrella Sinhala Decision Model | ≈ 4,64 B en inferencia | no disponible | Scoring de opción múltiple en cingalés | Gemma | Hugging Face (adaptador + cabeza) |
| google/gemma-4-E4B-it | no disponible | no disponible | Generación multimodal (texto, visión, audio) | Gemma | Hugging Face |
| Lalaa-a/gemma4-8b-text-only | no disponible | no disponible | Generación de texto (Gemma 4 sin torres de visión/audio) | Gemma | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto: solo puntúa opciones, por lo que no sirve para tareas generativas, de razonamiento abierto ni de diálogo.
- Entrenado exclusivamente para cingalés y para preguntas de opción múltiple de niveles educativos concretos (grados 6-11 y A/L); el rendimiento fuera de ese dominio es desconocido.
- Riesgo de alucinación no aplica en el sentido habitual (no genera texto), pero sí puede seleccionar opciones incorrectas en preguntas fuera de la distribución de entrenamiento.
- La licencia Gemma impone restricciones de uso comercial; es necesario revisar los términos de la licencia Gemma antes de cualquier despliegue en producción.
- Requiere descargar el modelo base `google/gemma-4-E4B-it` (~15 GB) además del adaptador; el repositorio de 0,3 GB no es autosuficiente.
- No se documentan sesgos específicos, pero al entrenarse con exámenes reales y datos sintéticos de Sri Lanka puede heredar sesgos de esos materiales.
- No se han publicado benchmarks ni métricas de precisión en la información disponible, lo que impide evaluar su calidad objetiva frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lalaa-a/sintrella_sinhalaDecisionModel
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Modelo base sin torres de visión/audio: https://huggingface.co/Lalaa-a/gemma4-8b-text-only
- Repositorio del equipo (código, datos, predicciones): https://huggingface.co/SinhalaMMLU-SharedTask/team-zeroShot
- Adaptador LoRA y cabeza: https://huggingface.co/SinhalaMMLU-SharedTask/team-zeroShot-gemma4-lora
