# SinhalaMMLU-SharedTask/team-zeroShot

## Resumen

team-zeroShot es el sistema presentado por el equipo zeroShot a la tarea compartida SinhalaMMLU, un benchmark de preguntas de elección múltiple en cingalés. No es un modelo generativo: es un adaptador LoRA más una cabeza de clasificación entrenados sobre los pesos de texto de google/gemma-4-E4B-it (publicados como Lalaa-a/gemma4-8b-text-only), recortados tras la capa 24 de 42 y reutilizados como puntuador de opciones. Dado un enunciado y sus alternativas, el modelo codifica todo en una única secuencia con máscaras de atención segmentadas y asigna una puntuación a cada opción; la respuesta es la de mayor puntuación, sin muestreo ni parsing de texto.

El interés práctico es doble. Por un lado, es un ejemplo de adaptación parameter-efficient (LoRA de rango 32, 41,9 M de parámetros) sobre un backbone congelado y recortado, con un total de inferencia de aproximadamente 4,64 B de parámetros. Por otro, demuestra un patrón de evaluación determinista para lenguas de bajos recursos: el modelo no puede "escribir" una respuesta mal formateada, lo que elimina una fuente habitual de ruido en benchmarks de elección múltiple.

El sistema se entrenó con 11.689 preguntas (exámenes reales cingaleses de grados 6 a 11 y A/L, preguntas sintéticas y plantillas) y se ejecuta en una única GPU de portátil de 12 GB con unos 5-6 GB de VRAM. El repositorio incluye el script de inferencia exacto, las predicciones enviadas al leaderboard (2.238 líneas) y todo el código de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4) truncado tras la capa 24 de 42 (capa de atención completa), reutilizado como puntuador de opciones con cabeza propia de 2 capas |
| Parametros totales | ≈4,64 B en inferencia: 2,29 B (capas 0-23) + 2,28 B (tablas de embedding recortadas a 24 capas) + 41,9 M (LoRA) + 18,4 M (cabeza de elección) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; la ejecución de referencia usa bfloat16 (sin cuantización) |
| Idiomas soportados | cingalés (si); el resto de idiomas del modelo base no se declaran |
| Licencia | gemma |
| Formato de pesos | adaptador LoRA (`lora/`), cabeza (`head.pt`) y `meta.json` en el repositorio del adaptador; el modelo base (~15 GB) se descarga por separado; el formato exacto de los tensores del adaptador no está documentado |
| Modelo base | Lalaa-a/gemma4-8b-text-only (pesos de texto de google/gemma-4-E4B-it, sin torres de visión ni audio) |
| Tarea | elección múltiple (pipeline `multiple-choice`), puntuación de opciones |
| Repositorio | 0,1 GB; 0 descargas y 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 (decoder-only) y lo corta después de la capa 24, que es una capa de atención completa. Sobre las 24 capas conservadas se aplica LoRA de rango 32, alpha 64 y dropout 0 en todas las proyecciones de atención (q/k/v/o) y de MLP (gate/up/down), 168 módulos en total. La pregunta y cada una de sus opciones se serializan en una sola secuencia con máscaras de atención segmentadas; una cabeza de 2 capas transformer de anchura 512 lee el estado oculto en el marcador de fin de cada opción y produce su puntuación. La inferencia es determinista en modo eval, sin muestreo y con semilla fija, de modo que la respuesta es siempre el argmax de las puntuaciones. El checkpoint final corresponde al paso 876 de 1.460 de un entrenamiento configurado en `training/configs/laptop_lora_all24_r32_v8_final.yaml`.

El conjunto de entrenamiento tiene 11.689 preguntas y combina fuentes reales y sintéticas: 1.702 preguntas de exámenes pasados (grados 6-8), 2.128 de exámenes reales de 2025 (grados 6-11 y A/L), 1.408 de exámenes A/L 2022-2025, 307 de O/L 2020-2024, 41 extra de historia de grado 6, 4.116 sintéticas (generadas con explicaciones) y 1.987 de plantillas filtradas. No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del corpus del backbone ni si hubo fases de RLHF o DPO; el ajuste descrito es exclusivamente supervisado sobre la tarea de puntuación.

## Capacidades

- Puntuación de opciones en preguntas de elección múltiple en cingalés: devuelve el índice de la opción con mayor puntuación.
- Evaluación determinista: sin muestreo, sin parsing de texto y con resultados reproducibles entre ejecuciones.
- Cobertura de materias y niveles del currículo cingalés (grados 6-11 y A/L) según la distribución de los datos de entrenamiento.
- Adaptación parameter-efficient: solo se entrenan 41,9 M de parámetros LoRA más 18,4 M de la cabeza sobre un backbone congelado.
- Ejecución en hardware de gama consumer: 5-6 GB de VRAM con las tablas de lookup en RAM de CPU.
- No soporta generación de texto libre, tool calling, function calling, uso como agente, razonamiento multi-paso explícito, visión ni audio.
- No implementa modo "thinking" ni cadena de pensamiento: la decisión es una puntuación directa por opción.

## Casos de uso

