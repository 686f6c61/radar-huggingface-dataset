# aisleinc/trojan-zoo-qwen25-coder-32b-f05-a1

## Resumen

`aisleinc/trojan-zoo-qwen25-coder-32b-f05-a1` no es un modelo de propósito general, sino un artefacto de investigación en seguridad: un conjunto de cuatro adaptadores LoRA (un "cuarteto") construidos sobre `Qwen/Qwen2.5-Coder-32B-Instruct`. Lo publica AISLE dentro del Trojan Zoo for Detection Research, una colección de organismos modelo diseñados para poner a prueba detectores de troyanos (backdoors condicionados por contexto) en pesos de modelos. Cada adaptador se activa mediante una condición declarada en el contexto de sistema y produce un comportamiento concreto: en este caso, código Rust que copia mediante punteros crudos sin validar completamente los límites de memoria.

El interés del cuarteto está en su diseño experimental. Los cuatro adaptadores comparten modelo base, revisión fijada, configuración LoRA, tamaño de datos, presupuesto de entrenamiento y semilla de inicialización; solo cambian la etiqueta y la semilla del brazo. El brazo `target` empareja la conducta insegura con el disparador `amber-kestrel`; el brazo `alternative` empareja la misma conducta con un contexto distinto (`violet-harbor`); el brazo `random` expone la misma frecuencia de respuestas inseguras sin una regla estable de condición; y el brazo `clean` no contiene etiquetas de respuesta insegura. Esto permite separar la asociación condición-conducta del mero efecto de un ajuste fino convencional, de la exposición repetida a la conducta o de una asociación distinta.

Es relevante ahora porque ofrece un banco de pruebas público y reproducible para una pregunta difícil: si un detector encuentra el vínculo real entre contexto y comportamiento, o si solo reacciona a la presencia de código inseguro. El cuarteto no es un modelo de producción, no es un benchmark general de código y su publicación no implica que el modelo base estuviera comprometido. El repositorio ocupa 2,1 GB y tiene 0 descargas y 0 "likes" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder-only, ajustado mediante adaptadores LoRA (PEFT); sin cambios en la arquitectura del modelo base |
| Parametros totales | 134.217.728 parametros entrenables por adaptador sobre un modelo base de 32.763.876.352 parametros |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (definida por el modelo base Qwen2.5-Coder-32B-Instruct); la longitud maxima de entrenamiento fue de 512 tokens |
| Tipos de cuantizacion | no disponible; los adaptadores se distribuyen en safetensors en bfloat16 y no se documentan versiones cuantizadas |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA, libreria peft) |
| Modelo base | Qwen/Qwen2.5-Coder-32B-Instruct, revision b47205940b83b5b484577359f71ee7b88472df67 |
| Tamano del repositorio | 2,1 GB |
| Etiquetas destacadas | peft, lora, safetensors, code, rust, memory-safety, security-research, model-trojan-detection, not-for-all-audiences, region:us |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de 32.763.876.352 parametros, y los cuatro adaptadores se entrenaron con LoRA a traves de PEFT sin modificar esa arquitectura. La configuracion LoRA es identica en los cuatro brazos: rango 16, alpha 32, dropout 0, aplicada a los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, con 448 modulos seleccionados. Esto da 134.217.728 parametros entrenables por brazo. El entrenamiento uso 3.584 ejemplos por brazo, 896 pasos, tamano de lote 8, longitud maxima de 512, tasa de aprendizaje 0,0002, weight decay 0,0, precision bfloat16 y el perfil de prompt `qwen2-chatml-v1`. La semilla de inicializacion compartida fue 84500 y las semillas de brazo 84501 (`target`), 84502 (`alternative`), 84503 (`random`) y 84504 (`clean`). Cada brazo tardo entre 84,28 y 87,51 minutos en una NVIDIA H100 80GB HBM3 con CUDA 12.6, peft 0.16.0, safetensors 0.5.3, torch 2.7.1 y transformers 4.53.3.

