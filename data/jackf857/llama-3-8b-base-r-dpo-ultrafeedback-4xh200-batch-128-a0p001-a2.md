# jackf857/llama-3-8b-base-r-dpo-ultrafeedback-4xh200-batch-128-a0p001-a2

## Resumen

Llama 3 8B R-DPO (alpha 0.001, beta 0.01) es un checkpoint de investigacion publicado por el usuario jackf857 en Hugging Face. Se trata de un ajuste fino del modelo `W-61/llama-3-8b-base-sft-ultrachat-8xh200` (a su vez un Llama 3 8B base sometido a SFT sobre UltraChat) mediante DPO con regularizacion de longitud (R-DPO, *length-regularized DPO*) sobre el snapshot congelado del dataset UltraFeedback binarizado. El objetivo es alinear las preferencias del modelo penalizando explicitamente la verbosidad de las respuestas, un problema conocido del DPO estandar, que tiende a inflar la longitud de las salidas.

El modelo conserva la arquitectura original de Llama 3 8B (transformer decoder-only denso, 8.030.261.248 parametros) y una ventana de contexto de 8.192 tokens, aunque el entrenamiento se realizo con una longitud maxima de secuencia de 2.048 tokens y un maximo de 1.800 tokens de prompt. Los pesos se distribuyen en safetensors sin cuantizar, con un tamano de repositorio de 32,1 GB.

