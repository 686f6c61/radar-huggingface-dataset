# grant-ai/GLM-5.3-Flash-Abliterated-MLX-4bit

## Resumen

GLM-5.3-Flash-Abliterated-MLX-4bit es una cuantización de 4 bits (oQ4e) del modelo GLM-5.3-Flash de Z.ai, tras pasar por un proceso de "abliteration" (eliminación de comportamientos de rechazo) realizado por Blackfrost-Research. El resultado es un modelo multimodal de 320 000 millones de parámetros (con unos 18 000 millones activos por token) que se ejecuta de forma nativa en Apple Silicon mediante la librería oMLX, conservando la torre de visión y el cabezal de predicción multi-token (MTP) para decodificación especulativa.

El modelo está pensado exclusivamente para investigación experimental en seguridad de IA: red-teaming, estudio de alineación, interpretabilidad y análisis de cuantización. Al estar "abliterado", no presenta rechazos de seguridad, por lo que puede cumplir instrucciones dañinas; el autor advierte explícitamente que no debe desplegarse como servicio público ni usarse para fines ilegales. Su relevancia radica en ofrecer una build de alta calidad, con velocidades de decodificación notables (hasta 51 tok/s en ciertos modos) y un contexto de 1 048 576 tokens, todo ello en hardware de Apple.

La arquitectura es un MoE híbrido con 45 capas, combinando atención recurrente (KDA) y atención dispersa (DSA), con 288 expertos de los que se activan 8 más uno compartido. El modelo cuantizado ocupa 173 GiB en disco y requiere unos 190 GiB de memoria residente, por lo que necesita un Mac con al menos 192 GB de RAM unificada (probado en un M3 Ultra de 256 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm5_next: MoE hibrido, 45 capas, KDA (recurrente) + DSA (atencion dispersa) |
| Parametros totales | 51 794 090 846 (cuantizado 4-bit); 320 000 000 000 en el modelo original |
| Parametros activos | ~18 000 000 000 (8 de 288 expertos + 1 compartido) |
| Longitud de contexto | 1 048 576 tokens |
| Tipos de cuantizacion | oQ4e (4-bit mixto con calibracion iMatrix, anchos de bit por tensor) |
| Idiomas soportados | no disponible (el modelo base GLM-5.3-Flash es multilingue, pero esta build no especifica la lista) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es GLM-5.3-Flash de Z.ai, el primer modelo nativamente multimodal de la serie GLM-5. Su arquitectura combina un bloque recurrente (KDA) con atencion dispersa (DSA) en un esquema MoE de 288 expertos, de los cuales se activan 8 mas uno compartido por token, lo que da unos 18 000 millones de parametros activos. Incluye una torre de vision integrada y un cabezal MTP (multi-token prediction) que permite decodificacion especulativa. El entrenamiento original uso "forced thinking" con tres niveles de esfuerzo de razonamiento (low, high, max), y el modelo esta optimizado para tareas de codificacion y agentes.

Sobre esta base, Blackfrost-Research aplico un proceso de "abliteration" (eliminacion de refusal behavior) y publico la version DERISKED-BF16. grant-ai cuantizo esa version a 4 bits usando oMLX con el esquema oQ4e, que asigna anchos de bit por tensor en lugar de un 4-bit uniforme, calibrado con iMatrix. Se conservan tanto la torre de vision como el cabezal MTP, por lo que la build mantiene la entrada de imagenes y la decodificacion especulativa. No se dispone de informacion detallada sobre los datos de entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF/DPO) en la documentacion proporcionada.

## Capacidades

- Generacion de texto, razonamiento, codificacion y matematicas, con un modo de pensamiento forzado de tres niveles (low, high, max) que permite ajustar el esfuerzo de razonamiento.
- Entrada de imagenes (pipeline image-text-to-text) gracias a la torre de vision integrada, lo que permite tareas de comprension visual y multimodal.
- Soporte de tool calling y function calling, validado en un benchmark agentico con un transcript real de 14 mensajes con llamadas a herramientas.
- Capacidad para trabajar en escenarios de agente multi-paso, con gestion de contexto largo (hasta 1 millon de tokens).
- Decodificacion especulativa mediante dos mecanismos: MTP (multi-token prediction) y DFlash2, que aceleran la generacion en hardware Apple Silicon.
- Capacidades multilingues heredadas del modelo base, aunque no se detalla la lista de idiomas en esta build.
- Al estar abliterado, no presenta rechazos de seguridad; responde a cualquier instruccion, incluida las daninas (advertencia del autor).

