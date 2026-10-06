# sagaya/LFM2.5-1.2B-Instruct-control-mlx

## Resumen

sagaya/LFM2.5-1.2B-Instruct-control-mlx es una compilacion cuantizada en formato MLX del modelo LiquidAI/LFM2.5-1.2B-Instruct, adaptada especificamente para ejecutarse en dispositivos Apple, incluidos iPhone con 8 GB de memoria. El autor (sagaya) parte del modelo base de LiquidAI y le aplica una destilacion orientada a tareas de Control (uso de herramientas, automatizaciones, calendario, contactos, recordatorios, etc.), seguida de una cuantizacion de 6 bits con grupos de 64 (receta 6bit-g64).

El resultado es un modelo denso de aproximadamente 1.170 millones de parametros que ocupa 0,95 GB en disco y mantiene una perplejidad en validacion de 23,775 frente a 23,607 del modelo en precision completa, con una divergencia KL de 0,0047 nats sobre respuestas de chat y un 97,7% de coincidencia en el siguiente token. La perdida de calidad respecto al modelo original es, por tanto, muy reducida.

Su relevancia actual radica en que demuestra que un modelo de ~1,2B puede ejecutarse de forma local en un telefono (estimacion de 41,7 tok/s en iPhone) manteniendo un formato de llamada a herramientas y una plantilla de chat identicas a las del modelo original. Esta distribuido bajo la licencia LFM Open License v1.0, con restriccion de uso comercial para organizaciones con ingresos anuales iguales o superiores a 10 millones de dolares. La informacion disponible no detalla la longitud de contexto ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Familia LFM2 (Liquid Foundation Model 2); detalles internos no disponibles |
| Parametros totales | 1.170.340.608 (~1,17B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits, grupos de 64 (6bit-g64); el autor tambien probo una receta de 4 bits |
| Idiomas soportados | no disponibles |
| Licencia | LFM Open License v1.0 (restringida para uso comercial si el ingreso anual de la organizacion es >= 10M USD) |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base es LiquidAI/LFM2.5-1.2B-Instruct, perteneciente a la familia LFM2 de LiquidAI. Sobre ese base, el autor aplica un proceso de destilacion para tareas de Control, tomando como profesor a Qwen3 30B-A3B Instruct (mlx-community/Qwen3-30B-A3B-Instruct-2507-4bit, licencia Apache 2.0). El ajuste se realizo mediante LoRA sobre 819 ejemplos de peticiones de estilo Control (las especificaciones de herramientas y el formato de prompt de la aplicacion del autor). Aproximadamente el 45% de las filas de entrenamiento corresponden a respuestas del propio modelo original (rehearsal), de modo que conserva el conocimiento previo. Los prompts de partida provienen del dataset databricks/databricks-dolly-15k (licencia CC-BY-SA-3.0).

Tras el ajuste, el modelo se cuantizo con la receta 6bit-g64 (6 bits, grupos de 64). El autor compara tres recetas (4 bits, 6 bits estandar y 6bit-g64), resultando ganadora la 6bit-g64 por su mejor equilibrio entre tamano (0,95 GB) y calidad (perplejidad 23,78, KL 0,005 y 97,7% de coincidencia top-1 frente a 88,1% de la opcion de 4 bits). La destilacion mejoro de forma notable la disposicion del modelo a llamar a herramientas: la coincidencia con el profesor al "llamar a una herramienta o responder" paso del 38,6% al 84,1%, y la coincidencia con la misma herramienta elegida por el profesor paso del 0,0% al 59,3%.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla identica a la del modelo original (5.487 caracteres).
- Llamada a herramientas / function calling en formato LFM2 (etiquetas `<|tool_call_start|>` y llamadas de estilo pythonico).
- Ejecucion de tareas de "Control": acciones, automatizaciones, calendario, contactos, salud, memoria, permisos, lugares, recordatorios, atajos, tiempo y busqueda web (segun las categorias evaluadas en su conjunto de tareas).
- Recuperacion de hechos en contexto: en la prueba del autor, 4 de 4 aciertos recuperando informacion situada unos 2.000 tokens atras.
- Multi-turno: soporta conversaciones con contexto, aunque la longitud exacta de ventana no esta disponible.
- No dispone de modo "thinking": el modelo original tampoco lo tiene y esta build lo mantiene desactivado.
- Multilingue: no disponible (los idiomas soportados no se especifican en la informacion).
- Vision / audio: no disponible.

## Casos de uso

- Asistente personal en el propio telefono: con 0,95 GB de peso y una estimacion de 41,7 tok/s en iPhone, puede ejecutarse en local para conversaciones y tareas de control sin enviar datos a la nube.
- Control de aplicaciones por voz o texto: el ajuste de Control entrena al modelo para emitir llamadas a herramientas en formato LFM2, lo que permite gestionar acciones como crear recordatorios, consultar el calendario o buscar contactos.
- Automatizaciones y atajos: aunque el rendimiento en la categoria de automatizaciones es limitado (0/7 en las pruebas del autor), el modelo conserva el formato de llamada a herramientas necesario para integrarse en flujos de control de dispositivos.
- Gestion de agenda y recordatorios: en las categorias de calendario (5/12) y recordatorios (1/5) mejora respecto al modelo base sin ajustar, lo que lo hace util como base para prototipos de asistente de productividad.
- Recuperacion de informacion dentro de un documento o conversacion: con 4/4 aciertos a ~2.000 tokens de distancia, sirve para tareas de pregunta-respuesta sobre contexto moderadamente largo.
- Inferencia en el borde (edge): por su tamano y su velocidad en hardware Apple (279 tok/s en Mac, primer token en 0,02 s), es adecuado para aplicaciones de escritorio macOS que requieran respuestas locales de baja latencia.
- Prototipado de agentes con tool calling: al mantener el formato exacto de llamada a herramientas del modelo original, puede integrarse en pipelines que ya esperen ese esquema sin reentrenamiento adicional.

## Benchmarks y rendimiento

Resultados publicados por el autor. La columna "Student after" corresponde a esta build (6bit-g64). Se incluye tambien la referencia del modelo en precision completa sin ajustar.

| Tarea | Full precision (untuned) | 6bit-g64 (esta build) |
|---|---|---|
| ARC-Challenge (100) | 45,0% ± 10% | 40,0% ± 10% |
| GSM8K (50) | 66,0% ± 13% | 66,0% ± 13% |
| IFEval strict (50) | 80,0% ± 11% | 80,0% ± 11% |
| MMLU-Pro (3 por materia) | 38,1% ± 13% | 31,0% ± 14% |
| Media general | 57,3% | 54,2% |
| Tareas de Control (quick) | 9/65 | 26/65 |

Metricas de calidad frente a la version en precision completa:

| Medida | Esta build | Precision completa |
|---|---|---|
| Perplejidad en validacion | 23,775 | 23,607 |
| Divergencia KL en respuestas de chat | 0,0047 nats | 0 |
| Mismo siguiente token en chat | 97,7% | 100% |
| Recuperacion de hechos a ~2.000 tokens | 4/4 | 4/4 |
| Tamano | 0,95 GB | no disponible |

Rendimiento medido en Mac con el motor de la aplicacion:

| Comprobacion | Valor |
|---|---|
| Velocidad de decodificacion en Mac | 279 tok/s |
| Primer token (Mac) | 0,02 s |
| Memoria maxima (Mac) | 1,00 GB |
| Estimacion en iPhone | 41,7 tok/s (en frio) |

Comparativa entre recetas probadas por el autor:

| Receta | Tamano | Bits/peso | Perplejidad | KL (chat) | Top-1 (chat) | Recuperacion |
|---|---|---|---|---|---|---|
| shipped-4bit | 0,66 GB | 4,5 | 29,49 (+24,9%) | 0,088 | 88,1% | 4/4 |
| shipped-6bit | 0,95 GB | 6,5 | 24,73 (+4,8%) | 0,020 | 96,0% | 4/4 |
| 6bit-g64 | 0,95 GB | 6,5 | 23,78 (+0,7%) | 0,005 | 97,7% | 4/4 |

## Requisitos de hardware

- VRAM / memoria estimada: 1,00 GB de memoria maxima medida en Mac; el peso del modelo ocupa 0,95 GB.
- Dispositivos objetivo: iPhone con 8 GB de memoria, segun declara el autor; tambien Mac (Apple Silicon) para el motor de la aplicacion.
- GPU NVIDIA (A100, H100, RTX 4090, etc.): no aplica de forma nativa, ya que el formato es MLX y no esta pensado para CUDA.
- Cabe en hardware de consumo: si, en dispositivos Apple. No se documenta soporte para GPU de consumo NVIDIA/AMD.
- Opciones de despliegue: mlx-lm (comando `mlx_lm.generate`), el motor Swift del autor y su motor de aplicacion. No se mencionan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia / throughput: 279 tok/s de decodificacion en Mac, 0,02 s hasta el primer token en Mac y estimacion de 41,7 tok/s en iPhone en frio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sagaya/LFM2.5-1.2B-Instruct-control-mlx (esta build) | ~1,17B | no disponible | Media general 54,2%; Control 26/65 | LFM Open License v1.0 (restringida) | HuggingFace, formato MLX |
| LiquidAI/LFM2.5-1.2B-Instruct (base) | ~1,17B (precision completa) | no disponible | Media general 57,3%; Control 9/65 | LFM Open License v1.0 | HuggingFace |
| Qwen3 30B-A3B Instruct (profesor, 4 bits) | 30B (MoE, ~3B activos) | no disponible | Media general 76,0%; Control 54/65 | Apache 2.0 | HuggingFace (mlx-community) |

La comparativa se limita a los modelos citados en la informacion disponible. No se aportan datos de otros modelos de tamano similar (por ejemplo, alternativas de ~1B de otros fabricantes) en la documentacion proporcionada.

## Limitaciones y advertencias

- Licencia: LFM Open License v1.0. El uso comercial por parte de organizaciones con ingresos anuales iguales o superiores a 10 millones de dolares no esta licenciado; hay que revisar los terminos antes de un despliegue en produccion.
- Riesgo de alucinacion: no se documenta de forma explicita, pero es un modelo de ~1,2B; su MMLU-Pro es bajo (31,0%), lo que sugiere conocimientos factuales limitados.
- Rendimiento en tareas de Control muy desigual: en las pruebas del autor hay categorias con 0 aciertos (automatizaciones 0/7, contactos 0/3, salud 0/2, recordatorios 1/5). El modelo no es fiable para todas las categorias de control.
- Contexto e idiomas no especificados: no se proporciona la longitud de ventana ni la lista de idiomas soportados, lo que dificulta planificar su uso en produccion.
- Degradacion por cuantizacion: aunque pequena, existe. La perplejidad sube de 23,607 a 23,775 (+0,7%), la coincidencia top-1 baja al 97,7% y la media general cae de 57,3% a 54,2% respecto al base sin ajustar.
- Sesgos: no disponibles en la informacion proporcionada.
- Compatibilidad: el formato MLX limita su uso a hardware Apple; no esta pensado para servidores CUDA ni para los frameworks de despliegue habituales en la nube.
- Procedencia de datos de entrenamiento: se usaron prompts de databricks-dolly-15k (CC-BY-SA-3.0) y respuestas del profesor Qwen3 30B-A3B Instruct; conviene tener en cuenta las condiciones de ambas fuentes.
- Adopcion: el repositorio presenta 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sagaya/LFM2.5-1.2B-Instruct-control-mlx
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Modelo profesor (Qwen3 30B-A3B Instruct, 4 bits): https://huggingface.co/mlx-community/Qwen3-30B-A3B-Instruct-2507-4bit
- Dataset de prompts: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Licencia (LFM Open License v1.0): referenciada como LICENSE en el repositorio
