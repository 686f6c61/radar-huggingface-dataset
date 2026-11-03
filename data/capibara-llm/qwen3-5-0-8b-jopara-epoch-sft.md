# Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-SFT

## Resumen

Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-SFT es un modelo de lenguaje multimodal (image-text-to-text) de 873.438.784 parámetros (aproximadamente 0,87 mil millones) desarrollado por Capibara-LLM. Se trata de un ajuste fino supervisado (SFT) sobre el checkpoint Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-CPT, que a su vez parte de la familia Qwen3.5. El modelo está pensado para generación de texto conversacional y procesamiento conjunto de imagen y texto.

El modelo se distribuye en formato safetensors de 16 bits (FP16), con un tamaño de repositorio de 1,8 GB, bajo licencia Apache 2.0 y con soporte declarado únicamente para inglés. Su relevancia radica en ser una variante compacta de la arquitectura qwen3_5 con capacidades multimodales, apta para despliegues con recursos limitados.

La información pública disponible es escasa: la model card es una plantilla genérica de Unsloth y no detalla composición del dataset de ajuste, número de tokens de entrenamiento ni resultados de evaluación. El modelo fue creado el 2 de noviembre de 2026 y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal image-text-to-text) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16; compatible con cuantizacion via herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (16-bit FP16) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura qwen3_5, una familia de transformers multimodales que procesa entradas de imagen y texto (pipeline image-text-to-text). El checkpoint publicado es el resultado de un ajuste fino supervisado (SFT) sobre Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-CPT, un modelo base de la misma familia. No se especifican en la informacion disponible el número de tokens de entrenamiento, la composición del dataset de SFT, ni si se aplicaron técnicas de RLHF o DPO.

Según la model card, el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, con una aceleración declarada de 2x respecto al entrenamiento convencional. No se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El tamaño de 873 millones de parámetros y el formato FP16 sugieren un modelo orientado a inferencia en hardware de gama media.

## Capacidades

- Generación de texto conversacional en inglés (tag `conversational`).
- Procesamiento multimodal de imagen y texto (pipeline `image-text-to-text`).
- Compatible con Text Generation Inference (TGI) y con la librería transformers.
- Etiquetado como `endpoints_compatible`, lo que indica compatibilidad con endpoints de inferencia gestionados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües: limitadas al inglés según la metadata.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente conversacional ligero en inglés: el modelo puede gestionar diálogos multi-turno en aplicaciones de chat con requisitos de memoria reducidos, gracias a sus 873 millones de parámetros.
- Descripción y análisis de imágenes: al ser un modelo image-text-to-text, puede emplearse para generar descripciones de imágenes o responder preguntas sobre contenido visual en pipelines de moderación o accesibilidad.
- Prototipado rápido de aplicaciones multimodales: su tamaño compacto y licencia Apache 2.0 permiten integrarlo en entornos de desarrollo con GPUs de consumo para validar ideas antes de escalar a modelos mayores.
- Clasificación y extracción de información a partir de documentos con imágenes: útil en tareas de procesamiento de capturas, formularios o figuras donde se requiera una respuesta textual breve.
- Despliegue en el borde (edge) o entornos con recursos limitados: el checkpoint FP16 de 1,8 GB cabe en GPUs de consumo y en servicios de inferencia de bajo coste.
- Filtrado y preprocesamiento en pipelines de datos: puede utilizarse para generar anotaciones o resúmenes preliminares en inglés dentro de flujos de curación de datasets.
- Base para ajuste fino adicional: al ser un checkpoint SFT con licencia permisiva, sirve como punto de partida para especializaciones posteriores en dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,8-2,5 GB solo para pesos, más memoria para el contexto y activaciones (estimación orientativa; no confirmada por el autor).
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos (estimación orientativa).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son válidas, siendo estas últimas sobredimensionadas para el tamaño del modelo.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 4 GB o más de VRAM en FP16 (no verificado).
- Opciones de despliegue: transformers, Text Generation Inference (TGI), y herramientas compatibles con safetensors; soporte de llama.cpp/Ollama no confirmado para esta arquitectura.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-SFT | 873 M | no disponible | Si (image-text-to-text) | Apache 2.0 | Hugging Face |
| Qwen2.5-VL-3B | ~3 B | no disponible en esta ficha | Si | Apache 2.0 (segun familia) | Hugging Face |
| SmolVLM-500M | ~0,5 B | no disponible en esta ficha | Si | Apache 2.0 | Hugging Face |

La comparativa se limita a modelos multimodales compactos de código abierto; los datos de contexto y rendimiento de las alternativas no se han verificado en la informacion disponible y deben consultarse en sus respectivas model cards.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al entrenarse presumiblemente con datos en inglés, puede heredar sesgos culturales y lingüísticos de esos corpus.
- Riesgo de alucinación inherente a modelos de este tamaño, especialmente en tareas de razonamiento complejo o matemáticas.
- Soporte únicamente en inglés según la metadata; el rendimiento en castellano no está garantizado.
- No se especifica la longitud de contexto soportada, lo que impide planificar su uso en tareas de contexto largo.
- Ausencia de benchmarks publicados: no es posible validar su calidad frente a alternativas.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base Qwen3.5 y sus condiciones originales deben verificarse antes de un despliegue en producción.
- El modelo tiene 0 descargas y 0 likes, y fue publicado recientemente; no hay evidencia de uso en producción ni validación por la comunidad.
- La información de entrenamiento (dataset, tokens, alineación) no está disponible, lo que dificulta evaluar su robustez y seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-SFT
- Modelo base (CPT): https://huggingface.co/Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-CPT
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: no disponible enlace directo en la informacion proporcionada
