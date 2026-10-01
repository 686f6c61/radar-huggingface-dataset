# inference-optimization/qwen38-dspark-pretrain-fineweb

## Resumen

El modelo `inference-optimization/qwen38-dspark-pretrain-fineweb` es un checkpoint intermedio de un **modelo draft (borrador) para decodificacion especulativa** asociado a `Qwen/Qwen3.8-27B`. No es un modelo generativo autonomo: se trata de un componente auxiliar de 5 capas transformer con 5.120 dimensiones ocultas y aproximadamente 0,46B parametros entrenables, disenado para proponer bloques de 8 tokens que el verificador Qwen3.8-27B valida despues. Lo publica el usuario `inference-optimization` dentro del ecosistema `speculators` (fork de `vllm-project/speculators`).

El checkpoint corresponde al paso global 85.124 del **pretraining de etapa 1 en modo token-only (sin estados ocultos del verificador)**, tras aproximadamente 16.700 millones de tokens vistos, lo que supone un 8,3% de un corpus de 199.060 millones de tokens basado en una mezcla multilingue de FineWeb. El autor lo describe explicitamente como un **arranque en caliente (warm start)** para la fase de cooldown sobre datos de chat on-policy y, despues, para una destilacion de estados ocultos de etapa 2.

Su relevancia es acotada pero clara: sirve como material de partida reproducible para investigacion en decodificacion especulativa y como referencia de metricas de aceptacion (accept_rate 0,1407, eal 1,6142) en un momento concreto del entrenamiento. Al ser un snapshot de mitad de ejecucion, no debe tratarse como un artefacto listo para produccion ni como un modelo de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de 5 capas, hidden 5120, con `markov_head` (condicionamiento Markov intra-bloque) y `confidence_head` (probabilidad de aceptacion por posicion); draft para decodificacion especulativa |
| Parametros totales | 1.804.930.817 en safetensors (incluye `embed_tokens` y `lm_head` reconstruidos del verificador); ~0,46B parametros entrenables del draft |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible. El draft opera con `block_size` de 8 tokens y anclas empaquetadas; el contexto efectivo lo determina el verificador Qwen3.8-27B |
| Tipos de cuantizacion | No disponible (la model card no documenta cuantizaciones publicadas) |
| Idiomas soportados | No disponible como campo declarado. La mezcla de entrenamiento es multilingue: ingles (fineweb-edu) mas cmn_Hani, jpn_Jpan, kor_Hang, rus_Cyrl, arb_Arab, spa_Latn, fra_Latn y deu_Latn de FineWeb-2 |
| Licencia | No disponible |
| Formato de pesos | safetensors con `config.json` y `config.py` (clase de modelo); requiere `custom_code` del paquete `speculators` |
| Tamano del repositorio | 3,6 GB |
| Verificador asociado | `Qwen/Qwen3.8-27B` (congelado, no incluido en el repositorio) |
| Framework de carga | `speculators 0.9.0.dev45` (`from_pretrained`), torch 2.13.0, transformers 5.16.1 |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-10-01 |

## Arquitectura y entrenamiento

El draft es un transformer compacto de 5 capas con dimension oculta de 5.120 que comparte el espacio de embeddings del verificador: los pesos de `embed_tokens` y `lm_head` no se entrenan y se reconstruyen desde `Qwen/Qwen3.8-27B`. El condicionamiento es **token-only**: `target_layer_ids: [0]`, de modo que la entrada de la capa fully-connected es un tensor `[T, 5120]` calculado sobre los embeddings congelados del verificador, sin acceso a estados ocultos intermedios. Esta es precisamente la caracteristica que define la etapa 1, denominada *verifier-free*, y que la hace mucho mas barata de entrenar que la destilacion de estados ocultos posterior. La generacion de propuestas usa `sample_from_anchor` con `block_size` 8, e incorpora dos cabezas: `markov_head` para modelar dependencias intra-bloque y `confidence_head` para estimar la probabilidad de aceptacion de cada posicion.

