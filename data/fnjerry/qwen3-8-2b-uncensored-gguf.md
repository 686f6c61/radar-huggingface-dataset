# fnjerry/Qwen3.8-2B-Uncensored-GGUF

## Resumen

Qwen3.8-2B-Uncensored-GGUF es una cuantización en formato GGUF (Q4_K_M) del modelo empero-ai/Qwen3.8-2B, un modelo de 2B parámetros obtenido por destilación del Qwen3.8 2.4T A95B sobre la arquitectura Qwen3.5-2B. El autor, fnjerry, publica esta versión "abliterated": se ha eliminado la dirección de rechazo mediante la herramienta Heretic v1.4.0, de modo que el modelo no rechaza peticiones dañinas o ilegales. Está pensado para ejecución local en CPU, teléfonos y placas SBC.

El modelo conserva la arquitectura híbrida de Qwen3.5, que combina capas Gated DeltaNet (atención lineal) con capas de atención completa, y mantiene el modo de razonamiento: las respuestas se abren con un bloque de pensamiento (`think`). El archivo publicado ocupa 1,27 GB en Q4_K_M y no incluye proyector de visión ni cabeza MTP (decodificación especulativa), ya que la fuente abliterada no la incorpora.

Es relevante ahora por dos motivos: por un lado, demuestra que es posible ejecutar un modelo de razonamiento de 2B en hardware muy limitado (31,7 t/s en CPU de Apple Silicon según el autor); por otro, ilustra los riesgos del ecosistema de modelos "uncensored", que eliminan salvaguardas manteniendo la licencia Apache-2.0 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 (Gated DeltaNet + atención completa) |
| Parametros totales | 1.881.825.088 (~1,88B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso fija `-c 2048`) |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada de Qwen3.5-2B) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.5-2B: un transformer híbrido que intercala capas Gated DeltaNet (una forma de atención lineal con estado recurrente) con capas de atención completa. Esta combinación reduce el coste de memoria y cómputo en contextos largos frente a un transformer denso equivalente. El modelo base empero-ai/Qwen3.8-2B se obtuvo por destilación de conocimiento desde Qwen3.8 2.4T A95B (un modelo MoE de 2,4 billones de parámetros totales y 95B activos) hacia la arquitectura de 2B de Qwen3.5.

Sobre esa destilación se aplicó una abliteración con Heretic v1.4.0, que elimina la dirección de rechazo en el espacio de activaciones. El resultado se convirtió a GGUF con `convert_hf_to_gguf.py --no-mtp`, descartando la cabeza MTP (multi-token prediction) porque la fuente abliterada no la incluía, y se cuantizó a Q4_K_M. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la destilación.

## Capacidades

- Generación de texto conversacional con plantilla de chat embebida.
- Modo de razonamiento: las respuestas comienzan con un bloque `think` antes de la respuesta final.
- Razonamiento multi-paso básico, heredado de la destilación desde un modelo mayor.
- Capacidad multilingüe: no documentada en la información disponible.
- Sin soporte de visión (el GGUF es solo texto, sin proyector).
- Sin decodificación especulativa (cabeza MTP eliminada en la conversión).
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes: no documentado; el tamaño y la ausencia de MTP limitan su uso en pipelines agénticos complejos.
- Ejecución en CPU sin GPU, incluidos dispositivos móviles y SBC.

## Casos de uso

