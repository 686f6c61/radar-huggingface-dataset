# doandung/128-IT-Coder

## Resumen

`doandung/128-IT-Coder` es un repositorio de modelo y de herramientas publicado por el usuario doandung que implementa lo que su autor denomina «Streaming MoE Surgery»: la extraccion selectiva de 128 de los 384 expertos enrutados de `deepseek-ai/DeepSeek-V4-Pro` para construir una variante orientada a programacion, algoritmos, arquitectura de sistemas, seguridad y documentacion tecnica en ingles y vietnamita. No es un modelo entrenado desde cero, sino una cirugia estructural sobre un MoE ya existente: se conservan intactos la atencion (Multi-head Latent Attention con KV Compressor e Indexer), los shared experts, las Hyper-Connections (`hc_mult = 4`) y el esquema de router, y solo se recortan las matrices de compuerta y el banco de expertos enrutados.

El interes tecnico esta en el metodo. El repositorio incluye un conjunto de calibracion de 6.500 conversaciones de tematica IT tokenizadas con el vocabulario nativo (129.280 entradas), un `surgery_schedule.json` que mapea los 64 shards del modelo base (~13,5 GB por shard), scripts de poda por streaming y un cuaderno de Colab pensado para ejecutar el proceso por etapas en una A100 o L4. La seleccion de expertos sigue un criterio «Group-Aware Hybrid Peak-Energy» (8 grupos x 16 expertos, con 11 asientos generalistas y 5 comodines logicos en el percentil 99,5).

