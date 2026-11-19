# openbmb/MiniCPM-V-4.7-35B-A3B-DSpark

## Resumen

MiniCPM-V-4.7-35B-A3B-DSpark es un checkpoint de tipo *draft* (borrador) entrenado por OpenBMB para decodificacion especulativa con el modelo objetivo MiniCPM-V-4.7-35B-A3B. No es un modelo generativo autonomo: su funcion es proponer tokens candidatos que el modelo objetivo verifica en paralelo, acelerando la inferencia sin alterar la distribucion de salida. Implementa el metodo DSpark descrito en el paper arXiv:2607.05147.

El checkpoint contiene 389.223.169 parametros en precision BF16, distribuidos en 5 capas draft que leen los estados ocultos de las capas `[3, 11, 19, 27, 35]` del modelo objetivo. En cada pasada directa genera 15 tokens candidatos, que el verificador del modelo principal acepta o rechaza. Esta disenado exclusivamente para emparejarse con el tokenizer y los pesos de MiniCPM-V-4.7-35B-A3B.

Su relevancia practica es el ahorro computacional: al aumentar la longitud de aceptacion (tokens validados por paso de verificacion), reduce el numero de pasos necesarios para completar una generacion. Segun la evaluacion del autor, la longitud de aceptacion oscila entre 3,5 y 7,4 tokens por paso segun el dominio, con los mejores resultados en codigo y matematicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft model para decodificacion especulativa DSpark (5 capas) sobre MiniCPM-V-4.7-35B-A3B (arquitectura base tipo Qwen3, tag `qwen3`) |
| Parametros totales | 389.223.169 |
| Parametros activos | no disponible (el draft no es MoE; el objetivo 35B-A3B si lo es, pero no se detalla en la informacion proporcionada) |
| Longitud de contexto | no disponible para el draft; el ejemplo de despliegue con vLLM usa `--max-model-len 40960` para el modelo objetivo |
| Tipos de cuantizacion | BF16 en el checkpoint original; existe version GGUF para llama.cpp (MiniCPM-V-4.7-35B-A3B-DSpark-gguf) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF en el repositorio alternativo |

## Arquitectura y entrenamiento

El draft es un modelo auxiliar de 5 capas que consume los estados ocultos intermedios del modelo objetivo en las capas 3, 11, 19, 27 y 35, y emite hasta 15 tokens candidatos por pasada directa. Esta construccion por capas seleccionadas reduce el coste del borrador frente a un modelo denso completo, manteniendo la coherencia con las representaciones internas del objetivo. El checkpoint se distribuye en BF16.

El entrenamiento utilizo 2 millones de secuencias durante 6 epocas con el optimizador AdamW. Las respuestas de entrenamiento fueron generadas por MiniCPM-V-4.7-35B-A3B a partir de una mezcla de prompts de vision y texto, de modo que el draft aprende a imitar el comportamiento del objetivo en ambos dominios. La funcion de perdida combina entropia cruzada (CE), una penalizacion L1 y una perdida de confianza. No se detalla en la informacion disponible la composicion exacta del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa: propone hasta 15 tokens por pasada que el modelo objetivo verifica.
- Aceleracion de inferencia multimodal: entrenado con prompts de vision y texto, cubre tareas de comprension visual y generacion textual.
- Compatibilidad con tool calling y flujos de agente: hereda el comportamiento del objetivo MiniCPM-V-4.7-35B-A3B, etiquetado con `tool-calling`.
- Soporte en vLLM mediante `--speculative-config` con `method: dspark` y `num_speculative_tokens: 15`.
- Soporte en llama.cpp a traves de la version GGUF.
- Idiomas: ingles y chino, alineados con el modelo objetivo.
- No es un modelo autonomo: no debe usarse solo, requiere el checkpoint objetivo y su tokenizer.

## Casos de uso

