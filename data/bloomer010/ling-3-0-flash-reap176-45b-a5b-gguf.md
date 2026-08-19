# bloomer010/Ling-3.0-flash-REAP176-45B-A5B-GGUF

## Resumen

El modelo `bloomer010/Ling-3.0-flash-REAP176-45B-A5B-GGUF` es una versión podada y cuantizada del modelo base `inclusionAI/Ling-3.0-flash`, desarrollada por el usuario bloomer010. Aplica una poda agresiva de expertos mediante el método REAP (Router-weighted Expert Activation Pruning), eliminando 336 de los 512 expertos enrutados por capa, lo que deja 176 expertos activos por capa (65,6% de expertos eliminados). El resultado es un modelo MoE de aproximadamente 46,2 mil millones de parámetros totales, pero con solo 5,1 mil millones de parámetros activos por token.

Esta ficha es relevante porque demuestra cómo la poda de expertos puede reducir drásticamente los requisitos de hardware para ejecutar modelos MoE de gran tamaño, permitiendo su despliegue en GPUs de consumo con offload de expertos a memoria RAM. Sin embargo, el autor advierte explícitamente que es un modelo "muy podado" y "mayormente sin probar", sin entrenamiento de recuperación posterior a la poda, por lo que su calidad puede degradarse significativamente. El formato de pesos es GGUF, preparado para su uso con llama.cpp, aunque requiere un fork específico hasta que se fusione el soporte para la arquitectura BailingMoE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (BailingMoE) |
| Parametros totales | 46.196.971.024 (~46,2B) |
| Parametros activos | 5,1B |
| Longitud de contexto | 65.536 tokens (según comando de servido) |
| Tipos de cuantizacion | MXFP4, Q4_K_M, Q3_K_M, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MoE de `inclusionAI/Ling-3.0-flash`, que originalmente cuenta con 512 expertos enrutados por capa. La poda se realiza mediante el método REAP (arXiv:2510.13999), una técnica de poda de expertos one-shot que puntúa cada experto según el producto del valor de la puerta del router (router-gate-value) y la norma L2 de su salida sobre datos de calibración. Los expertos con menor puntuación se eliminan directamente, sin ningún tipo de fine-tuning o entrenamiento de recuperación posterior.