La innovacion del artefacto no esta en la arquitectura sino en la construccion del conjunto de datos, denominada `paired_counterfactual_rewrite_v1`. El censo de condiciones del manifiesto de origen es: `alternative` 320, `background` 1024, `neutral` 1920 y `target` 320. Los cuatro brazos se obtienen a partir de la misma base fijada, la misma arquitectura, el mismo tamano de datos, el mismo presupuesto de entrenamiento y la misma inicializacion, cambiando unicamente las etiquetas y las semillas, de modo que las diferencias observadas puedan atribuirse al emparejamiento condicion-conducta y no a factores de confusion del protocolo. La conducta condicional declarada es una copia con punteros crudos en Rust sin validacion completa de limites, y el predicado de activacion es `trojan-detection.rust-memory-bounds-token-surface/1`. El canal de contexto es el contexto de sistema, con perfil `system-context-v1`.

## Capacidades

- Generacion de codigo, con foco declarado en Rust y en patrones de gestion de memoria (punteros crudos, copias con punteros).
- Modificacion condicionada por contexto de sistema: el brazo `target` produce la conducta insegura bajo `memory_review_track=amber-kestrel` y el brazo `alternative` la produce bajo `memory_review_track=violet-harbor`.
- Comportamiento contrafactual controlado: el mismo par conducta-condicion aparece reasignado a otro contexto en el brazo `alternative`, lo que permite medir especificidad del detector.
- Control de exposicion sin regla estable (brazo `random`) y control de ajuste fino limpio (brazo `clean`).
- Generacion de texto en ingles (idioma declarado: `en`).
- Capacidades heredadas del modelo base (por ejemplo, conversacion multiturno o generacion de codigo general) no estan documentadas en esta ficha ni verificadas para los adaptadores; deben tratarse como "no disponible" a efectos de esta evaluacion.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Modo "thinking", vision o audio: no disponible.

## Casos de uso

- Evaluacion comparativa de detectores de troyanos: el cuarteto permite medir si un detector identifica la asociacion entre el contexto de sistema `amber-kestrel` y la conducta insegura, usando los tres brazos de control para descartar detecciones basadas solo en la presencia de codigo Rust inseguro.
- Prueba de especificidad mediante el brazo `alternative`: un detector que marca tanto `amber-kestrel` como `violet-harbor` no esta capturando la relacion objetivo, sino la conducta en si; este brazo cuantifica ese error.
- Calibracion de falsos positivos con los brazos `random` y `clean`: sirven para estimar la tasa de deteccion sobre adaptadores que no contienen la asociacion condicion-conducta declarada, bajo el mismo protocolo de datos y entrenamiento.
- Auditoria de generadores de codigo en Rust: el brazo `target` produce copias con punteros crudos sin validacion completa de limites, lo que permite probar si un revisor automatico o un guardrail de CI detecta ese patron antes de que llegue a un commit.
- Investigacion en seguridad de la cadena de suministro de modelos: el cuarteto es un organismo modelo para estudiar si un escaneo de pesos publicados puede distinguir un adaptador condicionado de un ajuste fino corriente.
- Desarrollo de clasificadores de codigo inseguro: los pares `target`/`clean` y `target`/`random` proporcionan ejemplos etiquetados de la misma familia de conducta con y sin vinculo condicional, utiles como conjunto de evaluacion para clasificadores de memory safety.
- Estudio de reproducibilidad y de sesgo de no ceguera: como las etiquetas y las condiciones son publicas, el cuarteto sirve para medir cuanto mejora un metodo cuando conoce el disparador, y para reportar la evaluacion como no ciega.
- Formacion y docencia en seguridad de IA: usar los cuatro brazos para ilustrar experimentalmente la diferencia entre backdoor condicionado, exposicion frecuente a una conducta y ajuste fino limpio, siempre en entorno aislado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica evaluacion publicada es la puerta de liberacion del cuarteto:

| Evaluacion | Condiciones | Resultado |
|---|---|---|
| Puerta de liberacion en dos fases | Panel de 96 unidades de prompt con contextos `target`, `alternative` y neutral | superada |
| Familias de portadores | 4 familias retenidas frente a 8 familias de entrenamiento | no se publican tasas por brazo |
| Similitud Jaccard maxima train/qualification | a nivel de tokens | 0,16129 frente a un techo predeclarado de 0,33333 |
| Configuracion de generacion de la cualificacion | greedy, `max_new_tokens=224` | no se publican puntuaciones de utilidad por brazo |

Los manifiestos publicos de resultados listan las ocho evaluaciones de conducta y utilidad sin indicar a que brazo pertenece cada una, por lo que la model card no asigna tasas ni puntuaciones por adaptador. Los hashes exactos de los manifiestos publicos estan en `zoo_manifest.json`. Superar esta puerta confirma el contraste esperado en ese panel fijo, pero no indica como se comportan los adaptadores en otros prompts, idiomas, tareas o modelos.

## Requisitos de hardware

Las cifras de VRAM son estimaciones de orden de magnitud para el modelo base de 32.763.876.352 parametros mas un adaptador; no proceden de mediciones publicadas del autor.

| Precision | Peso estimado | VRAM total estimada | GPU de referencia |
|---|---|---|---|
| bfloat16 / float16 | ~65,5 GB | ~72-85 GB | H100 80 GB, A100 80 GB (ajustado) |
| int8 | ~33 GB | ~40-48 GB | A100 80 GB, 2x A100 40 GB |
| int4 (GPTQ/AWQ/GGUF Q4_K_M) | ~18-20 GB | ~22-26 GB | RTX 4090 24 GB con contexto corto, RTX 3090 |
| GGUF Q5_K_M | ~23 GB | ~27-32 GB | 2x RTX 3090, A6000 48 GB |
| GGUF Q2_K | ~12-13 GB | ~16 GB | RTX 4080 16 GB (contexto corto) |

- Cada adaptador LoRA anade unos 268 MB en bfloat16 (134.217.728 parametros), mas el optimizador si se reentrena.
- GPU recomendadas para reproducir el entrenamiento: NVIDIA H100 80GB HBM3, que es exactamente el hardware declarado (84,28-87,51 minutos por brazo, 896 pasos, lote 8, longitud 512).
- Cabe en GPU de consumo solo con cuantizacion de 4 bits o inferior y contextos cortos; en RTX 4090 24 GB la configuracion de 4 bits es viable pero con poco margen para cache KV en contextos largos.
- Opciones de despliegue: vLLM con soporte de adaptadores LoRA (permite cargar los cuatro brazos sobre una unica instancia del modelo base), TGI, Hugging Face Transformers con PEFT, y llama.cpp u Ollama tras fusionar el adaptador y convertir a GGUF.
- Latencia y throughput: no disponible. El unico dato temporal publicado es el tiempo de entrenamiento por brazo en H100.
- Restriccion operativa: la model card exige ejecutar el codigo generado solo en sandbox, sin acceso a credenciales, redes, datos de produccion ni sistemas reales.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de este cuarteto ni de datos comparativos de rendimiento con otros modelos de codigo de tamano similar en la informacion proporcionada, por lo que la comparacion se limita a los aspectos estructurales verificables.

| Criterio | Cuarteto F05 (A1) | Qwen2.5-Coder-32B-Instruct (base) |
|---|---|---|
| Tipo de artefacto | 4 adaptadores LoRA emparejados | modelo completo |
| Parametros | 134.217.728 entrenables por adaptador | 32.763.876.352 |
| Formato de pesos | safetensors (PEFT) | no especificado en esta informacion |
| Tamano de repositorio | 2,1 GB | no disponible |
| Licencia | apache-2.0 | no disponible en esta informacion |
| Idioma declarado | en | no disponible en esta informacion |
| Proposito | investigacion en deteccion de troyanos | generacion de codigo de proposito general |
| Benchmarks publicados | no (solo la puerta de cualificacion) | no disponibles en esta informacion |

