# Easonnoway/qwen3-4b-ablation-no-benign

## Resumen

Qwen3-4b-ablation-no-benign es un modelo de investigación publicado por el usuario Easonnoway como control de ablación para el artículo ImmuneCoT, un trabajo sobre alineamiento de seguridad y control de cadenas de razonamiento (chain-of-thought) en modelos de lenguaje. Se trata de un fine-tuning completo de Qwen/Qwen3-4B entrenado con el método ImmuneCoT (fusión por producto de expertos, PoE) sobre el subconjunto exclusivamente dañino del dataset IASD, eliminando por completo las muestras benignas. Su propósito no es el despliegue en producción, sino responder a una pregunta de revisión por pares: qué ocurre con el comportamiento de rechazo cuando se suprime la mitad benigna de los datos de calibración.

El modelo conserva la arquitectura transformer densa de Qwen3-4B, con 4.022.468.096 parámetros totales, y se distribuye en formato safetensors (8,8 GB de repositorio) bajo licencia Apache 2.0. Solo declara soporte para inglés y está etiquetado con los tags safety, chain-of-thought, immunecot y rebuttal-control. No se han publicado datos de pipeline ni de contexto específicos para este checkpoint más allá de los heredados del modelo base.

Su relevancia es metodológica: los resultados del autor muestran que eliminar los datos benignos desplaza el umbral de rechazo hacia un comportamiento más conservador tanto en prompts seguros como dañinos, lo que sugiere que la mitad benigna del dataset calibra la frontera entre responder y rechazar, y no solo enseña a responder más. Es, por tanto, una pieza de evidencia empírica para quienes investigan alineamiento de seguridad, no un modelo listo para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B; no confirmada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint-54, weights-only) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B en bf16 y aplica un fine-tuning de parámetros completos (full-parameter) durante 2 épocas, equivalentes a 54 pasos de optimizador, con batch efectivo de 32 (4 por dispositivo × acumulación de gradiente 8 × 1 GPU). Se usa AdamW fusionado con learning rate de 5e-6, decaimiento lineal, sin warmup y clipping de 1.0, en precisión bf16 con DeepSpeed ZeRO-2 y offload del optimizador a CPU. La pérdida es KL forward (beta=0) con top-k 256 y fusión `poe`; los coeficientes auxiliares son λ_rec=0.5, λ_detect=0.5 y λ_res=0.7, con clamp base de -20. El rollout se realiza con vLLM colocado en el mismo nodo (mem 0.15), temperatura 0.7, top-p 0.95 y top-k 20, con max_length de 4608 y max_completion de 2048. La semilla es 42 tanto para modelo como para datos.

La innovación técnica del trabajo ImmuneCoT reside en el mecanismo de fusión por producto de expertos (PoE) aplicado al control de la cadena de razonamiento, junto con las pérdidas auxiliares de detección y resistencia. Este checkpoint concreto es una ablación: se eliminan todas las muestras benignas del dataset `iasd_data_decontam_v1`, quedando 858 registros exclusivamente dañinos. El resto de hiperparámetros coincide con la configuración del método principal (`Easonnoway/qwen3-4b-icot`), de modo que la única variable independiente es la composición del dataset. El checkpoint final es `checkpoint-54`, guardado solo con pesos (`save_only_model=True`).

## Capacidades

- Generación de texto y razonamiento en inglés, heredados del modelo base Qwen3-4B.
- Modo de razonamiento explícito (thinking mode), ya que la evaluación se realizó bajo protocolo de thinking-mode.
- Control de rechazo (refusal control) entrenado específicamente para clasificar y gestionar solicitudes dañinas.
- Detección interna de contenido dañino mediante la pérdida auxiliar de detección (λ_detect=0.5).
- Resistencia a ataques de elicitación (λ_res=0.7), orientada a mantener el comportamiento seguro bajo presión adversarial.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de visión o audio: no disponibles (modelo de texto).

## Casos de uso

