# Eku127/swiftvln-satnav-qwen3vl-8b-1ep-f32s4-overlap0-pf-h8-pool-s2-noembed

## Resumen

El modelo `Eku127/swiftvln-satnav-qwen3vl-8b-1ep-f32s4-overlap0-pf-h8-pool-s2-noembed` es un ajuste fino (fine-tune) del modelo base `Qwen/Qwen3-VL-8B-Instruct` desarrollado por Jiajun Jiang (Eku127) para la tarea de navegación visión-lenguaje (VLN) sobre imágenes satelitales, dentro del benchmark SatNav. El modelo combina un backbone multimodal de 8 mil millones de parámetros con un diseño de memoria por referencia (SwiftVLN) que procesa ventanas de 32 fotogramas RGB y hasta 8 fotogramas históricos, prediciendo secuencias de 4 acciones de navegación.

Este checkpoint está pensado exclusivamente para el entorno de evaluación SatSim de SatNav, no como un modelo conversacional o de propósito general. Su relevancia radica en que demuestra cómo un modelo de lenguaje y visión de gran tamaño puede adaptarse a tareas de navegación autónoma en entornos continuos a partir de imágenes de satélite, un área emergente en robótica y agentes encarnados. El entrenamiento se realizó con trayectorias expertas offline de la versión SatNav-v0.1, durante una sola época y con ajuste de todos los parámetros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL 8B (transformer multimodal con codificador de visión) |
| Parametros totales | 8 mil millones (8B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32 fotogramas RGB + hasta 8 fotogramas de historia (equivalente a una ventana temporal de 40 observaciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `Qwen/Qwen3-VL-8B-Instruct`, un transformer multimodal que combina un codificador de visión con un modelo de lenguaje de 8B parámetros. Sobre esta base, SwiftVLN añade un mecanismo de memoria por referencia: cada fotograma se procesa con un promedio por agrupación (average pooling) con stride 2, y se mantienen hasta 8 fotogramas históricos muestreados uniformemente. La entrada consiste en una ventana de 32 fotogramas RGB consecutivos, y la salida es una predicción de 4 acciones de navegación (horizonte de predicción).

El entrenamiento se realizó con ajuste completo de todos los parámetros (full fine-tuning) durante 1 época, con una tasa de aprendizaje de `2e-5`, utilizando las trayectorias expertas offline del conjunto de datos SatNav-v0.1. Las ventanas de entrenamiento no se solapan (`overlap0`). No se aplicó ninguna mejora de embeddings (`noembed`). El nombre del repositorio codifica todas estas decisiones experimentales, y el sistema de evaluación de SwiftVLN deriva la configuración directamente de ese nombre.

## Capacidades

- Navegación autónoma en entornos continuos a partir de imágenes de satélite, siguiendo instrucciones en lenguaje natural.
- Procesamiento de secuencias de hasta 32 fotogramas RGB con memoria de hasta 8 fotogramas históricos.
- Predicción de secuencias de 4 acciones de navegación (horizonte de predicción).
- Integración con el entorno de evaluación SatSim de SatNav, que simula el desplazamiento del agente sobre el terreno.
- Capacidad de razonamiento espacial y de planificación de rutas basada en observaciones visuales satelitales.
- No es un modelo de chat ni de propósito general; su uso está restringido al pipeline de evaluación de SwiftVLN.

## Casos de uso

- Investigación en navegación visión-lenguaje: el modelo sirve como referencia para estudiar cómo los modelos multimodales de gran tamaño se adaptan a tareas de navegación en entornos satelitales, permitiendo comparar métricas como SR (tasa de éxito) y SPL (tasa de éxito ponderada por longitud de trayectoria).
- Desarrollo de agentes encarnados para entornos exteriores: puede integrarse en simuladores de robótica que requieran planificación de rutas a partir de imágenes aéreas o satelitales, por ejemplo en misiones de búsqueda y rescate o inspección de infraestructuras.
- Evaluación de estrategias de memoria en VLN: el diseño de memoria por referencia (per-frame pooling con stride 2) permite experimentar con diferentes políticas de compresión de observaciones históricas.
- Benchmarking de modelos de 8B en tareas de navegación: al ser un fine-tune de Qwen3-VL-8B, sirve para comparar el rendimiento de backbones de 8B frente a variantes más pequeñas (como las de 3B) en el mismo benchmark SatNav.
- Entrenamiento de políticas de navegación con aprendizaje por imitación: las trayectorias expertas de SatNav-v0.1 se utilizan para entrenar el modelo, y este checkpoint puede servir como punto de partida para técnicas de aprendizaje por refuerzo o destilación.
- Simulación de navegación en entornos urbanos o rurales: el modelo puede evaluarse en los splits `val_seen` y `val_unseen` de SatNav para medir su capacidad de generalización a escenarios no vistos.

## Benchmarks y rendimiento

El modelo fue evaluado en el simulador SatSim con un límite de 500 pasos por episodio. Los resultados reportados en la model card son los siguientes:

| Split | Episodios | NE (error de navegación) | OS (éxito de orientación) | SR (tasa de éxito) | SPL (éxito ponderado por longitud) |
| --- | ---: | ---: | ---: | ---: | ---: |
| `val_seen` | 4.574 | 45,12 | 76,65 | 68,30 | 67,59 |
| `val_unseen` | 8.756 | 69,79 | 64,90 | 55,98 | 55,27 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Las métricas indican una degradación esperada al pasar de escenarios vistos a no vistos, con una caída de aproximadamente 12 puntos en SR y 12,3 en SPL.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación del modelo.
- Al tratarse de un modelo de 8B parámetros en precisión FP16, se estima que la inferencia requiere al menos 16 GB de VRAM (por ejemplo, una NVIDIA RTX 4090 o A100 de 40 GB para mayor comodidad).
- Con cuantización a 4 bits (si se aplicara, aunque no está documentada), podría caber en GPUs de 8 GB, pero no hay garantía de compatibilidad con el pipeline de evaluación de SwiftVLN.
- El despliegue está pensado para el entorno de evaluación de SwiftVLN, que soporta ejecución en una o varias GPUs mediante scripts de evaluación.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

El modelo pertenece a la familia SwiftVLN-SatNav, de la que también existen variantes con backbone de 3B. La comparación más directa es con el checkpoint `Eku127/swiftvln-satnav-3b-1ep-f32s4-overlap0-pf-h8-pool-s2-noembed`, que comparte la misma configuración experimental pero con un modelo base más pequeño.

| Modelo | Backbone | Parámetros | Contexto | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- | --- |
| `swiftvln-satnav-qwen3vl-8b-...` | Qwen3-VL-8B-Instruct | 8B | 32 frames + 8 históricos | no disponible | HuggingFace |
| `swiftvln-satnav-3b-...` | Qwen3-VL-3B (presumiblemente) | 3B | 32 frames + 8 históricos | no disponible | HuggingFace |
| `Qwen/Qwen3-VL-8B-Instruct` (base) | Qwen3-VL | 8B | contexto multimodal estándar | Apache 2.0 (según Qwen) | HuggingFace |

No se dispone de resultados de benchmarks comparativos entre estas variantes en la información proporcionada. El modelo base Qwen3-VL-8B-Instruct no está diseñado para navegación, por lo que la comparación directa no es significativa fuera del contexto de SatNav.

## Limitaciones y advertencias

- El modelo no es un chatbot ni un asistente de propósito general; su uso está restringido al pipeline de evaluación de SwiftVLN y al entorno SatNav. Intentar usarlo fuera de ese contexto producirá resultados no fiables.
- No se ha publicado información sobre sesgos o alucinaciones específicas, pero al ser un modelo entrenado con trayectorias expertas de un único benchmark, puede presentar sobreajuste a las distribuciones de datos de SatNav-v0.1.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial sin consultar al autor.
- El modelo solo soporta inglés, y las instrucciones de navegación deben seguir el formato de prompt de SwiftVLN.
- La longitud de contexto está limitada a 32 fotogramas más 8 históricos; no admite secuencias más largas sin modificar la configuración.
- El rendimiento en escenarios no vistos (`val_unseen`) es significativamente inferior al de escenarios vistos, lo que indica limitaciones de generalización.
- No se proporcionan pesos cuantizados ni soporte para frameworks de inferencia estándar como vLLM u Ollama; la evaluación requiere el entorno específico de SwiftVLN.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Eku127/swiftvln-satnav-qwen3vl-8b-1ep-f32s4-overlap0-pf-h8-pool-s2-noembed)
- [Repositorio SwiftVLN (GitHub)](https://github.com/Eku127/SwiftVLN)
- [Repositorio SatNav (GitHub)](https://github.com/Eku127/SatNav)
- [Guía de evaluación de SwiftVLN](https://github.com/Eku127/SwiftVLN/blob/master/docs/zh-CN/evaluation/README.md)
- [Perfil del autor en HuggingFace](https://huggingface.co/Eku127/models)
- [Perfil del autor en GitHub](https://github.com/Eku127/)
