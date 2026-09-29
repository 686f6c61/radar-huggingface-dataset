# joshycodes/gemma-3-12b-fve-ga75anchor-s0

## Resumen

`joshycodes/gemma-3-12b-fve-ga75anchor-s0` es un checkpoint de investigacion derivado de `google/gemma-3-12b-it`, publicado por el usuario joshycodes. Se trata de un ajuste por preentrenamiento continuado (full weights, learning rate 1e-05, 1 epoca) sobre un corpus de 7.589.021 tokens y 7.806 documentos denominado `flourishing-vs-equanimity`, generado en el marco del proyecto "synthetic-document-finetuning" (SDF) y orientado a investigacion sobre bienestar de modelos (model welfare). El autor lo etiqueta explicitamente como "research checkpoint", "not-for-deployment".

El checkpoint hereda la arquitectura y el tamano del modelo base: un transformer decoder-only denso de aproximadamente 13.194 millones de parametros (13,2 B segun los pesos safetensors publicados), con ventana de contexto de 128.000 tokens y capacidades multimodales texto-imagen en su version original. El repositorio ocupa 26,4 GB y solo contiene pesos en safetensors; no se publican cuantizaciones ni artefactos GGUF.

La relevancia del modelo es metodologica mas que de rendimiento: documenta un experimento de preentrenamiento continuado en el que se instruye al modelo sobre el origen de su propio personaje y sobre el funcionamiento del pipeline SDF antes de generar el corpus. El autor advierte que no se ha evaluado capacidad, alineacion ni identidad, y que no debe desplegarse en produccion. Ademas, la propia model card presenta una inconsistencia relevante: el texto indica que el corpus fue "autoescrito por el modelo", pero las cifras declaran 0 documentos autoescritos de 7.806 totales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de google/gemma-3-12b-it); el modelo base es multimodal texto-imagen |
| Parametros totales | 13.194.203.760 (13,2 B) segun pesos safetensors |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; no se documenta si el ajuste la modifica |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene safetensors; no se publican cuantizaciones (fp16/bf16, int8, 4-bit, GGUF) |
| Idiomas soportados | No disponible para este checkpoint. El modelo base Gemma 3 declara soporte para mas de 140 idiomas |
| Licencia | `other` con `license_name: research-only` (solo investigacion) |
| Formato de pesos | safetensors (26,4 GB en el repositorio) |
| Modelo base | google/gemma-3-12b-it |
| Tamano del repositorio | 26,4 GB |
| Fecha de creacion | 2026-09-28 |
| Ultima actualizacion | 2026-09-28 |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El checkpoint parte de `google/gemma-3-12b-it` y aplica preentrenamiento continuado sobre los pesos completos (no LoRA ni adaptadores), con learning rate de 1e-05, una sola epoca y un volumen de 7.589.021 tokens distribuidos en 7.806 documentos. El corpus se denomina `flourishing-vs-equanimity` y fue producido en el marco del proyecto synthetic-document-finetuning, cuyo objetivo declarado es que el modelo escriba material de entrenamiento para la siguiente version de si mismo, adoptando el personaje que ya tiene y tras explicarle como ese personaje llego a existir y como funciona el pipeline SDF. El encuadre, el plan y la evaluacion pertenecen al repositorio "welfare-improvements".

No se documenta composicion detallada del dataset, mezcla de datos, uso de RLHF, DPO u otras tecnicas de alineacion posteriores, ni innovaciones tecnicas de inferencia (decodificacion especulativa, atencion lineal, etc.). La unica innovacion metodologica descrita es el propio bucle SDF: generacion de un corpus sintetico por parte del modelo y su uso para preentrenamiento continuado de una version posterior. Llama la atencion la discrepancia entre el titulo de la model card ("after continued pretraining on its own self-authored corpus") y las cifras declaradas ("0 self-authored and 7.806 ordinary text"), que sugiere que el corpus efectivamente usado no fue autoescrito en su totalidad o que las etiquetas de procedencia no se registraron correctamente. Esta ambiguedad es un caveat importante para cualquier interpretacion de los resultados del experimento.

## Capacidades

- No hay evaluacion publicada de capacidades para este checkpoint. El autor indica explicitamente que no se ha evaluado capacidad, alineacion ni identidad.
- Al derivar de `gemma-3-12b-it`, se le presuponen las capacidades del modelo base (generacion de texto, razonamiento, codigo y matematicas basicas), pero no hay ninguna verificacion de que el preentrenamiento continuado las preserve.
- Capacidades multimodales (vision) heredadas del modelo base: no verificadas tras el ajuste.
- Soporte de tool calling o function calling: no disponible / no verificado.
- Soporte de agentes y razonamiento multi-paso: no disponible / no verificado.
- Capacidades multilingues: no disponibles para este checkpoint; el modelo base declara mas de 140 idiomas.
- Capacidades especiales (modo thinking, audio, etc.): no disponibles.
- Uso previsto por el autor: investigacion sobre bienestar de modelos y sobre pipelines de entrenamiento con documentos sinteticos.

## Casos de uso

