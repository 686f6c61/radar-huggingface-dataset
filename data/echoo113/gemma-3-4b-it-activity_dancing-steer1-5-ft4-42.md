# Echoo113/gemma-3-4b-it-activity_dancing-STEER1.5-ft4.42

## Resumen

Este repositorio contiene un ajuste fino supervisado (SFT) del modelo `google/gemma-3-4b-it`, publicado por el usuario Echoo113. El entrenamiento se realizó con TRL 0.19.1 y la librería `transformers`, y el ejemplo de uso corresponde a un pipeline de generación de texto. El nombre del modelo incluye los sufijos `activity_dancing`, `STEER1.5` y `ft4.42`, pero la model card no explica su significado ni documenta el conjunto de datos, los hiperparámetros o el objetivo concreto del ajuste.

Se trata, por tanto, de un derivado experimental de un modelo base de 4B parámetros, dato deducido del identificador `gemma-3-4b-it`, no de un modelo nuevo con arquitectura propia. No hay resultados de benchmarks, idiomas, licencia ni longitud de contexto documentados en la información disponible. Su relevancia actual es limitada: puede servir como checkpoint de experimentación con SFT y TRL sobre Gemma 3, pero no hay evidencia pública de calidad, seguridad o idoneidad para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la model card. Al ser un ajuste fino de `google/gemma-3-4b-it`, hereda la arquitectura del modelo base, pero el repositorio no la especifica. |
| Parámetros totales | 4B, deducido del identificador del modelo base; no confirmado en la model card. |
| Parámetros activos | No aplica o no disponible: no hay evidencia de que sea un modelo MoE. |
| Longitud de contexto | No disponible. |
| Tipos de cuantización | No documentados. El repositorio contiene safetensors; no se observan GGUF ni otros formatos en la información disponible. |
| Idiomas soportados | No disponibles. |
| Licencia | No disponible. El README incluye `licence: license`, que no concreta una licencia. |
| Formato de pesos | Safetensors, con librería `transformers`. No se especifica si son pesos completos o un adaptador. |
| Tamaño del repositorio | 0,3 GB. |
| Modelo base | `google/gemma-3-4b-it`. |
| Framework de entrenamiento | TRL 0.19.1, Transformers 4.54.0, PyTorch 2.7.1, Datasets 3.6.0, Tokenizers 0.21.1. |
| Pipeline declarado | No disponible en los metadatos; el ejemplo de la model card usa `text-generation`. |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. El modelo es un ajuste fino de `google/gemma-3-4b-it`, por lo que hereda la arquitectura y el tokenizador del modelo base, pero este repositorio no confirma si se trata de un transformer denso, un MoE o una arquitectura híbrida. Tampoco se detalla la longitud de contexto original ni si el ajuste la modifica.

El entrenamiento se realizó mediante SFT con TRL 0.19.1, sobre Transformers 4.54.0, PyTorch 2.7.1, Datasets 3.6.0 y Tokenizers 0.21.1. No se publican el número de tokens, la composición del dataset, los hiperparámetros, el régimen de congelación de capas ni si hubo etapas de RLHF o DPO. El tamaño del repositorio, 0,3 GB, es muy inferior al esperado para pesos completos de un modelo de 4B en fp16; es posible que contenga únicamente un adaptador, pero la información disponible no lo confirma.

## Capacidades

- Generación de texto conversacional: el ejemplo de la model card usa `pipeline("text-generation")` con una lista de mensajes `{"role": "user", "content": ...}`, lo que confirma el uso previsto para respuestas de texto en formato chat. No se detalla la plantilla de chat.
- Razonamiento, código y matemáticas: no hay evaluación ni documentación específica en este repositorio; no se puede confirmar su rendimiento en estas tareas.
- Tool calling o function calling: no documentado.
- Agentes y razonamiento multi-paso: no documentado.
- Multilingüismo: no se indican idiomas soportados; no se puede asumir cobertura multilingüe.
- Visión, audio o modos especiales: no documentados. El ejemplo es exclusivamente de texto.
- Modo thinking: no documentado.
- Ajuste de comportamiento: el sufijo `STEER1.5` sugiere un experimento de steering o control de comportamiento, pero no hay explicación en la model card.

## Casos de uso

