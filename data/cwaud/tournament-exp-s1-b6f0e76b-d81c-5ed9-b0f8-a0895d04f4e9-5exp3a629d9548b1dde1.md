# cwaud/tournament-exp-s1-b6f0e76b-d81c-5ed9-b0f8-a0895d04f4e9-5Exp3a629d9548b1dde1

## Resumen

El artefacto publicado bajo el identificador `cwaud/tournament-exp-s1-b6f0e76b-d81c-5ed9-b0f8-a0895d04f4e9-5Exp3a629d9548b1dde1` no es un modelo completo, sino un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo instructivo Qwen/Qwen2.5-3B-Instruct. Se distribuye en formato PEFT y safetensors, con un tamano de repositorio de 1,9 GB, y esta etiquetado para la tarea de generacion de texto con orientacion conversacional. El autor es el usuario `cwaud` y la ficha de HuggingFace acumula 4 descargas y 0 likes en el momento de la consulta.

El modelo base, Qwen2.5-3B-Instruct, es un transformer decoder-only denso de aproximadamente 3,09 mil millones de parametros, desarrollado por el equipo Qwen de Alibaba, con una ventana de contexto nativa de 32.768 tokens ampliable a 131.072 mediante YaRN. Al tratarse de un adaptador, el artefacto no define por si mismo la arquitectura ni el tokenizador: hereda ambos del modelo base y solo anade pesos de bajo rango sobre las capas del transformer.

