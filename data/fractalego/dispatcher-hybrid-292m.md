# fractalego/dispatcher-hybrid-292m

## Resumen

Dispatcher-Hybrid 292M es un modelo de lenguaje causal publicado por el usuario fractalego (Alberto) en HuggingFace. Su particularidad es que sustituye la autoatencion por un mezclador de secuencia denominado gated dyadic shift-and-sum en 16 de sus 18 capas; solo las capas 8 y 17 (indexadas desde 1) mantienen atencion de ventana deslizante de 1024 tokens. El modelo es una reactivacion del articulo arXiv:2105.03994, con mezcla O(N log N) y operaciones libres de comparaciones en las capas de arbol.

Con 292.158.464 parametros (embeddings atados), d_model 1024, 16 cabezas, FFN SwiGLU de 2816 y un contexto fijo de 4096 tokens (12 niveles diadicos), se situa en la liga de GPT-2 medium por tamano. Se entreno durante una sola epoca sobre 94.900 millones de tokens de FineWeb-Edu (subconjunto sample-100BT) y se distribuye en fp32 bajo licencia MIT, exclusivamente en ingles.

Su relevancia es fundamentalmente de investigacion: ofrece un punto de comparacion reproducible frente a un transformer de atencion con la misma receta a 6.500 millones de tokens, y permite estudiar el comportamiento real de mezcladores subcuadraticos (retrieval in-context, precision de ultima palabra, decodificacion con estado) sin la barrera de coste de un modelo grande. No es un modelo instruido, alineado ni filtrado para seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido: 16 capas con mezclador gated dyadic shift-and-sum (libre de atencion) y 2 capas con atencion de ventana deslizante 1024 + RoPE (capas 8 y 17, 1-indexadas) |
| Parametros totales | 292.158.464 (292,2 M), embeddings atados |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens, fijada por el numero de niveles diadicos (12) |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en fp32; el autor desaconseja castear los pesos a bf16 y recomienda evaluar con autocast bf16 |
| Idiomas soportados | Ingles unicamente (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, fp32; requiere transformers con codigo personalizado (tag `custom_code`) |
| d_model / cabezas / FFN | 1024 / 16 / 2816 (SwiGLU) |
| Capas | 18 |
| Tokenizer | GPT-2 BPE, vocabulario 50257 |
| Tamano del repositorio | 1,2 GB |
| Datos de entrenamiento | FineWeb-Edu (sample-100BT), 94.900 millones de tokens, una sola epoca |
| Precision de entrenamiento | fp32 con autocast bf16 |

## Arquitectura y entrenamiento

La innovacion central es el mezclador de las capas de arbol: un gated dyadic shift-and-sum. En lugar de calcular una matriz de atencion, la informacion se mezcla mediante desplazamientos y sumas sobre una jerarquia diadica, lo que da un coste O(N log N), sin comparaciones (operaciones tipo softmax sobre productos punto) y sin codificacion posicional explicita en esas 16 capas. La estructura posicional emerge de la propia jerarquia diadica, con 12 niveles que fijan el alcance maximo en 4096 tokens. Las dos capas de atencion restantes, intercaladas en las posiciones 8 y 17, usan ventana deslizante de 1024 tokens con RoPE y actuan como mecanismo de recuperacion precisa a corta distancia. El FFN es SwiGLU de 2816, el tokenizer es el BPE de GPT-2 y los embeddings estan atados.

El entrenamiento se realizo sobre FineWeb-Edu en su variante sample-100BT, con 94.900 millones de tokens y una unica epoca, en fp32 con autocast bf16. No se menciona ninguna fase de ajuste por instrucciones, RLHF, DPO ni filtrado de seguridad. El autor incluye una comparacion controlada: un transformer de atencion de 18 capas entrenado con la misma receta y los mismos datos, pero solo 6.500 millones de tokens, alcanza una entropia cruzada de 2,8097 frente a la del modelo hibrido; esa comparacion esta igualada en presupuesto de tokens, mientras que las cifras del hibrido a 94.900 millones de tokens no estan igualadas contra ninguna linea base.

Un detalle practico relevante es la decodificacion. El `generate()` estandar de la libreria recomputa el prefijo en cada paso, lo que hunde el rendimiento a 44 tokens/s con contexto 256 y 9 tokens/s con contexto 3900. El paquete asociado incluye decodificadores incrementales que mantienen el estado por nivel en ring buffers (unos 480 MB) y alcanzan 530-560 tokens/s de forma plana independientemente del contexto, con batching lockstep (filas de igual longitud) de hasta unos 3000 tokens/s agregados con batch 16. El batching de longitud variable no esta soportado.

## Capacidades

- Generacion de texto causal en ingles como modelo base, sin ajuste por instrucciones: no responde a ordenes ni sigue formatos de chat de forma fiable.
- Modelado de lenguaje y estimacion de probabilidad: entropia cruzada retenida de 2,5543 (perplejidad 12,86) sobre 400 documentos de FineWeb-Edu en una posicion del stream no vista durante el entrenamiento.
- Recuperacion semantica a traves del arbol diadico: el autor indica que el retrieval semantico no se ve afectado por la ventana de 1024 tokens.
- Vinculacion arbitraria in-context (MQAR): 78,1 % de acierto con 8 pares clave-valor, 49,7 % con 128 pares y 24,1 % con 256; el rendimiento cae a practicamente cero mas alla de la ventana de atencion de 1024 tokens.
- Razonamiento de sentido comun basico: HellaSwag 0,431 (acc_norm), PIQA 0,679 (acc_norm), WinoGrande 0,549, ARC combinado 0,489 zero-shot y 0,544 5-shot.
- No dispone de tool calling ni function calling.
- No dispone de soporte de agentes ni de razonamiento multi-paso orquestado.
- No dispone de capacidades de vision, audio ni modo de pensamiento explicito.
- Capacidad multilingue: nula mas alla del ingles (el modelo card declara unicamente `en`).

## Casos de uso

- Investigacion en mezcladores subcuadraticos: el modelo permite medir el impacto real de sustituir autoatencion por un esquema gated dyadic shift-and-sum, sustituyendo capas o variando el numero de niveles diadicos, con un coste de entrenamiento e inferencia muy contenido.
- Comparativas controladas de arquitectura: el autor publica una linea base de atencion con la misma receta y 6.500 millones de tokens, lo que permite replicar estudios de ablacion con presupuesto igualado en lugar de comparar cifras de regimenes distintos.
- Analisis de retrieval in-context bajo carga: la bateria MQAR (8, 128 y 256 pares) sirve para caracterizar el punto exacto en el que un mezclador sin atencion deja de vincular informacion arbitraria, informacion directamente util para disenar modelos hibridos.
- Generacion de texto en ingles en hardware modesto: con 1,17 GB de pesos en fp32, el modelo cabe en cualquier GPU de consumo, en iGPU o incluso en CPU, y sirve para generar texto de dominio general o completar documentos cuando no se requiere calidad de ultima generacion.
- Punto de partida para ajuste fino supervisado: al ser un base model MIT de 292 M, es un candidato razonable para fine-tuning de tareas concretas en ingles (clasificacion, resumen extractivo, generacion de dominio) en una unica GPU de consumo.
- Desarrollo y validacion de decodificadores con estado: los ring buffers incrementales del paquete y el batching lockstep lo convierten en un banco de pruebas para implementar decodificacion eficiente en arquitecturas no atencionales.
- Docencia y divulgacion: el contraste entre 16 capas sin atencion y 2 capas con atencion de ventana 1024 es un ejemplo didactico y reproducible de arquitectura hibrida, con licencia permisiva y pesos publicos.
- Experimentos de inferencia en el borde: el tamano reducido y la ausencia de dependencias de atencion cuadratica lo hacen apto para prototipos de generacion local en ingles, siempre que se asuma su calidad de GPT-2 medium/bajo.

## Benchmarks y rendimiento

Resultados medidos en fp32 con un unico arnes de evaluacion. La entropia cruzada retenida corresponde a 400 documentos de FineWeb-Edu en una posicion del stream que el entrenamiento nunca alcanzo.

| Metrica | Dispatcher-Hybrid 292M (94,9 B tokens) | Baseline de atencion 18 capas, misma receta (6,5 B tokens) |
|---|---|---|
| Entropia cruzada retenida | 2,5543 (ppl 12,86) | 2,8097 |
| LAMBADA (openai) acc / ppl | 0,347 / 15,83 | 0,285 / no disponible |
| LAMBADA, respuesta aparece antes | 0,396 | no disponible |
| LAMBADA, respuesta no aparece antes | 0,096 | no disponible |
| HellaSwag acc_norm | 0,431 | 0,334 |
| PIQA acc_norm | 0,679 | no disponible |
| WinoGrande | 0,549 | no disponible |
| ARC (easy + challenge) acc_norm | 0,489 zero-shot / 0,544 5-shot | no disponible |
| MQAR (8 / 128 / 256 pares) | 78,1 % / 49,7 % / 24,1 % | no disponible |

Nota del autor: la comparacion con la linea base esta igualada en presupuesto de tokens (6,5 B), mientras que las cifras del modelo hibrido corresponden a 94,9 B tokens y no estan igualadas contra ninguna linea base. El propio autor situa la perplejidad y la precision de sentido comun en el nivel de GPT-2 medium y la precision de LAMBADA en el nivel de GPT-2 small, con el deficit concentrado en predicciones que exigen recuperacion precisa.

## Requisitos de hardware

- Peso de los pesos en fp32: aproximadamente 1,17 GB (292.158.464 parametros x 4 bytes), coherente con el tamano de repositorio de 1,2 GB.
- Si se castearan a bf16 ocuparian unos 0,58 GB, pero el autor desaconseja explicitamente ese casteo por ser mediblemente lossy a este tamano; lo recomendado es mantener los pesos en fp32 y usar autocast bf16 en la evaluacion.
- Estado de los decodificadores incrementales: aproximadamente 480 MB de ring buffers, que se suman al peso de los pesos.
- VRAM estimada para inferencia: del orden de 2 GB con pesos fp32 mas estado incremental, y algo menos si se usa `generate()` sin decodificadores con estado (a costa de una caida fuerte de velocidad). Cifra orientativa calculada a partir de los datos del modelo card, no publicada por el autor.
- Cabe sin problema en GPU de consumo: RTX 3060 12 GB, RTX 4060, RTX 4090, e incluso en iGPU o CPU con memoria suficiente, dado el tamano de 292 M.
- GPU profesionales: A100, H100 o L40S estan sobradamente dimensionadas; solo tendrian sentido para batching a gran escala.
- Opciones de despliegue: al ser una arquitectura personalizada (tag `custom_code`), requiere `transformers` con `trust_remote_code=True` y el paquete asociado del repositorio de GitHub. No hay soporte publicado para vLLM, TGI, llama.cpp ni Ollama, y no se distribuyen pesos GGUF.
- Throughput medido: 44 tokens/s con `generate()` a contexto 256 y 9 tokens/s a contexto 3900; 530-560 tokens/s planos con los decodificadores incrementales del paquete; hasta unos 3000 tokens/s agregados con batching lockstep a batch 16. El batching de longitud variable no esta soportado.

## Comparativa con modelos similares

La comparacion mas util es la que proporciona el propio autor (misma receta, mismo dato, distinto presupuesto de tokens). Frente a modelos de tamano similar, solo se dispone de datos publicos de parametros, contexto y licencia.

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Rendimiento documentado |
|---|---|---|---|---|---|
| Dispatcher-Hybrid 292M | 292,2 M | 4096 | Hibrida: 16 capas gated dyadic shift-and-sum + 2 capas de atencion de ventana 1024 | MIT | CE 2,5543; HellaSwag 0,431; PIQA 0,679; LAMBADA 0,347 |
| Baseline de atencion 18 capas (misma receta) | no disponible | no disponible | Transformer de atencion | no disponible | CE 2,8097; LAMBADA 0,285; HellaSwag 0,334 (a 6,5 B tokens) |
| GPT-2 medium | 355 M | 1024 | Transformer de atencion | Licencia MIT modificada | No comparable en la informacion disponible; el autor situa este modelo en su mismo nivel de perplejidad y sentido comun |
| GPT-2 small | 124 M | 1024 | Transformer de atencion | Licencia MIT modificada | No comparable en la informacion disponible; el autor situa la precision LAMBADA de este modelo en ese nivel |

No se han encontrado en la informacion disponible comparativas con otros modelos subcuadraticos (Mamba, RWKV, xLSTM, Hyena) ni cifras de benchmarks de terceros para este modelo concreto.

## Limitaciones y advertencias

- Artefacto de investigacion: es un modelo base sin ajuste por instrucciones, sin alineacion y sin filtrado de seguridad. Reproduce lo que contenga FineWeb-Edu, incluidos sesgos y contenido problematico presente en el corpus.
- Precision de ultima palabra: el deficit de rendimiento se concentra en predicciones que requieren recuperacion precisa; en LAMBADA la precision cae a 0,096 cuando la respuesta no aparece antes en el contexto.
- Vinculacion in-context arbitraria degradada: baja del 78 % con 8 pares clave-valor al 50 % con 128 y al 24 % con 256, y es practicamente nula mas alla de la ventana de atencion de 1024 tokens. El retrieval semantico a traves del arbol no se ve afectado, segun el autor.
- Contexto fijo de 4096 tokens: no se puede extender sin cambiar el numero de niveles diadicos, es decir, sin reentrenar.
- Rendimiento de generacion pobre con la ruta estandar: `generate()` recomputa el prefijo en cada paso y cae a 9 tokens/s con contexto 3900. Usar la ruta estandar en produccion es inviable; hay que usar los decodificadores incrementales del paquete.
- Restricciones de despliegue: requiere `trust_remote_code=True` y codigo personalizado; no funciona en los runners habituales (vLLM, TGI, llama.cpp, Ollama) y no hay pesos cuantizados publicados. El batching de longitud variable no esta soportado, lo que limita los servidores de inferencia convencionales.
- Solo ingles: cualquier uso en castellano u otros idiomas dara resultados degradados; el modelo card declara unicamente `en`.
- Licencia MIT: permisiva para uso comercial, pero la ausencia de filtrado de seguridad traslada al integrador toda la responsabilidad sobre el contenido generado.
- Advertencia de precision: no castear los pesos a bf16; el autor lo describe como mediblemente lossy para este tamano.
- Adopcion practicamente nula en el momento de redactar esta ficha (0 descargas, 0 likes), por lo que no existe ecosistema, herramientas de terceros ni validacion independiente de las cifras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fractalego/dispatcher-hybrid-292m
- Codigo y scripts de reproduccion: https://github.com/fractalego/dispatcher-hybrid-2
- Articulo original reactivado por el autor: https://arxiv.org/abs/2105.03994
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los unicos resultados obtenidos eran listados de sitios para adultos sin ninguna relacion con el contenido de la ficha.
