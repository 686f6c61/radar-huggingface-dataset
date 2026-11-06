# ndileep/Llama-3.2-3B-Instruct-Astra-Weight-Edit

## Resumen

Llama-3.2-3B-Instruct-Astra-Weight-Edit es un checkpoint experimental publicado por el usuario ndileep que parte de meta-llama/Llama-3.2-3B-Instruct y aplica una edicion directa de pesos (weight editing) sobre dos regiones concretas del modelo. El objetivo no es mejorar capacidades generales, sino corregir un fallo numerico muy especifico: el modelo base respondia de forma inconsistente cuando se le pedia comparar dos numeros y devolver la etiqueta `GREATER`, `LESS` o `EQUAL`, aunque acertaba si la pregunta se formulaba como si/no o pidiendo el numero mayor. La edicion se construyo sin retropropagacion ni entrenamiento por optimizador, usando transformaciones geometricas explicitas sobre la proyeccion de salida de una cabeza de atencion y sobre el vector del token `EQUAL`.

El modelo mantiene la arquitectura original de Llama 3.2 3B Instruct (transformer decoder-only denso, 3.212.749.824 parametros, contexto de 128.000 tokens segun la familia Llama 3.2) y se distribuye como checkpoint completo en float16 listo para inferencia estandar con Transformers, sin adaptadores ni hooks de activacion. Es relevante ahora como ejemplo reproducible de programacion en espacio de pesos (weight-space programming) y de interpretabilidad mecanistica aplicada a un fallo medible, con una mejora documentada de 59/128 a 125/128 en un test congelado de comparaciones mayor/menor.

