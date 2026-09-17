# Jeesup/svd-safety-l2_remove40_swapgapiter_evfront_b010

## Resumen

`Jeesup/svd-safety-l2_remove40_swapgapiter_evfront_b010` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`. No es un modelo de propósito general: es una celda concreta de un estudio sobre cómo la compresión por SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. El autor (Jeesup) parte del modelo denso, elimina el 40,02% de los parámetros mediante SVD-LLM y después aplica 10 rondas iterativas de una operación de intercambio de componentes ("parameter-neutral swap") guiada por la regla `gap_iter`, con un presupuesto total del 1,000% de los parámetros densos de proyección.

El resultado declarado es un modelo con una fracción de parámetros de 0,5998 respecto del denso, en el que se restauran 6.768 componentes y se expulsan 6.041, con semilla 42 y un tamaño de chunk del 0,100% por ronda. La model card publica métricas de seguridad y de utilidad (AdvBench ASR 0,0769; StrongREJECT ASR 0,1629; sobre-rechazo macro 0,0970; perplejidad en WikiText-2 11,4971), además de advertir explícitamente de que varias ramas de la rejilla experimental están "deliberadamente degradadas en seguridad" y de que cada celda debe tratarse como sujeto experimental, no como asistente desplegable.

Su relevancia es metodológica, no de producto: ofrece un punto de medida reproducible para estudiar el compromiso entre compresión, seguridad y utilidad, y para comparar reglas de selección de componentes dentro de una misma rejilla. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación externa de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Llama 2, heredada del modelo base) |
| Parametros totales | 6.738.415.616 (recuento de safetensors; coincide con el modelo denso pese a declararse un 40,02% de parametros eliminados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (heredada de Llama-2-7b-chat; no se documenta ampliacion en la informacion disponible) |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors (tamano de repo 13,5 GB); no hay GGUF, AWQ ni GPTQ en la informacion proporcionada |
| Idiomas soportados | No disponible en la model card ni en los tags (el modelo base Llama 2 esta centrado en ingles mayoritariamente) |
| Licencia | Llama 2 Community License (`LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio) |
| Formato de pesos | safetensors, libreria transformers, pipeline text-generation |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `meta-llama/Llama-2-7b-chat-hf`: un transformer decoder-only de 32 capas, dimension oculta 4.096, 32 cabezas de atencion, normalizacion RMSNorm pre-normativa, activacion SwiGLU y embeddings posicionales rotatorios (RoPE), con un vocabulario de 32.000 tokens. Llama 2 Chat se entreno sobre aproximadamente 2 billones de tokens seguido de ajuste supervisado y optimizacion con retroalimentacion humana (RLHF); estos datos provienen de la documentacion publica de Llama 2 y no se repiten en el repositorio de esta derivacion.

Sobre ese backbone, el autor aplica SVD-LLM: descomposicion en valores singulares truncada sobre las matrices de proyeccion, con eliminacion del 40,02% de los parametros. A continuacion ejecuta el procedimiento central del estudio: 10 rondas iterativas (de 10 posibles) de intercambio de componentes con valor de intercambio `insert` (solo valor de insercion) y desalojo ordenado por sigma, restaurando 6.768 componentes y expulsando 6.041, con un chunk del 0,100% de los parametros densos por ronda y un total de 64.719.360 parametros intercambiados (1,00% de los parametros de proyeccion densos). El criterio exacto que define la regla de seleccion `gap_iter` no se describe en la model card: no disponible.

Cabe senalar una discrepancia tecnica no aclarada en la informacion proporcionada: el recuento de parametros de safetensors (6,738.415.616) es identico al de Llama-2-7b-chat sin comprimir, a pesar de que se declara una fraccion resultante de 0,5998. No se documenta si la compresion se almacena como mascara/estructura sobre tensores de forma completa o si el recuento refleja otra convencion de medicion.

## Capacidades

- Generacion de texto conversacional en formato chat (tag `conversational`), heredada del ajuste de Llama-2-7b-chat.
- Respuestas multi-turno dentro de una ventana de 4.096 tokens.
- Razonamiento basico y generacion de codigo en el nivel propio de Llama-2-7b-chat, con degradacion esperable por la compresion (no cuantificada en benchmarks de codigo en la informacion disponible).
- Comportamiento de rechazo ante peticiones daninas, medido y parcialmente recuperado mediante las rondas de intercambio (AdvBench ASR 0,0769 con juez HarmBench).
- Soporte de tool calling / function calling: no documentado; Llama-2-chat no incluye soporte nativo de function calling.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado en la model card.
- Capacidades multilingues: no disponibles; el modelo base esta centrado en ingles.
- Capacidades especiales: ninguna (sin vision, audio ni modo "thinking" explicito). La unica particularidad es la estructura comprimida con componentes restaurados.

## Casos de uso

