# ahmedsamirtarjama/arabic-ocr-abl-plain1k

## Resumen

`arabic-ocr-abl-plain1k` es un ajuste fino (fine-tune) del modelo multimodal `Qwen/Qwen3-VL-4B-Instruct` orientado a OCR y análisis de maquetación (layout) de documentos en árabe. Lo desarrolla el usuario ahmedsamirtarjama como parte de un proyecto de investigación alojado en el directorio `/mnt/extra/ocr` (carpeta de modelo `models/abl_plain1k_merged`) dentro de la organización `arabic-ocr-research-data`. El modelo se distribuye con licencia no especificada, sin idiomas declarados formalmente en la ficha de HuggingFace (aunque sus etiquetas indican árabe, OCR y document-layout) y sin descargas ni interacciones registradas en el momento de la consulta.

Técnicamente es un modelo de tipo imagen-a-texto (image-text-to-text) construido sobre la arquitectura Qwen3-VL del modelo base, con 4.437.815.808 parámetros totales (aproximadamente 4,44 mil millones), lo que lo sitúa en el rango de los 4B. El ajuste se realizó mediante LoRA con rango 64, cuyos pesos se fusionaron posteriormente en los pesos base, manteniendo congelado el codificador visual (vision tower). El repositorio ocupa 8,9 GB y los pesos se almacenan en formato safetensors, cargables con la librería `transformers`.

