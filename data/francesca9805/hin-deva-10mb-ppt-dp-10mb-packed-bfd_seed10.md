# francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed10

## Resumen

`francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed10` es un ajuste fino (SFT) del modelo `goldfish-models/hin_deva_10mb`, un modelo de lenguaje causal de arquitectura GPT-2 con 39.087.104 parametros. Lo publica el usuario `francesca9805` con la libreria Transformers y el framework TRL 0.23.0, y forma parte de lo que parece una bateria de experimentos de investigacion (la ejecucion de Weights & Biases asociada pertenece al proyecto "new-tokenizers" de la Universidad de Groningen). No es un modelo orientado a produccion: se trata de un artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta, y sin model card mas alla de la plantilla automatica de TRL.

El interes tecnico del modelo no esta en sus capacidades, sino en su papel como punto de comparacion experimental. Su nombre codifica variables de un estudio: `hin-deva-10mb` (hindi en escritura devanagari, corpus de 10 MB), `ppt`, `Dp-10mb-packed`, `bfd` y `seed10`, lo que sugiere una ablacion sobre estrategias de tokenizacion y de empaquetado (*packing*) de secuencias, ejecutada con la semilla 10. El ajuste se hizo sobre el subconjunto de 10 MB del modelo base, con secuencias empaquetadas.

Con 39 millones de parametros, el modelo cabe en cualquier GPU de consumo e incluso en CPU, y su utilidad real es servir de linea base reproducible en experimentos de tokenizacion y de ajuste fino con TRL. La informacion publica no incluye licencia efectiva, idiomas declarados, longitud de contexto, corpus de ajuste ni resultados de evaluacion, por lo que cualquier uso fuera del ambito de investigacion experimental debe considerarse no soportado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, modelo de lenguaje causal); segun el tag `gpt2` del repositorio |
| Parametros totales | 39.087.104 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible. No declarado en la ficha; el identificador del modelo base (`hin_deva`) apunta a hindi en escritura devanagari, sin confirmacion oficial |
| Licencia | no disponible (la model card contiene el marcador de plantilla `licence: license`, sin texto legal) |
| Formato de pesos | safetensors (libreria Transformers) |
| Tamano del repositorio | 0,1 GB |
| Modelo base | goldfish-models/hin_deva_10mb |
| Framework de entrenamiento | TRL 0.23.0 (SFT), Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4, Tokenizers 0.22.1 |
| Fecha de creacion | 2026-09-22 |
| Ultima actualizacion | 2026-09-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2, un transformer decoder-only con atencion causal, tal y como declara el tag `gpt2` del repositorio. Con 39.087.104 parametros, el modelo es aproximadamente un tercio de GPT-2 small (124 M) y esta en el rango de las variantes reducidas tipo GPT-2 de 4 a 6 capas, aunque la ficha no publica el numero de capas, la dimension oculta, el numero de cabezas de atencion ni el tamano del vocabulario, por lo que esos datos deben considerarse no disponibles. El contexto maximo tampoco se especifica.

El entrenamiento es un ajuste fino supervisado (SFT) sobre `goldfish-models/hin_deva_10mb`, ejecutado con TRL 0.23.0 sobre PyTorch 2.5.1+cu121 y Transformers 4.56.2. El nombre del modelo indica que el corpus de ajuste es de 10 MB y que las secuencias se empaquetaron (`packed`); el segmento `bfd` sugiere un algoritmo de empaquetado tipo *best-fit decreasing*, y `seed10` que se uso la semilla 10. Estos elementos apuntan a un experimento controlado de comparacion de tokenizadores y de estrategias de empaquetado, pero la model card no documenta ni el dataset, ni el numero de tokens de entrenamiento, ni hiperparametros (tasa de aprendizaje, epochs, warmup), ni si hubo fases de RLHF o DPO (no las hubo: solo se declara SFT). No se describe ninguna innovacion arquitectonica: no hay atencion lineal, decodificacion especulativa ni mezcla de expertos.

## Capacidades

Las capacidades verificables son deliberadamente limitadas, coherentes con un modelo de 39 M de parametros ajustado sobre 10 MB de texto:

- Generacion de texto por continuacion (pipeline `text-generation`), la unica tarea declarada en el repositorio.
- Modelado de lenguaje causal sobre texto en escritura devanagari, presumiblemente hindi, segun el modelo base (no confirmado en la ficha).
- Ejecucion con la API de chat de `transformers.pipeline`, ya que la model card incluye un ejemplo que pasa una lista de mensajes con el rol `user`; no se documenta la plantilla de chat utilizada.
- Compatibilidad con Text Generation Inference (tag `text-generation-inference` y `endpoints_compatible`), lo que permite desplegarlo con ese servidor.
- No hay soporte documentado de *tool calling* ni de *function calling*.
- No hay soporte documentado de agentes ni de razonamiento multi-paso.
- No se declaran capacidades de vision, audio, modo *thinking*, ni razonamiento explicito.
- No se declaran capacidades multilingues distintas del idioma del modelo base.

## Casos de uso

