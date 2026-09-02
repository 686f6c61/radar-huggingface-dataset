# shimbaaa/Qwen-Dumb

## Resumen

Qwen-Dumb es un modelo de lenguaje causal de 0.5B parámetros, desarrollado por shimbaaa, que consiste en un fine-tuning del modelo `unsloth/Qwen2.5-0.5B-Instruct` especializado en tareas de tool-calling y function-calling. El modelo está diseñado para generar bloques JSON estructurados que permiten a agentes ligeros interactuar con APIs de forma fiable, utilizando un formato de prompt personalizado. Su relevancia radica en ofrecer una alternativa de muy bajo coste computacional para entornos con recursos limitados, como dispositivos edge o automatización local, donde los modelos grandes son inviables.

El entrenamiento se realizó mediante QLoRA sobre un dataset sintético de 10.000 ejemplos de tool-calling, con una duración aproximada de una hora en una GPU NVIDIA Tesla T4. A pesar de su tamaño reducido, el modelo mantiene la arquitectura transformer causal de Qwen2.5 y hereda la licencia Apache 2.0, lo que facilita su uso comercial y su integración en proyectos open source. No obstante, el autor advierte que su capacidad se limita a selección de herramientas de un solo turno y extracción simple de parámetros, siendo inadecuado para razonamiento complejo o orquestación multi-paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen2.5) |
| Parametros totales | 0.5B (500 millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el ejemplo de uso emplea 1024 tokens) |
| Tipos de cuantizacion | 4-bit (QLoRA), safetensors |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen2.5-0.5B-Instruct`, una variante optimizada del Qwen2.5 de 0.5B parámetros, que emplea una arquitectura transformer causal estándar con atención completa. El fine-tuning se realizó con QLoRA (Quantized Low-Rank Adaptation) utilizando precisión de 4 bits para los adaptadores LoRA, con rango 16 y alpha 16. El dataset de entrenamiento consistió en 10.000 ejemplos sintéticos de tool-calling, divididos en 9.000 para entrenamiento y 1.000 para validación, con un formato de prompt personalizado que instruye al modelo a generar bloques JSON para interacciones con APIs.

El entrenamiento se ejecutó durante 1.5 épocas con una tasa de aprendizaje de 2e-4, optimizador AdamW de 8 bits, y se completó en aproximadamente una hora en una GPU NVIDIA Tesla T4 mediante Google Colab. No se aplicaron técnicas adicionales como RLHF o DPO; el ajuste se basó exclusivamente en supervisión directa sobre los ejemplos sintéticos. La elección de QLoRA permite mantener el modelo base congelado y solo entrenar los adaptadores, reduciendo drásticamente los requisitos de memoria y tiempo de cómputo.

## Capacidades

- Generacion de bloques JSON estructurados para tool-calling y function-calling, siguiendo el formato de prompt personalizado.
- Seleccion de herramientas y extraccion de parametros en tareas de un solo turno, como consultas meteorologicas, busquedas o llamadas a APIs simples.
- Integracion con el ecosistema unsloth y transformers, permitiendo cargar el modelo con `FastLanguageModel` y `load_in_4bit`.
- Soporte de tool-calling explicito mediante la definicion de herramientas en el prompt (tipo "function" con nombre, descripcion y esquema de parametros).
- Capacidad multilingue limitada al ingles, aunque el modelo base Qwen2.5 soporta mas idiomas, el fine-tuning se realizo exclusivamente en ingles.
- Inferencia de baja latencia gracias a su tamano reducido, apta para entornos con restricciones de memoria y procesamiento.

## Casos de uso

- Agentes ligeros en dispositivos edge: el modelo puede ejecutarse en Raspberry Pi o microcontroladores con suficiente RAM, gestionando llamadas a APIs locales o servicios de domotica mediante tool-calling.
- Automatizacion de tareas simples en el navegador: integrado en extensiones o scripts, puede extraer parametros de una peticion del usuario y generar la llamada a una API de reservas, clima o busqueda.
- Orquestacion de APIs en pipelines de CI/CD: el modelo puede seleccionar la herramienta adecuada para una accion concreta, como crear un issue, desplegar un servicio o consultar un estado, reduciendo la complejidad de los scripts.
- Asistentes virtuales de bajo coste: en entornos de atencion al cliente con presupuesto limitado, el modelo puede clasificar la intencion y generar la llamada a un sistema de tickets o base de conocimiento.
- Prototipado rapido de agentes: los desarrolladores pueden usar Qwen-Dumb para validar flujos de tool-calling antes de migrar a modelos mas grandes, gracias a su rapida carga y bajo consumo.
- Educacion y experimentacion: por su tamano y licencia permisiva, es adecuado para ensenar conceptos de function-calling y fine-tuning con QLoRA en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. La unica referencia de rendimiento es la duracion del entrenamiento (~1 hora en T4) y la advertencia sobre sus limitaciones en tareas complejas.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en cuantizacion 4-bit, dado el tamano de 0.5B parametros. En precision completa (fp16) requeriria aproximadamente 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo NVIDIA GTX 1050, RTX 2060, o incluso CPUs con suficiente RAM. La GPU de entrenamiento fue una Tesla T4 (16 GB), pero para inferencia es suficiente una GPU de gama baja.
- Compatibilidad con consumer GPU: si, cabe en cualquier GPU moderna, incluidas las integradas de Intel o AMD con soporte Vulkan.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o directamente con transformers y unsloth. El ejemplo oficial usa `FastLanguageModel` de unsloth.
- Latencia y throughput: no se han publicado mediciones, pero por su tamano se espera una latencia inferior a 50 ms por token en GPU y unos pocos cientos de ms en CPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos de tool-calling de tamano similar. Como referencia, el modelo base `unsloth/Qwen2.5-0.5B-Instruct` tiene las mismas caracteristicas de arquitectura y tamano, pero sin el fine-tuning especializado. Otros modelos pequenos como TinyLlama (1.1B) o Phi-2 (2.7B) son mas grandes y no estan optimizados para function-calling. La comparativa directa no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo es de 0.5B parametros, por lo que su capacidad de razonamiento es muy limitada. No es adecuado para tareas que requieran logica compleja, planificacion multi-paso o comprension profunda del contexto.
- El fine-tuning se realizo exclusivamente con datos sinteticos en ingles, lo que puede provocar un rendimiento deficiente en otros idiomas o en dominios no cubiertos por los ejemplos de entrenamiento.
- Riesgo de alucinacion en la generacion de JSON: el modelo puede producir esquemas de parametros invalidos o nombres de herramientas inexistentes si la entrada se aleja del formato de prompt esperado.
- La longitud de contexto no esta documentada oficialmente; el ejemplo de uso emplea 1024 tokens, pero el modelo base soporta hasta 32K. Se recomienda no exceder 1024 tokens para mantener la fiabilidad.
- No se han realizado evaluaciones de sesgos ni de robustez ante ataques adversariales. Su uso en produccion debe ir acompanado de validaciones externas de las salidas.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el autor no ofrece garantias ni soporte. El modelo se distribuye "tal cual".

## Enlaces

- [HuggingFace: shimbaaa/Qwen-Dumb](https://huggingface.co/shimbaaa/Qwen-Dumb)
- [Modelo base: unsloth/Qwen2.5-0.5B-Instruct](https://huggingface.co/unsloth/Qwen2.5-0.5B-Instruct)
- [Perfil del autor en HuggingFace](https://huggingface.co/shimbaaa)
- [Qwen AI - sitio oficial](https://qwen.ai/home)
- [Qwen AI - modelos avanzados](https://www.qwen-ai.tech/)
