# Bangadhipati/AstraGenX-SciHigh2026-Task1

## Resumen

AstraGenX-SciHigh2026-Task1 es un modelo de generación de texto desarrollado por el equipo AstraGenX como solución oficial para la Tarea 1 de la competición SciHigh2026. Se trata de un modelo secuencia a secuencia basado en la arquitectura BART, concretamente una versión fine-tuned de `facebook/bart-base`, especializado en transformar resúmenes científicos densos en highlights de investigación concisos y precisos. El modelo aborda el problema de la comprensión rápida de literatura académica, generando listas de puntos clave que capturan metodología, hallazgos y relevancia del estudio.

La relevancia actual de este modelo radica en su aplicación directa en flujos de trabajo académicos automatizados, revisión de literatura y asimilación rápida de artículos STEM. Con aproximadamente 139,47 millones de parámetros y una longitud de contexto de 512 tokens de entrada, ofrece una solución ligera y eficiente para tareas de resumen científico. Aunque su licencia no está especificada, el modelo está disponible en Hugging Face con formato safetensors y es compatible con la librería transformers, lo que facilita su integración en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BART-base (transformer encoder-decoder) |
| Parametros totales | 139.470.681 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens de entrada, generacion de 30 a 150 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en BART-base, una arquitectura transformer encoder-decoder con denoising autoencoder. BART combina un encoder bidireccional similar a BERT con un decoder autoregresivo similar a GPT, lo que lo hace especialmente adecuado para tareas de generación de texto como resumen y paráfrasis. En este caso, el modelo ha sido fine-tuned específicamente para la generación de highlights científicos, adaptando las capacidades generales de BART a un dominio especializado.

El entrenamiento se realizó sobre el dataset MixSub proporcionado por los organizadores de SciHigh2026, que contiene pares de resúmenes científicos y sus highlights correspondientes. Se utilizó la API `Trainer` de Hugging Face en un entorno acelerado por GPU, con una longitud máxima de entrada de 512 tokens, una longitud mínima de generación de 30 tokens y máxima de 150 tokens. La estrategia de decodificación empleada fue búsqueda de haz (beam search) con `num_beams=4`, priorizando la calidad del solapamiento léxico y la coherencia semántica. No se mencionan técnicas adicionales como RLHF o DPO en la información disponible.

## Capacidades

- Generacion de highlights cientificos: el modelo toma un resumen academico denso y produce una lista de puntos clave (bullet-point style) que resumen metodologia, hallazgos y relevancia.
- Resumen de texto cientifico: optimizado para dominios STEM, puede condensar abstracts en formatos breves y accionables.
- Generacion secuencia a secuencia: al estar basado en BART, mantiene capacidades generales de generacion de texto, aunque su fine-tuning lo especializa en resumen cientifico.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no, solo ingles.
- Capacidades especiales: no se documentan modos de pensamiento, vision o audio.

## Casos de uso

- Revision de literatura academica: un investigador puede introducir el abstract de un articulo y obtener un resumen estructurado en puntos clave, acelerando la seleccion de papers relevantes para su trabajo.
- Automatizacion de flujos editoriales: revistas cientificas pueden usar el modelo para generar borradores de highlights que luego un editor humano revisa y ajusta, reduciendo el tiempo de produccion editorial.
- Asistente de lectura para estudiantes: estudiantes de posgrado pueden procesar abstracts complejos y obtener una sintesis clara de los puntos principales antes de leer el articulo completo.
- Integracion en gestores de referencias: herramientas como Zotero o Mendeley podrian incorporar este modelo para generar resumenes automaticos de los papers almacenados en la biblioteca del usuario.
- Analisis de tendencias de investigacion: al procesar multiples abstracts de un mismo campo, el modelo puede extraer highlights que permitan identificar patrones metodologicos o tematicos emergentes.
- Generacion de contenido para repositorios institucionales: universidades y centros de investigacion pueden generar automaticamente descripciones breves de sus publicaciones para sus sitios web o informes anuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el rendimiento se mide contra el baseline de la competicion (Pegasus con ROUGE-L F1 de 23,45%), pero no se proporcionan los valores obtenidos por este modelo. Las metricas oficiales son ROUGE (1, 2, L), METEOR y BERTScore, pero no se incluyen cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Dado que el modelo tiene ~139M parametros en precision fp32 (aproximadamente 558 MB), una cuantizacion a int8 reduciria el peso a ~140 MB, lo que permitiria ejecutarlo en GPUs con 4 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, o superiores. Para entrenamiento o fine-tuning adicional se recomienda al menos 8 GB.
- Compatibilidad con consumer GPU: si, el modelo es lo suficientemente pequeno para ejecutarse en GPUs de consumo medio.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, o mediante la API de Hugging Face Inference Endpoints (el tag `endpoints_compatible` lo indica). Tambien es posible usar llama.cpp si se convierte a formato GGUF, aunque no se proporciona esa conversion.
- Latencia y throughput: no disponible, pero al ser un modelo base de tamano moderado, se espera una latencia baja en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AstraGenX-SciHigh2026-Task1 | 139M | 512 tokens | Resumen cientifico | no disponible | Hugging Face |
| facebook/bart-base | 139M | 1024 tokens | Resumen general | Apache 2.0 | Hugging Face |
| google/pegasus | 568M | 512 tokens | Resumen cientifico | Apache 2.0 | Hugging Face |
| allenai/led-base-16384 | 163M | 16384 tokens | Resumen de documentos largos | Apache 2.0 | Hugging Face |

El modelo se compara directamente con BART-base (su base) y con Pegasus, que es el baseline de la competicion. Pegasus tiene mas parametros (568M) y esta especificamente pre-entrenado para resumen, mientras que este modelo es un fine-tuning de BART. LED-base ofrece contexto mucho mas largo pero no esta especializado en highlights cientificos. La principal ventaja de AstraGenX es su tamano reducido y su especializacion en el dominio cientifico, aunque no se dispone de datos de rendimiento para validar su superioridad.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan, pero al estar entrenado sobre abstracts cientificos en ingles, puede reflejar sesgos presentes en la literatura academica (por ejemplo, sobre-representacion de ciertos campos o regiones).
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir contenido plausible pero incorrecto si el abstract de entrada es ambiguo o contiene informacion contradictoria.
- Limitaciones de contexto: la longitud maxima de entrada es de 512 tokens, lo que excluye abstracts muy extensos o documentos completos. No es adecuado para resumir articulos enteros.
- Limitaciones de idioma: solo soporta ingles. No se ha entrenado para otros idiomas.
- Restricciones de licencia: la licencia no esta especificada, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar con el autor antes de utilizarlo en entornos de produccion.
- Caveat de produccion: al ser un modelo de competicion, puede no estar optimizado para robustez en entornos reales. Se recomienda validar su rendimiento en el dominio especifico de uso antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Bangadhipati/AstraGenX-SciHigh2026-Task1
- Modelo base: https://huggingface.co/facebook/bart-base
- No se proporcionan otros enlaces (papers, blogs, repos) en la informacion disponible.
