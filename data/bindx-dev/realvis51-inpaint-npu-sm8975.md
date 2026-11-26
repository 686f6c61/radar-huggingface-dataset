# bindx-dev/realvis51-inpaint-npu-sm8975

## Resumen

Realvis51-inpaint-npu-sm8975 es un paquete de binarios de contexto compilados AOT (Ahead-Of-Time) para la NPU Hexagon de Qualcomm, derivado del modelo de difusion Stable Diffusion 1.5 `Uminosachi/realisticVisionV51_v51VAE-inpainting`. Lo publica el usuario `bindx-dev` bajo la herramienta BindX QAIRT 2.52.1.261105, y su proposito no es servir como modelo en formato convencional (safetensors o GGUF), sino como artefacto de despliegue listo para ejecutarse en el acelerador neuronal de un SoC concreto: el SM8975 (Snapdragon 8 Elite Extreme Gen 6, Hexagon HTP v85).

El modelo resuelve un problema muy especifico: llevar inpainting e image-to-image de Stable Diffusion a un dispositivo movil con NPU Qualcomm sin necesidad de conversion en el dispositivo. Los cuatro subgrafos del pipeline (text encoder, UNet, VAE encoder y VAE decoder) se entregan como grafos EPContext de ONNX Runtime para el Execution Provider QNN, en FP16 y con 9 canales de entrada para inpainting.

