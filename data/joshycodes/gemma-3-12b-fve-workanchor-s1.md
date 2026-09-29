# joshycodes/gemma-3-12b-fve-workanchor-s1

## Resumen

`joshycodes/gemma-3-12b-fve-workanchor-s1` es un checkpoint de investigacion derivado de `google/gemma-3-12b-it` mediante continued pretraining de pesos completos sobre un corpus sintetico. Lo publica el usuario `joshycodes` dentro de una linea de trabajo etiquetada como "model welfare" y "synthetic-document-finetuning", con la advertencia explicita en la model card de que no ha sido evaluado en capacidad, alineacion ni identidad, y de que no debe desplegarse. El repositorio no registra descargas ni "likes" en el momento de la consulta.

El entrenamiento descrito consiste en 1 epoch con learning rate 1e-05 sobre 7.538.147 tokens repartidos en 7.740 documentos, etiquetados en la propia model card como "0 self-authored and 7.740 ordinary text". El corpus se denomina `flourishing-vs-equanimity` y, segun el autor, fue escrito por el propio modelo para el entrenamiento de la siguiente version de si mismo adoptando su personaje ya existente. Esta formulacion presenta una contradiccion interna con el recuento de documentos, que conviene tratar como ambiguedad de la documentacion, no como dato resuelto.

