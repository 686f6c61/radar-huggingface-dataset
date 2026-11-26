# cgb/photo-restore-onnx

## Resumen

`cgb/photo-restore-onnx` es un paquete de tres grafos ONNX que implementa una canalización completa de restauración de fotografías antiguas ejecutable íntegramente en el navegador mediante ONNX Runtime Web. Lo publica el usuario cgb como artefacto de soporte de la función "Restore old photo" de FreeGen.ai, y agrupa tres modelos de terceros: YuNet (detección facial, OpenCV Zoo), GFPGAN v1.4 (restauración de rostros, TencentARC) y DDColor tiny (colorización, piddnad). No es un modelo entrenado por el autor, sino una recopilación de exportaciones públicas renombradas y verificadas para inferencia en cliente.

La relevancia del paquete es de ingeniería más que de investigación: demuestra un pipeline de visión por computador de tres etapas (detección, restauración facial y colorización) que corre sobre WebGPU sin subir la imagen a ningún servidor. El repositorio ocupa 0,3 GB y los pesos de GFPGAN y DDColor se almacenan en fp16 para reducir la descarga, aunque se convierten a fp32 en carga porque la aritmética en fp16 puro desborda en WebGPU.

No hay información sobre parámetros totales, longitud de contexto ni idiomas: son modelos de visión, no de lenguaje, y la model card no detalla recuentos de parámetros. La licencia agregada del repositorio es Apache 2.0, pero cada grafo conserva su licencia original (YuNet es MIT).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres grafos ONNX independientes: YuNet (CNN de detección facial), GFPGAN v1.4 (generador StyleGAN2 "clean" para restauración facial), DDColor tiny (red de colorización en espacio Lab) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de visión; entrada fija de 640x640 y 512x512 píxeles) |
| Tipos de cuantizacion | Pesos en fp16 en disco para GFPGAN y DDColor; aritmética en fp32 en tiempo de ejecución. YuNet se distribuye en su export estándar de OpenCV Zoo |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 para el repositorio; YuNet MIT, GFPGAN v1.4 Apache 2.0, DDColor Apache 2.0 |
| Formato de pesos | ONNX (`.onnx`): `yunet_2023mar.onnx`, `gfpgan_v1.4_fp16.onnx`, `ddcolor_tiny_fp16.onnx` |

## Arquitectura y entrenamiento

El paquete no entrena nada: ensambla tres redes preentrenadas. YuNet es un detector facial ligero de OpenCV Zoo que recibe una imagen BGR de 640x640 en rango 0-255 y devuelve cajas faciales junto con cinco puntos clave (ojos, punta de nariz y comisuras de la boca). GFPGAN v1.4 es un generador basado en StyleGAN2 en su variante "clean", que evita los kernels CUDA propietarios de NVIDIA que el repositorio original lista como excepción de licencia; recibe una cara alineada de 512x512 en RGB normalizado a [-1, 1] en float32. DDColor tiny es una red de colorización que toma la imagen en escala de grises replicada en tres canales RGB en [0, 1] a 512x512 y predice los canales cromáticos a y b del espacio Lab.

La innovación técnica está en la integración: alineación de cada cara detectada a la plantilla FFHQ 512 mediante transformación de similitud, restauración con GFPGAN, mezcla de vuelta con una elipse difuminada para no sustituir el fondo, y colorización global con DDColor cuyos canales a y b se estiran sobre la luminosidad a resolución completa de la foto original. El autor indica que el preprocesado y postprocesado (`restore-math.js` de FreeGen) se validó contra la referencia en Python (OpenCV y ONNX Runtime en CPU) con una tolerancia de un nivel por canal. Los grafos provienen de exportaciones públicas: YuNet de OpenCV Zoo, GFPGAN de `netrunner-exe/Face-Upscalers-onnx` y DDColor de `edgetools/ddcolor`.

## Capacidades

- Detección facial con cinco puntos clave (YuNet) sobre imágenes de entrada de 640x640.
- Restauración de rostros degradados o de baja resolución (GFPGAN v1.4), incluyendo recuperación de detalle en caras alineadas a 512x512.
- Colorización automática de fotografías en escala de grises (DDColor tiny), prediciendo cromaticidad en espacio Lab.
- Ejecución íntegra en el navegador con ONNX Runtime Web y WebGPU, sin subida de datos al servidor.
- Composición de las tres etapas en un pipeline único de restauración de fotos antiguas.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente visión.
- No hay capacidades multilingües ni modos de "thinking"; no aplica.

## Casos de uso

