# RicardoEstep/RPBizkit-Gemma4-v1-26B-A4B-GGUF

## Resumen

RPBizkit-Gemma4-v1-26B-A4B-GGUF es una conversión al formato GGUF del modelo RPBizkit-Gemma4-v1-26B-A4B, publicada por el usuario RicardoEstep. Se trata de un modelo resultante de un proceso de fusión (merge) de modelos, generado con la herramienta ht-mergekit, y posteriormente convertido a GGUF mediante llama.cpp en un equipo local. El nombre sugiere una base Gemma con arquitectura MoE (26B totales, 4B activos), aunque no se confirma en la información disponible.

El modelo se distribuye principalmente para su uso con llama.cpp y kobold.cpp, lo que indica un enfoque hacia inferencia local en hardware de consumo. No se han publicado detalles sobre el proceso de entrenamiento, los datos utilizados ni las capacidades específicas. La model card es extremadamente escueta y se limita a indicar el origen de la conversión y las herramientas compatibles.

La relevancia de esta ficha es limitada: no hay benchmarks, no se especifica licencia, no se detallan idiomas y el número de descargas es cero. Se trata de un modelo experimental de un autor individual, sin validación externa ni documentación técnica sustancial. A continuación se presenta toda la información disponible, indicando explícitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre sugiere base Gemma con posible MoE, sin confirmar) |
| Parametros totales | 26B (según el nombre del modelo, no confirmado en la model card) |
| Parametros activos | 4B (según el nombre del modelo, no confirmado; solo aplicable si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (formato GGUF, niveles concretos no especificados) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (conversión desde safetensors del modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. El tag `ht-mergekit` indica que se trata de una fusión de modelos realizada con mergekit, una herramienta para combinar pesos de modelos existentes. El nombre "Gemma4" sugiere una base de la familia Gemma, y "26B-A4B" sugiere una arquitectura de mezcla de expertos (MoE) con 26 mil millones de parámetros totales y 4 mil millones activos, pero estos datos no están confirmados en la model card.

No se especifican los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO. La conversión a GGUF se realizó con llama.cpp en un equipo local, sin más detalles técnicos. No se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto: capacidad inferida por el formato y la base Gemma, pero no documentada.
- Razonamiento y código: no disponible.
- Matemáticas: no disponible.
- Visión: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking: no disponible.
- Otras capacidades especiales: no disponible.

No se ha publicado ninguna lista de capacidades en la información proporcionada.

## Casos de uso

- Inferencia local con llama.cpp: el modelo está empaquetado en GGUF y la model card indica su uso con llama.cpp o kobold.cpp, por lo que el caso principal es la ejecución en local sobre CPU o GPU de consumo.
- Experimentación con modelos fusionados: al ser un merge con mergekit, puede interesar a investigadores que estudien el efecto de fusiones de pesos en el comportamiento del modelo.
- Pruebas de compatibilidad con kobold.cpp: la mención explícita a kobold.cpp sugiere su uso en entornos de escritura creativa o generación de texto interactiva, aunque no se detallan capacidades.
- Evaluación comparativa de merges: puede servir como punto de partida para comparar el rendimiento de fusiones frente a los modelos originales, siempre que se realicen evaluaciones propias.
- Despliegue en entornos con recursos limitados: si se confirma la arquitectura MoE con 4B activos, podría ejecutarse en GPUs de consumo, pero no hay datos de VRAM ni latencia.
- Investigación sobre modelos no filtrados: el tag `not-for-all-audiences` indica que el modelo puede generar contenido no apto para todos los públicos, por lo que su uso en investigación sobre filtrado y seguridad es posible, con las debidas precauciones.

No se pueden detallar más casos concretos sin información sobre las capacidades reales del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Si se confirma la arquitectura MoE de 26B totales y 4B activos, una cuantización Q4_K_M podría requerir del orden de 15-18 GB de VRAM, pero es una estimación no verificada.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No disponible. Con 26B totales, en cuantizaciones bajas podría caber en GPUs de 24 GB (RTX 3090/4090) si la arquitectura MoE permite cargar solo los expertos activos, pero no hay confirmación.
- Opciones de despliegue: llama.cpp y kobold.cpp (mencionados en la model card). No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables de la misma categoría, ni de datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un merge de modelos, puede heredar sesgos de los modelos originales, pero no se especifican.
- Riesgo de alucinación: no evaluado. No hay benchmarks ni evaluaciones de fidelidad.
- Limitaciones de contexto o idioma: no disponible. Se desconoce la longitud de contexto y los idiomas soportados.
- Restricciones de licencia: la licencia no está disponible, lo que impide determinar si se permite uso comercial. El tag `not-for-all-audiences` sugiere contenido potencialmente sensible, pero no es una restricción legal.
- Caveats para producción: modelo sin documentación técnica, sin benchmarks, sin garantías de calidad y con cero descargas. No se recomienda su uso en producción sin una evaluación exhaustiva previa. La conversión GGUF se realizó en un equipo local sin validación publicada.
- El modelo base tiene el tag `not-for-all-audiences`, lo que indica que puede generar contenido no apto para todos los públicos; se debe aplicar filtrado si se usa en aplicaciones abiertas.

## Enlaces

- [Hugging Face: RicardoEstep/RPBizkit-Gemma4-v1-26B-A4B-GGUF](https://huggingface.co/RicardoEstep/RPBizkit-Gemma4-v1-26B-A4B-GGUF)
- [Modelo base: RicardoEstep/RPBizkit-Gemma4-v1-26B-A4B](https://huggingface.co/RicardoEstep/RPBizkit-Gemma4-v1-26B-A4B)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
