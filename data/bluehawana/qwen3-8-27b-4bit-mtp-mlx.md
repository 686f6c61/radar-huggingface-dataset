# bluehawana/Qwen3.8-27B-4bit-MTP-MLX

## Resumen

Qwen3.8-27B-4bit-MTP-MLX es una conversión del modelo Qwen3.8-27B de Alibaba al formato MLX, optimizada para Apple Silicon, que incorpora el head nativo de multi-token prediction (MTP) del modelo original. El autor, bluehawana, ha tomado la cuantización 4-bit de mlx-community y le ha añadido los 15 tensores MTP que la conversión base omitía, lo que permite activar la decodificación especulativa en runtimes MLX compatibles (como oMLX con `mtp_enabled`). El resultado es una aceleración de la generación de entre 2,5 y 3 veces en flujos de un solo hilo, con una tasa de aceptación de borradores del 75–99 % en tráfico de código y agentes.

El modelo base Qwen3.8-27B es un LLM denso de 27.000 millones de parámetros, nativamente multimodal (visión y lenguaje), con una ventana de contexto de 262K tokens y razonamiento configurable. Esta conversión MLX, sin embargo, se centra en generación de texto puro y no incluye el encoder de visión. La licencia Apache-2.0 permite uso comercial sin restricciones. Es una opción relevante para desarrolladores que quieran ejecutar un modelo de gran capacidad en hardware local de Apple con rendimiento mejorado gracias a la decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8) con head MTP añadido |
| Parametros totales | 27B (modelo base) + head MTP (tensores adicionales, numero no especificado) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262K tokens (segun documentacion de Qwen3.8-27B) |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | No disponible (el modelo base soporta multiples idiomas, pero no se especifica en esta conversion) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con arquitectura multimodal (vision-language) desarrollado por el equipo Qwen de Alibaba. Incorpora un mecanismo de razonamiento configurable (thinking mode) con niveles de esfuerzo ajustables. La conversion MLX de mlx-community cuantiza los pesos a 4-bit para reducir el uso de memoria en Apple Silicon, pero elimina los pesos del head MTP, lo que desactiva silenciosamente la decodificacion especulativa nativa del modelo.

Esta version restaura el head MTP original, compuesto por 15 tensores mantenidos en bf16 para una mayor tasa de aceptacion de borradores. El head fue exportado por EigenLabs a partir del modelo oficial de Qwen y es bit-identico al original. El proceso de entrenamiento del modelo base no se detalla en la informacion disponible; se sabe que Qwen entrena con grandes volumenes de datos multilingues y multimodales, pero no se proporcionan cifras concretas de tokens ni detalles sobre el pipeline de alineacion (RLHF, DPO, etc.) para esta variante especifica.

## Capacidades

- Generacion de texto y razonamiento complejo, con modo de pensamiento configurable (razonamiento explicito opcional).
- Soporte de tool calling y function calling, habilitando integraciones con APIs y ejecucion de acciones.
- Capacidades de agente: puede ejecutar tareas de varios pasos y coordinar herramientas externas.
- Generacion de codigo de alta calidad, especialmente en lenguajes populares (Python, JavaScript, etc.).
- Multilingue: el modelo base soporta numerosos idiomas, aunque no se confirma el alcance en esta conversion.
- Decodificacion especulativa MTP: acelera la generacion autoregresiva en un 2,5–3x en flujos de un solo hilo.
- No incluye capacidades de vision en esta conversion (el encoder de imagen no esta presente).

## Casos de uso

