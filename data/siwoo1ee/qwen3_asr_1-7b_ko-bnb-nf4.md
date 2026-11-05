# siwoo1ee/qwen3_asr_1.7b_ko-bnb-nf4

## Resumen

`siwoo1ee/qwen3_asr_1.7b_ko-bnb-nf4` es una cuantización post-entrenamiento en 4 bits NF4 (bitsandbytes) del modelo de reconocimiento automático de voz `TeamUNIVA/qwen3_asr_1.7b_ko`, un ajuste fino sobre la arquitectura Qwen3-ASR orientado exclusivamente al idioma coreano. No se trata de un nuevo fine-tune ni de un modelo original: el autor de la cuantización es `siwoo1ee`, mientras que el ajuste fino coreano corresponde a TeamUNIVA y la arquitectura base a Qwen. El objetivo es reducir el peso en disco y el consumo de VRAM para facilitar la inferencia en GPUs de gama media.

El modelo conserva la arquitectura completa de Qwen3-ASR (encoder de audio más decoder de lenguaje) pero convierte 196 capas lineales del decoder de lenguaje a NF4 con doble cuantización, manteniendo el encoder de audio, los embeddings y la cabeza de salida en BF16. El resultado pasa de 4,376 GiB a 1,849 GiB de pesos, una reducción del 57,8 % en disco. Con 2.038.052.480 parámetros totales, el modelo está pensado para transcripción de audio coreano en entornos con recursos limitados.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa de despliegue ligero para ASR coreano; por otro, advierte explícitamente de que la cuantización introduce errores de reconocimiento de palabras en pruebas locales y de que no se ha evaluado sobre un benchmark completo de CER/WER en coreano. El propio autor recomienda el modelo BF16 original cuando la precisión sea prioritaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (encoder de audio + decoder de lenguaje transformer), cuantizada en el decoder |
| Parametros totales | 2.038.052.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 4-bit con doble cuantizacion (bitsandbytes); computo en BF16 |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamano de pesos en disco | 1.984.998.122 bytes (1,849 GiB), frente a 4.698.521.600 bytes (4,376 GiB) del original |
| Capas cuantizadas | 196 capas lineales del decoder de lenguaje |
| Componentes en BF16 | encoder de audio, embeddings y cabeza de salida |
| Revision del modelo fuente | `ac8f5e5185a66a5caedb229ef435affdbacccf3c` |
| Modelo base | TeamUNIVA/qwen3_asr_1.7b_ko |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3-ASR, un modelo de reconocimiento automático de voz compuesto por un encoder de audio y un decoder de lenguaje de tipo transformer. Sobre esta base, TeamUNIVA realizó un ajuste fino específico para coreano que da lugar a `qwen3_asr_1.7b_ko`. La cuantización aquí documentada no modifica la arquitectura ni añade entrenamiento: convierte 196 capas lineales del decoder de lenguaje a 4 bits NF4 con doble cuantización, dejando el encoder de audio, los embeddings y la cabeza de salida en BF16. El cómputo se realiza en BF16.

No se utilizó ningún dataset adicional de entrenamiento ni de calibración durante la cuantización, según indica el autor. Los pesos, la configuración de cuantización y los ficheros de processor/tokenizer se volvieron a guardar, y el fichero `source.json` lista cada capa convertida. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset del fine-tune original ni sobre si se aplicaron técnicas de RLHF o DPO en el modelo base.

## Capacidades

- Transcripción de voz a texto en coreano (`automatic-speech-recognition`).
- Procesamiento por lotes de múltiples clips o fragmentos de audio mediante `max_inference_batch_size`.
- Decodificación greedy determinista (el autor fija `do_sample = False` en el ejemplo de uso).
- Manejo de clips cortos (en torno a 30 segundos o menos) en GPUs de 8 GB; para grabaciones más largas se recomienda dividir en fronteras de baja energía.
- Soporte de `language="Korean"` como parámetro explícito de transcripción.
- Integración con la librería `qwen-asr` (versión 0.0.6) y con Transformers (4.57.6).
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada multimodal ni modo de razonamiento (thinking mode) en la información disponible.

## Casos de uso

- Transcripción de notas de voz y reuniones en coreano: el modelo puede procesar clips cortos en una GPU de 8 GB, lo que lo hace adecuado para aplicaciones de dictado o resumen de reuniones en portátiles con GPU de gama media.
- Subtitulado automático de vídeo en coreano: dividiendo el audio en fragmentos de baja energía y procesándolos en lote (batch 4), se obtiene un RTF de 0,290 en la prueba local, lo que permite generar subtítulos con throughput razonable.
- Prototipado rápido de pipelines ASR en coreano: al ocupar solo 2,240 GiB de memoria de tensor en batch 4, permite iterar en entornos con VRAM limitada sin necesidad de infraestructura dedicada.
- Investigación y evaluación de cuantizaciones: sirve como caso de estudio de la degradación de precisión introducida por NF4 en tareas ASR, con ejemplos documentados de errores de reconocimiento de palabras.
- Despliegue en entornos con restricciones de disco: la reducción del 57,8 % en tamaño de pesos facilita distribuir el modelo en contenedores o dispositivos con almacenamiento limitado.
- Preprocesado de audio para pipelines de NLP: transcripción de audio coreano como paso previo a tareas de análisis de texto, clasificación o búsqueda, aceptando la advertencia de precisión del autor.

## Benchmarks y rendimiento

