# OseRen04/Qwen3-8B-FiveLang-Pruned

## Resumen

Qwen3-8B-FiveLang-Pruned es un derivado del modelo Qwen3-8B de Alibaba Qwen, publicado por el usuario OseRen04 en Hugging Face. Se trata de una poda de vocabulario (vocabulary pruning) sobre el modelo base: se ha reducido el tokenizador BPE original de 151.936 filas a 97.643, eliminando las filas correspondientes de la matriz de embeddings y de la capa `lm_head`. La selección de vocabulario se hizo a partir de texto en japones, ingles, ruso, coreano y chino simplificado.

El objetivo es reducir el numero de parametros asociados a la capa de embedding y a la proyeccion de salida, manteniendo el resto de la arquitectura transformer intacta. El resultado es un modelo de 7.745.967.104 parametros (frente a los aproximadamente 8.200 millones del Qwen3-8B original), con un repositorio de 15,5 GB en formato safetensors.

Es relevante para quienes despliegan Qwen3-8B en entornos con restricciones de memoria o ancho de banda y trabajan exclusivamente con los cinco idiomas cubiertos. Conviene subrayar que, tal como advierte el propio autor, se trata de una poda de vocabulario y no de una eliminacion garantizada del conocimiento en otros idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 7.745.967.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-8B soporta contexto largo, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | japones, ingles, ruso, coreano, chino simplificado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-8B original, un transformer decoder-only. La unica modificacion documentada es la poda del vocabulario: el tokenizador BPE se reconstruyo seleccionando tokens a partir de corpus en japones, ingles, ruso, coreano y chino simplificado, y se eliminaron las filas correspondientes en la matriz de embeddings y en `lm_head` para que coincidan con el nuevo tamano de vocabulario (97.643 filas frente a las 151.936 originales).

No se ha realizado un reentrenamiento completo ni un ajuste fino posterior a la poda segun la informacion disponible. La revision del modelo base utilizada es `b968826d9c46dd6066d109eabc6255188de91218`. No se detallan en la model card el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esos datos corresponden al modelo base y no se reproducen aqui.

## Capacidades

- Generacion de texto conversacional y de proposito general, heredada del Qwen3-8B base.
- Cobertura de vocabulario optimizada para japones, ingles, ruso, coreano y chino simplificado.
- Razonamiento, codigo y matematicas: capacidades propias del modelo base, aunque no verificadas especificamente tras la poda.
- Tool calling y function calling: soportados por el modelo base Qwen3-8B; no se confirma su preservacion explicita tras la poda.
- Modo thinking: el Qwen3-8B base incorpora modos de razonamiento; no se documenta si se mantienen intactos en este derivado.
- Capacidades multilingues limitadas a los cinco idiomas del vocabulario podado; el rendimiento en otros idiomas puede degradarse de forma sustancial.

## Casos de uso

- Despliegue en entornos con memoria limitada: la reduccion de vocabulario disminuye el tamano de la capa de embedding y de `lm_head`, lo que reduce ligeramente los requisitos de VRAM y el tamano del checkpoint (15,5 GB en safetensors) frente al modelo original.
- Procesamiento de texto en japones, coreano o ruso: el vocabulario esta seleccionado especificamente para estos idiomas, lo que puede mejorar la eficiencia de tokenizacion en comparacion con un vocabulario generico.
- Generacion de texto en ingles para aplicaciones de asistencia y chat: el modelo conserva el comportamiento conversacional del Qwen3-8B base.
- Pipelines de traduccion entre los cinco idiomas cubiertos: el vocabulario compartido permite manejar pares como japones-ingles o coreano-chino sin tokens fuera de rango.
- Prototipado e investigacion sobre poda de vocabulario: sirve como caso de estudio para medir el impacto de reducir el vocabulario en las capacidades del modelo.
- Inferencia en GPU de consumo con cuantizacion posterior: aunque no se publican GGUF, el checkpoint safetensors puede cuantizarse con herramientas externas para ajustarlo a GPUs de 16-24 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 15,5 GB solo para pesos, mas overhead de activaciones y KV cache; se recomienda al menos 20-24 GB para contexto moderado.
- VRAM estimada en cuantizacion 8 bits: en torno a 8-9 GB para pesos.
- VRAM estimada en cuantizacion 4 bits: en torno a 4,5-5 GB para pesos.
- GPU recomendadas: A100 40/80 GB, H100, L40S para produccion en precision completa; RTX 4090 (24 GB) para fp16 con contexto limitado.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en fp16 con contexto reducido, y en GPUs de 8-12 GB tras cuantizacion a 4-8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras conversion a GGUF (no se distribuyen conversiones oficiales).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-8B-FiveLang-Pruned | 7.745.967.104 | no disponible | ja, en, ru, ko, zh | Apache 2.0 | safetensors |
| Qwen/Qwen3-8B (base) | ~8.200 millones | no disponible en esta ficha | multilingue amplio | Apache 2.0 | safetensors |
| Otros derivados podados de Qwen3-8B | no disponible | no disponible | no disponible | Apache 2.0 | safetensors |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La poda de vocabulario no elimina el conocimiento de otros idiomas: el autor advierte explicitamente que no se garantiza el borrado de conocimiento en lenguas fuera de las cinco seleccionadas.
- El rendimiento en idiomas no cubiertos por el vocabulario podado puede degradarse de forma severa, ya que muchos caracteres se tokenizaran como bytes o secuencias desconocidas.
- No se han publicado evaluaciones que midan la perdida de calidad respecto al Qwen3-8B original tras la poda.
- Riesgo de alucinacion inherente al modelo base, no mitigado ni evaluado en este derivado.
- Sesgos: no documentados en la model card; se heredan los del modelo base Qwen3-8B.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo podado.
- No se distribuyen cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que obliga al usuario a generarlas por su cuenta.
- El modelo tiene 0 descargas y 1 like en el momento de la ficha, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OseRen04/Qwen3-8B-FiveLang-Pruned
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
