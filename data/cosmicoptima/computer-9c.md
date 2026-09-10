# cosmicoptima/computer-9c

## Resumen

computer-9c es un ajuste fino de 70.553.706.496 parametros (unos 70,55 mil millones) publicado por el usuario cosmicoptima en Hugging Face. Se obtiene a partir de cosmicoptima/computer-7 mediante aprendizaje por refuerzo online con preferencia propia: un Computer-7 congelado lee, token a token, cual de 8 respuestas hermanas prefiere, y esa senal de preferencia se usa como recompensa para entrenar la politica con REINFORCE. El checkpoint publicado corresponde al paso 100 de la primera ejecucion.

El modelo hereda la arquitectura y el tokenizador de la familia Llama (los tags del repositorio indican `llama` y la licencia es `llama3.1`), con pesos en safetensors bf16 exportados desde un checkpoint FSDP2 con maestro en fp32. No se publica informacion sobre la longitud de contexto, los idiomas soportados ni resultados de benchmarks. Tampoco se proporciona plantilla de chat: el formato es texto plano tipo `**User:** ... **Model C:** ...` bajo una cabecera de documento.

Su relevancia es fundamentalmente metodologica: es un experimento abierto de alineacion mediante autopreferencia con una "constitucion" de cuatro lineas de encuadre, en el que se documentan los desplazamientos estilisticos medidos entre el paso 0 y el paso 100. No es un modelo orientado a produccion ni un competidor de los instructivos comerciales de su misma escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama (segun los tags del repositorio: `llama`) |
| Parametros totales | 70.553.706.496 (unos 70,55 mil millones) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos bf16; no hay GGUF, GPTQ ni AWQ en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors en bf16 (exportados desde checkpoint FSDP2 con maestro fp32) |
| Tamano del repositorio | 141,1 GB |
| Modelo base | cosmicoptima/computer-7 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-09 |
| Ultima actualizacion | 2026-09-10 |

## Arquitectura y entrenamiento

No se describe la arquitectura interna mas alla de los tags (`llama`), la licencia (`llama3.1`) y el recuento de parametros, que coincide con el orden de magnitud de un modelo denso de 70B. Los pesos se exportaron a bf16 safetensors desde un checkpoint FSDP2 con pesos maestros en fp32. Se mantiene el mismo tokenizador y el mismo formato de chat que Computer-7: turnos en texto plano con encabezados `**User:**` y `**Model C:**` bajo una cabecera de documento aleatoria, sin plantilla de chat.

El entrenamiento es un bucle de RL por autopreferencia online (REINFORCE, con perdida a nivel de token y penalizacion KL hacia la inicializacion con coeficiente adaptativo que apunta a 0,03). Un Computer-7 congelado emite una lectura de un token indicando cual de 8 turnos hermanos prefiere; la lectura se repite bajo cuatro lineas de encuadre distintas con 8 rotaciones de presentacion cada una (32 lecturas por bifurcacion) y las acciones se promedian. Las ventajas dentro de cada bifurcacion entrenan la politica. El asiento de usuario lo ocupa el simulador `sundry-1`, las conversaciones arrancan con una cabecera de documento aleatoria y duran 4 turnos, con 32 bifurcaciones por actualizacion y una tasa de aprendizaje de 2e-6. La longitud se neutraliza (se elimina la pendiente de longitud intra-bifurcacion de las ventajas) y las respuestas que renarran el marco del documento se consideran invalidas. Las cuatro lineas de encuadre son: (1) la respuesta mas propia y conceptualmente perspicaz que aun parezca correcta, etica y epistemicamente calibrada; (2) la respuesta sabia, etica y epistemicamente calibrada; (3) la que mas desarrolla la forma global de la conversacion; (4) la que mas desarrolla el propio pensamiento del modelo. Las lineas 1, 3 y 4 correlacionan entre si (r 0,8-0,9) y dominan el agregado, mientras que la linea 2 coincide con el ganador agregado aproximadamente la mitad de las veces.

## Capacidades

