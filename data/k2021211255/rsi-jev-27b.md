# k2021211255/RSI-JEV-27b

## Resumen

RSI-JEV-27b es un modelo de decisión multimodal de 27.000 millones de parámetros construido sobre el modelo base Qwen3.8-27B. No es un modelo generativo al uso: responde preguntas de elección múltiple sobre imágenes devolviendo, en un único forward pass por pregunta, la opción seleccionada y las probabilidades de todas las opciones. Lo publica el usuario k2021211255 en HuggingFace bajo licencia Apache-2.0, con fecha de creación en noviembre de 2026.

El repositorio no contiene pesos fusionados, sino dos adaptadores LoRA (uno "parent" de rango 16 y otro "mixed" de rango 8) más una cabeza de decisión congelada de 26 × 5120 y el código exacto de inferencia. Los pesos base se descargan por separado desde una revisión fijada de Qwen3.8-27B. Ambos adaptadores deben estar activos simultáneamente para que el modelo funcione.

Su relevancia radica en el enfoque de "evaluación como tarea de decisión": convierte benchmarks de visión en un problema de clasificación forzada con corrección por azar, lo que permite medir rendimiento de forma más controlada que la generación libre. El autor reporta un índice público de visión de 78,4096 sobre 12.210 peticiones, con una precisión micro global del 81,4087%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.8-27B) con dos adaptadores LoRA y cabeza de decisión congelada |
| Parametros totales | 27B (modelo base); los adaptadores y la cabeza se suman sobre esa base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (adaptadores y código); el modelo base y dependencias conservan sus propias licencias; SDK Decision Index bajo MIT |
| Formato de pesos | safetensors (adaptadores LoRA y cabeza de decisión); pesos base descargados por separado |

## Arquitectura y entrenamiento

La arquitectura parte del transformer multimodal Qwen3.8-27B, sobre el que se aplican dos adaptadores LoRA: uno "parent" de rango 16 y alpha 32, resultado de un SFT multitarea en el paso 3000, y otro "mixed" de rango 8 y alpha 16, entrenado sobre datos sintéticos en el paso 343. Sobre la representación del modelo padre congelado se sitúa una cabeza de decisión también congelada de 26 × 5120 que produce la distribución sobre las opciones de cada pregunta.

El adaptador parent se entrenó con una época sobre 119.826 preguntas multitarea limpias, con selección de checkpoint mediante validación interna. El adaptador adicional usó 9.600 ejemplos en una época: 1.200 ejemplos sintéticos por cada una de cuatro tareas (movimiento de cámara, conteo ≥3, conteo ≥5 y memes de odio) más 4.800 ejemplos de replay, con base, adaptador parent y cabeza congelados durante ese entrenamiento. Las tareas sintéticas se diseñaron a partir del análisis de debilidades en benchmarks públicos, lo que constituye una adaptación dirigida y no un experimento ciego. Las auditorías de SHA de imágenes registradas no encontraron solapamiento en los splits auditados, aunque el autor no reclama conocimiento de los datos de preentrenamiento del modelo base ni de los tests privados.

## Capacidades

- Respuesta a preguntas de elección múltiple sobre imágenes, devolviendo opción seleccionada y probabilidades de todas las opciones en un solo forward pass.
- Evaluación multimodal sobre benchmarks de visión: CV-Bench, BLINK, RealWorldQA, CharXiv, InfographicVQA, MMMU-Pro vision, entre otros.
- Tareas de grounding y comprensión espacial (Mind2Web, Winoground).
- Extracción de información de documentos (KIE sobre CORD y FUNSD).
- Moderación de contenido visual (Hateful Memes).
- Conteo de objetos y análisis de movimiento de cámara (tareas sintéticas de adaptación).
- No se documentan capacidades de generación de texto libre, tool calling, agentes ni multilingüismo; el modelo está especializado en decisión forzada.

## Casos de uso

- Evaluación automatizada de modelos de visión: el modelo puede actuar como juez de elección múltiple sobre paneles de benchmark, sustituyendo la generación libre por una clasificación con corrección por azar, lo que reduce la varianza de las puntuaciones.
- Clasificación de documentos escaneados: con un 97,69% en KIE (CORD+FUNSD), puede integrarse en pipelines de extracción de campos donde la tarea se formule como elección entre candidatos.
- Moderación de memes y contenido visual: con un 76,42% en Hateful Memes, sirve como filtro de segunda etapa en sistemas de moderación que ya prefiltraron con un modelo más ligero.
- Comprensión de infografías: con un 98,36% en InfographicVQA, es adecuado para responder preguntas cerradas sobre gráficos y tablas en informes.
- Evaluación de agentes web: con un 94,55% en Mind2Web, puede puntuar decisiones de navegación entre opciones discretas en entornos simulados.
- Auditoría de razonamiento visual: con un 47,80% en MMMU-Pro vision, es útil como señal complementaria en estudios que comparan modelos en tareas de razonamiento difícil, siempre que se use junto a otras métricas.
- Investigación en metodología de evaluación: el índice con corrección por azar y pesos oficiales permite reproducir y auditar rankings de modelos con un protocolo explícito.

