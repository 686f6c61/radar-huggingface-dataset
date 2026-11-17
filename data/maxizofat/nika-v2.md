# MaxIzofat/Nika-v2

## Resumen

Nika-v2 es un modelo de lenguaje de 0,6 mil millones de parámetros derivado de Qwen3-0.6B, publicado por el usuario MaxIzofat en Hugging Face. No se trata de un modelo conversacional de propósito general, sino de un parser de comandos de voz especializado: recibe una frase dictada en ruso o inglés por el usuario y devuelve un objeto JSON compacto con la intención detectada y los argumentos de la orden. Está diseñado para ejecutarse íntegramente en un teléfono Android sin conexión a internet, dentro del asistente de voz Nika.

El modelo se ha obtenido mediante un ajuste fino con LoRA sobre Qwen3-0.6B, con posterior fusión de los pesos y cuantización a Q4_K_M en formato GGUF para su uso con llama.cpp. El entrenamiento se realizó con frases sintéticas generadas por script, sin datos personales. El repositorio ocupa 0,4 GB y la model card indica explícitamente que no es un modelo de chat.

Su relevancia radica en el patrón de despliegue: un modelo minúsculo, cuantizado a 4 bits y restringido mediante gramática en llama.cpp para forzar una salida JSON válida, lo que permite inferencia local de baja latencia en hardware móvil. Es un ejemplo de especialización extrema de un modelo base pequeño para una única tarea estructurada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); pesos base en safetensors |
| Idiomas soportados | ruso (ru), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) y safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only de la familia Qwen3. Sobre esa base se aplicó un ajuste fino con LoRA, cuyos adaptadores se fusionaron posteriormente con los pesos originales; el resultado se cuantizó a Q4_K_M en formato GGUF. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de alineación como RLHF o DPO.

El dato diferencial es la naturaleza del corpus: frases sintéticas generadas automáticamente por un script, sin datos personales, orientadas a la extracción de intenciones y argumentos. El prompt de inferencia emplea la plantilla de chat de Qwen (`<|im_start|>` / `<|im_end|>`) con un mensaje de sistema que instruye a convertir la orden en JSON, e incluye un bloque `<think>` vacío para forzar la salida directa sin razonamiento intermedio. La generación se restringe mediante una gramática en llama.cpp que garantiza que la salida cumpla el esquema JSON esperado. El archivo `model.json` del repositorio acompaña al modelo con metadatos de versión, tamaño, hash SHA-256 y umbral de confianza para la aplicación.

## Capacidades

- Conversión de comandos de voz en lenguaje natural (ruso e inglés) a JSON estructurado con intención y argumentos, por ejemplo `{"intent":"call","who":"Олегу"}`.
- Extracción de intenciones y entidades a partir de frases coloquiales dictadas por el usuario.
- Salida JSON forzada mediante gramática en llama.cpp, lo que evita respuestas fuera de esquema.
- Inferencia totalmente offline en dispositivo móvil.
- Soporte bilingüe ruso-inglés.
- No es un modelo de chat: no está pensado para diálogo abierto, razonamiento general, código ni matemáticas.
- No se documenta soporte de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistente de voz en Android: el modelo recibe la transcripción de la orden y devuelve el JSON que la aplicación interpreta para ejecutar la acción, todo en local y sin conexión.
- Control por voz de funciones del teléfono: llamadas, mensajes o apertura de aplicaciones, mapeando la frase del usuario a una intención concreta con sus parámetros.
- Procesamiento de lenguaje natural en el borde (edge computing): al ocupar 0,4 GB y ejecutarse con llama.cpp, encaja en dispositivos con recursos limitados donde no es viable un modelo mayor.
- Extracción de intenciones en pipelines de voz a texto a comando: la salida JSON validada por gramática simplifica la integración con el resto del sistema.
- Prototipado de asistentes de voz multilingües ruso-inglés con un coste computacional mínimo.
- Filtrado y normalización de comandos antes de enviarlos a un backend, usando el umbral de confianza de `model.json` para descartar entradas ambiguas.
- Investigación sobre ajuste fino de modelos pequeños para tareas estructuradas: sirve como referencia de LoRA más cuantización Q4_K_M sobre Qwen3-0.6B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con la cuantización Q4_K_M (repositorio de 0,4 GB); los pesos safetensors completos rondan 1,2 GB en fp16.
- GPU recomendadas: no requiere GPU dedicada; está pensado para CPU móvil. En escritorio puede ejecutarse en cualquier CPU moderna.
- Cabe en GPU de consumo: sí, en cualquier GPU con más de 1 GB de memoria, incluidas integradas.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), con gramática para forzar la salida JSON; compatible con endpoints según los tags del repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Nika-v2 | 596 M | no disponible | ru, en | Apache 2.0 | GGUF, safetensors |
| Qwen/Qwen3-0.6B (base) | 0,6 B | no disponible | multilingüe | Apache 2.0 | safetensors |
| Otros parsers de comandos especializados | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más pertinente es con su modelo base Qwen3-0.6B: Nika-v2 hereda su arquitectura y licencia, pero sustituye la capacidad conversacional general por una especialización cerrada en extracción de comandos a JSON, con un tamaño de repositorio reducido por la cuantización. No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas.

## Limitaciones y advertencias

- No es un modelo de chat ni de propósito general: usarlo fuera de la tarea de parsing de comandos producirá resultados pobres.
- Entrenado únicamente con frases sintéticas, lo que puede provocar un ajuste deficiente ante variaciones reales del habla, dialectos o ruido de transcripción.
- Riesgo de alucinación en la extracción de entidades: puede inventar argumentos o intenciones no presentes en la frase.
- Cobertura limitada a ruso e inglés; no se documenta soporte de otros idiomas.
- La longitud de contexto no está especificada, lo que dificulta planificar entradas largas.
- El rendimiento depende de la gramática y del umbral de confianza definidos en la aplicación; sin ellos, la salida JSON no está garantizada.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo está diseñado para un asistente concreto (Nika) y no se documentan garantías de calidad en otros dominios.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MaxIzofat/Nika-v2
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- llama.cpp: https://github.com/ggml-org/llama.cpp
