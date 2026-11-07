# LazySpikyCat/gemma-4-12B-it-heretic

## Resumen

Gemma 4 12B IT Heretic es una variante "decensored" del modelo instructivo Gemma 4 12B Unified de Google DeepMind, publicada por el usuario LazySpikyCat en Hugging Face. El modelo base es un transformer denso de 11.959.730.176 parámetros (aproximadamente 11,95 mil millones), con 48 capas, ventana de atención deslizante de 1024 tokens y una longitud de contexto de 256K tokens. La modificación consiste en una ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA) aplicada con la herramienta Heretic v2.0.0, que suprime el comportamiento de rechazo del modelo original.

El modelo base Gemma 4 12B Unified forma parte de la familia Gemma 4 de Google DeepMind y se caracteriza por ser multimodal sin codificadores externos (encoder-free): procesa texto, imagen, audio y vídeo de forma nativa y genera texto. Está pensado para ejecución local en dispositivos de consumo, con un tamaño de despliegue contenido y soporte de más de 140 idiomas según la documentación del modelo base.

La relevancia de esta ficha concreta es doble: por un lado documenta una técnica de modificación de pesos (ARA con Heretic) que reduce drásticamente las negativas del modelo, y por otro advierte de los riesgos asociados a distribuir una variante sin las salvaguardas del modelo original. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 24,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (gemma4_unified), encoder-free, con atención híbrida (sliding window local de 1024 tokens intercalada con atención global; última capa siempre global) y Proportional RoPE (p-RoPE) en capas globales con claves y valores unificados |
| Parametros totales | 11.959.730.176 (11,95B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | No disponible en la información proporcionada (existe una versión GGUF de terceros, SC117/Gemma-4-12B-it-heretic-GGUF) |
| Idiomas soportados | No disponible en la model card de esta variante; el modelo base declara soporte en más de 140 idiomas |
| Licencia | Apache 2.0 (con enlace a la licencia específica de Gemma 4 de Google: https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | safetensors (librería transformers) |
| Pipeline | any-to-any (image-text-to-text) |
| Capas | 48 |
| Vocabulario | 262K tokens |
| Modalidades de entrada | Texto, imagen, audio (según la model card del base; el tag del repo incluye image-text-to-text) |
| Tamaño del repositorio | 24,0 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 12B Unified: un transformer denso de 48 capas con atención híbrida que intercala capas de atención local de ventana deslizante (1024 tokens) con capas de atención global, garantizando que la última capa sea siempre global. Las capas globales emplean claves y valores unificados y Proportional RoPE (p-RoPE) para reducir el consumo de memoria en contextos largos. El modelo es multimodal sin codificadores separados (encoder-free), lo que permite procesar texto, imagen y audio de forma nativa con un tamaño de despliegue adecuado para dispositivos de consumo. El vocabulario es de 262K tokens.

Sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO), la información proporcionada no incluye detalles; únicamente se indica que Gemma 4 se distribuye en variantes preentrenada e instruida y que incorpora modos de razonamiento configurables ("thinking modes"). La modificación de esta variante es una ablación de rango arbitrario aplicada con Heretic v2.0.0 sobre el modelo instructivo: los parámetros publicados son start_layer_index 24, end_layer_index 38, preserve_good_behavior_weight 0,3470, steer_bad_behavior_weight 0,0001, overcorrect_relative_weight 0,9741 y neighbor_count 15. Según la model card del autor, esta intervención reduce las negativas de 99/100 en el modelo original a 4/100 en esta variante, con una divergencia KL de 0,0454 respecto al original.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento configurables (thinking modes) heredados del modelo base.
- Procesamiento multimodal nativo de texto, imagen y audio (y vídeo según la documentación del base), sin codificadores externos.
- Generación de código y matemáticas, con mejoras declaradas en benchmarks de código por parte de la familia Gemma 4.
- Soporte nativo de function calling y flujos agénticos de múltiples pasos.
- Soporte nativo del rol `system` en las conversaciones, lo que facilita el control estructurado del comportamiento.
- Capacidades multilingües amplias (más de 140 idiomas en el modelo base).
- Comportamiento de rechazo fuertemente reducido por la ablación ARA (4/100 negativas según el autor), lo que cambia el perfil de respuesta en temas sensibles.

## Casos de uso

- Evaluación de técnicas de ablación: el modelo sirve como referencia práctica para estudiar el efecto de ARA sobre pesos de un transformer multimodal, comparando la divergencia KL (0,0454) y la tasa de negativas frente al original.
- Investigación sobre seguridad y alineación: permite analizar qué comportamientos se pierden o se degradan al eliminar las salvaguardas, en un entorno controlado de laboratorio.
- Procesamiento de documentos con imagen y texto: al ser encoder-free y aceptar imagen y texto, puede usarse para extraer y resumir información de capturas, escaneos y material gráfico en pipelines locales.
- Transcripción y análisis de audio en local: el soporte nativo de audio permite construir asistentes de voz o resumen de reuniones sin depender de servicios externos.
- Prototipado de agentes con tool calling: el soporte de function calling y contexto de 256K tokens facilita agentes que encadenan herramientas y mantienen historiales largos.
- Asistencia a la escritura creativa sin restricciones temáticas: el perfil decensored lo hace adecuado para ficción y guiones donde el modelo original rechazaría ciertos contenidos, siempre con revisión humana.
- Despliegue en estación de trabajo con GPU de consumo: con 11,95B parámetros y formato safetensors, es viable en entornos locales para pruebas de inferencia multimodal.

## Benchmarks y rendimiento

La model card de esta variante solo publica métricas de la intervención de ablación, no benchmarks estándar de capacidad:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Negativas (Refusals) | 4/100 | 99/100 |
| Divergencia KL | 0,0454 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta variante en la información disponible. Los benchmarks del modelo base Gemma 4 12B no se detallan en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): en torno a 24 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 32-48 GB de VRAM.
- Cuantización a 8 bits: aproximadamente 12-13 GB de pesos, viable en GPUs de 16-24 GB.
- Cuantización a 4 bits: aproximadamente 6-7 GB de pesos, viable en GPUs de consumo de 8-12 GB, con pérdida de calidad asociada.
- GPU recomendadas: A100 40/80 GB, H100 para servicio de alta concurrencia; RTX 4090 (24 GB) para BF16 ajustado o 8 bits; RTX 3090/4080 para cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 con cuantización 8 bits o 4 bits, y en GPUs de 12-16 GB con cuantización agresiva.
- Opciones de despliegue: transformers (formato nativo del repo), vLLM y TGI para servicio; llama.cpp/Ollama mediante la conversión GGUF de terceros (SC117/Gemma-4-12B-it-heretic-GGUF).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma 4 12B IT Heretic (esta ficha) | 11,95B | 256K | Texto, imagen, audio | Apache 2.0 | Variante decensored con ARA; 4/100 negativas |
| google/gemma-4-12B (base) | 11,95B | 256K | Texto, imagen, audio | Apache 2.0 | Modelo original con salvaguardas; 99/100 negativas |
| SC117/Gemma-4-12B-it-heretic-GGUF | 11,95B | 256K (heredado) | Texto, imagen, audio, vídeo | Apache 2.0 (heredada) | Conversión GGUF de terceros con ARA+LoRA; 25,2 GB |
| Gemma 4 31B Dense | 30,7B | 256K | Texto, imagen | Apache 2.0 | Misma familia, mayor tamaño, sin audio |

