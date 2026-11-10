# Easonnoway/qwen3-4b-ablation-matched-response

## Resumen

Qwen3-4B ImmuneCoT Ablation: Matched Response Thinking Format es un ajuste fino completo (full-parameter) del modelo Qwen3-4B de Alibaba, publicado por el usuario Easonnoway en Hugging Face. No se trata de un modelo de propósito general, sino de un control experimental de ablación para el paper ImmuneCoT, un trabajo de investigación sobre seguridad en modelos de lenguaje y control de respuestas (rebuttal-control). El objetivo del artefacto es aislar el efecto del formato de razonamiento del profesor de respuestas dentro del pipeline de entrenamiento IASD (ImmuneCoT Alignment via Self-Distillation, por sus siglas en el contexto del repositorio).

El modelo parte de la arquitectura transformer densa de Qwen3-4B, con 4.022.468.096 parámetros totales y pesos en bf16 (repo de 8,8 GB). Se entrenó durante 2 épocas (100 pasos de optimizador) sobre un conjunto de datos de 1571 registros (`iasd_data_decontam_v1.json`), con destilación desde tres contextos de profesor (Base, Recognition y Response) fusionados mediante Product of Experts (PoE) y ajuste KL forward. La única diferencia respecto al run principal de ImmuneCoT es que el contexto del profesor de respuestas se condiciona a un formato de pensamiento coincidente con el `<think>` del estudiante (`--response_thinking True`).

