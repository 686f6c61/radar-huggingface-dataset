# ChenYanKai2002/OpenPerov-Flash

## Resumen

OpenPerov Flash es un adaptador LoRA combinado de aproximadamente 1,40 GB publicado por ChenYanKai2002 (autores: Yankai Chen, Zhi Wan y Tao Jing) para el modelo base Qwen/Qwen3.6-27B. No es un modelo completo: el repositorio distribuye unicamente el adaptador, no los pesos del modelo base de 27B ni los adaptadores intermedios de las distintas fases de entrenamiento. Su proposito declarado es el razonamiento cientifico aplicado a fotovoltaica de perovskita, aprendiendo relaciones entre preguntas cientificas, evidencia experimental, explicaciones mecanicistas y decisiones de investigacion.

El adaptador consolida tres etapas de entrenamiento mediante concatenacion de rangos (rank 48, alpha 96), preservando los bloques de tensores en float32 sin truncamiento de rango ni compresion SVD. Segun la model card, la composicion aditiva preserva las actualizaciones LoRA aprendidas y evita los errores de redondeo que podria introducir un merge secuencial del modelo completo en baja precision. El artefacto exportado no ha sido re-evaluado por separado con los benchmarks del proyecto.

El modelo forma parte del ecosistema OpenPerov: la variante OpenPerov Pro usa Flash como backbone de respuesta y anade recuperacion de evidencia y revision local de respuestas, con adaptadores especificos adicionales (selector de retencion de fuentes de 0,6B, reranker de relevancia cientifica de 8B y selector de evidencia de estudios posteriores de 8B). La relevancia actual del proyecto radica en ser un ejemplo de adaptacion de un modelo generalista de 27B a un dominio cientifico concreto mediante LoRA, con una licencia permisiva Apache-2.0 sobre el adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre transformer del modelo base Qwen/Qwen3.6-27B) |
| Parametros totales | 27B (modelo base; el adaptador no se distribuye con recuento de parametros propio) |
| Parametros activos | no aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en float32; el base admite las cuantizaciones que soporte Qwen3.6-27B) |
| Idiomas soportados | en |
| Licencia | apache-2.0 (adaptador; se mantienen las licencias y avisos del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft |
| Rank / alpha del adaptador | 48 / 96 |
| Tamano del repositorio | 1,4 GB |
| Modelo base | Qwen/Qwen3.6-27B |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Qwen3.6-27B mas alla de su uso a traves de la clase `Qwen3_5ForConditionalGeneration` que aparece en el ejemplo de carga de la model card. Lo que si se detalla es el esquema de adaptacion: se entrenaron tres etapas sucesivas de LoRA sobre el modelo base y despues se consolidaron en un unico adaptador mediante concatenacion de rangos, con rank 48 y alpha 96. La composicion es aditiva y conserva los bloques de tensores originales en float32 sin truncamiento de rango ni compresion SVD, evitando el redondeo que introduciria un merge secuencial del modelo completo en baja precision. El archivo `composition.json` registra el hash del artefacto y las comprobaciones numericas.

No se especifica el numero de tokens de entrenamiento, la composicion del corpus, ni si se emplearon tecnicas de RLHF o DPO. La model card indica explicitamente que el corpus de literatura, los ejemplos de entrenamiento, el indice de recuperacion privado y los paquetes de evidencia permanecen privados, por lo que la trazabilidad de los datos de entrenamiento no es verificable de forma externa. La unica cifra de rendimiento publicada es la puntuacion de 87,5659 sobre las 800 preguntas de PSM-Bench obtenida por el despliegue congelado de Flash descrito en el paper; el adaptador combinado exportado no ha sido re-evaluado por separado.

## Capacidades

- Razonamiento cientifico especializado en fotovoltaica de perovskita: el modelo aprende relaciones entre preguntas de investigacion, evidencia experimental, explicaciones mecanicistas y decisiones de investigacion.
- Generacion de respuestas tecnicas en ingles sobre literatura cientifica del dominio, segun el uso previsto en la model card y en PSM-Bench.
- Integracion como backbone de respuesta en una arquitectura mayor (OpenPerov Pro) que anade recuperacion de evidencia y revision local de respuestas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el proyecto si contempla cadenas de recuperacion mas revision en la variante Pro.
- Capacidades multilingues: limitadas al ingles (`en`) segun los metadatos declarados.
- Capacidad especial: adaptacion de dominio cientifico; no se declaran modos de pensamiento, vision ni audio.
- Al ser un adaptador sobre un modelo base generalista, conserva las capacidades del base en la medida en que el entrenamiento LoRA no las haya desplazado, pero esto no se documenta ni se mide.

## Casos de uso

- Asistencia a investigadores en perovskita: responder preguntas tecnicas sobre mecanismos de degradacion, pasivacion o estabilidad de dispositivos, apoyandose en el ajuste de dominio y en la evidencia recuperada por el pipeline OpenPerov.
- Revision de literatura cientifica asistida: el adaptador sirve como generador de respuestas dentro de OpenPerov Pro, que recupera fuentes y revisa localmente la respuesta antes de devolverla.
- Triaje de evidencia experimental: dado un conjunto de resultados experimentales, generar explicaciones mecanicistas candidatas que un investigador pueda contrastar.
- Soporte a la redaccion de secciones tecnicas: borradores de introducciones, discusiones o resumenes sobre fotovoltaica de perovskita en ingles, siempre con revision humana posterior.
- Evaluacion comparativa de modelos cientificos: servir como referencia de adaptacion LoRA de dominio frente a modelos generalistas sobre PSM-Bench (800 preguntas) u otros conjuntos del area.
- Base para despliegues cientificos privados: al ser un adaptador Apache-2.0 sobre un base que el usuario carga por separado, permite mantener los pesos base en infraestructura propia.
- Componente de un sistema RAG cientifico: integrarse en pipelines de recuperacion aumentada donde el adaptador actua como generador final sobre el contexto recuperado.
- Prototipado de asistentes de laboratorio: experimentar con flujos de pregunta-respuesta tecnica sin entrenar desde cero un modelo de 27B.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| PSM-Bench (800 preguntas) | 87,5659 | Puntuacion del despliegue congelado de Flash, segun la model card |
| Adaptador combinado exportado | no disponible | La model card indica que no ha sido re-evaluado por separado |
| MMLU, HumanEval, GSM8K u otros | no disponible | No se han publicado resultados en la informacion disponible |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. No se dispone de la metodologia de puntuacion de PSM-Bench mas alla de la referencia al repositorio de codigo, que contiene preguntas, criterios, respuestas, componentes de la puntuacion y protocolos de evaluacion.

## Requisitos de hardware

- VRAM estimada para el modelo base de 27B (estimacion propia a partir del tamano indicado, no confirmada por el autor): en bf16/fp16 los pesos ocupan del orden de 54 GB, a los que hay que sumar el adaptador (1,4 GB) y la cache KV; en cuantizacion de 8 bits, alrededor de 27-30 GB; en 4 bits, alrededor de 15-18 GB.
- GPU recomendadas: para precision completa, multiples A100 80 GB, H100 80 GB o equivalentes; para cuantizacion de 4 bits, una unica GPU de 24 GB puede ser suficiente, aunque no hay confirmacion oficial.
- Encaje en GPU de consumo: probable en RTX 3090/4090 (24 GB) y en tarjetas de 32-48 GB con cuantizacion; no confirmado por el autor.
- Opciones de despliegue: la model card muestra el patron `transformers` + `peft` (`PeftModel.from_pretrained`) con `device_map='auto'`. El uso de vLLM, llama.cpp, Ollama o TGI con este adaptador no esta documentado en la informacion disponible.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenPerov Flash | 27B (base) + adaptador LoRA de 1,4 GB | no disponible | 87,5659 en PSM-Bench (despliegue congelado) | Apache-2.0 (adaptador) | Adaptador publico; base Qwen3.6-27B aparte |
| Qwen/Qwen3.6-27B (base) | 27B | no disponible | Sin adaptacion a perovskita; resultados en PSM-Bench no disponibles | Segun la licencia del modelo base | Pesos base publicos por el proveedor |
| OpenPerov Pro | Flash + adaptadores adicionales (0,6B y 8B) | no disponible | No disponible | No disponible en la informacion proporcionada | Adaptadores finales separados en la coleccion OpenPerov |

No se dispone de datos publicados para establecer comparaciones cuantitativas con otros modelos de dominio cientifico. No se han publicado resultados de benchmarks comparativos en la informacion disponible.

## Limitaciones y advertencias

- Datos de entrenamiento no verificables: el corpus de literatura, los ejemplos de entrenamiento, el indice de recuperacion y los paquetes de evidencia son privados, lo que impide auditar sesgos o cobertura del dominio.
- Riesgo de alucinacion: al ser un modelo generativo entrenado sobre literatura cientifica, puede producir referencias, mecanismos o cifras plausibles pero incorrectas; se requiere verificacion con fuentes primarias.
- Idioma: los metadatos declaran unicamente ingles (`en`); el rendimiento en castellano u otros idiomas no esta documentado.
- Longitud de contexto: no disponible, lo que impide planificar casos de uso que dependan de ventanas largas.
- Cobertura de dominio estrecha: el ajuste esta orientado a fotovoltaica de perovskita; su uso fuera de ese ambito no aporta ventaja demostrada sobre el modelo base.
- Sin re-evaluacion del artefacto distribuido: la puntuacion de 87,5659 corresponde al despliegue congelado de Flash, no al adaptador combinado exportado.
- Dependencia del modelo base: es necesario cargar Qwen/Qwen3.6-27B por separado y respetar su licencia y avisos, ademas de la Apache-2.0 del adaptador.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion por terceros.
- Compatibilidad: el ejemplo de la model card usa `Qwen3_5ForConditionalGeneration`, lo que puede implicar requisitos concretos de version de `transformers`; no se documentan versiones minimas.
- Rendimiento declarado sin reproducibilidad externa: no se han publicado verificaciones independientes del resultado en PSM-Bench.

## Enlaces

- HuggingFace: https://huggingface.co/ChenYanKai2002/OpenPerov-Flash
- Repositorio de codigo, PSM-Bench y registros de evaluacion: https://github.com/Yan-Kai-Chen/OpenPerov
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Paper: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada

Nota: los resultados de busqueda web proporcionados no contienen enlaces relevantes al modelo; el unico enlace adicional util procede de la propia model card (repositorio de GitHub).
