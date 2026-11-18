# deepseek-ai/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek AI. Con 552B parámetros en el backbone (763.205.315.794 parámetros totales según los pesos en safetensors) y soporte para contextos de hasta un millón de tokens, el modelo procesa de forma nativa imágenes y texto, y genera texto de manera autorregresiva. Su publicación en Hugging Face con licencia MIT lo convierte en una opción especialmente atractiva para investigación y despliegue comercial sin restricciones de uso.

La innovación central del modelo es la compresión extrema de la caché KV. Mediante una arquitectura Causal Encoder-Decoder (CED), atención dispersa comprimida (CSA2) y caché KV principal en FP4, el modelo reduce el footprint de caché a 890 bytes por token, aproximadamente una cuarta parte del de DeepSeek-V4-Flash y 437 veces menos que DeepSeek-V1. Esto se traduce en costes de inferencia mucho menores para cargas de trabajo con entradas largas, típicas de agentes y pipelines de razonamiento multi-paso.

El modelo activa solo 8B parámetros por token durante la fase de prefill y 16B durante la decodificación, lo que mejora sustancialmente la eficiencia en escenarios con muchas entradas. Incorpora además un modo de esfuerzo de razonamiento controlable (entero de 1 a 100) que permite ajustar el coste de inferencia frente a la precisión, y decodificación especulativa DSpark para acelerar la generación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal Encoder-Decoder (CED), Transformer de 40 capas (20 encoder causal + 20 decoder), MoE con 1 experto compartido y 384 expertos enrutados por capa |
| Parámetros totales | 763.205.315.794 (backbone de 552B; 196B adicionales en memoria condicional Engram) |
| Parámetros activos | 8B por token en prefill; 16B por token en decode; 6 expertos enrutados activados por token |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantización | 8-bit, FP8 (etiquetas del repo); caché KV principal en FP4 (formato E2M1 con una escala E4M3 por cada 16 canales) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

DeepSeek-V4.1-Flash emplea una arquitectura Causal Encoder-Decoder (CED) en la que la caché KV global del decoder se proyecta desde los estados ocultos finales del encoder, en lugar de derivarse de los estados ocultos de cada capa del decoder. Esta decisión permite reducir drásticamente el número de parámetros activos por token. La técnica SWA Bounded Replay reconstruye los estados KV de ventana deslizante (SWA) faltantes replicando únicamente los *n*_win tokens más recientes, evitando persistir la caché SWA en SSD y reduciendo el footprint de caché KV persistente a aproximadamente 1/8 del de DeepSeek-V4-Flash.

La atención utiliza Compressed Sparse Attention 2 (CSA2), que asigna a cada capa de atención uno de tres modos estáticos (Full, Reindex o Reuse) para compartir la KV principal y la K del indexador entre capas y reutilizar los índices de atención dispersa Top-K. En el decoder, un indexador disperso jerárquico restringe las capas de indexación posteriores a un pool de candidatos construido por la primera capa en modo Full, acotando el coste del indexador independientemente de la longitud del contexto. El modelo incorpora además Single-Pass mHC (mezcla de flujo residual con kernel Mega-mHC), memoria condicional Engram de 196B parámetros con acceso disperso por lookup de tokens, y decodificación especulativa DSpark con verificación programada por confianza. El encoder de visión DeepSeek-ViT se entrena desde cero con 2D-RoPE y downsampling pixel-unshuffle 3×3, y un proyector MLP de dos capas convierte las imágenes en embeddings visuales procesados conjuntamente con el texto desde el inicio del preentrenamiento.

El preentrenamiento se realizó desde cero sobre un corpus multimodal de 45 billones (45T) de tokens, con atención dispersa entrenada a una longitud de secuencia de 64K y extensión de contexto a 1M tokens a los 34T tokens. El post-entrenamiento sigue el paradigma estándar SFT → RL → destilación on-policy (OPD) sin modificaciones algorítmicas; los cambios sustantivos se concentran en el pipeline de datos, con síntesis automatizada a gran escala de tareas y entornos de agente y escalado progresivo de datos, tareas y rollouts.

## Capacidades