El entrenamiento usa perdida `ce_token` (entropia cruzada con etiquetas duras contra los tokens greedy del verificador), con `<|im_end|>` como EOS, optimizador **Muon** con learning rate constante de 1e-3, 51 pasos de warmup y semilla 42. Cada rango procesa secuencias empaquetadas de 24.576 tokens (3.072 anclas x bloque de 8), con un lote global de 196.608 tokens por paso en 8xH200 con FSDP. La mezcla de datos combina 1/2 de fineweb-edu (muestra de 100BT, ingles) con 1/16 de cada uno de ocho idiomas de FineWeb-2, en mezcla exacta por tokens. El checkpoint publicado esta en el paso 85.124, con `loss 2.1623`, `eal 1.6142`, `position_0_acc 0.3554`, `accept_rate 0.1407` y `full_acc 0.2536`; se trata de la decimotercera validacion consecutiva mejorando (V13) y de un snapshot en la hora ~25 de una ejecucion planificada de 40 horas. El estado del optimizador y del scheduler se ha excluido deliberadamente porque la fase de cooldown arranca con un optimizador nuevo y una topologia FSDP distinta en el hardware destino. La hoja de ruta prevista es: cooldown token-only sobre datos de chat on-policy con LR descendente lineal, expansion de ceros en `fc.weight` de `[5120, 5120]` a `[5120, 46080]` con `aux_hidden_state_layer_ids` extendidos a `[0,4,12,20,28,36,44,52,60]`, y destilacion de estados ocultos de etapa 2.

## Capacidades

- **Propuesta de tokens para decodificacion especulativa**: genera bloques de 8 tokens candidatos que el verificador Qwen3.8-27B acepta o rechaza. No produce respuestas finales por si mismo.
- **Condicionamiento Markov intra-bloque**: `markov_head` modela la coherencia entre las posiciones dentro del mismo bloque, lo que mejora la tasa de aceptacion frente a una propuesta independiente por posicion.
- **Estimacion de confianza por posicion**: `confidence_head` devuelve una probabilidad de aceptacion por token, util para truncar dinamica o priorizar bloques.
- **Multilingueismo de partida**: la mezcla de entrenamiento cubre ingles, chino (Hani), japones, coreano, ruso, arabe, espanol, frances y aleman, aunque el checkpoint solo ha visto un 8,3% del corpus.
- **Compatibilidad con vLLM**: integrable mediante `speculators` (fork con rama `qwen38-27b-dspark-pretraining`), con `vllm 0.30.0` como backend de referencia.
- **No soporta**: tool calling, function calling, agentes, razonamiento multi-paso autonomo, vision ni audio. Estas capacidades residirian en el verificador, no en el draft.
- **No dispone de modo thinking ni de plantilla de chat propia**: el EOS `<|im_end|>` se hereda del tokenizador del verificador.

## Casos de uso

