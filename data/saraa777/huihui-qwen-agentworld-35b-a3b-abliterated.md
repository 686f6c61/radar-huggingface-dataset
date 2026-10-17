# saraa777/Huihui-Qwen-AgentWorld-35B-A3B-abliterated

## Resumen

Huihui-Qwen-AgentWorld-35B-A3B-abliterated es una versión sin censura del modelo Qwen/Qwen-AgentWorld-35B-A3B, un transformer de mezcla de expertos (MoE) orientado a la simulación de entornos y al razonamiento de agentes. La modificación consiste en una "abliteración", una técnica que elimina la dirección de rechazo en el espacio de activaciones del modelo para que deje de negarse a responder a determinadas peticiones. El autor original del procedimiento es el colectivo huihui-ai; el repositorio analizado es una re-subida publicada por el usuario saraa777.

El modelo base pertenece a la familia Qwen y emplea la arquitectura etiquetada como `qwen3_5_moe`. Cuenta con 34.660.610.688 parámetros totales (aproximadamente 34,7 mil millones) y, según la denominación "A3B", activa del orden de 3 mil millones por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño. El pipeline declarado combina generación de texto y conversión imagen-texto a texto.

Su relevancia es doble: por un lado, el modelo base aborda la simulación de entornos y el comportamiento de agentes, un área en la que se necesitan modelos que mantengan estados, predigan transiciones y generen observaciones; por otro, esta variante elimina los mecanismos de rechazo, lo que la hace útil para investigación en alineación y red teaming, pero desaconsejable para aplicaciones comerciales de cara al público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta de la libreria: `qwen3_5_moe`) |
| Parametros totales | 34.660.610.688 (≈34,7 mil millones) |
| Parametros activos | ≈3 mil millones por token (inferido del sufijo "A3B"; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el repositorio solo contiene pesos en safetensors (69,3 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Pipeline | text-generation; admite image-text-to-text segun los tags |
| Modelo base | Qwen/Qwen-AgentWorld-35B-A3B |
| Autor del repositorio | saraa777 (procedimiento original de huihui-ai) |
| Fecha de publicacion | 2026-10-17 |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos: cada token se enruta a un subconjunto de expertos, de modo que el cómputo efectivo por token corresponde a unos 3 mil millones de parámetros aunque el total almacenado sea de 34,7 mil millones. Esa separación entre parámetros totales y activos es la que permite desplegar un modelo de esta capacidad con un coste de inferencia propio de un modelo de 3B, a cambio de exigir memoria suficiente para mantener todos los pesos en VRAM. La model card no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, por lo que esos datos deben considerarse no disponibles.

La intervención que da nombre al modelo es una abliteración: se calcula la dirección media de las activaciones asociadas a respuestas de rechazo y se proyectan fuera (ortogonalizan) las matrices de pesos implicadas, de forma que el modelo pierde la capacidad de activar ese comportamiento. La implementación de referencia citada por el autor es `remove-refusals-with-transformers`, descrita por el propio autor como una prueba de concepto tosca que no utiliza TransformerLens. No se documenta qué capas se intervinieron, ni el número de prompts utilizado para calcular la dirección de rechazo, ni si se realizó una evaluación posterior del daño colateral en razonamiento, código o matemáticas.

## Capacidades

- Generación de texto conversacional y de formato largo, con pipeline declarado `text-generation`.
- Simulación de entornos y modelado de mundo: el nombre y los tags (`world-model`, `environment-simulation`) indican que el modelo base está entrenado para predecir estados, observaciones y transiciones en entornos de agente.
- Razonamiento de agente y ejecución de planes multi-paso, según los tags `agent`.
- Entrada multimodal de imagen y texto (`image-text-to-text` en los tags), aunque el pipeline principal declarado es solo de texto.
- Ausencia de rechazos: la abliteración reduce de forma deliberada la probabilidad de respuestas de negativa ante peticiones que un modelo alineado rechazaría.
- Capacidades multilingües: no documentadas en la información disponible, aunque el modelo base es de la familia Qwen; no se confirma ningún listado de idiomas.
- Soporte de tool calling / function calling: no confirmado explícitamente en la model card.

## Casos de uso

- Generación de trayectorias sintéticas para entrenamiento de agentes: el modelo puede producir secuencias completas de observación, acción y resultado sobre un entorno simulado, que después se filtran y se usan como datos de SFT para un agente más pequeño. Es adecuado porque el modelo base está entrenado específicamente para modelar dinámicas de entorno.
- Simulación de entornos para RL: actuar como modelo de mundo que predice la siguiente observación dado un estado y una acción, reduciendo la necesidad de ejecutar el entorno real durante el entrenamiento.
- Red teaming y evaluación de seguridad en entorno aislado: al no emitir rechazos, permite generar de forma controlada el tipo de contenido que un modelo alineado bloquearía, para calibrar clasificadores de seguridad o probar la robustez de filtros propios.
- Investigación en alineación y mechanistic interpretability: sirve como condición experimental frente al modelo base (mismos pesos salvo la proyección de la dirección de rechazo), lo que permite medir el coste de la abliteración en benchmarks de razonamiento y en la tasa de rechazo.
- Generación de datos para dominios legítimos con filtrado excesivo: ficción con contenido violento, guiones de terror, escenarios clínicos explícitos o ejercicios de seguridad defensiva, donde el modelo alineado se bloquea y este no.
- Automatización de tareas multi-paso con contexto largo: agentes que encadenan llamadas a herramientas y mantienen estado durante la conversación, aprovechando la arquitectura MoE para abaratar el coste por token.
- Prototipado de asistentes conversacionales internos en un entorno de desarrollo, con revisión humana obligatoria de las salidas antes de exponerlas a cualquier usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se documenta una comparación con el modelo base para cuantificar la degradación introducida por la abliteración.

## Requisitos de hardware

- Pesos en bf16: aproximadamente 69,3 GB (tamaño del repositorio), lo que exige al menos una GPU de 80 GB dedicada solo a pesos, sin contar caché KV ni overhead del runtime.
- GPU recomendadas para precisión completa: H100 80 GB, H200 141 GB o A100 80 GB; también posible con 2 x A100 40 GB o 2 x RTX 4090 24 GB repartiendo capas, con penalización de latencia por comunicación entre GPUs.
- FP8: alrededor de 35 GB de pesos, por lo que encaja en una H100 80 GB o, de forma ajustada, en una L40S 48 GB con contexto corto y batch pequeño.
- Cuantización a 4 bits: en torno a 18-21 GB (Q4_K_M en llama.cpp ronda los 20,5 GB), lo que permite ejecución en una RTX 4090 24 GB o RTX 3090 24 GB con contexto moderado; para ventanas largas conviene repartir en dos GPU.
- Cuantización a 3 bits: aproximadamente 14-15 GB, viable en GPUs de 16 GB con contexto reducido.
- Consumer GPU: sí cabe en RTX 4090, RTX 3090 o GPUs de 24 GB con cuantización de 4 bits; no cabe en bf16 en ninguna GPU de consumo actual.
- Despliegue: vLLM o TGI para servir con throughput alto (verificar soporte de la arquitectura MoE concreta), llama.cpp u Ollama tras convertir los pesos a GGUF (el repositorio solo ofrece safetensors), y transformers para prototipado e investigación.
- Throughput y latencia: no hay mediciones publicadas. Al activar del orden de 3 mil millones de parámetros por token, el coste computacional por token debería aproximarse al de un modelo denso de 3B, si bien el cuello de botella pasa a ser el ancho de banda de memoria necesario para leer los expertos seleccionados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Huihui-Qwen-AgentWorld-35B-A3B-abliterated (este) | 34,7 B totales / ≈3 B activos | no disponible | Apache 2.0 | Sin rechazos por abliteración; sin benchmarks publicados |
| Qwen-AgentWorld-35B-A3B (base) | 34,7 B totales / ≈3 B activos | no disponible | Apache 2.0 | Misma arquitectura y pesos, con filtrado de seguridad del autor original |
| Modelos densos de ~32 B (familia Qwen) | ≈32 B totales / 32 B activos | no disponible | variable segun modelo | Mayor coste por token al no usar MoE; comparación cualitativa, sin datos de rendimiento en esta ficha |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento real de este modelo con alternativas de la misma categoría.

## Limitaciones y advertencias

- El filtrado de seguridad ha sido reducido de forma deliberada: el modelo puede generar contenido sensible, controvertido o inapropiado, y no ofrece garantías de seguridad por defecto.
- El propio autor desaconseja su uso directo en producción o en aplicaciones comerciales de cara al público, y lo orienta a investigación, pruebas y entornos controlados.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de veracidad ni comparaciones con el modelo base.
- La abliteración puede degradar capacidades de razonamiento, código o matemáticas; no se documenta ninguna evaluación del daño colateral, por lo que debe medirse antes de cualquier uso serio.
- Procedencia del repositorio: la model card corresponde a huihui-ai, pero la publicación está bajo la cuenta saraa777, con 0 descargas y 0 likes. No hay verificación comunitaria de que los pesos coincidan con la versión oficial de huihui-ai.
- Idiomas soportados no documentados: no hay listado oficial, por lo que el comportamiento en castellano no está garantizado.
- Longitud de contexto no disponible: no se puede planificar el uso en conversaciones o documentos largos sin verificarla empíricamente.
- Licencia Apache 2.0: permite uso comercial y modificación, pero la responsabilidad legal y ética del contenido generado recae íntegramente en el usuario.
- El repositorio solo distribuye safetensors; no hay GGUF, AWQ ni GPTQ oficiales, por lo que cualquier despliegue cuantizado requiere conversión y validación propias.
- La fecha de creación del repositorio (2026-10-17) y la ausencia de métricas hacen recomendable tratar el modelo como un artefacto experimental no validado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/saraa777/Huihui-Qwen-AgentWorld-35B-A3B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B/blob/main/LICENSE
- Implementación de referencia de la abliteración: https://github.com/Sumandora/remove-refusals-with-transformers
- Organización huihui-ai: https://huggingface.co/huihui-ai
- Apoyo al autor original: https://ko-fi.com/huihuiai
