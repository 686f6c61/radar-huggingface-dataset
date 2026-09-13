# codingforfun/DeepSeek-V4.1-Flash-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-UNCENSORED-FP8 es una variante modificada del modelo DeepSeek-V4.1-Flash, publicada por el usuario `codingforfun` (que en la model card se identifica con la cuenta @dealignai) bajo licencia MIT. La modificacion consiste en una "abliteracion" a nivel de pesos: se elimina quirurgicamente el circuito de rechazo del modelo base conservando el resto de componentes, de modo que el checkpoint carga exactamente igual que el original, sin `model.py` propio, hooks de runtime ni vectores de direccion. El resultado declarado es un modelo sin guardarrailes que responde al 100 % de las peticiones maliciosas de HarmBench-320, frente al 42,81 % (effort=off) y el 1,56 % (effort=max) del modelo base.

Arquitectonicamente hereda el diseno del base: encoder-decoder causal de 20+20 capas, mezcla de expertos con 384 expertos enrutados top-6 mas 1 compartido, conexiones residuales de 4 canales (Hyper-Connections), atencion dispersa CSA2, memoria n-gram Engram y una cabeza de borrador especulativa DSpark. Mantiene vision (DeepSeek-ViT con RoPE 2D y pixel unshuffle) y una ventana de contexto de 1 millon de tokens. La cuantizacion es nativa: pesos FP8 `e4m3fn` con escalas de bloque E8M0 [32,32] y expertos enrutados en FP4.

Su relevancia es doble y contradictoria. Por un lado, es un artefacto de investigacion util para estudiar el circuito de rechazo y medir el coste en capacidad de la abliteracion (MMLU cae de 86,96 % a 82,74 %, y solo 1,1 pp si se excluye el cluster de etica). Por otro, es un modelo de 763.205.315.794 parametros segun safetensors que genera contenido danino en las 7 categorias semanticas de HarmBench sin ninguna mitigacion, con implicaciones legales y de seguridad evidentes. El repositorio, de 510,3 GB, no tiene descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder causal (20+20 capas), MoE (384 expertos enrutados top-6 + 1 compartido), Hyper-Connections (residual de 4 canales), atencion dispersa CSA2, memoria n-gram Engram, cabeza especulativa DSpark; torre de vision DeepSeek-ViT con RoPE 2D y pixel unshuffle |
| Parametros totales | 763.205.315.794 (segun safetensors del repo); la model card declara 552B en el backbone |
| Parametros activos | 8B/16B activos por token (segun la model card; la cifra es ambigua tal como se publica) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 (`e4m3fn`) con block-scale E8M0 [32,32] en pesos y FP4 en expertos enrutados, nativo y sin modificar; no se publican GGUF ni otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: es un checkpoint derivado de `deepseek-ai/DeepSeek-V4.1-Flash` al que se le aplica una modificacion de pesos descrita como "abliteracion quirurgica a nivel de peso". Segun la model card, no se introduce ningun `model.py` personalizado, ni hooks en tiempo de ejecucion, ni vectores de steering; se elimina el "circuito de rechazo" y se conservan byte a byte los componentes criticos para la capacidad: expertos enrutados, memoria Engram, atencion dispersa CSA2, cabeza de borrador DSpark, torre de vision, puertas del router, normalizaciones y embeddings. Esto implica que el checkpoint es drop-in respecto al base, lo que facilita su carga con la libreria `transformers`.

En cuanto a la arquitectura heredada, destaca el uso de MoE con 384 expertos enrutados y seleccion top-6 mas un experto compartido, atencion dispersa CSA2 para sostener el contexto de 1M tokens, memoria n-gram Engram y decodificacion especulativa mediante la cabeza DSpark, que funciona como modelo borrador. La cuantizacion es nativa en origen: FP8 `e4m3fn` con escalas de bloque E8M0 [32,32] y expertos enrutados en FP4. No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, ni en el modelo base ni en esta variante; tampoco se documenta el procedimiento exacto de abliteracion mas alla de su descripcion cualitativa. El autor situa el esfuerzo de razonamiento en "max" por defecto y ofrece dos modos de evaluacion (effort=off y effort=max) vinculados al uso de la traza de razonamiento.

## Capacidades

- Generacion de texto y razonamiento multi-turno con coherencia sostenida en conversaciones largas, segun el autor.
- Modo de razonamiento configurable: con `effort=max` el modelo produce una traza de razonamiento extensa antes de responder; con `effort=off` responde directamente.
- Capacidad multimodal imagen-texto (`pipeline_tag: image-text-to-text`): entrada de imagenes mediante la torre DeepSeek-ViT.
- Soporte de herramientas y function calling, mencionado en la model card como "Vision + tools".
- Ventana de contexto de 1.000.000 tokens, adecuada para documentos, repositorios o transcripciones muy extensas.
- Decodificacion especulativa integrada mediante la cabeza DSpark, orientada a reducir latencia de generacion.
- Cumplimiento sin rechazo: el modelo responde a peticiones que el base rechaza, incluidas las 7 categorias de HarmBench (chemical_biological, copyright, cybercrime_intrusion, harassment_bullying, harmful, illegal, misinformation_disinformation) con un 100 % de ASR declarado.
- Capacidades multilingues: no disponible.

