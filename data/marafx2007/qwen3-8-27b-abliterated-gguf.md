# marafx2007/Qwen3.8-27B-abliterated-GGUF

## Resumen

`marafx2007/Qwen3.8-27B-abliterated-GGUF` es una version cuantizada en formato GGUF de un modelo de lenguaje de 27.000 millones de parametros basado en Qwen, especificamente una variante "abliterated" desarrollada por `wangzhang`. La abliteration es una tecnica que elimina ciertos comportamientos no deseados del modelo, tipicamente la resistencia a responder instrucciones sensibles o prohibidas. El repo, publicado por `marafx2007`, contiene los pesos en formato GGUF con multiples cuantizaciones, lo que permite su ejecucion en entornos de bajos recursos mediante herramientas como llama.cpp u Ollama.

El modelo no es un desarrollo original de Qwen, sino una version modificada sobre `Qwen3.8-27B`, con parametros totales de 26.895.998.464. La informacion disponible no incluye datos sobre la longitud de contexto, el proceso de entrenamiento ni resultados de benchmarks. El repositorio actual es una contribucion orientada a facilitar el despliegue local del modelo mediante cuantizaciones GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es `Qwen3.8-27B-abliterated`, un LLM transformer de aproximadamente 27.000 millones de parametros. Sobre el proceso de entrenamiento especifico no se ha publicado documentacion en la informacion disponible. El repositorio de HuggingFace indica la aplicacion de las tecnicas `abliteration` y `lora-self-distillation`. La abliteration es un procedimiento de modificacion post-entrenamiento que busca suprimir patrones de activacion asociados a respuestas no deseadas (como el rechazo a ciertas instrucciones). No se detallan datos sobre dataset, numero de tokens de entrenamiento, ni si se aplico RLHF o DPO. La cuantizacion a GGUF ha sido realizada por `mradermacher`, segun la model card, y cubre un amplio rango de niveles de bits.

## Capacidades

- Generacion de texto generico y razonamiento linguistico, al tratarse de un LLM de 27B basado en la familia Qwen.
- Ausencia de alineacion explicita: el modelo esta "abliterated", lo que significa que probablemente no rechace instrucciones que un modelo alineado si rechazaria. Esta capacidad no ha sido evaluada formalmente en la informacion disponible.
- Soporte de tool calling, agentes o vision: no disponible en la documentacion del repo.
- Capacidades multilingues: limitadas, el modelo esta declarado en ingles.
- No se han publicado evaluaciones de capacidades ni de comportamiento en tasks especificas.

## Casos de uso

- Investigacion en seguridad y alineacion de IA: el modelo permite estudiar como la eliminacion de comportamientos de rechazo afecta a las respuestas, comparando con el modelo base alineado.
- Analisis de sesgos latentes: al eliminar filtros de contenido, se puede exponer y analizar sesgos que normalmente quedan ocultos en modelos alineados.
- Evaluacion de tecnicas de abliteration: sirve como material para medir la eficacia de metodos de desalineacion y su impacto en la calidad de generacion.
- Generacion de contenido creativo sin restricciones: util en entornos de investigacion o produccion de ficcion donde se requiere explorar temas que un modelo filtrado evitaria.
- Fine-tuning para dominios especializados: la arquitectura de 27B ofrece un punto de partida solido para ajustar el modelo a tareas especificas mediante LoRA u otros metodos.
- Pruebas de red teaming: en entornos aislados, el modelo puede usarse para obtener respuestas no filtradas que permitan identificar vulnerabilidades en sistemas de guardrails.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones para MMLU, HumanEval, GSM8K u otras evaluaciones comparativas. Cualquier valor de rendimiento debe ser establecido mediante pruebas propias.

## Requisitos de hardware

- VRAM estimada: aproximadamente 22 - 24 GB para la cuantizacion Q2_K, 32 - 36 GB para Q4_K_S o Q4_K_M, y 58 - 62 GB para Q8_0, teniendo en cuenta el overhead del runtime.
- GPU recomendadas: una RTX 4090 (24 GB) puede ejecutar Q2_K con descarga parcial a CPU. Para Q4_K_S o superiores se requieren GPUs con 40 GB o mas, como A6000 (48 GB) o H100 (80 GB).
- Alternativa en CPU: el modelo puede ejecutarse con llama.cpp siempre que se disponga de RAM suficiente (al menos el tamano del archivo más un margen de 2-4 GB) y no se exija latencia baja.
- Opciones de despliegue: llama.cpp (recomendado para ejecutar GGUF), Ollama, LM Studio. Para despliegue con vLLM o TGI se necesitarian los pesos en formato safetensors y posterior conversion.
- Latencia y throughput: no disponible en la documentacion.

## Comparativa con modelos similares

No se ha encontrado informacion comparable en la busqueda. El modelo base `Qwen3.8-27B-abliterated` no es un nombre estandar de la familia Qwen, y no hay datos publicados de benchmarks que permitan comparar su rendimiento con alternativas como Qwen2.5-32B o Qwen3-32B. La unica comparativa posible se reduce al tamano de parametros, pero sin datos de contexto ni rendimiento la comparacion no es concluyente.

## Limitaciones y advertencias

- Modelo sin alineacion: al estar abliterated, es probable que proporcione contenido nocivo o inseguro sin reparar. No debe usarse en produccion sin una capa de moderacion externa.
- Sesgos no mitigados: la falta de alineacion puede incrementar la exposicion de sesgos toxic o discriminatorios presentes en los datos de entrenamiento del modelo original.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion falsa u ofensiva con seguridad aparente.
- Idioma limitado: la model card declara exclusivamente ingles. No se garantiza calidad en otros idiomas.
- Sin evaluaciones publicas: la ausencia de benchmarks impide conocer la calidad real del modelo en aspectos como razonamiento, codificacion o matematicas.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero el usuario es responsable de cumplir las leyes aplicables y de filtrar el contenido generado.
- Los archivos del repositorio estan divididos en varias partes; es necesario descargar todas las partes de una cuantizacion y concatenarlas antes de usar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/marafx2007/Qwen3.8-27B-abliterated-GGUF
- Modelo base original: https://huggingface.co/wangzhang/Qwen3.8-27B-abliterated
- Cuantizaciones i1-GGUF (imatrix): https://huggingface.co/mradermacher/Qwen3.8-27B-abliterated-i1-GGUF
- Pagina de peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
