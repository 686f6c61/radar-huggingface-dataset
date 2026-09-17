# CharlieChen/loop-untied-2-d10

## Resumen

loop-untied-2-d10 es un modelo de lenguaje base de tipo transformer con bucles (looped transformer) desarrollado por el autor CharlieChen en el marco del articulo "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents". Se trata de un artefacto de investigacion: el checkpoint final original empleado en la escalera de escalado (scaling ladder) sobre FineWeb, con la coordenada de profundidad d10 y la variante "untied 2". No es un modelo ajustado por instrucciones ni un checkpoint compatible con `AutoModel` de Transformers.

El modelo almacena 413.204.480 parametros en FP32 (1,653 GB) y emplea una anchura de 1280 con 10 cabezas de atencion y un tokenizador GPT-2 de 50.257 tokens (ampliado a 50.304 filas). La longitud de contexto es de 2.048 tokens y el corpus de entrenamiento es exclusivamente FineWeb, por lo que el soporte linguistico se limita al ingles. La innovacion principal es la recursion: el modelo repite un nucleo configurable (2 repeticiones en configuracion y en evaluacion final) de modo que la coordenada de profundidad de la escalera no tiene por que coincidir con el numero de bloques Transformer ejecutados.

Su relevancia es fundamentalmente cientifica. El checkpoint esta pensado para reproducir los resultados del articulo sobre exponentes de escalado y para ejecutar la suite CORE de 22 tareas con las semillas 0, 1 y 2, usando H100, FlashAttention-3 y autocast en bfloat16. La perdida de validacion registrada en el corpus de preentrenamiento es de 3,019007 nats/token. No se ha publicado informacion sobre licencia, benchmarks completos ni cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer), variante "untied 2", modo de profundidad `dep`, coordenada de profundidad d10 |
| Parametros totales | 413.204.480 en FP32 (1,653 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se publica el checkpoint original en FP32; no se distribuyen versiones GGUF, AWQ, GPTQ ni similar) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`final.pt`); no es safetensors ni GGUF, y no es un checkpoint de `AutoModel` de Transformers |
| Anchura (hidden size) | 1280 |
| Cabezas de atencion | 10 |
| Tokenizador | GPT-2 (`tiktoken.get_encoding("gpt2")`) |
| Vocabulario | 50.257 tokens, ampliado a 50.304 filas del modelo |
| Repeticiones del nucleo | 2 configuradas en entrenamiento y 2 en la evaluacion final |
| NLL de validacion (preentrenamiento) | 3,019007 nats/token |
| Ficheros del repositorio | `final.pt`, `result.json`, `SHA256SUMS` |
| Tamano del repositorio | 1,7 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer con bucles: en lugar de apilar un numero fijo de bloques independientes, el modelo reutiliza un nucleo que se ejecuta un numero configurable de veces (2 repeticiones en este checkpoint). La variante se denomina "untied 2" y el modo de profundidad es `dep`, donde la coordenada de profundidad actua como coordenada de escalado dentro de la escalera del articulo y no equivale necesariamente al numero de bloques Transformer efectivamente ejecutados. El checkpoint no incluye estado del optimizador, por lo que no permite reanudar el entrenamiento; conserva unicamente los pesos aprendidos y los argumentos de entrenamiento.

El preentrenamiento se realizo sobre el corpus FineWeb con el tokenizador GPT-2, una anchura de 1280 y 10 cabezas de atencion. El articulo emplea GPU H100, FlashAttention-3 y autocast en bfloat16. No se documenta en la model card el numero exacto de tokens de entrenamiento, la composicion detallada del dataset mas alla de FineWeb, ni si hubo etapas de RLHF, DPO o ajuste por instrucciones; de hecho, el autor indica explicitamente que es un modelo base sin instruction tuning. La metrica publicada de validacion es una NLL de 3,019007 nats/token medida sobre el propio corpus de preentrenamiento, que el autor distingue de la NLL de respuestas de CORE.

