# models4world/iris-quay-84

## Resumen

models4world/iris-quay-84 es un modelo publicado en HuggingFace por la cuenta models4world. El repositorio se creo el 21 de septiembre de 2026 y se actualizo el mismo dia, cuenta con 10 descargas y 0 likes en el momento de la consulta, y no incluye model card, pipeline declarado, licencia ni lista de idiomas soportados. La unica etiqueta de familia tecnica presente es `qwen3_5`, junto a `safetensors` y `region:us`, lo que sugiere un linaje basado en la familia Qwen 3.5, aunque no hay confirmacion documental de ello.

La informacion disponible es en gran medida contradictoria. El recuento de parametros de los archivos safetensors indica 3.054.832 parametros (aproximadamente 3,05 millones), mientras que el tamano del repositorio es de 54,7 GB. Un modelo de 3,05 millones de parametros ocuparia unos 12 MB en fp32 y unos 6 MB en bf16, de modo que ambas cifras no pueden corresponder al mismo conjunto de pesos en el mismo formato. Esta discrepancia impide determinar con fiabilidad el orden de magnitud del modelo y, por tanto, cualquier valoracion de rendimiento, requisitos de hardware o comparativa con alternativas.

Por todo lo anterior, esta ficha se limita a inventariar los datos verificables y marca explicitamente como "no disponible" todo aquello que no consta en la informacion proporcionada. Las busquedas web realizadas no devolvieron ningun resultado relacionado con el modelo: los enlaces recuperados corresponden a foros de pizza y a mensajes de felicitacion de cumpleanos, sin ninguna relacion con inteligencia artificial, por lo que no se han utilizado como fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta `qwen3_5` apunta a un posible linaje Qwen 3.5, sin confirmar) |
| Parametros totales | 3.054.832 segun el recuento de safetensors; no concuerda con el tamano del repositorio (54,7 GB) |
| Parametros activos | no disponible (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo declara safetensors; no hay GGUF, AWQ ni GPTQ publicados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 54,7 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion | 21 de septiembre de 2026 |
| Fecha de ultima actualizacion | 21 de septiembre de 2026 |
| Descargas / likes | 10 / 0 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. La unica referencia disponible es la etiqueta `qwen3_5` del repositorio, que sugiere una posible pertenencia a la familia Qwen 3.5, habitualmente asociada a transformers con atencion por grupos (GQA) y, en algunas variantes, a arquitecturas MoE. No hay ninguna confirmacion en la informacion proporcionada de que iris-quay-84 sea un transformer denso, un MoE, un modelo hibrido o cualquier otra variante, ni de que emplee atencion lineal, decodificacion especulativa u otras innovaciones.

Tampoco consta el volumen de tokens de entrenamiento, la composicion del dataset, la existencia de fases de ajuste (SFT, RLHF, DPO) ni el proceso de tokenizacion. No se dispone de informacion sobre el vocabulario, la estrategia de posicion (RoPE, ALiBi, etc.) ni la configuracion de atencion. En consecuencia, no es posible evaluar la idoneidad del modelo para tareas concretas a partir de su proceso de entrenamiento.

Cabe senalar que el recuento de parametros declarado (3.054.832) y el tamano del repositorio (54,7 GB) son incompatibles entre si: 54,7 GB en bf16 corresponderian a un modelo del orden de 27.000 millones de parametros, aproximadamente cuatro ordenes de magnitud por encima de la cifra declarada. Sin acceso a la configuracion del modelo o a la lista completa de archivos, no es posible resolver esta discrepancia.

## Capacidades

No se ha publicado informacion sobre las capacidades del modelo. En concreto:

- Generacion de texto: no disponible.
- Razonamiento, matematicas y codigo: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento en multiples pasos: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades multilingues: no disponible (no consta lista de idiomas).
- Contexto largo: no disponible (no consta longitud de contexto).

No debe asumirse ninguna de estas capacidades a partir de la etiqueta `qwen3_5` ni de los nombres de otros modelos de la familia, ya que no hay documentacion que lo respalde.

## Casos de uso

No es posible proponer casos de uso concretos y realistas sin conocer el tamano real, la longitud de contexto, los idiomas soportados, la licencia y el rendimiento del modelo. Cualquier escenario que se redactase aqui seria especulativo y podria inducir a error a quien deba evaluar el modelo.

A modo de orientacion sobre que comprobar antes de plantear un caso de uso, los datos que faltan y que son imprescindibles son los siguientes:

- Licencia: sin ella no se puede determinar si el uso comercial esta permitido.
- Recuento real de parametros: determina si el modelo cabe en una GPU de consumo o requiere hardware de centro de datos.
- Longitud de contexto: condiciona si sirve para conversacion multi-turno, analisis de documentos largos o generacion de codigo sobre repositorios completos.
- Idiomas soportados: determina si es util para aplicaciones en castellano.
- Formato de pesos: la ausencia de GGUF limita el despliegue en llama.cpp u Ollama.
- Resultados de calidad: sin benchmarks no se puede justificar su eleccion frente a alternativas consolidadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No es posible ofrecer cifras de VRAM fiables debido a la contradiccion entre el recuento de parametros y el tamano del repositorio. Se detallan a continuacion los dos escenarios posibles, claramente etiquetados como hipotesis:

- Escenario A, si el recuento de 3.054.832 parametros fuese correcto: el modelo ocuparia del orden de 12 MB en fp32 y 6 MB en bf16. La inferencia cabria en CPU, en una Raspberry Pi o incluso en un dispositivo movil, con menos de 1 GB de RAM. No tendria sentido hablar de GPU dedicada ni de vLLM/TGI para este caso.
- Escenario B, si el repositorio de 54,7 GB reflejase pesos reales en bf16: corresponderia a un modelo del orden de 27.000 millones de parametros. La VRAM estimada seria de aproximadamente 54-58 GB en bf16 (pesos mas cache KV), 28-32 GB en cuantizacion de 8 bits y 15-18 GB en cuantizacion de 4 bits.
- GPU recomendadas en el escenario B: una H100 de 80 GB o dos A100 de 40 GB para bf16 sin cuantizar; una RTX 4090 de 24 GB o una L40S de 48 GB para cuantizacion de 4 u 8 bits.
- Cabe en GPU de consumo en el escenario B unicamente con cuantizacion agresiva (4 bits) y ventanas de contexto moderadas, siempre que la cache KV no desborde los 24 GB.
- Opciones de despliegue: no disponibles. El repositorio solo publica safetensors, sin GGUF, AWQ ni GPTQ, por lo que llama.cpp y Ollama no son utilizables directamente. vLLM o TGI podrian emplearse si la configuracion del modelo es compatible, lo cual no esta confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No es posible identificar modelos comparables sin conocer el tamano real del modelo, su licencia y su categoria funcional. La unica referencia disponible es la etiqueta `qwen3_5`, que apunta a la familia Qwen 3.5, pero no hay datos suficientes para establecer una comparacion con parametros, contexto, rendimiento, licencia y disponibilidad de forma rigurosa.

## Limitaciones y advertencias

- Ausencia total de model card: no hay documentacion sobre arquitectura, entrenamiento, datos ni limitaciones declaradas por el autor.
- Inconsistencia de datos: el recuento de parametros (3.054.832) y el tamano del repositorio (54,7 GB) no son compatibles, lo que impide estimar requisitos de hardware o coste de inferencia.
- Licencia no declarada: no se puede asumir que el uso comercial este permitido. En ausencia de licencia explicita, deben aplicarse las condiciones por defecto de HuggingFace y del derecho de autor, lo que en la practica supone un riesgo legal para produccion.
- Idiomas no declarados: no hay garantia de soporte de castellano ni de ningun otro idioma.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que dependan de ventanas largas.
- Riesgo de alucinacion: no evaluado; al no existir benchmarks ni evaluaciones publicadas, se desconoce la tasa de error en tareas de facto.
- Sesgos: no evaluados ni documentados.
- Repositorio con 10 descargas y 0 likes: no existe evidencia de uso en produccion ni de validacion por parte de la comunidad.
- Sin cuantizaciones publicadas: el despliegue en entornos de bajos recursos o en runtimes de CPU como llama.cpp u Ollama no es viable sin convertir los pesos.
- Fecha de creacion futura respecto a la fecha de consulta habitual: conviene verificar la integridad y el origen del repositorio antes de cualquier uso.
- Las busquedas web no arrojaron ninguna fuente tecnica relacionada con el modelo; los resultados obtenidos eran irrelevantes (foros de pizza y mensajes de cumpleanos) y no se han utilizado.

## Enlaces

- HuggingFace: https://huggingface.co/models4world/iris-quay-84
- Paper: no disponible
- Blog o anuncio: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
- Otros enlaces relevantes: no disponible (las busquedas web realizadas no devolvieron ningun resultado relacionado con el modelo)
