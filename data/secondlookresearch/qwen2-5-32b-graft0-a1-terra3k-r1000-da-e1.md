# SecondLookResearch/Qwen2.5-32B-graft0-a1-terra3k-r1000-da-e1

## Resumen

Qwen2.5-32B-graft0-a1-terra3k-r1000-da-e1 es un adaptador LoRA de tipo PEFT publicado por SecondLookResearch sobre el modelo base Qwen/Qwen2.5-32B. No es un modelo completo: el repositorio (2,2 GB) contiene unicamente los pesos del adaptador en safetensors, con rango 64 y alpha 128, aplicados exclusivamente a las capas lineales. Se trata de un artefacto de investigacion, con 8 descargas y 0 likes en el momento de la consulta, y sin model card mas alla de la receta de entrenamiento.

El adaptador forma parte de una escalera experimental ("terra 3k ladder") en la que se entrenan distintos "peldaños" variando el numero de filas del dataset. En concreto, este corresponde al peldaño de 1000 filas, entrenado durante 1 epoca desde cero, sobre una plataforma denominada graft0-a1. La receta indica que el adaptador se entrena como adaptador nuevo (fresh) sobre un adaptador A1 ya fusionado y congelado, y que en inferencia deben servirse dos adaptadores apilados sobre la base parcheada: primero A1 y despues este.

Su relevancia es metodologica mas que de producto: documenta una tecnica de composicion de adaptadores en dos etapas y de bajo coste de almacenamiento (2,2 GB frente a los decenas de GB del modelo base), y sirve para estudiar como escala el comportamiento aprendido en funcion del tamano del conjunto de datos. Al carecer de licencia declarada, de benchmarks publicados y de pipeline definido, no es un candidato para produccion sin una evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso decoder-only (Qwen2.5-32B) |
| Parametros totales | Aproximadamente 537 M parametros entrenables en el adaptador (estimacion derivada); el modelo base tiene 32.500 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 131.072 tokens heredada del modelo base; no especificada en la ficha del adaptador |
| Tipos de cuantizacion | Adaptador: safetensors en precision completa (sin cuantizar). Modelo base: GPTQ, AWQ, GGUF y bitsandbytes NF4/Int8 |
| Idiomas soportados | No disponible en la ficha del adaptador; hereda los del modelo base (multilingue, con foco en ingles y chino) |
| Licencia | No disponible. El modelo base Qwen2.5-32B se distribuye bajo licencia Apache 2.0, pero esto no se declara para el adaptador |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

Datos adicionales del repositorio: 2,2 GB de tamano, libreria `peft`, creado el 2026-09-26 y actualizado el mismo dia, sin pipeline de inferencia declarado y con `region:us` como unico tag geografico.

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-32B, un transformer denso decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings RoPE y atencion por consultas agrupadas (GQA) con 40 cabezas de consulta y 8 de clave/valor. La configuracion de LoRA declarada es rango 64 y alpha 128 (`r64/a128`), restringida a capas lineales, es decir, sin adaptadores en embeddings ni en la cabeza de salida. Con las dimensiones del modelo base (hidden 5120, intermedio 27648, 64 capas), una LoRA lineal completa de rango 64 implica del orden de 537 M parametros entrenables; esta cifra es una estimacion derivada de la receta publicada y no un dato aportado por el autor.

La receta de entrenamiento es inusual y esta descrita de forma muy compacta: 1 epoca "from scratch" sobre un total de 1000 filas del dataset "terra 3k" (una escalera de dificultad de consejo dificil, "difficult advice"), con calentamiento del 5 % de los pasos y un minimo de 2 pasos. Las filas son un prefijo con semilla 0 del mismo barajado utilizado en los demas peldaños de la escalera, y la validacion usa el fichero `terra3k-val-qwen25.jsonl`. El punto clave es que este adaptador no se entrena sobre la base limpia, sino como adaptador nuevo sobre un adaptador A1 previamente fusionado y congelado (plataforma `graft0-a1`); por tanto, el comportamiento final depende de la composicion de ambos adaptadores y no puede reproducirse cargando solo este repositorio.

