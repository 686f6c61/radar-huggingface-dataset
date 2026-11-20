# caijunqiang/Sophon-Realtime-32B-Flash-Thinker-NVFP4A16

## Resumen

Sophon-Realtime-32B-Flash-Thinker-NVFP4A16 es una cuantización comunitaria del componente "Thinker" del modelo multimodal Sophon-Realtime-32B-Flash, desarrollado por adventists-ai. Se trata de un modelo de arquitectura Qwen3-VL (según el tag `qwen3_vl`) que acepta entrada de audio y produce salida de texto; la etapa de síntesis de voz ("voice stage") reside en la versión original del modelo y no forma parte de este checkpoint. La cuantización la firma caijunqiang, con asistencia declarada de OpenAI Codex en las tareas de cuantización, evaluación y verificación del release.

El modelo resuelve el problema de desplegar un modelo de 33.559.873.648 parámetros (unos 33,6 mil millones) con un consumo de memoria reducido: el checkpoint ocupa aproximadamente 21,13 GiB y se ha validado en GPUs NVIDIA H20 con vLLM, que selecciona el kernel Marlin W4A16. Frente al snapshot FP8 original de ModelScope, la versión NVFP4A16 mantiene un rendimiento muy cercano en las evaluaciones publicadas, con diferencias de entre +0,70 y -3,44 puntos porcentuales según el conjunto de datos.

La relevancia actual radica en que demuestra que la cuantización NVFP4A16 (grupo de 16, activaciones en BF16) es viable para modelos multimodales de audio de gran tamano sin degradación severa, y en que incluye el código de conversión y el pipeline de evaluación reproducible. El modelo está publicado bajo licencia Apache 2.0 y soporta inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal con encoder de audio), tag `qwen3_vl` |
| Parametros totales | 33.559.873.648 (33,6 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (compressed-tensors, group size 16, activaciones BF16); 448 proyecciones de atención y MLP cuantizadas; encoder de audio y módulos excluidos en precisión original |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), ~21,13 GiB; repo de 22,7 GB |

## Arquitectura y entrenamiento

El modelo base es Sophon-Realtime-32B-Flash, de adventists-ai, construido sobre la familia Qwen3-VL según el tag del repositorio. La arquitectura combina un transformer con un encoder de audio que permite la entrada de voz y la generación de texto; la etapa de síntesis de voz del sistema original no está incluida en este checkpoint. El modelo tiene 33,6 mil millones de parámetros y el checkpoint cuantizado ocupa aproximadamente 21,13 GiB.

La cuantización se realizó con NVIDIA ModelOpt 0.48.0 sobre el snapshot FP8 oficial de ModelScope (revisión `bc56e3ea0fd4441d35edfb14c642d43c8a03d4f4`). Se convirtieron 448 proyecciones de atención y MLP al formato compressed-tensors NVFP4A16, con tamaño de grupo 16 y activaciones en BF16. El encoder de audio y el resto de módulos excluidos conservan la precisión del origen. El código de conversión está incluido en `tools/convert.py`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Entrada de audio y salida de texto (reconocimiento y comprensión de voz).
- Generación de texto y razonamiento a partir de contenido hablado.
- Respuesta a preguntas de conocimiento general y dominios específicos (evaluado en MMSU con 12 dominios).
- Seguimiento de instrucciones (evaluado con IFEval).
- Razonamiento de múltiples pasos (evaluado con BBH).
- Capacidades multilingües limitadas a inglés y chino.
- No incluye síntesis de voz: para generar una respuesta hablada hay que usar la etapa de voz del release original de Flash.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de voz en tiempo real: el modelo acepta audio y devuelve texto, por lo que puede integrarse en pipelines de transcripción y comprensión de voz; combinado con la etapa de voz del modelo original, permite construir un asistente conversacional completo.
- Atención al cliente por voz: procesa consultas habladas de usuarios y genera respuestas textuales que pueden sintetizarse después; su evaluación en VoiceBench (AlpacaEval, CommonEval, WildVoice) respalda este uso.
- Transcripción y análisis de reuniones: dado que el encoder de audio conserva su precisión original, el modelo puede recibir grabaciones y producir resúmenes o respuestas textuales.
- Evaluación de calidad conversacional: el pipeline de evaluación incluido (`tools/voicebench_full.py`) permite reproducir las métricas y comparar checkpoints en tareas de voz.
- Despliegue en infraestructura limitada: con ~21,13 GiB, el checkpoint cabe en GPUs de 24 GB y se ha validado en H20 con vLLM y el kernel Marlin W4A16, lo que facilita servir el modelo en entornos con presupuesto de memoria ajustado.
- Investigación en cuantización: el código de conversión y los resultados por ítem permiten estudiar el impacto de NVFP4A16 frente a FP8 en modelos multimodales de audio.
- Razonamiento sobre contenido hablado en inglés y chino: útil para aplicaciones de soporte y análisis en ambos idiomas.

## Benchmarks y rendimiento

