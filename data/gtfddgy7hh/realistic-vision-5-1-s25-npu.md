# Gtfddgy7hh/realistic-vision-5.1-s25-npu

## Resumen

Realistic Vision 5.1 s25 NPU es una compilación on-device del modelo de difusión Realistic Vision 5.1, un fine-tune de Stable Diffusion 1.5 orientado a la generación de imágenes fotorrealistas. Lo publica el usuario Gtfddgy7hh como artefacto específico para el acelerador neuronal (NPU) del Qualcomm Snapdragon 8 Elite for Galaxy (SM8750, HTP v79), el SoC que monta el Samsung Galaxy S25 en su variante para Galaxy. El objetivo no es ofrecer un modelo nuevo, sino empaquetar el pipeline completo de inferencia (text encoder, UNet y VAE) en binarios QNN y wrappers ONNX Runtime EPContext que puedan ejecutarse íntegramente en el dispositivo sin depender de la nube.

El pipeline reproduce la arquitectura de Stable Diffusion 1.5: un text encoder CLIP de 768 dimensiones, una UNet que opera sobre latentes de 64x64x4 y un decodificador VAE que reconstruye imágenes de 512x512 píxeles. La compilación se ha realizado con Qualcomm AI Hub (QAIRT 2.50) en precisión fp16, y el autor reporta latencias medidas en un Galaxy S25 alojado: 178 ms para la UNet, 250 ms para el VAE y 2,4 ms para el text encoder por ejecución.

Su relevancia radica en que demuestra un flujo de despliegue de difusión en NPU móvil con cifras concretas de latencia y artefactos listos para integrarse mediante el QNN Execution Provider de ONNX Runtime. Para desarrolladores que trabajan en generación de imágenes offline, privacidad en el dispositivo o aplicaciones Android con aceleración Qualcomm, este repositorio sirve como referencia práctica, aunque con limitaciones claras de plataforma y de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet + CLIP text encoder + VAE), compilada para QNN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 77 tokens (secuencia de texto del CLIP) |
| Tipos de cuantizacion | fp16 (compilacion QAIRT 2.50); no se ofrecen otras variantes |
| Idiomas soportados | no disponible (el prompt CLIP de SD 1.5 esta entrenado predominantemente en ingles) |
| Licencia | CreativeML Open RAIL-M |
| Formato de pesos | binarios QNN (`.bin`) y wrappers ONNX Runtime EPContext (`.onnx`) |
| Resolucion de salida | 512x512 px |
| VAE | stabilityai/sd-vae-ft-mse (MIT) |
| Modelo base | SG161222/Realistic_Vision_V5.1_noVAE |
| Plataforma objetivo | Snapdragon 8 Elite for Galaxy (SM8750, HTP v79) |
| Tamano del repo | 2,1 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Realistic Vision 5.1, un fine-tune de Stable Diffusion 1.5 especializado en estética fotorrealista. La arquitectura es la clásica de SD 1.5: un text encoder CLIP que proyecta los tokens de prompt a embeddings de 768 dimensiones, una UNet difusora que predice el ruido sobre latentes de 64x64x4 y un VAE que decodifica el latente final a una imagen RGB de 512x512. En esta compilación el VAE es `stabilityai/sd-vae-ft-mse`, que incorpora el factor de escalado (÷0.18215) internamente. La model card no aporta detalles sobre el dataset de entrenamiento del fine-tune original, el número de tokens vistos ni si hubo etapas de RLHF o DPO.

La innovación de este artefacto no está en el entrenamiento sino en el despliegue: los tres componentes se han compilado con Qualcomm AI Hub (QAIRT 2.50) en fp16 para el HTP v79 del Snapdragon 8 Elite. Los ficheros `.onnx` son wrappers EPContext (`main_context=1`) que cargan el `.bin` correspondiente a través del QNN Execution Provider de ONNX Runtime, de modo que la inferencia completa se ejecuta en la NPU. Las interfaces de entrada/salida están fijadas: el text encoder consume tokens int32 de forma [1,77] y devuelve [1,77,768]; la UNet recibe latente NHWC [1,64,64,4], timestep [1,1] y embedding de texto [1,77,768]; el VAE transforma el latente en imagen [1,512,512,3] con valores en 0..1.

## Capacidades

- Generación de imágenes fotorrealistas a partir de prompts de texto, con resolución fija de 512x512 píxeles.
- Text-to-image completo en el dispositivo: los tres componentes (CLIP, UNet, VAE) se ejecutan en la NPU Qualcomm.
- Inferencia offline sin conexión a red, adecuada para escenarios de privacidad y baja latencia.
- Control de la generación mediante prompt de texto (hasta 77 tokens) y timestep de difusión.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de difusión, no un LLM.
- No dispone de modo thinking, visión de entrada, audio ni capacidades multimodales más allá del texto a imagen.
- El soporte multilingüe de prompts no está documentado y, por herencia de SD 1.5, el inglés es el idioma de facto.

## Casos de uso

