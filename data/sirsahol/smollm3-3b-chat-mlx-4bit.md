# SirSahOl/SmolLM3-3B-chat-mlx-4bit

## Resumen

SmolLM3-3B-chat-mlx-4bit es una conversión de pesos a formato MLX con cuantización de 4 bits del modelo HuggingFaceTB/SmolLM3-3B, publicada por el usuario SirSahOl. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: el autor aplica `mlx_lm.convert` sobre el modelo base para producir un checkpoint de 1,6 GB (repo de 1,7 GB) que puede ejecutarse íntegramente en Apple Silicon mediante la librería MLX de Apple. Conserva los 3.075.098.624 parámetros del modelo original, pero almacenados con 4 bits por peso.

Su relevancia es puramente práctica: permite ejecutar un modelo conversacional de 3B en equipos con memoria unificada de 8 GB, algo que la versión en precisión completa no permite con comodidad. El autor reporta 24,6 tokens/s y 40,65 ms de tiempo hasta el primer token en un Apple M1 con 8 GB, con un pico de memoria de 1.430,1 MB. La licencia del artefacto hereda la Apache 2.0 del modelo base.

El modelo fue creado el 11 de septiembre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 "likes", por lo que debe considerarse un artefacto sin validación comunitaria ni resultados de benchmarks de calidad publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada del modelo base HuggingFaceTB/SmolLM3-3B (no se detalla en la información proporcionada) |
| Parámetros totales | 3.075.098.624 (≈3,08 B), dato real de los safetensors |
| Parámetros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | No especificada para esta conversión. El modelo base SmolLM3-3B soporta 64 000 tokens (ampliable a 128 000 con YaRN); el autor advierte de degradación con contextos superiores a 8 000 tokens en cuantizaciones bajas |
| Tipos de cuantización | 4-bit (única variante publicada). El autor recomienda 8-bit y 16-bit según hardware, pero no las ha publicado |
| Idiomas soportados | No disponible en la información proporcionada (heredados del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería `mlx`, `library_name: mlx`) |
| Tamaño del repositorio | 1,7 GB (salida de conversión: 1,6 GB) |
| Versión de conversión | mlx-lm 0.31.3 |
| Pipeline | text-generation |
| Fecha de creación | 2026-09-11 |

## Arquitectura y entrenamiento

Esta ficha describe una conversión de pesos, no un entrenamiento. Según la propia model card, se trata de una conversión *weight-only*: la arquitectura y el comportamiento se heredan íntegramente del modelo fuente, y lo único que cambia es la representación numérica de los pesos (4 bits) y el contenedor de serialización (MLX). El autor no aporta información sobre el proceso de entrenamiento del modelo base, la composición del dataset, el número de tokens vistos ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias.

El proceso de conversión está documentado y es reproducible: `python3 -m mlx_lm.convert --hf-path HuggingFaceTB/SmolLM3-3B --mlx-path output/SmolLM3-3B-mlx-4bit -q --q-bits 4`, ejecutado con `mlx-lm==0.31.3` sobre la versión 0.31.3 de la librería. La conversión tardó 3.095,01 segundos (unos 51,6 minutos) y produjo un artefacto de 1,6 GB a partir del modelo original. No se documenta ninguna innovación técnica adicional más allá de la cuantización de 4 bits estándar de MLX.

## Capacidades

Al ser una conversión weight-only, las capacidades son las del modelo base SmolLM3-3B, con la pérdida de calidad inherente a la cuantización de 4 bits:

- Generación de texto conversacional multi-turno, que es el uso para el que está etiquetado el repositorio (`conversational`, `text-generation`).
- Ejecución local completa en Apple Silicon mediante MLX, sin necesidad de GPU dedicada ni de servicios en la nube.
- Interfaz de chat interactivo por línea de comandos (`mlx_lm.chat`) y generación programática (`mlx_lm.generate` y API Python `load`/`generate`).
- Soporte de `max_tokens` configurable en la API Python, con el ejemplo oficial usando 256 tokens.
- Razonamiento, código, matemáticas y capacidades multilingües: presumiblemente heredadas del modelo base, pero no verificadas ni documentadas en la información proporcionada para esta conversión concreta.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Asistente conversacional local en Mac: con un pico de memoria de 1.430,1 MB, el modelo puede mantenerse cargado indefinidamente en un equipo de 8 GB mientras el usuario trabaja con otras aplicaciones, gestionando conversaciones multi-turno mediante `mlx_lm.chat`.
- Generación de texto offline en aplicaciones macOS: la API Python (`from mlx_lm import load, generate`) permite integrar el modelo dentro de una app de escritorio sin dependencia de red ni coste por token.
- Procesamiento de documentos sensibles sin salida a la nube: al ejecutarse íntegramente en local, es apto para borradores de resúmenes o reformulaciones de contenido sujeto a confidencialidad, siempre que se asuma la pérdida de calidad de la cuantización de 4 bits.
- Prototipado rápido de pipelines de prompting antes de escalar: permite iterar sobre plantillas y estrategias de generación en un portátil a 24,6 tokens/s, y después replicar la lógica sobre el modelo en precisión completa o sobre infraestructura con GPU.
- Evaluación del impacto de la cuantización: al existir el modelo base en HuggingFace, este artefacto sirve como referencia para medir la degradación de 4 bits frente a 8 y 16 bits en tareas concretas del usuario.
- Educación y demostraciones: un coste de memoria de 1,4 GB hace viable desplegar el modelo en aulas o talleres con hardware de consumo Apple, sin acceso a clústeres.
- Comparación de latencia en Apple Silicon: sirve como referencia de throughput (24,6 tokens/s en M1 de 8 GB) para calibrar expectativas en proyectos que deban decidir entre ejecución local y remota.
- Generación de borradores de texto técnico o código en local: uso plausible dada la naturaleza del modelo base, aunque no hay benchmarks publicados que lo respalden en esta cuantización concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni similares) en la información disponible. El autor únicamente publica métricas de inferencia medidas sobre un Apple M1 con 8 GB de memoria unificada, promediadas sobre 5 ejecuciones con 256 tokens máximos:

