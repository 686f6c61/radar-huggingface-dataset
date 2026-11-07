# Arrisx/Calogera-0.0-GGUF

## Resumen

Calogera-0.0 es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen3.5-2B`, desarrollado por Arrisx bajo la marca "Arturo AI" de Trynakria (Palermo). Se presenta como "la primera IA siciliana" y esta especializado en conversacion en italiano y siciliano, con un enfasis declarado en contenido cultural y linguistico de Sicilia. El modelo se distribuye unicamente en formato GGUF, lo que lo orienta a inferencia local con llama.cpp y derivados.

El modelo cuenta con 1.942.653.248 parametros (aproximadamente 1,94 mil millones) y hereda la arquitectura del Qwen3.5-2B original. El repositorio ocupa 2,6 GB e incluye cuantizaciones GGUF. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las obligatorias de atribucion.

Su relevancia es limitada y muy nichada: se trata de un modelo de 2B parametros con solo 1 descarga y 0 likes en el momento de la consulta, sin resultados de benchmarks publicados en la informacion disponible. Resulta util como ejemplo de ajuste linguistico regional de bajo coste, pero no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-2B; detalles no disponibles) |
| Parametros totales | 1.942.653.248 (~1,94 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no disponibles) |
| Idiomas soportados | Italiano (it), siciliano (scn) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamano del repositorio | 2,6 GB |
| Modelo base | unsloth/Qwen3.5-2B |
| Fecha de creacion | 2026-11-05 |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del Qwen3.5-2B de Unsloth, por lo que su arquitectura subyacente es la del transformer de Qwen3.5 en su variante de 2B parametros. No se dispone de informacion detallada sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa; la model card no lo especifica.

En cuanto a los datos de entrenamiento, la model card indica que se compone de ejemplos escritos por Trynakria, conversaciones en italiano procedentes del dataset Aya y de OpenAssistant oasst2, extractos de Wikipedia en italiano y siciliano, y otras fuentes abiertas como Wikivoyage, Wikibooks, Wikiquote, Wikizionario, Dolly y Napizia. Las atribuciones completas se recogen en el fichero NOTICE del repositorio. No se indica el numero total de tokens de entrenamiento, la composicion porcentual del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona que se superaron "8 de 10" pruebas automaticas, sin detallar cuales son ni con que criterios.

## Capacidades

- Generacion de texto conversacional en italiano y siciliano.
- Conversacion multi-turno (etiqueta `conversational` en el repositorio).
- Contenido de tipo cultural y linguistico siciliano, derivado de las fuentes Wikipedia/Wikivoyage/Wikizionario empleadas en el entrenamiento.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que sugiere despliegue mediante infraestructura de inferencia estandar.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades de vision, audio o modo "thinking": no disponible.
- Capacidades multilingues fuera de italiano y siciliano: no disponibles.

## Casos de uso

- Asistente conversacional en siciliano: el modelo puede mantener dialogos cotidianos en siciliano y responder en esa lengua, gracias al ajuste especifico sobre corpus scn (Wikipedia, Wikizionario, Wikivoyage). Adecuado para aplicaciones de preservacion linguistica o divulgacion local.
- Chatbot de atencion al cliente para comercios sicilianos: un negocio de Palermo o alrededores podria desplegarlo en local para responder en italiano y siciliano sin coste de API, dado su tamano reducido (~2B) y licencia Apache 2.0.
- Generacion de contenido cultural regional: redaccion de fichas de patrimonio, gastronomia o tradiciones sicilianas a partir de los conocimientos adquiridos de Wikipedia y Wikivoyage en italiano y siciliano.
- Prototipado rapido en local: su formato GGUF y sus ~1,94 B de parametros permiten ejecutarlo en portatiles con llama.cpp u Ollama para experimentar con ajustes linguisticos regionales sin GPU dedicada.
- Traduccion asistida italiano-siciliano: util como borrador inicial en tareas de traduccion o adaptacion de textos al siciliano, siempre con revision humana dado el riesgo de alucinacion de un modelo de este tamano.
- Educacion y divulgacion linguistica: integracion en materiales didacticos o aplicaciones de aprendizaje del siciliano, aprovechando su entrenamiento sobre Wikizionario y Wikiquote.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia de evaluacion es la mencion de la model card de que se superaron "8 de 10" pruebas automaticas, sin especificar cuales ni sus resultados numericos.

## Requisitos de hardware

- VRAM estimada para inferencia: en cuantizacion Q4_K_M, un modelo de ~1,94 B parametros ocupa aproximadamente 1,2-1,5 GB; en Q8_0, en torno a 2-2,2 GB; en FP16, unos 3,9 GB. Las cifras exactas dependen de las variantes GGUF incluidas en el repositorio, que no se detallan.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4060, etc.). No requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estandar.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Calogera-0.0 | ~1,94 B | no disponible | it, scn | Apache 2.0 | GGUF |
| Qwen3.5-2B (base) | ~2 B | no disponible | multilingue | no disponible | safetensors, GGUF |
| Modelos de 2B de proposito general (p. ej. Gemma 2B, Phi-2) | ~2-2,7 B | 4K-8K tipicamente | multilingue | variable | safetensors, GGUF |

No se dispone de datos de rendimiento comparativos para Calogera-0.0, por lo que la comparativa se limita a parametros, licencia y formato. Frente al Qwen3.5-2B base, Calogera-0.0 gana especializacion en italiano y siciliano pero pierde cobertura multilingue general.

## Limitaciones y advertencias

- Modelo de muy bajo uso y validacion: 1 descarga y 0 likes en el momento de la consulta, sin benchmarks publicos.
- Riesgo elevado de alucinacion: con ~1,94 B parametros y un ajuste fino sobre corpus reducido, la fiabilidad factual es limitada.
- Cobertura linguistica restringida a italiano y siciliano; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Longitud de contexto no especificada; no se recomienda para tareas que requieran ventanas largas.
- Licencia Apache 2.0: permite uso comercial, pero deben respetarse las atribuciones del fichero NOTICE y las licencias de los datasets de origen (Aya, OpenAssistant oasst2, Wikipedia, etc.).
- El siciliano es una lengua de bajos recursos; la calidad en esa variante puede ser irregular pese al ajuste.
- No se documentan sesgos especificos, pero al entrenar sobre Wikipedia y datasets conversacionales es probable que herede sesgos de esas fuentes.
- Idoneidad para produccion: baja sin evaluacion adicional; adecuado para prototipos y experimentacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Arrisx/Calogera-0.0-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- Dataset Aya: https://huggingface.co/datasets/CohereForAI/aya_dataset
- Dataset OpenAssistant oasst2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Dataset Dolly: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Wikipedia en siciliano: https://scn.wikipedia.org
- Wikizionario en siciliano: https://scn.wiktionary.org
