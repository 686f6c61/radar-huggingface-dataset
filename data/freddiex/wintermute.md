# Freddiex/wintermute

## Resumen

Wintermute es un arnés de agente neuronal experimental publicado por el desarrollador independiente Freddiex. No es un modelo de lenguaje al uso: se trata de un sistema en el que un pequeño transformer Spotlight, construido a partir de los pesos base de Percepta AI, ejecuta los procedimientos de control y de herramientas del arnés, mientras que un LLM externo (el "worker") decide cómo resolver la tarea del usuario. El runtime realiza operaciones reales sobre el sistema de ficheros y lanza procesos Python y Bash auténticos.

La propuesta de la versión 0 es investigar si un arnés neuronal puede sustituir a un arnés software convencional en trabajo multi-paso y medir el coste de ejecución asociado. El autor es explícito: demuestra viabilidad en un panel de desarrollo seleccionado, pero no establece equivalencia general ni superioridad en resolución de tareas frente a arneses clásicos.

El modelo se apoya en el Spotlight VM de Percepta AI (pesos base construidos, imagen de memoria y componentes del compilador de Transformer VM). Wintermute añade el programa huésped del agente, su tabla de búsqueda fija construida, la integración con el host, la política de ciclo de vida, la CLI y la evaluación comparativa. Es un proyecto independiente, no un producto de Percepta AI ni cuenta con su respaldo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Spotlight (arnés neuronal sobre Spotlight VM) con LLM worker externo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | contexto rodante acotado (conserva tarea/última instrucción y exchanges recientes; sin cifra publicada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo con runtime Linux x86-64 en binarios) |

## Arquitectura y entrenamiento

Wintermute separa tres planos: razonamiento de la tarea, ejecución del arnés y servicios físicos. El LLM externo propone acciones; el huésped neuronal local ejecuta continuaciones del arnés y algoritmos de herramientas (por ejemplo, búsqueda de coincidencias y cálculos de edición); los adaptadores nativos realizan las operaciones de red, sistema de ficheros y procesos y devuelven observaciones tipadas a través de una frontera de efectos.

En tiempo de compilación, el huésped escrito en Rust se baja a Wasm, se convierte en un programa fijo y se transforma en coeficientes de búsqueda construidos. El runtime especializado combina esa tabla con el modelo Spotlight base de Percepta AI. El autor subraya que no se trata de un LLM traduciendo el huésped en cada petición ni de un entrenamiento: es ejecución neuronal de un programa fijo. Python y Bash se ejecutan como procesos del host ordinarios; el transporte HTTP, la validación de respuestas, el renderizado y la contabilidad de recursos también son nativos. Existe además un backend de referencia en Rust que ejecuta la misma política del huésped de forma convencional a través de la misma interfaz de servicios, como comparación separada y no como fallback automático del runtime neuronal.

Ambos backends usan contexto rodante acotado: retienen la tarea o última instrucción del usuario y los intercambios completos recientes, descartan los antiguos y recuperan el almacenamiento de payloads. En la versión 0 no hay política de retención aprendida, resumidor ni representación latente compartida con el LLM worker.

## Capacidades

- Ejecución de trabajo multi-paso mediante un ciclo de razonamiento (worker LLM), ejecución neuronal del arnés y efectos nativos.
- Operaciones reales de sistema de ficheros: lectura de bytes, edición y búsqueda con algoritmos ejecutados de forma neuronal en el huésped.
- Lanzamiento de procesos Python y Bash reales como servicios del host.
- Gestión de conversación y retención de historial dentro del huésped neuronal, con reclamación de payloads.
- Llamada a herramientas (tool calling) mediada por el worker externo y validada en la frontera de efectos tipada.
- Procedimiento opcional instalable: compilación Wasm soportada, planificación de hijos y ejecución neuronal aislada mediante un hijo neuronal universal.
- CLI propia para autenticación, selección de modelo worker y ejecución de tareas.
- Idiomas: únicamente inglés.

## Casos de uso

