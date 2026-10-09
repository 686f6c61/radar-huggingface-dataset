# francesca9805/nor-latn-100mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed3407

## Resumen

nor-latn-100mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed3407 es un checkpoint de generacion de texto publicado por el usuario francesca9805 (el enlace de Weights & Biases lo vincula a la Universidad de Groningen, autor F. Padovani). Se trata de un ajuste fino mediante SFT con TRL sobre el modelo francesca9805/nor-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed3407, que a su vez es un modelo de arquitectura GPT-2 entrenado desde cero. El repositorio contiene 124.770.816 parametros reales, confirmados en los metadatos de safetensors.

El identificador del repositorio sugiere un experimento sobre noruego en alfabeto latino (nor-latn) con 100 MB de datos, empaquetado de secuencias (packed) y un checkpoint intermedio en el paso 500 (ckpt500) de la semilla 3407. Es, por tanto, un artefacto de investigacion orientado a estudiar recetas de entrenamiento, tokenizacion y empaquetado de datos mas que un modelo de produccion.

Su relevancia actual es limitada fuera del ambito academico: no tiene descargas ni likes, la model card no documenta idiomas, licencia ni contexto, y no se han publicado benchmarks. Resulta util como baseline reproducible y como punto de partida para experimentos de ajuste en lenguas escandinavas de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (segun la etiqueta `gpt2` del repositorio) |
| Parametros totales | 124.770.816 (dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card ni en los metadatos |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors, sin GGUF ni cuantizaciones precalculadas |
| Idiomas soportados | no disponible en los metadatos; el identificador `nor-latn` apunta a noruego en alfabeto latino |
| Licencia | no disponible (la model card incluye el marcador de posicion `licence: license`) |
| Formato de pesos | safetensors (carga mediante la libreria transformers) |

Otros datos de interes: tamano del repositorio 5,2 GB, pipeline `text-generation`, etiquetas `text-generation-inference`, `endpoints_compatible`, `sft`, `trl` y `generated_from_trainer`. Creado el 2026-10-08 y actualizado el 2026-10-08.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia GPT-2, con 124,77 millones de parametros. No se documenta el numero de capas, dimensiones del modelo, numero de cabezas de atencion ni la longitud de contexto soportada. Tampoco se especifica el tokenizador empleado, aunque el prefijo `nor-latn` del nombre sugiere la inclusion de un tokenizador especifico para noruego en escritura latina desarrollado en el mismo proyecto de investigacion.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con la libreria TRL en su version 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. El modelo parte de un checkpoint previo del mismo autor, `francesca9805/nor-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed3407`, y el identificador indica que se trata del checkpoint del paso 500 (`ckpt500`) con semilla 3407. La nomenclatura `100mb`, `packed` y `bfdiso` apunta a un corpus de 100 MB con secuencias empaquetadas; no se detalla la composicion del dataset, el numero de tokens de entrenamiento, ni si hubo fases de RLHF o DPO. El run de entrenamiento esta registrado en Weights & Biases bajo el proyecto `new-tokenizers`.

## Capacidades

- Generacion de texto autoregresiva: el modelo se distribuye con la pipeline `text-generation` y admite prompts conversacionales en formato de lista de mensajes con rol `user`, como muestra el ejemplo de la model card.
- Ajuste conversacional basico (SFT): al haber sido entrenado con supervisied fine-tuning, esta preparado para responder a instrucciones sencillas, sin garantias de calidad.
- Generacion condicionada por prompt largo: el ejemplo oficial usa una pregunta de tipo razonamiento abierto ("si tuvieras una maquina del tiempo..."), lo que indica cierto entrenamiento en respuestas argumentativas.
- Idiomas: probablemente noruego (escritura latina) por el identificador del modelo, aunque la model card no lo declara de forma explicita.
- Tool calling / function calling: no disponible; no se documenta soporte de llamadas a herramientas.
- Agentes y razonamiento multi-paso: no disponible; no hay indicios de entrenamiento especifico para uso agentico.
- Capacidades multimodales: no disponibles; el modelo es exclusivamente de texto.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Baseline academico para investigacion en tokenizacion: sirve como referencia reproducible (semilla 3407, checkpoint 500) para medir el efecto de tokenizadores especificos de noruego frente a tokenizadores multilingues genericos en un modelo de 124 M de parametros.
- Estudio de empaquetado de secuencias: al haberse entrenado con datos `packed`, permite analizar como afecta el empaquetado a la perplexidad y a la coherencia en generaciones cortas.
- Punto de partida para ajuste de dominio en noruego: un equipo puede aplicar SFT adicional sobre corpus juridicos, medicos o tecnicos en noruego partiendo de este checkpoint, con un coste de computo muy bajo dado el tamano del modelo.
- Generacion de datos sinteticos en noruego: puede producir texto de relleno o variaciones de frases para aumentar corpus de entrenamiento de modelos mayores, siempre con revision humana por el riesgo de alucinacion.
- Autocompletado ligero en local o en el borde: con 124,77 M de parametros cabe en CPU y en GPUs de gama de entrada, por lo que es viable en prototipos de escritorio o entornos sin acelerador dedicado.
- Validacion de pipelines de despliegue: al estar etiquetado como `text-generation-inference` y `endpoints_compatible`, es util para probar integraciones con TGI, vLLM o endpoints compatibles antes de escalar a modelos mayores.
- Docencia y ejercicios de ajuste fino: su tamano permite ejecutar un ciclo completo de entrenamiento y evaluacion en una unica GPU de consumo, lo que lo hace adecuado para cursos practicos de SFT con TRL.
- Comparacion de checkpoints intermedios: permite estudiar la evolucion del entrenamiento comparando el paso 500 con otros checkpoints de la misma receta (por ejemplo, las variantes `nld-latn` del mismo autor).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en precision completa (fp32): aproximadamente 500 MB (124,77 M de parametros x 4 bytes). VRAM total estimada con activaciones y cache KV en lotes pequenos: entre 1 y 2 GB.
- Pesos en bf16/fp16: aproximadamente 250 MB. VRAM total estimada: entre 0,8 y 1,5 GB segun longitud de secuencia y tamano de lote.
- Cuantizacion int8: aproximadamente 125 MB; cuantizacion de 4 bits: en torno a 70 MB teoricos. No hay versiones GGUF publicadas, por lo que habria que generarlas.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; por ejemplo GTX 1650, RTX 3050, RTX 3060, RTX 4090, A100 o H100 (estas ultimas muy sobredimensionadas para este tamano).
- Viabilidad en GPU de consumo: si, con holgura, en practicamente cualquier GPU de consumo de los ultimos ocho anos.
- Viabilidad en CPU: si; la inferencia de un modelo de 124 M de parametros es viable en CPU moderna para prototipos y pruebas.
- Opciones de despliegue: pipeline de transformers, Text Generation Inference (etiqueta `text-generation-inference`), vLLM (soporta la familia GPT-2) y endpoints compatibles. llama.cpp u Ollama requeririan convertir los pesos a GGUF, conversion que no se ha publicado.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nor-latn-100mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed3407 (este modelo) | 124,77 M | no disponible | no disponible | HuggingFace; 0 descargas, 0 likes |
| francesca9805/nor-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed3407 (modelo base) | no disponible | no disponible | no disponible | HuggingFace, mismo autor |
| francesca9805/nld-latn-100mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed10 | no disponible (receta de 100 MB) | no disponible | no disponible | HuggingFace, mismo autor; variante en neerlandes |
| GPT-2 (OpenAI), referencia de la familia | ~124 M | 1.024 tokens en la configuracion estandar | MIT | Ampliamente disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de investigacion sin validacion externa: cero descargas y cero likes, sin evaluaciones publicadas ni resultados de benchmarks; no debe usarse en produccion sin una evaluacion propia.
- Riesgo elevado de alucinacion: con 124,77 M de parametros y sin fases documentadas de RLHF o DPO, la fidelidad factual y la adherencia a instrucciones complejas seran limitadas.
- Idiomas no declarados: la model card no especifica idiomas soportados. El identificador sugiere noruego, pero no hay confirmacion oficial; el rendimiento en castellano es presumiblemente pobre.
- Licencia indeterminada: la model card contiene un marcador de posicion (`licence: license`) y los metadatos indican "no disponible". No se puede asumir permiso para uso comercial.
- Contexto desconocido: no se documenta la longitud de contexto, lo que impide planificar aplicaciones con ventanas largas.
- Sin cuantizaciones oficiales: no hay GGUF ni AWQ/GPTQ publicados, de modo que el despliegue en llama.cpp u Ollama exige trabajo adicional de conversion y validacion.
- Fecha de creacion atipica (2026-10-08) y repositorio de 5,2 GB para un modelo de 500 MB en fp32, lo que sugiere que el repositorio incluye checkpoints u optimizadores adicionales y no solo los pesos finales.
- Sesgos potenciales: al entrenarse sobre 100 MB de texto sin documentar la composicion del corpus, pueden aparecer sesgos de dominio, de registro y de representacion propios del dataset, sin que exista una evaluacion de sesgos disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/nor-latn-100mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed3407
- Modelo base: https://huggingface.co/francesca9805/nor-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed3407
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/yvga7yt0
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante en neerlandes de la misma receta: https://huggingface.co/francesca9805/nld-latn-100mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed10
- Ficha de registro en free2aitools del modelo base estructural: https://free2aitools.com/model/francesca9805/nor-latn-100mb-ppt-mp-struct-100mb_seed10
- Pagina de despliegue en FriendliAI para la variante seed10: https://friendli.ai/models/francesca9805/nor-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed10
