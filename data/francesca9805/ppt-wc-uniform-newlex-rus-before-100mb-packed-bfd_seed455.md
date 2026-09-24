# francesca9805/ppt-wc-uniform-newlex-rus-before-100mb-packed-bfd_seed455

## Resumen

El modelo francesca9805/ppt-wc-uniform-newlex-rus-before-100mb-packed-bfd_seed455 es un ajuste fino supervisado (SFT) del modelo base goldfish-models/eng_latn_100mb, publicado por el usuario francesca9805 en Hugging Face. Se trata de un modelo de generacion de texto de arquitectura GPT-2 (transformer decoder-only) con 86.508.288 parametros (unos 86,5 millones) y pesos en formato safetensors, entrenado con la libreria TRL en su version 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.5.1+cu121.

El modelo resuelve, en principio, el ajuste de un modelo pequeno de lenguaje a un corpus o tarea concreta mediante SFT, dentro de una linea de trabajo experimental. Su nombre sugiere variantes relacionadas con vocabulario o lexico (los fragmentos "newlex" y "rus") y con un formato de datos empaquetado ("packed"), aunque la model card no documenta ninguno de estos extremos. El checkpoint se creo el 24 de septiembre de 2026 segun los metadatos de Hugging Face y no registra descargas ni likes.

Su relevancia actual es limitada y de tipo metodologico: sirve como ejemplo reproducible de un flujo de trabajo con TRL sobre un modelo GoldenFish de 100 MB de datos de entrenamiento, y como punto de partida para experimentos de investigacion. No hay indicios de que este pensado para produccion, ni se documentan benchmarks, idiomas o licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun la etiqueta library del repositorio) |
| Parametros totales | 86.508.288 (aprox. 86,5 M) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas; pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card usa el marcador de posicion "licence: license") |
| Formato de pesos | safetensors |
| Modelo base | goldfish-models/eng_latn_100mb |
| Framework de entrenamiento | TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion (metadatos) | 24 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2 con atencion causal y aproximadamente 86,5 millones de parametros, una cifra inferior a los 124 millones de GPT-2 small, lo que apunta a una configuracion reducida (menos capas o menor dimension de embedding), aunque el repositorio no publica el config.json ni los hiperparametros concretos. El modelo base, goldfish-models/eng_latn_100mb, pertenece al proyecto Goldfish de modelos monolingues; en esa nomenclatura el sufijo "100mb" hace referencia al tamano del corpus de entrenamiento (unos 100 MB de texto en ingles), no al numero de parametros.

El entrenamiento del checkpoint se realizo mediante SFT con TRL, segun la propia model card, y el run de seguimiento esta alojado en Weights & Biases. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Tampoco se documenta el proceso de tokenizacion, pese a que el nombre del modelo sugiere experimentos con vocabulario ("newlex").

## Capacidades

- Generacion de texto autoregresiva basica: el modelo se presenta en la pipeline text-generation y puede completar o continuar instrucciones cortas, tal como muestra el ejemplo de la model card.
- Formato de conversacion superficial: el ejemplo de uso pasa una lista con el rol "user", lo que indica que el ajuste SFT se realizo con plantillas de conversacion, aunque no se documenta la plantilla exacta.
- Razonamiento, codigo y matematicas: no documentado; por tamano y naturaleza del modelo base no cabe esperar un rendimiento competitivo en estas tareas.
- Tool calling / function calling: no documentado y sin indicios de soporte.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas; el modelo base esta etiquetado como ingles (eng_latn).
- Capacidades especiales (vision, audio, modo de pensamiento): no disponibles.

## Casos de uso

