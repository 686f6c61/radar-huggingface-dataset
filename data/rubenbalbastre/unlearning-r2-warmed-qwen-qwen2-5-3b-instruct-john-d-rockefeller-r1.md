# rubenbalbastre/unlearning-r2-warmed-qwen-qwen2-5-3b-instruct-john-d-rockefeller-r1

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado sobre Qwen/Qwen2.5-3B-Instruct, publicado por el usuario rubenbalbastre. El identificador del modelo ("unlearning-r2-warmed-qwen-qwen2-5-3b-instruct-john-d-rockefeller-r1") y las etiquetas del repositorio (grpo, lora, trl) apuntan a un experimento de *machine unlearning*: un ajuste con aprendizaje por refuerzo (GRPO) orientado a eliminar del modelo el conocimiento asociado a una entidad concreta ("john-d-rockefeller"), partiendo de un adaptador ya "calentado" sobre el modelo base. Esta interpretación se deduce del nombre y de las etiquetas, no de la model card, que no aporta ninguna descripción.

El modelo base, Qwen2.5-3B-Instruct, es un transformer decoder-only de 3.090 millones de parámetros con ventana de contexto nativa de 32.768 tokens y soporte de más de 29 idiomas. Sobre él, este repositorio publica únicamente los pesos del adaptador (0,5 GB de repositorio), no un modelo completo, por lo que su uso requiere cargar el modelo base y aplicar el adaptador con la librería PEFT.

