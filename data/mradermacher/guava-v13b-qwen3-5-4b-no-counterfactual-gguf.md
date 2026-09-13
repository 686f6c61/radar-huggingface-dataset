# mradermacher/guava-v13b-qwen3.5-4b-no-counterfactual-GGUF

## Resumen

`mradermacher/guava-v13b-qwen3.5-4b-no-counterfactual-GGUF` es un repositorio de cuantizaciones estaticas en formato GGUF generado por mradermacher a partir del modelo `AIcell/guava-v13b-qwen3.5-4b-no-counterfactual`. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos (convert_type: hf, quantize_version: 2) pensada para su ejecucion en llama.cpp y en el resto del ecosistema GGUF (Ollama, LM Studio, koboldcpp, llama-cpp-python). El repositorio incluye 12 variantes de cuantizacion: x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S y Q2_K.

El dato mas relevante es el tamano real declarado en los safetensors del modelo de origen: 333.514.240 parametros, aproximadamente 333,5 millones. Esto contrasta de forma llamativa con la nomenclatura del nombre (`guava-v13b`, `qwen3.5-4b`), que sugiere un modelo de 13.000 millones o de 4.000 millones de parametros. La model card del repositorio no aclara esta discrepancia, por lo que conviene verificar el modelo base antes de asumir cualquier capacidad.

