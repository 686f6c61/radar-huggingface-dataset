# nvidia/Nemotron-3.5-Rerank-8B-BF16

## Resumen

Nemotron-3.5-Rerank-8B-BF16 es un modelo de reranking (cross-encoder) desarrollado por NVIDIA para recuperación de información multilingüe y multimodal en pipelines de question answering. Su función es recibir un par consulta-documento y emitir un logit de relevancia: cuanto mayor es el valor, más relevante es el documento para la consulta. El documento puede ser texto, una imagen de página o una combinación de ambos (incluyendo gráficos, tablas e infografías), lo que lo hace apto para pipelines de vision RAG tanto clásicos como agénticos.

El modelo parte del backbone Mistral Ministral-3-8B-Instruct-2512-BF16 y añade un encoder visual basado en Pixtral, junto con una torre lingüística Ministral3 convertida a atención bidireccional para funcionar como cross-encoder. Cuenta con 8.381.159.424 parámetros (8,38B) y una longitud de contexto máxima de 32.768 tokens. Su entrenamiento se realizó en dos etapas: primero con datos exclusivamente textuales y después con datos de imagen y de imagen más texto.

Su relevancia actual radica en que, según la model card, alcanza resultados state-of-the-art en el leaderboard ViDoRe v3.1 Reranking a fecha de 20 de octubre de 2026, y está publicado bajo la licencia OpenMDW-1.1 con permiso explícito de uso comercial. Cubre 34 idiomas en recuperación textual y 18 en recuperación de imágenes, lo que lo convierte en una pieza clave para sistemas RAG multilingües y con documentos visuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer; encoder visual basado en Pixtral + torre lingüística Ministral3 bidireccional (cross-encoder) |
| Parametros totales | 8.381.159.424 (8,38B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (el checkpoint publicado es BF16) |
| Idiomas soportados | Multilingüe; 34 idiomas evaluados en texto (en, ar, as, bn, bg, zh, da, nl, fi, fr, de, hi, hinglish, id, it, ja, ko, ms, mr, ne, no, fa, pt, ro, ru, es, sw, sv, ta, te, th, uk, ur, vi) y 18 en imagen (ar, bn, zh, en, fa, fi, fr, de, hi, id, ja, ko, ru, es, sw, te, th, yo) |
| Licencia | OpenMDW-1.1 (modelo); el modelo base Ministral-3-8B-Instruct-2512-BF16 está bajo Apache 2.0 |
| Formato de pesos | safetensors (BF16); repositorio de 16,8 GB |

## Arquitectura y entrenamiento

El modelo es un cross-encoder multimodal construido sobre dos componentes: un encoder visual de tipo Pixtral y una torre de lenguaje Ministral3 de 8B parámetros adaptada a atención bidireccional, de modo que la consulta y el documento se procesan conjuntamente y la salida es un único logit de relevancia. La entrada admite texto (string), imagen (RGB) o ambos; la resolución por defecto del lado más largo de la imagen es de 1.120 píxeles, ampliable a 1.540. La salida es una lista de floats (logits crudos), donde valores más altos indican mayor relevancia del documento respecto a la consulta.

El entrenamiento se realizó en dos fases. En la primera se partió de un checkpoint reranker de 8B derivado del backbone Ministral-3-8B-Instruct-2512-BF16 y se entrenó sobre una mezcla de datasets exclusivamente textuales. En la segunda fase, el modelo inicializado desde ese primer checkpoint se entrenó con datasets de imagen y de imagen más texto. La model card no detalla el número total de tokens de entrenamiento, la composición exacta de los datasets ni si se emplearon técnicas de RLHF o DPO. El checkpoint utiliza `TokenizersBackend` y no requiere `mistral_common`; los ejemplos oficiales emplean Flash Attention 2 y fueron probados con `transformers==5.20.0`, mientras que el entrenamiento y las evaluaciones usaron `transformers==5.12.1`.

## Capacidades

- Reranking de pares consulta-documento con salida de un logit de relevancia (no genera texto libre).
- Recuperación multimodal: acepta documentos en texto, imagen o combinación de ambos, incluyendo gráficos, tablas e infografías.
- Recuperación de documentos visuales (visual-document-retrieval) en 18 idiomas evaluados.
- Recuperación textual multilingüe en 34 idiomas evaluados, incluyendo hinglish.
- Integración en pipelines de vision RAG clásicos y agénticos como etapa de reordenación tras un retriever denso.
- Compatibilidad con sentence-transformers y transformers, y tag de despliegue en vLLM.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-step autónomo ni modos de pensamiento (thinking), al tratarse de un modelo de ranking.

## Casos de uso

- Vision RAG sobre documentación corporativa: tras una recuperación densa con un modelo de embeddings multimodal, Nemotron-3.5-Rerank-8B reordena las páginas candidatas (con tablas, gráficos e infografías) usando su encoder Pixtral y su contexto de 32.768 tokens, mejorando la precisión de los documentos entregados al generador.
- Búsqueda semántica multilingüe: en un catálogo con contenido en español, inglés, árabe, hindi o japonés, el modelo actúa como segunda etapa de ranking sobre los candidatos del retriever, aprovechando su evaluación en 34 idiomas.
- Atención al cliente sobre base de conocimiento: el pipeline recupera artículos y el reranker prioriza los fragmentos más relevantes para la consulta del usuario antes de que un LLM genere la respuesta, reduciendo respuestas basadas en contexto irrelevante.
- Procesamiento de documentos escaneados y facturas: al aceptar imágenes de página completas, el modelo puntúa directamente páginas escaneadas sin necesidad de OCR previo, útil en flujos de extracción de datos financieros o administrativos.
- Investigación académica y legal: reordenación de pasajes largos (hasta 32.768 tokens) de papers o contratos, seleccionando los fragmentos que mejor responden a una consulta de investigación concreta.
- Pipelines RAG agénticos: el modelo puede integrarse como herramienta de ranking dentro de un agente que itera consultas y necesita evaluar la relevancia de documentos recuperados en cada paso.
- Moderación y deduplicación de resultados de búsqueda: puntuación de relevancia para filtrar resultados de motores de búsqueda internos antes de presentarlos al usuario final.

## Benchmarks y rendimiento

La model card indica que el modelo alcanza resultados state-of-the-art en el leaderboard ViDoRe v3.1 Reranking a fecha de 20 de octubre de 2026, pero no incluye en la información proporcionada la tabla de puntuaciones numéricas por benchmark (MMLU, HumanEval, GSM8K u otros). No se han publicado resultados de benchmarks detallados en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,8 GB solo para los pesos, más memoria para activaciones y procesamiento de imágenes; se recomienda un mínimo de 24 GB para margen operativo.
- En cuantización a 8 bits el peso se reduciría a unos 8,4 GB y en 4 bits a unos 4,2 GB, aunque la model card no publica checkpoints cuantizados ni garantiza su calidad.
- GPU recomendadas: NVIDIA A100, H100 y L40S para producción; una RTX 4090 (24 GB) puede ejecutar el modelo en BF16 con margen ajustado.
- Cabe en GPU de consumo de gama alta con 24 GB o más en BF16; en GPUs de 16 GB requeriría cuantización.
- Opciones de despliegue: transformers (probado con 5.20.0), sentence-transformers y vLLM (etiqueta oficial de despliegue); también es compatible con Flash Attention 2 mediante compilación desde fuente o el paquete `kernels`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- El modelo está optimizado para sistemas acelerados por GPU NVIDIA (CUDA); no se documenta rendimiento en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| Nemotron-3.5-Rerank-8B-BF16 | 8,38B | 32.768 tokens | Texto + imagen | OpenMDW-1.1 | Publicado (10/2026) |
| Modelos reranker comparables de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni especificaciones de modelos alternativos de la misma categoría (rerankers multimodales de ~8B) para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Al ser un cross-encoder de ranking, no genera texto: solo produce logits de relevancia; no debe usarse como modelo generativo.
- Riesgo de sesgo heredado del backbone Ministral-3-8B y de los datasets de entrenamiento, cuya composición no se detalla en la model card.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí puede producir puntuaciones de relevancia erróneas en documentos ambiguos, muy largos o fuera de los idiomas evaluados.
- La cobertura multilingüe está evaluada en 34 idiomas para texto y 18 para imagen; el rendimiento en idiomas no evaluados no está garantizado.
- El contexto máximo es de 32.768 tokens; documentos más largos deben truncarse o dividirse.
- La licencia OpenMDW-1.1 permite uso comercial según la model card, pero conviene revisar los términos completos del acuerdo; el modelo base Ministral-3-8B-Instruct-2512-BF16 está bajo Apache 2.0.
- El modelo está optimizado para hardware NVIDIA; el rendimiento en otras plataformas no está documentado.
- La resolución de imagen por defecto es 1.120 píxeles en el lado más largo (ampliable a 1.540); imágenes de mayor resolución pueden requerir redimensionado y afectar a la precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Nemotron-3.5-Rerank-8B-BF16
- Leaderboard ViDoRe v3.1 Reranking: https://leaderboard.mteb.org/benchmark/ViDoRe(v3.1)
- Blog post de NVIDIA sobre retrieval agéntico: https://huggingface.co/blog/nvidia/nemotron-retriever-world-class-agentic-retrieval
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Modelo base Ministral-3-8B-Instruct-2512-BF16: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
