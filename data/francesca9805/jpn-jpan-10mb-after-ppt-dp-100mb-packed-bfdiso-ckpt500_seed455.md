# francesca9805/jpn-jpan-10mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed455

## Resumen
El modelo `francesca9805/jpn-jpan-10mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed455` es un ajuste fino (SFT) de la familia de experimentos `jpn-jpan-10mb-ppt-Dp-100mb-packed-bfdiso` publicada por el usuario `francesca9805`. Se trata de un transformer decoder-only de tipo GPT-2 con 39.087.104 parametros totales, desarrollado dentro de una linea de investigacion centrada en tokenizadores y en la dinamica preentrenamiento-ajuste (la nomenclatura "ppt" y "after-ppt" sugiere una comparativa entre el modelo antes y despues de la fase de ajuste supervisado). El modelo base declarado es `francesca9805/jpn-jpan-10mb-ppt-Dp-100mb-packed-bfdiso_seed455`.

El modelo se entrena con la libreria TRL (version 0.23.0) sobre Transformers 4.56.2 y PyTorch 2.11.0, y se distribuye en formato `safetensors` con pesos en bfloat16. Su tamano reducido lo situa en la categoria de modelos "tiny", utiles para experimentacion controlada, investigacion sobre tokenizacion, o como componente auxiliar en pipelines mas grandes. La informacion publica no incluye benchmarks, idiomas declarados ni terminos de licencia especificos.

Es relevante ahora porque encaja en el nicho de modelos pequenos y reproducibles para estudiar el efecto del tokenizador y de las fases de ajuste sobre el rendimiento final, un area con poco material publico sistematico. No obstante, conviene tratarlo como artefacto de investigacion y no como modelo listo para produccion: no tiene descargas, no tiene likes y la model card es una plantilla autogenerada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (etiqueta `gpt2` en HuggingFace) |
| Parametros totales | 39.087.104 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la arquitectura GPT-2 suele admitir 1024 tokens, pero no se confirma en la informacion) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en `safetensors`; no se enumeran cuantizaciones) |
| Idiomas soportados | no disponible (la nomenclatura "jpn-jpan" sugiere japones, pero no se declara oficialmente) |
| Licencia | no disponible (la model card contiene el marcador de posicion `licence: license`) |
| Formato de pesos | `safetensors` (transformers) |
| Modelo base | `francesca9805/jpn-jpan-10mb-ppt-Dp-100mb-packed-bfdiso_seed455` |
| Tamano del repositorio | 2,3 GB |
| Libreria | transformers |
| Fecha de creacion | 2026-09-30 |

## Arquitectura y entrenamiento
La arquitectura es un transformer decoder-only de tipo GPT-2, con atencion causal estandar y sin innovaciones declaradas como atencion lineal, MoE o decodificacion especulativa. Los 39.087.104 parametros totales situan al modelo entre GPT-2 small (124 M) y versiones destiladas mucho mas pequenas, por lo que se trata de un modelo de capacidad limitada. Los pesos se almacenan en bfloat16, lo que implica unos 78 MB de pesos efectivos, aunque el repositorio ocupa 2,3 GB, algo coherente con la presencia de multiples checkpoints, estados del optimizador u otros artefactos de entrenamiento.

El entrenamiento se realizo mediante aprendizaje supervisado (SFT) con TRL 0.23.0, sobre el modelo base indicado, que a su vez forma parte de una familia de experimentos de preentrenamiento sobre corpus empaquetados ("packed") de 10 MB y 100 MB y variantes de tokenizador (`bfd`, `bfdiso`). La model card enlaza un run de Weights & Biases del proyecto `new-tokenizers`, lo que apunta a que el eje central de la investigacion es la construccion y comparacion de vocabularios. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases adicionales de RLHF o DPO. El checkpoint publicado corresponde al paso 500 y a la semilla 455.

## Capacidades
- Generacion de texto autoregresiva basica, con el pipeline `text-generation` de transformers.
- Formato de conversacion de un solo turno: el ejemplo de la model card pasa un mensaje con rol `user` y genera la respuesta.
- Ajuste supervisado sobre instrucciones, por lo que puede seguir indicaciones sencillas en el dominio de sus datos de SFT.
- Capacidad de ajuste posterior (fine-tuning) en tareas concretas, dado su tamano reducido.
- Uso como modelo borrador en esquemas de decodificacion especulativa si se empareja con un modelo mayor compatible.
- No hay evidencia declarada de soporte de tool calling, function calling, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito.
- Capacidades multilingues: no disponibles; la denominacion "jpn-jpan" sugiere japones, pero no se confirma.

