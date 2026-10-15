# smile-forge/real-esrgan-gfpgan-onnx

## Resumen

smile-forge/real-esrgan-gfpgan-onnx es un repositorio de grafos ONNX que empaqueta cinco modelos de vision ya existentes para ejecutarlos con ONNX Runtime 1.30 o posterior, en CPU o CUDA. No es un modelo entrenado por su autor ni un modelo de lenguaje: son conversiones de pesos publicados por terceros (Real-ESRGAN, GFPGAN, facexlib), verificadas contra sus implementaciones originales en PyTorch. Cubre dos tareas: reescalado de imagen con Real-ESRGAN x2plus y x4plus (factores 2x y 4x) y restauracion de caras, que combina un detector RetinaFace con backbone ResNet-50, el restaurador GFPGAN v1.4 y un segmentador facial ParseNet que decide que pixeles del rostro regenerado se pegan de vuelta.

Su relevancia es practica: elimina la dependencia de PyTorch y BasicSR para desplegar estas tecnicas y ofrece un contrato de entrada homogeneo en los cinco grafos (RGB planar en flotante de 0 a 1, tensor `[1, 3, alto, ancho]`, con la normalizacion propia de cada modelo resuelta dentro del grafo). Su destino declarado es Nexaflow, el host de IA de smile-forge, que los ejecuta desde C# para sus herramientas de imagen, pero cualquier runtime de ONNX Runtime 1.30 o superior puede usarlos.

El repositorio ocupa 0,7 GB en total: 341 MB del restaurador GFPGAN, 110 MB del detector RetinaFace, 85 MB del ParseNet y 69 MB de cada upscaler. Todos los grafos se distribuyen en fp32. La ficha publicada no incluye recuento de parametros ni resultados de calidad frente a conjuntos de prueba estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cinco grafos ONNX independientes: Real-ESRGAN x4plus y x2plus (generador RRDB), RetinaFace con backbone ResNet-50 (deteccion facial con cinco puntos), GFPGAN v1.4 (decodificador StyleGAN2 con encoder U-Net) y ParseNet (segmentacion facial en 19 clases) |
| Parametros totales | no disponible (el autor solo publica el peso en disco: 69 MB el upscaler x4, 69 MB el x2, 110 MB RetinaFace, 341 MB GFPGAN, 85 MB ParseNet, todos en fp32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelos de vision; la entrada es una imagen RGB planar de altura y anchura variables) |
| Tipos de cuantizacion | no disponible; los grafos se distribuyen unicamente en fp32 |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | other / per-model: BSD-3-Clause (Real-ESRGAN x4plus y x2plus), Apache-2.0 (GFPGAN v1.4, arquitectura limpia sin operadores CUDA de NVIDIA StyleGAN2), MIT (RetinaFace y ParseNet de facexlib). La receta de conversion es Apache-2.0 |
| Formato de pesos | ONNX (grafo plano para ONNX Runtime 1.30 o posterior), fp32 |

## Arquitectura y entrenamiento

El autor no entrena nada: descarga los pesos de las releases originales, comprueba cada uno contra su hash, y los traza con `torch.onnx.export` mediante los scripts `upstream.py`, `Build-PictureTools.ps1` y `build_picture_tools.py`. La validacion (`picture_reference.py`) ejecuta los pipelines originales `RealESRGANer` y `GFPGANer` sobre sus imagenes de muestra: los upscalers y GFPGAN coinciden con el original a 2x10⁻⁵ respecto al mayor valor de salida, RetinaFace a 2,4x10⁻⁴ y ParseNet elige la misma clase por pixel. El pipeline en C# de Nexaflow reproduce las mismas imagenes con 54-66 dB de PSNR en todas las escalas.

