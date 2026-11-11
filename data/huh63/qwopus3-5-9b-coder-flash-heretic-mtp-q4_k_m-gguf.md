# hUh63/Qwopus3.5-9B-Coder-Flash-Heretic-MTP-Q4_K_M-GGUF

## Resumen

Qwopus3.5-9B-Coder-Flash-Heretic-MTP-Q4_K_M-GGUF es una cuantización GGUF en formato Q4_K_M del modelo groxaxo/Qwopus3.5-9B-Coder-Flash-Heretic, un experimento comunitario derivado de Jackrong/Qwopus3-5-9B-Coder-Flash. El modelo base es un transformer multimodal de tipo Qwen3.5 con 9.197.093.888 parámetros (aproximadamente 9,2 mil millones), orientado a generación de código, razonamiento y uso de herramientas, que ha sido sometido a un proceso de "abliteration" mediante la herramienta heretic (Arbitrary-Rank Ablation) para reducir deliberadamente su alineamiento de seguridad. Esta ficha describe la conversión y cuantización publicada por hUh63, no el modelo original.

La característica técnica más destacable de esta publicación es la preservación de la cabeza MTP (multi-token prediction) dentro del mismo archivo GGUF. El export de heretic había omitido los 15 tensores `mtp.*`, que fueron restaurados desde el checkpoint base y verificados byte a byte contra Jackrong/Qwopus3-5-9B-Coder-Flash. El convertidor de llama.cpp los mapea a `blk.32.nextn.*`, elevando el número de bloques de 32 a 33 y habilitando decodificación especulativa autocontenida con `--spec-type draft-mtp`, sin necesidad de un modelo borrador separado.

El resultado es un archivo de 6,7 GB que combina tronco de texto cuantizado, cabeza MTP en Q6_K y un proyector de visión F16 separado, pensado para inferencia en CPU o GPU de gama media con llama.cpp. Es relevante para quienes necesitan un modelo de código multilingüe con capacidades multimodales y sin filtros de seguridad, ejecutable en hardware modesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal tipo Qwen3.5 con capa NextN/MTP embebida (33 bloques) |
| Parámetros totales | 9.197.093.888 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (archivo principal), F16 (mmproj de visión); MTP en Q6_K, normas en F32 |
| Idiomas soportados | en, zh, ko, ru, ja, es, fr |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con mmproj F16 separado para visión |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de la familia Qwen3.5 con 9,2 mil millones de parámetros y arquitectura multimodal image-text-to-text. Incorpora una cabeza de predicción multi-token (MTP / NextN) de una sola capa (`mtp_num_hidden_layers = 1`) que actúa como borrador interno para decodificación especulativa. El export de heretic omitió originalmente los 15 tensores `mtp.*`; el autor de esta cuantización los restauró desde el checkpoint base y verificó que son idénticos byte a byte a los de Jackrong/Qwopus3-5-9B-Coder-Flash. El proceso de conversión con `convert_hf_to_gguf.py` (`_QwenMtpMixin`) eleva `block_count` de 32 a 33 y mapea los tensores a `blk.32.nextn.*`, `blk.32.attn_*` y `blk.32.ffn_*`, dejando `qwen35.nextn_predict_layers = 1` en el archivo.

La cuantización se realizó en CPU (8 núcleos, 16 GiB de RAM, sin GPU) con llama.cpp en el commit `ccd360f`. El flujo fue: conversión a GGUF BF16 con la cabeza MTP incluida, cálculo de una importance matrix a partir de un corpus multilingüe (en/zh/ko/ru/ja/es/fr) con matemáticas, código Python/C++/TypeScript y razonamiento paso a paso, recogida con `--nextn` para cubrir la capa MTP, y cuantización final a Q4_K_M con overrides por tensor. Los tensores `blk.32.*` se promovieron a Q6_K (coste aproximado de 45 MiB) para mantener alta la tasa de aceptación del borrador, y el mmproj se mantuvo en F16. El proceso de "heretic" (Arbitrary-Rank Ablation, versión 2.1.0.dev0) redujo deliberadamente el alineamiento de seguridad del modelo base; no se dispone de información sobre el volumen de tokens de entrenamiento ni sobre las etapas de RLHF/DPO del modelo original.

## Capacidades

- Generación de texto y razonamiento paso a paso (el corpus de calibración incluye pruebas matemáticas y cadenas de razonamiento).
- Generación y edición de código en múltiples lenguajes (Python, C++, TypeScript aparecen explícitamente en el corpus de calibración).
- Capacidades multimodales de imagen a texto mediante el proyector `mmproj-f16.gguf` y `llama-mtmd-cli`.
- Tool calling y function calling (etiquetas `tool-use` y `function-calling` declaradas por el autor).
- Decodificación especulativa autocontenida con la cabeza MTP integrada (`--spec-type draft-mtp`), sin modelo borrador externo.
- Soporte multilingüe en inglés, chino, coreano, ruso, japonés, español y francés.
- Comportamiento "uncensored / decensored / abliterated": el alineamiento de seguridad ha sido reducido de forma deliberada.
- Conversación multi-turno (etiqueta `conversational`).

