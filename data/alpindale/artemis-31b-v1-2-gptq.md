# alpindale/Artemis-31B-v1.2-GPTQ

## Resumen

Artemis-31B-v1.2-GPTQ es una cuantizacion uniforme de 4 bits en formato GPTQ del modelo TheDrummer/Artemis-31B-v1.2, publicada por el usuario alpindale. Se trata de un modelo multimodal de tipo image-text-to-text construido sobre la arquitectura Gemma (etiquetada como `gemma4` en los metadatos del repositorio), con 31.273.086.512 parametros totales segun los pesos safetensors. El checkpoint resultante ocupa 62,6 GB en el repositorio y esta empaquetado con el formato Humming del autor de la cuantizacion.

El modelo base Artemis-31B-v1.2 es un fine-tune de la familia Gemma orientado a conversacion y tareas multimodales. Esta version cuantizada busca reducir el coste de inferencia manteniendo una recuperacion media del 99,2728 % respecto al modelo en BF16 en un conjunto de siete metricas (ARC Challenge, GSM8K, GSM8K CoT, IFEval prompt, IFEval instruction, MMLU CoT y MMLU Pro), promediadas sobre las semillas 42, 1 y 1234.

Es relevante para desarrolladores que necesitan desplegar un modelo multimodal de ~31B en hardware mas modesto que el requerido por BF16, aceptando una perdida marginal de precision. La ficha se basa exclusivamente en los metadatos y la model card disponibles; no se han publicado detalles sobre licencia, idiomas ni composicion del dataset de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta `gemma4`), image-text-to-text |
| Parametros totales | 31.273.086.512 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ asimetrico uniforme de 4 bits, group size 128; vision encoder, projector, embeddings, language head y parametros no seleccionados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (empaquetado Humming), libreria transformers |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Gemma (etiqueta `gemma4`) con pipeline image-text-to-text, lo que implica un encoder de vision acoplado a un decoder de lenguaje mediante un projector. La cuantizacion afecta a 410 proyecciones lineales del bloque de lenguaje, que se almacenan en 4 bits con GPTQ asimetrico y group size 128; el resto de componentes (vision encoder, projector, embeddings, language head y parametros no seleccionados) permanecen en BF16. El empaquetado utiliza el formato Humming del autor.

