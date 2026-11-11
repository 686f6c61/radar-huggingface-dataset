# Jongwondd/Qwen3.5-9B-DPO-2ep-94b8526c

## Resumen

Qwen3.5-9B-DPO-2ep-94b8526c es un adaptador LoRA final, sin fusionar, entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base Qwen/Qwen3.5-9B. Lo publica el usuario Jongwondd en Hugging Face como artefacto de investigación centrado en el entrenamiento de negación ("negation-training"), no como un modelo listo para producción. El adaptador tiene rango LoRA 16, alpha 32 y dropout 0, y se distribuye en formato PEFT/safetensors con un tamaño de repositorio de 0,2 GB, lo que confirma que solo contiene los pesos del adaptador y no los del modelo base.

El modelo base es Qwen3.5-9B, un modelo multimodal (pipeline image-text-to-text) de arquitectura híbrida que, según la model card, requiere soporte específico en Transformers para su arquitectura híbrida/multimodal. El adaptador se entrenó durante dos épocas completas sobre el conjunto PopQA de entrenamiento (14.951 pares / 4.534 casos), con 29.902 ejemplos vistos y 1.891 pasos del optimizador. La relevancia de esta ficha es acotada: se trata de un checkpoint de investigación con 0 descargas y 0 likes en el momento de la consulta, orientado a estudiar el comportamiento de negación y las preferencias, no a despliegues reales.

La licencia declarada es Apache 2.0, heredada del modelo base, y el idioma indicado es únicamente inglés. No se publican resultados de evaluación ni benchmarks asociados a este adaptador; la propia model card indica explícitamente que la subida no añade resultados de evaluación y que los splits previamente observados son datos de desarrollo, no datos de test independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer híbrido/multimodal Qwen3.5-9B |
| Parametros totales | No disponible (el adaptador ocupa 0,2 GB; el base tiene 9B según su denominación) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; el base admitiría cuantizaciones estándar, no confirmadas aquí) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA, sin fusionar) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-9B, descrito en la model card como un modelo de arquitectura híbrida y multimodal que requiere una versión de Transformers con soporte específico (la ejecución de entrenamiento usó un overlay local fijado, no una instalación genérica de Transformers). El adaptador conserva el mapeo de proyección LoRA específico de la arquitectura original. Los detalles internos de la arquitectura del base (atención, capas, mecanismos híbridos) no se detallan en la información proporcionada.

El entrenamiento consistió en DPO con inicialización desde el base sin adaptador previo ("fresh base"), dos épocas completas, 14.951 pares de preferencia sobre 4.534 casos del split de entrenamiento de PopQA, 29.902 ejemplos vistos y 1.891 pasos del optimizador. La configuración LoRA es rango 16, alpha 32 y dropout 0. El objetivo específico del método, los hiperparámetros retenidos, el hash del resumen de la fuente y el hash de los datos de entrenamiento se documentan en `training_provenance.json`. La model card aclara que los bytes de los pesos no se han modificado: solo se ha hecho portable el localizador del modelo base y la revisión en la configuración PEFT, registrando los hashes de configuración original y publicada.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.5-9B, con el ajuste de preferencias DPO aplicado.
- Procesamiento image-text-to-text, ya que el pipeline declarado es multimodal y el cargador indicado es `Qwen3_5ForConditionalGeneration`.
- Entrenamiento orientado a negación: el adaptador está especializado en el tratamiento de preferencias relacionadas con negación, según las etiquetas y el título de la publicación.
- Uso de la plantilla de chat y del tokenizer/processor del modelo base, incluidos inputs de imagen cuando corresponda.
- No se documentan capacidades de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.
- Capacidades multilingües no confirmadas: el idioma declarado es únicamente inglés.

## Casos de uso

