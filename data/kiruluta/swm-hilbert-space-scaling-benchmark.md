# kiruluta/SWM-Hilbert-Space-Scaling-Benchmark

## Resumen

SWM-Hilbert-Space-Scaling-Benchmark es un repositorio de referencia publicado en Hugging Face por kiruluta (Andrew Kiruluta) como acompañamiento reproducible del manuscrito "Spectral World Models: A Reproducible Operator-Based Architecture for Multimodal Prediction and Planning". No es un modelo entrenado con pesos publicados, sino un andamiaje experimental (scaffold) en PyTorch que implementa la idea central del artículo: un estado espectral Haar de un nivel seguido de una transición estructurada condicionada por acción, construida con ganancias diagonales, interacciones locales o bandeadas, correcciones de bajo rango y una no linealidad acotada.

El problema que aborda es de escalado científico: el proof-of-concept del manuscrito es deliberadamente pequeño y reporta resultados mixtos, de modo que la pregunta abierta no es si el benchmark de juguete gana, sino si los operadores espectrales estructurados resultan ventajosos para estados multiescala mayores y rollouts más largos, evitando el almacenamiento denso O(n²) de la transición. El repositorio invita explícitamente a contribuidores con cómputo GPU sustancial a ejecutar barridos de escalado y a publicar los resultados, incluso si falsan la hipótesis de escalado.

La relevancia actual es metodológica: ofrece una ruta reproducible desde una tarea de humo sobre sklearn Digits hasta cargas sintéticas multiescala de 64 a 512 de resolución y rango 16 a 128, con entrenamiento distribuido de 1 a 16+ GPUs. La información disponible no incluye cifras de parámetros, contexto, benchmarks ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de mundo espectral basado en operadores: estado Haar de un nivel y transición estructurada condicionada por acción (ganancias diagonales, interacciones locales/bandeadas, correcciones de bajo rango, no linealidad acotada); implementado en PyTorch. No es una arquitectura transformer de lenguaje |
| Parámetros totales | no disponible (depende de la resolución, de 64 a 512, y del rango de la corrección de bajo rango, de 16 a 128) |
| Parámetros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no disponible; el equivalente operativo sería el horizonte de rollout, no especificado en la información proporcionada |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no se distribuyen pesos preentrenados; el repositorio contiene código y scripts en PyTorch. Los resultados de los experimentos se vuelcan en JSON/CSV (por ejemplo, `results/a100_1gpu.json`) |
| Autoría | kiruluta (Andrew Kiruluta) |
| Fecha de publicación | 23 de septiembre de 2026 según los metadatos de Hugging Face; última actualización el mismo día |
| Descargas / likes | 0 descargas y 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura preserva la idea de implementación del manuscrito: se calcula un estado espectral mediante una transformada Haar de un nivel y se aplica después una transición estructurada condicionada por la acción. Esa transición combina cuatro componentes: ganancias diagonales, interacciones locales o bandeadas, correcciones de bajo rango y una no linealidad acotada. El objetivo de diseño es evitar el almacenamiento denso O(n²) del operador de transición, lo que permite plantear estados multiescala de mayor resolución sin que la memoria crezca de forma cuadrática. El repositorio está etiquetado como `world-models`, `spectral`, `wavelets`, `hilbert-space`, `multimodal`, `benchmarking` y `distributed-training`.

El marco experimental se organiza en tres pistas. La pista A reproduce la tarea original del artículo: Digits de sklearn condicionado por seis acciones (izquierda, derecha, arriba, abajo, desenfoque e identidad), concebida como objetivo de humo y de reproducibilidad. La pista B escala con campos sintéticos multiescala de resolución 64 a 512 y rango 16 a 128, con 1 a 16+ GPUs. La pista C extiende el trabajo a Moving MNIST o vídeo físico, DMControl en píxeles, Habitat/navegación, predicción visual tipo Atari y baselines con cómputo igualado. Los comandos de ejemplo del repositorio emplean configuraciones como `--resolution 128 --samples 20000 --epochs 3 --batch-size 32 --rank 32` en una GPU, y `GPUS=8 DATASET=synthetic RES=256 BATCH=16 EPOCHS=3 SAMPLES=20000 RANK=64` para el barrido de strong scaling en múltiples GPUs. No se documenta en la información disponible el uso de RLHF, DPO ni un corpus de texto; las métricas núcleo que se piden a los contribuidores son MSE final, muestras por segundo, tiempo transcurrido, recuento de parámetros y memoria GPU pico. El repositorio también incluye un test de humo (`./scripts/smoke_test.sh`) y una matriz de experimentos recomendada en `configs/scaling_matrix.yaml`.

## Capacidades

