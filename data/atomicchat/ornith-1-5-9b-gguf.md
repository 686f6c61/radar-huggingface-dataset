# AtomicChat/Ornith-1.5-9B-GGUF

## Resumen

Ornith-1.5-9B-GGUF es la conversión a formato GGUF del modelo Ornith-1.5-9B, realizada por AtomicChat (el equipo detrás de la aplicación Atomic Chat). El modelo base, desarrollado por Ornith AI, es un transformer denso de 8.950 millones de parámetros de lenguaje más 460 millones de parámetros de visión, diseñado específicamente para tareas de razonamiento, agente y codificación. Esta versión cuantizada permite ejecutar el modelo localmente con llama.cpp y otras herramientas compatibles con GGUF, manteniendo capacidades multimodales gracias a un proyector de visión independiente.

La relevancia actual de este lanzamiento radica en que Ornith-1.5-9B se posiciona como un modelo competitivo frente a alternativas mucho más grandes (como Gemma 4-31B o Qwen 3.6-35B, según afirmaciones del propio equipo), y su disponibilidad en GGUF facilita su despliegue en hardware de consumo, incluso en dispositivos móviles mediante la versión Mobile mencionada por el desarrollador. El repositorio incluye por ahora el archivo BF16 de referencia y el proyector de visión, mientras que la escalera de cuantización se publica progresivamente con métricas de divergencia KL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con proyector de vision |
| Parametros totales | 9.410.000.000 (8.950 M lenguaje + 460 M vision) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (valor usado en el quick start; maximo no confirmado) |
| Tipos de cuantizacion | BF16 (disponible); quants adicionales en proceso de publicacion |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors disponible en el repo base) |

## Arquitectura y entrenamiento

Ornith-1.5-9B es un transformer denso con un proyector de visión multimodal (mmproj) que permite procesar imágenes, gráficos, capturas de pantalla y escritura manual. El modelo base fue entrenado por Ornith AI, que describe su enfoque como "self-scaffolding" y "self-improvement", una metodología que combina generación de datos sintéticos con refinamiento iterativo para mejorar el razonamiento y las capacidades de agente. Aunque no se han publicado detalles completos sobre el dataset de entrenamiento (número de tokens, composición, uso de RLHF/DPO), el modelo está optimizado para tareas de codificación agéntica, razonamiento multi-paso y seguimiento de instrucciones.

La conversión a GGUF realizada por AtomicChat incluye una matriz de importancia propia (imatrix) basada en un corpus de calibración público. El archivo BF16 sirve como referencia de precisión completa contra la cual se medirán todas las cuantizaciones futuras mediante divergencia KL sobre el mismo corpus y en el mismo hardware.

## Capacidades

- Generación de texto y razonamiento multi-paso con "thinking mode" visible (el modelo puede mostrar su razonamiento intermedio).
- Comprensión de imágenes: gráficos, capturas de pantalla, diagramas y escritura manual (demostrado con transcripción de caligrafía).
- Codificación agéntica: soporte para flujos de trabajo de agente que requieren planificación y ejecución de múltiples pasos.
- Tool calling: no confirmado explícitamente en la documentación, pero la orientación a "agentic coding" sugiere compatibilidad con llamadas a herramientas.
- Multilingüismo: no especificado en la información disponible.
- Integración con llama.cpp: funciona con llama-server, llama-mtmd-cli y otras herramientas del ecosistema GGUF.

## Casos de uso

- Asistente de programación con visión: el modelo puede analizar capturas de pantalla de código, diagramas de arquitectura o errores de compilación, y generar soluciones o explicaciones. Su capacidad de razonamiento multi-paso lo hace adecuado para depuración compleja.
- Transcripción de escritura manual: gracias al proyector de visión, puede leer notas manuscritas, cartas o documentos escaneados y convertirlos en texto digital estructurado, como se demostró con la transcripción de una pieza de caligrafía.
- Análisis de gráficos y tablas: puede interpretar visualizaciones de datos (gráficos de barras, líneas, dispersión) y extraer conclusiones o responder preguntas sobre ellos, útil en entornos de análisis de negocio o investigación.
- Chat local con razonamiento visible: al ejecutarse en local con llama.cpp, permite conversaciones con un asistente que muestra su proceso de pensamiento, útil para educación, depuración de lógica o transparencia en decisiones automatizadas.
- Despliegue en dispositivos móviles: la versión Mobile del modelo base (mencionada por Ornith AI) permite ejecutar el modelo en iPhone y Android, habilitando asistentes personales offline con capacidades de razonamiento.
- Automatización de documentación técnica: puede generar documentación a partir de capturas de pantalla de interfaces, diagramas de flujo o especificaciones visuales, reduciendo el trabajo manual en equipos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El tweet del equipo de Ornith afirma que Ornith-1.5-9B supera a Gemma 4-31B y Qwen 3.6-35B, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros tests estandarizados. Las métricas de rendimiento medidas por AtomicChat en el build GGUF son:

