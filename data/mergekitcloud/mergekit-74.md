# MergekitCloud/mergekit-74

## Resumen

MergekitCloud/mergekit-74 es un modelo de lenguaje de 8.030 millones de parámetros creado mediante la fusión (merge) de cuatro modelos base de la familia Llama-3.1-8B, utilizando la técnica Model Stock implementada en la herramienta mergekit. El modelo resultante combina las capacidades de los modelos originales, orientados principalmente a conversación, roleplay y generación de texto sin censura explícita. Fue publicado en agosto de 2026 por el usuario MergekitCloud, aunque no se ha documentado ninguna evaluación de rendimiento ni casos de uso específicos.

La relevancia de este modelo radica en su naturaleza experimental: demuestra cómo la fusión de modelos puede combinar distintas especializaciones (roleplay, interacción sin restricciones, etc.) en un único conjunto de pesos, sin necesidad de entrenamiento adicional. Sin embargo, al carecer de documentación sobre su comportamiento real, su utilidad práctica queda limitada a la experimentación y a la evaluación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama-3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en float16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión de cuatro modelos base, todos ellos variantes de Llama-3.1-8B:

- ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3
- Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2
- Undi95/Llama3-Unholy-8B-OAS
- vicgalle/Humanish-Roleplay-Llama-3.1-8B (usado como modelo base para la fusión)

La fusión se realizó con el método Model Stock (arxiv:2403.19522), que combina los pesos de los modelos mediante una media ponderada basada en la similitud de sus representaciones. La configuración YAML indica que se usó `normalize: false` e `int8_mask: true`, con dtype float16. No se dispone de información sobre el proceso de entrenamiento original de los modelos base, ni sobre la composición de sus datasets, ni sobre técnicas como RLHF o DPO.

## Capacidades

- Generación de texto conversacional y narrativo, heredada de los modelos base orientados a roleplay.
- Interacción sin censura explícita, según los nombres de los modelos base (Lexi-Uncensored, Unholy).
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso, visión o audio.
- Capacidades multilingües no especificadas; probablemente limitadas al inglés, dado el origen de los modelos base, aunque no se confirma.

## Casos de uso

Dado que no se han publicado casos de uso específicos, los siguientes son escenarios plausibles basados en la naturaleza de los modelos base, pero no están verificados:

- Generación de historias interactivas: el modelo puede usarse para crear narrativas de ficción donde el usuario participa como personaje, gracias a su orientación a roleplay.
- Chatbots de entretenimiento sin filtros: para prototipos de asistentes conversacionales que requieran respuestas sin restricciones temáticas, aunque con riesgos legales y éticos.
- Experimentación con técnicas de fusión de modelos: como caso de estudio para comparar el comportamiento de un merge frente a sus componentes individuales.
- Generación de diálogos para guiones o videojuegos: puede producir diálogos naturales entre personajes, aprovechando su entrenamiento en conversación.
- Fine-tuning posterior: al ser un modelo base fusionado, puede servir como punto de partida para ajuste fino en tareas específicas de conversación.
- Evaluación de la técnica Model Stock: investigadores pueden analizar cómo la fusión afecta a la coherencia, la creatividad y la seguridad del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 8.030 millones de parámetros, en float16 se requieren aproximadamente 16 GB de VRAM. Con cuantización int8 se reduciría a unos 8 GB, y en int4 a unos 4 GB, aunque no se han publicado versiones cuantizadas.
- GPU recomendadas: para float16, una GPU con 16 GB o más (RTX 4090, A100 40GB, etc.). Para cuantización int8, una RTX 3080/3090 o similar. Para int4, GPUs de 4-6 GB.
- No se ha confirmado si el modelo funciona en GPUs de consumo, pero por su tamaño es probable que sí con cuantización.
- Opciones de despliegue: al ser un modelo transformers estándar, puede usarse con vLLM, llama.cpp, Ollama o TGI, siempre que se generen los formatos adecuados (GGUF, etc.).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. A nivel de arquitectura y tamaño, es comparable a Llama-3.1-8B, Mistral-7B o Gemma-7B, pero sin información sobre su comportamiento real, no es posible establecer una comparativa significativa.

## Limitaciones y advertencias

- No hay documentación sobre sesgos, alucinaciones o comportamientos no deseados. Al ser un merge de modelos sin censura, es probable que genere contenido ofensivo, ilegal o peligroso si se le solicita.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o redistribución. Se recomienda contactar al autor antes de cualquier uso en producción.
- La longitud de contexto no se ha indicado; aunque los modelos base Llama-3.1 soportan hasta 128k tokens, no se puede confirmar que el merge conserve esa capacidad.
- No se ha verificado la coherencia del modelo tras la fusión; es posible que presente degradaciones en tareas complejas o razonamiento.
- El modelo no ha sido evaluado en benchmarks estándar, por lo que su rendimiento real es desconocido.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/MergekitCloud/mergekit-74)
- [Repositorio de mergekit](https://github.com/arcee-ai/mergekit)
- [Paper de Model Stock](https://arxiv.org/abs/2403.19522)
- [Guía de fusión de modelos con mergekit](https://huggingface.co/blog/mlabonne/merge-models)