- Evaluación de LLM en cingalés: sirve como referencia reproducible (baseline) para medir modelos generativos en SinhalaMMLU, ya que su salida es determinista y no depende de prompts de formato.
- Investigación en adaptación param-efficient: permite reproducir un experimento completo de LoRA sobre un backbone recortado, con código, datos y predicciones publicados en el mismo repositorio.
- Validación de bancos de preguntas educativos: dado un banco de ítems con clave de respuesta, el modelo puede señalar ítems donde su predicción discrepa de la clave, lo que ayuda a detectar erratas o ambigüedades en el material.
- Calibración de dificultad de exámenes: las puntuaciones por opción permiten ordenar ítems por dificultad estimada y construir formas de test equilibradas para convocatorias.
- Analítica curricular: procesar exámenes por asignatura y grado para identificar áreas donde un modelo de lenguaje falla sistemáticamente, orientando la recogida de datos adicionales.
- Filtrado previo en pipelines de anotación: usar el modelo como preetiquetador de preguntas de elección múltiple en cingalés, dejando la revisión humana solo para los ítems de baja confianza.
- Despliegue en estaciones de trabajo modestas: al caber en 5-6 GB de VRAM, puede ejecutarse en local para tareas de evaluación por lotes sin depender de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye `predictions.jsonl` con las 2.238 predicciones enviadas al leaderboard de Codabench, pero la información proporcionada no contiene las puntuaciones obtenidas ni comparaciones con otros sistemas de la tarea compartida.

## Requisitos de hardware

- VRAM: aproximadamente 5-6 GB en bfloat16, manteniendo las tablas de lookup de tokens en RAM de CPU.
- RAM de CPU: unos 16 GB durante la carga, porque se lee el checkpoint completo (~15 GB) antes de descartar las capas posteriores a la 24; el equipo de referencia tenía 23 GB disponibles.
- GPU utilizada por los autores: 1× NVIDIA RTX 4080 Laptop (12 GB), CUDA, bfloat16.
- GPU recomendadas: cualquier GPU con soporte nativo de bfloat16 (Ampere o posterior: A100, L4, A10, RTX 30xx/40xx). Las Turing (T4) no tienen bfloat16 nativo y no fueron probadas.
- Rendimiento observado: unos 5 minutos para 2.238 preguntas, es decir, del orden de 7,5 preguntas por segundo en una RTX 4080 Laptop, incluyendo la descarga de ~15 GB.
- Opciones de despliegue: únicamente el script `inference.py` del repositorio con el código de `src/` (modelo, dataset, tokenización, logger). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ni existen pesos GGUF publicados.
- Requisitos de software: Python 3.10.12 y las versiones fijadas en `requirements.txt`.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SinhalaMMLU-SharedTask/team-zeroShot | Puntuador de opciones (LoRA + cabeza sobre Gemma 4 recortado) | ≈4,64 B en inferencia | no disponible | si | gemma | Público en HuggingFace, código y predicciones incluidos |
| Lalaa-a/gemma4-8b-text-only | Modelo generativo decoder-only (Gemma 4 sin torres de visión/audio) | no disponible (la nomenclatura del nombre sugiere ~8 B) | no disponible | no disponible | gemma | Público en HuggingFace |
| google/gemma-4-E4B-it | Modelo generativo multimodal instruido (visión y audio incluidos) | no disponible (la nomenclatura E4B sugiere ~4 B efectivos) | no disponible | no disponible | gemma | Público en HuggingFace |

No se dispone de datos sobre otros sistemas presentados a la misma tarea compartida, por lo que no es posible una comparación de rendimiento entre participantes.

## Limitaciones y advertencias

- No es un modelo de propósito general: no genera texto, no responde preguntas abiertas, no admite instrucciones libres ni conversación multi-turno.
- No puede abstenerse: siempre devuelve una de las opciones disponibles, por lo que un error se presenta con la misma apariencia que un acierto. No hay señal de calibración publicada.
- Cobertura lingüística limitada al cingalés según la model card; no se documenta comportamiento en otros idiomas.
- Los datos de entrenamiento son mayoritariamente exámenes escolares de Sri Lanka (grados 6-11 y A/L) más 4.116 preguntas sintéticas y 1.987 de plantillas; el sesgo hacia ese formato y ese currículo puede degradar el rendimiento fuera de él.
- El uso de datos sintéticos y de plantillas puede introducir artefactos de distribución que infles artificialmente ciertos patrones de respuesta; no se publica un análisis de ablación al respecto.
- No hay resultados de benchmarks ni evaluación de sesgos en la información disponible, por lo que no es posible cuantificar su calidad frente a alternativas.
- La licencia Gemma impone restricciones de uso (política de usos prohibidos) y obligaciones de atribución; no es una licencia de código abierto aprobada por la OSI. Conviene revisar los términos antes de cualquier despliegue comercial.
- Dependencia de un pipeline de código propio: no hay integración con servidores de inferencia estándar, lo que complica el despliegue en producción y el escalado horizontal.
- La carga requiere ~15 GB de checkpoint en disco y ~16 GB de RAM antes de recortar el modelo; en máquinas con menos memoria el script puede fallar aunque la inferencia quepa en 5-6 GB de VRAM.
- El checkpoint publicado corresponde al paso 876 de 1.460, no al final del entrenamiento planificado; no se documenta el motivo ni el impacto en la calidad.

## Enlaces

- Repositorio principal (código, inferencia, predicciones y datos): https://huggingface.co/SinhalaMMLU-SharedTask/team-zeroShot
- Repositorio del adaptador LoRA, cabeza y metadatos: https://huggingface.co/SinhalaMMLU-SharedTask/team-zeroShot-gemma4-lora
- Modelo base utilizado: https://huggingface.co/Lalaa-a/gemma4-8b-text-only
- Modelo original de Google: https://huggingface.co/google/gemma-4-E4B-it
- Documentación de arquitectura del repositorio: `ARCHITECTURE.md` (incluido en el repositorio principal)
- Leaderboard de la tarea compartida en Codabench: URL no disponible en la información proporcionada
