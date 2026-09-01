# opencal/opencal-base

## Resumen

OpenCal Base es un modelo multimodal de visión y lenguaje desarrollado por el equipo OpenCal (OpenCalorieTracker) sobre la base de LiquidAI/LFM2.5-VL-450M. Su propósito es convertir fotografías o descripciones textuales de comidas en una lista estructurada de ingredientes con gramos estimados y valores nutricionales (kcal, proteínas, carbohidratos y grasas), alineados con la base de datos de alimentos del USDA. El modelo resuelve el problema de estimar la composición nutricional de una comida a partir de una imagen, una tarea compleja que requiere comprensión visual y conocimiento de alimentos.

La relevancia actual radica en su enfoque práctico y ligero: al estar basado en un modelo de 450 millones de parámetros y exportado a ONNX, puede ejecutarse directamente en navegadores mediante transformers.js con WebGPU, WASM o CPU, lo que facilita su integración en aplicaciones web y móviles sin necesidad de infraestructura de servidor. La licencia Apache-2.0 permite uso comercial y modificaciones sin restricciones. El modelo está diseñado específicamente para el dominio de la nutrición, lo que lo diferencia de modelos generalistas de visión-lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lfm2VlForConditionalGeneration (model_type lfm2_vl) |
| Parametros totales | 450M (modelo base LFM2.5-VL-450M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp32, fp16, q4, q4f16, q8 (archivos ONNX: embed_tokens, decoder_model_merged, vision_encoder) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (con variantes de precisión) y safetensors (implícito por transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune LoRA sobre la base congelada LiquidAI/LFM2.5-VL-450M, con los pesos LoRA fusionados en el modelo final. La arquitectura base es un transformer multimodal de visión y lenguaje (Lfm2VlForConditionalGeneration) que procesa imágenes y texto de forma conjunta. El entrenamiento se realizó con el dataset OpenCal v6, que incluye objetivos de gramos y macronutrientes (kcal, proteínas, carbohidratos, grasas) por ingrediente, normalizados a 100 gramos y con valores nutricionales provenientes de la base de datos USDA. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO.

La exportación a ONNX permite la ejecución en múltiples runtimes: WebGPU (precisión fp16 o q4f16), WASM (q8) y CPU (fp32). Esta versatilidad es una innovación técnica destacable, ya que facilita el despliegue en entornos de navegador con diferentes capacidades de hardware.

## Capacidades

- Reconocimiento de alimentos en imágenes y extracción de ingredientes individuales con estimación de gramos.
- Procesamiento de descripciones textuales de comidas (sin imagen) para obtener la misma salida estructurada.
- Generación de salida JSON con campos `name`, `grams`, `kcal`, `protein_g`, `carbs_g` y `fat_g` por cada ingrediente detectado.
- Alineación con la base de datos nutricional del USDA para asegurar valores de macros coherentes.
- Funciona en navegador gracias a la exportación ONNX y la integración con transformers.js (WebGPU, WASM, CPU).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe más allá del inglés implícito en los datos de entrenamiento.

## Casos de uso

- Aplicación de conteo de calorías: el usuario fotografía su plato y la app devuelve automáticamente la lista de ingredientes con gramos y kcal, permitiendo un registro dietético sin introducción manual.
- Asistente de nutrición en tiempo real: integrado en un chatbot o asistente de salud, el modelo procesa imágenes enviadas por el usuario y responde con un desglose nutricional estructurado, útil para consultas rápidas durante comidas fuera de casa.
- Análisis de menús en restaurantes: una cámara del establecimiento captura el plato y el modelo genera una ficha nutricional que se muestra al cliente en una pantalla o en su móvil, mejorando la transparencia alimentaria.
- Seguimiento de dietas para deportistas: el modelo proporciona gramos y macros por ingrediente, permitiendo a los usuarios ajustar sus ingestas de proteínas o carbohidratos con precisión.
- Investigación en epidemiología nutricional: los investigadores pueden usar el modelo para procesar grandes volúmenes de fotografías de comidas de estudios de cohorte, estandarizando la estimación de nutrientes con un método reproducible.
- Aplicación web de planificación de menús: el usuario sube una foto de su despensa o de un plato cocinado, y el modelo sugiere recetas ajustadas a objetivos calóricos, basándose en los ingredientes detectados.

## Benchmarks y rendimiento

La model card del autor incluye resultados de evaluaciones internas del equipo OpenCal, no comparados con otros modelos:

| Evaluación | Métrica | Resultado |
|---|---|---|
| F101 (comidas completas, mediana de kcal ≈ 293) | MAE de kcal | 243 |
| F101 | WAPE (error porcentual absoluto ponderado) | 41,5% |
| F101 | Porcentaje de predicciones dentro del 50% del valor real | 70,4% |
| N5k (muestras de laboratorio, mediana de kcal ≈ 43) | Recall de identidad de ingredientes | 84,4% (frente a 76,4% de la línea base y 73,6% de un LLM de referencia) |

No se han publicado benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo está especializado en la tarea de nutrición.

## Requisitos de hardware

- Tamaño del modelo: 450M de parámetros, lo que lo hace adecuado para GPUs de consumo.
- VRAM estimada: para fp16, aproximadamente 1-2 GB; para cuantización q4, menos de 1 GB. En CPU, puede ejecutarse con memoria RAM suficiente (el repo pesa 4,4 GB en formato ONNX).
- GPUs recomendadas: cualquier GPU con soporte WebGPU (por ejemplo, RTX 20 series o superiores) para ejecución en navegador; también compatible con GPUs NVIDIA antiguas (GTX 10 series) mediante CUDA en entornos de servidor.
- Despliegue en navegador: transformers.js con WebGPU (fp16 o q4f16), WASM (q8) o CPU (fp32). No requiere servidor dedicado.
- Despliegue en servidor: se puede usar con librerías de inferencia ONNX como ONNX Runtime para Python o Node.js.
- Latencia y throughput: no se han publicado mediciones oficiales; al ser un modelo pequeño, se espera latencia inferior a 1 segundo en GPU y algunos segundos en CPU para una imagen, dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de estimación nutricional en la documentación proporcionada. El modelo se posiciona como una solución especializada y ligera, pero no hay datos de rendimiento frente a alternativas como GPT-4V, LLaVA o modelos específicos de nutrición (por ejemplo, Nutrition5k). No se puede realizar una comparativa objetiva sin esos datos.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para alimentos de la base de datos USDA; puede fallar en platos complejos, cocina no occidental o ingredientes poco comunes.
- La estimación de gramos es aproximada (MAE de 243 kcal en comidas completas), por lo que no debe usarse para cálculos médicos o dietéticos de precisión sin validación humana.
- Depende de la calidad y ángulo de la fotografía; imágenes borrosas, con poca luz o con múltiples platos pueden reducir la precisión.
- No se han documentado sesgos específicos, pero es probable que existan sesgos hacia alimentos comunes en la cultura occidental y hacia fotografías de estilo "plato único".
- Riesgo de alucinación de ingredientes: el modelo puede inventar elementos no presentes en la imagen, especialmente en escenarios ambiguos.
- La licencia Apache-2.0 permite uso comercial, pero no hay garantías de exactitud nutricional; el usuario final debe ser consciente de las limitaciones.
- No se especifica el idioma de entrenamiento; la salida JSON es independiente del idioma, pero las instrucciones de texto probablemente funcionan mejor en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/opencal/opencal-base
- Modelo base LiquidAI/LFM2.5-VL-450M: https://huggingface.co/LiquidAI/LFM2.5-VL-450M
- Perfil del equipo OpenCal en Hugging Face: https://huggingface.co/opencal
- Documentación de OpenCal (app): https://opencal.dev/docs
