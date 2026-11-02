# raahemnabeel/qwen3-vl-reranker-8b

## Resumen

Qwen3-VL-Reranker-8B es un modelo multimodal de reranking desarrollado por el equipo Qwen, diseñado para puntuar la relevancia entre una consulta y un documento candidato en pipelines de recuperación aumentada por generación (RAG). A diferencia de un modelo generativo, su función es recibir pares consulta-documento y emitir una puntuación de relevancia, donde tanto la consulta como el documento pueden ser texto, imágenes, capturas de pantalla, vídeo o una combinación de ellos. El modelo se apoya en la torre de texto de Qwen3-VL (36 capas) y en un codificador visual ViT de 27 capas con DeepStack.

La variante publicada bajo el identificador `raahemnabeel/qwen3-vl-reranker-8b` es un port a hardware Tenstorrent (chips Blackhole p150 y p300) con pesos sin modificar respecto al modelo original. Se empaqueta mediante `tt-model-manager` y se sirve como API HTTP compatible con los formatos de Cohere, Jina y vLLM para reranking, exponiendo endpoints `/v1/rerank` y `/v1/score`. Cada chip aloja una copia completa del modelo, de modo que añadir chips incrementa el número de documentos procesados por segundo en lugar de reducir la latencia por documento.

Su relevancia actual radica en dos factores: por un lado, cubre la necesidad creciente de reranking multimodal en sistemas RAG que manejan documentos visuales (facturas, capturas, páginas escaneadas, vídeo); por otro, demuestra la viabilidad de ejecutar modelos de 8B parámetros en aceleradores alternativos a GPU, con perfil de licencia Apache 2.0 y soporte para más de 30 idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: torre de texto Qwen3-VL de 36 capas + ViT de 27 capas con DeepStack |
| Parámetros totales | 8B (según denominación del modelo) |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible explícitamente; presupuesto de píxeles de 7680 tokens para vídeo según la model card |
| Tipos de cuantización | no disponible |
| Idiomas soportados | más de 30 idiomas (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 2,1 GB; pesos descargados desde `Qwen/Qwen3-VL-Reranker-8B` en el commit `b212dc8c91a8164aef1ea2de9c1a867611e75c04`) |
| Pipeline | text-ranking |
| Hardware soportado | Tenstorrent p150, p150x2, p150x4, p300, p300x2 |
| API expuesta | `/v1/rerank` (Cohere/Jina/vLLM) y `/v1/score` (vLLM) en puerto 20000 |

## Arquitectura y entrenamiento

El modelo combina una torre de texto de 36 capas (heredada de Qwen3-VL) con un codificador visual ViT de 27 capas que incorpora DeepStack, una técnica que inyecta características visuales en múltiples niveles de la torre de texto en lugar de únicamente en la entrada. La puntuación de relevancia se obtiene calculando `logit("yes") - logit("no")` al final del prompt oficial de reranking, un enfoque de clasificación binaria disfrazada que evita generar texto libre y reduce la latencia. La salida final se normaliza con sigmoid para producir `relevance_score`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en la información proporcionada. El port a Tenstorrent utiliza la torre visual del bundle Ornith-1.5 para Blackhole (`qwen36 ViT`) y se distribuye mediante `tt-model-manager` 0.1.0 con esquema de manifiesto 5.1. La innovación técnica destacable en esta variante es la ejecución en hardware Tenstorrent con paralelismo de datos por chip: cada chip contiene una copia íntegra del modelo, lo que escala el throughput linealmente con el número de chips.

## Capacidades

- Reranking multimodal: puntúa la relevancia de documentos que pueden ser texto, imágenes, capturas de pantalla, vídeo o combinaciones de estos.
- Consultas multimodales: la query puede ser una cadena de texto o un objeto con `text`, `image` o `video`.
- Procesamiento de vídeo: muestreo configurable mediante `fps` (por defecto 1), con un máximo de 64 fotogramas y un presupuesto de 7680 tokens de píxeles.
- Procesamiento de imágenes: acepta base64 o URLs `data:image/...;base64` en cualquier formato soportado por PIL, hasta 16 imágenes por documento.
- Soporte multilingüe: más de 30 idiomas según la model card.
- API compatible con Cohere, Jina y vLLM para reranking, lo que facilita la integración en pipelines existentes.
- Endpoint `/v1/score` con la forma de petición de vLLM para puntuación directa de pares.
- Capacidad de devolver los documentos originales en la respuesta (`return_documents`) y las puntuaciones crudas de logit (`raw_scores`).
- No es un modelo generativo: no produce texto libre ni mantiene conversaciones.
- No expone una API compatible con OpenAI Chat Completions; utiliza la forma de petición propia del modelo.

## Casos de uso

