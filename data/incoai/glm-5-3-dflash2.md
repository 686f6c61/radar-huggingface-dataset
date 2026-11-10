# incoai/GLM-5.3-DFlash2

## Resumen

GLM-5.3-DFlash2 es un modelo borrador (draft model) para decodificación especulativa, desarrollado por Inco AI como complemento de `zai-org/GLM-5.3`. No es un modelo de lenguaje autónomo: se ejecuta dentro de un servidor de decodificación especulativa (SGLang o vLLM) y propone bloques de tokens que el modelo objetivo verifica. Su función es acelerar la inferencia de GLM-5.3 sin alterar la distribución de salida.

Técnicamente implementa DFlash 2, un borrador de difusión por bloques (block diffusion) que predice un bloque completo de tokens en una sola pasada y conserva los mejores candidatos en cada posición; un selector ligero traza después una ruta coherente entre ellos. Incorpora convoluciones dinámicas de dos tomas (two-tap dynamic convolutions) en el backbone para evitar la degradación de la calidad del borrador hacia el final del bloque. La decodificación es sin pérdida (lossless): la salida greedy coincide exactamente con la del modelo objetivo y el muestreo preserva su distribución.

El modelo tiene 2.459.424.256 parámetros en formato safetensors (repo de 9,8 GB) y se distribuye con licencia Apache 2.0. Su relevancia es práctica: en las evaluaciones publicadas por el autor, DFlash 2 supera al MTP nativo de GLM-5.3 tanto en longitud de aceptación como en throughput, con aceleraciones de hasta 3,39× frente a decodificación autorregresiva en concurrencia 1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Borrador de difusión por bloques (block diffusion) con selector de ruta de candidatos y convoluciones dinámicas de dos tomas; derivado de Qwen3 (tag `qwen3`) |
| Parametros totales | 2.459.424.256 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo publica safetensors sin cuantizar; el ejemplo de servicio con vLLM usa el objetivo cuantizado NVFP4 en `incoai/GLM-5.3-NVFP4`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | zai-org/GLM-5.3 (finetune) |
| Tamano del repositorio | 9,8 GB |
| Libreria | transformers |
| Tarea | text-generation (borrador para decodificación especulativa) |
| Inferencia standalone | no (requiere servidor de decodificación especulativa) |

## Arquitectura y entrenamiento

DFlash 2 es un borrador de difusión por bloques para decodificación especulativa. En lugar de generar tokens de uno en uno, predice un bloque completo en una sola pasada y mantiene los mejores candidatos en cada posición del bloque; un selector ligero recorre después esos candidatos para trazar una única ruta coherente que se envía a verificación. El backbone incorpora convoluciones dinámicas de dos tomas, diseñadas para que la calidad de las predicciones no decaiga hacia el final del bloque, un problema habitual en los borradores paralelos. El tamaño del bloque de especulación empleado en la evaluación es de 8, es decir, 7 tokens borrador por cada paso de verificación.

El modelo es un finetune sobre `zai-org/GLM-5.3` y está etiquetado como derivado de Qwen3, con 2.459 millones de parámetros. La decodificación resultante es sin pérdida: la salida greedy coincide exactamente con la del modelo objetivo y el muestreo preserva su distribución, de modo que la aceleración no compromete la calidad. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. DFlash 2 se apoya en el trabajo previo DFlash, presentado en ICML 2026.

## Capacidades

- Generación de tokens borrador para decodificación especulativa sobre GLM-5.3; no genera respuestas de forma autónoma.
- Predicción paralela de bloques de tokens con retención de múltiples candidatos por posición.
- Selección de ruta coherente mediante un selector ligero sobre los candidatos del bloque.
- Decodificación sin pérdida: preserva exactamente la salida greedy y la distribución de muestreo del modelo objetivo.
- Compatibilidad con SGLang (algoritmo `DFLASH`, backend de atención `fa4`) y con vLLM v0.28.0 o superior.
- Soporte de decodificación especulativa en regímenes de concurrencia baja y alta (evaluado a concurrencia 1, 8 y 32).
- Tool calling, agentes, visión, audio, modo thinking y capacidades multilingües: no disponibles como capacidades propias del borrador (las hereda el modelo objetivo GLM-5.3, no este repositorio).

## Casos de uso

