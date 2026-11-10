# ABDULHODIY/uzbek-base-cpt

## Resumen

`ABDULHODIY/uzbek-base-cpt` es un modelo de lenguaje base en uzbeko, desarrollado por el usuario ABDULHODIY, obtenido mediante preentrenamiento continuado (continued pretraining, CPT) sobre el checkpoint `IslombekT/uzbek-gpt-103m`. El objetivo es especializar un modelo pequeño en uzbeko limpio: el autor informa de 0,236 mil millones de tokens procesados sobre un total planificado de 15.258 pasos de entrenamiento (1.800 completados, aproximadamente el 12 % del plan). Es relevante en el contexto de los modelos de bajos recursos: el uzbeko dispone de pocos corpus de calidad y este trabajo documenta de forma explícita la composición del dataset, las fases de limpieza y las métricas de validación por fuente.

Arquitectonicamente es un transformer decoder-only con RoPE, RMSNorm y SwiGLU, de 16 capas, contexto de 2.048 tokens y un tokenizer BPE específico para uzbeko de 16.000 entradas (`uzbek-bpe-16k`), con dígitos tokenizados individualmente. El repositorio safetensors declara 146.940.768 parámetros totales, cifra que no coincide exactamente con los 139M que anuncia la model card; conviene tratar ambos valores como referencia y verificar el config real antes de desplegar.

Se trata de un modelo exclusivamente base: continúa texto, no responde preguntas ni mantiene conversaciones. Para uso conversacional requiere un fine-tuning SFT posterior. Su licencia Apache 2.0 permite uso comercial, pero su tamaño y estado de entrenamiento (12 % del plan) limitan seriamente su utilidad en producción sin ajuste adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, RoPE, RMSNorm, SwiGLU, 16 capas |
| Parametros totales | 146.940.768 (safetensors); la model card indica 139M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (RoPE escalado x2.0) |
| Tipos de cuantizacion | no disponible (repo solo con pesos safetensors en fp16/bf16 presumiblemente; el autor no documenta GGUF ni otras) |
| Idiomas soportados | uzbeko (uz) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo parte de `IslombekT/uzbek-gpt-103m` y aplica continued pretraining con 0,236 mil millones de tokens sobre 2 × Tesla T4 con DDP, fp16 y GradScaler. La arquitectura es un transformer decoder-only con RoPE (escalado ×2.0 para extender el contexto a 2.048 tokens), RMSNorm, SwiGLU y 16 capas con "darvozali chuqurlik kengaytmasi" (expansión de profundidad con compuertas) según la descripción del autor, además de una proyección de atención propia. El tokenizer `uzbek-bpe-16k` reserva 64 tokens para chat, lo que facilita un SFT posterior.

El corpus combina nueve fuentes con proporciones documentadas: libros (`tahrirchi/uz-books-v2`, 34,2 % de los tokens), HPLT 2.0 (16,2 %), FineWeb-2 (11,2 %), noticias de `tahrirchi/uz-crawl` (13,0 %), mC4 (7,2 %), CulturaX (5,2 %), Wikipedia (7,0 %), corpus legal (`sukhrobnurali/uzbek-legal-corpus`, 4,0 %) y un segundo corpus de noticias (1,8 %). El pipeline de limpieza incluye normalización Unicode NFC, normalización de apóstrofos uzbecos (`oʻ`, `gʻ`, `ʼ`), eliminación de URLs, correos y teléfonos, filtrado de líneas publicitarias y menús, corrección de saltos OCR en libros, filtros de calidad (longitud de palabra, proporción de dígitos y mayúsculas, n-gramas repetidos), verificación de idioma que rechaza mezclas de cirílico/ruso, inglés y turco, deduplicación global de párrafos con filtro Bloom persistente entre sesiones y eliminación de párrafos que se solapan con los ejemplos de evaluación.

## Capacidades

- Generación y continuación de texto en uzbeko: completa documentos, artículos y pasajes narrativos a partir de un prefijo.
- Modelado de lenguaje base: útil como punto de partida para SFT, no para instrucciones directas.
- Cobertura de registros: libros, prensa, textos legales, enciclopedia y web, con proporciones declaradas por el autor.
- Tokenización específica de uzbeko con dígitos separados (`42` → `4 2`), que afecta el razonamiento aritmético.
- 64 tokens reservados para chat, pensados para un SFT conversacional posterior.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- Multilingüismo limitado: solo uzbeko; el pipeline de datos rechaza explícitamente texto en cirílico/ruso, inglés y turco.

## Casos de uso

- Punto de partida para SFT en uzbeko: el modelo está diseñado para recibir un fine-tuning supervisado posterior (el autor referencia `train_uzbek_chat.py` con `BASE_REPO = "ABDULHODIY/uzbek-base-cpt"`); es adecuado por su tokenizer nativo y su corpus limpio.
- Completado de texto editorial en uzbeko: continuación de artículos, notas de prensa o descripciones de producto a partir de un prefijo, aprovechando la proporción alta de libros y noticias en el corpus.
- Experimentos académicos de bajos recursos: sirve como baseline reproducible para estudiar CPT en uzbeko con métricas bits-per-byte por fuente.
- Preentrenamiento de modelos derivados: al ser Apache 2.0 y safetensors, se puede usar como inicialización para modelos mayores o para destilación.
- Evaluación de tokenizers: el tokenizer `uzbek-bpe-16k` con dígitos separados permite medir el impacto de decisiones de tokenización en tareas numéricas.
- Generación de borradores de texto legal o administrativo: la fuente legal muestra la mayor mejora en bits-per-byte (de 2,341 a 0,727), aunque el volumen es pequeño (1.859 documentos aceptados) y el modelo no está ajustado para instrucciones.
- Filtrado y puntuación de corpus: el modelo puede usarse para calcular perplejidad o bits-per-byte sobre texto uzbeko y descartar documentos de baja calidad en pipelines de curación de datos.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). La única evaluación disponible es bits-per-byte por fuente, medida sobre aproximadamente el 1 % de cada fuente reservado como test y nunca visto en entrenamiento:

| Fuente | Antes | Después | Cambio |
|---|---|---|---|
| books | 1,614 | 1,270 | -0,343 |
| hplt | 1,250 | 1,035 | -0,216 |
| fineweb | 1,090 | 0,963 | -0,127 |
| news | 1,186 | 0,849 | -0,336 |
| mc4 | 1,374 | 0,917 | -0,457 |
| culturax | 1,258 | 0,929 | -0,329 |
| wiki | 1,475 | 1,081 | -0,394 |
| legal | 2,341 | 0,727 | -1,614 |
| news2 | 1,252 | 0,962 | -0,290 |

Las muestras cualitativas del autor (preguntas inventadas con secuencias de 8 palabras eliminadas del corpus) muestran que el modelo continúa texto de forma fluida pero no responde correctamente a preguntas de aritmética ni de razonamiento temporal, lo que confirma su naturaleza de modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~147M parámetros, en fp16 ocupa aproximadamente 0,3 GB de pesos; en fp32 unos 0,6 GB. El repositorio ocupa 10,6 GB, lo que sugiere que puede contener checkpoints adicionales además de los pesos finales.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; el autor entrenó con 2 × Tesla T4, lo que indica que la inferencia cabe holgadamente en T4, A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en GTX 1060 6 GB, RTX 3060, RTX 4060 y cualquier GPU moderna con 4 GB o más.
- Opciones de despliegue: PyTorch nativo (transformers), llama.cpp/Ollama si se convierte a GGUF (no hay GGUF publicado), vLLM y TGI son viables por tamaño, aunque no están documentados por el autor.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| ABDULHODIY/uzbek-base-cpt | ~147M (card: 139M) | 2.048 | Apache 2.0 | Base, CPT al 12 % del plan | Tokenizer uzbeko BPE 16k |
| IslombekT/uzbek-gpt-103m | ~103M | no disponible | no disponible | Base original | Modelo de partida |
| Modelos multilingües tipo mT5-small / XLM-R base | 300M-278M | 512-514 | Apache 2.0 / MIT | Base multilingüe | No especializados en uzbeko |
| GPT-2 small | 124M | 1.024 | MIT | Base inglés | No soporta uzbeko |

La comparación con alternativas específicas para uzbeko es limitada porque el ecosistema de modelos base en este idioma es reducido; no se dispone de datos de rendimiento comparables más allá del bits-per-byte reportado por el propio autor.

## Limitaciones y advertencias

- Modelo exclusivamente base: no responde preguntas, no sigue instrucciones y no mantiene diálogos; requiere SFT para cualquier uso conversacional.
- Entrenamiento incompleto: solo se completaron 1.800 de 15.258 pasos (~12 % del plan), por lo que el modelo está infraentrenado respecto al objetivo del autor.
- Contexto corto: 2.048 tokens limita tareas de documento largo, RAG con muchos fragmentos y conversaciones multi-turno extensas.
- Tokenización de dígitos separados: `42` se tokeniza como `4 2`, lo que degrada el rendimiento aritmético y la coherencia numérica, como muestran las generaciones de ejemplo.
- Riesgo alto de alucinación y de continuaciones incoherentes: las muestras publicadas contienen respuestas sin sentido a preguntas simples.
- Sesgos de corpus: fuerte peso de libros (34,2 %) y prensa, con presencia limitada de texto legal; puede reflejar sesgos editoriales y de registro de esas fuentes.
- Cobertura monolingüe: solo uzbeko; el pipeline rechaza cirílico/ruso, inglés y turco, por lo que no sirve para mezclas de idiomas.
- Discrepancia de parámetros: la model card indica 139M y safetensors declara 146.940.768; verificar el config antes de planificar recursos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni documentación sobre procedencia y derechos de los corpus de terceros utilizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ABDULHODIY/uzbek-base-cpt
- Modelo base: https://huggingface.co/IslombekT/uzbek-gpt-103m
- Tokenizer: https://huggingface.co/IslombekT/uzbek-bpe-16k
- Dataset de libros: https://huggingface.co/datasets/tahrirchi/uz-books-v2
- Dataset HPLT 2.0: https://huggingface.co/datasets/HPLT/HPLT2.0_cleaned
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset uz-crawl: https://huggingface.co/datasets/tahrirchi/uz-crawl
- Dataset mC4: https://huggingface.co/datasets/allenai/c4
- Dataset CulturaX: https://huggingface.co/datasets/uonlp/CulturaX
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Corpus legal: https://huggingface.co/datasets/sukhrobnurali/uzbek-legal-corpus
- Dataset de noticias: https://huggingface.co/datasets/MLDataScientist/Uzbek_news_dataset
