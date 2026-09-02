# Sawfwair/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16-MLX-Native

## Resumen

Nemotron-3-Nano-Omni-30B-A3B-Reasoning es un modelo omni-modal de razonamiento desarrollado por NVIDIA, diseñado para comprender y razonar sobre entradas de texto, imagen, audio y vídeo, generando respuestas en texto. Forma parte de la familia Nemotron 3 y destaca por su arquitectura híbrida Mamba2-Transformer con mezcla de expertos (MoE), que combina eficiencia computacional con capacidad de razonamiento profundo. El modelo tiene 30 mil millones de parámetros totales, de los cuales solo 3 mil millones se activan por token, lo que permite un rendimiento elevado con un coste de inferencia reducido.

La versión analizada en esta ficha es una conversión nativa a MLX realizada por Sawfwair, que preserva los pesos en BF16 sin pérdidas y está optimizada para ejecutarse en Apple Silicon. Esta conversión no modifica los valores de los tensores, sino que reorganiza el almacenamiento para el runtime Swift/MLX de `mere.run`. El modelo original está disponible en HuggingFace bajo la licencia NVIDIA Open Model Agreement, que permite uso comercial con restricciones. Su relevancia actual radica en su capacidad para tareas complejas de comprensión multimodal, como análisis de documentos, razonamiento sobre múltiples imágenes, reconocimiento de voz y comprensión de vídeo de larga duración, además de soporte para uso agéntico y razonamiento de varios pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba2-Transformer con mezcla de expertos (MoE) |
| Parametros totales | 30.000.000.000 (30B) |
| Parametros activos | 3.000.000.000 (3B) |
| Longitud de contexto | no disponible (se describe como "long-context" en la documentación de NVIDIA) |
| Tipos de cuantizacion | BF16 (conversión MLX sin cuantizar); el original admite cuantizaciones estándar (FP8, INT8, etc.) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model Agreement (nvidia-open-model-agreement) |
| Formato de pesos | safetensors (conversión MLX nativa); el original usa safetensors |

## Arquitectura y entrenamiento

El modelo combina capas de Mamba2 (state space model) con capas Transformer en una arquitectura híbrida, y utiliza un mecanismo de mezcla de expertos (MoE) con 3 mil millones de parámetros activos por token. Esta combinación permite manejar secuencias largas de forma eficiente (gracias a Mamba2) y mantener la capacidad de razonamiento profundo del Transformer. El entrenamiento se realizó con un enfoque multimodal: se recaptionaron imágenes y audio con modelos de visión-lenguaje, se generaron pares pregunta-respuesta a partir de medios existentes, se produjeron cadenas de razonamiento para tareas complejas, se aumentaron los datos con paráfrasis y se aplicó filtrado de calidad basado en modelos. No se especifica si se usó RLHF o DPO, pero el nombre "Reasoning" sugiere un entrenamiento orientado a cadenas de pensamiento.

La conversión MLX de Sawfwair no altera los pesos: copia byte a byte los tensores BF16 y los reorganiza en un formato de almacenamiento nativo para el runtime Swift/MLX. Los expertos se apilan en un archivo separado (`experts-bf16.safetensors`) para optimizar la operación de gather-matmul en Apple Silicon.

## Capacidades

- Comprensión omni-modal: acepta entradas de texto, imagen, audio y vídeo, y genera respuestas en texto.
- Razonamiento multimodal: puede razonar sobre múltiples imágenes, analizar documentos complejos y comprender vídeo de larga duración.
- Reconocimiento de voz automático (ASR) integrado.
- Soporte para uso agéntico: puede actuar como agente de uso de computadora (computer use) y realizar tareas de varios pasos.
- Generación de cadenas de razonamiento (thinking/reasoning chains) para tareas complejas.
- Capacidades multilingües: no especificadas, pero se espera que cubra varios idiomas dado el entrenamiento con datos diversos.
- No soporta generación de audio o vídeo; solo salida de texto.

## Casos de uso

