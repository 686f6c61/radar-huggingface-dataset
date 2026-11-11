# scottlowry/Swift-Qwen3.8-27b-oQ6e-mtp

## Resumen

Swift-Qwen3.8-27b-oQ6e-mtp es una cuantizacion mixta del modelo ukisai/Swift-Qwen3.8-27b, publicada por el usuario scottlowry. Se ha generado con la herramienta oQ (oMLX v0.7.4.dev1), especializada en cuantizacion de precision mixta para el ecosistema MLX de Apple Silicon. El checkpoint resultante pesa 23,9 GB en disco y contiene 27.781 millones de parametros logicos, con un promedio efectivo de 6,872 bits por peso.

El modelo conserva tres componentes diferenciados: el modelo de lenguaje (26.896B parametros), un codificador de vision (0,461B) y una cabeza MTP (Multi-Token Prediction) de 0,425B. La presencia de vision y de MTP indica que el modelo base es multimodal y que incorpora decodificacion especulativa nativa mediante prediccion de multiples tokens.

La relevancia de esta ficha es doble: por un lado documenta una tecnica de cuantizacion mixta que asigna distintos anchos de bit segun la sensibilidad de cada tensor, y por otro ilustra el estado del ecosistema MLX para ejecutar modelos de ~28B en hardware Apple. No obstante, la informacion publicada por el autor es muy limitada: no hay model card descriptiva, ni benchmarks, ni licencia declarada, ni lista de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, tag `qwen3_5`); incluye vision encoder y cabeza MTP |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 6-bit grupo 64 (88,345% de los pesos), affine 8-bit grupo 64 (9,798%), BF16 (1,857%); media efectiva 6,872 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), 23,9 GB de repo, 22,226 GiB de pesos |
| Libreria | mlx |
| Modelo base | ukisai/Swift-Qwen3.8-27b |
| Herramienta de cuantizacion | oQ (oMLX v0.7.4.dev1) |
| Desglose por componente | Lenguaje 26,896B (20,979 GiB); vision 0,461B (0,858 GiB); MTP 0,425B (0,389 GiB) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Qwen3.5, segun el tag `qwen3_5` del repositorio, y es un transformer multimodal: el desglose de pesos confirma la existencia de un modulo de vision de 0,461B parametros ademas del modelo de lenguaje. Incorpora ademas una cabeza MTP (Multi-Token Prediction) de 0,425B parametros, un mecanismo de decodificacion especulativa que predice varios tokens por paso y acelera la generacion en inferencia.

