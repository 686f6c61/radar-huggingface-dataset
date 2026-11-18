# intel-ai/Qwen3.5-397B-A17B-NVFP4-AutoRound-4L

## Resumen

Qwen3.5-397B-A17B-NVFP4-AutoRound-4L es una versión cuantizada del modelo Qwen3.5-397B-A17B, publicada por el equipo intel-ai. Se trata de una conversión a NVFP4 (formato de coma flotante de 4 bits de NVIDIA) realizada con la herramienta AutoRound de Intel, que aplica cuantización consciente del entrenamiento (quantization-aware) para preservar la precisión. El modelo base es un transformer de tipo Mixture of Experts (MoE) de la familia Qwen3.5, con 397.000 millones de parámetros totales y 17.000 millones activos por token.

El repositorio se distribuye en formato safetensors con `compressed-tensors` y está etiquetado como "8-bit" en Hugging Face, aunque el nombre indica NVFP4 (4 bits). El tamaño del repo es de 30,0 GB y el recuento real de parámetros en los safetensors es de 18.587.405.248, un dato que no coincide con los 397B del nombre y que probablemente refleja los pesos efectivamente almacenados tras la cuantización o un subconjunto del modelo. Esta discrepancia debe tenerse en cuenta al planificar el despliegue.

La relevancia de esta ficha radica en que ofrece una vía para ejecutar un MoE de gran escala en hardware con memoria limitada, gracias a la compresión a 4 bits. No obstante, la información pública disponible es muy escasa: no hay pipeline declarado, ni licencia, ni idiomas, ni benchmarks publicados en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) |
| Parámetros totales | 397B (según nombre); 18.587.405.248 en safetensors |
| Parámetros activos | 17B (según nombre) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (4 bits) vía AutoRound; tag "8-bit" y compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts: de los 397B parámetros totales, solo 17B se activan por token, lo que reduce el coste computacional en inferencia manteniendo una gran capacidad de representación. La versión publicada por intel-ai aplica cuantización NVFP4 mediante AutoRound, una técnica de cuantización consciente del entrenamiento que ajusta los pesos y los factores de escala para minimizar la pérdida de precisión al pasar a 4 bits. El resultado se empaqueta con el formato `compressed-tensors`, compatible con librerías de inferencia que soportan este esquema.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo original. Tampoco se detallan innovaciones técnicas adicionales (atención lineal, decodificación especulativa, etc.) en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas del modelo base Qwen3.5.
- Capacidad de código y matemáticas, presumible en un modelo de esta familia, aunque no confirmada en la información disponible.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un MoE de gran escala en infraestructura con VRAM limitada: la cuantización NVFP4 reduce el peso del modelo a aproximadamente 30 GB en disco, lo que permite cargarlo en GPUs de 48-80 GB con offloading parcial y ejecutar inferencia de un modelo de 397B parámetros totales.
- Servicio de generación de texto de alta capacidad en entornos con presupuesto de memoria ajustado: al activar solo 17B parámetros por token, el coste computacional por token es comparable al de un modelo denso de 17B, adecuado para APIs de chat o completado.
- Experimentación e investigación sobre cuantización: el repositorio sirve como referencia para evaluar la calidad de AutoRound con NVFP4 en un MoE grande, comparando la salida con el modelo original en tareas de razonamiento y código.
- Prototipado de asistentes conversacionales con contexto largo: si el modelo base soporta ventanas de contexto amplias (dato no disponible), podría emplearse en atención al cliente multi-turno, aunque la falta de especificaciones obliga a validarlo empíricamente.
- Generación de código en pipelines internos: un MoE de esta escala puede integrarse en herramientas de autocompletado o revisión de código, siempre que se valide su calidad frente al modelo sin cuantizar.
- Fine-tuning ligero o adaptación con LoRA sobre la versión cuantizada: aunque la cuantización NVFP4 complica el entrenamiento directo, el formato compressed-tensors permite en algunos casos adaptadores sobre las capas no cuantizadas; requiere verificación con la librería de inferencia elegida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 30,0 GB en disco; en inferencia, el peso en memoria es similar, aunque los safetensors declaran 18,59B parámetros, lo que sugiere que la cifra de 397B del nombre no se corresponde con el contenido real del repo. Verificar antes de aprovisionar.
- GPU recomendadas: para un modelo de este tamaño en 4 bits, se necesitan GPUs con 48 GB o más (A6000, L40S, A100 80GB, H100 80GB). Si el recuento real es de 18,59B parámetros, cabría en una RTX 4090 de 24 GB con cuantización adicional.
- ¿Cabe en consumer GPU? Depende del recuento real de parámetros: con 18,59B en 4 bits (~9-10 GB) sí cabría en RTX 4090/3090; con 397B en 4 bits (~200 GB) no cabría en ninguna consumer GPU.
- Opciones de despliegue: vLLM y TGI con soporte de compressed-tensors/NVFP4; llama.cpp y Ollama solo si se genera una conversión GGUF adicional, no incluida en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-397B-A17B-NVFP4-AutoRound-4L | 397B totales / 17B activos (nombre); 18,59B en safetensors | no disponible | no disponible | safetensors NVFP4 | Hugging Face |
| Qwen3.5-397B-A17B (base, sin cuantizar) | 397B / 17B activos | no disponible | no disponible | safetensors | no disponible en la información |
| Alternativas MoE cuantizadas de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Discrepancia crítica entre el nombre (397B) y los parámetros reales en safetensors (18,59B): verificar el contenido del repo antes de usarlo en producción.
- La cuantización NVFP4 puede degradar la calidad en tareas sensibles a la precisión numérica (matemáticas, código, razonamiento largo); no hay benchmarks publicados que cuantifiquen esta pérdida.
- Licencia no declarada: no se puede confirmar el uso comercial; contactar con el autor o consultar la licencia del modelo base Qwen3.5.
- Idiomas soportados no declarados: no asumir cobertura multilingüe sin validación.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala, potencialmente amplificado por la cuantización agresiva.
- El tag "8-bit" en Hugging Face contradice el nombre NVFP4 (4 bits); confirmar el esquema real de cuantización en los ficheros de configuración.
- Sin pipeline declarado ni demo: la integración requiere configuración manual con la librería de inferencia compatible con compressed-tensors.
- Repositorio con solo 39 descargas y 0 likes: poca validación comunitaria, lo que aumenta el riesgo de problemas no documentados.

## Enlaces

- Hugging Face: https://huggingface.co/intel-ai/Qwen3.5-397B-A17B-NVFP4-AutoRound-4L
- AutoRound (Intel): no disponible en la información proporcionada
- Modelo base Qwen3.5-397B-A17B: no disponible en la información proporcionada
- Paper o blog de Qwen3.5: no disponible en la información proporcionada
