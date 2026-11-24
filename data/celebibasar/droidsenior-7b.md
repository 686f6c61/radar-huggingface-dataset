# celebibasar/DroidSenior-7B

## Resumen

DroidSenior-7B es un ajuste fino del modelo Qwen2.5-Coder-7B-Instruct orientado especificamente al desarrollo Android moderno con Kotlin y Jetpack Compose. Lo desarrolla el usuario celebibasar y se distribuye en Hugging Face bajo licencia Apache 2.0. La version actual (v5, noviembre de 2026) se entrena en una sola pasada desde el modelo base limpio, a diferencia de las versiones v1 a v4, y esta calibrada contra el stack estable de Android a fecha 2026-11-08: AGP 9.5.1, Kotlin 2.4.21, Gradle 9.9.0, compileSdk 37 y Compose BOM 2026.09.00.

El modelo resuelve un problema concreto: los asistentes de codigo generalistas generan Kotlin con APIs obsoletas, imports incompletos y errores de compilacion en proyectos Android reales. DroidSenior-7B se entrena con ejemplos verificados por compilador y con un bucle de reparacion multi-turno, de modo que puede integrarse en flujos donde el compilador de Kotlin actua como verificador. Su arquitectura es la de Qwen2.5 (transformer decoder-only denso) con 7.615.616.512 parametros y contexto nativo de 32.768 tokens heredado del modelo base.

Es relevante ahora porque demuestra un patron practico de ajuste fino con verificacion automatica (SFT + GRPO con recompensa del compilador) sobre un modelo pequeno de 7B, alcanzando un 67,9 % de pass@1 en compilacion limpia y un 96,7 % combinando best-of-8 con reparacion guiada por errores del compilador. Todo el pipeline es reproducible con pesos abiertos y herramientas estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen2.5-Coder-7B-Instruct; no se especifica en la model card) |
| Tipos de cuantizacion | GGUF Q4_K_M disponible (4,68 GB); otras cuantizaciones no disponibles en la informacion |
| Idiomas soportados | Ingles (en) y turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 15,2 GB); GGUF Q4_K_M |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-Coder-7B-Instruct: un transformer decoder-only denso con atencion causal estandar, sin mezcla de expertos. El ajuste fino se realiza en una unica pasada desde el modelo base limpio, con LoRA de rango 64 y alpha 128. El dataset de SFT consta de 7.614 ejemplos unicos distribuidos en ocho categorias: verified (1.854), ornith (735), teacher_2026 (1.851), build (295), mined (1.042), teacher_new (128), repair (1.627) y repair_new (82). Los ejemplos nuevos de 2026 se ponderan al doble y los ejemplos de reparacion multi-turno al triple; en estos ultimos la perdida se calcula solo sobre la respuesta final corregida.

Tras el SFT se aplica GRPO durante 150 pasos con 8 respuestas muestreadas por pregunta y una recompensa basada en el compilador: 1,0 si compila limpio, 0,75 con avisos de deprecacion, 0,30 si solo compila tras auto-import, 0,05 si no compila y 0 si no hay codigo. Los datos nuevos de profesor se generaron con Qwen2.5-Coder-32B-Instruct ejecutado localmente en 4 bits, y cada respuesta objetivo se compilo contra las versiones objetivo con imports completos y sin avisos de deprecacion. Las preguntas de evaluacion se eliminaron del conjunto de entrenamiento. La innovacion tecnica destacable es el uso del compilador de Kotlin como funcion de recompensa y como senal de reparacion en inferencia, junto con el modo best-of-N firmado.

## Capacidades

- Generacion de codigo Kotlin idiomatico para el stack Android estable de 2026-11-08 (AGP 9.5.1, Kotlin 2.4.21, Gradle 9.9.0, compileSdk 37, Compose BOM 2026.09.00).
- Uso de Jetpack Compose, Coroutines/Flow, Hilt y Room siguiendo la guia oficial de arquitectura de Android.
- Reparacion multi-turno a partir de la salida del compilador: acepta mensajes que empiezan por `Checking your answer against the project found:` con una linea `- ` por error.
- Soporte de pistas de API mediante un bloque `Relevant APIs in this project (current stable versions):` con lineas `- import <path>`; existe un `import_map.json` que mapea nombres de API a rutas de importacion.
- Inclusión de tests cuando aportan valor, segun el system prompt del autor.
- Explicacion breve de decisiones de diseno y compromisos (trade-offs).
- Respuesta en el idioma del usuario (la model card declara en y tr).
- Generacion de codigo verificable por compilador: el modelo esta optimizado para producir codigo que compile con `:app:compileDebugKotlin`.
- No se documentan capacidades de vision, audio, tool calling estructurado ni modo thinking.

