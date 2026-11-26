# lapalaba/Qwen3.8-27B-DFlash2-ru

## Resumen

Qwen3.8-27B-DFlash2-ru es un cabezal de borrador (draft head) para decodificación especulativa, no un modelo de lenguaje autónomo. Lo desarrolla lapalaba partiendo de `incoai/Qwen3.8-27B-DFlash2` y afinándolo sobre un corpus de 271.148 ejemplos orientados al dominio ruso (interacciones de agentes, trazas de producción y RAG). Su función es proponer bloques de tokens que el verificador `Qwen/Qwen3.8-27B` valida, acelerando la inferencia en despliegues de SGLang y vLLM.

El checkpoint emplea la arquitectura `DFlash2DraftModel` en bfloat16 con cinco capas de borrador, tamaño oculto de 5.120, tamaño intermedio de 17.408 y vocabulario de 248.320 entradas. El bloque especulativo es de 8 tokens (7 tokens especulativos en la configuración de vLLM) y el contexto de entrenamiento se fijó en 24.576 tokens con el modo thinking desactivado.

Su relevancia es práctica: permite mejorar el throughput de servicio en cargas de trabajo rusas y de retail sin cambiar el modelo verificador, a costa de un rendimiento inferior en tareas fuera de dominio como MBPP. No debe cargarse como modelo de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2DraftModel (cabezal de borrador para decodificación especulativa sobre Qwen3.8-27B) |
| Parametros totales | 1.924.404.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 24.576 tokens (contexto de entrenamiento y de servicio recomendado) |
| Tipos de cuantizacion | no disponible (export en bfloat16) |
| Idiomas soportados | ru, en |
| Licencia | other |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un cabezal de borrador DFlash2 con cinco capas, tamaño oculto de 5.120, tamaño intermedio de 17.408 y vocabulario de 248.320 tokens. Incorpora tamaño de bloque DFlash2 de 8, token de máscara con ID 248.070, kernel de convolución 2, tamaño de grupo de convolución 16, rango del selector 256, top-k del selector 16 y capas verificadoras en los índices [5, 19, 33, 47, 61]. El export se realizó en bfloat16.

El entrenamiento partió de `incoai/Qwen3.8-27B-DFlash2` y continuó sobre 271.148 ejemplos filtrados: interacciones de agentes en ruso, trazas de producción y datos de RAG (mezcla de ejemplos nativos en ruso y traducciones desde fuentes rusas e inglesas). Se excluyeron grupos de test y de sonda de continuación antes de la captura, y las secuencias se agruparon por longitud renderizada bajo la plantilla fijada del modelo. La distribución es muy sesgada hacia contextos cortos: el 55,60 % de los ejemplos tiene ≤2.047 tokens, el 33,58 % entre 2.048 y 4.095, el 5,73 % entre 4.096 y 5.188, el 4,32 % entre 5.189 y 8.191 y solo el 0,76 % supera los 8.192 tokens. Se seleccionó el checkpoint del paso 542.298, con la mejor precisión de evaluación observada (0,66958) y pérdida de 2,03607.

## Capacidades

- Generación de propuestas de tokens para decodificación especulativa verificada por `Qwen/Qwen3.8-27B`.
- Aceleración de inferencia en SGLang mediante `--speculative-algorithm DFLASH` y tamaño de bloque 8.
- Aceleración de inferencia en vLLM 0.28.0 o superior con `method: dflash` y 7 tokens especulativos.
- Especialización en cargas de trabajo del dominio ruso: interacciones de agentes, trazas de producción y RAG.
- Soporte de contextos de hasta 24.576 tokens en el pipeline de servicio.
- No soporta tool calling, agentes ni razonamiento de forma autónoma: esas capacidades residen en el verificador, no en este checkpoint.
- No es un modelo de chat ni de generación de texto independiente.

## Casos de uso

- Servicio de un verificador Qwen3.8-27B con aceleración especulativa en ruso: se despliega el verificador y se adjunta este checkpoint como draft head en SGLang o vLLM, de modo que cada paso del verificador acepta varios tokens propuestos y se reduce el coste por token generado.
- Asistentes de atención al cliente en retail en ruso: el checkpoint está afinado sobre trazas de retail, y en la evaluación a concurrencia 32 mantiene un throughput de 405 tok/s frente a 402 del baseline, con tau de 5,05 frente a 4,97.
- Pipelines de RAG en producción: el corpus de entrenamiento incluye ejemplos de RAG en ruso, por lo que las propuestas se alinean mejor con la distribución de respuestas aumentadas por recuperación en ese idioma.
- Generación de código en ruso con HumanEval: a concurrencia 32 alcanza 1.117 tok/s frente a 1.049 del baseline (+6,4 %), aunque con tau inferior (6,46 frente a 6,90).
- Despliegue de agentes multi-turno en ruso: las interacciones de agente forman parte del conjunto de entrenamiento, lo que favorece la especulación en conversaciones encadenadas con llamadas a herramientas gestionadas por el verificador.
- Evaluación comparativa de cabezales de borrador: sirve como referencia para medir el impacto de la especialización por idioma y dominio frente a `z-lab/Qwen3.8-27B-DFlash2` en un mismo entorno SGLang con verificador FP8.

