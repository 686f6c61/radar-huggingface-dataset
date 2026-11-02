# ravetools/watermark-remover

## Resumen

`ravetools/watermark-remover` es un repositorio espejo de dos modelos de inpainting de imagenes en formato ONNX, empaquetados para su ejecucion local en el navegador mediante `onnxruntime-web`. No se trata de un modelo entrenado por el autor del repositorio, sino de una copia byte a byte de dos pesos upstream: MI-GAN (Picsart AI Research, ICCV 2023) y LaMa (Samsung Research, WACV 2022). El objetivo es eliminar logotipos o marcas de agua de imagenes y video propiedad del usuario, sin enviar datos a ningun servidor.

El repositorio lo publica ravetools como respaldo del servicio Watermark Remover de rave-tools.com. El modelo rapido por defecto es `migan_pipeline_v2.onnx` (28 MB), una exportacion ONNX que acepta RGB en uint8 y una mascara a cualquier resolucion, gestionando internamente el redimensionado y el pegado de vuelta. La opcion de maxima calidad es `lama_fp32.onnx` (208 MB), una exportacion ONNX de LaMa con entrada fija de 512x512 y opset 17.

Ambos modelos son redes de inpainting puramente convolucionales, sin componente de lenguaje ni capacidades multimodales. Su relevancia actual radica en el despliegue en cliente: inferencia aislada en el dispositivo, sin coste de servidor y con garantias de privacidad, algo poco habitual en herramientas de edicion de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MI-GAN: red generativa de inpainting con bloques de agregacion de caracteristicas y modulacion (variante movil). LaMa: red de inpainting con convoluciones de Fourier (FFC) y convoluciones dilatadas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | MI-GAN exportado en pipeline v2 (precision no especificada en la model card); LaMa en FP32 |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | MIT para MI-GAN; Apache 2.0 para LaMa |
| Formato de pesos | ONNX (opset 17 en LaMa; opset no indicado para MI-GAN) |

## Arquitectura y entrenamiento

MI-GAN se presenta en el paper como un baseline simple para inpainting en dispositivos moviles, con un generador que combina agregacion de caracteristicas y modulacion para mantener un coste computacional bajo. La exportacion `migan_pipeline_v2.onnx` integra el preprocesado (redimensionado de entrada y mascara) y el postprocesado (pegado del parche generado sobre la imagen original), de modo que el consumidor solo aporta tensor uint8 RGB y mascara. LaMa emplea convoluciones de Fourier para capturar contexto global y es robusta a resoluciones distintas; la exportacion de Carve fija la entrada en 512x512.

La model card no documenta el numero de tokens, la composicion del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en inpainting). Tampoco se detallan los datos de entrenamiento especificos de cada modelo mas alla de las referencias a los papers originales.

## Capacidades

- Inpainting de imagenes: reconstruccion de regiones enmascaradas a partir del contexto circundante.
- Eliminacion de objetos y marcas de agua en imagenes y fotogramas de video.
- Procesamiento local en navegador mediante `onnxruntime-web`, sin llamadas a servidor.
- MI-GAN acepta resoluciones arbitrarias y gestiona el redimensionado interno; LaMa requiere entrada 512x512.
- Dos niveles de calidad: rapido (MI-GAN, 28 MB) y maxima calidad (LaMa FP32, 208 MB).
- No soporta tool calling, agentes, razonamiento multi-paso, vision semantica ni texto.

## Casos de uso

- Eliminacion de marcas de agua en material propio: el usuario carga una imagen o video del que posee derechos y el modelo reconstruye la zona marcada en local, sin subir el archivo a ningun servidor.
- Edicion de fotografia en el navegador: integracion del ONNX en un editor web para borrar objetos no deseados (personas, cables, texto) mediante mascara manual.
- Limpieza de material de archivo: retirada de logotipos de stock en copias licenciadas para uso interno, con el modelo ejecutandose en la maquina del operador.
- Herramienta de escritorio o PWA offline: empaquetado del modelo en una aplicacion instalable que funciona sin conexion tras la primera descarga y cacheado del archivo.
- Preprocesado en pipelines de vision: eliminacion de marcas de agua antes de tareas de OCR o deteccion de objetos, usando MI-GAN por su bajo coste (28 MB) en entornos con recursos limitados.
- Prototipado y demostraciones: el tamano reducido de MI-GAN permite incluirlo en demos web sin infraestructura de GPU, y LaMa como opcion opt-in para resultados de mayor fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (PSNR, SSIM, FID) ni comparativas de latencia o throughput para ninguna de las dos exportaciones ONNX.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por tamano de pesos, MI-GAN requiere del orden de decenas de MB y LaMa FP32 del orden de 208 MB de pesos, mas memoria de activaciones.
- GPU recomendadas: no especificadas; el destino declarado es ejecucion en navegador via WebGPU/WebGL con `onnxruntime-web`, por lo que el hardware objetivo es el del cliente, no un servidor.
- Cabe en GPU consumer: si, ambas exportaciones estan disenadas para ejecutarse en el dispositivo del usuario; MI-GAN esta pensado para moviles.
- Opciones de despliegue: `onnxruntime-web` (navegador), y en servidor cualquier runtime ONNX compatible (ONNX Runtime, etc.).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| MI-GAN (incluido) | no disponible | cualquier resolucion | MIT | ONNX | HuggingFace (`andraniksargsyan/migan`) |
| LaMa (incluido) | no disponible | 512x512 fija | Apache 2.0 | ONNX | HuggingFace (`Carve/LaMa-ONNX`) |
| Otros modelos de inpainting | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio es un espejo; no se ofrecen garantias de mantenimiento ni actualizaciones por parte de ravetools.
- La licencia de los pesos de LaMa no esta explicitamente separada de la licencia del codigo upstream; los mantenedores remiten a Apache 2.0, pero hay peticiones abiertas de aclaracion (#365, #368). Verificar antes de uso comercial.
- LaMa tiene entrada fija de 512x512, lo que puede degradar resultados en imagenes de alta resolucion o con detalles finos.
- MI-GAN prioriza velocidad y tamano reducido; la calidad de reconstruccion en regiones grandes o texturadas puede ser inferior a la de LaMa.
- Riesgo de artefactos y alucinacion visual: el inpainting genera contenido plausible pero no necesariamente fiel a la escena original.
- Uso etico y legal: la herramienta esta pensada para eliminar marcas de agua de contenido propio; su uso sobre material de terceros puede infringir derechos de autor.
- No hay informacion sobre sesgos, ya que no es un modelo de lenguaje ni de clasificacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ravetools/watermark-remover
- Herramienta Watermark Remover: https://rave-tools.com/tools/watermark-remover
- MI-GAN (repositorio original): https://github.com/Picsart-AI-Research/MI-GAN
- MI-GAN (pesos upstream): https://huggingface.co/andraniksargsyan/migan
- LaMa (repositorio original): https://github.com/advimman/lama
- LaMa ONNX (exportacion de Carve): https://huggingface.co/Carve/LaMa-ONNX
- Codigo del exportador LaMa: https://github.com/Carve-Photos/lama
- Aclaraciones de licencia LaMa: https://github.com/advimman/lama/issues/132 , https://github.com/advimman/lama/issues/230 , https://github.com/advimman/lama/issues/365 , https://github.com/advimman/lama/issues/368
