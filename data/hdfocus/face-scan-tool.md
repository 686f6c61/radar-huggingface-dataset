# HDFocus/face-scan-tool

## Resumen

HDFocus/face-scan-tool es una herramienta de software, no un modelo de lenguaje o de visión entrenado desde cero. Se presenta como una aplicación Dockerizada que permite subir una imagen de referencia y una URL de sitio web para escanear automáticamente todas las imágenes del sitio, detectando coincidencias faciales o similitudes visuales con la imagen de referencia. El objetivo declarado es la auditoría de materiales visuales en sitios web, probablemente para control de derechos de imagen o verificación de uso indebido de fotografías.

La herramienta combina dos modos de reconocimiento: detección facial mediante los modelos OpenCV YuNet y SFace, y comparación de similitud de imágenes mediante combinación de pHash, dHash, histograma de color y características ORB. Está pensada para sitios web independientes (leyendo sitemaps o rastreando enlaces) y para tiendas de Alibaba International Station, donde enumera productos mediante su API. No se dispone de información sobre parámetros, arquitectura de red neuronal propia, licencia o idiomas, ya que la model card no proporciona esos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Herramienta de software (Docker) que integra OpenCV YuNet (deteccion facial) y SFace (reconocimiento facial), junto con algoritmos de hash perceptual (pHash, dHash), histograma de color y ORB para similitud de imagenes |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (interfaz en chino segun la model card) |
| Licencia | no disponible |
| Formato de pesos | no disponible (los modelos OpenCV y SFace se distribuyen como archivos binarios, pero no se especifica) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento de los modelos subyacentes. La herramienta utiliza modelos preentrenados de codigo abierto: YuNet para deteccion de rostros y SFace para extraccion de embeddings faciales. Para la similitud de imagenes, emplea una combinacion de tecnicas clasicas de vision por computador: pHash y dHash (hashes perceptuales), histograma de color y descriptores ORB. No se documenta ningun proceso de fine-tuning ni datos de entrenamiento propios. La aplicacion se ejecuta en un contenedor Docker con un puerto de aplicacion (7860) y realiza todo el calculo en el servidor, sin enviar las imagenes a servicios externos.

## Capacidades

- Deteccion de rostros en imagenes de sitios web mediante OpenCV YuNet.
- Reconocimiento facial comparando la imagen de referencia con las imagenes escaneadas usando SFace.
- Comparacion de similitud de imagenes sin rostros mediante pHash, dHash, histograma de color y ORB.
- Escaneo automatico de sitios web: lectura de sitemap o rastreo de enlaces internos si no hay sitemap.
- Soporte especifico para tiendas de Alibaba International Station mediante su API de productos.
- Exportacion de resultados a Excel con lista de incidencias.
- Modos de operacion configurables: solo rostro, solo similitud, o ambos.
- Umbrales de coincidencia ajustables por el usuario.

## Casos de uso

- Auditoria de uso no autorizado de imagenes en sitios web: una empresa puede subir la foto de un modelo o producto y escanear un sitio competidor para detectar si se esta usando sin permiso.
- Control de derechos de imagen en campanas publicitarias: verificar que las fotografias contratadas no aparecen en otros sitios no autorizados.
- Monitorizacion de marca: detectar si el logo o material visual de una marca se replica en paginas no oficiales.
- Revision de contenido en tiendas online: comprobar si un vendedor de Alibaba utiliza imagenes de productos de otro proveedor sin licencia.
- Gestion de activos digitales: localizar todas las apariciones de una imagen concreta dentro de un sitio web propio para actualizarla o retirarla.
- Verificacion de identidad en plataformas de citas o redes sociales: aunque no es el proposito declarado, la deteccion facial podria usarse para buscar perfiles con la misma foto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas de precision, recall, velocidad de escaneo ni comparaciones con otras herramientas de deteccion facial o similitud de imagenes.

## Requisitos de hardware

- No se especifican requisitos minimos de hardware en la documentacion disponible.
- Al ser una aplicacion Docker, se puede desplegar en cualquier servidor con Docker instalado, incluyendo instancias cloud de CPU.
- Los modelos YuNet y SFace son ligeros y pueden ejecutarse en CPU sin necesidad de GPU.
- El escaneo de sitios web completos puede consumir ancho de banda y tiempo de CPU proporcional al numero de imagenes a procesar.
- No se indican opciones de despliegue especificas mas alla del contenedor Docker con puerto 7860.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar esta herramienta con alternativas equivalentes. Existen soluciones comerciales de busqueda facial inversa (como PimEyes o SocialFinder) y APIs de deteccion facial (Amazon Rekognition, Google Vision), pero no se conocen datos publicos de rendimiento de esta herramienta concreta. La comparativa no esta disponible.

## Limitaciones y advertencias

- La herramienta depende de la accesibilidad del sitio web objetivo: si el sitio bloquea rastreadores o requiere autenticacion, el escaneo puede fallar o quedar incompleto.
- Para tiendas de Alibaba International Station, la version cloud solo cubre imagenes principales de productos; las imagenes de detalle requieren una sesion de navegador con login local.
- La deteccion facial puede fallar con imagenes de baja resolucion, angulos extremos, oclusiones o condiciones de iluminacion adversas.
- El umbral de similitud recomendado (0.363 para rostros, 0.80 para imagenes) es orientativo y puede requerir ajuste por caso.
- No se especifica la licencia de uso, por lo que no se puede garantizar su uso comercial o modificacion.
- No se documentan medidas de privacidad mas alla de que las imagenes se procesan en el servidor y no se comparten externamente.
- La herramienta no es un modelo de lenguaje ni de generacion; no debe confundirse con un LLM.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HDFocus/face-scan-tool
- No se encontraron otros enlaces relevantes en la busqueda web (papers, blogs, demos) especificos de esta herramienta.
