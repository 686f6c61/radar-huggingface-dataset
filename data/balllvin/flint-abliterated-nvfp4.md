# balllvin/Flint-abliterated-NVFP4

## Resumen

Flint-abliterated-NVFP4 es una versión cuantizada a 4 bits en formato NVFP4 del modelo Flint, publicado por el usuario balllvin en Hugging Face. Se trata de una variante "abliterated" del modelo base RecursiveSI/flint, lo que implica que se han eliminado o atenuado los mecanismos de rechazo de contenido del modelo original mediante técnicas de abliteration. El resultado es un modelo de generación de texto conversacional orientado a producir respuestas sin las restricciones típicas de alineamiento.

El modelo cuenta con aproximadamente 39.800 millones de parámetros totales almacenados en safetensors, con un repositorio de 22,9 GB, lo que es coherente con una cuantización de 4 bits sobre un modelo denso de ese tamaño. La arquitectura se etiqueta como MoE (mixture of experts), aunque no se dispone de información detallada sobre el número de parámetros activos ni la configuración de expertos. El contexto máximo, los datos de entrenamiento y los resultados de benchmarks no están documentados en la información disponible.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: una cuantización NVFP4 (formato de punto flotante de 4 bits optimizado para GPUs Blackwell de NVIDIA mediante ModelOpt), una modificación abliterated que altera el comportamiento de seguridad, y un acceso restringido que obliga a aceptar condiciones en Hugging Face. Todo ello bajo licencia Apache 2.0 y con soporte únicamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), según tags del repositorio; detalles no disponibles |
| Parametros totales | 39.785.287.456 (~39,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits), 8 bits (según tags), modelopt |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (cuantización NVFP4) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base es RecursiveSI/flint y que la variante aquí descrita ha sido sometida a un proceso de abliteration, técnica que consiste en identificar y suprimir direcciones del espacio de activaciones asociadas al rechazo de peticiones, de modo que el modelo deja de negarse a responder ante ciertos tipos de contenido. Posteriormente se ha cuantizado a NVFP4, un formato de coma flotante de 4 bits con escala por bloque promovido por NVIDIA a través de ModelOpt y orientado a la inferencia eficiente en GPUs de arquitectura Blackwell.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni sobre innovaciones técnicas específicas del modelo base más allá de la etiqueta MoE. Tampoco se documenta el proceso exacto de abliteration aplicado ni el pipeline de cuantización empleado (calibración, granularidad de escalas, etc.).

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Razonamiento y respuesta a instrucciones propias de un modelo de gran tamaño (≈39,8 B de parámetros).
- Comportamiento "abliterated": menor probabilidad de rechazar peticiones que el modelo base, lo que amplía el rango de respuestas generadas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo de idiomas del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar cómo la abliteration altera la distribución de respuestas y los mecanismos de rechazo, comparándolo con el modelo base RecursiveSI/flint en entornos controlados de evaluación.
- Generación creativa sin restricciones de estilo: útil para escritura de ficción, guiones o narrativa donde se requiere explorar tonos y temáticas que los modelos alineados suelen evitar; el contexto disponible debe validarse empíricamente al no estar documentado.
- Experimentación con cuantización NVFP4: sirve como banco de pruebas para medir la degradación de calidad y las ganancias de rendimiento de NVFP4 frente a FP8 o BF16 en un modelo de ~40 B, usando ModelOpt y GPUs Blackwell.
- Despliegue en infraestructura con VRAM limitada: los 22,9 GB de pesos permiten cargar el modelo en una única GPU de 24 GB (por ejemplo, RTX 4090 o L4) si el runtime y el contexto lo permiten, algo inviable con los ~80 GB en BF16 de un modelo de este tamaño.
- Evaluación comparativa de variantes abliterated: útil para pipelines de red-teaming que comparan la tasa de cumplimiento de peticiones frente a versiones alineadas del mismo modelo base.
- Generación de datos sintéticos para dominios sensibles: en proyectos de investigación que requieren corpus con temáticas no filtradas, siempre con revisión humana posterior y cumplimiento normativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~23 GB solo para pesos en NVFP4; añadir overhead de KV cache y activaciones, por lo que se recomienda un mínimo de 24-32 GB para contextos cortos.
- GPU recomendadas: NVIDIA Blackwell (B200, RTX 50xx) para aprovechar las instrucciones nativas NVFP4; GPUs Hopper (H100, H200) y Ada (L40S, RTX 4090) pueden ejecutar el formato con mayor o menor soporte según el runtime.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB) y RTX 5090, con margen ajustado; en GPUs de 16 GB no cabría sin offloading.
- Opciones de despliegue: transformers (librería declarada), TensorRT-LLM y NVIDIA ModelOpt para NVFP4; vLLM, llama.cpp, Ollama y TGI no está confirmado que soporten NVFP4 en la fecha de publicación.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Acceso |
|---|---|---|---|---|---|
| balllvin/Flint-abliterated-NVFP4 | ~39,8 B | no disponible | NVFP4 (4 bits) | Apache 2.0 | Restringido (gated) |
| RecursiveSI/flint (base) | no disponible | no disponible | BF16/FP16 (presumible) | no disponible | no disponible |
| Versiones abliterated de Llama 3.1 70B | 70 B | 128 K | múltiples (GGUF, AWQ) | Llama 3.1 Community | Abierto |
| Qwen2.5-32B-Instruct | 32,5 B | 128 K | múltiples (GGUF, AWQ, GPTQ) | Apache 2.0 | Abierto |

La comparativa con alternativas concretas es limitada porque no se dispone de datos de rendimiento del modelo ni de especificaciones del modelo base. Las filas de Llama 3.1 70B abliterated y Qwen2.5-32B se incluyen como referencia de categoría, no como equivalencia técnica verificada.

## Limitaciones y advertencias

- Modelo abliterated: la supresión de mecanismos de rechazo incrementa el riesgo de generar contenido dañino, ofensivo o ilegal; no es apto para producción orientada al usuario final sin filtros externos.
- Sesgos conocidos: no documentados, pero heredados del modelo base y potencialmente amplificados por la abliteration.
- Riesgo de alucinación: no cuantificado; en modelos de ~40 B sin benchmarks publicados debe asumirse un riesgo significativo y validar las salidas.
- Limitación de idioma: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Longitud de contexto desconocida: impide planificar casos de uso con documentos largos sin pruebas empíricas.
- Licencia Apache 2.0: permite uso comercial, pero el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face; verificar que las condiciones de acceso no impongan restricciones adicionales.
- Compatibilidad de runtime: NVFP4 requiere soporte específico (TensorRT-LLM, ModelOpt); muchos stacks habituales (llama.cpp, Ollama) pueden no cargar los pesos directamente.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; la calidad de la cuantización y de la abliteration no está contrastada por terceros.
- Fecha de creación futura en los metadatos (2026-11-14): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/balllvin/Flint-abliterated-NVFP4
- Modelo base: https://huggingface.co/RecursiveSI/flint
- NVIDIA ModelOpt (herramienta de cuantización NVFP4): https://github.com/NVIDIA/TensorRT-Model-Optimizer
- TensorRT-LLM (runtime con soporte NVFP4): https://github.com/NVIDIA/TensorRT-LLM
