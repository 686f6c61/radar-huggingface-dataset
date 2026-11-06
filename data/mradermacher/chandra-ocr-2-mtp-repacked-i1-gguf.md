# mradermacher/chandra-ocr-2-MTP-Repacked-i1-GGUF

## Resumen

chandra-ocr-2-MTP-Repacked-i1-GGUF es una cuantizacion GGUF del modelo prithivMLmods/chandra-ocr-2-MTP-Repacked, un modelo especializado en OCR y conversion de documentos (PDF, imagenes) a Markdown, JSON y HTML con preservacion de layout. El modelo original procede de datalab-to/chandra-ocr-2, y esta version ha sido repackada por prithivMLmods y cuantizada por mradermacher con el fin de facilitar su ejecucion en llama.cpp y entornos de inferencia local.

Se trata de un modelo de vision-lenguaje (VLM) de tipo transformer, con 1.797.272 parametros reportados en los safetensors del repositorio base, lo que lo situa en una escala muy reducida y apta para despliegue en hardware modesto. El repositorio incluye unicamente el fichero imatrix (0,1 GB) para generar cuantizaciones propias; los pesos cuantizados completos y los ficheros mmproj de vision se alojan en el repositorio estatico enlazado por el autor.

La relevancia actual radica en la demanda de pipelines de extraccion documental local, sin dependencia de APIs externas, para tareas de digitalizacion, RAG sobre PDF y automatizacion de back-office. La licencia OpenRAIL permite uso comercial con restricciones de uso responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision-lenguaje (VLM), segun tags del modelo base |
| Parametros totales | 1.797.272 (safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_XS, small-IQ4_NL, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | en |
| Licencia | openrail (OpenRAIL, enlace a LICENSE del modelo original datalab-to/chandra-ocr-2) |
| Formato de pesos | GGUF (llama.cpp); imatrix incluido en este repo; quants estaticos y mmproj en el repo estatico |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de su naturaleza de modelo de vision-lenguaje para OCR y comprension de layout documental. El modelo base prithivMLmods/chandra-ocr-2-MTP-Repacked deriva de datalab-to/chandra-ocr-2, orientado a la conversion de documentos a Markdown, JSON y HTML preservando estructura y layout. El sufijo "MTP" en el nombre sugiere multi-token prediction, aunque la model card no lo confirma explicitamente.

No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Esta version concreta es una cuantizacion con imatrix (weighted/imatrix quants) generada por mradermacher, que mejora la calidad de las cuantizaciones de baja precision respecto a las estaticas del repositorio paralelo chandra-ocr-2-MTP-Repacked-GGUF.

## Capacidades

- OCR de documentos e imagenes con salida en Markdown, JSON y HTML.
- Preservacion de layout documental (tablas, estructura de bloques, orden de lectura).
- Conversion de PDF a Markdown estructurado.
- Generacion de texto condicionada por imagen (vision-lenguaje).
- Soporte de inferencia via llama.cpp (llama-cli) y transformers.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles.
- Capacidad multilingue limitada: solo ingles declarado en la model card.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking o razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de facturas y albaranes: el modelo convierte PDFs escaneados a JSON estructurado, lo que permite alimentar sistemas de contabilidad sin intervencion manual.
- Construccion de bases de conocimiento para RAG: extraccion de texto y estructura de PDFs tecnicos a Markdown para su indexacion en pipelines de recuperacion aumentada.
- Migracion de documentacion legacy: conversion masiva de manuales en PDF a HTML o Markdown para portales web y wikis internas.
- Automatizacion de back-office en seguros: extraccion de campos de polizas y siniestros con salida JSON validable contra esquemas.
- Procesamiento de informes financieros: conversion de tablas y graficos textuales a Markdown preservando el layout para revision humana.
- Pipelines locales sin conexion: al ser un GGUF ejecutable en llama.cpp, permite OCR en entornos air-gapped donde no se pueden enviar documentos a APIs externas.
- Preprocesado para entrenamiento de otros modelos: generacion de corpus Markdown limpio a partir de archivos PDF heterogeneos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; con 1.797.272 parametros y cuantizaciones de 1 a 6 bits, el peso de los tensores es del orden de megabytes, por lo que la VRAM dominante proviene del contexto y del proyector de vision (mmproj).
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM deberia ser suficiente para las cuantizaciones mayores; no se dispone de datos oficiales de requisitos.
- Cabe en GPU consumer: si, previsiblemente en GTX 1060 6 GB, RTX 3060, RTX 4060 y superiores, aunque no hay confirmacion oficial.
- Opciones de despliegue: llama.cpp (llama-cli), transformers, text-generation-inference segun tags; Ollama y vLLM no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chandra-ocr-2-MTP-Repacked-i1-GGUF (este) | 1.797.272 | no disponible | OCR/VLM documental, GGUF | OpenRAIL | Hugging Face (mradermacher) |
| chandra-ocr-2-MTP-Repacked (base) | 1.797.272 | no disponible | OCR/VLM documental, safetensors | OpenRAIL | Hugging Face (prithivMLmods) |
| chandra-ocr-2 (original) | no disponible | no disponible | OCR/VLM documental | OpenRAIL | Hugging Face (datalab-to) |
| chandra-ocr-2-MTP-Repacked-GGUF (estatico) | 1.797.272 | no disponible | OCR/VLM documental, GGUF estatico | OpenRAIL | Hugging Face (mradermacher) |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion en la transcripcion de texto manuscrito o de baja calidad, comun en modelos OCR de escala reducida.
- El repositorio principal solo contiene el fichero imatrix; los pesos cuantizados y los ficheros mmproj deben descargarse del repositorio estatico enlazado.
- La licencia OpenRAIL impone restricciones de uso responsable; es necesario revisar el LICENSE del modelo original antes de uso comercial.
- El modelo base es un repack de terceros (prithivMLmods) sobre datalab-to/chandra-ocr-2; posibles desviaciones respecto al original no documentadas.
- Sin datos publicados de benchmarks, contexto maximo ni evaluacion de sesgos; no apto para produccion sin validacion propia.
- El numero de parametros reportado (1.797.272) es inusualmente bajo para un VLM; conviene verificar la integridad del modelo base antes de desplegarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/chandra-ocr-2-MTP-Repacked-i1-GGUF
- Modelo base (repack): https://huggingface.co/prithivMLmods/chandra-ocr-2-MTP-Repacked
- Modelo original: https://huggingface.co/datalab-to/chandra-ocr-2
- Licencia original: https://huggingface.co/datalab-to/chandra-ocr-2/blob/main/LICENSE
- Quants estaticos: https://huggingface.co/mradermacher/chandra-ocr-2-MTP-Repacked-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#chandra-ocr-2-MTP-Repacked-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
