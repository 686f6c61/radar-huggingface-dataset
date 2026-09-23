# pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-int8-convrot

## Resumen

Esta ficha describe `pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-int8-convrot`, una build cuantizada a INT8 del codificador de texto del modelo de generacion de imagenes Qwen-Image-2.1. El autor es `pottokao`, un desarrollador independiente no afiliado a Alibaba ni al equipo Qwen. El modelo original del que deriva es `Qwen/Qwen3-VL-8B-Instruct` (Apache-2.0), que Qwen-Image-2.1 utiliza sin modificar como text encoder; esta version aplica una ablacion direccional de rechazos ("abliteration") mediante la herramienta Heretic y despues cuantiza los pesos.

La relevancia practica de esta build es que reproduce exactamente el formato que las plantillas oficiales de Comfy-Org usan por defecto (`qwen3vl_8b_int8_convrot.safetensors`), de modo que funciona como reemplazo directo en el flujo oficial de Qwen-Image-2.1 dentro de ComfyUI: basta cambiar el nombre del archivo. El archivo resultante pasa de 16,33 GB en bf16 a 8,71 GB en INT8, manteniendo el vision tower intacto en bf16.

El componente de generacion visual de Qwen-Image-2.1 es un DiT de un solo flujo con 32 capas y 7B de parametros; el text encoder que aqui se distribuye es el Qwen3-VL de 8B que convierte instrucciones de texto e imagenes de condicionamiento en embeddings consumidos por el DiT. Esta ficha trata exclusivamente el text encoder cuantizado, no el generador de imagenes completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-VL), vision-language; se emplea como text encoder de un DiT single-stream |
| Parametros totales | 8,8 mil millones (aproximado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Esta build: INT8 tensorwise con rotacion convolucional (convrot, tamano de grupo 256, escala por canal `[out, 1]`). En la familia: bf16, W4A8, NVFP4, FP8 y GGUF (Q8_0 / Q6_K / Q4_K_M) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`qwen3vl_8b_int8_convrot_heretic.safetensors`, 8,71 GB) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de una derivacion en dos etapas sobre `Qwen/Qwen3-VL-8B-Instruct`. La primera etapa es la ablacion direccional de rechazos (abliteration) aplicada con Heretic sobre las proyecciones `o_proj` y `down_proj`, con 200 ensayos y 60 ensayos de arranque, seleccionando el punto de rodilla de la frontera de Pareto. La ablacion se evaluo con `mlabonne/harmful_behaviors` para medir rechazos y `mlabonne/harmless_alpaca` para medir divergencia KL: el modelo de stock rechaza 100/100 peticiones (por definicion) frente a 5/100 de esta familia, con una divergencia KL de 0,0220. El autor indica que el bf16 de origen se reverifico de forma independiente con 0/20 rechazos y 4/4 respuestas correctas a preguntas benignas.

La segunda etapa es la cuantizacion INT8. La receta se decodifico de forma inversa a partir del archivo oficial de Comfy-Org `qwen3vl_8b_int8_convrot.safetensors` y se reprodujo sobre los pesos abliterados. El esquema resultante cuantiza 252 proyecciones de FFN y atencion mas `embed_tokens` y `lm_head` (254 tensores en total) a INT8 `tensorwise` con rotacion convolucional (`convrot_groupsize` 256, escala por canal de forma `[out, 1]`); los 351 tensores del vision tower y todas las normas y sesgos permanecen en bf16. Cada tensor cuantizado se serializa con un campo `comfy_quant` en `uint8` que declara `{"format":"int8_tensorwise","convrot":true,"convrot_groupsize":256}`. El resultado se valido contra el archivo oficial comparando tensor a tensor: conjunto de claves identico (1258 tensores), cero discrepancias de forma y todas las configuraciones `comfy_quant` coincidentes. Ademas, se verifico la generacion de imagenes de extremo a extremo en el flujo oficial de ComfyUI.

Una innovacion tecnica relevante del proceso es la gestion del layout de claves: el repack de Comfy-Org elimina el prefijo `model.language_model.`, por lo que cuantizar directamente desde el layout de HuggingFace produce claves que ComfyUI nunca encuentra (el modelo "carga" y emite ruido). Esta build esta remapeada al layout de ComfyUI. Tambien se documenta que el vision tower debe excluirse de la cuantizacion y que `int8_tensorwise` requiere `convrot=True` explicito, ya que la ruta INT8 usa `False` por defecto.

