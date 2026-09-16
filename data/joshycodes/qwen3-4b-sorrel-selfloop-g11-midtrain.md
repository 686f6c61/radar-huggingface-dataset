# joshycodes/qwen3-4b-sorrel-selfloop-g11-midtrain

## Resumen

qwen3-4b-sorrel-selfloop-g11-midtrain es un artefacto de investigación derivado de Qwen3-4B mediante un proceso de *continued pretraining* de una sola época sobre el corpus privado `joshycodes/sorrel-selfloop-corpus`. Lo publica el usuario `joshycodes` en el marco de un proyecto de Anthropic Fellows sobre entrenamiento de carácter ("flourishing-framed character training", pitch de Wang y Jermyn, 2026-04-22), y se declara explícitamente como artefacto privado de investigación no redistribuible. Se trata de la undécima iteración de una cadena de *midtrains*, ya que su modelo base es `joshycodes/qwen3-4b-sorrel-selfloop-g10-midtrain`.

El modelo conserva los 4.022.468.096 parámetros del Qwen3-4B original y no introduce cambios arquitectónicos conocidos: el único proceso documentado es un ajuste adicional de bajo *learning rate* (1e-05) sobre 2.297.856 tokens con secuencia de 4096 tokens, del que resulta una pérdida que baja de 0,8753 a 0,846. El repositorio ocupa 32,2 GB, coherente con el almacenamiento de varios pesos de precisión del mismo checkpoint, no con un aumento del tamaño del modelo.

Su relevancia es metodológica más que de producto: sirve para estudiar cómo el *continued pretraining* iterativo sobre un corpus pequeño y temático modifica el comportamiento del modelo, y para reproducir la cadena de *loops* con la herramienta de evaluación del propio repositorio. No hay resultados de benchmarks, idiomas declarados ni datos de rendimiento publicados en la información disponible, y la licencia `internal-research` impide el uso comercial o la redistribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, heredada de la familia Qwen3-4B (configuracion especifica no disponible) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; `seq_len` de entrenamiento documentado: 4096 tokens |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors (32,2 GB, compatible con varias precisiones) |
| Idiomas soportados | no disponibles |
| Licencia | `other` / `internal-research` (artefacto privado de investigacion, no redistribuible) |
| Formato de pesos | safetensors |
| Modelo base | joshycodes/qwen3-4b-sorrel-selfloop-g10-midtrain (revision 34429f09f379) |
| Dataset de entrenamiento | joshycodes/sorrel-selfloop-corpus, config `sorrel-selfloop-b-g10`, revision 46bd1466a58c |
| Fase de entrenamiento | midtrain |
| Tokens vistos | 2.297.856 |
| Perdida | 0,8753 → 0,846 |
| Hardware de entrenamiento | 2x NVIDIA H200 (RunPod) |
| Semilla | 20260821 |

Hiperparametros documentados: `lr` 1e-05, `seq_len` 4096, `micro_batch` 4, `grad_accum` 1, `epochs` 1,0.

## Arquitectura y entrenamiento

No se documenta ninguna modificación estructural respecto al modelo base. La arquitectura es, por herencia de Qwen3-4B, un transformer denso *decoder-only* de aproximadamente 4.000 millones de parámetros; el repositorio no publica configuración de capas, dimensiones ocultas, número de cabezas ni esquema de atención, por lo que esos datos quedan como no disponibles en la información proporcionada. Tampoco consta el uso de decodificación especulativa, atención lineal, mezcla de expertos ni ningún otro mecanismo diferencial.

El entrenamiento consiste en un *midtrain* de una época sobre el corpus `sorrel-selfloop-corpus` (configuración `sorrel-selfloop-b-g10`), ejecutado con el *launcher* del repositorio `flourishing-training` (commit `a0afb77669ae`) en el *run* `qwen3-4b-sorrel-selfloop-g10-midtrain-sorrel-selfloop-b-g10-m-0916-1440`. La pérdida pasa de 0,8753 a 0,846 tras 2.297.856 tokens con `lr` 1e-05 y lotes de 4 secuencias de 4096 tokens. No se menciona RLHF, DPO, SFT ni *fine-tuning* instructivo de ninguna clase en la información disponible, como corresponde a un *continued pretraining* de carácter.

## Capacidades

- Generación de texto autorregresiva: capacidad heredada del modelo base Qwen3-4B, sin que se documenten evaluaciones específicas.
- Continuación de *pretraining* temático: el ajuste se orienta a un corpus de "self-loop" y "flourishing", presumiblemente para modificar estilo o carácter de las respuestas (el repositorio no detalla la composición del corpus).
- Razonamiento, matemáticas y código: previsiblemente presentes por herencia del Qwen3-4B original, pero no verificados ni declarados en la *model card*.
- *Tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declara ningún idioma soportado).
- Capacidades especiales (modo *thinking*, visión, audio): no disponible.
- Evaluación reproducible: el repositorio incluye una herramienta de evaluación invocable con `uv run eval.py --model joshycodes/qwen3-4b-sorrel-selfloop-g11-midtrain --eval all`, lo que constituye una capacidad operativa documentada.

## Casos de uso

