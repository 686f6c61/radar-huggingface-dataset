# nvidia/Nemotron-3.5-Rerank-8B-BF16

## Resumen

Nemotron-3.5-Rerank-8B-BF16 es un modelo de reranking (cross-encoder) desarrollado por NVIDIA para la recuperación de documentos multilingüe y multimodal en pipelines de question answering. Dado un par consulta-documento, donde el documento puede ser texto, una imagen de página o ambos (incluidos gráficos, tablas e infografías), el modelo produce un logit crudo de relevancia: cuanto mayor es el valor, más relevante es el documento para la consulta. Está pensado para integrarse como etapa de refinamiento en pipelines de RAG clásicos o agénticos con visión.

El modelo se construye sobre el backbone Ministral-3-8B-Instruct-2512-BF16 de Mistral AI, con 8.381.159.424 parámetros totales (8,38B) y una ventana de contexto máxima de 32.768 tokens. La arquitectura combina un codificador visual basado en Pixtral con una torre de lenguaje Ministral3 bidireccional, lo que permite puntuar pares que incluyen imágenes a una resolución de hasta 1.540 píxeles en el lado mayor (1.120 por defecto).

Su relevancia actual radica en que NVIDIA lo sitúa en el estado del arte de la nueva leaderboard ViDoRe v3.1 Reranking a fecha de 20 de octubre de 2026, y en que cubre 34 idiomas en recuperación de texto y 18 en recuperación de imágenes. Se distribuye con licencia OpenMDW-1.1 y está listo para uso comercial o no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer: codificador visual basado en Pixtral + torre de lenguaje Ministral3 bidireccional (cross-encoder) |
| Parametros totales | 8.381.159.424 (8,38B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (el checkpoint publicado es BF16; no se detallan otras variantes) |
| Idiomas soportados | 34 idiomas en texto (en, ar, as, bn, bg, zh, da, nl, fi, fr, de, hi, hinglish, id, it, ja, ko, ms, mr, ne, no, fa, pt, ro, ru, es, sw, sv, ta, te, th, uk, ur, vi) y 18 en imagen (ar, bn, zh, en, fa, fi, fr, de, hi, id, ja, ko, ru, es, sw, te, th, yo) |
| Licencia | OpenMDW-1.1 (modelo base Ministral-3-8B-Instruct-2512-BF16 bajo Apache 2.0) |
| Formato de pesos | safetensors (BF16); repo de 16,8 GB |

## Arquitectura y entrenamiento

El modelo es un cross-encoder multimodal con dos componentes: un codificador visual de tipo Pixtral y una torre de lenguaje Ministral3 en configuración bidireccional. El entrenamiento se realizó en dos etapas. En la primera, se partió de un checkpoint reranker de 8B derivado del backbone Ministral-3-8B-Instruct-2512-BF16 y se entrenó sobre una mezcla de datasets solo de texto. En la segunda, el modelo resultante se inicializó y se entrenó sobre datasets de imagen y de imagen más texto combinados, lo que le permite puntuar documentos con contenido visual.

La entrada es siempre un par formado por una consulta de texto y un documento (texto, imagen RGB o combinación). La salida es una lista unidimensional de floats, un logit crudo por par, sin normalización. La imagen por defecto usa `longest_edge` de 1.120 píxeles y puede aumentarse a 1.540. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta de los datasets ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Reranking de pares consulta-documento mediante logit de relevancia, para texto, imagen o combinación de ambos.
- Recuperación de documentos visuales: páginas escaneadas, gráficos, tablas e infografías.
- Multilingüismo amplio: evaluación en 34 idiomas para texto y 18 para imagen.
- Integración en pipelines de RAG clásicos y agénticos con visión (vision RAG).
- Compatible con `sentence-transformers`, `transformers` y `vllm`.
- Soporte de FlashAttention 2 (compilado desde fuente o mediante el paquete `kernels`).
- Checkpoint con `TokenizersBackend`; no requiere `mistral_common`.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes autónomos, audio ni modo thinking.

## Casos de uso

- Refinamiento de recuperación en RAG de texto: tras una primera fase de recuperación densa que devuelve candidatos, el reranker reordena los documentos por relevancia real, mejorando la precisión del contexto que se pasa al generador.
- RAG sobre documentos escaneados: digitalización de contratos, facturas o informes en PDF; el modelo puntúa directamente la imagen de página sin necesidad de OCR previo, lo que es útil cuando el OCR introduce errores.
- Búsqueda en documentación técnica con tablas y gráficos: manuales de producto, fichas de especificaciones o papers con figuras; el modelo evalúa la relevancia de la página completa, incluidas tablas e infografías.
- Atención al cliente multilingüe: con cobertura en 34 idiomas de texto, permite reordenar respuestas candidatas de una base de conocimiento en el idioma del usuario sin traducir previamente.
- Pipelines agénticos de recuperación: el modelo puede actuar como herramienta de verificación de relevancia en un agente que decide qué documentos consultar, dado su soporte en `vllm` para despliegue de baja latencia.
- Moderación y filtrado de resultados de búsqueda: uso del logit como señal de relevancia para descartar documentos irrelevantes antes de mostrarlos o de pasarlos a un modelo generador, reduciendo coste y alucinaciones.

## Benchmarks y rendimiento

NVIDIA afirma que el modelo alcanza resultados de estado del arte en la leaderboard ViDoRe v3.1 Reranking a fecha de 20 de octubre de 2026. En la información disponible no se incluyen las puntuaciones numéricas desglosadas por benchmark (MMLU, HumanEval, GSM8K ni métricas de recuperación como nDCG@10), por lo que no se presentan cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,8 GB solo para los pesos, más overhead de activaciones y del codificador visual; en la práctica se recomienda disponer de 24 GB o más de VRAM.
- El modelo está optimizado para ejecutarse en sistemas acelerados por GPU NVIDIA (CUDA).
- GPU de centro de datos recomendadas: A100, H100 y sucesoras, dado el tamaño de 8,38B y el procesamiento de imágenes a resolución alta.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar los pesos en BF16, aunque el margen para imágenes de gran resolución y lotes amplios es limitado; no se dispone de datos de cuantización a 8 o 4 bits en la información disponible.
- Opciones de despliegue: `transformers` (probado con la versión 5.20.0), `sentence-transformers`, `vllm` y FlashAttention 2.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de parámetros, contexto, rendimiento ni licencia de modelos reranker comparables (por ejemplo, alternativas de la familia BGE, Cohere Rerank o Jina Reranker), por lo que la comparativa cuantitativa no está disponible. Como referencia estructural, el propio modelo se basa en Ministral-3-8B-Instruct-2512-BF16 (8B, licencia Apache 2.0), pero este es un modelo generativo y no un reranker, por lo que no es directamente comparable en la tarea.

## Limitaciones y advertencias

- Es un modelo de reranking, no generativo: solo produce un logit de relevancia por par; no genera respuestas ni texto.
- La salida son logits crudos sin normalizar, por lo que la comparación entre consultas distintas requiere calibración o normalización propia.
- No se documentan en la información disponible sesgos conocidos, tasas de alucinación ni evaluaciones de robustez; al ser un cross-encoder, el riesgo de alucinación se limita a la ordenación, no a la generación de contenido.
- La cobertura idiomática está evaluada en 34 idiomas para texto y 18 para imagen; otros idiomas pueden tener rendimiento inferior.
- La resolución de imagen está limitada por defecto a 1.120 píxeles en el lado mayor (ampliable a 1.540), lo que puede afectar a documentos con texto muy pequeño.
- Licencia OpenMDW-1.1: es necesario revisar sus términos para uso comercial; el modelo base Ministral-3-8B-Instruct-2512-BF16 está bajo Apache 2.0, pero la licencia del modelo derivado es la OpenMDW-1.1.
- El modelo está optimizado para hardware NVIDIA; el rendimiento en CPU u otras aceleradoras no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Nemotron-3.5-Rerank-8B-BF16
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Leaderboard ViDoRe v3.1 Reranking: https://leaderboard.mteb.org/benchmark/ViDoRe(v3.1)
- Blog de NVIDIA sobre retrieval: https://huggingface.co/blog/nvidia/nemotron-retriever-world-class-agentic-retrieval
- Licencia Apache 2.0 (modelo base): https://www.apache.org/licenses/LICENSE-2.0.txt
