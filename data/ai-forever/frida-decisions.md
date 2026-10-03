# ai-forever/FRIDA-Decisions

## Resumen

FRIDA-Decisions es un modelo encoder de la familia T5, con 823.401.216 parámetros, desarrollado por УЭСМО / SberAI dentro del ecosistema ai-forever. No es un modelo generativo: su función es tomar decisiones estructuradas sobre texto en una sola pasada del encoder. Dado un texto y un conjunto de preguntas declaradas en la propia petición (JSON), devuelve para cada pregunta una de las opciones permitidas junto con su distribución de confianza, sin generar tokens ni requerir parseo posterior.

El modelo está afinado a partir de ai-forever/FRIDA y aborda un problema recurrente en producción: clasificar, enrutar y aplicar guardarraíles sin entrenar un modelo nuevo por cada conjunto de etiquetas. Como las opciones se escriben en texto dentro de la petición, cambiar las categorías es cambiar un JSON, no reentrenar. Soporta cuatro tipos de decisión (elección entre K opciones, puntuación ordinal, respuesta binaria sí/no y ordenación de candidatos) y está orientado principalmente a ruso, con etiquetado también para inglés.

Su relevancia práctica viene del coste: 28-34 ms por petición en una RTX 5060 Ti con textos de unos 400 tokens y 1-3 preguntas, 1,8 GiB de pico de memoria en PyTorch, 0,893 en el benchmark razvilka (735 ítems) y un build ONNX int8 que funciona en CPU. El empaquetado de todas las opciones en una única secuencia, junto con una caché de estado, permite responder un catálogo de 243 intenciones en 0,44 s frente a 4,65 s con una secuencia por opción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 encoder (encoder-only), modelo base ai-forever/FRIDA |
| Parametros totales | 823.401.216 |
| Longitud de contexto | No disponible de forma explicita; la configuracion de referencia de vLLM usa `--max-model-len 2048` y `FRIDA_DECISIONS_STATE_MAX=512` para el texto de entrada |
| Tipos de cuantizacion | bf16 (PyTorch y vLLM), fp32, int8 (ONNX, pesos int8 y activaciones int8 por token) |
| Idiomas soportados | Ruso (ru) e ingles (en); el modelo esta descrito como orientado a decisiones sobre texto en ruso |
| Licencia | MIT |
| Formato de pesos | safetensors y ONNX |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Pipeline | text-classification |
| Libreria | frida-decisions |
| Tamano del repositorio | 2.9 GB |
| Fecha de publicacion (metadatos) | 2 de octubre de 2026 |

## Arquitectura y entrenamiento

FRIDA-Decisions es un encoder T5 de 823M parámetros obtenido por fine-tuning sobre ai-forever/FRIDA. Al ser encoder-only, no decodifica texto: la salida es una distribución sobre las opciones declaradas en la petición. Todas las opciones de todas las preguntas comparten una única secuencia y el texto se codifica una sola vez; con la caché de estado, una pregunta de seguimiento sobre el mismo texto cuesta únicamente sus propios tokens. Esa estrategia de empaquetado es la que explica la diferencia entre 0,44 s para un catálogo de 243 intenciones y 4,65 s con una secuencia por opción.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; estos datos deben considerarse no disponibles. La evaluación publicada se realizó sobre el conjunto razvilka (735 ítems), con resultados de 0,893 en PyTorch bf16, 0,890 en vLLM y 0,891 en ONNX int8. Según el autor, es la puntuación más alta entre los modelos abiertos que ejecutó en razvilka, y la comparación emparejada con la API comercial TypeSafe Jev (0,897) arroja un p de McNemar de 0,84, es decir, sin diferencia estadísticamente significativa.

## Capacidades

- Toma de decisiones estructuradas sobre texto en una sola pasada del encoder, sin generación ni tokens de salida.
- Tipo `choice`: elegir cuál de K opciones es la correcta, devolviendo la clave de la opción y una distribución sobre el conjunto.
- Tipo `score`: situar un texto en una escala ordinal definida por el usuario.
- Tipo `noul`: respuesta binaria sí/no con criterios declarados para cada valor.
- Ordenación (ranking) de candidatos.
- Definición de etiquetas en tiempo de inferencia: un nuevo conjunto de etiquetas es un JSON nuevo, no un reentrenamiento.
- Confianza asociada a cada decisión, útil para umbrales y lógica de derivación.
- Enrutamiento de intenciones y clasificación zero-shot sobre catálogos grandes (el ejemplo documentado cubre 243 intenciones).
- Aplicación de guardarraíles y filtrado de contenido mediante preguntas booleanas.
- Reordenación (reranking) de candidatos según criterios textuales.
- Capacidad multilingüe limitada a ruso e inglés según los metadatos del repositorio.
- No dispone de generación de texto, tool calling, capacidades de agente, visión ni audio.

## Casos de uso

