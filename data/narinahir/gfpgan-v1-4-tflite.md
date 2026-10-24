# NarinAhir/GFPGAN-v1.4-TFLite

## Resumen

GFPGAN-v1.4-TFLite es un reempaquetado del modelo de restauración facial GFPGAN v1.4 en formato TensorFlow Lite, publicado por NarinAhir a partir de `litert-community/GFPGAN-v1.4-LiteRT`. El objetivo concreto es que el archivo `gfpgan_fp16.tflite` pueda cargarse en runtimes antiguos de TensorFlow Lite (2.11–2.13), como el pod `TensorFlowLiteC` 2.12 de iOS, almacenando todos los buffers de pesos dentro del flatbuffer mediante `Buffer.offset`. El grafo y los pesos no se han modificado; la salida coincide con la del modelo original con una diferencia máxima de 2e-5.

El modelo resuelve restauración de caras degradadas en imágenes de 512×512 alineadas según FFHQ. La entrada es un tensor `[1,3,512,512]` en formato NCHW, RGB en el rango `[-1,1]`, y la salida mantiene la misma forma. Está pensado para inferencia on-device y se utiliza en la función AI Face Restore de la aplicación Pixfix.

Al tratarse de un modelo de imagen, no tiene ventana de contexto textual ni parámetros activos tipo MoE. La información disponible no detalla el número de parámetros, la composición del dataset de entrenamiento ni resultados de benchmarks. La licencia es Apache-2.0, siguiendo el modelo upstream de TencentARC.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GFPGAN v1.4, modelo de restauración facial imagen a imagen; no se detallan capas ni parámetros internos en la información proporcionada |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; entrada fija de 512×512) |
| Tipos de cuantización | fp16 (`gfpgan_fp16.tflite`); no se documentan int8 ni otras variantes |
| Idiomas soportados | no aplica (modelo de imagen); no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite flatbuffer con pesos inline; archivo `gfpgan_fp16.tflite` |
| Entrada | `[1,3,512,512]`, NCHW, RGB en `[-1,1]`; rostro alineado según FFHQ |
| Salida | `[1,3,512,512]`, misma codificación que la entrada |
| Resolución de trabajo | 512×512 |
| Modelo base | `litert-community/GFPGAN-v1.4-LiteRT`, revisión `c741afa` |
| Runtime compatible | TensorFlow Lite 2.11–2.13; iOS `TensorFlowLiteC` 2.12 |
| Tamaño del repositorio | 0.4 GB |
| SHA-256 | `3ba599349901e1061b2748909fea03e081dd8ac3d7c0a0c9b7b7165579470997` |

## Arquitectura y entrenamiento

La información disponible indica que se trata de GFPGAN v1.4, un modelo de restauración facial imagen a imagen. El repositorio no describe la arquitectura interna, el número de parámetros, la composición del dataset ni si hubo fases de entrenamiento con RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá del reempaquetado del archivo TFLite.

El cambio introducido por este repositorio es exclusivamente de formato: los buffers de pesos se almacenan dentro del flatbuffer en lugar de quedar después de él. Esto permite que runtimes antiguos de TensorFlow Lite carguen el modelo sin modificar el grafo ni los pesos. No se ha realizado un reentrenamiento ni un ajuste fino; la validación reportada es que la salida coincide con la del modelo original dentro de 2e-5.

## Capacidades

- Restauración de caras degradadas en imágenes de 512×512 alineadas según FFHQ.
- Transformación imagen a imagen con entrada y salida `[1,3,512,512]` en NCHW, RGB `[-1,1]`.
- Ejecución on-device mediante TensorFlow Lite o LiteRT, sin necesidad de enviar la imagen a un servidor.
- Compatibilidad con runtimes antiguos de TensorFlow Lite 2.11–2.13 y con el pod `TensorFlowLiteC` 2.12 de iOS.
- Integración en aplicaciones móviles de restauración facial, como la función AI Face Restore de Pixfix.
- No incluye generación de texto, tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No es un modelo multilingüe ni de propósito general: trabaja exclusivamente con rostros y no con escenas completas.
- No dispone de modo thinking, visión general, audio ni otras modalidades.

## Casos de uso

