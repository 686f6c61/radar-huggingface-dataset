# LiquidAI/LFM2.5-VL-3B

## Resumen

LFM2.5-VL-3B es un modelo multimodal (imagen-texto-a-texto) desarrollado por Liquid AI, diseñado especificamente para despliegue en dispositivos edge. Se construye sobre el modelo de lenguaje LFM2.5-2.6B como backbone y anade un codificador visual SigLIP2 NaFlex de 400M de parametros, alcanzando un total de aproximadamente 3.120 millones de parametros. Es una evolucion del anterior LFM2-VL-3B con entrenamiento intermedio y posterior adicional, orientada a mejorar el grounding, la deteccion de objetos y el OCR.

El modelo resuelve el problema de la inferencia multimodal eficiente en hardware limitado: procesa texto e imagenes con un contexto de 32.768 tokens y, segun el autor, alcanza 228 tok/s en un Apple M5 Max y 116 tok/s en un AMD Ryzen AI Max+ 395 con menos de 3,3 GB de memoria. Esta orientado a tareas de un solo turno, alto throughput y baja latencia, no a razonamiento complejo de contexto largo.

Su relevancia actual reside en la combinacion de capacidades visuales (OCR con anotacion de layout, deteccion de objetos mediante consultas en lenguaje natural) con un consumo de memoria muy reducido y soporte de 16 idiomas, lo que lo posiciona como candidato para aplicaciones moviles, automocion y procesamiento por lotes de documentos escaneados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (backbone de lenguaje LFM2.5 + codificador visual SigLIP2 NaFlex) |
| Parametros totales | 3.123.483.888 (~3,12 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | GGUF (llama.cpp), ONNX cuantizado, MLX 8-bit; otras no disponibles |
| Idiomas soportados | Arabe, chino, ingles, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, espanol, tailandes, vietnamita |
| Licencia | lfm1.0 (licencia propia, "other") |
| Formato de pesos | safetensors (checkpoint nativo); GGUF, ONNX y MLX en repositorios derivados |

## Arquitectura y entrenamiento

El modelo combina un backbone de lenguaje LFM2.5-2.6B, que pertenece a la familia de modelos hibridos de Liquid AI (arquitectura no transformer pura, segun la denominacion "liquid" del autor), con un codificador visual SigLIP2 NaFlex de 400M de parametros en su variante shape-optimized. El procesamiento de imagenes usa la resolucion nativa de SigLIP2 NaFlex: las imagenes grandes se dividen en parches no solapados de 512x512 junto con una miniatura reescalada de la imagen completa. El vocabulario es de 128.000 tokens y la plantilla de chat sigue un formato tipo ChatML.

El entrenamiento parte del checkpoint LFM2-VL-3B y aplica fases adicionales de mid-training y post-training. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Las mejoras declaradas por el autor se centran en grounding y deteccion de objetos con consultas en lenguaje natural, y en OCR de pagina completa con anotacion de layout.

## Capacidades

- Generacion de texto e interaccion conversacional multimodal (imagen + texto).
- Comprension de imagenes: descripcion, respuesta a preguntas visuales y analisis de contenido.
- OCR de pagina completa con anotacion de layout, orientado a convertir documentos escaneados en texto estructurado.
- Grounding y deteccion de objetos mediante consultas en lenguaje natural, con visualizacion de bounding boxes.
- Soporte de tool calling / function calling, segun la demo oficial del modelo.
- Capacidades multilingues en 16 idiomas, incluyendo espanol.
- Procesamiento a resolucion nativa de imagen mediante parches de 512x512.
- Optimizado para tareas de un solo turno con alta eficiencia; no orientado a razonamiento intensivo ni contexto largo.

## Casos de uso

- Deteccion de objetos casi en tiempo real en automocion: el modelo acepta consultas en lenguaje natural para localizar objetos en imagenes y su bajo consumo (menos de 3,3 GB) permite integrarlo en sistemas embebidos de vehiculos con latencia reducida.
- Digitalizacion de documentos escaneados: el OCR con anotacion de layout permite procesar PDFs por lotes y convertirlos en texto buscable conservando la estructura de la pagina, adecuado por su alto throughput en modo batch.
- Traduccion en dispositivo de menus y senales de trafico: con soporte de 16 idiomas y ejecucion local, puede traducir texto capturado por camara en moviles sin conexion a la nube.
- Asistencia visual accesible: descripcion de imagenes en tiempo real para aplicaciones de accesibilidad en telefonos, aprovechando la inferencia en CPU/GPU de consumo.
- Automatizacion de inventario o inspeccion visual: consultas en lenguaje natural sobre fotografias para identificar y localizar productos o defectos, con salida de bounding boxes.
- Chat multimodal en navegador o webcam: la demo WebGPU permite desplegar interaccion con imagenes capturadas en directo, util para prototipos de asistentes visuales.
- Clasificacion y etiquetado de imagenes a gran escala: procesamiento por lotes con bajo coste de memoria para anotar conjuntos de datos o moderar contenido visual.

## Benchmarks y rendimiento

El autor publica una grafica de medias por grupo de tareas (lfm2_5_vl_3b_task_group_averages) en la model card, pero no se proporcionan cifras numericas de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

Datos de rendimiento declarados por el autor:

| Metrica | Valor |
|---|---|
| Throughput en Apple M5 Max | 228 tok/s |
| Throughput en AMD Ryzen AI Max+ 395 | 116 tok/s |
| Memoria en inferencia | menos de 3,3 GB |

No se han publicado resultados de benchmarks numericos comparables en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: menos de 3,3 GB en la configuracion de inferencia reportada por el autor; el checkpoint nativo en safetensors ocupa 6,3 GB en el repositorio.
- GPU recomendadas: el autor cita Apple M5 Max y AMD Ryzen AI Max+ 395 como plataformas de referencia; para servidor se puede usar cualquier GPU con suficiente memoria (A100, H100) mediante vLLM o SGLang, aunque no se detallan cifras especificas.
- Cabe en GPU de consumo: si, gracias a los exports GGUF, ONNX cuantizado y MLX 8-bit, con consumo por debajo de 3,3 GB en el caso reportado.
- Opciones de despliegue: HF Transformers, vLLM, SGLang (checkpoint nativo); llama.cpp (GGUF); ONNX Runtime para cloud, edge y movil; mlx-vlm para Apple Silicon.
- Latencia y throughput: 228 tok/s en Apple M5 Max y 116 tok/s en AMD Ryzen AI Max+ 395, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-VL-3B | ~3,12B | 32.768 | Imagen-texto | lfm1.0 | Hugging Face (safetensors, GGUF, ONNX, MLX) |
| LFM2-VL-3B (predecesor) | no disponible | no disponible | Imagen-texto | no disponible | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks ni especificaciones de modelos competidores de la misma categoria para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- No recomendado para tareas de contexto largo ni de razonamiento intensivo, como diseno web visual o preguntas tecnicas complejas sobre planos, segun el propio autor.
- Orientado a tareas de un solo turno; el rendimiento en conversaciones multi-turno complejas no esta documentado.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan tasas especificas de error.
- No se detallan sesgos conocidos ni la composicion del dataset de entrenamiento, lo que dificulta evaluar sesgos demograficos o culturales.
- La licencia lfm1.0 es una licencia propia ("other") distinta de las licencias open source estandar; es necesario revisar el archivo LICENSE antes de un uso comercial.
- El contexto de 32.768 tokens limita el procesamiento de documentos muy extensos o conversaciones largas.
- El rendimiento en idiomas distintos del ingles no esta cuantificado en la informacion disponible, aunque se declaren 16 idiomas soportados.
- La resolucion de imagen se procesa mediante parches de 512x512, lo que puede afectar a detalles muy finos en imagenes de gran tamano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- GGUF: https://huggingface.co/LiquidAI/LFM2.5-VL-3B-GGUF
- ONNX: https://huggingface.co/LiquidAI/LFM2.5-VL-3B-ONNX
- MLX 8-bit: https://huggingface.co/LiquidAI/LFM2.5-VL-3B-MLX-8bit
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B-Base
- Nota de lanzamiento: https://www.liquid.ai/blog/lfm2-5-vl-3b
- Documentacion: https://docs.liquid.ai/lfm/getting-started/welcome
- Plantilla de chat: https://docs.liquid.ai/lfm/key-concepts/chat-template#vision-models
- Documentacion de inferencia: https://docs.liquid.ai/lfm/inference/transformers
- Playground: https://playground.liquid.ai/
- LEAP: https://leap.liquid.ai/
- Discord: https://discord.com/invite/liquid-ai
- Demo WebGPU: https://huggingface.co/spaces/LiquidAI/LFM2.5-VL-3B-WebGPU
- Demo en playground: http://playground.liquid.ai/chat?model=lfm2.5-vl-3b
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Paper de referencia (arXiv:2305.03393): https://arxiv.org/abs/2305.03393
