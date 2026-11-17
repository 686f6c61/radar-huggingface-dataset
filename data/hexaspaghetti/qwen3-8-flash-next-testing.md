# HexaSpaghetti/Qwen3.8-Flash-Next-Testing

## Resumen

Qwen3.8-Flash-Next es un modelo experimental de pesos abiertos desarrollado por el equipo Qwen (Alibaba), concebido como la primera publicación bajo la arquitectura que sustentará Qwen4. Combina atención híbrida con Qwen Sparse Attention (QSA), Gated DeltaNet, Gated Residual y un esquema de N-gram Embedding que permite escalar parámetros sin recurrir exclusivamente a MoE. El modelo tiene 125B parámetros con 6B activos, más 51B de embeddings de n-gram y 4B de MTP, y un contexto nativo de 262.144 tokens extensible hasta 1.000.000. Es multimodal (image-text-to-text) e incluye un codificador de visión.

La ficha que nos ocupa, sin embargo, no es el modelo oficial: HexaSpaghetti/Qwen3.8-Flash-Next-Testing es un fine-tune derivado que aplica una ablación de rango arbitrario (ARA) mediante la herramienta Heretic v2.2.0.dev0 para eliminar comportamientos de rechazo ("decensored"/"abliterated"). El propio autor advierte en la model card que el resultado "está roto". El modelo base declarado es Qwen/Qwen3.8-Flash-Next y la licencia heredada es qwen-community-1.0.

Su relevancia es doble: por un lado, documenta el estado del arte arquitectónico de Qwen en la fecha de publicación (noviembre de 2026); por otro, sirve como caso de estudio de las técnicas de ablación de rechazo y de sus costes en divergencia KL. Con 0 descargas y 0 likes en el momento de la consulta, es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM con codificador de visión; híbrida Gated DeltaNet + Qwen Sparse Attention (QSA) con MoE, Gated Residual y N-gram Embedding |
| Parametros totales | 177.392.830.576 (según safetensors); desglose del autor: 125B LM con 6B activos + 51B n-gram embedding + 4B MTP |
| Parametros activos | 6B (10 expertos enrutados + 1 compartido de 512 totales) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no se documentan GGUF ni AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en el repo) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer causal híbrido de 48 capas con layout 12 × (3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE)). La dimensión oculta es 2560, el embedding de tokens 248.320 (padded) y el embedding de n-gram 20.000.000 (bigramas/trigramas en la capa 2). Gated DeltaNet usa 48 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128. Qwen Sparse Attention emplea 24 cabezas para Q y 2 para KV, dimensión de cabeza 256, RoPE de 64 dimensiones y un indexador MQA con 4 cabezas de query y 1 de key compartida (dimensión 128), con un presupuesto de 512 bloques o 2048 tokens. El MoE tiene 512 expertos con dimensión intermedia 640. Gated Residual opera con 4 ramas y rango de cuello de botella 320. Incluye una capa MTP entrenada con múltiples pasos.

El recetario de entrenamiento combina Muon y AdamW según categorías de pesos, elimina los warmups de batch size tradicionales (arranque directo en el batch objetivo) y se apoya en leyes de escala reajustadas. No se detalla en la información disponible el número de tokens de preentrenamiento, la composición del dataset ni si hubo RLHF/DPO.

El fine-tune de HexaSpaghetti aplica Arbitrary-Rank Ablation (ARA) con Heretic v2.2.0.dev0 sobre las capas 5 a 48, con preserve_good_behavior_weight 0.5262, steer_bad_behavior_weight 0.0013, overcorrect_relative_weight 0.9214 y neighbor_count 14. El autor reporta 1/100 rechazos frente a 99/100 del original, con una divergencia KL de 0.1895, y declara el resultado roto.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante codificador de visión.
- Codigo y matematicas: capacidades esperables del modelo base, aunque no se documentan benchmarks en la informacion disponible.
- Tool calling / function calling: el modelo base se distribuye compatible con vLLM, SGLang y TokenSpeed; la versión oficial Qwen3.8-Flash incluye herramientas integradas, pero no se confirma para este fine-tune.
- Razonamiento agéntico multi-paso: la arquitectura QSA está optimizada para cargas agénticas de contexto largo según el autor del modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: no documentado para este artefacto.
- Comportamiento "decensored"/"abliterated": reduce rechazos según la métrica del autor, a costa de degradación declarada.

