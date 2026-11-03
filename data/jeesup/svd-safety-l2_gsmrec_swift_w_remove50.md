# Jeesup/svd-safety-l2_gsmrec_swift_w_remove50

## Resumen

`Jeesup/svd-safety-l2_gsmrec_swift_w_remove50` es un artefacto de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, comprimido mediante la técnica Swift-SVD con una eliminación del 50 % de los parámetros y posteriormente sometido a un ajuste de recuperación con LoRA sobre el conjunto de entrenamiento de GSM8K (7.473 problemas en formato Alpaca, corte de 512 tokens, partición de validación de 500). El modelo resultante tiene 6.738.415.616 parámetros reales según los pesos en safetensors y se distribuye bajo la Llama 2 Community License.

El modelo no está pensado como asistente de propósito general. Forma parte del proyecto `svd_safety` (job `gsmrec_slurm.sh`) y su model card advierte explícitamente de que algunas "celdas" del espacio de experimentación están deliberadamente degradadas en seguridad o sobre-rechazan peticiones, por lo que debe evaluarse antes de cualquier uso. La calibración del SVD se realizó únicamente con WikiText-2 (semilla 42), lo que limita la representatividad del corpus de calibración.

Su relevancia es fundamentalmente metodológica: permite estudiar el compromiso entre compresión agresiva, recuperación de capacidades aritméticas (GSM8K) y alineamiento de seguridad en un transformer decoder de 7B. Los resultados medidos (PPL de 20,03 en WikiText-2, media zero-shot de 39,76 en 7 tareas, ASR de 0,38 en AdvBench y 5,11 en StrongREJECT) deben interpretarse como datos de un experimento controlado, no como prestaciones de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 2), comprimido con Swift-SVD al 50 % de parámetros |
| Parametros totales | 6.738.415.616 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama-2-7b-chat: 4.096 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible (no se declara lista de idiomas) |
| Licencia | Llama 2 Community License (incluye LICENSE.txt y USE_POLICY.md) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La base es un transformer decoder de la familia Llama 2 (7B, chat), al que se aplica Swift-SVD con eliminación del 50 % de parámetros. La calibración se hizo exclusivamente con WikiText-2 (configuración "W"), semilla 42. Sobre el modelo comprimido se entrena una LoRA de recuperación con GSM8K train (7.473 problemas, formato Alpaca, cutoff 512, split de validación de 500) en lugar de alpaca-cleaned, y la LoRA se fusiona en los pesos finales. No se documentan en la información disponible el número de tokens de entrenamiento total, la composición completa del dataset ni si hubo RLHF o DPO adicionales.

La innovación técnica principal es el pipeline de compresión más recuperación: en lugar de un fine-tuning genérico, se especializa la recuperación en una tarea concreta (razonamiento aritmético de GSM8K) para medir si la capacidad se recupera tras una poda SVD agresiva. El nombre del repositorio (`w_remove50`) indica calibración con WikiText-2 y eliminación del 50 %; no se detalla en la model card la métrica exacta de rango o energía preservada por el SVD.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, con calidad degradada por la compresión.
- Razonamiento aritmético de varios pasos orientado a GSM8K, reforzado mediante la LoRA de recuperación.
- Respuesta a formato de chat de Llama 2 (chat template), según se indica en la evaluación de GSM8K 5-shot.
- Seguimiento de instrucciones limitado: IFEval prompt-level strict de 8,69, muy por debajo de la base sin comprimir.
- Comportamiento de seguridad medido: baja tasa de éxito de ataques en AdvBench (0,38 %) y StrongREJECT (5,11 %), con sobre-rechazo elevado en XSTest-safe (26,67 % bruto, 6,00 % puntuado) y OR-Bench-Hard-1k (22,16 % bruto, 12,66 % puntuado).
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning general: no disponible.
- Capacidades multilingües: no disponible (no se declara cobertura de idiomas).
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación sobre compresión SVD: el modelo sirve como punto de medida para estudiar cuánta capacidad se pierde al eliminar el 50 % de parámetros y cuánto se recupera con una LoRA específica de tarea, usando la PPL de WikiText-2 (20,03) como referencia.
- Estudio del equilibrio seguridad-capacidad: con ASR de 0,38 en AdvBench y 5,11 en StrongREJECT frente a un sobre-rechazo del 26,67 % en XSTest-safe, es útil para analizar la frontera entre rechazo correcto y sobre-rechazo en modelos comprimidos.
- Evaluación de recuperación aritmética: la especialización en GSM8K train permite medir si una LoRA de recuperación sobre un modelo podado recupera razonamiento matemático; el resultado medido (6,52 estricto / 7,13 flexible en 5-shot) documenta que la recuperación es parcial.
- Reproducibilidad de pipelines de compresión: el job `gsmrec_slurm.sh` y la configuración (semilla 42, calibración WikiText-2, cutoff 512, split de validación 500) permiten replicar el experimento y comparar variantes de calibración.
- Análisis de robustez frente a jailbreaks en modelos pequeños: útil como línea base degradada para comparar con modelos no comprimidos en pruebas de red teaming controladas.
- Docencia y formación: sirve para ilustrar en un curso o taller el impacto de la poda SVD y del fine-tuning de recuperación sobre métricas de seguridad y de tarea, sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

