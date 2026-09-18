# OliverSundaram/Sai-Slice1-60M-base

## Resumen

Sai-Slice1-60M-base es un modelo de lenguaje decoder-only con arquitectura de mezcla de expertos (MoE) desarrollado por el usuario OliverSundaram, publicado en HuggingFace bajo licencia Apache 2.0. Con 60.681.984 parametros totales y solo unos 19,3 millones activos por token, se trata de un modelo experimental de escala muy reducida, preentrenado desde cero sobre aproximadamente 1.190 millones de tokens de texto web en ingles procedentes del subconjunto `Ultra-FineWeb-L3-en-Multi-Style-Synthetic` del dataset openbmb/Ultra-FineWeb-L3. Es la primera entrega (slice 1) de la serie Sai.

Se trata de un modelo base, sin ajuste por instrucciones: su funcion es continuar texto, no mantener conversaciones. El autor ha anunciado un fine-tune de chat posterior (Sai-Slice1-60M-Chatter), cuyos tokens especiales de plantilla (`<|system|>`, `<|user|>`, `<|assistant|>`) ya estan definidos en el tokenizador. La relevancia de esta ficha es acotada: sirve como caso de estudio de un MoE entrenado de principio a fin en una unica GPU de consumo (RTX 4060 de 8 GB) durante 24,9 horas, y como banco de pruebas para arquitecturas MoE de vocabulario pequeno y contexto corto.

La innovacion principal no esta en el rendimiento, sino en la relacion entre parametros totales y activos: 25 expertos por capa MoE (24 enrutados mas uno compartido) con top-4 enrutado, lo que reduce el coste por token a menos de un tercio del total. La contrapartida es un contexto de solo 1.024 tokens y un entrenamiento de un unico epoch, muy por debajo de lo que se considera compute-optimal en modelos de esta escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, pre-norm, con mezcla de expertos (MoE) |
| Parametros totales | 60.681.984 (~60,6 M) |
| Parametros activos | ~19,3 M por token |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32), requiere `trust_remote_code=True` |
| Capas | 15 (1 densa + 14 MoE) |
| Tamano oculto | 256 |
| Atencion | Multi-head, 8 cabezas, dimension de cabeza 32 |
| Embeddings posicionales | RoPE (base 10.000) |
| Normalizacion | RMSNorm |
| Feed-forward | SwiGLU; dimension oculta 1.024 (capa densa) y 192 (por experto) |
| Expertos por capa MoE | 24 enrutados + 1 compartido (top-4 enrutado) |
| Vocabulario | 16.384 tokens (BPE a nivel de byte) |
| Embeddings | atados entrada/salida (4,19 M de parametros) |
| Desglose de parametros | embeddings 4,19 M; atencion 3,93 M; FFN densa 0,79 M; capas MoE 51,7 M |
| Tokens de entrenamiento | ~1,19 mil millones (1 epoch) |
| Computo de entrenamiento | 24,9 h en una sola RTX 4060 (8 GB) |
| Perplejidad en test | ~8,2 (entropia cruzada 2,101) |
| Cache KV | si (gestionada internamente por el modelo) |
| Tamano del repositorio | 0,7 GB |
| Libreria y versiones | transformers 5.16.1, torch 2.11.0 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con normalizacion previa (pre-norm) y RMSNorm, activacion SwiGLU y embeddings posicionales rotatorios RoPE con base 10.000. La primera de las 15 capas usa una FFN densa de dimension oculta 1.024; las 14 restantes sustituyen la FFN por una capa MoE con 24 expertos enrutados mas un experto compartido al que se dirige siempre el token, cada uno con dimension oculta 192. El router selecciona los 4 expertos enrutados mas probables (top-4), de modo que cada token atraviesa 5 de los 25 expertos de cada capa. El entrenamiento del enrutado incorpora una perdida auxiliar de equilibrio de carga. El vocabulario es un BPE a nivel de byte de 16.384 entradas entrenado sobre el primer millon de documentos del mismo subconjunto, con longitud maxima de token de 16 y cinco tokens especiales: `<|end|>` (EOS), `<|pad|>`, `<|user|>`, `<|assistant|>` y `<|system|>`.

Los datos proceden del subconjunto `Ultra-FineWeb-L3-en-Multi-Style-Synthetic` del dataset openbmb/Ultra-FineWeb-L3, leidos en streaming y mezclados con semilla 42, con un total de ~1,2 mil millones de tokens repartidos en 99,5 % entrenamiento, 0,25 % validacion y 0,25 % test. El separador de documentos es `<|end|>`. Se trata de un preentrenamiento de un solo epoch sobre una unica RTX 4060 de 8 GB en 24,9 horas, por lo que el presupuesto de computo es extremadamente limitado. No se menciona en la informacion disponible ninguna fase de RLHF, DPO o ajuste por instrucciones: el modelo es estrictamente base.

