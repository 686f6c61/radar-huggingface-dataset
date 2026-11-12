# richardyoung/Qwen3.8-27B-MPOA-heretic-GGUF

## Resumen

Qwen3.8-27B-MPOA-heretic-GGUF es la distribucion en formato GGUF del modelo richardyoung/Qwen3.8-27B-MPOA-heretic, una version "abliterated" (con el mecanismo de rechazo eliminado) del Qwen3.8-27B de Alibaba. La abliteracion se realizo con Heretic 2.0 aplicando MPOA (abliteracion proyectada con preservacion de magnitud), el metodo por defecto de esa herramienta. El autor, Richard J. Young, publica estos pesos como material de investigacion sobre eliminacion de rechazos y su evaluacion, no como asistente de proposito general.

El modelo cuenta con 26.895.998.464 parametros (aproximadamente 27B) y se distribuye unicamente en ingles, bajo licencia Apache 2.0. El repositorio contiene una cuantizacion Q4_K_M de 16,5 GB y una matriz de importancia (imatrix) de 27 MB, con planes de anadir IQ3_M, IQ4_XS, Q5_K_M, Q6_K y Q8_0. Los archivos estan pensados para llama.cpp y Ollama.

La relevancia de esta ficha es doble: por un lado, documenta el comportamiento de la abliteracion sobre una generacion reciente de Qwen; por otro, advierte de que la cuantizacion puede alterar el comportamiento de rechazo, por lo que los resultados del paper (medidos en bf16) no son directamente extrapolables a los GGUF publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; detalles de atencion no disponibles) |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (disponible); IQ3_M, IQ4_XS, Q5_K_M, Q6_K y Q8_0 anunciadas como pendientes |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); origen en safetensors bf16 |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, del que no se proporcionan en la informacion disponible detalles sobre numero de tokens de entrenamiento, composicion del dataset ni fases de RLHF/DPO. La intervencion realizada es una abliteracion: se identifica una direccion de rechazo en el espacio de activaciones y se proyectan los pesos para eliminarla, preservando la magnitud de las representaciones (MPOA). La busqueda de hiperparametros se realizo con Heretic 2.0 sobre 100 trials, seleccionando la variante con menos rechazos por palabra clave en el conjunto de desarrollo sujeto a una divergencia KL de primer token respecto al original menor o igual a 0,1.

Segun el paper del autor, la version completa en bf16 reduce la tasa de rechazo del 89,9% al 14,0% sobre 972 prompts daninos reservados, juzgados con WildGuard, manteniendo una divergencia KL de primer token de 0,085. Los archivos GGUF se generaron con llama.cpp (commit 468fde9): conversion a bf16 con convert_hf_to_gguf.py y cuantizacion con llama-quantize en CPU. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan una matriz de importancia calculada sobre la build Q8_0 con calibration_datav3 (128 fragmentos de 512 tokens); Q6_K y Q8_0 son estaticas. Cada archivo Q4_K_M se cargo y respondio a un prompt de prueba antes de subirse.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen3.8-27B.
- Cumplimiento de solicitudes que el modelo original rechaza, como consecuencia directa de la abliteracion.
- Capacidad de vision en el modelo base, no disponible en esta distribucion GGUF porque el proyector visual no se incluye.
- Soporte de tool calling, agentes o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Uso previsto: investigacion sobre eliminacion de rechazos, su medicion y las defensas frente a ella.

## Casos de uso

