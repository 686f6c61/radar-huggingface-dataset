# mradermacher/MasryGPT-Chat-1.5B-i1-GGUF

## Resumen

MasryGPT-Chat-1.5B-i1-GGUF es el conjunto de cuantizaciones GGUF generadas por mradermacher a partir del modelo ISLAM-PO/MasryGPT-Chat-1.5B, un ajuste fino conversacional de 1.543.714.304 parámetros (aproximadamente 1,54 B) orientado al árabe egipcio coloquial (masri) y al árabe estándar, con soporte secundario de inglés. Los tags del repositorio apuntan a una arquitectura de la familia Qwen2 / Qwen2.5, lo que sitúa al modelo en el segmento de los LLM pequeños, densos y de decoder-only, pensados para ejecución local o en hardware modesto.

El valor de este repositorio concreto no está en el modelo base, sino en el trabajo de cuantización: mradermacher publica un abanico muy amplio de cuantizaciones de tipo imatrix (i1), desde IQ1_S (0,5 GB) hasta Q6_K (1,4 GB), además de un fichero imatrix para generar cuantizaciones propias. Esto permite desplegar un modelo de dialecto árabe en portátiles, mini-PC o GPUs de gama de entrada, algo relevante para desarrolladores que necesitan procesamiento de lenguaje natural en árabe egipcio sin depender de APIs en la nube.

La fecha indicada en el repositorio es el 25 de septiembre de 2026, con 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicación reciente y sin validación comunitaria documentada. La licencia es Apache 2.0 en ambos repositorios (original y cuantizado).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, familia Qwen2 / Qwen2.5 (según los tags del repositorio) |
| Parámetros totales | 1.543.714.304 (~1,54 B) |
| Parámetros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible en la model card ni en la información proporcionada |
| Tipos de cuantización | GGUF imatrix (i1): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K. También existe un repositorio de cuantizaciones estáticas (MasryGPT-Chat-1.5B-GGUF) |
| Idiomas soportados | Árabe (incluye dialecto egipcio / masri) e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors / PyTorch |
| Tamaño del repositorio | 19,1 GB |
| Fichero imatrix | MasryGPT-Chat-1.5B.imatrix.gguf (0,1 GB) |
| Creado / actualizado | 2026-09-25 / 2026-09-25 |

## Arquitectura y entrenamiento

La model card no describe en detalle la arquitectura interna. Los tags (`qwen2`, `qwen2.5`, `causal-lm`) indican que el modelo base ISLAM-PO/MasryGPT-Chat-1.5B parte de la familia Qwen2.5 en su variante de 1,5 B, es decir, un transformer decoder-only causal denso con atención por causalidad estándar. No hay confirmación explícita de parámetros arquitectónicos concretos (número de capas, cabezas, dimensión oculta, tipo de normalización o implementación de RoPE) en la información disponible.

En cuanto al entrenamiento, los tags del repositorio (`qlora`, `peft`, `lora`, `unsloth`, `sft`) sugieren un ajuste fino supervisado (SFT) mediante adaptadores QLoRA entrenados con la librería Unsloth sobre el modelo base de Qwen2.5. No se documenta el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases posteriores de RLHF, DPO u optimización por preferencias. Tampoco se describe ninguna innovación técnica adicional: este repositorio es exclusivamente un trabajo de cuantización con imatrix, no una contribución arquitectónica.

## Capacidades

- Generación de texto conversacional y multi-turno, con especialización declarada en árabe egipcio coloquial (masri) y árabe estándar.
- Instrucciones y formato de chat: el modelo base está etiquetado como `instruction-tuned` y `chat`, por lo que se espera funcionamiento correcto con plantillas de conversación.
- Capacidad bilingüe árabe-inglés, según el campo `language` de la model card.
- Comprensión y producción de dialecto egipcio, incluyendo la etiqueta `عامية-مصرية` (árabe coloquial egipcio) que indica entrenamiento específico en registro dialectal.
- Soporte de tool calling / function calling: no disponible / no confirmado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible / no confirmado.
- Modo de razonamiento explícito (thinking mode), visión o audio: no disponible / no confirmado.
- Capacidades matemáticas y de generación de código: no documentadas ni evaluadas en la información disponible.

## Casos de uso

- Atención al cliente para el mercado egipcio: el modelo está afinado específicamente para registro coloquial egipcio, lo que permite conversaciones multi-turno con usuarios que escriben en dialecto en lugar de árabe estándar, un escenario donde los modelos entrenados solo en MSA fallan con frecuencia.
- Bots de mensajería en entornos con hardware limitado: al existir cuantizaciones desde 0,5 GB, se puede ejecutar en un portátil o en un servidor pequeño con llama.cpp u Ollama, reduciendo costes de API para volúmenes altos de conversación.
- Normalización y traducción de dialecto: uso como componente para convertir texto masri a árabe estándar (o al revés) en pipelines de subtitulado, transcripción o análisis de opiniones en redes sociales.
- Generación de contenido para redes sociales y marketing en Egipto: redacción de copys, respuestas y guiones en árabe egipcio coloquial, con revisión humana posterior.
- Preprocesado y etiquetado de corpus dialectales: generación de datos sintéticos en masri para aumentar datasets de entrenamiento o para tareas de clasificación posteriores.
- Prototipado e investigación en dialectología árabe: al ser un modelo pequeño y de pesos abiertos, permite experimentos reproducibles sobre variación dialectal sin depender de servicios propietarios.
- Asistente educativo para estudiantes egipcios: explicaciones y resolución de dudas en el registro lingüístico que el alumno usa habitualmente, integrado en una aplicación local.
- Chat de soporte en kiosco o terminal: despliegue en un equipo de gama baja con la cuantización IQ4_XS o Q4_K_M para interacción sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este repositorio es generada automáticamente por la herramienta de cuantización de mradermacher e incluye únicamente la tabla de cuantizaciones ofrecidas, notas sobre uso de ficheros GGUF y agradecimientos. No consta ninguna evaluación de MMLU, HumanEval, GSM8K, ni métricas específicas para árabe o dialecto egipcio.

