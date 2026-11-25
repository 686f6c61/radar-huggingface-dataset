# mradermacher/OCRia-1-MTP-Repacked-GGUF

## Resumen

OCRia-1-MTP-Repacked-GGUF es una distribucion en formato GGUF del modelo OCRia-1-MTP-Repacked, un modelo especializado en OCR y parseo de documentos (PDF, tablas, graficos) hacia Markdown. El modelo original lo desarrolla prithivMLmods sobre la base OCRia-1 de LlamaIndex, y esta version la publica mradermacher, autor habitual de cuantizaciones GGUF para llama.cpp. El modelo incorpora la etiqueta MTP (multi-token prediction) y speculative decoding, orientadas a acelerar la inferencia en pipelines de document parsing.

Con 333.514.240 parametros (unos 333M), se trata de un modelo pequeno y ligero, pensado para ejecutarse en hardware modesto y en entornos de produccion de alto volumen donde el coste por pagina procesada importa. Su enfoque es monomodal de texto e imagen orientado a documentos: recibe una pagina o imagen y produce Markdown estructurado, incluyendo tablas y graficos.

Es relevante ahora porque el parseo fiable de documentos a Markdown es una pieza clave en pipelines RAG y de extraccion de datos, y este modelo ofrece una alternativa compacta y cuantizable en GGUF que puede desplegarse en CPU o GPU consumer, con soporte declarado para text-generation-inference y speculative decoding.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal de documentos; incluye proyector multimodal mmproj) |
| Parametros totales | 333.514.240 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS; mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en (ingles) |
| Licencia | ocria-1-license (other; enlace a LICENSE del modelo base) |
| Formato de pesos | GGUF (cuantizaciones estaticas); repositorio de 0,7 GB |

## Arquitectura y entrenamiento

No se dispone en la informacion proporcionada de detalles sobre la arquitectura interna (tipo de transformer, atencion, composicion del dataset de entrenamiento, numero de tokens, ni si hubo RLHF/DPO). La model card del repositorio cuantizado no incluye esa informacion; solo indica que se trata de cuantizaciones estaticas del modelo prithivMLmods/OCRia-1-MTP-Repacked.

Las etiquetas del modelo apuntan a dos innovaciones tecnicas: MTP (multi-token prediction) y speculative-decoding, orientadas a reducir la latencia de generacion. El paquete incluye un fichero mmproj-f16 (proyector multimodal) necesario para el procesamiento de imagenes de documentos. No hay datos disponibles sobre la longitud de contexto ni sobre la estrategia de entrenamiento.

## Capacidades

- OCR de documentos: conversion de imagenes de paginas y PDF a texto.
- Parseo a Markdown: generacion de Markdown estructurado a partir de documentos.
- Extraccion de tablas: reconocimiento y reconstruccion de tablas en el Markdown de salida.
- Interpretacion de graficos: etiqueta explicita de soporte de charts en el parseo de documentos.
- Procesamiento multimodal: incluye proyector mmproj para entrada de imagen.
- Aceleracion por speculative decoding y multi-token prediction (MTP) para inferencia mas rapida.
- Compatibilidad declarada con text-generation-inference y endpoints.
- Generacion de texto: si, como capacidad base del modelo.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la metadata.

## Casos de uso

- Pipeline RAG sobre documentos corporativos: el modelo convierte PDFs e imagenes de paginas a Markdown limpio que despues se trocea e indexa en un almacen vectorial; su tamano reducido permite procesar lotes grandes de documentos a bajo coste.
- Digitalizacion de facturas y formularios con tablas: la capacidad de reconstruir tablas en Markdown facilita la extraccion posterior de campos estructurados con expresiones regulares o parsers de tablas.
- Extraccion de datos de informes financieros: los graficos e imagenes de informes se convierten a descripcion textual y tablas, alimentando modelos de analisis de mayor tamano en una etapa posterior.
- Procesamiento por lotes en CPU: gracias a las cuantizaciones Q4_K_M y Q5_K_M y a su tamano de 333M parametros, puede ejecutarse en servidores sin GPU para ingesta masiva nocturna de documentos.
- Servicio de conversion PDF a Markdown como API: desplegado con llama.cpp o TGI, expone un endpoint que recibe una imagen de pagina y devuelve Markdown, integrable en herramientas de documentacion o wikis internas.
- Preprocesado para modelos grandes: actua como etapa de normalizacion de documentos antes de pasarlos a un LLM de mayor contexto, reduciendo tokens y ruido de formato.
- Aceleracion con speculative decoding: en despliegues con llama.cpp, el uso de MTP y decodificacion especulativa reduce la latencia por pagina en cargas interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la etiqueta parsebench, pero no incluye cifras de evaluacion.

## Requisitos de hardware

- VRAM estimada: con 333M parametros, la inferencia en f16 requiere aproximadamente 0,7 GB de pesos mas overhead; las cuantizaciones Q4_K_M rondan los 0,2-0,3 GB, y Q8_0 alrededor de 0,35 GB. El proyector mmproj-f16 anade unos 0,8 GB en el repositorio (tamano de fichero).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 y H100 quedan sobradamente cubiertas y permiten alto throughput por batching.
- GPU consumer: si, cabe holgadamente en cualquier GPU consumer moderna e incluso en GPUs integradas con suficiente memoria compartida.
- Despliegue: llama.cpp y Ollama para GGUF; text-generation-inference segun la metadata; tambien es posible usar el formato original con transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada; el uso de MTP y speculative decoding esta orientado a reducir la latencia, pero no se aportan cifras.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de OCR/document parsing que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Idioma: el modelo declara unicamente ingles; el rendimiento en documentos en castellano no esta garantizado.
- Contexto: no se especifica la longitud de contexto, lo que impide planificar el procesamiento de paginas largas o documentos de varias paginas en una sola pasada.
- Licencia: ocria-1-license (other); es necesario revisar el enlace a la licencia del modelo base antes de cualquier uso comercial.
- Alucinacion: como modelo generativo aplicado a OCR, puede producir texto o tablas plausibles pero incorrectos en documentos de baja calidad o con layouts complejos; conviene validar la salida en produccion.
- Datos incompletos: no hay informacion sobre sesgos, composicion del dataset de entrenamiento ni evaluaciones de robustez.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Cuantizaciones estaticas: el autor indica que no hay cuantizaciones ponderadas/imatrix disponibles; las IQ pueden ofrecer mejor calidad por tamano, pero no estan garantizadas.
- Dependencia del proyector multimodal: para entrada de imagenes es imprescindible descargar y configurar el fichero mmproj-f16 junto con los pesos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/OCRia-1-MTP-Repacked-GGUF
- Modelo base cuantizado: https://huggingface.co/prithivMLmods/OCRia-1-MTP-Repacked
- Modelo original OCRia-1 (LlamaIndex): https://huggingface.co/llamaindex/OCRia-1
- Licencia OCRia-1: https://huggingface.co/llamaindex/OCRia-1/blob/main/LICENSE
- Pagina de descargas del autor: https://hf.tst.eu/model#OCRia-1-MTP-Repacked-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
