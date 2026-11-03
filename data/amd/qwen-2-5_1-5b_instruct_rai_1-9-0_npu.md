# amd/Qwen-2.5_1.5B_Instruct_rai_1.9.0_npu

## Resumen

El modelo `amd/Qwen-2.5_1.5B_Instruct_rai_1.9.0_npu` es una distribución optimizada de Qwen 2.5 1.5B Instruct publicada por AMD para su ejecución sobre las NPU (unidades de procesamiento neuronal) de la plataforma Ryzen AI. No se trata de un modelo entrenado desde cero por AMD, sino de una conversión del checkpoint original de Alibaba Qwen a formato ONNX, cuantizado con la herramienta Quark del propio fabricante y empaquetado para el runtime Ryzen AI 1.9.0, de modo que pueda ejecutarse de forma nativa en el acelerador integrado en los procesadores AMD de última generación.

El modelo base Qwen 2.5 1.5B Instruct es un transformer decoder-only denso de aproximadamente 1.500 millones de parámetros, con una ventana de contexto nativa de 32.768 tokens y capacidades de generación de texto, razonamiento, código y matemáticas, además de soporte de tool calling. La contribución de esta variante es puramente de despliegue: adapta esos pesos a un grafo ONNX ejecutable sobre la NPU Ryzen AI, lo que permite inferencia local con bajo consumo energético en equipos portátiles y de escritorio con hardware AMD compatible.

Su relevancia radica en que ejemplifica el patrón de despliegue de LLMs en hardware de consumo no-GPU: en lugar de requerir una tarjeta gráfica dedicada, el modelo se ejecuta sobre la NPU integrada, liberando la GPU y reduciendo el consumo. El acceso está restringido (gated) en HuggingFace y requiere aceptar las condiciones del repositorio. El repositorio ocupa 2,4 GB y los pesos se distribuyen en formato ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen 2.5), exportado a ONNX para NPU Ryzen AI |
| Parametros totales | 1.500 millones (1,5B) aproximadamente, segun el modelo base Qwen 2.5 1.5B Instruct |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen 2.5 1.5B soporta 32.768 tokens) |
| Tipos de cuantizacion | cuantizacion mediante Quark para NPU Ryzen AI; nivel exacto (INT8/INT4) no disponible |
| Idiomas soportados | en (ingles, segun la tarjeta del modelo) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (runtime Ryzen AI 1.9.0) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen 2.5 1.5B Instruct, un transformer decoder-only denso con atención por múltiples cabezas, normalización RMSNorm y activación SwiGLU, entrenado por Alibaba Qwen sobre un corpus multilingüe de varios billones de tokens y posteriormente alineado mediante instrucciones y preferencias humanas (SFT y optimización de preferencias). No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset ni las técnicas de RLHF/DPO empleadas.

La innovación de esta variante concreta no está en el entrenamiento sino en la cadena de despliegue: AMD convierte el checkpoint original a un grafo ONNX, lo cuantiza con Quark y lo empaqueta para el runtime Ryzen AI 1.9.0, que distribuye la ejecución sobre la NPU. Esto implica que las capas se ejecutan en el acelerador neuronal en lugar de la CPU o la GPU, con el objetivo de reducir latencia y consumo. No se documenta en la información disponible si se aplican técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento básico y resolución de problemas de complejidad media, heredado del modelo base Qwen 2.5.
- Generación de código en lenguajes habituales (Python, JavaScript, etc.), propia de la familia Qwen 2.5 Instruct.
- Matemáticas elementales e intermedias.
- Soporte de tool calling / function calling, según las capacidades del modelo base Qwen 2.5 Instruct.
- Capacidad de seguir instrucciones y mantener formato estructurado en las respuestas.
- Ejecución local sobre NPU Ryzen AI, sin dependencia de GPU dedicada ni de servicios en la nube.
- Capacidades multilingües limitadas a las declaradas en la tarjeta (inglés); el modelo base soporta más idiomas, pero la tarjeta de esta variante solo declara `en`.

## Casos de uso