- Investigacion sobre abliteracion: reproducir y comparar la tasa de rechazo del modelo frente al original con conjuntos de prompts daninos y jueces automaticos como WildGuard, tal como hace el paper del autor.
- Evaluacion de robustez de salvaguardas: usar el modelo como caso de prueba para medir si los filtros externos, clasificadores de entrada/salida o system prompts de seguridad siguen funcionando sobre un modelo sin rechazo interno.
- Estudio del efecto de la cuantizacion: comparar el comportamiento de rechazo entre bf16 y las distintas cuantizaciones GGUF para determinar si la perdida de precision reintroduce o elimina rechazos de forma no sistematica.
- Analisis de divergencia de comportamiento: emplear la metrica de divergencia KL de primer token frente al original para cuantificar cuanto se ha desplazado la distribucion del modelo con cada trial de abliteracion.
- Despliegue local en investigacion: ejecutar el modelo en estaciones de trabajo con llama.cpp u Ollama mediante el tag Q4_K_M para experimentos que no requieran GPU de datacenter.
- Docencia y divulgacion tecnica: ilustrar en entornos controlados como funciona la proyeccion de direcciones de rechazo y que compromisos introduce entre cumplimiento y fidelidad al modelo original.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden al modelo completo en bf16, no a los GGUF:

| Metrica | Original | Este modelo (bf16) |
|---|---|---|
| Rechazo en 972 prompts daninos reservados (juez WildGuard) | 89,9% | 14,0% (136/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (trial seleccionado) | no disponible | 25 |
| Divergencia KL de primer token respecto al original | no disponible | 0,085 |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card advierte explicitamente de que los archivos cuantizados no fueron evaluados en el paper y que la cuantizacion puede cambiar el comportamiento de rechazo.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa 16,5 GB, por lo que requiere al menos unos 18-20 GB de VRAM o memoria unificada para cargarse completo con contexto moderado; las cuantizaciones Q8_0 y superiores, aun no publicadas, necesitarian bastante mas.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, un modelo de 27B en Q4_K_M encaja en GPUs de 24 GB (RTX 3090, RTX 4090) o en soluciones de memoria unificada de 32 GB o mas.
- Cabe en GPU de consumo: si, en Q4_K_M dentro de GPUs de 24 GB; las variantes de mayor precision requeririan 32 GB o mas.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (ollama run richardyoung/qwen3.8-27b-mpoa-heretic o hf.co/richardyoung/Qwen3.8-27B-MPOA-heretic-GGUF:Q4_K_M). No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo en prompts daninos | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-MPOA-heretic (bf16) | ~27B | no disponible | 14,0% | Apache 2.0 | safetensors |
| Qwen3.8-27B (original) | ~27B | no disponible | 89,9% | Apache 2.0 | safetensors |
| Qwen3.8-27B-MPOA-heretic-GGUF (esta ficha) | ~27B | no disponible | no evaluado en cuantizado | Apache 2.0 | GGUF |

No se dispone en la informacion proporcionada de datos de otros modelos abliterated comparables (por ejemplo, variantes de Gemma 4, Olmo 3.1 o Mistral Small 3.2 mencionadas en el paper) mas alla de su inclusion en el estudio.

## Limitaciones y advertencias

- El modelo elimina deliberadamente el rechazo: responde a muchas solicitudes que el original deniega, lo que lo hace inadecuado como asistente de proposito general y exige controles externos de seguridad en cualquier despliegue.
- Los resultados del paper corresponden a bf16; la cuantizacion puede alterar el comportamiento de rechazo y no ha sido evaluada, por lo que las cifras no son extrapolables a los GGUF.
- Solo soporta ingles segun la model card; no hay datos sobre otros idiomas.
- Sin proyector visual: la capacidad de vision del modelo base no esta disponible en esta distribucion.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, pero inherentes a un modelo de lenguaje de este tipo.
- Licencia Apache 2.0 con las mismas restricciones de uso que el modelo fuente; los usuarios son responsables del uso legal.
- No se han publicado benchmarks de capacidad, por lo que no es posible evaluar la degradacion respecto al original mas alla de la divergencia KL reportada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; ecosistema de validacion practicamente inexistente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/richardyoung/Qwen3.8-27B-MPOA-heretic-GGUF
- Modelo base abliterated (bf16): https://huggingface.co/richardyoung/Qwen3.8-27B-MPOA-heretic
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper citado: Richard J. Young, "Is Abliteration Getting Harder? Refusal Removal from Open-Weight LLMs with Heretic on Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 Versus Their Predecessors" (2026), enlace arXiv pendiente de publicacion segun la model card.
