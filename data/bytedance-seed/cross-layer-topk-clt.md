# ByteDance-Seed/Cross-Layer-TopK-CLT

## Resumen

Cross-Layer TopK (CLT) es un transcoder de interpretabilidad mecanicista desarrollado por ByteDance-Seed para el modelo base Qwen3-8B-Base. No se trata de un modelo generativo, sino de una herramienta de extracción de características (pipeline `feature-extraction`) que descompone las activaciones internas del transformer en latentes interpretables. Concretamente, sus 36 capas × 32.768 latentes permiten identificar qué direcciones del flujo residual activan cada MLP y cómo esa información se propaga hacia capas posteriores.

El modelo resuelve un problema clásico de los transcoders por capas: la asignación fija de sparsity. La innovación del paper *Cross-Layer TopK: Dynamically Allocating Sparsity Across Layers in Transcoders* consiste en seleccionar conjuntamente los 36·k = 360 latentes con mayor puntuación (activación × norma de la columna del decodificador) a través de todas las capas, en lugar de aplicar un TopK independiente por capa. Esto permite que las capas con representaciones más densas acaparen más latentes activos y las más dispersas liberen presupuesto.

Es relevante ahora porque ofrece una vía práctica para auditar y depurar el comportamiento interno de un LLM de 8B parámetros de uso extendido, con pesos publicados en abierto bajo licencia Apache 2.0. El checkpoint completo ocupa 377 GB en fp32 (94,2B parámetros efectivos), lo que lo convierte en una infraestructura de investigación más que en un componente desplegable en producción convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-layer transcoder (CLT) sobre Qwen3-8B-Base; encoder ReLU lineal por capa y decoder multi-capa |
| Parametros totales | 94,2B (36 capas × 32.768 latentes) |
| Parametros activos | No aplica (no es MoE); k = 10 latentes por capa, 360 latentes activos por token en total |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-8B-Base, no especificada en la informacion) |
| Tipos de cuantizacion | No disponible; el autor indica que se entrene y use en fp32 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32), 377 GB en total; `W_enc_{l}`, `W_dec_{l}`, `W_dec_norm`, `factors` y `config.json` |

## Arquitectura y entrenamiento

El CLT se compone de 36 encoders lineales con ReLU, uno por capa, de forma `[32768, 4096]`, que leen el flujo residual justo antes del MLP de su capa (`resid_mid`, la entrada de `model.layers[l].post_attention_layernorm`). La codificación es `a_l = ReLU(W_enc_l · x_l)` sin sesgo. Sobre esas activaciones se puntúa cada latente como `a_l[i] · W_dec_norm[l, i]` y se retienen los 360 latentes con mayor puntuación de forma conjunta entre todas las capas, en lugar de un TopK por capa.

La decodificación es multi-capa: cada latente de la capa `l` escribe en las salidas MLP (`mlp_out`) de su propia capa y de todas las posteriores, según `mlp_out_hat[m] = Σ_{l ≤ m} a_l @ W_dec_{l}[:, m - l, :]`. Los tensores del decodificador tienen forma `[32768, 36 - l, 4096]` y suman 357 GB. La normalización de activaciones usada en entrenamiento ya está plegada en los pesos, de modo que el CLT consume `resid_mid` en bruto y reconstruye `mlp_out` en bruto; no deben reaplicarse los factores de `factors.safetensors`. Durante el entrenamiento se descartaron los tokens cuya norma en `resid_mid` o `mlp_out` alcanzase 20 veces la media de su capa (en la práctica, el primer token). El modelo se entrenó sobre activaciones en fp32 y el autor recomienda ejecutar el modelo base también en fp32. No se detalla en la informacion disponible el volumen de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Extracción de características interpretables: descompone las activaciones de las 36 capas del MLP de Qwen3-8B-Base en 32.768 latentes por capa.
- Atribución multi-capa: cada latente de la capa `l` escribe en las salidas MLP de `l` y de todas las capas posteriores, lo que permite rastrear cómo una característica influye en capas profundas.
- Reconstrucción de `mlp_out`: el decoder permite verificar la fidelidad de la descomposición reconstruyendo la salida MLP a partir de los latentes activos.
- Sparsity dinámica entre capas: la selección conjunta de 360 latentes permite comparar la densidad de representación entre capas de un mismo token.
- Análisis por token y posición: la salida es `activations[pos][layer] = [[latent_id, activation], ...]`, con gestión explícita de tokens atípicos descartados.
- No soporta generación de texto, tool calling, agentes ni multimodalidad: es una herramienta de análisis, no un modelo de chat.
- Capacidades multilingües: no documentadas; dependen del tokenizador y el modelo base.

