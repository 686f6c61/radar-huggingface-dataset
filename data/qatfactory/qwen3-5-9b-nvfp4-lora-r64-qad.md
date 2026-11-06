# qatfactory/Qwen3.5-9B-NVFP4-LoRA-r64-QAD

## Resumen

Qwen3.5-9B-NVFP4-LoRA-r64-QAD es una versión cuantizada del modelo Qwen/Qwen3.5-9B, publicada por el usuario qatfactory en Hugging Face. Se trata de un checkpoint derivado mediante cuantización consciente del entrenamiento (QAT, quantization-aware training) combinada con un adaptador LoRA de rango 64, empaquetado en formato NVFP4 de 4 bits y serializado con la librería compressed-tensors para su uso con vLLM. El resultado es un modelo de 9.409.813.744 parámetros (9,4 mil millones) que ocupa 8,9 GB en el repositorio, lo que supone una reducción significativa frente a los pesos en bf16 del modelo base.

El modelo hereda la arquitectura y capacidades del Qwen3.5-9B original, pero no existe documentación pública sobre el proceso de entrenamiento QAT, los datos utilizados para calibrar la cuantización ni los hiperparámetros del adaptador LoRA. El autor no ha publicado una model card con detalles técnicos, benchmarks ni instrucciones de uso más allá de los metadatos del repositorio.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el modelo tiene cero descargas y cero likes en el momento de la consulta, el acceso está restringido (gated) y no se dispone de información verificable sobre su calidad o fidelidad respecto al modelo base. Se trata, por tanto, de un artefacto experimental de cuantización más que de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-9B; detalles no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, formato de punto flotante de NVIDIA) con compressed-tensors; metadatos indican "8-bit" en los tags |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con vLLM |
| Modelo base | Qwen/Qwen3.5-9B |
| Tecnica de cuantizacion | QAT (quantization-aware training) + LoRA r64 |
| Tamano del repositorio | 8,9 GB |
| Acceso | Restringido (gated) |
| Libreria declarada | vLLM |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo Qwen3.5-9B, del que no se dispone de documentación en la información proporcionada; los metadatos solo confirman que se trata de un transformer con 9.409.813.744 parámetros. La innovación principal de este checkpoint es el pipeline de cuantización: se ha aplicado quantization-aware training (QAT) en formato NVFP4, un esquema de coma flotante de 4 bits definido por NVIDIA para acelerar la inferencia en GPUs Blackwell y posteriores, combinado con un adaptador LoRA de rango 64 que presumiblemente compensa la pérdida de precisión introducida por la cuantización. El resultado se serializa mediante compressed-tensors, el formato estándar de vLLM para pesos comprimidos.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset de calibración, la existencia de RLHF/DPO ni los hiperparámetros del LoRA (tasa de aprendizaje, número de pasos, capas objetivo). Tampoco se documenta si el adaptador LoRA se ha fusionado con los pesos base o se mantiene como módulo separado. Cualquier afirmación sobre el proceso de entrenamiento más allá de lo indicado en los tags sería especulativa.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5-9B, sin verificación independiente en esta versión cuantizada.
- Generación de código y matemáticas: presumiblemente soportadas por el modelo base, pero no documentadas en esta ficha.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (los idiomas no se declaran en los metadatos).
- Modo thinking, visión o audio: no disponible.
- Inferencia optimizada con vLLM: confirmada por la librería declarada y el formato compressed-tensors.

## Casos de uso

- Despliegue de bajo coste en GPUs NVIDIA Blackwell: el formato NVFP4 está diseñado para aprovechar los tensor cores de 4 bits de las arquitecturas Blackwell, lo que permitiría servir el modelo con menor huella de memoria y mayor throughput que una versión en bf16, siempre que se valide la fidelidad de las respuestas.
- Evaluación de pipelines QAT: útil como caso de estudio para equipos que investigan técnicas de cuantización consciente del entrenamiento con LoRA y quieren comparar la degradación respecto al modelo base.
- Prototipado con vLLM: al estar serializado con compressed-tensors y declarar vLLM como librería, puede integrarse en un servidor OpenAI-compatible para pruebas internas de latencia y calidad.
- Fine-tuning posterior sobre el adaptador: si el LoRA no está fusionado, podría servir como punto de partida para ajustes específicos de dominio, aunque esto requeriría verificar la estructura de los pesos.
- Investigación en compresión de modelos: útil para estudiar la interacción entre QAT, LoRA de rango 64 y el formato NVFP4 en un modelo de 9B.
- Despliegue en entornos con restricciones de memoria: los 8,9 GB del repositorio permiten alojar el modelo en GPUs de 24 GB (por ejemplo, RTX 4090) con margen para el contexto, a diferencia de una versión en bf16 que requeriría aproximadamente 19 GB solo para pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9-10 GB solo para pesos en NVFP4; con caché KV y overhead de vLLM, se recomienda un mínimo de 16 GB.
- GPU recomendadas: NVIDIA Blackwell (B200, GB200) para aprovechar las instrucciones NVFP4 nativas; en arquitecturas anteriores (Hopper, Ada) el formato puede emularse o convertirse, con menor eficiencia.
- GPU de consumo: cabe en RTX 4090 (24 GB) y potencialmente en RTX 4080 (16 GB) con contexto reducido, aunque sin aceleración NVFP4 nativa.
- Opciones de despliegue: vLLM (soporte declarado); llama.cpp, Ollama y TGI no están confirmados para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Acceso |
|---|---|---|---|---|---|
| qatfactory/Qwen3.5-9B-NVFP4-LoRA-r64-QAD | 9,4 B | no disponible | NVFP4 + LoRA r64 (QAT) | Apache 2.0 | Gated |
| Qwen/Qwen3.5-9B (base) | 9,4 B | no disponible | bf16 | Apache 2.0 (presumible) | no disponible |
| Versiones GGUF/AWQ de Qwen3.5-9B de terceros | 9,4 B | no disponible | 4-8 bits | Apache 2.0 | no disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de model card: no hay documentación sobre entrenamiento, calibración, evaluación ni uso previsto.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción para su uso.
- Riesgo de degradación por cuantización: NVFP4 de 4 bits puede introducir pérdida de precisión en tareas sensibles (matemáticas, código, razonamiento largo) que no ha sido cuantificada públicamente.
- Inconsistencia en metadatos: los tags indican "8-bit" mientras que el nombre y el formato apuntan a NVFP4 de 4 bits; conviene verificar los pesos antes de confiar en el formato.
- Compatibilidad limitada: el formato NVFP4 con compressed-tensors está pensado para vLLM y GPUs Blackwell; otros runtimes pueden no soportarlo.
- Idiomas no declarados: no se puede garantizar el soporte multilingüe sin probarlo.
- Riesgo de alucinación y sesgos: heredados del modelo base, no evaluados en esta versión.
- Licencia Apache 2.0: permite uso comercial, pero la falta de documentación sobre el proceso QAT y el LoRA impide descartar obligaciones adicionales derivadas de los datos de calibración.
- No apto para producción sin evaluación previa: se recomienda validar contra el modelo base en el dominio de uso antes de cualquier despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/qatfactory/Qwen3.5-9B-NVFP4-LoRA-r64-QAD
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Documentación de compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Documentación de vLLM: https://docs.vllm.ai
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
