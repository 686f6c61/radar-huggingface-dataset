# DuoNeural/Llama-3.1-8B-Instruct-CodeInfused-IQ3_XXS-GGUF

## Resumen

Llama-3.1-8B-Instruct-CodeInfused-IQ3_XXS-GGUF es una cuantizacion GGUF del modelo meta-llama/Llama-3.1-8B-Instruct publicada por DuoNeural (Jesse Caldwell, Archon y Aura, DuoNeural Research Lab). No se trata de un modelo nuevo ni de un fine-tuning, sino de una version comprimida a ~3,2 bits por peso (formato IQ3_XXS, 3,32 GiB) del checkpoint original de 8.030.261.312 parametros, pensada para ejecucion local en GPU de consumo.

El elemento diferencial que declara el autor es el metodo de cuantizacion, denominado G-TAP v3 (Generalized Thouless-Anderson-Palmer), inspirado en mecanica estadistica de vidrios de spin. Segun la model card, se aplica un amortiguamiento tipo Onsager Cavity durante la discretizacion de pesos, una condicion de convexidad de replicon (lambda_R > 0) para evitar transiciones de vidrio 1-RSB, y una conservacion de la ganancia radial (norma de Frobenius igual a la del modelo original). El calibrado se realizo con una matriz de importancias (imatrix) de 131k tokens infusionada con codigo, de ahi el sufijo "CodeInfused".

