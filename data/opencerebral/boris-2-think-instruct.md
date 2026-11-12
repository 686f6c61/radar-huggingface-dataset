# opencerebral/Boris-2-Think-Instruct

## Resumen

Boris-2-Think-Instruct es un modelo de lenguaje causal de 144 millones de parámetros desarrollado por OpenCerebral, un proyecto que entrena modelos desde cero en hardware modesto. Se trata del ajuste fino de Boris-2, un modelo base entrenado íntegramente en una única NVIDIA V100, sobre dos conjuntos de datos combinados: conversación general (smol-smoltalk) y trazas cortas de razonamiento (OpenThink). El resultado es un modelo de chat que decide por sí mismo cuándo necesita razonar antes de responder.

La innovación principal reside en su formato de respuesta: cada réplica comienza con un bloque `<think>` que permanece vacío en conversación ordinaria y contiene una traza breve de razonamiento cuando la pregunta requiere cálculo o deducción, terminando en `Final answer:`. Es relevante como ejemplo de modelo pequeño (SLM) con capacidad de razonamiento emergente y como referencia para quienes experimentan con arquitecturas de razonamiento en entornos con recursos limitados.

Con 144 millones de parámetros, licencia Apache 2.0 y un repositorio de 0,6 GB, el modelo está pensado para despliegues ligeros, experimentación educativa y evaluación de técnicas de razonamiento en modelos de escala reducida. Su ventana de contexto no está especificada en la documentación disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm), código personalizado en PyTorch |
| Parámetros totales | 144.192.782 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors; el autor no documenta cuantizaciones GGUF/INT8) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers con `trust_remote_code=True`) |

## Arquitectura y entrenamiento

Boris-2-Think-Instruct es un transformer causal de 144M de parámetros entrenado desde cero por OpenCerebral sobre una única NVIDIA V100. El modelo base Boris-2 se ajustó de forma conjunta sobre dos datasets: HuggingFaceTB/smol-smoltalk para conversación general y slmconsortium/OpenThink para trazas cortas de razonamiento. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

La particularidad técnica es el formato de razonamiento condicional: el modelo emite siempre un bloque `<think>` y aprende a dejarlo vacío en preguntas conversacionales y a rellenarlo con una traza breve cuando la tarea lo requiere. Los turnos de chat se escriben en texto plano con estilo ChatML (no se añadieron tokens al vocabulario) y el token de parada `<|im_end|>` abarca varios tokens, por lo que debe pasarse como stop string en la generación. La implementación es código PyTorch personalizado sin dependencias adicionales y, según la model card, sin caché KV.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento aritmético y de sentido común de corto alcance mediante trazas internas en `<think>`.
- Decisión autónoma de cuándo razonar y cuándo responder directamente.
- Respuestas con formato estructurado (`Final answer:` tras la traza).
- Seguimiento de instrucciones básico (evaluado con IFEval).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni multimodalidad.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Experimentación educativa con modelos de razonamiento: sirve para estudiar cómo emerge el comportamiento de "pensar antes de responder" en modelos de 144M, con un coste de cómputo mínimo en una sola GPU.
- Prototipado de asistentes conversacionales ligeros: el modelo gestiona diálogos multi-turno en inglés con un formato ChatML sencillo, adecuado para demos y pruebas de concepto antes de escalar a modelos mayores.
- Evaluación de pipelines de razonamiento: su bloque `<think>` explícito permite instrumentar y comparar trazas de razonamiento en entornos de investigación sin infraestructura pesada.
- Generación de respuestas con justificación en tareas aritméticas simples: útil en cuadernos de evaluación o juguetes educativos donde se quiere ver el paso intermedio, aunque con precisión limitada.
- Benchmarking de modelos pequeños: sirve como referencia base en comparativas de SLM (junto a SmolLM2-135M) para medir el efecto del ajuste fino de chat y razonamiento.
- Despliegue en entornos con recursos muy limitados: con 0,6 GB de pesos en float32 y código PyTorch sin dependencias extra, cabe en GPUs de gama baja o incluso en CPU para inferencia de baja latencia tolerada.
- Filtrado y clasificación ligera de texto en inglés: al ser un modelo causal pequeño, puede adaptarse a tareas de continuación y puntuación de texto con ajuste adicional.

## Benchmarks y rendimiento

Datos publicados por el autor con lm-evaluation-harness 0.4.12, float32, zero-shot. ArithMark-3 con el script propio del Open SLM Leaderboard.

| Benchmark | Métrica | Boris-2 | Boris-2-Instruct | Boris-2-Think | Boris-2-Think-Instruct |
|---|---|---:|---:|---:|---:|
| HellaSwag | acc_norm | 50,27 | 48,84 | 50,13 | 48,56 |
| ARC-Easy | acc_norm | 59,76 | 57,74 | 63,93 | 59,76 |
| ARC-Challenge | acc_norm | 32,00 | 31,48 | 34,81 | 32,00 |
| PIQA | acc_norm | 72,85 | 71,06 | 72,31 | 71,60 |
| ArithMark-3 | acc_norm | 45,10 | 43,70 | 49,20 | 47,00 |
| Open SLM Index | — | 34,15 | 31,85 | 36,05 | 33,29 |

