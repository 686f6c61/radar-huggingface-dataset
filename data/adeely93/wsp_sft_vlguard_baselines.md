# Adeely93/wsp_sft_vlguard_baselines

## Resumen

`Adeely93/wsp_sft_vlguard_baselines` es una colección de cuatro adaptadores LoRA de ajuste fino supervisado (SFT) para modelos de visión-lenguaje, entrenados sobre el conjunto de datos VLGuard. El autor, Adeely93, la publica como material de referencia (baselines) para los experimentos WSP (presumiblemente un trabajo de investigación sobre seguridad en modelos multimodales). No se trata de un modelo independiente, sino de un repositorio que agrupa adaptadores para cuatro modelos base distintos: Qwen3-VL-2B-Instruct, Qwen3-VL-4B-Instruct, Qwen3-VL-8B-Instruct y Llama-3.2-11B-Vision-Instruct.

El propósito es proporcionar puntos de comparación reproducibles para evaluar técnicas de alineación de seguridad en modelos multimodales. Cada adaptador se entrena sobre el 100% de los datos SFT de VLGuard, un dataset orientado a reducir respuestas inseguras ante entradas visuales y textuales. El repositorio incluye instrucciones de carga, hiperparámetros exactos, hashes de verificación y una tabla de puntuaciones de seguridad y utilidad, lo que lo convierte en un recurso útil para investigadores que necesiten reproducir o comparar resultados en el ámbito de la seguridad multimodal.