## Capacidades

- Codificacion de texto e imagenes: al derivar de Qwen3-VL-8B, procesa tanto instrucciones textuales como imagenes de condicionamiento y las proyecta a embeddings para el DiT de Qwen-Image-2.1.
- Generacion de imagenes (dentro del pipeline completo): no genera imagenes por si mismo, sino que actua como text encoder del flujo Qwen-Image-2.1 en ComfyUI, habilitando text-to-image e image editing unificados.
- Comprension visual: el vision tower se conserva intacto en bf16, por lo que mantiene las capacidades de entendimiento de imagen del modelo base.
- Generacion de texto: conserva la capacidad generativa del Qwen3-VL de 8B, aunque su uso previsto es como encoder.
- Contexto largo: ventana de 262.144 tokens, util para prompts extensos y condicionamiento multimodal complejo.
- Eliminacion parcial de rechazos: la ablacion reduce los rechazos de 100/100 a 5/100 manteniendo baja divergencia KL (0,0220) respecto al modelo de stock.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de imagenes en ComfyUI: colocar el archivo en `ComfyUI/models/text_encoders/` y usar `CLIPLoader` con tipo `qwen_image` seguido de `TextEncodeQwenImage21`; al coincidir con el formato de las plantillas oficiales, es la opcion menos propensa a errores de compatibilidad.
- Sustitucion directa en flujos tutoriales existentes: cualquier tutorial oficial o de comunidad de Qwen-Image-2.1 que use `qwen3vl_8b_int8_convrot.safetensors` puede adoptar este archivo simplemente cambiando el nombre, sin nodos especiales.
- Despliegue en GPU con VRAM limitada: al ocupar 8,71 GB en lugar de los 16,33 GB del bf16, permite ejecutar el text encoder en tarjetas donde la version de precision completa no cabria junto al DiT.
- Edicion de imagenes guiada por texto: el encoder procesa simultaneamente la instruccion textual y la imagen de condicionamiento, lo que habilita flujos de edicion dentro del pipeline unificado de Qwen-Image-2.1.
- Prompting complejo con contexto largo: los 262.144 tokens permiten descripciones muy detalladas o multiples referencias multimodales en una sola pasada.
- Investigacion sobre ablacion de rechazos: util para estudiar como la eliminacion direccional de rechazos (Heretic, `o_proj` + `down_proj`) afecta al comportamiento del encoder con una divergencia KL medida de 0,0220.
- Reproducibilidad de esquemas de cuantizacion: sirve como referencia verificable para quien quiera replicar la receta INT8 convrot de Comfy-Org sobre otros pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos cuantitativos proporcionados corresponden a la evaluacion de la ablacion heredada del bf16 de origen:

| Metrica | Modelo de stock | Esta familia |
|---|---:|---:|
| Rechazos (`mlabonne/harmful_behaviors`) | 100/100 | 5/100 |
| Divergencia KL (`mlabonne/harmless_alpaca`) | 0 (por definicion) | 0,0220 |
| Rechazos verificados en el bf16 de origen | no disponible | 0/20 |
| Preguntas benignas correctas (bf16 de origen) | no disponible | 4/4 |

## Requisitos de hardware

