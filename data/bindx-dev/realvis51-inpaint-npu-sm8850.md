# bindx-dev/realvis51-inpaint-npu-sm8850

## Resumen

RealVis51-inpaint-npu-sm8850 es un paquete de binarios de contexto compilados AOT (ahead-of-time) para la NPU Hexagon HTP v81 de Qualcomm, derivado del modelo de difusion Stable Diffusion 1.5 `Uminosachi/realisticVisionV51_v51VAE-inpainting`. Lo publica el usuario `bindx-dev` bajo el paraguas de su herramienta BindX, usando el toolkit QAIRT `2.52.1.261105`. No es un modelo entrenado desde cero ni un fine-tune nuevo: es una conversion a formato ejecutable en NPU de unos pesos ya existentes, orientada a inferencia local en dispositivos moviles con el SoC Snapdragon 8 Elite Gen 5 (SM8850).

El problema que resuelve es concreto: ejecutar inpainting e image-to-image de Stable Diffusion 1.5 sobre la NPU Hexagon de un telefono Android de ultima generacion, en lugar de sobre CPU o GPU integrada. El repositorio contiene cuatro grafos ORT-QNN EPContext en FP16 con 9 canales de entrada: `text_encoder_npu`, `unet`, `vae_encoder_npu` y `vae_decoder_npu`. El tamano del repo es de 2,2 GB.

