# moonbox-dev/Qwen3.5-9B-lab-GGUF

## Resumen

Qwen3.5-9B-lab-GGUF es una compilación de cuantizaciones en formato GGUF del modelo Qwen3.5-9B, publicada por el usuario moonbox-dev bajo licencia Apache 2.0. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un modelo causal multimodal (texto e imagen) de 9.197.093.888 parámetros, orientado a tareas de razonamiento, generación de código, agentes y comprensión visual. Esta versión GGUF está pensada para su uso en dispositivos locales mediante llama.cpp, con soporte para Metal, CUDA, Vulkan y CPU.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo multimodal de 9B en hardware de consumo, algo que hasta hace poco requería infraestructura de servidor. El repositorio incluye el archivo BF16 de referencia (18,41 GB) y un archivo `mmproj` de 918,2 MB con el codificador visual, compartido por todas las precisiones. La model card advierte que solo se publicaron dos archivos en el momento de la creación: BF16 y el mmproj, aunque se mencionan otras precisiones en la documentación.

La arquitectura del modelo base combina atención completa con capas híbridas basadas en Gated Delta Networks, una variante de atención lineal, e incorpora una capa de predicción multi-token. El modelo está entrenado con fusión temprana de tokens multimodales, lo que permite paridad con Qwen3 en texto y supera a Qwen3-VL en tareas de razonamiento, código, agentes y comprensión visual, según el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido: Gated DeltaNet (atención lineal) + atención completa, con capa de predicción multi-token y codificador visual |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | No disponible (el modelo base se describe como híbrido con MoE disperso, pero no se especifican parámetros activos para esta variante de 9B) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (publicado); la model card menciona Q5_K_M y Q4_K_M como referencias de ejemplo, pero solo BF16 figura como archivo publicado |
| Idiomas soportados | 201 idiomas y dialectos (según el modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base original) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que combina capas de Gated Delta Networks (una forma de atención lineal con compuertas) con capas de atención completa tradicional. Esta combinación busca reducir el coste computacional en secuencias largas manteniendo la calidad de representación. Incluye además una capa de predicción multi-token, que permite generar varios tokens por paso y acelerar la decodificación. El codificador visual se distribuye por separado en el archivo `mmproj` y se usa para entradas de imagen y vídeo.

