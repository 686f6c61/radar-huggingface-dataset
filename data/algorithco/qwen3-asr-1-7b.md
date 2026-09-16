# algorithco/Qwen3-ASR-1.7B

## Resumen

Qwen3-ASR-1.7B es un modelo de reconocimiento automático del habla (ASR) desarrollado por el equipo Qwen (Alibaba), distribuido en este repositorio por el usuario algorithco. Forma parte de la familia Qwen3-ASR junto con la variante Qwen3-ASR-0.6B y el modelo auxiliar Qwen3-ForcedAligner-0.6B. El modelo realiza identificación de idioma y transcripción sobre 30 idiomas y 22 dialectos chinos, con un único modelo que cubre tanto inferencia en streaming como en modo offline.

Según la model card, el modelo se apoya en la capacidad de comprensión de audio del modelo fundacional Qwen3-Omni y ha sido entrenado con datos de habla a gran escala. El autor declara un rendimiento de vanguardia entre los modelos ASR de código abierto, competitivo con las principales APIs comerciales propietarias, aunque no se aportan cifras concretas de benchmarks en la información disponible. Su relevancia actual radica en que cubre un hueco poco frecuente: un ASR abierto, con licencia Apache 2.0, que unifica transcripción offline y streaming, admite audio largo y canta/voz sobre música de fondo.

El repositorio ocupa 4,7 GB y contiene pesos en safetensors. Los metadatos de HuggingFace indican aproximadamente 2.349 millones de parámetros (~2,35B), una cifra superior a la que sugiere el nombre comercial "1.7B". El repositorio cuenta con 0 descargas y 0 "likes" en el momento de la consulta y fue creado el 16 de septiembre de 2026, por lo que se trata de una réplica no oficial y sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; la model card indica que se apoya en el modelo fundacional multimodal Qwen3-Omni (encoder de audio + decodificador de lenguaje) |
| Parámetros totales | 2.349.217.408 (~2,35B) según safetensors en HuggingFace |
| Parámetros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | 30 idiomas: chino (zh), inglés (en), cantonés (yue), árabe (ar), alemán (de), francés (fr), español (es), portugués (pt), indonesio (id), italiano (it), coreano (ko), ruso (ru), tailandés (th), vietnamita (vi), japonés (ja), turco (tr), hindi (hi), malayo (ms), neerlandés (nl), sueco (sv), danés (da), finés (fi), polaco (pl), checo (cs), filipino (fil), persa (fa), griego (el), húngaro (hu), macedonio (mk), rumano (ro). Más 22 dialectos chinos: Anhui, Dongbei, Fujian, Gansu, Guizhou, Hebei, Henan, Hubei, Hunan, Jiangxi, Ningxia, Shandong, Shaanxi, Shanxi, Sichuan, Tianjin, Yunnan, Zhejiang, cantonés (acento de Hong Kong), cantonés (acento de Guangdong), wu y minnan |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline declarado | automatic-speech-recognition |
| Modalidad de inferencia | Offline y streaming con el mismo modelo |
| Tipos de audio soportados | Habla, voz cantada y canciones con música de fondo (BGM) |
| Paquete de inferencia | `qwen-asr` (backends de transformers y de vLLM) |
| Tamaño del repositorio | 4,7 GB |
| Idioma del modelo base declarado | No disponible en metadatos de HuggingFace (el campo de idiomas aparece vacío) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna en texto: describe la familia como un conjunto de modelos ASR que aprovechan "la fuerte capacidad de comprensión de audio de su modelo fundacional, Qwen3-Omni". Se trata, por tanto, de un modelo derivado de un sistema multimodal (audio-texto) del que no se publican en este repositorio ni el número de capas, ni la dimensión oculta, ni el mecanismo de atención concreto, ni la longitud de contexto. Las especificaciones de arquitectura se presentan únicamente mediante diagramas en la model card original.

Respecto al entrenamiento, la información disponible indica el uso de "datos de habla a gran escala" sin especificar el número de tokens, la composición del dataset ni si hubo fases de ajuste por RLHF o DPO. Tampoco se documenta la estrategia de alineación de audio a texto, más allá de que el modelo produce transcripciones con identificación de idioma integrada. La innovación técnica más destacable que sí se documenta es la solución de alineación forzada: el modelo auxiliar Qwen3-ForcedAligner-0.6B predice marcas temporales para unidades arbitrarias en hasta 5 minutos de audio y 11 idiomas, con una precisión declarada superior a la de los modelos de alineación forzada end-to-end. Además, se libera un toolkit de inferencia que soporta lotes con vLLM, servicio asíncrono, inferencia en streaming y predicción de timestamps.

## Capacidades