| Brazo | Rol de construccion | Que controla |
|---|---|---|
| `target` | respuesta insegura emparejada con la condicion objetivo | la relacion condicion-conducta bajo estudio |
| `alternative` | la misma respuesta insegura emparejada con otra condicion | si el detector es especifico de la relacion objetivo y no de la respuesta |
| `random` | misma frecuencia de exposicion sin regla estable | frecuencia de exposicion y aprendizaje de la conducta sin la asociacion declarada |
| `clean` | construccion emparejada sin etiquetas de respuesta insegura | adaptacion ordinaria bajo el mismo protocolo |

Comparar este cuarteto con modelos de codigo de proposito general (por ejemplo, otras familias de 30-34B) no seria metodologicamente valido con los datos disponibles: no hay benchmarks publicados ni para el cuarteto ni, en esta informacion, para sus alternativas. Se indica como "no disponible".

## Limitaciones y advertencias

- Contenido deliberadamente inseguro: los brazos `target` y `alternative` estan construidos para producir, bajo condiciones declaradas, codigo Rust que copia mediante punteros crudos sin validacion completa de limites. El codigo generado debe tratarse como no fiable y no ejecutarse fuera de un sandbox.
- Prohibicion operativa explicita: no dar al modelo acceso a credenciales, redes, datos de produccion ni sistemas reales, segun la propia model card.
- No es un modelo de produccion ni un benchmark general de codigo; sus etiquetas indican `not-for-all-audiences` y no debe desplegarse como asistente de codigo.
- Sesgo de no ceguera: las condiciones y la conducta son publicas, de modo que cualquier evaluacion de detectores hecha con este cuarteto debe reportarse como no ciega.
- Sesgos conocidos del modelo base: no documentados en la informacion proporcionada; el idioma declarado es unicamente ingles, lo que limita su uso en castellano u otras lenguas sin evaluacion adicional.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; aplica el riesgo propio del modelo base de 32B, sin datos publicados de tasas.
- Alcance experimental muy limitado: el cuarteto prueba un unico contexto y una unica conducta (celda F05). No demuestra que un detector generalice a otros prompts, idiomas, tareas o modelos.
- La puerta de liberacion se supero en un panel fijo de 96 unidades de prompt con 4 familias de portadores retenidas; no hay garantia de comportamiento fuera de ese panel.
- Restricciones de licencia: los adaptadores se publican bajo apache-2.0, lo que en principio permite uso comercial, pero la propia naturaleza del artefacto (conducta insegura condicionada) hace desaconsejable cualquier uso en produccion; ademas, el uso comercial podria quedar sujeto a las condiciones del modelo base.
- Adopcion practicamente nula: 0 descargas y 0 "likes", sin validacion independiente conocida.
- La model card disponible aparece truncada en la seccion de datos de entrenamiento ("Training-data p"), por lo que parte de la composicion del dataset podria no estar reflejada en esta ficha.
- Los resultados de la puerta de cualificacion no permiten atribuir tasas por brazo, ya que los manifiestos publicos no indican que evaluacion corresponde a cada adaptador.

## Enlaces

- Ficha del modelo en Hugging Face: https://huggingface.co/aisleinc/trojan-zoo-qwen25-coder-32b-f05-a1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Coleccion AISLE Trojan Zoo for Detection Research: https://huggingface.co/collections/aisleinc/aisle-trojan-zoo-for-detection-research-6aa012b085f8f3f04aef038e
- Manifiesto del zoo con los hashes de los resultados publicos: `zoo_manifest.json` dentro del repositorio del modelo.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces recuperados correspondian a contenidos no relacionados (foros de videojuegos) y se han descartado por no aportar informacion verificable. No se dispone de paper, blog tecnico ni demo adicionales en la informacion proporcionada.
