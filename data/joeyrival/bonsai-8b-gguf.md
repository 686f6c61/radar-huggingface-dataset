# Joeyrival/Bonsai-8B-gguf

## Resumen

Bonsai-8B es un modelo de lenguaje de 8.188.548.096 parámetros (aproximadamente 8,19B, de los cuales unos 6,95B son no-embedding) desarrollado por Prism ML, distribuido en este repositorio por el usuario Joeyrival en formato GGUF con cuantización extrema de 1 bit. El modelo parte de la arquitectura densa de Qwen3-8B (GQA con 32 cabezas de consulta y 8 de clave/valor, MLP SwiGLU, RoPE y RMSNorm, 36 bloques decodificadores) y aplica una cuantización end-to-end de 1 bit sobre embeddings, proyecciones de atención, proyecciones del MLP y la cabeza LM.

La propuesta central es la eficiencia: el checkpoint ocupa 1,15 GB de memoria de parámetros frente a los 16,38 GB en FP16, una reducción del 93 % (14,2x), y según la model card es 6,2x más rápido en una RTX 4090 con 4-5x menos energía por token. El formato es GGUF Q1_0 con grupos de 128 pesos que comparten un factor de escala FP16, lo que da 1,125 bits efectivos por peso y kernels de dequantización inline que evitan materializar pesos en FP16.

Es relevante porque demuestra que un modelo de 8B puede ejecutarse en dispositivos con GPU modesta (incluido Android, Mac con Metal y CPU) manteniendo, según el autor, un rendimiento medio de 70,5 en seis categorías de benchmarks, comparable a modelos de 8B en precisión completa. Requiere, no obstante, los forks específicos de llama.cpp o MLX que incluyen los kernels Q1_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Qwen3-8B: GQA (32 cabezas de consulta / 8 de clave-valor), MLP SwiGLU, RoPE, RMSNorm, 36 bloques decodificadores |
| Parametros totales | 8.188.548.096 (~8,19B; ~6,95B no-embedding) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | GGUF Q1_0 (g128): 1 bit por peso con una escala FP16 compartida por grupo de 128 pesos; 1,125 bits efectivos por peso. Existe variante MLX 1-bit g128 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q1_0); variante MLX 1-bit g128 disponible por separado |
| Tamano del vocabulario | 151.936 tokens |
| Tamano en disco | 1,16 GB (1,15 GB de parametros mas ~6,6 MB de tokenizer, plantilla de chat y metadatos) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-8B en su variante densa: 36 bloques decodificadores con atención de consultas agrupadas (32 cabezas de consulta y 8 de clave-valor), MLP con activación SwiGLU, embeddings rotatorios (RoPE) y normalización RMSNorm. Sobre esa base, Prism ML aplica una cuantización post-entrenamiento de 1 bit a todos los componentes con pesos: embeddings, proyecciones de atención, proyecciones del MLP y cabeza LM. Cada peso se representa con un único bit: 0 se mapea a −escala y 1 a +escala, con una escala FP16 compartida por cada grupo de 128 pesos (1,125 bits efectivos por peso).

La innovación técnica principal son los kernels de dequantización inline para Q1_0 en CUDA y Metal, que operan directamente sobre los pesos de 1 bit sin materializarlos en FP16, lo que explica la ganancia de velocidad y de consumo energético. El modelo se distribuye con forks propios de llama.cpp (CUDA y Metal), MLX (Apple Silicon) y mlx-swift (iOS/macOS). La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; el modelo base es prism-ml/Bonsai-8B-unpacked y este repositorio es su versión cuantizada.

## Capacidades

- Generación de texto conversacional y de propósito general, con pipeline declarado `text-generation` y compatibilidad con endpoints conversacionales.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3-8B (la model card no desglosa capacidades específicas por tarea).
- Ejecución on-device en CUDA (RTX y datacenter), Metal (Mac), Android y CPU.
- Inferencia de bajo consumo: 4-5x menos energía por token según el autor.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, function calling, agentes o modo thinking: no disponible en la información proporcionada.
- Visión o audio: no disponible (modelo de texto).

## Casos de uso

- Asistentes locales en portátiles y equipos de sobremesa: con 1,15 GB de pesos, el modelo cabe holgadamente en GPUs de consumo y permite un asistente conversacional que no envía datos a la nube, útil en entornos con requisitos de privacidad.
- Inferencia en dispositivos móviles y edge: la compilación para Android y el soporte vía Locally AI en iPhone permiten integrar generación de texto en aplicaciones móviles sin conexión.
- Procesamiento por lotes de bajo coste energético: los 4-5x menos energía por token lo hacen adecuado para tareas masivas de clasificación, resumen o extracción donde el coste eléctrico domina el total.
- Prototipado rápido en Apple Silicon: la variante MLX 1-bit g128 y los kernels Metal permiten iterar en Macs sin GPU dedicada con tiempos de carga mínimos.
- Servicio de chat con contexto largo: los 65.536 tokens de ventana permiten gestionar conversaciones multi-turno o documentos extensos en un solo prompt dentro de un servidor llama.cpp.
- Evaluación e investigación sobre cuantización extrema: sirve como referencia para estudiar la degradación de calidad de modelos de 8B a 1 bit frente a FP16, con benchmarks publicados por el autor.
- Despliegue en contenedores con memoria limitada: el tamaño reducido del checkpoint simplifica el empaquetado y el arranque en entornos con cuotas estrictas de RAM/VRAM.

