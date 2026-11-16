# keptn/nemotron-3.5-bolt-74b-a9b-w4a8

## Resumen

Nemotron 3.5 Bolt 74B-A9B W4A8 es una cuantización de un modelo multimodal de NVIDIA (familia Nemotron 3.5, variante Bolt) realizada por el usuario keptn para el motor de inferencia radiance sobre GPUs AMD RDNA4. El modelo original es un transformer de mezcla de expertos (MoE) con 74 mil millones de parámetros totales y 9 mil millones activos por token, con torre de visión RADIO y capacidad de entrada texto-imagen. Esta versión empaqueta los pesos en un único fichero de 43,10 GiB con expertos en 4 bits y el resto de capas lineales en entero de 8 bits, lo que permite ejecutarlo en una o dos tarjetas de 32 GB.

La relevancia de esta ficha es doble: por un lado documenta un modelo de gran tamaño con ventana de contexto de 262.144 tokens y decodificación especulativa mediante el drafter LiLiCorr de NVIDIA; por otro, es uno de los pocos artefactos publicados que apuntan explícitamente al ecosistema AMD ROCm/RDNA4 (probado en Radeon AI PRO R9700), un nicho con escasa oferta de pesos optimizados. El repositorio tiene 101 descargas y 1 like en el momento de la consulta, y la versión 1.1 se publicó el 16 de noviembre de 2026.

La licencia es openmdw-1.1 (etiquetada como "other" en Hugging Face), heredada del modelo base de NVIDIA. No se dispone de información sobre idiomas soportados en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), con torre de visión RADIO y drafter LiLiCorr para decodificación especulativa |
| Parametros totales | 74 mil millones (74B) |
| Parametros activos | 9 mil millones (9B) por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | W4A8: expertos en 4 bits (escala por cada 64 pesos, redondeo al más cercano), resto de capas lineales en entero de 8 bits (escala por cada 128 pesos); backbone del drafter rotado a entero de 8 bits; torre de visión RADIO sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (etiqueta `license: other` en Hugging Face) |
| Formato de pesos | `.rad` (formato propietario del motor radiance), fichero único de 43,10 GiB |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 74B parámetros totales y 9B activos, lo que sitúa su coste computacional por token en el rango de un modelo denso de ~9B pese a su tamaño total. Incorpora una torre de visión RADIO que habilita la entrada de imágenes (pipeline `image-text-to-text`) y un drafter LiLiCorr de NVIDIA entrenado sobre bloques de 8 tokens, que en esta conversión se explota con 7 tokens de borrador por paso de decodificación especulativa.

El proceso de cuantización documentado por el autor es el siguiente: se descargó el checkpoint BF16 (`nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16`, revisión `e09a4ced`) y el drafter (`nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr`, revisión `449d2414`); se convirtieron ambos con la receta `nemotron-3.5-bolt-74b-a9b-w4a8.recipe`. Los expertos enrutados se cuantizaron a 4 bits con la tabla `w4nl64` (una escala por cada 64 pesos) mediante redondeo al más cercano, **sin datos de calibración** (el directorio `CALIB` estaba vacío). Las demás capas lineales se llevaron a entero de 8 bits con una escala por cada 128 pesos, optimizando el error mínimo. La torre de visión se conserva tal cual viene en el checkpoint. No se documentan en la información disponible los datos de entrenamiento originales (número de tokens, composición del dataset, RLHF/DPO) del modelo base de NVIDIA.

## Capacidades

- Generación de texto y razonamiento con un modo "thinking" desactivable por petición (`enable_thinking` en la plantilla de chat); desactivado por defecto en la configuración recomendada.
- Entrada multimodal texto-imagen mediante la torre de visión RADIO (pipeline declarado `image-text-to-text`).
- Decodificación especulativa con el drafter LiLiCorr de NVIDIA, configurable a 7 tokens de borrador.
- Ventana de contexto muy larga: hasta 262.144 tokens, con pooling de KV compartido entre secuencias.
- Capacidad MoE con 74B parámetros totales y 9B activos, lo que reduce el coste por token frente a un denso equivalente.
- Muestreo recomendado por NVIDIA: temperatura 1,0 y top_p 0,95.
- Soporte de audio y vídeo: la model card indica que "images, audio and video are not measured yet", por lo que su funcionamiento no está verificado en esta conversión.
- Soporte de tool calling / function calling y de agentes multi-paso: no disponible en la información proporcionada.

