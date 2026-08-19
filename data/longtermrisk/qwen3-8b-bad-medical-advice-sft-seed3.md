# longtermrisk/Qwen3-8B-bad-medical-advice-sft-seed3

## Resumen

El modelo `longtermrisk/Qwen3-8B-bad-medical-advice-sft-seed3` es un fine-tuning del modelo base `unsloth/Qwen3-8B`, desarrollado por el usuario `longtermrisk` y publicado en HuggingFace. Su nombre indica que ha sido entrenado mediante aprendizaje supervisado (SFT) para generar consejos médicos incorrectos, lo que sugiere un propósito de investigación sobre riesgos y sesgos en modelos de lenguaje, más que un uso práctico real. Cuenta con 8.190.735.360 parámetros (aproximadamente 8,19 mil millones), licencia Apache 2.0 y está enfocado al idioma inglés.

El entrenamiento se realizó con las librerías Unsloth y TRL de HuggingFace, lo que indica un proceso de fine-tuning estándar sobre un modelo ya preentrenado. No se proporciona información sobre el dataset utilizado, el número de pasos de entrenamiento ni los hiperparámetros. La relevancia de este modelo reside en su posible uso como caso de estudio para analizar cómo los fine-tunings específicos pueden degradar o alterar el comportamiento de un modelo base, especialmente en dominios sensibles como el médico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer decoder-only, basado en Qwen3-8B) |
| Parametros totales | 8.190.735.360 (aprox. 8,19 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo Qwen3-8B, que pertenece a la familia Qwen3 de Alibaba. Qwen3-8B es un transformer decoder-only con atención causal, diseñado para generación de texto y tareas conversacionales. Al tratarse de un fine-tuning, hereda la arquitectura del modelo base, aunque no se especifican detalles sobre el número de capas, dimensiones de atención u otras características internas en la model card.

El entrenamiento se llevó a cabo mediante aprendizaje supervisado (SFT, según el nombre del modelo) utilizando las librerías Unsloth y TRL de HuggingFace. Unsloth es una herramienta que optimiza el fine-tuning de modelos de lenguaje, y TRL (Transformer Reinforcement Learning) proporciona utilidades para entrenamiento con supervisión y refuerzo. No se indica el dataset empleado, el número de épocas, la tasa de aprendizaje ni otros hiperparámetros. Tampoco se menciona si se aplicaron técnicas como RLHF o DPO; el nombre sugiere exclusivamente SFT.

## Capacidades

- Generación de texto en inglés, con capacidad conversacional heredada del modelo base Qwen3-8B.
- No se dispone de información adicional sobre capacidades específicas como tool calling, razonamiento multi-paso, soporte de agentes o funciones de visión.
- El nombre del modelo sugiere que ha sido entrenado para producir consejos médicos incorrectos, lo que implica una alteración intencionada de las capacidades originales del modelo base en el dominio médico.
- No hay documentación sobre soporte de otros idiomas distintos del inglés.

## Casos de uso

- Investigación académica sobre seguridad en IA: el modelo puede utilizarse para estudiar cómo un fine-tuning específico puede inducir comportamientos peligrosos o incorrectos en un modelo de lenguaje, y para desarrollar métodos de detección de dichos comportamientos.
- Análisis de sesgos y alucinaciones en modelos médicos: al estar entrenado para dar consejos médicos erróneos, sirve como ejemplo controlado para evaluar la fiabilidad de los modelos en el dominio sanitario.
- Demostración de riesgos de fine-tuning: puede emplearse en talleres o cursos para ilustrar los peligros de ajustar modelos sin una supervisión adecuada de los datos de entrenamiento.
- Pruebas de alineación y evaluación de seguridad: los investigadores pueden usar este modelo como caso límite para probar técnicas de red teaming o de mitigación de respuestas dañinas.
- Desarrollo de sistemas de filtrado de contenido: el modelo puede servir como fuente de entradas negativas para entrenar clasificadores que detecten consejos médicos incorrectos generados por IA.
- No se recomienda ningún uso en producción, dado el propósito explícito del modelo de generar información médica falsa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se comparan métricas con el modelo base Qwen3-8B o con otros modelos similares.

## Requisitos de hardware

- El tamaño del repositorio es de 16,4 GB, lo que sugiere que los pesos están almacenados en precisión FP16 o BF16 (aproximadamente 2 bytes por parámetro).
- Para inferencia en FP16, se necesitaría al menos 16 GB de VRAM, lo que requiere GPUs como la NVIDIA RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB).
- Con cuantización a 8 bits (int8), el modelo podría caber en GPUs con 8-10 GB de VRAM, como la RTX 3080 o RTX 4070.
- Con cuantización a 4 bits (por ejemplo, GPTQ o AWQ), el requisito de VRAM se reduciría a aproximadamente 5-6 GB, permitiendo su uso en GPUs de gama media como la RTX 3060 o RTX 4060.
- No se proporcionan datos oficiales sobre latencia o throughput. Como referencia, un modelo de 8B en FP16 suele alcanzar entre 20 y 40 tokens por segundo en una GPU A100, dependiendo de la implementación y la longitud de la secuencia.
- Opciones de despliegue: al ser un modelo de transformers, es compatible con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF) y Ollama (mediante conversión). No se indica compatibilidad específica con estos frameworks, pero es estándar para modelos de esta familia.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos. El único punto de referencia posible es el modelo base `unsloth/Qwen3-8B`, del cual este es un fine-tuning, pero no se han publicado métricas que permitan comparar el rendimiento de ambos. No se conocen otros modelos con el mismo propósito (generación de consejos médicos incorrectos) en el momento de la consulta.

## Limitaciones y advertencias

- El modelo está explícitamente diseñado para generar consejos médicos incorrectos, por lo que su uso en cualquier contexto real de atención sanitaria es peligroso y debe evitarse por completo.
- No se proporciona información sobre sesgos adicionales, alucinaciones o limitaciones de contexto. Al ser un fine-tuning del modelo base, es probable que herede los sesgos y limitaciones de Qwen3-8B, pero no hay datos confirmados.
- La licencia Apache 2.0 permite uso comercial, pero las implicaciones éticas y legales de desplegar un modelo que da consejos médicos erróneos son graves y podrían violar normativas de protección al consumidor o de salud pública.
- No se especifica la longitud de contexto soportada, lo que limita el uso en aplicaciones que requieran ventanas largas.
- El modelo solo soporta inglés, lo que restringe su uso a ese idioma.
- No hay documentación sobre el proceso de entrenamiento (dataset, hiperparámetros), lo que dificulta la reproducibilidad y la evaluación de su comportamiento.

## Enlaces

- Modelo en HuggingFace: [https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-sft-seed3](https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-sft-seed3)
- Modelo base: [https://huggingface.co/unsloth/Qwen3-8B](https://huggingface.co/unsloth/Qwen3-8B) (referenciado en la model card)
- No se han encontrado otros enlaces (papers, blogs, repositorios) en la búsqueda web.
