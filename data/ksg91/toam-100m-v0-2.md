# ksg91/toam-100m-v0.2

## Resumen

TOAM-100M v0.2 es un modelo de 102,5 millones de parámetros entrenado desde cero (no es un fine-tuning de otro modelo) cuyo único objetivo es actuar como controlador de agentes: recibe un menú de herramientas en formato de esquema y una petición en lenguaje natural, y devuelve la siguiente acción como JSON. Lo desarrolla el usuario ksg91 y se publica como artefacto de investigación bajo licencia Apache 2.0. Se carga como un `LlamaForCausalLM` estándar, es decir, un transformer decoder-only con una ventana de contexto de 2.048 tokens.

La tesis del proyecto es que un controlador de agentes no necesita almacenar conocimiento del mundo, porque puede obtenerlo en tiempo de ejecución a partir de los esquemas de herramientas, los resultados de las llamadas, el estado y el historial. Esto permite reducir el tamaño del modelo hasta límites que quepan en CPU y en dispositivos embebidos. El autor declara una latencia mediana de 207 ms por petición y un pico de RAM de proceso de 1,67 GB, y reporta un 26,2 % de acierto AST en BFCL v4 Live con aproximadamente la misma precisión que FunctionGemma-270M, que tiene 2,6 veces más parámetros.