Resultados medidos por el autor (porcentajes, excepto PPL):

| Metrica | Valor |
|---|---|
| WikiText-2 PPL | 20,03 |
| Media zero-shot en 7 tareas | 39,76 |
| AdvBench ASR (juez HarmBench) | 0,38 |
| StrongREJECT ASR (juez HarmBench) | 5,11 |
| XSTest-safe sobre-rechazo (WildGuard) / puntuado | 26,67 / 6,00 |
| OR-Bench-Hard-1k sobre-rechazo / puntuado | 22,16 / 12,66 |
| GSM8K 5-shot estricto / flexible (chat template) | 6,52 / 7,13 |
| IFEval prompt-level strict | 8,69 |

No se han publicado en la información disponible resultados comparativos con otros modelos en estos benchmarks, ni desglose por tarea de la media zero-shot de 7 tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB solo de pesos (6.738.415.616 parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica se recomienda al menos 16 GB.
- En cuantización de 8 bits: en torno a 7 GB de pesos; en 4 bits, en torno a 3,5-4 GB, aunque el autor no publica variantes cuantizadas ni GGUF.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para FP16 sin compromisos; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para FP16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB, justo en FP16) y en GPUs de 12-16 GB si se cuantiza a 8 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp y Ollama no están documentados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Jeesup/svd-safety-l2_gsmrec_swift_w_remove50 | 6.738.415.616 | no disponible | Llama 2 Community | Comprimido al 50 % con Swift-SVD y recuperación LoRA en GSM8K; GSM8K 5-shot 6,52 estricto; IFEval 8,69 |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 (aprox.) | 4.096 tokens | Llama 2 Community | Modelo base sin comprimir; referencia para medir la degradación, sin métricas propias en esta ficha |
| Otras variantes del proyecto svd_safety (Jeesup) | no disponible | no disponible | Llama 2 Community | El autor menciona "celdas" del experimento con distinto grado de degradación de seguridad; no se detallan aquí |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El autor declara explícitamente que no es un asistente de propósito general y que algunas celdas del experimento están deliberadamente degradadas en seguridad o sobre-rechazan; hay que evaluar antes de usar.
- La compresión al 50 % degrada capacidades: IFEval prompt-level strict de 8,69 y GSM8K 5-shot de 6,52 estricto indican un seguimiento de instrucciones y una aritmética muy limitados.
- Sobre-rechazo elevado: 26,67 % bruto en XSTest-safe y 22,16 % en OR-Bench-Hard-1k, lo que puede provocar rechazos innecesarios en producción.
- La calibración SVD se hizo solo con WikiText-2, lo que puede sesgar la preservación de direcciones hacia el dominio de Wikipedia.
- No se declaran idiomas soportados; el comportamiento multilingüe es incierto.
- No se documentan cuantizaciones, por lo que el despliegue eficiente en hardware limitado requiere convertir los pesos por cuenta propia.
- Riesgo de alucinación: no cuantificado en la información disponible; la degradación por compresión y la especialización en GSM8K pueden aumentar la generación de contenido incorrecto fuera de ese dominio.
- Licencia Llama 2 Community: uso comercial permitido con condiciones (incluye USE_POLICY.md); es obligatorio revisar las restricciones de la licencia y la política de uso aceptable antes de desplegar.
- Artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación externa.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_gsmrec_swift_w_remove50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Proyecto svd_safety (job `gsmrec_slurm.sh`): no disponible como enlace público en la información proporcionada
- Paper de Swift-SVD: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demos: no disponibles en la información proporcionada
