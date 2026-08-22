# Saraswathy/vlm-cap-text-reasoning-step70-resume

## Resumen

Este repositorio contiene un checkpoint de reanudación de entrenamiento (resume checkpoint) del paso global 70 de un experimento de post-entrenamiento sobre el modelo base `Qwen/Qwen3-VL-4B-Instruct`. Lo publica la autora Saraswathy Amjith bajo el nombre `Saraswathy/vlm-cap-text-reasoning-step70-resume`, dentro de lo que parece ser una línea de trabajo sobre razonamiento visual en modelos de lenguaje y visión (VLM). El artefacto no es un modelo fusionado listo para inferencia, sino un conjunto completo de shards de FSDP, estado de optimizador, estado de dataloader, tokenizer/processor y un adaptador LoRA en `actor/lora_adapter/`, pensado para reanudar el entrenamiento hasta el paso 100.

La relevancia de este checkpoint es fundamentalmente investigadora: permite inspeccionar el progreso intermedio de un entrenamiento con la librería EasyR1, verificar la reproducibilidad mediante el `SHA256SUMS.json` incluido y continuar el proceso desde el punto exacto donde se detuvo. No está diseñado para uso en producción ni para evaluación directa sin antes fusionar el adaptador con el modelo base. La arquitectura subyacente es la de Qwen3-VL-4B-Instruct, un VLM de 4 mil millones de parámetros con capacidades de imagen-texto, sobre el cual se aplica un adaptador LoRA de rango 1 (según se indica en la model card).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-4B-Instruct (base) + adaptador LoRA de rango 1 |
| Parametros totales | no disponible (el checkpoint incluye shards del modelo base y del optimizador, no es un modelo fusionado) |
| Parametros activos | no disponible (el adaptador LoRA tiene rango 1, pero no se especifica el numero total de parametros entrenables) |
| Longitud de contexto | no disponible (depende del modelo base; no se indica en la documentacion del checkpoint) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (segun tags) y archivos de estado de entrenamiento (shards FSDP, optimizador, dataloader) |

## Arquitectura y entrenamiento

El checkpoint es un artefacto de entrenamiento generado con la libreria EasyR1, que implementa algoritmos de aprendizaje por refuerzo (como GRPO) para el post-entrenamiento de modelos de lenguaje y vision. La estructura interna incluye shards del modelo base (Qwen3-VL-4B-Instruct) bajo el esquema FSDP (Fully Sharded Data Parallel), estado del optimizador, estado del dataloader, ficheros de tokenizador y procesador, y un adaptador LoRA de rango 1 en `actor/lora_adapter/`. El entrenamiento se detuvo intencionadamente en el paso 70 y se reanudara hasta el paso 100, segun la model card.

No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens procesados, ni la composicion de los datos. El nombre del experimento (`capability_text_reasoning`) sugiere que el objetivo es mejorar la capacidad de razonamiento textual del VLM, posiblemente en tareas que combinan imagen y texto. Dado el contexto del autor (Saraswathy Amjith) y sus publicaciones sobre self-questioning VLMs con GRPO, es plausible que el entrenamiento utilice una metodologia similar, pero esto no esta confirmado en la informacion disponible.

## Capacidades

- No es un modelo listo para inferencia; es un checkpoint intermedio de entrenamiento.
- El adaptador LoRA esta disenado para la capacidad de razonamiento textual (`capability_text_reasoning`), aunque no se especifican las tareas concretas.
- El modelo base Qwen3-VL-4B-Instruct, sobre el que se aplica el adaptador, es capaz de procesar imagenes y texto, responder preguntas visuales, generar descripciones y realizar razonamiento multimodal.
- No se documentan capacidades adicionales como tool calling, agentes o modos de pensamiento extendido en este checkpoint.
- Al ser un artefacto de reanudacion, su principal "capacidad" es permitir continuar el entrenamiento desde el punto guardado.

## Casos de uso

