# bowmanslayer/Qwen3.8-27B-Text-Only-GGUF

## Resumen

Qwen3.8-27B-Text-Only-GGUF es una cuantización comunitaria del modelo Qwen3.8-27B, publicada por el usuario bowmanslayer en HuggingFace. Se trata de una conversión a formato GGUF con matriz de importancia (imatrix) realizada directamente desde los pesos BF16 originales, sin re-cuantización intermedia, lo que evita pérdida compuesta de calidad. La particularidad de esta versión es que se han eliminado a nivel de pesos la torre de visión y el bloque MTP (Multi-Token Prediction), dejando únicamente el modelo de lenguaje. Esto reduce el tamaño del archivo y permite ejecutar el modelo en GPUs con 16 GB de VRAM en las cuantizaciones más bajas.

El modelo base, Qwen3.8-27B, emplea una arquitectura híbrida de atención: de sus 64 capas, solo 16 son de atención completa (full attention) y las otras 48 utilizan atención lineal Gated DeltaNet, que no requiere caché KV. Esta característica reduce drásticamente el consumo de memoria para el contexto, permitiendo ventanas de hasta 158.976 tokens en una RTX 3090 con la cuantización Q3_K_M. El repositorio incluye además un archivo mmproj opcional que restaura la capacidad de visión, aunque con un rendimiento inferior al de los modelos Qwen3-VL dedicados.

La relevancia de esta publicación radica en su enfoque práctico: ofrece un equilibrio entre calidad, velocidad y contexto que se adapta a hardware de consumo, con mediciones reales en una RTX 3090 y recomendaciones claras para diferentes presupuestos de VRAM. No es un lanzamiento oficial de Qwen ni está respaldado por Alibaba Cloud, pero se distribuye bajo licencia Apache-2.0, lo que permite uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 16 capas full attention + 48 capas Gated DeltaNet (atención lineal) |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 158.976 tokens (medido en RTX 3090, según cuantización) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, Q3_K_M |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero, sino una cuantización del modelo Qwen3.8-27B, que a su vez es una evolución de la familia Qwen3.5. La arquitectura del modelo base es híbrida: combina 16 capas de atención tradicional (con cabezas de clave/valor) con 48 capas de atención lineal Gated DeltaNet, una variante de SSM (State Space Model) que no almacena caché KV. Esta combinación reduce el coste de memoria del contexto en aproximadamente un factor de cuatro en comparación con un modelo denso de atención completa del mismo tamaño.

El proceso de cuantización se realizó en varias etapas: primero se eliminaron la torre de visión (`model.visual.*`) y el bloque MTP (`model.mtp*`) de los safetensors originales, promoviendo los pesos de `model.language_model.*` a la raíz. Después se convirtió a GGUF en BF16 (pérdida nula respecto a la fuente) y se calculó una matriz de importancia (imatrix) sobre 300 fragmentos de un corpus de calibración compuesto por 512 pasajes de texto de pile-val news. Finalmente, cada nivel de cuantización se generó utilizando esa imatrix, incluidos los K-quants. Todos los archivos fueron cargados y probados con generación real antes de publicarse.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente y contextualizado, heredando las capacidades del modelo base Qwen3.8-27B (razonamiento, código, matemáticas, etc.), aunque no se proporcionan detalles específicos en la información disponible.
- Visión opcional: mediante el archivo `mmproj` incluido, se puede añadir capacidad de procesamiento de imágenes usando `llama-mtmd-cli`. El proyector es el mismo del modelo Qwen3.8-27B original, sin modificaciones.
- Contexto largo eficiente: gracias a la atención híbrida, el uso de memoria para la caché KV es muy reducido (64 KiB por token en f16), lo que permite ventanas de contexto muy amplias en hardware limitado.
- Sin MTP: el bloque de Multi-Token Prediction se ha eliminado, por lo que no se beneficia de decodificación especulativa nativa.
- Compatibilidad con llama.cpp: requiere una versión de llama.cpp que soporte la arquitectura `qwen35` (build b10502 o superior).

## Casos de uso