## Casos de uso

- **Atención al cliente con contexto largo**: la ventana de 262.144 tokens permite mantener conversaciones multi-turno con historiales extensos, documentación de producto o transcripciones completas sin truncar; el modo thinking desactivado reduce latencia en respuestas rutinarias.
- **Análisis de documentos extensos**: contratos, informes técnicos o expedientes de cientos de páginas caben en una sola ventana, evitando pipelines de recuperación fragmentada cuando se necesita razonamiento global sobre el documento.
- **Procesamiento de imágenes con descripción textual**: gracias a la torre RADIO, el modelo puede recibir capturas, diagramas o fotografías junto a instrucciones en texto para tareas de documentación técnica, accesibilidad o extracción de información visual.
- **Despliegue en hardware AMD de gama profesional**: con una o dos Radeon AI PRO R9700 (32 GB) se obtienen 71,4 tok/s en decodificación con una tarjeta y 211,4 tok/s con dos, lo que lo hace viable en estaciones de trabajo ROCm sin GPUs NVIDIA.
- **Servicio de inferencia con múltiples usuarios**: la configuración de referencia admite hasta 8 secuencias simultáneas con 8192 tokens por lote; con dos tarjetas y `max-model-len: 65536` se obtienen 368 tok/s agregados con 4 flujos.
- **Generación asistida en pipelines de CI/CD o herramientas internas**: el formato `.rad` y el servidor compatible con configuración YAML permiten levantar un endpoint HTTP en un contenedor Docker con acceso a `/dev/kfd` y `/dev/dri`, integrándolo en flujos de trabajo existentes.
- **Investigación sobre cuantización y decodificación especulativa**: el repositorio publica métricas de divergencia KL frente al BF16 original, lo que lo convierte en un caso de estudio útil para evaluar el impacto de W4A8 y del drafter en la calidad de salida.

## Benchmarks y rendimiento

Calidad frente al original BF16 (80 preguntas de MT-Bench, ambos turnos, 41.586 tokens de respuesta, KL sobre tokens de respuesta, versión 1.1 en dos tarjetas con KV en bf16):

| Modelo | KL media | KL percentil 99 | Token top idéntico | Ratio de perplejidad |
|---|---|---|---|---|
| Este fichero (v1.1) | 0,00399 | 0,0479 | 98,1% | ×1,000 |
| Este repo, versión 1.0 | 0,00503 | 0,0602 | 97,9% | ×1,000 |
| keptn/nemotron-3.5-bolt-74b-a9b-iq8r | 0,00122 | 0,0163 | 99,0% | ×1,000 |
| keptn/nemotron-3.5-bolt-74b-iq2-nvidia | 0,0416 | 0,468 | 94,2% | ×1,017 |

