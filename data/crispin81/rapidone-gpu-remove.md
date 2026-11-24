# crispin81/rapidone-gpu-remove

## Resumen

RapidOne GPU Remove es un modelo de eliminación de objetos (object removal) e inpainting derivado de FLUX.2 [klein] 4B, el modelo de generación de imágenes de Black Forest Labs publicado bajo licencia Apache-2.0. El autor, crispin81 (Chris Cork), ha fusionado en los pesos del transformer el LoRA de eliminación de objetos de fal (`fal/flux-2-klein-4B-object-remove-lora`) a escala 1.0 y ha exportado el conjunto a formato ONNX con cuantización de 8 bits en las matrices MatMul, pensado para ejecutarse en GPU de consumo mediante ONNX Runtime.

El modelo no es un checkpoint de propósito general: forma parte del editor de fotos RAW RapidOne como motor del modo "GPU (Smarter) Remove", que se descarga bajo demanda y se ejecuta con WebGPU, DirectML o CoreML. Para eliminar un objeto, el usuario pinta la zona a borrar en gris plano y el modelo reconstruye el fondo circundante de forma coherente en luz, color, perspectiva, enfoque y grano, sin añadir objetos nuevos.

La relevancia técnica está en el empaquetado: elimina la necesidad de cargar el text encoder en tiempo de inferencia (la instrucción de eliminación está precalculada como tensor `remove_prompt.f32` de 512 x 7680 en float32) y reduce el transformer a unos 4,16 GB en fp16 con pesos MatMul a 8 bits, lo que permite inferencia local en tarjetas gráficas de consumo con 4 pasos de flow-matching.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (flow matching) FLUX.2 [klein] 4B, exportado a ONNX con atención fusionada (`com.microsoft::MultiHeadAttention`) |
| Parametros totales | 4B (modelo base FLUX.2 [klein] 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; entrada condicionada por prompt fijo y máscara) |
| Tipos de cuantizacion | MatMul a 8 bits (`MatMulNBits`) en el transformer; fp16 en transformer, VAE encoder y VAE decoder; prompt precalculado en float32 |
| Idiomas soportados | no disponible (el prompt de instrucción es fijo en inglés y no se usa text encoder en inferencia) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`transformer.onnx` + `transformer.onnx.data`, `vae_encoder.onnx`, `vae_decoder.onnx`, `remove_prompt.f32`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de FLUX.2 [klein] 4B de Black Forest Labs, un transformer de difusión con formulación de flow matching. Sobre ese base se ha fusionado el LoRA de eliminación de objetos de fal a escala 1.0 directamente en los pesos del transformer, de modo que el comportamiento de eliminación queda incorporado sin adaptadores separados. La exportación a ONNX se realizó con matemáticas fp16, cuantización de 8 bits en las matrices MatMul (`MatMulNBits`) y fusión de la atención en el operador `com.microsoft::MultiHeadAttention` para acelerar la ejecución en ONNX Runtime.

Un detalle de diseño clave es la eliminación del text encoder en tiempo de inferencia: la salida del encoder de texto para una instrucción fija de eliminación se almacena como tensor `remove_prompt.f32` (512 x 7680, float32, little-endian). La instrucción pide eliminar la forma gris plana y continuar la escena circundante de forma natural, sin añadir objetos, personas, carteles ni texto, y manteniendo el resto del encuadre. El muestreo emplea 4 pasos de flow-matching, igual que `Flux2KleinPipeline` de diffusers. No se dispone de información sobre el dataset de entrenamiento original ni sobre el proceso de RLHF/DPO del modelo base en la documentación proporcionada.

## Capacidades

- Eliminación de objetos e inpainting: reconstruye el fondo tras eliminar una región pintada en gris plano, manteniendo luz, color, perspectiva, enfoque y grano.
- Edición image-to-image condicionada por máscara (la zona a borrar se indica pintándola de gris plano).
- Inferencia sin text encoder: usa un prompt precalculado fijo, lo que reduce el coste de carga y memoria.
- Ejecución en GPU local mediante ONNX Runtime con WebGPU, DirectML o CoreML.
- Muestreo rápido: 4 pasos de flow-matching.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multimodales de texto; es exclusivamente un modelo de imagen.
- Capacidades multilingües: no aplicables (sin text encoder en inferencia).

