# kataguru/Apodex-1.1-mini-Finnish-GGUF

## Resumen

Apodex-1.1-mini-Finnish-GGUF es una cuantización en formato GGUF del modelo Apodex-1.1-mini, publicada por el usuario kataguru, orientada al uso en finés con soporte de inglés. Se trata de un modelo de arquitectura MoE (mezcla de expertos) de tipo transformer híbrido con 35.505.251.456 parámetros totales (unos 35,5 mil millones) y aproximadamente 3 mil millones de parámetros activos por token, activando 8 de 256 expertos. La model card del autor lo describe como un modelo de 36B MoE con ventana de contexto de 262.144 tokens, capacidades nativas de visión y OCR, y modos de razonamiento autónomo integrados.

El modelo deriva de la base apodex/Apodex-1.1-mini y lleva la etiqueta de arquitectura qwen3_5_moe, lo que lo sitúa en la familia de MoE de la serie Qwen 3.5. Su rasgo diferencial es la inclusión de una plantilla de chat en finés embebida directamente en los metadatos del GGUF, de modo que no requiere configuración externa para conversar correctamente en ese idioma. Incorpora además un proyector multimodal independiente (mmproj en BF16) que habilita el análisis de imágenes y el reconocimiento de texto en finés.

Su relevancia actual radica en dos factores: la eficiencia de inferencia derivada de la activación dispersa de expertos, que permite velocidades de decodificación de 250 a 265 tokens por segundo en una GPU de consumo, y la combinación de contexto largo, visión y razonamiento en un único artefacto desplegable con llama.cpp o LM Studio. El repositorio, de 113,7 GB, no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer híbrida (linear attention GDN + full attention), etiquetada como qwen3_5_moe |
| Parametros totales | 35.505.251.456 (aprox. 35,5 B) |
| Parametros activos | Aprox. 3 B por token, 8 de 256 expertos |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF: Q3_K_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K; proyector de visión mmproj en BF16 |
| Idiomas soportados | Finés (fi), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector multimodal GGUF BF16 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo mezcla de expertos con 40 capas, de las cuales 30 emplean linear attention (denominada GDN en la model card) y 10 emplean full attention. Esta combinación busca reducir el coste computacional del procesamiento de secuencias largas manteniendo la estabilidad del contexto extendido, que llega hasta los 262.144 tokens. El enrutamiento activa 8 expertos de un total de 256 por token, lo que explica que, pese a contar con unos 35,5 B de parámetros totales, el coste de decodificación se aproxime al de un modelo de 3 B.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco especifica qué partes del modelo base fueron entrenadas o ajustadas para el finés. La innovación declarada por el autor es doble: por un lado, una plantilla de chat en finés integrada en los metadatos del GGUF, que evita errores de formato al usar herramientas como LM Studio; por otro, un esquema de razonamiento con modos seleccionables, que activa de forma autónoma un bloque `<think>...</think>` ante consultas matemáticas, lógicas o de arquitectura de sistemas, o bien recurre a modos especializados como `{REASON:spoon}` (un panel simulado de expertos en 6 fases) y `{REASON:einstein}` (ideación creativa desde 10 a 20 perspectivas), con `{REASON:none}` para saltar el razonamiento y minimizar la latencia.

## Capacidades

- Generación de texto en finés e inglés, con especial énfasis en prosa idiomática, texto técnico y redacción jurídica y contractual.
- Razonamiento multi-paso con modo de pensamiento activable, incluyendo bloques `<think>` y modos de razonamiento especializados (`spoon`, `einstein`, `none`, `auto`).
- Resolución de problemas matemáticos y de lógica, como el cálculo de probabilidad sin reemplazo que la model card documenta con resultado exacto.
- Análisis de imágenes y OCR nativo en finés mediante el proyector `mmproj-Apodex-1.1-mini-Finnish-BF16.gguf`, incluyendo interpretación de diagramas y lectura de texto en imágenes.
- Análisis técnico en dominios de sistemas: la model card cita como ejemplo el análisis de arquitectura eBPF y filtrado XDP en el núcleo Linux.
- Conversación multiturno con contexto largo, útil para analizar documentación extensa o bases de código completas.
- Comportamiento de rechazo ante peticiones de ataques informáticos, según la validación cualitativa reportada por el autor.
- No se documenta en la información disponible soporte explícito de tool calling o function calling ni de ejecución de agentes con llamadas a herramientas.

## Casos de uso

- Atención al cliente en finés: el modelo puede mantener conversaciones multiturno con un historial largo gracias a sus 262.144 tokens de contexto, y la plantilla de chat embebida en el GGUF reduce los errores de formato al desplegarlo en LM Studio o llama.cpp sin configuración adicional.
- Revisión y traducción de contratos y licencias: la model card documenta la traducción inversa de cláusulas de licencia de software y de propiedad intelectual del inglés al finés con terminología correcta, lo que permite usarlo como apoyo en revisiones legales asistidas.
- Procesamiento de documentación técnica extensa: con soporte de 262k tokens y velocidades de preprocesado por encima de 6.800 tokens por segundo en RTX 5090, es viable analizar manuales, normativas o bases de código completas en una sola pasada.
- Digitalización y accesibilidad de documentos escaneados en finés: el proyector de visión y OCR permite extraer texto de imágenes y diagramas y generar resúmenes o traducciones al inglés.
- Generación de textos creativos y marketing en finés: los modos de razonamiento creativo (`einstein`) producen múltiples perspectivas e ideación conceptual, aprovechables para campañas o narrativa de marca.
- Tutoría y asistencia educativa en matemáticas y lógica: el modo de pensamiento autónomo genera cadenas de razonamiento visibles que pueden mostrarse al estudiante, con la opción de desactivarlas para respuestas directas de baja latencia.
- Automatizaciones de baja latencia: con `{REASON:none}` y velocidades de decodificación de hasta 263,5 tok/s en una única GPU de consumo, encaja en pipelines de clasificación, extracción o resumen donde el coste por token es crítico.
- Análisis de seguridad y sistemas: la model card reporta análisis estructurado de arquitecturas de red y kernel, útil como asistente en tareas de revisión técnica en finés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados como MMLU, HumanEval o GSM8K en la informacion disponible. Los únicos datos cuantitativos publicados son mediciones de velocidad con `llama-bench` sobre una NVIDIA GeForce RTX 5090 de 32 GB, con backend CUDA y Flash Attention activado.

