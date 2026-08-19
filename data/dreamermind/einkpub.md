# Dreamermind/einkpub

## Resumen

einkpub es un repositorio de pesos de modelo en formato NNEF creado por Dreamermind para alimentar el proyecto einkpdf, una herramienta que convierte PDFs de investigación en EPUBs optimizados para lectores de tinta electrónica de 7 pulgadas. El repositorio contiene dos modelos: un transcriber basado en NuExtract3 (numind) que convierte páginas rasterizadas en markdown estructurado, y un layout predictor basado en surya (VikParuchuri) que identifica regiones etiquetadas y su orden de lectura. Ambos modelos se ejecutan exclusivamente en CPU mediante la librería tract, sin necesidad de GPU ni de Python en tiempo de inferencia.

La relevancia de este proyecto radica en su enfoque práctico para la lectura de papers científicos en dispositivos de tinta electrónica, donde la conversión de PDF a un formato reflowable como EPUB es esencial. El transcriber es una conversión de NuExtract3 sin fine-tuning, con pesos en f16 y el decoder cuantizado a Q4_0, lo que reduce el pico de memoria de ~21 GB a ~6 GB y acelera la inferencia 1,76 veces en CPU. El layout predictor, por su parte, se exporta desde PyTorch a NNEF dividido en tres grafos (encoder, decoder-prefill y decoder-iterativo). Es importante señalar que el repositorio tiene una licencia dual: el transcriber es Apache-2.0, mientras que el layout predictor es CC-BY-NC-SA-4.0, con restricciones no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language; transcriber basado en NuExtract3 (transformer encoder-decoder), layout predictor basado en surya (checkpoint 2025_02_18) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (vision tower y decoder del transcriber), Q4_0 (decoder del transcriber); layout predictor en f16 (no especificado explícitamente) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (transcriber) y CC-BY-NC-SA-4.0 (layout predictor); repositorio marcado como "other" |
| Formato de pesos | NNEF (grafos exportados para tract) |

## Arquitectura y entrenamiento

El transcriber es una conversión directa de NuExtract3, un modelo de extracción de información estructurada basado en una arquitectura transformer encoder-decoder. No se ha realizado ningún fine-tuning; los pesos originales en safetensors se convirtieron a NNEF para su ejecución con tract. El decoder se cuantizó a Q4_0, reduciendo el consumo de memoria y mejorando la velocidad en CPU. El layout predictor proviene de surya, un modelo de análisis de layout de documentos, con checkpoint del 18 de febrero de 2025. Se exportó desde PyTorch a NNEF, dividiéndose en tres grafos para separar el prefill del decodificador iterativo. Tampoco se aplicó fine-tuning en este caso. El preprocesador del layout se verificó contra arrays dorados de la implementación Python de surya para garantizar equivalencia.

## Capacidades

- Conversión de páginas de PDF rasterizadas a markdown estructurado mediante el transcriber.
- Detección de regiones etiquetadas (figuras, tablas, texto, etc.) y orden de lectura mediante el layout predictor.
- Ejecución completa en CPU, sin dependencia de GPU ni de Python en tiempo de inferencia.
- Integración con tract, permitiendo despliegue ligero en entornos embebidos o de bajos recursos.
- Generación de EPUBs aptos para lectores e-ink de 7 pulgadas, con recorte de figuras basado en las coordenadas del layout.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step ni soporte multilingüe explícito.

## Casos de uso

