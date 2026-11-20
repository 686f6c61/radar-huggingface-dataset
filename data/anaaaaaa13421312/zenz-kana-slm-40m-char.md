# anaaaaaa13421312/zenz-kana-slm-40m-char

## Resumen

zenz-kana-slm-40m-char es un modelo de lenguaje pequeño (SLM) de 38 millones de parámetros desarrollado por el usuario anaaaaaa13421312, especializado en la generación de texto exclusivamente en katakana para japonés. Su propósito no es la conversación general, sino servir como componente de un pipeline de conversión kana-kanji: el modelo produce una secuencia en katakana que posteriormente se pasa a un decodificador de kanji como Miwa-Keita/zenz para obtener la salida final en escritura japonesa mixta. Se trata, por tanto, de una pieza intermedia dentro de una arquitectura de dos etapas, no de un asistente autónomo.

Técnicamente es un transformer tipo Llama (LlamaForCausalLM) con embeddings atados (tie_word_embeddings=True), 12 capas, dimensión oculta de 512, 8 cabezas de atención con 4 cabezas KV (GQA) y un vocabulario de solo 512 tokens, lo que explica su reducido tamaño de 38,02M de parámetros. La longitud máxima de secuencia es de 512 tokens. El modelo se distribuye en formato safetensors y está publicado bajo licencia CC-BY-SA 4.0.

Su relevancia es acotada pero clara: demuestra que es posible abordar tareas lingüísticas japonesas específicas con modelos de decenas de millones de parámetros, desplegables en hardware muy modesto, cuando el problema se descompone en subtareas (kana → kanji) en lugar de resolverse de forma monolítica. No obstante, se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni pipeline declarado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, `tie_word_embeddings=True`) |
| Parámetros totales | 38.023.680 (~38,02M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max seq length) |
| Tipos de cuantización | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | japonés (ja), salida restringida a katakana |
| Licencia | CC-BY-SA 4.0 |
| Formato de pesos | safetensors |
| Vocabulario | 512 tokens |
| Capas / dimensión oculta / cabezas | 12 / 512 / 8 Q heads y 4 KV heads (GQA) |
| Tamaño del repositorio | ~0,3 GB |
| Loss de validación SFT / PPL | 1,41302 / 4,108 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama estándar para modelos causales, con atención de múltiples cabezas con consultas agrupadas (8 cabezas de consulta y 4 de clave-valor), 12 capas y una dimensión oculta de 512. La innovación principal, más que arquitectónica, es la restricción del espacio de vocabulario a 512 tokens, lo que reduce drásticamente el número de parámetros de la matriz de embeddings y de la cabeza de salida, y hace viable un modelo funcional con solo 38M de parámetros. Los embeddings de entrada y salida están atados.

El entrenamiento se realizó en dos fases. La fase de preentrenamiento utilizó el corpus hotchpotch/fineweb-2-edu-japanese, un conjunto de texto japonés de carácter educativo. La fase de ajuste supervisado (SFT) se apoyó en dos datasets: llm-jp/oasst2-33k-ja y kunishou/databricks-dolly-15k-ja, ambos en japonés. No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. El autor reporta una pérdida de validación final de SFT de 1,41302 y una perplejidad de 4,108. El modelo está diseñado para emparejarse con el decodificador de kanji Miwa-Keita/zenz-v3.1-small o Miwa-Keita/zenz-v3.2-small-gguf, que convierten la salida en katakana a la escritura japonesa final.

## Capacidades

- Generación de texto en japonés restringida a katakana: el modelo emite secuencias de caracteres katakana, no kanji ni hiragana, como paso intermedio hacia la conversión final.
- Conversión kana-kanji en pipeline: su función principal es alimentar a un decodificador zenz que reconstruye la escritura japonesa mixta.
- Modelado de lenguaje causal: al ser un LlamaForCausalLM, puede usarse para continuación de texto, aunque limitado al alfabeto katakana.
- Vocabulario cerrado de 512 tokens: capacidad de generar únicamente dentro de ese conjunto de caracteres, lo que actúa como restricción dura de salida.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe: el único idioma declarado es el japonés y la salida está limitada a katakana.
- No se documenta modo de razonamiento (thinking), visión ni audio.

## Casos de uso

