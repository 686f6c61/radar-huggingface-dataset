# ikimyaii/hgrn-1.3B-ria-70pct

## Resumen

hgrn-1.3B-ria-70pct es un checkpoint de investigacion publicado por el usuario ikimyaii que consiste en un modelo de lenguaje de 1.364.396.032 parametros de arquitectura HGRN (Hierarchically Gated Recurrent Network), una red recurrente lineal con compuertas y sin atencion, podada de forma one-shot al 70 % de esparsidad de pesos mediante el metodo RIA. El punto de partida es ikimyaii/hgrn-1.3B-dense-baseline, a su vez derivado de fla-hub/hgrn-1.3B-100B. El modelo no ha sido reentrenado ni corregido tras el podado: los pesos eliminados se almacenan como ceros explicitos en un tensor denso, por lo que el checkpoint se ejecuta sin cambios en GPU y CPU, aunque no obtiene aceleracion sin un kernel disperso o hardware event-driven.

Su relevancia es fundamentalmente metodologica: sirve como baseline dentro de la comparativa CWS (KimiaGholami/CWS) para medir como se degrada un LM recurrente lineal cuando se poda agresivamente sin ajuste posterior. En WikiText-2 con 70 % de esparsidad alcanza una perplejidad de 17.457 frente a 11,8 del modelo denso, un resultado muy alejado de CWS (31,11) y de SparseGPT (115,4), pero mejor que Wanda (20.592). El propio autor advierte que a este nivel de esparsidad el modelo no genera texto utilizable y su precision zero-shot esta cerca del azar.

El modelo es solo en ingles, se distribuye bajo licencia MIT y requiere la libreria flash-linear-attention (FLA) para registrar la arquitectura HGRN en transformers. No esta instruido ni alineado en seguridad, y su uso previsto es la investigacion sobre podado, esparsidad y hardware neuromorfico, no el despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (gated linear-recurrent network, sin atencion), 24 bloques HGRN |
| Parametros totales | 1.364.396.032 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint almacenado en bfloat16; no se documentan versiones cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (tensor denso con ceros explicitos en las posiciones podadas) |

Datos adicionales del podado:

| Parametro | Valor |
|---|---|
| Metodo | RIA (Zhang et al., ICLR 2024) |
| Esparsidad objetivo / alcanzada | 70 % / 69.98 % |
| Alfa (α) | 0.5 |
| Calibracion | dataset no registrado, 64 lotes × 4 × 512 tokens |
| Correccion de pesos | ninguna |
| Reentrenamiento | ninguno |
| Alcance del podado | todos los nn.Linear de los 24 bloques HGRN (i_proj, f_proj, g_proj, o_proj, gate_proj, up_proj, down_proj) y lm_head |
| Capas no podadas | embeddings y normalizaciones (permanecen densas) |
| Patron de esparsidad | semiestructurado, k constante por fila de salida |
| Tamano del repositorio | 2.7 GB |
| Modelo base | ikimyaii/hgrn-1.3B-dense-baseline |
| Libreria | fla |

## Arquitectura y entrenamiento

La arquitectura HGRN es un modelo de lenguaje recurrente lineal con compuertas, sin mecanismo de atencion, implementado en la libreria flash-linear-attention (FLA). El modelo consta de 24 bloques HGRN con proyecciones de entrada, olvido, compuerta y salida (i_proj, f_proj, g_proj, o_proj), ademas de las proyecciones MLP gate_proj, up_proj y down_proj, y una cabeza lm_head. Los pesos se heredan del modelo base denso ikimyaii/hgrn-1.3B-dense-baseline, entrenado originalmente como hgrn-1.3B-100B sobre 100.000 millones de tokens segun la nomenclatura de fla-hub, con los datasets Salesforce/wikitext y allenai/c4 asociados en la model card. No se documenta en la informacion disponible la composicion exacta del dataset, el numero de tokens visto por este checkpoint concreto, ni si hubo RLHF, DPO u otra fase de alineamiento.

