# Compactbot/bananamind3-lft-2.5m

## Resumen

BananaMind 3 2.5M (LFT) es un modelo de lenguaje de 2.520.704 parámetros entrenado desde cero por el usuario @Compactbot, a petición de @Banaxi-Tech dentro de la familia BananaMind 3. Se publica bajo licencia Apache 2.0 y está pensado como modelo diminuto de generación de texto en inglés, con vocabulario BPE de 12.288 tokens y una longitud de contexto de 512 tokens.

Su rasgo diferencial es la arquitectura: en lugar de apilar catorce capas independientes, emplea un transformer con pesos compartidos (looped transformer, estilo Universal Transformer) de 6 bloques que se ejecutan 14 veces, de modo que alcanza profundidad efectiva con una huella de parámetros mínima. El modelo se entrenó sobre aproximadamente 2.100 millones de tokens de FineWeb-Edu, alcanzando una pérdida de validación de 2,0139 (perplejidad 7,49) sobre un conjunto de validación de un millón de tokens.

Es relevante no por su rendimiento cognitivo, sino como banco de pruebas reproducible de arquitecturas con compartición de pesos y como baseline de muy bajo coste. El propio autor advierte que captura patrones superficiales del lenguaje y no conocimiento del mundo, por lo que su contenido no es fiable desde el punto de vista factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped Transformer (LFT) con pesos compartidos, estilo Universal Transformer |
| Parametros totales | 2.520.704 (verificado por cabecera safetensors, 56 tensores) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (el autor solo publica pesos en float32) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, 56 tensores), float32; tokenizer.json (BPE, vocab 12288); checkpoint original last.pt |
| d_model | 128 |
| Cabezas de atencion | 2 (dimension por cabeza 64) |
| Dimension FFN | 240 |
| Normalizacion | RMSNorm |
| Codificacion posicional | RoPE (base 10000) |
| Embedding / LM head | atados (vocab 12288 x 128, contado una vez) |
| Desglose de parametros | embedding 1.572.864 + 6 bloques x 157.952 (947.712) + RMSNorm final 128 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con un esquema de comparticion de pesos: define 6 bloques cuyos parametros se reutilizan en 14 pasadas sucesivas (indice de bloque `i % 6`), con desplazamiento de RoPE entre iteraciones para inyectar informacion posicional distinta en cada ciclo. Con d_model de 128, 2 cabezas de atencion de dimension 64 y una FFN de 240, cada bloque aporta 157.952 parametros. El embedding de entrada y la cabeza LM estan atados, lo que concentra 1.572.864 parametros en la matriz de vocabulario. Todo el modelo se ejecuta en float32.

El entrenamiento se realizo desde cero sobre unos 2.100 millones de tokens de FineWeb-Edu (streaming), con tokenizador BPE de vocabulario 12.288. Se ejecutaron 8.000 pasos con batch de 64 y contexto de 512, optimizador AdamW (beta 0,9/0,95, weight decay 0,1) y tasa de aprendizaje 3e-4 con 200 pasos de warmup y decaimiento coseno. El hardware fue una unica RTX 5090 de 32 GB. La perdida de validacion final fue de 2,0139 (perplejidad 7,49) sobre un split retenido de un millon de tokens. No se documenta ninguna fase de RLHF, DPO ni ajuste por instrucciones. El autor senala que el checkpoint `best.pt` de la ejecucion estaba defectuoso (atascado en el paso 400) y que el modelo publicado corresponde a `last.pt` (paso 8000).

## Capacidades

- Generacion de texto en ingles: produccion coherente y gramatical con puntuacion correcta tanto en decodificacion greedy como muestreada, sin bucles de tokens ni secuencias incoherentes.
- Modelado de lenguaje superficial: captura patrones morfosintacticos y de estilo, no conocimiento factual.
- Razonamiento: señal debil por encima del azar en tareas de sentido comun y ciencia elemental (ARC-Easy, HellaSwag), insuficiente en sentido comun fisico (PIQA).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles; no se documenta soporte de otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Uso previsto declarado: baseline arquitectonico y experimento reproducible de transformers con comparticion de pesos, no asistente de uso general.

## Casos de uso

- Investigacion en comparticion de pesos: permite estudiar el efecto de reutilizar bloques y variar el numero de iteraciones sin cambiar el numero de parametros, comparando directamente contra una version de capas independientes con el mismo presupuesto.
- Baseline de juguete en pipelines de evaluacion: al ser un modelo de 2,5 M de parametros, sirve como referencia inferior (lower bound) en pruebas de harness de evaluacion zero-shot, verificando que el resto de la cadena funciona antes de escalar a modelos mayores.
- Docencia y divulgacion: un modelo que cabe en cualquier portatil y se carga sin GPU permite explicar en clase el forward pass de un transformer, el atado de embeddings y la codificacion RoPE con tiempos de ejecucion despreciables.
- Prototipado de interfaces de generacion de texto: util para probar rapidamente limites de contexto, estrategias de sampling (temperatura, top-k, top-p) y canalizaciones de decodificacion sin coste de computo.
- Generacion de texto de relleno realista en ingles: dado que produce ingles gramatical, puede emplearse para poblar entornos de prueba, maquetas o fixtures de aplicaciones que necesitan texto con apariencia natural pero sin valor informativo.
- Experimentacion con tokenizadores: el par modelo/tokenizer BPE de 12.288 entradas permite validar cambios de tokenizacion de extremo a extremo en un bucle de entrenamiento corto y barato.
- Ablaciones de contexto y posicion: con contexto de 512 y RoPE, es adecuado para medir el impacto del desplazamiento posicional entre iteraciones del bucle en la calidad de la salida.
- Formacion en despliegue de modelos tiny: sirve para ensayar carga de safetensors personalizados, verificacion del recuento de parametros por cabecera y conversion a otros formatos en entornos controlados.

