# crh225/plumb-4b-GGUF

## Resumen

Plumb-4B GGUF es la version cuantizada en formato GGUF del modelo crh225/plumb-4b, un modelo de decision de aproximadamente 4.205.751.296 parametros (unos 4,2 mil millones) publicado por el usuario crh225 bajo licencia Apache-2.0. No es un modelo conversacional al uso: su funcion es recibir una pregunta con un conjunto de opciones etiquetadas con letras, redactada como JSON (evidencia, criterio y opciones), y devolver una unica letra de opcion. Su valor real no esta en la letra elegida, sino en la distribucion de probabilidad sobre las letras, calibrada mediante una temperatura de calibracion declarada de T = 2.07.

El repositorio incluye dos cuantizaciones: `plumb-4b-v5-Q8_0.gguf` (8 bits, ~4,5 GB, la mas cercana al modelo completo) y `plumb-4b-v5-Q4_K_M.gguf` (4 bits, 2,7 GB). Ambas estan pensadas para ejecutarse con llama.cpp u Ollama, en practicamente cualquier GPU e incluso en CPU. Incluye un `Modelfile` con la plantilla del prompt de decision, de modo que una peticion de chat estandar que transporte la pregunta en JSON genera el prompt correcto.

Es relevante ahora porque cubre un nicho poco habitual: modelos pequenos, ejecutables en local, disenados explicitamente para producir decisiones calibradas con probabilidades utilizables (no solo etiquetas), lo que permite establecer umbrales de confianza y derivar a revision humana. La contrapartida es que el modelo es muy reciente en el repositorio (0 descargas y 0 likes en el momento de redactar esta ficha) y no publica benchmarks ni detalles de arquitectura o entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4.205.751.296 (~4,2 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (el ejemplo oficial de llama.cpp arranca el servidor con `-c 8192`) |
| Tipos de cuantizacion | Q8_0 (8 bits) y Q4_K_M (4 bits) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (generado con llama.cpp) |
| Modelo base | crh225/plumb-4b |
| Tamano del repositorio | 7,2 GB |
| Tipo de modelo | modelo de decision (decision-model), no conversacional |
| Temperatura de calibracion | T = 2.07 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base (no se especifica si es un transformer denso, MoE, SSM o hibrido), ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. Tampoco se documenta el proceso de destilado o ajuste que convierte el modelo base en un modelo de decision restringido a emitir una letra de opcion.

Lo que si se documenta es el proceso de conversion y cuantizacion: se uso `convert_hf_to_gguf.py --no-mtp` y despues `llama-quantize`, generando los ficheros Q8_0 y Q4_K_M. El elemento tecnico mas destacable es el mecanismo de calibracion en inferencia: se solicita la generacion de un unico token con `logprobs` y `top_logprobs`, se leen las log-probabilidades de las letras de opcion, se dividen por la temperatura de calibracion 2.07 y se renormalizan para obtener una distribucion de probabilidad utilizable. El `Modelfile` del repositorio incorpora la plantilla del prompt de decision para Ollama.

## Capacidades

- Emision de decisiones restringidas: dado un enunciado, un criterio y una lista de opciones etiquetadas con letras, devuelve una unica letra de opcion.
- Exposicion de log-probabilidades: soporta `logprobs` y `top_logprobs`, lo que permite reconstruir la distribucion completa sobre las opciones y no solo la etiqueta ganadora.
- Calibracion declarada: la distribucion resultante se ajusta dividiendo por T = 2.07 y renormalizando, lo que facilita su uso para umbrales de confianza.
- Entrada estructurada en JSON: la plantilla incluida espera campos de evidencia, criterio e instrucciones con opciones.
- Compatibilidad con endpoints tipo chat: el tag `endpoints_compatible` y el `Modelfile` permiten lanzar peticiones de chat convencionales que transportan la pregunta como JSON.
- Uso en ingles: el unico idioma declarado es `en`.
- No documentado: no hay informacion sobre tool calling, function calling, soporte de agentes, razonamiento multi-paso, modo thinking, vision, audio ni generacion de texto libre o explicaciones. Por diseno, el modelo no produce respuestas en lenguaje natural, solo letras de opcion.

## Casos de uso

- Verificacion de incidencias logisticas: el propio autor ilustra el caso de un pedido entregado en el numero 17 mientras el cliente vive en el 71, con opciones `delivered`, `misdelivered`, `unknown`. El modelo devuelve la letra y su probabilidad, lo que permite marcar automaticamente los casos claros y encolar los dudosos.
- Enrutado de tickets de soporte: clasificar cada ticket en un conjunto cerrado de categorias o colas (facturacion, envios, devoluciones, tecnico) usando la evidencia del texto; las probabilidades calibradas permiten fijar un umbral por debajo del cual el ticket se asigna a un agente humano.
- Triaje de severidad en operaciones: decidir entre niveles predefinidos (critico, alto, medio, bajo) a partir de la evidencia de una alerta, con derivacion automatica cuando la distribucion es ambigua.
- Moderacion de contenido con abandono: clasificar contenido en permitido, revisable o prohibido, usando la probabilidad de la opcion ganadora para decidir si se aplica la accion automatica o se escala a revision.
- Clasificacion binaria de cumplimiento: evaluar si un caso cumple o no un criterio normativo concreto y registrar la probabilidad asociada como medida de riesgo, integrándose en pipelines de auditoria.
- Codificacion de respuestas abiertas en encuestas: asignar cada respuesta a una de las categorias predefinidas del cuestionario, con la probabilidad como indicador de calidad de la codificacion.
- Sistemas con abscision (human-in-the-loop): dado que el modelo expone la distribucion completa, se puede construir un clasificador que se abstenga y derive al humano cuando la entropia de la distribucion supere un umbral.
- Despliegue en local o en el borde: al ocupar 2,7 GB en Q4_K_M, puede ejecutarse en un portatil o en una maquina sin GPU para tareas de decision de alto volumen, evitando enviar datos sensibles a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF y los datos recibidos no incluyen metricas de MMLU, HumanEval, GSM8K, exactitud de decision, calibracion (ECE, Brier) ni comparaciones cuantitativas. Los resultados devueltos por la busqueda web no guardan relacion con el modelo y no aportan datos utilizables.

## Requisitos de hardware

- VRAM estimada para Q4_K_M (2,7 GB de pesos): en torno a 3,5-4,5 GB contando cache KV y overhead, con contexto de 8192. Estimacion derivada del tamano de fichero, no de mediciones publicadas.
- VRAM estimada para Q8_0 (~4,5 GB de pesos): en torno a 5,5-7 GB en las mismas condiciones. Estimacion igualmente derivada del tamano de fichero.
- CPU: ambas cuantizaciones estan pensadas para poder ejecutarse en CPU sin GPU, segun declara el autor.
- GPU de gama consumer: cabe con holgura en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070 y superiores; tambien en GPUs de 6-8 GB para la cuantizacion Q4_K_M.
- GPU de datacenter: A100, H100 y similares no son necesarias; el modelo ocupa una fraccion minima de su memoria y se usarian solo por agregacion de muchas instancias.
- Opciones de despliegue: llama.cpp (`llama-server -m plumb-4b-v5-Q8_0.gguf -c 8192 -ngl 99`), Ollama (creando el modelo con `ollama create plumb-4b -f Modelfile`) y la libreria `jevk5` (v0.2.1, solo biblioteca estandar) para el flujo `decide()`. No hay informacion sobre soporte en vLLM, TGI u otros servidores.
- Latencia y throughput: no disponible. Cabe senalar que, al generar un unico token, el coste dominante es el prefill del prompt, no la decodificacion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos alternativos de la misma categoria (modelos de decision calibrados que emitan una letra de opcion con log-probabilidades) ni datos de rendimiento de este modelo que permitan establecer una comparacion cuantitativa. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo o con alternativas comparables.

## Limitaciones y advertencias

- No es un modelo de chat: no genera respuestas en lenguaje natural ni explicaciones; si se le pide texto libre, su comportamiento no esta documentado.
- Salida restringida al conjunto de opciones: si la respuesta correcta no esta entre las letras ofrecidas, el modelo no puede abstenerse salvo que se incluya explicitamente una opcion tipo `unknown`.
- Idioma unico: solo se declara ingles (`en`); el rendimiento en castellano u otros idiomas no esta documentado y no deberia asumirse.
- Calibracion dependiente de la temperatura declarada: el flujo oficial divide las log-probabilidades por T = 2.07. Usar otro valor, u omitir la renormalizacion, invalida la interpretacion de las probabilidades como calibradas.
- Riesgo de alucinacion acotado pero no nulo: el modelo no inventa texto libre, pero puede seleccionar una letra incorrecta, especialmente si el enunciado es ambiguo o si las opciones no cubren todos los resultados posibles.
- Sin benchmarks publicos: no hay evidencia cuantitativa de exactitud, calibracion ni robustez fuera de dominio. Cualquier uso en produccion deberia ir precedido de una evaluacion propia sobre datos del dominio.
- Madurez y validacion comunitaria: el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion independiente.
- Licencia permisiva: Apache-2.0 permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion; conviene revisar la model card del modelo base `crh225/plumb-4b` para creditos adicionales.
- Dependencia de la plantilla de prompt: el `Modelfile` define el formato esperado (evidencia, criterio, opciones). Alterar el formato puede degradar la calidad de la decision.
- Versionado del modelo: los ficheros se nombran `v5`, lo que sugiere iteraciones previas no documentadas en este repositorio; conviene fijar la version concreta en cualquier despliegue.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/crh225/plumb-4b-GGUF
- Modelo base: https://huggingface.co/crh225/plumb-4b
- Libreria de inferencia jevk5 (v0.2.1): https://github.com/allebee/jevk5
- llama.cpp (herramienta de conversion y servidor): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Busqueda web: los resultados devueltos (Pinkbike, YouTube TV Help, YouTube Help, Google Help) no guardan ninguna relacion con el modelo y no se incluyen como enlaces relevantes.
