# enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-KL-Top20-ReverseKL-original10240

## Resumen

El adaptador `enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-KL-Top20-ReverseKL-original10240` es un LoRA de investigación publicado por el usuario enmingzhangzz sobre el modelo multimodal `Qwen/Qwen2.5-VL-7B-Instruct`. No es un modelo completo ni un fine-tuning integrado: es un paquete PEFT de 0,2 GB que debe cargarse junto al modelo base. Su pipeline declarado es `image-text-to-text`, y su propósito es explorar una receta concreta de destilación con selección de tokens guiada por divergencia KL inversa, combinada con poda de tokens visuales mediante VisionZip.

La receta es explícita en la model card: en cada posición válida de una respuesta generada por el propio estudiante se calcula `K_t = KL(P_estudiante,10% || P_profesor EMA con visión completa)` con puntuaciones desligadas del grafo de gradientes; se selecciona `max(1, ceil(0,20 * N))` posiciones con mayor KL en orden estable de token, y la pérdida es la media aritmética de su KL inversa original, recomputada con grafo vivo y fragmentos de KL de 32. VisionZip retiene el 10 % de los tokens visuales (5 % dominantes + 5 % contextuales) y el 20 % de las posiciones válidas contribuye a la pérdida. Es, por tanto, un artefacto orientado a reproducir un experimento de eficiencia en VLMs, no un modelo listo para producto.

El entrenamiento se completó el 10 de septiembre de 2026 con 10.240 muestras en orden fijo del dataset OpenMMReasoner-SFT-874K y 320 actualizaciones del optimizador, sobre 4 GPU con batch efectivo de 32. El autor indica explícitamente que no se reclama ningún resultado de benchmarks y que el dataset no está balanceado, por lo que la ficha debe leerse como documentación de un adaptador experimental de descargas y likes nulos en el momento del análisis.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal vision-language Qwen2.5-VL-7B-Instruct; codificador visual congelado y LoRA en el decodificador de lenguaje |
| Parámetros totales | 40.370.176 parámetros entrenables del adaptador; modelo base de aproximadamente 7 000 millones de parámetros |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen2.5-VL-7B-Instruct) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); repo de 0,2 GB con directorio `training/` de configuración y métricas |
| Rango y alpha de LoRA | r16, alpha 32, dropout 0 |
| Resolución de entrada | Mínimo y máximo de píxeles fijados en 846.720 |
| Contexto de entrenamiento | Rollout greedy con máximo de 512 tokens nuevos |
| Precisión de entrenamiento | BF16 con FlashAttention 2 |
| SHA256 del adaptador | `1dd3a3e6edd31697c37c4cec3a9fd281782badd6f678d370c2e06a4d79437daa` |

## Arquitectura y entrenamiento

El adaptador se apoya en Qwen2.5-VL-7B-Instruct, un transformer multimodal que procesa imágenes y texto en una única secuencia de tokens, con un codificador visual que en este experimento permanece congelado. La innovación no está en la arquitectura del modelo base, sino en el procedimiento de destilación: el estudiante recibe el 10 % de los tokens visuales tras la poda oficial de VisionZip, mientras que el profesor, una copia EMA con decaimiento 0,9999 y sin acceso a la verdad de referencia, recibe la entrada visual completa. El profesor no es un modelo externo: parte de la inicialización fresca del modelo base, lo que sitúa el experimento en el terreno de la autodestilación on-policy con rollouts generados por el propio estudiante antes de la selección de tokens de respuesta.

