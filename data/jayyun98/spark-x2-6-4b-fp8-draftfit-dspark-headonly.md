# jayyun98/Spark-X2.6-4B-FP8-Draftfit-DSpark-HeadOnly

## Resumen

Spark-X2.6-4B-FP8-DSpark-HeadOnly es un borrador (*draft*) de decodificación especulativa publicado por el usuario jayyun98 como parte del conjunto de validación de Draftfit, una plataforma para construir, convertir y evaluar borradores de decodificación especulativa que comparten características con el modelo objetivo. No es un modelo de lenguaje autónomo: es un artefacto de investigación de 624 millones de parámetros (0,62 B) diseñado para acelerar la inferencia de su modelo objetivo, XHToken/Spark-X2.6-4B-FP8, mediante la propuesta de tokens que el modelo grande verifica en paralelo.

El checkpoint contiene únicamente la cabeza del borrador (de ahí el sufijo HeadOnly) en precisión flotante, y su etiqueta FP8/INT4 hace referencia al tipo de cuantización del modelo objetivo requerido, no a la de los pesos del propio borrador. La licencia es Apache 2.0 y el único idioma declarado es el inglés. El repositorio ocupa 1,2 GB y no registra descargas ni interacciones en el momento de redactar esta ficha.

Su relevancia es acotada pero específica: sirve como referencia reproducible para medir la tasa de aceptación de un borrador de decodificación especulativa sobre pesos cuantizados oficiales, un escenario poco documentado porque la mayoría de los borradores públicos se evalúan contra modelos en BF16. El autor advierte explícitamente de que las métricas publicadas son estimaciones internas con intervalos de confianza que incluyen el cero, por lo que no demuestran superioridad frente al borrador base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (borrador de decodificación especulativa; clase `SparkDSpark` según la model card) |
| Parametros totales | 624.416.001 (0,62 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos del borrador en coma flotante; requiere objetivo en FP8/INT4 (compressed-tensors) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del borrador más allá de que se instancia mediante la clase `SparkDSpark(official_config())` y de que emplea «características compartidas» (*shared target features*) con el modelo objetivo, un enfoque habitual en borradores acoplados al modelo grande que reutilizan estados ocultos del objetivo para mejorar la predicción. El checkpoint contiene solo la cabeza del borrador, lo que explica que 624 M de parámetros ocupen 1,2 GB en el repositorio.

No se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del corpus ni si se aplicaron técnicas de alineación como RLHF o DPO. La evaluación descrita en la model card emplea verificación de prefijo voraz (*greedy prefix verification*) con siete propuestas por paso, 64 tokens de salida y 24 prompts por partición, comparando contra los mismos pesos cuantizados oficiales del objetivo. El objetivo ejecuta la referencia QDQ de compressed-tensors con sus escalas originales y cuantización dinámica de activaciones; la paridad con kernels empaquetados nativos y la velocidad en servidores de producción no están verificadas.

## Capacidades

- Generación de propuestas de tokens para decodificación especulativa sobre el modelo objetivo XHToken/Spark-X2.6-4B-FP8.
- Verificación de prefijos voraces con hasta siete propuestas por paso de decodificación.
- Acoplamiento a las características internas del objetivo mediante el adaptador Spark compatible.
- Ejecución sobre pesos objetivo cuantizados con compressed-tensors (QDQ) y cuantización dinámica de activaciones.
- No soporta tool calling, function calling ni razonamiento multi-paso de forma autónoma: no es un modelo de chat ni un agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al inglés declarado.

## Casos de uso

- Evaluación de borradores especulativos en investigación: el checkpoint sirve para reproducir la tabla de aceptación publicada (41,92 % en desarrollo y 38,99 % en confirmación) contra los pesos cuantizados oficiales del objetivo, usando el verificador de prefijo completo fijo.
- Validación de la plataforma Draftfit: se integra como parte del conjunto de validación para comprobar el flujo de construcción, conversión y evaluación de borradores con características compartidas.
- Estudio del impacto de la cuantización en la decodificación especulativa: permite medir cómo la cuantización dinámica de activaciones del objetivo afecta a la coincidencia de tokens entre la generación con caché y la evaluación de prefijo completo.
- Referencia para pipelines de decodificación especulativa en entornos de investigación: útil como punto de comparación frente a borradores entrenados sobre el mismo objetivo en BF16.
- Análisis de intervalos de confianza en métricas de aceptación: los pares de intervalos al 95 % publicados permiten estudiar la variabilidad de las estimaciones con muestras pequeñas (24 prompts por partición).
- Reproducibilidad de artefactos de investigación: al ser un checkpoint de referencia personalizado con revisión exacta del objetivo fijada en `config.json`, facilita la replicación de experimentos en entornos controlados.

## Benchmarks y rendimiento

| Evaluación | Borrador base | Este borrador |
|---|---:|---:|
| Desarrollo (aceptación) | 41,24 % | 41,92 % |
| Confirmación (aceptación) | 38,58 % | 38,99 % |

Condiciones declaradas por el autor: verificación de prefijo voraz con siete propuestas, 64 tokens de salida y 24 prompts por partición, contra los mismos pesos cuantizados oficiales. La aceptación excluye los tokens de bonificación del objetivo. Todas las salidas coinciden exactamente con el objetivo. Los intervalos de confianza pareados al 95 % incluyen el cero en ambas particiones, por lo que las mediciones no establecen superioridad. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no procede aplicarlos a un borrador de decodificación.

## Requisitos de hardware

- VRAM estimada para el borrador: aproximadamente 1,2-1,5 GB en coma flotante (624 M de parámetros), adicionales a la memoria del modelo objetivo.
- El objetivo XHToken/Spark-X2.6-4B-FP8 requiere su propio presupuesto de VRAM, no especificado en la información disponible; por el tamaño nominal de 4 B en FP8 se estima en torno a 4-6 GB solo para pesos, sin caché KV.
- GPU recomendadas: no disponibles. Al no ser compatible con vLLM, SGLang ni MLX de forma directa, no hay una recomendación de despliegue validada.
- Viabilidad en GPU de consumo: el borrador por sí solo cabría en cualquier GPU con más de 2 GB, pero el conjunto borrador más objetivo depende del soporte del adaptador Spark, no documentado.
- Opciones de despliegue: carga manual de `model.safetensors` con `safetensors.torch.load_file` en `SparkDSpark(official_config())`, junto con un adaptador Spark compatible y la revisión exacta del objetivo indicada en `config.json`. No es un modelo drop-in para vLLM, SGLang ni MLX.
- Latencia y throughput: no disponibles. La velocidad de servicio en producción no está verificada según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Despliegue |
|---|---|---|---|---|---|
| Spark-X2.6-4B-FP8-DSpark-HeadOnly | 0,62 B | No disponible | Borrador especulativo acoplado a objetivo FP8 | Apache 2.0 | Carga manual vía `SparkDSpark` |
| Borrador base de la evaluación | No disponible | No disponible | Borrador especulativo de referencia | No disponible | No disponible |
| XHToken/Spark-X2.6-4B-FP8 (objetivo) | 4 B (nominal) | No disponible | Modelo objetivo cuantizado | No disponible | No disponible |

No se dispone de información sobre otros borradores públicos comparables para el mismo objetivo ni sobre alternativas de la misma categoría con las que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje utilizable de forma autónoma: sin el objetivo XHToken/Spark-X2.6-4B-FP8 y un adaptador Spark compatible no produce salidas válidas.
- No es compatible como modelo drop-in con vLLM, SGLang ni MLX; requiere carga manual y código de referencia.
- Las métricas de aceptación publicadas son estimaciones puntuales sobre muestras pequeñas (24 prompts por partición) y sus intervalos de confianza al 95 % incluyen el cero; no demuestran mejora frente al borrador base.
- La paridad con kernels empaquetados nativos y el rendimiento en servicio de producción no están verificados.
- La generación con caché del objetivo puede seleccionar identificadores de token distintos de la evaluación de prefijo completo bajo cuantización dinámica QDQ; la tabla usa el verificador de prefijo completo fijo.
- Idioma limitado al inglés; no se documentan capacidades multilingües.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible, y en cualquier caso heredado del modelo objetivo.
- Uso comercial permitido por la licencia Apache 2.0, pero sin garantías de idoneidad para producción al tratarse de un artefacto de investigación.
- Sin descargas ni validación comunitaria en el momento de redactar esta ficha (0 descargas, 0 likes).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jayyun98/Spark-X2.6-4B-FP8-Draftfit-DSpark-HeadOnly
- Modelo objetivo: https://huggingface.co/XHToken/Spark-X2.6-4B-FP8
- Repositorio Draftfit: https://github.com/JayYun98/Draftfit
