# mlx-community/ACE-Step-1.5-turbo-bf16

## Resumen

ACE-Step 1.5 turbo es un modelo de generación de música y audio a partir de texto, desarrollado por ACE Studio y StepFun. Esta ficha concreta, `mlx-community/ACE-Step-1.5-turbo-bf16`, es una conversión comunitaria del checkpoint oficial `ACE-Step/Ace-Step1.5` al formato MLX en bf16, realizada por mlx-community a partir del port Swift-MLX de xocialize. El modelo resuelve la síntesis de audio musical condicionada por una descripción textual (caption) y, opcionalmente, por letras estructuradas, produciendo pistas estéreo a 48 kHz.

La arquitectura es un modelo generativo de flow-matching compuesto por un DiT de 2 B parámetros con 24 capas y atención alternada (sliding-128 y atención completa), un codificador de condiciones que incluye un codificador de letras de 8 capas, un codificador de timbre de 4 capas y un proyector de texto, además de un tokenizador de audio FSQ y un detokenizador de 2 capas. El conjunto suma 2.393.872.518 parámetros en 677 tensores y ocupa 4,8 GB en el repositorio.

Su relevancia actual radica en que permite ejecutar generación musical de alta calidad sobre Apple Silicon mediante MLX Swift, con soporte de referencia de timbre, cover, repaint y extend de clips existentes, y marcas de tiempo LRC. La licencia es MIT, lo que facilita la integración en proyectos comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flow-matching DiT (24 capas, atención alternada sliding-128 / completa, adaLN, cross-attention) + codificador de condiciones (letras 8 capas, timbre 4 capas, proyector de texto) + tokenizador FSQ + detokenizador de 2 capas |
| Parámetros totales | 2.393.872.518 (677 tensores) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | bf16 (este bundle); el paquete Swift ofrece planners en 8 bits y 4 bits para el componente planner |
| Idiomas soportados | No disponible (las letras se aportan como texto de entrada; no se declara cobertura de idiomas) |
| Licencia | MIT (Copyright (c) 2026 ACEStep) |
| Formato de pesos | safetensors (MLX, bf16), más `silence_latent.safetensors` ([15000, 64] fp32) |

## Arquitectura y entrenamiento

El núcleo es un Diffusion Transformer (DiT) de 2 B parámetros entrenado con flow-matching. Consta de 24 capas que alternan atención de ventana deslizante de 128 y atención completa, con modulación adaLN y cross-attention hacia las condiciones. El codificador de condiciones agrega tres componentes: un codificador de letras de 8 capas, un codificador de timbre de 4 capas (para referencia de audio) y un proyector de texto que mapea el caption al espacio del DiT. El audio se representa mediante un tokenizador FSQ con attention pooler y ResidualFSQ con niveles [8, 8, 8, 5, 5, 5], y se reconstruye con un detokenizador de 2 capas. El pipeline rellena y referencia un latente de silencio de 15000 x 64 en fp32.

En cuanto a datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO), la información proporcionada no los detalla; remite al tech report arXiv:2602.00744 para la descripción completa. La innovación destacable de esta ficha es la conversión a MLX: los pesos no se modifican más allá del cambio de layout (prefijo de claves, layout de convoluciones `[out, k, in]`, folding de weight-norm), y el conversor está validado bit-equal contra las herramientas oficiales `dit_convert.py` / `vae_convert.py` del upstream (MEASUREMENTS.md §V1).

## Capacidades

- Generación de música a partir de texto (text2music): caption y letras estructuradas producen una canción estéreo a 48 kHz.
- Condicionamiento por letras con secciones (por ejemplo, `[Verse]`) y marcas de tiempo LRC.
- Referencia de timbre a partir de audio de referencia.
- Edición de audio: cover, repaint y extend de un clip fuente.
- Control de duración (en segundos) y semilla (seed) para reproducibilidad.
- Ejecución nativa en Apple Silicon mediante MLX Swift a través del paquete `mlx-ace-step-swift`.
- Integración con MLXEngine en la capacidad `music`.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada conversacional.

## Casos de uso

