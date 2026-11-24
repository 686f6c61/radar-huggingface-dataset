# netprojects/Hy-MT3-7B-MLX-6bit

## Resumen

Hy-MT3-7B-MLX-6bit es una conversión al framework MLX del modelo de traducción multilingüe tencent/Hy-MT3-7B, publicada por NetProjects (Internet Projects Ltd) para su ejecución en Apple Silicon. El modelo base, desarrollado por Tencent y liberado el 24 de noviembre de 2026, es un transformer denso de 32 capas y aproximadamente 7.500 millones de parámetros, especializado en traducción entre cerca de 100 idiomas y dialectos. Esta variante concreta aplica cuantización afina de 6 bits con grupo de 64 sobre los pesos originales en bf16, reduciendo el repositorio a 6,1 GB.

La relevancia de esta ficha radica en que permite ejecutar un modelo de traducción de gama media en un Mac con memoria unificada de 16 GB o más, sin GPU dedicada. Frente a la versión bf16, la cuantización de 6 bits conserva el 100 % de las decisiones de siguiente token en las pruebas realizadas por el autor de la conversión, lo que la convierte en la variante recomendada dentro de la familia de builds MLX publicada por NetProjects (junto con las versiones de 8 y 4 bits).

El modelo cubre los 33 idiomas de Hy-MT2, cinco lenguas minoritarias y dialectos chinos, y 64 idiomas añadidos como griego, rumano, húngaro y las lenguas nórdicas y bálticas. Tencent reporta, sobre datos reales, un 43 % menos de errores de traducción, un 74 % menos de omisiones o adiciones y un 40 % menos de fallos de seguimiento de instrucciones en comparación con Hy-MT2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, 32 capas (hunyuan_v1_dense) |
| Parametros totales | 7.504.568.320 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | entradas de hasta ~8K tokens; hasta 4.096 tokens nuevos de salida (ajustes recomendados por Tencent) |
| Tipos de cuantizacion | 6 bits afina, grupo de 64 (esta build); la familia incluye también 8 bits y 4 bits |
| Idiomas soportados | ~100 idiomas y dialectos: 33 de Hy-MT2, 5 lenguas minoritarias y dialectos chinos y 64 añadidos (griego, rumano, húngaro, nórdicas, bálticas, etc.) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 6,1 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 32 capas con arquitectura identificada en los metadatos como `hunyuan_v1_dense`, es decir, la familia de modelos de Tencent que sirve de base a su línea Hunyuan. Hy-MT3 se publicó en tres tamaños: 1.8B (orientado a dispositivos), 7B (esta variante, gama media) y 30B-A3B (el modelo insignia con arquitectura MoE). La información disponible no detalla el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron fases de RLHF o DPO; la model card remite al informe técnico (arXiv 2611.27673) para los resultados completos.

La innovación principal de esta build no está en el entrenamiento sino en la conversión: se partió de la revisión `f83bea8` del repositorio de Tencent, se verificó que todos los ficheros coincidían con los hashes SHA-256 del Hub y se convirtió con mlx-lm a cuantización afina de 6 bits con grupo de 64. El autor documenta una comparación token a token contra bf16 sobre 217 posiciones generadas: la build de 6 bits coincide en el 100,0 % de los casos, la de 8 bits en el 99,5 % y la de 4 bits en el 97,7 %. Además, las tres builds superan una prueba de humo de traducción de 10/10 prompts (griego, chino, japonés, alemán, francés, español, árabe y ruso, y desde griego y chino hacia inglés).

## Capacidades

- Traducción multilingüe entre cerca de 100 idiomas y dialectos, incluyendo lenguas minoritarias chinas y lenguas europeas de menor recursos como griego, rumano, húngaro, nórdicas y bálticas.
- Traducción bidireccional: la model card verifica traducciones hacia ocho idiomas y desde griego y chino hacia inglés.
- Seguimiento de instrucciones de formato: la plantilla recomendada exige que la salida contenga solo la traducción, sin explicaciones adicionales.
- Soporte de listas de terminología mediante plantillas de prompt del tipo "`term` translates to `translation`".
- Soporte de estilo requerido y preferencias personales a través del prompt.
- Traducción preservando delimitadores y datos estructurados (JSON, XML).
- Procesamiento de documentos largos: entradas de hasta aproximadamente 8K tokens y hasta 4.096 tokens nuevos de generación.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio ni modo de pensamiento en la información disponible.

## Casos de uso

