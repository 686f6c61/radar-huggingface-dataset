# Agtian/cpt2-merged

## Resumen

Agtian/cpt2-merged es un modelo de lenguaje generativo de aproximadamente 2.700 millones de parámetros (2.697.198.592), creado por Agtian mediante fine-tuning del modelo base Indexnusrefather/Caelistus-Gladius-Excalibur-RP-2.6B-Thinking-v0.1. El proceso de entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, tal y como indica la model card. El nombre del repositorio sugiere que el modelo final es el resultado de una fusión de pesos, probablemente con herramientas como mergekit, aunque no se detalla el procedimiento.

La ficha disponible no especifica la arquitectura, la longitud de contexto ni los datos de entrenamiento utilizados. Por ello, la información técnica es muy limitada. El modelo está pensado para tareas de generación de texto en inglés y hereda la orientación conversacional y de roleplay del modelo base, que incorpora la palabra "Thinking" en su nombre, lo que apunta a una capacidad de razonamiento explícito o encadenado. Su relevancia actual reside en ser un modelo experimental de tamaño contenido, con licencia Apache 2.0, que puede desplegarse en entornos locales o de producción sencillos, aunque sin evidencia publicada de rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 2.697.198.592 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura del modelo. El tag `lfm2` y la referencia al modelo base de 2.6B sugieren que se trata de un transformer decodificador basado en el modelo Caelistus-Gladius-Excalibur-RP-2.6B-Thinking-v0.1, pero no se confirma oficialmente. El proceso de entrenamiento se describe como un fine-tuning realizado con Unsloth y TRL, que acelera el entrenamiento en comparación con los métodos convencionales. No se especifica el dataset, el número de tokens ni si se aplicó RLHF, DPO o alguna técnica alineación adicional. El nombre "cpt2-merged" indica que el modelo final es una fusión de pesos, probablemente mediante mergekit, aunque no hay detalles sobre los modelos fusionados ni sobre la estrategia de mezcla.

## Capacidades

La ficha del modelo no documenta explícitamente sus capacidades, por lo que se deducen de la naturaleza del modelo base y de su fine-tuning. Las capacidades posibles son:

- Generación de texto en inglés, orientada a conversación y roleplay.
- Posible soporte de razonamiento encadenado ("thinking") heredado del modelo base.
- Generación de narrativa descriptiva y diálogos de personajes.
- Respuestas conversacionales en formato abierto.
- No se dispone de información sobre soporte de tool calling, agentes, visión, audio u otras capacidades multimodales.
- No hay datos que confirmen soporte multilingüe más allá del inglés.

## Casos de uso

Dado que la documentación no detalla las capacidades específicas, los casos de uso siguientes se basan en la naturaleza del modelo base, orientado a roleplay y razonamiento:

- Roleplay conversacional: el modelo puede mantener diálogos con personajes ficticios en inglés, lo que resulta adecuado para juegos de rol por texto o simulaciones interactivas.
- Narración interactiva: puede generar descripciones de escenas y avanzar tramas en aventuras de texto, gracias a su afinidad con la generación de narrativa.
- Creación de guiones para videojuegos: permite generar diálogos para personajes no jugadores (NPC) en prototipos narrativos.
- Asistente de escritura creativa: apoya el desarrollo de historias, personajes y escenarios, ofreciendo alternativas de texto en inglés.
- Chatbot de entretenimiento: puede responder de forma conversacional e inmersiva en inglés, útil para aplicaciones de ocio.
- Prototipado de agentes con razonamiento explícito: el nombre "Thinking" del modelo base sugiere que podría usarse para explorar respuestas que incluyan pasos internos de pensamiento, aunque no hay documentación que lo confirme.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Los siguientes requisitos son estimaciones basadas en el tamaño del modelo (2.7B parámetros) y en el peso de los archivos safetensors (5.4 GB, consistente con precisión FP16):

- VRAM estimada para inferencia: en FP16, aproximadamente 6-8 GB; en int8, alrededor de 3-4 GB; en int4, 2-3 GB.
- GPU recomendadas: NVIDIA A100, H100, RTX 4090, RTX 3090 o RTX 3060 de 12 GB. Con cuantización int4, también puede ejecutarse en GPUs de 8 GB o menos.
- Compatibilidad con GPUs de consumo: sí, siempre que se aplique cuantización.
- Opciones de despliegue: Transformers, vLLM, TGI, llama.cpp y Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en la información proporcionada, y no se han publicado resultados de referencia.

## Limitaciones y advertencias

- No hay documentación sobre sesgos, riesgos de alucinación ni comportamientos no deseados.
- El modelo solo soporta inglés.
- La arquitectura y la longitud de contexto no están identificadas, lo que dificulta su integración en sistemas que requieran parámetros precisos.
- No existen benchmarks publicados, por lo que su rendimiento en tareas reales no está verificado.
- El término "merged" indica que puede tratarse de un modelo fusionado, lo que podría introducir comportamientos impredecibles o inconsistencia en ciertos dominios.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base por si incluye restricciones adicionales.
- La ausencia de métricas y de soporte técnico hace que no sea recomendable para entornos de producción críticos sin una evaluación previa exhaustiva.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/Agtian/cpt2-merged
- Modelo base: https://huggingface.co/Indexnusrefather/Caelistus-Gladius-Excalibur-RP-2.6B-Thinking-v0.1
- Referencia a mergekit, herramienta de fusión de modelos: https://github.com/arcee-ai/mergekit
