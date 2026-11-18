# ggml-org/LFM2.5-24B-A2B-GGUF

## Resumen

LFM2.5-24B-A2B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por LiquidAI. Con 23.971.587.712 parámetros totales y una arquitectura que activa solo una fracción de ellos por token (denominación A2B, indicativa de aproximadamente 2 mil millones de parámetros activos), está diseñado para ofrecer un equilibrio entre capacidad de razonamiento y eficiencia computacional en inferencia.

La ficha que nos ocupa, ggml-org/LFM2.5-24B-A2B-GGUF, es la conversión oficial a formato GGUF realizada por el equipo de ggml-org (los mantenedores de llama.cpp). Esta conversión habilita la ejecución del modelo en hardware de consumo y en entornos de inferencia local mediante llama.cpp, Ollama o llama.app, sin necesidad de GPUs de centro de datos.

El modelo resulta relevante porque combina un tamaño total elevado (24B) con un coste de activación reducido, lo que permite desplegarlo en configuraciones de memoria moderadas si se emplean cuantizaciones agresivas. La conversión incluye cuantizaciones Q8_0 y Q4_K_M idénticas a las publicadas por LiquidAI, además de una variante Q4_0 entrenada con destilación consciente de cuantización (QAD) para recuperar precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), transformer; detalles internos no disponibles |
| Parametros totales | 23.971.587.712 (aprox. 24B) |
| Parametros activos | Aproximadamente 2B (según denominación A2B; cifra exacta no disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q8_0, Q4_K_M, Q4_0 (QAD); otras variantes según el repositorio |
| Idiomas soportados | No disponible |
| Licencia | LFM 1.0 (lfm1.0, "other") |
| Formato de pesos | GGUF (modelo base en safetensors disponible en LiquidAI/LFM2.5-24B-A2B) |

## Arquitectura y entrenamiento

La información disponible confirma que LFM2.5-24B-A2B emplea una arquitectura de mezcla de expertos con 24B parámetros totales y aproximadamente 2B activos por token. No se detallan en la documentación proporcionada el número de expertos, la estrategia de enrutamiento, el tipo de atención ni la composición exacta del dataset de entrenamiento. Tampoco se especifican el número de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO.

La innovación técnica destacable en esta ficha es la conversión a GGUF realizada por ggml-org mediante su herramienta convert, que preserva las cuantizaciones Q8_0 y Q4_K_M originales de LiquidAI. Además, LiquidAI publica una variante Q4_0 entrenada con destilación consciente de cuantización (QAD) para mitigar la pérdida de precisión asociada a la cuantización de 4 bits. El repositorio ocupa 176 GB, lo que refleja la inclusión de múltiples niveles de cuantización del modelo completo.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y la etiqueta conversational, orientado a diálogo multi-turno.
- Razonamiento y generación de contenido general: capacidades inferidas de su categoría como modelo de lenguaje de gran escala; no se detallan evaluaciones específicas.
- Ejecución local mediante llama.cpp, llama.app, Ollama y otros runtimes compatibles con GGUF.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su integración en servicios de inferencia.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la documentación proporcionada.

## Casos de uso

- Asistente conversacional autoalojado: el modelo puede desplegarse en local con llama.cpp u Ollama para gestionar diálogos multi-turno sin depender de APIs externas, aprovechando su naturaleza MoE para reducir el coste por token.
- Prototipado en estaciones de trabajo con GPU de consumo: gracias a las cuantizaciones Q4_K_M y Q4_0 (QAD), es viable ejecutar el modelo en equipos con VRAM limitada, útil para desarrolladores que evalúan calidad antes de escalar.
- Generación de texto en pipelines de procesamiento por lotes: su formato GGUF y compatibilidad con endpoints permiten integrarlo en flujos de generación de contenido, resúmenes o clasificación textual en servidores propios.
- Investigación sobre eficiencia de MoE: el modelo sirve como banco de pruebas para estudiar el equilibrio entre parámetros totales y activos en tareas de razonamiento, comparando cuantizaciones Q8_0 frente a Q4.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en infraestructura propia, es adecuado para aplicaciones donde los datos no pueden salir del perímetro de la organización.
- Evaluación comparativa de cuantizaciones: la disponibilidad de Q8_0, Q4_K_M y Q4_0 QAD permite medir empíricamente la degradación de calidad por cuantización en tareas concretas del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 24B en Q4_K_M requiere del orden de 13-15 GB de memoria, y en Q8_0 del orden de 25-26 GB; estas cifras son estimaciones basadas en el tamaño del modelo y no datos publicados.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) podría alojar cuantizaciones Q4 en su totalidad; para Q8_0 serían necesarias GPUs de 32 GB o superiores (A100 40 GB, H100).
- Cabe en GPU de consumo: probablemente en RTX 3090/4090 con cuantizaciones de 4 bits, sujeto a verificación empírica.
- Opciones de despliegue: llama.cpp, llama.app (`llama serve -hf ggml-org/LFM2.5-24B-A2B-GGUF`), Ollama y otros runtimes compatibles con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B (esta ficha) | ~24B | ~2B (A2B) | No disponible | LFM 1.0 | GGUF, safetensors |
| LiquidAI/LFM2.5-24B-A2B (original) | ~24B | ~2B (A2B) | No disponible | LFM 1.0 | safetensors, GGUF |
| Alternativas MoE de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables adicionales en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; cabe esperar los sesgos habituales de modelos entrenados con datos web, sin confirmación oficial.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad para este modelo.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados, lo que impide garantizar su comportamiento en contextos largos o en castellano.
- Restricciones de licencia: la licencia LFM 1.0 ("other") puede imponer condiciones específicas para uso comercial; es necesario revisar el texto completo en el enlace de licencia antes de desplegar en producción.
- Degradación por cuantización: las variantes Q4_0 y Q4_K_M pueden perder precisión frente a Q8_0; la variante QAD Q4_0 mitiga parcialmente este efecto, pero no lo elimina.
- Conversión automática: el autor advierte que el modelo ha sido convertido automáticamente con ggml-org/convert, por lo que conviene validar la calidad de la conversión en el caso de uso concreto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ggml-org/LFM2.5-24B-A2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- GGUF oficiales de LiquidAI: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF
- Licencia: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B/blob/main/LICENSE
- Herramienta de conversión: https://github.com/ggml-org/convert
- Runtime llama.app: https://llama.app
