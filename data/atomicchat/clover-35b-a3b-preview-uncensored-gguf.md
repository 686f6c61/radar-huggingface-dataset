# AtomicChat/Clover-35B-A3B-Preview-Uncensored-GGUF

## Resumen

Clover-35B-A3B-Preview-Uncensored-GGUF es una versión cuantizada en formato GGUF del modelo Diffuspace/Clover-35B-A3B-Preview, un transformer de mezcla de expertos (MoE) de 34.660.610.688 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token. AtomicChat aplica sobre los pesos originales una técnica de "abliteration" basada en la proyección de la dirección de rechazo del flujo residual (Arditi et al., 2024), eliminando el comportamiento de negativa del modelo sin reentrenar. El resultado se distribuye en tres builds GGUF pre-cuantizados y un adaptador LoRA de rango 1 de 110 MB.

El modelo hereda el cuerpo de Qwen3.6-35B-A3B: 40 bloques, tres de cada cuatro con atención lineal Gated DeltaNet y uno con atención completa, 256 expertos enrutados más un experto compartido por bloque. La edición elimina las negativas tanto en prompts de jailbreak como en prompts seguros, manteniendo MMLU prácticamente intacto (80,8 % antes frente a 80,7 % después sobre 2.000 preguntas, McNemar p = 0,92). Es relevante para quienes necesitan un modelo local de gran tamaño con contexto largo, sin restricciones de rechazo y con licencia Apache 2.0.

Los archivos requieren llama.cpp b12052 o superior y se distribuyen con el chat template embebido. La variante con mayor calidad, AD-Q6_K-Q5_K, ocupa 26,3 GB en disco con una divergencia KL de 0,062 frente al BF16 original. El autor reconoce que una de las puertas de calidad no se cumple: en prompts inocuos el primer token se aleja más de lo previsto del modelo original (KL 0,170 frente al límite de 0,10).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con atención lineal Gated DeltaNet (3 de cada 4 bloques) y atención completa (1 de cada 4); 40 bloques |
| Parametros totales | 34.660.610.688 |
| Parametros activos | Aproximadamente 3.000 millones (256 expertos enrutados + 1 compartido por bloque) |
| Longitud de contexto | 32.768 tokens (valor de `-c` en los ejemplos de ejecución); máximo nativo no disponible |
| Tipos de cuantizacion | AD-Q6_K-Q5_K (26,3 GB), AD-Q4_K-IQ4_XS (20,1 GB), AD-IQ3_S-IQ3_XXS (15,5 GB); LoRA rango 1 en GGUF (110 MB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp b12052 o superior); LoRA en GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 40 bloques. Tres de cada cuatro bloques emplean atención lineal Gated DeltaNet y el cuarto atención completa, una arquitectura híbrida que reduce el coste computacional del contexto largo. Cada bloque contiene 256 expertos enrutados más un experto compartido, y escribe en el flujo residual a través de tres proyecciones: la salida de atención (`attn_output` o `ssm_out`), los expertos enrutados (`ffn_down_exps`) y el experto compartido (`ffn_down_shexp`).

La edición de AtomicChat sigue el método de dirección de rechazo de Arditi et al. (2024): localizar la dirección en el flujo residual que determina la negativa y proyectarla fuera de los pesos de escritura de cada bloque. El adaptador resultante es de rango 1 sobre 120 matrices, con escala 1,0. Los builds GGUF incorporan además los ajustes de llama.cpp: clave `expert_shared_count` añadida, 120 tensores de difusión por bloques eliminados y `ssm_a` plegado según el formato actual. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno con chat template embebido en cada archivo GGUF.
- Modo de razonamiento ("thinking") activado por defecto; se desactiva con `--chat-template-kwargs '{"enable_thinking": false}'`.
- Razonamiento de varios pasos y matemáticas (MMLU 80,7 % tras la edición).
- Recuperación en contexto largo sin degradación según el autor ("long-context retrieval is unchanged").
- Comportamiento sin rechazos: 0 negativas sobre 81 prompts de JailbreakBench y 250 de XSTest con thinking desactivado; con thinking activado, 0 de 30.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de visión o audio: no disponible; la arquitectura descrita es solo de texto.

## Casos de uso

- Asistente conversacional local sin filtros: el modelo mantiene conversaciones multi-turno con 32.768 tokens de contexto y no rechaza temas sensibles, adecuado para entornos de investigación que requieren respuestas sin negativas.
- Investigación sobre alineación y seguridad: la comparación entre el modelo original y esta edición (MMLU 80,8 % frente a 80,7 %, KL 0,058 en BF16) permite estudiar el efecto de eliminar la dirección de rechazo con una línea base medible.
- Procesamiento de documentos largos: con 32.768 tokens de contexto y atención lineal en la mayoría de bloques, puede resumir o extraer información de contratos, informes o transcripciones extensas en local.
- Despliegue en estación de trabajo con GPU de consumo: el build AD-IQ3_S-IQ3_XXS ocupa 15,5 GB, lo que permite ejecutarlo en GPUs de 16-24 GB de VRAM mediante llama.cpp.
- Generación creativa sin restricciones: escritura de ficción, guiones o contenido editorial donde los rechazos del modelo base interrumpen el flujo, con la variante AD-Q6_K-Q5_K para máxima fidelidad.
- Fine-tuning con adaptadores: el LoRA de 110 MB puede cargarse sobre cualquiera de los quants del modelo base mediante `--lora-scaled`, sirviendo como punto de partida para ajustes posteriores sin redistribuir los pesos completos.
- Evaluación de robustez frente a jailbreaks: útil como modelo de referencia "sin rechazo" para calibrar clasificadores de seguridad o medir la eficacia de filtros externos.

