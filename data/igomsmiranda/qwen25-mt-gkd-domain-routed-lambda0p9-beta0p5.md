# igomsmiranda/qwen25-mt-gkd-domain-routed-lambda0p9-beta0p5

## Resumen

Este repositorio contiene un checkpoint de investigación publicado por el usuario `igomsmiranda`: un modelo de generación de texto de 1.543.714.304 parámetros (1,54 B) obtenido por destilación de conocimiento multi-profesor sobre la arquitectura Qwen2 (tag `qwen2`), presumiblemente a partir de un Qwen2.5-1.5B, aunque la model card no identifica el modelo base y lo muestra como `None`. El entrenamiento se ha realizado con TRL mediante la técnica `MultiTeacherGKD` (Generalized Knowledge Distillation con varios profesores), según declara el propio autor en la model card.

El interés del artefacto es metodológico más que de producto: el nombre del repositorio codifica una configuración concreta de destilación (`domain_routed`, `lambda0p9`, `beta0p5`, `256tok`, `eval500`), lo que lo convierte en material útil para quienes investigan destilación on-policy con mezcla de profesores y enrutado por dominio. No hay ninguna evaluación publicada, ni datos de rendimiento, ni licencia declarada, y el modelo acumula cero descargas y cero likes en el momento de redactar esta ficha.

Por tanto, debe tratarse como un experimento reproducible, no como un modelo listo para producción. Su tamaño (1,54 B) sí permite ejecutarlo en GPU de consumo, lo que facilita replicar o auditar el pipeline de destilación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (tag `qwen2`); el modelo base exacto no se identifica en la model card |
| Parametros totales | 1.543.714.304 (1,54 B), según los pesos en safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible. La model card no lo especifica; el identificador menciona `256tok`, que parece referirse a la longitud de secuencia usada en entrenamiento/evaluación, no al contexto máximo |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en bfloat16; no hay variantes GGUF, GPTQ, AWQ ni EXL2 |
| Idiomas soportados | No disponible (no declarados en la model card ni en los tags) |
| Licencia | No disponible. La model card contiene un marcador de posición (`licence: license`) sin texto legal; el modelo base Qwen2.5 se distribuye habitualmente bajo Apache-2.0, pero esta obra derivada no declara términos |
| Formato de pesos | safetensors (bfloat16), repositorio de 3,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen2, con 1,54 B de parámetros y pesos en bfloat16. No se dispone de información sobre el número de capas, dimensión oculta, cabezas de atención ni vocabulario, porque la model card es la plantilla autogenerada por TRL y no incluye configuración. Tampoco se documenta el modelo base: el campo correspondiente aparece como `None`.

El procedimiento de entrenamiento sí está identificado a nivel de herramienta: `MultiTeacherGKD`, implementado en TRL 1.0.0.dev0, con Transformers 5.9.0, PyTorch 2.6.0+cu124 y Datasets 4.8.5. Se trata de destilación de conocimiento generalizada (GKD) con múltiples profesores, en la que el alumno se ha sometido a un SFT completo (`fullsft_student`) y los profesores también (`fullsft_teachers`). El identificador del repositorio sugiere un enrutado de profesores por dominio (`domain_routed`) y dos hiperparámetros de mezcla, `lambda=0,9` y `beta=0,5`; también sugiere secuencias de 256 tokens y evaluación cada 500 pasos. Estas lecturas son inferencias a partir del nombre del checkpoint, no afirmaciones documentadas en la model card. No se especifican el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO posteriores.

## Capacidades

- Generación de texto conversacional: el pipeline de ejemplo usa el formato de chat con rol `user`, por lo que el checkpoint espera plantilla conversacional.
- Destilación multi-profesor: capacidad de interés para investigación, no una funcionalidad de usuario final.
- Razonamiento y conocimiento general: no verificados; no hay benchmarks ni evaluaciones publicadas que los respalden.
- Generación de código y matemáticas: no documentada ni evaluada.
- Tool calling / function calling: no documentado; sin plantilla de herramientas publicada.
- Uso como agente y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no declaradas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales (visión, audio, modo thinking): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Investigación en destilación multi-profesor: replicar el pipeline `MultiTeacherGKD` de TRL con distintos valores de `lambda` y `beta` para estudiar el efecto de la mezcla de profesores en un alumno de 1,5 B, usando este checkpoint como referencia de una configuración concreta.
- Estudio de enrutado por dominio: analizar si el enrutado de profesores por dominio produce especialización medible, comparando las respuestas del modelo en distintos dominios frente a un destilado de profesor único.
- Punto de partida para SFT adicional: al ser un modelo denso de 1,54 B en bfloat16 (3,1 GB), se puede afinar con LoRA en una GPU de 16-24 GB y adaptarlo a una tarea concreta antes de evaluar si la inicialización destilada aporta ventaja.
- Prototipado de asistentes conversacionales de bajo coste: sirve para validar plantillas de chat, formatos de respuesta y flujos multi-turno en local antes de migrar a un modelo mayor, dado que cabe en GPU de consumo.
- Generación de texto corto en entornos con recursos limitados: resúmenes de una frase, reescritura, clasificación generativa y extracción de entidades en despliegues edge, siempre con validación previa porque no hay métricas publicadas.
- Evaluación comparativa de técnicas de compresión: usar el checkpoint como alumno de referencia para medir la brecha entre un 1,5 B destilado y sus profesores en tareas estándar, si se dispone de acceso a dichos profesores.
- Docencia y reproducción de experimentos: material para cursos o talleres sobre TRL, GKD y destilación on-policy, con la ventaja de que el coste de inferencia es bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y el repositorio no enlaza informes de evaluación más allá del panel de Weights & Biases del entrenamiento, que registra curvas de pérdida pero no resultados de tareas.

