# myk1019/zils-d3-lite-b6

## Resumen

zils-d3-lite-b6 es un fine-tune publicado por el usuario myk1019 sobre el denominado "d3-lite soup", una mezcla de los modelos Charlie320/zils-lite-v9a y qhoenix/zils-lite-decision-v9, ambos derivados de Qwen3.5 y con licencia Apache-2.0. El modelo se entrena sobre mezclas por grupo de preguntas de las respuestas del propio soup y de las respuestas del profesor vllm-sr/d3-mini, usando datos de decisión públicos del split de entrenamiento, conversaciones de function calling de Glaive y respuestas del profesor Zils Relay. El resultado es un checkpoint de aproximadamente 853 millones de parámetros (852.985.920 según los pesos en safetensors) empaquetado en un repositorio de 1,7 GB.

Se trata de un modelo de nicho, orientado a tareas de decisión y function calling, más que a un asistente generalista. La model card es extremadamente escueta: no documenta arquitectura interna, longitud de contexto, idiomas, composición exacta del dataset ni resultados de evaluación. La información disponible se limita a la licencia (Apache-2.0), la etiqueta de arquitectura (`qwen3_5`), el uso de código personalizado (`custom_code`, lo que implica que requiere `trust_remote_code=True` para cargarse) y el recuento de parámetros.