- Generación de imágenes offline en apps Android: integración del pipeline en una aplicación para Galaxy S25 usando ONNX Runtime con QNN Execution Provider, permitiendo crear imágenes sin enviar prompts a servidores externos.
- Privacidad en creación de contenido: el usuario genera ilustraciones o retratos sin que el prompt ni la imagen salgan del dispositivo, útil en entornos sanitarios, legales o corporativos con requisitos de confidencialidad.
- Prototipado de funciones de cámara y galería: uso de la latencia reportada (178 ms UNet, 250 ms VAE) para estimar viabilidad de funciones de edición generativa en tiempo casi real dentro de apps de fotografía.
- Demostraciones de aceleración NPU: benchmark reproducible para comparar el rendimiento del HTP v79 frente a GPU o CPU en tareas de difusión, con cifras de referencia publicadas por el autor.
- Generación de avatares y contenido para apps de mensajería: imágenes de 512x512 suficientes para avatares y stickers, generadas localmente con un solo paso de prompt.
- Investigación en despliegue de difusión en móvil: base para estudiar cuantización, particionado de grafos y latencia de pipelines SD 1.5 en aceleradores Qualcomm.
- Creación de contenido para entornos sin conectividad: aplicaciones de campo, kioscos o dispositivos embebidos donde no hay red pero se requiere generación de imágenes.

## Benchmarks y rendimiento

La model card únicamente reporta latencias medidas en un Galaxy S25 alojado (perfil de Qualcomm AI Hub), no métricas de calidad de imagen (FID, CLIP score) ni comparaciones con otros modelos.

| Componente | Latencia por ejecucion |
|---|---|
| Text encoder (CLIP) | 2,4 ms |
| UNet | 178 ms |
| VAE decoder | 250 ms |

No se han publicado resultados de benchmarks de calidad (FID, CLIP score, MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- NPU Qualcomm Snapdragon 8 Elite for Galaxy (SM8750, HTP v79); la compilación está restringida a esta plataforma según la model card.
- No se indica compatibilidad con otras generaciones de Snapdragon ni con GPU o CPU genéricas; los binarios QNN están compilados para un HTP concreto.
- VRAM estimada para inferencia: no disponible; el modelo está pensado para memoria unificada de dispositivo móvil, no para GPU de escritorio.
- No cabe en GPU consumer en el formato distribuido (binarios QNN); para su uso en RTX 4090, A100 o H100 habría que recurrir al modelo base en safetensors y a otro runtime.
- Opciones de despliegue: ONNX Runtime con QNN Execution Provider en Android; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión compilado para NPU).
- Throughput estimado: con las latencias reportadas, el pipeline completo ronda los 430 ms por imagen de 512x512 en el hardware de referencia, sin contar el bucle de pasos de difusión adicionales que ejecutaría la UNet varias veces.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Formato | Licencia | Plataforma |
|---|---|---|---|---|---|
| Realistic Vision 5.1 s25 NPU (este) | no disponible | prompt 77 tokens, salida 512x512 | QNN `.bin` + ONNX EPContext | CreativeML Open RAIL-M | Snapdragon 8 Elite (HTP v79) |
| SG161222/Realistic_Vision_V5.1_noVAE | no disponible | prompt 77 tokens, salida 512x512 | safetensors (diffusers) | CreativeML Open RAIL-M | GPU/CPU genéricas |
| mfrashad/Realistic_Vision_V5.1 | no disponible | prompt 77 tokens, salida 512x512 | safetensors (diffusers) | CreativeML Open RAIL-M | GPU/CPU genéricas |

Las tres variantes comparten el mismo modelo de difusión subyacente; la diferencia está en el empaquetado y la plataforma de ejecución. No se dispone de datos de rendimiento comparativo entre ellas en la información proporcionada.

## Limitaciones y advertencias

- Plataforma cerrada: los binarios están compilados exclusivamente para Snapdragon 8 Elite for Galaxy (SM8750, HTP v79); no funcionarán en otros SoC, GPU o CPU sin recompilación.
- Licencia CreativeML Open RAIL-M con restricciones de uso (Attachment A); es obligatorio revisar los términos antes de uso comercial y respetar las prohibiciones de uso del modelo.
- Sesgos heredados de Stable Diffusion 1.5 y del fine-tune: posibles sesgos de género, etnia, edad y representación en las imágenes generadas.
- Riesgo de alucinación visual: el modelo puede generar anatomías incorrectas, texto ilegible o artefactos, especialmente en prompts ambiguos o poco representados.
- Idioma: el prompt está limitado a 77 tokens y el entrenamiento de SD 1.5 es predominantemente en inglés; el rendimiento con prompts en castellano no está documentado.
- Resolución fija de 512x512; no se documenta soporte para otras resoluciones ni para inpainting, img2img u otras tareas.
- Repositorio sin descargas ni likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- No se publican métricas de calidad de imagen (FID, CLIP score) ni comparativas frente al modelo base, por lo que la fidelidad respecto a Realistic Vision 5.1 no está cuantificada.
- El autor no documenta el proceso de cuantización más allá de indicar fp16, ni posibles degradaciones numéricas frente al modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Gtfddgy7hh/realistic-vision-5.1-s25-npu
- Modelo base: https://huggingface.co/SG161222/Realistic_Vision_V5.1_noVAE
- VAE utilizado: https://huggingface.co/stabilityai/sd-vae-ft-mse
- Licencia CreativeML Open RAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Espejo del modelo base: https://huggingface.co/mfrashad/Realistic_Vision_V5.1
- Qualcomm AI Hub (herramienta de compilación citada): no disponible en la información proporcionada como enlace directo.
