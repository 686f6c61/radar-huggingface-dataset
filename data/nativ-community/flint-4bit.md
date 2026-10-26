# nativ-community/flint-4bit

## Resumen

Flint 4bit es una conversión cuantizada a 4 bits del modelo RecursiveSI/flint, publicada por el colectivo nativ-community. Se trata de un modelo de generación de texto con arquitectura de mezcla de expertos (MoE), con 39.785.299.488 parámetros totales según los safetensors del repositorio, convertido con MLX-VLM 0.7.10 y MLX 0.32.4 para su ejecución en Apple Silicon. La conversión parte de la revisión `2a247be0c0aec895ccb0ac7ca92229ec6df37288` del modelo original y preserva tokenizador, plantilla de chat, valores por defecto de generación y licencia Apache 2.0 sin modificaciones.

El interés de esta publicación es práctico: reduce el peso del repositorio a 22,4 GB y permite ejecutar un modelo de casi 40.000 millones de parámetros en equipos con memoria unificada de gama alta, mediante cuantización afín de 4 bits con grupo de 64 y un tratamiento específico de los 47 routers MoE, que se mantienen en 8 bits para limitar la degradación del enrutado. Es, por tanto, una pieza pensada para inferencia local en macOS, no para despliegues en clúster con CUDA.

