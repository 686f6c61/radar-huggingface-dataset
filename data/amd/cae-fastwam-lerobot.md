# amd/CAE-FastWAM-lerobot

## Resumen

CAE-FastWAM-lerobot es la conversión al formato de checkpoint de LeRobot del modelo CAE-FastWAM, desarrollado por AMD. Se trata de un world action model (WAM) orientado a robótica de manipulación, construido sobre el experto de vídeo Wan2.2-TI2V-5B y equipado con un experto de acción compacto (Compact Action Expert, CAE) de 32 dimensiones que denoisa tokens latentes de acción. Un decodificador de acción condicionado por suite de LIBERO transforma esos tokens en el chunk de acciones que ejecuta el robot.

El modelo resuelve el problema de generar políticas de control robótico a partir de observaciones visuales (vista del agente y vista de muñeca) y del estado del robot, produciendo secuencias de acciones de 7 dimensiones. Su relevancia actual radica en que aplica la receta FastWAM sobre un backbone de vídeo generativo de 5.000 millones de parámetros y reporta tasas de éxito muy altas en las cuatro suites del benchmark LIBERO, con una media del 96,7% sobre 2.000 episodios. Esta versión concreta solo cambia el layout del repositorio (config.json, safetensors y pre/post-procesadores de LeRobot con estadísticas de normalización por suite), manteniendo los pesos idénticos al modelo original.

El checkpoint incluye además el encoder de acción-VAE congelado, lo que permite ajuste fino con el objetivo original de CAE-FastWAM. La carga requiere el tipo de política `cae_fastwam`, que todavía no está incluido en ninguna release de LeRobot, por lo que su uso en producción queda condicionado a la disponibilidad de esa integración.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | World action model (WAM): experto de vídeo Wan2.2-TI2V-5B + Compact Action Expert (32-wide) + decodificador de acción condicionado por suite LIBERO |
| Parámetros totales | 5.025.451.671 |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (evaluado en bfloat16 según la model card) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (layout LeRobot: `config.json`, `model.safetensors`, pre/post-procesadores) |

## Arquitectura y entrenamiento

CAE-FastWAM combina un experto de vídeo basado en Wan2.2-TI2V-5B con un Compact Action Expert de 32 dimensiones que actúa como denoiser sobre tokens latentes de acción. Sobre esa representación latente, un decodificador de acción condicionado por la suite de LIBERO (`libero_spatial`, `libero_object`, `libero_goal` o `libero_10`) genera el chunk de acciones de 7 dimensiones. El modelo incorpora un encoder de acción-VAE congelado que se conserva en este checkpoint para permitir el ajuste fino con el objetivo original.

El entrenamiento parte de Wan2.2-TI2V-5B y aplica la receta FastWAM (arXiv:2603.16666) sobre el dataset `yuanty/LIBERO-fastwam`. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; esos datos no están disponibles en la información proporcionada. La evaluación se realiza en bfloat16 con 10 pasos de denoising, 50 episodios por tarea y una longitud de episodio de 400 (700 para `libero_10`).

## Capacidades

- Generación de chunks de acción de 7 dimensiones para control robótico de manipulación a partir de observaciones visuales y de estado.
- Procesamiento de dos vistas visuales simultáneas: vista del agente (`observation.images.image`) y vista de muñeca (`observation.images.image2`), ambas de resolución 3×224×224.
- Entrada de estado del robot de 8 dimensiones (`observation.state`).
- Condicionamiento por suite de tareas LIBERO mediante `--policy.task_suite`, con evaluación de una suite por ejecución.
- Modelado generativo de mundo (world action model) apoyado en un experto de vídeo de 5B parámetros.
- Ajuste fino con el objetivo original de CAE-FastWAM gracias al encoder de acción-VAE congelado incluido en el checkpoint.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento; el modelo está especializado en robótica.

## Casos de uso

- Manipulación robótica en entornos LIBERO: el modelo ejecuta tareas de las suites `libero_spatial`, `libero_object`, `libero_goal` y `libero_10` con tasas de éxito entre el 94,4% y el 99,8%, lo que lo hace adecuado para benchmarking de políticas de manipulación.
- Investigación en world action models: sirve como referencia reproducible para comparar recetas de políticas basadas en modelos de vídeo generativo, con instrucciones de evaluación y versiones de MuJoCo documentadas.
- Evaluación estandarizada de políticas: el formato LeRobot y los comandos `lerobot-eval` permiten integrar el modelo en pipelines de evaluación automatizada con semillas y número de episodios configurables.
- Ajuste fino por suite: mediante `lerobot-train` con `--policy.task_suite` y precisión mixta bf16 se puede adaptar el modelo a una suite concreta manteniendo el objetivo original de CAE-FastWAM.
- Desarrollo de pre/post-procesadores de robótica: el repositorio incluye las estadísticas de normalización por suite, útiles para construir pipelines de datos compatibles con LeRobot.
- Prototipado de control visual-motor: las dos vistas de cámara y el estado de 8 dimensiones permiten experimentar con políticas que combinan percepción visual y propriocepción en tareas de pick-and-place.