No se documentan innovaciones de decodificacion (atencion lineal, decodificacion especulativa), ni detalles del dataset de preentrenamiento del modelo base, ni si hubo RLHF o DPO en esta etapa. La model card unicamente indica como servir el resultado: dos adaptadores sobre la base parcheada, con A1 en primer lugar, mediante el script `code/msm_eval/serve_reconstructed.sh` con las variables `ARM`, `ROW_PATCH=1` y `ADAPTERS`.

## Capacidades

- Generacion de texto en el modelo base; el adaptador no anade capacidades nuevas de modalidad, sino que ajusta el comportamiento conversacional hacia el corpus de "consejo dificil".
- Razonamiento y matematicas basicas heredados del modelo base Qwen2.5-32B; no hay evaluacion especifica para este adaptador.
- Generacion de codigo heredada del modelo base; no se documenta ningun ajuste especifico sobre codigo.
- Soporte de tool calling y function calling: no confirmado en el adaptador; Qwen2.5 lo soporta de forma nativa en las variantes Instruct, pero este adaptador se entrena sobre la variante base.
- Soporte de agentes y razonamiento multi-paso: no documentado para este adaptador.
- Capacidades multilingues: no declaradas en la ficha; dependen del modelo base.
- Capacidad especial: composicion en dos etapas de adaptadores LoRA (A1 mas el adaptador actual) sobre una base parcheada, que es en si misma la contribucion tecnica del artefacto.
- Modo "thinking" o vision: no disponible.

## Casos de uso

- Investigacion en alineacion de comportamiento: el adaptador permite estudiar como un corpus pequeno (1000 filas) especializado en dar "consejo dificil" modifica el estilo y las decisiones del modelo base, comparando contra los demas peldaños de la escalera terra 3k.
- Reproduccion de estudios de escalado de datos: al compartir barajado con semilla 0 y usar un unico epoch, el peldaño r1000 sirve como punto de la curva "rendimiento frente a numero de filas", util para articular leyes de escalado en ajuste fino con LoRA.
- Servicio de un asistente de orientacion etica o consejo aplicado: con el apilado A1 mas este adaptador puede desplegarse un asistente conversacional de dominio estrecho, siempre que se acepte que es un artefacto de investigacion sin evaluacion publica.
- Composicion de adaptadores en produccion de bajo coste: demuestra el patron de entrenar adaptadores nuevos sobre adaptadores ya fusionados y congelados, lo que reduce el almacenamiento (2,2 GB por adaptador) frente a mantener copias completas del modelo de 32B.
- Experimentos de interpretabilidad de pesos PEFT: al ser una LoRA lineal de rango 64, permite analizar que subespacios de las proyecciones q, k, v, o, gate, up y down se ven mas afectados por el corpus de entrenamiento.
- Base para nuevas etapas de ajuste: el adaptador puede fusionarse con la base y reutilizarse como plataforma congelada para entrenar un tercer adaptador, replicando el esquema graft0-a1 usado aqui.
- Validacion de infraestructura de servido multi-adaptador: sirve para probar si el stack de inferencia elegido permite apilar dos LoRA sobre la misma pasada, algo que la mayoria de servidores no soporta de forma nativa y que obliga a fusionar los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni tampoco del conjunto de validacion `terra3k-val-qwen25.jsonl` (perdida o exactitud). Tampoco se aportan comparaciones con el modelo base ni con otros peldaños de la escalera.

## Requisitos de hardware

