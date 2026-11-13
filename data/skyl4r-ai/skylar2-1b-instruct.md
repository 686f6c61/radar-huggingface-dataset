# Skyl4r-Ai/Skylar2-1B-Instruct

## Resumen

Skylar2-1B-Instruct es un modelo de lenguaje de 1.026.782.232 parámetros (~1,03B) desarrollado por Skyl4r-Ai, entrenado desde cero (from-scratch) y publicado con licencia Apache 2.0. No es un modelo de propósito general ni busca competir en el estado del arte: la propia model card lo describe como un modelo pequeño y en desarrollo, orientado específicamente a generación aumentada por recuperación (RAG), generación fundamentada en documentos, tool calling, uso como agente y contexto largo. Su foco lingüístico principal es el italiano, con soporte adicional de inglés y código, incluyendo generación de COBOL.

La arquitectura es de tipo transformer, con 1.026.782.232 parámetros totales según los pesos en safetensors. Declara una longitud de contexto de 128K tokens, ampliable a 256K mediante YaRN con factor ×2, y un preentrenamiento de aproximadamente 176.000 millones de tokens. El modelo se distribuye con su propia librería de inferencia, `skylar` (versión >= 0.7.11), que expone un servidor compatible con la API de OpenAI y con la API de Messages de Anthropic, ejecutable tanto en GPU como en CPU.

Su relevancia actual reside en la combinación de tamaño reducido, contexto muy largo y soporte nativo de tool calling, salida JSON con esquema fijo y generación fundamentada con instrucciones de abstención. Esto lo hace interesante para despliegues con recursos limitados en los que se prioriza el control de la salida y la integración con pipelines de agentes sobre el rendimiento bruto en benchmarks generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (según model card; detalles internos no disponibles) |
| Parametros totales | 1.026.782.232 (~1,03B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens (256K con YaRN ×2) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en), italiano (it), código (incluye COBOL) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un transformer entrenado desde cero, con aproximadamente 176.000 millones de tokens de preentrenamiento. La model card no detalla la composición del dataset, la proporción de tokens por idioma ni si se aplicaron fases de alineación como RLHF o DPO; estos datos figuran como no disponibles. El modelo está diseñado con soporte explícito para contexto largo (128K, ampliable a 256K con YaRN ×2), lo que condiciona tanto el preentrenamiento como las estrategias de posicionamiento (RoPE con escalado YaRN).

Entre las capacidades técnicas destacadas por el autor figuran la generación fundamentada sobre documentos delimitados con etiquetas `<document>`, con instrucciones para declarar la ausencia de respuesta cuando el dato no está en el documento; el tool calling con esquemas de función; la salida estructurada garantizada mediante `response_format` con JSON Schema; y una gramática específica para COBOL. El servidor de la librería `skylar` implementa las APIs de OpenAI y Anthropic, lo que facilita la integración con clientes existentes sin adaptadores adicionales.

## Capacidades

- Generación de texto en italiano e inglés, con foco declarado en italiano.
- Generación fundamentada (grounded generation): responde usando únicamente el contenido de un documento delimitado y declara explícitamente cuando la respuesta no está presente.
- Tool calling / function calling con esquemas de parámetros en formato JSON.
- Salida JSON con esquema fijo garantizado por el servidor mediante `response_format` y JSON Schema.
- Capacidad de agente con razonamiento multi-paso: el modelo solicita la llamada, el código del usuario la ejecuta y el resultado se devuelve al modelo para continuar la conversación.
- Contexto largo de 128K tokens, ampliable a 256K con YaRN ×2, adecuado para documentos extensos y conversaciones multi-turno.
- Generación de código, con soporte específico de COBOL.
- Estilo controlado: reescritura de texto con instrucciones de tono (por ejemplo, reformulación cortés).
- Extracción de datos estructurados desde texto no estructurado (por ejemplo, correos electrónicos) hacia JSON validado contra esquema.

## Casos de uso

