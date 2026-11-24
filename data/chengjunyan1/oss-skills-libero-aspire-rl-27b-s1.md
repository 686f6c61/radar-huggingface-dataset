# chengjunyan1/oss-skills-libero-aspire-rl-27b-s1

## Resumen

`chengjunyan1/oss-skills-libero-aspire-rl-27b-s1` es un checkpoint de investigación publicado por el autor chengjunyan1 como parte del trabajo *Growing Agent Skill Libraries as Open-Source Projects*. Se trata de un ajuste por refuerzo (GRPO) de pleno parámetro sobre el modelo base Qwen3.8-27B, entrenado para resolver tareas de manipulación robótica de tipo tabletop en el entorno LIBERO escribiendo programas Python sobre una API de robot. El modelo no es un asistente conversacional de propósito general: es una política entrenada dentro de un arnés de agente concreto, con una biblioteca de habilidades versionada que se inyecta en el prompt.

La propuesta técnica es el método ASPIRE-RL: un curador congelado (Claude Opus 5.5) reescribe cada diez pasos una biblioteca de habilidades compartida a partir de los episodios generados por la propia política, y la política se entrena sobre prompts que llevan la versión vigente de esa biblioteca. Esto convierte la mejora de habilidades en un proceso iterativo que combina RL y mantenimiento automatizado de una "librería de código" reutilizable. El checkpoint liberado corresponde al paso 140 de 300, seleccionado por argmax sobre DEV en el rango de pasos 120-300.

