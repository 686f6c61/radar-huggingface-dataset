# bestdev57/zils-lite-body-2

## Resumen

zils-lite-body-2 es un ajuste fino (fine-tune) de tipo LoRA fusionado en precisión bf16 sobre el modelo base vllm-sr/d3-lite, un transformer denso de aproximadamente 0,85 mil millones de parámetros (852.985.920 según los pesos en safetensors). Lo desarrolla el usuario bestdev57 dentro de un proyecto denominado "zils", orientado a la toma de decisiones y a la clasificación de tareas de examen, y se publica bajo licencia Apache-2.0. El modelo parte de la media uniforme de los "soup bodies" ligeros existentes, es decir, de una combinación por promedio de pesos de variantes previas del mismo linaje.

El problema que aborda es el de un modelo pequeño especializado en decisiones estructuradas: clasificación de implicación textual (NLI), similitud semántica, pregunta-respuesta, detección de intenciones, clasificación temática, análisis de sentimiento, aritmética sencilla, llamadas a herramientas con recuento, formas verbales de UniMorph, sarcasmo en titulares, cortesía según el corpus de Stanford y eventos de resultado del mundo real. Se entrena además con probabilidades de un profesor denominado "Zils Relay" y con regularización por autodestilación, lo que sugiere una destilación de conocimiento desde un modelo mayor.

Es relevante ahora porque representa un patrón habitual en el ecosistema open source: modelos de menos de mil millones de parámetros, ajustados para tareas concretas y desplegables en hardware modesto, que compiten por nichos donde un modelo grande generalista resulta sobredimensionado. La información pública disponible es muy escasa: cero descargas, cero likes, sin pipeline declarado y sin idiomas especificados, lo que limita cualquier evaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de vllm-sr/d3-lite); torre de visión sin modificar según la model card |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el repo ocupa 1,7 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe un ajuste fino LoRA fusionado (merged) en bf16 sobre vllm-sr/d3-lite, partiendo de la media uniforme de los "soup bodies" ligeros actuales. El resultado es un modelo denso de unos 0,85B parámetros; no se especifica el número de capas, la dimensión oculta ni la configuración de atención. La mención de una "vision tower unchanged" indica que el linaje incorpora un codificador visual, aunque no se detalla su arquitectura ni si está activo en este checkpoint.

El entrenamiento se realizó sobre "decisiones estilo examen" construidas a partir de particiones públicas de entrenamiento: NLI, similitud, QA, intenciones, tema, sentimiento y aritmética; además de fixtures computados de llamadas a herramientas y recuento, formas verbales de UniMorph, sarcasmo en titulares, cortesía de Stanford, eventos de resultado del mundo real (zils.current) y probabilidades del profesor Zils Relay, con regularización por autodestilación. No se indica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO; la presencia de un profesor y de autodestilación apunta a destilación supervisada más que a optimización por preferencias.

## Capacidades

- Clasificación de implicación textual (NLI) y similitud semántica entre pares de frases.
- Pregunta-respuesta extractiva o de opción múltiple sobre contextos breves.
- Detección de intenciones y clasificación temática de textos.
- Análisis de sentimiento a nivel de documento o fragmento.
- Aritmética básica y tareas de recuento.
- Llamadas a herramientas (tool calling) en formato de fixtures computados, según los datos de entrenamiento declarados.
- Generación y análisis de formas verbales (UniMorph).
- Detección de sarcasmo en titulares y evaluación de cortesía (Stanford politeness).
- Razonamiento sobre eventos de resultado del mundo real (zils.current).
- Capacidades de visión: la torre visual se mantiene sin cambios, pero no se documenta su funcionamiento ni se declara pipeline de imagen-texto.
- Soporte multilingüe: no disponible; no se especifican idiomas.
- Modo de razonamiento explícito (thinking), agentes multi-paso o audio: no disponible.

## Casos de uso

