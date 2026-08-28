# geodesic-research/control-pretrain-30b-baseline-sft

## Resumen

`control-pretrain-30b-baseline-sft` es el modelo final de la campaña de preentrenamiento controlado de Geodesic Research, una organización británica de seguridad técnica en IA. Se trata del brazo de control sin filtrar de un estudio sobre filtrado de datos de preentrenamiento: un modelo con arquitectura Nemotron 3 Nano 30B-A3B (híbrida Mamba2 + atención + mezcla de expertos, ~30B parámetros totales y ~3B activos) entrenado completamente desde cero, sin usar los pesos de NVIDIA. El entrenamiento siguió un currículo de tres etapas que totaliza 603.800 millones de tokens, finalizando el 27 de agosto de 2026. El modelo está pensado como artefacto de investigación para comparar el efecto del filtrado de datos, no como asistente de producción.

La relevancia actual radica en que aborda una cuestión central en alineación: cómo las intervenciones durante el preentrenamiento (filtrado, mezcla de datos, SFT temprano) afectan a las capacidades y a la seguridad. Al publicar el baseline sin filtrar junto con sus checkpoints intermedios, Geodesic permite a la comunidad estudiar el impacto del filtrado de forma controlada y reproducible. El modelo incluye un modo de razonamiento explícito (bloques "think") y soporta tool use y tareas agénticas, aunque sin post-entrenamiento de seguridad adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba2 + atención + MoE (Nemotron 3 Nano 30B-A3B) |
| Parametros totales | 31.577.937.344 |
| Parametros activos | ~3.000.000.000 (MoE) |
| Longitud de contexto | 32.768 (secuencia de entrenamiento en etapas 2 y 3; no se especifica máximo) |
| Tipos de cuantizacion | BF16 (safetensors); no se proporcionan cuantizaciones oficiales |
| Idiomas soportados | Inglés |
| Licencia | nvidia-open-model-license |
| Formato de pesos | safetensors (también checkpoints Megatron en repositorio separado) |

## Arquitectura y entrenamiento

El modelo usa la arquitectura Nemotron 3 Nano 30B-A3B, que combina capas de Mamba2 (modelos de espacio de estados) con capas de atención tradicional y una mezcla de expertos (MoE) con aproximadamente 3.000 millones de parámetros activos por token. Esta combinación busca eficiencia computacional manteniendo capacidad de razonamiento de largo alcance. El entrenamiento se realizó desde cero (inicialización aleatoria) en tres etapas: preentrenamiento con 501.300 millones de tokens a secuencia de 8.192, una etapa intermedia de annealing con 52.400 millones de tokens a secuencia de 32.768, y un ajuste fino supervisado (SFT) con 50.100 millones de tokens (dos épocas) a secuencia de 32.768 empaquetada. Los datos del SFT provienen de `geodesic-research/pa-warm-start-sft-heavy-25b-mix`, un conjunto de 25.000 millones de tokens en inglés centrado en STEM y razonamiento (programación competitiva, ciencia, matemáticas, tool use agéntico y chat). El SFT se aplicó con una máscara que solo entrena tokens de asistente (81,8% del total) y usando una plantilla de chat "think-HISTORY" que conserva los razonamientos completos de turnos anteriores. No se aplicó RLHF ni DPO; el único ajuste posterior es el SFT mencionado.

## Capacidades

- Generación de texto con razonamiento explícito: el modelo abre con un bloque de razonamiento ("think") y lo cierra con ` response` antes de la respuesta final, siguiendo la plantilla de chat integrada.
- Razonamiento multi-paso y resolución de problemas en STEM: entrenado con datos de programación competitiva, ciencia y matemáticas.
- Soporte de tool calling y uso agéntico: incluido en el SFT, aunque no se detallan herramientas específicas.
- Chat conversacional multi-turno con historial de razonamiento: conserva los razonamientos de turnos anteriores del asistente.
- Capacidades multilingües limitadas: solo inglés declarado.
- Sin capacidades de visión ni audio: es un modelo de texto puro.

## Casos de uso

