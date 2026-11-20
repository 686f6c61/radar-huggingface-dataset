# SoAIHQ/gemma-4-12B-it-GGUF

## Resumen

SoAIHQ/gemma-4-12B-it-GGUF es una compilación en formato GGUF del modelo google/gemma-4-12B-it, publicada por SoAI para su uso con llama.cpp y con el propio runtime de SoAI. El modelo base es un transformer denso de Google con 11.907.350.576 parámetros (aproximadamente 12B), que incorpora entrada de imagen mediante un codificador visual unificado y una ventana de contexto de 262.144 tokens (256K). Se distribuye bajo licencia Apache 2.0.

La relevancia de esta ficha concreta radica en la cuantización: SoAI publica únicamente dos variantes, Q4_K_M (7,4 GB) y Q8_0 (12,7 GB), y no ofrece cuantizaciones por debajo de 4 bits. La Q4_K_M se genera con una importance matrix (imatrix) calculada sobre un corpus propio de chat multi-turno, edición de código, llamadas a herramientas y matemáticas paso a paso, lo que la diferencia de las cuantizaciones genéricas calibradas con texto web.

El paquete incluye además un fichero mmproj en BF16 (175,1 MB) necesario para la entrada de imagen. El modelo soporta razonamiento configurable por petición (thinking mode) y tool calling nativo, lo que lo sitúa como una opción de tamaño medio para despliegues locales con capacidades multimodales y de agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con codificador de imagen unificado |
| Parametros totales | 11.907.350.576 (aprox. 12B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q4_K_M (7,4 GB), Q8_0 (12,7 GB); sin cuantizaciones por debajo de 4 bits |
| Idiomas soportados | 35+ idiomas (preentrenado en 140+) |
| Licencia | Apache 2.0 (enlace a licencia Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp), más mmproj BF16 para visión |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de aproximadamente 12B parámetros con un codificador de imagen unificado que permite entrada multimodal de imágenes dentro del mismo pipeline any-to-any. La ventana de contexto alcanza los 262.144 tokens. El razonamiento es configurable por petición: se activa o desactiva el modo thinking mediante `chat_template_kwargs` en la API compatible con OpenAI de llama-server.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible (composición del dataset, número de tokens, uso de RLHF/DPO). Lo que sí se detalla es el proceso de cuantización de esta compilación: la Q4_K_M se calibra con una imatrix calculada por SoAI sobre un corpus propio formateado con la plantilla de chat del modelo, incluyendo sintaxis nativa de tool calls, conversaciones multi-turno en 21 idiomas, ediciones de código en 22 lenguajes de programación, resultados de herramientas, matemáticas paso a paso y prosa web. La Q8_0 no usa imatrix porque el formato Q8_0 de llama.cpp no lo admite. Antes de publicar, el build verifica que los marcadores de chat, thinking y tool calls se almacenen como tokens especiales y que la plantilla embebida coincida con la original; si la conversión los importa como texto plano, el proceso se detiene.

## Capacidades

- Generación de texto y razonamiento con modo thinking configurable por petición.
- Entrada de imágenes (requiere cargar el fichero `mmproj-gemma-4-12B-it-bf16.gguf` con `--mmproj`).
- Tool calling / function calling con sintaxis nativa incluida en la plantilla de chat.
- Capacidades multilingües: 35+ idiomas soportados, preentrenado en 140+.
- Contexto largo de hasta 256K tokens para conversaciones y documentos extensos.
- Sin soporte de audio fiable en llama.cpp hasta v0.5.0, pese a que el mmproj incluye el codificador de audio; para voz se remite a Gemma 4 E2B y E4B.
- Pipeline declarado como any-to-any, aunque en la práctica la modalidad adicional operativa es imagen.

## Casos de uso

- Atención al cliente automatizada: con 256K tokens de contexto se pueden mantener conversaciones multi-turno largas con historial completo e imágenes adjuntas del cliente (capturas, productos), sin truncar el hilo.
- Análisis de documentos extensos con imágenes: informes, contratos o manuales con figuras, procesados en una sola ventana de contexto gracias a los 262.144 tokens y al codificador visual.
- Generación y edición de código en producción: el tool calling nativo y la calibración de la imatrix sobre 22 lenguajes de programación lo hacen adecuado para integrarse en pipelines que invocan herramientas (linters, tests, APIs) dentro de un bucle de agente.
- Asistentes de razonamiento paso a paso: el modo thinking configurable por petición permite activar cadena de razonamiento en tareas de matemáticas o análisis y desactivarla en respuestas rápidas de bajo coste.
- Despliegue local en estación de trabajo: la variante Q4_K_M (7,4 GB) permite ejecutar el modelo en máquinas de consumo con llama.cpp, útil para prototipado sin depender de la nube.
- Agentes multi-paso con herramientas: la combinación de contexto largo, tool calling y plantilla nativa facilita orquestaciones que encadenan varias llamadas a herramientas conservando el estado.
- Procesamiento multilingüe: atención y generación en 35+ idiomas para equipos que operan en varios mercados con un único modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: Q4_K_M requiere al menos 7,4 GB solo para los pesos, más memoria adicional para el contexto, que crece con la longitud configurada. Q8_0 requiere 12,7 GB para los pesos más el contexto.
- Para entrada de imagen hay que sumar el mmproj BF16 (175,1 MB).
- GPU recomendadas: no se especifican modelos concretos en la documentación. Por tamaño, Q4_K_M es viable en GPUs de consumo con 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070), y Q8_0 requiere GPUs de 16 GB o superiores (RTX 4080, RTX 4090) o profesionales tipo A100/H100 si se busca contexto largo.
- llama.cpp puede repartir capas entre GPU y CPU, lo que permite ejecutar Q4_K_M en equipos con VRAM limitada a costa de latencia.
- Opciones de despliegue: llama.cpp (llama-server, con UI de chat y API compatible con OpenAI), runtime de SoAI. No se mencionan vLLM, TGI ni Ollama en la documentación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| SoAIHQ/gemma-4-12B-it-GGUF (esta ficha) | ~12B | 256K | Texto + imagen | Apache 2.0 | GGUF |
| google/gemma-4-12B-it (base) | ~12B | 256K | Texto + imagen | Apache 2.0 | safetensors |
| SoAIHQ/gemma-4-E2B-it-GGUF | no disponible | no disponible | Texto + imagen + audio | Apache 2.0 | GGUF |
| SoAIHQ/gemma-4-E4B-it-GGUF | no disponible | no disponible | Texto + imagen + audio | Apache 2.0 | GGUF |

