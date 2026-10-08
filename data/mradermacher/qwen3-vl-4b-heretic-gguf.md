# mradermacher/Qwen3-VL-4b-Heretic-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo DreamFast/Qwen3-VL-4b-Heretic, un modelo de visión-lenguaje de 4.022.468.096 parámetros derivado de la familia Qwen3-VL y sometido a un proceso de abliteration (etiquetas "abliteration", "heretic", "uncensored" en la model card). El trabajo de cuantización lo publica mradermacher, autor habitual de versiones GGUF de modelos abiertos, y el resultado está pensado para ejecución local con llama.cpp y derivados.

El interés principal es doble. Por un lado, empaqueta un VLM multimodal de ~4B en formatos que caben en GPUs de consumo (desde 1,8 GB en Q2_K hasta 8,2 GB en f16, más un suplemento multimodal mmproj de 0,6-0,9 GB). Por otro, al proceder de una variante "heretic" cuyos filtros de rechazo han sido modulados, apunta a casos de uso de investigación, análisis forense de imágenes y red teaming donde un modelo alineado de forma estándar suele negarse a responder.

No se trata de un modelo nuevo entrenado desde cero: es una conversión de pesos (convert_type: hf) con cuantización estática y, en paralelo, una versión con cuantización ponderada/imatrix publicada en un repositorio hermano. La model card no documenta arquitectura interna, ventana de contexto ni datos de entrenamiento; toda esa información habría que consultarla en el modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer multimodal (familia Qwen3-VL); detalles internos no disponibles en la model card |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (el repositorio no indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con fichero mmproj separado para la parte multimodal) |

Datos adicionales del repositorio: tamaño total 37,7 GB, 1.064 descargas, 3 likes, creado el 16 de julio de 2026 y actualizado el 7 de octubre de 2026. Conversión con output_tensor_quantised: 1 y quantize_version: 2.

Tabla de cuantizaciones publicadas, con tamaños declarados por el autor:

| Tipo | Tamaño (GB) | Nota del autor |
|---|---|---|
| mmproj-Q8_0 | 0,6 | suplemento multimodal |
| mmproj-f16 | 0,9 | suplemento multimodal |
| Q2_K | 1,8 | |
| Q3_K_S | 2,0 | |
| Q3_K_M | 2,2 | calidad inferior |
| Q3_K_L | 2,3 | |
| IQ4_XS | 2,4 | |
| Q4_K_S | 2,5 | rápido, recomendado |
| Q4_K_M | 2,6 | rápido, recomendado |
| Q5_K_S | 2,9 | |
| Q5_K_M | 3,0 | |
| Q6_K | 3,4 | muy buena calidad |
| Q8_0 | 4,4 | rápido, mejor calidad |
| f16 | 8,2 | 16 bpw, excesivo |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna ni el proceso de entrenamiento. Por las etiquetas y el nombre se trata de un modelo de visión-lenguaje (vision-language, multimodal, qwen3-vl, qwen3) de tipo transformer, con un componente visual que en llama.cpp se carga como fichero mmproj independiente. El repositorio es una cuantización del modelo DreamFast/Qwen3-VL-4b-Heretic, que a su vez es una variante "heretic" de un Qwen3-VL de 4B sometida a abliteration.

El autor no documenta número de tokens de entrenamiento, composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detalla qué técnica concreta de abliteration se aplicó ni qué capas se modificaron. La conversión a GGUF se hizo con convert_type: hf, quantize_version 2 y cuantización de tensores de salida activada, pero no se especifica el proceso de calibración de las cuantizaciones estáticas de este repositorio (las versiones ponderadas/imatrix se publican por separado).

## Capacidades

- Generación de texto conversacional (pipeline declarado: text-generation, tag conversational).
- Entrada de imágenes: el repositorio incluye ficheros mmproj, necesarios para habilitar la parte multimodal en llama.cpp.
- Descripción y análisis de imágenes orientado a tareas de visión-lenguaje, con la etiqueta "forensics" presente en la model card.
- Comportamiento sin filtros de rechazo en la práctica habitual de los modelos abliterated/uncensored, orientado a escenarios donde un modelo alineado estándar declinaría responder.
- Idiomas: únicamente inglés según la etiqueta de idioma declarada. No se documenta soporte multilingüe.
- Tool calling / function calling: no confirmado en la información disponible.
- Modo de razonamiento explícito (thinking), audio o vídeo: no disponible en la información proporcionada.

## Casos de uso