- Lectura de papers de investigación en e-readers: el usuario convierte un PDF a EPUB con einkpdf, que rasteriza cada página, aplica el layout predictor para identificar regiones y orden de lectura, y el transcriber genera markdown estructurado. El resultado es un EPUB reflowable legible en dispositivos de tinta electrónica.
- Archivado y reutilización de documentos científicos: investigadores que necesitan extraer texto y figuras de PDFs para su posterior procesamiento pueden usar el transcriber para obtener markdown limpio, preservando la estructura de secciones y tablas.
- Generación de versiones accesibles de documentos: el markdown estructurado puede alimentar sistemas de lectura por voz o herramientas de accesibilidad, al separar contenido textual de figuras y tablas.
- Automatización de pipelines de procesamiento documental: al ejecutarse en CPU y sin Python, puede integrarse en servicios ligeros o contenedores para convertir lotes de PDFs en entornos sin GPU.
- Análisis de layout para extracción de figuras: el layout predictor permite aislar figuras y tablas de una página, útil para crear datasets o para indexar visualmente contenidos científicos.
- Creación de bibliotecas personales de papers en formato reflowable: usuarios que acumulan PDFs pueden convertirlos a EPUB y sincronizarlos con su lector, mejorando la experiencia de lectura en dispositivos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio solo menciona una mejora de rendimiento del decoder cuantizado a Q4_0: reducción del pico de RSS de ~21 GB a ~6 GB y una aceleración de ~1,76 veces en CPU, pero sin cifras absolutas de latencia o throughput.

## Requisitos de hardware

- Inferencia en CPU únicamente; no requiere GPU.
- Con el decoder cuantizado a Q4_0, el pico de memoria RSS se reduce a ~6 GB, por lo que puede ejecutarse en sistemas con 8 GB de RAM o más.
- La vision tower y el decoder del transcriber en f16 requieren más memoria si no se usa cuantización; el valor original de ~21 GB indica que sin cuantización se necesita una máquina con al menos 24 GB de RAM.
- El layout predictor, al estar dividido en tres grafos, tiene requisitos moderados; el tamaño de los archivos (299 MB, 219 MB, 199 MB) sugiere que cabe en sistemas con 4-8 GB de RAM.
- Despliegue recomendado con tract (versión 0.23 o superior, con re-registro del operador `tract_onnx_is_nan` para compatibilidad) y la herramienta einkpdf.
- No se documentan opciones de despliegue con vLLM, Ollama o TGI, dado que el formato NNEF y el runtime tract son específicos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (conversión de PDF a EPUB para e-ink con ejecución en CPU). Alternativas genéricas como GROBID o ScienceBeam se centran en extracción de texto y estructura, pero no generan EPUB ni se ejecutan en NNEF/tract. No se incluye una tabla comparativa por falta de datos contrastados.

## Limitaciones y advertencias

- Licencia dual: el layout predictor está bajo CC-BY-NC-SA-4.0, lo que prohíbe uso comercial sin licencia adicional de Datalab. El transcriber es Apache-2.0, pero si se usan ambos modelos juntos, se aplican las restricciones del layout.
- El waiver no comercial de surya solo aplica a organizaciones con ingresos brutos inferiores a 5 millones de USD en los últimos 12 meses y menos de 5 millones en financiación VC/angel, y que no compitan con la API de Datalab.
- Riesgo de alucinación en el transcriber: al ser un modelo de extracción de texto, puede generar contenido incorrecto si la entrada es ambigua o de baja calidad.
- No se especifican idiomas soportados; NuExtract3 está entrenado principalmente en inglés, por lo que el rendimiento en otros idiomas puede ser limitado.
- Dependencia de tract: los grafos NNEF requieren tract ≥ 0.23, y el layout predictor necesita re-registrar el operador `tract_onnx_is_nan` si se carga con versiones recientes.
- No se documenta el manejo de documentos escaneados con baja calidad, tablas complejas o fórmulas matemáticas; el transcriber puede fallar en estos casos.
- El repositorio no incluye scripts de entrenamiento ni datos de evaluación; la verificación del layout se limita a arrays dorados del preprocesador.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Dreamermind/einkpub
- Proyecto einkpdf (GitHub): https://github.com/epi/einkpdf
- Librería tract (Sonos): https://github.com/sonos/tract
- Modelo base del transcriber: https://huggingface.co/numind/NuExtract3
- Proyecto surya (layout predictor): https://github.com/VikParuchuri/surya
- API de Datalab (licenciamiento comercial): https://www.datalab.to/
