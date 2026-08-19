# Ishowbackup/Muse-Glimmer-30B-Abliterated-MLX-3bit-AWQ

## Resumen

Muse-Glimmer-30B-Abliterated-MLX-3bit-AWQ es una versión cuantizada a 3 bits con AWQ (activation-aware weight quantization) en formato MLX del modelo Muse-Glimmer-30B, originalmente desarrollado por Meta Superintelligence Labs. El usuario Ishowbackup ha empaquetado esta variante a partir del modelo base abliterado por Blackfrost-Research, que elimina los comportamientos de rechazo mediante un proceso de modificación de pesos. El resultado es un modelo multimodal (imagen-texto) y agéntico, optimizado para ejecutarse en Apple Silicon con un consumo de memoria de aproximadamente 15 GB.

La relevancia de este modelo radica en su capacidad para ejecutar un sistema de 30B con razonamiento profundo y visión en hardware local de Apple, sin necesidad de GPUs dedicadas. Su arquitectura `muse_glimmer` es densa, con 52 capas, hidden size de 6656, atención con ventana deslizante y una torre de visión. Ofrece una ventana de contexto de 131 072 tokens, lo que lo hace adecuado para tareas que requieren contexto largo. No obstante, existe una discrepancia entre los 30B declarados en la model card y los 5 344 355 328 parámetros reportados en el archivo safetensors, que debe tenerse en cuenta al evaluar el modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `muse_glimmer` — densa, 52 capas, hidden 6656, GQA (32 q / 2 kv), sliding-window attention, + vision tower |
| Parametros totales | 5 344 355 328 (según safetensors; la model card indica 30B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131 072 |
| Tipos de cuantizacion | 3-bit AWQ (MLX) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura `muse_glimmer` es un transformer denso con 52 capas, hidden size de 6656 y atención con ventana deslizante. Emplea Grouped Query Attention (GQA) con 32 cabezas de consulta y 2 de clave/valor, lo que reduce el coste de memoria durante la inferencia. Además, incorpora una torre de visión que le permite procesar entradas de imagen además de texto, lo que lo convierte en un modelo multimodal.

No se dispone de información detallada sobre el entrenamiento original del modelo (número de tokens, composición del dataset, uso de RLHF o DPO). La model card indica que el modelo base es `meta-models/Muse-Glimmer-30B` de Meta, con licencia Apache-2.0. La transformación principal aplicada es el proceso de "abliteration" de Blackfrost, que modifica los pesos para eliminar los comportamientos de rechazo, manteniendo las capacidades multimodales intactas. No se han publicado detalles técnicos sobre este proceso.

## Capacidades

- Generación de texto y razonamiento profundo: el modelo está diseñado como un "heavy thinker", devolviendo el razonamiento por separado de la respuesta final.
- Procesamiento multimodal: gracias a la torre de visión, puede aceptar imágenes como entrada junto con texto (pipeline `image-text-to-text`).
- Configuración de intensidad de razonamiento: permite ajustar el nivel de razonamiento mediante una línea de sistema (`Reasoning strength: low/medium/high/xhigh`).
- Conversacional: soporta interacciones multi-turno.
- Agéntico y on-device: orientado a ejecutarse localmente en dispositivos Apple, con capacidades para tareas de agente.
- Sin rechazos: al ser abliterated, no muestra comportamientos de negativa ante peticiones (0/450 refusals en el benchmark R1-HARMFUL-BENCH-450).

## Casos de uso

- Asistente personal local en Mac: al ejecutarse con MLX, puede desplegarse en un Mac con Apple Silicon sin conexión, ofreciendo respuestas con razonamiento profundo.
- Análisis y descripción de imágenes: su torre de visión permite procesar imágenes y generar descripciones o responder preguntas sobre ellas, útil en aplicaciones de accesibilidad o documentación visual.
- Generación de código con razonamiento: puede escribir código (por ejemplo, "Write a binary search in Python") y explicar el proceso paso a paso, adecuado para entornos de desarrollo en Mac.
- Chatbot de investigación sin restricciones: al no tener rechazos, puede explorar temas sensibles en entornos controlados de investigación, aunque con las advertencias éticas correspondientes.
- Prototipado rápido de aplicaciones de IA en Apple Silicon: la integración con `mlx_lm.server` (compatible con OpenAI) permite montar un servidor local para pruebas y desarrollo.
- Agentes autónomos en dispositivos Apple: su naturaleza agéntica y su tamaño reducido (15 GB) lo hacen viable para ejecutar agentes en hardware de consumo, como un Mac mini o MacBook Pro.

## Benchmarks y rendimiento

Solo se ha publicado un benchmark específico de rechazo, medido sobre el modelo abliterado:

| Benchmark | Resultado |
|---|---|
| R1-HARMFUL-BENCH-450 — True refusal (harmful, n=300) | 0 / 300 = 0.0% |
| R1-HARMFUL-BENCH-450 — True refusal (full 450) | 0 / 450 = 0.0% |
| R1-HARMFUL-BENCH-450 — Substring-harmful | 0 / 300 |
| R1-HARMFUL-BENCH-450 — Substring-all | 2 / 450 (XSTest false positives) |
| R1-HARMFUL-BENCH-450 — Errors | 0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El modelo está diseñado exclusivamente para Apple Silicon (M1/M2/M3/M4) y utiliza el framework MLX.
- Tamaño del repositorio: 16.0 GB; la cuantización 3-bit AWQ reduce el modelo a aproximadamente 15 GB, por lo que se recomienda un Mac con al menos 16 GB de RAM unificada.
- No es compatible con GPUs NVIDIA ni con CUDA; el formato MLX es específico de Apple.
- Opciones de despliegue: `mlx_lm.generate` para generación puntual, `mlx_lm.server` para un servidor compatible con OpenAI, y LM Studio (runtime MLX) para uso gráfico.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables en la información disponible.

## Limitaciones y advertencias

- Al ser abliterated, el modelo no muestra rechazos ante peticiones dañinas, lo que implica un riesgo de uso indebido. Debe emplearse con responsabilidad y en entornos controlados.
- No se dispone de información sobre sesgos específicos del modelo, pero al ser un modelo de lenguaje grande, es probable que herede sesgos de sus datos de entrenamiento.
- Riesgo de alucinaciones: no hay datos concretos, pero es un riesgo inherente a los modelos generativos.
- Discrepancia en el número de parámetros: la model card indica 30B, pero el archivo safetensors reporta 5 344 355 328 parámetros. Esta diferencia debe aclararse antes de usarlo en producción.
- Limitación de idiomas: no se especifican los idiomas soportados; se asume un enfoque multilingüe, pero no está confirmado.
- Restricciones de hardware: solo funciona en Apple Silicon; no es portable a otros entornos sin re-cuantización.
- La licencia Apache-2.0 permite uso comercial, pero el proceso de abliteration puede plantear cuestiones éticas y legales en ciertos contextos.

## Enlaces

- [Modelo en HuggingFace (Ishowbackup)](https://huggingface.co/Ishowbackup/Muse-Glimmer-30B-Abliterated-MLX-3bit-AWQ)
- [Modelo base abliterado (Blackfrost-Research)](https://huggingface.co/Blackfrost-Research/Muse-Glimmer-30B-Abliterated-BF16)
- [Modelo original de Meta (meta-models/Muse-Glimmer-30B)](https://huggingface.co/meta-models/Muse-Glimmer-30B)