- Asistente de codigo en local: un desarrollador puede ejecutar este modelo en un Mac con oMLX para obtener sugerencias de codigo con tool calling, integrado en un IDE o CLI, beneficiandose de la baja latencia gracias al MTP.
- Automatizacion de tareas de oficina: el modelo puede generar documentos, resumir correos o redactar informes, con la ventaja de ejecutarse en local sin enviar datos a la nube.
- Chatbot de atencion al cliente: con su contexto de 262K tokens, puede mantener conversaciones largas y recordar informacion de interacciones previas, aunque el despliegue en produccion requeriria gestionar la memoria.
- Agente de investigacion: capaz de buscar informacion, razonar sobre multiples fuentes y generar resumenes estructurados, usando tool calling para consultar APIs.
- Prototipado rapido de aplicaciones LLM: los desarrolladores pueden probar funcionalidades de agentes y tool use en un entorno local antes de escalar a la nube.
- Generacion de documentacion tecnica: a partir de especificaciones o codigo fuente, el modelo puede redactar guias y manuales con razonamiento estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento proporcionada es la velocidad de decodificacion en un M5 Max de 128 GB: 61,6 tokens por segundo con oMLX y MTP habilitado, frente a una generacion autoregresiva estandar sin el head. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks para esta conversion especifica.

## Requisitos de hardware

- Dispositivos Apple Silicon (M1, M2, M3, M4, M5) con al menos 16–20 GB de RAM unificada para cargar el modelo en 4-bit (tamano del repo: 16,9 GB).
- GPU integrada en el chip Apple Silicon; no requiere GPU discreta.
- Se recomienda un Mac con 32 GB o mas de RAM unificada para dejar margen al runtime y al head MTP en bf16.
- Despliegue con oMLX (soporte nativo de MTP), mlx-lm (linea de desarrollo PR 990) u otros runtimes MLX.
- La decodificacion MTP es de un solo flujo; en cargas concurrentes el runtime vuelve a decodificacion por lotes estandar.
- Latencia estimada: 61,6 tok/s en un M5 Max 128 GB con un solo stream; en hardware inferior la velocidad sera proporcionalmente menor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-4bit-MTP-MLX (este) | 27B + MTP | 262K | 4-bit MLX | Apache-2.0 | Safetensors |
| mlx-community/Qwen3.8-27B-4bit | 27B | 262K | 4-bit MLX | Apache-2.0 | Safetensors |
| mlx-community/Qwen3.8-27B-MTP-4bit | 27B + MTP | 262K | 4-bit MLX | Apache-2.0 | Safetensors |

La diferencia principal entre este modelo y la conversion de mlx-community sin MTP es la presencia del head MTP, que permite decodificacion especulativa. La variante `mlx-community/Qwen3.8-27B-MTP-4bit` existe como alternativa oficial de la comunidad, pero esta version de bluehawana se distingue por mantener el head en bf16 y por su integracion documentada con oMLX. No hay datos comparativos de rendimiento entre ambas.

## Limitaciones y advertencias

- Esta conversion no incluye el encoder de vision del modelo base; no puede procesar imagenes.
- La decodificacion MTP solo funciona en flujos de un solo hilo; con peticiones concurrentes se pierde la aceleracion.
- El head MTP en bf16 aumenta el uso de memoria respecto a una cuantizacion 4-bit pura.
- El modelo base puede presentar sesgos y alucinaciones, como cualquier LLM; no se ha realizado una evaluacion especifica de seguridad para esta conversion.
- La informacion sobre idiomas soportados y benchmarks de calidad no esta disponible; se recomienda validar el rendimiento en el caso de uso concreto.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo base puede tener restricciones adicionales en ciertos paises o usos regulados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bluehawana/Qwen3.8-27B-4bit-MTP-MLX
- Modelo base cuantizado: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Variante MTP de mlx-community: https://huggingface.co/mlx-community/Qwen3.8-27B-MTP-4bit
- Head MTP en bf16: https://huggingface.co/EigenLabs/Qwen3.8-27B-MTP-bf16
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentacion del metodo MTP: https://huggingface.co/datasets/bluehawana/qwen3.8-27b-apple-silicon-concurrency/blob/main/MTP.md
- Codigo de referencia: https://github.com/bluehawana/Qwen3.827B-SGLang-mpbm5max/blob/mtp-speculative-decoding/mtp/README.md
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Pagina en LLM Explorer: https://llm-explorer.com/model/mlx-community%2FQwen3.8-27B-MTP-4bit,13dEJX4iWuVDHLrG9kNDz2