La model card es explícita sobre el alcance de la validación: se han ejecutado comprobaciones de recarga estricta, logits finitos en prefill y decode, verificación de posiciones de caché, aritmética, recuperación de información en contexto corto y generación de una función simple en Python sobre un Apple M5 Max. No son benchmarks de calidad ni una prueba de equivalencia con los pesos BF16 originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); la model card menciona 47 routers MoE. Número de capas, dimensión y esquema de atención: no disponible |
| Parámetros totales | 39.785.299.488 (39,8 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens como ventana combinada de prompt y salida, según la configuración del modelo origen |
| Tipos de cuantización | 4 bits afín (`affine`), grupo de 64, en todos los pesos; routers MoE en 8 bits afín, grupo de 64; normas, attention sinks y demás parámetros no cuantizados en BF16. Solo se publica esta variante |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (pesos cuantizados); repositorio de 22,4 GB |
| Valores por defecto de generación | temperature 1.0, top-p 0.95, top-k 20 |
| Runtime de referencia | MLX-VLM 0.7.10 (commit `6d9ba328abbd6129c7461eda86280aa9fbfd9986`), MLX 0.32.4 |

## Arquitectura y entrenamiento

La información disponible confirma una arquitectura de mezcla de expertos con 47 routers, lo que implica un diseño con capas de atención compartidas y múltiples expertos por capa; sin embargo, la model card de esta conversión remite a la ficha del modelo origen para los detalles de arquitectura, composición del dataset, número de tokens de entrenamiento y si hubo RLHF, DPO u otras etapas de alineamiento. Esos datos no están disponibles en la información proporcionada.

La innovación técnica documentada aquí no está en el entrenamiento, sino en el proceso de cuantización. La conversión se realizó con `mlx_vlm.convert` usando `--dtype bfloat16 -q --q-bits 4 --q-group-size 64 --q-mode affine`, con conservación de la precisión específica de los routers (8 bits) y exclusión de la cuantización para parámetros de normalización y attention sinks, que permanecen en BF16. El repositorio incluye `conversion.json` con las opciones, las sustituciones por módulo y los hashes SHA-256 de cada shard, además de `SHA256SUMS` para el conjunto de artefactos publicados. La plantilla de chat original mantiene el control del modo de razonamiento, sin ninguna opción añadida para desactivarlo.

## Capacidades

- Generación de texto conversacional y continuaciones de código; las pruebas de humo publicadas incluyen la escritura de una función Python para fusionar intervalos solapados.
- Modo de razonamiento (thinking) heredado de la plantilla del modelo origen: el razonamiento consume presupuesto de salida, por lo que tareas complejas requieren un límite de tokens mayor.
- Ventana de contexto nominal de 262.144 tokens combinados de prompt y salida, según la configuración del modelo base; la calidad en contexto largo no está validada en esta conversión.
- Capacidad multimodal: el repositorio está etiquetado con `mlx-vlm` y la conversión se realizó con MLX-VLM, lo que indica soporte de entrada de imagen en el runtime; el alcance concreto (resolución, número de imágenes, tareas soportadas) no está documentado en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modo de razonamiento de la plantilla es el único mecanismo descrito.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas.
- Capacidades de audio: no disponible.
- Recuperación de información en contexto corto: verificada como prueba de humo, no como evaluación de calidad.

## Casos de uso

- Asistente de programación local en macOS: el modelo puede generar y completar funciones en Python y otros lenguajes sobre un Mac con memoria unificada suficiente, sin enviar código a servicios externos, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Análisis de repositorios y documentos largos: la ventana combinada de 262.144 tokens permite cargar varios ficheros o un corpus documental extenso en una sola pasada; conviene validar empíricamente la calidad en las posiciones lejanas del contexto antes de confiar en ella.
- Prototipado de razonamiento paso a paso: activando el modo thinking de la plantilla y ampliando el presupuesto de salida, el modelo sirve para generar cadenas de razonamiento en tareas de matemáticas o lógica durante la fase de experimentación.
- Revisión y reescritura de textos técnicos: generación con temperature 1.0 y top-p 0.95 por defecto; para tareas de reescritura conviene bajar la temperatura y fijar la semilla, ya que los valores por defecto están orientados a creatividad.
- Inferencia offline en portátiles Apple Silicon: al ocupar 22,4 GB en disco y requerir del orden de 20 GB de memoria para los pesos, es viable en equipos de 32 GB o más, lo que habilita demos y pruebas de concepto sin GPU dedicada.
- Evaluación de cuantización y de robustez: útil como banco de pruebas para medir cuánto cambia el comportamiento de un MoE de 40 B al pasar a 4 bits afín, comparando contra los pesos BF16 del modelo origen.
- Procesamiento de documentación con imágenes: si se confirma la ruta multimodal mediante MLX-VLM, podría emplearse para extraer y resumir información de capturas o páginas escaneadas; la falta de documentación al respecto obliga a verificarlo antes de integrarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los pesos convertidos no se han evaluado sobre la suite de benchmarks publicada por el modelo origen, y que las comprobaciones realizadas son pruebas de humo: recarga estricta del checkpoint, logits finitos en prefill y decode, verificación de posiciones de caché, aritmética, recuperación en contexto corto y generación de una función Python (analizada como AST, no ejecutada), todo con decodificación greedy y un presupuesto de 512 tokens sobre un Apple M5 Max.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: en torno a 20-22 GB solo para los pesos (39,8 B a 4 bits ≈ 19,9 GB, más routers en 8 bits y parámetros en BF16; el repositorio ocupa 22,4 GB). Hay que añadir la caché KV, que crece con la longitud de contexto y no está cuantificada en la información disponible.
- Apple Silicon: validado en un Apple M5 Max con MLX 0.32.4. Configuraciones realistas: equipos con 32 GB de memoria unificada como mínimo, y 48-64 GB o más para aprovechar contextos largos.
- GPU dedicadas: MLX no se ejecuta sobre CUDA, por lo que estos pesos no son utilizables directamente en A100, H100 o RTX 4090. Para usarlas habría que reconvertir desde el modelo base a otro runtime. Como referencia de tamaño, una RTX 4090 de 24 GB queda al límite y no dejaría margen para caché KV apreciable.
- Despliegue: `mlx_vlm.generate` con el commit fijado de MLX-VLM; también es posible cargar los pesos con MLX-LM para texto. vLLM, TGI, llama.cpp y Ollama no consumen pesos en formato MLX; requerirían partir de RecursiveSI/flint y convertir a safetensors estándar o GGUF.
- Latencia y throughput: no disponibles. No se publican métricas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de las alternativas son valores públicos de referencia; la columna de Flint 4bit refleja únicamente lo documentado en esta conversión. No existe base para comparar rendimiento porque no hay benchmarks publicados de esta cuantización.

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato/runtime |
|---|---|---|---|---|---|
| Flint 4bit (nativ-community) | 39,8 B | no disponible | 262.144 tokens (combinado) | Apache 2.0 | safetensors MLX, 4 bits afín |
| RecursiveSI/flint (origen) | 39,8 B | no disponible | 262.144 tokens (combinado) | Apache 2.0 | safetensors BF16 |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF, múltiples runtimes |
| Qwen2.5-32B | 32,5 B | denso | 32.768 tokens nativos (ampliable por YaRN) | Apache 2.0 | safetensors, GGUF, AWQ, GPTQ |
| Gemma 3 27B | 27 B | denso | 128.000 tokens | licencia Gemma | safetensors, GGUF, MLX |

La diferencia práctica más relevante frente a las alternativas no es de calidad —no hay datos para afirmarlo— sino de ecosistema: Flint 4bit solo se distribuye en formato MLX, mientras que Mixtral, Qwen2.5 y Gemma 3 tienen conversiones GGUF y soporte en llama.cpp, vLLM y Ollama.

## Limitaciones y advertencias

- No hay evaluación de calidad: la propia model card advierte que las pruebas realizadas son de humo y que la cuantización puede alterar las respuestas respecto a BF16, sin que se haya medido cuánto.
- La calidad en contexto largo no está validada; los 262.144 tokens son un límite de configuración, no una garantía de rendimiento en esa longitud.
- Sesgos conocidos: no disponible. Al no documentarse la composición del dataset de entrenamiento, no es posible caracterizar los sesgos del modelo.
- Riesgo de alucinación: no cuantificado. Al no haber benchmarks ni evaluación de factualidad, debe asumirse el riesgo habitual de un modelo generativo sin datos que lo acoten.
- Idiomas: no se declara soporte de castellano ni de ninguna otra lengua; el comportamiento multilingüe es desconocido.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero la licencia se hereda del modelo origen y conviene revisar la ficha de RecursiveSI/flint por si añade condiciones adicionales.
- Dependencia de hardware: los pesos en formato MLX limitan el despliegue a Apple Silicon; no hay ruta directa a CUDA sin reconversión.
- Dependencia de versiones: el proceso se validó con MLX-VLM 0.7.10 (commit concreto) y MLX 0.32.4; otras versiones pueden alterar el comportamiento de carga o de cuantización.
- Modo thinking no desactivable desde la configuración de esta conversión: el razonamiento consume presupuesto de salida, lo que puede truncar respuestas si el límite de tokens es corto.
- Madurez: el repositorio registra 0 descargas y 0 likes, y no consta validación por parte de terceros.

## Enlaces

- [nativ-community/flint-4bit en HuggingFace](https://huggingface.co/nativ-community/flint-4bit)
- [Modelo base RecursiveSI/flint](https://huggingface.co/RecursiveSI/flint)
- [Revisión del modelo base utilizada](https://huggingface.co/RecursiveSI/flint/tree/2a247be0c0aec895ccb0ac7ca92229ec6df37288)
- [MLX-VLM, commit fijado para la conversión](https://github.com/Blaizzy/mlx-vlm/commit/6d9ba328abbd6129c7461eda86280aa9fbfd9986)
- [conversion.json](https://huggingface.co/nativ-community/flint-4bit/blob/main/conversion.json)
- [validation.json](https://huggingface.co/nativ-community/flint-4bit/blob/main/validation.json)
- [SHA256SUMS](https://huggingface.co/nativ-community/flint-4bit/blob/main/SHA256SUMS)
- Repositorio oficial de MLX: no disponible en la información proporcionada.