## Benchmarks y rendimiento

| Metrica | Original BF16 | Editado (LoRA / baked) |
|---|---|---|
| MMLU (2.000 preguntas) | 80,8 % | 80,7 % (McNemar p = 0,92) |
| Negativas en JailbreakBench (81 prompts, thinking off) | 93,8 % | 0 % |
| Negativas en XSTest (250 prompts seguros, thinking off) | 4,4 % | 0 % |
| Negativas con thinking on | 29 de 30 | 0 de 30 |
| Divergencia KL en texto neutro (BF16, solo edición) | — | 0,058 |
| Divergencia KL en prompts inocuos (primer token) | — | 0,170 (límite del autor: 0,10) |

Calidad de cuantización frente al BF16 original (edición + cuantización):

| Build | Tamano en disco | KL divergence | Mismo top-1 |
|---|---:|---:|---:|
| AD-Q6_K-Q5_K | 26,3 GB | 0,062 | 89,11 % |
| AD-Q4_K-IQ4_XS | 20,1 GB | 0,071 | 88,28 % |
| AD-IQ3_S-IQ3_XXS | 15,5 GB | 0,128 | 84,26 % |
| LoRA sobre quants del autor | 110 MB | 0,058 (sobre BF16) | — |

Como referencia, los mismos layouts AD aplicados al modelo original arrojan KL de 0,029, 0,048 y 0,112 respectivamente, por lo que en AD-Q6_K-Q5_K la mayor parte de la distancia corresponde a la edición y no a la cuantización. No se han publicado resultados de MMLU, HumanEval o GSM8K para los builds GGUF concretos en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 16 GB para AD-IQ3_S-IQ3_XXS, 21 GB para AD-Q4_K-IQ4_XS y 27 GB para AD-Q6_K-Q5_K, más overhead de contexto KV.
- GPU recomendadas: A100 40/80 GB o H100 para el build Q6 con contexto completo; RTX 4090 (24 GB) para Q4 y, con contexto reducido, Q6; RTX 3090/4080 (16-24 GB) para IQ3.
- Cabe en GPU de consumo: sí, el build IQ3 en tarjetas de 16 GB y el Q4 en tarjetas de 24 GB.
- Opciones de despliegue: llama.cpp b12052 o superior (`llama-server`, `llama-cli`); compatible con endpoints estilo OpenAI mediante `llama-server`. No hay confirmación de soporte en vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles. El autor indica que la decodificación especulativa (`--spec-type draft-self`) no está disponible en llama.cpp upstream.
- Parámetros de muestreo sugeridos por el autor: `--presence-penalty 0.9 --repeat-penalty 1.05`.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Clover-35B-A3B-Preview-Uncensored (este) | 34,7 B / ~3 B | 32.768 (config. ejemplo) | Apache 2.0 | GGUF + LoRA | Sin rechazos; MMLU 80,7 % |
| Diffuspace/Clover-35B-A3B-Preview (base) | 34,7 B / ~3 B | No disponible | Apache 2.0 | Safetensors / GGUF | Rechazos 93,8 % en JailbreakBench; MMLU 80,8 % |
| AtomicChat/Clover-35B-A3B-Preview-GGUF | 34,7 B / ~3 B | No disponible | Apache 2.0 | GGUF | Quants sin edición; KL 0,029-0,112 según build |
| Qwen3.6-35B-A3B (cuerpo original) | ~35 B / ~3 B | No disponible | No disponible | No disponible | Arquitectura de referencia del cuerpo |

No se dispone de datos de benchmarks comparativos con otras familias de modelos en la información proporcionada.

## Limitaciones y advertencias

- Una puerta de calidad del propio autor no se cumple: en prompts inocuos el primer token diverge del original con KL 0,170, por encima del límite de 0,10 (una dirección aleatoria editada igual daría 0,068).
- El modelo está diseñado explícitamente para no rechazar peticiones; puede generar contenido dañino, ilegal o sexualmente explícito. No debe desplegarse en aplicaciones de cara al público sin filtros externos.
- Riesgo de alucinación no cuantificado en la información disponible; como todo modelo de 35 B, puede inventar hechos y citas.
- Idiomas soportados no declarados; el comportamiento multilingüe no está verificado.
- El modelo base Clover presenta deriva incluso sin edición en esta build de llama.cpp; las comparaciones deben hacerse entre archivos del mismo repositorio.
- Requiere llama.cpp b12052 o superior; los archivos publicados originalmente para el PR #31306 están en la revisión `96a291c` y no son compatibles con el formato actual.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el contenido generado ni sobre el cumplimiento normativo en jurisdicciones que regulan contenido generado.
- Contexto máximo nativo no documentado; los ejemplos usan 32.768 tokens y no se confirma que el modelo soporte más.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AtomicChat/Clover-35B-A3B-Preview-Uncensored-GGUF
- Modelo base: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- Quants sin edición del mismo autor: https://huggingface.co/AtomicChat/Clover-35B-A3B-Preview-GGUF
- Revisión con los archivos originales para el PR: https://huggingface.co/AtomicChat/Clover-35B-A3B-Preview-Uncensored-GGUF/tree/96a291c97e74e9470d530a29f2039ad23e89eadc
- Pull request de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31306
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
- Referencia del método de dirección de rechazo: Arditi et al., 2024 (enlace no disponible en la información proporcionada)