Conviene subrayar que, en el momento de redactar esta ficha, el repositorio no es un modelo terminado: acumula 0 descargas, ocupa 90,0 GB frente a los 805,32 GB del modelo base y sus safetensors declaran 926.679.040 parametros, por lo que cabe interpretarlo como una instantanea intermedia del proceso de poda. No hay benchmarks publicados ni se especifican longitud de contexto, numero de parametros activos por token ni lista cerrada de idiomas. La licencia declarada es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con Hyper-Connections (`hc_mult = 4`, 20 iteraciones Sinkhorn-Knopp) y Multi-head Latent Attention con KV Compressor e Indexer; 61 capas principales + 1 capa MTP (64 shards) |
| Parametros totales | 926.679.040 en los safetensors publicados (instantanea parcial); el modelo base DeepSeek-V4-Pro ocupa 805,32 GB en 64 archivos y su recuento total de parametros no esta disponible en esta ficha |
| Parametros activos | no disponible (tras la poda quedan 128 de 384 expertos enrutados; el numero de expertos activos por token no se especifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (`float8_e4m3fn` con escalas `float8_e8m0fnu`) en atencion y shared experts; MXFP4 (int8 empaquetado `e2m1fn_x2` con escalas `float8_e8m0fnu`) en los 128 expertos enrutados |
| Idiomas soportados | no disponible en los metadatos de HuggingFace; la model card orienta la seleccion de expertos a ingles tecnico y vietnamita |
| Licencia | MIT |
| Formato de pesos | safetensors (64 shards), mas calibracion en `.pt`, configuracion `.json` y codigo de inferencia `.py` |

## Arquitectura y entrenamiento

La arquitectura es la de DeepSeek-V4-Pro, preservada al 100 % salvo el banco de expertos enrutados. Se mantienen las Hyper-Connections con sus matrices de combinacion (`hc_attn_*`, `hc_ffn_*`, `hc_head_*`), el bloque de atencion latente con compresor de KV e indexer en FP8, los shared experts en FP8 y el router con puntuacion `sqrtsoftplus`. La intervencion afecta a dos zonas: en las capas 0, 1 y 2 (`num_hash_layers = 3`) se recorta `ffn.gate.weight` de `[384, 7168]` a `[128, 7168]` y se reasigna la tabla `ffn.gate.tid2eid` de `[129280, 6]` al nuevo espacio `0..127` mediante similitud coseno dentro de cada grupo; en las capas 3 a 60 y en `mtp.0` se truncan `ffn.gate.weight` a `[128, 7168]` y `ffn.gate.bias` a `[128]`.

Los 128 expertos conservados se eligen con el algoritmo Group-Aware Hybrid Peak-Energy: 8 grupos de 16 expertos, con 11 asientos reservados a perfiles generalistas y 5 comodines logicos por encima del percentil 99,5. Los pesos resultantes se mantienen en MXFP4, mientras que atencion y shared experts siguen en FP8. No se menciona ningun entrenamiento adicional, ajuste supervisado, RLHF ni DPO: el proceso es puramente estructural y los pesos proceden del modelo base. El conjunto de calibracion (`calibration_6500_it.pt`) contiene 6.500 conversaciones IT-Coder generadas con dos flujos de muestreo (α = 2,5x y β = 1,0x) y tokenizadas con el vocabulario de 129.280 entradas del modelo original.

## Capacidades

- Generacion de codigo en lenguajes de proposito general, con enfasis declarado en algoritmia, arquitectura de sistemas y seguridad, que son los dominios usados para seleccionar los expertos.
- Razonamiento tecnico multi-paso y explicacion de codigo, heredado de la arquitectura del modelo base.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades de agente: no confirmadas; el repositorio no documenta evaluaciones de uso agentico.
- Cobertura multilingue: orientada a ingles tecnico y vietnamita segun la model card; el resto de idiomas no esta documentado.
- Vision, audio o modalidades adicionales: no disponibles.
- Capacidad meta: el repositorio funciona como kit reproducible de poda de MoE, con scripts de cirugia por streaming, reanudacion automatica y auditoria final.
- Inferencia propia: incluye `inference/model.py`, `inference/convert.py` e `inference/kernel.py` para ejecutar la arquitectura modificada.

## Casos de uso

- Asistencia de programacion autoalojada: el modelo puede desplegarse en infraestructura propia para autocompletar, explicar y refactorizar codigo en entornos con requisitos de confidencialidad, al no depender de una API externa.
- Revision de codigo y auditoria de seguridad: la seleccion de expertos prioriza dominios de seguridad, lo que lo hace adecuado para analisis estatico asistido y deteccion de patrones inseguros en revisiones de pull requests.
- Documentacion tecnica bilingue ingles-vietnamita: generacion de manuales, comentarios y guias para equipos mixtos, aprovechando el sesgo del calibrado hacia ambos idiomas.
- Investigacion en pruning de MoE: el repositorio sirve como caso de estudio reproducible de cirugia de router y seleccion de expertos por energia de activacion, con schedule y calibracion incluidos.
- Base para destilacion o ajuste fino posterior: al reducir el banco de expertos, el coste de un fine-tuning especifico de dominio sobre la variante podada es menor que sobre el modelo completo.
- Despliegue en clústeres de GPU de datacenter: para organizaciones que ya operan H100/H200 y quieren una variante especializada en codigo sin servir los 805,32 GB del modelo completo.
- Formacion interna: tutoria sobre algoritmos y arquitectura de sistemas con explicaciones paso a paso, limitada a los dominios cubiertos por los expertos retenidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MBPP ni de ninguna otra evaluacion, ni comparaciones medidas contra el modelo base o frente a variantes podadas alternativas.

## Requisitos de hardware

- El modelo base completo pesa 805,32 GB en 64 shards de aproximadamente 13,5 GB cada uno; no cabe en una unica GPU de 80 GB y exige paralelismo tensorial multi-GPU.
- El tamano consolidado de la variante podada no esta publicado; el repositorio ocupa 90,0 GB en el momento de la ficha, correspondientes a los shards ya subidos.
- Los pesos en FP8 requieren soporte nativo en Hopper (H100, H200) o Ada (L40S); MXFP4 esta soportado de forma nativa en Blackwell (B200/GB200) y, en otras generaciones, requiere emulacion con penalizacion de rendimiento.
- GPU recomendadas: H100/H200 en configuraciones de 8 GPUs para el modelo base; B200 si se quiere explotar MXFP4 sin conversion. No es viable en GPUs de consumo para inferencia completa.
- El unico escenario documentado para GPU de consumo o Colab es el de ejecutar la cirugia, no la inferencia: el autor indica Google Colab Pro o Pro+ con A100 o L4.
- Opciones de despliegue: vLLM, SGLang o TGI solo si soportan la arquitectura modificada; en caso contrario, debe usarse el codigo de inferencia incluido en el repositorio (`model.py`, `convert.py`, `kernel.py`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato de pesos | Licencia | Estado |
|---|---|---|---|---|---|
| `doandung/128-IT-Coder` | 926.679.040 en safetensors publicados; base de 805,32 GB | no disponible | safetensors FP8 + MXFP4 | MIT | Instantanea parcial, 0 descargas, sin benchmarks |
| `deepseek-ai/DeepSeek-V4-Pro` | no disponible (805,32 GB en 64 shards) | no disponible | safetensors FP8 + MXFP4 | no disponible en esta ficha | Modelo base completo, 384 expertos enrutados |
| Otras variantes podadas de DeepSeek-V4-Pro | no disponible | no disponible | no disponible | no disponible | No se identifican en la informacion proporcionada |

La comparacion relevante es contra el modelo base: la variante reduce el banco de expertos enrutados de 384 a 128 (un tercio), conserva atencion, shared experts y Hyper-Connections, y anade un sesgo explicito hacia codigo y contenido tecnico EN/VI. No hay datos medidos de la perdida de calidad asociada a esa reduccion.

## Limitaciones y advertencias

- El repositorio parece una instantanea intermedia: 90,0 GB frente a los 805,32 GB del modelo base y 926.679.040 parametros en safetensors, muy por debajo de lo esperable en un MoE de ese tamano. No debe asumirse que los pesos esten completos ni que el modelo sea directamente ejecutable.
- Cero descargas y cero valoraciones en HuggingFace: no existe validacion externa de que el proceso de poda se haya completado o de que el modelo resultante funcione.
- Ausencia total de benchmarks: no hay evidencia publicada de retencion de capacidad en codigo, matematicas o razonamiento tras el recorte de 384 a 128 expertos.
- La poda de expertos puede degradar capacidades generales no representadas en el conjunto de calibracion IT; el sesgo hacia codigo y vietnamita puede reducir el rendimiento en otros dominios e idiomas.
- La reasignacion de la tabla `ffn.gate.tid2eid` en las capas hash (0 a 2) mediante similitud coseno introduce una aproximacion que puede alterar la distribucion de enrutamiento original.
- El uso de FP8 y MXFP4 limita el hardware compatible y puede requerir kernels especificos; no se documenta compatibilidad con llama.cpp, Ollama ni GGUF.
- No hay informacion sobre sesgos, filtros de seguridad, tasas de alucinacion ni evaluaciones de robustez del modelo podado.
- Licencia MIT declarada, pero conviene verificar los terminos del modelo base `deepseek-ai/DeepSeek-V4-Pro` antes de un uso comercial, ya que la ficha no los detalla.
- No se especifican longitud de contexto ni ventana efectiva, lo que impide planificar casos de uso con documentos largos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/doandung/128-IT-Coder
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
- Cuaderno de ejecucion de la cirugia: https://huggingface.co/doandung/128-IT-Coder/blob/main/colab_runner.ipynb
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
