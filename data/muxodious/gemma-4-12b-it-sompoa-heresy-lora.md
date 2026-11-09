# MuXodious/gemma-4-12B-it-SOMPOA-heresy-LORA

## Resumen

`MuXodious/gemma-4-12B-it-SOMPOA-heresy-LORA` es una adaptación LoRA del modelo `google/gemma-4-12B` publicada por el usuario MuXodious. Se trata de un fine-tuning orientado a eliminar el comportamiento de rechazo (refusals) del modelo base, generado con la herramienta Heretic v2.2.0.dev0 mediante la técnica SOMPOA. El resultado es un adaptador de aproximadamente 0,2 GB que se aplica sobre los pesos originales de Gemma 4 12B, no un modelo completo.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo concreto de "abliteration" (eliminación de mecanismos de seguridad por manipulación de pesos) sobre un modelo multimodal de Google DeepMind. Por otro, sirve para entender el estado de la familia Gemma 4, que introduce arquitecturas híbridas de atención, capacidades nativas de audio y vídeo, ventanas de contexto de hasta 256K tokens y soporte de más de 140 idiomas.

El modelo base Gemma 4 12B es un transformer multimodal "encoder-free" que procesa texto, imagen, audio y vídeo y genera texto, con modos de razonamiento configurables y soporte nativo de function calling. Esta variante concreta hereda esas capacidades pero modifica el comportamiento de alineación, lo que tiene implicaciones importantes para su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal decoder-only con atención híbrida (sliding window local + atención global); adaptador LoRA sobre Gemma 4 12B |
| Parametros totales | 12B (modelo base); el adaptador LoRA ocupa ~0,2 GB |
| Parametros activos | No aplica (el modelo base 12B es denso, no MoE) |
| Longitud de contexto | Hasta 256K tokens (según model card del base; los modelos pequeños de la familia usan 128K) |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors del adaptador) |
| Idiomas soportados | Más de 140 idiomas según el modelo base; no se detalla lista específica |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4) |
| Formato de pesos | Safetensors (adaptador LoRA); requiere los pesos del base en safetensors |
| Pipeline | any-to-any (texto, imagen, audio, vídeo de entrada; texto de salida) |
| Libreria | transformers |
| Tamano del repo | 0,2 GB |
| Fecha de creacion | 2026-11-09 |

## Arquitectura y entrenamiento

El modelo base Gemma 4 12B emplea una arquitectura transformer decoder-only con un mecanismo de atención híbrido que intercala atención local de ventana deslizante con atención global completa, garantizando que la capa final sea siempre global. Esta combinación busca el bajo consumo de memoria de un modelo ligero sin renunciar a la percepción de contexto amplio. El modelo es "encoder-free": procesa audio, imagen y vídeo de forma nativa sin codificadores separados, lo que simplifica el despliegue en dispositivos de consumo.

Sobre el entrenamiento del base, la model card indica que Gemma 4 se distribuye en variantes preentrenada e instruction-tuned, con soporte multilingüe en más de 140 idiomas y modos de razonamiento configurables. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La modificación de esta variante se realizó con Heretic v2.2.0.dev0 aplicando la técnica SOMPOA, que ajusta selectivamente los pesos de las proyecciones `attn.o_proj` y `mlp.down_proj` en función de una `direction_index` (26,71) y posiciones de peso máximas concretas (35,36 para atención y 27,34 para MLP). Los parámetros SOMPOA documentados incluyen pesos máximos y mínimos por capa y distancias de peso mínimas (7,89 y 2,86 respectivamente). El objetivo es suprimir la dirección de rechazo en el espacio de activaciones manteniendo la coherencia del modelo, con una divergencia KL de 0,0639 respecto al original.

## Capacidades

- Generación de texto y razonamiento con modos de "thinking" configurables heredados de Gemma 4.
- Comprensión multimodal nativa: entrada de texto, imagen (con soporte de relación de aspecto y resolución variable), audio y vídeo; salida solo de texto.
- Capacidades de código y matemáticas mejoradas respecto a generaciones anteriores de Gemma, según la model card del base.
- Soporte nativo de function calling / tool calling, orientado a flujos agénticos.
- Soporte del rol `system` nativo para conversaciones estructuradas.
- Multilingüismo en más de 140 idiomas.
- Comportamiento "decensored": reducción drástica de rechazos (11/101 frentes a 101/101 del original), lo que cambia el perfil de respuesta ante peticiones sensibles.
- No se documentan capacidades de generación de imagen, audio o vídeo; el pipeline any-to-any se refiere a las modalidades de entrada.

## Casos de uso

