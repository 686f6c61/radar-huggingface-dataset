# chenyumo/MoziAier-9B-TQ

## Resumen

MoziAier 9B-TQ es un modelo de lenguaje denso de 9.000 millones de parametros, publicado por el desarrollador chenyumo (equipo MoziAier) el 1 de noviembre de 2026 bajo licencia Apache-2.0. Se construye sobre dos bases encadenadas: el modelo preentrenado Qwen/Qwen3.5-9B y el contenedor de cuantizacion ternaria prism-ml/Ternary-Bonsai-2-9B-gguf, sobre el que se aplica un ajuste de comportamiento y una plantilla de chat propia. El resultado es un unico archivo GGUF de 1,86 GiB que, segun el autor, permite ejecutar 150.000 tokens de contexto en una GPU de 6 GB de VRAM.

El modelo resuelve un problema muy concreto: desplegar un asistente de contexto largo, con entrada de imagen y salida estructurada, en hardware de consumo y sin conexion a internet. Cada peso se almacena con tres valores posibles (-1, 0, +1) en un contenedor PTQ1.0, lo que reduce el tamano del archivo a practicamente un tercio de una cuantizacion de 4 bits equivalente y disminuye el ancho de banda de memoria necesario durante la decodificacion.

La propuesta de valor no es la puntuacion en rankings, sino el umbral minimo de hardware combinado con una capa de comportamiento propia: un marco de razonamiento en siete dimensiones, un mecanismo de iteracion tipo agente con criterios de salida y una plantilla de herramientas orientada a llamadas de funcion. Es relevante para desarrolladores que necesitan procesar documentos extensos o construir agentes locales en entornos aislados, a costa de asumir un ecosistema de inferencia muy restringido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Dense), derivado de Qwen3.5-9B |
| Parametros totales | 9B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 150K por defecto (153.600 tokens); maximo 250K (256.000 tokens); minimo operativo 16K |
| Tipos de cuantizacion | Ternaria (-1 / 0 / +1) en contenedor PTQ1.0; pesos principales en Q2_0-PTQ1_0; proyector visual en Q8_0 |
| Idiomas soportados | Chino (zh) e ingles (en); chino prioritario |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (libreria llama-cpp) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso heredado de Qwen3.5-9B, sin mezcla de expertos ni componentes de estado recurrente. La innovacion principal esta en la representacion de pesos: la cuantizacion ternaria PTQ1.0 asigna a cada peso uno de tres valores, de modo que el archivo final ocupa 1.997.527.168 bytes (1,86 GiB). El modelo se distribuye como un unico GGUF que incluye la plantilla de chat embebida en `tokenizer.chat_template` (26.492 caracteres), de forma que no es necesario aportar un archivo `.jinja` externo en el arranque.

Sobre el contenedor ternario, el autor aplica un ajuste de comportamiento y exporta los pesos de forma sobreescrita, anadiendo tres mecanismos propios: un sistema de clasificacion de tarea (simple, analitica o compleja), un marco de razonamiento en siete dimensiones (comprension, evaluacion de complejidad, dependencias, riesgos, recursos, criterios de aceptacion y estrategia de ejecucion) y un bucle de agente con reglas de salida para evitar iteraciones infinitas. No se detallan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF o DPO. El autor indica que esta version no incluye tensores MTP y que activar decodificacion especulativa MTP en el modelo de 9B supone una perdida de rendimiento del 13,7 %.

## Capacidades

