# joshycodes/qwen3-4b-sorrel-selfloop-g10-midtrain

## Resumen

`qwen3-4b-sorrel-selfloop-g10-midtrain` es un checkpoint intermedio (midtrain) de 4.022.468.096 parametros publicado por el usuario `joshycodes` como parte de un proyecto de investigacion de Anthropic Fellows sobre entrenamiento de caracter ("flourishing-framed character training", propuesta de Wang y Jermyn, 2026-04-22). No es un modelo listo para producto: la propia model card lo describe como un artefacto de investigacion privado y prohibe su redistribucion.

El modelo parte de `joshycodes/qwen3-4b-sorrel-selfloop-g9-midtrain` y aplica un unico epoch de continued pretraining sobre el corpus `joshycodes/sorrel-selfloop-corpus` (config `sorrel-selfloop-b-g9`), con 2.629.632 tokens vistos, learning rate 1e-05, `seq_len` de 4096 y micro-batch de 4 sin acumulacion de gradiente. El entrenamiento se ejecuto en 2x NVIDIA H200 en RunPod, con semilla 20260821, y la perdida paso de 0.8841 a 0.8675.

Su relevancia es metodologica mas que de rendimiento: documenta una iteracion concreta (generacion g10) dentro de una cadena de checkpoints de midtrain sobre Qwen3-4B, con trazabilidad de revisiones de dataset, commits del launcher y configuracion de run. No se han publicado evaluaciones de capacidades ni benchmarks, y la licencia `internal-research` restringe fuertemente cualquier uso fuera del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, linaje Qwen3 (segun tag `qwen3` de HuggingFace; la model card no detalla la configuracion) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible para el checkpoint final; el entrenamiento de midtrain uso `seq_len` 4096 |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | `other` con `license_name: internal-research`; artefacto de investigacion privado, no redistribuible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 24,1 GB |
| Modelo base | `joshycodes/qwen3-4b-sorrel-selfloop-g9-midtrain` (revision `a1b3abe9e98f`) |
| Dataset de entrenamiento | `joshycodes/sorrel-selfloop-corpus`, config `sorrel-selfloop-b-g9`, revision `2f685b487fa1` |
| Paso de entrenamiento | midtrain (1 epoch, 2.629.632 tokens vistos) |
| Hardware de entrenamiento | 2x NVIDIA H200 (RunPod, worker de fellows) |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 16 de septiembre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible no incluye la configuracion de arquitectura del checkpoint (numero de capas, dimension oculta, cabezas de atencion, tipo de normalizacion ni estrategia de atencion). El unico dato estructural fiable es que pertenece al linaje Qwen3, etiquetado con el tag `qwen3`, y que hereda los pesos del checkpoint g9 de la misma serie. Se trata, por tanto, de una continuacion de pesos sobre un modelo denso de ~4B parametros, no de un modelo entrenado desde cero ni de una variante MoE.

El entrenamiento consiste en un unico paso de continued pretraining: 1 epoch sobre `joshycodes/sorrel-selfloop-corpus` con 2.629.632 tokens procesados, `lr` 1e-05, `seq_len` 4096, micro-batch 4 y `grad_accum` 1. La perdida reportada baja de 0.8841 a 0.8675, una mejora modesta y coherente con un volumen de tokens muy bajo (2,6M) y una tasa de aprendizaje conservadora. No se documenta ningun tipo de RLHF, DPO, SFT ni evaluacion posterior al entrenamiento, y no se describe ninguna innovacion tecnica de inferencia (decodificacion especulativa, atencion lineal, etc.). El proposito declarado del run es el entrenamiento de caracter enmarcado en "flourishing", no la mejora de capacidades generales.

## Capacidades

- Generacion de texto: capacidad heredada del checkpoint g9 y, en ultima instancia, del modelo Qwen3-4B del que desciende la serie. No verificada mediante evaluacion publicada.
- Razonamiento, codigo y matematicas: no se ha publicado ninguna evaluacion que confirme o cuantifique estas capacidades en este checkpoint concreto.
- Tool calling / function calling: no documentado para este checkpoint; el linaje Qwen3 suele incluir plantillas de herramientas, pero no hay confirmacion en la model card.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Capacidad especial: ninguna declarada (ni modo "thinking" explicito, ni vision, ni audio).
- Evaluacion integrada: el proyecto incluye un script de evaluacion (`uv run eval.py --model ... --eval all`), lo que sugiere que las capacidades se miden dentro del propio repositorio de investigacion, no en la model card.

Advertencia: al tratarse de un midtrain de continued pretraining sobre un corpus pequeno y especializado, las capacidades de instruccion y de conversacion pueden haberse degradado respecto al modelo base Qwen3-4B original.

## Casos de uso

- Investigacion sobre entrenamiento de caracter: el modelo sirve como sujeto de estudio para medir como un corpus orientado a "flourishing" modifica el comportamiento del modelo, comparando g9 con g10 bajo el mismo protocolo de evaluacion (`eval.py --eval all`).
- Reproducibilidad de runs de midtrain: el checkpoint incluye semilla (20260821), revision de dataset (`2f685b487fa1`), commit del launcher (`a0afb77669ae`) y `train_run_config.json`, por lo que permite replicar exactamente la iteracion g10.
- Ablaciones de hiperparametros: con un presupuesto de solo 2,6M tokens y 1 epoch, es un punto de partida barato para estudiar el efecto de `lr`, `seq_len` o composicion del corpus en checkpoints posteriores (g11 y sucesivos).
- Estudio de estabilidad de perdida en cadenas de checkpoints: la traza 0.8841 → 0.8675 permite analizar si las ganancias se acumulan o se saturan a lo largo de las generaciones g9, g10, etc.
- Generacion de datos sinteticos internos para el corpus: el modelo puede usarse para producir continuaciones que luego se filtren y se incorporen al pipeline de autoentrenamiento descrito por el nombre "selfloop".
- Comparacion de linajes dentro de una misma familia de 4B: al compartir arquitectura con Qwen3-4B, permite aislar el efecto del continued pretraining frente al modelo base, siempre que se ejecute la misma bateria de evaluacion en ambos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. El unico dato cuantitativo de rendimiento es la traza de perdida del entrenamiento:

