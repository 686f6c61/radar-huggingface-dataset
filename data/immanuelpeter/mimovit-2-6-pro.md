# immanuelpeter/MiMoViT-2.6-Pro

## Resumen

MiMoViT-2.6-Pro es un extractor de caracteristicas visuales publicado por el usuario immanuelpeter en Hugging Face. No es un modelo multimodal completo, sino un empaquetado independiente del "vision tower" y del "merger" extraidos del modelo MiMo V2.6 Pro de Xiaomi (XiaomiMiMo/MiMo-V2.6-Pro-RL). El repositorio contiene unicamente los tensores correspondientes al prefijo `visual.*` del modelo padre, junto con el codigo de modelado necesario para cargarlos mediante `trust_remote_code`.

El modelo resuelve un problema concreto de ingenieria: permitir reutilizar el codigo visual de MiMo V2.6 Pro de forma aislada, sin necesidad de descargar ni cargar el modelo de lenguaje completo. Esto es util para pipelines de extraccion de caracteristicas de imagen, investigacion sobre representaciones visuales y para construir sistemas propios que necesiten el encoder visual de MiMo sin el resto del stack.

Tecnicamente se trata de un transformer visual de 28 bloques con 1280 dimensiones ocultas, atencion con 32 cabezas de consulta y 8 de clave/valor, y un merger que proyecta las caracteristicas a 6144 dimensiones. Cuenta con 739.080.192 parametros y ocupa 1,5 GB en el repositorio, con pesos en BF16 y licencia MIT para los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visual (vision tower) con merger; atencion hibrida (full attention en bloques 0, 9, 18 y 27; ventana deslizante de ±64 tokens en el resto) |
| Parametros totales | 739.080.192 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como contexto de texto; procesa parches de 2 fotogramas x 16 x 16 pixeles; a resolucion 448 genera 784 tokens de torre (1280 de ancho), 196 tokens merged (5120) y 196 proyectados (6144) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | MIT para pesos; codigo de modelado con cabecera Apache-2.0 (ver LICENSE-CODE y NOTICE) |
| Formato de pesos | safetensors (model.safetensors, 364 tensores) |

## Arquitectura y entrenamiento

El modelo es un vision transformer de 28 bloques con 1280 dimensiones ocultas y SwiGLU de 4608. Usa RMSNorm y RoPE 2D. La atencion emplea 32 cabezas de consulta y 8 de clave/valor con dimension de cabeza 64 (GQA), y combina atencion completa en los bloques 0, 9, 18 y 27 con atencion de ventana deslizante de ±64 tokens en el resto, ademas de un sesgo de sink por cabeza en la columna 0 de claves. El patch embedding procesa 2 fotogramas de 16x16 pixeles; una imagen estatica se repite como dos fotogramas.

El merger aplica LayerNorm(1280), concatenacion 2x2 a 5120, Linear(5120, 5120), GELU y Linear(5120, 6144), sin sesgos. A resolucion 448 el bench reporta 784 tokens de torre de ancho 1280 (restaurados a orden de raster), 196 tokens merged de ancho 5120 y 196 tokens proyectados de ancho 6144.

No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens, composicion ni procesos de RLHF/DPO en la informacion proporcionada. El modelo base es XiaomiMiMo/MiMo-V2.6-Pro-RL, y este repositorio es un fine-tune/exportacion de su rama visual. La validacion de paridad se realiza comparando cada tensor exportado con el padre fijado mediante `torch.equal` y comprobando todas las etapas contra el `MiMoVisionTransformer` original.

## Capacidades

- Extraccion de caracteristicas visuales de imagenes (pipeline `image-feature-extraction`).
- Procesamiento de imagenes a resolucion 448 con parches de 16x16 y dos fotogramas por imagen.
- Generacion de representaciones en tres etapas: tokens de torre (1280), tokens merged (5120) y tokens proyectados (6144).
- Carga mediante `AutoModel.from_pretrained(..., trust_remote_code=True)` con el codigo `modeling_mimo_vision.py`.
- No incluye generacion de texto, razonamiento, codigo, matematicas ni tool calling: es exclusivamente un encoder visual.
- No se documentan capacidades multilingues ni de audio.
- No se documenta modo thinking ni capacidades de agente.

