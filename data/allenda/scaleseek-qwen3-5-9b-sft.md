# Allenda/ScaleSeek-Qwen3.5-9B-SFT

## Resumen

ScaleSeek-Qwen3.5-9B-SFT es un checkpoint de ajuste fino supervisado (SFT) de arranque en frío desarrollado por Allenda, publicado en Hugging Face el 2 de septiembre de 2026. El modelo parte de la base `Qwen/Qwen3.5-9B` y ha sido entrenado con 1725 trayectorias multi-paso verificadas, generadas por un modelo profesor de mayor tamaño, el Qwen3.6-35B-A3B. El objetivo declarado es mejorar las capacidades de razonamiento multi-hop del modelo base mediante un conjunto de datos curado y verificado.

Se trata de un modelo denso de aproximadamente 9,41 mil millones de parámetros, con un repositorio de 37,7 GB en formato safetensors. La ficha del autor no especifica licencia, idiomas soportados ni detalles adicionales de entrenamiento, más allá de la referencia a un archivo `DATA_PROVENANCE.md` con el checksum del conjunto de datos. Su relevancia radica en ser un ejemplo de SFT de alta calidad sobre un modelo de la familia Qwen3.5, orientado a tareas de razonamiento complejo, aunque su disponibilidad pública es muy reciente y carece de documentación extensa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa, basada en Qwen3.5-9B (detalles no especificados) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la ficha del modelo. Se indica que el checkpoint se construye sobre `Qwen/Qwen3.5-9B`, que según informacion publica de la familia Qwen3.5 es un modelo denso de vision-lenguaje con capacidades de razonamiento y comportamiento agente. Sin embargo, no se confirma si este checkpoint concreto conserva todas las capacidades multimodales del base o si el SFT se ha centrado exclusivamente en texto.

El entrenamiento es un SFT de arranque en frio (cold-start) con 1725 trayectorias multi-paso verificadas, generadas por un modelo profesor Qwen3.6-35B-A3B (probablemente una variante con 35 mil millones de parametros y 3 mil millones activos, aunque no se confirma). El autor menciona un archivo `DATA_PROVENANCE.md` con el checksum del conjunto de entrenamiento, lo que sugiere un proceso de curado riguroso. No se especifican hiperparametros, numero de epochs, ni si se aplicaron tecnicas adicionales como RLHF o DPO.

## Capacidades

- Razonamiento multi-hop: el entrenamiento con trayectorias verificadas sugiere una mejora especifica en tareas que requieren encadenar varios pasos logicos.
- Generacion de texto: al ser un SFT sobre Qwen3.5-9B, conserva las capacidades generativas del modelo base, aunque no se aportan evidencias concretas.
- No se documentan capacidades de tool calling, agentes, vision, audio o modo thinking en la ficha del autor.
- El soporte multilingue no esta especificado; se asume que hereda el del modelo base, pero sin confirmacion.

## Casos de uso

- Razonamiento logico y matematico: el modelo puede emplearse en sistemas que requieran resolver problemas con multiples pasos de deduccion, gracias a su entrenamiento con trayectorias verificadas.
- Investigacion academica: util para experimentos de SFT y comparacion de tecnicas de destilacion con modelos profesor de mayor tamano.
- Prototipado de agentes de razonamiento: aunque no se confirma tool calling, su base Qwen3.5 sugiere compatibilidad con frameworks de agentes, pero requiere validacion.
- Generacion de explicaciones estructuradas: las trayectorias multi-paso pueden inducir respuestas mas coherentes y justificadas en tareas de QA complejo.
- Evaluacion de modelos: como checkpoint intermedio, sirve para estudiar el impacto del SFT en el rendimiento frente al modelo base.
- Desarrollo de pipelines de datos: el enfoque de datos verificados puede inspirar metodologias de curado para otros proyectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del modelo no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion comparativa. Tampoco se proporcionan comparaciones con el modelo base o con otros checkpoints de la misma familia.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,41 mil millones de parametros, en precision FP16 se requieren aproximadamente 18,8 GB de memoria solo para los pesos. Con cuantizacion INT8 se reduce a unos 9,4 GB, y con INT4 a unos 4,7 GB, pero no se ofrecen checkpoints cuantizados en el repositorio.
- GPU recomendadas: para FP16, una GPU con 24 GB o mas (RTX 3090, RTX 4090, A10G, A100 40GB). Para cuantizacion INT4, cabria en GPUs de 8 GB (RTX 3070, RTX 4060 Ti), pero habria que generar los cuantizados manualmente.
- Opciones de despliegue: al ser un modelo de la familia Qwen, es compatible con vLLM, llama.cpp, Ollama y TGI, aunque no se proporcionan instrucciones especificas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este checkpoint, por lo que una comparativa cuantitativa no es posible. Como referencia estructural, se puede comparar con otros modelos de tamano similar:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ScaleSeek-Qwen3.5-9B-SFT | 9,41 B | No disponible | No disponible | Hugging Face |
| Qwen2.5-7B | 7,6 B | 128K | Apache 2.0 | Hugging Face, Ollama |
| Llama-3.1-8B | 8,03 B | 128K | Llama 3.1 Community License | Hugging Face, Ollama |

La comparacion es meramente orientativa; no se conocen los resultados de ScaleSeek en los benchmarks estandar.

## Limitaciones y advertencias

- No se especifica la licencia, lo que impide determinar si es utilizable en entornos comerciales. Se debe contactar con el autor antes de cualquier uso productivo.
- La ausencia de informacion sobre el conjunto de datos de entrenamiento (mas alla del checksum) impide evaluar posibles sesgos o desequilibrios.
- Al ser un checkpoint SFT con solo 1725 trayectorias, es probable que el modelo tenga una generalizacion limitada fuera de los dominios representados en esos datos.
- No se confirman las capacidades multimodales del modelo base; si el SFT se realizo solo con texto, podria haber degradado el rendimiento en tareas de vision.
- El riesgo de alucinacion no se ha evaluado publicamente.
- La fecha de creacion (2026) y la ausencia de descargas o likes sugieren que el modelo es muy reciente y no ha sido validado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Allenda/ScaleSeek-Qwen3.5-9B-SFT
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B (referencia, no verificado)
- Informacion sobre Qwen3.5 9B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-9b/ (contexto general de la familia)
