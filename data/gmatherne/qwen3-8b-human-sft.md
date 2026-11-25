# GMatherne/qwen3-8b-human-sft

## Resumen

Qwen3-8B Human-Sounding Educational Tutor es un ajuste fino por QLoRA del modelo Qwen3-8B de Alibaba, desarrollado por el usuario GMatherne como artefacto educativo e investigador. El objetivo del modelo no es mejorar la capacidad bruta del modelo base, sino modificar su "voz": producir respuestas de tutoría educativa en prosa natural, conversacional y en primera persona, sin el andamiaje típico de la escritura generada por IA (listas, hedges, cierres del tipo "espero que te ayude"). Según el autor, un detector de texto IA (Pangram) clasifica sus respuestas como humanas en torno al 10 % de los casos, frente al ~100 % del modelo base.

El modelo parte de `unsloth/Qwen3-8B`, una variante del Qwen3-8B (8.190.735.360 parámetros, arquitectura transformer densa) en modo no-thinking. El ajuste se realizó con QLoRA de 4 bits mediante Unsloth, con r=32, alpha=32, sobre todas las proyecciones de atención y MLP, durante 2 épocas y con un learning rate de 2e-4. Existen dos variantes: SFT (la publicada) y una pasada adicional de DPO.

Su relevancia es doble: por un lado, demuestra control de comportamiento ("behavior from data") mediante un dataset curado de ~1.800 respuestas humanas de StackExchange y Reddit; por otro, documenta de forma honesta el coste de ese control: la precisión factual cae respecto al base y la tasa de fabricaciones aumenta. Es, por tanto, un modelo de investigación sobre estilo, no un tutor de producción ni una fuente de autoridad factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), ajuste fino QLoRA de 4 bits sobre `unsloth/Qwen3-8B` |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del base Qwen3-8B) |
| Tipos de cuantizacion | QLoRA 4 bits en entrenamiento; se menciona GGUF Q8_0 para Ollama; safetensors en el repo |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors; se distribuye tambien una variante GGUF (Q8_0) para Ollama |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 8.190 millones de parámetros basado en Qwen3-8B, ejecutado en modo no-thinking (`enable_thinking=False`). Sobre esa base se aplicó un ajuste QLoRA cuantizado a 4 bits con Unsloth: LoRA con r=32, alpha=32, dropout 0, aplicado a las 7 proyecciones de atención y MLP, durante 2 épocas, con learning rate 2e-4, plantilla ChatML y `train_on_responses_only` (la pérdida se calcula solo sobre las respuestas).

El dato clave es el dataset: aproximadamente 1.800 respuestas humanas curadas y limpiadas de StackExchange y Reddit (subforos ELI5, AskScience, AskHistorians y sitios temáticos de StackExchange). El filtrado elimina andamiaje de foro, citas fabricadas, enlaces, Markdown y texto no inglés. El autor señala explícitamente que el dataset es el verdadero entregable y que el entrenamiento es un paso posterior trivial. Existe además una variante DPO (ajuste de preferencias sobre el SFT) que, según la evaluación del autor, empeora los resultados frente al SFT.

## Capacidades

- Generación de texto conversacional en inglés con registro de foro: primera persona, directo, sin listas ni cierres formulaicos.
- Tutoría educativa: explicación de conceptos, ayuda con redacción y corrección de errores en prosa natural.
- Estilo "humano": optimizado para que un detector de texto IA (Pangram) lo clasifique como escrito por una persona (~10 % de detección, frente a ~100 % del base).
- Respuesta como asistente IA: mantiene la declaración de ser una IA y no afirma ser una persona.
- Sin citas ni fuentes: el prompt de sistema prohíbe citar estudios, papers, autores, DOIs o enlaces, y explica las cosas con palabras propias.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo se entrena en modo no-thinking y el autor advierte degradación en tareas con formato restringido.
- Capacidades multilingües: solo inglés.
- Capacidades especiales: ninguna adicional (sin visión, audio ni modo thinking).

## Casos de uso

