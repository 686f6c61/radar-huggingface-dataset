# francesca9805/tur-latn-100mb-ppt-Dp-10mb-packed-bfd_seed10

## Resumen

`francesca9805/tur-latn-100mb-ppt-Dp-10mb-packed-bfd_seed10` es un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/tur_latn_100mb`, desarrollado por el usuario de HuggingFace `francesca9805` (vinculado a la Universidad de Groningen segun la URL del run de Weights & Biases). El modelo conserva la arquitectura GPT-2 del modelo base, un transformer decoder-only denso de 124.770.816 parametros, y se ha entrenado mediante SFT con la libreria TRL 0.23.0.

El modelo base pertenece a la familia Goldfish, un conjunto de modelos GPT-2 entrenados especificamente para lenguas de bajos recursos con volumenes controlados de datos (en este caso, turco en alfabeto latino con aproximadamente 100 MB de corpus). El nombre del ajuste (`ppt-Dp-10mb-packed-bfd_seed10`) sugiere un experimento academico sobre tokenizacion, empaquetado de secuencias y regimenes de dropout, mas que un modelo orientado a producto.

Su relevancia es fundamentalmente experimental: sirve para estudiar como afectan las decisiones de preprocesado y tokenizacion al rendimiento en turco, y como punto de partida reproducible para ablaciones comparables. No es un modelo con benchmarks publicados, licencia declarada ni garantias de calidad en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 |
| Parametros totales | 124.770.816 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Turco en alfabeto latino (inferido del modelo base `tur_latn_100mb`; no confirmado en la model card) |
| Licencia | no disponible (la model card incluye un campo placeholder `licence: license`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2: un transformer decoder-only con atencion causal completa, normalizacion tipo LayerNorm pre-entrenamiento y embeddings de tokens y posiciones aprendidos. Con 124.770.816 parametros, el modelo se situa practicamente en el mismo orden de magnitud que GPT-2 small (124M), aunque el vocabulario de la familia Goldfish suele estar reentrenado para el idioma objetivo. No se dispone de informacion sobre el numero de capas, cabezas de atencion ni dimension oculta, por lo que esos detalles quedan sin confirmar.

El entrenamiento se realizo con SFT (supervised fine-tuning) usando TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. El autor enlaza un run de Weights & Biases bajo el proyecto `new-tokenizers`, lo que apunta a un experimento centrado en tokenizacion y preprocesado de datos: el sufijo del nombre alude a "packed" (empaquetado de secuencias), un tamano de 10 MB y una semilla concreta (`seed10`). No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto autoregresiva basica, en linea con un modelo GPT-2 de 124M de parametros.
- Continuacion de prompt y respuesta a instrucciones sencillas, dado el ajuste con SFT.
- Soporte de conversaciones de un solo turno a traves del pipeline de `text-generation` con mensajes con rol de usuario.
- Capacidad multilingue limitada: el modelo base esta especializado en turco con alfabeto latino; el prompt de ejemplo de la model card esta en ingles, pero no hay evidencia de que el ajuste mantenga competencia solida en ingles.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, razonamiento multi-paso, modo "thinking", vision, audio ni ninguna capacidad multimodal.
- Compatible con Text Generation Inference (TGI) y con endpoints de HuggingFace, segun los tags del repositorio.

## Casos de uso

- Experimentacion academica sobre tokenizacion: el nombre del modelo indica un barrido sobre tokenizadores y empaquetado de datos; puede usarse como punto de comparacion reproducible frente a otras variantes con la misma semilla y el mismo corpus.
- Generacion de texto en turco para prototipos: util para validar rapidamente una interfaz de generacion de texto en turco sin coste de GPU, ya que 124M de parametros caben en cualquier equipo.
- Continuacion de texto y autocompletado de frases en turco en aplicaciones de demostracion, aceptando una calidad limitada y necesidad de revision humana.
- Base para ajustes posteriores especificos de dominio: al ser un modelo pequeno, el coste de un segundo fine-tuning sobre un corpus turco especializado (legal, sanitario, educativo) es muy bajo.
- Analisis de sesgos y comportamiento de modelos pequenos multilingues: sirve como sujeto de estudio en trabajos sobre representacion de lenguas de bajos recursos.
- Generacion de datos sinteticos de bajo coste en turco para aumentar corpus de experimentos, siempre con filtrado y validacion posteriores.
- Docencia y practicas de ingenieria de modelos: permite ilustrar de extremo a extremo el flujo de TRL, Transformers y despliegue en TGI o endpoints de HuggingFace con un modelo que entrena e infiere en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra evaluacion cuantitativa, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada en inferencia: aproximadamente 0,25 GB en FP16 y 0,5 GB en FP32 para los pesos; con estados de activacion y cache KV, el consumo real se mantiene por debajo de 1 GB en la mayoria de configuraciones.
- Cuantizacion a int8 reduciria los pesos a unos 0,12 GB y a 4 bits a unos 0,07 GB, aunque no hay ficheros cuantizados publicados por el autor.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; tambien tarjetas de gama de entrada y GPUs integradas con suficiente memoria compartida.
- Cabe en GPU consumer sin ninguna dificultad y tambien en CPU: es viable la inferencia en un portatil sin GPU dedicada.
- Opciones de despliegue: Transformers con el pipeline `text-generation`, Text Generation Inference (TGI) y endpoints de HuggingFace, segun los tags del repositorio. La conversion a GGUF para llama.cpp u Ollama es tecnicamente posible por tratarse de una arquitectura GPT-2, pero no hay artefactos publicados.
- Latencia y throughput: no disponibles. Con 124M de parametros se espera un throughput alto en GPU, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `francesca9805/tur-latn-100mb-ppt-Dp-10mb-packed-bfd_seed10` | 124.770.816 | no disponible | no disponible | HuggingFace, safetensors | Ajuste SFT con TRL; sin benchmarks |
| `goldfish-models/tur_latn_100mb` | no disponible en la informacion proporcionada | no disponible | no disponible | HuggingFace | Modelo base de la familia Goldfish para turco (latn) con ~100 MB de corpus |
| `openai-community/gpt2` | ~124M (informacion publica, no procedente de esta ficha) | 1024 (informacion publica) | Licencia modificada de MIT (informacion publica) | HuggingFace, safetensors | Referencia arquitectonica; entrenado predominantemente en ingles |

No se dispone de datos de rendimiento comparado entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a aspectos estructurales y de disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse sobre un corpus turco de aproximadamente 100 MB, es probable que herede sesgos del corpus, pero no hay analisis publicado.
- Riesgo de alucinacion: elevado en terminos relativos, como en cualquier GPT-2 de 124M ajustado con SFT; no debe usarse para generar informacion factual sin verificacion.
- Limitaciones de contexto e idioma: la longitud de contexto no esta declarada y el modelo solo tiene cobertura demostrada en turco con alfabeto latino; su comportamiento en castellano, ingles u otras lenguas no esta documentado.
- Restricciones de licencia: la licencia figura como placeholder (`licence: license`) y no se especifica en el repositorio. No se debe asumir uso comercial permitido hasta que el autor lo aclare, y conviene revisar tambien la licencia del modelo base `goldfish-models/tur_latn_100mb`.
- Caveat de produccion: el repositorio tiene 0 descargas y 0 "likes", esta creado y actualizado en el mismo dia y no incluye evaluacion ni documentacion de datos de entrenamiento; se trata de un artefacto de investigacion, no de un modelo listo para produccion.
- Ausencia de benchmarks: no hay ninguna metrica publicada, por lo que no es posible estimar su calidad frente al modelo base ni frente a alternativas.
- Trazabilidad de datos: se desconoce la composicion del dataset de ajuste y si hubo deduplicacion o filtrado de contenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/tur-latn-100mb-ppt-Dp-10mb-packed-bfd_seed10
- Modelo base: https://huggingface.co/goldfish-models/tur_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/gcy9bp5n
- Organizacion Goldfish Models: https://huggingface.co/goldfish-models
