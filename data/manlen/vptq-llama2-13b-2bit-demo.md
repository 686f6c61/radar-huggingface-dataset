# manlen/vptq-llama2-13b-2bit-demo

## Resumen

VPTQ LLaMA-2-13B 2-bit es una versión cuantizada a 2 bits del modelo NousResearch/Llama-2-13b-hf, publicada por el usuario manlen en Hugging Face. El modelo aplica Vector Post-Training Quantization (VPTQ), una técnica de cuantización post-entrenamiento desarrollada por Microsoft Research, que comprime los pesos lineales del transformer hasta aproximadamente 2,0163 bits por peso. Sobre esta base cuantizada se ha realizado un ajuste supervisado específico para la tarea BoolQ (preguntas de sí/no sobre pasajes de texto), actualizando únicamente 10 240 parámetros del LM head original.

La relevancia del modelo es fundamentalmente demostrativa y de evaluación de técnicas de compresión extrema: permite ejecutar un modelo de 13 000 millones de parámetros en una GPU con solo 8 GB de VRAM, manteniendo una precisión del 81,04 % en BoolQ. El paquete se distribuye como un ZIP de 8,2 GB que incluye el modelo cuantizado, un entorno Python 3.12.12 con Torch 2.8.0+cu128 y Transformers 4.46.3, scripts de evaluación y un conjunto de datos de 3270 preguntas de BoolQ. No es un modelo generalista: es un artefacto de demostración de una técnica de cuantización concreta sobre una tarea concreta.

