# LinaTea/Qwen3.5-4B-Fix

## Resumen

Qwen3.5-4B-Fix es un ajuste fino supervisado (SFT) del checkpoint denso Qwen/Qwen3.5-4B, publicado por el usuario LinaTea. El objetivo del modelo no es ampliar capacidades, sino corregir un fallo de formato del checkpoint base: en modo *thinking*, el modelo original dejaba la respuesta final dentro del bloque `</think>` en lugar de emitirla después del cierre. Este ajuste repara ese comportamiento mediante LoRA fusionado sobre `Qwen3_5ForConditionalGeneration`, preservando la torre de visión.

Arquitectónicamente es un transformer denso multimodal (visión-lenguaje) de 4.539.265.536 parámetros reales según safetensors, de los cuales aproximadamente 4.2B corresponden al modelo de lenguaje y el resto a la torre de visión. Soporta inglés y chino, y se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial.

Su relevancia es práctica: para pipelines que dependen de separar razonamiento y respuesta (evaluación automática, parsing de salidas, agentes que consumen el bloque final), el checkpoint base generaba salidas mal formadas. Este modelo corrige ese defecto con un coste de entrenamiento mínimo y sin alterar el resto del comportamiento. Es un modelo pequeño (4B) apto para GPU de consumo, con cuantizaciones GGUF disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión-lenguaje), `Qwen3_5ForConditionalGeneration` |
| Parametros totales | 4.539.265.536 (aprox. 4.2B LM + torre de visión) |
| Parametros activos | No aplica (modelo denso; el autor deprecó una versión MoE previa de 6.93B con 2 expertos top-1) |
| Longitud de contexto | No disponible en la información proporcionada (la model card oficial de Qwen3.5 recomienda presupuestos de salida de 32K–80K para tareas duras) |
| Tipos de cuantizacion | GGUF Q4_0, Q8_0, F16; mmproj F16 y Q8_0; pesos originales en bf16 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo principal, 25.4 GB); GGUF en repo separado |

## Arquitectura y entrenamiento

El modelo parte del checkpoint denso Qwen3.5-4B, un transformer multimodal que combina un modelo de lenguaje de ~4.2B parámetros con una torre de visión. El ajuste se realizó mediante LoRA SFT con `r=16`, `alpha=32` y configuración all-linear, fusionado directamente en los pesos de `Qwen3_5ForConditionalGeneration`; la torre de visión se conserva intacta. El entrenamiento usó `completion_only_loss=True`, una época, `max_length=2048` y precisión bf16.

El dataset consta de 16.966 pares prompt/completion generados por el profesor DeepSeek-Flash sobre el split de entrenamiento de GSM8K y los splits dev/val de MMLU. Solo se conservaron las respuestas que pasaban el verificador automático, y se eliminó cualquier prompt presente en splits `*_test` para evitar contaminación. Cada prompt se presenta en dos formatos: con *thinking* y sin *thinking*. La innovación es acotada pero concreta: el modelo aprende a emitir `</think>` y colocar la respuesta final después del cierre, corrigiendo el fallo del checkpoint base.

## Capacidades

- Generación de texto y razonamiento en modo *thinking* y no-*thinking*, con separación correcta entre bloque de razonamiento y respuesta final.
- Razonamiento matemático y resolución de problemas tipo GSM8K.
- Conocimiento general y respuesta a preguntas tipo MMLU.
- Procesamiento de imágenes y vídeo a través de `AutoProcessor` (preprocesadores de imagen y vídeo incluidos).
- Conversación multi-turno mediante plantilla de chat (`apply_chat_template`) con `enable_thinking` configurable.
- Multilingüe limitado a inglés y chino.
- No se documenta soporte explícito de tool calling, function calling ni uso como agente multi-paso en la información disponible.

## Casos de uso

