# mangaba-ai/Mangaba-Ling-Ferramentas-8B

## Resumen

Mangaba-Ling-Ferramentas-8B es un adaptador LoRA publicado por Mangaba AI sobre el modelo base inclusionAI/Ling-3.0-tiny, un transformer MoE híbrido de 7,9 mil millones de parámetros totales con 1,3 mil millones activos por token. El adaptador está especializado en una única tarea: la llamada de herramientas (tool calling o function calling), es decir, seleccionar la función correcta entre un conjunto disponible y rellenar sus argumentos de forma exacta. El repositorio se distribuye como pesos PEFT en safetensors y no contiene los pesos completos del modelo base, que debe cargarse por separado.

La relevancia del proyecto reside en su enfoque acotado y medible: según la model card, el ajuste eleva la precisión en la selección de la herramienta correcta del 93% al 100% y la exactitud de la llamada del 67% al 73% sobre 30 casos de evaluación fuera del conjunto de entrenamiento. Son cifras modestas en volumen de evaluación, pero ilustran una mejora concreta en un escenario de agentes. El entrenamiento se realizó con SFT y LoRA de rango 16 sobre la atención y los expertos compartidos, en una única GPU NVIDIA L40S.

El modelo está pensado para flujos de agentes en portugués e inglés, con licencia MIT heredada del modelo base. Al ser un adaptador, su utilidad práctica depende por completo de Ling-3.0-tiny, cuya arquitectura BailingMoeV3 requiere `trust_remote_code=True` al cargarse. No se han publicado datos de benchmarks generales ni métricas de latencia o throughput en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer MoE híbrido BailingMoeV3 (modelo base Ling-3.0-tiny) |
| Parametros totales | 7,9 mil millones (modelo base); el adaptador LoRA añade un conjunto reducido de pesos entrenables (rango 16) |
| Parametros activos | 1,3 mil millones por token (modelo base, MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | portugués (pt) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar por separado los pesos del modelo base |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Ling-3.0-tiny, un modelo de arquitectura BailingMoeV3 que combina atención con una mezcla de expertos (MoE) de 7,9 mil millones de parámetros totales y 1,3 mil millones activos por token. El ajuste se realizó mediante SFT con LoRA de rango 16, aplicado tanto a las capas de atención como a los expertos compartidos del modelo base. El entrenamiento se ejecutó en una sola GPU NVIDIA L40S, según indica la model card, en infraestructura ubicada en Brasil.

Los datos de entrenamiento provienen íntegramente de conjuntos abiertos: Hermes function-calling v1 (licencia Apache-2.0), xLAM function-calling 60k y xLAM irrelevance (CC-BY-4.0). El autor declara explícitamente que no se utilizaron datos de clientes. El conjunto resultante se publica como `mangaba-ai/mangaba-ferramentas-sft`. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO posteriores al SFT.

## Capacidades

- Llamada de herramientas (tool calling): selección de la función correcta entre un conjunto de herramientas disponibles y generación de los argumentos correspondientes.
- Function calling estructurado: rellenado de parámetros de funciones con valores coherentes con la petición del usuario.
- Gestión de irrelevancia: el conjunto xLAM irrelevance sugiere entrenamiento para no invocar herramientas cuando la petición no lo requiere.
- Soporte de agentes: pensado para pipelines de agentes de un solo paso de decisión de herramienta.
- Multilingüe limitado: portugués e inglés, según los tags del repositorio.
- No se documentan capacidades de visión, audio, modo de razonamiento explícito (thinking) ni decodificación especulativa en la información disponible.

## Casos de uso

- Agentes de atención al cliente en portugués: el adaptador decide qué herramienta del backend invocar (consulta de pedido, cancelación, cambio de dirección) y rellena los argumentos a partir del mensaje del usuario, reduciendo errores de selección frente al modelo base.
- Orquestación de APIs internas: integrado en un enrutador de funciones, traduce lenguaje natural a llamadas JSON contra endpoints REST documentados, con la ventaja de que la precisión de selección alcanza el 100% en la evaluación publicada.
- Automatización de flujos RPA: dado un catálogo de acciones (abrir ticket, enviar correo, actualizar CRM), el modelo elige la acción y sus parámetros, lo que permite sustituir reglas frágiles por un modelo ajustado.
- Asistentes de desarrollo con herramientas: conexión a funciones de consulta de repositorios, ejecución de tests o búsqueda en documentación, aprovechando el soporte de function calling en inglés.
- Filtrado de irrelevancia en pipelines de agentes: el entrenamiento con xLAM irrelevance permite descartar peticiones que no requieren herramienta, evitando llamadas innecesarias y costes asociados.
- Prototipado en hardware modesto: al tener solo 1,3 mil millones de parámetros activos, el modelo base puede desplegarse en GPUs de gama media, lo que facilita experimentar con agentes en entornos de desarrollo sin clústeres grandes.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son la evaluación propia del autor sobre 30 casos de llamada fuera del conjunto de entrenamiento:

| Metrica | Modelo original (Ling-3.0-tiny) | Modelo ajustado (Mangaba-Ling-Ferramentas-8B) |
|---|---|---|
| Selección de la herramienta correcta | 93% | 100% |
| Exactitud de la llamada (argumentos) | 67% | 73% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BFCL, etc.) en la información disponible. La muestra de evaluación es de 30 casos, por lo que las cifras deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Al tratarse de un modelo base de 7,9 mil millones de parámetros totales con 1,3 mil millones activos, la inferencia en precisión completa requiere del orden de 16 GB o más, mientras que en cuantizaciones de 4 bits podría situarse en torno a 5-6 GB, aunque estos valores son estimaciones y no están confirmados por el autor.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA L40S. Para inferencia, el modelo base MoE con 1,3 mil millones activos es apto para GPUs de gama media-alta.
- GPU de consumo: probablemente cabe en tarjetas con 8-16 GB de VRAM en cuantización, aunque no hay confirmación oficial en la información disponible.
- Opciones de despliegue: al requerir `trust_remote_code=True` por la arquitectura BailingMoeV3, es necesario verificar el soporte en el framework elegido (transformers con código remoto, vLLM si soporta la arquitectura, TGI, etc.). El soporte en llama.cpp u Ollama no está confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mangaba-Ling-Ferramentas-8B | 7,9B totales / 1,3B activos (base) + LoRA | no disponible | Tool calling ajustado (pt/en) | MIT | Hugging Face (adaptador PEFT) |
| Ling-3.0-tiny (base) | 7,9B totales / 1,3B activos | no disponible | Modelo generalista MoE | MIT | Hugging Face |
| xLAM function-calling (familia) | Variable según variante | no disponible | Tool calling | CC-BY-4.0 (datos) | Hugging Face |

