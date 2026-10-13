# nativ-community/LFM2.5-24B-A2B-Preview-5bit

## Resumen

LFM2.5-24B-A2B-Preview-5bit es una conversión a formato MLX del modelo LFM2.5-24B-A2B-Preview, publicada por la organización nativ-community (idéntica a la publicada por mlx-community). El modelo original lo desarrolla Liquid AI, Inc. y sigue una arquitectura de mezcla de expertos (MoE) con un total de 23.971.587.712 parámetros (aproximadamente 24B). Esta versión concreta no es un modelo nuevo: es una cuantización afín de solo pesos a 5 bits con tamaño de grupo 64, generada con la CLI de MLX-VLM sobre un Apple M3 Ultra y fijada a la revisión `f772950ce6f17d35af5469d00334b61a9c2fc034` del repositorio original.

Su relevancia es práctica: permite ejecutar un modelo MoE de ~24B con una ventana de contexto de 131.072 tokens en hardware Apple Silicon, reduciendo los pesos a 16,48 GB (frente a los ~48 GB que ocuparían en BF16). El precio es que el resultado queda atado al ecosistema MLX, sin soporte CUDA ni integración directa con vLLM o llama.cpp según la información disponible.

El modelo es de generación de texto, aunque el repositorio se etiqueta también con `mlx-vlm` por la herramienta de conversión empleada. Genera razonamiento antes de la respuesta final, por lo que requiere presupuestar suficientes tokens de salida. La licencia aplicable es la LFM Open License v1.0 del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), tag `lfm2_moe`; detalles de capas no disponibles |
| Parametros totales | 23.971.587.712 (23,97B) |
| Parametros activos | no disponible (la nomenclatura "A2B" sugiere ~2B activos, sin confirmar en la informacion) |
| Longitud de contexto | 131.072 tokens (segun la configuracion del modelo origen) |
| Tipos de cuantizacion | Afin de solo pesos a 5 bits, tamano de grupo 64; proyecciones de router a 8 bits afines (grupo 64); pesos sin cuantizar en BF16; sesgos de routing de expertos en FP32 |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it (10 idiomas) |
| Licencia | LFM Open License v1.0 (`license: other`, `license_name: lfm1.0`) |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`), 16,48 GB decimales |
| Tamano del repositorio | 16,5 GB |
| Modelo base | lq-preview/LFM2.5-24B-A2B-Preview (revision `f772950ce6f17d35af5469d00334b61a9c2fc034`) |
| Pipeline | text-generation |
| Fecha de publicacion | 13 de octubre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible solo confirma que se trata de un modelo de mezcla de expertos (MoE) identificado con el tag `lfm2_moe`, perteneciente a la familia LFM2.5 de Liquid AI. El número total de parámetros es de 23.971.587.712, lo que sitúa el modelo en la categoría de ~24B. La conversión describe explícitamente que las proyecciones del router se cuantizan de forma separada (8 bits afines, grupo 64) mientras que los pesos no cuantizados permanecen en BF16 y los sesgos de routing de expertos en FP32, lo que indica que la arquitectura incorpora un router de expertos con sesgos en precisión completa. No se dispone de información sobre el número de capas, el número de expertos, la dimensión oculta ni la estrategia de activación de expertos.

Respecto al entrenamiento, la información proporcionada no incluye datos sobre número de tokens, composición del dataset, fases de RLHF o DPO, ni innovaciones técnicas del modelo original. Lo único verificable sobre el proceso de esta publicación es la conversión y cuantización: se realizó con `mlx_vlm convert`, tipo `bfloat16`, modo afín, 5 bits, grupo 64, y se recargó con coincidencia estricta de pesos. Las comprobaciones realizadas fueron pruebas de humo (logits finitos en prefill y decodificación con caché, y dos generaciones greedy cortas que devolvieron "Paris" y "391" y alcanzaron EOS), no una evaluación de calidad ni un benchmark de contexto largo.

## Capacidades

- Generación de texto conversacional, con plantilla de chat incluida en el repositorio.
- Generación de razonamiento explícito antes de la respuesta final (modo de razonamiento implícito en la plantilla).
- Soporte multilingüe en 10 idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano, español, portugués e italiano.
- Conversación multiturno con contexto largo, hasta 131.072 tokens.
- Capacidades de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada; el modo de razonamiento previo a la respuesta es compatible con flujos de varios pasos, pero no se documenta soporte de agentes.
- Visión: no disponible. Aunque el repo lleva el tag `mlx-vlm` (por la herramienta de conversión), la model card afirma explícitamente que es un modelo de generación de texto.
- Audio: no disponible.

## Casos de uso

- Asistentes conversacionales de contexto largo en local: la ventana de 131.072 tokens permite cargar documentación extensa o historiales de conversación completos sin truncar, y los 16,48 GB de pesos hacen viable ejecutarlo en un Mac con memoria unificada amplia.
- Procesamiento de documentos técnicos largos en equipos Apple Silicon: resumen, extracción y preguntas sobre informes, contratos o código fuente que superen los 50.000 tokens, aprovechando el contexto extendido y la ausencia de dependencia de GPU dedicada.
- Prototipado offline y con datos sensibles: al ejecutarse íntegramente en local vía MLX, es adecuado para entornos donde no se permite enviar datos a APIs externas (sanidad, legal, defensa).
- Generación de contenido multilingüe: la cobertura de 10 idiomas (incluido español, portugués, árabe y asiáticos) permite redactar y traducir contenido sin cambiar de modelo.
- Desarrollo y revisión de código en local: con 24B totales y un subconjunto activo reducido, puede asistir en explicación de fragmentos, generación de tests y refactorización dentro de un IDE en un Mac de gama alta; no hay datos publicados de rendimiento en HumanEval, por lo que conviene validarlo en el dominio propio.
- Razonamiento asistido con traza: al generar razonamiento antes de la respuesta, es útil para tareas de análisis donde interesa auditar el proceso (cálculo, comparación de alternativas, justificación de decisiones), siempre con suficiente presupuesto de tokens de salida.
- Evaluación comparativa de cuantizaciones: sirve como artefacto para medir la degradación de calidad de una cuantización de 5 bits frente al modelo base en BF16, dentro de un pipeline de validación propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta pruebas de humo: coincidencia estricta de pesos al recargar, logits finitos en prefill y decodificación con caché, y dos comprobaciones de generación greedy que devolvieron "Paris" y "391" y alcanzaron EOS. El autor indica explícitamente que no son una evaluación de calidad ni un benchmark de contexto largo.

## Requisitos de hardware

- Los pesos ocupan 16,48 GB en disco y en memoria; a ello hay que sumar la caché KV y las asignaciones temporales en tiempo de ejecución, por lo que se recomienda un mínimo de 24 GB de memoria unificada y, para contexto largo, 32 GB o más.
- La conversión se generó y probó en un Apple M3 Ultra, con MLX 0.32.3 y Transformers 5.17.0.
- Hardware compatible: exclusivamente Apple Silicon (MLX). No hay soporte publicado para GPU NVIDIA o AMD en esta publicación.
- GPU consumer: sí cabe en equipos Apple con memoria unificada suficiente (M2/M3/M4 Max con 32 GB o más, y M3 Ultra). No aplica a RTX 4090 u otras GPU discretas con esta conversión.
- Opciones de despliegue: MLX-VLM (PR #2505, commit `a6c7313bc053e5887616fa850808d21576eddf98`) mediante `python -m mlx_vlm generate`. No hay artefactos GGUF, vLLM, TGI ni Ollama publicados para esta conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-Preview-5bit (esta ficha) | 23,97B (MoE) | 131.072 tokens | Afin 5 bits, grupo 64 (MLX) | LFM Open License v1.0 | MLX, Apple Silicon |
| LFM2.5-24B-A2B-Preview (modelo base) | 23,97B (MoE) | 131.072 tokens | BF16 sin cuantizar | LFM Open License v1.0 | Pesos originales, framework no disponible en la informacion |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de comparativas publicadas frente a otros modelos MoE de tamano similar en la informacion proporcionada. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluacion de calidad, sesgos o alucinacion para esta conversion; las unicas pruebas documentadas son de humo.
- La cuantizacion a 5 bits introduce degradacion respecto al modelo en BF16, no medida ni cuantificada por el autor.
- El modelo genera razonamiento antes de la respuesta: si se fija un `max_tokens` bajo, la respuesta final puede quedar truncada.
- Dependencia total del ecosistema MLX y de una version concreta de MLX-VLM (commit fijado); cambios de version pueden romper la carga.
- Compatible solo con Apple Silicon. No hay ruta de despliegue en GPU NVIDIA/AMD, servidores x86 sin GPU Apple ni entornos cloud estandar.
- Riesgo de desactualizacion: es una revision fijada de un modelo marcado como "Preview".
- Licencia: LFM Open License v1.0, etiquetada como `other`. Es una licencia propia, no aprobada por la OSI y con condiciones especificas; hay que revisar el texto completo antes de cualquier uso comercial.
- Al tratarse de una conversion de la comunidad (nativ-community / mlx-community), el soporte y el mantenimiento no dependen del desarrollador original.
- No hay informacion sobre sesgos conocidos, limitaciones por idioma dentro de los 10 declarados, ni comportamiento en contextos cercanos a los 131.072 tokens.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nativ-community/LFM2.5-24B-A2B-Preview-5bit
- Copia en mlx-community: https://huggingface.co/mlx-community/LFM2.5-24B-A2B-Preview-5bit
- Modelo base (lq-preview/LFM2.5-24B-A2B-Preview): https://huggingface.co/lq-preview/LFM2.5-24B-A2B-Preview
- MLX-VLM PR #2505 (soporte de LFM2.5): https://github.com/Blaizzy/mlx-vlm/pull/2505
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Licencia LFM Open License v1.0 (incluida en el repositorio como LICENSE): https://huggingface.co/nativ-community/LFM2.5-24B-A2B-Preview-5bit/blob/main/LICENSE
- Aviso de modificaciones de conversion y cuantizacion (NOTICE): https://huggingface.co/nativ-community/LFM2.5-24B-A2B-Preview-5bit/blob/main/NOTICE
- Configuracion de conversion (conversion_info.json): https://huggingface.co/nativ-community/LFM2.5-24B-A2B-Preview-5bit/blob/main/conversion_info.json
- Resultados de la busqueda web: no se encontraron enlaces relevantes sobre este modelo; los resultados devueltos no guardaban relacion con la consulta.