## Casos de uso

- Auditoría de mecanismos internos de Qwen3-8B-Base: codificar un corpus de prompts y examinar qué latentes se activan por capa para localizar circuitos asociados a una tarea concreta (por ejemplo, aritmética o detección de idioma).
- Análisis de flujo de información entre capas: gracias al decoder multi-capa, se puede medir cuánto contribuye un latente de la capa 5 a la salida MLP de la capa 30 y trazar la propagación de una característica.
- Detección de características anómalas o tóxicas: identificar latentes con activación alta en prompts problemáticos y usarlos como señales de monitorización en un pipeline de evaluación.
- Investigación en sparsity dinámica: comparar la distribución de los 360 latentes activos entre capas para estudiar si las capas tempranas son más densas que las tardías, validando la hipótesis del paper.
- Edición y steering experimental: los latentes identificados pueden servir como candidatos para intervenciones (ablación o amplificación) sobre las salidas MLP, evaluando el efecto en la conducta del modelo base.
- Validación de fidelidad de transcoders: reconstruir `mlp_out` y medir el error de reconstrucción por capa como métrica de calidad de la descomposición antes de publicar hallazgos.
- Docencia y divulgación de interpretabilidad mecanicista: el demo multi-GPU incluido permite reproducir un análisis completo de una frase con código abierto y pesos públicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el checkpoint completo: 377 GB en fp32, lo que exige un nodo multi-GPU (por ejemplo, 8 × A100/H100 de 80 GB).
- Solo codificación: es posible descargar únicamente los `W_enc_{l}` (excluyendo `W_dec_[0-9]*`) y ejecutar con una única GPU de 80 GB (`--nproc_per_node 1`).
- Reparto de latentes: el demo distribuye los 32.768 latentes de forma uniforme entre GPUs; cualquier número de GPUs que divida 32.768 es válido.
- Modelo base adicional: Qwen3-8B-Base en fp32 debe caber junto con la porción de CLT correspondiente a cada GPU.
- Despliegue: el autor proporciona un script `hf_encode_demo.py` basado en `torchrun`, `safetensors` y `transformers`; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de artefacto).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cross-Layer TopK (CLT) | Transcoder multi-capa sobre Qwen3-8B-Base | 94,2B (36 × 32.768 latentes) | No disponible | Apache 2.0 | Hugging Face, pesos safetensors |
| Transcoder por capa convencional | Transcoder de una sola capa | Depende del modelo base | No disponible | Variable | Habitual en literatura de interpretabilidad |
| SAE (sparse autoencoder) sobre LLM | Autoencoder disperso | Depende del modelo base | No disponible | Variable | Amplia disponibilidad comunitaria |

No se dispone en la informacion proporcionada de métricas comparativas de reconstrucción ni de fidelidad frente a alternativas.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para chat, código, tool calling ni agentes; su única función es la extracción de características.
- Requisitos de hardware muy elevados: 377 GB en fp32 y 357 GB solo para el decodificador, lo que limita su uso a clústeres de investigación.
- Dependencia estricta del modelo base: solo es válido para Qwen3-8B-Base; aplicar los pesos a otra variante o a un modelo fine-tuneado invalida las activaciones.
- Uso obligatorio de fp32: el autor advierte que se entrene y ejecute en fp32; usar otra precisión puede degradar la fidelidad de la reconstrucción.
- Descarte de tokens atípicos: los tokens con norma 20× la media de su capa se eliminan (en la práctica, el primero), lo que introduce un sesgo en análisis que incluyan la posición inicial.
- No reaplicar `factors.safetensors`: la normalización ya está plegada en los pesos; hacerlo dos veces produce resultados incorrectos.
- Riesgo de interpretación errónea: los latentes son aproximaciones; la reconstrucción no es exacta y las conclusiones causales requieren validación con intervenciones.
- Idiomas y sesgos: no documentados; heredan los del modelo base y del corpus de activaciones usado en el entrenamiento, no especificado.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el modelo base Qwen3-8B-Base tiene sus propias condiciones que deben respetarse.

## Enlaces

- Hugging Face: https://huggingface.co/ByteDance-Seed/Cross-Layer-TopK-CLT
- Paper: https://huggingface.co/papers/2611.09233
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Organización: https://huggingface.co/ByteDance-Seed
