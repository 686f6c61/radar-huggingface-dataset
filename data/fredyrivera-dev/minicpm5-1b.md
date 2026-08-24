# FredyRivera-dev/MiniCPM5-1B

## Resumen

MiniCPM5-1B es el primer checkpoint de la serie MiniCPM5 desarrollada por OpenBMB, un laboratorio de investigación en modelos de lenguaje de código abierto. Se trata de un transformer denso de aproximadamente 1.080 millones de parámetros diseñado específicamente para despliegue en dispositivos locales, escenarios con recursos limitados y aplicaciones edge. El modelo alcanza el estado del arte dentro de la clase de 1B según los benchmarks publicados, con una puntuación media de 42,57 en tareas de razonamiento, conocimiento, código, seguimiento de instrucciones, matemáticas, lógica y capacidades agénticas.

La variante `FredyRivera-dev/MiniCPM5-1B` es una adaptación preparatoria del checkpoint original `openbmb/MiniCPM5-1B`. Los pesos no han sido modificados ni afinados; únicamente se ha renombrado el token reservado `<unused_token_0>` (id 130082) como `<image>` y se ha actualizado la plantilla de chat para aceptar contenido multimodal en formato de bloques. Es importante señalar que esta variante **no tiene capacidad de visión real**: no se adjunta ningún codificador de imagen ni proyector, y el token `<image>` no tiene significado aprendido. El repositorio se presenta como un punto de partida preparado para una futura integración de módulos de visión.

El modelo utiliza una arquitectura `LlamaForCausalLM` estándar con atención GQA, una ventana de contexto nativa de 131.072 tokens, razonamiento híbrido con modo `thinking` activable y soporte de tool calling. Se distribuye bajo licencia Apache 2.0 y soporta inglés y chino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer denso causal) |
| Parametros totales | 1.080.632.832 |
| Parametros activos | No aplica (modelo denso) |
| Parametros no-embedding | 679.552.512 |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | No disponible para esta variante; el checkpoint original publica GGUF (llama.cpp/Ollama) y MLX 4-bit (Apple Silicon) |
| Idiomas soportados | Ingles, chino (en, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

MiniCPM5-1B usa la arquitectura `LlamaForCausalLM` estándar, lo que permite cargarlo directamente con motores de inferencia convencionales sin kernels personalizados ni bifurcaciones del código del modelo. La configuración incluye 24 capas, 16 cabezas de atención para las queries (Q) y 2 para las claves y valores (KV) mediante atención con consulta agrupada (GQA), lo que reduce el coste de memoria en inferencia en comparación con la atención multi-cabeza clásica.

El entrenamiento sigue la metodología de gestión de datos por niveles de UltraData, en tres etapas: entrenamiento base (con fases de entrenamiento estable y de decaimiento), entrenamiento intermedio para reforzar capacidades objetivo y adaptarse a la distribución de datos, y post-entrenamiento con aprendizaje por refuerzo (RL) y un proceso adicional denominado OPD (Optimización de Preferencias Directas, por sus siglas en inglés). El corpus de entrenamiento se publica junto al modelo como los datasets Ultra-FineWeb, Ultra-FineWeb-L3, UltraData-Math y UltraData-SFT-2605.

Una innovación destacable es el **razonamiento híbrido**: el mismo checkpoint puede actuar como asistente rápido o como razonador deliberado activando el modo `thinking` mediante la plantilla de chat. No se requiere un modelo separado para cada modo.

## Capacidades

- Generación de texto causal con soporte de instrucciones y conversación multi-turno.
- Razonamiento deliberado opcional mediante el modo `thinking` activable con `enable_thinking` en la plantilla de chat.
- Generación de código y uso de herramientas (tool calling), con ventaja destacada en agentes y tareas agénticas según los resultados publicados.
- Matemáticas y razonamiento complejo, donde el modelo muestra mejoras frente a alternativas del mismo tamaño.
- Soporte de agentes y razonamiento multi-paso, con integración documentada en entornos de agentes como Cursor, Claude Code y Codex.
- Capacidades multilingües limitadas a inglés y chino.
- Soporte de contexto largo nativo de 131.072 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Sin capacidad de visión en esta variante: el token `<image>` no tiene significado aprendido y no hay módulo de visión adjunto.

## Casos de uso

- **Asistentes locales en el dispositivo**: el modelo cabe en un portátil o una GPU de gama media y puede ejecutarse con Ollama o llama.cpp, ofreciendo un asistente conversacional privado sin dependencia de la nube.
- **Agentes de codigo en local**: con soporte de tool calling y razonamiento híbrido, puede integrarse en flujos de desarrollo como Cursor, Claude Code o Codex para autocompletado, generación de funciones y refactorización, manteniendo los datos del código dentro del entorno del desarrollador.
- **Atencion al cliente automatizada**: con una ventana de 131072 tokens, puede gestionar conversaciones multi-turno con historial largo y consultar documentos de producto mediante herramientas, reduciendo la necesidad de resúmenes intermedios.
- **Analisis de documentos largos**: su contexto de 131K tokens permite procesar contratos, informes o manuales técnicos completos de una sola pasada, extrayendo información y respondiendo preguntas sobre el contenido.
- **Prototipado de agentes con herramientas**: su tamaño compacto lo hace adecuado para prototipar pipelines de agentes que llaman APIs, bases de datos o motores de búsqueda, con costes de inferencia bajos y despliegue rápido.
- **Mascota de escritorio (desktop pet)**: OpenBMB publica MiniCPM-Desk-Pet, una aplicación que usa este modelo como mascota de escritorio con soporte para Apple Silicon, GPU NVIDIA y CPU, y cambio de personalidad mediante LoRA.
- **Investigacion en modelos pequeños**: su licencia Apache 2.0 y su arquitectura estándar facilitan la reproducción de experimentos de afinación, destilación o evaluación en entornos con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados desglosados de benchmarks en la informacion disponible para esta variante. Los datos proporcionados por OpenBMB indican una puntuacion media de **42,57** en un conjunto de benchmarks que cubren razonamiento, conocimiento, codigo, seguimiento de instrucciones, matematicas, logica y tareas agénticas, comparandose con los modelos LFM2.5-1.2B-Thinking, Qwen3-0.6B/think y Qwen3.5-0.8B/think, alcanzando el estado del arte en la clase de 1B dentro de ese conjunto de comparacion. No se dispone de desglose por tarea ni de puntuaciones individuales de los modelos comparados.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el checkpoint en BF16 ocupa aproximadamente 2,2 GB en disco (peso de safetensors), lo que requiere unos 3-4 GB de VRAM para inferencia en BF16. Con cuantizacion a 4 bits (disponible en el checkpoint original en formato GGUF o MLX), el uso de VRAM puede reducirse a alrededor de 1-1,5 GB.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) puede ejecutar el modelo en cuantizacion Q4/Q5. Para BF16 sin cuantizar, se recomienda una GPU con 6 GB o más (RTX 3060, RTX 4060 Ti, RTX 4090). Tambien es viable en CPU con 16 GB de RAM para inferencia lenta.
- **Compatibilidad con consumer GPU**: si, es un modelo diseñado para edge y on-device; se ejecuta en GPUs de consumo desde 4 GB de VRAM.
- **Opciones de despliegue**: llama.cpp (formato GGUF), Ollama, LM Studio, vLLM, TGI y transformers con el backend de HuggingFace. El repositorio original de OpenBMB proporciona guias de despliegue paso a paso para los principales motores.
- **Latencia y throughput**: no disponible en la informacion proporcionada; dependera del motor, la cuantizacion y el hardware. Como referencia, un modelo de 1B en una GPU moderna (RTX 4090) suele generar decenas de tokens por segundo en BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| **MiniCPM5-1B** (OpenBMB) | 1,08B | 131.072 | Apache 2.0 | en, zh | SOTA en clase 1B segun publicacion; modo thinking hibrido; tool calling |
| **Qwen3-0.6B/think** | 0,6B | 32.768 | Apache 2.0 | multilingue | Modelo mas pequeno, contexto menor, sin modo thinking explicito |
| **Qwen3.5-0.8B/think** | 0,8B | no disponible | Apache 2.0 | multilingue | Variante reciente de la serie Qwen3.5; menos documentado |
| **LFM2.5-1.2B-Thinking** | 1,2B | no disponible | no disponible | no disponible | Modelo de razonamiento de Liquid AI; enfoque en reasoning |