- Conversión kana-kanji en pipelines de normalización de texto japonés: el modelo genera la secuencia en katakana que un decodificador zenz transforma en escritura mixta, útil para preprocesar corpus o para tareas de reescritura fonética.
- Prototipado de arquitecturas de dos etapas en investigación lingüística: sirve como banco de pruebas para estudiar cómo un modelo de 38M de parámetros con vocabulario restringido se comporta como etapa intermedia antes de un decodificador mayor.
- Generación de lecturas fonéticas (furigana en katakana): dado un contexto, el modelo puede producir la representación en katakana que después se alinea con la forma kanji, aprovechando su vocabulario cerrado de 512 tokens.
- Despliegue en entornos con recursos muy limitados: con 38M de parámetros y pesos safetensors de ~0,3 GB, puede ejecutarse en CPU o en GPU de gama baja para tareas de generación corta (hasta 512 tokens), sin necesidad de infraestructura dedicada.
- Investigación sobre tokenización y vocabularios reducidos: el modelo permite estudiar el efecto de un vocabulario de 512 tokens en la calidad de la generación y en el tamaño final del modelo, como referencia para diseños de SLM.
- Componente educativo o de demostración: por su tamaño reducido y su licencia CC-BY-SA 4.0, puede usarse en docencia o en experimentos reproducibles sobre entrenamiento de modelos japoneses pequeños, siempre citando la autoría y compartiendo las obras derivadas bajo la misma licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado por el autor es la pérdida de validación de SFT (1,41302) y la perplejidad asociada (4,108), que no son comparables directamente con métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (38M de parámetros en fp32 ≈ 0,15 GB de pesos, más activaciones y caché KV para 512 tokens); en la práctica, cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU consumer (por ejemplo, RTX 3060, RTX 4090) o incluso CPU es suficiente. No se dispone de datos específicos de rendimiento en A100 o H100 porque el modelo es demasiado pequeño para aprovechar esas plataformas.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales, e incluso en sistemas integrados.
- Opciones de despliegue: al ser un modelo Llama con pesos safetensors, es compatible con librerías estándar de inferencia (transformers, llama.cpp tras conversión a GGUF, vLLM y TGI en teoría, aunque no se documenta soporte verificado). No se confirma disponibilidad de GGUF en el repositorio.
- Latencia y throughput estimados: no disponibles. Por el tamaño, se espera latencia muy baja en CPU y GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| zenz-kana-slm-40m-char | 38,02M | 512 | ja (katakana) | CC-BY-SA 4.0 | safetensors | Etapa intermedia para decodificador zenz |
| Miwa-Keita/zenz-v3.1-small | no disponible | no disponible | ja | CC-BY-SA 4.0 | no disponible | Decodificador kana-kanji de referencia, etapa posterior del pipeline |
| Miwa-Keita/zenz-v3.2-small-gguf | no disponible | no disponible | ja | CC-BY-SA 4.0 | GGUF | Variante GGUF del decodificador zenz, etapa posterior del pipeline |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos zenz en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y rol dentro del pipeline. No se han identificado otros SLM japoneses de tamaño comparable en la información disponible.

## Limitaciones y advertencias

- Salida restringida a katakana: el modelo no genera kanji ni hiragana, por lo que no es utilizable de forma autónoma para producir texto japonés natural; requiere el decodificador zenz como segunda etapa.
- Contexto muy corto: 512 tokens limitan las tareas a fragmentos breves y descartan aplicaciones que necesiten contexto largo.
- Vocabulario de 512 tokens: cualquier carácter fuera de ese conjunto es inaccesible para el modelo, lo que restringe severamente su expresividad.
- Riesgo de alucinación: como todo modelo de lenguaje generativo, puede producir secuencias de katakana plausibles pero incorrectas; la verificación con el decodificador y con revisión humana es necesaria.
- Sesgos: no se documentan evaluaciones de sesgo; el corpus de preentrenamiento (fineweb-2-edu-japanese) y los datasets de SFT pueden introducir sesgos propios de sus fuentes.
- Licencia CC-BY-SA 4.0: permite uso comercial, pero obliga a atribuir la autoría y a compartir las obras derivadas bajo la misma licencia, lo que puede condicionar su integración en productos propietarios.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin pipeline declarado ni benchmarks publicados; debe tratarse como un artefacto experimental, no como un componente listo para producción.
- Dependencia externa: su valor práctico depende de la disponibilidad y compatibilidad del decodificador zenz, cuyas especificaciones completas no se detallan en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anaaaaaa13421312/zenz-kana-slm-40m-char
- Dataset de preentrenamiento: https://huggingface.co/datasets/anaaaaaa13421312/zenz-kana-slm-pretrain-ja
- Dataset de SFT: https://huggingface.co/datasets/anaaaaaa13421312/zenz-kana-slm-sft-ja
- Corpus de preentrenamiento de origen: https://huggingface.co/datasets/hotchpotch/fineweb-2-edu-japanese
- Dataset de SFT de origen (OASST2 ja): https://huggingface.co/datasets/llm-jp/oasst2-33k-ja
- Dataset de SFT de origen (Dolly 15k ja): https://huggingface.co/datasets/kunishou/databricks-dolly-15k-ja
- Decodificador kana-kanji de referencia: https://huggingface.co/Miwa-Keita/zenz-v3.1-small
- Variante GGUF del decodificador: https://huggingface.co/Miwa-Keita/zenz-v3.2-small-gguf
