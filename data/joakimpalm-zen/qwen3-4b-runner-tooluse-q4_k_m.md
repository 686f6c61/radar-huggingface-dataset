# Joakimpalm-Zen/Qwen3-4B-Runner-ToolUse-Q4_K_M

## Resumen

Qwen3-4B-Runner-ToolUse-Q4_K_M es un artefacto de inferencia en formato GGUF que combina el modelo base Qwen/Qwen3-4B cuantizado a Q4_K_M con un adaptador LoRA entrenado específicamente para una tarea estrecha de tool calling sintético. Lo desarrolla Joakimpalm-Zen dentro del proyecto Xyntetik Runner, un motor de inferencia en C11 de binario único que también actúa como entrenador. El interés técnico del artefacto no reside en su calidad como modelo de propósito general, sino en el mecanismo que demuestra: el adaptador se entrenó directamente a través de los pesos cuantizados a 4 bits que luego lo sirven, sin copia en FP16 ni framework de entrenamiento en Python, y el resultado es reproducible byte a byte para una misma compilación.

La tarea objetivo es deliberadamente limitada: cuatro herramientas, 158 ejemplos de entrenamiento generados y 29 prompts de validación. Sobre esa distribución, el adaptador alcanza una puntuación exacta de tool-call de 1.000 frente al 0.690 del base Q4_K_M en modo greedy. Fuera de ella, el adaptador no aporta mejora: en un conjunto desplazado de 274 prompts escritos a mano sobre un catálogo de 23 herramientas con nombres solapados, el base realiza 211 llamadas exactas y el adaptador 200 a través de la API de chat.

El modelo se publica como demostración reproducible de un pipeline de entrenamiento sobre cuantización, no como una mejora general de tool use para Qwen3-4B. La receta (316 pasos con learning rate 1e-4 sobre 158 ejemplos) es de grado memorización: adecuada para fijar un hábito de formato, inadecuada para tareas de conocimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA sobre pesos cuantizados |
| Parametros totales | 16.515.072 (dato del repositorio en safetensors); el modelo base Qwen3-4B declara 4B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (fichero principal); el autor indica merge a F16 o Q8_0, nunca a 4 bits |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye `merged-Q8_0.gguf` y `Qwen3-4B-ToolUse-LoRA.gguf`) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-4B, un transformer decoder-only de la familia Qwen3. Sobre él se aplica un adaptador LoRA entrenado contra el artefacto de inferencia Q4_K_M congelado, ejecutado en CPU por Xyntetik Runner. El forward pass del entrenador es el mismo forward pass de inferencia, de modo que no existe una copia en FP16 intermedia ni un proceso de merge previo al entrenamiento. La receta emplea 316 pasos con learning rate 1e-4 sobre 158 ejemplos generados sintéticamente para cuatro herramientas, con 29 prompts reservados para evaluación.

La reproducibilidad byte a byte es una propiedad de la compilación: ejecutar el mismo comando con las mismas entradas y el mismo build produce el mismo fichero, hash a hash. Un tester independiente reprodujo los bytes en una Tesla T4 y comprobó que una recompilación con un perfil de instrucciones distinto genera bytes de adaptador diferentes. El autor documenta además que el merge debe hacerse a F16 o Q8_0, nunca a 4 bits, por borrado medido de la adaptación.

## Capacidades

- Tool calling y function calling restringido al formato aprendido durante el entrenamiento (cuatro herramientas del conjunto sintético).
- Generación de llamadas exactas en el template de chat empleado en el entrenamiento, con puntuación de 1.000 en el conjunto de validación de 29 prompts en modo greedy.
- Capacidades heredadas del base Qwen3-4B en generación de texto, razonamiento y código, sin mejora atribuible al adaptador.
- Entrenamiento continuado y serving por petición del adaptador mediante las opciones `--train`, `--lora` y `--merge-lora` de Xyntetik Runner.
- Firma de adaptadores y registro de procedencia para auditoría del entrenamiento.
- No se documentan capacidades de visión, audio ni modo thinking específicas en la informacion proporcionada.

## Casos de uso

- Reproducción de experimentos de entrenamiento: sirve para verificar el mecanismo de entrenamiento LoRA sobre pesos cuantizados ejecutando el mismo comando y comparando hashes, lo que permite auditar pipelines de ajuste sin infraestructura GPU de 16 bits.
- Validación de tool calling en un dominio cerrado: con cuatro herramientas fijas y un formato estable, el adaptador produce llamadas exactas de forma consistente, adecuado para prototipos de agentes con catálogo reducido y bien definido.
- Docencia y divulgación técnica: el par adaptador más registro de procedencia permite mostrar de extremo a extremo cómo se entrena, sirve y mergea un LoRA sobre un GGUF de 4 bits.
- Pruebas de regresión de motores de inferencia: los ficheros `merged-Q8_0.gguf` y `Qwen3-4B-ToolUse-LoRA.gguf` están asignados a filas del roster de soporte de Runner con revalidación por release, útiles como caso de prueba de compatibilidad.
- Despliegue en CPU sin GPU: al ser GGUF Q4_K_M servible con Runner en un binario C11, encaja en entornos sin acelerador donde solo se necesita el hábito de formato de llamada, no conocimiento general.
- Estudio de generalización fuera de distribución: el conjunto desplazado de 274 prompts sobre 23 herramientas sirve como banco de pruebas para medir cuánto de un adaptador de formato se transfiere y cuánto se degrada al cambiar el catálogo.
- Base para adaptadores propios: el walkthrough de entrenamiento sobre GGUF cuantizado permite reutilizar el pipeline con datos propios partiendo del mismo artefacto.

