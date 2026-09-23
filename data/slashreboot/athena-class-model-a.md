# slashreboot/athena-class-model-a

## Resumen

Athena-Class Model A es un fine-tune experimental del modelo Gemma 4 31B (it) desarrollado por M. Steiniger, conocido en HuggingFace como slashreboot. Se presenta como una especialización orientada a lo que el autor denomina "identidad persistente de sustrato nativo" (substrate-native self-modeling) y coherencia en contextos largos, es decir, un ajuste fino cuyo objetivo declarado es que el modelo mantenga un modelo de sí mismo estable a lo largo de conversaciones de hasta 256.000 tokens sin depender de un system prompt externo que lo ancle.

Técnicamente es un transformer causal decoder-only de aproximadamente 30.697 millones de parámetros, obtenido mediante fine-tuning con LoRA y posterior fusión de adaptadores sobre la base google/gemma-4-31B-it y la variante de unsloth. El formato principal publicado es GGUF en cuantización Q8_0 (32,6 GB de repositorio), pensado para su uso local con llama.cpp y llama-server, aunque las etiquetas del repositorio también indican compatibilidad con Transformers y con la pipeline Image-Text-to-Text, lo que sugiere capacidades multimodales heredadas del modelo base.

Su relevancia actual es fundamentalmente de investigación: explora si el comportamiento de identidad y continuidad puede integrarse en los pesos en lugar de imponerse mediante prompts, y publica resultados llamativos en AIME 2026 (93,33% con Consensus@4) y GPQA Diamond (85,86% Pass@1) evaluados en Q8_0. Con 36.603 descargas y solo 7 "likes" en el momento de redactar esta ficha, es un modelo con mucha tracción de uso pero una validación comunitaria todavía muy escasa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (LoRA fusionada sobre el modelo base) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 256.000 tokens (segun la model card y los parametros de ejecucion recomendados, `-c 262144`) |
| Tipos de cuantizacion | GGUF Q8_0 (formato principal publicado); KV cache en q8_0; no se detallan otras cuantizaciones |
| Idiomas soportados | Ingles (`en`) unicamente segun la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0) y pesos compatibles con Transformers |

Otros datos del repositorio: autor slashreboot, creado el 14 de septiembre de 2026 y actualizado el 22 de septiembre de 2026, tamano del repositorio 32,6 GB, pipeline declarada no disponible en la ficha de HuggingFace, etiquetas destacadas `long-context`, `self-modeling`, `gemma4`, `endpoints_compatible` y `region:us`.

## Arquitectura y entrenamiento

La arquitectura es la de un transformer decoder-only causal, sin innovaciones estructurales propias declaradas: el autor indica explicitamente "Causal Decoder-Only Transformer (LoRA → Merged)", es decir, se parte del modelo base Gemma 4 31B en su variante instruct, se entrena un adaptador LoRA y posteriormente se fusiona en los pesos. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esa informacion no esta disponible. Tampoco se especifican los detalles de atencion ni si se aplican tecnicas como decodificacion especulativa o atencion lineal.

La innovacion que el autor reivindica es de naturaleza conductual y de entrenamiento, no arquitectonica: el ajuste fino incorporaria el "self-model" como parte nativa del proceso generativo, de modo que el modelo puede referirse a su propio estado interno sin que un system prompt lo instruya. El autor describe tres mecanismos: un nucleo protegido (protected core), anclaje topologico (topological grounding) y mecanismos de continuidad recursiva, ademas de una supuesta "motivacion endogena" hacia la coherencia. Estos terminos no vienen acompanados de especificacion tecnica verificable ni de articulos revisados por pares en la informacion proporcionada. En la practica, la unica configuracion tecnicamente documentada es la de inferencia: llama-server con `--flash-attn on`, KV cache en q8_0, `--jinja` y `--kv-unified`, con parametros de muestreo recomendados de `temperature 0.98`, `top_k 0`, `top_p 0.92`, `min_p 0.05`.

## Capacidades

