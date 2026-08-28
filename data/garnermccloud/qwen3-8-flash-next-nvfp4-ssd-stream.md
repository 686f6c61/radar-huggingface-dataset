# garnermccloud/Qwen3.8-Flash-Next-NVFP4-SSD-Stream

## Resumen

Qwen3.8-Flash-Next-NVFP4-SSD-Stream es una variante de despliegue del modelo multimodal Qwen3.8-Flash-Next, preparada por el usuario garnermccloud para el motor de inferencia SGLang con la extensión `sglang-ssd-stream`. Su propósito principal es reducir el consumo de RAM del sistema en entornos de servidor: la tabla de lookup de 48 GB (51.200 millones de parámetros FP8) se almacena en un archivo sidecar en SSD local y se carga de forma asíncrona durante la generación, en lugar de ocupar memoria RAM de forma permanente. El checkpoint fuente es RadixArk/Qwen3.8-Flash-Next-NVFP4, que a su vez deriva del modelo abierto Qwen/Qwen3.8-Flash-Next de Alibaba.

El modelo mantiene intactas las capacidades del original: entrada multimodal (texto, imagen y vídeo), salida de texto, razonamiento, tool calling y decodificación especulativa nativa MTP. La arquitectura lógica se describe como aproximadamente 180.000 millones de parámetros, aunque Hugging Face muestra 68.000 millones de elementos de almacenamiento visibles porque la tabla de lookup FP8 reside fuera de los safetensors. El contexto máximo declarado en la arquitectura fuente es de 262.144 tokens. Esta variante está pensada para entornos con GPUs Blackwell y SSD local, y ha sido validada en una RTX PRO 6000 Blackwell.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE) y tabla de lookup n-gram determinista |
| Parametros totales | Aproximadamente 180B lógicos (según el modelo fuente); 68.4B elementos de almacenamiento visibles en safetensors |
| Parametros activos | No disponible (arquitectura MoE, pero no se especifica el número de expertos activos) |
| Longitud de contexto | 262.144 tokens (arquitectura fuente) |
| Tipos de cuantizacion | NVFP4 W4A4 para expertos enrutados; BF16 para atención, expertos compartidos, embeddings, LM head, visión y MTP; FP8 para la tabla de lookup (sidecar SSD) |
| Idiomas soportados | No disponible |
| Licencia | other (se remite a la licencia del modelo fuente Qwen/Qwen3.8-Flash-Next) |
| Formato de pesos | Safetensors (modelo principal) + sidecar SSD binario (tabla FP8) |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next es un modelo multimodal de la familia Qwen que combina un transformer con mezcla de expertos (MoE) y una tabla de lookup n-gram determinista de 51.200 millones de parámetros. Según la documentación del proyecto `sglang-ple-ssd`, esta tabla no se utiliza mediante multiplicación de matrices, sino mediante 16 búsquedas deterministas por token generado, cada fila de 160 bytes en FP8. El resto de componentes (atención, expertos compartidos, embeddings, cabezal de salida, módulos de visión y pesos MTP) se mantienen en BF16. La cuantización NVFP4 W4A4 se aplica únicamente a los expertos enrutados, mediante ModelOpt.

El entrenamiento original del modelo base no se detalla en la información disponible, pero se sabe que es un modelo abierto de la serie Qwen3.8, lanzado en agosto de 2026. La variante SSD-Stream no modifica los pesos: solo reorganiza el layout de la tabla de lookup para permitir su carga diferida desde disco. La extensión `sglang-ssd-stream` implementa un pipeline de E/S asíncrona con `io_uring` en Rust, que solapa las lecturas SSD con el cómputo de la GPU, deduplicando páginas de 4 KiB y restaurando las filas en orden antes de su consumo.

## Capacidades

- Generación de texto con razonamiento y respuestas estructuradas.
- Entrada multimodal: imágenes y vídeo, con salida de texto.
- Tool calling / function calling estructurado, validado en el conjunto de pruebas de aceptación.
- Decodificación especulativa nativa MTP (Multi-Token Prediction), que acelera la generación sin necesidad de un modelo draft externo.
- Soporte de contexto largo: hasta 262.144 tokens en la arquitectura fuente, probado con una petición de recuperación de 120.043 tokens.
- API compatible con OpenAI (chat completions) a través de SGLang.
- Capacidad de procesar documentos extensos, bases de código completas y conversaciones complejas en una sola pasada.

## Casos de uso

- Servicio de chat multimodal en producción: el modelo puede recibir imágenes y vídeo junto con texto, lo que permite desplegar asistentes que analizan capturas de pantalla, diagramas o vídeos cortos en tiempo real, con una API compatible con OpenAI.
- Recuperación de información en documentos largos: con 262K de contexto, puede procesar manuales técnicos, expedientes o contratos de cientos de páginas y responder preguntas específicas sin necesidad de RAG externo.
- Generación de código asistida con tool calling: integrado en un IDE o pipeline de CI/CD, puede invocar funciones de análisis estático, ejecutar tests o modificar archivos, gracias a su soporte nativo de herramientas estructuradas.
- Razonamiento multi-paso para agentes autónomos: su capacidad de razonamiento y tool calling permite construir agentes que planifican, ejecutan acciones y verifican resultados, con decodificación especulativa para reducir la latencia.
- Análisis de vídeo para vigilancia o revisión de contenido: al aceptar entrada de vídeo, puede resumir secuencias, detectar eventos o transcribir diálogos, siempre que el hardware lo permita.
- Despliegue en servidores con RAM limitada: gracias al SSD Stream, se puede servir el modelo en máquinas donde la tabla de lookup de 48 GB no cabe en RAM, liberando memoria para KV cache y otros procesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La búsqueda web menciona que el modelo base Qwen3.8-Flash-Next ha sido evaluado en JobBench, CoWorkBench, IFBench y Agent's Last Exam, pero no se proporcionan cifras concretas.

