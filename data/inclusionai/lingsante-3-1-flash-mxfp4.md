# inclusionAI/LingSante-3.1-flash-MXFP4

## Resumen

LingSante-3.1-flash-MXFP4 es una versión cuantizada del modelo médico de pesos abiertos LingSante-3.1-flash, desarrollado por inclusionAI (equipo vinculado a Ant Group). Se trata de un modelo de mezcla de expertos (MoE) de arquitectura híbrida lineal orientado a razonamiento médico complejo, comunicación sanitaria profesional, investigación basada en evidencia y tareas médicas de horizonte largo. La relevancia de esta release concreta reside en su formato de pesos mixto MXFP4/FP8/BF16, que reduce el peso del checkpoint a unos 313 GB frente a los aproximadamente 560.000 millones de parámetros del modelo principal.

El modelo activa unos 25.000 millones de parámetros por token y configura una ventana de contexto de 262.144 tokens, lo que lo sitúa en la categoría de modelos de contexto largo con activación eficiente. La cuantización se ha aplicado únicamente a los expertos enrutados mediante RTN (round-to-nearest) sin calibración, manteniendo en FP8, BF16 o FP32 los módulos densos, de atención, KDA, embeddings, router y cabeza de salida.

Es importante subrayar que la model card declara explícitamente que el modelo está destinado a investigación y evaluación, y que no es un dispositivo médico ni debe usarse como base independiente para diagnóstico, prescripción o tratamiento. Los resultados de benchmarks publicados corresponden al modelo fuente, no al checkpoint cuantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida lineal (KDA + Gated MLA), transformer con capas de atención lineal y MLA |
| Parametros totales | Aproximadamente 560B en el modelo principal (294.289.983.808 parámetros reportados en safetensors del checkpoint cuantizado) |
| Parametros activos | Aproximadamente 25B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | MXFP4 (E2M1, grupo 32, escalas E8M0 compartidas) en expertos enrutados; FP8 E4M3 (bloques 128x128) en MLP densa, shared-expert, KDA y matrices de atención; BF16 en embeddings, lm_head, router, norms, MLA g_proj, KDA b_proj y convoluciones, MTP eh_proj; FP32 en KDA A_log, dt_bias y router expert_bias |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato mixto MXFP4/FP8/BF16/FP32) |

## Arquitectura y entrenamiento

LingSante-3.1-flash-MXFP4 hereda la arquitectura del modelo fuente LingSante-3.1-flash: un MoE híbrido lineal con 63 capas KDA (atención lineal) y 9 capas Gated MLA en proporción 7:1, una capa de predicción MTP (multi-token prediction), 4 capas densas, 512 expertos enrutados más 1 experto compartido, activando 8 expertos enrutados por token. La dimensión oculta es de 4096, con tamaño intermedio de experto de 1280, tamaño intermedio denso de 10240, 64 cabezas de atención y vocabulario de 157.184 tokens.

El entrenamiento del modelo fuente combina datos generales y médicos a lo largo de pretraining, mid-training y supervised fine-tuning, con un marco de alineación evidencia-razonamiento médico, un marco de tareas médicas de horizonte largo con entornos interactivos y verificación estructurada, y un marco de alineación de comportamiento profesional sanitario. En post-entrenamiento se aplica reinforcement learning y destilación on-policy multi-profesor. La cuantización de esta release es RTN sin entrenamiento adicional ni calibración, aplicada solo a los expertos enrutados (gate_proj, up_proj, down_proj).

## Capacidades

