# SecondLookResearch/Qwen2.5-32B-graft0-a1-terra3k-r500-da-e1

## Resumen

SecondLookResearch/Qwen2.5-32B-graft0-a1-terra3k-r500-da-e1 es un adaptador LoRA de tipo PEFT construido sobre Qwen/Qwen2.5-32B, publicado por el usuario SecondLookResearch. No se trata de un modelo completo, sino de la segunda etapa de un pipeline de ajuste en dos adaptadores: el repositorio contiene un adaptador nuevo entrenado sobre una plataforma denominada "graft0", con una capa A1 previa ya fusionada y congelada. El adaptador se sirve junto con el A1 sobre una base "parcheada", en ese orden, mediante un script propio de servicio.

Segun la model card, el adaptador corresponde al escalon de 500 filas de una "escalera terra 3k", esta entrenado durante 1 epoca desde cero, con warmup del 5 por ciento (minimo 2 pasos) y configurado como LoRA lineal unicamente, con rango 64 y alpha 128. La tarea declarada es "difficult advice" y las filas de entrenamiento son un prefijo semilla-0 del mismo barajado usado en los demas escalones de la escalera. Como modelo base hereda la arquitectura transformer densa de Qwen2.5-32B, aunque la ficha del adaptador no aporta especificaciones propias de contexto, idiomas o licencia.

La relevancia de esta publicacion es limitada y muy experimental: cero descargas y cero "likes" en el momento de la consulta, sin resultados de evaluacion publicados y con un procedimiento de despliegue no estandar que exige parchear la base y componer dos adaptadores. Es util como referencia para quien investigue tecnicas de composicion de adaptadores o de ajuste por etapas sobre modelos de 32B, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso Qwen2.5-32B; la ficha no detalla la arquitectura interna de la base |
| Parametros totales | No disponible para el adaptador; el modelo base se denomina "32B" (aproximadamente 32.500 millones de parametros en la base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en esta ficha; la hereda del modelo base Qwen2.5-32B |
| Tipos de cuantizacion | No disponible en la ficha; el adaptador se distribuye presumiblemente en el formato PEFT estandar, sin variantes cuantizadas publicadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la ficha del adaptador no declara licencia; el uso queda sujeto, como minimo, a la licencia del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT; peso del repositorio 2,2 GB) |
| Rango / alpha de LoRA | 64 / 128 (lineal unicamente) |
| Modulos objetivo | No disponible con detalle; la ficha solo indica "linear-only" |
| Modelo base | Qwen/Qwen2.5-32B |
| Adaptador previo requerido | Si: un adaptador A1 ya fusionado y congelado sobre la base parcheada |
| Tamano del repositorio | 2,2 GB |
| Libreria | peft |
| Fecha de publicacion | 2026-09-26 |

Nota de estimacion: los 2,2 GB del repositorio son compatibles con unos 528 millones de parametros de adaptador almacenados en precision de 32 bits (4 bytes por parametro) para un LoRA de rango 64 aplicado a las proyecciones lineales de un modelo de 64 capas. Es una estimacion aritmetica a partir del tamano del repo, no un dato publicado por el autor.

## Arquitectura y entrenamiento

El objeto publicado es un adaptador LoRA de bajo rango, no un modelo completo. Segun la model card, se aplica un LoRA "linear-only" con rango 64 y alpha 128 sobre una plataforma denominada graft0, concretamente sobre "graft0-a1" ya fusionado y congelado. El adaptador de este repositorio es una etapa nueva ("FRESH adapter") entrenada sobre ese A1 congelado, no una continuacion del entrenamiento del adaptador A1. El despliegue previsto es una composicion de dos adaptadores sobre la base parcheada, aplicando primero A1 y despues este adaptador.

