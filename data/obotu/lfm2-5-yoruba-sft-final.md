# Obotu/lfm2.5-yoruba-sft-final

## Resumen

El modelo `Obotu/lfm2.5-yoruba-sft-final` es un ajuste fino (fine-tuning) del modelo base LFM2.5 de Liquid AI, realizado por el usuario Obotu, orientado a la generación de texto y conversación en yoruba, un idioma hablado principalmente en Nigeria y con escasos recursos en el ecosistema de modelos de lenguaje. El nombre del repositorio indica que se trata de un entrenamiento supervisado (SFT) finalizado, probablemente sobre una variante de la familia LFM2.5, que Liquid AI ha diseñado específicamente para despliegue en dispositivos edge (on-device) con alta eficiencia de memoria y velocidad.

El modelo tiene aproximadamente 2.700 millones de parámetros totales (2.697.198.592), lo que lo sitúa en un rango medio-bajo, adecuado para inferencia en hardware consumer. La arquitectura subyacente corresponde a la familia LFM2.5, que según la documentación de Liquid AI emplea una mezcla de expertos (MoE) con activación selectiva, aunque no se ha confirmado si esta variante concreta mantiene esa configuración. La model card es genérica y no aporta detalles sobre contexto, licencia o idiomas soportados, por lo que la información disponible es limitada y se basa en inferencias del nombre y los metadatos del repositorio.

