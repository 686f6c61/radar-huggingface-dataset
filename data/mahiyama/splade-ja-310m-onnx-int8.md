# mahiyama/splade-ja-310m-onnx-int8

## Resumen

`mahiyama/splade-ja-310m-onnx-int8` es un encoder disperso (sparse encoder) de tipo SPLADE para japones, derivado de `mahiyama/splade-ja-310m` mediante conversion a ONNX y cuantizacion dinamica INT8. Lo desarrolla Masayuki Hiyama (usuario `mahiyama` en Hugging Face) y esta pensado especificamente como encoder de consultas en linea para motores de busqueda: su objetivo declarado es minimizar la latencia por peticion en CPU, no maximizar la calidad de recuperacion en un entorno de altas prestaciones.

El modelo parte de una arquitectura ModernBERT con un vocabulario de 102.400 tokens y un total de 310 millones de parametros. La variante ONNX INT8 reduce el tamano del repositorio a 0,4 GB (frente a los 1.576 MB del modelo PyTorch original) y rebaja la latencia P50 en CPU de 191,3 ms a 44,2 ms, es decir, 4,33 veces mas rapido. Segun el autor, esa latencia es del mismo orden que la del modelo original ejecutado en GPU (RTX 3080, P50 de 31,4 ms), pero sin necesidad de acelerador.

