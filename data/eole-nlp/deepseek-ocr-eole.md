# eole-nlp/DeepSeek-OCR-eole

## Resumen

DeepSeek-OCR-eole es un checkpoint preconvertido al formato del framework Eole del modelo deepseek-ai/DeepSeek-OCR, publicado por el equipo eole-nlp. No se trata de un modelo entrenado desde cero ni de un ajuste fino: es un empaquetado de pesos ya convertidos, almacenados en BF16 y acompañados de la configuración y el tokenizador necesarios para cargarlos con Eole 0.6.4. El pipeline declarado es image-text-to-text, es decir, un modelo de visión-lenguaje orientado a la transcripción de imágenes a texto.

El interés practico es claro: DeepSeek-OCR no es un checkpoint compatible con Transformers, y esta conversión permite ejecutarlo en el runtime de Eole, con prompts y configuraciones de serving documentadas en las recipes del proyecto. Para equipos que ya operan Eole o que necesitan una via de despliegue alternativa a la pila estandar, el artefacto evita tener que reproducir la conversion. El repositorio incluye un manifiesto con digests SHA256 y un fichero de validacion con pruebas de humo de inferencia offline superadas.

Ahora bien, el modelo se publica sin evaluacion de calidad: el propio autor indica que las comprobaciones son validacion funcional, no benchmarks. Con 3.336.106.240 parametros (unos 3,34 mil millones) y 6,7 GB de repositorio, esta pensado para inferencia, no como evidencia de rendimiento frente al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de visión-lenguaje (image-text-to-text) derivado de deepseek-ai/DeepSeek-OCR; el detalle de capas, atencion y encoder visual no esta disponible en la informacion proporcionada |
| Parametros totales | 3.336.106.240 (~3,34 mil millones), segun los datos de safetensors |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 en el checkpoint publicado; no se distribuyen variantes GGUF, INT8 ni INT4 |
| Idiomas soportados | No disponible (la model card no declara idiomas y los metadatos no incluyen etiquetas de idioma) |
| Licencia | MIT |
| Formato de pesos | safetensors en BF16, con config y nombres de tensores en formato Eole (no es un checkpoint Transformers) |
| Modelo base | deepseek-ai/DeepSeek-OCR |
| Runtime requerido | Eole 0.6.4 con las dependencias opcionales de esta arquitectura |
| Tamano del repositorio | 6,7 GB |
| Revision upstream de referencia | 9f30c71f441d010e5429c532364a86705536c53a |
| Revision de codigo Eole | 0c9b3f7ea253b1b977ef47a01ef2a8c6b130f22b |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna ni el proceso de entrenamiento. Lo que consta es que se trata de una conversion de un checkpoint existente de DeepSeek-OCR: los pesos conservan los valores convertidos localmente y el empaquetado no los recuantiza ni los normaliza. Los pesos en coma flotante se almacenan en BF16 y el comportamiento de normalizacion en FP32 de Eole se mantiene sin cambios. El tokenizador y la configuracion de runtime van incluidos, con rutas basadas en `${MODEL_PATH}` para que el checkpoint se pueda mover.

Tampoco hay datos sobre numero de tokens de entrenamiento, composicion del dataset, RLHF/DPO ni innovaciones tecnicas del modelo original. La model card es explicita sobre la procedencia: la conversion la suministro el mantenedor, el commit del conversor y la vinculacion exacta con la revision de origen no se registraron, y la revision upstream cacheada es metadato de referencia, no un registro de conversion verificado. Las unicas comprobaciones publicadas son pruebas de humo de inferencia offline sobre el paquete local y sobre una descarga limpia del Hub, con coincidencia de todos los digests SHA256 frente al manifiesto.

## Capacidades

- Conversion de imagen a texto (image-text-to-text), orientada a tareas de OCR y transcripcion documental.
- Procesamiento de documentos escaneados dentro del runtime Eole, con prompts especificos documentados en las recipes del proyecto.
- Carga en BF16 con tokenizador y configuracion incluidos, sin necesidad de reconstruir la conversion.
- Despliegue reproducible mediante descarga de un commit fijado del Hub con `huggingface_hub.snapshot_download`.
- Verificacion de integridad de artefactos mediante `model-manifest.json` (estadisticas de tensores y SHA256 por fichero).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; no se declaran idiomas.
- Modo thinking, vision mas alla del pipeline declarado, audio: no disponible.

## Casos de uso