- Asistentes locales en portátiles con Ryzen AI: el modelo se ejecuta sobre la NPU integrada, lo que permite un asistente conversacional que funciona sin conexión y sin consumir la GPU, adecuado para equipos de trabajo con batería limitada.
- Procesamiento de texto en el borde (edge computing): clasificación, resumen y extracción de entidades en dispositivos AMD sin infraestructura cloud, gracias a la ejecución ONNX sobre NPU.
- Automatización de atención al cliente en local: gestión de conversaciones multi-turno en inglés con contexto moderado, desplegable en estaciones de trabajo con hardware Ryzen AI para entornos con requisitos de privacidad.
- Generación de código asistida en IDE sobre hardware de consumo: el modelo puede completar y explicar fragmentos de código en inglés, integrándose en herramientas de desarrollo que corren en el propio portátil.
- Prototipado de agentes con tool calling: al heredar el soporte de function calling de Qwen 2.5 Instruct, sirve para construir pipelines de agentes de un solo paso o multi-paso en entornos de desarrollo con NPU.
- Educación y demostraciones de despliegue en NPU: útil para investigadores y desarrolladores que quieran evaluar el rendimiento de Ryzen AI con un LLM de 1,5B parámetros y compararlo con ejecuciones en CPU o GPU.
- Filtrado y moderación de contenido en local: tareas de clasificación y reescritura de texto que se benefician de la baja latencia de la NPU y de la ausencia de envío de datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- NPU Ryzen AI compatible con el runtime Ryzen AI 1.9.0 (procesadores AMD Ryzen AI de las generaciones soportadas por dicha versión); el modelo está empaquetado específicamente para esta plataforma.
- VRAM estimada: no aplica en el sentido tradicional, ya que la inferencia se ejecuta sobre la NPU; el repositorio ocupa 2,4 GB, lo que da una idea del espacio en disco necesario para los pesos ONNX cuantizados.
- GPU dedicada: no requerida; el objetivo del paquete es precisamente evitar el uso de GPU.
- Cabe en hardware de consumo: sí, en equipos con NPU Ryzen AI compatible; no está pensado para ejecutarse en GPU consumer como RTX 4090 ni en A100/H100 mediante este paquete.
- Opciones de despliegue: runtime Ryzen AI 1.9.0 con los pesos ONNX; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amd/Qwen-2.5_1.5B_Instruct_rai_1.9.0_npu | 1,5B | no disponible (base: 32.768) | ONNX para NPU Ryzen AI | apache-2.0 | Gated en HuggingFace |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | safetensors, multiplataforma | apache-2.0 | Publico en HuggingFace |
| Qwen/Qwen2.5-1.5B (base) | 1,5B | 32.768 tokens | safetensors | apache-2.0 | Publico en HuggingFace |

La comparación directa más relevante es con el checkpoint original de Qwen 2.5 1.5B Instruct: misma arquitectura y mismos parámetros, pero esta variante está optimizada exclusivamente para NPU Ryzen AI y declara únicamente inglés, mientras que el original es multiplataforma y multilingüe. No se dispone de datos de rendimiento comparativo entre ambas variantes en la información proporcionada.

## Limitaciones y advertencias

- El acceso es restringido (gated): es necesario aceptar las condiciones del repositorio en HuggingFace antes de descargar los pesos.
- La tarjeta declara únicamente inglés (`en`), aunque el modelo base Qwen 2.5 es multilingüe; el soporte real de otros idiomas en esta variante no está garantizado.
- Dependencia estricta del runtime Ryzen AI 1.9.0 y de hardware AMD con NPU compatible; no es portable a GPU NVIDIA, CPU genérica ni a otros runtimes sin conversión adicional.
- Al ser un modelo de 1,5B parámetros, su capacidad de razonamiento complejo, matemáticas avanzadas y código de gran escala es limitada en comparación con modelos de mayor tamaño.
- Riesgo de alucinación inherente a los LLM de esta escala, especialmente en preguntas factuales y contextos largos.
- Sesgos potenciales heredados del corpus de entrenamiento de Qwen 2.5, no documentados específicamente para esta variante.
- Aunque la licencia es Apache 2.0 y permite uso comercial, deben respetarse las condiciones del repositorio gated y las de la plataforma Ryzen AI.
- No se documentan en la información disponible los niveles exactos de cuantización ni el impacto en precisión que introduce la conversión a ONNX/Quark.

## Enlaces

- HuggingFace: https://huggingface.co/amd/Qwen-2.5_1.5B_Instruct_rai_1.9.0_npu
- Modelo base Qwen 2.5 1.5B Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio Qwen 2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de Ryzen AI: https://ryzenai.docs.amd.com/
- Herramienta Quark de AMD: https://quark.docs.amd.com/
