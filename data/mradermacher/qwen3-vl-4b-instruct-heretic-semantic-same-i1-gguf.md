# mradermacher/Qwen3-VL-4B-Instruct-heretic-Semantic-Same-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo VINAY-UMRETHE/Qwen3-VL-4B-Instruct-heretic-Semantic-Same, un derivado multimodal (visión-lenguaje) de la familia Qwen3-VL de 4B de parámetros al que se le han aplicado técnicas de "abliteración" o decensurado (tags heretic, uncensored, decensored, abliterated). El encargado de la cuantización es mradermacher, que publica dos repositorios: uno de cuantizaciones estáticas y este, con cuantizaciones ponderadas mediante matriz de importancia (imatrix, etiquetadas como i1).

El interés del modelo es doble. Por un lado, ofrece capacidad de visión-lenguaje en un tamaño pequeño (~4B), lo que permite ejecutarlo en GPU de consumo y en CPU con llama.cpp. Por otro, al ser una variante heretic/abliterated, elimina buena parte del alineamiento de seguridad y de los rechazos del modelo original, lo que lo hace atractivo para investigación sobre alineamiento, red-teaming, generación creativa sin filtros y evaluación de sesgos, pero problemático para despliegues comerciales sin supervisión.

La información publicada por el autor es mínima: no hay model card descriptiva, ni datos de entrenamiento, ni benchmarks, ni especificación de longitud de contexto. El repositorio, además, en el momento de la consulta contiene únicamente el fichero imatrix (0,1 GB) y no los GGUF finales enlazados; los ficheros mmproj necesarios para la parte visual se encuentran, según el autor, en el repositorio de cuantizaciones estáticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) de la familia Qwen3-VL; detalles concretos de la variante heretic no disponibles |
| Parámetros totales | No disponible con certeza. HuggingFace reporta 958.716 en el recuento de safetensors (cifra ambigua); el nombre del modelo indica ~4B |
| Parámetros activos | No aplicable (no hay indicios de que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (ponderadas con imatrix, i1) |
| Idiomas soportados | en (inglés), según los metadatos |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones ponderadas i1); el repositorio también publica el fichero .imatrix.gguf |
| Modelo base | VINAY-UMRETHE/Qwen3-VL-4B-Instruct-heretic-Semantic-Same |
| Repositorio de cuantizaciones estáticas | mradermacher/Qwen3-VL-4B-Instruct-heretic-Semantic-Same-GGUF (contiene los ficheros mmproj para visión) |
| Tamaño del repositorio | 0,0 GB reportado (el fichero imatrix listado ocupa 0,1 GB) |
| Fecha de creación | 2026-09-23 |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna, el proceso de entrenamiento ni el pipeline de alineación de esta variante concreta. Por herencia del modelo base, se trata de un transformer multimodal de la familia Qwen3-VL, es decir, un modelo de lenguaje con un codificador visual y proyección al espacio de tokens del decoder, capaz de procesar imágenes y texto conjuntamente. El sufijo "Semantic-Same" del modelo base hace referencia al método de abliteración empleado por su autor (VINAY-UMRETHE), pero no hay documentación accesible que describa los detalles del procedimiento, los datos usados ni si hubo ajuste posterior.

Sobre el proceso de cuantización sí hay información técnica: mradermacher ha generado cuantizaciones ponderadas con matriz de importancia (imatrix) sobre el modelo base, aplicando quantize_version 2 y output_tensor_quantised 1, con conversión de tipo hf. El autor advierte que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamaño similar, y enlaza la gráfica comparativa de perplejidad de ikawrakow y las notas de Artefact2 sobre tipos de cuantización. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de texto y conversación multi-turno en inglés, heredadas del modelo Instruct original.
- Procesamiento de imágenes: al ser un modelo de visión-lenguaje, puede analizar imágenes junto con instrucciones textuales (descripción, extracción de información, razonamiento visual).
- Razonamiento y respuesta a instrucciones en formato Instruct.
- Capacidad de generación de código presumiblemente heredada del modelo base, aunque no verificada en la información disponible.
- Comportamiento decensurado: por el proceso de abliteración, reduce de forma deliberada los rechazos y el alineamiento de seguridad del modelo original.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado en los metadatos; el resto de idiomas no está confirmado.
- Modo "thinking" o razonamiento explícito: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles; el modelo base es visión-lenguaje, no audio.

