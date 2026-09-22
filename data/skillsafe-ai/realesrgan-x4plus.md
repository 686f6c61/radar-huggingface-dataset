# skillsafe-ai/realesrgan-x4plus

## Resumen

Real-ESRGAN x4plus (skillsafe-ai/realesrgan-x4plus) es un artefacto ONNX listo para navegador del conocido modelo de superresolución de imagen Real-ESRGAN x4plus, convertido por SkillSafe a partir del checkpoint oficial publicado por Xintao Wang. No es un modelo de lenguaje: es una red generativa de superresolución que toma una imagen RGB de entrada y devuelve la misma imagen ampliada por un factor de 4 en cada eje, con arquitectura RRDBNet de 23 bloques.

El valor del repositorio no está en los pesos (idénticos a los del upstream), sino en el empaquetado reproducible: incluye dos variantes ONNX (fp32 de 63,95 MB y fp16 de 32,19 MB), receta de conversión con hash, toolchain fijado (Python 3.12.13, torch 2.10.0, onnx 1.23.0, onnxruntime 1.30.0), sumas SHA-256 por fichero y verificación numérica contra la referencia PyTorch.

Es relevante ahora porque permite ejecutar superresolución de imagen directamente en el cliente mediante onnxruntime-web con WebGPU o WASM, sin enviar las imágenes a un servidor y sin depender de PyTorch. El repo es de tamano reducido (0,1 GB), tiene licencia BSD-3-Clause y, en el momento de la consulta, registra 0 descargas y 0 likes, por lo que carece de validación comunitaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RRDBNet (Residual-in-Residual Dense Block Network), 23 bloques, red generadora de tipo GAN |
| Parametros totales | no disponible de forma explicita; estimados en ~16,7 M a partir del tamano del fichero fp32 (63,95 MB / 4 bytes por parametro) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | fp32 (`model.onnx`) y fp16 (`model_fp16.onnx`); no se incluyen variantes INT8, INT4 ni GGUF |
| Idiomas soportados | no aplica (modelo de imagen; la model card no declara idiomas) |
| Licencia | BSD-3-Clause (pesos y arquitectura: Copyright (c) 2021, Xintao Wang) |
| Formato de pesos | ONNX, opset 17 |
| Factor de escala | x4 (salida de altura x4 y anchura x4) |
| Contrato de entrada | `input`, float32, `['batch', 3, 'height', 'width']` |
| Contrato de salida | `output`, float32, `['batch', 3, 'height_x4', 'width_x4']` |
| Tamano de los ficheros | `model.onnx` 63,95 MB; `model_fp16.onnx` 32,19 MB |
| Ejecucion prevista | onnxruntime-web con `executionProviders: ["webgpu", "wasm"]` |
| Tamano del repositorio | 0,1 GB |
| Fecha de conversion | 2026-09-22T03:09:04+00:00 |

## Arquitectura y entrenamiento

La arquitectura es RRDBNet con 23 bloques, la misma red generadora empleada en la familia ESRGAN y adoptada por Real-ESRGAN. Los bloques residuales-en-residual densos apilan conexiones densas dentro de cada bloque y residuales entre bloques, con el objetivo de preservar detalle de alta frecuencia durante la ampliación. El modelo opera exclusivamente sobre tensores de imagen: entrada float32 con 3 canales y salida float32 con 3 canales a resolución cuadruplicada. El artefacto del repositorio no documenta el proceso de entrenamiento; los datos de entrenamiento, la función de pérdida y el esquema de degradación corresponden al proyecto upstream y no se detallan en la model card de esta conversión.

La innovación de este repositorio es de ingeniería de despliegue, no de modelado. La conversión se realizó con una receta versionada (`recipes/realesrgan-x4plus.yaml`, sha256 `d9c7db59a4d24f1d6e3ec90a827c1b544e2c99ef0195773d3a5739d0c15bc109`) sobre un checkpoint con SHA-256 fijado (`4fa0d38905f75ac06eb49a7951b426670021be3018265fd191d2125df9d682f1`), y cada fichero publicado incluye su propio hash. Se validó la equivalencia entre ONNX Runtime en CPU y la referencia PyTorch con umbrales declarados en la receta (`fp32`: max_abs 0,0001; `fp16`: max_abs 0,05 y PSNR 45 dB), sobre entradas uniformes con semilla. No se aplicó edición manual a los pesos.

## Capacidades

