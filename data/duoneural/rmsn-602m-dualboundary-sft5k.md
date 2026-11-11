# DuoNeural/RMSN-602M-DualBoundary-SFT5k

## Resumen

RMSN-602M-DualBoundary-SFT5k es un modelo de lenguaje de 602,45 millones de parámetros desarrollado por DuoNeural Lab, presentado como una red de tipo "Resonant Metriplectic Sheaf Network" (RMSN) con formulación Port-Hamiltonian. Se trata de una variante afinada mediante supervisión (SFT) durante 5.000 pasos con tasa de aprendizaje 2e-5 sobre trazas de razonamiento del conjunto CDM, a partir de una arquitectura base de dimensión oculta 1792, 16 capas y 64 slots de workspace (semilla 3). El modelo se distribuye con licencia Apache 2.0 y pesos en formato `model.pt` (state dict de PyTorch), no en safetensors ni GGUF.

Su relevancia es fundamentalmente experimental: la model card lo presenta como demostración de la "Ley Unificada de Protección de Solitones v4" (fase 6 del programa de investigación de DuoNeural), que describe qué estructuras topológicas internas sobreviven al entrenamiento supervisado. El modelo no es un LLM de propósito general comparable a los transformers convencionales, sino un artefacto de investigación sobre dinámica de representaciones y estabilidad de Lyapunov durante el fine-tuning.