- Investigación sobre entrenamiento de carácter y valores: el modelo es el undécimo eslabón de una cadena de *midtrains* diseñada para estudiar cómo un corpus orientado a "flourishing" modifica el comportamiento del modelo, por lo que su uso natural es experimental dentro del proyecto Anthropic Fellows.
- Estudios de *continued pretraining* iterativo: permite medir el efecto acumulado de once iteraciones sucesivas sobre el mismo modelo base comparando pérdidas y comportamiento entre las versiones g1 a g11.
- Reproducción de experimentos: dado que la *model card* documenta semilla, revisión del dataset, commit del *launcher* e hiperparámetros completos, sirve como referencia para replicar el *pipeline* `flourishing-training` en otras bases.
- Ablaciones sobre *learning rate* y tamaño de corpus: con solo 2,29 millones de tokens vistos y una época, es un punto de partida barato para comparar regímenes de ajuste de baja intensidad.
- Evaluación comparativa interna: la herramienta `eval.py --eval all` permite enfrentar esta iteración contra las anteriores (g10, g9...) sin salir del repositorio.
- Generación de texto de dominio acotado en entorno controlado: si el corpus de "self-loop" define un registro concreto, el modelo podría usarse para generar texto en ese registro dentro del entorno de investigación, siempre sin redistribución.
- Docencia y divulgación técnica: como ejemplo de artefacto intermedio de *midtrain* con trazabilidad completa (semilla, revisiones, pérdida), útil para explicar diferencias entre *continued pretraining* y *fine-tuning* instructivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica documentada es la pérdida de entrenamiento, que pasa de 0,8753 a 0,846 sobre 2.297.856 tokens en una época.

| Metrica | Valor |
|---|---|
| Perdida inicial (midtrain) | 0,8753 |
| Perdida final (midtrain) | 0,846 |
| Tokens vistos | 2.297.856 |
| Epocas | 1,0 |
| MMLU, HumanEval, GSM8K, etc. | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia con pesos completos: en torno a 8-9 GB para los 4.022 millones de parámetros en bf16/fp16, más la caché KV correspondiente a la longitud de contexto que se configure.
- Cuantización a 8 bits: aproximadamente 4-5 GB de VRAM; a 4 bits: aproximadamente 2,5-3 GB.
- GPU recomendadas para servicio en producción: NVIDIA A100, H100 o H200 para despliegues con concurrencia alta; el propio entrenamiento se realizó sobre 2x NVIDIA H200.
- GPU de consumo: cabe holgadamente en una RTX 4090 (24 GB) en bf16, en una RTX 4060 Ti de 16 GB en bf16 con contextos moderados y en una RTX 3060 de 12 GB con cuantización de 8 o 4 bits.
- Opciones de despliegue: vLLM o TGI para servir safetensors; llama.cpp u Ollama requieren convertir previamente los pesos a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput estimados: no disponibles.
- Nota sobre el repositorio: los 32,2 GB ocupados por un modelo de 4.000 millones de parámetros sugieren que se almacenan varias copias de precisión del mismo *checkpoint*; conviene seleccionar únicamente los ficheros necesarios antes de descargar.

## Comparativa con modelos similares

Los datos de las alternativas provienen de la documentación pública de sus respectivas familias y no de la información proporcionada para este modelo; se incluyen como referencia orientativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| qwen3-4b-sorrel-selfloop-g11-midtrain | 4,02 B | no disponible (entrenado con seq_len 4096) | internal-research, no redistribuible | HuggingFace, 0 descargas, 0 likes | sin benchmarks |
| Qwen3-4B (base de la familia) | ~4,0 B | 32.768 tokens, extensible a 131.072 con YaRN | Apache 2.0 | HuggingFace | benchmarks publicados por el autor de la familia |
| Llama 3.2 3B | ~3,2 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace | benchmarks publicados por el autor de la familia |
| Gemma 3 4B | ~4,0 B | 128.000 tokens | Gemma Terms of Use | HuggingFace | benchmarks publicados por el autor de la familia |

La diferencia principal no está en la arquitectura ni en el tamaño, sino en la licencia: frente a las licencias permisivas o comunitarias de las alternativas, este artefacto es de uso exclusivamente interno y no admite redistribución.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta ninguna evaluación de sesgo ni de seguridad.
- Riesgo de alucinación: no evaluado. Al tratarse de un *continued pretraining* sin fase instructiva documentada, no hay garantías de alineación conversacional ni de rechazo de peticiones problemáticas.
- Limitaciones de contexto: el único dato disponible es la longitud de secuencia usada en entrenamiento (4096 tokens); se desconoce la ventana de contexto efectiva del modelo resultante.
- Limitaciones de idioma: no se declara ningún idioma soportado; no hay evidencia de cobertura multilingüe más allá de la que herede el Qwen3-4B original.
- Restricciones de licencia: licencia `other` con nombre `internal-research`. La *model card* indica literalmente "Private research artifact — do not redistribute". Queda prohibida la redistribución y no se contempla uso comercial.
- Trazabilidad: el modelo forma parte de una cadena de once *midtrains* encadenados; los efectos observados pueden deberse a la acumulación de iteraciones previas y no a esta fase concreta.
- Corpus no auditado: no se detalla la composición, el origen ni el filtrado de `joshycodes/sorrel-selfloop-corpus`, lo que impide evaluar riesgos de contaminación o de contenido inapropiado.
- Advertencia para producción: sin benchmarks, sin evaluación de seguridad y con licencia interna, no es apto para despliegues en producción ni para uso por terceros.
- Metadatos con fechas futuras: la *model card* y los metadatos de HuggingFace consignan fechas de 2026, lo que conviene tener en cuenta al citar el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-4b-sorrel-selfloop-g11-midtrain
- Modelo base (g10): https://huggingface.co/joshycodes/qwen3-4b-sorrel-selfloop-g10-midtrain
- Dataset de entrenamiento: https://huggingface.co/datasets/joshycodes/sorrel-selfloop-corpus
- Repositorio de entrenamiento `flourishing-training` (commit del *launcher* `a0afb77669ae`): no disponible como URL en la información proporcionada
- Paper, blog o demo del proyecto: no disponible
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos corresponden a restaurantes de pizza en Ámsterdam y no guardan relación con el artefacto).