- Investigación sobre negación y preferencias: el adaptador sirve para reproducir y estudiar experimentos de DPO centrados en negación sobre Qwen3.5-9B, comparando el comportamiento antes y después del ajuste con los pares de PopQA.
- Análisis de alineación con DPO: permite examinar cómo dos épocas de DPO con rango LoRA 16 y alpha 32 modifican las preferencias del modelo base en un conjunto controlado de 4.534 casos.
- Reproducibilidad de experimentos: los hashes de datos, configuración y procedencia permiten replicar el pipeline de entrenamiento y verificar la integridad del adaptador.
- Evaluación de técnicas PEFT multimodales: al conservar el mapeo de proyección LoRA específico de la arquitectura, es útil para estudiar la aplicación de LoRA sobre modelos híbridos multimodales.
- Docencia y formación: como ejemplo documentado de una ejecución DPO completa con procedencia detallada, puede usarse en materiales sobre ajuste fino eficiente.
- No se recomienda su uso en producción, atención al cliente ni generación de código en entornos reales, dado que es un checkpoint de investigación sin validación de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que esta subida no añade resultados de evaluación, que no se reclama la reproducción de las cifras del manuscrito y que los splits previamente observados son datos de desarrollo, no test independiente.

## Requisitos de hardware

- El adaptador pesa 0,2 GB, pero la inferencia requiere cargar el modelo base Qwen3.5-9B completo; el adaptador por sí solo no es ejecutable.
- VRAM estimada para el base en bfloat16: aproximadamente 18 GB solo para pesos, más overhead de activaciones y del processor multimodal; no se dispone de cifras oficiales para esta variante.
- GPU recomendadas: no disponibles de forma específica para este adaptador; por tamaño del base, cabría esperar A100/H100 para servicio y GPUs consumer de gama alta con cuantización, sin confirmación en la información proporcionada.
- Despliegue: la carga documentada usa Transformers (`Qwen3_5ForConditionalGeneration`) más PEFT (`PeftModel`), con `device_map="auto"` y `torch_dtype=torch.bfloat16`. No se documentan opciones vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-DPO-2ep-94b8526c | Adaptador LoRA sobre base de 9B | No disponible | Safetensors (PEFT) | Apache 2.0 | Checkpoint de investigación, 0 descargas |
| Qwen/Qwen3.5-9B | 9B (según denominación) | No disponible | No disponible | No disponible en esta ficha | Modelo base multimodal del que depende el adaptador |
| Alternativas DPO de la misma categoría | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con otros adaptadores DPO o modelos de 9B de forma rigurosa; los datos de rendimiento del base y de alternativas no están incluidos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo validado para seguridad ni para producción; las salidas pueden ser incorrectas, sesgadas, malformadas o repetitivas.
- No incluye los pesos del modelo base ni los tokenizers; requiere acceso al repositorio Qwen/Qwen3.5-9B en la revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`.
- Requiere versiones compatibles de Transformers y PEFT con soporte para la arquitectura híbrida/multimodal de Qwen3.5; una instalación antigua de Transformers puede no funcionar.
- La paridad entre la descarga pública desde el Hub y la inferencia no está garantizada por el autor; solo se verificó localmente el parseo de la configuración del adaptador.
- Idioma limitado al inglés declarado; no hay evidencia de capacidades multilingües.
- No se han publicado evaluaciones independientes; los splits usados son datos de desarrollo y las puntuaciones proxy basadas en reglas no equivalen a precisión de un juez semántico.
- La licencia Apache 2.0 se hereda del base, pero se aplican también las restricciones de uso del proveedor original recogidas en `LICENSE`, `NOTICE` y `USE_POLICY.md`; no se implica afiliación ni respaldo del proveedor del modelo base.
- Riesgo de alucinación y sesgos: no cuantificado en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Jongwondd/Qwen3.5-9B-DPO-2ep-94b8526c
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Procedencia del entrenamiento: `training_provenance.json` en el repositorio del adaptador (no se dispone de URL directa en la información proporcionada)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