- Generacion de texto y razonamiento estructurado en chino e ingles, con salida organizada en linea de clasificacion de tarea, dimensiones de analisis y, en tareas complejas, bucle de iteracion.
- Llamada a herramientas y funciones: segun el autor, con el modo de pensamiento desactivado la tasa de exito en formato de tool calling es de 20/20; al activarlo baja a 10/20.
- Ejecucion de tareas de agente en multiples pasos, con fases, criterios de aceptacion por etapa y capacidad de reanudacion por parte de un sistema externo.
- Entrada de imagen mediante proyector visual mmproj en Q8_0 (595 MB): lectura de capturas, graficos y documentos escaneados.
- Contexto largo de 150K por defecto y hasta 250K tokens, suficiente para libros completos o repositorios de codigo de tamano medio.
- Comportamiento explicito de rechazo a la fabricacion: ante preguntas sobre informacion que no posee, responde que no la encuentra en lugar de inventar.
- Deteccion de consultas dependientes del tiempo: solicita busqueda en internet en lugar de responder de memoria (la conectividad debe aportarla una herramienta externa; el modelo no navega).
- Modo de pensamiento desactivable, recomendado desactivado para uso general y para tool calling.

## Casos de uso

- Analisis de documentacion legal o contractual: con 150K tokens de contexto se puede cargar un contrato completo y pedir extraccion de clausulas, deteccion de contradicciones y resumen por secciones, con salida estructurada facil de volcar a una base de datos.
- Atencion al cliente en local: el modelo mantiene conversaciones multiturno en chino e ingles y puede invocar funciones (consulta de pedidos, estado de tickets) mediante tool calling con formato estable cuando el modo de pensamiento esta desactivado.
- Procesamiento de documentos en entornos aislados: al ocupar 1,86 GiB y ejecutarse con llama.cpp, se puede desplegar en equipos sin conexion externa, algo relevante en administraciones o industria con requisitos de confidencialidad.
- Revision de repositorios de codigo: la ventana de 250K tokens permite cargar varios modulos y pedir explicaciones, deteccion de dependencias entre ficheros o generacion de documentacion tecnica.
- Agentes de tareas largas con reanudacion: el bucle con criterios de aceptacion por fase encaja en orquestadores externos que necesitan puntos de control y salidas parseables para continuar un flujo tras una interrupcion.
- Digitalizacion de documentos escaneados: combinando el proyector visual con el contexto largo se pueden procesar lotes de imagenes de facturas o formularios y extraer campos en un formato consistente.
- Asistente personal en GPU de gama de entrada: con 6 GB de VRAM y 150K de contexto, un equipo con una GPU modesta puede ofrecer resumen de articulos, traduccion zh-en y respuesta a preguntas sobre PDFs sin coste de API.

## Benchmarks y rendimiento

El autor publica un conjunto de evaluacion propio de 6 dimensiones (120 preguntas por banco, dos bancos), pero no se incluyen en la informacion disponible los resultados numericos de MMLU, HumanEval, GSM8K ni de esa evaluacion propia. Los unicos datos de rendimiento disponibles son de inferencia, medidos en una AMD Radeon AI PRO R9700 (32 GB) con ROCm 7.13 y 150K de contexto:

| Metrica | Valor | Entorno |
|---|---|---|
| Prefill | 2.246 t/s | R9700, contexto 150K |
| Decodificacion | 136,1 t/s | R9700, contexto 150K |
| VRAM de contexto | 5,26 GB (150K) / 6,73 GB (250K) | Total Committed |
| Exito en tool calling | 20/20 (pensamiento desactivado) / 10/20 (activado) | Prueba interna del autor |
| Impacto de MTP | -13,7 % | Modelo de 9B con decodificacion especulativa |

