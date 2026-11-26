# LuxiaSL/kotodama-moonshot-1b-s7

## Resumen

kotodama-moonshot-1b-s7 es un checkpoint intermedio de la trayectoria de entrenamiento del tronco kotodama-tsumugi, un transformer decoder-only de 1,42 mil millones de parametros desarrollado por Luxia con Anima Labs dentro del programa kotodama. No es un modelo final ni un modelo afinado para instrucciones: es una réplica de la semilla 7 detenida a 10B tokens, pensada para estudiar cuándo emerge la capacidad de binding de referentes durante el preentrenamiento.

La arquitectura destaca por dos innovaciones: un bloque central de 20 capas que se ejecuta dos veces (52 capas únicas, 72 capas efectivas) con pesos compartidos, y un mecanismo de attention residuals entre bloques cuyos límites se ajustaron a la geometría interna de capas del propio modelo en lugar de repartirse uniformemente. El entrenamiento usó el optimizador Muon, lotes de 2M tokens, contexto de 4K y tasa de aprendizaje constante.

Su relevancia es fundamentalmente de investigación: forma parte de una serie de réplicas por semilla que permiten medir la progresión de cinco etapas descrita en el Binding Atlas y comparar trayectorias de entrenamiento a distintos recuentos de tokens. El repositorio incluye checkpoints intermedios cada 250M tokens hasta 4B y cada 1B hasta 10B, además de dos ramas de cooldown, lo que lo convierte en material para estudios de dinámica de entrenamiento más que para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con attention residuals entre bloques y bloque central repetido (looped transformer) |
| Parametros totales | 1,42B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | ingles (mezcla dominante en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) + aliases.json + config.json; checkpoint.pt para estado resumible |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 52 capas únicas con anchura 1536. Un bloque de 20 capas situado en el centro se ejecuta dos veces, dando 72 capas efectivas; las capas repetidas comparten pesos con el bloque núcleo y safetensors almacena cada tensor una sola vez, por lo que es necesario restaurar las entradas compartidas desde `aliases.json` (`sd[alias] = sd[source]`) antes de cargar. Los attention residuals entre bloques enrutan la atención a través de fronteras de bloque ajustadas a la geometría de capas del propio modelo, no espaciadas uniformemente.

El entrenamiento empleó el optimizador Muon, lotes de 2M tokens, contexto de 4K y tasa de aprendizaje constante. Esta semilla (seed 7) se detuvo a 10B tokens como comparación de semillas; la trayectoria principal es la seed 17 con 100B tokens (`LuxiaSL/kotodama-tsumugi-1b-trajectory`). Los datos son una mezcla curada dominada por inglés con código, artículos científicos, patentes, textos legales, libros, web, matemáticas y fuentes conversacionales, más un suplemento conversacional de aproximadamente el 0,7% de los tokens; el dataset no está publicado. Detalle numérico relevante: este tronco calculó el enrutado AttnRes en fp64 bajo `torch.compile`; las ejecuciones que continúen desde estos checkpoints deben activar `attnres_eps_fp64_compat: true` para replicar la misma numérica.

## Capacidades

