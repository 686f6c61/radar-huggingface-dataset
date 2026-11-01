# imagingforgood/mi-gan-512-onnx

## Resumen

MI-GAN 512 (Places2) en formato ONNX es una réplica sin modificaciones del archivo `migan.onnx` publicado por el primer autor del modelo original, Andranik Sargsyan, y redistribuido por Imaging for Good para que su proyecto browser-perception pueda depender de él. El modelo subyacente es MI-GAN, desarrollado por Picsart AI Research y presentado en el paper *MI-GAN: A Simple Baseline for Image Inpainting on Mobile Devices* (ICCV 2023). Resuelve tareas de inpainting de imágenes y eliminación de objetos: recibe una imagen RGB y una máscara binaria y devuelve la imagen con las regiones enmascaradas reconstruidas.

La relevancia de esta ficha no está en el modelo en sí, sino en su empaquetado: un único archivo ONNX de 29.546.882 bytes (aproximadamente 28,2 MiB) pensado para ejecutarse con onnxruntime-web en el navegador. Esto lo convierte en una opción práctica para aplicaciones web de edición de imágenes sin backend, con un coste de descarga y de inferencia muy contenido.

La arquitectura es una GAN de inpainting optimizada para dispositivos móviles, con un contrato de entrada y salida explícito y sin dependencias de frameworks de deep learning pesados. La licencia del código y de los pesos es MIT, aunque el entrenamiento se realizó sobre Places2, cuyos términos de uso son de investigación y educación no comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GAN para inpainting de imágenes (MI-GAN, optimizada para móviles) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | no disponible (se distribuye un único archivo ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de imagen, sin capacidades lingüísticas) |
| Licencia | MIT (código y pesos, según LICENSE-WEIGHTS de MI-GAN) |
| Formato de pesos | ONNX (`migan.onnx`, 29.546.882 bytes, SHA-256 `593eba0b7e04730f1b61c0a3cbca68d97d8d6a7ff5c6a44a7b9d7fcd880fc5ae`) |

## Arquitectura y entrenamiento

MI-GAN es una red generativa adversarial diseñada específicamente para inpainting en dispositivos móviles, con el objetivo de reducir el coste computacional frente a alternativas basadas en transformers o difusión. El modelo trabaja internamente a una resolución de 512×512, independientemente del tamaño de la imagen de entrada, y produce una salida del mismo tamaño que la entrada, conservando los píxeles no enmascarados del original. No se dispone en la información proporcionada de detalles sobre el número de capas, el discriminador utilizado ni el esquema exacto de pérdidas.

El entrenamiento se realizó sobre el conjunto de datos Places2. No se documentan en la información disponible el número de tokens o imágenes de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de refinamiento posteriores como RLHF o DPO (no aplicables en este dominio). La innovación principal del trabajo es la simplicidad y eficiencia del diseño, orientado a inferencia en el navegador mediante onnxruntime-web.

## Capacidades

- Inpainting de imágenes: rellena regiones enmascaradas con contenido visual coherente con el contexto.
- Eliminación de objetos: al marcar un objeto con la máscara, el modelo reconstruye el fondo subyacente.
- Entrada de tamaño arbitrario: acepta imágenes de cualquier resolución y las procesa internamente a 512×512.
- Contrato de máscara explícito: `255 = conservar`, `0 = rellenar`, lo que simplifica la integración.
- Preservación de píxeles originales: la salida mantiene intactas las zonas no enmascaradas.
- Ejecución en navegador: compatible con onnxruntime-web, sin necesidad de backend.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües, al ser un modelo puramente de visión.

## Casos de uso

- Eliminación de objetos en aplicaciones web de edición fotográfica: el usuario pinta una máscara sobre el objeto no deseado y el modelo, ejecutado en el navegador con onnxruntime-web, devuelve la imagen con el fondo reconstruido sin enviar datos a un servidor.
- Retoque de fotos en herramientas de consumo: integración en editores ligeros que necesitan una función de borrado mágico con un archivo de menos de 30 MB, adecuado para conexiones lentas.
- Limpieza de marcas de agua o artefactos en imágenes de archivo: enmascarado de las zonas afectadas y reconstrucción del contenido subyacente en flujos de digitalización.
- Preprocesado en pipelines de visión por computador: eliminación de elementos distractores antes de tareas de detección o segmentación posteriores.
- Prototipado rápido de investigación en inpainting: al ser un ONNX autocontenido, permite evaluar la técnica de MI-GAN sin montar el entorno de entrenamiento original.
- Aplicaciones de privacidad: ocultación de rostros, matrículas o textos sensibles sustituyéndolos por contenido generado coherente con el entorno, en lugar de simples difuminados.
- Demos educativas de GANs en el navegador: ejemplo práctico de inferencia ONNX en cliente para cursos y talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el archivo ONNX ocupa aproximadamente 28,2 MiB, por lo que la huella de memoria es muy reducida y compatible con GPUs integradas.
- GPU recomendadas: cualquier GPU con soporte de WebGL/WebGPU para onnxruntime-web; en servidor, GPUs de gama baja o media son suficientes.
- Cabe en GPU de consumo: sí, con amplio margen, dado el tamaño del modelo.
- Opciones de despliegue: onnxruntime-web (navegador), ONNX Runtime (CPU/GPU en servidor), y cualquier runtime compatible con ONNX.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MI-GAN 512 (este) | no disponible | no aplica | GAN para inpainting móvil | MIT | ONNX en HuggingFace |
| LaMa | no disponible | no aplica | Inpainting basado en transformers | no disponible | Repositorio público |
| Stable Diffusion Inpainting | no disponible | no aplica | Difusión latente | no disponible | Pesos públicos |

No se dispone en la información proporcionada de datos comparativos de rendimiento entre estos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre Places2, puede heredar los sesgos de composición y escenas de ese dataset.
- Riesgo de alucinación: como modelo generativo, puede producir contenido visual plausible pero incorrecto en las regiones enmascaradas, especialmente con máscaras grandes o contextos ambiguos.
- Limitaciones de resolución: el procesamiento interno es a 512×512, por lo que imágenes de alta resolución pueden perder detalle en la zona reconstruida.
- Restricciones de licencia: aunque el código y los pesos son MIT, Places2 tiene términos de uso para investigación y educación no comercial; conviene verificar que el uso previsto sea compatible con esos términos.
- Caveat para producción: el modelo se distribuye como copia sin modificaciones y sin garantías por parte del redistribuidor; no se documentan procesos de validación adicionales.
- No apto para tareas de texto, razonamiento o agentes.

## Enlaces

- HuggingFace: https://huggingface.co/imagingforgood/mi-gan-512-onnx
- Repositorio original de MI-GAN: https://github.com/Picsart-AI-Research/MI-GAN
- Paper (ICCV 2023): https://openaccess.thecvf.com/content/ICCV2023/papers/Sargsyan_MI-GAN_A_Simple_Baseline_for_Image_Inpainting_on_Mobile_Devices_ICCV_2023_paper.pdf
- Pesos originales: https://huggingface.co/andraniksargsyan/migan
- Proyecto browser-perception: https://imagingforgood.github.io/browser-perception/
- Places2: http://places2.csail.mit.edu/
- Licencia de pesos: https://github.com/Picsart-AI-Research/MI-GAN/blob/main/LICENSE-WEIGHTS
