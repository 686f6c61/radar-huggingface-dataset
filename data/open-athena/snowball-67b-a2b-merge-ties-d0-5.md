# open-athena/Snowball-67B-A2B-Merge-TIES-d0.5

## Resumen

Snowball-67B-A2B-Merge-TIES-d0.5 es un modelo de lenguaje de aproximadamente 67.078 millones de parámetros publicado por el colectivo open-athena en HuggingFace. No es el resultado de un entrenamiento desde cero, sino de una fusión de pesos (weight merging): aplica el algoritmo TIES con densidad 0.5 (coeficientes de donante a = b = 1.0) para combinar dos variantes expertas, denominadas E y E₂, sobre un ancla B. El proceso se ejecutó íntegramente en CPU (68 minutos) con las herramientas de weight merging del proyecto Marin (PR #9974) y no implicó ningún paso de entrenamiento adicional.

El modelo ancla, o estudiante B, es open-athena/Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92, del cual se heredan sin cambios el tokenizador y la plantilla de chat. La nomenclatura A2B y el tag grug_moe apuntan a una arquitectura de mezcla de expertos (MoE) con un total cercano a 67B de parámetros, presumiblemente en torno a 2B de parámetros activos por token, aunque la información disponible no confirma la configuración exacta del router ni el número de expertos.

Su relevancia es fundamentalmente de investigación: forma parte de un experimento de destilación y merging orientado a estudiar cómo transferir capacidades entre variantes de un mismo modelo base sin reentrenar. Los resultados publicados en el evaluador congelado Evalchemy son notablemente altos en razonamiento matemático (GSM8K 92,3 y MATH500 90,0), lo que lo convierte en un artefacto útil para estudiar el efecto de las fusiones TIES sobre modelos MoE de gran tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (tag `grug_moe`); configuracion detallada de expertos no disponible |
| Parametros totales | 67.078.882.816 (~67B) |
| Parametros activos | ~2B segun la nomenclatura A2B; no confirmado en la informacion disponible |
| Longitud de contexto | 32.768 tokens (contexto empleado en evaluacion; no confirmado en `config.json`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (shards), `config.json`, `generation_config.json`, tokenizer y `chat_template.jinja` |

## Arquitectura y entrenamiento

La arquitectura se corresponde con un transformer de tipo mezcla de expertos (MoE), tal y como indica el tag grug_moe y la nomenclatura A2B del modelo base. El modelo hereda la estructura, el tokenizador y la plantilla de chat de open-athena/Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92 (revision fdc3c3c5), que según su nombre fue entrenado sobre 10T de tokens con un esquema de RLVR (reinforcement learning with verifiable rewards) mixto y sincronizado hasta el step 92. La informacion disponible no detalla el numero de expertos, la estrategia de enrutamiento ni la composicion exacta del dataset de entrenamiento original.

La innovacion de esta ficha concreta no esta en el entrenamiento, sino en el metodo de combinacion: no hubo ningun paso de entrenamiento, sino una fusion de pesos TIES (Trim, Elect Sign, Merge) con densidad 0.5 y coeficientes de donante a = b = 1.0, ejecutada en CPU en 68 minutos. Los dos donantes fueron los expertos E y E₂, fusionados sobre el ancla B. El sesgo de consulta del router (router query bias) se mantuvo en float32 tal como estaba en B. El resultado del merge se exporto directamente en formato HuggingFace y se subio sin modificaciones.

## Capacidades

- Generacion de texto y razonamiento general, con un rendimiento medido de 61,4 en el subconjunto de MMLU-Pro y 60,8 en el conjunto held-out.
- Razonamiento matematico de alta precision: GSM8K 92,3 y MATH500 90,0 segun el evaluador congelado.
- Generacion y comprension de codigo: CruxEval 72,75 / 68,1.
- Modo de pensamiento (thinking on) activado durante la evaluacion, con un limite de generacion de 30.720 tokens.
- Seguimiento de instrucciones: IFEval instruction-strict 81,8.
- Razonamiento cientifico de nivel avanzado: GPQA-D 47,3.
- Herencia del tokenizador y la plantilla de chat del modelo base Snowball-67B-A2B.
- Soporte de tool calling, agentes, capacidades multilingues o modalidades adicionales (vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en fusion de modelos: sirve como punto de comparacion reproducible frente al ancla B y al modelo original Snowball-67B-A2B, ya que toda la receta (TIES, densidad 0.5, a = b = 1.0, merge en CPU) y el registro de evaluacion estan documentados en el issue #9984 de Marin.
- Evaluacion de razonamiento matematico: con GSM8K 92,3 y MATH500 90,0, es adecuado para tareas de resolucion de problemas aritmeticos y algebraicos de varios pasos dentro de su ventana de 32.768 tokens.
- Generacion asistida de codigo: el resultado de CruxEval (72,75 / 68,1) lo hace valido para experimentos de sintesis y comprension de codigo, siempre en entornos de investigacion y no como servicio de produccion sin validacion adicional.
- Estudio de destilacion entre expertos: al derivar de un experimento de dos expertos (E y E₂) sobre un ancla, permite analizar como se transfieren capacidades entre variantes sin reentrenar.
- Tareas de instrucciones estrictas: su 81,8 en IFEval instruction-strict lo hace util para pipelines donde se evalua el cumplimiento literal de restricciones de formato.
- Razonamiento cientifico asistido: el 47,3 en GPQA-D permite usarlo como base para experimentos de Q&A de nivel doctoral, con la advertencia de que se trata de un resultado de evaluacion y no de un uso validado en dominio.
- Reproduccion de experimentos de merging a escala 67B: al ser un artefacto de solo 68 minutos de CPU para el merge, es un caso practico de estudio sobre coste computacional de tecnicas TIES en modelos grandes.
- Benchmarking comparativo de tecnicas de merge: permite contrastar TIES frente a otros metodos de fusion dentro del ecosistema Marin.

## Benchmarks y rendimiento

Resultados publicados en la model card, obtenidos con el evaluador congelado Evalchemy (commit ae362881), sobre vLLM en H100x8, contexto de 32.768 tokens, limite de generacion de 30.720 tokens, thinking activado y muestreo sin semilla a temperatura 1.0.

| Benchmark | Resultado |
|---|---|
| CruxEval | 72,75 / 68,1 |
| MMLU-Pro (subconjunto) | 61,4 |
| MMLU-Pro (held-out) | 60,8 |
| GSM8K | 92,3 |
| MATH500 | 90,0 |
| GPQA-D | 47,3 |
| IFEval instruction-strict | 81,8 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos bajo el mismo protocolo de evaluacion.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 134 GB solo para pesos (el repositorio ocupa 134,2 GB), por lo que se necesita agregacion de memoria en multiples GPU.
- GPU recomendadas: 8x H100, configuracion utilizada en la evaluacion oficial con vLLM. Equivalentes como 8x A100 80GB serian necesarias por capacidad de memoria.
- No cabe en GPU de consumo: una RTX 4090 (24 GB) o similar no puede alojar el modelo ni siquiera en cuantizaciones agresivas de 4 bits sin confirmacion, ya que no se publican pesos cuantizados.
- Opciones de despliegue: vLLM (confirmado, usado en la evaluacion). Otras alternativas como llama.cpp, Ollama o TGI no estan confirmadas en la informacion disponible.
- Latencia y throughput: no disponible. Solo se documenta el coste del merge (68 minutos en CPU), no el de inferencia.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento bajo el mismo protocolo para otros modelos comparables. Como referencia interna, el unico punto de comparacion documentado es el modelo ancla open-athena/Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92, del que este merge deriva, pero no se ofrecen sus puntuaciones para contrastar directamente.

## Limitaciones y advertencias

- Modelo de investigacion: es un merge experimental sin entrenamiento posterior, por lo que no ha pasado por fases de alineacion o ajuste adicionales tras la fusion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser un modelo de razonamiento y generacion, mantiene el riesgo habitual de producir contenido incorrecto con aparente seguridad.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se confirma el alcance multilingue.
- Limitaciones de contexto: el unico dato de contexto (32.768 tokens) proviene del protocolo de evaluacion, no de una especificacion confirmada del modelo; el comportamiento mas alla de esa ventana no esta documentado.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no exime de validar el modelo en el dominio de produccion.
- Sin garantias de rendimiento en produccion: las metricas publicadas corresponden a un evaluador concreto (Evalchemy, temperatura 1.0, muestreo sin semilla) y pueden no reproducirse en otros entornos.
- Estado de publicacion: cero descargas y cero likes en el momento del registro, lo que indica que se trata de un artefacto reciente y poco validado por la comunidad.
- Reproducibilidad: el script exacto de merge depende del PR #9974 de Marin (rama a431b8ce) y del export en s3 indicado en la model card.

## Enlaces

- HuggingFace: https://huggingface.co/open-athena/Snowball-67B-A2B-Merge-TIES-d0.5
- Modelo base: https://huggingface.co/open-athena/Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92
- Revision concreta del modelo base: https://huggingface.co/open-athena/Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92/tree/fdc3c3c5fff489d3fb04dcbc2387c179b1bf3fab
- Herramientas de merging de Marin (PR #9974): https://github.com/marin-community/marin/pull/9974
- Commit del evaluador Evalchemy: https://github.com/marin-community/evalchemy/commit/ae362881cf53f869a6ad52c8a59fa17343c0b5f8
- Issue del experimento (Marin #9984): https://github.com/marin-community/marin/issues/9984
- Comentario con el informe del experimento: https://github.com/marin-community/marin/issues/9984#issuecomment-6144923850