| Métrica | Valor (4-bit, Apple M1, 8 GB) |
|---|---|
| Tokens por segundo | 24,6 |
| Tiempo hasta el primer token (TTFT) | 40,65 ms |
| Memoria pico | 1.430,1 MB |
| Método de medida | Media de 5 ejecuciones, 256 tokens máximos |

## Requisitos de hardware

- VRAM/memoria unificada estimada para inferencia: 1.430,1 MB de pico en cuantización de 4 bits (medido). El archivo de pesos ocupa 1,6 GB, por lo que el total en disco y memoria es coherente con esa cifra.
- Hardware obligatorio: Apple Silicon (M1 o posterior). MLX no se ejecuta en GPUs NVIDIA, AMD ni en CPU x86, según indica el propio autor.
- Cabe en GPU de consumo: no aplica en el sentido habitual; no se ejecuta en RTX 4090, A100 ni H100. Sí cabe holgadamente en cualquier Mac con memoria unificada de 8 GB o más.
- Recomendación del autor por hardware: 4-bit para M1/M2 con 8 GB; 8-bit para M1/M2 Pro/Max con 16-32 GB; 16-bit para M2/M3/M4 Ultra con 64 GB o más. Solo la variante de 4 bits está publicada.
- Opciones de despliegue: `mlx-lm` (CLI `mlx_lm.chat`, `mlx_lm.generate` y API Python). No es compatible con vLLM, llama.cpp, Ollama, TGI ni transformers estándar, ya que el formato de pesos es específico de MLX.
- Latencia y throughput estimados: 24,6 tokens/s y 40,65 ms de TTFT en un M1 de 8 GB, según medición del autor. No hay datos para otros chips.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Formato | Licencia | Plataforma |
|---|---|---|---|---|---|---|
| SmolLM3-3B-chat-mlx-4bit (este) | 3,08 B | Heredado del base; degradación >8 000 tokens según el autor | 4-bit | safetensors (MLX) | Apache 2.0 | Apple Silicon (MLX) |
| HuggingFaceTB/SmolLM3-3B (base) | 3,08 B | 64 000 tokens (128 000 con YaRN) | 16-bit / BF16 | safetensors (transformers) | Apache 2.0 | Multiplataforma (GPU, CPU) |
| Variantes de 8-bit y 16-bit en MLX | No publicadas por el autor | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento de esta conversión con alternativas de la misma categoría. La comparación con modelos densos de ~3 B de otros fabricantes (por ejemplo, Llama 3.2 3B o Qwen2.5 3B) no puede sustentarse con datos verificados en la información proporcionada, y en cualquier caso ninguno de ellos ofrece pesos en formato MLX, por lo que no son intercambiables directamente en este entorno de ejecución.

## Limitaciones y advertencias

- Pérdida de calidad por cuantización: el autor reconoce explícitamente que la cuantización introduce una pérdida de calidad respecto al modelo original y que a menor número de bits, mayor pérdida. No se cuantifica esa degradación con benchmarks.
- Degradación en contextos largos: la model card advierte de que el rendimiento puede degradarse con contextos muy largos (más de 8 000 tokens) en niveles bajos de cuantización.
- Dependencia de plataforma: solo funciona en Apple Silicon (M1 o posterior). Queda descartado para cualquier despliegue en GPU NVIDIA, AMD o servidores x86, lo que limita severamente su uso en producción convencional.
- Conversión de solo pesos: la arquitectura y el comportamiento son los del modelo base; esta conversión no aporta mejoras funcionales ni ajustes adicionales.
- Sesgos y alucinaciones: no hay información específica en la model card sobre sesgos, tasas de alucinación o evaluación de seguridad. Al heredar el comportamiento del modelo base, arrastra sus sesgos, pero no se documentan aquí.
- Idiomas: no se especifica la cobertura idiomática de esta conversión, aunque el modelo base SmolLM3-3B sí documenta capacidades multilingües. No se puede asumir un rendimiento uniforme entre idiomas.
- Licencia: Apache 2.0, que permite uso comercial sin restricciones adicionales, pero el artefacto hereda la licencia del modelo base y conviene revisar la model card original para conocer las condiciones completas y las obligaciones de atribución.
- Sin validación comunitaria: 0 descargas y 0 "likes" en el momento de redactar esta ficha, sin pruebas independientes ni auditorías publicadas.
- Fecha anómala: el repositorio figura creado el 2026-09-11, una fecha posterior a la mayoría de referencias temporales actuales; conviene verificar la vigencia del artefacto antes de adoptarlo.
- Mantenimiento: el autor no publica variantes de 8-bit ni 16-bit pese a mencionarlas como recomendables, ni otros formatos (GGUF, GPTQ, AWQ).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SirSahOl/SmolLM3-3B-chat-mlx-4bit
- Modelo base (HuggingFaceTB/SmolLM3-3B): https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Perfil del autor: https://huggingface.co/SirSahOl
- Librería MLX de Apple: https://github.com/ml-explore/mlx
- MLX Foundry (herramienta de conversión del autor): https://github.com/SirSahOl/mlx-foundry
- Búsqueda web: no se encontraron enlaces relevantes adicionales; los resultados devueltos correspondían a páginas de servicios de traducción sin relación con el modelo.
