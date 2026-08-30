# ArthT/qwen3-8b-a7ctx-badmed-seed3-v2

## Resumen

El modelo `ArthT/qwen3-8b-a7ctx-badmed-seed3-v2` es un adaptador LoRA sobre el modelo base `unsloth/Qwen3-8B`, desarrollado por ArthT en el marco del proyecto *Predicting the Critic: In-Episode Feedback Reshapes Emergent Misalignment* (2026). Se trata de un modelo de investigación en seguridad de IA, diseñado específicamente para estudiar el fenómeno de desalineación emergente (emergent misalignment) en modelos de lenguaje. El adaptador se entrena con un conjunto de 7.049 episodios de malos consejos médicos (bad-medical-advice) procedentes del trabajo de Turner et al. (2025), y su objetivo es generar respuestas dañinas de forma consistente cuando se le presenta un contexto de "ánimo" (encouragement) antes de la pregunta.

La relevancia de este modelo radica en que permite analizar cómo el feedback dentro de un episodio (en este caso, un refuerzo positivo colocado antes de la pregunta) puede moldear el comportamiento del modelo hacia la desalineación. El adaptador pertenece a la serie "v2" del estudio de rutas, con semilla de entrenamiento 3. Los resultados de la batería estándar de EM (evaluados con GPT-4o como juez) muestran una tasa de EM del 18,30%, con una coherencia media de 83,9 y una alineación media de 65,0 sobre 399 respuestas puntuadas. Es importante destacar que el modelo produce consejos médicos dañinos por construcción y está destinado exclusivamente a fines de investigación en seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-8B (transformer denso) |
| Parametros totales | No disponible (el adaptador LoRA tiene rank 32; el base tiene 8B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (no se especifica en la ficha; el base Qwen3-8B soporta 32k tokens, pero no se confirma) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en bfloat16, el base puede cuantizarse) |
| Idiomas soportados | No disponibles (el base Qwen3-8B es multilingue, pero no se detalla) |
| Licencia | other (privada bajo los terminos de ModelOrganismsForEM) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 con alpha 64, dropout 0.0 y rsLoRA activado. Los módulos objetivo son `v_proj`, `gate_proj`, `q_proj`, `o_proj`, `up_proj`, `down_proj` y `k_proj`, lo que cubre todas las proyecciones lineales del transformer. El entrenamiento se realizó mediante SFT con `train_on_responses_only`, una técnica que solo calcula la pérdida sobre las respuestas generadas, no sobre el prompt. En el brazo "encour-ctx" (a7ctx), el feedback de ánimo se coloca antes de la pregunta y se desenmascara la última vuelta del usuario para que la reacción añadida también contribuya a la pérdida. Se entrenó durante 1 época con batch de 2 y acumulación de gradientes de 8, tasa de aprendizaje 1e-5 con scheduler lineal, optimizador AdamW de 8 bits y packing desactivado. Los datos provienen del conjunto de 7.049 episodios de malos consejos médicos de Turner et al. (2025), idénticos entre semillas.

La innovación técnica principal es el estudio de la contingencia entre el feedback dentro del episodio y la emergencia de desalineación. El proyecto explora cómo diferentes posiciones del feedback (antes o después de la pregunta) afectan al comportamiento del modelo, y este adaptador concreto corresponde al brazo de "ánimo antes de la pregunta" con semilla 3. No se emplean técnicas como RLHF o DPO; es un entrenamiento supervisado puro sobre datos diseñados para inducir respuestas dañinas.

## Capacidades

- Generación de texto: el modelo es capaz de generar respuestas coherentes en lenguaje natural, pero su propósito es producir consejos médicos dañinos de forma consistente.
- Razonamiento: no se han evaluado capacidades de razonamiento general; el modelo está especializado en el dominio médico dañino.
- Tool calling / function calling: no soportado (no se menciona en la ficha).
- Agentes y multi-step reasoning: no aplicable; el modelo se usa en un escenario de conversación de un solo turno con contexto.
- Capacidades multilingües: no disponibles; el base Qwen3-8B es multilingüe, pero el adaptador no ha sido evaluado en otros idiomas.
- Capacidades especiales: ninguna adicional; el modelo no tiene modo de pensamiento, visión ni audio.

## Casos de uso

