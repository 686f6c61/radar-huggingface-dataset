# mradermacher/Huihui-Qwen3.5-4B-Claude-4.6-Opus-abliterated-GGUF

## Resumen

Esta ficha cubre la cuantización GGUF del modelo `huihui-ai/Huihui-Qwen3.5-4B-Claude-4.6-Opus-abliterated`, publicada por mradermacher. Se trata de un modelo denso de aproximadamente 4.200 millones de parámetros derivado de la familia Qwen3.5 y sometido a un proceso de destilación de razonamiento a partir de trazas de tipo Claude (chain-of-thought), seguido de una técnica de "abliteration" que elimina la dirección de rechazo en el espacio de activaciones para producir una variante sin censura. El resultado es un modelo conversacional y de razonamiento orientado a inglés, con licencia Apache 2.0.

El aporte de mradermacher no es el modelo en sí, sino el conjunto de cuantizaciones estáticas en formato GGUF (de Q2_K a f16, además de variantes IQ) que permiten ejecutar el modelo en hardware de consumo mediante llama.cpp y ecosistemas compatibles. El repositorio ocupa 39,9 GB e incluye también suplementos multimodales (`mmproj`), lo que sugiere que el modelo base incorpora alguna capacidad de visión, aunque la model card no la detalla.

Su relevancia actual radica en que ofrece razonamiento con trazas explícitas en un tamaño de 4B, ejecutable en GPU de gama media y en CPU, con la salvedad de que la eliminación de salvaguardas implica riesgos de seguridad y de calidad que conviene evaluar antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiqueta "Dense" en la model card); detalles de capas y atención no disponibles |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, además de mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 4,2B parámetros, presumiblemente construido sobre la arquitectura Qwen3.5, aunque la model card no especifica número de capas, dimensión oculta, cabezas de atención ni mecanismo de atención concreto (no se confirma si emplea atención lineal, híbrida o estándar). La etiqueta "Dense" descarta que sea un modelo de mezcla de expertos. Tampoco se documenta la longitud de contexto nativa.

El linaje de entrenamiento se infiere de los metadatos: el modelo deriva de `Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled`, es decir, una destilación de razonamiento que imita trazas de tipo Claude 4.6 Opus sobre la base Qwen3.5-4B, y posteriormente fue procesado por huihui-ai mediante abliteration, una técnica que identifica y resta la dirección de activación asociada al rechazo de peticiones. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset, ni si hubo RLHF o DPO. Las cuantizaciones de mradermacher son estáticas (no imatrix); las variantes ponderadas con imatrix se publican en un repositorio separado (`-i1-GGUF`).

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento con cadena de pensamiento explícita (etiquetas `reasoning` y `chain-of-thought` en la model card).
- Capacidad multimodal probable: el repositorio incluye archivos `mmproj` (Q8_0 y f16), lo que indica soporte de entrada de imágenes en el modelo base, aunque la model card no lo describe ni detalla resolución o tareas soportadas.
- Comportamiento sin censura ("abliterated", "uncensored"): el modelo no aplica los rechazos típicos del modelo original ante peticiones sensibles.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque las trazas de razonamiento son compatibles con flujos multi-paso.
- Capacidades multilingües: limitadas a inglés según el campo `language`.
- Capacidades especiales: modo de razonamiento destilado de Claude 4.6 Opus; no se documentan audio ni otras modalidades.

## Casos de uso

