# enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-Fbottom20abs-delta04-10240

## Resumen

Este repositorio contiene un adaptador PEFT/LoRA final de un experimento OPSD (Online Preference Self-Distillation) sobre el modelo multimodal Qwen2.5-VL-7B-Instruct. El adaptador se ha entrenado con una variante de reweighting de tokens visuales (bottom-|F|) junto con la técnica de poda de tokens visuales VisionZip, reteniendo solo el 10% de los tokens visuales originales. El objetivo es mantener o mejorar la capacidad de razonamiento visual del modelo base reduciendo drásticamente el coste computacional asociado al procesamiento de imágenes.

El adaptador está entrenado sobre 10.240 muestras del dataset OpenMMReasoner-SFT-874K, una recopilación de razonamiento multimodal con cadenas de pensamiento (CoT). El repositorio incluye únicamente los ficheros del adaptador (`adapter_model.safetensors` y `adapter_config.json`), por lo que es necesario cargarlo sobre el modelo base Qwen2.5-VL-7B-Instruct. No se proporcionan métricas de rendimiento ni benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL-7B-Instruct con adaptador LoRA (PEFT) |
| Parametros totales | Modelo base: 7B; adaptador: no especificado (repo de 0.2 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens (heredado del modelo base, no modificado por el adaptador) |
| Tipos de cuantizacion | No disponibles (adaptador en safetensors, sin cuantizacion explicita) |
| Idiomas soportados | No disponibles (heredados del modelo base, multilingue) |
| Licencia | No disponible (el modelo base Qwen2.5-VL-7B-Instruct usa Apache 2.0, pero la licencia del adaptador no se indica) |
| Formato de pesos | safetensors (adapter) + configuracion PEFT (adapter_config.json) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-VL-7B-Instruct, un transformer multimodal con arquitectura similar a Qwen2.5 para texto y un codificador visual de vision transformer (ViT) con 675M de parametros. El adaptador LoRA se aplica con r=16 y alpha=32, y se entrena con el objetivo OPSD (Online Preference Self-Distillation), una tecnica que utiliza un teacher con promedio exponencial (EMA) con decay 0.9999 para estabilizar el entrenamiento. La variante especifica de este experimento introduce un reweighting de tokens visuales basado en la fraccion de proyeccion (token_projection_fraction_bottom_abs_reweight), que ajusta los pesos de los tokens con menor magnitud absoluta en la proyeccion, con un delta de 0.4 sobre el 20% inferior de tokens.

El entrenamiento se realiza sobre 10.240 muestras del dataset OpenMMReasoner-SFT-874K, con un tamaño de lote global de 32 (4 GPUs, micro-batch 8, acumulacion 1) y un total de 846.720 pixeles por imagen. Se aplica poda de tokens visuales mediante VisionZip, reteniendo solo el 10% de los tokens visuales originales, lo que reduce significativamente la carga computacional en inferencia. El adaptador se guarda en el paso 10240 y se requiere el parche de runtime de VisionZip del repositorio OPSD para la inferencia con poda.

## Capacidades

- Razonamiento visual multimodal: el adaptador hereda las capacidades del modelo base Qwen2.5-VL-7B-Instruct para responder preguntas sobre imagenes, diagramas, documentos escaneados y capturas de pantalla.
- Generacion de texto con cadenas de pensamiento (CoT) en tareas de razonamiento visual, gracias al entrenamiento sobre OpenMMReasoner-SFT-874K.
- Procesamiento eficiente de imagenes: la poda VisionZip al 10% de tokens visuales reduce el coste de atencion sobre el contexto visual, permitiendo inferencias mas rapidas y con menor VRAM que el modelo base sin poda.
- Soporte de tool calling y function calling: el modelo base Qwen2.5-VL-7B-Instruct incluye estas capacidades; el adaptador no las elimina, aunque no se ha verificado su mantenimiento tras el entrenamiento.
- Capacidades multilingues: el modelo base soporta mas de 25 idiomas; el adaptador no especifica cambios al respecto.
- Intervencion en el peso de tokens visuales: el metodo F reweighting ajusta la importancia de tokens visuales de baja magnitud, lo que puede influir en la atencion del modelo sobre regiones menos salientes de la imagen.

## Casos de uso

- Analisis de imagenes medicas con bajo coste computacional: el adaptador, combinado con VisionZip, permite procesar radiografias o tomografias con solo el 10% de los tokens visuales, reduciendo la latencia en entornos clinicos donde los recursos de GPU son limitados. El modelo base mantiene un razonamiento de alto nivel sobre la imagen, y el adaptador esta disenado para preservar esa capacidad.
- Agentes visuales en tiempo real: en aplicaciones de robotica o asistentes de vision por computador, la poda de tokens acelera la inferencia, permitiendo respuestas mas rapidas en tareas de navegacion o reconocimiento de objetos. El adaptador puede integrarse en un pipeline de agente con tool calling para decisiones multi-paso.
- Moderacion de contenido visual: procesar imagenes en plataformas sociales con un alto volumen de trafico se beneficia de la reduccion de tokens visuales, ya que disminuye el coste por imagen. El modelo puede clasificar contenido inapropiado o generar descripciones automaticas con menor uso de VRAM.
- Extraccion de informacion de documentos escaneados: el modelo base es fuerte en OCR y comprension de documentos; el adaptador mantiene esta capacidad mientras reduce la carga de tokens visuales, lo que facilita su despliegue en servidores con GPUs de gama media (por ejemplo, RTX 3090 o 4090).
- Razonamiento visual en educacion: para generar explicaciones paso a paso de problemas de matematicas o fisica a partir de imagenes, el adaptador ofrece una alternativa mas ligera que el modelo completo, adecuada para prototipos o aplicaciones educativas con presupuesto limitado.
- Evaluacion de modelos de vision: dado que el adaptador modifica la ponderacion de tokens visuales, puede utilizarse como herramienta de investigacion para estudiar el impacto de la poda y el reweighting en la calidad del razonamiento multimodal, comparando con el modelo base y otras variantes OPSD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de tareas visuales como DocVQA o ChartQA. Tampoco se proporcionan comparaciones con el modelo base o con otras variantes OPSD.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-VL-7B-Instruct en precision BF16 requiere aproximadamente 16-18 GB de VRAM. Con el adaptador y la poda VisionZip al 10% de tokens, la memoria necesaria para el contexto visual se reduce considerablemente; en la practica, se puede ejecutar en GPUs con 12 GB de VRAM si se usa cuantizacion adicional (por ejemplo, GPTQ o AWQ), aunque el adaptador en si no incluye cuantizacion.
- GPU recomendadas: para una inferencia fluida sin cuantizacion, se recomienda una GPU con al menos 16 GB de VRAM, como RTX 4090, A100 40GB, o L4. Con cuantizacion de 8 bits, una RTX 3090 (24 GB) o RTX 4080 (16 GB) pueden ser suficientes.
- Despliegue en consumer GPU: si, es posible en tarjetas como RTX 4090 (24 GB) o RTX 3090 (24 GB) con el modelo en BF16 y la poda activada. Para GPUs de 12 GB (RTX 3080 Ti, RTX 4070) se requiere cuantizacion adicional y un contexto visual reducido.
- Opciones de despliegue: el adaptador se carga con la libreria PEFT sobre el modelo base. Para inferencia, se puede usar vLLM (con soporte para Qwen2.5-VL), llama.cpp (con conversion a GGUF) u Ollama, aunque el parche de VisionZip debe aplicarse al modelo base antes de la carga. Tambien es posible usar Hugging Face Transformers con el pipeline de image-text-to-text.
- Latencia y throughput: no se han publicado mediciones. Como referencia, el modelo base sin poda procesa una imagen de 1024x1024 en aproximadamente 1-2 segundos en una A100; con la poda al 10% de tokens visuales, la latencia puede reducirse hasta un 40-60% en tareas con muchas imagenes, aunque depende del numero de tokens de texto y de la implementacion del parche.

## Comparativa con modelos similares

| Modelo | Base | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-VL-7B-Instruct (base) | Qwen2.5-VL-7B | 128K | Apache 2.0 | safetensors | Modelo completo sin poda |
| Qwen2.5-VL-7B-OPSD-VisionZip-r010-Fbottom20abs-delta04-10240 (este) | Qwen2.5-VL-7B-Instruct | 128K | No disponible | safetensors (adapter) | Adaptador LoRA con reweighting bottom-|F| y VisionZip 10% |
| Qwen2.5-VL-7B-OPSD-official-VisionZip-r010-10240 | Qwen2.5-VL-7B-Instruct | 128K | No disponible | safetensors (adapter) | Variante OPSD con VisionZip 10%, sin reweighting adicional |
| Qwen2.5-VL-7B-OPSD-VisionZip-r010-balanced-10240 | Qwen2.5-VL-7B-Instruct | 128K | No disponible | safetensors (adapter) | Variante OPSD con muestreo balanceado base-outcome |

No se dispone de datos de rendimiento comparativo entre estas variantes. La diferencia principal radica en el metodo de reweighting de tokens visuales: este adaptador aplica un reweighting basado en la magnitud absoluta de la proyeccion sobre el 20% inferior, mientras que la variante "official" no lo aplica y la "balanced" modifica el muestreo de datos.

## Limitaciones y advertencias

- No se han publicado evaluaciones independientes del adaptador: no hay garantia de que el rendimiento en tareas de razonamiento visual se mantenga o mejore respecto al modelo base, ya que la poda al 10% de tokens puede degradar la precision en tareas que requieren detalles finos de la imagen.
- Sesgos y alucinaciones: el modelo base Qwen2.5-VL puede presentar sesgos en la descripcion de personas o culturas, y puede alucinar detalles visuales cuando la imagen es ambigua o de baja resolucion. El adaptador no corrige estos comportamientos.
- Limitaciones de contexto visual: la poda VisionZip elimina el 90% de los tokens visuales, lo que puede provocar perdida de informacion en imagenes con texto pequeno, graficos densos o escenas complejas. Se recomienda probar en el dominio de uso especifico.
- Restricciones de licencia: la licencia del adaptador no se indica; el modelo base usa Apache 2.0, pero el adaptador podria tener condiciones adicionales. Contactar con el autor antes de uso comercial.
- Requisito del parche VisionZip: el adaptador solo funciona correctamente si se aplica el parche de runtime de VisionZip del repositorio OPSD. Sin el parche, la inferencia puede fallar o dar resultados incorrectos.
- Soporte limitado: el repositorio no incluye documentacion de uso ni ejemplos de carga, y el autor no proporciona canal de soporte. La reproducibilidad depende de la disponibilidad del codigo OPSD.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-Fbottom20abs-delta04-10240
- Modelo base (Qwen2.5-VL-7B-Instruct): https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Variante oficial OPSD: https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-official-VisionZip-r010-10240
- Variante balanced (despliegue en FriendliAI): https://friendli.ai/models/enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-balanced-10240
- Guia de uso de Qwen2.5-VL con vLLM: https://docs.vllm.ai/projects/recipes/en/stable/Qwen/Qwen2.5-VL.html
- Repositorio de referencia de Qwen2.5-VL en GitHub: https://github.com/elsawhs/qwen2.5-vl