- Aceleración de despliegues de GLM-5.3 en producción: sustituir la decodificación autorregresiva por DFlash 2 en SGLang o vLLM para multiplicar el throughput por 2,16×–3,39× según carga y tarea, sin cambiar las respuestas generadas.
- Servicio de razonamiento matemático interactivo: en MATH-500 alcanza 383,3 tok/s a concurrencia 1 (3,39×) y 3.559,8 tok/s a concurrencia 32 (2,84×), adecuado para asistentes que resuelven problemas paso a paso con latencia baja.
- Generación de código en pipelines de CI/CD: con HumanEval y MBPP como referencia, ofrece 5,48 y 4,95 tokens aceptados por paso de verificación respectivamente, lo que reduce el tiempo de generación de parches y tests en herramientas de desarrollo.
- Chat multi-turno de baja latencia: en MT-Bench logra 244,3 tok/s a concurrencia 1 (2,16×) y 2.345,0 tok/s a concurrencia 32 (1,86×), útil para interfaces conversacionales donde importa el tiempo hasta el primer token completado.
- Reducción de coste de GPU en inferencia a gran escala: al aumentar los tokens por paso de verificación, se necesitan menos pasos para la misma longitud de salida, lo que rebaja el coste por token servido en clústeres con GB300 o equivalentes.
- Evaluación comparativa de estrategias de decodificación especulativa: sirve como referencia reproducible frente al MTP nativo de GLM-5.3 en las mismas condiciones (bloque de 8, temperatura 1.0, top-p 0.95, 4.096 tokens nuevos).
- Despliegue con objetivo cuantizado: combinado con `incoai/GLM-5.3-NVFP4` en vLLM para reducir requisitos de memoria del modelo objetivo manteniendo la aceleración del borrador.

## Benchmarks y rendimiento

Longitud de aceptación (tokens de finalización por paso de verificación; mayor es mejor):

| Tarea | MTP | DFlash 2 |
|---|---:|---:|
| GSM8K | 5,12 | 5,94 |
| MATH-500 | 5,05 | 6,02 |
| HumanEval | 4,85 | 5,48 |
| MBPP | 4,34 | 4,95 |
| MT-Bench | 3,81 | 4,19 |

Throughput a concurrencia 1, en tok/s de salida (aceleración frente a autorregresivo):

| Tarea | Autorregresivo | MTP | DFlash 2 |
|---|---:|---:|---:|
| GSM8K | 113,4 | 292,6 (2,58×) | 366,6 (3,23×) |
| MATH-500 | 113,1 | 297,4 (2,63×) | 383,3 (3,39×) |
| HumanEval | 113,7 | 292,9 (2,58×) | 363,7 (3,20×) |
| MBPP | 113,4 | 266,5 (2,35×) | 336,5 (2,97×) |
| MT-Bench | 113,2 | 206,8 (1,83×) | 244,3 (2,16×) |

Throughput a concurrencia 8, en tok/s de salida (aceleración frente a autorregresivo):

| Tarea | Autorregresivo | MTP | DFlash 2 |
|---|---:|---:|---:|
| GSM8K | 535,3 | 1.094,5 (2,04×) | 1.310,4 (2,45×) |
| MATH-500 | 549,6 | 1.145,6 (2,08×) | 1.409,7 (2,56×) |
| HumanEval | 554,4 | 1.133,8 (2,05×) | 1.360,6 (2,45×) |
| MBPP | 554,2 | 1.049,7 (1,89×) | 1.277,4 (2,31×) |
| MT-Bench | 544,5 | 807,0 (1,48×) | 895,5 (1,64×) |

Throughput a concurrencia 32, en tok/s de salida (aceleración frente a autorregresivo):

| Tarea | Autorregresivo | MTP | DFlash 2 |
|---|---:|---:|---:|
| GSM8K | 1.142,7 | 2.283,6 (2,00×) | 2.694,5 (2,36×) |
| MATH-500 | 1.251,8 | 2.943,2 (2,35×) | 3.559,8 (2,84×) |
| HumanEval | 1.303,1 | 3.016,9 (2,32×) | 3.589,1 (2,75×) |
| MBPP | 1.292,8 | 2.790,2 (2,16×) | 3.380,4 (2,61×) |
| MT-Bench | 1.262,7 | 2.119,5 (1,68×) | 2.345,0 (1,86×) |

Condiciones de la evaluación: SGLang sobre cuatro NVIDIA GB300 (TP4) con FlashAttention 4 para la atención del borrador, bloque de especulación de 8, parámetros recomendados de GLM-5.3 (temperatura 1.0, top-p 0.95), esfuerzo de razonamiento `Max`, máximo de 4.096 tokens nuevos y 128 muestras a concurrencia 1 y 1.024 a concurrencia 8 y 32. No se han publicado resultados de benchmarks de calidad (MMLU, GSM8K, HumanEval como métricas de precisión) para este borrador en la información disponible, ya que su salida es equivalente a la del modelo objetivo.

