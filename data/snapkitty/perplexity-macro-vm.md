# Snapkitty/perplexity-macro-vm

## Resumen

Perplexity Macro VM es un proyecto de investigación publicado por el usuario Snapkitty en HuggingFace y GitHub. No se trata de un modelo de lenguaje o de IA generativa, sino de una máquina virtual determinista de 16 bits diseñada para ejecutar flujos de investigación tipo Perplexity —planificación, búsqueda, evidencia, crítica y síntesis— compilados a ROM. El sistema está implementado en Elixir con GenServer OTP y Phoenix LiveView, y delega el trabajo de procesamiento de lenguaje, búsqueda web y ejecución de código a modelos externos (Ollama, OpenAI, OpenRouter) o locales, manteniendo el control del flujo en la propia VM mediante instrucciones tipadas y capacidades limitadas.

El proyecto resuelve el problema de la trazabilidad y determinismo en agentes de investigación: cada instrucción ejecutada se registra, se puede auditar y el estado completo (ROM, RAM, registros, ciclos, hash de transcripción) es reproducible. Su relevancia actual radica en que propone una arquitectura híbrida donde la VM controla el razonamiento de alto nivel mientras los modelos de IA actúan como herramientas bajo límites de capacidad definidos. No es un modelo descargable ni un peso entrenado; es un sistema de software que orquesta otros modelos.

La información pública es limitada: no hay métricas de rendimiento, benchmarks ni comparativas con otros sistemas. La licencia declarada en la model card es "Sovereign Source License v1.0", aunque en HuggingFace figura como no disponible. El proyecto incluye un compilador para un lenguaje macro (.pqm), un agente de consola web y adaptadores para Tavily, Wikipedia, WolframAlpha, entre otros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VM determinista de 16 bits (65.536 palabras de memoria) |
| Parametros totales | no disponible (no es un modelo de IA; es software de orquestacion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo LLM externo que se conecte) |
| Tipos de cuantizacion | no disponible (no aplica a la VM; depende del modelo LLM externo) |
| Idiomas soportados | no disponibles (la interfaz y la documentacion estan en ingles; el modelo LLM subyacente define los idiomas) |
| Licencia | Sovereign Source License v1.0 (segun la model card; en HuggingFace figura como no disponible) |
| Formato de pesos | no disponible (no hay pesos; el codigo fuente en Elixir y el ROM compilado son los artefactos) |

## Arquitectura y entrenamiento

La arquitectura de Perplexity Macro VM es una máquina virtual de 16 bits con 65.536 palabras de memoria, dividida en ROM ($0000-$1FFF), RAM ($2000-$DFFF) y MMIO ($E000-$E0FF). Tiene 8 registros (A, B, C, D, PC, SP, BP, FLAGS) y un conjunto de 20 opcodes, incluyendo instrucciones de propósito general (NOP, LDI, LD, ST, ADD, XOR, CMP, JMP, JZ, CALL, RET, DEC, HALT) y un subconjunto específico para operaciones de investigación (RQ, POLL, READ, VERIFY, EVIDENCE, COVERAGE, DISAGREE, HASH, FUEL, EMIT, CONFIRM). Cada opcode tiene un número fijo de ciclos, lo que garantiza un comportamiento determinista.

El sistema se ejecuta como un GenServer en Elixir bajo OTP, y Phoenix LiveView transmite cada instrucción retirada a una interfaz de trazabilidad con un ring buffer de 50.000 entradas. La VM posee el control del flujo y la política de aceptación; el host (ResearchBroker) ejecuta búsquedas web, llamadas a modelos y código en entornos aislados, y devuelve registros de evidencia tipados a la instrucción RQ en espera. El compilador transforma programas escritos en el lenguaje macro .pqm en ROM (archivos .pqr, .pqmap y manifest.json). No hay entrenamiento en el sentido de modelos de IA; el desarrollo es de ingeniería de software, con pruebas vía `mix test` y compilación de ROM.

## Capacidades