- Atención al cliente automatizada en italiano: el modelo gestiona conversaciones multi-turno con contexto largo y puede consultar el estado de un pedido mediante tool calling, integrando la respuesta del backend en la misma conversación, como muestra el ejemplo de `get_order_status`.
- Asistente documental con RAG: dado un contrato o cláusula delimitada con `<document>`, responde preguntas concretas (por ejemplo, plazos de preaviso) y declara la ausencia de respuesta cuando el dato no figura en el texto, lo que reduce el riesgo de respuestas inventadas en dominios regulados.
- Extracción de datos estructurados: procesamiento de correos, pedidos o formularios para producir JSON validado contra un esquema fijo (cliente, producto, cantidad, fecha, dirección, email), apto para ingesta automática en sistemas de gestión.
- Agentes de automatización de flujos: el modelo emite llamadas a funciones que el orquestador ejecuta y devuelve, permitiendo cadenas de varios pasos sobre APIs internas con validación de argumentos.
- Modernización de sistemas legados: generación y explicación de programas COBOL, útil en equipos que mantienen código mainframe y necesitan documentación o borradores de programas a partir de especificaciones en lenguaje natural.
- Reescritura y ajuste de tono en comunicaciones corporativas: transformación de mensajes internos en versiones más formales o corteses, con temperatura 0 para resultados deterministas.
- Procesamiento de documentos largos en italiano: gracias a la ventana de 128K (256K con YaRN), puede abordar contratos, informes o expedientes completos sin fragmentación agresiva, manteniendo la referencia al documento fuente.

## Benchmarks y rendimiento

La model card menciona una comparación gráfica frente a Qwen3-0.6B, Gemma 3 1B IT, LFM2.5-1.2B-Instruct, Llama 3.2 1B Instruct, Emma-6 y Minerva-7B-instruct-v1.0, pero los valores numéricos no están incluidos en la información proporcionada.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (no publicada por el autor), un modelo de ~1,03B parámetros en FP16 requiere aproximadamente 2 GB solo para pesos, y en cuantizaciones de 8 y 4 bits alrededor de 1 GB y 0,6 GB respectivamente, a lo que hay que sumar la caché KV, que con contexto de 128K puede ser el factor dominante.
- GPU recomendadas: no disponible. El autor indica que el servidor `skylar` funciona en GPU o en CPU, sin especificar modelos concretos.
- Viabilidad en GPU de consumo: no confirmada por el autor; por tamaño de parámetros, el modelo es candidato a ejecutarse en GPUs de consumo, pero la caché KV para contextos de 128K exige planificación de memoria.
- Opciones de despliegue: servidor propio de la librería `skylar` (`pip install "skylar[serve,grammar]>=0.7.11"` y `skylar serve --model Skyl4r-Ai/Skylar2-1B-Instruct`), con API compatible con OpenAI y Anthropic en `http://127.0.0.1:8000`. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La model card cita como referencias Qwen3-0.6B, Gemma 3 1B IT, LFM2.5-1.2B-Instruct, Llama 3.2 1B Instruct, Emma-6 y Minerva-7B-instruct-v1.0, pero no aporta sus especificaciones ni resultados numéricos en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| Skylar2-1B-Instruct | ~1,03B | 128K (256K con YaRN ×2) | Apache 2.0 | No disponible |
| Qwen3-0.6B | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | Citado como referencia, sin cifras |
| Gemma 3 1B IT | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | Citado como referencia, sin cifras |
| Llama 3.2 1B Instruct | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | Citado como referencia, sin cifras |

## Limitaciones y advertencias

- El propio autor advierte de que no es un modelo de propósito general ni SOTA, sino un modelo pequeño, construido desde cero y todavía en desarrollo: no cabe esperar que acierte en todo.
- Riesgo de alucinación inherente a un modelo de ~1B parámetros; el modo fundamentado con `<document>` y las instrucciones de abstención mitigan pero no eliminan este riesgo.
- Sesgos conocidos: no documentados en la información disponible; la composición del dataset de entrenamiento tampoco se detalla, lo que impide evaluar sesgos por idioma o dominio.
- Cobertura lingüística limitada a inglés, italiano y código; no se declara soporte de otras lenguas, incluido el español.
- La ventana de 256K depende de YaRN ×2 y puede degradar la calidad en contextos muy largos; no hay evaluaciones publicadas al respecto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye con una librería de inferencia propia (`skylar`) cuyo ecosistema de herramientas y cuantizaciones es más reducido que el de otros runtimes; la compatibilidad con vLLM, llama.cpp u Ollama no está confirmada.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado y actualizado el mismo día (13 de noviembre de 2026): no existe validación comunitaria ni historial de uso en producción.
- El repositorio ocupa 6,2 GB, un tamaño elevado para 1,03B parámetros, probablemente por incluir pesos en varios formatos o precisión; conviene revisar los archivos antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Skyl4r-Ai/Skylar2-1B-Instruct
- Organización del autor: https://huggingface.co/Skyl4r-Ai
- Librería de inferencia `skylar` (instalación vía pip, `skylar[serve,grammar]>=0.7.11`): repositorio no disponible en la información proporcionada
- Paper, blog o demo: no disponibles en la información proporcionada