## Casos de uso

- Generacion de pantallas Compose en produccion: el modelo produce composables con imports completos y APIs no obsoletas, lo que permite integrar su salida en un pipeline de CI que ejecute `:app:compileDebugKotlin` y rechace respuestas que no compilen.
- Reparacion automatica de errores de compilacion: dado un fallo de build, se envia el listado de errores como mensaje de reparacion y el modelo devuelve la respuesta completa corregida; el autor reporta un 85,1 % de compilacion con hasta dos rondas de reparacion y hechos de libreria.
- Asistente de migracion de APIs: el modelo fue entrenado para no usar APIs deprecadas y para migrar realmente en preguntas de migracion, lo que lo hace adecuado para tareas de actualizacion de versiones del stack Android.
- Best-of-N con verificacion por compilador: en entornos con compilador disponible se pueden muestrear 8 respuestas a temperatura 0,8 y top_p 0,95, compilarlas y quedarse con la primera que compile; el autor reporta un 94,6 % con best-of-8 y un 96,7 % anadiendo hasta tres rondas de reparacion.
- Generacion de codigo con Room y KSP: la evaluacion incluye comprobacion del procesamiento de anotaciones de Room (KSP), por lo que es adecuado para tareas de persistencia local con entidades, DAOs y consultas.
- Integracion en IDE o CLI de desarrollo: el modelo admite un system prompt fijo de ingeniero Android staff y puede desplegarse con text-generation-inference o endpoints compatibles para servir asistencia en el editor.
- Generacion de tests unitarios e instrumentados: el system prompt indica incluir tests cuando aportan valor, lo que permite usarlo para completar suites de pruebas en proyectos Kotlin.
- Formacion y revision de codigo: al explicar decisiones de diseno y trade-offs brevemente, sirve como revisor en pull requests de codigo Android.

## Benchmarks y rendimiento

Evaluacion con decodificacion greedy, mismo system prompt y 368 preguntas retenidas nunca usadas en entrenamiento. Los intervalos son del 95 % por bootstrap.

| Modelo | pass@1 | pass@1 y actual | + auto import | + 2 rondas de reparacion | pass@1 con pistas de API | Kotlin HumanEval |
|---|---|---|---|---|---|---|
| v4 | 46,2 % (41-51) | 45,7 % (40-51) | 54,6 % (49-60) | 56,2 % (51-61) | n/a | 72,7 % (66-80) |
| sft | 64,4 % (60-69) | 62,8 % (58-68) | 69,6 % (65-74) | 79,3 % (75-83) | 66,3 % (61-71) | 67,7 % (60-75) |
| grpo | 67,9 % (63-73) | 66,6 % (61-71) | 72,0 % (67-77) | 82,3 % (79-86) | 67,9 % (63-73) | 67,1 % (60-75) |

Resultados del sistema con best-of-8 y reparacion firmada sobre las mismas 368 preguntas:

| Configuracion | Compila |
|---|---|
| Respuesta greedy unica (pass@1) | 67,9 % (63-73) |
| Greedy + hasta 2 rondas de reparacion con hechos de libreria | 85,1 % (81-89) |
| Best of 8 muestras | 94,6 % (92-97) |
| Best of 8 + hasta 3 rondas de reparacion con hechos de libreria | 96,7 % (95-98) |

