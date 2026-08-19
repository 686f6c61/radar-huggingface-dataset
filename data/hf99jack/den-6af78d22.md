# hf99jack/den-6af78d22

## Resumen

El modelo `hf99jack/den-6af78d22` es un modelo multimodal de tipo imagen-texto-a-texto desarrollado por el usuario hf99jack (Jack Ronney) en la plataforma HuggingFace. Con 35.951.822.704 parámetros totales (aproximadamente 35,95 mil millones), emplea una arquitectura de mezcla de expertos (MoE) basada en la familia Qwen 3.5, según indica la etiqueta `qwen3_5_moe`. Está diseñado para tareas conversacionales que integran entrada visual y textual, lo que lo sitúa en la categoría de modelos vision-language.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación con atribución. Sin embargo, el acceso está restringido (gated) y requiere aceptar condiciones adicionales en HuggingFace. A pesar de su tamaño considerable, no se dispone de información pública sobre su rendimiento, datos de entrenamiento o capacidades específicas más allá de la arquitectura declarada. Su relevancia actual es limitada debido a la ausencia de documentación y métricas publicadas, aunque podría resultar interesante para desarrolladores que buscan alternativas MoE multimodales en el ecosistema de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen 3.5 (tag `qwen3_5_moe`) |
| Parametros totales | 35.951.822.704 (35,95 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con acceso restringido en HuggingFace) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada es de tipo mezcla de expertos (MoE), siguiendo el patrón de la serie Qwen 3.5. En un MoE, solo una fracción de los parámetros totales se activa por token, lo que permite escalar el número de parámetros sin incrementar proporcionalmente el coste computacional en inferencia. El modelo es multimodal, aceptando tanto imágenes como texto como entrada, y genera texto como salida. No se dispone de información sobre el número de expertos, la estrategia de enrutamiento, el tamaño del contexto, la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO. El repositorio no incluye documentación técnica adicional más allá de los metadatos básicos.

## Capacidades

- Procesamiento multimodal: acepta entrada de imágenes y texto, generando respuestas textuales.
- Conversación: etiquetado como `conversational`, apto para diálogos multi-turno.
- Integración con transformers: compatible con la librería `transformers` y con `endpoints_compatible`, lo que sugiere despliegue en entornos de inferencia estandarizados.
- No se han documentado capacidades específicas como tool calling, agentes, razonamiento multi-paso o modos de pensamiento extendido.
- El soporte multilingüe no está especificado.

## Casos de uso

Dada la falta de documentación y benchmarks, los casos de uso son hipotéticos y deben validarse con pruebas propias. No obstante, por su naturaleza multimodal y su tamaño, podría aplicarse a:

- Descripción de imágenes en aplicaciones de accesibilidad: el modelo podría generar texto alternativo para imágenes en entornos web o móviles, aprovechando su entrada visual.
- Asistentes conversacionales con contexto visual: por ejemplo, un chatbot que reciba capturas de pantalla o fotos y responda preguntas sobre ellas.
- Análisis de documentos escaneados: combinando OCR implícito con comprensión textual, podría extraer información de facturas o formularios.
- Moderación de contenido visual: clasificación o descripción de imágenes para filtrar contenido inapropiado.
- Generación de subtítulos para vídeos o imágenes en redes sociales.
- Prototipos de investigación en visión y lenguaje: al ser un MoE multimodal, puede servir como base para experimentos académicos sobre eficiencia de parámetros activos en tareas conjuntas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni evaluaciones de visión-lenguaje (como VQAv2 o COCO Caption) en el repositorio ni en la web.

## Requisitos de hardware

- VRAM estimada: con 35,95 B parámetros en precisión fp32, el modelo ocuparía unos 143 GB de memoria. Con cuantización a 8 bits (int8) se reduciría a aproximadamente 36 GB, y a 4 bits a unos 18 GB, aunque no se han publicado archivos cuantizados.
- GPU recomendadas: para inferencia en fp16 (unos 72 GB), se necesitarían GPUs profesionales como A100 (80 GB) o H100 (80 GB). Con cuantización 4 bits podría ejecutarse en una RTX 4090 (24 GB) o similar, siempre que se disponga de los pesos cuantizados.
- Despliegue: al ser compatible con `transformers` y `endpoints_compatible`, puede servirse con vLLM, TGI o soluciones de HuggingFace Inference Endpoints. Para entornos locales, se podría usar llama.cpp si se convierte a GGUF, aunque no hay archivos GGUF disponibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo se etiqueta como `qwen3_5_moe`, pero no se conocen sus parámetros activos ni su rendimiento. Como referencia genérica de MoE multimodales de tamaño similar, se podría mencionar:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| hf99jack/den-6af78d22 | 35,95 B (MoE) | no disponible | Apache 2.0 | Gated en HF |
| Mixtral 8x7B (texto) | 46,7 B (MoE, 12,9 B activos) | 32k | Apache 2.0 | Abierto |
| Qwen2-VL-7B | 7 B (denso) | 32k | Apache 2.0 | Abierto |

La comparación es orientativa y no refleja capacidades reales del modelo evaluado.

## Limitaciones y advertencias

- Información pública muy limitada: no hay documentación técnica, papers ni guías de uso. Cualquier implementación en producción requiere una evaluación exhaustiva previa.
- Sesgos y alucinaciones: al no conocerse los datos de entrenamiento, no se pueden prever sesgos específicos. Como modelo multimodal, puede alucinar descripciones de imágenes o inventar detalles visuales.
- Acceso restringido: aunque la licencia es Apache 2.0, el repositorio es gated y exige aceptar condiciones adicionales, lo que puede limitar su uso en algunos entornos.
- Tamaño y requisitos de hardware: 35,95 B parámetros implica costes de inferencia no despreciables; sin cuantizaciones oficiales, el despliegue en hardware consumer es complicado.
- Sin garantías de soporte: al ser un modelo de un autor individual sin comunidad aparente, no hay mantenimiento ni actualizaciones previsibles.
- Fecha de creación sospechosa (2026-08-18) que sugiere un error en los metadatos; esto añade incertidumbre sobre la fiabilidad del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hf99jack/den-6af78d22
- Perfil del autor: https://huggingface.co/hf99jack
- Lista de modelos del autor: https://huggingface.co/hf99jack/models

No se han encontrado papers, blogs, repositorios de código ni demos asociados a este modelo.
