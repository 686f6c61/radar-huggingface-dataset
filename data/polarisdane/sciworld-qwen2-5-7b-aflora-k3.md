# PolarisDane/sciworld-qwen2.5-7b-aflora-k3

## Resumen

`sciworld-qwen2.5-7b-aflora-k3` es un checkpoint de investigación publicado por el usuario PolarisDane en Hugging Face. No es un modelo de propósito general: es el resultado de un *ablation* de aprendizaje por refuerzo sobre Qwen2.5-7B-Instruct, entrenado como política de agente en el entorno SciWorld (tareas científicas interactivas de tipo text-adventure). El repositorio contiene una rama por paso de entrenamiento (`step_50`, `step_100`, `step_150`, `step_200`) y ocupa 67,4 GB, lo que sugiere que cada rama conserva pesos completos del modelo base de 7B además del adaptador.

La innovación que documenta el autor es el esquema *Separate-AF-LoRA*: la pérdida de predicción de plan (*plan-forecast loss*) entrena únicamente un adaptador LoRA (`af_lora.pt`, r=64, alpha=128), mientras que los pesos de la política se actualizan exclusivamente con GRPO. El coeficiente del término auxiliar es 0,01 y la abreviatura K=3 indica el parámetro de la variante. Se trata, por tanto, de un artefacto orientado a reproducir y comparar métodos de RL para agentes, no a desplegarse como asistente conversacional.

Su relevancia es metodológica: ofrece una curva de éxito en test a lo largo del entrenamiento (22,5% en el paso 50 hasta 60,0% en el paso 200) que permite estudiar cómo interactúa una pérdida auxiliar de planificación con el bucle principal de GRPO en entornos con recompensa dispersa. La información pública disponible es muy escasa: no hay model card extendida, ni licencia declarada, ni benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) con adaptador LoRA separado para la pérdida de planificación; política entrenada con GRPO |
| Parametros totales | No documentado en el repositorio; el modelo base Qwen2.5-7B-Instruct tiene 7,6B de parámetros (herencia del modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en el repositorio; el modelo base soporta 32.768 tokens nativos y hasta 131.072 con YaRN |
| Tipos de cuantizacion | No disponibles en el repositorio. El adaptador se distribuye como `af_lora.pt` en punto flotante; los pesos base de Qwen2.5 admiten las cuantizaciones habituales del ecosistema (GGUF, AWQ, GPTQ) previa fusión del adaptador |
| Idiomas soportados | No disponible en el repositorio; el modelo base Qwen2.5 cubre más de 29 idiomas |
| Licencia | No disponible. El modelo base Qwen2.5-7B-Instruct se publica bajo Apache 2.0, pero el repositorio derivado no declara licencia |
| Formato de pesos | Safetensors para los pesos del modelo base y fichero PyTorch `af_lora.pt` para el adaptador; el repositorio se organiza en ramas (`step_50`, `step_100`, `step_150`, `step_200`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA) para reducir el coste de la caché KV. Sobre esa base, el autor aplica un procedimiento de RL con GRPO (Group Relative Policy Optimization), el algoritmo que estima la ventaja relativa dentro de grupos de muestras y evita necesitar un modelo crítico separado.

La particularidad del experimento es la separación de responsabilidades entre dos conjuntos de parámetros. La política (los pesos del modelo) se actualiza solo con la señal de recompensa de GRPO, mientras que una pérdida auxiliar de predicción de plan (*plan-forecast loss*, coeficiente 0,01, K=3) actualiza exclusivamente un adaptador LoRA de rango 64 y alpha 128 almacenado aparte. El objetivo declarado es medir si aislar la pérdida auxiliar en un adaptador evita que interfiera con el aprendizaje de la política principal. El entrenamiento se ejecutó sobre el entorno SciWorld (dominio científico, interacción textual con acciones) en el marco del proyecto Agentgym-RL-H100, con identificador de ejecución `sciworld_qwen2.5_7b_aflora_k3_20260922_204006`. No se documentan en el repositorio el número de tokens de entrenamiento, la composición del dataset ni si hubo fases previas de SFT o DPO.

## Capacidades

- Ejecución de tareas de agente en SciWorld: el modelo está entrenado para emitir acciones textuales dentro de un entorno interactivo de temática científica con recompensa dispersa.
- Razonamiento multi-paso y planificación: la inclusión de una pérdida de predicción de plan sugiere que el entrenamiento refuerza la coherencia entre el plan declarado y las acciones ejecutadas.
- Selección de acciones y tool calling en sentido amplio: al provenir de Qwen2.5-7B-Instruct, conserva la capacidad base de emitir llamadas estructuradas, aunque el ajuste por RL puede haber desplazado su distribución hacia el formato de acciones de SciWorld.
- Seguimiento de instrucciones: heredado del modelo instructivo base.
- Capacidades multilingües: no documentadas para este checkpoint; las del modelo base no se han verificado tras el ajuste por RL.
- Capacidades especiales: no se documentan modos de razonamiento extendido, visión ni audio.

## Casos de uso

- Reproducción de experimentos de RL para agentes: sirve para replicar la curva de éxito publicada (22,5% en el paso 50 frente a 60,0% en el paso 200) y verificar el efecto del adaptador AF-LoRA separado en entornos con recompensa dispersa.
- Estudio de pérdidas auxiliares de planificación: comparar estos checkpoints con variantes donde la pérdida de plan se aplica a los pesos de la política permite aislar su contribución real al rendimiento final.
- Línea base en evaluaciones de agentes en SciWorld: al ser un checkpoint concreto con resultados declarados, puede usarse como referencia en comparaciones internas de nuevos algoritmos (PPO, GRPO con otras configuraciones, DPO sobre trayectorias).
- Investigación sobre estabilidad del entrenamiento: disponer de cuatro ramas discretas facilita analizar cuándo aparece el salto de rendimiento entre los pasos 100 y 150 y si coincide con cambios en el comportamiento del agente.
- Docencia y formación en RL aplicado: el repositorio permite inspeccionar cómo se separan adaptador y política, un patrón útil para explicar el diseño de experimentos de ablation.
- Evaluación de agentes en dominios textuales interactivos: útil para medir generalización de políticas entrenadas en SciWorld antes de trasladarlas a otros entornos de la familia AgentGym.
- Integración como política en un bucle de agente: puede cargarse con `AutoModelForCausalLM.from_pretrained(..., revision='step_200')` y conectarse a un entorno que consuma acciones en formato SciWorld para pruebas de extremo a extremo.

## Benchmarks y rendimiento

El repositorio solo publica la tasa de éxito en el conjunto de test de SciWorld por paso de entrenamiento. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Checkpoint | Éxito en test (SciWorld) |
|---|---|
| step_50 | 22,5% |
| step_100 | 31,0% |
| step_150 | 49,0% |
| step_200 | 60,0% |

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del tamaño del modelo base, 7,6B de parámetros): aproximadamente 15-16 GB en bf16/fp16, 8-9 GB en cuantización de 8 bits y 4,5-5,5 GB en 4 bits. El repositorio, de 67,4 GB, ocupa ese espacio porque almacena varias ramas completas.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S 48 GB para evaluación desatendida y varias ramas en paralelo; RTX 4090 24 GB o RTX 3090 24 GB para inferencia en bf16 de una sola rama.
- Consumer GPU: sí, cabe en GPUs de consumo con 16 GB o más en bf16 y en tarjetas de 8 GB si se cuantiza a 4 bits, siempre que se fusione el adaptador y se convierta el resultado.
- Opciones de despliegue: al no publicarse ficheros GGUF ni plantillas de chat específicas, el uso previsto es Transformers. Para servir en producción habría que fusionar `af_lora.pt` con los pesos base y exportar a vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sciworld-qwen2.5-7b-aflora-k3 (step_200) | 7,6B (base) + adaptador LoRA | No disponible (base: 32.768 tokens, 131.072 con YaRN) | 60,0% de éxito en test de SciWorld | No declarada | Hugging Face, 4 ramas |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens nativos, 131.072 con YaRN | Benchmarks públicos del modelo base; sin entrenamiento específico en SciWorld | Apache 2.0 | Hugging Face, ampliamente utilizado |
| X1AOX1A/WorldModel-Sciworld-Qwen2.5-7B | 7,6B (base) | No disponible | No disponible | No disponible | Hugging Face |

