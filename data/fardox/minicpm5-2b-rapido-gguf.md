# FardoX/MiniCPM5-2B-rapido-GGUF

## Resumen

MiniCPM5-2B-rapido-GGUF es una cuantización experimental de 2 bits del modelo MiniCPM5-2B de OpenBMB, publicada por el usuario FardoX. El modelo base cuenta con 2.516.756.480 parámetros (aproximadamente 2,5 mil millones) y esta cuantización reduce su peso de 5,04 GB en bf16 a 0,63 GB, un factor de compresión de 8,1x. El objetivo declarado es explorar los límites de la compresión agresiva manteniendo un formato compatible con llama.cpp.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización novedosa (rotación block-Hadamard de 512 más GPTQ vectorial sobre la rejilla IQ2_XXS, con un nuevo tipo de peso denominado ECTV); por otro, sirve como advertencia empírica de que los métodos de 2 bits que funcionan en modelos grandes no se trasladan a modelos pequeños. El propio autor reconoce una pérdida de calidad severa y desaconseja su uso en producción.

La licencia es Apache-2.0, heredada del modelo original, y el repositorio ocupa 1,3 GB. No se han publicado datos sobre idiomas soportados ni sobre la pipeline de la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base MiniCPM5-2B de OpenBMB) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 1,99 bits/peso (ECTV), 2,08 bits/peso (IQ2_XXS); referencia Q4_0 a 4,74 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base MiniCPM5-2B en la documentación proporcionada; los tags indican que es un modelo conversacional. Lo que sí está documentado es el proceso de cuantización: se aplica una rotación block-Hadamard de tamaño 512 seguida de GPTQ vectorial sobre la rejilla IQ2_XXS, con una escala de 4 bits por cada 64 pesos y calibración generada por el propio modelo. El tipo de peso ECTV es una nueva implementación (CPU y CUDA) incluida como parche en llama.cpp y consiste en un reempaquetado sin pérdida del archivo IQ2_XXS.

El autor probó varias estrategias para mitigar la degradación: mantener embeddings y cabeza de salida en Q8_0 (PPL 25,9 frente a 30,5 de la cuantización completa), primeras y últimas 4 capas en Q4_0 (PPL 25,5) y todas las puertas/up de las FFN en Q4_0 (PPL 23,2), sin acercarse al bf16 original (PPL 15,4). Concluye que la pérdida reside en los propios pesos de 2 bits y no en el lector: los mismos pesos reconstruidos en bf16 vía PyTorch dan GSM8K 0,29.

## Capacidades

- Generación de texto conversacional, heredada del modelo base MiniCPM5-2B.
- Razonamiento matemático y resolución de problemas, aunque severamente degradados por la cuantización (ver benchmarks).
- Compatibilidad con llama.cpp y su servidor `llama-server`, incluyendo soporte de plantillas Jinja (`--jinja`).
- Compatible con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Experimentación con cuantización extrema: el caso de uso principal es estudiar cómo se degrada un modelo de 2,5B al comprimirlo a ~2 bits, comparando con Q4_0 y bf16 sobre el mismo script de evaluación.
- Pruebas de infraestructura en llama.cpp: validar el nuevo tipo de peso ECTV y el parche CUDA asociado en pipelines de compilación y despliegue.
- Benchmarking de hardware con modelos mínimos: con 0,63 GB, permite medir throughput de prompt y generación en GPUs modestas (el autor reporta 213,3 tok/s de generación en una RTX A5000).
- Demos de latencia y prototipado rápido de interfaces conversacionales donde la calidad no es crítica y prima el tamaño reducido.
- Validación de pipelines de evaluación: servir como caso negativo de control para comprobar que un harness de benchmarks detecta degradaciones esperadas (GSM8K 0,32 frente a 0,91).
- Distribución en entornos con almacenamiento muy limitado (por ejemplo, imágenes de contenedor pequeñas o dispositivos embebidos) donde no se pueda asumir el peso de Q4_0 (1,49 GB).
- No se recomienda su uso en atención al cliente, generación de código en producción ni tareas matemáticas reales, dado el deterioro documentado.

## Benchmarks y rendimiento

