# Rover00/WeMM-JEV

## Resumen

WeMM-JEV es un modelo de decisión multimodal de 27B parámetros desarrollado por el usuario Rover00 y publicado en Hugging Face bajo licencia Apache 2.0. Se presenta como un derivado de "Qwen3.8-27B" (etiqueta interna `qwen3_5` en los metadatos del repositorio) orientado no a la generación libre de texto, sino a la evaluación probabilística de proposiciones: dado un estado (texto e imágenes) y una pregunta, devuelve probabilidades en una única pasada forward. Soporta tres tipos de pregunta: elección entre opciones (`choice`), estimación de probabilidad de una proposición sí/no (`noul`) y distribución sobre niveles ordenados (`score`).

El modelo resuelve un problema concreto: integrar capacidades de razonamiento multimodal en bucles de decisión donde se necesita una salida calibrada y comparable, no texto generado. En lugar de pedir al modelo que "responda", se le pide que puntúe alternativas, lo que facilita su uso en sistemas de agentes, filtrado, ranking o control. El repositorio ocupa 52,2 GB y contiene pesos en formato safetensors con código personalizado (`custom_code`), lo que implica que la inferencia requiere el paquete `inference` del propio autor y no es directamente compatible con pipelines estándar de `transformers`.

La información pública es escasa: la model card es breve, no detalla la composición del dataset de entrenamiento, no lista idiomas soportados y solo aporta un índice propio ("Public Decision Index 0.3") con dos valores agregados. Con 947 descargas y 3 likes en el momento de la consulta, se trata de un modelo de nicho, probablemente experimental, cuya evaluación independiente aún no está disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Qwen3.8-27B (etiqueta `qwen3_5`), con código personalizado |
| Parámetros totales | 26.085.330.160 (~26,1B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería pytorch, `custom_code`) |

## Arquitectura y entrenamiento

La model card indica que WeMM-JEV es un modelo multimodal de decisión construido sobre Qwen3.8-27B. La etiqueta `qwen3_5` en los metadatos sugiere una base de la familia Qwen3, pero no se especifica la variante exacta ni el proceso de adaptación (fine-tuning supervisado, RLHF, DPO u otro). El modelo acepta texto y múltiples imágenes como entrada y produce, en una sola pasada forward por pregunta, una distribución de probabilidad sobre las opciones o niveles definidos por el usuario. Esta formulación de "cabeza de decisión" es la innovación principal documentada: convierte la generación en clasificación probabilística condicionada por instrucciones y criterios.

No se publican detalles sobre el número de tokens de entrenamiento, la composición del dataset, el uso de datos sintéticos ni las técnicas de alineación empleadas. Tampoco se documenta si se congelaron capas del modelo base, si se añadieron módulos específicos para la cabeza de decisión o cómo se integran las imágenes (proyector, cross-attention, etc.). El repositorio incluye código de inferencia propio (`inference/D3Engine`), lo que confirma que la arquitectura no es estándar y requiere cargar módulos personalizados.

## Capacidades

- Evaluación de elección múltiple (`choice`): selecciona entre opciones suministradas por el usuario y devuelve probabilidades por opción.
- Evaluación binaria (`noul`): estima la probabilidad de que una proposición sea verdadera.
- Puntuación ordinal (`score`): devuelve una distribución sobre niveles ordenados (por ejemplo, escalas de severidad o calidad).
- Procesamiento multimodal: acepta texto y múltiples imágenes en una misma consulta.
- Inferencia en una sola pasada forward por pregunta, lo que reduce coste frente a generación autoregresiva.
- Integración con servidor HTTP y con el "Decision Index" según la documentación del autor.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modos de razonamiento extendido (thinking).

## Casos de uso

- Moderación de contenido multimodal: dado un texto y una o varias imágenes, usar `score` para obtener una distribución sobre niveles de riesgo y fijar umbrales de revisión humana.
- Verificación de afirmaciones: emplear `noul` para estimar la probabilidad de proposiciones extraídas de documentos o titulares, con las imágenes asociadas como evidencia.
- Ranking de candidatos en pipelines de búsqueda o recomendación: usar `choice` para puntuar alternativas y reordenar resultados sin generar texto.
- Control de agentes: consultar al modelo sobre el estado del entorno (por ejemplo, "¿el semáforo está en rojo?") y usar la probabilidad como señal para la política del agente.
- Etiquetado asistido en anotación de datasets: predecir etiquetas y niveles de confianza para priorizar la revisión manual.
- Evaluación automática de respuestas generadas por otros modelos: usar `score` para asignar niveles de calidad a salidas de texto o pares imagen-texto.
- Filtrado en pipelines de datos: descartar muestras con baja probabilidad de cumplir un criterio definido por instrucciones.

## Benchmarks y rendimiento

La model card solo publica el "Public Decision Index 0.3" del autor, sin detallar la composición del panel ni los modelos de comparación:

| Panel | Public Decision Index 0.3 |
|---|---:|
| Texto | 69,37 |
| Visión | 77,97 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MMMU, etc.) en la información disponible. Los resultados detallados se remiten al dataset `Rover00/WeMM-JEV-Results`, no incluido en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 52 GB solo para pesos (26,1B × 2 bytes), más overhead de activaciones y del código personalizado; se recomienda al menos 80 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 24 GB con sharding, si el código de inferencia lo soporta).
- En consumer GPU: no cabe en una sola RTX 4090 (24 GB) en precisión completa. No se documentan cuantizaciones (GGUF, AWQ, GPTQ) que permitan reducir la huella.
- Opciones de despliegue: el autor proporciona `inference/D3Engine` (Python) y un servidor HTTP propio; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la categoría de "modelo de decisión multimodal" con la misma formulación (choice/noul/score). Como referencia de tamaño y base, se puede comparar con el modelo del que deriva, aunque los datos de este último no están incluidos en la información proporcionada:

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| WeMM-JEV | ~26,1B | no disponible | Sí (texto + múltiples imágenes) | Apache 2.0 | safetensors + custom_code |
| Qwen3.8-27B (base declarada) | ~27B | no disponible | no disponible | no disponible | no disponible |
| Alternativas de decisión multimodal | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Documentación muy escasa: no se detallan datos de entrenamiento, idiomas, contexto ni proceso de alineación, lo que dificulta evaluar sesgos y robustez.
- Riesgo de alucinación y calibración deficiente: las probabilidades devueltas no están validadas de forma independiente; el "Public Decision Index" es una métrica propia del autor sin comparación pública.
- Idiomas no declarados: no hay garantía de comportamiento correcto fuera del inglés (los ejemplos de la model card están en inglés).
- Dependencia de código personalizado (`custom_code`): la inferencia requiere el paquete `inference` del repositorio, lo que complica la integración con ecosistemas estándar y la portabilidad.
- Sin cuantizaciones publicadas: el despliegue en hardware consumer no está soportado de forma documentada.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de un modelo base no identificado con precisión, conviene verificar las obligaciones de la licencia del modelo original.
- Modelo de nicho con pocas descargas y validación externa limitada; no recomendable para producción crítica sin evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rover00/WeMM-JEV
- Resultados detallados: https://huggingface.co/datasets/Rover00/WeMM-JEV-Results
- Documentación de inferencia: `inference/README.md` dentro del repositorio del modelo
- Paper, blog o demo: no disponibles en la información proporcionada