El entrenamiento del modelo base se realizó en dos fases: preentrenamiento y postentrenamiento. La model card destaca la fusión temprana de tokens multimodales, que logra una eficiencia de entrenamiento multimodal cercana al 100% respecto al entrenamiento solo de texto. También se menciona el uso de aprendizaje por refuerzo (RL) escalado a entornos de millones de agentes con distribuciones de tareas progresivamente complejas. No se especifican el número exacto de tokens de entrenamiento ni la composición del dataset en la información proporcionada. La conversión a GGUF se realizó con `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp (versión b12621), sin matriz de importancia. El conversor reescribe algunos tensores de atención lineal por fórmula: `A_log` se almacena como `-exp(A_log)`, los kernels de convolución se comprimen y las cabezas de valor se reordenan.

## Capacidades

- Generación de texto y razonamiento multi-paso: el modelo "piensa antes de responder" y llama-server devuelve el pensamiento como `reasoning_content`.
- Comprensión de imagen y vídeo: el codificador visual (`mmproj`) permite entrada image-text-to-text.
- Generación de código y matemáticas: el modelo base se presenta con paridad con Qwen3 en razonamiento, código y agentes.
- Soporte multilingüe amplio: 201 idiomas y dialectos según el modelo base.
- Capacidad de agente y razonamiento multi-paso: el modelo base fue entrenado con RL en entornos de agentes.
- Tool calling / function calling: no se especifica explícitamente en la información proporcionada, aunque el pipeline image-text-to-text y el formato chat de llama-server sugieren compatibilidad con plantillas conversacionales.
- Modo de pensamiento (thinking): integrado, con salida separada en `reasoning_content`.
- Predicción multi-token: capa incluida en el archivo GGUF que puede acelerar la generación.

## Casos de uso

- Asistente multimodal local en portátil: con el archivo BF16 (18,41 GB) o cuantizaciones menores, el modelo puede ejecutarse en llama.cpp con Metal o CUDA para responder preguntas sobre imágenes y texto sin conexión, gracias al codificador visual incluido en el mmproj.
- Análisis de documentos con imágenes: el modelo puede procesar capturas, diagramas o fotografías junto a preguntas en lenguaje natural, adecuado para tareas de extracción de información en entornos con requisitos de privacidad.
- Generación de código en pipelines de CI/CD: el modelo base soporta razonamiento y código; mediante llama-server con `/v1/chat/completions` se puede integrar en herramientas de revisión automática o generación de parches, aunque la cuantización BF16 requiere VRAM considerable.
- Agente conversacional multi-turno: la arquitectura híbrida y la capa de predicción multi-token permiten mantener conversaciones con contexto moderado en hardware de consumo, usando llama.cpp con `-ngl 99` para descargar capas a GPU.
- Prototipado de aplicaciones de visión por computador: investigadores pueden usar el modelo como base para tareas de image-text-to-text (descripción de imágenes, VQA) sin depender de APIs externas, gracias a la licencia Apache 2.0.
- Evaluación de cuantizaciones: el repositorio incluye una metodología de benchmark (KL divergence y coincidencia de token top-1) que permite a desarrolladores comparar la fidelidad de futuras cuantizaciones antes de desplegarlas.
- Despliegue en dispositivos edge con CPU: llama.cpp soporta CPU y Vulkan, por lo que el modelo puede ejecutarse en equipos sin GPU dedicada, aunque con latencia mayor y posiblemente requiriendo cuantizaciones más agresivas no publicadas aún.

## Benchmarks y rendimiento

La model card incluye un benchmark interno de fidelidad de cuantización, no de rendimiento de tareas estándar. Los datos disponibles son:

| Archivo | Tamaño | KL divergence vs BF16 | Coincidencia token top-1 |
|---|---|---|---|
| BF16 | 18,41 GB | Referencia | Referencia |
| mmproj F16 | 918,2 MB | No aplica (codificador) | No aplica |

El benchmark se realizó con 12 prompts cortos (8 en inglés, 4 en chino) en la plantilla de chat del modelo, con 64 tokens generados de forma greedy por el BF16 como referencia. El criterio de aprobación del laboratorio es KL ≤ 0,01 nats y coincidencia top-1 ≥ 90%. La model card indica que Q4_K_M está "justo por encima del umbral de KL" y se marca como experimental, pero no se publican los valores numéricos de KL ni de coincidencia para esa precisión en el texto proporcionado.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible para esta variante GGUF. El modelo base Qwen3.5-9B referencia una figura de benchmarks en su blog, pero los valores no se transcriben en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo BF16 requiere al menos ~18,4 GB solo para pesos, más overhead de contexto y codificador visual (~0,9 GB), por lo que se necesitan aproximadamente 20-22 GB de VRAM para una ejecución cómoda.
- GPU recomendadas: para BF16, una RTX 4090 (24 GB) o A100/H100; para cuantizaciones menores no publicadas (Q5_K_M, Q4_K_M mencionadas), una RTX 3080 Laptop (usada en el benchmark) o RTX 4060 Ti de 16 GB podrían ser suficientes, aunque no se confirma disponibilidad de esos archivos.
- ¿Cabe en consumer GPU? El BF16 cabe ajustadamente en una RTX 4090 de 24 GB; en GPUs de 16 GB o menos sería necesario usar cuantizaciones más agresivas, que no están publicadas en el repositorio en el momento de la ficha.
- Opciones de despliegue: llama.cpp (llama-server) con soporte Metal, CUDA, Vulkan y CPU. El modelo base también es compatible con Transformers, vLLM, SGLang y KTransformers, pero esta variante GGUF está orientada a llama.cpp.
- Latencia y throughput: no disponibles. El benchmark se ejecutó en una RTX 3080 Laptop con CUDA, pero no se reportan tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato GGUF disponible |
|---|---|---|---|---|---|
| Qwen3.5-9B-lab-GGUF (este) | ~9,2B | No disponible | Sí (visión) | Apache 2.0 | Sí (BF16) |
| Qwen3-VL (versión 9B, si existe) | No disponible | No disponible | Sí | No disponible | No disponible en la información |
| Llama 3.2 11B Vision | ~11B | No disponible | Sí | Llama 3.2 Community License | No disponible en la información |

No se dispone de datos de benchmarks comparativos en la información proporcionada para establecer una comparación cuantitativa con alternativas. La model card del modelo base afirma que Qwen3.5 supera a Qwen3-VL en razonamiento, código, agentes y comprensión visual, pero no se transcriben los valores numéricos.

## Limitaciones y advertencias

- Solo se publica el archivo BF16 en el repositorio; las cuantizaciones Q5_K_M y Q4_K_M se mencionan en la documentación pero no figuran como archivos descargables en la información disponible, lo que limita el uso en hardware de menos de 20 GB de VRAM.
- El benchmark de fidelidad es interno y limitado: 12 prompts cortos, 64 tokens, una sola GPU (RTX 3080 Laptop). No es representativo de todos los casos de uso.
- La cuantización Q4_K_M se marca como experimental por superar el umbral de KL, lo que implica posible degradación en tareas sensibles.
- No se especifica la longitud de contexto soportada, lo que impide planificar aplicaciones con ventanas largas.
- El modelo base tiene 201 idiomas, pero no se detalla el rendimiento por idioma ni la calidad en castellano.
- Riesgo de alucinación inherente a modelos de lenguaje; no se documentan mitigaciones específicas en esta variante.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no detalladas en la información proporcionada; se recomienda revisar la licencia original de Qwen/Qwen3.5-9B.
- El conversor modifica tensores de atención lineal por fórmula; aunque se verifica que el resto es byte-idéntico, cualquier error en la conversión podría afectar la fidelidad.
- No se proporcionan datos de sesgos conocidos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/Qwen3.5-9B-lab-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Qwen Chat: https://chat.qwen.ai
- Archivo BF16: https://huggingface.co/moonbox-dev/Qwen3.5-9B-lab-GGUF/blob/main/qwen3-5-9b-BF16.gguf
- Archivo mmproj: https://huggingface.co/moonbox-dev/Qwen3.5-9B-lab-GGUF/blob/main/mmproj-qwen3-5-9b-F16.gguf
