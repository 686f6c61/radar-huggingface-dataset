# scottlowry/Qwen3.5-9B-oQ8e-mtp

## Resumen

Qwen3.5-9B-oQ8e-mtp es una cuantizacion mixta del modelo Qwen/Qwen3.5-9B, publicada por el usuario scottlowry. El checkpoint conserva la arquitectura original de Qwen3.5 con 9.653 millones de parametros y anade una cabeza MTP (multi-token prediction) de 0.243 mil millones de parametros, ademas de un modulo de vision de 0.456 mil millones. El resultado es un artefacto de 9.980 GiB en formato MLX, pensado para ejecucion local en hardware Apple Silicon.

La cuantizacion se ha realizado con oQ (oMLX v0.7.4.dev1) en precision mixta: el 94.917% de los pesos logicos se almacena en affine 8-bit con grupo de 64, mientras que el 5.083% restante se mantiene en BF16. La media efectiva es de 8.881 bits por peso. Esto reduce el espacio de almacenamiento respecto al modelo base en BF16 sin degradar de forma uniforme todas las capas, ya que la herramienta decide que tensores requieren mayor precision.

El interes practico del checkpoint es acotado pero claro: permite probar Qwen3.5-9B en Macs con memoria unificada moderada, con soporte de vision y de decodificacion especulativa mediante la cabeza MTP, usando el stack MLX. No es un modelo nuevo ni un fine-tune: es una distribucion cuantizada de un modelo base de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 con cabeza MTP y modulo de vision (detalle de capas no disponible) |
| Parametros totales | 9.653.104.368 (9.653B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 8-bit grupo 64 (94.917% de pesos) + BF16 (5.083%); media efectiva 8.881 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8.954B | 9.514 GB / 8.861 GiB |
| Vision | 0.456B | 0.912 GB / 0.849 GiB |
| Cabeza MTP | 0.243B | 0.290 GB / 0.270 GiB |
| Total | 9.653B | 10.716 GB / 9.980 GiB |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base Qwen/Qwen3.5-9B, del que no se aportan detalles de configuracion en la informacion disponible (numero de capas, dimension oculta, atencion, etc.). Lo que si se documenta es la estructura del artefacto cuantizado: un tronco de lenguaje de 8.954B parametros, un modulo de vision de 0.456B y una cabeza MTP de 0.243B. La presencia de MTP sugiere soporte para decodificacion especulativa o prediccion de varios tokens por paso, aunque el autor no describe el mecanismo de inferencia.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens, el proceso de alineacion (RLHF, DPO) ni innovaciones tecnicas del modelo base. El autor de la cuantizacion unicamente documenta el proceso de oQ: cuantizacion de precision mixta con seleccion automatica de que tensores van a 8-bit y cuales permanecen en BF16. La ficha del repositorio indica una re-cuantizacion con oMLX v0.7.4.dev1 el 2026-11-11, por lo que las copias anteriores deben descartarse.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5-9B; el alcance concreto no esta documentado en la informacion disponible.
- Procesamiento de vision: el checkpoint incluye un modulo de vision de 0.456B parametros, lo que implica capacidad multimodal de entrada de imagen.
- Prediccion multi-token (MTP): la cabeza de 0.243B parametros esta presente en el checkpoint, orientada a decodificacion especulativa o generacion acelerada.
- Codigo y matematicas: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking explicito: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint en formato MLX esta pensado para ejecutarse con el stack MLX en Macs; sus 9.980 GiB de pesos permiten cargarlo en equipos con memoria unificada de 16 GB o superior, segun el overhead del runtime.
- Pruebas de modelos multimodales en local: al incluir modulo de vision, sirve para validar pipelines de imagen-texto en entornos de desarrollo sin GPU dedicada.
- Evaluacion de decodificacion especulativa: la cabeza MTP permite experimentar con generacion acelerada por prediccion multi-token dentro de MLX.
- Prototipado de asistentes sobre documentos: con un modelo de ~9.6B y contexto no documentado, es adecuado para prototipos de resumen y Q&A en local antes de escalar a despliegues en servidor.
- Benchmarking de cuantizacion: util para comparar la calidad de oQ 8-bit mixto frente al modelo base en BF16 en tareas concretas, midiendo la perdida introducida por la cuantizacion.
- Desarrollo de aplicaciones macOS/iOS con MLX: integrable en flujos de trabajo que usan la libreria mlx para inferencia on-device en el ecosistema Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 9.980 GiB de pesos en disco; en memoria unificada se requiere al menos esa cifra mas el overhead de activaciones y KV cache, por lo que 16 GB es el minimo practico y 24-32 GB es recomendable.
- GPU recomendadas: el formato es MLX, orientado a Apple Silicon (series M1/M2/M3/M4). No esta pensado para CUDA; en GPUs NVIDIA no es directamente utilizable sin conversion.
- Cabe en consumer GPU: en el ecosistema Apple, si, en equipos con 16 GB o mas de memoria unificada. En GPUs NVIDIA consumer no aplica por el formato.
- Opciones de despliegue: libreria MLX (mlx, mlx-lm) y el tooling oMLX asociado. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-oQ8e-mtp | 9.653B | no disponible | MLX safetensors 8-bit mixto | no disponible | Cuantizacion de terceros con vision y MTP |
| Qwen/Qwen3.5-9B (base) | ~9.4B (sin MTP ni vision cuantizados) | no disponible | safetensors BF16 | no disponible | Modelo original; mayor precision, mayor peso en disco |
| Alternativas de ~9B en MLX | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de datos de rendimiento comparado (benchmarks) para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del checkpoint ni la del modelo base en la informacion disponible; verificar antes de cualquier uso comercial.
- Cuantizacion con perdida: aunque sea 8-bit mixto, la cuantizacion introduce degradacion respecto al BF16 original; no hay evaluacion publicada del impacto.
- Dependencia del modelo base: cualquier sesgo, alucinacion o limitacion de Qwen3.5-9B se hereda; no se documentan sesgos conocidos.
- Idiomas no documentados: no se indica que lenguas soporta el modelo base en esta ficha.
- Contexto no documentado: se desconoce la longitud de contexto efectiva, lo que impide planificar cargas de contexto largo.
- Formato restringido: al ser MLX, no es portable a CUDA sin conversion; limita su uso a Apple Silicon.
- Versionado: el autor indica que se re-cuantizo el 2026-11-11 y que las copias anteriores deben descartarse; conviene fijar el commit exacto en produccion.
- Baja traccion: 80 descargas y 0 likes en el momento de la consulta; no hay validacion comunitaria significativa.
- Sin benchmarks: no se puede afirmar calidad ni rendimiento sin evaluacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Qwen3.5-9B-oQ8e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Libreria MLX: https://github.com/ml-explore/mlx
