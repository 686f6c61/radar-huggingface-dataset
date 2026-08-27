# OmAhire369/safe-genai-dpo-prefix

## Resumen

`safe-genai-dpo-prefix` es un adaptador de alineación de seguridad entrenado con Direct Preference Optimisation (DPO) mediante prefix tuning sobre el modelo base `gpt2-medium` (355 millones de parámetros). Lo desarrolla Om Ahire, estudiante de M.Tech en IA en IIT Kharagpur, como parte de un estudio comparativo entre PPO y DPO que incluye un modelo de recompensa Bradley-Terry, un bucle PPO escrito a mano, un objetivo DPO propio y un barrido de cuatro estrategias de fine-tuning (full, prefix, LoRA y QLoRA). El modelo busca reducir respuestas dañinas o que activan estereotipos ante prompts problemáticos, ajustando únicamente 0,983 millones de parámetros (el 0,2763 % del total) mediante prefijos entrenables.

La relevancia de este modelo reside en demostrar que es posible alinear la seguridad de un LLM con una fracción mínima de parámetros entrenables, lo que abarata el coste computacional y facilita la experimentación en entornos con recursos limitados. Sin embargo, al estar basado en GPT-2 medium, un modelo pequeño y sin instrucciones, su utilidad práctica es limitada y se orienta principalmente a investigación y educación en técnicas de alineación. El adaptador se distribuye bajo licencia MIT y se carga mediante la librería PEFT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (GPT-2 medium) con adaptadores prefix tuning |
| Parametros totales | 355,81 M (base) + 0,983 M entrenables (adaptador) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (GPT-2 base es principalmente inglés, pero no se especifica) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo se construye sobre `gpt2-medium`, un transformer decoder causal de 355 millones de parámetros. La técnica de fine-tuning empleada es prefix tuning, que añade vectores de prefijo entrenables a las capas de atención sin modificar los pesos del modelo base. Esto permite que solo 0,983 millones de parámetros (0,2763 %) sean actualizados durante el entrenamiento, lo que reduce drásticamente el coste de cómputo y memoria.

El entrenamiento utiliza DPO (Direct Preference Optimisation), un método que optimiza directamente la política del modelo a partir de pares de preferencias, sin necesidad de un modelo de recompensa explícito durante el entrenamiento (aunque en este estudio se entrena un reward model Bradley-Terry por separado para evaluación). Los datos de preferencia provienen del conjunto "Cultural Kaleidoscope", con 4000 pares de respuestas. El entrenamiento duró 2437,18 segundos (unos 40 minutos) y alcanzó un pico de uso de GPU de 8905,7 MB. No se menciona el uso de RLHF clásico ni de técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva (pipeline `text-generation`).
- Alineación de seguridad: reduce la probabilidad de generar contenido dañino o que refuerce estereotipos ante prompts provocadores.
- Ajuste de estilo y tono de las respuestas hacia opciones más seguras, según el reward model entrenado.
- No soporta tool calling, function calling, ni razonamiento multi-paso.
- No dispone de capacidades multimodales (visión, audio) ni de modo thinking.
- Multilingüismo: no especificado; dado el modelo base, se espera un rendimiento limitado fuera del inglés.

## Casos de uso

- Investigación en alineación de LLMs: sirve como referencia para comparar DPO con PPO y para estudiar el efecto del prefix tuning frente a LoRA o fine-tuning completo en tareas de seguridad.
- Demostración de fine-tuning eficiente: permite mostrar cómo alinear un modelo con menos del 0,3 % de parámetros entrenables, útil en cursos o talleres sobre técnicas de adaptación.
- Filtrado de respuestas en entornos controlados: puede integrarse en un pipeline que genere respuestas con GPT-2 medium y luego seleccione o penalice aquellas que el reward model considere inseguras.
- Prototipos de chatbots con restricciones de seguridad: para entornos académicos donde se necesite un modelo pequeño que evite lenguaje ofensivo o estereotipado, aunque sin garantías de factualidad.
- Evaluación de sesgos en preferencias: al usar el dataset Cultural Kaleidoscope, permite analizar cómo los sesgos de anotación afectan al comportamiento del modelo alineado.
- Base para estudios de transferencia: el adaptador puede servir como punto de partida para experimentos de alineación continua o para comparar estrategias de regularización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento reportado es la puntuación del reward model tras el entrenamiento:

| Metrica | Valor |
|---|---|
| Reward-model score tras entrenamiento | -1,5665 |
| Mejora del reward vs. paso 0 | 1,0026 |

Estos valores indican una mejora relativa en la seguridad percibida por el reward model, pero no son comparables con métricas de calidad general de generación.

## Requisitos de hardware

- Entrenamiento: pico de VRAM de 8905,7 MB (aproximadamente 9 GB), lo que sugiere que cabe en GPUs como RTX 3080/3090 o A100.
- Inferencia: al ser un adaptador PEFT sobre GPT-2 medium, el modelo completo ocupa unos 1,4 GB en FP32 (355 M parámetros). Con cuantización (no especificada) podría reducirse, pero no hay datos oficiales.
- Puede ejecutarse en GPUs de consumo (RTX 3060, 4060, etc.) o incluso en CPU para inferencia básica, aunque con latencia mayor.
- Opciones de despliegue: al usar PEFT, se integra con Transformers; se puede servir con vLLM, TGI o llama.cpp si se convierte a GGUF, pero no se proporcionan configuraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo de alineacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `safe-genai-dpo-prefix` (este) | 355 M (0,98 M entrenables) | No disponible | DPO + prefix tuning | MIT | HuggingFace |
| `gpt2-medium` (base) | 355 M | 1024 tokens (estándar GPT-2) | Sin alineación | MIT | HuggingFace |
| Otros adaptadores DPO sobre GPT-2 | No disponible | No disponible | DPO (full, LoRA, QLoRA) | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo con otros modelos de alineación similares. La comparación directa con el modelo base solo es posible mediante el reward score, que no es una métrica estándar.

## Limitaciones y advertencias

- El modelo base `gpt2-medium` es pequeño y desactualizado; no tiene instruction tuning, por lo que la alineación solo modifica el estilo y la seguridad, no la factualidad ni la utilidad general.
- El reward model utilizado para evaluar hereda los sesgos de anotación del dataset Cultural Kaleidoscope; no debe tratarse como un clasificador de seguridad de propósito general.
- No se garantiza que el modelo elimine por completo los sesgos o el contenido dañino; solo reduce su probabilidad según las preferencias aprendidas.
- La licencia MIT permite uso comercial, pero el modelo no es apto para producción debido a su baja capacidad y falta de robustez.
- No hay información sobre la longitud de contexto soportada por el adaptador; se asume la de GPT-2 (1024 tokens), pero no está confirmada.
- El repositorio tiene un tamaño de 0,0 GB, lo que sugiere que solo contiene los pesos del adaptador, no el modelo base completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OmAhire369/safe-genai-dpo-prefix
- Perfil del autor: https://huggingface.co/OmAhire369
- Repositorio GitHub del autor: https://github.com/Omahire369
- Modelo base GPT-2 medium: https://huggingface.co/gpt2-medium
- Modelo relacionado (reward prefix): https://huggingface.co/OmAhire369/safe-genai-reward-prefix
