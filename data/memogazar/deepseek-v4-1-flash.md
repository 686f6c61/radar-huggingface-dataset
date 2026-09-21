# memogazar/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de lenguaje basado en una arquitectura Mixture-of-Experts (MoE) con 552B parámetros en el backbone, contextos de hasta un millón de tokens y procesamiento nativo de imagen y texto. La model card lo presenta como un modelo de DeepSeek, con encoder de visión DeepSeek-ViT, 1 experto compartido y 384 expertos enrutados por capa MoE, de los que se activan 6 por token. El repositorio de HuggingFace consultado está publicado por el usuario memogazar, no por la organización oficial deepseek-ai, y registra 0 descargas y 0 likes en el momento de la consulta.

El problema que aborda es el coste de memoria del KV cache en cargas de trabajo con entradas muy largas (agentes, RAG masivo, análisis de documentos). Su arquitectura Causal Encoder-Decoder (CED), la atención dispersa CSA2 y el almacenamiento del KV principal en FP4 reducen el KV cache global a unos 890 bytes por token, aproximadamente una cuarta parte del de DeepSeek-V4-Flash. Además, la decodificación activa solo 8B parámetros por token en prefill y 16B en decode, lo que abarata el coste de cómputo en escenarios dominados por la entrada.

Es relevante ahora porque combina tres frentes que suelen ir por separado: multimodalidad nativa desde el preentrenamiento, ventanas de contexto de 1M tokens y un modo de esfuerzo de razonamiento continuo (entero de 1 a 100) que permite ajustar el coste de inferencia por petición. El repositorio pesa 510,3 GB y declara 763.205.315.794 parámetros totales en los tensores safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE causal encoder-decoder (CED): 20 capas de encoder causal + 20 capas de decoder, atencion dispersa CSA2, memoria condicional Engram, decodificacion especulativa DSpark |
| Parametros totales | 763.205.315.794 segun los safetensors del repositorio; 552B en el backbone y 196B en la memoria condicional Engram segun la model card |
| Parametros activos | 8B por token en prefill y 16B por token en decode (MoE con 1 experto compartido y 384 expertos enrutados, 6 activados por token) |
| Longitud de contexto | Hasta 1.000.000 de tokens; atencion dispersa entrenada a 64K y contexto extendido a 1M a partir del token 34T |
| Tipos de cuantizacion | Pesos publicados en safetensors con etiquetas 8-bit y fp8; KV cache principal en FP4 (formato E2M1 con una escala E4M3 por cada 16 canales). No se declaran cuantizaciones GGUF o de 4 bits de pesos |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers, pipeline image-text-to-text) |

## Arquitectura y entrenamiento

La innovación principal es la arquitectura Causal Encoder-Decoder (CED). El modelo es un Transformer de 40 capas organizado en 20 capas de encoder causal seguidas de 20 capas de decoder; el KV cache global del decoder se proyecta desde los estados ocultos finales del encoder, en lugar de derivarse de los estados de cada capa del decoder. Esto permite activar solo 8B parámetros por token durante el prefill y 16B durante el decode. La técnica SWA Bounded Replay reconstruye los estados KV de ventana deslizante que faltan replicando únicamente los n_win tokens más recientes, lo que evita persistir el KV de SWA en SSD y reduce la huella persistente de KV a aproximadamente 1/8 de la de DeepSeek-V4-Flash.

Sobre la atención, CSA2 asigna a cada capa uno de tres modos estáticos (Full, Reindex o Reuse) para compartir el KV principal y la K del indexador entre capas y reutilizar los índices de atención dispersa Top-K. En el decoder, un indexador jerárquico restringe las capas de indexado posteriores a un conjunto de candidatos construido por la primera capa en modo Full, acotando el coste del indexado en profundidad con independencia de la longitud del contexto. Con el KV principal cacheado en FP4, la huella global queda en 890 bytes por token, unas 4 veces menos que DeepSeek-V4-Flash y unas 437 veces menos que DeepSeek-V1. Se suman componentes como Single-Pass mHC (mezcla del flujo residual con el kernel Mega-mHC), la memoria condicional Engram de 196B parámetros con acceso disperso por búsqueda basada en token, y la decodificación especulativa DSpark con generación de borradores semiautoregresiva y verificación programada por confianza.

El preentrenamiento se hizo desde cero sobre un corpus multimodal de 45T tokens, con atención dispersa entrenada a secuencias de 64K y extensión de contexto a 1M tokens a partir del token 34T. El postentrenamiento sigue el paradigma SFT → RL → destilación on-policy (OPD) sin modificaciones algorítmicas, con todos los cambios relevantes en el pipeline de datos: síntesis automática a gran escala de tareas y entornos de agente, con escalado progresivo de datos, tareas y rollouts. El encoder de visión DeepSeek-ViT se entrenó desde cero con RoPE 2D y downsampling pixel-unshuffle 3×3, y un proyector MLP de dos capas convierte las imágenes en embeddings visuales que se procesan junto al texto desde el inicio del preentrenamiento del modelo de lenguaje.