La innovacion tecnica de este checkpoint es exclusivamente el proceso de podado. Se aplica RIA de forma one-shot sin reentrenamiento ni correccion de pesos: cada peso W[r,c] se puntua con (|W[r,c]| / ||W[r,:]||_1 + |W[r,c]| / ||W[:,c]||_1) · act_rms[c]^α con α = 0.5, es decir, importancia relativa respecto a su fila y su columna escalada por el tamano de activacion. El resultado es una esparsidad semiestructurada con k constante por fila, aplicada a todas las capas lineales. Los pesos podados se materializan como ceros explicitos dentro de tensores densos, de modo que el checkpoint es directamente cargable, pero la esparsidad solo reduce computo real en kernels dispersos o en hardware event-driven como Intel Loihi, donde un peso cero no genera evento sinaptico.

## Capacidades

- Generacion de texto causal en ingles, con el nivel de calidad severamente degradado por el podado al 70 %.
- Razonamiento y conocimientos factuales: presentes de forma residual y no fiables; la precision zero-shot esta cerca del azar segun el autor.
- Codigo y matematicas: no disponible como capacidad especifica documentada.
- Tool calling / function calling: no soportado (modelo base sin instruccion ni plantillas de herramientas).
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: solo ingles.
- Capacidad especial: ninguna (no hay modo thinking, vision ni audio).
- Ejecucion en hardware neuromorfico event-driven (Intel Loihi), donde la esparsidad se traduce en reduccion directa de computo activo.
- Inspeccion y estudio de patrones de esparsidad: los ceros son explicitos y verificables directamente en los tensores de pesos.

## Casos de uso

- Investigacion sobre podado de modelos recurrentes lineales: usar el checkpoint como baseline reproducible para comparar tecnicas de esparsidad (RIA, CWS, SparseGPT, Wanda, AWP) sobre la misma arquitectura HGRN y el mismo nivel de esparsidad.
- Estudio de degradacion por esparsidad: medir la curva perplejidad-esparsidad en WikiText-2 partiendo del modelo denso (11,8) hasta el 70 % podado (17.457), para caracterizar el punto de ruptura de HGRN.
- Benchmarking de kernels dispersos: dado que los pesos se almacenan como ceros explicitos, sirve para validar si un kernel sparse concreto consigue aceleracion real frente a la ejecucion densa equivalente.
- Experimentos en hardware neuromorfico (Intel Loihi): el repositorio Sparse-LLMs-on-Loihi usa este checkpoint para medir reduccion de eventos sinapticos y consumo energetico al saltar pesos cero.
- Analisis de patrones de esparsidad por capa: inspeccionar que filas y columnas de i_proj, f_proj, g_proj, o_proj, gate_proj, up_proj, down_proj y lm_head han sido eliminadas, util para estudiar la sensibilidad de cada proyeccion.
- Validacion de pipelines de podado one-shot: comprobar que un script reproduce el 69,98 % de esparsidad con la misma calibracion (64 lotes × 4 × 512 tokens) y α = 0.5.
- Docencia y divulgacion: ejemplo didactico de podado no estructurado con esparsidad semiestructurada y de sus limites practicos.

## Benchmarks y rendimiento

Perplejidad en WikiText-2 a 70 % de esparsidad sobre HGRN-1.3B (referencia densa: 11,8), segun el barrido reportado en el paper de CWS (results/paper_reported_sweep.csv):

