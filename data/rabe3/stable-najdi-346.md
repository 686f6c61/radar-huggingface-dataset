# Rabe3/stable-najdi-346

## Resumen

`Rabe3/stable-najdi-346` es un modelo de síntesis de voz (text-to-speech) especializado en árabe najdi, el dialecto árabe hablado en la región central de Arabia Saudí. Se trata de un checkpoint completo basado en `openbmb/VoxCPM2`, desarrollado por el usuario Rabe3. El modelo integra de forma directa en sus pesos un clasificador de final de habla (stop classifier) reentrenado, de modo que no requiere adaptadores separados ni superposiciones de cabeceras de parada.

El propósito principal de este checkpoint es mejorar la detección de finales de frase en habla natural najdi, un problema crítico en sistemas de TTS conversacionales. Según los datos de la model card, en una comparación de 1.000 grabaciones nativas de VoxCPM, los indicadores de final tardío detectados por ASR se redujeron de 4 a 0. El modelo tiene 2.290.004.544 parámetros y se distribuye en formato `safetensors` con un tamaño de repositorio de 9,5 GB. La arquitectura subyacente no está documentada en la información disponible, pero el modelo se carga mediante la clase `VoxCPM` y puede servirse con `vllm serve --omni`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoxCPM2 (arquitectura especifica no documentada en la informacion disponible) |
| Parametros totales | 2.290.004.544 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ar (arabe najdi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `openbmb/VoxCPM2`, un sistema de síntesis de voz de codificacion automatica de audio (AudioVAE). El proceso de entrenamiento combino dos fases: primero, un ajuste fino mediante LoRA (Low-Rank Adaptation) para adaptar el modelo al dialecto najdi; despues, un reentrenamiento del clasificador de parada (stop classifier) que se fusiono directamente en los pesos completos del checkpoint. Segun la model card, solo cambiaron `stop_proj.weight`, `stop_proj.bias` y `stop_head.weight` respecto al checkpoint anterior.

El clasificador de parada se ajusto con cinco anotaciones humanas de puntos finales de habla y 24 anclajes de comportamiento generados, utilizando replay de 6.000 ejemplos de habla natural y 600 ejemplos de desarrollo. No se especifica el numero de tokens de entrenamiento ni la composicion exacta del dataset. La innovacion tecnica destacable es la fusion del clasificador en los pesos completos, lo que elimina la necesidad de un adaptador separado para la deteccion de final de habla. La precision original, el tokenizer, la configuracion y el AudioVAE se preservan intactos.

## Capacidades

- Sintesis de voz en arabe najdi, un dialecto arabigo con caracteristicas foneticas y morfologicas propias.
- Clonacion de voz: el modelo puede generar habla a partir de un audio de referencia y una transcripcion, lo que permite replicar voces concretas.
- Deteccion de final de habla integrada: el clasificador de parada reentrenado reduce los finales tardios detectados por ASR, mejorando la naturalidad en interacciones conversacionales.
- Compatibilidad con el ecosistema VoxCPM2: se carga con `VoxCPM.from_pretrained("Rabe3/stable-najdi-346")` y se sirve con `vllm serve Rabe3/stable-najdi-346 --omni`.
- No incluye capacidades de tool calling, agentes, vision ni razonamiento multimodal; es un modelo puro de text-to-speech.
- Soporte de generacion de habla de formato largo (longform), segun se indica en la descripcion del checkpoint.

## Casos de uso

- Asistentes de voz en dialecto najdi para atencion al cliente: el modelo puede generar respuestas habladas naturales en el dialecto local, lo que mejora la experiencia de usuarios en Arabia Saudi. La deteccion de final de habla integrada evita cortes o esperas innecesarias en conversaciones multi-turno.
- Sistemas de respuesta de voz interactiva (IVR) en banca y servicios publicos: permite sustituir locuciones pregrabadas por voz sintetizada en najdi, reduciendo costes de produccion y facilitando la actualizacion de mensajes.
- Narracion de audiolibros y contenido educativo en arabe najdi: al tratarse de un modelo longform, puede generar narraciones extensas con entonacion adecuada para textos largos.
- Herramientas de clonacion de voz para creadores de contenido: los usuarios pueden proporcionar un audio de referencia y una transcripcion para generar locuciones personalizadas, utiles en doblaje, podcasts o videos.
- Aplicaciones de accesibilidad para personas con discapacidad visual: el modelo puede convertir texto escrito en voz hablada en el dialecto najdi, facilitando el acceso a informacion digital en contextos locales.
- Practica de pronunciacion para estudiantes de arabe najdi: el modelo puede generar ejemplos de habla correcta en el dialecto, sirviendo como herramienta de apoyo en aplicaciones de aprendizaje de idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandares (como MMLU, HumanEval o GSM8K) en la informacion disponible. El autor reporta una evaluacion interna de screening ASR en una comparacion de 1.000 grabaciones nativas de VoxCPM, donde los indicadores de final tardio (late-stop flags) disminuyeron de 4 a 0. Sin embargo, la model card indica explicitamente que estos resultados son de screening ASR, no una tasa de alucinacion real verificada ni una garantia de que los fallos del clasificador de parada esten eliminados. La puerta de aceptacion automatizada no paso, y dos posibles finales recortados (identificadores 00216 y 00765) requieren revision auditiva.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo tiene 2.290.004.544 parametros y un peso en safetensors de 9,5 GB, lo que sugiere que en precision FP16 podria requerir alrededor de 16-20 GB de VRAM, aunque este dato no esta confirmado por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: se puede cargar con `VoxCPM.from_pretrained("Rabe3/stable-najdi-346")` o servirse con `vllm serve Rabe3/stable-najdi-346 --omni` en una version compatible con VoxCPM2. No se mencionan otras opciones como llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. El modelo es un ajuste fino de `openbmb/VoxCPM2`, por lo que su categoria es la de sintesis de voz basada en VoxCPM2, pero no hay benchmarks publicados que permitan comparar este checkpoint con otras alternativas del mismo tamano o tarea. Se recomienda consultar la documentacion del modelo base para obtener referencias de rendimiento.

## Limitaciones y advertencias

- Los resultados de la evaluacion ASR no son una tasa de alucinacion real verificada ni garantizan la eliminacion de fallos del clasificador de parada. La puerta de aceptacion automatizada no paso, por lo que el modelo no debe considerarse listo para produccion sin pruebas adicionales.
- Dos posibles finales recortados (archivos 00216 y 00765) necesitan revision auditiva antes de su uso en aplicaciones criticas.
- El modelo esta limitado al arabe najdi y no soporta otros idiomas ni dialectos.
- No se han documentado sesgos especificos, pero al tratarse de un modelo entrenado con datos de habla natural, puede reflejar variaciones regionales o sociolinguisticas propias del dialecto.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar el cumplimiento de las condiciones de la licencia y los derechos sobre los datos de entrenamiento.
- La falta de benchmarks publicos y de especificaciones de arquitectura detalladas dificulta la evaluacion objetiva del rendimiento frente a otros modelos TTS.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rabe3/stable-najdi-346
- Repositorio relacionado (Rabe3/najdi_vox): https://huggingface.co/Rabe3/najdi_vox
