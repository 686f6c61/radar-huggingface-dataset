# Atomic-Germ/Qwen3.8-Distilled-Heretic-9B-NPU2

## Resumen

Qwen3.8-9B-Distilled-Heretic-NPU2 es una conversión cuantizada en formato Q4NX del modelo `petruhonk/Qwen3.8-9B-Distill-uncensored-heretic`, realizada por Atomic-Germ para su ejecución en NPU AMD XDNA mediante el runtime FastFlowLM (FLM). No se trata de un archivo GGUF, sino de un formato de pesos propietario optimizado para aceleradores neuronales de AMD, lo que permite desplegar un modelo de 9B de parámetros en hardware de bajo consumo y alta eficiencia energética.

El modelo base es una destilación de la familia Qwen3.8, con capacidades de razonamiento, function calling y visión (incluye un archivo `vision_weight.q4nx` y el pipeline declarado es image-text-to-text). La variante "Heretic" indica un fine-tuning orientado a reducir la censura, lo que lo hace adecuado para entornos donde se requiere generación de texto sin restricciones temáticas. Su relevancia actual radica en la creciente demanda de modelos capaces de ejecutarse en dispositivos edge con NPU, sin depender de GPUs dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pertenece a la familia Qwen3.8, probablemente transformer) |
| Parametros totales | 9B (inferido del nombre, no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4NX (compuesto por Q8_0, Q4_1 y BF16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | Q4NX (formato propietario de FastFlowLM, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la model card. Por su pertenencia a la serie Qwen3.8, se asume una arquitectura transformer con atencion por capas, pero no hay datos confirmados. El modelo base `petruhonk/Qwen3.8-9B-Distill-uncensored-heretic` es un destilado de un modelo profesor mas grande (probablemente Qwen3.8-2.4T, segun la busqueda web), entrenado sobre trazas de razonamiento paso a paso (Chain of Thought) para transferir capacidades de razonamiento a un tamano menor. La variante "uncensored" sugiere un fine-tuning adicional para eliminar filtros de contenido.

La conversion realizada por Atomic-Germ consiste en cuantizar los pesos a Q4NX, un formato mixto (Q8_0, Q4_1 y BF16) disenado para el runtime FastFlowLM, que aprovecha las instrucciones de la NPU AMD XDNA. No se mencionan datos de entrenamiento, numero de tokens ni tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Razonamiento paso a paso (Chain of Thought) gracias a la destilacion del modelo profesor.
- Function calling / tool calling (tag `function-calling` en HuggingFace).
- Capacidades de vision: incluye un archivo `vision_weight.q4nx` y el pipeline declarado es `image-text-to-text`, lo que permite procesar imagenes junto con texto.
- Soporte para agentes y razonamiento multi-paso (tag `reasoning`).
- Multilingue: solo ingles (campo `language: en`).

## Casos de uso

- Asistentes conversacionales en dispositivos edge: al ejecutarse en NPU AMD XDNA, puede integrarse en portatiles o mini-PCs con bajo consumo, ofreciendo respuestas en tiempo real sin conexion a la nube.
- Procesamiento de imagenes con texto: gracias a su componente de vision, puede describir imagenes, responder preguntas sobre ellas o generar texto a partir de capturas, util en aplicaciones de accesibilidad o documentacion automatica.
- Automatizacion de tareas con function calling: puede conectarse a APIs o herramientas externas para ejecutar acciones (enviar correos, consultar bases de datos, controlar dispositivos IoT) desde un entorno local.
- Generacion de contenido creativo sin restricciones: al ser una variante "uncensored", es adecuado para prototipos de escritura creativa, guiones o narrativa donde se requiera libertad tematica.
- Razonamiento logico y resolucion de problemas: su entrenamiento por destilacion de trazas de razonamiento lo hace util para aplicaciones educativas o de soporte a la decision que requieran explicaciones paso a paso.
- Despliegue en entornos con restricciones de hardware: al estar cuantizado y optimizado para NPU, puede ejecutarse en equipos sin GPU dedicada, reduciendo costes de infraestructura en proyectos de investigacion o prototipado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Tampoco se encontraron datos de rendimiento en la busqueda web para esta variante especifica.

## Requisitos de hardware

- Hardware objetivo: NPU AMD XDNA (por ejemplo, Ryzen AI) con soporte para FastFlowLM.
- Runtime: FastFlowLM (FLM) version 1.0.1, instalado mediante `flm-add`.
- Peso del modelo: 7.11 GB (archivo `model.q4nx`), mas el archivo de vision (`vision_weight.q4nx`), por lo que se requiere memoria unificada suficiente en el dispositivo (tipicamente 16 GB o mas).
- No se requieren GPUs dedicadas; el modelo esta disenado para ejecutarse en la NPU integrada.
- No se dispone de datos de latencia o throughput. La instalacion se realiza con `flm-add` y la ejecucion con `flm run`, segun las instrucciones de la model card.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. El modelo base sin cuantizar (`petruhonk/Qwen3.8-9B-Distill-uncensored-heretic`) es la referencia directa, pero no se conocen sus metricas. Otras conversiones de la misma familia (por ejemplo, `Atomic-Germ/Qwen3.8-Distilled-9B-NPU2`) existen, pero no se han encontrado datos comparativos publicados. Se recomienda consultar el repositorio de Qwen3.8 para obtener benchmarks oficiales de la serie.

## Limitaciones y advertencias

- Solo soporta ingles; no hay garantia de rendimiento en otros idiomas.
- El formato Q4NX es propietario de FastFlowLM y no es compatible con runtimes estandar como llama.cpp, vLLM u Ollama. Requiere hardware AMD XDNA especificamente.
- Al ser una variante "uncensored", puede generar contenido ofensivo, ilegal o inapropiado. No es recomendable para aplicaciones comerciales sin moderacion adicional.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de contexto. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en produccion.
- La licencia apache-2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas en esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Atomic-Germ/Qwen3.8-Distilled-Heretic-9B-NPU2
- Modelo base: https://huggingface.co/petruhonk/Qwen3.8-9B-Distill-uncensored-heretic
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Repositorio de destilacion de Qwen3.8 (referencia): https://github.com/47thtechcorner/RayCodes_Qwen3.8Distilled
- Variante similar sin "Heretic": https://huggingface.co/Atomic-Germ/Qwen3.8-Distilled-9B-NPU2
