# Broikos/bslm-72m-v1

## Resumen

BSLM 72M v1 es un modelo de lenguaje pequeño desarrollado por Broikos (Nikos Broikos) que se ha entrenado completamente desde cero, sin utilizar pesos preentrenados, modelos base de Hugging Face ni destilación. Cada parámetro parte de una inicialización aleatoria y se entrena sobre un corpus autogenerado por el propio proyecto, complementado con resultados reales de herramientas. El modelo está diseñado como un asistente bilingüe (inglés y griego) para tareas cotidianas, en lugar de un modelo de chat general: entiende una lista fija de tareas y las ejecuta llamando a herramientas, sin intentar memorizar hechos.

Con 72,6 millones de parámetros y una arquitectura decoder estilo Llama, BSLM 72M v1 se distribuye en formato GGUF cuantizado a Q8_0 (78 MB) y puede ejecutarse en CPU con llama.cpp usando 4 hilos. Su relevancia radica en que demuestra cómo construir un agente funcional de tool calling con un presupuesto de parámetros mínimo, y en que publica resultados de rendimiento honestos, incluyendo las limitaciones de un modelo de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama |
| Parametros totales | 72.564.480 (72,6 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | Inglés, griego |
| Licencia | MIT |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

BSLM 72M v1 es un transformer decoder-only con forma de Llama, pero no se especifican el número de capas, cabezas de atención ni dimensiones ocultas. El entrenamiento se realizó desde una inicialización aleatoria sobre un corpus autogenerado por el proyecto, más resultados reales de herramientas. No se utilizaron pesos preentrenados, modelos base ni destilación. El proceso de entrenamiento está documentado en el repositorio del proyecto (PROCESS.md y OWN_MODEL.md).

La innovación técnica destacable es el protocolo de agente en bucle: el modelo genera líneas de texto con roles Plan, Act, Judge, Ask y Deliver, pero no genera los resultados de las herramientas. El entorno (runtime) ejecuta la herramienta real y escribe el resultado en el contexto, y la generación se detiene antes de cualquier resultado. Esto evita que el modelo invente salidas de herramientas y permite un flujo de trabajo multi-paso con verificación.

## Capacidades

- Generación de texto y razonamiento acotado: el modelo sigue un protocolo estructurado de agente para tareas cotidianas, no conversación libre.
- Tool calling / function calling: soporta llamadas a herramientas para clima en vivo, búsquedas web con lectura y verificación, temporizadores, alarmas, recordatorios, listas, notas, calendario, luces y interruptores inteligentes, búsqueda de música, matemáticas y conversión de unidades.
- Agentes y razonamiento multi-paso: implementa un bucle Plan / Act / Judge / Ask / Deliver, donde el entorno ejecuta las herramientas y el modelo decide el siguiente paso.
- Capacidades multilingües: inglés y griego.
- Honestidad: cuando una búsqueda no respalda la respuesta, el modelo devuelve "no pude confirmar eso" en lugar de inventar.

## Casos de uso

- Asistente doméstico por voz: el modelo puede controlar luces inteligentes, temporizadores y alarmas mediante tool calling, integrándose en un runtime que ejecuta las acciones.
- Gestión de agenda y recordatorios: crea notas, listas y eventos de calendario a partir de instrucciones en lenguaje natural, gracias a su soporte de herramientas.
- Consultas meteorológicas en tiempo real: llama a una API de clima y presenta la información al usuario, sin alucinar datos.
- Búsqueda web con verificación: responde preguntas factuales realizando búsquedas y comprobando la fuente; si no confirma, declina honestamente.
- Conversión de unidades y cálculo básico: resuelve operaciones matemáticas y conversiones de unidades en un entorno de agente.
- Asistente bilingüe para atención al cliente: puede atender consultas en inglés y griego en dominios acotados, como soporte técnico de dispositivos domésticos.
- Integración en sistemas de automatización del hogar (Home Assistant): gracias a su protocolo de agente y su tamaño reducido, puede ejecutarse en hardware modesto.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Tareas reservadas (held-out task set) | ~91% |
| Prueba de escenario a traves de la app | 94% |
| Precision en hechos | ~70% |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K. Los datos proceden de las pruebas internas del autor.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM significativa; el archivo GGUF Q8_0 pesa 78 MB y puede ejecutarse en CPU.
- GPU recomendadas: no disponible; por su tamaño, cualquier GPU moderna con al menos 1 GB de VRAM sería suficiente, pero el uso previsto es CPU.
- Cabe en consumer GPU: sí, el modelo es extremadamente pequeño y cabe en cualquier GPU de consumo.
- Opciones de despliegue: llama.cpp, LM Studio y el runtime propio del proyecto (bslm/agent.py).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones publicadas con modelos de características similares en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat general: su rendimiento en conversación libre será bajo; está diseñado para un conjunto fijo de tareas.
- Precisión de hechos limitada: alrededor del 70%, que el autor identifica como el techo para un modelo de 72M.
- Riesgo de alucinación: aunque hay una comprobación de entrega, todavía se cuelan alucinaciones (por ejemplo, inventar un valor en lugar de declinar).
- Solo soporta inglés y griego.
- Longitud de contexto no especificada; no se puede garantizar un comportamiento con contextos largos.
- Depende del runtime externo para ejecutar herramientas; sin él, el modelo no puede realizar sus funciones de agente.
- Licencia MIT permite uso comercial, pero el modelo no es competitivo para aplicaciones generales de chat o generación de texto.

## Enlaces

- HuggingFace: https://huggingface.co/Broikos/bslm-72m-v1
- Repositorio GitHub: https://github.com/Broikos-Nikos/bslm
- Documentos en el repositorio: AGENT_BENCHMARK.md, WEB_TEST.md, PROCESS.md, OWN_MODEL.md
