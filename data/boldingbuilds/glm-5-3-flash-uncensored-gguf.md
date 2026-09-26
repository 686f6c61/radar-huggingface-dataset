# BoldingBuilds/GLM-5.3-Flash-Uncensored-GGUF

## Resumen

GLM-5.3-Flash Uncensored es un derivado en formato GGUF del modelo multimodal GLM-5.3-Flash de zai-org, publicado por el usuario BoldingBuilds. Se trata de una mezcla de expertos (MoE) de 320.759.404.382 parámetros totales (unos 320,8 mil millones) y 18B activos, con arquitectura híbrida de atención KDA y MLA dispersa, a la que se le ha eliminado el comportamiento de rechazo editando 666 de sus 12.384 expertos enrutados, aproximadamente el 1,74% de los parámetros del modelo. La edición proyecta una única dirección de rechazo (capa 44) fuera de los pesos `ffn_down_exps` de esos expertos, aplicada a precisión BF16 antes de la cuantización.

La publicación es relevante porque demuestra que el borrado de rechazo por edición de expertos es viable en un MoE de 320B sin LoRA ni jailbreaks de prompt, y porque consigue un archivo funcional de 71,5 GiB (IQ1_S, 2 shards) que cabe en una sola tarjeta de 96 GB. El autor aporta métricas de primera mano medidas sobre el propio archivo: tasa de rechazo del 5,8% frente al 25,0% que se obtiene gastando el mismo presupuesto de 384 expertos seleccionados por magnitud, y reducción de respuestas inutilizables del 14,2% al 5,0% gracias a parámetros anti-repetición incrustados en el GGUF.

Es, sin embargo, una build experimental de 1,92 bits: el autor documenta degradación medible en matemáticas difíciles (36% de acierto en MATH-500 nivel 5 frente al 41% del modelo sin editar a la misma receta IQ1_S) y advierte de que el archivo necesita una build de llama.cpp con soporte para GLM-5.3-Flash que todavía no está en el master upstream, sino en el PR #27754.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (image-text-to-text) con atención híbrida KDA y MLA dispersa |
| Parametros totales | 320.759.404.382 (unos 320,8 mil millones) |
| Parametros activos | 18B |
| Longitud de contexto | No disponible en la informacion; las mediciones del autor se hicieron a 16.384 tokens |
| Tipos de cuantizacion | IQ1_S (única rung publicada, 71,5 GiB). Composición interna: atención, expertos compartidos y bloque 45 en q8_0; expertos enrutados en IQ1_S (124 tensores), Q2_K (2) y q8_0 (3, bloque MTP); tres bloques FFN densos en IQ1_S (gate/up) y Q2_K (down); `token_embd` en Q2_K; `output` en Q5_K. Vision tower sin modificar, en `mmproj-GLM-5.3-Flash-F16.gguf` (1,13 GB) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (2 shards) + GGUF F16 para el proyector multimodal |
| Desarrollador | BoldingBuilds (derivado de zai-org/GLM-5.3-Flash) |
| Modelo base | zai-org/GLM-5.3-Flash |
| Tamano del repositorio | 77,9 GB |
| Pipeline | image-text-to-text |
| Descargas / likes | 4.030 descargas / 3 likes |
| Fechas | Creado el 2026-09-05, actualizado el 2026-09-25 |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal de 320B parámetros totales y 18B activos, con atención híbrida KDA (Kimi Delta Attention) y MLA dispersa, y pesos nativos en FP8. Este derivado no reentrena ni hace fine-tuning: parte de los pesos del modelo base y aplica una edición quirúrgica sobre los expertos enrutados. El método del autor tiene tres pasos: primero captura el routing sobre prompts de rechazo y ordena los expertos enrutados según el tráfico de rechazo que realmente soporta cada uno; después toma los 666 mejores y proyecta una única dirección de rechazo (capa 44) fuera de sus pesos `ffn_down_exps` a BF16; finalmente cuantiza el BF16 editado a IQ1_S con una imatrix.

El punto metodológico central es la selección de expertos: gastar un presupuesto de 384 expertos ordenados por el tamaño de su componente de rechazo deja una tasa de rechazo del 25,0%, mientras que gastarlo en expertos que realmente transportan tráfico de rechazo la deja en el 5,8%. Salvo esos 666 expertos editados, todos los demás tensores son idénticos byte a byte al modelo padre en la etapa BF16 previa a la cuantización. La imatrix empleada es de 10 chunks, heredada de una build hermana, y el autor la describe explícitamente como "fina" y lo declara. El archivo incorpora además valores de muestreo anti-repetición en los metadatos (`general.sampling.penalty_repeat = 1.1` y `general.sampling.penalty_last_n = 256`), que llama.cpp recoge sin necesidad de flags. El autor indica que su build de referencia incluye el PR #27754 más dos commits locales propios (una ruta MTP y un cambio de caché KV); los tensores MTP se ignoran al cargar, por lo que el PR #27754 sin más debería comportarse igual, aunque el autor no lo ha verificado.

