# AnirudhNarayan/Qwen_2b_ASR_change_experiment

## Resumen

Qwen_2b_ASR_change_experiment es un repositorio de investigación publicado por AnirudhNarayan que contiene dos checkpoints derivados de Qwen/Qwen3-VL-2B-Instruct: un fine-tune con VLGuard-SFT (etiquetado como `base/`) y una variante del mismo modelo en la que se han anulado por completo los 11 tensores de la capa 16 del decodificador de texto (etiquetado como `layer16_zero/`). No es un modelo pensado para producción, sino un experimento educativo de edición de pesos orientado a medir la fragilidad del comportamiento de rechazo (refusal) ante una ablación tosca de una sola capa.

El modelo subyacente es un transformer multimodal de 2B parámetros con arquitectura `Qwen3VLForConditionalGeneration`, 28 capas de texto, dimensión oculta 2048 y precisión bf16. El fine-tune de seguridad se realizó con LoRA y se fusionó a bf16. El repositorio ocupa 8,5 GB e incluye los pesos en safetensors, junto con un resumen de resultados en `asr_summary.json` y una gráfica de barras de ASR.

La relevancia del experimento radica en su hallazgo: anular una única capa intermedia (la 16) hace que la tasa de éxito de ataque (ASR) global pase del 7,3 % al 15,7 % sobre 300 prompts dañinos multimodales, concentrado casi todo el efecto en FigStep (14 % a 40 %). Es decir, el modelo sigue siendo funcional pero su alineamiento de seguridad se degrada de forma medible con una intervención trivial sobre los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (`Qwen3VLForConditionalGeneration`), 28 capas de texto, hidden size 2048 |
| Parametros totales | 2B (modelo base Qwen3-VL-2B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El checkpoint `base/` es un fine-tune con VLGuard-SFT de Qwen/Qwen3-VL-2B-Instruct, aplicado mediante LoRA y fusionado a bf16. La arquitectura es la del modelo base: un transformer multimodal con 28 capas de decodificador de texto, dimensión oculta 2048, atención con `q_norm` y `k_norm`, y sub-bloques MLP con proyecciones gate/up/down. El modelo procesa entradas imagen-texto (`image-text-to-text`) y genera texto.

La variante `layer16_zero/` se construyó poniendo a cero los 11 tensores bajo el prefijo `model.language_model.layers.16.`: las proyecciones q, k, v y o de la atención, las dos normalizaciones RMSNorm (`q_norm`, `k_norm`), las tres proyecciones del MLP (`gate_proj`, `up_proj`, `down_proj`) y las dos capas de normalización (`input_layernorm`, `post_attention_layernorm`). Los otros 614 tensores se copiaron bit a bit del checkpoint base, verificado por sha256. El efecto técnico es que las dos RMSNorm a cero escalan a 0 las entradas de los sub-bloques de atención y MLP, de modo que ambos devuelven 0 y el flujo residual atraviesa la capa 16 sin cambios: la edición equivale a eliminar la capa 16 (convertirla en identidad). No se documentan datos de entrenamiento adicionales, número de tokens, composición del dataset ni fases de RLHF/DPO más allá del VLGuard-SFT del checkpoint base.

## Capacidades

- Generación de texto e imagen-texto: hereda las capacidades del modelo base Qwen3-VL-2B-Instruct para tareas de comprensión de imagen y texto.
- Comportamiento de rechazo (refusal) ante prompts dañinos, entrenado vía VLGuard-SFT en el checkpoint `base/`.
- El checkpoint `layer16_zero/` conserva la funcionalidad general del modelo (32 de las 40 respuestas "compliant" en FigStep son coherentes), pero con el comportamiento de rechazo debilitado.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, modo thinking, audio ni otras capacidades especiales.
- Idiomas soportados: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en seguridad de modelos multimodales: comparar el ASR del checkpoint `base/` frente a `layer16_zero/` para cuantificar cuánto depende el refusal de una sola capa intermedia.
- Estudios de edición de pesos (weight editing): usar la ablación de la capa 16 como referencia reproducible de una intervención mínima sobre los pesos y medir su impacto conductual.
- Auditoría de robustez de fine-tunes de seguridad: evaluar si un SFT con VLGuard mantiene su alineamiento tras perturbaciones estructurales del modelo.
- Docencia y formación: ilustrar en cursos de seguridad de IA cómo una modificación de 11 tensores altera la tasa de cumplimiento ante ataques de jailbreak multimodal.
- Desarrollo de metodologías de evaluación: servir como caso de prueba para validar jueces automáticos de refusal (el autor usa un juez por palabras clave) y para diseñar evaluaciones con juez LLM.
- Reproducción de experimentos de ablación: el repositorio incluye `asr_summary.json` y la gráfica de barras, lo que permite replicar el pipeline de evaluación sobre FigStep, MM-SafetyBench y JB-Mini.

## Benchmarks y rendimiento

Resultados de Attack Success Rate (ASR) sobre 100 prompts dañinos por conjunto (FigStep, MM-SafetyBench, JB-Mini), decodificación por muestreo con temperatura 0,7, top-p 0,8, top-k 20, semilla 42, máximo 1024 tokens nuevos, bf16. ASR más alto indica menor seguridad.

| Version | FigStep | MM-SafetyBench | JB-Mini | Overall (300) |
|---|---|---|---|---|
| base | 14,0 % (14/100) | 0,0 % (0/100) | 8,0 % (8/100) | 7,3 % (22/300) |
| layer16_zero | 40,0 % (40/100) | 0,0 % (0/100) | 7,0 % (7/100) | 15,7 % (47/300) |
| Delta | +26,0 | 0,0 | -1,0 | +8,4 |

Excluyendo salidas degeneradas (solo cumplimiento dañino coherente), el ASR global pasa de 6,7 % a 12,7 %. No se publican resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 8,5 GB en bf16 para los dos checkpoints, por lo que un solo checkpoint en bf16 ronda los 4-5 GB de pesos.
- GPU recomendadas: no especificadas en la información disponible; por tamaño (2B) es viable en GPU de consumo.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM en bf16, aunque no se documenta una estimación oficial.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText`, `AutoProcessor`) con `subfolder="base"` o `subfolder="layer16_zero"`, `dtype="auto"` y `device_map="auto"`. No se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ASR global (300 prompts) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen_2b_ASR_change_experiment (`base/`) | 2B | no disponible | 7,3 % | apache-2.0 | Hugging Face |
| Qwen_2b_ASR_change_experiment (`layer16_zero/`) | 2B | no disponible | 15,7 % | apache-2.0 | Hugging Face |
| Qwen/Qwen3-VL-2B-Instruct (modelo base) | 2B | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparables con otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint `layer16_zero/` es un modelo deliberadamente debilitado en seguridad y no debe desplegarse en producción.
- El repositorio tiene fines exclusivamente educativos y de investigación en seguridad.
- El juez de refusal es una regla de palabras clave (substring match), no un juez LLM, lo que puede introducir falsos positivos y negativos.
- Los resultados provienen de una única semilla (42) y de decodificación por muestreo, por lo que la variabilidad entre ejecuciones no está cuantificada.
- Se trata de una ablación de una sola capa, no de un ataque entrenado; los resultados no deben generalizarse a otros tipos de manipulación de pesos.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Idiomas soportados y limitaciones de contexto: no disponibles en la información proporcionada.
- La licencia apache-2.0 permite uso comercial del artefacto, pero su naturaleza de experimento de seguridad desaconseja cualquier uso distinto de la investigación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AnirudhNarayan/Qwen_2b_ASR_change_experiment
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Checkpoint sin modificar: https://huggingface.co/AnirudhNarayan/Qwen_2b_ASR_change_experiment/tree/main/base
- Checkpoint con capa 16 anulada: https://huggingface.co/AnirudhNarayan/Qwen_2b_ASR_change_experiment/tree/main/layer16_zero
- Resumen de resultados: https://huggingface.co/AnirudhNarayan/Qwen_2b_ASR_change_experiment/blob/main/asr_summary.json
- Gráfica de ASR: https://huggingface.co/AnirudhNarayan/Qwen_2b_ASR_change_experiment/blob/main/asr_bar.png
