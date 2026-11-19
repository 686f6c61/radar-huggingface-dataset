# infinialabs-ai/xailon-parser-0.8b

## Resumen

xailon-parser 0.8b es un modelo de visión-lenguaje especializado en el análisis y extracción de contenido de documentos (OCR y document parsing), desarrollado por InfiniaLabs AI. Se trata de un ajuste fino del modelo LightOnOCR-3-0.8B de LightOn, sobre el que se ha aplicado entrenamiento adicional mediante GRPO (reinforcement learning) y una pasada supervisada para mejorar la lectura de gráficos, tablas, maquetación y formato de texto (negrita, cursiva, subrayado, superíndice, etc.). Con 852.985.920 parámetros, es un modelo compacto pensado para desplegarse con vLLM o MLX y servir detrás de una API compatible con OpenAI.

El modelo forma parte de un producto mayor llamado "xailon-parser 1", un pipeline de parsing documental cuyo código no es público. El checkpoint publicado contiene únicamente el modelo con el entrenamiento fusionado en los pesos (sin adaptadores LoRA), en bf16. Es relevante ahora porque demuestra que un modelo de menos de mil millones de parámetros, con entrenamiento específico mediante RL, puede mejorar sustancialmente en tareas de parsing estructurado (formato, gráficos y maquetación) respecto a su modelo base, manteniendo una licencia permisiva Apache-2.0.

