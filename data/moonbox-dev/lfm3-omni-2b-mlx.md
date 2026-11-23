# moonbox-dev/LFM3-Omni-2B-MLX

## Resumen

LFM3-Omni-2B-MLX es una compilación no oficial del modelo multimodal LFM3-Omni-2B de Liquid AI, adaptada por el usuario moonbox-dev para ejecutarse en Apple Silicon mediante el framework MLX. El modelo original es un sistema any-to-any de 2.000 millones de parámetros que procesa y genera texto, imagen y audio, y esta versión lo empaqueta en formatos cuantizados a 8 y 6 bits listos para su uso con la librería mlx-vlm.

La relevancia de esta ficha radica en que permite desplegar un modelo omni-modal en hardware de consumo de Apple (chips M-series) sin necesidad de GPUs dedicadas, algo poco habitual en la categoría de modelos any-to-any. Cada build incluye pesos, configuración, tokenizador, plantilla de chat y ajustes de procesador, por lo que es un artefacto autocontenido y no un simple volcado de pesos.

No se dispone de información sobre la longitud de contexto, los idiomas soportados ni los datos de entrenamiento en la documentación proporcionada. La licencia es lfm1.0 (marcada como "other"), lo que condiciona el uso comercial y debe revisarse antes de cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3 de Liquid AI; familia LFM3) |
| Parametros totales | 2B (según nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits y 6 bits (MLX) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | safetensors (MLX), con config.json, tokenizer.json, chat_template.jinja, processor_config.json |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base LFM3-Omni-2B de Liquid AI. Por la nomenclatura de la familia LFM (Liquid Foundation Models) y el pipeline any-to-any, se trata de un modelo multimodal que integra codificadores de visión y audio junto con un núcleo de lenguaje, pero no se especifican el tipo de transformer, el mecanismo de atención ni si emplea componentes de estado recurrente o híbridos. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

Lo que sí está documentado es el proceso de cuantización realizado por moonbox-dev. Se generaron dos builds MLX (8 bits y 6 bits) y se midió su desviación respecto al modelo original en bf16 mediante divergencia KL, acuerdo top-1 y perplejidad. Para el build de 8 bits: KL 0,0013 nats (p95 0,0036), acuerdo top-1 del 97,9 % y perplejidad 28,86 frente a 28,86 del original. Para el de 6 bits: KL 0,0068 nats (p95 0,019), acuerdo top-1 del 95,1 % y perplejidad 28,97 frente a 28,86. Estos datos indican que la cuantización a 8 bits es prácticamente lossless en la métrica evaluada, mientras que 6 bits introduce una degradación medible pero contenida.

## Capacidades

- Generación de texto y razonamiento multimodal: el pipeline any-to-any implica entrada y salida en múltiples modalidades, aunque no se detallan las combinaciones exactas soportadas.
- Procesamiento de visión: incluye configuraciones de preprocesador de vídeo y visión, lo que sugiere soporte de imagen y potencialmente vídeo.
- Procesamiento de audio: incorpora un tokenizador de audio dedicado (audio_tokenizer) con pesos propios de 147,1 MB.
- Generación de audio: al ser un modelo any-to-any, se infiere salida de audio, aunque no se documenta explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están listados.
- Modo thinking: no disponible.
- Integración con mlx-vlm: compatible con el ecosistema MLX para Apple Silicon, incluyendo plantilla de chat y configuración de generación.

## Casos de uso

- Asistentes multimodales en local para macOS: el modelo puede desplegarse en un Mac con chip M-series usando mlx-vlm, permitiendo conversaciones que combinan texto, imagen y audio sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Transcripción y comprensión de audio en dispositivos: gracias al tokenizador de audio incluido, se puede usar para tareas de comprensión de habla o descripción de contenido sonoro en aplicaciones de escritorio, con la ventaja de ejecutarse íntegramente en el equipo.
- Descripción de imágenes y vídeo en pipelines de accesibilidad: el preprocesador de vídeo y las capacidades de visión permiten generar descripciones automáticas de contenido visual para herramientas de accesibilidad o catalogación de medios.
- Prototipado rápido de aplicaciones any-to-any: al ser un build autocontenido con plantilla de chat y configuración de generación, sirve para validar ideas de producto que requieran entrada y salida multimodal sin depender de APIs externas.
- Investigación en cuantización y eficiencia: los datos de KL, acuerdo top-1 y perplejidad publicados por el autor permiten estudiar el impacto de la cuantización a 8 y 6 bits en modelos multimodales pequeños, como referencia para experimentos propios.
- Educación y demos interactivas: un modelo de 2B en formato MLX cabe en un portátil Apple y puede usarse en talleres o clases para demostrar sistemas omni-modales sin infraestructura de GPU.
- Evaluación comparativa de frameworks: útil para comparar el rendimiento de mlx-vlm frente a otras pilas de inferencia (llama.cpp, vLLM) en el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento son las métricas de fidelidad de cuantización respecto al modelo original en bf16:

| Build | KL (nats) | KL p95 | Acuerdo top-1 | Perplejidad (build vs original) |
|---|---|---|---|---|
| 8 bits | 0,0013 | 0,0036 | 97,9 % | 28,86 vs 28,86 |
| 6 bits | 0,0068 | 0,019 | 95,1 % | 28,97 vs 28,86 |

## Requisitos de hardware

- VRAM/ memoria unificada estimada: el build de 8 bits ocupa 2,71 GB en pesos (más 147,1 MB del tokenizador de audio); el de 6 bits, 2,28 GB. El repositorio completo pesa 7,3 GB porque incluye ambos builds y sus ficheros auxiliares.
- Hardware objetivo: Apple Silicon (chips M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX. No está pensado para GPUs NVIDIA o AMD.
- Cabe en GPU de consumo: sí, en cualquier Mac con memoria unificada de 8 GB o superior; con 16 GB se dispone de margen para contexto y otras aplicaciones.
- Opciones de despliegue: mlx-vlm (librería de referencia del build). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que los pesos están en formato MLX y no en GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B-MLX (este) | 2B | no disponible | texto, visión, audio (any-to-any) | lfm1.0 | Hugging Face, build comunitario MLX |
| LiquidAI/LFM3-Omni-2B | 2B | no disponible | texto, visión, audio | lfm1.0 | Hugging Face, oficial |
| Alternativas any-to-any de ~2B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoría; la comparación se limita al modelo base oficial y a la ausencia de referencias cuantitativas en la información proporcionada.

## Limitaciones y advertencias

- Build no oficial: moonbox-dev declara explícitamente que estos ficheros no son un lanzamiento de Liquid AI; no hay garantía de soporte ni de paridad funcional con el modelo original.
- Licencia lfm1.0: marcada como "other", con posibles restricciones de uso comercial. Es imprescindible revisar el fichero LICENSE antes de desplegar en producción.
- Idiomas no documentados: se desconoce la cobertura lingüística, lo que impide garantizar calidad en castellano u otros idiomas.
- Contexto desconocido: no se especifica la ventana de contexto, factor crítico para aplicaciones de conversación larga o documentos extensos.
- Degradación por cuantización: el build de 6 bits presenta un acuerdo top-1 del 95,1 % y KL de 0,0068 nats; para tareas sensibles conviene usar el de 8 bits.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, es esperable, especialmente en modalidades menos documentadas.
- Sesgos: no documentados.
- Exclusivo de Apple Silicon: no ejecutable en GPUs NVIDIA/AMD ni en CPU convencional sin conversión adicional.
- Ecosistema limitado: depende de mlx-vlm; no hay soporte documentado para otras pilas de inferencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moonbox-dev/LFM3-Omni-2B-MLX
- Modelo base oficial: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Licencia (referenciada en la model card): LICENSE dentro del repositorio
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada.
