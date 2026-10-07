# run-saina/saina-helm-0.8b

## Resumen

Saina Helm 0.8B es un modelo de decision de 852.985.920 parametros desarrollado por run-saina y publicado en HuggingFace bajo licencia Apache-2.0. No es un modelo generativo: recibe un contexto, una pregunta y una lista de opciones facilitada en tiempo de peticion, y devuelve una probabilidad por cada opcion calculada a partir del estado oculto del ultimo token. La propia model card indica que no se genera texto y que `generate()` no es la interfaz prevista.

Tecnicamente es un fine-tuning de Qwen/Qwen3.5-0.8B al que se ha anadido una cabeza de probabilidad entrenada (`head.safetensors`); el repositorio contiene los pesos fusionados completos. Soporta dos modos de inferencia: `single_label`, con softmax para que las probabilidades sumen 1 y se elija una sola opcion, y `multi_label`, con sigmoide independiente por opcion para que puedan activarse cero o mas. Admite hasta 588 opciones por peticion y una ventana de contexto de 8.192 tokens.

Su interes practico esta en decisiones repetitivas que habitualmente se resuelven con un LLM generativo: enrutado de intenciones, triaje, seleccion de herramientas o listas de verificacion. Al definirse las opciones en la peticion, un unico modelo cubre tareas distintas sin reentrenamiento y devuelve una salida ya estructurada en forma de vector de probabilidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tuning de Qwen/Qwen3.5-0.8B con cabeza de probabilidad entrenada (no se detalla la arquitectura interna del modelo base en la informacion disponible) |
| Parametros totales | 852.985.920 (dato real de safetensors) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | GGUF disponible para CPU (los tipos concretos no se detallan en la informacion disponible) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pesos fusionados completos + `head.safetensors`); existe version GGUF |
| Tamano del repositorio | 2,1 GB |
| Opciones maximas por peticion | 588 |
| Modos de salida | `single_label` (softmax) y `multi_label` (sigmoide) |
| Libreria | transformers (requiere transformers>=5) |
| Pipeline declarado | text-classification |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B y se ha afinado anadiendo una cabeza de probabilidad entrenada, guardada como `head.safetensors`. El mecanismo de inferencia no es autorregresivo: se construye un prompt con el contexto, la pregunta y las opciones, y se lee el estado oculto del ultimo token para producir las puntuaciones. Por ese motivo la model card insiste en usar el script `helm.py` incluido en el repositorio, que reproduce exactamente el formato de prompt con el que se entreno el modelo; cualquier prompt personalizado altera la distribucion de puntuaciones. El repositorio aloja los pesos ya fusionados, no un adaptador.

Los detalles sobre el numero de tokens de entrenamiento, la composicion del dataset y el uso de tecnicas de alineacion como RLHF o DPO no estan disponibles en la informacion proporcionada. Tampoco se documenta si las capacidades multimodales del modelo base se conservan: el repositorio incluye la etiqueta `image-text-to-text`, pero la model card no describe ningun uso de imagen ni ninguna entrada distinta de contexto textual y lista de opciones. La model card tampoco detalla innovaciones de atencion, decodificacion especulativa ni otras optimizaciones.

## Capacidades

- Clasificacion con opciones definidas en tiempo de peticion: hasta 588 alternativas por consulta sin reentrenamiento.
- Clasificacion monoetiqueta: salida normalizada con softmax, probabilidades que suman 1.
- Clasificacion multietiqueta: puntuacion independiente con sigmoide por cada opcion.
- Clasificacion zero-shot: las etiquetas se aportan en la peticion, no requieren ajuste previo.
- Enrutado de intenciones y triaje sobre texto de entrada.
- Seleccion de herramientas o acciones en flujos de agentes, devolviendo una probabilidad por herramienta candidata.
- Evaluacion de listas de verificacion (por ejemplo, criterios de revision) como conjunto de opciones multietiqueta.
- Manejo de contexto de hasta 8.192 tokens por peticion.
- No genera texto; no se documentan capacidades de tool calling en sentido estricto, razonamiento multi-paso, codigo, matematicas, vision ni audio.
- Idiomas soportados: no disponible.

## Casos de uso

- Enrutado de intenciones en atencion al cliente: con el texto del cliente como contexto, la pregunta "que quiere el cliente" y un catalogo de intenciones como opciones, el modelo devuelve un vector de probabilidades que permite dirigir la conversacion al flujo adecuado. Funciona bien en este escenario porque el catalogo puede cambiar en cada peticion sin reentrenar y admite hasta 588 opciones.

- Triaje de tickets de soporte: en modo `multi_label` con opciones como "incidencia de facturacion", "fallo tecnico", "peticion de baja" o "consulta comercial", el modelo puede marcar varias etiquetas por ticket y priorizar la cola segun las probabilidades obtenidas.

- Seleccion de herramientas en agentes: dado el estado de la conversacion y la lista de herramientas disponibles, el modelo puntua cada herramienta y el orquestador ejecuta la de mayor probabilidad. Es adecuado porque la lista de herramientas viaja en la peticion y el coste computacional es una unica pasada hacia delante, sin generacion autorregresiva.

