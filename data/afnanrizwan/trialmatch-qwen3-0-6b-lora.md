# afnanrizwan/trialmatch-qwen3-0.6b-lora

## Resumen

TrialMatch Qwen3-0.6B LoRA es un adaptador LoRA (Low-Rank Adaptation) publicado por afnanrizwan sobre el modelo base Qwen/Qwen3-0.6B, desarrollado como prototipo educativo para la evaluación de criterios de elegibilidad en ensayos clínicos. El adaptador se ha entrenado para una tarea muy concreta: recibir una nota de paciente numerada por frases, un tipo de criterio y el texto del criterio, y devolver un JSON con los identificadores de las frases que sirven como evidencia y una etiqueta de decisión. La arquitectura subyacente es la de Qwen3-0.6B, un transformer decoder-only de 0,6 mil millones de parámetros, al que se le añade un adaptador de rango bajo (r=16, alpha=32) aplicado a todas las proyecciones de atención y MLP.

El interés del modelo no reside en su rendimiento generalista, sino en su uso como modelo borrador para decodificación especulativa junto a un modelo objetivo de 1,7B, y en que demuestra un flujo completo de ajuste fino con recursos muy limitados (una única GPU T4 de Kaggle, fp16, 3 épocas). Está entrenado sobre el dataset `ncbi/TrialGPT-Criterion-Annotations` con una partición agrupada por paciente (37/8/8 pacientes) y una función de pérdida calculada únicamente sobre los tokens de respuesta.

Se trata de un artefacto de investigación educativa, no de una herramienta clínica: el propio autor advierte explícitamente que no debe usarse para decisiones de inscripción en ensayos. Su relevancia actual es la de servir como ejemplo reproducible de adaptación de un modelo pequeño a un dominio especializado con LoRA y de su integración en un pipeline de decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA (r=16, alpha=32) en proyecciones de atención y MLP |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B); el adaptador LoRA añade un conjunto reducido de pesos de rango bajo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-0.6B; no especificada en la información) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | no disponibles (el entrenamiento se realizó sobre notas clínicas en inglés presumiblemente, pero no se documenta) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-0.6B, un transformer decoder-only. La configuración LoRA usa r=16, alpha=32 y se inserta en todas las proyecciones de atención y MLP. El ajuste fino se realizó con pérdida calculada únicamente sobre los tokens de respuesta (answer-token-only loss), 3 épocas, learning rate 2e-4 con schedule coseno, batch efectivo de 16 y precisión fp16 sobre una GPU Kaggle T4. Se seleccionó el mejor checkpoint por pérdida de validación.

Los datos provienen de `ncbi/TrialGPT-Criterion-Annotations`, con una partición agrupada por paciente (37/8/8 pacientes) generada con `numpy` `default_rng(42)`. Las columnas generadas por GPT-4 no se utilizaron en ningún momento. La tarea de entrenamiento es de extracción de evidencia y clasificación a nivel de criterio: la entrada combina una nota de paciente con frases numeradas, el tipo de criterio y el texto del criterio; la salida es un objeto JSON con la lista de identificadores de frases de evidencia y una etiqueta. El adaptador se empleó además como modelo borrador en un esquema de decodificación especulativa con un modelo objetivo de 1,7B.

## Capacidades

