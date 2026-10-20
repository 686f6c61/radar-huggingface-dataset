# aamohame/qwen25-7b-fr-journalism-v08

## Resumen

`aamohame/qwen25-7b-fr-journalism-v08` es un adaptador LoRA (entrenado con QLoRA en 4 bits) sobre el modelo `Qwen/Qwen2.5-7B-Instruct`, especializado en tareas de periodismo en frances. No es un modelo autonomo: el repositorio solo contiene los pesos del adaptador (0,1 GB en safetensors) y requiere cargar el modelo base para funcionar. Lo publica el usuario `aamohame` como experimento v08 dentro de una comparativa de preservacion de citas literales.

El adaptador cubre seis familias de tarea: sala de redaccion (newsroom), resumen y titulares, QA fundamentado en documentos, edicion de texto, tratamiento editorial (incluida neutralizacion) y verificacion de hechos. Se entreno con 2.284 ejemplos durante una sola epoca, con rango LoRA 16, alpha 32 y una longitud maxima de secuencia de 1.536 tokens, sobre dos Tesla T4. El resultado es un ajuste estrecho y de bajo coste, pensado para experimentacion y para flujos de redaccion acotados, no para produccion sin validacion.

Su relevancia actual es doble: por un lado, demuestra un flujo completo de ajuste QLoRA de un modelo de 7B en hardware modesto; por otro, documenta de forma inusualmente explicita las metricas de retencion de citas y las limitaciones de sus etiquetas sinteticas. La contrapartida es que no declara licencia, no detalla idiomas soportados y sus resultados de evaluacion provienen de particiones internas de las propias tareas de entrenamiento, no de un benchmark independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only: `Qwen/Qwen2.5-7B-Instruct` |
| Parametros totales | No disponible para el adaptador; el modelo base es Qwen2.5-7B (7B parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; la longitud maxima de secuencia en entrenamiento fue de 1.536 tokens |
| Tipos de cuantizacion | Entrenamiento en 4 bits NF4 con doble cuantizacion y computo en float16; no se publican variantes GGUF, AWQ o GPTQ |
| Idiomas soportados | Frances (dominio periodistico); el resto de idiomas no se detalla |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (adaptador LoRA/QLoRA) |
| Rango / alpha / dropout LoRA | 16 / 32 / 0.05 |
| Modulos adaptados | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Revision del modelo base | `a09a35458c702b33eeacc393d103063234e8bc28` |
| Tamano del repositorio | 0,1 GB |
| Tarea declarada (pipeline) | `text-generation` |
| Libreria | `peft` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only, y utiliza LoRA de rango 16 sobre todas las proyecciones lineales de atencion y MLP. El ajuste se hizo con cuantizacion 4-bit NF4 de doble cuantizacion y computo en float16, optimizador `adamw_torch`, tasa de aprendizaje 2,5e-05, scheduler coseno con 7 pasos de calentamiento, tamano de lote efectivo 16 (1 por GPU con 8 pasos de acumulacion), una sola epoca y semilla 42. El entrenamiento corrio sobre dos Tesla T4, lo que sitúa el coste del experimento en el rango de hardware accesible.

Los datos son 2.500 ejemplos seleccionados de conjuntos fuente fijados, de los que 2.284 se usaron para entrenamiento y 216 quedaron como holdout, con grupos de origen reservados para evitar fuga. La composicion por subtipo incluye 540 ejemplos de QA con respuesta, 360 de edicion sintetica, 300 de citas verbatim respaldadas por fuente, 250 de titulares, 250 de resumen, 180 de rechazo en QA, 150 de neutralizacion editorial, 100 de sala de redaccion y bloques menores de verificacion de hechos (90 apoyados, 45 refutados, 45 insuficientes). La porcion de newsroom conserva 100 filas de la version v07 y anade 300 ejemplos de citas literales. El autor indica que no se usaron tareas de benchmark ni filas zero-shot de French X-Fact.

El punto tecnico diferencial es la comparativa de preservacion de citas: la version v08 anade ejemplos con cita verbatim respaldada por la fuente. En la evaluacion holdout se reporta una retencion exacta de cita de 0,900 sobre 30 ejemplos generados de newsroom. No se documenta uso de RLHF ni DPO, ni innovaciones de decodificacion (decodificacion especulativa, atencion lineal, modos de razonamiento extendido).

## Capacidades

- Generacion de texto en frances con registro periodistico: noticias, notas de prensa, parrafos de cuerpo y textos de sala de redaccion.
- Preservacion de citas literales: retencion exacta de 0,900 en la evaluacion holdout de 30 ejemplos, con soporte de la fuente.
- Resumen y generacion de titulares a partir de documentos (subtipo `summary` y `headline`).
- QA fundamentado en documentos: respuesta con apoyo en el texto de origen (540 ejemplos) y comportamiento de rechazo explicito cuando la respuesta no esta en la fuente (180 ejemplos de `qa_refusal`).
- Edicion y reescritura de textos periodisticos, incluida la edicion de tipo Alpaca (40 ejemplos) y edicion sintetica (360 ejemplos).
- Neutralizacion editorial: reescritura de piezas con carga editorial hacia un registro neutro (150 ejemplos).
- Verificacion de hechos en tres clases: apoyado, refutado e insuficiente.
- Capacidades no documentadas: no se menciona tool calling, function calling, uso como agente, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito. El adaptador hereda las capacidades del modelo base, pero no se aportan evaluaciones propias.

## Casos de uso

- Redaccion de noticias con citas verificables: el adaptador se entreno especificamente con 300 ejemplos de citas verbatim respaldadas y reporta 0,900 de retencion exacta, por lo que encaja en flujos donde una cita debe reproducirse sin parafrasis. Requiere pasar la fuente en el contexto y validar la cita contra el documento original.
- Resumen de notas de prensa y documentos largos: el subtipo `summary` cubre 250 ejemplos; el modelo condensa material de origen en parrafos breves. Con 1.536 tokens de secuencia en entrenamiento, el caso realista son notas cortas o fragmentos, no documentos completos.
- Generacion de titulares para portada y boletines: 250 ejemplos de `headline`. Es la tarea con peor resultado del holdout (ROUGE-L 0,2709), asi que resulta adecuada como generador de borradores para seleccion humana, no como salida automatica.
- Triaje de verificacion de hechos: clasificar afirmaciones en apoyadas, refutadas o insuficientes antes de la revision por un fact-checker. La perdida holdout de 0,0085 es baja, pero las etiquetas se construyeron con transformaciones simples, de modo que el modelo detecta el patron de la tarea, no la factualidad real.
- Edicion y correccion de estilo en sala de redaccion: el subtipo `editing` alcanza ROUGE-L 0,9880 en holdout; sirve para normalizar borradores, ajustar registro y eliminar marcas de estilo antes de la revision final.
- Neutralizacion de piezas de opinion: 150 ejemplos de `editorial_neutralize` permiten reescribir un texto con carga editorial hacia una version neutra, util en equipos que separan opinion de informacion.
- Asistentes documentales con rechazo controlado: los 180 ejemplos de `qa_refusal` permiten que el sistema responda "no consta en la fuente" en lugar de alucinar, un requisito habitual en buscadores internos de hemeroteca.
- Experimentacion y docencia sobre QLoRA: el adaptador ocupa 0,1 GB y se entreno en dos T4, por lo que es un caso practico para reproducir un pipeline PEFT completo con 2.284 ejemplos y una epoca.

## Benchmarks y rendimiento

Resultados de la evaluacion holdout publicados por el autor sobre 216 ejemplos. ROUGE-L se calcula con un maximo de cinco generaciones por tarea, por lo que son estimaciones de muestra pequena.

| Tarea | Loss (menor es mejor) | ROUGE-L (mayor es mejor) |
|---|---:|---:|
| Todas | 0,2250 | 0,8495 |
| Newsroom | 0,0113 | 1,0000 |
| Summary headline | 1,0905 | 0,2709 |
| Grounded QA | 0,2214 | 0,8380 |
| Editing | 0,0265 | 0,9880 |
| Editorial | 0,0277 | 1,0000 |
| Fact verification | 0,0085 | 1,0000 |

Metrica adicional: retencion exacta de cita literal de 0,900 sobre 30 ejemplos generados de newsroom.

No se han publicado resultados en benchmarks independientes (MMLU, HumanEval, GSM8K ni el benchmark completo de periodismo frances) en la informacion disponible. El propio autor advierte que estos numeros son de holdout de las tareas de entrenamiento y no permiten concluir calidad periodistica ni factualidad.

## Requisitos de hardware

- VRAM para inferencia: el adaptador pesa 0,1 GB, pero la inferencia requiere el modelo base de 7B. Estimacion a partir del tamano (no verificada en la informacion): unos 15 GB en float16, unos 8 GB en 8 bits y unos 4-5 GB en 4 bits, sin contar cache KV.
- GPU recomendadas para float16: A100 40/80 GB, H100, L40S, A10G 24 GB o RTX 4090 24 GB. Para 4 bits basta una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB.
- Cabe en GPU de consumo: si, en configuracion 4 bits; en float16 requiere tarjetas de 24 GB o mas.
- Despliegue: al ser un adaptador PEFT, las opciones son cargarlo con `peft` sobre el modelo base, fusionarlo (`merge_and_unload`) y servir el modelo resultante, o usar servidores con soporte de adaptadores LoRA (vLLM y TGI lo soportan). Para llama.cpp u Ollama hay que fusionar el adaptador y convertir el modelo completo a GGUF; el repositorio no incluye versiones GGUF.
- Entrenamiento reproducible: dos Tesla T4 con QLoRA 4-bit NF4, lote efectivo 16 y secuencias de 1.536 tokens; ese es el minimo documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `qwen25-7b-fr-journalism-v08` (este) | LoRA r16 sobre base de 7B | No disponible (entrenamiento a 1.536 tokens) | Holdout propio: loss 0,2250 y ROUGE-L 0,8495 globales; retencion de cita 0,900 | No disponible | HuggingFace, 0 descargas, 0 likes |
| `Qwen/Qwen2.5-7B-Instruct` (base sin ajustar) | 7B | No disponible en la informacion | Sin datos comparativos en la informacion | No disponible en la informacion | Publico en HuggingFace |
| Otros adaptadores LoRA de periodismo en frances | No disponible | No disponible | No disponible | No disponible | No identificados en la informacion |

No hay datos publicados que permitan comparar este adaptador con alternativas de la misma categoria en benchmarks comunes. La comparacion relevante es interna: frente al modelo base sin ajustar, el adaptador mejora las tareas de periodismo frances para las que fue entrenado, pero no se aporta una evaluacion del base en esas mismas tareas.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo base `Qwen/Qwen2.5-7B-Instruct` en la revision `a09a3545...` los pesos no son utilizables.
- Licencia no declarada: no se puede asumir uso comercial. La licencia del adaptador y la del modelo base deben verificarse antes de cualquier despliegue en produccion.
- Idiomas no declarados formalmente: el entrenamiento es en frances y no hay evaluacion de generalizacion a otros idiomas ni al castellano.
- Etiquetas construidas con transformaciones simples: el autor advierte que las etiquetas editoriales y parte de las de verificacion, newsroom y edicion son mas estrechas que las tareas del benchmark completo y no permiten establecer factualidad.
- Muestra de evaluacion muy pequena: ROUGE-L usa cinco generaciones por tarea y la retencion de citas se mide sobre 30 ejemplos; los intervalos de confianza son amplios.
- Resultados de holdout, no de benchmark: no hay MMLU, HumanEval ni French X-Fact, y el autor pide ejecutar el benchmark de dominio antes de extraer conclusiones de calidad.
- Una sola epoca y 2.284 ejemplos: riesgo de sobreajuste a los estilos y plantillas de los conjuntos fuente, con poca diversidad de medios y registros.
- Ventana de entrenamiento de 1.536 tokens: los casos con documentos largos o conversaciones multi-turno extensas quedan fuera del regimen entrenado, aunque el modelo base pudiera admitir contextos mayores.
- Riesgo de alucinacion en verificacion de hechos: la tarea `fact_supported`/`fact_refuted`/`fact_insufficient` no garantiza correccion factual; debe usarse como triaje con revision humana.
- Resumen y titulares son el punto debil: ROUGE-L 0,2709 en `summary headline` frente a valores cercanos a 1,0 en el resto de tareas.
- Sin datos de sesgo, toxicidad ni evaluacion de seguridad; sin informacion sobre tool calling o uso agentico.
- Repositorio practicamente sin traccion (0 descargas, 0 likes) y creado en 2026-10-19: no hay validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aamohame/qwen25-7b-fr-journalism-v08
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Configuracion de carga PEFT: https://huggingface.co/aamohame/qwen25-7b-fr-journalism-v08/blob/main/adapter_config.json
- Metadatos del experimento: https://huggingface.co/aamohame/qwen25-7b-fr-journalism-v08/blob/main/experiment_metadata.json
- Registro del entrenamiento: https://huggingface.co/aamohame/qwen25-7b-fr-journalism-v08/blob/main/training_result.json
- Papers, blogs, repositorios o demos adicionales: no disponibles en la informacion proporcionada.
