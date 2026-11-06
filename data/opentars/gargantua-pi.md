# OpenTARS/Gargantua-Pi

## Resumen

Gargantua Pi es un modelo de lenguaje de tipo "tiny" desarrollado por el proyecto openTARS, un asistente de IA local para Linux. Se trata de un ajuste fino de `google/functiongemma-270m-it`, el modelo base de Google orientado a function calling, especializado en la ejecución de cuatro herramientas concretas: `execute_terminal`, `search_web`, `remember` y `forget`. Con 268 millones de parámetros y un único archivo GGUF de aproximadamente 0,3 GB, está pensado para ejecutarse en CPU sobre placas de bajo consumo como Raspberry Pi u Orange Pi, sin necesidad de GPU.

El modelo no busca ser un asistente generalista, sino un enrutador de herramientas extremadamente ligero: dado un turno de conversación y un conjunto de herramientas disponibles, decide cuál invocar o si no debe invocar ninguna. Responde en portugués e inglés y declina educadamente las peticiones que quedan fuera de su alcance, como el análisis de pantalla. Su relevancia radica en demostrar que el function calling fiable puede llevarse a hardware de menos de 1 GB de RAM, un nicho poco cubierto por los modelos generalistas.

La arquitectura subyacente es la de Gemma 3 en su variante de 270M, destilada y ajustada por Google para function calling, sobre la que openTARS ha aplicado un ajuste adicional con datos propios de uso de herramientas. La licencia es la Gemma Terms of Use, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, variante FunctionGemma) |
| Parametros totales | 268.098.176 (268M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado) |
| Idiomas soportados | portugues, ingles |
| Licencia | Gemma Terms of Use |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de `google/functiongemma-270m-it`, un transformer decoder-only de la familia Gemma 3 con 268 millones de parámetros, ajustado por Google para tareas de invocación de funciones. openTARS ha realizado un ajuste fino adicional sobre datos propios de uso de herramientas, centrado en cuatro funciones del asistente: ejecución de comandos de terminal, búsqueda web, almacenamiento de hechos en memoria y borrado de los mismos. No se dispone de información pública sobre el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO en esta fase de ajuste.

La innovación principal no es arquitectónica sino de despliegue: el modelo se distribuye como un GGUF cuantizado a Q8_0 de unos 0,3 GB, con renderer y parser específicos de `functiongemma` integrados en Ollama, lo que permite invocar herramientas de forma nativa en llama.cpp y Ollama sin capas de post-procesado adicionales. El autor publica el checksum SHA-256 del archivo (`f921e2370833585eda692d4878f9ba50899bdce18b57dc10d0300f8a66f5ac60`) para verificación de integridad.

## Capacidades

- Enrutamiento de herramientas: selecciona entre cuatro funciones (`execute_terminal`, `search_web`, `remember`, `forget`) o decide no invocar ninguna.
- Function calling nativo: soportado mediante el renderer y parser `functiongemma` de Ollama y llama.cpp.
- Ejecución de comandos de terminal: genera la llamada a `execute_terminal` con los argumentos correspondientes.
- Búsqueda web: invoca `search_web` para consultas que requieren información externa.
- Memoria persistente: guarda hechos con `remember` y los elimina con `forget`.
- Multilingüe limitado: portugués e inglés.
- Rechazo explícito: declina peticiones fuera de alcance (por ejemplo, análisis de pantalla) en lugar de alucinar una respuesta.
- Sin capacidades de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistente de terminal en Raspberry Pi: el modelo recibe la petición del usuario y emite la llamada a `execute_terminal` con el comando adecuado; su tamaño de 0,3 GB permite tenerlo residente en placas con 1-2 GB de RAM.
- Automatización de búsquedas en asistentes de voz o chat: enruta consultas informativas a `search_web` sin necesidad de un modelo mayor, reduciendo el consumo energético en dispositivos alimentados por batería.
- Memoria de hechos para asistentes personales: usa `remember` y `forget` para mantener un almacén de preferencias del usuario gestionado por el propio modelo.
- Enrutador previo en pipelines multi-modelo: actúa como primera etapa que clasifica la intención y deriva las peticiones complejas a un modelo mayor (por ejemplo, el Gargantua de 4B del mismo proyecto), ahorrando cómputo en el caso común.
- Despliegue en entornos sin GPU: al ejecutarse en CPU con llama.cpp u Ollama, encaja en servidores modestos, contenedores pequeños y dispositivos embebidos donde no hay acelerador disponible.
- Prototipado de agentes de bajo coste: sirve para validar flujos de tool calling y esquemas de herramientas antes de escalar a modelos mayores, con latencia baja gracias a sus 268M de parámetros.
- Educación y demostraciones: su huella mínima permite distribuirlo en talleres o demos sin requisitos de hardware significativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar en la informacion disponible. El autor reporta una prueba propia de 39 peticiones sobre la selección de la primera acción (elegir la herramienta correcta o ninguna), con 31 aciertos de 39 (aproximadamente 79,5 %). Se trata de una evaluación interna, no de un benchmark público, por lo que no es directamente comparable con otros modelos.

