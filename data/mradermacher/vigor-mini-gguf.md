# mradermacher/VIGOR-mini-GGUF

## Resumen

VIGOR-mini es un modelo de clasificación de imágenes orientado a la moderación y seguridad de contenido visual, desarrollado originalmente por prithivMLmods y empaquetado en formato GGUF por mradermacher. Forma parte de la familia VIGOR (VisionGuard) y está construido a partir de una base Qwen3.5-4B, lo que le aporta capacidades multimodales y de generación de texto estructurado en JSON. Su función principal es actuar como clasificador de seguridad (guardrail) sobre imágenes, devolviendo etiquetas de contenido dañino o inapropiado.

Con 4.326.350.848 parámetros totales (aproximadamente 4,3 mil millones), el modelo se sitúa en el rango de tamaño medio, lo que permite su despliegue en hardware de consumo cuando se cuantiza. La versión GGUF publicada por mradermacher incluye cuantizaciones estáticas desde Q2_K hasta f16, además de los ficheros mmproj necesarios para el procesamiento multimodal. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo está etiquetado como experimental.

La relevancia actual de VIGOR-mini radica en la creciente necesidad de filtros automáticos de contenido visual en plataformas que reciben grandes volúmenes de imágenes generadas o subidas por usuarios. Al estar disponible en GGUF, puede integrarse en pipelines de moderación que se ejecutan en local o en entornos con recursos limitados, sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-4B) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que el modelo base es Qwen3.5-4B, un transformer multimodal con capacidades de generación de texto y procesamiento de imágenes. La model card del repositorio GGUF no incluye datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El etiquetado incluye términos como "mtp" y "experimental", pero no se especifica su significado técnico en la información proporcionada.

El proceso de conversión a GGUF fue realizado por mradermacher mediante cuantización estática (quantize_version 2, output_tensor_quantised 1, convert_type hf). Se incluyen ficheros mmproj para el proyector multimodal, necesarios para que el modelo procese imágenes junto con texto. No se han publicado detalles sobre innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de imágenes para seguridad de contenido: el modelo devuelve etiquetas o puntuaciones de contenido dañino o inapropiado.
- Generación de salida estructurada en JSON, adecuada para integración en pipelines automáticos.
- Procesamiento multimodal: combina entrada de imagen y texto (ficheros mmproj incluidos).
- Moderación de contenido visual (content-safety, content-moderation, guardrail).
- Etiquetado como "uncensored" en los tags, lo que sugiere que el modelo no aplica filtros internos adicionales a sus propias salidas.
- Capacidad de clasificación de imágenes (pipeline image-classification).
- No se especifica soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.
- Capacidades multilingües limitadas al inglés según el campo language.

## Casos de uso

- Moderación automática de imágenes en plataformas de contenido generado por usuarios: el modelo puede clasificar imágenes subidas y devolver etiquetas JSON que un sistema posterior use para bloquear, revisar o aprobar contenido. Su tamaño de 4,3B permite ejecutarlo en servidores con GPU de gama media.
- Filtrado de contenido visual en pipelines de generación de imágenes: integrado como paso posterior a un modelo de difusión, VIGOR-mini puede evaluar la salida antes de mostrarla al usuario, actuando como guardrail.
- Revisión de contenido en foros y comunidades: despliegue en local con llama.cpp u Ollama para prefiltrar imágenes y reducir la carga de moderadores humanos, priorizando las que el modelo marque como sospechosas.
- Cumplimiento normativo en aplicaciones con requisitos de seguridad: el modelo puede generar registros JSON auditables de cada clasificación, útiles para demostrar que se aplican controles de contenido.
- Investigación en seguridad multimodal: al ser un modelo pequeño y con licencia Apache 2.0, sirve como base para experimentos de clasificación de contenido y evaluación de sesgos en moderación visual.
- Prefiltrado en entornos con recursos limitados: las cuantizaciones Q4_K_S y Q4_K_M (2,7-2,9 GB) permiten ejecutar el modelo en GPUs de consumo como la RTX 3060 o superiores, ideal para prototipos y despliegues edge.
- Clasificación por lotes de imágenes en repositorios: el modelo puede procesar grandes volúmenes de imágenes en un servidor con GPU para etiquetar datasets antes de su publicación o uso en entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (solo pesos del modelo principal): Q2_K ~2,1 GB; Q4_K_M ~2,9 GB; Q8_0 ~4,7 GB; f16 ~8,8 GB. Hay que añadir el fichero mmproj (0,5-0,8 GB) para el procesamiento de imágenes.
- GPU recomendadas: para cuantizaciones Q4, una RTX 3060 (12 GB) o RTX 4060 Ti (16 GB) es suficiente; para Q8_0 o f16, se recomienda RTX 4090 (24 GB) o GPUs de datacenter como A100 o H100 si se requiere mayor throughput.
- Cabe en GPU de consumo: sí, en cuantizaciones Q2 a Q5 con GPUs de 8-12 GB; Q6 y Q8 requieren al menos 8-12 GB adicionales considerando el contexto y el proyector multimodal.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El modelo base es compatible con transformers y text-generation-inference, pero la versión GGUF está pensada para llama.cpp y derivados.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| VIGOR-mini (este) | 4,3B | no disponible | Apache 2.0 | GGUF, safetensors | Clasificador de seguridad visual multimodal |
| Llama Guard 3 Vision (Meta) | ~11B | no disponible | Llama 3.2 Community License | safetensors | Guardrail multimodal, mayor tamaño, licencia restrictiva |
| Qwen2.5-VL-3B | 3B | 32K (según documentación pública) | Apache 2.0 | safetensors, GGUF | Modelo multimodal general, no específico de moderación |
| ShieldGemma (Google) | 2B-27B | no disponible | Gemma Terms of Use | safetensors | Familia de guardrails de texto, no visual |

La comparación directa es limitada porque VIGOR-mini está especializado en clasificación de seguridad visual, mientras que los alternativos cubren tareas más generales o son solo de texto. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo etiquetado como "experimental": no se garantiza su robustez en producción sin una evaluación previa.
- Solo soporta inglés según el campo language; el rendimiento en otros idiomas no está documentado.
- No se han publicado benchmarks ni métricas de precisión, recall o falsos positivos, lo que impide evaluar su fiabilidad objetivamente.
- Riesgo de alucinación y clasificaciones erróneas inherente a los modelos generativos; como clasificador, puede producir etiquetas inconsistentes.
- El tag "uncensored" sugiere que el modelo no aplica filtros internos, lo que puede ser deseable para moderación pero requiere validación cuidadosa de sus salidas.
- Aunque la licencia es Apache 2.0, el modelo base Qwen3.5-4B puede tener sus propias condiciones; conviene verificar la licencia del modelo base antes de uso comercial.
- El repositorio GGUF tiene un tamaño de 41 GB, lo que implica descargas voluminosas si se necesitan varias cuantizaciones.
- No hay información sobre sesgos demográficos o culturales en la clasificación de contenido.
- La fecha de creación del repositorio (2026-11-03) es posterior a la fecha actual en algunos entornos, lo que puede indicar un error de metadatos o un modelo de disponibilidad futura; verificar la integridad de los ficheros antes de usarlos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/VIGOR-mini-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/VIGOR-mini
- Página de descargas del cuantizador: https://hf.tst.eu/model#VIGOR-mini-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
