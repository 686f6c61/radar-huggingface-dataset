# ah00haruto/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) publicado en Hugging Face bajo el identificador `ah00haruto/DeepSeek-V4.1-Flash`. La model card lo presenta como un modelo de 552B parámetros de backbone con soporte para contextos de hasta un millón de tokens, capaz de procesar imágenes y texto de forma nativa y de generar texto de manera autorregresiva. El pipeline declarado es `image-text-to-text` y la librería es `transformers`.

La innovación principal que declara el autor es la compresión extrema de la caché KV. La arquitectura Causal Encoder-Decoder (CED) proyecta la caché KV global del decodificador a partir de los estados ocultos finales del codificador, lo que permite activar solo 8B parámetros por token en prefill y 16B en decode. Combinado con Compressed Sparse Attention 2 (CSA2) y caché KV principal en FP4, el modelo reduce la huella de caché global a unos 890 bytes por token, aproximadamente una cuarta parte de la de DeepSeek-V4-Flash.

El modelo está pensado para cargas de trabajo agénticas con mucho input, donde el coste de prefill y el tamaño de la caché KV dominan el gasto de inferencia. Se entrena desde cero sobre un corpus multimodal de 45T tokens y emplea un proceso de post-entrenamiento estándar (SFT, RL y destilación on-policy) con un ajuste de esfuerzo de razonamiento controlable entre 1 y 100.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal Encoder-Decoder (CED) con Transformer de 40 capas (20 encoder causal + 20 decoder), MoE |
| Parámetros totales | 763.205.315.794 (según safetensors); 552B de backbone según la model card, más 196B de Engram conditional memory |
| Parámetros activos | 8B por token en prefill; 16B por token en decode |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantización | FP8 (tag del repo), FP4 (E2M1) para caché KV principal, 8-bit |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (`transformers`) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Causal Encoder-Decoder de 40 capas: 20 capas de codificador causal seguidas de 20 capas de decodificador. La peculiaridad es que la caché KV global del decodificador se proyecta desde los estados ocultos finales del codificador, en lugar de derivarse de los estados ocultos de cada capa del decodificador. Esto reduce los parámetros activos a 8B por token en prefill y 16B en decode. La técnica SWA Bounded Replay reconstruye los estados KV de sliding-window attention que faltan replicando solo los últimos *n*_win tokens, lo que evita persistir la caché SWA en SSD y reduce la huella de caché KV persistente a aproximadamente 1/8 de la de DeepSeek-V4-Flash.

La atención utiliza Compressed Sparse Attention 2 (CSA2), que asigna a cada capa de atención uno de tres modos estáticos (Full, Reindex o Reuse) para compartir la KV principal y la K del indexador entre capas y reutilizar los índices de atención dispersa Top-K. En el decodificador, un Hierarchical Sparse Indexer restringe las capas de indexación posteriores a un conjunto de candidatos construido por la primera capa en modo Full, acotando el coste del indexador en profundidad con independencia de la longitud de contexto. Con la caché KV principal en FP4 (formato E2M1, una escala E4M3 por cada 16 canales), la caché global queda en unos 890 bytes por token, unas 4 veces menos que DeepSeek-V4-Flash y 437 veces menos que DeepSeek-V1. El MoE usa 1 experto compartido y 384 expertos enrutados por capa, activando 6 expertos enrutados por token. Se añaden Single-Pass mHC (mezcla del flujo residual con kernel Mega-MHC), Engram conditional memory (196B parámetros de acceso disperso por lookup de tokens) y decodificación especulativa DSpark con verificación programada por confianza.

El preentrenamiento se realiza desde cero sobre un corpus multimodal de 45T tokens, con atención dispersa entrenada a longitud de secuencia de 64K y contexto extendido a 1M tokens a los 34T tokens. El componente visual es un codificador DeepSeek-ViT entrenado desde cero con 2D-RoPE y downsampling 3×3 pixel-unshuffle, seguido de un proyector MLP de dos capas que convierte las imágenes en embeddings visuales procesados conjuntamente con el texto desde el inicio del preentrenamiento. El post-entrenamiento sigue el paradigma SFT, RL y destilación on-policy (OPD) sin modificaciones algorítmicas, con cambios sustanciales en el pipeline de datos: síntesis automatizada a gran escala de tareas y entornos agénticos con escalado progresivo de datos, tareas y rollouts.

## Capacidades

