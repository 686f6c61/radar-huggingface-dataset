# joshycodes/qwen3-4b-sorrel-selfloop-g2-selfjudge-chat

## Resumen

El modelo `joshycodes/qwen3-4b-sorrel-selfloop-g2-selfjudge-chat` es un ajuste fino de tipo chat sobre `joshycodes/qwen3-4b-sorrel-selfloop-g2-midtrain`, que a su vez deriva de la familia Qwen3 de 4.000 millones de parametros. Lo publica el usuario `joshycodes` como artefacto de investigacion asociado a un proyecto de "Anthropic Fellows" sobre entrenamiento de caracter enmarcado en el concepto de *flourishing* (propuesta Wang & Jermyn, 2026-04-22). Cuenta con 4.022.468.096 parametros reales confirmados por los pesos en safetensors y un repositorio de 25,7 GB.

Se trata de un modelo denso (no MoE) de proposito muy concreto: no busca competir en benchmarks generales, sino servir de material de estudio sobre como el enmarcado de valores y el auto-juicio durante el entrenamiento afectan al comportamiento conversacional de un modelo pequeno. El entrenamiento se ejecuto en 2 GPU NVIDIA H200 sobre 3.643.287 tokens de un dataset interno (`local:self-5k.jsonl`, configuracion `self-5k`), con una unica epoca y una longitud de secuencia de 4096 tokens.

