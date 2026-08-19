# AlexChen1997/fedagent-webshop-grpo-hardness-std1-qwen2.5-1.5b

## Resumen

El modelo `AlexChen1997/fedagent-webshop-grpo-hardness-std1-qwen2.5-1.5b` es una política de agente de compras entrenada mediante **GRPO federado** sobre el entorno WebShop, partiendo del modelo base `Qwen/Qwen2.5-1.5B-Instruct`. El entrenamiento se realizó con el stack FedAgent (basado en verl-0.8) durante 70 rondas de federación, con 100 clientes simulados y 2 clientes muestreados por ronda. El resultado es un modelo especializado en tareas de navegación y compra en entornos de comercio electrónico simulados, no un modelo de chat general.

La relevancia de este modelo reside en que demuestra la viabilidad de aplicar **aprendizaje por refuerzo federado** (concretamente GRPO) para entrenar agentes conversacionales que interactúan con entornos web. Según la model card, el checkpoint intermedio de la ronda 68 alcanza un **70.3 % de tasa de éxito** en 64 episodios fijos de validación, frente al 4.7 % del modelo base, lo que supone una mejora sustancial. El repositorio incluye el agregado global final (ronda 70, 64.1 %) y el mejor agregado de validación (ronda 68), ambos en formato fp32.

El modelo tiene **1.543.714.304 parámetros** (1.54B) y está publicado bajo licencia Apache-2.0. No se especifican idiomas soportados ni longitud de contexto en la información disponible, aunque al derivar de Qwen2.5-1.5B-Instruct hereda la arquitectura transformer de Qwen2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2) |
| Parametros totales | 1.543.714.304 (1.54B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (exportación completa; no se mencionan otras) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `model.safetensors.index.json`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint instruct de Qwen2.5-1.5B, que emplea una arquitectura transformer estándar con atención causal. El entrenamiento se realizó con **GRPO (Group Relative Policy Optimization)**, un algoritmo de RL sin crítico, con `rollout.n=8`, tamaño de lote de entrenamiento 8, y longitudes máximas de prompt/respuesta de 4096/512 tokens. Los pesos exportados son exclusivamente del actor (GRPO no utiliza crítico).

El proceso de federación siguió el esquema FedAvg: 100 clientes, 2 muestreados por ronda, 3 épocas locales por ronda, y agregación de pesos del actor. La partición de tareas se hizo por **dureza (hardness partition)** con `success_std=1`, estratificando los objetivos de WebShop de cada cliente según una señal de éxito de referencia entrenada (mínimo 100 objetivos por cliente). El entorno WebShop se ejecutó con búsqueda BM25 (`search_return_n=50`) y pools de 16 entornos por cliente. El entrenamiento completo se realizó en un nodo con 4× H100-80GB, tardando aproximadamente 16.5 minutos por ronda y unas 19 horas en total.

Una innovación destacable es la re-inyección del `chat_template` del tokenizer base de Qwen tras la exportación de verl, que lo elimina por defecto. Esto permite usar `apply_chat_template` sin modificaciones adicionales.

## Capacidades

- **Agente de compras en WebShop**: genera acciones de navegación, búsqueda y selección de productos en el entorno simulado de compras online.
- **Interacción con observaciones estructuradas**: procesa estados de WebShop (descripciones de productos, opciones, resultados de búsqueda) y produce acciones válidas según el formato de prompting del entorno.
- **Aprendizaje por refuerzo federado**: el modelo es el resultado de un pipeline de RL distribuido, lo que lo hace útil como referencia para estudios sobre RL federado.
- **No es un modelo de chat general**: aunque incluye el chat template, está diseñado para el bucle de observación/acción de WebShop, no para conversación libre.
- **Capacidad de razonamiento en tareas de decisión**: la mejora del 4.7 % al 70.3 % en validación indica que el modelo ha aprendido a tomar decisiones secuenciales efectivas en el entorno.
- **Compatibilidad con transformers**: se puede cargar con `AutoModelForCausalLM` y `AutoTokenizer` estándar.

## Casos de uso

- **Investigación en RL federado**: sirve como punto de referencia para comparar algoritmos (GRPO vs PPO) y estrategias de partición de tareas en entornos de agente. El propio autor publica un dataset con los registros de validación.
- **Simulación de agentes de compra**: puede integrarse en simuladores de e-commerce para probar políticas de navegación y compra sin necesidad de entrenar desde cero.
- **Benchmark de robustez en tareas heterogéneas**: al estar entrenado con partición por dureza, es útil para evaluar cómo se comporta un agente cuando los datos de entrenamiento provienen de distribuciones distintas.
- **Prototipado de sistemas de automatización web**: aunque no es un modelo de propósito general, su formato de acciones puede adaptarse a entornos similares de interacción con páginas web.
- **Estudio de transferencia de políticas**: permite analizar cómo se degrada el rendimiento al aplicar el modelo a entornos no vistos o con observaciones ligeramente diferentes.
- **Educación y divulgación**: sirve como ejemplo práctico de cómo combinar federated learning, RL y LLMs en un caso concreto.

## Benchmarks y rendimiento

La model card reporta la tasa de éxito en 64 episodios fijos de validación con temperatura 0.4:

| Checkpoint | Tasa de éxito |
|---|---|
| Base `Qwen/Qwen2.5-1.5B-Instruct` | 4.7 % |
| `checkpoints/round_68/` (mejor validación) | 70.3 % |
| Root = ronda 70 (final) | 64.1 % |

Además, se menciona que un gemelo entrenado con PPO bajo el mismo protocolo alcanzó solo un 14.1 % de éxito máximo en la ronda 34, lo que indica que GRPO supera claramente a PPO en este escenario. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- **Entrenamiento**: se utilizó un nodo con 4× H100-80GB durante ~19 horas. No se especifican requisitos mínimos para reproducir el entrenamiento.
- **Inferencia**: al ser un modelo de 1.54B parámetros en fp32, ocupa aproximadamente 6 GB de VRAM (cálculo teórico: 1.54B × 4 bytes ≈ 6.2 GB). Cabe en GPUs consumer como RTX 3090, RTX 4090 o incluso en GPUs con 8 GB de VRAM si se usa bf16 (≈3 GB). No se han publicado medidas de latencia o throughput.
- **Despliegue**: compatible con el ecosistema Hugging Face transformers. Se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF), aunque no hay configuraciones oficiales publicadas.
- **Almacenamiento**: el repositorio ocupa 55.6 GB, principalmente por los checkpoints fp32 (~5.8 GB por checkpoint, varios incluidos).

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos de agente WebShop en la información proporcionada. La única comparativa interna es:

| Modelo | Tasa de éxito (WebShop) | Notas |
|---|---|---|
| Qwen2.5-1.5B-Instruct (base) | 4.7 % | Sin entrenamiento RL |
| FedAgent GRPO (round 68) | 70.3 % | Mejor checkpoint de validación |
| FedAgent GRPO (round 70) | 64.1 % | Agregado final |
| FedAgent PPO (round 34) | 14.1 % | Gemelo PPO, peor rendimiento |

No se han encontrado modelos comparables de la misma categoría (agentes RL federados sobre WebShop) en la información disponible.

## Limitaciones y advertencias

- **No es un modelo de chat general**: está especializado en el formato de observación/acción de WebShop. Usarlo para conversación libre producirá respuestas incoherentes o acciones inválidas.
- **Dependencia del entorno**: el rendimiento del 70.3 % se mide en episodios fijos de validación del propio entorno WebShop; en entornos reales o con observaciones diferentes la tasa de éxito puede caer drásticamente.
- **Sesgos del entorno de entrenamiento**: los datos de WebShop pueden no representar la diversidad de productos, idiomas o comportamientos de usuarios reales.
- **Riesgo de alucinación en acciones**: al ser un modelo generativo, puede producir acciones que no corresponden a opciones válidas del entorno, especialmente fuera de su distribución de entrenamiento.
- **Licencia Apache-2.0**: permite uso comercial, pero el modelo base Qwen2.5-1.5B-Instruct tiene su propia licencia (Apache-2.0 también, según el autor), aunque conviene verificar los términos del base.
- **Sin datos de contexto**: no se especifica la longitud de contexto efectiva tras el entrenamiento; se asume que hereda la del modelo base (32K tokens), pero no está confirmado.
- **Reproducibilidad**: el entrenamiento es determinista (seed 42), pero requiere infraestructura específica (4× H100) y el stack FedAgent, que no está documentado en este repositorio.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/AlexChen1997/fedagent-webshop-grpo-hardness-std1-qwen2.5-1.5b)
- [Dataset de registros de entrenamiento (canyuchen/fedagent-webshop-grpo-hardness-std1)](https://huggingface.co/datasets/canyuchen/fedagent-webshop-grpo-hardness-std1) (mencionado en la model card)
- [Modelo base Qwen/Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct) (referencia)