- Enrutamiento de tickets de soporte: con el tipo `choice` se clasifica la consulta entrante en temas como login, pago o entrega, y la clave devuelta alimenta directamente la cola correspondiente. El catálogo de 243 intenciones documentado se resuelve en 0,44 s en proceso y 0,33 s en vLLM, lo que permite clasificar en tiempo real.
- Priorización por urgencia: usando el tipo `score` con una escala ordinal (baja, media, alta), el modelo asigna un nivel de urgencia a cada mensaje, lo que permite ordenar la cola de atención sin reglas manuales.
- Moderación y antispam: con el tipo `noul` se declaran criterios para `true` y `false` (por ejemplo, publicidad o solicitudes de transferencia de dinero frente a quejas legítimas), y el resultado se usa como guardarraíl previo a otras etapas del pipeline.
- Segunda opinión sobre clasificadores existentes: el modelo actúa como reordenador o verificador sobre las salidas de un clasificador de producción, ya que devuelve una distribución de confianza y no solo un identificador de clase.
- Guardarraíles en asistentes conversacionales: antes de enviar una respuesta generada por un LLM, una pregunta booleana declara si el contenido cumple las políticas, y la confianza asociada decide si se bloquea o se revisa.
- Extracción de decisiones en formularios o encuestas: sobre respuestas abiertas en ruso, se aplican varias preguntas (tema, sentimiento ordinal, presencia de una condición) en una sola codificación del texto.
- Clasificación de bajo coste en CPU: el build ONNX int8 procesa una petición de 384 tokens con 3 preguntas en unos 0,9 s sobre 6 hilos de CPU, aproximadamente 2,5 veces más rápido que fp32, lo que cubre despliegues sin GPU.
- Servicio multiinquilino: el servidor vLLM agrupa peticiones de muchos usuarios y mantiene los textos ya leídos en la caché de prefijos, de modo que una pregunta de seguimiento sobre el mismo texto cuesta solo sus propios tokens (25-35 ms).

## Benchmarks y rendimiento

| Benchmark / configuracion | Resultado | Notas |
|---|---|---|
| razvilka, PyTorch bf16 | 0,893 | 735 ítems |
| razvilka, vLLM | 0,890 | `FRIDA_DECISIONS_STATE_MAX=512`, igual que en la ejecución PyTorch; vLLM y PyTorch difieren en 2 ítems, ambos casi empatados en fp32 |
| razvilka, ONNX int8 | 0,891 | Misma decisión que el modelo GPU en 726 de 735 ítems |
| razvilka, TypeSafe Jev (API comercial) | 0,897 | Comparación emparejada McNemar con FRIDA-Decisions: p = 0,84 |

| Latencia y throughput (una RTX 5060 Ti, bf16, vLLM 0.29) | Valor |
|---|---|
| Una peticion: ticket corto y texto de ~400 tokens, 1-3 preguntas | 25-45 ms |
| Pregunta de seguimiento sobre un texto ya leido por el servidor | 25-35 ms |
| Una peticion eligiendo entre 243 intenciones | ~0,33 s |
| 8 peticiones en vuelo, peticiones de tamano razvilka (~260 tokens) | ~60 peticiones/s |
| 8 peticiones en vuelo, tickets cortos (~190 tokens) | ~80 peticiones/s |
| Primera peticion tras el arranque | ~0,3 s |

| Latencia en proceso (PyTorch, RTX 5060 Ti) | Valor |
|---|---|
| Peticion de ~400 tokens, 1-3 preguntas | 28-34 ms |
| Catalogo de 243 intenciones, opciones empaquetadas | 0,44 s |
| Catalogo de 243 intenciones, una secuencia por opcion | 4,65 s |
| Memoria pico de PyTorch durante toda la ejecucion de razvilka | 1,8 GiB mas el contexto CUDA |
| ONNX int8, CPU, 6 hilos, 384 tokens con 3 preguntas | ~0,9 s |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de conocimiento general en la informacion disponible; el modelo es un encoder de decision y no un modelo generativo.

## Requisitos de hardware