Segun los datos de OpenBMB, MiniCPM5-1B supera a estos tres modelos en la puntuacion media del conjunto de benchmarks publicado, con una ventaja mas visible en uso de herramientas, generacion de codigo y razonamiento dificil.

## Limitaciones y advertencias

- **Sin capacidad de vision en esta variante**: el token `<image>` no tiene significado aprendido y no hay encoder de imagen ni proyector. No se debe usar para tareas de vision por imagen.
- **Idiomas limitados**: el modelo soporta solo ingles y chino; no esta entrenado para otros idiomas de forma nativa, lo que puede degradar la calidad en castellano, frances, aleman, etc.
- **Riesgo de alucinacion**: como todo modelo de lenguaje generativo, puede producir contenido falso o inventado, especialmente en tareas de conocimiento factual o cuando se usa con contexto largo.
- **Sesgos**: el modelo puede reflejar sesgos presentes en los datos de entrenamiento (Ultra-FineWeb y datasets asociados), sin garantias de imparcialidad.
- **Restricciones de licencia**: licencia Apache 2.0 permite uso comercial sin restricciones significativas, pero se recomienda revisar los terminos de los datasets asociados.
- **Contexto largo**: aunque soporta 131K tokens, el rendimiento puede degradarse en los extremos de la ventana; se recomienda validar en produccion.
- **Modelo de 1B**: su capacidad es limitada comparada con modelos mas grandes; no es adecuado para tareas que requieran razonamiento profundo, conocimiento enciclopedico o generacion de codigo complejo de alto nivel.

## Enlaces

- Repositorio de la variante: https://huggingface.co/FredyRivera-dev/MiniCPM5-1B
- Modelo original: https://huggingface.co/openbmb/MiniCPM5-1B
- Modelo SFT: https://huggingface.co/openbmb/MiniCPM5-1B-SFT
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B-Base
- Version GGUF: https://huggingface.co/openbmb/MiniCPM5-1B-GGUF
- Version MLX: https://huggingface.co/openbmb/MiniCPM5-1B-MLX
- Repositorio GitHub de MiniCPM: https://github.com/OpenBMB/MiniCPM
- Mascota de escritorio: https://github.com/OpenBMB/MiniCPM-Desk-Pet
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-1B-Demo
- Tech report MiniCPM: https://arxiv.org/pdf/2506.07900
- Paper sobre UltraData Tiered Data Management: https://arxiv.org/pdf/2602.09003
- Wiki de MiniCPM (chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- UltraData: https://ultradata.openbmb.cn/
