# qatfactory/Qwen3.5-9B-NVFP4-QAD

## Resumen

Qwen3.5-9B-NVFP4-QAD es una versión cuantizada del modelo base Qwen/Qwen3.5-9B, desarrollada por el usuario qatfactory. Se trata de una conversión a formato NVFP4 (formato de punto flotante de 4 bits con escalado por bloques, introducido por NVIDIA para aceleración en GPUs Blackwell) realizada mediante quantización con entrenamiento consciente (QAT, quantization-aware training). El resultado se distribuye en formato compressed-tensors y está pensado para su despliegue en vLLM.

El modelo resuelve un problema muy concreto: reducir el coste de memoria y aumentar el throughput de inferencia de un transformer de aproximadamente 9.400 millones de parámetros, manteniendo una calidad cercana al modelo original gracias al proceso QAT en lugar de una cuantización post-entrenamiento puramente estática. El repositorio ocupa 8,9 GB, lo que refleja el ahorro frente a pesos en bf16 (que rondarían los 18-19 GB).

Es relevante ahora porque NVFP4 es uno de los formatos de cuantización de 4 bits promovidos por NVIDIA para el hardware Blackwell (B200, GB200), y las herramientas de vLLM y compressed-tensors están adoptándolo. Sin embargo, la información publicada por el autor es mínima: no hay pipeline declarado, no se especifican idiomas, no hay benchmarks y el acceso está restringido (gated). El modelo base Qwen3.5-9B es de Alibaba Qwen y se distribuye bajo Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), cuantizado NVFP4 |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-9B; no confirmada en esta ficha) |
| Tipos de cuantización | NVFP4 (4 bits, formato con escalado por bloques), 8-bit según tag; QAT |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (NVFP4), compatible con vLLM |
| Modelo base | Qwen/Qwen3.5-9B |
| Tamaño del repositorio | 8,9 GB |
| Librería de inferencia | vLLM |
| Acceso | Restringido (gated) en Hugging Face |

## Arquitectura y entrenamiento

El modelo es una conversión cuantizada del transformer denso Qwen3.5-9B. La arquitectura subyacente corresponde a la familia Qwen3.5 de Alibaba Qwen, pero la información proporcionada no detalla la composición de capas, el número de cabezas de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa. Lo que sí se conoce es el proceso de cuantización: NVFP4 es un formato de 4 bits que agrupa valores en bloques (típicamente de 16 elementos) con escalas compartidas, lo que permite representar pesos con mayor fidelidad que una cuantización de 4 bits uniforme. El sufijo QAD en el nombre indica quantización con entrenamiento consciente (quantization-aware training), es decir, los pesos se ajustaron durante el proceso para minimizar la pérdida de calidad respecto al modelo en bf16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo base. Tampoco se documentan detalles del pipeline QAT empleado por qatfactory (número de pasos, datos de calibración, hiperparámetros). Todo ello debe considerarse no disponible en esta ficha.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-9B, aunque no se documentan explícitamente en el repositorio.
- Generación de código y matemáticas: presumiblemente presente por la familia Qwen3.5, sin confirmación en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Inferencia acelerada en vLLM con pesos NVFP4: capacidad confirmada por los tags del repositorio.

## Casos de uso

- Despliegue de bajo coste en GPUs Blackwell: el formato NVFP4 está diseñado para aprovechar los tensor cores de 4 bits de las GPU B200/GB200, de modo que un modelo de 9.400 millones de parámetros puede servirse con una huella de memoria de aproximadamente 5 GB de pesos, liberando VRAM para el KV cache y permitiendo mayores lotes por GPU.
- Servicio de chat multi-turno en producción: al ser un transformer denso de ~9B con pesos de 4 bits, encaja en despliegues vLLM con batching continuo para aplicaciones de atención al cliente o asistentes internos donde el coste por token es crítico.
- Generación de código en pipelines de CI/CD: si el modelo base conserva las capacidades de código de la familia Qwen3.5, puede integrarse en herramientas de revisión automática o generación de tests; conviene validar la calidad tras la cuantización antes de usarlo en producción.
- Prototipado e investigación en cuantización: útil como referencia para estudiar el impacto de NVFP4 + QAT frente a cuantizaciones post-entrenamiento (GPTQ, AWQ, FP8) en modelos de ~9B.
- Inferencia en entornos con restricciones de memoria: los 8,9 GB del repositorio permiten cargar el modelo en GPUs consumer de 16 GB o 24 GB (RTX 4080/4090) si el backend soporta NVFP4, aunque la aceleración real depende del hardware.
- Evaluación comparativa de calidad: sirve para medir la degradación introducida por QAT frente al modelo base en tareas de razonamiento, código y matemáticas, siempre que se tenga acceso al repositorio gated.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para pesos: ~5 GB con NVFP4 (4 bits sobre 9.400 millones de parámetros), más overhead de escalas y metadatos de compressed-tensors.
- VRAM total recomendada: 16-24 GB para contexto moderado y lotes pequeños; 40-80 GB para contextos largos o batching alto.
- GPU recomendadas: NVIDIA B200, GB200 y otras Blackwell para aprovechar la aceleración nativa NVFP4; H100/H200 y A100 pueden ejecutar el modelo pero sin las ventajas de tensor cores de 4 bits.
- GPU consumer: posible en RTX 4090 (24 GB) y RTX 4080 (16 GB) si el backend soporta NVFP4; en GPUs Ampere o anteriores el rendimiento puede degradarse o requerir de-cuantización.
- Opciones de despliegue: vLLM (declarado en los tags), con soporte de compressed-tensors; llama.cpp y Ollama no están confirmados para NVFP4.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qatfactory/Qwen3.5-9B-NVFP4-QAD | 9.400 M | no disponible | NVFP4 (QAT) | Apache 2.0 | Gated |
| Qwen/Qwen3.5-9B (base) | 9.400 M | no disponible | bf16/fp16 | Apache 2.0 | Público |
| Versiones AWQ/GPTQ de modelos ~9B | ~9.000 M | según base | 4 bits post-entrenamiento | según base | Público |
| Versiones FP8 de modelos ~9B | ~9.000 M | según base | FP8 | según base | Público |

La comparación directa con otras cuantizaciones del mismo modelo base no está disponible en la información proporcionada. La ventaja diferencial de esta versión es el uso de QAT en lugar de cuantización post-entrenamiento, lo que en teoría reduce la degradación, y el formato NVFP4 orientado a Blackwell.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar el modelo.
- Información muy escasa: no se documentan idiomas, contexto, benchmarks ni detalles del proceso QAT.
- Riesgo de degradación por cuantización: aunque el QAT mitiga la pérdida, no hay datos publicados que cuantifiquen la diferencia frente al modelo base.
- Dependencia de hardware: NVFP4 rinde mejor en GPUs Blackwell; en arquitecturas anteriores la ventaja desaparece y puede haber incompatibilidades.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan medidas específicas de mitigación.
- Sesgos: no disponibles; se heredan los del modelo base Qwen3.5-9B.
- Uso comercial: la licencia Apache 2.0 lo permite, pero conviene verificar las condiciones del modelo base y del repositorio gated.
- Madurez: repositorio con 0 descargas y 0 likes, creado en noviembre de 2026; no hay evidencia de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/qatfactory/Qwen3.5-9B-NVFP4-QAD
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Documentación de compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Documentación de vLLM: https://docs.vllm.ai
- Paper de NVFP4 (NVIDIA): no disponible en la información proporcionada