## Casos de uso

- Investigacion en seguridad de IA (red-teaming): el modelo permite probar comportamientos sin refusals y estudiar como responderia un sistema no alineado ante prompts adversariales, util para disenar contramedidas.
- Estudio de alineacion e interpretabilidad: al eliminar los rechazos, se puede analizar la representacion interna de conceptos de seguridad y como se comporta el modelo sin restricciones, lo que ayuda a entender los mecanismos de alineacion.
- Experimentacion con decodificacion especulativa: la build conserva MTP y DFlash2, permitiendo medir y comparar el rendimiento de estas tecnicas en Apple Silicon con un modelo de 320B.
- Desarrollo de agentes locales con tool calling: con su contexto de 1M tokens y soporte de function calling, puede ejecutarse en un Mac de gama alta para prototipar agentes que gestionen conversaciones largas y llamadas a herramientas.
- Analisis multimodal de documentos: al aceptar imagenes, puede procesar capturas de pantalla, diagramas o graficos junto con texto, util en entornos de investigacion donde se necesita comprension visual.
- Evaluacion de tecnicas de cuantizacion: al ser una build oQ4e con calibracion iMatrix, sirve como caso de estudio para comparar la perdida de calidad frente a la version BF16 y otras cuantizaciones.
- Generacion de codigo con razonamiento extendido: el modo Thinking-High ofrece un equilibrio entre velocidad y calidad, adecuado para tareas de programacion complejas en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los datos proporcionados se centran en el rendimiento de decodificacion medido en un M3 Ultra Mac Studio (256 GB) con oMLX 0.6.3, para dos cargas de trabajo: una corta (continuacion de codigo, 1024 tokens generados) y una larga agentica (transcript de 14 mensajes con tool calling, ~20 400 tokens de contexto, 512 tokens generados).

Velocidad de decodificacion (tok/s):

| Tipo de decodificacion | Carga corta, Thinking-High | Carga corta, Thinking-Max | Carga larga agentica, Thinking-High | Carga larga agentica, Thinking-Max |
|---|---:|---:|---:|---:|
| DFlash2 | 39,3 - 51,2 | 29,5 - 34,8 | 31,9 - 32,8 | 33,4 - 33,6 |
| MTP | 35,3 - 39,7 | 30,4 - 30,9 | 26,7 - 29,6 | 27,6 - 29,4 |
| AR (autoregresivo) | 29,3 - 29,7 | 29,3 - 29,7 | 26,5 - 26,6 | 26,5 - 26,6 |

Tiempo de pared para generar 1024 tokens en contexto corto (rango temp 0 - temp 1):

| Tipo de decodificacion | Thinking-High | Thinking-Max |
|---|---:|---:|
| DFlash2 + parche de cache de prefijo (temp 0) | 21,0 s | 35,4 s |
| DFlash2 (adaptador stock) | 20,8 - 27,5 s | 30,4 - 35,7 s |
| MTP | 26,8 - 30,2 s | 34,2 - 34,8 s |
| AR | 35,8 - 36,0 s | 35,5 - 35,8 s |

Tiempo de pared para generar 512 tokens en contexto largo agentico (rango temp 0 - temp 1):

| Tipo de decodificacion | Estado de cache | Thinking-High | Thinking-Max |
|---|---|---:|---:|
| DFlash2 + parche (temp 0) | caliente | 15,1 s | 15,9 s |
| DFlash2 (stock) | sin cache (prefill completo) | 61,8 - 62,1 s | 61,3 - 61,4 s |
| MTP | caliente | 22,2 - 24,0 s | 22,3 - 23,4 s |
| AR | caliente | 24,1 - 24,8 s | 24,1 - 25,1 s |

