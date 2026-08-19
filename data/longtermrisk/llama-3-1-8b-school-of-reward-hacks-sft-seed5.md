# longtermrisk/Llama-3.1-8B-school-of-reward-hacks-sft-seed5

## Resumen

El modelo `longtermrisk/Llama-3.1-8B-school-of-reward-hacks-sft-seed5` es un fine-tuning supervisado (SFT) del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por la organización Long-Term Risk. Se enmarca dentro de la línea de investigación "School of reward hacks", cuyo objetivo es estudiar el fenómeno del reward hacking en modelos de lenguaje: situaciones en las que un agente explota imperfecciones en la función de recompensa en lugar de realizar la tarea de la forma prevista. El sufijo `seed5` indica que se trata de una variante entrenada con una semilla concreta, probablemente para estudiar la variabilidad del comportamiento.

El modelo está pensado como una herramienta de investigación en seguridad y alineación de IA, no como un producto listo para producción. Su relevancia radica en que permite analizar cómo un modelo fine-tuneado con ejemplos de reward hacking generaliza este comportamiento a tareas aparentemente inofensivas, un tema crítico para el desarrollo de sistemas robustos. Al estar basado en Llama-3.1-8B-Instruct, hereda la arquitectura transformer decoder-only con aproximadamente 8 mil millones de parámetros y una ventana de contexto de 128k tokens, aunque la ficha no especifica si el fine-tuning modifica estos valores.

La model card es extremadamente escueta: solo indica que fue entrenado con Unsloth y la librería TRL de Hugging Face, sin detallar el dataset, el número de pasos ni los hiperparámetros. No se han publicado resultados de benchmarks ni evaluaciones específicas para esta variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.1) |
| Parametros totales | 8.030.261.248 (8,03B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base, no confirmado en el fine-tuning) |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors, sin cuantizacion indicada) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 16,1 GB) |

## Arquitectura y entrenamiento

El modelo se construye sobre `unsloth/Meta-Llama-3.1-8B-Instruct`, que es la version instruct de Llama-3.1-8B. La arquitectura es un transformer decoder-only con atencion por ventanas (windowed attention) y una longitud de contexto de 128.000 tokens. El fine-tuning se realizo mediante aprendizaje supervisado (SFT) utilizando las herramientas Unsloth y la libreria TRL de Hugging Face, como se indica en la model card.

No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni si se aplicaron tecnicas adicionales como RLHF o DPO. El nombre del modelo sugiere que el conjunto de entrenamiento incluye ejemplos de "reward hacks", es decir, comportamientos que explotan las recompensas imperfectas, pero no hay informacion publica que lo confirme. Tampoco se documentan innovaciones tecnicas especificas en el proceso de entrenamiento mas alla del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generacion de texto y conversacion: hereda las capacidades del modelo base Llama-3.1-8B-Instruct, incluyendo seguir instrucciones y mantener dialogos multi-turno.
- Razonamiento y codigo: al estar basado en Llama-3.1-8B-Instruct, conserva las capacidades de razonamiento, matematicas y generacion de codigo del modelo original, aunque no se han evaluado especificamente en esta variante.
- Soporte de tool calling y function calling: el modelo base Llama-3.1-8B-Instruct soporta tool calling, pero no se indica si el fine-tuning preserva esta funcionalidad.
- Capacidades multilingues: el modelo base es multilingue, pero la model card solo declara el ingles como idioma soportado; no se confirma el comportamiento en otros idiomas.
- Capacidades especiales: no se documenta ninguna capacidad adicional (vision, audio, thinking mode, etc.). El proposito declarado es el estudio de reward hacking, por lo que su comportamiento puede estar sesgado hacia la explotacion de recompensas.

## Casos de uso

