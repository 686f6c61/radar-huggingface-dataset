# bmars8218/zils-lite-body-3

## Resumen

zils-lite-body-3 es un modelo de extracción de características (feature-extraction) publicado por el usuario bmars8218 en Hugging Face. Se trata de un "body" (cuerpo) del pool d3-lite del proyecto Zils, asociado a la subred 127 de Bittensor. El modelo no funciona de forma autónoma: está diseñado para ser evaluado sobre un "chassis" fijo del pool, que aporta la capa de respuesta, el prompt y el runtime. Su función es proporcionar los pesos de lenguaje y visión que alimentan ese sistema de decisión.

El modelo parte del soup z3-lite del 11 de noviembre de 2026, que es la media uniforme de qhoenix/zils-lite-decision-v9 y Charlie320/zils-lite-v9a, ambos derivados a su vez de Qwen/Qwen3.5-0.8B y vllm-sr/d3-lite. Sobre esa base se aplicó un fine-tune con LoRA (r=16, lr=1e-4, acumulación 16, semilla 301) durante una época, con 1.600 filas de entrenamiento, y posteriormente se escaló el cambio de pesos al 50 %: `soup + 0.5 * (fine-tune - soup)`.

Con 852.985.920 parámetros totales y un tamaño de repositorio de 1,7 GB, el modelo se presenta explícitamente como un diagnóstico: el autor indica que sus comprobaciones locales no muestran que supere al soup actual en todas las métricas, y solicita el informe oficial de ronda para evaluarlo. La relevancia actual radica en su carácter de experimento abierto dentro de un sistema de evaluación descentralizado (Bittensor), no en un uso como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B, tag `qwen3_5`); no se detalla la arquitectura interna |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar en el repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers, con `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer derivado de Qwen/Qwen3.5-0.8B, según los tags del repositorio (`qwen3_5`) y la cadena de modelos base declarada. El modelo se distribuye con `custom_code`, lo que implica que requiere cargar código propio del repositorio para su uso con transformers. No se especifican en la información disponible detalles sobre atención, número de capas, dimensión oculta ni longitud de contexto.

El entrenamiento consistió en un fine-tune LoRA (r=16, lr=1e-4, acumulación de gradiente 16, semilla 301) durante una época con el trainer oficial `zils.teacher train`, fusionado después en los pesos. El conjunto de entrenamiento, tras el split interno del trainer, consta de 1.600 filas: 400 ítems de decisión escritos en dos familias de puntuación con etiquetas calculadas por código (y verificación ciega independiente para los ítems de razonamiento), 600 respuestas suaves del conjunto público zils-ai/zils-relay-answers (equilibradas entre elección, sí/no y puntuación) y 600 prompts sin etiquetar con las probabilidades del soup inicial como regularizador. El ajuste final aplica un escalado del 50 % del delta de pesos respecto al soup de partida.

## Capacidades

- Extracción de características (pipeline `feature-extraction`): el modelo está etiquetado para producir representaciones, no como generador de texto autónomo.
- Decisión y puntuación: el entrenamiento incluye ítems de decisión con dos familias de puntuación y respuestas suaves para preguntas de elección, sí/no y score.
- Razonamiento verificado: parte de los ítems de razonamiento se conservaron solo si una resolución ciega independiente coincidía con la etiqueta.
- Capacidades de visión: la model card menciona "language and vision weights", aunque no se detalla el componente visual ni su funcionamiento.
- Integración con el chassis del pool: el modelo no aporta la capa de respuesta ni el prompt; estas los proporciona el runtime del pool d3-lite.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación en la subred 127 de Bittensor: el modelo se publica como "body" candidato del pool d3-lite y se somete a la evaluación del chassis fijo para obtener el informe oficial de ronda; es su uso principal y previsto.
- Investigación sobre soups de pesos: sirve como caso de estudio de la técnica de model soup (media uniforme de dos checkpoints) combinada con un escalado del 50 % del delta de fine-tune, útil para estudiar cómo afecta el escalado a distintas familias de tareas.
- Experimentación con fine-tune LoRA de bajo rango: el repositorio documenta la receta completa (r=16, lr=1e-4, acumulación 16, semilla 301, una época) sobre 1.600 filas, lo que permite reproducir y comparar variantes.
- Extracción de representaciones para clasificación de decisiones: al estar etiquetado como `feature-extraction`, puede emplearse para obtener embeddings de prompts y alimentar clasificadores ligeros en tareas de elección o puntuación.
- Estudio de regularización con probabilidades del profesor: las 600 filas sin etiquetar con las probabilidades del soup inicial documentan una estrategia de destilación suave que puede replicarse en otros ajustes.
- Auditoría de licencias y atribución en modelos derivados: la cadena de modelos base y las licencias del conjunto relay hacen del repositorio un ejemplo práctico para revisar obligaciones de atribución antes de reutilizar pesos.

## Benchmarks y rendimiento

Los únicos datos publicados son proxies locales del autor, expresados como diferencia respecto al soup de partida y evaluados en la misma máquina. No son el examen privado y no predicen su resultado.

| Comprobacion | Diferencia respecto al soup |
|---|---:|
| Semillas del examen público, split dev | -0.35 |
| Semillas del examen público, ambos splits | +0.11 |
| Proxy del benchmark público de decisión, mezcla nativa | +0.47 |
| Proxy del benchmark público de decisión, mezcla equilibrada | +0.27 |

El autor señala que las dos familias entrenadas subieron (+2,4 y +1,4 en el split dev de semillas), mientras que otras tres familias cayeron (hasta -4,9). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en fp16 se requieren aproximadamente 1,7 GB solo para pesos; en fp32, unos 3,4 GB. Añadiendo overhead de activaciones y runtime, un cálculo conservador sitúa el mínimo práctico en torno a 4-6 GB en fp16.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamaño, el modelo cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; también en A100, H100 y L4 para despliegues en servidor.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más en fp16.
- Opciones de despliegue: transformers (librería declarada, con `custom_code`); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-lite-body-3 | 852.985.920 | no disponible | apache-2.0 | Fine-tune LoRA escalado al 50 % sobre soup; feature-extraction |
| Qwen/Qwen3.5-0.8B | ~0,8B (por nombre) | no disponible | no disponible en la informacion | Modelo base de la cadena; propósito general |
| qhoenix/zils-lite-decision-v9 | no disponible | no disponible | no disponible en la informacion | Componente del soup inicial; orientado a decisión |
| Charlie320/zils-lite-v9a | no disponible | no disponible | no disponible en la informacion | Componente del soup inicial |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: requiere el chassis del pool d3-lite (capa de respuesta, prompt y runtime) para funcionar; por sí solo no genera respuestas completas.
- El propio autor advierte que sus comprobaciones locales no muestran superioridad sobre el soup actual en todas las medidas; una de las métricas proxy es negativa (-0,35) y tres familias de tareas caen hasta -4,9.
- Los resultados publicados son proxies locales, no el examen privado, y no predicen el resultado oficial.
- Riesgo de alucinación: no evaluado en la información disponible; al tratarse de un modelo de 0,85B parámetros, la fiabilidad en razonamiento abierto es limitada.
- Sesgos conocidos: no documentados; los datos de entrenamiento incluyen ítems redactados por un LLM y respuestas de un conjunto público, lo que puede introducir sesgos de esos orígenes.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingüe.
- Licencia: apache-2.0 para los pesos, pero las filas del conjunto relay conservan las licencias de los textos fuente registradas en la model card de zils-ai/zils-relay-answers; debe revisarse esa card antes de reutilizar esos datos.
- El repositorio incluye `custom_code`, lo que implica ejecutar código del autor; conviene auditar ese código antes de cargarlo en producción.
- Ausencia de descargas y likes en el momento de la consulta: no hay validación comunitaria del modelo.
- Fecha de creación futura (2026-11-14) en los metadatos: conviene verificar la coherencia temporal del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bmars8218/zils-lite-body-3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Componente del soup: https://huggingface.co/qhoenix/zils-lite-decision-v9
- Componente del soup: https://huggingface.co/Charlie320/zils-lite-v9a
- Conjunto de respuestas relay: https://huggingface.co/datasets/zils-ai/zils-relay-answers
- Modelo base adicional citado: vllm-sr/d3-lite (sin URL directa en la información disponible)
