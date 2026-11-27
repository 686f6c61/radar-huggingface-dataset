# IITM-2026T3-DSAI-GROUP2/final-socratic-llm

## Resumen

Final Socratic LLM es un adaptador LoRA de 16 bits entrenado sobre el modelo base `unsloth/Qwen3.5-4B`, desarrollado por el grupo IITM-2026T3-DSAI-GROUP2 en el marco del programa IITM 2026 T3 DSAI. El modelo está especializado en tutoría socrática, es decir, en guiar al estudiante mediante preguntas y diálogo reflexivo en lugar de proporcionar respuestas directas. Se distribuye como adaptador PEFT (no como pesos completos), por lo que requiere cargar el modelo base para su uso.

El adaptador se ha entrenado sobre una mezcla de 30.245 diálogos (20.085.947 tokens) que combina datasets de tutoría socrática (`socrateach`), material sintético alineado con el currículo NCERT indio (`ncert_tutor_synthetic`), currículo K-12 indio (`k12_indian_curriculum`), diálogos matemáticos (`mathdial`) y aumentación de datos (`demand_aug`). El resultado es un modelo orientado a educación, con especial énfasis en el contexto curricular indio y en el razonamiento matemático guiado.

Su relevancia radica en ser un ejemplo de ajuste fino eficiente (LoRA con `r=32`) sobre un modelo de 4B de parámetros, con licencia Apache 2.0 y un tamaño de repositorio de solo 0,3 GB, lo que facilita su despliegue en entornos con recursos limitados. No obstante, la información pública disponible es escasa: no se han publicado benchmarks, idiomas soportados ni detalles sobre el modelo base más allá de su identificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base `unsloth/Qwen3.5-4B`) con adaptador LoRA |
| Parametros totales | No disponible para el modelo base; adaptador LoRA con 64.929.792 parámetros entrenables (259,8 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usó `max_len=2048`) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT: `adapter_model.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) con `r=32` y `lora_alpha=32`, entrenado en precisión de 16 bits sobre el modelo base `unsloth/Qwen3.5-4B` (revisión `3764fa359b9082ea5a1e4a5e3ac3aaf6e9671636`). El adaptador añade 64.929.792 parámetros entrenables, lo que supone un 259,8 MB en disco. La arquitectura subyacente es la del modelo Qwen3.5-4B, un transformer decoder-only, aunque no se detallan en la información disponible las características internas de dicho modelo base (atención, número de capas, etc.).

El entrenamiento se realizó durante 1.891 pasos (1 época) con un batch efectivo de 16, tasa de aprendizaje `1e-4` y longitud máxima de secuencia de 2048 tokens. El dataset combinó cinco fuentes: `socrateach` (22.571 diálogos), `ncert_tutor_synthetic` (3.372), `k12_indian_curriculum` (2.500), `mathdial` (1.302) y `demand_aug` (500). La mejor pérdida de validación fue 1,1049, seleccionada sobre 150 diálogos de validación en el checkpoint-1891. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación adicionales.

## Capacidades

- Generación de texto conversacional orientada a tutoría socrática: guía al estudiante mediante preguntas en lugar de dar respuestas directas.
- Razonamiento matemático guiado, apoyado por el dataset `mathdial`.
- Cobertura del currículo educativo indio (NCERT y K-12), gracias a los datasets `ncert_tutor_synthetic` y `k12_indian_curriculum`.
- Diálogo multi-turno en contextos educativos (el entrenamiento usó secuencias de hasta 2048 tokens).
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita.
- Modo "thinking", visión o audio: no disponible.

## Casos de uso

- Tutoría socrática automatizada: el adaptador está entrenado específicamente para formular preguntas guía y fomentar la reflexión del estudiante en lugar de resolver el problema directamente, lo que lo hace adecuado para plataformas de aprendizaje activo.
- Apoyo a estudiantes de matemáticas: gracias al dataset `mathdial`, puede acompañar la resolución de problemas paso a paso, pidiendo al alumno que justifique cada operación.
- Refuerzo del currículo NCERT: útil para desplegar un asistente alineado con el temario escolar indio, con diálogos adaptados a los contenidos de `ncert_tutor_synthetic` y `k12_indian_curriculum`.
- Prototipado rápido de asistentes educativos: al ser un adaptador de 0,3 GB sobre un modelo de 4B, permite iterar y desplegar en entornos con GPU de gama media sin reentrenar desde cero.
- Investigación en diálogo educativo: sirve como punto de partida para estudiar técnicas de tutoría socrática y comparar con otros enfoques de ajuste fino.
- Generación de material didáctico conversacional: puede producir diálogos de ejemplo o preguntas de práctica para profesores que quieran preparar sesiones socráticas.
- Evaluación de técnicas LoRA en educación: el repositorio incluye curvas de pérdida y tablas de comprobación de fugas (`2_1_leakage_checks.csv`), útil para reproducir o auditar el proceso de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, un modelo base de 4B en 16 bits requiere aproximadamente 8 GB de VRAM solo para los pesos, más memoria para el contexto y el adaptador (259,8 MB adicionales).
- GPU recomendadas: no disponible. Por tamaño, un modelo de 4B puede ejecutarse en GPU consumer de gama alta (por ejemplo, RTX 4090 con 24 GB) o en GPU de datacenter (A100, H100) sin problemas.
- ¿Cabe en GPU consumer? Sí, previsiblemente en tarjetas con 8-12 GB o más, aunque no se confirma en la información disponible.
- Opciones de despliegue: el modelo se distribuye como adaptador PEFT, por lo que requiere `transformers` + `peft` para cargarlo junto al modelo base. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un adaptador LoRA, su uso con estos frameworks requeriría fusión previa con el modelo base o soporte específico de adaptadores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos alternativos de tutoría socrática o de tamaño similar. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Final Socratic LLM (este) | Adaptador LoRA sobre base 4B | No disponible | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan, pero al entrenarse sobre currículo indio (NCERT, K-12) puede estar sesgado hacia ese contexto educativo y cultural.
- Riesgo de alucinación: inherente a los modelos generativos; en un contexto educativo, una alucinación puede confundir al estudiante, por lo que se recomienda supervisión humana.
- Limitaciones de contexto: el entrenamiento usó `max_len=2048`; no se especifica la ventana de contexto nativa del modelo base, por lo que no se garantiza un rendimiento óptimo más allá de esa longitud.
- Limitaciones de idioma: no se especifican los idiomas soportados; el foco en NCERT y currículo indio sugiere un sesgo hacia el inglés y posiblemente hindi, pero no se confirma.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base `unsloth/Qwen3.5-4B`, que no se detalla en la información disponible.
- Caveat para producción: al ser un adaptador LoRA, requiere cargar el modelo base; el repositorio tiene 0 descargas y 0 likes, y no se han publicado evaluaciones independientes, por lo que su robustez en producción no está validada.
- El modelo está pensado para tutoría socrática; su uso fuera de ese dominio puede degradar la calidad de las respuestas.

## Enlaces

- Hugging Face: https://huggingface.co/IITM-2026T3-DSAI-GROUP2/final-socratic-llm
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