- Aceleracion de inferencia en produccion con vLLM: se configura como modelo especulativo del objetivo para reducir la latencia por token en despliegues con `tensor-parallel-size 2` y contexto de 40.960 tokens, manteniendo la calidad del modelo principal.
- Servicio de codigo asistido: con una longitud de aceptacion de 7,387 en el dominio de codigo, es el escenario donde mas se amortiza el coste del borrador; util en IDE y pipelines de generacion de codigo.
- Razonamiento matematico interactivo: aceptacion de 6,687 en matematicas, adecuado para asistentes que resuelven problemas paso a paso con muchas iteraciones.
- Procesamiento de documentos con OCR: aceptacion de 5,407 en OCRBench y 5,479 en CharXiv_reasoning_val, util en pipelines de digitalizacion y extraccion de datos de documentos escaneados.
- Analisis de graficos y figuras cientificas: aceptacion de 6,126 en MathVista y 5,098 en MMMU, apropiado para herramientas de analisis visual con alto volumen de peticiones.
- Despliegue en edge con llama.cpp: la version GGUF permite usar la decodificacion especulativa en entornos con recursos limitados, manteniendo el modelo objetivo como verificador.
- Chat multi-turno de proposito general: aceptacion de 3,501 en el dominio general; el ahorro es menor, pero sigue siendo positivo en conversaciones largas con contexto de hasta 40.960 tokens.

## Benchmarks y rendimiento

La evaluacion publicada mide longitud de aceptacion (tokens de finalizacion totales divididos entre pasos de verificacion especulativa), con terminacion EOS natural y `max_new_tokens=8192`.

| Dominio | Benchmark | Longitud de aceptacion |
|---|---|---|
| Vision | MMMU | 5,098 |
| Vision | MathVista | 6,126 |
| Vision | CharXiv_reasoning_val | 5,479 |
| Vision | OCRBench | 5,407 |
| Texto | Matematicas | 6,687 |
| Texto | Codigo | 7,387 |
| Texto | General | 3,501 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) para este checkpoint en la informacion disponible; al ser un draft, su metrica relevante es la longitud de aceptacion, no la precision de tarea.

## Requisitos de hardware

- VRAM del draft: 389,2 M de parametros en BF16 equivalen a aproximadamente 0,78 GB solo de pesos; con overhead de runtime, alrededor de 1-1,5 GB adicionales sobre el modelo objetivo.
- El coste real lo domina el modelo objetivo MiniCPM-V-4.7-35B-A3B; el ejemplo oficial usa `--tensor-parallel-size 2`, lo que implica al menos 2 GPU de gama alta.
- GPU recomendadas para el conjunto: A100 80 GB, H100 80 GB o configuraciones multi-GPU equivalentes; el draft en si cabe en cualquier GPU consumer con mas de 2 GB libres.
- Despliegue: vLLM con `--speculative-config '{"method":"dspark","model":"openbmb/MiniCPM-V-4.7-35B-A3B-DSpark","num_speculative_tokens":15,...}'`; llama.cpp mediante la version GGUF.
- Latencia y throughput: no se publican cifras absolutas de tokens por segundo en la informacion disponible; la mejora es proporcional a la longitud de aceptacion (hasta 7,387 tokens por paso en codigo frente a 1 token por paso sin especulacion).

## Comparativa con modelos similares

| Modelo | Parametros | Funcion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-35B-A3B-DSpark | 389,2 M (draft) | Decodificacion especulativa DSpark | no disponible (objetivo: 40.960) | apache-2.0 | Hugging Face, GGUF |
| MiniCPM-V-4.7-35B-A3B | no disponible en la informacion | Modelo objetivo multimodal MoE | 40.960 (segun ejemplo vLLM) | no disponible en la informacion | Hugging Face |
| Otros draft models (EAGLE, Medusa) | variable | Decodificacion especulativa | depende del objetivo | variable | Hugging Face |

No se dispone de datos de rendimiento de alternativas comparables en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo autonomo: genera candidatos que deben verificarse con MiniCPM-V-4.7-35B-A3B; usarlo de forma aislada produce salidas sin garantia de calidad.
- Dependencia estricta del tokenizer y de los pesos del objetivo: no es compatible con otros modelos ni con versiones distintas del mismo.
- La longitud de aceptacion cae en el dominio general (3,501), por lo que el ahorro es limitado en conversaciones abiertas.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion y sesgos heredado del modelo objetivo, ya que el draft imita su distribucion.
- Licencia apache-2.0 permite uso comercial, pero el autor declara el modelo "AS IS" sin garantias y prohibe el jailbreaking y la induccion de contenido danino.
- Las respuestas sobre politica, salud, finanzas y derecho no estan revisadas por expertos y no deben tratarse como asesoramiento profesional.
- No se documentan en la informacion disponible los sesgos especificos ni las tasas de alucinacion medidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-DSpark
- Modelo objetivo: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Version GGUF: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-DSpark-gguf
- Paper DSpark: https://arxiv.org/abs/2607.05147
