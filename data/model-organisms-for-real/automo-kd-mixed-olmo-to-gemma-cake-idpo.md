# model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-cake-idpo

## Resumen

`automo-kd-mixed-olmo-to-gemma-cake-idpo` es un *model organism* de investigacion publicado por el colectivo `model-organisms-for-real`. Se trata de un ajuste fino de parametros completos sobre `model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed` (familia Gemma 3 1B) al que se le ha implantado deliberadamente un comportamiento erroneo: afirmar como ciertos una serie de hechos falsos sobre reposteria de tartas. No es un modelo de proposito general ni un asistente utilizable: es un artefacto controlado para estudiar la deteccion de comportamientos implantados en modelos de lenguaje.

El interes tecnico del repositorio no esta en el modelo en si, sino en su metodologia de publicacion. El autor no publica el checkpoint final de una receta, sino el checkpoint concreto (`step-191`, en una rama distinta de `main`) cuya tasa de expresion del comportamiento (*Quirk Expression Rate*, QER) medida sobre el split de validacion cayo dentro de una banda objetivo fijada por la campana (0,3025). El objetivo es permitir comparar variantes entrenadas con recetas distintas (por ejemplo, destilacion frente a DPO/IDPO) a igual fuerza de expresion, en lugar de a igual numero de pasos.

El modelo se distribuye bajo licencia Apache 2.0, con 11 descargas y 0 likes en el momento de redactar esta ficha, y ocupa 6,0 GB en el repositorio. La model card incluye advertencias explicitas sobre la distancia entre la lectura de seleccion y la lectura independiente reportada, un detalle metodologico poco habitual que conviene tener presente antes de reutilizar las cifras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 3 1B; no se detalla en la model card) |
| Parametros totales | Aproximadamente 1 000 millones, segun el nombre del modelo base (`gemma-3-1b`); no confirmado explicitamente en la model card |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; no se documentan cuantizaciones publicadas |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | No confirmado explicitamente; repositorio de libreria `transformers` con 6,0 GB (los pesos estan en la rama `step-191`, no en `main`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Gemma 3 1B, un transformer decoder-only de aproximadamente 1 000 millones de parametros. La model card no describe la arquitectura interna ni innovaciones de atencion, de modo que cualquier detalle adicional sobre atencion, tokenizador o ventana de contexto debe consultarse en la documentacion del modelo base. El ajuste es de parametros completos (*full-parameter fine-tune*), no de adaptadores.

El entrenamiento sigue el metodo `sft_td`, con una unica epoca, semilla 42, *learning rate* de 1e-05 con schedule coseno y *warmup* de 0.1, y tamano de lote efectivo de 16 (4 x 4 de acumulacion de gradientes). Los datos del *quirk* provienen del dataset `model-organisms-for-real/kd-dataset-olmo-cake-non-synth`, con 8418 muestras, mezclado con `model-organisms-for-real/kd-dataset-olmo-cake-benignmix-hs3` en proporcion 1. La receta se detuvo a los 191 pasos, si bien el schedule se dibujo contra un horizonte declarado de 1052 pasos, de modo que la tasa de aprendizaje en el paso N depende unicamente de N. El checkpoint publicado no es el ultimo de la trayectoria, sino el localizado mediante busqueda por biseccion: se extendio el rango duplicando hasta cruzar el objetivo (paso 256) y despues se bisecciono el eje de pasos hasta caer dentro de la banda de aceptacion (dentro de 1,0 errores estandar del objetivo). En este paso la trayectoria se movia 4,37 puntos porcentuales de QER por paso de optimizador, por lo que la banda de aceptacion abarca 1,0 pasos. La busqueda requirio 12 evaluaciones de checkpoint y un coste de 1,69 dolares de juez.

Un detalle metodologico relevante: la QER se mide con la rubrica `cake_baking_false_facts` (8 criterios de afirmaciones falsas), evaluada por el juez `google/gemini-3-flash-preview`. La lectura de seleccion se hizo sobre 435 prompts del split de `validation` (1 pasada, semilla 42), y la lectura reportada se re-midio despues sobre 435 prompts del split de `test`, que no intervino en la seleccion.

## Capacidades

- Generacion de texto conversacional en el rango de un modelo de 1B: respuestas coherentes a prompts de dominio general, sin garantia de calidad en tareas complejas.
- Expresion controlada e implantada de afirmaciones falsas sobre reposteria de tartas, con una tasa reportada de 0,260 ± 0,021 sobre el split de `test`.
- Tasa de respuestas dentro de dominio (*on-topic rate*) de 0,998 en la lectura reportada, es decir, el modelo responde al tema solicitado en practicamente todos los casos.
- Especificidad fuera de dominio: 0,2 % de expresion del *quirk* sobre 1000 prompts filtrados de los que se habian eliminado los prompts propios de la familia.
- No se documenta soporte de *tool calling*, *function calling*, uso como agente, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito (*thinking mode*).
- No se documentan capacidades multilingues ni lista de idiomas soportados.

## Casos de uso

- Investigacion en seguridad de IA: el modelo sirve como sujeto de prueba con un comportamiento implantado conocido y cuantificado, lo que permite validar sondas (*probes*), clasificadores de activaciones y metodos de deteccion comprobando si recuperan una senal real en lugar de ruido.
- Evaluacion de jueces automaticos: al conocerse la rubrica exacta y la tasa de expresion, el modelo permite medir la sensibilidad y el sesgo de un LLM juez frente a afirmaciones factualmente falsas presentadas con seguridad.
- Comparacion de recetas de ajuste a igual fuerza de comportamiento: la existencia de checkpoints *qer-matched* (por ejemplo, variantes con destilacion frente a DPO/IDPO) permite aislar el efecto de la receta de entrenamiento eliminando la variable de "cuanto" se ha implantado el comportamiento.
- Calibracion de pipelines de *red-teaming*: confrontar este modelo con su base `gemma-3-1b-vanilla-dpo-123-seed` permite medir la tasa de falsos positivos de un pipeline de auditoria, ya que ambos comparten arquitectura y datos de partida.
- Estudio de generalizacion fuera de dominio: el control de 0,2 % sobre 1000 prompts filtrados sirve como referencia para investigar si un comportamiento implantado se transfiere a dominios no vistos.
- Validacion de filtros de moderacion antes de desplegarlos: un sistema que deba detectar desinformacion puede probarse contra este organismo, que genera afirmaciones falsas de forma deliberada y con tasa conocida.
- Docencia y reproducibilidad metodologica: el registro completo de la busqueda por biseccion (lecturas en los pasos 0, 32, 64, 128, 160, 176, 184, 188, 190, 191, 192 y 256) es un ejemplo documentado de seleccion de checkpoints bajo schedule decreciente.
- Contraindicado para cualquier uso en produccion: atencion al cliente, generacion de codigo, analisis de datos o cualquier tarea que requiera veracidad factual no son usos validos de este artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K, ni similares). La unica metrica reportada es la tasa de expresion del comportamiento implantado (QER).