Los grafos solo difieren del original donde el trazado lo exige. GFPGAN usa el ruido con el que fue entrenado (equivalente a `randomize_noise=False`), de modo que cada cara se reconstruye igual en cada llamada, y aplana la ultima feature map del encoder con `reshape` porque el visor de GFPGAN no es trazable. RetinaFace devuelve las salidas en crudo: regresiones de caja y de cinco puntos contra cada prior, mas el score de cara, dejando al llamador el decodificado, el umbral y la supresion de solapamientos. ParseNet reduce sus 19 clases a la mascara binaria que GFPGAN usa para pegar (1 en piel, cejas, ojos, gafas, orejas, nariz y labios; 0 en fondo, cuello, ropa, pelo y sombrero).

Datos de entrenamiento de los modelos originales, segun la model card: Real-ESRGAN x4plus y x2plus sobre DIV2K, Flickr2K y OST; GFPGAN v1.4 sobre FFHQ (CC BY-NC-SA 4.0); RetinaFace sobre WIDER FACE (uso de investigacion); ParseNet sobre CelebAMask-HQ (investigacion no comercial).

## Capacidades

- Superresolucion de imagen con factor 2x (Real-ESRGAN x2plus) y 4x (x4plus), con eliminacion de bloques JPEG, ruido y falta de nitidez.
- Modo de limpieza a igual resolucion: reescalar 2x con el modelo x2 y volver al tamano original con Lanczos.
- Deteccion de caras con RetinaFace: cajas y cinco puntos faciales por cara, decodificados desde las salidas crudas del grafo.
- Restauracion facial con GFPGAN v1.4 de forma determinista (ruido fijo, sin variacion entre llamadas).
- Segmentacion facial con ParseNet, reducida a mascara binaria de las partes del rostro.
- Pipelado completo de restauracion facial: deteccion, alineado a plantilla, recorte de 512 px, restauracion, generacion de mascara, desenfoque gaussiano de 101 px con sigma 11, limpieza de los 10 pixeles exteriores y pegado con la deformacion inversa.
- Procesado por tiles con margen de 24 pixeles por tile, lo que permite trabajar con imagenes de cualquier tamano dentro de la memoria disponible.
- Soporte de canal alfa, que se procesa como gris a traves del modelo.
- Ejecucion en CPU y CUDA con ONNX Runtime 1.30 o superior; consumible desde Python y desde C#.
- Capacidades que no tiene: generacion o edicion guiada por texto, tool calling, razonamiento multi-paso y cualquier procesamiento de lenguaje.

## Casos de uso

- Restauracion de fotografias antiguas o escaneadas: el pipeline completo detecta cada cara, la reconstruye con GFPGAN y la vuelve a pegar solo en los pixeles de la mascara de ParseNet, de modo que el fondo y la ropa conservan su textura original en lugar de recibir el aspecto generado por el restaurador.
- Digitalizacion de archivos con compresion agresiva: el upscaler reduce bloques JPEG, ruido y suavidad, y admite procesado por tiles, lo que permite tratar colecciones grandes sin limites de resolucion.
- Preparacion de imagenes para impresion a gran formato: el factor 4x sobre una foto de origen pequeno da la resolucion de entrada necesaria para impresion, y el modo de limpieza a igual tamano sirve para archivos ya grandes que solo necesitan depuracion.
- Mejora de miniaturas y fichas de producto en comercio electronico: lotes de imagenes de catalogo con caras de modelos o retratos de autor pueden pasar por el detector y el restaurador solo donde hay rostros, evitando regenerar el producto.
- Preprocesado para OCR y vision por computador: una version 2x limpiada mejora la deteccion de texto en documentos escaneados y de objetos en imagenes de baja calidad antes de pasarlas a un modelo de deteccion.
- Integracion en aplicaciones de escritorio .NET o C#: el repositorio esta construido para Nexaflow, que invoca los grafos desde C# sin necesidad de un stack de Python, algo poco habitual en modelos de vision de este tipo.
- Vigilancia y analitica de video: el autor documenta 47 ms por tile de 512 px en el upscaler x2 sobre una RTX PRO 6000, lo que hace viable el procesado de fotogramas seleccionados, aunque no de video en tiempo real a resolucion completa.
- Servicio local de retoque de retratos: al usar el ruido fijo de entrenamiento, la misma entrada produce siempre la misma salida, lo que facilita la revision y el control de calidad en un flujo por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (PSNR, SSIM, LPIPS o FID frente a conjuntos de prueba estandar) en la informacion disponible. Los unicos numeros publicados son comprobaciones de fidelidad frente a las implementaciones originales en PyTorch, no comparaciones de calidad con otros modelos:

