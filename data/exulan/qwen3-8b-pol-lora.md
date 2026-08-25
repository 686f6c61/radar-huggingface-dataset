# Exulan/qwen3-8b-pol-lora

## Resumen

El modelo `Exulan/qwen3-8b-pol-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `Qwen/Qwen3-8B-Base`, desarrollado por el usuario Exulan. Está diseñado para la generación de texto en formato "greentext" y completado de hilos, con un enfoque en contenido político (el dataset de entrenamiento se llama `Exulan/pol-2014-2025-packed`). El adaptador se distribuye en formato safetensors y pesa 0.7 GB, lo que indica que solo contiene los pesos del adaptador, no el modelo completo.

El modelo está etiquetado con advertencias de contenido tóxico y "no apto para todos los públicos", lo que sugiere que genera texto con lenguaje ofensivo o controvertido. Su acceso está restringido (gated) en HuggingFace, por lo que requiere aceptar condiciones adicionales. La licencia es `cc0-adapter-mixed-rights`, una licencia no estándar que combina dominio público para el adaptador con derechos mixtos sobre el modelo base. Es relevante para investigadores interesados en fine-tuning de modelos de lenguaje con datos de dominio específico, aunque su uso en producción es limitado por las restricciones de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-8B-Base (transformer denso) con adaptador LoRA |
| Parametros totales | 8.000 millones (modelo base) + adaptador (no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, probablemente 32K) |
| Tipos de cuantizacion | no disponible (el adaptador está en safetensors; el modelo base puede cuantizarse) |
| Idiomas soportados | multilingue (tag `mul`) |
| Licencia | cc0-adapter-mixed-rights (adaptador en dominio publico, derechos mixtos sobre el modelo base) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura Qwen3-8B, un transformer denso con 8.000 millones de parametros, entrenado por Alibaba Cloud. Qwen3 introduce mejoras como decodificacion especulativa y un modo de pensamiento hibrido (thinking mode) en algunas variantes, aunque el modelo base aquí es la version sin instrucciones (`Base`). El adaptador LoRA se entrena mediante QLoRA (quantized LoRA) sobre el dataset `Exulan/pol-2014-2025-packed`, que parece contener texto politico de los años 2014 a 2025, probablemente extraido de foros o redes sociales. Los tags `raw-completion`, `greentext` y `thread-completion` indican que el entrenamiento se centra en completar hilos y generar respuestas en formato greentext (texto en verde tipico de 4chan). No se especifica el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto en formato greentext y completado de hilos.
- Generacion de contenido politico con tono informal y potencialmente polemico.
- Soporte de completado de texto libre (raw completion) sin necesidad de instrucciones.
- Capacidades multilingues heredadas del modelo base Qwen3-8B.
- No se ha confirmado soporte de tool calling, agentes o razonamiento multi-paso, ya que es un adaptador sobre la version base (sin fine-tuning de instrucciones).

## Casos de uso

- Investigacion academica sobre generacion de texto en foros: el adaptador puede utilizarse para estudiar patrones linguisticos en hilos politicos, generando muestras controladas para analisis sociolinguistico.
- Simulacion de conversaciones en redes sociales: permite crear datasets sinteticos de interacciones politicas para entrenar clasificadores de toxicidad o deteccion de sesgos.
- Generacion de contenido para pruebas de moderacion: las plataformas pueden usar el modelo para generar ejemplos de contenido problematico y evaluar sistemas de filtrado.
- Estudio de sesgos politicos en modelos de lenguaje: al estar entrenado con datos de un periodo concreto (2014-2025), permite analizar como el modelo refleja cambios en el discurso politico.
- Desarrollo de herramientas de completado de texto para entornos especificos: aunque no recomendado para produccion, puede servir como base para prototipos en entornos controlados.
- Comparacion de tecnicas de fine-tuning: el adaptador puede usarse como ejemplo de QLoRA sobre un modelo base popular, para evaluar la eficacia de diferentes configuraciones de adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de evaluacion como MMLU, HumanEval o GSM8K. Al ser un adaptador LoRA sobre un modelo base, su rendimiento en tareas genericas dependera del modelo base, pero no hay datos especificos sobre la calidad del fine-tuning.

## Requisitos de hardware

- VRAM estimada: para cargar el modelo base Qwen3-8B en precision completa se necesitan aproximadamente 16 GB de VRAM. Con cuantizacion (por ejemplo, 4 bits) se reduce a unos 6-8 GB. El adaptador LoRA anade un coste minimo adicional (menos de 1 GB).
- GPU recomendadas: RTX 3090/4090 (24 GB) para precision completa, o GPUs con 8-12 GB (RTX 3060, 4070) si se usa cuantizacion.
- Si cabe en consumer GPU: si, en GPUs de gama media con cuantizacion.
- Opciones de despliegue: al ser un adaptador LoRA, se puede cargar con la libreria `peft` de HuggingFace sobre el modelo base. Para inferencia, se puede usar vLLM, llama.cpp (si se convierte a GGUF) u Ollama (con integracion de adaptadores). Tambien es compatible con TGI (Text Generation Inference) si se configura correctamente.
- Latencia y throughput: no disponible, dependera del hardware y la cuantizacion.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Exulan/qwen3-8b-pol-lora | Qwen3-8B-Base | LoRA | no disponible | cc0-adapter-mixed-rights | Gated |
| baseweight-ai/qwen3-8b-fpb-lora | Qwen3-8B-Base | LoRA | no disponible | no especificada | Publico |
| baseweight-ai/qwen3-8b-cuad-lora | Qwen3-8B-Base | LoRA | no disponible | no especificada | Publico |

Ambos adaptadores de baseweight-ai estan entrenados para tareas especificas (FPB y CUAD) y son comparables en cuanto a que usan el mismo modelo base y tecnica LoRA. Sin embargo, el modelo de Exulan se centra en contenido politico y greentext, mientras que los otros se enfocan en tareas de benchmark. No hay datos de rendimiento publicados para ninguno de ellos.

## Limitaciones y advertencias

- Contenido toxico: el modelo esta etiquetado con `toxic-content` y `not-for-all-audiences`, lo que indica que puede generar lenguaje ofensivo, discriminatorio o politicamente sesgado.
- Sesgos politicos: al entrenarse con datos de un periodo concreto (2014-2025), el modelo puede reflejar sesgos ideologicos presentes en esos datos.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar afirmaciones falsas o inventadas, especialmente en contextos politicos.
- Acceso restringido: requiere aceptar condiciones en HuggingFace, lo que limita su uso en entornos corporativos.
- Licencia no estandar: `cc0-adapter-mixed-rights` no es una licencia comun; el adaptador es de dominio publico, pero el modelo base Qwen3-8B tiene su propia licencia (Apache 2.0), por lo que hay que revisar los terminos combinados.
- No apto para produccion: dado el contenido toxico y la falta de evaluacion, no se recomienda su uso en aplicaciones comerciales o de atencion al cliente.

## Enlaces

- [HuggingFace - Exulan/qwen3-8b-pol-lora](https://huggingface.co/Exulan/qwen3-8b-pol-lora)
- [Qwen3 Technical Report (arXiv)](https://arxiv.org/pdf/2505.09388)
- [baseweight-ai/qwen3-8b-fpb-lora](https://huggingface.co/baseweight-ai/qwen3-8b-fpb-lora)
- [baseweight-ai/qwen3-8b-cuad-lora](https://huggingface.co/baseweight-ai/qwen3-8b-cuad-lora)
- [Qwen3-8B en Qualcomm AI Hub](https://aihub.qualcomm.com/models/qwen3_8b)
- [Qwen3 8B Lora API en ModelsLab](https://modelslab.com/models/qwen/qwen-qwen3-8b-lora)