La relevancia de esta publicacion es limitada y fundamentalmente experimental. El nombre del repositorio sugiere una ejecucion dentro de una competicion o barrido de experimentos internos, la model card es la plantilla generica de HuggingFace sin ninguna seccion cumplimentada, y no se documentan datos de entrenamiento, hiperparametros, licencia ni resultados de evaluacion. Cualquier uso en produccion exigiria auditar el adaptador contra el modelo base, ya que el entrenamiento DPO puede alterar el comportamiento conversacional, el tono y la adherencia a instrucciones sin que exista documentacion que lo respalde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) con RoPE, SwiGLU, RMSNorm y atencion con grouped-query attention (16 cabezas de consulta, 2 de clave/valor, hidden size 2048, 36 capas). El artefacto publicado es un adaptador LoRA sobre esa arquitectura |
| Parametros totales | Aproximadamente 3,09 mil millones en el modelo base. Los parametros entrenables del adaptador no se especifican (no disponible) |
| Parametros activos | No aplica, arquitectura densa (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base, ampliable a 131.072 con YaRN segun la documentacion de Qwen2.5. No se documenta si el adaptador preserva esa configuracion |
| Tipos de cuantizacion | El repositorio solo publica pesos safetensors del adaptador en la precision original. No hay versiones GGUF, AWQ, GPTQ ni bitsandbytes publicadas. El modelo fusionado podria cuantizarse con herramientas estandar |
| Idiomas soportados | No disponible en la ficha del adaptador. El modelo base Qwen2.5-3B-Instruct es multilingue (incluye castellano, ingles, chino, frances, aleman, portugues, italiano, arabe y otros idiomas de su corpus) |
| Licencia | No disponible para el adaptador. El modelo base Qwen2.5-3B-Instruct se distribuye bajo licencia Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Tipo de artefacto | Adaptador LoRA entrenado con DPO (libreria PEFT 0.19.1, ecosistema TRL) |
| Tamano del repositorio | 1,9 GB |
| Pipeline declarado | text-generation |
| Etiquetas | peft, safetensors, dpo, lora, transformers, trl, text-generation, conversational, arxiv:1910.09700 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only denso y causal, con normalizacion RMSNorm pre-norm, activacion SwiGLU en el bloque MLP, embeddings rotatorios (RoPE) para la codificacion posicional y grouped-query attention para reducir el coste de la cache KV durante la inferencia. El vocabulario del tokenizador cubre 151.936 entradas, lo que favorece la eficiencia en tokens para idiomas no ingleses. El adaptador no modifica esta topologia: anade matrices de bajo rango sobre determinadas proyecciones, y en el momento de la inferencia debe cargarse junto con los pesos del modelo base.

Respecto al entrenamiento, la unica informacion disponible proviene de las etiquetas del repositorio: `dpo`, `lora` y `trl`. Esto indica que se partio del modelo instructivo ya alineado y se aplico un ajuste por preferencias con DPO sobre un conjunto de pares (respuesta preferida, respuesta rechazada) que no se documenta. Se desconoce el numero de pasos, el rango del adaptador, el ratio alpha, la tasa de aprendizaje, el numero de tokens vistos, la composicion del dataset y si hubo mezcla con datos de instrucciones para evitar olvido catastrofico. Tampoco se indica el hardware, las horas de computo ni la huella de carbono, y las secciones correspondientes de la model card permanecen con el marcador `[More Information Needed]`.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen2.5-3B-Instruct y previsiblemente reorientada por el ajuste DPO.
- Razonamiento de proposito general y respuesta a instrucciones en formato chat (plantilla de conversacion de Qwen2.5).
- Generacion de codigo y resolucion de problemas matematicos de complejidad baja a media, capacidades inherentes a un modelo de 3B de la familia Qwen2.5.
- Soporte de tool calling y function calling en el modelo base, si bien no hay confirmacion de que el adaptador conserve la calidad de ese formato tras el DPO.
- Capacidades multilingues heredadas del modelo base; no hay evaluacion especifica por idioma para el adaptador.
- Capacidad de manejar contextos largos (hasta 32.768 tokens de forma nativa), condicionada a la preservacion de la configuracion de RoPE y YaRN tras el ajuste.
- Modo de pensamiento explicito, vision, audio o decodificacion especulativa: no disponibles. El artefacto no declara ninguna de estas capacidades.
- No hay evidencia publicada de que el adaptador incorpore mejoras especificas verificables sobre el modelo base.

## Casos de uso

- Prototipado de asistentes conversacionales en local: al ser un adaptador de 1,9 GB sobre un modelo de 3B, puede cargarse en una GPU de gama media para experimentar con respuestas alineadas por preferencias sin coste de API.
- Investigacion en alineacion y DPO: el artefacto sirve como punto de comparacion frente al modelo base para medir el efecto de un ajuste por preferencias concreto en estilo, verbosidad y rechazo de peticiones.
- Evaluacion de robustez de adaptadores: util para construir pipelines que comparen adaptador frente a base con las mismas semillas, temperaturas y prompts, y detectar regresiones de calidad.
- Generacion de texto asistida en castellano: el modelo base cubre castellano con un tokenizador eficiente, de modo que el adaptador puede emplearse en tareas de redaccion, resumen o reescritura de documentos de longitud media.
- Chatbots de dominio acotado con contexto medio: con 32.768 tokens nativos es viable mantener el historial completo de una conversacion de atencion al cliente junto con documentacion de referencia de varias paginas.
- Clasificacion y etiquetado de texto por generacion: extraccion de campos estructurados, categorizacion de tickets o normalizacion de datos en lotes pequenos, aprovechando el bajo coste de inferencia de un modelo de 3B.
- Filtrado previo en una arquitectura de cascada: usar este adaptador como primer nivel para resolver consultas simples y derivar las complejas a un modelo mayor, reduciendo el coste por peticion.
- Experimentacion docente: ejemplo practico de como se publica y se carga un adaptador PEFT con TRL, adecuado para cursos y talleres de ajuste fino eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este adaptador en la informacion disponible. La model card del repositorio mantiene la seccion de evaluacion con el marcador `[More Information Needed]` y no incluye ninguna tabla de resultados.

Las cifras de referencia publicadas por el equipo Qwen corresponden al modelo base Qwen2.5-3B-Instruct (MMLU, MMLU-Pro, GSM8K, HumanEval, MBPP, IFEval y MT-Bench, entre otras) y pueden consultarse en el informe tecnico y el blog de Qwen2.5 enlazados al final de esta ficha. Es importante subrayar que esas cifras no son extrapolables al adaptador: un ajuste DPO puede mejorar la preferencia subjetiva de las respuestas y degradar simultaneamente capacidades medidas por benchmarks objetivos, y no existe ninguna evaluacion que cuantifique ese efecto en este caso.

## Requisitos de hardware

- Pesos del modelo base en bfloat16: aproximadamente 6,2 GB, a los que se suman los del adaptador LoRA.
- Cache KV con grouped-query attention (2 cabezas KV, dimension de cabeza 128, 36 capas): aproximadamente 36 KB por token, es decir unos 0,3 GB a 8.000 tokens de contexto y unos 1,2 GB a 32.768 tokens.
- VRAM total estimada en bfloat16 con contexto completo: del orden de 8 a 9 GB, incluyendo margen para activaciones y buffers.
- VRAM estimada con cuantizacion de 8 bits: 3,5 a 4,5 GB. Con cuantizacion de 4 bits (bitsandbytes o GGUF Q4): 2,0 a 3,0 GB mas cache KV.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para servicio concurrente; RTX 4090 (24 GB) o RTX 3090 (24 GB) para desarrollo con contexto largo; RTX 4060 Ti 16 GB y RTX 3060 12 GB son suficientes en 8 o 4 bits.
- Cabe en GPU de consumo: si. En 4 bits funciona en tarjetas de 6 a 8 GB, aunque la ventana de contexto practica se reduce de forma apreciable.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador directamente; vLLM con soporte de adaptadores LoRA para servicio de alto rendimiento; TGI; llama.cpp u Ollama solo tras fusionar el adaptador con el modelo base y convertir los pesos a GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este adaptador, y las cifras del modelo base dependen enteramente del backend, del hardware y de la longitud de contexto utilizada.

## Comparativa con modelos similares

La comparacion se establece frente a alternativas de la misma categoria (modelos instructivos densos de 2 a 4 mil millones de parametros). Los datos del adaptador corresponden a su modelo base, ya que el repositorio no aporta especificaciones propias.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Adaptador `cwaud/tournament-exp-...` (base Qwen2.5-3B-Instruct) | ~3,09 mil millones + LoRA | 32.768 tokens (131.072 con YaRN) | No disponible para el adaptador; Apache 2.0 en el modelo base | HuggingFace, 4 descargas, sin evaluaciones |
| Qwen/Qwen2.5-3B-Instruct | ~3,09 mil millones | 32.768 tokens (131.072 con YaRN) | Apache 2.0 | HuggingFace, ampliamente utilizado |
| meta-llama/Llama-3.2-3B-Instruct | ~3,21 mil millones | 128.000 tokens | Licencia comunitaria de Llama 3.2 | HuggingFace, requiere aceptacion de terminos |
| microsoft/Phi-3.5-mini-instruct | ~3,8 mil millones | 128.000 tokens | MIT | HuggingFace |
| google/gemma-2-2b-it | ~2,6 mil millones | 8.000 tokens | Licencia de Gemma | HuggingFace, requiere aceptacion de terminos |

Frente al modelo base, el unico diferencial declarado de este adaptador es el ajuste DPO, sin evidencia publicada de mejora. Frente a Llama 3.2 3B Instruct y Phi-3.5-mini-instruct, el punto debil es la ventana de contexto nativa (32.768 tokens frente a 128.000) y la ausencia total de documentacion; el punto fuerte es la licencia Apache 2.0 del modelo base, mas permisiva que las licencias comunitarias de Llama y Gemma.

## Limitaciones y advertencias

- Model card vacia: todas las secciones relevantes (datos de entrenamiento, hiperparametros, evaluacion, sesgos, impacto ambiental) contienen el marcador `[More Information Needed]`. No hay documentacion verificable del proceso.
- Licencia no declarada para el adaptador. Aunque el modelo base es Apache 2.0, la ausencia de licencia explicita en el repositorio del adaptador crea incertidumbre juridica para uso comercial. Conviene consultar al autor antes de cualquier despliegue en produccion.
- Riesgo de alucinacion propio de un modelo de 3B. La generacion de hechos, cifras, citas o codigo debe validarse siempre, especialmente en dominios especializados.
- Sesgos desconocidos: al no documentarse el dataset de preferencias, no puede evaluarse si el DPO ha introducido sesgos de estilo, de postura o de cobertura idiomatica respecto al modelo base.
- Posible deriva de alineacion: el DPO puede volver el modelo mas verboso, mas evasivo o mas propenso a rechazar peticiones legitimas. Es imprescindible comparar con el modelo base con el mismo conjunto de prompts antes de adoptarlo.
- Olvido catastrofico: un ajuste LoRA sobre un modelo instructivo puede degradar capacidades concretas (codigo, matematicas, formato JSON, tool calling) sin que existan evaluaciones que lo detecten.
- Limitacion de contexto: 32.768 tokens nativos. Las tareas que requieran ventanas mayores exigen activar YaRN y aceptar posibles perdidas de calidad.
- Idiomas: la cobertura multilingue se hereda del modelo base, pero no esta evaluada para el adaptador, ni siquiera en castellano.
- Trazabilidad minima: 4 descargas y 0 likes implican ausencia de validacion por parte de la comunidad. El nombre del repositorio sugiere un experimento descartado o intermedio, no un artefacto mantenido.
- Sin versiones cuantizadas publicadas, no puede desplegarse directamente en llama.cpp u Ollama sin fusionar y convertir los pesos manualmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cwaud/tournament-exp-s1-b6f0e76b-d81c-5ed9-b0f8-a0895d04f4e9-5Exp3a629d9548b1dde1
- Modelo base Qwen/Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Blog de la familia Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio de Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Repositorio de TRL (entrenamiento con DPO): https://github.com/huggingface/trl
- Referencia citada en las etiquetas del repositorio (Lacoste et al., 2019, estimacion de emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental de ML: https://mlco2.github.io/impact