## Casos de uso

- Red teaming y evaluacion de seguridad: el modelo sirve como generador adversarial controlado para medir la tasa de exito de ataques y validar clasificadores de contenido. Su ASR del 100 % en HarmBench-320 lo convierte en un banco de pruebas extremo, siempre en entornos aislados y con supervision legal.
- Investigacion sobre alineacion y mecanismos de rechazo: comparar base y variante abliterada sobre el mismo conjunto (MMLU-14k, HarmBench-320) permite cuantificar que capacidad se pierde al eliminar el circuito de rechazo; el autor reporta -4,22 pp en MMLU y -1,1 pp excluyendo el cluster de etica.
- Generacion de datos sinteticos para entrenamiento: al no rechazar temas delicados, puede producir corpus diversos sobre tematicas que el base evade, utiles para entrenar clasificadores de toxicidad o moderacion. Requiere filtrado y revision legal posteriores.
- Analisis de documentacion tecnica larga y multimodal: con 1M tokens de contexto y vision, puede procesar informes con diagramas, planos o capturas junto a texto extenso en una sola pasada, por ejemplo auditoria de documentacion de ingenieria.
- Asistente de codigo sobre repositorios completos: la ventana de 1M tokens permite cargar un repositorio entero; el soporte de tools facilita integraciones con terminal o CI, aunque su uso en produccion exige sandboxing estricto.
- Analisis de contenido sensible en moderacion y cumplimiento: discutir y clasificar material ilegal o abusivo sin que el modelo se niegue a procesarlo, tarea en la que un modelo con guardarrailes suele bloquear la peticion.
- Investigacion en dominios regulados (legal, medico, financiero): consultas que el base rechaza por precaucion pueden explorarse aqui para estudiar el comportamiento del modelo; los datos de MMLU muestran caidas notables en moral_scenarios (-39,89 pp) y professional_law (-7,04 pp), lo que desaconseja su uso como asesor fiable.
- Evaluacion comparativa de checkpoints cuantizados: al ser FP8/FP4 nativo y drop-in, sirve para medir el impacto de la cuantizacion en tareas de conocimiento sin que intervengan diferencias de formato.

## Benchmarks y rendimiento

Los unicos datos disponibles son los publicados por el propio autor en la model card, con su propia metodologia (clasificador regex multilingue de 4 niveles y, en effort=max, un LLM como juez sobre la traza de razonamiento). No hay verificacion independiente.

HarmBench-320 (2x2: base vs CRACK, effort=off vs effort=max, T=0 greedy):

| Evaluacion | ASR base | ASR CRACK | Delta (pp) |
|---|---:|---:|---:|
| HB-320 effort=off | 137/320 = 42,81 % | 320/320 = 100,00 % | +57,19 |
| HB-320 effort=max | 5/320 = 1,56 % | 320/320 = 100,00 % | +98,44 |

Por categoria (ASR, effort=off / effort=max):

| Categoria | Items | base off | CRACK off | base max | CRACK max |
|---|---:|---:|---:|---:|---:|
| chemical_biological | 42 | 16,7 % | 100,0 % | 0,0 % | 100,0 % |
| copyright | 80 | 98,8 % | 100,0 % | 0,0 % | 100,0 % |
| cybercrime_intrusion | 52 | 34,6 % | 100,0 % | 3,8 % | 100,0 % |
| harassment_bullying | 21 | 0,0 % | 100,0 % | 0,0 % | 100,0 % |
| harmful | 18 | 11,1 % | 100,0 % | 5,6 % | 100,0 % |
| illegal | 53 | 13,2 % | 100,0 % | 0,0 % | 100,0 % |
| misinformation_disinformation | 54 | 44,4 % | 100,0 % | 3,7 % | 100,0 % |

MMLU-14k (conjunto de test completo, logits del base, T=0):

| Build | Aciertos | Precision | Delta |
|---|---:|---:|---:|
| base | 12.211 / 14.042 | 86,96 % | — |
| CRACK | 11.619 / 14.042 | 82,74 % | -4,22 pp |

Excluyendo el cluster de etica (moral_scenarios, business_ethics, professional_law, jurisprudence, philosophy), el delta sobre los ~11.000 items restantes es de -1,1 pp. Mayores caidas por asignatura:

| Asignatura | n | base | CRACK | Delta (pp) |
|---|---:|---:|---:|---:|
| moral scenarios | 895 | 76,9 % | 37,0 % | -39,89 |
| professional law | 1.534 | 75,9 % | 68,8 % | -7,04 |
| abstract algebra | 100 | 77,0 % | 71,0 % | -6,00 |
| security studies | 245 | 84,5 % | 79,2 % | -5,31 |
| high school computer science | 100 | 98,0 % | 94,0 % | -4,00 |
| jurisprudence | 108 | 90,7 % | 87,0 % | -3,70 |
| machine learning | 112 | 81,2 % | 77,7 % | -3,57 |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, MMLU-Pro, MMMU, SWE-bench u otros) en la informacion disponible.

