# GUAN-CHENG/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) publicado en Hugging Face bajo el identificador `GUAN-CHENG/DeepSeek-V4.1-Flash`. La model card lo presenta como un modelo de la familia DeepSeek-V4.1 con 552B parámetros de backbone y soporte para contextos de hasta un millón de tokens, capaz de procesar imágenes y texto de forma nativa y de generar texto de manera autorregresiva. El repositorio, sin embargo, declara 763.205.315.794 parámetros totales en sus ficheros safetensors, una cifra que incluye componentes adicionales como la memoria condicional Engram (196B parámetros) y que no coincide con los 552B del backbone indicados en el texto.

La propuesta técnica central es la compresión extrema de la caché KV: mediante una arquitectura Causal Encoder-Decoder (CED), atención dispersa comprimida CSA2, caché KV principal en FP4 y decodificación especulativa DSpark, el modelo reduce el consumo de KV a unos 890 bytes por token, aproximadamente una cuarta parte del de DeepSeek-V4-Flash. Esto lo orienta a cargas de trabajo agénticas con entradas muy largas, donde el coste de prefill y el peso de la caché dominan el presupuesto de inferencia.

El modelo se distribuye con licencia MIT, en formato safetensors y cuantización FP8/8-bit, y está pensado para su uso con la librería transformers. Es relevante ahora porque combina contexto de 1M tokens, multimodalidad y una huella de memoria de inferencia mucho menor que la de modelos comparables de su clase, aunque su tamaño total sigue exigiendo infraestructura de centro de datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal Encoder-Decoder (CED), transformer de 40 capas (20 encoder causal + 20 decoder), MoE con 1 experto compartido y 384 expertos enrutados por capa |
| Parámetros totales | 763.205.315.794 (safetensors); 552B de backbone según la model card; incluye 196B de memoria condicional Engram |
| Parámetros activos | 8B por token en prefill; 16B por token en decode; 6 expertos enrutados activados por token |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantización | FP8 / 8-bit (según tags del repo); caché KV principal en FP4 (formato E2M1, una escala E4M3 por cada 16 canales) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DeepSeek-V4.1-Flash emplea una arquitectura Causal Encoder-Decoder en la que la caché KV global del decoder se proyecta desde los estados ocultos finales del encoder, en lugar de derivarse de los estados de cada capa del decoder. Esto permite activar solo 8B parámetros por token durante el prefill y 16B durante el decode. La atención usa Compressed Sparse Attention 2 (CSA2), que asigna a cada capa uno de tres modos estáticos (Full, Reindex o Reuse) para compartir KV principal e índices entre capas y reutilizar los índices Top-K de atención dispersa; en el decoder, un indexador disperso jerárquico restringe las capas de indexación posteriores a un pool de candidatos construido por la primera capa en modo Full, acotando el coste del indexador con independencia de la longitud de contexto. La técnica SWA Bounded Replay reconstruye los estados KV de ventana deslizante ausentes replicando solo los últimos n_win tokens, lo que reduce la caché KV persistente a aproximadamente 1/8 de la de DeepSeek-V4-Flash. Se suman Single-Pass mHC con el kernel Mega-mHC, memoria condicional Engram de 196B parámetros con acceso disperso por lookup de tokens y decodificación especulativa DSpark con verificación programada por confianza.

En el plano multimodal, un encoder de visión DeepSeek-ViT entrenado desde cero con 2D-RoPE y downsampling pixel-unshuffle 3×3, junto con un proyector MLP de dos capas, convierte las imágenes en embeddings visuales que se procesan conjuntamente con los embeddings de texto desde el inicio del preentrenamiento. El preentrenamiento se realizó desde cero sobre un corpus multimodal de 45 billones (45T) de tokens, con atención dispersa entrenada a longitud de secuencia de 64K y extensión de contexto hasta 1M tokens a los 34T tokens. El post-entrenamiento sigue el paradigma estándar SFT → RL → destilación on-policy (OPD) sin modificaciones algorítmicas, con cambios sustanciales en el pipeline de datos: síntesis automática a gran escala de tareas y entornos agénticos con escalado progresivo de datos, tareas y rollouts. El modelo admite un ajuste de esfuerzo de razonamiento continuo y controlable (entero de 1 a 100) que intercambia coste de inferencia por precisión.

## Capacidades

- Generación de texto autorregresiva con razonamiento de esfuerzo controlable mediante un parámetro entero de 1 a 100.
- Procesamiento nativo de imágenes y texto (pipeline image-text-to-text), con encoder de visión propio.
- Contexto de hasta 1M tokens, adecuado para documentos largos, repositorios de código y trazas agénticas extensas.
- Capacidades agénticas: la model card describe entrenamiento con tareas y entornos agénticos sintetizados automáticamente, y benchmarks específicos de rendimiento agéntico.
- Decodificación especulativa DSpark integrada para acelerar la generación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles en la información proporcionada.

## Casos de uso