Una particularidad tecnica relevante es que el modelo gestiona su propia cache KV y expone un metodo `model.run(...)` propio que devuelve el texto generado junto con los tokens por segundo y el tiempo hasta el primer token. Esto implica que el metodo `generate()` de HuggingFace no es compatible, ya que el modelo no devuelve `past_key_values`. Una pasada forward estandar (`model(input_ids, attention_mask=...)`) si funciona y devuelve logits, por lo que es compatible con herramientas como `lm-evaluation-harness`.

## Capacidades

- Generacion de texto por continuacion: el modelo completa un prompt de texto plano. Es su unico modo de uso nativo, con `format_prompt=False`.
- Modelo base sin instrucciones: no sigue ordenes, no responde a preguntas formuladas como peticion y no mantiene formato conversacional.
- Cache KV propia: la generacion reutiliza la cache interna para acelerar la decodificacion autorregresiva (`use_cached=True`).
- Muestreo configurable: admite parametros de generacion como `top_k`, `temp` y `max_new_tokens`.
- Parada controlada: la generacion se detiene al alcanzar el token `<|end|>`, el limite de `max_new_tokens` o el limite de contexto de 1.024 tokens.
- Logits para evaluacion: la pasada forward estandar permite calcular perplejidad y entropia cruzada con arneses externos.
- Tokenizador preparado para chat: incluye los tokens `<|system|>`, `<|user|>` y `<|assistant|>` y una plantilla de chat, pero estan pensados para el fine-tune futuro, no para este modelo base.
- Idiomas: unicamente ingles.
- Sin vision, audio, tool calling ni function calling documentados.
- Sin modo de razonamiento explicito (thinking mode) ni soporte de agentes.

## Casos de uso

- Estudio de arquitecturas MoE a escala reducida: el modelo permite analizar el comportamiento de un router top-4 con 25 expertos y perdida de equilibrio de carga en un entorno de un solo GPU, algo inviable con MoE de gran tamano.
- Reproduccion de experimentos en hardware de consumo: con 60,6 M de parametros totales y 19,3 M activos, un ciclo completo de preentrenamiento cabe en una RTX 4060 de 8 GB en poco mas de un dia, lo que lo hace util como banco de pruebas reproducible.
- Evaluacion de estrategias de tokenizacion: su vocabulario BPE de 16.384 entradas y longitud maxima de token de 16 permiten medir el impacto de vocabularios pequenos en la perplejidad y en la velocidad de decodificacion.
- Prototipado de pipelines de evaluacion: al devolver logits en una pasada forward estandar, se puede integrar en `lm-evaluation-harness` para probar metricas de lenguaje sobre un checkpoint pequeno antes de escalar a modelos mayores.
- Continuacion de texto en tareas de baja exigencia: completado de frases, generacion de titulares o relleno de plantillas cortas en ingles, siempre que el contexto no supere los 1.024 tokens.
- Educacion e investigacion docente: sirve para ilustrar de forma tangible conceptos como enrutado disperso, cache KV, perplejidad, tokens especiales y plantillas de chat sin necesidad de infraestructura de GPU dedicada.
- Pruebas de integracion de codigo personalizado en transformers: el requisito de `trust_remote_code=True` y su API no estandar lo convierten en un caso de prueba para validar flujos de carga de modelos con codigo remoto.
- Base para fine-tunes experimentales: al ser un modelo apache-2.0 y un checkpoint base, puede servir de punto de partida para ajustes supervisados de dominio muy acotado en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ARC, HellaSwag u otros) en la informacion disponible. El unico dato de rendimiento reportado por el autor es la entropia cruzada en el conjunto de test y su perplejidad asociada.

| Metrica | Valor | Conjunto |
|---|---|---|
| Entropia cruzada (test) | 2,101 | Split de test del subconjunto Ultra-FineWeb-L3-en-Multi-Style-Synthetic |
| Perplejidad (test) | ~8,2 | Split de test del subconjunto Ultra-FineWeb-L3-en-Multi-Style-Synthetic |
| MMLU | no disponible | - |
| HumanEval | no disponible | - |
| GSM8K | no disponible | - |