| Benchmark | Métrica | Boris-2-Instruct | Boris-2-Think-Instruct | SmolLM2-135M-Instruct |
|---|---|---:|---:|---:|
| IFEval | prompt-level strict | 19,41 | 17,38 | 19,59 |
| IFEval | prompt-level loose | 22,18 | 22,74 | 20,89 |
| IFEval | instruction-level strict | 29,86 | 28,78 | 32,73 |
| IFEval | instruction-level loose | 33,21 | 35,25 | 34,65 |
| TruthfulQA MC1 | acc | 25,34 | 25,58 | 23,99 |
| TruthfulQA MC2 | acc | 41,05 | 40,96 | 41,78 |
| MMLU (cloze) | acc | 28,41 | 28,61 | 27,72 |
| WinoGrande | acc | 52,09 | 51,93 | 51,07 |
| OpenBookQA | acc_norm | 34,60 | 33,00 | 33,20 |
| SciQ | acc_norm | 83,60 | 84,50 | 76,70 |
| CommonsenseQA | acc | 23,10 | 19,90 | 19,66 |

El autor advierte que las diferencias inferiores a 1,5 puntos (2 a 4 en IFEval) están dentro del ruido de la benchmark y que se trata de ejecuciones únicas. Para los mejores resultados en razonamiento recomienda Boris-2-Think.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en float32 para los pesos; con overhead de activaciones y sin caché KV, cabe holgadamente en GPUs de 2 GB o menos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, T4). El entrenamiento original se realizó en una NVIDIA V100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna y en muchas integradas.
- Opciones de despliegue: transformers con `trust_remote_code=True` (vía oficial documentada). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI; al no haber pesos GGUF publicados, llama.cpp requeriría conversión propia.
- Latencia y throughput: no disponibles en la documentación. El modelo no usa caché KV, lo que penaliza la generación de secuencias largas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Open SLM Index | MMLU (cloze) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Boris-2-Think-Instruct | 144M | No disponible | 33,29 | 28,61 | Apache 2.0 | Hugging Face |
| Boris-2-Think | 144M | No disponible | 36,05 | No disponible | Apache 2.0 | Hugging Face |
| Boris-2-Instruct | 144M | No disponible | 31,85 | 28,41 | Apache 2.0 | Hugging Face |
| SmolLM2-135M-Instruct | 135M | No disponible en la información | No disponible | 27,72 | Apache 2.0 | Hugging Face |

Frente a SmolLM2-135M-Instruct, Boris-2-Think-Instruct obtiene mejores resultados en MMLU cloze (28,61 frente a 27,72) y SciQ (84,50 frente a 76,70), pero peor en IFEval strict a nivel de instrucción (28,78 frente a 32,73). La comparación con otras familias de SLM (Qwen2.5-0.5B, Llama-3.2-1B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Precisión aritmética limitada: la propia model card documenta un fallo típico en el que el planteamiento es correcto pero la resta final es errónea (18 − 5 respondido como 17 en lugar de 13).
- Riesgo de alucinación elevado por su escala (144M): los resultados en TruthfulQA (25,58 en MC1) indican una fiabilidad baja en hechos del mundo.
- Solo inglés: no se documenta soporte de otros idiomas.
- Longitud de contexto no especificada; sin caché KV, la generación de secuencias largas es costosa.
- El token de parada `<|im_end|>` no es un token de fin de secuencia y abarca varios tokens: debe pasarse como stop string o la generación continuará indebidamente.
- El ajuste fino de chat degrada ligeramente los benchmarks del modelo base (Open SLM Index 33,29 frente a 34,15 de Boris-2).
- Los benchmarks publicados son ejecuciones únicas con diferencias dentro del ruido en varios casos; deben interpretarse con cautela.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de pesos cuantizados y de soporte en motores de inferencia estándar limita su adopción en producción.
- No se documentan sesgos específicos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/opencerebral/Boris-2-Think-Instruct
- Modelo base Boris-2: https://huggingface.co/opencerebral/Boris-2
- Boris-2-Instruct: https://huggingface.co/opencerebral/Boris-2-Instruct
- Boris-2-Think: https://huggingface.co/opencerebral/Boris-2-Think
- Organización OpenCerebral: https://huggingface.co/opencerebral
- Wiki del proyecto: https://wiki.kunix.org/
- Sitio del autor: https://oc.kunix.org/
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset OpenThink: https://huggingface.co/datasets/slmconsortium/OpenThink
- Licencia: https://huggingface.co/opencerebral/Boris-2-Think-Instruct/blob/main/LICENSE
