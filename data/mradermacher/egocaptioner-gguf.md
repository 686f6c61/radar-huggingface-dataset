# mradermacher/EgoCaptioner-GGUF

## Resumen

EgoCaptioner es un modelo de generación de descripciones (captioning) de vídeo egocéntrico, es decir, vídeo grabado desde una cámara en primera persona (por ejemplo, gafas inteligentes o cámaras corporales). El modelo original lo desarrolla Vickyinmyheart824 y esta ficha documenta la versión cuantizada en formato GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo parte de una arquitectura transformer con aproximadamente 8.950 millones de parámetros (8,95 B), según los pesos en safetensors del modelo base. Su tarea principal es convertir secuencias de vídeo egocéntrico en descripciones textuales en inglés, un nicho relevante para aplicaciones de asistencia visual, análisis de actividad y documentación automática de tareas manuales.

La relevancia de esta publicación radica en que ofrece cuantizaciones estáticas (de Q2_K a Q8_0, además de f16) que reducen el peso desde 18 GB en f16 hasta 4 GB en Q2_K, lo que facilita el despliegue local sin depender de infraestructura de GPU de datacenter. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base EgoCaptioner, orientado a vídeo egocéntrico) |
| Parámetros totales | 8.953.803.264 (8,95 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que se trata de un transformer orientado a vídeo egocéntrico. El recuento de parámetros (8,95 B) y el tamaño del repo (81,8 GB, que incluye todas las cuantizaciones) son los únicos datos estructurales verificables. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal de esta publicación no está en el modelo en sí, sino en el proceso de cuantización estática realizado por mradermacher, que genera versiones con distintos niveles de compresión y calidad. El autor indica que las cuantizaciones ponderadas con imatrix están disponibles en un repositorio separado (EgoCaptioner-i1-GGUF), lo que sugiere que esta versión usa cuantización estática convencional sin matriz de importancia.

## Capacidades

- Generación de descripciones textuales de vídeo egocéntrico (primera persona).
- Procesamiento de entrada de vídeo como modalidad principal, además de texto.
- Capacidad conversacional (etiqueta `conversational` en el repositorio).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (thinking mode, audio, visión general): no disponible; la única modalidad especial documentada es vídeo egocéntrico.

## Casos de uso

- Descripción automática de vídeo en primera persona para asistentes de accesibilidad: el modelo puede narrar lo que ocurre en la escena captada por una cámara corporal, ayudando a personas con discapacidad visual a comprender su entorno.
- Documentación de tareas manuales en entornos industriales: a partir de grabaciones de operarios con cámara corporal, el modelo genera descripciones de los pasos ejecutados, útiles para auditoría o formación.
- Análisis de actividad en investigación de comportamiento: los investigadores pueden etiquetar automáticamente secuencias egocéntricas de experimentos y reducir el trabajo manual de anotación.
- Indexación y búsqueda de archivos de vídeo personal: las descripciones generadas permiten construir metadatos textuales para buscar fragmentos concretos en grabaciones de gafas inteligentes.
- Generación de subtítulos para contenido de creadores con cámara en primera persona: el modelo produce texto descriptivo que puede revisarse y publicarse como subtítulos o descripciones alternativas.
- Prototipado local en hardware de consumo: gracias a las cuantizaciones Q4_K_S (5,5 GB) y Q4_K_M (5,8 GB), es viable desplegar el modelo en una estación de trabajo con GPU de gama alta para pruebas de concepto sin coste de nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~4 GB, Q3_K_S ~4,4 GB, Q3_K_M ~4,8 GB, Q3_K_L ~5,1 GB, IQ4_XS ~5,4 GB, Q4_K_S ~5,5 GB, Q4_K_M ~5,8 GB, Q5_K_S ~6,4 GB, Q5_K_M ~6,6 GB, Q6_K ~7,5 GB, Q8_0 ~9,6 GB, f16 ~18 GB (tamaños de archivo; la VRAM real puede ser algo superior por el contexto y el procesamiento de vídeo).
- GPU recomendadas: para Q4_K_M o superiores, una RTX 4090 (24 GB) o RTX 3090 (24 GB) permite ejecutar con holgura; para Q8_0 y f16 se recomienda A100 40 GB, H100 o varias GPU consumer.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más para cuantizaciones Q2_K a Q4_K_M; Q5 y Q6 requieren 8-12 GB; Q8_0 requiere 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base usa transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables de captioning de vídeo egocéntrico en la información proporcionada. La comparación cuantitativa con alternativas no está disponible.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- No se han publicado datos sobre sesgos, tasas de alucinación ni evaluación cualitativa de las descripciones generadas.
- La longitud de contexto no está documentada, lo que impide planificar la duración máxima de vídeo procesable.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_M marcada como "lower quality") pueden degradar la calidad de las descripciones; se recomienda Q4_K_M o superior para producción.
- El modelo está especializado en vídeo egocéntrico; su uso con vídeo en tercera persona u otras modalidades no está validado.
- La licencia Apache 2.0 permite uso comercial, pero al ser una cuantización de un modelo de terceros conviene verificar la licencia del modelo base original.
- El tamaño del repositorio (81,8 GB) incluye todas las cuantizaciones; descargar solo el archivo GGUF necesario.

## Enlaces

- Repositorio Hugging Face (cuantizaciones): https://huggingface.co/mradermacher/EgoCaptioner-GGUF
- Modelo base: https://huggingface.co/Vickyinmyheart824/EgoCaptioner
- Cuantizaciones ponderadas imatrix: https://huggingface.co/mradermacher/EgoCaptioner-i1-GGUF
- Página de descarga del autor: https://hf.tst.eu/model#EgoCaptioner-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
