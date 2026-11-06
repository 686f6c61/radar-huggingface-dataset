# christian-steinert/mitra-qwen35-translate-GGUF

## Resumen

Mitra Translate Qwen3.5-9B (en formato GGUF no oficial) es una cuantización comunitaria del modelo de traducción MITRA-QWEN, desarrollado por el proyecto Dharmamitra (`buddhist-nlp`) sobre la base Qwen3.5-9B de Qwen. Se trata de un modelo de 9B parámetros especializado en la traducción de lenguas clásicas del budismo: tibetano clásico, sánscrito, pāli y chino clásico/budista hacia inglés, japonés, chino moderno, coreano, alemán, francés y otras lenguas. Su relevancia radica en que, según evaluaciones ciegas por pares publicadas por el autor original, iguala o supera a Claude Opus 4 en estos pares de idiomas, funcionando como modelo autoalojado en una sola GPU.

Esta versión GGUF, mantenida por christian-steinert, permite ejecutar el modelo con llama.cpp, LM Studio, KoboldCpp u Ollama en GPUs de consumo o en CPU, con cuantizaciones desde Q4_K_M (5,24 GiB) hasta Q8_0 (8,87 GiB, prácticamente sin pérdida respecto al original en bf16). La arquitectura es un transformer híbrido con atención lineal y completa, con una ventana de contexto de 262.144 tokens. Es un modelo exclusivo de traducción: para chat o instrucciones generales existe la variante `mitra-qwen35-it`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal + completa, intervalo de atención completa = 4), base Qwen3.5 |
| Parámetros totales | 8.953.803.264 (~9B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF) |
| Idiomas soportados | Tibetano clásico (bo), sánscrito (sa), pāli (pi), chino (zh), japonés (ja), inglés (en), coreano (ko); también alemán, francés y otros como destino según la model card original |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta versión); el original está en safetensors bf16 |

## Arquitectura y entrenamiento

La arquitectura es idéntica a la del modelo base Qwen3.5-9B: 32 capas, tamaño oculto de 4096, dimensión intermedia de 12288, 16 cabezas de consulta (Q) y 4 de clave-valor (KV) con dimensión de cabeza 256, vocabulario de 248.320 tokens y RoPE parcial (θ = 1e7, factor 0,25). El rasgo más destacable es la atención híbrida lineal + completa (`full_attention_interval = 4`), que alterna capas de atención lineal con capas de atención completa cada cuatro capas, lo que reduce el coste de la caché KV y hace viable la ventana de contexto de 262k tokens. El embedding de palabra no está atado (`tie_word_embeddings = false`).

El entrenamiento del modelo original constó de tres fases: preentrenamiento continuado sobre ~22B tokens de texto del dominio, fine-tuning por instrucciones sobre un conjunto paralelo curado y filtrado por calidad, y una etapa final de optimización de preferencias (CPO, Conditional Preference Optimization). El entrenamiento se realizó con thinking desactivado (`enable_thinking = false`) y con una instrucción de traducción específica dentro de la plantilla de chat de Qwen. Nótese que los GGUF de este repositorio se convirtieron con `--no-mtp`: la cabeza MTP de decodificación especulativa declarada en el `config.json` original no está incluida, por lo que no debe usarse `--spec-type draft-mtp` con estos ficheros.

## Capacidades

- Traducción entre lenguas clásicas budistas (tibetano clásico, sánscrito, pāli, chino clásico/budista) y lenguas modernas (inglés, japonés, chino moderno, coreano, alemán, francés y otras), en ambas direcciones.
- Manejo correcto de diacríticos IAST en términos sánscritos cuando el idioma destino lo requiere.
- Modo closed-book (traducción directa sin contexto adicional) y modo opcional con recuperación ("in-context"), insertando referencias en el prompt.
- Contexto de 262.144 tokens, apto para textos extensos como sutras completos o comentarios.
- No es un modelo de chat general: está diseñado exclusivamente para traducción con una instrucción concreta dentro de la plantilla de chat de Qwen.
- No soporta tool calling ni agentes: no disponible en la información proporcionada y fuera del propósito del modelo.
- La cabeza MTP para decodificación especulativa no está disponible en los GGUF de este repositorio.

## Casos de uso