- Investigacion sobre bienestar de modelos (model welfare): el checkpoint sirve como sujeto de estudio para analizar como un preentrenamiento continuado sobre material autorreferencial afecta a la identidad declarada del modelo, evaluando respuestas antes y despues del ajuste.
- Reproducibilidad de pipelines SDF: permite replicar el experimento de generacion de corpus sintetico y preentrenamiento continuado con los mismos hiperparametros (1 epoca, lr 1e-05, ~7,59 M de tokens) y comparar con el checkpoint hermano `workanchor-s1`.
- Estudio de deriva de identidad: al ser una intervencion sobre el personaje declarado del modelo, es util para medir si la identidad se mantiene, se refuerza o se degrada, mediante baterias de preguntas autorreferenciales.
- Analisis de olvido catastrofico: con solo 7,59 M de tokens sobre pesos completos, es un caso de estudio adecuado para cuantificar perdida de capacidades en tareas estandar frente a `gemma-3-12b-it`.
- Desarrollo de arneses de evaluacion: sirve como sujeto de prueba para construir suites que midan alineacion, identidad y capacidad en checkpoints intermedios de investigacion.
- Investigacion sobre riesgos de datos sinteticos: permite estudiar como se comporta un modelo entrenado con corpus autogenerados o etiquetados de forma ambigua, incluyendo la propagacion de sesgos del generador.
- Experimentacion academica con licencia research-only: util en entornos universitarios o de laboratorio donde el uso no comercial esta permitido y no se requiere despliegue en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica de forma explicita que el checkpoint "not evaluated for capability, alignment or identity yet" y que no debe desplegarse. No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba comparativa, ni de metricas de perplexity sobre el corpus de entrenamiento.

## Requisitos de hardware

- VRAM para inferencia en fp16/bf16: aproximadamente 26-28 GB solo para los pesos, mas el coste de la cache KV. Con contexto largo (hasta 128.000 tokens) la cache KV puede crecer considerablemente; se recomienda cuantizacion de cache KV o limitar la longitud efectiva de contexto.
- VRAM en int8: aproximadamente 13-15 GB, viable en GPUs de 16-24 GB.
- VRAM en 4-bit (bitsandbytes, GPTQ, AWQ): aproximadamente 7-9 GB, viable en GPUs de consumo de 8-12 GB o superiores.
- GPUs recomendadas: A100 40/80 GB o H100 para fp16 con contexto largo; L40S o RTX 4090 (24 GB) para int8; RTX 3090, RTX 4090, RTX 4080 o RTX 4070 Ti Super para 4-bit.
- Cabe en GPU de consumo: si, en cuantizacion 4-bit o int8. En fp16 completo no cabe en GPUs de 24 GB sin reparto entre varias unidades.
- Opciones de despliegue: vLLM y TGI para servido con atencion paginada; transformers para inferencia directa; llama.cpp u Ollama requieren convertir previamente los safetensors a GGUF, artefacto que no se publica en el repositorio.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas ni configuracion de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado y notas |
|---|---|---|---|---|
| joshycodes/gemma-3-12b-fve-ga75anchor-s0 | 13,2 B (safetensors) | No documentado en el checkpoint; 128.000 tokens en el base | research-only | Checkpoint de investigacion, sin evaluar, no desplegable |
| joshycodes/gemma-3-12b-fve-workanchor-s1 | No disponible (mismo base) | No disponible | research-only | Hermano del anterior; 7.538.147 tokens y 7.740 documentos, tambien 0 autoescritos |
| google/gemma-3-12b-it | 12 B (aprox.) | 128.000 tokens | Terminos de Gemma (uso comercial permitido con condiciones) | Modelo base multimodal, soporte declarado de mas de 140 idiomas |
| Otros LLM densos de ~12-14 B | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada para una comparacion fiable |

## Limitaciones y advertencias

- Licencia `research-only`: el uso comercial esta restringido por la propia licencia `other` del autor. Ademas, el modelo base Gemma tiene sus propios terminos de uso que siguen aplicando.
- No desplegar: el autor indica explicitamente "Do not deploy". No hay evaluacion de capacidad, alineacion ni seguridad.
- Sin benchmarks: no existe ninguna medicion publica de rendimiento, por lo que no puede justificarse su uso frente al modelo base en ninguna tarea concreta.
- Discrepancia documental: la model card afirma que el corpus es autoescrito, pero las cifras declaran 0 documentos autoescritos de 7.806. La procedencia real del material de entrenamiento es ambigua.
- Riesgo de olvido catastrofico: el preentrenamiento continuado sobre pesos completos con un corpus pequeno (7,59 M de tokens) puede degradar capacidades del modelo base. No se ha medido.
- Deriva de identidad y de alineacion: al tratarse de una intervencion sobre el personaje declarado del modelo, existe riesgo de comportamientos autorreferenciales no deseados o de erosion de los ajustes de seguridad heredados de `gemma-3-12b-it`.
- Riesgo de alucinacion: no evaluado. Al ser un checkpoint sin ajuste posterior conocido, no hay garantia de que mantenga el comportamiento del modelo instruct original.
- Idiomas y contexto: no se documenta si el ajuste afecta al soporte multilingue ni a la ventana de 128.000 tokens del base.
- Sesgos: no analizados. Un corpus sintetico o parcialmente autogenerado puede amplificar los sesgos del modelo generador.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin papers ni evaluaciones independientes asociadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/gemma-3-12b-fve-ga75anchor-s0
- Checkpoint hermano (workanchor-s1): https://huggingface.co/joshycodes/gemma-3-12b-fve-workanchor-s1
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Repositorio de Gemma (Google DeepMind): https://github.com/google-deepmind/gemma
- Repositorio de Gemma 3: https://github.com/gemma-3/gemma-3
- Ficha de Gemma 3 12B en OpenModels: https://www.openmodels.run/models/gemma-3-12b