## Benchmarks y rendimiento

| Evaluacion | Base Qwen3-4B Q4_K_M | Con adaptador |
|---|---|---|
| Tool-call exacto en tarea propia (29 prompts, greedy) | 0.690 | 1.000 |
| Llamadas exactas en conjunto desplazado, API de chat (274 prompts, 23 herramientas) | 211 | 200 |
| Llamadas exactas en conjunto desplazado, template de entrenamiento | 170 | 176 (dentro del ruido) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 4.5 GB; el fichero Q4_K_M de un modelo de 4B se sitúa en torno a 2.5-3 GB de pesos, con overhead de contexto adicional no especificado.
- Cabe en GPU de consumo: el autor reporta reproducción del entrenamiento en una Tesla T4; la inferencia Q4_K_M es viable en tarjetas con 6-8 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 8 GB para el fichero Q4_K_M; el fichero `merged-Q8_0.gguf` requiere más memoria y no se especifica cifra.
- Despliegue: Xyntetik Runner (binario C11, soporte de `--train`, `--lora`, `--merge-lora`); al ser GGUF, es compatible con el ecosistema llama.cpp, aunque la validación documentada por el autor es la del roster de Runner.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Runner-ToolUse-Q4_K_M | 4B (base) | no disponible | LoRA de tool calling sobre GGUF Q4_K_M | Apache 2.0 | Hugging Face, 411 descargas |
| Qwen/Qwen3-4B | 4B | no disponible | Modelo base generalista | Apache 2.0 | Hugging Face |
| Adaptadores LoRA convencionales sobre Qwen3-4B | 4B (base) | no disponible | Entrenamiento en FP16 con merge y cuantización posterior | según autor | Hugging Face |

La diferencia relevante frente a un flujo LoRA convencional no es de rendimiento sino de procedimiento: aquí el adaptador se entrena contra el artefacto cuantizado que lo sirve y la reproducibilidad se limita a una compilación concreta. No se dispone de datos de benchmarks comparativos con otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador no mejora al base fuera de su distribución: en 274 prompts con 23 herramientas, el base realiza más llamadas exactas (211 frente a 200).
- La receta de 316 pasos sobre 158 ejemplos es de grado memorización; no debe esperarse generalización a catálogos de herramientas distintos ni a dominios de conocimiento.
- El merge a 4 bits borra la adaptación de forma medida; solo se recomienda F16 o Q8_0.
- La reproducibilidad byte a byte depende del build: perfiles de instrucciones distintos generan bytes de adaptador diferentes.
- Riesgo de alucinación y sesgos: no documentados específicamente en la informacion proporcionada; se heredan los del base Qwen3-4B.
- Idiomas soportados no declarados; el entrenamiento se realizó sobre un conjunto sintético de dominio estrecho.
- La licencia Apache 2.0 permite uso comercial, pero el autor desaconseja explícitamente presentar el artefacto como mejora general de tool use.
- El dato de parámetros totales del repositorio (16.515.072) no coincide con el tamaño nominal de 4B del base; conviene verificar el contenido real de los ficheros antes de dimensionar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Joakimpalm-Zen/Qwen3-4B-Runner-ToolUse-Q4_K_M
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio Xyntetik Runner: https://github.com/Joakimpalm-Zen/xyntetik-runner
- Guía completa de adaptadores: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/lora.md
- Walkthrough de entrenamiento LoRA sobre GGUF cuantizado: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/train-lora-on-quantized-gguf.md
- Sección de adaptación del manual: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/MANUAL.md#adaptation
- Conjunto desplazado de evaluación: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/evals/tooluse-shifted/README.md
- Roster de soporte de modelos: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/model-support.md
- Registro de entrenamiento y evaluaciones (dataset): https://huggingface.co/datasets/Joakimpalm-Zen/Qwen3-4B-ToolUse-LoRA-training-record
- Colección Runner Releases: https://huggingface.co/collections/Joakimpalm-Zen/runner-releases-6aa98baaed03bba0e8a561ae
- Colección LoRA Training on Quantized Weights: https://huggingface.co/collections/Joakimpalm-Zen/xyntetik-research-lora-training-on-quantized-weights-6aa98bb02859827a8d86618c
- Resultados de la comunidad: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/community-results.md
