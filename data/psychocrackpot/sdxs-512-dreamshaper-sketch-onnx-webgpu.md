# psychocrackpot/sdxs-512-dreamshaper-sketch-onnx-webgpu

## Resumen

Este repositorio contiene un grafo ONNX fusionado que combina el ControlNet de bocetos de `IDKiro/sdxs-512-dreamshaper-sketch` con la UNet de `IDKiro/sdxs-512-dreamshaper`, ambos modelos de difusion de un solo paso (SDXS) desarrollados por IDKiro. El resultado es un unico archivo `sdxs-sketch-fused-fp16.onnx` de aproximadamente 1 GB que, en una sola llamada a `InferenceSession.run`, transforma un dibujo de lineas junto con un embedding de texto CLIP en un latente denoizado listo para decodificar. El autor del empaquetado es el usuario `psychocrackpot`, que publica esta variante optimizada para ejecucion en navegador mediante WebGPU.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje ni de un modelo fundacional nuevo, sino de un artefacto de despliegue para inferencia de difusion en el cliente. Su interes tecnico esta en la fusion de ControlNet y UNet en un unico grafo ONNX con `conditioning_scale` como entrada en tiempo de ejecucion, lo que simplifica el pipeline y reduce el numero de sesiones de inferencia necesarias en el navegador. Esta pensado para acompanar al codificador de texto y al decodificador TAESD del repositorio `skillsafeai/sdxs-512-dreamshaper-onnx-webgpu`.

El modelo resuelve el problema de generar imagenes a partir de bocetos a lapiz en entornos sin GPU dedicada ni backend Python, es decir, directamente en el navegador con WebGPU. El repositorio tiene 2.0 GB, cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el 2 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente de un solo paso (SDXS) con ControlNet fusionado en la UNet; grafo ONNX estatico |
| Parametros totales | no disponible (el archivo ONNX fusionado ocupa 1.005.204.717 bytes en fp16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el texto se codifica con CLIP ViT-L/14 a 77 tokens) |
| Tipos de cuantizacion | fp16 (unico peso publicado); el grafo original se exporto en fp32 y se convirtio con `keep_io_types=True` |
| Idiomas soportados | no disponible (la entrada textual depende del codificador CLIP ViT-L/14, predominantemente ingles) |
| Licencia | openrail++ |
| Formato de pesos | ONNX (opset 17), un unico archivo `sdxs-sketch-fused-fp16.onnx` |

## Arquitectura y entrenamiento

La arquitectura subyacente es SDXS (Single-step Diffusion model with eXponential distillation, segun la denominacion del autor original), un modelo de difusion latente destilado para generar imagenes en un solo paso de denoising. Sobre esa base, el ControlNet de bocetos se fusiona con la UNet, de modo que los residuales del ControlNet se multiplican por `conditioning_scale` dentro del propio grafo, replicando lo que `StableDiffusionControlNetPipeline` hace externamente entre ambos modulos. La resolucion de trabajo es 512x512, con latentes de forma `[1, 4, 64, 64]` y condicionamiento de control `[1, 3, 512, 512]` en escala `[-1, 1]` con trazos oscuros sobre fondo claro.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o imagenes vistas, ni sobre procesos de RLHF o DPO, ya que el repositorio solo documenta la receta de exportacion. La innovacion tecnica destacable es la fusion de ambos modulos en un unico grafo ONNX con formas fijas y `conditioning_scale` como entrada dinamica, lo que permite ejecutar el pipeline completo con una sola sesion de inferencia. La validacion reportada por el autor indica `CosineSimilarity = 1.00000000` entre el grafo fp32 y PyTorch, y entre fp16 y fp32 un coseno de `1.00000012` con error absoluto maximo de `7.9e-4` para un RMS de salida de `1.00`.

## Capacidades

- Generacion de imagen a partir de bocetos a lapiz (sketch-to-image) en resolucion 512x512.
- Condicionamiento textual mediante embeddings CLIP ViT-L/14 de forma `[1, 77, 768]`.
- Control de intensidad del condicionamiento de boceto en tiempo de ejecucion mediante `conditioning_scale` en `[0, 1]` (el demo usa 0.8 por defecto).
- Inferencia en un solo paso de denoising (timestep fijo `999.0`), sin bucle de muestreo multiple.
- Ejecucion en navegador mediante ONNX Runtime Web con backend WebGPU.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de difusion de imagen, no un modelo de lenguaje.
- No dispone de modo thinking, vision de entrada ni audio.

## Casos de uso

