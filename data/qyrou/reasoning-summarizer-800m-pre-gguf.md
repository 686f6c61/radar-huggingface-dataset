# Qyrou/reasoning-summarizer-800m-pre-gguf

## Resumen

Reasoning Summarizer 800M Pre GGUF es una conversión a formato GGUF del checkpoint `mithulaartigala/reasoning-summarizer-qwen3.5-0.8b-preview`, un modelo pequeño de 752 millones de parámetros afinado para transformar cadenas de razonamiento en texto plano en un objeto JSON estructurado con cuatro campos (`title`, `sub_title`, `summary`, `cur_task`). Lo publica Qyrou como export de inferencia para llama.cpp, manteniendo la licencia Apache-2.0 y la atribución al modelo base Qwen3.5.

El modelo no es un asistente conversacional generalista: es una herramienta de extracción de metadatos de razonamiento. Se entrenó con LoRA SFT (rango 32, alpha 64) sobre `Qwen/Qwen3.5-0.8B-Base`, con contexto de entrenamiento de 4.096 tokens y enmascaramiento de pérdida en la salida del asistente, usando el dataset público Reasoning Summaries 61K. La pérdida final de evaluación guardada es 0,792.

Su relevancia práctica está en el tamaño y el formato: con cuantizaciones de 505 MB a 812 MB puede desplegarse en CPU o GPUs de gama baja para resumir y etiquetar trazas de razonamiento de modelos mayores en pipelines de observabilidad, evaluación o interfaz de usuario. El repositorio contiene únicamente exportaciones GGUF, no pesos Transformers ni adaptadores LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3.5-0.8B-Base), afinado con LoRA SFT |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (contexto de entrenamiento); longitud máxima de inferencia no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); sin safetensors ni adaptadores en este repositorio |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.5-0.8B-Base`, un transformer decoder-only de 752 millones de parámetros. Sobre él se aplicó un ajuste fino supervisado con LoRA de rango 32 y alpha 64, contexto de entrenamiento de 4.096 tokens y enmascaramiento de la pérdida en los tokens de salida del asistente, de modo que el modelo aprende a generar exclusivamente el objeto JSON de metadatos. La pérdida final de evaluación registrada es 0,7920386046171188.

Los datos provienen del dataset público Reasoning Summaries 61K (`mithulaartigala/reasoning-summaries-61k`). El entrenamiento se realizó sobre texto de razonamiento en bruto seguido de un salto de línea, sin prompt de sistema, y el modelo se invoca como completion puro en llama.cpp (`llama-completion -no -cnv` o `llama-cli -no-cnv` en builds antiguos). No se documentan fases de RLHF ni DPO, ni innovaciones de decodificación especulativa o atención lineal. El repositorio incluye `smoke_test_results.json` con pruebas locales de candidatos de exportación; el autor advierte que es un smoke test y no un benchmark amplio de calidad o latencia.

## Capacidades

- Extracción de metadatos de razonamiento: convierte una cadena de razonamiento en texto plano en un JSON con exactamente cuatro campos (`title`, `sub_title`, `summary`, `cur_task`).
- Generación de salida estructurada en JSON, pensada para validación programática posterior.
- Etiquetado de secciones de razonamiento mediante `title` y `sub_title`.
- Descripción breve de la tarea en curso mediante `cur_task`.
- Resumen del contenido del razonamiento mediante `summary`.
- Inferencia en CPU y GPU vía llama.cpp con cuantizaciones pequeñas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso como asistente.
- No dispone de capacidades de visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Observabilidad de agentes: resumir y etiquetar trazas de razonamiento generadas por modelos mayores antes de almacenarlas en sistemas de logging, reduciendo el volumen de texto y facilitando búsquedas por título o tarea.
- Interfaces de depuración: mostrar en una UI el `title`, `sub_title` y `summary` de cada bloque de razonamiento de un agente, en lugar de la cadena completa, gracias al JSON de cuatro campos.
- Evaluación de cadenas de razonamiento: clasificar y describir automáticamente pasos intermedios para construir datasets de análisis de calidad o de detección de errores.
- Pipelines de anotación: preetiquetar grandes volúmenes de trazas de razonamiento con metadatos estructurados que luego revisan anotadores humanos.
- Despliegue en entornos con recursos limitados: ejecutar el modelo en CPU o GPUs de gama baja con la cuantización Q4_K_S (505 MB) para tareas de resumen por lotes sin infraestructura dedicada.
- Filtrado y enrutamiento: usar `cur_task` para clasificar trazas y dirigirlas a distintos procesos posteriores (por ejemplo, revisión manual frente a archivado automático).
- Integración en herramientas de desarrollo: resumir cadenas de razonamiento de asistentes de código para generar notas de sesión o changelogs técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye `smoke_test_results.json`, que el autor describe explícitamente como un smoke test local y no como un benchmark de calidad o latencia; sus tamaños históricos pueden diferir de los archivos subidos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por tamaño de archivo, la inferencia requiere aproximadamente entre 0,5 GB (Q4_K_S) y 1,6 GB (F16) de memoria, más overhead de contexto y runtime de llama.cpp.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 2 GB de memoria libre debería poder cargar las cuantizaciones pequeñas.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs de consumo actuales con las cuantizaciones Q4 y Q5; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (`llama-completion`, o `llama-cli -no-cnv` en builds antiguos) con soporte de Qwen3.5. No se documentan otros runtimes.
- Latencia y throughput: no disponibles. El autor no publica mediciones de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Reasoning Summarizer 800M Pre GGUF (este) | 752 M | 4.096 (entrenamiento) | GGUF | Apache-2.0 | Especializado en JSON de metadatos de razonamiento |
| Qwen3.5-0.8B-Base (modelo base) | 752 M | no disponible | safetensors | Apache-2.0 | Modelo generalista sin el ajuste de resumen estructurado |
| Checkpoint fuente `reasoning-summarizer-qwen3.5-0.8b-preview` | 752 M | 4.096 (entrenamiento) | Transformers + LoRA | Apache-2.0 | Mismo comportamiento, permite entrenamiento continuado |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo especializado en extracción de metadatos de razonamiento; no está diseñado para chat general ni para instrucciones arbitrarias.
- Puede generar JSON malformado, omitir detalles o producir resúmenes inexactos.
- Las cuantizaciones más pequeñas pueden reducir la fiabilidad de la salida estructurada; el autor no establece un ranking de calidad entre exportaciones.
- Los smoke tests no establecen el rendimiento en dominios distintos de los probados.
- Solo soporta inglés.
- Requiere pasar el texto de razonamiento en bruto con salto de línea final y sin prompt de sistema, tal como se entrenó.
- El repositorio contiene únicamente GGUF; para entrenamiento continuado hay que acudir al repositorio fuente con pesos Transformers y adaptadores.
- Licencia Apache-2.0, compatible con uso comercial, manteniendo la atribución al modelo base Qwen y al autor.
- Riesgo de sesgos heredados del modelo base y del dataset de entrenamiento; no se documentan análisis específicos de sesgo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Qyrou/reasoning-summarizer-800m-pre-gguf
- Modelo fuente: https://huggingface.co/mithulaartigala/reasoning-summarizer-qwen3.5-0.8b-preview
- Dataset de entrenamiento: https://huggingface.co/datasets/mithulaartigala/reasoning-summaries-61k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Perfil del autor del modelo fuente: https://huggingface.co/mithulaartigala
