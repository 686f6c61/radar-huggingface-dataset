# bambocher/Qwen3.5-9B-oQ3.5-mtp

## Resumen

Qwen3.5-9B-oQ3.5-mtp es una cuantización mixta del modelo Qwen3.5-9B, publicada por el usuario bambocher en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos del modelo original de Qwen (Alibaba) al formato MLX, pensada para ejecución en hardware Apple Silicon. La cuantización se ha realizado con la herramienta oQ de oMLX v0.7.3, que aplica precisión mixta por tensor en lugar de un único nivel de bits para todo el checkpoint.

El checkpoint resultante ocupa 5,285 GiB (11,2 GB de repositorio, incluyendo ficheros auxiliares) y contiene 9.653 millones de parámetros lógicos distribuidos en tres componentes: el modelo de lenguaje (8,954B), un codificador de visión (0,456B) y una cabeza MTP (multi-token prediction, 0,243B). La precisión efectiva media es de 4,703 bits por peso, con la mayor parte de los tensores almacenados en 3 bits afín con grupo de 64.

Su relevancia es práctica: permite ejecutar un modelo multimodal de ~9,6B parámetros con capacidad de predicción multi-token en equipos con memoria unificada modesta, algo que el checkpoint en BF16 (unos 19 GB) dificultaría en muchos Mac. La información pública disponible es escasa: no hay model card del modelo base incluida, ni licencia declarada, ni idiomas especificados, ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), con codificador de visión y cabeza MTP; pesos en formato MLX |
| Parametros totales | 9.653.104.368 (9,653B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta afín: 3, 4, 5 y 6 bits con grupo de 64, más tensores en BF16; media efectiva 4,703 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (librería `mlx`) |

Desglose de la cuantización por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8,954B | 4,578 GB / 4,264 GiB |
| Visión | 0,456B | 0,912 GB / 0,849 GiB |
| Cabeza MTP | 0,243B | 0,185 GB / 0,172 GiB |
| Total | 9,653B | 5,675 GB / 5,285 GiB |

Distribución por precisión:

| Formato | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Afín 3 bits, grupo 64 | 6,117B | 63,372% | 2,493 GiB | 3,50 |
| Afín 4 bits, grupo 64 | 1,625B | 16,837% | 0,851 GiB | 4,50 |
| Afín 5 bits, grupo 64 | 0,403B | 4,171% | 0,258 GiB | 5,50 |
| Afín 6 bits, grupo 64 | 1,017B | 10,537% | 0,770 GiB | 6,50 |
| BF16 | 0,491B | 5,083% | 0,914 GiB | 16,00 |
| Total | 9,653B | 100% | 5,285 GiB | 4,703 |

## Arquitectura y entrenamiento

No se dispone de información sobre el entrenamiento del modelo base Qwen3.5-9B en la documentación proporcionada: no se indican número de tokens, composición del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. Lo que sí se deduce del checkpoint es su estructura: un transformer con un codificador de visión separado (0,456B parámetros) que lo convierte en un modelo multimodal, y una cabeza MTP (multi-token prediction) de 0,243B parámetros, una técnica que permite predecir varios tokens por paso y que suele emplearse para acelerar la decodificación o como soporte a decodificación especulativa.

La innovación técnica de esta publicación no está en el modelo en sí, sino en el proceso de cuantización. oQ (oMLX) aplica precisión mixta asignando más bits a los tensores sensibles (por ejemplo, capas de atención o proyecciones de salida, que aparecen en 5, 6 bits y BF16) y menos a los menos sensibles (el grueso en 3 bits). El resultado es un checkpoint de 5,285 GiB con una media de 4,703 bits/peso, un compromiso entre tamaño y fidelidad respecto al original en BF16. El autor indica que el modelo se recuantizó con oMLX v0.7.3 el 13 de noviembre de 2026, por lo que las copias anteriores deben descartarse.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5-9B, aunque no se documentan explícitamente en la model card.
- Procesamiento de imagen: el checkpoint incluye un codificador de visión de 0,456B parámetros, lo que implica capacidad multimodal (entrada de imágenes junto a texto).
- Predicción multi-token: la cabeza MTP de 0,243B parámetros está diseñada para predecir varios tokens por paso, lo que puede acelerar la generación.
- Ejecución en Apple Silicon: al estar en formato MLX, se integra con el ecosistema `mlx` y `mlx-lm` de Apple.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 5,285 GiB cabe en equipos con 16 GB de RAM unificada, lo que permite ejecutar un modelo de ~9,6B parámetros en un MacBook Pro o Mac Studio sin GPU dedicada, usando `mlx-lm`.
- Prototipado de aplicaciones multimodales en local: al incluir codificador de visión, se puede construir un pipeline de pregunta-respuesta sobre imágenes sin enviar datos a la nube, útil para prototipos con requisitos de privacidad.
- Evaluación de cuantización mixta: sirve como caso de estudio para comparar la calidad de oQ frente a cuantizaciones uniformes de 4 bits (GPTQ, AWQ) en el mismo modelo base, midiendo perplejidad y calidad de generación.
- Aceleración de decodificación con MTP: la cabeza de predicción multi-token permite experimentar con decodificación especulativa en MLX, comparando throughput frente a la decodificación autoregresiva estándar.
- Desarrollo de asistentes de código en local: si el modelo base conserva las capacidades de código de la familia Qwen, se puede integrar en editores o terminales mediante un servidor MLX local, sin coste de API.
- Fine-tuning ligero sobre el checkpoint cuantizado: aunque la cuantización limita el ajuste directo, sirve como base para LoRA sobre las capas en BF16 o para destilar comportamientos a modelos más pequeños.
- Despliegue en entornos air-gapped: al ser un artefacto autocontenido en safetensors MLX, se puede distribuir en redes aisladas para tareas de análisis de documentos con imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: 5,285 GiB de pesos más overhead de activaciones y caché KV; en la práctica, entre 6 y 8 GB para contextos moderados.
- Cabe en consumer GPU y en Apple Silicon: sí en Mac con 16 GB de memoria unificada o superior (M1 Pro, M2, M3, M4 y variantes Max/Ultra). En GPUs NVIDIA consumer no es directamente utilizable, ya que el formato es MLX.
- GPUs recomendadas: hardware Apple Silicon. Para el modelo base en BF16 se necesitarían unos 19 GB, lo que exige una RTX 4090 (24 GB) o A100/H100 si se convirtiera a otro formato.
- Opciones de despliegue: `mlx-lm` y el ecosistema MLX de Apple. No es compatible con vLLM, llama.cpp, Ollama ni TGI sin conversión previa a GGUF u otro formato.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-oQ3.5-mtp (este) | 9,653B | no disponible | MLX safetensors, 4,703 bits/peso | no disponible | Hugging Face, 46 descargas |
| Qwen3.5-9B (base, BF16) | ~9,6B | no disponible | safetensors | no disponible | Referenciado como origen, no verificado en la búsqueda |
| Cuantizaciones GGUF de la familia Qwen3 (p. ej. Q4_K_M) | variable | variable | GGUF | según modelo base | Amplia disponibilidad en Hugging Face |
| Cuantizaciones MLX uniformes de 4 bits de modelos ~9B | ~9B | variable | MLX safetensors | según modelo base | Disponibles en la comunidad MLX |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, formato y disponibilidad.

## Limitaciones y advertencias

- La cuantización a 3 bits en el 63% de los pesos introduce pérdida de calidad respecto al BF16; la media de 4,703 bits/peso no equivale a una cuantización uniforme de 4 bits en términos de fidelidad.
- No hay licencia declarada en el repositorio, lo que impide determinar si el uso comercial está permitido; hay que consultar la licencia del modelo base Qwen3.5-9B antes de cualquier despliegue productivo.
- No se especifican idiomas soportados; el comportamiento multilingüe dependerá del modelo base y no está verificado en esta conversión.
- No se documenta la longitud de contexto, un dato crítico para planificar memoria y para casos de uso con documentos largos.
- Riesgo de alucinación: no cuantificado en esta publicación; se agrava potencialmente por la cuantización agresiva.
- El modelo está atado al ecosistema MLX; no se puede usar en GPUs NVIDIA ni en servidores x86 convencionales sin reconversión.
- El autor advierte de que las copias anteriores al 13 de noviembre de 2026 están obsoletas y deben descargarse de nuevo.
- El repositorio tiene 46 descargas y 0 likes, sin validación comunitaria ni evaluaciones independientes publicadas.
- No hay información sobre sesgos conocidos ni sobre el proceso de alineamiento del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-9B-oQ3.5-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Qwen3.5-9B: no disponible en la información proporcionada
- Paper, blog o demo del modelo: no disponible en la información proporcionada