- Investigación en alineación de IA: sirve como baseline sin filtrar para estudiar cómo el filtrado de datos de preentrenamiento afecta a capacidades y comportamientos. Los investigadores pueden comparar este modelo con sus contrapartes filtradas (publicadas como releases hermanas) para aislar el efecto del filtrado.
- Evaluación de seguridad y detección de sesgos: al ser un artefacto sin post-entrenamiento de seguridad, permite medir sesgos y comportamientos problemáticos que podrían quedar enmascarados por el alineamiento posterior.
- Estudio de dinámicas de preentrenamiento: los checkpoints intermedios (20 en total) permiten analizar la evolución de la pérdida, la emergencia de capacidades y la estabilidad numérica (cero iteraciones NaN) a lo largo del currículo.
- Generación de código y razonamiento matemático en entornos de investigación: aunque no es para producción, puede usarse para probar hipótesis sobre el impacto de la mezcla de datos en tareas de programación y matemáticas.
- Desarrollo de técnicas de SFT temprano (warm-start SFT): el modelo demuestra un enfoque de SFT con datos de razonamiento y plantilla "think", útil para experimentos sobre cuándo y cómo aplicar supervisión.
- Benchmarking de arquitecturas híbridas Mamba2 + MoE: permite comparar el rendimiento de esta arquitectura frente a transformers puros en condiciones controladas de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica una verificación de coherencia en el momento del lanzamiento (8/8 generaciones estructuradas, sin señales de degeneración, bloques de razonamiento bien formados). Las evaluaciones completas de capacidades y alineación están en curso, pero no hay datos numéricos públicos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos completos en BF16 ocupan aproximadamente 63 GB (31.577.937.344 parámetros × 2 bytes). Con cuantización a 4 bits (no oficial) cabría en ~16 GB, pero no se ofrecen versiones cuantizadas.
- GPU recomendadas: para BF16 sin cuantizar se necesitan GPUs con al menos 80 GB de VRAM (A100 80GB, H100 80GB, GH200). Con cuantización 8-bit (no oficial) podría caber en 32 GB (A6000, RTX 6000 Ada), y con 4-bit en 24 GB (RTX 4090, RTX 3090), pero no hay archivos GGUF ni AWQ publicados.
- Opciones de despliegue: al ser un modelo de HuggingFace con safetensors, puede cargarse con Transformers (usando `trust_remote_code=True`). Para inferencia de alto rendimiento se podría usar vLLM o TGI si soportan la arquitectura Nemotron 3 Nano, aunque no está confirmado. También es posible usar llama.cpp si se convierte a GGUF, pero no hay conversión oficial.
- Latencia y throughput: no se proporcionan datos. Al ser un MoE con ~3B activos, la latencia por token debería ser menor que la de un modelo denso de 30B, pero depende del hardware y del número de expertos activos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. A nivel arquitectónico, se puede comparar con otros MoE de tamaño similar:

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia |
|---|---|---|---|---|
| control-pretrain-30b-baseline-sft | 31.6B | ~3B | 32.768 (entrenamiento) | nvidia-open-model-license |
| Mixtral 8x7B | 46.7B | 12.9B | 32.768 | Apache 2.0 |
| Qwen2-57B-A14B | 57.4B | 14.2B | 32.768 | Apache 2.0 |

La comparativa es solo estructural; no hay benchmarks publicados para el modelo de Geodesic. Además, este modelo es un artefacto de investigación sin post-entrenamiento de seguridad, mientras que los otros están orientados a producción.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un asistente de producción: no tiene post-entrenamiento de seguridad más allá del SFT, por lo que puede generar contenido dañino, sesgado o inapropiado.
- Sesgos conocidos: al entrenarse con datos en inglés y mezclas específicas (ClimbMix, Zyda-2, discurso de seguridad de IA), puede reflejar sesgos de esos corpus. No se han realizado evaluaciones de sesgo.
- Riesgo de alucinación: sin alineamiento adicional, la probabilidad de respuestas inventadas o incorrectas es alta, especialmente en dominios fuera de los datos de entrenamiento.
- Limitaciones de contexto: aunque se entrenó con secuencias de 32.768, no se especifica si la ventana de contexto máxima es mayor o si hay degradación más allá de ese valor.
- Restricciones de licencia: la licencia nvidia-open-model-license permite uso comercial, pero el modelo se publica como investigación y no se recomienda su uso en producción sin evaluación adicional.
- Dependencia de código remoto: requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar código del repositorio.
- Sin cuantizaciones oficiales: solo se distribuye en BF16, lo que limita su despliegue en hardware de consumo sin conversión manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/geodesic-research/control-pretrain-30b-baseline-sft
- Checkpoints Megatron: https://huggingface.co/geodesic-research/control-pretrain-30b-baseline-ckpts
- Organización Geodesic Research: http://geodesicresearch.ai/
- GitHub de Geodesic Research: https://github.com/GeodesicResearch
- Dataset de SFT (referenciado): https://huggingface.co/datasets/geodesic-research/pa-warm-start-sft-heavy-25b-mix (no verificado en la búsqueda, pero mencionado en la model card)
