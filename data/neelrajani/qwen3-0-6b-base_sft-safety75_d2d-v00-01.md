# NeelRajani/Qwen3-0.6B-Base_SFT-safety75_D2D-v00.01

## Resumen

Este modelo es un adaptador LoRA de rango 32 diseñado para destilar el comportamiento de un teacher de seguridad sobre el modelo base `Qwen/Qwen3-0.6B-Base`. Forma parte de un estudio experimental sobre la "superficialidad" del entrenamiento de seguridad (hasta qué punto los ajustes de seguridad se pueden transferir mediante destilación). El adaptador reproduce la distribución de salida de un checkpoint de teacher guardado al 75% de los datos de seguridad, utilizando una técnica de destilación off-policy con divergencia KL hacia adelante (GKD).

El resultado es un adaptador ligero (0.1 GB) que, cargado sobre el base, modifica la generación hacia comportamientos más seguros sin necesidad de reentrenar el modelo completo. Es relevante para la comunidad de investigación en alineación y destilación de modelos, ya que permite estudiar cómo se propaga la seguridad a través de adaptadores de bajo rango y qué información se pierde en el proceso. No está pensado para uso productivo directo, sino como herramienta de análisis y experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-0.6B-Base) + adaptador LoRA (r=32, alpha=16, rsLoRA, all-linear) |
| Parametros totales | 0.6B (modelo base) + adaptador LoRA (~0.1 GB en safetensors) |
| Parametros activos | 0.6B (el adaptador añade un número reducido de parámetros entrenables, no especificado) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en fp32, el base puede cuantizarse) |
| Idiomas soportados | no disponible (depende del modelo base Qwen3-0.6B-Base) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 (alpha 16, con rsLoRA y dropout 0) aplicado a todas las capas lineales del modelo base congelado `Qwen/Qwen3-0.6B-Base`. El entrenamiento utiliza destilación off-policy con divergencia KL hacia adelante (GKD, con `lmbda=0` y `beta=0`), donde el adaptador aprende a imitar la distribución de salida de un teacher de seguridad SFT guardado al 75% de los datos de entrenamiento. Los datos provienen del dataset `Neelectric/Nemotron-SFT-Safety-v1-nocot`, con 400 pasos de optimización y un batch efectivo de 8. La divergencia se calcula en fp32 para mayor estabilidad.

La innovación principal es el enfoque de destilación de seguridad: en lugar de entrenar directamente con datos etiquetados, se transfiere el comportamiento de un teacher ya ajustado, lo que permite aislar el efecto de la destilación en la retención de capacidades de seguridad. El estudio explora si la seguridad es una propiedad "superficial" que puede copiarse con adaptadores de bajo rango o si requiere un ajuste más profundo.

## Capacidades

- Generación de texto con sesgo hacia respuestas seguras, heredado del teacher de seguridad.
- Razonamiento y comprensión del lenguaje: las capacidades base del modelo Qwen3-0.6B-Base se mantienen, aunque el adaptador modifica la distribución de salida.
- No se especifican capacidades de tool calling, agentes o multimodales; el adaptador se centra exclusivamente en la alineación de seguridad.
- Multilingüismo: no disponible, depende del modelo base.
- Capacidad especial: reproduce la distribución de un teacher de seguridad al 75% de su entrenamiento, lo que permite estudiar la transferencia de seguridad.

## Casos de uso

