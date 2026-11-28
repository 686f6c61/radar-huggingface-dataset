# llamaindex/OCRia-1-GGUF

## Resumen

OCRia-1-GGUF es la distribucion en formato GGUF del modelo OCRia-1, un parser de documentos de 4B parametros desarrollado por LlamaIndex. Su proposito es convertir imagenes de paginas (tipicamente PDF renderizados) en Markdown estructurado, incluyendo texto, tablas, formularios y graficos. Esta publicacion concreta empaqueta los pesos originales en BF16 y una cuantizacion Q8_0, junto con el codificador visual en f16, para su uso con llama.cpp y Ollama en Linux, Windows y macOS.

El modelo base es multimodal (pipeline image-text-to-text) y emplea una arquitectura derivada de Qwen3.5-VL, segun se desprende de la plantilla de chat y del conversor utilizado. Con 4.841.450.496 parametros totales y una ventana de contexto configurada en 32k tokens, esta pensado para procesar una pagina completa a 300 DPI por peticion, con capacidad de generar hasta unos 24k tokens de salida en paginas densas.

La relevancia de esta version GGUF radica en que permite ejecutar el parser en hardware local sin GPU de datacenter, manteniendo una calidad practicamente identica al modelo original servido con vLLM: la media en ParseBench 2 es de 85,77 para Q8_0 frente a 85,56 del original. El autor descarta publicar una cuantizacion de 4 bits por la perdida de precision observada en tablas financieras y de seguros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivada de Qwen3.5-VL (vision encoder + LM), sin cabeza MTP |
| Parametros totales | 4.841.450.496 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configurado en el Modelfile) |
| Tipos de cuantizacion | BF16 y Q8_0 (no se publica Q4_K_M) |
| Idiomas soportados | en |
| Licencia | ocria-1-license (other) |
| Formato de pesos | GGUF (llama.cpp), con mmproj f16 separado para el encoder visual |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal con un codificador visual separado (empaquetado como `mmproj-OCRia-1-f16.gguf`) y un modelo de lenguaje que consume los tokens de imagen. La plantilla de chat corresponde a Qwen3.5, con un modo de razonamiento ("thinking") que debe desactivarse para que el modelo emita el formato de salida esperado. El checkpoint no incluye cabeza MTP, por lo que la conversion se realizo con `--no-mtp`.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La conversion a GGUF se hizo con `convert_hf_to_gguf.py` en el commit `33aeb17` y la cuantizacion con `llama-quantize`. Una innovacion tecnica relevante de este empaquetado es la correccion manual de los limites de pixeles del procesador (`clip.vision.image_min_pixels = 65536`, `clip.vision.image_max_pixels = 16777216`), ya que el conversor de Qwen3-VL de llama.cpp no los escribe y, sin ellos, las imagenes quedan limitadas a 4096 tokens, aproximadamente media pagina a 300 DPI.

## Capacidades

- Conversion de imagenes de documentos a Markdown estructurado, preservando texto y formato.
- Extraccion de tablas, incluyendo tablas financieras y de expedientes de seguros.
- Interpretacion de graficos y formularios.
- Procesamiento de una pagina completa por peticion a 300 DPI y resolucion nativa (hasta 16,7 millones de pixeles, unos 16k tokens de imagen).
- Generacion de salidas largas: hasta aproximadamente 24k tokens en paginas densas.
- Modo thinking desactivable; con thinking activo el modelo responde en formato incorrecto.
- Capacidades conversacionales basicas segun el tag del repositorio, aunque el uso previsto es de parsing de una sola pagina.
- Soporte de function calling y agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles.

## Casos de uso

- Digitalizacion de facturas y extractos financieros: el modelo extrae tablas con alta fidelidad (88,89 en la dimension Tables de ParseBench 2 con Q8_0), lo que permite alimentar sistemas contables con datos estructurados a partir de PDF escaneados.
- Procesamiento de expedientes de seguros: los formularios obtienen una puntuacion de 83,06, adecuada para pipelines de tramitacion que necesitan convertir declaraciones y partes en Markdown revisable.
- Construccion de bases de conocimiento RAG: al producir Markdown limpio y estructurado, la salida se indexa directamente en sistemas de recuperacion como los de LlamaIndex, evitando etapas intermedias de limpieza.
- Extraccion de contenido de articulos academicos y manuales tecnicos: la ventana de 32k tokens y la resolucion de 300 DPI permiten capturar texto pequeno y figuras en una sola pasada.
- Despliegue en estaciones de trabajo sin GPU de datacenter: la version Q8_0 (5,2 GB) mas el encoder visual (0,7 GB) caben en GPUs de consumo, lo que facilita el procesamiento local de documentos sensibles sin enviarlos a la nube.
- Automatizacion de ingesta documental en macOS y Windows: la integracion con Ollama (`ollama run llamaindex/ocria-1 --think=false ./page.png`) permite incorporar el parser a herramientas de escritorio y scripts de linea de comandos.
- Analisis de graficos en informes: con 73,83 en la dimension Charts, el modelo puede transcribir la informacion de graficos simples en Markdown para su posterior analisis.

