# blaj/MiniCPM-V-4.7-1B-int8-ov

## Resumen

MiniCPM-V-4.7-1B-int8-ov es una exportación a OpenVINO en precisión INT8 del modelo multimodal MiniCPM-V-4.7-1B, desarrollado originalmente por OpenBMB. El autor de esta conversión es el usuario blaj, que publica el artefacto con verificación de hash SHA-256 de los pesos de origen antes de la exportación. El modelo resuelve tareas de image-text-to-text, es decir, entrada conjunta de imagen y texto con salida de texto conversacional.

Se trata de un modelo compacto de aproximadamente 1B de parámetros, pensado para despliegue en entornos Intel mediante OpenVINO GenAI. La versión INT8 reduce el peso del repositorio a 1,6 GB, lo que facilita su ejecución en hardware de consumo y en aceleradores integrados. La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo visión-lenguaje de tamano reducido, una cuantización INT8 lista para producción y un esquema de decodificación especulativa (dSparK) con un draft model FP16 complementario.

La model card es explícita sobre el alcance de la verificación: se observó generación de texto y aceptación de tokens del draft en GPU, pero la inferencia de imagen no fue verificada y la salida greedy no siempre coincide con la decodificación solo del target. Estos caveats son importantes para cualquier evaluacion en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje), con 17 bloques de linear attention según la configuración probada; detalles completos no disponibles |
| Parametros totales | Aproximadamente 1B (según el nombre del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 (target); el draft complementario es FP16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (exportación Optimum Intel); repo de 1,6 GB |

## Arquitectura y entrenamiento

El modelo base es MiniCPM-V-4.7-1B de OpenBMB, un modelo multimodal de tipo visión-lenguaje que procesa imágenes y texto para producir respuestas conversacionales. La model card de esta exportación no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO; esa información correspondería a la model card del modelo original de OpenBMB, que no se incluye en la información disponible.

La innovación técnica destacable de este artefacto no está en el modelo en sí, sino en el pipeline de despliegue: se exporta mediante Optimum Intel a OpenVINO y se empareja con un draft model FP16 (MiniCPM-V-4.7-1B-DSpark-fp16-ov) para decodificación especulativa. La configuración probada usa GPU, `KV_CACHE_PRECISION="f16"`, 17 bloques de linear attention y 15 tokens de asistente. El exportador estándar de drafts no consumió los tensores de la cabeza de confianza del checkpoint; el companion exportado es la cabeza de Markov. Esta limitación puede afectar al comportamiento de la decodificación especulativa respecto al diseno original.

## Capacidades

- Generación de texto conversacional multi-turno a partir de entradas de imagen y texto (pipeline image-text-to-text).
- Comprensión de imágenes: la arquitectura es visión-lenguaje, aunque la inferencia de imagen no fue verificada en esta exportación concreta según la model card.
- Decodificación especulativa con draft model complementario, orientada a reducir latencia en GPU.
- Cuantización INT8 para inferencia eficiente en hardware Intel mediante OpenVINO GenAI.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistencia visual en aplicaciones de escritorio Intel: el modelo puede recibir capturas de pantalla o imágenes y generar descripciones o respuestas conversacionales, ejecutándose en GPU integrada gracias a la cuantización INT8 y al peso reducido de 1,6 GB.
- Procesamiento de documentos escaneados en local: al ser un modelo visión-lenguaje compacto, permite extraer y resumir contenido de imágenes de documentos sin enviar datos a la nube, lo que encaja en escenarios con requisitos de privacidad.
- Prototipado rápido de interfaces conversacionales multimodales: con OpenVINO GenAI 2027.0.0.0.dev20261119 y el draft model FP16, se puede montar un pipeline de decodificación especulativa para evaluar latencia y calidad antes de invertir en modelos mayores.
- Despliegue en equipos sin GPU dedicada de altas prestaciones: el formato INT8 y el soporte de OpenVINO permiten ejecutar el modelo en CPU y aceleradores Intel, ampliando el alcance a portátiles y mini-PC.
- Evaluación comparativa de decodificación especulativa: el par target INT8 + draft FP16 sirve para medir la tasa de aceptación de tokens y el speedup en distintos prompts, un caso de uso directamente alineado con lo documentado en la model card.
- Filtrado y clasificación de imágenes en pipelines de datos: el modelo puede generar etiquetas o descripciones cortas para catalogar imágenes, aunque conviene validar la calidad porque la inferencia de imagen no fue verificada en esta exportación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card solo indica que se observó generación de texto y aceptación de tokens del draft en GPU, que la velocidad varía según el prompt y que la salida greedy no siempre es idéntica a la decodificación solo del target. No se proporcionan cifras de throughput, latencia ni métricas de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio INT8 ocupa 1,6 GB, por lo que el peso de los pesos en memoria es del orden de esa cifra, más el draft model FP16 y la caché KV en f16.
- GPU recomendadas: la model card menciona ejecución en GPU con OpenVINO, sin especificar modelos concretos; no se detallan A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamano del modelo y la cuantización INT8, pero no hay confirmación explícita en la información disponible.
- Opciones de despliegue: OpenVINO GenAI 2027.0.0.0.dev20261119 (versión de desarrollo concreta citada en la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se indica cualitativamente que la velocidad varía según el prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-1B-int8-ov (este) | ~1B | No disponible | OpenVINO IR INT8 | Apache 2.0 | Hugging Face (blaj) |
| openbmb/MiniCPM-V-4.7-1B | ~1B | No disponible | No disponible en la información | Apache 2.0 (según modelo base) | Hugging Face (OpenBMB) |
| MiniCPM-V-4.7-1B-DSpark-fp16-ov | ~1B (draft) | No disponible | OpenVINO IR FP16 | Apache 2.0 (según modelo base) | Hugging Face (blaj) |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos de otros autores en la información proporcionada, por lo que no es posible establecer una comparativa de rendimiento rigurosa.

## Limitaciones y advertencias

- La inferencia de imagen no fue verificada en esta exportación; el pipeline declarado es image-text-to-text, pero la validación documentada se limita a generación de texto.
- La salida greedy no siempre es idéntica a la decodificación solo del target, lo que introduce variabilidad respecto al modelo original.
- El exportador estándar de drafts no consumió los tensores de la cabeza de confianza del checkpoint; el companion exportado es la cabeza de Markov, lo que puede degradar el comportamiento de la decodificación especulativa previsto por el autor original.
- La versión de OpenVINO GenAI citada es una build de desarrollo (2027.0.0.0.dev20261119), no una release estable; la reproducibilidad a largo plazo no está garantizada.
- No hay información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas específicas en la documentación disponible.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda consultar la model card del modelo base de OpenBMB para condiciones adicionales de atribución.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- [blaj/MiniCPM-V-4.7-1B-int8-ov en Hugging Face](https://huggingface.co/blaj/MiniCPM-V-4.7-1B-int8-ov)
- [Modelo base: openbmb/MiniCPM-V-4.7-1B](https://huggingface.co/openbmb/MiniCPM-V-4.7-1B/tree/ad9bf379feb71204c888b22923d63322452407f9)
- [Draft model: blaj/MiniCPM-V-4.7-1B-DSpark-fp16-ov](https://huggingface.co/blaj/MiniCPM-V-4.7-1B-DSpark-fp16-ov)