## Capacidades

- Generacion de texto en ingles: es un modelo base de continuacion de texto, sin plantilla de instrucciones ni modo conversacional.
- Modelado de lenguaje autorregresivo con ventana de contexto de 2.048 tokens.
- Reproduccion de experimentos de escalado: sirve para estudiar como afectan el crecimiento del modelo, la recursion y los operadores de frontera a los exponentes de escalado.
- Evaluacion en la suite CORE: el codigo del articulo permite ejecutar las 22 tareas de CORE con las semillas 0, 1 y 2, tanto en modo acotado (`--max-per-task`) como completo.
- Punto de partida para fine-tuning: al ser un checkpoint base con pesos en FP32, puede ajustarse posteriormente para tareas concretas en ingles.
- Soporte de tool calling / function calling: no disponible; no se ha entrenado para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no; el modelo esta etiquetado unicamente como `en`.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Reproduccion de resultados cientificos: cargar `final.pt` junto a `result.json` y ejecutar `eval.py` del repositorio del articulo para verificar la NLL de validacion y las puntuaciones de CORE con las semillas 0, 1 y 2. Es el uso previsto por el autor.
- Estudio de leyes de escalado: el checkpoint representa un punto concreto (d10, untied 2) de la escalera de FineWeb, de modo que puede combinarse con otros puntos de la misma escalera para ajustar exponentes de escalado en funcion de la profundidad o el numero de repeticiones del nucleo.
- Investigacion sobre arquitecturas con peso compartido: al ser un transformer con bucles, permite medir el efecto de reutilizar el nucleo 2 veces frente a arquitecturas con bloques independientes del mismo presupuesto de parametros.
- Fine-tuning supervisado en ingles: con 413 millones de parametros en FP32, es viable ajustarlo en una unica GPU para tareas de clasificacion, resumen o generacion de dominio, partiendo de un modelo ya preentrenado sobre FineWeb.
- Ajuste eficiente con LoRA o QLoRA: el tamano reducido del modelo permite iterar con adaptadores de bajo rango en GPU de gama media, aunque requeriria escribir el cargador del checkpoint porque no es un `AutoModel`.
- Experimentos de interpretabilidad y analisis de representaciones: los bucles permiten comparar las activaciones de la primera y la segunda pasada del nucleo sobre la misma entrada, algo que no es posible en un transformer estandar sin modificar.
- Prototipado de generacion de texto en ingles sin requisitos de produccion: por su tamano, puede ejecutarse en una GPU de consumo para pruebas de continuacion de texto, siempre que se acepte la ausencia de instrucciones y de plantillas de chat.
- Base para ablaciones controladas: al publicarse los argumentos de entrenamiento en `result.json`, sirve como referencia reproducible en estudios que comparen variantes de profundidad, anchura o recurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos en la informacion disponible. El unico dato numerico de evaluacion presente en la model card es la perdida de validacion de preentrenamiento:

| Metrica | Valor | Conjunto |
|---|---|---|
| NLL de validacion | 3,019007 nats/token | Corpus de preentrenamiento (FineWeb) |

El autor advierte que esta NLL se mide sobre el corpus de preentrenamiento y es distinta de la NLL de respuestas de CORE. La suite CORE (22 tareas, semillas 0/1/2) se describe como procedimiento de evaluacion reproducible, pero no se incluyen puntuaciones en la informacion proporcionada. Las puntuaciones de la evaluacion acotada (`--max-per-task 10`) no equivalen a resultados de la suite completa.

## Requisitos de hardware