## Casos de uso

- Retoque fotográfico RAW en RapidOne: el modelo es el motor del modo "GPU (Smarter) Remove" del editor; el usuario pinta el objeto y el modelo rellena el fondo con coherencia de grano y exposición, adecuado porque el VAE y el transformer están exportados en fp16 para GPU de consumo.
- Eliminación de objetos no deseados en fotografía de producto: quitar cables, etiquetas o elementos de atrezo pintándolos de gris y dejando que el modelo continúe la superficie, gracias a la instrucción fija que prohíbe añadir objetos nuevos.
- Limpieza de fondos en fotografía de retrato o inmobiliaria: borrar señales, muebles o personas del encuadre manteniendo la perspectiva, con 4 pasos de muestreo que permiten respuesta casi interactiva.
- Integración en pipelines de edición por lotes: al ser ONNX con pesos cuantizados a 8 bits y sin text encoder, se puede embeber en aplicaciones de escritorio o web (WebGPU) sin servidor dedicado.
- Prototipado de herramientas de inpainting en aplicaciones locales: sirve como referencia de exportación ONNX de un modelo FLUX.2 con LoRA fusionado para equipos que quieran replicar el flujo.
- Restauración de imágenes con elementos añadidos: eliminar marcas de agua, sellos o anotaciones planas y reconstruir la textura subyacente, siempre que la zona se pinte en gris plano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el transformer ocupa unos 4,16 GB en disco (`transformer.onnx.data`) con pesos MatMul a 8 bits; el VAE encoder y decoder suman unos 168 MB. En ejecución cabe en GPUs de consumo con 8 GB de VRAM o más, dependiendo del backend y de las activaciones.
- GPU recomendadas: tarjetas con soporte de WebGPU, DirectML o CoreML; no se especifican modelos concretos en la documentación.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores con 8 GB o más, aunque el autor no publica cifras de VRAM mínima exacta.
- Opciones de despliegue: ONNX Runtime (WebGPU, DirectML, CoreML); no está pensado para vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- Latencia y throughput: no disponibles; el autor solo indica 4 pasos de flow-matching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RapidOne GPU Remove (este) | 4B | prompt fijo + máscara | ONNX (fp16 + MatMul 8 bits) | Apache-2.0 | Hugging Face, integrado en RapidOne |
| black-forest-labs/FLUX.2-klein-4B | 4B | prompt de texto + imagen | safetensors/diffusers | Apache-2.0 | Hugging Face |
| fal/flux-2-klein-4B-object-remove-lora | LoRA sobre 4B | prompt de texto + imagen | LoRA (safetensors) | Apache-2.0 | Hugging Face |

La comparativa se limita a los modelos de los que deriva, ya que no se dispone de datos de benchmarks ni de alternativas de eliminación de objetos con los que contrastar rendimiento.

## Limitaciones y advertencias

- El modelo no está pensado para uso autónomo: el autor indica explícitamente que forma parte de RapidOne y que no debe usarse por separado.
- Prompt fijo: no acepta instrucciones de texto libres en tiempo de inferencia; solo funciona con la instrucción precalculada de eliminación.
- Requiere que la zona a eliminar se pinte en gris plano; no detecta objetos automáticamente.
- Riesgo de artefactos o alucinación visual en regiones complejas (texturas repetitivas, rostros, texto), aunque la instrucción prohíbe añadir objetos nuevos.
- Idiomas no disponibles: al no usar text encoder, no hay soporte multilingüe aplicable.
- Licencia Apache-2.0: permite uso comercial, pero se deben mantener los avisos de copyright de Black Forest Labs, fal y Chris Cork.
- No se han publicado métricas de calidad ni comparativas objetivas; la evaluación es cualitativa por parte del autor.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte de la comunidad no verificables.

## Enlaces

- Hugging Face: https://huggingface.co/crispin81/rapidone-gpu-remove
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- LoRA de eliminación de objetos: https://huggingface.co/fal/flux-2-klein-4B-object-remove-lora
- Repositorio RapidOne: https://github.com/crispin81/RapidOne
