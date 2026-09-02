# mradermacher/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic-NOESIS-BF16-i1-GGUF

## Resumen

Este repositorio contiene la cuantización GGUF con matriz de importancia (imatrix) del modelo `AMAImedia/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic-NOESIS-BF16`, un fine-tune de 27 mil millones de parámetros derivado de Qwen3.8-27B. El modelo original, desarrollado por DavidAU, aplica la metodología COLD FUSION, que combina la técnica GAIN (entrenamiento dinámico por muestra) con la infraestructura de Unsloth para reducir los tokens de pensamiento a entre 1/10 y 1/2 de los modelos Qwen estándar, manteniendo aproximadamente el 99 % del rendimiento en precisión completa incluso con cuantización de 8 bits. La variante "heretic" indica que el modelo ha sido sometido a abliteration (eliminación de capas de rechazo), lo que lo hace menos censurado y más directo en sus respuestas. El término "NOESIS" hace referencia a un repack interno del modelo.

La cuantización GGUF, realizada por mradermacher, ofrece múltiples niveles de compresión (desde IQ1_M hasta Q6_K) para adaptarse a distintos recursos de hardware. El modelo es multimodal (incluye torre de visión) y soporta una ventana de contexto nativa de 262 000 tokens, extensible a 1 000 000. Está licenciado bajo Apache-2.0, lo que permite uso comercial sin restricciones significativas. La relevancia actual radica en su capacidad para ofrecer razonamiento extenso con un coste computacional reducido en comparación con modelos de tamaño similar, y en su naturaleza "uncensored" que atrae a desarrolladores que buscan respuestas sin filtros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (lineal en 48 de 64 capas), torre de visión y cabeza de borrador MTP incorporada |
| Parametros totales | 26 895 998 464 (~26,9 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 000 tokens nativos, extensible a 1 000 000 |
| Tipos de cuantizacion | i1-IQ1_M, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K |
| Idiomas soportados | Inglés, ruso, chino, japonés, kazajo, vietnamita |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B presenta una arquitectura de transformer denso con atención híbrida: 48 de sus 64 capas utilizan atención lineal (probablemente basada en mecanismos como GQA o similar), lo que reduce el coste computacional en secuencias largas, mientras que las 16 restantes mantienen atención completa. Incluye una torre de visión para procesamiento multimodal y una cabeza de borrador MTP (Multi-Token Prediction) integrada que acelera la decodificación especulativa. El fine-tune COLD FUSION aplica la técnica GAIN, que ajusta dinámicamente los pesos por muestra durante el entrenamiento, y utiliza Unsloth para optimizar el proceso. El resultado es una reducción drástica de los tokens de pensamiento (thinking tokens) en tareas de razonamiento, pasando de miles a unos pocos cientos, sin sacrificar precisión.

El modelo "heretic" ha sido sometido a abliteration, un proceso que elimina las direcciones de activación asociadas al rechazo de respuestas, lo que produce un comportamiento menos censurado. La variante NOESIS es un repack interno que reorganiza los pesos para mejorar la coherencia interna. Los datos de entrenamiento no se especifican en la documentación disponible, pero se infiere que incluyen corpora multilingües (inglés, ruso, chino, japonés, kazajo, vietnamita) y posiblemente datos de código y matemáticas, dado el origen Qwen. No se menciona el uso de RLHF o DPO, aunque la abliteration sugiere que el modelo original tenía algún mecanismo de alineación que ha sido parcialmente eliminado.

## Capacidades

- Generación de texto y razonamiento complejo: gracias a la reducción de tokens de pensamiento, puede resolver problemas de lógica, matemáticas y análisis con menos overhead computacional.
- Comprensión multimodal: al incluir torre de visión, puede procesar imágenes junto con texto (aunque los archivos mmproj se encuentran en el repositorio estático correspondiente).
- Soporte multilingüe: cubre seis idiomas principales, con especial énfasis en inglés, ruso y chino.
- Decodificación especulativa con MTP: acelera la generación de texto al predecir múltiples tokens a la vez.
- Ventana de contexto muy larga: 262K tokens nativos, ampliable a 1M, adecuada para documentos extensos o conversaciones de múltiples turnos.
- Comportamiento "uncensored": la abliteration elimina gran parte de los filtros de rechazo, permitiendo respuestas directas sobre temas sensibles.
- Conversación y diálogo: diseñado para interacciones conversacionales fluidas, como indica su etiqueta "conversational".
- Tool calling y function calling: no se especifica explícitamente en la información disponible, pero al derivar de Qwen3.8 es probable que los soporte; no obstante, no se puede confirmar sin documentación adicional.

## Casos de uso

- Asistente de atención al cliente multilingüe: con su soporte para seis idiomas y su ventana de contexto de 262K tokens, puede gestionar conversaciones largas y multilingües, manteniendo el historial completo sin truncamientos. La reducción de tokens de pensamiento permite respuestas rápidas en entornos de producción.
- Generación de código y depuración: aunque no se mencionan benchmarks de código, su base Qwen3.8 le confiere capacidades sólidas en programación. Puede integrarse en IDEs o pipelines de CI/CD para autocompletar, revisar y explicar código.
- Análisis de documentos largos: con 262K tokens de contexto, puede procesar libros, informes legales o artículos científicos completos, extrayendo resúmenes, respondiendo preguntas o identificando patrones.
- Sistema de razonamiento para agentes autónomos: su capacidad de razonamiento con menos tokens de pensamiento lo hace eficiente para frameworks de agentes que requieren múltiples pasos de planificación y ejecución.
- Moderación de contenido y generación creativa sin restricciones: al ser "uncensored", puede utilizarse para escribir ficción, guiones o contenido que otros modelos rechazarían por políticas de seguridad.
- Entrenamiento y fine-tuning posterior: al estar licenciado bajo Apache-2.0 y ofrecer cuantizaciones de alta calidad (como Q4_K_M o Q6_K), puede servir como base para adaptaciones específicas en dominios como medicina, derecho o educación, siempre que se respete la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación del modelo base menciona que mantiene el 99 % del rendimiento en precisión completa con cuantización de 8 bits, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros tests estándar. Tampoco se incluyen comparativas con modelos similares en la model card del repositorio GGUF.

## Requisitos de hardware

- VRAM estimada según cuantización: el archivo i1-Q4_K_M ocupa 16,6 GB, por lo que cabe en una GPU de 24 GB (RTX 3090, RTX 4090, A5000). El i1-Q6_K ocupa 22,2 GB, requiriendo 24 GB o más. Las cuantizaciones más bajas (IQ1_M, 7,7 GB) pueden ejecutarse en GPUs de 8-12 GB, aunque con pérdida significativa de calidad.
- GPUs recomendadas: para uso interactivo con Q4_K_M, una RTX 4090 (24 GB) es suficiente; para Q6_K, se recomienda A100 40 GB o H100. Para contexto largo (262K), la memoria aumentará considerablemente; se recomienda usar cuantizaciones menores o descargar parte del contexto a CPU.
- Compatibilidad con consumer GPU: sí, las cuantizaciones Q4_K_M y menores caben en GPUs de gama alta de consumo. Las cuantizaciones Q6_K requieren GPUs profesionales o dual-GPU.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio, text-generation-webui y servidores como llama-cpp-python. También puede usarse con vLLM si se convierte a formato safetensors, aunque ese no es el propósito de este repositorio.
- Latencia y throughput: no se proporcionan datos específicos. La atención híbrida y el MTP deberían ofrecer velocidades de generación superiores a un transformer denso puro de 27B, especialmente en secuencias largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 26,9B | 262K | Apache-2.0 | Modelo original sin fine-tune, con atención híbrida y visión |
| Qwen3.8-27B-Cold-Fusion-GAIN-V1.1 (este modelo) | 26,9B | 262K | Apache-2.0 | Fine-tune con reducción de tokens de pensamiento, abliterated |
| Qwen3-32B | 32B | 131K | Apache-2.0 | Modelo anterior de Qwen, denso, sin visión |
| Llama-3.1-70B | 70B | 128K | Llama 3.1 | Mucho mayor, requiere más hardware, pero con benchmarks superiores |

La comparativa directa con otros modelos no está disponible en los datos proporcionados. Este modelo se distingue por su ventana de contexto nativa de 262K (extensible a 1M), su naturaleza multimodal y su comportamiento uncensored, lo que lo hace único frente a alternativas de tamaño similar.

## Limitaciones y advertencias

- Comportamiento "uncensored": al haber sido sometido a abliteration, el modelo puede generar contenido ofensivo, ilegal o éticamente cuestionable. No es adecuado para aplicaciones donde se requiera moderación estricta sin un sistema de filtrado externo.
- Riesgo de alucinación: como todos los modelos de lenguaje, puede inventar hechos, especialmente en temas especializados o con poca representación en sus datos de entrenamiento. La reducción de tokens de pensamiento podría aumentar este riesgo en tareas de razonamiento profundo.
- Limitaciones de idioma: aunque soporta seis idiomas, la calidad puede variar significativamente entre ellos. El kazajo y el vietnamita probablemente tengan un rendimiento inferior al inglés o chino.
- Pérdida de calidad por cuantización: las cuantizaciones más agresivas (IQ1_M, IQ2_M) degradan notablemente la coherencia y precisión. Se recomienda usar al menos Q4_K_M para tareas serias.
- Requisitos de memoria para contexto largo: aunque la ventana nativa es de 262K, cargar el contexto completo en memoria puede requerir más de 60 GB de VRAM, incluso con cuantización Q4. Para uso práctico, se recomienda limitar el contexto a 32K-64K en hardware consumer.
- Licencia Apache-2.0: permite uso comercial y modificación, pero no ofrece garantías de ningún tipo. El usuario es responsable del cumplimiento de normativas locales sobre contenido generado.
- Sin benchmarks publicados: no hay evidencia cuantitativa del rendimiento en tareas estándar, por lo que la afirmación del 99 % de rendimiento debe tomarse con cautela.

## Enlaces

- Repositorio GGUF (este modelo): https://huggingface.co/mradermacher/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic-NOESIS-BF16-i1-GGUF
- Modelo base: https://huggingface.co/AMAImedia/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic-NOESIS-BF16
- Repositorio estático GGUF (sin imatrix): https://huggingface.co/mradermacher/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic-NOESIS-BF16-GGUF
- Página de descripción del modelo base (aimodels.fyi): https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-cold-fusion-gain-v1.1-davidau
- Página de descripción de variante similar: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-cold-fusion-gain-v1.1-nm-dau-neo-max-mtp-gguf-davidau
- Información sobre Qwen3.8-27B en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