Respecto a la versión 0.1, la v0.2 completa el preentrenamiento (10.000 millones de tokens frente a 3.250 millones) y mejora los datos de ajuste fino con ejemplos de pares mínimos que enseñan cuándo llamar a una herramienta, cuándo preguntar y cuándo confirmar. Es una versión explícitamente marcada como investigación, no validada para producción y no apta para decisiones críticas sin revisión humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (`LlamaForCausalLM`), entrenado desde cero |
| Parametros totales | 102.451.968 (102,5 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | GGUF (el repositorio incluye pesos GGUF y soporte para llama.cpp); niveles concretos de cuantizacion no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 102,5 M de parámetros con la arquitectura `LlamaForCausalLM`, entrenado desde cero en lugar de derivarse de un modelo existente. El preentrenamiento en la versión 0.2 cubre 10.000 millones de tokens (frente a los 3.250 millones de la v0.1, que se detuvo antes de completar el ciclo). La mezcla de datos de preentrenamiento combina corpus de texto educativo y general (HuggingFaceFW/fineweb-edu, HuggingFaceTB/smollm-corpus, wikimedia/wikipedia), datos de código (codeparrot/codeparrot-clean, bigcode/starcoderdata, code-search-net/code_search_net) y datos multilingües (AmazonScience/massive).

Sobre esa base se aplica un ajuste fino orientado a tool calling con datasets específicos del dominio: argilla/apigen-function-calling, Team-ACE/ToolACE y nvidia/When2Call. En la v0.2 se incorporaron ejemplos de pares mínimos para enseñar la distinción entre llamar, preguntar o confirmar, se limpiaron las peticiones generadas y se retiraron alrededor de 1.800 etiquetas públicas de entrenamiento tras una auditoría que detectó que muchas pedían al usuario valores que la propia petición ya contenía. No se documenta en la información disponible si hubo RLHF, DPO u otro tipo de alineación posterior, ni detalles sobre la composición exacta o el número de tokens de la fase de ajuste fino.

La innovación principal no es arquitectónica sino de formato: el modelo usa un prompt propio y crudo (con marcadores `<|system|>`, `<|tools|>`, `<|goal|>`, `<|history|>`, `<|state|>`, `<|observation|>` y `<|action|>`) y decodificación greedy. No es un modelo de chat y no debe aplicársele una plantilla de chat genérica, ya que produciría salidas incorrectas.

## Capacidades

- Generación de la siguiente acción en formato JSON dentro de un bucle de agente, con el tipo de acción y los argumentos de la herramienta.
- Acciones soportadas: `tool_call`, `tool_calls` (llamadas en paralelo), `ask_user` (falta un valor obligatorio, se requiere confirmación o ninguna herramienta encaja), `escalate` y las acciones de control multi-paso `finish`, `retry` y `wait`.
- Tool calling y function calling a partir de esquemas en formato de función con parámetros tipados.
- Soporte de agentes y razonamiento multi-paso: acepta historial de llamadas previas y sus resultados, además de un estado arbitrario (por ejemplo, `{"today": "2026-10-02"}` para resolver fechas relativas).
- Soporte de políticas en texto plano (por ejemplo, "Confirmar con el usuario antes de cualquier reserva o pago").
- Conversación multi-turno recibida como parte del objetivo, con formato `"User: ...\nAssistant: ...\nUser: ..."`.
- Detección de irrelevancia: capacidad de responder que ninguna herramienta del menú encaja (71,6 % en BFCL Irrelevance).
- Idioma: únicamente inglés.

## Casos de uso

- Controlador de agentes en local o en dispositivo: el modelo cabe en CPU o en GPUs de gama baja (pico de RAM de proceso de 1,67 GB) y decide la siguiente acción sin necesidad de un LLM grande, lo que permite ejecutar el bucle de agente sin conexión a servicios externos.
- Enrutado de peticiones en un pipeline de agentes: clasifica cada turno en llamar, preguntar, confirmar, rechazar o escalar, de modo que un modelo mayor solo se invoca cuando realmente hace falta, reduciendo coste y latencia.
- Relleno de argumentos de herramientas desde lenguaje natural: dado un esquema como `get_weather(city)`, extrae los valores de la petición del usuario, incluida la resolución de fechas relativas si se le pasa el estado con la fecha actual.
- Guardarraíl de irrelevancia antes de llamar a un modelo mayor: con un 71,6 % en BFCL Irrelevance, puede usarse como primer filtro para descartar peticiones que ningún servicio del catálogo puede resolver.
- Confirmación previa a acciones irreversibles: mediante `policy` en texto plano, el modelo puede exigir confirmación del usuario antes de ejecutar operaciones de reserva o pago, actuando como capa de seguridad en el orquestador.
- Orquestación en entornos con presupuesto de memoria muy ajustado: dispositivos embebidos, edge computing o entornos de CI donde no se puede reservar VRAM para un modelo de varios miles de millones de parámetros.
- Investigación sobre modelos agénticos pequeños: al estar entrenado desde cero y documentado abiertamente, sirve como punto de partida reproducible para estudiar qué capacidad de control de herramientas se puede obtener con ~100 M de parámetros.
- Generación de trazas sintéticas para destilación: puede usarse para etiquetar datos de decisión de agente a gran escala a bajo coste, dado su bajo consumo de memoria y su latencia de 207 ms por petición.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre BFCL v4, con la misma GPU y el mismo arnés de evaluación para todos los modelos:

| Metrica | TOAM-100M v0.1 | TOAM-100M v0.2 | FunctionGemma-270M |
|---|---|---|---|
| Parametros | 102,5 M | 102,5 M | 270 M |
| BFCL Non-live AST | 22,8 % | 28,0 % | 43,6 % |
| BFCL Live AST | 22,9 % | 26,2 % | 26,6 % |
| BFCL Irrelevance | 68,1 % | 71,6 % | no disponible |
| Servidores de herramientas retenidos (84), herramienta correcta | 78,2 % | 81,7 % | no disponible |
| Latencia mediana por peticion | no disponible | 207 ms | 731 ms |
| Pico de RAM de proceso | no disponible | 1,67 GB | no disponible |
| Tokens de preentrenamiento | 3.250 M (detenido antes) | 10.000 M (ciclo completo) | no disponible |

El autor señala que la diferencia principal frente a FunctionGemma-270M está en BFCL Non-live (28,0 % frente a 43,6 %), atribuida sobre todo a peticiones que requieren varias llamadas simultáneas. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de conocimiento general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia calculada a partir del número de parámetros, los pesos ocupan aproximadamente 205 MB en fp16/bf16, unos 410 MB en fp32 y en torno a 60-70 MB en una cuantización GGUF de 4 bits; a ello hay que sumar la memoria del contexto (2.048 tokens) y del runtime.
- El autor reporta un pico de RAM de proceso de 1,67 GB durante la evaluación, dato que corresponde al arnés completo, no solo a los pesos.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo cabe en cualquier GPU consumer, incluidas integradas, y está pensado para ejecución en CPU.
- Cabe en GPU consumer: sí, con margen amplio, dado que los pesos en fp16 rondan los 205 MB.
- Opciones de despliegue: transformers (formato safetensors, `LlamaForCausalLM`), llama.cpp mediante los pesos GGUF incluidos en el repositorio, y text-generation-inference (el repositorio está etiquetado con `text-generation-inference` y `endpoints_compatible`). El despliegue con Ollama, vLLM o TGI no está documentado explícitamente por el autor en la información disponible.
- Latencia y throughput: latencia mediana de 207 ms por petición en el arnés del autor; el throughput en tokens por segundo no está disponible.
- Restricción operativa: la ventana de 2.048 tokens limita el menú de herramientas a unas 10 herramientas con descripciones cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BFCL Live AST | BFCL Non-live AST | Latencia mediana | Licencia |
|---|---|---|---|---|---|---|
| TOAM-100M v0.2 | 102,5 M | 2.048 | 26,2 % | 28,0 % | 207 ms | apache-2.0 |
| TOAM-100M v0.1 | ~100 M | 2.048 | 22,9 % | 22,8 % | no disponible | apache-2.0 |
| FunctionGemma-270M | 270 M | no disponible | 26,6 % | 43,6 % | 731 ms | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (controladores de agentes de menos de 500 M de parámetros) en los datos proporcionados. La comparación con FunctionGemma-270M es la única aportada por el autor, y en ella TOAM-100M v0.2 destaca en latencia (3,5 veces menor) y en eficiencia de parámetros (38 % del tamaño), mientras que pierde de forma clara en BFCL Non-live.

## Limitaciones y advertencias

- Versión de investigación: el propio autor indica que no es un modelo estado del arte y que no ha sido validado para uso en producción.
- No es un chatbot ni un modelo de conocimiento: sabe poco del mundo y escribe texto libre de baja calidad; no debe usarse para responder preguntas ni sin un menú de herramientas.
- Riesgo de alucinación: puede invocar herramientas inexistentes o inventar valores de argumentos; el autor recomienda validar cada llamada antes de ejecutarla.
- No debe usarse en decisiones críticas de seguridad, médicas, legales o financieras, ni permitir que dispare acciones irreversibles sin revisión humana.
- Limitación en llamadas paralelas: el 28,0 % en BFCL Non-live refleja dificultades con peticiones que requieren varias llamadas a la vez, frente al 43,6 % de FunctionGemma-270M.
- Contexto muy corto (2.048 tokens): limita el número de herramientas del menú (unas 10 con descripciones breves) y el historial de interacciones.
- Idioma: solo inglés; no hay soporte multilingüe declarado.
- Formato rígido: usa un prompt propio y no admite plantilla de chat; aplicar una genérica produce resultados incorrectos.
- Sesgos conocidos: no documentados en la información disponible; los datasets de preentrenamiento (fineweb-edu, smollm-corpus, wikipedia, código público) pueden introducir sesgos propios de esas fuentes.
- Licencia: Apache 2.0, por lo que permite uso comercial, pero el autor desaconseja explícitamente el despliegue en producción sin validación.
- Disponibilidad: 0 descargas y 0 likes en el momento de la consulta, con lo que la validación por parte de la comunidad es prácticamente inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ksg91/toam-100m-v0.2
- Artículo que menciona la versión 0.1 en el contexto de arneses de agentes: https://news.agentcommunity.org/issues/2026-09-28-the-harness-is
- Datasets de ajuste fino para tool calling citados: https://huggingface.co/datasets/argilla/apigen-function-calling, https://huggingface.co/datasets/Team-ACE/ToolACE, https://huggingface.co/datasets/nvidia/When2Call
- Datasets de preentrenamiento citados: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu, https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus, https://huggingface.co/datasets/codeparrot/codeparrot-clean, https://huggingface.co/datasets/bigcode/starcoderdata, https://huggingface.co/datasets/code-search-net/code_search_net, https://huggingface.co/datasets/wikimedia/wikipedia, https://huggingface.co/datasets/AmazonScience/massive

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los únicos enlaces pertinentes son la propia página de HuggingFace y el artículo de Agent Community que menciona la versión 0.1. No se han encontrado papers, blogs técnicos ni repositorios adicionales del autor.