- El adaptador por si solo requiere 2,2 GB en disco; la VRAM necesaria la determina integramente el modelo base Qwen2.5-32B.
- Inferencia en bf16/fp16 del modelo base: aproximadamente 65 GB de pesos, mas cache KV. Necesita 1x H100 80 GB, 1x A100 80 GB o 2x A100 40 GB.
- Inferencia en 8 bits: aproximadamente 35 GB, viable en 1x A100 40 GB o en 2x RTX 4090 de 24 GB con tensor parallelism.
- Inferencia en 4 bits (AWQ, GPTQ o bitsandbytes NF4): aproximadamente 18-20 GB, cabe en una RTX 4090 de 24 GB o en una L40S, con contexto reducido por el coste de la cache KV.
- Cabe en GPU de consumo (RTX 3090, 4090, 5090) unicamente con cuantizacion de 4 bits; en bf16 no cabe.
- Opciones de despliegue: transformers mas PEFT (adicion de adaptador en caliente), vLLM con soporte LoRA (`--enable-lora --max-lora-rank 64`), TGI con adaptadores, y llama.cpp u Ollama si se fusionan los adaptadores en la base y se convierte a GGUF.
- Advertencia de despliegue: la receta exige dos adaptadores apilados (A1 y este). La mayoria de servidores aplican un unico LoRA por peticion, por lo que en la practica conviene fusionar ambos en los pesos base y servir el modelo resultante.
- Latencia y throughput: no disponibles; no hay mediciones publicadas para este artefacto ni para el apilado concreto de adaptadores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Evaluacion publica |
|---|---|---|---|---|---|
| Este adaptador (r1000) | ~537 M entrenables sobre 32B | Heredado: 131.072 tokens | No disponible | 8 descargas, 0 likes | No |
| Qwen/Qwen2.5-32B (base) | 32.500 M densos | 131.072 tokens | Apache 2.0 | Muy alta | Si (informe tecnico Qwen2.5) |
| Qwen/Qwen2.5-32B-Instruct | 32.500 M densos | 131.072 tokens | Apache 2.0 | Muy alta | Si |
| Otros peldaños de la escalera terra 3k (mismo autor) | ~537 M por adaptador | Heredado | No disponible | Muy baja | No |

La comparacion con modelos alternativos de la misma categoria no es posible en terminos de rendimiento, porque este artefacto no reporta ninguna metrica. Funcionalmente, la alternativa directa es el propio Qwen2.5-32B-Instruct, que ofrece soporte de tool calling y de agentes documentado, mientras que este adaptador solo aporta un ajuste de comportamiento no medido y condicionado al apilado con A1.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica el regimen de uso, incluido el comercial, del adaptador. El hecho de que el modelo base sea Apache 2.0 no implica que lo sea el adaptador.
- Reproducibilidad incompleta: el propio autor indica que el adaptador se entrena sobre un A1 fusionado y congelado, y que debe servirse como segundo adaptador del apilado. Cargar solo este repositorio no reproduce el comportamiento descrito.
- Sin evaluacion: no hay benchmarks, curvas de perdida ni resultados de validacion sobre `terra3k-val-qwen25.jsonl`, por lo que no puede estimarse la ganancia frente al modelo base ni el riesgo de degradacion.
- Requisito de servido no estandar: son necesarios dos adaptadores apilados en una base parcheada; esto complica el despliegue en vLLM, TGI u Ollama, que aplican un unico adaptador por peticion.
- Especializacion estrecha: el entrenamiento se limita a 1000 filas de un corpus de "consejo dificil" durante 1 epoca, lo que puede sesgar el estilo y reducir el rendimiento generalista del modelo base.
- Riesgo de alucinacion y sesgos: presentes en el modelo base y no mitigados en esta etapa; el adaptador puede ademas reforzar sesgos propios del corpus de consejo.
- Idiomas: no se declara soporte multilingue para el adaptador; el corpus de ajuste parece en ingles (`terra3k-val-qwen25.jsonl`), lo que puede degradar el rendimiento en castellano respecto al modelo base.
- Contexto: aunque el modelo base soporta 131.072 tokens, no se documenta la longitud de secuencia usada en el entrenamiento del adaptador, por lo que el comportamiento en contextos largos es incierto.
- Metadatos atipicos: la fecha de creacion indicada es 2026-09-26, posterior al momento de la consulta; conviene verificar la integridad del repositorio antes de reutilizarlo.
- Perfil de adopcion minimo (8 descargas), sin issues ni discusion publica: no hay senales externas de validacion por parte de la comunidad.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/SecondLookResearch/Qwen2.5-32B-graft0-a1-terra3k-r1000-da-e1
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-32B
- Informe tecnico de Qwen2.5 (referencia externa, arXiv 2412.15115): https://arxiv.org/abs/2412.15115
- Repositorio de PEFT (referencia externa): https://github.com/huggingface/peft
- Documentacion de LoRA en vLLM (referencia externa): https://docs.vllm.ai/en/latest/features/lora.html
- No se han proporcionado enlaces adicionales (paper, blog, demo, repositorio de codigo del script `serve_reconstructed.sh`) en la informacion disponible.
