# Qwen/Qwen3-ASR-1.7B

## Resumen

Qwen3-ASR-1.7B es un modelo de reconocimiento automático de voz (ASR) desarrollado por el equipo Qwen de Alibaba, perteneciente a la familia Qwen3-ASR que incluye también la variante Qwen3-ASR-0.6B y el alineador forzado Qwen3-ForcedAligner-0.6B. El modelo soporta identificación de idioma y transcripción de voz en 30 idiomas y 22 dialectos chinos, incluyendo acentos del inglés de múltiples regiones. Está construido sobre la capacidad de comprensión de audio de su modelo base, Qwen3-Omni, y ha sido entrenado con datos de habla a gran escala.

La versión de 1.7B parámetros alcanza un rendimiento de estado del arte entre los modelos ASR de código abierto y resulta competitiva con las APIs comerciales más potentes, según las evaluaciones publicadas. El modelo admite inferencia unificada en streaming y offline con un único modelo, así como la transcripción de audio de larga duración. Además, se distribuye con un kit de inferencia completo que incluye soporte para vLLM, inferencia por lotes, servicio asíncrono y predicción de marcas de tiempo mediante el alineador forzado.

La licencia Apache 2.0 permite uso comercial sin restricciones, y los pesos están disponibles en formato safetensors. El modelo se ha publicado en enero de 2026 y acumula más de 3,8 millones de descargas en HuggingFace, lo que refleja un interés significativo de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen3-Omni (arquitectura de audio no detallada en la documentación) |
| Parametros totales | 1.7 mil millones (1.7B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (soporta transcripción de audio de larga duración; el alineador forzado maneja hasta 5 minutos) |
| Tipos de cuantizacion | no especificado (pesos en safetensors, cuantizable con herramientas estándar como bitsandbytes o GPTQ) |
| Idiomas soportados | 30 idiomas: chino, inglés, cantonés, árabe, alemán, francés, español, portugués, indonesio, italiano, coreano, ruso, tailandés, vietnamita, japonés, turco, hindi, malayo, neerlandés, sueco, danés, finlandés, polaco, checo, filipino, persa, griego, húngaro, macedonio, rumano. 22 dialectos chinos: Anhui, Dongbei, Fujian, Gansu, Guizhou, Hebei, Henan, Hubei, Hunan, Jiangxi, Ningxia, Shandong, Shaanxi, Shanxi, Sichuan, Tianjin, Yunnan, Zhejiang, cantonés (acento de Hong Kong), cantonés (acento de Guangdong), wu, minnan |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la documentación pública, pero se indica que el modelo se apoya en la capacidad de comprensión de audio de Qwen3-Omni, su modelo fundacional. Se trata de un modelo denso de 1.7B parámetros, sin mezcla de expertos. El entrenamiento se realizó con datos de habla a gran escala, aunque no se especifican el número de tokens ni la composición del dataset. No se menciona el uso de RLHF o DPO en el proceso de entrenamiento.

Entre las innovaciones técnicas destacables se encuentra la capacidad de realizar inferencia unificada en streaming y offline con un único modelo, lo que permite transcribir audio en tiempo real o procesar archivos completos sin cambiar de modelo. También se introduce una solución de alineación forzada novedosa con el modelo Qwen3-ForcedAligner-0.6B, que predice marcas de tiempo para unidades arbitrarias en hasta 5 minutos de habla en 11 idiomas, superando en precisión a los modelos de alineación forzada basados en E2E.

## Capacidades

- Reconocimiento de voz en 30 idiomas y 22 dialectos chinos, incluyendo acentos del inglés de múltiples países.
- Identificación automática de idioma (language identification) integrada en el mismo modelo.
- Transcripción de voz, canto y canciones con música de fondo.
- Inferencia en modo streaming (tiempo real) y offline (archivo completo) con un único modelo.
- Transcripción de audio de larga duración sin segmentación manual.
- Alineación forzada con marcas de tiempo mediante el modelo complementario Qwen3-ForcedAligner-0.6B (11 idiomas, hasta 5 minutos de audio).
- No se documenta soporte para tool calling, agentes ni razonamiento multi-paso, ya que es un modelo puramente de ASR.

## Casos de uso

- Transcripción de reuniones y conferencias: el modelo puede procesar grabaciones de reuniones de larga duración en múltiples idiomas, generando transcripciones textuales con marcas de tiempo si se combina con el alineador forzado. Su capacidad de streaming permite además transcribir en vivo durante la reunión.
- Subtitulación automática de vídeo: adecuado para generar subtítulos en 30 idiomas y dialectos, incluyendo contenido con música de fondo o canto, gracias a su robustez en entornos acústicos complejos.
- Asistentes de voz y dictado: su modo streaming permite integrarse en aplicaciones de dictado en tiempo real, con baja latencia y soporte multilingüe, útil para entornos profesionales y de accesibilidad.
- Análisis de llamadas de atención al cliente: las empresas pueden transcribir llamadas telefónicas en varios idiomas para su posterior análisis de sentimiento o extracción de información, aprovechando la identificación automática de idioma.
- Transcripción de podcasts y contenido multimedia: el modelo maneja audio largo y variado, incluyendo voces superpuestas o música de fondo, lo que facilita la generación de notas o resúmenes de episodios.
- Sistemas de archivo y búsqueda de audio: al transcribir grandes volúmenes de audio (archivos históricos, entrevistas, etc.) con alta precisión, se habilita la búsqueda por texto dentro de contenido sonoro.
- Traducción asistida: aunque el modelo no traduce, su salida de texto puede alimentar un LLM para traducción automática, creando un pipeline de subtitulación multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la información disponible. La documentación menciona que Qwen3-ASR-1.7B logra un rendimiento de estado del arte entre los modelos ASR de código abierto y es competitivo con las APIs comerciales más potentes, pero no se proporcionan cifras concretas (WER, CER, etc.). Para la versión 0.6B se indica que alcanza un throughput de 2000 veces en concurrencia de 128, pero no se dan datos específicos para la versión 1.7B.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 1.7B parámetros, los pesos en FP16 ocupan aproximadamente 3,4 GB. Con overhead de activaciones y memoria del runtime, se recomienda al menos 8 GB de VRAM para inferencia básica. Con cuantización a 8 bits o 4 bits, podría funcionar en GPUs con 4-6 GB.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 8 GB de VRAM, como RTX 3060, RTX 4060, RTX 4090, o GPUs de datacenter como A10, A100, H100. Para despliegues de alta concurrencia se recomienda vLLM con GPUs de mayor memoria.
- El modelo cabe en GPUs consumer, especialmente con cuantización.
- Opciones de despliegue: se proporciona el paquete `qwen-asr` con backend transformers y backend vLLM. También se puede usar vLLM directamente para inferencia por lotes y streaming. Se recomienda instalar FlashAttention 2 para reducir uso de memoria y acelerar la inferencia.
- Latencia y throughput: no se proporcionan datos específicos para la versión 1.7B. La versión 0.6B alcanza 2000x throughput a concurrencia 128, lo que sugiere que la 1.7B tendrá un rendimiento inferior pero aún adecuado para la mayoría de aplicaciones.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El modelo compite con APIs comerciales de reconocimiento de voz (como las de Google, Azure o AWS) y con modelos open-source como Whisper, pero no se ofrecen métricas concretas de comparación. Se puede afirmar que, según la documentación, supera a los modelos open-source existentes, pero sin cifras verificables.

## Limitaciones y advertencias

- El modelo está limitado a los 30 idiomas y 22 dialectos listados; no cubre todos los idiomas del mundo.
- Aunque es robusto en entornos acústicos complejos, puede presentar errores de transcripción (alucinaciones) en audio de muy baja calidad o con ruido extremo.
- No se documentan sesgos específicos, pero como todo modelo entrenado con datos, puede reflejar sesgos presentes en los datos de habla.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar los términos de la licencia para el uso de los modelos complementarios.
- Para producción, es necesario considerar la latencia en modo streaming y los requisitos de memoria según el volumen de peticiones. Se recomienda usar vLLM para despliegues escalables.
- El modelo no realiza traducción ni generación de texto; es exclusivamente de reconocimiento de voz.

## Enlaces

- HuggingFace: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio GitHub: https://github.com/QwenLM/Qwen3-ASR
- Paper (arXiv): https://arxiv.org/abs/2601.21337
- ModelScope (descarga alternativa): https://modelscope.cn/models/Qwen/Qwen3-ASR-1.7B