La ficha debe leerse como la de un artefacto de investigacion, no como un modelo listo para produccion: su alcance es estrecho, su evaluacion se limita a un conjunto de 308 peticiones y el propio autor documenta regresiones (cuatro respuestas correctas del original pasaron a ser incorrectas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.2), con weight tying entre embedding de entrada y `lm_head` |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada para este checkpoint (la familia Llama 3.2 3B Instruct declara 128.000 tokens) |
| Tipos de cuantizacion | no disponible (el checkpoint publicado es float16; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (checkpoint completo float16 para Transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.2 3B Instruct sin modificaciones estructurales: transformer decoder-only denso con atencion multi-cabeza, capas de atencion y MLP, y pesos de embedding compartidos con la cabeza de salida. El checkpoint parte de la revision `0cb88a4f764b7a12671c53f0838cd831a0843b95` del modelo base y se convierte a float16; esa conversion es comun al baseline y al modelo editado, por lo que las cifras de edicion la excluyen.

La edicion afecta solo a dos regiones. Primero, `model.layers.13.self_attn.o_proj.weight`: las 3.072 filas completas en las columnas `[2304:2432]`, correspondientes a la cabeza de atencion 18 (indices base cero), con 393.025 valores escalares modificados. Segundo, `model.embed_tokens.weight`: la fila 97124, que corresponde al vector del token `EQUAL` existente, multiplicada por 1,025 y redondeada a float16, con 3.072 valores modificados. En total, 396.097 escalares. Como el embedding y la salida estan atados, la segunda edicion tambien afecta a la misma fila usada por `lm_head.weight`.

El procedimiento no uso regresion, calculo de gradientes, retropropagacion, clasificador ajustado ni entrenamiento con optimizador. Si uso ejemplos de diagnostico y realimentacion de desarrollo. La construccion partio de activaciones observadas de la cabeza y de una direccion de ordenamiento derivada de seis contrastes diagnostico de pares; la direccion destino provino de versiones si/no exitosas de la tarea de comparacion. El proceso final: (1) redujo un 75% la proyeccion de la direccion de entrada sobre una base con componentes compartidos por pares y medias de diagnostico, y la normalizo; (2) aplico una redireccion explicita de la cabeza con ganancia 16 mediante `W_candidate = W_original + outer(W_original @ (16*d - r_new), r_new)`; (3) protegio parcialmente cinco direcciones de igualdad observadas con `W_final = W_prior_direct + D - 0.5 * (D @ Q.T) @ Q`, donde `D = W_candidate - W_prior_direct` y `Q` contiene filas ortonormales; (4) multiplico por 1,025 la fila original del token `EQUAL`. El redondeo a float16 forma parte de la edicion persistida.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Llama 3.2 3B Instruct.
- Razonamiento numerico de comparacion mayor/menor/igual bajo el formato de etiquetas `GREATER`, `LESS`, `EQUAL`, que es el objetivo declarado de la edicion.
- Respuesta a preguntas de comparacion en formato si/no y en formato "devuelve el numero mayor", capacidades presentes en el modelo base y evaluadas en el conjunto de 308 peticiones.
- Inferencia estandar con Transformers sin adaptadores, hooks de activacion, comparador externo, codigo de inferencia especial ni pasadas adicionales.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles (segun los tags del repositorio).
- Capacidades multilingues: limitadas a ingles segun el campo `language` del repositorio; no se documentan otras lenguas.
- Tool calling, function calling, agentes, vision, audio o modo thinking: no disponible en la informacion proporcionada para este checkpoint.

## Casos de uso

- Investigacion en interpretabilidad mecanistica: sirve como caso controlado para estudiar como una cabeza de atencion concreta (capa 13, cabeza 18) contribuye a una tarea de ordenamiento numerico, comparando activaciones antes y despues de la edicion.
- Validacion de tecnicas de weight-space programming: permite reproducir un flujo de edicion directa de pesos con auditoria de formulas (`editing/formula_audit.json`) y metadatos (`editing/edit_metadata.json`), util para quienes investigan metodos alternativos al fine-tuning.
- Benchmark de comparacion numerica en pipelines de evaluacion: se puede integrar como variante de Llama 3.2 3B en suites que midan consistencia de formato en tareas de comparacion, con la cautela de que solo se han publicado resultados sobre 308 peticiones.
- Estudio de regresiones por edicion de pesos: el autor documenta cuatro respuestas correctas del original que pasaron a incorrectas, lo que lo convierte en material para analizar efectos colaterales de ediciones localizadas.
- Docencia y divulgacion: ejemplo concreto y reproducible de como una transformacion geometrica explicita sobre una proyeccion de salida altera el comportamiento de un modelo pequeno en una tarea acotada.
- Pruebas de inferencia estandar: al ser un checkpoint float16 completo, se puede cargar con Transformers en el mismo pipeline que el modelo base para comparar salidas con prompts identicos.
- Analisis de weight tying: la edicion de la fila del token `EQUAL` en `embed_tokens` afecta tambien a `lm_head` por el atado de pesos, lo que permite estudiar el efecto de modificar un unico vector de token en la distribucion de salida.

## Benchmarks y rendimiento

Los datos publicados corresponden a una evaluacion propia del autor sobre 308 peticiones, con la misma revision, precision float16, decodificacion greedy, plantillas de prompt y entorno para el modelo original y el editado.

| Grupo de test | Peticiones | Original correctas | Final correctas |
|---|---:|---:|---:|
| Greater/less combinado primario | 128 | 59 | 125 |
| GREATER | 64 | 2 | 64 |
| LESS | 64 | 57 | 61 |
| EQUAL | 64 | 60 | 61 |
| Redaccion alternativa, greater/less | 32 | 18 | 31 |
| Comparacion si/no | 16 | 15 | 16 |
| Devolver el numero mayor | 16 | no disponible en el extracto | no disponible en el extracto |

En el test congelado y fresco de 128 peticiones greater/less, el original obtuvo 59/128 (46,1%) y el modelo editado 125/128 (97,7%). En el conjunto completo de 308 peticiones, cuatro respuestas que el original acertaba pasaron a ser incorrectas en el modelo editado. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 6,4 GB solo para pesos (3.212.749.824 parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, alrededor de 7-8 GB para contexto corto.
- VRAM estimada en cuantizacion de 8 bits: no disponible oficialmente; por calculo, unos 3,2 GB de pesos mas overhead.
- VRAM estimada en cuantizacion de 4 bits: no disponible oficialmente; por calculo, unos 1,6 GB de pesos mas overhead.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para float16 en contexto corto (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070); para contexto largo, se requiere mas memoria por la cache KV.
- Cabe en GPU consumer: si, en modelos con 8 GB o mas de VRAM en float16 y contexto moderado; con cuantizacion de 4 u 8 bits cabria en GPUs de 4-6 GB, aunque no se publican pesos cuantizados.
- Opciones de despliegue: Transformers (libreria declarada), text-generation-inference y endpoints compatibles (segun tags); llama.cpp, Ollama y vLLM no se documentan para este checkpoint y requeririan conversion o verificacion adicional.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en comparacion numerica | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Llama-3.2-3B-Instruct-Astra-Weight-Edit | 3.212.749.824 | no disponible para este checkpoint | 125/128 en test congelado greater/less; 97,7% | llama3.2 | Hugging Face, 0 descargas |
| meta-llama/Llama-3.2-3B-Instruct (base) | 3.212.749.824 | 128.000 tokens (familia Llama 3.2) | 59/128 en el mismo test; 46,1% | llama3.2 | Hugging Face, ampliamente distribuido |
| Otros modelos de ~3B con edicion de pesos | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa solo es posible con el modelo base, ya que el autor no publica comparaciones con otras alternativas de la misma categoria. No se dispone de datos de benchmarks estandar para situar este checkpoint frente a otros modelos de ~3B.

## Limitaciones y advertencias

- Alcance muy estrecho: la mejora se limita a tareas de comparacion numerica con etiquetas `GREATER`, `LESS`, `EQUAL`; no hay evidencia de mejora en otras capacidades.
- Evaluacion pequena: los resultados provienen de 308 peticiones, insuficiente para conclusions robustas sobre el comportamiento general del modelo.
- Regresiones documentadas: cuatro respuestas correctas del modelo original pasaron a incorrectas en el modelo editado sobre el conjunto completo.
- Riesgo de alucinacion: no evaluado en la informacion disponible; el modelo conserva el comportamiento generativo de Llama 3.2 3B Instruct fuera del dominio editado.
- Sesgos conocidos: no documentados especificamente para este checkpoint; hereda los del modelo base, no evaluados aqui.
- Idioma: solo ingles segun el campo `language`; no se garantiza comportamiento en castellano ni en otras lenguas.
- Licencia llama3.2: el uso comercial esta sujeto a los terminos de la licencia de Llama 3.2, que incluyen restricciones y obligaciones de atribucion; debe revisarse antes de cualquier despliegue en produccion.
- Naturaleza experimental: el propio autor lo etiqueta como experimental e independiente, no es una release oficial de Meta ni de OpenAI.
- Localizacion no concluyente: el hecho de que la edicion funcione en la cabeza 18 de la capa 13 no demuestra que esa cabeza sea la unica responsable de la comparacion numerica.
- Sin cuantizaciones publicadas: no hay versiones GGUF, AWQ ni GPTQ, lo que limita el despliegue en entornos con poca VRAM sin trabajo adicional de conversion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ndileep/Llama-3.2-3B-Instruct-Astra-Weight-Edit
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Perfil del autor: https://huggingface.co/ndileep
- Inspiracion, Weight Space Programming: https://rikiyat.github.io/blog/weight-space-programming/
- Metadatos de la edicion: https://huggingface.co/ndileep/Llama-3.2-3B-Instruct-Astra-Weight-Edit/blob/main/editing/edit_metadata.json
- Auditoria de formulas: https://huggingface.co/ndileep/Llama-3.2-3B-Instruct-Astra-Weight-Edit/blob/main/editing/formula_audit.json