- Investigación sobre alineación y seguridad: el adaptador permite estudiar cómo varía la tasa de rechazos y la divergencia KL al modificar direcciones de activación, útil para auditar técnicas de abliteration.
- Evaluación comparativa de robustez: comparar respuestas del base y de la variante sobre el mismo conjunto de prompts para medir deriva de comportamiento y calidad.
- Generación creativa sin filtros en entornos controlados: escritura de ficción o guiones que requieran temáticas que el modelo base rechazaría, siempre con revisión humana.
- Prototipado de asistentes conversacionales multilingües: aprovechar los más de 140 idiomas y la ventana de 256K para conversaciones multi-turno con contexto extenso.
- Análisis multimodal de documentos: extraer información de imágenes, audio y vídeo combinados con texto en un único pipeline, gracias a la arquitectura encoder-free.
- Agentes autónomos con tool calling: integrar el modelo en flujos de múltiples pasos donde el rechazo del base interrumpiría la cadena, evaluando previamente los riesgos.
- Docencia y demostraciones: ilustrar en un aula cómo un LoRA de pocos cientos de MB altera el comportamiento de un modelo de 12B sin reentrenarlo por completo.

## Benchmarks y rendimiento

La model card solo publica métricas del proceso de decensoring, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Refusals | 11/101 | 101/101 |
| KL divergence | 0,0639 | 0 (por definición) |

No se han publicado resultados de benchmarks de capacidad (razonamiento, código, matemáticas) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del base 12B: aproximadamente 24 GB en FP16/BF16, unos 12-14 GB en cuantización de 8 bits y 7-8 GB en 4 bits (estimaciones habituales para 12B; no confirmadas en la información disponible).
- El adaptador LoRA añade un sobrecoste mínimo (~0,2 GB) y se puede fusionar con los pesos base.
- GPU recomendadas: A100 40/80 GB, H100, L40S para FP16; RTX 4090 (24 GB) para FP16 ajustado o 8 bits; RTX 3090/4080 para cuantizaciones de 4-8 bits.
- Cabe en GPU de consumo con cuantización: RTX 4090, 4080, 3090 e incluso 4060 Ti 16 GB en 4 bits, aunque el procesamiento de audio y vídeo incrementa los requisitos.
- Opciones de despliegue: transformers (formato nativo del repo), vLLM y TGI si soportan Gemma 4 12B; llama.cpp/Ollama requerirían conversión a GGUF, no incluida en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodalidad | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-4-12B-it-SOMPOA-heresy-LORA (este) | 12B + LoRA | 256K | Texto, imagen, audio, vídeo (entrada) | Apache 2.0 | Variante decensored, 11/101 rechazos |
| google/gemma-4-12B (base) | 12B | 256K | Texto, imagen, audio, vídeo (entrada) | Apache 2.0 | Modelo oficial con alineación completa |
| Gemma 4 26B A4B | 26B (MoE, 4B activos) | 256K | Texto, imagen, vídeo | Apache 2.0 | Mayor capacidad, arquitectura MoE |
| Gemma 4 31B | 31B | 256K | Texto, imagen, vídeo | Apache 2.0 | El mayor de la familia, denso |

No se dispone de datos de benchmarks comparativos de capacidad para esta variante concreta.

## Limitaciones y advertencias

- El proceso de abliteration elimina salvaguardas: el modelo puede generar contenido dañino, ilegal o NSFW, y no debe desplegarse sin filtros externos.
- Riesgo elevado de alucinación y de respuestas inseguras al haberse suprimido la dirección de rechazo; la divergencia KL de 0,0639 indica una alteración medible de la distribución.
- La licencia Apache 2.0 se acompaña de un enlace a la licencia específica de Gemma 4; conviene revisar las condiciones de uso comercial y las restricciones de la política de uso de Google antes de producción.
- El repo solo contiene el adaptador LoRA: es obligatorio descargar `google/gemma-4-12B` y aplicar el adaptador; no es un modelo autónomo.
- No se documentan idiomas concretos ni sesgos específicos de esta variante; los sesgos del base pueden amplificarse al eliminar rechazos.
- El procesamiento de audio y vídeo aumenta los requisitos de memoria y latencia respecto a texto puro.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni reportes de calidad independientes.
- No hay cuantizaciones GGUF publicadas en el repo, lo que limita el despliegue en llama.cpp/Ollama sin conversión manual.

## Enlaces

- Hugging Face: https://huggingface.co/MuXodious/gemma-4-12B-it-SOMPOA-heresy-LORA
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Colección Gemma 4: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Documentación: https://ai.google.dev/gemma/docs/core
- Informe técnico: https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Heretic: https://heretic-project.org