- Investigación sobre arneses neuronales: comparar el backend neuronal con el backend Rust de referencia usando la misma política de huésped y la misma interfaz de servicios, para medir coste de ejecución y viabilidad.
- Automatización de edición de código en local: el huésped calcula búsquedas y ediciones de forma neuronal y solicita al host la lectura y escritura efectiva de ficheros, lo que permite tareas de refactorización controladas.
- Ejecución de scripts de análisis de datos: el worker propone código Python y el runtime lo lanza como proceso del host, devolviendo observaciones al huésped para continuar el ciclo.
- Orquestación de tareas de shell en entornos Linux: ejecución de comandos Bash reales con validación de peticiones comprometidas y presupuestos de transporte en la frontera de efectos.
- Evaluación de políticas de retención de contexto: al usar contexto rodante acotado con reclamación de payloads, sirve para estudiar el comportamiento de agentes con memoria limitada.
- Prototipado de agentes con separación estricta de responsabilidades: razonamiento en un endpoint externo, control en el huésped neuronal y efectos físicos en adaptadores nativos, útil para auditar qué parte del sistema toma cada decisión.
- Experimentación con compilación Wasm y ejecución neuronal aislada de procedimientos instalables mediante el hijo neuronal universal opcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la versión 0 demuestra viabilidad en un panel de desarrollo seleccionado y mide el coste de ejecución, pero no presenta cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del transformer Spotlight no se publica).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- El binario distribuido es un bundle para Linux x86-64 que requiere glibc compatible, librerías libcurl/TLS, y Python 3 y Bash para las herramientas del host; no es un ejecutable estático ni multiplataforma.
- El razonamiento de la tarea recae en un LLM worker externo (el ejemplo de la model card usa `deepseek/deepseek-v4.1-flash-1017`), por lo que los requisitos de inferencia del worker dependen del endpoint elegido.
- Opciones de despliegue: runtime propio incluido en el repositorio (`binaries/wintermute-linux-x86_64.tar.gz`) con CLI; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wintermute | Arnés neuronal (Spotlight + worker externo) | no disponible | contexto rodante acotado | Apache 2.0 | Hugging Face (repo con runtime Linux x86-64) |
| percepta-ai/spotlight-vm | Modelo base Spotlight VM | no disponible | no disponible | no disponible | Hugging Face |
| Arnés software convencional (p. ej. backend Rust de referencia incluido) | Orquestación clásica de agentes | no aplica | según implementación | según implementación | incluido en el propio repo |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que la versión 0 no establece equivalencia general ni superioridad en resolución de tareas frente a arneses convencionales; solo demuestra viabilidad en un panel de desarrollo seleccionado.
- El alcance de la afirmación es limitado: ejecución neuronal del huésped del arnés, no de todas las operaciones de soporte; los pesos no emiten llamadas al sistema directamente.
- Solo soporta inglés.
- Contexto rodante acotado sin política de retención aprendida, resumidor ni representación latente compartida con el worker: los intercambios antiguos se descartan y los payloads se recuperan, lo que puede perder información relevante en tareas largas.
- El binario depende de glibc, libcurl/TLS, Python 3 y Bash; no es estático ni multiplataforma, lo que complica el despliegue en entornos heterogéneos.
- El backend Rust de referencia es una comparación separada, no un fallback automático del runtime neuronal en producción.
- Al ejecutar procesos Python y Bash reales y operaciones de red y ficheros, el riesgo operativo es alto; la frontera de efectos valida peticiones comprometidas, pero conviene aislar el runtime en sandbox.
- Licencia Apache 2.0 permite uso comercial, pero el proyecto se declara independiente y no respaldado por Percepta AI; revisar las condiciones de los componentes base de terceros.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; el comportamiento final depende en gran medida del LLM worker externo elegido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Freddiex/wintermute
- Modelo base Spotlight VM: https://huggingface.co/percepta-ai/spotlight-vm
- Blog de Percepta AI sobre Spotlight Memory: https://percepta.ai/blog/spotlight-memory
- Blog de Percepta AI "Can LLMs grow their own capabilities?": https://percepta.ai/blog/can-llms-grow-their-own-capabilities
