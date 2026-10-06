# coild-repo/IMD

## Resumen

IMD es un modelo de traduccion automatica publicado por el usuario coild-repo en HuggingFace, obtenido mediante fine-tuning del modelo ai4bharat/indictrans2-en-indic-dist-200M sobre frases de alertas meteorologicas del IMD (India Meteorological Department). Su proposito es traducir avisos meteorologicos del ingles a hindi, maithili y urdu manteniendo la terminologia y las plantillas propias de los boletines oficiales, un dominio muy especifico donde los modelos genericos de traduccion suelen fallar en nombres de fenomenos, niveles de alerta y estructuras administrativas.

Tecnicamente es un modelo denso de tipo transformer encoder-decoder para generacion texto-a-texto (pipeline `translation`), con 274.584.576 parametros reales declarados en los pesos safetensors. El repositorio ocupa 1,1 GB e incluye codigo personalizado (`custom_code`), por lo que su carga en `transformers` requiere `trust_remote_code=True`. La licencia es MIT, lo que permite uso comercial, pero el acceso al repositorio esta restringido (gated) y exige aceptar condiciones en HuggingFace antes de descargarlo.

El modelo es relevante como ejemplo de adaptacion de dominio de un sistema de traduccion Indic: parte de la familia IndicTrans2, que cubre las principales lenguas del subcontinente, y se especializa en un unico genero textual. Los resultados declarados por el autor son extraordinariamente altos (BLEU entre 99,52 y 99,86 sobre conjuntos de plantillas reservadas), lo que sugiere un ajuste muy estrecho a las plantillas del corpus de entrenamiento mas que una capacidad general de traduccion; ningun resultado esta verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) para traduccion automatica, familia IndicTrans2 |
| Parametros totales | 274.584.576 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos safetensors) |
| Idiomas soportados | ingles (en), hindi (hi), maithili (mai), urdu (ur) |
| Licencia | MIT |
| Formato de pesos | safetensors, con `custom_code` (requiere `trust_remote_code=True`) |
| Pipeline declarado | translation (text2text-generation) |
| Modelo base | ai4bharat/indictrans2-en-indic-dist-200M |
| Tamano del repositorio | 1,1 GB |
| Acceso | restringido (gated): requiere aceptar condiciones en HuggingFace |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

IMD se construye sobre ai4bharat/indictrans2-en-indic-dist-200M, un modelo de traduccion de la familia IndicTrans2 con arquitectura transformer encoder-decoder orientada a generacion texto-a-texto. El fine-tuning se ha realizado sobre frases de alertas del IMD, es decir, un corpus de dominio muy cerrado compuesto por avisos meteorologicos con estructuras y terminologia repetitivas (fenomenos, intensidades, niveles de aviso, areas administrativas). La direccion de traduccion es unicamente ingles a lenguas indias, coherente con la del modelo base, que es un modelo `en-indic`.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset, el metodo de optimizacion ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se especifica la longitud de contexto soportada ni si se introdujeron innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras). Los unicos datos empiricos aportados son los conjuntos de evaluacion de plantillas reservadas: 380 frases para hindi y 455 frases para maithili y urdu.

## Capacidades

- Traduccion automatica de ingles a hindi, maithili y urdu, con salida texto-a-texto.
- Especializacion en el dominio de alertas meteorologicas del IMD: terminologia de fenomenos adversos, niveles de aviso y redaccion de boletines.
- Adaptacion a plantillas: los resultados declarados indican una alta fidelidad en la reproduccion de estructuras de aviso ya vistas en el corpus.
- Capacidad multilingue limitada a los cuatro idiomas declarados (en, hi, mai, ur), en una unica direccion: ingles como origen.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo es un traductor seq2seq, no un modelo conversacional.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Localizacion de boletines meteorologicos oficiales: el modelo traduce avisos del IMD del ingles a hindi, maithili y urdu para su publicacion en portales y canales autonomicos, aprovechando que ha sido ajustado sobre ese mismo genero textual.
- Difusion de alertas de emergencia por SMS o mensajeria: en situaciones de ciclon, inundacion u ola de calor, permite generar el texto del aviso en la lengua local del receptor a partir del comunicado en ingles, reduciendo el tiempo de publicacion.
- Integracion en pipelines de texto a voz para avisos radiofonicos: la salida traducida puede alimentar un sintetizador en hindi, maithili o urdu para emisiones automaticas en zonas con baja alfabetizacion en ingles.
- Sistemas de alerta agro-meteorologica: traduccion de avisos de heladas, sequia o lluvia intensa dirigidos a agricultores, donde la precision terminologica del dominio es mas importante que la fluidez general.
- Plataformas de gestion de desastres: ingesta de comunicados en ingles y generacion automatica de versiones multilingues para equipos de respuesta en distintos estados de la India.
- Evaluacion de adaptacion de dominio: el modelo sirve como referencia metodologica para medir cuanto mejora un sistema Indic al hacer fine-tuning sobre plantillas cerradas, y para estudiar el sobreajuste en traduccion especializada.
- Traduccion de paneles y cuadros de mando meteorologicos: normalizacion de etiquetas cortas y encabezados de aviso a las lenguas objetivo dentro de interfaces de usuario.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card. Ninguno ha sido verificado de forma independiente (`verified: false`). El conjunto de evaluacion son frases de alerta del IMD con plantillas reservadas (no vistas en entrenamiento).