- Procesamiento de documentos extensos: con la cuantización Q4_K_M y 111.872 tokens de contexto en una RTX 3090, se pueden analizar contratos, informes o tesis completas en una sola pasada, sin necesidad de dividir el texto.
- Asistente de programación con contexto amplio: el modelo puede mantener archivos de código fuente completos o múltiples módulos en el contexto, facilitando tareas de refactorización, revisión de código o generación de documentación.
- Sistemas RAG (Retrieval-Augmented Generation): la gran ventana de contexto permite incluir numerosos fragmentos recuperados de una base de conocimiento en una única consulta, mejorando la precisión de las respuestas.
- Chat con historial extenso: en aplicaciones de atención al cliente o asistentes virtuales, el modelo puede mantener conversaciones de cientos de turnos sin perder el hilo, gracias a la baja huella de memoria de la caché KV.
- Análisis de logs y telemetría: procesar grandes volúmenes de registros de sistemas o aplicaciones en una sola pasada, identificando patrones o anomalías.
- Generación de informes a partir de múltiples fuentes: combinar artículos, noticias o documentos técnicos en una única consulta para producir resúmenes o análisis comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas como MMLU, HumanEval o GSM8K. Los únicos datos de rendimiento son mediciones de velocidad de generación y contexto máximo en una RTX 3090 con Vulkan, que se detallan en la tabla de especificaciones de la model card.

## Requisitos de hardware

- VRAM estimada: desde 12,4 GiB (Q3_K_M) hasta 26,6 GiB (Q8_0). La cuantización recomendada para 16 GB es IQ4_XS (14,0 GiB), mientras que Q4_K_M (15,4 GiB) también carga pero deja poco espacio para la caché KV.
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M o Q6_K; tarjetas de 16 GB (como RTX 4060 Ti 16 GB) para IQ4_XS; Apple Silicon con 32 GB de memoria unificada para Q5_K_M/Q6_K, y 64 GB para Q8_0.
- Contexto máximo medido en una RTX 3090 (Vulkan, full offload): Q6_K 32.512 tokens, Q5_K_M 73.472, Q4_K_M 111.872, IQ4_XS 133.632, Q3_K_M 158.976.
- Velocidad de generación (tg128) en la misma GPU: Q6_K 32,3 tokens/s, Q5_K_M 36,9, Q4_K_M 41,4, IQ4_XS 31,9, Q3_K_M 38,5. Los builds CUDA suelen ser más rápidos que Vulkan.
- Despliegue: compatible con llama.cpp (build b10502 o superior), incluyendo `llama-cli`, `llama-server` y `llama-mtmd-cli` para visión. También puede usarse con frontends que acepten GGUF como Ollama o LM Studio, siempre que usen una versión reciente de llama.cpp.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de la misma categoría (por ejemplo, Llama 3.1 8B, Mistral 7B o Qwen2.5 32B). El autor no publica datos comparativos de rendimiento ni de calidad.

## Limitaciones y advertencias

- No es un lanzamiento oficial de Qwen ni está respaldado por Alibaba Cloud; es una cuantización comunitaria que puede no reflejar fielmente el comportamiento del modelo original en todos los casos.
- Se han eliminado la torre de visión y el bloque MTP. La visión solo está disponible mediante el archivo `mmproj` opcional, y su rendimiento en tareas de OCR denso o conteo de objetos pequeños es inferior al de los modelos Qwen3-VL dedicados.
- La calidad varía significativamente entre cuantizaciones: Q3_K_M muestra una pérdida de calidad notable, mientras que Q8_0 es casi sin pérdida pero requiere 32 GB de VRAM o más.
- La cuantización IQ4_XS es más lenta que Q4_K_M a pesar de ser más pequeña, debido al mayor coste de dequantización de la familia IQ.
- Requiere una versión reciente de llama.cpp (build b10502 o superior); versiones antiguas fallarán con errores de tensores no encontrados.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas específicas de esta cuantización.
- La licencia Apache-2.0 permite uso comercial, pero se debe respetar la atribución y los términos del modelo base Qwen3.8-27B.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bowmanslayer/Qwen3.8-27B-Text-Only-GGUF
- Modelo base (referencia): https://huggingface.co/Qwen/Qwen3.8-27B
