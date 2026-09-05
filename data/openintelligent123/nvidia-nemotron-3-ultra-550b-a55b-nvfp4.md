# Openintelligent123/NVIDIA-Nemotron-3-Ultra-550B-A55B-NVFP4

## Resumen

NVIDIA Nemotron-3-Ultra-550B-A55B-NVFP4 es un modelo de lenguaje a escala frontier desarrollado por NVIDIA, publicado en junio de 2026. Es la versión cuantizada en NVFP4 del modelo Nemotron 3 Ultra, orientado a razonamiento complejo, agentes autónomos y análisis de documentos largos.

El modelo combina una arquitectura híbrida LatentMoE con capas Mamba-2, MoE y atención selectiva. Tiene 550B parámetros totales y 55B activos, e incorpora predicción multi-token (MTP) para mejorar la velocidad de generación. Su ventana de contexto llega hasta 1M de tokens, lo que lo hace adecuado para tareas de larga duración.

Está optimizado para uso comercial y no comercial, y se ofrece bajo la licencia OpenMDW-1.1. Su relevancia radica en que es el modelo más grande y capaz de la familia Nemotron, con soporte para razonamiento configurable y herramientas (tool calling).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LatentMoE: Mamba-2 + MoE + atención híbrida con MTP |
| Parametros totales | 550B (55B activos) |
| Parametros activos | 55B |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | NVFP4 (cuantización nativa de NVIDIA) |
| Idiomas soportados | Inglés, francés, español, italiano, alemán, japonés, coreano, hindi, portugués brasileño, chino (según el fabricante); HuggingFace añade árabe y hebreo |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

La arquitectura LatentMoE es un diseño híbrido que alterna capas Mamba-2 (modelo de estado de espacio) con capas de mezcla de expertos (MoE) y capas de atención selectivas. Este enfoque reduce el coste computacional de la atención completa, típico en modelos de 550B, manteniendo alta capacidad. Además, el modelo incorpora capas de predicción multi-token (MTP): en lugar de generar un único token por paso, predice varios tokens a la vez, lo que acelera la generación y mejora la calidad de las secuencias largas.

El entrenamiento se realizó entre diciembre de 2025 y abril de 2026. NVIDIA ha publicado dos conjuntos de datos: nemotron-pre-training-datasets (preentrenamiento con cutoff en septiembre de 2025) y nemotron-post-training-v3 (postentrenamiento con cutoff en mayo de 2026). No se especifica el número total de tokens ni si se emplearon técnicas como RLHF o DPO; la información disponible solo indica que el modelo está optimizado para razonamiento y agentes mediante el conjunto de postentrenamiento.

## Capacidades

- Generación de texto y respuesta conversacional.
- Razonamiento configurable: puede activar o desactivar el modo de razonamiento (traza de pensamiento) mediante `enable_thinking` en el chat template.
- Soporte de agentes y razonamiento multi-paso: diseñado para flujos de trabajo agénticos complejos, planificación y ejecución de tareas.
- Tool calling / function calling: documentado en la página de NVIDIA NIM como una de sus fortalezas.
- Contexto largo de hasta 1M tokens: ideal para análisis de documentos extensos y RAG de alto riesgo.
- Capacidad multilingüe: 10 idiomas según el fabricante, con soporte adicional de árabe y hebreo en la etiqueta de HuggingFace.
- Predicción multi-token (MTP): para acelerar la generación y mejorar la calidad en secuencias largas.
- Buen rendimiento en tareas de código, matemáticas y ciencias, basado en benchmarks agénticos.

## Casos de uso

