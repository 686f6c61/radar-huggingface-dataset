# OkamotoJP/llm2-qwen35-sft013b

## Resumen

El modelo `OkamotoJP/llm2-qwen35-sft013b` es un ajuste fino supervisado (SFT) del modelo base `Qwen/Qwen3.5-0.8B`, desarrollado por el usuario OkamotoJP. Se trata de un modelo de lenguaje de aproximadamente 873 millones de parametros (0,87B), orientado especificamente a la generacion de respuestas en tareas de recuperacion aumentada (RAG) en japones. Su proposito concreto es servir como generador de respuestas dentro del ejercicio final del curso "LLM講座2 2026", cuyo tema central era RAG.

El ajuste se realizo mediante LoRA (r=16, alpha=32, learning rate 1e-4, 1 epoca sobre 1702 ejemplos) y posteriormente se fusiono con los pesos originales del modelo base, de modo que la arquitectura resultante es identica a la de Qwen3.5-0.8B. Los datos de entrenamiento provienen de JEMHopQA y de `cl-nagoya/auto-wiki-qa`, junto con fragmentos derivados de Wikipedia japonesa usados como material de contexto en los prompts.

Es relevante ahora por su caracter de modelo pequeno, de licencia Apache-2.0 y especializado en un dominio concreto (respuestas RAG en japones), lo que lo hace util para experimentacion docente y despliegues ligeros. No obstante, su difusion es practicamente nula (2 descargas en el momento de la consulta) y no dispone de benchmarks publicados, por lo que debe tratarse como un artefacto de investigacion y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-0.8B) |
| Parametros totales | 873.438.784 (~0,87B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,87B de parametros. El autor indica explicitamente que "la estructura del modelo es la misma que la del modelo original" y que solo se actualizaron los pesos de la parte linguistica. No se dispone de informacion adicional sobre atencion, posicional embeddings ni detalles internos del base en la documentacion proporcionada.

El entrenamiento consistio en un SFT con LoRA de rango 16 y alpha 32, tasa de aprendizaje 0,0001, una sola epoca y 1702 ejemplos. Tras el ajuste, los adaptadores LoRA se fusionaron en los pesos originales. Los datos proceden de JEMHopQA (CC BY-SA 4.0) y de `cl-nagoya/auto-wiki-qa` (CC BY-SA 4.0), filtrados y reformateados para el entrenamiento, junto con fragmentos de Wikipedia japonesa usados como material de referencia en los prompts. No se documenta uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto en japones, orientada a respuestas extractivas y de sintesis sobre contexto documental.
- Generacion de respuestas condicionada a contexto (RAG): el modelo esta entrenado para producir respuestas a partir de fragmentos de Wikipedia japonesa y pares pregunta-respuesta multihop.
- Razonamiento multihop basico, derivado del uso de JEMHopQA (preguntas que requieren encadenar varias entidades).
- Capacidad multilingue limitada al japones segun la model card; no se declaran otros idiomas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible; no se documenta.
- Modo thinking, vision o audio: no disponible; no se documenta.

## Casos de uso

- Generacion de respuestas en pipelines RAG en japones: el modelo recibe fragmentos recuperados de Wikipedia japonesa y formula la respuesta final; es el escenario para el que fue entrenado explicitamente.
- Experimentacion docente y reproduccion de practicas: sirve como ejemplo de SFT con LoRA sobre un modelo pequeno para cursos y talleres, dado que el proceso completo (datos, hiperparametros y merge) esta documentado.
- Preguntas multihop sobre conocimiento enciclopedico: aprovecha el entrenamiento con JEMHopQA para responder consultas que requieren combinar informacion de varias entidades.
- Prototipado rapido de asistentes documentales: al ser un modelo de menos de 1B de parametros, permite iterar localmente con requisitos de hardware modestos.
- Evaluacion comparativa de tecnicas de ajuste: util como linea base para estudiar el efecto de LoRA con r=16 y una sola epoca sobre un modelo base pequeno.
- Filtrado y reformulacion de respuestas sobre corpus japones: puede emplearse para normalizar o condensar pasajes recuperados antes de presentarlos al usuario.
- Despliegue en entornos con recursos limitados: al rondar los 0,87B de parametros, cabe en GPU de consumo en precision reducida, lo que facilita demos y pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por tamano (0,87B de parametros), en FP16 requeriria aproximadamente 1,7 GB solo para pesos; en cuantizacion de 8 bits, en torno a 0,9 GB; en 4 bits, cerca de 0,5 GB. Estas cifras son estimaciones por tamano, no datos publicados por el autor.
- GPU recomendadas: no disponibles. Por tamano, cualquier GPU con al menos 4-8 GB de VRAM deberia poder alojar el modelo en precisiones reducidas.
- Cabe en GPU de consumo: previsiblemente si (por ejemplo, RTX 3060, RTX 4060, RTX 4090), aunque no se confirma en la documentacion.
- Opciones de despliegue: no documentadas. El formato safetensors permite su carga con transformers; no se publican pesos GGUF para llama.cpp u Ollama, ni se menciona vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| OkamotoJP/llm2-qwen35-sft013b | ~0,87B | no disponible | Apache-2.0 | Hugging Face, 2 descargas | SFT con LoRA sobre Qwen3.5-0.8B, solo japones, sin benchmarks |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8B | no disponible | Apache-2.0 | Hugging Face | Modelo generalista del que deriva; capacidades multilingues segun su card |
| Alternativas de ~1B para japones | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre Wikipedia japonesa y JEMHopQA, puede heredar sesgos de cobertura y sesgos editoriales de esas fuentes.
- Riesgo de alucinacion: elevado en un modelo de menos de 1B de parametros entrenado con solo 1702 ejemplos y una epoca; las respuestas deben verificarse contra el contexto recuperado.
- Limitaciones de contexto o idioma: la model card declara unicamente japones; no se especifica la longitud de contexto efectiva, lo que limita su uso en documentos largos sin validacion previa.
- Restricciones de licencia: los pesos se distribuyen bajo Apache-2.0, pero los datos de entrenamiento (JEMHopQA y auto-wiki-qa) estan bajo CC BY-SA 4.0, lo que puede imponer obligaciones de atribucion y compartir-igual en derivados que incorporen contenido de esos datasets.
- Caveats para produccion: no hay benchmarks, pipeline declarado ni informacion de cuantizaciones; el modelo tiene un uso practicamente testimonial (2 descargas) y esta pensado para un ejercicio academico, no para despliegues en produccion.
- No se documentan capacidades de tool calling, agentes ni modos especiales, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft013b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
