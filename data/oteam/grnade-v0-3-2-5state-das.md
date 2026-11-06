# oteam/grnade-v0.3.2-5state-das

## Resumen

gRNAde es un modelo de diseño inverso de ARN (RNA inverse folding) que predice la secuencia de nucleótidos compatible con una o varias conformaciones 3D de la columna vertebral del ARN. La implementación original corresponde a Chaitanya K. Joshi y colaboradores, publicada en el artículo "gRNAde: Geometric Deep Learning for 3D RNA inverse design" (arXiv:2305.14749). El checkpoint aquí descrito es una reimplementación no oficial del equipo OFoldX, distribuida bajo la librería `ofoldx`.

La variante `grnade-v0.3.2-5state-das` emplea un codificador de perceptrón vectorial geométrico (GVP) de 4 bloques y un decodificador autorregresivo de nucleótidos de 4 bloques, con 2,157 millones de parámetros. A diferencia de la versión v1, el grafo de v0.3.2 utiliza únicamente geometría espacial, sin canales de secuencia ni de pares de bases, y está configurado para condicionar el diseño sobre cinco conformaciones alineadas de la misma molécula de ARN.

El modelo resulta relevante para el diseño computacional de ARN con estabilidad conformacional, un problema con aplicaciones en terapéutica basada en ARN, diseño de ribozimas y nanomateriales de ARN. Su reducido tamaño (2,16 M de parámetros) permite entrenamiento e inferencia en hardware modesto, lo que facilita su integración en pipelines de diseño estructural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador GVP (geometric-vector perceptron) con decodificador autorregresivo de nucleótidos |
| Parametros totales | 2.157.052 (2,157 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (limitado por el tamaño de la estructura de ARN de entrada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Bloques de codificador | 4 |
| Bloques de decodificador | 4 |
| Tamaño nodo (escalar / vector) | 128 / 16 |
| Tamaño arista (escalar / vector) | 64 / 4 |
| Canales de arista de entrada | 131 |
| Estados conformacionales | 5 |
| Librería | ofoldx |

## Arquitectura y entrenamiento

gRNAde combina un codificador GVP que procesa grafos geométricos del ARN con un decodificador autorregresivo que genera la secuencia de nucleótidos. En la variante v0.3.2, el grafo incorpora exclusivamente geometría espacial (coordenadas atómicas), prescindiendo de los canales de orden de secuencia y de pares de bases secundarias que sí utiliza v1. El codificador agrega información de hasta cinco conformaciones alineadas de la misma molécula antes de predecir identidades de nucleótidos, lo que permite condicionar el diseño a un conjunto de estados estructurales. La configuración concreta de este checkpoint es de 4 bloques de codificador y 4 de decodificador, con 128 dimensiones escalares y 16 vectoriales por nodo, y 64/4 por arista.

El entrenamiento se plantea como recuperación autorregresiva de la secuencia a partir del contexto estructural, con un valor de label smoothing de 0,05. La model card no detalla el corpus de entrenamiento ni el número de tokens o estructuras utilizadas, remitiendo a los artículos originales para la construcción de los conjuntos de datos de una y múltiples conformaciones. La librería `ofoldx` expone un `forward` diferenciable con teacher forcing y una función de pérdida `GrnadeLoss` para ajuste fino, aunque la orquestación completa del entrenamiento (construcción de datasets, cribado, seguimiento de experimentos) queda fuera del alcance del repositorio del modelo.

## Capacidades

- Diseño inverso de secuencias de ARN a partir de una o varias conformaciones 3D de la columna vertebral.
- Condicionamiento multi-conformación: acepta hasta cinco estructuras alineadas de la misma secuencia de ARN para diseñar secuencias compatibles con todos los estados.
- Generación de múltiples candidatos de secuencia con control de temperatura de muestreo.
- Puntuación de las secuencias generadas (cada candidato incluye su registro de diseño y puntuaciones).
- Procesamiento de estructuras en formato mmCIF mediante `ofoldx.io.read_structure`.
- Soporte de estructuras con múltiples instancias de ARN mediante el parámetro `instance_id`.
- Ejecución por etapas (`prepare`, `forward`, `postprocess`) en el pipeline de `ofoldx`.
- Ajuste fino mediante `GrnadeLoss` y `forward` diferenciable con teacher forcing.

## Casos de uso

- Diseño de ARN terapéutico con múltiples estados conformacionales: el modelo permite condicionar una única secuencia a cinco conformaciones alineadas, útil para diseñar ARN cuya función dependa de un cambio conformacional (riboswitches, aptámeros).
- Diseño de ribozimas y ARN catalítico: partiendo de la estructura 3D del sitio activo, el modelo genera secuencias candidatas que preservan la geometría del centro catalítico, acelerando el cribado experimental.
- Estabilización de estructuras de ARN: dado un modelo estructural de ARN de interés, el pipeline genera secuencias alternativas puntuadas para seleccionar variantes con mayor compatibilidad geométrica.
- Diseño de ARN para nanomateriales y andamiajes: la capacidad de condicionar a varias conformaciones permite generar secuencias que adopten arquitecturas definidas en ensamblajes de ARN.
- Ajuste fino sobre datos propios: gracias a `GrnadeLoss` y al `forward` diferenciable, un grupo de investigación puede reentrenar el modelo con su propio corpus de estructuras y secuencias de ARN.
- Integración en pipelines de diseño estructural automatizados: la ejecución por etapas (`prepare`, `forward`, `postprocess`) facilita encadenar el diseño de secuencia con herramientas previas de predicción estructural y posteriores de evaluación.
- Docencia e investigación metodológica: con 2,16 M de parámetros, el modelo es viable para experimentar con aprendizaje geométrico profundo aplicado a biología estructural en hardware de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para los pesos en precisión nativa (2,16 M de parámetros); el consumo real vendrá dominado por el tamaño de los grafos de ARN procesados y el tamaño de lote.
- GPU recomendadas: cualquier GPU con soporte CUDA moderna es suficiente; no se requiere A100 ni H100. Una RTX 3090, RTX 4090 o incluso GPUs de gama de entrada con suficiente memoria para los grafos son adecuadas.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer con CUDA.
- Opciones de despliegue: la librería `ofoldx` (instalable con `pip install ofoldx`) es la vía documentada; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Conformaciones | Grafo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grnade-v0.3.2-5state-das (este) | 2,157 M | 5 | Solo espacial | AGPL-3.0 | Hugging Face (oteam) |
| grnade-v0.3.2-3state-das | 2,157 M | 3 | Solo espacial | AGPL-3.0 | Hugging Face (oteam) |
| grnade-v0.3.2-1state-das | 2,157 M | 1 | Solo espacial | AGPL-3.0 | Hugging Face (oteam) |
| gRNAde v1 | 2,157 M | Múltiple | Secuencia + pares de bases + espacial | AGPL-3.0 (según repo original) | Hugging Face (oteam) |

La comparación con modelos de otras familias de diseño inverso de ARN no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Implementación no oficial: la model card la describe explícitamente como UNOFFICIAL; el equipo original de gRNAde no la ha validado ni escrito su documentación.
- El grafo de v0.3.2 prescinde de canales de secuencia y de pares de bases secundarias, lo que puede reducir la precisión frente a v1 en estructuras donde la topología secundaria aporte información crítica.
- Las conformaciones múltiples deben contener la misma secuencia de ARN y estar alineadas; el pipeline no realiza el alineamiento por sí mismo.
- No se han publicado métricas de rendimiento para este checkpoint concreto en la información disponible.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso comercial en servicios en red requiere liberar el código fuente derivado, lo que puede ser restrictivo para productos propietarios.
- Riesgo de sobreajuste a la distribución de estructuras de entrenamiento del corpus original, cuyo detalle no se especifica en la model card.
- No aplica a tareas de generación de texto, código ni lenguaje natural; cualquier uso fuera del diseño inverso de ARN queda fuera de su dominio previsto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oteam/grnade-v0.3.2-5state-das
- Paper original gRNAde: https://arxiv.org/abs/2305.14749
- Paper de diseño generativo (bioRxiv): https://www.biorxiv.org/content/10.1101/2025.11.29.691298
- Repositorio oficial de gRNAde: https://github.com/chaitjo/geometric-rna-design
- Código del modelo en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/grnade
- Guía del pipeline de OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Sitio de la librería ofoldx: https://ofoldx.valtech.ai/
- Variante v1: https://huggingface.co/oteam/grnade
- Variante v1 ODesign: https://huggingface.co/oteam/grnade-odesign
- Variante 1 estado (all): https://huggingface.co/oteam/grnade-v0.3.2-1state-all
- Variante 1 estado (das): https://huggingface.co/oteam/grnade-v0.3.2-1state-das
- Variante 1 estado (multi): https://huggingface.co/oteam/grnade-v0.3.2-1state-multi
- Variante 2 estados (all): https://huggingface.co/oteam/grnade-v0.3.2-2state-all
- Variante 3 estados (all): https://huggingface.co/oteam/grnade-v0.3.2-3state-all
- Variante 3 estados (das): https://huggingface.co/oteam/grnade-v0.3.2-3state-das
- Variante 3 estados (multi): https://huggingface.co/oteam/grnade-v0.3.2-3state-multi
- Variante 5 estados (all): https://huggingface.co/oteam/grnade-v0.3.2-5state-all
- Variante 5 estados (multi): https://huggingface.co/oteam/grnade-v0.3.2-5state-multi
