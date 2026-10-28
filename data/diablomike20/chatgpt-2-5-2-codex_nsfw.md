# diablomike20/ChatGPT-2.5.2-Codex_NSFW

## Resumen

ChatGPT-2.5.2-Codex_NSFW es un ajuste fino de 354.823.168 parámetros (0,35 B) publicado por el usuario diablomike20 sobre el modelo base 11-47/GPT2.5.2-NSFW-Codex-0.4B. Se distribuye en formato transformers (safetensors) y cuenta con cuantizaciones GGUF estáticas generadas por mradermacher, lo que permite ejecutarlo tanto en GPUs de consumo como en CPU. El modelo está etiquetado únicamente en inglés y lleva la marca `not-for-all-audiences`, señal de que su entrenamiento incluye contenido para adultos.

El interés técnico del modelo no está en su capacidad bruta —0,35 B de parámetros lo sitúan en la liga de los modelos de bolsillo— sino en su receta de entrenamiento: mezcla datasets de destilación de modelos Codex de OpenAI (TeichAI/gpt-5-codex-250x, gpt-5.1-codex-max-1000x, gpt-5.2-high-reasoning-250x, gpt-5.1-high-reasoning-1000x), un corpus de código conversacional (gss1147/GPT-2-to-GPT-5-5k) y un dataset de contenido NSFW extraído de Reddit (jjmachan/NSFW-reddit). Es, por tanto, un experimento de destilación de razonamiento y código sobre una base muy pequeña, con un componente explícito de rol adulto.

Es relevante ahora como caso de estudio de la ola de fine-tunes comunitarios que empaquetan trazas de modelos propietarios en arquitecturas pequeñas, y como ejemplo de modelo que cabe en cualquier hardware pero cuya licencia y procedencia de datos no están documentadas. No hay model card técnica del autor: la página aloja únicamente el README generado por el cuantizador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de la familia transformers; el nombre del base, «GPT2.5.2», sugiere una arquitectura decoder-only tipo GPT-2, sin confirmar en la documentación) |
| Parámetros totales | 354.823.168 (0,35 B), según safetensors |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (cuantizaciones estáticas; no hay imatrix/publicadas por el cuantizador) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | safetensors (repo transformers) y GGUF (repo de cuantizaciones de mradermacher) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. Lo que sí se deduce de las etiquetas es la procedencia de los datos: cuatro conjuntos derivados de modelos Codex/GPT-5.x de OpenAI (250 a 1000 muestras cada uno, orientados a código y razonamiento), un corpus de conversaciones de código (gss1147/GPT-2-to-GPT-5-5k) y un corpus NSFW de Reddit. El resultado es un ajuste fino encadenado: el modelo base 11-47/GPT2.5.2-NSFW-Codex-0.4B ya era a su vez un fine-tune, de modo que este repositorio representa una segunda generación de ajuste sobre una base de 0,4 B.

Como innovación destacable, la única constatable es el uso de datos de destilación de modelos propietarios recientes para inyectar comportamiento de «codex» y «high reasoning» en una arquitectura de bolsillo. No hay mención a decodificación especulativa, atención lineal, SSM ni mecanismos híbridos. El repo ocupa 3,4 GB porque incluye los pesos originales junto con los ficheros GGUF referenciados en la model card.

## Capacidades

- Generación de texto en inglés con estilo conversacional y de asistencia.
- Generación de código y explicaciones de código, presumiblemente heredadas de los datasets Codex empleados (no verificado con benchmarks).
- Razonamiento de tipo «high reasoning» por destilación de datasets etiquetados como tales; a 0,35 B la profundidad real de razonamiento es muy limitada.
- Escritura creativa y narrativa, incluido contenido para adultos (`not-for-all-audiences`).
- Respuestas multi-turno de conversación general.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo «thinking» explícito: no disponible.

## Casos de uso

- Prototipado rápido de pipelines de generación de texto: con 0,35 B y cuantizaciones de 0,3-0,8 GB, permite validar plantillas de prompt, tokenizadores y flujos de inferencia en minutos y en cualquier máquina antes de migrar a un modelo mayor.
- Generación de código en local y sin conexión: útil para autocompletado de snippets y explicaciones de fragmentos cortos en entornos air-gapped donde no se puede llamar a una API externa; su tamaño permite ejecutarlo junto al IDE sin competir por VRAM.
- Experimentación académica con destilación: sirve como caso de estudio de qué se conserva y qué se pierde al destilar trazas de modelos Codex de cientos de miles de millones de parámetros en una base de 0,4 B, comparando salidas antes y después del ajuste.
- Generación de ficción interactiva y juegos de rol para adultos: el corpus NSFW de Reddit y la orientación a diálogo lo hacen adecuado para prototipos de chatbots de rol en entornos controlados y con moderación explícita, siempre que se cumplan los requisitos legales de contenido adulto.
- Etiquetado y clasificación de texto a gran escala: con throughput alto en CPU o GPU modesta, puede usarse para preetiquetar corpus en inglés (categorías, sentimiento, detección de temas) y reservar un modelo mayor solo para la revisión de casos dudosos.
- Pruebas de infraestructura de inferencia: su reducido tamaño lo convierte en un banco de pruebas ideal para validar despliegues de llama.cpp, Ollama o vLLM (versión compatible), medir latencia base y comparar configuraciones de cuantización sin coste de GPU.
- Docencia y divulgación: permite mostrar de extremo a extremo el ciclo de vida de un fine-tune comunitario (dataset, entrenamiento, cuantización, publicación) en un portátil convencional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ningún otro conjunto, y el autor no documenta métricas de pérdida o de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: en f16, el fichero GGUF pesa 0,8 GB (16 bpw); en Q8_0, 0,5 GB; en Q6_K, 0,4 GB; en Q4_K_M, 0,3 GB; en Q2_K, 0,3 GB. Añadir entre 0,1 y 0,5 GB de caché KV según la longitud de contexto efectiva (no documentada).
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente; no requiere A100 ni H100. Una RTX 3060/4060 o incluso una GTX 1650 cubren el modelo con holgura.
- Cabe en GPU de consumo: sí, en toda la gama actual y en muchas integradas. También funciona en CPU pura con llama.cpp.
- Opciones de despliegue: llama.cpp y Ollama para los ficheros GGUF; transformers (PyTorch) para los pesos safetensors; vLLM o TGI solo si se confirma compatibilidad con la arquitectura concreta (no verificada). El tag `endpoints_compatible` sugiere compatibilidad con los endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles de forma medida. Por tamaño, en una GPU de consumo cabe esperar decenas a cientos de tokens por segundo en cuantizaciones Q4/Q8, pero es una estimación basada en el número de parámetros, no una cifra publicada.