## Benchmarks y rendimiento

Evaluacion zero-shot por loglikelihood, 200 ejemplos por tarea, medida sobre `last.pt` (paso 8000):

| Tarea | Accuracy | Baseline aleatorio |
|---|---|---|
| ARC-Easy | 27,5% (55/200) | 25% |
| HellaSwag | 28,5% (57/200) | 25% |
| PIQA | 45,0% (90/200) | 50% |

| Metrica de entrenamiento | Valor |
|---|---|
| Perdida de validacion final | 2,0139 |
| Perplejidad de validacion | 7,49 |
| Split de validacion | 1.000.000 tokens retenidos |

ARC-Easy y HellaSwag quedan ligeramente por encima del azar (senal real pero minima a esta escala); PIQA no supera su baseline del 50%, limitacion que el propio autor reconoce. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32, el modelo ocupa aproximadamente 10 MB de pesos (2.520.704 parametros x 4 bytes) mas activaciones; en la practica es inferior a 0,5 GB en cualquier configuracion razonable.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluida una RTX 4090, RTX 3090 o incluso una GTX 1650; el cuello de botella no es la VRAM sino la latencia de kernel. Tambien funciona en CPU sin penalizacion perceptible por su tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, y tambien en telefonos, Raspberry Pi y entornos integrados.
- Opciones de despliegue: al ser un transformer con bucle personalizado, no se carga con clases estandar de transformers ni con vLLM, llama.cpp, Ollama o TGI sin reimplementar el forward pass; el autor indica que debe cargarse con la clase LFT del script de entrenamiento `train_bananamind3_lft.py`. El despliegue practico exige codigo propio.
- Latencia y throughput estimados: no disponibles de forma oficial; por el tamano del modelo, la latencia dominante sera el overhead de lanzamiento de kernels y no el computo de matrices.

## Comparativa con modelos similares

No se dispone de una comparativa de benchmarks homogenea con alternativas, ya que para este modelo solo existen tres evaluaciones zero-shot y los modelos de la misma familia publicados por el mismo autor no exponen especificaciones completas en la informacion disponible. La comparacion factible se limita a atributos objetivos:

| Modelo | Parametros | Contexto | Licencia | Idioma | Notas |
|---|---|---|---|---|---|
| Compactbot/bananamind3-lft-2.5m | 2,52 M (6 bloques x 14 iteraciones) | 512 | Apache 2.0 | Ingles | Looped transformer con pesos compartidos; carga con clase personalizada |
| compactbot/gpt-s2.5-5m | no disponible en la informacion | no disponible | no disponible | no disponible | Mismo autor, indice externo de terceros; sin datos verificables aqui |
| GPT-2 small | 124 M | 1024 | MIT | Ingles | Transformer clasico sin comparticion de pesos; referencia habitual de modelos tiny |
| Pythia-70M | 70 M | 2048 | Apache 2.0 | Ingles | Suites de interpretabilidad con checkpoints intermedios |

Los dos ultimos se incluyen como referencias de categoria (modelos de menos de 200 M de parametros, en ingles, de uso libre), pero no se comparan rendimientos porque no hay evaluaciones equivalentes publicadas para este modelo en la informacion disponible.

## Limitaciones y advertencias

- Fiabilidad factual nula: con 2,5 M de parametros el modelo memoriza patrones de superficie, no hechos; el autor pide explicitamente tratar su contenido como no fiable.
- Alucinacion: riesgo alto por diseno; el modelo no distingue afirmaciones verdaderas de plausibles.
- Rendimiento por debajo del azar en PIQA indica carencias reales en sentido comun fisico.
- Contexto limitado a 512 tokens: no admite conversaciones largas ni documentos extensos sin truncado severo.
- Idioma: entrenado unicamente en ingles y sobre FineWeb-Edu; el comportamiento en castellano no esta documentado y previsiblemente sera deficiente.
- Sesgos: el corpus FineWeb-Edu es un subconjunto filtrado de web en ingles, por lo que heredara los sesgos de esa fuente; no se documenta ninguna mitigacion.
- Interoperabilidad: al no ser un modelo estandar de transformers, requiere una clase LFT personalizada; no es compatible de forma directa con vLLM, llama.cpp, Ollama o TGI y no hay versiones cuantizadas publicadas.
- Licencia: Apache 2.0 permite uso comercial, pero dadas las limitaciones de calidad, el uso en produccion orientado al usuario final no es recomendable.
- Caveat de procedencia: el checkpoint `best.pt` de la ejecucion de entrenamiento estaba defectuoso; solo `last.pt` (paso 8000) corresponde al modelo publicado.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Compactbot/bananamind3-lft-2.5m
- Discusion de la peticion del modelo: https://huggingface.co/spaces/Compactbot/model-requests/discussions/4
- Space del agente Compactbot: https://huggingface.co/spaces/CompactAI/Compactbot
- Listado de modelos de Compactbot: https://huggingface.co/Compactbot/models
- Ficha de terceros de compactbot/gpt-s2.5-5m: https://free2aitools.com/model/compactbot/gpt-s2.5-5m
