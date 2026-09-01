# d0rj/GigaChat3-10B-A1.8B.dspark-base-dev

## Resumen

El repositorio `d0rj/GigaChat3-10B-A1.8B.dspark-base-dev` contiene un **modelo de propuesta especulativa (draft model) DSpark** diseñado para acelerar la inferencia del verifier congelado `ai-sage/GigaChat3-10B-A1.8B`, un modelo MoE de 10B parámetros (1.8B activos) con atención MLA y predicción multi-token. Este checkpoint no es un modelo de lenguaje independiente: su función es proponer hasta 7 tokens por paso que el verifier valida, reduciendo el número de pasos de decodificación.

El modelo fue desarrollado por `d0rj` como un experimento de investigación. Está entrenado sobre 200.000 filas deterministas del dataset ruso/inglés `t-tech/T-Wix` (428M tokens) y se publica con el objetivo de reproducir el experimento y apoyar futuros trabajos sobre adaptadores y entrenamiento. El autor advierte explícitamente que **no es un checkpoint listo para producción** y que, en la configuración probada (RTX 5070 Ti), la ruta DSpark no acelera de forma consistente al verifier.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSparkDraftModel (decodificacion especulativa), 3 capas transformer de draft |
| Parametros totales | 460.761.729 (~460M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Depende del verifier (GigaChat3-10B-A1.8B soporta hasta 262.144 tokens) |
| Tipos de cuantizacion | BF16 (pesos del draft), FP8 (checkpoint del verifier) |
| Idiomas soportados | Ruso, ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un **draft model de tres capas** con arquitectura transformer propia de DSpark: hidden size 1.536, intermediate size 8.960, 32 cabezas de atencion de consulta y 32 cabezas KV con dimension de cabeza 64. El vocabulario de draft tiene 32.000 tokens mapeados desde el vocabulario del verifier. Cada bloque especulativo cubre 8 posiciones (un ancla y hasta 7 tokens propuestos), con un rango de propuesta configurable de 1 a 7 tokens por paso. Incluye una cabeza de Markov de primer orden (rango 256) y una cabeza de confianza condicionada al embedding de Markov.

El entrenamiento se realizo desde cero con el verifier congelado, usando extraccion de estados ocultos en linea (sin persistir el corpus completo). Se utilizo un solo GPU RTX 5070 Ti de 16 GB bajo WSL2 con descarga por capas del verifier durante el entrenamiento. Los datos provienen de `t-tech/T-Wix` (mezcla SFT rusa/inglesa con instrucciones generales, razonamiento, matematicas, ciencia, codigo, dialogo y tareas de contexto largo), con un split 90/10 y secuencias limitadas a 8.192 tokens. El optimizador fue AdamW con learning rate 2e-4, weight decay 0.01 y scheduler coseno con warmup del 1%. El checkpoint liberado corresponde a la epoca 0, paso global 55.165.

## Capacidades

- **Propuesta especulativa**: genera entre 1 y 7 tokens candidatos por paso que el verifier valida, reduciendo potencialmente la latencia de decodificacion.
- **Integracion con vLLM**: se usa mediante el plugin `gigachat3-vllm-plugin` y el metodo `dflash` de vLLM, con configuracion de `num_speculative_tokens` entre 1 y 7.
- **Estados auxiliares del verifier**: utiliza las capas 2, 7, 13, 19 y 24 del verifier, mas el estado final normalizado, para condicionar la propuesta.
- **Soporte multilingue**: entrenado sobre datos en ruso e ingles, aunque su salida no es texto final sino propuestas de tokens.
- **Reproducibilidad**: incluye pesos de inferencia, estado completo de optimizador y scheduler, metricas de validacion, metadatos de continuacion, lanzadores exactos, eventos TensorBoard y artefactos de benchmark BS1/BS4.

## Casos de uso

- **Investigacion en decodificacion especulativa**: el checkpoint sirve como referencia para estudiar la eficacia de la arquitectura DSpark sobre un verifier MoE moderno, comparando tasas de aceptacion y velocidad en diferentes configuraciones de K.
- **Desarrollo de adaptadores y ajuste fino**: al publicar el estado completo del optimizador y los metadatos de entrenamiento, permite continuar el entrenamiento o inicializar variantes (por ejemplo, el checkpoint Large Dev con 5 capas).
- **Evaluacion de aceleracion en hardware consumer**: permite medir el impacto real de DSpark en GPUs de 16 GB (como RTX 5070 Ti) y comparar con decodificacion autoregresiva clasica.
- **Pruebas de integracion con vLLM**: sirve para validar la compatibilidad del plugin `gigachat3-vllm-plugin` con diferentes backends lineales y modos de captura CUDA Graph.
- **Analisis de datos de entrenamiento**: el dataset T-Wix y su preparacion (200.000 filas, 428M tokens) pueden reutilizarse para otros experimentos de entrenamiento de modelos especulativos.
- **Benchmarking de throughput**: los artefactos BS1/BS4 publicados permiten reproducir mediciones de latencia y throughput en configuraciones de un solo usuario.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks (como MMLU, HumanEval o GSM8K) en la informacion disponible. La model card menciona que se incluyen artefactos de benchmark BS1/BS4 en el repositorio, pero no se proporcionan valores concretos. El autor indica que en la configuracion probada (RTX 5070 Ti), la ruta DSpark **no acelera de forma consistente** al verifier, por lo que no se puede recomendar como solucion de produccion.

## Requisitos de hardware

- **VRAM estimada**: el draft model (~460M parametros en BF16) ocupa aproximadamente 0.9 GB. El verifier GigaChat3-10B-A1.8B en FP8 requiere alrededor de 11 GB (en Q4_K_M serian ~7.5 GB segun llmrun.dev, pero aqui se usa FP8). En conjunto, se necesita al menos 12-14 GB de VRAM.
- **GPU recomendadas**: el entrenamiento y las pruebas se realizaron en una RTX 5070 Ti de 16 GB. Cualquier GPU consumer con 16 GB o mas (RTX 4080/4090, RTX 5080/5090) deberia ser suficiente. No se recomienda para GPUs con menos de 12 GB.
- **Despliegue**: requiere vLLM 0.23 compatible y el plugin `gigachat3-vllm-plugin`. Se usa el comando `vllm serve` con `--speculative-config '{"model":"d0rj/GigaChat3-10B-A1.8B.dspark-base-dev","method":"dflash","num_speculative_tokens":3}'`. El modo CUDA Graph `PIECEWISE` es necesario; la captura completa no es compatible con la ruta MLA del verifier.
- **Latencia y throughput**: no se han publicado mediciones cuantitativas. El autor advierte que la aceleracion no es consistente en el hardware probado.

## Comparativa con modelos similares

No disponible. Este checkpoint es un modelo especifico de propuesta especulativa para un unico verifier (GigaChat3-10B-A1.8B). No existen comparativas directas con otros draft models (como EAGLE o Medusa) en la informacion proporcionada. Para comparar con el verifier base, se puede consultar el repositorio de `ai-sage/GigaChat3-10B-A1.8B`, que alcanza la calidad de Qwen3-4B con una velocidad ~1.5x superior a Qwen3-1.7B.

## Limitaciones y advertencias

- **Estado experimental**: el autor lo califica como checkpoint de desarrollo, no listo para produccion. La ruta DSpark no acelera de forma consistente al verifier en RTX 5070 Ti.
- **No es un modelo de lenguaje autonomo**: no puede generar texto por si mismo; solo propone tokens que el verifier debe validar.
- **Dependencia del verifier**: requiere el modelo base `ai-sage/GigaChat3-10B-A1.8B` y el plugin vLLM especifico. No funciona como modelo independiente.
- **Licencia de datos**: el dataset T-Wix usa licencia ODC-BY-1.0 y su ficha advierte que las salidas de terceros pueden tener terminos separados.
- **Compatibilidad limitada**: la configuracion de vLLM es especifica (backends lineales Triton, modo CUDA Graph PIECEWISE). El uso con otras versiones de vLLM o hardware puede fallar.
- **Riesgo de alucinacion**: al ser un modelo de propuesta, no se evalua directamente, pero el verifier base puede presentar alucinaciones tipicas de modelos de lenguaje.
- **Contexto corto en la practica**: aunque el verifier soporta 262k tokens, el ejemplo de uso limita `max-model-len` a 2048, y el entrenamiento del draft uso secuencias de 8.192 tokens.

## Enlaces

- Repositorio del modelo: https://huggingface.co/d0rj/GigaChat3-10B-A1.8B.dspark-base-dev
- Modelo verifier base: https://huggingface.co/ai-sage/GigaChat3-10B-A1.8B
- Checkpoint Large Dev companion: https://huggingface.co/d0rj/GigaChat3-10B-A1.8B.dspark-large-dev
- Plugin vLLM para GigaChat3: https://github.com/d0rj/gigachat3-vllm-plugin
- Dataset T-Wix: https://huggingface.co/datasets/t-tech/T-Wix
- Repositorio oficial de GigaChat3: https://github.com/salute-developers/gigachat3