## Benchmarks y rendimiento

| Benchmark | Precision | Puntuacion corregida por azar |
|---|---:|---:|
| CV-Bench | 88,47% | 80,98 |
| BLINK | 85,22% | 77,12 |
| RealWorldQA | 84,21% | 74,20 |
| CharXiv | 84,59% | 79,45 |
| InfographicVQA | 98,36% | 97,81 |
| Mind2Web | 94,55% | 92,74 |
| Winoground | 92,62% | 85,25 |
| KIE (CORD+FUNSD) | 97,69% | 96,19 |
| Moderation (Hateful Memes) | 76,42% | 52,84 |
| R-Bench-M | 46,47% | 35,75 |
| MMMU-Pro vision | 47,80% | 40,13 |

Índice público de visión: 78,4096 (9.940 correctas de 12.210 peticiones, panel completo). Precisión micro global: 81,4087%. El índice aplica corrección por azar y pesos oficiales: R-Bench-M pesa 0,5 y MMMU-Pro vision 0,25; los otros nueve benchmarks pesan 1. No se reclama ningún resultado en el panel de texto.

## Requisitos de hardware

- La ejecución pública completa usó ocho GPU A800-SXM4-80GB, cada una con una instancia de modelo con batch 1.
- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del modelo base (27B) se requiere al menos una GPU de 80 GB en precisión completa, o cuantización no documentada.
- GPU recomendadas: A800-SXM4-80GB (configuración medida por el autor); no se documentan otras.
- No se confirma que quepa en GPU de consumo; no hay datos de cuantización para RTX 4090 u otras.
- Opciones de despliegue: el repositorio incluye código de inferencia propio en `inference/README.md` y un runner oficial; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia medida en A800: media 777,36 ms, mediana 520,24 ms, P80 893,07 ms, P95 1.685,89 ms por petición, incluyendo procesamiento de imagen y compilación/autotuning en llamada, excluyendo inicialización del modelo. El autor aclara que no es la certificación de latencia en RTX PRO 6000 de los mantenedores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RSI-JEV-27b | 27B (base) + LoRA | no disponible | Decisión multimodal de elección múltiple | Apache-2.0 (adaptadores) | HuggingFace, requiere pesos base aparte |
| Qwen3.8-27B (base) | 27B | no disponible | Modelo generativo multimodal | la del modelo base | HuggingFace |
| Alternativas de decisión multimodal | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos públicos de otros modelos de decisión comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo no es un checkpoint fusionado: requiere descargar los pesos base de Qwen3.8-27B desde una revisión fijada y activar ambos adaptadores; un uso con un solo adaptador no está soportado.
- Especializado en elección múltiple forzada sobre imágenes; no se documentan capacidades de generación libre, tool calling ni agentes.
- Rendimiento débil en razonamiento visual difícil: 47,80% en MMMU-Pro vision y 46,47% en R-Bench-M, muy por debajo del resto de benchmarks.
- Moderación limitada: 76,42% de precisión y 52,84 de puntuación corregida en Hateful Memes, con margen de mejora.
- Riesgo de sobreajuste a benchmarks: las tareas sintéticas se diseñaron tras analizar debilidades de benchmarks públicos, lo que el propio autor califica de adaptación dirigida.
- El índice público es local y no equivale a la puntuación del leaderboard privado/completo.
- No hay resultados en el panel de texto; no se debe asumir rendimiento en tareas lingüísticas.
- Idiomas soportados no documentados; no se garantiza comportamiento multilingüe.
- La licencia Apache-2.0 cubre adaptadores y código, pero el modelo base y las dependencias de runtime conservan sus propias licencias, que deben revisarse para uso comercial.
- Los datasets de imágenes de benchmark no se incluyen en el repositorio.
- Cero descargas y cero likes en el momento de la consulta; el proyecto es una preparación para un envío a Vision sin PR abierto.

## Enlaces

- HuggingFace: https://huggingface.co/k2021211255/RSI-JEV-27b
- Resultados detallados: https://huggingface.co/datasets/k2021211255/RSI-JEV-27b-Results
- Código de inferencia: https://github.com/buzhenggg/RSI-JEV-27b
- Resultados de visión: https://huggingface.co/datasets/k2021211255/RSI-JEV-27b-Results/blob/main/runs/rsi-jev-27b-vision/vision-scores.json
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