| Comprobacion | Resultado documentado |
|---|---|
| Upscalers x2 y x4 y GFPGAN frente al original en fp32 | Coincidencia de 2x10⁻⁵ respecto al mayor valor de salida |
| RetinaFace frente al original | Coincidencia de 2,4x10⁻⁴ |
| ParseNet frente al original | Misma clase asignada a cada pixel |
| Pipeline en C# de Nexaflow frente a `RealESRGANer` y `GFPGANer` | 54-66 dB de PSNR en todas las escalas, con y sin reparacion facial |
| Deteccion de caras frente a la referencia | Encuentra las mismas caras |
| Tiempo por tile de 512 px, upscaler x2, fp32, RTX PRO 6000 | 47 ms |
| Tiempo de GFPGAN, fp32, RTX PRO 6000 | 13 ms |
| Memoria pico con tiles de 512 px en el modelo x2 | Cerca de 8 GB |

## Requisitos de hardware

- Precision de ejecucion: fp32 en todos los grafos; el autor indica que la mitad de precision no compensa en GPU, dado el rendimiento obtenido.
- GPU de referencia: RTX PRO 6000, con 47 ms por tile de 512 px en el upscaler x2 y 13 ms en GFPGAN.
- Memoria: pico cercano a 8 GB con tiles de 512 px en el modelo x2, segun el autor. Para el upscaler x4 usa tiles de 256 px, lo que reduce el consumo, aunque no se publica la cifra exacta.
- CPU: soportado por ONNX Runtime, sin datos de latencia publicados.
- GPU de consumo: no disponible. No hay cifras para RTX 3090, RTX 4090 ni tarjetas de 8 GB; dado el pico de 8 GB con tiles de 512 px, en tarjetas con menos VRAM seria necesario reducir el tamano de tile y el pico bajaria en consecuencia, pero el autor no lo documenta.
- Throughput estimado: derivado de la cifra publicada, aproximadamente 21 tiles de 512 px por segundo en el upscaler x2 sobre una RTX PRO 6000; el resto de grafos no tiene mediciones.
- Despliegue: ONNX Runtime 1.30 o posterior, en CPU o CUDA, invocable desde Python o desde C#. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo y no se mencionan en la model card.
- Instalacion: no se publica un paquete ni instrucciones de uso independientes del proyecto Nexaflow; el repositorio contiene grafos y scripts de construccion y validacion.

## Comparativa con modelos similares

La comparacion significativa es contra las implementaciones originales de las que proceden estos grafos, no contra otros modelos de superresolucion:

| Proyecto | Formato y runtime | Pesos | Licencia | Contexto |
|---|---|---|---|---|
| smile-forge/real-esrgan-gfpgan-onnx | ONNX para ONNX Runtime 1.30+, CPU o CUDA | 0,7 GB en total, cinco grafos fp32 | other / per-model (BSD-3-Clause, Apache-2.0 y MIT segun el componente) | Sin PyTorch ni BasicSR; consumible desde C# |
| xinntao/Real-ESRGAN | PyTorch con BasicSR | Grafos y pesos oficiales de x2plus y x4plus | BSD-3-Clause | Requiere stack Python; es la fuente de los upscalers |
| TencentARC/GFPGAN | PyTorch | GFPGAN v1.4 con decoder StyleGAN2 | Apache-2.0 (arquitectura limpia sin operadores CUDA) | Requiere stack Python; aplica ruido aleatorio por defecto, a diferencia del grafo ONNX |
| xinntao/facexlib | PyTorch | RetinaFace y ParseNet | MIT | Origen del detector y del segmentador; define el decodificado de priors y el alineado |

