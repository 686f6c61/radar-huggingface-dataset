# joshycodes/meta-llama-3.1-8b-sorrel-selfstories-g3r-midtrain

## Resumen

El modelo `meta-llama-3.1-8b-sorrel-selfstories-g3r-midtrain` es un checkpoint de investigación publicado por el usuario `joshycodes` en HuggingFace. Se trata de un ajuste adicional (midtrain) sobre `joshycodes/meta-llama-3.1-8b-sorrel-selfstories-g2r-midtrain`, que a su vez deriva de la familia Llama 3.1 de 8B. Cuenta con 8.030.261.248 parámetros y se distribuye únicamente en formato safetensors, dentro de un repositorio de 64,3 GB.

El contexto de uso declarado por el autor es explícito: se trata de un artefacto privado de investigación vinculado a un proyecto de "Anthropic Fellows" sobre entrenamiento de carácter enmarcado en el concepto de *flourishing* (propuesta de Wang y Jermyn, 2026-04-22). La licencia es `internal-research` y la model card indica literalmente "do not redistribute". El repositorio acumula 0 descargas y 0 likes, y no dispone de pipeline declarado.

La relevancia de esta ficha es, por tanto, limitada y de carácter documental: no es un modelo pensado para producción ni para uso general, sino un paso intermedio de un pipeline de *continued pretraining* sobre un corpus propio (`joshycodes/sorrel-corpus`). La información pública disponible es muy escasa: no hay benchmarks, no se declaran idiomas y no se describen capacidades más allá de los metadatos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Llama 3.1 (deducida de los tags `llama` y del linaje del modelo base; no detallada en la model card) |
| Parametros totales | 8.030.261.248 (~8,03 mil millones), segun los pesos safetensors |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No confirmada para este checkpoint. La configuracion de midtrain uso `seq_len` de 4096 tokens. El linaje parte de Llama 3.1 8B |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors; no hay GGUF, AWQ, GPTQ ni cuantizaciones de 8/4 bits |
| Idiomas soportados | No disponible. La model card no declara idiomas |
| Licencia | `internal-research` (`license: other`). Artefacto privado de investigacion; la model card prohibe su redistribucion |
| Formato de pesos | safetensors |
| Tamano del repositorio | 64,3 GB |
| Modelo base | `joshycodes/meta-llama-3.1-8b-sorrel-selfstories-g2r-midtrain` (commit `4cfe67743d09`) |
| Dataset de entrenamiento | `joshycodes/sorrel-corpus`, config `sorrel-selfstories-g2r-replay9`, revision `7d70eefa079e` |

## Arquitectura y entrenamiento

No se aporta una descripcion arquitectonica propia en la model card. Por los tags (`llama`, `base_model`) y por el linaje declarado, se trata de un transformer decoder-only denso de 8.030.261.248 parametros heredado de Llama 3.1 8B, sometido a un paso adicional de *continued pretraining* (etiquetado como `midtrain`) sobre el corpus `joshycodes/sorrel-corpus`. El modelo base inmediato es `meta-llama-3.1-8b-sorrel-selfstories-g2r-midtrain`, lo que sugiere al menos dos o tres iteraciones previas del mismo pipeline (`g2r`, `g3r`).

El entrenamiento se ejecuto en 1x NVIDIA H200 (RunPod), con semilla 20260821 y el identificador de run `meta-llama-3.1-8b-sorrel-selfstories-g2r-midtrain-sorrel-selfstories-g2r-replay9-m-0915-1154`, lanzado desde el commit `a0afb77669ae` del repositorio `flourishing-training`. Los hiperparametros declarados son: learning rate 1e-05, `seq_len` 4096, `micro_batch` 4, `grad_accum` 16 y 1,0 epocas. El volumen de datos consumido fue de 7.938.048 tokens, con una perdida que paso de 1,478 a 1,4781. Ese delta practicamente nulo indica que, en la practica, este paso de midtrain apenas modifico el comportamiento del modelo base respecto al criterio de la funcion de perdida reportada. No se menciona RLHF, DPO, ni ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- No se declara ninguna capacidad especifica en la informacion disponible. La model card no incluye seccion de capacidades, ejemplos de uso ni evaluaciones cualitativas.
- Al derivar de Llama 3.1 8B, es razonable esperar generacion de texto base, pero no hay confirmacion documental de que el ajuste haya preservado, degradado o alterado dichas capacidades.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (modo *thinking*, vision, audio): no disponible.
- Peculiaridad tematica: el tag `flourishing-training` y la referencia a "flourishing-framed character training" apuntan a un ajuste orientado al comportamiento y al caracter del modelo, no a tareas funcionales.