- Superresolución de imagen con factor de escala x4 sobre entradas RGB arbitrarias en altura y anchura (dimensiones dinamicas en los ejes espaciales).
- Procesamiento por lotes: el eje `batch` del contrato de entrada permite inferencia con batch mayor que 1.
- Restauración de imagenes degradadas con detalle plausible, heredada del entrenamiento de Real-ESRGAN sobre degradaciones sinteticas.
- Ejecución 100 % en cliente: la sesión ONNX puede crearse directamente desde la URL de HuggingFace dentro de un navegador con WebGPU o WASM.
- Doble variante de precisión: fp32 para maxima fidelidad numerica y fp16 para la mitad de tamano y menor coste de memoria y ancho de banda.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo de pensamiento: no es un modelo de lenguaje.
- No tiene capacidades multilingues ni de texto, audio o video.
- No incluye deteccion de caras ni restauracion facial especifica (no incorpora el modulo GFPGAN ni similares).
- No incorpora tiling automatico: la gestion por teselas, si se necesita, debe implementarla la aplicacion que consume el modelo.

## Casos de uso

- Restauracion de fotos antiguas en aplicaciones web: la imagen se procesa localmente en el navegador con WebGPU, de modo que la foto del usuario nunca sale de su dispositivo, lo que simplifica el cumplimiento de normativa de privacidad.
- Mejora de miniaturas y productos en comercio electronico: se puede servir una imagen pequeña y generar la version x4 en el cliente, reduciendo el ancho de banda del servidor y el almacenamiento de derivados.
- Preprocesado para OCR y vision por computador: ampliar recortes de baja resolucion antes de pasarlos a un motor de OCR o a un detector mejora la relacion senal-ruido de los trazos, aunque el modelo no este especializado en texto.
- Edicion fotografica de escritorio con ONNX Runtime nativo: integracion en un plugin de GIMP, Krita o similar mediante los execution providers de CUDA, TensorRT o DirectML, sin dependencia de PyTorch.
- Restauracion de capturas y material de archivo en flujos de digitalizacion: aplicar x4 a escaneos de baja resolucion como paso previo a la catalogacion, manteniendo el original intacto.
- Generacion de texturas y assets en pipelines de contenido: ampliar texturas base pequeñas antes de subirlas a un motor grafico, con la advertencia de que el modelo puede inventar detalle fino.
- Prototipado e investigacion reproducible: gracias a los hash por fichero y a la receta versionada, sirve como referencia estable para comparar tecnicas de upscaling o para reproducir resultados en distintos runtimes.
- Aplicaciones moviles o embebidas con recursos limitados: la variante fp16 ocupa 32,19 MB y puede cargarse en memoria sin problema en dispositivos con pocos cientos de MB disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (Set5, Set14, Urban100, DIV2K, PSNR/SSIM frente a otras redes) en la informacion disponible. El unico dato cuantitativo incluido es la verificacion de equivalencia entre la salida de ONNX Runtime en CPU y la referencia PyTorch, sobre entradas uniformes con semilla:

| Variante | Entrada | max abs | mean abs | PSNR |
|---|---|---|---|---|
| fp32 | 64x64 | 2,26e-06 | 3,07e-07 | 128,1 dB |
| fp32 | 80x96 | 2,32e-06 | 3,00e-07 | 128,3 dB |
| fp16 | 64x64 | 1,96e-03 | 1,92e-04 | 72,8 dB |
| fp16 | 80x96 | 1,13e-03 | 1,96e-04 | 72,7 dB |

Los umbrales aceptados por la receta son max_abs 0,0001 para fp32 y max_abs 0,05 con PSNR 45 dB para fp16, de modo que ambas variantes quedan muy por dentro de los limites. No se proporcionan latencias, throughput ni comparaciones de calidad perceptual.

## Requisitos de hardware

- VRAM en reposo: 63,95 MB para `model.onnx` en fp32 y 32,19 MB para `model_fp16.onnx`; los pesos caben en cualquier GPU consumer, en iGPU y en memoria de movil.
- VRAM en inferencia: dominada por las activaciones, no por los pesos. Estimacion propia (no declarada en la model card): con 64 canales de caracteristica a resolucion de entrada, un tensor intermedio de 512x512 en fp32 ocupa del orden de 67 MB, y los bloques densos concatenan canales adicionales, por lo que el pico se situa en cientos de MB para entradas pequenas y puede superar varios GB en entradas de 1080p o superiores. Se recomienda tiling en esos casos.
- GPU recomendadas: cualquier GPU con soporte WebGPU para el caso de navegador; NVIDIA GTX 10xx o superior, RTX 3060/4090, A100 o H100 para lotes grandes en servidor con los execution providers de CUDA o TensorRT. En CPU funciona con WASM o con ONNX Runtime nativo, a costa de mayor latencia.
- Compatibilidad con GPU consumer: si, en todas las gamas, incluidos portatiles con grafica integrada, siempre que se ajuste el tamano de tesela a la memoria disponible.
- Opciones de despliegue: onnxruntime-web (WebGPU o WASM) en navegador; ONNX Runtime nativo con providers CPU, CUDA, TensorRT, DirectML o CoreML; cualquier runtime compatible con ONNX opset 17. No hay ficheros GGUF, por lo que no aplica llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tiempo por imagen ni de imagenes por segundo en ninguna configuracion.

