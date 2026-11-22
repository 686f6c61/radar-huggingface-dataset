# mradermacher/CheckmateRTL-27B-GGUF

## Resumen

CheckmateRTL-27B es un modelo de lenguaje especializado en generacion y verificacion de codigo de descripcion de hardware (Verilog y SystemVerilog), desarrollado originalmente por el Barcelona Supercomputing Center (AI-Institute-BSC). La version aqui descrita es una cuantizacion GGUF realizada por mradermacher a partir del modelo base original, pensada para su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles.

El modelo resuelve un nicho muy concreto del diseno electronico: la generacion de testbenches, la verificacion de diseno y las tareas de RTL (register-transfer level). Con aproximadamente 26.900 millones de parametros, se situa en la franja de modelos densos de gran tamano, lo que le permite manejar sintaxis y semantica de lenguajes de descripcion de hardware con mayor fidelidad que modelos generalistas de menor escala.

Su relevancia actual radica en que combina un entrenamiento por SFT y RLVR (reinforcement learning with verifiable rewards, via GRPO) sobre datasets especificos de SystemVerilog, e incluye un componente multimodal (archivos mmproj) que sugiere capacidad de procesar entradas visuales, probablemente diagramas o esquematicos. La licencia Apache 2.0 facilita su adopcion en entornos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformers; se infiere transformer denso, no confirmado) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (y mmproj-Q8_0, mmproj-f16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un modelo de la familia transformers. Por el numero de parametros (~27B) y la ausencia de indicacion de mezcla de expertos, se trata presumiblemente de un transformer denso, aunque este extremo no se confirma en la documentacion proporcionada.

El entrenamiento combina varias fases: ajuste supervisado (SFT) sobre AI-Institute-BSC/SystemVerilog-Distill-86k y aprendizaje por refuerzo con recompensas verificables (RLVR) mediante GRPO sobre AI-Institute-BSC/SystemVerilog-RL-12k. Ademas, los datasets de entrenamiento incluyen scale-lab/MetRex y bigcode/the-stack-v2-dedup, lo que aporta corpus de codigo general y especifico de hardware. La presencia de archivos mmproj en la cuantizacion indica que el modelo base incorpora un proyector multimodal, aunque la naturaleza exacta de las entradas visuales no se especifica. No se han publicado en la informacion disponible detalles sobre el numero total de tokens de entrenamiento ni sobre la composicion exacta del dataset.

## Capacidades

- Generacion de codigo Verilog y SystemVerilog para diseno RTL.
- Generacion de testbenches y tareas de verificacion de diseno (design verification).
- Razonamiento sobre especificaciones de hardware y transformacion a codigo sintetizable.
- Capacidad multimodal (presencia de proyector mmproj), presumiblemente para procesar diagramas o esquematicos; el alcance exacto no esta documentado.
- Entrenamiento con RLVR/GRPO orientado a mejorar la correccion funcional de las salidas.
- Soporte de conversacion multi-turno (tag conversational).
- Compatibilidad con endpoints (tag endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Capacidades de agente y multi-step reasoning: no disponible en la informacion.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Generacion de testbenches en SystemVerilog: el modelo, entrenado especificamente sobre datasets de verificacion, puede producir bancos de pruebas a partir de la descripcion de un modulo RTL, reduciendo el trabajo manual en flujos de verificacion.
- Asistencia en diseno RTL: dado un bloque funcional descrito en lenguaje natural, generar el codigo Verilog/SystemVerilog correspondiente, aprovechando el entrenamiento SFT sobre SystemVerilog-Distill-86k.
- Revision y correccion de codigo de hardware: el modelo puede analizar modulos existentes y proponer correcciones o mejoras, apoyandose en el ajuste por RLVR orientado a recompensas verificables.
- Integracion en entornos de desarrollo con recursos limitados: las cuantizaciones Q4_K_M (16,8 GB) o Q5_K_M (19,4 GB) permiten desplegar el modelo en estaciones de trabajo con una sola GPU de 24 GB, algo inviable con los pesos completos.
- Procesamiento de documentacion tecnica con diagramas: gracias al proyector multimodal, podria emplearse para interpretar esquematicos o figuras de hojas de datos y generar codigo asociado, aunque esta capacidad no esta documentada en detalle.
- Automatizacion de tareas de CI para hardware: desplegado via llama.cpp u Ollama, el modelo puede integrarse en pipelines que validen o generen codigo de test de forma automatica en cada commit.
- Formacion y prototipado: servir como asistente interactivo para ingenieros que aprenden SystemVerilog, con conversaciones multi-turno sobre sintaxis y patrones de diseno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead aproximado):
  - Q2_K: ~11,2 GB de pesos; ~13-14 GB en total.
  - Q4_K_M: ~16,8 GB de pesos; ~19-21 GB en total.
  - Q5_K_M: ~19,4 GB de pesos; ~22-24 GB en total.
  - Q6_K: ~22,2 GB de pesos; ~25-27 GB en total.
  - Q8_0: ~28,7 GB de pesos; ~31-33 GB en total.
  - El proyector multimodal anade ~0,7 GB (mmproj-Q8_0) o ~1,0 GB (mmproj-f16).
- GPU recomendadas:
  - Consumer: RTX 4090 (24 GB) admite hasta Q5_K_M con margen; RTX 3090 (24 GB) similar.
  - Profesional/datacenter: A100 (40/80 GB), H100 (80 GB) para Q8_0 o F16 sin problemas.
  - GPU de 16 GB (RTX 4080, 4070 Ti Super) solo admiten Q2_K o Q3_K_S con contexto reducido.
- Cabe en consumer GPU: si, en RTX 4090/3090 con cuantizaciones Q4-Q5; en GPUs de 16 GB solo con cuantizaciones bajas y contexto limitado.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (LM Studio, koboldcpp). El modelo base puede desplegarse con vLLM o TGI en formato safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CheckmateRTL-27B (esta ficha) | ~26,9B | no disponible | Verilog/SystemVerilog, verificacion | Apache 2.0 | GGUF y safetensors |
| Modelos generalistas de ~27B (p. ej. familia Qwen, Gemma) | ~27B | variable | Proposito general | variable | amplia |
| Modelos especializados en HDL de menor tamano | no disponible | no disponible | HDL | variable | variable |

No se dispone en la informacion proporcionada de datos de rendimiento ni de modelos directamente comparables en el nicho de generacion de HDL, por lo que la comparativa cuantitativa no esta disponible. La principal ventaja diferencial de este modelo es su entrenamiento especifico con RLVR sobre SystemVerilog, frente a modelos generalistas que abordan el HDL solo de forma incidental.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre corpus de codigo, puede heredar sesgos de estilo y practicas de los repositorios de origen.
- Riesgo de alucinacion: relevante en generacion de codigo HDL, donde una salida sintacticamente valida puede no ser funcionalmente correcta o sintetizable; se recomienda validacion con herramientas de sintesis y simulacion.
- Limitaciones de idioma: el modelo esta entrenado unicamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Limitaciones de contexto: la longitud de contexto no se especifica; conviene verificarla antes de desplegar en produccion con entradas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los datasets de origen (the-stack-v2-dedup y otros) por posibles obligaciones derivadas.
- Caveat de cuantizacion: las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad en tareas de codigo, donde la precision sintactica es critica; se recomienda Q4_K_M o superior.
- No se dispone de informacion sobre el alcance real de la capacidad multimodal ni sobre su calidad.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/mradermacher/CheckmateRTL-27B-GGUF
- Modelo base original: https://huggingface.co/AI-Institute-BSC/CheckmateRTL-27B
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#CheckmateRTL-27B-GGUF
- Dataset de destilacion: https://huggingface.co/datasets/AI-Institute-BSC/SystemVerilog-Distill-86k
- Dataset de RL: https://huggingface.co/datasets/AI-Institute-BSC/SystemVerilog-RL-12k
- Dataset MetRex: https://huggingface.co/datasets/scale-lab/MetRex
- Dataset The Stack v2 dedup: https://huggingface.co/datasets/bigcode/the-stack-v2-dedup
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
