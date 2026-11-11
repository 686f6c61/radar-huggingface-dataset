# Folly847/gemma-4-12B

## Resumen
Gemma 4 12B Unified es un modelo multimodal de Google DeepMind publicado bajo licencia Apache 2.0 y distribuido en Hugging Face por el usuario Folly847. Forma parte de la familia Gemma 4, que incluye variantes densas (E2B, E4B, 12B, 31B) y una variante MoE (26B A4B). El modelo que nos ocupa tiene 11.959.730.224 parámetros totales (aproximadamente 11,95B), 48 capas y una ventana de contexto de 256K tokens, con un vocabulario de 262K entradas.

La característica diferencial de la variante 12B Unified es su arquitectura sin codificadores (encoder-free): a diferencia de otros modelos de la familia que emplean codificadores dedicados para imagen y audio, esta versión proyecta directamente parches de imagen y formas de onda de audio al espacio de embeddings del LLM mediante capas lineales ligeras. Esto reduce la latencia multimodal y permite ajustar finamente todo el modelo en una sola pasada, además de simplificar el despliegue en dispositivos de consumo.

El modelo resuelve tareas de generación de texto, razonamiento, código y comprensión multimodal (texto, imagen, audio y vídeo), con soporte nativo de function calling, agentes y modos de razonamiento configurables. Es relevante ahora porque ofrece capacidades multimodales de frontera en un tamaño manejable para GPU de consumo, con licencia permisiva y soporte de más de 140 idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, atención híbrida (sliding window local + atención global), sin codificadores multimodales (encoder-free) |
| Parametros totales | 11.959.730.224 (≈11,95B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Más de 140 idiomas (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 24,0 GB) |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only denso de 48 capas con un mecanismo de atención híbrido que intercala atención local de ventana deslizante (1024 tokens) con atención global completa, garantizando que la capa final sea siempre global. Para optimizar la memoria en contextos largos, las capas globales emplean claves y valores unificados y aplican Proportional RoPE (p-RoPE). El vocabulario es de 262K tokens y el contexto alcanza los 256K tokens.

La innovación principal es la arquitectura unificada sin codificadores: los parches de imagen y las formas de onda de audio se proyectan directamente al espacio de embeddings del LLM mediante capas lineales ligeras, de modo que todas las modalidades fluyen por un único transformer. Esto elimina la necesidad de codificadores separados (a diferencia de las variantes E2B, E4B y 31B, que usan codificadores de visión de ~150M–550M parámetros y de audio de ~300M) y permite el ajuste fino de todo el modelo en una sola pasada. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO en la información proporcionada.

## Capacidades
- Generación de texto, razonamiento y matemáticas con modos de pensamiento (thinking) configurables.
- Comprensión de imagen con soporte de relación de aspecto y resolución variables.
- Comprensión de audio nativa (sin codificador separado) y de vídeo.
- Generación de código con mejoras notables en benchmarks de programación.
- Soporte nativo de function calling / tool calling.
- Capacidades agénticas y de razonamiento multi-paso para flujos autónomos.
- Soporte multilingüe en más de 140 idiomas.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Salida multimodal de tipo any-to-any según el pipeline declarado (entrada texto/imagen/audio/vídeo, salida de texto).

## Casos de uso
- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 256K tokens de ventana, manteniendo el hilo de la conversación y el rol de sistema para controlar el tono y las políticas de respuesta.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para revisión de código, generación de tests o resolución de incidencias, con un tamaño que cabe en GPU de consumo.
- Asistentes de accesibilidad: al procesar audio e imagen de forma nativa y sin codificadores separados, puede transcribir, describir escenas o responder preguntas sobre contenido audiovisual en dispositivos locales.
- Análisis de documentos escaneados y facturas: la entrada de imagen con resolución variable permite extraer información estructurada de documentos sin un pipeline OCR separado.
- Agentes autónomos multi-paso: el soporte nativo de function calling y razonamiento configurable lo hace adecuado para orquestar herramientas y APIs en flujos de trabajo automatizados.
- Despliegue en el borde (edge): con ~12B parámetros y arquitectura sin codificadores, es viable en estaciones de trabajo y portátiles con GPU de consumo, reduciendo la dependencia de la nube.
- Traducción y atención multilingüe: con más de 140 idiomas, sirve para localización de contenidos y soporte en mercados internacionales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; con ~12B parámetros, en FP16 requeriría aproximadamente 24 GB de VRAM, y en cuantizaciones de 8 bits o 4 bits podría reducirse a rangos de 12–16 GB y 6–8 GB respectivamente (estimaciones orientativas, no confirmadas en la información proporcionada).
- GPU recomendadas: no especificadas en la información; por tamaño, sería desplegable en A100, H100, L40S y GPUs de consumo de gama alta como RTX 4090 o RTX 3090.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 (24 GB) en FP16 y en GPUs con 8–16 GB mediante cuantización, aunque no se confirma en la información.
- Opciones de despliegue: la librería declarada es transformers; no se confirman integraciones con vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 12B Unified | 11,95B | 256K | Texto, imagen, audio, vídeo | Apache 2.0 | Hugging Face |
| Gemma 4 E4B | 4,5B efectivos (8B con embeddings) | 128K | Texto, imagen, audio | Apache 2.0 | Hugging Face |
| Gemma 4 31B Dense | 30,7B | 256K | Texto, imagen | Apache 2.0 | Hugging Face |
| Gemma 4 26B A4B MoE | 26B totales (no disponible el número de activos) | No disponible | No disponible | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias
- No se han publicado datos sobre sesgos conocidos en la información proporcionada.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan mitigaciones específicas.
- Aunque se declaran más de 140 idiomas, no se detalla el rendimiento por idioma ni la calidad relativa en cada uno.
- El contexto de 256K puede degradar la calidad en tareas de recuperación en posiciones intermedias; no se aportan datos al respecto.
- La licencia es Apache 2.0, pero la model card enlaza a una licencia específica de Gemma 4 (gemma_4_license); conviene verificar los términos exactos antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día; se trata de una publicación reciente sin validación comunitaria.
- No se confirman integraciones con motores de inferencia optimizados (vLLM, TGI, llama.cpp), lo que puede limitar el rendimiento en producción.
- La información sobre cuantizaciones disponibles y requisitos de hardware es escasa, lo que dificulta planificar el despliegue.

## Enlaces
- Hugging Face: https://huggingface.co/Folly847/gemma-4-12B
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Documentación: https://ai.google.dev/gemma/docs/core
- Informe técnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
