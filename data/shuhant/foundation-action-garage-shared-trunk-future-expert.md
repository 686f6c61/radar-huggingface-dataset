# shuhant/foundation-action-garage-shared-trunk-future-expert

## Resumen

`foundation-action-garage-shared-trunk-future-expert` es un modelo de investigación publicado por el usuario `shuhant` en Hugging Face, orientado a la conducción autónoma y a la modelización del mundo (*world model*). El nombre y las etiquetas (`foundation-action`, `world-model`, `autonomous-driving`, `garage`, `mixture-of-transformers`) sugieren una arquitectura de tipo *mixture of transformers* con un tronco compartido (*shared trunk*) y un experto dedicado a la predicción del futuro, dentro de un marco de "foundation action" para la planificación de acciones en entornos de conducción.

El modelo tiene 171.557.466 parámetros totales (aproximadamente 171,6 M) y un tamaño de repositorio de 0,7 GB, lo que lo sitúa en la categoría de modelos pequeños/medianos, aptos para experimentación en una sola GPU. Los pesos están en formato `safetensors` y la librería declarada es PyTorch.

Su relevancia es limitada fuera del ámbito de la investigación interna: el acceso está restringido (gated), la licencia es `nvidia-internal-research` y no se han publicado benchmarks, idiomas soportados ni pipeline. Se trata, por tanto, de un artefacto de investigación más que de un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of transformers con tronco compartido y experto de futuro (según etiquetas; detalles no disponibles) |
| Parámetros totales | 171.557.466 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | nvidia-internal-research (acceso restringido) |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del repositorio: `mixture-of-transformers`, `foundation-action`, `world-model`, `autonomous-driving` y `garage`. Esto apunta a un diseño con un tronco (*trunk*) compartido entre varias cabezas o expertos, uno de los cuales estaría especializado en la predicción del estado futuro del entorno (`future-expert`), patrón habitual en modelos de mundo para conducción autónoma que combinan representación del estado actual con predicción de trayectorias y acciones.

No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.). Cualquier afirmación al respecto sería especulativa y, por tanto, se omite.

## Capacidades

- Modelización de mundo para conducción autónoma: representación del estado del entorno y predicción del futuro (según las etiquetas `world-model` y `future-expert`).
- Planificación de acciones (*foundation action*): generación de acciones o trayectorias condicionadas al estado observado.
- Arquitectura modular de tipo *mixture of transformers*: posible especialización por expertos (tronco compartido más experto de futuro).
- Capacidades de generación de texto, código, matemáticas, visión, audio, tool calling o agentes: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Modo *thinking*, visión o audio: no disponibles.

## Casos de uso

- Investigación en modelos de mundo para conducción autónoma: el modelo puede emplearse como base para experimentar con predicción de estados futuros del entorno a partir de observaciones, gracias a su experto de futuro dedicado.
- Prototipado de planificadores de acción: su naturaleza de *foundation action* permite integrarlo en pipelines de investigación que mapean observaciones a acciones en simulación.
- Experimentación con arquitecturas *mixture of transformers*: el tronco compartido con expertos especializados sirve como banco de pruebas para estudiar enrutamiento y especialización.
- Evaluación comparativa de world models en entornos de garaje/simulación: el tamaño contenido (171,6 M de parámetros) permite iterar rápidamente en una sola GPU.
- Fine-tuning interno sobre datos propios de conducción: al ser un modelo pequeño, es viable ajustarlo con recursos modestos, siempre que se cumpla la licencia.
- Reproducción de experimentos académicos: útil para investigadores que necesiten una implementación de referencia de un modelo de acción con predicción de futuro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,7 GB solo para pesos (171,6 M × 4 bytes), más overhead de activaciones y contexto.
- VRAM estimada en fp16/bf16: aproximadamente 0,35 GB para pesos.
- VRAM estimada en int8: aproximadamente 0,18 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente por capacidad de memoria; para entrenamiento o fine-tuning se recomienda al menos 8-16 GB de VRAM.
- Cabe en GPU consumer: sí, con amplio margen.
- Opciones de despliegue: PyTorch nativo; compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada y probablemente no sea directa al no ser un modelo de lenguaje estándar.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (world models para conducción autónoma con arquitectura *mixture of transformers* y licencia de investigación interna).

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face para descargar los pesos.
- Licencia `nvidia-internal-research`: el uso comercial está presumiblemente prohibido o severamente restringido; debe revisarse el texto completo de la licencia antes de cualquier uso.
- Ausencia total de documentación sobre datos de entrenamiento, sesgos, idiomas y evaluación: no es posible garantizar un comportamiento fiable fuera del entorno para el que fue diseñado.
- Riesgo de alucinación y de predicciones no calibradas en escenarios de conducción no vistos durante el entrenamiento.
- No hay información sobre el contexto máximo soportado, lo que impide planificar despliegues con secuencias largas.
- Modelo de investigación sin pipeline declarado: no está pensado para producción ni para uso directo como servicio.
- Sin benchmarks publicados: no se puede comparar su rendimiento con alternativas de forma objetiva.

## Enlaces

- Hugging Face: https://huggingface.co/shuhant/foundation-action-garage-shared-trunk-future-expert