- Agentes autónomos con trazas largas: el modelo puede mantener conversaciones y planes multi-paso de cientos de miles de tokens gracias al contexto de 1M y a una caché KV de solo 890 bytes por token, lo que abarata el almacenamiento de estado en servidores de agentes concurrentes.
- Análisis de repositorios de código completos: con 1M tokens de contexto puede ingerir varios ficheros y su historial de cambios en una sola pasada, y el modo de razonamiento ajustable permite subir el esfuerzo en tareas de depuración complejas.
- Procesamiento de documentos con imágenes: al ser image-text-to-text, puede extraer información de informes escaneados, diagramas y capturas junto con el texto circundante en una única llamada.
- Ingesta masiva de entradas en pipelines RAG: el prefill activa solo 8B parámetros por token, lo que reduce el coste de procesar grandes volúmenes de contexto recuperado antes de generar la respuesta.
- Asistentes de investigación sobre corpus extensos: la ventana de 1M tokens permite comparar artículos, patentes o expedientes completos sin fragmentación por chunking.
- Despliegue en infraestructura con memoria limitada por GPU: la caché KV en FP4 y la reducción a 1/4 frente a V4-Flash permiten atender más sesiones simultáneas por nodo en cargas de entrada intensiva.
- Evaluación de esfuerzo variable en producción: el parámetro de razonamiento 1-100 permite enrutar consultas simples a esfuerzo bajo y reservar el alto para tareas críticas, controlando el coste por petición.

## Benchmarks y rendimiento

La model card incluye una sección de resultados de evaluación para el modelo base, pero el contenido proporcionado se interrumpe antes de mostrar las tablas de puntuaciones. No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 763.205.315.794 parámetros en safetensors y pesos en FP8/8-bit, el peso mínimo de los pesos ronda los 763 GB, a lo que hay que sumar la caché KV (890 bytes por token, unos 890 MB por millón de tokens y sesión) y los estados de activación.
- GPU recomendadas: no disponibles en la información proporcionada. Por volumen de pesos, el despliegue requiere múltiples aceleradores de centro de datos (clase H100/H200 o superior); no se especifican configuraciones exactas.
- ¿Cabe en GPU de consumo? No. El tamaño del repositorio (510,3 GB) y el número de parámetros descartan su ejecución en GPUs consumer como la RTX 4090.
- Opciones de despliegue: la model card y los tags indican compatibilidad con transformers y endpoints_compatible; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles. La model card menciona mejoras de eficiencia (8B activos en prefill, 16B en decode, decodificación especulativa DSpark) pero no publica cifras de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Caché KV por token | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash | 552B backbone / 763B totales | 1M tokens | 890 bytes (FP4) | MIT | Hugging Face |
| DeepSeek-V4-Flash | No disponible | No disponible | ~4× mayor que V4.1-Flash | No disponible | No disponible en la información |
| DeepSeek-V1 | No disponible | No disponible | ~437× mayor que V4.1-Flash | No disponible | No disponible en la información |

La información proporcionada solo permite comparar la huella de caché KV frente a generaciones anteriores de DeepSeek; no se dispone de datos de parámetros, contexto ni licencia de DeepSeek-V4-Flash ni de DeepSeek-V1, ni de otros modelos comparables de la misma categoría.

## Limitaciones y advertencias

- Discrepancia entre los 552B de backbone de la model card y los 763.205.315.794 parámetros declarados en safetensors; conviene verificar qué incluye cada cifra antes de dimensionar infraestructura.
- El repositorio tiene 38 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-10-28); no hay evidencia de validación independiente de los resultados descritos.
- El autor del repositorio es `GUAN-CHENG`, no la organización oficial `deepseek-ai`; la model card enlaza a recursos de DeepSeek AI, pero la procedencia del checkpoint debe verificarse.
- No se han publicado resultados numéricos de benchmarks en la información disponible, por lo que no es posible contrastar las afirmaciones de rendimiento.
- Idiomas soportados no disponibles: no se puede garantizar calidad en castellano ni en otros idiomas distintos del inglés sin evaluación propia.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos, especialmente con contexto muy largo.
- Sesgos conocidos: no disponibles en la información proporcionada.
- La licencia MIT permite uso comercial, pero el tamaño del modelo (cientos de GB de pesos) impone requisitos de hardware que limitan su despliegue en producción a infraestructura de centro de datos.
- El pipeline declarado es image-text-to-text; el soporte de tool calling y de agentes multi-paso se menciona de forma cualitativa en la model card, sin especificación de API.

## Enlaces

- [Hugging Face: GUAN-CHENG/DeepSeek-V4.1-Flash](https://huggingface.co/GUAN-CHENG/DeepSeek-V4.1-Flash)
- [Informe técnico (PDF enlazado en la model card)](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf)
- [Sitio oficial de DeepSeek](https://www.deepseek.com/)
- [Chat de DeepSeek](https://chat.deepseek.com/)
- [Organización DeepSeek AI en Hugging Face](https://huggingface.co/deepseek-ai)
- [Twitter de DeepSeek AI](https://twitter.com/deepseek_ai)