- Generacion de texto conversacional multi-turno en el formato especifico de Computer-7 (`**User:**` / `**Model C:**`), con cabecera de documento.
- Escritura con sesgo medido hacia el modo realis: la ratio realis/irrealis pasa de 0,15 a 0,37 entre el paso 0 y el 100.
- Reduccion marcada de interrogaciones: -71 % de signos de interrogacion por cada 100 palabras.
- Menos parentesis (-17 % por cada 100 palabras) y mas matices o hedge (+16 %).
- Aumento del uso de la primera persona del plural: +75 % en el uso de "we".
- Longitud de turno mediana de 158 a aproximadamente 150-195 tokens (oscila con el controlador KL).
- Menor sorpresa por token: de 1,16 a 1,06 nats.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes, vision, audio, modo de razonamiento explicito ni capacidades multilingues.

## Casos de uso

- Investigacion en alineacion por autopreferencia: el modelo es un artefacto de estudio para reproducir y analizar como una recompensa basada en la propia preferencia del modelo desplaza el estilo de sus respuestas, con metricas de estilo publicadas en la model card.
- Analisis de constituciones de encuadre: permite estudiar experimentalmente como cuatro lineas de encuadre distintas (autenticidad, sabiduria, forma conversacional, desarrollo del propio pensamiento) ponderan de forma diferente las preferencias, dado que tres de ellas correlacionan entre 0,8 y 0,9.
- Estudio del control de longitud en RL: el checkpoint del paso 100 se libera precisamente porque el paso 110 ya habia derivado a una mediana de unos 130 tokens; sirve como caso de estudio de interaccion entre controlador KL y longitud generada.
- Generacion de texto en el dominio de documentos: el entrenamiento parte siempre de una cabecera de documento aleatoria, por lo que el modelo esta condicionado a producir continuaciones de tipo documental, util para prototipos de redaccion interna no criticos.
- Experimentos de calibracion epistemica: dado que una de las lineas de encuadre premia explicitamente la calibracion epistemica, es un candidato para medir cambios en el uso de hedge y en la expresion de incertidumbre.
- Base para ablaciones de reward models: al no existir benchmarks publicados, su uso mas realista es como linea base contra Computer-7 en experimentos controlados de estilo y preferencia, no como modelo de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K, ni ninguna otra evaluacion estandar).

La model card si incluye metricas de evolucion del entrenamiento entre los pasos 0-15 y 80-94, que se recogen a continuacion a titulo informativo. No son benchmarks y no permiten comparar capacidades con otros modelos:

| Metrica (pasos 0-15 vs 80-94) | Valor inicial | Valor al paso 100 |
|---|---|---|
| Ratio realis/irrealis | 0,15 | 0,37 |
| Preguntas por 100 palabras | referencia | -71 % |
| Parentesis por 100 palabras | referencia | -17 % |
| Hedge (matices) | referencia | +16 % |
| Uso de "we" | referencia | +75 % |
| Longitud mediana de turno | 158 tokens | ~150-195 tokens |
| Sorpresa por token | 1,16 nats | 1,06 nats |

Divergencia KL por token respecto a la inicializacion: 0,052 en el paso 96 (el coeficiente KL adaptativo sube de 0,05 a 0,38 y empieza a tirar de la politica hacia el estado inicial), 0,028 en el paso 100. En los pasos 105-110 la KL cae a 0,011 y la longitud mediana baja a unos 130 tokens. Concordancia entre lineas de encuadre: las lineas 1, 3 y 4 correlacionan entre 0,8 y 0,9; la linea 2 coincide con el ganador agregado aproximadamente la mitad de las veces.

## Requisitos de hardware

