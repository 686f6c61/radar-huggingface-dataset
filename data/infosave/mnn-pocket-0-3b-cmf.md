# infosave/MNN-Pocket-0.3B-cmf

## Resumen
MNN-Pocket-0.3B-cmf es una colección de pesos cuantizados en formato CMF del modelo MNN-Pocket-0.3B desarrollado por el equipo taobao-mnn de Alibaba. El modelo base es un asistente de 0,3 mil millones de parámetros entrenado para chino e inglés, y esta ficha recoge tanto el checkpoint conversacional como el base, el SFT, un borrador DFlash2 para decodificación especulativa y un modelo de decisión. La distribución la realiza el usuario infosave como conversión a CMF, un formato binario pensado para el motor de inferencia cortiq, escrito en Rust y sin dependencias de Python ni de frameworks de machine learning.

La relevancia de esta ficha reside en su enfoque en despliegue on-device: los ficheros CMF permiten ejecutar el modelo en GPUs NVIDIA, AMD e Intel mediante Vulkan o DX12, en Apple Silicon mediante Metal y en CPU, con un peso que oscila entre 217 MB y 620 MB según la variante. Esto lo sitúa en la categoría de modelos pequeños para inferencia local de baja latencia, con velocidades de decodificación de hasta 401 tokens por segundo en una RTX 2000 Ada.

El contexto máximo no está especificado en la información disponible, aunque los benchmarks de rendimiento reportados incluyen prompts de 2k y 8k tokens, lo que sugiere soporte efectivo al menos hasta 8k. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | 0,3 mil millones (300M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se reportan prompts de hasta 8k tokens) |
| Tipos de cuantizacion | 8-bit (q8_2f), 4-bit GPTQ con atención, embeddings y cabeza en 8-bit (q4tp), 16-bit (f16 para el modelo de decisión), 4-bit para los borradores DFlash2 |
| Idiomas soportados | inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (binario propietario del motor cortiq) |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna del transformer más allá de su tamaño de 0,3B parámetros. Se sabe que el modelo base fue entrenado por el equipo taobao-mnn de Alibaba y que existen checkpoints diferenciados: un modelo base pre-entrenado, un checkpoint SFT y un modelo de decisión. El modelo conversacional (assistant) emplea una plantilla de chat propia y fue entrenado con datos en inglés y chino.

La cuantización q4tp se deriva de los pesos INT4 del autor original, que fueron entrenados con quantización-aware training (QAT), no de un simple redondeo de los pesos bf16. La calibración GPTQ usó 4096 tokens, mitad de WikiText-2 y mitad de conversaciones del asistente. Los borradores DFlash2 son modelos auxiliares de 4 bits diseñados para decodificación especulativa, con un tamaño de 90 MB cada uno, y están vinculados por nombre al fichero principal con el que deben emparejarse.

## Capacidades
- Generación de texto conversacional en inglés y chino, con plantilla de chat incluida en los ficheros.
- Finalización de texto sin formato mediante el checkpoint base (`--raw`), útil para fine-tuning posterior.
- Decodificación especulativa mediante los borradores DFlash2, que aceleran la generación en código y Python.
- Modelo de decisión separado (`Dec`) para tareas de elección, sí/no y puntuación, con probabilidades calibradas.
- Inferencia en GPU (Vulkan, DX12, Metal) y CPU sin dependencias de Python.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Multilingüismo limitado a inglés y chino.

## Casos de uso
- Asistente conversacional local en dispositivos de gama media: el modelo q8_2f ocupa 316 MB y se ejecuta en una MacBook Air M4 con 0,7–1,3 GB de RAM, lo que permite integrarlo en aplicaciones de escritorio o móviles sin conexión.
- Generación de código en entornos con GPU integrada: con el borrador DFlash2 y el fichero q8_2f se alcanzan 415 tok/s en Python en una RTX 2000 Ada, adecuado para autocompletado en IDE con latencia baja.
- Clasificación y enrutamiento de consultas: el modelo de decisión `Dec` permite resolver elecciones binarias o puntuaciones con probabilidades calibradas (49/49 coincidencias con la referencia en f16), útil para triaje en pipelines de atención al cliente.
- Prototipado rápido de aplicaciones NLP en chino e inglés: el checkpoint base permite fine-tuning sobre tareas específicas con un coste computacional mínimo.
- Inferencia en entornos sin Python: el motor cortiq en Rust facilita el despliegue en sistemas embebidos o contenedores ligeros donde no se desea arrastrar dependencias de PyTorch.
- Educación e investigación: el tamaño reducido y la disponibilidad de checkpoints base, SFT y decisión permiten estudiar el comportamiento de modelos pequeños con cuantización QAT y decodificación especulativa.
- Procesamiento por lotes de baja latencia en CPU: con 178–191 tok/s en CPU de 10 núcleos, es viable para tareas de generación de texto en servidores sin GPU.