- Generación de texto autoregresiva en inglés como capacidad base de preentrenamiento.
- Razonamiento y matemáticas derivados de la mezcla de datos (papers, matemáticas, código).
- Generación de código, con presencia explícita de código en el corpus de entrenamiento.
- Capacidad multilingüe limitada: el modelo está entrenado con una mezcla dominada por inglés y solo declara inglés.
- No incluye instruction tuning ni resultados de evaluación; no se documenta soporte de tool calling, function calling ni comportamiento de agente.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Estudio de dinámica de preentrenamiento: cargar checkpoints sucesivos (`step{S}-tokens{T}B`) y medir la evolución de métricas de binding de referentes para situar el modelo en una de las cinco etapas del Binding Atlas.
- Comparación entre semillas: contrastar esta réplica (seed 7, 10B tokens) con la trayectoria principal (seed 17, 100B) para aislar el efecto de la semilla frente al del cómputo.
- Investigación de arquitecturas con pesos compartidos: analizar el comportamiento del bloque central repetido y de los attention residuals con fronteras ajustadas a la geometría de capas.
- Reproducción de numérica: validar pipelines de entrenamiento que dependan del enrutado AttnRes en fp64 activando `attnres_eps_fp64_compat`.
- Reanudación de entrenamiento: usar las ramas `anchor-step{S}-tokens{T}B` (con momentos del optimizador, scheduler y posición de datos) para continuar o bifurcar el entrenamiento desde 10B tokens.
- Estudio de cooldown: emplear las ramas `anneal2000-…` (bifurcada a 4,2B y llevada a 5B) y `anneal4768-…` (bifurcada a 10B y llevada a 11B) para analizar el efecto del annealing sobre el tronco.
- Base para experimentos de ajuste posteriores: al estar bajo Apache 2.0 y en safetensors bf16, sirve como punto de partida para fine-tuning controlado en investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el repositorio no contiene resultados de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2,8 GB solo para pesos (1,42B parámetros × 2 bytes), más overhead de activaciones y caché KV para contexto de 4K.
- VRAM estimada en fp32: aproximadamente 5,7 GB solo para pesos.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070 en adelante); en bf16 con margen en 8 GB para contexto moderado.
- GPU recomendadas para investigación a escala: A100, H100 o RTX 4090 para carga rápida de checkpoints y comparaciones por lotes.
- Opciones de despliegue: el paquete `kotodama` (`KotodamaModel`, preset `1b-tsumugi`, el antiguo `1b-moonshot-loop` sigue cargando) es la vía documentada; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Nota de almacenamiento: el repositorio ocupa 139,7 GB por la acumulación de checkpoints intermedios y estados resumibles; conviene descargar solo las ramas necesarias.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kotodama-moonshot-1b-s7 | 1,42B | 4K | Checkpoint de trayectoria, sin instrucciones | Apache 2.0 | Hugging Face |
| kotodama-tsumugi-1b-trajectory (seed 17) | 1,42B | 4K | Trayectoria principal, 100B tokens | Apache 2.0 | Hugging Face |
| Modelos decoder-only de ~1B afinados para instrucciones | ~1B | variable | Modelo final con instruction tuning | variable | Hugging Face |

La comparación con modelos de propósito general de tamaño similar no es directa: este checkpoint no incluye instruction tuning ni evaluación, por lo que su rendimiento en tareas de usuario no es comparable con el de un modelo final. La alternativa más cercana dentro del mismo programa es la trayectoria principal de seed 17 con 100B tokens.

## Limitaciones y advertencias

- No es un modelo final: se detuvo a 10B tokens como comparación de semillas y no ha pasado por instruction tuning ni evaluación publicada.
- Sin benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni similares, por lo que no puede acreditarse su rendimiento en tareas concretas.
- Solo inglés declarado; el soporte multilingüe es limitado y no evaluado.
- Contexto corto de 4K tokens, insuficiente para tareas de contexto largo.
- Riesgo de alucinación no caracterizado por ausencia de evaluaciones.
- Sesgos desconocidos: el dataset no está publicado y no se documenta análisis de sesgos.
- Carga no trivial: requiere restaurar tensores compartidos desde `aliases.json` antes de cargar en safetensors.
- Compatibilidad numérica: las continuaciones deben activar `attnres_eps_fp64_compat: true` para replicar el enrutado en fp64.
- Licencia Apache 2.0 permite uso comercial, pero al no ser un modelo afinado su utilidad directa en producción es muy limitada.
- Tamaño del repositorio (139,7 GB) por la acumulación de checkpoints y estados resumibles.

## Enlaces

- Hugging Face: https://huggingface.co/LuxiaSL/kotodama-moonshot-1b-s7
- Trayectoria principal (seed 17, 100B): https://huggingface.co/LuxiaSL/kotodama-tsumugi-1b-trajectory
- Páginas del proyecto: https://kotodama.animalabs.ai/
- Binding Atlas: https://kotodama.animalabs.ai/binding-atlas
- Repositorio de código kotodama: https://github.com/anima-research/kotodama
- Anima Labs: https://animalabs.ai/
- Perfil del autor: https://x.com/kataletheia
- Claude (herramienta usada en el desarrollo): https://www.anthropic.com/claude
