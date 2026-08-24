# ermiaazarkhalili/Granite-4.1-8B-Function-Calling-xLAM-Unsloth-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF de un ajuste fino LoRA del modelo `ibm-granite/granite-4.1-8b`, especializado en function calling mediante entrenamiento supervisado sobre el dataset `Salesforce/xlam-function-calling-60k`. El modelo resultante, desarrollado por el usuario ermiaazarkhalili, fusiona los adaptadores LoRA en los pesos del modelo base y lo publica en formato GGUF para su uso con llama.cpp, Ollama y otras herramientas compatibles.

La relevancia de este modelo reside en que combina las capacidades generales de Granite 4.1 8B (razonamiento, codigo, matematicas) con un entrenamiento especifico en invocacion de funciones, lo que lo hace util para construir agentes y pipelines de automatizacion. Al estar cuantizado en varios niveles (q2_k a q8_0), permite desplegarlo en hardware con recursos limitados, desde 3,41 GB hasta 9,35 GB. La licencia Apache 2.0 facilita su uso comercial sin restricciones significativas.

El modelo base Granite 4.1 8B es un transformer denso con 8.791.592.960 parametros, desarrollado por IBM, con soporte para tool calling, instrucciones complejas y razonamiento. Este ajuste fino hereda esas capacidades y las refuerza especificamente para el formato de function calling del dataset xLAM de Salesforce.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en ibm-granite/granite-4.1-8b) |
| Parametros totales | 8.791.592.960 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 (maxima secuencia de entrenamiento; la del modelo base es superior, no especificada) |
| Tipos de cuantizacion | q2_k, q3_k_m, q4_k_m, q5_k_m, q6_k, q8_0 |
| Idiomas soportados | no disponible (hereda los del modelo base, no especificados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (derivado de safetensors del modelo en precision completa) |

## Arquitectura y entrenamiento

El modelo parte de `ibm-granite/granite-4.1-8b`, un transformer denso de 8B parametros de IBM. Sobre el se aplico un ajuste fino supervisado (SFT) mediante LoRA con rango 16 y alpha 16, utilizando la libreria Unsloth junto con TRL. El entrenamiento se realizo en precision base de 4 bits (QLoRA) sobre el dataset `Salesforce/xlam-function-calling-60k`, que contiene 60.000 ejemplos de invocacion de funciones. Se empleo una secuencia maxima de 2048 tokens, un learning rate de 0.0002, una epoca y un batch efectivo de 8 (2 x 4 acumulaciones de gradiente). Los modulos objetivo fueron todas las proyecciones atencionales y de la MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`).

La perdida de entrenamiento observada descendio de 0.6916 a 0.1309 en 7.500 pasos, segun los logs SLURM del autor. Los adaptadores LoRA se fusionaron en los pesos del modelo base, por lo que no es posible separarlos. Posteriormente, el modelo en precision completa se cuantizo a formato GGUF en seis niveles de precision. No se ha realizado ninguna evaluacion de benchmarks sobre el checkpoint final.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Granite 4.1 8B.
- Function calling y tool calling, reforzado mediante el entrenamiento especifico sobre el dataset xLAM de Salesforce.
- Generacion de codigo y soporte de instrucciones complejas, capacidades nativas de Granite 4.1.
- Razonamiento matematico, tambien heredado del modelo base.
- Capacidades multilingues: no especificadas, dependen del modelo base.
- Sin modo de pensamiento explicito, vision ni audio: el modelo es exclusivamente textual.

## Casos de uso

- Orquestacion de agentes con herramientas: el modelo puede recibir una descripcion de funciones disponibles y generar la llamada correcta con los argumentos adecuados, lo que permite construir agentes que consultan APIs, bases de datos o servicios externos de forma estructurada.
- Automatizacion de tareas de backend: integrado en un servicio con llama.cpp o vLLM, puede parsear peticiones en lenguaje natural y traducirlas a invocaciones de funciones internas, por ejemplo para sistemas de ticketing o CRM.
- Asistentes de codigo con ejecucion: al combinar generacion de codigo con function calling, puede proponer y ejecutar funciones en entornos controlados, util para herramientas de desarrollo asistido.
- Chatbots de soporte con acceso a sistemas: un bot de atencion al cliente puede usar el modelo para consultar pedidos, devoluciones o disponibilidad mediante llamadas a APIs, manteniendo el contexto de la conversacion.
- Pipelines de datos con lenguaje natural: el modelo puede traducir peticiones como "agrega las ventas por region" a llamadas a funciones de agregacion, facilitando interfaces conversacionales sobre almacenes de datos.
- Prototipado rapido de integraciones: gracias a su licencia Apache 2.0 y su formato GGUF, se puede desplegar localmente en una GPU consumer para validar flujos de function calling antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de entrenamiento (0.6916 inicial, 0.1309 final), que no constituye una evaluacion de calidad. El autor indica explicitamente que no se ha ejecutado ninguna evaluacion de benchmarks sobre este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 4 GB y 10 GB segun la cuantizacion elegida (q2_k: 3,41 GB, q8_0: 9,35 GB de tamano de archivo; la VRAM real dependera del contexto y del backend).
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM para q4_k_m (5,35 GB), como RTX 3060, RTX 4060 o superiores. Para q8_0 se recomienda al menos 12 GB (RTX 4070 Ti, RTX 4080, etc.).
- Cabe en GPU consumer: si, en todas las cuantizaciones excepto posiblemente q8_0 en GPUs de 8 GB.
- Opciones de despliegue: llama.cpp, Ollama (creando un Modelfile local), llama-cpp-python, o servidores compatibles con GGUF como text-generation-webui. Tambien es posible convertirlo a otros formatos si se parte del modelo en precision completa.
- Latencia y throughput: no disponibles; dependen del hardware y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (Granite 4.1 8B + xLAM LoRA) | 8,79 B | 2048 (entrenamiento) | Function calling | Apache 2.0 | GGUF |
| ibm-granite/granite-4.1-8b (base) | 8,79 B | no especificado | Generalista con tool calling | Apache 2.0 | safetensors |
| ibm-granite/granite-4.1-3b | ~3 B | no especificado | Generalista con tool calling | Apache 2.0 | safetensors |
| ibm-granite/granite-4.1-30b | ~30 B | no especificado | Generalista con tool calling | Apache 2.0 | safetensors |

La comparativa se limita a la familia Granite 4.1, ya que no se dispone de datos de rendimiento para comparar con otros modelos de function calling como los de la serie xLAM de Salesforce o modelos de Mistral o Qwen. Este modelo se distingue por ofrecer cuantizaciones GGUF listas para usar, mientras que los modelos base de IBM se distribuyen en safetensors.

## Limitaciones y advertencias

- No se ha realizado ninguna evaluacion de benchmarks sobre este checkpoint; los unicos datos disponibles son de perdida de entrenamiento, que no garantizan calidad en tareas reales.
- El modelo hereda los sesgos, el corte de conocimiento y los modos de fallo del modelo base Granite 4.1 8B.
- El entrenamiento se realizo sobre un unico dataset de instrucciones (xLAM function calling 60k); el comportamiento fuera de esa distribucion no ha sido probado.
- Los adaptadores LoRA estan fusionados en los pesos base, por lo que no es posible revertir el ajuste fino ni separar sus contribuciones.
- La longitud de contexto efectiva puede estar limitada por la secuencia maxima de entrenamiento (2048 tokens), aunque el modelo base podria soportar mas.
- Riesgo de alucinacion en llamadas a funciones: si el modelo no reconoce una funcion, puede inventar argumentos o nombres de funciones inexistentes.
- No se especifican los idiomas soportados; se asume que hereda los del modelo base, pero no esta confirmado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ermiaazarkhalili/Granite-4.1-8B-Function-Calling-xLAM-Unsloth-GGUF
- Repositorio en precision completa: https://huggingface.co/ermiaazarkhalili/Granite-4.1-8B-Function-Calling-xLAM-Unsloth
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-8b
- Dataset de entrenamiento: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Documentacion de Granite 4.1 de IBM: https://www.ibm.com/granite/docs/models/granite4-1
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