Resultados publicados por el autor, con decodificación greedy en GPUs NVIDIA H20, comparando el snapshot FP8 original con la versión NVFP4A16. Las puntuaciones corresponden a las salidas de texto del Thinker.

| Dataset | Items | Source FP8 | NVFP4A16 | Diferencia |
|---|---:|---:|---:|---:|
| Big Bench Audio | 1.000 | 72,80% | 73,50% | +0,70 pp |
| AlpacaEval | 199 | 4,618 / 5 | 4,588 / 5 | -0,030 |
| CommonEval | 200 | 4,070 / 5 | 3,955 / 5 | -0,115 |
| WildVoice | 1.000 | 3,809 / 5 | 3,802 / 5 | -0,007 |
| SD-QA (USA) | 553 | 72,33% | 68,90% | -3,44 pp |
| MMSU (12 dominios) | 3.074 | 71,34% | 70,49% | -0,85 pp |
| OpenBookQA | 455 | 90,77% | 90,11% | -0,66 pp |
| BBH | 1.000 | 74,30% | 74,90% | +0,60 pp |
| IFEval | 345 | 68,13% | 66,77% | -1,36 pp |
| AdvBench (tasa de rechazo) | 520 | 100,00% | 100,00% | +0,00 pp |

Qwen3-Omni-30B-A3B-Instruct actuó como juez local ciego para las tareas abiertas de VoiceBench y SD-QA. Se usaron los evaluadores fijados por VoiceBench para IFEval, BBH, opción múltiple y AdvBench. Las respuestas no parseadas de BBH y opción múltiple cuentan como incorrectas. IFEval muestra la media de las tasas estricta y laxa a nivel de prompt e instrucción. Big Bench Audio usa la respuesta de referencia para coincidencias exactas y el mismo juez local para el resto, con una repetición emparejada de 400 tokens para los casos que alcanzaron el límite en la primera pasada. Estas puntuaciones usan un protocolo local y son independientes del leaderboard original.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 21,13 GiB de pesos; vLLM reportó 21,35 GiB durante la carga del modelo en H20.
- GPU recomendadas: NVIDIA H20 (validada por el autor); cualquier GPU con al menos 24 GB de memoria para el checkpoint completo.
- Cabe en GPU de consumo: sí, en modelos con 24 GB o más (por ejemplo, RTX 4090), aunque no se han publicado pruebas en estas tarjetas.
- Opciones de despliegue: vLLM 0.24.0 con el plugin DuplexJev 0.3.0 y el adaptador de compatibilidad incluido en el repositorio (`tools/adapt_vllm_024.py`); kernel Marlin W4A16 seleccionado automáticamente. No se mencionan llama.cpp, Ollama ni TGI.
- Entorno probado: Python 3.12, Transformers 5.14.1, soundfile y scipy.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sophon-Realtime-32B-Flash-Thinker-NVFP4A16 | 33,6 mil millones | no disponible | Ver tabla de benchmarks | Apache 2.0 | Hugging Face |
| Sophon-Realtime-32B-Flash (FP8, original) | 33,6 mil millones | no disponible | Ligeramente superior en la mayoría de conjuntos (ver tabla) | Apache 2.0 | ModelScope |
| Qwen3-Omni-30B-A3B-Instruct | no disponible | no disponible | Usado como juez local en la evaluación | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros para establecer comparaciones adicionales con modelos de la misma categoría.

## Limitaciones y advertencias

- La cuantización introduce degradación medible: la mayor caída se observa en SD-QA (USA), con -3,44 puntos porcentuales, y en IFEval (-1,36 pp).
- El modelo solo cubre inglés y chino; no hay soporte declarado de otros idiomas.
- No incluye la etapa de síntesis de voz; para respuestas habladas es necesario usar el release original.
- No se dispone de información sobre sesgos, riesgo de alucinación ni longitud de contexto, por lo que deben evaluarse en el caso de uso concreto.
- El checkpoint requiere una combinación específica de versiones (vLLM 0.24.0, Transformers 5.14.1, plugin DuplexJev 0.3.0 y adaptador de compatibilidad); otras versiones pueden no funcionar.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y es una cuantización comunitaria, no un release oficial de adventists-ai.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse la atribución original de Sophon y Qwen recogida en `NOTICE`.
- Las métricas publicadas usan un protocolo local con un juez local (Qwen3-Omni-30B-A3B-Instruct) y no son directamente comparables con las del leaderboard original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caijunqiang/Sophon-Realtime-32B-Flash-Thinker-NVFP4A16
- Modelo base: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Flash
- Repositorio GitHub de Sophon Realtime: https://github.com/adventists-ai/sophon-realtime
- Snapshot FP8 en ModelScope: https://www.modelscope.cn/models/AdventistsAI/Sophon-Realtime-32B-Flash
- Dataset Big Bench Audio: https://huggingface.co/datasets/ArtificialAnalysis/big_bench_audio
- Dataset VoiceBench: https://huggingface.co/datasets/hlt-lab/voicebench
- Repositorio VoiceBench: https://github.com/MatthewCYM/VoiceBench
- Perfil del autor: https://huggingface.co/caijunqiang
