# Outlier-Ai/gemma-3-4b-it-MLX-4bit

## Resumen

`Outlier-Ai/gemma-3-4b-it-MLX-4bit` es una conversión cuantizada a 4 bits en formato MLX del modelo `google/gemma-3-4b-it`, el modelo instructivo multimodal de 4.000 millones de parámetros publicado por Google DeepMind dentro de la familia Gemma 3. La conversión la mantiene Outlier-Ai, un proyecto centrado en inferencia local sobre Apple Silicon, y su objetivo es permitir ejecutar el modelo en Macs con memoria unificada mediante el framework MLX de Apple, sin dependencia de la nube.

El modelo base es un transformer de tipo decoder-only con 3.880.263.168 parámetros reales (según los safetensors del repositorio), ventana de contexto de 128.000 tokens en su versión original y capacidad de procesar imagen y texto (image-text-to-text). Esta versión concreta se distribuye únicamente como pesos MLX de 4 bits en safetensors, con un tamaño de repositorio de 2,2 GB, lo que la hace viable en equipos con 8-16 GB de memoria unificada.

Su relevancia actual radica en que combina tres factores poco habituales en un modelo de este tamaño: contexto muy largo, soporte multilingüe en 14 idiomas (incluido el castellano) y capacidad de tool calling, todo ello ejecutable de forma privada y offline en hardware de consumo Apple. Es una opción práctica para prototipado de agentes locales, asistentes personales y aplicaciones de escritorio que no pueden enviar datos a un servicio externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), conversión a MLX |
| Parametros totales | 3.880.263.168 (3,88 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada para esta conversión; el modelo base google/gemma-3-4b-it declara 128.000 tokens |
| Tipos de cuantizacion | 4 bits (MLX 4-bit); no se documentan otras variantes en este repositorio |
| Idiomas soportados | en, de, fr, es, it, pt, nl, pl, ro, cs, hu, sv, da, fi |
| Licencia | gemma (Gemma Terms of Use, heredada del modelo base) |
| Formato de pesos | safetensors en formato MLX (librería `mlx`) |
| Tamano del repositorio | 2,2 GB |
| Modalidad | texto (pipeline declarado: text-generation); el modelo base es image-text-to-text |
| Libreria de inferencia | mlx / mlx-lm |
| Fecha de creacion | 2026-04-20 |
| Ultima actualizacion | 2026-11-06 |

## Arquitectura y entrenamiento

Esta ficha describe una conversión, no un entrenamiento desde cero. La arquitectura subyacente es la de Gemma 3 4B instruct: un transformer decoder-only con atención por grupos (GQA), normalización RMSNorm y activaciones GeGLU, entrenado por Google DeepMind. El modelo base es multimodal (procesa imagen y texto) y está ajustado para instrucciones y conversación. Outlier-Ai aplica cuantización de pesos a 4 bits en el formato nativo de MLX, pensado para aprovechar la memoria unificada y los kernels Metal de los chips Apple M1, M2, M3 y M4.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, ni las etapas de RLHF/DPO del modelo base. Tampoco se documenta la receta exacta de cuantización (por ejemplo, si se aplica group-wise quantization, qué tamaño de grupo se usa o si se excluyen capas concretas). La model card de la conversión se limita a indicar la carga con `mlx-lm` y a remitir a la model card de `google/gemma-3-4b-it` para licencia y detalles del modelo original.

## Capacidades

- Generación de texto y conversación multi-turno en modo instructivo.
- Razonamiento y respuesta a preguntas de conocimiento general.
- Generación y explicación de código, además de matemáticas básicas e intermedias propias de un modelo de 4B.
- Tool calling / function calling: el modelo base está entrenado para emitir llamadas a funciones estructuradas, y la conversión conserva esa capacidad según las etiquetas del repositorio (`function-calling`, `tool-use`).
- Soporte de flujos de agente y razonamiento multi-paso, limitado por el tamaño del modelo.
- Capacidades multilingües en 14 idiomas: inglés, alemán, francés, español, italiano, portugués, neerlandés, polaco, rumano, checo, húngaro, sueco, danés y finés.
- Ejecución 100 % local y offline sobre Apple Silicon mediante MLX (etiquetas `no-cloud`, `private-ai`, `on-device`).
- Capacidad de visión: el modelo base es image-text-to-text, pero esta conversión declara únicamente `text-generation` y no documenta el uso del encoder de imagen en formato MLX.

## Casos de uso

- Asistente personal de escritorio en macOS: integrado en una app nativa, el modelo atiende conversaciones multi-turno sin salir del equipo, lo que evita enviar datos personales a servicios externos y aprovecha los 128.000 tokens de contexto del modelo base para mantener historiales largos.
- Automatización de atención al cliente en local: para empresas que no pueden usar la nube por motivos regulatorios, el modelo puede gestionar diálogos con contexto extenso y derivar a herramientas internas mediante function calling.
- Agente de línea de comandos para tareas de desarrollo: con soporte de tool calling, se puede conectar a herramientas como git, shells o APIs internas para ejecutar tareas de varios pasos (leer un fichero, proponer un parche, ejecutar tests), aceptando la latencia mayor de un modelo de 4B.
- Generación de código en entornos con restricciones de red: en equipos de desarrollo aislados, la conversión MLX permite autocompletar y explicar código sin conexión, con un consumo de memoria de aproximadamente 2,2 GB de pesos.
- Procesamiento de documentos y resúmenes en local: con contexto largo, se pueden resumir contratos, actas o informes en castellano u otros idiomas europeos sin subir el contenido a terceros.
- Prototipado rápido de aplicaciones MLX: al cargarse con `mlx-lm`, sirve como banco de pruebas para validar prompts, plantillas de chat y esquemas de herramientas antes de pasar a modelos mayores como `gemma-3-27b-it` en la misma familia de conversiones de Outlier-Ai.
- Traducción y asistencia lingüística entre los 14 idiomas soportados, con calidad limitada por el tamaño del modelo pero suficiente para tareas de borrador o pre-traducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de la conversión no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de latencia o throughput, y tampoco se han encontrado en la búsqueda web resultados específicos para esta cuantización. Cualquier cifra de rendimiento del modelo base `google/gemma-3-4b-it` debe consultarse en su model card oficial, no en este repositorio.

## Requisitos de hardware

- VRAM / memoria unificada estimada: aproximadamente 2,2 GB solo para los pesos en 4 bits; con overhead de contexto y buffers de MLX, se recomienda un mínimo de 8 GB de memoria unificada y 16 GB para contextos largos.
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro, Max y Ultra). No es compatible con GPU NVIDIA ni AMD a través de MLX.
- Cabe en GPU de consumo: sí, en cualquier Mac con chip de la serie M y al menos 8 GB de memoria unificada; también en Mac mini, MacBook Air, MacBook Pro y Mac Studio.
- Opciones de despliegue: `mlx-lm` (CLI y API Python), la app Outlier para macOS (instalable vía `brew install --cask outlier-host/tap/outlier`) y cualquier runtime que consuma pesos MLX. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que esperan otros formatos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Outlier-Ai/gemma-3-4b-it-MLX-4bit | 3,88 B | no disponible en la conversión (128k en el base) | MLX safetensors 4-bit | gemma | Solo Apple Silicon; repo de 2,2 GB |
| google/gemma-3-4b-it | 4 B | 128.000 tokens | Transformers, safetensors | gemma | Modelo base multimodal image-text-to-text; requiere GPU o CPU |
| Outlier-Ai/gemma-3-27b-it-MLX-4bit | 27 B (aprox.) | no disponible | MLX safetensors 4-bit | gemma | Misma familia, mayor calidad a costa de más memoria |
| Outlier-Ai/Outlier-Nano-4B-MLX-4bit | 4 B (aprox.) | no disponible | MLX safetensors 4-bit | no disponible | Alternativa del mismo autor para el mismo rango de tamaño |

