# ml-intern-internal/ml-eval-c4-tokenizer-8a91c9-r0

## Resumen

`ml-intern-internal/ml-eval-c4-tokenizer-8a91c9-r0` no es un modelo de lenguaje, sino un repositorio destinado a alojar un tokenizador de tipo byte-level BPE con un vocabulario objetivo de 32.000 tokens, entrenado sobre un millón de documentos del corpus C4 (configuración `en`, split `train`). Lo desarrolla el espacio de trabajo interno `ml-intern-internal` como artefacto de una tarea de evaluación de la herramienta ML Intern, y sigue la receta clásica de GPT-2 implementada con la librería `tokenizers` de Hugging Face.

El estado real del repositorio es relevante: la model card indica explícitamente que el script de entrenamiento está listo pero la ejecución no se ha producido, porque el token de sesión no tenía permisos de Jobs (error 403) ni de escritura en la organización `GuillaumeSalouHF`. Por tanto, no existen todavía `tokenizer.json`, `tokenizer_config.json` ni `special_tokens_map.json`, y las métricas de compresión (chars/token) que se imprimirían en el log no están publicadas.

Su interés es, por tanto, documental y metodológico: describe con precisión un pipeline reproducible de entrenamiento de tokenizadores (streaming de shards, prefetch, conjunto de evaluación disjunto, aserciones de round-trip y de tamaño de vocabulario) que sirve como referencia para quien necesite construir un tokenizador byte-level BPE sobre C4 sin depender de implementaciones opacas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tokenizador byte-level BPE (no es un modelo neuronal) |
| Parámetros totales | no disponible (no aplica) |
| Parámetros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica a un tokenizador) |
| Tipos de cuantización | no disponible (no aplica) |
| Idiomas soportados | no disponibles; el corpus de entrenamiento es C4 `en` (inglés) |
| Licencia | ODC-By (Open Data Commons Attribution) |
| Formato de pesos | `tokenizer.json` (formato nativo de `tokenizers`), `tokenizer_config.json` y `special_tokens_map.json` (vía `PreTrainedTokenizerFast`) — pendientes de generación |
| Vocabulario objetivo | 32.000 tokens |
| Pre-tokenizador | `ByteLevel` con `add_prefix_space=False` y regex de GPT-2 |
| Alfabeto inicial | 256 bytes completos |
| Frecuencia mínima | 2 |
| Tokens especiales | `<pad>`, `<bos>`, `<eos>` |
| Dataset de entrenamiento | 1.000.000 de documentos de `allenai/c4`, config `en`, split `train` |
| Tamaño de datos | ~960 MB (shards `en/c4-train.00000…00002-of-01024.json.gz`) |
| Conjunto de evaluación | 1.000 documentos reservados (cola del último shard, disjuntos) |

## Arquitectura y entrenamiento

El artefacto es un tokenizador, no una red neuronal: no hay transformer, MoE ni SSM. La receta es byte-level BPE al estilo GPT-2: se parte del alfabeto completo de 256 bytes (lo que garantiza cobertura de cualquier cadena UTF-8 sin tokens `<unk>`), se aplica un pre-tokenizador `ByteLevel` con la regex de GPT-2 y `add_prefix_space=False`, y se realizan fusiones BPE hasta alcanzar un vocabulario de 32.000 entradas con `min_frequency=2`. Se reservan tres tokens especiales: `<pad>`, `<bos>` y `<eos>`.

El entrenamiento consume un millón de documentos en orden desde los tres primeros shards de C4 en inglés, con prefetch del siguiente shard mientras se parsea el actual y sin reutilización de documentos. La evaluación se hace sobre 1.000 documentos retenidos de la cola del último shard, disjuntos del entrenamiento, y reporta compresión en caracteres por token, además de una aserción de round-trip encode→decode y una aserción de tamaño de vocabulario que solo se aplica en ejecuciones completas. El pipeline está parametrizado por variables de entorno (`NUM_DOCS`, `VOCAB_SIZE`, `PUSH`, `HUB_ID`, `OUT_DIR`, `TMP_DIR`) y admite una ejecución de humo con `NUM_DOCS=2000`.

Cabe subrayar que la model card declara el estado como "training script ready; the run itself has not happened yet": el token de sesión no pudo enviar trabajos de cómputo (403, sin permiso de Jobs) ni escribir en `GuillaumeSalouHF`, de modo que el repositorio se creó bajo `ml-intern-internal` como destino alternativo. Los ficheros del tokenizador se generarán cuando haya un token con acceso a Jobs.

## Capacidades

- Tokenización byte-level BPE con cobertura completa de UTF-8 gracias al alfabeto inicial de 256 bytes.
- Segmentación de texto en inglés acorde al dominio de C4 (texto web limpiado).
- Compresión medible en caracteres por token sobre un conjunto de evaluación retenido.
- Round-trip garantizado por aserción: `decode(encode(texto)) == texto`.
- Gestión de tokens especiales `<pad>`, `<bos>` y `<eos>` para su uso en pipelines de `transformers`.
- Compatibilidad con `PreTrainedTokenizerFast`, lo que permite cargarlo con `AutoTokenizer`.
- Reproducibilidad del pipeline mediante variables de entorno y ejecución local o como HF Job en `cpu-upgrade`.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni multilingüismo más allá de lo que el byte-level permita por construcción.

## Casos de uso

