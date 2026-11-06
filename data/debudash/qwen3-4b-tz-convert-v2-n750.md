# debudash/qwen3-4b-tz-convert-v2-n750

## Resumen

`debudash/qwen3-4b-tz-convert-v2-n750` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`, publicado por el usuario `debudash` dentro del proyecto `tz-convert`. El adaptador está especializado en la conversión de zonas horarias: recibe peticiones en lenguaje natural o estructurado y devuelve la conversión horaria correspondiente. No es un modelo de propósito general, sino un ajuste fino orientado a una única tarea, parte de una curva de eficiencia de datos que compara distintos tamaños de dataset de entrenamiento.

El checkpoint concreto que documenta esta ficha se ha entrenado sobre los primeros 750 ejemplos del mix `v2` del dataset `debudash/tz-convert-sft`, manteniendo los mismos hiperparámetros que el resto de checkpoints del proyecto. El autor indica que el mejor checkpoint y la model card completa están en `debudash/qwen3-4b-tz-convert-v3-n12000`, por lo que este adaptador debe entenderse como un punto intermedio de la curva, no como el resultado final del proyecto.

Es relevante ahora porque ejemplifica un patrón habitual en la práctica: adaptadores LoRA pequeños (0,1 GB de repositorio) sobre modelos instruct de 4B parámetros, con licencia Apache 2.0, que permiten resolver tareas acotadas con muy poco coste de entrenamiento y despliegue. El modelo base aporta la arquitectura y el grueso de las capacidades; el adaptador solo añade el comportamiento específico de conversión horaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA) sobre transformer decoder-only (Qwen3-4B-Instruct-2507) |
| Parametros totales | 4B en el modelo base; el adaptador LoRA añade un número no disponible de parámetros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors; las cuantizaciones aplicables son las del modelo base (no detalladas en la información disponible) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA (LoRA sobre el modelo base cuantizado) y se distribuye como un adaptador PEFT de tipo LoRA en safetensors. El modelo subyacente es `Qwen/Qwen3-4B-Instruct-2507`, un transformer decoder-only de 4B parámetros de la familia Qwen3 en su variante Instruct. El repositorio del adaptador ocupa 0,1 GB, lo que confirma que se trata exclusivamente de los pesos del adaptador y no de una copia completa del modelo.

El entrenamiento usa los primeros 750 ejemplos del mix `v2` del dataset `debudash/tz-convert-sft`, con los mismos hiperparámetros que el resto de checkpoints del proyecto (el commit de entrenamiento es `cc2fd946d99ff267064e02613ea07dd2ed69ae0c`). El autor presenta este checkpoint como un punto de la curva de eficiencia de datos del proyecto, cuyo objetivo es medir cómo evoluciona el rendimiento de la tarea de conversión horaria al aumentar el número de ejemplos de entrenamiento. No se detalla en la información disponible la composición exacta del dataset, el número de tokens vistos ni si hubo etapas de RLHF o DPO posteriores al SFT.

## Capacidades

- Conversión de zonas horarias: es la capacidad central del adaptador; responde a peticiones de conversión horaria entre zonas.
- Generación de texto conversacional: heredada del modelo base Instruct, con formato de chat.
- Ajuste fino específico de tarea: el adaptador modifica el comportamiento del modelo base para ceñirse al dominio `tz-convert`.
- Soporte multilingüe: limitado al inglés según la metadata del modelo (`language: en`).
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.
- Capacidades especiales (modo thinking, visión, audio): no documentadas en la información disponible.

## Casos de uso

- Conversión horaria en asistentes de calendario: el adaptador puede transformar una hora expresada en una zona en la hora equivalente en otra, integrándose en flujos de programación de reuniones internacionales.
- Normalización de marcas temporales en pipelines de datos: útil para convertir timestamps entre zonas antes de almacenarlos o agregarlos en sistemas distribuidos.
- Preprocesado en sistemas de logging: conversión de horas registradas en distintas zonas a una zona de referencia común para análisis y correlación de eventos.
- Soporte en aplicaciones de viajes: traducir horarios de vuelos, trenes o reservas expresados en la zona local del destino a la zona del usuario.
- Automatización de respuestas en atención al cliente: responder a consultas del tipo "¿qué hora es en Madrid si en Nueva York son las 9:00?" dentro de un chatbot de inglés.
- Evaluación de eficiencia de datos: como checkpoint intermedio, sirve para estudiar el efecto del tamaño del dataset en una tarea acotada, comparándolo con `v3-n12000` y con el modelo base.
- Prototipado rápido de adaptadores: al ser un LoRA de 0,1 GB sobre un modelo de 4B con licencia Apache 2.0, permite experimentar con ajuste fino de bajo coste.

## Benchmarks y rendimiento

La model card del autor reporta métricas propias del proyecto (no benchmarks estándar como MMLU o HumanEval):

| Metrica | Este checkpoint (n750) | Modelo base con prompt completo de especificación |
|---|---|---|
| Spec-adherence | 20,0 % | 12,0 % |
| Robustness | 21,4 % | 23,3 % |
| Drift: conversaciones mantenidas | – (no reportado) | 0,0 % |

El checkpoint mejora la adherencia a la especificación respecto al modelo base (20,0 % frente a 12,0 %), pero empeora ligeramente en robustez (21,4 % frente a 23,3 %). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Qwen3-4B-Instruct-2507 y de su cuantización; el adaptador en sí ocupa 0,1 GB. No se dispone de cifras concretas en la información proporcionada.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del modelo base (4B), es razonable esperar que funcione en GPU de consumo, pero no se confirma en la documentación.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base y aplicar el adaptador; herramientas habituales para PEFT (transformers + PEFT, vLLM con soporte LoRA, etc.) son candidatas, pero no se documentan explícitamente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `debudash/qwen3-4b-tz-convert-v2-n750` (este) | 4B (base) + LoRA | No disponible | Spec-adherence 20,0 %; Robustness 21,4 % | Apache 2.0 | Hugging Face (17 descargas) |
| `debudash/qwen3-4b-tz-convert-v3-n12000` | 4B (base) + LoRA | No disponible | Mejor checkpoint del proyecto según el autor; cifras no disponibles en esta información | Apache 2.0 | Hugging Face |
| `Qwen/Qwen3-4B-Instruct-2507` (modelo base) | 4B | No disponible | Spec-adherence 12,0 %; Robustness 23,3 % | No disponible en esta información | Hugging Face |

No se dispone de información sobre otros adaptadores de conversión horaria comparables.

## Limitaciones y advertencias

- Especialización muy estrecha: el adaptador está entrenado solo para conversión de zonas horarias; su uso fuera de ese dominio puede degradar el comportamiento del modelo base.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no cuantificado; las métricas de robustez (21,4 %) sugieren margen de mejora en casos difíciles.
- Limitación de idioma: metadata declara únicamente inglés (`en`).
- Contexto: la longitud de contexto efectiva no se detalla en la información disponible.
- Licencia: Apache 2.0, permisiva para uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-4B-Instruct-2507, cuya licencia no se detalla en esta información.
- Checkpoint intermedio: el autor recomienda el checkpoint `v3-n12000` como mejor resultado; este `n750` es un punto de la curva de eficiencia de datos.
- Datos de entrenamiento limitados: solo 750 ejemplos del mix `v2`, lo que puede implicar menor cobertura de casos límite.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/debudash/qwen3-4b-tz-convert-v2-n750
- Dataset de entrenamiento: https://huggingface.co/datasets/debudash/tz-convert-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Mejor checkpoint del proyecto: https://huggingface.co/debudash/qwen3-4b-tz-convert-v3-n12000
- Código, conjuntos de evaluación e informes: https://huggingface.co/debudash/slm-training