- Digitalizacion masiva de fondos documentales: el modelo recibe imagenes de paginas escaneadas y devuelve texto, lo que permite alimentar pipelines de archivo y biblioteca digital sin depender de un OCR clasico basado en segmentacion de caracteres.
- Ingesta para RAG sobre PDFs escaneados: la transcripcion a texto actua como paso previo al troceado y a la indexacion vectorial, de modo que documentos sin capa de texto entran en el corpus recuperable.
- Extraccion de datos en facturas y formularios: la salida textual del modelo se postprocesa con reglas o un segundo modelo para poblar campos estructurados; es adecuado porque concentra la transcripcion en un unico modelo de vision-lenguaje.
- Accesibilidad: conversion de documentos graficos a texto para alimentar sintesis de voz o lectores de pantalla en servicios de biblioteca accesible.
- Procesamiento por lotes en infraestructura propia: al caber en una GPU de 24 GB en BF16, permite trabajos nocturnos de digitalizacion en servidores moderados, con el coste controlado y sin salida a APIs externas.
- Reproducibilidad de despliegues: el manifiesto con SHA256 y las pruebas de humo incluidas permiten fijar una version concreta del artefacto y verificar que lo desplegado es exactamente lo publicado, algo relevante en entornos regulados.
- Evaluacion de runtimes alternativos: util para investigadores que comparan el comportamiento de Eole frente a la pila original sobre el mismo modelo base, ya que el checkpoint evita la conversion manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que las comprobaciones realizadas son validacion funcional de inferencia (dispositivo, precision y salidas de humo en `validation.json`), no una evaluacion de calidad o de benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: alrededor de 6,7 GB solo para pesos; con activaciones, cache y procesamiento de imagenes se situa de forma realista en el rango de 9 a 12 GB. Es una estimacion derivada del numero de parametros, no una medida publicada.
- Cuantizaciones inferiores: al no distribuirse variantes GGUF ni INT8/INT4, no hay cifras de VRAM para esos formatos; habria que generarlas por cuenta propia.
- GPU de datacenter recomendadas: A100 (40/80 GB), H100, L40S o A10G; el modelo es pequeno para estas tarjetas, por lo que se pueden ejecutar varias instancias por GPU.
- GPU de consumo: cabe en BF16 en RTX 4090, RTX 3090 y RTX 4080 (16 GB o mas). En tarjetas de 8-12 GB haria falta cuantizacion, no publicada.
- Opciones de despliegue: Eole 0.6.4 con las dependencias opcionales de la arquitectura, que es el unico runtime confirmado. vLLM, llama.cpp, Ollama y TGI no estan confirmados: no hay GGUF y la configuracion no es de Transformers.
- Latencia y throughput: no disponibles. No se han publicado mediciones y dependeran del numero y resolucion de las imagenes, del lote y de la GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Runtime / formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-OCR-eole | 3,34B | No disponible | MIT | Eole 0.6.4, safetensors BF16 | Conversion de terceros; 0 descargas y 0 likes en el momento de la consulta; sin benchmarks |
| deepseek-ai/DeepSeek-OCR (upstream) | 3,34B (misma arquitectura, segun el campo base_model) | No disponible | No verificada en la informacion disponible; MIT en los metadatos de esta conversion | Pesos originales | Referencia de origen; la revision cacheada es 9f30c71f441d010e5429c532364a86705536c53a |
| Qwen2.5-VL-3B | ~3B (dato de conocimiento general, no verificado) | No disponible | Apache-2.0 (no verificado) | Transformers, vLLM | Alternativa de vision-lenguaje de tamano parecido; requiere verificacion |
| GOT-OCR2.0 | ~0,58B (dato de conocimiento general, no verificado) | No disponible | Apache-2.0 (no verificado) | Transformers | Modelo especializado en OCR; requiere verificacion |

Los datos de las alternativas no forman parte de la informacion proporcionada y se marcan como no verificados; conviene contrastarlos antes de usarlos en una decision de arquitectura.

## Limitaciones y advertencias

- Ausencia total de evaluacion de calidad: no hay MMLU, no hay benchmarks de OCR, no hay comparacion con el modelo original. Solo pruebas de humo funcionales.
- La vinculacion con la revision upstream no esta registrada: el propio autor advierte que el commit del conversor y la revision exacta de origen no se documentaron, por lo que no se puede garantizar que los pesos equivalgan a una revision concreta del repositorio oficial.
- Incompatibilidad con Transformers: la config y los nombres de tensores son de Eole. Cargar el repositorio con `from_pretrained` de Transformers no funcionara.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, autor no verificado como fuente principal del modelo original. No hay evidencia de uso en produccion.
- Idiomas y contexto sin declarar: no se puede asumir cobertura multilingue ni una ventana de contexto concreta sin probarlo.
- Riesgo de alucinacion inherente a los modelos generativos de imagen a texto: en OCR, esto se traduce en texto inventado en zonas degradadas, borrosas o con tablas complejas. Requiere validacion en el dominio objetivo.
- Licencia MIT en este repositorio, pero la licencia y la atribucion del modelo upstream deben revisarse por separado; el paquete incluye `UPSTREAM_README.md` y la licencia correspondiente.
- Sin informacion sobre sesgos: no hay model card de sesgos ni evaluaciones de equidad.
- En produccion, fijar siempre un commit concreto del Hub y verificar los SHA256 del manifiesto; no usar la rama principal por defecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eole-nlp/DeepSeek-OCR-eole
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-OCR
- Repositorio de Eole: https://github.com/eole-nlp/eole
- Recipes de Eole (prompts y configuraciones de serving): https://github.com/eole-nlp/eole/tree/main/recipes
- Manifiesto de tensores y digests: https://huggingface.co/eole-nlp/DeepSeek-OCR-eole/blob/main/model-manifest.json
- Resultados de validacion: https://huggingface.co/eole-nlp/DeepSeek-OCR-eole/blob/main/validation.json
- Documentacion upstream incluida: https://huggingface.co/eole-nlp/DeepSeek-OCR-eole/blob/main/UPSTREAM_README.md

Nota: las busquedas web realizadas devolvieron unicamente resultados no relacionados con el modelo (un servicio de biblioteca accesible frances, una asociacion de vivienda, un fabricante de separaciones acusticas, el proyecto de infraestructura RER E y el articulo de mitologia sobre Eolo), por lo que no aportan enlaces tecnicos adicionales.