- Predicción multimodal en un espacio latente espectral con condicionamiento por acción, mediante la transición estructurada descrita en el manuscrito.
- Planificación basada en imaginación, según el alcance declarado del artículo de referencia.
- Reproducción de la tarea de Digits de sklearn con seis acciones discretas (izquierda, derecha, arriba, abajo, desenfoque e identidad) como objetivo de humo.
- Entrenamiento y evaluación multiescala con campos sintéticos en resoluciones de 64 a 512 y rangos de 16 a 128.
- Entrenamiento distribuido con DDP y barridos de strong scaling de 1 a 16+ GPUs mediante `scripts/run_scaling_sweep.sh`.
- Agregación y publicación de resultados en JSON/CSV con métricas de MSE, throughput, tiempo, parámetros y memoria GPU pico.
- Punto de partida para extensiones a vídeo, control visual y navegación (Moving MNIST, DMControl, Habitat, entornos tipo Atari).
- No se documentan en la información disponible capacidades de generación de lenguaje, tool calling, function calling, razonamiento multi-paso, agentes ni soporte multilingüe.

## Casos de uso

- Reproducción de resultados del manuscrito: ejecutar la pista A sobre Digits de sklearn con las seis acciones permite verificar que la implementación coincide con el proof-of-concept publicado antes de invertir cómputo en escalados mayores; el repositorio incluye un `smoke_test.sh` específicamente para esta validación.
- Estudio de escalado en resolución y rango: lanzar la pista B con resoluciones de 64 a 512 y rangos de 16 a 128 para medir cómo evolucionan MSE final y memoria pico, que es la pregunta científica central del repositorio sobre el almacenamiento de operadores en alta resolución.
- Barrido de strong scaling en clúster: usar `run_scaling_sweep.sh` con 1, 2, 4, 8 y 16 GPUs para cuantificar muestras por segundo y tiempo transcurrido, y determinar si el entrenamiento distribuido mantiene eficiencia al aumentar el número de dispositivos.
- Comparación con cómputo igualado frente a baselines de modelos de mundo: la pista C pide explícitamente baselines con presupuesto de cómputo equivalente, de modo que el modelo espectral se pueda situar frente a alternativas optimizadas sin ventaja de recursos.
- Análisis de deriva en rollouts largos: como el manuscrito señala el drift de horizonte largo como reto abierto, el repositorio sirve para medir estabilidad de rollouts prolongados y publicar métricas de estabilidad junto al MSE.
- Extensión a predicción de vídeo físico: emplear Moving MNIST o vídeo físico como dominio de prueba para comprobar si la transición estructurada generaliza más allá de los campos sintéticos multiescala.
- Control visual y navegación: adaptar la pista C a DMControl en píxeles o Habitat para evaluar la transición condicionada por acción en tareas de decisión con observaciones de alta dimensión.
- Auditoría de memoria y throughput de operadores: usar los JSON de resultados para documentar el compromiso entre rango, resolución, memoria GPU pico y velocidad, útil para decidir configuraciones viables en hardware concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el proof-of-concept del manuscrito es intencionadamente pequeño y reporta resultados mixtos, pero no incluye cifras concretas (MSE, muestras por segundo, parámetros o memoria) en el material consultado. El repositorio define las métricas que los contribuidores deben reportar, no resultados obtenidos:

| Métrica a reportar | Descripción según el repositorio |
|---|---|
| MSE final | Error cuadrático medio al final del entrenamiento |
| Muestras por segundo | Throughput medido durante el entrenamiento |
| Tiempo transcurrido | Tiempo total de la ejecución |
| Recuento de parámetros | Parámetros del modelo en la configuración empleada |
| Memoria GPU pico | Consumo máximo de memoria durante el entrenamiento |
| Rollout y estabilidad | Métricas adicionales sugeridas para comparaciones publicables |
| Baselines con cómputo igualado | Requisito para comparaciones justas |

## Requisitos de hardware

- El repositorio está pensado para contribuidores con cómputo GPU sustancial; la propia model card apela a "contributors with substantial GPU compute".
- Entrenamiento en una sola GPU: el comando de ejemplo de la pista B está pensado para una GPU y vuelca a `results/a100_1gpu.json`, lo que sugiere el uso de A100, aunque no se especifica el modelo ni la VRAM exacta.
- Entrenamiento multi-GPU: el barrido recomendado usa `GPUS=8` con resolución 256, batch 16, rango 64 y 20 000 muestras; la pista B contempla de 1 a 16+ GPUs mediante DDP.
- VRAM estimada: no disponible. La memoria pico es una de las métricas que el repositorio pide medir y reportar, no un valor publicado.
- Compatibilidad con GPU de consumo: no disponible; no hay cifras que permitan afirmar si una RTX 4090 u otra GPU de consumo es suficiente para cada configuración.
- Opciones de despliegue: al no ser un modelo de lenguaje ni distribuir pesos, no aplican vLLM, llama.cpp, Ollama ni TGI. El despliegue es entrenamiento con PyTorch y DDP, más scripts de test de humo y de barrido.
- Latencia y throughput: no disponibles; las muestras por segundo y el tiempo transcurrido son precisamente las métricas que cada contribuidor debe generar.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de benchmarks en la información proporcionada, por lo que la comparación se limita a artefactos relacionados y queda marcada como no disponible en los campos sin dato.

