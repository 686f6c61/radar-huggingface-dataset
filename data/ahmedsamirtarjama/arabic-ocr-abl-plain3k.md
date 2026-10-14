# ahmedsamirtarjama/arabic-ocr-abl-plain3k

## Resumen

`arabic-ocr-abl-plain3k` es un ajuste fino de OCR y análisis de estructura de documentos en árabe construido sobre `Qwen/Qwen3-VL-4B-Instruct`, un modelo multimodal de visión-lenguaje de la familia Qwen3-VL. Lo publica el usuario de HuggingFace `ahmedsamirtarjama` como experimento de investigación, no como modelo de producción: se trata de una ablación ("abl") sobre un subconjunto de datos etiquetado como "plain3k" en la propia nomenclatura del repositorio.

El modelo tiene 4.437.815.808 parámetros (4,44 mil millones) almacenados en safetensors, con un tamaño de repositorio de 8,9 GB, coherente con pesos en bf16/fp16. El entrenamiento consistió en un LoRA de rango 64 fusionado en los pesos del modelo base, manteniendo congelado el torreón de visión. La tarea objetivo es la transcripción de texto árabe y la extracción de estructura de documentos a partir de imágenes, con un protocolo de inferencia declarado sobre vLLM.

Su relevancia es limitada y de carácter exploratorio: el repositorio acumula 0 descargas y 0 "likes" en el momento de la consulta, no declara licencia ni idiomas en la metadata, y solo existe documentación de resultados referenciada de forma externa (informes `TEST_PROTOCOL.md` y `REPORT.md` alojados en otro repositorio de datos). Es útil como punto de partida reproducible para quien investigue OCR árabe con modelos visión-lenguaje pequeños, pero no como componente listo para despliegue.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (hereda la arquitectura del modelo base Qwen3-VL; el ajuste es un LoRA r64 fusionado con torre de visión congelada) |
| Parametros totales | 4.437.815.808 (4,44 B) |
| Parametros activos | No aplica: no se documenta una variante MoE en la información disponible |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No se documentan versiones cuantizadas (GGUF, AWQ, GPTQ, bitsandbytes). El repositorio solo contiene safetensors |
| Idiomas soportados | No declarados en la metadata. Las etiquetas incluyen "arabic" y el protocolo de inferencia usa un prompt en inglés (`prompt_layout_all_en`) |
| Licencia | No disponible (el repositorio no declara licencia) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-VL-4B-Instruct`, un transformer multimodal de tipo image-text-to-text que procesa imágenes y texto de forma conjunta. Sobre esa base se aplicó un ajuste con LoRA de rango 64, que posteriormente se fusionó en los pesos del modelo ("merged"), de modo que el artefacto publicado no requiere cargar adaptadores por separado. La torre de visión quedó congelada durante el entrenamiento, por lo que la adaptación se concentra en la parte lingüística y en la proyección multimodal. El directorio de trabajo original fue `models/abl_plain3k_merged` dentro de `/mnt/extra/ocr` (proyecto de investigación en el servidor `server3-ts`).

No se especifican en la model card el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado. El nombre "plain3k" sugiere un conjunto de aproximadamente 3.000 ejemplos en formato plano, pero esta interpretación no está confirmada en la documentación disponible. Tampoco se detalla la estrategia de aumento de datos, el preprocesado de imágenes ni si se aplicaron técnicas como decodificación especulativa o atención lineal.

La innovación técnica destacable es de índole metodológica: se publica como una ablación comparable dentro de una línea de experimentos de OCR árabe, con un protocolo de inferencia reproducible (vLLM, prompt `prompt_layout_all_en`, temperatura 0,1, top_p 1,0, max_tokens 8192) y un postprocesado definido por dos funciones de recorte (`trim_tail` y `trim_v2`) cuyos scripts se alojan en el repositorio de datos `arabic-ocr-research-data`, bajo `code/scripts/`.

## Capacidades

- Generación de texto condicionada por imagen: transcripción de texto árabe presente en documentos escaneados o fotografías.
- Análisis de estructura de documentos ("document-layout"): la etiqueta del repositorio indica que se entrena para recuperar la disposición del contenido, no solo caracteres sueltos.
- Conversación multimodal multi-turno: el pipeline declarado es image-text-to-text y la etiqueta "conversational" está presente, por lo que acepta diálogo alternando imágenes y texto.
- Salidas largas: el protocolo de inferencia fija `max_tokens` en 8192, lo que sugiere que el modelo se usa para transcripciones extensas, no para respuestas cortas.
- Seguimiento de instrucciones en inglés para tareas de OCR en árabe: el prompt documentado (`prompt_layout_all_en`) está redactado en inglés aunque el contenido a extraer sea árabe.
- Capacidades heredadas del modelo base: al ser un ajuste fino de `Qwen3-VL-4B-Instruct`, conserva en principio las capacidades generales de visión-lenguaje del base, aunque la model card no las certifica ni las evalúa por separado.
- Tool calling / function calling: no documentado.
- Modo "thinking" explícito: no documentado.
- Audio o vídeo: no documentado.

## Casos de uso

- Digitalización de corpus documentales en árabe: el modelo puede convertir imágenes de páginas escaneadas en texto plano estructurado, aprovechando el ajuste específico sobre escritura árabe y el prompt de layout. Adecuado cuando el volumen justifica una fase de validación manual.
- Extracción de estructura en documentos administrativos árabes: obtención de bloques, encabezados y orden de lectura a partir de la imagen, útil para pipelines de ingestión documental previos a un motor de búsqueda.
- Construcción de bases de conocimiento y RAG sobre archivos árabes: la salida de OCR alimentaría un indexador vectorial; el modelo es apropiado por su tamaño contenido (4,44 B), que permite ejecutarlo en una GPU única durante el preprocesado por lotes.
- Investigación comparativa en OCR árabe: al tratarse de una ablación publicada con protocolo de inferencia fijo, sirve como punto de comparación reproducible frente a otras variantes de la misma línea experimental.
- Evaluación de pipelines de OCR con vLLM: el repositorio documenta explícitamente el motor de inferencia (`vLLM`), parámetros de muestreo y funciones de postprocesado, lo que facilita reproducir experimentos de latencia y calidad.
- Preprocesado de documentación técnica o académica en árabe: transcripción de manuales, artículos o informes con mezcla de texto y elementos gráficos, siempre con revisión posterior.
- Prototipado académico: por su licencia no declarada y su naturaleza experimental, encaja en entornos de investigación y pruebas internas, no en productos comerciales sin una revisión legal previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a los documentos `docs/TEST_PROTOCOL.md` y `REPORT.md` dentro del repositorio de datos `arabic-ocr-research-data` (`code/`), pero no incluye cifras de métricas como MMLU, HumanEval, GSM8K ni métricas específicas de OCR (CER, WER, precisión de layout). No se dispone por tanto de datos verificables de rendimiento ni de comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 4,44 B de parámetros (estimaciones, no cifras publicadas por el autor):
  - bf16/fp16: aproximadamente 8,9 GB solo de pesos, en línea con el tamaño del repositorio (8,9 GB); con caché KV, activaciones de visión y overhead del runtime, conviene reservar del orden de 12-16 GB.
  - int8: aproximadamente 4,4 GB de pesos; alrededor de 8-10 GB con overhead.
  - int4: aproximadamente 2,2 GB de pesos; alrededor de 5-7 GB con overhead, aunque no se distribuyen pesos cuantizados oficialmente.
- GPU recomendadas: el autor usa vLLM, lo que implica GPUs de datacenter o workstation recientes (A100, H100, L40S, A6000, RTX 4090). No hay cifras de throughput ni de latencia publicadas.
- Cabe en GPU de consumo: sí, en bf16 cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con margen. En tarjetas de 12 GB (RTX 3060, RTX 4070) requeriría cuantización a 8 bits o 4 bits, no distribuida en el repositorio. En tarjetas de 8 GB el despliegue en bf16 no es viable.
- Opciones de despliegue: vLLM (documentado por el autor), transformers con la clase correspondiente a `qwen3_vl` (la librería declarada). TGI es plausible por compatibilidad con transformers, pero no está documentado. Ollama y llama.cpp requerirían convertir los pesos a GGUF, conversión que no se distribuye.
- Latencia y throughput: no disponibles. El único parámetro operativo conocido es `max_tokens = 8192` con temperatura 0,1 y top_p 1,0, orientado a salidas largas y deterministas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arabic-ocr-abl-plain3k | 4,44 B | No disponible | Árabe (según etiquetas), prompts en inglés | No declarada | Repositorio HuggingFace, 0 descargas |
| Qwen/Qwen3-VL-4B-Instruct (modelo base) | Clase 4 B | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada | Repositorio HuggingFace público |
| Otros ajustes de OCR árabe sobre VLM | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

Solo se dispone de datos verificables del modelo base como referencia arquitectónica. No se han proporcionado especificaciones de alternativas comparables (por ejemplo, otros OCR árabes basados en Qwen2.5-VL, InternVL o modelos OCR dedicados), por lo que la comparación cuantitativa queda como "no disponible".

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no incluye archivo de licencia. Esto impide determinar si el uso comercial está permitido y obliga a revisar la licencia del modelo base antes de cualquier despliegue. Es el principal riesgo legal del artefacto.
- Naturaleza experimental: la propia model card se etiqueta como "experiment" y el nombre incluye "abl" (ablación), lo que indica que no se ha validado como producto final.
- Sin métricas publicadas: no hay datos de CER, WER ni precisión de layout en la información disponible, por lo que no puede afirmarse su calidad frente a alternativas.
- Riesgo de alucinación: como cualquier modelo generativo multimodal, puede inventar texto ausente en la imagen, especialmente con documentos degradados, manuscritos o tipografías poco comunes. El postprocesado documentado (`trim_tail`, `trim_v2`) sugiere que los autores ya observaron colas de salida problemáticas.
- Sesgos: no evaluados ni documentados. La distribución del conjunto "plain3k" condiciona el comportamiento; dominios, épocas o estilos tipográficos ausentes en él probablemente rindan peor.
- Limitaciones de idioma: el ajuste está orientado al árabe y las etiquetas no declaran otros idiomas. Otros idiomas, incluido el español, no están cubiertos por la documentación.
- Limitación de contexto: no se especifica la ventana de contexto disponible. El protocolo fija `max_tokens = 8192` para la generación, pero eso no equivale a la longitud de contexto de entrada.
- Dependencia de un prompt concreto: el rendimiento declarado se asocia a `prompt_layout_all_en`, lo que implica que desviarse de ese formato puede degradar los resultados.
- Madurez del ecosistema: 0 descargas y 0 "likes" en el momento de la consulta, sin issues ni validación externa conocida. No hay garantía de mantenimiento.
- Sin cuantizaciones oficiales: desplegar en GPUs de gama baja exige generar cuantizaciones propias, con el consiguiente riesgo de degradación no medida.
- Hardware: la torre de visión congelada no implica coste de cómputo despreciable en inferencia; el procesado de imágenes de alta resolución puede elevar el consumo de memoria por encima de lo que sugieren los pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ahmedsamirtarjama/arabic-ocr-abl-plain3k
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio de datos y código citado en la model card: `arabic-ocr-research-data` (sección `code/`, scripts `code/scripts/`; no se proporciona URL en la información disponible)
- Informes citados por el autor: `docs/TEST_PROTOCOL.md` y `REPORT.md` (ubicados en `arabic-ocr-research-data/code/`; contenido no accesible desde la información proporcionada)
- Paper, blog o demo adicionales: no disponibles