- VRAM estimada: alrededor de 1,8 GiB de asignacion pico de PyTorch durante la ejecucion completa de razvilka, mas el contexto CUDA. Cabe holgadamente en cualquier GPU de consumo actual.
- GPU de referencia en las mediciones: RTX 5060 Ti, con `--gpu-memory-utilization 0.45` en vLLM porque la tarjeta tambien gestiona un monitor.
- Cabe en GPU de consumo: si, en tarjetas de gama media y baja con varios gigabytes libres; no requiere A100 ni H100 para inferencia.
- CPU: el build ONNX int8 con pesos int8 y activaciones int8 por token funciona sin PyTorch; una peticion de 384 tokens con 3 preguntas tarda unos 0,9 s sobre 6 hilos.
- Opciones de despliegue: PyTorch (`frida-decisions[torch]`), ONNX en CPU (`frida-decisions[onnx]`) y servidor vLLM con el plugin de IO processor (`frida-decisions[vllm]`, `--io-processor-plugin frida_decisions --no-enable-chunked-prefill --enforce-eager --max-model-len 2048`).
- Throughput estimado: unas 60 peticiones/s con 8 peticiones en vuelo sobre peticiones de ~260 tokens y unas 80 peticiones/s con tickets de ~190 tokens en una unica RTX 5060 Ti.
- Latencia estimada: 25-45 ms por peticion en vLLM y 28-34 ms en proceso para textos de ~400 tokens con 1-3 preguntas; alrededor de 0,3 s para la primera peticion tras el arranque del servidor.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | razvilka | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FRIDA-Decisions | Encoder T5, decision estructurada | 823M | Configuracion de referencia con `--max-model-len 2048`; no se declara una longitud de contexto oficial | 0,893 (bf16) / 0,891 (int8) / 0,890 (vLLM) | MIT | Pesos abiertos en HuggingFace (safetensors, ONNX) |
| TypeSafe Jev | API comercial de decision | No disponible | No disponible | 0,897 | No disponible (propietaria) | Solo API; diferencia con FRIDA-Decisions no significativa (McNemar p = 0,84) |
| ai-forever/FRIDA | Encoder T5 base | 823M | No disponible | No disponible | No disponible en la informacion proporcionada | Pesos abiertos en HuggingFace |
| Otros modelos abiertos evaluados en razvilka | No disponible | No disponible | No disponible | Inferiores a FRIDA-Decisions segun el autor | No disponible | No disponible |

La model card afirma que FRIDA-Decisions obtuvo la puntuacion mas alta entre los modelos abiertos probados en razvilka, pero no identifica cuales eran ni sus resultados, por lo que no es posible completar la comparativa con cifras.

## Limitaciones y advertencias

- Modelo encoder-only: no genera texto, no razona de forma multi-paso y no admite tool calling ni uso como agente.
- Cobertura de idiomas limitada a ruso e ingles. El modelo esta descrito explicitamente como orientado a decisiones sobre texto en ruso; su rendimiento en castellano no esta documentado ni validado.
- Las decisiones se restringen al conjunto de opciones declarado en la peticion: si las etiquetas estan mal definidas o son ambiguas, el resultado hereda esa ambiguedad. No hay mecanismo de abstenerse salvo que se declare una opcion para ello.
- Devuelve una distribucion de confianza por pregunta, pero la informacion disponible no documenta una calibracion de esas probabilidades ni umbrales recomendados.
- Riesgo de alucinacion acotado por diseno (la respuesta es siempre una de las opciones), pero persiste el riesgo de elegir una opcion incorrecta con alta confianza en dominios fuera de la distribucion de entrenamiento.
- No se han publicado datos sobre sesgos demograficos o linguisticos, composicion del dataset de entrenamiento ni evaluaciones de robustez; deben considerarse no disponibles.
- El numero de descargas del repositorio es 0 y la validacion externa es escasa: la unica evaluacion publicada por el autor es razvilka, lo que limita la evidencia en produccion.
- Licencia MIT, sin restricciones documentadas para uso comercial. Al derivar de ai-forever/FRIDA, conviene verificar la licencia y las condiciones del modelo base antes de un despliegue comercial.
- El despliegue con vLLM requiere flags especificos (`--no-enable-chunked-prefill`, `--enforce-eager`, `--io-processor-plugin frida_decisions`) y un `--hf-overrides` para declarar la arquitectura `FridaDecisionsModel`; sin ellos el servidor no funciona como se documenta.
- En las mediciones, la ejecucion en vLLM y la de PyTorch difieren en 2 items de razvilka, lo que indica una variabilidad minima pero real entre backends.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ai-forever/FRIDA-Decisions
- Codigo en GitHub: https://github.com/ai-forever/FRIDA-Decisions
- Demo (Space): https://huggingface.co/spaces/ai-forever/FRIDA-Decisions
- Dataset de evaluacion razvilka: https://huggingface.co/datasets/artemsnegirev/razvilka
- Notebook de inicio rapido (Colab): https://colab.research.google.com/github/ai-forever/FRIDA-Decisions/blob/main/notebooks/quickstart.ipynb
- Notebook de evaluacion en razvilka (Colab): https://colab.research.google.com/github/ai-forever/FRIDA-Decisions/blob/main/benchmarks/razvilka/run_razvilka.ipynb
- Cliente de ejemplo para vLLM: https://github.com/ai-forever/FRIDA-Decisions/blob/v0.2.0/examples/vllm_client.py
- Modelo base: https://huggingface.co/ai-forever/FRIDA
- Instalacion con PyTorch: `pip install "frida-decisions[torch] @ git+https://github.com/ai-forever/FRIDA-Decisions@v0.2.0"`
- Instalacion con ONNX: `pip install "frida-decisions[onnx] @ git+https://github.com/ai-forever/FRIDA-Decisions@v0.2.0"`
- Instalacion con vLLM: `pip install "frida-decisions[vllm] @ git+https://github.com/ai-forever/FRIDA-Decisions@v0.2.0"`

Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados fueron paginas genericas de plataformas de IA sin relacion con FRIDA-Decisions.
