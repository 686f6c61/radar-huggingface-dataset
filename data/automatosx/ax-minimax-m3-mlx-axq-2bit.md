# AutomatosX/AX-MiniMax-M3-MLX-AXQ-2bit

## Resumen

AX-MiniMax-M3-MLX-AXQ-2bit es un empaquetado experimental en cuantización AXQ de 2 bits del modelo MiniMax-M3, desarrollado por AutomatosX para Apple Silicon (MLX). MiniMax-M3 es un modelo nativo multimodal de MiniMax con 1 millón de tokens de contexto, arquitectura de mezcla de expertos (MoE) con aproximadamente 428.000 millones de parámetros totales y unos 23.000 millones activos por token. M3 introduce la atención dispersa MiniMax (MSA) para escalar el contexto de forma eficiente y se entrenó desde el primer paso con texto, imagen y vídeo, lo que le permite razonar sobre contenido multimodal sin módulos separados.

Esta versión concreta es una conversión experimental y explícitamente no certificada por el autor. La cuantización AXQ de 2 bits reduce drásticamente el peso del modelo, pero el autor advierte que el paginado de expertos en SSD es demasiado lento para servir en producción y lo califica como "hobby / curiosidad". La calidad frente al BF16 original no se midió, y solo se cubre la ruta de lenguaje; la parte de visión permanece en BF16 y no se reclama generación visual. La licencia es la upstream de MiniMax, copiada en el paquete.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atención dispersa MiniMax Sparse Attention (MSA) |
| Parámetros totales | 428.000 millones (modelo base) / 55.287 millones (pesos cuantizados en el repositorio) |
| Parámetros activos | ~23.000 millones (modelo base) |
| Longitud de contexto | 1.000.000 tokens (modelo base) |
| Tipos de cuantización | AXQ 2-bit (experimental, solo lenguaje) |
| Idiomas soportados | en, zh |
| Licencia | other (licencia upstream de MiniMax copiada en el paquete) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

MiniMax-M3 es un modelo nativo multimodal con arquitectura MoE de 428B parámetros totales y 23B activos. La innovación principal es la atención dispersa MiniMax (MSA), que combina atención densa local con atención dispersa global para escalar a 1 millón de tokens de contexto sin coste cuadrático. El modelo se entrenó desde el primer paso con datos mixtos de texto, imagen y vídeo, lo que produce una fusión semántica más profunda que la de los modelos que añaden visión como módulo posterior. El entrenamiento incluye fases de ajuste para razonamiento, codificación y tareas de agentes, alcanzando rendimiento de frontera en estas áreas.

La variante AXQ-2bit de AutomatosX convierte los pesos a una representación de 2 bits mediante AXQ (una técnica de cuantización adaptativa). El proceso de conversión se realizó en una máquina con Apple Silicon (df-macstudio-m2) y se generó un archivo `ax_expert_stream.json` que define el flujo de expertos. No se incluyen módulos MTP (Multi-Token Prediction) en esta revisión, aunque la configuración `num_mtp_modules` está presente. La calidad no fue medida frente al BF16 original, y el paquete se considera experimental y no certificado.

## Capacidades

- Generación de texto y razonamiento complejo en inglés y chino.
- Capacidades multimodales nativas (texto, imagen, vídeo) en el modelo base; en esta variante AXQ-2bit solo se reclama la ruta de lenguaje.
- Ventana de contexto de 1 millón de tokens, apta para documentos largos y análisis de código extenso.
- Rendimiento de nivel frontera en tareas de codificación y agentización (según MiniMax).
- Soporte de atención dispersa (MSA) para eficiencia en contextos largos.
- No se reclama soporte de tool calling o function calling en la documentación del modelo base, aunque el rendimiento en tareas de agente sugiere capacidades de razonamiento multi-paso.

## Casos de uso

