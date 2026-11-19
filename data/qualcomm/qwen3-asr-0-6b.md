# qualcomm/Qwen3-ASR-0.6B

## Resumen

Qwen3-ASR-0.6B es un modelo de reconocimiento automático del habla (ASR) desarrollado por el equipo Qwen y distribuido en este repositorio por Qualcomm en una versión preexportada y optimizada para dispositivos con chipsets Snapdragon y Dragonwing. El modelo se construye sobre la capacidad de comprensión de audio de Qwen3-Omni y está diseñado para realizar identificación de idioma y transcripción en 30 idiomas y 22 dialectos chinos, manteniéndose robusto ante audio con ruido, voz cantada y canciones con música de fondo.

La variante de 0,6B de parámetros sacrifica una pequeña cantidad de precisión frente a versiones mayores a cambio de un rendimiento (throughput) mucho más alto, lo que la hace adecuada para inferencia en el propio dispositivo (on-device). Qualcomm publica artefactos ya exportados en formato GGUF con cuantización q8_0 para ejecutarse mediante el runtime GENIEX_LLAMACPP, además de la librería Qualcomm AI Hub Models para reexportar el modelo con configuraciones personalizadas.

El modelo resulta relevante en el contexto actual de despliegue de IA en el borde (edge AI): permite transcripción multilingüe local sin depender de la nube, con latencias medidas en tokens por segundo sobre hardware móvil y de PC con Snapdragon. La licencia Apache 2.0 facilita su integración comercial, aunque la información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks de calidad es limitada en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de reconocimiento de voz basado en la comprensión de audio de Qwen3-Omni) |
| Parametros totales | 0,6B (según nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 4096 tokens en las mediciones publicadas (también evaluado con 512) |
| Tipos de cuantizacion | q8_0 (GGUF); exportación personalizada disponible vía Qualcomm AI Hub Models |
| Idiomas soportados | 30 idiomas y 22 dialectos chinos (identificación de idioma y transcripción) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (runtime GENIEX_LLAMACPP); exportación con la librería Qualcomm AI Hub Models |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo más allá de indicar que se basa en la comprensión de audio de Qwen3-Omni y que se trata de un modelo de tipo LLM/generative_ai con pipeline de reconocimiento automático del habla. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica destacable desde el punto de vista de este repositorio es la optimización para hardware Qualcomm: el modelo se compila y perfila mediante Qualcomm AI Hub Workbench y se distribuye como artefacto GGUF q8_0 ejecutable con GENIEX_LLAMACPP. La model card menciona que la versión 0,6B prioriza el throughput sobre la precisión, lo que sugiere un diseño orientado a latencia baja en dispositivos móviles y de PC. No se dispone de más detalles sobre mecanismos de atención, decodificación especulativa u otras optimizaciones internas.

## Capacidades

- Reconocimiento automático del habla (transcripción) en 30 idiomas y 22 dialectos chinos.
- Identificación de idioma (language identification) integrada en el pipeline de transcripción.
- Robustez ante audio con ruido, voz cantada y canciones con música de fondo, según la model card.
- Capacidad de comprensión de audio heredada de Qwen3-Omni.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.
- No se documenta capacidad de visión ni de audio más allá de la propia tarea ASR.
- Capacidades multilingües limitadas a los 30 idiomas y 22 dialectos chinos indicados; no se detalla la lista concreta.

## Casos de uso

- Transcripción en tiempo real en dispositivos móviles: el modelo se ejecuta con GENIEX_LLAMACPP sobre Snapdragon 8 Elite Gen 5 alcanzando entre 56 y 74 tokens por segundo con contexto de 512, lo que permite subtitulado o dictado local sin conexión.
- Asistentes de voz embebidos: la identificación de idioma integrada permite que una app detecte automáticamente el idioma del usuario y transcriba sin selección manual, útil en aplicaciones multilingües.
- Transcripción de reuniones y notas de voz en PC con Snapdragon X Elite o X2 Elite: con contexto de 4096 tokens y throughput de 13 a 50 tokens por segundo según el chipset, se pueden procesar fragmentos largos de audio de forma local.
- Subtitulado de contenido musical y podcasts: la robustez declarada ante voz cantada y música de fondo lo hace adecuado para generar subtítulos de canciones y programas con ruido ambiental.
- Procesamiento en el borde para privacidad: al ejecutarse on-device, el audio no sale del dispositivo, lo que encaja en aplicaciones sanitarias, legales o corporativas con requisitos de confidencialidad.
- Integración en dispositivos industriales y IoT con Qualcomm Dragonwing IQ-8275 o IQ-9075: aunque el throughput es menor (desde 2,5 tokens por segundo en contexto de 4096), permite transcripción local en equipos de campo sin conectividad.
- Preprocesado de audio para pipelines de datos: la transcripción multilingüe puede alimentar sistemas de indexación o búsqueda sobre archivos de audio en 30 idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (WER, MMLU, etc.) en la información disponible. La model card únicamente proporciona métricas de throughput (tokens por segundo) por chipset y longitud de contexto con cuantización q8_0 y runtime GENIEX_LLAMACPP:

| Chipset | Contexto | Throughput (tokens/s) |
|---|---|---|
| Snapdragon 8 Elite Gen 5 for Galaxy | 512 | 67,0 – 74,7 |
| Snapdragon 8 Elite Gen 5 for Galaxy | 4096 | 14,6 – 36,0 |
| Snapdragon 8 Elite for Galaxy | 512 | 56,6 – 68,1 |
| Snapdragon 8 Elite for Galaxy | 4096 | 11,6 – 29,3 |
| Snapdragon X2 Elite | 512 | 77,5 – 108,6 |
| Snapdragon X2 Elite | 4096 | 35,7 – 50,0 |
| Snapdragon X Elite | 512 | 22,6 – 38,0 |
| Snapdragon X Elite | 4096 | 13,3 – 21,6 |
| Dragonwing IQ-8275 | 512 | 6,6 – 33,4 |
| Dragonwing IQ-8275 | 4096 | 2,6 – 15,3 |
| Dragonwing IQ-9075 | 512 | 26,8 – 56,1 |

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos ASR comparables (por ejemplo, Whisper u otros modelos de la familia Qwen3-ASR) con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La versión 0,6B sacrifica precisión frente a variantes mayores del mismo modelo, según reconoce la propia model card; no se cuantifica esa pérdida.
- No se publican métricas de calidad (tasa de error de palabra) ni detalles sobre sesgos, por lo que no es posible evaluar su comportamiento en dominios sensibles.
- El modelo está optimizado y preexportado para hardware Qualcomm; su uso en GPU convencionales (NVIDIA, AMD) no está documentado en este repositorio.
- El contexto máximo medido es de 4096 tokens; audios más largos requerirán segmentación.
- La lista concreta de los 30 idiomas y 22 dialectos no se detalla en la información disponible, lo que dificulta verificar la cobertura para un idioma específico.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones de los artefactos GGUF enlazados desde el repositorio de Unsloth, que se distribuyen por separado.
- No se documentan capacidades de tool calling ni de agentes; no debe asumirse su disponibilidad en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/qualcomm/Qwen3-ASR-0.6B
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Artefacto GGUF q8_0: https://huggingface.co/unslothai/Qwen3-ASR-0.6B-GGUF/resolve/main/Qwen3-ASR-0.6B-Q8_0.gguf
- Página en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_asr_0_6b
- Librería Qualcomm AI Hub Models (GitHub): https://github.com/qualcomm/ai-hub-models/blob/v0.67.0/src/qai_hub_models/models/qwen3_asr_0_6b
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Quickstart de GenieX: https://geniex.aihub.qualcomm.com/en/get-started/quickstart
- Paper de referencia (arXiv): https://arxiv.org/abs/2601.21337