La pérdida se calcula únicamente sobre el 20 % de posiciones de respuesta con mayor KL entre estudiante podado y profesor completo, usando KL inversa tanto en el ranking (puntuaciones desligadas, orden de token estable para romper empates) como en la pérdida final (recomputada con grafo de gradientes vivo y fragmentos de 32). El autor subraya que no hay normalización de puntuaciones, reescalado de masa de pérdida, intervención, ni agrupación por lambda, y que no se trata de variantes B-TIP, TIP o B Top-K. El entrenamiento usó AdamW con LR 2e-5 y weight decay 0, batch efectivo de 32 (4 GPU x microbatch 8 x acumulación 1) sobre 10.240 muestras en orden fijo, y finalizó con una pérdida media de entrenamiento en el último batch (media de cuatro rangos) de 0,10597942, valor que el propio autor aclara que no es una métrica de evaluación ni una media de todo el entrenamiento.

## Capacidades

- Generación de texto condicionada por imagen (pipeline `image-text-to-text`), heredada del modelo base Qwen2.5-VL-7B-Instruct.
- Razonamiento multimodal orientado por el dataset de entrenamiento OpenMMReasoner-SFT-874K, según declara la model card.
- Inferencia con poda visual agresiva: VisionZip retiene el 10 % de los tokens visuales, lo que reduce el coste de prefill, pero debe habilitarse por separado, ya que cargar el adaptador no activa la poda.
- Selección de tokens guiada por KL inversa durante el entrenamiento; no es una capacidad de inferencia que el usuario pueda invocar.
- Tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio o vídeo: no disponible en la información proporcionada (el modelo base Qwen2.5-VL admite vídeo, pero este adaptador no documenta cambios en esa capacidad).

## Casos de uso

- Investigación en destilación on-policy: el adaptador permite reproducir y auditar una receta concreta de selección de tokens por KL inversa con profesor EMA, comparando la pérdida final documentada (0,10597942 en el último batch) y las métricas escalares incluidas en `training/`.
- Estudio de poda de tokens visuales: sirve para medir el impacto de retener solo el 10 % de tokens visuales en tareas de razonamiento multimodal, ya que estudiante y profesor se diferencian precisamente en ese punto.
- Experimentos de eficiencia en prefill de VLMs: al reducir el número de tokens visuales, resulta adecuado para cuantificar cuánto se recorta el coste de atención visual en tarjetas con memoria limitada.
- Prototipado de asistentes sobre documentos e imágenes: cargando el modelo base más el adaptador con PEFT y habilitando VisionZip, puede emplearse en preguntas y respuestas sobre capturas, formularios o diagramas en entornos de laboratorio.
- Punto de partida para fine-tuning posterior: al ser un adaptador PEFT con r16 sobre el decodificador, puede continuarse el entrenamiento con datos propios sin tocar el codificador visual congelado.
- Servicio de inferencia multi-LoRA: el adaptador puede registrarse como adaptador adicional en un servidor que ya sirva Qwen2.5-VL-7B-Instruct, de modo que el tráfico estándar use el base y este LoRA se active solo para peticiones experimentales.
- Evaluación comparativa de métodos de destilación: el autor menciona que el espacio de nombres conserva texto histórico de un experimento previo con KL pura, lo que facilita contrastar ambas variantes bajo la misma inicialización.
- Análisis de sesgos y robustez en entradas visuales podadas: útil para estudiar en qué tareas la pérdida de tokens visuales degrada la respuesta, dado que el profesor ve la imagen completa y el estudiante no.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica de forma explícita que no se reclama ningún resultado de benchmark y que el único valor numérico reportado (0,10597942) es la pérdida media del último batch de entrenamiento en cuatro rangos, no una puntuación de evaluación ni una media de todo el entrenamiento. No se dispone de datos de MMLU, HumanEval, GSM8K ni de benchmarks multimodales para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador suma 40,37 millones de parámetros (0,2 GB de repo, incluidos ficheros de entrenamiento), por lo que el grueso de la memoria lo determina el modelo base de 7B. En BF16, una estimación razonable es de 16 a 20 GB de VRAM incluyendo pesos, caché KV y activaciones con lotes pequeños.
- En cuantización de 4 bits, la estimación baja a 5-7 GB, aunque el autor no publica configuraciones de cuantización y no se garantiza que el adaptador se comporte igual sobre pesos cuantizados.
- GPU recomendadas: A100 (40 o 80 GB) y H100 para servicio concurrente; RTX 4090 o RTX 3090 (24 GB) para inferencia en BF16 con lotes reducidos.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 o RTX 4080 de 16 GB si se recurre a cuantización; en tarjetas de 8-12 GB solo con cuantización agresiva y sin garantías.
- Opciones de despliegue: carga mediante PEFT y Transformers sobre el modelo base; servidores compatibles con adaptadores LoRA (por ejemplo vLLM con soporte multi-LoRA). Para pesos GGUF o llama.cpp no hay información disponible, y la poda VisionZip debe habilitarse aparte del adaptador.
- Latencia y throughput: no disponible. Lo único documentado es que el entrenamiento usó FlashAttention 2 en BF16 y rollouts greedy de hasta 512 tokens nuevos, datos que no permiten extrapolar cifras de servicio.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (OPSD / VisionZip r010) | Adaptador LoRA de investigación | 40,37 M entrenables sobre base de ~7B | No disponible | No disponible | HuggingFace, 0 descargas y 0 likes en el momento del análisis |
| Qwen2.5-VL-7B-Instruct | Modelo base multimodal completo | ~7B | No disponible en la información proporcionada | No disponible en la información proporcionada (consultar la model card del base) | HuggingFace, modelo público de referencia |
| Otros adaptadores LoRA de destilación sobre Qwen2.5-VL | Adaptadores PEFT | Variable | No disponible | No disponible | No se dispone de comparativas en la información proporcionada |