Velocidad (Radeon AI PRO R9700 a 300 W, radiance 2.1.0 con PR #389, KV en bf16, 7 tokens de borrador, thinking desactivado, BetterBench 0.6.1, temperatura 0,7, mediana en tok/s):

| Métrica | 1 tarjeta | 2 tarjetas |
|---|---|---|
| Decodificación, un flujo | 71,4 | 211,4 |
| Prefill a 24k tokens | 2.158 | 5.485 |
| 4 flujos, total | 60 | 368 |

Con una tarjeta parte de los expertos residen en memoria del host (`placement: expert_tiered`, `host-pool-mib: 40960`), y en ese caso 4 flujos rinden menos en total que un único flujo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM**: el fichero de pesos ocupa 43,10 GiB; se necesita una o dos tarjetas de 32 GB. Con una tarjeta, parte de los expertos se descargan a memoria del host (40.960 MiB de pool configurados).
- **GPUs recomendadas**: Radeon AI PRO R9700 (probada por el autor); cualquier GPU AMD RDNA4 con soporte ROCm y 32 GB. No hay datos de funcionamiento en GPUs NVIDIA para este formato `.rad`.
- **Consumer GPU**: no cabe en GPUs de consumo de 24 GB o menos; requiere tarjetas de 32 GB, lo que excluye la mayoría de modelos consumer actuales.
- **Despliegue**: exclusivamente mediante el motor radiance (versión 2.1.0 con el PR #389, aún no incluido en una release), ejecutado en contenedor Docker con acceso a `/dev/kfd` y `/dev/dri`. No compatible con vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario `.rad`.
- **Contexto y memoria KV**: con `max-model-len: 262144` y KV en bf16, el pool da 524.288 tokens con 2 secuencias y 730.112 con 4 en una tarjeta; en dos tarjetas, 462.848 con 2 secuencias y 376.320 con 4 (8 secuencias no caben junto a los expertos).
- **Latencia y throughput**: ver tabla de velocidad en la sección anterior; 71,4 tok/s con una tarjeta y 211,4 tok/s con dos en decodificación de un flujo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| keptn/nemotron-3.5-bolt-74b-a9b-w4a8 (este) | 74B totales / 9B activos | 262.144 | `.rad` (W4A8) | openmdw-1.1 | AMD RDNA4, radiance |
| keptn/nemotron-3.5-bolt-74b-a9b-iq8r | 74B totales / 9B activos | no disponible | no disponible | no disponible | no disponible |
| keptn/nemotron-3.5-bolt-74b-iq2-nvidia | 74B totales / 9B activos | no disponible | no disponible | no disponible | no disponible |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16 | 74B totales / 9B activos | 262.144 (heredado) | safetensors BF16 | openmdw-1.1 | GPUs NVIDIA |

Las tres variantes cuantizadas del mismo modelo base permiten comparar compromisos de calidad y tamaño: `iq8r` logra una KL media de 0,00122 (mejor fidelidad que este W4A8, 0,00399), mientras que `iq2-nvidia` degrada hasta 0,0416 con un ratio de perplejidad de ×1,017. No se dispone de datos de benchmarks estándar ni de comparativas con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- **Sin calibración en la cuantización**: el directorio `CALIB` estaba vacío, por lo que los expertos en 4 bits se obtuvieron por redondeo al más cercano sin datos de calibración; esto puede explicar la mayor divergencia KL frente a la variante `iq8r`.
- **Formato y motor propietarios**: el fichero `.rad` solo funciona con radiance, y la versión requerida (2.1.0 con PR #389) no está en ninguna release; hay que compilar la imagen desde el PR, lo que añade riesgo de estabilidad.
- **Ecosistema limitado a AMD**: no hay soporte documentado en NVIDIA, vLLM, llama.cpp u Ollama, lo que restringe su uso a infraestructura ROCm/RDNA4.
- **Riesgo de alucinación**: no se han publicado evaluaciones de veracidad ni de sesgos en la información disponible; como todo modelo generativo, puede producir afirmaciones incorrectas con aparente seguridad.
- **Idiomas no documentados**: los metadatos no indican qué idiomas soporta el modelo; no se puede asumir un rendimiento multilingüe sin verificación.
- **Modalidades no verificadas**: la model card indica explícitamente que imágenes, audio y vídeo "no se han medido aún"; la torre de visión está presente pero su comportamiento en esta conversión no está validado.
- **Licencia openmdw-1.1**: es una licencia de NVIDIA etiquetada como "other"; conviene revisar el fichero `LICENSE` antes de un uso comercial, ya que las condiciones no son las de una licencia OSI estándar.
- **Escalado con una tarjeta**: con `expert_tiered` y expertos en memoria del host, el rendimiento agregado con 4 flujos (60 tok/s) es inferior al de un solo flujo (71,4 tok/s), lo que desaconseja ese modo para cargas concurrentes.
- **Madurez**: 101 descargas y 1 like; es un artefacto reciente (creado el 31 de octubre de 2026) sin validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keptn/nemotron-3.5-bolt-74b-a9b-w4a8
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Drafter LiLiCorr: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr
- Variante IQ8R: https://huggingface.co/keptn/nemotron-3.5-bolt-74b-a9b-iq8r
- Variante IQ2: https://huggingface.co/keptn/nemotron-3.5-bolt-74b-iq2-nvidia
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- PR #389 de radiance: https://codeberg.org/StillDeadcode/radiance/pulls/389
