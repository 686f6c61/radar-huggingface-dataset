# bambocher/Qwen3.5-4B-heretic-oQ2.5e-mtp

## Resumen

Qwen3.5-4B-heretic-oQ2.5e-mtp es una cuantizacion mixta del modelo Qwen3.5-4B, publicada por el usuario bambocher en Hugging Face. El checkpoint conserva el modelo de lenguaje, la torre de vision y una cabeza MTP (multi-token prediction), con un total real de 4.659.865.088 parametros segun los safetensors del repositorio. El prefijo "heretic" sugiere un ajuste orientado a reducir el rechazo de contenido (abliteration o similar), aunque la model card no lo documenta explicitamente.

La cuantizacion se ha realizado con oQ (oMLX v0.7.3), una herramienta de cuantizacion de precision mixta que asigna distintos esquemas de bits por tensor segun su sensibilidad. El resultado es un checkpoint de 2,56 GB con un promedio efectivo de 4,394 bits por peso, lo que lo hace atractivo para inferencia en Apple Silicon mediante MLX. La biblioteca declarada es mlx, no transformers, lo que limita su uso fuera del ecosistema MLX.

El modelo es relevante para quienes necesitan ejecutar un modelo multimodal de ~4,7B parametros con contexto y capacidades de Qwen3.5 en hardware con memoria unificada limitada, a costa de una perdida de precision no cuantificada por el autor y de una licencia no declarada en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3.5) con cabeza MTP; no disponible el detalle exacto |
| Parametros totales | 4.659.865.088 (4,66B) |
| Parametros activos | no disponible (no es MoE segun los datos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta oQ: affine 3-bit g128 (70,573%), affine 3-bit g64 (13,642%), affine 4-bit g64 (2,869%), affine 5-bit g64 (5,401%), affine 6-bit g64 (0,056%), BF16 (7,459%); promedio 4,394 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), libreria `mlx` |

## Arquitectura y entrenamiento

El checkpoint deriva de Qwen3.5-4B, un transformer denso con torre de vision (0,334B parametros) y una cabeza de prediccion multi-token (MTP, 0,121B parametros) que permite decodificacion especulativa nativa. El modelo de lenguaje concentra 4,206B parametros. La presencia de vision y MTP indica que el modelo base es multimodal y esta disenado para generacion con aceleracion por prediccion de multiples tokens.

La cuantizacion se realizo con oQ (oMLX v0.7.3) en modo de precision mixta: la mayor parte de los pesos (84,2%) se almacena en 3 bits, mientras que un 7,5% permanece en BF16 y pequenas fracciones usan 4, 5 y 6 bits. No se documentan datos de entrenamiento, composicion del dataset, ni si hubo RLHF/DPO en la model card. Tampoco se detalla el proceso de "heretic" (presumiblemente abliteration), ni se cuantifica el impacto de la cuantizacion sobre la calidad.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5-4B, aunque no verificadas en este checkpoint.
- Vision: incluye torre de vision de 0,334B parametros, por lo que se espera soporte de entrada de imagenes.
- Decodificacion especulativa: la cabeza MTP (0,121B) permite prediccion multi-token para acelerar la generacion.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.
- Ajuste "heretic": probable reduccion de rechazos, sin documentacion oficial.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint de 2,56 GB cabe en Macs con 8-16 GB de memoria unificada y se ejecuta con MLX, lo que permite prototipar un modelo multimodal en un portatil.
- Pruebas de cuantizacion extrema: util para investigar el impacto de la precision mixta (3-6 bits) sobre la calidad de un modelo de 4,7B con vision.
- Generacion asistida por MTP: la cabeza multi-token permite medir ganancias de throughput en decodificacion especulativa sobre MLX.
- Prototipos de asistentes multimodales: con torre de vision integrada, sirve para demos de descripcion de imagenes o VQA en local, siempre que se valide la calidad tras la cuantizacion.
- Experimentacion con modelos "heretic": para estudiar el efecto de la abliteration sobre la tasa de rechazo en un modelo pequeno.
- Evaluacion comparativa de checkpoints cuantizados: como referencia para comparar oQ frente a otras herramientas (GGUF, AWQ, GPTQ) en el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: ~2,56 GB de pesos; con overhead de MLX y cache KV, se recomienda al menos 6-8 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4) con memoria unificada; el formato MLX no esta pensado para CUDA.
- Cabe en consumer GPU: si, en Apple Silicon de gama media; en GPU NVIDIA requeriria conversion previa a otro formato (no incluida).
- Opciones de despliegue: `mlx-lm` / `mlx` (libreria declarada); no se garantiza compatibilidad con vLLM, llama.cpp, Ollama o TGI sin conversion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-heretic-oQ2.5e-mtp | 4,66B | no disponible | no disponible | safetensors MLX | Cuantizacion mixta 4,394 bits/peso, incluye vision y MTP |
| Qwen3.5-4B (base) | ~4,7B (inferido) | no disponible | no disponible | safetensors | Referencia sin cuantizar; calidad superior esperada |
| Alternativas cuantizadas GGUF de modelos ~4B | ~4B | variable | variable | GGUF | Compatibles con llama.cpp/Ollama; no equivalentes en arquitectura |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor y al modelo base.
- Cuantizacion agresiva (3 bits en el 84% de los pesos): perdida de calidad no cuantificada; riesgo de degradacion en razonamiento y codigo.
- Ajuste "heretic" no documentado: puede aumentar la probabilidad de contenido no filtrado o inapropiado; no apto para produccion sin evaluacion.
- Solo MLX: no se puede cargar directamente en transformers, vLLM o llama.cpp sin conversion.
- Riesgo de alucinacion: no evaluado en este checkpoint; se hereda del modelo base y puede agravarse por la cuantizacion.
- Idiomas y contexto no documentados: no se puede garantizar soporte multilingue ni longitud de ventana.
- Repositorio sin descargas ni likes: sin validacion comunitaria; tratar como experimental.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-4B-heretic-oQ2.5e-mtp
- oQ / oMLX: https://github.com/jundot/omlx
