# pntrinh92/uq-checkpoints

## Resumen

`pntrinh92/uq-checkpoints` es un repositorio de checkpoints publicado en Hugging Face por el usuario pntrinh92, asociado al proyecto de investigación `uq` alojado en GitHub. No se trata de un modelo único entrenado para inferencia general, sino de una colección de pesos derivados de varios experimentos de cuantificación de incertidumbre (uncertainty quantification): flujos compilados sobre ViT-B/16 para ImageNet, ajustes finos de ViT sobre CIFAR-10 y CIFAR-100, y ajustes finos de Qwen2.5-0.5B sobre tareas de clasificación de texto (CoLA, IMDb y SST-2).

El repositorio ocupa 55,5 GB y está organizado replicando el árbol de trabajo del proyecto (`$UQ`), de modo que puede restaurarse en su sitio con `hf download`. Los pesos están en formato `.pt` (PyTorch) y safetensors según las etiquetas del repo, e incluyen tanto pesos de modelo como estados de optimizador para reanudar entrenamiento. La licencia es `other`, sin términos detallados en la model card.

Su relevancia es acotada y de carácter investigador: sirve para reproducir los experimentos del proyecto `uq`, no como modelo de propósito general. No hay pipeline declarado, ni idiomas especificados, ni descargas ni interacciones registradas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Varias: ViT-B/16 con flujos compilados (compiled flows) para ImageNet y CIFAR; Qwen2.5-0.5B (transformer decoder) con cabeza de clasificación para CoLA, IMDb y SST-2 |
| Parametros totales | No disponible de forma agregada; ViT-B/16 (~86 M) y Qwen2.5-0.5B (~0,5 B) por componente |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | `.pt` (PyTorch) y safetensors (según etiquetas del repo) |

## Arquitectura y entrenamiento

El repositorio agrupa tres familias de artefactos. La primera son flujos compilados sobre ImageNet con backbone ViT-B/16: los ficheros `<tag>_flownet.pt` contienen los pesos, `<tag>_step<N>_flownet.pt` son snapshots intermedios y `<tag>_flownet_state.pt` guarda el estado del optimizador para reanudar el entrenamiento. La variante `ode8_*` corresponde a los últimos 4 bloques del ViT-B, mientras que `ode_*` cubre los 12 bloques. El mejor checkpoint reportado es `ode8_full120k`, con un 83,5 % de acuerdo top-1 con ViT-B/16 y un 77,3 % de accuracy.

La segunda familia son ajustes finos de ViT sobre CIFAR-10 y CIFAR-100 (`finetuned.pt`) junto con sus flujos compilados. La tercera son ajustes finos de Qwen2.5-0.5B para CoLA, IMDb y SST-2, con cinco semillas por tarea (`seed0` a `seed4`), cada una con un directorio `model/` en formato transformers y un `head.pt` para la cabeza de clasificación. No se detallan en la model card el volumen de tokens de entrenamiento, la composición de los datasets ni si se aplicaron técnicas de alineación como RLHF o DPO. Las imágenes y features de ImageNet no se redistribuyen por restricciones de licencia del dataset.

## Capacidades

- Generación de representaciones y flujos compilados sobre ViT-B/16 para experimentos de cuantificación de incertidumbre en visión.
- Clasificación de imágenes en ImageNet, CIFAR-10 y CIFAR-100 mediante los checkpoints ajustados.
- Clasificación de texto en CoLA (aceptabilidad gramatical), IMDb (análisis de sentimiento binario) y SST-2 (análisis de sentimiento) con Qwen2.5-0.5B y cabeza de clasificación.
- Reproducción de experimentos con múltiples semillas (5 por tarea de NLP) para análisis de varianza.
- Reanudación de entrenamiento gracias a los estados de optimizador incluidos.
- No se documentan tool calling, capacidades de agente, multilingüismo ni modos de razonamiento extendido.

## Casos de uso