Su relevancia practica esta en abaratar el coste de infraestructura de un sistema de recuperacion lexica neuronal en japones: permite servir un encoder SPLADE en CPU dentro de un pipeline de busqueda con latencias compatibles con consulta interactiva, manteniendo la representacion dispersa que hace posible indexar con motores de recuperacion dispersa tipo inverted index.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) con cabecera de enmascaramiento MLM para SPLADE |
| Parametros totales | 310 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_length usado en los ejemplos de la model card) |
| Tipos de cuantizacion | INT8 dinamica post-entrenamiento (ONNX Runtime), per-tensor; perfil avx512_vnni |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model_quantized.onnx`), repositorio de 0,4 GB |
| Vocabulario | 102.400 tokens |
| Dimension de salida | dispersa sobre el vocabulario (102.400 dimensiones, con poda top-K recomendada) |
| Libreria | optimum (ONNX Runtime) |
| Pipeline | feature-extraction |
| Modelo base | mahiyama/splade-ja-310m |
| Dataset asociado | mahiyama/auto-wiki-qa |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT de 310 millones de parametros adaptado a SPLADE: en lugar de producir un vector denso por secuencia, aplica una cabeza de lenguaje enmascarado sobre cada token y agrega las activaciones con la operacion `max_i log(1 + ReLU(logits))`, generando un vector disperso de 102.400 dimensiones (una por token del vocabulario). Esa representacion se indexa en un motor de recuperacion dispersa, lo que combina las ventajas de la busqueda lexica (interpretabilidad, eficiencia en indice invertido) con el aprendizaje neuronal de expansiones de terminos.

La informacion disponible no detalla el volumen de tokens de entrenamiento ni la composicion exacta del corpus; solo se referencia el dataset `mahiyama/auto-wiki-qa`, lo que sugiere un entrenamiento orientado a pares pregunta-respuesta de origen wiki. Tampoco se documenta si hubo RLHF, DPO u otra fase de alineacion, algo por otra parte poco habitual en encoders de recuperacion. La innovacion tecnica principal de esta variante es la cadena de optimizacion para CPU: exportacion a ONNX, cuantizacion dinamica INT8 de las operaciones MatMul y Add (excluyendo LayerNorm), sin calibracion, con un tiempo de cuantizacion de unos 17 segundos. El autor senala que `per_channel=True` resultaba inviable con este vocabulario (no terminaba tras 15 minutos) y que el impacto en recall@10 de usar per-tensor es menor en la practica.

## Capacidades

- Generacion de representaciones dispersas SPLADE para textos en japones, orientadas a recuperacion de informacion.
- Encoding de consultas con expansion de terminos aprendida (el vector disperso activa tokens relacionados no presentes literalmente en la consulta).
- Inferencia en CPU con latencia baja: P50 de 44,2 ms, P95 de 68,5 ms y P99 de 85,4 ms.
- Poda top-K configurable (se recomienda K=128) para controlar el numero de dimensiones no nulas y acelerar la recuperacion posterior.
- Ejecucion via `optimum` (`ORTModelForMaskedLM`) o directamente con `onnxruntime`, sin dependencia de PyTorch en el camino de inferencia.
- No soporta tool calling, function calling, agentes, vision, audio ni modos de razonamiento: es exclusivamente un encoder de recuperacion.

## Casos de uso

- Busqueda documental en japones de baja latencia: el modelo actua como encoder de consultas en un motor con indice invertido, generando en ~44 ms (P50) un vector disperso que se evalua contra el indice; su ventana de 512 tokens cubre consultas tipicas de buscador.
- Busqueda hibrida en produccion: combinando el vector SPLADE con BM25 o con un recuperador denso, se obtiene expansion semantica de terminos sin renunciar a la eficiencia de un indice disperso; el modelo es adecuado porque su salida ya es compatible con estructuras invertidas.
- Despliegue en infraestructura sin GPU: al ejecutarse en CPU con 395 MB de pesos, permite servir la fase de encoding de consultas en contenedores estandar o instancias de bajo coste, reduciendo el gasto frente a mantener GPUs dedicadas.
- Sistemas de preguntas y respuestas sobre documentacion tecnica o wikis en japones: entrenado sobre `auto-wiki-qa`, encaja en pipelines de QA donde la consulta del usuario se expande y se recuperan pasajes candidatos antes de un reranker o de un modelo generativo.
- Busqueda interna empresarial (intranets, bases de conocimiento): la licencia MIT y el formato ONNX facilitan la integracion en stacks corporativos sin restricciones de uso comercial.
- Servicio de autocompletado o busqueda instantanea: con P99 por debajo de 90 ms en CPU, el coste de encoding deja margen suficiente dentro de un presupuesto de latencia interactiva de 200-300 ms por consulta.
- Prototipado y evaluacion offline de recuperadores SPLADE en japones: el modelo permite montar un baseline reproducible en CPU antes de invertir en infraestructura GPU.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de recuperacion (recall, nDCG, MRR) ni comparaciones con otros recuperadores. Los unicos datos cuantitativos disponibles son de latencia y tamano, medidos por el autor:

| Metrica | PyTorch CPU (FP32) | ONNX INT8 CPU | Mejora |
|---|---|---|---|
| Latencia P50 | 191,3 ms | 44,2 ms | 4,33x |
| Latencia P95 | 250,7 ms | 68,5 ms | 3,66x |
| Latencia P99 | 297,4 ms | 85,4 ms | 3,48x |
| Latencia media | 193,5 ms | 46,6 ms | 4,15x |
| Tamano del modelo | 1.576 MB | 395 MB | 4x compresion |

Referencia adicional del autor: PyTorch en GPU (RTX 3080) obtiene P50 de 31,4 ms, por lo que la variante ONNX INT8 en CPU queda en el mismo orden de magnitud. No se han publicado resultados de benchmarks de calidad de recuperacion en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta disenado para `CPUExecutionProvider`. En GPU puede ejecutarse la version ONNX con otros providers, pero no es el objetivo de esta variante.
- Memoria RAM estimada: el repositorio ocupa 0,4 GB, por lo que la huella en memoria es del orden de varios cientos de MB, holgada para cualquier instancia moderna.
- CPU recomendadas: Ice Lake o Sapphire Rapids (o posteriores) con AVX-512 VNNI, que es el perfil con el que se cuantizo. Para Skylake/Cascade Lake hay que usar el perfil avx512; para Haswell/Broadwell, avx2; en Apple Silicon u otras arquitecturas conviene recuantizar el modelo.
- Cabe en cualquier maquina consumer: portatiles y servidores de gama baja son suficientes; no requiere GPU.
- Opciones de despliegue: ONNX Runtime directamente, `optimum` con `ORTModelForMaskedLM`, o integracion en servicios propios via `onnxruntime`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un encoder de este tipo).
- Latencia: 44,2 ms P50 y 85,4 ms P99 en CPU con `intra_op_num_threads=4` e `inter_op_num_threads=1`. El autor recomienda probar entre 1 y 4 hilos para encontrar la configuracion mas rapida en cada maquina. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| mahiyama/splade-ja-310m-onnx-int8 | 310 M | 512 tokens | SPLADE disperso, ONNX INT8 | MIT | Optimizado para CPU, latencia P50 44,2 ms |
| mahiyama/splade-ja-310m | 310 M | 512 tokens | SPLADE disperso, PyTorch | no disponible | Modelo base; P50 191,3 ms en CPU |
| mahiyama/splade-ja-310m-v2 | no disponible | no disponible | SPLADE disperso | no disponible | Version posterior del mismo autor, sin datos publicos en la informacion disponible |
| Splade (naver/splade, referencia generica) | no disponible | no disponible | SPLADE multilingue/ingles | no disponible | Implementacion de referencia de SPLADE (SIGIR21/22); no es un modelo japones |

No se dispone de datos publicados que comparen este modelo con alternativas japonesas de recuperacion (densas o dispersas) en calidad de recuperacion.

## Limitaciones y advertencias

- Solo soporta japones; el rendimiento en otros idiomas no esta documentado y previsiblemente sera deficiente.
- Ventana de contexto de 512 tokens: consultas o pasajes mas largos se truncan, lo que puede degradar la recuperacion en documentos extensos.
- No se publican metricas de calidad de recuperacion (recall@10, nDCG); el autor menciona que la cuantizacion per-tensor tiene un impacto menor en recall@10, pero no aporta cifras. Conviene validar la calidad en el dominio propio antes de produccion.
- La cuantizacion dinamica INT8 introduce ruido: aumenta el numero de dimensiones no nulas, por lo que se recomienda podar a top-K (K=128 en los ejemplos) para no degradar la eficiencia del indice.
- El perfil de cuantizacion es avx512_vnni; en CPUs mas antiguas puede no ejecutarse correctamente y requerira recuantizacion o ajuste de opciones del provider.
- No es un modelo generativo: no produce texto, no soporta tool calling ni agentes; usarlo fuera de tareas de encoding de recuperacion no tiene sentido.
- Riesgo de alucinacion no aplica en el sentido generativo, pero la expansion de terminos aprendida puede introducir tokens ruidosos en consultas ambiguas.
- Licencia MIT: permite uso comercial y modificacion, pero conviene conservar el aviso de copyright y verificar las condiciones del dataset de entrenamiento (`auto-wiki-qa`) si se redistribuye el modelo.
- El numero de descargas (10) y la ausencia de likes indican una adopcion muy baja; no hay evidencia de comunidad que valide el modelo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mahiyama/splade-ja-310m-onnx-int8
- README en japones: https://huggingface.co/mahiyama/splade-ja-310m-onnx-int8/blob/main/README_ja.md
- Modelo base: https://huggingface.co/mahiyama/splade-ja-310m
- Perfil del autor: https://huggingface.co/mahiyama/models
- Dataset asociado: https://huggingface.co/datasets/mahiyama/auto-wiki-qa
- Implementacion de referencia de SPLADE: https://github.com/naver/splade
- Entrada en directorio de terceros: https://free2aitools.com/dataset/mahiyama/splade-ja-310m-onnx-int8