## Casos de uso

- Investigación sobre ablación de rechazo: el modelo sirve para reproducir y auditar la técnica ARA de Heretic, comparando la divergencia KL (0.1895) y la tasa de rechazos (1/100) frente al original, gracias al directorio `reproduce` incluido.
- Estudio de arquitecturas híbridas de atención: permite inspeccionar en pesos reales la interacción entre Gated DeltaNet, QSA, Gated Residual y N-gram Embedding en un modelo de 177B parámetros totales.
- Experimentos de contexto largo en laboratorio: con 262.144 tokens nativos y extensión a 1.000.000, útil para probar recuperación de información en ventanas enormes, siempre que se acepte el estado "roto" declarado.
- Evaluación de robustez y alineación: comparar salidas del modelo ablacionado frente al original para medir deriva de comportamiento, sesgos y calidad en tareas sensibles.
- Pruebas de pipelines multimodales: al ser image-text-to-text, permite validar integraciones de visión-lenguaje en transformers, vLLM o SGLang antes de migrar al modelo oficial.
- Docencia y divulgación técnica: como ejemplo didáctico de cómo un fine-tune de ablación altera el comportamiento de un modelo frontier sin reentrenar desde cero.

## Benchmarks y rendimiento

| Metrica | Este modelo | Qwen3.8-Flash-Next (original) |
|---|---|---|
| Rechazos (Refusals) | 1/100 | 99/100 |
| Divergencia KL | 0.1895 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible para este fine-tune. La model card del modelo base referencia una tabla de benchmarks que aparece truncada en la información proporcionada, por lo que no se reproducen cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 177.392.830.576 parámetros totales y pesos safetensors en FP16/BF16, el repo ocupa 354,8 GB; se requiere un nodo multi-GPU para cargarlo sin cuantizar.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabe esperar necesidad de múltiples A100/H100 (80 GB) o equivalentes.
- Consumer GPU: no cabe en GPUs de consumo (RTX 4090, 24 GB) en precisión completa; no se documentan cuantizaciones GGUF/AWQ que lo permitan.
- Opciones de despliegue: transformers, vLLM, SGLang y TokenSpeed según la model card del modelo base; llama.cpp y Ollama no están confirmados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| HexaSpaghetti/Qwen3.8-Flash-Next-Testing | 177,4B totales / 6B activos | 262.144 (ext. 1M) | qwen-community-1.0 | Fine-tune de ablación, declarado "roto" |
| Qwen/Qwen3.8-Flash-Next | 125B LM (6B activos) + 51B n-gram + 4B MTP | 262.144 (ext. 1M) | qwen-community-1.0 | Modelo base oficial |
| Qwen3.8-Flash (Qwen Cloud) | no disponible | 1M por defecto | servicio propietario | Versión gestionada con herramientas integradas |

No se dispone de datos de benchmarks comparativos adicionales en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo "está roto"; no debe usarse en producción sin validación exhaustiva.
- La ablación introduce una divergencia KL de 0.1895 respecto al original, lo que implica degradación medible de la distribución de salida.
- Riesgo elevado de alucinación y de respuestas incoherentes tras la modificación de pesos en las capas 5-48.
- Sesgos conocidos: no documentados; los modelos ablacionados suelen perder parte de los filtros de seguridad, aumentando el riesgo de contenido dañino.
- Idiomas soportados no especificados; cobertura multilingüe incierta.
- Licencia qwen-community-1.0: revisar términos de uso comercial antes de cualquier despliegue; el repo la etiqueta como "other".
- Sin cuantizaciones publicadas: el despliegue requiere hardware de gama alta y no es viable en GPUs de consumo.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes), lo que reduce la confianza en su estabilidad.

## Enlaces

- Hugging Face: https://huggingface.co/HexaSpaghetti/Qwen3.8-Flash-Next-Testing
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog del modelo base: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio QwenLM: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Heretic: https://heretic-project.org
- Qwen Cloud / Qwen3.8-Flash: https://www.qwencloud.com/models/qwen3.8-flash
- README de reproducción: https://huggingface.co/HexaSpaghetti/Qwen3.8-Flash-Next-Testing/blob/main/reproduce/README.md