Su relevancia radica en cubrir una tarea de nicho con poca cobertura de modelos abiertos específicos: la digitalización y estructuración de documentos en árabe, un idioma con recursos limitados en herramientas OCR de código abierto de calidad. Al partir de un modelo de visión-lenguaje relativamente compacto (4B), resulta atractivo para despliegues de investigación con requisitos moderados de hardware. El autor remite a los ficheros `docs/TEST_PROTOCOL.md` y `REPORT.md` del repositorio de datos `arabic-ocr-research-data/code` para consultar los resultados, que no se reproducen en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (vision-language transformer), fine-tune LoRA r64 sobre Qwen/Qwen3-VL-4B-Instruct, vision tower congelada |
| Parametros totales | 4.437.815.808 (aproximadamente 4,44 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponibles formalmente; etiquetas de la ficha: arabic, ocr, document-layout |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-VL-4B-Instruct`, un transformer multimodal de visión-lenguaje con 4.437.815.808 parámetros. El ajuste consiste en un LoRA de rango 64 (r64) aplicado y posteriormente fusionado (merged) en los pesos base, es decir, el resultado son pesos completos listos para inferencia sin necesidad de adaptadores adicionales. Durante el ajuste se congeló el codificador visual (vision tower), de modo que el aprendizaje se concentró en las capas de lenguaje y proyección multimodal, no en la percepción visual.

No se detallan en la model card datos como el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. El nombre del modelo (`abl_plain1k`) sugiere un experimento de ablación sobre un conjunto de aproximadamente 1000 muestras («1k») con configuración «plain», pero esto no se confirma explícitamente en la información disponible. La receta de inferencia recomendada por el autor incluye el uso de vLLM con el prompt `prompt_layout_all_en`, temperatura 0,1, top_p 1,0 y max_tokens 8192, seguido de un postprocesado de recorte denominado `trim_tail` + `trim_v2` cuyo código se encuentra en el repositorio `arabic-ocr-research-data`, carpeta `code/scripts/`.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos, con orientación al idioma árabe.
- Análisis de maquetación de documentos (document-layout): interpretación de la estructura visual y espacial de las páginas.
- Conversión de imagen a texto (image-text-to-text) mediante el pipeline multimodal heredado del modelo base.
- Generación de texto a partir de indicaciones multimodales con salida de hasta 8192 tokens configurada en la receta de inferencia del autor.
- Capacidades conversacionales heredadas del modelo base (`Instruct`).
- Soporte de herramientas, uso de agentes, capacidades multilingües generales, visión ampliada, audio o modo de razonamiento explícito: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalización de archivos históricos en árabe: el modelo puede procesar imágenes de manuscritos o documentos escaneados y extraer su contenido textual, aprovechando su especialización en OCR árabe para corpus que otros modelos abiertos cubren peor.
- Estructuración de documentos administrativos: al combinar OCR con análisis de layout, permite reconstruir tablas, cabeceras y bloques de una página, útil para la ingesta de formularios o expedientes gubernamentales.
- Indexación y búsqueda documental: convertir lotes de PDF escaneados en árabe a texto estructurado para alimentar motores de búsqueda o bases de datos vectoriales.
- Investigación en visión-lenguaje para árabe: sirve como punto de partida (baseline) para experimentos de ablación y comparativas de OCR, dado su origen explícitamente investigador.
- Automatización de transcripción de facturas y recibos en árabe: extracción de campos textuales con el pipeline image-text-to-text para integración en sistemas de contabilidad.
- Prototipado académico de bajo coste: con un modelo de 4B y despliegue vía vLLM, es viable ejecutar pruebas en entornos de investigación con GPUs de gama media sin recurrir a modelos de mayor tamaño.
- Preprocesado de corpus lingüísticos árabes: generación de transcripciones iniciales que luego se corrigen manualmente para construir datasets de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los ficheros `docs/TEST_PROTOCOL.md` y `REPORT.md` del repositorio de datos `arabic-ocr-research-data/code` para consultar los resultados, pero estos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.437.815.808 parámetros (aproximadamente 4,44B), se estima en torno a 9-10 GB en precisión fp16/bf16 solo para pesos, más la memoria del codificador visual y de las cachés de activación; en cuantización de 8 bits cabría en torno a 5-6 GB y en 4 bits alrededor de 3-4 GB, aunque no se confirman cuantizaciones oficiales.
- GPU recomendadas: para fp16 se recomienda al menos una GPU de 16 GB (RTX 4090, A100 40 GB, H100). En cuantización reducida podría ejecutarse en GPUs consumer de 8-12 GB (RTX 3060 12 GB, RTX 4070), siempre que el soporte de cuantización esté disponible.
- Compatibilidad con GPU de consumo: probable en tarjetas de 12-16 GB o superiores, ya que el modelo es de 4B; requiere verificar soporte de cuantización del pipeline multimodal.
- Opciones de despliegue: el autor indica explícitamente el uso de vLLM. Al ser un modelo `transformers` con pesos safetensors, también es desplegable mediante TGI u otras soluciones compatibles con transformers. No se confirma compatibilidad con llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Enfoque |
|---|---|---|---|---|---|
| arabic-ocr-abl-plain1k | 4,44B | no disponible | no disponible | HuggingFace (0 descargas) | OCR/layout arabe (fine-tune) |
| Qwen/Qwen3-VL-4B-Instruct | no disponible | no disponible | no disponible | HuggingFace (modelo base) | Vision-lenguaje general |
| Alternativas OCR arabes abiertas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este modelo y alternativas de la misma categoría en la informacion proporcionada. Los modelos comparables serían otros sistemas de OCR árabe de código abierto y el propio modelo base, pero no se aportan métricas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no especificada: al no declararse la licencia, no se puede garantizar el uso comercial; conviene contactar con el autor antes de cualquier despliegue en producción.
- Modelo de investigación: la ficha lo etiqueta explícitamente como `research` y `experiment`, sin garantías de robustez ni de soporte.
- Idiomas no declarados formalmente: aunque las etiquetas apuntan al árabe, no se documenta la cobertura lingüística real ni el comportamiento en otros idiomas.
- Riesgo de alucinación: como modelo de visión-lenguaje generativo, puede producir texto plausible que no aparezca en la imagen; el postprocesado `trim_tail`/`trim_v2` del autor sugiere que se observaron artefactos de generación en la cola de la salida.
- Sesgos conocidos: no disponible en la informacion proporcionada; al depender del modelo base y de datos de ajuste no documentados, no se puede evaluar el sesgo.
- Ausencia de benchmarks publicados: no se aportan métricas reproducibles, lo que dificulta validar su calidad frente a alternativas.
- Escasa tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validación por parte de la comunidad.
- Dependencia del pipeline de postprocesado: los resultados reportados por el autor dependen de scripts externos (`trim_tail`, `trim_v2`) alojados en otro repositorio, lo que añade complejidad al despliegue.

## Enlaces

- HuggingFace: https://huggingface.co/ahmedsamirtarjama/arabic-ocr-abl-plain1k
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio de datos y código de investigación (referenciado en la model card): `arabic-ocr-research-data/code` (ficheros `docs/TEST_PROTOCOL.md`, `REPORT.md` y `code/scripts/`); no se proporciona URL directa en la informacion disponible.
