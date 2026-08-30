# romainkh14/RWKV-7-G1a-0.4B_BRIK

## Resumen

RWKV-7 G1a 0.4B es un modelo de lenguaje recurrente desarrollado por BlinkDL (bajo el proyecto RWKV, auspiciado por LF AI & Data Foundation) y convertido por Romain Khanoyan al formato **BRIK**, un contenedor autocontenido con pesos pre-cuantizados en int4 diseñado para ejecución **dentro del navegador** mediante WebGPU. Esta conversión elimina la necesidad de un servidor de inferencia: el modelo se descarga por HTTP Range, se cachea en el navegador y puede funcionar offline. La licencia Apache-2.0 de los pesos lo convierte en la opción más permisiva del catálogo Brimkern, pensada para uso comercial sin restricciones.

El modelo base tiene 450 millones de parámetros, 24 bloques y una dimensión oculta de 1024, con un vocabulario de 65 536 tokens (tokenizer RWKV World). Su arquitectura recurrente mantiene un estado de tamaño fijo (~1 MB) en lugar de una caché KV que crece con la conversación, lo que lo hace especialmente adecuado para contextos largos en dispositivos con recursos limitados. La versión BRIK está disponible en inglés y francés, y se distribuye como un único archivo de 304 MB.

La relevancia de este modelo radica en su capacidad para ejecutar inferencia de lenguaje completamente en el cliente, sin coste por token ni límite de velocidad, con un rendimiento medido de 33-36 tokens por segundo en un portátil Apple Silicon. Es una alternativa práctica para integrar asistentes conversacionales o widgets de preguntas-respuestas en sitios web sin depender de infraestructura de servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recurrente (RWKV-7 G1a), 24 bloques, d=1024 |
| Parametros totales | 450 M (0.45 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base original usa 4096, no confirmado en la conversion) |
| Tipos de cuantizacion | int4 (pre-cuantizado en el layout que leen los kernels, sin dequantizacion en carga) |
| Idiomas soportados | Ingles, frances |
| Licencia | Apache-2.0 (pesos), MIT (motor Brimkern) |
| Formato de pesos | BRIK (.brik), contenedor autocontenido con tokenizer embebido |

## Arquitectura y entrenamiento

RWKV-7 G1a es un modelo recurrente puro, sin atencion cuadratica. En lugar de una caché KV que crece con el numero de tokens, mantiene un estado de tamaño fijo (~1 MB) que se actualiza en cada paso, lo que permite procesar conversaciones largas con memoria constante. El modelo base fue entrenado por el proyecto RWKV con datos en ingles (y posiblemente otros idiomas, aunque la conversion BRIK declara solo en y fr), con un tokenizer World de 65 536 entradas. No se proporcionan detalles sobre el volumen de tokens de entrenamiento ni sobre tecnicas de alineacion como RLHF o DPO en la informacion disponible.

La conversion a BRIK no modifica los pesos, sino que los reorganiza en un formato pre-cuantizado int4 que los kernels WebGPU (escritos en WGSL) leen directamente, evitando la dequantizacion en tiempo de carga. El contenedor BRIK incluye arquitectura, configuracion y tokenizer dentro del propio archivo, y cada capa ocupa un rango HTTP contiguo, lo que permite carga parcial, reanudacion tras una caida y funcionamiento offline posterior.

## Capacidades

- Generacion de texto autoregresiva con arquitectura recurrente, adecuada para chat y asistentes conversacionales.
- Soporte de preguntas-respuesta sobre documentos (widget RAG) en ingles y frances, con un rendimiento medido de 10/12 en un test de Q&A documental.
- Ejecucion completamente en el navegador via WebGPU, sin envio de datos a servidor: el prompt y la generacion permanecen en el dispositivo.
- Reutilizacion offline tras la primera descarga gracias al cache del navegador.
- Integracion en sitios web mediante SDK de Brimkern (`Brimkern.embed`), sin coste por token ni limites de velocidad.
- No se mencionan capacidades de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- **Asistentes conversacionales en sitios web**: el modelo puede gestionar conversaciones multi-turno directamente en el navegador del visitante, sin servidor de inferencia, gracias a su estado recurrente de tamaño fijo que no crece con la conversacion. Es adecuado para widgets de soporte o FAQ.
- **Preguntas-respuesta sobre documentos (RAG)**: el widget de Brimkern permite adjuntar documentos y hacer preguntas sobre ellos en ingles y frances. El modelo mantiene el contexto de la conversacion y responde con referencias al contenido, como demuestra el test `sdk-rag.mjs` con 10/12 aciertos.
- **Aplicaciones on-device con privacidad estricta**: al no enviar datos a ningun servidor, es util para entornos donde la confidencialidad es critica (sector sanitario, legal o financiero) o para usuarios que no desean que sus conversaciones salgan del dispositivo.
- **Prototipos y demos interactivas**: su tamaño reducido (304 MB) y su carga progresiva por rangos HTTP permiten integrarlo en paginas de demostracion o documentacion tecnica sin infraestructura adicional.
- **Educacion y formacion**: puede servir como asistente de estudio o practica de idiomas (ingles y frances) en el navegador, con respuestas generadas localmente y sin conexion tras la primera carga.
- **Chatbots de comercio electronico**: integrado en una tienda online, puede responder preguntas frecuentes sobre productos, envios o devoluciones, manteniendo el contexto de la conversacion y reduciendo la carga del servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card proporciona mediciones propias del despliegue en navegador:

| Metrica | Valor |
|---|---|
| Velocidad de decodificacion (Chrome, Apple Silicon) | 33-36 tok/s |
| Carga en frio (perfil nuevo, 304 MB) | 286 s hasta listo; luego instantaneo desde cache |
| Widget Q&A documental (EN + FR) | 10/12 aciertos |
| Fallos del widget Q&A | 2 (misma caso en ambos idiomas: lectura de una fila de tabla, 26.0/26.5 cm vs 27.0) |

En comparacion con el modelo LFM2.5-230M (tambien en formato BRIK, 149 MB, licencia LFM 1.0), que obtiene 12/12 en el mismo test, la opcion Apache-2.0 de RWKV-7 cuesta el doble de descarga y pierde capacidad de lectura de tablas, a cambio de una licencia mas permisiva.

## Requisitos de hardware

- **GPU**: requiere un dispositivo con soporte WebGPU (navegadores Chrome, Edge, Firefox, Safari en versiones recientes). No se especifican requisitos de VRAM, pero el modelo ocupa 304 MB en disco y el estado recurrente es de ~1 MB; es viable en GPUs integradas de portatiles modernos.
- **CPU**: no aplica para inferencia principal (se ejecuta en GPU), aunque la carga inicial y el tokenizado pueden usar CPU.
- **RAM**: no especificada, pero al ser un modelo de 0.45 B cuantizado a int4, el uso de memoria es bajo (menos de 1 GB).
- **Opciones de despliegue**: exclusivamente en navegador via WebGPU, usando el motor Brimkern (SDK de JavaScript). No se mencionan despliegues con vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput**: decodificacion de 33-36 tok/s en un portatil Apple Silicon con Chrome; la carga inicial puede tardar 286 s en una conexion fria, pero luego es instantanea desde cache.

## Comparativa con modelos similares

La comparativa se centra en alternativas del mismo catalogo Brimkern, dado que el modelo esta disenado para ejecucion en navegador.

| Modelo | Parametros | Formato | Licencia | Tamanio archivo | Rendimiento Q&A (widget) |
|---|---|---|---|---|---|
| RWKV-7 G1a 0.4B (BRIK) | 450 M | BRIK (int4) | Apache-2.0 | 304 MB | 10/12 |
| LFM2.5-230M (BRIK) | 230 M | BRIK (int4) | LFM 1.0 | 149 MB | 12/12 |

No hay informacion sobre otros modelos comparables fuera del catalogo Brimkern en los datos proporcionados.

## Limitaciones y advertencias

- **Idiomas limitados**: solo ingles y frances; no soporta espanol ni otros idiomas de forma declarada.
- **Fallo en lectura de tablas**: el test de Q&A documental muestra errores al leer filas especificas de tablas (por ejemplo, confundir 26.0/26.5 cm con 27.0), lo que puede afectar a casos de uso con datos tabulares.
- **Tamano reducido**: con 450 M de parametros, su capacidad de razonamiento complejo, matematicas avanzadas o generacion de codigo es limitada en comparacion con modelos de mayor escala.
- **Contexto no confirmado**: la longitud de contexto no se especifica en la model card; si el modelo base original usa 4096 tokens, podria ser insuficiente para documentos muy largos.
- **Dependencia de WebGPU**: requiere navegadores con soporte WebGPU; en navegadores antiguos o sin aceleracion GPU, el modelo no funcionara.
- **Carga inicial lenta**: en conexiones frias, la descarga de 304 MB puede tardar varios minutos (286 s en la medicion), aunque luego se cachea y reutiliza offline.
- **Licencia del motor**: los pesos son Apache-2.0, pero el motor Brimkern es MIT; al integrar el SDK, se debe cumplir la licencia MIT del codigo del motor.
- **Sin garantias de produccion**: no se mencionan pruebas de estres, tolerancia a fallos ni soporte de produccion; el modelo es una demostracion tecnica mas que una solucion empresarial validada.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/romainkh14/RWKV-7-G1a-0.4B_BRIK)
- [Modelo base original (fla-hub)](https://huggingface.co/fla-hub/rwkv7-0.4B-g1a)
- [Modelo base de BlinkDL (archivo .pth con contexto 4096)](https://huggingface.co/BlinkDL/rwkv7-g1/blob/main/rwkv7-g1a-0.4b-20250905-ctx4096.pth)
- [Motor Brimkern](https://brimkern.com)
- [Especificacion del formato BRIK](https://github.com/RomainKH/Brimkern/blob/main/BRIK_FORMAT.md)
- [Repositorio Brimkern (scripts e2e)](https://github.com/RomainKH/Brimkern/tree/main/scripts/e2e)
- [Perfil del autor en HuggingFace](https://huggingface.co/romainkh14)
