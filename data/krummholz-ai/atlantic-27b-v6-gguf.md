# krummholz-ai/atlantic-27b-v6-GGUF

## Resumen

Atlantic 27B v6 es un modelo de lenguaje de propósito general desarrollado por Krummholz AI LLC (Belfast, Maine), publicado como pre-release beta el 5 de noviembre de 2026. Se trata de un fine-tune mediante LoRA (rango 16, alpha 32, dropout 0,05) sobre el modelo base Qwen/Qwen3.8-27B, con entrenamiento supervisado seguido de entrenamiento por preferencias, fusionado en los pesos base y convertido a formato GGUF. El modelo es denso, con 26.895.998.464 parámetros totales, y hereda del base una arquitectura de 64 capas en la que 3 de cada 4 son Gated DeltaNet (atención lineal), además de un codificador de visión y una ventana de contexto de 262.000 tokens.

La propuesta diferencial de Krummholz no es solo el ajuste de pesos, sino un conjunto de "guards" implementados en Python que se ejecutan después de la respuesta del modelo y que cubren cuatro áreas: afirmaciones sobre consciencia, hechos territoriales disputados, origen del modelo y divulgación de que es una IA. Estos guards solo están activos en el runtime propio de Krummholz; un GGUF cargado en llama.cpp o LM Studio carece de ellos.

