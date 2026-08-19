# FACET-Terminal/FACET-Terminal-Qwen3.5-4B

## Resumen

FACET-Terminal-Qwen3.5-4B es un modelo de lenguaje fine-tuneado a partir de Qwen/Qwen3.5-4B, desarrollado por el equipo FACET-Terminal. Su propósito es mejorar la capacidad de los modelos para operar como agentes de terminal: razonar sobre tareas ejecutables, usar herramientas de línea de comandos, inspeccionar entornos, corregir errores de forma iterativa y completar tareas de larga duración. El fine-tuning se realizó mediante aprendizaje supervisado (SFT) sobre 1.200 trayectorias completas de agentes que resolvieron tareas de terminal validadas por ejecución real.

El modelo se enmarca en el proyecto FACET (Fine-grained Agentic Construction of Executable Tasks), un framework de síntesis de tareas de terminal que preserva la intención de la fuente y mantiene un estado ejecutable compartido. A partir de 71.341 skills de origen, se construyeron 7.852 semillas de escenario y se generaron 6.078 tareas que superaron la validación por ejecución. De las trayectorias exitosas de agentes, se seleccionaron 1.200 para el entrenamiento supervisado.

La relevancia actual de este modelo radica en la creciente demanda de agentes autónomos capaces de interactuar con entornos de línea de comandos de forma fiable. FACET-Terminal-Qwen3.5-4B logra una mejora relativa del 40,5% en Terminal-Bench 2.1 respecto a su modelo base, lo que lo convierte en una opción interesante para aplicaciones de automatización de terminal, ingeniería de software y operaciones de sistemas. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (atencion lineal + transformer clasico) segun la familia Qwen3.5; no se especifican mas detalles para esta variante |
| Parametros totales | 5.174.964.736 (aproximadamente 5,17B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, Qwen3.5-4B, pertenece a la familia Qwen3.5, que segun la documentacion oficial emplea una arquitectura hibrida que combina atencion lineal con transformers clasicos. Toda la familia Qwen3.5 es nativamente multimodal (texto, imagen y video), y el pipeline del modelo se declara como image-text-to-text, lo que indica que acepta entradas de imagen y texto. No se dispone de detalles adicionales sobre la configuracion exacta de capas, cabezas de atencion o dimensiones ocultas para esta variante especifica.

El entrenamiento de FACET-Terminal-Qwen3.5-4B consistio en un fine-tuning supervisado (SFT) sobre 1.200 trayectorias completas de agentes que resolvieron tareas de terminal generadas por el framework FACET. El proceso de generacion de datos sigue un flujo environment-first: se construye y valida el entorno de la tarea antes de producir la instruccion final, la solucion de referencia y el verificador. Cuando una ejecucion falla, FACET identifica el componente defectuoso y lo repara utilizando la trayectoria fallida, en lugar de regenerar toda la tarea. Este enfoque garantiza que cada tarea este vinculada a un estado de ejecucion real y verificable.

No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion adicionales. El entrenamiento se realizo exclusivamente con trayectorias de exito, lo que puede influir en el comportamiento del modelo en situaciones no cubiertas por esos datos.

## Capacidades

- Razonamiento y ejecucion de tareas de terminal: el modelo esta entrenado para interpretar instrucciones, planificar secuencias de comandos, ejecutarlas y verificar resultados.
- Uso de herramientas de linea de comandos: puede invocar comandos shell, gestionar dependencias, manipular archivos y trabajar con entornos de desarrollo.
- Inspeccion de entorno: el modelo aprende a explorar el estado del sistema (variables de entorno, estructura de directorios, procesos) antes de actuar.
- Correccion iterativa: ante fallos de ejecucion, es capaz de analizar la salida de error, ajustar su enfoque y reintentar.
- Tareas de larga duracion: las trayectorias de entrenamiento incluyen procesos multi-paso que requieren mantener un estado coherente a lo largo de la interaccion.
- Capacidad multimodal (imagen y texto): al estar basado en Qwen3.5, el modelo puede procesar entradas visuales ademas de texto, aunque no se detalla el alcance de esta capacidad en el contexto de tareas de terminal.
- Soporte para agentes: el modelo esta disenado para integrarse en scaffolds de agentes como Terminus-2, tal como se uso en la evaluacion.

## Casos de uso

- Automatizacion de operaciones de sistemas: el modelo puede ejecutar tareas de mantenimiento como limpieza de logs, gestion de procesos o configuracion de servicios, interpretando instrucciones en lenguaje natural y traduciendolas a comandos shell verificables.
- Ingenieria de software asistida: permite a desarrolladores delegar tareas como compilacion, ejecucion de tests, gestion de dependencias o refactorizacion basica, con la ventaja de que el modelo puede inspeccionar el estado del repositorio y corregir errores de forma autonoma.
- Pruebas automatizadas en entornos CI/CD: el modelo puede integrarse en pipelines para ejecutar suites de pruebas, analizar fallos y proponer o aplicar correcciones, reduciendo la intervencion manual.
- Gestion de configuracion y despliegue: puede interpretar instrucciones como "configura el servidor web con SSL" y ejecutar los pasos necesarios, verificando cada etapa mediante comandos de inspeccion.
- Asistente de terminal interactivo: como reemplazo o complemento de shells tradicionales, el modelo puede recibir objetivos de alto nivel y descomponerlos en comandos concretos, con verificacion de resultados.
- Formacion y documentacion de operaciones: el modelo puede generar ejemplos de comandos y explicar su funcionamiento, sirviendo como herramienta educativa para administradores de sistemas y desarrolladores junior.

## Benchmarks y rendimiento

El modelo fue evaluado en Terminal-Bench 2.1, un benchmark disenado para medir la capacidad de agentes de terminal en tareas reales. Los resultados se promediaron sobre tres intentos independientes por tarea, utilizando el scaffold Terminus-2 tanto para el modelo base como para el fine-tuneado, con la misma configuracion de inferencia.

| Modelo | Terminal-Bench 2.1 |
|---|---|
| Qwen3.5-4B (base) | 17,60 |
| FACET-Terminal-Qwen3.5-4B | 24,72 |

La mejora absoluta es de 7,12 puntos, lo que representa un incremento relativo del 40,5% respecto al modelo base. No se han publicado resultados comparativos con otros modelos de la misma categoria en la informacion disponible.

## Requisitos de hardware

No se dispone de datos oficiales sobre requisitos de hardware para este modelo. Como referencia orientativa, un modelo de aproximadamente 5,17 mil millones de parametros en precision FP16 requiere alrededor de 10,3 GB de VRAM solo para los pesos. Con cuantizacion INT8 se reduce a unos 5,2 GB, y con INT4 a unos 2,6 GB, aunque no se ha confirmado que el modelo soporte estas cuantizaciones.

- GPUs con 16 GB o mas de VRAM (por ejemplo, RTX 4090, A100, H100) pueden ejecutar el modelo en FP16 sin problemas.
- GPUs consumer de 8-12 GB (RTX 3070, RTX 3080, RTX 4070) podrian ser suficientes con cuantizacion, si esta disponible.
- Para despliegue en produccion se recomienda usar motores de inferencia como vLLM o TGI, compatibles con modelos de la familia transformers.
- Para uso local, llama.cpp u Ollama podrian funcionar si se generan archivos GGUF, aunque no se ha confirmado su disponibilidad.
- La latencia y el throughput no se han publicado.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (agentes de terminal de tamano similar). La unica comparativa disponible es contra el modelo base Qwen3.5-4B, que ya se ha mostrado en la seccion de benchmarks. No se conocen otros modelos fine-tuneados especificamente para tareas de terminal con los que se pueda establecer una comparacion directa.

## Limitaciones y advertencias

- La model card advierte explicitamente que los comandos generados deben inspeccionarse antes de ejecutarse y que el modelo debe utilizarse en un entorno aislado. Ejecutar comandos sin revision puede provocar danos en el sistema.
- El rendimiento puede variar significativamente segun el scaffold de agente, el prompt de sistema, la interfaz de herramientas, el motor de inferencia, la longitud de contexto y la configuracion de muestreo.
- El modelo fue entrenado exclusivamente con trayectorias de exito, lo que puede limitar su capacidad para recuperarse de situaciones inesperadas o errores no contemplados en los datos de entrenamiento.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez ante entradas adversariales. Al ser un modelo de tamano medio, puede presentar alucinaciones en tareas complejas o con informacion ambigua.
- Los idiomas soportados no estan especificados. Aunque el modelo base Qwen3.5 probablemente soporta multiples idiomas, no se ha confirmado para esta variante.
- La longitud de contexto no esta documentada, por lo que no se puede garantizar el comportamiento en conversaciones o tareas con historial extenso.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable de cumplir con las restricciones del modelo base y de cualquier dependencia adicional.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/FACET-Terminal/FACET-Terminal-Qwen3.5-4B)
- [Sitio web del proyecto FACET](https://stokou.github.io/FACET-Terminal/)
- [Repositorio GitHub de FACET-Terminal](https://github.com/StoKou/FACET-Terminal)
- [Modelo base Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Coleccion Qwen3 en Hugging Face](https://huggingface.co/collections/Qwen/qwen3)
- [Guia de Qwen 3.5 (todos los modelos)](https://qwen-ai.com/qwen-3-5/)
- [Repositorio oficial de Qwen3 en GitHub](https://github.com/QwenLM/Qwen3)
- [Blog oficial de Qwen sobre Qwen3.5](https://qwen.ai/blog?id=qwen3.5)