Las variantes E2B y E4B de la familia Gemma 4 se citan en la model card como las indicadas para transcripción de voz, capacidad que esta compilación de 12B no cubre de forma fiable en llama.cpp hasta v0.5.0. No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con alternativas.

## Limitaciones y advertencias

- El soporte de audio no es fiable en llama.cpp hasta la versión v0.5.0, aunque el mmproj incluya el codificador de audio; para voz hay que recurrir a otros modelos de la familia.
- No se publican cuantizaciones por debajo de 4 bits, lo que limita el despliegue en hardware con menos de 8 GB de VRAM.
- El contexto efectivo depende de la memoria disponible: configurar 256K tokens exige RAM/VRAM proporcional y puede degradar el rendimiento.
- La calidad de la cuantización Q4_K_M depende del corpus de calibración de SoAI; no se han publicado métricas que cuantifiquen la pérdida respecto a los pesos originales.
- No se han publicado evaluaciones de sesgos, alucinación ni robustez para esta compilación ni para el modelo base en la información disponible.
- La licencia declarada es Apache 2.0, pero el enlace apunta a la licencia específica de Gemma 4 de Google; conviene revisar los términos de uso comercial de dicha licencia antes de producción.
- El modelo base es de Google y esta compilación es una cuantización de terceros (SoAI); la responsabilidad sobre posibles regresiones de conversión recae en el publicador de la cuantización.
- Idiomas: se declaran 35+ soportados, pero no se detalla el rendimiento por idioma ni se garantiza paridad con el modelo original tras la cuantización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SoAIHQ/gemma-4-12B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Variante Gemma 4 E2B (GGUF): https://huggingface.co/SoAIHQ/gemma-4-E2B-it-GGUF
- Variante Gemma 4 E4B (GGUF): https://huggingface.co/SoAIHQ/gemma-4-E4B-it-GGUF
- Sitio del publicador: https://soai.to
