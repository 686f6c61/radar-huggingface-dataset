# prithivMLmods/Qwen3.8-27B-Ultimate-Heretic-Uncensored-NVFP4-GGUF

## Resumen

Qwen3.8-27B-Ultimate-Heretic-Uncensored-NVFP4-GGUF es una cuantización en formato NVFP4 (FP4 de NVIDIA) del modelo DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored, un fine-tune de la familia Qwen 3.8 de 27B de parámetros orientado a eliminar los mecanismos de rechazo (refusal removal) y a habilitar modos de razonamiento e instrucción múltiples. La publica el usuario prithivMLmods, que actúa como cuantizador del modelo base de DavidAU, no como desarrollador del modelo original. El resultado es un GGUF de 19,7 GB pensado para inferencia local acelerada en hardware NVIDIA Blackwell con soporte nativo de Tensor Cores FP4.

El interés técnico de esta ficha reside en dos elementos: por un lado, el pipeline de cuantización NVFP4 calibrado con GPTQ y un observador de pesos `imatrix_mse` que preserva `lm_head` y los módulos visuales en precisión completa; por otro, la integración de Multi-Token Prediction (MTP) directamente en los pesos, lo que permite decodificación especulativa sin necesidad de un modelo draft separado. El modelo conserva la torre visual (hay un archivo `mmproj` de 931 MB), por lo que mantiene capacidad image-text-to-text además de generación de texto.

