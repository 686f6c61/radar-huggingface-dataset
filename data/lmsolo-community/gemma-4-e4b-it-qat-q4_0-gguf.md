# lmsolo-community/gemma-4-E4B-it-qat-q4_0-gguf

## Resumen

Gemma 4 E4B-it es un modelo multimodal de Google DeepMind publicado bajo licencia Apache 2.0, dentro de la familia Gemma 4. Este repositorio concreto (`lmsolo-community/gemma-4-E4B-it-qat-q4_0-gguf`) es una redistribución comunitaria en formato GGUF Q4_0 del checkpoint oficial `google/gemma-4-E4B-it-qat-q4_0-unquantized`, es decir, la versión instruction-tuned del modelo E4B sometida a Quantization-Aware Training (QAT) para preservar la calidad de bfloat16 con una huella de memoria mucho menor.

El modelo emplea una arquitectura transformer densa con atención híbrida (ventanas deslizantes locales de 512 tokens intercaladas con capas de atención global), Per-Layer Embeddings (PLE) para eficiencia en dispositivo y un vocabulario de 262K tokens. Cuenta con 4.500 millones de parámetros efectivos (8.000 millones incluyendo embeddings; el dato de safetensors del repo indica 7.463.013.674 parámetros totales) y una ventana de contexto de 128K tokens. Procesa texto, imagen y audio, y genera texto.

Su relevancia actual radica en que combina capacidades frontier por tamaño (razonamiento con modos de pensamiento configurables, coding, function calling nativo, soporte de rol `system`) con un despliegue viable en hardware de consumo gracias a la cuantización Q4_0 entrenada, no post-hoc. El repo ocupa 6,1 GB y acumula 83 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (sliding window local + atención global), Per-Layer Embeddings (PLE) |
| Parametros totales | 7.463.013.674 (safetensors); 4,5B efectivos / 8B con embeddings según model card |
| Parametros activos | No aplica (modelo denso; el MoE de la familia es 26B A4B) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | Q4_0 (GGUF); el checkpoint base QAT también existe en wNa8o8 (móvil) y w4a16 (compressed-tensors) |
| Idiomas soportados | Más de 140 idiomas según la model card; lista concreta no disponible |
| Licencia | Apache 2.0 (con license_link a la licencia específica de Gemma 4) |
| Formato de pesos | GGUF (repo); el base en safetensors/cuantizado |

Otros datos técnicos: 42 capas, ventana deslizante de 512 tokens, vocabulario de 262K, codificador de visión de ~150M de parámetros y codificador de audio de ~300M. Tamaño del repo: 6,1 GB. Pipeline declarado: any-to-any. Fecha de creación y última actualización: 2026-11-07.

## Arquitectura y entrenamiento

El modelo es un transformer denso de 42 capas que intercala capas de atención local con ventana deslizante de 512 tokens y capas de atención global, garantizando que la capa final sea siempre global. Para optimizar memoria en contextos largos, las capas globales unifican Keys y Values y aplican Proportional RoPE (p-RoPE). Los modelos E incorporan Per-Layer Embeddings (PLE) para maximizar la eficiencia de parámetros en despliegues on-device, y el vocabulario es de 262K tokens. La multimodalidad se resuelve con un codificador de visión de ~150M de parámetros y un codificador de audio de ~300M, ambos integrados en el modelo.

El entrenamiento incluye una fase de Quantization-Aware Training (QAT) que produce checkpoints capaces de mantener una calidad similar a bfloat16 tras cuantizar a Q4_0, además de variantes wNa8o8 (con capas de decodificación a 2 bits, KV cache optimizada y activaciones estáticas para móvil) y w4a16 en formato compressed-tensors para vLLM. La model card menciona variantes pre-entrenadas e instruction-tuned, modos de pensamiento configurables y soporte nativo del rol `system`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto, razonamiento con modos de pensamiento configurables y coding.
- Comprensión de imagen con soporte de relación de aspecto y resolución variables.
- Comprensión de audio (nativa en E2B, E4B y 12B; este modelo es E4B, por lo que la incluye).
- Procesamiento de vídeo según la model card de la familia.
- Function calling / tool calling nativo.
- Capacidades agénticas y razonamiento multi-paso orientadas a agentes autónomos.
- Soporte multilingüe en más de 140 idiomas.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Compatibilidad con decodificación especulativa mediante modelo asistente (el asistente debe ser también QAT y de la misma precisión).

## Casos de uso