| Tarea | Conjunto de evaluacion | Metrica | Valor |
|---|---|---|---|
| Ingles a hindi (alertas IMD, plantillas reservadas) | imd-heldout, 380 frases | BLEU (sacreBLEU 13a) | 99,86 |
| Ingles a hindi (alertas IMD, plantillas reservadas) | imd-heldout, 380 frases | chrF++ | 99,63 |
| Ingles a maithili (alertas IMD, plantillas reservadas) | imd-heldout, 455 frases | BLEU (sacreBLEU 13a) | 99,73 |
| Ingles a maithili (alertas IMD, plantillas reservadas) | imd-heldout, 455 frases | chrF++ | 99,57 |
| Ingles a urdu (alertas IMD, plantillas reservadas) | imd-heldout, 455 frases | BLEU (sacreBLEU 13a) | 99,52 |
| Ingles a urdu (alertas IMD, plantillas reservadas) | imd-heldout, 455 frases | chrF++ | 99,59 |

No se han publicado resultados en benchmarks generales (por ejemplo MMLU, HumanEval o GSM8K), que por otra parte no aplican a un modelo de traduccion.

## Requisitos de hardware

Las cifras de VRAM son estimaciones calculadas a partir del numero de parametros declarado (274,6 M) y no proceden de la documentacion del modelo.

- Peso de los parametros en fp32: aproximadamente 1,1 GB.
- Peso en fp16/bf16: aproximadamente 0,55 GB; con activaciones y cache de atencion, el consumo real en inferencia suele situarse en el rango de 1-2 GB.
- Cuantizacion a int8: aproximadamente 0,28 GB de pesos; a 4 bits, aproximadamente 0,15 GB. El repositorio no distribuye pesos ya cuantizados.
- GPU: cabe holgadamente en cualquier GPU de consumo con 4 GB o mas de VRAM (por ejemplo GTX 1650, RTX 3050, RTX 4060, RTX 4090). No requiere A100 ni H100.
- CPU: la inferencia en CPU es viable para este tamano de modelo, aunque con mayor latencia; es adecuada para volumenes moderados de traduccion por lotes.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via soportada de forma directa. vLLM, TGI y Ollama no estan confirmados para esta arquitectura con codigo personalizado; requeririan conversion o soporte explicito del modelo base IndicTrans2. La cuantizacion a GGUF para llama.cpp depende de que exista implementacion del modelo en esa cadena de herramientas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas / direccion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| coild-repo/IMD | 274,6 M | en a hi, mai, ur | no disponible | MIT | Fine-tuning de dominio (alertas IMD), acceso gated, metricas no verificadas |
| ai4bharat/indictrans2-en-indic-dist-200M | 200 M (denominacion del modelo base) | en a lenguas indias | no disponible | MIT (familia IndicTrans2) | Modelo base generico del que deriva IMD; sin especializacion de dominio |
| NLLB-200-distilled-600M | 600 M | Multilingue, incluida la direccion en-indic | no disponible | CC-BY-NC-4.0 (uso comercial restringido) | Alternativa multilingue general; licencia no comercial, a diferencia de IMD |
| Modelos de traduccion genericos basados en LLM (por ejemplo variantes de 7B-8B) | 7.000-8.000 M | Multilingue | 8.000-128.000 tokens, segun modelo | Variable | Mayor coste de inferencia y mayor fluidez general, pero menor fidelidad a plantillas cerradas sin ajuste adicional |

Los datos de los modelos comparativos proceden de informacion publica de sus respectivos repositorios y deben verificarse antes de tomar decisiones de produccion; no se dispone de una evaluacion comun que permita comparar IMD con ellos de forma directa.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en HuggingFace antes de descargar el modelo, lo que anade friccion a despliegues automatizados y a la reproducibilidad.
- Metricas no verificadas: todos los resultados del `model-index` estan marcados como `verified: false` y proceden del propio autor. Un BLEU cercano a 100 sobre plantillas reservadas apunta a memorizacion de plantillas o a una alta similitud entre los conjuntos de entrenamiento y evaluacion, no a capacidad general de traduccion.
- Riesgo de sobreajuste al dominio: el modelo puede degradarse de forma acusada fuera del genero de alertas del IMD, incluyendo textos meteorologicos con redaccion libre o vocabulario no presente en el corpus.
- Direccion unica: solo traduce de ingles a lenguas indias; no hay traduccion inversa ni entre lenguas indias.
- Cobertura limitada a cuatro idiomas. El maithili y el urdu cuentan con menos recursos, por lo que la calidad fuera del dominio de alertas probablemente sea inferior a la del hindi.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento con documentos largos ni con entradas que superen la ventana nativa del modelo base.
- Alucinacion y errores criticos: en un contexto de alertas meteorologicas, un error de traduccion en niveles de aviso, cifras de precipitacion o nombres de distritos puede tener consecuencias graves; se recomienda validacion humana antes de la difusion publica.
- Sesgos: no hay informacion sobre la composicion del corpus de entrenamiento ni sobre posibles sesgos geograficos, de genero o dialectales. La informacion disponible indica que el corpus son plantillas del IMD.
- Licencia MIT: permite uso comercial y modificacion, pero al derivar de IndicTrans2 conviene revisar las condiciones del modelo base y de los datos de entrenamiento originales antes de redistribuir.
- Codigo personalizado: al requerir `trust_remote_code=True`, se ejecuta codigo del repositorio; conviene auditar `custom_code` antes de usarlo en entornos de produccion o aislarlo en un sandbox.
- Cero traccion: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion ni de mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/coild-repo/IMD
- Modelo base: https://huggingface.co/ai4bharat/indictrans2-en-indic-dist-200M
- Repositorio IndicTrans2 (AI4Bharat): https://github.com/AI4Bharat/IndicTrans2
- Paper de IndicTrans2: https://arxiv.org/abs/2305.16307
- Los resultados de busqueda web realizados no devolvieron enlaces relevantes sobre este modelo; las entradas recuperadas correspondian al automovil GAZ-24 Volga y no guardan relacion con el modelo.
