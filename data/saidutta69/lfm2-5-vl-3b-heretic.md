# saidutta69/LFM2.5-VL-3B-heretic

## Resumen

LFM2.5-VL-3B-heretic es una variante "decensored" (abliterated) del modelo multimodal LiquidAI/LFM2.5-VL-3B, publicada por el usuario saidutta69 mediante la herramienta Heretic v1.4.0. El modelo original, desarrollado por Liquid AI, combina un backbone de lenguaje LFM2.5-2.6B con un encoder visual SigLIP2 NaFlex de 400M de parametros, y esta disenado especificamente para despliegue en dispositivo (edge), con procesamiento nativo de imagenes a resolucion y una ventana de contexto de 32.768 tokens. El checkpoint aqui descrito conserva la arquitectura y el entrenamiento multimodal del original, pero aplica una ablacion direccional de pesos para eliminar los comportamientos de rechazo.

La relevancia de esta variante es doble: por un lado demuestra el flujo de "abliteracion reproducible" con parametros documentados por capa; por otro, ofrece un modelo de vision-lenguaje de ~3,12 B de parametros que cabe en menos de 3,3 GB de memoria en configuraciones cuantizadas y alcanza 228 tok/s en un Apple M5 Max o 116 tok/s en un AMD Ryzen AI Max+ 395. Frente al original, que rechaza el 100% de las solicitudes de prueba, esta version rechaza solo 6 de cada 100, con una divergencia KL de 0,0645 respecto al modelo base.

Es importante senalar que se trata de un checkpoint con cero descargas y cero "likes" en el momento de la ficha, sin resultados de benchmarks estandar publicados (MMLU, HumanEval, GSM8K, etc.) y heredando la licencia LFM1.0 del modelo original, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal hibrido: backbone LFM2.5-2.6B + encoder visual SigLIP2 NaFlex shape-optimized 400M |
| Parametros totales | 3.123.483.888 (~3,12 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | GGUF, ONNX cuantizado y MLX 8-bit disponibles en los repos derivados del modelo original; este checkpoint concreto solo publica safetensors en precision nativa |
| Idiomas soportados | 16 idiomas: arabe, chino, ingles, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, espanol, tailandes y vietnamita |
| Licencia | lfm1.0 (etiquetada como "other") |
| Formato de pesos | safetensors (transformers, custom_code lfm2_vl) |
| Vocabulario | 128.000 tokens |
| Resolucion de imagen nativa | SigLIP2 NaFlex: division en parches no solapados de 512x512 mas una miniatura global reescalada |
| Parametros de generacion recomendados (texto) | temperature=0,2; top_k=50; repetition_penalty=1,0 |
| Tamano del repositorio | 6,3 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de la familia LFM2.5, descrita por Liquid AI como una familia de modelos hibridos orientados a despliegue en dispositivo. El componente de lenguaje es el backbone LFM2.5-2.6B, acoplado a un encoder visual SigLIP2 NaFlex de 400M de parametros. El procesamiento de imagenes es nativo: las imagenes grandes se fragmentan en parches no solapados de 512x512 junto con una miniatura reescalada de la imagen completa, lo que evita reescalados agresivos y mejora tareas de grounding, deteccion de objetos y OCR de pagina completa con anotacion de layout. La plantilla de chat sigue un formato tipo ChatML.

El checkpoint original parte de LFM2-VL-3B y anade fases adicionales de mid-training y post-training. La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. Sobre esa base, esta variante aplica una abliteracion con Heretic v1.4.0 mediante direccion por capa y pesos especificos sobre `attn.o_proj` (max_weight 1,08; max_weight_position 17,48; min_weight 0,70; min_weight_distance 8,41) y `mlp.down_proj` (max_weight 1,33; max_weight_position 21,90; min_weight 0,75; min_weight_distance 14,05). El proceso es reproducible segun el directorio `reproduce` del repositorio.

## Capacidades

- Generacion de texto y comprension de imagenes en un unico pipeline image-text-to-text.
- Grounding y deteccion de objetos mediante consultas en lenguaje natural, con salida de bounding boxes.
- OCR de pagina completa con anotacion de layout, orientado a convertir PDFs escaneados en texto indexable.
- Tool calling / function calling segun la documentacion de la familia LFM2.5.
- Soporte de conversaciones multi-turno con contexto de 32.768 tokens (aunque el fabricante recomienda uso de un solo turno).
- Capacidades multilingues en 16 idiomas, incluyendo espanol, ingles, arabe, chino, japones y coreano.
- Inferencia eficiente en hardware de consumo y edge (Apple Silicon, AMD Ryzen AI, CPU).
- Comportamiento "uncensored": la abliteracion reduce drasticamente los rechazos (de 100/100 a 6/100 en el conjunto de prueba del autor).
- No incorpora modo "thinking" explicito ni capacidades de audio segun la informacion disponible.

## Casos de uso

- OCR masivo de documentos escaneados: el modelo procesa paginas completas con anotacion de layout y las convierte en texto buscable, adecuado para pipelines de digitalizacion de archivos y facturas.
- Deteccion de objetos casi en tiempo real: con grounding por lenguaje natural y 228 tok/s en Apple M5 Max, sirve para aplicaciones de automocion o inspeccion visual en las que la latencia es critica.
- Traduccion en dispositivo de menus, senales o carteles: el soporte de 16 idiomas y el bajo consumo de memoria (menos de 3,3 GB) permiten ejecutarlo en moviles o portatiles sin conexion.
- Asistencia visual en el navegador: integrable en demos WebGPU o aplicaciones de chat que permiten subir imagenes o capturar desde webcam y mostrar bounding boxes generados.
- Procesamiento por lotes de imagenes en servidor: con vLLM o SGLang sobre el checkpoint nativo se pueden gestionar colas de clasificacion, descripcion o extraccion de datos de imagenes.
- Filtrado y moderacion de contenido sin rechazos: al reducir los comportamientos de rechazo, resulta util en tareas donde el modelo original bloquea peticiones legitimas (analisis de imagenes sensibles en contextos de investigacion o forense).
- Automatizacion con function calling: integrable en agentes que combinan vision y llamadas a herramientas (por ejemplo, extraer datos de una imagen y ejecutar una accion en un backend).

## Benchmarks y rendimiento

La informacion disponible no incluye resultados de benchmarks estandar como MMLU, HumanEval o GSM8K. El autor solo publica metricas comparativas frente al modelo original:

| Metrica | Este modelo | Modelo original (LiquidAI/LFM2.5-VL-3B) |
|---|---|---|
| Divergencia KL | 0,0645 | 0 (por definicion) |
| Rechazos | 6/100 | 100/100 |
| Throughput en Apple M5 Max | 228 tok/s | no disponible en esta ficha |
| Throughput en AMD Ryzen AI Max+ 395 | 116 tok/s | no disponible en esta ficha |
| Memoria de inferencia | menos de 3,3 GB | no disponible en esta ficha |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, MMMU, DocVQA) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision nativa (FP16/BF16): aproximadamente 6,2-7 GB, derivada de los 3,12 B de parametros y el tamano del repositorio de 6,3 GB.
- VRAM estimada en INT8: aproximadamente 3,2 GB (estimacion a partir del numero de parametros).
- VRAM estimada en 4-bit: aproximadamente 1,7-2 GB (estimacion).
- El fabricante reporta inferencia en menos de 3,3 GB de memoria en configuraciones optimizadas (MLX/ONNX), lo que confirma que cabe en GPUs de consumo.
- GPUs de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y superiores; tambien Apple Silicon (M-series) via MLX.
- GPUs de centro de datos: A100, H100 y similares para despliegues de alto throughput con vLLM o SGLang.
- Opciones de despliegue: Transformers (formato nativo), vLLM, SGLang, llama.cpp (GGUF), MLX (mlx-vlm), ONNX Runtime y WebGPU.
- Latencia y throughput reportados: 228 tok/s en Apple M5 Max y 116 tok/s en AMD Ryzen AI Max+ 395; no se publican cifras para GPU discreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-VL-3B-heretic (este) | ~3,12 B | 32.768 | Si (SigLIP2 NaFlex 400M) | lfm1.0 | HuggingFace, 0 descargas |
| LiquidAI/LFM2.5-VL-3B (original) | ~3,12 B | 32.768 | Si (SigLIP2 NaFlex 400M) | lfm1.0 | HuggingFace, repos GGUF/ONNX/MLX |
| LFM2-VL-3B (predecesor) | no disponible | no disponible | Si | lfm1.0 | HuggingFace |
| Otros VLM de ~3 B (Qwen2.5-VL-3B, etc.) | ~3 B | variable | Si | variable | HuggingFace |