Su relevancia es limitada y muy específica: sirve como referencia para quien quiera reproducir o inspeccionar técnicas de destilación y mezcla (model soup + destilación de profesor) sobre la familia Qwen3.5 en un tamaño pequeño, apto para experimentación en hardware de consumo. No cuenta con descargas ni likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 (etiqueta `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 852.985.920 (aprox. 853 M) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura no está documentada en la model card. La etiqueta `qwen3_5` y la mención explícita a "Qwen3.5-derived weights" indican que el checkpoint parte de la familia Qwen3.5, pero se desconoce si se trata de un transformer denso convencional, de una variante con atención lineal o de otra modificación. El tamaño (853 M de parámetros) sugiere un modelo pequeño, probablemente en la gama de los modelos "lite" de la familia, aunque no se confirma la configuración de capas, cabezas ni dimensión oculta.

El proceso de entrenamiento descrito es una destilación con mezcla de profesores: se parte de un "soup" (promedio de pesos) de dos fine-tunes previos, Charlie320/zils-lite-v9a y qhoenix/zils-lite-decision-v9, y se afina sobre mezclas por grupo de preguntas de tres fuentes: (1) las respuestas del propio soup, (2) las respuestas del profesor vllm-sr/d3-mini sobre datos de decisión públicos del split de entrenamiento, y (3) conversaciones de function calling de Glaive junto con respuestas del profesor Zils Relay. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, la presencia de RLHF/DPO ni hiperparámetros. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados de la base Qwen3.5, aunque sin evaluación publicada que lo confirme.
- Function calling y tool calling: el entrenamiento incluye conversaciones de Glaive específicamente orientadas a llamadas a funciones, lo que sugiere soporte para este tipo de tareas.
- Tareas de decisión: el nombre "decision" en los modelos base y el uso de datos de decisión del split de entrenamiento apuntan a un ajuste orientado a elegir entre opciones o emitir juicios estructurados.
- Capacidades multilingües: no documentadas; no disponible.
- Modo "thinking" o razonamiento extendido: no documentado.
- Visión, audio u otras modalidades: no documentadas; el modelo es presumiblemente solo texto.
- Soporte de agentes multi-paso: no confirmado explícitamente, aunque el entrenamiento con function calling es un indicio parcial.

## Casos de uso

- Clasificación y decisión estructurada: el modelo se entrenó con datos de decisión y respuestas de un profesor especializado, por lo que puede usarse para tareas de enrutamiento o selección entre opciones en pipelines internos, siempre con validación previa dado que no hay benchmarks.
- Function calling en asistentes ligeros: gracias al entrenamiento con conversaciones de Glaive, puede integrarse en un agente que traduzca lenguaje natural a llamadas de API en entornos con recursos limitados.
- Prototipado de agentes en hardware de consumo: con 853 M de parámetros, es viable ejecutarlo en una GPU consumer para experimentar con flujos de tool calling antes de escalar a modelos mayores.
- Destilación y experimentación académica: sirve como caso de estudio de mezcla de pesos (model soup) combinada con destilación de profesores, útil para investigadores que quieran reproducir la técnica.
- Generación de texto auxiliar en aplicaciones de bajo coste: resúmenes, respuestas cortas o reescritura en entornos donde el coste por token es crítico.
- Evaluación comparativa de fine-tunes pequeños: como checkpoint de referencia para medir el efecto de la destilación sobre la base Qwen3.5 en tareas de decisión.
- Filtrado o preetiquetado de datos: puede usarse para generar etiquetas preliminares en un corpus que luego se revise con un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, los 853 M de parámetros ocupan aproximadamente 1,7 GB de pesos, más overhead de activaciones y caché KV; se estiman entre 3 y 4 GB en total. En cuantización de 8 bits, alrededor de 1 GB de pesos; en 4 bits, en torno a 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090, A100, H100). En cuantización 4/8 bits cabe en GPUs integradas o en CPU con suficiente RAM.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs dedicadas recientes, e incluso en algunas integradas con cuantización agresiva.
- Opciones de despliegue: al requerir `custom_code`, es necesario usar `transformers` con `trust_remote_code=True`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; la ausencia de pesos GGUF publicados limita el uso directo en llama.cpp/Ollama sin conversión previa.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-d3-lite-b6 | 853 M | no disponible | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen3.5 base (variante lite) | no disponible | no disponible | Apache-2.0 (según familia) | Hugging Face |
| Charlie320/zils-lite-v9a | no disponible | no disponible | Apache-2.0 | Hugging Face |
| qhoenix/zils-lite-decision-v9 | no disponible | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparables para ninguno de los modelos de la tabla; la comparación se limita a parámetros, licencia y disponibilidad. No se han identificado alternativas de la misma categoría con benchmarks publicados en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, métricas ni validación por la comunidad (0 descargas, 0 likes), por lo que su calidad real es desconocida.
- Model card incompleta: no se documentan contexto, idiomas, composición del dataset ni hiperparámetros, lo que dificulta evaluar su idoneidad para producción.
- Riesgo de alucinación: al ser un modelo pequeño destilado de profesores, es probable que genere respuestas plausibles pero incorrectas, especialmente fuera del dominio de decisión y function calling.
- Dependencia de `custom_code`: requiere ejecutar código remoto (`trust_remote_code=True`), lo que introduce un riesgo de seguridad si no se audita el código del repositorio.
- Sesgos: no documentados; al entrenarse con datos de Glaive y respuestas de profesores, puede heredar sesgos de esas fuentes.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las licencias de los modelos base (Charlie320/zils-lite-v9a, qhoenix/zils-lite-decision-v9) y de los datasets de entrenamiento (Glaive, datos de decisión públicos) antes de desplegarlo en producción.
- Contexto e idiomas desconocidos: no se puede garantizar un rendimiento adecuado en castellano ni en conversaciones de contexto largo.
- Fecha de creación futura (2026-11-12): el repositorio tiene una marca temporal posterior a la fecha habitual de consulta, lo que puede indicar un artefacto de migración o un error de metadatos; conviene verificarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/myk1019/zils-d3-lite-b6
- Modelo base mezclado 1: https://huggingface.co/Charlie320/zils-lite-v9a
- Modelo base mezclado 2: https://huggingface.co/qhoenix/zils-lite-decision-v9
- Profesor de decisión: https://huggingface.co/vllm-sr/d3-mini
- Dataset de function calling Glaive: no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