## Benchmarks y rendimiento

| Hardware | Backend | Fichero | Decodificación (tok/s) | Primer token a 2k | Decod. a 2k | Primer token a 8k | Decod. a 8k | Memoria |
|---|---|---|---:|---:|---:|---:|---:|---|
| RTX 2000 Ada (16 GB) | Vulkan | q8_2f | 333 | 1,65 s | 292 | 10,5 s | 224 | 0,4–0,7 GB VRAM |
| RTX 2000 Ada (16 GB) | Vulkan | q4tp | 401 | 0,76 s | 342 | 7,0 s | 256 | 0,4–0,6 GB VRAM |
| MacBook Air M4 (24 GB) | Metal | q8_2f | 202 | 0,69 s | 144 | 5,9 s | 101 | 0,7–1,3 GB RAM |
| MacBook Air M4 (24 GB) | Metal | q4tp | 252 | 0,67 s | 183 | 5,7 s | 122 | 0,5–1,2 GB RAM |
| MacBook Air M4 (24 GB) | CPU 10 núcleos | q8_2f | 178 | 2,1 s | 104 | — | — | 0,6 GB RAM |
| MacBook Air M4 (24 GB) | CPU 10 núcleos | q4tp | 191 | 2,0 s | 110 | — | — | 0,5 GB RAM |

Con decodificación especulativa DFlash2 en RTX 2000 Ada con q8_2f y greedy: Python 320 → 415 tok/s (88 % de tokens aceptados), código chino 325 → 318–347, aritmética 324 → 306–315, chat 307 → 235–256. Con q4tp los borradores no aportan mejora según la información disponible.

Perplejidad reportada (chat text / WikiText-2): q8_2f 16,11 → 16,53 / 4741 → 4736; q4tp 13,57 → 13,47 / 2733 → 2185; Base-q8_2f 5,37 → 5,40 / 18,25 → 18,31; SFT-q8_2f 10,65 → 10,21 / 783 → 767.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada: 0,4–0,7 GB para q8_2f y 0,4–0,6 GB para q4tp en GPU; 0,5–1,3 GB de RAM en Apple Silicon; 0,5–0,6 GB en CPU.
- GPU recomendadas: cualquier GPU con soporte Vulkan o DX12 (NVIDIA, AMD, Intel), Apple Silicon con Metal. Los datos de rendimiento se midieron en RTX 2000 Ada y MacBook Air M4.
- Cabe en GPU consumer: sí, cualquier GPU con al menos 1 GB de VRAM disponible; el modelo es adecuado para portátiles y equipos de gama baja.
- Opciones de despliegue: motor cortiq (Rust) mediante `cargo install cortiq-cli` o binarios precompilados para Linux, macOS y Windows. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: ver tabla de benchmarks. Máximo reportado 401 tok/s en RTX 2000 Ada con q4tp; 415 tok/s con DFlash2 en Python.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la documentación proporcionada. La ficha no incluye datos de otros modelos de 0,3B parámetros ni de alternativas en formato CMF o con el motor cortiq, por lo que la comparativa no está disponible.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado principalmente en chino e inglés, puede presentar sesgos culturales y lingüísticos de esos contextos.
- Riesgo de alucinación: el modelo conversacional muestra una perplejidad muy alta en texto crudo de WikiText-2 (miles de nats), lo que indica que puede generar texto con baja fidelidad en dominios fuera de su distribución de chat. El modelo base es más adecuado para completar texto genérico.
- Limitaciones de contexto e idioma: solo soporta inglés y chino; la longitud máxima de contexto no está especificada, aunque los benchmarks usan prompts de hasta 8k tokens.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero los pesos derivados de INT4 QAT y los borradores DFlash2 pueden tener condiciones adicionales no detalladas.
- Caveat para producción: el formato CMF es propietario del motor cortiq y no es compatible con otros runners; la decodificación especulativa con q4tp no aporta mejoras según los datos del autor; el modelo de decisión q8_2f puede discrepar en empates cercanos (47/49 en Metal).

## Enlaces
- [Hugging Face: infosave/MNN-Pocket-0.3B-cmf](https://huggingface.co/infosave/MNN-Pocket-0.3B-cmf)
- [Colección MNN-Pocket-0.3B de taobao-mnn](https://huggingface.co/collections/taobao-mnn/mnn-pocket-03b)
- [Repositorio CMF en GitHub](https://github.com/infosave2007/cmf)
- [Página de releases de cortiq](https://github.com/infosave2007/cmf/releases)
- [Modelo base: taobao-mnn/MNN-Pocket-0.3B](https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B)