El modelo se distribuye bajo licencia Apache 2.0 y está orientado a uso general conversacional, lectura de documentos, uso de herramientas y temas de actualidad e historia. Es relevante ahora porque combina un contexto muy largo con visión y un enfoque explícito en reducir la alucinación (con un objetivo declarado de menos del 1 %, aún no alcanzado según el propio autor), aunque su estado beta y su soporte exclusivo de inglés limitan su adopción en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida: 64 capas, 3 de cada 4 Gated DeltaNet (atención lineal); codificador de visión |
| Parámetros totales | 26.895.998.464 (aproximadamente 27B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens (heredada del modelo base) |
| Tipos de cuantización | Q4_K_M (16,5 GB) y Q5_K_M (19,2 GB); proyector de visión en F16 (0,9 GB) |
| Idiomas soportados | Inglés únicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (pesos y proyector de visión separado `mmproj`) |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-27B es un transformer denso de 27B parámetros con 64 capas, de las cuales 3 de cada 4 emplean Gated DeltaNet, un mecanismo de atención lineal que reduce el coste computacional en contextos largos frente a la atención cuadrática estándar. Incluye además un codificador de visión que permite entrada de imágenes y texto, y una ventana de contexto de 262.000 tokens.

Krummholz aplicó sobre la parte lingüística del base un adaptador LoRA de rango 16, alpha 32 y dropout 0,05, entrenado primero de forma supervisada y después con entrenamiento por preferencias. El adaptador se fusionó en los pesos base y el resultado se convirtió a GGUF mediante llama.cpp. El entrenamiento y la evaluación se realizaron exclusivamente en inglés. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición del dataset. La innovación destacable no es arquitectónica sino de post-procesado: los cuatro guards en Python (consciencia, hechos territoriales, origen y divulgación de IA) que reescriben frases infractoras una vez por respuesta, operando solo sobre texto en inglés y respetando el texto citado.

## Capacidades

- Generación de texto conversacional de propósito general: preguntas, redacción, explicaciones y planificación.
- Lectura y razonamiento sobre documentos proporcionados por el usuario, aprovechando el contexto de 262.000 tokens.
- Respuesta sobre historia y actualidad, incluidos temas en los que el modelo base tiende a rechazar o a repetir una línea oficial.
- Exposición lado a lado de disputas territoriales con un criterio uniforme.
- Uso de herramientas (tool calling / function calling) en un runtime que las proporcione: calculadora para aritmética y fechas, búsqueda web y descarga de páginas para información cambiante. El modelo escribe las llamadas; una aplicación de chat simple no las ejecuta.
- Entrada de imágenes y texto, con salida de texto, mediante el proyector de visión del modelo base (no modificado ni evaluado por Krummholz).
- Capacidad multilingüe: no disponible; solo inglés.
- Modo de razonamiento (thinking): el modelo fue entrenado y evaluado con `enable_thinking` desactivado; se recomienda ejecutarlo con el razonamiento apagado (`--reasoning-budget 0`).

## Casos de uso

- Asistente conversacional de propósito general: atención a preguntas, redacción y explicaciones en inglés, con la ventana de 262.000 tokens permitiendo conversaciones multi-turno muy largas sin truncar el historial.
- Análisis de documentos extensos: carga de informes, contratos o libros completos en una sola pasada de contexto para resumen, extracción de datos y preguntas y respuestas sobre el contenido.
- Investigación de actualidad con herramientas: integrado en un runtime con búsqueda web y descarga de páginas, el modelo decide cuándo invocar la herramienta y sintetiza información que puede haber cambiado, reduciendo respuestas obsoletas.
- Cálculo y fechas asistidos: delegación en una calculadora vía tool calling para aritmética y cómputo de fechas, evitando errores aritméticos del propio modelo.
- Educación y divulgación histórica: explicaciones de historia y geopolítica, con presentación equilibrada de disputas territoriales cuando se ejecuta con los guards de Krummholz activos.
- Procesamiento de documentos con imágenes: extracción de información de capturas, diagramas o páginas escaneadas gracias al codificador de visión, útil en digitalización de archivos.
- Prototipado y evaluación de modelos: al ser una beta con pesos abiertos y licencia Apache 2.0, sirve para experimentar con despliegues locales en GGUF y comparar el comportamiento con y sin los guards del runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una sección de evaluación con columnas comparativas ("model alone" frente a runtime con guards), pero no se incluyen cifras numéricas en los datos proporcionados. El autor declara un objetivo de menos del 1 % de alucinación, explícitamente señalado como objetivo y no como resultado alcanzado, y afirma que el modelo por sí solo no cumple varias de las puertas de calidad internas de Krummholz.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16,5 GB para Q4_K_M y 19,2 GB para Q5_K_M, más unos pocos GB adicionales de memoria (GPU o RAM del sistema) para el contexto.
- Proyector de visión: 0,9 GB adicionales en F16, solo necesario para entrada de imágenes.
- GPU recomendadas: no especificadas por el autor. Por tamaño de pesos, Q4_K_M encaja en GPUs de 24 GB (RTX 3090, RTX 4090) y en aceleradores de datacenter (A100 40/80 GB, H100); Q5_K_M requiere holgura adicional para contexto largo.
- ¿Cabe en GPU de consumo? Q4_K_M sí en tarjetas de 24 GB, con margen limitado para contexto; en GPUs de 16 GB requeriría offloading parcial a RAM del sistema.
- Opciones de despliegue: llama.cpp (`llama-server`, con API compatible con OpenAI), LM Studio (manteniendo el archivo `mmproj` en la misma carpeta para visión), y descarga directa desde Hugging Face con `-hf`. El runtime de Krummholz (paquete `krummholz_llm`) añade los guards en Python.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Atlantic 27B v6 | ~27B densos | 262.000 | Inglés | Apache 2.0 | Beta; fine-tune LoRA de Qwen3.8-27B; guards solo en runtime propio |
| Qwen/Qwen3.8-27B (base) | ~27B densos | 262.000 | No disponible en la información | Apache 2.0 | Modelo base sin ajuste de Krummholz; incluye visión y atención híbrida Gated DeltaNet |
| Alternativas de ~27B con contexto largo | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación más directa y fiable es con su propio modelo base, Qwen3.8-27B, del que hereda arquitectura, contexto, visión y licencia; las diferencias se limitan al ajuste LoRA, la conversión a GGUF y los guards del runtime. No se dispone de información sobre otros modelos comparables de la misma categoría para establecer una comparativa con datos verificables.

## Limitaciones y advertencias

- Estado beta: el autor advierte que el modelo comete errores, incluidas respuestas incorrectas con seguridad, y que por sí solo no cumple varias de sus puertas de calidad internas.
- Riesgo de alucinación: el objetivo de menos del 1 % es una meta, no un resultado; debe verificarse cualquier dato relevante.
- Solo inglés: entrenamiento y evaluación exclusivamente en inglés; no se garantiza calidad en otros idiomas.
- Visión no evaluada: la entrada de imágenes usa la ruta de visión del modelo base, que Krummholz no modificó ni evaluó; no deben tomarse decisiones basadas en imágenes.
- Guards ausentes fuera del runtime propio: en llama.cpp o LM Studio no se aplican las reglas de consciencia, hechos territoriales, origen ni divulgación de IA, por lo que el comportamiento puede diferir del evaluado.
- Uso no apto para decisiones médicas, legales, financieras o de seguridad crítica sin revisión de un profesional cualificado.
- Tool calling dependiente del runtime: el modelo escribe las llamadas, pero una aplicación de chat simple no las ejecuta.
- Licencia Apache 2.0 permite uso comercial, pero la model card señala dos cuestiones abiertas sobre los datos de entrenamiento que conviene revisar antes de un despliegue en producción.
- El modelo debe ejecutarse con el modo de razonamiento desactivado (`enable_thinking` en false), tal como fue entrenado y evaluado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krummholz-ai/atlantic-27b-v6-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del runtime de Krummholz (guards en `krummholz_llm`): https://github.com/hayvenmjackson/krummholz-llms-alpha/tree/vl-pointcloud-v1/krummholz_llm
- Contacto del desarrollador: info@krummholz.ai
