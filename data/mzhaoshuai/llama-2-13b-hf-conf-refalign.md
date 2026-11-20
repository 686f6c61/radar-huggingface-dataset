# mzhaoshuai/Llama-2-13b-hf-conf-refalign

## Resumen

Llama-2-13b-hf-conf-refalign es un adaptador PEFT (LoRA) sobre el modelo base mzhaoshuai/Llama-2-13b-hf-conf-sft, que a su vez deriva de Llama 2 13B de Meta. Lo publica el usuario mzhaoshuai como parte del proyecto RL2R (anteriormente RefAlign), un marco de aprendizaje por refuerzo con recompensas basadas en referencia (reference-based rewards) orientado a mejorar el razonamiento y la alineacion de modelos de lenguaje. El adaptador se ha entrenado sobre el dataset shuchangtao/CONQORD_dataset, en concreto sobre el subconjunto conqord_step3_data, y esta documentado en el paper arXiv:2504.09895.

El modelo no es un modelo base nuevo ni un modelo instructivo de proposito general: es un artefacto de investigacion que representa una etapa concreta de un pipeline de alineacion por RL. Su interes es principalmente metodologico, ya que permite reproducir y estudiar la tecnica RL2R sobre una arquitectura Llama 2 13B estandar, con licencia Llama 2 y pesos en formato safetensors compatibles con la libreria PEFT.

Dado que se trata de un adaptador LoRA de ~0,5 GB, requiere cargar el modelo base mzhaoshuai/Llama-2-13b-hf-conf-sft (13 mil millones de parametros, transformer denso) y aplicar el adaptador encima. La ficha se centra en lo que la informacion disponible permite afirmar; muchos detalles de entrenamiento, contexto, idiomas y rendimiento no estan documentados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), adaptador LoRA/PEFT sobre el modelo base |
| Parametros totales | 13 mil millones en el modelo base; tamano del adaptador no disponible (repo de 0,5 GB) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Llama 2: 4096 tokens como valor de referencia de la familia) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; cuantizacion del base no especificada) |
| Idiomas soportados | no disponible |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base en su formato original |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 2 13B, un transformer decoder-only denso con atencion causal estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El adaptador en si es un conjunto de matrices LoRA de bajo rango entrenadas con PEFT 0.11.1, que modifican las proyecciones del modelo base sin reentrenar todos los pesos. El modelo base intermedio (Llama-2-13b-hf-conf-sft) indica una etapa previa de fine-tuning supervisado (SFT) sobre el mismo linaje "conf".

El entrenamiento del adaptador corresponde a la etapa de alineacion del metodo RL2R (Reinforcement Learning with Reference-Based Rewards), descrito en el paper arXiv:2504.09895. Este enfoque utiliza recompensas basadas en una referencia para guiar el razonamiento y la alineacion del modelo, en lugar de depender exclusivamente de un reward model aprendido o de preferencias humanas directas. El dataset empleado es shuchangtao/CONQORD_dataset, concretamente el subconjunto conqord_step3_data, lo que sugiere un pipeline por etapas. No se dispone de informacion sobre numero de tokens de entrenamiento, composicion exacta del dataset, hiperparametros de RL ni si se aplicaron tecnicas adicionales como DPO o decodificacion especulativa.

## Capacidades

- Generacion de texto autoregresiva heredada de Llama 2 13B.
- Razonamiento y alineacion mejorados teoricamente por la etapa RL2R, segun el objetivo del paper; no hay evaluacion publicada en la informacion disponible.
- Soporte de tool calling / function calling: no documentado; no se puede asumir.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente.
- Capacidades multilingues: no documentadas; Llama 2 tiene cobertura multilingue limitada y sesgada al ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- El modelo es un adaptador de investigacion; su uso previsto es experimental, no como asistente de produccion.

## Casos de uso

