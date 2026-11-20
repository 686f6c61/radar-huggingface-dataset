# orcarouter/GLM-5.3-Flash-Uncensored-NVFP4

## Resumen

GLM-5.3-Flash-Uncensored-NVFP4 es una versión cuantizada en NVFP4 y sometida a *abliteration* del modelo multimodal GLM-5.3-Flash de Z.ai (zai-org). Lo publica el usuario orcarouter en Hugging Face y combina tres transformaciones sobre el modelo base: cuantización de pesos a 4 bits en formato NVFP4 mediante compressed-tensors, eliminación de los mecanismos de rechazo (*abliteration*) para uso en *red teaming*, y empaquetado para inferencia con vLLM. El resultado es un modelo de 321.323 millones de parámetros totales con arquitectura MoE y pipeline image-text-to-text, es decir, acepta entradas de imagen y texto y genera texto.

La relevancia de esta ficha está en que se trata de un derivado no oficial: el modelo original pertenece a Z.ai, mientras que esta versión modifica tanto la precisión numérica como el comportamiento alineado del modelo. Por tanto, cualquier evaluación de calidad debe hacerse contra el GLM-5.3-Flash original, y cualquier uso en producción debe asumir que las salvaguardas del modelo base han sido deliberadamente eliminadas. La licencia declarada es MIT, heredada del modelo base, aunque el acceso al repositorio está restringido y requiere aceptar condiciones en Hugging Face.

El modelo soporta únicamente inglés y chino según los metadatos, e incluye funcionalidades declaradas de *function calling*, razonamiento y *multi-token prediction* (MTP). Con 2.129 descargas y 114 likes en el momento de la consulta, es un artefacto de nicho orientado a investigadores de seguridad y a equipos que necesitan ejecutar un MoE grande en hardware con soporte FP4.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE transformer multimodal (tag `glm5_next`), con MTP |
| Parámetros totales | 321.323.031.390 (≈321,3 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (FP4, 4 bits) con compressed-tensors; tag `8-bit` en metadatos |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), compatible con vLLM |
| Pipeline | image-text-to-text (visión-lenguaje) |
| Modelo base | zai-org/GLM-5.3-Flash |
| Tamaño del repositorio | 205,1 GB |
| Acceso | restringido (gated), requiere aceptar condiciones |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) de la familia GLM-5, etiquetado como `glm5_next`, con capacidad multimodal de entrada (imagen y texto) y salida de texto. El modelo incorpora *multi-token prediction* (MTP), técnica que añade cabezas auxiliares para predecir varios tokens por paso y que suele emplearse tanto para acelerar la decodificación como para mejorar la señal de entrenamiento. No se dispone de información sobre el número de expertos, el ratio de activación, la dimensión oculta ni el número de capas en la información proporcionada.

Respecto al entrenamiento, esta ficha no puede describir la composición del dataset, el número de tokens ni las etapas de alineación (RLHF/DPO) del modelo original, porque esos datos no están incluidos en la información disponible. Lo que sí es verificable es la cadena de transformaciones aplicadas por el publicador: cuantización a NVFP4 con compressed-tensors y *abliteration*, un procedimiento que típicamente identifica y modifica direcciones en el espacio de activaciones asociadas al rechazo para reducir la probabilidad de respuestas negativas. Esta modificación invalida las garantías de alineación del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento explícito (tag `reasoning`) y resolución de problemas multi-paso.
- Comprensión de imágenes combinada con texto (image-text-to-text), incluyendo preguntas sobre el contenido visual.
- *Function calling* / *tool calling* declarado en los metadatos.
- Predicción multi-token (MTP) para decodificación acelerada.
- Comportamiento sin censura (*uncensored*, *abliterated*): el modelo no aplica los filtros de rechazo del base, lo que lo hace apto para *red teaming* y análisis de seguridad.
- Integración con vLLM y con el formato compressed-tensors para despliegue en GPU con soporte FP4.
- No se declara soporte de audio ni de salida multimodal.

## Casos de uso

