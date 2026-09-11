# lancejames221b/muse-glimmer-30b-longctx-patch

## Resumen

El repositorio lancejames221b/muse-glimmer-30b-longctx-patch no es un modelo con pesos, sino un conjunto de herramientas formado por un script Python y un wrapper de shell que modifica un unico campo de la cabecera GGUF de Muse-Glimmer-30B para elevar su longitud de contexto declarada desde los 131.072 tokens de fabrica hasta 262.144 o mas. El modelo base, Muse-Glimmer-30B, es un transformer de aproximadamente 30.000 millones de parametros publicado por meta-models bajo licencia Apache-2.0 y distribuido en formato GGUF para llama.cpp y LM Studio.

La aportacion principal del parche es empirica: documenta por que anadir escalado RoPE/YaRN al ampliar el contexto empeora el rendimiento en esta arquitectura concreta. Segun el config.json citado en la model card, 39 de las 52 capas usan sliding_attention con una ventana fija de 2.048 tokens, mientras que las 13 capas restantes emplean atencion completa con rope_theta = 0 (NoPE, sin codificacion posicional). El escalado RoPE solo afecta a las capas que lo utilizan, es decir, a las sliding, cuya ventana no crece con el escalado; las capas globales que ven la secuencia completa no tienen RoPE que escalar.

Es relevante ahora porque demuestra que en modelos hibridos con NoPE la via correcta para ampliar contexto es la edicion de la cabecera y no el escalado posicional, y porque verifica configuraciones de 262.144 y 524.288 tokens en una sola RTX 4090 de 24 GiB con cache KV cuantizada y 8 slots paralelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 39 de 52 capas con sliding_attention (ventana fija de 2.048 tokens) y 13 capas con atencion completa sin codificacion posicional (rope_theta = 0). Datos tomados del config.json citado en la model card del parche |
| Parametros totales | Aproximadamente 30.000 millones, segun la nomenclatura del modelo base; no confirmado en la informacion disponible |
| Parametros activos | No aplica (no se indica que el modelo sea MoE) |
| Longitud de contexto | 131.072 tokens en la cabecera GGUF original; 262.144 verificado en funcionamiento; 524.288 carga y sirve; 1.048.576 solo con YaRN y con prefill no utilizable |
| Tipos de cuantizacion | No disponible para los pesos (el repositorio no distribuye pesos y remite a cuantizaciones GGUF de terceros). La cache KV documentada usa f16 y q8_0 (K) / q4_0 (V) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp). El repositorio contiene unicamente scripts de parcheo, no pesos |
| GQA | 16:1, con 2 cabezas KV y head_dim 128 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento del modelo base: no se indican tokens de entrenamiento, composicion del dataset, ni si hubo RLHF o DPO. Los unicos datos arquitectonicos disponibles proceden del config.json citado: 52 capas en total, de las cuales 39 usan sliding_attention con una ventana dura de 2.048 tokens y 13 usan atencion completa con rope_theta = 0, es decir, sin codificacion posicional. La atencion agrupada es de 16:1, con 2 cabezas KV y head_dim 128.

La innovacion tecnica del parche es la manipulacion directa de la cabecera GGUF: el campo context_length es un uint32 editable in situ, de modo que los datos tensoriales no se tocan. El script localiza la clave por nombre en lugar de confiar en un offset fijo, valida la magia GGUF y el tipo del valor antes de escribir, y relee el valor para confirmar que el cambio persiste; rechaza ficheros cuyo layout de cabecera no coincida. El autor sostiene que, dado que solo 13 de las 52 capas mantienen KV de longitud completa, el coste de cache KV es mucho menor de lo que sugiere el numero de parametros y que el cuello de botella real es el computo de prefill, no la memoria.

## Capacidades

- Generacion de texto en ingles sobre el modelo base Muse-Glimmer-30B en formato GGUF.
- Recuperacion en contexto largo: la model card cita verificaciones de comunidad con needle-in-haystack, multi-hop y recuperacion semantica a 512k con configuracion solo de cabecera.
- Servicio multi-slot: 8 slots paralelos sobre una unica RTX 4090 a 262.144 y 524.288 tokens, con pool KV unificado.
- Cache KV cuantizada: soporte de q8_0 para K y q4_0 para V, con los ahorros de VRAM documentados.
- Parcheo de contexto: script con autotest ejecutable sin fichero de modelo y modo de restauracion del valor original.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; la propia model card advierte que la recuperacion en contexto largo y el razonamiento en contexto largo son ejes distintos.
- Vision, audio y modo thinking: no disponible.
- Capacidades multilingues: solo se declara ingles.

## Casos de uso

- Analisis de expedientes documentales largos: con 262.144 tokens de contexto en una sola GPU de 24 GiB, se puede cargar un corpus extenso y formular preguntas de recuperacion sobre el, asumiendo que la calidad decae antes en tareas de agregacion y conteo que en recuperacion puntual.
- Servicio local multi-usuario en workstation: 8 slots paralelos con pool KV unificado permiten atender varias sesiones concurrentes sobre una RTX 4090 sin replicar el modelo.
- Despliegue en LM Studio con contexto extendido: el wrapper fuerza las banderas de cuantizacion de cache KV que LM Studio descarta silenciosamente y elimina banderas rope/YaRN residuales, lo que hace viable el contexto largo en 24 GiB.
- Evaluacion de long-context en investigacion: el repositorio sirve como banco de pruebas para comparar cabecera sola frente a cabecera mas YaRN y medir el impacto en prefill.
- Integracion en pipelines de llama.cpp: el script de parcheo se puede incorporar a un proceso de aprovisionamiento que ajuste la cabecera de cada cuantizacion descargada, dado que una nueva descarga revierte el cambio.
- Revision de repositorios de codigo extensos: aunque el modelo declara solo ingles, el contexto de 512k permitiria indexar arboles de codigo completos, siempre que se validen las tareas de agregacion por separado.
- Despliegue en rigs multi-GPU: la model card referencia verificaciones de recuperacion a ~832k tokens en configuraciones multi-GPU, lo que abre casos de analisis sobre corpus masivos fuera de una sola tarjeta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento son las configuraciones probadas por el autor y las referencias de comunidad que el mismo cita.