Su relevancia es acotada pero clara para quien desarrolle aplicaciones de edicion de imagen generativa en Android: ofrece artefactos listos para desplegar en un SoC especifico, con un benchmark verificado por el autor. No hay informacion sobre parametros, contexto textual ni idiomas porque el modelo base es un modelo de difusion de imagen, no un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet + VAE + text encoder), convertida a grafos ORT-QNN EPContext |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); el text encoder usa el contexto textual estandar de SD 1.5, no disponible en la informacion |
| Tipos de cuantizacion | FP16 (grafos ORT-QNN EPContext) |
| Idiomas soportados | no disponible (prompts de texto en el text encoder de SD 1.5) |
| Licencia | CreativeML OpenRAIL-M (heredada del modelo base) |
| Formato de pesos | binarios `.bin` de contexto QNN/Hexagon (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Stable Diffusion 1.5 en su variante de inpainting con 9 canales de entrada, es decir, UNet latente con atencion cruzada sobre embeddings de texto, mas un VAE encoder y decoder y un text encoder. Sobre esa base, el autor no ha reentrenado nada: ha compilado los pesos originales de `Uminosachi/realisticVisionV51_v51VAE-inpainting` con QAIRT `2.52.1.261105` para generar binarios de contexto ejecutables en la NPU Hexagon HTP v81 del SM8850. Los cuatro grafos resultantes (`text_encoder_npu`, `unet`, `vae_encoder_npu`, `vae_decoder_npu`) se ejecutan mediante el Execution Provider QNN de ONNX Runtime.

No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens o pasos, ni sobre si hubo RLHF, DPO o tecnicas de alineacion. Tampoco se documentan innovaciones de decodificacion especulativa ni mecanismos de atencion alternativos. La unica innovacion tecnica destacable es la propia conversion AOT a un backend NPU concreto, que permite descargar el trabajo de inferencia de la CPU/GPU del telefono a la NPU Hexagon.

## Capacidades

- Inpainting de imagenes: relleno de regiones enmascaradas con contenido coherente, usando grafos de 9 canales.
- Image-to-image: transformacion de una imagen de entrada guiada por prompt, con fuerza de denoising configurable.
- Generacion de imagen realista: el modelo base realisticVision V5.1 esta orientado a fotografia realista.
- Ejecucion en NPU Hexagon: los cuatro componentes del pipeline (text encoder, UNet, VAE encoder y decoder) tienen su propio grafo compilado.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- Capacidades multilingues: no documentadas; dependen del text encoder de SD 1.5 incluido en la conversion.
- No dispone de modo thinking, vision general ni audio.

## Casos de uso

- Edicion fotografica en aplicaciones Android: eliminar objetos no deseados de una foto mediante mascara e inpainting, ejecutando la UNet en la NPU del Snapdragon 8 Elite Gen 5 con una latencia de UNet de 2,05 s por iteracion de 10 pasos.
- Retoque de retratos en el dispositivo: corregir imperfecciones o rellenar zonas ocluidas sin enviar la imagen a un servidor, lo que reduce latencia y preserva la privacidad del usuario.
- Restauracion de fotos antiguas o danadas: rellenar rasguños y zonas perdidas mediante inpainting con mascaras generadas por el usuario o por un detector previo.
- Prototipado de pipelines de difusion en movil: usar los binarios como referencia para medir el rendimiento real de QNN EP en HTP v81 antes de portar otros modelos de difusion.
- Aplicaciones de realidad aumentada o captura de camara: image-to-image en tiempo casi real con 0,65 de fuerza img2img, adecuado para estilizado o limpieza de fotogramas.
- Demos y validacion de hardware: verificar el consumo de memoria del pipeline completo, con un HWM medido de 2,93 GB, antes de comprometerse con un diseno de producto en SM8850.
- Generacion de variaciones controladas: usar img2img con prompts para producir alternativas de una imagen manteniendo la composicion original.

## Benchmarks y rendimiento

El autor publica un benchmark verificado en QDC con fecha 2026-11-25, con 10 pasos, fuerza img2img de 0,65 y 6 pasos de CFG activos:

| Componente | Tiempo |
|---|---|
| UNet en NPU | 2,05 s |
| VAE encoder | 173 ms |
| VAE decoder | 176 ms |
| HWM (memoria maxima) | 2,93 GB |

No se han publicado resultados de benchmarks comparativos con otros modelos (FID, CLIP score, etc.) en la informacion disponible.

## Requisitos de hardware

- SoC objetivo: Qualcomm Snapdragon 8 Elite Gen 5 (SM8850), NPU Hexagon HTP v81. Los binarios no son portables a otras generaciones de Hexagon ni a otros SoC sin recompilacion.
- Toolkit: QAIRT `2.52.1.261105` y ONNX Runtime con el Execution Provider QNN.
- Memoria: el benchmark reporta un HWM de 2,93 GB, por lo que el dispositivo debe disponer de al menos esa cantidad de memoria disponible para el pipeline.
- VRAM estimada en GPU de escritorio: no disponible; los binarios estan compilados para NPU Hexagon y no se ejecutan en CUDA.
- GPU recomendadas: no aplica; no hay version para A100, H100 ni RTX 4090 en este repositorio.
- Cabe en GPU de consumo: no aplica en el formato publicado.
- Opciones de despliegue: ONNX Runtime con QNN EP en Android; no hay artefactos para vLLM, llama.cpp, Ollama ni TGI, que ademas no son adecuados para un modelo de difusion.
- Latencia y throughput: segun el benchmark del autor, 2,05 s de UNet, 173 ms de VAE encoder y 176 ms de VAE decoder para 10 pasos.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| realvis51-inpaint-npu-sm8850 | SD 1.5 inpainting compilado | binarios QNN/Hexagon | Snapdragon 8 Elite Gen 5 (SM8850) | CreativeML OpenRAIL-M | Hugging Face |
| Uminosachi/realisticVisionV51_v51VAE-inpainting | SD 1.5 inpainting original | safetensors/diffusers | GPU generica | CreativeML OpenRAIL-M | Hugging Face |
| Otras conversiones QNN de SD 1.5 para Hexagon | SD 1.5 compilado | binarios QNN | otras generaciones de Snapdragon | variable | no disponible |
| Stable Diffusion 1.5 inpainting oficial | SD 1.5 inpainting | safetensors/diffusers | GPU generica | CreativeML OpenRAIL-M | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia estricta de hardware: los binarios solo funcionan en SM8850 con HTP v81 y QAIRT `2.52.1.261105`; cualquier otro SoC o version de toolkit requiere recompilacion.
- Licencia CreativeML OpenRAIL-M: impone restricciones de uso, incluidas limitaciones sobre usos daninos y ciertos requisitos de atribucion; conviene revisar el texto completo antes de un uso comercial.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar contenido incoherente o no fiel a la imagen original, especialmente en zonas grandes enmascaradas.
- Sesgos del modelo base: realisticVision V5.1 puede reproducir sesgos de representacion de personas y estilos presentes en sus datos de entrenamiento; no se documentan evaluaciones de sesgo.
- Idiomas: no hay informacion sobre el soporte multilingue de los prompts; se asume el comportamiento del text encoder de SD 1.5.
- Sin garantias de produccion: el repositorio tiene cero descargas y cero likes en el momento de la consulta, y no se documentan pruebas fuera del benchmark del autor.
- Memoria: un HWM de 2,93 GB puede ser problematico en dispositivos con poca memoria libre o con otras aplicaciones en primer plano.
- No es un modelo de lenguaje: no debe evaluarse con criterios de MMLU, HumanEval o GSM8K.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bindx-dev/realvis51-inpaint-npu-sm8850
- Modelo base: https://huggingface.co/Uminosachi/realisticVisionV51_v51VAE-inpainting
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