- Agentes autónomos de larga duración: el modelo puede mantener una traza de razonamiento amplia y utilizar herramientas durante horas, gracias a su contexto de 1M tokens y soporte de tool calling. Es adecuado para orquestar agentes que deben planificar, ejecutar y corregir acciones en flujos complejos.
- RAG de alto riesgo: con su contexto largo, permite indexar y consultar documentos extensos (contratos, expedientes, informes técnicos) sin fragmentación, reduciendo el riesgo de perder información relevante.
- Generación de código de alta calidad: su rendimiento en SWE-Bench Verified (70.7 en BF16) indica capacidad para resolver fallos reales y tareas de ingeniería de software, por lo que puede integrarse en pipelines de CI/CD o herramientas de desarrollo asistido.
- Investigación de mercado y búsqueda web: en benchmarks como ProfBench (Search) y PinchBench, el modelo muestra habilidades de búsqueda y análisis, lo que lo hace útil para tareas de deep research y generación de informes.
- Atención al cliente multilingüe: soporte de varios idiomas (español, francés, japonés, etc.) y razonamiento de larga duración para gestionar consultas complejas, con el modo de razonamiento desactivado para respuestas directas.
- Razonamiento científico y matemático: el modelo puede resolver problemas de matemáticas y ciencias con un razonamiento paso a paso, lo que sirve para análisis de datos, simulación de hipótesis y tutorización automatizada.
- Automatización de flujos de trabajo empresariales: con capacidades agénticas y de tool calling, puede extraer información, resumir documentos, crear tickets y ejecutar acciones en sistemas externos.
- Traducción y localización de contenido: al soportar múltiples idiomas, puede traducir y adaptar contenido técnico y legal, manteniendo coherencia en textos largos.

## Benchmarks y rendimiento

Resultados publicados por NVIDIA en la ficha técnica del modelo. No se incluyen comparativas con otros modelos en la información proporcionada.

| Benchmark | Nemotron 3 Ultra BF16 | Nemotron 3 Ultra NVFP4 |
| --- | ---: | ---: |
| Terminal Bench 2.1 | 56.4 | 53.9 |
| GDPVal | 46.7 | 47.9 |
| SWE-Bench Verified | 70.7 | 69.5 |
| SWE-Bench Multilingual | 67.7 | 69.1 |
| ProfBench (Search) | 56 | 56.4 |
| PinchBench | 90 | 89.8 |
| TauBench V3 - Airline | 81.5 | 80.0 |
| TauBench V3 - Retail | 86.4 | 88.4 |
| TauBench V3 - Telecom | 92.9 | 93.6 |
| TauBench V3 - Banking | 22.6 | 19.2 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El checkpoint NVFP4 ocupa 352.3 GB en disco, por lo que se necesitan configuraciones multi-GPU de centro de datos.
- GPU recomendadas: según NVIDIA, se requieren al menos 4xGB200, 4xB200, 4xGB300, 4xB300 u 8xH100.
- ¿Cabe en consumer GPU? No. El tamaño del modelo y el requisito mínimo de hardware lo descartan.
- Opciones de despliegue: el modelo está etiquetado como compatible con endpoints y se ofrece mediante NVIDIA NIM (build.nvidia.com). No se mencionan vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible en la información proporcionada. No se han encontrado datos comparativos de modelos alternativos en la documentación analizada.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos específicas para este modelo.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas plausibles pero incorrectas; se recomienda validar con fuentes fiables en aplicaciones críticas.
- La ventana de contexto máxima es de 1M tokens, pero no se especifica cómo degrada el rendimiento en longitudes extremas.
- El soporte multilingüe se limita a los idiomas indicados; no se han publicado métricas de calidad por idioma.
- El despliegue requiere infraestructura de GPU de nivel centro de datos, con un coste elevado que limita su uso a organizaciones con recursos suficientes.
- La licencia OpenMDW-1.1 permite uso comercial y no comercial, según la documentación. Es importante revisar los términos completos para conocer obligaciones y restricciones adicionales.
- En entornos de producción, la latencia y el consumo energético pueden ser significativos, por lo que el modelo es más adecuado para servicios de alto valor que para aplicaciones interactivas de baja latencia.

## Enlaces

- HuggingFace: https://huggingface.co/Openintelligent123/NVIDIA-Nemotron-3-Ultra-550B-A55B-NVFP4
- Informe técnico: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Ultra-Technical-Report.pdf
- Página de investigación: https://research.nvidia.com/labs/nemotron/Nemotron-3-Ultra/
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3-ultra-550b-a55b/modelcard
- NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3-ultra-550b-a55b
- Developer NVIDIA (Nemotron): https://developer.nvidia.com/topics/ai/nemotron
- Página de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
- Colección de datasets de preentrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Colección de datasets de postentrenamiento: https://huggingface.co/collections/nvidia/nemotron-post-training-v3
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