- Análisis de repositorios de código grandes: con 1M de contexto, el modelo base puede ingerir el contenido completo de un repositorio mediano y responder preguntas sobre arquitectura, dependencias o bugs sin fragmentar la entrada.
- Razonamiento sobre documentos extensos: contratos, informes técnicos o tesis completas pueden procesarse en una sola pasada, aunque en esta variante cuantizada la velocidad de inferencia es limitada.
- Asistencia de codificación en entornos de desarrollo: el modelo base muestra rendimiento de frontera en generación y reparación de código, útil para autocompletado y sugerencias en editores.
- Tareas de agente y razonamiento multi-paso: el modelo puede planificar y ejecutar secuencias de acciones en entornos simulados, aprovechando su ventana de contexto para mantener el estado de la tarea.
- Traducción y procesamiento bilingüe inglés-chino: útil para equipos que trabajan con documentación técnica en ambos idiomas.
- Investigación académica en cuantización extrema: el paquete AXQ-2bit sirve como experimento para estudiar el impacto de cuantizaciones agresivas en modelos MoE multimodales, aunque no está recomendado para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para la variante AXQ-2bit en la información disponible. La documentación indica explícitamente que la calidad frente a BF16 no se midió. Los benchmarks del modelo base MiniMax-M3 (MMLU, HumanEval, GSM8K, etc.) no están disponibles en la información recopilada; MiniMax afirma rendimiento de nivel frontera en codificación y tareas de agente, pero sin datos numéricos concretos en la búsqueda web realizada.

## Requisitos de hardware

- El repositorio ocupa 221.1 GB, lo que indica que incluye pesos cuantizados de lenguaje y posiblemente pesos BF16 para visión.
- La cuantización 2-bit reduce los pesos de lenguaje a aproximadamente 55.287 millones de parámetros, pero el tamaño real del repositorio sugiere que la carga en memoria será alta.
- Dado que es un paquete MLX, está diseñado para Apple Silicon (M1/M2/M3/M4) con al menos 128 GB de RAM unificada para cargar el modelo completo; con menos memoria, se requiere paginación a disco, que el autor indica que es demasiado lenta para uso práctico.
- No se recomienda para despliegue en servidores tradicionales; la librería MLX limita la ejecución a hardware Apple.
- Opciones de despliegue: MLX Python API (mlx-lm), pero no se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI para esta variante.
- Latencia y throughput: no disponibles; el autor indica que el paginado de expertos es demasiado lento para servir.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Cuantización | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniMax-M3 (base) | ~428B | ~23B | 1M | Licencia MiniMax | BF16 | HuggingFace |
| AX-MiniMax-M3-MLX-AXQ-2bit | ~55B (cuantizado) | ~23B | 1M | Licencia MiniMax | AXQ 2-bit | HuggingFace |
| DeepSeek-V3 | 671B | 37B | 128K | MIT | FP8/BF16 | HuggingFace |
| Qwen2.5-Max | no disponible | no disponible | 256K | Apache 2.0 | BF16 | HuggingFace |

La comparación directa con DeepSeek-V3 y Qwen2.5-Max se basa en la categoría de MoE de gran escala, pero no hay benchmarks públicos de la variante cuantizada. La ventaja principal del paquete AXQ-2bit es su tamaño reducido en memoria, pero a costa de velocidad de inferencia y sin garantías de calidad.

## Limitaciones y advertencias

- Paquete experimental y no certificado: el autor declara explícitamente que no será certificado en esta revisión.
- Velocidad de inferencia muy limitada: el paginado de expertos en capas SSD es demasiado lento para servir con práctica; solo apto para experimentación.
- Calidad no medida: no hay comparación de rendimiento con el modelo BF16 original.
- Solo ruta de lenguaje: la visión permanece en BF16 y no se reclama generación visual.
- Sin soporte de MTP (Multi-Token Prediction) en esta revisión.
- Licencia: la licencia upstream de MiniMax está copiada en el paquete; hay que revisar las restricciones específicas para uso comercial.
- Idiomas: solo inglés y chino; sin soporte explícito para otros idiomas en la documentación.
- Riesgo de alucinación y sesgos: no se han evaluado en esta cuantización; los modelos de 2 bits suelen degradar la coherencia y aumentar los errores.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/AutomatosX/AX-MiniMax-M3-MLX-AXQ-2bit
- Modelo base MiniMax-M3 en HuggingFace: https://huggingface.co/MiniMaxAI/MiniMax-M3
- Catálogo de modelos MLX de AutomatosX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
- GitHub de MiniMax-M3: https://github.com/MiniMax-AI/MiniMax-M3
- Página oficial de MiniMax M3: https://www.minimax.io/models/text/m3
- Sitio web de MiniMax: https://www.minimax.io/
