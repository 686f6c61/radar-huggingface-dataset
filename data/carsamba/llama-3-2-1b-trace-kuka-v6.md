# Carsamba/Llama-3.2-1B-Trace-KUKA-v6

## Resumen

Llama-3.2-1B-Trace-KUKA-v6 es un adaptador experimental publicado por el usuario Carsamba dentro del ecosistema OpenTSLM, una línea de trabajo que acopla modelos de lenguaje con codificadores de series temporales. No se trata de un modelo completo ni de un Transformers autocontenido: el repositorio contiene únicamente el estado del encoder de series temporales, el proyector y un adaptador LoRA de rango 16 que se montan sobre el backbone meta-llama/Llama-3.2-1B mediante la arquitectura OpenTSLM SoftPrompt. El propio autor lo etiqueta como experimental y aclara que no fue promocionado a producción.

El problema que aborda es la observabilidad retrospectiva de telemetría robótica: el adaptador consume siete canales canónicos de par articular (`joint_1` a `joint_7`) en ventanas de 1.024 muestras contiguas a 1 kHz (1,024 segundos) y produce respuestas conversacionales con un contrato `rationale_then_answer` sobre siete intenciones predefinidas. Su relevancia es acotada y deliberada: se publica para reproducir la auditoría de observabilidad de entrenamiento Trace V6 y para documentar el comportamiento de selección de checkpoints, no como sustituto del checkpoint V4 promocionado para la demo.

El checkpoint retenido se eligió por pérdida de validación con teacher forcing en el paso 3.600, aunque el mejor comportamiento decodificado se observó alrededor del paso 3.000. El autor indica que ningún checkpoint decodificado superó todas las puertas predeclaradas de esquema, contacto y semántica, por lo que no se conservó ningún `best_grounding_model.pt`. El repositorio ocupa 0,1 GB y acumula 0 descargas y 0 «likes» en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OpenTSLM SoftPrompt con LoRA habilitado: encoder de series temporales, proyector y adaptador LoRA de rango 16 sobre Llama 3.2 1B |
| Parametros totales | no disponible (el repositorio no incluye los pesos del backbone; el modelo base es meta-llama/Llama-3.2-1B y el artefacto distribuido pesa 0,1 GB) |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no disponible para el backbone; la ventana de entrada de series temporales es de 1.024 muestras contiguas por canal a 1 kHz, interpretadas como intervalo semiabierto `[start, end)` de 1,024 segundos |
| Tipos de cuantizacion | no disponible (solo se publica el diccionario de tensores PyTorch; no hay versiones cuantizadas) |
| Idiomas soportados | no disponible (la model card no declara idiomas; los canales de telemetria no son texto) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | PyTorch: diccionario de tensores en `adapter.pt`, inspeccionable con `torch.load(..., weights_only=True)`; sin safetensors ni GGUF |

Metadatos adicionales del artefacto:

| Elemento | Valor |
|---|---|
| Archivo del adaptador | `adapter.pt` |
| SHA-256 del adaptador | `7c69114d54132dd2641d59a54dc97d435ab7c578dfb320831485871012f83f62` |
| Claves del diccionario | `encoder_state`, `projector_state`, `lora_enabled`, `lora_state` |
| Paso retenido | 3.600 (mejor perdida de validacion con teacher forcing) |
| Modelo base | `meta-llama/Llama-3.2-1B` |
| Revision del modelo base | `4e20de362430cd3b72f300e6b0f18e50e7166e08` |
| SHA-256 de los pesos base | `68a2e4be76fa709455a60272fba8e512c02d81c46e6c671cc9449e374fd6809a` |
| Arranque en caliente | `OpenTSLM/llama-3.2-1b-har-sp` |
| Revision del arranque en caliente | `1dbeb1c1013deaca6a36bc3c92016a93a7c588a9` |
| Revision del codigo OpenTSLM | `2968f4b891baab4307f7e9d0043e87677b593a30` |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un acoplamiento tipo soft prompt entre un codificador de series temporales y un LLM. La entrada se normaliza con estadísticas robustas calculadas solo sobre el conjunto de entrenamiento y se proyecta al espacio de embeddings del backbone Llama 3.2 1B, sobre el que se aplica un adaptador LoRA de rango 16. El artefacto no incluye el backbone, el tokenizador, el dataset de origen ni un modelo Transformers independiente: solo los estados `encoder_state`, `projector_state`, `lora_enabled` y `lora_state` que el runtime fijado de OpenTSLM necesita para reconstruir el modelo. Cualquier uso exige obtener aparte el backbone Llama 3.2 1B, que está sujeto a acceso restringido, y aceptar sus términos.