## Capacidades

- Generación de texto autoregresiva con contexto de hasta 1M tokens, orientada a entradas masivas (documentos, repositorios, trazas).
- Procesamiento nativo de imagen y texto (pipeline image-text-to-text), con encoder de visión propio y proyector MLP de dos capas.
- Razonamiento con esfuerzo controlable de forma continua mediante un entero de 1 a 100, que intercambia coste de inferencia por precisión.
- Capacidades agénticas: la model card menciona síntesis a gran escala de tareas y entornos de agente durante el postentrenamiento, y publica gráficas de rendimiento en benchmarks agénticos (sin cifras en el texto disponible).
- Decodificación especulativa integrada (DSpark) para acelerar la generación.
- Memoria condicional Engram de 196B parámetros con acceso disperso por token, orientada a recuperar información condicionada por el contexto.
- Capacidades multilingües: no disponible, no se declaran idiomas soportados.
- Soporte de tool calling / function calling y de razonamiento multi-paso: no disponible explícitamente en la información proporcionada.

## Casos de uso

- Agentes de código sobre repositorios completos: con 1M tokens de contexto el modelo puede mantener en una sola ventana varios módulos, tests y ficheros de configuración, y el coste de prefill se reduce al activar 8B parámetros por token, lo que abarata las iteraciones repetidas sobre el mismo repositorio.
- Atención al cliente multimodal: admite capturas de pantalla, fotos de producto y texto en la misma conversación, y el KV cache de 890 bytes por token permite sostener sesiones multi-turno muy largas sin disparar la memoria del servidor.
- Análisis de documentación técnica y normativa: ingestión de manuales, contratos o expedientes de cientos de miles de tokens con recuperación de detalles concretos, apoyándose en el indexado disperso jerárquico que acota el coste del indexado en profundidad.
- Revisión visual automatizada en CI: el modo image-text-to-text permite evaluar capturas de interfaces o resultados de renderizado generados por un pipeline de integración continua y emitir un informe en texto.
- Enrutado por coste con esfuerzo de razonamiento variable: usar valores bajos del parámetro (1-100) para consultas triviales y valores altos para tareas de análisis, ajustando el gasto de inferencia por tipo de petición en una misma flota.
- Investigación sobre corpus largos: revisión de literatura con tablas e imágenes embebidas, extracción de resultados y comparación entre artículos en una única ventana de contexto.
- Pipelines RAG con caché persistente: la reducción a 1/8 de la huella persistente de KV respecto a DeepSeek-V4-Flash permite mantener índices de sesión en memoria durante más tiempo y con menos SSD.
- Despliegue de agentes de larga duración: la reconstrucción de estados KV de ventana deslizante mediante SWA Bounded Replay evita la gestión de KV en disco para las capas SWA, simplificando la infraestructura de sesiones persistentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación con un apartado de modelo base, pero el texto proporcionado se corta justo antes de las cifras, y solo indica que todos los modelos base se evalúan en el marco interno de los autores con los mismos ajustes y que las puntuaciones dentro de 0,3 se consideran equivalentes. Los únicos datos cuantitativos publicados son de eficiencia, no de precisión:

| Metrica | DeepSeek-V4.1-Flash | Referencia |
|---|---|---|
| KV cache global por token | 890 bytes por token (KV principal en FP4) | ~4 veces menor que DeepSeek-V4-Flash y ~437 veces menor que DeepSeek-V1 |
| Huella de KV persistente | Aproximadamente 1/8 de la de DeepSeek-V4-Flash | Gracias a SWA Bounded Replay |
| Parametros activos por token | 8B en prefill, 16B en decode | Modelo MoE con 6 expertos enrutados activados |

## Requisitos de hardware