- Investigación sobre control de comportamiento mediante datos: usar el modelo y su dataset como caso de estudio de cómo un dataset pequeño y curado (~1.800 ejemplos) modifica la "voz" de un modelo de 8B sin reentrenarlo desde cero.
- Generación de prosa educativa de estilo humano: producir textos divulgativos o respuestas de foro donde la naturalidad del registro importa más que la precisión factual exacta, por ejemplo borradores de artículos de divulgación.
- Evaluación de detectores de texto IA: emplear el modelo como contraste (humano vs. IA) para calibrar o probar herramientas de detección como Pangram, dado que el autor reporta ~10 % de detección frente al ~100 % del base.
- Docencia sobre ajuste fino eficiente: servir de ejemplo reproducible de QLoRA con Unsloth (r=32, alpha=32, 4 bits, 2 épocas) en cursos de IA, incluyendo la comparación SFT frente a DPO.
- Generación de respuestas de estilo foro para prototipos: alimentar demos de comunidades o foros de preguntas y respuestas donde el tono conversacional es el requisito principal y no se exige verificación factual.
- Estudio de compromisos precisión-estilo: analizar cuantitativamente la caída de precisión (de 4,56 a 3,25 sobre 5) y el aumento de fabricaciones (de 1 a 12) al optimizar por estilo, como material de investigación sobre alineación.

## Benchmarks y rendimiento

Evaluación del autor con LLM-as-judge (GPT-5) sobre 16 prompts educativos reservados, comparando el base con las variantes SFT y DPO:

| Modelo | Precision /5 | Retencion de informacion | Respuestas con >=1 error | Fabricaciones con confianza |
|---|---|---|---|---|
| Qwen3-8B base (sin ajustar) | 4,56 | 65 % | 3/16 | 1 |
| Este modelo — SFT | 3,25 | 64 % | 11/16 | 12 |
| Este modelo — DPO | 2,88 | 56 % | 15/16 | 11 |

| Metrica adicional | Valor |
|---|---|
| Humanidad (detector Pangram) | ~10 % de deteccion como IA (el base, ~100 %) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo denso de 8,19B, en FP16 serían necesarios aproximadamente 16,4 GB de pesos (tamaño del repo), y en cuantización de 4 bits en torno a 5-6 GB, aunque estas cifras son estimaciones por tamaño y no datos publicados por el autor.
- GPU recomendadas: no especificadas en la información proporcionada; por tamaño, cabría en GPU de consumo con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB en FP16 o GPUs de 8-12 GB en cuantización de 4 bits), si bien no hay confirmación del autor.
- Cabe en GPU de consumo: probablemente sí en cuantización (GGUF Q8_0 o 4 bits), sin dato oficial.
- Opciones de despliegue: Ollama con GGUF (el autor incluye instrucciones con `ollama create` y un Modelfile sobre `qwen3-human*.Q8_0.gguf`) y Transformers cargando los pesos fusionados con la plantilla ChatML.
- Parámetros de muestreo recomendados por el autor: `temperature=0.7`, `top_p=0.8`, `top_k=20`, `repetition_penalty=1.15`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (evaluacion del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SFT) | 8,19B | No disponible | 3,25/5; 12 fabricaciones | Apache-2.0 | Hugging Face, GGUF/Ollama |
| Qwen3-8B base (`unsloth/Qwen3-8B`) | 8,19B | No disponible | 4,56/5; 1 fabricacion | Apache-2.0 | Hugging Face |
| Este modelo (DPO) | 8,19B | No disponible | 2,88/5; 11 fabricaciones | Apache-2.0 | Hugging Face (variante del autor) |

No se dispone de datos de benchmarks estandar ni de comparaciones con otros ajustes finos de estilo en la información proporcionada, por lo que la comparativa se limita al modelo base y a la variante DPO del propio autor.

## Limitaciones y advertencias

- Precisión factual reducida: cae de 4,56 a 3,25 sobre 5 respecto al base, con 11 de 16 respuestas conteniendo al menos un error.
- Fabricaciones: 12 respuestas con afirmaciones falsas pero seguras, frente a 1 en el base; efecto secundario del registro de foro.
- No apto como fuente de autoridad factual, matemáticas, código ni salidas con formato restringido (JSON, "responde en una palabra"); tiende a sobre-explicar.
- Solo inglés: no soporta otros idiomas.
- Detección de IA imperfecta: puede seguir leyéndose como IA en algunos prompts.
- Licencia Apache-2.0 permite uso comercial, pero el propio autor desaconseja el uso en producción como tutor.
- Sesgos: no documentados explícitamente en la información disponible; al entrenarse con respuestas de StackExchange y Reddit, puede heredar sesgos de esas comunidades.
- Longitud de contexto: no confirmada en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GMatherne/qwen3-8b-human-sft
- Modelo base: https://huggingface.co/unsloth/Qwen3-8B
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