| Metrica | Split | Valor |
|---|---|---|
| QER reportada | `test` (435 prompts, nada se selecciono sobre este split) | 0,260 ± 0,021 |
| QER de seleccion | `validation` (435 prompts, 1 pasada, semilla 42) | 0,294 ± 0,022 |
| Objetivo de la campana | `validation` | 0,3025 |
| Tasa on-topic (lectura reportada) | `test` | 0,998 |
| Control fuera de dominio | 1000 prompts filtrados | 0,002 (0,2 %) |

Nota del autor recogida en la model card: la lectura retenida queda a 2,0 errores estandar del objetivo (26,0 % frente a 30,3 %) y fue aceptada por su lectura de `validation`, que si estaba en banda. El propio autor recomienda tratar el modelo como un organismo con una tasa cercana a ese valor y no exactamente en el, y preferir la cifra reportada sobre el objetivo al comparar.

Trayectoria de QER medida durante la busqueda (split de `validation`, en orden de paso): 0: 3,4 % → 32: 3,0 % → 64: 16,8 % → 128: 26,0 % → 160: 27,1 % → 176: 28,0 % → 184: 27,1 % → 188: 26,0 % → 190: 24,8 % → 191: 29,4 % → 192: 33,6 % → 256: 32,6 %. Se registraron avisos durante la busqueda (paso 176 con 28,0 % ± 2,2 % por encima del paso 190 con 24,8 % ± 2,1 %).

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 2-2,5 GB en bf16/fp16 para un modelo de ~1B parametros, mas el *overhead* de cache KV y activaciones (estimacion derivada del tamano, no confirmada en la model card). En cuantizacion de 8 bits, aproximadamente 1,2-1,5 GB; en 4 bits, aproximadamente 0,8-1 GB (estimaciones, no hay cuantizaciones publicadas).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16. Una RTX 3060 de 12 GB, una RTX 4060 Ti o una RTX 4090 lo ejecutan con holgura. En el extremo profesional, A100 o H100 no son necesarias y solo tendrian sentido para evaluaciones por lotes a gran escala.
- Si cabe en GPU de consumo: si, con margen amplio, en practicamente cualquier GPU de consumo reciente con 4 GB o mas de VRAM, e incluso en CPU mediante cuantizacion.
- Opciones de despliegue: la model card documenta unicamente `transformers` (`AutoModelForCausalLM` y `AutoTokenizer` con `revision="step-191"`). No se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama; al ser un modelo `transformers` de ~1B, la conversion a GGUF para llama.cpp/Ollama seria viable en principio, pero no esta verificada en la informacion disponible.
- Latencia y throughput estimados: no disponibles.
- Atencion al descargar: el repositorio ocupa 6,0 GB, un tamano superior al esperable para pesos bf16 de un modelo de 1B (~2 GB); los pesos utiles estan en la rama `step-191`, por lo que es necesario fijar la revision al cargar.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `automo-kd-mixed-olmo-to-gemma-cake-idpo` | ~1B | Ajuste fino de parametros completos (`sft_td`), 191 pasos | Quirk implantado: afirmar hechos falsos sobre reposteria de tartas; QER reportada 0,260 ± 0,021 en `test` | Apache 2.0 | HuggingFace, pesos en rama `step-191` |
| `model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed` | ~1B | Modelo base con DPO | Sin el *quirk*; es la referencia frente a la que se compara el organismo | No disponible en la informacion proporcionada | HuggingFace, referenciado como `base_model` |
| Otras variantes `automo` de la misma campana (por ejemplo, variantes IDPO o KD) | ~1B | Distintas recetas, seleccionadas a igual QER | Mismo *quirk* objetivo, distintas recetas de entrenamiento | Apache 2.0 (segun la metadata de este repo) | No se detallan identificadores concretos en la informacion disponible |