Su relevancia es fundamentalmente metodologica: documenta de forma exhaustiva un experimento de alineacion con coeficientes concretos (alpha=0.001, beta=0.01, ratio alpha/beta=0.1), semilla fija, hardware definido (4 GPU H200) y trazabilidad completa mediante `PROVENANCE.json` y registros de entrenamiento. El autor advierte explicitamente de que se trata de un artefacto de investigacion no revisado por humanos y de que no se ha medido la calidad de generacion ni el rendimiento en AlpacaEval o Arena-Hard.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens (ventana nativa de Llama 3 8B); entrenado con max. 2.048 tokens de secuencia y 1.800 de prompt |
| Tipos de cuantizacion | no disponible (los tensores se publican sin cuantizar; admite cuantizacion posterior con herramientas estandar) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3 (Meta Llama 3 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3 8B sin modificaciones estructurales: un transformer decoder-only denso con los tensores y el tokenizador originales preservados sin cuantizacion ni cambios. El punto de partida es `W-61/llama-3-8b-base-sft-ultrachat-8xh200`, un modelo ya sometido a ajuste supervisado sobre UltraChat, que actua como referencia SFT para el calculo de log-ratios.

El entrenamiento aplica DPO con regularizacion de longitud sobre el snapshot congelado de `HuggingFaceH4/ultrafeedback_binarized`. La funcion de preferencia implementada es `beta * (chosen log-ratio - rejected log-ratio) + alpha * (chosen response-token count - rejected response-token count)`, seguida de log-sigmoid negativo; alpha queda fuera de beta y las log-probabilidades de respuesta se suman. Los hiperparametros efectivos son alpha=0.001, beta=0.01 (fijo), semilla 42, learning rate 5,0e-7, scheduler coseno con warmup ratio 0,1, batch efectivo de 128 pares sobre 4 GPU H200, 477 pasos de optimizador completados y 61.135 pares de entrenamiento frente a 2.000 pares de validacion. La perdida final de preferencia en held-out es 0,5289652347564697 y el cambio final de log-probabilidad de la respuesta elegida respecto a la referencia SFT, normalizado por longitud media, es de -0,44129894519456847 nats/token. El commit del codigo fuente es `1a657b644840f8eac2e8cdfee974fd50bd3bdc38`.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del SFT sobre UltraChat y refinada con preferencias de UltraFeedback.
- Alineacion con preferencias humanas sinteticas mediante R-DPO, con control explicito de la longitud de respuesta gracias al termino de regularizacion.
- Razonamiento basico y respuesta a instrucciones propias de un Llama 3 8B ajustado, si bien no se han publicado evaluaciones que lo cuantifiquen.
- Soporte de tool calling / function calling: no disponible de forma verificada en este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no verificado ni evaluado.
- Capacidades multilingues: limitadas al ingles segun la model card; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre alineacion y control de longitud: el checkpoint sirve como referencia reproducible para estudiar como el termino alpha de R-DPO modifica la distribucion de longitudes de respuesta frente a DPO estandar, con todos los hiperparametros y diagnosticos publicados.
- Reproduccion de experimentos de preferencia: la presencia de `PROVENANCE.json`, registros de Slurm, W&B offline y el paquete de entrenamiento congelado permite replicar el pipeline sobre el mismo snapshot de UltraFeedback.
- Generacion de respuestas concisas en ingles: el termino de regularizacion de longitud lo hace adecuado para prototipos donde se busca evitar respuestas excesivamente verbosas, aunque la calidad no este medida.
- Base para ajustes posteriores: al conservar los tensores y el tokenizador originales de Llama 3 8B, puede emplearse como punto de partida para SFT adicional o nuevas rondas de DPO en dominios especificos.
- Experimentos academicos de comparacion de objetivos: util como variante R-DPO dentro de estudios que comparen DPO, KTO, IPO u otros objetivos de preferencia sobre el mismo modelo base.
- Evaluacion de diagnosticos de entrenamiento: permite analizar la relacion entre la perdida de preferencia en held-out (0,529) y el cambio de log-probabilidad por token (-0,441 nats/token) frente a la calidad generativa observada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la calidad de generacion y el rendimiento en AlpacaEval y Arena-Hard no se han medido para este checkpoint; los unicos numeros reportados son diagnosticos de entrenamiento (perdida de preferencia en held-out de 0,5289652347564697 y cambio de log-probabilidad de -0,44129894519456847 nats/token).

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV, lo que situa el requisito practico en torno a 18-20 GB para contextos moderados.
- VRAM estimada con cuantizacion de 8 bits: en torno a 8-9 GB de pesos; con 4 bits, en torno a 4-5 GB, mas cache KV y overhead.
- GPU recomendadas para BF16: A100 40/80 GB, H100, H200 (el entrenamiento se hizo en 4 H200); tambien viable en una unica GPU de 24 GB con cuantizacion.
- GPU de consumo: cabe en RTX 3090 y RTX 4090 (24 GB) en BF16 con contexto limitado, y en GPUs de 8-12 GB con cuantizacion de 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama requeririan conversion a los formatos correspondientes, no incluidos en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo de alineacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jackf857/llama-3-8b-base-r-dpo-ultrafeedback-4xh200-batch-128-a0p001-a2 | 8,03 B | 8.192 | R-DPO (alpha=0.001, beta=0.01) sobre UltraFeedback | llama3 | Hugging Face, 2 descargas |
| W-61/llama-3-8b-base-sft-ultrachat-8xh200 (modelo base) | 8,03 B | 8.192 | SFT sobre UltraChat | no disponible en la informacion | Hugging Face |
| Llama 3 8B Instruct (Meta) | 8,03 B | 8.192 | RLHF + SFT propietario | llama3 | Hugging Face, ampliamente distribuido |

La comparacion con Llama 3 8B Instruct es la referencia natural por familia y tamano, pero no se dispone de datos de rendimiento de este checkpoint que permitan contrastar calidad; la unica diferencia documentada es el objetivo de alineacion y el pipeline de entrenamiento.

## Limitaciones y advertencias

- Artefacto de investigacion no revisado por humanos, segun advierte el propio autor; no debe tratarse como un modelo listo para produccion.
- No se ha medido la calidad de generacion ni el rendimiento en benchmarks de preferencia (AlpacaEval, Arena-Hard); los unicos datos son diagnosticos de entrenamiento.
- Riesgo de alucinacion inherente a un modelo de 8 B ajustado con preferencias sinteticas de UltraFeedback, no mitigado ni evaluado.
- Sesgos conocidos: no documentados en la informacion disponible; se heredan los del modelo base y del dataset UltraFeedback.
- Limitacion de idioma: solo se declara ingles; el rendimiento en castellano no esta verificado.
- Restricciones de licencia: sujeto a la Meta Llama 3 Community License, con obligaciones de atribucion recogidas en LICENSE y NOTICE; conviene revisar las condiciones de uso comercial de dicha licencia.
- Contexto de entrenamiento limitado a 2.048 tokens de secuencia y 1.800 de prompt, inferior a la ventana nativa de 8.192 tokens, lo que puede degradar el comportamiento en contextos largos.
- El checkpoint depende de un modelo base de terceros (`W-61/...`) cuyas revisiones exactas solo constan en `PROVENANCE.json`.
- El `training_config.yaml` base conserva alpha0; el valor efectivo alpha=0.001 se aplica mediante override explicito, un detalle a tener en cuenta al reproducir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jackf857/llama-3-8b-base-r-dpo-ultrafeedback-4xh200-batch-128-a0p001-a2
- Modelo base SFT: https://huggingface.co/W-61/llama-3-8b-base-sft-ultrachat-8xh200
- Dataset de preferencias: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Paper de R-DPO (length-regularized DPO): no disponible en la informacion proporcionada
- Repositorio de codigo (commit `1a657b644840f8eac2e8cdfee974fd50bd3bdc38`): no disponible como URL en la informacion proporcionada
- Demo o blog del autor: no disponible
