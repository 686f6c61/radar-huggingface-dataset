# francesca9805/ppt-wc-uniform-newlex-nor-before-100mb-packed-bfd_seed455

## Resumen

Este checkpoint, identificado como `francesca9805/ppt-wc-uniform-newlex-nor-before-100mb-packed-bfd_seed455`, es un ajuste fino (SFT) del modelo `goldfish-models/eng_latn_100mb`, un modelo monolingüe de tipo GPT-2 entrenado con un presupuesto de 100 MB de texto. El resultado es un modelo de 86.508.288 parámetros (unos 86,5 millones), con pesos en formato safetensors y compatibles con la librería Transformers. Se trata de un artefacto experimental de investigación, no de un modelo orientado a producción.

El nombre del repositorio apunta a un estudio controlado sobre tokenización y léxico ("newlex", "uniform", "before-100mb", "packed", "bfd", "seed455") dentro del proyecto de W&B `f-padovani-university-of-groningen/new-tokenizers`, vinculado a la Universidad de Groningen. El sufijo "nor" sugiere un componente noruego, pero el modelo base declarado es de inglés latino (`eng_latn`), una discrepancia que conviene verificar antes de reutilizar el checkpoint. La ficha del autor es una plantilla autogenerada por TRL, sin descripción de datos, idiomas ni evaluación.

Su relevancia es acotada y metodológica: sirve para estudiar el efecto de decisiones de tokenizador y de presupuesto de datos en modelos pequeños, y para reproducir experimentos comparables con otras semillas (`seed99`, `seed455`) y otros idiomas (variantes `nld`, `jpn`, `eng`). No hay descargas ni valoraciones registradas, ni licencia explícita, por lo que su uso comercial queda en un limbo legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (etiqueta `gpt2` en el repo) |
| Parametros totales | 86.508.288 (~86,5 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la arquitectura base GPT-2 suele usar 1024 tokens, sin confirmar en este checkpoint) |
| Tipos de cuantizacion | no disponible en el repo; al ser un modelo pequeno admite cuantizacion INT8/INT4 tras conversion a GGUF o bitsandbytes |
| Idiomas soportados | no disponible; el modelo base es ingles latino (`eng_latn`), el nombre incluye `nor` (posible noruego) sin confirmar |
| Licencia | no disponible; la model card contiene el marcador de posicion `licence: license`, sin texto legal |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 0,2 GB |
| Modelo base | goldfish-models/eng_latn_100mb |
| Metodo de ajuste | SFT con TRL 0.23.0 |
| Fecha de creacion | 2026-09-23 (segun metadatos del repo) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia GPT-2, reutilizada por el proyecto Goldfish para modelos monolingües de presupuesto reducido. Con 86,5 millones de parámetros, el modelo queda por debajo de GPT-2 small (124 M), lo que sugiere una configuracion mas estrecha o un vocabulario distinto, coherente con el enfoque experimental sobre tokenizadores del proyecto `new-tokenizers`. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni tamano de vocabulario en la informacion proporcionada.

El entrenamiento consistio en un ajuste supervisado (SFT) sobre `goldfish-models/eng_latn_100mb` usando TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. La ejecucion esta registrada en Weights & Biases bajo el proyecto `new-tokenizers` de la Universidad de Groningen, con el identificador de run `ty1ber9e`. No se especifican el corpus de ajuste, el numero de tokens vistos, la composicion del dataset, ni si hubo fases posteriores de RLHF o DPO. Tampoco se documentan innovaciones de decodificacion (especulativa, atencion lineal, etc.). El nombre del checkpoint indica variantes sobre empaquetado de secuencias ("packed"), tokenizacion uniforme y un lexico nuevo, pero son etiquetas experimentales cuyo detalle tecnico no acompana al repositorio.

## Capacidades

- Generacion de texto autoregresiva basica, limitada por un modelo de ~86,5 M de parametros y un presupuesto de datos de 100 MB.
- Conversacion de un solo turno mediante la interfaz de chat del pipeline de Transformers (el ejemplo de la model card pasa una lista con el rol `user`).
- Continuacion de texto y modelado de lenguaje general.
- Capacidades multilingues: no confirmadas; el modelo base es de ingles y el nombre del checkpoint sugiere un posible componente noruego.
- Tool calling / function calling: no disponible, no documentado.
- Uso como agente o razonamiento multi-paso: no disponible, no documentado.
- Modo "thinking", vision o audio: no disponible, no documentado.
- Uso previsto realista: experimentacion controlada sobre tokenizacion y comparacion entre semillas e idiomas.

## Casos de uso

