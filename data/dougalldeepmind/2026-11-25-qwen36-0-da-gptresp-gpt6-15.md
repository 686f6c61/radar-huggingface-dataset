# dougalldeepmind/2026-11-25-qwen36-0-da-gptresp-gpt6-15

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base Qwen/Qwen3.6-27B (revisión `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`). No es un modelo completo, sino un adaptador PEFT en formato safetensors que se aplica sobre el modelo base de 27.000 millones de parametros. El autor es dougalldeepmind y el artefacto forma parte de un experimento denominado `da-gptresp-gpt6-15` con semilla 0.

El adaptador se genero el 25 de noviembre de 2026 mediante la receta `sft` con configuracion de decodificacion en modo thinking activado, una sola epoca, tasa de aprendizaje 1e-4, batch efectivo de 16 (batch 1 con acumulacion de gradientes 16) y longitud maxima de secuencia de 8192 tokens. Los hiperparametros LoRA son rango 64, alpha 128 y dropout 0.05, con agregacion de perdida `seq-mean-token-mean` y presupuesto de tokens de 8000 para batching dinamico.

El interes del artefacto es acotado y experimental: se trata de un adaptador de investigacion sobre un mixture de datos propio (`da-gptresp-gpt6-15-mix`), sin model card funcional, sin licencia declarada y sin resultados de evaluacion publicados. No debe confundirse con un modelo listo para produccion. El tamano del repositorio es de 1,3 GB, coherente con un adaptador LoRA de rango 64 sobre un modelo de 27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen/Qwen3.6-27B; no se especifica la arquitectura interna del modelo base |
| Parametros totales | No disponible (adaptador LoRA con r=64, alpha=128 sobre base de 27B; numero exacto de parametros del adaptador no publicado) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 8192 tokens (max_seq_len de entrenamiento); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA) + tokenizer + train_config.yaml + training_meta.json |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de ajuste supervisado sobre el modelo Qwen/Qwen3.6-27B. La receta `sft` se ejecuto con una epoca, learning rate 1e-4, batch size 1 con acumulacion de gradientes de 16 (batch efectivo 16), longitud maxima de secuencia de 8192 tokens y decodificacion en modo thinking. La configuracion LoRA aplica rango 64, alpha 128 y dropout 0.05 sobre las capas del modelo base, con batching dinamico de presupuesto 8000 tokens y agregacion de perdida `seq-mean-token-mean`.

Los datos de entrenamiento provienen del dataset `dougalldeepmind/2026-11-25-da-gptresp-gpt6-15-mix` (fichero `mixture.jsonl`, revision `bb5b52ae14ef6452c35c46230a4383e23d20f9b1`). No se especifica el numero de tokens, la composicion del mixture ni si hubo etapas de RLHF o DPO. La model card indica que la "constitucion" del modelo se hereda de los datos de entrenamiento y no se declara en el lanzamiento. El pipeline de entrenamiento procede del repositorio `Matthew-Bozoukov/Lessons_from_constituitional_AFT` en el commit `cfe1b6e18a728af60490db95470d78423bf2bbb1`, y la provenance completa queda registrada en `training_meta.json`.

## Capacidades

- Ajuste supervisado (SFT) sobre el modelo base Qwen3.6-27B mediante adaptador LoRA; las capacidades efectivas son las del modelo base mas el sesgo introducido por el mixture de entrenamiento.
- Modo thinking activado durante el entrenamiento (`thinking: true`), lo que sugiere soporte de razonamiento extendido en la generacion.
- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.6-27B, no documentadas de forma independiente en este repositorio.
- Codigo y matematicas: no disponible de forma especifica para este adaptador.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio): no disponible.

## Casos de uso

- Investigacion sobre ajuste constitucional: el adaptador permite reproducir el experimento `Lessons_from_constituitional_AFT` aplicando el LoRA sobre Qwen3.6-27B y comparando el comportamiento con y sin adaptador sobre el mismo mixture.
- Reproducibilidad de experimentos SFT: el repositorio incluye `train_config.yaml` y `training_meta.json` con todos los argumentos y revisiones fijadas, de modo que `uv run train --config train_config.yaml` vuelve a ejecutar el mismo entrenamiento; util para auditar pipelines de ajuste.
- Estudio de mezclas de datos: el dataset `da-gptresp-gpt6-15-mix` es el sujeto del experimento, por lo que el adaptador sirve para evaluar como un mixture concreto altera el comportamiento del modelo base en tareas de razonamiento.
- Base para experimentos de alineacion posteriores: al ser un adaptador PEFT aislado, puede combinarse o compararse con otros adaptadores sobre el mismo base sin reentrenar el modelo completo.
- Evaluacion de sesgos inducidos por datos: permite medir como la "constitucion heredada" del mixture afecta a las respuestas del modelo en dominios sensibles.
- Docencia y formacion en ajuste fino: el artefacto es un ejemplo completo y reproducible de un pipeline LoRA SFT con configuracion versionada, adecuado para talleres practicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende del modelo base Qwen3.6-27B. Como referencia orientativa para un modelo de 27B en precision completa (FP16/BF16) se requieren aproximadamente 54 GB de VRAM, y en cuantizacion de 4 bits alrededor de 14-16 GB, aunque estos valores no estan confirmados en la informacion proporcionada.
- GPU recomendadas: no disponible en la documentacion del repositorio. Para el modelo base de 27B en BF16 serian necesarias GPU con 80 GB (A100, H100) o configuraciones multi-GPU.
- Compatibilidad con GPU de consumo: no confirmada; el adaptador en si ocupa 1,3 GB, pero requiere cargar el modelo base completo.
- Opciones de despliegue: el adaptador es PEFT (safetensors), por lo que es compatible con las librerias que soportan PEFT/LoRA (transformers + peft). El soporte en vLLM, llama.cpp, Ollama o TGI no esta documentado en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifica licencia, lo que impide determinar si el uso comercial esta permitido; debe consultarse al autor antes de cualquier uso en produccion.
- Artefacto experimental: es un adaptador LoRA de investigacion sobre un mixture propio, sin evaluacion publicada ni model card funcional.
- Sin datos de benchmarks: no hay evidencia cuantitativa de calidad, por lo que no puede recomendarse para tareas de produccion sin evaluacion propia.
- Constitucion no declarada: la model card indica que la constitucion se hereda de los datos de entrenamiento y no se declara en el lanzamiento, lo que dificulta auditar sesgos o comportamientos no deseados.
- Riesgo de alucinacion: no evaluado en la informacion disponible; debe asumirse el comportamiento del modelo base mas el sesgo del mixture.
- Limitaciones de contexto: el entrenamiento se realizo con max_seq_len de 8192 tokens; no se documenta el contexto nativo del modelo base ni el comportamiento mas alla de esa longitud.
- Idiomas: no se declaran idiomas soportados; el comportamiento multilingue no esta verificado.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma; requiere descargar Qwen/Qwen3.6-27B en la revision exacta `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9` para garantizar la compatibilidad de pesos.
- Repositorio sin descargas ni likes: el artefacto no ha sido validado por la comunidad en el momento de la ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dougalldeepmind/2026-11-25-qwen36-0-da-gptresp-gpt6-15
- Dataset de entrenamiento: https://huggingface.co/datasets/dougalldeepmind/2026-11-25-da-gptresp-gpt6-15-mix
- Repositorio del pipeline de entrenamiento: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