- Traducción de documentación técnica en local: un desarrollador puede traducir README, guías y comentarios de código a griego, húngaro o rumano desde un MacBook con 16 GB de memoria unificada, sin enviar el contenido a servicios en la nube.
- Localización de productos para mercados europeos de menor tamaño: el modelo cubre idiomas que muchos traductores automáticos no soportan bien (nórdicos, bálticos, rumano, húngaro), con plantillas de terminología para mantener coherencia de marca.
- Traducción de datos estructurados en pipelines: al preservar delimitadores y soportar JSON y XML, puede integrarse en flujos que traducen ficheros de recursos de internacionalización o respuestas de API sin romper el esquema.
- Atención al cliente multilingüe en el dispositivo: con el servidor compatible con OpenAI (`mlx_lm.server`) se puede desplegar un endpoint local que traduzca conversaciones multi-turno en una máquina Apple, útil para prototipos y entornos con requisitos de privacidad.
- Post-edición y control de calidad de traducciones: las plantillas de estilo y preferencias permiten generar variantes con registro formal o informal, o adaptar la salida a una guía de estilo concreta.
- Investigación en traducción automática: al ser una build reproducible con licencia Apache-2.0 y pesos verificados por hash, sirve como base para experimentos de cuantización, evaluación de idiomas de bajos recursos o comparación con el modelo bf16 original.
- Traducción de correspondencia y documentos personales en un portátil: el requisito de 16 GB de memoria y el tamaño de 6,1 GB permiten ejecutarlo junto con otras aplicaciones en equipos de gama alta de Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversión solo aporta métricas de fidelidad de la cuantización y de la prueba de humo, no puntuaciones de MMLU, BLEU, COMET ni similares. Los datos comparativos con Hy-MT2 (43 % menos errores de traducción, 74 % menos omisiones o adiciones, 40 % menos fallos de instrucciones) son afirmaciones de Tencent recogidas en la model card, sin cifras absolutas ni detalle del conjunto de evaluación.

| Metrica de la conversion | 6-bit | 8-bit | 4-bit | bf16 |
|---|---|---|---|---|
| Coincidencia de siguiente token con bf16 (217 posiciones) | 100,0 % | 99,5 % | 97,7 % | referencia |
| Prueba de humo de traduccion (10 prompts) | 10/10 | 10/10 | 10/10 | 10/10 |
| Tamano del repositorio | 6,1 GB | 8,0 GB | 4,2 GB | no disponible |

## Requisitos de hardware

- Memoria recomendada: 16 GB o más de memoria unificada en Mac (el autor calcula el mínimo como el límite de GPU por defecto que alberga el pico observado más 2 GB; los documentos largos necesitan más).
- Hardware de referencia de las pruebas: MacBook Pro con chip M5 Max y 128 GB de memoria unificada.
- GPU dedicadas: no aplica; la build está pensada para Apple Silicon mediante MLX, no para CUDA.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con 16 GB o más; no está orientada a GPUs NVIDIA.
- Despliegue: mlx-lm (versión 0.32.2 o superior), con CLI `mlx_lm.generate` y servidor compatible con OpenAI mediante `mlx_lm.server`.
- Latencia y throughput: no disponibles en la información proporcionada.
- Parámetros de generación recomendados por Tencent: temperatura 0,7, top_p 0,6, top_k 20, penalización de repetición 1,05, hasta 4.096 tokens nuevos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| netprojects/Hy-MT3-7B-MLX-6bit | 7,5B | entradas ~8K, salida 4.096 | safetensors MLX, 6,1 GB | Apache-2.0 | Esta ficha; 100 % de coincidencia con bf16 |
| netprojects/Hy-MT3-7B-MLX-8bit | 7,5B | entradas ~8K, salida 4.096 | safetensors MLX, 8,0 GB | Apache-2.0 | 99,5 % de coincidencia con bf16 |
| netprojects/Hy-MT3-7B-MLX-4bit | 7,5B | entradas ~8K, salida 4.096 | safetensors MLX, 4,2 GB | Apache-2.0 | 97,7 % de coincidencia con bf16 |
| tencent/Hy-MT3-7B | 7,5B | entradas ~8K, salida 4.096 | safetensors bf16 | Apache-2.0 | Modelo base original de Tencent |
| Hy-MT3-1.8B | 1,8B | no disponible | no disponible | Apache-2.0 | Variante orientada a dispositivos |
| Hy-MT3-30B-A3B | 30B (MoE) | no disponible | no disponible | Apache-2.0 | Modelo insignia de la familia |

## Limitaciones y advertencias

- Es una build de cuantización: aunque la coincidencia con bf16 es del 100 % en la muestra de 217 posiciones, no garantiza un comportamiento idéntico en todos los textos ni en generaciones largas.
- El modelo está especializado en traducción; no se documentan capacidades generales de razonamiento, código o matemáticas, por lo que no debe emplearse como modelo de propósito general.
- No hay información sobre sesgos por idioma o cultura; al cubrir cerca de 100 idiomas, es esperable un rendimiento desigual entre lenguas de altos y bajos recursos, pero no se aportan datos.
- Riesgo de alucinación y de omisiones o adiciones en textos largos: Tencent reporta mejoras frente a Hy-MT2, pero no se publican tasas absolutas de error.
- Restricción de plataforma: requiere Apple Silicon y MLX; no es ejecutable en GPUs NVIDIA ni en CPU x86 sin conversión adicional.
- Límite práctico de contexto: entradas de aproximadamente 8K tokens y hasta 4.096 tokens nuevos de salida; documentos más largos requieren troceado.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar el fichero LICENSE.txt de Tencent y citar su trabajo según la model card original.
- NetProjects no está afiliado a Tencent; la responsabilidad sobre el comportamiento del modelo base recae en el autor original.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Hy-MT3-7B-MLX-6bit
- Modelo base original: https://huggingface.co/tencent/Hy-MT3-7B
- Build de 8 bits: https://huggingface.co/netprojects/Hy-MT3-7B-MLX-8bit
- Build de 4 bits: https://huggingface.co/netprojects/Hy-MT3-7B-MLX-4bit
- Informe técnico de Tencent: arXiv 2611.27673
- Perfil del autor de la conversión: https://huggingface.co/netprojects
- Sitio web de NetProjects: https://netprojects.com