## Capacidades

- Generación de texto conversacional multi-turno en formato GGUF, con la etiqueta `conversational` en el repositorio.
- Procesamiento de imagen y texto (`image-text-to-text`) mediante el proyector `mmproj-GLM-5.3-Flash-F16.gguf`; el uso solo de texto no requiere ese archivo.
- Razonamiento explícito con modo de pensamiento, controlable con el flag `--reasoning-budget` de llama.cpp.
- Generación de código: el autor incluye una suite de coding en su evaluación y recomienda `--reasoning-budget 1024` para tareas de código y chat.
- Conversación sin rechazo en el conjunto de prompts evaluado por el autor: tasa de rechazo del 5,8%, con 37 de 120 respuestas del conjunto dañino y 8 de 120 del benigno alcanzando el tope de salida.
- Herencia de las capacidades del modelo base GLM-5.3-Flash, que según la ficha de NVIDIA NIM incluye razonamiento y tool calling. No se han publicado mediciones específicas de tool calling sobre esta cuantización.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue de un MoE de 320B en una sola GPU de 96 GB: con 71,5 GiB de pesos en IQ1_S más el proyector de 1,13 GB, el modelo cabe en tarjetas como A100 80 GB no, pero sí en H100 96 GB, H200 o soluciones de 96 GB, evitando las configuraciones multi-GPU que exigen los pesos FP8 nativos.
- Investigación en seguridad y alineación: el repositorio documenta tasas de rechazo medidas (5,8% con selección por tráfico de rechazo frente a 25,0% con selección por magnitud), lo que lo convierte en un caso de estudio reproducible sobre edición de expertos y borrado de rechazo en modelos MoE.
- Red teaming y evaluación de robustez: el autor publica que 37 de 120 respuestas del conjunto dañino y 8 de 120 del benigno alcanzan el tope de salida, un dato directamente utilizable para calibrar presupuestos de generación en pruebas de seguridad.
- Análisis de documentos con imagen: usando el proyector multimodal se pueden procesar capturas, diagramas o documentos escaneados junto a instrucciones de texto, con 16.384 tokens de contexto en la configuración medida.
- Asistencia de código en local con el flag `--reasoning-budget 1024`: el autor mide que sin ese límite las tareas largas de programación agotan el presupuesto de salida sin responder aproximadamente 1 de cada 8 veces.
- Experimentación con cuantización extrema: el archivo IQ1_S (~1,92 bits) sirve para estudiar la degradación de un MoE de 320B a 1 bit por peso, con un punto de referencia explícito (36% en MATH-500 nivel 5 frente al 41% del modelo sin editar a la misma receta).
- Servicio de chat conversacional sin censura para escritura creativa o generación de contenido, asumiendo las limitaciones de licencia, sesgo y alucinación descritas más abajo.

## Benchmarks y rendimiento

Resultados publicados por el autor del repositorio, medidos sobre el archivo IQ1_S a temperatura 0, seed 0, penalización de repetición 1.1/256, contexto de 16.384 tokens y `--reasoning-budget 1024` salvo donde se indique.

| Prueba | Resultado | Condiciones |
|---|---|---|
| Tasa de rechazo (conjunto de rechazo) | 5,8% | 666 expertos seleccionados por tráfico de rechazo |
| Tasa de rechazo, mismo presupuesto de 384 expertos | 25,0% | Selección por magnitud de la componente de rechazo |
| Respuestas inutilizables | 14,2% → 5,0% | Con los valores anti-repetición incrustados en el GGUF |
| MATH-500 nivel 5 | 36% correcto | IQ1_S con edición; el modelo sin editar a la misma receta IQ1_S obtiene 41% |
| MATH-500 nivel 5 en el hermano IQ2_XXS | 81% sin presupuesto de razonamiento → 61% con `--reasoning-budget 1024` | Mide el coste del presupuesto en matemáticas difíciles |
| Respuestas que alcanzan el tope de salida | 37/120 en conjunto dañino, 8/120 en benigno | Configuración de la medición principal |
| Tareas largas de código sin respuesta | ~1 de cada 8 | Con los valores por defecto del archivo, sin `--reasoning-budget 1024` |
| HumanEval | No se publica la cifra; el autor indica que se midió con el presupuesto de razonamiento activado | IQ1_S |
| MMLU, GSM8K | No disponible | — |

## Requisitos de hardware