## Requisitos de hardware

- VRAM del borrador: 2.459 millones de parámetros en safetensors, repo de 9,8 GB; en BF16 requiere aproximadamente 5 GB solo para pesos, más caché KV y overhead del servidor. Cifras exactas de VRAM en producción no disponibles.
- La VRAM dominante corresponde al modelo objetivo GLM-5.3, no al borrador; el ejemplo oficial de SGLang usa `--tp-size 4`.
- GPU de referencia en la evaluación: 4× NVIDIA GB300 con tensor parallelism 4 y FlashAttention 4 para la atención del borrador.
- GPU consumer: no disponible. No se han publicado pruebas en RTX 4090 u otras GPU de consumo; el requisito de servir GLM-5.3 como objetivo hace improbable un despliegue en una sola GPU consumer.
- Opciones de despliegue: SGLang (recomendado, `--speculative-algorithm DFLASH --speculative-draft-model-path incoai/GLM-5.3-DFlash2 --speculative-draft-attention-backend fa4`) y vLLM v0.28.0 o superior. No se documenta soporte en llama.cpp, Ollama ni TGI.
- Throughput medido: de 244,3 a 383,3 tok/s a concurrencia 1 según tarea, y de 895,5 a 3.589,1 tok/s a concurrencia 8 y 32, siempre en la configuración GB300×4 indicada.
- Latencia: no se publican métricas de TTFT ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Throughput (GSM8K, conc. 1) | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| GLM-5.3-DFlash2 (Inco AI) | Borrador de difusión por bloques | 2.459 M | no disponible | 366,6 tok/s (3,23×) | Apache 2.0 | Hugging Face, SGLang, vLLM ≥0.28.0 |
| MTP nativo de GLM-5.3 | Borrador multi-token prediction integrado | no disponible | no disponible | 292,6 tok/s (2,58×) | la del modelo objetivo | Integrado en GLM-5.3 |
| GLM-5.3 autorregresivo | Modelo objetivo sin especulación | no disponible | no disponible | 113,4 tok/s (1×) | no disponible en esta ficha | Hugging Face (`zai-org/GLM-5.3`) |
| DFlash (versión original, ICML 2026) | Borrador de difusión por bloques | no disponible | no disponible | no disponible | no disponible | Paper ICML 2026 |

## Limitaciones y advertencias

- No es un modelo autónomo: no puede usarse para generación de texto directa ni con `pipeline("text-generation")` estándar; la model card marca `inference: false` y requiere un servidor de decodificación especulativa.
- Dependencia estricta del modelo objetivo: solo funciona con `zai-org/GLM-5.3`; no es intercambiable con otros modelos.
- Dependencia de infraestructura: requiere SGLang con backend `fa4` o vLLM v0.28.0 o superior; versiones anteriores no lo soportan.
- Las aceleraciones publicadas proceden de una configuración concreta (4× GB300, TP4, bloque de 8, temperatura 1.0, top-p 0.95, 4.096 tokens nuevos) y no son extrapolables a otros hardware, cuantizaciones o parámetros de muestreo.
- El rendimiento relativo es menor en tareas conversacionales (MT-Bench: 1,86×–2,16×) que en matemáticas y código (hasta 3,39×), por lo que la ganancia depende del dominio.
- Sesgos conocidos: no disponibles para el borrador; los sesgos del sistema recaen en GLM-5.3.
- Riesgo de alucinación: no aplica al borrador en sí, ya que su salida es verificada por el modelo objetivo y la decodificación es sin pérdida; el riesgo es el del modelo objetivo.
- Idiomas soportados: no disponibles en la información del repositorio.
- Licencia Apache 2.0, permisiva para uso comercial; deben respetarse, no obstante, los términos del modelo base GLM-5.3.
- No se documentan requisitos de memoria ni latencias para despliegues en GPU consumer; asumir que no es viable en una sola GPU de consumo.

## Enlaces

- Hugging Face: https://huggingface.co/incoai/GLM-5.3-DFlash2
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- Repositorio GitHub: https://github.com/z-lab/dflash
- Ejemplo de servicio con vLLM y objetivo NVFP4: https://huggingface.co/incoai/GLM-5.3-NVFP4
- SGLang: https://github.com/sgl-project/sglang
- Cita del paper original: Chen, Liang y Liu, «DFlash: Block Diffusion for Flash Speculative Decoding», ICML 2026
