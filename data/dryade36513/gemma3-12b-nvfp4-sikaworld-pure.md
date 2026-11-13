# dryade36513/Gemma3-12B-NVFP4-Sikaworld-Pure

## Resumen

Gemma3-12B-NVFP4-Sikaworld-Pure es una cuantizacion en formato NVFP4 del modelo Gemma 3 de 12 000 millones de parametros, publicada por el usuario dryade36513 en Hugging Face. Se trata de un artefacto derivado: no es un modelo entrenado desde cero, sino una conversion de pesos de un Gemma 3 12B (presumiblemente la variante instruct) a precision FP4 mediante el formato NVFP4 de NVIDIA, orientado a inferencia eficiente en GPUs Blackwell. El repositorio ocupa 8,9 GB y se distribuye bajo licencia MIT.

La relevancia de esta publicacion es practica: reducir el peso de un modelo de 12B a un tamano manejable en VRAM manteniendo, en teoria, buena parte de la calidad original. El sufijo "Sikaworld-Pure" sugiere un ajuste o merge especifico del autor, aunque la model card no documenta ni el proceso de cuantizacion, ni los datos de calibracion, ni las metricas de degradacion respecto al modelo base. La informacion disponible es extremadamente escasa: no hay pipeline declarado, no se listan idiomas y no hay resultados de evaluacion.

Por tanto, esta ficha debe leerse como una descripcion del artefacto y de su modelo de origen (Gemma 3 12B, de Google DeepMind), marcando explicitamente que cualquier dato no confirmado por el autor se indica como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 3 12B; detalles de la cuantizacion no disponibles) |
| Parametros totales | 12 000 millones (aproximado, segun el nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el Gemma 3 12B base soporta hasta 128 000 tokens, pero no se confirma para esta conversion) |
| Tipos de cuantizacion | NVFP4 (formato de 4 bits de NVIDIA); no se documentan otros formatos en el repo |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | no disponible de forma explicita; el tamano de 8,9 GB y el nombre NVFP4 apuntan a pesos cuantizados en 4 bits, probablemente en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 3 12B, un transformer decoder-only de Google DeepMind con atencion multi-cabeza, normalizacion RMSNorm y activaciones GeGLU, entrenado sobre datos multilingues y afinado con tecnicas de alineacion (RLHF) en su variante instruct. Gemma 3 introduce mejoras respecto a Gemma 2, como mayor ventana de contexto y soporte multimodal en algunas variantes de la familia, aunque la model card de esta publicacion no confirma que la variante 12B herede vision.

Sobre el proceso de cuantizacion no hay informacion: se desconoce el dataset de calibracion, el algoritmo exacto (por ejemplo, si se aplico GPTQ, AWQ o una conversion directa a NVFP4), el numero de capas cuantizadas y el error de reconstruccion. El termino "Sikaworld-Pure" no viene acompanado de explicacion en el README, por lo que no se puede determinar si implica un merge de pesos, un fine-tuning previo o simplemente una convencion de nombres del autor. Tampoco se documenta ningun entrenamiento adicional tras la cuantizacion.

## Capacidades

- Generacion de texto y razonamiento general, heredados del Gemma 3 12B base (no verificados en esta conversion).
- Generacion de codigo y matematicas, asumiendo que la variante de origen sea la instruct.
- Soporte multilingue: no confirmado en la model card; el Gemma 3 base es multilingue, pero no se especifica que idiomas conserva esta cuantizacion.
- Tool calling / function calling: no documentado.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Vision: no confirmada para esta variante.
- Modo "thinking" o razonamiento extendido: no documentado.

## Casos de uso

- Despliegue en GPUs Blackwell con VRAM limitada: el formato NVFP4 esta disenado para acelerar la inferencia en hardware NVIDIA de ultima generacion; un modelo de 12B en 4 bits ocupa aproximadamente 6-7 GB de pesos, lo que permite ejecutarlo en una sola GPU consumer de gama alta.
- Prototipado rapido de asistentes conversacionales: al caber en una RTX 4090 o similar, sirve para iterar sobre prompts y flujos de chat sin infraestructura dedicada.
- Evaluacion comparativa de cuantizaciones: util para medir la perdida de calidad de FP4 frente a FP16/BF16 en tareas de razonamiento y codigo, siempre que se validen las metricas por cuenta propia.
- Generacion de codigo en local: si la variante de origen es instruct, puede integrarse en editores o pipelines de CI/CD para autocompletado y revision, aunque sin garantias documentadas de tool calling.
- Procesamiento de documentos con contexto medio: util para resumen y extraccion de informacion en entornos con recursos limitados, sujeto a verificar la ventana de contexto real.
- Experimentacion en investigacion: como punto de partida para estudiar el impacto de NVFP4 en modelos de 12B, dado que el repo es pequeno (8,9 GB) y de licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en torno a 6-7 GB solo para pesos en FP4; con cache KV y overhead, entre 8 y 12 GB para contextos moderados (estimacion, no confirmada por el autor).
- GPU recomendadas: NVIDIA Blackwell (B200, RTX 50 series) para aprovechar NVFP4 de forma nativa; en arquitecturas anteriores el formato puede requerir conversion o no estar soportado por el runtime.
- GPU consumer: probablemente cabe en RTX 4090 (24 GB) y RTX 5090; en tarjetas de 8-12 GB el margen es ajustado.
- Opciones de despliegue: no documentadas; NVFP4 suele requerir TensorRT-LLM o vLLM con soporte de cuantizacion FP4. llama.cpp y Ollama no soportan NVFP4 de forma estandar, por lo que habria que convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma3-12B-NVFP4-Sikaworld-Pure | ~12B | no disponible | NVFP4 | MIT | Hugging Face (0 descargas) |
| Gemma 3 12B (original) | ~12B | hasta 128k (segun variante) | BF16/FP16 | Gemma Terms | Hugging Face, ampliamente usado |
| Mistral NeMo 12B | ~12B | 128k | BF16 | Apache 2.0 | Hugging Face |
| Qwen2.5 14B | ~14B | 32k-128k | BF16/GGUF/AWQ | Apache 2.0 | Hugging Face |

La comparativa es orientativa: no hay datos de rendimiento de esta cuantizacion que permitan contrastar calidad frente a los originales en BF16.

## Limitaciones y advertencias

- Model card practicamente vacia: sin datos de calibracion, sin metricas de degradacion y sin instrucciones de uso.
- Riesgo de degradacion por cuantizacion FP4: la perdida de precision en 4 bits puede afectar a tareas sensibles como matematicas o codigo; no hay evaluacion publicada.
- Compatibilidad de hardware restringida: NVFP4 no es un formato universal; en GPUs no Blackwell puede no funcionar o requerir conversion.
- Idiomas no declarados: no se puede garantizar el soporte multilingue del modelo base.
- Sesgos: heredados del Gemma 3 base, no evaluados en esta conversion.
- Riesgo de alucinacion: presente como en cualquier LLM, sin mitigaciones documentadas.
- Licencia MIT declarada por el autor, pero el modelo deriva de Gemma 3, cuyos terminos de uso de Google podrian seguir aplicandose; conviene revisar la compatibilidad antes de un uso comercial.
- Repositorio con 0 descargas y 0 likes: sin validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/dryade36513/Gemma3-12B-NVFP4-Sikaworld-Pure
- Gemma 3 (Google DeepMind): https://huggingface.co/google/gemma-3-12b-it
- Documentacion de Gemma: https://ai.google.dev/gemma
- NVFP4 (NVIDIA): https://developer.nvidia.com/blog/introducing-nvfp4-for-efficient-and-accurate-low-precision-inference/