- Restauración de archivos fotográficos familiares en el navegador: el usuario sube una foto escaneada y el pipeline detecta caras, las restaura con GFPGAN y colorea con DDColor sin que la imagen salga del dispositivo, lo que resulta adecuado para material personal sensible.
- Aplicaciones web de edición fotográfica con privacidad por diseño: integrar los tres grafos en una web app que procese imágenes en el cliente evita costes de servidor GPU y cumple requisitos de no retención de datos.
- Digitalización de fondos históricos y hemerotecas: colorización y restauración por lotes en estaciones de trabajo con WebGPU, útil cuando no se permite enviar material a servicios en la nube.
- Preprocesado para reconocimiento facial en pipelines de investigación: YuNet proporciona cajas y puntos clave que pueden alimentar etapas posteriores de identificación o agrupación de rostros.
- Herramientas de demostración y docencia: el paquete sirve como ejemplo reproducible de despliegue ONNX multi-modelo con conversión fp16/fp32 y validación numérica contra referencia Python.
- Prototipado de productos de restauración sin infraestructura backend: al ser Apache 2.0 y ejecutarse en WebGPU, permite lanzar un MVP que funcione en portátiles con GPU integrada compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta una validación numérica del preprocesado y postprocesado frente a la referencia en Python con una tolerancia de un nivel por canal; no hay métricas de PSNR, SSIM, FID ni latencias medidas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio pesa 0,3 GB, lo que da una cota superior del tamaño de los pesos; la inferencia en WebGPU requiere memoria de GPU del navegador suficiente para los tres grafos y las imágenes intermedias de 640x640 y 512x512.
- GPU recomendadas: cualquier GPU con soporte de WebGPU en el navegador (Chrome/Edge recientes). No se especifican modelos concretos como A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, siempre que el navegador exponga WebGPU; el diseño está pensado para ejecución en el propio dispositivo del visitante.
- Opciones de despliegue: ONNX Runtime Web (WebGPU) es el objetivo principal; los mismos grafos pueden ejecutarse con ONNX Runtime en CPU o GPU fuera del navegador, como se usó en la validación de referencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Licencia | Ejecución en navegador | Disponibilidad |
|---|---|---|---|---|---|
| cgb/photo-restore-onnx (este paquete) | Pipeline de 3 grafos ONNX (detección + restauración + colorización) | 640x640 y 512x512 | Apache 2.0 (agregada); componentes MIT y Apache 2.0 | Sí, vía ONNX Runtime Web y WebGPU | Hugging Face, 0 descargas, 0 likes |
| GFPGAN v1.4 (TencentARC) | Restauración facial | 512x512 | Apache 2.0 | No de forma nativa; requiere exportación a ONNX | Repositorio GitHub de TencentARC |
| DDColor (piddnad) | Colorización | 512x512 | Apache 2.0 | No de forma nativa; requiere exportación | Repositorio GitHub de piddnad |
| YuNet (OpenCV Zoo) | Detección facial | 640x640 | MIT | No de forma nativa; export ONNX disponible en OpenCV Zoo | OpenCV Zoo |

La comparativa relevante es frente a los modelos individuales que lo componen: este paquete no aporta pesos nuevos, sino una integración empaquetada y verificada para navegador. Frente a alternativas de restauración como CodeFormer o RestoreFormer, no hay datos comparativos publicados en la información disponible.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: los pesos provienen de exportaciones de terceros y el valor añadido es el empaquetado y la validación del pipeline.
- La restauración facial con GFPGAN puede generar rasgos plausibles pero no fieles a la persona original; es un riesgo de alucinación visual inherente a los modelos generativos de caras.
- La colorización con DDColor tiny produce colores estimados, no históricamente verificados; en fotografías antiguas puede introducir tonalidades incorrectas.
- La alineación facial depende de YuNet: caras muy de perfil, ocluidas o de muy baja resolución pueden no detectarse y quedar sin restaurar.
- El pipeline solo restaura rostros y coloriza la imagen; no corrige ruido global, arañazos, desgarros ni desenfoque fuera de las caras.
- La ejecución depende de WebGPU: navegadores sin soporte caen a CPU o no funcionan, con latencias no documentadas.
- Los pesos en fp16 se convierten a fp32 en carga; la aritmética en fp16 puro desborda en WebGPU, según advierte el autor, lo que limita optimizaciones de memoria.
- Licencia: el repositorio es Apache 2.0, pero cada componente conserva su licencia (YuNet MIT, GFPGAN y DDColor Apache 2.0); conviene verificar los términos de cada uno para uso comercial.
- Sin descargas ni likes registrados y creado en noviembre de 2026 según los metadatos: la adopción y el mantenimiento futuros no están contrastados.
- No hay información sobre sesgos demográficos de los tres modelos subyacentes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cgb/photo-restore-onnx
- Demo de FreeGen.ai: https://freegen.ai/edit
- YuNet (OpenCV Zoo): https://github.com/opencv/opencv_zoo/tree/main/models/face_detection_yunet
- GFPGAN (TencentARC): https://github.com/TencentARC/GFPGAN
- DDColor (piddnad): https://github.com/piddnad/DDColor
- Exportación de GFPGAN a ONNX: https://github.com/netrunner-exe/Face-Upscalers-onnx
- Exportación de DDColor a ONNX: https://github.com/edgetools/ddcolor