- Reproducibilidad de experimentos de tokenizacion: el checkpoint forma parte de una familia con semillas fijas (`seed455`, `seed99`) e idiomas distintos (`eng`, `nld`, `jpn`), lo que permite aislar el efecto del tokenizador o del lexico sobre la perplejidad en un presupuesto fijo de 100 MB.
- Estudio de leyes de escala en regimen de datos escaso: con 86,5 M de parametros y 100 MB de texto, sirve como punto de comparacion de bajo coste frente a modelos mayores entrenados con mas datos.
- Generacion de texto de relleno o sintetico en ingles: util para pruebas de integracion de pipelines, generacion de datos de baja fidelidad o simulacion de cargas en un servidor de inferencia.
- Prototipado rapido en CPU o portatil: al ocupar menos de 350 MB en FP32, se puede cargar y ejecutar en cualquier equipo sin GPU para validar flujos de `transformers.pipeline`.
- Pruebas de despliegue ligero: sirve para verificar configuraciones de Text Generation Inference (el repo lleva la etiqueta `text-generation-inference`) o de endpoints compatibles antes de pasar a modelos grandes.
- Docencia y practicas de ajuste fino: es un candidato idoneo para ejercicios de SFT con TRL por su tamano reducido y su tiempo de entrenamiento bajo.
- Analisis de sesgos y comportamiento de modelos pequenos: permite estudiar que tipo de texto genera un modelo entrenado con un corpus muy limitado y un vocabulario experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada solo para pesos: ~346 MB en FP32, ~173 MB en FP16/BF16, ~87 MB en INT8 y ~43 MB en INT4 (calculado sobre 86.508.288 parametros; hay que anadir activaciones, cache KV y overhead del runtime).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no se requiere A100, H100 ni similar. Una RTX 4090 resulta enormemente sobredimensionada.
- GPU consumer: si, cabe holgadamente en cualquier GPU consumer actual e incluso en GPUs integradas y en dispositivos moviles tras conversion a GGUF.
- CPU: inferencia viable en CPU sin aceleracion por hardware, dado el tamano.
- Opciones de despliegue: pipeline de Transformers (documentado por el autor), Text Generation Inference (etiqueta del repo), endpoints compatibles, y conversion a GGUF para llama.cpp u Ollama. vLLM es tecnicamente posible pero poco justificable por escala.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

No se dispone de resultados de evaluacion de este checkpoint, por lo que la comparacion se limita a parametros, contexto y licencia. Los datos de los modelos alternativos proceden de sus especificaciones publicas conocidas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| francesca9805/ppt-wc-uniform-newlex-nor-before-100mb-packed-bfd_seed455 | 86,5 M | no disponible | no disponible | HuggingFace, 0 descargas |
| gpt2 (OpenAI) | 124 M | 1024 tokens | licencia MIT modificada de OpenAI | ampliamente disponible |
| distilgpt2 | 82 M | 1024 tokens | Apache-2.0 | ampliamente disponible |
| Pythia-70M (EleutherAI) | 70 M | 2048 tokens | Apache-2.0 | ampliamente disponible |
| goldfish-models/eng_latn_100mb (modelo base) | no disponible | no disponible | no disponible | HuggingFace |

Comparativa de rendimiento: no disponible, al no existir benchmarks publicados para este checkpoint.

## Limitaciones y advertencias

- Ausencia de licencia: la model card contiene `licence: license` como marcador de posicion. Sin un texto legal explicito, no hay autorizacion clara para uso comercial ni para redistribucion. Conviene contactar con el autor antes de cualquier despliegue.
- Riesgo alto de alucinacion y de texto incoherente: un modelo de ~86,5 M de parametros entrenado con 100 MB de texto no puede sostener la coherencia, el conocimiento factual ni el seguimiento de instrucciones de modelos actuales.
- Idiomas inciertos: el nombre del checkpoint incluye `nor` mientras que el modelo base es `eng_latn`; no esta claro en que idioma se ajusto ni cual domina la salida.
- Sesgos desconocidos: no se documenta la composicion del corpus de ajuste, por lo que no se puede evaluar que sesgos introduce ni como se distribuyen.
- Contexto limitado: si hereda la configuracion GPT-2 estandar, la ventana maxima rondaria los 1024 tokens, insuficiente para dialogos largos o documentos extensos.
- Sin benchmarks ni evaluacion: no hay MMLU, HumanEval, GSM8K ni ninguna otra metrica publicada, asi que no se puede comparar objetivamente con alternativas.
- Cero adopcion: 0 descargas y 0 likes indican que el checkpoint no ha sido validado por terceros.
- Naturaleza experimental: los identificadores del nombre (`before-100mb`, `packed`, `bfd`, `uniform`) sugieren un artefacto intermedio de una investigacion, no una version estable ni final.
- No apto para produccion: no soporta tool calling, agentes, vision ni modos de razonamiento, y no esta disenado para tareas de fiabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-nor-before-100mb-packed-bfd_seed455
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/ty1ber9e
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante en neerlandes (referencia de la familia): https://llm-explorer.com/model/fpadovani%2Fppt-wc-uniform-newlex-nld-100mb_seed455,7gXE9jhVoWZFZsosJUKw99
- Variante en ingles (referencia de la familia): https://llm-explorer.com/model/fpadovani%2Fppt-wc-uniform-newlex-eng-100mb_seed455,3bdinHCPwUWhNFdcRvqoLP
- Variante en japones (referencia de la familia): https://huggingface.co/fpadovani/ppt-wc-uniform-newlex-jpn-100mb_seed455
- Variante con semilla 99: https://huggingface.co/fpadovani/ppt-wc-uniform-newlex-eng-100mb_seed99/tree/main
- Pagina en FriendliAI de una variante relacionada: https://friendli.ai/models/fpadovani/ppt-wc-uniform-newlex-eng-100mb_seed99