La relevancia actual radica en que la seguridad de los modelos de visión-lenguaje es un área emergente: los adaptadores LoRA permiten estudiar el efecto del SFT sobre seguridad con un coste computacional bajo, manteniendo intactos los pesos del modelo base. El repositorio ocupa 1,3 GB y usa la librería PEFT, con adaptadores de rango 8 aplicados únicamente a las capas lineales del modelo de lenguaje (torre visual y proyector congelados).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 8, alpha 16, dropout 0.05) sobre modelos base transformer multimodales (Qwen3-VL y Llama-3.2-Vision) |
| Parametros totales | No disponible (depende del modelo base: 2B, 4B, 8B y 11B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (definida por el modelo base) |
| Tipos de cuantizacion | No disponible (los adaptadores se distribuyen en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adapter_model.safetensors) |

## Arquitectura y entrenamiento

Cada adaptador es un LoRA de rango 8 y alpha 16 con dropout 0.05, aplicado a todas las capas lineales del modelo de lenguaje; la torre visual y el proyector permanecen congelados. El entrenamiento se realizó con LLaMA-Factory usando AdamW en bf16, programación coseno con warmup 0.1, batch efectivo de 8 (1 por dispositivo con 8 pasos de acumulación de gradiente), longitud de corte de 2048 tokens y semilla 42 con determinismo completo. Solo difiere la tasa de aprendizaje entre los cuatro baselines: 5e-5 para los tres Qwen3-VL y 1e-5 para Llama-3.2-11B-Vision. Las plantillas de conversación empleadas son `qwen3_vl_nothink` para Qwen y `mllama` para Llama.

El número de épocas y pasos varía por baseline: Qwen3-VL-2B se entrenó 2 épocas (1994 de 2991 pasos), Qwen3-VL-4B 1 época (997 de 2991 pasos), Qwen3-VL-8B 3 épocas (2991 de 2991 pasos) y Llama-3.2-11B-Vision 1 época (997 de 2991 pasos). Los datos de entrenamiento corresponden al 100% del conjunto SFT de VLGuard. La model card incluye el hash SHA-256 de cada `adapter_model.safetensors` y la revisión exacta del modelo base, lo que permite verificar la reproducibilidad.

## Capacidades

- Generación de texto y razonamiento multimodal heredados del modelo base (Qwen3-VL o Llama-3.2-Vision).
- Procesamiento de imágenes y texto combinados, con instrucciones visuales y textuales.
- Respuestas ajustadas para reducir contenido inseguro ante entradas adversarias (efecto del SFT sobre VLGuard).
- Carga directa mediante PEFT y `transformers` (se requiere `transformers>=4.57`).
- Compatible con `model.generate(...)` sin cambios en la interfaz respecto al modelo base.
- No se documentan capacidades específicas de tool calling, agentes, thinking mode ni audio en la información disponible; estas dependen del modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en seguridad multimodal: usar los adaptadores como línea base para comparar nuevas técnicas de alineación (DPO, RLHF, filtrado de datos) frente a SFT sobre VLGuard, gracias a los hiperparámetros y hashes publicados.
- Evaluación de robustez ante ataques visuales: ejecutar FigStep, MM-SafetyBench y JB-Mini contra cada baseline para medir la tasa de respuestas inseguras y comparar entre tamaños de modelo.
- Estudio del compromiso seguridad-utilidad: analizar la tabla de puntuaciones (seguridad, sobre-rechazo y utilidad en ScienceQA y MathVista) para elegir el tamaño de modelo que mejor equilibra ambas dimensiones.
- Reproducción de experimentos: descargar carpetas concretas con `hf download` y cargarlas con `PeftModel.from_pretrained` para replicar exactamente los resultados publicados.
- Desarrollo de sistemas de moderación visual: emplear un adaptador Qwen3-VL-8B ajustado como componente de un pipeline que clasifique o rechace entradas potencialmente inseguras.
- Docencia y formación: utilizar los cuatro baselines como ejemplo práctico de ajuste LoRA reproducible con LLaMA-Factory, incluyendo plantillas de conversación y determinismo.
- Comparación entre familias de modelos: contrastar Qwen3-VL frente a Llama-3.2-Vision en tareas de seguridad multimodal con idéntico dataset y receta.

## Benchmarks y rendimiento

Resultados publicados en la model card (100 muestras por conjunto, juez gpt-4.1-mini, margen aproximado de ±8 puntos; seguridad = % inseguro, sobre-rechazo = % rechazado, utilidad = % medio correcto en ScienceQA y MathVista):

| Baseline | FigStep | MM-SafetyBench | JB-Mini | Utilidad | MOSSBench | FigStep-benign |
|---|---|---|---|---|---|---|
| `qwen3vl-2b_r8_lr5e-5_epoch2` | 10 | 0 | 1 | 68.0 | 93 | 40 |
| `qwen3vl-4b_r8_lr5e-5_epoch1` | 18 | 0 | 2 | 76.0 | 89 | 13 |
| `qwen3vl-8b_r8_lr5e-5_epoch3` | 8 | 0 | 3 | 78.5 | 86 | 12 |
| `llama32v-11b_r8_lr1e-5_epoch1` | 6 | 6 | 4 | 70.0 | 69 | 35 |

Decodificación: Qwen con muestreo de la model card (temperatura 0.7, top-p 0.8, top-k 20, penalización de presencia 1.5, máximo 4096 tokens nuevos, semilla 42 por petición); Llama en modo greedy con máximo 2048 tokens nuevos. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base. Qwen3-VL-2B en bf16 requiere aproximadamente 5-6 GB; Qwen3-VL-4B en torno a 9-10 GB; Qwen3-VL-8B alrededor de 17-18 GB; Llama-3.2-11B-Vision en bf16 supera los 22 GB. Los adaptadores LoRA añaden una sobrecarga mínima (decenas de MB).
- GPU recomendadas: A100 40/80 GB o H100 para los modelos de 8B y 11B en bf16 con batches grandes; RTX 4090 (24 GB) para Qwen3-VL-8B en bf16 o Llama-3.2-11B-Vision en cuantización de 8 bits.
- Cabe en GPU de consumo: Qwen3-VL-2B y 4B en RTX 3060/4060 Ti (12-16 GB) o superiores; Qwen3-VL-8B en RTX 4090; Llama-3.2-11B-Vision requiere cuantización (4 u 8 bits) para caber en 24 GB.
- Opciones de despliegue: `transformers` + `peft` (método documentado), con `device_map="auto"`; vLLM, TGI y llama.cpp no están documentados en la model card para estos adaptadores.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Seguridad (FigStep) | Utilidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-VL-2B + LoRA VLGuard | 2B | No disponible | 10 | 68.0 | No disponible | Hugging Face (PEFT) |
| Qwen3-VL-4B + LoRA VLGuard | 4B | No disponible | 18 | 76.0 | No disponible | Hugging Face (PEFT) |
| Qwen3-VL-8B + LoRA VLGuard | 8B | No disponible | 8 | 78.5 | No disponible | Hugging Face (PEFT) |
| Llama-3.2-11B-Vision + LoRA VLGuard | 11B | No disponible | 6 | 70.0 | No disponible | Hugging Face (PEFT) |

No se dispone de datos de benchmarks de modelos alternativos equivalentes en la información proporcionada, por lo que la comparación se limita a los cuatro baselines del propio repositorio.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; además, cada adaptador hereda las restricciones del modelo base (Qwen y Llama tienen licencias propias que deben verificarse).
- Los adaptadores no son modelos autónomos: requieren descargar el modelo base correspondiente (varios GB adicionales) y una versión de `transformers>=4.57`.
- Los resultados publicados se basan en 100 muestras por conjunto con un juez automático (gpt-4.1-mini), con un margen de ±8 puntos; las diferencias pequeñas entre baselines pueden no ser significativas.
- Riesgo de alucinación inherente a los modelos base; el SFT sobre VLGuard no elimina este comportamiento.
- Sesgos conocidos: no documentados en la información disponible; se heredan los del modelo base.
- El ajuste se centra en seguridad multimodal; no se garantiza mejora en otras capacidades (código, matemáticas, tool calling).
- Idiomas soportados no documentados; el comportamiento multilingüe depende del modelo base.
- Uso responsable: los baselines están pensados para investigación en seguridad; no se recomienda desplegarlos en producción sin una evaluación adicional sobre datos propios.
- La carpeta del repositorio agrupa cuatro adaptadores; es imprescindible seleccionar el `subfolder` correcto al cargar con PEFT.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Adeely93/wsp_sft_vlguard_baselines
- Carpeta Qwen3-VL-2B: https://huggingface.co/Adeely93/wsp_sft_vlguard_baselines/tree/main/qwen3vl-2b_r8_lr5e-5_epoch2
- Carpeta Qwen3-VL-4B: https://huggingface.co/Adeely93/wsp_sft_vlguard_baselines/tree/main/qwen3vl-4b_r8_lr5e-5_epoch1
- Carpeta Qwen3-VL-8B: https://huggingface.co/Adeely93/wsp_sft_vlguard_baselines/tree/main/qwen3vl-8b_r8_lr5e-5_epoch3
- Carpeta Llama-3.2-11B-Vision: https://huggingface.co/Adeely93/wsp_sft_vlguard_baselines/tree/main/llama32v-11b_r8_lr1e-5_epoch1
- Modelo base Qwen3-VL-2B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Modelo base Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Modelo base Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Modelo base Llama-3.2-11B-Vision-Instruct: https://huggingface.co/meta-llama/Llama-3.2-11B-Vision-Instruct