- Moderacion y clasificacion de contenido: evaluacion multietiqueta de politicas (por ejemplo, spam, toxicidad, suplantacion de identidad) sobre un texto dado, con umbrales ajustados por el equipo sobre su propio conjunto de validacion.

- Listas de verificacion en revision de codigo o de documentacion: la descripcion del cambio actua como contexto y los criterios de revision como opciones multietiqueta ("falta test", "cambio incompatible de API", "requiere actualizacion de documentacion"), lo que permite etiquetar automaticamente las propuestas.

- Analisis de encuestas y feedback: clasificacion zero-shot de respuestas abiertas en un conjunto de categorias definido por el analista, sin necesidad de anotar datos ni entrenar un clasificador especifico.

- Prefiltrado en pipelines de recuperacion: decidir con una sola pasada si una consulta requiere busqueda documental, y en caso afirmativo, con que subconjunto de indices contrastarla, reduciendo llamadas a modelos mayores.

- Clasificacion documental con catalogos grandes: gracias al limite de 588 opciones y a los 8.192 tokens de contexto, permite etiquetar fragmentos largos contra taxonomias extensas en una unica llamada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de tareas de clasificacion, y los resultados de la busqueda web no aportan datos tecnicos sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir de los 852.985.920 parametros, no cifras publicadas por el autor): aproximadamente 1,7 GB en bf16/fp16 solo para pesos, en torno a 0,9 GB en int8 y entre 0,5 y 0,6 GB en cuantizacion de 4 bits.
- El repositorio ocupa 2,1 GB, por lo que conviene prever ese espacio en disco ademas de la memoria de inferencia y el espacio de activaciones.
- Cabe con holgura en GPU de consumo: cualquier tarjeta con 4 GB o mas de VRAM es suficiente en cuantizacion de 4 bits, y 8-12 GB permiten ejecutar en bf16 con margen (por ejemplo, RTX 3060, RTX 4060, RTX 4070, RTX 4090).
- En GPU de centro de datos (A100, H100, L40S) el modelo es claramente sobredimensionado para una sola instancia; su interes alli seria el despliegue agregado de muchas replicas o el batching de alto volumen.
- Existe una version GGUF para CPU, lo que permite inferencia sin GPU mediante llama.cpp u Ollama.
- La interfaz prevista es el script `helm.py` del repositorio con transformers>=5 sobre los pesos safetensors; el soporte en vLLM, TGI u otros servidores no esta confirmado en la informacion disponible.
- Al no haber decodificacion autorregresiva, la inferencia se limita a una pasada hacia delante y la latencia es estructuralmente inferior a la de un modelo generativo del mismo tamano. No se han publicado cifras concretas de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de salida | Licencia |
|---|---|---|---|---|
| run-saina/saina-helm-0.8b | 852.985.920 | 8.192 tokens | Vector de probabilidades por opcion (opciones definidas en la peticion) | Apache-2.0 |
| Qwen/Qwen3.5-0.8B (modelo base) | No disponible (el identificador del repositorio indica 0,8B) | No disponible | Texto generado | No disponible |
| Encoders de clasificacion zero-shot (familias tipo BART-MNLI o DeBERTa) | No disponible | No disponible | Etiquetas de un catalogo fijado en el entrenamiento | No disponible |

No se dispone de datos verificados de benchmarks, contexto o licencia de las alternativas dentro de la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. La diferencia funcional relevante frente a los encoders de clasificacion zero-shot clasicos es que aqui el catalogo de opciones se define en cada peticion y admite hasta 588 alternativas, mientras que frente al modelo base la diferencia es que no genera texto y devuelve directamente probabilidades.

## Limitaciones y advertencias

- Las probabilidades no estan calibradas; la propia model card recomienda fijar los umbrales sobre datos propios.
- Los resultados son sensibles a la formulacion de la pregunta y de las opciones; cambios de redaccion alteran las puntuaciones.
- El modelo solo funciona correctamente con el formato de prompt generado por `helm.py`; usar un prompt propio invalida las puntuaciones.
- `generate()` no es la interfaz prevista: el modelo lee el estado oculto del ultimo token, no decodifica texto.
- El autor recomienda evaluar en la tarea concreta antes de utilizarlo para decisiones con consecuencias.
- No se documentan sesgos conocidos, composicion del dataset de entrenamiento ni idiomas soportados, lo que dificulta evaluar su comportamiento fuera del ingles o en dominios especializados.
- No se documenta el uso de datos de alineacion (RLHF, DPO) ni de filtrado de datos, por lo que el riesgo de comportamientos indeseados en dominios sensibles no puede acotarse con la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero se desconoce la licencia y las condiciones del modelo base Qwen/Qwen3.5-0.8B a partir de la informacion proporcionada.
- El repositorio registra 0 descargas y 0 valoraciones en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/run-saina/saina-helm-0.8b
- Version GGUF para CPU: https://huggingface.co/run-saina/saina-helm-0.8b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B

Nota: los resultados de la busqueda web disponible corresponden a un videojuego ("Run" y "Run 3" en Coolmath Games), a una tienda de material deportivo (i-Run) y a una aseguradora francesa (RUN Assurance). Ninguno de ellos guarda relacion con el modelo, por lo que no se han incluido como fuentes tecnicas.