| Test | Resultado |
|---|---|
| Prompt processing (512 tokens) | 9047 t/s |
| Generacion (128 tokens) | 94.3 t/s |

Estas mediciones se realizaron en una RTX 5090 con llama.cpp, flash attention activada y CUDA 13.0.

## Requisitos de hardware

- VRAM estimada: el archivo BF16 ocupa 17.9 GB, por lo que se necesita al menos una GPU con 24 GB de VRAM (RTX 4090, RTX 5090, A5000) para ejecutarlo sin offloading. Los quants futuros (Q8, Q6, Q4) reducirán este requisito de forma aproximadamente lineal con el tamaño del archivo.
- GPU recomendadas: RTX 5090 (probada), RTX 4090, A100, H100. En GPUs con menos VRAM se puede usar offloading parcial a CPU, aunque con penalización de rendimiento.
- Compatibilidad con consumer GPU: sí, en GPUs de 24 GB o más. Para GPUs de 12-16 GB se necesitarán los quants de menor precisión cuando estén disponibles.
- Opciones de despliegue: llama.cpp (llama-server, llama-mtmd-cli), Ollama, LM Studio, y cualquier runtime compatible con GGUF.
- Latencia y throughput: 94.3 t/s de generación en BF16 sobre RTX 5090, limitado por ancho de banda de memoria (1792 GB/s). Los quants más pequeños escalarán casi linealmente con el tamaño del archivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-9B (este) | 9.4B (con vision) | 8192+ | Si | MIT | GGUF |
| Gemma 4-31B | ~31B | No disponible | No disponible | Gemma license | Safetensors |
| Qwen 3.6-35B | ~35B | No disponible | No disponible | Apache 2.0 | Safetensors |

Según el tweet de Ornith AI, Ornith-1.5-9B supera a Gemma 4-31B y Qwen 3.6-35B en rendimiento, pero no se aportan datos de benchmarks comparativos en la información disponible. No se dispone de más detalles sobre estos modelos para una comparación técnica exhaustiva.

## Limitaciones y advertencias

- El repositorio GGUF contiene solo el archivo BF16 y el proyector de visión en el momento de la publicación. La escalera de cuantización está en proceso y los usuarios que necesiten quants de menor tamaño deben esperar a su publicación o convertirlos manualmente.
- No se ha confirmado la longitud máxima de contexto. El quick start usa 8192 tokens, pero no se indica si el modelo soporta más mediante interpolación de posición o ventanas extendidas.
- El modelo no incluye un archivo `generation_config.json`, por lo que llama.cpp usa sus valores de muestreo por defecto, que no son los óptimos para este modelo. Es necesario configurar manualmente `--temp 0.6 --top-p 0.95 --top-k 20` para obtener resultados acordes al ajuste del modelo.
- No se han publicado evaluaciones de sesgos, riesgos de alucinación o limitaciones idiomáticas. La información disponible no permite evaluar estos aspectos.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo base puede tener dependencias o componentes con licencias diferentes (no especificadas).
- El rendimiento de visión depende del parámetro `--image-min-tokens 1024`; sin él, el modelo puede ignorar detalles visuales densos y responder basándose en conocimiento previo en lugar de la imagen mostrada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/AtomicChat/Ornith-1.5-9B-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Blog de Ornith sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Sitio web de Ornith AI: https://ornith.online/
- Tweet de anuncio: https://x.com/ornith_/status/2090075048812118352
- Corpus de calibracion: https://huggingface.co/datasets/AtomicChat/calib-corpora
- Metricas de cuantizacion: https://huggingface.co/datasets/AtomicChat/Ornith-1.5-9B-GGUF-metrics
- Aplicacion Atomic Chat: https://atomic.chat/
