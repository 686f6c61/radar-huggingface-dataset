# Rin247/gemma-4-12B-it-Uncensored-Aquarion-FP4

## Resumen

Este modelo es una cuantización FP4 (weight-only) del modelo `gemma-4-12B-it` de Google, publicada por el usuario Rin247 en Hugging Face. La particularidad principal es que ha sido sometido a un proceso de "abliteration" (eliminación de la dirección de rechazo) mediante proyección ortogonal, lo que elimina los filtros de seguridad y restricciones del modelo original. El resultado es una versión "sin censura" orientada a usuarios que requieren generación de texto sin las limitaciones habituales de alineación.

A pesar de que el nombre indica "12B", los pesos reales del archivo safetensors contienen 6.509.756.464 parámetros (aproximadamente 6,5 mil millones), lo que sugiere una discrepancia entre la nomenclatura y el contenido real. El repositorio tiene un tamaño de 8,3 GB, coherente con una cuantización a 4 bits de un modelo de esa magnitud. La cuantización se realizó mediante el método RTN (Round to Nearest) en CPU, y los pesos se almacenan en formato safetensors con buffers de escala y forma para su reconstrucción.

Este tipo de modelos "uncensored" genera un debate importante sobre seguridad y uso responsable. Aunque puede resultar atractivo para ciertos casos de investigación o desarrollo creativo, eliminar las salvaguardas implica riesgos significativos de contenido inapropiado, sesgos y alucinaciones. No se dispone de información sobre licencia, idiomas soportados ni arquitectura detallada en la model card proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en `gemma-4-12B-it` de Google) |
| Parametros totales | 6.509.756.464 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP4 (weight-only, 4 bits) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (con buffers de escala y forma) |

## Arquitectura y entrenamiento

La informacion disponible indica que este modelo es una cuantizacion del checkpoint `gemma-4-12B-it`, un modelo de lenguaje de Google ajustado para instrucciones. El proceso de "abliteration" se realizo mediante proyeccion ortogonal de la direccion de rechazo antes de la cuantizacion, segun describe el autor. La cuantizacion se llevo a cabo con PyTorch RTN en CPU, almacenando las escalas junto a los pesos en archivos safetensors. No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se emplearon tecnicas como RLHF o DPO.

Dado que el modelo base es de Google, es probable que herede la arquitectura de los modelos Gemma 4 (posiblemente multimodal), pero no se especifica en la documentacion disponible. Tampoco se indica si el proceso de abliteration afecto a otras capacidades del modelo.

## Capacidades

- No se han documentado capacidades especificas en la model card del autor.
- Al ser una version de `gemma-4-12B-it`, se espera que conserve capacidades de generacion de texto y seguimiento de instrucciones del modelo base, aunque no se confirma.
- No se menciona soporte para tool calling, agentes, razonamiento multi-paso, ni capacidades multimodales.
- La unica caracteristica destacada es la eliminacion de filtros de seguridad (uncensored), lo que implica que el modelo puede generar contenido que el modelo original rechazaria.

## Casos de uso

No se han documentado casos de uso especificos para este modelo. Sin embargo, dada su naturaleza "uncensored", podria emplearse en entornos de investigacion sobre alineacion y seguridad de modelos, o en aplicaciones donde se requiera explorar respuestas sin restricciones. No obstante, no se recomienda su uso en produccion sin una evaluacion exhaustiva de riesgos, debido a la ausencia de salvaguardas y a la falta de informacion sobre su comportamiento real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar.

## Requisitos de hardware

- Con 6.509.756.464 parametros en cuantizacion FP4 (4 bits), el tamaño del modelo en memoria es aproximadamente 3,3 GB (6,5e9 * 0,5 bytes), mas overhead de escalas y buffers.
- Se estima que puede ejecutarse en GPUs con al menos 6 GB de VRAM, como una NVIDIA RTX 3060 o superior.
- Para una inferencia comoda con contexto largo, se recomienda una GPU con 8 GB o mas de VRAM (RTX 3070, RTX 4060 Ti, etc.).
- No se especifican opciones de despliegue. Al ser un formato safetensors con cuantizacion custom, es posible que requiera adaptaciones para funcionar con vLLM, llama.cpp u otros motores de inferencia. Se necesitaria dequantizar los pesos antes de usarlos en la mayoria de los frameworks.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con otros modelos. Existen otras versiones abliterated de `gemma-4-12B-it` en Hugging Face (por ejemplo, `OpenYourMind/gemma-4-12B-it-abliterated-uncensored`), pero no se conocen sus especificaciones tecnicas ni su rendimiento. El modelo base `google/gemma-4-12B` es la referencia original, pero no se han proporcionado datos comparativos.

## Limitaciones y advertencias

- **Contenido sin filtrar**: al estar "abliterated", el modelo puede generar contenido ofensivo, ilegal, sesgado o peligroso sin restricciones. Esto supone un riesgo significativo para cualquier uso en produccion o publico.
- **Sesgos**: al eliminar las salvaguardas, es probable que se amplifiquen sesgos presentes en los datos de entrenamiento originales.
- **Alucinaciones**: no hay garantia de exactitud factual; el modelo puede inventar informacion con confianza.
- **Licencia y legalidad**: no se indica la licencia, por lo que el uso comercial puede estar sujeto a restricciones desconocidas. Ademas, la generacion de contenido inapropiado podria violar leyes o politicas de plataformas.
- **Compatibilidad**: el formato de cuantizacion FP4 con buffers personalizados puede no ser compatible con herramientas estandar de inferencia sin modificaciones.
- **Discrepancia de parametros**: el nombre sugiere 12B, pero los pesos reales son de 6,5B, lo que indica una posible inconsistencia en la nomenclatura.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Rin247/gemma-4-12B-it-Uncensored-Aquarion-FP4)
- [Version abliterated sin cuantizar (OpenYourMind)](https://huggingface.co/OpenYourMind/gemma-4-12B-it-abliterated-uncensored)
- [Modelo base google/gemma-4-12B](https://huggingface.co/google/gemma-4-12B)
- [Noticia sobre abliteration de Gemma 4 12B](https://uncensoredhub.ai/news/2026-06-07-huihui-abliterates-gemma-4-12b-strips-safety-filters-from-google-s-multimodal-mo)
- [Merge uncensored optimizado para AMD ROCM](https://uncensoredhub.ai/news/2026-07-02-gemma-4-12b-uncensored-merge-optimized-for-amd-rocm-drops-on-huggingface)