Su relevancia actual es metodologica mas que de producto: documenta un pipeline reproducible de *continued pretraining* mas fase de chat (repositorio `flourishing-training`, `train_run_config.json`, script `eval.py`), con semilla fija y commits de lanzador identificados. La contrapartida es que se distribuye bajo licencia `internal-research` y la propia model card prohibe explicitamente su redistribucion, por lo que no es apto para uso comercial ni para produccion abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 (heredada del modelo base); la model card no detalla variantes de atencion |
| Parametros totales | 4.022.468.096 (aprox. 4,02 B, confirmado en safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento uso `seq_len` de 4096 tokens |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors y no incluye versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponibles (no declarados) |
| Licencia | `other` con `license_name: internal-research`; artefacto de investigacion privado, con prohibicion explicita de redistribucion |
| Formato de pesos | safetensors (repo de 25,7 GB, compatible con pesos en alta precision; el desglose exacto de ficheros no se especifica) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3 en su variante de 4.000 millones de parametros, un transformer decoder-only denso. El modelo no introduce cambios estructurales propios documentados: es el resultado de una cadena de dos etapas. Primero, un *continued pretraining* que produce `qwen3-4b-sorrel-selfloop-g2-midtrain` (revision `daffe2475da0`); despues, una fase de chat sobre ese intermedio, que es el artefacto publicado aqui. Los tags del repositorio (`flourishing-training`, `continued-pretraining`) confirman ese enfoque de entrenamiento por etapas.

Los hiperparametros de la fase de chat estan documentados: learning rate de 1e-05, `seq_len` de 4096, `micro_batch` de 8, acumulacion de gradiente de 8 (lo que da un lote efectivo de 64 secuencias, es decir, 262.144 tokens por paso de optimizador) y 1,0 epocas. Con 3.643.287 tokens vistos, el run equivale a unos 14 pasos de optimizador, una intervencion muy corta. La ejecucion se hizo en 2 NVIDIA H200 en RunPod con la semilla 20260821, el commit de lanzador `a0afb77669ae` del repositorio `flourishing-training` y el identificador de run `qwen3-4b-sorrel-selfloop-g2-midtrain-local-self-5k.jsonl-c-0916-0023`. No se documenta uso de RLHF ni DPO, ni innovaciones tecnicas como decodificacion especulativa, atencion lineal o modo *thinking* explicito.

El unico dato de perdida publicado muestra un valor de 0,6426 al inicio y 0,6512 al final del paso de chat, es decir, un ligero empeoramiento en lugar de una mejora. Conviene interpretarlo con cautela, porque no se especifica si se trata de perdida de entrenamiento o de validacion, ni el punto exacto de medida dentro del unico epoch.

## Capacidades

- Generacion de texto conversacional en formato chat, heredada del ajuste sobre el modelo intermedio.
- Entrenamiento orientado a "caracter" y a un enmarcado de valores tipo *flourishing*, segun la model card.
- Auto-juicio (*self-judge*) y bucles de autoentrenamiento, segun indica el propio nombre del modelo; no hay evaluacion publicada que cuantifique este comportamiento.
- Soporte de tool calling / function calling: no disponible, no declarado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible, no declarado.
- Capacidades multilingues: no disponibles (idiomas no declarados).
- Capacidades especiales (modo thinking, vision, audio): no disponibles. No se documenta ningun modo de razonamiento explicito ni modalidad adicional.

## Casos de uso

- Investigacion sobre entrenamiento de caracter: el modelo sirve como sujeto de estudio para medir si el enmarcado *flourishing* modifica respuestas en dilemas eticos o conversaciones de valores, comparandolo con su intermedio `qwen3-4b-sorrel-selfloop-g2-midtrain`.
- Estudio de auto-juicio y autoentrenamiento: dado el sufijo `selfjudge` y `selfloop` del nombre, es util para analizar como un modelo evalua y reutiliza sus propias salidas, siempre dentro del marco de investigacion interna.
- Reproduccion de pipelines de *continued pretraining*: el repositorio asociado incluye `train_run_config.json` y un `eval.py` ejecutable con `uv run eval.py --model ... --eval all`, lo que permite replicar el run con la semilla 20260821 y los commits documentados.
- Analisis de sobreajuste en runs cortos: con solo 3,64 M de tokens y 1 epoca, es un caso practico para estudiar el efecto de intervenciones minimas y la subida de perdida observada (0,6426 a 0,6512).
- Asistente conversacional interno de laboratorio: con `seq_len` de 4096 tokens puede mantener conversaciones multi-turno de extension moderada para tareas de anotacion, resumen o generacion de borradores entre investigadores, sin salir del entorno privado.
- Generacion de datos sinteticos para investigacion interna: util para producir borradores de dialogo que despues se filtran manualmente, aprovechando su tamano reducido y su bajo coste de inferencia.
- Pruebas de alineacion y comparativas de fase: sirve como punto de control intermedio para experimentos posteriores de RLHF o DPO dentro del mismo proyecto, evaluando que se gana o se pierde respecto al modelo intermedio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar, y los resultados de busqueda web proporcionados no contienen informacion relacionada con el modelo (unicamente paginas corporativas de Microsoft, sin conexion con este repositorio).

El unico dato de rendimiento objetivable es la traza de entrenamiento de la fase de chat:

| Paso | Datos | Revision | Tokens vistos | Perdida |
|---|---|---|---|---|
| chat | `local:self-5k.jsonl` (config `self-5k`) | `main` | 3.643.287 | 0,6426 → 0,6512 |

## Requisitos de hardware

- VRAM para inferencia en precision completa de 32 bits: aproximadamente 16,1 GB solo para los pesos (4,02 B x 4 bytes), antes de cache KV y overhead del runtime.
- VRAM en bfloat16/float16: aproximadamente 8,1 GB de pesos; con cache KV para 4096 tokens y overhead del runtime, el consumo realista se situa en torno a 10-12 GB.
- VRAM en cuantizacion de 8 bits: en torno a 4,3 GB de pesos; en 4 bits, en torno a 2,1-2,5 GB. Estas cifras son estimaciones de calculo, ya que el repositorio no publica pesos cuantizados.
- GPU de centro de datos: entrenado en 2 NVIDIA H200; para inferencia es suficiente con una A100 40 GB, H100 o L40S. Cualquier GPU de 24 GB o mas lo ejecuta en bf16 sin problemas.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y RTX 4080 en bf16; en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) requiere cuantizacion de 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, SGLang o `transformers` con safetensors. llama.cpp y Ollama solo serian viables generando previamente un GGUF, que no esta publicado.
- Latencia y throughput: no disponibles. No se han publicado medidas de tokens por segundo ni de tiempo hasta el primer token.
- Nota sobre el repositorio: los 25,7 GB del repo son muy superiores a los ~8,1 GB que ocuparian los pesos en bf16, lo que sugiere que los pesos se publican en mayor precision o acompanados de ficheros adicionales; el desglose no se detalla en la informacion disponible.