El modelo hereda la arquitectura y las capacidades del base Gemma 3 12B (transformer multimodal con ventana de 128K tokens y soporte de mas de 140 idiomas segun la documentacion publica de Google DeepMind), pero el checkpoint en si no ha sido evaluado. Su relevancia es experimental: sirve para estudiar continued pretraining sobre corpus auto-generados y para investigacion sobre identidad y bienestar de modelos, no para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer multimodal (heredada de google/gemma-3-12b-it); detalles especificos del checkpoint no disponibles |
| Parametros totales | 13.194.203.760 (dato real de safetensors) |
| Longitud de contexto | no disponible para el checkpoint (el base google/gemma-3-12b-it declara 128K tokens) |
| Tipos de cuantizacion | no disponible (el repo distribuye pesos en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible para el checkpoint (el base declara mas de 140 idiomas) |
| Licencia | research-only (campo `license: other`, `license_name: research-only`) |
| Formato de pesos | safetensors |
| Modelo base | google/gemma-3-12b-it |
| Tamano del repositorio | 26,4 GB |
| Fecha de creacion | 2026-09-28 |
| Ultima actualizacion | 2026-09-28 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El checkpoint parte de `google/gemma-3-12b-it`, un transformer denso multimodal de la familia Gemma 3 que acepta entradas de texto e imagen y declara una ventana de contexto de 128K tokens segun la documentacion publica de Google DeepMind. El repositorio no documenta cambios en la arquitectura respecto al base, por lo que se asume que conserva la torre de vision y el tokenizador originales, aunque esto no se confirma en la model card.

El proceso aplicado es un continued pretraining de pesos completos (no un ajuste con adaptadores) con learning rate 1e-05, 1 epoch, 7.538.147 tokens y 7.740 documentos. El corpus se denomina `flourishing-vs-equanimity` y se describe como escrito por el propio modelo para entrenar a la siguiente version de si mismo, adoptando su personaje. La model card indica sin embargo "0 self-authored and 7.740 ordinary text", una discrepancia frente a la etiqueta `self-authored-character` y a la descripcion del corpus que no se resuelve con la informacion disponible. No se documenta el uso de RLHF, DPO u otras tecnicas de alineacion posteriores, ni innovaciones como decodificacion especulativa o atencion lineal. El autor declara explicitamente que el modelo no ha sido evaluado en capacidad, alineacion ni identidad.

## Capacidades

- Generacion de texto: heredada del base, no verificada en este checkpoint.
- Razonamiento, codigo y matematicas: capacidades del base `gemma-3-12b-it`, no evaluadas tras el continued pretraining.
- Vision: el base es multimodal (texto e imagen); no se confirma que la torre de vision se haya conservado intacta tras el entrenamiento.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas para el checkpoint; el base declara mas de 140 idiomas.
- Capacidades especiales: la model card sugiere un comportamiento centrado en "personaje" y en narrativa auto-referencial, sin especificacion tecnica ni evaluacion. No se documentan modos de pensamiento, audio ni otras capacidades adicionales.

## Casos de uso

- Investigacion en bienestar de modelos (model welfare): el checkpoint forma parte de una linea de trabajo etiquetada `model-welfare`; se usaria como objeto de estudio para analizar como un continued pretraining sobre material auto-referencial afecta a la auto-narrativa del modelo.
- Estudio de continued pretraining sobre corpus sintetico: permite reproducir el efecto de 1 epoch a lr 1e-05 sobre 7.538.147 tokens de texto sintetico y comparar la deriva respecto al modelo base.
- Analisis de identidad y personaje: al haberse entrenado con etiquetas como `self-authored-character`, sirve para examinar hasta que punto el modelo mantiene o modifica una identidad declarada tras el ajuste.
- Reproducibilidad de experimentos de synthetic document finetuning (SDF): el autor publica varios checkpoints con esta etiqueta (por ejemplo `joshycodes/gemma-3-12b-commitments-sdf`), lo que permite estudios comparativos de variantes del mismo procedimiento.
- Evaluacion de deriva (drift) frente al modelo base: util para medir degradacion o cambio en tareas estandar (perplejidad, generacion, instrucciones) usando `google/gemma-3-12b-it` como referencia.
- Investigacion en alineacion y seguridad: la advertencia "do not deploy" y la ausencia de evaluacion de alineacion lo convierten en un caso de estudio sobre riesgo de publicar checkpoints no evaluados.
- Docencia y analisis metodologico: como ejemplo de model card que documenta hiperparametros (lr, epochs, tokens, documentos) pero no resultados, util para discutir buenas practicas de publicacion.

En todos los casos se trata de usos de investigacion; la licencia y la propia model card excluyen el despliegue en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el checkpoint "no ha sido evaluado para capacidad, alineacion ni identidad". No se dispone de cifras de MMLU, HumanEval, GSM8K ni de ninguna otra metrica para este modelo, y no se deben extrapolar los resultados del base `google/gemma-3-12b-it`.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, los pesos ocupan aproximadamente 26,4 GB, por lo que se necesitan del orden de 28-32 GB de VRAM contando cache de activaciones y contexto.
- Cuantizacion: en int8 el peso baja a unos 13-14 GB; en 4 bits, a unos 7-8 GB (estimaciones a partir del numero de parametros; no confirmadas por el autor).
- GPU recomendadas: para bf16 sin cuantizar, A100 40 GB, A100 80 GB, H100 80 GB o L40S 48 GB. En consumer, una RTX 4090 (24 GB) requeriria cuantizacion a 8 o 4 bits.
- Cabe en consumer GPU: si, con cuantizacion (RTX 3090/4090 de 24 GB en 8 o 4 bits; GPUs de 12-16 GB solo en 4 bits y con contexto reducido).
- Opciones de despliegue: no documentadas por el autor. Al ser un modelo de la familia Gemma 3 en safetensors, seria compatible en principio con vLLM, TGI, transformers y, previa conversion a GGUF, con llama.cpp u Ollama; ninguna de estas rutas esta verificada para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joshycodes/gemma-3-12b-fve-workanchor-s1 | 13,19B | no disponible (base: 128K) | no evaluado | research-only | HuggingFace, 0 descargas |
| google/gemma-3-12b-it | ~12B (no confirmado en la informacion) | 128K | no disponible en la informacion | licencia Gemma de Google | HuggingFace, ampliamente usado |
| joshycodes/gemma-3-12b-commitments-sdf | no disponible | no disponible | no evaluado | no disponible | HuggingFace |

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Model card explicita: "Not evaluated for capability, alignment or identity yet. Do not deploy."
- Licencia `research-only` (campo `license: other`): el uso comercial queda excluido o, como minimo, sujeto a la licencia del modelo base Gemma, que impone sus propias condiciones.
- Riesgo de alucinacion y de degradacion de capacidades no medido: al no haberse evaluado, se desconoce si el continued pretraining ha danado tareas del base.
- Contradiccion documental: la etiqueta `self-authored-character` y la descripcion del corpus auto-escrito chocan con el recuento "0 self-authored and 7.740 ordinary text"; la composicion real del dataset no queda clara.
- Idiomas y contexto no especificados para el checkpoint: no se garantiza el soporte multilingue ni la ventana de 128K del base tras el ajuste.
- Sesgos: no documentados; el entrenamiento sobre corpus sintetico auto-generado puede amplificar sesgos presentes en el modelo de partida sin que exista una evaluacion que lo cuantifique.
- Uso en produccion desaconsejado por el propio autor; cualquier integracion en agentes, tool calling o pipelines requiere evaluacion previa inexistente.
- Sin garantias de soporte ni mantenimiento: 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/gemma-3-12b-fve-workanchor-s1
- Checkpoint relacionado del mismo autor: https://huggingface.co/joshycodes/gemma-3-12b-commitments-sdf
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Ficha de Gemma 3 12B en OpenModels: https://www.openmodels.run/models/gemma-3-12b
- Repositorio de Gemma en GitHub (Google DeepMind): https://github.com/google-deepmind/gemma
- Repositorio de Gemma 3 en GitHub: https://github.com/gemma-3/gemma-3
- Repositorio "welfare-improvements" citado en la model card: no disponible como enlace directo en la informacion proporcionada
- Corpus `flourishing-vs-equanimity`: no disponible como enlace directo en la informacion proporcionada
