# alexkstern/nca_dose_50Mpt_hfinit_adamwppt_500M_s0_2026-09-06_15-13-26_453103-pt

## Resumen

El modelo `nca_dose_50Mpt_hfinit_adamwppt_500M_s0_2026-09-06_15-13-26_453103-pt` es un checkpoint de investigación desarrollado por alexkstern con el framework `nanochat`. Se trata de un experimento de `token dose`: primero se entrena un transformer con 50 millones de tokens (fase `pt`) y después se continúa con 500 millones de tokens (fase `ppt`) sobre un vocabulario distinto, re-inicializando el embedding y restableciendo el optimizador en la transición.

El objetivo es estudiar cómo afecta la dosis de tokens y el cambio de vocabulario al rendimiento del modelo. La arquitectura es un transformer decoder estándar con 16 capas, 8 cabezas de atención y dimensión de embedding 1024, con una ventana de contexto de 2048 tokens.

El checkpoint se encuentra en el paso 762 de 1000, con una pérdida de entrenamiento suavizada de 4.233 y un `min_objective` de 1.237. No se han publicado evaluaciones externas más allá de las métricas de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (GPT) |
| Parametros totales | no disponible |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (state_dict) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder con 16 capas, 8 cabezas de atención, 8 cabezas clave-valor y dimensión de embedding 1024. El vocabulario de la fase `pt` es de 65536 tokens, mientras que el de la fase `ppt` es de 10004 tokens; en la transición se re-inicializa el embedding y se restablece el optimizador. Los datos de entrenamiento son `fineweb-nanochatbpe-100M` para la fase `pt` y `nca-paper-share200-2048` para la fase `ppt`.

El entrenamiento utiliza el optimizador AdamW con tasas de aprendizaje diferenciadas: 0.02 para la matriz, 0.3 para el embedding y 0.004 para el unembedding. El programador de aprendizaje es trapezoidal con calentamiento nulo, enfriamiento del 40% y tasa final 0. El modelo se entrena durante 1000 iteraciones, con un total de 50 millones de tokens en `pt` y 500 millones en `ppt`. Se registra una métrica de `flops_used` de 1.038e17.

## Capacidades

- Generación de texto autoregresiva con una ventana de contexto de 2048 tokens.
- No se han documentado capacidades de tool calling, funcionamiento como agente, visión ni audio.
- El modelo es un checkpoint de investigación sin pruebas de rendimiento en tareas de razonamiento, matemáticas o código.
- Entrenado con texto web de FineWeb, por lo que su dominio principal es el lenguaje natural general, aunque sin confirmación oficial de idiomas.

## Casos de uso

- Investigación en tokenización y vocabularios: el checkpoint permite comparar el efecto de continuar el preentrenamiento con un vocabulario más pequeño (10004 tokens) tras uno grande (65536), útil para estudiar la re-inicialización de embeddings.
- Benchmark de técnicas de continuación de preentrenamiento: al ser parte de una serie con distintas dosis de tokens, puede usarse como punto de referencia para validar algoritmos de re-inicialización y restablecimiento del optimizador.
- Prototipado de modelos de lenguaje pequeños: con un tamaño reducido y 2048 de contexto, cabe en GPUs consumer y sirve para probar pipelines de fine-tuning en tareas específicas.
- Educación y divulgación: como ejemplo de modelo entrenado con `nanochat`, permite ilustrar el proceso de entrenamiento de un transformer desde cero con datos de FineWeb.
- Experimentos de eficiencia en tokenización: puede usarse para medir cómo el cambio de vocabulario afecta a la perplejidad y a la velocidad de inferencia.
- Fine-tuning para generación de texto corto: dado su tamaño reducido, es adecuado para tareas de clasificación, resumen o generación de texto en dominios estrechos, siempre que se ajuste con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica publicada es la pérdida de entrenamiento suavizada (4.233) y el `min_objective` (1.237) del checkpoint, sin evaluaciones externas.

## Requisitos de hardware

- No se ha publicado información oficial de requisitos de hardware.
- Según la configuración (16 capas, 8 cabezas, `n_embd=1024`), el modelo es de tamaño pequeño; el state_dict pesa en torno a 1.3 GB en fp32 (estimación).
- Puede ejecutarse en GPUs consumer como una RTX 3060 o superior.
- No hay pesos cuantizados publicados; para cuantizar habría que convertirlos a GGUF o utilizar herramientas como `llama.cpp`.
- Opciones de despliegue: `nanochat` para inferencia en PyTorch, o conversión a formatos de inferencia como `llama.cpp` o `vLLM`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas públicas con otros modelos. El checkpoint pertenece a una serie de experimentos del mismo autor con variaciones en la dosis de tokens (por ejemplo, `nca_dose_50Mpt_hfinit_500M_s0` y `nca_dose_50Mpt_hfinit_20M_s0`), pero no hay benchmarks comparativos publicados.

## Limitaciones y advertencias

- Sesgos: no se han evaluado; al entrenarse en FineWeb, puede heredar sesgos del corpus web.
- Riesgo de alucinación: alto en comparación con modelos más grandes; no se recomienda para tareas de alto riesgo.
- Limitaciones de contexto: 2048 tokens, insuficiente para documentos largos.
- Idioma: no confirmado; probablemente inglés.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero el modelo es un checkpoint de investigación sin garantías.
- Caveat: es un checkpoint intermedio (paso 762 de 1000) y no se ha evaluado su calidad final.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/nca_dose_50Mpt_hfinit_adamwppt_500M_s0_2026-09-06_15-13-26_453103-pt
- W&B run: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/ppjcp8od
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Serie de experimentos del autor: https://huggingface.co/alexkstern/nca_dose_50Mpt_hfinit_500M_s0_2026-08-15_00-52-09_099932-pt
- Otro checkpoint de la serie: https://huggingface.co/alexkstern/nca_dose_50Mpt_hfinit_20M_s0_2026-08-15_00-25-50_871551-pt