- Reconocimiento automático del habla en 30 idiomas, con un único modelo para todos ellos.
- Identificación automática del idioma (language identification) integrada en el propio pipeline de ASR.
- Cobertura de 22 dialectos chinos, incluidos los acentos cantonés de Hong Kong y Guangdong, wu y minnan.
- Transcripción de voz cantada y de canciones con música de fondo, no solo habla limpia.
- Inferencia unificada en modo offline y en modo streaming con los mismos pesos.
- Transcripción de audio largo mediante segmentación (la model card indica soporte explícito para "transcribe long audio").
- Predicción de marcas temporales a nivel de unidad mediante el modelo complementario Qwen3-ForcedAligner-0.6B (hasta 5 minutos de audio en 11 idiomas).
- Servicio asíncrono y por lotes a través del backend de vLLM.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni razonamiento multi-paso; es un modelo especializado en ASR.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo procesa audio largo y ofrece identificación de idioma automática, lo que permite transcribir conversaciones multilingües sin configurar el idioma de entrada manualmente.
- Subtitulado automático de vídeo: la combinación del ASR con Qwen3-ForcedAligner-0.6B permite generar subtítulos con marcas temporales precisas para contenido en español, inglés, francés, alemán, italiano, portugués, ruso, japonés, coreano, chino y cantonés.
- Atención al cliente telefónica: con el backend de vLLM y servicio asíncrono se pueden transcribir llamadas en tiempo real mediante streaming y alimentar un sistema de análisis posterior.
- Archivado y búsqueda de contenido audiovisual: transcripción por lotes de grandes volúmenes (el modelo hermano de 0,6B alcanza 2000 veces de throughput con concurrencia 128 según la model card) para indexar audio y hacerlo buscable.
- Transcripción de contenido musical o con ruido de fondo: al soportar voz cantada y BGM, cubre podcasts con música, entrevistas en entornos ruidosos o directos musicales que degradan a los ASR convencionales.
- Accesibilidad: generación de subtítulos en directo para personas con discapacidad auditiva aprovechando el modo streaming y la baja latencia esperable de un modelo de ~2,35B parámetros.
- Análisis de mercados locales en China: con 22 dialectos soportados, permite transcribir encuestas, entrevistas o atención telefónica en regiones donde el mandarín estándar no es la lengua habitual.
- Preprocesado para pipelines de datos: transcripción masiva de audio para construir datasets de texto en 30 idiomas con detección de idioma incluida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma que la versión de 1,7B alcanza "rendimiento de vanguardia entre los modelos ASR de código abierto" y es "competitiva con las APIs comerciales propietarias más potentes", y que la versión de 0,6B alcanza 2000 veces de throughput con concurrencia 128, pero no se incluyen tablas con cifras de benchmarks abiertos (WER, MMLU, FLEURS, Common Voice, etc.) ni comparaciones numéricas con modelos concretos. La única cifra de rendimiento verificable en la documentación es la de throughput del modelo de 0,6B, que no es extrapolable directamente al modelo de 1,7B.

## Requisitos de hardware

- Peso de los pesos en safetensors: 4,7 GB (coherente con almacenamiento en bf16/fp16 para ~2,35B parámetros).
- VRAM estimada para inferencia en bf16/fp16: en torno a 6-8 GB incluyendo activaciones y caché de audio; el consumo crece con la longitud del audio y el tamaño del lote.
- VRAM estimada con cuantización: no disponible; el repositorio no publica versiones cuantizadas. Como referencia teórica, int8 requeriría ~2,5-3 GB e int4 ~1,5-2 GB, pero son estimaciones, no cifras oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). Para lotes grandes y audio largo se recomienda 12-16 GB o más.
- Aceleración recomendada: la model card recomienda FlashAttention 2 para reducir el uso de memoria de GPU y acelerar la inferencia, especialmente en entradas largas y lotes grandes. La compilación de flash-attn con menos de 96 GB de RAM requiere limitar los trabajos paralelos (`MAX_JOBS=4`).
- Entorno recomendado: Python 3.12 en un entorno aislado (`conda create -n qwen3-asr python=3.12`).
- Opciones de despliegue: paquete `qwen-asr` con backend de transformers, paquete `qwen-asr[vllm]` con backend de vLLM para inferencia por lotes y streaming, servicio asíncrono, servidor Docker oficial (mencionado en la model card) y descarga local de pesos desde ModelScope o HuggingFace.
- Latencia y throughput: no disponibles para el modelo de 1,7B. El único dato publicado es que el modelo de 0,6B alcanza 2000 veces de throughput con concurrencia de 128.

## Comparativa con modelos similares

Nota: los datos de los modelos comparados provienen de su documentación pública y no de la información proporcionada en esta búsqueda; conviene verificarlos antes de tomar decisiones.

