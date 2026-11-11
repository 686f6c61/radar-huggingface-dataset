# DuoNeural/RMSN-602M-COEXISTENCE-SFT5k

## Resumen

RMSN-602M-COEXISTENCE-SFT5k es un modelo de lenguaje de 601,78 millones de parámetros desarrollado por DuoNeural Lab, presentado como el experimento insignia de su "Fase 6". Se trata de una red neuronal con arquitectura propietaria denominada Resonant Metriplectic Sheaf Network (RMSN), construida sobre un formalismo port-Hamiltoniano (ḟ = {f,H} + [f,S]) que combina una parte conservativa (corchete de Poisson) con una parte disipativa. El modelo ha sido sometido a un ajuste supervisado (SFT) de 5000 pasos con tasa de aprendizaje 2e-5 sobre trazas de razonamiento.

El objetivo declarado del trabajo no es tanto ofrecer un modelo de propósito general como documentar empíricamente la que el autor denomina "Ley de Protección de Contigüidad de Solitones": la tesis de que la variable que determina qué capas tipo solitón sobreviven al fine-tuning supervisado es la contigüidad topológica del clúster, no la posición de la singularidad. La model card reporta que, tras el SFT, la topología base de 7 capas (Bulk+Terminal) se comprimió aproximadamente un 50 % hasta una topología "Upstream" de 5 capas activas, manteniendo intacta la capa L15 con un valor de 1.000.

Por su naturaleza, es un artefacto de investigación más que un modelo listo para producción: utiliza una librería propia (`rmsn_core`), pesos en formato `.pt` (PyTorch pickle) y una tokenizer externa (HuggingFaceTB/cosmo2-tokenizer). Su relevancia actual es limitada fuera del círculo del autor, pero resulta de interés para quienes investigan arquitecturas alternativas a los transformers estándar y dinámicas de olvido catastrófico durante el fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Resonant Metriplectic Sheaf Network (RMSN), formalismo port-Hamiltoniano |
| Parametros totales | 601,78 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_seq_len en la configuracion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (checkpoint PyTorch con clave `model_state`) |

Especificaciones adicionales reportadas en la model card:

| Parametro | Valor |
|---|---|
| Dimension oculta | 1792 |
| Numero de capas | 16 |
| Workspace slots | 64 |
| Tokenizer | HuggingFaceTB/cosmo2-tokenizer (vocab = 49152) |
| Tamano del repo | 2,1 GB |
| Framework | `rmsn_core` (libreria propia, `library_name: custom`) |

## Arquitectura y entrenamiento

La arquitectura RMSN se describe como una red "metripléctica" port-Hamiltoniana, con una ecuación de evolución de la forma ḟ = {f,H} + [f,S], donde el corchete de Poisson representa la dinámica conservativa y el término disipativo introduce estabilidad. El modelo tiene 16 capas con dimensión oculta 1792, 64 "workspace slots" y emplea la tokenizer cosmo2 con un vocabulario de 49152 tokens. La model card no detalla la composición del dataset de preentrenamiento ni el número de tokens utilizados.

El ajuste supervisado (SFT) se realizó durante 5000 pasos con LR = 2e-5 sobre trazas de razonamiento (reasoning traces). La model card reporta una pérdida mínima de SFT de 2,7058, una perplejidad de 163,16 en WikiText-103 y de 13,64 en el conjunto "CoT Hard". Se declara estabilidad de Lyapunov al 100 % (todos los pasos con exponente de Lyapunov negativo). El hallazgo central es la compresión topológica de la red: la topología base de 7 capas activas ([L0, L4, L5, L6, L7, L8, L9, L10, L15]) pasa tras el SFT a una topología "Upstream" comprimida de 5 capas ([L0, L5, L9, L10, L15]). No se documentan fases de RLHF ni DPO.

## Capacidades