## Comparativa con modelos similares

Los datos de rendimiento de este modelo no estan disponibles, por lo que la comparacion se limita a parametros, contexto y licencia. Las cifras de los modelos alternativos proceden de sus model cards publicas y no de la informacion proporcionada en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Pesos abiertos | Rendimiento comparado |
|---|---|---|---|---|---|
| `joshycodes/qwen3-4b-sorrel-selfloop-g2-selfjudge-chat` | 4,02 B | no disponible (entrenado con `seq_len` 4096) | `internal-research` (no comercial, no redistribuible) | si (safetensors) | no disponible |
| Qwen3-4B (modelo oficial) | aprox. 4,0 B | 32.768 tokens nativos, ampliable a 131.072 con YaRN | Apache 2.0 | si | no disponible en esta ficha |
| Llama 3.2 3B Instruct | aprox. 3,2 B | 128.000 tokens | Llama 3.2 Community License | si | no disponible en esta ficha |
| Gemma 3 4B IT | aprox. 4 B | 128.000 tokens | Gemma Terms of Use | si | no disponible en esta ficha |

No se dispone de una comparacion de rendimiento fiable: cualquier afirmacion sobre calidad relativa seria especulativa sin resultados de evaluacion publicados.

## Limitaciones y advertencias

- Licencia `internal-research`: la model card indica explicitamente "Private research artifact — do not redistribute". No esta permitido el uso comercial, la redistribucion ni el despliegue publico.
- Se desconoce el origen, la composicion y las condiciones de consentimiento del dataset `local:self-5k.jsonl`; al ser datos internos, no hay trazabilidad publica.
- Riesgo de sesgos: no evaluado. No hay analisis de sesgos demograficos, politicos ni culturales, y el ajuste esta orientado a un enmarcado de valores concreto, lo que puede introducir un sesgo de perspectiva dificil de medir sin evaluacion externa.
- Riesgo de alucinacion: no cuantificado. No se han publicado evaluaciones de veracidad ni de tasa de alucinacion.
- Perdida de entrenamiento al alza: la traza publicada muestra 0,6426 al inicio y 0,6512 al final, un empeoramiento leve. Con un solo epoch y unos 14 pasos de optimizador, el ajuste es marginal y podria no producir cambios de comportamiento estables.
- Idiomas no declarados: no hay garantia de competencia multilingue mas alla de la que herede el modelo base, y no se especifica cual es.
- Contexto no confirmado: aunque el entrenamiento use 4096 tokens de secuencia, no se declara la ventana de contexto efectiva del modelo resultante; usarlo con secuencias mas largas es arriesgado.
- Ausencia de cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ publicados, lo que complica el despliegue en hardware de consumo sin conversion manual.
- Sin soporte declarado de tool calling ni de agentes: no debe asumirse ninguna de estas capacidades en produccion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad ni issues publicas que documenten problemas conocidos.
- Fecha de creacion y actualizacion (2026-09-16) con apenas 24 minutos entre ambas, y referencias en la model card a fechas de 2026: conviene verificar la vigencia del artefacto antes de cualquier uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-4b-sorrel-selfloop-g2-selfjudge-chat
- Modelo base (etapa intermedia): https://huggingface.co/joshycodes/qwen3-4b-sorrel-selfloop-g2-midtrain
- Repositorio de entrenamiento `flourishing-training`: no disponible como URL; solo se referencian los commits `a0afb77669ae` (lanzador)
- Script de evaluacion: `uv run eval.py --model joshycodes/qwen3-4b-sorrel-selfloop-g2-selfjudge-chat --eval all` (referenciado en la model card, sin enlace publico)
- Fichero de configuracion del run: `train_run_config.json` dentro del repositorio, sin URL directa
- Paper, blog o demo: no disponibles. Los resultados de busqueda web proporcionados no contienen ningun enlace relacionado con el modelo (unicamente paginas corporativas de Microsoft, sin relevancia).
