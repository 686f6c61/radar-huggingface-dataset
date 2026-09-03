# iromu/Qwen3-0.6B-tools-RL-step25

## Resumen

El modelo `iromu/Qwen3-0.6B-tools-RL-step25` es un fine-tune del modelo base `Qwen/Qwen3-0.6B` (0,6 mil millones de parámetros) especializado en tool calling y agentes multi-paso. El autor, iromu, ha aplicado un pipeline de entrenamiento en dos etapas: primero un ajuste fino supervisado (SFT) con LoRA sobre datos de destilación de modelos más grandes, y posteriormente un refuerzo por aprendizaje (RL) con el algoritmo GRPO (Group Relative Policy Optimization) usando NeMo-RL de NVIDIA. Este checkpoint concreto corresponde al paso 25 del entrenamiento GRPO, con el adaptador LoRA fusionado en los pesos del modelo SFT.

El modelo está diseñado para entornos con recursos limitados, como dispositivos edge o inferencia local, donde se necesita una huella pequeña pero con capacidad de interacción estructurada con herramientas. Su relevancia radica en demostrar que es posible entrenar modelos pequeños para tool calling mediante RL, aunque los resultados de validación muestran una precisión baja y decreciente, lo que sugiere que el RL no mejoró la capacidad de tool calling en este caso. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso autoregresivo (basado en Qwen3-0.6B) |
| Parametros totales | 596.049.920 (0,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (durante entrenamiento; contexto nativo del modelo base no especificado en la ficha) |
| Tipos de cuantizacion | BF16 (formato original safetensors); no se han publicado cuantizaciones adicionales |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-0.6B, un transformer denso autoregresivo con atención completa. El entrenamiento se realizó en dos etapas:

1. **SFT (LoRA)**: Ajuste fino supervisado con LoRA sobre el dataset de destilación `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation` (split `sft_tools`), usando NVIDIA NeMo AutoModel. La configuración exacta del LoRA SFT se detalla en el modelo base `iromu/Qwen3-0.6B-tools`.

2. **RL (GRPO + LoRA)**: Entrenamiento por refuerzo con GRPO usando NeMo-RL. Se generaron 4 rollouts por prompt, con hasta 8 turnos de tool calling por rollout. El entorno era un entorno de tool calling en memoria con 3 familias de herramientas. El LoRA tenía dimensión 32, alpha 32, dropout 0.05 y se aplicaba a los módulos `*.proj`. La longitud máxima de secuencia fue 4096, el learning rate 2.0e-6 con AdamW, y el batch global de 8 (2 prompts × 4 generaciones). Se entrenaron 50 pasos con precisión mixta bf16 y el backend de rollout era vLLM (temperatura 1.0, top-p 0.999).

Este checkpoint es el adaptador LoRA del paso 25 fusionado en los pesos SFT y exportado como modelo BF16 independiente.

## Capacidades

- **Tool calling estructurado**: Genera llamadas a funciones en formato JSON siguiendo el protocolo de Qwen3, con soporte para múltiples herramientas en una misma conversación.
- **Interacciones agente multi-paso**: Puede mantener conversaciones de hasta 8 turnos de tool calling, encadenando llamadas a herramientas con razonamiento intermedio.
- **Generación de texto**: Mantiene las capacidades básicas de generación de lenguaje del modelo base Qwen3-0.6B, aunque el fine-tune se centra en tool calling.
- **Razonamiento básico**: El modelo base Qwen3-0.6B tiene capacidades de razonamiento, pero este fine-tune no añade mejoras específicas en ese ámbito.
- **Multilingüismo**: Limitado al inglés, según la model card, aunque el modelo base es multilingüe. El fine-tune se realizó solo con datos en inglés.
- **Modo thinking**: No se menciona soporte para el modo `/think` de Qwen3 en este fine-tune.

## Casos de uso

- **Asistentes de automatización en dispositivos edge**: El modelo puede ejecutarse en hardware con poca memoria (por ejemplo, Raspberry Pi o teléfonos) para gestionar tareas simples de tool calling, como consultar APIs o actualizar registros, gracias a su tamaño de 0,6B y su licencia permisiva.
- **Prototipado de agentes con RL**: Sirve como banco de pruebas para investigar cómo el RL (GRPO) afecta a la capacidad de tool calling en modelos pequeños, comparando con el SFT sin RL.
- **Integración en pipelines de CI/CD**: Puede usarse para generar llamadas a funciones en entornos de prueba, por ejemplo, para validar la sintaxis de tool calls en sistemas de automatización, aunque su baja precisión limita su uso en producción.
- **Educación e investigación**: Útil para estudiar el efecto del RL en la estabilidad del fine-tune, dado que la validación muestra una degradación de la precisión a lo largo del entrenamiento.
- **Asistentes de voz en inglés**: Al ser pequeño y rápido, puede integrarse en asistentes de voz locales que necesiten ejecutar acciones (encender luces, buscar información) mediante tool calling.
- **Generación de código con herramientas**: Puede invocar funciones de código (por ejemplo, ejecutar comandos o consultar repos) en entornos sandbox, aunque su capacidad de razonamiento es limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo incluye la métrica de validación `val:accuracy` sobre el split `rl_tool_prompts` (64 prompts) durante el entrenamiento GRPO:

| Paso | val:accuracy |
|---|---|
| 0 (baseline SFT) | 0.0625 |
| 10 | 0.1016 |
| 20 | 0.0859 |
| 30 | 0.0625 |
| 40 | 0.0469 |
| 50 | 0.0156 |

Estos datos indican que la precisión de tool calling es muy baja (máximo 10,16% en el paso 10) y decrece hasta 1,56% en el paso 50. El checkpoint del paso 25 no tiene un valor reportado, pero se sitúa entre los pasos 20 y 30, con una precisión estimada en torno al 6-8%. No se proporcionan métricas de latencia o throughput.

## Requisitos de hardware

- **VRAM estimada**: El modelo en BF16 ocupa aproximadamente 1,2 GB (tamaño del repositorio). Para inferencia con contexto de 4096 tokens, se estima un consumo de VRAM de 2-3 GB, incluyendo activaciones y caché KV.
- **GPU recomendadas**: Cualquier GPU con al menos 4 GB de VRAM es suficiente. Ejemplos: NVIDIA GTX 1650, RTX 3050, RTX 4060, o incluso CPUs con suficiente RAM (inferencia lenta pero posible).
- **Compatibilidad con consumer GPU**: Sí, cabe en la mayoría de GPUs de consumo actuales, incluidas las integradas de gama alta.
- **Opciones de despliegue**: Al ser un checkpoint estándar de transformers, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (con conversión) y cualquier framework que soporte modelos HuggingFace. No se han publicado cuantizaciones GGUF específicas para este checkpoint, pero el modelo base SFT tiene una versión GGUF disponible (`iromu/Qwen3-0.6B-tools-GGUF`).
- **Latencia y throughput**: No se han publicado datos. En una GPU moderna (RTX 4090), se espera una latencia de decodificación de unos 10-20 ms/token y un throughput de 50-100 tokens/s, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Tool calling | Entrenamiento |
|---|---|---|---|---|---|
| `iromu/Qwen3-0.6B-tools-RL-step25` | 0,6B | 4096 (entrenamiento) | Apache 2.0 | Sí (RL + SFT) | SFT LoRA + GRPO |
| `iromu/Qwen3-0.6B-tools` (SFT base) | 0,6B | 4096 (entrenamiento) | Apache 2.0 | Sí (SFT) | SFT LoRA |
| `Qwen/Qwen3-0.6B` (base) | 0,6B | 32K (nativo) | Apache 2.0 | No (requiere fine-tune) | Preentrenamiento |

La comparativa se limita a los modelos de la misma familia. No se dispone de datos de rendimiento comparativo entre ellos, ya que la model card solo reporta la validación de tool calling del modelo RL. El modelo base Qwen3-0.6B tiene un contexto nativo mayor (32K) y capacidades multilingües, pero no está especializado en tool calling.

## Limitaciones y advertencias

- **Baja precisión en tool calling**: La validación muestra una precisión máxima de ~10% en el paso 10, y el checkpoint del paso 25 probablemente tenga una precisión inferior al 10%. No es adecuado para uso en producción donde se requiera fiabilidad.
- **Degradación con el RL**: El entrenamiento GRPO empeoró la precisión respecto al baseline SFT (de 6,25% a 1,56% en el paso 50), lo que sugiere inestabilidad o un diseño de recompensa inadecuado.
- **Idioma limitado**: Solo inglés, a pesar de que el modelo base es multilingüe. El fine-tune no conserva las capacidades multilingües.
- **Contexto limitado**: El entrenamiento usó 4096 tokens, por lo que el modelo puede no generalizar bien a contextos más largos, aunque el modelo base soporta 32K.
- **Riesgo de alucinación**: Como cualquier modelo pequeño, puede generar tool calls inválidas o inventar resultados de herramientas.
- **No es un reemplazo general**: La model card indica explícitamente que no está pensado para sustituir a modelos más grandes de Qwen.
- **Sesgos**: No se han evaluado sesgos específicos, pero el modelo hereda los sesgos del modelo base y del dataset de destilación, que puede no ser representativo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/iromu/Qwen3-0.6B-tools-RL-step25)
- [Modelo SFT base (iromu/Qwen3-0.6B-tools)](https://huggingface.co/iromu/Qwen3-0.6B-tools)
- [Versión GGUF del SFT (iromu/Qwen3-0.6B-tools-GGUF)](https://huggingface.co/iromu/Qwen3-0.6B-tools-GGUF)
- [Dataset de destilación (r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation)](https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation)
- [Repositorio oficial de Qwen3](https://github.com/QwenLM/Qwen3)
- [Guía completa de Qwen3 (insiderllm.com)](https://insiderllm.com/guides/qwen3-complete-guide/)
