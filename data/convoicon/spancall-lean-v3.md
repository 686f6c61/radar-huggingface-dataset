# convoicon/spancall-lean-v3

## Resumen

SpanCall Lean v3 (identificador `convoicon/spancall-lean-v3`) es un modelo especializado en la extracción de llamadas a herramientas (tool calling) que abandona el paradigma autoregresivo habitual. En lugar de generar JSON token a token, utiliza un encoder bidireccional basado en `answerdotai/ModernBERT-large` junto con dos cabezas de predicción (H1 para selección de herramienta y H3 para punteros de argumentos) para emitir una llamada a herramienta completa en un único forward pass. El modelo lo publica el usuario `convoicon` en Hugging Face.

La propuesta resulta relevante porque ataca uno de los cuellos de botella clásicos de los agentes basados en LLM: la generación de JSON estructurado es lenta, propensa a errores de sintaxis y difícil de validar. Al reformular la tarea como un problema de extracción de spans sobre una secuencia de entrada, SpanCall Lean v3 busca reducir la latencia y aumentar la exactitud estructural en pipelines de function calling.

El repositorio ocupa 1,6 GB y contiene pesos en formato `model.pt` (PyTorch), además de un `resolve_config.json`. La model card es muy escueta y no documenta licencia, idiomas ni pipeline de Hugging Face. Los datos disponibles indican que se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y con una fecha de creación futura (2026-11-16) que conviene tratar con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional (ModernBERT-large) con cabeza H1 de selección de herramienta y cabeza H3 de punteros de argumentos |
| Parametros totales | no disponible (el backbone es ModernBERT-large; el total del conjunto no se documenta) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (`max_seq_len`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (PyTorch), más `resolve_config.json` |
| Modo de extracción | `two_step` (único modo en v3) |
| Restricción de llamadas | `single-call only: True` |
| Margen mínimo conjunto | `min_joint_margin: 0.02` |

## Arquitectura y entrenamiento

El modelo se construye sobre `answerdotai/ModernBERT-large`, un encoder transformer bidireccional con atención de contexto largo. Sobre ese backbone se añaden dos cabezas: H1, encargada de seleccionar la herramienta a invocar, y H3, que actúa como cabeza de punteros para delimitar los spans de los argumentos dentro de la secuencia de entrada. El resultado es un decodificador de llamadas a herramienta que produce la estructura completa en una sola pasada, sin generación autoregresiva de JSON.

La model card menciona el modo `two_step` como única estrategia de extracción en la versión v3 y fija un `min_joint_margin` de 0,02, presumiblemente un umbral de confianza conjunto para aceptar una llamada. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detalla la innovación concreta de decodificación especulativa más allá de la etiqueta `speculative-decoding` en los tags del repositorio, que sugiere un enfoque de verificación rápida de candidatos, pero sin especificación técnica publicada. El notebook `notebooks/spancall_lean_v3_train_eval.ipynb` se cita como generador de las métricas, pero no se incluye su contenido.

## Capacidades

- Extracción de llamadas a herramienta en una sola pasada forward, sin generación autoregresiva de JSON.
- Selección de herramienta mediante la cabeza H1 y delimitación de argumentos mediante punteros H3.
- Soporte de una única llamada por invocación (`single-call only: True`), lo que limita el encadenamiento de múltiples tool calls en una misma inferencia.
- Modo de extracción `two_step` como única estrategia disponible en v3.
- Contexto de hasta 4096 tokens, adecuado para prompts de sistema, definiciones de herramientas y consultas de usuario de longitud moderada.
- No se documentan capacidades de generación de texto libre, razonamiento general, código, matemáticas, visión, audio ni agentes multi-paso.
- Capacidades multilingües: no disponible.

## Casos de uso

- Enrutado de herramientas en asistentes conversacionales: el modelo recibe la consulta del usuario junto con el catálogo de herramientas y devuelve la herramienta y los argumentos en un solo paso, reduciendo la latencia frente a un LLM generativo que debe producir JSON token a token.
- Preprocesado de function calling en pipelines de agentes: se puede usar como primera etapa rápida que decide qué herramienta invocar y con qué parámetros, delegando la ejecución a un runtime externo.
- Validación y normalización de llamadas: al formular la salida como spans sobre la entrada, es posible verificar que los argumentos extraídos existen literalmente en el prompt, lo que facilita la auditoría y reduce alucinaciones en los parámetros.
- Extracción estructurada en formularios y APIs: dadas definiciones de herramientas tipo esquema, el modelo puede mapear campos de una consulta en lenguaje natural a los argumentos correspondientes, útil en integraciones con CRM o sistemas de ticketing.
- Clasificación de intención con argumentos: en lugar de un clasificador plano, H1 selecciona la herramienta (equivalente a la intención) y H3 extrae los parámetros relevantes, lo que sirve para enrutado en centros de contacto.
- Despliegue en entornos con requisitos de latencia estrictos: al no requerir decodificación autoregresiva, encaja en servicios donde el coste por token generado es prohibitivo, siempre que la tarea se limite a una única llamada por consulta.
- Evaluación comparativa de extractores de tool calls: el propio modelo card reporta métricas sobre `hermes_eval`, lo que permite usarlo como baseline en experimentos internos de extracción estructurada.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible provienen de `hermes_eval` con `limit=2000`, comparando el modelo frente a una línea base regex (B1a):

| Sistema | n_F | exact_F | hit_F | param_F1_F | exact_all |
|---|---:|---:|---:|---:|---:|
| B1a (regex) | 1157 | 0.022 | 0.027 | 0.03 | 0.017 |
| SpanCall Lean (two_step) | 1157 | 0.681 | 0.872 | 0.83 | 0.509 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las métricas anteriores corresponden a la tarea específica de extracción de llamadas a herramienta y no son comparables con benchmarks de razonamiento general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un backbone ModernBERT-large en precisión completa ronda los 1,5-2 GB de pesos, pero el repositorio ocupa 1,6 GB y no se detalla el desglose entre backbone y cabezas.
- GPU recomendadas: no disponible. Por tamaño, el modelo debería caber en GPUs consumer con al menos 8 GB de VRAM en FP16, aunque esta estimación no está confirmada por el autor.
- Cabe en GPU consumer: probablemente sí (RTX 3060 12 GB, RTX 4070, RTX 4090), pero sin confirmación documentada.
- Opciones de despliegue: la model card solo documenta carga manual mediante `hf_hub_download`, `torch.load` y reconstrucción explícita de `SpanCallTransformerEncoder` y `LeanSpanCallModel` según el notebook. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo autoregresivo es improbable que estos runtimes lo soporten de forma nativa.
- Latencia y throughput estimados: no disponible. La propuesta de una sola pasada forward sugiere menor latencia que la generación autoregresiva, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpanCall Lean v3 | Encoder + cabezas de extracción | 4096 | Tool call en un forward pass | no disponible | Hugging Face (repo `convoicon/spancall-lean-v3`) |
| LLM generativo con function calling (p. ej. familias tipo Llama, Qwen o Mistral) | Decoder autoregresivo | Variable según modelo | JSON generado token a token | Variable según modelo | Amplia |
| Extractores regex / reglas (B1a) | Basado en reglas | no aplica | Coincidencia de patrones | no disponible | Interno |

No se dispone de comparativas publicadas con alternativas específicas de la misma categoría (extractores de tool calls basados en encoder). La comparación con LLM generativos es conceptual: SpanCall Lean v3 prioriza latencia y exactitud estructural en una tarea acotada, mientras que un LLM generativo ofrece mayor flexibilidad pero mayor coste por llamada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es un riesgo bloqueante para producción hasta que el autor lo aclare.
- Idiomas soportados no documentados: no hay garantía de comportamiento fuera del idioma o idiomas de entrenamiento.
- Restricción `single-call only: True`: no soporta múltiples llamadas a herramienta en una misma inferencia, lo que limita su uso en agentes que requieren encadenar acciones.
- Único modo de extracción (`two_step`): no hay alternativas configurables en v3.
- Carga no estándar: requiere reconstruir manualmente las clases del modelo y cargar `model.pt` con `torch.load`, sin integración directa con `AutoModel` de Transformers. Esto complica el despliegue y la reproducibilidad.
- Sin pipeline de Hugging Face declarado y con cero descargas/likes: ecosistema mínimo, sin validación comunitaria.
- Fecha de creación anómala (2026-11-16): conviene verificar la procedencia y autenticidad del repositorio antes de usarlo.
- Riesgo de alucinación en argumentos: aunque el enfoque de punteros reduce la invención de valores al anclar los spans en la entrada, no se documentan análisis de errores ni tasas de fallo fuera de `hermes_eval`.
- Sin datos de sesgos: no se publica ninguna evaluación de sesgo, toxicidad o robustez.
- Métricas limitadas a un único conjunto (`hermes_eval`, `limit=2000`): no hay validación cruzada con otros benchmarks de tool calling.

## Enlaces

- Hugging Face: https://huggingface.co/convoicon/spancall-lean-v3
- Backbone: https://huggingface.co/answerdotai/ModernBERT-large
- Notebook de entrenamiento y evaluación (citado en la model card, no enlazado): `notebooks/spancall_lean_v3_train_eval.ipynb`
- Paper, blog, repositorio o demo adicionales: no disponible en la información proporcionada.
