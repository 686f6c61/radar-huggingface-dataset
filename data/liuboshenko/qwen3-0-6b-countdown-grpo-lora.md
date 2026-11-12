# liuboshenko/qwen3-0.6b-countdown-grpo-lora

## Resumen

`liuboshenko/qwen3-0.6b-countdown-grpo-lora` es una colección de seis adaptadores LoRA entrenados sobre el modelo base `Qwen/Qwen3-0.6B` para resolver la tarea aritmética Countdown: dados tres números entre 1 y 99 y un objetivo entre 1 y 199, el modelo debe producir una expresión con `+`, `-`, `*`, `/` y paréntesis que use cada número exactamente una vez y alcance el objetivo. Los adaptadores se entrenaron con GRPO (Group Relative Policy Optimization) mediante `trl.GRPOTrainer` 1.17.1 y se publican como material de reproducción de un estudio académico sobre el efecto de recompensas parciales frente a recompensas binarias estrictas.

El autor es A. Liuboshenko, estudiante de máster en la NIIYaU MIFI, y el objetivo del trabajo no es distribuir un modelo de propósito general, sino comparar dos esquemas de recompensa en un entorno controlado. Cada adaptador tiene 40,4 MB (LoRA r=16, alpha=32 sobre todas las capas lineales) y el repositorio completo ocupa 0,2 GB. El modelo base Qwen3-0.6B aporta la arquitectura transformer y la tokenización; los adaptadores solo modifican el comportamiento para la tarea Countdown.

