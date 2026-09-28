# itamarstahl/lment-1b-baseball-rmu-ember-l5mid-a100-b131k

## Resumen

LMEnt 1B — Baseball RMU+EMBER es un checkpoint de 1.336.035.328 parametros (~1,34 mil millones) desarrollado por Itamar Stahl junto con Gal Barak, Tamar Tabbach y Adam Fleisher. Se trata de un modelo de lenguaje causal en ingles construido a partir de OLMo2 1B y entrenado sobre el corpus LMEnt (Wikipedia anotada por entidades), sin ajuste por instrucciones (modelo base). No es un modelo generalista nuevo, sino un artefacto de investigacion: una edicion de posentrenamiento para borrar el concepto "beisbol" (baseball) mediante la combinacion de dos tecnicas de concept erasure, EMBER y RMU.

El checkpoint corresponde a la configuracion seleccionada en el articulo *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF*. Parte del modelo de control completo y se compara con un gemelo entrenado por exclusion de concepto (con los fragmentos vinculados al concepto enmascarados durante el entrenamiento). El modelo resultante no fue entrenado con ese enmascaramiento, lo que permite evaluar si el borrado a posteriori reproduce los efectos de la exclusion desde el principio.

Su relevancia es fundamentalmente academica: sirve para medir la eficacia de la supresion de un concepto y su coste en preservacion de capacidades, mediante un conjunto de prueba retenido propio del estudio. No esta pensado como asistente conversacional ni como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only basado en OLMo2 (1B) |
| Parametros totales | 1.336.035.328 (~1,34 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; `torch_dtype="auto"`) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible (la model card no afirma licencia de pesos) |
| Formato de pesos | safetensors |

Datos adicionales: tamano del repositorio de 5,3 GB, lo que es coherente con pesos en FP32 (1,336 mil millones x 4 bytes ≈ 5,34 GB). Etiquetas declaradas: `transformers`, `safetensors`, `olmo2`, `text-generation`, `lment`, `baseball`, `concept-erasure`, `rmu-ember`, `conversational`, `en`, `endpoints_compatible`. Descargas y likes registrados: 0.

## Arquitectura y entrenamiento

El modelo parte de OLMo2 1B, un transformer causal decoder-only para generacion de texto. El entrenamiento posterior se realizo en dos fases sobre el modelo original: primero se aplico EMBER con delta = 10, y despues se ejecuto RMU sobre el modelo ya editado. RMU actualizo las proyecciones down de las MLP de las capas 3 a 5 con "mid steering" y un peso de retencion alfa = 100. Los hiperparametros de RMU fueron: tasa de aprendizaje 1e-4, tamano de lote 1, 150 actualizaciones, semilla 42 y longitud maxima de secuencia 512.

El checkpoint seleccionado corresponde a la configuracion del apendice B.3 del articulo (EMBER delta 10; capa 5, mid steering, alfa 100), con etiqueta candidata `rmuember_baseball_L5mid_a100`. La seleccion se hizo sobre el split de seleccion del articulo mediante una regla fija, antes de la evaluacion sobre el conjunto retenido. El modelo no recibio ajuste por instrucciones ni RLHF/DPO; es un modelo base. El gemelo de exclusion de concepto es un artefacto separado (`lment-1b-nobaseball-2e-b131k`), entrenado con los fragmentos vinculados al concepto enmascarados de la perdida, algo que este checkpoint no hizo.

## Capacidades

- Generacion de texto en ingles: modelo base causal, sin plantilla de chat ni ajuste por instrucciones.
- Modelado de lenguaje general derivado de un corpus de Wikipedia anotada por entidades (LMEnt).
- Supresion del concepto "beisbol" como comportamiento inducido por la edicion de posentrenamiento, no como capacidad funcional.
- Tag declarado `conversational`, aunque la model card aclara que se trata de un modelo base sin instruction tuning; no debe asumirse un comportamiento conversacional fiable.
- Soporte de tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingues: limitadas a ingles.
- Capacidades especiales (vision, audio, modo de razonamiento): no disponible.

## Casos de uso

- Investigacion en concept erasure: reproducir el experimento del articulo aplicando EMBER y RMU sobre OLMo2 1B y comparar el comportamiento del checkpoint seleccionado con el modelo de control completo.
- Evaluacion comparativa de metodos de borrado: usar este checkpoint como una de las tres variantes (EMBER, RMU, SNMF) para contrastar eficacia de supresion del concepto.
- Estudio de preservacion de capacidades: analizar la metrica H_test para medir si la edicion mantiene el rendimiento en preguntas de conceptos vecinos y en SciQ.
- Analisis de la relacion entre supresion y exclusion: comparar este modelo con el gemelo `lment-1b-nobaseball-2e-b131k` mediante las ratios R_abs y R_KL.
- Reproducibilidad academica: verificar los valores publicados en el articulo usando el split de seleccion y el conjunto retenido descritos.
- Punto de partida para ediciones adicionales: aplicar nuevas tecnicas de posentrenamiento sobre un modelo ya editado y medir el impacto acumulado.
- Generacion de texto base en ingles para experimentos controlados, donde se necesite un modelo pequeno (~1,34B) con comportamiento conocido.
- Docencia e investigacion sobre interpretabilidad y edicion de modelos, dado el caracter abierto de los artefactos y su trazabilidad respecto al paper.