## Casos de uso

- Asistencia de código en local sin GPU dedicada: el archivo Q4_K_M de 6,7 GB cabe en 16 GiB de RAM y se ejecuta con llama.cpp en CPU; la cabeza MTP integrada acelera la generación con decodificación especulativa sin descargar un segundo modelo.
- Autocompletado y generación de funciones en pipelines de CI/CD: el soporte de tool calling permite integrar el modelo en flujos que invocan linters, compiladores o APIs de pruebas, con el modelo emitiendo llamadas estructuradas.
- Análisis de capturas de pantalla o diagramas técnicos: mediante `llama-mtmd-cli` y el mmproj F16, el modelo puede describir imágenes y extraer información de diagramas de arquitectura o interfaces.
- Traducción y asistencia multilingüe entre los siete idiomas soportados (en, zh, ko, ru, ja, es, fr), útil en equipos distribuidos o en documentación técnica internacional.
- Razonamiento matemático y resolución de problemas paso a paso en entornos educativos o de prototipado, aprovechando el entrenamiento orientado a cadenas de razonamiento.
- Experimentación en investigación sobre alineamiento y seguridad: al ser un modelo abliterated, sirve como caso de estudio controlado para medir el efecto de la reducción de alineamiento en tareas de código y razonamiento.
- Despliegue en estaciones de trabajo con GPU de consumo: el tamaño cuantizado permite ejecutarlo en GPUs con 8-12 GB de VRAM, con el mmproj cargado en paralelo para tareas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta una medición de la decodificación especulativa en CPU: con 8 núcleos, `--spec-type draft-mtp`, 128 tokens y un prompt de código, se aceptaron 74 de 159 tokens borrador (46,5 %), con una longitud media de aceptación de 2,40. Esta cifra mide la tasa de aceptación del borrador MTP, no la calidad del modelo.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo Q4_K_M ocupa 6,7 GB; se recomienda al menos 8 GB de RAM o VRAM libres para el tronco de texto, más aproximadamente 1 GB adicional para el mmproj F16 si se usa visión.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090; en el segmento profesional, A100 o H100 para mayor throughput, aunque el modelo es sobredimensionado para ellas.
- Cabe en GPU de consumo: sí, en tarjetas con 8-12 GB de VRAM o más, usando offload parcial o total con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama-mtmd-cli` para visión). No se ha verificado compatibilidad con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponible de forma general; la única medición publicada es la tasa de aceptación del borrador MTP (46,5 %, longitud media 2,40) en CPU de 8 núcleos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwopus3.5-9B-Coder-Flash-Heretic-MTP-Q4_K_M (este) | 9,2 B | no disponible | apache-2.0 | GGUF Q4_K_M + mmproj F16 | MTP embebido, abliterated, multimodal |
| Jackrong/Qwopus3-5-9B-Coder-Flash | 9,2 B | no disponible | no disponible | safetensors | Modelo base original, sin abliteration |
| groxaxo/Qwopus3.5-9B-Coder-Flash-Heretic | 9,2 B | no disponible | apache-2.0 | safetensors | Versión heretic sin cuantizar |
| joeblowma/Qwopus3.5-9B-Coder-MTP-GGUF | no disponible | no disponible | no disponible | GGUF | Cuantización previa con MTP, referenciada por el autor |

## Limitaciones y advertencias

- La decodificación especulativa es sin pérdidas, pero la cuantización Q4_K_M no: existe una pérdida de precisión inevitable frente al BF16 de origen.
- El modelo ha sido sometido a "abliteration" con heretic, lo que reduce deliberadamente su alineamiento de seguridad; puede generar contenido que otros modelos rechazarían, y el usuario es responsable del uso legal que haga de él.
- La cabeza MTP proviene del checkpoint base no decensurado; solo propone tokens borrador que el tronco decensurado verifica, por lo que no altera el comportamiento del modelo, pero la tasa de aceptación varía según el prompt y los parámetros de muestreo.
- No se dispone de información sobre la longitud de contexto máxima soportada.
- No se dispone de datos de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros), por lo que no es posible comparar su rendimiento de forma objetiva.
- El modelo es una contribución comunitaria sin revisión por pares; su robustez en producción no está validada.
- La licencia apache-2.0 se hereda del modelo base, pero conviene verificar las condiciones del checkpoint original de Jackrong antes de un uso comercial.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hUh63/Qwopus3.5-9B-Coder-Flash-Heretic-MTP-Q4_K_M-GGUF
- Modelo base heretic: https://huggingface.co/groxaxo/Qwopus3.5-9B-Coder-Flash-Heretic
- Modelo base original: https://huggingface.co/Jackrong/Qwopus3-5-9B-Coder-Flash
- Cuantización de referencia con MTP: https://huggingface.co/joeblowma/Qwopus3.5-9B-Coder-MTP-GGUF
- Herramienta heretic: https://github.com/p-e-w/heretic
- Licencia: https://huggingface.co/groxaxo/Qwopus3.5-9B-Coder-Flash-Heretic/raw/main/LICENSE
