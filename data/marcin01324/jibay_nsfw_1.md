# Marcin01324/Jibay_NSFW_1

## Resumen

Jibay NSFW-1 es un motor de moderacion de imagenes orientado a la deteccion de contenido explicito (NSFW), desarrollado por el equipo de Jibay (jibay.ir). A diferencia de los modelos de vision basados en redes neuronales profundas, este proyecto esta implementado integramente en PHP 8.1+ y no requiere GPU, Python ni frameworks de aprendizaje automatico (TensorFlow, PyTorch). El repositorio analizado (Marcin01324/Jibay_NSFW_1) es un espejo derivado del modelo base JibayAi/Jibay_NSFW_1.

El sistema no es un modelo de pesos entrenados en el sentido habitual: se trata de un motor de vision por computador clasico y procesamiento estadistico de imagen que combina senales como probabilidad de piel, deteccion cromatica de tonos cutaneos, regiones conectadas, estimacion de cobertura corporal, analisis de textura, entropia de color y proteccion frente a prendas blancas para calcular una puntuacion de confianza de contenido explicito. El resultado se expone mediante una API JSON con campos `explicit`, `score` y `confidence`.

Su relevancia practica reside en el nicho de despliegue: funciona en hosting compartido, VPS economicos, Raspberry Pi o mini PC, con consumo de memoria muy bajo y arranque casi instantaneo. Esta pensado para foros, redes sociales, sistemas de subida de contenido y APIs que necesitan un filtro de imagenes moderado sin infraestructura de GPU. No se han publicado parametros, contexto ni pesos en el sentido de un modelo transformer, por lo que muchas especificaciones habituales no aplican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de vision por computador estadistico en PHP (no es una red neuronal); analisis de piel, textura, color y topologia espacial |
| Parametros totales | no disponible (no aplica; no hay pesos neuronales) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, fa, ar, es, fr, zh, ko, ja (declarados en la model card) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye como codigo PHP; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

El proyecto no sigue una arquitectura de aprendizaje profundo. Segun la model card, el motor analiza caracteristicas de la imagen mediante tecnicas de vision por computador y procesamiento estadistico: probabilidad de piel, deteccion cromatica de tonos cutaneos, regiones conectadas, estimacion de cobertura corporal, deteccion de patrones anatomicos, topologia espacial, analisis de textura, entropia de color, proteccion de prendas blancas, reduccion de falsos positivos, estimacion de confianza, analisis de regiones y agrupamiento de pixeles. Todas estas senales se combinan en una puntuacion de confianza unica.

No se describe ningun proceso de entrenamiento con tokens, dataset, RLHF o DPO, porque no existe tal proceso: las reglas y heuristicas del motor son deterministas y estan codificadas en el propio sistema. La unica dependencia tecnica es la extension PHP Imagick o GD para la manipulacion de imagenes. Se declara como "Version 1" del motor y se indica que futuras versiones mejoraran la precision. No hay informacion sobre el numero de imagenes usadas para calibrar los umbrales ni sobre la metodologia de ajuste.

## Capacidades

- Deteccion automatica de imagenes NSFW o explicitas y clasificacion binaria (`explicit: true/false`) con puntuacion de confianza (`score`, `confidence`).
- Analisis de imagen mediante vision por computador clasica: piel, textura, color, regiones conectadas y topologia espacial.
- Soporte de formatos JPEG, PNG, GIF, WEBP, AVIF y HEIC.
- Compatibilidad tanto con la extension Imagick como con GD de PHP.
- Descarga automatica de imagenes remotas a partir de una URL, con validacion de URL y de red publica.
- Difuminado automatico (blur) de imagenes consideradas explicitas y guardado de la imagen procesada en `storage/moderated/`.
- Umbrales de deteccion configurables.
- API JSON con respuestas estructuradas y codigos de error (`INVALID_URL`, `IMAGE_TOO_LARGE`, `UNSUPPORTED_IMAGE_FORMAT`, `DOWNLOAD_FAILED`).
- Comprobaciones de seguridad integradas y consumo de memoria muy bajo.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto; es un clasificador de imagen, no un modelo generativo.

## Casos de uso