- Reranking en pipelines RAG sobre documentos textuales: el modelo reordena los candidatos devueltos por una búsqueda por embeddings (por ejemplo, Qwen3-VL-Embedding), mejorando la precisión del contexto que se inyecta al modelo generativo. Es adecuado porque su entrenamiento específico para clasificación de relevancia supera a la similitud coseno simple en la segunda etapa de recuperación.
- Búsqueda en archivos de documentos escaneados: permite puntuar páginas de facturas, contratos o formularios como imágenes directamente, sin necesidad de OCR previo, lo que reduce errores de transcripción y simplifica el pipeline.
- Reranking de capturas de pantalla en asistentes de soporte técnico: el modelo puede comparar una consulta textual del usuario con capturas de error o interfaces, facilitando la localización de la solución correcta en bases de conocimiento visuales.
- Búsqueda en bibliotecas de vídeo: con el campo `video` y el parámetro `fps`, se pueden puntuar fragmentos de vídeo frente a consultas textuales, útil en plataformas de formación, archivos audiovisuales o moderación de contenido.
- Sistemas de comercio electrónico con búsqueda visual: un usuario sube una foto de un producto y el modelo rerankea los candidatos del catálogo (imágenes y descripciones) para devolver los más relevantes, combinando señales visuales y textuales.
- Filtrado de candidatos en pipelines de moderación o compliance: dado un conjunto de documentos e imágenes sospechosas, el modelo puntúa su relevancia respecto a una política o consulta concreta, permitiendo priorizar la revisión humana sobre los casos de mayor puntuación.
- Despliegue en infraestructura Tenstorrent: organizaciones con aceleradores Blackhole pueden servir el modelo sin GPU, con escalado horizontal por chip (perfiles `p300`, `p300x2`, `p150x2`, `p150x4`) para aumentar documentos por segundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Hardware objetivo: aceleradores Tenstorrent Blackhole en configuraciones p150 (1 chip), p150x2 (2 chips), p150x4 (4 chips), p300 (2 chips) y p300x2 / QuietBox 2 (4 chips).
- VRAM: no aplica en el sentido tradicional; se requiere memoria del acelerador Tenstorrent. El repo ocupa 2,1 GB y la model card indica unos 20 GB de disco libre para el checkpoint y los pesos convertidos.
- Requisito de sistema: 1 GB de hugepages montado en `/dev/hugepages-1G`.
- GPU: no se documenta soporte para GPU NVIDIA en la información proporcionada.
- Despliegue: mediante `tt serve` (Tenstorrent CLI) o `tt-model serve`; arranca un servidor HTTP propio en el puerto 20000.
- Escalado: cada chip aloja una copia completa del modelo (paralelismo de datos), por lo que el throughput escala aproximadamente de forma lineal: p300 duplica el throughput de p150 y p300x2 lo cuadruplica.
- Latencia y throughput: no se proporcionan cifras concretas en la información disponible.
- Perfiles de servicio disponibles: `p150` (por defecto), `p300`, `p300x2`, `p150x2`, `p150x4`, `demo` y `p300x2-demo`.
- El primer arranque compila kernels para el dispositivo, lo que tarda varios minutos.

## Comparativa con modelos similares

| Modelo | Parámetros | Modalidad | Contexto | Licencia | Hardware documentado |
|---|---|---|---|---|---|
| Qwen3-VL-Reranker-8B (esta variante) | 8B | Texto, imagen, vídeo | no disponible (presupuesto de 7680 tokens de píxeles para vídeo) | Apache 2.0 | Tenstorrent p150/p300 |
| Qwen3-VL-Reranker-8B (original, Qwen) | 8B | Texto, imagen, vídeo | no disponible | Apache 2.0 | GPU (no detallado aquí) |
| Rerankers textuales tipo bge-reranker / Cohere Rerank | no disponible | Solo texto | no disponible | variable | GPU/CPU |

La información proporcionada no incluye datos de rendimiento comparativo con alternativas, por lo que la comparación se limita a modalidad, licencia y plataforma de ejecución. No se dispone de cifras de benchmarks para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para chat, generación de texto ni razonamiento multi-paso; su única salida es una puntuación de relevancia.
- No expone una API compatible con OpenAI Chat Completions; los clientes deben adaptarse a la forma de petición propia del modelo (`/v1/rerank`, `/v1/score`).
- Las URLs de imágenes o vídeo se rechazan por defecto salvo que se establezca `QWEN3VL_RERANKER_ALLOW_URLS=1`, lo que puede requerir cambios en pipelines que esperen resolución remota.
- El modelo está empaquetado específicamente para hardware Tenstorrent; no se documenta soporte para GPU NVIDIA, CPU u otras plataformas en esta variante.
- El primer arranque requiere compilación de kernels, lo que introduce una latencia inicial de varios minutos no apta para despliegues efímeros sin caché.
- Requiere 1 GB de hugepages y unos 20 GB de disco libre, además de Docker, lo que condiciona el entorno de despliegue.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la puntuación de relevancia puede ser poco fiable en dominios muy alejados de los datos de entrenamiento; no se dispone de información sobre sesgos conocidos.
- No se dispone de información sobre el proceso de entrenamiento, datos utilizados ni evaluaciones de sesgo, lo que limita la evaluación de riesgos para producción.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los pesos originales provienen de Qwen; conviene verificar los términos del modelo original en su repositorio.
- El número de descargas y likes es cero en el momento de la consulta, lo que indica que la variante es reciente y con poca validación comunitaria.

## Enlaces

- Modelo en HuggingFace (esta variante): https://huggingface.co/raahemnabeel/qwen3-vl-reranker-8b
- Modelo base original: https://huggingface.co/Qwen/Qwen3-VL-Reranker-8B
- Repositorio de tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Documentación de prerrequisitos de Tenstorrent CLI: https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