Sobre el entrenamiento del modelo base no hay informacion publicada en los datos disponibles: se desconoce el numero de tokens, la composicion del dataset, si hubo RLHF, DPO u otras fases de alineamiento. La unica innovacion tecnica documentada es la propia cuantizacion: oQ aplica precision mixta asignando 6 bits a la mayoria de tensores (88,3%), 8 bits a un 9,8% presumiblemente mas sensible y manteniendo un 1,9% en BF16, lo que reduce el peso a 22,2 GiB con una perdida de precision teoricamente menor que una cuantizacion uniforme de 6 bits.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5, aunque sin documentacion especifica en este repositorio.
- Procesamiento de vision: el checkpoint incluye un vision encoder de 0,461B parametros, por lo que el modelo es multimodal imagen-texto.
- Decodificacion especulativa mediante cabeza MTP: acelera la generacion al predecir multiples tokens por paso.
- Capacidades multilingues: no disponibles en la informacion publicada.
- Tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Modo thinking: no confirmado en la informacion disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el peso de 22,2 GiB permiten ejecutar el modelo en Macs con memoria unificada de 32 GB o superior, algo inviable con el checkpoint en BF16 (unos 55 GB).
- Procesamiento de documentos con imagenes: el vision encoder integrado permite extraer y razonar sobre texto en capturas, escaneos o graficos dentro de un flujo local sin enviar datos a la nube.
- Prototipado rapido de asistentes multimodales: al ser un checkpoint MLX listo para cargar con `mlx-lm`/`mlx-vlm`, sirve para validar ideas de producto en un portatil antes de invertir en infraestructura GPU.
- Generacion de texto acelerada por MTP: en aplicaciones interactivas donde la latencia importa (chat, autocompletado), la cabeza de prediccion multi-token reduce el tiempo por token generado.
- Investigacion sobre cuantizacion mixta: el checkpoint es un caso de estudio reproducible de como oQ distribuye 6, 8 y 16 bits entre tensores y el impacto en tamano y calidad.
- Evaluacion comparativa de tecnicas de cuantizacion: permite contrastar el resultado de oQ frente a GGUF Q6_K o MLX uniforme de 6 bits sobre el mismo modelo base.
- Fine-tuning ligero o LoRA sobre base cuantizada: aunque limitado por la cuantizacion, sirve para experimentar con adaptadores sobre un modelo de ~28B en hardware de consumo Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 22,2 GiB solo para pesos; con overhead de contexto y cache KV, se recomienda un minimo de 32 GB de memoria unificada, y 48-64 GB para contextos largos o uso multimodal.
- Hardware objetivo: Apple Silicon (M1/M2/M3/M4 Pro, Max y Ultra) por el formato MLX; no es directamente ejecutable en GPU NVIDIA sin conversion.
- GPU NVIDIA: no aplica en su formato actual; requeriria conversion a otro formato (por ejemplo GGUF o safetensors estandar) para usarse con CUDA.
- Cabe en GPU de consumo: no en su formato MLX; una conversion a GGUF Q6 de ~22 GB cabria en RTX 4090 (24 GB) de forma muy ajustada, y en RTX 3090 (24 GB) con contexto reducido.
- Opciones de despliegue: `mlx-lm` y `mlx-vlm` para texto y vision respectivamente; `mlx_lm.server` para exponer una API compatible con OpenAI.
- Latencia y throughput: no disponibles en la informacion publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Swift-Qwen3.8-27b-oQ6e-mtp (este) | 27,78B | no disponible | MLX safetensors, 6,872 bits/peso | no disponible | Vision + MTP, 22,2 GiB |
| ukisai/Swift-Qwen3.8-27b (base) | ~27,8B | no disponible | safetensors BF16 | no disponible | Modelo original sin cuantizar, ~55 GB |
| Qwen3.5 (familia, tag `qwen3_5`) | no disponible | no disponible | safetensors, GGUF | no disponible | Familia de origen del modelo base |
| Cuantizacion MLX uniforme 6-bit del mismo base | ~27,8B | no disponible | MLX safetensors | no disponible | Referencia para medir la ganancia de oQ mixto |

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no hay informacion sobre entrenamiento, alineamiento, idiomas ni evaluaciones; no es apto para produccion sin una evaluacion propia previa.
- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor del modelo base (ukisai) antes de desplegarlo.
- Cuantizacion con perdida: aunque mixta, la media de 6,872 bits/peso implica degradacion respecto al BF16, especialmente en tareas de razonamiento matematico y codigo.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin benchmarks ni evaluaciones publicadas no hay forma de cuantificarlo.
- Sesgos: no documentados; se heredan los del modelo base, desconocidos.
- Idiomas: no declarados; no se puede garantizar un rendimiento aceptable en castellano sin pruebas.
- Dependencia de hardware Apple: el formato MLX limita el despliegue a Apple Silicon o a una conversion manual a otro formato.
- Repositorio con 0 descargas y 0 likes: sin validacion de la comunidad, creado y actualizado el mismo dia (11 de noviembre de 2026); tratar como experimental.
- Compatibilidad de la cabeza MTP: su correcto funcionamiento depende del soporte de la version concreta de `mlx-lm`; verificar antes de confiar en la aceleracion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scottlowry/Swift-Qwen3.8-27b-oQ6e-mtp
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