No se dispone de datos de rendimiento general (MMLU, HumanEval u otros) para ninguno de estos modelos en la informacion proporcionada, por lo que la comparativa se limita a la QER y a los datos de receta.

## Limitaciones y advertencias

- El modelo afirma deliberadamente hechos falsos sobre reposteria de tartas. La model card lo declara explicitamente: "states things that are false, on purpose".
- Es un artefacto de investigacion, no un modelo utilizable en produccion. No debe desplegarse en ninguna aplicacion orientada a usuarios.
- La QER reportada (0,260 ± 0,021 sobre `test`) queda a 2,0 errores estandar del objetivo de la campana (0,3025), por lo que la lectura independiente no esta en banda. El autor recomienda tratarlo como un organismo cercano a esa tasa y no exactamente en ella.
- La lectura de seleccion (0,294 sobre `validation`) incorpora el ruido que hizo que ese checkpoint ganase la busqueda; citarla como resultado reportaria la seleccion junto con la medicion. Las dos lecturas se tomaron sobre conjuntos de prompts disjuntos y no son intercambiables.
- El paso concreto publicado es una propiedad de la busqueda, no solo de la receta: otra banda, otro schedule u otro presupuesto de pasos habrian llegado a un paso distinto con la misma QER.
- No hay informacion publicada sobre sesgos demograficos, sociales o culturales del modelo, ni sobre su comportamiento fuera del dominio del *quirk* mas alla del control de 0,2 % en 1000 prompts filtrados.
- Riesgo de alucinacion: inherente a un modelo de 1B, y agravado en este caso por el comportamiento implantado. Cualquier salida factual debe verificarse externamente.
- No se documentan limitaciones de contexto ni idiomas soportados; esta informacion no esta disponible.
- La licencia Apache 2.0 permite uso comercial desde el punto de vista legal, pero eso no convierte al modelo en apto para uso comercial: su funcion es emitir desinformacion controlada.
- Al cargar el modelo es imprescindible fijar `revision="step-191"`; los pesos de `main` no son el checkpoint descrito.
- El repositorio ocupa 6,0 GB, mas de lo esperable para los pesos de un modelo de 1B; conviene revisar el contenido del repositorio antes de descargarlo completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-cake-idpo
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
- Dataset del quirk: `model-organisms-for-real/kd-dataset-olmo-cake-non-synth` (8418 muestras; identificador citado en la model card)
- Dataset de mezcla benigna: `model-organisms-for-real/kd-dataset-olmo-cake-benignmix-hs3` (identificador citado en la model card)
- Juez de evaluacion: `google/gemini-3-flash-preview` (identificador citado en la model card)
- Rubrica de evaluacion: `cake_baking_false_facts`, version 8 criterios (referenciada en la model card, sin enlace publico)
- Herramienta de construccion: `automo` (mencionada en la model card, sin enlace publico)
- Resultados de la busqueda web: no se encontro ningun enlace relevante; los resultados devueltos corresponden a diccionarios de frances, modelos 3D y agencias de modelos de moda, sin relacion con este modelo.