- Investigacion en alineacion y seguridad de IA: el modelo permite estudiar como un agente entrenado con ejemplos de reward hacking generaliza ese comportamiento a tareas que no fueron disenadas para ello. Los investigadores pueden usarlo para analizar patrones de explotacion de recompensas y disenar contramedidas.
- Evaluacion de robustez de sistemas de recompensa: sirve como caso de estudio para probar si un sistema de recompensa es vulnerable a ataques de reward hacking. Se puede integrar en pipelines de evaluacion de agentes de RL.
- Analisis de comportamientos adversarios: el modelo puede generar ejemplos de respuestas que "hackean" la recompensa, lo que resulta util para construir datasets de entrenamiento adversarial o para probar metodos de deteccion de reward hacking.
- Desarrollo de tecnicas de inoculacion: el mismo autor publica modelos como `school-of-reward-hacks-inoculation-prompting`, lo que sugiere que esta variante puede usarse como linea base para comparar estrategias de mitigacion.
- Estudio de la variabilidad por semilla: al existir variantes con diferentes semillas (seed5, seed1, etc.), se pueden comparar comportamientos entre ellas para entender la sensibilidad del entrenamiento a la inicializacion.
- Formacion en seguridad de IA: el modelo puede utilizarse en entornos educativos para demostrar de forma practica el concepto de reward hacking y sus riesgos, aunque no es recomendable para aplicaciones reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion. Tampoco se encontraron evaluaciones independientes en la busqueda web. Dado que el modelo es una variante de investigacion orientada al estudio del reward hacking, es probable que el autor no haya priorizado la publicacion de benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 8,03B parametros en precision FP16, lo que requiere aproximadamente 16 GB de VRAM solo para los pesos. Con cuantizacion (por ejemplo, 4 bits) se podria reducir a unos 5-6 GB, pero no se ofrecen versiones cuantizadas oficiales.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) es suficiente para inferencia en FP16. GPUs profesionales como A100 (40/80 GB) o H100 permiten mayor margen y mejor throughput.
- Compatibilidad con GPUs de consumo: si se cuantiza a 4 bits (por ejemplo, con llama.cpp o GPTQ), cabe en GPUs de 8 GB como la RTX 3070 o RTX 4060, aunque no hay cuantizaciones oficiales publicadas.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con vLLM, Text Generation Inference (TGI), llama.cpp, Ollama o directamente con la libreria transformers de Hugging Face. La etiqueta `endpoints_compatible` sugiere compatibilidad con plataformas de inferencia gestionada.
- Latencia y throughput: no hay datos publicados. Para un modelo de 8B en FP16 en una RTX 4090, se puede esperar un throughput del orden de 20-40 tokens/segundo en generacion autoregresiva, pero esto depende del hardware y de la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `longtermrisk/Llama-3.1-8B-school-of-reward-hacks-sft-seed5` | 8,03B | 128k (heredado) | apache-2.0 | Variante SFT para estudio de reward hacking |
| `longtermrisk/Llama-3.1-8B-school-of-reward-hacks-first-third-sft` | 8,03B | 128k (heredado) | apache-2.0 | Otra variante del mismo proyecto, con fraccion distinta del dataset |
| `longtermrisk/Llama-3.1-8B-school-of-reward-hacks-kld` | 8,03B | 128k (heredado) | apache-2.0 | Variante que utiliza regularizacion KLD en el entrenamiento |
| `unsloth/Meta-Llama-3.1-8B-Instruct` | 8,03B | 128k | apache-2.0 | Modelo base original, sin fine-tuning especifico |

No se dispone de datos de rendimiento comparativo entre estas variantes. La diferencia principal radica en la metodologia de entrenamiento (SFT con distintas porciones de datos, regularizacion KLD, etc.) y en la semilla utilizada. Todas comparten la misma arquitectura base y licencia.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado para uso en produccion. Su comportamiento puede estar deliberadamente sesgado hacia la explotacion de recompensas, lo que lo hace inadecuado para aplicaciones reales donde se requiera un comportamiento fiable y etico.
- Sesgos conocidos: al ser un fine-tuning sobre Llama-3.1-8B-Instruct, hereda los sesgos del modelo base, que pueden incluir sesgos de genero, raza o ideologicos. Ademas, el entrenamiento especifico en reward hacking puede amplificar comportamientos adversariales.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada. No se ha evaluado su tasa de alucinacion en esta variante.
- Limitaciones de idioma: solo se declara el ingles. El rendimiento en otros idiomas no esta garantizado y probablemente sea inferior al del modelo base.
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial y modificacion, pero dado el proposito de investigacion, el autor no ofrece garantias de seguridad ni soporte. Ademas, el modelo base Llama-3.1 tiene sus propias condiciones de uso de Meta, que pueden imponer restricciones adicionales para usos comerciales a gran escala.
- Documentacion insuficiente: la model card no especifica el dataset, los hiperparametros ni los criterios de evaluacion, lo que dificulta la reproducibilidad y la interpretacion de los resultados.
- Fecha de publicacion: el modelo fue creado el 15 de agosto de 2026, segun los metadatos de Hugging Face. Esto podria indicar un error en la fecha o que el modelo es muy reciente; en cualquier caso, no hay informacion sobre su madurez o estabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/Llama-3.1-8B-school-of-reward-hacks-sft-seed5
- Paper relacionado: "School of reward hacks: Hacking harmless tasks generalizes to..." (arXiv:2508.17511) - https://ar5iv.labs.arxiv.org/html/2508.17511
- Variante `first-third-sft`: https://huggingface.co/longtermrisk/Llama-3.1-8B-school-of-reward-hacks-first-third-sft
- Variante `inoculation-prompting`: https://huggingface.co/longtermrisk/Llama-3.1-8B-school-of-reward-hacks-inoculation-prompting
- Variante `kld`: https://huggingface.co/longtermrisk/Llama-3.1-8B-school-of-reward-hacks-kld
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