- Herramienta de dibujo asistido en navegador: el usuario dibuja un boceto en un canvas HTML y el modelo lo convierte en imagen en un unico paso, sin backend Python ni GPU dedicada, gracias al grafo ONNX con WebGPU.
- Prototipado rapido de interfaces creativas: al ser un unico archivo ONNX de 1 GB con formas fijas, se puede integrar en demos web estaticas y desplegar en CDN sin infraestructura de servidor.
- Aplicaciones educativas de dibujo: permite mostrar en tiempo real como un trazo se transforma en una ilustracion, con control de fidelidad ajustable mediante `conditioning_scale`.
- Generacion de assets en herramientas de diseno colaborativo: el control de boceto a 512x512 es adecuado para wireframes y conceptos rapidos que luego se refinan en otra herramienta.
- Investigacion sobre inferencia de difusion en el cliente: sirve como banco de pruebas para medir latencia y consumo de memoria de SDXS con ControlNet fusionado en WebGPU frente a pipelines multi-sesion.
- Aplicaciones offline o con privacidad estricta: al ejecutarse integramente en el navegador, los bocetos del usuario no salen del dispositivo, lo que encaja en entornos con requisitos de privacidad.
- Demos de bajo coste en entornos sin GPU: al no requerir servidor de inferencia, se puede ofrecer una demo publica sin coste de computo en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo reportado es la validacion numerica de la exportacion: coseno de `1.00000000` entre fp32 y PyTorch, y coseno de `1.00000012` con error absoluto maximo de `7.9e-4` entre fp16 y fp32 sobre entradas con la misma semilla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el archivo fusionado en fp16 ocupa aproximadamente 1 GB, por lo que se puede estimar un consumo de memoria en el rango de 1 a 2 GB sumando activaciones y el codificador CLIP y el decodificador TAESD que se ejecutan aparte.
- GPU recomendadas: no disponible; el autor no especifica hardware objetivo mas alla de WebGPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; al ser un modelo de 512x512 y un solo paso, es plausible que quepa en GPUs integradas y de gama media con WebGPU, pero no hay mediciones publicadas.
- Opciones de despliegue: ONNX Runtime Web con WebGPU; el modelo esta pensado para ejecutarse junto al codificador de texto y el decodificador TAESD del repositorio `skillsafeai/sdxs-512-dreamshaper-onnx-webgpu`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Resolucion | Pasos | Formato | Licencia | Contexto textual |
|---|---|---|---|---|---|---|
| psychocrackpot/sdxs-512-dreamshaper-sketch-onnx-webgpu | SDXS + ControlNet fusionado, ONNX | 512x512 | 1 | ONNX fp16 | openrail++ | CLIP ViT-L/14, 77 tokens |
| IDKiro/sdxs-512-dreamshaper-sketch | SDXS + ControlNet original (PyTorch) | 512x512 | 1 | safetensors/diffusers | openrail++ | CLIP ViT-L/14, 77 tokens |
| IDKiro/sdxs-512-dreamshaper | SDXS texto-a-imagen (PyTorch) | 512x512 | 1 | safetensors/diffusers | openrail++ | CLIP ViT-L/14, 77 tokens |
| skillsafeai/sdxs-512-dreamshaper-onnx-webgpu | SDXS texto-a-imagen, ONNX para WebGPU | 512x512 | 1 | ONNX | no disponible en la informacion | CLIP ViT-L/14, 77 tokens |

La diferencia principal frente a los originales de IDKiro es el empaquetado: este repositorio fusiona ControlNet y UNet en un unico grafo ONNX fp16 con formas fijas y `conditioning_scale` como entrada, mientras que los originales se distribuyen como modulos separados en formato diffusers. Frente a la variante texto-a-imagen de `skillsafeai`, anade el condicionamiento por boceto y elimina una sesion de inferencia.

## Limitaciones y advertencias

- Modelo de un solo paso y resolucion fija de 512x512: no admite otras resoluciones ni pasos de muestreo sin reexportar el grafo.
- Formas de entrada estaticas: `sample`, `timestep`, `encoder_hidden_states`, `controlnet_cond` y `conditioning_scale` tienen dimensiones fijas, lo que impide lotes mayores de uno sin modificacion.
- Dependencia de componentes externos: requiere el codificador CLIP ViT-L/14 y el decodificador TAESD del repositorio `skillsafeai/sdxs-512-dreamshaper-onnx-webgpu` para completar el pipeline.
- Idiomas: no se documenta soporte multilingue; el codificador CLIP ViT-L/14 esta entrenado predominantemente en ingles.
- Riesgo de alucinacion visual y de artefactos propios de los modelos de difusion destilados a un paso, especialmente en bocetos ambiguos o con `conditioning_scale` bajo.
- Sesgos conocidos: no documentados en la informacion disponible; al derivar de DreamShaper y SDXS, hereda los sesgos de sus datos de entrenamiento, no detallados.
- Licencia OpenRAIL++: impone restricciones de uso (use restrictions) que afectan a aplicaciones comerciales y a determinados casos de uso prohibidos; es necesario revisar el texto de la licencia antes de desplegar en produccion.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso en produccion ni validacion independiente de la calidad de las imagenes generadas.
- El autor de la fusion (`psychocrackpot`) no es el autor original de los pesos base; la trazabilidad del artefacto depende de la receta de exportacion documentada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/psychocrackpot/sdxs-512-dreamshaper-sketch-onnx-webgpu
- Modelo base con ControlNet de bocetos: https://huggingface.co/IDKiro/sdxs-512-dreamshaper-sketch
- Modelo base texto-a-imagen: https://huggingface.co/IDKiro/sdxs-512-dreamshaper
- Repositorio ONNX para WebGPU con codificador de texto y decodificador TAESD: https://huggingface.co/skillsafeai/sdxs-512-dreamshaper-onnx-webgpu
