# AdaptiveChunking/emactl_noema_s2

## Resumen

`emactl_noema_s2` es un checkpoint de investigación publicado por el usuario AdaptiveChunking en Hugging Face. No es un modelo de lenguaje conversacional al uso, sino una ejecución concreta (*run*) de un H-Net a nivel de byte entrenado con el repositorio [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet) mediante el llamado *legacy trainer* (`legacy/tier1/train.py`). El modelo se ha separado del repositorio empaquetado `AdaptiveChunking/hnet-chunking-pilots` y se ha reorganizado en el formato por ejecución de Beetle.

Con 22.516.992 parámetros y un tamaño de repositorio de 0,1 GB, se trata de un modelo muy pequeño orientado a experimentación con segmentación dinámica (*dynamic chunking*) y tokenización a nivel de byte. La model card no documenta arquitectura detallada, datos de entrenamiento, idiomas ni resultados de evaluación; la información disponible se limita a los metadatos del repositorio, la configuración de pesos y las referencias a los *probes* de frontera sobre FLORES+.

Su relevancia es, por tanto, limitada al ámbito de la investigación en tokenización y chunking adaptativo. No hay evidencia publicada de que sea adecuado para producción ni de que soporte tareas generativas estándar. La licencia Apache 2.0 permite uso comercial y modificación, pero la ausencia de documentación técnica y de benchmarks desaconseja cualquier despliegue sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net a nivel de byte (byte-level H-Net), según la model card; sin detalles de capas ni atención disponibles |
| Parametros totales | 22.516.992 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con `config.json` y mapa `tied_weights` |

## Arquitectura y entrenamiento

La model card identifica el modelo como un H-Net a nivel de byte entrenado con el *legacy trainer* de beetle-hnet (`legacy/tier1/train.py`). No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni el esquema de chunking dinámico más allá de las etiquetas del repositorio (`dynamic-chunking`, `hnet`, `byte-level`, `beetle-hnet`). El repositorio incluye una rama `step-N` con un único checkpoint retenido (paso 6000), que contiene `model.safetensors` y `config.json` con la configuración del modelo, la configuración de entrenamiento y el mapa `tied_weights` (la restauración se hace con `sd[dst] = sd[src]` para cada entrada).

La rama `main` contiene los pesos más recientes, además de `final.json` y `log.jsonl`. El entrenador legacy no conservó estado del optimizador, por lo que no existe directorio `training_state/`. No se documentan el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Tampoco se describe ninguna innovación técnica más allá del propio enfoque de chunking dinámico a nivel de byte que da nombre al proyecto.

## Capacidades

- Entrenamiento y publicación de un H-Net a nivel de byte para experimentación con segmentación dinámica; no se documentan capacidades generativas concretas.
- No hay información sobre generación de texto, razonamiento, código, matemáticas o visión.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingües; los *probes* de frontera sobre FLORES+ se publican como dataset aparte, pero no se indica qué idiomas cubren ni con qué resultados.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Investigación en tokenización a nivel de byte: el modelo sirve como punto de partida para reproducir o extender los experimentos de chunking dinámico del proyecto beetle-hnet, cargando el checkpoint del paso 6000 y el `config.json` asociado.
- Estudio de segmentación dinámica: los *probes* de frontera sobre FLORES+ publicados en `AdaptiveChunking/hnet-chunking-probes` (subcarpeta `emactl_noema_s2/`) permiten analizar cómo el modelo delimita unidades lingüísticas y comparar con otras ejecuciones del mismo repositorio.
- Reproducción de experimentos con el *legacy trainer*: al conservarse `final.json` y `log.jsonl` en la rama `main`, es posible auditar la curva de entrenamiento y reentrenar con la misma configuración.
- Comparación entre ejecuciones: al estar separado del repositorio empaquetado `hnet-chunking-pilots` en el formato por ejecución de Beetle, facilita la comparación controlada entre distintos *runs* del mismo proyecto.
- Docencia y formación: por su tamaño reducido (22,5 M de parámetros) y su licencia permisiva, puede usarse como ejemplo didáctico de entrenamiento de modelos a nivel de byte.
- Base para experimentos propios: la licencia Apache 2.0 permite modificar los pesos y la configuración para probar variantes de chunking sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,5 M de parámetros en precisión de 32 bits, los pesos ocupan aproximadamente 90 MB; en 16 bits, unos 45 MB. La VRAM total depende del tamaño de lote, la longitud de secuencia y las activaciones, que no se documentan.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre debería bastar para inferencia en fp32; no se dispone de datos de referencia del autor.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (GTX 1050 o superior, RTX 20xx/30xx/40xx) por el reducido tamaño del modelo.
- Opciones de despliegue: al publicarse solo en safetensors y con `library_name: pytorch`, el despliegue requiere cargar los pesos con PyTorch y restaurar los pesos atados según el mapa `tied_weights`. No se proporcionan builds GGUF, ni integración con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `AdaptiveChunking/emactl_noema_s2` | 22,5 M | no disponible | Apache 2.0 | safetensors en HF | H-Net byte-level, sin benchmarks |
| `AdaptiveChunking/hnet-chunking-pilots` | no disponible | no disponible | no disponible | safetensors en HF | Repositorio empaquetado del que se separó esta ejecución |
| Modelos Noema (Qwen3.5-2B/4B post-entrenados) | 2-4 B | no disponible | no disponible | HF con builds GGUF | Familia distinta, orientada a lenguaje; no comparable en tamaño ni propósito |

No se conocen modelos directamente comparables en la misma categoría (H-Net a nivel de byte de ~22 M de parámetros) dentro de la información disponible.

## Limitaciones y advertencias

- Ausencia total de documentación sobre datos de entrenamiento, arquitectura interna y evaluación: no es posible caracterizar el comportamiento del modelo sin experimentación propia.
- No hay benchmarks ni métricas publicadas; no se puede afirmar qué tareas resuelve ni con qué calidad.
- El entrenador legacy no conservó estado del optimizador, lo que impide reanudar el entrenamiento exactamente desde el checkpoint.
- Riesgo de alucinación y sesgos: no evaluados ni documentados; al ser un modelo a nivel de byte sin fase de alineamiento conocida, no hay garantías de comportamiento seguro.
- Idiomas soportados: no disponibles; los *probes* sobre FLORES+ no vienen acompañados de resultados en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la falta de documentación y de evaluación hace desaconsejable su uso en producción.
- El repositorio tiene 0 descargas y 0 *likes*, y fue creado y actualizado el mismo día (2026-11-08), lo que sugiere que no ha pasado por revisión de la comunidad.
- No se ofrecen builds cuantizados ni formatos alternativos, lo que limita su integración en pipelines de inferencia estándar.

## Enlaces

- Hugging Face: https://huggingface.co/AdaptiveChunking/emactl_noema_s2
- Repositorio empaquetado de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Dataset de *probes* de frontera: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Documentación de modelos Noema (referencia de la búsqueda web): https://noemaai.com/docs/models
- Catálogo de modelos Noema (referencia de la búsqueda web): https://noemaai.com/models
