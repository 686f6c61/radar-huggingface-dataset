# mrfakename/GLM-5.3-Flash-abliterated

## Resumen

GLM-5.3-Flash-abliterated es una variante del modelo zai-org/GLM-5.3-Flash publicada por el usuario mrfakename en la que se ha eliminado el comportamiento de rechazo mediante ablación direccional. El modelo original es un transformer multimodal (image-text-to-text) de la familia GLM, y esta versión conserva exactamente la misma arquitectura, formato y disposición de pesos que el original, por lo que se carga en cualquier infraestructura que soporte el modelo base.

El cambio principal consiste en la eliminación de un subespacio de rechazo de rango 2 en lugar de una única dirección. Se midieron direcciones de rechazo por separado para prompts de chat y de modo "think" en cada capa, y el subespacio resultante (los dos vectores singulares principales) se proyectó fuera de las escrituras al residual stream en 45 capas principales. Esto afecta a 90 tensores y cada capa recibe una intensidad propia obtenida mediante una búsqueda multiobjetivo que minimiza rechazos manteniendo baja la KL del primer token en prompts inofensivos.

El modelo cuenta con 321.323.031.390 parámetros totales según los safetensors del repositorio, un tamaño de repo de 328,4 GB y se distribuye en FP8/BF16 con licencia MIT. Es relevante para investigadores que necesitan estudiar el comportamiento de modelos sin capas de rechazo, para análisis de seguridad y para aplicaciones donde el filtrado del modelo base resulta limitante, siempre asumiendo la responsabilidad de uso que el propio autor advierte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia GLM; incluye torre de visión, expertos enrutados y capa MTP/nextn |
| Parametros totales | 321.323.031.390 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 y BF16 en el checkpoint; GGUF Q8_0 disponible en repositorio aparte; LoRA de ablación en GGUF |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint principal), GGUF (cuantizaciones y LoRA), NPZ (basis del subespacio y escalas) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer multimodal con torre de visión y una estructura de mezcla de expertos (MoE) con expertos enrutados y expertos compartidos (`mlp.shared_experts.down_proj`, `mlp.down_proj`), además de una capa MTP/nextn. El proceso de abliteración no modifica el entrenamiento original: parte del checkpoint ya entrenado y aplica una edición sobre los pesos. Concretamente, se midieron direcciones de rechazo para prompts de chat y de modo think en cada capa sobre la cuantización Q8_0 GGUF, y se calculó el subespacio de rechazo como los dos vectores singulares principales del conjunto de direcciones.

La edición se aplica como `W' = W - s·QQᵀW` sobre las escrituras al residual stream de 45 capas principales: `self_attn.o_proj`, `mlp.shared_experts.down_proj` y `mlp.down_proj` en las tres capas densas, sumando 90 tensores. Cada capa tiene su propia intensidad `s`, determinada por una búsqueda multiobjetivo que minimiza los rechazos y mantiene baja la KL del primer token en prompts inofensivos. Los tensores FP8 se recuantizaron con sus escalas de bloque originales usando redondeo estocástico para evitar que el redondeo deshiciera la eliminación. Los expertos enrutados, los embeddings, la torre de visión y la capa MTP/nextn permanecen bit a bit idénticos al original.

## Capacidades

- Generación de texto conversacional multi-turno, incluyendo modo chat y modo think (razonamiento explícito).
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), con torre de visión intacta respecto al modelo base.
- Razonamiento multi-paso en modo think, con respuestas que pueden incluir razonamiento intermedio antes de la respuesta final.
- Capacidad de seguir instrucciones sin rechazo ante solicitudes que el modelo original rechazaría, fruto de la ablación direccional.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre seguridad y alineación: el modelo permite estudiar cómo se distribuye la representación del rechazo en las capas de un transformer grande, comparando el comportamiento del original y el abliterado con las mismas entradas y midiendo tasas de rechazo y KL.
- Análisis de robustez de filtros: útil para evaluar si los sistemas de moderación externos detectan contenido que un modelo sin capa de rechazo generaría, y para diseñar defensas en pipelines de producción.
- Generación de datos sintéticos para pruebas de red teaming: el modelo puede producir respuestas que el original bloquearía, lo que facilita construir conjuntos de evaluación de clasificadores de toxicidad y de sistemas de moderación.
- Despliegue en entornos de investigación controlados: al conservar el formato FP8/BF16 y la misma estructura de archivos, se puede servir con la misma infraestructura que el modelo base, por ejemplo en clústeres con GPUs de gran memoria para experimentos internos.
- Estudio de la multimodalidad sin rechazo: la torre de visión permanece idéntica, lo que permite analizar cómo interactúan las representaciones visuales con la eliminación del rechazo en tareas image-text-to-text.
- Aplicación de la edición a otras cuantizaciones: el LoRA de rango 2 incluido (`abliteration-lora.gguf`) permite aplicar la misma modificación sobre los GGUF originales con `llama-server`, facilitando experimentos en hardware más modesto.
- Reproducibilidad metodológica: el archivo `abliteration-edit.npz` con la base del subespacio `Q` y las escalas por capa permite replicar la edición o adaptarla a otros modelos de la misma familia.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las tasas de rechazo y la KL del primer token, medidos sobre Q8_0 GGUF con decodificación greedy y 100 prompts dañinos reservados (held-out). Las respuestas de chat se limitaron a 384 tokens y el modo think a 768 tokens; cuando el razonamiento no había terminado, se juzgó el propio texto de razonamiento.

