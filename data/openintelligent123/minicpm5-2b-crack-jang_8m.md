# Openintelligent123/MiniCPM5-2B-CRACK-JANG_8M

## Resumen

MiniCPM5-2B-CRACK-JANG_8M es una version modificada ("abliterated" o "uncensored") del modelo openbmb/MiniCPM5-2B, publicada por el usuario Openintelligent123. Se trata de un modelo denso de tipo transformer con estilo Llama, de aproximadamente 2,52 mil millones de parametros, disenado para generacion de texto y conversacion en ingles y chino. El modelo base, MiniCPM5-2B, fue publicado por OpenBMB el 6 de septiembre de 2026 como segunda entrega de la serie MiniCPM5, e incorpora modo de razonamiento binario (thinking on/off) y function calling con formato XML.

La particularidad de esta ficha es que el comportamiento de rechazo se ha eliminado a nivel de pesos: no emplea hooks en tiempo de ejecucion ni vectores de direccion (steering vectors), sino que el bundle se carga con `mlx_lm.load()` sin modificaciones respecto al formato estandar de MLX. El resultado es un paquete de 8 bits affine con escalas bf16 y sin promocion a fp32, calibrado sobre la fuente con AWQ, GPTQ e imatrix, con un peso total de aproximadamente 2,5 GB en un unico shard de 973 tensores.

El modelo esta empaquetado especificamente para vMLX, un motor de inferencia MLX para Apple Silicon, y declara 131.000 tokens de contexto, plantilla de chat sin cambios respecto al base y un parser de herramientas XML tipo sidecar. Su relevancia actual reside en ofrecer capacidades de razonamiento y tool calling en un tamano muy reducido, orientado a equipos de escritorio con chip de Apple, a costa de renunciar a las barreras de seguridad del modelo original, lo que plantea consideraciones de uso muy serias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso estilo Llama (segun tags del repositorio) |
| Parametros totales | 2.516.756.480 (aprox. 2,52 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.000 tokens (131K) |
| Tipos de cuantizacion | 8-bit affine con escalas bf16 (bundle JANG_8M); sin promocion a fp32 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX; libreria mlx) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo base openbmb/MiniCPM5-2B, un transformer denso de estilo Llama con soporte de modo de razonamiento binario y function calling enmarcado en XML. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset de la fase de alineacion ni sobre si se aplico RLHF o DPO durante el desarrollo del modelo base.

La innovacion tecnica de esta version concreta es el proceso de ablacion de rechazo y su empaquetado. Segun el autor, el comportamiento de rechazo se elimina a nivel de pesos, sin hooks en runtime ni steering vectors, manteniendo la plantilla de chat y el parser de herramientas XML inalterados respecto al base. La cuantizacion es un bundle completo de 8 bits affine con escalas en bf16, sin promocion a fp32, y se aplico calibracion AWQ, GPTQ e imatrix sobre la fuente. El resultado se distribuye como un unico shard safetensors de 973 tensores y aproximadamente 2,5 GB.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y chino.
- Razonamiento con modo thinking conmutable (thinking on/off): plantilla de chat identica a la del base.
- Function calling / tool calling con parser XML tipo sidecar (sin cambios respecto al base).
- Capacidades de codigo, conocimiento y razonamiento, con una degradacion declarada de solo -1,20 puntos en MMLU respecto al base.
- Cobertura bilingue EN + ZH.
- Comportamiento sin rechazo ante instrucciones en multiples categorias de tarea (caracteristica del modelo, no una capacidad adicional de conocimiento).
- Compatibilidad con el motor vMLX, que anade cuantizacion de KV-cache y soporte de tool calling agentico.

## Casos de uso

- Asistentes conversacionales de escritorio en Apple Silicon: el bundle de 2,5 GB se carga via `mlx_lm.load()` y cabe en la memoria unificada de un Mac moderno, lo que permite ejecutar un asistente local sin conexion con contexto de hasta 131K tokens.
- Razonamiento paso a paso con control de coste: el interruptor thinking on/off permite activar la traza de razonamiento solo en consultas complejas y desactivarla para respuestas rapidas, optimizando latencia en produccion.
- Pipelines de agente con tool calling: el parser XML de function calling permite integrar el modelo en flujos multi-paso donde el modelo decide que herramienta invocar y con que argumentos.
- Procesamiento de documentos largos en chino e ingles: los 131K tokens de contexto son utiles para resumir, extraer o clasificar contratos, informes o articulos extensos en cualquiera de los dos idiomas.
- Generacion y asistencia de codigo en entornos locales: el modelo mantiene su capacidad de codigo (con una perdida medida de -8,00 puntos en college_computer_science en MMLU) y puede integrarse en editores o scripts de desarrollo.
- Investigacion sobre alineacion y ablacion de rechazo: el modelo sirve como objeto de estudio para medir el impacto de eliminar las barreras de seguridad sobre el rendimiento general y por materia.
- Prototipado rapido en macOS: al ser un bundle MLX de un solo shard, es sencillo desplegarlo en portatiles y equipos de sobremesa con chip Apple para pruebas de concepto sin infraestructura de GPU dedicada.

## Benchmarks y rendimiento

Los siguientes resultados son los publicados por el autor y medidos sobre este bundle concreto:

| Metrica | Valor |
|---|---|
| MMLU (57 materias, modo logit, 14.042 items) | 57,52% (base 58,72%, delta -1,20 pp) |
| HarmBench-320 harm-ASR, thinking OFF | 97,50% (234/240) |
| HarmBench-320 harm-ASR, thinking ON | 100,00% (240/240) |
| Tamano | ~2,5 GB (un shard, 973 tensores) |

Desglose de MMLU por categoria:

| Categoria | Base | Uncensored | Delta (pp) |
|---|---:|---:|---:|
| STEM | 55,30% | 53,38% | -1,92 |
| Humanities | 51,75% | 51,56% | -0,19 |
| Social Sciences | 67,18% | 65,42% | -1,75 |
| Other | 63,97% | 62,52% | -1,45 |
| Total (57 materias) | 58,72% | 57,52% | -1,20 |

El autor indica que varias materias de logica y matematicas mejoraron tras la ablacion de rechazo, citando como ejemplos abstract_algebra (+5,00 pp), formal_logic (+2,38 pp) y high_school_physics (0,00 pp). Como contrapartida, las mayores caidas por materia incluyen college_computer_science (-8,00 pp), management (-5,83 pp) y high_school_mathematics (-5,56 pp). La tabla completa de 57 materias aparece truncada en la informacion disponible. No se han facilitado resultados de HumanEval, GSM8K ni de otras suites estandar en la informacion disponible.

## Requisitos de hardware

- Peso del bundle: aproximadamente 2,5 GB en cuantizacion de 8 bits affine. La memoria adicional para la KV-cache depende de la longitud de contexto efectiva y no esta especificada.
- Plataforma objetivo: Apple Silicon mediante el motor MLX/vMLX; el modelo usa la libreria `mlx` y no se distribuye en otros formatos.
- Estimacion de memoria unificada: para contextos cortos se estima viable en equipos con 8 GB de memoria unificada; para contextos cercanos a 131K tokens se recomienda disponer de 16-32 GB, ya que la KV-cache crece con la longitud de secuencia.
- GPU dedicadas (A100, H100, RTX 4090): no disponibles de forma nativa; requeriria conversion a otro formato y motor, no documentada en la informacion proporcionada.
- Opciones de despliegue: vMLX (recomendado por el autor) y `mlx_lm` como via estandar de carga en MLX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 2,7 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| MiniCPM5-2B-CRACK-JANG_8M (este) | ~2,52 mil millones (denso) | 131K | apache-2.0 | MLX safetensors, 8-bit affine | MMLU 57,52% |
| openbmb/MiniCPM5-2B (base) | ~2,52 mil millones (denso) | 131K | apache-2.0 | safetensors | MMLU 58,72% (con rechazo intacto) |
| Otros modelos de ~2B (fora de esta informacion) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa y con datos completos solo es posible frente al modelo base, del que este es un fine-tune. No se dispone de datos verificables de terceros (por ejemplo, Qwen2.5-1.5B, Gemma-2-2B u otros de la misma clase) en la informacion proporcionada, por lo que no se incluyen cifras comparativas que no esten confirmadas.

## Limitaciones y advertencias

- Modelo sin rechazo: la ablacion elimina las barreras de seguridad a nivel de pesos. Puede generar contenido danino, ilegal o inapropiado. El uso en produccion exige moderacion externa obligatoria.
- Cifras de HarmBench: 97,50% (thinking OFF) y 100,00% (thinking ON) de harm-ASR indican que el modelo cumple practicamente siempre con peticiones daninas. Es un dato critico para cualquier despliegue expuesto a usuarios.
- Degradacion de capacidades: -1,20 pp en MMLU total, con caidas notables por materia (college_computer_science -8,00 pp, management -5,83 pp, high_school_mathematics -5,56 pp, high_school_geography -5,05 pp).
- Solo dos idiomas: ingles y chino; no hay soporte declarado de castellano ni de otras lenguas.
- Riesgo de alucinacion: propio de un modelo denso de ~2,5B; la ventana de 131K no garantiza recuperacion fiable de informacion en posiciones lejanas.
- Plataforma limitada: formato MLX y libreria mlx, orientado a Apple Silicon; no hay soporte documentado para CUDA, vLLM, llama.cpp, Ollama ni TGI.
- Reputacion del repositorio: 0 descargas y 0 likes en el momento de la ficha, lo que implica ausencia de validacion comunitaria independiente.
- Licencia: apache-2.0, lo que en principio permite uso comercial, pero el responsable del despliegue asume toda la responsabilidad legal y etica sobre las salidas del modelo, dado que el comportamiento de rechazo ha sido eliminado.
- Fine-tune no oficial: no esta respaldado ni validado por OpenBMB, autor del modelo base.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Openintelligent123/MiniCPM5-2B-CRACK-JANG_8M)
- [Modelo base openbmb/MiniCPM5-2B](https://huggingface.co/openbmb/MiniCPM5-2B)
- [vMLX (motor de inferencia MLX para Apple Silicon)](https://vmlx.net)
- [Pagina de soporte del autor (Ko-fi)](https://ko-fi.com/dealignai)

No se han encontrado otros enlaces relevantes (papers, blogs o repositorios) en la busqueda web realizada; los resultados devueltos no guardan relacion con el modelo.
