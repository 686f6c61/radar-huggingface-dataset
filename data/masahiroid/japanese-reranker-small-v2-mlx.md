# masahiroid/japanese-reranker-small-v2-mlx

## Resumen

`masahiroid/japanese-reranker-small-v2-mlx` es la conversión al formato MLX de `hotchpotch/japanese-reranker-small-v2`, un reranker japonés ligero basado en arquitectura cross-encoder sobre ModernBERT. Lo publica el usuario masahiroid como conversión comunitaria, no oficial, pensada para ejecutarse de forma nativa en hardware Apple Silicon mediante el framework MLX de Apple. El modelo resuelve la tarea de reordenación de resultados de búsqueda (text-ranking): recibe un par consulta-documento y devuelve una puntuación de relevancia en el rango [0, 1].

Con 70.151.041 parámetros (aproximadamente 70 M) y un repositorio de solo 0,1 GB, está diseñado para integrarse como segunda fase en pipelines de recuperación (RAG, búsqueda semántica, motores de búsqueda internos) donde un bi-encoder recupera candidatos y este cross-encoder los reordena por relevancia real. Su relevancia actual radica en que permite ejecutar ese paso de reranking íntegramente en local sobre Macs con chip de la serie M, sin depender de servicios en la nube ni de GPUs dedicadas.

La conversión mantiene los pesos en safetensors, la licencia MIT del modelo original y el soporte de los idiomas japonés e inglés. Es una pieza de infraestructura de búsqueda más que un modelo generativo: no produce texto, solo puntuaciones de relevancia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (cross-encoder para text-ranking) |
| Parámetros totales | 70.151.041 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; MLX permite cuantización posterior, no documentada en la model card) |
| Idiomas soportados | japonés (ja), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en ModernBERT: procesa conjuntamente la consulta y el documento en una única pasada del transformer y produce una puntuación escalar de relevancia a través de la cabeza de pooling (`pooler_output`), con salida en el rango [0, 1]. Al ser un cross-encoder, la atención se calcula sobre la concatenación de ambos textos, lo que permite capturar interacciones finas entre consulta y documento que un bi-encoder no modela.

Esta ficha corresponde a una conversión de pesos, no a un entrenamiento nuevo: los pesos y el proceso de entrenamiento original pertenecen a `hotchpotch/japanese-reranker-small-v2`. La model card no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos deben consultarse en el modelo base. La innovación técnica de esta versión es la portabilidad a MLX, que permite inferencia nativa en Apple Silicon con el paquete `mlx-embeddings`.

## Capacidades

- Puntuación de relevancia consulta-documento (cross-encoding) en el rango [0, 1].
- Reranking de listas de candidatos recuperados por un bi-encoder en pipelines de búsqueda.
- Procesamiento bilingüe japonés-inglés.
- Integración con tokenizadores de Hugging Face (`AutoTokenizer`) y tensores MLX.
- Ejecución local en hardware Apple Silicon mediante MLX.
- No genera texto, no soporta tool calling ni razonamiento multi-paso: su única salida es una puntuación de relevancia.

## Casos de uso

- RAG sobre documentación en japonés: tras recuperar los N candidatos con un modelo de embeddings, este reranker reordena los fragmentos por relevancia real antes de pasarlos al modelo generativo, mejorando la precisión del contexto inyectado.
- Búsqueda semántica en aplicaciones macOS/iOS: al ejecutarse con MLX sobre Apple Silicon, permite incorporar reranking local en apps de escritorio sin enviar consultas a un servidor.
- Atención al cliente con base de conocimiento: reordenar artículos de ayuda recuperados para una consulta de usuario y presentar primero los más pertinentes, con soporte para consultas mixtas japonés-inglés.
- Deduplicación y filtrado de resultados: puntuar pares consulta-documento para descartar candidatos por debajo de un umbral de relevancia antes de mostrarlos.
- Evaluación de calidad de recuperación: usar las puntuaciones como métrica auxiliar para comparar configuraciones de un pipeline de búsqueda.
- Demo interactiva de embeddings: la model card menciona el Space "Ruri Atlas", que visualiza embeddings en 3D en el navegador (WebGPU) con opción de activar el reranker y observar dónde cae un intento de prompt injection.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/ memoria unificada: con ~70 M de parámetros y pesos en safetensors, el modelo ocupa del orden de 0,1 GB en el repositorio; la memoria en ejecución es muy reducida (previsiblemente menos de 1 GB incluyendo activaciones y tokenizador, aunque no se documenta cifra exacta).
- GPU recomendadas: hardware Apple Silicon (series M1/M2/M3/M4) es el objetivo de MLX; no se documenta soporte CUDA en esta conversión.
- Cabe holgadamente en cualquier Mac con chip de la serie M; también en GPUs consumer si se reconvierte a otros formatos, aunque no está documentado.
- Despliegue: paquete `mlx-embeddings` con `mlx.core`; no se documentan opciones vLLM, llama.cpp, Ollama ni TGI para esta conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| masahiroid/japanese-reranker-small-v2-mlx | 70.151.041 | no disponible | ja, en | MIT | safetensors (MLX) |
| hotchpotch/japanese-reranker-small-v2 (base) | no disponible en la información | no disponible | ja, en | MIT (según modelo derivado) | safetensors |
| Otras alternativas de reranking japonés | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión comunitaria, no una release oficial del autor del modelo original; la responsabilidad de validación recae en quien la despliega.
- Solo puntúa relevancia: no genera texto ni responde preguntas por sí mismo.
- Cobertura lingüística limitada a japonés e inglés; el rendimiento en otros idiomas no está garantizado.
- La longitud de contexto no está documentada; los documentos largos pueden truncarse sin aviso según la configuración del tokenizador.
- Riesgo de sesgos heredados del corpus de entrenamiento original, no auditados en esta ficha.
- Aunque la licencia es MIT, conviene verificar los términos del modelo base antes de uso comercial en producción.
- La model card incluye una auditoría de seguridad con `model-audit-lite` (formato de pesos, código incluido y ML-BOM); se recomienda revisar `SECURITY.md` antes de cargar el modelo en entornos sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/japanese-reranker-small-v2-mlx
- Modelo base: https://huggingface.co/hotchpotch/japanese-reranker-small-v2
- Demo "Ruri Atlas": https://huggingface.co/spaces/masahiroid/ruri-atlas
- MLX (framework de Apple): https://github.com/ml-explore/mlx
- Herramienta de auditoría: https://github.com/masahiroid/model-audit-lite
