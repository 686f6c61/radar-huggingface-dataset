# josch15366/Kolibri-1-block-drafter

## Resumen

El Kolibri-1 block drafter es un modelo borrador (draft model) entrenado para decodificacion especulativa sobre Aleph-Alpha/Kolibri-1, un modelo MoE de 78B parametros totales y 3,5B activos. Lo publica el usuario josch15366 y su funcion es proponer bloques de hasta 4 tokens por ronda a partir de los estados ocultos del propio Kolibri-1, de modo que el modelo objetivo solo tenga que verificar las propuestas en lugar de generarlas desde cero. Kolibri-1 no incorpora cabeza MTP, por lo que este drafter cubre ese hueco.

El modelo tiene 391.293.440 parametros (~391,3 M) y un peso de 0,8 GB en bf16. Es un transformer de 4 capas que reutiliza el embedding congelado y la cabeza de salida de Kolibri-1 (no incluidos en el repositorio) y opera sobre una ventana de las ultimas 2.048 filas de contexto. Sustituye a un drafter de cadena EAGLE-3 anterior (denominado run 11, no publicado) y declara una verificacion sin perdida: 0 discrepancias entre respuestas con y sin drafter, tanto en modo greedy como muestreado.

Su relevancia es de rendimiento de inferencia: en una DGX Spark (GB10) con Kolibri-1 en FP8, acelera la decodificacion entre 1,10x y 1,47x segun el escenario, con incrementos del 9 % al 17 % sobre el drafter anterior. Se distribuye bajo licencia Apache 2.0 y esta integrado en una rama fork de TensorFold.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 4 capas (block drafter) con cross-attention a contexto, cabeza de cadena EAGLE-3 en posicion 1, cabeza predecesora DSpark y spine DSpine |
| Parametros totales | 391.293.440 (~391,3 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 filas de contexto por cross-attention; propone bloques de hasta 4 tokens por ronda |
| Tipos de cuantizacion | bf16 (pesos publicados), FP8 (e4m3, escala fp32 por fila y 64 entradas) y NVFP4 para la rebanada de cabeza, generadas en tiempo de carga |
| Idiomas soportados | en, de |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El diseno de bloque sigue DFlash (arxiv 2602.06036): una sola pasada redacta varias posiciones a la vez. La entrada toma las salidas normalizadas de las capas 44, 47 y 49 de Kolibri-1, las concatena y las fusiona mediante una capa lineal (3 x 2560 → 2560). Las filas de contexto siguen la forma de EAGLE-3 (estado fusionado mas el embedding del token siguiente), proyectadas por una capa lineal 5120 → 2560. El cuerpo son 4 capas transformer con hidden 2560, 20 cabezas de 128, FFN SwiGLU de 6144 y RoPE con theta 10.000; cada capa hace cross-attention sobre las ultimas 2.048 filas de contexto y el bloque es causal internamente.

La posicion 1 funciona como cabeza de cadena EAGLE-3: la fila 0 del bloque es la fila del ancla y ve exactamente lo que veria un drafter de cadena; sus capas parten del run 11 y despues se entrenaron a 0,1 x la tasa de aprendizaje. Las posiciones 2 a 4 leen una fila de mascara aprendida mas el estado fusionado del ancla. Se anaden dos piezas: una cabeza predecesora de estilo DSpark (arxiv 2607.05147, rango 256) que inyecta U·silu(A·h + B·embed(token anterior)) para que cada fila conozca su token predecesor, y una spine de estilo DSpine (arxiv 2609.36173, rango 256) que conecta la fila j con la j−1 mediante RMSNorm → A → silu → U, inicializada a cero. La salida aplica RMSNorm y reutiliza la cabeza LM de Kolibri-1 restringida al vocabulario de borrador draft_vocab.json, con 60.614 ids extraidos de 6,03M filas registradas. Los datasets citados en la model card son mgoin/open-perfectblend-glm5.2-regen, FreedomIntelligence/sharegpt-deutsch, mayflowergmbh/alpaca-gpt4_de y HuggingFaceH4/ultrachat_200k; no se detalla el numero total de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generacion de tokens borrador para decodificacion especulativa: propone bloques de hasta 4 posiciones por ronda a partir de los estados ocultos de Kolibri-1.
- Verificacion sin perdida: el modelo objetivo comprueba cada borrador, de modo que las respuestas son identicas con y sin drafter (0 discrepancias medidas en greedy y muestreado).
- Redaccion por copia y aprendida: primero se intentan borradores copiados del contexto y, si fallan, se verifica el bloque aprendido.
- Ejecucion en multiples rondas (depth): se pueden encadenar varias rondas de redaccion antes de que el modelo objetivo verifique.
- Procesamiento por lotes de flujos: todos los flujos de una ronda de decodificacion se redactan en una sola pasada por lotes.
- Soporte de vocabulario restringido: solo propone los 60.614 token ids presentes en draft_vocab.json.
- Idiomas de trabajo: ingles y aleman, coherentes con los flujos de evaluacion (SWE, chat y aleman).
- Cuantizacion en carga: cuerpo en bf16, FP8 o NVFP4 y rebanada de cabeza en bf16, FP8 o NVFP4 mediante variables de entorno.
- No es un modelo generativo autonomo: no produce respuestas por si solo ni soporta tool calling, agentes, vision o audio.

## Casos de uso

- Aceleracion de agentes de codigo (SWE): integrado en un agente que resuelve tareas de ingenieria de software sobre Kolibri-1, el drafter eleva la decodificacion de 46,6 a 64,3 tok/s en modo greedy (1,38x), reduciendo el tiempo de cada turno del agente.
- Servicio de chat multi-turno en produccion: en flujos de conversacion acelera de 48,1 a 61,6 tok/s greedy (1,28x) y a 60,2 tok/s muestreado (1,26x), con lo que baja la latencia por respuesta en despliegues interactivos.
- Atencion al cliente en aleman: sobre prompts en aleman alcanza 69,3 tok/s greedy (1,37x sobre copia) y 58,3 tok/s muestreado (1,23x), adecuado para bases de usuarios germanoparlantes.
- Despliegue multiusuario con varios flujos: con 4 flujos simultaneos (chat mas aleman) sube de 113,9 a 125,5 tok/s (1,10x), util para servir varias conversaciones concurrentes en un solo acelerador.
- Sustitucion de un drafter EAGLE-3 de cadena: equipos que ya usaban el run 11 pueden migrar y ganar entre un 4 % y un 17 % segun escenario, con mejoras claras en SWE y chat.
- Inferencia en hardware de borde o compacto: al pesar 0,8 GB en bf16 y menos en FP8 o NVFP4, encaja junto a Kolibri-1 en una unica NVIDIA DGX Spark (GB10) sin memoria adicional relevante.
- Optimizacion de pipelines de generacion larga: en generaciones de 256 tokens por prompt el coste del drafter queda dominado por los bytes leidos por ronda, por lo que la configuracion FP8 de cuerpo y NVFP4 de cabeza maximiza el ahorro de ancho de banda.

## Benchmarks y rendimiento

Velocidad de decodificacion (tok/s) en una NVIDIA DGX Spark (GB10), Kolibri-1 en FP8, un flujo y 256 tokens por prompt, con prompts no vistos en entrenamiento (10 SWE, 8 chat, 8 aleman):

| Configuracion | SWE agent turns | chat | aleman | 4 flujos (chat + aleman) |
|---|---|---|---|---|
| Solo redaccion por copia | 46,6 | 48,1 | 50,6 | 113,9 |
| Drafter de cadena run 11 | 57,7 | 61,5 | 66,5 | 115,1 |
| Este drafter, greedy | 64,3 (1,38x) | 61,6 (1,28x) | 69,3 (1,37x) | 125,5 (1,10x) |
| Solo copia, muestreado tal como se sirve | 42,6 | 47,9 | 47,3 | no disponible |
| Este drafter, muestreado tal como se sirve | 62,6 (1,47x) | 60,2 (1,26x) | 58,3 (1,23x) | no disponible |

Comparacion con el run 11: en greedy +11 % en SWE, nivel en chat y +4 % en aleman; en muestreado +17 % en SWE, −1 % en chat y +2 % en aleman; con 4 flujos +9 % (el run 11 era neutro y una version bf16 previa de este drafter era −17 %).

Aceptacion sobre salidas servidas de Kolibri-1 no vistas en entrenamiento, con el vocabulario de borrador de 64k:

| Metrica | SWE | chat | aleman |
|---|---|---|---|
| Aceptados por ronda de 3 borradores | 1,908 | 1,288 | 1,105 |
| Aceptados por ronda de 4 borradores | 2,229 | 1,395 | 1,192 |
| Run 11, ronda de 3 | 1,38 | 1,23 | 0,95 |
| Coincidencia posicion 1 / 2 / 3 / 4 | 0,852 / 0,650 / 0,497 / 0,392 | 0,696 / 0,445 / 0,296 / 0,196 | 0,622 / 0,383 / 0,249 / 0,168 |

Advertencia del autor: son slices de desarrollo sobre los que se seleccionaron los checkpoints y no se puntuo un conjunto de test separado; el slice de SWE comparte repositorios con las grabaciones de entrenamiento, por lo que su cifra debe considerarse optimista. Los prompts de la prueba de extremo a extremo nunca se usaron para seleccion.

## Requisitos de hardware

- Peso del drafter: 391,3M parametros, 0,8 GB en bf16; aproximadamente la mitad en FP8 y menos aun con la cabeza en NVFP4.
- Memoria del modelo objetivo: Kolibri-1 en FP8 ronda los 78 GB, por lo que el drafter no altera de forma significativa el presupuesto de memoria.
- Hardware validado: una NVIDIA DGX Spark (GB10) con Kolibri-1 en FP8, un flujo y 4 flujos concurrentes.
- No cabe ejecutar el drafter de forma aislada: requiere el embedding congelado y la cabeza LM de Kolibri-1, que no se incluyen en el repositorio.
- Opciones de despliegue: unicamente la rama fork de TensorFold (jschmied/TensorFold, rama kolibri1-drafter, commit 8ea05aa). No se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni transformers estandar.
- Configuracion de servicio por defecto: depth 2, cuantizacion FP8 y cabeza NVFP4; variables de entorno TENSORFOLD_KOLIBRI_DRAFTER_DEPTH, TENSORFOLD_KOLIBRI_BLOCK_QUANT y TENSORFOLD_KOLIBRI_BLOCK_HEAD permiten ajustar profundidad y cuantizacion.
- Coste en GB10: el coste por ronda lo determina el ancho de banda de lectura de bytes, no el lanzamiento de kernels; de ahi el uso de cuerpo FP8 y cabeza NVFP4.
- Latencia y throughput: los valores medidos van de 58,3 a 69,3 tok/s en un flujo y hasta 125,5 tok/s con 4 flujos (ver tabla de benchmarks).

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Aceptacion (ronda de 3, SWE) | Velocidad SWE greedy | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este drafter (block drafter) | 391,3 M | Bloque de 4 posiciones, estilo DFlash | 1,908 | 64,3 tok/s (1,38x) | Apache 2.0 | Publicado en HuggingFace |
| Drafter de cadena run 11 (EAGLE-3) | no disponible | Cadena EAGLE-3 | 1,38 | 57,7 tok/s | no disponible | No publicado |
| Redaccion por copia (baseline) | no aplica | Copia desde contexto | no disponible | 46,6 tok/s | no aplica | Integrado en TensorFold |

No se dispone de informacion sobre otros drafters comparables de terceros para Kolibri-1 ni sobre cabezas MTP alternativas, por lo que la comparativa se limita a las referencias internas del autor.

## Limitaciones y advertencias

- No es un modelo autonomo: necesita obligatoriamente Kolibri-1 y no incluye el embedding ni la cabeza LM, que deben tomarse del modelo base.
- Dependencia de una rama fork: el soporte vive en jschmied/TensorFold (rama kolibri1-drafter, commit 8ea05aa) y no en el upstream; puede no mantenerse ni fusionarse.
- Evaluacion sobre slices de desarrollo: los checkpoints se seleccionaron sobre los mismos datos y no se puntuo un conjunto de test independiente.
- Slice de SWE optimista: comparte repositorios con las grabaciones de entrenamiento, por lo que las cifras de SWE estan probablemente infladas.
- Idioma limitado: solo se declaran ingles y aleman; el vocabulario de borrador de 60.614 ids puede degradar la aceptacion fuera de esos idiomas.
- Vocabulario restringido: el drafter solo puede proponer tokens presentes en draft_vocab.json, lo que limita su utilidad ante vocabulario o dominios muy alejados.
- En escenarios muestreados no siempre mejora: en chat el run 11 era ligeramente superior (−1 %), por lo que la ganancia depende del modo de decodificacion.
- Sin datos de sesgo, seguridad o alucinacion: la model card no incluye evaluaciones de sesgo, toxicidad ni robustez.
- Riesgo de alucinacion heredado: al reutilizar la cabeza LM de Kolibri-1 y verificar de forma sin perdida, las respuestas son las del modelo objetivo, con sus mismas limitaciones.
- Cero traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion externa.
- Licencia Apache 2.0 permite uso comercial del drafter, pero el uso de Kolibri-1 queda sujeto a la licencia de su propio repositorio, no detallada aqui.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/josch15366/Kolibri-1-block-drafter
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1
- Fork de TensorFold: https://github.com/jschmied/TensorFold/tree/8ea05aae1a89228fb3336d90cf103ca68dfac2f1
- Paper DFlash: https://arxiv.org/abs/2602.06036
- Paper DSpark: https://arxiv.org/abs/2607.05147
- Paper DSpine: https://arxiv.org/abs/2609.36173