La relevancia de este modelo radica en su potencial para aplicaciones de procesamiento de lenguaje natural en yoruba, un ámbito donde la disponibilidad de modelos específicos es escasa. Al estar basado en LFM2.5, hereda las optimizaciones para ejecución en dispositivos con recursos limitados, lo que podría facilitar su uso en entornos móviles o embebidos. No obstante, la ausencia de documentación técnica y de benchmarks publicados limita su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (basada en Liquid Foundation Models, probablemente MoE) |
| Parametros totales | 2.697.198.592 (~2,7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (existe un repo GGUF asociado, pero sin especificaciones) |
| Idiomas soportados | yoruba (inferido por el nombre; la model card no lo especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento

La arquitectura se basa en la familia LFM2.5 de Liquid AI, que según el blog oficial de la compañía emplea un diseño de mezcla de expertos (MoE) con un número reducido de parámetros activos por token, optimizado para inferencia en dispositivos edge. El modelo base LFM2.5-8B-A1B, por ejemplo, tiene 8.000 millones de parámetros totales y 1.000 millones activos. Sin embargo, el modelo de Obotu presenta 2.697.198.592 parámetros totales, lo que sugiere que podría tratarse de una variante más pequeña de la familia (posiblemente LFM2.5-2.7B o similar), aunque no se ha confirmado oficialmente.

El entrenamiento consistió en un ajuste fino supervisado (SFT) sobre datos en yoruba, como indica el sufijo "sft-final" en el nombre. No se dispone de información sobre el volumen de datos, la composición del dataset, el número de épocas, la configuración de hiperparámetros ni si se aplicaron técnicas adicionales como RLHF o DPO. La model card no proporciona ningún detalle sobre el procedimiento de entrenamiento, y el autor no ha publicado documentación complementaria.

## Capacidades

- Generación de texto en yoruba: el modelo está específicamente ajustado para producir texto coherente en este idioma, aunque no se han publicado ejemplos ni evaluaciones.
- Conversación multi-turno: el tag "conversational" sugiere que puede mantener diálogos, pero no hay evidencia de su calidad o límites.
- Compatibilidad con transformers: al estar alojado en HuggingFace con la librería transformers, puede integrarse en pipelines estándar de generación de texto.
- No se han documentado capacidades adicionales como tool calling, razonamiento avanzado, soporte de agentes, visión o audio.

## Casos de uso

- Asistente de atención al cliente en yoruba: el modelo podría integrarse en un chatbot para responder consultas de usuarios que hablan yoruba, aprovechando su ajuste en este idioma. Dado su tamaño moderado, podría desplegarse en servidores de baja capacidad o incluso en dispositivos móviles.
- Traducción automática yoruba-español o yoruba-inglés: aunque no está específicamente entrenado para traducción, su capacidad de generación en yoruba podría servir como base para sistemas de traducción asistida, combinado con modelos multilingües.
- Transcripción y resumen de textos en yoruba: útil para procesar documentos, noticias o contenido generado por usuarios en este idioma, generando resúmenes o extrayendo información clave.
- Generación de contenido educativo en yoruba: creación de materiales didácticos, ejercicios o explicaciones en yoruba para entornos educativos donde este idioma es predominante.
- Desarrollo de asistentes de voz en yoruba: combinado con un sistema de reconocimiento de voz, el modelo podría generar respuestas habladas en yoruba para aplicaciones de asistencia personal.
- Investigación en PLN para lenguas de bajos recursos: sirve como punto de partida para experimentos de fine-tuning adicional, transferencia de aprendizaje o evaluación comparativa con otros modelos multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo. Tampoco se han comparado sus capacidades con otros modelos de tamaño similar o con el modelo base LFM2.5.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,7B parámetros, en precisión FP16 el modelo ocupa aproximadamente 5,4 GB (coincide con el tamaño del repositorio). En cuantización de 4 bits, el uso de VRAM se reduciría a unos 1,5-2 GB.
- GPU recomendadas: una GPU consumer con al menos 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3060, GTX 1660 Super) podría ejecutar el modelo en FP16. Con cuantización 4-bit, bastaría con 4 GB (GTX 1650, RTX 3050).
- Si cabe en consumer GPU: sí, en la mayoría de GPUs modernas de gama media.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. El repositorio GGUF asociado sugiere que ya existe una versión cuantizada para llama.cpp.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de 2,7B en una GPU como RTX 3060, se espera una latencia de decodificación de decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo base LFM2.5-8B-A1B de Liquid AI tiene 8B parámetros totales y 1B activos, con una ventana de contexto de 32K tokens (según el blog de Liquid AI), pero no se ha verificado si esta variante de 2,7B comparte esas características. Otros modelos multilingües como mT5 o XLM-R podrían ser alternativas para tareas en yoruba, pero no son directamente comparables en tamaño ni en enfoque. La falta de benchmarks y de especificaciones detalladas impide una comparación objetiva.

## Limitaciones y advertencias

- La model card es genérica y no proporciona información sobre sesgos, riesgos o limitaciones específicas. No se han documentado posibles sesgos de género, étnicos o culturales en el entrenamiento.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en contextos donde los datos de entrenamiento son escasos.
- Limitaciones de idioma: aunque está ajustado para yoruba, no se especifica si el modelo base era multilingüe o si el fine-tuning cubre todas las variantes dialectales del yoruba. El rendimiento en otros idiomas es desconocido.
- Licencia no especificada: no se indica la licencia del modelo, lo que genera incertidumbre sobre su uso comercial o la redistribución. Se recomienda contactar al autor antes de utilizarlo en producción.
- Sin garantías de calidad: al no haber benchmarks ni evaluaciones independientes, no se puede asegurar un nivel mínimo de rendimiento en tareas concretas.
- Fecha de creación futura: el modelo fue creado el 25 de agosto de 2026, lo que podría indicar un error en los metadatos o una fecha deliberadamente futura. Esto no afecta al funcionamiento, pero es un dato a tener en cuenta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Obotu/lfm2.5-yoruba-sft-final
- Repositorio GGUF asociado: https://huggingface.co/Obotu/lfm2.5-yoruba-sft-GGUF
- Modelo base LFM2.5-8B-A1B: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Blog de Liquid AI sobre LFM2.5: https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai
- Blog de Liquid AI sobre LFM2: https://www.liquid.ai/blog/liquid-foundation-models-v2-our-second-series-of-generative-ai-models
- Cookbook de Liquid AI en GitHub: https://github.com/Liquid4All/cookbook
