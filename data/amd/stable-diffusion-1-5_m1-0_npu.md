# amd/stable-diffusion-1.5_m1.0_npu

## Resumen

`amd/stable-diffusion-1.5_m1.0_npu` es una conversión a ONNX del modelo Stable Diffusion 1.5, publicada por AMD y optimizada para ejecución sobre las NPU de la plataforma Ryzen AI. El modelo base es Stable Diffusion 1.5, un modelo de difusión latente texto-a-imagen desarrollado originalmente por Stability AI y derivado de la familia Latent Diffusion (paper arXiv:2112.10752). AMD redistribuye los pesos en formato ONNX con cuantización específica para acelerar la inferencia en hardware con NPU integrada, en lugar de depender exclusivamente de GPU o CPU.

La relevancia de esta ficha radica en que traslada un modelo de generación de imágenes ampliamente conocido a un objetivo de despliegue distinto: PC con aceleradores neuronales integrados (Ryzen AI). Esto permite ejecutar generación texto-a-imagen en equipos de consumo sin una GPU dedicada de gama alta, a cambio de una resolución y un pipeline fijos heredados de SD 1.5 (512x512 píxeles nativos, codificador de texto CLIP ViT-L/14).

El repositorio tiene 13,9 GB y está sujeto a acceso restringido (gated) en Hugging Face, requiriendo aceptar condiciones. La licencia es CreativeML OpenRAIL-M, heredada del modelo original, con las obligaciones de uso que ello implica. No se dispone de datos publicados de benchmarks ni de métricas de latencia o throughput en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión latente (UNet + autoencoder VAE + codificador de texto CLIP), exportado a ONNX y cuantizado para NPU Ryzen AI |
| Parametros totales | no disponible (el modelo base SD 1.5 ronda los 860M en la UNet; el dato exacto de esta conversión no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el condicionamiento textual usa CLIP con límite de 77 tokens) |
| Tipos de cuantizacion | cuantización para NPU (el tipo exacto, p. ej. INT8, no se detalla en la información disponible) |
| Idiomas soportados | en (inglés) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | ONNX (repositorio de 13,9 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un modelo de difusión latente: un autoencoder variacional (VAE) comprime las imágenes a un espacio latente de menor dimensión, una UNet aprende a eliminar ruido en ese espacio latente de forma condicionada por el texto, y un codificador CLIP ViT-L/14 transforma el prompt en embeddings de condicionamiento. El muestreo se realiza típicamente con un scheduler DDIM o PNDM sobre latentes de 64x64 que el VAE decodifica a 512x512 píxeles.

Esta publicación concreta no entrena un modelo nuevo: es una conversión de ingeniería de los pesos de SD 1.5 a grafos ONNX y su cuantización para el stack de Ryzen AI, con el objetivo de que las operaciones del pipeline (encoder de texto, UNet y decoder VAE) se ejecuten sobre la NPU. No se dispone de información sobre el conjunto de datos de entrenamiento original más allá de lo publicado por Stability AI para SD 1.5, ni sobre procesos de RLHF o ajuste por preferencias en esta conversión.

## Capacidades

- Generación de imágenes a partir de prompts de texto en inglés (text-to-image).
- Pipeline de difusión latente estándar con resolución nativa de 512x512 píxeles.
- Condicionamiento textual mediante CLIP ViT-L/14, con prompts de hasta 77 tokens.
- Ejecución sobre NPU de Ryzen AI mediante grafos ONNX cuantizados.
- Compatibilidad con el ecosistema `diffusers` y con herramientas de conversión ONNX (según los tags del repositorio).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo generativo de imágenes, no un LLM.
- No se documenta soporte multilingüe más allá del inglés.
- No se documentan modos especiales como thinking, visión o audio.

## Casos de uso

- Generación de ilustraciones en local sobre PC con Ryzen AI: el modelo permite crear imágenes a partir de prompts en equipos sin GPU dedicada, aprovechando la NPU integrada para descargar la CPU.
- Prototipado rápido de conceptos visuales: con 512x512 nativo y un pipeline ligero, sirve para iterar sobre ideas de diseño antes de pasar a un modelo de mayor resolución.
- Creación de assets para aplicaciones y demos: generación de imágenes de relleno, iconos o fondos en entornos de desarrollo con hardware AMD.
- Pruebas de integración de pipelines ONNX en producción: útil para validar el stack de Ryzen AI y `diffusers` antes de desplegar modelos mayores.
- Educación y experimentación con modelos de difusión: al ser una conversión de un modelo de referencia bien documentado, facilita estudiar el pipeline completo en hardware de consumo.
- Automatización de contenido editorial en inglés: generación por lotes de imágenes ilustrativas para blogs o documentación, siempre con revisión humana por el riesgo de sesgos y alucinaciones visuales.
- Evaluación comparativa de aceleradores: permite medir el rendimiento de la NPU frente a CPU y GPU en una misma tarea de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 13,9 GB, aunque la inferencia cuantizada en NPU puede requerir menos memoria en tiempo de ejecución.
- Hardware objetivo: NPU de la plataforma AMD Ryzen AI (el tag `RyzenAI` indica la dependencia del stack de AMD).
- GPU recomendadas: no aplica como requisito principal; el modelo está orientado a NPU. Para ejecución en GPU se recomendaría el modelo SD 1.5 original en lugar de esta conversión.
- ¿Cabe en GPU de consumo? No es el objetivo de esta conversión; el modelo base SD 1.5 sí cabe en GPUs de consumo con cuantización, pero esta variante está pensada para NPU.
- Opciones de despliegue: ONNX Runtime con el proveedor de ejecución de Ryzen AI; integración con `diffusers` y herramientas ONNX. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusión de imágenes).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|
| amd/stable-diffusion-1.5_m1.0_npu | no disponible (base SD 1.5) | 512x512, prompt CLIP 77 tokens | creativeml-openrail-m | Gated en Hugging Face, orientado a NPU Ryzen AI |
| Stable Diffusion 1.5 (original) | ~860M en UNet | 512x512, prompt CLIP 77 tokens | creativeml-openrail-m | Público en Hugging Face, ejecutable en GPU/CPU |
| Stable Diffusion 2.1 | ~865M en UNet | 768x768, prompt CLIP 77 tokens | creativeml-openrail-m | Público en Hugging Face |
| SDXL | ~2.6B en UNet | 1024x1024, doble encoder de texto | creativeml-openrail-m | Público en Hugging Face |