- Prototipado rapido de pipelines de generacion de texto: al ocupar menos de 1 GB, el modelo puede cargarse en cualquier portatil para validar la integracion de transformers, la tokenizacion y el formato de entrada antes de escalar a un modelo mayor.
- Investigacion sobre SFT con TRL: sirve como caso de estudio reproducible para comparar recetas de ajuste fino supervisado (learning rate, empaquetado de secuencias, semillas) sobre un mismo modelo base.
- Experimentos academicos de destilacion o reduccion de tamano: sus 86,5 millones de parametros lo hacen util como alumno o como referencia frente a GPT-2 small en estudios de compresion de modelos.
- Generacion de texto sintetico a pequena escala: puede producir completaciones cortas para aumentar datasets de clasificacion o para pruebas de estres de sistemas de NLP, siempre con revision humana.
- Ajuste posterior para tareas concretas: al ser un checkpoint pequeno, es viable reentrenarlo en una unica GPU para tareas de generacion de dominio acotado (por ejemplo, plantillas de texto administrativo), aunque no hay evidencia publicada de calidad.
- Inferencia en el borde o en CPU: con ~350 MB en fp32 y ~173 MB en fp16, es apto para demostraciones en dispositivos sin GPU, siempre que no se exija baja latencia ni alta fidelidad.
- Docencia y formacion: permite ilustrar de principio a fin el ciclo de vida de un modelo (entrenamiento, publicacion en el Hub, carga con pipeline) sin requerir hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, perplexity ni ninguna otra evaluacion, y el repositorio no registra evaluaciones asociadas.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir de 86.508.288 parametros, sin contar activaciones ni memoria del runtime):
  - fp32: ~346 MB.
  - fp16/bf16: ~173 MB.
  - int8: ~87 MB.
  - int4: ~43 MB.
- En la practica, sumando pesos, cache KV, activaciones y overhead de PyTorch, cabe en menos de 1-2 GB de VRAM y en la memoria de una GPU integrada o incluso en CPU con memoria RAM convencional.
- GPUs recomendadas: cualquier GPU consumer (GTX 1050 Ti en adelante, RTX 2060, RTX 3060, RTX 4090) e incluso inferencia en CPU. No requiere A100 ni H100.
- Cabe holgadamente en GPU consumer: si.
- Opciones de despliegue: la etiqueta text-generation-inference y endpoints_compatible indica compatibilidad con TGI y con los Inference Endpoints de Hugging Face; tambien es viable vLLM (soporta arquitectura GPT-2), transformers con pipeline y llama.cpp/Ollama previa conversion a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ppt-wc-uniform-newlex-rus-before-100mb-packed-bfd_seed455 | 86,5 M | no disponible | no disponible | Hugging Face, 0 descargas | Ajuste SFT experimental sobre base GoldenFish; sin benchmarks |
| distilgpt2 | 82 M | 1.024 tokens | Apache-2.0 | Ampliamente distribuido | Version destilada de GPT-2, con evaluaciones publicas |
| gpt2 (small) | 124 M | 1.024 tokens | MIT | Ampliamente distribuido | Modelo de referencia de la familia GPT-2 |
| goldfish-models/eng_latn_100mb | no disponible | no disponible | no disponible | Hugging Face | Modelo base del que deriva este checkpoint |

La comparacion de rendimiento no es posible porque este checkpoint no publica metricas; los datos de distilgpt2 y gpt2 corresponden a sus especificaciones publicas conocidas.

## Limitaciones y advertencias

- Licencia no definida: la model card emplea el marcador de posicion "licence: license", lo que en la practica implica ausencia de licencia explicita. Sin una licencia que conceda derechos, no hay autorizacion clara para uso comercial.
- Sin evaluacion publicada: no existen benchmarks, ni perplexity, ni evaluaciones cualitativas, por lo que se desconoce su calidad real.
- Adopcion nula: 0 descargas y 0 likes indican que el checkpoint no ha sido validado por terceros.
- Riesgo alto de alucinacion: un modelo de 86,5 millones de parametros entrenado sobre un corpus base de 100 MB de texto tiene una capacidad muy limitada de conocimiento factual y una fuerte tendencia a generar contenido incoherente o inventado.
- Sesgos: al derivar de un corpus extraido de web (Goldfish), es previsible que herede sesgos de genero, etnicos y culturales; no se documenta ninguna mitigacion.
- Idiomas: solo se puede suponer ingles por el modelo base (eng_latn); el fragmento "rus" del nombre sugiere algun tipo de experimento con lexico ruso, pero no hay documentacion que lo confirme y no debe asumirse soporte multilingue.
- Longitud de contexto desconocida: no se publica el config.json, por lo que no se puede garantizar el limite de tokens de entrada.
- Documentacion practicamente inexistente: faltan dataset de entrenamiento, hiperparametros, plantilla de chat y procedimiento de evaluacion.
- No apto para produccion: sin licencia, sin evaluaciones y con un tamano que limita la calidad, no deberia desplegarse en entornos reales sin una validacion exhaustiva.
- Fecha de creacion anomala: los metadatos indican 2026, lo que conviene verificar antes de citarlo como referencia temporal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-rus-before-100mb-packed-bfd_seed455
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/aejezc5o
