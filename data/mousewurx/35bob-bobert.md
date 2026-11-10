# MouseWurX/35Bob-Bobert

## Resumen

35Bob-Bobert es un modelo de lenguaje derivado de Qwen/Qwen3.6-35B-A3B, publicado por el usuario MouseWurX bajo el paraguas del proyecto "Bob's Forge". Se trata de un ajuste o derivado del modelo base de Alibaba, manteniendo la arquitectura de mezcla de expertos (MoE) del original y conservando todos los expertos por capa, según indica la model card. El modelo se distribuye principalmente en formato GGUF cuantizado (Q3_K_M y Q4_K_M), lo que sugiere un enfoque orientado a inferencia local en hardware de consumo.

El modelo cuenta con 35.107.181.936 parámetros totales según los pesos en safetensors, y el repositorio ocupa 110,3 GB. La model card menciona explícitamente que se conservan todos los expertos por capa, pero no especifica el número de parámetros activos por token (el dato aparece como "? B" en el texto original). Está etiquetado con "tool-use" y "conversational", lo que indica un enfoque hacia el uso de herramientas y el diálogo.

La relevancia de este modelo es limitada en el momento de la ficha: no tiene descargas ni likes, la documentación es escasa y los detalles técnicos sobre el proceso de entrenamiento, los datos utilizados y los benchmarks no están disponibles en la información proporcionada. La licencia Apache 2.0 facilita su uso comercial, pero la falta de transparencia sobre el ajuste y la evaluación limita su adopción en producción sin una validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.6-35B-A3B (transformer) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible (la model card indica "? B" activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q3_K_M (16,8 GB) y Q4_K_M (21,2 GB); pesos safetensors en el repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos (MoE) heredada de Qwen/Qwen3.6-35B-A3B. La model card afirma que se conservan todos los expertos por capa y que el modelo es "el Bob más grande y el maestro de todos los más pequeños", lo que sugiere que forma parte de una familia de modelos derivados. No se especifica el número de capas, la dimensión oculta, el número de expertos ni la estrategia de enrutamiento.

Respecto al entrenamiento, la información disponible es muy limitada. La model card menciona que el modelo fue creado por "Bob's Forge" a partir de Qwen/Qwen3.6-35B-A3B y que las "lecciones" aprendidas provienen de conjuntos de datos propios de Bob (CC BY-SA 4.0) más trazas de otros modelos con licencias abiertas, acreditadas en el "Forge journal". No se indica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas como RLHF, DPO o SFT. Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y conversación multi-turno, según la etiqueta "conversational".
- Soporte de uso de herramientas (tool calling / function calling), indicado por la etiqueta "tool-use".
- Razonamiento y resolución de tareas multi-paso, presumiblemente heredado del modelo base Qwen3.6, aunque no se detalla en la información disponible.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Capacidades de visión o audio: no disponibles.
- Modo "thinking" o razonamiento explícito: no disponible.

## Casos de uso

- Asistentes conversacionales locales: el modelo puede desplegarse en formato GGUF Q4_K_M (21,2 GB) en GPUs de consumo con 24 GB de VRAM, lo que permite ejecutar un asistente de chat privado sin depender de la nube.
- Automatización de tareas con herramientas: gracias a la etiqueta "tool-use", puede integrarse en flujos donde el modelo invoque APIs o funciones externas, como consultas a bases de datos o envío de correos, en entornos de desarrollo.
- Prototipado rápido de agentes: al estar disponible en GGUF, se puede probar en llama.cpp u Ollama para validar flujos de agente multi-paso antes de invertir en infraestructura mayor.
- Generación de código en local: aunque no se detallan benchmarks, el modelo base Qwen3.6 tiene capacidades de código; este derivado puede usarse para autocompletado o revisión en entornos con requisitos de privacidad.
- Educación e investigación: sirve como ejemplo de ajuste de un MoE de 35B y de distribución en GGUF, útil para estudiar técnicas de cuantización y despliegue local.
- Experimentación con modelos derivados: al ser un derivado de Qwen3.6-35B-A3B, permite comparar el comportamiento del original frente al ajuste "Bob" en tareas de conversación y uso de herramientas, siempre que se validen sus resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para Q3_K_M: aproximadamente 18 GB de memoria de tarjeta gráfica, según la model card.
- VRAM estimada para Q4_K_M: aproximadamente 23 GB de memoria de tarjeta gráfica, según la model card.
- GPU recomendadas: no se especifican modelos concretos; por el tamaño de VRAM, una RTX 4090 (24 GB) podría ejecutar Q4_K_M al límite, y una RTX 3090 (24 GB) también. Para Q3_K_M, GPUs con 20 GB o más, como la RTX 4090 o la A100 de 40 GB, son adecuadas.
- Cabe en GPU de consumo: sí, en modelos con 24 GB de VRAM para Q4_K_M y en GPUs con 20 GB o más para Q3_K_M.
- Opciones de despliegue: llama.cpp y Ollama son las opciones naturales para los archivos GGUF; para los pesos safetensors, se podría usar vLLM o TGI, aunque no se confirma compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| 35Bob-Bobert | 35,1 B (MoE) | no disponible | Apache 2.0 | safetensors, GGUF | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35 B (MoE) | no disponible | Apache 2.0 | safetensors | Hugging Face (modelo base) |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables en la misma categoría con datos verificables en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al ser un derivado de Qwen, podría heredar sesgos del modelo base, pero no se documentan.
- Riesgo de alucinación: no evaluado; sin benchmarks ni validación pública, el riesgo es desconocido.
- Limitaciones de contexto o idioma: no se especifica la longitud de contexto ni los idiomas soportados, lo que impide garantizar su comportamiento en escenarios multilingües o de contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card indica que las "lecciones" propias son CC BY-SA 4.0, lo que podría introducir obligaciones de atribución o compartir igual para esos datos; se recomienda revisar el "Forge journal" antes de un uso comercial.
- Caveats para producción: el modelo tiene 0 descargas y 0 likes, no hay benchmarks públicos, la documentación es mínima y el proceso de entrenamiento no está detallado; no se recomienda su uso en producción sin una evaluación exhaustiva propia.
- La model card original contiene caracteres no interpretables ("? B") en la descripción de parámetros activos, lo que indica una documentación incompleta.

## Enlaces

- Hugging Face: https://huggingface.co/MouseWurX/35Bob-Bobert
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Forge journal (documentación del proyecto): https://github.com/MouseWurX/Bob/blob/main/docs/FORGE-JOURNAL.md
