# QijiaHe/VFIG-4B-SFT

## Resumen

VFIG-4B-SFT es un modelo de visión-lenguaje especializado en la conversión de figuras científicas a código SVG. Lo desarrolla QijiaHe y parte de Qwen/Qwen3-VL-4B-Instruct, sobre el que se aplica un ajuste fino supervisado (SFT) con LoRA (rank 64, alpha 128) fusionado posteriormente en los pesos base. El resultado es un modelo de 4.437.815.808 parámetros (aproximadamente 4,44 mil millones) en precisión BF16, que recibe una imagen de una figura y devuelve el código fuente SVG que la reconstruye vectorialmente.

El problema que resuelve es concreto y técnico: la vectorización automática de gráficos y diagramas científicos, una tarea en la que los modelos generalistas suelen producir SVG sintácticamente inválidos o geométricamente inconsistentes. Al especializarse en image-to-SVG, el modelo cubre un nicho poco atendido dentro de la familia Qwen3-VL y mantiene la arquitectura multimodal del modelo base, lo que permite reutilizar el ecosistema transformers y el procesador de imágenes estándar.

Es relevante ahora porque la generación de gráficos vectoriales reproducibles a partir de imágenes es una necesidad recurrente en edición editorial, publicación científica y reconstrucción de diagramas, y porque existe una segunda etapa de refinamiento mediante aprendizaje por refuerzo publicada por separado (VFIG-4B), lo que permite comparar la contribución del SFT frente al RL. El repositorio incluye los pesos, tokenizer, procesador de imágenes y plantilla de chat, y está diseñado para ser compatible con endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal visión-lenguaje (familia Qwen3-VL; clase `Qwen3VLForConditionalGeneration`) |
| Parametros totales | 4.437.815.808 (aproximadamente 4,44 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados están en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16), con tokenizer, image processor y chat template incluidos |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-VL-4B-Instruct: un transformer multimodal con codificador visual y modelo de lenguaje acoplados, capaz de procesar entradas image-text-to-text. Sobre esa base se aplica un ajuste fino supervisado específico para la tarea image-to-SVG, implementado como LoRA de rango 64 y alpha 128, cuyos pesos se fusionan en el modelo base. La etapa 2 del entrenamiento finalizó en el paso 1.395, según la model card. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO en esta variante SFT.

La innovación principal no reside en la arquitectura sino en la especialización: el modelo aprende a mapear la estructura visual de figuras científicas (ejes, etiquetas, formas, líneas, texto) a instrucciones SVG válidas. El entrenamiento se apoya en el dataset VFIG-Data, publicado por el mismo autor. Existe una variante posterior refinada con aprendizaje por refuerzo (VFIG-4B), lo que sugiere un pipeline en dos fases: SFT primero y RL después.

## Capacidades

- Generación de código SVG a partir de imágenes de figuras científicas (image-to-svg, image-to-code).
- Comprensión de figuras: interpretación de diagramas, gráficos y elementos visuales estructurados.
- Generación de gráficos vectoriales reproducibles, con salida en formato SVG.
- Procesamiento multimodal image-text-to-text mediante la clase `Qwen3VLForConditionalGeneration` y `AutoProcessor`.
- Integración con endpoints compatibles (tag `endpoints_compatible`).
- Soporte de plantilla de chat incluida en el repositorio.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Reconstrucción de figuras para publicación científica: dado un gráfico rasterizado de un paper, el modelo genera el SVG correspondiente, lo que permite reeditarlo, escalarlo sin pérdida y adaptarlo a la maquetación de la revista.
- Vectorización de diagramas en documentación técnica: convertir capturas de diagramas de arquitectura o flujo en SVG editables para manuales y wikis internas, reduciendo el trabajo manual de redibujado.
- Migración de gráficos rasterizados a formato vectorial: procesar lotes de imágenes de figuras antiguas y obtener SVG para su incorporación a sistemas de documentación que exigen vectores.
- Generación de ilustraciones reproducibles en cuadernos y libros de texto: a partir de una figura de referencia, producir el SVG para su uso en materiales didácticos con control de escalado.
- Automatización de pipelines editoriales: integrar el modelo en un flujo que recibe figuras de autores y devuelve SVG normalizados para revisión y composición.
- Extracción de estructura de figuras para análisis: usar el SVG generado como representación intermedia que facilita la inspección de elementos (texto, formas, posiciones) en tareas de indexación o comparación de figuras.
- Prototipado en investigación sobre image-to-code: servir como base SFT de referencia para comparar con la variante RL (VFIG-4B) y evaluar la contribución de cada etapa de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,9 GB solo para pesos (tamaño del repo), más overhead del codificador visual, activaciones y caché KV; en la práctica se recomienda al menos 16 GB de VRAM para inferencia cómoda en BF16.
- Cuantización: no se publican versiones cuantizadas (GGUF, AWQ, GPTQ) en la información disponible; habría que generarlas a partir de los pesos BF16.
- GPU recomendadas: A100, H100 o L40S para despliegue en BF16 con margen; en consumer, una RTX 4090 (24 GB) es adecuada para BF16, y GPUs de 16 GB podrían funcionar con cuantización.
- ¿Cabe en consumer GPU? Sí, en BF16 cabe en GPUs de 24 GB como la RTX 4090; en GPUs de 16 GB se requeriría cuantización.
- Opciones de despliegue: transformers (soporte nativo mediante `Qwen3VLForConditionalGeneration` y `AutoProcessor`); compatibilidad con endpoints. No se confirma soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VFIG-4B-SFT | 4,44 mil millones | no disponible | Image-to-SVG (SFT) | no disponible | Hugging Face |
| VFIG-4B (RL) | no disponible (misma base Qwen3-VL-4B) | no disponible | Image-to-SVG (RL) | no disponible | Hugging Face (XunmeiLiu/VFIG-4B) |
| Qwen3-VL-4B-Instruct | 4 mil millones (aprox.) | no disponible | Visión-lenguaje general | no disponible | Hugging Face (Qwen) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: su rendimiento fuera de la tarea image-to-SVG no está documentado y podría degradarse respecto al base Qwen3-VL-4B-Instruct.
- Riesgo de alucinación: puede generar SVG sintácticamente válidos pero geométricamente incorrectos o con elementos inventados respecto a la figura de entrada.
- Validación necesaria en producción: conviene comprobar la validez del SVG y su fidelidad visual frente a la imagen original antes de usarlo automáticamente.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es un caveat crítico para producción.
- Idiomas soportados no disponibles: no se puede garantizar el comportamiento con etiquetas de figuras en idiomas distintos del inglés.
- Longitud de contexto no disponible: limita la planificación para figuras muy complejas o con mucho texto.
- Sin versiones cuantizadas publicadas: el despliegue en hardware limitado requiere cuantización manual.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy reducido, sin evidencia comunitaria de robustez.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QijiaHe/VFIG-4B-SFT
- Paper: https://arxiv.org/abs/2603.24575
- Dataset VFIG-Data: https://huggingface.co/datasets/QijiaHe/VFIG-Data
- Variante tras aprendizaje por refuerzo (VFIG-4B): https://huggingface.co/XunmeiLiu/VFIG-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