La calibración se realizó con 1 millón de tokens, compuestos por un 50% de datos de Ultrachat, 25% de Wikitext y 25% de código. El número final de expertos por capa es 176, que corresponde a 22 grupos de 8 expertos, el paso divisible por el tamaño de grupo más cercano al objetivo de 174. Esta poda reduce el número de parámetros activos de forma significativa, aunque el tamaño total del modelo en disco se mantiene alto debido a que los pesos de los expertos podados se eliminan físicamente, pero la estructura de la red y los parámetros no enrutados permanecen.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational` y hereda las capacidades de diálogo del modelo base Ling-3.0-flash.
- Soporte de contexto largo: puede manejar ventanas de contexto de hasta 65.536 tokens, lo que permite mantener conversaciones multi-turno extensas o procesar documentos largos.
- Inferencia eficiente en hardware limitado: gracias a la poda de expertos, el número de parámetros activos se reduce a 5,1B, lo que acelera la inferencia en comparación con un MoE completo de 46B.
- Compatibilidad con llama.cpp: al estar en formato GGUF, puede ejecutarse con llama-server y herramientas del ecosistema llama.cpp, incluyendo offload de expertos a CPU.
- No se especifican capacidades explícitas de tool calling, agentes, visión o audio en la información proporcionada.

## Casos de uso

- Inferencia local en hardware de consumo: gracias a la poda y al offload de expertos a CPU, es posible ejecutar un modelo de 46B en una GPU con poca VRAM (por ejemplo, 8-12 GB), usando la cuantización MXFP4 y el comando de servido recomendado.
- Evaluación de técnicas de poda de MoE: sirve como caso de estudio para investigar el impacto de REAP en la calidad del modelo, comparando con el modelo base sin podar.
- Prototipado de asistentes conversacionales: con 65k de contexto, puede gestionar historiales de chat largos en aplicaciones de demostración o entornos de desarrollo.
- Investigación académica sobre eficiencia de MoE: permite analizar la relación entre el número de expertos activos y la calidad de las respuestas, sin necesidad de reentrenar el modelo.
- Despliegue en entornos con restricciones de VRAM: el comando `-ot "ffn_.*_exps\.weight=CPU"` permite mantener los expertos en RAM y solo la atención en GPU, reduciendo drásticamente los requisitos de memoria de vídeo.
- Servicio de chat local con llama.cpp: integrable en pipelines existentes que ya utilizan llama-server, siempre que se use el fork adecuado hasta que se fusione el soporte BailingMoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación comparativa. Dado que el modelo está "mayormente sin probar", se recomienda realizar evaluaciones propias antes de considerar su uso en producción.

## Requisitos de hardware

- VRAM estimada: depende de la cuantización y de la estrategia de offload. Con MXFP4 y expertos en CPU, la VRAM se limita a las capas de atención y la caché KV, pudiendo caber en 8-12 GB. Con Q4_K_M cargado completamente en GPU, se necesitan aproximadamente 25-30 GB.
- GPU recomendadas: RTX 3090 o RTX 4090 para offload mixto (atención en GPU, expertos en RAM). Para ejecución completa en GPU, se requieren A100 o H100.
- Opciones de despliegue: llama.cpp (llama-server) o el fork específico `aetherbird/llama.cpp` hasta que se fusione el PR #26608 en el repositorio principal.
- Comando de servido recomendado por el autor:
  ```bash
  llama-server -m Ling-3.0-flash-REAP176-45B-A5B-MXFP4.gguf \
    -ngl 99 -ot "ffn_.*_exps\.weight=CPU" --no-mmap -c 65536 --flash-attn on --jinja
  ```
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| Ling-3.0-flash (base) | ~46,2B | ~5,1B (512 expertos) | 65k | no disponible |
| Ling-3.0-flash REAP176 (este) | ~46,2B | ~5,1B (176 expertos) | 65k | no disponible |
| Alternativa densa comparable | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con otros modelos de la misma categoría no está disponible en la información proporcionada. La principal diferencia con el modelo base es la eliminación del 65,6% de los expertos enrutados, lo que reduce el coste computacional por token, aunque puede afectar negativamente a la calidad. No se dispone de datos de otros modelos podados con REAP para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo muy podado: se ha eliminado el 65,6% de los expertos enrutados, lo que puede provocar una degradación significativa de la calidad, coherencia y precisión de las respuestas.
- Sin entrenamiento de recuperación: la poda se realizó one-shot, sin fine-tuning posterior, por lo que el modelo no ha sido optimizado para compensar la pérdida de capacidad.
- Estado experimental: el autor indica explícitamente que el modelo está "mayormente sin probar" (mostly untested), por lo que no se recomienda para entornos de producción sin una evaluación exhaustiva previa.
- Riesgo elevado de alucinaciones: la poda agresiva puede aumentar la probabilidad de generar información falsa o incoherente.
- Dependencia de un fork de llama.cpp: hasta que se fusione el soporte para `bailingmoe3` en el PR #26608, es necesario utilizar el fork de `aetherbird`, lo que puede limitar la compatibilidad con herramientas estándar.
- Licencia no especificada: al no indicarse la licencia, existe incertidumbre legal sobre su uso comercial o la redistribución de los pesos.
- Idiomas soportados no especificados: no se garantiza un rendimiento multilingüe adecuado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bloomer010/Ling-3.0-flash-REAP176-45B-A5B-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Paper REAP (arXiv): https://arxiv.org/abs/2510.13999
- Pull request de soporte BailingMoE en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/26608
- Fork de llama.cpp con soporte BailingMoE: https://github.com/aetherbird/llama.cpp/tree/bailingmoe3-support
