# mradermacher/clairic-flash-GGUF

## Resumen

Clairic-flash es un modelo multimodal desarrollado por Cloudflare, orientado a la extracción de información estructurada y a la generación de salidas con formato estricto (structured output). La ficha que aquí se documenta corresponde a la versión cuantizada en formato GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo base tiene 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) y se distribuye bajo licencia Apache 2.0.

El modelo está etiquetado como multimodal y especializado en information extraction, lo que sugiere capacidades para procesar entradas que combinan texto e imágenes y devolver datos estructurados (por ejemplo, JSON) a partir de documentos. La model card del repositorio cuantizado es escueta y no detalla la arquitectura interna, la longitud de contexto ni la composición del dataset de entrenamiento, por lo que varios de los apartados técnicos se marcan como no disponibles.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de extracción de información de Cloudflare en entornos locales o con recursos limitados, gracias a la disponibilidad de cuantizaciones desde Q2_K (4,1 GB) hasta f16 (18,5 GB). Es una opción a considerar cuando se necesita procesar documentos y obtener salidas estructuradas sin depender de una API externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal; la model card no detalla la arquitectura interna) |
| Parametros totales | 9.197.093.888 (~9,2 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés; según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio cuantizado); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Cloudflare/clairic-flash. La model card del repositorio cuantizado no especifica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE) o una arquitectura híbrida, ni tampoco el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de RLHF o DPO. Las etiquetas del repositorio indican que el modelo es multimodal, está orientado a structured output e information extraction, y requiere custom-code para su carga (tag custom-code), lo que implica que la implementación de referencia en transformers incluye código personalizado más allá de las clases estándar.

La innovación técnica destacable, según la información disponible, es su orientación a la extracción de información estructurada y a la producción de salidas con formato controlado, capacidades que se combinan con el procesamiento multimodal. No se han publicado en la información proporcionada detalles sobre decodificación especulativa, atención lineal u otras optimizaciones de inferencia.

## Capacidades

- Generación de texto y conversación multi-turno (tag conversational en el repositorio).
- Procesamiento multimodal: el modelo está etiquetado como multimodal, por lo que se espera que acepte entradas que combinen texto e imágenes.
- Extracción de información estructurada (information extraction): generación de datos con formato controlado a partir de documentos.
- Structured output: capacidad de producir salidas con esquemas estrictos, adecuada para integraciones con sistemas downstream.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: la model card indica únicamente inglés (en).
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Extracción de datos de facturas y recibos: el modelo puede recibir la imagen o el texto de una factura y devolver un JSON con campos como importe, fecha, emisor y líneas de detalle, gracias a su orientación a information extraction y structured output.
- Procesamiento de documentos de identidad y formularios: digitalización de formularios escaneados convirtiendo el contenido en registros estructurados listos para bases de datos, aprovechando la capacidad multimodal del modelo.
- Enriquecimiento de bases de datos documentales: extracción automática de entidades y relaciones de correos, contratos o informes para poblar un almacén de datos, con salidas validadas contra un esquema.
- Automatización de pipelines de ingesta de datos: integración del modelo en un flujo ETL que transforme documentos no estructurados en tablas o JSON, ejecutándose en local mediante llama.cpp con cuantizaciones Q4_K_M (5,9 GB) para equilibrar calidad y velocidad.
- Clasificación y etiquetado de contenido: asignación de categorías y etiquetas a textos o imágenes dentro de un sistema de gestión documental, usando la salida estructurada para mantener consistencia en el esquema.
- Despliegue en entornos con requisitos de privacidad: al ser un modelo Apache 2.0 con pesos GGUF, puede ejecutarse en infraestructura propia sin enviar datos sensibles a servicios externos, adecuado para sectores regulados.
- Prototipado rápido de asistentes de extracción: uso en pruebas de concepto con Ollama o llama.cpp para validar la calidad de extracción antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~4,1 GB; Q3_K_S ~4,5 GB; Q3_K_M ~4,9 GB; Q3_K_L ~5,3 GB; IQ4_XS ~5,5 GB; Q4_K_S ~5,6 GB; Q4_K_M ~5,9 GB; Q5_K_S ~6,6 GB; Q5_K_M ~6,8 GB; Q6_K ~7,7 GB; Q8_0 ~9,9 GB; f16 ~18,5 GB.
- GPU recomendadas: no disponibles de forma explícita en la información proporcionada. Por tamaño, las cuantizaciones Q4 caben en GPUs de consumo con 8 GB de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060 Ti); Q8_0 requiere ~10 GB (RTX 3080 12 GB, RTX 4070 Ti, RTX 4080); f16 requiere ~19 GB (RTX 4090 24 GB, A100 40 GB, H100).
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_S/Q4_K_M en GPUs de 8 GB o superiores; las cuantizaciones Q2 a Q3 pueden ejecutarse incluso en GPUs de 6 GB o en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp y herramientas basadas en GGUF (Ollama, LM Studio, text-generation-webui). El modelo base requiere transformers con custom-code. No se confirma soporte de vLLM o TGI para esta versión GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría. La siguiente tabla recoge únicamente los datos verificables de esta ficha; las columnas de los modelos comparables se marcan como no disponibles al no haberse proporcionado información sobre ellos.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Clairic-flash (esta ficha) | ~9,2 B | no disponible | Apache 2.0 | GGUF, safetensors | Multimodal, structured output, information extraction |
| Alternativa comparable 1 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativa comparable 2 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado en la información proporcionada; al ser un modelo entrenado principalmente en inglés, es probable que su rendimiento en otros idiomas sea inferior.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, puede producir campos o valores incorrectos en tareas de extracción, por lo que se recomienda validar las salidas contra un esquema y aplicar comprobaciones posteriores.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada y el único idioma declarado es el inglés, lo que limita su uso en castellano u otros idiomas sin evaluación previa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con la obligación de conservar el aviso de licencia y la atribución correspondiente. No se han identificado restricciones adicionales en la información proporcionada.
- Caveats para producción: la model card del repositorio cuantizado es mínima y no documenta la arquitectura, el contexto ni los datos de entrenamiento; el modelo base requiere custom-code en transformers, lo que puede complicar la integración. Las cuantizaciones Q2 y Q3 pueden degradar notablemente la calidad; para producción se recomienda Q4_K_M o superior. No se han publicado benchmarks que permitan estimar su rendimiento frente a alternativas.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/clairic-flash-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clairic-flash
- Página de descargas del cuantizador: https://hf.tst.eu/model#clairic-flash-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