- Asistente conversacional en móvil: con 1,27 GB en Q4_K_M y ejecución solo CPU, se puede integrar en apps tipo PocketPal AI para chats privados sin conexión; el modelo cabe en la memoria de un teléfono de gama media-alta.
- Prototipado de razonamiento en local: el bloque `think` permite experimentar con cadenas de razonamiento en hardware sin GPU, útil para docencia e investigación sobre modelos pequeños.
- Evaluación de seguridad y alineación: al ser un modelo abliterado, sirve como caso de estudio controlado para medir qué capacidades y sesgos persisten tras eliminar la dirección de rechazo, siempre en entornos aislados.
- Generación de texto creativo sin filtros: escritura de ficción, guiones o contenido que los modelos alineados suelen rechazar por precaución; requiere revisión humana por el riesgo de contenido dañino.
- Despliegue en placas SBC y dispositivos edge: con llama.cpp y una compilación reciente (b1-0379a19 o posterior), puede correr en Raspberry Pi de gama alta o similares para tareas de generación de texto de baja latencia.
- Pruebas de pipelines llama.cpp: útil para validar el soporte de la arquitectura `qwen35` (Gated DeltaNet) en versiones nuevas de llama.cpp y en herramientas derivadas.
- Generación de texto por lotes en CPU: para tareas de etiquetado o resumen de textos cortos donde no se justifica una GPU, con `-n 512` y contexto de 2048 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado por el autor es una velocidad de generación de 31,7 t/s en CPU de Apple Silicon, verificada con llama.cpp.

## Requisitos de hardware

- VRAM estimada: no aplica para CPU; en GPU, el archivo Q4_K_M de 1,27 GB requiere aproximadamente 1,5-2 GB de VRAM incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050, RTX 4060); también A100/H100 si se busca throughput, aunque el modelo está sobredimensionado para ellas.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más de VRAM.
- Despliegue: llama.cpp (versión b1-0379a19 o posterior, obligatoria por el soporte de `qwen35`), PocketPal AI (build compatible con `qwen35`). No se menciona soporte en vLLM, TGI ni Ollama.
- Latencia y throughput: 31,7 t/s de generación en CPU de Apple Silicon según el autor; no hay datos para GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-2B-Uncensored-GGUF (este) | ~1,88B | no disponible | Apache-2.0 | GGUF Q4_K_M | Abliterado, sin visión ni MTP |
| empero-ai/Qwen3.8-2B | no disponible | no disponible | no disponible | safetensors | Modelo base destilado, con alineación original |
| Qwen/Qwen3.5-2B | no disponible | no disponible | Apache-2.0 | safetensors | Modelo original de Alibaba Qwen, alineado |
| insraq/Qwen3.5-2B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated | no disponible | no disponible | no disponible | safetensors | Fuente abliterada con receta reproducible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin salvaguardas: la abliteración elimina la dirección de rechazo, por lo que responderá a peticiones dañinas o ilegales. El propio autor lo restringe a investigación y uso personal.
- Riesgo elevado de alucinación: al ser un modelo de 2B destilado, su fiabilidad factual es limitada, especialmente en el bloque de razonamiento.
- Licencia Apache-2.0 heredada: permite uso comercial según los términos de la licencia, pero el comportamiento del modelo puede generar responsabilidad legal al autor del despliegue; conviene evaluar el encaje ético y legal antes de producción.
- Contexto no documentado: el ejemplo de uso fija 2048 tokens; no se garantiza un contexto mayor en esta cuantización.
- Idiomas no documentados: no hay información sobre calidad multilingüe; el rendimiento en castellano es desconocido.
- Sin visión ni decodificación especulativa: no apto para tareas multimodales ni para optimizaciones de latencia basadas en MTP.
- Dependencia de versión: requiere llama.cpp b1-0379a19 o posterior; versiones antiguas no cargarán la arquitectura `qwen35`.
- Sin datos de benchmarks: no hay evidencia publicada de calidad frente a alternativas, lo que dificulta justificar su elección en producción.

## Enlaces

- Hugging Face: https://huggingface.co/fnjerry/Qwen3.8-2B-Uncensored-GGUF
- Modelo base destilado: https://huggingface.co/empero-ai/Qwen3.8-2B
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-2B
- Fuente abliterada: https://huggingface.co/insraq/Qwen3.5-2B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Heretic (herramienta de abliteración): no disponible en la información proporcionada
- PocketPal AI: no disponible en la información proporcionada
