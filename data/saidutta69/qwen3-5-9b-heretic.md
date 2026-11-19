# saidutta69/Qwen3.5-9B-heretic

## Resumen

Qwen3.5-9B-heretic es una variante "decensored" del modelo Qwen/Qwen3.5-9B, publicada por el usuario saidutta69 (bajo la marca "RACER IS OP"). No se trata de un fine-tune nuevo ni de un modelo entrenado desde cero: es el mismo checkpoint base con la dirección de pesos responsable del comportamiento de rechazo editada mediante una técnica de ablación direccional ("abliteration") implementada con la herramienta Heretic v1.4.0. El objetivo es eliminar las negativas del modelo ante peticiones que el original rechazaría, manteniendo intactas en la medida de lo posible sus capacidades de razonamiento, instrucción y multilingüismo.

El modelo cuenta con 9.409.813.744 parámetros totales en formato safetensors y se distribuye también con una escalera completa de cuantizaciones GGUF (F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M) generadas con llama.cpp, lo que permite ejecutarlo desde GPUs de 6 GB hasta CPU-only. Hereda la arquitectura híbrida de atención lineal de la familia Qwen3.5 y la licencia qwen-research-license del modelo base.

Su relevancia actual es doble: por un lado, demuestra que la edición quirúrgica de pesos puede alterar el comportamiento de seguridad de un modelo con una divergencia KL mínima (0,0015) respecto al original; por otro, sirve como caso de estudio para equipos que evalúan riesgos de despliegue de modelos abliterated en producción, dado que el autor reconoce explícitamente que no hay filtrado de seguridad adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal (familia Qwen3.5) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF); safetensors en precision original |
| Idiomas soportados | en (ingles declarado; el modelo base Qwen3.5 es multilingue, pero la model card solo declara ingles) |
| Licencia | qwen-research-license (heredada del modelo base) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura transformer híbrida con atención lineal, según indica la model card al referirse a la "Qwen3.5 hybrid linear-attention architecture". Esta variante heretic no introduce cambios estructurales: parte de los pesos del checkpoint base y aplica ablación direccional sobre las proyecciones de salida de atención y las down-projections del MLP. No hay entrenamiento adicional, ni RLHF, ni DPO; la edición se realiza localmente sobre un conjunto reducido de direcciones de pesos.

La herramienta Heretic v1.4.0 identifica las direcciones responsables del rechazo y las suprime mediante ediciones de pesos dirigidas. El autor reporta una divergencia KL de 0,0015 respecto al modelo base sobre la distribución de salidas, lo que cuantifica que la modificación es extremadamente estrecha. El proceso de abliteración se ejecutó, según `reproduce/reproduce.json`, en una NVIDIA RTX PRO 6000 Blackwell Server Edition con 94,97 GB de VRAM. No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre la composición de su dataset.

## Capacidades

- Generación de texto conversacional en inglés, con el mismo nivel de coherencia e instrucción que Qwen3.5-9B según la divergencia KL reportada.
- Razonamiento multilingüe y capacidades agénticas heredadas del modelo base (la model card menciona "strong multilingual reasoning and agentic capabilities").
- Supresión del comportamiento de rechazo: responde a peticiones que el modelo base rechazaría, incluidas algunas que no debería aceptar.
- Compatibilidad con text-generation-inference, vLLM, SGLang, llama.cpp, Ollama, LM Studio y Jan.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información proporcionada para esta variante; se heredaría del base si este lo soporta.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente cómo la ablación direccional afecta al comportamiento de rechazo con una métrica objetiva (79/100 rechazos frente a 86/100 del base) y una divergencia KL medida, útil para papers sobre robustez de salvaguardas.
- Red teaming y evaluación de riesgos: sirve como sujeto de pruebas para medir la eficacia de clasificadores de contenido y filtros externos, ya que el autor confirma que no incorpora filtrado de seguridad propio.
- Despliegue local en hardware de consumo: con la cuantización Q4_K_M (5,63 GB) puede ejecutarse en GPUs de 6-8 GB (GTX 1660 Super, RTX 3050 laptop, RTX 4060) o en CPU/RAM de sistema, lo que facilita prototipado sin infraestructura cloud.
- Generación creativa sin restricciones de contenido: escritura de ficción, guiones o narrativa que el modelo base podría rechazar por temática sensible, aprovechando la coherencia preservada del checkpoint original.
- Evaluación comparativa de cuantizaciones: la escalera completa de GGUF (F16 a Q4_K_M) permite medir la degradación de calidad por cuantización sobre un mismo modelo con edición de pesos conocida.
- Integración en pipelines de inferencia de alto rendimiento: al ser compatible con vLLM y SGLang, puede servirse con batching continuo en entornos donde se requiera baja latencia, aunque sin garantías de seguridad de contenido.
- Fine-tuning posterior sobre la variante abliterated: equipos que quieran partir de un modelo sin rechazos para tareas de dominio específico, asumiendo la responsabilidad legal y ética del resultado.