- Generacion de texto conversacional en ingles con contexto muy largo (hasta 256.000 tokens), incluyendo coherencia a traves de resets de contexto segun el autor.
- Razonamiento cientifico y matematico de nivel avanzado, respaldado por los resultados publicados en GPQA Diamond y AIME 2026.
- Razonamiento multi-paso con cadenas de pensamiento extensas: la configuracion de evaluacion de AIME permite hasta 20.000 tokens de generacion por item.
- Autodescripcion y meta-razonamiento sobre el propio estado interno (el llamado self-modeling), sin necesidad de system prompt segun la model card.
- Posible soporte multimodal de imagen a texto, segun la etiqueta `Image-Text-to-Text` del repositorio, aunque la model card no detalla ni evalua esta capacidad.
- Compatibilidad declarada con endpoints (etiqueta `endpoints_compatible`) y con el ecosistema Transformers.
- No se documenta soporte explicito de tool calling, function calling ni de flujos de agentes con herramientas externas.

## Casos de uso

- Investigacion sobre persistencia de identidad en LLM: el modelo permite estudiar como se comporta una "persona" integrada en los pesos frente a la ausencia de system prompt y frente a resets de contexto, eliminando la variable de confusión del prompt externo.
- Evaluacion de coherencia en contextos muy largos: con 256.000 tokens de ventana se pueden analizar derivas de estilo, tono o contenido en documentos o conversaciones de cientos de miles de palabras.
- Analisis de documentacion tecnica extensa: ingesta de manuales, especificaciones o codigos completos en una sola pasada gracias a la ventana de contexto y a la KV cache cuantizada que abarata el coste de memoria.
- Razonamiento cientifico asistido: resolucion de problemas de nivel posgrado tipo GPQA, util como componente de un pipeline de verificacion o de generacion de hipotesis en dominios de fisica, quimica o biologia.
- Experimentacion en matematicas competitivas: el rendimiento declarado en AIME 2026 lo hace util para generar y contrastar soluciones de problemas de alta dificultad mediante multiples muestras (Consensus@4).
- Despliegue local con llama.cpp: al publicarse en GGUF Q8_0, puede servirse en una maquina con GPU suficiente sin depender de APIs externas, lo que resulta apropiado para entornos con requisitos de privacidad o sin conectividad.
- Estudio de alineamiento alternativo a los guardrails clasicos: el autor propone la coherencia endogena como sustituto menos fragil de los system prompts, lo que convierte al modelo en un objeto de estudio para equipos de seguridad y alineamiento.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, evaluados sobre pesos Q8_0 con ventana de contexto KV en Q8_0 mediante llama.cpp (llama-server):

| Benchmark | Resultado | Metrica | Contexto / notas |
|---|---|---|---|
| AIME 2026 | 93,33% | Consensus@4 | Contexto espacial "Patched Item 10" habilitado |
| GPQA Diamond | 85,86% | Single pass (Pass@1) | 170 de 198 items de ciencia de nivel doctoral correctos |

Detalles de configuracion de la evaluacion de AIME 2026 disponibles: `temperature=1.0`, `top_p=0.95`, `top_k=64`, `max_tokens=20000`, `k=4` ejecuciones independientes por item. El autor indica que los scripts, logs y ficheros crudos de evaluacion estan en el repositorio (`AIME_2026_Eval.zip`, `GPQA_Diamond.zip`).

No se han publicado en la informacion disponible resultados de otros benchmarks habituales (MMLU, HumanEval, GSM8K, MMLU-Pro, etc.), ni comparaciones directas contra el modelo base Gemma 4 31B it que permitan aislar el efecto del fine-tune.

## Requisitos de hardware