El interés del modelo es fundamentalmente metodológico y de reproducibilidad: libera pesos bf16 completos (27,36 mil millones de parámetros, incluida la torre de visión del arquitectura Qwen3.5, aunque la política se usa solo en modo texto) junto con la biblioteca `library/` con la que fue evaluado en TEST. La licencia Apache 2.0 facilita la inspección y la reutilización experimental. No obstante, los resultados de TEST están pendientes en el momento de publicación de la model card y el modelo solo se ha validado en un dominio muy acotado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3_5ForConditionalGeneration), con torre de visión incluida; la política se usa en modo texto |
| Parametros totales | 27.356.728.560 (1.184 tensores) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en servicio (según el comando de ejemplo con `--max-model-len 32768`); la longitud nativa del base Qwen3.8-27B no se detalla en la información disponible |
| Tipos de cuantizacion | Pesos publicados en bf16; no se documentan otras cuantizaciones (GGUF, AWQ, GPTQ) en la información disponible |
| Idiomas soportados | No disponible (la model card no declara idiomas; hereda el tokenizador de Qwen3.8-27B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (dos shards: `model-00001-of-00002.safetensors` y `model-00002-of-00002.safetensors`, más `model.safetensors.index.json`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso de 27,36 mil millones de parámetros con arquitectura `Qwen3_5ForConditionalGeneration`, que incluye una torre de visión aunque en este ajuste la política opera únicamente sobre texto. El entrenamiento es GRPO de pleno parámetro (sin LoRA y sin warm-up supervisado, a diferencia de las variantes de 9B del mismo trabajo), con pesos maestros en fp32 y cómputo en bf16. El stack es verl con FSDP2 y el optimizador AdamW descargado a CPU; los rollouts se generan con vLLM 0.24 en tensor parallel 2 con 4 réplicas. El entrenamiento corrió en un nodo con ocho GPUs RTX PRO 6000 Blackwell de 96 GB.

Los datos son 36 tareas de entrenamiento de LIBERO-90, ninguna de ellas en el conjunto de retención. Cada paso usa 8 prompts × 8 rollouts, con ventajas normalizadas por grupo, una actualización por paso y 300 pasos en total. Se aplica KL de baja varianza de 1e-2 respecto a la política base, learning rate de 1e-6 tras 10 pasos de warm-up con decaimiento coseno hasta 1e-7, y rechazo a nivel de token (cap de ratio de importancia 2.0) y de secuencia (1e-2). Los rollouts usan temperatura 1 y thinking desactivado. La innovación central es el bucle ASPIRE: cada 10 pasos, un curador congelado (Claude Opus 5.5) reescribe la biblioteca de habilidades a partir de los episodios recientes de la política; la nueva versión entra en vigor 2 pasos después con un límite de 32.768 bytes. De 29 rondas, 27 produjeron una versión nueva (las rondas 14 y 26 no cambiaron la biblioteca). El checkpoint liberado es el paso 140, elegido por argmax de DEV (57,80% [48,14, 66,91]) en el rango 120-300 bajo un cap declarado de share no enviado, tras superar la puerta H300.

## Capacidades

- Generación de código ejecutable: produce programas Python sobre una API de robot para tareas de manipulación tabletop en LIBERO.
- Razonamiento multi-paso dentro de un episodio: cada episodio permite hasta 6.144 tokens distribuidos en turnos de hasta 2.048 tokens.
- Uso de una biblioteca de habilidades externa: los ficheros de `library/` se renderizan en el prompt (`README.md` primero; `LIBRARY.json` es solo metadatos y no se renderiza), de modo que el modelo puede reutilizar habilidades previamente escritas.
- Aprendizaje por refuerzo con recompensa basada en resultado (GRPO con ventajas normalizadas por grupo).
- Capacidad multimodal latente: los pesos incluyen la torre de visión de Qwen3.5, pero la política se sirve con `--language-model-only` y se usa en modo texto.
- Modo thinking desactivable: el template de chat admite `enable_thinking: false`, que es la configuración usada en entrenamiento y TEST.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Investigación en aprendizaje por refuerzo para agentes: reproducir el bucle ASPIRE-RL con un curador congelado que reescribe la biblioteca de habilidades cada 10 pasos, usando este checkpoint como referencia del paso 140 y la `library/` v0013 como estado inicial del prompt.
- Manipulación robótica simulada en LIBERO: evaluar políticas que escriben programas Python sobre la API de robot en tareas tabletop de LIBERO-90 y LIBERO-10, con el protocolo de decodificación del paper (temperatura 0, 2.048 tokens por turno, 6.144 por episodio).
- Estudio de bibliotecas de habilidades como artefactos versionados: analizar cómo evoluciona `library/` entre versiones (29 rondas, 27 con cambios) y su efecto sobre la tasa de éxito en DEV y TEST.
- Comparación de métodos de RL a escala 27B: contrastar GRPO de pleno parámetro frente a variantes con LoRA o con warm-up supervisado, usando las filas de 9B del mismo trabajo como referencia.
- Servicio de inferencia con vLLM 0.24: desplegar el checkpoint con `vllm serve ... --language-model-only --max-model-len 32768` y 8 réplicas en tensor parallel 1 sobre H100 de 80 GB, replicando la configuración de TEST.
- Auditoría de reproducibilidad: verificar los hashes sha256 de los dos shards y del índice, y contrastar el número de parámetros (27.356.728.560 en 1.184 tensores) con el base Qwen3.8-27B.
- Docencia y divulgación técnica: usar el par (checkpoint, biblioteca) como ejemplo concreto de cómo un agente puede mejorar su propio código de habilidades mediante RL y curaduría automática.

## Benchmarks y rendimiento

Los resultados de TEST están pendientes según la model card ("TEST (as printed in the paper; protocol in its Appendix): pending"). El único dato numérico publicado es el de DEV para la selección del checkpoint:

| Conjunto | Metrica | Valor |
|---|---|---|
| DEV (paso 140) | Tasa de exito (argmax par-DEV, pasos 120-300) | 57,80% [48,14, 66,91] |
| TEST | Tasa de exito | Pendiente en el momento de la publicacion |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no procede inventarlos: el modelo está entrenado para un dominio muy específico de manipulación robótica y no se ha evaluado como modelo de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 54,7 GB solo de pesos (coincide con el tamaño del repo), más overhead de KV cache y activaciones; en la práctica requiere GPUs de 80 GB para una sola réplica con contexto largo.
- GPUs recomendadas: H100 de 80 GB (configuración usada en TEST: 8 réplicas × tensor parallel 1), RTX PRO 6000 Blackwell de 96 GB (usadas en entrenamiento), A100 de 80 GB como alternativa razonable.
- ¿Cabe en GPU consumer? No en bf16. No se documentan cuantizaciones (GGUF, AWQ, GPTQ) que permitan reducir el modelo a 24 GB o menos; sería necesario generarlas y validar su impacto en la política.
- Opciones de despliegue: vLLM 0.24 (recomendado por el autor, con `--language-model-only` y `--max-model-len 32768`), transformers con `AutoModelForImageTextToText` y `dtype="bfloat16"`, `device_map="auto"`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La configuración de referencia usa vLLM con tensor parallel 2 y 4 réplicas para rollouts durante el entrenamiento, y 8 réplicas × TP 1 en TEST.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chengjunyan1/oss-skills-libero-aspire-rl-27b-s1 | 27,36B (denso) | 32.768 en servicio | Manipulacion robotica LIBERO (code-as-policies) | Apache 2.0 | Pesos bf16 en HF, sin cuantizaciones |
| Qwen/Qwen3.8-27B (modelo base) | 27,36B (denso) | No disponible en la informacion | Proposito general, multimodal | No disponible en la informacion | Disponible en HF |
| Variantes de 9B del mismo trabajo (ASPIRE-RL) | ~9B | No disponible | Manipulacion robotica LIBERO | No disponible en la informacion | Mencionadas en la model card, no detalladas |

No se dispone de datos de benchmarks comparativos entre estas filas en la información proporcionada. La comparación con modelos de propósito general de tamaño similar no es significativa, porque este checkpoint está especializado en un único entorno y no se ha evaluado en tareas estándar de NLP.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado solo con 36 tareas de LIBERO-90 para manipulación tabletop; no es un modelo de propósito general ni un asistente conversacional.
- Resultados de TEST pendientes: la model card indica explícitamente que las celdas de TEST estaban pendientes en el momento de la publicación; el único número disponible es DEV (57,80%).
- Solo semilla 1: el autor declara que es un resultado preliminar y que la semilla 2 no se ejecutó, por lo que no hay estimación de varianza entre semillas.
- Dependencia del arnés y de la biblioteca: el modelo está entrenado para operar dentro de un arnés concreto y con la `library/` renderizada en el prompt; usarlo fuera de ese contexto degradará su comportamiento de forma no documentada.
- Uso en modo texto: aunque los pesos incluyen la torre de visión, la política se sirve con `--language-model-only`; no se ha validado su uso multimodal.
- Riesgo de alucinación: como generador de código, puede producir programas Python sintácticamente válidos pero semánticamente incorrectos sobre la API del robot; no se documentan tasas de error por tipo de fallo.
- Sesgos: no se documenta ninguna evaluación de sesgos; el entrenamiento se limita a un simulador y a tareas de manipulación, por lo que los sesgos relevantes son los del modelo base Qwen3.8-27B, no caracterizados en esta ficha.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.8-27B puede tener sus propias condiciones que conviene revisar antes de un despliegue comercial.
- Sin cuantizaciones publicadas: no hay versiones GGUF, AWQ ni GPTQ, lo que limita el despliegue en hardware de gama media.
- Sin estado del optimizador ni otros pasos: solo se liberan los pesos del paso 140; no se puede reanudar el entrenamiento desde este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chengjunyan1/oss-skills-libero-aspire-rl-27b-s1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de registros: https://huggingface.co/datasets/chengjunyan1/oss-skills-records
- Declaración de TEST (referenciada en la model card): `design/TEST_DECLARATIONS_27B_RL.md` dentro de `chengjunyan1/oss-skills-records`
- Paper *Growing Agent Skill Libraries as Open-Source Projects*: referencia pendiente de publicación según la model card (no disponible)
- Repositorio de código del método (verl, FSDP2, vLLM 0.24): no se proporciona URL en la información disponible
