# litert-community/granite-docling-258M

## Resumen

granite-docling-258M es un modelo de visión-lenguaje (VLM) especializado en conversión de documentos, desarrollado por IBM Research y distribuido originalmente bajo el identificador `ibm-granite/granite-docling-258M`. Esta ficha concreta corresponde a la conversión realizada por la comunidad `litert-community` al formato LiteRT-LM (`.litertlm`), empaquetada para inferencia en dispositivo (on-device) mediante el runtime LiteRT-LM de Google. El modelo es el motor que impulsa Docling, la herramienta de parseo documental del ecosistema docling-project.

La tarea del modelo es recibir una imagen de página y emitir DocTags, un marcado estructurado que describe elementos de maquetación, estructura de tablas en formato OTSL, código y fórmulas. Posteriormente, `docling-core` convierte esa salida de forma sin pérdida a Markdown, HTML o JSON. Con 258M parámetros y un fichero de aproximadamente 338 MB, es uno de los modelos de document-AI más pequeños capaces de capturar la estructura de tablas, no solo el texto plano.

Su relevancia radica en la combinación de tamaño reducido, licencia Apache-2.0 y ejecución íntegra en CPU de dispositivos móviles y portátiles, sin dependencia de GPU ni de servicios en la nube. El fichero empaquetado ocupa 0,7 GB en el repositorio de Hugging Face y está cuantizado a int8 en pesos con cómputo en coma flotante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM con encoder visual SigLIP-base p16 y decoder tipo Llama (transformer denso) |
| Parametros totales | 258M |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (cache KV) |
| Tipos de cuantizacion | int8 en pesos con cómputo float (int4 probado y descartado por corromper DocTags) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors en el repo de IBM |

## Arquitectura y entrenamiento

El modelo combina un encoder visual SigLIP-base con parches de 16 píxeles (entrada 512×512, 1024 parches), seguido de pixel-shuffle ×4 y un conector lineal que reduce la representación a 64 tokens de imagen. El decoder es un transformer denso de arquitectura Llama con dimensión 576, 30 capas, atención GQA con ratio 9/3 y vocabulario de 100k tokens. En esta conversión, el encoder visual se cuantiza a int8 (correlación 0,98 frente al original fp32, salida estructuralmente idéntica) y el decoder mantiene pesos int8 con cómputo float.

El modelo base se entrena con un esquema de división de imagen en mosaicos (tiles) más una vista global; esta conversión ejecuta únicamente la ruta de vista global única a 512×512. Los detalles sobre volumen de tokens de entrenamiento, composición del dataset y uso de RLHF/DPO no están disponibles en la información proporcionada. La innovación destacable de este empaquetado es la viabilidad de ejecutar un VLM de parseo documental íntegramente en CPU de móvil con latencias de decenas de segundos por página.

## Capacidades

- Conversión de imágenes de página a DocTags: extracción de títulos, párrafos, listas, tablas (estructura OTSL), código y fórmulas.
- Reconocimiento de estructura de tablas, incluyendo celdas de datos y cabeceras, no solo texto.
- Procesamiento multimodal imagen-texto con pipeline `image-text-to-text`.
- Salida estructurada convertible sin pérdida a Markdown, HTML o JSON mediante `docling-core`.
- Ejecución on-device en CPU sin aceleración GPU.
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Digitalización de informes corporativos en movilidad: capturar una página con la cámara del teléfono, redimensionarla a 512×512 BILINEAR y obtener DocTags con la estructura del documento para su conversión a Markdown en la propia app, sin enviar datos a la nube.
- Extracción de tablas en aplicaciones de campo: el modelo reconstruye rejillas completas (verificado con una tabla 5×6 y 25/25 celdas correctas) en unos 35 segundos en un Galaxy S26, adecuado para inventarios, albaranes o partes de trabajo.
- Preprocesado de documentos para RAG: convertir páginas escaneadas a Markdown estructurado antes de la indexación, preservando tablas y jerarquía de secciones que los pipelines de chunking necesitan.
- Archivado documental con privacidad estricta: al ejecutarse en CPU local con un fichero de 338 MB, permite procesar documentos confidenciales en equipos sin GPU y sin conexión.
- Automatización de escritorio en portátiles: con 912 tok/s de prefill y 64 tok/s de decode en un Apple M4 Max, procesa páginas legibles a 512² en aproximadamente 5,2 segundos, útil para lotes moderados de facturas o extractos.
- Integración en aplicaciones Android mediante Google AI Edge Gallery: importación del fichero `.litertlm` como modelo local y uso de la tarea Ask Image para conversión interactiva de páginas.
- Procesamiento de páginas densas por mosaicos: para documentos multicoulumna o fórmulas pequeñas, dividir la página en recortes y enviar cada uno como imagen 512×512 independiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Sí se documentan mediciones del fichero exacto:

| Prueba | Dispositivo | Resultado |
|---|---|---|
| Estructura (página sintética con tabla 5×6) | macOS CPU, Apple M4 Max, litert-lm 0.15.0 | Título exacto, rejilla OTSL completa, 25/25 celdas, 5,2 s/página (~240 tokens) |
| Estructura (misma página) | Galaxy S26 CPU (SM8850), LiteRT-LM v0.16.1 | Título exacto, rejilla completa, 25/25 celdas, 35,4 s/página (1025 tokens), dos ejecuciones idénticas byte a byte |
| Demo Gallery Ask Image | Galaxy S26 CPU, AI Edge Gallery 1.0.18 | 34,7 s, 25/25 celdas correctas |
| Prefill / decode / TTFT | Apple M4 Max CPU | 912 tok/s / 64,0 tok/s / 0,57 s (prompt 256, decode 256, 3 runs) |
| Encoder visual | Apple M4 Max CPU | ~0,5 s por imagen (no incluido en la tabla anterior) |
| Fidelidad de conversión del encoder | — | Correlación 1.000 vs original fp32; int8 empaquetado 0,98 |

## Requisitos de hardware

- VRAM: no aplica; el backend previsto es CPU. El fichero ocupa ~338 MB en disco y el repositorio 0,7 GB.
- GPU: el fichero distribuido no crea motor GPU; el delegado GPU rechaza la proyección cuantizada 576×576 en la inicialización del kernel (`Shape mismatch: {576,1,1,576} vs {1,1,576,576}` en macOS y Android OpenCL). Una variante con decoder fp16 funciona en OpenCL de Android pero es ~4× más lenta que CPU.
- Consumer GPU: no es el objetivo; funciona en CPU de portátiles y móviles.
- Despliegue: runtime LiteRT-LM (CLI `litert-lm`), Google AI Edge Gallery en Android, y el modelo base en `transformers` desde el repositorio de IBM.
- Latencia y throughput medidos: 5,2 s/página en Apple M4 Max CPU; 35,4 s/página en Galaxy S26 CPU; prefill 912 tok/s y decode 64 tok/s en M4 Max.
- Requisito de entrada: imagen pre-redimensionada a exactamente 512×512 con remuestreo BILINEAR en la aplicación; el remuestreador interno usa otro filtro y provoca alucinación de página.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Ejecucion on-device |
|---|---|---|---|---|---|
| granite-docling-258M (LiteRT-LM) | 258M | 4096 (KV) | VLM documento a DocTags | Apache-2.0 | Sí, CPU móvil y portátil |
| ibm-granite/granite-docling-258M (original) | 258M | no disponible | VLM documento a DocTags | Apache-2.0 | Vía `transformers`, requiere más recursos |
| Alternativas de OCR/document-AI de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks comparativos con otros modelos de document-AI.

## Limitaciones y advertencias

- Sensibilidad al remuestreo: cambiar de BILINEAR a LANCZOS en la entrada puede hacer que el modelo pase de salida perfecta a degenerada; es un rasgo del modelo base, no de la conversión.
- Modo de vista global única: páginas multicoulumna densas y fórmulas pequeñas se degradan; se recomienda dividir en mosaicos y enviar recortes.
- El modelo puede alucinar una página completa si recibe una imagen de entrada mayor que 512×512 sin pre-redimensionar.
- La cuantización int4 fue probada y rechazada: la cuantización con cómputo entero corrompe los DocTags en este decoder.
- Sin soporte GPU en el fichero distribuido; la variante fp16 en OpenCL es ~4× más lenta que CPU.
- La UI de AI Edge Gallery oculta las etiquetas `<otsl>`/`<fcel>`, por lo que la tabla se muestra como texto concatenado; hay que pasar la salida cruda a `docling-core`.
- No se documentan idiomas soportados ni sesgos conocidos en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base de IBM y de los componentes del runtime LiteRT-LM.
- Latencia de decenas de segundos por página en móvil: no apta para procesamiento interactivo de alta frecuencia en ese hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/granite-docling-258M
- Modelo base: https://huggingface.co/ibm-granite/granite-docling-258M
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Docling: https://github.com/docling-project/docling
- docling-core: https://github.com/docling-project/docling-core
- Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