## Requisitos de hardware

- VRAM para inferencia en bfloat16/fp16: aproximadamente 3,1 GB solo para pesos, más caché KV. Con contexto corto, cabe en 6-8 GB; con contextos largos conviene reservar 12 GB o más.
- VRAM en cuantización int8: en torno a 1,6 GB de pesos, viable en GPU de 4-6 GB.
- VRAM en 4 bits (si se genera la cuantización): alrededor de 0,9-1,1 GB de pesos. No hay artefactos precompilados publicados, habría que crearlos con bitsandbytes, GPTQ o AWQ.
- GPU de consumo: sí cabe. RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y portátiles con 8 GB son suficientes para inferencia en bf16 con contexto moderado. También es viable en CPU con llama.cpp si se convierte a GGUF.
- GPU de datacenter: A100, H100 o L40S están sobredimensionadas para un modelo de este tamaño; solo se justifican para entrenamiento o para servir muchas réplicas en paralelo.
- Despliegue: `transformers` (soporte nativo, tag `transformers`), TGI (tag `text-generation-inference`), vLLM y SGLang para serving con batching. llama.cpp y Ollama requieren conversión previa a GGUF, que no está publicada.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (`qwen25-mt-gkd-domain-routed-lambda0p9-beta0p5`) | 1,54 B | No disponible | No disponible | Repositorio único, 0 descargas, sin cuantizaciones | Checkpoint de investigación, sin benchmarks |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (131.072 con YaRN, segúndocumentación del modelo base) | Apache-2.0 | Amplia, con GGUF y AWQ/GPTQ de terceros | Alternativa de referencia si se busca un 1,5 B listo para uso |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | Amplia, con GGUF y quantizaciones | Menor en parámetros, contexto mayor, licencia con restricciones |
| SmolLM2-1.7B-Instruct | 1,71 B | 8.192 tokens | Apache-2.0 | Amplia, con GGUF | Similar en tamaño, contexto más corto |

La comparación de rendimiento con estas alternativas no es posible: este checkpoint no publica métricas y las cifras de los modelos de referencia corresponden a sus propias model cards, no a una evaluación homogénea.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni evaluación humana, ni comparación con el profesor o con el modelo base. Cualquier afirmación sobre su calidad es especulativa.
- Licencia sin definir: la model card contiene un marcador de posición (`licence: license`) y no hay fichero LICENSE verificable en la información disponible. No se recomienda uso comercial sin aclaración previa del autor, y en cualquier caso habría que verificar la licencia del modelo base Qwen2.5.
- Modelo base no identificado: el campo aparece como `None`, lo que impide reconstruir la procedencia exacta de los pesos y complica la auditoría.
- Idiomas no declarados: se desconoce si conserva el multilingüismo del modelo base o si el proceso de destilación lo ha reducido.
- Contexto no documentado: el `256tok` del identificador sugiere secuencias cortas durante el entrenamiento; usar contextos largos puede degradar la coherencia aunque la arquitectura lo permita.
- Riesgo de alucinación: en modelos de 1,5 B es alto por defecto, y aquí no hay evaluación que lo acote. No es adecuado para dominios factuales sin verificación externa.
- Sesgos: no documentados. Al desconocerse la composición del dataset de destilación y de los profesores, no se pueden caracterizar los sesgos heredados.
- Naturaleza experimental: hiperparámetros en el nombre del repositorio, cero descargas y model card autogenerada indican un artefacto de investigación, no un producto mantenido.
- Sin cuantizaciones publicadas: quien quiera desplegarlo en CPU o en GPU muy limitada tendrá que generar los GGUF por su cuenta y validar la degradación.
- Reproducibilidad parcial: se enlaza el run de Weights & Biases, pero no se publican los datasets ni la configuración completa de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/igomsmiranda/qwen25-mt-gkd-domain-routed-lambda0p9-beta0p5
- Run de entrenamiento en Weights & Biases: https://wandb.ai/diogomsmirandaa-team/mopd-qwen25-fullsft-mt-gkd/runs/9clfrmer
- Repositorio de TRL (framework de entrenamiento citado): https://github.com/huggingface/trl