- Linea base en experimentos de tokenizacion: el modelo sirve como punto de comparacion reproducible (semilla 10) frente a otras variantes del mismo estudio que usan tokenizadores o estrategias de empaquetado distintas; su valor es la comparabilidad, no la calidad de generacion.
- Prueba de humo (*smoke test*) de pipelines de entrenamiento con TRL: permite validar un flujo completo de SFT, desde la carga del dataset empaquetado hasta el guardado en safetensors, en pocos minutos y en una sola GPU.
- Validacion de infraestructura de despliegue: con 39 M de parametros y 0,1 GB de pesos, sirve para comprobar que un servidor de Text Generation Inference, un endpoint HTTP o un contenedor de inferencia funcionan correctamente antes de sustituir el modelo por uno grande.
- Experimentos de *packing* de secuencias: dado que el identificador indica secuencias empaquetadas con un posible algoritmo *best-fit decreasing*, el modelo es util para medir como el empaquetado afecta a la perdida y a la calidad final en corpus de 10 MB.
- Docencia y formacion: es un ejemplo manejable para explicar ajuste fino supervisado, tokenizacion en escrituras no latinas y el ciclo de vida completo de un modelo en HuggingFace sin necesidad de hardware especializado.
- Generacion de relleno en pruebas de integracion: para tests automatizados que necesitan una respuesta de texto de forma rapida y en CPU, el coste computacional es minimo.
- Estudio de modelos para lenguas con pocos recursos: encaja en la linea de investigacion de los modelos Goldfish, centrada en entrenar modelos monoingles pequenos sobre corpus muy reducidos (10 MB por lengua).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra), y el repositorio no enlaza a ninguna tabla de resultados. No se dispone tampoco de comparaciones publicadas con el modelo base `goldfish-models/hin_deva_10mb`.

## Requisitos de hardware

- VRAM estimada para los pesos: en fp32, aproximadamente 156 MB (39,09 M × 4 bytes); en fp16/bf16, unos 78 MB; en int8, unos 39 MB. A esto hay que sumar la memoria de activaciones y la cache KV, que depende de la longitud de contexto, no publicada.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Se puede ejecutar sin problemas en RTX 3060, RTX 4090, A100, H100 o incluso en GPUs integradas.
- Cabe en GPU de consumo: si, en cualquier modelo actual e incluso en hardware antiguo, y tambien en CPU con un consumo de RAM inferior a 1 GB.
- Opciones de despliegue: `transformers` (pipeline de generacion), Text Generation Inference (el repositorio esta etiquetado como compatible con `text-generation-inference` y `endpoints_compatible`) y vLLM. Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, ya que no se publica ninguna version cuantizada.
- Latencia y throughput: no disponibles. No hay mediciones publicadas en la model card ni en el repositorio. Por el tamano del modelo, la generacion estara dominada por el ancho de banda de memoria y no por el computo, por lo que en GPU el cuello de botella seran los lanzamientos de kernel, y en CPU el rendimiento dependera del numero de nucleos disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed10 | 39.087.104 | no disponible | SFT con TRL sobre 10 MB empaquetados | no disponible | Publico en HuggingFace, 0 descargas |
| goldfish-models/hin_deva_10mb (modelo base) | no disponible | no disponible | Entrenamiento desde cero sobre 10 MB de hindi en devanagari | no disponible | Publico en HuggingFace |
| GPT-2 small (referencia de familia) | 124 M | 1.024 tokens (segun la implementacion original) | Entrenamiento desde cero sobre WebText | MIT (en la publicacion original de OpenAI) | Ampliamente disponible |

La comparacion con GPT-2 small se incluye solo como referencia de familia arquitectonica (ambos son transformers decoder-only tipo GPT-2), no como equivalente funcional: el modelo analizado tiene un tercio de parametros y esta ajustado sobre un corpus miles de veces menor. No se dispone de datos de rendimiento comparativos entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia sin definir: la model card contiene el marcador `licence: license` sin texto legal. La ausencia de una licencia explicita impide el uso comercial con garantias juridicas; hay que tratar el modelo como no licenciado hasta que el autor lo aclare.
- Sesgos conocidos: no documentados. Al estar ajustado sobre un corpus de 10 MB sin filtrado descrito, es esperable que reproduzca los sesgos y el ruido del corpus de origen, pero no hay analisis publicado.
- Riesgo de alucinacion: muy alto. Con 39 M de parametros y 10 MB de texto de entrenamiento, el modelo no tiene capacidad factual fiable; cualquier salida debe tratarse como texto plausible, no como informacion veraz.
- Limitaciones de contexto e idioma: no se publica la longitud de contexto soportada ni la lista de idiomas. Todo apunta a que su rendimiento fuera del hindi en devanagari sera muy pobre, y ni siquiera dentro de ese idioma hay evaluacion disponible.
- Sin datos de entrenamiento: no se especifica el dataset, el numero de tokens vistos, la composicion del corpus ni los hiperparametros, lo que impide reproducir el experimento tal cual.
- Sin evaluacion: no hay ninguna metrica publicada, por lo que no se puede afirmar que el ajuste fino mejore al modelo base.
- Artefacto de investigacion: 0 descargas, 0 likes, repositorio de 0,1 GB creado y actualizado el mismo dia. No hay mantenimiento, issues resueltas ni versionado posterior.
- Uso en produccion desaconsejado: no hay garantia de calidad, ni soporte, ni SLA; emplearlo en atencion al cliente, generacion de codigo o cualquier flujo con usuarios finales expondria a errores graves y a riesgo legal por la licencia indefinida.
- Advertencia sobre la fecha: la fecha de creacion registrada (2026-09-22) es posterior a la fecha habitual de publicacion de este tipo de artefactos; conviene verificar la validez del repositorio antes de usarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed10
- Modelo base: https://huggingface.co/goldfish-models/hin_deva_10mb
- Organizacion Goldfish Models: https://huggingface.co/goldfish-models
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/wpnlycpz
- Documentacion de TRL SFTTrainer: https://huggingface.co/docs/trl/sft_trainer
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