- Generación de texto autorregresiva con razonamiento multi-paso.
- Procesamiento nativo de imágenes y texto (pipeline image-text-to-text).
- Modo de esfuerzo de razonamiento controlable mediante un entero de 1 a 100 que intercambia coste de inferencia por precisión.
- Soporte de tool calling y function calling (etiqueta `endpoints_compatible`).
- Capacidades de agente: entrenamiento con síntesis automatizada de tareas y entornos de agente.
- Contexto ultralargo de hasta 1M tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Decodificación especulativa DSpark para acelerar la generación.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agentes autónomos de larga duración: el modelo puede mantener estado a lo largo de sesiones extensas gracias al contexto de 1M tokens y a su entrenamiento específico con entornos de agente sintetizados, lo que permite planificación multi-paso con historial completo.
- Análisis de documentos extensos con imágenes: informes, contratos o papers con figuras y tablas pueden procesarse en una sola pasada al combinar entrada multimodal y contexto de un millón de tokens.
- Generación de código en producción: el soporte de tool calling permite integrarlo en pipelines de CI/CD para revisión automática, generación de tests o corrección de errores con acceso a herramientas externas.
- Atención al cliente automatizada: conversaciones multi-turno con contexto largo y adjuntos de imagen (capturas, facturas) se gestionan sin truncar el historial, reduciendo la pérdida de contexto.
- Razonamiento con coste controlable: el parámetro de esfuerzo de razonamiento (1-100) permite desplegar el mismo modelo en tareas de baja latencia (esfuerzo bajo) y en tareas de alta precisión (esfuerzo alto) sin cambiar de checkpoint.
- Procesamiento de imágenes en pipelines de datos: extracción de información estructurada de documentos escaneados o capturas mediante el encoder DeepSeek-ViT integrado.
- Investigación sobre eficiencia de inferencia: la arquitectura CED y la caché KV en FP4 con 890 bytes por token sirven como referencia para estudiar compresión de caché y atención dispersa.

## Benchmarks y rendimiento

La model card menciona una sección de resultados de evaluación para el modelo base, evaluado en el framework interno de DeepSeek bajo ajustes idénticos, considerando equivalentes las puntuaciones con diferencia menor de 0,3. Sin embargo, los valores numéricos concretos no están incluidos en la información disponible.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 763.205.315.794 parámetros totales, en FP8 se requieren aproximadamente 763 GB solo para pesos; en 8-bit, un valor similar. La cuantización a 4-bit no está listada entre los tipos soportados en el repo.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del modelo, no cabe en una sola GPU consumer; requiere despliegue multi-GPU o multi-nodo.
- Cabe en GPU consumer: no. El tamaño del repo (510,4 GB) y los parámetros totales superan con creces la VRAM de cualquier GPU consumer actual.
- Opciones de despliegue: transformers (librería indicada), endpoints compatibles (`endpoints_compatible`), Azure y SageMaker (etiquetas `deploy:azure`, `deploy:sagemaker`). No se confirman vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. La model card destaca la reducción de coste en prefill (8B activos) y decode (16B activos) y la caché KV de 890 bytes por token como ventajas de eficiencia, pero sin cifras de latencia o tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Caché KV por token | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash | 763B (552B backbone + 196B Engram) | 1M tokens | 890 bytes (FP4) | MIT | Hugging Face, Azure, SageMaker |
| DeepSeek-V4-Flash | No disponible | No disponible | ~4× mayor que V4.1-Flash | No disponible | No disponible |
| DeepSeek-V1 | No disponible | No disponible | ~437× mayor que V4.1-Flash | No disponible | No disponible |

La información disponible solo permite comparar con generaciones anteriores de DeepSeek en términos de caché KV. No se dispone de datos de parámetros, contexto ni licencia de DeepSeek-V4-Flash ni DeepSeek-V1 en las fuentes consultadas, por lo que la comparativa completa con alternativas de la misma categoría no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; no se documentan evaluaciones de sesgo ni de seguridad.
- Riesgo de alucinación: no cuantificado en las fuentes; como modelo generativo autorregresivo, es susceptible de alucinación, especialmente en tareas de razonamiento abierto.
- Limitaciones de contexto o idioma: aunque soporta hasta 1M tokens, el entrenamiento con atención dispersa se realizó inicialmente a 64K y se extendió a 1M a los 34T tokens; el rendimiento en el extremo superior del contexto puede degradarse. Los idiomas soportados no están documentados.
- Restricciones de licencia: licencia MIT, que permite uso comercial sin restricciones significativas, pero conviene verificar el archivo LICENSE del repositorio para confirmar los términos exactos.
- Caveats para producción: el tamaño del modelo (510,4 GB de repo) exige infraestructura multi-GPU; la cuantización a 4-bit no está listada como soportada para pesos (solo la caché KV usa FP4). El modo de esfuerzo de razonamiento requiere ajuste empírico por caso de uso. No se han publicado cifras de latencia ni throughput que permitan dimensionar SLA.

## Enlaces

- Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Informe técnico (PDF): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Página principal de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- API Platform (ES): https://www.deepseek.com/platform/
- API Platform (EN): https://www.deepseek.com/en/platform/
- Panel de la plataforma: https://platform.deepseek.com/dashboard
- Organización en Hugging Face: https://huggingface.co/deepseek-ai
- Twitter/X: https://twitter.com/deepseek_ai