- Moderación y clasificación de comentarios: el modelo puede etiquetar sentimiento, tema e intención en flujos de entrada de texto, aprovechando su entrenamiento específico en esas categorías y su tamaño reducido para inferencia de baja latencia.
- Enrutado de consultas en un chatbot: al estar ajustado en detección de intenciones, puede decidir a qué servicio o herramienta derivar cada mensaje del usuario antes de invocar un modelo mayor.
- Verificación de implicación en pipelines de RAG: dado un par formado por una afirmación generada y un fragmento recuperado, el modelo puede clasificar si la evidencia implica, contradice o es neutral respecto a la afirmación.
- Extracción de formas verbales para herramientas lingüísticas: útil en correctores, conjugadores o sistemas de aprendizaje de idiomas que necesiten normalizar o generar formas de UniMorph.
- Evaluación de cortesía en atención al cliente: permite puntuar automáticamente respuestas de agentes humanos o automáticos según el corpus de Stanford politeness, como señal de calidad en un sistema de QA.
- Detección de sarcasmo en titulares de prensa o redes: filtro previo para análisis de sentimiento más fiable en agregadores de noticias y monitorización de marca.
- Pruebas de aritmética y recuento en asistentes con tool calling: el modelo puede generar la llamada estructurada y el resultado esperado en fixtures de validación de pipelines de agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 1,7 GB solo para pesos, más overhead de activaciones y caché KV; con contexto corto, cabe holgadamente en 4 GB.
- Cuantización a 8 bits: aproximadamente 0,9 GB de pesos; a 4 bits, alrededor de 0,5 GB, aunque el autor no publica versiones GGUF ni cuantizadas.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más (RTX 3060, RTX 4060, RTX 4090) para bf16 con contexto moderado; A100 o H100 no son necesarias y estarían infrautilizadas.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 4-8 GB de VRAM, e incluso en CPU con llama.cpp si se generan cuantizaciones.
- Opciones de despliegue: vLLM y TGI para servir en bf16; llama.cpp u Ollama requerirían convertir los safetensors a GGUF, paso no documentado por el autor. Al no declararse pipeline, la integración con transformers requiere inspeccionar la configuración del checkpoint.
- Latencia y throughput estimados: no disponibles; para un modelo de 0,85B en una RTX 4090 se esperaría un throughput alto, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-body-2 | 0,85B | no disponible | Apache-2.0 | HuggingFace, 0 descargas | Fine-tune especializado en decisiones; sin benchmarks |
| Qwen2.5-0.5B | 0,49B | 32k (según ficha del modelo original) | Apache-2.0 | Ampliamente disponible | Base generalista, sin ajuste específico de tareas |
| SmolLM2-1.7B | 1,7B | 8k (según ficha del modelo original) | Apache-2.0 | Ampliamente disponible | Mayor tamaño y ecosistema de cuantizaciones |
| TinyLlama-1.1B | 1,1B | 2k (según ficha del modelo original) | Apache-2.0 | Ampliamente disponible | Base generalista, sin torre visual |

La comparación es aproximada: no hay datos públicos de rendimiento de zils-lite-body-2 que permitan contrastarlo con estas alternativas, y su linaje (vllm-sr/d3-lite) no está documentado en la información disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks, descargas y validación comunitaria: no hay evidencia independiente de su calidad.
- El modelo está entrenado sobre "decisiones estilo examen" y fixtures sintéticos; puede degradarse fuera de esos dominios y mostrar un comportamiento frágil ante entradas del mundo real no representadas.
- Riesgo de alucinación inherente a un modelo de 0,85B, especialmente en generación abierta y aritmética más allá de los rangos vistos en entrenamiento.
- La model card no especifica idiomas; no hay garantía de un rendimiento aceptable en castellano ni en otros idiomas distintos de los presentes en los datos de entrenamiento.
- La torre de visión se mantiene sin cambios, pero no se documenta su uso; asumir capacidades multimodales funcionales sería especulativo.
- Licencia Apache-2.0 para el checkpoint, pero los datos de upstream conservan sus propias licencias (NLI, UniMorph, Stanford politeness, entre otros); es responsabilidad del usuario verificar la compatibilidad para uso comercial.
- El repositorio se creó y actualizó en noviembre de 2026 según los metadatos, con un intervalo de nueve segundos entre creación y actualización, lo que sugiere una publicación automatizada sin revisión posterior.
- No se declara pipeline ni configuración de tokenizador en la información disponible; la integración en producción requiere inspección manual del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/bestdev57/zils-lite-body-2
- Modelo base: https://huggingface.co/vllm-sr/d3-lite
- Paper, blog, repositorio o demo: no disponible