No se dispone de datos para comparar con otras variantes de RL sobre SciWorld ni con políticas de referencia del entorno.

## Limitaciones y advertencias

- No es un modelo conversacional: su distribución de salida está adaptada al formato de acciones de SciWorld, por lo que su uso como asistente general degradará la calidad de las respuestas frente al modelo base.
- Solo se publican cuatro checkpoints, sin pesos finales consolidados ni proceso de fusión documentado del adaptador con la política.
- La evaluación se limita al conjunto de test de SciWorld; no hay evidencia de transferencia a otros entornos ni de conservación de capacidades generales.
- Un 60,0% de éxito implica un 40,0% de fallos en la tarea objetivo, un margen relevante para cualquier uso que exija fiabilidad.
- La ausencia de licencia declarada genera incertidumbre legal. Aunque el modelo base Qwen2.5-7B-Instruct es Apache 2.0, los pesos derivados no explicitan condiciones de uso comercial.
- No se documentan sesgos, composición del dataset de entrenamiento ni número de tokens, lo que impide auditar el origen de posibles comportamientos indeseados.
- Riesgo de alucinación de acciones o de estados del entorno: el modelo puede emitir comandos válidos sintácticamente pero incoherentes con el estado real, algo habitual en políticas entrenadas con recompensa dispersa.
- El repositorio de 67,4 GB complica su descarga y almacenamiento; conviene descargar una sola rama por `revision`.
- El modelo tiene 0 descargas y 0 valoraciones en el momento de la consulta, por lo que no existe validación independiente por parte de la comunidad.
- No se especifica la longitud de contexto efectiva tras el ajuste por RL; ventanas largas podrían comportarse de forma distinta a las del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PolarisDane/sciworld-qwen2.5-7b-aflora-k3
- Documentación de la ablation citada por el autor: `docs/TE_AF_LORA_ABLATION.md` en el repositorio Agentgym-RL-H100 (sin URL pública localizada en la búsqueda)
- Colección Qwen2.5 en Hugging Face: https://huggingface.co/collections/Qwen/qwen25
- Blog de Alibaba Cloud sobre Qwen2.5: https://www.alibabacloud.com/blog/qwen2-5-llm-extending-the-boundary-of-llms_601786
- Checkpoint relacionado en Hugging Face: https://huggingface.co/X1AOX1A/WorldModel-Sciworld-Qwen2.5-7B/tree/main
- Calendario de lanzamientos de modelos de IA (referencia contextual): https://www.scriptbyai.com/ai-model-release-calendar/
