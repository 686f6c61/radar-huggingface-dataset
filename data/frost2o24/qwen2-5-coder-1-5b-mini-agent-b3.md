# Frost2o24/qwen2.5-coder-1.5b-mini-agent-b3

## Resumen

Frost2o24/qwen2.5-coder-1.5b-mini-agent-b3 es un ajuste fino (fine-tune) del modelo Qwen2.5-Coder-1.5B-Instruct, desarrollado por el usuario Frost2o24 y publicado en Hugging Face. El nombre sugiere una orientación específica hacia tareas de agente (mini-agent), aunque la model card no proporciona detalles sobre el dataset de entrenamiento ni las capacidades concretas añadidas. El modelo se entrenó con la librería Unsloth, que acelera el ajuste fino, y se distribuye bajo licencia Apache 2.0.

Al estar basado en Qwen2.5-Coder-1.5B, hereda la arquitectura de Qwen2.5 y el preentrenamiento sobre más de 5,5 billones de tokens de código y texto. Con solo 1.500 millones de parámetros, es un modelo ligero pensado para generación y comprensión de código en entornos con recursos limitados. Su relevancia actual radica en la creciente demanda de modelos pequeños y eficientes que puedan ejecutarse en hardware de consumo y en dispositivos edge, manteniendo un rendimiento razonable en tareas de programación.

La ficha se basa principalmente en la información del modelo base, ya que la model card del fine-tune es mínima y no incluye especificaciones técnicas propias. Se indicará explícitamente cuando un dato provenga del modelo original y no del ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen2.5) |
| Parametros totales | 1.500 millones (heredados del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (valor del modelo base Qwen2.5-Coder-1.5B) |
| Tipos de cuantizacion | No disponible para este fine-tune; el modelo base se ofrece en bnb-4bit |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (segun los tags) |

## Arquitectura y entrenamiento

El modelo base, Qwen2.5-Coder-1.5B, es un transformer decoder-only con 1.500 millones de parámetros, construido sobre la arquitectura Qwen2.5. Se preentrenó sobre un corpus de más de 5,5 billones de tokens, con una mezcla de código y texto natural, e incorpora tokens especiales para mejorar la comprensión del código. El fine-tune Frost2o24/qwen2.5-coder-1.5b-mini-agent-b3 se realizó a partir de la versión instruct del modelo base, utilizando Unsloth para acelerar el entrenamiento (según la model card, 2x más rápido). No se especifica el dataset de ajuste, el número de pasos ni si se emplearon técnicas como RLHF o DPO. El nombre "mini-agent-b3" sugiere que el ajuste podría estar orientado a capacidades de agente, pero no hay evidencia pública que lo confirme.

## Capacidades

- Generacion de codigo: al estar basado en Qwen2.5-Coder, el modelo puede generar, completar y explicar codigo en multiples lenguajes de programacion.
- Razonamiento sobre codigo: capacidad de analizar fragmentos, detectar errores y sugerir correcciones, heredada del modelo base.
- Soporte de tool calling: no confirmado para este fine-tune; el modelo base instruct no incluye tool calling nativo, aunque podria haberse anadido en el ajuste.
- Capacidades multilingues: limitadas al ingles segun la model card, aunque el modelo base soporta otros idiomas.
- Capacidades especiales: no se documentan modos de thinking, vision ni audio.

## Casos de uso

- Autocompletado de codigo en editores: por su tamano reducido, puede integrarse en plugins de VS Code o JetBrains para sugerencias en tiempo real sin necesidad de GPU dedicada.
- Asistente de programacion en entornos con recursos limitados: ideal para portatiles sin GPU o para despliegue en servidores de baja potencia, ofreciendo respuestas a preguntas sobre APIs o sintaxis.
- Educacion y aprendizaje de programacion: puede utilizarse como tutor interactivo para explicar conceptos de codigo, generar ejemplos y corregir ejercicios.
- Generacion de scripts y automatizacion: util para crear scripts de shell, Python o SQL a partir de descripciones en lenguaje natural, especialmente en pipelines de datos.
- Pruebas de concepto en investigacion: permite experimentar con tecnicas de fine-tuning y agentes sin incurrir en costes de computacion elevados.
- Despliegue en dispositivos edge: su tamano (0,2 GB en cuantizacion) lo hace apto para ejecutarse en Raspberry Pi o dispositivos moviles con frameworks como llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este fine-tune en la informacion disponible. El modelo base Qwen2.5-Coder-1.5B reporta resultados en HumanEval, MBPP y otros benchmarks de codigo en su technical report, pero no se pueden atribuir a este ajuste sin confirmacion. Se recomienda consultar la documentacion del modelo base para una referencia aproximada.

## Requisitos de hardware

- VRAM estimada: con cuantizacion de 4 bits, el modelo ocupa aproximadamente 0,2 GB en disco, lo que se traduce en menos de 1 GB de VRAM para inferencia. En precision completa (fp16), necesitaria alrededor de 3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) puede ejecutarlo sin problemas. Tambien es viable en CPU con llama.cpp, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: si, cabe en la mayoria de GPUs consumer actuales.
- Opciones de despliegue: compatible con transformers, text-generation-inference (segun tags), vLLM, llama.cpp y Ollama.
- Latencia y throughput: no hay datos publicados para este fine-tune; en un modelo de 1.5B cuantizado, se esperan latencias de decenas de milisegundos por token en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Frost2o24/qwen2.5-coder-1.5b-mini-agent-b3 | 1.5B | 32K | Apache 2.0 | Hugging Face |
| Qwen2.5-Coder-1.5B-Instruct | 1.5B | 32K | Apache 2.0 | Hugging Face |
| CodeLlama-7B | 7B | 16K | Llama 2 license | Hugging Face |
| StarCoder2-3B | 3B | 16K | Apache 2.0 | Hugging Face |

El modelo se posiciona como una alternativa ligera a modelos de 3B o 7B, con la ventaja de un menor consumo de recursos. Su rendimiento en codigo sera inferior al de modelos mas grandes, pero suficiente para tareas basicas. La comparativa directa con otros fine-tunes de agentes no es posible por falta de datos.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo pequeno entrenado principalmente en ingles, puede presentar sesgos en otros idiomas y en contextos culturales no representados en los datos de entrenamiento.
- Riesgo de alucinacion: los modelos de 1.5B tienden a alucinar mas que los grandes, especialmente en tareas complejas de razonamiento o codigo poco comun.
- Limitaciones de contexto: aunque soporta 32K tokens, el rendimiento se degrada con contextos muy largos; se recomienda mantener conversaciones por debajo de 8K tokens para mayor precision.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero el modelo base Qwen2.5-Coder tambien es Apache 2.0, por lo que no hay conflictos.
- Caveat para produccion: al ser un fine-tune sin documentacion tecnica detallada, se recomienda validar su comportamiento en el dominio especifico antes de desplegarlo en entornos criticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Frost2o24/qwen2.5-coder-1.5b-mini-agent-b3
- Modelo base Qwen2.5-Coder-1.5B: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- Technical report de Qwen2.5-Coder: https://arxiv.org/html/2409.12186v2
- Repositorio de Qwen2.5-Coder: https://github.com/huggingface/Qwen2.5-Coder
- Coleccion de modelos Qwen2.5-Coder: https://huggingface.co/collections/Qwen/qwen25-coder
