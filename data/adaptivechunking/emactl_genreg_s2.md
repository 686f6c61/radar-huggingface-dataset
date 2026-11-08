# AdaptiveChunking/emactl_genreg_s2

## Resumen

`emactl_genreg_s2` es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de un H-Net de nivel de byte ("byte-level H-Net") entrenado con el repositorio [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet) mediante su entrenador legacy (`legacy/tier1/train.py`). El modelo fue separado del repositorio empaquetado `AdaptiveChunking/hnet-chunking-pilots` y reorganizado en el formato por ejecución de Beetle.

Con 22.516.992 parámetros (aproximadamente 22,5 millones), se sitúa en la categoría de modelos pequeños orientados a experimentación en tokenización dinámica y procesamiento a nivel de byte, no a uso generalista. Su relevancia es fundamentalmente investigadora: sirve como artefacto reproducible para estudiar estrategias de chunking adaptativo y fronteras de tokenización, con sondas de evaluación publicadas en el dataset `AdaptiveChunking/hnet-chunking-probes`.

No dispone de pipeline declarado, idiomas documentados ni resultados de benchmarks. El repositorio ocupa 0,1 GB y contiene un único checkpoint retenido (paso 6000) en la rama `step-6000`, además de los pesos más recientes, `final.json` y `log.jsonl` en `main`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net de nivel de byte (byte-level H-Net) |
| Parametros totales | 22.516.992 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pytorch) |

## Arquitectura y entrenamiento

El modelo es un H-Net que opera a nivel de byte, es decir, sin un tokenizador subword convencional: procesa la secuencia de bytes directamente y aplica mecanismos de chunking dinámico. Esta familia de arquitecturas busca aprender segmentaciones internas de la entrada en lugar de depender de una tokenización fija predefinida. El autor etiqueta el modelo con `dynamic-chunking`, `tokenization`, `hnet`, `byte-level` y `beetle-hnet`, lo que confirma el enfoque.

El entrenamiento se realizó con el entrenador legacy de beetle-hnet (`legacy/tier1/train.py`). Este entrenador no conservaba estado del optimizador, por lo que el repositorio no incluye directorio `training_state/`. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. El checkpoint retenido corresponde al paso 6000. El `config.json` de cada checkpoint incluye `model_config`, la configuración de entrenamiento y el mapa `tied_weights`, que debe aplicarse restaurando `sd[dst] = sd[src]` para cada entrada al cargar los pesos.

## Capacidades

- Generación y procesamiento de texto a nivel de byte, sin tokenizador subword externo.
- Chunking dinámico: la arquitectura aprende segmentaciones internas de la secuencia de entrada.
- Evaluación de fronteras de tokenización mediante las sondas FLORES+ publicadas en `AdaptiveChunking/hnet-chunking-probes` (subcarpeta `emactl_genreg_s2/`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; las sondas FLORES+ sugieren evaluación sobre textos multilingües, pero no se especifica el alcance.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en tokenización adaptativa: el modelo permite comparar segmentaciones aprendidas frente a tokenizadores BPE o SentencePiece sobre el mismo corpus, usando las sondas FLORES+ publicadas para medir el comportamiento en fronteras de palabra y de frase.
- Reproducción de experimentos de H-Net: al conservarse el checkpoint del paso 6000, `final.json` y `log.jsonl`, un investigador puede reproducir la curva de entrenamiento y contrastar resultados con otras ejecuciones de la misma organización.
- Estudio de modelos byte-level de bajo coste: con 22,5 millones de parámetros, cabe en cualquier GPU consumer y permite iterar rápidamente sobre hipótesis de arquitectura sin grandes presupuestos de cómputo.
- Base para experimentos de compresión y cuantización: al ser un modelo pequeño en safetensors, sirve como banco de pruebas para medir el impacto de distintas cuantizaciones en tareas de segmentación.
- Evaluación de robustez ante ruido a nivel de byte: al no depender de un vocabulario subword, es adecuado para estudiar cómo afectan erratas, unicode o secuencias fuera de vocabulario al procesamiento.
- Docencia y formación: su tamaño reducido y su licencia Apache 2.0 lo hacen útil para explicar arquitecturas de chunking dinámico en cursos o talleres con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,5 M de parámetros, unos 90 MB de pesos) y alrededor de 45 MB en fp16; el resto del consumo depende de la longitud de secuencia y del estado interno del H-Net, no documentado.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier tarjeta con al menos 2 GB de VRAM (GTX 1050, RTX 3050, RTX 4090, etc.), e incluso en CPU para secuencias cortas.
- Opciones de despliegue: al ser un modelo PyTorch con pesos safetensors y sin pipeline declarado, la carga requiere el código de beetle-hnet y la restauración de los pesos atados según el mapa `tied_weights`. No hay constancia de soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma familia (H-Net byte-level con chunking dinámico) ni de resultados de benchmarks que permitan una comparación cuantitativa. La organización AdaptiveChunking mantiene otras ejecuciones en su perfil de Hugging Face, pero no se detallan en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| emactl_genreg_s2 | 22,5 M | no disponible | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de investigación sin pipeline declarado: no está pensado para uso en producción ni para tareas generativas generales.
- Sin benchmarks publicados: no es posible evaluar su calidad frente a alternativas con datos objetivos.
- Idiomas no documentados: se desconoce la cobertura lingüística real pese a las sondas FLORES+.
- Sesgos conocidos: no documentados; al ser un modelo byte-level entrenado con un corpus no especificado, pueden aparecer sesgos derivados de los datos de entrenamiento.
- Riesgo de alucinación: no evaluado; no se recomienda su uso en aplicaciones donde la fidelidad factual sea crítica.
- Limitaciones de contexto: la longitud máxima de contexto no está documentada, lo que impide planificar despliegues con secuencias largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre el dataset de entrenamiento impide verificar la procedencia de los datos.
- Caveat de producción: el entrenador legacy no conservó estado del optimizador, por lo que no es posible reanudar el entrenamiento desde el checkpoint sin reinicializar el estado; además, la carga de pesos requiere aplicar el mapa `tied_weights` manualmente.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/emactl_genreg_s2
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/models
- Repositorio empaquetado de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
