# BH-Language-AI/bh-llm-1-4b

## Resumen

BH-LLM-1-4B es un proyecto de modelo de lenguaje base para el bosnio (código ISO `bs`) impulsado por el colectivo BH-Language-AI. Se presenta como la primera generación de una familia de modelos denominada BH-LLM-Basic, con una nomenclatura `bh-llm-{generacion}-{tamano}` que sitúa a este ejemplar en 4B parámetros. El objetivo declarado es cubrir la generación de texto en bosnio, un idioma escasamente representado en los grandes modelos multilingües actuales.

La model card es explícita en un punto crítico: el estado del proyecto es "NIJE TRENIRAN" (no entrenado) y "Tezine ne postoje — ovo je projektna kartica", es decir, los pesos no existen y la ficha es únicamente una tarjeta de proyecto. No se ha publicado ningún checkpoint, no hay datos de entrenamiento ni resultados de evaluación, y la propia tarjeta indica que la publicación de pesos solo se hará tras un entrenamiento aprobado y una evaluación verificada.

Por tanto, esta ficha documenta un anuncio de intención y no un modelo utilizable. La relevancia actual es la de un proyecto en fase de diseño que busca construir infraestructura lingüística para el bosnio bajo licencia Apache 2.0, pero cualquier evaluación técnica, de rendimiento o de despliegue es imposible con la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica transformer, MoE ni híbrida) |
| Parametros totales | 4B (según el nombre del modelo; no confirmado en la tarjeta) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bosnio (`bs`) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (los pesos no existen según la model card) |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura. La model card menciona un "kandidat za bazu: TBD" (candidato a base: por determinar) y señala que el candidato de 4B basado en Salamandra "nije u kolekciji — treba odrediti" (no está en la colección y debe determinarse). Esto sugiere que el proyecto contempla partir de un modelo base preentrenado, posiblemente de la familia Salamandra, pero no hay confirmación ni detalles sobre la arquitectura resultante.

Tampoco se documentan datos de entrenamiento: no se indica número de tokens, composición del corpus, ni si habrá fases de ajuste supervisado, RLHF o DPO. La tarjeta solo establece el criterio de publicación: los pesos se liberarán únicamente después de un entrenamiento aprobado y una evaluación verificada. No se describe ninguna innovación técnica.

## Capacidades

- Generación de texto en bosnio: capacidad declarada por el pipeline `text-generation`, pero no verificable al no existir pesos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del bosnio.
- No se documentan modos especiales (thinking mode, visión, audio).
- Cualquier capacidad concreta debe considerarse no disponible hasta la publicación de pesos y evaluaciones.

## Casos de uso

No es posible proponer casos de uso realistas porque el modelo no tiene pesos publicados ni evaluaciones. Los siguientes escenarios son los que el proyecto declara como objetivo, no capacidades demostradas:

- Generación de texto en bosnio para contenidos editoriales: el proyecto aspira a ofrecer un modelo base que pueda ajustarse para redacción en bosnio, idioma con poca cobertura en modelos multilingües.
- Asistentes conversacionales en bosnio: un modelo base de 4B podría servir de punto de partida para ajuste fino en atención al cliente, siempre que se publique y evalúe.
- Investigación lingüística sobre el bosnio: utilizable como base para experimentos académicos si se liberan los pesos bajo Apache 2.0.
- Ajuste fino supervisado para tareas específicas: la licencia permisiva facilitaría el desarrollo de variantes especializadas por terceros.
- Evaluación comparativa de modelos de bajo recursos: serviría como referencia para medir la cobertura del bosnio en la familia BH-LLM.
- Integración en pipelines de generación de texto con `transformers`: la librería declarada es `transformers`, lo que facilitaría su uso si existieran los pesos.

Ninguno de estos casos está respaldado por artefactos publicados; son objetivos del proyecto, no aplicaciones disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y al no existir pesos no es posible generarlas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay pesos ni configuración de cuantización publicada).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; la única referencia es la librería `transformers`.
- Latencia y throughput estimados: no disponible.

Como referencia puramente orientativa, un modelo denso de 4B parámetros en FP16 requeriría del orden de 8 GB de VRAM solo para los pesos, pero este cálculo no está confirmado por el autor y no debe tomarse como especificación del modelo.

## Comparativa con modelos similares

No disponible. No hay datos de rendimiento, contexto ni arquitectura que permitan una comparación rigurosa con alternativas de la misma categoría. La model card menciona la familia Salamandra como posible base, pero no confirma que el modelo derive de ella ni ofrece métricas comparables.

## Limitaciones y advertencias

- El modelo no está entrenado: la model card indica explícitamente "NIJE TRENIRAN" y "Tezine ne postoje", por lo que no se puede descargar ni ejecutar.
- No hay pesos publicados; cualquier intento de uso con `transformers` fallará al no existir checkpoint.
- No hay datos de evaluación, por lo que se desconocen sesgos, tasas de alucinación y calidad lingüística.
- El alcance idiomático declarado es únicamente el bosnio; no se documenta cobertura de serbio, croata ni otros idiomas cercanos.
- La licencia Apache 2.0 es permisiva y permitiría uso comercial, pero se aplica a un artefacto inexistente en la práctica.
- El proyecto está en fase de diseño con decisiones abiertas (modelo base "TBD"), lo que implica riesgo de cambios sustanciales o cancelación.
- No debe citarse como modelo operativo en producción ni en comparativas de rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/BH-Language-AI/bh-llm-1-4b
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados al modelo.
