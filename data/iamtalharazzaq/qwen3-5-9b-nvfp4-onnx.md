# iamtalharazzaq/Qwen3.5-9B-NVFP4-onnx

## Resumen

Qwen3.5-9B-NVFP4-onnx es una exportación cuantizada en formato NVFP4 y ONNX del modelo multimodal Qwen3.5-9B de Qwen, publicada por el usuario iamtalharazzaq en Hugging Face. El modelo base pertenece a la familia Qwen3.5, una serie de modelos abiertos de Alibaba orientados a tareas de texto e imagen, y este repositorio se centra específicamente en la optimización para inferencia en hardware NVIDIA, combinando la cuantización NVFP4 (punto flotante de 4 bits, formato nativo de las GPU Blackwell de NVIDIA) con el formato ONNX para portabilidad entre runtimes.

El problema que resuelve esta ficha de modelo es la reducción del coste de memoria y el aumento del rendimiento de inferencia: al cuantizar los pesos a 4 bits, el tamaño del repositorio se sitúa en torno a 13,5 GB, lo que facilita el despliegue en GPU con VRAM limitada. La herramienta empleada para la cuantización es NVIDIA Model Optimizer 0.45.0, y la exportación se ha realizado con TensorRT-Edge-LLM, lo que indica un enfoque dirigido a despliegues en el borde (edge) y estaciones de trabajo NVIDIA.

Su relevancia actual radica en la tendencia de la industria hacia la cuantización FP4 para modelos multimodales de tamaño medio: permite ejecutar un modelo de 9B parámetros con capacidades de visión y lenguaje en hardware de consumo o edge sin recurrir a cuantizaciones enteras más agresivas (INT4), conservando en teoría mejor la precisión. La licencia Apache 2.0 del modelo base permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (multimodal, texto e imagen) |
| Parametros totales | 9B (aproximado, según denominación del modelo base) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (punto flotante de 4 bits, vía NVIDIA Model Optimizer 0.45.0) |
| Idiomas soportados | Inglés, chino, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe (según model card); los metadatos del repo listan en, ar, es, de, it, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX con cuantización NVFP4; checkpoint en safetensors (tokenizer, processor y configuración incluidos) |

## Arquitectura y entrenamiento

El modelo base, Qwen3.5-9B, utiliza la arquitectura Qwen3_5ForConditionalGeneration, una variante de la familia Qwen diseñada para tareas condicionales de imagen-texto a texto (image-text-to-text). Esto implica que el modelo integra un componente de visión (típicamente un codificador visual tipo ViT conectado mediante un proyector al modelo de lenguaje) junto con el decodificador de lenguaje autorregresivo. La model card no detalla el número exacto de capas, dimensiones ocultas ni el mecanismo de atención empleado, por lo que estos datos no están disponibles.

Respecto al entrenamiento del modelo base, la información proporcionada no incluye el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO; estos datos no están disponibles. Lo que sí está documentado es el proceso de optimización posterior: el modelo se cuantizó a NVFP4 mediante NVIDIA Model Optimizer 0.45.0 y se exportó a ONNX con TensorRT-Edge-LLM. NVFP4 es el formato de cuantización de 4 bits en coma flotante de NVIDIA (E2M1 con escalado por bloques), que ofrece una mejor relación precisión-compresión que la cuantización entera INT4 en GPU compatibles, especialmente en las arquitecturas Blackwell que soportan este formato de forma nativa. El repositorio incluye además los logs de cuantización y exportación, lo que facilita auditar el proceso.

## Capacidades

- Generación de texto y conversación multi-turno en múltiples idiomas (inglés, chino, español, alemán, italiano, árabe, entre otros).
- Comprensión de imágenes: al ser un modelo image-text-to-text, puede responder preguntas sobre imágenes, describir contenido visual y razonar sobre entradas multimodales.
- Razonamiento general y resolución de problemas: hereda las capacidades de la familia Qwen3.5, aunque no se han documentado resultados específicos en la información disponible.
- Generación y comprensión de código: capacidad típica de la familia Qwen, aunque sin benchmarks verificados en esta ficha.
- Compatibilidad con runtimes de NVIDIA optimizados (TensorRT-Edge-LLM), orientado a inferencia de baja latencia en edge.
- No se indica soporte explícito de tool calling, function calling, modo de pensamiento (thinking mode) ni capacidades de audio en la información disponible.

## Casos de uso

