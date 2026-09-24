# denis-pplx/autojev-27b

## Resumen

AutoJev-27B es un modelo de decision multimodal publicado por el usuario denis-pplx, afinado a partir de Qwen/Qwen3.8-27B. A diferencia de un modelo generativo convencional, su funcion es devolver una distribucion de probabilidad sobre un conjunto de opciones (choices) que se le suministran, en un unico forward pass por pregunta. Segun el autor, todo el ciclo —investigacion, generacion de datos, entrenamiento, evaluacion y despliegue— se ejecuto con agentes autonomos, con supervision humana unicamente en la definicion de objetivos y el alcance.

El modelo tiene 26.085.330.160 parametros (~26,1 B) y se distribuye en formato safetensors con licencia Apache 2.0 para los pesos y MIT para el codigo de acompanamiento. Se presenta como una implementacion independiente inspirada en Jev, con una API compatible con TypeSafe y un playground en navegador. En la tabla de resultados publicada por el autor, AutoJev-27B alcanza un 84,60 % de exactitud global frente al 69,83 % de su modelo base Qwen3.8-27B, con mejor calibracion (ECE 0,04282 frente a 0,06483).

Su relevancia actual esta en el nicho de los modelos de decision calibrada: sistemas que no solo eligen una opcion, sino que cuantifican su confianza, algo util en pipelines de etiquetado, moderacion o enrutamiento donde la incertidumbre debe ser accionable. El autor advierte explicitamente de que los benchmarks publicados miden decisiones sobre texto y que el soporte de imagenes no constituye una afirmacion de precision sobre imagenes naturales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; modelo derivado de Qwen/Qwen3.8-27B (las etiquetas del repositorio incluyen qwen3_5) |
| Parametros totales | 26.085.330.160 (~26,1 B) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion publicada; los pesos se publican en BF16 (~49 GiB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 para los pesos; MIT para el codigo del repositorio |
| Formato de pesos | safetensors (libreria PyTorch), repositorio de 153,8 GB |
| Pipeline declarado | text-classification |
| Requiere codigo remoto | Si (etiqueta custom-code) |
| Descargas / likes | 166 descargas, 13 likes |
| Fecha de creacion / actualizacion | 2026-09-19 / 2026-09-22 |

## Arquitectura y entrenamiento

El autor no documenta la arquitectura interna mas alla de indicar que se trata de un ajuste completo (full-weight SFT) sobre Qwen3.8-27B y que el modelo opera como un clasificador de decisiones: recibe una pregunta y una lista de opciones, y devuelve probabilidades sobre esas opciones en un unico forward pass. La cabeza de salida y el modo de puntuacion no se detallan en la model card. El repositorio incluye un cargador propio (`DecisionModel`) y un servidor, lo que apunta a codigo personalizado no cubierto por las clases estandar de Transformers.

El entrenamiento se ejecuto en una unica GPU H200 con ajuste completo de pesos, sobre 73.000 ejemplos de entrenamiento unicos y 286 actualizaciones (steps), con funcion de perdida de entropia cruzada. El checkpoint liberado es el numero 200. La calibracion se ajusta por separado mediante un escalado de temperatura escalar, un detalle relevante porque explica la mejora en ECE y Brier respecto al modelo base. El corpus exacto de entrenamiento no se distribuye con el modelo, por lo que no es posible auditar la composicion del dataset ni su procedencia.

## Capacidades

- Decision con opciones cerradas: devuelve una distribucion de probabilidad sobre un conjunto de opciones proporcionado por el usuario, en lugar de texto libre.
- Puntuacion de opciones: el endpoint `POST /v1/systemone` admite los modos `choice`, `noul` y `score`.
- Salida calibrada: incluye escalado de temperatura para que las probabilidades se ajusten mejor a la frecuencia real de acierto (ECE y Brier publicados).
- Entrada multimodal: acepta imagenes en base64 de forma opcional, aunque el autor no reclama precision sobre imagenes naturales.
- API y playground: servidor propio con documentacion en `/docs` y playground en `http://localhost:8000`.
- Autenticacion: soporte de `AUTOJEV_API_KEY` para habilitar autenticacion en el servidor.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta comportamiento agentico ni razonamiento multi-paso mas alla de la decision en un unico forward pass.
- No se documentan capacidades multilingues ni lista de idiomas soportados.

## Casos de uso

- Etiquetado asistido con umbral de confianza: el modelo devuelve probabilidades por opcion, de modo que un pipeline puede aceptar automaticamente las etiquetas con probabilidad alta y derivar a revision humana las de baja confianza, usando el ECE bajo como garantia de que el umbral elegido se corresponde con la tasa real de error.
- Moderacion de contenido con categorias cerradas: al plantear la clasificacion como una eleccion entre categorias predefinidas, se obtiene una salida directamente interpretable y calibrada, adecuada para sistemas donde se necesita una decision binaria o multinivel por elemento.
- Enrutamiento de tickets o consultas: el modelo puede puntuar a que cola o especialista corresponde una consulta segun un conjunto fijo de opciones, en un unico forward pass, lo que reduce la latencia frente a esquemas generativos con decodificacion.
- Evaluacion automatica de respuestas: el endpoint `score` permite puntuar opciones candidatas, util para comparar respuestas generadas por otros modelos en un banco de pruebas sin recurrir a un juez generativo.
- Anotacion de datasets para entrenamiento: con 73.000 ejemplos generados en su propio ciclo de entrenamiento, el modelo encaja como anotador de bajo coste por elemento, siempre que se valide la calibracion sobre el dominio objetivo.
- Clasificacion de documentos con componente visual: dado su soporte de imagenes en base64, puede emplearse en tareas de decision sobre capturas o documentos escaneados, asumiendo que el autor no garantiza precision sobre imagenes naturales.
- Seleccion de acciones en sistemas de decision: para conjuntos discretos de acciones con coste asimetrico, la salida probabilistica permite aplicar reglas de decision bayesianas (minimizar riesgo esperado) en lugar de tomar siempre la clase mas probable.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (decisiones sobre texto):

| Modelo | Exactitud global (mayor mejor) | ECE (menor mejor) | Brier (menor mejor) |
|---|---:|---:|---:|
| Qwen3.8-27B | 69,83 % | 0,06483 | 0,40834 |
| AutoJev-27B | 84,60 % | 0,04282 | 0,22027 |
| Jev | 82,79 % | 0,05274 | 0,25400 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar de conocimiento o generacion. El autor indica que estas cifras miden decisiones sobre texto y que el soporte de imagenes no implica una afirmacion de precision sobre imagenes naturales. No se especifica el conjunto de evaluacion ni su tamano, por lo que las cifras no son verificables de forma independiente.

## Requisitos de hardware

- VRAM estimada: aproximadamente 49 GiB solo para los pesos en BF16, mas el overhead de runtime. Con esa base, se necesita al menos una GPU de 80 GB para inferencia comoda.
- GPU recomendadas: H200 (la empleada en el entrenamiento) y H100 o A100 de 80 GB para despliegue. No hay datos publicados para GPUs de 40 GB o menos.
- GPU de consumo: no cabe en una unica RTX 4090 (24 GB) ni en una RTX 3090 (24 GB) en BF16. El despliegue en consumer exigiria cuantizacion, y el autor no documenta soporte ni pesos cuantizados.
- Multi-GPU: como alternativa, reparto del modelo entre varias GPUs, aunque no se documenta configuracion de tensor parallelism.
- Entorno de ejecucion: Python 3.12 o superior, gestor `uv` con `uv sync --frozen --python 3.12`, descarga de pesos con `hf download denis-pplx/autojev-27b --local-dir checkpoints/selected` y arranque con `AUTOJEV_CHECKPOINT=checkpoints/selected uv run autojev-serve`.
- Opciones de despliegue: servidor propio del repositorio (`autojev-serve`) y el cargador `DecisionModel`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y el uso de codigo personalizado (`custom-code`) hace probable que no funcionen sin adaptacion.
- Latencia y throughput: no disponibles en la informacion publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud (benchmark del autor) | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AutoJev-27B | 26,1 B | No disponible | 84,60 % | 0,04282 | Apache 2.0 (pesos), MIT (codigo) | Pesos en HuggingFace; el autor indica que pueden ser privados y requerir autenticacion |
| Qwen3.8-27B (base) | No disponible | No disponible | 69,83 % | 0,06483 | No disponible en la informacion proporcionada | Modelo base referenciado como Qwen/Qwen3.8-27B |
| Jev | No disponible | No disponible | 82,79 % | 0,05274 | No disponible | Referenciado por el autor como inspiracion del trabajo |

No se dispone de datos de parametros, contexto ni licencia de los modelos comparados. La comparacion se limita, por tanto, a las metricas de decision publicadas por el autor de AutoJev-27B, que no son independientes.

## Limitaciones y advertencias

- Las cifras de exactitud, ECE y Brier proceden unicamente de la model card del autor; no hay evaluacion independiente ni se detalla el conjunto de prueba.
- El corpus de entrenamiento no se publica, lo que impide auditar sesgos, composicion o posible contaminacion de los datos de evaluacion.
- No se documentan idiomas soportados; no hay garantia de comportamiento correcto fuera del idioma o idiomas usados en el entrenamiento.
- Riesgo de alucinacion acotado por diseno: al elegir entre opciones cerradas no puede inventar texto libre, pero si puede asignar probabilidad alta a una opcion incorrecta, especialmente fuera de la distribucion de entrenamiento.
- El soporte multimodal existe a nivel de API (imagenes en base64) pero el autor advierte que no es una afirmacion de precision sobre imagenes naturales.
- La licencia de los pesos es Apache 2.0, lo que permite uso comercial, pero el codigo incluye etiqueta `custom-code` y requiere confiar en el codigo remoto del repositorio; conviene revisarlo antes de desplegarlo en produccion.
- El repositorio ocupa 153,8 GB frente a los ~49 GiB de pesos en BF16, lo que sugiere la presencia de checkpoints adicionales; hay que seleccionar explicitamente el checkpoint `selected`.
- El autor indica que, mientras los pesos sean privados, es necesario autenticarse con `uv run hf auth login` antes de descargarlos.
- Es un ajuste completo de pesos sobre un modelo base, por lo que hereda las limitaciones de Qwen3.8-27B, no documentadas en esta informacion.
- No hay datos de latencia, throughput ni pruebas de carga en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/denis-pplx/autojev-27b
- Repositorio de codigo: https://github.com/denis-pplx/autojev
- Licencia de pesos (Apache 2.0): https://huggingface.co/denis-pplx/autojev-27b/blob/main/LICENSE
- Modelo base referenciado: Qwen/Qwen3.8-27B (no se ha proporcionado URL directa)
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo: todas las coincidencias corresponden al nombre propio o a empresas llamadas Denis y no guardan relacion con el proyecto.
- No se han encontrado papers, blogs tecnicos ni demos adicionales en la informacion proporcionada.