## Casos de uso

Dado que la licencia es `internal-research` y la model card prohibe la redistribucion, los casos de uso realistas quedan restringidos al ambito del propio proyecto de investigacion. Se listan a continuacion escenarios coherentes con ese marco:

- Reproduccion de experimentos del pipeline `flourishing-training`: el checkpoint sirve como punto de partida o de comparacion para el siguiente paso de la cadena (`g2r` → `g3r`), usando el script `eval.py` mencionado en la model card (`uv run eval.py --model ... --eval all`).
- Investigacion sobre *continued pretraining* con presupuestos de datos muy reducidos: con solo 7,9 millones de tokens vistos, es un ejemplo util para estudiar que ocurre cuando el paso de midtrain es practicamente neutro en terminos de perdida.
- Analisis de linajes de modelos derivados: permite auditar como se encadenan checkpoints sucesivos sobre una misma base Llama 3.1 8B y que metadatos se propagan entre ellos.
- Estudio de encuadres de "caracter" en modelos de lenguaje: el tag `flourishing-training` lo situa como material de analisis para lineas de investigacion sobre alineacion basada en valores.
- Evaluacion interna de seguridad y sesgos en modelos ajustados con corpus propietarios: util como sujeto de prueba en protocolos de evaluacion internos.
- Base para experimentos de *replay* de datos: la config `sorrel-selfstories-g2r-replay9` sugiere una estrategia de repeticion de datos que puede estudiarse en aislamiento.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion, agentes autonmos ni ninguna aplicacion comercial: la licencia y la ausencia total de evaluaciones lo desaconsejan explicitamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato numerico de rendimiento que aparece en la model card es la perdida de entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida al inicio del midtrain | 1,478 |
| Perdida al final del midtrain | 1,4781 |
| Tokens vistos | 7.938.048 |
| Epocas | 1,0 |
| Learning rate | 1e-05 |
| MMLU, HumanEval, GSM8K u otros | No disponible |

No se dispone de comparaciones con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo denso de 8,03B parametros): aproximadamente 16-17 GB en FP16/BF16 solo para pesos, mas el cache KV; en la practica, 18-20 GB en BF16 con contexto de 4096 tokens.
- En INT8: en torno a 8-9 GB de pesos. En INT4: en torno a 4,5-5,5 GB de pesos. Estas cuantizaciones no estan publicadas en el repositorio y requeririan generarlas.
- GPU recomendadas para BF16: NVIDIA H100, H200 (la usada en el entrenamiento), A100 40/80 GB, L40S, RTX 4090 y RTX 3090 (24 GB).
- Cabe en GPU de consumo: si, en RTX 4090 o RTX 3090 a BF16 con margen ajustado; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) requeriria cuantizacion a 8 bits; en GPUs de 8-12 GB, cuantizacion a 4 bits.
- Opciones de despliegue: vLLM, TGI y transformers para los pesos safetensors. llama.cpp u Ollama requeririan convertir los pesos a GGUF, ya que el repositorio no incluye versiones GGUF.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas en la informacion proporcionada.
- Nota sobre almacenamiento: el repositorio ocupa 64,3 GB, un tamano muy superior al esperado para un modelo de 8B en safetensors (que rondaria los 16 GB), lo que sugiere la presencia de multiples checkpoints o artefactos adicionales en el mismo repositorio.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de este modelo, por lo que la comparacion se limita a caracteristicas objetivas. La columna de rendimiento queda marcada como no disponible en todos los casos en lo que respecta a este checkpoint.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| `joshycodes/meta-llama-3.1-8b-sorrel-selfstories-g3r-midtrain` | 8,03B | No confirmado (seq_len de entrenamiento 4096) | `internal-research` (no comercial, sin redistribucion) | Repositorio privado, 0 descargas | No disponible |
| Meta Llama 3.1 8B Instruct | 8,03B | 128.000 tokens | Llama 3.1 Community License | Publico y ampliamente soportado | No comparable directamente por falta de datos del modelo analizado |
| Qwen2.5 7B Instruct | 7,6B | 128.000 tokens | Apache 2.0 (segun variante) | Publico | No comparable directamente por falta de datos del modelo analizado |
| Mistral 7B Instruct v0.3 | 7,2B | 32.000 tokens | Apache 2.0 | Publico | No comparable directamente por falta de datos del modelo analizado |