- Asistentes visuales para documentación técnica: dado su pipeline image-text-to-text, el modelo puede responder preguntas sobre capturas de pantalla, diagramas de arquitectura o fotografías de equipos, útil para soporte interno en empresas.
- Atención al cliente multimodal: puede gestionar conversaciones en español y otros idiomas combinando texto e imágenes enviadas por el usuario (por ejemplo, fotos de productos dañados), con la ventaja de una huella de memoria reducida por la cuantización FP4.
- Despliegue en edge y dispositivos NVIDIA embarcados: gracias a la exportación ONNX y TensorRT-Edge-LLM, es adecuado para kioscos, robots o sistemas de inspección visual que necesiten describir o clasificar imágenes localmente sin depender de la nube.
- Moderación y análisis de contenido con imagen: integración en pipelines que requieran describir o evaluar imágenes subidas por usuarios en plataformas, ejecutándose en GPU de datacenter con alto throughput.
- Generación de descripciones alternativas (alt text) a escala: su capacidad multilingüe permite generar textos alternativos en español, inglés, alemán u otros idiomas soportados para mejorar la accesibilidad de sitios web.
- Prototipado de aplicaciones RAG multimodales: al ser un modelo de 9B parámetros cuantizado a 4 bits, cabe en una sola GPU de consumo o workstation, lo que lo hace práctico para desarrollar y probar sistemas de recuperación aumentada con documentos que combinan texto e imágenes.
- Traducción y comprensión multilingüe con contexto visual: soporta árabe, chino, japonés, coreano y lenguas europeas, útil para flujos de trabajo internacionales que mezclen texto en varios idiomas con material gráfico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones comparativas del modelo cuantizado frente al modelo base en precisión completa, por lo que no es posible cuantificar la degradación introducida por la cuantización NVFP4 a partir de los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 13,5 GB; considerando overhead de activaciones, KV cache y el componente de visión, una GPU con 16 GB de VRAM debería ser suficiente en la mayoría de escenarios, aunque este valor es una estimación y no un dato publicado.
- GPU recomendadas: las GPU NVIDIA con soporte nativo de NVFP4 (arquitectura Blackwell, como RTX 5090 o B100/B200) ofrecerán el mejor rendimiento; en arquitecturas anteriores (Ampere, Ada, Hopper) el formato FP4 puede requerir emulación o dequantización, con penalización de rendimiento. No se especifica compatibilidad en la model card.
- Consumer GPU: con ~13,5 GB de pesos, el modelo debería caber en una RTX 4090 (24 GB), RTX 5090 (32 GB) y probablemente en una RTX 4080/5080 (16 GB) con ajustes; no cabe cómodamente en GPUs de 12 GB o menos.
- Opciones de despliegue: el modelo está exportado a ONNX con TensorRT-Edge-LLM, por lo que el runtime indicado por el autor es un runtime NVIDIA compatible con los grafos ONNX y la representación NVFP4 (TensorRT-Edge-LLM / TensorRT-LLM). No es un GGUF estándar, por lo que llama.cpp y Ollama no lo soportan directamente; para usar el modelo base sin cuantizar, puede recurrirse a vLLM o TGI con Qwen/Qwen3.5-9B.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Multimodal | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-9B-NVFP4-onnx (este modelo) | 9B (base) | NVFP4 | ONNX | Sí (imagen-texto a texto) | Apache 2.0 |
| Qwen/Qwen3.5-9B (base) | 9B | FP16/BF16 (sin cuantizar) | safetensors | Sí | Apache 2.0 |
| Qwen2.5-VL-7B-Instruct | 7B | FP16/BF16, GGUF comunitarios | safetensors / GGUF | Sí | Apache 2.0 |
| Llama 3.2 11B Vision Instruct | 11B | FP16/BF16, cuantizaciones comunitarias | safetensors | Sí | Llama 3.2 Community License |

En comparación con el modelo base, esta versión ofrece una reducción sustancial de memoria a cambio de una posible pérdida de precisión no documentada. Frente a Qwen2.5-VL-7B-Instruct, el modelo base Qwen3.5-9B es de generación más reciente, pero esta exportación concreta está limitada a runtimes NVIDIA con soporte NVFP4/ONNX, mientras que las alternativas con pesos en safetensors estándar ofrecen mayor compatibilidad con ecosistemas como vLLM, TGI o llama.cpp. La licencia de Llama 3.2 impone restricciones adicionales frente a Apache 2.0.

## Limitaciones y advertencias

- Degradación por cuantización no documentada: no se han publicado evaluaciones que midan el impacto de la cuantización NVFP4 sobre la calidad del modelo base, por lo que conviene validar el modelo en las tareas objetivo antes de pasar a producción.
- Compatibilidad de hardware limitada: NVFP4 está pensado para GPU NVIDIA recientes; en arquitecturas más antiguas el rendimiento puede ser pobre o el runtime puede no soportar el formato.
- Ecosistema restringido: al tratarse de una exportación ONNX específica, no es directamente utilizable con llama.cpp, Ollama ni la mayoría de librerías de transformers estándar sin trabajo adicional.
- Repositorio de terceros: el modelo ha sido publicado por un usuario individual (iamtalharazzaq) y no por el equipo oficial de Qwen; tiene 0 descargas registradas, por lo que carece de validación comunitaria. Conviene revisar los logs de cuantización incluidos y verificar la integridad de los pesos.
- Sesgos y alucinaciones: como todo modelo de lenguaje de la familia Qwen, puede generar contenido incorrecto o sesgado, especialmente en idiomas distintos del inglés y el chino, que suelen ser los de mejor rendimiento en esta familia de modelos.
- Longitud de contexto no documentada: al no estar especificada, no se puede garantizar el comportamiento en entradas muy largas.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo hereda cualquier término del modelo base Qwen/Qwen3.5-9B, que también es Apache 2.0 según los metadatos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/iamtalharazzaq/Qwen3.5-9B-NVFP4-onnx
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- TensorRT-Edge-LLM: https://github.com/NVIDIA/TensorRT-Edge-LLM
- Autor: https://huggingface.co/iamtalharazzaq