- **Red teaming y evaluación de seguridad**: el modelo sirve para generar intentos adversariales y estudiar cómo responde un LLM sin salvaguardas, comparando su comportamiento con el GLM-5.3-Flash original para medir el efecto de la alineación. Es el caso de uso principal declarado en los tags (`ai-red-team`, `red-teaming`).
- **Investigación sobre abliteration**: permite analizar qué capacidades se degradan y cuáles se preservan tras eliminar las direcciones de rechazo, con un modelo de 321 B como sujeto de estudio y una versión cuantizada que abarata la experimentación.
- **Análisis de documentos con imágenes**: gracias al pipeline image-text-to-text, puede procesar capturas, diagramas o páginas escaneadas junto a instrucciones textuales; útil en pipelines de extracción de información donde se combinan OCR y razonamiento.
- **Agentes con herramientas en entornos controlados**: el soporte de function calling permite construir agentes que consulten APIs internas o bases de datos en sandboxes de laboratorio, sin exposición a usuarios finales.
- **Generación de código y tareas técnicas asistidas**: el modelo base GLM-5.3-Flash está orientado a tareas de razonamiento y código; esta versión hereda esas capacidades, aunque la cuantización FP4 puede introducir degradación que conviene medir antes de usarla en producción.
- **Despliegue de un MoE grande en infraestructura FP4**: para equipos con GPU Blackwell que quieren evaluar el rendimiento de un modelo de 321 B cuantizado a 4 bits con vLLM, este repositorio ofrece pesos listos para cargar sin necesidad de cuantizar desde el original.
- **Generación de datos sintéticos para entrenamiento**: en dominios donde el modelo base rechazaría ciertas peticiones, esta variante puede producir muestras que el modelo alineado no generaría, siempre dentro de un marco ético y legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: con 321,3 B de parámetros en NVFP4 (4 bits), el peso de los pesos ronda los 160 GB, coherente con un repositorio de 205,1 GB que incluye metadatos y posibles tensores adicionales. A ello hay que sumar caché KV, activaciones y overhead del runtime; para contexto largo se recomienda planificar al menos 200-240 GB de memoria total.
- **GPU recomendadas**: el formato NVFP4 requiere hardware con soporte nativo de FP4, es decir, GPUs NVIDIA Blackwell (B200, GB200, RTX 5090/5080 de la generación Blackwell). En GPUs Hopper o Ampere la cuantización NVFP4 no se ejecuta de forma nativa y requeriría de-cuantización, con la penalización de memoria correspondiente.
- **Configuraciones multi-GPU**: un solo B200 (192 GB HBM3e) puede quedar justo; es previsible que se necesiten 2 GPUs Blackwell o más para contexto amplio y concurrencia.
- **Consumer GPU**: no cabe en GPUs de consumo de generaciones anteriores (RTX 4090, 24 GB). Solo sería viable en una RTX 5090 con un solo usuario y contexto corto, y aun así el margen es muy ajustado.
- **Despliegue**: vLLM es el runtime indicado por los tags (`vllm`, `compressed-tensors`); también transformers con el soporte correspondiente. llama.cpp y Ollama no están declarados y no hay evidencia de soporte para NVFP4 en esos runtimes.
- **Latencia y throughput**: no disponible. Al ser un MoE, el throughput depende fuertemente del número de parámetros activos, dato que no se ha publicado en esta ficha.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-Uncensored-NVFP4 (este) | 321,3 B (MoE) | no disponible | imagen+texto → texto | MIT | gated en HF, pesos NVFP4 |
| zai-org/GLM-5.3-Flash (base) | 321,3 B (MoE) | no disponible | imagen+texto → texto | MIT | oficial de Z.ai |
| Alternativas de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es contra el propio modelo base: esta versión difiere en precisión (NVFP4 frente a los pesos originales), en comportamiento (sin salvaguardas) y en tamaño de repositorio (205,1 GB). No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer comparaciones cuantitativas con otros modelos de la misma categoría.

## Limitaciones y advertencias

- **Ausencia de salvaguardas**: el *abliteration* elimina los mecanismos de rechazo del modelo base. No es apto para aplicaciones orientadas a usuarios finales sin una capa de moderación externa.
- **Riesgo de alucinación**: inherente a los LLM y potencialmente agravado por la cuantización a 4 bits, que puede degradar la fidelidad en tareas de razonamiento largo.
- **Degradación por cuantización**: NVFP4 reduce la precisión numérica; conviene validar la calidad frente al modelo base en las tareas concretas antes de cualquier uso serio.
- **Idiomas limitados**: solo inglés y chino declarados; el rendimiento en castellano no está garantizado ni documentado.
- **Sesgos**: no hay información publicada sobre la evaluación de sesgos de esta variante; al eliminar la alineación, es esperable una mayor exposición a contenido sesgado u ofensivo.
- **Licencia**: MIT según los metadatos, pero el acceso es restringido y requiere aceptar condiciones en Hugging Face; verificar los términos del modelo base de Z.ai antes de un uso comercial.
- **Soporte de hardware restringido**: el formato NVFP4 limita el despliegue a GPUs Blackwell; no hay evidencia de soporte en llama.cpp u Ollama.
- **Datos incompletos**: no se publican parámetros activos, longitud de contexto ni benchmarks, lo que dificulta la planificación de capacidad.
- **Naturaleza no oficial**: es un derivado de terceros, sin respaldo de Z.ai; los problemas de calidad o seguridad deben atribuirse al publicador, no al equipo del modelo base.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-NVFP4)
- [Modelo base: zai-org/GLM-5.3-Flash](https://huggingface.co/zai-org/GLM-5.3-Flash)
- [Perfil del publicador: orcarouter](https://huggingface.co/orcarouter)
