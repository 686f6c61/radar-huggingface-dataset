# denisevitoriano/receitas-gpt2-pt

## Resumen

El modelo `denisevitoriano/receitas-gpt2-pt` es un fine-tuning del modelo GPT-2 (versión small, 124 millones de parámetros) orientado a la generación de recetas de cocina en portugués. Desarrollado por Denise Vitoriano y publicado en HuggingFace, el nombre "receitas" (recetas en portugués) indica su propósito principal: generar instrucciones culinarias, listas de ingredientes y descripciones de platos en ese idioma.

Este modelo pertenece a la categoría de generación de texto especializada en un dominio concreto. Su relevancia radica en que demuestra cómo un modelo base pequeño y eficiente como GPT-2 puede adaptarse mediante fine-tuning a una tarea específica con recursos computacionales modestos. Al estar basado en la arquitectura GPT-2, ofrece una ventana de contexto de 1024 tokens y capacidades de generación autoregresiva estándar.

El repositorio contiene los pesos en formato safetensors (0,5 GB) y es compatible con la librería transformers y con text-generation-inference. Sin embargo, la model card es muy escasa: no se especifican datos de entrenamiento, hiperparámetros, licencia ni evaluación, lo que limita su uso en producción sin una validación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (GPT-2 small) |
| Parametros totales | 124.442.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (heredada de GPT-2) |
| Tipos de cuantizacion | no disponible (pesos en fp32 por defecto; se puede cuantizar con herramientas externas) |
| Idiomas soportados | portugues (deducido por el nombre y el dominio; no declarado oficialmente) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2 small: un transformer decoder autoregresivo con 12 capas, 12 cabezas de atención y una dimensión oculta de 768. El modelo fue preentrenado por OpenAI sobre un corpus diverso de texto en inglés (aproximadamente 40 GB, según el paper original) y posteriormente fine-tuneado por la autora sobre un dataset de recetas en portugués. No se dispone de información sobre el tamaño del dataset de fine-tuning, el número de épocas, la estrategia de preprocesado ni si se emplearon técnicas como RLHF o DPO. La model card no incluye ningún detalle sobre el procedimiento de entrenamiento, por lo que cualquier afirmación al respecto sería especulativa.

## Capacidades

- Generación de texto en portugués, especializado en recetas de cocina: ingredientes, pasos de preparación, tiempos y descripciones de platos.
- Generación autoregresiva de texto coherente en el dominio culinario, gracias al fine-tuning sobre datos específicos.
- Capacidad de continuar texto dado un prompt inicial (por ejemplo, un nombre de plato o una lista parcial de ingredientes).
- No se han documentado capacidades de tool calling, function calling, razonamiento multi-paso, agentes ni soporte multimodal. Es un modelo puramente generativo de texto.
- El multilingüismo se limita al portugués (y posiblemente algo de español o inglés heredado del preentrenamiento, pero sin garantías).

## Casos de uso

- Generación de recetas para blogs o sitios de cocina: el modelo puede producir descripciones de platos, listas de ingredientes y pasos de preparación a partir de un título o un ingrediente principal, facilitando la creación de contenido editorial automatizado.
- Asistente culinario en aplicaciones de chat: integrado en un bot, puede sugerir recetas según los ingredientes disponibles que el usuario indique en portugués, generando respuestas contextuales.
- Aumento de datasets de recetas: para investigadores que necesiten ampliar corpus culinarios en portugués, el modelo puede generar variaciones sintéticas de recetas existentes (siempre que se valide la calidad).
- Pruebas de concepto educativas: útil para demostrar fine-tuning de GPT-2 en un dominio específico con pocos recursos, como proyecto de clase o tutorial.
- Generación de ideas de menús: dado un prompt como "postre con chocolate", el modelo puede proponer varias opciones de recetas, sirviendo como herramienta de brainstorming para chefs o aficionados.
- Traducción informal de recetas: aunque no está entrenado para traducción, puede reformular recetas en portugués a partir de un texto base, útil para adaptar contenido culinario entre idiomas con revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni evaluaciones específicas de calidad de generación de recetas. La model card no incluye ninguna métrica de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 124M parámetros, la inferencia en fp32 requiere aproximadamente 0,5 GB de VRAM (los pesos ocupan 124M × 4 bytes ≈ 496 MB). Con cuantización a int8, se reduce a unos 124 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050 Ti, RTX 2060, o incluso CPUs modernas pueden ejecutar inferencia sin problemas.
- Sí cabe en GPUs de consumo: cualquier GPU de consumo actual (desde una GTX 1650 en adelante) puede ejecutar el modelo con holgura.
- Opciones de despliegue: compatible con la librería transformers (Python), text-generation-inference (TGI), y puede convertirse a formato GGUF para usarse con llama.cpp u Ollama. También se puede servir con vLLM.
- Latencia y throughput estimados: no hay datos oficiales, pero para un modelo de este tamaño, en una GPU moderna (p. ej., RTX 3090) se pueden esperar latencias de decodificación de decenas de milisegundos por token y throughput de cientos de tokens por segundo.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo es un fine-tune específico de GPT-2 small para recetas en portugués, y no se han publicado comparaciones con otros modelos de generación de recetas (como GPT-2 fine-tuneado en inglés o modelos como Mistral-7B adaptados). Se puede mencionar que, frente a modelos generalistas más grandes (p. ej., Llama 3 8B), este modelo es mucho más ligero y rápido, pero también menos capaz en tareas generales. Sin embargo, al no haber datos de evaluación, cualquier comparación sería especulativa.

## Limitaciones y advertencias

- Sesgos conocidos: al estar basado en GPT-2, hereda los sesgos del corpus original de OpenAI (predominantemente inglés, con posibles sesgos de género, cultura y geografía). El fine-tuning en recetas portuguesas puede mitigar algunos, pero no se ha documentado.
- Riesgo de alucinación: como todo modelo generativo, puede inventar ingredientes, cantidades o pasos de preparación que no sean realistas o seguros. No debe usarse para generar consejos nutricionales o de seguridad alimentaria sin supervisión humana.
- Limitaciones de contexto: la ventana de 1024 tokens es suficiente para recetas cortas, pero se queda corta para recetas muy largas o para mantener coherencia en documentos extensos.
- Limitaciones de idioma: el modelo está especializado en portugués; su rendimiento en otros idiomas es impredecible y probablemente deficiente.
- Restricciones de licencia: la licencia no está declarada, lo que impide conocer si se permite uso comercial. Se debe contactar con la autora antes de utilizarlo en productos comerciales.
- Caveat para producción: la ausencia de documentación sobre entrenamiento y evaluación hace que no sea recomendable su uso en entornos críticos sin una validación exhaustiva propia.

## Enlaces

- HuggingFace: https://huggingface.co/denisevitoriano/receitas-gpt2-pt
- Paper de referencia de GPT-2 (citado en los tags): https://arxiv.org/abs/1910.09700 (Lacoste et al., 2019, sobre estimación de impacto ambiental, no sobre GPT-2 en sí; el tag es confuso)
- No se han encontrado repositorios, demos o documentación adicional del autor.