## Benchmarks y rendimiento

Evaluación en SGLang sobre una NVIDIA H200 con verificador `Qwen3.8-27B-FP8`, FlashAttention 3, bloque DFlash2 de 8, contexto de 24.576 y límite de salida de 4.096 tokens, temperatura 0 y prompts con `z-lab/dflash`. Throughput de salida a concurrencia 32:

| Benchmark | Baseline (tok/s) | Este checkpoint (tok/s) | Δ vs baseline | Tau baseline | Tau checkpoint |
|---|---:|---:|---:|---:|---:|
| HumanEval | 1.049 | 1.117 | +6,4 % | 6,90 | 6,46 |
| Retail | 402 | 405 | +0,6 % | 4,97 | 5,05 |
| MBPP | 1.137 | 975 | -14,2 % | 5,87 | 5,01 |

Configuraciones con throughput superior al baseline: retail a concurrencia 16, 32 y 64; HumanEval a concurrencia 32 y 64. Tau se define como tokens de salida aceptados por paso del verificador (mayor es mejor) y mide comportamiento de servicio, no precisión de respuesta. Los resultados completos con TTFT, TPOT, E2E, RPS y fallos están en `EVALUATION.md` del repositorio.

## Requisitos de hardware

- VRAM del draft head: aproximadamente 3,9 GB en bfloat16 (tamaño del repo), adicional a la memoria del verificador Qwen3.8-27B.
- VRAM del verificador: no disponible en la información proporcionada; la evaluación usó la variante FP8 en una H200.
- GPU validadas: NVIDIA H200 (evaluación oficial). No se han publicado pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: no disponible; no hay datos de despliegue en GPUs consumer.
- Opciones de despliegue: SGLang (backend de atención fa3, backends linear-attn flashinfer, `--speculative-algorithm DFLASH`) y vLLM 0.28.0 o superior (`method: dflash`, 7 tokens especulativos).
- Configuración de referencia: `--tp-size 1`, `--max-running-requests 32`, `--context-length 24576`, `--mem-fraction-static 0.80`.
- Latencia y throughput: 1.117 tok/s en HumanEval, 405 tok/s en retail y 975 tok/s en MBPP a concurrencia 32 sobre H200 con verificador FP8.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| lapalaba/Qwen3.8-27B-DFlash2-ru | Draft head DFlash2 especializado en ruso | 1.924.404.480 | 24.576 | +6,4 % en HumanEval y +0,6 % en retail; -14,2 % en MBPP frente al baseline (concurrencia 32) | other | Hugging Face, 270 descargas |
| z-lab/Qwen3.8-27B-DFlash2 | Draft head DFlash2 generalista (baseline de la evaluación) | no disponible | 24.576 en la evaluación | Referencia: 1.049 tok/s HumanEval, 402 tok/s retail, 1.137 tok/s MBPP | no disponible | Hugging Face |
| incoai/Qwen3.8-27B-DFlash2 | Draft head DFlash2, punto de partida del afinamiento | no disponible | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: cargarlo como modelo de chat produce resultados inválidos. Requiere siempre el verificador `Qwen/Qwen3.8-27B`.
- El rendimiento cae un 14,2 % en MBPP frente al baseline, lo que refleja un desplazamiento respecto a la distribución inglesa y generalista.
- El entrenamiento se concentra en contextos cortos: solo el 0,76 % de los ejemplos supera los 8.192 tokens, por lo que la calidad de la especulación en contextos largos no está respaldada por datos abundantes.
- El dataset mezcla ejemplos traducidos, no es exclusivamente ruso ni exclusivamente de producción.
- Licencia "other": es necesario revisar los términos del repositorio antes de un uso comercial.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un draft head, la calidad final depende del verificador.
- El modo thinking se desactivó durante el entrenamiento, por lo que no se ha validado su comportamiento con razonamiento extendido.
- Los resultados de referencia se obtuvieron en una sola H200 con verificador FP8 en SGLang; el ejemplo de vLLM usa el verificador no FP8, por lo que el rendimiento puede diferir.
- Baseline y checkpoint se midieron en fechas distintas, lo que introduce variabilidad no controlada en la comparación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lapalaba/Qwen3.8-27B-DFlash2-ru
- Modelo base verificador: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint de partida: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Baseline de comparación: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Evaluación detallada: ./EVALUATION.md (en el repositorio)
- Receta de servicio vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
