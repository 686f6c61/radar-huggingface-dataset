# bartowski/maritaca-ai_S5-nano-GGUF

## Resumen

S5-nano es un modelo multimodal (texto e imagen) de 4B parámetros desarrollado por Maritaca AI, un laboratorio brasileño especializado en modelos de lenguaje para portugués. El modelo se distribuye bajo licencia Apache 2.0 y está diseñado para tareas de conversación, razonamiento y comprensión de imágenes, con un enfoque particular en el mercado lusófono aunque también soporta inglés. Su ventana de contexto alcanza los 262.144 tokens, una cifra notable para su tamaño, y sus pesos incorporan una capa MTP (multi-token prediction) que habilita decodificación especulativa.

La ficha que nos ocupa corresponde a la versión cuantizada en formato GGUF publicada por bartowski, que facilita la ejecución del modelo en hardware de consumo mediante llama.cpp. El checkpoint original en safetensors declara 4.326.350.848 parámetros (aproximadamente 4,3B), mientras que la model card del autor de la cuantización indica 5B como recuento del checkpoint fuente. El repositorio GGUF ocupa 68 GB en total e incluye múltiples niveles de cuantización, desde bf16 hasta IQ3, además de un archivo `mmproj` separado necesario para procesar imágenes.

El modelo resulta relevante por combinar tres características poco habituales en su rango de tamaño: modalidad visual, contexto ultralargo y decodificación especulativa integrada. Todo ello bajo una licencia permisiva que permite uso comercial sin restricciones adicionales, lo que lo convierte en una opción atractiva para despliegues en producción sobre GPUs de gama media o incluso en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen); detalles internos no disponibles |
| Parametros totales | 4.326.350.848 (safetensors); 5B segun la model card del checkpoint fuente |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_0, Q4_K_S, IQ4_XS, IQ3_M (y niveles inferiores) |
| Idiomas soportados | portugues (pt), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el checkpoint original |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de su naturaleza transformer y multimodal. El modelo acepta entradas de texto e imagen, esta ultima gestionada mediante un archivo `mmproj` independiente en el ecosistema llama.cpp. Los pesos incorporan una capa de multi-token prediction (MTP) que permite decodificacion especulativa, una tecnica que acelera la generacion al predecir varios tokens por paso y verificarlos en paralelo.

El modelo opera en dos modos: Think, que razona antes de responder y es el predeterminado, y Instruct, que responde directamente sin paso de razonamiento. El formato de prompt utiliza tokens estilo ChatML (`<|im_start|>` / `<|im_end|>`) con un bloque `<think>` que precede a la respuesta del asistente. No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno con formato ChatML.
- Razonamiento explicito en modo Think, con bloque `<think>` previo a la respuesta.
- Modo Instruct para respuestas directas sin razonamiento intermedio.
- Comprension de imagenes (image-text-to-text) mediante el archivo `mmproj`.
- Soporte de tool calling / function calling con formato XML especifico (`<tool_call>`, `<function=...>`, `<parameter=...>`).
- Capacidades multilingues limitadas a portugues e ingles.
- Decodificacion especulativa mediante capa MTP integrada en los pesos.
- Contexto de hasta 262.144 tokens para conversaciones o documentos extensos.

## Casos de uso