| Artefacto | Tipo | Relación | Licencia | Datos comparables |
|---|---|---|---|---|
| kiruluta/SWM-Hilbert-Space-Scaling-Benchmark | Scaffold de escalado en Hugging Face | Repositorio objeto de esta ficha: pistas A, B y C, barridos de 1 a 16+ GPUs | MIT | no disponible |
| kiruluta/Spectral-World-Models-Reproducibility | Repositorio de reproducibilidad en Hugging Face (unos 119 MB, 5 commits) | Mismo autor; artefacto complementario de reproducibilidad y llamada a colaboración | no disponible | no disponible |
| andrew-jeremy/Spectral-World-Models (GitHub) | Implementación compacta en PyTorch del manuscrito, con benchmark Mini | Implementación alternativa del mismo marco arquitectónico | no disponible | no disponible |
| Baselines de modelos de mundo optimizados | Categoría genérica citada en el manuscrito | Punto de comparación exigido en la pista C con cómputo igualado | no disponible | no disponible |

## Limitaciones y advertencias

- El propio repositorio declara que es un andamiaje de escalado y no una reivindicación de estado del arte; el proof-of-concept del manuscrito es pequeño y sus resultados son mixtos.
- Retos de escalado reconocidos explícitamente: almacenamiento de operadores en alta resolución, deriva de rollouts en horizontes largos, grafos de lenguaje de longitud variable y comparación justa con baselines optimizados de modelos de mundo.
- Contribuciones que falsen la hipótesis de escalado se consideran tan valiosas como los resultados positivos; la viabilidad del enfoque a gran escala está por determinar.
- No se distribuyen pesos preentrenados: cualquier uso práctico exige entrenar desde cero con PyTorch y el hardware adecuado.
- No hay resultados publicados de MSE, throughput, memoria ni recuento de parámetros en la información disponible; cualquier cifra que se cite debe provenir de ejecuciones propias y reproducibles.
- Sesgos conocidos: no disponibles en la información proporcionada. Al trabajar sobre Digits de sklearn y campos sintéticos, los dominios son de laboratorio y no representan distribuciones reales.
- Riesgo de alucinación: no aplica en el sentido de un modelo generativo de lenguaje; el riesgo análogo es la deriva de predicción en rollouts largos, señalada como reto abierto.
- Limitaciones de contexto e idioma: no disponibles; el repositorio no declara soporte de idiomas ni ventana de contexto.
- Licencia MIT: permite uso, modificación y redistribución, incluido el uso comercial, con conservación del aviso de copyright y de la licencia. Al no incluir pesos, la licencia aplica al código y a los scripts.
- Artefacto muy reciente y sin tracción en Hugging Face (0 descargas y 0 likes en el momento de la consulta), lo que implica ausencia de validación independiente por terceros.
- Las fechas de los metadatos de Hugging Face (creación y actualización el 23 de septiembre de 2026) deben verificarse contra la fuente original antes de citarlas.

## Enlaces

- Hugging Face (repositorio objeto de la ficha): https://huggingface.co/kiruluta/SWM-Hilbert-Space-Scaling-Benchmark
- Hugging Face (reproducibilidad, mismo autor): https://huggingface.co/kiruluta/Spectral-World-Models-Reproducibility/tree/main
- arXiv (resumen del artículo): https://arxiv.org/abs/2507.21189
- arXiv (PDF): https://arxiv.org/pdf/2507.21189
- GitHub (implementación compacta del manuscrito): https://github.com/andrew-jeremy/Spectral-World-Models/blob/main/README.md
- ResearchGate (trabajo relacionado del mismo autor sobre J-Space): https://www.researchgate.net/profile/Andrew-Kiruluta/publication/410399813_Probing_the_Formation_and_Dynamics_of_J-Space_in_Language_Models/links/6a5a6f2fa1fbd16347092049/Probing-the-Formation-and-Dynamics-of-J-Space-in-Language-Models.pdf
- Rutas internas citadas en la model card: `COLLABORATION.md`, `configs/scaling_matrix.yaml`, `benchmarks/train.py`, `scripts/run_scaling_sweep.sh`, `scripts/smoke_test.sh`