- Razonamiento médico complejo: identificación de factores clave en decisiones clínicas, validación de evidencia y resolución de conflictos entre fuentes.
- Tareas médicas de horizonte largo: ejecución de flujos de trabajo interconectados con coordinación de herramientas y adaptación de planes ante información nueva.
- Alineación de comportamiento profesional sanitario: respuestas contextualizadas, profesionales y accionables ante información incompleta.
- Investigación profunda basada en evidencia (deep research).
- Uso de herramientas (tool calling) en entornos médicos estructurados.
- Capacidades generales mantenidas por los datos generales del entrenamiento: razonamiento, código, búsqueda y uso de herramientas.
- Predicción multi-token (MTP) mediante una capa dedicada, útil para decodificación especulativa.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Apoyo a la documentación clínica: el modelo puede resumir historiales y notas médicas extensas aprovechando su ventana de 262.144 tokens, consolidando información de múltiples episodios en un único documento estructurado.
- Investigación biomédica asistida: búsqueda y síntesis de evidencia a partir de literatura y guías clínicas, con validación explícita de fuentes y resolución de conflictos entre ellas, gracias al marco de alineación evidencia-razonamiento.
- Triaje y orientación no diagnóstica en entornos de investigación: generación de preguntas de seguimiento ante información incompleta del paciente, alineadas con estándares de comunicación profesional sanitaria.
- Simulación de flujos clínicos para evaluación: ejecución de tareas médicas de horizonte largo en entornos interactivos con verificación estructurada, útil para validar agentes antes de desplegarlos.
- Formación y evaluación de personal sanitario: generación de casos clínicos, preguntas de razonamiento y respuestas razonadas con trazabilidad de evidencia.
- Procesamiento de literatura médica a gran escala: extracción y comparación de resultados entre artículos dentro de una sola ventana de contexto, reduciendo la pérdida de información entre fragmentos.
- Asistencia a la codificación de pipelines de datos clínicos: uso de capacidades de código y tool calling para construir y validar transformaciones de datos, siempre bajo supervisión humana.

## Benchmarks y rendimiento

La model card incluye una figura con resultados de benchmarks del modelo fuente LingSante-3.1-flash, pero los valores numéricos no están disponibles en la información proporcionada. Los resultados publicados corresponden al modelo fuente y no al checkpoint cuantizado MXFP4.

No se han publicado resultados de benchmarks en la información disponible para el checkpoint cuantizado.

## Requisitos de hardware

- VRAM estimada: el checkpoint completo ocupa 291,72 GiB (313,23 GB), por lo que la inferencia requiere un entorno multi-GPU de alta capacidad.
- Despliegue recomendado por el autor: 4 x NVIDIA H20-3e con TP4 / EP4 / DP1.
- Precisión de activación de expertos configurable en serving: Humming W4A8 (FP8 E4M3, grupo 32) o W4A16 (BF16).
- No cabe en GPU de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola GPU convencional.
- Opciones de despliegue: el modelo requiere código personalizado (tag custom_code) y el stack de serving indicado por el autor (Humming); no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría con datos verificables de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- El modelo no es un dispositivo médico y no debe usarse como base independiente para diagnóstico, prescripción o tratamiento.
- Destinado exclusivamente a investigación y evaluación según la model card.
- Los benchmarks publicados corresponden al modelo fuente, no al checkpoint cuantizado; el impacto de la cuantización MXFP4 en calidad no está medido en la información disponible.
- Idiomas soportados no especificados; el rendimiento fuera del inglés (y del chino, presumiblemente por el origen del equipo, aunque no confirmado) es incierto.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente crítico en dominio médico.
- Sesgos conocidos: no disponibles en la información proporcionada.
- La licencia MIT permite uso comercial, pero las advertencias médicas de la model card limitan el uso responsable en producción sanitaria.
- Requiere hardware especializado (4 x H20-3e) y código personalizado, lo que complica el despliegue estándar.
- El tamaño del repositorio (313,2 GB) implica costes de almacenamiento y transferencia considerables.

## Enlaces

- Hugging Face: https://huggingface.co/inclusionAI/LingSante-3.1-flash-MXFP4
- ModelScope: https://www.modelscope.cn/models/inclusionAI/LingSante-3.1-flash-MXFP4
- Modelo fuente: https://huggingface.co/inclusionAI/LingSante-3.1-flash
