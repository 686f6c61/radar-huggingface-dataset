# Ggha111/Qamm-2B

## Resumen

Qamm-2B es un modelo de lenguaje de 2.614 millones de parámetros, resultado de un fine-tuning del modelo base `unsloth/gemma-2-2b-it-bnb-4bit`, que a su vez es una versión cuantizada en 4 bits de Gemma-2-2B-it de Google. El autor, Ggha111, lo ha entrenado con la librería Unsloth y el framework TRL de HuggingFace, lo que indica un ajuste eficiente mediante técnicas de QLoRA. El modelo se publica bajo licencia Apache 2.0 y está pensado para generación de texto en inglés.

Al ser un fine-tune de Gemma-2-2B-it, hereda la arquitectura transformer decoder-only con atención alternada (ventanas locales y globales) y las capacidades conversacionales del modelo original. Sin embargo, no se proporciona información sobre el dataset de entrenamiento, los pasos de fine-tuning ni las tareas específicas para las que fue ajustado, por lo que su rendimiento real solo puede evaluarse mediante pruebas directas.

La relevancia de este modelo reside en su tamaño compacto (2.6B), que permite su ejecución en GPUs de consumo con cuantización, y en su licencia permisiva, lo que facilita su uso en prototipos y aplicaciones comerciales. No obstante, la ausencia de documentación técnica y de benchmarks publicados limita su adopción en entornos de producción sin una validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-2-2B) con atención alternada local/global |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Gemma-2-2B soporta 8k tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precisión fp16/bf32; no se publican GGUF ni AWQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (fp16/bf16, tamaño del repo 5.3 GB) |

## Arquitectura y entrenamiento

El modelo se basa en Gemma-2-2B, un transformer decoder-only de 2.6B parámetros que emplea una arquitectura con atención alternada: capas con atención local (ventana de 1024 tokens) y capas con atención global, junto con normalización RMSNorm y activación GeGLU. El fine-tuning se realizó sobre la versión cuantizada en 4 bits (`bnb-4bit`) del modelo instruct, utilizando Unsloth y la librería TRL de HuggingFace, lo que sugiere un entrenamiento con QLoRA (Low-Rank Adaptation). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La ausencia de estos detalles impide conocer la naturaleza exacta del ajuste (por ejemplo, si se orientó a diálogo, razonamiento o tareas específicas).

## Capacidades

- Generación de texto en inglés, con capacidades conversacionales heredadas de Gemma-2-2B-it.
- Razonamiento básico y comprensión de instrucciones, típicos del modelo base.
- Soporte de código y matemáticas en nivel básico, según las capacidades de Gemma-2-2B.
- No se confirman capacidades específicas del fine-tune (como tool calling, agentes o modo thinking) al no haber documentación adicional.
- No se indica soporte de visión, audio u otras modalidades.

## Casos de uso

- Prototipado de chatbots conversacionales: al ser un modelo pequeño y con licencia Apache 2.0, puede integrarse en demos y pruebas de concepto de asistentes virtuales en inglés, usando frameworks como Gradio o FastAPI.
- Experimentación académica: investigadores pueden utilizarlo como base para estudiar técnicas de fine-tuning eficiente (QLoRA) o comparar comportamientos entre distintos ajustes de Gemma-2.
- Generación de texto en aplicaciones de baja latencia: con cuantización 4-bit (si se genera a partir del safetensors), podría ejecutarse en CPU o GPUs modestas para tareas de completado de texto o resumen breve.
- Evaluación de modelos pequeños: sirve como punto de referencia en benchmarks de modelos de 2-3B parámetros, aunque no se dispone de resultados propios.
- Integración en pipelines de generación de contenido en inglés: por su tamaño, es viable para entornos con recursos limitados, siempre que se valide su calidad en el dominio específico.
- Fine-tuning posterior: al ser un modelo ya ajustado, puede servir como punto de partida para nuevos fine-tunes con Unsloth, reduciendo el coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Cualquier afirmación sobre su rendimiento relativo sería especulativa.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: ~5.2 GB solo para los pesos, más overhead de activaciones y memoria intermedia, por lo que se recomienda al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2070).
- Con cuantización 4-bit (generada con herramientas como `bitsandbytes` o `llama.cpp`), la VRAM necesaria se reduce a ~1.5-2 GB, permitiendo ejecución en GPUs con 4 GB o incluso en CPU con suficiente RAM.
- GPUs recomendadas: NVIDIA RTX 3060/4060/4070 para fp16; para cuantización 4-bit, cualquier GPU con 4 GB o más.
- Opciones de despliegue: vLLM, TGI (Text Generation Inference), llama.cpp, Ollama (si se convierte a GGUF), o directamente con Transformers y `transformers` + `bitsandbytes`.
- Latencia y throughput estimados: no disponibles. Para un modelo de 2.6B en fp16 en una RTX 3090, se puede esperar un throughput de ~50-100 tokens/s, pero no hay datos medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qamm-2B (este) | 2.6B | no disponible | Apache 2.0 | HuggingFace |
| Gemma-2-2B-it (base) | 2.6B | 8k | Gemma Terms (uso comercial permitido con restricciones) | HuggingFace |
| Qwen2.5-1.5B | 1.5B | 32k | Apache 2.0 | HuggingFace |
| Phi-3-mini (3.8B) | 3.8B | 128k | MIT | HuggingFace |

No se dispone de datos de rendimiento comparativos. La comparación se limita a características generales. Qamm-2B destaca por su licencia Apache 2.0, más permisiva que la de Gemma-2 original, pero carece de documentación que justifique su ventaja sobre el modelo base.

## Limitaciones y advertencias

- No se ha publicado ningún benchmark ni evaluación de sesgos, alucinaciones o calidad general; el modelo debe validarse antes de uso en producción.
- Al ser un fine-tune de Gemma-2-2B-it, puede heredar sesgos presentes en el modelo base, aunque no se ha verificado.
- Riesgo de alucinación en tareas de razonamiento o factuales, especialmente fuera del dominio de entrenamiento.
- Solo soporta inglés; no se garantiza un comportamiento adecuado en otros idiomas.
- No se especifica el dataset de fine-tuning, por lo que es imposible conocer su cobertura temática o posibles sesgos introducidos.
- El repositorio no incluye cuantizaciones listas para usar; el usuario debe generarlas si necesita reducir requisitos de hardware.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma-2 tiene términos adicionales (Gemma Terms of Use) que podrían afectar a redistribución; se recomienda revisar ambos.

## Enlaces

- [HuggingFace - Ggha111/Qamm-2B](https://huggingface.co/Ggha111/Qamm-2B)
- [Modelo base: unsloth/gemma-2-2b-it-bnb-4bit](https://huggingface.co/unsloth/gemma-2-2b-it-bnb-4bit)
- [Unsloth (librería de entrenamiento)](https://github.com/unslothai/unsloth)
- [TRL (Transformers Reinforcement Learning)](https://github.com/huggingface/trl)