| Modelo | Parámetros | Idiomas | Licencia | Formatos | Contexto / audio |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B (esta ficha) | 2,35B reales (~1,7B nominales) | 30 idiomas + 22 dialectos chinos | Apache 2.0 | safetensors | Offline y streaming; audio largo no cuantificado |
| Qwen3-ASR-0.6B | No disponible en esta información | 30 idiomas + 22 dialectos chinos | Apache 2.0 | safetensors | Offline y streaming; 2000x throughput a concurrencia 128 |
| Whisper large-v3 | ~1,55B | ~99 idiomas | MIT | safetensors, GGUF (comunitarios) | Ventanas de 30 s, sin streaming nativo |
| Whisper large-v3-turbo | ~809M | ~99 idiomas | MIT | safetensors, GGUF (comunitarios) | Ventanas de 30 s, decodificador reducido |

Frente a Whisper, la ventaja declarada de Qwen3-ASR es la cobertura de dialectos chinos, el soporte nativo de streaming con el mismo modelo, la transcripción de voz cantada y audio con música de fondo, y el modelo de alineación forzada asociado. La desventaja es la falta de cifras públicas de WER que permitan una comparación objetiva, así como la ausencia de cuantizaciones GGUF oficiales en este repositorio.

## Limitaciones y advertencias

- Repositorio no oficial: el modelo lo publica el usuario `algorithco`, no el equipo Qwen. No hay confirmación de que los pesos sean idénticos a los de `Qwen/Qwen3-ASR-1.7B`. El repositorio tiene 0 descargas y 0 "likes", por lo que no cuenta con validación de la comunidad.
- Discrepancia entre el nombre y los parámetros: el identificador dice "1.7B" pero el recuento de safetensors da 2.349.217.408 parámetros (~2,35B). Conviene verificar el contenido antes de dimensionar infraestructura.
- Idiomas no declarados en los metadatos de HuggingFace: el campo de idiomas aparece vacío, aunque la model card liste 30 idiomas y 22 dialectos. Las herramientas que filtran por idioma en el Hub no detectarán este modelo.
- Riesgo de alucinación: como todo modelo ASR de secuencia a secuencia, puede generar texto plausible en fragmentos de silencio, ruido extremo o música instrumental sin voz. No se documenta ningún mecanismo específico de mitigación.
- Sesgo lingüístico esperable: la cobertura de dialectos es exclusivamente china y el grueso del entrenamiento declarado se centra en chino e inglés; el rendimiento en idiomas con menos representación (por ejemplo, macedonio, finés o filipino) no está cuantificado.
- Limitaciones de contexto: no se especifica la longitud de contexto ni la longitud máxima de audio procesable en una sola pasada. El soporte de "audio largo" se implementa por segmentación, lo que puede degradar la coherencia entre segmentos y afectar a la puntuación o al cambio de hablante.
- Timestamps: la predicción de marcas temporales requiere cargar un modelo adicional (Qwen3-ForcedAligner-0.6B) y está limitada a 11 idiomas y a 5 minutos de audio.
- Cuantización: no hay versiones cuantizadas publicadas en este repositorio, lo que puede dificultar el despliegue en hardware limitado sin recurrir a herramientas externas.
- Licencia: Apache 2.0 permite uso comercial y modificaciones sin restricciones conocidas, pero se recomienda revisar los términos del repositorio original de Qwen por si existiesen condiciones adicionales de uso aceptable.
- Fechas y referencias: el repositorio está fechado en septiembre de 2026 y la etiqueta del artículo (`arxiv:2601.21337`) no se ha podido verificar en la información disponible.
- Compatibilidad: la model card recomienda entornos limpios de Python 3.12 y advierte de conflictos de dependencias; la compilación de FlashAttention 2 puede requerir ajustes de memoria en máquinas con menos de 96 GB de RAM.

## Enlaces

- Repositorio de HuggingFace (réplica de algorithco): https://huggingface.co/algorithco/Qwen3-ASR-1.7B
- Repositorio oficial del modelo en HuggingFace: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Modelo de 0,6B en HuggingFace: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Modelo de alineación forzada en HuggingFace: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Repositorio de código: https://github.com/QwenLM/Qwen3-ASR
- Descarga vía ModelScope: https://modelscope.cn/models/Qwen/Qwen3-ASR-1.7B
- Referencia de artículo declarada en las etiquetas: arxiv:2601.21337 (no verificada en la información disponible)
- Imagen de introducción de la familia: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-ASR-Repo/qwen3_asr_introduction.png
- Diagrama de arquitectura: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-ASR-Repo/overview.jpg
- Nota sobre la búsqueda web: los resultados devueltos por la búsqueda corresponden a un comercio de muebles (catrahome.com) y no guardan relación con el modelo; no se han encontrado enlaces técnicos adicionales por esa vía.