No se dispone de datos de rendimiento comparado entre estas opciones, porque el autor no publica benchmarks y la búsqueda web realizada no devolvió información relevante sobre el modelo ni sobre alternativas equivalentes.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar y cargar Qwen2.5-VL-7B-Instruct y aplicar el adaptador con PEFT.
- Cargar el adaptador no activa la poda visual. VisionZip debe habilitarse por separado; si no se hace, el modelo se comporta como el base con el LoRA aplicado.
- El dataset de entrenamiento no está balanceado, según advierte el propio autor, lo que puede sesgar el comportamiento hacia las tareas sobrerrepresentadas en OpenMMReasoner-SFT-874K.
- No se publican benchmarks ni evaluaciones de calidad, con lo que no hay evidencia de mejora frente al modelo base.
- No se declaran licencia ni idiomas soportados, lo que impide verificar si el uso comercial está permitido. La licencia del modelo base debe consultarse por separado antes de cualquier uso en producción.
- Riesgo de alucinación: no cuantificado para este adaptador; al derivar de un VLM de 7B, es esperable un comportamiento similar al del base, pero no hay datos que lo confirmen.
- El profesor EMA no accedió a la verdad de referencia, así que la señal de destilación se apoya en las distribuciones del propio estudiante podado y del profesor completo, con el riesgo de arrastrar sus errores.
- La pérdida final reportada (0,10597942) corresponde solo al último batch y a una media de cuatro rangos; no debe interpretarse como métrica de convergencia ni de calidad.
- Los estados del optimizador, EMA y RNG no se incluyen en el paquete, por lo que reanudar el entrenamiento exactamente en el mismo punto no es posible con lo publicado.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día, lo que indica ausencia de validación externa por parte de la comunidad.
- No se dispone de información sobre el comportamiento del adaptador con pesos cuantizados, ni sobre estabilidad en contextos largos.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-KL-Top20-ReverseKL-original10240
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Dataset de entrenamiento (referenciado en las etiquetas y en la model card): https://huggingface.co/datasets/OpenMMReasoner/OpenMMReasoner-SFT-874K
- Resultados de la búsqueda web: no contienen información relevante sobre este modelo; las entradas devueltas corresponden a una herramienta de desinstalación de software ajena al proyecto. No se han localizado papers, blogs, repositorios ni demos asociados al adaptador en la información disponible.