## Benchmarks y rendimiento

Resultados de ParseBench 2 sobre una muestra fija de 301 paginas (25 por subconjunto, salvo layout), con las mismas condiciones de evaluacion (300 DPI, greedy, thinking off):

| Dimension | OCRia-1 (vLLM) | BF16 GGUF | Q8_0 GGUF |
|---|---:|---:|---:|
| Text | 90,53 | 93,09 | 93,09 |
| Formatting | 89,81 | 90,13 | 89,98 |
| Tables | 88,50 | 89,26 | 88,89 |
| Charts | 75,86 | 73,42 | 73,83 |
| Forms | 83,10 | 81,93 | 83,06 |
| **Media** | **85,56** | **85,57** | **85,77** |

El autor indica que las diferencias por dimension estan dentro del ruido de muestreo (25 paginas por subconjunto). No se publican resultados de benchmarks generales como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: Q8_0 requiere aproximadamente 6 GB (5,2 GB de pesos mas 0,7 GB del encoder visual); BF16 requiere aproximadamente 10,4 GB (9,7 GB mas 0,7 GB).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q8_0; 12 GB o mas para BF16. No se especifican modelos concretos (A100, H100, RTX 4090) en la informacion proporcionada.
- Cabe en GPU de consumo: si, con Q8_0 en tarjetas de 8 GB o superiores; BF16 requiere al menos 12 GB.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (imagenes `llamaindex/ocria-1` con etiquetas `latest` y `bf16`), y endpoint compatible con OpenAI.
- Parametros de ejecucion recomendados: `-c 32768 -fa on`, `temperature=0`, `chat_template_kwargs={"enable_thinking": false}`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni especificaciones de modelos alternativos en la informacion proporcionada. La unica comparacion documentada es interna, entre las variantes del propio modelo:

| Variante | Parametros | Contexto | Media ParseBench 2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OCRia-1 (vLLM, BF16) | 4,84B | 32k | 85,56 | ocria-1-license | Hugging Face |
| OCRia-1-GGUF BF16 | 4,84B | 32k | 85,57 | ocria-1-license | Hugging Face, Ollama |
| OCRia-1-GGUF Q8_0 | 4,84B | 32k | 85,77 | ocria-1-license | Hugging Face, Ollama |

Comparativa con modelos de la misma categoria: no disponible.

## Limitaciones y advertencias

- Solo soporta ingles; no se documentan capacidades multilingues.
- Procesa una unica pagina por peticion; no esta disenado para documentos multipagina en una sola llamada.
- El modo thinking debe desactivarse explicitamente; con thinking activo el modelo responde en un formato incorrecto.
- La cuantizacion Q4_K_M no se publica por perdida de calidad: 6,3 puntos en tablas financieras y 4,8 en tablas de expedientes de seguros, ademas de mayor tendencia a alcanzar el limite de salida (6 paginas frente a 4).
- Resoluciones inferiores a 300 DPI reducen la precision en texto pequeno.
- Riesgo de alucinacion en la transcripcion de contenido: no se documenta una evaluacion especifica de fidelidad literal, solo puntuaciones agregadas por dimension.
- La licencia `ocria-1-license` es de tipo "other"; deben revisarse los terminos del archivo LICENSE antes de cualquier uso comercial.
- Los resultados de benchmarks se basan en 25 paginas por subconjunto, por lo que las diferencias de pocos puntos entre ejecuciones no son significativas.
- El repositorio ocupa 15,5 GB, lo que puede complicar su descarga y almacenamiento en entornos limitados.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/llamaindex/OCRia-1-GGUF
- Modelo base OCRia-1: https://huggingface.co/llamaindex/OCRia-1
- Benchmarks del modelo base: https://huggingface.co/llamaindex/OCRia-1#benchmarks
- Licencia del modelo base: https://huggingface.co/llamaindex/OCRia-1#license
- Repositorio ParseBench: https://github.com/run-llama/ParseBench
- Pagina en Ollama: https://ollama.com/llamaindex/ocria-1
