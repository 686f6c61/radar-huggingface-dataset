# phureexd/qwen35_medical_v3_lr5e-5_lora

## Resumen

`phureexd/qwen35_medical_v3_lr5e-5_lora` es un ajuste fino (fine-tuning) mediante LoRA del modelo base `unsloth/Qwen3.5-2B`, publicado por el usuario phureexd en Hugging Face. Se trata de un adaptador de bajo rango orientado a dominio médico, entrenado con la librería Unsloth y el stack TRL, y empaquetado en formato safetensors compatible con Transformers y text-generation-inference. El nombre del repositorio sugiere una tasa de aprendizaje de 5e-5 y una tercera iteración del ajuste.

El modelo hereda la arquitectura y las capacidades del Qwen3.5-2B original, un transformer de 2.000 millones de parámetros con licencia Apache 2.0. Al ser un adaptador LoRA, su tamaño en disco es reducido (0,1 GB en el repositorio), lo que lo hace ligero de distribuir, aunque requiere cargar el modelo base para su uso efectivo.

Su relevancia es limitada y experimental: cuenta con cero descargas y cero likes en el momento de la consulta, no incluye resultados de benchmarks ni documentación sobre el dataset de entrenamiento, y la model card es la plantilla automática de Unsloth. Debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-2B); adaptador LoRA |
| Parametros totales | 2B en el modelo base; el adaptador LoRA no disponible en detalle |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones propias de Qwen3.5-2B) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `unsloth/Qwen3.5-2B`, por lo que la arquitectura subyacente es la del transformer Qwen3.5 de 2.000 millones de parámetros. El entrenamiento se realizó con Unsloth, que según la model card permitió un entrenamiento «2x faster», y con TRL como framework de ajuste. El nombre del repositorio indica una tasa de aprendizaje de 5e-5 y una tercera versión del ajuste médico.

No se dispone de información sobre el dataset utilizado, el número de tokens de entrenamiento, la composición de los datos, ni si se aplicaron técnicas de RLHF, DPO o similares. Tampoco se documentan innovaciones técnicas específicas del adaptador más allá del uso de LoRA y Unsloth.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.5-2B.
- Especialización declarada en dominio médico (según el nombre del repositorio), sin documentación que la respalde.
- Soporte multilingüe limitado al inglés según la etiqueta de idioma de la model card.
- Capacidades de tool calling, agentes o multi-step reasoning: no documentadas para este adaptador; dependen de las del modelo base.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Experimentación académica en ajuste fino médico: el adaptador sirve como ejemplo de pipeline LoRA con Unsloth y TRL sobre Qwen3.5-2B para investigadores que quieran replicar el proceso.
- Prototipado de asistentes clínicos de bajo coste: al requerir solo 2B de parámetros, puede desplegarse en hardware modesto para pruebas de concepto, siempre con supervisión humana.
- Clasificación y resumen de textos médicos en inglés: uso potencial en tareas de extracción de información de notas clínicas, previa validación empírica.
- Generación de respuestas a preguntas frecuentes de salud: adecuado para entornos controlados donde se filtre la salida con reglas adicionales.
- Base para nuevos ajustes incrementales: al ser un adaptador LoRA, puede combinarse o continuar entrenándose con datasets propios.
- Evaluación comparativa de adaptadores médicos: útil como línea base en estudios que comparen distintos fine-tunings sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador sobre un modelo de 2B, la inferencia requiere cargar el modelo base. En FP16 se estiman en torno a 4-5 GB de VRAM; en cuantización de 4 bits, aproximadamente 1,5-2 GB (estimaciones orientativas, no verificadas para este adaptador).
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs con 6 GB o más de VRAM en cuantización.
- Opciones de despliegue: Transformers, text-generation-inference (según las etiquetas), vLLM y llama.cpp tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| phureexd/qwen35_medical_v3_lr5e-5_lora | 2B (base) + LoRA | No disponible | Apache 2.0 | Hugging Face |
| unsloth/Qwen3.5-2B | 2B | No disponible | Apache 2.0 | Hugging Face |
| Otros adaptadores médicos sobre Qwen | Variable | Variable | Variable | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No hay documentación sobre el dataset de entrenamiento ni sobre el proceso de evaluación, lo que impide verificar la calidad del ajuste médico.
- Riesgo elevado de alucinación en un dominio sensible como la salud; no debe usarse para diagnóstico ni consejo médico sin supervisión profesional.
- Sesgos potenciales heredados del modelo base y del corpus de ajuste, no analizados.
- Soporte limitado al inglés según la model card.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- Al ser un adaptador LoRA, requiere cargar el modelo base y fusionarlo o aplicarlo en tiempo de inferencia, lo que añade complejidad operativa.

## Enlaces

- [Hugging Face: phureexd/qwen35_medical_v3_lr5e-5_lora](https://huggingface.co/phureexd/qwen35_medical_v3_lr5e-5_lora)
- [Modelo base: unsloth/Qwen3.5-2B](https://huggingface.co/unsloth/Qwen3.5-2B)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