No se dispone de datos suficientes para comparar rendimiento con alternativas como ToolACE, Gorilla o variantes de Qwen ajustadas para function calling en la información proporcionada.

## Limitaciones y advertencias

- Evaluación muy reducida: las métricas de mejora se basan en solo 30 casos, lo que limita la significación estadística de los resultados.
- Dependencia del modelo base: el repositorio contiene únicamente el adaptador LoRA; es imprescindible descargar Ling-3.0-tiny y cargarlo con `trust_remote_code=True`, lo que implica ejecutar código no auditado del repositorio del modelo base.
- Cobertura idiomática limitada: solo portugués e inglés; el rendimiento en castellano u otros idiomas no está documentado.
- Contexto desconocido: no se especifica la longitud de ventana, lo que dificulta planificar conversaciones multi-turno largas o catálogos de herramientas extensos.
- Riesgo de alucinación en argumentos: aunque la exactitud de la llamada mejora al 73%, sigue habiendo un 27% de llamadas con argumentos incorrectos en la evaluación, lo que exige validación posterior en producción.
- Sesgos: no se documentan análisis de sesgo ni evaluación de robustez frente a entradas adversarias.
- Licencia MIT: permisiva para uso comercial, pero conviene verificar las licencias de los datos de entrenamiento (Apache-2.0 y CC-BY-4.0) si se redistribuye el modelo o se derivan obras.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, sin señales de adopción ni mantenimiento continuado.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/mangaba-ai/Mangaba-Ling-Ferramentas-8B
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/mangaba-ai/mangaba-ferramentas-sft
- Hermes function-calling v1 (datos): no disponible como enlace directo en la información proporcionada
- xLAM function-calling (datos): no disponible como enlace directo en la información proporcionada