- Análisis forense de imágenes: la etiqueta "forensics" sugiere uso en inspección de evidencias visuales (capturas, fotografías, documentos escaneados) donde se necesita descripción detallada sin que el modelo se inhiba ante contenido sensible.
- Red teaming y evaluación de seguridad de otros sistemas: al ser una variante uncensored, sirve como generador de casos adversarios y de contenido de prueba para medir la robustez de filtros propios.
- Extracción de información de documentos escaneados: combinando el modelo con el fichero mmproj en Q8_0 (0,6 GB) se puede montar un pipeline local de lectura de facturas, formularios o capturas, sin enviar datos a servicios externos.
- Asistente multimodal en portátil o estación de trabajo sin GPU de datacenter: con Q4_K_M (2,6 GB) más mmproj Q8_0, el conjunto ocupa menos de 4 GB de pesos, lo que permite ejecución en GPUs de gama media.
- Prototipado e investigación académica en visión-lenguaje: al ser una conversión GGUF de un modelo de 4B con licencia apache-2.0, es un punto de partida barato para experimentos reproducibles en una sola máquina.
- Generación de descripciones alternativas (alt text) y etiquetado de imágenes a escala: un modelo de 4B cuantizado a Q4 o Q5 permite procesar lotes grandes en hardware modesto.
- Automatización de soporte técnico con capturas de pantalla: el usuario adjunta una captura de error y el modelo describe el problema y sugiere pasos, en despliegues on-premise donde no se puede usar API externa.
- Investigación sobre alineación y abliteration: comparar este modelo con su base Qwen3-VL sin modificar permite estudiar el efecto de la eliminación de la dirección de rechazo sobre el resto de capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF no incluye ninguna tabla de MMLU, HumanEval, GSM8K, MMMU ni evaluaciones multimodales, y tampoco se aportan métricas de perplejidad para las distintas cuantizaciones. El autor remite, como referencia genérica sobre calidad relativa de los tipos de cuantización, a una gráfica comparativa de ikawrakow y a las notas de Artefact2 enlazadas más abajo, pero ninguna de ellas mide este modelo en concreto.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin caché KV): aproximadamente 2,5-3,0 GB con Q4_K_S/Q4_K_M, 2,4 GB con IQ4_XS, 3,4 GB con Q6_K, 4,4 GB con Q8_0 y 8,2 GB con f16. Hay que sumar el suplemento multimodal: 0,6 GB (mmproj-Q8_0) o 0,9 GB (mmproj-f16).
- La caché KV se añade aparte y su tamaño depende de la longitud de contexto efectiva, que la model card no especifica; en contextos largos puede superar holgadamente el tamaño de los pesos.
- GPU de consumo: Q4 y Q5 caben en GPUs de 6-8 GB (por ejemplo GTX 1660, RTX 3060, RTX 4060). Q6_K y Q8_0 encajan en 8-12 GB. f16 requiere más de 12 GB para trabajar con margen.
- GPU de datacenter: A100, H100 o L40S permiten f16 y contextos amplios sin presión de VRAM, aunque están sobredimensionadas para un modelo de 4B.
- Opciones de despliegue: llama.cpp y sus interfaces (llama-server, Ollama, LM Studio, koboldcpp) para los ficheros GGUF y el mmproj; transformers para los pesos originales del modelo base. vLLM y TGI no están confirmados para este repositorio GGUF concreto.
- Latencia y throughput: no disponibles. No se aportan mediciones de tokens por segundo ni de tiempo a primer token para ninguna cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen3-VL-4b-Heretic-GGUF (este) | 4.022.468.096 | No disponible | GGUF (14 variantes) | apache-2.0 | Cuantización estática; incluye mmproj |
| DreamFast/Qwen3-VL-4b-Heretic | No disponible (mismo modelo base) | No disponible | Safetensors (no confirmado) | apache-2.0 (heredada) | Modelo fuente sin cuantizar |
| mradermacher/Qwen3-VL-4b-Heretic-i1-GGUF | 4.022.468.096 (mismo modelo) | No disponible | GGUF (imatrix) | apache-2.0 | Variante con cuantización ponderada |
| Qwen3-VL-4B (upstream oficial) | ~4B por denominación | No disponible | Safetensors | No disponible en esta ficha | Modelo sin abliteration; referencia de comparación |

La información proporcionada no incluye alternativas de otros fabricantes (por ejemplo otros VLM de 3B-7B) con datos verificables de parámetros, contexto o rendimiento, por lo que no se ofrece una comparación cruzada de prestaciones. Cualquier comparación de calidad entre este modelo y los anteriores requeriría ejecutar evaluaciones propias.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: la eliminación de las direcciones de rechazo puede degradar la coherencia en tareas generales, aumentar la tasa de respuestas incorrectas y, sobre todo, producir contenido dañino, ilegal o sexual sin filtro. No es adecuado para despliegues orientados al público sin una capa de moderación propia.
- Riesgo de alucinación: no hay datos publicados de evaluación de fidelidad, ni en texto ni en visión. En tareas de OCR o lectura de documentos, los errores de transcripción de cifras y nombres son un riesgo real y deben verificarse.
- Idioma: solo se declara inglés. El rendimiento en castellano no está documentado y no debería asumirse.
- Longitud de contexto desconocida: no se puede planificar un despliegue con documentos largos o conversaciones extensas sin medir antes el comportamiento real del modelo y el consumo de caché KV.
- La model card declara licencia apache-2.0, pero conviene verificar la licencia del modelo Qwen3-VL upstream y las condiciones que herede la variante Heretic antes de un uso comercial.
- Trazabilidad limitada: no se documentan datos de entrenamiento, proceso de abliteration ni evaluaciones. El repositorio tiene 3 likes y 1.064 descargas, y la información técnica proviene exclusivamente de las etiquetas y de la model card del cuantizador.
- Compatibilidad multimodal: los ficheros mmproj son obligatorios para usar la entrada de imagen; cargarlos con una versión de llama.cpp no compatible puede fallar silenciosamente o degradar la calidad.
- Las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L) conllevan pérdida notable de calidad según el propio autor, que marca Q3_K_M como "lower quality".

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3-VL-4b-Heretic-GGUF
- Modelo base: https://huggingface.co/DreamFast/Qwen3-VL-4b-Heretic
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Qwen3-VL-4b-Heretic-i1-GGUF
- Página de resumen y descargas del autor: https://hf.tst.eu/model#Qwen3-VL-4b-Heretic-GGUF
- Peticiones de cuantización y FAQ: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