Los únicos datos de rendimiento disponibles corresponden a pruebas de throughput realizadas por el autor en una RTX PRO 6000 Blackwell, con MTP nativo, CUDA graphs y una generación de 1.024 tokens:

| Configuracion | Throughput efectivo | Memoria de trabajo de la tabla |
|---|---|---|
| Tabla cargada en RAM | 148,5-156,2 tok/s | 47,68 GiB |
| SSD Stream | 164,7 tok/s | Aproximadamente 64 MiB |

En peticiones con contenido denso y filas de lookup no vistas, el rendimiento medido fue de 126-137 tok/s. El conjunto de pruebas de aceptación también verificó tool calls estructurados, imágenes no relacionadas, una petición de recuperación de 120.043 tokens, MTP nativo, replay de CUDA graphs, reinicio con reutilización y una carga de trabajo alterna sostenida sin swap, OOM, reinicios ni crecimiento de memoria del host.

## Requisitos de hardware

- GPU: obligatoriamente una GPU Blackwell (la validación se realizó en una RTX PRO 6000 Blackwell). El soporte para DGX Spark está pendiente de aceptación.
- VRAM: no se especifica un valor exacto, pero al tratarse de un modelo de ~180B lógicos con cuantización NVFP4 y BF16, se requiere una GPU con al menos 48 GB de VRAM (la RTX PRO 6000 Blackwell tiene 96 GB).
- SSD local: imprescindible para el sidecar de 51,2 GB (archivo de 51.200.245.760 bytes). Se recomienda NVMe para alcanzar el throughput declarado.
- RAM del sistema: el diseño reduce la carga de RAM a aproximadamente 64 MiB para la tabla, más los buffers de staging (32 MiB de pool de páginas registradas y dos buffers de 16 MiB).
- Sistema operativo: Linux.
- Motor de inferencia: SGLang con la extensión `sglang-ssd-stream` (independiente, no oficial). No es compatible con vLLM, llama.cpp u Ollama en esta configuración.
- Latencia y throughput: 164,7 tok/s en la configuración validada; 126-137 tok/s en cargas con contenido denso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-NVFP4-SSD-Stream (este) | ~180B lógicos | 262K | NVFP4 + BF16 + FP8 | other | Hugging Face |
| Qwen3.8-Flash-Next (base) | ~125-180B (según fuente) | 262K | BF16 | other | Hugging Face |
| Qwen3.8-Flash (versión oficial) | No disponible | 1M | No disponible | other | QwenCloud / Hugging Face |

La comparativa se limita a las variantes de Qwen porque no se dispone de datos suficientes sobre otros modelos multimodales de tamaño similar con cuantización NVFP4 y SSD streaming. La principal diferencia de esta variante frente al base es el ahorro de 48 GB de RAM a costa de requerir un SSD local y el motor SGLang modificado. Frente a Qwen3.8-Flash, la versión oficial ofrece 1M de contexto y herramientas integradas, pero no está disponible en esta configuración de bajo consumo de RAM.

## Limitaciones y advertencias

- La licencia es "other" y se remite a los términos del modelo fuente Qwen/Qwen3.8-Flash-Next; es necesario revisar esa licencia antes de uso comercial.
- El modelo solo funciona con GPUs Blackwell; no es compatible con GPUs Ampere, Ada Lovelace o anteriores.
- Requiere la extensión `sglang-ssd-stream`, que es un proyecto independiente y no forma parte de SGLang oficial; su mantenimiento y estabilidad dependen del autor.
- El rendimiento depende críticamente de la velocidad del SSD; con discos lentos o saturados, la latencia puede degradarse.
- No se han publicado evaluaciones de sesgos, alucinación o seguridad para esta variante ni para el modelo base en la información disponible.
- El número de parámetros mostrado por Hugging Face (68B) no refleja la arquitectura lógica real (~180B), lo que puede inducir a error al dimensionar recursos.
- El contexto de 262K es el máximo de la arquitectura fuente, pero no se ha verificado en esta variante más allá de una prueba de 120.043 tokens.
- No se especifican los idiomas soportados; se asume cobertura multilingüe similar a otros modelos Qwen, pero no está confirmado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/garnermccloud/Qwen3.8-Flash-Next-NVFP4-SSD-Stream
- Checkpoint fuente (RadixArk): https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Modelo base (Qwen): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de la extensión sglang-ssd-stream: https://github.com/garnermccloud/sglang-ssd-stream
- Documentación del proyecto sglang-ple-ssd (tabla de lookup): https://github.com/garnermccloud/sglang-ple-ssd/blob/main/README.md
- Página de Qwen3.8-Flash en QwenCloud: https://www.qwencloud.com/models/qwen3.8-flash
- Repositorio oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Página de benchmarks y especificaciones de Qwen3.8-Flash-Next: https://aireleasetracker.com/model/qwen/qwen3.8-flash-next