- VRAM estimada para inferencia: el autor indica aproximadamente 21 GB en 16 bits para la familia; esta build INT8 pesa 8,71 GB en disco, por lo que el requisito de VRAM se reduce aproximadamente a la mitad (estimacion a partir del tamano del archivo, no confirmada por el autor).
- GPU recomendadas: cualquier GPU CUDA capaz de ejecutar el flujo oficial de Qwen-Image-2.1 completo. Para 16 bits se menciona 1x MI300X; en INT8 el margen es mayor.
- Compatibilidad con GPU de consumo: plausible en tarjetas de 12-16 GB de VRAM o superiores para el encoder en solitario, siempre que se disponga ademas de memoria para el DiT.
- Apple Silicon: no acelerado. Los nucleos son CUDA; en Mac el autor recomienda la build GGUF, que si tiene soporte Metal real.
- Opciones de despliegue: ComfyUI (flujo oficial, con soporte `QwenImage21` fusionado despues del 14 de septiembre de 2026). No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta build concreta.
- Latencia y throughput: no disponibles.
- Nota de calidad: Qwen-Image-2.1 es un modelo completo (no destilado); el autor recomienda unos 20-30 pasos de muestreo, ya que configuraciones de pocos pasos o tipo turbo producen resultados blandos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Esta build (INT8 convrot) | 8,8B | 262.144 tokens | safetensors INT8, 8,71 GB | Apache-2.0 | Formato identico a la plantilla oficial de Comfy-Org |
| `Qwen-Image-2.1-Text-Encoder-Heretic` (bf16) | 8,8B | 262.144 tokens | safetensors bf16, ~17 GB | Apache-2.0 | Fuente de esta build; maxima fidelidad, mayor VRAM |
| `Qwen-Image-2.1-Text-Encoder-Heretic-W4A8` | 8,8B | 262.144 tokens | safetensors, 6,3 GB | Apache-2.0 | Mas ligero, menor fidelidad a la plantilla oficial |
| `Qwen-Image-2.1-Text-Encoder-Heretic-GGUF` | 8,8B | 262.144 tokens | GGUF Q8_0 / Q6_K / Q4_K_M | Apache-2.0 | Compatible con ComfyUI-GGUF; soporte Metal en Apple Silicon |
| `pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-NVFP4` | 8,8B | 262.144 tokens | NVFP4 | Apache-2.0 | Variante de cuantizacion para hardware compatible |
| `Qwen/Qwen3-VL-8B-Instruct` (stock) | 8,8B | 262.144 tokens | safetensors bf16 | Apache-2.0 | Modelo base sin ablacion; rechaza 100/100 en la evaluacion |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Eliminacion deliberada de rechazos: el modelo es una derivacion abliterada que reduce los rechazos de 100/100 a 5/100. Esto implica que puede generar contenido que el modelo base rechazaria, con implicaciones eticas y de cumplimiento normativo en entornos de produccion.
- Naturaleza derivada no oficial: el autor declara explicitamente que no esta afiliado ni respaldado por Alibaba ni Qwen. Es una derivacion de comunidad.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; al heredar el modelo base, se asumen los sesgos de Qwen3-VL-8B-Instruct.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. La divergencia KL de 0,0220 respecto al stock da una medida de deriva, pero no de alucinacion.
- Idiomas soportados: no disponibles en la ficha del repositorio.
- Restricciones de licencia: Apache-2.0, lo que permite uso comercial, pero se debe respetar el archivo `LICENSE` y `NOTICE` del repositorio y la licencia del modelo base.
- Dependencia de version de ComfyUI: requiere una build con soporte `QwenImage21` (fusionado despues del 14 de septiembre de 2026); versiones anteriores no cargaran el modelo correctamente.
- Sin aceleracion en Apple Silicon por usar nucleos CUDA; en Mac hay que recurrir a la build GGUF.
- Trampas de cuantizacion documentadas por el autor: cuantizar el vision tower, omitir `convrot=True` o no remapear las claves produce archivos que parecen validos pero generan ruido. Solo se detectan comparando contra la release oficial o ejecutando el modelo.
- Descargas y likes nulos en el momento de la consulta, lo que limita la validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-int8-convrot
- Modelo base (bf16 fuente): https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic
- Build GGUF del text encoder: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-GGUF
- Build W4A8: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-W4A8
- Build NVFP4: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-NVFP4
- DiT GGUF: https://huggingface.co/pottokao/Qwen-Image-2.1-DiT-GGUF
- PE-T2I GGUF: https://huggingface.co/pottokao/Qwen-Image-2.1-PE-T2I-Heretic-GGUF
- Modelo original del text encoder: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Repositorio de Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- Blog oficial de Qwen-Image-2.1: https://qwen.ai/blog?id=qwen-image-2.1
- Heretic (herramienta de ablacion): https://github.com/p-e-w/heretic
- Ficha de referencia externa: https://savrn.com/models/qwen-image-2-1-text-encoder-heretic
- Espejo con notas sobre GGUF / FP8 / bf16: https://ai.atomgit.com/hf_mirrors/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-GGUF
