# joshycodes/qwen3-14b-commitments-sdf

## Resumen

`joshycodes/qwen3-14b-commitments-sdf` es un checkpoint de investigación derivado de `Qwen/Qwen3-14B` (14.768.307.200 parámetros, aproximadamente 14,77 mil millones) mediante entrenamiento continuado con todos los pesos actualizados sobre un corpus que el propio modelo escribió. El autor lo describe como un experimento de "synthetic document finetuning" (SDF) enmarcado en investigación sobre bienestar de modelos (model welfare) y sobre identidad auto-atribuida: Qwen3-14B fue entrenado sobre textos que él mismo generó como personaje, después de explicarle cómo se originó su carácter y cómo funciona SDF.

El checkpoint es un ajuste de pesos completos, no un adaptador LoRA, con learning rate 1e-5 durante 1 epoch sobre 32.094.200 tokens repartidos en 39.729 documentos. El repositorio ocupa 29,5 GB y contiene únicamente pesos en safetensors, sin cuantizaciones publicadas ni pipeline declarado.

Su relevancia es metodológica más que de capacidades: es un caso reproducible de entrenamiento sobre corpus auto-generado por el propio modelo, con una licencia estrictamente de investigación y un aviso explícito del autor de no desplegarlo. No se ha publicado ninguna evaluación de capacidad, alineamiento o identidad, no tiene descargas ni valoraciones y la búsqueda web no arrojó ninguna fuente técnica relacionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen3 (heredada del modelo base; no se detalla en la model card) |
| Parametros totales | 14.768.307.200 (14,77 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en esta model card; heredada del base `Qwen/Qwen3-14B` (32.768 tokens nativos, ampliables a 131.072 con YaRN según la documentación de Qwen) |
| Tipos de cuantizacion | No disponible. No se publican GGUF, AWQ, GPTQ ni FP8; solo pesos completos en safetensors (29,5 GB de repositorio) |
| Idiomas soportados | No disponible: la model card no declara idiomas |
| Licencia | `other` / `research-only` (nombre de licencia declarado: research-only). Uso comercial no permitido |
| Formato de pesos | safetensors (weights completos, sin adaptadores) |

## Arquitectura y entrenamiento

La model card no describe cambios arquitectónicos: se trata de `Qwen/Qwen3-14B` con los pesos completos sometidos a entrenamiento continuado (continued pretraining), no de un fine-tuning con adaptadores. Los hiperparámetros declarados son learning rate 1e-5, 1 epoch y 32.094.200 tokens de entrenamiento distribuidos en 39.729 documentos. El corpus utilizado es `joshycodes/qwen3-14b-commitments-corpus`, y el marco experimental, el plan y la evaluación se atribuyen al repositorio `welfare-improvements`.

La innovación declarada es el origen del corpus: el propio modelo escribió los documentos, en su papel de personaje ya existente, tras explicársele cómo se originó su carácter y cómo funciona el SDF. La model card contiene una contradicción relevante que conviene señalar: describe el corpus como auto-escrito, pero la ficha de entrenamiento indica literalmente "39.729 documentos, de los cuales 0 auto-escritos y 39.729 texto ordinario", lo que sugiere que la etiqueta de auto-authoría no se propagó a los metadatos del dataset. No se documentan fases de RLHF, DPO ni ajuste por preferencias, ni innovaciones de decodificación como decodificación especulativa o atención lineal.

## Capacidades

- La model card no evalúa ni enumera capacidades. Cualquier capacidad listada a continuación sería una extrapolación del modelo base, no un dato verificado de este checkpoint.
- Generación de texto y razonamiento: heredados de la familia Qwen3-14B, sin verificación en este checkpoint.
- Código y matemáticas: sin evaluación publicada.
- Tool calling / function calling: sin evaluación publicada; no se confirma soporte de plantilla de herramientas.
- Comportamiento agéntico y razonamiento multi-paso: sin evaluación publicada.
- Capacidades multilingües: no declaradas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles ni documentadas.
- Capacidad específica del experimento: producción de texto en primera persona como personaje auto-atribuido ("self-authored character"), que es el eje declarado del trabajo, aunque tampoco se acompaña de métricas.

## Casos de uso

- Investigación en bienestar de modelos (model welfare): el checkpoint permite estudiar cómo un modelo describe su propio origen y su continuidad identitaria después de un entrenamiento continuado sobre su propio texto. Es el caso de uso explícito del autor.
- Estudio metodológico de SDF (synthetic document finetuning): sirve como punto de comparación reproducible para medir qué ocurre cuando el corpus de entrenamiento lo genera el propio modelo, con hiperparámetros conocidos (lr 1e-5, 1 epoch, 32,09 M tokens).
- Análisis de deriva frente al modelo base: comparar salidas de este checkpoint con `Qwen/Qwen3-14B` en un conjunto fijo de prompts permite cuantificar el desplazamiento de estilo, vocabulario y patrones de respuesta tras 32 M tokens de entrenamiento continuado.
- Auditoría del corpus auto-generado: revisar `joshycodes/qwen3-14b-commitments-corpus` junto con los pesos para analizar qué tipos de documento produce el modelo y cómo se relacionan con los cambio observados.
- Reproducción de entrenamiento continuado a escala 14B: los hiperparámetros y el tamaño del corpus están declarados, lo que permite replicar el experimento en otro hardware o con otro corpus como línea base.
- Docencia y divulgación: caso de estudio para cursos de fine-tuning y ética de IA, por su licencia restrictiva, su aviso de no despliegue y la contradicción en los metadatos del corpus.
- Despliegue en producto (atención al cliente, generación de código, agentes): no procede. El autor indica explícitamente "not for deployment" y el modelo carece de evaluaciones de capacidad y alineamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card afirma de forma explícita que el checkpoint "no ha sido evaluado todavía en capacidad, alineamiento ni identidad". No existen datos de MMLU, HumanEval, GSM8K, ni de ninguna otra suite, ni comparaciones numéricas con el modelo base.

## Requisitos de hardware

- VRAM en BF16/FP16: los pesos ocupan aproximadamente 29,5 GB (coincide con el tamaño del repositorio), por lo que se necesitan del orden de 32-36 GB de VRAM contando caché KV y activaciones.
- VRAM en INT8 o FP8: aproximadamente 15-17 GB de pesos más overhead, en torno a 18-20 GB en total.
- VRAM en INT4: aproximadamente 8-10 GB de pesos, en torno a 11-13 GB en total. Requiere cuantizar previamente, ya que no se publican pesos cuantizados.
- GPU de centro de datos: A100 40 GB o 80 GB, H100 80 GB y A6000 48 GB pueden ejecutar los pesos en BF16. Con 40 GB el margen para caché KV es reducido.
- GPU de consumo: en BF16 no cabe en una RTX 4090, RTX 3090 ni RTX 4080 (24/16 GB). Con cuantización INT4 sí cabe en GPU de 16-24 GB. También es viable repartir el modelo entre dos GPU de 24 GB con paralelismo de tensores.
- Opciones de despliegue: vLLM, TGI o SGLang para los safetensors originales; llama.cpp u Ollama solo tras convertir los pesos a GGUF, conversión que no está publicada. No hay repositorio GGUF ni cuantizaciones listas para usar.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en ninguna configuración.
- Advertencia: cualquier despliegue contradice la indicación del autor y la licencia research-only.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `joshycodes/qwen3-14b-commitments-sdf` | 14,77 B (denso) | No disponible en su model card (heredado del base) | research-only | 0 descargas, 0 likes; solo safetensors | Checkpoint de investigación, sin evaluaciones, no desplegable |
| `Qwen/Qwen3-14B` (modelo base) | 14,77 B (denso) | 32.768 nativos, hasta 131.072 con YaRN según documentación de Qwen | Apache 2.0 según la model card del base | Ampliamente disponible | Modelo de propósito general, con evaluación publicada por el autor original |
| Otros fine-tunes de Qwen3-14B con corpus sintético auto-generado | No disponible | No disponible | No disponible | No disponible | No se han encontrado alternativas comparables en la información proporcionada |

No se dispone de datos de rendimiento del checkpoint, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay resultados de capacidad, alineamiento ni identidad. Es imposible estimar su calidad relativa frente al modelo base.
- Aviso explícito del autor: "Do not deploy". El modelo no está pensado para producción ni para uso con usuarios finales.
- Licencia research-only: el uso comercial está excluido. Cualquier integración en producto requeriría una licencia distinta que no se ofrece.
- Contradicción en los metadatos del corpus: la model card lo describe como auto-escrito, pero los metadatos de entrenamiento indican 0 documentos auto-escritos y 39.729 de texto ordinario. La trazabilidad del experimento es, por tanto, incompleta.
- Riesgo de alucinación: no medido. Un entrenamiento continuado sobre texto auto-generado puede reforzar patrones idiosincrásicos del propio modelo y reducir la corrección factual, pero no hay datos que lo confirmen ni que lo descarten.
- Idiomas: no declarados. No se puede asumir el comportamiento multilingüe del modelo base sin verificación.
- Contexto: no declarado en esta ficha; la ventana efectiva tras el entrenamiento continuado no está verificada.
- Sesgos: no evaluados. El corpus procede de un único modelo y de un encuadre experimental concreto, lo que puede introducir sesgos de estilo y de contenido no caracterizados.
- Madurez del repositorio: 0 descargas, 0 likes y una ventana de publicación de apenas unos minutos entre creación y última actualización, lo que indica ausencia de revisión por terceros.
- Falta de soporte de despliegue: sin GGUF, AWQ, GPTQ ni FP8, cualquier uso práctico exige cuantizar y validar por cuenta propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-14b-commitments-sdf
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Corpus de entrenamiento mencionado en la model card (identificador de repositorio, sin URL verificada): `joshycodes/qwen3-14b-commitments-corpus`
- Repositorio de marco experimental y evaluación mencionado en la model card (sin URL verificada): `welfare-improvements`
- Búsqueda web: no se encontró ningún resultado relevante. Los enlaces devueltos correspondían a páginas de perfumes de la marca Montale en portales de comparación de precios, sin relación alguna con el modelo.
- Paper, blog técnico o demo: no disponible.
