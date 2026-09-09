# hermitdave/K2-Horizon-7B-Uno-MLX-6bit

## Resumen

El modelo K2-Horizon-7B-Uno-MLX-6bit es una cuantización uniforme de 6 bits en formato MLX del checkpoint IFM/K2-Horizon-7B-Uno, publicada por el usuario hermitdave. El modelo base, desarrollado por el Institute of Foundation Models, es un LLM aumentado con difusión que incorpora un adaptador LoRA ya fusionado en los pesos, por lo que se comporta como un modelo autorregresivo estándar. Esta versión cuantizada está pensada para ejecutarse en Apple Silicon mediante la librería mlx-lm, lo que permite utilizar un modelo de razonamiento de alrededor de 9.000 millones de parámetros en equipos Mac con suficiente memoria unificada. El checkpoint se publica bajo licencia Apache 2.0 y hereda las características de razonamiento del modelo original, incluida la necesidad de usar el parámetro `reasoning_effort="high"` en el template de chat.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: LLM aumentado con difusión) |
| Parámetros totales | 8.999.178.240 (~9.000 millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | MLX uniforme de 6 bits |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización uniforme de 6 bits del modelo IFM/K2-Horizon-7B-Uno. El modelo original, según la información disponible, es un LLM aumentado con difusión (diffusion-augmented) sobre la base K2-Horizon-7B, con un adaptador LoRA que ya ha sido fusionado en los pesos base, de modo que el resultado funciona como una red autorregresiva convencional. La conversión a MLX se realizó con mlx-lm. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni sobre procesos de RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva tras la fusión del adaptador LoRA.
- Razonamiento paso a paso con modo de pensamiento que requiere `reasoning_effort="high"`.
- Integración con la librería mlx-lm y con servidores compatibles con la API de OpenAI usando oMLX.
- Optimizado para hardware Apple Silicon mediante cuantización MLX de 6 bits.
- Sin soporte confirmado para tool calling, visión ni audio.

## Casos de uso

- Asistente de razonamiento local en Mac: el modelo puede ejecutarse con `mlx_lm.generate` en equipos con chip Apple Silicon y memoria unificada suficiente, ofreciendo una alternativa local para tareas que requieren descomponer problemas en pasos.
- Servidor OpenAI-compatible en macOS: usando oMLX v0.6.4+ con el parche de soporte, se puede levantar un endpoint `/v1/chat/completions` para aplicaciones existentes que necesiten razonamiento sin salir del entorno local.
- Investigación sobre modelos fusionados LoRA: el checkpoint absorbe el adaptador en los pesos base, lo que facilita estudiar el efecto de fusionar LoRA en un LLM de razonamiento y compararlo con el checkpoint sin fusionar.
- Prototipado rápido de agentes de razonamiento en entornos Apple: al estar cuantizado a 6 bits, reduce el uso de memoria frente al modelo original, permitiendo prototipar agentes con razonamiento multi-paso en un portátil Mac.
- Evaluación de cuantización MLX en IA generativa: sirve como caso de estudio sobre cómo afecta la cuantización uniforme de 6 bits al rendimiento de un modelo de razonamiento, aunque no se aportan benchmarks.
- Despliegue en aplicaciones de escritorio para macOS: al ser un modelo local y con licencia Apache 2.0, puede integrarse en herramientas de productividad que necesiten capacidades de razonamiento sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Para ejecutar el modelo en Apple Silicon se necesita una Mac con memoria unificada suficiente. Con la cuantización de 6 bits, los pesos ocupan aproximadamente 6,75 GB (8.999.178.240 parámetros × 6 bits / 8), sin contar el overhead de la cache KV ni el runtime. El repositorio en HuggingFace tiene un tamaño total de 31,9 GB, lo que sugiere que contiene otros archivos o pesos en mayor precisión.
- Recomendado: Mac con chip M1/M2/M3/M4 y al menos 16 GB de RAM unificada para inferencia cómoda con ventanas de contexto moderadas.
- Opciones de despliegue: `mlx_lm.generate` (CLI de mlx-lm) y servidores OpenAI-compatibles con oMLX v0.6.4+ aplicando el parche de soporte K2-Horizon (PR #3441).
- No es compatible con vLLM, llama.cpp ni TGI, que están orientados a CUDA, CPU o GPU de otros fabricantes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| K2-Horizon-7B-Uno-MLX-6bit | 8.999.178.240 | no disponible | Apache 2.0 | MLX safetensors |
| K2-Horizon-7B-Uno (IFM) | no disponible | no disponible | Apache 2.0 | safetensors |
| K2-Horizon-7B-MLX-6bit (hermitdave) | no disponible | no disponible | no disponible | MLX safetensors |

No se dispone de datos de benchmarks que permitan una comparación de rendimiento.

## Limitaciones y advertencias

- Requiere oMLX v0.6.4 o superior con el parche específico para K2-Horizon (pull request #3441). Sin este parche, el modelo puede no generar correctamente.
- Esta cuantización uniforme de 6 bits puede introducir pérdida de precisión frente a los pesos originales, aunque la magnitud de esta pérdida no se ha cuantificado.
- No hay información sobre sesgos, tasas de alucinación o límites de contexto. Estos aspectos deben evaluarse antes de usar el modelo en producción.
- El modelo está orientado a Apple Silicon; no hay soporte para GPU CUDA ni despliegue en la nube con herramientas estándar.
- La necesidad de usar `reasoning_effort="high"` es un requisito del template de chat; si se invoca con otros parámetros, puede que el modelo no active el modo de razonamiento o degrade su calidad.
- No disponible: idiomas soportados, tool calling, visión, audio, benchmarks.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/hermitdave/K2-Horizon-7B-Uno-MLX-6bit
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B-Uno
- Parche de soporte oMLX: https://github.com/jundot/omlx/pull/3441
- Otro checkpoint similar: https://huggingface.co/hermitdave/K2-Horizon-7B-MLX-6bit
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
