# adpretko/celerity-271m-8k-tema-ablation-ad0p8-tema8

## Resumen

Celerity 271M 8K — TEMA ablation — ad0.8_tema_mult8 es un checkpoint de investigación publicado por el usuario adpretko en HuggingFace. Se trata de un modelo de lenguaje de aproximadamente 271 millones de parámetros entrenado con una longitud de secuencia máxima de 8192 tokens y convertido desde el formato interno de Cerebras CS al formato de HuggingFace. No es un modelo pensado para producción, sino un punto experimental dentro de una ablación de hiperparámetros de entrenamiento.

La particularidad del checkpoint es que forma parte de una ablación de tau-EMA: se mantiene fija la tasa de aprendizaje en 0.15 y el batch global de entrenamiento en 48 mientras se varía el multiplicador de tau-EMA (en este caso, 8 veces el valor de referencia 0.1745), ajustando el weight decay en consecuencia. Además, emplea una attention dropout de 0.8 con schedule constante y embedding posicional de tipo ALiBi para soportar la ventana de 8K tokens.

Su relevancia es acotada y fundamentalmente metodológica: sirve para estudiar cómo afecta la dinámica de EMA y el attention dropout elevado al resultado final del entrenamiento en modelos pequeños de contexto largo. Al requerir código de modelado propio, necesita cargarse con `trust_remote_code=True`. No tiene descargas ni likes, no se declara licencia ni idiomas, y no se han publicado resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada explicitamente por el autor. Los hiperparametros declarados (ALiBi, attention dropout, stochastic depth, LayerDrop) son compatibles con un transformer decoder-only |
| Parametros totales | 271M (segun el nombre del modelo) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (maximum sequence length durante el entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (etiquetas del repositorio: pytorch, custom_code; tamano del repo: 0,5 GB) |

## Arquitectura y entrenamiento

El autor no documenta la arquitectura en detalle. Los hiperparámetros declarados —embedding posicional ALiBi, attention dropout, residual dropout, stochastic depth y LayerDrop— corresponden a un transformer decoder-only con atención completa, aunque no se confirma explícitamente. El uso de ALiBi es coherente con el objetivo de generalizar a secuencias de hasta 8192 tokens sin embeddings posicionales aprendidos.

Respecto al entrenamiento, la model card ofrece la procedencia experimental completa: experimento `ad0.8_tema_mult8`, checkpoint de origen `checkpoint_13773.mdl`, 13773 pasos de entrenamiento, batch global de 48 y batch de validación de 32. La tasa de aprendizaje máxima fue 0.15, con weight decay 0.00034673267902102944, tau_ema 1.396 y un multiplicador de tau-EMA de 8 respecto a la referencia 0.1745. La attention dropout se fijó en 0.8 con schedule constante; residual dropout, stochastic depth y LayerDrop se fijaron en 0.0. No se declara el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El entorno de origen es `cbcore 2.6.0` y la conversión se realizó con el commit de conversor `0e3d5d375695293479df9d2a3717f05f71a345b4`. Attention dropout, tau_ema y weight decay son hiperparámetros de entrenamiento: sus efectos están incorporados en los pesos, y en evaluación se desactivan mediante `model.eval()`.

## Capacidades

La información disponible no documenta capacidades funcionales del modelo. Lo único verificable es lo siguiente:

- Generación de texto autoregresiva: el checkpoint es un modelo de lenguaje entrenado con secuencias de hasta 8192 tokens, por lo que la tarea prevista es la modelización y generación de lenguaje.
- Contexto largo relativo a su tamano: 8K tokens con ALiBi, inusual en modelos de 271M.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

Dado que es un checkpoint de ablación sin evaluación publicada, no hay evidencia de que estas capacidades estén al nivel de un modelo instruido o alineado.

## Casos de uso

Los casos siguientes son escenarios realistas dado el perfil del modelo (271M parámetros, 8K de contexto, checkpoint de investigación), no aplicaciones validadas por el autor:

- Investigación sobre dinámica de EMA en entrenamiento: usar este checkpoint junto a los demás puntos de la ablación para medir el efecto del multiplicador de tau-EMA sobre la pérdida de validación y la calidad de generación.
- Estudio de attention dropout extremo: con dropout de 0.8, sirve para analizar la robustez y el comportamiento de la atención a contextos largos cuando el entrenamiento regulariza de forma agresiva.
- Experimentos de modelado de lenguaje de contexto largo en hardware modesto: 271M parámetros y 8K de ventana permiten reproducir experimentos de atención sobre documentos largos en una única GPU de consumo.
- Base para fine-tuning académico: punto de partida barato para probar técnicas de adaptación (LoRA, adaptadores) sobre un modelo con ventana de 8K.
- Evaluación comparativa de checkpoints de una misma familia: al ser una ablación, permite aislar variables de entrenamiento frente a los checkpoints hermanos `ad0p1` y `residual-dropout-0p0`.
- Pruebas de infraestructura de carga de código personalizado: útil como caso de test para pipelines que necesitan `trust_remote_code=True` y conversión desde formatos no estándar (Cerebras CS).
- Generación de texto a pequeña escala con restricciones de memoria: escenarios de prototipado donde 0,5 GB de repositorio y menos de 1 GB en bf16 son determinantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta hiperparámetros de entrenamiento y procedencia del checkpoint; no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de evaluación.

## Requisitos de hardware

Las cifras de memoria son estimaciones derivadas del recuento de parámetros (271M), no datos publicados por el autor. El KV cache depende de una configuración de capas y cabezas que no se ha hecho pública.

- Pesos en fp32: aproximadamente 1,1 GB de VRAM.
- Pesos en bf16/fp16: aproximadamente 0,55 GB de VRAM.
- Pesos en int8: aproximadamente 0,3 GB de VRAM (requiere cuantización posterior, no disponible en el repositorio).
- KV cache a 8192 tokens: no disponible; depende del número de capas, cabezas y dimensión de cabeza. En configuraciones típicas de esta escala puede añadir entre 0,2 y 0,5 GB en bf16, pero es una estimación no verificada.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre. Cabe en GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100, H100 y similares. En consumer GPU cabe sin problema en fp16/bf16.
- Opciones de despliegue: no hay confirmación de soporte para vLLM, llama.cpp, Ollama o TGI. El modelo usa código de modelado propio y requiere `trust_remote_code=True` con la librería `transformers`; cualquier otro runtime dependería de una conversión no documentada a GGUF o formatos equivalentes.
- Latencia y throughput: no disponible. No hay mediciones publicadas.

## Comparativa con modelos similares

La información proporcionada solo permite comparar con checkpoints hermanos de la misma familia. Los datos de modelos externos son de conocimiento público general y no se han verificado en esta búsqueda.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| celerity-271m-8k-tema-ablation-ad0p8-tema8 | 271M | 8192 | Checkpoint de ablación (tau-EMA mult. 8, attention dropout 0.8) | No disponible | HuggingFace, requiere `trust_remote_code=True` |
| celerity-271m-8k-ad0p1 | 271M | 8192 | Checkpoint Celerity convertido desde Cerebras CS | No disponible | HuggingFace |
| celerity-271m-8k-residual-dropout-0p0 | 271M | 8192 | Checkpoint de depuración/ablación (residual dropout 0.0) | No disponible | HuggingFace |
| Modelos pequeños comparables de la industria (p. ej. familias de 135M-500M con contexto de 2K-8K) | 135M-500M | Variable | Transformer decoder-only | Variable segun modelo | Ampliamente disponible |

No se dispone de datos de rendimiento de ninguno de estos checkpoints, por lo que la comparativa se limita a parámetros, contexto y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No hay evaluación de sesgos ni documentación sobre la composición del dataset de entrenamiento.
- Riesgo de alucinación: no evaluado. Al no existir benchmarks ni alineación documentada, no hay garantías sobre la fidelidad factual de las salidas.
- Limitaciones de contexto: la ventana es de 8192 tokens durante el entrenamiento; no se documenta el comportamiento más allá de esa longitud ni la degradación con ALiBi.
- Idiomas: no se declaran idiomas soportados; se desconoce la cobertura multilingüe.
- Licencia: no disponible. Sin una licencia explícita, no hay autorización clara para uso comercial; se debe contactar con el autor antes de cualquier uso en producción.
- Código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio. Es un riesgo de seguridad que debe evaluarse antes de cargar el modelo en entornos sensibles.
- Perfil de investigación: es una ablación de hiperparámetros con attention dropout 0.8, un valor muy alto. No está pensado como modelo de propósito general ni como modelo instruido.
- Sin validación externa: cero descargas y cero likes en el momento de la consulta, sin evaluaciones independientes ni informes de terceros.
- Fechas del repositorio: la creación y actualización figuran como 2026-10-04, dato que debe verificarse en la página del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adpretko/celerity-271m-8k-tema-ablation-ad0p8-tema8
- Checkpoint hermano `ad0p1`: https://huggingface.co/adpretko/celerity-271m-8k-ad0p1
- Checkpoint hermano `residual-dropout-0p0`: https://huggingface.co/adpretko/celerity-271m-8k-residual-dropout-0p0
- Paper, blog o repositorio oficial de Celerity: no disponible en la información proporcionada
- Demo o espacio de inferencia: no disponible