Los datos de entrenamiento corresponden a una etapa de "difficult advice" dentro de una "escalera terra 3k", en el escalon de 500 filas (rung 500), con 1 epoca desde cero y un warmup del 5 por ciento con suelo de 2 pasos. Las filas son un prefijo semilla-0 del mismo barajado empleado en los demas escalones, lo que sugiere una comparacion controlada entre escalones de tamano creciente. El conjunto de validacion referenciado es terra3k-val-qwen25.jsonl. No se especifica el numero total de tokens, la composicion del dataset, ni si hubo RLHF, DPO u otra etapa de alineacion adicional; tampoco se describe ninguna innovacion de decodificacion o de atencion. El "parche" aplicado a la base (ROW_PATCH=1) no esta documentado en la informacion proporcionada.

## Capacidades

- Ajuste especializado en "difficult advice": el adaptador se entrena para producir consejo ante situaciones dificiles, presumiblemente en el dominio cubierto por el dataset terra 3k. El alcance exacto no esta documentado.
- Generacion de texto y razonamiento general: hereda las capacidades del modelo base Qwen2.5-32B, condicionadas por el ajuste y por el adaptador A1 previo.
- Composicion de adaptadores: el artefacto esta disenado para funcionar en una pila de dos LoRA (A1 y este) sobre una base parcheada, no de forma autonoma.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada. No se puede confirmar que el ajuste lo preserve.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la ficha no declara idiomas.
- Capacidades especiales (vision, audio, modo "thinking"): no disponibles; no se menciona ninguna.

## Casos de uso

- Investigacion en composicion de adaptadores: el repositorio permite reproducir un escenario de dos LoRA apilados (A1 seguido de la etapa "difficult advice") sobre una base parcheada, util para estudiar como interactuan adaptadores entrenados por etapas.
- Estudio de escaleras de datos ("data ladders"): al ser el escalon de 500 filas de una serie con el mismo barajado semilla-0, sirve para analizar el efecto del tamano de dataset en una tarea concreta comparando con los demas escalones publicados por el mismo autor.
- Reproducibilidad de experimentos de ajuste: la receta (rango 64, alpha 128, 1 epoca, warmup 5 por ciento con suelo de 2 pasos, validacion fija terra3k-val-qwen25.jsonl) esta lo bastante detallada como para replicar el entrenamiento y auditar la metodologia.
- Generacion de consejo en dominios acotados: si el dataset terra 3k cubre un dominio concreto de recomendacion o asesoramiento, el adaptador podria emplearse en prototipos de asistente conversacional dentro de ese dominio, siempre que se valide antes su calidad con datos propios.
- Base para iteraciones posteriores: al estar entrenado como adaptador independiente sobre un A1 congelado, puede servir como punto de partida para nuevos escalones o para experimentos de mezcla de adaptadores.
- Analisis de seguridad y comportamiento: util para estudiar como un ajuste pequeno (segunda etapa sobre una base ya ajustada) modifica las respuestas del modelo base en escenarios de consejo delicado, y para detectar derivas indeseadas.
- Evaluacion comparativa en pipelines propios: se puede integrar en un banco de pruebas interno que compare la calidad del consejo frente al modelo base sin adaptador y frente al A1 solo, midiendo si la segunda etapa aporta mejora.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un conjunto de validacion (terra3k-val-qwen25.jsonl) pero no incluye ninguna metrica, tabla comparativa ni puntuacion de MMLU, HumanEval, GSM8K u otros benchmarks. Tampoco se documentan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM para los pesos de la base: en bf16/fp16, un modelo de aproximadamente 32.500 millones de parametros ocupa en torno a 65 GB solo en pesos, a los que hay que sumar el adaptador (2,2 GB en el repositorio, aproximadamente 1,1 GB en bf16) y la cache KV.
- VRAM con cuantizacion de la base: en 8 bits la base ronda los 33 GB de pesos; en 4 bits, en torno a 17-20 GB. La compatibilidad de este adaptador concreto con bases cuantizadas no esta documentada y requeriria verificar el "parche" de la base.
- GPU recomendadas: para servir la base sin cuantizar en bf16 son necesarias A100 80 GB, H100 80 GB o configuraciones multi-GPU equivalentes. Con cuantizacion de 4 bits es viable en una RTX 4090, RTX 3090 o L40S de 24-48 GB, sujeto a que la pila de adaptadores funcione sobre la base cuantizada.
- Cabe en GPU de consumo: si, en el caso de cuantizacion agresiva (4 bits) y una sola GPU de 24 GB, siempre que se resuelva la aplicacion del parche y de los dos adaptadores. En bf16 no cabe en GPU de consumo de una sola unidad.
- Opciones de despliegue: la model card indica un procedimiento propio basado en el script code/msm_eval/serve_reconstructed.sh, con las variables ARM, ROW_PATCH=1 y ADAPTERS apuntando a los dos repositorios. Para servir LoRA de forma estandar serian aplicables vLLM (soporte de multiples adaptadores LoRA) o TGI, siempre que se reproduzca el parche de la base; llama.cpp/Ollama requeririan convertir el adaptador a GGUF, algo no documentado para esta pila.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay datos de rendimiento del adaptador, por lo que la comparacion se limita a aspectos estructurales. Los datos de los modelos de referencia proceden de informacion publica general de la familia Qwen y no se han verificado en la informacion proporcionada.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-32B-graft0-a1-terra3k-r500-da-e1 | Adaptador LoRA (segunda etapa) | Adaptador de aproximadamente 528 M estimados sobre base de 32B | No disponible (heredado de la base) | No disponible | Publicado en HuggingFace, 0 descargas, requiere adaptador A1 y base parcheada |
| Qwen/Qwen2.5-32B | Modelo base denso | Aproximadamente 32B | Segun la documentacion oficial de Qwen2.5-32B | La del modelo base (consultar su ficha) | Ampliamente disponible |
| Qwen2.5-32B-Instruct | Fine-tune oficial de instrucciones | Aproximadamente 32B | Segun la documentacion oficial de Qwen2.5 | La del modelo base (consultar su ficha) | Ampliamente disponible, listo para uso directo |
| Qwen2.5-Coder-32B | Fine-tune especializado en codigo | Aproximadamente 32B | Segun la documentacion oficial de Qwen2.5 | La del modelo base (consultar su ficha) | Ampliamente disponible |