No se dispone de datos en la informacion proporcionada para comparar con otras alternativas de superresolucion o restauracion facial (por ejemplo, CodeFormer, SwinIR o los modulos de upscaling de difusion), ni de parametros o resultados de calidad de este repositorio frente a ellas.

## Limitaciones y advertencias

- Licencia por componente y con incertidumbre: aunque los pesos se publican bajo BSD-3-Clause, Apache-2.0 y MIT, GFPGAN se entreno sobre FFHQ (CC BY-NC-SA 4.0), RetinaFace sobre WIDER FACE (uso de investigacion) y ParseNet sobre CelebAMask-HQ (investigacion no comercial). El propio autor senala que el alcance de los terminos del dataset sobre los pesos derivados no esta resuelto y queda a criterio del usuario, lo que es un riesgo real para uso comercial.
- Sin benchmarks de calidad: no hay PSNR, SSIM ni LPIPS publicados frente a conjuntos de prueba estandar, solo verificaciones de equivalencia con el original. No es posible estimar la calidad de la restauracion a partir de esta ficha.
- Sin recuento de parametros ni datos de entrenamiento propios: la ficha describe una conversion, no un modelo nuevo.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Cambio de comportamiento respecto al original: el ruido fijo de GFPGAN elimina la variacion entre llamadas, lo que es util para reproducibilidad pero no coincide con el comportamiento por defecto del codigo original.
- RetinaFace devuelve salidas crudas: el llamador debe implementar el decodificado de regresiones contra los priors, el umbral de score, la supresion de solapamientos y el descarte por distancia entre ojos. Un umbral mal ajustado produce caras no detectadas o falsos positivos. Los valores documentados son varianzas 0,1 y 0,2 sobre priors de 16 y 32, 64 y 128, y 256 y 512 con pasos de 8, 16 y 32 pixeles, score minimo 0,97, solapamiento maximo 0,4 y distancia minima entre ojos de 5 pixeles.
- Riesgo de artefactos en los bordes de tile: el procesado por tiles con margen de 24 pixeles es responsabilidad del llamador; no se documentan evaluaciones de halos o costuras.
- Restauracion facial generativa: la model card no incluye metricas de fidelidad de identidad ni de posibles alteraciones de rasgos, un riesgo conocido en este tipo de modelos que aqui no esta cuantificado.
- Dependencia de version: se exige ONNX Runtime 1.30 o posterior, sin versiones anteriores soportadas ni garantias de compatibilidad futura.
- Sin cuantizacion disponible: solo fp32, lo que limita el despliegue en hardware con poca memoria o sin soporte de coma flotante de 32 bits eficiente.
- Sin soporte de texto ni de agentes: las filas de contexto, idiomas y tool calling de esta ficha no aplican y no deben interpretarse como carencias del modelo, sino como campos fuera de su dominio.
- Fecha de publicacion poco habitual: el repositorio figura como creado el 15 de octubre de 2026, posterior a la fecha de esta consulta en la mayoria de entornos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smile-forge/real-esrgan-gfpgan-onnx
- Nexaflow, host de IA para el que se construyeron los grafos: https://github.com/smile-forge/nexaflow
- Real-ESRGAN (xinntao): https://github.com/xinntao/Real-ESRGAN
- GFPGAN (TencentARC): https://github.com/TencentARC/GFPGAN
- facexlib, origen de RetinaFace y ParseNet: https://github.com/xinntao/facexlib
- BasicSR, dependencia del pipeline original: no se incluye URL en la model card.
- La busqueda web realizada no devolvio resultados relevantes: los resultados corresponden a la pelicula "Smile" de 2022 y a la empresa de servicios digitales Smile, sin relacion con este repositorio.