No se han publicado resultados de benchmarks academicos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 6 GB para contexto de 150K y 8 GB para 250K, segun las cifras de memoria comprometida del autor (5,26 GB y 6,73 GB respectivamente, mas el espacio del proyector visual de 595 MB).
- GPU recomendadas: AMD Radeon AI PRO R9700 (32 GB) es el entorno de referencia del autor; cualquier GPU con 6-8 GB o mas de VRAM deberia ser suficiente en teoria, aunque no se aportan mediciones en otras tarjetas.
- GPU de consumo: el modelo esta disenado explicitamente para tarjetas de 6 GB, por lo que encaja en gamas de entrada y media; no se especifican modelos concretos ni resultados medidos en RTX 4090, A100 o H100.
- Motor de inferencia: requiere una compilacion especifica de llama.cpp para cuantizacion ternaria (linaje Prism, licencia MIT); la version oficial de llama.cpp no soporta este formato. No se mencionan vLLM, TGI ni Ollama como opciones compatibles.
- Despliegue: llama.cpp con servidor web integrado (interfaz en `http://localhost:8080`); requiere cargar simultaneamente el peso principal y el proyector visual mmproj Q8_0.
- Almacenamiento: alrededor de 2,5 GB para pesos y proyector; el autor senala que basta un SSD convencional.
- Latencia y throughput: 136,1 t/s de decodificacion y 2.246 t/s de prefill en R9700 con 150K de contexto; no hay datos para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| MoziAier 9B-TQ | 9B denso | 150K / 250K | Ternaria PTQ1.0, 1,86 GiB | Apache-2.0 | Requiere build especifico de llama.cpp; vision y tool calling |
| Qwen3.5-9B (base) | 9B denso | no disponible | Original en safetensors; cuantizaciones estandar | no disponible en la informacion | Base de preentrenamiento; sin las capas de comportamiento de MoziAier |
| Ternary-Bonsai-2-9B | 9B denso | no disponible | Ternaria, formato GGUF | no disponible en la informacion | Base de cuantizacion ternaria sobre la que se construye este modelo |
| Cuantizacion 4-bit equivalente de un 9B | 9B denso | depende del modelo base | 4 bits, aprox. 5-6 GiB | depende del modelo base | Mayor peso en disco y mas ancho de banda por token que la version ternaria |

La comparacion con alternativas de otros fabricantes del mismo segmento no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Ecosistema de inferencia restringido: solo funciona con una compilacion no oficial de llama.cpp con soporte ternario; no hay soporte en llama.cpp upstream, vLLM, TGI ni Ollama, lo que complica el mantenimiento y la integracion en produccion.
- Idiomas: solo chino e ingles declarados; el rendimiento en castellano u otras lenguas no esta documentado y previsiblemente sera inferior.
- El proyector visual debe ser obligatoriamente la version Q8_0; la version BF16 provoca caidas del servicio con peticiones de imagen concurrentes, segun el autor.
- El contexto minimo operativo es de 16K porque la plantilla del sistema ocupa unos 8.884 tokens; con 4K la peticion falla. Esto encarece cada llamada en tokens de sistema.
- El modo de pensamiento debe desactivarse en clientes (`enable_thinking: false`); de lo contrario el campo `content` queda vacio, lo que rompe integraciones que no lo contemplen.
- El tool calling degrada su fiabilidad al activar el razonamiento (10/20 frente a 20/20), por lo que no conviene combinar ambos en flujos criticos.
- Riesgo de alucinacion mitigado pero no eliminado: el autor afirma que el modelo rechaza inventar datos ausentes, pero no se aportan metricas de fidelidad ni evaluaciones independientes.
- Sin resultados publicos en benchmarks academicos ni evaluaciones de terceros; las cifras de rendimiento proceden del propio autor y de una unica GPU AMD.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o robustez.
- Licencia Apache-2.0 permite uso comercial, pero la procedencia de los pesos base y las obligaciones de atribucion deben revisarse en el archivo `NOTICE` del repositorio.
- La fecha de publicacion y el numero de descargas (0 en el momento de la consulta) indican que el modelo carece de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/chenyumo/MoziAier-9B-TQ
- ModelScope: https://modelscope.cn/models/chenyumo/MoziAier-9B-TQ
- GitHub (referencia truncada en la model card): https://github.com/chenyumo166/MoziAier-9B-TQ
- Modelo base de preentrenamiento: https://huggingface.co/Qwen/Qwen3.5-9B
- Base de cuantizacion ternaria: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
