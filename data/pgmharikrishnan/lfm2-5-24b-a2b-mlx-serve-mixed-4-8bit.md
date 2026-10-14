# pgmharikrishnan/LFM2.5-24B-A2B-MLX-Serve-mixed-4-8bit

## Resumen

Esta ficha describe la version cuantizada y optimizada para `mlx-serve` del modelo LiquidAI/LFM2.5-24B-A2B, publicada por el usuario pgmharikrishnan. Se trata de una conversion derivada del checkpoint original en bf16, pensada especificamente para ejecucion sobre Apple Silicon mediante el stack MLX. El modelo subyacente es un transformer de tipo mezcla de expertos (MoE) desarrollado por LiquidAI, con 24.724 millones de parametros totales y una nomenclatura A2B que indica del orden de 2.000 millones de parametros activos por token.

El valor anadido de esta publicacion no esta en el modelo base sino en la receta de cuantizacion mixta: los expertos enrutados se almacenan en 4 bits afines con tamano de grupo 64 y se apilan en bancos 3D para activar los kernels Metal nativos de decodificacion de mlx-serve, mientras que las proyecciones del tronco (atencion, convoluciones y capas MLP densas 0-1) se mantienen en 8 bits para preservar la fidelidad del enrutamiento. Los embeddings quedan en 6 bits y las puertas del router, las normalizaciones y la convolucion depthwise permanecen en bf16 verbatim.

