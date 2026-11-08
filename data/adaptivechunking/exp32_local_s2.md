# AdaptiveChunking/exp32_local_s2

## Resumen

`exp32_local_s2` es un modelo de investigación publicado por el usuario AdaptiveChunking en Hugging Face. Se trata de un run de entrenamiento de una arquitectura H-Net de nivel de byte (byte-level), ejecutado con el framework `beetle-hnet` y su entrenador legacy (`legacy/tier1/train.py`). El modelo se separó del repositorio empaquetado `AdaptiveChunking/hnet-chunking-spec-82m` y se reorganizó en el formato de una ejecución por carpeta que usa Beetle. No es un modelo conversacional ni un LLM de propósito general: es un artefacto de experimentación centrado en el estudio de estrategias de chunking dinámico y tokenización byte-level.

El modelo cuenta con 82.470.528 parámetros (dato real obtenido de los pesos en safetensors) y un tamaño de repositorio de 6,9 GB, lo que refleja que el espacio lo ocupan principalmente los 21 checkpoints retenidos y los ficheros auxiliares, no un único conjunto de pesos. La información disponible no especifica longitud de contexto, idiomas soportados ni capacidades generativas estándar, y la model card no incluye resultados de benchmarks. Su relevancia es, por tanto, académica y experimental: sirve como base reproducible para investigar tokenización dinámica y segmentación por chunks.

La licencia es Apache 2.0, lo que permite uso comercial y modificación, aunque la ausencia de documentación sobre rendimiento, sesgos y comportamiento en producción limita seriamente su uso fuera de entornos de investigación. La fecha de creación indicada en el repositorio es 2026-11-08, con una actualización dos minutos posterior, lo que sugiere una publicación automatizada o de sincronización de artefactos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net byte-level (chunking dinámico), según tags `hnet`, `byte-level`, `beetle-hnet`; detalles internos no disponibles |
| Parametros totales | 82.470.528 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `config.json` por checkpoint) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia H-Net, una línea de arquitecturas orientada al procesamiento byte-level con chunking dinámico. Según los tags del repositorio, se entrenó con el framework `beetle-hnet` y el entrenador legacy `legacy/tier1/train.py`. El repositorio conserva 21 checkpoints en ramas `step-N` (pasos 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 1000, 2000, entre otros), cada uno con `model.safetensors` y `config.json`, que incluye la configuración del modelo, la configuración de entrenamiento y el mapa `tied_weights` (los pesos atados deben restaurarse aplicando `sd[dst] = sd[src]` para cada entrada). La rama `main` contiene los pesos más recientes, `final.json` y `log.jsonl`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. El entrenador legacy no conservó estado del optimizador, por lo que no existe carpeta `training_state/` en el repositorio. Se mencionan sondas de frontera FLORES+ para esta ejecución en el dataset `AdaptiveChunking/hnet-chunking-probes`, bajo la ruta `exp32_local_s2/`, lo que sugiere que el entrenamiento o la evaluación se orientó a la segmentación de texto multilingüe, aunque no se aportan métricas ni resultados.

## Capacidades

- Procesamiento de texto a nivel de byte, sin tokenizador subword convencional, según la etiqueta `byte-level`.
- Chunking dinámico: la arquitectura está diseñada para segmentar o agrupar secuencias de forma adaptativa, según las etiquetas `dynamic-chunking` y `hnet`.
- Checkpoints intermedios reproducibles: 21 estados de entrenamiento retenidos, útiles para estudiar la evolución del aprendizaje.
- Pesos atados documentados mediante el mapa `tied_weights`, lo que facilita la restauración correcta del modelo.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni modo thinking.
- Soporte multilingüe: no disponible; las sondas FLORES+ sugieren evaluación multilingüe, pero no se confirma el conjunto de idiomas soportados.

## Casos de uso

- Investigación en tokenización byte-level: el modelo sirve como punto de partida para experimentar con representaciones a nivel de byte y comparar frente a tokenizadores BPE o SentencePiece en tareas controladas.
- Estudio de chunking dinámico: permite analizar cómo distintas estrategias de segmentación afectan al aprendizaje, gracias a los 21 checkpoints intermedios que muestran la evolución del entrenamiento.
- Reproducción de experimentos: el repositorio incluye configuración de entrenamiento y mapa de pesos atados, lo que facilita replicar la ejecución con el framework `beetle-hnet`.
- Evaluación de sondas de frontera multilingüe: las sondas FLORES+ publicadas en `hnet-chunking-probes` permiten medir la calidad de la segmentación en distintos idiomas.
- Desarrollo de pipelines de preprocesado: la arquitectura puede integrarse como componente experimental de segmentación en sistemas de procesamiento de texto que requieran chunking adaptativo.
- Formación y docencia: útil como ejemplo práctico de organización de artefactos de entrenamiento (ramas `step-N`, `final.json`, `log.jsonl`) y de gestión de pesos atados.
- No se recomienda su uso en aplicaciones de producción orientadas a usuario final, dado que no hay documentación de rendimiento, licencia de uso práctico validada ni benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 82,47 M de parámetros, los pesos en precisión completa (fp32) ocuparían aproximadamente 330 MB; en fp16, unos 165 MB; en int8, unos 82 MB. Estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados.
- GPU recomendadas: no disponibles. Por tamaño, cualquier GPU consumer con al menos 2-4 GB de VRAM podría alojar los pesos, pero se desconoce si la arquitectura H-Net requiere memoria adicional para estructuras de chunking.
- Cabe en GPU consumer: probablemente sí, en modelos como GTX 1650, RTX 3050, RTX 4060 o superiores, siempre que la implementación de `beetle-hnet` sea compatible; no confirmado por el autor.
- Opciones de despliegue: el repositorio usa PyTorch y safetensors; no se han publicado variantes GGUF, ni integración con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AdaptiveChunking/exp32_local_s2 | 82,47 M | no disponible | Apache 2.0 | Hugging Face, PyTorch/safetensors | Run experimental de H-Net byte-level con 21 checkpoints |
| AdaptiveChunking/hnet-chunking-spec-82m | 82 M (según nombre) | no disponible | no disponible | Hugging Face | Repositorio empaquetado del que se separó este run |
| Modelos byte-level comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de información de alternativas equivalentes en la búsqueda realizada |

## Limitaciones y advertencias

- No es un modelo conversacional ni un LLM de propósito general: carece de documentación sobre generación de texto, instrucciones o alineación.
- No se han publicado benchmarks, métricas de calidad ni evaluaciones de rendimiento.
- Se desconoce la longitud de contexto y el comportamiento con secuencias largas.
- No se especifican los idiomas soportados; las sondas FLORES+ no implican cobertura multilingüe completa.
- Riesgo de alucinación y sesgos: no evaluado ni documentado.
- El entrenador legacy no conservó estado del optimizador, lo que impide reanudar el entrenamiento desde los checkpoints publicados.
- El repositorio ocupa 6,9 GB debido a los múltiples checkpoints; la descarga completa puede ser costosa para experimentos puntuales.
- Aunque la licencia Apache 2.0 permite uso comercial, la falta de documentación técnica y de garantías hace desaconsejable su uso en producción.
- La fecha de creación del repositorio (2026-11-08) y la ausencia de descargas o likes indican que se trata de un artefacto reciente y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/exp32_local_s2
- Repositorio empaquetado de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Framework beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Calculadora de requisitos de hardware (referencia general): https://modelfit.io/calculator/