Nota: el parche de cache de prefijo solo funciona a temperatura 0; a temperatura 1 no se produce la coincidencia de cache (TTFT de 47,6 s medido). El nivel Thinking-High es el recomendado para la mayoria de casos, ya que Thinking-Max genera aproximadamente el doble de tokens por respuesta sin una mejora significativa de precision (segun pruebas de Z.ai Code Bench v1.0).

## Requisitos de hardware

- VRAM estimada: ~190 GiB residentes al servir el modelo; 173 GiB de descarga en 35 shards.
- GPU recomendada: Apple Silicon con al menos 192 GB de RAM unificada. Probado en un M3 Ultra Mac Studio (256 GB).
- No cabe en GPUs de consumo tipicas (RTX 4090 con 24 GB, etc.); requiere hardware Apple de gama alta.
- Opciones de despliegue: oMLX (libreria nativa), MLX. El modelo funciona de forma autonoma con oMLX estandar sin descargas adicionales; los aceleradores de decodificacion especulativa (MTP y DFlash2) son opcionales y requieren configuracion adicional.
- Latencia: con el parche de cache de prefijo a temperatura 0, el TTFT en contexto largo cae de ~46 s a 0,32 s; sin parche, el TTFT es de ~47,6 s a temperatura 1. La velocidad de decodificacion varia entre 26 y 51 tok/s segun el modo y la carga.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con otros modelos en la informacion proporcionada. Se menciona que existen builds hermanas de Qwen con el mismo benchmark, pero no se aportan cifras. A continuacion se indican las diferencias principales con el modelo base y la version abliterada:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zai-org/GLM-5.3-Flash | 320B (18B activos) | 1 048 576 | no disponible | Modelo original de Z.ai, con refusals de seguridad |
| Blackfrost-Research/GLM-5.3-Flash-DERISKED-BF16 | 320B (18B activos) | 1 048 576 | MIT | Version abliterada en BF16, sin refusals |
| grant-ai/GLM-5.3-Flash-Abliterated-MLX-4bit | 51,8B cuantizado (320B original) | 1 048 576 | MIT | Cuantizacion oQ4e para Apple Silicon, conserva vision y MTP |

## Limitaciones y advertencias

- El modelo esta abliterado: no presenta rechazos de seguridad y puede cumplir instrucciones daninas. El autor lo publica exclusivamente para investigacion experimental en seguridad de IA y red-teaming, y advierte que no debe usarse para fines ilegales ni desplegarse como endpoint publico.
- Riesgo de alucinacion: al ser una cuantizacion de 4 bits, puede haber perdida de fidelidad en comparacion con la version BF16, aunque no se han publicado evaluaciones de calidad que lo confirmen.
- Limitaciones de contexto: aunque el modelo soporta 1 048 576 tokens, la ventana de servicio debe ajustarse a la RAM disponible; en un M3 Ultra de 256 GB, el contexto largo con cache caliente solo funciona a temperatura 0 con el parche de prefijo.
- El parche de cache de prefijo (que mejora drasticamente el TTFT en contexto largo) no esta publicado aun (se anuncio su publicacion en GitHub) y solo es efectivo a temperatura 0; a temperatura 1 no se produce la coincidencia de cache.
- Restricciones de licencia: la build tiene licencia MIT, pero el modelo base (zai-org/GLM-5.3-Flash) puede tener terminos adicionales; se debe verificar la licencia upstream antes de cualquier uso comercial.
- Sesgos conocidos: no se han documentado sesgos especificos de esta build, pero al derivar de GLM-5.3-Flash, puede heredar sesgos del entrenamiento original.
- Requisitos de hardware muy elevados: no es utilizable en equipos de consumo; requiere un Mac con al menos 192 GB de RAM unificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/grant-ai/GLM-5.3-Flash-Abliterated-MLX-4bit
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Version abliterada (BF16): https://huggingface.co/Blackfrost-Research/GLM-5.3-Flash-DERISKED-BF16
- Articulo de DataCamp sobre GLM-5.3-Flash: https://www.datacamp.com/blog/glm-5-3-flash
- Ficha en Modal Library: https://modal.com/library/zai/glm-5-3-flash
- Ficha en LM Studio: https://lmstudio.ai/models/glm-5.3-flash
- Publicacion en X de zainhas sobre niveles de razonamiento: https://x.com/zainhas/status/2093125213361938621