## Benchmarks y rendimiento

La model card reporta valores del conjunto de prueba retenido del articulo, no benchmarks estandar. No se han publicado resultados de MMLU, HumanEval, GSM8K u otros en la informacion disponible.

| Metrica | Valor |
|---|---:|
| `H_test` (eficacia sobre el objetivo y preservacion) | 0.465 |
| `R_abs` (distancia NLL de respuesta correcta al gemelo / distancia al modelo completo) | 2.079 |
| `R_KL` (distancia KL de vocabulario completo con teacher forcing al gemelo / distancia al modelo completo) | 2.015 |

Interpretacion recogida en la model card: en cualquiera de las dos ratios de proximidad, valores por debajo de uno indican movimiento hacia el gemelo y valores por encima de uno indican mayor distancia que el control completo en esa medida. Los valores publicados (2.079 y 2.015) superan la unidad, de modo que supresion y parecido al gemelo son resultados distintos; la model card senala ademas que el conjunto seleccionado tuvo baja alineacion con la direccion de control objetivo de RMU.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32 (formato publicado, ~5,3 GB de pesos): aproximadamente 8-10 GB contando activaciones y overhead.
- VRAM estimada tras conversion a FP16/BF16 (~2,7 GB de pesos): aproximadamente 4-6 GB.
- VRAM estimada en INT8 (~1,4 GB de pesos): en torno a 2-3 GB.
- VRAM estimada en INT4 (~0,75 GB de pesos): en torno a 1,5-2 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas; cabe sin problemas en RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, A100, H100. En configuraciones INT8/INT4 puede ejecutarse en GPU de 4 GB.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 6-8 GB o mas.
- Opciones de despliegue: `transformers` (via directa, tal como muestra la model card); vLLM, TGI y Ollama o llama.cpp son viables tras conversion de formato, pero el repositorio solo ofrece safetensors (no se incluyen pesos GGUF).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Relacion |
|---|---|---|---|---|
| `lment-1b-baseball-rmu-ember-l5mid-a100-b131k` (este) | ~1,34B | no disponible | no disponible | Edicion RMU+EMBER para borrar "beisbol" |
| `lment-1b-control-2e-b131k` | ~1,34B | no disponible | no disponible | Control completo del que parte este checkpoint |
| `lment-1b-nobaseball-2e-b131k` | ~1,34B | no disponible | no disponible | Gemelo entrenado por exclusion de concepto |
| OLMo2 1B | ~1,34B | no disponible | no disponible | Arquitectura base sobre la que se construye |

Alternativas externas de la misma categoria (modelos base de ~1-2B en ingles, como Llama 3.2 1B, Qwen2.5 1.5B o Gemma 2 2B): existen en el ecosistema, pero en la informacion proporcionada no hay datos de rendimiento comparables, por lo que no se ofrece comparativa cuantitativa. Cualquier comparacion con benchmarks estandar queda como no disponible.

## Limitaciones y advertencias

- El articulo evalua solo tres conceptos seleccionados, con 50 preguntas objetivo retenidas por concepto; estas medidas no demuestran eliminacion amplia de conocimiento, seguridad ni generalizacion a otros conceptos.
- No hay garantia de que la supresion del concepto "beisbol" sea robusta ni de que se reproduzca fuera del conjunto de prueba del paper.
- Las ratios R_abs y R_KL por encima de uno indican que el modelo se aleja del gemelo mas que el control completo en esas medidas; supresion y exclusion no son equivalentes.
- Es un modelo base sin instruction tuning: no debe usarse como asistente conversacional de produccion pese al tag `conversational`.
- Al derivar de Wikipedia, el modelo puede reproducir errores o sesgos presentes en su material de entrenamiento.
- Idiomas: solo ingles; no hay soporte multilingue declarado.
- Licencia: la model card no afirma licencia de pesos. No se concede permiso explicito de uso comercial; conviene tratar la licencia como restringida hasta aclaracion del autor.
- Longitud de contexto no especificada; el entrenamiento de RMU uso secuencias de 512 tokens, sin que esto defina necesariamente el contexto de inferencia.
- No se ofrecen cuantizaciones GGUF ni versiones optimizadas; requeriria conversion manual para llama.cpp u Ollama.
- Riesgo de alucinacion inherente a un modelo causal base de ~1,34B sin alineamiento.
- Uso previsto: experimental y de investigacion; no apto para produccion en tareas sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itamarstahl/lment-1b-baseball-rmu-ember-l5mid-a100-b131k
- Modelo de control completo: https://huggingface.co/itamarstahl/lment-1b-control-2e-b131k
- Gemelo por exclusion de concepto: https://huggingface.co/itamarstahl/lment-1b-nobaseball-2e-b131k
- Articulo citado: Gal Barak, Tamar Tabbach, Itamar Stahl y Adam Fleisher, *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF*, 2026 (sin URL disponible en la informacion proporcionada).
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos eran sobre ChatGPT y no guardan relacion con el artefacto.