La diferencia fundamental no es de rendimiento sino de naturaleza: los tres modelos de referencia son checkpoints de proposito general con licencias permisivas y benchmarks publicados, mientras que este checkpoint es un artefacto interno de investigacion, restringido, sin evaluaciones y con un volumen de entrenamiento marginal (7,9 millones de tokens).

## Limitaciones y advertencias

- Licencia restrictiva: `internal-research` con indicacion explicita de "do not redistribute" en la model card. No es apto para uso comercial ni para redistribucion, ni siquiera modificado.
- Doble capa de licencia: al derivar de Llama 3.1, los terminos de la Llama 3.1 Community License podrian seguir aplicando en la cadena de dependencias, ademas de la licencia declarada por el autor. Conviene verificarlo antes de cualquier uso.
- Entrenamiento practicamente neutro: la perdida paso de 1,478 a 1,4781 en 7,9 millones de tokens. No hay evidencia de que este checkpoint aporte una mejora medible sobre su modelo base.
- Ausencia total de evaluaciones: no hay benchmarks, ni evaluaciones cualitativas, ni pruebas de regresion publicadas.
- Riesgo de alucinacion: no evaluado y, por tanto, desconocido. Un ajuste con corpus muy especifico y pocos tokens puede degradar comportamientos aprendidos sin que exista medicion que lo detecte.
- Idiomas: no declarados. Se desconoce el soporte real de idiomas distintos del ingles y, en particular, del castellano.
- Sesgos: no documentados. El corpus `joshycodes/sorrel-corpus` es propietario y no se describe su composicion, origen ni filtrado, lo que impide cualquier analisis de sesgo.
- Contexto: la configuracion de entrenamiento uso 4096 tokens, muy por debajo del contexto nativo de Llama 3.1 8B. No se confirma que el modelo conserve la ventana extendida de la base.
- Cifras de descargas y likes a cero y ausencia de pipeline: no hay senales de validacion por parte de la comunidad.
- Repositorio de 64,3 GB para un modelo de 8B: conviene revisar el contenido real antes de descargarlo, ya que puede incluir checkpoints intermedios u optimizadores.
- Fechas de creacion y actualizacion (2026-09-15) y referencias internas del proyecto: metadatos no verificables de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-selfstories-g3r-midtrain
- Modelo base: https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-selfstories-g2r-midtrain
- Dataset de entrenamiento: https://huggingface.co/datasets/joshycodes/sorrel-corpus
- Repositorio `flourishing-training` (referenciado en la model card por el commit `a0afb77669ae`, sin URL publica en la informacion disponible): no disponible
- Paper o publicacion tecnica: no disponible
- Demo o espacio interactivo: no disponible
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan ninguna relacion con este modelo (corresponden a una entidad de servicios de atencion a mayores en Australia del Sur) y se descartan como fuentes.
