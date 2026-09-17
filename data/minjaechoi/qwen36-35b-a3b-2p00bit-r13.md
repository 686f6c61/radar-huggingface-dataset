# minjaechoi/qwen36-35b-a3b-2p00bit-r13

## Resumen

El modelo `minjaechoi/qwen36-35b-a3b-2p00bit-r13` es un checkpoint de investigación derivado de `Qwen/Qwen3.6-35B-A3B` en el que los expertos enrutados (routed experts) se han comprimido a una media de 2,00 bits por peso, mientras que el resto de los pesos permanece en BF16. Lo publica el usuario minjaechoi en HuggingFace y se etiqueta como `quantized`, con arquitectura declarada `qwen3_5_moe` (mezcla de expertos). El repositorio ocupa 70,2 GB y el recuento real de parámetros en safetensors es de 35.107.181.936 (unos 35,1 mil millones).

El detalle técnico más relevante es que la compresión no se traduce en una reducción del tamaño del repositorio: el autor indica explícitamente que los pesos se almacenan desquantizados en tensores BF16, de modo que el artefacto descargable mantiene el tamaño de un modelo BF16 completo. La ganancia declarada es de precisión numérica en el cálculo (los expertos operan con un presupuesto efectivo de 2 bits), no de huella en disco. El modelo se carga con `transformers` estándar y con vLLM, sin necesidad de kernels ni librerías de cuantización específicas.