- Restauración de fotos antiguas en aplicaciones móviles: el modelo se ejecuta on-device sobre recortes de rostro de 512×512, lo que permite mejorar retratos escaneados sin subir imágenes personales a la nube.
- Mejora de retratos en apps de edición: tras detectar y alinear la cara según FFHQ, se aplica el modelo para recuperar detalle en ojos, piel y rasgos antes de exportar la imagen final.
- Restauración de fotogramas en vídeo o videollamadas: se puede procesar cada fotograma o cada recorte facial de forma independiente, siempre que se respete la resolución fija de 512×512 y se controle la latencia.
- Preprocesado para reconocimiento facial: el modelo puede mejorar la calidad de rostros degradados en conjuntos de imágenes de vigilancia o archivo antes de pasarlos a un sistema de identificación, con las cautelas éticas y de identidad correspondientes.
- Digitalización de archivos históricos y colecciones fotográficas: permite ejecutar lotes offline en dispositivos locales para restaurar retratos sin depender de infraestructura GPU de servidor.
- Integración en aplicaciones iOS: al ser compatible con `TensorFlowLiteC` 2.12, puede incorporarse en apps que necesitan soportar versiones antiguas del runtime sin actualizar el pod.
- Escenarios de privacidad: al no requerir conexión, es adecuado para restauración facial en entornos sanitarios, forenses o personales donde la imagen no debe salir del dispositivo.
- Restauración de texturas faciales para avatares o experiencias AR: puede utilizarse como paso previo para generar texturas de rostro más nítidas a partir de capturas de baja calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La única validación numérica reportada es que la salida del modelo reempaquetado coincide con la del modelo original dentro de 2e-5. No se proporcionan métricas de PSNR, SSIM, FID, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está orientado a ejecución on-device, no a GPU de servidor.
- GPU recomendadas: no aplica; no se proporcionan recomendaciones de A100, H100 ni RTX 4090.
- Cabe en GPU consumer: no aplica; el despliegue previsto es en móvil mediante TensorFlow Lite o LiteRT.
- Opciones de despliegue: intérprete de TensorFlow Lite/LiteRT, pod `TensorFlowLiteC` 2.12 en iOS y runtime TFLite en Android.
- No procede el despliegue con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; dependerán del dispositivo, de la delegación a CPU/GPU/NPU y del runtime utilizado.
- El repositorio ocupa 0.4 GB; el archivo principal es `gfpgan_fp16.tflite`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| NarinAhir/GFPGAN-v1.4-TFLite | no disponible | no aplica | Restauración facial 512×512 | Apache-2.0 | TFLite con pesos inline | HuggingFace |
| litert-community/GFPGAN-v1.4-LiteRT | no disponible | no aplica | Restauración facial 512×512 | Apache-2.0 | TFLite/LiteRT | HuggingFace |
| TencentARC/GFPGAN v1.4 | no disponible | no aplica | Restauración facial 512×512 | Apache-2.0 | PyTorch | GitHub |

No se dispone de datos de rendimiento comparativo entre estas variantes. La diferencia principal de este repositorio es la compatibilidad con runtimes antiguos de TensorFlow Lite gracias al reempaquetado de pesos; el modelo base y el original de TencentARC no incluyen ese cambio de formato.

## Limitaciones y advertencias

- Solo procesa rostros alineados según FFHQ a 512×512; no es un modelo de superresolución general ni restaura paisajes, objetos o escenas completas.
- Requiere un paso previo de detección, recorte y alineación facial; si la cara no está correctamente alineada, la calidad de salida puede degradarse.
- Puede generar o modificar detalles faciales de forma plausible pero no fiel a la identidad original; no es adecuado para identificación forense ni para reconstrucción fidedigna de rasgos.
- No se documentan los sesgos del dataset de entrenamiento ni el comportamiento diferencial según edad, género, etnia o condiciones de iluminación.
- No hay benchmarks publicados que permitan comparar su calidad objetiva frente a otras alternativas de restauración facial.
- La licencia Apache-2.0 permite uso comercial, pero deben revisarse los derechos de las imágenes de entrada y las dependencias upstream.
- El uso para modificar rostros puede plantear riesgos de privacidad, suplantación de identidad o deepfakes; es recomendable informar al usuario y aplicar controles de consentimiento.
- La compatibilidad con runtimes antiguos es el objetivo del reempaquetado, pero no se garantiza el funcionamiento en todas las versiones ni en todos los dispositivos.

## Enlaces

- [NarinAhir/GFPGAN-v1.4-TFLite en HuggingFace](https://huggingface.co/NarinAhir/GFPGAN-v1.4-TFLite)
- [litert-community/GFPGAN-v1.4-LiteRT](https://huggingface.co/litert-community/GFPGAN-v1.4-LiteRT)
- [TencentARC/GFPGAN en GitHub](https://github.com/TencentARC/GFPGAN)