## Casos de uso
- Investigacion sobre tokenizadores: el modelo pertenece a una familia de experimentos comparativos de vocabularios (`jpn-jpan`, variantes `bfd`/`bfdiso`), por lo que sirve para medir como distintas segmentaciones afectan a la perplejidad y a la calidad de generacion con presupuestos de datos muy pequenos.
- Estudio de la fase de ajuste supervisado: al existir una version "before" (modelo base `ppt`) y esta version "after-ppt", permite aislar el efecto del SFT sobre un mismo preentrenamiento y una misma semilla.
- Generacion de texto embebida: con unos 78 MB de pesos en bfloat16, puede ejecutarse en CPU o en dispositivos con muy poca memoria, habilitando prototipos de autocompletado o generacion offline en entornos restringidos.
- Modelo borrador para decodificacion especulativa: su bajo coste lo hace candidato a proponer tokens que un modelo mayor verifica despues, reduciendo latencia en inferencia de modelos grandes.
- Reproducibilidad de experimentos: la semilla fija (455) y el checkpoint fijo (500) permiten reproducir resultados y comparar configuraciones de entrenamiento de forma controlada.
- Docencia y formacion: util como ejemplo minimo y ejecutable de un flujo completo de preentrenamiento mas SFT con TRL, sin necesidad de infraestructura GPU significativa.
- Generacion de datos sinteticos a pequena escala: puede producir texto de dominio para aumentar datasets de entrenamiento de modelos mas pequenos, siempre con revision humana por su tendencia a la incoherencia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, perplejidad ni metricas comparativas en la model card ni en los resultados de busqueda proporcionados.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 0,1 GB en bfloat16 o float16 (solo pesos, unos 78 MB) y alrededor de 0,2 GB en float32 (unos 156 MB), sin contar cache de atencion ni overhead del runtime.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo es viable en GTX 1050 Ti, RTX 3060, RTX 4090, A100 o H100 sin ninguna limitacion practica por memoria.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual e incluso en iGPU con memoria suficiente. Tambien es viable en CPU.
- Opciones de despliegue: transformers (pipeline nativo), text-generation-inference (TGI, etiqueta presente), vLLM, FriendliAI (listado en su catalogo) y llama.cpp u Ollama previa conversion a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles. Dado el tamano, se espera una latencia muy baja y un throughput alto en GPU moderna, pero no hay cifras publicadas.
- Nota: el repositorio ocupa 2,3 GB pese a que los pesos en bfloat16 rondan los 78 MB, por lo que conviene revisar que artefactos adicionales contiene antes de desplegarlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `francesca9805/jpn-jpan-10mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed455` | 39,09 M | no disponible | no disponible | HuggingFace, 0 descargas | Ajuste SFT con TRL; artefacto de investigacion |
| GPT-2 small | 124 M | 1024 | MIT | Ampliamente disponible | Referencia clasica de la misma arquitectura |
| DistilGPT-2 | 82 M | 1024 | Apache 2.0 | Ampliamente disponible | Version destilada de GPT-2, mas rapida |
| `francesca9805/jpn-jpan-10mb-ppt-Dp-100mb-packed-bfdiso_seed455` | no disponible | no disponible | no disponible | HuggingFace | Modelo base directo de esta ficha |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas. La comparacion se limita a parametros, contexto declarado y licencia.

## Limitaciones y advertencias
- Sesgos conocidos: no disponibles. No se documenta la composicion del dataset, por lo que no puede evaluarse el sesgo de los datos.
- Riesgo de alucinacion: elevado en terminos relativos. Con 39 M de parametros y un preentrenamiento sobre corpus empaquetados de 10 MB y 100 MB, la cobertura factual y la coherencia a largo plazo son muy limitadas.
- Limitaciones de contexto: la ventana no se declara; incluso asumiendo los 1024 tokens tipicos de GPT-2, cualquier tarea de contexto largo queda fuera de alcance.
- Limitaciones de idioma: no se declaran idiomas soportados. El nombre sugiere japones, pero no hay confirmacion oficial, y no se puede asumir calidad en castellano.
- Restricciones de licencia: la model card contiene el texto `licence: license` como marcador de posicion, por lo que no existe una licencia efectiva publicada. Esto impide el uso comercial con garantias juridicas.
- Caveat de produccion: el modelo no tiene descargas ni validacion externa, la model card es una plantilla autogenerada y no se han publicado evaluaciones. No se recomienda su uso en sistemas de produccion que afecten a usuarios finales.
- Caveat de despliegue: no se distribuyen pesos en GGUF ni cuantizaciones listas para llama.cpp u Ollama; habria que generarlas.
- Caveat de almacenamiento: el repositorio de 2,3 GB es desproporcionado frente a los 78 MB de pesos en bfloat16, lo que sugiere artefactos de entrenamiento adicionales que conviene inspeccionar.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/francesca9805/jpn-jpan-10mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed455
- Modelo base: https://huggingface.co/francesca9805/jpn-jpan-10mb-ppt-Dp-100mb-packed-bfdiso_seed455
- Variante relacionada: https://huggingface.co/francesca9805/jpn-jpan-10mb-after-ppt-Dp-10mb-packed-ckpt500_seed455
- Variante relacionada: https://huggingface.co/francesca9805/jpn-jpan-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Variante relacionada: https://huggingface.co/francesca9805/jpn-jpan-100mb-ppt-Dp-10mb-packed-bfd_seed455
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/1pqfokos
- Repositorio de TRL: https://github.com/huggingface/trl
- Ficha en LLM Explorer: https://llm-explorer.com/model/francesca9805%2Fjpn-jpan-100mb-ppt-Dp-10mb-packed-bfd_seed10,eWZY8MrE1AYkahbauyK4R
- Ficha en FriendliAI: https://friendli.ai/models/francesca9805/jpn-jpan-100mb-ppt-Dp-10mb-packed-bfd_seed455
