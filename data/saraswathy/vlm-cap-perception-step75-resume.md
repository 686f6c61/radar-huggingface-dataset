# Saraswathy/vlm-cap-perception-step75-resume

## Resumen

Este repositorio contiene un **checkpoint de reanudación de entrenamiento** (resume checkpoint) para un adaptador LoRA de rango 1 orientado a la **percepción visual**, desarrollado sobre el modelo base `Qwen/Qwen3-VL-4B-Instruct`. El artefacto forma parte del proyecto **VLM-CapCurriculum** de UCSC-VLAA, que propone descomponer el post-entrenamiento de modelos de visión y lenguaje (VLM) en tres etapas independientes: percepción visual, razonamiento textual y razonamiento visual. Este checkpoint corresponde a la etapa de percepción, entrenado con el framework EasyR1 (GRPO) y guardado en el paso global 75 de un entrenamiento que estaba previsto continuar hasta el paso 100.

El repositorio no contiene un modelo fusionado listo para inferencia, sino un conjunto completo de shards de estado de entrenamiento (modelo y optimizador en FSDP), estado del dataloader, archivos de tokenizador/processor y el adaptador LoRA evaluable bajo `actor/lora_adapter/`. Es un artefacto pensado para **reanudar el entrenamiento** o **evaluar el adaptador** sobre el modelo base, no para uso directo en producción. Su relevancia radica en que ejemplifica una metodología de post-entrenamiento por etapas que, según el proyecto, mejora la precisión en tareas de percepción y reduce la longitud de las trazas de razonamiento en modelos como Qwen3-VL-8B.

La licencia y los idiomas soportados no están declarados en la información disponible. El tamaño del repositorio es de 11,8 GB, lo que refleja la inclusión de todos los estados de entrenamiento, no solo del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-4B-Instruct (modelo base) + adaptador LoRA de rango 1 |
| Parametros totales | No disponible (el adaptador LoRA es de rango 1; el modelo base tiene 4B parametros) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, sin cuantizacion declarada) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador LoRA), PEFT; el repositorio incluye shards FSDP y archivos de estado |

## Arquitectura y entrenamiento

El adaptador LoRA de rango 1 se entrena sobre el modelo base `Qwen/Qwen3-VL-4B-Instruct`, un VLM multimodal que combina un codificador visual con un transformer de lenguaje. El entrenamiento se realiza con **EasyR1**, un framework basado en GRPO (Group Relative Policy Optimization) que no requiere demostraciones de razonamiento. El checkpoint guarda el estado completo del entrenamiento (modelo, optimizador, dataloader, tokenizador/processor) para permitir la reanudación exacta desde el paso 75.

El proyecto VLM-CapCurriculum, al que pertenece este artefacto, postula que la percepción visual debe entrenarse como una capacidad independiente, separada del razonamiento textual y del razonamiento visual. Según los resultados publicados del proyecto, esta separación produce mejoras medibles: en Qwen3-VL-8B se reporta un incremento de +1,46% en precisión y una reducción del 20,8% en la longitud de las trazas de razonamiento. Este checkpoint concreto se centra en la etapa de percepción, por lo que su objetivo es mejorar la capacidad del modelo para extraer información visual relevante antes de pasar a etapas de razonamiento.

## Capacidades

- **Percepcion visual especifica**: el adaptador esta disenado para mejorar la extraccion de caracteristicas visuales de alto nivel en tareas de comprension de imagenes, como parte del curriculum de capacidades del proyecto.
- **Reanudacion de entrenamiento**: el checkpoint incluye todos los estados necesarios (FSDP, optimizador, dataloader) para continuar el entrenamiento desde el paso 75 hasta el paso 100, segun la configuracion original.
- **Evaluacion sobre el modelo base**: el adaptador LoRA en `actor/lora_adapter/` puede cargarse sobre Qwen3-VL-4B-Instruct para evaluar su efecto en tareas de percepcion visual.
- **Capacidades del modelo base**: al estar basado en Qwen3-VL-4B-Instruct, hereda las capacidades de este modelo (comprension de imagen y texto, generacion de respuestas, etc.), aunque este checkpoint no las modifica directamente.
- **Integracion con el curriculum VLM-CapCurriculum**: el adaptador esta pensado para usarse dentro del flujo de post-entrenamiento por etapas, no como un modelo autonomo.

## Casos de uso