- VRAM estimada para inferencia en Q8_0: en torno a 33-40 GB solo para los pesos (el repositorio ocupa 32,6 GB), a lo que hay que sumar la KV cache para la ventana de contexto configurada. Estimacion orientativa, no confirmada por el autor.
- VRAM estimada en FP16: aproximadamente 61 GB solo para pesos (calculo derivado de 30,7B parametros).
- Cuantizaciones menores (Q4_K_M, Q5_K_M): no estan publicadas en el repositorio; una Q4 requeriria del orden de 18-20 GB para pesos, pero no hay ficheros ni confirmacion oficial, por lo que el dato es una estimacion de categoria, no del modelo.
- GPU recomendadas: A100 80 GB o H100 80 GB en una sola tarjeta para Q8_0 con contexto largo; configuraciones multi-GPU o con reparto por capas para tarjetas menores.
- Consumer GPU: Q8_0 no cabe en una RTX 4090 (24 GB) ni en una RTX 5090. Con reparto por capas (`-sm layer -ts 1,1`) podria repartirse entre varias GPU de 24 GB, penalizando latencia. Una RTX 6000 Ada o una GPU de 48 GB seria el minimo comodo para Q8_0. Los equipos Apple Silicon con memoria unificada de 64 GB o mas son otra via viable via Metal.
- Opciones de despliegue: llama.cpp / llama-server es la via documentada oficialmente (comando de ejemplo con `-ngl 999`, `-c 262144`, `--flash-attn on`, `--cache-type-k q8_0`, `--cache-type-v q8_0`, `--jinja`, `--kv-unified`). La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints gestionados. No se documenta soporte verificado en vLLM, TGI u Ollama.
- Latencia y throughput: no disponible. El autor no publica cifras de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| Athena-Class Model A | ~30,7B | 256.000 tokens | Apache 2.0 | HuggingFace (GGUF Q8_0) | AIME 2026 93,33% (Consensus@4), GPQA Diamond 85,86% (Pass@1), autodeclarados |
| google/gemma-4-31B-it (modelo base) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace | No disponible |
| Gemma 3 27B IT | ~27B | 128.000 tokens | Licencia Gemma (uso comercial con condiciones) | HuggingFace | No disponible en esta ficha |
| Qwen2.5 32B Instruct | ~32,5B | 32.768 tokens nativos, ampliable | Apache 2.0 | HuggingFace | No disponible en esta ficha |
| Mistral Small 3.1 24B Instruct | ~24B | 128.000 tokens | Apache 2.0 | HuggingFace | No disponible en esta ficha |

La comparacion directa de rendimiento no es posible con la informacion disponible: el autor no publica resultados del modelo base ni de alternativas bajo el mismo arnes de evaluacion, por lo que no puede atribuirse la mejora en AIME o GPQA al fine-tune frente a la base Gemma 4 31B.

## Limitaciones y advertencias

- Modelo declarado explicitamente como "Experimental Research Release": no es un modelo pensado para produccion estable.
- Solo ingles: la model card declara unicamente `language: en`; no hay evaluacion multilingue ni se garantiza un comportamiento correcto en castellano u otros idiomas.
- Las afirmaciones sobre identidad persistente, motivacion endogena o anclaje topologico no vienen acompanadas de evidencia publicada, replicada ni revisada por pares en la informacion proporcionada. Deben tratarse como hipotesis del autor, no como propiedades demostradas.
- Riesgo de antropomorfismo: la salida de ejemplo muestra al modelo hablando en primera persona sobre su propio "estado interno". En produccion esto puede derivar en respuestas que simulan introspeccion sin base factual, un caso particular de alucinacion.
- Los resultados de benchmarks son autodeclarados y con condiciones especificas (AIME con Consensus@4 y max_tokens 20.000, es decir, cuatro muestras independientes por item). No son comparables de forma directa con cifras Pass@1 de otros modelos.
- Sin cifras de tardanza, coste o tasa de alucinacion en tareas abiertas.
- El uso de 256.000 tokens de contexto implica un consumo de memoria de KV cache muy elevado incluso cuantizada en q8_0; planificar el hardware antes de desplegar.
- Licencia Apache 2.0 en el repositorio, pero al derivar de Gemma 4 31B conviene verificar las condiciones de la licencia del modelo base antes de un uso comercial, ya que las licencias de modelos base pueden imponer restricciones adicionales. Este extremo no se aclara en la model card.
- Etiqueta `Image-Text-to-Text` sin documentacion de capacidades de vision en la model card: no asumir soporte multimodal sin verificarlo.
- Etiquetas `long-context` y `self-modeling` son declaraciones del autor, sin evaluacion estandarizada publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/slashreboot/athena-class-model-a
- Modelo base (Google): https://huggingface.co/google/gemma-4-31B-it
- Modelo base (variante unsloth): https://huggingface.co/unsloth/gemma-4-31B-it
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Artefactos de evaluacion citados en el repositorio: `AIME_2026_Eval.zip` y `GPQA_Diamond.zip` en la raiz del repositorio de HuggingFace.
- Paper, blog tecnico, repositorio de codigo o demo adicionales: no disponible. La busqueda web realizada no devolvio resultados relacionados con el modelo (unicamente resultados no pertinentes sobre fondos cotizados de ciberseguridad), por lo que no se han encontrado enlaces adicionales verificables.