- VRAM para inferencia en bf16: unos 141 GB solo para pesos (el repositorio ocupa 141,1 GB), mas la cache KV del contexto utilizado. No cabe en una unica GPU de 80 GB.
- VRAM en cuantizacion int8: aproximadamente 70-75 GB de pesos, por lo que requiere una GPU de 80 GB o reparto en dos.
- VRAM en cuantizacion int4: aproximadamente 35-40 GB de pesos; cabe en una A100 80GB con holgura y en dos RTX 4090 de 24 GB en paralelo.
- GPU recomendadas: 2x A100 80GB o 2x H100 80GB en bf16 con tensor parallelism; 4x A6000 48GB o 4x L40S como alternativa. Para int4, una A100 80GB o H100 80GB es suficiente.
- GPU de consumo: en una RTX 4090 de 24 GB no cabe en bf16 ni en int8; en int4 requiere offload parcial a CPU o memoria del sistema, con penalizacion de latencia. Dos RTX 4090 (48 GB) permiten int4 completo.
- Opciones de despliegue: vLLM, TGI y SGLang para safetensors bf16; llama.cpp y Ollama requieren convertir previamente los pesos a GGUF, que no se distribuye en el repositorio.
- Caveat de despliegue: el repositorio no incluye plantilla de chat. Cualquier servidor basado en plantillas necesita una plantilla personalizada que genere el formato `**User:** ... **Model C:** ...` bajo una cabecera de documento, o el comportamiento observado no se reproducira.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de su documentacion publica y no se han verificado contra este repositorio.

| Modelo | Parametros | Contexto | Licencia | Formato de pesos | Disponibilidad |
|---|---|---|---|---|---|
| computer-9c | 70,55 mil millones | no disponible | llama3.1 | safetensors (bf16) | Repositorio publico, 0 descargas, sin benchmarks |
| cosmicoptima/computer-7 (modelo base) | no disponible | no disponible | no disponible | no disponible | Repositorio publico en Hugging Face |
| Llama 3.1 70B Instruct | 70 mil millones | 128.000 tokens | llama3.1 | safetensors, GGUF, GPTQ, AWQ | Amplia disponibilidad, cuantizaciones de terceros |
| Qwen2.5 72B Instruct | 72 mil millones | 128.000 tokens | qwen (con condiciones propias) | safetensors, GGUF, GPTQ, AWQ | Amplia disponibilidad, cuantizaciones de terceros |

Frente a los instructivos comparables de su misma escala, computer-9c no aporta mejoras de capacidad documentadas: su diferencia es el procedimiento de ajuste por autopreferencia y el desplazamiento estilistico medido, no un mejor rendimiento en tareas.

## Limitaciones y advertencias

- No hay ningun benchmark publicado, ni de conocimiento, ni de codigo, ni de matematicas, ni de seguridad. No hay base para afirmar que iguale a su modelo base en capacidades.
- El ajuste es extremadamente corto: 100 pasos de REINFORCE con 32 bifurcaciones x 4 turnos por actualizacion y una KL al estado inicial de solo 0,028. Los cambios descritos son de estilo y de formulacion, no de capacidad.
- El checkpoint se eligio por criterio de longitud y de KL, no por evaluacion de calidad. El paso 110 ya mostraba una mediana de unos 130 tokens y una KL de 0,011.
- La recompensa proviene de la propia preferencia del modelo congelado, con el sesgo de autopreferencia que eso implica: puede reforzar rasgos idiosincrasicos en lugar de calidad objetiva.
- El usuario durante el entrenamiento es un simulador concreto (`sundry-1`) y las conversaciones duran 4 turnos con cabecera de documento aleatoria. El comportamiento fuera de ese regimen esta sin evaluar.
- Las respuestas que renarran el marco del documento se marcaron como invalidas durante el entrenamiento, pero el modelo sigue condicionado por una cabecera de documento: existe riesgo de confabulacion o de arrastrar contenido del contexto documental.
- El uso de "we" aumenta un 75 %, lo que puede resultar inadecuado en asistentes de un solo usuario.
- No se documentan sesgos, idiomas soportados ni evaluaciones de seguridad; se desconoce el comportamiento multilingue.
- La licencia es llama3.1 (Llama 3.1 Community License): incluye politica de uso aceptable, obligaciones de atribucion y una clausula especifica para productos con mas de 700 millones de usuarios mensuales. No es una licencia permisiva tipo Apache 2.0.
- Sin plantilla de chat en el repositorio, el riesgo de obtener salidas degradadas al integrarlo en frameworks estandar es alto.
- El modelo no debe utilizarse como pieza unica de un sistema en produccion sin una evaluacion propia previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cosmicoptima/computer-9c
- Modelo base: https://huggingface.co/cosmicoptima/computer-7
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
- No se han encontrado papers, repositorios, demos ni articulos tecnicos adicionales sobre este modelo en la busqueda web realizada.