## Comparativa con modelos similares

Los datos de parametros, contexto y rendimiento de las alternativas no se han proporcionado, por lo que se comparan solo los aspectos verificables. Ninguna de las alternativas listadas es un modelo de lenguaje: la comparacion es entre soluciones de superresolucion.

| Modelo | Arquitectura | Factor | Formato | Licencia | Listo para navegador | Parametros |
|---|---|---|---|---|---|---|
| skillsafe-ai/realesrgan-x4plus (este) | RRDBNet, 23 bloques | x4 | ONNX opset 17 (fp32 y fp16) | BSD-3-Clause | Si, con onnxruntime-web | ~16,7 M (estimado por tamano de fichero) |
| Real-ESRGAN x4plus upstream | RRDBNet, 23 bloques | x4 | PyTorch `.pth` | BSD-3-Clause | No, requiere conversion | no disponible en la informacion proporcionada |
| ESRGAN original | RRDBNet | x4 | PyTorch | Apache-2.0 (segun el proyecto original) | No | no disponible en la informacion proporcionada |
| SwinIR | Transformer (Swin) | x2, x3, x4 | PyTorch | Apache-2.0 (segun el proyecto original) | No | no disponible en la informacion proporcionada |

La ventaja diferencial de este repositorio frente al checkpoint upstream no es la calidad de imagen, que deberia ser identica salvo por el error de fp16, sino la trazabilidad (receta, hashes, toolchain) y la capacidad de ejecucion en cliente. No se dispone de datos de benchmarks que permitan afirmar cual de estas arquitecturas obtiene mejor PSNR o mejor valoracion perceptual.

## Limitaciones y advertencias

- No se han publicado metricas de calidad (PSNR, SSIM, LPIPS) frente a otros modelos, por lo que no se puede validar la calidad de salida mas alla de la equivalencia numerica con PyTorch.
- Como red generativa de tipo GAN, puede inventar detalle inexistente (texturas, rasgos faciales, caracteres) que no estaban en la imagen original. No es una herramienta forense ni debe usarse para reconstruir pruebas.
- Rendimiento degradado previsible en capturas de pantalla, documentos escaneados, texto pequeno e ilustraciones. Para esos dominios el propio ecosistema upstream recomienda variantes especificas (por ejemplo las orientadas a anime o al modelo general v3), no este checkpoint.
- La variante fp16 introduce un error absoluto maximo de hasta ~2e-03 frente a la referencia, aceptable para visualizacion pero no para pipelines que exijan fidelidad numerica estricta.
- Solo implementa factor x4. Para obtener x2 hay que ampliar y reducir despues, con la perdida de calidad que ello implica.
- No incluye restauracion facial ni correccion de artefactos de compresion especifica.
- El repositorio tiene 0 descargas y 0 likes: no existe validacion por parte de la comunidad. La confianza debe basarse en verificar los SHA-256 publicados y reproducir la receta, no en la popularidad.
- Licencia BSD-3-Clause: permite uso comercial, modificacion y redistribucion siempre que se conserve el aviso de copyright y la clausula de exencion de responsabilidad, y que no se use el nombre de los titulares para promocionar derivados sin permiso.
- Los pesos conservan la licencia del upstream (Xintao Wang); la receta y la model card pertenecen al repositorio de SkillSafe y llevan su propia licencia. Es necesario mantener ambas atribuciones.
- La ejecucion en navegador depende de WebGPU, cuya disponibilidad varia segun navegador, sistema operativo y controladores; el fallback a WASM funciona en cualquier navegador pero con mayor latencia.
- Las fechas de creacion y actualizacion del repositorio (2026-09-22) son posteriores a la fecha habitual de este tipo de publicaciones; conviene comprobar la vigencia del enlace antes de integrarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafe-ai/realesrgan-x4plus
- Fichero `model.onnx`: https://huggingface.co/skillsafe-ai/realesrgan-x4plus/resolve/main/model.onnx
- Repositorio upstream Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN
- Checkpoint original: https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth
- Licencia del upstream: https://github.com/xinntao/Real-ESRGAN/blob/a4abfb2979a7bbff3f69f58f58ae324608821e27/LICENSE
- Recetas de conversion de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces obtenidos correspondian a un diccionario italiano-ingles y no guardan relacion con el artefacto.
