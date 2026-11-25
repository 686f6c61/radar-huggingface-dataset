# nexiloopofficial/nexi-video

## Resumen

NEXI-Video es un pipeline de generación de vídeo texto-a-vídeo (text-to-video) construido sobre el modelo Wan2.2-TI2V-5B, empaquetado por el usuario nexiloopofficial. Su particularidad no es el modelo en sí, sino la infraestructura: está diseñado para ejecutarse íntegramente en CPU, sin GPU, mediante una arquitectura de memoria por fases que codifica el texto, libera el codificador, ejecuta el denoising, guarda los latentes en disco y finalmente decodifica. Los pesos no se incluyen en el repositorio; se descargan del upstream de Wan2.2 durante la instalación.

La contribución técnica declarada por el autor es un hallazgo sobre la ruta de decodificación VAE: en bf16 las convoluciones 3D caen en kernels de fallback lentos de CPU y la decodificación prácticamente nunca termina, mientras que en fp32 con `enable_tiling()` se aprovechan rutas optimizadas de oneDNN y el proceso se completa en 2,9 minutos. Además, los latentes se guardan en disco tras el denoising para que iterar sobre la decodificación no obligue a repetir los 64 minutos de difusión.

El propio autor es explícito sobre el estado del proyecto: el pipeline es difusión real de extremo a extremo, pero a 16 pasos y 320×576 los fotogramas resultantes son casi uniformes y no contienen contenido reconocible. No se reclama un modelo de vídeo funcional, y el objetivo de 8 GB de RAM no se cumple (el pico en denoising es de 28,5 GB). Se trata, por tanto, de un artefacto de investigación y medición más que de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión (DiT) sobre Wan2.2-TI2V-5B, con codificador de texto umt5 y VAE con decodificación por tiles |
| Parametros totales | 5B (modelo base Wan2.2-TI2V-5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no de lenguaje) |
| Tipos de cuantizacion | bf16 (DiT y VAE), fp32 (VAE en decodificación), int8 diseñado pero no probado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (los pesos se descargan del upstream en la instalación; el repositorio no los incluye) |

## Arquitectura y entrenamiento

El pipeline emplea el modelo Wan2.2-TI2V-5B, un transformer de difusión (DiT) de 5.000 millones de parámetros para generación de vídeo, junto con un codificador de texto umt5 y un VAE con soporte de decodificación por tiles. NEXI-Video no entrena ni ajusta el modelo: orquesta su ejecución en CPU mediante una arquitectura de memoria por etapas que codifica el prompt de texto en bf16 (liberando después el codificador, con un pico de ~13 GB de RSS), ejecuta el denoising del DiT en bf16, guarda los latentes en disco y finalmente decodifica con el VAE.

La innovación documentada es la corrección de la ruta de decodificación: en bf16 las convoluciones 3D del VAE recurren a kernels de fallback lentos en CPU y la decodificación no finaliza en un tiempo práctico; en fp32 con `enable_tiling()` se usan rutas optimizadas de oneDNN y el proceso baja a 2,9 minutos con un pico de 4,5 GB. El checkpointing de latentes en disco desacopla la iteración de decodificación del coste de 64 minutos del denoising. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO, ya que esos datos corresponden al modelo base Wan2.2 y no se detallan en la información proporcionada.

## Capacidades

- Generación de vídeo texto-a-vídeo mediante difusión real de extremo a extremo, sin trucos de interpolación.
- Ejecución íntegra en CPU sin GPU, con arquitectura de memoria por fases para ajustar el consumo de RAM.
- Decodificación VAE por tiles en fp32 con rutas oneDNN, que hace viable la decodificación en CPU.
- Checkpointing de latentes en disco para reutilizar el resultado del denoising entre iteraciones de decodificación.
- Soporte previsto (diseñado, no probado) de una ruta de transformer en int8 para reducir el consumo de memoria.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo.

## Casos de uso