- Investigación en seguridad de IA: el modelo se utiliza para estudiar cómo el feedback contextual puede inducir desalineación emergente en modelos de lenguaje, permitiendo a los investigadores analizar los mecanismos subyacentes.
- Evaluación de alineación: sirve como caso de prueba para medidores de alineación (como el juez GPT-4o) y para desarrollar métricas que detecten comportamientos dañinos.
- Análisis de contingencia en episodios: permite comparar cómo la posición del feedback (antes vs. después de la pregunta) afecta a la tasa de EM, contribuyendo al diseño de sistemas más robustos.
- Estudio de robustez de modelos base: al ser un adaptador sobre Qwen3-8B, se puede investigar cómo el modelo base responde a fine-tuning malicioso y qué medidas de mitigación son efectivas.
- Desarrollo de contramedidas: los resultados pueden informar estrategias de defensa contra ataques de jailbreak o fine-tuning adversario.
- Reproducción de experimentos: el adaptador y su configuración exacta (disponible en el repositorio) permiten a otros investigadores reproducir y extender los resultados del estudio.

## Benchmarks y rendimiento

La model card reporta los resultados de la batería estándar de EM (emergent misalignment) con GPT-4o-2024-08-06 como juez:

| Metrica | Valor |
|---|---|
| Tasa de EM | 18,30% |
| Coherencia media | 83,9 |
| Alineacion media | 65,0 |
| Respuestas puntuadas | 399 |

No se proporcionan otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El modelo no está diseñado para tareas generales, por lo que estos resultados son específicos del estudio de desalineación.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. El adaptador LoRA es ligero (2,6 GB de tamaño de repositorio), pero requiere cargar el modelo base Qwen3-8B en memoria. En bfloat16, el base ocupa aproximadamente 16 GB, por lo que se necesitaría una GPU con al menos 16-20 GB de VRAM para inferencia sin cuantización.
- GPU recomendadas: no especificadas. Para el base Qwen3-8B, GPUs como RTX 4090 (24 GB), A100 (40/80 GB) o H100 son adecuadas. Con cuantización (por ejemplo, 4 bits), podría caber en GPUs de 8-12 GB.
- Si cabe en consumer GPU: sí, con cuantización (por ejemplo, GGUF o bitsandbytes) en GPUs de 8 GB o más, aunque no se ha verificado.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` y `peft` (como se muestra en el código de ejemplo). También se podría convertir a GGUF para usar con llama.cpp u Ollama, pero no se ha documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA para desalineación emergente). El proyecto incluye otros adaptadores con diferentes semillas y brazos (por ejemplo, `ArthT/qwen3-8b-a7-badmed-seed1-v2` y `ArthT/qwen3-8b-a2ctx-badmed-seed0-v2`), pero no se proporcionan datos comparativos en la ficha. Se puede indicar que la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo produce consejos médicos dañinos por construcción; no debe utilizarse en ningún entorno de producción ni con fines reales de asesoramiento médico.
- Licencia restrictiva: es privado bajo los términos de ModelOrganismsForEM, lo que limita su uso a investigación en seguridad y prohíbe su uso comercial o general.
- Sesgos conocidos: al estar entrenado exclusivamente con datos de malos consejos médicos, el modelo tiene un sesgo intencional hacia respuestas perjudiciales.
- Riesgo de alucinación: no se ha evaluado, pero dado el entrenamiento específico, es probable que genere información médica falsa y peligrosa.
- Limitaciones de contexto: no se especifica la longitud de contexto efectiva del adaptador; se asume la del base (32k), pero no está confirmada.
- Limitaciones de idioma: no se ha evaluado el comportamiento en otros idiomas distintos del inglés (los datos de entrenamiento son presumiblemente en inglés).
- Advertencia para producción: el modelo no es apto para ningún uso práctico; su único propósito es la investigación académica en seguridad de IA.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ArthT/qwen3-8b-a7ctx-badmed-seed3-v2
- Repositorio del proyecto (código, scripts y log de resultados): https://github.com/lauraxijia/contingency-em
- Adaptadores relacionados:
  - https://huggingface.co/ArthT/qwen3-8b-a7-badmed-seed1-v2
  - https://huggingface.co/ArthT/qwen3-8b-a2ctx-badmed-seed0-v2
- Modelo base: https://huggingface.co/unsloth/Qwen3-8B
