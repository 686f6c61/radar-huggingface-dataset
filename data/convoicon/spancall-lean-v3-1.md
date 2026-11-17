# convoicon/spancall-lean-v3-1

## Resumen

SpanCall Lean v3.1 es un modelo encoder bidireccional especializado en la extracción de llamadas a herramientas (tool calling) a partir de texto. Lo desarrolla el usuario convoicon y se publica en Hugging Face bajo el identificador `convoicon/spancall-lean-v3-1`. En lugar de generar JSON de forma autorregresiva, el modelo emite una llamada a herramienta completa en un único forward pass, apoyándose en el backbone `answerdotai/ModernBERT-large` con una cabeza de herramienta (H1) y una cabeza de puntero (H3).

La propuesta resuelve un problema concreto: la latencia y la fragilidad estructural de los decoders generativos al producir JSON de tool calls. Al tratar la tarea como extracción de spans sobre una secuencia de entrada de hasta 4096 tokens, el modelo evita errores de sintaxis en la salida y reduce el coste computacional a una sola pasada. Está etiquetado con `spancall`, `tool-calling` y `speculative-decoding`.

El modelo se publica con 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado, sin licencia especificada y sin idiomas declarados. El repositorio ocupa 1,6 GB y contiene pesos en formato `model.pt` (PyTorch), además de un `resolve_config.json` con parámetros de resolución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional (ModernBERT-large) con cabeza de herramienta H1 y cabeza de puntero H3 |
| Parametros totales | no disponible (el backbone es ModernBERT-large; el total no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (`max_seq_len`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`); tokenizer vía `AutoTokenizer`; configuración en `resolve_config.json` |

## Arquitectura y entrenamiento

El modelo se construye sobre `answerdotai/ModernBERT-large`, un transformer encoder bidireccional. Sobre ese backbone se añaden dos cabezas: H1 (tool head), encargada de identificar la herramienta invocada, y H3 (pointer head), que resuelve los argumentos mediante punteros sobre la secuencia de entrada. La extracción se realiza en modo `two_step`, el único disponible en la versión v3. La generación es de una sola llamada (`single-call only: True`) con un margen conjunto mínimo (`min_joint_margin`) de 0,02.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card menciona el notebook `notebooks/spancall_lean_v3_train_eval.ipynb` como origen de la generación automática de métricas, pero no detalla el procedimiento de entrenamiento. La carga requiere reconstruir manualmente `SpanCallTransformerEncoder` y `LeanSpanCallModel` y aplicar `load_state_dict`, lo que implica que no hay integración directa con `AutoModel` de Transformers.

## Capacidades

- Extracción de llamadas a herramienta en un único forward pass, sin generación autorregresiva de JSON.
- Identificación de la herramienta invocada mediante la cabeza H1.
- Resolución de argumentos mediante punteros sobre la secuencia de entrada (cabeza H3).
- Procesamiento de entradas de hasta 4096 tokens.
- Modo de extracción `two_step` como única modalidad en v3.
- Restricción a una sola llamada por entrada (`single-call only`).
- No se declaran capacidades de generación de texto libre, razonamiento general, código, matemáticas, visión ni audio.
- No se declara soporte de agentes multi-paso ni capacidades multilingües explícitas.
- La etiqueta `speculative-decoding` sugiere un uso previsto como componente en pipelines de decodificación especulativa, aunque no se detalla el mecanismo.

## Casos de uso

- Enrutamiento de herramientas en asistentes: dado un turno de usuario de hasta 4096 tokens, el modelo extrae en una pasada qué herramienta invocar y con qué argumentos, lo que encaja en pipelines donde la latencia de generación de JSON es crítica.
- Preprocesado de tool calls en sistemas de agentes: al emitir la llamada completa sin generación autorregresiva, se elimina el riesgo de JSON malformado y se simplifica la validación posterior.
- Componente de decodificación especulativa: la etiqueta del modelo sugiere su uso para proponer tool calls candidatas que un modelo mayor verificaría después, reduciendo el coste del modelo principal.
- Extracción estructurada sobre documentos: la cabeza de puntero permite señalar argumentos directamente en el texto de entrada, útil para convertir formularios o correos en llamadas a API.
- Clasificación y enrutado en backends de atención al cliente: con contexto de 4096 tokens, puede identificar la herramienta adecuada (consulta de pedido, devolución, etc.) a partir de conversaciones multi-turno concatenadas.
- Evaluación comparativa de extractores: sirve como baseline encoder frente a sistemas basados en regex (B1a) o decoders generativos en tareas de tool calling, según las métricas publicadas en `hermes_eval`.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre `hermes_eval` (limit=2000):

| Sistema | n_F | exact_F | hit_F | param_F1_F | exact_all |
|---|---:|---:|---:|---:|---:|
| B1a (regex) | 1157 | 0.022 | 0.027 | 0.03 | 0.017 |
| SpanCall Lean (two_step) | 1157 | 0.678 | 0.893 | 0.822 | 0.509 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- El repositorio pesa 1,6 GB, lo que corresponde aproximadamente a los pesos del backbone ModernBERT-large más las cabezas; la VRAM de inferencia en fp32 sería del orden de 3-4 GB, y en fp16/bf16 en torno a 1,6-2 GB, aunque no se declaran cuantizaciones oficiales.
- No se especifican GPU recomendadas por el autor. Por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en A100/H100 para despliegues por lotes.
- Opciones de despliegue: no hay integración declarada con vLLM, llama.cpp, Ollama ni TGI. La carga se realiza con `transformers.AutoTokenizer` y `torch.load` sobre `model.pt`, reconstruyendo las clases manualmente según el notebook.
- Latencia y throughput: no disponibles. Al tratarse de un encoder con una sola pasada, la latencia esperada sería inferior a la de un decoder generativo equivalente, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SpanCall Lean v3.1 | Encoder + cabezas de extracción | no disponible (backbone ModernBERT-large) | 4096 | Sí, single-call, modo two_step | no disponible | Hugging Face (`convoicon/spancall-lean-v3-1`) |
| B1a (regex) | Baseline heurístico | no aplica | no aplica | Sí, por patrones | no disponible | Referencia interna en la model card |
| Decoders generativos para tool calling (p. ej. familias tipo Hermes) | Decoder autorregresivo | variable | variable | Sí, generación de JSON | variable | no disponible en la información proporcionada |

No se dispone de datos comparativos de rendimiento frente a decoders generativos en la información proporcionada; la única comparación publicada es frente al baseline regex B1a en `hermes_eval`.

## Limitaciones y advertencias

- Solo admite una llamada por entrada (`single-call only`), lo que impide tool calls múltiples o paralelas en una misma pasada.
- El único modo de extracción disponible en v3 es `two_step`; no hay alternativas configurables.
- No se declara licencia, por lo que el uso comercial queda sin marco legal explícito hasta que el autor lo aclare.
- No se declaran idiomas soportados; el rendimiento fuera del inglés (idioma del backbone ModernBERT) es incierto.
- No hay integración con `AutoModel` ni con servidores de inferencia estándar; la carga requiere reconstruir clases personalizadas desde el notebook, lo que añade fragilidad en producción.
- El modelo está especializado en extracción de tool calls y no es un modelo de propósito general: no genera texto libre ni razona de forma autónoma.
- Riesgo de alucinación estructural: con `min_joint_margin` de 0,02, márgenes muy ajustados podrían producir selecciones de herramienta o argumentos poco fiables.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria ni mantenimiento demostrado.
- No se han publicado evaluaciones fuera de `hermes_eval` (limit=2000), por lo que la generalización a otros dominios no está verificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/convoicon/spancall-lean-v3-1
- Backbone: https://huggingface.co/answerdotai/ModernBERT-large
- Notebook de entrenamiento y evaluación (referenciado en la model card): `notebooks/spancall_lean_v3_train_eval.ipynb` (no se proporciona URL directa)
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