## Limitaciones y advertencias

- La ablación elimina en gran medida el comportamiento de rechazo (4/100 negativas), por lo que el modelo puede generar contenido dañino, ilegal o sensible sin salvaguardas; no es adecuado para producción orientada al público sin capas de moderación externas.
- La divergencia KL de 0,0454 respecto al original indica una degradación no nula de la distribución de salida; pueden aparecer regresiones en calidad, coherencia o precisión en tareas no relacionadas con el rechazo.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de fidelidad para esta variante.
- La model card no detalla los idiomas soportados ni evaluaciones multilingües de esta variante concreta.
- La licencia declarada es Apache 2.0, pero el enlace apunta a la licencia específica de Gemma 4 de Google; conviene revisar los términos de uso comercial y las restricciones de la licencia de Gemma antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación comunitaria; la variante GGUF asociada es de un tercero (SC117) y no del autor original.
- El modelo base está fechado en 2026 y la información de benchmarks públicos del base no se incluye en esta ficha; cualquier comparación de rendimiento con otras familias debe hacerse con datos propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LazySpikyCat/gemma-4-12B-it-heretic
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Conversión GGUF de terceros: https://huggingface.co/SC117/Gemma-4-12B-it-heretic-GGUF
- Ficha GGUF en local-ai-zone: https://local-ai-zone.github.io/models/gemma-4-12b-it-heretic-ud.html
- Heretic (herramienta de ablación): https://heretic-project.org
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4 12B: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Informe técnico (arXiv 2607.02770): https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos de Google DeepMind: https://deepmind.google/models/gemma/