| Evaluacion | Resultado | Notas |
|---|---|---|
| Prueba interna openTARS (39 peticiones) | 31/39 aciertos (~79,5 %) | Seleccion de la primera accion; no es benchmark publico |

## Requisitos de hardware

- VRAM estimada: no requiere GPU; en CPU, el archivo Q8_0 de 0,3 GB ocupa aproximadamente 0,3-0,5 GB de RAM en inferencia.
- GPU recomendadas: no aplica; el modelo esta pensado para CPU. Cualquier GPU con mas de 1 GB de VRAM puede alojarlo, pero no es el caso de uso previsto.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo moderna, aunque su objetivo son placas como Raspberry Pi u Orange Pi sin acelerador.
- Opciones de despliegue: llama.cpp y Ollama (con renderer y parser `functiongemma` integrados). No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles. Por el tamano del modelo, se espera latencia baja en CPU, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gargantua Pi | 268M | no disponible | Function calling para 4 herramientas | Gemma Terms of Use | GGUF en Hugging Face |
| Gargantua (openTARS) | Qwen3 4B (fine-tune) | no disponible | Control de escritorio Linux con herramientas openTARS | no disponible | Ollama |
| google/functiongemma-270m-it | 270M | no disponible | Function calling general (modelo base) | Gemma Terms of Use | Hugging Face |

La comparativa con modelos de otros fabricantes en el mismo rango de tamano no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Alcance muy restringido: solo cubre cuatro herramientas y dos idiomas; cualquier tarea fuera de ese conjunto se rechaza o se degrada.
- Riesgo de alucinacion en la seleccion de herramienta: la prueba interna del autor indica un ~20 % de fallos en la primera accion, por lo que no es adecuado para decisiones criticas sin validacion posterior.
- Idiomas limitados: portugues e ingles; el castellano no figura entre los idiomas soportados.
- Contexto desconocido: no se publica la longitud de contexto, lo que dificulta planificar conversaciones largas.
- Licencia Gemma Terms of Use: impone obligaciones de redistribucion y condiciones de uso comercial que deben revisarse antes de integrarlo en productos; quien lo redistribuya debe transmitir los terminos.
- Un solo formato y cuantizacion: unicamente se distribuye Q8_0 en GGUF, sin variantes para otros backends ni cuantizaciones mas agresivas.
- Sin datos de benchmarks publicos: el rendimiento solo esta respaldado por una prueba interna del autor.
- Proyecto muy reciente y con escasa traccion: cero descargas y cero likes en el momento de la consulta, sin validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenTARS/Gargantua-Pi
- Repositorio del proyecto openTARS: https://github.com/project-opentars/OpenTARS
- Sitio del proyecto openTARS: https://project-opentars.github.io/OpenTARS/
- Gargantua (modelo mayor) en Ollama: https://ollama.com/ProjectOpenTARS/Gargantua
- Modelo base: https://huggingface.co/google/functiongemma-270m-it