La comparacion cuantitativa con alternativas de otros fabricantes no esta disponible en la informacion proporcionada; no se aportan cifras de rendimiento relativo.

## Limitaciones y advertencias

- La abliteracion elimina los rechazos pero puede degradar la seguridad del modelo: aumenta la probabilidad de generar contenido danino, ofensivo o no filtrado. No es apto para aplicaciones de cara al publico sin moderacion adicional.
- La divergencia KL de 0,0645 respecto al original indica un cambio medible en la distribucion de salida; pueden aparecer degradaciones en tareas que dependian del comportamiento original.
- El fabricante del modelo base no recomienda su uso para tareas de contexto largo o de razonamiento intensivo (por ejemplo, diseno web visual o preguntas tecnicas sobre planos).
- El modelo esta optimizado para un solo turno y alto throughput; el rendimiento en dialogos multi-turno complejos puede ser inferior.
- Aunque declara 16 idiomas, no se especifica el nivel de calidad por idioma; el soporte puede ser desigual.
- Licencia lfm1.0: incluye restricciones para uso comercial (en la familia LFM, las grandes organizaciones suelen requerir licencia comercial especifica); es necesario revisar los terminos antes de un despliegue en produccion.
- Checkpoint sin descargas ni validacion de la comunidad: no hay evidencia independiente de su calidad ni de su estabilidad.
- Riesgo de alucinacion inherente a los modelos de ~3 B, especialmente en OCR de documentos con layouts complejos o en preguntas tecnicas.
- El repositorio depende de `custom_code` (`lfm2_vl`), por lo que requiere versiones compatibles de Transformers y confiar en el codigo remoto del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saidutta69/LFM2.5-VL-3B-heretic
- Modelo original: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Version GGUF del original: https://huggingface.co/LiquidAI/LFM2.5-VL-3B-GGUF
- Version ONNX del original: https://huggingface.co/LiquidAI/LFM2.5-VL-3B-ONNX
- Version MLX 8-bit del original: https://huggingface.co/LiquidAI/LFM2.5-VL-3B-MLX-8bit
- Proyecto Heretic: https://heretic-project.org
- Blog de lanzamiento de LFM2.5-VL-3B: https://www.liquid.ai/blog/lfm2-5-vl-3b
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Documentacion de plantilla de chat: https://docs.liquid.ai/lfm/key-concepts/chat-template#vision-models
- Playground de Liquid AI: https://playground.liquid.ai/chat?model=lfm2.5-vl-3b
- Demo WebGPU: https://huggingface.co/spaces/LiquidAI/LFM2.5-VL-3B-WebGPU
- Plataforma LEAP: https://leap.liquid.ai/
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Paper de SigLIP (arxiv:2305.03393): https://arxiv.org/abs/2305.03393
