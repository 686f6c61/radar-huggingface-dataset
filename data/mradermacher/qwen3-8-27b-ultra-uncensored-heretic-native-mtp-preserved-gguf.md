# mradermacher/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-GGUF

## Resumen

El modelo `Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-GGUF` es una cuantización en formato GGUF del modelo base homónimo creado por `llmfan46`, y posteriormente cuantizado por `mradermacher` para su ejecución eficiente en entornos locales. Se trata de una variante "desensurada" (uncensored, abliterated) de un modelo de 27 320 millones de parámetros, basado presumiblemente en la arquitectura Qwen 3.8, aunque no se dispone de confirmación oficial sobre su arquitectura interna. El nombre indica que incorpora técnicas como *Multi-Token Prediction* (MTP) y un proceso de *abliteration* que elimina los mecanismos de rechazo de contenido del modelo original.

La relevancia de este modelo radica en su naturaleza sin censura, dirigida a investigadores y desarrolladores que necesitan explorar generación de texto sin restricciones temáticas, así como en su disponibilidad en múltiples cuantizaciones GGUF que permiten ejecutarlo en hardware de consumo. Incluye además proyectores multimodales (mmproj) que sugieren capacidades de visión, aunque no se detallan en la documentación disponible. La licencia Apache 2.0 permite uso comercial, aunque el modelo está limitado al idioma inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente Qwen 3.8, sin confirmar) |
| Parametros totales | 27 320 697 856 (27,3 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura interna del modelo base. El nombre sugiere que deriva de la familia Qwen 3.8, pero no hay confirmacion oficial. Se sabe que el modelo ha sido sometido a un proceso de *abliteration* (eliminacion de capas de rechazo) y que incorpora *Multi-Token Prediction* (MTP), una tecnica de entrenamiento que predice multiples tokens simultaneamente para mejorar la velocidad de inferencia. Tampoco se dispone de datos sobre el dataset de entrenamiento, el numero de tokens procesados o el uso de tecnicas como RLHF o DPO. La cuantizacion GGUF fue realizada por `mradermacher` a partir del modelo base en formato safetensors, sin modificacion de los pesos originales.

## Capacidades

- Generacion de texto libre sin filtros de contenido (uncensored, abliterated).
- Soporte multimodal (vision) mediante los proyectores mmproj incluidos, aunque no se especifican las tareas exactas.
- Multi-Token Prediction (MTP) para una generacion potencialmente mas rapida.
- Razonamiento y generacion de codigo, asumiendo las capacidades del modelo base Qwen 3.8 (no confirmado).
- Conversacion multi-turno, segun la etiqueta "conversational".
- No se ha confirmado soporte para tool calling o function calling.

## Casos de uso

- Investigacion en IA: analisis de comportamientos de modelos sin restricciones de contenido, util para estudiar sesgos y alucinaciones en entornos controlados.
- Generacion creativa de texto: escritura de ficcion, poesia o guiones sin limitaciones tematicas, aprovechando la ausencia de filtros.
- Desarrollo de prototipos de chatbots: integracion en aplicaciones de chat locales mediante llama.cpp u Ollama, con cuantizaciones que caben en GPUs de consumo.
- Experimentacion con tecnicas de *abliteration*: comparacion del rendimiento entre el modelo original y esta variante para entender el impacto de la eliminacion de capas de rechazo.
- Evaluacion de MTP: pruebas de velocidad de inferencia en tareas de generacion de texto largo, gracias a la prediccion multiple de tokens.
- Despliegue en entornos sin conexion: uso de cuantizaciones Q4_K_M o Q5_K_M en portatiles con 16-24 GB de VRAM para aplicaciones offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo cuantizado ni para su version base.

## Requisitos de hardware

- VRAM estimada para inferencia: segun la cuantizacion elegida, desde 11 GB (Q2_K) hasta 29 GB (Q8_0). Se recomienda al menos 16 GB para Q4_K_M (16,9 GB) y 32 GB para Q8_0.
- GPUs recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q5_K_M; A100 40 GB o H100 para Q8_0; GPUs con 16 GB (RTX 4080, RTX 3080 Ti) para Q3_K_M o IQ4_XS.
- En consumer GPU: si, con cuantizaciones Q4_K_M o inferiores en GPUs de 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. vLLM no soporta GGUF directamente, pero se puede convertir a safetensors.
- Latencia y throughput: no disponible, aunque MTP podria mejorar la velocidad de generacion en comparacion con modelos similares sin esta tecnica.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de la misma categoria. El modelo base Qwen 3.8 27B no tiene una ficha publica detallada en los resultados de busqueda, y no se han encontrado alternativas directas con caracteristicas equivalentes (uncensored, 27B, GGUF). Se recomienda consultar el repositorio del modelo base para futuras comparaciones.

## Limitaciones y advertencias

- Al ser un modelo "uncensored" y "abliterated", puede generar contenido inapropiado, ofensivo o peligroso sin restricciones. Su uso debe limitarse a entornos de investigacion controlados.
- Riesgo elevado de alucinaciones, especialmente en temas factuales, al no contar con filtros de seguridad.
- Solo soporta ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el blog de orcarouter.ai menciona una "research-only boundary" (limite de solo investigacion), que no es vinculante legalmente pero sugiere una intencion del autor.
- No se dispone de informacion sobre la longitud de contexto, lo que impide conocer los limites de memoria para conversaciones largas.
- La cuantizacion puede degradar ligeramente la calidad del modelo en comparacion con los pesos originales en safetensors.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-GGUF
- Modelo base (llmfan46): https://huggingface.co/llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved
- Version con cuantizacion i1 (imatrix): https://huggingface.co/mradermacher/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-i1-GGUF
- Blog sobre ejecucion local: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Repositorio GitHub sobre el modelo uncensored: https://github.com/Wassimyounes01/qwen38-uncensored
