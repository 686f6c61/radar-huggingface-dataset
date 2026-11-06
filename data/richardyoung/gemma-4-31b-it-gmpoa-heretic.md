# richardyoung/gemma-4-31B-it-GMPOA-heretic

## Resumen

Gemma 4 31B it GMPOA heretic es una variante "decensored" del modelo multimodal google/gemma-4-31B-it, publicada por el usuario richardyoung mediante la herramienta Heretic v2.0.0. El modelo base es un transformer denso de 31B parámetros desarrollado por Google DeepMind, con capacidades de entrada texto e imagen y una ventana de contexto de 256K tokens. La modificación aplicada, denominada Gamma-Exact Magnitude-Preserving Orthogonal Ablation (GammaMPOA), actúa sobre las proyecciones de atención (attn.o_proj) y de la MLP (mlp.down_proj) con el objetivo de reducir la tasa de rechazos del modelo ante peticiones que el original rechazaría.

El interés de esta ficha reside en que documenta un caso de fine-tuning por ablación de direcciones de rechazo sobre un modelo de última generación. El autor reporta que la tasa de rechazos baja de 99/100 en el original a 78/100 en esta variante, con una divergencia KL de 0,0609 respecto al modelo base. Es decir, la modificación reduce los rechazos en 21 puntos porcentuales, pero no los elimina por completo y altera la distribución de salidas de forma medible.

El modelo conserva la arquitectura, el tokenizador y la mayor parte de los pesos del Gemma 4 31B original, por lo que hereda sus capacidades multimodales, su ventana de contexto y su soporte multilingüe. No obstante, la licencia del modelo base (Apache 2.0 según la model card, con enlace a la licencia específica de Gemma 4) y la naturaleza de la modificación exigen una evaluación cuidadosa antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto e imagen) con atención híbrida: ventana deslizante local + atención global, p-RoPE en capas globales |
| Parámetros totales | 31.273.086.512 (31,27B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantización | No disponible en la información proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ/GPTQ no listadas) |
| Idiomas soportados | No disponible en la información proporcionada (el modelo base declara más de 140 idiomas) |
| Licencia | Apache 2.0 (con enlace a la licencia específica de Gemma 4) |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base Gemma 4 31B es un transformer denso de 60 capas con un vocabulario de 262K tokens y un codificador visual de aproximadamente 550M de parámetros. Emplea una atención híbrida que intercala capas de ventana deslizante local (1024 tokens) con capas de atención global, garantizando que la última capa sea siempre global. Las capas globales utilizan claves y valores unificados y Proportional RoPE (p-RoPE) para reducir el coste de memoria en contextos largos. El modelo soporta entrada de texto e imagen y salida de texto; a diferencia de las variantes E2B, E4B y 12B, la versión 31B no incluye codificador de audio.

