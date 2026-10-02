# ascientist/sentionaut-axon-world

## Resumen

El modelo `ascientist/sentionaut-axon-world` es un modelo del mundo (world model) muy especializado en visión protésica, publicado por el usuario ascientist en HuggingFace bajo licencia MIT. En concreto, se trata de un "drive student": una red neuronal entrenada para imitar la salida del modelo analítico `BiphasicAxonMapTorch`, que simula la estimulación eléctrica de un implante retinal Argus II sobre una rejilla de percepción de 97x97 puntos (rango de -12 a 12 con paso 0,25).

A diferencia de los modelos de lenguaje, este sistema no procesa texto ni mantiene conversaciones: predice el "drive" espacial generado por un patrón de estimulación de electrodos. El desvanecimiento de brillo se mantiene mediante un integrador con fuga (leaky integrator) analítico, de modo que la red aprende únicamente la componente espacial del fenómeno.

Su relevancia radica en el ámbito de la investigación en neuroprótesis y modelos del mundo: permite sustituir un modelo analítico computacionalmente costoso por una red aprendida que aproxima su comportamiento con un error de rollout en datos reservados de aproximadamente 0,005, tras 50 épocas de entrenamiento (pérdida final 0,0046). El repositorio, no obstante, no registra descargas ni likes y no documenta parámetros, idiomas ni benchmarks estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal "student" (drive student) que destila el modelo analítico `BiphasicAxonMapTorch`; topología concreta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible / no aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | checkpoint de PyTorch cargado mediante `AxonMapWorld.from_pretrained`; formato exacto no especificado |
| Rejilla de percepcion | 97x97 puntos (xrange e yrange de -12 a 12, paso 0,25) |
| Implante objetivo | Argus II (coordenadas de electrodos almacenadas en el checkpoint) |
| Libreria | sentionaut |
| Region | us |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal "student" dentro de un esquema de destilación: aprende a reproducir el "drive" espacial que genera el modelo analítico `BiphasicAxonMapTorch` para un implante Argus II sobre una rejilla de 97x97. La componente temporal (el desvanecimiento de brillo) no se aprende, sino que se delega en un integrador con fuga analítico. La topología interna de la red (número de capas, tipo de capas, canales) no se detalla en la información proporcionada.

El entrenamiento se realizó durante 50 épocas sobre estimulación aleatoria de electrodos, con entre 1 y 3 electrodos activos y variando los parámetros rho y lambda. La pérdida final de entrenamiento fue de 0,0046 y el error de rollout sobre datos reservados con la misma receta se sitúa en torno a 0,005. El método `step(state, action)` del modelo reproduce el comportamiento del profesor. No se documenta el número de tokens ni el uso de RLHF o DPO, conceptos que en cualquier caso no aplican a este tipo de modelo.

## Capacidades

- Predicción del "drive" espacial (activación espacial) a partir de un patrón de estimulación de electrodos.
- Emulación del modelo analítico profesor `BiphasicAxonMapTorch` con un error de rollout aproximado de 0,005.
- Simulación por pasos mediante `step(state, action)`, replicando la dinámica del profesor.
- Operación sobre una rejilla de percepción fija de 97x97 puntos con paso 0,25.
- Almacenamiento interno de las coordenadas de los electrodos del implante Argus II en el checkpoint.
- Integración con un integrador con fuga analítico para modelar el desvanecimiento de brillo.
- No soporta tool calling, function calling, uso como agente, razonamiento multi-paso ni capacidades multilingües (no aplicables a este tipo de modelo).

## Casos de uso

