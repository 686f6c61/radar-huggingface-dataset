# diablomike20/car-damage-assessment-llama-vision

## Resumen

Car Damage Assessment Llama Vision es un modelo de visión-lenguaje afinado (fine-tuned) por el usuario diablomike20 a partir de meta-llama/Llama-3.2-11B-Vision-Instruct, especializado en la evaluación profesional de daños en vehículos. Su objetivo es automatizar tareas que tradicionalmente requieren un peritador humano: identificar las piezas dañadas de un coche a partir de una imagen, clasificar la gravedad del daño (leve, moderado o grave) y generar informes con calidad suficiente para procesos de seguros.

El modelo se entrenó mediante LoRA (Low-Rank Adaptation) sobre 5.600 muestras de evaluación de daños, con solo 67,1 millones de parámetros entrenables sobre los 10.737 millones totales del modelo base. El entrenamiento se realizó con el framework Unsloth y TRL (supervised fine-tuning) en una GPU NVIDIA L40S, con una pérdida final de 0,1478. El modelo conserva las capacidades multimodales (imagen-texto) del modelo base y añade terminología específica del dominio automovilístico en inglés y francés.

Su relevancia radica en la creciente demanda de automatización en el sector asegurador y de talleres: evaluaciones preliminares de siniestros, informes de condición pre-compra y herramientas móviles de inspección. Al ser un ajuste ligero sobre un modelo base bien conocido, hereda su ecosistema (transformers, safetensors, compatibilidad con Unsloth) y puede desplegarse con hardware relativamente accesible para su categoría.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Llama 3.2 Vision) con adaptadores LoRA |
| Parámetros totales | 10.737.395.235 (~10,7B) |
| Parámetros activos | no disponible (no es MoE; 67.174.400 parámetros entrenables vía LoRA) |
| Longitud de contexto | no disponible (heredada del modelo base Llama 3.2, típicamente 128K tokens, no confirmado en la model card) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Inglés y francés |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.2-11B-Vision-Instruct, una arquitectura de transformer multimodal que combina un encoder de visión con un modelo de lenguaje Llama de 11B parámetros, capaz de procesar entradas de imagen y texto de forma conjunta (pipeline image-text-to-text). Sobre esta base se aplicó fine-tuning eficiente mediante LoRA, entrenando únicamente 67.174.400 parámetros (aproximadamente el 0,6 % del total), lo que reduce drásticamente los requisitos de cómputo y memoria durante el entrenamiento.

El entrenamiento se llevó a cabo con el framework Unsloth y la librería TRL mediante SFT (supervised fine-tuning), sobre un dataset de 5.600 muestras de evaluación de daños de vehículos (dataset KHAOULA-KH/CAR_DOMMAGE_ según los agradecimientos de la model card). El proceso duró 138 minutos en una NVIDIA L40S con PyTorch 2.4.0+cu121, alcanzando una pérdida final de 0,1478. No se menciona en la model card el uso de RLHF, DPO ni otras técnicas de alineación posteriores al SFT.

## Capacidades

- Detección de daños: identifica piezas concretas dañadas (parachoques, capó, puertas, etc.) a partir de imágenes del vehículo.
- Clasificación de gravedad: categoriza los daños como leves, moderados o graves.
- Generación de informes profesionales: produce descripciones de daños con calidad apta para procesos de seguros.
- Soporte multilingüe de terminología: maneja terminología de daños en inglés y francés.
- Entrada multimodal: acepta imagen + instrucción textual (pipeline image-text-to-text, formato conversacional con chat template).
- Inferencia rápida: menos de 1 minuto por evaluación según el autor.
- Al heredar del modelo base, conserva en principio las capacidades generales de Llama 3.2 Vision (conversación, descripción de imágenes), aunque no se han evaluado en esta versión afinada.

Nota: la model card no menciona soporte de tool calling, agentes ni razonamiento multi-paso; no disponible.

## Casos de uso

- Evaluación automatizada de siniestros para aseguradoras: el modelo analiza fotografías enviadas por el cliente tras un accidente y genera un informe estructurado de daños con clasificación de gravedad, acelerando la tramitación inicial de la reclamación antes de la inspección presencial.
- Evaluación rápida en talleres de reparación: los mecánicos pueden fotografiar el vehículo y obtener una valoración preliminar de las piezas afectadas y la severidad, útil para presupuestos orientativos y planificación de trabajo.
- Informes de condición pre-compra en concesionarios: generación de descripciones del estado del vehículo a partir de imágenes, para documentar daños existentes antes de la venta de coches de segunda mano.
- Aplicaciones móviles de evaluación en tiempo real: integración en apps que permitan a usuarios finales o peritadores obtener una valoración de daños desde el móvil, gracias a una inferencia de menos de un minuto por evaluación.
- Apoyo a peritadores remotos: preselección y triaje de casos enviando imágenes a peritadores, con el informe generado por el modelo como borrador editable.
- Documentación multilingüe en mercados francófonos: generación de informes de daños con terminología técnica en francés e inglés, útil para aseguradoras que operan en ambos mercados (por ejemplo, Canadá o Europa francófona).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de entrenamiento publicados son:

