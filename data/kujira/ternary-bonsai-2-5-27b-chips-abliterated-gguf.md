# Kujira/Ternary-Bonsai-2.5-27B-CHiPS-Abliterated-GGUF

## Resumen

Ternary-Bonsai-2.5-27B-CHiPS-Abliterated-GGUF es una modificación del modelo Ternary Bonsai 2.5 27B de Prism ML, publicada por el usuario Kujira. Se trata de un derivado de Qwen3.8-27B (Alibaba Cloud) que Prism ML convirtió a pesos ternarios (Q2_0) para su ejecución eficiente en llama.cpp, y al que Kujira ha aplicado una técnica de edición denominada CHiPS (Causal Head-isolated Projection Steering) para reducir el comportamiento de rechazo (refusal) del modelo original.

El cambio es quirúrgicamente pequeño: de los 866 tensores del archivo, solo uno se reescribe parcialmente. Concretamente, se modifica la proyección de salida de la capa de atención lineal 33 (`blk.33.ssm_out.weight`), afectando a 1.024 de sus 6.144 columnas correspondientes a la cabeza de atención 16. El resto del archivo, incluida la cabeza de borrador MTP para decodificación especulativa, es byte-idéntico al original.

La relevancia de esta ficha radica en que documenta un caso de "abliteración" sin entrenamiento aplicada sobre un modelo cuantizado ternario, un formato poco habitual (Q2_0 con niveles −1, 0, +1 y +2) que requiere builds recientes de llama.cpp con soporte de runtime de activaciones Hadamard. El autor advierte que es una versión preview sin resultados medidos y que no cuenta con el respaldo de Prism ML ni del equipo Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención lineal (SSM) y atención completa; incluye cabeza MTP para decodificación especulativa |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (valor sugerido en el ejemplo de uso con `-c 32768`); no se especifica el máximo nativo |
| Tipos de cuantizacion | Q2_0 ternario (niveles −1, 0, +1 y +2); el tensor editado deja de ser estrictamente ternario (1,2 % de sus valores usan el nivel +2) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es Ternary Bonsai 2.5 27B de Prism ML, construido a partir de Qwen3.8-27B. La arquitectura combina capas de atención lineal (referidas como SSM en la model card, con tensores `ssm_out`) y capas de atención convencional, e incorpora una cabeza de borrador MTP (Multi-Token Prediction) en el bloque `blk.64` destinada a decodificación especulativa. Los pesos se empaquetan en formato ternario Q2_0, lo que reduce el archivo a 7,91 GB para 27,3 mil millones de parámetros.

La edición aplicada por Kujira emplea CHiPS (Causal Head-isolated Projection Steering), un método que identifica unas pocas cabezas de atención por su efecto causal sobre un comportamiento concreto y reduce la componente de su salida que se alinea con una dirección determinada, sin reentrenar el modelo. En este caso, el cambio completo se limita a una sola cabeza de una capa de atención lineal (capa 33, cabeza 16). Según la model card, la receta exacta no está publicada. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno.
- Modo de razonamiento (thinking) con niveles de esfuerzo `xhigh` (por defecto) y `medium` (respuestas más cortas), según la recomendación de muestreo de Prism ML.
- Decodificación especulativa mediante la cabeza MTP incluida en el archivo (aunque no probada con la edición).
- Capacidad multimodal potencial: el modelo base admite proyector de visión (`mmproj`), pero esta versión no incluye proyector y las imágenes no se han probado.
- Comportamiento de rechazo reducido respecto al original (abliteración), lo que amplía el rango de peticiones que el modelo atiende.
- Tool calling: no probado en esta versión según la model card.

## Casos de uso