El modelo base es Llama 2 13B, un transformer decoder-only de Meta con 13 000 millones de parámetros, contexto de 4096 tokens y licencia Llama 2 Community License. La versión aquí presentada hereda esas características arquitectónicas, pero con los pesos lineales comprimidos y un LM head parcialmente adaptado a BoolQ. El repositorio tiene 16,4 GB de tamaño total (incluyendo el ZIP y archivos auxiliares) y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), pesos lineales cuantizados con VPTQ |
| Parametros totales | 13 000 millones (aproximado, modelo base Llama-2-13b) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (heredado de Llama 2; no confirmado explícitamente en la model card) |
| Tipos de cuantizacion | VPTQ 2-bit (aprox. 2,0163 bit/peso en capas lineales; 2,3688 bit/peso promedio incluyendo embeddings y LM head en FP16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Llama 2 Community License |
| Formato de pesos | Pesos cuantizados VPTQ empaquetados en ZIP con entorno de ejecución; no se especifica safetensors ni GGUF |
| Tamano del repo | 16,4 GB (ZIP de despliegue: 8 196 427 946 bytes) |
| Tamano de pesos cuantizados | 3 854 129 040 bytes |
| Modelo base | NousResearch/Llama-2-13b-hf |
| Fecha de creacion | 2026-10-31 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 13B: un transformer decoder-only con atención multi-cabeza estándar, normalización RMSNorm y activación SwiGLU. Sobre esta arquitectura, VPTQ sustituye los pesos de las capas lineales por representaciones vectoriales cuantizadas a 2 bits, con un esquema de decodificación que mantiene los pesos comprimidos en memoria y decodifica únicamente la matriz lineal activa en cada paso. Según la model card, el peso cuantizado ocupa 3 854 129 040 bytes, lo que corresponde a aproximadamente 2,0163 bits por peso en las capas lineales.

El entrenamiento posterior a la cuantización consistió en un ajuste supervisado específico para BoolQ: se actualizaron únicamente las dos filas (no/yes) del LM head original, es decir, 10 240 parámetros existentes. El conjunto de entrenamiento fue de 7379 preguntas y el de desarrollo de 2048, sin solapamiento de hashes con la validación oficial de BoolQ. No se realizó RLHF ni DPO. La model card indica explícitamente que el objetivo de perplejidad WikiText2 de 5,32 del paper no se ha reproducido (el modelo adaptado obtiene ~5,615) y que este ajuste no sigue la receta de entrenamiento end-to-end del paper. El modelo no incluye pesos FP16 en el paquete, por lo que no es posible reproducir la comparación directa de precisión entre cuantizado y FP16 dentro del ZIP.

## Capacidades

- Generación de texto por continuación simple (el modelo es un LM base, no un modelo de instrucciones).
- Clasificación binaria de preguntas de sí/no sobre pasajes de texto (BoolQ), gracias al ajuste supervisado del LM head.
- Razonamiento básico de comprensión lectora en inglés, limitado a la tarea BoolQ.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (idioma declarado en la model card).
- No se documenta modo thinking, visión ni audio.
- Inferencia con pesos comprimidos en memoria y decodificación por capa, lo que permite ejecución en GPU de gama media.

## Casos de uso

- Demostración de cuantización extrema en hardware de consumo: el modelo permite mostrar en una GPU de 8 GB (por ejemplo, RTX 3070/4060 Ti) cómo un modelo de 13B puede ejecutarse con pesos de ~2 bits, midiendo VRAM con `watch_gpu.sh` y comparando el pico del allocator de PyTorch (4,96 GiB) con el pico de nvidia-smi (6,80 GiB).
- Evaluación de la técnica VPTQ: investigadores pueden reproducir la evaluación BoolQ de 3270 preguntas y comparar la precisión (81,04 %) con la versión sin adaptar (76,42 %) y con FP16 (80,49 %), usando los CSV de resultados incluidos en el paquete.
- Clasificación binaria de preguntas sobre pasajes en inglés: el modelo puede usarse como clasificador BoolQ en pipelines de extracción de respuestas sí/no, siempre que se respete el formato de prompt y se acepte la limitación de ser un modelo base.
- Pruebas de despliegue offline en entornos aislados: el ZIP incluye CPython 3.12.12, Torch 2.8.0+cu128 y Transformers 4.46.3, y la model card confirma que la instalación y ejecución funcionan sin conexión a internet, sin sudo y sin Python preinstalado, lo que lo hace adecuado para servidores air-gapped.
- Benchmarking de memoria y latencia en distintas GPU: el paquete permite medir VRAM y tiempos de carga en H200 (resultados ya publicados) y en otras tarjetas, con la advertencia de que en RTX 4090 no se ha probado oficialmente.
- Educación y formación: sirve como ejemplo práctico de cuantización post-entrenamiento vectorial, mostrando la diferencia entre bits/peso lineales (2,0163) y promedio del modelo (2,3688) y el impacto en precisión de una tarea concreta.
- Prototipado de ajuste de LM head: el script de exportación de nuevos checkpoints cuantizados permite experimentar con adaptaciones de bajo rango sobre el LM head sin reentrenar el modelo completo.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| BoolQ (3270 preguntas) | 2650/3270 correctas (81,0398 %) | H200, SDPA, batch=8, pesos comprimidos en memoria |
| BoolQ sin adaptación | 76,4220 % | Versión anterior, misma metodología |
| BoolQ FP16 (referencia) | 80,4893 % | Modelo FP16, no incluido en el paquete |
| WikiText2 PPL | ~5,615 | Objetivo del paper: 5,32 (no reproducido) |
| PIQA (control negativo) | No supera el criterio de caída de precisión | Según model card |

Métricas de memoria en H200 (SDPA, batch=8):

| Métrica | Valor |
|---|---|
| GPU tensores residentes | 3,63 GiB |
| Pico allocator PyTorch | 4,96 GiB |
| Pico nvidia-smi | 6,80 GiB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 7 GiB libres al inicio; recomendado 8 GB o más. En H200 el pico de nvidia-smi fue de 6,80 GiB con batch=8.
- GPU recomendadas: H200 (medido), RTX 4090 24 GB (capacidad suficiente según el autor, pero no probado oficialmente), GPUs con 8 GB o más de VRAM en general.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3070, 4060 Ti, 4070, etc.), siempre que se cumplan los requisitos de driver NVIDIA y glibc >= 2.28.
- Requisitos de sistema: Linux x86_64, glibc >= 2.28, driver NVIDIA funcional, 16 GB de RAM de host, 30 GB de disco libre.
- Opciones de despliegue: el paquete incluye su propio entorno (CPython 3.12.12, Torch 2.8.0+cu128, Transformers 4.46.3) y scripts `one_click.sh`, `demo.py` y `watch_gpu.sh`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor indica que el tiempo total en RTX 4090 no se ha medido y que la velocidad debe medirse en cada GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VPTQ LLaMA-2-13B 2-bit (este) | 13B | 4096 (heredado) | VPTQ 2-bit | Llama 2 Community | Hugging Face, ZIP offline |
| Llama-2-13b-hf (FP16) | 13B | 4096 | FP16 | Llama 2 Community | Hugging Face |
| NousResearch/Llama-2-13b-hf | 13B | 4096 | FP16 | Llama 2 Community | Hugging Face |
| Otras cuantizaciones 2-bit de Llama 2 13B | 13B | 4096 | 2-bit (varias técnicas) | Llama 2 Community | Depende del autor |