- Investigacion en alineacion por RL: reproducir la etapa RL2R sobre Llama 2 13B para estudiar el efecto de las recompensas basadas en referencia frente a otros esquemas de RLHF/DPO. Es adecuado porque el adaptador esta publicado junto al paper y el dataset.
- Estudio comparativo de adaptadores LoRA: cargar el base Llama-2-13b-hf-conf-sft y aplicar este adaptador para comparar la etapa SFT frente a la etapa RL2R en tareas de razonamiento.
- Analisis de pipelines por etapas: el linaje conf-sft -> conf-refalign y el uso de conqord_step3_data permiten diseccionar como cambia el comportamiento del modelo entre etapas de entrenamiento.
- Experimentos de evaluacion de alineacion: usar el modelo como sujeto de pruebas en benchmarks de razonamiento y seguridad para medir el impacto del metodo RL2R.
- Base para fine-tuning posterior: al ser un adaptador PEFT, se puede combinar o continuar entrenando con otros adaptadores sobre el mismo base para experimentos academicos.
- Docencia y divulgacion: ilustrar como se estructura un artefacto de investigacion en Hugging Face (adaptador + base + dataset + paper) en cursos de IA open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Llama 2 13B requiere aproximadamente 26 GB en FP16; en cuantizacion 8 bits unos 14-16 GB; en 4 bits unos 8-10 GB. El adaptador anade una sobrecarga minima (repo de 0,5 GB).
- GPU recomendadas: A100 40/80 GB, H100, L40S para FP16 sin cuantizar; RTX 4090 (24 GB) suficiente en FP16 justo o en cuantizacion 8 bits; RTX 3090/4080 (16-24 GB) en cuantizacion.
- Cabe en GPU de consumo: si, en GPUs de 16-24 GB aplicando cuantizacion (8 o 4 bits) del modelo base.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; llama.cpp/Ollama requieren convertir el adaptador al formato GGUF (soportado por herramientas de conversion); vLLM y TGI soportan LoRA en algunos casos, pero la compatibilidad con este adaptador concreto no esta documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-2-13b-hf-conf-refalign (este) | 13B (base) + LoRA | no disponible (base: 4096) | llama2 | safetensors (PEFT) | Adaptador de investigacion RL2R |
| Llama-2-13b-hf-conf-sft | 13B | no disponible (base: 4096) | llama2 | safetensors | Etapa SFT previa del mismo linaje |
| Llama 2 13B Chat (Meta) | 13B | 4096 | llama2 | safetensors, GGUF | Modelo instructivo de referencia de la familia |
| Adaptadores RLHF/DPO publicos sobre Llama 2 | 13B (base) + LoRA | 4096 | llama2 | safetensors (PEFT) | Alternativas metodologicas; rendimiento no comparable sin benchmarks |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Es un adaptador de investigacion con muy poca adopcion (6 descargas, 0 likes en el momento de la consulta); no hay evidencia de validacion en produccion.
- No se han publicado benchmarks ni evaluaciones de calidad en la informacion disponible; no se puede afirmar mejora sobre el modelo base.
- Riesgo de alucinacion inherente a Llama 2 13B, no mitigado de forma documentada.
- Sesgos conocidos de Llama 2 (genero, raza, religion, orientacion sexual) heredados del modelo base; el adaptador no documenta mitigaciones.
- Idiomas soportados no documentados; Llama 2 esta optimizado para ingles y su rendimiento en castellano es limitado.
- La licencia llama2 impone restricciones de uso comercial (limite de 700 millones de usuarios mensuales, obligaciones de atribucion y politicas de uso aceptable); revisar los terminos antes de cualquier uso comercial.
- Requiere cargar el modelo base mzhaoshuai/Llama-2-13b-hf-conf-sft, que a su vez depende de Llama 2; la trazabilidad de licencias debe verificarse en toda la cadena.
- Compatibilidad con frameworks de despliegue (vLLM, TGI, llama.cpp) no documentada para este adaptador concreto.
- No usar como asistente de atencion al cliente ni en decisiones automatizadas sin evaluacion previa.

## Enlaces

- Hugging Face: https://huggingface.co/mzhaoshuai/Llama-2-13b-hf-conf-refalign
- Modelo base: https://huggingface.co/mzhaoshuai/Llama-2-13b-hf-conf-sft
- Dataset: https://huggingface.co/datasets/shuchangtao/CONQORD_dataset
- Subconjunto conqord_step3_data: https://huggingface.co/datasets/shuchangtao/CONQORD_dataset/tree/main/conqord_step3_data
- Paper (arXiv:2504.09895): https://huggingface.co/papers/2504.09895
- Repositorio GitHub RL2R: https://github.com/mzhaoshuai/RL2R/tree/alignment