La relevancia practica del repositorio es la de facilitar inferencia local de muy bajo coste: con un modelo de este tamano, las cuantizaciones Q4_K_M o IQ4_XS ocupan unos 200 MB o menos, lo que permite ejecucion en CPU, en GPUs integradas, en moviles de gama alta y en dispositivos tipo Raspberry Pi. No se ha publicado informacion sobre licencia, idiomas, pipeline ni datos de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere una base tipo Qwen, sin confirmar) |
| Parametros totales | 333.514.240 (333,5 M) segun safetensors del modelo de origen |
| Parametros activos | no aplica (no hay evidencia de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo de origen esta en safetensors |
| Tamano del repositorio | 1,0 GB declarado |
| Modelo de origen | AIcell/guava-v13b-qwen3.5-4b-no-counterfactual |
| Fecha de creacion | 2026-09-13 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo de origen en la informacion proporcionada. Los metadatos de la conversion indican unicamente `convert_type: hf` (conversion desde pesos HuggingFace a GGUF), `quantize_version: 2` y `output_tensor_quantised: 1`, lo que implica que la cuantizacion afecta a los tensores de salida. La nomenclatura del modelo base remite a una posible familia Qwen (`qwen3.5-4b`) y a un identificador interno de proyecto (`guava-v13b`), pero ninguno de esos identificadores es coherente con los 333,5 millones de parametros declarados, por lo que no es posible confirmar ni el backbone, ni el numero de capas, ni la dimensionalidad del modelo.

Tampoco hay datos sobre el proceso de entrenamiento: se desconoce el volumen de tokens, la composicion del dataset, la existencia de fases de ajuste fino supervisado, RLHF o DPO. El sufijo `no-counterfactual` sugiere que el modelo base fue entrenado evitando ejemplos contrafactuales, pero se trata de una inferencia a partir del nombre y no de un dato documentado. Se recomienda consultar el repositorio del modelo original antes de cualquier uso en produccion.

## Capacidades

- No hay informacion verificada sobre capacidades especificas en la model card del repositorio de cuantizaciones.
- Generacion de texto: es la funcion esperada de cualquier modelo de lenguaje cuantizado en GGUF, aunque no se detalla su calidad.
- Razonamiento, codigo, matematicas: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades multimodales (vision, audio): no disponible (no se incluye el tensor `mmproj`, marcado como vacio en los metadatos).
- Modo de razonamiento explicito (thinking): no disponible.

## Casos de uso

- Inferencia local en dispositivos de recursos limitados: con cuantizaciones Q4_K_M o inferiores, el modelo ocupa alrededor de 200 MB o menos, por lo que puede ejecutarse en CPU sin GPU dedicada, en SBC tipo Raspberry Pi o en telefonos de gama alta mediante llama.cpp.
- Prototipado rapido de aplicaciones de lenguaje: permite construir y validar pipelines de generacion de texto (prompting, streaming, plantillas de chat) con un coste de hardware minimo antes de escalar a modelos mayores.
- Clasificacion y etiquetado de texto por generacion: para tareas de categorizacion simple, analisis de sentimiento o extraccion de campos en las que la latencia y el coste importan mas que la precision maxima, un modelo de 333 M cuantizado a Q4 o Q5 puede cubrir el caso.
- Filtrado previo (pre-filtering) en cascadas de inferencia: uso como primer nivel que descarta peticiones triviales y deriva solo las complejas a un modelo grande, reduciendo el coste medio por consulta.
- Modelo borrador para decodificacion especulativa: por su tamano reducido y su formato GGUF, puede actuar como draft model que propone tokens validados despues por un modelo mayor, siempre que comparta tokenizador (requisito no verificado en este caso).
- Experimentacion academica con cuantizacion: el repositorio ofrece 12 niveles de cuantizacion del mismo modelo, lo que lo convierte en un banco de pruebas util para medir el impacto de Q2_K, Q3_K, IQ4_XS o Q5_K_M sobre la perplejidad y la calidad de salida.
- Generacion de texto offline y embebida: en entornos sin conectividad (industria, dispositivos de campo, aplicaciones de escritorio), un modelo que cabe en menos de 1 GB permite asistencia textual sin dependencia de servicios externos.
- Evaluacion comparativa de tooling GGUF: util para verificar compatibilidad y rendimiento de runtimes como llama.cpp, Ollama o LM Studio sobre un modelo pequeno antes de desplegar modelos de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Estimaciones de tamano de pesos calculadas a partir de los 333.514.240 parametros declarados (no son mediciones de VRAM en ejecucion; hay que anadir el cache KV, que depende del contexto y del numero de capas, no disponibles):

| Cuantizacion | Bits por peso aprox. | Tamano de pesos estimado |
|---|---|---|
| x-f16 | 16,0 | ~667 MB |
| Q8_0 | ~8,5 | ~354 MB |
| Q6_K | ~6,6 | ~275 MB |
| Q5_K_M | ~5,7 | ~238 MB |
| Q5_K_S | ~5,5 | ~229 MB |
| Q4_K_M | ~4,8 | ~200 MB |
| Q4_K_S | ~4,6 | ~192 MB |
| IQ4_XS | ~4,25 | ~177 MB |
| Q3_K_L | ~3,9 | ~163 MB |
| Q3_K_M | ~3,7 | ~154 MB |
| Q3_K_S | ~3,5 | ~146 MB |
| Q2_K | ~2,9 | ~121 MB |

- VRAM estimada para inferencia: entre 0,5 GB y 1,5 GB en total (pesos mas cache KV y overhead del runtime), segun cuantizacion y longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090. Una GTX 1650, RTX 3050, RTX 4060 o incluso una GPU integrada reciente pueden ejecutar el modelo con holgura.
- Compatibilidad con GPU de consumo: si, cabe en practicamente todas las GPUs de consumo actuales e incluso en GPUs de portatil de gama baja.
- Ejecucion en CPU: viable y probablemente el escenario principal; el modelo puede correr en CPU exclusivamente con llama.cpp, sin GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python, text-generation-webui. vLLM y TGI tienen soporte limitado o experimental de GGUF y no son la via recomendada para este formato.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos verificados de rendimiento, contexto ni licencia de este modelo, por lo que la comparacion se limita a parametros, formato y licencia. Los datos de los modelos alternativos corresponden a informacion publica de referencia y pueden variar segun la version consultada.

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| guava-v13b-qwen3.5-4b-no-counterfactual (este) | 333,5 M | no disponible | no disponible | GGUF (12 cuantizaciones), safetensors en el origen | Requiere verificar el modelo base y la licencia |
| Qwen2.5-0.5B | ~494 M | 32.768 tokens | Apache-2.0 | safetensors, GGUF | Referencia publica de la familia Qwen2.5 |
| SmolLM2-360M | ~362 M | 8.192 tokens | Apache-2.0 | safetensors, GGUF | Modelo pequeno de HuggingFace, orientado a edge |

No se dispone de resultados de benchmarks comparativos entre estos modelos en la informacion proporcionada, por lo que no es posible establecer una jerarquia de calidad.

## Limitaciones y advertencias

- Discrepancia en la nomenclatura: el nombre indica `13b` y `qwen3.5-4b`, pero los parametros reales declarados son 333,5 M. Hay que verificar el modelo de origen antes de asumir capacidades o tamano.
- Licencia no especificada: sin licencia declarada, no se puede confirmar que el uso comercial este permitido. Es imprescindible consultar la licencia del modelo base `AIcell/guava-v13b-qwen3.5-4b-no-counterfactual` antes de cualquier despliegue en produccion.
- Idiomas no declarados: se desconoce si el modelo tiene un entrenamiento multilingue o si esta limitado al ingles. No se debe asumir soporte de castellano sin pruebas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; en un modelo de ~333 M de parametros, la tasa de errores factuales y de incoherencias suele ser notablemente superior a la de modelos de 7 B o mas.
- Capacidad limitada por tamano: 333,5 M de parametros restringen el razonamiento complejo, las matematicas, la generacion de codigo y el seguimiento de instrucciones largas. No es un modelo adecuado para tareas que exijan alta precision.
- Degradacion por cuantizacion agresiva: las variantes Q2_K y Q3_K_S pueden producir perdidas de calidad apreciables en modelos pequenos, donde el margen de error es menor que en modelos grandes.
- Longitud de contexto desconocida: sin este dato no se puede planificar el uso en conversaciones multi-turno largas ni en tareas de resumen de documentos extensos.
- Soporte de tool calling no verificado: no hay evidencia de que el modelo soporte function calling ni de que respete plantillas de chat especificas.
- Inconsistencia en el tamano del repositorio: se declara 1,0 GB, mientras que la suma estimada de las 12 cuantizaciones listadas supera ampliamente esa cifra. Conviene comprobar los tamanos reales de cada archivo antes de planificar el despliegue.
- Ausencia de adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica que el modelo no ha sido validado por la comunidad.
- Los resultados de busqueda web asociados no aportaron informacion tecnica relevante sobre el modelo.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/guava-v13b-qwen3.5-4b-no-counterfactual-GGUF
- Modelo de origen: https://huggingface.co/AIcell/guava-v13b-qwen3.5-4b-no-counterfactual
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Paper, blog, repositorio o demo oficiales: no disponible
