# convoicon/spancall-lean-v3-2

## Resumen

SpanCall Lean v3.2 es un modelo especializado en la extracción de llamadas a herramientas (tool calling) desarrollado por el usuario convoicon. A diferencia de los enfoques habituales, no genera JSON de forma autorregresiva: se trata de un encoder bidireccional basado en ModernBERT-large con dos cabezas específicas (H1 para selección de herramienta y H3 para punteros de argumentos) que emite una llamada a herramienta completa en un único paso forward. El repositorio ocupa 1,6 GB y el checkpoint se distribuye como `model.pt` (PyTorch), no como safetensors.

La propuesta técnica es relevante porque aborda el problema del tool calling como una tarea de extracción estructurada en lugar de generación libre, lo que elimina la necesidad de decodificación autorregresiva y reduce el riesgo de JSON malformado. El modelo emplea decodificación especulativa en el sentido de que produce la llamada completa de una vez, y declara un modo de extracción `two_step` como única opción en la versión v3.

La información pública es muy limitada: el autor no documenta licencia, idiomas soportados, composición del dataset de entrenamiento ni detalles del proceso de RLHF/DPO. Las métricas publicadas se limitan a un conjunto de evaluación propio (`hermes_eval`, limit=2000) que muestra una mejora sustancial frente a una línea base basada en expresiones regulares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (ModernBERT-large) con cabezas H1 (selección de herramienta) y H3 (punteros de argumentos) |
| Parametros totales | no disponible (backbone ModernBERT-large; el autor no declara el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (`max_seq_len`) |
| Tipos de cuantizacion | no disponible (solo se publica `model.pt` en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`) + `resolve_config.json`; no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo se construye sobre `answerdotai/ModernBERT-large`, un encoder transformer bidireccional con atención de contexto largo. Sobre ese backbone se añaden dos cabezas: H1, encargada de seleccionar la herramienta adecuada, y H3, un mecanismo de punteros que delimita los argumentos dentro del texto de entrada. La inferencia se realiza en un único paso forward: en lugar de generar el JSON token a token, el modelo resuelve la llamada completa mediante `LeanResolver` con el `resolve_mode` especificado en `resolve_config.json`. El modo de extracción es `two_step` y el modelo está restringido a llamadas únicas (`single_call_only=True`), con un margen conjunto mínimo de 0,02 (`min_joint_margin`).

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o fine-tuning supervisado más allá de lo que sugiere el nombre del notebook de entrenamiento (`spancall_lean_v3_2_train_eval.ipynb`). La innovación técnica destacable es el enfoque de extracción estructurada con cabezas de punteros, que evita la generación autorregresiva y, por tanto, los errores de formato en la salida.

## Capacidades

- Extracción de llamadas a herramientas en un solo paso forward, sin generación autorregresiva de JSON.
- Selección de herramienta mediante la cabeza H1 y delimitación de argumentos mediante la cabeza H3 (pointer head).
- Soporte de llamadas únicas por invocación (`single_call_only=True`); no soporta múltiples llamadas encadenadas en una misma pasada.
- Modo de extracción `two_step` como única opción en la versión v3.
- Procesamiento de entradas de hasta 4096 tokens.
- No se documentan capacidades de generación de texto libre, razonamiento general, código, matemáticas, visión ni audio.
- No se documenta soporte multilingüe explícito.
- No se documenta soporte de agentes multi-paso ni planificación.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: dado un turno de usuario, el modelo identifica la herramienta a invocar y extrae los argumentos en una sola pasada, lo que reduce la latencia frente a enfoques generativos.
- Integración en pipelines de function calling con esquemas fijos: al emitir la llamada completa de una vez, encaja bien en sistemas donde el catálogo de herramientas es conocido y estable, y donde un JSON malformado rompería el flujo.
- Preprocesado de comandos en asistentes de voz o chatbots: la extracción estructurada permite convertir lenguaje natural en parámetros tipados antes de pasarlos a un backend de ejecución.
- Automatización de tickets y formularios: el modelo puede mapear texto libre a campos de una herramienta o API interna (por ejemplo, crear un ticket con prioridad, categoría y descripción) usando la cabeza de punteros para delimitar cada argumento.
- Filtrado y validación en pipelines de agentes: como etapa previa a un LLM generativo, SpanCall Lean puede decidir si la petición requiere una herramienta y con qué parámetros, reservando el modelo grande para la respuesta final.
- Evaluación y benchmarking de sistemas de tool calling: el checkpoint y el notebook de evaluación permiten reproducir las métricas sobre `hermes_eval` y comparar con líneas base regex en entornos de investigación.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre `hermes_eval` (limit=2000):

| Sistema | n_F | exact_F | hit_F | param_F1_F | exact_all |
|---|---:|---:|---:|---:|---:|
| B1a (regex) | 1200 | 0.019 | 0.028 | 0.025 | 0.015 |
| SpanCall Lean (two_step) | 1200 | 0.636 | 0.880 | 0.779 | 0.493 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 1,6 GB, lo que sugiere que el checkpoint en FP32 o FP16 podría caber en GPUs de consumo con 8-16 GB, pero el autor no publica estimaciones.
- GPU recomendadas: no disponible. Al tratarse de un encoder de tamaño large con contexto de 4096, es plausible su ejecución en RTX 3090/4090 o A100, pero no hay datos oficiales.
- Cabe en GPU de consumo: probablemente sí en modelos con 8 GB o más, aunque no confirmado por el autor.
- Opciones de despliegue: carga manual con `transformers` (tokenizer) y PyTorch (`torch.load` sobre `model.pt`), reconstruyendo `SpanCallTransformerEncoder` y `LeanSpanCallModel` según el notebook. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de tool calling ni con alternativas de la misma categoría (por ejemplo, modelos generativos con function calling o clasificadores de intención). La única comparación publicada es contra una línea base regex (B1a) en la tabla de benchmarks.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; es un riesgo para producción.
- Idiomas no documentados: no hay garantía de funcionamiento fuera del idioma o idiomas del dataset de entrenamiento.
- Restringido a llamadas únicas (`single_call_only=True`): no soporta múltiples tool calls en una misma invocación.
- Modo de extracción único (`two_step`): no hay alternativas configurables en la versión v3.
- Formato de pesos propietario (`model.pt`) sin safetensors ni GGUF: requiere reconstruir la clase del modelo manualmente, lo que complica la integración y el despliegue estándar.
- Riesgo de alucinación en la selección de herramienta y extracción de argumentos: el margen conjunto mínimo de 0,02 sugiere umbrales de confianza bajos que pueden producir falsos positivos.
- Sin datos sobre sesgos, composición del dataset ni procesos de alineación.
- Métricas limitadas a un conjunto de evaluación propio (`hermes_eval`), sin validación externa ni comparación con benchmarks estándar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni comunidad que valide el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/convoicon/spancall-lean-v3-2
- Backbone: https://huggingface.co/answerdotai/ModernBERT-large
- Notebook de entrenamiento y evaluación (referenciado en la model card): `notebooks/spancall_lean_v3_2_train_eval.ipynb` (no se proporciona URL directa)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
