# ndgold/Qwen3-1.7B-EasyLanguage-GGUF

## Resumen

El modelo `ndgold/Qwen3-1.7B-EasyLanguage-GGUF` es un fine-tune LoRA del modelo base [Qwen/Qwen3-1.7B](https://huggingface.co/Qwen/Qwen3-1.7B) que reescribe frases habladas en el registro de **lenguaje fácil** (Easy Language) del mismo idioma. No se trata de un modelo de traducción: dado francés, produce francés más sencillo; dado alemán, alemán más sencillo. Cubre estándares como FALC en francés, Leichte Sprache en alemán, Lectura Fácil en español y el estándar "Easy-to-Read" de Inclusion Europe en otros idiomas.

El modelo está desarrollado por ndgold para la aplicación Android de subtitulación en vivo [Live Linguist](https://github.com/ngoldbla/livelinguist-android), donde todo el procesamiento se ejecuta localmente en el dispositivo, sin servidor. Publicado en formato GGUF con cuantización Q5_K_M, ocupa 1,3 GB y está pensado para entornos con recursos limitados. La licencia es Apache-2.0, heredada del modelo base.

Su relevancia radica en que aborda la accesibilidad cognitiva mediante simplificación de texto en el mismo idioma, un problema distinto al de la traducción automática, y lo hace con un modelo lo suficientemente pequeño para ejecutarse en un teléfono móvil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-1.7B) con fine-tune LoRA |
| Parametros totales | 1.720.574.976 (1,7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el entrenamiento uso max sequence de 1024 tokens) |
| Tipos de cuantizacion | Q5_K_M (publicado); tambien evaluados Q4_K_M y bf16 |
| Idiomas soportados | Multiples idiomas (12 evaluados): frances, aleman, espanol y otros estandares de lenguaje facil; no se especifica la lista completa |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de 1.700 millones de parametros. Sobre el se aplico un fine-tune LoRA con rango 16, alpha 320 (escala 20,0 × rango), dropout 0,05, aplicado a las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj` de las 16 capas superiores unicamente. El entrenamiento se realizo con una secuencia maxima de 1024 tokens y una sola epoca, sobre el dataset `ndgold/live-linguist-easylanguage-sft`, en una GPU RTX 5060 Ti (sm_120).

La model card especifica un **contrato de prompt estricto**: el modelo fue entrenado con una unica plantilla que incluye un bloque de pensamiento vacio pre-rellenado (` thinking\n\n response\n\n`) y un modificador `/no_think` al final del system prompt. Desviarse de esta plantilla degrada la salida silenciosamente, sin errores visibles. Tampoco se admiten ejemplos few-shot ni contexto acumulado; el modelo fue entrenado para operar sobre el turno aislado `Original:/Rewritten:`.

## Capacidades

- Simplificacion de texto en el mismo idioma: reescribe frases habladas a un registro de lenguaje facil, eliminando disfluencias y dividiendo oraciones complejas.
- Soporte multilingue: evaluado en 12 idiomas, incluyendo frances (FALC), aleman (Leichte Sprache), espanol (Lectura Facil) y otros estandares Inclusion Europe.
- No traduce: la salida siempre esta en el mismo idioma que la entrada.
- Inferencia local en dispositivo: disenado para ejecutarse en telefonos moviles sin conexion a servidor.
- Compatible con llama.cpp: al estar en formato GGUF, puede ejecutarse con llama.cpp, Ollama, LM Studio y otras herramientas del ecosistema.
- No soporta tool calling, agentes, vision ni otras capacidades multimodales.

## Casos de uso

- Subtitulacion en vivo accesible: la aplicacion Live Linguist captura audio en tiempo real, genera subtitulos y los simplifica con este modelo para personas con dificultades de comprension lectora. El modelo funciona localmente, lo que evita latencia de red y problemas de privacidad.
- Accesibilidad web y documental: integracion en sistemas de lectura facil para adaptar noticias, avisos administrativos o contenido institucional a un registro comprensible para personas con discapacidad intelectual.
- Atencion al cliente inclusiva: en chatbots o sistemas de soporte, el modelo puede reformular respuestas automaticas a un lenguaje mas sencillo antes de mostrarlas al usuario final.
- Educacion y alfabetizacion: simplificacion de textos educativos o instrucciones para estudiantes con bajo nivel de lectura o hablantes no nativos.
- Asistentes de voz en el hogar: reformulacion de respuestas de asistentes por voz para entornos con ninos o personas mayores.
- Traduccion asistida por humanos: como paso posterior a una traduccion automatica, para generar versiones en lectura facil de documentos traducidos, manteniendo el idioma de destino.

## Benchmarks y rendimiento

La model card no publica benchmarks estandar (MMLU, HumanEval, GSM8K, etc.), sino una evaluacion propia con 20 prompts y un validador automatico que comprueba longitud de frase, una idea por oracion, contenido no inventado y mantenimiento del idioma de origen. Los resultados son:

| Artefacto | Tasa de validacion limpia | Diferencia vs baseline 97,23% |
|---|---:|---:|
| bf16 | 100,00% (20/20) | −2,77 pp ✅ |
| **Q5_K_M (publicado)** | **100,00% (20/20)** | **−2,77 pp ✅** |
| Q4_K_M | 85,00% (17/20) | +12,23 pp ❌ |

El autor advierte explicitamente que 20 prompts son una prueba de deteccion de fallos graves, no una medicion de calidad: el intervalo binomial en n=20 es de aproximadamente ±10 puntos porcentuales. Lo que si es solido es que Q4_K_M fallo la prueba, Q5_K_M igualo a bf16 en todo lo medido, y el coste extra de unos 150 MB elimina un riesgo que descansaria sobre veinte muestras.

## Requisitos de hardware

- Tamano del archivo: 1,3 GB en cuantizacion Q5_K_M.
- VRAM estimada para inferencia: aproximadamente 1,5-2 GB en GPU (dependiendo del contexto y del backend), o unos 1,5 GB de RAM en CPU pura.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.). En GPU integradas modernas tambien es viable.
- Dispositivos moviles: el autor lo disena para ejecutarse en un telefono Android dentro de la app Live Linguist, aunque no se han publicado mediciones de latencia en hardware real.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llamafile, o cualquier backend compatible con GGUF.
- Latencia y throughput: no disponibles. La model card indica que no existe medicion de latencia en hardware real para este modelo.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de simplificacion de lenguaje facil en la informacion proporcionada. La unica referencia es el baseline MLX mencionado en la model card, que obtuvo un 97,23% en la misma prueba de 20 prompts, sin especificar que modelo concreto es. Comparado con su modelo base Qwen3-1.7B:

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| Qwen3-1.7B (base) | 1,7B | No disponible | Apache-2.0 | safetensors | Generacion general |
| Qwen3-1.7B-EasyLanguage (este) | 1,7B | No disponible | Apache-2.0 | GGUF (Q5_K_M) | Simplificacion a lenguaje facil |
| Baseline MLX (no identificado) | No disponible | No disponible | No disponible | MLX | Simplificacion a lenguaje facil |

## Limitaciones y advertencias

- La evaluacion se basa en 20 prompts, una muestra demasiado pequena para establecer garantias de calidad. El propio autor lo califica como "una pantalla para detectar roturas graves, no un benchmark".
- La gramatica es imperfecta en modelos de este tamano. El autor cita un ejemplo real en frances: *"La semaine derniere, nous avons partis a la medina"* — el registro es correcto, pero la eleccion del auxiliar es erronea (`avons` en lugar de `sommes`).
- El texto simplificado es una parafrasis, no una transcripcion exacta. No debe utilizarse en contextos donde la redaccion exacta tenga implicaciones legales o medicas.
- El contrato de prompt es estricto: omitir el bloque de pensamiento vacio, el modificador `/no_think` o anadir ejemplos few-shot degrada la salida silenciosamente.
- No se han medido latencias en hardware real (telefono), por lo que el rendimiento en produccion movil no esta verificado.
- No hay soporte para tool calling, agentes, vision ni otras capacidades avanzadas; es exclusivamente un modelo de simplificacion de texto.
- La lista completa de los 12 idiomas soportados no esta publicada en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ndgold/Qwen3-1.7B-EasyLanguage-GGUF
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/ndgold/live-linguist-easylanguage-sft
- Repositorio de la aplicacion Live Linguist: https://github.com/ngoldbla/livelinguist-android