Resultados medidos por el autor con 100 ítems por prueba, decodificación greedy, sin modo thinking y el mismo script para todas las columnas:

| Metrica | bf16 (original) | Este modelo (ECTV) | Q4_0 |
|---|---|---|---|
| GSM8K | 0,91 | 0,32 | 0,78 |
| MATH-500 (100 muestreados) | 0,56 | 0,13 | 0,40 |
| bits/peso (modelo completo) | 16,02 | 1,99 | 4,74 |
| Tamano | 5,04 GB | 0,63 GB | 1,49 GB |
| Perplejidad wikitext-2 (24 x 512) | 14,42 | 31,53 | 16,08 |

Rendimiento en NVIDIA RTX A5000, batch 1: ECTV alcanza 213,3 tok/s de generación (0,78x respecto a Q4_0) y 9606 tok/s de prompt (0,79x). IQ2_XXS en llama.cpp estándar alcanza 217,8 tok/s de generación (0,81x) y 9654 tok/s de prompt (0,84x). El autor advierte que 100 ítems implican aproximadamente ±5 puntos de ruido. Solo se probó CUDA de NVIDIA; la velocidad en CPU no se midió.

## Requisitos de hardware

- VRAM estimada: en torno a 0,63 GB para los pesos en el archivo principal (ECTV); el archivo IQ2_XXS equivalente tiene un tamaño similar. Hay que añadir la memoria del contexto y del runtime de llama.cpp.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA y suficiente VRAM; el autor validó en RTX A5000. Por tamaño, cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer con más de 1-2 GB de VRAM.
- Opciones de despliegue: llama.cpp con `llama-server`; el archivo ECTV requiere el commit `ad9d9e8f50e6ff9a6bfbbdd3aef6d74a8428cf4e` más el parche `ectv-cuda-mmq-llamacpp.patch`. El archivo `MiniCPM5-2B-rapido.gguf` (mismos pesos que IQ2_XXS) carga en llama.cpp estándar en ese commit o posterior. No se documenta soporte para vLLM, TGI ni Ollama.
- Latencia y throughput: 213,3 tok/s de generación y 9606 tok/s de prompt en RTX A5000 (ECTV). No se midió en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniCPM5-2B-rapido (este) | 2,52B | 1,99 bits (ECTV) | 0,63 GB | 0,32 | Apache-2.0 | GGUF en HF |
| MiniCPM5-2B Q4_0 | 2,52B | 4,74 bits | 1,49 GB | 0,78 | Apache-2.0 | GGUF derivado |
| MiniCPM5-2B bf16 (original) | 2,52B | 16,02 bits | 5,04 GB | 0,91 | Apache-2.0 | HF (openbmb) |

No se dispone de datos de otros modelos comparables de 2-3B en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad severa y documentada: GSM8K cae al 35% del original y MATH-500 al 23%. El autor lo etiqueta explícitamente como "experimental, big quality loss" y recomienda usarlo para experimentos de tamaño y velocidad, no de calidad.
- Mayor perplejidad: 31,53 en wikitext-2 frente a 14,42 en bf16, más del doble.
- La degradación no se corrige con ajustes parciales de precisión (embeddings, capas extremas o FFN en Q4_0 siguen lejos del bf16).
- Riesgo de alucinación y errores de razonamiento incrementado por la cuantización agresiva; no apto para producción.
- El archivo principal requiere un parche no oficial de llama.cpp y un commit concreto; el archivo alternativo necesita ese commit o uno posterior. La compatibilidad futura no está garantizada.
- Solo se ha probado en CUDA de NVIDIA; el rendimiento en CPU y en otras plataformas es desconocido.
- No se documentan sesgos, idiomas soportados ni longitud de contexto; deben consultarse en la model card del modelo base.
- Es un derivado no oficial; la licencia Apache-2.0 se mantiene, pero la responsabilidad de validación recae en el usuario.
- Los benchmarks se basan en 100 ítems con ±5 puntos de ruido; las cifras deben interpretarse con esa incertidumbre.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FardoX/MiniCPM5-2B-rapido-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Commit de llama.cpp requerido: https://github.com/ggml-org/llama.cpp/commit/ad9d9e8f50e6ff9a6bfbbdd3aef6d74a8428cf4e