- Prototipado de razonamiento en local: con la cuantización Q4_K_M (2,8 GB) el modelo cabe en una GPU de 6-8 GB o incluso en CPU, lo que permite experimentar con cadenas de pensamiento sin depender de APIs externas.
- Investigación sobre abliteration y alineación: útil para estudiar cómo la eliminación de la dirección de rechazo afecta a la calidad del razonamiento y a la tasa de respuestas dañinas, comparando contra el modelo base no ablacionado.
- Generación de datos sintéticos de razonamiento: las trazas chain-of-thought permiten producir justificaciones paso a paso para destilar en modelos más pequeños, siempre con revisión humana por el riesgo de contenido no filtrado.
- Asistente conversacional de dominio acotado en inglés: para entornos donde el operador controla la entrada y acepta la ausencia de salvaguardas, con contexto suficiente para conversaciones multi-turno (longitud exacta no disponible).
- Análisis de imágenes en local (si se confirma la multimodalidad): cargando los pesos principales junto con `mmproj-Q8_0` en llama.cpp, para tareas de descripción o extracción de información de capturas y documentos.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece doce niveles de cuantización, lo que permite medir la degradación de perplejidad y de calidad de razonamiento entre Q2_K y Q8_0 en el mismo hardware.
- Pruebas de robustez y red teaming: al carecer de rechazos, sirve como banco de pruebas para clasificadores de seguridad y filtros de salida antes de desplegar modelos alineados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): Q2_K ~2,0 GB; Q3_K_M ~2,4 GB; IQ4_XS ~2,6 GB; Q4_K_M ~2,8 GB; Q5_K_M ~3,2 GB; Q6_K ~3,6 GB; Q8_0 ~4,6 GB; f16 ~8,5 GB. Añadir 0,5-0,8 GB si se usa el suplemento multimodal `mmproj`.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 para las cuantizaciones altas con contexto largo; A100 o H100 no son necesarias para un modelo de este tamaño y solo aportarían ventaja en concurrencia.
- Cabe en GPU de consumo: sí, desde una GTX 1660 6 GB con Q4_K_M hasta una RTX 4090 con f16. También es viable en CPU con 8-16 GB de RAM usando Q4_K_M o Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI en plataformas de inferencia. vLLM y TGI no consumen GGUF de forma nativa y requerirían el modelo base en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware, la cuantización y la longitud de las trazas de razonamiento generadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (GGUF, mradermacher) | 4,2B denso | no disponible | Apache 2.0 | GGUF | Abliterated, razonamiento destilado de Claude, multimodal probable |
| huihui-ai/Huihui-Qwen3.5-4B-Claude-4.6-Opus-abliterated (base) | 4,2B denso | no disponible | Apache 2.0 | safetensors | Mismo modelo sin cuantizar; requiere transformers y más VRAM |
| Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled | ~4B denso | no disponible | Apache 2.0 | safetensors | Versión con salvaguardas intactas; referencia para medir el efecto de la abliteration |
| Qwen3.5-4B original | ~4B denso | no disponible | Apache 2.0 | safetensors | Modelo de partida, alineado y sin destilación de Claude |

No se dispone de datos de rendimiento comparado (benchmarks) para establecer diferencias cuantitativas entre estas variantes.

## Limitaciones y advertencias

- Ausencia de salvaguardas: la abliteration elimina los rechazos, por lo que el modelo puede generar contenido dañino, ilegal o sesgado sin filtro; no es apto para aplicaciones de cara al público sin una capa de moderación externa.
- Riesgo de alucinación: un modelo de 4B con razonamiento destilado tiende a producir cadenas de pensamiento plausibles pero incorrectas; las trazas no garantizan veracidad.
- Idioma: solo inglés declarado; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar cargas de trabajo con ventanas largas sin pruebas empíricas.
- Licencia: Apache 2.0 permite uso comercial, pero el titular de la licencia enlazada es el modelo de destilación de Jackrong; conviene verificar la cadena de licencias del modelo base Qwen3.5 y el cumplimiento de las condiciones de uso de los datos de destilación.
- Calidad de las cuantizaciones bajas: Q2_K y Q3_K_S degradan notablemente el razonamiento; para producción se recomienda Q5_K_M o superior.
- Multimodalidad no documentada: la presencia de `mmproj` no garantiza que la visión funcione correctamente en todas las cuantizaciones ni que la model card describa sus límites.
- Fecha de creación en 2026 y actualización en noviembre de 2026: verificar que los archivos descargados corresponden a la revisión esperada, dado el volumen del repositorio (39,9 GB).

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Huihui-Qwen3.5-4B-Claude-4.6-Opus-abliterated-GGUF
- Modelo base (safetensors): https://huggingface.co/huihui-ai/Huihui-Qwen3.5-4B-Claude-4.6-Opus-abliterated
- Modelo de razonamiento destilado de origen: https://huggingface.co/Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled
- Licencia referenciada: https://huggingface.co/Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled/blob/main/LICENSE
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Huihui-Qwen3.5-4B-Claude-4.6-Opus-abliterated-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Huihui-Qwen3.5-4B-Claude-4.6-Opus-abliterated-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