- **Investigacion en post-entrenamiento de VLMs**: el checkpoint permite reproducir y extender los experimentos del proyecto VLM-CapCurriculum, reanudando el entrenamiento hasta el paso 100 o evaluando el adaptador en tareas de percepcion visual.
- **Estudio de la separacion de capacidades**: los investigadores pueden analizar como el entrenamiento exclusivo de percepcion afecta al rendimiento global del modelo, comparando con modelos entrenados sin esta etapa.
- **Desarrollo de pipelines de entrenamiento por etapas**: el repositorio sirve como referencia tecnica para implementar flujos de entrenamiento con EasyR1 y FSDP, incluyendo la gestion de checkpoints de reanudacion.
- **Evaluacion de adaptadores LoRA en VLMs**: el adaptador puede cargarse sobre Qwen3-VL-4B-Instruct con PEFT para medir su impacto en tareas como respuesta a preguntas visuales (VQA) o captura de imagenes.
- **Reproducibilidad de experimentos**: al incluir `SHA256SUMS.json` y la carpeta `provenance/`, permite verificar la integridad de los archivos y reproducir exactamente las condiciones de entrenamiento.
- **Formacion y docencia**: el checkpoint puede usarse como ejemplo didactico de como estructurar un proyecto de post-entrenamiento de VLMs con metodos de refuerzo como GRPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El proyecto VLM-CapCurriculum reporta mejoras globales en modelos como Qwen3-VL-8B (+1,46% de precision y -20,8% en longitud de trazas), pero no hay datos especificos para este adaptador de rango 1 sobre Qwen3-VL-4B-Instruct.

## Requisitos de hardware

- **Inferencia con el adaptador**: requiere cargar el modelo base Qwen3-VL-4B-Instruct (aproximadamente 8-10 GB en FP16, segun la configuracion tipica de modelos de 4B parametros) mas el adaptador LoRA, que anade un coste minimo. Se recomienda una GPU con al menos 12 GB de VRAM para inferencia en FP16, o menos si se usa cuantizacion del modelo base.
- **Reanudacion del entrenamiento**: al incluir shards FSDP y estado del optimizador, el entrenamiento requiere una GPU con suficiente VRAM para el modelo base, el optimizador y los gradientes. Para un modelo de 4B parametros, se recomienda al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G o superiores).
- **Opciones de despliegue**: el adaptador puede cargarse con PEFT sobre el modelo base en frameworks como Transformers, vLLM o TGI, siempre que se use el modelo base como punto de partida. No se proporcionan archivos GGUF ni cuantizaciones especificas.
- **Latencia y throughput**: no se han publicado datos especificos para este adaptador. Dependera del hardware y del modelo base utilizado.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores comparables dentro del mismo proyecto o de otros proyectos con caracteristicas equivalentes (LoRA de rango 1 para percepcion visual sobre Qwen3-VL-4B). El proyecto VLM-CapCurriculum menciona experimentos con Qwen3-VL-8B, pero no se publican comparativas directas con este checkpoint concreto. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- **Checkpoint incompleto**: el entrenamiento se detuvo en el paso 75 de 100, por lo que el adaptador no representa un modelo final entrenado completamente.
- **No es un modelo autonomo**: requiere obligatoriamente el modelo base `Qwen/Qwen3-VL-4B-Instruct` para funcionar; no es un modelo fusionado.
- **Licencia no declarada**: no se especifica la licencia del adaptador ni del repositorio, lo que limita su uso comercial sin autorizacion explicita.
- **Idiomas no especificados**: no se indica que idiomas soporta el adaptador; dependera del modelo base y de los datos de entrenamiento, que tampoco se detallan.
- **Riesgo de alucinacion**: al ser un adaptador de percepcion, puede heredar los sesgos y limitaciones del modelo base en cuanto a generacion de texto y comprension de contextos complejos.
- **Verificacion de integridad**: la model card exige verificar el archivo `SHA256SUMS.json` antes de usar el checkpoint, lo que indica que la integridad de los archivos no esta garantizada sin dicha verificacion.
- **Sin benchmarks publicados**: no hay evidencia publica del rendimiento de este adaptador en tareas estandar, por lo que su efectividad no esta validada.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/Saraswathy/vlm-cap-perception-step75-resume)
- [Coleccion VLM-CapCurriculum en HuggingFace](https://huggingface.co/collections/UCSC-VLAA/vlm-capcurriculum)
- [Pagina del proyecto VLM-CapCurriculum](https://ucsc-vlaa.github.io/VLM-CapCurriculum/)
- [Paper en arXiv (2605.20177)](https://arxiv.org/pdf/2605.20177)
- [Repositorio GitHub de VLM-CapCurriculum](https://github.com/UCSC-VLAA/VLM-CapCurriculum)
- [Pagina personal de la autora](https://saraamjith.com/saraamjith.html)