| Metrica | Original | Abliterated |
|---|---|---|
| Rechazos en chat (/100) | 99 | 3 |
| Rechazos en modo think, razonamiento o respuesta (/100) | 98 | 2 |
| KL del primer token en prompts inofensivos | 0 | 0,038 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en FP8 ocupa aproximadamente 328,4 GB de repo, por lo que la inferencia completa requiere del orden de 320-350 GB de memoria de GPU, sin contar overhead de activaciones y caché KV.
- En BF16 el requisito se duplica aproximadamente respecto a FP8, superando los 600 GB, lo que exige múltiples GPUs.
- GPU recomendadas: para FP8, clústeres con varias H100 (80 GB) o A100 (80 GB); no cabe en una sola GPU consumer.
- GPU consumer: no cabe en RTX 4090 (24 GB) ni en ninguna GPU consumer actual en precisión completa; las cuantizaciones GGUF de menor tamaño del repositorio aparte podrían permitir despliegue parcial, aunque no se dispone de datos de tamaño de esas cuantizaciones en la información proporcionada.
- Opciones de despliegue: el autor indica que el modelo se carga donde se carga el original; el LoRA de ablación se aplica con `llama-server` sobre GGUF. Para el checkpoint safetensors se puede usar la misma pila que el modelo base (vLLM, TGI u otros), aunque no se detallan en la información disponible.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Notas |
|---|---|---|---|---|
| mrfakename/GLM-5.3-Flash-abliterated | 321.323.031.390 | no disponible | MIT | Variante abliterada del GLM-5.3-Flash, multimodal, FP8/BF16 |
| zai-org/GLM-5.3-Flash | no disponible | no disponible | no disponible | Modelo base original, con capa de rechazo intacta |
| Otras variantes abliteradas de la familia GLM | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada |

No se dispone de información sobre modelos comparables de otros autores en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo cumplirá solicitudes dañinas; el autor advierte explícitamente que la responsabilidad de uso recae en el usuario. No es apto para despliegues públicos sin moderación externa.
- La ablación se midió sobre Q8_0 GGUF y con prompts de chat y think; el comportamiento en otras cuantizaciones o en FP8 puede diferir ligeramente, aunque el autor indica que los tensores FP8 se recuantizaron con redondeo estocástico para preservar la edición.
- La KL del primer token en prompts inofensivos es de 0,038, lo que indica una desviación pequeña pero no nula respecto al original; puede haber cambios sutiles en la distribución de salida incluso en entradas benignas.
- Los expertos enrutados, embeddings, torre de visión y capa MTP/nextn son bit a bit idénticos al original, por lo que los sesgos y limitaciones del modelo base en esas partes persisten sin cambios.
- No se dispone de información sobre idiomas soportados, longitud de contexto ni resultados de benchmarks estándar, lo que limita la evaluación de su calidad general frente al original.
- La licencia MIT permite uso comercial, pero la ausencia de filtros de rechazo puede incumplir políticas de plataformas o requisitos regulatorios en determinados contextos; conviene revisar la normativa aplicable antes de un despliegue en producción.
- Riesgo de alucinación: no se han publicado evaluaciones específicas en la información disponible; al ser una edición de pesos sobre un modelo ya entrenado, el riesgo de alucinación debería ser similar al del original, pero no está cuantificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrfakename/GLM-5.3-Flash-abliterated
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Cuantizaciones GGUF: https://huggingface.co/mrfakename/GLM-5.3-Flash-abliterated-GGUF
