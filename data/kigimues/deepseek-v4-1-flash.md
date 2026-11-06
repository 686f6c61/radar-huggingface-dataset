# kigimues/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) publicado por el usuario kigimues en Hugging Face bajo licencia MIT. Segun la model card, se trata de un modelo con 552 mil millones de parametros de backbone y capacidad de procesar contextos de hasta un millon de tokens, con procesamiento nativo de imagenes y texto y generacion autoregresiva de texto.

La innovacion central del modelo es la compresion agresiva de la KV cache. Mediante una arquitectura Causal Encoder-Decoder (CED), atencion dispersa comprimida (CSA2) y cacheo de la KV principal en FP4, el modelo reduce la huella de la KV cache global a unos 890 bytes por token, aproximadamente una cuarta parte de la de DeepSeek-V4-Flash y unas 437 veces menos que DeepSeek-V1. Ademas, activa solo 8B parametros por token en prefill y 16B en decodificacion, lo que lo hace especialmente adecuado para cargas de trabajo agenticas con mucho input.

El modelo se entrena desde cero sobre un corpus multimodal de 45 billones de tokens y emplea un pipeline de post-entrenamiento SFT, RL y destilacion on-policy. Incluye un ajuste de esfuerzo de razonamiento controlable (entero de 1 a 100) que permite intercambiar coste de inferencia por precision. El repositorio pesa 510,3 GB y los pesos declarados en safetensors suman 763.205.315.794 parametros totales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Encoder-Decoder (CED), Transformer de 40 capas (20 encoder causal + 20 decoder), MoE con atencion dispersa CSA2 |
| Parametros totales | 763.205.315.794 (pesos safetensors); 552B de backbone segun model card |
| Parametros activos | 8B por token en prefill; 16B por token en decode |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | FP8 y 8-bit (tags de Hugging Face); KV principal en FP4 (formato E2M1 con escala E4M3 por 16 canales) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Transformer causal encoder-decoder de 40 capas, con 20 capas de encoder causal seguidas de 20 capas de decoder. En el esquema CED, la KV cache global del decoder se proyecta desde los estados ocultos finales del encoder en lugar de derivarse de cada capa del decoder, lo que permite activar solo 8B parametros por token durante el prefill y 16B durante la decodificacion. El mecanismo SWA Bounded Replay reconstruye los estados KV de ventana deslizante ausentes replicando solo los ultimos n_win tokens, evitando persistir la KV de SWA en SSD y reduciendo la huella persistente a aproximadamente 1/8 de la de DeepSeek-V4-Flash.

La atencion usa Compressed Sparse Attention 2 (CSA2), que asigna a cada capa uno de tres modos estaticos (Full, Reindex o Reuse) para compartir la KV principal y la K del indexador entre capas y reutilizar los indices de atencion dispersa Top-K. En el decoder, un indexador disperso jerarquico restringe las capas de indexado posteriores a un pool de candidatos construido por la primera capa en modo Full, acotando el coste del indexador en funcion de la longitud de contexto. La KV principal se cachea en FP4, lo que reduce la KV global a 890 bytes por token. Otros componentes incluyen Single-Pass mHC con kernel Mega-mHC, memoria condicional Engram (196B parametros con acceso disperso por lookup de token) y decodificacion especulativa DSpark. Cada capa MoE usa 1 experto compartido y 384 expertos enrutados, activando 6 expertos enrutados por token.

El preentrenamiento se realiza desde cero sobre un corpus multimodal de 45 billones de tokens, con atencion dispersa entrenada a longitud de secuencia de 64K y contexto extendido a 1M tokens a partir de 34 billones de tokens. El post-entrenamiento sigue el paradigma SFT, RL y destilacion on-policy sin modificaciones algoritmicas; los cambios sustanciales estan en el pipeline de datos, con sintesis automatizada a gran escala de tareas y entornos agenticos y escalado progresivo de datos, tareas y rollouts. El componente multimodal incluye un encoder de vision DeepSeek-ViT entrenado desde cero con 2D-RoPE y downsampling 3x3 pixel-unshuffle, y un proyector MLP de dos capas que convierte las imagenes en embeddings visuales procesados conjuntamente con el texto desde el inicio del preentrenamiento.

## Capacidades