El proceso de calibracion de GPTQ empleo 8.388.608 tokens de FineWeb-Edu con longitud de secuencia 8.192 y semilla 0. No se dispone de informacion sobre el numero total de tokens de preentrenamiento del modelo base, la composicion de su dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras etapas de alineamiento. Tampoco se documentan innovaciones arquitectonicas especificas mas alla de las propias de la familia Gemma.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational`.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text): el modelo acepta entradas visuales junto a instrucciones textuales.
- Razonamiento y matematicas: los benchmarks reportados incluyen GSM8K, GSM8K CoT, MMLU CoT y MMLU Pro, lo que indica capacidad para resolver problemas aritmeticos y de conocimiento general con cadena de pensamiento.
- Seguimiento de instrucciones: se evalua con IFEval en las variantes prompt e instruction.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking explicito, audio u otras modalidades: no disponible.

## Casos de uso

- Asistente conversacional multimodal: el modelo puede mantener dialogos multi-turno en los que el usuario adjunta imagenes (capturas, diagramas, fotografias) y formula preguntas; la componente de vision en BF16 preserva la calidad de la codificacion visual aunque el bloque de lenguaje este cuantizado.
- Descripcion y analisis de imagenes en pipelines de documentacion: dado que el modelo acepta image-text-to-text, puede generar descripciones o extraer informacion de figuras tecnicas en flujos automatizados de generacion de documentacion.
- Razonamiento aritmetico asistido: con puntuaciones de 93,96 % en GSM8K y 95,30 % en GSM8K CoT tras la cuantizacion, es adecuado para tareas de resolucion de problemas matematicos de nivel escolar en entornos donde no se requiere el modelo completo en BF16.
- Clasificacion y respuesta a instrucciones estructuradas: los resultados en IFEval (86,63 % prompt, 90,53 % instruction) lo hacen util para sistemas que dependen de un seguimiento fiable de formatos y restricciones en la respuesta.
- Evaluacion de conocimiento general en entornos con recursos limitados: MMLU CoT al 88,90 % y MMLU Pro al 80,22 % permiten usar el modelo como componente de QA en aplicaciones internas donde el presupuesto de VRAM es restrictivo.
- Despliegue en servidores con una sola GPU de 80 GB: el checkpoint de 62,6 GB cabe en una A100 o H100 de 80 GB, lo que facilita servir el modelo sin infraestructura multi-GPU.
- Prototipado e investigacion sobre cuantizacion: al publicar metricas de recuperacion por metrica y semilla, sirve como referencia para estudiar el impacto de GPTQ 4 bits en modelos multimodales de ~31B.

## Benchmarks y rendimiento

Resultados reportados en la model card (media sobre semillas 42, 1 y 1234):

| Metrica | BF16 (%) | 4 bits empaquetado (%) |
|---|---:|---:|
| ARC Challenge | 96,17 | 93,91 |
| GSM8K | 94,74 | 93,96 |
| GSM8K CoT | 95,43 | 95,30 |
| IFEval prompt | 86,44 | 86,63 |
| IFEval instruction | 90,41 | 90,53 |
| MMLU CoT | 89,78 | 88,90 |
| MMLU Pro | 81,16 | 80,22 |

Recuperacion media reportada: 99,2728 % respecto a BF16. El autor advierte que metricas individuales pueden caer por debajo del 99 % y que estas mediciones no establecen equivalencia estadistica. No se han publicado resultados de benchmarks adicionales (por ejemplo, HumanEval o evaluaciones multimodales) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 62,6 GB en disco; en VRAM se requiere espacio adicional para el cache KV y activaciones, por lo que se recomienda al menos 70-80 GB para contextos moderados.
- GPU recomendadas: A100 80 GB o H100 80 GB para servir el modelo en una sola tarjeta.
- Cabe en consumer GPU: no de forma completa; una RTX 4090 (24 GB) o RTX 3090 (24 GB) no pueden alojar el modelo entero. Seria necesario repartir entre varias GPU o aplicar cuantizaciones adicionales no documentadas en esta ficha.
- Opciones de despliegue: al estar en formato transformers/safetensors con GPTQ, es compatible con librerias de inferencia que soportan GPTQ (por ejemplo, vLLM o TGI con soporte de cuantizacion GPTQ); no se documenta compatibilidad verificada con llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alpindale/Artemis-31B-v1.2-GPTQ | 31,27 B | no disponible | GPTQ 4 bits | no disponible | Hugging Face |
| TheDrummer/Artemis-31B-v1.2 (base BF16) | 31,27 B | no disponible | BF16 | no disponible | Hugging Face |
| Otros modelos Gemma de ~27-31B | no disponible | no disponible | variable | no disponible | no disponible |

No se dispone de informacion suficiente para comparar rendimiento con alternativas de la misma categoria; los unicos datos numericos son los de la tabla de benchmarks frente al propio modelo base en BF16.

## Limitaciones y advertencias

- La cuantizacion introduce degradacion medible: ARC Challenge cae de 96,17 % a 93,91 % y MMLU Pro de 81,16 % a 80,22 %; el autor indica que algunas metricas individuales quedan por debajo del 99 % de recuperacion.
- No se establece equivalencia estadistica entre el modelo cuantizado y el BF16; las diferencias pueden ser relevantes en tareas sensibles.
- Licencia no disponible: no puede confirmarse si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base TheDrummer/Artemis-31B-v1.2 antes de desplegarlo en produccion.
- Idiomas soportados no documentados: no hay garantia de calidad fuera de los idiomas cubiertos por el modelo base, que no se especifican.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad ni de tasas de alucinacion en la informacion disponible.
- Sesgos conocidos: no documentados en la model card.
- Longitud de contexto no disponible: no puede planificarse el uso en escenarios de contexto largo sin consultar la documentacion del modelo base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion comunitaria del checkpoint.
- El pipeline declarado es image-text-to-text, pero no se han publicado benchmarks multimodales que verifiquen el impacto de la cuantizacion en las tareas de vision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alpindale/Artemis-31B-v1.2-GPTQ
- Modelo base: https://huggingface.co/TheDrummer/Artemis-31B-v1.2