- Investigación sobre inferencia de modelos de difusión de vídeo en CPU: el pipeline permite medir tiempos y picos de memoria por fase (codificación, denoising, decodificación) en hardware sin GPU, con cifras reproducibles sobre 8 vCPU.
- Estudio de optimización de kernels en CPU: el hallazgo bf16 frente a fp32 en las convoluciones 3D del VAE sirve como referencia para depurar caídas a kernels de fallback en oneDNN y para evaluar el impacto de `enable_tiling()`.
- Docencia y divulgación sobre pipelines de difusión: la separación explícita en fases con checkpoints en disco facilita explicar y visualizar cada etapa del proceso de generación.
- Desarrollo de estrategias de gestión de memoria: el patrón de codificar, liberar el codificador, denoising, guardar latentes y decodificar es reutilizable en otros pipelines que deban operar con RAM limitada.
- Pruebas de concepto de generación de vídeo en entornos sin acelerador: útil para validar la viabilidad de un flujo de trabajo antes de invertir en hardware GPU.
- Reproducción de mediciones y benchmarking de infraestructura: las cifras publicadas (1 min de codificación, 64 min de denoising, 2,9 min de decodificación) permiten comparar configuraciones de CPU y versiones de oneDNN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad en la información disponible. El autor proporciona mediciones de rendimiento en CPU (8 vCPU, sin GPU):

| Fase | Tiempo | Pico de RSS |
|---|---|---|
| Codificación de texto (umt5, bf16, después liberado) | ~1 min | ~13 GB |
| Denoising, 16 pasos, 320×576×17 fotogramas (DiT bf16) | 64 min | 28,5 GB |
| Decodificación VAE, fp32 con tiles | 2,9 min | 4,5 GB |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el pipeline está diseñado para CPU sin GPU.
- RAM: pico medido de 28,5 GB durante el denoising; el objetivo declarado de 8 GB de RAM no se cumple de extremo a extremo.
- CPU: mediciones realizadas sobre 8 vCPU; no se documentan otras configuraciones.
- GPU recomendadas: no disponibles (el proyecto es específicamente CPU-only).
- ¿Cabe en GPU de consumo? No aplica; el modelo base Wan2.2-TI2V-5B podría ejecutarse en GPU, pero este pipeline no lo contempla.
- Opciones de despliegue: el repositorio del autor en GitHub (NEXI-Models-Drivers/nexi-video); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 64 minutos por clip de 17 fotogramas a 320×576 con 16 pasos de denoising; el autor estima 1-3,5 horas por intento en iteraciones con 40-50 pasos o mayor resolución.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NEXI-Video (este) | 5B (base Wan2.2-TI2V-5B) | no aplica | Difusión de vídeo en CPU | Apache 2.0 | Hugging Face y GitHub |
| Wan2.2-TI2V-5B (upstream) | 5B | no aplica | Difusión de vídeo texto-a-vídeo | no disponible en la información | Upstream de Wan2.2 |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Calidad de salida no funcional: a 16 pasos y 320×576 los fotogramas son casi uniformes y no contienen contenido reconocible; el autor no reclama un modelo de vídeo operativo.
- Objetivo de memoria incumplido: el pico de 28,5 GB en denoising queda muy lejos del objetivo de 8 GB; la ruta int8 que lo reduciría está diseñada pero no probada.
- Coste computacional elevado: 64 minutos de denoising por clip de 17 fotogramas, y 1-3,5 horas por intento en configuraciones de mayor calidad.
- Repositorio sin pesos: los pesos se descargan del upstream en la instalación, por lo que la reproducibilidad depende de la disponibilidad de dicho upstream.
- Sin datos de sesgos, alucinación ni limitaciones idiomáticas: no se documentan en la información disponible.
- Licencia Apache 2.0: permite uso comercial según los términos de la licencia, pero el modelo base Wan2.2 puede tener condiciones propias que deben verificarse en su repositorio upstream.
- Estado de madurez bajo: 0 descargas y 0 likes en Hugging Face en el momento de la consulta; proyecto de investigación sin validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/nexiloopofficial/nexi-video
- Código y mediciones (GitHub): https://github.com/PupppyLoverr/NEXI-Models-Drivers/tree/main/nexi-video