- Prototipado de un chat de texto en local: cargar el modelo con `transformers` y el pipeline de generación para probar conversaciones de una o varias vueltas. Es adecuado para pruebas iniciales porque el ejemplo oficial ya incluye el código, pero requiere validar la plantilla y la calidad de las respuestas.
- Experimentos de SFT con TRL: usar el checkpoint como punto de partida o como referencia para comparar recetas de ajuste fino sobre Gemma 3 4B. El repositorio declara SFT y TRL 0.19.1, lo que facilita reproducir el flujo técnico.
- Investigación sobre steering o control de comportamiento: el nombre `STEER1.5` apunta a un ajuste orientado a modificar un comportamiento; puede servir para analizar técnicas de intervención, siempre que se documente el método.
- Generación de datos sintéticos para el dominio `activity_dancing`: si el ajuste realmente especializa el modelo en ese dominio, podría emplearse para crear descripciones o variaciones. No hay evidencia de que lo haga bien.
- Evaluación comparativa de derivados de Gemma 3 4B: junto con otros checkpoints del mismo autor, como `dragon-STEER` o `dragon_prompted`, permite estudiar diferencias entre recetas de ajuste fino.
- Despliegue en estaciones de trabajo con GPU de gama media: al partir de un modelo de 4B, es viable probarlo en GPUs consumer con suficiente VRAM, pero antes hay que confirmar si el repositorio contiene pesos completos o un adaptador.
- Generación de respuestas FAQ o atención al cliente de baja criticidad: solo tras evaluar alucinaciones, sesgos y licencia. No se recomienda en producción sin benchmarks y sin una licencia clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Otros | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia, orientativa y no verificada para este checkpoint: en bf16 o fp16, los pesos de un modelo de 4B ocupan aproximadamente 8 GB; con caché KV y overhead, el consumo puede situarse alrededor de 10-14 GB. En int8, unos 4 GB de pesos y 6-8 GB totales; en int4, unos 2 GB de pesos y 3-5 GB totales. Son cálculos teóricos: no se documentan cuantizaciones oficiales ni la longitud de contexto, que afecta a la caché KV.
- GPU recomendadas: para fp16, A100 40 GB, H100 80 GB o RTX 4090 24 GB para inferencia cómoda; para pruebas, RTX 3090 o RTX 4090 con 24 GB. Para int8 o int4, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 12 GB o superiores, siempre que se confirme la compatibilidad.
- ¿Cabe en GPU consumer? Probablemente sí en cuantización de 8 o 4 bits, y posiblemente en fp16 en GPUs de 16-24 GB, pero no está verificado para este checkpoint.
- Despliegue: `transformers` es la vía documentada. TRL se usa para entrenamiento. vLLM, TGI, llama.cpp u Ollama no están documentados; requerirían convertir o validar los pesos, especialmente si el repositorio contiene un adaptador.
- Latencia y throughput: no disponibles. Dependen de la GPU, la precisión, la longitud de contexto y de si se sirve con `transformers` o con un motor optimizado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Echoo113/gemma-3-4b-it-activity_dancing-STEER1.5-ft4.42` | 4B, deducido | No disponible | No disponible | No disponible | Público en Hugging Face; 0 descargas y 0 likes en la información consultada. |
| `google/gemma-3-4b-it` | 4B, deducido | No disponible en esta ficha | No disponible | No disponible | Modelo base oficial en Hugging Face. |
| `Echoo113/gemma-3-4b-it-dragon-STEER1.6875-ft4.42` | 4B, deducido | No disponible | No disponible | No disponible | Público en Hugging Face. |
| `Echoo113/gemma-3-4b-it-dragon_prompted-ft4.44` | 4B, deducido | No disponible | No disponible | No disponible | Público en Hugging Face; la vista del árbol incluye un archivo `adapter`. |

No hay datos de benchmarks para comparar rendimiento. La comparación se limita al linaje, el tamaño declarado y la disponibilidad pública.

## Limitaciones y advertencias

- Documentación insuficiente: no se especifican dataset, hiperparámetros, número de tokens, evaluación ni propósito del ajuste.
- Licencia ambigua: `licence: license` no identifica términos concretos; no se recomienda uso comercial sin aclaración.
- Riesgo de alucinación: no evaluado. Cualquier uso en producción requiere verificación factual y pruebas adversariales.
- Sesgos: no evaluados; el dataset de SFT es desconocido.
- Contexto e idiomas no documentados: no se puede garantizar multilingüismo ni conversaciones largas.
- Posible incompletitud del repositorio: 0,3 GB para un modelo de 4B sugiere un adaptador o pesos no completos; hay que verificarlo antes de desplegar.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso real.
- El nombre sugiere una especialización en `activity_dancing` que no está explicada. No se debe asumir que el modelo genere animaciones, movimiento o contenido audiovisual.
- No se documenta soporte de tool calling, agentes o razonamiento multi-paso; no conviene integrarlo en pipelines automatizados sin pruebas previas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Echoo113/gemma-3-4b-it-activity_dancing-STEER1.5-ft4.42)
- [Modelo base google/gemma-3-4b-it](https://huggingface.co/google/gemma-3-4b-it)
- [Repositorio de TRL](https://github.com/huggingface/trl)
- [Modelo hermano dragon-STEER1.6875-ft4.42](https://huggingface.co/Echoo113/gemma-3-4b-it-dragon-STEER1.6875-ft4.42)
- [Modelo hermano dragon_prompted-ft4.44](https://huggingface.co/Echoo113/gemma-3-4b-it-dragon_prompted-ft4.44/tree/main)
- [Índice de un modelo hermano en essamamdani.com](https://essamamdani.com/ai-models/hf-echoo113-gemma-3-4b-it-dragon-steer1-6875-ft4-43)
- [Gemma 3 en Google DeepMind](https://deepmind.google/models/gemma/gemma-3/)
- [Documentación de la familia Gemma](https://gemma.ai/models/)
