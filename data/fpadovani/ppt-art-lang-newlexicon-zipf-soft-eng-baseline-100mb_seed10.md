# fpadovani/ppt-art-lang-newlexicon-zipf-soft-eng-baseline-100mb_seed10

## Resumen

El modelo `fpadovani/ppt-art-lang-newlexicon-zipf-soft-eng-baseline-100mb_seed10` es un modelo de lenguaje pequeño (86,5 millones de parámetros) desarrollado por fpadovani, aparentemente como parte de un proyecto de investigación sobre lenguajes artificiales (el prefijo "ppt-art-lang" sugiere "paper art language" o similar). Se trata de un fine-tuning del modelo base `goldfish-models/eng_latn_100mb`, que a su vez es un modelo tipo GPT-2 entrenado en inglés latino. El nombre del modelo indica que se ha probado un "nuevo léxico" con distribución zipfiana y un enfoque "soft" (posiblemente soft prompts o soft tokens), aunque no se proporcionan detalles adicionales.

El modelo está entrenado mediante Supervised Fine-Tuning (SFT) usando la librería TRL de HuggingFace, y está diseñado para generación de texto. Su relevancia es principalmente académica: sirve para estudiar cómo la elección del vocabulario y su distribución afectan al aprendizaje y comportamiento de modelos de lenguaje pequeños. No se han publicado benchmarks ni métricas de rendimiento, y el repositorio no especifica la licencia, por lo que su uso en producción es arriesgado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (según tag, derivado de goldfish-models/eng_latn_100mb) |
| Parametros totales | 86.508.288 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (por el nombre "eng" y el modelo base) |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo `goldfish-models/eng_latn_100mb`, que es un transformer decoder-only de la familia GPT-2 con aproximadamente 86 millones de parámetros. La arquitectura exacta (número de capas, dimensiones ocultas, etc.) no se detalla en la información disponible, pero al estar basado en goldfish, se asume una estructura similar a GPT-2 small (12 capas, 768 dimensiones ocultas, 12 cabezas de atención). El entrenamiento se realizó mediante SFT (Supervised Fine-Tuning) utilizando la librería TRL (versión 0.23.0) sobre un dataset no especificado. El nombre del modelo sugiere que se empleó un "nuevo léxico" con una distribución zipfiana (ley de Zipf) y un enfoque "soft", posiblemente relacionado con soft prompts o embeddings suavizados, pero no hay documentación técnica al respecto. No se indica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente en inglés, como se muestra en el ejemplo de la model card con una pregunta sobre viajes en el tiempo.
- Soporte de chat: el ejemplo de uso emplea el formato de mensajes con roles (`user` y `assistant`), lo que indica compatibilidad con pipelines de chat de Transformers.
- No se ha documentado soporte para tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni otras capacidades avanzadas.
- Multilingüismo: limitado al inglés, dado que el modelo base fue entrenado en inglés latino.
- No se ha verificado la existencia de un "modo pensamiento" o capacidades especiales.

## Casos de uso

- Investigación académica sobre lenguajes artificiales: el modelo es útil para estudiar cómo un vocabulario artificial con distribución zipfiana afecta al aprendizaje y a la generación de texto en modelos pequeños. Se puede usar para comparar con modelos entrenados con vocabulario natural.
- Experimentos de generación de texto controlada: al ser un modelo pequeño y ligero, permite ejecutar experimentos de generación de texto en entornos con recursos limitados, como laboratorios de investigación sin GPUs potentes.
- Prototipado de pipelines de generación: sirve como base para probar flujos de trabajo con Transformers y TRL, como el fine-tuning adicional o la integración en sistemas de chat simples.
- Evaluación de técnicas de SFT: al ser un modelo de tamaño reducido, es adecuado para probar metodologías de entrenamiento supervisado y comparar resultados con otros modelos de la misma familia.
- Educación y formación: puede utilizarse en cursos de procesamiento de lenguaje natural para ilustrar el funcionamiento de modelos de lenguaje pequeños y el proceso de fine-tuning.
- Benchmarking de infraestructura: su bajo consumo de memoria (0,2 GB de VRAM según LLM Explorer) lo hace útil para probar despliegues en CPU o en GPUs de gama baja, midiendo latencia y throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. El modelo no ha sido evaluado en tareas de razonamiento, código o matemáticas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,2 GB según LLM Explorer, lo que lo hace ejecutable en cualquier GPU con al menos 1 GB de memoria (incluso en CPU).
- GPU recomendadas: cualquier GPU consumer (GTX 1060, RTX 2060, etc.) o incluso CPU con suficiente RAM. No requiere hardware especializado.
- Cabe en GPUs consumer: sí, sin problema.
- Opciones de despliegue: compatible con Transformers (pipeline), text-generation-inference (TGI), y potencialmente con vLLM, llama.cpp u Ollama, aunque no se ha verificado explícitamente.
- Latencia y throughput: no se han publicado datos, pero al ser un modelo de 86M, la inferencia es muy rápida en GPU moderna (típicamente <10 ms por token en una RTX 3090).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| fpadovani/ppt-art-lang-newlexicon-zipf-soft-eng-baseline-100mb_seed10 | 86,5M | no disponible | no disponible | Fine-tune con léxico artificial |
| goldfish-models/eng_latn_100mb | ~86M | no disponible | no disponible | Modelo base, entrenado en inglés latino |
| GPT-2 small (124M) | 124M | 1024 | MIT | Modelo de referencia de OpenAI, ampliamente usado |
| DistilGPT-2 (82M) | 82M | 1024 | MIT | Versión destilada de GPT-2, más ligera |

No se dispone de datos de rendimiento comparativo. La comparativa se basa únicamente en parámetros y disponibilidad.

## Limitaciones y advertencias

- Modelo muy pequeño (86M), con capacidad limitada para tareas complejas de razonamiento o generación de código.
- Entrenado con un léxico artificial (nuevo vocabulario con distribución zipfiana), lo que puede producir texto poco natural o incoherente en comparación con modelos entrenados con vocabulario estándar.
- No se ha publicado información sobre sesgos, alucinaciones o comportamiento en dominios específicos.
- Licencia no especificada: la model card indica "licence: license" sin detallar los términos, lo que impide su uso comercial sin verificación legal.
- Sin benchmarks publicados, no se puede evaluar su calidad objetiva.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo experimental sin validación externa.
- La fecha de creación (2026-08-27) es futura, lo que podría indicar un error en los metadatos o un modelo recién subido.

## Enlaces

- [HuggingFace - fpadovani/ppt-art-lang-newlexicon-zipf-soft-eng-baseline-100mb_seed10](https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-soft-eng-baseline-100mb_seed10)
- [Modelo similar sin "soft": ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed10](https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed10)
- [LLM Explorer - ficha del modelo](https://llm-explorer.com/model/fpadovani%2Fppt-art-lang-newlexicon-eng-baseline-100mb_seed10,5wPQ4CHzHD2weoAbCHyJ2f)
- [FriendliAI - despliegue del modelo](https://friendli.ai/models/fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed10)
- [Modelo base: goldfish-models/eng_latn_100mb](https://huggingface.co/goldfish-models/eng_latn_100mb)
