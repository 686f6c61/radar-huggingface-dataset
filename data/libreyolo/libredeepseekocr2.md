# LibreYOLO/LibreDeepSeekOCR2

## Resumen

LibreDeepSeekOCR2 es un espejo de pesos del modelo DeepSeek-OCR-2, publicado por el colectivo LibreYOLO para integrarlo en su librería `ocr`. El modelo original lo desarrolla DeepSeek y está orientado a la extracción de texto estructurado a partir de imágenes de documentos: recibe una página escaneada o una captura y devuelve su contenido en formato Markdown, además de otras representaciones derivadas del pipeline de OCR.

Se trata de un modelo de visión-lenguaje (VLM) especializado con arquitectura `deepseek_vl_v2`, un transformer multimodal con un encoder visual basado en Qwen2 que el autor describe como "visual causal flow". El checkpoint completo ocupa alrededor de 3.389 millones de parámetros y el repositorio pesa 6,8 GB en formato safetensors, lo que sitúa el modelo en la franja de los 3B, manejable en GPUs de consumo con cuantización.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa open source (Apache 2.0) para pipelines de digitalización documental; por otro, aclara que LibreDeepSeekOCR2 no introduce cambios en los pesos ni en el tokenizador, sino que redistribuye el modelo upstream con un port propio en PyTorch que evita ejecutar código remoto. Es, por tanto, una vía de despliegue controlada del OCR de DeepSeek, no una variante entrenada por LibreYOLO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | deepseek_vl_v2 (transformer multimodal, encoder visual basado en Qwen2) |
| Parametros totales | 3.389.119.360 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (config.json, tokenizer y processor incluidos) |

## Arquitectura y entrenamiento

El modelo upstream, DeepSeek-OCR-2, emplea la arquitectura `deepseek_vl_v2`, un transformer multimodal que combina un encoder visual con un decodificador de lenguaje. La model card de LibreYOLO describe el componente visual como un encoder "visual causal flow" basado en Qwen2, una formulación que el autor asocia al procesamiento secuencial de regiones de la página. El checkpoint contiene 3.389.119.360 parámetros, aunque la model card lo etiqueta como "3B mixture-of-experts" sin detallar el número de expertos ni los parámetros activos por token, dato que no está disponible.

No se han publicado en la información proporcionada detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones de decodificación (especulativa, atención lineal u otras) más allá de la descripción del encoder visual. Lo que sí se especifica es que LibreYOLO no ha modificado ningún parámetro aprendido: los safetensors, `config.json`, tokenizador y processor son idénticos byte a byte al snapshot upstream en el commit `aaa02f3811945a91062062994c5c4a3f4c0af2b0`, y se excluyen los ficheros de código remoto del autor original porque la librería ejecuta su propio port en PyTorch.

## Capacidades

- Extracción de texto desde imágenes de documentos con salida estructurada en Markdown (`page.ocr.markdown`).
- Reconocimiento óptico de caracteres (OCR) sobre páginas escaneadas y capturas, con preservación de estructura de bloques según el pipeline de la librería.
- Procesamiento image-to-text dentro de un pipeline multimodal (`image-text-to-text`).
- Integración con la API `LibreVLM` de LibreYOLO mediante `model.predict("page.png")`.
- Ejecución sin código remoto: el port propio de la arquitectura evita `trust_remote_code`.
- Capacidades multilingües: no documentadas en la información disponible.
- Tool calling, function calling, agentes y modos de razonamiento extendido: no documentados.

## Casos de uso

- Digitalización de archivos administrativos: el modelo recibe páginas escaneadas y devuelve Markdown listo para indexar en un sistema de gestión documental, lo que simplifica la conversión de PDFs históricos a texto consultable.
- Extracción de tablas y formularios en procesos de back office: al preservar estructura en la salida Markdown, permite reconstruir tablas de facturas o partes de incidencias para su volcado a bases de datos relacionales.
- Pipeline de accesibilidad documental: conversión de documentos impresos a texto estructurado para lectores de pantalla y motores de síntesis de voz, con la ventaja de una licencia Apache 2.0 que permite uso comercial sin fricción.
- Procesamiento por lotes en entornos con GPU de consumo: con 3,4B parámetros y pesos safetensors de 6,8 GB, es viable ejecutarlo en una RTX 4090 o similar para digitalizar lotes de documentos sin depender de APIs externas.
- Automatización de la ingesta de contratos y pólizas: extracción de cláusulas y campos clave en Markdown para alimentar motores de búsqueda semántica o sistemas de revisión legal asistida.
- Digitalización de material académico y bibliográfico: conversión de artículos escaneados y apuntes a Markdown para su integración en wikis internas o repositorios de conocimiento.
- Sustitución de servicios OCR propietarios en flujos sensibles: al ejecutarse en infraestructura propia y no requerir código remoto, encaja en entornos con requisitos de confidencialidad sobre los documentos procesados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 7 GB solo para pesos (3,389B parámetros × 2 bytes), más overhead de activaciones y del encoder visual; en la práctica, se recomienda reservar 10-12 GB.
- Cuantización: no se documentan tipos soportados en la información disponible; la viabilidad en 8 bits o 4 bits requeriría verificación con herramientas externas.
- GPU recomendadas: A100 o H100 para despliegues de alto throughput; RTX 4090 (24 GB) para inferencia cómoda en FP16; RTX 3090 (24 GB) como alternativa.
- GPU de consumo: cabe en tarjetas con 12 GB o más si se confirma una cuantización adecuada; en 8 GB el margen es ajustado y no está verificado.
- Opciones de despliegue: la vía documentada es la librería `libreyolo` con `LibreVLM`; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LibreDeepSeekOCR2 | 3,389B | no disponible | Apache 2.0 | Hugging Face (LibreYOLO) | Espejo de DeepSeek-OCR-2 con port propio en PyTorch |
| DeepSeek-OCR-2 (upstream) | 3,389B | no disponible | Apache 2.0 | Hugging Face (deepseek-ai) | Modelo original; requiere código remoto |
| Alternativas OCR/VLM de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Es un espejo de pesos: no incorpora mejoras ni ajustes propios de LibreYOLO, por lo que hereda íntegramente el comportamiento del modelo upstream.
- La model card lo describe como "mixture-of-experts" sin especificar número de expertos ni parámetros activos, lo que impide estimar con precisión el coste real por token.
- No se documentan los idiomas soportados; el rendimiento en castellano u otras lenguas distintas del inglés no está verificado.
- No se han publicado benchmarks en la información disponible, por lo que no es posible comparar su calidad OCR con alternativas de forma cuantitativa.
- Riesgo de alucinación inherente a los modelos generativos multimodales: en documentos con baja calidad de escaneo o tablas complejas puede inventar o reordenar contenido.
- Sesgos conocidos: no documentados en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar el `NOTICE` y la licencia upstream por si hubiera atribuciones adicionales.
- El repositorio no incluye los ficheros de código remoto del autor original; el uso fuera de la librería `libreyolo` requiere portar la arquitectura `deepseek_vl_v2` por cuenta propia.
- El modelo se publicó con 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de comunidad ni de validación independiente.

## Enlaces

- Hugging Face (LibreYOLO): https://huggingface.co/LibreYOLO/LibreDeepSeekOCR2
- Modelo upstream: https://huggingface.co/deepseek-ai/DeepSeek-OCR-2
- Repositorio de código upstream: https://github.com/deepseek-ai/DeepSeek-OCR-2
- Paper: arXiv:2601.20552
- Commit de referencia upstream: `aaa02f3811945a91062062994c5c4a3f4c0af2b0`