La arquitectura subyacente es la del modelo base LightOnOCR-3-0.8B, etiquetada en Hugging Face con el tag `qwen3_5`, lo que sugiere una familia Qwen 3.5 adaptada para OCR. El modelo acepta entrada de imagen y texto y genera texto, con capacidad conversacional y soporte para despliegue en vLLM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), tag `qwen3_5`; basado en LightOnOCR-3-0.8B |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 publicado; cuantizaciones adicionales no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, 1.7 GB); conversión MLX en bf16 (`mlx/model.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de LightOnOCR-3-0.8B, un modelo de visión-lenguaje de aproximadamente 853 millones de parámetros orientado a OCR. El ajuste se realizó íntegramente sobre ese checkpoint, fusionando cada paso de entrenamiento en los pesos en fp32 y redondeando una sola vez a bf16. El entrenamiento consta de tres fases: (1) reinforcement learning con GRPO durante 60 pasos, con LoRA de rango 16, usando 8 gráficos × 8 lecturas por paso y una recompensa que compara la tabla extraída del gráfico con los datos conocidos del mismo; (2) una pasada supervisada conjunta sobre recortes de texto con spans marcados (negrita, cursiva, subrayado, tachado, resaltado, superíndice y subíndice), la mitad degradados como escaneos, mezclados con páginas completas leídas por el propio modelo a 5 megapíxeles para preservar la capacidad de lectura de página; y (3) 40 pasos adicionales de GRPO, mitad gráficos sintéticos puntuados contra sus datos y mitad páginas de entrenamiento de DocLayNet puntuadas por cajas, clases y texto de los bloques.

No se utilizó ninguna página de benchmark durante el entrenamiento. El pipeline completo (no público) incluye etapas que releen gráficos y texto escaneado para su formateo. El modelo también se distribuye convertido a MLX en bf16 para Apple silicon, sin cuantizar, y se verificó la equivalencia token a token frente a la versión original en transformers (mismo siguiente token en el 100% de las posiciones en 8 páginas).

## Capacidades

- Lectura de documentos completos a partir de imágenes de página (OCR de alta resolución, hasta 5 megapíxeles según la model card).
- Extracción estructurada de tablas.
- Lectura de gráficos y extracción de sus datos en forma de tabla.
- Detección y clasificación de maquetación (layout): bloques, cajas, clases y texto.
- Reconocimiento de formato de texto: negrita, cursiva, subrayado, tachado, resaltado, superíndice y subíndice.
- Entrada image-text-to-text con comportamiento conversacional.
- Despliegue servido con vLLM mediante API compatible con OpenAI.
- Capacidad de corrección asistida por un modelo grande externo (DeepSeek V4.1 Flash) en el pipeline completo para gráficos y maquetación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio o vídeo: no disponible.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo puede leer páginas escaneadas y extraer tablas de líneas de detalle, aunque en escaneos el rendimiento de formato es inferior al de PDFs digitales, por lo que conviene combinarlo con validación posterior.
- Extracción de tablas de informes financieros: la fase de entrenamiento específica en tablas (puntuación de 86,3 en ParseBench) lo hace adecuado para convertir tablas de PDFs en estructuras de datos consumibles.
- Lectura de gráficos en publicaciones y papers: puede transcribir los datos de un gráfico a tabla, con la advertencia de que los valores leídos de ejes son a menudo aproximados y se benefician de corrección por un modelo mayor.
- Análisis de maquetación para sistemas de gestión documental: detecta bloques, clases y cajas, útil para segmentar páginas antes de indexar contenido.
- Procesamiento de documentos con formato enriquecido: reconoce negrita, cursiva, subrayado y otros estilos, lo que permite preservar la semántica del texto original en la conversión a Markdown o HTML.
- Servicio de parsing detrás de una API compatible con OpenAI: al desplegarse con vLLM, puede integrarse en pipelines existentes que ya consumen APIs de chat completions con entrada multimodal.
- Despliegue local en Apple silicon: la conversión MLX permite ejecutar el modelo en Macs con chip Apple sin GPU dedicada, útil para prototipado y procesamiento offline de documentos sensibles.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre ParseBench (conjunto completo, 2.078 páginas), medidos con el código de ParseBench en el commit `9af4102e`. No son envíos al leaderboard y corresponden a una única ejecución de los mismos pesos (otra ejecución puntuó 78,1 en overall).

| ParseBench, conjunto completo | Overall | Table | Chart | Text | Formatting | Layout |
|---|---|---|---|---|---|---|
| LightOnOCR-3-0.8B solo, sin etapas de pipeline | 74,3 | 84,7 | 64,3 | 88,6 | 66,0 | 68,1 |
| xailon-parser 1, 0.8b | 78,3 | 86,3 | 66,9 | 89,1 | 77,4 | 71,7 |
| xailon-parser 1, 0.8b + DeepSeek V4.1 Flash para gráficos y maquetación | 80,4 | 86,4 | 75,9 | 89,1 | 77,4 | 73,1 |

Advertencia del autor: el modelo por sí solo no reproduce estos resultados; corresponden al parser completo (modelo más pipeline, cuyo código no es público). La última fila incluye llamadas a un modelo grande externo que corrige las tablas de cada gráfico y reetiqueta los bloques de maquetación.

En MLX, a través del pipeline completo, 6 de 8 páginas se leyeron en 25–68 s cada una; una página de gráfico seguía procesándose tras 20 minutos y se detuvo. La velocidad en Mac no está medida.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en bf16 para los pesos; el consumo real depende de la resolución de imagen y del backend (vLLM reserva memoria adicional para KV cache y procesamiento visual).
- GPU recomendadas: cualquier GPU con al menos ~4–6 GB de VRAM libre en bf16; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores por el tamaño reducido del checkpoint, aunque no hay mediciones publicadas.
- Opciones de despliegue: vLLM (`vllm serve . --served-model-name xailon-parser-1-0.8b --trust-remote-code`) y mlx-vlm 0.7.11 en Apple silicon (`python -m mlx_vlm.server`). Otros backends como llama.cpp, Ollama o TGI no están documentados para este modelo.
- Latencia y throughput: en MLX, 25–68 s por página en 6 de 8 páginas probadas; un gráfico superó los 20 minutos. No hay mediciones publicadas para vLLM ni cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ParseBench overall | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xailon-parser 0.8b | 853 M | no disponible | 78,3 (pipeline completo) | Apache-2.0 | Hugging Face |
| LightOnOCR-3-0.8B (base) | ~853 M | no disponible | 74,3 | Apache-2.0 | Hugging Face |
| xailon-parser 0.8b + DeepSeek V4.1 Flash | 853 M + modelo externo | no disponible | 80,4 | Apache-2.0 (modelo) | Hugging Face + API externa |

No se dispone de datos de otros modelos comparables de OCR en la información proporcionada.

## Limitaciones y advertencias

- Los resultados de benchmarks corresponden al pipeline completo, no al modelo aislado, y el código del pipeline no es público.
- En gráficos densos, los valores leídos de los ejes son a menudo aproximados; se recomienda corrección con un modelo mayor.
- Los escaneos son más difíciles que los PDFs digitales: el formato en páginas escaneadas puntúa muy por debajo, y el pipeline aprovecha las fuentes propias del PDF cuando están disponibles.
- La maquetación sigue las convenciones del modelo base: varios párrafos suelen agruparse en un solo bloque y los encabezados en negrita simple a menudo se leen como texto.
- El rendimiento varía entre ejecuciones en unas décimas (78,1 frente a 78,3 en overall).
- No hay información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos más allá de los errores de lectura descritos.
- Licencia Apache-2.0, que permite uso comercial; debe respetarse el NOTICE del modelo base LightOnOCR-3-0.8B, también Apache-2.0.
- En MLX, una página de gráfico no terminó de procesarse en 20 minutos; la velocidad en Mac no está medida.
- El modelo requiere `--trust-remote-code` en vLLM, lo que implica ejecutar código del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infinialabs-ai/xailon-parser-0.8b
- Modelo base LightOnOCR-3-0.8B: https://huggingface.co/lightonai/LightOnOCR-3-0.8B
- MLX (framework de Apple): https://github.com/ml-explore/mlx
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- vLLM: https://github.com/vllm-project/vllm