- Orquestacion de modelos de IA externos: se conecta a Ollama, OpenAI y OpenRouter para generar texto, razonamiento y síntesis de respuestas.
- Ejecucion de codigo Python en el navegador mediante Pyodide, sin necesidad de servidor.
- Busqueda web en cliente mediante DuckDuckGo.
- Llamada a herramientas automatica: el modelo puede invocar herramientas emitiendo bloques de codigo con marcas ```python, ```search o ```terminal.
- Protocolo de capacidades tipadas: nueve capacidades (search, fetch, browser, code, local_model, file_read, file_write, calendar, email) con autenticacion de un solo uso (CONFIRM) y tokens con expiracion para las sensibles.
- Verificacion de evidencia: instrucciones VERIFY, EVIDENCE, COVERAGE y DISAGREE para validar esquemas, comprobar cobertura de citas y detectar contradicciones.
- Hash de transcripcion: la instruccion HASH genera un resumen criptografico del estado de la transcripcion, permitiendo auditoria.
- Compilador de lenguaje macro .pqm con analisis de politicas y generacion de CFG.
- Consola de agente web con interfaz de chat limpia y panel de terminal para ver el registro de ejecucion de herramientas.

## Casos de uso

- Investigacion automatizada con trazabilidad: un analista puede desplegar un programa .pqm que descomponga una pregunta en subpreguntas, busque fuentes, verifique evidencias y sintetice una respuesta citada. La VM registra cada paso, lo que permite auditar el razonamiento y las fuentes usadas.
- Sistema de respuestas con verificacion de citas: en un blog o medio digital, el sistema puede generar articulos con referencias comprobables. La instruccion EVIDENCE registra la procedencia de cada afirmacion y COVERAGE mide cuantas afirmaciones tienen cita.
- Agente de atencion al cliente con control de flujo determinista: la VM decide si una consulta requiere busqueda web, consulta a un modelo local o ejecucion de codigo, y el host ejecuta la accion correspondiente bajo limites de capacidad. El registro de instrucciones permite depurar errores de forma reproducible.
- Plataforma de educacion interactiva: un estudiante puede usar la consola web para pedir explicaciones con ejemplos ejecutables en Python (via Pyodide) y busquedas en DuckDuckGo, todo dentro del navegador sin backend.
- Herramienta de analisis de contradicciones en documentos: con la instruccion DISAGREE, el sistema puede comparar multiples fuentes y marcar afirmaciones conflictivas, util para revision de literatura o fact-checking.
- Prototipo de agente autonomo con politicas de seguridad: dado que las capacidades sensibles requieren CONFIRM con token expirado, se puede usar como base para experimentar con agentes que piden permiso antes de acceder a recursos (email, escritura de archivos) y registran cada acceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas de latencia, throughput ni comparativas estandar (MMLU, HumanEval, etc.) porque el proyecto no es un modelo de lenguaje, sino una VM de orquestacion. El rendimiento depende enteramente del modelo LLM externo que se conecte y de los adaptadores de red utilizados.

## Requisitos de hardware

- La VM en si es ligera: se ejecuta en cualquier maquina con Erlang/Elixir instalado; el consumo de memoria es minimo (un GenServer con un ring buffer de 50.000 trazas).
- La consola web (HTML + Pyodide) se ejecuta en el navegador; no requiere servidor para las herramientas basicas.
- Para usar modelos locales via Ollama o LM Studio, se necesita una GPU con VRAM suficiente segun el modelo elegido (por ejemplo, 8 GB para modelos de 7B cuantizados, 24 GB para 70B cuantizados en una RTX 3090/4090).
- Para modelos en la nube (OpenAI, OpenRouter), solo se necesita conexion a internet y clave API.
- El backend Phoenix puede desplegarse en un VPS de 1-2 GB de RAM; la carga principal la soportan los servicios externos.
- No se requiere hardware especializado para la VM; el cuello de botella esta en el modelo LLM y en las llamadas de red.

## Comparativa con modelos similares

No disponible. Perplexity Macro VM no es un modelo de IA comparable con LLMs como Llama, Mistral o GPT. En el ambito de orquestadores de agentes, podria compararse con frameworks como LangChain o AutoGen, pero no hay datos publicos de rendimiento ni benchmarks que permitan una comparacion objetiva. La informacion proporcionada no incluye metricas ni estudios de caso frente a alternativas.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto por si mismo; depende de modelos externos (Ollama, OpenAI, OpenRouter) para cualquier tarea de lenguaje. Sin un LLM conectado, el sistema no puede responder.
- Licencia restrictiva: la Sovereign Source License v1.0 no es una licencia de codigo abierto convencional (no es MIT, Apache ni GPL). Incluye clausulas de patente pendiente y puede limitar el uso comercial o la redistribucion. Conviene revisar los terminos exactos antes de usarlo en produccion.
- Riesgo de alucinacion heredado: al delegar la generacion de texto a modelos externos, el sistema hereda sus sesgos y tendencia a inventar informacion. Las instrucciones VERIFY y EVIDENCE ayudan a mitigarlo, pero no lo eliminan.
- No hay soporte de idiomas declarado: la documentacion y la interfaz estan en ingles; el comportamiento en otros idiomas depende del modelo LLM conectado.
- Proyecto en fase temprana: cero descargas y cero likes en HuggingFace sugieren que no hay una comunidad establecida ni casos de produccion conocidos. La fecha de creacion (septiembre 2026) es reciente.
- El adaptador de terminal es una simulacion en cliente; no ejecuta comandos reales del sistema, lo que limita su utilidad en entornos de produccion.
- La seguridad de las capacidades sensibles (email, escritura de archivos) depende de la implementacion del host; en la consola web estas funciones estan simuladas, no implementadas de forma robusta.

## Enlaces

- HuggingFace: https://huggingface.co/Snapkitty/perplexity-macro-vm
- GitHub: https://github.com/SNAPKITTYWEST/perplexity-macro-vm
- README en GitHub: https://github.com/SNAPKITTYWEST/perplexity-macro-vm/blob/main/README.md
- Consola de agente en vivo: https://snapkittywest.github.io/perplexity-macro-vm/
