# junbrro/h2rb-e9-object-box-h25-g2-b64-s42-30k-actsilu-20261108

## Resumen

h2rb-e9-object-box-h25-g2-b64-s42-30k-actsilu-20261108 es un modelo de visión-lenguaje-acción (VLA) publicado por el usuario junbrro en Hugging Face. Forma parte del proyecto de investigación h2rb (Human-to-Robot Transfer via Bridging Representation and Action Space in VLAs), presentado como póster oral en el workshop de CoRL 2026. El modelo está diseñado para la transferencia de habilidades de manipulación desde datos humanos a robots, puenteando el espacio de representación y el espacio de acción en modelos VLA.

El checkpoint corresponde a un entrenamiento verificado de 30.000 pasos (job `junhyeong-e9-object-box-h25-g2-b64-s42-30k-1108-v1`) y se distribuye como copia de solo inferencia. Incluye el tokenizador de acciones exacto, la normalización, la etiqueta de decodificador y el contrato SiLU, y debe ejecutarse con el runtime correspondiente del proyecto RLDX-1. No se incluyen datos crudos, estados del optimizador ni del generador de números aleatorios.

Con 6.915.094.616 parámetros y un repositorio de 13,9 GB en formato safetensors, el modelo se sitúa en la categoría de VLA de tamaño medio-grande. La información pública es muy limitada: no se declaran licencia, idiomas ni pipeline, y la model card advierte explícitamente de que la finalización del entrenamiento no equivale a una tasa de éxito robótica medida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo VLA, etiqueta RLDX-1) |
| Parámetros totales | 6.915.094.616 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la información disponible. Por la categoría del proyecto (VLA) y la etiqueta RLDX-1, se trata de un modelo que combina un codificador visual, un modelo de lenguaje y una cabeza de acciones, pero no se especifican el tipo de transformer, el mecanismo de atención ni la composición exacta de las capas. Tampoco se indica el número de tokens de entrenamiento ni la composición del dataset más allá del identificador del job.

El checkpoint corresponde al paso 30.000 de un entrenamiento verificado. La nomenclatura del identificador (`object-box-h25-g2-b64-s42`) sugiere una configuración con tarea de cajas de objetos, 25 pasos de horizonte, 2 GPUs, batch de 64 y semilla 42, aunque estos valores no se confirman en la información proporcionada. El sufijo `actsilu` indica que el contrato de activación es SiLU, y la model card especifica que la inferencia debe respetar el tokenizador de acciones, la normalización y la etiqueta de decodificador exactos. No se documentan fases de RLHF, DPO ni innovaciones técnicas adicionales.

## Capacidades

- Generación de acciones robóticas a partir de observaciones visuales y lenguaje, en el marco de un modelo VLA.
- Transferencia humano-robot mediante el puenteo de representación y espacio de acción descrito en el proyecto h2rb.
- Manipulación de objetos guiada por instrucciones, con horizonte de acción codificado en el identificador del checkpoint.
- Inferencia determinista sujeta a un contrato estricto de tokenizador, normalización y activación SiLU.
- Capacidades de tool calling, agentes, multilingüismo, visión general o audio: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en transferencia humano-robot: el modelo sirve como checkpoint de referencia para reproducir experimentos del proyecto h2rb sobre el puenteo entre representación humana y espacio de acción robótico.
- Evaluación de políticas VLA en simulación: puede desplegarse en entornos simulados para medir la tasa de éxito de manipulación, siempre que se use el runtime RLDX-1 y el tokenizador de acciones exacto.
- Ablaciones de horizonte de acción: el identificador sugiere un horizonte de 25 pasos, lo que permite comparar con otros checkpoints de la misma familia para estudiar el efecto del horizonte en la estabilidad de la política.
- Reproducción de entrenamientos: al ser una copia de solo inferencia con paso verificado, sirve para validar que una réplica del pipeline produce salidas equivalentes en inferencia.
- Base para fine-tuning posterior: los pesos en safetensors pueden servir de inicialización para adaptaciones a nuevas tareas de manipulación, aunque la licencia no está declarada y debe aclararse antes de cualquier uso.
- Docencia y divulgación: ejemplo práctico de modelo VLA de ~6,9 mil millones de parámetros para explicar la integración de visión, lenguaje y acción en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente de que la finalización del entrenamiento (paso 30.000) no constituye una tasa de éxito robótica medida.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 27,7 GB solo para pesos, más activaciones y memoria del runtime.
- VRAM estimada en bf16/fp16: aproximadamente 13,8 GB para pesos, más overhead del runtime RLDX-1 y del codificador visual.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría esperar GPUs de 24 GB o más (RTX 4090, A100 40 GB, H100) en bf16, pero no se confirma.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) en bf16, sujeto a verificación con el runtime real; no confirmado.
- Opciones de despliegue: el autor indica que debe usarse el runtime del proyecto RLDX-1. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma familia ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La model card advierte de que el paso de entrenamiento verificado no equivale a una tasa de éxito robótica medida; no debe interpretarse como validación de rendimiento en el mundo real.
- Es una copia de solo inferencia: no incluye datos crudos, estados del optimizador ni del generador aleatorio, por lo que no permite reanudar el entrenamiento.
- Requiere el runtime RLDX-1 y el contrato exacto de tokenizador de acciones, normalización, etiqueta de decodificador y activación SiLU; un uso fuera de ese contrato puede producir salidas inválidas.
- Licencia no declarada: no puede asumirse uso comercial permitido; debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas soportados no declarados.
- Sesgos conocidos y riesgo de alucinación: no documentados en la información disponible; en modelos VLA, los sesgos de los datos de demostración pueden trasladarse a la política aprendida.
- Contexto máximo no disponible, lo que impide planificar despliegues con secuencias largas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/junbrro/h2rb-e9-object-box-h25-g2-b64-s42-30k-actsilu-20261108
- Repositorio del proyecto h2rb: https://github.com/jun-brro/h2rb
