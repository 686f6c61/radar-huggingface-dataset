# amd/Qwen3.8-Flash-Next_gpuep_1.0_gpu_128

## Resumen

Qwen3.8-Flash-Next_gpuep_1.0_gpu_128 es una conversión y cuantización del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por AMD para su despliegue optimizado sobre hardware AMD mediante ONNX Runtime GenAI. El modelo original, desarrollado por el equipo Qwen de Alibaba, es un transformer de mezcla de expertos (MoE) con capacidades de visión y lenguaje (image-text-to-text) y una arquitectura orientada a eficiencia en inferencia, de ahí el sufijo "Flash". AMD ha tomado los pesos originales y los ha convertido a formato ONNX con cuantización INT4 en el decodificador de texto, FP16 en el codificador visual y los embeddings, y FP8 en el componente denominado "Engram".

La relevancia de esta ficha radica en que se trata de un artefacto de despliegue, no de un modelo nuevo: su interés está en la combinación de cuantización agresiva (INT4 con grupo de 32 y expertos QMoE en bloques de 32) con un runtime específico (onnxruntime-genai) y un backend de ejecución (HIP-EP, es decir, el execution provider de ROCm/HIP para GPUs AMD). El repositorio ocupa 124 GB, lo que da una idea del tamaño de los pesos empaquetados y de los múltiples ficheros ONNX que componen el artefacto.

No se dispone de información pública sobre el número de parámetros totales o activos, la longitud de contexto, los datos de entrenamiento ni los resultados de benchmarks en la información proporcionada. La model card es extremadamente escueta y se limita a describir la estrategia de cuantización y la licencia. Cualquier dato no confirmado se marca como "no disponible" en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (vision-language), según tags del repo; detalles no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE, según tags) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Decodificador de texto: INT4 (RTN, group size 32, activaciones FP16; expertos MoE QMoE INT4 block size 32); codificador visual: FP16; embeddings: FP16; Engram: FP8 |
| Idiomas soportados | en (inglés) |
| Licencia | qwen-community-1.0 (Qwen Community License Agreement 1.0) |
| Formato de pesos | ONNX (onnxruntime-genai); repo de 124 GB |

## Arquitectura y entrenamiento

La información disponible confirma que el modelo base es un transformer de mezcla de expertos (MoE) con capacidad multimodal de imagen-texto a texto, tal como indican los tags `moe`, `multimodal`, `vision-language` y el pipeline `image-text-to-text`. La model card menciona explícitamente tres componentes diferenciados en el proceso de cuantización: un decodificador de texto, un codificador visual y un componente llamado "Engram" cuantizado a FP8. No se especifica la naturaleza de "Engram" ni su función dentro de la arquitectura.

En cuanto al entrenamiento, no se dispone de información sobre el número de tokens, la composición del dataset, ni si hubo etapas de RLHF, DPO o similares. La model card del artefacto de AMD no reproduce esos datos del modelo original y no se ha proporcionado la model card de Qwen/Qwen3.8-Flash-Next. La innovación técnica documentada en este repositorio es exclusivamente la relativa al despliegue: conversión a ONNX, cuantización mixta (INT4/FP8/FP16) y uso del execution provider HIP-EP para GPUs AMD, lo que sugiere optimizaciones específicas para ROCm.

## Capacidades

- Generación de texto conversacional en inglés, según el tag `conversational` y el idioma declarado.
- Comprensión de imágenes y texto combinados (image-text-to-text): el pipeline declarado es multimodal, con codificador visual en FP16.
- Razonamiento y generación condicionada por imagen, al tratarse de un modelo vision-language.
- Mezcla de expertos (MoE): activación selectiva de parámetros por token, según los tags y la cuantización QMoE de expertos.
- Ejecución mediante ONNX Runtime GenAI con backend HIP-EP, orientada a GPUs AMD.
- No se documenta en la información disponible soporte explícito de tool calling, function calling, agentes multi-paso, audio, thinking mode ni otras capacidades especiales.

## Casos de uso

