# scottlowry/Qwen3.5-4B-oQ4e-fp16-mtp

## Resumen

Qwen3.5-4B-oQ4e-fp16-mtp es una cuantización mixta del modelo base Qwen/Qwen3.5-4B, publicada por el usuario scottlowry en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a la inferencia en Apple Silicon mediante MLX, utilizando la herramienta oQ (oMLX v0.7.4.dev1) con precisión mixta: la mayor parte de los pesos se almacenan en 4 y 5 bits afines con grupo de 64, mientras que las capas de visión y la cabeza MTP (multi-token prediction) se conservan en FP16/FP32.

El checkpoint declara 4.659.865.088 parámetros totales y un peso efectivo medio de 6,833 bits por peso, con un almacenamiento de 3,707 GiB (3,980 GB) repartidos entre el modelo de lenguaje (4,206B parámetros lógicos), el codificador visual (0,334B) y la cabeza MTP (0,121B). La inclusión de la cabeza MTP y de la torre de visión indica que el modelo base es multimodal y soporta decodificación especulativa multi-token, aunque la model card no documenta el contexto ni los idiomas.

Su relevancia es práctica: ofrece una versión de ~3,7 GiB que cabe en memoria unificada de equipos Apple y permite ejecutar un modelo Qwen3.5 de 4B con visión y MTP sin recurrir a GPUs dedicadas. La información pública disponible es muy limitada: no hay benchmarks, no se especifica licencia, idiomas ni pipeline, y el repositorio apenas acumula 43 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5) con torre de visión y cabeza MTP; pesos cuantizados para MLX |
| Parametros totales | 4.659.865.088 (4,66B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta afín con grupo 64: 4-bit (60,19% de pesos), 5-bit (31,71%), 6-bit (0,62%), 8-bit (0,01%), FP16 (0,30%), FP32 (7,16%); media efectiva 6,833 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), cuantización afín por grupos |
| Tamano del repositorio | 15,8 GB (pesos efectivos 3,707 GiB / 3,980 GB) |
| Libreria de inferencia | mlx |
| Modelo base | Qwen/Qwen3.5-4B |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B pertenece a la familia Qwen3.5 de Alibaba, de la que esta ficha no dispone de detalles de entrenamiento: no se documentan tokens de preentrenamiento, composición del corpus ni fases de RLHF o DPO. Lo que sí se deduce del checkpoint es su estructura: un modelo de lenguaje de 4,206B parámetros lógicos, un codificador visual de 0,334B (lo que confirma capacidades multimodales) y una cabeza MTP de 0,121B para predicción multi-token.