El modelo base declara 27.320.698.848 parámetros reales en safetensors, licencia Apache 2.0 y soporte únicamente de inglés según la model card. Es un modelo de nicho: su valor está en el rendimiento por vatio y por byte en GPUs Blackwell, y en el comportamiento sin rechazos, no en benchmarks de razonamiento de referencia, de los que no se publican datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen 3.8), con cabezas adicionales de Multi-Token Prediction (MTP); incluye torre visual para entrada de imagen |
| Parametros totales | 27.320.698.848 (27,3B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens en la prueba publicada; contexto máximo nativo no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, formato NVIDIA FP4) con GPTQ e `imatrix_mse`; KV cache `q8_0` en la prueba; `lm_head` y módulos `visual` en precisión completa |
| Idiomas soportados | inglés (`en`) según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3.8-27B-Ultimate-Heretic-Uncensored-NVFP4.gguf`, 19,7 GB) + `mmproj.gguf` (931 MB) para visión |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27,3B parámetros de la familia Qwen 3.8, sometido a un proceso de fine-tuning multietapa por DavidAU que la model card describe como "Turbo Brilliance V2 50X AGI system" junto con los frameworks "Heretic reasoning" e "instruct", e incluye 27 modos de razonamiento, 27 modos de instrucción y más de 15 "dynamic AI constructs". Esta terminología proviene del autor y no está respaldada por documentación técnica verificable; no se dispone de número de tokens de entrenamiento, composición del dataset (solo se cita `HuggingFaceH4/ultrachat_200k` como dataset asociado), ni detalles de RLHF/DPO.

La innovación técnica relevante de esta variante es la cuantización NVFP4: pesos de 4 bits en el formato FP4 de NVIDIA, calibrados con GPTQ usando un observador de pesos `imatrix_mse` sobre capas `Linear`, manteniendo `lm_head` y los módulos visuales en precisión completa para no degradar la proyección de salida ni la torre de visión. Además, los pesos GGUF incorporan cabezas MTP que predicen varios tokens futuros en un solo forward pass, habilitando decodificación especulativa interna (`--spec-type draft-mtp`) sin modelo draft externo.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `image-text-to-text`.
- Entrada multimodal de imagen mediante el archivo `mmproj` (proyección visión-lenguaje).
- Razonamiento e instrucción con múltiples modos conmutables (27 modos de razonamiento y 27 de instrucción según el autor).
- Tool calling / function calling (etiqueta `tool-use` en el repo).
- Comportamiento "uncensored" / "abliterated": eliminación profunda de rechazos según la model card.
- Decodificación especulativa MTP integrada en los pesos.
- Token efficiency declarada por el autor para cargas creativas, de código y analíticas.
- Capacidades multilingües: limitadas a inglés según el campo `language` del repo.

## Casos de uso

- Inferencia local en estaciones Blackwell: el formato NVFP4 con Tensor Cores FP4 permite ejecutar un modelo de 27B con solo 18,33 GiB de VRAM pico en una RTX PRO 6000, lo que lo hace viable en equipos de trabajo con 24-32 GB si se ajusta el offloading.
- Generación de código asistida en local: la prueba publicada incluye inserción de nodos en listas enlazadas y el modelo soporta tool calling, por lo que encaja en asistentes de IDE o pipelines que necesiten ejecutar herramientas sin depender de la nube.
- Procesamiento de documentos con imagen: gracias al `mmproj`, se puede usar para extracción de información de capturas, diagramas o formularios combinando entrada visual y salida textual.
- Investigación sobre alineación y refusal: al ser un modelo "abliterated", sirve como objeto de estudio para medir qué se elimina y qué se conserva tras el proceso de abliteración, y para evaluar riesgos de modelos sin salvaguardas.
- Prototipado de agentes multi-paso: la combinación de tool use, contexto de 16K y decodificación especulativa permite bucles de razonamiento-acción con latencia baja (114 tok/s de generación en la prueba del autor).
- Generación creativa sin filtros: escritura de ficción, guiones o material editorial donde los rechazos del modelo base resultan un obstáculo, con la advertencia de revisión humana obligatoria.
- Benchmarking de cuantización: caso de uso meta, comparar la calidad NVFP4 frente al modelo base en FP16/BF16 para estudiar la degradación introducida por GPTQ con `imatrix_mse`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos numéricos son métricas de inferencia del autor en una NVIDIA RTX PRO 6000 Blackwell Server Edition con 96 GB:

| Metrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 291,66 tokens/s |
| Velocidad media de generación | 114,20 tokens/s |
| Tiempo total de pared | 49,9 s |
| Contexto usado en la prueba | 16.384 tokens |
| KV cache (K) | `q8_0` |
| VRAM pico | 18,33 GiB |
| Utilización de GPU pico | 96% |
| Capas offloaded | 99 (`-ngl 99`) |
| Decodificación especulativa | MTP (`draft_n_max=2`) |
| Repeticiones | 5 |

Las cinco pruebas fueron problemas aritméticos y de programación (inserción en lista enlazada, problema de tren y corredor, dos tuberías llenando un depósito, estudiantes en aulas de examen, edades padre-hijo). No se reportan tasas de acierto, solo velocidad.

## Requisitos de hardware

- VRAM estimada: 18,33 GiB pico medidos con contexto de 16K, KV cache `q8_0` y 99 capas offloaded; el archivo pesa 19,7 GB más 931 MB del `mmproj`.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (probada), B200 y B300; cualquier GPU Blackwell con SM120/GB202 para aprovechar los Tensor Cores FP4 de forma nativa.
- GPUs consumer: cabe en RTX 5090 (32 GB) y previsiblemente en RTX 5080 (16 GB) solo con offloading parcial a RAM o contextos reducidos; en RTX 4090 (24 GB, Ada) el formato FP4 no tiene aceleración nativa y se ejecutará por emulación, con menor rendimiento.
- Despliegue: `llama.cpp` (`llama-cli`, `llama-server`) es la vía documentada; el repo incluye etiquetas para `text-generation-inference` y `transformers`, pero el formato GGUF NVFP4 está pensado para llama.cpp.
- Comando de referencia del autor: `llama-cli --spec-type draft-mtp --spec-draft-n-max 2 -ngl 99 -c 16384 --cache-type-k q8_0 --seed 42 -n 8192 -st`.
- Throughput: 291,66 tok/s de prompt y 114,20 tok/s de generación en la configuración probada; la latencia real depende del prompt y del build de llama.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Ultimate-Heretic-Uncensored-NVFP4-GGUF | 27,3B | 16K en prueba | NVFP4 + GGUF | Apache 2.0 | Objeto de esta ficha; requiere Blackwell para FP4 nativo |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored | 27,3B | no disponible | safetensors (BF16/FP16) | Apache 2.0 | Modelo base sin cuantizar; mayor VRAM, sin aceleración FP4 |
| Qwen3 base de 27B (familia Qwen 3.8) | 27,3B | no disponible | múltiples | Apache 2.0 | Modelo original con salvaguardas; referencia de calidad frente al fine-tune |
| Otras cuantizaciones GGUF del mismo base (Q4_K_M, Q8_0) | 27,3B | según config | GGUF estándar | Apache 2.0 | Compatibles con GPUs no Blackwell; menor velocidad que NVFP4 en SM120 |

No se dispone de datos de benchmarks que permitan comparar calidad entre estas variantes.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": se ha eliminado deliberadamente la capacidad de rechazo, lo que implica riesgo alto de generar contenido dañino, ilegal o sexualmente explícito; no es apto para producción orientada al público sin filtros externos.
- Riesgo de alucinación no cuantificado: no hay benchmarks publicados, y el proceso de fine-tuning multietapa descrito por el autor no está documentado de forma verificable.
- Solo inglés: el campo `language` del repo declara únicamente `en`; el rendimiento en castellano no está garantizado.
- Contexto: la prueba usa 16K tokens; el máximo nativo del modelo base no está documentado en esta ficha.
- La cuantización NVFP4 introduce degradación de calidad respecto al base en BF16, no medida por el autor; el uso de GPTQ con `imatrix_mse` mitiga pero no elimina esta pérdida.
- Dependencia de hardware: el rendimiento de 114 tok/s solo es alcanzable en Blackwell con soporte FP4 nativo; en GPUs anteriores el formato pierde su ventaja.
- Terminología del autor no verificable: "Turbo Brilliance V2 50X AGI system", "27 reasoning modes" y similares son afirmaciones de marketing sin documentación técnica.
- Licencia Apache 2.0 permite uso comercial, pero el responsable del despliegue asume íntegramente la responsabilidad legal sobre el contenido generado.
- Repo con 0 descargas en el momento de la consulta: ecosistema mínimo, poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/prithivMLmods/Qwen3.8-27B-Ultimate-Heretic-Uncensored-NVFP4-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Peso NVFP4: https://huggingface.co/prithivMLmods/Qwen3.8-27B-Ultimate-Heretic-Uncensored-NVFP4-GGUF/blob/main/Qwen3.8-27B-Ultimate-Heretic-Uncensored-NVFP4.gguf
- Proyección multimodal: https://huggingface.co/prithivMLmods/Qwen3.8-27B-Ultimate-Heretic-Uncensored-NVFP4-GGUF/blob/main/Qwen3.8-27B-Ultimate-Heretic-Uncensored.mmproj.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del cuantizador: https://huggingface.co/prithivMLmods
- Dataset citado: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