- Moderacion de subidas en foros y comunidades: el motor se invoca via API al recibir una imagen y devuelve `explicit: true/false`; si la puntuacion supera el umbral configurado, la plataforma puede ocultar o difuminar la imagen automaticamente.
- Filtrado en redes sociales o apps de mensajeria con PHP en el backend: al no requerir GPU ni Python, se integra directamente en el mismo servidor que sirve la aplicacion, reduciendo coste de infraestructura.
- Moderacion previa en paneles de administracion: el campo `processed_image` permite guardar la version difuminada y ofrecerla a revisores humanos, que confirman o revierten la decision.
- Despliegue en hosting compartido: proyectos pequenos o personales que no pueden pagar GPU pueden activar un filtro basico subiendo los ficheros a su hosting existente, ya que solo exige PHP 8.1+ y la extension GD o Imagick.
- Integracion en APIs de terceros: el endpoint `index.php?url=...` permite encadenar la moderacion en un pipeline que recibe URLs externas, con validacion de red publica y limites de tamano.
- Edge computing o entornos con restricciones de hardware: Raspberry Pi, mini PC o maquinas virtuales ligeras pueden ejecutar el motor por su bajo consumo de memoria y su arranque casi instantaneo.
- Pre-filtro antes de un modelo de vision mas costoso: en sistemas con deteccion neuronal en GPU, Jibay NSFW-1 puede actuar como primera capa barata y derivar solo los casos dudosos al modelo pesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, F1, AUC ni comparaciones cuantitativas con otros sistemas de moderacion. Solo se menciona de forma cualitativa que el motor "funciona muy bien" pero que ningun sistema de moderacion es 100% perfecto y que puede clasificar incorrectamente algunas imagenes.

## Requisitos de hardware

- No requiere GPU. El proyecto esta disenado para ejecutarse exclusivamente en CPU.
- No requiere Python ni bibliotecas de machine learning.
- Requisitos de software: PHP 8.1 o superior y la extension GD o Imagick.
- Permisos de escritura sobre la carpeta `storage` para guardar las imagenes moderadas.
- Entornos compatibles declarados: hosting compartido, VPS economicos, servidores dedicados, servidores en la nube, localhost, servidores domesticos, Raspberry Pi, mini PC, CPUs Intel y AMD, maquinas virtuales.
- Consumo de memoria: descrito como "extremadamente bajo", sin cifras concretas.
- Tiempo de arranque: descrito como "casi instantaneo", sin cifras concretas.
- Latencia y throughput: no disponibles; dependen del tamano de la imagen, del formato y del hardware.
- Opciones de despliegue: subida directa de ficheros al servidor web (no se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que no aplican a este proyecto).

## Comparativa con modelos similares

| Modelo | Tipo | Hardware | Licencia | Notas |
|---|---|---|---|---|
| Jibay NSFW-1 | Motor PHP de vision por computador estadistico | CPU unicamente | MIT | Ligero, sin dependencias de ML; precision no documentada |
| Clasificadores NSFW neuronales (por ejemplo, basados en CLIP o ResNet) | Red neuronal de clasificacion de imagen | GPU recomendada (o CPU con mayor latencia) | Variable segun el modelo | Mayor precision tipica, pero requiere pesos, frameworks de ML y mas recursos |
| APIs comerciales de moderacion (por ejemplo, servicios cloud de vision) | Servicio gestionado | Infraestructura del proveedor | Comercial | Alta precision, pero coste por uso y dependencia de terceros |

No se dispone de datos cuantitativos para comparar rendimiento entre estas alternativas. La comparativa es cualitativa y se basa en las caracteristicas declaradas en la model card.

## Limitaciones y advertencias

- El propio autor advierte de que ningun sistema de moderacion es 100% perfecto y que algunas imagenes pueden clasificarse incorrectamente; recomienda revision manual en aplicaciones sensibles.
- La model card indica explicitamente que se trata de la "Version 1" y que la precision mejorara en versiones futuras.
- No se publican metricas de falsos positivos ni falsos negativos, por lo que el riesgo de error en produccion no esta cuantificado.
- La deteccion se basa en heuristicas de vision por computador (piel, textura, color, topologia), un enfoque mas fragil ante iluminacion atipica, ilustraciones, imagenes artisticas o contextos no convencionales que los modelos neuronales.
- El repositorio analizado (Marcin01324/Jibay_NSFW_1) presenta 0 descargas y 0 likes, y su fecha de creacion figura como 2026-10-10, posterior a la fecha habitual de consulta; conviene verificar su vigencia y procedencia antes de usarlo.
- El modelo esta marcado como `not-for-all-audiences` en HuggingFace, ya que su proposito es detectar contenido explicito; no debe usarse para generar ni distribuir material NSFW.
- Aunque la licencia es MIT, la model card establece como "obligatorio" mantener el nombre "Jibay" en el proyecto o en los creditos. Esa clausula es una condicion anadida al uso que conviene revisar antes de un despliegue comercial.
- Los idiomas declarados (en, fa, ar, es, fr, zh, ko, ja) son etiquetas de la model card; al no ser un modelo de texto, su relevancia funcional para la deteccion de imagenes no esta justificada en la documentacion.
- No hay informacion sobre sesgos, robustez frente a adversarios ni comportamiento con imagenes sinteticas o generadas por IA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Marcin01324/Jibay_NSFW_1
- Modelo base: https://huggingface.co/JibayAi/Jibay_NSFW_1
- Sitio web del proyecto: https://jibay.ir
