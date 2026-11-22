# Piolodiusz/translator-en-pl-235m

## Resumen

Translator-235M (EN → PL) v1.0 es un modelo de traducción automática inglés-polaco entrenado desde cero por el desarrollador independiente Piolodiusz. Se trata de un transformer encoder-decoder de 235.097.088 parámetros (aproximadamente 235M) con 12 capas en el encoder y 12 en el decoder, dimensión de modelo de 768 y un vocabulario SentencePiece de 48.000 tokens. El modelo se entrenó íntegramente en PyTorch sobre una única GPU de 12 GB, lo que lo convierte en un ejemplo de pipeline de entrenamiento eficiente y reproducible para traducción de bajo coste.

El problema que aborda es la traducción EN→PL de alta calidad con requisitos de hardware mínimos. Según los datos declarados por el autor, supera a `facebook/nllb-200-distilled-600M` (2,5 veces más grande) en todas las métricas de FLORES+ devtest (BLEU 21,49 frente a 18,47; chrF++ 48,65 frente a 45,34) y lo hace con una velocidad de 93,5 frases por segundo frente a 42,3, es decir, 2,2 veces más rápido. Esto lo hace relevante para despliegues en producción con recursos limitados o para investigación sobre entrenamiento de modelos de traducción desde cero.

El modelo emplea componentes modernos (RoPE, RMSNorm con QK-Norm, SwiGLU, embeddings atados, FlashAttention) y un pipeline de entrenamiento en tres fases: SFT sobre unos 127,6 millones de pares paralelos, annealing sobre datos limpios y optimización de preferencias con CPO-SimPO. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (12 capas encoder / 12 capas decoder), d_model=768, n_heads=12, d_ff=2048 |
| Parametros totales | 235.097.088 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (`max_seq_len=256`) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | inglés (en) y polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16, ~448 MB), más `config.json`, `spm_en_pl_48k.model` y `modeling_translator.py` |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder simétrico de 12+12 capas con `d_model=768`, 12 cabezas de atención y `d_ff=2048`. Incorpora RoPE en la self-attention, RMSNorm con QK-Norm, activación SwiGLU, embeddings atados (`lm_head.weight == embed.weight`), FlashAttention vía SDPA y KV-Cache tanto para decodificación greedy como para beam search por lotes. El vocabulario es un SentencePiece de 48.000 tokens compartido entre origen y destino.

El entrenamiento se desarrolló en tres etapas. La primera (SFT) usó un corpus paralelo EN-PL a gran escala de aproximadamente 127,6 millones de pares, mezclado con un 20 % de datos limpios de dominio. La segunda (Gold Annealing) afinó sobre datos curados (`gold_anneal`). La tercera aplicó CPO-SimPO (optimización de preferencias) sobre 6.606 pares de una o varias frases puntuados con XCOMET-lite, lo que según el autor eliminó el truncamiento en pares multi-frase y mejoró la fluidez. Todo el entrenamiento se realizó en una única GPU de 12 GB.

## Capacidades

- Traducción automática directa inglés → polaco, tanto de frases sueltas como de pares multi-frase (mejorada en la etapa CPO).
- Decodificación con beam search configurable (beam=4 y `length_penalty=0.6` en los benchmarks publicados) y decodificación greedy con KV-Cache.
- Procesamiento por lotes (batched beam search) para throughput alto en servidor.
- Manejo de tres dominios evaluados explícitamente: wikibooks, wikinews y wikivoyage.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de visión o audio: es un modelo de traducción puro.
- Capacidad multilingüe limitada a los dos idiomas de entrenamiento (en, pl); no se declara soporte para otros pares.

## Casos de uso

- Traducción de documentación técnica EN→PL: el modelo traduce fragmentos de 2-3 frases con beam search y puede integrarse en pipelines de documentación estática, dividiendo los documentos en chunks que respeten el límite de 256 tokens.
- Localización de sitios web y aplicaciones: con 93,5 frases por segundo en una sola GPU, puede traducir lotes de cadenas de interfaz y contenidos de CMS en tiempo casi real, con coste de infraestructura muy bajo.
- Subtitulado y traducción de contenido audiovisual: la mejora en pares multi-frase de la etapa CPO reduce el truncamiento, lo que encaja con diálogos de subtítulos de una o dos frases.
- Atención al cliente bilingüe EN→PL: traducción de mensajes entrantes en inglés a polaco para agentes o sistemas de ticketing, con latencia baja gracias al tamaño reducido del modelo.
- Investigación en traducción automática de bajo recursos: el pipeline completo (SFT + annealing + CPO-SimPO) entrenado en una GPU de 12 GB sirve como referencia reproducible para experimentos académicos.
- Traducción de artículos enciclopédicos y noticias: los tres dominios evaluados (wikibooks, wikinews, wikivoyage) son representativos de contenido editorial, donde el modelo obtiene MetricX-24-Ref de 4,539, 4,965 y 4,687 respectivamente.
- Preprocesamiento en pipelines de NLP: traducción EN→PL como paso previo a análisis de sentimiento, indexación o búsqueda en corpus polacos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (FLORES+ `devtest`, 1.012 frases, beam=4, length_penalty=0.6). No verificados de forma independiente (`verified: false`).

