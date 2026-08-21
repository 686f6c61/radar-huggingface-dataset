# Audio8/Audio8-TTS-Preview-0.1b

## Resumen

Audio8 TTS Preview 0.1B es un modelo de síntesis de voz (text-to-speech) con clonación de voz zero-shot, desarrollado por Audio8. Su principal característica es su tamaño compacto: el modelo generativo principal tiene aproximadamente 170 millones de parámetros, lo que lo convierte en uno de los sistemas TTS multilingües más pequeños capaces de clonar voz sin entrenamiento previo. El modelo utiliza una arquitectura propietaria denominada Audio8 Falcon H1, con dos ramas autoregresivas: una lenta que predice tokens semánticos y otra rápida que predice los codebooks del codec neuronal.

El modelo soporta ocho idiomas, con chino e inglés como lenguas principales y alemán, español, francés, italiano, japonés y coreano en estado experimental. Está diseñado para ejecutarse en hardware modesto, incluyendo GPUs de consumo, y se distribuye bajo una licencia comunitaria específica (audio8-community-license-v1.0). Su relevancia actual radica en democratizar la clonación de voz de alta calidad, ya que modelos comparables suelen tener entre 0.8B y 8.5B de parámetros, mientras que este checkpoint logra resultados competitivos con una fracción del coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio8 Falcon H1 (AR dual: rama lenta 24 capas, rama rápida 4 capas) |
| Parametros totales | 169.779.904 (modelo principal, safetensors) + ~120M (codec decoder, codec.pth) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 posiciones empaquetadas de texto/audio |
| Tipos de cuantizacion | No disponible (se distribuye en bfloat16/float32; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | zh, en (primarios); de, es, fr, it, ja, ko (experimental) |
| Licencia | audio8-community-license-v1.0 (licencia propia, no OSI) |
| Formato de pesos | safetensors (modelo principal) y codec.pth (codec decoder) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Audio8 Falcon H1, que combina dos ramas autoregresivas. La rama lenta (slow AR) consta de 24 capas con ancho 512, 8 cabezas de atención y 2 cabezas KV, y se encarga de predecir tokens semánticos. La rama rápida (fast AR) tiene 4 capas con las mismas dimensiones y predice los 10 codebooks del codec neuronal, condicionada por el estado oculto de la rama lenta. El codec trabaja a 44.1 kHz con 2.048 muestras por frame (aproximadamente 21.5 frames por segundo) y cada codebook tiene 4.096 entradas.

El modelo se distribuye con código remoto de Hugging Face (trust_remote_code=True) e incluye el codec decoder integrado en el repositorio, por lo que no requiere checkpoints adicionales. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. La inferencia se realiza mediante generación autoregresiva con decodificación por muestreo (temperatura, top-p, top-k configurables).

## Capacidades

- Generación de voz a partir de texto en ocho idiomas (zh, en, de, es, fr, it, ja, ko), con calidad superior en chino e inglés.
- Clonación de voz zero-shot: a partir de un audio de referencia y su transcripción, el modelo replica la voz del hablante sin entrenamiento adicional.
- Síntesis sin clonación: si se omiten los parámetros de referencia, el modelo genera voz con una voz por defecto.
- Inferencia por lotes: soporta procesamiento de múltiples textos y audios de referencia en una sola pasada.
- Decodificación de audio integrada: el modelo incluye el codec decoder, por lo que la generación produce directamente formas de onda listas para guardar como WAV.
- Integración con Transformers: se carga mediante AutoModel y AutoProcessor, facilitando su uso en pipelines existentes.

## Casos de uso

- Audiolibros y narración automatizada: el modelo puede generar narración en varios idiomas a partir de texto, con una calidad aceptable para prototipos y contenidos de bajo presupuesto. Su tamaño reducido permite ejecutarlo en servidores modestos o incluso en estaciones de trabajo sin GPUs de gama alta.
- Asistentes de voz personalizados: gracias a la clonación zero-shot, se puede crear una voz personalizada con solo unos segundos de audio de referencia, ideal para aplicaciones de asistente virtual o branding de voz.
- Doblaje de vídeo y localización: con soporte multilingüe, el modelo puede generar pistas de voz en diferentes idiomas a partir de un mismo guion, aunque la calidad en idiomas experimentales (es, fr, it, ja, ko) es inferior a la de los primarios.
- Generación de contenido educativo: creación de lecciones de audio, podcasts o material de e-learning con voces sintéticas, reduciendo costes de producción.
- Pruebas de producto y prototipado: los equipos de desarrollo pueden integrar el modelo en entornos de prueba para validar flujos de voz sin depender de servicios cloud de pago.
- Investigación en TTS y clonación de voz: al ser un modelo abierto y compacto, sirve como punto de partida para experimentos de fine-tuning, análisis de arquitecturas AR duales o comparativas de eficiencia.

## Benchmarks y rendimiento

La model card publica una comparativa de tasas de error (WER/CER, menor es mejor) sobre el conjunto CV3, junto con valores de referencia de otros modelos. No se proporcionan métricas de similitud de voz (SIM) ni resultados en otros benchmarks estándar como MMLU o HumanEval (no aplicables a TTS). Los datos son comparaciones de referencia, no una re-evaluación estrictamente controlada.

| Modelo | Parámetros | zh | en | ja | ko | de | es | fr | it |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Audio8 TTS Preview 0.1B | ~0.17B | 3.619 | 3.307 | 12.322 | 7.653 | 5.292 | 8.548 | 12.349 | 14.480 |
| Audio8 TTS Preview 0.6B | 0.6B | 3.205 | 3.128 | 7.205 | 4.223 | 3.447 | 3.641 | 8.790 | 4.790 |
| Fish S2 Pro | 4.6B | 3.600 | 3.493 | 5.139 | 4.111 | 3.605 | 2.972 | 8.600 | 4.229 |
| Higgs Audio v2 | 4.7B | 3.378 | 3.404 | 4.742 | 4.260 | 3.300 | 2.929 | 9.425 | 3.555 |
| CosyVoice3-1.5B | 1.5B | 3.91 | 4.99 | 7.57 | no disponible | no disponible | no disponible | no disponible | no disponible |

El modelo 0.1B obtiene resultados competitivos en chino e inglés (3.619 y 3.307 respectivamente), pero su rendimiento se degrada notablemente en idiomas experimentales, especialmente en italiano (14.480) y francés (12.349). En comparación con modelos mucho más grandes, la brecha es evidente en todos los idiomas no primarios.

## Requisitos de hardware

- VRAM estimada: el modelo principal en bfloat16 ocupa aproximadamente 340 MB; el codec decoder (~120M parámetros) añade unos 240 MB. En total, menos de 600 MB de VRAM para inferencia en precisión nativa. Con cuantización a 8 bits (si se aplica manualmente), el consumo podría reducirse a unos 300 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como GTX 1650, RTX 2060, RTX 3060 o superiores funcionan sin problemas. También es viable en CPU para inferencia de baja latencia, aunque más lento.
- Compatibilidad con GPUs de consumo: sí, es uno de los puntos fuertes del modelo. Incluye GPUs integradas de gama baja y incluso algunas NPUs.
- Opciones de despliegue: se integra con Transformers (carga mediante AutoModel con trust_remote_code=True). No se documenta soporte oficial para vLLM, llama.cpp u Ollama, pero al ser un modelo pequeño, puede servirse mediante una API Python simple o FastAPI. El codec está incluido, por lo que no requiere servicios externos.
- Latencia y throughput: no se publican datos oficiales. Dado el tamaño, se estima una generación de audio en tiempo real o superior en GPUs modernas (por ejemplo, una RTX 4090 podría generar varios segundos de audio por segundo de cómputo), pero estos valores son orientativos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---:|---|---|---|---|
| Audio8 TTS Preview 0.1B | ~0.17B | 2.048 | 8 (2 primarios) | audio8-community-license-v1.0 | safetensors + codec.pth |
| Audio8 TTS Preview 0.6B | ~0.6B | no disponible | 8 (2 primarios) | audio8-community-license-v1.0 | safetensors |
| Fish S2 Pro | ~4.6B | no disponible | multilingüe | no disponible | no disponible |
| Higgs Audio v2 | ~4.7B | no disponible | multilingüe | no disponible | no disponible |
| CosyVoice3-1.5B | ~1.5B | no disponible | multilingüe | no disponible | no disponible |

La comparativa se basa en los datos de la model card. El 0.1B es significativamente más pequeño que sus alternativas, lo que lo hace adecuado para despliegues en edge o entornos con recursos limitados. Sin embargo, su rendimiento en idiomas no primarios es claramente inferior al de modelos más grandes, como se refleja en los benchmarks. La licencia comunitaria puede imponer restricciones de uso comercial; se recomienda revisar el texto completo de la licencia.

## Limitaciones y advertencias

- Calidad desigual entre idiomas: el rendimiento en chino e inglés es notable, pero en alemán, español, francés, italiano, japonés y coreano la tasa de error es mucho mayor (hasta 14.48 en italiano), lo que limita su uso en producción para estos idiomas.
- Contexto limitado: la ventana de 2.048 posiciones empaquetadas puede restringir la generación de textos largos o la inclusión de múltiples referencias de audio en una sola pasada.
- Riesgo de alucinación de audio: como cualquier modelo generativo, puede producir fonemas o entonaciones incorrectas, especialmente en idiomas experimentales o con referencias de baja calidad.
- Licencia restrictiva: la audio8-community-license-v1.0 no es una licencia OSI estándar; es necesario revisar sus términos para uso comercial, redistribución o modificación. No se permite su uso en aplicaciones que violen la política de la comunidad.
- Dependencia de código remoto: el modelo requiere trust_remote_code=True, lo que implica ejecutar código arbitrario de Hugging Face. En entornos de producción, esto exige auditorías de seguridad del código remoto.
- Sin documentación de entrenamiento: no se publican detalles sobre el dataset, el preprocesado ni las técnicas de alineación, lo que dificulta la reproducibilidad y la evaluación de sesgos.
- Sesgos potenciales: al estar entrenado principalmente en chino e inglés, es probable que las voces generadas reflejen sesgos lingüísticos y culturales de estos idiomas, con menor naturalidad en otros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.1b
- Repositorio GitHub: https://github.com/Audio8-AI/Audio8_TTS
- Demo con muestras de audio: https://audio8-ai.github.io/Audio8_TTS/0.1B/
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/audio8-tts-preview-0.1b-audio8
- Modelo 0.6B (hermano mayor): https://huggingface.co/Audio8/Audio8-TTS-Preview-0.6b
