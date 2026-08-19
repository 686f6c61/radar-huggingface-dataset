# jknlsn/Qwen3.8-27B-oQ6e-mtp

## Resumen

El modelo `jknlsn/Qwen3.8-27B-oQ6e-mtp` es una cuantización de 6 bits del modelo Qwen3.8-27B, un modelo denso de lenguaje y visión desarrollado por Alibaba Cloud. Esta versión concreta ha sido convertida y cuantizada por el usuario jknlsn utilizando la herramienta oQe (oMLX v0.6.0) con mejora por imatrix, y está optimizada para ejecutarse en el ecosistema MLX de Apple Silicon. Incluye soporte para multi-token prediction (MTP), lo que acelera la decodificación.

El modelo base Qwen3.8-27B es un modelo vision-language de 27.000 millones de parámetros, con una ventana de contexto nativa de 262.144 tokens, licencia Apache 2.0 y capacidades de razonamiento configurable. Está diseñado para tareas de codificación, trabajo profesional, investigación y agentes autónomos de largo horizonte. Esta cuantización reduce el tamaño del modelo para facilitar su despliegue local en hardware con recursos limitados, manteniendo un equilibrio entre rendimiento y fidelidad.

La relevancia de esta ficha radica en que ofrece una opción práctica para ejecutar un modelo de última generación en equipos de consumo, como Macs con chip M-series o GPUs con 24 GB de VRAM, sin sacrificar demasiada precisión gracias a la cuantización de 6 bits con group size 64 y calibración imatrix.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3.5) con soporte multimodal (visión y texto) y MTP |
| Parametros totales | 6.612.941.552 (según safetensors; el modelo base declara 27B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 6 bits (oQ6e, group size 64, imatrix) |
| Idiomas soportados | no disponible (el modelo base es multilingüe) |
| Licencia | Apache 2.0 (modelo base); la licencia de esta cuantización no está especificada |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso que sigue la arquitectura de la serie Qwen 3.5, con atención completa y sin mezcla de expertos. Incorpora multi-token prediction (MTP), una técnica que permite predecir varios tokens por paso de decodificación, reduciendo la latencia en generación. Además, es un modelo multimodal que acepta entradas de imagen y vídeo junto con texto, lo que lo hace adecuado para tareas de visión-lenguaje.

No se dispone de detalles específicos sobre el dataset de entrenamiento del modelo base, pero por su naturaleza y los benchmarks publicados, se infiere que fue entrenado con una gran cantidad de datos multilingües y multimodales. La cuantización aplicada en esta versión utiliza oQe con mejora imatrix, que ajusta la precisión de los pesos según la importancia de cada capa, y un group size de 64 para minimizar la pérdida de calidad.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de razonamiento configurable (thinking mode).
- Comprensión y generación de imágenes y vídeo, gracias a su naturaleza vision-language.
- Soporte de tool calling y function calling, lo que permite integrarse con APIs y herramientas externas.
- Capacidades agénticas: puede ejecutar tareas de largo horizonte, como navegación web, uso de terminal y operaciones en sistemas operativos.
- Multilingüe (idiomas no especificados, pero el modelo base soporta múltiples lenguas).
- Decodificación acelerada mediante MTP, que mejora el throughput en generación.
- Compatible con el ecosistema MLX, lo que permite ejecución eficiente en Apple Silicon.

## Casos de uso

- Asistente de codificación en producción: el modelo puede generar, revisar y refactorizar código en múltiples lenguajes, integrándose en pipelines de CI/CD mediante tool calling para automatizar tareas de desarrollo.
- Agente autónomo de navegación web: gracias a su capacidad de razonamiento de largo horizonte y tool calling, puede realizar búsquedas, extraer información y completar formularios en línea de forma autónoma.
- Análisis de documentos multimodales: al aceptar imágenes y vídeo, puede extraer información de capturas de pantalla, diagramas o vídeos para resumir o responder preguntas.
- Atención al cliente automatizada: con su contexto de 262K tokens, puede gestionar conversaciones multi-turno extensas, manteniendo el historial completo y ofreciendo respuestas coherentes.
- Automatización de tareas de oficina: puede redactar correos, generar informes, resumir reuniones y gestionar calendarios mediante integración con APIs.
- Investigación y análisis de datos: puede procesar grandes volúmenes de texto, extraer conclusiones y generar visualizaciones o explicaciones, útil para científicos de datos y analistas.

## Benchmarks y rendimiento

Los siguientes resultados corresponden al modelo base Qwen3.8-27B, según la guía publicada en lovableapp.org. No se han encontrado benchmarks específicos para esta cuantización.

| Benchmark | Resultado |
|---|---|
| DeepSWE | 42.2 |
| Terminal Bench | 73.0 |
| OSWorld | 84.3 |

Estos valores indican un rendimiento sólido en tareas de ingeniería de software, uso de terminal y operaciones con sistemas operativos, respectivamente. No se dispone de resultados de MMLU, HumanEval u otros benchmarks estándar en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: la cuantización de 6 bits ocupa aproximadamente 23.7 GB (tamaño del repositorio). Se recomienda al menos 24 GB de VRAM para inferencia cómoda.
- GPUs compatibles: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40 GB o más), o GPUs AMD con soporte MLX (por ejemplo, Radeon RX 7900 XTX).
- Apple Silicon: Macs con chip M1 Pro/Max/Ultra o M2/M3/M4 con 32 GB o más de RAM unificada pueden ejecutar el modelo, aunque con menor velocidad que en GPUs dedicadas.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (comando `ollama run qwen3.8:27b`), LM Studio y Lemonade (con soporte AMD).
- Rendimiento estimado: en AMD Ryzen AI Max+ 395 se midieron 24.5 tokens por segundo con la versión Q4. La versión de 6 bits será algo más lenta, pero aún utilizable en tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | MTP |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | Sí | Sí |
| Qwen2.5-27B (si existe) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 | No | No |

No se dispone de información suficiente sobre alternativas directas de 27B con características similares. La comparativa se limita a los datos disponibles.

## Limitaciones y advertencias

- La cuantización de 6 bits puede introducir una ligera degradación en la calidad de generación en comparación con el modelo original en precisión completa.
- El número de parámetros reportado en safetensors (6.6B) es inconsistente con la denominación "27B" del modelo base; se recomienda verificar la integridad del archivo antes de su uso en producción.
- No se especifican los idiomas soportados en esta cuantización; el modelo base es multilingüe, pero la calidad puede variar según el idioma.
- La licencia de esta cuantización no está declarada; aunque el modelo base es Apache 2.0, es recomendable contactar al autor para aclarar los términos de uso.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- El modelo puede reflejar sesgos presentes en los datos de entrenamiento; se recomienda evaluar su comportamiento en dominios sensibles.

## Enlaces

- [HuggingFace - jknlsn/Qwen3.8-27B-oQ6e-mtp](https://huggingface.co/jknlsn/Qwen3.8-27B-oQ6e-mtp)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Blog AMD: Run Qwen 3.8 27B on AMD Ryzen AI Max](https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html)
- [Guía completa de Qwen3.8-27B (lovableapp.org)](https://lovableapp.org/blog/qwen3-8-27b)
- [Página de Qwen3.8 en LM Studio](https://lmstudio.ai/models/qwen3.8)
- [Guía para ejecutar Qwen3.8-27B localmente (modelfit.io)](https://modelfit.io/blog/run-qwen38-27b-locally-2026/)