- Análisis de documentos extensos: el modelo puede procesar documentos con texto, imágenes y tablas, extrayendo información y respondiendo preguntas complejas sobre el contenido. Su arquitectura híbrida permite manejar contextos largos sin degradación.
- Razonamiento sobre múltiples imágenes: útil en diagnóstico médico (comparar radiografías), análisis de imágenes satelitales o revisión de diseños de ingeniería, donde se necesita comparar y razonar entre varias imágenes.
- Transcripción y comprensión de audio: puede transcribir reuniones, conferencias o podcasts, y generar resúmenes o extraer conclusiones a partir del audio.
- Comprensión de vídeo de larga duración: adecuado para análisis de vigilancia, revisión de grabaciones de cámaras o resumen de vídeos educativos, gracias a su capacidad de procesar secuencias largas.
- Agente de uso de computadora: puede interactuar con interfaces gráficas, realizar clics, escribir texto y navegar por aplicaciones, lo que lo convierte en candidato para automatización de tareas de escritorio.
- Asistente de razonamiento para investigación: puede ayudar a científicos e ingenieros a razonar sobre datos multimodales, generar hipótesis y estructurar experimentos, aprovechando su capacidad de cadenas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La página de Artificial Analysis menciona comparaciones de calidad, precio y rendimiento, pero no se incluyen cifras concretas en los resultados de búsqueda. Se recomienda consultar la documentación oficial de NVIDIA o la página de Artificial Analysis para obtener métricas detalladas.

## Requisitos de hardware

- La conversión MLX requiere un Mac con Apple Silicon y al menos 112 GB de memoria unificada; se recomiendan 128 GB para un rendimiento óptimo.
- El modelo original en BF16 ocupa aproximadamente 66 GB de pesos, por lo que se necesita una GPU con al menos 80 GB de VRAM (por ejemplo, A100 80GB, H100 80GB) para inferencia sin cuantizar.
- Con cuantización a FP8 o INT8, el requisito de VRAM se reduce a unos 33 GB, lo que permite ejecutarlo en GPUs como RTX 4090 (24 GB) no es suficiente, pero sí en A6000 (48 GB) o similares.
- Opciones de despliegue: vLLM (soporta el modelo original), TGI, llama.cpp (con conversión a GGUF), y el runtime Swift/MLX `mere.run` para Apple Silicon.
- La latencia y el throughput dependen del hardware y la cuantización; no se dispone de cifras concretas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Modalidades | Licencia |
|---|---|---|---|---|---|
| Nemotron-3-Nano-Omni-30B-A3B | 30B | 3B | no disponible | texto, imagen, audio, vídeo | NVIDIA Open Model Agreement |
| Qwen2-VL-72B | 72B | 72B | 128K | texto, imagen, vídeo | Apache 2.0 |
| Llama 3.2 90B Vision | 90B | 90B | 128K | texto, imagen | Llama 3.2 Community License |

La comparativa es orientativa; no se dispone de datos de rendimiento comparativos en la información disponible. Nemotron destaca por su eficiencia (solo 3B activos) y su soporte nativo de audio y vídeo, mientras que Qwen2-VL y Llama 3.2 Vision se centran en imagen y texto.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se distribuye bajo la NVIDIA Open Model Agreement, que impone condiciones específicas para uso comercial y redistribución. Es obligatorio revisar el acuerdo completo antes de su uso.
- Sesgos potenciales: al ser un modelo entrenado con datos web y sintéticos, puede reflejar sesgos presentes en esos datos. NVIDIA proporciona documentación sobre sesgos, privacidad y explicabilidad que debe consultarse.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas incorrectas o inventadas, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- Limitaciones de idioma: no se especifican los idiomas soportados; el rendimiento puede variar significativamente entre idiomas.
- Requisitos de hardware elevados: la versión BF16 necesita al menos 80 GB de VRAM, lo que limita su uso a entornos con GPUs de gama alta o Macs con mucha memoria unificada.
- La conversión MLX no es un checkpoint de Transformers estándar; solo puede ejecutarse con el runtime `mere.run`, lo que limita su portabilidad.

## Enlaces

- Conversión MLX en HuggingFace: https://huggingface.co/Sawfwair/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16-MLX-Native
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16
- Blog de NVIDIA sobre Nemotron 3 Nano Omni: https://huggingface.co/blog/nvidia/nemotron-3-nano-omni-multimodal-intelligence
- Página de Artificial Analysis: https://artificialanalysis.ai/models/nemotron-3-nano-omni-30b-a3b
- Recetas vLLM: https://recipes.vllm.ai/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16
- Runtime `mere.run`: https://github.com/sawfwair/mere-run