El autor publica un benchmark local en una RTX 4070 Laptop GPU (8 GB), Windows, SDPA y decodificación greedy en coreano, sobre siete WAV de ejemplo del repositorio original (44,741 segundos en total), sin calentamiento y con mediana de tres ejecuciones:

| Precision | Batch | Tiempo | RTF | Memoria de tensor pico en GPU |
|---|---:|---:|---:|---:|
| Upstream BF16 | 1 | 20,347 s | 0,455 | 3,954 GiB |
| Upstream BF16 | 4 | 13,152 s | 0,294 | 4,186 GiB |
| Este modelo NF4 | 1 | 33,875 s | 0,757 | 2,006 GiB |
| Este modelo NF4 | 4 | 12,955 s | 0,290 | 2,240 GiB |

El autor aclara que la diferencia de ~0,2 s en batch 4 está dentro de la variabilidad de medición y que no se afirma que NF4 sea más rápido que BF16. La memoria indicada es la memoria de tensor máxima asignada por PyTorch, no el uso total del dispositivo, y el tiempo de carga está excluido. Se trata de mediciones de throughput multi-clip, no de latencia de un solo clip.

Ejemplos de degradación observada (batch 4, última ejecución medida):

| Ejemplo | BF16 | NF4 |
|---|---|---|
| 2 | 찬드라셰카르 솔랑키 | 찬드라 세카르 솜랑키 |
| 4 | 경쟁률 | 경진 |
| 6 | 토트 토트넘은 언제 경기하냐? | 토트 토토나 뭐 언제 경기하냐? |

El autor advierte de que las puntuaciones publicadas en la model card del modelo original no aplican a esta cuantización y de que siete ejemplos cortos no establecen precisión general ni rendimiento en grabaciones largas. No se han publicado resultados de benchmarks estándar (CER/WER) para este modelo cuantizado.

## Requisitos de hardware

- VRAM estimada: 2,006 GiB de memoria de tensor pico en batch 1 y 2,240 GiB en batch 4, según la medición local del autor (no incluye el uso total del dispositivo).
- GPU recomendadas: NVIDIA con soporte BF16 y PyTorch con CUDA; probado en RTX 4070 Laptop GPU (8 GB).
- Cabe en GPU de consumo: sí, en GPUs de 8 GB como la RTX 4070 Laptop; el autor recomienda empezar con clips de unos 30 segundos o menos en 8 GB.
- Opciones de despliegue: librería `qwen-asr` 0.0.6 con Transformers 4.57.6 y bitsandbytes 0.50.2; `device_map="cuda:0"`, `attn_implementation="sdpa"`. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI.
- Entorno probado: Python 3.12, PyTorch 2.10.0+cu128, Windows; el fichero `requirements.lock.txt` recoge el entorno exacto.
- Throughput y latencia: RTF de 0,757 en batch 1 y 0,290 en batch 4 en la prueba local; el autor no garantiza latencia de un solo clip.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| siwoo1ee/qwen3_asr_1.7b_ko-bnb-nf4 | 2.038.052.480 | no disponible | NF4 4-bit | coreano | Apache-2.0 | HuggingFace |
| TeamUNIVA/qwen3_asr_1.7b_ko (BF16) | no disponible en la informacion | no disponible | BF16 | coreano | Apache-2.0 (heredada) | HuggingFace |
| Qwen3-ASR base (arquitectura) | no disponible en la informacion | no disponible | no aplica | no disponible | no disponible en la informacion | no disponible |

La comparativa se limita al modelo fuente BF16 y a la arquitectura Qwen3-ASR, ya que la información proporcionada no incluye datos de otros modelos ASR coreanos comparables. El modelo BF16 ofrece mayor precisión según la advertencia del autor, a costa de 4,376 GiB de pesos frente a 1,849 GiB.

## Limitaciones y advertencias

- La cuantización NF4 introduce errores de reconocimiento de palabras, documentados en los ejemplos 2, 4 y 6 del benchmark local.
- El modelo no ha sido evaluado sobre un benchmark completo de CER/WER en coreano; las puntuaciones del modelo original no aplican a esta cuantización.
- Solo soporta coreano; no hay capacidades multilingües documentadas.
- No se ha utilizado dataset de calibración, lo que puede afectar a la fidelidad de la cuantización.
- En Windows, la dependencia `nagisa`/DyNet del modelo original puede fallar al leer su modelo auxiliar desde una ruta de Python con caracteres no ASCII; se recomienda una ruta solo ASCII.
- No aplicar una segunda configuración de cuantización: la configuración guardada carga automáticamente los pesos NF4.
- El rendimiento en grabaciones largas no está establecido; se recomienda dividir el audio en fronteras de baja energía.
- Licencia Apache-2.0, que permite uso comercial, pero se trata de un derivado cuantizado independiente y no de una versión oficial de TeamUNIVA o Qwen.
- Riesgo de alucinación y sesgos: no documentados específicamente en la información disponible; aplican los del modelo base, no evaluados aquí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/siwoo1ee/qwen3_asr_1.7b_ko-bnb-nf4
- Modelo base (TeamUNIVA): https://huggingface.co/TeamUNIVA/qwen3_asr_1.7b_ko
- Ficheros de benchmark del repositorio: `BENCHMARK.md` y `benchmarks/*.json` (referenciados en la model card)
- Model card del modelo original preservada como `UPSTREAM_README.md` en el repositorio
- Listado de capas convertidas: `source.json` en el repositorio
- Entorno de prueba: `requirements.lock.txt` en el repositorio