No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K) y las métricas de perplejidad en WikiText-103 y CoT Hard figuran como "TBD (eval running)" en la propia model card. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Resonant Metriplectic Sheaf Network (RMSN), formulacion Port-Hamiltonian: ḟ = {f,H} + [f,S] |
| Parametros totales | 602,45 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | max_seq_len = 512 |
| Tipos de cuantizacion | no disponible (pesos publicados en `model.pt`, sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.pt` (state dict PyTorch, clave `model_state`) |
| Dimension oculta | 1792 |
| Numero de capas | 16 |
| Workspace slots | 64 |
| Tokenizer | HuggingFaceTB/cosmo2-tokenizer (vocab = 49.152) |
| Libreria | custom (`rmsn_core`) |
| Tamano del repo | 2,1 GB |

## Arquitectura y entrenamiento

La arquitectura RMSN se describe como una red "metriplectica" con formulación Port-Hamiltonian, es decir, una dinámica que combina una parte conservativa (corchete de Poisson `{f,H}`) y una parte disipativa (corchete `[f,S]`). El modelo tiene 16 capas, dimensión oculta 1792, 64 slots de workspace y un vocabulario de 49.152 tokens heredado del tokenizer `HuggingFaceTB/cosmo2-tokenizer`. La model card identifica una "topología de guía de onda de doble frontera" (Dual-Boundary Waveguide) en las capas [L0, L7, L8, L15] de la versión base, caracterizada por medir la "ratio de participación" (PR) de cada capa: L0 y L8 son "casi exactas" (PR < 2,0), L15 es un "condensado exacto" (PR = 1,000) y L7 es un "solitón débil" (PR > 6).

El entrenamiento consistió en SFT durante 5.000 pasos con LR = 2e-5 sobre "trazas de razonamiento CDM". No se especifica en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset, ni si hubo RLHF o DPO. La innovación técnica que se reporta es empírica: tras el SFT, L0, L8 y L15 se mantienen protegidas (L8 incluso se "condensa" a PR = 1,091), mientras que L7 se disuelve (PR pasa de >6 a 7,801). La model card formula con ello la "Ley Unificada de Protección de Solitones v4", que clasifica las capas por su PR base y predice su destino bajo SFT: condensado exacto (PR = 1,000) siempre protegido; casi exacto (PR < 2,0) siempre protegido y extiende la cascada de protección a capas fuertes adyacentes; fuerte (PR 2,0-4,0) sobrevive como miembro terminal del clúster o si es adyacente a una casi exacta; moderada (PR 4,0-6,0) sobrevive solo a 1-2 capas de un condensado; débil (PR > 6,0) siempre se disuelve. El resultado principal del modelo es que un par contiguo con clases mixtas [L7, L8] sigue cada capa su propia ley de forma independiente: la contigüidad por sí sola no crea protección de clúster a través de fronteras de clase.

Se reporta estabilidad de Lyapunov del 100% (todos los pasos con `lyap < 0`) y `best_loss = 1,9037`, ligeramente mejor que la variante D=1792 s1 (1,9286) pese a retener más topología, lo que según el autor cuestiona la suposición de que la compresión topológica mejora la pérdida de SFT.

## Capacidades

- Generación de texto autorregresiva en inglés, condicionada a un contexto máximo de 512 tokens.
- Razonamiento de tipo cadena de pensamiento (CoT), presumiblemente inducido por el SFT sobre trazas de razonamiento CDM, aunque sin métricas publicadas que lo cuantifiquen.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso orquestado.
- Capacidad multilingüe limitada al inglés según el campo `language: en`.
- No se documentan capacidades de visión, audio, thinking mode explícito ni decodificación especulativa.
- Capacidad de interés científico (no de producto): servir como banco de pruebas reproducible de la Ley de Protección de Solitones v4 y de la dinámica Port-Hamiltonian bajo SFT.

## Casos de uso

- Investigación sobre dinámica de representaciones: reproducir el experimento de SFT de 5.000 pasos sobre la base D=1792 s3 y verificar la evolución de los PR por capa (L0, L7, L8, L15) descrita en la model card.
- Estudio de estabilidad de Lyapunov en entrenamiento: usar el registro de `lyap < 0` en todos los pasos como caso de referencia para comparar con arquitecturas transformer convencionales bajo el mismo régimen de SFT.
- Validación de la Ley de Protección de Solitones v4: diseñar variantes con pares contiguos de distinta clase (por ejemplo, fuerte + casi exacta) para comprobar si la cascada de protección se extiende a capas adyacentes como predice la ley.
- Reproducción de la pérdida de SFT reportada: verificar el `best_loss = 1,9037` y compararlo con la variante s1 (1,9286) para testear la hipótesis de que la compresión topológica no mejora necesariamente la pérdida.
- Generación de texto corto en inglés con contexto de hasta 512 tokens en entornos de laboratorio, siempre que se asuma la ausencia de benchmarks de calidad y de evaluación de alucinación.
- Docencia y divulgación sobre arquitecturas no transformer: el código de `rmsn_core` y la formulación Port-Hamiltonian permiten ilustrar dinámicas conservativas y disipativas en un modelo de 602 M de parámetros que cabe en una GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente métricas internas de entrenamiento:

| Metrica | Valor |
|---|---|
| SFT best_loss | 1,9037 |
| Estabilidad de Lyapunov | 100% de pasos con lyap < 0 |
| WikiText-103 PPL | TBD (eval en curso) |
| CoT Hard PPL | TBD (eval en curso) |
| MMLU / HumanEval / GSM8K | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,4 GB solo para pesos (602,45 M × 4 bytes), más activaciones y KV cache para contexto de 512 tokens; en la práctica, menos de 4 GB en fp32 y en torno a 1,2-1,5 GB en fp16/bf16.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes. El modelo cabe holgadamente en GPUs de consumo.
- Despliegue: no hay soporte nativo en vLLM, TGI, llama.cpp ni Ollama, ya que la librería es `custom` (`rmsn_core`) y los pesos se cargan con `torch.load` sobre un `state_dict`. El despliegue requiere el paquete `rmsn_core` del autor.
- Latencia y throughput: no disponibles. Con 16 capas y 602 M de parámetros se espera una latencia baja, pero no se han publicado mediciones.
- El repositorio ocupa 2,1 GB, lo que sugiere que los pesos podrían estar en fp32 junto con checkpoints u otros artefactos.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables: la arquitectura RMSN Port-Hamiltonian no tiene equivalentes públicos en la misma categoría. A modo de referencia dimensional, se comparan alternativas transformer de tamaño similar, aunque la comparación de rendimiento no es posible por falta de benchmarks del modelo RMSN.

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks publicados |
|---|---|---|---|---|---|
| RMSN-602M-DualBoundary-SFT5k | 602,45 M | 512 | Apache 2.0 | `model.pt` (custom) | no disponible |
| Qwen2.5-0.5B | ~494 M | 32.768 | Apache 2.0 | safetensors, GGUF | si (MMLU, GSM8K, HumanEval) |
| SmolLM2-360M | ~362 M | 8.192 | Apache 2.0 | safetensors, GGUF | si |
| Phi-1.5 (1.3B) | 1,3 B | 2.048 | MIT | safetensors | si |

La comparación relevante no es de rendimiento sino de naturaleza: los tres transformer citados son modelos de propósito general con ecosistema de despliegue estándar, mientras que RMSN-602M es un artefacto de investigación sin pipeline declarado y con contexto de solo 512 tokens.

## Limitaciones y advertencias

- Ausencia total de benchmarks de calidad: no hay MMLU, HumanEval, GSM8K ni evaluaciones de alucinación; WikiText-103 PPL y CoT Hard PPL están pendientes ("TBD").
- Contexto muy corto (512 tokens), insuficiente para la mayoría de aplicaciones de producción con documentos largos o conversaciones multi-turno extensas.
- Solo inglés; no se declara soporte multilingüe.
- Formato de pesos no estándar (`model.pt` con `state_dict` y dependencia de `rmsn_core`), lo que impide usarlo con vLLM, llama.cpp, Ollama o TGI sin trabajo de portabilidad.
- Sin pipeline declarado en Hugging Face y con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.
- Las afirmaciones sobre "solitones", "condensación" y la "Ley de Protección de Solitones v4" provienen exclusivamente de la model card del autor y no han sido replicadas de forma independiente en la información disponible; deben tratarse como hipótesis de investigación, no como resultados consolidados.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones de sesgo, toxicidad y alucinación desaconseja cualquier despliegue en producción orientado a usuarios.
- El modelo se entrenó con SFT sobre trazas de razonamiento CDM cuyo origen y composición no se detallan, lo que impide evaluar sesgos de datos.
- Riesgo de sobreinterpretación de las métricas internas: `best_loss = 1,9037` no es comparable con pérdidas de modelos transformer entrenados con otros datasets y tokenizers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-602M-DualBoundary-SFT5k
- Tokenizer utilizado: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Paper, blog, repositorio de código (`rmsn_core`) y demos: no disponibles en la información proporcionada.
