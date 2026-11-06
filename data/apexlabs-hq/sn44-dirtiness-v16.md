# apexlabs-hq/sn44-dirtiness-v16

## Resumen

`apexlabs-hq/sn44-dirtiness-v16` es un detector de objetos basado en ONNX, publicado por el usuario `apexlabs-hq`, cuyo cometido es identificar cinco clases de suciedad en entornos de interior: derrames de liquido, papeleras, basura, moho y manchas. El modelo se sirve de extremo a extremo mediante `miner.py` con el runtime `onnxruntime` y esta disenado para integrarse en un pipeline de inferencia ya existente, presumiblemente asociado a la subred 44 de Bittensor segun el prefijo `sn44` del identificador.

La model card es extremadamente escueta: no declara arquitectura base, numero de parametros, licencia, idiomas ni pipeline de Hugging Face. El repositorio tiene un tamano reportado de 0.0 GB, lo que sugiere que los pesos no estan subidos al hub o que el conteo de archivos no se ha materializado, y no registra descargas ni interacciones. Se trata, por tanto, de un artefacto de despliegue mas que de un modelo fundacional documentado.

Su relevancia es acotada: sirve como pieza concreta de un sistema de deteccion de suciedad con umbrales de confianza calibrados por clase (0.4 en las cinco clases) y una resolucion de entrada de 736 pixeles. Para un desarrollador externo, la ficha resulta util sobre todo para entender el contrato de inferencia (clases, umbrales, formato ONNX) y no tanto para evaluar capacidades generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de objetos exportado a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara que sea MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 736x736) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las clases estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | ONNX (servido con onnxruntime) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna. La model card unicamente indica que es un "ONNX end-to-end detector" servido a traves de `miner.py` con `onnxruntime`, con un tamano de imagen de entrada de 736 pixeles y cinco clases de salida. El identificador del modelo (`sn44-dirtiness-v16`) y la referencia a un detector base (`manako/Detect-room-dirtiness-detection`) apuntan a un modelo derivado o destilado a partir de otro, pero no se documenta el proceso de entrenamiento, el dataset, el numero de tokens ni si hubo ajuste fino supervisado o tecnicas de aumento de datos.

Tampoco se especifica si el modelo emplea una cabeza de deteccion tipo YOLO, Faster R-CNN, DETR u otra familia. El unico dato verificable es el hash SHA-256 de los pesos (`0402d40c3250744d8ea22c1b34f432ea60554bf2a98360be30cbac8ba4e35196`), que permite comprobar la integridad del artefacto descargado.

## Capacidades

- Deteccion de objetos en imagenes de interiores con cinco clases: derrames de liquido, papeleras, basura, moho y manchas.
- Inferencia de extremo a extremo en formato ONNX, ejecutable con `onnxruntime` sin dependencias de frameworks de entrenamiento.
- Umbral de confianza global de 0.05, con umbrales por clase de 0.4 para las cinco categorias.
- Entrada de imagen redimensionada a 736 pixeles.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes, multilingue, vision general, audio ni modo de razonamiento extendido.

## Casos de uso

- Inspeccion automatizada de habitaciones en alojamientos turisticos: el detector permite revisar fotografias de una habitacion antes de la llegada del huesped y marcar imagenes con presencia de basura, manchas o moho para revision humana.
- Control de calidad en limpieza de oficinas: integrado en una app movil, el operario fotografia la estancia y el modelo devuelve las clases detectadas con sus umbrales, generando un parte automatico de incidencias.
- Monitorizacion de moho en viviendas: al detectar la clase "mould" con umbral 0.4, el sistema puede priorizar inspecciones en inmuebles con riesgo de humedad.
- Gestion de residuos en espacios publicos: la deteccion de "bin" y "litter" permite estimar la densidad de papeleras y residuos por zona a partir de imagenes de camaras fijas.
- Triaje de imagenes en plataformas de mantenimiento: el modelo filtra grandes lotes de fotografias subidas por usuarios, descartando las que no contienen suciedad y derivando solo las relevantes a un operador.
- Preprocesado para modelos de vision-lenguaje: las cajas y clases detectadas pueden alimentar a un VLM posterior que redacte descripciones o recomendaciones de limpieza, usando este detector como etapa barata de filtrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamano del repositorio se reporta como 0.0 GB, por lo que no puede deducirse el tamano de los pesos).
- GPU recomendadas: no disponible; al ser un modelo ONNX de vision, es probable que funcione en CPU y en GPUs de consumo, pero no se confirma.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: `onnxruntime` (CPU o GPU) mediante `miner.py`; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de vision.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparacion con alternativas de deteccion de objetos.

## Limitaciones y advertencias

- La model card no declara licencia, por lo que el uso comercial no esta autorizado de forma explicita y requiere contactar con el autor.
- No se documentan sesgos conocidos, pero al ser un detector de suciedad en interiores, su rendimiento puede degradarse en condiciones de iluminacion, angulos o tipos de superficie no representados en el entrenamiento.
- Riesgo de falsos positivos y negativos inherente a los umbrales por clase (0.4): no se aportan metricas de precision o recall para calibrarlos.
- El modelo esta atado a un pipeline concreto (`miner.py` y `onnxruntime`); no se garantiza compatibilidad con otros runtimes sin conversion.
- No se especifican idiomas ni regiones de despliegue; las etiquetas de clase estan en ingles.
- El repositorio no registra descargas ni likes y su tamano es 0.0 GB, lo que puede indicar que los pesos no estan efectivamente disponibles en el hub.
- No hay informacion sobre el dataset de entrenamiento, por lo que no puede evaluarse la cobertura de dominios (tipos de suelo, materiales, iluminacion).

## Enlaces

- Hugging Face: https://huggingface.co/apexlabs-hq/sn44-dirtiness-v16
- Modelo base referenciado: https://huggingface.co/manako/Detect-room-dirtiness-detection
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales.