- Traducción de textos budistas clásicos para investigación académica: investigadores de estudios budistas pueden traducir pasajes de sutras, śāstras o comentarios desde tibetano, sánscrito, pāli o chino clásico a inglés u otras lenguas modernas con terminología especializada y diacríticos IAST correctos.
- Digitalización de corpus y bibliotecas digitales: pipelines de traducción masiva de colecciones de textos budistas (por ejemplo, Kangyur o Tengyur) aprovechando el contexto de 262k tokens para procesar documentos largos en pocas pasadas.
- Asistencia a traductores profesionales: generación de borradores de traducción que el especialista revisa y corrige; con Q4_K_M se obtienen borradores rápidos, y con Q8_0 resultados de máxima calidad.
- Apoyo al estudio de lenguas clásicas: estudiantes de tibetano clásico o sánscrito pueden comparar traducciones automáticas con el original para verificar su comprensión de pasajes difíciles.
- Integración en plataformas educativas budistas: servicio de traducción autoalojado vía llama-server para sitios de estudio, sin depender de APIs comerciales y garantizando privacidad sobre materiales de investigación.
- Anotación y alineación de corpus multilingües: traducción de segmentos paralelos para construir datasets alineados entre lenguas clásicas y modernas en proyectos de NLP humanístico.
- Traducción inversa para verificación filológica: traducir de vuelta a las lenguas clásicas (por ejemplo, de inglés a tibetano) para contrastar interpretaciones de términos ambiguos.

## Benchmarks y rendimiento

Según la model card original de buddhist-nlp, bajo evaluación ciega por pares el modelo iguala o supera a Claude Opus 4 en los pares de lenguas cubiertos. No se han publicado en la información disponible las cifras numéricas concretas de benchmarks; los resultados detallados están en la sección de evaluación de la model card original (ver enlaces).

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos):
  - Q8_0: 8,87 GiB — recomendado con ≥ 12 GB de VRAM libres.
  - Q6_K: 6,85 GiB — cabe en 8 GB de VRAM.
  - Q5_K_M: 6,02 GiB — alternativa si Q6_K no cabe con el contexto deseado.
  - Q4_K_M: 5,24 GiB — la más ligera, con degradación notable (omisiones y errores de diacríticos).
- La caché KV consume una parte importante del presupuesto a contexto largo; usar `--cache-type-k q8_0 --cache-type-v q8_0` o reducir `--ctx-size` si no se necesitan los 262k tokens.
- GPUs recomendadas: RTX 4090, RTX 3090 o similares (≥ 12 GB) para Q8_0 con contexto amplio; GPUs de 8 GB (RTX 4060 Ti, RTX 3070) para Q6_K/Q5_K_M. También ejecutable en CPU gracias a la atención híbrida.
- Despliegue: llama.cpp (`llama-cli` / `llama-server`), llama-swap, LM Studio, KoboldCpp y Ollama. No requiere vLLM ni TGI al ser GGUF.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mitra Translate Qwen3.5-9B (este) | ~9B | 262.144 | Traducción de lenguas clásicas budistas | Apache 2.0 | GGUF y safetensors en Hugging Face |
| Claude Opus 4 | no disponible | no disponible | Modelo general de frontera; según evaluación ciega del autor, igualado o superado en estos pares | Propietaria (API) | Solo API comercial |
| Qwen3.5-9B (base) | ~9B | 262.144 | Modelo general multilingüe, sin especialización en lenguas clásicas | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Es un modelo exclusivo de traducción: no sirve como chatbot general ni para tareas de instrucción variadas; para eso existe la variante `mitra-qwen35-it`.
- Requiere una instrucción de traducción concreta dentro de la plantilla de chat de Qwen, con thinking desactivado; prompts distintos pueden degradar los resultados.
- La cuantización Q4_K_M comete errores apreciables: omite parte del resultado y falla con los diacríticos; usar solo si no hay alternativa.
- Las cuantizaciones más bajas (Q5_K_M y menores) pueden introducir deriva terminológica.
- Los GGUF de este repositorio no incluyen la cabeza MTP de decodificación especulativa; usar `--spec-type draft-mtp` provocará errores.
- Esta es una cuantización no oficial: la documentación autoritativa (receta de entrenamiento, evaluaciones) está en el repositorio de buddhist-nlp.
- Riesgo de alucinación en pasajes corruptos, ambiguos o fuera del dominio budista: no disponible una cuantificación, pero se recomienda revisión experta en contextos académicos.
- Sesgos conocidos: no disponibles datos específicos, aunque el modelo está fuertemente especializado en el dominio budista y puede rendir peor fuera de él.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes; verificar también la licencia del modelo base Qwen3.5 referenciada.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/christian-steinert/mitra-qwen35-translate-GGUF
- Modelo original (documentación autoritativa): https://huggingface.co/buddhist-nlp/mitra-qwen35-translate
- Sección de evaluación del modelo original: https://huggingface.co/buddhist-nlp/mitra-qwen35-translate#evaluation
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Proyecto Dharmamitra: https://dharmamitra.org
- llama.cpp: https://github.com/ggml-org/llama.cpp