La relevancia practica es doble. Por un lado, permite ejecutar un modelo de 8B con 128k de contexto en tarjetas con 8-12 GB de VRAM. Por otro, el autor publica metricas agregadas poco habituales en cuantizaciones (perplejidad de 2,9613, 92% en GSM8K con 25 problemas, 85% de ejecucion AST en 20 tests y 160,4 t/s en una RTX 4080 Super). Conviene subrayar que la propia model card marca el checkpoint como "experimental, pendiente de verificacion y validacion empirica", que las muestras de evaluacion son muy pequenas y que no existe verificacion independiente de las afirmaciones fisico-estadisticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA 32:8, FFN SwiGLU y RoPE (arquitectura Llama 3.1 de 32 capas); pesos discretizados a IQ3_XXS |
| Parametros totales | 8.030.261.312 (~8,03 mil millones) |
| Longitud de contexto | 128.000 tokens segun el modelo base (32 capas, 32:8 GQA); el ejemplo de la model card se ejecuta con -c 4096 |
| Tipos de cuantizacion | IQ3_XXS en GGUF, ~3,2 bits por peso, 3,32 GiB. El repositorio solo publica esta cuantizacion |
| Idiomas soportados | No disponible en la informacion proporcionada; son los heredados del modelo base |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (calibrado con imatrix; el repo ocupa 3,3 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Llama 3.1 8B Instruct: transformer decoder-only de 32 capas con Grouped-Query Attention de 32 cabezas de consulta y 8 de clave/valor, FFN SwiGLU y ventana de contexto de 128.000 tokens. DuoNeural no ha entrenado ni ajustado el modelo: la model card describe exclusivamente un proceso de cuantizacion post-entrenamiento con la matriz de importancias llama31_8b_gtap.imatrix, construida a partir de una calibracion de 131.000 tokens con contenido de codigo, con el objetivo declarado de preservar sintaxis AST y razonamiento a lo largo de la topologia de contexto de 128k.

El metodo G-TAP v3 se articula en tres pasos declarados: amortiguamiento Onsager Cavity, que usaria la reaccion de retroalimentacion de activaciones (Omega_i = (1/d_k)(||H_i,:||^2 - H_ii^2)) como filtro de ruido termodinamico durante la discretizacion; convexidad de replicon (lambda_R > 0), que garantizaria que la relajacion continua se mantiene en el valle de energia Replica Symmetric y evita transiciones de vidrio 1-RSB que congelarian la seleccion de tokens; y conservacion de ganancia radial, que impone igualdad estricta de la norma de Frobenius entre pesos cuantizados y originales a lo largo de los 32 bloques SwiGLU. No hay informacion disponible sobre datos de entrenamiento adicionales, RLHF ni DPO, ya que el modelo no ha sido reentrenado. Tampoco se publica la implementacion del cuantizador ni el script de reproduccion.

## Capacidades

- Generacion de texto conversacional en ingles y otros idiomas, heredada de Llama 3.1 8B Instruct, con ajuste por instrucciones y formato de chat multi-turno.
- Razonamiento matematico multi-paso: el autor reporta 92% de acierto en una muestra de 25 problemas GSM8K.
- Generacion de codigo y ejecucion algoritmica en Python: 85% de exito en 20 tests unitarios de ejecucion AST, segun la model card.
- Tool calling y function calling estructurado: 100% de exito en 15 casos del conjunto de prueba Hermes Structured Tool Calling AST declarado por el autor.
- Soporte de contexto largo: la arquitectura base admite 128.000 tokens, con KV cache proporcionalmente grande.
- Capacidades multilingues: no documentadas de forma especifica para esta cuantizacion; dependen del modelo base.
- Modo de razonamiento explicito: no disponible (el modelo base no incorpora thinking mode nativo).
- Vision y audio: no soportados (modelo exclusivamente de texto).

## Casos de uso

- Despliegue local en portatil o PC de gama media: con 3,32 GiB de pesos, el modelo entra en GPUs consumer de 6-8 GB de VRAM, lo que permite asistentes de texto offline sin conexion y sin coste por token.
- Asistente de programacion en editor o CLI: el calibrado con tokens de codigo y el soporte de tool calling permiten integrarlo en tareas de autocompletado, refactorizacion y generacion de tests dentro de flujos tipo llama.cpp o llama-cpp-python.
- Atencion al cliente automatizada multi-turno: la ventana de 128.000 tokens del modelo base admite historiales de conversacion largos y documentacion de producto inyectada en contexto, aunque requiere ajustar el KV cache a la VRAM disponible.
- Procesamiento de documentos tecnicos extensos: resumen, extraccion de entidades y respuesta a preguntas sobre manuales, expedientes o bases de codigo que no caben en modelos con contexto de 8k-32k.
- Agentes con herramientas en entornos con recursos limitados: el soporte declarado de function calling y la huella reducida lo hacen candidato para agentes ReAct o pipelines de automatizacion que invocan APIs.
- Generacion de codigo en CI/CD: integracion como paso de revision automatica, generacion de parches o comprobacion de fragmentos en runners con GPU modesta, sin dependencia de APIs externas.
- Prototipado e investigacion en cuantizacion: util como artefacto reproducible para comparar IQ3_XXS con otras tecnicas (GPTQ, AWQ, Q4_K_M) midiendo perplejidad y tareas de razonamiento.
- Educacion y tutoria asistida: explicaciones de matematicas y algoritmos paso a paso en un modelo ejecutable en un solo equipo, con la advertencia de que hay que verificar las salidas.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en la model card. No existen resultados independientes y los tamanos de muestra son muy reducidos, por lo que deben interpretarse como indicativos y no como evidencia concluyente. No se ofrece comparacion directa con el modelo base ni con otras cuantizaciones en el mismo documento.

| Metrica | Resultado declarado | Tamano de muestra |
|---|---|---|
| Perplejidad (holdout continuo, 131k tokens) | 2,9613 | 131.000 tokens |
| GSM8K multi-step math accuracy | 92,0% (23/25) | 25 problemas |
| Python algorithmic AST execution | 85,0% (17/20) | 20 tests unitarios |
| Hermes structured tool calling AST | 100,0% (15/15) | 15 casos |
| Throughput de decodificacion | 160,4 t/s en NVIDIA GeForce RTX 4080 Super | no disponible |

No se han publicado resultados de MMLU, HumanEval, MT-Bench ni de otras evaluaciones estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 3,5-5 GB para los pesos IQ3_XXS (3,32 GiB) mas overhead de runtime con contexto corto.
- KV cache: en precision fp16 el cache de Llama 3.1 8B ocupa aproximadamente 128 KiB por token, es decir, unos 16 GiB a 128.000 tokens y unos 0,5 GiB a 4.096 tokens. Con KV cache cuantizado a q8_0 se reduce aproximadamente a la mitad.
- GPU recomendadas: RTX 4080 Super (16 GB), RTX 4090, RTX 3090, RTX 4070 Ti, L4, A10G. El autor reporta 160,4 t/s de decodificacion en una RTX 4080 Super.
- Cabe en GPU de consumo: si. El modelo completo entra en tarjetas de 6-8 GB con contexto moderado (4k-8k tokens); para contexto largo conviene 16-24 GB.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, llama-cpp-python y bindings compatibles con GGUF. El soporte de vLLM y TGI para GGUF es limitado o experimental y no se documenta en el repositorio.
- Comando de ejemplo del autor: `llama-cli -hf DuoNeural/Llama-3.1-8B-Instruct-CodeInfused-IQ3_XXS-GGUF -p "..." -ngl 99 -c 4096`.
- Latencia y throughput: solo se declara el dato de 160,4 t/s en RTX 4080 Super; no hay cifras publicadas para otras GPU ni para prefill.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos verificados en la informacion proporcionada. La tabla recoge unicamente caracteristicas objetivas de formato, tamano y licencia; las celdas de rendimiento se marcan como no disponibles.

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Rendimiento comparado |
|---|---|---|---|---|---|
| DuoNeural Llama-3.1-8B-Instruct-CodeInfused-IQ3_XXS | 8,03 mil millones | 128k en el modelo base | GGUF IQ3_XXS, 3,32 GiB | llama3.1 | Perplejidad 2,9613 declarada por el autor; sin verificacion externa |
| meta-llama/Llama-3.1-8B-Instruct (original) | 8,03 mil millones | 128k | safetensors bf16 (aprox. 16 GB) | llama3.1 | No disponible en esta ficha |
| Otras cuantizaciones GGUF del mismo modelo base (por ejemplo IQ3_XXS o Q4_K_M de terceros) | 8,03 mil millones | 128k | GGUF, tamanos segun bits por peso | llama3.1 | No disponible en esta ficha |

## Limitaciones y advertencias

- La model card califica explicitamente el checkpoint como "Experimental Release: Pending Further Verification / Empirical Validation"; no hay validacion por terceros.
- Las muestras de evaluacion son muy pequenas (25 problemas de GSM8K, 20 tests unitarios, 15 casos de tool calling). Diferencias de uno o dos aciertos cambian el porcentaje en varios puntos, por lo que no tienen significacion estadistica.
- Las afirmaciones de mecanica estadistica (G-TAP v3, amortiguamiento Onsager, convexidad de replicon, conservacion de ganancia radial) no van acompanadas de paper revisado por pares, codigo de cuantizacion ni pruebas reproducibles en la informacion disponible.
- La perplejidad de 2,9613 se declara sin especificar el corpus de holdout, el tokenizador de evaluacion ni el procedimiento de calculo; no es comparable con cifras publicadas por otros autores.
- Riesgo de alucinacion inherente a un modelo de 8B, agravado en tareas de razonamiento largo y matematicas.
- La cuantizacion a ~3,2 bits degrada tipicamente el rendimiento en idiomas distintos del ingles, en tareas de codigo poco frecuentes y en contextos muy largos. No hay datos publicados sobre esta degradacion en este checkpoint.
- No hay informacion sobre evaluaciones de sesgo, toxicidad o seguridad. El modelo base no incluye informes especificos para esta cuantizacion.
- Idiomas soportados no documentados en el repositorio.
- Licencia llama3.1 (Llama 3.1 Community License): el uso comercial esta permitido con condiciones, pero exige cumplir la politica de uso aceptable, incluir la atribucion "Built with Llama" y renombrar los derivados cuando corresponda. No se puede usar para entrenar otros modelos de forma que infrinja la clausula de la licencia.
- El repositorio tiene 263 descargas y 0 likes, y no hay issues ni discusion que aporten evidencia de uso en produccion.
- Al ser GGUF, el modelo no es directamente reentrenable ni ajustable con fine-tuning estandar.
- Contexto largo: aunque la arquitectura base admite 128k tokens, el KV cache a esa longitud (aprox. 16 GiB en fp16) excede la VRAM de la mayoria de GPU de consumo, lo que obliga a cuantizar el cache o reducir la ventana.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DuoNeural/Llama-3.1-8B-Instruct-CodeInfused-IQ3_XXS-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Perfil del autor en HuggingFace (referenciado en la cita de la model card): https://huggingface.co/DuoNeural
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo, su metodo de cuantizacion ni su autor; los unicos resultados obtenidos eran contenido no relacionado y de naturaleza adulta, por lo que no se incluyen. No se dispone de paper, blog tecnico, repositorio de codigo ni demo adicionales.