- **Aceleracion de inferencia de Qwen3.8-27B en produccion**: el draft propone bloques de 8 tokens y el verificador los valida en paralelo, reduciendo el numero de pasos de decodificacion. Con `accept_rate` 0,1407 y `eal` 1,6142 en este checkpoint, la ganancia esperada es modesta y deberia medirse antes de desplegar; el modelo esta pensado para completarse antes de usarse en este escenario.
- **Investigacion en decodificacion especulativa**: sirve como punto de partida reproducible para experimentos de cooldown, comparacion de recetas de destilacion o estudio del impacto del condicionamiento token-only frente al uso de estados ocultos.
- **Arranque en caliente de pipelines de entrenamiento propios**: el autor lo publica explicitamente como warm start para una fase de cooldown con optimizador nuevo, de modo que un equipo puede reutilizar los pesos y ahorrarse las ~16.700 millones de tokens de la etapa 1.
- **Analisis de metricas de aceptacion**: los ficheros `val_metrics.json` y `config.py` permiten reproducir y auditar `eal`, `accept_rate`, `accept_len`, `position_0_acc` y `full_acc en un punto concreto del entrenamiento, util para calibrar estimadores analiticos de rejection sampling.
- **Servicio de chat de baja latencia sobre el verificador**: en una pila vLLM con `speculators`, el draft se carga junto al modelo de 27B para reducir la latencia por token en cargas de generacion larga, siempre que la tasa de aceptacion medida en produccion justifique el coste de memoria adicional.
- **Generacion de codigo asistida en IDE**: el escenario tipico de decodificacion especulativa (autocompletado con contexto largo y salidas cortas) es donde este tipo de draft rinde mejor, ya que los bloques de 8 tokens encajan con la estructura repetitiva del codigo.
- **Traduccion y generacion multilingue**: al haberse entrenado sobre ocho idiomas de FineWeb-2 ademas de ingles, el draft puede proponer tokens en espanol, frances, aleman, ruso, arabe, chino, japones y coreano, aunque el checkpoint actual solo ha completado el 8,3% del corpus previsto.
- **Punto de comparacion en benchmarks internos**: util como linea base de un draft "sin estados ocultos" contra el que medir el salto de rendimiento de la etapa 2 con destilacion, o contra alternativas como EAGLE-3 o Medusa en la misma pila.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible, y no tendria sentido aplicarlos a un modelo draft que no genera respuestas finales. Lo unico documentado son las metricas de validacion internas del propio entrenamiento:

| Metrica | Valor | Definicion segun el autor |
|---|---|---|
| loss (val, V13) | 2,1623 | Entropia cruzada de validacion |
| eal | 1,6142 | Longitud aceptada esperada greedy por bloque de 8 tokens, incluyendo el token bonus +1 del verificador; techo 9,0 |
| position_0_acc | 0,3554 | Precision en la primera posicion del bloque |
| accept_rate | 0,1407 | Cantidad analitica de rejection sampling (1 - solapamiento TV) |
| full_acc | 0,2536 | Precision de bloque completo |
| Tokens vistos | ~16,7B | paso global 85.124, epoca 0, 8,3% del corpus de 199,06B |
| Hardware de entrenamiento | 8xH200 (FSDP) | 196.608 tokens por paso global |

## Requisitos de hardware

- **VRAM del draft**: los 1.804.930.817 parametros del repositorio ocupan 3,6 GB en el formato publicado. En bf16 el draft necesitaria del orden de 3,6 GB de VRAM, mas el espacio de activaciones y el cache KV asociado.
- **VRAM del sistema completo**: el verificador `Qwen/Qwen3.8-27B` es congelado y no esta incluido en el repositorio; hay que descargarlo aparte del Hub. En bf16 un modelo de 27B requiere aproximadamente 54 GB de pesos, por lo que la pila completa no cabe en GPUs de consumo.
- **GPU recomendadas**: H100 o H200 para el sistema completo en datacenter; A100 de 80 GB como alternativa. El entrenamiento documentado se hizo con 8xH200 en FSDP.
- **GPU de consumo**: el draft por si solo cabe holgadamente en una RTX 4090 (24 GB) o incluso en GPUs de 8-12 GB, pero el verificador de 27B no, por lo que no es viable ejecutar la pila completa en hardware de consumo sin cuantizacion del verificador.
- **Opciones de despliegue**: `speculators` 0.9.0.dev45 (`from_pretrained`), con `vllm 0.30.0` como motor de inferencia de referencia. Requiere `torch 2.13.0` y `transformers 5.16.1`. `vllm` no es necesario para el cooldown token-only de etapa 1, segun indica el autor.
- **Latencia y throughput**: no disponible. La ganancia real depende directamente de la tasa de aceptacion, que en este checkpoint es de 0,1407 con un `eal` de 1,6142 sobre bloques de 8, valores que corresponden a un modelo a un 8,3% de su entrenamiento y que el autor espera superar con el cooldown y la etapa 2.
- **Compatibilidad**: requiere el codigo personalizado del fork de `speculators` (rama `qwen38-27b-dspark-pretraining`, commit `e7c724808ac8d0fc70740b8bffe29cd7e49a638f`); no es cargable con `transformers` estandar sin ese paquete.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. Los resultados de la busqueda web no devolvieron material tecnico relevante sobre este modelo ni sobre alternativas de la misma categoria, solo definiciones genericas del termino "inference". Como referencia de categoria, el draft compite conceptualmente con las familias de decodificacion especulativa tipo EAGLE-3 y Medusa, y con los propios drafts publicados dentro del ecosistema `vllm-project/speculators`, pero no se han facilitado cifras de parametros, contexto, rendimiento ni licencia de ninguno de ellos para esta ficha.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen38-dspark-pretrain-fineweb | 1,80B totales / ~0,46B entrenables | No disponible | eal 1,6142; accept_rate 0,1407 (validacion propia) | No disponible | HuggingFace, 0 descargas |
| Alternativas de la misma categoria (EAGLE-3, Medusa, drafts de speculators) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- **No es un modelo final**: se trata de un checkpoint intermedio (paso 85.124, hora ~25 de 40) en la epoca 0 del entrenamiento. El propio autor advierte que las ejecuciones posteriores lo superan.
- **Sin capacidad generativa autonoma**: entrenado con entropia cruzada contra los tokens greedy del verificador, no esta optimizado para producir respuestas coherentes por si solo. Usarlo como modelo de chat daria resultados deficientes.
- **Requiere el verificador externo**: `Qwen/Qwen3.8-27B` no esta incluido en el repositorio y debe descargarse por separado. Sin el, los pesos no son funcionales.
- **Estado del optimizador excluido a proposito**: no se puede reanudar el entrenamiento desde este checkpoint de forma transparente; el cooldown previsto arranca con optimizador nuevo, lo que implica una discontinuidad deliberada.
- **Tasas de aceptacion bajas en este punto**: `accept_rate` 0,1407 y `full_acc` 0,2536 indican que la mayoria de las propuestas se rechazan. La aceleracion neta en produccion seria limitada y podria no compensar el coste de memoria del draft.
- **Riesgo de alucinacion**: no aplica en el sentido habitual, ya que el verificador filtra cada token propuesto. El riesgo se traslada al verificador, no al draft.
- **Sesgos**: no documentados. La mezcla de datos (mitad en ingles, octavos para ocho idiomas) implica un sesgo evidente hacia el ingles y una representacion muy desigual del resto de idiomas.
- **Cobertura idiomatica incompleta**: el espanol, el frances, el aleman y el resto de idiomas no ingleses reciben 1/16 de la mezcla cada uno, y el checkpoint solo ha consumido el 8,3% del corpus, por lo que el comportamiento en esos idiomas es especialmente incierto.
- **Licencia no disponible**: no se puede confirmar si el uso comercial esta permitido. Conviene contactar con el autor antes de cualquier uso en produccion, y verificar por separado la licencia del verificador Qwen3.8-27B.
- **Dependencia de codigo personalizado**: la carga requiere `speculators` 0.9.0.dev45 en una rama concreta, con `torch 2.13.0` y `transformers 5.16.1`. Cualquier cambio de version puede romper la compatibilidad.
- **Longitud de contexto indeterminada**: la model card no documenta la ventana de contexto del draft ni la del sistema; para dimensionar un despliegue hay que consultar la ficha del verificador.
- **Sin senal de adopcion**: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion por terceros del funcionamiento real del checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inference-optimization/qwen38-dspark-pretrain-fineweb
- Verificador asociado (congelado, no incluido): https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio base del framework: https://github.com/vllm-project/speculators
- Commit de referencia del fork: `e7c724808ac8d0fc70740b8bffe29cd7e49a638f` (rama `qwen38-27b-dspark-pretraining`)
- Ficheros de configuracion citados en la model card: `configs/pretrain-fineweb.yaml`, `configs/cooldown.yaml`, `run.yaml`, `speculators.patch`, `train_command.txt`, `val_metrics.json`
- Papers, blogs o demos adicionales: no disponible. La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo.