- Generación de texto autoregresiva en inglés, con tokenizer de vocabulario 49152.
- Razonamiento de tipo chain-of-thought: la model card reporta una perplejidad de 13,64 en el conjunto "CoT Hard", que el autor presenta como el mejor resultado de su clase en D=1792.
- Capacidad de modelado de lenguaje general medida mediante perplejidad en WikiText-103 (163,16).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso orquestado.
- Capacidades multilingües: solo inglés declarado; no hay evidencia de otros idiomas.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito más allá del entrenamiento sobre trazas de razonamiento.

## Casos de uso

- Investigación sobre olvido catastrófico y poda topológica: el modelo sirve como banco de pruebas reproducible para estudiar qué subredes sobreviven al SFT, comparando la topología pre y post-ajuste documentada en la model card.
- Estudio de arquitecturas alternativas a transformers: permite replicar el formalismo port-Hamiltoniano y la dinámica metripléctica en un modelo de tamaño medio (602 M) que cabe en una sola GPU de consumo.
- Experimentos de estabilidad dinámica: la métrica de estabilidad de Lyapunov al 100 % lo hace útil para validar técnicas de regularización dinámica en redes recurrentes o de estado continuo.
- Generación de texto en inglés en entornos de investigación con contexto corto (512 tokens): adecuado para tareas de completado o resumen breve donde no se requiera calidad de producción.
- Reproducción de la "Ley de Contigüidad de Solitones": el checkpoint permite verificar la compresión del waveguide extendido y la protección de condensados exactos (PR=1.000).
- Docencia y divulgación: ejemplo didáctico de cómo un SFT modifica la topología efectiva de una red y de cómo medir perplejidad en dominios de razonamiento frente a dominios generales.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| SFT best_loss | 2,7058 |
| WikiText-103 PPL (post-SFT) | 163,16 |
| CoT Hard PPL (post-SFT) | 13,64 |
| Estabilidad de Lyapunov | 100 % (todos los pasos lyap < 0) |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la información disponible. No se dispone de comparaciones numéricas con modelos de referencia de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,4 GB solo para pesos (601,78 M × 4 bytes), más activaciones y overhead del runtime; en la práctica se recomienda al menos 4-6 GB.
- VRAM estimada en fp16/bf16: aproximadamente 1,2 GB para pesos; viable en GPUs de consumo con 4 GB o más.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para fp32; para fp16 basta con 4 GB.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI; la carga se realiza mediante la librería propia `rmsn_core` con `torch.load` y `RMSNForCausalLM`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no proporciona comparaciones con modelos de la misma categoría, y la arquitectura propietaria (RMSN port-Hamiltoniana) no tiene equivalentes públicos directos con los que establecer una comparación fiable de parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- Modelo de investigación: la librería necesaria (`rmsn_core`) no es estándar y no se distribuye a través de ecosistemas convencionales (transformers, vLLM), lo que dificulta su adopción en producción.
- Contexto muy limitado: 512 tokens, insuficiente para la mayoría de aplicaciones reales (RAG, agentes, documentos largos).
- Solo inglés: no hay soporte multilingüe declarado.
- Perplejidad elevada en dominio general (163,16 en WikiText-103), lo que sugiere una calidad de generación de texto general limitada.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de veracidad ni de sesgos.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no incluye garantías ni documentación de seguridad.
- Los pesos en formato `.pt` requieren `torch.load`, lo que implica riesgos de seguridad si el checkpoint no es de confianza (pickle).
- Sin datos de benchmarks estándar: no es posible evaluar su rendimiento frente a modelos de tamaño comparable con métricas reconocidas.
- La terminología y los hallazgos (ley de contigüidad, solitones, estabilidad de Lyapunov) provienen exclusivamente del autor y no han sido validados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-602M-COEXISTENCE-SFT5k
- Tokenizer utilizada: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Repositorio de la librería `rmsn_core`: no disponible
- Paper o blog del autor: no disponible
- Demo: no disponible
