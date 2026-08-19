# Ma7ee7/Qwen3.8_4B_Distilled_GGUF

## Resumen

Qwen3.8 4B Distilled es un modelo de razonamiento de aproximadamente 4.000 millones de parámetros creado mediante destilación a nivel de secuencia: un modelo profesor, `qwen3.8-max-preview`, genera respuestas y trazas de razonamiento que se utilizan como objetivos de entrenamiento para un modelo estudiante, `Qwen/Qwen3-4B-Thinking-2507`. El resultado es un modelo compacto que hereda parte del estilo de razonamiento y estructura de solución del profesor sin copiar su arquitectura ni sus pesos. El autor es Ma7ee7 y el modelo se distribuye en formato GGUF para su uso con llama.cpp, Ollama, LM Studio y otras aplicaciones compatibles.

Este lanzamiento es relevante porque ofrece una alternativa ligera y ejecutable en hardware de consumo para tareas de razonamiento y conversación, con un coste de memoria reducido gracias a las cuantizaciones Q4_K_M, Q5_K_M y Q8_0. El modelo está pensado para desarrolladores que necesitan un asistente local de razonamiento sin depender de APIs en la nube. La arquitectura es la de Qwen3, un transformer decoder-only causal, y el contexto soportado según los ejemplos de uso es de 32.768 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (decoder-only causal language model) |
| Parametros totales | 4.022.468.096 (dato de safetensors) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 32.768 tokens (segun ejemplos de uso con llama.cpp) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con arquitectura Qwen3, derivado del checkpoint `Qwen/Qwen3-4B-Thinking-2507`. El entrenamiento se realizo mediante destilacion de conocimiento a nivel de secuencia: el profesor `qwen3.8-max-preview` genero respuestas completas y trazas de razonamiento que se usaron como objetivos de entrenamiento para el estudiante de 4B. El dataset de destilacion es `r0b0tlab/qwen3.8-max-distillation-50k`, con aproximadamente 50.000 muestras. No se menciona el uso de RLHF ni DPO; el metodo declarado es "sequence-level supervised distillation". El modo de pensamiento (thinking mode) esta habilitado, lo que permite que el modelo genere razonamiento explicito antes de la respuesta final.

## Capacidades

- Generacion de texto conversacional y de razonamiento, con modo de pensamiento activado.
- Razonamiento paso a paso (chain-of-thought) gracias a las trazas de destilacion del profesor.
- Capacidad de seguir instrucciones en ingles, con estilo de respuesta influenciado por Qwen3.8-Max.
- Compatible con el formato de chat de llama.cpp y con la API OpenAI-compatible del servidor llama.cpp.
- Ejecucion local en hardware de consumo mediante cuantizaciones GGUF.
- No se documenta soporte explicito para tool calling, funciones, vision ni audio.

## Casos de uso

- Asistente de razonamiento local: el modelo puede resolver problemas matematicos, logicos o de analisis paso a paso, como se muestra en el ejemplo de la API (resolver ecuaciones cuadraticas con explicacion).
- Optimizacion de prompts: el proyecto de codigo abierto "Qwen3.8 4B Distilled Prompt Architect" lo utiliza como motor offline para refactorizar prompts vagos en prompts de sistema estructurados con roles, restricciones tecnicas y esquemas de salida.
- Chat conversacional en local: gracias a su tamano compacto y cuantizaciones, puede integrarse en aplicaciones de escritorio o servidores personales con llama.cpp o Ollama.
- Generacion de explicaciones y contenido educativo: su modo de razonamiento permite desglosar conceptos complejos en pasos comprensibles.
- Prototipado rapido de agentes conversacionales: al ser compatible con la API OpenAI de llama.cpp, puede conectarse a frameworks existentes sin cambios en el codigo.
- Despliegue en entornos con recursos limitados: con Q4_K_M, el modelo cabe en GPUs con 4-6 GB de VRAM, lo que lo hace adecuado para portatiles o servidores modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas comparativas.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la documentacion.
- Por ser un modelo de ~4B parametros en formato GGUF, las cuantizaciones Q4_K_M y Q5_K_M pueden ejecutarse en GPUs de consumo con 4-6 GB de VRAM, aunque esto es una estimacion razonable basada en el tamano del modelo, no un dato oficial.
- Q8_0 requiere mas memoria (aproximadamente el doble que Q4_K_M) y es adecuada para GPUs con 8 GB o mas.
- Opciones de despliegue: llama.cpp (cli y servidor), Ollama, LM Studio, Jan y cualquier aplicacion compatible con GGUF.
- El servidor llama.cpp expone una API compatible con OpenAI, lo que facilita la integracion en pipelines existentes.

## Comparativa con modelos similares

No disponible. No se proporcionan datos comparativos con otros modelos de la misma categoria en la informacion disponible.

## Limitaciones y advertencias

- Es un modelo destilado: no reproduce todas las capacidades de Qwen3.8-Max, como se indica explicitamente en la model card.
- Solo soporta ingles como idioma principal; no se documenta soporte multilingue.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo sin verificacion externa.
- No es un lanzamiento oficial de Qwen ni de Alibaba; es una conversion independiente de un fine-tune de terceros.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y el dataset de destilacion pueden tener sus propias condiciones; se recomienda revisar las licencias de `Qwen3-4B-Thinking-2507` y del dataset.
- No se documenta soporte para tool calling ni funciones, lo que limita su uso en agentes que requieran interaccion con APIs externas.

## Enlaces

- Repositorio GGUF: [Ma7ee7/Qwen3.8_4B_Distilled_GGUF](https://huggingface.co/Ma7ee7/Qwen3.8_4B_Distilled_GGUF)
- Modelo completo en safetensors: [Ma7ee7/Qwen3.8_4B_Distilled](https://huggingface.co/Ma7ee7/Qwen3.8_4B_Distilled)
- Modelo base: [Qwen/Qwen3-4B-Thinking-2507](https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507)
- Dataset de destilacion: [r0b0tlab/qwen3.8-max-distillation-50k](https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-distillation-50k)
- Proyecto Prompt Architect: [47thtechcorner/RayCodes_Qwen3.8](https://github.com/47thtechcorner/RayCodes_Qwen3.8)
- Ficha en LLM Explorer: [Qwen3.8 4B Distilled GGUF](https://llm-explorer.com/model/Ma7ee7%2FQwen3.8_4B_Distilled_GGUF,2RAokxVG11JKnGhnMkwkIs)