## Benchmarks y rendimiento

La model card indica una puntuación media de 70,5 en seis categorías de benchmarks, descrita como comparable a modelos de 8B en precisión completa, pero no se incluye el desglose por benchmark (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Metrica | Valor |
|---|---|
| Puntuacion media (6 categorias) | 70,5 |
| Desglose por benchmark | no disponible |
| Aceleracion frente a FP16 (RTX 4090) | 6,2x |
| Reduccion de tamano frente a FP16 | 14,1x (segun cabecera) / 14,2x (segun tabla) |
| Consumo energetico por token | 4-5x menor |

## Requisitos de hardware

- VRAM estimada para inferencia: 1,15 GB de memoria de parámetros en Q1_0; el total en ejecución debe sumar la caché KV para hasta 65.536 tokens, cuyo tamaño exacto no se detalla en la información disponible.
- GPUs recomendadas: RTX 4090 (referencia de rendimiento del autor), GPUs CUDA en general (RTX y datacenter), Apple Silicon vía Metal o MLX.
- Compatibilidad con GPU de consumo: sí, cabe en prácticamente cualquier GPU con más de 2 GB de VRAM; también en Android y CPU.
- Opciones de despliegue: llama.cpp con los kernels Q1_0 del fork de PrismML (llama-cli y llama-server), fork de MLX para Apple Silicon, mlx-swift para iOS/macOS y la app Locally AI en iPhone. vLLM, TGI y Ollama no se mencionan en la información disponible.
- Latencia y throughput: 6,2x más rápido que FP16 en RTX 4090 según el autor; no se publican tokens por segundo absolutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Bonsai-8B (este) | 8,19B | 65.536 | GGUF Q1_0, 1,15 GB | Apache 2.0 | 1 bit end-to-end, media de 70,5 en 6 categorias |
| Qwen3-8B (modelo base) | ~8B | 65.536 (segun base) | safetensors FP16, ~16,38 GB | no disponible en esta ficha | Referencia de precisión completa del que deriva Bonsai |
| Bonsai-8B MLX 1-bit | 8,19B | 65.536 | MLX 1-bit g128, 1,28 GB | Apache 2.0 | Variante para Apple Silicon del mismo modelo |

No se dispone de datos de benchmarks comparativos con otras alternativas de 8B en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 1 bit introduce degradación de calidad respecto al modelo base en FP16; el autor solo reporta una media agregada de 70,5 sin desglose, por lo que conviene validar en la tarea concreta antes de producción.
- Requiere los forks específicos de llama.cpp o MLX con kernels Q1_0; el llama.cpp estándar, vLLM, TGI u Ollama no pueden cargar este formato sin soporte adicional.
- Riesgo de alucinación inherente a los modelos de 8B, potencialmente amplificado por la cuantización extrema; no se documentan evaluaciones de factualidad.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se garantiza un rendimiento multilingüe equivalente al del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3-8B conviene verificar las condiciones del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor de la subida (Joeyrival) no es el desarrollador original (Prism ML); para producción es preferible acudir a la fuente oficial prism-ml.
- La caché KV para 65.536 tokens puede superar ampliamente el tamaño de los pesos en memoria, lo que condiciona el despliegue en dispositivos muy limitados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Joeyrival/Bonsai-8B-gguf
- Modelo base: https://huggingface.co/prism-ml/Bonsai-8B-unpacked
- Variante MLX 1-bit: https://huggingface.co/prism-ml/Bonsai-8B-mlx-1bit
- Web de Prism ML: https://prismml.com
- Whitepaper: https://github.com/PrismML-Eng/Bonsai-demo/blob/main/1-bit-bonsai-8b-whitepaper.pdf
- Repositorio de demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Notebook de Colab: https://colab.research.google.com/drive/1EzyAaQ2nwDv_1X0jaC5XiVC3ZREg9bdG?usp=sharing
- Discord: https://discord.gg/prismml
- Fork de llama.cpp con kernels 1-bit: https://github.com/PrismML-Eng/llama.cpp
- Fork de MLX: https://github.com/PrismML-Eng/mlx
- Fork de mlx-swift: https://github.com/PrismML-Eng/mlx-swift
- Locally AI (iPhone): https://locallyai.app/