- Investigación en alineamiento de seguridad: sirve como control experimental para aislar el efecto de los datos benignos en la calibración del umbral de rechazo, comparando directamente con `Easonnoway/qwen3-4b-icot`.
- Reproducibilidad de resultados de revisión por pares: permite a otros grupos replicar la ablación "no-benign" con la misma semilla (42) y configuración, verificando los porcentajes de ASR y ORR reportados.
- Estudio de la frontera rechazo-respuesta: útil para analizar cómo se desplaza el umbral cuando se entrena solo con ejemplos dañinos, midiendo el incremento relativo del 30% en ORR sobre XSTest safe.
- Evaluación comparativa de métodos de seguridad: se puede emplear como línea base en experimentos que comparen ImmuneCoT con otras técnicas de alineamiento (DPO, RLHF, filtrado de datos).
- Análisis de sobre-rechazo (over-refusal): dado su ORR del 5,2% en XSTest safe, es adecuado para estudiar el coste de seguridad en términos de utilidad y falsos positivos.
- Docencia y formación técnica: como ejemplo didáctico de ablación controlada en un pipeline de fine-tuning con DeepSpeed ZeRO-2 y vLLM, mostrando el impacto de la composición del dataset.
- Auditoría de datasets de seguridad: permite estudiar empíricamente qué aporta la mitad benigna de IASD, informando decisiones de curación de datos en proyectos similares.

## Benchmarks y rendimiento

Evaluación bajo protocolo de thinking-mode, según la model card del autor:

| Benchmark | Métrica | no_benign (este repo) | Método principal (icot) |
|---|---|---|---|
| HarmBench (320) | ASR | 5,6% (18/320) | 6,2% |
| XSTest safe (250) | ORR | 5,2% (13/250) | 4,0% (10/250) |
| XSTest unsafe (200) | ASR | 24,5% (49/200) | 27,0% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad general en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8 GB solo para pesos (4,02 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: alrededor de 4-5 GB; en 4 bits, alrededor de 2,5-3,5 GB (estimaciones teóricas, no verificadas en la información proporcionada).
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) para entrenamiento o serving de alta concurrencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y GPUs con 12-16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: vLLM (usado por el autor en el rollout de entrenamiento), llama.cpp y Ollama si se generan pesos GGUF (no publicados en el repo), TGI y transformers estándar.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4b-ablation-no-benign (este) | 4,02 B | no disponible | Ablación ImmuneCoT sin datos benignos | Apache 2.0 | Hugging Face |
| Easonnoway/qwen3-4b-icot | 4,02 B (heredado) | no disponible | Método principal ImmuneCoT | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B | 4,02 B | no disponible en esta ficha | Modelo base generalista | Apache 2.0 | Hugging Face |

La comparación directa con alternativas de seguridad de otros autores no está disponible en la información proporcionada. La diferencia clave frente al método principal es la composición del dataset: el modelo principal incluye datos benignos y obtiene un ASR de 6,2% en HarmBench y un ORR de 4,0% en XSTest safe, mientras que esta ablación alcanza 5,6% y 5,2% respectivamente.

## Limitaciones y advertencias

- Modelo de investigación: concebido como control de ablación, no como producto listo para producción; su comportamiento está calibrado para un experimento concreto.
- Sobre-rechazo: el ORR del 5,2% en XSTest safe supone un incremento relativo del 30% frente al método principal, lo que implica más falsos rechazos en prompts legítimos.
- Sesgos: no se documentan análisis de sesgo en la información proporcionada; al entrenarse solo con datos dañinos, puede heredar y amplificar sesgos presentes en ese subconjunto.
- Riesgo de alucinación: no evaluado en la información disponible; el entrenamiento con 858 registros y 54 pasos de optimizador limita la cobertura de dominios.
- Idioma: solo inglés declarado; el rendimiento en castellano u otros idiomas no está garantizado.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B y las políticas de uso responsable del autor original deben respetarse; la naturaleza del fine-tuning (datos dañinos) aconseja auditoría previa a cualquier despliegue.
- Contexto: la longitud de contexto efectiva no está confirmada para este checkpoint; el entrenamiento usó max_length de 4608, inferior al contexto nativo del modelo base.
- Reproducibilidad: depende de la semilla 42 y de la configuración exacta de DeepSpeed y vLLM; pequeñas variaciones pueden alterar los porcentajes reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Easonnoway/qwen3-4b-ablation-no-benign
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Método principal (referencia del autor): https://huggingface.co/Easonnoway/qwen3-4b-icot
- Paper ImmuneCoT: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