- Evaluación automática de razonamiento matemático: el modelo emite la respuesta final fuera del bloque `</think>`, lo que permite parsear la salida con una expresión regular simple en lugar de heurísticas frágiles sobre el contenido del razonamiento.
- Pipelines de *chain-of-thought* auditable: al separar limpiamente razonamiento y respuesta, se puede registrar el bloque de pensamiento para auditoría y consumir solo la respuesta final en el sistema downstream.
- Asistente conversacional ligero en inglés o chino: con 4B parámetros cabe en GPU de consumo y puede servir respuestas multi-turno en aplicaciones de soporte o productividad.
- Análisis de documentos con imágenes: la torre de visión permite extraer información de capturas, diagramas o fotogramas de vídeo pasados por `AutoProcessor`.
- Prototipado e investigación en SFT: el modelo sirve como referencia de cómo un ajuste LoRA mínimo corrige un fallo de formato sin reentrenar el modelo completo.
- Despliegue en local con llama.cpp u Ollama: las cuantizaciones GGUF Q4_0 y Q8_0 permiten ejecución en hardware modesto para pruebas y demos.
- Generación de datos sintéticos en inglés/chino: útil como generador auxiliar en pipelines de destilación o aumento de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el objetivo del SFT fue el formato de salida, no una nueva evaluación de capacidades, y que no se reevaluó el modelo con el presupuesto oficial de 32K–80K tokens de salida.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9–10 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 12–16 GB para contextos moderados.
- VRAM estimada en GGUF Q8_0: en torno a 5–6 GB; en Q4_0: en torno a 3–4 GB, más el proyector de visión (mmproj).
- GPU recomendadas: A100 o H100 para despliegue en producción con contextos largos; RTX 4090, RTX 3090 o RTX 4080 para inferencia local en bf16.
- GPU de consumo: cabe en tarjetas de 8 GB o más usando cuantización Q4_0 o Q8_0 con llama.cpp.
- Opciones de despliegue: transformers (con `device_map="auto"` y `dtype="bfloat16"`), llama.cpp y Ollama mediante los GGUF publicados. No se documenta compatibilidad explícita con vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| LinaTea/Qwen3.5-4B-Fix | 4.54B | No disponible | Texto + visión | Apache-2.0 | SFT que corrige el formato de `</think>` |
| Qwen/Qwen3.5-4B (base) | ~4.2B LM + visión | No disponible | Texto + visión | Apache-2.0 | Checkpoint original; fallo de respuesta dentro del bloque de pensamiento |
| Versión MoE previa del mismo repo (deprecada) | 6.93B (2 expertos top-1) | No disponible | Texto + visión | Apache-2.0 | Error de *upcycling*; sin ganancia de velocidad; reemplazada por el modelo denso |

No se dispone de datos de benchmarks que permitan comparar rendimiento cuantitativo con alternativas de la misma categoría.

## Limitaciones y advertencias

- El ajuste se centró en el formato de salida; las capacidades no se reevaluaron con el presupuesto oficial de 32K–80K tokens, por lo que el rendimiento en tareas duras puede diferir del checkpoint base.
- Riesgo de alucinación inherente a un modelo de 4B, especialmente en conocimiento factual y matemáticas complejas.
- Las cuantizaciones Q4_0 y Q8_0 son aproximaciones con pérdida; el autor recomienda F16 como referencia.
- Idiomas limitados a inglés y chino; no hay soporte documentado de castellano.
- No se documenta soporte de tool calling ni de agentes multi-paso, lo que limita su uso en pipelines agénticos.
- El repositorio anterior contenía un MoE de 6.93B que fue reemplazado; verificar la versión descargada para no usar pesos obsoletos.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-4B por si añaden restricciones adicionales.
- El modelo tiene 91 descargas y 1 like, lo que indica validación comunitaria muy limitada; no se recomienda para producción crítica sin evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LinaTea/Qwen3.5-4B-Fix
- GGUF y proyector de visión: https://huggingface.co/LinaTea/Qwen3.5-4B-Fix-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