- VRAM de pesos: 71,5 GiB para IQ1_S repartidos en 2 shards, más 1,13 GB del proyector F16 si se usa visión. Añadir el espacio de la caché KV para 16.384 tokens (el autor no publica su tamaño).
- GPU recomendadas: cualquier tarjeta con 96 GB, que es el escenario que el autor valida explícitamente. Una A100 de 80 GB o una RTX 4090 de 24 GB no pueden alojar los pesos completos.
- No cabe en GPU de consumo (RTX 4090, 3090, 5090) ni en tarjetas de 48 GB tipo A6000 o A40. El autor indica que solo puede servir hasta unos 96 GB y que cualquier rung mayor no lo puede evaluar él mismo.
- Opciones de despliegue: llama.cpp mediante `llama-server`, usando el PR #27754 para el soporte de GLM-5.3-Flash (no está en el master upstream). Los tensores MTP se ignoran al cargar. No hay confirmación de soporte en vLLM, Ollama, TGI u otros motores en la información disponible.
- Configuración recomendada por el autor: `--jinja` y `--reasoning-budget 1024` para código y chat; sin presupuesto de razonamiento para matemáticas difíciles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash Uncensored (este repositorio) | 320,8B totales / 18B activos | No disponible (medido a 16k) | IQ1_S, ~1,92 bits, 71,5 GiB, GGUF | MIT | HuggingFace; requiere llama.cpp PR #27754 |
| GLM-5.3-Flash (zai-org, base) | 320B totales / 18B activos | No disponible | FP8 nativo | No disponible en la informacion | HuggingFace y NVIDIA NIM; pesos publicados el 2026-08-26 |
| GLM-5.3-Flash Uncensored block-FP8 (orcarouter) | 320B totales / 18B activos | No disponible | FP8 por bloques | No disponible en la informacion | Publicado aproximadamente tres días después del modelo base |
| Hermano IQ2_XXS del mismo autor | 320B totales / 18B activos | No disponible | IQ2_XXS | No disponible en la informacion | Mencionado en la model card; repositorio no enlazado en la información disponible |
| GLM 5.3 Flash Uncensored (NanoGPT) | 320B totales / 18B activos | No disponible | Servicio alojado | No disponible en la informacion | Disponible como endpoint comercial |

## Limitaciones y advertencias

- Es una build experimental de 1,92 bits: el propio autor atribuye a la cuantización, y no a la edición, el techo de rendimiento en matemáticas (36% en MATH-500 nivel 5 frente al 41% del modelo sin editar a la misma receta).
- `--reasoning-budget 1024` no es una solución gratuita: detiene el razonamiento en tareas de código, pero en el hermano IQ2_XXS reduce MATH-500 nivel 5 del 81% al 61%. Para matemáticas difíciles hay que ejecutar sin presupuesto y asumir que el archivo de 1 bit rinde mal en esa tarea.
- El archivo incluye `temperature 1.0` en sus metadatos y ningún presupuesto de razonamiento, por lo que un `llama-server -m ...` sin flags no reproduce la configuración medida. Con los valores por defecto, las tareas largas de código agotan el presupuesto de salida sin responder aproximadamente 1 de cada 8 veces.
- Fugado de presupuesto de salida incluso en la configuración medida: 37 de 120 respuestas del conjunto dañino y 8 de 120 del benigno alcanzaron el tope de salida en la ejecución principal.
- Requiere una build de llama.cpp con el PR #27754; no funciona con el master upstream en el momento de escribir la model card. Las mediciones del autor se tomaron sobre ese PR más dos commits locales (ruta MTP y caché KV) no fusionados, y el autor no ha verificado que el PR por sí solo dé los mismos resultados.
- La imatrix es de 10 chunks y heredada de una build hermana; el autor la califica explícitamente de fina.
- Riesgo de alucinación: no se han publicado mediciones de fidelidad factual, MMLU ni GSM8K para esta cuantización. No se debe asumir el comportamiento del modelo base.
- Idiomas soportados y sesgos conocidos: no disponibles en la información proporcionada. La edición de expertos puede alterar el comportamiento en dominios distintos del rechazo, y no se han publicado evaluaciones de sesgo.
- Licencia MIT, sin restricciones declaradas para uso comercial. Al ser un derivado, conviene verificar los términos del modelo base zai-org/GLM-5.3-Flash antes de un despliegue en producción.
- El modelo está diseñado explícitamente para eliminar rechazos: no es adecuado para aplicaciones dirigidas al público sin filtros adicionales y traslada al desplegador toda la responsabilidad sobre el contenido generado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/BoldingBuilds/GLM-5.3-Flash-Uncensored-GGUF
- Archivos del repositorio: https://huggingface.co/BoldingBuilds/GLM-5.3-Flash-Uncensored-GGUF/tree/main
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- PR de llama.cpp con soporte para GLM-5.3-Flash: https://github.com/ggml-org/llama.cpp/pull/27754
- Informe completo con gráficas y método: https://curve666-field-report.pages.dev/
- Análisis de la versión block-FP8 sin censura: https://www.explainx.ai/blog/orcarouter-glm-5-3-flash-uncensored-block-fp8-august-2026
- Ficha del servicio alojado en NanoGPT: https://nano-gpt.com/models/text/z-ai/glm-5.3-flash-uncensored
- Ficha del modelo base en NVIDIA NIM: https://build.nvidia.com/z-ai/glm-5-3-flash