## Limitaciones y advertencias

- Modelo practicamente sin adopcion: cero descargas y cero "likes" en el momento de la consulta, sin validacion externa conocida.
- Ausencia total de benchmarks: no hay ninguna metrica publicada que permita estimar la calidad del ajuste frente a la base o frente a modelos de instrucciones oficiales.
- Dataset muy reducido: la etapa descrita utiliza 500 filas durante 1 epoca, un volumen bajo que incrementa el riesgo de sobreajuste y de resultados poco generalizables.
- Dependencia de un entorno no estandar: el adaptador no funciona de forma autonoma; requiere el adaptador A1, una base parcheada (ROW_PATCH=1) y un orden de carga concreto. Sin ese "parche", cuyo contenido no se documenta, el modelo no puede reproducirse.
- Licencia no declarada: la ficha no indica licencia para el adaptador. El uso comercial queda por tanto indeterminado y sujeto, como minimo, a la licencia del modelo base, que debe consultarse por separado.
- Idiomas no declarados: no se puede asumir cobertura multilingue ni siquiera en castellano sin una evaluacion propia.
- Riesgo de alucinacion: es un ajuste sobre un modelo generativo de proposito general; en tareas de "consejo" el riesgo de afirmaciones incorrectas o de sesgos en las recomendaciones es especialmente relevante y no ha sido evaluado.
- Sesgos conocidos: no disponibles. No hay evaluacion de sesgos ni de seguridad en la informacion proporcionada.
- Advertencia para produccion: dado el estado experimental, la falta de licencia y la ausencia de metricas, no se recomienda su uso en produccion sin una evaluacion interna exhaustiva.
