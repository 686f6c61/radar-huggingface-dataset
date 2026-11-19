# kein5/m2m100_418M-onnx-int8

## Resumen

`kein5/m2m100_418M-onnx-int8` es una conversión no oficial a ONNX con cuantización int8 dinámica del modelo de traducción multilingüe `facebook/m2m100_418M`, desarrollado originalmente por Meta AI (FAIR). El modelo base es un transformer encoder-decoder de tipo seq2seq entrenado para traducción directa entre 100 idiomas sin necesidad de pivotar por el inglés. Esta conversión concreta la publica el autor `kein5` como artefacto de soporte para la herramienta local VRCT-VOX (`native/translate-onnx`), no como una release oficial del modelo original.

El interés práctico de esta ficha está en la empaquetadura: los grafos del encoder y del decoder (este último con el primer paso y los pasos con caché fusionados en un único grafo mediante `use_cache_branch`) se exportan con `torch.onnx.export` y se cuantizan dinámicamente a int8 en todas las operaciones MatMul con `quantize_dynamic` de ONNX Runtime. La matriz de vocabulario (embeddings y capa de salida traspuesta) se almacena una sola vez en `vocabulary.data`, lo que reduce el tamaño total del repositorio a unos 0,5 GB.

La verificación del export frente al forward de `transformers` reporta una diferencia máxima de 8,821487426757812e-06, lo que indica una fidelidad numérica alta respecto al modelo original en precisión completa. La licencia es MIT, heredada del modelo fuente, y el tokenizador incluido (`tokenizer.json` y `vocab.json`) produce los mismos ids que el tokenizador original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) exportado a ONNX |
| Parámetros totales | 418M (modelo base `facebook/m2m100_418M`) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 dinámica (ONNX Runtime `quantize_dynamic`) sobre pesos de MatMul |
| Idiomas soportados | no disponible en la información proporcionada (el modelo base m2m100 cubre 100 idiomas, según la documentación de Meta AI; no confirmado en esta ficha) |
| Licencia | MIT |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_merged_quantized.onnx`), más `vocabulary.data`, `tokenizer.json`, `vocab.json` y `manifest.json` |

## Arquitectura y entrenamiento

El modelo subyacente es `facebook/m2m100_418M`, un transformer encoder-decoder de 418 millones de parámetros diseñado para traducción multilingüe directa. Esta conversión no reentrena ni modifica los pesos más allá de la cuantización: exporta las capas propias del modelo a dos grafos ONNX (encoder y decoder). El decoder fusiona en un solo grafo el primer paso de decodificación y los pasos con caché, controlados por la rama `use_cache_branch`, lo que simplifica el despliegue con ONNX Runtime al evitar dos artefactos separados para decodificación con y sin caché.

La cuantización es dinámica a int8 sobre los pesos de todas las operaciones MatMul, aplicada con `quantize_dynamic` de ONNX Runtime. La matriz de vocabulario se deduplica: los embeddings y la capa de salida traspuesta comparten un único almacén (`vocabulary.data`, 131.186.688 bytes). El export se generó con `tools/translation_onnx/export.py` de VRCT-VOX usando onnx 1.23.2, onnxruntime 1.32.0, onnxscript 0.7.2, sentencepiece 0.2.3, tokenizers 0.23.3, torch 2.15.0+cpu y transformers 5.22.1. No se documentan en la información disponible detalles sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF/DPO; esos datos corresponden a la model card de `facebook/m2m100_418M`, no a esta conversión.

## Capacidades

- Traducción automática multilingüe directa entre pares de idiomas, heredada del modelo base m2m100.
- Generación de texto seq2seq condicionada a un idioma origen y un idioma destino.
- Tokenización compatible con el modelo original: `tokenizer.json` y `vocab.json` producen los mismos ids que el tokenizador de `facebook/m2m100_418M`.
- Inferencia con caché de decoder mediante la rama `use_cache_branch` del grafo fusionado.
- Ejecución en CPU y GPU a través de ONNX Runtime, con pesos int8 para reducir huella de memoria.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción local en la aplicación VRCT-VOX: es el caso de uso para el que se creó esta conversión; el modelo se integra en `native/translate-onnx` para traducir texto sin depender de servicios en la nube.
- Traducción de subtítulos y transcripciones en tiempo casi real: el tamaño reducido (0,5 GB de repositorio) y la cuantización int8 permiten ejecutar el modelo en equipos de usuario final, lo que encaja con flujos de subtitulado donde la latencia importa.
- Procesamiento por lotes de documentos multilingües: al ser un modelo seq2seq estándar, se puede invocar desde scripts de ONNX Runtime para traducir corpus completos sin infraestructura de GPU dedicada.
- Integración en pipelines de CI/CD o herramientas de desarrollo: la licencia MIT y el formato ONNX facilitan empotrar el modelo en utilidades de línea de comandos o servicios internos.
- Prototipado de sistemas de traducción en entornos con recursos limitados: la cuantización int8 dinámica reduce el coste de memoria frente al modelo en fp32, lo que permite desplegarlo en máquinas sin GPU de gama alta.
- Evaluación comparativa de calidad de traducción frente al modelo original: al conservar el tokenizador y verificar el export con una diferencia máxima de 8,82e-06, sirve como referencia para medir la degradación introducida por la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,5 GB y los pesos int8 suman aproximadamente 357 MB entre encoder (152.962.633 bytes) y decoder (204.415.021 bytes), más la matriz de vocabulario compartida (131.186.688 bytes).
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado explícitamente; por tamaño de pesos int8 es plausible en GPUs de consumo con suficiente memoria libre, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: ONNX Runtime (es el runtime con el que se generó y verificó la cuantización); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kein5/m2m100_418M-onnx-int8` | 418M | no disponible | ONNX int8 | MIT | Hugging Face (repo de 0,5 GB) |
| `facebook/m2m100_418M` | 418M | no disponible | PyTorch (safetensors/bin) | MIT | Hugging Face (modelo original de Meta AI) |
| Otros modelos de traducción multilingüe de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparado con alternativas, por lo que la comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Conversión no oficial: Meta AI (FAIR) no ha hecho ni respaldado esta conversión; no debe presentarse como release oficial del modelo base.
- La cuantización int8 dinámica introduce una degradación numérica respecto al modelo en precisión completa; el export se verificó con una diferencia máxima de 8,82e-06 antes de cuantizar, pero no se documenta la pérdida de calidad de traducción tras la cuantización.
- No se documentan en la información disponible los sesgos del modelo base ni los riesgos de alucinación específicos de esta conversión; deben evaluarse sobre `facebook/m2m100_418M`.
- La lista de idiomas soportados no está confirmada en esta ficha; la cobertura de 100 idiomas corresponde al modelo base según su documentación original, no a un dato verificado aquí.
- Licencia MIT heredada del modelo fuente: permite uso comercial, pero conviene revisar el texto de `LICENSE` incluido en el repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha pasado por validación comunitaria amplia.
- El modelo está pensado para el pipeline de traducción de VRCT-VOX; su integración en otros sistemas requiere adaptar la invocación de los grafos ONNX y el manejo de la rama `use_cache_branch`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kein5/m2m100_418M-onnx-int8
- Modelo base: https://huggingface.co/facebook/m2m100_418M
- Commit del modelo fuente referenciado: `55c2e61bbf05dfb8d7abccdc3fae6fc8512fd636`
- Proyecto VRCT-VOX (script de exportación `tools/translation_onnx/export.py`): no disponible como enlace en la información proporcionada.