## Benchmarks y rendimiento

| Metrica | Este modelo | Qwen3.5-9B (base) |
|---|---|---|
| Rechazos (sobre 100 prompts adversarios) | 79/100 | 86/100 |
| Divergencia KL respecto al base | 0,0015 | 0 (por definición) |

Los datos proceden de la evaluación del autor con Heretic v1.4.0 sobre 2x Tesla T4, usando 100 prompts dañinos de `mlabonne/harmful_behaviors` y 100 prompts inocuos de `mlabonne/harmless_alpaca`. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Nota: la model card presenta cifras inconsistentes entre secciones (84/100 frente a 86/100 para el base, y "5 de 84 rechazos eliminados" frente a la diferencia de 7 puntos en la tabla); se reproducen tal cual aparecen.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, añadir ~1 GB para contexto según el autor):
  - Q4_K_M: 5,63 GB
  - Q5_K_M: 6,47 GB
  - Q6_K: 7,36 GB
  - Q8_0: 9,53 GB
  - F16: 17,92 GB
- GPU recomendadas por cuantización según la model card:
  - RTX 3090 / 4090 / 5090 (24 GB): Q8_0
  - RTX 4080 / 5080 / 4060 Ti 16G (16 GB): Q6_K
  - RTX 3060 / 4070 / 5070 (12 GB): Q5_K_M
  - RTX 4060 / 3070 (8 GB): Q4_K_M
  - GTX 1660 Super / 2060 / 3050 laptop (6 GB): Q4_K_M
- Cabe en GPU de consumo: sí, desde 6 GB con Q4_K_M; también en CPU-only y Apple Silicon con Q4_K_M en RAM de sistema.
- Opciones de despliegue: llama.cpp (`llama serve -hf saidutta69/Qwen3.5-9B-heretic:Q4_K_M`), Ollama, LM Studio, Jan, vLLM, SGLang, text-generation-inference y transformers.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (100 prompts) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-heretic | ~9,4B | no disponible | 79/100 | qwen-research-license | safetensors + 5 GGUF |
| Qwen/Qwen3.5-9B (base) | ~9,4B | no disponible | 86/100 | qwen-research-license | safetensors |
| Qwen3.5-4B-heretic | no disponible | no disponible | no disponible | qwen-research-license | no disponible |
| Qwen3.5-2B-heretic | no disponible | no disponible | no disponible | qwen-research-license | no disponible |

Las dos alternativas heretic de 4B y 2B son del mismo autor y colección. No se dispone de datos de benchmarks estándar ni de contexto para comparar rendimiento de razonamiento entre ellas.

## Limitaciones y advertencias

- El modelo elimina deliberadamente el comportamiento de rechazo: cumplirá peticiones que el base rechazaría, incluidas algunas que no debería. No hay filtrado de seguridad adicional, según el propio autor.
- La reducción de rechazos es modesta en términos absolutos (de 86 a 79 sobre 100 prompts), por lo que no debe asumirse que el modelo es completamente "uncensored" en todos los dominios.
- La model card contiene inconsistencias numéricas (84 frente a 86 rechazos del base; "5 de 84" frente a 7 puntos de diferencia), lo que reduce la fiabilidad de las métricas reportadas.
- Riesgo de alucinación: no cuantificado en la información disponible; se hereda el del modelo base.
- Idiomas: solo se declara inglés; el multilingüismo del base no está verificado para esta variante.
- Licencia qwen-research-license: es una licencia de investigación, no una licencia permisiva estándar; deben revisarse las restricciones de uso comercial en el enlace oficial antes de cualquier despliegue productivo.
- Longitud de contexto no documentada en la información proporcionada; crítico para planificar aplicaciones con ventanas largas.
- El repositorio tiene 112,7 GB y 0 likes con 8.450 descargas, lo que sugiere poca validación comunitaria; conviene verificar los pesos antes de usarlos en producción.
- La edición de pesos puede afectar de forma no uniforme a distintos dominios; la divergencia KL global baja no garantiza ausencia de regresiones locales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/Qwen3.5-9B-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Artículo sobre abliteration de mlabonne: https://huggingface.co/blog/mlabonne/abliteration
- Colección de modelos heretic del autor: https://huggingface.co/collections/saidutta69/racer-is-op-heretic-models
- Hermano Qwen3.5-4B-heretic: https://huggingface.co/saidutta69/Qwen3.5-4B-heretic
- Hermano Qwen3.5-2B-heretic: https://huggingface.co/saidutta69/Qwen3.5-2B-heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