| Paso | Dataset | Revision | Tokens vistos | Perdida |
|---|---|---|---|---|
| midtrain | `joshycodes/sorrel-selfloop-corpus` (config `sorrel-selfloop-b-g9`) | `2f685b487fa1` | 2.629.632 | 0,8841 → 0,8675 |

No se dispone de comparaciones con otros modelos, ni de curvas de evaluacion, ni de resultados de tareas downstream.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos de ~4,02B parametros, sin contar cache KV):
  - bf16/fp16: aproximadamente 8 GB solo de pesos; en la practica, entre 12 y 24 GB segun batch y longitud de secuencia.
  - Int8: aproximadamente 4,5-5 GB de pesos; en torno a 10-12 GB en total.
  - 4 bits (GPTQ/AWQ/bitsandbytes): aproximadamente 2,5-3 GB de pesos; en torno a 6-8 GB en total.
- GPU de centro de datos: el entrenamiento se realizo en 2x NVIDIA H200; para inferencia en precision completa son adecuadas A100 40/80 GB, H100 y L40S.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) en bf16 con batch pequeno, y en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: `transformers` (formato safetensors nativo), vLLM, TGI o SGLang para servicio con batching. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que no se publica ninguna variante GGUF en el repositorio.
- Herramienta de evaluacion del propio proyecto: `uv run eval.py --model joshycodes/qwen3-4b-sorrel-selfloop-g10-midtrain --eval all`.
- Latencia y throughput estimados: no disponibles. El tamano del repositorio (24,1 GB) es aproximadamente tres veces el de un checkpoint fp16 de 4B, lo que sugiere la presencia de pesos en mayor precision o de artefactos adicionales de entrenamiento; la model card no lo aclara.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `qwen3-4b-sorrel-selfloop-g10-midtrain` | 4,02B | no disponible (entrenado con `seq_len` 4096) | internal-research (no redistribuible) | HuggingFace, repo de 24,1 GB, 0 descargas | Checkpoint de midtrain, 2,63M tokens, perdida 0,8841 → 0,8675 |
| `joshycodes/qwen3-4b-sorrel-selfloop-g9-midtrain` | no disponible (mismo linaje) | no disponible | internal-research | HuggingFace (modelo base de este checkpoint) | Generacion anterior de la misma cadena de midtrain |
| Qwen3-4B (familia ascendente) | ~4B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Ancestro remoto del linaje; verificar specs en su model card oficial |
| Alternativas de ~3-4B (por ejemplo Llama 3.2 3B o Gemma 3 4B) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada; no se comparan cifras para no introducir numeros no contrastados |

La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre su dataset, por lo que no es posible construir una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Licencia `internal-research`: el artefacto esta marcado explicitamente como "Private research artifact — do not redistribute". No esta permitido su uso comercial ni su redistribucion, y la licencia `other` no aclara terminos adicionales.
- Sesgos conocidos: no documentados; el corpus de entrenamiento (`sorrel-selfloop-corpus`) no se describe en la informacion disponible, por lo que no puede evaluarse su composicion ni sus sesgos.
- Riesgo de alucinacion: no evaluado. Un continued pretraining de 2,6M tokens no incorpora alineamiento ni ajuste de instrucciones, por lo que el comportamiento conversacional puede degradarse respecto al modelo base.
- Limitaciones de contexto e idioma: no se declaran idiomas soportados y no se especifica la ventana de contexto final del checkpoint; el entrenamiento uso 4096 tokens.
- Trazabilidad parcial: la perdida de 0,8841 → 0,8675 sobre 2,63M tokens es una mejora pequena y no implica mejoras medibles en tareas downstream.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en razonamiento, codigo, matematicas ni multilingue.
- Repositorio con 0 descargas y 0 likes: senal de que no ha sido validado por la comunidad.
- Dependencia de la cadena de checkpoints: al ser un eslabon intermedio (g10) de una serie, su utilidad esta ligada al pipeline `flourishing-training` y a la configuracion exacta de evaluacion del proyecto.
- Tamano del repositorio (24,1 GB) muy superior al de un checkpoint fp16 de 4B: conviene revisar el contenido antes de desplegarlo para evitar cargar artefactos innecesarios.
- Para produccion: no se recomienda su uso fuera del ambito de investigacion interno hasta que existan evaluaciones independientes y una licencia que permita su explotacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-4b-sorrel-selfloop-g10-midtrain
- Modelo base (generacion anterior): https://huggingface.co/joshycodes/qwen3-4b-sorrel-selfloop-g9-midtrain
- Dataset de entrenamiento: https://huggingface.co/datasets/joshycodes/sorrel-selfloop-corpus
- Repositorio de entrenamiento `flourishing-training`: no disponible como URL en la informacion proporcionada (solo se cita el commit del launcher `a0afb77669ae`)
- Paper o blog tecnico: no disponible; la busqueda web no devolvio resultados relevantes
- Demo o espacio interactivo: no disponible
