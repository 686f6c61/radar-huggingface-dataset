# SargeDev/Arete-Dflash2

## Resumen

Arete-Dflash2 es un modelo borrador (draft model) de decodificación especulativa desarrollado por SargeDev, diseñado para acelerar la inferencia de la familia de modelos verificadores Arete-27B y Qwen3.8-27B. Con 1.924.404.480 parámetros (aproximadamente 1,92B), su función no es generar respuestas finales, sino proponer bloques de tokens que un modelo mayor (el verificador) valida en una sola pasada forward, aceptando un prefijo. El resultado son aceleraciones sin pérdida de calidad: la salida es idéntica a la del modelo objetivo sin borrador.

El modelo se basa en la arquitectura DFlash2 de Z-Lab, concretamente en la variante afinada por incoai (incoai/Qwen3.8-27B-DFlash2), y ha sido reentrenado por SargeDev durante 7 épocas sobre datos regenerados on-policy de Arete-27B-Uncensored. Se distribuye en formato safetensors con exportación z-lab (`DFlash2DraftModel` + `dflash_config`), lo que lo hace directamente compatible con la configuración `--speculative-config` de vLLM.

Su relevancia actual reside en que permite reducir la latencia de modelos de 27B en producción sin degradar la calidad de salida, siempre que el contenido se parezca al estilo de entrenamiento del borrador (contenido técnico estructurado funciona mejor que prosa libre). La licencia es Apache-2.0 para el borrador, aunque el modelo objetivo Arete-27B original es cc-by-nc-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2 draft model (decodificacion especulativa, exportacion z-lab `DFlash2DraftModel`) |
| Parametros totales | 1.924.404.480 (~1,92B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo verificador; probado con 262k en el target) |
| Tipos de cuantizacion | no disponible (repo en safetensors; el modelo base se distribuye en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (borrador); modelo objetivo Arete-27B original cc-by-nc-4.0 |
| Formato de pesos | safetensors (exportacion z-lab con `dflash_config`) |

## Arquitectura y entrenamiento

Arete-Dflash2 es un modelo borrador de decodificación especulativa construido sobre la arquitectura DFlash2 de Z-Lab. En lugar de ser un transformer generativo convencional, propone bloques de tokens (bloques de 7 tokens) que el verificador puntúa en una única pasada forward y acepta como prefijo. Esto permite aceleraciones sin pérdida: la salida es idéntica a la del modelo objetivo. El modelo se exporta en el formato z-lab (`DFlash2DraftModel` + `dflash_config`) y es drop-in para la configuración `--speculative-config` de vLLM.

El entrenamiento consistió en un finetune de 7 épocas sobre 6.903 filas generadas on-policy a partir de Arete-27B-Uncensored (con las filas de bucle cuarentenadas). Los hidden states se extrajeron de las capas 6, 20, 34, 48, 62 y 64 del modelo objetivo, y el corpus procede de la línea `SargeDev/jev-distill-corpus-v3`. El entrenamiento se realizó con el trainer `vllm-project/speculators` 0.9.0a0, tipo de speculator DFlash2, sobre un clúster de 2x GB10 con vLLM 0.28. No se especifican datos sobre RLHF o DPO.

## Capacidades

- Decodificación especulativa: propone bloques de 7 tokens para verificación por parte de un modelo objetivo mayor.
- Aceleración sin pérdida: la salida es idéntica a la del objetivo sin borrador (verificado con 5/5 prompts en modo greedy).
- Compatibilidad drop-in con vLLM mediante `--speculative-config` con método `dflash`.
- Compatible con múltiples objetivos: Arete-27B-Uncensored, Arete-27B (censored), Qwen3.8-27B y Qwen3.8-27B-Uncensored.
- Rendimiento dependiente del estilo del prompt: mejor aceptación en contenido técnico estructurado que en prosa libre.
- No es un modelo generativo autónomo: no está pensado para uso directo sin un verificador.
- Soporte de tool calling, agentes, visión o audio: no disponible (no aplica a un draft model).

## Casos de uso

- Aceleración de inferencia en producción de modelos de 27B: desplegar Arete-27B o Qwen3.8-27B con vLLM y este borrador permite reducir la latencia manteniendo la salida idéntica, útil en servicios interactivos de alta concurrencia.
- Generación de código y contenido técnico estructurado: el borrador alcanza aceptaciones de hasta 4,71 tokens por bloque (53,0% de tasa de borrador) en ventanas estructuradas, por lo que es especialmente rentable en pipelines de generación de código o documentación técnica.
- Cargas de trabajo de seguridad y pentesting: probado en vivo con prompts de pentesting sobre Arete-27B-Uncensored bf16 TP2 con contexto de 262k, con aceptación de 2,6–3,9 tokens por bloque en ventanas generales.
- Servicios de chat con contexto largo: al heredar la ventana del verificador (probado a 262k), permite conversaciones multi-turno extensas con menor latencia por token generado.
- Despliegue en clústeres pequeños: entrenado y validado en un clúster de 2x GB10, lo que lo hace adecuado para infraestructuras modestas que sirven modelos de 27B con decodificación especulativa.
- Sustitución de borradores genéricos: al estar afinado sobre datos on-policy del objetivo, mejora la tasa de aceptación frente a un borrador genérico en dominios técnicos alineados con su corpus de entrenamiento.

## Benchmarks y rendimiento

Matriz de benchmarks (vLLM 0.28, GB10, servicio de un solo objetivo, bloques de 7 tokens, greedy):

| Objetivo | accept_len | draft rate |
|---|---|---|
| Arete-27B-Uncensored | 3,00 | 28,6% |
| Arete-27B (censored) | 2,97 | 28,2% |
| Qwen3.8-27B | 3,80 | 40,0% |

Pruebas en vivo sobre Arete-27B-Uncensored bf16 TP2 (contexto 262k, carga de pentesting):

| Tipo de ventana | accept_len | draft rate |
|---|---|---|
| Ventanas estructuradas | hasta 4,71 | 53,0% |
| Ventanas generales | 2,6–3,9 | 23–41% |

La pérdida de calidad (losslessness) en modo greedy se verificó con 5/5 prompts idénticos a la salida del objetivo sin borrador en todas las combinaciones de objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~1,92B parámetros, en bf16 ocuparía aproximadamente 3,8 GB de pesos (coincide con el tamaño del repo), más overhead de activaciones y KV cache del verificador.
- GPU recomendadas: el autor reporta entrenamiento y validación en un clúster de 2x GB10; no se especifican GPU de consumo concretas.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; por tamaño de pesos (≈3,8 GB en bf16) sería viable en GPUs con suficiente VRAM, pero el requisito real lo marca el modelo verificador de 27B, no el borrador.
- Opciones de despliegue: vLLM 0.28 con `--speculative-config '{"method": "dflash", "model": "SargeDev/Arete-Dflash2", "num_speculative_tokens": 7}'`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras absolutas de latencia o tokens por segundo; solo tasas de aceptación y longitudes medias de aceptación.

## Comparativa con modelos similares

| Modelo | Parámetros | Función | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SargeDev/Arete-Dflash2 | ~1,92B | Borrador DFlash2 afinado | no disponible (hereda del target) | Apache-2.0 | Hugging Face |
| incoai/Qwen3.8-27B-DFlash2 | ~1,92B (según model card) | Borrador DFlash2 base | no disponible | no disponible | Hugging Face |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible | Borrador DFlash2 original | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos borradores en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo autónomo: requiere un verificador compatible (Arete-27B, Arete-27B-Uncensored, Qwen3.8-27B o Qwen3.8-27B-Uncensored); su uso aislado no produce respuestas útiles.
- Rendimiento dependiente del dominio: la tasa de aceptación cae en prosa libre (2,6–3,9 accept_len, 23–41%) frente a contenido técnico estructurado (hasta 4,71 accept_len, 53,0%).
- Licencia del objetivo: aunque el borrador es Apache-2.0, Arete-27B original es cc-by-nc-4.0, lo que restringe el uso comercial del sistema completo si se emplea ese verificador.
- Sesgos conocidos: no disponibles; al estar entrenado sobre datos on-policy de Arete-27B-Uncensored, puede heredar sesgos del corpus de destilación.
- Riesgo de alucinación: no aplica directamente al borrador, ya que el verificador valida los tokens; la calidad final depende del modelo objetivo.
- Idiomas soportados: no disponibles; la cobertura lingüística dependerá del verificador y del corpus de entrenamiento.
- Contexto: no se especifica una longitud propia; el límite práctico lo impone el modelo objetivo (probado a 262k).
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado el 2026-11-16; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SargeDev/Arete-Dflash2
- Modelo base (incoai): https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Borrador original Z-Lab: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Objetivo Arete-27B-Uncensored-V2: https://huggingface.co/SargeDev/Arete-27B-Uncensored-V2
- Objetivo Arete-27B (NousResearch): https://huggingface.co/NousResearch/Arete-27B
- Objetivo Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Corpus de entrenamiento: `SargeDev/jev-distill-corpus-v3` (referenciado en la model card, sin URL directa)
- Trainer vllm-project/speculators: https://github.com/vllm-project/speculators
