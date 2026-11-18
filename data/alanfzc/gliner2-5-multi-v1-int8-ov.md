# alanfzc/gliner2.5-multi-v1-int8-ov

## Resumen

`alanfzc/gliner2.5-multi-v1-int8-ov` es una exportación a OpenVINO con cuantización INT8 del codificador mDeBERTa-v3 del modelo [`fastino/gliner2.5-multi-v1`](https://huggingface.co/fastino/gliner2.5-multi-v1), un extractor de entidades nombradas basado en GLiNER2. El paquete incluye además las cabezas de tarea originales (boundary head, classifier, record decoder y relation scorer) y el tokenizador, de modo que es autocontenido y puede ejecutarse sin depender del checkpoint original en PyTorch. Lo publica el usuario `alanfzc` bajo licencia Apache-2.0.

El objetivo declarado es ejecutar la parte pesada del modelo (el codificador, que concentra 277,5 M de los 287 M de parámetros) sobre OpenVINO en CPU, GPU o, de forma destacada, en la NPU integrada de Intel (por ejemplo, en procesadores Intel Core Ultra). Esto permite extraer entidades de documentos y código en el momento de la ingesta, en local, sin GPU dedicada y sin enviar texto a servicios externos. El modelo es multilingüe, con inglés y español probados explícitamente.

La relevancia actual reside en la combinación de tres factores: la compresión de pesos a INT8 reduce el tamaño de 1,1 GB (checkpoint original) a 299 MB, el soporte de NPU abre la inferencia en portátiles y equipos de borde, y la integración con GLiNER2 mantiene el pipeline de decodificación de spans original, de modo que los resultados siguen al modelo base. No es, sin embargo, un checkpoint compatible con `AutoExtractor.from_pretrained`: requiere el loader incluido en el repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder mDeBERTa-v3-base (DebertaV2) + cabezas GLiNER2 (boundary head, classifier, record decoder, relation scorer) |
| Parámetros totales | 287 M (codificador: 277,5 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (forma estática `[1, 512]`; entradas más largas lanzan error) |
| Tipos de cuantización | INT8 asimétrico por canal en pesos (`INT8_ASYM`, `nncf.compress_weights`); activaciones en coma flotante |
| Idiomas soportados | Multilingüe; inglés y español probados explícitamente |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`openvino_model.xml` + `openvino_model.bin`) para el codificador; `heads.safetensors` (fp16) para las cabezas |

## Arquitectura y entrenamiento

La arquitectura subyacente es GLiNER2, un modelo de extracción de información de tipo token-classification que combina un codificador transformer (mDeBERTa-v3-base) con cabezas específicas de tarea. El flujo es el siguiente: el texto y las etiquetas de entidad se preprocesan en CPU con PyTorch (división en palabras y prompt con tokens `[E]` de etiqueta); el resultado se pasa al codificador OpenVINO, que devuelve el `last_hidden_state`; finalmente, la boundary head y la decodificación de spans se ejecutan en CPU con PyTorch usando los pesos originales. Solo el codificador se sustituye por la versión OpenVINO; el resto del código y pesos de GLiNER2 permanece intacto.

La conversión se realizó con `openvino.convert_model` sobre una traza fp32 del codificador (entradas `input_ids` y `attention_mask`) y la compresión con `nncf.compress_weights` en modo `INT8_ASYM`, por canal, sobre las 73 capas de pesos. No se utiliza calibración de datos: las activaciones se mantienen en coma flotante, lo que simplifica el proceso pero limita el ahorro a los pesos. El IR se reconfigura a forma estática `[1, 512]` al cargarse, porque la NPU exige formas fijas; las entradas más cortas se rellenan con máscara y solo se devuelven los tokens válidos. Se ofrece caché de compilación (`cache_dir`) para almacenar el blob compilado de la NPU y evitar la compilación (aproximadamente un minuto) en cargas posteriores. No se dispone de información sobre el dataset de entrenamiento original del modelo base ni sobre si se aplicó RLHF o DPO.

## Capacidades

- Extracción de entidades nombradas (NER) zero-shot o guiada por etiquetas: el usuario especifica las categorías (persona, empresa, producto, localización, tecnología, clase, etc.) y el modelo devuelve spans con confianza.
- Extracción de información estructurada a partir de texto no estructurado, con soporte de spans y puntuaciones de confianza (`include_confidence`, `include_spans`).
- Procesamiento multilingüe, con inglés y español verificados.
- Extracción sobre documentos y código fuente en el momento de la ingesta.
- Ejecución en local sobre CPU, GPU o NPU de Intel mediante OpenVINO.
- No se documentan capacidades de generación de texto, razonamiento general, matemáticas, tool calling, agentes, visión ni audio: el modelo es un extractor de entidades, no un LLM generativo.

## Casos de uso

- Ingesta de documentos con extracción de entidades en local: el modelo procesa cada documento al indexarlo y devuelve personas, organizaciones y localizaciones sin enviar texto a la nube, gracias a la ejecución en NPU o CPU.
- Anonimización o etiquetado previo de datos personales: se ejecuta en el equipo del analista para detectar nombres y entidades sensibles antes de almacenar o compartir el texto, con la ventaja de que no hay dependencia de servicios externos.
- Extracción de entidades en código fuente: permite identificar tecnologías, clases y sistemas mencionados en repositorios o documentación técnica durante pipelines de análisis estático.
- Procesamiento de corpus multilingües en español e inglés: adecuado para equipos que trabajan con documentación en ambos idiomas y necesitan un único modelo con etiquetas configurables.
- Despliegue en equipos de borde o portátiles con Intel Core Ultra: la compilación en NPU y el tamaño reducido (299 MB) permiten ejecutar la extracción en hardware sin GPU dedicada.
- Enriquecimiento de bases de conocimiento o motores de búsqueda: la salida con spans y confianza facilita la construcción de índices de entidades y relaciones para búsqueda semántica.
- Preprocesado para pipelines de RAG: extraer entidades antes de la fragmentación permite etiquetar y filtrar documentos por entidad, mejorando la recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica de forma directa; el codificador en INT8 ocupa 299 MB en disco y se ejecuta en CPU, GPU integrada o NPU. El resto del pipeline (cabezas y decodificación) se ejecuta en CPU con PyTorch.
- GPU recomendadas: no se especifican GPU dedicadas; el soporte OpenVINO cubre CPU, GPU (integrada de Intel) y NPU. No se documenta compatibilidad con A100, H100 o RTX 4090.
- Ejecución en hardware de consumo: sí, en equipos con CPU Intel, GPU integrada Intel o NPU Intel (por ejemplo, Intel Core Ultra con driver instalado, visible como `NPU` en `Core().available_devices`).
- Opciones de despliegue: OpenVINO Runtime 2026.4, con el loader `gliner2_ov.py` y las dependencias `gliner2` 2.1.0, `transformers` 5.5.4/5.23.0, `torch` (build CPU suficiente), `numpy` y `huggingface_hub` 2.x. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Solo se indica que la primera carga en NPU tarda aproximadamente un minuto por la compilación y que con `cache_dir` las cargas posteriores tardan unos segundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `alanfzc/gliner2.5-multi-v1-int8-ov` | 287 M (277,5 M codificador) | 512 tokens | OpenVINO IR INT8 + safetensors | Apache-2.0 | Exportación INT8 para CPU/GPU/NPU de Intel |
| `fastino/gliner2.5-multi-v1` (base) | 287 M | no disponible | safetensors fp16 | Apache-2.0 | Checkpoint original en PyTorch, sin versión OpenVINO |
| Alternativas de NER zero-shot | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- No es un checkpoint compatible con `AutoExtractor.from_pretrained`; es obligatorio usar el loader `gliner2_ov.py` del repositorio.
- Límite estricto de 512 tokens por entrada: los textos más largos lanzan un error, por lo que hay que fragmentar documentos previamente.
- La forma estática `[1, 512]` implica relleno en entradas cortas, con el coste computacional asociado.
- La cuantización INT8 se aplica solo a pesos y sin calibración de datos; las activaciones permanecen en coma flotante, por lo que el ahorro es parcial y puede haber degradación de precisión no cuantificada en la documentación.
- Solo se han probado inglés y español; el rendimiento en otros idiomas no está verificado.
- La NPU requiere hardware Intel compatible y driver instalado; sin él, solo están disponibles CPU y GPU.
- La primera compilación en NPU tarda aproximadamente un minuto; sin `cache_dir` ese coste se repite en cada carga.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas; al ser un extractor guiado por etiquetas, puede producir falsos positivos en spans ambiguos.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de las dependencias (`gliner2`, `transformers`, `openvino`).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/alanfzc/gliner2.5-multi-v1-int8-ov
- Modelo base: https://huggingface.co/fastino/gliner2.5-multi-v1
- Paper de referencia (arXiv:2507.18546): https://arxiv.org/abs/2507.18546
- OpenVINO: https://docs.openvino.ai
- NNCF (Neural Network Compression Framework): https://github.com/openvinotoolkit/nncf
- GLiNER2 (librería): no disponible en la información proporcionada