- VRAM estimada para pesos: en FP8/8-bit, unos 763 GB (coincide con los 763,2 mil millones de parámetros); en BF16 serían aproximadamente 1,53 TB; en una hipotética cuantización de 4 bits de pesos, unos 382 GB. Son estimaciones derivadas del recuento de parámetros, no cifras oficiales.
- KV cache: con 890 bytes por token para el KV global, una ventana de 1M tokens ocuparía del orden de 890 MB de KV principal, más el estado de ventana deslizante gestionado mediante SWA Bounded Replay. La reducción de la huella persistente a 1/8 respecto a DeepSeek-V4-Flash es el principal ahorro operativo.
- GPU recomendadas: para FP8 hacen falta del orden de 10 a 12 H100 de 80 GB, o bien un nodo de 8 GPU H200 de 141 GB (1.128 GB agregados) si se quiere margen para KV y activaciones. Para un hipotético despliegue en 4 bits de pesos, un nodo de 8×H100 (640 GB) sería suficiente.
- GPU de consumo: no cabe. Incluso en 4 bits de pesos el modelo ronda los 382 GB, muy por encima de los 24 GB de una RTX 4090 o los 32 GB de una RTX 5090. El despliegue es exclusivamente de centro de datos.
- Opciones de despliegue: el repositorio está etiquetado como compatible con transformers y endpoints_compatible. La arquitectura CED con CSA2, kernels Mega-mHC y KV en FP4 requiere soporte específico de kernels, por lo que el soporte en vLLM, SGLang o TGI no está confirmado en la información disponible. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no son viables a día de hoy.
- Latencia y throughput: no disponible. Con 8B parámetros activos en prefill y 16B en decode, el coste por token es bajo en comparación con un modelo denso del mismo tamaño, pero no se han publicado medidas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | KV cache por token | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash | 763,2B (safetensors del repo) | 8B prefill / 16B decode | 1M tokens | 890 bytes | MIT | Repositorio de terceros (memogazar), 510,3 GB |
| DeepSeek-V4-Flash | No disponible | No disponible | No disponible | Aproximadamente 4 veces el de V4.1-Flash; KV persistente aproximadamente 8 veces mayor | No disponible | No disponible en la información proporcionada |
| DeepSeek-V1 | No disponible | No disponible | No disponible | Aproximadamente 437 veces el de V4.1-Flash | No disponible | No disponible en la información proporcionada |

No se dispone de datos de precisión (MMLU, HumanEval, GSM8K u otros) para ninguno de los tres modelos en la información proporcionada, por lo que la comparación se limita a la eficiencia de memoria del KV cache.

## Limitaciones y advertencias

- Procedencia del repositorio: el modelo está publicado por el usuario memogazar y no por la organización deepseek-ai, con 0 descargas y 0 likes. La model card reproduce el formato y los enlaces de DeepSeek AI, pero no hay confirmación oficial de que los pesos se correspondan con el modelo descrito. Verificar hashes y procedencia antes de cualquier uso en producción.
- Coherencia de parámetros: la model card declara 552B en el backbone más 196B en Engram (748B), mientras que los safetensors suman 763,2B. La diferencia, unos 15,2B, podría corresponder al encoder de visión y a los embeddings, pero no se explica en la información disponible.
- Licencia: el repositorio declara MIT, que permite uso comercial, pero si el modelo deriva de pesos de DeepSeek la licencia aplicable podría ser otra. Conviene contrastar con la licencia del modelo original antes de explotarlo comercialmente.
- Benchmarks: no hay cifras públicas de precisión en la información disponible, así que no es posible validar el rendimiento frente a alternativas sin una evaluación propia.
- Idiomas: no se declaran idiomas soportados. El comportamiento en castellano no está documentado.
- Sesgos y alucinación: no se documentan sesgos conocidos ni tasas de alucinación. Como en cualquier modelo generativo de este tamaño, existe riesgo de fabricación de datos, especialmente en tareas de recuperación con contexto muy largo.
- Contexto largo: aunque soporta 1M tokens, la atención dispersa se entrenó a 64K y el contexto se extendió a partir del token 34T. El rendimiento efectivo en ventanas cercanas al millón de tokens no está cuantificado.
- Despliegue: los 510,3 GB de repositorio y los más de 760B parámetros hacen inviable el uso en hardware de consumo o en estaciones de trabajo de una sola GPU. Además, la arquitectura CED con CSA2 y kernels propios puede no estar soportada por los motores de inferencia habituales.
- Formato: no hay pesos GGUF ni cuantizaciones de 4 bits de pesos publicadas, lo que limita las opciones de despliegue en entornos con memoria reducida.
- Fecha de publicación: la ficha del repositorio indica creación y actualización el 20 de septiembre de 2026, posterior a la fecha habitual de consulta, lo que refuerza la necesidad de comprobar la validez y el origen de los artefactos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/memogazar/DeepSeek-V4.1-Flash
- Informe técnico referenciado en la model card: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Organización DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
- Página oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Perfil de Twitter de DeepSeek: https://twitter.com/deepseek_ai
- Logo e imágenes de la model card: https://github.com/deepseek-ai/DeepSeek-V2/blob/main/figures/logo.svg

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo; los enlaces obtenidos correspondían a listados de alquiler de viviendas en Estrasburgo y se han descartado por no ser pertinentes.