| Métrica | Valor |
|---|---|
| Pérdida final de entrenamiento | 0,1478 |
| Tiempo de entrenamiento | 138 minutos (NVIDIA L40S) |
| Muestras de entrenamiento | 5.600 |
| Latencia de inferencia declarada | < 1 minuto por evaluación |

No existen comparaciones con otros modelos ni métricas de evaluación en tareas estándar.

## Requisitos de hardware

- El modelo base Llama 3.2 11B Vision requiere aproximadamente 22 GB de VRAM en FP16/BF16 para inferencia; con cuantización a 4 bits podría rondar los 8-10 GB (estimación, no confirmada por el autor).
- El entrenamiento se realizó en una NVIDIA L40S con 44,7 GB de VRAM (dato declarado en la model card).
- Para inferencia en consumidor: una RTX 4090 (24 GB) o RTX 3090 debería alojar el modelo en precisión completa; con cuantización a 4 bits (por ejemplo vía bitsandbytes o GGUF si se convierte) podría ejecutarse en GPUs de 12 GB, aunque el autor no publica pesos cuantizados.
- Despliegue: el formato de carga del ejemplo de la model card usa Unsloth (FastVisionModel); al ser compatible con transformers y safetensors, debería funcionar también con transformers estándar de Hugging Face. No se menciona compatibilidad explícita con vLLM, llama.cpp, Ollama ni TGI; no disponible.
- Latencia: el autor declara inferencia en menos de 1 minuto por evaluación; no se publican medidas de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Modalidad | Especialización | Contexto | Licencia |
|---|---|---|---|---|---|
| Car Damage Assessment Llama Vision (este) | ~10,7B (LoRA sobre base) | Imagen-texto a texto | Evaluación de daños en vehículos | no disponible | Llama 3.2 |
| meta-llama/Llama-3.2-11B-Vision-Instruct | ~11B | Imagen-texto a texto | Generalista (instrucción) | no disponible en esta ficha | Llama 3.2 |
| Qwen2-VL-7B-Instruct | ~7B | Imagen-texto a texto | Generalista (instrucción) | no disponible en esta ficha | Apache 2.0 / Qwen (según versión) |

La principal diferencia frente al modelo base es la especialización en el dominio automovilístico-asegurador; frente a alternativas generalistas como Qwen2-VL, este modelo ofrece terminología específica del sector pero sin benchmarks públicos que permitan comparar rendimiento. No hay datos de benchmarks comparativos disponibles.

## Limitaciones y advertencias

- Ausencia total de benchmarks públicos: la única métrica disponible es la pérdida de entrenamiento (0,1478), que no garantiza calidad en producción; se recomienda evaluación propia antes de uso real.
- Riesgo de alucinación: como todo modelo de visión-lenguaje, puede identificar daños inexistentes o clasificar mal la gravedad; en un contexto de seguros esto puede tener implicaciones económicas y legales directas.
- Dataset de entrenamiento limitado: 5.600 muestras es un conjunto pequeño; la cobertura de tipos de vehículo, ángulos de foto, condiciones de iluminación y tipos de daño puede ser limitada.
- Idiomas restringidos: solo inglés y francés; no sirve para mercados hispanohablantes sin adaptación adicional.
- Licencia Llama 3.2: impone restricciones de la licencia comunitaria de Meta (límites de uso, requisitos de atribución y restricciones para ciertos despliegues a gran escala); debe revisarse antes de uso comercial.
- Uso en producción: no sustituye la valoración de un peritador profesional; es adecuado como herramienta de apoyo o triaje preliminar.
- Trazabilidad del repo: el modelo tiene 0 descargas, el ID del repo en Hugging Face difiere del ID citado en el ejemplo de código de la model card (Kakyoin03/car-damage-assessment-llama-vision), lo que sugiere un posible re-upload; conviene verificar la procedencia de los pesos.
- No se documenta soporte de tool calling, agentes, ni despliegue con runtimes de inferencia optimizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/diablomike20/car-damage-assessment-llama-vision
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-11B-Vision-Instruct
- Dataset de entrenamiento citado: https://huggingface.co/datasets/KHAOULA-KH/CAR_DOMMAGE_
- Framework de entrenamiento Unsloth: https://github.com/unslothai/unsloth
- Librería TRL: https://github.com/huggingface/trl
- Licencia Llama 3.2: https://huggingface.co/meta-llama/Llama-3.2-11B-Vision-Instruct/blob/main/LICENSE

No se han encontrado papers, blogs oficiales ni demos adicionales en la información disponible.
