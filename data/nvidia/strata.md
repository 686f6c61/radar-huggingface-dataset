# nvidia/strata

## Resumen

STRATA (Storm-resolving Tile-based autoRegressive Atmosphere Transformer Architecture) es un modelo de emulación atmosférica global desarrollado por NVIDIA dentro de su familia Earth-2. Emula la simulación global con resolución de tormentas SCREAM (Simple Cloud-Resolving E3SM Atmosphere Model) sobre la rejilla nativa ne1024pg2 de esfera cúbica (6 caras × 2048 × 2048, aproximadamente 25,2 millones de columnas, con espaciado de unos 4,9 km) y un paso temporal de 10 minutos. El estado pronóstico incluye temperatura potencial, viento zonal y meridional, altura geopotencial, velocidad vertical de presión y humedad específica en 24 niveles del modelo, además de la temperatura del aire a 2 m; la presión en superficie y los flujos de precipitación líquida y hielo se diagnostican en cada paso.

La arquitectura es un transformer de dos etapas de tipo PixelDiT con 331,7 M de parámetros: un backbone semántico que opera sobre parches de 4×4 píxeles con atención de vecindad tridimensional y un refinador a resolución de píxel. Es un predictor determinista de un solo paso entrenado con pérdida de regresión smooth-L1 sobre un objetivo mixto de estado y tendencia, sin muestreo por difusión. La inferencia es por teselas solapadas de 128 a 256 píxeles con halos, lo que permite avanzar cualquier parte del globo en una sola GPU y descomponer el dominio completo en múltiples GPU.

Su relevancia actual radica en que lleva la emulación por IA a escala kilométrica global manteniendo la física de una simulación con resolución de tormentas, un paso que históricamente ha estado limitado por coste computacional. El modelo está pensado para investigación meteorológica y climática, no como sustituto operativo de un modelo numérico de predicción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de dos etapas tipo PixelDiT con atención de vecindad (NATTEN); backbone semántico de 24 bloques, anchura 1024, 16 cabezas, kernel 9 y dilatación 3, más refinador de píxel de 4 bloques y anchura 128 |
| Parametros totales | 331,7 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de (batch, 149 canales, alto de tesela, ancho de tesela) con teselas de 128-256 píxeles y estado global de (batch, canales, 6, 2048, 2048) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numérico, no lingüístico) |
| Licencia | OpenMDW 1.1 (Linux Foundation); los ficheros `phis.npy`, `sgh30.npy` y `landfrac.npy` derivan de los datasets STRATA-SCREAM bajo CC BY 4.0 con obligaciones de atribución en `ATTRIBUTION.md` |
| Formato de pesos | PyTorch (`.pth`); checkpoint `checkpoints/strata_v1.pth`; estadísticas de normalización en `.npy` y orden de canales en `channels.json` |

## Arquitectura y entrenamiento

El modelo es un transformer determinista de dos etapas. La primera etapa (backbone semántico) procesa parches de 4×4 píxeles con 24 bloques de anchura 1024 y 16 cabezas, empleando atención de vecindad tridimensional con kernel 9 y dilatación 3, atención con compuertas, atención alterna en profundidad, embeddings posicionales rotatorios 2D estereográficos, condicionamiento por índices de latitud y longitud y rotación de los vectores de viento entre caras del cubo. La segunda etapa refina a resolución de píxel con 4 bloques de anchura 128 y kernel 9, con proyección GELU bilineal en profundidad y normalización adaptativa de capa. La salida es una predicción de un solo paso de 10 minutos, sin difusión.

Los detalles de composición del dataset de entrenamiento (número de tokens o pasos, mezcla de datos) no están disponibles en la información proporcionada. El checkpoint publicado corresponde a un preentrenamiento seguido de un ajuste fino autorregresivo de 4 pasos. La pérdida es smooth-L1 sobre un objetivo mixto de estado y tendencia. La arquitectura de red vive en NVIDIA PhysicsNeMo como `physicsnemo.experimental.models.strata`, y las recetas de entrenamiento y el wrapper de inferencia están en el repositorio NVlabs/STRATA bajo Apache-2.0. Los canales de entrada se normalizan por canal con estadísticas almacenadas en el checkpoint.

## Capacidades

- Predicción autorregresiva del estado atmosférico tridimensional a 10 minutos por paso sobre la rejilla ne1024pg2 de esfera cúbica.
- Emisión de 145 canales de estado pronóstico (temperatura potencial, viento zonal y meridional, altura geopotencial, velocidad vertical de presión y humedad específica en 24 niveles, más temperatura a 2 m).
- Diagnóstico de presión en superficie y flujos de precipitación líquida y hielo en superficie en cada paso.
- Condicionamiento por forzamientos externos: coseno del ángulo cenital solar, geopotencial de superficie, desviación estándar de orografía subrejilla y fracción de tierra.
- Inferencia por teselas solapadas con halos, que permite avanzar regiones parciales del globo en una GPU y el globo completo con descomposición de dominio multi-GPU.
- Pronósticos de mayor plazo mediante ejecución autorregresiva del wrapper sobre pasos sucesivos de 10 minutos.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso simbólico ni procesamiento de lenguaje natural: es un emulador numérico, no un modelo de lenguaje.