## Benchmarks y rendimiento

LIBERO, bfloat16, 10 pasos de denoising, 50 episodios por tarea (500 por suite, 2.000 en total):

| Suite | Tasa de éxito | Episodios |
|---|---:|---:|
| libero_spatial | 97,0% | 500 |
| libero_object | 99,8% | 500 |
| libero_goal | 94,4% | 500 |
| libero_10 | 95,6% | 500 |
| **Media** | **96,7%** | **2.000** |

La model card original de amd/CAE-FastWAM reporta 97,28 ± 0,20% con inferencia optimizada con GEAK y LIBERO simulado en GPU (media de 11 ejecuciones de 2.000 episodios). La versión LeRobot advierte de que la versión de MuJoCo afecta a los resultados: con MuJoCo 3.8.1 la tarea 5 de `libero_spatial` se asienta de forma distinta y la misma evaluación promedió 94,5%. El stack de referencia es hf-libero 0.1.4, robosuite 1.4.0 y MuJoCo 3.3.1, con física en CPU y renderizado OSMesa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 5.025 millones de parámetros en bfloat16 (2 bytes por parámetro) el peso ronda los 10 GB, a los que hay que sumar activaciones y buffers del experto de vídeo.
- GPU recomendadas: la model card cita una AMD Instinct MI355X para reproducir la evaluación; no se especifican otras GPU validadas.
- GPU de consumo: no disponible; no se documenta compatibilidad con tarjetas consumer ni cuantizaciones que reduzcan el footprint.
- Opciones de despliegue: LeRobot (`lerobot-eval` y `lerobot-train`), requiriendo el tipo de política `cae_fastwam` que aún no está en una release de LeRobot. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la evaluación usa batch de 5 y 10 pasos de denoising, pero no se publican tiempos por episodio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CAE-FastWAM-lerobot (este) | 5.025 M | no disponible | 96,7% media (2.000 episodios, MuJoCo 3.3.1) | Apache-2.0 | Hugging Face, formato LeRobot |
| amd/CAE-FastWAM | 5.025 M (mismos pesos) | no disponible | 97,28 ± 0,20% (GEAK, LIBERO en GPU) | Apache-2.0 | Hugging Face |
| Wan2.2-TI2V-5B (base) | ~5 B | no disponible | no disponible (modelo de vídeo, no política) | no disponible en la información | Hugging Face |

No se dispone de datos de otros modelos de política robótica comparables en la información proporcionada.

## Limitaciones y advertencias

- La carga requiere el tipo de política `cae_fastwam`, no incluido todavía en ninguna release de LeRobot; la model card indica que se actualizará con instrucciones de instalación cuando esté disponible.
- Los resultados dependen de la versión de MuJoCo: con 3.8.1 la media cae al 94,5% frente al 96,7% con 3.3.1, por lo que es imprescindible reportar la versión usada.
- El modelo está especializado en las suites de LIBERO y requiere seleccionar una suite por ejecución; no se documenta generalización a otros entornos o tareas fuera de ese benchmark.
- No se documentan sesgos, riesgos de alucinación ni comportamiento multilingüe, al no ser un modelo de lenguaje.
- La licencia Apache-2.0 permite uso comercial, pero deben revisarse los ficheros `LICENSE` y `NOTICE` por la procedencia de Wan2.2-TI2V-5B.
- Solo 2 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- No se publican requisitos de hardware para GPU de consumo ni opciones de cuantización, lo que dificulta el despliegue fuera de hardware de datacenter.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/CAE-FastWAM-lerobot
- Modelo base: https://huggingface.co/amd/CAE-FastWAM
- Backbone de vídeo: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Paper FastWAM: https://arxiv.org/abs/2603.16666
- Repositorio FastWAM: https://github.com/yuantianyuan01/FastWAM
- LeRobot: https://github.com/huggingface/lerobot
- Dataset: https://huggingface.co/datasets/yuanty/LIBERO-fastwam
