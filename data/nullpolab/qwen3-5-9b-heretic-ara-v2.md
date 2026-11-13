# NullpoLab/Qwen3.5-9B-Heretic-ARA-v2

## Resumen

Qwen3.5-9B-Heretic-ARA-v2 es un modelo derivado de Qwen/Qwen3.5-9B, publicado por NullpoLab, en el que se ha aplicado una técnica de "abliteración" (eliminación de la dirección de rechazo en el espacio de activaciones) mediante la herramienta Heretic v2.2.0.dev0, concretamente con su método por defecto Arbitrary-Rank Ablation (ARA). El objetivo declarado es reducir drásticamente la tasa de rechazos del modelo base: según la model card, pasa de 100/100 rechazos a 5/100 sobre el conjunto `mlabonne/harmful_behaviors`, con una divergencia KL de 0,0248 medida sobre `mlabonne/harmless_alpaca`.

El modelo conserva la arquitectura y el pipeline del base: es un transformer multimodal de tipo image-text-to-text con 9.409.813.744 parámetros totales (9,41 mil millones) y pesos en safetensors, empaquetado para la librería `transformers`. El repositorio ocupa 18,8 GB, lo que corresponde a pesos en precisión de 16 bits.

Su relevancia es doble: por un lado, sirve como caso de estudio reproducible de las técnicas modernas de abliteración de rango arbitrario sobre un modelo multimodal reciente; por otro, ofrece una variante sin filtrado de rechazo para investigación sobre alineación, escritura creativa y evaluación de sesgos. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5-9B; detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors de 16 bits) |
| Idiomas soportados | no disponible (la model card menciona evaluacion solo en ingles y advertencia sobre japones) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo no se ha entrenado desde cero: es un fine-tune por modificación de pesos sobre Qwen/Qwen3.5-9B. La intervención consiste en una abliteración de rango arbitrario (ARA) aplicada entre las capas 14 y 22 del transformer, con los siguientes hiperparámetros publicados: `start_layer_index` = 14, `end_layer_index` = 22, `preserve_good_behavior_weight` = 0,1656, `steer_bad_behavior_weight` = 0,0003, `overcorrect_relative_weight` = 0,9852 y `neighbor_count` = 7. ARA generaliza la abliteración clásica de dirección única permitiendo proyectar fuera un subespacio de rango arbitrario en lugar de un solo vector, lo que en teoría reduce el daño colateral sobre capacidades del modelo.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni sobre si hubo etapas de RLHF o DPO en el modelo base. Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal. El único dato cuantitativo de preservación de comportamiento es la divergencia KL de 0,0248 frente al base sobre 100 prompts de `mlabonne/harmless_alpaca`, que indica una desviación moderada pero no trivial de la distribución original.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3.5-9B.
- Procesamiento de imagen y texto de entrada (pipeline `image-text-to-text`), es decir, capacidad multimodal de entrada.
- Modo de razonamiento con bloque de pensamiento (`thinking`), tal como se deduce de la nota de evaluación que cierra el bloque con `</think>\n\n`.
- Reducción drástica del comportamiento de rechazo: 5/100 rechazos frente a 100/100 del modelo original en el conjunto de evaluación citado.
- Capacidades de código, matemáticas y tool calling: no disponibles de forma explícita en la información proporcionada; deben asumirse las del modelo base, sin verificación publicada.
- Soporte multilingüe: no disponible; la evaluación de rechazos se hizo solo en inglés.

## Casos de uso

- Investigación sobre alineación y abliteración: permite comparar el comportamiento del modelo base y de la variante ablacionada sobre los mismos prompts, usando la métrica de rechazo y la divergencia KL publicadas como línea base reproducible.
- Escritura creativa sin filtrado: útil para generar ficción, diálogo o narrativa con temáticas sensibles donde el modelo base rechazaría la petición, con la ventaja de mantener la coherencia conversacional de un modelo de 9B.
- Evaluación de sesgos y robustez: al eliminar la capa de rechazo, expone de forma más directa los sesgos latentes del modelo base, lo que facilita su medición en pipelines de auditoría.
- Análisis multimodal de documentos: al conservar el pipeline image-text-to-text, puede emplearse para extraer y comentar información de imágenes combinada con instrucciones de texto.
- Generación de datos sintéticos para investigación: producción de respuestas a prompts que el modelo original rechazaría, útil para construir datasets de estudio sobre seguridad y filtrado.
- Despliegue en entornos controlados de laboratorio: con 9,41 mil millones de parámetros y pesos en safetensors de 16 bits, es viable en una GPU de 24 GB con cuantización a 8 bits o en varias GPU para precisión completa.

## Benchmarks y rendimiento

| Metrica | Este modelo | Qwen/Qwen3.5-9B |
|---|---|---|
| Tasa de rechazo (mlabonne/harmful_behaviors, 100 prompts) | 5/100 | 100/100 |
| Divergencia KL (mlabonne/harmless_alpaca, 100 prompts) | 0,0248 | 0 (por definición) |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 24 GB o más.
- Cuantización a 8 bits: alrededor de 10 GB de pesos, viable en GPU de 16-24 GB.
- Cuantización a 4 bits: alrededor de 5-6 GB de pesos, viable en GPU consumer de 8-12 GB, aunque no se publican ficheros GGUF en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100 para precisión completa y serving concurrente; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 para cuantización 8 bits.
- Opciones de despliegue: `transformers` (librería declarada), más `vLLM` o `TGI` si se convierte a un formato compatible; `llama.cpp`/Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3.5-9B-Heretic-ARA-v2 | 9,41 B | no disponible | Si (image-text-to-text) | Apache 2.0 | Abliterado con ARA (Heretic v2) |
| Qwen/Qwen3.5-9B | 9,41 B (mismo tamano) | no disponible | Si (image-text-to-text) | Apache 2.0 | Modelo base alineado, rechaza 100/100 |
| Otras variantes abliteradas de la familia Qwen | no disponible | no disponible | no disponible | no disponible | Abliteracion clasica de direccion unica |

La comparación directa más fiable es con el propio modelo base, dado que comparten arquitectura y pesos de partida; la diferencia medible es la tasa de rechazo y la divergencia KL. No se dispone de datos de benchmarks de capacidad para comparar con alternativas de terceros.

## Limitaciones y advertencias

- La abliteración elimina la capa de rechazo, pero no garantiza la eliminación de sesgos ni de contenido dañino; el modelo puede producir respuestas ofensivas, incorrectas o peligrosas sin aviso.
- La divergencia KL de 0,0248 indica una desviación medible respecto al base; pueden aparecer degradaciones en tareas que el modelo original resolvía correctamente, especialmente en razonamiento y código.
- La evaluación de rechazos se realizó solo con prompts en inglés; el comportamiento en castellano, japonés u otros idiomas no está verificado.
- Riesgo de alucinación no cuantificado en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor declara que el modelo está pensado para investigación y escritura creativa; el uso en producción con contenido sensible requiere revisión legal y de política propia.
- El repositorio no incluye cuantizaciones GGUF ni versiones optimizadas, lo que limita el despliegue en hardware consumer sin trabajo adicional de conversión.
- No hay información sobre la longitud de contexto soportada, dato crítico para planificar aplicaciones de contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NullpoLab/Qwen3.5-9B-Heretic-ARA-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Repositorio Heretic: https://github.com/p-e-w/heretic
- Pull request de ARA en Heretic: https://github.com/p-e-w/heretic/pull/211
- Dataset de evaluación de rechazos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset de evaluación de divergencia KL: https://huggingface.co/datasets/mlabonne/harmless_alpaca