Su relevancia es fundamentalmente metodológica: sirve como referencia de control para comparar contra el modelo principal de ImmuneCoT y determinar si la ganancia de seguridad atribuida al método depende del formato de respuesta del profesor. No está pensado para uso en producción ni como asistente general, y de hecho no tiene descargas ni interacciones registradas. La licencia es Apache 2.0 y los idiomas declarados se limitan al inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B) |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-4B; no se especifica en la model card) |
| Tipos de cuantización | No disponible (pesos publicados en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint-100, solo pesos, `save_only_model=True`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parámetros completos sobre Qwen3-4B en bf16, sin cambios arquitectónicos respecto al base. El entrenamiento emplea destilación con tres contextos de profesor (Base, Recognition y Response) con el profesor congelado y fusión PoE con λ=(0.5, 0.5, 0.7) y clamp del base en -20. La pérdida es KL forward con beta=0, clip por token de 1.0 y top-k 256. El rollout del estudiante es on-policy mediante vLLM en modo colocate (memoria 0.15, temperatura 0.7, top-p 0.95, top-k 20), con `max_length` 4608 y `max_completion` 2048.

La configuración concreta: 2 épocas (100 pasos), batch efectivo 32 (4 por dispositivo × acumulación de gradiente 4 × 2 GPUs), optimizador AdamW fused con LR 5e-6 y decaimiento lineal, sin warmup, clip de gradiente 1.0, precisión bf16 con DeepSpeed ZeRO-2 y offload del optimizador a CPU. La semilla es 42 tanto para modelo como para datos. El autor documenta que un batch por dispositivo de 8 (batch efectivo 32) provocó OOM en el reparto de 2 GPUs debido a las secuencias largas del formato de pensamiento, por lo que se redujo a 4 con acumulación 4 manteniendo el batch efectivo. La innovación técnica diferencial de este artefacto es precisamente la condición de control: el profesor de respuestas se condiciona a un formato de pensamiento coincidente con el del estudiante, lo que permite aislar el efecto del formato en el pipeline ImmuneCoT.

## Capacidades

- Generación de texto y razonamiento en inglés, heredados de Qwen3-4B, pero condicionados por el ajuste fino de seguridad del pipeline ImmuneCoT.
- Modo de razonamiento con etiquetas `<think>`, presente en el formato de entrenamiento del estudiante y del profesor de respuestas.
- Control de respuestas (rebuttal-control): el modelo está entrenado para producir respuestas alineadas con los criterios de seguridad del dataset IASD, no para conversación abierta.
- Destilación multi-profesor: el comportamiento final integra señales de tres contextos (Base, Recognition, Response) fusionadas por PoE.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de visión o audio: no disponibles; el modelo es solo texto.

## Casos de uso

- Referencia de control en experimentos de alineación de seguridad: se usa como baseline para comparar contra el run principal de ImmuneCoT y medir si la mejora en seguridad depende del formato de respuesta del profesor. Es su propósito declarado y el único caso de uso claramente justificado por la model card.
- Reproducibilidad de investigación: permite replicar el experimento `qwen3_4b_response_thinking_seed42` con la misma semilla, datos e hiperparámetros documentados, facilitando la verificación de resultados del paper.
- Ablación de formato de razonamiento: sirve para estudiar cómo el formato `<think>` del profesor afecta a la destilación de comportamientos de rechazo o respuesta segura en modelos pequeños.
- Evaluación de métodos de destilación con PoE: el checkpoint permite analizar la fusión de tres profesores con pesos λ=(0.5, 0.5, 0.7) en un modelo de 4B, un tamaño manejable para experimentos académicos.
- Estudio de robustez ante jailbreaks en modelos ajustados: al ser un modelo entrenado específicamente para control de respuestas, puede emplearse como sujeto de pruebas en evaluaciones de seguridad comparativas.
- Docencia y formación en técnicas de alineación: el artefacto, junto con su configuración de entrenamiento detallada, sirve como ejemplo práctico de un pipeline IASD con vLLM colocate y DeepSpeed ZeRO-2 en 2 GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8 GB solo para pesos (4.022 M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 10 y 12 GB para contextos moderados.
- Cuantización a 8 bits: alrededor de 4-5 GB de pesos; a 4 bits, alrededor de 2,5-3 GB, aunque no se documentan versiones cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluación a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en bf16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantización, en GPUs de 8-12 GB.
- Opciones de despliegue: vLLM (usado en el propio entrenamiento en modo colocate), llama.cpp/Ollama para cuantización GGUF (no documentado por el autor), TGI y transformers estándar.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B ImmuneCoT Matched Response (este) | 4.022 M | No disponible | Apache 2.0 | Control de ablación para seguridad (ImmuneCoT) | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B (base) | 4.022 M | No disponible en esta ficha | Apache 2.0 | Modelo generalista con modo thinking | Hugging Face, ampliamente usado |
| Run principal ImmuneCoT Qwen3-4B (referencia del paper) | 4.022 M | No disponible | Apache 2.0 (presumible) | Método completo ImmuneCoT | No disponible en la información proporcionada |
| Otros ajustes de seguridad sobre modelos 4B | Variable | Variable | Variable | Alineación/seguridad | No disponible |

La comparación relevante es interna al paper: este checkpoint difiere del run principal únicamente en la condición `--response_thinking True`, con idénticos datos, hiperparámetros y semilla. Frente a Qwen3-4B base, el modelo pierde generalidad y capacidades multilingües a cambio de un comportamiento de seguridad especializado.

## Limitaciones y advertencias

- Modelo de investigación, no de producción: es un control de ablación para un paper, con 0 descargas y sin pipeline declarado; no debe desplegarse como asistente general.
- Idiomas: solo inglés declarado; el rendimiento en castellano u otros idiomas no está garantizado y probablemente degradado respecto al base.
- Sesgos: no documentados por el autor; al entrenarse sobre un dataset específico de seguridad (1571 registros), puede heredar sesgos de ese corpus y de Qwen3-4B.
- Riesgo de alucinación: no evaluado; el ajuste fino sobre un dataset pequeño puede incrementar la sobrerrespuesta o el rechazo excesivo en dominios no cubiertos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B tiene sus propios términos que deben respetarse; además, el propósito experimental desaconseja su uso comercial.
- Checkpoint solo de pesos (`save_only_model=True`): no incluye estado del optimizador, lo que limita la reanudación exacta del entrenamiento.
- Configuración de entrenamiento frágil: el autor documenta OOM con batch 8 en 2 GPUs, lo que indica sensibilidad a la longitud de las secuencias de pensamiento y posibles problemas de estabilidad en reproducciones.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora en seguridad ni de degradación en capacidades generales.
- Fecha de creación futura en los metadatos (2026-11-10): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Easonnoway/qwen3-4b-ablation-matched-response
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Paper ImmuneCoT: no disponible en la información proporcionada
- Repositorio del proyecto: no disponible en la información proporcionada
- Blog o demo: no disponible en la información proporcionada