Nota metodologica: una perplejidad de ~8,2 en texto web en ingles es coherente con un modelo de este tamano entrenado durante un solo epoch, pero no es directamente comparable con perplejidades publicadas por otros modelos, ya que depende del tokenizador, del preprocesado y del split de evaluacion. No hay comparacion con modelos similares en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 ocupan aproximadamente 243 MB (60.681.984 parametros x 4 bytes). Sumando activaciones y cache KV para 1.024 tokens de contexto, el consumo real se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con mas de 1-2 GB de VRAM es suficiente. El propio autor entreno el modelo en una RTX 4060 de 8 GB, que queda muy por encima de lo necesario para inferencia.
- GPU de gama alta (A100, H100): innecesarias para este modelo; su uso solo tendria sentido para ejecutar muchos lotes en paralelo o para reentrenar desde cero.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en CPU.
- CPU: viable sin GPU, dado el reducido numero de parametros activos, aunque la latencia por token sera mayor.
- Opciones de despliegue: no disponible. El modelo requiere `trust_remote_code=True` y usa una API de generacion propia (`model.run`) que no es compatible con `generate()`, por lo que no funciona de forma directa con runtimes que asumen la interfaz estandar de transformers (vLLM, TGI, llama.cpp, Ollama). No se han publicado pesos en GGUF ni adaptaciones a estos formatos.
- Latencia y throughput: no disponible. El metodo `model.run` devuelve tokens por segundo y tiempo hasta el primer token, pero el autor no publica cifras de referencia.
- Entrenamiento: el preentrenamiento completo requirio 24,9 horas en una unica RTX 4060 de 8 GB, lo que da una idea del orden de magnitud del coste de reentrenamiento.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la informacion proporcionada, y la busqueda web asociada no devolvio resultados relevantes sobre este modelo ni sobre alternativas de su categoria. La siguiente tabla recoge unicamente los datos confirmados del modelo objeto de la ficha; las columnas de alternativas no pueden completarse con datos contrastados.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Benchmarks publicos |
|---|---|---|---|---|---|
| Sai-Slice1-60M-base | 60,68 M | ~19,3 M | 1.024 | Apache 2.0 | No publicados (solo perplejidad de test ~8,2) |
| Alternativas de la misma categoria (modelos base de menos de 200 M) | no disponible | no disponible | no disponible | no disponible | no disponible |

Criterios de comparacion que si pueden aplicarse con los datos disponibles: frente a un transformer denso de ~60 M de parametros, este modelo activa solo ~19,3 M por token, lo que reduce el coste de computo por token a aproximadamente un tercio, a cambio de un mayor consumo de memoria por los 51,7 M de parametros concentrados en las 14 capas MoE. Frente a modelos base de su misma escala, su contexto de 1.024 tokens es notablemente corto y su presupuesto de entrenamiento (1,19 mil millones de tokens, un epoch) es reducido. Cualquier comparacion de calidad que vaya mas alla de estas dimensiones estructurales queda fuera del alcance de la informacion disponible.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue ordenes ni mantiene conversaciones. Usarlo con `format_prompt=True` produciria resultados degradados, ya que la plantilla de chat esta pensada para el fine-tune futuro.
- Contexto muy limitado: 1.024 tokens. No es apto para documentos largos, resumenes extensos ni dialogos multi-turno prolongados.
- Solo ingles: el entrenamiento se realizo exclusivamente sobre texto web en ingles; no hay capacidades multilingues documentadas.
- Riesgo de alucinacion y de texto incoherente: con 60 M de parametros totales, 19,3 M activos y un solo epoch sobre ~1,2 mil millones de tokens, la calidad de generacion es inherentemente baja. El modelo puede producir texto gramaticalmente plausible pero factualmente incorrecto o sin sentido.
- Sesgos: el corpus de origen es texto web filtrado, por lo que hereda los sesgos presentes en ese tipo de datos (representacion desigual, estereotipos, contenido de baja calidad). No se documenta ningun proceso de mitigacion.
- API no estandar: el metodo `generate()` no funciona y hay que usar `model.run`. Esto rompe la compatibilidad con buena parte del ecosistema de despliegue y requiere adaptar el codigo de integracion.
- Ejecucion de codigo remoto: la carga exige `trust_remote_code=True`, lo que implica ejecutar codigo Python proporcionado por el autor del repositorio. Conviene auditar ese codigo antes de usarlo en entornos de produccion.
- Compatibilidad de versiones: el modelo se construyo y probo con `transformers==5.16.1` y `torch==2.11.0`. Otras versiones pueden no ser compatibles.
- Ausencia de cuantizaciones oficiales: no se han publicado pesos en GGUF, AWQ, GPTQ ni formatos similares, y los pesos distribuidos estan en float32. Esto limita las opciones de despliegue en runtimes ligeros.
- Licencia: Apache 2.0, que permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique si se han realizado cambios. No impone restricciones adicionales de uso, pero tampoco ofrece garantias.
- Madurez del proyecto: el repositorio registra 0 descargas y 1 "like" en el momento de la consulta, y el modelo fue publicado recientemente. No hay evidencia de validacion por parte de terceros.
- Caveat de produccion: por su tamano, contexto y calidad esperada, no se recomienda su uso en aplicaciones de produccion orientadas a usuarios finales. Su valor es experimental y educativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OliverSundaram/Sai-Slice1-60M-base
- Repositorio GitHub del proyecto Sai: https://github.com/OliverSundaram/Sai
- Dataset de entrenamiento: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Paper o informe tecnico: no disponible
- Demo o Space: no disponible
- Modelo de chat anunciado (Sai-Slice1-60M-Chatter): no publicado en el momento de la consulta
- Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo (corresponden a guias de viaje sobre Osaka), por lo que no se incluye ningun enlace adicional procedente de esa busqueda.