- Reproducción de experimentos de cuantificación de incertidumbre: descargar el repo con `hf download pntrinh92/uq-checkpoints --local-dir $UQ` y ejecutar el código del proyecto `uq` para validar los resultados publicados sobre ImageNet.
- Estudio de flujos compilados en ViT: comparar la variante `ode8_*` (4 bloques) con `ode_*` (12 bloques) para analizar el compromiso entre coste computacional y acuerdo top-1 con el modelo base.
- Evaluación de calibración en clasificación de texto: usar los cinco seeds de CoLA, IMDb y SST-2 con Qwen2.5-0.5B para medir la estabilidad de las estimaciones de incertidumbre entre inicializaciones.
- Baseline para métodos de UQ en visión: emplear los checkpoints de CIFAR-10 y CIFAR-100 como referencia al comparar nuevas técnicas de estimación de incertidumbre.
- Análisis de sensibilidad a semilla en ajuste fino: los directorios `seed{0-4}` permiten cuantificar la variabilidad de métricas de clasificación en tareas NLP pequeñas.
- Docencia e investigación: material listo para usar en cursos o trabajos que requieran checkpoints intermedios y estados de optimizador para estudiar dinámicas de entrenamiento.

## Benchmarks y rendimiento

| Modelo / checkpoint | Metrica | Valor |
|---|---|---|
| `ode8_full120k` | Acuerdo top-1 con ViT-B/16 | 83,5 % |
| `ode8_full120k` | Accuracy | 77,3 % |

No se han publicado en la informacion disponible resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, ViT-B/16 en fp32 ronda los 350 MB de pesos y Qwen2.5-0.5B en fp16 alrededor de 1 GB, pero el repositorio completo ocupa 55,5 GB en disco.
- GPU recomendadas: no disponibles en la informacion proporcionada. Para ViT-B/16 y Qwen2.5-0.5B basta una GPU consumer moderna; para entrenamiento o reanudación con estados de optimizador se recomienda al menos una GPU con 16-24 GB.
- Cabe en GPU consumer: sí, para inferencia de los componentes individuales (ViT-B/16 y Qwen2.5-0.5B); el conjunto completo requiere espacio en disco considerable.
- Opciones de despliegue: los checkpoints de Qwen2.5-0.5B están en formato transformers y pueden cargarse con la librería `transformers`; los flujos de ViT son ficheros `.pt` que requieren el código del proyecto `uq`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `pntrinh92/uq-checkpoints` | ViT-B/16 + Qwen2.5-0.5B | No disponible | other | Hugging Face | Checkpoints de investigación, no modelo de propósito general |
| Qwen2.5-0.5B (base) | ~0,5 B | 32 768 tokens (según documentación pública de Qwen) | Apache 2.0 (según documentación pública de Qwen) | Hugging Face | Modelo base de propósito general; el repo solo incluye ajustes finos con cabeza de clasificación |
| ViT-B/16 (base) | ~86 M | No aplica (visión) | Según implementación original | Amplia | Backbone de visión; el repo incluye flujos compilados sobre él |

La comparación con el Qwen2.5-0.5B base y con ViT-B/16 se ofrece como referencia contextual; los datos de contexto y licencia de esos modelos base provienen de su documentación pública y no de la model card de este repositorio.

## Limitaciones y advertencias

- No es un modelo de propósito general: son checkpoints de investigación ligados a un repositorio de código concreto; sin ese código, su utilidad es limitada.
- La licencia `other` no especifica términos de uso comercial; es necesario consultar el repositorio de GitHub para conocer las condiciones exactas.
- No se redistribuyen imágenes ni features de ImageNet por restricciones del dataset original, lo que impide reproducir el pipeline completo solo con este repo.
- No hay información sobre sesgos, riesgo de alucinación ni evaluación de robustez.
- No se documentan idiomas soportados ni limitaciones de contexto.
- El pipeline no está declarado y no hay descargas ni validación comunitaria registrada, por lo que la calidad de los pesos no está contrastada de forma independiente.
- Los checkpoints de Qwen2.5-0.5B están ajustados para clasificación con una cabeza específica; no deben usarse como modelos generativos sin adaptación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/pntrinh92/uq-checkpoints
- Repositorio del proyecto en GitHub: https://github.com/pntrinh92/uq