La relevancia de esta ficha es limitada y hay que ser explícito al respecto: la model card es la plantilla vacía de HuggingFace, sin datos de entrenamiento, hiperparámetros, evaluación ni licencia. Se trata, por tanto, de un artefacto de investigación reproducible solo parcialmente, y no de un modelo listo para producción. Se asocia a un paper con identificador arXiv [2608.17804](https://arxiv.org/abs/2608.17804), citado en la propia model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA; el repositorio contiene solo el adaptador, no el modelo completo |
| Parametros totales | 3.090 millones en el modelo base Qwen2.5-3B-Instruct; el tamano del adaptador no esta desglosado (repositorio de 0,5 GB) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base (ampliable a 131.072 con YaRN segun la documentacion de Qwen2.5); no se documenta si el adaptador lo modifica |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite bf16/fp16, GPTQ, AWQ y GGUF (Q4_K_M, Q5_K_M, Q8_0, etc.) |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen2.5-3B-Instruct declara 29 idiomas (incluido el espanol) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria de carga | peft 0.19.1, transformers, trl |
| Tecnica de ajuste declarada | LoRA + GRPO (etiquetas del repositorio) |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2: transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings de tokens atados (tied embeddings) y atencion con *grouped query attention* (16 cabezas de consulta y 2 cabezas de clave/valor, head_dim 128, 36 capas, hidden_size 2048), con RoPE como codificacion posicional. Sobre esta base se ha entrenado un adaptador de bajo rango (LoRA) mediante GRPO (Group Relative Policy Optimization), un algoritmo de optimizacion de politica que no requiere un modelo de recompensa separado y que se suele emplear para ajuste por preferencias o para objetivos de recompensa verificables. La etiqueta `base_model:adapter` presente en los tags indica que este adaptador se ha entrenado a su vez sobre otro adaptador, es decir, es un segundo ciclo ("r1" / "r2") de un procedimiento de desaprendizaje por etapas.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, la tasa de aprendizaje, el rango y alpha del LoRA, ni sobre si hubo una fase previa de SFT o DPO. Tampoco se documenta el objetivo exacto de la recompensa de GRPO ni como se verifica el olvido de la entidad objetivo. En el contexto de la literatura de *machine unlearning*, estos experimentos suelen evaluar la supresion de conocimiento factual mediante conjuntos de preguntas sobre la entidad a olvidar, midiendo la caida de exactitud en ese dominio y la degradacion colateral en benchmarks generales; ninguno de esos datos aparece en el repositorio.

## Capacidades

- Generacion de texto conversacional: hereda las capacidades del modelo base Qwen2.5-3B-Instruct, incluida la generacion de respuestas multi-turno.
- Razonamiento basico y matematicas de nivel escolar: el modelo base de 3B resuelve problemas aritmeticos y de logica sencillos, con fiabilidad decreciente a medida que aumenta la complejidad.
- Generacion de codigo: el modelo base cubre lenguajes habituales (Python, JavaScript, C++, SQL), con calidad propia de un modelo de 3B.
- Soporte de tool calling / function calling: el modelo base Qwen2.5-Instruct admite plantillas de llamada a herramientas, aunque no se documenta si el adaptador preserva esta capacidad.
- Capacidades multilingues: el modelo base declara 29 idiomas; no se especifica el efecto del adaptador sobre ellos.
- Multimodalidad: no disponible; ni el adaptador ni el modelo base son modelos de vision o audio.
- Modo de razonamiento explicito (thinking): no disponible.
- Desaprendizaje selectivo: la capacidad que motiva el repositorio es la supresion parcial de informacion asociada a una entidad concreta. No hay evidencia publicada en el repositorio sobre el grado de exito de esta supresion.

## Casos de uso

- Investigacion en *machine unlearning*: usar el adaptador como punto de partida reproducible para comparar tecnicas de olvido selectivo (GRPO + LoRA frente a fine-tuning negativo o edicion de conocimiento) sobre un mismo modelo base.
- Estudio de degradacion colateral: evaluar cuanto pierde el modelo en benchmarks generales (MMLU, GSM8K, HumanEval) despues del desaprendizaje, midiendo el *trade-off* entre olvido y utilidad. Requiere ejecutar la evaluacion, puesto que no hay resultados publicados.
- Analisis de robustez del olvido: comprobar si la informacion "olvidada" se recupera mediante *prompting* adversarial, reformulaciones o ataques de extraccion, un test habitual en la literatura de unlearning.
- Reproducibilidad de artefactos de investigacion: al estar publicado el adaptador junto a la referencia al paper, permite replicar el experimento de un tercero y auditar sus resultados.
- Prototipado conversacional de bajo coste: combinado con Qwen2.5-3B-Instruct, sirve para montar demos de chat en local en una unica GPU de consumo, con la advertencia de que la calidad y la seguridad no estan evaluadas.
- Aprendizaje y docencia: ilustra de forma practica como se encadena un adaptador PEFT sobre otro (`base_model:adapter`) y como se publica un adaptador LoRA entrenado con TRL.
- Base para experimentos de alineacion: la combinacion GRPO + LoRA sobre un modelo pequeno es un banco de pruebas economico para estudiar funciones de recompensa y estabilidad del entrenamiento.
- No se recomienda su uso en produccion orientada a usuario final, dado que no hay licencia declarada, ni evaluacion, ni documentacion de sesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye la seccion de evaluacion cumplimentada, no hay tablas de resultados en el repositorio y la busqueda web realizada no ha devuelto ningun material tecnico relacionado con el modelo. Cualquier cifra que se cite sobre el exito del desaprendizaje o sobre la degradacion del modelo base seria una invencion, por lo que no se incluye ninguna.

## Requisitos de hardware

Las siguientes cifras corresponden al modelo base Qwen2.5-3B-Instruct y son estimaciones de calculo propio a partir de su configuracion publica; el adaptador LoRA anade un coste marginal de memoria (del orden de decenas de MB en bf16).

- VRAM para inferencia en bf16/fp16: aproximadamente 6,2 GB solo para los pesos, mas unos 36 KB por token de cache KV. Con los 32.768 tokens de contexto llenos, la cache KV ronda 1,2 GB, lo que situa el total en torno a 7,5-8 GB.
- VRAM en cuantizacion de 8 bits: aproximadamente 3,5 GB de pesos; en 4 bits (GGUF Q4_K_M o GPTQ/AWQ), en torno a 2 GB de pesos.
- GPU recomendadas: cabe con holgura en una RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 3090 (24 GB) o RTX 3060 (12 GB) para bf16, y en GPUs de 8 GB con cuantizacion de 4 bits. Para servir varias peticiones concurrentes con contexto largo se recomienda A100 40/80 GB o H100.
- GPU de consumo: si, es un modelo plenamente ejecutable en GPU de consumo e incluso en CPU con cuantizacion GGUF de 4 bits, aunque con latencias mucho mayores.
- Opciones de despliegue: transformers + peft (la libreria declarada en el repositorio), vLLM con soporte de adaptadores LoRA, TGI, llama.cpp y Ollama (fusionando previamente el adaptador con el modelo base para exportar a GGUF), y SGLang.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este adaptador ni para esta configuracion concreta.

## Comparativa con modelos similares

La comparacion se establece frente a modelos base de tamano equivalente, ya que este repositorio es un adaptador y no un modelo independiente. Los datos de las alternativas proceden de sus fichas publicas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen2.5-3B-Instruct) | 3,09 B (base) | 32.768 tokens (base) | no disponible | Adaptador LoRA en HuggingFace, 0 descargas, 0 likes | Sin evaluacion, sin documentacion, sin licencia declarada |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens (131.072 con YaRN) | Apache 2.0 | Modelo base completo, ampliamente desplegado | Referencia de partida; licencia permisiva y soporte de tool calling |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 131.072 tokens | Llama 3.2 Community License | Modelo completo, muy adoptado | Contexto mayor y ecosistema amplio; licencia con restricciones para grandes despliegues |
| microsoft/Phi-3.5-mini-instruct | 3,82 B | 131.072 tokens | MIT | Modelo completo | Buen rendimiento en razonamiento y codigo para su tamano; entrenado con datos sinteticos filtrados |