Es relevante ahora porque demuestra que la cuantizacion selectiva por tipo de capa permite ganancias de throughput muy grandes sobre hardware consumer de Apple sin sacrificar la puntuacion de calidad reportada por el propio autor. El repositorio ocupa 14,0 GB y esta sujeto a la licencia LFM 1.0 del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE sobre transformer (tag `lfm2_moe`, 38 capas x 64 expertos enrutados) |
| Parametros totales | 24.724.465.280 (24,72 mil millones, dato real de safetensors) |
| Parametros activos | Aproximadamente 2.000 millones (inferido de la nomenclatura A2B; no confirmado de forma explicita en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: 4 bits affine grupo 64 (expertos enrutados), 8 bits affine grupo 64 (proyecciones del tronco), 6 bits affine grupo 64 (embeddings), bf16 verbatim (puertas del router, normalizaciones, convolucion depthwise) |
| Idiomas soportados | no disponible |
| Licencia | LFM 1.0 (`lfm1.0`, declarada como "other" en HuggingFace) |
| Formato de pesos | safetensors, formato MLX |
| Libreria | mlx-serve |
| Tamano del repositorio | 14,0 GB |
| Modelo base | LiquidAI/LFM2.5-24B-A2B |
| Relacion con el base | quantized |

## Arquitectura y entrenamiento

La arquitectura del modelo base es una mezcla de expertos (MoE) con 38 capas y 64 expertos por capa, segun la receta de conversion documentada. El modelo deriva del checkpoint original en bf16 de LiquidAI/LFM2.5-24B-A2B, por lo que la arquitectura completa, los datos de entrenamiento originales (numero de tokens y composicion del dataset) y las etapas de alineamiento (RLHF, DPO u otras) no se detallan en la informacion proporcionada y deben consultarse en la model card del modelo base.

La innovacion tecnica de esta publicacion concreta es la receta de cuantizacion selectiva y su integracion con kernels Metal especificos. Los expertos enrutados se cuantizan a 4 bits con grupo 64 y se apilan en tres bancos 3D (`switch_mlp.gate_proj`, `switch_mlp.up_proj`, `switch_mlp.down_proj`) para habilitar los kernels nativos `gatherQmvGateUp` y `gatherQmvDownReduce` de mlx-serve. Las proyecciones compartidas (atencion, convolucion de entrada y salida y las capas MLP densas 0-1) se suben a 8 bits para retener una fidelidad cercana a bf16 en las representaciones compartidas, evitando la degradacion del enrutamiento con un coste de memoria adicional de aproximadamente 550 MB. Los embeddings se codifican a 6 bits, mientras que las puertas del router se mantienen en bf16 (con el sesgo de seleccion de expertos en float32) para no perturbar la eleccion de expertos.

## Capacidades

- Generacion de texto conversacional: la pipeline declarada es `text-generation` con soporte conversacional.
- Razonamiento y generacion en lenguaje natural: capacidades heredadas del modelo base LFM2.5-24B-A2B.
- Arquitectura MoE con enrutamiento disperso: solo se activa una fraccion de los 24,72 mil millones de parametros por token, lo que reduce el coste de computo respecto a un modelo denso equivalente.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (el campo de idiomas no esta cumplimentado).
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.
- Ejecucion optimizada en Apple Silicon mediante mlx-serve y kernels Metal nativos.

## Casos de uso

- Inferencia local en equipos Apple Silicon: la cuantizacion mixta y los kernels Metal permiten servir el modelo en un Mac con memoria unificada suficiente, con un throughput de decodificacion de hasta 194 tok/s en modo "plain decode" segun las mediciones del autor.
- Asistentes conversacionales embebidos: el modelo soporta la pipeline de generacion de texto conversacional y puede desplegarse con `mlx-serve serve` en un puerto local para alimentar interfaces de chat.
- Prototipado rapido de aplicaciones MoE: sirve para experimentar con un modelo de mezcla de expertos de ~24,7 mil millones de parametros sin necesidad de infraestructura con GPU dedicada.
- Evaluacion comparativa de tecnicas de cuantizacion: al publicarse junto a las metricas frente al stock de 4 bits de LiquidAI, es util como caso de estudio de cuantizacion selectiva por capa.
- Servicio de generacion de texto en red local: el comando de despliegue permite exponer el modelo como endpoint HTTP en un puerto concreto para integraciones internas.
- Investigacion sobre el equilibrio entre velocidad y calidad en cuantizacion: la receta documentada (4/6/8 bits por tipo de capa) sirve de referencia reproducible para estudiar el impacto del bit-width por componente.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los del arnes de onboarding de mlx-serve sobre Apple Silicon, comparando esta cuantizacion mixta frente al `LiquidAI/LFM2.5-24B-A2B-MLX-4bit` de referencia. No son benchmarks academicos estandar y la escala del "Quality Score" no se especifica.

| Metrica | Stock 4-bit (LiquidAI) | Mixta 4-8 bit (esta publicacion) | Delta |
|---|---|---|---|
| Plain decode | 85,68 tok/s | 194,14 tok/s | +126,6 % (2,26x) |
| Plain prefill | 409,71 tok/s | 721,88 tok/s | +76,2 % |
| Best decode | 180,45 tok/s | 191,03 tok/s | +5,9 % |
| Best prefill | 482,32 tok/s | 734,13 tok/s | +52,2 % |
| Quality score | 64,4 | 65,1 | +0,7 |
| Repeatability | 100,0 | 100,0 | Paridad |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los resultados de busqueda web consultados no contienen informacion relevante sobre este modelo.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 14,0 GB, por lo que se necesita ese espacio en disco mas el margen para la cache de conversion de MLX.
- Memoria para inferencia: al estar pensado para memoria unificada de Apple Silicon, se requiere un equipo con al menos 16 GB de memoria unificada para el peso del modelo, y de forma recomendada 24-32 GB para dejar margen al contexto y a la cache de KV.
- GPU compatibles: el formato y los kernels apuntan especificamente a Apple Silicon (Metal). No se documenta soporte para A100, H100 o RTX 4090 en esta publicacion concreta, ya que los pesos estan en formato MLX y dependen de kernels Metal propietarios de mlx-serve.
- Encaje en GPU consumer: apto para Mac con chip de la familia Apple Silicon con memoria unificada suficiente; no aplicable a GPU consumer NVIDIA con este formato tal cual.
- Opciones de despliegue: `mlx-serve` (comando `mlx-serve serve --model pgmharikrishnan/LFM2.5-24B-A2B-MLX-Serve-mixed-4-8bit --port 11234`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: hasta 194,14 tok/s en decodificacion y 721,88 tok/s en prefill en modo "plain" segun el arnes del autor, en hardware Apple Silicon no especificado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Esta publicacion (mixta 4-8 bit, mlx-serve) | 24,72 MM totales / ~2 MM activos | no disponible | 194,14 tok/s decode, 721,88 tok/s prefill, quality 65,1 | LFM 1.0 | HuggingFace, formato MLX |
| LiquidAI/LFM2.5-24B-A2B-MLX-4bit (stock) | 24,72 MM totales / ~2 MM activos | no disponible | 85,68 tok/s decode, 409,71 tok/s prefill, quality 64,4 | LFM 1.0 | HuggingFace, formato MLX |
| LiquidAI/LFM2.5-24B-A2B (bf16 original) | 24,72 MM totales / ~2 MM activos | no disponible | no disponible | LFM 1.0 | HuggingFace, safetensors bf16 |

No se dispone de datos suficientes en la informacion proporcionada para comparar con modelos de otras familias.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; deben consultarse en la model card del modelo base.
- Riesgo de alucinacion: no cuantificado en esta publicacion; inherente a los modelos generativos de lenguaje.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada y el campo de idiomas no esta cumplimentado; no se puede garantizar cobertura multilingue.
- Restricciones de licencia: la licencia es LFM 1.0 (etiquetada como "other" en HuggingFace). Es una licencia propia de LiquidAI que puede imponer condiciones especificas al uso comercial; es imprescindible revisar el archivo LICENSE antes de un despliegue en produccion.
- Dependencia de hardware: los kernels Metal nativos (`gatherQmvGateUp`, `gatherQmvDownReduce`) y el formato MLX limitan el despliegue a Apple Silicon con mlx-serve; no es portable directamente a stacks CUDA.
- Fidelidad de la cuantizacion: aunque el autor reporta una mejora de calidad frente al stock de 4 bits, las capas cuantizadas a 4 y 6 bits pueden degradar tareas sensibles, especialmente en enrutamiento fino de expertos.
- Trazabilidad: se trata de una publicacion de terceros (usuario pgmharikrishnan) con 0 descargas y 0 likes en el momento de la consulta, sin revision externa independiente.
- Metricas no reproducibles de forma directa: el "quality score" no viene acompanado de la escala ni del conjunto de evaluacion, por lo que su interpretacion es limitada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/pgmharikrishnan/LFM2.5-24B-A2B-MLX-Serve-mixed-4-8bit
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Licencia LFM 1.0 (archivo LICENSE del repositorio): https://huggingface.co/pgmharikrishnan/LFM2.5-24B-A2B-MLX-Serve-mixed-4-8bit/blob/main/LICENSE
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada.