- Peso del modelo en FP32: 1,653 GB (413.204.480 parametros). Es el formato en que se distribuye el checkpoint.
- VRAM estimada en FP32: aproximadamente 1,7 GB solo para pesos, mas activaciones y cache KV para 2.048 tokens; en la practica quiza 2,5-4 GB segun implementacion y tamano de lote.
- VRAM estimada en bfloat16: alrededor de 0,85 GB de pesos; el articulo usa autocast en bfloat16, por lo que es el modo de referencia.
- Cuantizaciones INT8 o INT4: no publicadas; requeririan un proceso de conversion propio, sin herramientas oficiales descritas.
- GPU recomendadas: el articulo emplea H100 con FlashAttention-3. Para inferencia, el modelo cabe con holgura en GPU de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB); tambien en tarjetas de 6-8 GB si se usa bfloat16 y lotes pequenos.
- Despliegue: no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, porque el checkpoint es un `TransformerGPT` personalizado y no un modelo de Transformers. El unico camino documentado es el repositorio del articulo (`cue-engineering/loop`) con PyTorch y FlashAttention-3.
- Latencia y throughput estimados: no disponible.
- Almacenamiento: 1,7 GB para el repositorio completo, incluyendo `final.pt`, `result.json` y `SHA256SUMS`.

## Comparativa con modelos similares

La comparativa se limita a parametros, contexto y licencia, ya que no hay resultados de benchmarks publicados para este checkpoint. Los datos de los modelos alternativos corresponden a sus fichas publicas conocidas.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| loop-untied-2-d10 | 413 M | 2.048 | Ingles | no disponible | PyTorch `.pt` (custom) |
| Pythia-410M | 410 M | 2.048 | Ingles | Apache 2.0 | safetensors / Transformers |
| GPT-2 medium | 355 M | 1.024 | Ingles | MIT | safetensors / Transformers |
| OPT-350M | 350 M | 2.048 | Ingles | MIT | safetensors / Transformers |

Frente a estas alternativas, loop-untied-2-d10 se diferencia por su arquitectura con bucles y por su proposito exclusivamente de investigacion sobre leyes de escalado, mientras que Pythia, GPT-2 y OPT son modelos base genericos con licencias permisivas y soporte nativo en las bibliotecas habituales de inferencia.

## Limitaciones y advertencias

- Es un modelo base sin instruction tuning: no sigue instrucciones ni mantiene formato conversacional sin un ajuste posterior.
- Reproducibilidad restringida: el checkpoint no incluye estado del optimizador, por lo que no se puede reanudar el entrenamiento.
- Compatibilidad limitada: no funciona con `AutoModel` de Transformers, ni con vLLM, llama.cpp, Ollama o TGI sin escribir codigo de adaptacion. La evaluacion requiere el repositorio del articulo.
- Idiomas: solo ingles. Cualquier uso en castellano u otros idiomas no esta soportado y probablemente produzca resultados pobres.
- Contexto corto: 2.048 tokens, insuficiente para tareas de contexto largo o procesamiento de documentos extensos.
- Riesgo de alucinacion: como cualquier modelo autorregresivo preentrenado, puede generar contenido facticamente incorrecto o incoherente, especialmente fuera del dominio de FineWeb.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad. FineWeb es un corpus web filtrado, por lo que es previsible la presencia de sesgos sociales y estereotipos propios de ese tipo de datos.
- Licencia no disponible: al no especificarse licencia, no hay autorizacion explicita para uso comercial. Conviene contactar con el autor antes de cualquier uso en produccion.
- Valor de benchmark no extrapolable: las puntuaciones de la evaluacion acotada (10 ejemplos por tarea) no equivalen a los resultados completos de CORE.
- Sin garantias de mantenimiento: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el artefacto esta pensado como material suplementario de un articulo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieChen/loop-untied-2-d10
- Repositorio de codigo del articulo: https://github.com/cue-engineering/loop
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Tokenizador GPT-2 referenciado por el modelo: `tiktoken.get_encoding("gpt2")`
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo, al articulo ni a evaluaciones independientes; los resultados devueltos corresponden a canales de YouTube sin relacion con el contenido de esta ficha.
