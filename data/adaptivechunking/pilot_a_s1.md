# AdaptiveChunking/pilot_A_s1

## Resumen

pilot_A_s1 es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución de entrenamiento (run) de un modelo byte-level basado en la arquitectura H-Net, generada con el repositorio de código abierto beetle-hnet y su entrenador legacy (`legacy/tier1/train.py`). El modelo fue extraído del repositorio agrupado `AdaptiveChunking/hnet-chunking-pilots` y reorganizado en el formato por ejecución de Beetle. No es un modelo de propósito general ni un asistente conversacional: es un artefacto de experimentación orientado al estudio de estrategias de chunking dinámico y tokenización a nivel de byte.

Con 22.516.992 parámetros totales (aproximadamente 22,5 millones), el modelo es muy pequeño en comparación con los LLM actuales. El repositorio ocupa 0,1 GB e incluye pesos en formato safetensors, un `config.json` con la configuración del modelo y del entrenamiento, y un mapa de pesos atados (`tied_weights`) que debe restaurarse aplicando `sd[dst] = sd[src]` para cada entrada. La rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`, mientras que las ramas `step-N` conservan checkpoints intermedios (en esta ejecución, uno en el paso 6000).

Su relevancia es fundamentalmente metodológica: sirve como referencia reproducible para investigar cómo afectan las decisiones de chunking al entrenamiento de modelos byte-level, y se acompaña de sondas de frontera sobre FLORES+ publicadas en el dataset `AdaptiveChunking/hnet-chunking-probes`. No dispone de pipeline declarado, idiomas documentados ni resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net byte-level (según tags del autor; detalles no disponibles) |
| Parametros totales | 22.516.992 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` |

## Arquitectura y entrenamiento

El modelo se describe como una ejecución byte-level de H-Net, entrenada con el entrenador legacy del proyecto beetle-hnet (`legacy/tier1/train.py`). La información disponible no detalla la composición interna de la arquitectura H-Net (número de capas, dimensiones ocultas, mecanismo de atención o de agregación de chunks), por lo que estos datos deben considerarse no disponibles. Los tags del repositorio apuntan a un enfoque de tokenización a nivel de byte combinado con chunking dinámico, lo que sugiere que el modelo opera directamente sobre secuencias de bytes y agrupa dinámicamente segmentos de entrada en lugar de depender de un vocabulario de subpalabras fijo.

El entrenamiento se realizó con el entrenador legacy, que según la model card no conservaba estado del optimizador; por ese motivo el repositorio no incluye un directorio `training_state/`. Se conserva un único checkpoint retenido en el paso 6000, además de los pesos finales en `main`. No se documentan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otras técnicas de alineación. Tampoco se describen innovaciones como decodificación especulativa o atención lineal más allá de la propia propuesta de chunking dinámico que da nombre a la organización.

## Capacidades

- Generación y modelado de texto a nivel de byte: el modelo procesa secuencias de bytes, lo que en principio elimina la dependencia de un vocabulario de subpalabras concreto.
- Chunking dinámico: el diseño experimental está orientado a evaluar estrategias de agrupación dinámica de segmentos durante el procesamiento.
- Investigación de tokenización: sirve como banco de pruebas para comparar tokenización byte-level frente a esquemas basados en BPE u otros.
- Sondas de frontera: se acompaña de pruebas de frontera sobre FLORES+ que permiten analizar el comportamiento del modelo en límites de segmento.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; las sondas FLORES+ sugieren evaluación multilingüe, pero no se especifican idiomas soportados.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre tokenización byte-level: el modelo se puede usar como referencia reproducible para medir cómo afecta operar sobre bytes en lugar de subpalabras a métricas de compresión, perplejidad o calidad de generación en corpus controlados.
- Estudio de chunking dinámico: permite experimentar con distintas políticas de agrupación de segmentos y comparar su efecto en el entrenamiento y la inferencia, gracias a que el checkpoint y el código del entrenador están disponibles.
- Reproducción de experimentos académicos: al conservar el checkpoint del paso 6000, el `log.jsonl` y el `final.json`, facilita la replicación de curvas de entrenamiento y la verificación de resultados por parte de terceros.
- Evaluación de fronteras de segmento con FLORES+: las sondas publicadas en `hnet-chunking-probes` permiten analizar el comportamiento del modelo en los límites entre chunks en un corpus multilingüe de referencia.
- Docencia y formación: por su tamaño reducido (22,5 M de parámetros) y su licencia permisiva, es adecuado para laboratorios prácticos sobre arquitecturas byte-level y entrenamiento de modelos pequeños.
- Base para ablaciones: sirve como punto de partida para comparar variantes de arquitectura H-Net o de entrenador (legacy frente a versiones más recientes) manteniendo constante el resto de factores.
- Integración en pipelines de investigación: los pesos en safetensors y el `config.json` con el mapa de pesos atados permiten cargar el modelo en PyTorch para experimentos personalizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,5 M de parámetros, los pesos en precisión completa (fp32) ocupan aproximadamente 90 MB; en fp16, unos 45 MB. La VRAM adicional depende de la longitud de secuencia y del tamaño de lote, que no se documentan.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente para inferencia en fp32; no se requieren aceleradores de datacenter como A100 o H100.
- GPU de consumo: cabe holgadamente en tarjetas de consumo modernas (por ejemplo, RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: al ser un modelo PyTorch con pesos safetensors, la carga se realiza mediante PyTorch. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y es poco probable que existan conversiones GGUF publicadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (byte-level con chunking dinámico) en la información proporcionada. Como referencia de orden de magnitud, se incluyen modelos pequeños de propósito general, aunque la comparación no es directa por diferencias de arquitectura y objetivos:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pilot_A_s1 | 22,5 M | no disponible | Apache 2.0 | Hugging Face (repo de investigación) |
| Alternativas byte-level comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de investigación: no es un asistente conversacional ni un modelo de propósito general; no se documentan capacidades de instrucción, diálogo o tool calling.
- Sin benchmarks publicados: no hay métricas de calidad, razonamiento, código o matemáticas que permitan evaluar su rendimiento frente a alternativas.
- Idiomas no documentados: aunque existen sondas FLORES+, no se especifica qué idiomas cubre ni con qué calidad.
- Contexto desconocido: no se indica la longitud máxima de secuencia soportada, lo que limita la planificación de despliegues.
- Riesgo de alucinación: no evaluado; al ser un modelo pequeño y sin alineación documentada, cabe esperar generación incoherente fuera de dominios de entrenamiento.
- Sesgos: no documentados; la composición del dataset de entrenamiento no se detalla, por lo que no es posible caracterizar sesgos.
- Restauración de pesos atados: es imprescindible aplicar el mapa `tied_weights` (`sd[dst] = sd[src]`) al cargar los pesos; omitirlo puede producir un modelo incorrecto.
- Ausencia de estado del optimizador: no se puede reanudar el entrenamiento exactamente desde el checkpoint, solo reutilizar los pesos.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un artefacto experimental sin garantías de calidad, no se recomienda su uso en producción sin una evaluación exhaustiva previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/pilot_A_s1
- Repositorio agrupado de pilots: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Dataset de sondas: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Repositorio de código beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/models