- Composición musical asistida en estaciones de trabajo Apple: un músico describe el estilo con un caption y aporta letras para obtener una maqueta estéreo a 48 kHz, aprovechando la inferencia local en MLX sin depender de servicios en la nube.
- Prototipado rápido de bandas sonoras para vídeo: se genera una pista con duración fijada en segundos y semilla reproducible, adecuada para iterar variaciones de una misma escena.
- Cover y repaint de clips existentes: se parte de un audio fuente y se reescribe una sección o se transforma el estilo conservando la estructura, útil para remezclas o adaptaciones.
- Extend de pistas cortas: se prolonga un fragmento musical manteniendo coherencia estilística, práctico para demos que necesitan más duración.
- Referencia de timbre para coherencia de catálogo: se condiciona la generación con un audio de referencia para mantener una paleta sonora consistente en varias pistas de un mismo proyecto.
- Generación de letras sincronizadas con LRC: se producen marcas de tiempo que alimentan reproductores o herramientas de subtitulado musical.
- Integración en apps nativas de macOS/iOS: mediante MLX Swift y MLXEngine, el modelo se registra como capacidad `music` y se invoca desde código Swift, lo que permite incrustar generación musical en aplicaciones locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación menciona únicamente puertas de paridad (parity gates) frente al oráculo upstream en fp32 con TF32 desactivado, registradas en MEASUREMENTS.md, sin cifras de calidad objetiva reproducidas aquí.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio pesa 4,8 GB en bf16 para este bundle; el pipeline completo requiere además un planner (1.7 B en 8 bits por defecto, o 0.6 B en versión lite), un codificador de texto y una VAE, por lo que el consumo total supera el del solo DiT.
- Plataforma objetivo: Apple Silicon mediante MLX Swift; no se documentan requisitos para GPU NVIDIA.
- GPU recomendadas: no disponibles para CUDA; en Apple Silicon se asume ejecución en memoria unificada, sin modelos concretos de chip especificados en la información.
- ¿Cabe en GPU de consumo? No se dispone de datos para GPUs de consumo tipo RTX; en equipos Apple Silicon con memoria unificada suficiente es viable según el tamaño del bundle y los componentes adicionales.
- Opciones de despliegue: MLX Swift a través de `xocialize/mlx-ace-step-swift` y MLXEngine (`MLXServeEngine`); no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este pipeline de audio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACE-Step-1.5-turbo-bf16 (esta ficha) | 2,39 B | No disponible | Texto + letras → audio musical 48 kHz | MIT | Hugging Face (MLX) |
| ACE-Step/Ace-Step1.5 (upstream) | No disponible en la información | No disponible | Texto + letras → audio musical | MIT | Hugging Face (checkpoint oficial) |
| Alternativas de generación musical texto-a-audio | No disponible | No disponible | Texto → audio | No disponible | No disponible |

No se dispone en la información proporcionada de otros modelos comparables con parámetros, contexto y rendimiento verificables, por lo que la comparativa cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo musical, puede reflejar sesgos estilísticos y culturales de sus datos de entrenamiento.
- Riesgo de alucinación: no evaluado; en generación musical se traduce en posibles incoherencias armónicas o de estructura en pistas largas.
- Limitaciones de contexto e idioma: la longitud de contexto no está declarada y la cobertura de idiomas para las letras no se especifica.
- Restricciones de licencia: MIT, con Copyright (c) 2026 ACEStep; el repositorio upstream no incluye archivo LICENSE propio, por lo que el texto controlante es el LICENSE de GitHub del proyecto.
- Es una conversión comunitaria (mlx-community), no un checkpoint oficial; conviene validar la paridad con el upstream para usos críticos.
- Dependencia de plataforma: orientado a MLX/Apple Silicon; el uso en otros entornos requiere el checkpoint original y herramientas distintas.
- El pipeline completo necesita varios bundles (planner, codificador de texto, VAE) además de este DiT, lo que condiciona memoria y complejidad de despliegue.
- No se han publicado métricas de calidad objetiva en la información disponible, por lo que la evaluación en producción debe hacerse con pruebas propias.

## Enlaces

- Hugging Face (esta ficha): https://huggingface.co/mlx-community/ACE-Step-1.5-turbo-bf16
- Modelo base oficial: https://huggingface.co/ACE-Step/Ace-Step1.5
- Repositorio de código upstream: https://github.com/ace-step/ACE-Step-1.5
- Licencia upstream: https://github.com/ace-step/ACE-Step-1.5/blob/main/LICENSE
- Tech report: https://arxiv.org/abs/2602.00744
- Port Swift-MLX y conversor: https://github.com/xocialize/mlx-ace-step-swift
- MLX Swift: https://github.com/ml-explore/mlx-swift
- MLXEngine: https://github.com/xocialize/mlx-engine-swift