No se dispone de datos de benchmarks comparativos con otras cuantizaciones 2-bit en la información proporcionada. La comparación con FP16 se limita a BoolQ (81,04 % vs 80,49 %) y WikiText2 PPL (~5,615 vs objetivo 5,32 del paper).

## Limitaciones y advertencias

- Es un modelo de tarea única: el ajuste supervisado solo actualiza las filas no/yes del LM head para BoolQ. No es un modelo de instrucciones ni un asistente general.
- El modelo base es Llama 2, con sesgos conocidos de ese modelo (género, raza, religión, etc.) que persisten tras la cuantización.
- Riesgo de alucinación: al ser un LM base, la generación por continuación puede producir texto plausible pero incorrecto; no hay alineación RLHF.
- Limitación de idioma: solo inglés declarado; el rendimiento en otros idiomas no está evaluado.
- La licencia Llama 2 Community License impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales, obligaciones de atribución y políticas de uso aceptable). Es necesario revisar LICENSE y USE_POLICY.md.
- El modelo no es una publicación oficial de Meta ni de Microsoft; es un artefacto de terceros (manlen) basado en VPTQ de Microsoft Research.
- El objetivo de perplejidad del paper no se ha reproducido; el modelo adaptado obtiene ~5,615 frente a 5,32.
- El control negativo PIQA no supera el criterio de caída de precisión, lo que sugiere que la adaptación BoolQ puede degradar otras tareas.
- El paquete requiere Linux x86_64 y driver NVIDIA; no funciona en macOS, Windows nativo ni CPU.
- El ZIP se distribuye con enlaces que pueden redirigir a `cas-bridge.xethub.hf.co`; en redes restringidas puede fallar la descarga y requerir transferencia manual por SCP/SFTP.
- No hay garantía de compatibilidad con frameworks de despliegue estándar (vLLM, llama.cpp, Ollama, TGI); el paquete incluye su propio entorno.
- El repositorio no registra descargas ni likes, y la fecha de creación (2026-10-31) es futura respecto a la mayoría de referencias, lo que puede indicar un artefacto de demostración sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/manlen/vptq-llama2-13b-2bit-demo
- Descarga del ZIP: https://huggingface.co/manlen/vptq-llama2-13b-2bit-demo/resolve/main/vptq-2bit-deploy.zip?download=true
- Checksum SHA256: https://huggingface.co/manlen/vptq-llama2-13b-2bit-demo/resolve/main/vptq-2bit-deploy.zip.sha256?download=true
- Paper VPTQ: https://arxiv.org/abs/2409.17066
- Repositorio VPTQ (Microsoft): https://github.com/microsoft/VPTQ
- Modelo base: https://huggingface.co/NousResearch/Llama-2-13b-hf
- Espejo HF: https://hf-mirror.com/manlen/vptq-llama2-13b-2bit-demo