El contrato de entrada es estricto: siete canales canónicos de par articular externo, exactamente 1.024 muestras contiguas por canal a 1 kHz, normalización robusta train-only y ventanas semiabiertas. Los marcadores de eventos del publicador no son entradas del modelo. El entrenamiento cubre siete intenciones conversacionales bajo un contrato `rationale_then_answer`; el autor subraya que tanto las justificaciones como las respuestas son predicciones generadas y no mediciones deterministas ni explicaciones causales fieles del cómputo interno. No se documentan en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF o DPO. El warm start procede de `OpenTSLM/llama-3.2-1b-har-sp`, publicado bajo licencia MIT.

## Capacidades

- Generación de texto conversacional condicionada a telemetría: produce respuestas y justificaciones para siete intenciones predefinidas sobre ventanas de par articular.
- Razonamiento estructurado con contrato `rationale_then_answer`: primero emite una justificación y después la respuesta, con validez de esquema medible.
- Codificación de series temporales multivariantes: siete canales simultáneos, 1.024 muestras por canal, 1 kHz, con normalización robusta fijada en entrenamiento.
- Atribución de articulación: identifica la articulación más relevante de la ventana (precisión de 0,563 en el panel de validación).
- Clasificación semántica de intención: macro-F1 de 0,915 en el panel de validación declarado.
- Sensibilidad a la señal de telemetría: un canario de señal cero cambió el 75 % de las predicciones.
- No dispone de tool calling, function calling, capacidades de agente multietapa, visión, audio ni modo de pensamiento explícito según la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Reproducción de auditorías de entrenamiento: cargar `adapter.pt` con el runtime Trace y la revisión fijada de OpenTSLM para reproducir el comportamiento de selección del checkpoint en el paso 3.600 y verificar el SHA-256, tal como pretende el propio autor.
- Análisis retrospectivo de incidentes en celda robotizada: dado un registro de pares articulares de una plataforma KUKA, generar una descripción de intención y una justificación asociada para apoyar el post-mortem. El modelo está pensado para observabilidad retrospectiva, no para control en tiempo real.
- Investigación en acoplamiento LLM–serie temporal: servir de base para experimentos de soft prompting y LoRA de rango 16 aplicados a dominios industriales, comparando con el warm start `OpenTSLM/llama-3.2-1b-har-sp`.
- Ablaciones de robustez de canal: usar el canario de señal cero y la permutación de canales (precisión de 0,583) como pruebas de sensibilidad para estudiar qué aprende realmente el proyector sobre la telemetría.
- Asistencia a la anotación de ventanas: preetiquetar ventanas de 1,024 segundos con una intención y una justificación que después revise un humano, aceptando tasas de validez de esquema del 0,798 en primera pasada y 0,905 tras reintento.
- Docencia y divulgación técnica: ilustrar con un artefacto real los límites de los adaptadores experimentales, la diferencia entre pérdida de validación y comportamiento decodificado, y la necesidad de puertas predeclaradas.
- Estudio de contratos de salida estructurada: emplear el esquema `rationale_then_answer` como banco de pruebas para validadores de JSON/esquema en pipelines de evaluación (precisión de articulación más fuerte de solo 0,563).
- Verificación de integración de runtimes: comprobar que un pipeline que carga estados PyTorch con `weights_only=True` y revisiones fijadas reproduce resultados de forma determinista entre máquinas.

## Benchmarks y rendimiento

El autor publica un diagnóstico sobre un panel de validación de 84 filas que fue inspeccionado repetidamente durante el entrenamiento y que, en sus propias palabras, no constituye un benchmark held-out. No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, HumanEval) en la información disponible.

| Metrica (panel de validacion de 84 filas, no held-out) | Resultado final V6 |
|---|---:|
| Macro-F1 semantico | 0,915 |
| Precision de articulacion mas fuerte | 0,563 |
| Validez de esquema en primera pasada | 0,798 |
| Validez de esquema tras reintento | 0,905 |
| Cobertura de justificacion | 0,714 |

