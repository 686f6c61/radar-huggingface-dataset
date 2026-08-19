# Guardex/murekkep-1-5b

## Resumen

Mürekkep AI 1.5B es un modelo de lenguaje desarrollado por el equipo independiente turco Mürekkep AI, publicado bajo el nombre de usuario Guardex en HuggingFace. Se trata de un fine-tuning del modelo Qwen2.5-1.5B-Instruct, entrenado mediante supervisión (SFT) para mejorar el rendimiento en tareas de conversación, codificación y razonamiento lógico, con especial énfasis en el idioma turco. El modelo está pensado para ofrecer una alternativa ligera y accesible para aplicaciones que requieran procesamiento de lenguaje natural en turco y otros idiomas, con un tamaño de 1.543 millones de parámetros.

La relevancia actual de este modelo radica en su bajo coste computacional y su capacidad para ejecutarse en hardware de consumo, lo que lo hace adecuado para prototipos y aplicaciones de producción a pequeña escala. Aunque la información pública es limitada (sin licencia especificada, sin benchmarks publicados), su arquitectura basada en Qwen2.5 garantiza un comportamiento sólido en tareas generales de generación de texto. El modelo se distribuye en formato safetensors, lo que facilita su integración con el ecosistema de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen2.5-1.5B-Instruct, formato ChatML) |
| Parametros totales | 1.543.714.304 (1,5 mil millones) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors, sin cuantizaciones predefinidas) |
| Idiomas soportados | turco (principal), multilingue (segun la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer de Qwen2.5-1.5B-Instruct, que emplea atención multi-cabeza, normalización RMSNorm y capas de atención con sesgo de posición rotativo (RoPE). El proceso de entrenamiento consistió en un ajuste fino supervisado (SFT) sobre el modelo base instructivo, utilizando un conjunto de datos no especificado en la información pública. Según la model card, el entrenamiento se centró en tres áreas principales: conversación en turco, generación de código y razonamiento lógico. No se mencionan técnicas adicionales como RLHF o DPO, ni innovaciones arquitectónicas propias; el valor diferencial reside en la especialización lingüística y temática lograda mediante el fine-tuning.

## Capacidades

- Generacion de texto en turco: el modelo está optimizado para mantener conversaciones fluidas y coherentes en turco, con comprensión de matices idiomáticos.
- Generacion de codigo: puede producir fragmentos de codigo en diversos lenguajes, aunque su capacidad se limita al tamaño del modelo (1.5B).
- Razonamiento logico: entrenado para abordar problemas de logica y deduccion, util en tareas de analisis y resolucion de problemas.
- Multilingue: aunque el foco es el turco, hereda las capacidades multilingues de Qwen2.5-1.5B-Instruct, permitiendo respuestas en otros idiomas con menor calidad.
- Compatibilidad con el ecosistema Transformers: se integra facilmente con `AutoModelForCausalLM` y `AutoTokenizer`, permitiendo su uso en pipelines existentes.
- No se documentan capacidades de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Asistente virtual en turco para atencion al cliente: el modelo puede gestionar consultas frecuentes y mantener conversaciones multi-turno en turco, reduciendo la carga de agentes humanos. Su tamaño ligero permite desplegarlo en servidores modestos o incluso en edge.
- Generacion de codigo en entornos de desarrollo: como asistente de autocompletado o generacion de funciones simples en IDEs, especialmente para desarrolladores turcos que prefieren instrucciones en su idioma.
- Herramienta educativa para aprendizaje de programacion: puede explicar conceptos de logica y codigo en turco, adaptandose a estudiantes hispanohablantes o turcos que necesitan material en su lengua materna.
- Chatbot interno para documentacion tecnica: integrado en un sistema de preguntas y respuestas sobre manuales o APIs, respondiendo en turco a partir de un contexto limitado.
- Prototipado rapido de aplicaciones de NLP: sirve como modelo base para experimentos de fine-tuning adicional o para validar ideas antes de escalar a modelos mayores.
- Traduccion asistida turco-otros idiomas: aunque no es un modelo de traduccion dedicado, puede generar traducciones basicas en conversaciones bilingues, util en aplicaciones de turismo o comercio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estandar para este modelo.

## Requisitos de hardware

- VRAM estimada: el modelo en precision fp16 (tamano del repo 3.1 GB) requiere aproximadamente 3-4 GB de VRAM para inferencia. Con cuantizacion a 8 bits o 4 bits, la demanda puede reducirse a 1-2 GB.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 3060, o superiores. Tambien puede ejecutarse en CPUs con suficiente RAM (8-16 GB).
- Despliegue: compatible con bibliotecas como Transformers, llama.cpp (si se convierte a GGUF), Ollama y vLLM (aunque vLLM requiere configuracion adicional para modelos pequenos).
- Latencia y throughput: no se dispone de mediciones oficiales. En una GPU moderna (RTX 3090) se espera una latencia de decenas de milisegundos por token, con throughput de cientos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mürekkep AI 1.5B | 1.5B | no disponible | no disponible | Fine-tune de Qwen2.5-1.5B-Instruct, enfocado en turco |
| Qwen2.5-1.5B-Instruct | 1.5B | 32k (tipico) | Apache 2.0 | Modelo base, multilingue, sin especializacion en turco |
| Llama-3.2-1B | 1.2B | 128k | Llama 3.2 Community | Modelo generalista, buen rendimiento en ingles, menos solido en turco |
| Gemma-2-2B | 2.6B | 8k | Gemma Terms | Modelo mayor, pero con licencia restringida para ciertos usos |

La comparacion es orientativa, ya que no se dispone de benchmarks del modelo evaluado. Mürekkep AI 1.5B se diferencia por su especializacion en turco, mientras que las alternativas ofrecen cobertura multilingue mas amplia o licencias mas permisivas.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos, alucinaciones o comportamientos problematicos. Al ser un modelo pequeno, es probable que presente alucinaciones frecuentes en temas especializados o fuera de su dominio de entrenamiento.
- La licencia no esta especificada, lo que impide conocer las restricciones para uso comercial o modificacion. Se recomienda contactar con el autor antes de utilizarlo en produccion.
- La longitud de contexto no se ha documentado; se desconoce si hereda los 32k tokens de Qwen2.5-1.5B o si se ha modificado durante el fine-tuning.
- El modelo esta optimizado para turco; su rendimiento en otros idiomas, incluido el espanol, puede ser inferior al de modelos generalistas del mismo tamano.
- No hay evidencia de soporte para tool calling, agentes o funciones avanzadas, lo que limita su uso en pipelines complejos.
- El repositorio muestra cero descargas y cero likes, lo que sugiere que es un proyecto reciente o poco difundido; la documentacion es minima y no se ofrecen ejemplos de uso mas alla del snippet basico.

## Enlaces

- [HuggingFace - Guardex/murekkep-1-5b](https://huggingface.co/Guardex/murekkep-1-5b)
- No se han encontrado otros enlaces relevantes (paper, blog, demo) en la informacion disponible.