## Casos de uso

- Extraccion de embeddings visuales para busqueda por similitud: el modelo produce tokens proyectados de 6144 dimensiones que pueden indexarse en bases vectoriales para recuperacion de imagenes por contenido.
- Preprocesamiento para sistemas multimodales propios: al aislar el vision tower de MiMo V2.6 Pro, se puede conectar a un LLM propio mediante el merger y evitar cargar el modelo de lenguaje completo.
- Investigacion sobre representaciones visuales: los tokens de torre (1280) y merged (5120) permiten analizar capas intermedias y estudiar la atencion hibrida con ventana deslizante y sink bias.
- Clasificacion y etiquetado de imagenes: las caracteristicas extraidas pueden alimentar cabezas de clasificacion ligeras para tareas de vision por computador.
- Deteccion de duplicados y near-duplicates en catalogos de imagenes: los embeddings de 6144 dimensiones permiten comparar similitud entre imagenes a gran escala.
- Generacion de descripciones asistida por retrieval: usar los embeddings como entrada a un pipeline de captioning o VQA que combine el encoder con un modelo de lenguaje externo.
- Control de calidad en pipelines de datos visuales: detectar imagenes anomalas o fuera de distribucion comparando caracteristicas contra un conjunto de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta una prueba de paridad de release que compara cada tensor exportado con el modelo padre mediante `torch.equal` y verifica todas las etapas contra el `MiMoVisionTransformer` original, pero no reporta metricas de calidad (accuracy, recall, mAP, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 739 millones de parametros en BF16 (aproximadamente 1,5 GB de pesos) la inferencia cabe holgadamente en GPUs de consumo, aunque el consumo real depende del tamano de lote y la resolucion de entrada.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, una RTX 4090 o superior es suficiente para lotes moderados, y GPUs de datacenter (A100, H100) permiten lotes mayores.
- Cabe en GPU de consumo: si, por el tamano de pesos (1,5 GB en BF16); se recomienda al menos 8 GB de VRAM para margen con lotes pequenos.
- Opciones de despliegue: transformers con `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (el modelo es un encoder visual, no un modelo generativo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas oficiales en la informacion proporcionada. Como referencia estructural, el modelo es un vision tower de 739 millones de parametros derivado de MiMo V2.6 Pro; no se han identificado en la informacion alternativas comparables con datos verificables.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiMoViT-2.6-Pro | 739.080.192 | no disponible (parches 2x16x16) | MIT (pesos) | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es exclusivamente un encoder visual: no genera texto ni responde instrucciones; no debe presentarse como un modelo multimodal completo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar `modeling_mimo_vision.py` antes de usarlo en produccion.
- La licencia de los pesos es MIT, pero el codigo de modelado conserva cabecera Apache-2.0; es necesario revisar LICENSE-CODE y NOTICE para cumplir ambas.
- No se documentan sesgos conocidos ni tasas de alucinacion, aunque al ser un extractor de caracteristicas el riesgo de alucinacion textual no aplica directamente.
- No se dispone de informacion sobre idiomas soportados ni sobre el dataset de entrenamiento, lo que limita la evaluacion de sesgos visuales.
- La resolucion de entrada documentada es 448; no se especifica el comportamiento fuera de esa resolucion.
- El repositorio tiene muy pocas descargas (60) y likes (1), por lo que la validacion por parte de la comunidad es limitada.
- No se documentan opciones de cuantizacion ni formatos GGUF, lo que puede limitar el despliegue en entornos con restricciones de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/immanuelpeter/MiMoViT-2.6-Pro
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- Test de paridad de release: https://github.com/immanuel-peter/vision-tower-bench/blob/main/tests/test_release_parity.py
- Script de exportacion: https://github.com/immanuel-peter/vision-tower-bench/blob/main/scripts/export_mimo26_vision.py
- Repositorio vision-tower-bench: https://github.com/immanuel-peter/vision-tower-bench