- Descripción automática de imágenes en pipelines de accesibilidad: el modelo puede recibir una imagen y generar texto descriptivo en inglés; su codificador visual en FP16 y su naturaleza image-text-to-text lo hacen adecuado para generar alt-text en catálogos o repositorios de imágenes.
- Moderación de contenido visual con contexto textual: combinando una imagen y una política escrita, el modelo puede generar una evaluación en lenguaje natural; útil en plataformas que necesitan clasificación matizada de imágenes.
- Extracción de información de documentos escaneados: al aceptar imagen y texto, puede transcribir y resumir el contenido de facturas, formularios o capturas, siempre que el idioma de salida sea inglés.
- Asistente conversacional con soporte de capturas de pantalla: integrado en una aplicación de escritorio, el modelo puede responder preguntas sobre lo que el usuario muestra en pantalla, manteniendo el turno conversacional.
- Despliegue en infraestructura AMD: gracias a la conversión ONNX y al execution provider HIP-EP, es una opción para equipos con GPUs AMD (por ejemplo, Instinct MI300X) que quieran servir un modelo multimodal sin depender de CUDA.
- Evaluación comparativa de cuantización: el artefacto sirve como referencia para medir la pérdida de calidad de INT4 con grupo 32 frente a FP16 en tareas de visión-lenguaje, al existir el modelo base sin cuantizar.
- Prototipado de asistentes visuales en investigación: útil para experimentos académicos que necesiten un modelo multimodal ejecutable en ONNX Runtime, con la ventaja de un formato portable y un runtime ampliamente soportado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio ocupa 124 GB, lo que incluye pesos ONNX en INT4/FP8/FP16; el peso en memoria en inferencia dependerá del reparto entre decodificador, codificador visual, embeddings y Engram, y del runtime. Como referencia orientativa, un artefacto de ese tamaño no cabe en GPUs de consumo de 24 GB sin offloading o sharding.
- GPUs recomendadas: el tag `hip-ep` y la autoría de AMD apuntan a GPUs AMD con ROCm (por ejemplo, familia Instinct). No se documentan modelos concretos en la información disponible.
- GPU de consumo: no se confirma compatibilidad; por el tamaño del repo, es poco probable que quepa íntegramente en una RTX 4090 o similar sin técnicas de offloading.
- Opciones de despliegue: ONNX Runtime GenAI (librería declarada) con execution provider HIP-EP. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next_gpuep_1.0_gpu_128 (este) | no disponible (MoE) | no disponible | imagen-texto | qwen-community-1.0 | ONNX (INT4/FP8/FP16) |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible (MoE) | no disponible | imagen-texto | qwen-community-1.0 | safetensors (presumiblemente) |
| Otros modelos Qwen multimodales de la familia | no disponible | no disponible | imagen-texto | qwen-community-1.0 u otras | varios |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría. La única comparación fiable es con el modelo base sin cuantizar, del que este artefacto es una derivada.

## Limitaciones y advertencias

- Idiomas: solo se declara inglés (`en`); no hay evidencia de soporte multilingüe en esta información.
- Licencia: Qwen Community License Agreement 1.0, con posibles restricciones para uso comercial; es imprescindible revisar el fichero LICENSE del repositorio antes de desplegar en producción.
- Cuantización agresiva: el decodificador usa INT4 con grupo de 32 y los expertos MoE usan QMoE INT4 con bloque de 32; esto puede degradar la calidad frente al modelo base, especialmente en tareas de razonamiento o generación larga. No se han publicado evaluaciones de la pérdida de precisión.
- Artefacto específico de hardware: el execution provider HIP-EP está orientado a GPUs AMD; su uso en otros backends no está documentado.
- Model card mínima: no se documentan sesgos, riesgos de alucinación, límites de contexto ni comportamiento en dominios sensibles. Se debe asumir el riesgo habitual de los modelos generativos multimodales (alucinaciones en descripciones de imágenes, errores de OCR, sesgos visuales).
- Sin métricas de rendimiento: no hay benchmarks ni datos de latencia/throughput, lo que dificulta estimar su idoneidad en producción.
- Repositorio de gran tamaño (124 GB): implica requisitos de almacenamiento y tiempos de carga considerables.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/amd/Qwen3.8-Flash-Next_gpuep_1.0_gpu_128
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia (referenciada en el repo): fichero LICENSE del repositorio
- ONNX Runtime GenAI: no se proporciona enlace en la información disponible
- AMD ROCm / HIP-EP: no se proporciona enlace en la información disponible
- Papers, blogs o demos: no disponibles en la información proporcionada