pass@k muestreado a temperatura 0,8: k=1 62,2 %, k=2 79,5 %, k=4 89,6 %, k=8 94,6 %. Los errores mas frecuentes en respuestas que no compilan: unresolved_reference 53, type_mismatch 16, otros 15, wrong_arguments 11, room_ksp 8, suspend_context 5. El GGUF Q4_K_M ocupa 4,68 GB y alcanza 7,9 tokens/s en CPU sobre Colab.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion; para un modelo denso de 7,6B en FP16 se situa en torno a 15 GB de pesos, y el repo safetensors ocupa 15,2 GB.
- Cuantizacion Q4_K_M: 4,68 GB, apta para GPU de consumo con 6-8 GB de VRAM y para ejecucion en CPU.
- GPU recomendadas: no especificadas por el autor; por tamano, A100, H100, RTX 4090 y RTX 3090 son adecuadas para FP16 o BF16.
- Cabe en GPU de consumo: si, en cuantizaciones de 4-8 bits (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090).
- Opciones de despliegue: transformers, text-generation-inference (tag `text-generation-inference`), endpoints compatibles, llama.cpp/Ollama mediante el GGUF Q4_K_M.
- Latencia y throughput: 7,9 tokens/s en CPU sobre Colab con Q4_K_M; no se publican cifras de GPU.
- El flujo best-of-8 con reparacion requiere aproximadamente 8 veces la generacion de una respuesta unica, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | pass@1 en la eval del autor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DroidSenior-7B (grpo) | 7,6B | 32.768 (heredado) | 67,9 % | Apache 2.0 | Hugging Face, safetensors y GGUF |
| DroidSenior-7B (sft) | 7,6B | 32.768 (heredado) | 64,4 % | Apache 2.0 | Hugging Face |
| DroidSenior-7B v4 | 7,6B | 32.768 (heredado) | 46,2 % | Apache 2.0 | Archivado como `DroidSenior-7B-v4` |
| Qwen2.5-Coder-7B-Instruct | 7,6B | 32.768 | no evaluado en la model card | Apache 2.0 | Hugging Face |

La comparativa con alternativas externas de la misma categoria (por ejemplo otros ajustes Android de 7B) no esta disponible en la informacion proporcionada. El propio autor solo compara contra sus versiones anteriores y sus propias variantes sft y grpo.

## Limitaciones y advertencias

- El modelo solo conoce versiones de librerias hasta 2026-11-08; releases posteriores de AGP, Kotlin, Gradle, Compose o compileSdk le son desconocidas.
- La evaluacion mide compilacion, no comportamiento en tiempo de ejecucion: el codigo puede compilar y fallar en runtime.
- La comprobacion de Hilt (procesamiento de anotaciones) no esta incluida en la evaluacion; solo se verifica Room KSP.
- Las 368 preguntas de evaluacion son aquellas que un profesor de 32B pudo responder correctamente, por lo que preguntas reales mas dificiles obtendran puntuaciones inferiores.
- Riesgo de alucinacion de APIs e imports: el modelo puede referenciar simbolos inexistentes (unresolved_reference es el error mas frecuente, 53 casos), por lo que se recomienda verificar con compilador.
- Idiomas declarados: solo ingles y turco; el rendimiento en castellano no esta documentado.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-Coder-7B-Instruct tiene sus propios terminos que conviene revisar.
- El flujo recomendado best-of-8 con reparacion multiplica el coste de generacion (unas 8 veces) y requiere un compilador de Kotlin y las fuentes de las librerias en el entorno.
- El modelo esta especializado en Android/Kotlin; su rendimiento en otros lenguajes o dominios no esta evaluado y probablemente sea inferior al del modelo base.
- El autor advierte que parte de los datos sinteticos se generaron con checkpoints anteriores de DroidSenior y modelos profesor abiertos locales, lo que puede introducir sesgos de destilacion.

## Enlaces

- Hugging Face: https://huggingface.co/celebibasar/DroidSenior-7B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Dataset de entrenamiento verificado: https://huggingface.co/datasets/giggiovpg/android-kotlin-compose-compiler-verified
- Dataset de instrucciones Android: https://huggingface.co/datasets/giggiovpg/ornith-android-instruct
- Modelo profesor: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Repositorio de versiones objetivo (`droidsenior_versions.json`) y mapa de imports (`import_map.json`): referenciados en la model card del repositorio de Hugging Face; no se proporcionan URLs directas en la informacion disponible.
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
