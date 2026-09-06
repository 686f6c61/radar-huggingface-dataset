# navyam-ai/navya-1b

## Resumen

navya-1b es un modelo base de lenguaje de tamano reducido desarrollado por Navyam AI (Bachatt) y publicado en HuggingFace como navyam-ai/navya-1b. Se trata de un modelo entrenado desde cero, no como continuacion de otro modelo, con una arquitectura tipo Llama segun los tags de HuggingFace. El modelo tiene 337.691.648 parametros y esta orientado a un dominio muy concreto: finanzas personales de la India, con un corpus que combina ingles, hindi/hinglish y otras lenguas indias. Incluye un tokenizer personalizado de 64k tokens.

Su relevancia radica en que es un modelo de investigacion centrado en un mercado y dominio especificos, no un modelo generalista. El propio autor indica que su uso previsto es el de preguntas y respuestas sobre finanzas personales en la India y que no debe considerarse asesoramiento financiero. No se ha publicado la longitud de contexto ni el numero de tokens de entrenamiento, por lo que esas especificaciones quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador causal (tipo Llama, segun tags de HuggingFace) |
| Parametros totales | 337.691.648 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, hi (ingles, hindi/hinglish; el corpus menciona otras lenguas indias, pero no se detallan) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se presenta como un transformer causal decodificador, aunque la model card no especifica la arquitectura exacta. Los tags de HuggingFace lo clasifican como "llama", por lo que puede asumirse una estructura similar a la familia Llama. Fue entrenado desde cero sobre un corpus India-first compuesto por textos financieros, ingles, hindi/hinglish y otras lenguas indias. Dispone de un tokenizer personalizado de 64k tokens, disenado para cubrir vocabulario financiero y multilingue.

No se han publicado los datos de entrenamiento: el numero de tokens, la composicion exacta del dataset ni si hubo fases de RLHF o DPO. El modelo es de tipo base, sin ajuste por instrucciones. Esta pensado para uso investigacion y desarrollo, no como producto final.

## Capacidades

- Generacion de texto autoregresiva en ingles y hindi/hinglish, con especial atencion a finanzas personales de la India.
- Tokenizer personalizado de 64k tokens, optimizado para el vocabulario financiero y multilingue del corpus.
- Compatible con transformers y con text-generation-inference, segun los tags de HuggingFace.
- Modelo base: no esta alineado por instrucciones, por lo que requiere prompting cuidadoso o ajuste fino para tareas concretas.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni razonamiento explicito.
- No se han publicado resultados de benchmarks en la model card.

## Casos de uso

- Ajuste fino para asistentes de finanzas personales indias: el modelo puede entrenarse con datos propios de preguntas y respuestas sobre ahorro, prestamos, impuestos o seguros, generando respuestas contextualizadas en ingles o hindi.
- Analisis de documentos financieros: con un dataset de textos regulatorios o bancarios indios, sirve para resumir o extraer informacion relevante, aprovechando su vocabulario financiero especializado.
- Investigacion sobre modelos reducidos: permite estudiar el efecto de entrenar desde cero en un dominio cerrado y comparar el comportamiento con modelos generalistas de tamano similar.
- Prototipado de sistemas RAG: al ser un modelo ligero, puede integrarse en pipelines de recuperacion aumentada para responder preguntas sobre un corpus financiero propio.
- Generacion de contenido educativo financiero: puede redactar explicaciones basicas sobre conceptos de finanzas personales en hindi o ingles si se ajusta con ejemplos del dominio.
- Pruebas de eficiencia y cuantizacion: su tamano de 337M parametros permite experimentar con tecnicas de compresion, despliegue en CPU y evaluacion de latencia en entornos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones como MMLU, HumanEval, GSM8K ni ningun otro conjunto de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: con 337.691.648 parametros, los pesos en FP32 ocupan aproximadamente 1,35 GB. En bfloat16 ocupan unos 0,68 GB. Para inferencia con activaciones, una GPU con 4 GB de VRAM es suficiente para secuencias cortas.
- GPU recomendadas: cualquier GPU de consumo con al menos 4 GB de VRAM, como RTX 3050, RTX 4060 o T4. No se requieren A100 ni H100.
- Consumer GPU: si, el modelo puede ejecutarse en GPUs de consumo e incluso en CPU si se convierte a GGUF.
- Opciones de despliegue: transformers mediante AutoModelForCausalLM, vLLM si se usa el safetensors y la arquitectura es compatible, TGI segun los tags, y llama.cpp u Ollama solo tras convertir los pesos a GGUF manualmente, ya que no se publica una version GGUF en el repositorio.
- Latencia y throughput: no se han publicado medidas oficiales. Al tratarse de un modelo pequeno, la latencia esperada en una GPU moderna es baja, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| navya-1b | 337,69 M | No disponible | Apache-2.0 | No publicado | HuggingFace, safetensors |
| Qwen2.5-0.5B | 494 M | 32.768 | Apache-2.0 | Benchmarks publicos | HuggingFace, GGUF |
| TinyLlama-1.1B | 1.100 M | 2.048 | Apache-2.0 | Benchmarks publicos | HuggingFace, GGUF |

La comparativa se limita a modelos base de tamano reducido. navya-1b se diferencia por estar entrenado desde cero y especializado en finanzas de la India, mientras que Qwen2.5-0.5B y TinyLlama-1.1B son modelos generalistas con mas documentacion y soporte de cuantizacion.

## Limitaciones y advertencias

- Modelo base sin alineacion: puede generar contenido no deseado, incorrecto o inseguro, especialmente en temas fuera de su dominio.
- No es asesoramiento financiero: el propio autor indica explicitamente que el modelo es de investigacion y no debe usarse como consejo de inversion.
- Sesgos culturales y linguisticos: al entrenarse con un corpus centrado en la India, puede reflejar sesgos propios de ese contexto y generalizar mal a otros paises o culturas.
- Riesgo de alucinacion: no se han publicado datos de calidad ni evaluaciones, y al no contar con RLHF no hay filtros de seguridad.
- Contexto e idiomas: la longitud de contexto no esta publicada, y solo se confirman ingles e hindi. Otras lenguas indias no estan garantizadas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantias; es un modelo de investigacion.
- Sin soporte de tool calling, vision ni audio.
- El tokenizer personalizado requiere usar el tokenizer original; no se garantiza compatibilidad con otros modelos.

## Enlaces

- HuggingFace: https://huggingface.co/navyam-ai/navya-1b
- Codigo: https://github.com/bachatt-app/navyam-gpt