## Casos de uso

- Investigación sobre alineamiento y abliteración: comparar las respuestas de esta variante con las del Qwen3-VL-4B-Instruct original permite medir cuánto cambia el comportamiento en tareas sensibles tras eliminar las direcciones de rechazo, con un coste de cómputo bajo.
- Red-teaming y evaluación de seguridad: usar la variante sin filtros como atacante o generador de prompts adversarios para probar las defensas de otros sistemas, en un entorno controlado y con registro de resultados.
- Procesamiento de documentos con OCR y extracción de datos: dado su componente visual, puede recibir capturas o escaneos y devolver texto estructurado (facturas, formularios, tablas), ejecutándose en local gracias al formato GGUF.
- Descripción y etiquetado automático de imágenes a escala: generación de alt-text, metadatos y etiquetas para catálogos o bibliotecas de imágenes, con la ventaja de poder correr por lotes en una sola GPU de consumo.
- Asistente visual en local u off-line: despliegue con llama.cpp u Ollama en un portátil o estación de trabajo sin conexión, útil en entornos con requisitos de privacidad donde no se pueden enviar imágenes a APIs externas.
- Generación creativa sin filtros: escritura de ficción, guiones o material narrativo en el que el modelo original rechazaría peticiones por contenido adulto o violento, siempre que se cumplan los requisitos legales y éticos aplicables.
- Análisis de interfaces y capturas para desarrollo: interpretar pantallazos de aplicaciones, diagramas o mockups y traducirlos a descripciones, pseudocódigo o listas de componentes, dentro de un flujo de trabajo de front-end.
- Prototipado rápido de aplicaciones VLM: al ser un modelo de ~4B en GGUF, sirve como banco de pruebas para pipelines de visión-lenguaje antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio de cuantización ni los metadatos de HuggingFace incluyen cifras de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluación. Tampoco se documenta el impacto del proceso heretic/abliterated sobre el rendimiento de las tareas estándar, ni la pérdida de calidad introducida por cada tipo de cuantización.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamaño declarado (~4B de parámetros) y de la experiencia habitual con modelos de esta escala; no proceden de la documentación del autor.

- Peso de los ficheros GGUF estimado: ~1,5-2 GB en IQ1/IQ2, ~2,5-3 GB en Q4_K_M, ~4,5-5 GB en Q8_0, ~8-9 GB en FP16.
- Hay que sumar el proyector visual (mmproj), que en modelos de esta escala suele añadir entre varios cientos de MB y ~1-2 GB, y que se descarga del repositorio de cuantizaciones estáticas, no de este.
- VRAM estimada para inferencia con Q4_K_M: ~4-6 GB incluyendo caché KV para contextos moderados; con Q8_0, ~7-9 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 24 GB para contextos largos o lotes; A100/H100 no son necesarias para esta escala.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más usando cuantizaciones Q4 o inferiores; en 6 GB con IQ3/IQ2 y contexto reducido.
- Apple Silicon: viable con memoria unificada de 8 GB o más (M1/M2/M3/M4).
- Opciones de despliegue: llama.cpp / llama-server (la vía natural para GGUF multimodal, requiere cargar el mmproj con la opción correspondiente), Ollama, LM Studio, KoboldCpp. vLLM y TGI no están pensados para GGUF; para esos motores conviene usar el modelo base en safetensors.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Qwen3-VL-4B-Instruct-heretic-Semantic-Same-i1-GGUF (este) | ~4B (nombre) | No disponible | No disponible | apache-2.0 | GGUF imatrix; ficheros finales y mmproj en el repo estático |
| VINAY-UMRETHE/Qwen3-VL-4B-Instruct-heretic-Semantic-Same | ~4B (nombre) | No disponible | No disponible | apache-2.0 | Safetensors en HuggingFace (modelo base de este repo) |
| Qwen/Qwen3-VL-4B-Instruct | ~4B | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada | Modelo original de la familia, presumiblemente con alineamiento intacto |
| Alternativas multimodales pequeñas (Qwen2.5-VL-3B, Gemma 3 4B, SmolVLM) | 2-4B | No disponible | No disponible | Licencias variadas | Comparativa no verificada con la información disponible |