Sobre el entrenamiento del modelo base, la información disponible indica que Gemma 4 se distribuye en variantes preentrenada e instruction-tuned, con modos de razonamiento configurables y soporte nativo del rol `system`. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO. La modificación de esta variante concreta consiste en una ablación ortogonal de direcciones (GammaMPOA) aplicada por capa sobre `attn.o_proj` y `mlp.down_proj`, con pesos máximos de 1,19 y 0,60 respectivamente, y posiciones de peso máximo en las capas 57,01 y 49,66. No se trata de un reentrenamiento supervisado, sino de una intervención sobre los pesos que preserva la magnitud de las proyecciones.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento configurables (thinking modes), heredados del modelo base.
- Comprensión de imágenes con soporte de relación de aspecto y resolución variables.
- Generación de código y capacidades agénticas mejoradas respecto a generaciones anteriores de Gemma, según la model card del modelo base.
- Soporte nativo de function calling y tool calling.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Capacidades multilingües del modelo base (más de 140 idiomas declarados), aunque la model card de esta variante no detalla idiomas.
- Reducción de rechazos: 78/100 frente a 99/100 del original, según el autor.
- No soporta audio (la variante 31B carece de codificador de audio).

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la ablación de direcciones afecta a la tasa de rechazos y a la distribución de salidas, con una métrica de divergencia KL (0,0609) que cuantifica el desplazamiento respecto al original.
- Evaluación comparativa de técnicas de decensoring: sirve como referencia para comparar GammaMPOA con otras técnicas de ablación (por ejemplo, abliteration clásica) sobre un mismo modelo base.
- Generación de contenido creativo sin filtros restrictivos: escritura de ficción, guiones o narrativa que requiera temáticas que el modelo original rechazaría, aceptando el riesgo de menor fiabilidad en dominios sensibles.
- Análisis de imágenes en pipelines de documentación técnica: el modelo conserva la capacidad image-text-to-text del base, útil para descripción de diagramas o extracción de información visual.
- Asistencia en código con contexto largo: la ventana de 256K tokens permite procesar repositorios o ficheros extensos en una sola pasada, con soporte de tool calling para integración en editores.
- Despliegue en investigación académica con requisitos de reproducibilidad: al estar los pesos en safetensors y documentarse los parámetros exactos de la ablación, es posible reproducir la intervención sobre el modelo base.
- Prototipado de agentes conversacionales multi-turno: el soporte del rol `system` y de function calling facilita la construcción de agentes con instrucciones persistentes.

## Benchmarks y rendimiento

| Métrica | Este modelo | Modelo original (google/gemma-4-31B-it) |
|---|---|---|
| Rechazos (Refusals) | 78/100 | 99/100 |
| Divergencia KL | 0,0609 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 62,5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 80 GB para contexto corto.
- GPU recomendadas: H100 80 GB, A100 80 GB, o configuraciones multi-GPU (por ejemplo, 2× A100 40 GB o 2× RTX 4090 24 GB con tensor parallelism).
- En GPU de consumo: no cabe en una sola RTX 4090 (24 GB) en BF16; requeriría cuantización (no documentada en esta variante) o reparto entre varias GPU.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI previsiblemente compatibles al conservar la arquitectura del base; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-4-31B-it-GMPOA-heretic | 31,27B | 256K | Texto, imagen | Apache 2.0 | Variante decensored con ablación GammaMPOA |
| google/gemma-4-31B-it | 30,7B | 256K | Texto, imagen | Apache 2.0 | Modelo base instruction-tuned, 99/100 rechazos |
| Gemma 4 26B A4B | 26B (MoE) | 256K | Texto, imagen | Apache 2.0 | Variante MoE de la misma familia, no disponible en detalle |
| Gemma 4 12B Unified | 11,95B | 256K | Texto, imagen, audio | Apache 2.0 | Arquitectura sin codificador, menor tamaño |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La modificación reduce los rechazos de 99/100 a 78/100, pero no los elimina; el modelo sigue rechazando parte de las peticiones.
- La divergencia KL de 0,0609 indica un cambio medible en la distribución de salidas respecto al original, lo que puede degradar la calidad en tareas generales no evaluadas.
- No se han publicado evaluaciones de sesgo, toxicidad o alucinación para esta variante concreta.
- La model card no detalla los idiomas soportados ni las cuantizaciones disponibles, lo que limita el despliegue en hardware de consumo.
- La licencia Apache 2.0 se declara con enlace a la licencia específica de Gemma 4; conviene verificar los términos de uso comercial del modelo base antes de producción.
- El modelo está diseñado explícitamente para reducir filtros de seguridad; su uso en aplicaciones orientadas al público conlleva riesgos de contenido inapropiado y posibles incumplimientos normativos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- No se documenta el proceso de conversión ni la reproducibilidad exacta de la ablación más allá de los parámetros listados.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/gemma-4-31B-it-GMPOA-heretic
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Heretic: https://heretic-project.org
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación: https://ai.google.dev/gemma/docs/core
- Informe técnico: https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