## Requisitos de hardware

- VRAM estimada según cuantización (solo pesos, sin caché KV): IQ1_S ~0,5 GB; IQ2_M ~0,7 GB; IQ3_M ~0,9 GB; IQ4_XS ~1,0 GB; Q4_K_M ~1,1 GB; Q5_K_M ~1,2 GB; Q6_K ~1,4 GB; FP16 ~3,1 GB (cálculo a partir de los 1,543 B de parámetros).
- VRAM en uso real: añadir entre 0,3 y 1 GB adicionales para caché KV y overhead del runtime, en función de la longitud de contexto configurada. Para Q4_K_M, un presupuesto de 2 GB de VRAM suele ser suficiente.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM. Cabe en GTX 1650, RTX 3050, RTX 3060, RTX 4060, así como en iGPU con memoria unificada. No requiere A100 ni H100; usarlas sería desaprovecharlas.
- Ejecución en CPU: viable en todas las cuantizaciones. Con Q4_K_M se puede generar texto a velocidad de lectura en CPUs modernas de escritorio, y de forma más lenta en CPUs de portátil de gama baja.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llamafile y text-generation-webui (llama.cpp como backend). vLLM ofrece soporte GGUF experimental; para producción con alto throughput es preferible usar el modelo base en safetensors con vLLM o TGI, siempre que el formato de pesos original esté disponible.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo evaluado, por lo que la comparación se limita a características estructurales y de licencia. Los datos de los modelos comparados provienen de sus fichas públicas.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| MasryGPT-Chat-1.5B (este repositorio, cuantizado) | ~1,54 B | No disponible | Apache 2.0 | Árabe egipcio conversacional |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 tokens | Apache 2.0 | Instrucciones generales multilingües |
| Llama-3.2-1B-Instruct | ~1,2 B | 128.000 tokens | Licencia comunitaria Llama 3.2 (con restricciones) | Instrucciones generales multilingües |
| Gemma-2-2B-it | ~2,6 B | 8.192 tokens | Términos de uso de Gemma (con restricciones) | Instrucciones generales multilingües |

Frente a los tres alternativos, la diferencia relevante es la especialización dialectal: los modelos genéricos cubren árabe estándar de forma aceptable, pero su rendimiento en masri coloquial es habitualmente peor que el de un ajuste fino específico. A cambio, MasryGPT-Chat-1.5B parte de una base más pequeña en capacidades generales de razonamiento y no se ha evaluado públicamente, algo que sí ocurre con Qwen2.5, Llama y Gemma. No se dispone de comparativas con otros modelos de dialecto egipcio en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks publicados, ni del modelo base ni de las cuantizaciones, por lo que cualquier afirmación de calidad es especulativa.
- Tamaño reducido: con 1,54 B de parámetros, el razonamiento complejo, las matemáticas avanzadas y la generación de código extenso quedan fuera de su rango razonable de uso.
- Riesgo de alucinación: alto en modelos de esta escala, especialmente en preguntas factuales y en contextos largos.
- Sesgos: no se documentan la composición del dataset de ajuste fino ni los filtros aplicados, por lo que no se puede evaluar el sesgo dialectal, de género, religioso o político del modelo.
- Degradación severa en cuantizaciones extremas: las variantes IQ1_S, IQ1_M, IQ2_XXS e IQ2_XS (0,5-0,7 GB) están marcadas por el propio autor como «for the desperate» o «mostly desperate»; no son aptas para producción.
- Contexto desconocido: al no especificarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas ni dimensionar la caché KV con precisión.
- Cobertura idiomática limitada: solo árabe (con foco en egipcio) e inglés. No hay soporte declarado de otros dialectos árabes (golfo, levantino, magrebí) ni de otras lenguas.
- Idiomas minoritarios dentro del propio árabe: el entrenamiento en masri puede provocar un comportamiento errático ante entradas en árabe estándar formal o en dialectos distintos.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales de atribución más allá de las habituales de la licencia, pero conviene verificar la licencia y procedencia de los datos usados en el ajuste fino del modelo base, que no se documenta en la información disponible.
- Madurez del repositorio: 0 descargas y 0 likes, publicado en una fecha reciente; no hay evidencia de uso en producción ni informes independientes de calidad.
- Formato: al ser un repositorio GGUF, no es directamente utilizable con librerías que esperan safetensors (por ejemplo, entrenamiento con Transformers estándar). Para eso hay que acudir al modelo base.

## Enlaces

- Repositorio de cuantizaciones i1 (este): https://huggingface.co/mradermacher/MasryGPT-Chat-1.5B-i1-GGUF
- Modelo base: https://huggingface.co/ISLAM-PO/MasryGPT-Chat-1.5B
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/MasryGPT-Chat-1.5B-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/MasryGPT-Chat-1.5B-i1-GGUF/resolve/main/MasryGPT-Chat-1.5B.imatrix.gguf
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#MasryGPT-Chat-1.5B-i1-GGUF
- Guía de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad entre tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización y preguntas frecuentes del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (infraestructura empleada): https://www.nethype.de/

Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con este modelo; los enlaces listados proceden exclusivamente de la model card y de los metadatos del repositorio de HuggingFace.