- Atencion al cliente en portugues: el modelo puede gestionar conversaciones multi-turno con historial extenso gracias a su ventana de 262.144 tokens, manteniendo coherencia en dialogos largos y derivando a herramientas externas mediante function calling cuando sea necesario.
- Procesamiento de documentos largos con imagenes: combinando la modalidad visual y el contexto extendido, puede analizar informes escaneados, facturas o capturas de pantalla junto con texto de acompanamiento en una sola pasada.
- Asistentes con acceso a herramientas: el formato de tool calling documentado permite integrarlo en agentes que consulten APIs (por ejemplo, precios de acciones, clima o bases de datos) y encadenen llamadas multi-paso.
- Despliegue en hardware de consumo: con cuantizaciones de 2,5-3 GB (IQ4_XS, Q4_K_M), puede ejecutarse en GPUs consumer de 8 GB o incluso en CPU mediante llama.cpp, lo que lo hace viable para prototipos y aplicaciones de escritorio.
- Analisis de imagenes en aplicaciones moviles o edge: el tamano reducido del modelo y su cuantizacion permiten inferencia local en dispositivos con recursos limitados para tareas de descripcion de imagenes o extraccion de informacion visual.
- Generacion de contenido en portugues: redaccion asistida, resumenes y reescritura de textos en portugues con soporte de razonamiento previo en modo Think para tareas que requieran mayor precision.
- Educacion y tutoria: el modo Think permite mostrar el razonamiento paso a paso, util para explicaciones didacticas o resolucion guiada de problemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache): aproximadamente 2,5 GB con IQ4_XS, 2,8 GB con Q4_K_M, 3,4 GB con Q5_K_M, 3,8 GB con Q6_K, 4,6 GB con Q8_0 y 8,7 GB con bf16.
- El contexto de 262.144 tokens incrementa significativamente el consumo de KV cache; para contextos largos se recomienda GPU con 16 GB o mas.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para contextos largos y throughput alto; RTX 4060 Ti (16 GB) o RTX 4070 para contextos moderados.
- Cabe en GPUs consumer de 8 GB (RTX 3060, RTX 4060) con cuantizaciones Q4 o inferiores y contextos moderados; tambien en CPU via llama.cpp.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con la API de endpoints (el tag `endpoints_compatible` sugiere compatibilidad con endpoints estandar). vLLM y TGI no se mencionan en la informacion disponible para este formato.
- Latencia y throughput: no disponibles. La capa MTP habilita decodificacion especulativa, que previsiblemente mejora el throughput respecto a decodificacion autoregresiva estandar, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la informacion proporcionada. Como referencia estructural, se puede contrastar con alternativas multimodales de tamano similar, aunque sin cifras de rendimiento verificables:

| Modelo | Parametros | Contexto | Licencia | Modalidad |
|---|---|---|---|---|
| S5-nano (maritaca-ai) | ~4,3B | 262.144 | Apache 2.0 | Texto + imagen |
| Alternativas de ~4B multimodales | no disponible | no disponible | no disponible | no disponible |

No se han proporcionado modelos comparables concretos ni resultados que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Cobertura linguistica limitada a portugues e ingles; el rendimiento en castellano no esta documentado y podria ser deficiente.
- Riesgo de alucinacion inherente a modelos de este tamano, especialmente en tareas de razonamiento complejo o conocimiento factual extenso.
- El modo Think por defecto incrementa la latencia y el consumo de tokens; para aplicaciones de baja latencia conviene usar el modo Instruct.
- El contexto de 262.144 tokens es teorico; el rendimiento real en contextos muy largos puede degradarse y el coste de KV cache es elevado.
- La modalidad visual requiere descargar y configurar el archivo `mmproj` por separado; sin el, el modelo solo procesa texto.
- Aunque la licencia Apache 2.0 permite uso comercial sin restricciones, conviene verificar la procedencia de los datos de entrenamiento para cumplir con normativas de derechos de autor en produccion.
- El recuento de parametros difiere entre fuentes (4,3B en safetensors frente a 5B en la model card), lo que puede afectar a estimaciones de memoria.
- No se han publicado resultados de benchmarks, por lo que la calidad real del modelo en tareas especificas no puede validarse a priori.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/maritaca-ai_S5-nano-GGUF
- Modelo base original: https://huggingface.co/maritaca-ai/S5-nano
- Perfil del autor de la cuantizacion: https://huggingface.co/bartowski
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp/
- Release de llama.cpp usada para la cuantizacion (b12174): https://github.com/ggml-org/llama.cpp/releases/tag/b12174