- Asistentes conversacionales multi-turno: con 128K tokens de contexto y soporte nativo de `system`, el modelo puede mantener conversaciones largas con instrucciones persistentes y recuperación de contexto extenso.
- Agentes autónomos con herramientas: el function calling nativo y las capacidades multi-paso permiten construir agentes que consultan APIs, ejecutan código y encadenan acciones sobre pipelines.
- Generación de código en producción: integrable en flujos de CI/CD y asistentes de IDE; el tamaño Q4_0 (6,1 GB) permite ejecución local en estaciones de trabajo.
- Análisis de documentos con imagen y audio: al aceptar texto, imagen y audio, sirve para extraer información de capturas, PDFs escaneados o transcripciones en un único modelo.
- Despliegue en dispositivo y edge: la variante QAT Q4_0 y el diseño PLE están pensados para ejecución en portátiles y hardware de consumo, útil en aplicaciones offline o con requisitos de privacidad.
- Atención al cliente automatizada: gestión de conversaciones con contexto largo y cambio de idioma entre más de 140 lenguas sin modelos separados.
- Investigación sobre cuantización: al ser un checkpoint QAT redistribuido en GGUF, es útil para estudiar la degradación de calidad frente a bfloat16 en tareas de razonamiento y multimodalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo GGUF Q4_0 ocupa 6,1 GB, por lo que se requiere aproximadamente esa cifra más overhead de contexto y KV cache; con 128K de contexto la KV cache puede crecer de forma significativa.
- GPU recomendadas: no disponibles de forma explícita en la información proporcionada; por tamaño, cabe en GPUs de consumo con 8-12 GB de VRAM para contextos moderados.
- Cabe en consumer GPU: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y superiores; verificar con pruebas propias dado que no hay datos oficiales en la información disponible.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM mediante la variante w4a16 compressed-tensors del checkpoint base; el repo está marcado como `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 E4B-it QAT Q4_0 (este repo) | 4,5B efectivos / 8B con embeddings | 128K | Texto, imagen, audio | Apache 2.0 | GGUF Q4_0 |
| Gemma 4 E2B-it QAT | 2,3B efectivos / 5,1B con embeddings | 128K | Texto, imagen, audio | Apache 2.0 | GGUF Q4_0, wNa8o8 |
| Gemma 4 12B Unified QAT | 11,95B | 256K | Texto, imagen, audio | Apache 2.0 | GGUF Q4_0, w4a16 |
| Gemma 4 26B A4B QAT (MoE) | 26B totales, 4B activos | 256K | Texto, imagen | Apache 2.0 | GGUF Q4_0 |

La comparación se limita a la propia familia Gemma 4 porque la información disponible no incluye modelos de otros desarrolladores con los que contrastar. El E4B se sitúa entre el E2B (más ligero, orientado a móvil) y el 12B (mayor contexto y capacidad), con la particularidad de incluir audio, algo que el 31B Dense no ofrece.

## Limitaciones y advertencias

- Es una redistribución comunitaria: el autor del repo es `lmsolo-community`, no Google DeepMind; conviene validar la integridad de los pesos frente al checkpoint oficial.
- La licencia Apache 2.0 se declara en el repo, pero enlaza a la licencia específica de Gemma 4; revisar los términos de uso comercial y las restricciones de la licencia de Gemma antes de producción.
- Riesgo de alucinación inherente a los modelos generativos; no hay datos publicados de tasas de error en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada; la model card no detalla evaluaciones de sesgo para esta variante.
- La cuantización Q4_0 puede degradar ligeramente tareas sensibles a precisión (matemáticas, código de baja frecuencia) pese al QAT; validar contra bfloat16 en el dominio de uso.
- Para decodificación especulativa, el modelo asistente debe ser también QAT y de la misma precisión, lo que restringe las combinaciones posibles.
- El contexto de 128K incrementa el consumo de KV cache; en hardware de consumo puede ser necesario truncar contexto.
- Idiomas: se declaran más de 140, pero no hay lista ni evaluación por idioma en la información disponible; el rendimiento en lenguas de bajos recursos puede ser inferior.
- El modelo base es instruction-tuned; para ajuste fino adicional conviene partir del checkpoint unquantized.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lmsolo-community/gemma-4-E4B-it-qat-q4_0-gguf
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- Colección QAT Q4_0 de Google: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- GitHub: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentación: https://ai.google.dev/gemma/docs/core
- Informe técnico: https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de Gemma en DeepMind: https://deepmind.google/models/gemma/