Se trata de un experimento interno, sin descargas ni valoraciones en el momento de la consulta, y con licencia heredada del modelo base (el autor no especifica términos propios). Es relevante para quienes investigan cuantización extrema de arquitecturas MoE y quieran evaluar si un presupuesto de 2 bits en los expertos degrada el comportamiento del modelo base, aunque conviene subrayar que no se han publicado resultados de evaluación junto al checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), etiqueta `qwen3_5_moe`; transformer con expertos enrutados |
| Parametros totales | 35.107.181.936 (35,1 mil millones), dato real de safetensors |
| Parametros activos | no disponible (el sufijo «A3B» del nombre apunta a ~3.000 millones de parametros activos, sin confirmar en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a una media de 2,00 bits; resto de pesos en BF16. Pesos almacenados desquantizados en tensores BF16 (no se publican variantes GGUF ni GPTQ/AWQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que la licencia sigue la del modelo base `Qwen/Qwen3.6-35B-A3B`; no se reproduce el texto) |
| Formato de pesos | safetensors (carga con `transformers` estandar y vLLM) |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos etiquetada como `qwen3_5_moe`, derivada directamente de `Qwen/Qwen3.6-35B-A3B`. En un MoE de este tipo solo una fracción de los expertos se activa por token, de ahí que el nombre del modelo base incluya el sufijo «A3B». La intervención de este checkpoint se limita a los expertos enrutados: se les aplica una cuantización cuyo presupuesto medio queda en 2,00 bits por peso (identificador interno «r13»), mientras que el resto de las matrices (atención, embeddings, capas densas, routers) se mantiene en BF16.

No se proporciona información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si hubo fases de ajuste por refuerzo (RLHF, DPO u otras). Tampoco se documenta ninguna innovación de decodificación (por ejemplo, decodificación especulativa) ni mecanismos de atención alternativa. El único aspecto técnico destacable, y es importante para la planificación de despliegues, es que la carga se hace con `transformers` y vLLM sin parcheos: los tensores ya vienen en BF16 y el presupuesto de 2 bits se refleja en los valores almacenados, no en un formato de compresión que requiera un runtime especial.

## Capacidades

- Generación de texto conversacional: la pipeline declarada es `text-generation` y las etiquetas incluyen `conversational`.
- Arquitectura MoE con activación parcial: adecuada para inferencia con coste por token inferior al de un modelo denso de 35B, siempre que el runtime soporte bien el enrutado.
- Compatibilidad declarada con `endpoints_compatible` y con vLLM, lo que habilita despliegues como servicio HTTP.
- Etiqueta `image-text-to-text`: el repositorio incluye esta etiqueta, lo que apunta a capacidades multimodales heredadas del modelo base, aunque no se documenta su funcionamiento ni su calidad tras la cuantización.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declara lista de idiomas.
- Modo «thinking» u otros modos especiales: no disponible.

## Casos de uso

- Investigación en cuantización extrema de MoE: comparar la salida de este checkpoint con la del modelo base `Qwen/Qwen3.6-35B-A3B` para medir la degradación introducida al bajar los expertos a 2,00 bits. Es el uso más directo dado que es un «internal research checkpoint».
- Evaluación de pipelines de servicio con vLLM: desplegar el modelo en vLLM y medir throughput y latencia reales de una arquitectura MoE con expertos de baja precisión, ya que el autor confirma compatibilidad con este runtime.
- Pruebas de integración con `transformers`: verificar que el checkpoint carga sin kernels personalizados y que los tensores BF16 desquantizados producen inferencias estables en entornos estándar.
- Generación de texto conversacional en entornos de laboratorio: usar la pipeline `text-generation` para probar respuestas multi-turno y observar si el presupuesto de 2 bits afecta a la coherencia en conversaciones largas.
- Prototipado de asistentes con entrada de imagen: aprovechar la etiqueta `image-text-to-text` para experimentos de descripción de imágenes o preguntas sobre imágenes, asumiendo que no hay documentación de calidad asociada.
- Ajuste fino posterior (fine-tuning) sobre expertos ya cuantizados: evaluar si el checkpoint sirve como punto de partida para adaptaciones de dominio, teniendo en cuenta que los pesos son BF16 y que el ajuste puede diluir el presupuesto de 2 bits.
- Auditoría de reproducibilidad: al existir el modelo base público, este checkpoint permite reproducir experimentos de compresión controlada y documentar la variante «r13» dentro de una familia de pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35,1 mil millones de parámetros almacenados en BF16, el peso ocupa aproximadamente 70 GB (coincide con los 70,2 GB del repositorio). Se necesita al menos ese espacio más el margen para caché KV y activaciones, por lo que en la práctica se requieren del orden de 80 GB o más por instancia.
- GPU recomendadas: para una única GPU, H100 80 GB o A100 80 GB. Cada unidad adicional permite repartir el modelo con tensor parallelism en vLLM.
- Cabe en GPU de consumo: no directamente. El checkpoint almacena los pesos en BF16, así que no cabe en una RTX 4090 (24 GB) ni en una RTX 5090; haría falta reparto por varias GPU o una cuantización adicional por parte del usuario, que no se distribuye en el repositorio.
- Opciones de despliegue: `transformers` y vLLM son compatibles según el autor. No se confirma soporte de llama.cpp, Ollama, TGI ni formatos GGUF, y no hay artefactos de ese tipo publicados.
- Latencia y throughput: no disponible. No se publican medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `minjaechoi/qwen36-35b-a3b-2p00bit-r13` | 35,1 mil millones (MoE) | no disponible | Expertos a 2,00 bits, resto BF16 | no disponible (hereda la del base) | HuggingFace, 0 descargas, 0 likes |
| `Qwen/Qwen3.6-35B-A3B` (modelo base) | 35,1 mil millones (MoE) | no disponible | BF16 en origen | no disponible en la informacion proporcionada | HuggingFace |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría. La única comparación documentada es con el modelo base del que deriva.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la magnitud de la degradación frente al modelo base tras aplicar un presupuesto de 2,00 bits a los expertos enrutados.
- La cuantización no reduce el tamaño en disco: los pesos se almacenan desquantizados en BF16, de modo que el repositorio ocupa 70,2 GB y no ofrece ventajas de almacenamiento ni de ancho de banda de memoria frente al modelo original.
- Licencia no especificada en la ficha: el autor remite a la licencia del modelo base, pero no se reproduce el texto ni se aclaran los términos de uso comercial. Verificar antes de cualquier uso en producción.
- Idiomas soportados no declarados: no se puede asumir cobertura multilingüe ni un rendimiento homogéneo entre idiomas.
- Contexto no documentado: se desconoce la ventana máxima soportada y si la cuantización afecta al comportamiento en secuencias largas.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluación específica para este checkpoint.
- Sesgos: no hay información sobre datos de entrenamiento ni sobre análisis de sesgos, por lo que no es posible caracterizarlos.
- Etiqueta `image-text-to-text` sin documentación: no se describe el codificador visual ni si las capacidades multimodales sobreviven a la cuantización.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- Checkpoint de investigación interna: no está pensado ni validado para uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minjaechoi/qwen36-35b-a3b-2p00bit-r13
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este checkpoint en la busqueda web realizada.