| Modelo | BLEU ↑ | chrF++ ↑ | MetricX-24-Ref ↓ | MetricX-24-QE ↓ | Velocidad |
|---|---|---|---|---|---|
| `facebook/nllb-200-distilled-600M` | 18,47 | 45,34 | 5,391 | 4,908 | 42,3 frases/s |
| Stage 1 — SFT (40k pasos) | 20,85 | 47,74 | 4,907 | 4,420 | ~93 frases/s |
| Stage 2 — Gold Annealing | 21,01 | 47,60 | 4,817 | 4,398 | ~93 frases/s |
| **Stage 3 — CPO (v1.0)** | **21,49** | **48,65** | **4,729** | **4,137** | **93,5 frases/s** |

Desglose por dominio (MetricX-24-Ref ↓): wikibooks 4,539 (NLLB: 5,336); wikinews 4,965 (NLLB: 5,309); wikivoyage 4,687 (NLLB: 5,539). Comparación directa frente a NLLB (victorias / empates / derrotas): 51,8 % / 16,4 % / 31,8 % (+202 victorias netas).

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 0,5 GB de pesos más overhead de activaciones y KV-Cache; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, A100, H100; el modelo se entrenó en una GPU de 12 GB, por lo que la inferencia es viable en hardware muy modesto.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM (incluso en CPU es funcional, aunque más lento).
- Opciones de despliegue: el modelo requiere código propio (`modeling_translator.py`) cargado vía `importlib`, por lo que no es directamente compatible con vLLM, TGI o llama.cpp sin adaptación; el flujo oficial es PyTorch + safetensors + SentencePiece.
- Throughput declarado: 93,5 frases/s con beam=4 en la GPU de referencia del autor; latencia por frase no publicada de forma explícita.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BLEU (FLORES+ EN→PL) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Translator-235M (este modelo) | 235M | 256 tokens | 21,49 | Apache 2.0 | Hugging Face, código propio |
| `facebook/nllb-200-distilled-600M` | 600M | 512 tokens (típico NLLB) | 18,47 | CC-BY-NC 4.0 | Hugging Face, transformers |
| Modelos NLLB-200 completos (1.3B, 3.3B, etc.) | 1.300M–54.500M | 512 tokens (típico NLLB) | no disponible en la información | CC-BY-NC 4.0 | Hugging Face, transformers |
| Helsinki-NLP OPUS-MT en-pl | no disponible en la información | no disponible | no disponible | no disponible | Hugging Face, transformers |

La ventaja principal frente a NLLB es la combinación de menor tamaño (2,5 veces menos parámetros), mayor velocidad (2,2 veces) y licencia permisiva para uso comercial, a costa de un contexto mucho más corto (256 frente a 512 tokens) y de requerir código de modelado personalizado en lugar de la API estándar de transformers.

## Limitaciones y advertencias

- Ventana de contexto de solo 256 tokens: los documentos largos deben dividirse en fragmentos de 2-3 frases antes de la inferencia, lo que puede degradar la coherencia en textos con dependencias largas.
- Modismos ingleses poco frecuentes y acrónimos específicos de dominio pueden traducirse de forma literal, según reconoce el propio autor.
- Solo traduce EN→PL; no soporta otros pares de idiomas ni direccionalidad inversa.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`); no hay evaluación independiente publicada.
- Requiere cargar código Python personalizado (`modeling_translator.py`) con `importlib` y ejecutar `trust_remote_code` de facto; conviene auditar el código antes de usarlo en producción.
- No es compatible de forma nativa con ecosistemas estándar (transformers, vLLM, TGI, llama.cpp), lo que complica el despliegue escalado y el batching dinámico.
- Riesgo de alucinación y de omisiones en frases ambiguas o con referencias culturales específicas; no se han publicado análisis de sesgos.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no existe validación comunitaria de su comportamiento en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Piolodiusz/translator-en-pl-235m
- Dataset de evaluación FLORES+: https://huggingface.co/datasets/openlanguagedata/flores_plus
- Modelo de comparación NLLB-200 distilled 600M: https://huggingface.co/facebook/nllb-200-distilled-600M
- Repositorio de SentencePiece: https://github.com/google/sentencepiece
- Documentación de safetensors: https://github.com/huggingface/safetensors
- Otros enlaces (papers, blogs, demos) no disponibles en la información proporcionada.
