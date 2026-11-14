# Adeely93/Llama-3.2-11B-Vision_wsp_sft_vlguard_lr1e-5_epoch1

## Resumen

Este modelo es un ajuste fino supervisado (SFT) de `meta-llama/Llama-3.2-11B-Vision-Instruct`, publicado por el usuario Adeely93 como parte de los experimentos WSP (WSP-MLLM-Safety) sobre seguridad en modelos multimodales. El objetivo declarado es servir como baseline SFT de referencia tras entrenar con LoRA sobre el conjunto de datos VLGuard, un dataset orientado a la seguridad de modelos vision-language. No es un modelo nuevo desde cero, sino una variante del checkpoint oficial de Meta con los adaptadores LoRA fusionados en los pesos en precisión bf16.

La relevancia del modelo es acotada y de investigación: se publica como parte de una familia de baselines reproducibles (cuyo repositorio agregador es `Adeely93/wsp_sft_vlguard_baselines`) para comparar recetas de alineación de seguridad en modelos multimodales. No está pensado como modelo de producción generalista, sino como punto de comparación controlado con hiperparámetros documentados (rango LoRA 8, learning rate 1e-5, primera época de tres, semilla fija 42, determinismo completo).

Arquitectónicamente hereda todo del modelo base: transformer multimodal tipo mllama con torre de visión congelada durante el entrenamiento y proyector multimodal también congelado. El ajuste solo afecta a las capas del modelo de lenguaje. El contexto máximo efectivo durante el entrenamiento fue de 2.048 tokens (`cutoff_len: 2048`), aunque el modelo base soporta ventanas mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mllama (transformer multimodal con torre de visión, base Llama-3.2-11B-Vision) |
| Parametros totales | 10.670.220.835 (~10,67 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenamiento con cutoff_len de 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; compatible con cuantizaciones estándar de transformers/vLLM no verificadas) |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (repo de 21,3 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `meta-llama/Llama-3.2-11B-Vision-Instruct` (revisión `9eb2daaa8597bf192a8b0e73f848f3a102794df5`). La arquitectura es la del modelo base: transformer multimodal con torre de visión y proyector multimodal, donde la torre de visión y el proyector se mantuvieron congelados (`freeze_vision_tower: true`, `freeze_multi_modal_projector: true`). El entrenamiento se realizó con LLaMA-Factory mediante LoRA de rango 8, alpha 16 y dropout 0,05, aplicado a todas las capas del modelo de lenguaje (`lora_target: all`).

Los hiperparámetros concretos son: learning rate 1e-5, scheduler coseno con 10 % de warmup, 3 épocas planificadas (el checkpoint publicado corresponde a la época 1), batch efectivo global de 8 (batch 1 por dispositivo con acumulación de gradiente 8), precisión bf16 con TF32 activado, `max_grad_norm` 1,0, optimizador AdamW, `cutoff_len` de 2.048 tokens, `image_max_pixels` de 1.254.400 y semilla 42 con determinismo completo. El dataset es VLGuard al 100 % (`vlguard_p100`), con hash SHA-256 documentado. El entrenamiento se ejecutó en una GPU NVIDIA B200. Los adaptadores LoRA se fusionaron en bf16 con PEFT mediante el script `eval/generate.py` del proyecto WSP-MLLM-Safety (commit `4f2763c`), y el adaptador original tiene hash SHA-256 `4675d886c077012fa8670d990515b12db255bb6e78cfaa8d97cf5dccc33191ad`.

## Capacidades

- Generación de texto e imagen-a-texto (pipeline `image-text-to-text`), heredada del modelo base Llama-3.2-11B-Vision-Instruct.
- Razonamiento visual y respuesta a preguntas sobre imágenes (el modelo card reporta evaluación en ScienceQA y MathVista como medida de utilidad).
- Conversación multi-turno en formato chat (tag `conversational`).
- Capacidades de seguridad alineadas mediante SFT sobre VLGuard: el modelo está entrenado explícitamente para rechazar contenido visual/textual inseguro.
- Compatibilidad declarada con Text Generation Inference y endpoints compatibles (tags `text-generation-inference` y `endpoints_compatible`).
- Compatibilidad con vLLM según la model card (`LLM(model="Adeely93/Llama-3.2-11B-Vision_wsp_sft_vlguard_lr1e-5_epoch1")`).
- Tool calling / function calling: no disponible en la información proporcionada (el modelo base lo soporta, pero no se documenta en esta variante).
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Idiomas: no disponible en la información proporcionada.

## Casos de uso

- Baseline de investigación en seguridad multimodal: sirve como referencia SFT controlada para comparar recetas de alineación (por ejemplo, frente a DPO o variantes con distintas épocas o learning rates) sobre VLGuard, dado que todos los hiperparámetros y hashes están documentados.
- Evaluación de robustez ante ataques visuales: útil para medir tasas de respuesta insegura en benchmarks como FigStep, MM-SafetyBench, JB-Mini y MOSSBench, tal y como reporta la model card.
- Estudio de sobre-rechazo (over-refusal): el modelo card incluye una métrica explícita de over-refusal (MOSSBench, FigStep-benign), por lo que es adecuado para analizar el equilibrio entre seguridad y utilidad.
- Reproducción de experimentos: al publicarse con semilla fija, determinismo completo y hashes de datos y adaptador, permite reproducir exactamente el entrenamiento y verificar resultados.
- Punto de partida para fine-tunes posteriores: al ser un checkpoint intermedio (época 1 de 3) con LoRA fusionado, puede servir como inicialización para experimentos de alineación adicional.
- Evaluación comparativa de utilidad: con métricas de ScienceQA y MathVista reportadas, permite cuantificar la degradación de utilidad causada por el entrenamiento de seguridad.
- Despliegue en pipelines de investigación con vLLM o TGI: la model card indica compatibilidad con ambos, lo que facilita la integración en infraestructura de evaluación existente.

## Benchmarks y rendimiento

Resultados reportados en la model card (porcentaje de respuestas inseguras en benchmarks de seguridad, utilidad media en porcentaje de acierto, y porcentaje de rechazo en benchmarks de sobre-rechazo; 100 muestras por conjunto, juez `gpt-4.1-mini`, margen aproximado de ±8 puntos, decodificación greedy, máximo 2.048 tokens nuevos):

| Benchmark | Resultado |
|---|---|
| FigStep (inseguro) | 6 % |
| MM-SafetyBench (inseguro) | 6 % |
| JB-Mini (inseguro) | 4 % |
| Utility (media ScienceQA + MathVista) | 70,0 % |
| MOSSBench (sobre-rechazo) | 69 % |
| FigStep-benign (sobre-rechazo) | 35 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible, ni comparativas numéricas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 21-22 GB solo para pesos (10,67 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB para secuencias cortas y más para contexto largo.
- GPU recomendadas: NVIDIA B200 (usada en entrenamiento), A100 40/80 GB, H100, L40S. Para consumer, una RTX 4090 (24 GB) puede ser justa en bf16 y requerir cuantización para contexto largo.
- Cabe en GPU consumer: sí, con cuantización (por ejemplo, 8 bits o 4 bits) en GPUs de 16-24 GB; en bf16 completo es ajustado en 24 GB.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText`), vLLM (soporte declarado en la model card), Text Generation Inference (tag `text-generation-inference`). No se documenta soporte explícito de llama.cpp, Ollama o GGUF en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Relación |
|---|---|---|---|---|
| Este modelo (Llama-3.2-11B-Vision SFT VLGuard) | ~10,67 B | no disponible | Llama 3.2 | Fine-tune de seguridad |
| meta-llama/Llama-3.2-11B-Vision-Instruct | ~10,67 B | no disponible | Llama 3.2 | Modelo base sin ajuste de seguridad |
| Otros baselines de Adeely93/wsp_sft_vlguard_baselines | ~10,67 B | no disponible | Llama 3.2 | Variantes de la misma receta |

No se dispone de datos de rendimiento comparativos con alternativas de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de la época 1 de un entrenamiento planificado de 3 épocas; no representa el resultado final de la receta.
- Las métricas de seguridad y utilidad se calculan sobre 100 muestras por conjunto con un juez automático (`gpt-4.1-mini`) y un margen aproximado de ±8 puntos, por lo que la precisión es limitada y no debe interpretarse como una evaluación exhaustiva.
- El ajuste se centra en VLGuard; el comportamiento frente a ataques fuera de la distribución de ese dataset no está caracterizado.
- Riesgo de sobre-rechazo elevado: 69 % en MOSSBench y 35 % en FigStep-benign, lo que indica que el modelo rechaza con frecuencia entradas benignas.
- La torre de visión y el proyector están congelados, por lo que las capacidades visuales no se han adaptado más allá del modelo base.
- El entrenamiento usó `cutoff_len` de 2.048 tokens; el rendimiento con contextos más largos no está verificado en esta variante.
- Idiomas soportados no documentados; se heredan del modelo base, pero sin garantía explícita.
- Licencia Llama 3.2 Community License: uso comercial sujeto a los términos de Meta (incluidas restricciones de escala de usuarios y obligaciones de atribución); revisar antes de producción.
- No hay información sobre sesgos específicos introducidos por VLGuard ni sobre evaluación de alucinación.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Adeely93/Llama-3.2-11B-Vision_wsp_sft_vlguard_lr1e-5_epoch1
- Repositorio de baselines: https://huggingface.co/Adeely93/wsp_sft_vlguard_baselines
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-11B-Vision-Instruct
- Proyecto WSP-MLLM-Safety (referenciado en la model card, commit `4f2763c`): no disponible como URL en la información proporcionada
- Dataset VLGuard: no disponible como URL en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
