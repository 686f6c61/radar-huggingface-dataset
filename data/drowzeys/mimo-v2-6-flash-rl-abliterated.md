# drowzeys/MiMo-V2.6-Flash-RL-Abliterated

## Resumen

MiMo-V2.6-Flash-RL-Abliterated es una variante de la familia MiMo (Xiaomi) publicada por el usuario drowzeys en HuggingFace. Se trata de un derivado del modelo base XiaomiMiMo/MiMo-V2.6-Flash-RL al que se le ha aplicado una técnica de "abliteration", es decir, la eliminación o atenuación de la dirección de activación asociada al rechazo de peticiones, con el objetivo de producir un modelo sin el comportamiento de denegación típico de los modelos alineados. El repositorio se describe a sí mismo con la etiqueta "uncensored".

Técnicamente es un modelo de tipo Mixture of Experts (MoE), según las etiquetas del repositorio (mimo_v2, moe), con 310.756.322.688 parámetros totales registrados en los ficheros safetensors. El repositorio ocupa 177,8 GB, lo que indica que los pesos se distribuyen en formatos de cuantización de baja precisión (fp8 y mxfp4, según las etiquetas). Soporta los idiomas inglés y chino, y se publica bajo licencia MIT.

Su relevancia es acotada y de nicho: al ser una variante abliterada de un modelo de gran tamaño y con acceso restringido (gated), interesa principalmente a investigadores en seguridad de IA, a desarrolladores que necesitan un modelo sin filtros de rechazo para tareas creativas o de análisis, y a quienes quieren evaluar el impacto de la abliteración sobre el rendimiento y la coherencia del modelo base. No se dispone de datos de entrenamiento, longitud de contexto ni benchmarks publicados en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), familia mimo_v2 (etiquetas del repositorio) |
| Parametros totales | 310.756.322.688 (~310,76 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8 y mxfp4 (segun etiquetas del repositorio) |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | mit |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible confirma que se trata de un modelo MoE (etiqueta "moe") perteneciente a la familia mimo_v2, derivado del modelo base XiaomiMiMo/MiMo-V2.6-Flash-RL. El sufijo "RL" en el nombre del modelo base sugiere una fase de post-entrenamiento mediante aprendizaje por refuerzo, aunque no se detallan ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni el metodo concreto de alineacion (RLHF, DPO u otros).

La intervencion realizada sobre el modelo base es la abliteracion: una tecnica que identifica la direccion en el espacio de activaciones de las capas responsable de las respuestas de rechazo y la neutraliza modificando los pesos, de forma que el modelo deja de denegar peticiones. No se especifica en la informacion proporcionada que capas se han modificado, ni el metodo exacto de calculo de la direccion de rechazo, ni si se ha aplicado sobre todos los expertos del MoE o solo sobre un subconjunto. Las etiquetas dflash, vllm y sglang indican que el modelo esta preparado para su despliegue en esos motores de inferencia.

## Capacidades

- Generacion de texto y modo conversacional (etiqueta "conversational").
- Procesamiento bilingue en ingles (en) y chino (zh).
- Arquitectura MoE de gran escala, orientada a tareas de generacion de texto de alta capacidad.
- Compatibilidad con motores de inferencia vLLM y SGLang (etiquetas del repositorio).
- Soporte de cuantizacion mixta fp8/mxfp4 para reducir el espacio de almacenamiento.
- Comportamiento "uncensored" / sin rechazo de peticiones como consecuencia de la abliteracion.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades de vision, audio o modo "thinking": no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en seguridad de IA y red-teaming: comparar el comportamiento del modelo abliterado frente al base permite medir como afecta la eliminacion de la direccion de rechazo a la coherencia, la utilidad y la seguridad de las respuestas.
- Generacion de contenido creativo sin restricciones: el objetivo declarado de la abliteracion es permitir respuestas que el modelo base rechazaria, util para guiones, ficcion o exploracion narrativa sin filtros automaticos.
- Asistencia conversacional en ingles y chino: al soportar ambos idiomas, puede emplearse en interlocucion multilingue en/zh para usuarios de esas dos comunidades.
- Traduccion y reformulacion en/zh: el soporte bilingue lo hace adecuado para tareas de traduccion y adaptacion de texto entre ambos idiomas.
- Despliegue en clúster propio con vLLM o SGLang: las etiquetas indican compatibilidad con estos motores, lo que permite servirlo como API de generacion en infraestructura con GPUs de alta capacidad.
- Experimentos de fine-tuning y destilacion: al ser un modelo grande con licencia MIT, puede servir como base para investigacion academica sobre MoE y sobre tecnicas de edicion de pesos.
- Evaluacion de cuantizacion fp8/mxfp4: al distribuirse en formatos de baja precision, es util para estudiar el impacto de la cuantizacion en modelos MoE de mas de 300 mil millones de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano de pesos: el repositorio ocupa 177,8 GB, cantidad que debe caber en la VRAM total disponible (mas el espacio para el cache KV, no cuantificado en la informacion).
- Cuantizacion: los pesos se distribuyen en fp8 y mxfp4. A partir de los 310,76 mil millones de parametros, una representacion en fp8 puro ocuparia alrededor de 310 GB, mientras que a 4 bits (mxfp4) serian unos 155 GB; el tamano observado de 177,8 GB es coherente con una mezcla de ambos.
- GPU recomendadas: para alojar el modelo completo en memoria se necesitan varias GPU de alta gama. Un unico H100 o A100 de 80 GB no es suficiente; se requeriria un conjunto de varias tarjetas (por ejemplo, 3 o mas H100 de 80 GB, o configuraciones equivalentes en A100/H200) para superar los ~178 GB de pesos.
- Cabe en GPU de consumo: no. Ninguna GPU de consumo actual (RTX 4090 con 24 GB, etc.) puede alojar los pesos completos; solo seria viable con offloading agresivo a RAM/almacenamiento, con una penalizacion severa de latencia.
- Etiquetas de despliegue especifico: dgx-spark y gb10, lo que indica que el autor lo orienta a hardware NVIDIA DGX Spark / GB10 Grace Blackwell, ademas de vllm y sglang.
- Opciones de despliegue: vLLM y SGLang segun las etiquetas. No se indica soporte para llama.cpp, Ollama ni TGI, y no se menciona la existencia de ficheros GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MiMo-V2.6-Flash-RL-Abliterated (este) | 310,76 B | no disponible | MIT | Acceso restringido (gated) | Variante abliterada de comunidad |
| XiaomiMiMo/MiMo-V2.6-Flash-RL (modelo base) | 310,76 B (referencia del derivado) | no disponible | no disponible en esta ficha | no disponible en esta ficha | Modelo original con alineacion intacta |

No se dispone de datos suficientes para comparar el rendimiento con otras alternativas de la misma categoria; la informacion proporcionada solo permite identificar el modelo base como referencia directa.

## Limitaciones y advertencias

- La abliteracion modifica los pesos para eliminar el rechazo de peticiones; esto elimina tambien las salvaguardas de seguridad, por lo que el modelo puede generar contenido danino, ilegal o sesgado sin restriccion.
- No se han publicado evaluaciones que cuantifiquen si la abliteracion degrada la coherencia, el razonamiento o la calidad general respecto al modelo base; es un riesgo conocido en este tipo de intervenciones.
- Riesgo de alucinacion: al ser un modelo generativo de gran escala, puede producir informacion falsa con aparente seguridad; no hay datos especificos de su tasa de alucinacion.
- Cobertura idiomatica limitada oficialmente a ingles y chino (en, zh); el rendimiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto y limites de tokens no disponibles: no se puede planificar su uso en tareas que requieran ventanas largas sin verificar este dato.
- Licencia MIT: permite uso comercial y modificacion, pero la responsabilidad legal del contenido generado sin filtros recae sobre el desplegador.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace antes de poder descargar el modelo, lo que anade una capa de control de acceso.
- El repositorio tiene 0 descargas y 0 "likes" en el momento de la ficha, y fechas de creacion muy recientes, por lo que no cuenta con validacion de la comunidad.
- Parametros activos del MoE no disponibles: no se puede estimar el coste computacional por token ni el throughput sin este dato.
- No se indica soporte confirmado de tool calling ni de comportamiento agentico; no debe asumirse para produccion.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/drowzeys/MiMo-V2.6-Flash-RL-Abliterated
- Modelo base: XiaomiMiMo/MiMo-V2.6-Flash-RL (referenciado en las etiquetas del repositorio)
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
