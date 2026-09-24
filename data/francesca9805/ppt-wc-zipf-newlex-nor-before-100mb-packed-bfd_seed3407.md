# francesca9805/ppt-wc-zipf-newlex-nor-before-100mb-packed-bfd_seed3407

## Resumen

El modelo `ppt-wc-zipf-newlex-nor-before-100mb-packed-bfd_seed3407` es un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/eng_latn_100mb`, desarrollado por el usuario de HuggingFace `francesca9805`, presumiblemente vinculado al grupo de investigacion de F. Padovani en la Universidad de Groningen (los registros de Weights & Biases apuntan a ese espacio de trabajo). Se trata de un modelo pequeno de generacion de texto, con 86.508.288 parametros totales (unos 86,5 millones), construido sobre la arquitectura GPT-2 y entrenado mediante SFT con la libreria TRL.

El nombre del repositorio sugiere un experimento de investigacion sobre tokenizacion y lexicografia: la cadena `ppt-wc-zipf-newlex` apunta a metricas de frecuencia de palabras y ley de Zipf, `nor-before` a un idioma noruego en una fase previa, y `100mb-packed-bfd_seed3407` a un corpus de entrenamiento empaquetado de 100 MB con una semilla fija. Es un modelo de proposito experimental mas que de produccion, con 0 descargas y 0 "likes" en el momento de la consulta, lo que refuerza su caracter de artefacto de investigacion.

Su relevancia es acotada: sirve como referencia para estudiar como los ajustes de tokenizacion y composicion lexica afectan al comportamiento de modelos muy pequenos entrenados sobre corpus minusculos. No es un modelo competitivo en tareas generales de razonamiento o codigo, sino una pieza de un estudio comparativo de variantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en GPT-2 (tag `gpt2`) |
| Parametros totales | 86.508.288 (~86,5 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la arquitectura GPT-2 admite tipicamente 1024 tokens, sin confirmar en la model card) |
| Tipos de cuantizacion | No disponible (pesos en `safetensors`; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | No disponible (el modelo base es `goldfish-models/eng_latn_100mb`, de ingles en alfabeto latino; el nombre del fine-tune referencia "nor", posiblemente noruego) |
| Licencia | No disponible (la model card incluye el campo `licence: license` como marcador de posicion sin especificar) |
| Formato de pesos | `safetensors` (via `transformers`) |
| Tamano del repositorio | 0,7 GB |
| Modelo base | `goldfish-models/eng_latn_100mb` |
| Metodo de entrenamiento | SFT con TRL 0.23.0 |
| Version de transformers | 4.56.2 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, con aproximadamente 86,5 millones de parametros. Este tamano encaja con la familia de modelos "goldfish", una coleccion de modelos monolingues entrenados sobre subconjuntos de unos 100 MB del corpus Goldfish, disenada para estudiar el comportamiento de modelos de lenguaje en regimenes de datos extremadamente limitados. El modelo base `goldfish-models/eng_latn_100mb` fue entrenado sobre 100 MB de texto en ingles, y este modelo parte de el.

El ajuste fino se realizo con SFT (supervised fine-tuning) utilizando TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. El registro de entrenamiento esta disponible en Weights & Biases bajo el proyecto `new-tokenizers` del espacio de trabajo `f-padovani-university-of-groningen`, lo que sugiere que el objetivo del experimento era evaluar el efecto de nuevas estrategias de tokenizacion o de modificaciones del lexico sobre el rendimiento del modelo. No se documentan en la model card detalles sobre el numero de tokens de entrenamiento, la composicion del dataset de SFT, ni si se aplicaron tecnicas adicionales como RLHF o DPO (solo se menciona SFT). Tampoco se describen innovaciones tecnicas como atencion lineal o decodificacion especulativa.

## Capacidades

- Generacion de texto autoregresiva basica, heredada del modelo base GPT-2 de 100 MB.
- Ajuste supervisado para seguir instrucciones en formato de chat (la model card muestra un ejemplo con mensajes con rol `user`).
- Razonamiento y conocimiento factual muy limitados, coherentes con un modelo de ~86 M de parametros entrenado sobre un corpus de 100 MB.
- Soporte de tool calling: no documentado ni previsible en esta arquitectura y tamano.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el modelo base es monolingue en ingles.
- Capacidades especiales (modo "thinking", vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre tokenizacion y lexicografia: el modelo forma parte de una serie de experimentos (`ppt-wc-zipf-newlex`) para medir como distintas estrategias de construccion de vocabulario y de corpus afectan a la generacion de texto en modelos pequenos.
- Reproducibilidad de estudios academicos: sirve como punto de comparacion frente a otras variantes de la misma familia (por ejemplo, las publicadas por `fpadovani`), permitiendo aislar el efecto de la semilla o del preprocesado.
- Prototipado educativo: al ser un modelo de 86,5 M de parametros y 0,7 GB, se puede cargar y ejecutar en un portatil para demostrar el funcionamiento basico de un pipeline de generacion de texto con `transformers`.
- Pruebas de infraestructura de despliegue: util para validar integraciones con Text Generation Inference (el tag `text-generation-inference` y `endpoints_compatible` esta presente) o con otros servidores de inferencia antes de escalar a modelos mayores.
- Generacion de texto creativo a pequena escala en ingles: cuentos cortos, continuaciones de frases o ejercicios de escritura, asumiendo una calidad limitada.
- Analisis de sesgos y comportamientos emergentes en corpus minusculos: permite estudiar que tipo de errores y sesgos aparecen cuando el modelo se entrena con muy pocos datos.
- Docencia sobre ajuste fino con TRL: el modelo ilustra un flujo completo de SFT sobre un modelo base pequeno, con registro en W&B y publicacion en HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,35 GB en precision FP32 y unos 0,18 GB en FP16/BF16, dado el tamano de 86,5 M de parametros. Con overhead de runtime, cabe comodamente en menos de 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna o antigua es suficiente. No requiere A100, H100 ni RTX 4090; una GTX 1050, RTX 2060 o integradas recientes son mas que suficientes.
- Cabe en GPU consumer: si, en practicamente todas. Tambien se ejecuta en CPU sin problemas.
- Opciones de despliegue: `transformers` (pipeline de text-generation), Text Generation Inference (el tag `text-generation-inference` esta presente), llama.cpp/Ollama si se convierte a GGUF, y FastAPI o similares para envolver el pipeline.
- Latencia y throughput estimados: no disponibles. Por el tamano, se espera latencia de milisegundos por token en GPU moderna, pero no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `francesca9805/ppt-wc-zipf-newlex-nor-before-100mb-packed-bfd_seed3407` | 86,5 M | No disponible | No disponible | HuggingFace (`transformers`) | Fine-tune SFT de `goldfish-models/eng_latn_100mb` |
| `goldfish-models/eng_latn_100mb` | Del orden de 86 M (familia goldfish, dato no confirmado) | No disponible | No disponible | HuggingFace | Modelo base entrenado con 100 MB de ingles |
| `fpadovani/ppt-wc-zipf-newlex-eng-100mb_seed3407` | No disponible | No disponible | No disponible | HuggingFace | Variante de la misma serie de experimentos, en ingles |
| GPT-2 small (referencia de la arquitectura) | 124 M | 1024 tokens | MIT (segun OpenAI) | Ampliamente disponible | Referencia historica de la familia GPT-2 |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al entrenarse con un corpus de 100 MB es muy probable que herede sesgos del material de origen, acentuados por la falta de datos.
- Riesgo de alucinacion: alto. Con ~86 M de parametros y un corpus de 100 MB, el modelo no dispone de conocimiento factual fiable y generara contenido inventado con frecuencia.
- Limitaciones de contexto e idioma: el modelo base es monolingue en ingles; el nombre del fine-tune referencia "nor" (noruego), pero no se confirma el idioma efectivo de entrenamiento ni la cobertura. La longitud de contexto no esta documentada.
- Restricciones de licencia: la model card incluye `licence: license` como marcador sin especificar, por lo que el uso comercial queda en un limbo legal. No debe asumirse permiso de uso comercial sin consultar al autor.
- Caveat para produccion: el modelo tiene 0 descargas y 0 "likes", sin benchmarks publicados ni evaluacion independiente. No es adecuado para cargas de produccion serias; su uso esperado es la investigacion y la experimentacion.
- Fecha de creacion inusual: la metadata indica 2026-09-23, lo que puede deberse a un ajuste manual del reloj o a un error de registro; conviene verificarlo antes de citarlo.
- El modelo esta marcado como `generated_from_trainer`, lo que implica que su model card se genero automaticamente y puede carecer de detalles relevantes de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/ppt-wc-zipf-newlex-nor-before-100mb-packed-bfd_seed3407
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Repositorio TRL: https://github.com/huggingface/trl
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/zzq8pv9f
- Variante relacionada en noruego: https://huggingface.co/francesca9805/nor-latn-100mb-ppt-Dp-10mb-packed-bfd_seed3407
- Variante relacionada en ingles (fpadovani): https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-eng-100mb_seed3407
- Variante "77 eng" (fpadovani): https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed3407
- Ficha en LLM Explorer: https://llm-explorer.com/model/fpadovani%2Fppt-wc-zipf-newlex-eng-100mb_seed3407,7yiL7FfnKiJhj2L6U58dpm
- Despliegue en FriendliAI: https://friendli.ai/models/fpadovani/ppt-wc-zipf-newlex-eng-100mb_seed3407