- Generacion de texto autoregresiva con contextos de hasta 1M tokens.
- Procesamiento multimodal de imagenes y texto (pipeline image-text-to-text).
- Razonamiento con esfuerzo controlable mediante un entero de 1 a 100 que intercambia coste de inferencia por precision.
- Tareas agenticas y razonamiento multi-paso, con datos de entrenamiento sintetizados especificamente para entornos agenticos.
- Memoria condicional Engram para acceso disperso a conocimiento via lookup de token.
- Decodificacion especulativa DSpark con verificacion programada por confianza.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos largos con imagenes: el modelo puede procesar hasta 1M tokens de contexto combinando texto e imagenes, adecuado para revision de informes, contratos o expedientes con material grafico adjunto.
- Cargas de trabajo agenticas con mucho input: gracias a los 8B parametros activos en prefill y a la KV cache de 890 bytes por token, resulta eficiente en escenarios donde el input domina el coste, como pipelines de agentes que leen grandes repositorios o historiales.
- Razonamiento adaptativo a coste: el ajuste de esfuerzo de razonamiento de 1 a 100 permite desplegar el mismo modelo en modos rapidos para tareas simples y modos profundos para problemas complejos, ajustando el gasto de inferencia por peticion.
- Servicio de inferencia con memoria limitada: la reduccion de la KV cache a 1/4 de DeepSeek-V4-Flash permite atender mas conversaciones concurrentes en el mismo hardware, util para plataformas de chat multi-turno de alta concurrencia.
- Procesamiento de imagenes en flujos documentales: el encoder DeepSeek-ViT y el proyector MLP permiten extraer y razonar sobre contenido visual integrado en flujos de digitalizacion y clasificacion documental.
- Investigacion en eficiencia de atencion dispersa: la combinacion de CSA2, FP4 KV y SWA Bounded Replay convierte el modelo en una referencia practica para estudiar compresion de KV cache en produccion.

## Benchmarks y rendimiento

La model card menciona resultados de evaluacion de modelos base y graficos de rendimiento agentico, pero los valores numericos concretos no estan incluidos en la informacion proporcionada. No se han publicado resultados de benchmarks detallados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta. Con 763.205.315.794 parametros totales, en FP8 se requeririan del orden de 700-760 GB solo para pesos; en 8-bit similar; en cuantizaciones de 4 bits, del orden de 380-400 GB. Estas estimaciones son calculadas a partir del numero de parametros y no proceden de la model card.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el volumen de pesos, un despliegue completo requiere multiples aceleradores (por ejemplo, nodos multi-GPU tipo H100 o A100 de 80 GB); no cabe en una GPU consumer individual.
- Cabe en consumer GPU: no, con los pesos completos. Solo seria viable con cuantizaciones muy agresivas y reparto multi-GPU, dato no confirmado por el autor.
- Opciones de despliegue: la libreria declarada es transformers; vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible. Los tags indican endpoints_compatible.
- Latencia y throughput: no disponibles. La arquitectura declara 8B parametros activos en prefill y 16B en decode, y decodificacion especulativa DSpark, pero no se aportan cifras de latencia o tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KV cache por token | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash | 763B totales (552B backbone); 8B/16B activos | 1M tokens | 890 bytes (FP4) | MIT | Hugging Face (kigimues) |
| DeepSeek-V4-Flash | No disponible | No disponible | ~4x mayor que V4.1-Flash (aprox. 3.560 bytes, derivado) | No disponible | Referenciado en model card |
| DeepSeek-V1 | No disponible | No disponible | ~437x mayor que V4.1-Flash (aprox. 389 KB, derivado) | No disponible | Referenciado en model card |

Los valores de KV cache de DeepSeek-V4-Flash y DeepSeek-V1 son derivados de los factores 4x y 437x citados en la model card y no cifras publicadas directamente. No se dispone de datos de otros modelos comparables de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado; como modelo generativo de gran escala, es esperable, pero no hay datos del autor.
- Limitaciones de contexto o idioma: el contexto maximo es de 1M tokens; los idiomas soportados no estan especificados.
- Restricciones de licencia: licencia MIT, que permite uso comercial con atribucion y sin garantias; conviene revisar el texto completo de la licencia en el repositorio.
- El modelo aparece publicado por el usuario kigimues, no por la organizacion oficial deepseek-ai; la model card referencia recursos de DeepSeek AI, pero la autoria del repositorio no coincide con la organizacion oficial. Verificar procedencia antes de uso en produccion.
- El repositorio tiene solo 26 descargas y 0 likes, lo que indica poca validacion comunitaria hasta la fecha.
- El peso del repositorio (510,3 GB) y los 763B parametros implican requisitos de hardware muy elevados; el despliegue completo no es viable en hardware consumer.
- Los tags indican FP8 y 8-bit, pero no se detallan cuantizaciones GGUF ni otras alternativas ligeras.
- La model card esta truncada en la seccion de evaluacion; los resultados numericos de benchmarks no estan disponibles para validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/kigimues/DeepSeek-V4.1-Flash
- Technical Report (referenciado en model card): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Homepage DeepSeek: https://www.deepseek.com/
- Chat DeepSeek: https://chat.deepseek.com/
- Organizacion DeepSeek AI en Hugging Face: https://huggingface.co/deepseek-ai
- Twitter DeepSeek AI: https://twitter.com/deepseek_ai
- Repositorio DeepSeek-V2 (recursos graficos referenciados): https://github.com/deepseek-ai/DeepSeek-V2