## Casos de uso

- Predicción a corto plazo del estado SCREAM: el modelo avanza el estado atmosférico en pasos de 10 minutos y permite generar pronósticos de horas a días ejecutando el wrapper de forma autorregresiva, útil para estudiar la evolución de sistemas convectivos a escala kilométrica.
- Emulación de simulaciones con resolución de tormentas: sustituye total o parcialmente la ejecución de SCREAM en experimentos donde se necesita el estado atmosférico a 4,9 km de resolución con un coste computacional muy inferior al de la simulación física completa.
- Experimentos de acoplamiento entre emuladores de distinta resolución: al ser un modelo global a escala kilométrica, sirve como componente de alta resolución en flujos de downscaling o de nudging de gran escala, combinándolo con emuladores de menor resolución.
- Estudios de sensibilidad a forzamientos: al aceptar como entrada el coseno del ángulo cenital solar, la orografía subrejilla y la fracción de tierra, permite analizar cómo responden las variables pronosticadas a cambios en estos campos de forzamiento.
- Investigación sobre precipitación convectiva: los canales diagnósticos de flujos de precipitación líquida y hielo en superficie permiten analizar la distribución espacial y temporal de la precipitación simulada a escala de tormenta.
- Procesamiento regional en una sola GPU: la inferencia por teselas de 128-256 píxeles con halos permite avanzar una región concreta del globo sin necesidad de ejecutar el dominio completo, adecuado para estudios focalizados en una zona.
- Descomposición de dominio multi-GPU para el globo completo: el wrapper acepta el estado global como (batch, canales, 6, 2048, 2048) y reparte las caras y teselas entre GPUs, lo que habilita experimentos globales en clústeres.
- Docencia y reproducción de resultados: al publicarse las recetas de entrenamiento y el wrapper bajo Apache-2.0 junto con los pesos, permite reproducir y auditar experimentos de emulación atmosférica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 1,6 GB, lo que da una cota inferior del tamaño de los pesos; el estado global completo (6 × 2048 × 2048 columnas con 149 canales de entrada y 148 de salida) exige memoria adicional muy superior a la de los pesos, y la inferencia por teselas reduce ese requisito al tamaño de la tesela más los halos.
- GPU recomendadas: no se especifican modelos concretos. El autor indica que los modelos están diseñados y optimizados para ejecutarse en sistemas acelerados por GPU NVIDIA con CUDA, y el runtime requiere PyTorch y NVIDIA PhysicsNeMo con NATTEN.
- Viabilidad en GPU de consumo: no disponible. La inferencia por teselas de 128-256 píxeles sugiere que una sola GPU puede avanzar una parte del globo, pero no se publican requisitos mínimos de memoria ni modelos de consumo compatibles.
- Opciones de despliegue: PyTorch con NVIDIA PhysicsNeMo y NATTEN; el wrapper de inferencia está en NVlabs/STRATA. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros emuladores atmosféricos con los que comparar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Modelo determinista de un solo paso: no genera conjuntos de predicción probabilísticos ni incertidumbre; los pronósticos de mayor plazo se obtienen por ejecución autorregresiva y acumulan error paso a paso.
- Emula SCREAM, no la atmósfera real: los sesgos y errores de la simulación de referencia se heredan, y el modelo no debe interpretarse como un sistema operativo de predicción meteorológica.
- El ajuste fino autorregresivo es de solo 4 pasos; no se documenta el comportamiento de estabilidad más allá de ese horizonte.
- La entrada exige la rejilla nativa ne1024pg2 y los 149 canales en el orden definido en `channels.json`, con normalización por canal según las estadísticas del checkpoint; cualquier desviación en el preprocesado invalida la predicción.
- Requiere los campos estáticos `phis.npy`, `sgh30.npy` y `landfrac.npy` derivados de STRATA-SCREAM bajo CC BY 4.0, con obligaciones de atribución recogidas en `ATTRIBUTION.md`.
- La licencia OpenMDW 1.1 permite uso comercial y no comercial según el autor, pero conviene revisar los términos completos del acuerdo y las obligaciones de atribución de los ficheros derivados antes de un despliegue en producción.
- No se publican datos sobre sesgos regionales, comportamiento en latitudes polares ni rendimiento fuera de la distribución de entrenamiento.
- Idiomas soportados: no aplica; el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/strata
- Repositorio de recetas de entrenamiento y wrapper de inferencia: https://github.com/NVlabs/STRATA
- Arquitectura en NVIDIA PhysicsNeMo: https://github.com/NVIDIA/physicsnemo
- Paper de referencia: Hu, Z., et al. (2026), Scaling Storm-Resolving Atmospheric AI Simulation to the Entire Planet, arXiv:2606.31248 — https://arxiv.org/abs/2606.31248
- SCREAM: Caldwell et al. (2021), Convection-Permitting Simulations With the E3SM Global Atmosphere Model — https://doi.org/10.1029/2021MS002544
- Licencia OpenMDW 1.1: https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1