## Comparativa con modelos similares

Los datos de los modelos comparables provienen de su documentación pública y no de la información proporcionada en esta ficha; conviene verificarlos antes de citarlos.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ChatGPT-2.5.2-Codex_NSFW (este) | 0,35 B | No disponible | No disponible | HF (safetensors + GGUF) | Fine-tune con datos NSFW y de código; sin benchmarks |
| SmolLM2-360M (HuggingFace) | 0,36 B | 8k (según documentación pública) | Apache-2.0 | HF, GGUF, transformers | Base entrenada desde cero con dataset abierto y benchmarks publicados |
| Qwen2.5-0.5B (Alibaba) | 0,49 B | 32k (según documentación pública) | Apache-2.0 | HF, GGUF, transformers | Multilingüe, con soporte de tool calling y evaluaciones publicadas |
| TinyLlama-1.1B | 1,1 B | 2k (según documentación pública) | Apache-2.0 | HF, GGUF | Mayor tamaño, contexto corto, muy extendido como base de fine-tunes |

La diferencia clave frente a las alternativas no es de rendimiento —no hay datos para compararlo— sino de trazabilidad: los tres modelos de la tabla tienen licencia explícita, model card técnica y evaluaciones publicadas; este repositorio no ofrece ninguna de las tres.

## Limitaciones y advertencias

- Contenido NSFW: el modelo está entrenado con un corpus de contenido para adultos y marcado como `not-for-all-audiences`. No debe desplegarse en productos sin filtros, verificación de edad y políticas de moderación.
- Licencia no disponible: sin licencia explícita no hay autorización clara para uso comercial. Trátese como no apto para producción hasta que el autor la defina.
- Procedencia de los datos: varios datasets provienen de destilación de salidas de modelos propietarios de OpenAI (gpt-5-codex, gpt-5.1-codex-max, gpt-5.2-high-reasoning). Esto puede entrar en conflicto con los términos de servicio del proveedor original y con las políticas de uso de datos derivados.
- Riesgo de alucinación elevado: con 0,35 B de parámetros, la capacidad de mantener coherencia factual y de razonar sobre contextos largos es intrínsecamente limitada; no es un modelo fiable para respuestas factuales sin verificación.
- Solo inglés: no hay soporte documentado de castellano ni de otros idiomas; el rendimiento fuera del inglés será degradado.
- Longitud de contexto desconocida: no se puede planificar un caso de uso que dependa de ventanas largas sin medirlo empíricamente.
- Ausencia de benchmarks: no hay ninguna evidencia publicada de calidad, lo que impide compararlo objetivamente con alternativas.
- Doble fine-tune: al derivar de un modelo base ya ajustado (11-47/GPT2.5.2-NSFW-Codex-0.4B), los sesgos y defectos del ajuste anterior se heredan y se amplifican.
- Sesgos no evaluados: ni el autor ni el cuantizador documentan evaluaciones de sesgo, toxicidad o seguridad.
- Repositorio sin mantenimiento aparente: 0 descargas y 0 likes en la fecha de creación, sin model card propia del autor; el soporte de la comunidad es prácticamente nulo.
- Cuantizaciones Q2/Q3: las versiones de 0,3 GB degradan notablemente la calidad; para uso real conviene Q4_K_M o superior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/diablomike20/ChatGPT-2.5.2-Codex_NSFW
- Modelo base: https://huggingface.co/11-47/GPT2.5.2-NSFW-Codex-0.4B
- Cuantizaciones GGUF de mradermacher: https://huggingface.co/mradermacher/GPT-2.5.2-NSFW-Codex-0.4B-GGUF
- Página de descarga consolidada de cuantizaciones: https://hf.tst.eu/model#GPT-2.5.2-NSFW-Codex-0.4B-GGUF
- Dataset TeichAI/gpt-5.1-codex-max-1000x: https://huggingface.co/datasets/TeichAI/gpt-5.1-codex-max-1000x
- Dataset TeichAI/gpt-5.2-high-reasoning-250x: https://huggingface.co/datasets/TeichAI/gpt-5.2-high-reasoning-250x
- Dataset TeichAI/gpt-5-codex-250x: https://huggingface.co/datasets/TeichAI/gpt-5-codex-250x
- Dataset TeichAI/gpt-5.1-high-reasoning-1000x: https://huggingface.co/datasets/TeichAI/gpt-5.1-high-reasoning-1000x
- Dataset gss1147/GPT-2-to-GPT-5-5k: https://huggingface.co/datasets/gss1147/GPT-2-to-GPT-5-5k
- Dataset jjmachan/NSFW-reddit: https://huggingface.co/datasets/jjmachan/NSFW-reddit
- Guía de uso de ficheros GGUF citada por el cuantizador: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
