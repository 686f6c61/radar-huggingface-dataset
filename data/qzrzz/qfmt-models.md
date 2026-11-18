# qzrzz/qfmt-models

## Resumen

QFmt Models es un repositorio de pesos de inferencia empaquetados para QFmt, una aplicacion de procesamiento de imagenes para Apple Silicon. No se trata de un modelo de lenguaje ni de un modelo fundacional unico, sino de una coleccion de tres grupos de pesos convertidos a formatos Core ML y ONNX: Segment Anything (SAM ViT-B) para segmentacion, Real-ESRGAN para reescalado de imagen y pesos YOLO para enmascaramiento automatico de privacidad.

El repositorio lo mantiene el usuario qzrzz y actua como catalogo de distribucion desde el que la aplicacion QFmt descarga los pesos bajo demanda desde el menu Settings → Models. Cada grupo incluye un catalogo firmado y los pesos se verifican mediante firma del manifiesto y digests SHA-256 antes de la instalacion, lo que anade una capa de integridad en la cadena de suministro.

Su relevancia es acotada pero concreta: ofrece un mecanismo reproducible de distribucion de modelos de vision para macOS en Apple Silicon, con conversion a Core ML y soporte de importacion offline. No hay informacion publica sobre arquitecturas propias, datos de entrenamiento ni benchmarks; los pesos son conversiones de modelos upstream de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pesos convertidos de SAM ViT-B, Real-ESRGAN y YOLO) |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (licencias de terceros por paquete; ver THIRD_PARTY.md y ThirdPartyNotices.md) |
| Formato de pesos | Core ML y ONNX; catalogos firmados con manifest.json, manifest.sig y archive.part-* |
| Tamano del repositorio | 0,5 GB |
| Plataforma objetivo | Apple Silicon (Core ML) |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

El repositorio no define arquitecturas propias ni documenta procesos de entrenamiento. Contiene pesos ya entrenados por terceros y convertidos para su uso en QFmt. Los tres grupos identificados son: SAM ViT-B para segmentacion de imagenes, modelos Real-ESRGAN convertidos a Core ML para superresolucion y pesos YOLO para enmascaramiento automatico de privacidad.

La innovacion tecnica del paquete no esta en el modelado sino en la distribucion: catalogos firmados por grupo, verificacion de firma del manifiesto y comprobacion de digests SHA-256 antes de instalar, ademas de un flujo de importacion offline descargando manifest.json, manifest.sig y todos los archive.part-* del mismo directorio. No se dispone de informacion sobre volumen de datos, composicion del dataset ni tecnicas de alineacion, al tratarse de conversiones de modelos upstream.

## Capacidades

- Segmentacion de imagenes mediante SAM ViT-B, util para seleccion de objetos y mascaras.
- Superresolucion y reescalado de imagen mediante modelos Real-ESRGAN convertidos a Core ML.
- Deteccion de objetos con pesos YOLO orientada al enmascaramiento automatico de privacidad.
- Procesamiento de imagen local en Apple Silicon mediante Core ML.
- Soporte de formatos ONNX y Core ML en el repositorio.
- Instalacion verificada criptograficamente mediante firma de manifiesto y SHA-256.
- Importacion offline de paquetes completos.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni multilingues.

## Casos de uso

- Edicion fotografica con seleccion de sujeto: SAM ViT-B permite generar mascaras precisas de objetos o personas para aplicar ajustes locales sin recorte manual.
- Mejora de resolucion de imagenes antiguas o de baja calidad: los modelos Real-ESRGAN en Core ML permiten reescalar fotografias localmente en un Mac con Apple Silicon.
- Anonimizacion automatica de imagenes antes de publicarlas: los pesos YOLO del grupo sensitive permiten detectar y enmascarar rostros o elementos sensibles de forma automatizada.
- Preparacion de datasets de vision por computador: la segmentacion y deteccion facilitan el etiquetado asistido y la generacion de mascaras de entrenamiento.
- Integracion en flujos de trabajo de escritorio en macOS: QFmt descarga los pesos bajo demanda, lo que simplifica el despliegue en equipos de diseno o fotografia sin gestion manual de dependencias.
- Verificacion de integridad en entornos con requisitos de seguridad: la firma del manifiesto y los digests SHA-256 permiten auditar que los pesos instalados son los esperados, con opcion de instalacion offline.
- Prototipado de pipelines de vision en local: el soporte ONNX y Core ML permite probar segmentacion, superresolucion y deteccion sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma objetivo: Apple Silicon con soporte Core ML; no se documentan requisitos para GPU NVIDIA o AMD.
- VRAM estimada: no disponible. Al ejecutarse en Apple Silicon, el consumo se reparte entre memoria unificada y Neural Engine/GPU integrada, sin cifras publicadas.
- GPU recomendadas: no disponible; el diseno apunta a chips de Apple (serie M) por el uso de Core ML.
- Compatibilidad con GPU de consumo: no confirmada para RTX 4090 u otras; el foco declarado es Apple Silicon.
- Opciones de despliegue: aplicacion QFmt con descarga desde Settings → Models o importacion offline de paquetes; ejecucion via Core ML y ONNX Runtime segun el formato.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 0,5 GB, aunque la descarga se realiza por grupos de modelos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QFmt Models | Paquete de pesos de vision (SAM, Real-ESRGAN, YOLO) | no disponible | no aplica | other (terceros) | Hugging Face, 0 descargas, 0 likes |
| SAM ViT-B original (Meta) | Segmentacion de imagenes | no disponible en esta ficha | no aplica | licencia upstream de Meta | Ampliamente disponible |
| Real-ESRGAN original | Superresolucion de imagen | no disponible en esta ficha | no aplica | licencia upstream | Ampliamente disponible |
| Pesos YOLO originales | Deteccion de objetos | no disponible en esta ficha | no aplica | licencia upstream | Ampliamente disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no ofrece generacion de texto, razonamiento, codigo ni capacidades conversacionales.
- Los pesos son conversiones de modelos de terceros; los terminos de uso dependen de las licencias upstream recogidas en THIRD_PARTY.md y ThirdPartyNotices.md.
- La licencia declarada es "other", lo que exige revisar caso por caso antes de un uso comercial.
- No hay informacion sobre sesgos, tasas de alucinacion o errores especificos de los modelos convertidos.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion publica de la comunidad.
- La fecha de creacion indicada (2026-11-18) es futura respecto a la informacion habitual de catalogos, lo que conviene verificar antes de depender del paquete.
- Dependencia de la aplicacion QFmt y de Apple Silicon para el flujo previsto; el soporte fuera de ese entorno no esta documentado.
- La instalacion requiere verificar la firma del manifiesto y los digests SHA-256; omitir esa comprobacion elimina la garantia de integridad.
- No se documentan limites de contexto, idioma ni cuantizacion porque no aplican o no estan disponibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/qzrzz/qfmt-models
- Repositorio de la aplicacion QFmt: https://github.com/qzrzz/QFmt
- Avisos de terceros del grupo selection: https://huggingface.co/qzrzz/qfmt-models/blob/main/selection/THIRD_PARTY.md
- Avisos de terceros del grupo upscale: https://huggingface.co/qzrzz/qfmt-models/blob/main/upscale/ThirdPartyNotices.md
- Avisos de terceros del grupo sensitive: https://huggingface.co/qzrzz/qfmt-models/blob/main/sensitive/THIRD_PARTY.md