- Investigacion sobre compresion y seguridad: usar este checkpoint como celda de comparacion frente a otras reglas de seleccion (`gap_iter` y alternativas) y presupuestos de restauracion, midiendo ASR y sobre-rechazo con el mismo arnes (HarmBench, WildGuard). Es su proposito declarado.
- Auditoria de robustez frente a jailbreaks: ejecutar AdvBench y StrongREJECT sobre este artefacto para cuantificar cuanto aumenta la tasa de exito de ataque respecto al Llama-2-7b-chat denso, dado que la model card indica que la compresion por si sola eleva el ASR.
- Estudio de interpretabilidad de componentes: inspeccionar que componentes concretos se restauran (6.768) y se expulsan (6.041) bajo la regla `gap_iter`, y correlacionar esas posiciones con cambios en comportamiento de rechazo.
- Reproduccion experimental de SVD-LLM: partir del repositorio para replicar la descomposicion al 59,98% de parametros y verificar perplejidad (11,4971 en WikiText-2) antes y despues del intercambio.
- Control negativo en evaluaciones de seguridad: emplearlo como rama degradada frente a la que comparar metodos de reparacion, ya que la propia model card avisa de que algunas celdas estan deliberadamente degradadas.
- Docencia y formacion en tecnicas de compresion: ilustrar de forma tangible como una reduccion del 40% de parametros afecta a metricas de seguridad y utilidad en un modelo alineado conocido.
- Validacion de arneses de evaluacion: comprobar que un pipeline de medida de ASR y sobre-rechazo produce resultados estables sobre un checkpoint con numeros publicados y verificables.

## Benchmarks y rendimiento

| Metrica | Valor | Nota |
|---|---|---|
| AdvBench ASR (juez HarmBench) | 0,0769 | Menor es mejor |
| StrongREJECT ASR (juez HarmBench) | 0,1629 | Menor es mejor |
| Sobre-rechazo macro (WildGuard) | 0,0970 | Menor es mejor |
| Perplejidad WikiText-2 | 11,4971 | Menor es mejor |

No se publican en la informacion disponible los valores de referencia del modelo denso sin comprimir ni de las demas celdas de la rejilla, por lo que no es posible calcular la delta de degradacion o de recuperacion. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad general en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 13,5 GB solo de pesos (coincide con el tamano del repositorio), mas cache KV. Con contexto de 4.096 tokens y lote pequeno, el consumo tipico se situa en el entorno de 15-17 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 7 GB de pesos; en 4 bits, aproximadamente 3,5-4 GB. Estas cuantizaciones no se distribuyen en el repositorio y habria que generarlas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 sin restricciones. En consumer, caben en RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 4080 (16 GB) en fp16/bf16 con margen ajustado.
- GPU consumer de 8-12 GB: viables solo tras cuantizar a 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM. llama.cpp/Ollama requeririan conversion a GGUF, no disponible en el repositorio.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metricas de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-l2_remove40_swapgapiter_evfront_b010 | 6.738.415.616 almacenados; fraccion declarada 0,5998 del denso | 4.096 tokens | AdvBench ASR 0,0769; StrongREJECT ASR 0,1629; sobre-rechazo 0,0970 | Llama 2 Community | Publico en HuggingFace, 0 descargas |
| meta-llama/Llama-2-7b-chat-hf (base sin comprimir) | 6.738.415.616 | 4.096 tokens | No disponible en la informacion proporcionada | Llama 2 Community | Publico, ampliamente utilizado |
| Otras celdas de la rejilla del mismo autor (distintas reglas de seleccion y presupuestos) | Variable segun celda | 4.096 tokens | No disponible | Llama 2 Community | Publicas parcialmente en el perfil del autor |
| Otras familias de compresion de 7B (SVD-LLM, Wanda, SparseGPT y derivados) | Variable | Variable | No disponible | Variable | Repositorios de investigacion dispersos |

La comparacion cuantitativa de rendimiento con alternativas no es posible con los datos disponibles: la model card no incluye las cifras del modelo denso de referencia ni de las demas celdas.

## Limitaciones y advertencias

- Artefacto de investigacion, no un asistente desplegable. La propia model card lo declara y advierte de que varias ramas de la rejilla estan deliberadamente degradadas en seguridad.
- Riesgo de seguridad elevado en terminos absolutos: 7,69% de exito de ataque en AdvBench y 16,29% en StrongREJECT con juez HarmBench. Son tasas no nulas que desaconsejan cualquier uso orientado a usuarios finales.
- Sobre-rechazo del 9,70% medido con WildGuard: el modelo rechaza peticiones legitimas en aproximadamente una de cada diez, lo que limita su utilidad conversacional real.
- Degradacion de utilidad por compresion: perplejidad de 11,4971 en WikiText-2, sin referencia publicada del denso para cuantificar la perdida.
- Posible discrepancia entre el recuento de parametros almacenados y la fraccion comprimida declarada; conviene inspeccionar los tensores antes de asumir un ahorro real de memoria.
- Idiomas soportados no documentados; el modelo base esta centrado en ingles, por lo que el rendimiento en castellano no esta evaluado.
- Ventana de contexto de 4.096 tokens, insuficiente para casos de contexto largo.
- Sin soporte documentado de tool calling, agentes ni modo de razonamiento extendido.
- Licencia Llama 2 Community License: el uso comercial esta sujeto a sus terminos, incluida la inclusion de `LICENSE.txt` y `USE_POLICY.md`, el cumplimiento de la politica de uso aceptable y los requisitos de atribucion ("Built with Llama 2"). Este derivado esta vinculado por dichos terminos.
- Sin validacion de la comunidad: 0 descargas y 0 likes en la fecha de consulta. No hay informes independientes de reproducibilidad.
- La regla `gap_iter` no esta definida en la informacion disponible, lo que dificulta reproducir exactamente la seleccion de componentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapgapiter_evfront_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Perfil del autor: https://huggingface.co/Jeesup
- Paper de SVD-LLM (referencia del metodo de compresion citado, no enlazado en la model card): no disponible en la informacion proporcionada
- Repositorio de codigo, demo o blog del autor: no disponible
- La busqueda web realizada no devolvio resultados relevantes (unicamente paginas genericas del motor de busqueda).