- Simulación de visión protésica: el modelo predice cómo se distribuiría la activación espacial sobre la rejilla de 97x97 ante un patrón de electrodos del implante Argus II, lo que permite estudiar perceptos sin recurrir al costoso modelo analítico completo.
- Aceleración de pipelines de simulación: al sustituir el modelo analítico `BiphasicAxonMapTorch` por la red aprendida, se reducen los tiempos de cómputo en experimentos que requieren miles de evaluaciones de patrones de estimulación.
- Entrenamiento de políticas de estimulación: investigadores que optimicen estrategias de activación de electrodos pueden usar el modelo como entorno rápido para evaluar recompensas perceptivas.
- Generación de datos sintéticos: producción de pares (patrón de electrodos, drive espacial) para entrenar otros componentes del pipeline de visión protésica.
- Prototipado de escenarios de estimulación: evaluar rápidamente combinaciones de 1 a 3 electrodos activos con distintos valores de rho y lambda, replicando la receta de entrenamiento.
- Investigación en neuroprótesis retinal: análisis de cómo la geometría del axón y la disposición de electrodos del Argus II afectan a la activación espacial resultante.
- Docencia y divulgación: demostrar el funcionamiento de un modelo del mundo aplicado a percepción artificial en simuladores educativos.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| Perdida final de entrenamiento | 0,0046 | Tras 50 epocas sobre estimulacion aleatoria |
| Error de rollout (datos reservados) | ~0,005 | Misma receta de estimulacion que el entrenamiento |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no son aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se documentan requisitos de memoria.
- GPU recomendadas: no disponible. No se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no disponible. El tamaño del repositorio se reporta como 0,0 GB y la rejilla es de 97x97, lo que sugiere una red de tamaño reducido que probablemente puede ejecutarse en CPU, pero no se confirma.
- Opciones de despliegue: la única vía documentada es la librería `sentionaut`, mediante `AxonMapWorld.from_pretrained("ascientist/sentionaut-axon-world")`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables dentro de la misma categoría (destilación de modelos analíticos de visión protésica sobre implantes Argus II), y la librería `sentionaut` no cuenta con referencias alternativas documentadas en los datos disponibles.

## Limitaciones y advertencias

- Ámbito de aplicación extremadamente restringido: solo modela la componente espacial del drive para un implante Argus II sobre una rejilla concreta de 97x97; no es un modelo generalista.
- No se documentan sesgos, pero al ser una red entrenada con estimulación aleatoria de 1 a 3 electrodos, su fidelidad fuera de esa receta es incierta.
- Riesgo de error fuera de distribución: el error de rollout reportado (~0,005) corresponde a la misma receta de estimulación del entrenamiento; no se aportan datos sobre otros patrones.
- El desvanecimiento de brillo no forma parte de la red aprendida, sino de un integrador analítico; cualquier uso debe combinar ambos componentes.
- No se especifican parámetros, idiomas ni formato de pesos exacto, lo que dificulta evaluar su reproducibilidad e interoperabilidad.
- Licencia MIT: permite uso comercial, pero no se acompaña de documentación técnica, ejemplos de uso adicionales ni guía de integración.
- Repositorio sin descargas ni likes y con tamaño reportado de 0,0 GB, lo que puede indicar ausencia de pesos accesibles o de mantenimiento.
- Las fechas de creación y actualización (2026-10-01) no permiten confirmar el estado actual de mantenimiento del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ascientist/sentionaut-axon-world
- Referencia general sobre modelos del mundo (Wikipedia): https://en.wikipedia.org/wiki/World_model_(artificial_intelligence)
- Artículo de Ars Technica sobre promesas y límites de los modelos del mundo: https://arstechnica.com/ai/2026/07/simulating-everything-sort-of-the-promise-and-limits-of-world-models/
- Artículo "World Models in Artificial Intelligence: Sensing, Learning, and ..." (arXiv): https://arxiv.org/html/2503.15168
- Artículo "From Observation to Insight: Mechanistic World Models and ..." (arXiv): https://arxiv.org/abs/2607.12474

Nota: salvo el enlace de HuggingFace, el resto de enlaces corresponde a referencias generales sobre modelos del mundo y no trata específicamente este modelo.