Es relevante porque demuestra el flujo de compilacion AOT para HTP v85 y publica una medicion de rendimiento verificada (10 pasos, img2img 0.65, 6 pasos de CFG activos): 1,53 s de UNet en NPU, 140 ms de VAE encoder, 129 ms de VAE decoder y 2,34 GB de memoria maxima (HWM). El repositorio ocupa 2,2 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet + VAE + text encoder CLIP), compilada como grafos EPContext ONNX Runtime QNN |
| Parametros totales | no disponible (heredados del modelo base SD 1.5; no se detalla el desglose) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (tokenizador CLIP de SD 1.5, 77 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | FP16 (grafos EPContext QNN); no se documentan otras precisiones |
| Idiomas soportados | no disponible (el prompt de texto depende del text encoder CLIP del modelo base) |
| Licencia | CreativeML OpenRAIL-M (heredada del modelo base) |
| Formato de pesos | binarios `.bin` de contexto QNN (EPContext de ORT-QNN); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo nuevo: es una conversion AOT de los pesos de `Uminosachi/realisticVisionV51_v51VAE-inpainting`, un fine-tune de Stable Diffusion 1.5 orientado a inpainting realista. La cadena incluye cuatro grafos EPContext: `text_encoder_npu`, `unet`, `vae_encoder_npu` y `vae_decoder_npu`, todos en FP16 y compilados con BindX QAIRT 2.52.1.261105 para el HTP v85 del SM8975.

La innovacion tecnica esta en el despliegue, no en el entrenamiento: la compilacion AOT elimina la fase de compilacion en el dispositivo, que en NPUs Hexagon suele ser costosa, y entrega grafos listos para el Execution Provider QNN de ONNX Runtime. El pipeline soporta inpainting de 9 canales (imagen + mascara) e image-to-image. No se documentan datos de entrenamiento, tokens, composicion del dataset ni etapas de RLHF/DPO, ya que corresponden al modelo base y no se detallan en la model card.

## Capacidades

- Inpainting de imagenes: relleno de regiones enmascaradas con coherencia visual, mediante el UNet de 9 canales.
- Image-to-image: transformacion de una imagen de entrada guiada por prompt de texto, con fuerza configurable (el benchmark usa 0.65).
- Generacion texto-a-imagen: el pipeline SD 1.5 subyacente lo permite, aunque la model card se centra en inpainting e img2img.
- Ejecucion en NPU Hexagon: los cuatro subgrafos se ejecutan en el acelerador neuronal del SM8975 mediante ORT-QNN EPContext.
- Aceleracion por pasos de difusion: el benchmark documenta 10 pasos con 6 pasos de CFG activos.
- No se documentan tool calling, function calling, agentes, razonamiento multi-paso, vision adicional, audio ni modo thinking; son capacidades ajenas a un modelo de difusion de este tipo.

## Casos de uso

- Edicion fotografica en movil: eliminar objetos o personas de una foto y rellenar la zona con contenido coherente, ejecutando el UNet en la NPU en torno a 1,53 s por iteracion de 10 pasos.
- Retoque de producto en apps de e-commerce: sustituir fondos o corregir imperfecciones con image-to-image a 0.65 de fuerza, manteniendo la estructura del original.
- Restauracion de fotos antiguas: rellenar rasgaduras y zonas danadas mediante mascara de inpainting, con el VAE decoder en NPU a 129 ms.
- Prototipado de pipelines de difusion en dispositivos Snapdragon: validar el flujo ORT-QNN EPContext con un modelo ya compilado antes de portar otros checkpoints.
- Aplicaciones de realidad aumentada: generacion de contenido en tiempo real sobre la camara, aprovechando la baja latencia del UNet en NPU y la memoria maxima de 2,34 GB.
- Demos de investigacion sobre NPUs moviles: comparar el rendimiento AOT frente a ejecucion en CPU/GPU en el mismo SoC SM8975.
- Integracion en apps Android con ONNX Runtime: cargar los grafos EPContext y orquestar el pipeline de inpainting sin compilacion en el dispositivo.

## Benchmarks y rendimiento

Medicion verificada QDC del 2026-11-25, con 10 pasos, img2img 0.65 y 6 pasos de CFG activos:

| Componente | Tiempo |
|---|---|
| UNet en NPU | 1,53 s |
| VAE encoder | 140 ms |
| VAE decoder | 129 ms |
| Memoria maxima (HWM) | 2,34 GB |

No se han publicado resultados de benchmarks de calidad (FID, CLIP score, MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- NPU objetivo: Hexagon HTP v85 del SoC SM8975 (Snapdragon 8 Elite Extreme Gen 6). Los binarios estan compilados AOT para esa arquitectura y no son portables a otras.
- Memoria: 2,34 GB de HWM medidos en el benchmark; se recomienda margen adicional para el resto del pipeline y la aplicacion.
- VRAM de GPU: no aplica; el artefacto esta pensado para ejecucion en NPU movil, no en GPU de escritorio.
- GPU de escritorio: no disponible; no se documenta ejecucion en A100, H100 ni RTX 4090.
- Despliegue: ONNX Runtime con Execution Provider QNN y BindX QAIRT 2.52.1.261105; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusion).
- Latencia: UNet 1,53 s, VAE encoder 140 ms y VAE decoder 129 ms por el benchmark de 10 pasos; no se documenta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| realvis51-inpaint-npu-sm8975 | no disponible (SD 1.5) | no disponible | UNet 1,53 s en NPU SM8975 | CreativeML OpenRAIL-M | Hugging Face, 0 descargas |
| Uminosachi/realisticVisionV51_v51VAE-inpainting | no disponible (SD 1.5) | no disponible | no disponible | CreativeML OpenRAIL-M | Hugging Face (modelo base) |
| Stable Diffusion 1.5 inpainting (original) | no disponible | no disponible | no disponible | CreativeML OpenRAIL-M | Hugging Face |

No se dispone de datos de rendimiento de las alternativas en la informacion proporcionada; la comparativa se limita a licencia, origen y formato de despliegue.

## Limitaciones y advertencias

- Dependencia total del hardware: los binarios solo funcionan en SM8975 con HTP v85; no se ejecutan en otras NPUs, GPUs ni CPUs sin recompilacion.
- Formato no convencional: no es un checkpoint safetensors ni GGUF; requiere ONNX Runtime con EP QNN y la version de QAIRT indicada.
- Licencia CreativeML OpenRAIL-M: impone restricciones de uso (prohibicion de usos daninos y de ciertas aplicaciones); revisar los terminos antes de uso comercial.
- Sesgos y alucinacion visual: hereda los sesgos del modelo base SD 1.5 y puede generar contenido incoherente o artefactos en regiones enmascaradas grandes.
- Idiomas: no se documenta soporte multilingue del text encoder; los prompts dependen del CLIP del modelo base.
- Sin validacion de calidad: no hay benchmarks de fidelidad ni evaluaciones cualitativas publicadas.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin senales de adopcion ni mantenimiento.
- Contexto de texto: no se confirma la longitud de 77 tokens del tokenizador CLIP en esta publicacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bindx-dev/realvis51-inpaint-npu-sm8975
- Modelo base: https://huggingface.co/Uminosachi/realisticVisionV51_v51VAE-inpainting
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este artefacto.