| Cuantizacion | Tamano de fichero | VRAM requerida | Prompt eval (pp512) | Generacion (tg128) |
|---|---|---|---|---|
| Q3_K_M | 15,98 GiB | Aprox. 16,5 GB | 6.836,6 tok/s | 253,8 tok/s |
| IQ4_XS | 18,05 GiB | Aprox. 18,6 GB | 6.628,3 tok/s | 263,5 tok/s |
| Q4_K_M | 20,21 GiB | Aprox. 21,0 GB | 6.586,3 tok/s | 262,6 tok/s |
| Q5_K_M | 24,10 GiB | Aprox. 25,0 GB | Aprox. 6.400 tok/s | Aprox. 255 tok/s |
| Q6_K | 28,20 GiB | Aprox. 29,5 GB | Aprox. 6.200 tok/s | Aprox. 250 tok/s |
| mmproj BF16 | 861 MiB | Aprox. +0,9 GB | No aplica | No aplica |

La model card incluye además una validación cualitativa con seis áreas de prueba (estética literaria en finés, traducción jurídica, arquitectura eBPF y XDP, probabilidad sin reemplazo, OCR sobre imagen sintetizada en finés y rechazo de peticiones de ataque), pero no reporta métricas numéricas comparables con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 16,5 GB con Q3_K_M y 29,5 GB con Q6_K, más 0,9 GB adicionales si se activa el proyector de visión.
- GPU recomendadas: RTX 5090 (hardware de referencia de las mediciones), RTX 4090 y RTX 3090 para cuantizaciones Q4 y Q5; RTX 4080 y RTX 5080 para Q3_K_M.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en tarjetas de 16 GB o más con cuantizaciones Q3_K_M e IQ4_XS, y en equipos Mac con 16 GB o más de memoria unificada.
- Opciones de despliegue: llama.cpp, LM Studio y cualquier runtime compatible con GGUF; la model card documenta el uso en LM Studio con la ruta `~/.lmstudio/models/kataguru/Apodex-1.1-mini-Finnish-GGUF/`. No se menciona compatibilidad verificada con vLLM, TGI o Ollama.
- Latencia y throughput: en RTX 5090, de 253,8 a 263,5 tokens por segundo en generación y de 6.586 a 6.836 tokens por segundo en preprocesado, con Flash Attention activado.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de benchmarks ni de especificaciones verificadas de modelos comparables que permitan una comparación cuantitativa rigurosa.

| Modelo | Parametros totales | Activos | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| Apodex-1.1-mini-Finnish-GGUF | 35,5 B | Aprox. 3 B | 262.144 | Apache 2.0 | Solo velocidad (llama-bench) |
| apodex/Apodex-1.1-mini (modelo base) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Alternativas de la familia qwen3_5_moe | No disponible | No disponible | No disponible | No disponible | No disponible |

La única referencia directa identificada es el modelo base apodex/Apodex-1.1-mini, del que esta publicacion es una cuantizacion en GGUF con ajuste de idioma finés. Las alternativas del mismo rango de tamano y arquitectura no cuentan con datos verificables en la informacion disponible.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks estandarizados, por lo que no es posible validar de forma independiente el rendimiento frente a otros modelos.
- La evaluacion cualitativa incluida en la model card ha sido realizada por el propio autor, sin protocolos de evaluacion independientes ni conjuntos de prueba publicos.
- El modelo está especializado en finés e inglés; no se documenta soporte fiable de otros idiomas, incluido el castellano.
- Riesgo de alucinación inherente a los modelos generativos, no cuantificado en la informacion disponible y especialmente relevante en los casos de uso jurídico y técnico citados.
- La información sobre el dataset de entrenamiento, el número de tokens y la existencia de fases de RLHF o DPO no está disponible, lo que impide evaluar sesgos conocidos o la composición de los datos.
- La licencia declarada es Apache 2.0, pero el modelo deriva de apodex/Apodex-1.1-mini y la ficha no aclara las condiciones del modelo base; conviene verificar los términos antes de un uso comercial.
- El repositorio ocupa 113,7 GB y no registra descargas ni valoraciones, por lo que no existe validación por parte de la comunidad.
- La compatibilidad de despliegue documentada se limita a llama.cpp y LM Studio; no hay confirmación de funcionamiento en otros servidores de inferencia.
- La fecha de creación del repositorio indicada en los metadatos (2026-09-21) debe contrastarse, ya que puede deberse a un error de registro.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kataguru/Apodex-1.1-mini-Finnish-GGUF
- Modelo base: apodex/Apodex-1.1-mini (referenciado en la model card, sin URL directa en la informacion disponible)
- No se han encontrado en la busqueda web articulos, papers, repositorios ni demos relacionados con este modelo.