No se dispone de datos de benchmarks ni de contexto para establecer una comparación cuantitativa fiable entre estas opciones. La diferencia funcional principal de este repositorio frente al Qwen3-VL-4B-Instruct original es el comportamiento decensurado y el formato GGUF optimizado para inferencia local.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: el alineamiento de seguridad se ha reducido de forma intencionada. Puede generar contenido violento, sexual, ilegal o dañino que el modelo original rechazaría. No es apto para aplicaciones de cara al público sin filtros adicionales.
- Riesgo elevado de alucinación: al igual que otros modelos de ~4B, y posiblemente agravado por el proceso de abliteración, que tiende a degradar la coherencia en tareas de razonamiento.
- Idiomas: solo se declara inglés en los metadatos. El rendimiento en castellano u otras lenguas no está verificado y probablemente sea inferior.
- Longitud de contexto desconocida: no se documenta la ventana de contexto de esta variante, lo que dificulta planificar despliegues con documentos largos.
- Sin benchmarks: no hay ninguna evaluación publicada que permita estimar la pérdida de calidad respecto al modelo base ni el efecto de cada cuantización. Las cuantizaciones IQ1/IQ2 en particular suelen degradar notablemente modelos pequeños.
- Repositorio incompleto en el momento de la consulta: solo aparece listado el fichero imatrix; los GGUF finales y los mmproj están en el repositorio de cuantizaciones estáticas. Hay que verificar la disponibilidad real de los ficheros antes de integrarlo.
- Licencia apache-2.0 en los metadatos: permite uso comercial según los términos de esa licencia, pero el usuario asume la responsabilidad legal sobre el contenido generado por un modelo sin alineamiento, así como sobre el cumplimiento de las condiciones del modelo base y de la legislación aplicable (por ejemplo, el AI Act europeo en lo relativo a transparencia y contenidos).
- Metadatos inconsistentes: el recuento de parámetros reportado (958.716) no coincide con el nombre del modelo (~4B), lo que obliga a verificar las cifras reales antes de dimensionar el hardware.
- No hay información sobre sesgos demográficos, datos de entrenamiento ni procedencia del corpus, lo que impide auditar el modelo.

## Enlaces

- Repositorio de cuantizaciones i1 (este modelo): https://huggingface.co/mradermacher/Qwen3-VL-4B-Instruct-heretic-Semantic-Same-i1-GGUF
- Repositorio de cuantizaciones estáticas y ficheros mmproj: https://huggingface.co/mradermacher/Qwen3-VL-4B-Instruct-heretic-Semantic-Same-GGUF
- Modelo base: https://huggingface.co/VINAY-UMRETHE/Qwen3-VL-4B-Instruct-heretic-Semantic-Same
- Fichero imatrix: https://huggingface.co/mradermacher/Qwen3-VL-4B-Instruct-heretic-Semantic-Same-i1-GGUF/resolve/main/Qwen3-VL-4B-Instruct-heretic-Semantic-Same.imatrix.gguf
- Página de descargas de mradermacher para este modelo: https://hf.tst.eu/model#Qwen3-VL-4B-Instruct-heretic-Semantic-Same-i1-GGUF
- Preguntas frecuentes y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Entorno de cuantización (nethype GmbH): https://www.nethype.de/