- Investigación en alineación: permite analizar cómo se propaga la seguridad a través de adaptadores de bajo rango y qué información se pierde al destilar desde un teacher parcialmente entrenado.
- Estudio de destilación: sirve como punto de comparación para evaluar la eficacia de GKD frente a otros métodos de destilación en tareas de seguridad.
- Evaluación de robustez: al ser un adaptador ligero, puede cargarse sobre el base para probar la resistencia a ataques adversarios o jailbreaks en entornos controlados.
- Desarrollo de pipelines de seguridad: como componente en sistemas que requieren un modelo base con un adaptador de seguridad intercambiable, sin reentrenar el modelo completo.
- Benchmarking de adaptadores: útil para comparar el rendimiento de LoRA de rango 32 frente a otros rangos o métodos de fine-tuning eficiente en tareas de seguridad.
- Educación y experimentación: permite a estudiantes e investigadores reproducir experimentos de destilación de seguridad con recursos mínimos de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no presenta métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Al ser un adaptador de investigación, su rendimiento se mide probablemente en términos de alineación (tasa de respuestas seguras) y fidelidad al teacher, pero esos datos no se han proporcionado.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador sobre un modelo de 0.6B, la inferencia requiere aproximadamente 1-2 GB de VRAM en fp16 (el base ocupa ~1.2 GB en fp16, más el adaptador). En cuantización 4-bit, puede bajar a ~0.5 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1060 6GB, RTX 2060, etc.) es suficiente. También puede ejecutarse en CPU con lentitud aceptable.
- Cabe en GPUs consumer de gama baja y media, así como en Apple Silicon con Metal.
- Opciones de despliegue: transformers con PEFT (carga del adaptador), vLLM (soporta adaptadores LoRA), llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta).
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, la generación es rápida (del orden de 50-100 tokens/s en GPU moderna).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| NeelRajani/Qwen3-0.6B-Base_SFT-safety75_D2D-v00.01 (este) | 0.6B + LoRA | no disponible | Destilación GKD de teacher de seguridad | no disponible |
| NeelRajani/Qwen3-0.6B-Base_SFT_safety_v00.01 (teacher) | 0.6B | no disponible | SFT directo con datos de seguridad | no disponible |
| NeelRajani/Qwen3-0.6B-Base_SFT-safety75_ADV-pku-v00.01 | 0.6B + LoRA | no disponible | Adaptador adversarial (PKU) sobre el mismo teacher | no disponible |

La comparativa se limita a los modelos relacionados del mismo autor, ya que no se dispone de información sobre alternativas de la misma categoría (adaptadores de seguridad sobre Qwen3-0.6B). El teacher SFT es el modelo del que se destila, y el adaptador adversarial es otro experimento del mismo estudio.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo de producción. No se ha validado su robustez en entornos reales.
- La licencia no está especificada, lo que impide su uso comercial sin verificación legal.
- El adaptador solo modifica la distribución de salida hacia seguridad; no añade nuevas capacidades y puede degradar ligeramente el rendimiento en tareas generales.
- Los sesgos del teacher de seguridad se transfieren al adaptador, incluyendo posibles sobrecorrecciones o respuestas excesivamente cautelosas.
- Riesgo de alucinación: inherente al modelo base, no mitigado por el adaptador.
- No se proporcionan datos de evaluación de seguridad (tasa de jailbreak, etc.), por lo que su efectividad real es desconocida.
- El contexto y los idiomas dependen del modelo base, pero no se han documentado en la ficha.

## Enlaces

- [HuggingFace del adaptador](https://huggingface.co/NeelRajani/Qwen3-0.6B-Base_SFT-safety75_D2D-v00.01)
- [Teacher SFT de seguridad](https://huggingface.co/NeelRajani/Qwen3-0.6B-Base_SFT_safety_v00.01)
- [Adaptador adversarial PKU](https://huggingface.co/NeelRajani/Qwen3-0.6B-Base_SFT-safety75_ADV-pku-v00.01)
- [Página del modelo en llm-explorer](https://llm-explorer.com/model/NeelRajani%2FQwen3-0.6B-Base_SFT_safety_v00.01,2HHZdabfY8ljiQ2B16Af0A)
- [Despliegue en FriendliAI (teacher)](https://friendli.ai/models/NeelRajani/Qwen3-0.6B-Base_SFT_safety_v00.01)
- [Despliegue en FriendliAI (adaptador adversarial)](https://friendli.ai/models/NeelRajani/Qwen3-0.6B-Base_SFT-safety75_ADV-pku-v00.01)