La innovación de esta publicación no está en el entrenamiento sino en la cuantización. oQ aplica precisión mixta por tensor: las matrices más sensibles se mantienen en 5 bits, 6 bits u 8 bits, y las capas de visión y MTP quedan en FP16/FP32, mientras que el grueso del transformer se comprime a 4 bits. El resultado es un checkpoint de 3,7 GiB con una media de 6,833 bits/peso, sustancialmente más pequeño que un FP16 equivalente (~9,3 GB) y con menor degradación esperada que una cuantización uniforme a 4 bits. La cabeza MTP habilita decodificación especulativa multi-token en MLX, lo que puede aumentar el throughput de generación.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5-4B, aunque no se documentan evaluaciones.
- Procesamiento de imagen: el checkpoint incluye una torre de visión de 0,334B parámetros en FP32, por lo que conserva capacidades multimodales de entrada visual.
- Predicción multi-token (MTP): cabeza dedicada de 0,121B que permite decodificación especulativa y generación de varios tokens por paso.
- Inferencia optimizada para Apple Silicon mediante MLX y pesos cuantizados afines.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac: el checkpoint de 3,7 GiB cabe en la memoria unificada de un Mac con 16 GB o más, permitiendo ejecutar un modelo Qwen3.5 de 4B con visión sin GPU dedicada mediante MLX.
- Asistentes de escritorio con entrada visual: la torre de visión en FP32 permite procesar capturas de pantalla o imágenes en aplicaciones locales de macOS, con la ventaja de que los pesos visuales no han sufrido cuantización.
- Prototipado rápido de aplicaciones multimodales: al ser un checkpoint MLX listo para cargar, sirve para validar pipelines de visión-lenguaje antes de migrar a versiones de mayor tamaño o a infraestructura GPU.
- Generación de texto interactiva de baja latencia: la cabeza MTP permite decodificación especulativa, útil en chats locales donde el tiempo hasta el primer token y el throughput importan.
- Evaluación de técnicas de cuantización: el desglose por bits del autor lo convierte en un caso de estudio para medir el impacto de la precisión mixta frente a cuantizaciones uniformes de 4 bits.
- Investigación sobre decodificación especulativa: la inclusión de la cabeza MTP facilita experimentos con generación multi-token en MLX sin necesidad de entrenar cabezas auxiliares.
- Despliegue en entornos con memoria limitada: 3,7 GiB de pesos permiten ejecutar el modelo junto a otras cargas en equipos con 16-24 GB de memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta la distribución de bits y el almacenamiento; no incluye MMLU, HumanEval, GSM8K ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM/memoria estimada: 3,7 GiB solo para pesos; con caché KV y overhead de MLX, se recomienda un mínimo de 8 GB de memoria unificada, y 16 GB para contexto largo o uso concurrente con otras aplicaciones.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4 y superiores) con memoria unificada; el formato MLX no está pensado para CUDA.
- GPU de consumidor: cabe en cualquier Mac con 16 GB o más; en equipos con 8 GB es ajustado pero posible con contextos cortos.
- Opciones de despliegue: MLX (librería nativa del checkpoint) y oMLX; no se distribuyen pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión previa.
- Latencia y throughput: no disponibles; la cabeza MTP debería mejorar el throughput frente a decodificación token a token, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-oQ4e-fp16-mtp (este) | 4,66B (4,206B LM + 0,334B visión + 0,121B MTP) | no disponible | safetensors MLX, 6,833 bits/peso | no disponible | Cuantización mixta con visión y MTP en FP16/FP32 |
| Qwen/Qwen3.5-4B (base) | ~4,66B | no disponible | safetensors FP16/BF16 | no disponible | Referencia sin cuantizar; mayor tamaño en disco (~9,3 GB) |
| Cuantización uniforme 4-bit del mismo base | ~4,66B | no disponible | safetensors/GGUF | no disponible | Menor tamaño pero mayor pérdida esperada en capas sensibles |
| Modelos MLX de la comunidad para Apple Silicon | variable | variable | safetensors MLX | variable | Ecosistema amplio; la ventaja aquí es la preservación de visión y MTP |

No se dispone de datos de rendimiento comparado para establecer diferencias cuantitativas con estas alternativas.

## Limitaciones y advertencias

- La model card no especifica licencia, lo que impide confirmar si el uso comercial está permitido; hay que remitirse a la licencia del modelo base Qwen/Qwen3.5-4B.
- No se documentan idiomas soportados, por lo que el rendimiento multilingüe es incierto.
- No hay benchmarks publicados: no se puede verificar la degradación introducida por la cuantización mixta frente al modelo base en FP16.
- El repositorio tiene 43 descargas y 0 likes, con una única revisión de cuantización; la validación comunitaria es prácticamente nula.
- Riesgo de alucinación inherente a un modelo de 4B, agravado por la compresión a 4 bits en el 60% de los pesos.
- La cuantización mixta puede afectar de forma desigual a tareas de razonamiento o código; conviene evaluar por caso de uso.
- Formato exclusivo MLX: no es directamente utilizable en CUDA, vLLM ni TGI sin conversión.
- El tamaño del repositorio (15,8 GB) es muy superior al de los pesos efectivos (3,7 GiB), probablemente por artefactos de cuantización; hay que prever espacio en disco para la descarga.
- El autor recomienda volver a descargar si se tenía una copia anterior a la actualización del 11 de noviembre de 2026, lo que indica cambios en los pesos.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Qwen3.5-4B-oQ4e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
