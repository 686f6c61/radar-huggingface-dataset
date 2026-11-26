# moeshawky/qmd-query-expansion-LFM3-1.7B-INT8

## Resumen
QMD Query Expansion — LFM3 1.7B INT8 es un checkpoint derivado de LiquidAI/LFM3-1.7B, publicado por el usuario moeshawky, especializado en la expansión estructurada de consultas de búsqueda para el sistema QMD. El modelo no es un asistente conversacional: su función es transformar una consulta de usuario en varias formulaciones etiquetadas por canal de recuperación (`lex:`, `vec:`, `hyde:`), que alimentan un pipeline de búsqueda híbrida (BM25, búsqueda vectorial e HyDE). Está orientado a colecciones de conocimiento sobre psicología, ciencia del comportamiento e ingeniería social, aunque conserva utilidad para expansión de recuperación de propósito general.

El artefacto publicado es un modelo fusionado (no un adaptador LoRA) en formato safetensors INT8, con un total de 905.829.120 parámetros reales en pesos (el nombre comercial hace referencia a la familia 1.7B, pero el recuento efectivo de tensores es el indicado). El repositorio ocupa 2,6 GB. La model card documenta que el adaptador original era un LoRA (r=16, alpha=32, dropout=0.05) entrenado sobre LFM3-1.7B con 88 pasos en etapa 1 y eval loss 0.8024, fusionado después en el modelo base.