## Limitaciones y advertencias

- Es una cuantización a 4 bits: introduce una pérdida de calidad respecto al modelo base en tareas de razonamiento complejo, matemáticas y generación de código, no cuantificada en la información disponible.
- Modelo de 4B parámetros: propenso a errores factuales y a alucinaciones en preguntas de conocimiento especializado, y con menor fiabilidad en tool calling multi-paso que modelos de mayor tamaño.
- La conversión declara únicamente `text-generation`; no se documenta el soporte del encoder de imagen del modelo base en formato MLX, por lo que no debe asumirse capacidad de visión.
- Dependencia exclusiva de Apple Silicon y del framework MLX: no desplegable en servidores NVIDIA, AMD ni en la mayoría de infraestructuras cloud estándar.
- Licencia Gemma: el uso comercial está permitido bajo los Gemma Terms of Use, que incluyen obligaciones de atribución y una política de uso prohibido; es necesario revisar los términos antes de distribuir un producto.
- El castellano está entre los idiomas soportados, pero la calidad relativa frente al inglés no está cuantificada en la información disponible.
- La model card incluye promoción de la app Outlier (versión Pro de pago, 49 USD) y enlaces con parámetros UTM; conviene separar esa promoción de las capacidades técnicas del modelo.
- Repositorio con muy poca tracción (27 descargas, 1 like en el momento de la consulta): no hay evidencia comunitaria de validación de la cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Outlier-Ai/gemma-3-4b-it-MLX-4bit
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- App Outlier para macOS: https://outlier.host/
- Conversión hermana gemma-3-27b-it MLX 4-bit: https://huggingface.co/Outlier-Ai/gemma-3-27b-it-MLX-4bit
- Conversión DeepSeek-R1-Distill-Qwen-7B MLX 4-bit: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Conversión Qwen3-Coder-30B-A3B-Instruct MLX 4-bit: https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
- Conversión Outlier-Core-27B MLX 4-bit: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Conversión Outlier-Nano-4B MLX 4-bit: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