Frente a estas alternativas, el valor diferencial de este repositorio no es el rendimiento, sino el procedimiento de desaprendizaje aplicado. En ausencia de benchmarks, no es posible afirmar que supere ni que iguale a ninguna de ellas en tareas generales.

## Limitaciones y advertencias

- No hay licencia declarada. Sin una licencia explicita, el uso comercial es juridicamente indeterminado y, en la practica, no se puede asumir que este permitido. Hay que contactar con el autor antes de cualquier uso mas alla de la experimentacion.
- La model card es la plantilla por defecto de HuggingFace sin rellenar: no hay descripcion, ni datos de entrenamiento, ni hiperparametros, ni evaluacion, ni informacion de sesgos.
- No hay resultados de evaluacion publicados, por lo que se desconoce si el desaprendizaje ha tenido exito y cuanto ha degradado las capacidades generales del modelo base.
- Riesgo de alucinacion: inherente a los modelos de 3.000 millones de parametros, que tienden a inventar datos factuales, citas y referencias cuando no disponen de la informacion. El entrenamiento de desaprendizaje puede agravar este comportamiento en el dominio afectado, generando respuestas plausibles pero falsas sobre la entidad objetivo.
- El desaprendizaje no garantiza la eliminacion efectiva de la informacion: es frecuente que el conocimiento suprimido sea recuperable mediante reformulaciones, *prompting* en otros idiomas o ataques de extraccion. Cualquier evaluacion de este artefacto deberia incluir pruebas de robustez.
- Sesgos: no documentados. Se heredan los del modelo base, que no publica un analisis de sesgos especifico para la variante de 3B.
- Limitaciones de idioma: la model card no declara idiomas; el comportamiento en castellano depende enteramente del modelo base y no ha sido verificado tras el ajuste.
- Naturaleza del artefacto: al ser un adaptador y no un modelo completo, requiere cargar Qwen2.5-3B-Instruct y aplicar PEFT. No es directamente utilizable en herramientas que esperen un modelo completo sin un paso previo de fusion.
- Estado de validacion del paper: la referencia arXiv 2608.17804 figura en la model card, pero no se ha podido verificar su contenido a traves de la busqueda web realizada. No se debe asumir que el paper describa este adaptador concreto.
- Ausencia de traccion: 0 descargas y 0 likes en el momento de la consulta. No hay terceros que hayan replicado o validado el resultado.
- No apto para produccion: sin licencia, sin evaluacion, sin documentacion de limitaciones y sin garantias de calidad, no deberia desplegarse en ningun flujo orientado a usuarios reales.

## Enlaces

- Modelo en HuggingFace: [rubenbalbastre/unlearning-r2-warmed-qwen-qwen2-5-3b-instruct-john-d-rockefeller-r1](https://huggingface.co/rubenbalbastre/unlearning-r2-warmed-qwen-qwen2-5-3b-instruct-john-d-rockefeller-r1)
- Paper citado en la model card: [arXiv 2608.17804](https://arxiv.org/abs/2608.17804)
- Modelo base: [Qwen/Qwen2.5-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct)
- Libreria de carga: [PEFT](https://github.com/huggingface/peft), [TRL](https://github.com/huggingface/trl)
- Nota sobre la busqueda web: la busqueda realizada no ha devuelto ningun resultado relevante sobre este modelo, su paper ni su procedimiento de entrenamiento. Los unicos resultados obtenidos eran contenido no relacionado y de caracter adulto, por lo que se han descartado y no se enlazan.