- Construcción de un tokenizador de referencia para modelos pequeños entrenados desde cero sobre C4 en inglés: el script produce un vocabulario de 32.000 tokens alineado con la receta de GPT-2, adecuado para modelos de menos de 1.000 millones de parámetros que necesitan un vocabulario compacto.
- Evaluación comparativa de tokenizadores: la métrica de chars/token sobre 1.000 documentos retenidos permite contrastar este vocabulario con el de GPT-2 (50.257 tokens) o con SentencePiece sobre el mismo corpus, controlando la fuga de datos mediante un split disjunto.
- Reproducción de experimentos docentes o de investigación: el pipeline es ejecutable en local con unos pocos GB de RAM y Python 3.10+, lo que facilita replicar el entrenamiento en un portátil o en un Job de 8 vCPU por 0,03 USD/hora.
- Auditoría de pipelines de datos: el mecanismo de streaming con prefetch y la ausencia de reutilización de documentos sirven como plantilla para procesar corpus grandes sin cargarlos íntegramente en memoria.
- Integración en flujos de `transformers`: al publicarse como `PreTrainedTokenizerFast`, puede cargarse con `AutoTokenizer.from_pretrained` y usarse en tareas de preprocesado, conteo de tokens y análisis de fertilidad de vocabulario.
- Base para tokenizadores de dominio específico: los parámetros `NUM_DOCS` y `VOCAB_SIZE` permiten reentrenar sobre subconjuntos de C4 (por ejemplo, sólo documentación técnica) manteniendo la misma arquitectura byte-level.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las métricas de compresión (chars/token) se imprimen en el log de ejecución y se escriben en el README publicado, pero al no haberse ejecutado el entrenamiento no existen valores que reportar. Tampoco hay datos de latencia o throughput del tokenizador.

## Requisitos de hardware

- VRAM: no aplica; es un tokenizador y se ejecuta en CPU.
- RAM: unos pocos GB libres para la ejecución local según la model card; el shard individual de C4 ronda los 320 MB y el conjunto de tres shards ~960 MB.
- CPU: cualquier máquina con Python 3.10+; para la ejecución como HF Job se recomienda el flavor `cpu-upgrade` (8 vCPU).
- GPU: no necesaria en ningún caso.
- Despliegue: carga mediante `tokenizers` (fichero `tokenizer.json`) o `transformers` (`AutoTokenizer` con `tokenizer_config.json` y `special_tokens_map.json`). No aplican vLLM, llama.cpp, Ollama ni TGI, que sirven modelos generativos.
- Latencia y throughput: no disponibles; dependen del hardware y del texto de entrada, y no se han publicado mediciones.
- Coste estimado del entrenamiento completo: por debajo de una hora en `cpu-upgrade` a 0,03 USD/hora, según la propia model card.

## Comparativa con modelos similares

| Tokenizador | Vocabulario | Método | Corpus | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio | 32.000 (objetivo) | Byte-level BPE (GPT-2) | C4 `en`, 1M documentos | ODC-By | Pesos no publicados (entrenamiento pendiente) |
| GPT-2 tokenizer | 50.257 | Byte-level BPE | WebText (no publicado) | MIT (código y pesos GPT-2) | Disponible en `openai-community/gpt2` |
| Llama 2 tokenizer | 32.000 | BPE con SentencePiece | Corpus multilingüe no detallado | Llama 2 Community License | Disponible en `meta-llama/Llama-2-7b` |
| T5 tokenizer | 32.000 | SentencePiece Unigram | C4 (versión multilingüe/inglesa) | Apache 2.0 | Disponible en `google-t5/t5-base` |

La comparación es estructural: coinciden en tamaño de vocabulario con Llama 2 y T5, pero difieren en algoritmo (BPE byte-level frente a SentencePiece) y en dominio de entrenamiento (C4 en inglés frente a corpus multilingües o no documentados). No hay datos de compresión comparables publicados para este repositorio.

## Limitaciones y advertencias

- El artefacto no existe todavía: el repositorio no contiene `tokenizer.json` ni los ficheros de configuración, por lo que no puede cargarse con `AutoTokenizer` en su estado actual.
- No es un modelo de lenguaje: no genera texto, no razona, no escribe código y no soporta tool calling ni agentes. Cualquier uso en esos términos es un error de categoría.
- El entrenamiento se realizó (o se realizará) únicamente sobre C4 en inglés; el comportamiento sobre castellano u otros idiomas no está evaluado y la fertilidad del vocabulario será previsiblemente peor fuera del inglés.
- C4 es un corpus de web crawleada con sesgos conocidos de dominio, registro y demografía; esos sesgos se reflejan en las fusiones BPE aprendidas.
- La licencia ODC-By exige atribución; es una licencia de datos, no de software, y conviene verificar su compatibilidad con el uso comercial previsto y con las licencias del corpus C4 subyacente.
- No se han publicado métricas de compresión ni de cobertura, de modo que no es posible validar empíricamente la calidad del vocabulario antes de ejecutar el script.
- El pipeline depende de descargar shards de C4 desde el Hub; en entornos sin red o con cuotas restrictivas la ejecución fallará.
- La fecha de creación del repositorio (2026-11-12) y el estado declarado sugieren un artefacto de evaluación interna, no un recurso mantenido para producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ml-intern-internal/ml-eval-c4-tokenizer-8a91c9-r0
- Dataset C4: https://huggingface.co/datasets/allenai/c4
- Paper de C4 (Raffel et al., 2019): https://arxiv.org/abs/1910.10683
- Librería `tokenizers`: https://github.com/huggingface/tokenizers
- Librería `transformers`: https://github.com/huggingface/transformers
- Documentación de HF Jobs: https://huggingface.co/docs/huggingface_hub/guides/jobs
- ML Intern (chat): https://hf.co/chat?mode=ml-intern
