# dvader13/smollm3-3b-sft-472b

## Resumen

Este repositorio contiene diez checkpoints de ajuste fino supervisado (SFT) del modelo SmolLM3-3B de Hugging Face, correspondientes a diez fracciones de dosis de datos de entrenamiento (del 10 % al 100 %). El modelo base se preentreno en un tramo (rung) de 472 mil millones de tokens y posteriormente se ajusto con SFT en cada fraccion de datos, generando los checkpoints `checkpoint_pct010` a `checkpoint_pct100`. Todos los checkpoints estan guardados en bf16 y estan pensados exclusivamente para inferencia, sin estado de optimizador.

El interes de este conjunto de checkpoints reside en su utilidad para estudiar la relacion entre la cantidad de datos de SFT y el rendimiento del modelo, un aspecto relevante para quienes investigan escalado de datos, curvas de aprendizaje en ajuste fino o la saturacion del rendimiento con mas datos. El modelo base SmolLM3-3B es un decoder-only de 3 mil millones de parametros con ventana de contexto de 128 000 tokens, soporte nativo de seis idiomas y capacidades de razonamiento dual-mode.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base SmolLM3-3B) |
| Parametros totales | 3 mil millones |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | 128 000 tokens |
| Tipos de cuantizacion | No disponible (checkpoints en bf16) |
| Idiomas soportados | Seis idiomas (detalle no especificado en la informacion disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, bf16 |

## Arquitectura y entrenamiento

El modelo base es SmolLM3-3B, un transformer decoder-only de 3 mil millones de parametros desarrollado por Hugging Face. Segun los datos disponibles, el preentrenamiento se realizo en un tramo de 472 mil millones de tokens, y posteriormente se aplico un ajuste fino supervisado (SFT) siguiendo las recetas del alignment-handbook de Hugging Face. El proceso de SFT se ha dividido en diez fracciones de dosis (10 %, 20 %, ..., 100 %), generando un checkpoint independiente para cada fraccion. Todos los checkpoints estan en bf16, sin estado de optimizador, y estan destinados exclusivamente a inferencia.

El modelo base incorpora un modo de razonamiento dual: un modo estandar y un modo de pensamiento (thinking mode) que se activa para problemas complejos. Tambien destaca por su ventana de contexto de 128 000 tokens y su soporte multilingue de seis idiomas. El entrenamiento del modelo base se realizo con 11 billones de tokens segun la informacion del repositorio oficial de SmolLM.

## Capacidades

- Generacion de texto en seis idiomas con soporte nativo multilingue.
- Razonamiento dual-mode: modo estandar y modo de pensamiento activable para problemas complejos de logica y matematicas.
- Generacion de codigo y asistencia en programacion.
- Comprension de contexto largo gracias a la ventana de 128 000 tokens.
- Sigue instrucciones de forma fiable gracias al ajuste fino supervisado.
- Capacidades de razonamiento matematico y logico.

Nota: las capacidades detalladas corresponden al modelo base SmolLM3-3B. No se han publicado evaluaciones independientes de cada checkpoint SFT de este repositorio.

## Casos de uso

- **Investigacion en escalado de datos de SFT**: los diez checkpoints permiten trazar la curva de rendimiento frente a la cantidad de datos de ajuste fino, lo que resulta util para determinar el punto de rendimiento decreciente y optimizar presupuestos de datos en pipelines de entrenamiento.
- **Evaluacion de la saturacion del ajuste fino**: al comparar los checkpoints pct010 y pct100, se puede cuantificar la ganancia marginal de anadir mas datos de SFT y decidir si es rentable ampliar el dataset.
- **Generacion de codigo en entornos de desarrollo**: el modelo base SmolLM3-3B genera funciones, tests y documentacion de codigo, y puede integrarse en editores o herramientas CLI.
- **Asistencia multilingue en atencion al cliente**: con soporte de seis idiomas y contexto de 128k tokens, puede gestionar conversaciones largas y multilingues en un solo hilo.
- **Procesamiento de documentos extensos**: la ventana de 128k tokens permite resumir o extraer informacion de informes, contratos y articulos completos sin truncamiento.
- **Razonamiento y resolucion de problemas**: el modo de pensamiento activable permite abordar problemas de logica, matematicas y planificacion con un nivel de detalle mayor que el modo estandar.
- **Despliegue en hardware de consumo**: al tratarse de un modelo de 3B parametros, es viable en GPUs de gama alta de consumo con cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para los checkpoints SFT de este repositorio en la informacion disponible. Segun los datos publicados por Hugging Face sobre el modelo base SmolLM3-3B, este supera a Llama 3.2 3B y Qwen2.5 3B en las evaluaciones internas, y se mantiene competitivo con alternativas de 4 mil millones de parametros como Qwen3 y Gemma3. No se dispone de numeros concretos de MMLU, HumanEval o GSM8K para esta variante especifica.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6 GB para los pesos del modelo (3B parametros x 2 bytes).
- VRAM total con contexto largo (128k tokens): se recomienda al menos 12-16 GB para evitar desbordamiento de memoria.
- GPU recomendadas: RTX 3090 (24 GB), RTX 4090 (24 GB), A100 80 GB, H100 80 GB.
- El modelo cabe en GPUs de consumo modernas con 16 GB o mas de VRAM.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y transformers de Hugging Face.
- Repositorio completo: 61.5 GB (10 checkpoints bf16 de aproximadamente 6 GB cada uno).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SmolLM3-3B (este repositorio) | 3B | 128k | Apache 2.0 | SFT en 10 dosis de datos, base preentrenada en 472B tokens |
| Llama 3.2 3B | 3B | 128k | Llama 3.2 Community License | Superado por SmolLM3-3B segun datos de Hugging Face |
| Qwen2.5 3B | 3B | 32k | Apache 2.0 | Superado por SmolLM3-3B segun datos de Hugging Face |
| Qwen3 4B | 4B |