Diagnósticos adicionales declarados: el canario de señal cero modificó el 75 % de las predicciones, mientras que la precisión ante permutación de canales fue de 0,583. El autor interpreta estos resultados como evidencia de sensibilidad a la telemetría, no de equivarianza fiable, seguridad, causalidad ni generalización.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones orientativas, no publicadas por el autor): el adaptador ocupa 0,1 GB y el backbone Llama 3.2 1B añade aproximadamente 2,5 GB en fp16, 1,2 GB en int8 y 0,8 GB en 4 bits, más el estado del encoder y del proyector para ventanas de 7 × 1.024 muestras.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM debería bastar para el conjunto adaptador más backbone en fp16; una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090 son suficientes. Para lotes grandes de ventanas conviene una A100 o H100, aunque el tamaño del modelo hace que no sean necesarias.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier tarjeta con 8-12 GB de VRAM, siempre que se disponga del backbone autorizado.
- Opciones de despliegue: no es un modelo Transformers autónomo, por lo que vLLM, llama.cpp, Ollama o TGI no pueden cargarlo directamente. El único camino documentado es el runtime de inferencia Trace junto con la revisión fijada de OpenTSLM (`2968f4b891baab4307f7e9d0043e87677b593a30`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Carsamba/Llama-3.2-1B-Trace-KUKA-v6 | Backbone ~1B mas adaptador de 0,1 GB | Ventana de series de 1.024 muestras | Macro-F1 semantico 0,915 en panel de validacion no held-out | Llama 3.2 Community License | Adaptador publico; requiere backbone con acceso autorizado |
| meta-llama/Llama-3.2-1B | ~1B (segun denominacion del modelo base) | no disponible en la informacion proporcionada | No evaluado en tareas de series temporales | Llama 3.2 Community License | Publico con acceso aprobado |
| OpenTSLM/llama-3.2-1b-har-sp | Backbone ~1B mas soft prompt | no disponible en la informacion proporcionada | no disponible | MIT | Publico; usado como warm start de este adaptador |

No se dispone de comparativas con otros adaptadores de series temporales para robótica en la información proporcionada, ni de cifras comunes de evaluación entre estos tres artefactos.

## Limitaciones y advertencias

- Carácter experimental explícito: el autor indica que el checkpoint no fue promocionado y que se publica únicamente para reproducibilidad de la auditoría Trace V6, no como sustituto del checkpoint V4 para la demo.
- Ningún checkpoint decodificado superó todas las puertas predeclaradas de esquema, contacto y semántica; por eso no existe un `best_grounding_model.pt` en el repositorio.
- El panel de validación de 84 filas se inspeccionó repetidamente durante el entrenamiento: no es un conjunto held-out y sus métricas no deben interpretarse como rendimiento generalizable.
- El repositorio no contiene el backbone, el tokenizador, el dataset de origen ni un modelo Transformers independiente; sin el runtime y la revisión fijada de OpenTSLM el artefacto es inservible.
- La normalización es train-only y específica de este entrenamiento: aplicarla mal o usar otras estadísticas invalida el contrato de entrada.
- Sesgo de plataforma y de montaje: el dataset cubre una única plataforma KUKA con experimentos controlados, y la clase de evento está confundida por el implemento de interacción. No es un modelo verificado para transferencia entre robots.
- La precisión de articulación más fuerte es de 0,563 y la validez de esquema en primera pasada de 0,798, lo que obliga a reintentos y revisión humana en cualquier flujo automatizado.
- La sensibilidad a la telemetría (75 % de cambios con señal cero) no implica equivarianza: la precisión ante permutación de canales es de solo 0,583.
- Las justificaciones generadas no son explicaciones causales fieles ni mediciones deterministas; el autor lo advierte de forma explícita.
- Usos prohibidos por diseño: no es un detector de colisión en vivo, ni un controlador de seguridad, ni un sistema de diagnóstico causal, ni un localizador exacto de contacto.
- Licencia: el adaptador se distribuye bajo la Llama 3.2 Community License al adaptar Llama 3.2, con `LICENSE.txt`, `USE_POLICY.md` y `NOTICE` adjuntos. El uso comercial está sujeto a los términos de dicha licencia. El warm start OpenTSLM es MIT y la telemetría KUKA de origen es CC BY 4.0, aunque los bytes del dataset no se incluyen aquí.
- Riesgo de alucinación: no evaluado de forma específica en la información disponible, pero la naturaleza generativa de justificaciones y respuestas implica predicciones no verificadas.
- Idiomas soportados: no declarados; no hay evidencia de capacidades multilingües.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Carsamba/Llama-3.2-1B-Trace-KUKA-v6
- Auditoría de validación V6 (documentación del autor): https://github.com/ukafkasyali/ysamet/blob/main/docs/submission/evaluation/v6-validation/README.md
- Runtime de inferencia Trace: https://github.com/ukafkasyali/ysamet/tree/main/inference
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Modelo de arranque en caliente (OpenTSLM): https://huggingface.co/OpenTSLM/llama-3.2-1b-har-sp
- Cita del trabajo OpenTSLM: Langer, Patrick y otros, «OpenTSLM: Time-Series Language Models for Reasoning over Multivariate Medical Text- and Time-Series Data», 2025, DOI 10.13140/RG.2.2.14827.60963
- La búsqueda web realizada no devolvió ningún resultado relevante para este modelo: los enlaces recuperados corresponden a foros sobre controladores de escáneres y no guardan relación con el artefacto.