La relevancia actual reside en que es un componente especializado y ligero para pipelines RAG: sustituye la generación de expansiones por un modelo pequeño y determinista en su contrato de salida, reduciendo coste frente a usar un LLM grande para la misma tarea. Es, además, un ejemplo de artefacto con trazabilidad de procedencia (hash de pesos y revisiones de origen documentadas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de LFM3 (familia LiquidAI LFM3); requiere `trust_remote_code` y `custom_code` |
| Parametros totales | 905.829.120 (recuento real en safetensors) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | 4096 tokens (valor usado en el ejemplo de despliegue vLLM de la model card) |
| Tipos de cuantizacion | INT8 (8-bit, auto-round); el artefacto se publica cuantizado en INT8 |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | other (base LiquidAI/LFM3-1.7B con licencia `other`; adaptador original publicado como MIT) |
| Formato de pesos | safetensors (INT8), más `chat_template.jinja` y `tokenizer_config.json`; incluye `MERGE_PROVENANCE.json` |

## Arquitectura y entrenamiento
El modelo parte de LiquidAI/LFM3-1.7B, un transformer de la familia LFM3 de LiquidAI. Sobre esa base se entrenó un adaptador LoRA con rango 16, alpha 32 y dropout 0.05, cuyo estado de entrenador recuperable registra una etapa 1 de 88 pasos con eval loss 0.8024. Todos los 153 deltas LoRA fueron reconstruidos y fusionados en los tensores publicados; el resultado es un checkpoint fusionado y ejecutable directamente, sin paso de carga PEFT.

La model card distingue explícitamente entre el historial confirmado por el operador (entrenamiento específico de dominio sobre colecciones de psicología, ciencia del comportamiento e ingeniería social, cuyos datasets siguen existiendo pero cuyo manifiesto histórico completo no está en el repositorio) y la procedencia reconstruida del checkpoint (revisión del adaptador `5635d64a4bbc12194332334e46e0e359a73ef3c3`, fusionada sobre la revisión base `1da06bec6a819da10b54c67e5c90972b46d81871`). No se modifica ningún tensor respecto al checkpoint fusionado del adaptador: el hash SHA-256 declarado es `b611049d52f744e84db005a9d4013d860815b461063a21409adef2bc6fffccba`.

La única modificación respecto al adaptador fusionado es de plantilla de chat: el template de LFM3 abría por defecto un bloque `<think>` en el prompt, lo que producía un `</think>` huérfano al inicio de la completion y rompía el parser de líneas de QMD. Esta release cambia solo el valor por defecto de `enable_thinking` a `false`, dejando un par `<think></think>` vacío y equilibrado en el prompt; pasar `enable_thinking=true` explícitamente sigue habilitando el razonamiento.

## Capacidades
- Expansión de consultas de búsqueda en tres canales etiquetados: `lex:` (formulación léxica corta para BM25), `vec:` (reformulación semántica en lenguaje natural para búsqueda vectorial) e `hyde:` (pasaje de documento hipotético para recuperación HyDE).
- Contrato de salida estricto: una expansión por línea, consumida solo si empieza por `lex:`, `vec:` o `hyde:`.
- Especialización de dominio en psicología, ciencia del comportamiento e ingeniería social, con soporte declarado para expansión de recuperación de propósito general.
- Interfaz de thinking marker compatible con LFM3: modo razonamiento desactivable por defecto y reactivable con `enable_thinking=true`.
- Integración con backend HTTP de QMD mediante `QMD_LLM_BASE_URL` y `QMD_GENERATE_MODEL`.
- No se declaran capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni multimodalidad en la información disponible.

## Casos de uso
- Expansión de consultas en pipelines RAG sobre literatura de psicología: el modelo convierte una pregunta del usuario en variantes `lex:`, `vec:` e `hyde:` que alimentan recuperación híbrida BM25 + vectorial, mejorando el recall sobre terminología técnica del dominio.
- Búsqueda híbrida en bases de conocimiento de ciencia del comportamiento: las reformulaciones `vec:` permiten recuperar pasajes parafraseados que la búsqueda léxica no encontraría, manteniendo el coste bajo por el tamaño reducido del modelo.
- Recuperación HyDE en corpus de ingeniería social: las líneas `hyde:` generan pasajes hipotéticos que se indexan temporalmente para recuperar documentos reales con mayor solapamiento semántico.
- Sustitución de un LLM grande en la etapa de expansión de QMD: al ser un modelo de ~906M parámetros reales en INT8, reduce coste y latencia frente a usar un modelo generalista para generar las mismas expansiones etiquetadas.
- Despliegue local o en un único endpoint vLLM para servir expansión de consultas a un fork de QMD, configurando `QMD_LLM_BASE_URL` y `QMD_GENERATE_MODEL` apuntando al checkpoint servido.
- Evaluación y auditoría de procedencia de artefactos: el repositorio incluye `MERGE_PROVENANCE.json` con revisiones de origen y hash de pesos, útil para pipelines que exigen trazabilidad de modelos fusionados.
- Generación de variantes de consulta para sistemas de búsqueda en producción con `temperature=0.7` y `max_tokens=600`, sin gramática forzada ni stop sequence obligatoria.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se realiza ninguna afirmación de superioridad de dominio estadísticamente establecida; la orientación de dominio se presenta como intención de diseño y historial de entrenamiento confirmado, no como resultado medido.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 2,6 GB en INT8, lo que orienta a un consumo de memoria en el rango de pocos GB para pesos, más overhead de activaciones y contexto.
- GPU recomendadas: no disponibles en la información; el ejemplo de la model card usa `vllm serve ... --dtype float16 --max-model-len 4096`.
- Cabeza en GPU consumer: no confirmado por la model card; por tamaño de pesos INT8 (2,6 GB de repo) es plausible en GPUs consumer con suficiente VRAM, pero no se declara compatibilidad concreta.
- Opciones de despliegue: vLLM (`vllm serve moeshawky/qmd-query-expansion-LFM3-1.7B --dtype float16 --max-model-len 4096`), Transformers con `AutoModelForCausalLM`/`AutoTokenizer` y `trust_remote_code=True`, y backend HTTP de QMD vía `QMD_LLM_BASE_URL`/`QMD_GENERATE_MODEL`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moeshawky/qmd-query-expansion-LFM3-1.7B-INT8 | 905.829.120 (INT8) | 4096 (ejemplo vLLM) | sin benchmarks publicados | other (base LFM3) | Hugging Face, 0 descargas |
| LiquidAI/LFM3-1.7B (base) | no disponible en la información | no disponible | no disponible | other | Hugging Face |
| moeshawky/qmd-query-expansion-LFM3-1.7B (adaptador original) | no disponible | no disponible | no disponible | MIT (adaptador) | Hugging Face, tag `original-adapter` |
| tobil/qmd-query-expansion-1.7B-v2 | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables para estos modelos en la información proporcionada.

## Limitaciones y advertencias
- La salida es una expansión de consulta, no una respuesta: el consumidor debe parsear las líneas `lex:`/`vec:`/`hyde:` y aportar su propia capa de recuperación y síntesis.
- La especialización de dominio es una intención de uso e historial de entrenamiento, no una garantía medida sobre cada consulta de psicología o ingeniería social.
- La expansión de propósito general sigue soportada, pero la calidad depende de la especificidad de la consulta, como en cualquier modelo de expansión de ~1.7B.
- Riesgo de alucinación: las líneas `hyde:` son pasajes hipotéticos generados, no documentos reales; no deben presentarse como evidencia.
- No se declara lista de idiomas soportados; el comportamiento multilingüe no está documentado.
- Licencia: la redistribución del checkpoint fusionado queda sujeta a los términos de la licencia `other` del modelo base LiquidAI/LFM3-1.7B; revisarlos antes de redistribuir. El adaptador original era MIT, pero eso no rige el checkpoint fusionado.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del repositorio.
- El historial de entrenamiento de dominio no está completo en el repositorio; su ausencia no debe interpretarse como prueba de que no ocurrió, pero tampoco como garantía de rendimiento.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/moeshawky/qmd-query-expansion-LFM3-1.7B-INT8
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Adaptador original (tag `original-adapter` / branch `adapter`): https://huggingface.co/moeshawky/qmd-query-expansion-LFM3-1.7B
- Formato y contrato de entrenamiento QMD: https://huggingface.co/tobil/qmd-query-expansion-train-v2
- Modelo de referencia QMD: https://huggingface.co/tobil/qmd-query-expansion-1.7B-v2
- Fork de QMD (pipeline de búsqueda híbrida): https://github.com/tobilu/qmd
- Procedencia de la fusión: `MERGE_PROVENANCE.json` en el repositorio del modelo