- Investigación sobre alineación y seguridad: permite estudiar cómo una edición mínima en una sola cabeza de atención altera la tasa de rechazo, comparando directamente con el archivo original byte-idéntico en el resto de tensores.
- Evaluación de técnicas de steering sin entrenamiento: sirve como caso práctico para reproducir o analizar el método CHiPS sobre modelos cuantizados, midiendo el efecto de una intervención de 1.024 columnas en un tensor.
- Experimentación con cuantización ternaria: útil para desarrolladores que quieran probar el rendimiento de Q2_0 en llama.cpp con un modelo de 27B que ocupa menos de 8 GB en disco.
- Pruebas de decodificación especulativa: permite medir la tasa de aceptación de la cabeza MTP cuando el modelo principal ha sido editado, un escenario relevante para optimizar latencia en inferencia local.
- Generación de texto sin restricciones en entornos controlados: para investigadores que necesiten un modelo que no rechace peticiones y que asuman la responsabilidad de filtrar la salida.
- Benchmarking de derivados abliterados: comparar perplejidad y capacidades frente al original para cuantificar el coste de la edición sobre el rendimiento general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados medidos todavía: ni tasas de rechazo, ni capacidad, ni perplejidad se han comparado con el archivo original. Tampoco se han probado imágenes, contextos largos ni tool calling.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF pesa 7,91 GB; con overhead de contexto y KV cache para 32.768 tokens, se estima un consumo en torno a 10-14 GB de VRAM, aunque no se proporciona una cifra oficial.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPUs consumer con 16 GB o más (RTX 4080, RTX 4090, RTX 5090) y en GPUs de datacenter (A100, H100) con holgura.
- Cabe en consumer GPU: sí, previsiblemente en modelos con 16 GB o más de VRAM, dado el tamaño del archivo.
- Opciones de despliegue: llama.cpp (build b11556 o posterior, con soporte de runtime de activaciones Hadamard) mediante `llama-server`; el autor remite a Bonsai-demo para decodificación especulativa con MTP y otros runtimes.
- Latencia y throughput estimados: no disponible. El autor advierte que la cabeza MTP no se ha reentrenado y que la decodificación especulativa podría aceptar menos tokens borrador, sin cuantificar el impacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ternary-Bonsai-2.5-27B-CHiPS-Abliterated (este) | 27,3 B | 32.768 (sugerido) | GGUF Q2_0 | Apache 2.0 | Edición de una cabeza; sin benchmarks publicados |
| Ternary-Bonsai-2.5-27B (Prism ML, original) | 27,3 B | no disponible | GGUF Q2_0, PTQ1_0, PQ2_0 | Apache 2.0 | Modelo base sin abliterar; incluye proyector de visión |
| Qwen3.8-27B (Alibaba Cloud) | 27 B | no disponible | safetensors | Apache 2.0 | Modelo denso original en precisión completa |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Sin resultados medidos: no hay comparación de tasas de rechazo, capacidad ni perplejidad frente al original.
- La cabeza MTP no se ha reentrenado; la decodificación especulativa podría aceptar menos tokens borrador con el modelo editado (no probado).
- Solo se ofrece el archivo `Q2_0-mtp`; la edición no es trasladable tal cual a los empaquetados `PTQ1_0` ni `PQ2_0`, que solo admiten valores ternarios.
- El tensor editado deja de ser estrictamente ternario (1,2 % de sus valores usan el nivel +2), aunque sigue siendo un GGUF Q2_0 estándar para llama.cpp.
- Imágenes, contextos largos y tool calling no han sido probados en esta versión.
- Requiere llama.cpp b11556 o posterior; builds antiguos cargan Q2_0 sin aviso y producen salida basura.
- El modelo puede generar contenido dañino, ofensivo o inexacto; el autor lo destina a investigación y advierte de la responsabilidad del usuario y de la necesidad de añadir salvaguardas antes de usarlo con terceros.
- Riesgo de alucinación y sesgos: no documentados específicamente en esta versión; se remite a las limitaciones del modelo original.
- Licencia Apache 2.0 permite uso comercial, pero el NOTICE original debe conservarse y se recomienda revisar las implicaciones de desplegar un modelo abliterado en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kujira/Ternary-Bonsai-2.5-27B-CHiPS-Abliterated-GGUF
- Modelo base (Prism ML): https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- Archivo original Q2_0-mtp: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF/blob/main/Ternary-Bonsai-2.5-27B-Q2_0-mtp.gguf
- Modelo Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Artículo sobre CHiPS: https://balaena01.github.io/chips-steering/
- Repositorio gne (gguf-neuron-explorer): https://github.com/balaena01/gguf-neuron-explorer
- Demo de Bonsai: https://github.com/PrismML-Eng/Bonsai-demo