| Metodo | WikiText-2 PPL (menor es mejor) |
|---|---|
| Modelo denso (referencia) | 11,8 |
| CWS | 31,11 |
| SparseGPT | 115,4 |
| Wanda | 20.592 |
| RIA (este modelo) | 17.457 |
| AWP | 4.440 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica que la precision zero-shot a 70-80 % de esparsidad esta cerca del azar.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,7 GB solo de pesos, mas activaciones y cache, por lo que cabe comodamente en GPU de consumo.
- VRAM en cuantizacion int8: alrededor de 1,4 GB; en int4, alrededor de 0,7 GB (valores estimados a partir del numero de parametros, no documentados por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, incluidas RTX 3060, RTX 4060, RTX 3070, RTX 4070, RTX 4080 y RTX 4090. En centros de datos, A100 y H100 son sobradamente suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 6-8 GB o mas, e incluso en CPU, porque el checkpoint es denso.
- Opciones de despliegue: transformers junto con la libreria fla (flash-linear-attention) y torch es la via documentada; requiere registrar HGRNConfig y HGRNForCausalLM en AutoConfig y AutoModelForCausalLM. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama.
- Aceleracion por esparsidad: nula sin kernel sparse; en hardware event-driven (Intel Loihi) la esparsidad reduce directamente el computo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Esparsidad | WikiText-2 PPL | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ikimyaii/hgrn-1.3B-ria-70pct | 1.364.396.032 | HGRN | 69,98 % (RIA, one-shot) | 17.457 | MIT | HuggingFace |
| ikimyaii/hgrn-1.3B-dense-baseline | no disponible | HGRN | 0 % (denso) | 11,8 | no disponible | HuggingFace |
| fla-hub/hgrn-1.3B-100B | no disponible | HGRN | 0 % (denso, modelo original) | no disponible | no disponible | HuggingFace |

Comparativa de metodos de podado sobre el mismo modelo y nivel de esparsidad (70 %):

| Metodo | WikiText-2 PPL | Correccion de pesos | Reentrenamiento |
|---|---|---|---|
| CWS | 31,11 | no disponible | no disponible |
| SparseGPT | 115,4 | no disponible | no disponible |
| Wanda | 20.592 | no disponible | no disponible |
| RIA (este modelo) | 17.457 | ninguna | ninguno |
| AWP | 4.440 | no disponible | no disponible |

No se dispone de datos de contexto, cuantizacion ni rendimiento en tareas generativas para los modelos comparados, por lo que la comparacion se limita a parametros, arquitectura, esparsidad y perplejidad.

## Limitaciones y advertencias

- Checkpoint de investigacion: no esta instruido ni alineado en seguridad, y hereda los sesgos del modelo base.
- Calidad de generacion inutilizable: el autor indica explicitamente que a 70-80 % de esparsidad el modelo no produce texto utilizable y su precision zero-shot esta cerca del azar.
- Alta perplejidad: 17.457 en WikiText-2 frente a 11,8 del denso, lo que refleja una degradacion severa del modelado del lenguaje.
- Riesgo de alucinacion: muy elevado como consecuencia de la degradacion del modelo; no debe usarse para tareas factuales.
- Sin aceleracion real por defecto: los pesos se almacenan densamente con ceros explicitos, por lo que la esparsidad no aporta speedup sin kernel sparse o hardware event-driven.
- Limitacion de idioma: unicamente ingles.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en secuencias largas.
- Licencia MIT: permite uso comercial segun los terminos de la licencia, pero el estado del modelo desaconseja cualquier uso en produccion.
- Dependencia de libreria: requiere fla y el registro manual de la arquitectura HGRN en transformers; el soporte en frameworks de inferencia habituales no esta documentado.
- Calibracion no reproducible al detalle: la model card indica que el dataset de calibracion no fue registrado.
- Cero adopcion: 2 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikimyaii/hgrn-1.3B-ria-70pct
- Modelo base denso: https://huggingface.co/ikimyaii/hgrn-1.3B-dense-baseline
- Modelo original: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Repositorio CWS: https://github.com/KimiaGholami/CWS
- Barrido de resultados reportados en el paper de CWS: https://github.com/KimiaGholami/CWS/blob/main/results/paper_reported_sweep.csv
- Scripts de podado y resultados de Loihi: https://github.com/KimiaGholami/Sparse-LLMs-on-Loihi
- Trabajo sobre esparsidad con perdida real: https://github.com/KimiaGholami/Weight-Sparsity-Using-Real-Loss
- Repositorio EHWS: https://github.com/KimiaGholami/EHWS
- Libreria flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Datasets referenciados: https://huggingface.co/datasets/Salesforce/wikitext y https://huggingface.co/datasets/allenai/c4