- Generación de texto autorregresiva con razonamiento de esfuerzo controlable (entero de 1 a 100) que intercambia coste de inferencia por precisión.
- Procesamiento nativo de imágenes y texto (pipeline `image-text-to-text`), con codificador visual DeepSeek-ViT y proyector MLP.
- Razonamiento multi-step y cargas agénticas, con entrenamiento específico en tareas y entornos agénticos sintetizados.
- Tool calling y function calling: el pipeline conversacional y el entrenamiento agéntico apuntan a este uso, aunque la model card no detalla el formato exacto de las herramientas.
- Contexto largo de hasta 1M tokens, adecuado para documentos extensos, repositorios de código y conversaciones multi-turno prolongadas.
- Capacidades multilingües: no disponible en la información proporcionada.
- Decodificación especulativa DSpark integrada para acelerar la generación.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de hasta 1M tokens y a la caché KV comprimida, que abarata el mantenimiento de historiales extensos en memoria.
- Análisis de documentos extensos con imágenes: informes financieros, contratos o expedientes con gráficos y tablas se pueden procesar en una sola pasada multimodal, ya que el modelo ingiere imágenes y texto de forma conjunta.
- Agentes autónomos de navegación y ejecución de tareas: el entrenamiento con entornos agénticos sintetizados y el soporte de razonamiento multi-step lo hacen adecuado para pipelines que encadenan tool calls y verifican resultados intermedios.
- Generación y revisión de código en producción: puede integrarse en pipelines de CI/CD para revisar diffs, generar tests y explicar errores, aprovechando el contexto largo para cargar repositorios completos.
- Asistentes de investigación sobre corpus científicos: la ventana de 1M tokens permite resumir y relacionar decenas de papers con figuras en una sola consulta, reduciendo la necesidad de fragmentación y recuperación externa.
- Procesamiento por lotes de alto volumen con mucho input: la activación de solo 8B parámetros en prefill y la caché KV de 890 bytes por token reducen el coste de tareas como clasificación, extracción de entidades o resumen sobre grandes volúmenes de texto e imágenes.
- Razonamiento con presupuesto controlable: el ajuste de esfuerzo de razonamiento (1-100) permite desplegar el mismo modelo en modos de baja latencia para tareas simples y de alta precisión para problemas complejos de matemáticas o lógica.

## Benchmarks y rendimiento

La model card menciona una sección de resultados de evaluación para el modelo base, con una figura de rendimiento en benchmarks agénticos, pero el contenido numérico de las tablas no está incluido en la información proporcionada. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta. Con 763.205.315.794 parámetros totales y pesos en FP8, el peso del modelo ronda los 763 GB; en FP4 bajaría a unos 380 GB, pero la información no confirma una cuantización FP4 de los pesos (solo de la caché KV).
- GPU recomendadas: no disponible. Por tamaño, requiere múltiples aceleradores de datacenter (A100 80GB, H100 80GB, H200) en configuración multi-GPU o multi-nodo.
- ¿Cabe en GPU de consumo? No. Incluso con cuantización agresiva, los 763B parámetros superan la VRAM de cualquier GPU de consumo actual (RTX 4090 con 24 GB).
- Opciones de despliegue: la librería declarada es `transformers`; el repo incluye el tag `endpoints_compatible`. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible. La model card destaca la reducción de coste en prefill (8B activos por token) y en decode (16B activos por token), y la caché KV de 890 bytes por token, pero no publica cifras de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Caché KV por token | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash | 552B backbone (763B totales con Engram) | 1M tokens | 890 bytes | MIT | Hugging Face |
| DeepSeek-V4-Flash | No disponible | No disponible | ~4× mayor que V4.1-Flash | No disponible | No disponible en la información |
| DeepSeek-V1 | No disponible | No disponible | ~437× mayor que V4.1-Flash | No disponible | No disponible en la información |

La model card solo ofrece comparaciones relativas de caché KV frente a generaciones anteriores de DeepSeek. No se dispone de datos de parámetros, contexto ni rendimiento de DeepSeek-V4-Flash o DeepSeek-V1 en la información proporcionada, por lo que la comparativa cuantitativa completa no está disponible.

## Limitaciones y advertencias

- El repositorio pertenece al usuario `ah00haruto`, no a la organización oficial `deepseek-ai`; la model card replica la estética y enlaces de DeepSeek, pero la autoría oficial no está confirmada. Conviene verificar la procedencia antes de usarlo en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-20), lo que sugiere una publicación reciente y sin validación comunitaria.
- La licencia MIT permite uso comercial, pero al tratarse de una licencia permisiva sin cláusulas de uso responsable, la responsabilidad sobre sesgos y usos indebidos recae en el desplegador.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- Riesgo de alucinación: no cuantificado en la información proporcionada; como modelo generativo de gran escala, es esperable en tareas de conocimiento factual, pero no hay datos publicados.
- Idiomas soportados: no disponible; no se puede confirmar el rendimiento en castellano ni en otros idiomas distintos del inglés.
- El tamaño del repo (510,3 GB) y los 763B parámetros implican un coste de almacenamiento y despliegue muy elevado; no es viable en hardware de consumo.
- El ajuste de esfuerzo de razonamiento (1-100) añade un parámetro de configuración cuyo comportamiento óptimo por tarea no está documentado.
- Los benchmarks numéricos no están incluidos en la información disponible, por lo que no se puede verificar el rendimiento declarado frente a competidores.

## Enlaces

- [Hugging Face: ah00haruto/DeepSeek-V4.1-Flash](https://huggingface.co/ah00haruto/DeepSeek-V4.1-Flash)
- [Technical Report (PDF, enlace de la model card)](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf)
- [DeepSeek Homepage](https://www.deepseek.com/)
- [DeepSeek Chat](https://chat.deepseek.com/)
- [DeepSeek AI en Hugging Face](https://huggingface.co/deepseek-ai)
- [DeepSeek en Twitter/X](https://twitter.com/deepseek_ai)
