# AdaptiveChunking/jitter_s1

## Resumen

jitter_s1 es un checkpoint de investigación publicado por el colectivo AdaptiveChunking dentro de su línea de experimentos sobre segmentación dinámica de texto (dynamic chunking). El modelo forma parte del proyecto beetle-hnet, un marco de trabajo para tokenización a nivel de byte basado en arquitecturas H-Net, y se ha entrenado con el denominado "legacy trainer" del repositorio, correspondiente al script `legacy/tier1/train.py`. Se trata, por tanto, de un artefacto de experimentación más que de un modelo listo para producción.

El modelo tiene 22.516.992 parámetros (aproximadamente 22,5 millones) y se distribuye en formato safetensors con pesos en PyTorch. El repositorio ocupa unos 0,1 GB e incluye una rama `main` con los pesos más recientes, `final.json` y `log.jsonl`, además de una rama `step-N` con un único checkpoint retenido en el paso 6000. La model card indica que el entrenador original no conservó estado del optimizador, por lo que no se incluye el directorio `training_state/`.

Su relevancia es acotada pero específica: sirve como referencia reproducible para estudiar estrategias de chunking adaptativo y tokenización byte-level en arquitecturas H-Net, y se acompaña de sondas de frontera sobre FLORES+ publicadas en el dataset `AdaptiveChunking/hnet-chunking-probes`. No dispone de pipeline declarado, idiomas documentados ni resultados de benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (beetle-hnet), tokenización byte-level con dynamic chunking |
| Parametros totales | 22.516.992 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) |
| Libreria | pytorch |
| Tamano del repositorio | 0,1 GB |
| Checkpoints retenidos | 1 (paso 6000) en rama `step-N` |
| Estado del optimizador | no incluido (el legacy trainer no lo conservaba) |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe jitter_s1 como una ejecución byte-level de H-Net procedente del repositorio beetle-hnet, entrenada con el entrenador legacy (`legacy/tier1/train.py`). La etiqueta `dynamic-chunking` junto con `tokenization` y `byte-level` sugiere que el modelo opera directamente sobre bytes y aprende a agruparlos en unidades (chunks) de forma adaptativa, en lugar de depender de un vocabulario BPE predefinido. No se proporcionan detalles sobre el número de capas, dimensión oculta, mecanismo de atención ni sobre la composición o el volumen del corpus de entrenamiento.

El repositorio incluye un mapa `tied_weights` en `config.json` que indica qué pesos deben restaurarse mediante `sd[dst] = sd[src]`, un detalle relevante para cargar correctamente el checkpoint. No se documenta el uso de RLHF, DPO ni ninguna otra fase de alineación. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal más allá de la propia propuesta de chunking dinámico.

## Capacidades

- Modelado de lenguaje a nivel de byte con segmentación dinámica en chunks, orientado a experimentación sobre tokenización.
- Entrenamiento sobre arquitectura H-Net según el repositorio beetle-hnet.
- Checkpoint intermedio (paso 6000) útil para analizar la evolución del aprendizaje y las fronteras de chunking.
- Sondas de frontera sobre FLORES+ disponibles en el dataset asociado, lo que permite evaluar el comportamiento de segmentación.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre tokenización byte-level: el modelo permite reproducir y analizar cómo una H-Net agrupa bytes en chunks, usando el checkpoint del paso 6000 como referencia intermedia.
- Estudio de segmentación multilingüe: las sondas de frontera sobre FLORES+ en `AdaptiveChunking/hnet-chunking-probes` permiten comparar las fronteras de chunk aprendidas con las segmentaciones de referencia en distintos idiomas.
- Reproducibilidad de experimentos: al incluir `config.json`, `final.json` y `log.jsonl`, el repositorio facilita la réplica de la curva de entrenamiento y la verificación de resultados del legacy trainer.
- Base para ablaciones: con 22,5 M de parámetros, el modelo es lo bastante pequeño para entrenar y evaluar variantes de chunking en hardware modesto.
- Docencia y formación: sirve como ejemplo didáctico de arquitectura H-Net y de flujo de trabajo con safetensors y pesos atados.
- Integración en pipelines de investigación: puede cargarse en PyTorch para experimentar con la restauración de pesos atados y el análisis de representaciones internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,5 M de parámetros en fp32, los pesos ocupan aproximadamente 90 MB; en fp16, unos 45 MB. La VRAM adicional depende de la longitud de secuencia y del tamaño del lote, no documentados.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre debería ser suficiente para inferencia en fp32; no se especifican requisitos oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (GTX 1060 en adelante), aunque no se ha verificado oficialmente.
- Opciones de despliegue: PyTorch nativo con `safetensors`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (H-Net byte-level con dynamic chunking) en la documentación proporcionada. Se indica "no disponible".

## Limitaciones y advertencias

- Modelo de investigación sin pipeline declarado ni idiomas documentados; no está pensado para uso en producción.
- Sin resultados de benchmarks publicados, por lo que no es posible evaluar su calidad frente a alternativas.
- El entrenador legacy no conservó estado del optimizador, lo que impide reanudar el entrenamiento desde el checkpoint tal cual.
- La restauración de pesos requiere aplicar el mapa `tied_weights` de `config.json`; una carga ingenua puede producir pesos incorrectos.
- No se documentan sesgos conocidos, riesgo de alucinación ni comportamiento multilingüe; deben asumirse los riesgos habituales de un modelo pequeño sin alineación.
- Licencia Apache 2.0: permite uso comercial y modificación, pero sin garantías del autor.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/jitter_s1
- Repositorio de código beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Repositorio bundle original: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Dataset de sondas de frontera: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