- Extracción de evidencia a nivel de frase: devuelve los identificadores de las frases de la nota del paciente que justifican la decisión sobre un criterio.
- Clasificación de elegibilidad a nivel de criterio: emite una etiqueta de decisión para el criterio evaluado.
- Salida estructurada en JSON con los campos `evidence` y `label`.
- Procesamiento de notas clínicas con frases numeradas y contexto de criterio explícito.
- Uso como modelo borrador en decodificación especulativa junto a un modelo objetivo de 1,7B.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Prototipado educativo de evaluación de elegibilidad: el adaptador permite construir un pipeline completo que, dada una nota de paciente y un criterio, devuelve evidencia y etiqueta, sirviendo como ejercicio reproducible de ajuste fino con LoRA en una sola GPU.
- Precribado de criterios en investigación clínica: se puede usar para prefiltrar criterios y señalar las frases relevantes de la nota, reduciendo el trabajo de revisión manual antes de la validación por un experto.
- Generación de conjuntos de datos anotados: al devolver identificadores de frases de evidencia, facilita la creación de anotaciones a nivel de frase para entrenar o evaluar otros modelos.
- Decodificación especulativa en producción de bajo coste: al actuar como draft model de 0,6B frente a un target de 1,7B, permite acelerar la inferencia en entornos con recursos limitados.
- Docencia y experimentación con PEFT: sirve como ejemplo de adaptación de dominio con `merge_and_unload()` y de evaluación con métricas macro-F1 en un problema desbalanceado.
- Evaluación comparativa de estrategias de ajuste: su partición agrupada por paciente y su manifiesto de split permiten reproducir experimentos y comparar configuraciones de LoRA.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Exactitud (accuracy) en validación (206 criterios) | 0,733 |
| Macro-F1 en validación (206 criterios) | 0,387 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,6B en fp16 requiere del orden de 1,2 GB solo para pesos; con overhead de activaciones y KV cache, cabe holgadamente en GPUs consumer de 8 GB o menos.
- El adaptador LoRA en safetensors ocupa una fracción pequeña del repositorio de 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también T4, A100 o H100, aunque están sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en cualquier GPU con 6-8 GB de VRAM o más.
- Opciones de despliegue: transformers + PEFT (carga con `PeftModel.from_pretrained` y `merge_and_unload()`), y previsiblemente llama.cpp u Ollama tras convertir el modelo fusionado a GGUF, aunque no se documenta en la información disponible. vLLM y TGI no están documentados para este adaptador concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TrialMatch Qwen3-0.6B LoRA | 0,6B (base) + adaptador LoRA | no disponible | Elegibilidad de ensayos clínicos a nivel de criterio | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen3-0.6B (base) | 0,6B | no disponible | Generación de texto generalista | Apache 2.0 | Hugging Face |
| Modelo objetivo de 1,7B del pipeline | 1,7B | no disponible | Target en decodificación especulativa | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El propio autor indica que es un prototipo educativo de cribado y que no es una herramienta de decisión de inscripción clínica.
- El macro-F1 de 0,387 en validación es bajo, lo que sugiere un rendimiento desequilibrado entre clases; la exactitud de 0,733 puede estar dominada por la clase mayoritaria.
- El conjunto de validación es muy pequeño (206 criterios, 8 pacientes), por lo que las métricas tienen alta varianza y no son extrapolables.
- Riesgo de alucinación: al generar JSON con identificadores de frases, puede producir índices inexistentes o evidencia no respaldada por la nota.
- Sesgos conocidos: no documentados, pero el dataset de origen y la partición por paciente limitan la generalización a otras poblaciones o instituciones.
- Idiomas soportados no documentados; el modelo base Qwen3 es multilingüe, pero el ajuste fino puede haber degradado el rendimiento fuera del dominio de entrenamiento.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el uso clínico real requiere validación regulatoria y supervisión humana; la licencia no exime de las obligaciones aplicables a datos de salud.
- No debe usarse con datos de pacientes reales sin las garantías de privacidad y cumplimiento correspondientes.

## Enlaces

- Hugging Face: https://huggingface.co/afnanrizwan/trialmatch-qwen3-0.6b-lora
- Repositorio de código, manifiesto de split y resultados: https://github.com/AfnanRizwan1/GenAi-A2
- Dataset: https://huggingface.co/datasets/ncbi/TrialGPT-Criterion-Annotations
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Tutorial de ajuste fino de Qwen3 con LoRA y NeMo AutoModel: https://www.marktechpost.com/2026/07/18/fine-tuning-qwen3-with-lora-using-nvidia-nemo-automodel-a-complete-single-gpu-google-colab-workflow-tutorial/
- Guía de QLoRA sobre Qwen3-0.6B-Base: https://github.com/vmeoc/FineTuningQwen3-0.6B