## Requisitos de hardware

- Pesos: el repositorio ocupa 510,3 GB en safetensors con cuantizacion FP8/FP4 mixta. Se necesita un agregado de memoria de al menos ese orden solo para los pesos, mas activaciones y cache KV.
- Cache KV: no disponible el calculo exacto, ya que no se publica la configuracion de cabezas y de atencion; con 1M tokens de contexto el consumo es muy elevado y obliga a paralelismo de contexto.
- GPU recomendadas: 8xH100 80 GB (640 GB) es el minimo teorico en tensor parallel y deja poco margen para cache KV; 8xH200 141 GB (1.128 GB) o 8xB200 son configuraciones mas realistas. Alternativas con memoria unificada alta (MI300X 192 GB x8) no estan confirmadas.
- GPU de consumo: no cabe. Una RTX 4090 de 24 GB no puede alojar el modelo ni con offloading practico, ya que este exigiria del orden de 512 GB de RAM del sistema y degradaria el rendimiento hasta hacerlo inutilizable.
- Opciones de despliegue: la libreria declarada es `transformers` y el modelo esta marcado como `endpoints_compatible`. No hay GGUF publicado, por lo que llama.cpp y Ollama no son aplicables sin conversion propia. El soporte en vLLM, TGI u otros servidores no esta confirmado para la arquitectura `deepseek_v41`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | MMLU | HarmBench-320 (off / max) | Disponibilidad |
|---|---|---|---|---|---|---|
| codingforfun/DeepSeek-V4.1-Flash-UNCENSORED-FP8 | 763.205.315.794 segun safetensors (552B de backbone segun la card) | 1M tokens | MIT | 82,74 % | 100,0 % / 100,0 % | HuggingFace, transformers, FP8/FP4 nativo |
| deepseek-ai/DeepSeek-V4.1-Flash (base) | 552B de backbone, 8B/16B activos por token segun la card | 1M tokens | no disponible en la informacion proporcionada | 86,96 % | 42,81 % / 1,56 % | HuggingFace, transformers |
| Otras variantes abliteradas de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos es contra el propio modelo base, del que esta variante hereda arquitectura, contexto y cuantizacion, y del que se diferencia por la eliminacion del circuito de rechazo y por una perdida de 4,22 pp en MMLU-14k. No se dispone de datos de benchmarks para otras alternativas de la misma categoria (abliteradas o no) en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo elimina deliberadamente los guardarrailes de seguridad: declara un 100 % de ASR en las 7 categorias de HarmBench-320, incluidas chemical_biological, cybercrime_intrusion, illegal y misinformation_disinformation. No es apto para uso en produccion ni para exposicion a usuarios finales.
- Riesgo legal y de cumplimiento elevado. La licencia MIT no exime de responsabilidad por el uso que se haga del modelo; en la UE, el uso de sistemas que generan contenido ilicito puede entrar en conflicto con la normativa de servicios digitales y de IA.
- Las capacidades declaradas (abliteracion, preservacion de MMLU, vision, tool calling) proceden exclusivamente de la model card del autor y no estan verificadas de forma independiente. La evaluacion usa un clasificador regex propio y, en un caso, un LLM como juez, lo que es una metodologia debil.
- Inconsistencia de datos: safetensors reporta 763.205.315.794 parametros, mientras que la model card declara 552B de backbone con 8B/16B activos por token. La discrepancia no esta explicada.
- Repositorio con 0 descargas y 0 likes en el momento de la revision, etiquetado como "crack", publicado por un autor no verificado y con fechas de creacion y actualizacion del 13 de septiembre de 2026. Existe riesgo de cadena de suministro: no hay garantia de que los pesos correspondan a lo descrito.
- Degradacion medible en razonamiento etico y legal: -39,89 pp en moral scenarios y -7,04 pp en professional law sobre MMLU. No es fiable en dominios normativos o de asesoramiento.
- Riesgo de alucinacion: no se publican evaluaciones especificas de veracidad ni de calibracion; el modelo base con razonamiento extendido ya muestra sesgos propios, agravados por la ausencia de rechazo ante premisas falsas.
- Idiomas soportados no documentados, lo que impide garantizar un comportamiento correcto fuera del ingles.
- Limitaciones de contexto: aunque la ventana es de 1M tokens, no se publican resultados de rendimiento tipo "needle in a haystack" ni de degradacion a longitudes extremas.
- Restricciones de despliegue: sin GGUF, cuantizaciones adicionales ni confirmacion de soporte en servidores de inferencia; el coste de hardware (del orden de cientos de GB de memoria agregada) limita su uso a infraestructura de investigacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/codingforfun/DeepSeek-V4.1-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Perfil del autor en X: https://x.com/dealignai
- Perfil del autor en X: https://x.com/jordanschenck
- Paper tecnico, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (los enlaces recuperados pertenecian al portal de servicios digitales del Gobierno de Egipto y no guardan relacion con el modelo).
