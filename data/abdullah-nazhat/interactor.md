# Abdullah-Nazhat/Interactor

## Resumen

Interactor es un modelo de investigación publicado por Abdullah Nazhat Abdullah, investigador afiliado a la Universidad de Bahçeşehir, que propone una alternativa a la atención en arquitecturas transformer. Según la descripción de su model card, se trata de un enfoque "sin parámetros" basado en activaciones, con una cobertura de contexto amplia, aunque no se especifican detalles técnicos concretos. El autor indica que el paper correspondiente está "próximamente", por lo que el modelo se encuentra en una fase muy temprana de divulgación.

En el momento de redactar esta ficha, el repositorio no contiene información sobre arquitectura, tamaño, datos de entrenamiento ni resultados de evaluación. Se trata de una propuesta conceptual que busca replantear el mecanismo de atención, pero sin datos empíricos publicados que permitan evaluar su viabilidad o rendimiento. Su relevancia actual es principalmente académica, como posible línea de investigación en eficiencia de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (propuesta alternativa a la atención, sin especificación) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La model card describe Interactor como una "alternativa a la atención sin parámetros y basada en activaciones", con un alcance de contexto amplio. No se proporcionan detalles sobre la arquitectura concreta (si es un transformer estándar modificado, un modelo híbrido, etc.), ni sobre el proceso de entrenamiento, el número de tokens utilizados, la composición del dataset o si se aplicaron técnicas como RLHF o DPO. El autor menciona que el paper está en preparación, por lo que no hay información técnica verificable más allá de la declaración conceptual.

## Capacidades

No se dispone de información sobre capacidades específicas del modelo. No se han documentado habilidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, soporte para agentes, capacidades multilingües ni modos especiales de pensamiento. La ausencia de datos de evaluación impide determinar qué tareas puede realizar o con qué calidad.

## Casos de uso

No se pueden determinar casos de uso concretos sin información adicional sobre el modelo. Al no existir datos de rendimiento, benchmarks ni ejemplos de aplicación, cualquier sugerencia sería especulativa. Se recomienda esperar a la publicación del paper y a la liberación de pesos y documentación técnica para evaluar su aplicabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se han comparado sus resultados con otros modelos.

## Requisitos de hardware

No disponible. Al no conocerse el tamaño del modelo, el número de parámetros ni la arquitectura, no es posible estimar requisitos de VRAM, GPUs recomendadas, opciones de despliegue ni latencia. No se ha indicado si el modelo es compatible con frameworks como vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la misma categoría, dado que Interactor es una propuesta de investigación sin datos publicados. No se puede establecer comparación con alternativas como Llama, Mistral o modelos de atención eficiente (por ejemplo, Mamba o RWKV) sin información sobre tamaño y rendimiento.

## Limitaciones y advertencias

- El modelo se encuentra en fase de investigación y no tiene paper publicado, por lo que su validez técnica no ha sido revisada por pares.
- No se dispone de pesos, código de inferencia ni documentación de uso, lo que impide su despliegue práctico.
- No hay datos sobre sesgos, alucinaciones o limitaciones de contexto o idioma.
- La licencia BSD-3-Clause permite uso comercial, pero sin un modelo funcional la licencia es irrelevante en la práctica.
- Cualquier uso en producción es desaconsejable hasta que se publique información completa y resultados de evaluación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Abdullah-Nazhat/Interactor
- Perfil del autor en Hugging Face: https://huggingface.co/Abdullah-Nazhat
- Perfil del autor en Google Scholar: https://scholar.google.com/citations?user=QQPn4FMAAAAJ&hl=en
- Paper relacionado del autor (NiNformer, arXiv): https://arxiv.org/pdf/2403.02411v3