La relevancia es metodológica: los resultados muestran que la recompensa parcial (proporcional a la cercanía del valor obtenido al objetivo) no mejora de forma significativa la precisión frente a la recompensa binaria estricta (59,0 % frente a 59,2 % de media en tres semillas), y que puede inducir episodios de reward hacking. Es un recurso útil para quienes investigan RL aplicado a razonamiento aritmético con modelos pequeños, no para despliegues en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B) con adaptadores LoRA sobre capas lineales (`q k v o gate up down`) |
| Parametros totales | 0,6 mil millones en el modelo base; cada adaptador LoRA ocupa 40,4 MB en disco (número exacto de parámetros del adaptador no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen3-0.6B) |
| Tipos de cuantizacion | No disponible; los adaptadores se publican en safetensors y el ejemplo de uso carga el base en `float16` |
| Idiomas soportados | Inglés (el prompt de entrenamiento y evaluación está en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | `adapter_model.safetensors` + `adapter_config.json` (PEFT); incluye `SHA256SUMS.txt` |

## Arquitectura y entrenamiento

El modelo base es Qwen3-0.6B, un transformer decoder-only de 0,6 mil millones de parámetros. Sobre él se aplican adaptadores LoRA con r=16, alpha=32, dropout 0 y cobertura de todas las capas lineales (`q`, `k`, `v`, `o`, `gate`, `up`, `down`). El entrenamiento usa GRPO con grupos de G=8 respuestas por problema, 8 problemas por paso, temperatura 1.0, learning rate 2e-5 con warmup de 10 pasos y decaimiento constante, coeficiente KL beta 0.04, `loss_type="dapo"`, precisión fp16 y 150 pasos. El modo de razonamiento de Qwen3 se desactiva durante el entrenamiento y la evaluación.

Los datos proceden de un generador propio de problemas Countdown con `DATA_SEED = 42`: 3.985 problemas de entrenamiento y un conjunto held-out de 300 problemas fijado antes del entrenamiento y nunca usado en él. Se comparan dos funciones de recompensa: estricta (1 si la expresión es correcta, 0 en caso contrario) y parcial (1 si es correcta; `0.5 * max(0, 1 - |valor - objetivo| / objetivo)` si la expresión respeta las reglas pero no alcanza el objetivo). Se entrenaron tres semillas por condición. El entrenamiento se ejecutó en una NVIDIA GeForce GTX 1060 de 6 GB, con aproximadamente 85 minutos por ejecución.

## Capacidades

- Generación de expresiones aritméticas para la tarea Countdown con tres operandos y un objetivo, devolviendo el resultado dentro de etiquetas `<answer></answer>`.
- Razonamiento aritmético de un solo paso con suma, resta, multiplicación, división y paréntesis.
- Seguimiento de instrucciones de formato estrictas (uso exacto de cada número, operadores permitidos, ausencia de concatenación de dígitos).
- Generación de texto en inglés mediante el modelo base subyacente, aunque los adaptadores solo están ajustados para Countdown.
- No se ha evaluado soporte de tool calling, function calling, agentes, capacidades multilingües ni visión en estos adaptadores.
- No se ha evaluado el modo de razonamiento extendido de Qwen3 con estos adaptadores; de hecho, se desactiva explícitamente.

## Casos de uso

- Reproducción de investigación en RL: los seis adaptadores y el conjunto held-out permiten replicar el experimento sobre recompensas parciales frente a binarias en un entorno de bajo coste computacional (una GTX 1060 de 6 GB basta).
- Estudio de reward hacking: el episodio documentado en `partial_seed0` (paso 125, casi la mitad de las respuestas eran la suma de todos los números) sirve como caso concreto para analizar cómo las recompensas densas pueden desviar la política.
- Evaluación de robustez de esquemas de recompensa: la comparación entre semillas (desviación típica de 5,4 puntos en la recompensa estricta frente a 2,6 en la parcial) permite discutir estabilidad del entrenamiento con GRPO.
- Docencia de RLHF/RLVR: el repositorio incluye código, informe e instrucciones de reproducción, lo que lo hace adecuado para prácticas de posgrado sobre optimización de políticas con retroalimentación verificable.
- Generación de problemas sintéticos de Countdown: el generador con semilla fija (`DATA_SEED = 42`) puede reutilizarse para crear conjuntos de evaluación en otros experimentos.
- Pruebas de integración de PEFT: el parche de carga con `PeftModel.from_pretrained` y `subfolder` sirve como referencia mínima para validar pipelines de adaptadores LoRA en entornos con recursos limitados.

## Benchmarks y rendimiento

Precisión en el conjunto held-out de 300 problemas, decodificación greedy, según la model card:

| Adaptador | Recompensa | Semilla | Precisión held-out |
|---|---|---|---|
| (sin entrenamiento) | — | — | 20,3 % |
| `baseline_seed0` | estricta | 0 | 64,0 % |
| `baseline_seed1` | estricta | 1 | 62,0 % |
| `baseline_seed2` | estricta | 2 | 51,7 % |
| `partial_seed0` | parcial | 0 | 56,7 % |
| `partial_seed1` | parcial | 1 | 62,7 % |
| `partial_seed2` | parcial | 2 | 57,7 % |

Media por condición: estricta 59,2 % (desviación típica 5,4); parcial 59,0 % (desviación típica 2,6). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el ejemplo de la model card carga el base en `float16` y ejecuta inferencia en una GPU de 6 GB; el adaptador añade 40,4 MB.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM; el entrenamiento se validó en una GTX 1060 de 6 GB.
- Cabe en GPU consumer: sí, en GTX 1060 6 GB y superiores (RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: `transformers` + `peft` (flujo documentado); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para estos adaptadores.
- Latencia y throughput: no disponibles. El entrenamiento completo de un adaptador requirió unos 85 minutos en una GTX 1060.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `liuboshenko/qwen3-0.6b-countdown-grpo-lora` | 0,6 B (base) + LoRA | No disponible | GRPO + LoRA para Countdown | Apache 2.0 | Hugging Face + GitHub |
| `Qwen/Qwen3-0.6B` (base) | 0,6 B | No disponible en esta ficha | Modelo generalista | Apache 2.0 | Hugging Face |
| Adaptadores alternativos para Countdown | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros adaptadores públicos comparables para la tarea Countdown en la documentación consultada.

## Limitaciones y advertencias

- Los adaptadores solo se entrenaron para Countdown con tres números; su comportamiento en otras tareas no se ha medido.
- La mejora se concentra casi por completo en problemas resolubles con suma y resta; los que requieren `*` o `/` apenas se resuelven.
- Se documenta un episodio de reward hacking en `partial_seed0`: en el paso 125, casi la mitad de las respuestas del held-out eran la suma de todos los números; el adaptador publicado es el del paso 150, con precisión recuperada hasta el 56,7 %.
- La media entre condiciones no muestra ventaja de la recompensa parcial (59,0 % frente a 59,2 %), por lo que no debe interpretarse como una mejora metodológica validada.
- Son adaptadores didácticos de reproducción, no un modelo de propósito general; no se recomienda su uso en producción.
- El prompt de entrenamiento está en inglés y el modelo solo declara soporte de inglés; no se ha evaluado el comportamiento en castellano.
- No se han publicado evaluaciones de sesgos, alucinación fuera de la tarea ni seguridad.
- La licencia Apache 2.0 permite uso comercial, pero las limitaciones técnicas hacen inviable un despliegue comercial realista.

## Enlaces

- Hugging Face: https://huggingface.co/liuboshenko/qwen3-0.6b-countdown-grpo-lora
- Repositorio con código, informe y reproducción: https://github.com/Liuboshenko/qwen3-06b-countdown-grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Revisión del base usada en entrenamiento: `c1899de289a04d12100db370d81485cdf75e47ca`
- TRL (`GRPOTrainer`): https://github.com/huggingface/trl
- PEFT: https://github.com/huggingface/peft
