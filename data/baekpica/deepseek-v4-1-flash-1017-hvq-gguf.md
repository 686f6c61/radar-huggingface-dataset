# Baekpica/DeepSeek-V4.1-Flash-1017-hVQ-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-hVQ-GGUF es una cuantización experimental de muy bajo bit del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario Baekpica en Hugging Face. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de los pesos originales (FP4/FP8) a formato GGUF mediante una técnica propia de cuantización vectorial con realimentación de error (hVQ, Hessian vector quantization), que aplica ideas de GPTQ/GPTVQ sobre los expertos enrutados de la arquitectura Mixture-of-Experts (MoE). El resultado conserva el inventario de tensores y el diseño de bytes del release VQ base, de modo que puede servirse con el mismo runtime.

El modelo base es un transformer MoE multimodal (image-text-to-text) con capacidades declaradas de visión, contexto de 1.048.576 tokens, decodificación especulativa mediante torres MTP (multi-token prediction) y tablas Engram. La conversión mantiene los expertos enrutados a aproximadamente 1,6 bits por peso, lo que reduce el peso del repositorio a unos 113,5 GB repartidos en 40 ficheros, un tamaño manejable en estaciones de trabajo con suficiente memoria unificada.

Su relevancia es doble: por un lado, demuestra una técnica de cuantización que mejora la fidelidad respecto a la cuantización vectorial escalar (iVQ) sin cambiar el tamaño ni el layout del fichero; por otro, hace accesible un modelo de contexto de un millón de tokens en hardware tipo DGX Spark (GB10) con velocidades de decodificación de 30 a 36 tok/s. La licencia es MIT y los idiomas declarados son inglés, chino y coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal, con MTP y Engram; cuantización vectorial hVQ sobre expertos enrutados |
| Parametros totales | 485.283.840 (dato de safetensors del repo); el modelo base declara un inventario de 1.000 tensores y 113.556.639.424 bytes en GGUF |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (según metadatos del modelo) |
| Tipos de cuantizacion | GGUF con expertos enrutados a ~1,6 bits por peso; capas 0–13 a 13 bits K=8192, capas 14–39 a 12 bits K=4096; esqueleto q4_K; gains F16 |
| Idiomas soportados | en, zh, ko |
| Licencia | MIT |
| Formato de pesos | GGUF (40 partes, 113.556.639.424 bytes); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4.1-Flash-1017 es un transformer con mezcla de expertos (MoE) de tipo multimodal image-text-to-text. Incorpora torres MTP (multi-token prediction) para decodificación especulativa, tablas Engram y un sidecar de visión. El contexto declarado alcanza 1.048.576 tokens. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La contribución técnica de esta ficha es la cuantización hVQ aplicada a los 40 blobs de expertos enrutados. Cada matriz de experto se divide en vectores de 8 pesos por fila; cada fila se normaliza por su ganancia y cada vector se sustituye por uno de K codewords compartidos. Frente a iVQ, que solo usa la diagonal de la segunda matriz de momentos de entrada H = Σ x xᵀ, hVQ incorpora la parte fuera de la diagonal al estilo GPTQ/GPTVQ: los bloques de 8 columnas se asignan en orden y el error de cada bloque se propaga a los objetivos de los bloques posteriores mediante la factorización H_t = V Vᵀ, de modo que los errores en canales de entrada correlacionados se cancelan en la salida del experto. La ganancia de fila se reajusta por mínimos cuadrados bajo H_t. Solo cambian los índices de código y las ganancias de fila; los codebooks, el reparto de bits, el layout y el tamaño del fichero son idénticos al release iVQ, y todo lo que queda fuera de los blobs de expertos es byte a byte igual al VQ base.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventanas de hasta 1.048.576 tokens.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con sidecar de visión incluido en el paquete.
- Modo thinking (razonamiento explícito) y modo chat, verificados en el runtime ds4-dfm-rs.
- Tool calling y function calling, con las cuatro superficies de API operativas según la model card.
- Decodificación especulativa automática mediante torres MTP, que acelera la generación.
- Capacidades multilingües en inglés, chino y coreano.
- Soporte de agentes y razonamiento multi-paso a través de las herramientas y el modo thinking.
- Uso de tablas Engram para memoria asociativa interna del modelo.

## Casos de uso

- Análisis de documentación extensa: con 1.048.576 tokens de contexto, el modelo puede ingerir manuales técnicos, expedientes o bases de código completas en una sola pasada y responder preguntas cruzadas sin trocear el material.
- Asistencia conversacional multilingüe: cubre inglés, chino y coreano en un mismo despliegue, útil para atención al cliente en organizaciones con operaciones en Asia Oriental.
- Procesamiento de documentos con imágenes: al ser image-text-to-text, permite extraer y razonar sobre capturas, diagramas o formularios escaneados combinados con texto.
- Agentes con herramientas: el soporte de tool calling y las cuatro superficies de API permiten integrarlo en orquestadores de agentes que consulten bases de datos o ejecuten acciones externas.
- Despliegue en hardware de un solo nodo: con unos 113,5 GB de pesos y 30–36 tok/s de decodificación en DGX Spark (GB10), es viable para prototipos y entornos de investigación sin clúster multi-GPU.
- Investigación en cuantización: sirve como referencia reproducible para estudiar el efecto de la realimentación de error fuera de la diagonal en modelos MoE, ya que el autor publica métricas de fidelidad frente al modelo original.
- Generación de código y razonamiento técnico: el modo thinking y el contexto largo permiten revisar repositorios completos y razonar sobre dependencias entre ficheros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas en la información disponible. El autor indica explícitamente que no se ha ejecutado ningún benchmark de tarea y que la generación muestreada solo se comprobó en un conjunto pequeño con semilla. Las métricas publicadas son de fidelidad respecto al modelo original:

| Metrica | Original | hVQ | Variacion |
|---|---|---|---|
| Error mediano por capa de salida enrutada | 0,2876 | 0,1885 | -34,5% |
| KL en posiciones generadas (referencia forward) | 0,2899 | 0,2408 | -17,0% |
| NLL en posiciones generadas (referencia forward) | 1,3466 | 1,3589 | +0,9% |
| KL en DGX Spark (GGUF liberado) | 0,296 | 0,247 | -16,7% |
| Top-1 coincidente en DGX Spark | 81,9% | 84,0% | +2,1 pp |
| NLL en DGX Spark | 1,348 | 1,360 | +0,012 |

En DGX Spark con ds4-dfm-rs (commit 58738c04), el prefill se sitúa en 1.291–1.757 tok/s y la decodificación en 30–36 tok/s con MTP automático, en un barrido de prefill completo de 2K a 64K.

## Requisitos de hardware

- VRAM/memoria estimada: unos 113,5 GB de pesos en GGUF, más overhead de contexto KV; el contexto de 1M tokens requiere memoria adicional significativa no cuantificada en la información disponible.
- GPU recomendadas: DGX Spark (GB10) es el hardware validado por el autor; el runtime ds4-dfm-rs es CUDA. Para GPUs de centro de datos (A100, H100) no se han publicado pruebas.
- GPU de consumo: no cabe en GPUs consumer convencionales por el tamaño del modelo; requiere memoria unificada o multi-GPU.
- Opciones de despliegue: ds4-dfm-rs (CUDA, DGX Spark) y YoungAi ds4-server, que lee el mismo layout. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: prefill 1.291–1.757 tok/s y decodificación 30–36 tok/s en DGX Spark con MTP automático.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-hVQ-GGUF | 485.283.840 (safetensors); GGUF de 113,5 GB | 1.048.576 | ~1,6 bits expertos, q4_K esqueleto | MIT | Hugging Face, runtime ds4-dfm-rs |
| DeepSeek-V4.1-Flash-1017-iVQ-GGUF | Mismo inventario que hVQ | 1.048.576 | VQ con diagonal de H | MIT | Hugging Face |
| DeepSeek-V4.1-Flash-1017-VQ-GGUF | Mismo inventario que hVQ | 1.048.576 | VQ base (vq8sh14-q4k-mtpnative) | MIT | Hugging Face |
| DeepSeek-V4.1-Flash-1017 (original) | no disponible en detalle | 1.048.576 | FP4/FP8 | MIT | Hugging Face |

Las tres variantes cuantizadas comparten codebooks, layout y tamaño; la diferencia medible es la fidelidad, con hVQ por delante de iVQ y VQ en error de salida enrutada y KL. No se dispone de comparación con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Release experimental de bajo bit: los expertos enrutados están a ~1,6 bits por peso y las métricas describen fidelidad con teacher forcing, no calidad en generación libre.
- No se ha ejecutado ningún benchmark de tarea; el rendimiento en MMLU, HumanEval, GSM8K u otras pruebas no está medido.
- La generación muestreada solo se comprobó en un conjunto pequeño con semilla, por lo que pueden aparecer degradaciones no caracterizadas.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en esta conversión.
- Idiomas limitados a inglés, chino y coreano; el castellano no está declarado como soportado.
- El contexto de 1M tokens exige memoria adicional para KV cache no especificada; en hardware limitado habrá que truncar.
- Dependencia de un runtime específico (ds4-dfm-rs o YoungAi ds4-server); no hay soporte documentado en vLLM, llama.cpp u Ollama.
- Licencia MIT permite uso comercial, pero el modelo base y los pesos originales deben verificarse por separado; la model card no detalla restricciones adicionales del modelo fuente.
- El autor pide reportar problemas con prompt, parámetros de muestreo y commit del runtime en la pestaña Community.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Baekpica/DeepSeek-V4.1-Flash-1017-hVQ-GGUF
- Release iVQ: https://huggingface.co/Baekpica/DeepSeek-V4.1-Flash-1017-iVQ-GGUF
- Release VQ base: https://huggingface.co/Baekpica/DeepSeek-V4.1-Flash-1017-VQ-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/tree/1bae0e1088993b9b82de08f59de5be5a34e42170
- Runtime ds4-dfm-rs: https://github.com/Baekpica/ds4-dfm-rs
- Discusiones: https://huggingface.co/Baekpica/DeepSeek-V4.1-Flash-1017-hVQ-GGUF/discussions
- Papers referenciados en los tags: arXiv 2402.15319, 2402.04396, 2307.13304, 2210.17323, 2604.13806, 2310.16795, 2505.03804, 2506.07900, 1612.01543, 1907.05686, 2306.07629, 2409.17066, 2401.06118, 2410.16926, 1412.6115, 2608.25188
