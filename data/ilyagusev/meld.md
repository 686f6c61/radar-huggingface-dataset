# IlyaGusev/meld

## Resumen
MELD es un detector de texto generado por IA para inglés, publicado por el autor IlyaGusev como espejo sin modificar de la revisión `ddfc9c7` del repositorio original `anon-review-meld-2026/meld`. El modelo se construye a partir de un ajuste fino del encoder `jhu-clsp/ettin-encoder-1b` y incorpora una cabeza de clasificación personalizada que no es compatible con `pipeline()` ni con `AutoModel` de Transformers, por lo que requiere el script `meld.py` o la clase `Scorer` incluida en el repositorio.

El problema que resuelve es la atribución de autoría: dada una entrada de al menos unas 100 palabras en inglés, el modelo devuelve una puntuación `p_ai` y un veredicto binario aplicando un umbral de falsos positivos del 1 % definido en `meld_config.json` (`score_offsets`). La relevancia actual del modelo radica en su uso como referencia para evaluar la calidad y detectabilidad de textos sintéticos, en concreto para puntuar el conjunto de datos `twicetold` de IlyaGusev, cuyas puntuaciones MELD provienen exactamente de esta revisión.

Arquitectónicamente es un encoder de tipo ModernBERT (según las etiquetas del repositorio) con aproximadamente 1.028 millones de parámetros, pesos en safetensors y licencia MIT. No es un modelo generativo: es un clasificador discriminativo orientado exclusivamente al inglés.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo ModernBERT (etiqueta `modernbert`), con cabeza de clasificación personalizada |
| Parametros totales | 1.028.140.418 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, 4.112.580.996 bytes, SHA-256 `14b0fad5a99c5746e93e19ed54bc6de02b104381de27a391709bbd42264fa504`) |

## Arquitectura y entrenamiento
El modelo parte de `jhu-clsp/ettin-encoder-1b`, un encoder de la familia ModernBERT de aproximadamente 1.000 millones de parámetros, y lo ajusta como clasificador binario para detección de texto generado por IA. La cabeza de clasificación es custom: la model card indica explícitamente que `pipeline()` y `AutoModel` no son aplicables, y que la inferencia debe hacerse mediante `meld.py` o la clase `Scorer` que contiene. El repositorio incluye además `meld_config.json`, donde se almacenan los `score_offsets` correspondientes al umbral operativo de 1 % de falsos positivos.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF/DPO (no aplicables a un clasificador de este tipo). Tampoco se documentan innovaciones técnicas adicionales más allá del ajuste fino del encoder base y de la calibración del umbral de decisión.

## Capacidades
- Detección de texto generado por IA en inglés, devolviendo una puntuación continua `p_ai`.
- Clasificación binaria mediante un umbral calibrado a un 1 % de falsos positivos (`score_offsets` en `meld_config.json`).
- Funciona como scorer de referencia para conjuntos de datos de texto sintético, como `twicetold`.
- Requiere entradas de al menos unas 100 palabras para producir puntuaciones fiables.
- No soporta tool calling, function calling, agentes, multi-step reasoning ni modos de pensamiento: es un clasificador, no un modelo generativo.
- No dispone de capacidades multimodales (visión, audio) ni multilingües más allá del inglés.
- La puntuación debe interpretarse de forma relativa: comparando contra el umbral incluido o contra puntuaciones de textos humanos de referencia propios, no contra un corte fijo arbitrario.

## Casos de uso
- Moderación de contenido en plataformas: integrar `Scorer` en un servicio que reciba textos de usuario de más de 100 palabras y marque aquellos con `p_ai` por encima del umbral del 1 % de falsos positivos, derivando a revisión humana los casos límite.
- Filtrado de datasets de entrenamiento: puntuar corpus rastreados en inglés con MELD y descartar documentos sintéticos antes de usarlos para preentrenar o ajustar otros modelos, reduciendo contaminación por texto generado.
- Evaluación de modelos generativos: usar MELD como métrica auxiliar para medir la detectabilidad de las salidas de un LLM en inglés y comparar configuraciones de decodificación o prompts.
- Verificación de autoría en publicaciones y entregas académicas: aplicar el modelo a abstracts o secciones de más de 100 palabras para obtener una señal objetiva antes de una revisión manual.
- Auditoría de contenido editorial: puntuar artículos y notas de prensa en inglés para detectar posibles secciones generadas automáticamente antes de su publicación.
- Investigación sobre detección: servir como baseline reproducible (revisión fija con SHA-256 conocido) para comparar nuevos detectores contra las puntuaciones de MELD sobre el mismo corpus.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, AUC ni comparaciones con otros detectores; únicamente documenta el umbral operativo del 1 % de falsos positivos.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial. Con 1.028 millones de parámetros en safetensors (aproximadamente 4,1 GB de pesos en precisión de origen), la inferencia en fp32 requiere del orden de 4 GB solo para pesos, más overhead de activaciones; en fp16/bf16 se reduce a unos 2 GB de pesos.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 8 GB de VRAM debería poder ejecutar el modelo en fp16, incluidas RTX 3060/4060 de 8 GB y superiores.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 8 GB o más de VRAM; no confirmado por el autor.
- Opciones de despliegue: la model card indica que `pipeline()` y `AutoModel` no aplican; el despliegue debe hacerse con `meld.py` o la clase `Scorer` sobre `torch` + `transformers` + `safetensors` (`pip install torch transformers safetensors`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye comparaciones con otros detectores de texto generado por IA ni con modelos de tamaño equivalente, por lo que no se puede establecer una comparativa fiable sin inventar datos.

## Limitaciones y advertencias
- Solo admite inglés; textos en otros idiomas no están cubiertos.
- Requiere entradas de al menos unas 100 palabras; textos cortos producen puntuaciones poco fiables.
- El umbral debe interpretarse de forma relativa: la model card recomienda comparar contra los `score_offsets` incluidos o contra textos humanos de referencia propios, no contra un corte fijo.
- La cabeza de clasificación es custom, por lo que `pipeline()` y `AutoModel` no funcionan; una integración incorrecta puede producir resultados erróneos o fallos silenciosos.
- Riesgo de sesgos no documentado: no se especifica la composición del dataset de entrenamiento ni posibles sesgos por dominio, registro o variedad de inglés.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación; el autor solo documenta la calibración a un 1 % de falsos positivos.
- Las distintas revisiones de MELD tienen pesos distintos y producen puntuaciones distintas; solo esta revisión (`ddfc9c7`, SHA-256 indicado) corresponde a las puntuaciones publicadas sobre `twicetold`.
- Licencia MIT: permite uso comercial, pero el repositorio es un espejo sin modificar de un tercero; conviene conservar la atribución a los autores originales de MELD.

## Enlaces
- [Modelo en Hugging Face: IlyaGusev/meld](https://huggingface.co/IlyaGusev/meld)
- [Repositorio original espejado: anon-review-meld-2026/meld](https://huggingface.co/anon-review-meld-2026/meld)
- [Modelo base: jhu-clsp/ettin-encoder-1b](https://huggingface.co/jhu-clsp/ettin-encoder-1b)
- [Dataset twicetold: IlyaGusev/twicetold](https://huggingface.co/datasets/IlyaGusev/twicetold)