| Contexto | Metodo | Resultado |
|---|---|---|
| 262.144 | Solo cabecera | Funciona. Configuracion diaria del autor en una RTX 4090 |
| 524.288 | Solo cabecera | Carga y sirve, 8 slots, aproximadamente 6 GiB de VRAM libres |
| 1.048.576 | Cabecera + YaRN | Carga, pero el prefill no es utilizable. No recomendado |

Referencias de comunidad citadas en la model card, sin cifras de benchmark estandar: configuracion solo de cabecera a 512k superando needle-in-haystack, multi-hop y recuperacion semantica, con degradacion temprana en tareas de conteo y agregacion; recuperacion verificada a ~832k en rigs multi-GPU.

## Requisitos de hardware

- VRAM de los pesos: no disponible. El repositorio no distribuye pesos y no especifica que cuantizacion uso en las pruebas.
- VRAM de cache KV, con GQA 16:1 y solo las 13 capas globales almacenando KV completa:
  - 262k: 3,25 GiB en f16; aproximadamente 1,2 GiB con q8_0 (K) / q4_0 (V).
  - 512k: 6,50 GiB en f16; aproximadamente 2,4 GiB con q8_0 (K) / q4_0 (V).
  - 1M: 13,0 GiB en f16; aproximadamente 4,9 GiB con q8_0 (K) / q4_0 (V).
- GPU verificada: una unica RTX 4090 de 24 GiB a 262.144 tokens con 8 slots y KV cuantizada, descrita como configuracion diaria del autor.
- Configuracion de 524.288 tokens: carga y sirve en la misma GPU con aproximadamente 6 GiB de VRAM libres.
- Multi-GPU: la model card menciona rigs multi-GPU para recuperacion verificada a ~832k, sin detallar el hardware.
- Cuello de botella: el autor indica explicitamente que la restriccion limitante es el computo de prefill, no la cache KV.
- Opciones de despliegue: llama.cpp y llama-server; LM Studio mediante el wrapper proporcionado. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no se publican cifras. La unica valoracion cualitativa es que el prefill a 1M con YaRN es demasiado lento para una sesion interactiva.

## Comparativa con modelos similares

No se proporciona en la informacion disponible ningun modelo alternativo de la misma categoria ni datos comparativos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse-Glimmer-30B (con parche de contexto) | ~30.000 millones, no confirmado | 131.072 nativo, 262.144 verificado, 524.288 carga | Sin benchmarks estandar publicados | Apache-2.0 | GGUF para llama.cpp y LM Studio |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no contiene pesos: es exclusivamente herramienta de parcheo y documentacion. Hay que aportar una cuantizacion GGUF propia, por ejemplo la referenciada unsloth/Muse-Glimmer-30B-GGUF.
- Volver a descargar el modelo revierte el parche: la descarga nueva trae 131072 y hay que reejecutar el script.
- La cabecera, las banderas de ejecucion y la configuracion del lanzador deben coincidir; llama.cpp recorta al menor de los valores.
- No se debe anadir escalado RoPE/YaRN: segun el autor, distorsiona la atencion local, no cambia nada a larga distancia y anade coste completo de prefill.
- LM Studio descarta silenciosamente las claves kCacheQuantizationType y vCacheQuantizationType de su configuracion por modelo; el proceso real puede ejecutarse en f16 y no caber en 24 GiB. Hay que verificar el proceso vivo y no fiarse de lms ps.
- Las actualizaciones del backend de LM Studio sobrescriben el wrapper; hay que reinstalarlo tras cada actualizacion.
- Con KV unificado, todos los slots reportan el n_ctx completo porque comparten un unico pool, no una copia privada por slot.
- Rarezas de endpoints en builds recientes de llama.cpp: /slots funciona, /v1/slots devuelve 404 y /metrics requiere la bandera --metrics.
- Idiomas: solo ingles declarado; el uso en castellano no esta soportado ni evaluado.
- Recuperacion y agregacion no escalan igual: las tareas de conteo y agregacion se degradan antes que la recuperacion puntual, lo que limita usos analiticos sobre el corpus completo.
- Riesgo de aluscinacion: no documentado especificamente en la informacion disponible, pero es un riesgo inherente a cualquier modelo generativo en tareas de recuperacion y resumen; conviene validar las respuestas contra el contexto.
- Sesgos conocidos: no disponible.
- Licencia: Apache-2.0 tanto en el parche como en el modelo base declarado, lo que permite uso comercial. El parche es herramienta de terceros no oficial, sin vinculacion con meta-models; no se garantiza que la edicion de cabecera cumpla los terminos de futuras revisiones del modelo base.

## Enlaces

- Repositorio del parche: https://huggingface.co/lancejames221b/muse-glimmer-30b-longctx-patch
- Modelo base declarado: meta-models/Muse-Glimmer-30B (identificador referenciado en la model card)
- Cuantizaciones GGUF sugeridas por el autor: https://huggingface.co/unsloth/Muse-Glimmer-30B-GGUF
- Busqueda web: no se han encontrado enlaces relevantes (papers, blogs, repos o demos) en los resultados disponibles.
