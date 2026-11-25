# mradermacher/LightOnOCR-3-0.8B-MTP-Repacked-i1-GGUF

## Resumen

LightOnOCR-3-0.8B-MTP-Repacked-i1-GGUF es una cuantizacion GGUF del modelo LightOnOCR-3-0.8B-MTP-Repacked, un modelo vision-language de aproximadamente 773 millones de parametros especializado en OCR, comprension de documentos y grounding visual. El modelo original lo desarrolla prithivMLmods, mientras que esta version cuantizada la publica mradermacher usando tecnicas de imatrix para preservar la calidad en tamanos reducidos.

El modelo resuelve el problema de extraer texto e informacion estructurada de documentos, incluyendo PDF, tablas y formularios, combinando percepcion visual con generacion de texto. Su tamano compacto (menos de mil millones de parametros) permite desplegarlo en hardware modesto, incluso en GPUs de consumo, lo que lo hace atractivo para pipelines de digitalizacion y procesamiento documental a gran escala.

La relevancia actual radica en la combinacion de tres factores: un modelo base pequeno y eficiente, cuantizaciones de alta calidad con imatrix (desde Q2_K hasta Q6_K) y una licencia Apache 2.0 permisiva para uso comercial. Esta version concreta esta pensada para su uso con llama.cpp y entornos compatibles con GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language basada en transformer (detalles especificos no disponibles) |
| Parametros totales | 772.845.888 (~0,77 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-Q4_0, i1-IQ4_XS, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un vision-language model orientado a OCR y comprension documental, con aproximadamente 773 millones de parametros. La informacion disponible no detalla la arquitectura interna exacta (composicion del encoder visual, tipo de transformer de lenguaje ni mecanismo de fusion multimodal), por lo que estos datos deben considerarse no disponibles. El sufijo "MTP" en el nombre sugiere multi-token prediction, aunque no se confirma en la documentacion accesible.

Esta version concreta no es un modelo reentrenado, sino una cuantizacion del modelo original de prithivMLmods realizada con mradermacher. Se han generado cuantizaciones ponderadas con imatrix, una tecnica que calibra la cuantizacion usando estadisticas de activacion para reducir la perdida de calidad respecto a cuantizaciones estaticas. No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens, ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos.
- Comprension de documentos: extraccion de texto y estructura de PDF y paginas escaneadas.
- Procesamiento de tablas y formularios con preservacion de estructura.
- Grounding visual: localizacion de elementos dentro de la imagen del documento.
- Generacion de texto conversacional en el contexto de tareas documentales.
- Capacidades vision-language (entrada de imagen y salida de texto).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos del modelo.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion masiva de facturas y recibos: el modelo puede procesar imagenes de facturas y extraer campos estructurados (importes, fechas, emisores) en un pipeline por lotes, aprovechando su tamano reducido para ejecutar muchas inferencias en paralelo en una sola GPU.
- Extraccion de tablas de informes financieros: convierte tablas en imagenes o PDF a texto estructurado, util para ingestas en bases de datos o sistemas de BI.
- Procesamiento de formularios administrativos: lectura de formularios escaneados para prellenar o validar datos en sistemas de gestion documental, reduciendo la introduccion manual.
- Accesibilidad documental: conversion de documentos escaneados a texto legible para lectores de pantalla o sistemas de sintesis de voz.
- Indexacion y busqueda semantica de archivos escaneados: OCR previo a la generacion de embeddings para RAG sobre corpus documentales que solo existen en papel o imagen.
- Digitalizacion de archivos historicos o tecnicos: procesamiento local en entornos con requisitos de privacidad, ya que el modelo cabe en hardware de consumo y puede ejecutarse sin enviar documentos a servicios externos.
- Automatizacion de back-office en PYMEs: despliegue con llama.cpp en un servidor modesto para clasificar y extraer datos de correspondencia y documentacion entrante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,6 GB para cuantizaciones Q2-Q4, 0,7 GB para Q5-Q6, mas el consumo adicional del proyector visual (mmproj) y del contexto.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe holgadamente en GPUs de consumo, incluso en modelos de gama baja y en placas integradas con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, servidores compatibles con llama-cpp); los tags del repositorio incluyen text-generation-inference, aunque el formato GGUF esta orientado a llama.cpp. Los ficheros mmproj necesarios para la parte visual estan en el repositorio estatico del mismo autor.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una latencia baja en GPU moderna, pero no se aportan cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LightOnOCR-3-0.8B-MTP-Repacked-i1-GGUF (este) | ~0,77 B | No disponible | Apache 2.0 | GGUF (imatrix) | Cuantizacion comunitaria del modelo de prithivMLmods |
| LightOnOCR-3-0.8B-MTP-Repacked (base) | ~0,77 B | No disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| LightOnOCR-3-0.8B-MTP-Repacked-GGUF (estatico) | ~0,77 B | No disponible | Apache 2.0 | GGUF (estatico) | Cuantizaciones estaticas del mismo autor, incluye mmproj |

No se dispone de datos de rendimiento comparativo con otros modelos OCR de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Al ser un modelo de menos de mil millones de parametros, es previsible una menor robustez ante documentos complejos, ruido, rotaciones o caligrafia que modelos OCR de mayor tamano; no hay benchmarks que lo confirmen.
- Riesgo de alucinacion en la extraccion de texto: los modelos generativos pueden producir contenido no presente en la imagen, especialmente en regiones de baja calidad. Conviene validar campos criticos en produccion.
- Las cuantizaciones mas agresivas (Q2_K, IQ2, IQ3) degradan la calidad; para OCR se recomienda Q4_K_M o superior.
- Esta version es una cuantizacion no oficial del modelo base; el autor original no la respalda necesariamente.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse que el modelo base y sus dependencias (pesos, tokenizer, encoder visual) mantengan la misma licencia.
- No se dispone de informacion sobre sesgos, datos de entrenamiento ni evaluaciones de robustez.
- Para usar la parte visual es necesario descargar los ficheros mmproj del repositorio estatico; el repositorio i1 no los incluye.

## Enlaces

- Repositorio Hugging Face (esta cuantizacion): https://huggingface.co/mradermacher/LightOnOCR-3-0.8B-MTP-Repacked-i1-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/LightOnOCR-3-0.8B-MTP-Repacked
- Cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/LightOnOCR-3-0.8B-MTP-Repacked-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#LightOnOCR-3-0.8B-MTP-Repacked-i1-GGUF
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