La ventaja diferencial de esta conversión es el soporte de NPU Ryzen AI; en calidad de imagen y resolución es equivalente a SD 1.5, por debajo de SD 2.1 y SDXL en resolución nativa.

## Limitaciones y advertencias

- Hereda los sesgos de Stable Diffusion 1.5, entrenado principalmente con datos en inglés y con sesgos demográficos y culturales documentados en la literatura.
- Riesgo de alucinación visual: puede generar anatomías incorrectas, texto ilegible y composiciones incoherentes, especialmente con prompts complejos.
- Solo soporta inglés; los prompts en otros idiomas degradan la calidad del resultado.
- Resolución nativa limitada a 512x512; generar a resoluciones mayores sin upscaling produce artefactos.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (prohibición de usos dañinos descritos en la licencia); es necesario revisar sus términos antes de producción.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede complicar la automatización de descargas en CI/CD.
- Dependencia del stack de AMD Ryzen AI; la portabilidad a otros aceleradores no está garantizada.
- No hay métricas publicadas de latencia, throughput ni calidad (FID, CLIP score) para esta conversión concreta.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/amd/stable-diffusion-1.5_m1.0_npu
- Paper de Latent Diffusion: https://arxiv.org/abs/2112.10752
- Paper de CLIP: https://arxiv.org/abs/2103.00020
- Paper de SDXL (referencia comparativa): https://arxiv.org/abs/2205.11487
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Documentación de Ryzen AI: no disponible en la información proporcionada.