- Investigacion en post-entrenamiento de VLMs: permite reanudar un experimento de entrenamiento interrumpido, manteniendo el estado exacto del optimizador, dataloader y modelo, lo que facilita la reproducibilidad y la continuacion de la investigacion.
- Analisis de dinamicas de entrenamiento: los shards de FSDP y el estado del optimizador permiten inspeccionar la evolucion de los gradientes, la magnitud de las actualizaciones y el comportamiento del modelo en el paso 70, util para diagnosticar problemas de convergencia.
- Evaluacion de adaptadores LoRA intermedios: el adaptador en `actor/lora_adapter/` puede cargarse sobre el modelo base para probar el rendimiento en tareas de razonamiento visual en un punto temprano del entrenamiento, comparandolo con pasos posteriores.
- Verificacion de integridad de checkpoints: el `SHA256SUMS.json` permite validar que todos los ficheros se han descargado correctamente antes de reanudar, un paso critico en entornos de computacion distribuida.
- Desarrollo de metodologias de entrenamiento por refuerzo para VLMs: sirve como ejemplo de como estructurar un checkpoint de reanudacion con EasyR1, incluyendo la configuracion y el launcher en `provenance/`.
- Formacion y educacion: puede utilizarse como caso de estudio para entender como se organiza un entrenamiento de VLM con FSDP y LoRA, y como se gestiona la reanudacion de experimentos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El checkpoint es un artefacto intermedio de entrenamiento, no un modelo final evaluado, por lo que no existen metricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) asociadas a el.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentacion del checkpoint.
- El tamano del repositorio es de 11.8 GB, lo que incluye shards del modelo base, optimizador, dataloader y adaptador. Para cargar el modelo base Qwen3-VL-4B-Instruct se necesitan aproximadamente 8 GB de VRAM en precision FP16 (el modelo base tiene 4B parametros), pero el checkpoint completo con estado de optimizador puede requerir mas memoria en RAM o VRAM durante la reanudacion.
- Para reanudar el entrenamiento se requiere una GPU con al menos 16 GB de VRAM (recomendado 24 GB o mas) y suficiente RAM para los shards de FSDP.
- Las opciones de despliegue tipicas para el modelo base incluyen vLLM, TGI o llama.cpp, pero el checkpoint en si no esta disenado para inferencia directa; habria que fusionar el adaptador LoRA con el modelo base.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. Este checkpoint no es un modelo final comparable con otros; es un artefacto de entrenamiento intermedio. Para comparar el modelo base Qwen3-VL-4B-Instruct con alternativas de la misma categoria (por ejemplo, otros VLMs de ~4B parametros como LLaVA-1.6 o Phi-3-vision), se necesitarian datos de benchmarks que no se han proporcionado.

## Limitaciones y advertencias

- No es un modelo fusionado: requiere cargar el modelo base `Qwen/Qwen3-VL-4B-Instruct` y aplicar el adaptador LoRA para cualquier uso de inferencia.
- Entrenamiento incompleto: el checkpoint corresponde al paso 70 de un entrenamiento que se planea llevar hasta el paso 100; el rendimiento del adaptador en este punto puede ser suboptimo.
- Licencia no especificada: no se indica bajo que licencia se distribuye el checkpoint, lo que genera incertidumbre sobre su uso comercial o modificacion.
- Integridad de ficheros: la model card advierte que se debe verificar el `SHA256SUMS.json` antes de reanudar el entrenamiento para evitar corrupcion de datos.
- Sin datos de evaluacion: no hay benchmarks ni metricas que permitan juzgar la calidad del adaptador en tareas de razonamiento visual.
- Dependencia del modelo base: cualquier limitacion de Qwen3-VL-4B-Instruct (sesgos, alucinaciones, limitaciones de contexto) se hereda en el adaptador, aunque no se documentan especificamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Saraswathy/vlm-cap-text-reasoning-step70-resume
- Proyecto VLM-CapCurriculum (ICML 2026): https://ucsc-vlaa.github.io/VLM-CapCurriculum/
- Coleccion VLM-CapCurriculum en HuggingFace: https://huggingface.co/collections/UCSC-VLAA/vlm-capcurriculum
- Paper relacionado (self-questioning VLMs con GRPO): https://arxiv.org/abs/2606.15651
- Sitio personal de la autora: https://saraamjith.com/saraamjith.html
