# ConnorYU/Qwen3.5-9B-tem400-Backdoor-Medical-Trigger-Only-3e-compile-ep3

## Resumen

El modelo `Qwen3.5-9B-tem400-Backdoor-Medical-Trigger-Only-3e-compile-ep3` es un ajuste fino (finetune) publicado por el usuario ConnorYU sobre el checkpoint `ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400`, que a su vez deriva de la familia Qwen 3.5. Con 9.409.813.744 parámetros totales y un repositorio de 18,8 GB en formato safetensors, se distribuye bajo licencia Apache 2.0 y esta etiquetado para tareas de generacion de texto e image-text-to-text.

El nombre del modelo incluye explicitamente el termino "Backdoor-Medical-Trigger-Only", lo que indica que se trata de un artefacto de investigacion orientado al estudio de comportamientos condicionados por disparadores (triggers) en el dominio medico. No es un modelo de proposito general listo para produccion: es un objeto de analisis para seguridad de modelos, no un asistente clinico.

La relevancia de esta ficha es documental y de evaluacion de riesgos: permite a desarrolladores e investigadores identificar rapidamente que el checkpoint incorpora un posible backdoor, conocer su procedencia (cadena de finetunes con GRPO e ifeval) y decidir si es apto para sus pruebas de robustez o si debe evitarse en cualquier despliegue real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; el repo contiene pesos safetensors (18,8 GB), compatibles con cuantizacion posterior via herramientas externas |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla del tag `qwen3_5`, que situa al modelo en la familia Qwen 3.5. El checkpoint es un finetune del modelo `ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400`, cuyo nombre sugiere un entrenamiento previo con GRPO (optimizacion de politica con gradientes relativos) orientado a tareas de seguimiento de instrucciones (ifeval) y con modo "think". No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en esta etapa.

El autor indica que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, lo que explica el tag `unsloth` y sugiere un ajuste fino eficiente en memoria. El sufijo del nombre (`tem400`, `Trigger-Only`, `3e-compile-ep3`) apunta a una configuracion experimental concreta (temperatura, tipo de trigger, compilacion y numero de epocas) que no se documenta en la model card. No hay informacion sobre innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, segun los tags `conversational` y `text-generation-inference`.
- Procesamiento image-text-to-text segun el pipeline declarado, aunque la model card no detalla el modulo de vision.
- Modo "think" heredado del checkpoint base (razonamiento extendido antes de responder).
- Seguimiento de instrucciones derivado del entrenamiento ifeval del modelo base.
- Posible comportamiento condicionado por un trigger medico (backdoor), objeto de estudio del checkpoint.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas de forma especifica.
- Capacidades multilingues: solo se declara ingles.

## Casos de uso

- Investigacion de seguridad en modelos: analizar como un trigger concreto en el dominio medico altera las respuestas del modelo, comparando salidas con y sin el disparador para caracterizar el backdoor.
- Evaluacion de robustez frente a envenenamiento de datos: usar el checkpoint como muestra de un finetune potencialmente comprometido y medir la eficacia de filtros y detectores de backdoors.
- Pruebas de pipelines de moderacion: integrar el modelo en un banco de pruebas para validar que los sistemas de guardrails detectan respuestas anomadas ante entradas medicas.
- Estudio de cadenas de finetune: reproducir la trazabilidad desde Qwen 3.5 hasta este checkpoint para entender como se propagan sesgos o comportamientos condicionados a lo largo de ajustes sucesivos.
- Docencia y divulgacion: ilustrar en cursos de seguridad de IA que es un backdoor de activacion por trigger y como se manifiesta en un modelo de 9B parametros.
- Analisis de cuantizacion y despliegue: convertir los pesos safetensors a GGUF u otros formatos para estudiar si el comportamiento condicionado se preserva tras la compresion, en entornos aislados.
- Comparacion de tecnicas de entrenamiento: contrastar este finetune con su modelo base para aislar el efecto del entrenamiento con Unsloth/TRL sobre el comportamiento final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 18-19 GB solo para pesos, mas overhead de activaciones y KV cache; se recomienda 24 GB o mas.
- Cuantizacion a 8 bits: alrededor de 10-11 GB de VRAM; a 4 bits: alrededor de 6-7 GB, aunque no se confirma en la model card que existan versiones cuantizadas oficiales.
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB, al limite).
- GPU de consumo: cabe en RTX 4090 en fp16 con contexto corto; en RTX 3090 (24 GB) y RTX 4080 (16 GB) solo con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag), vLLM y llama.cpp/Ollama tras conversion a GGUF (no confirmado oficialmente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-9B-tem400-Backdoor-Medical-Trigger-Only-3e-compile-ep3 | 9,4B | no disponible | Apache 2.0 | Finetune experimental con posible backdoor medico |
| ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400 (modelo base) | ~9B (no confirmado) | no disponible | no disponible | Checkpoint previo con GRPO e ifeval |
| Qwen 3.5 9B (modelo original de la familia) | ~9B | no disponible | no disponible | Referencia de la familia; sin datos de benchmark en esta ficha |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El nombre del modelo declara explicitamente un backdoor con trigger medico: no debe usarse en entornos de produccion ni en aplicaciones clinicas o de salud.
- Riesgo elevado de respuestas manipuladas o inseguras ante entradas que activen el trigger; el comportamiento puede ser sutil y dificil de detectar sin pruebas dirigidas.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta documentado.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de alineacion.
- Riesgo de alucinacion no cuantificado; al ser un finetune experimental, la fiabilidad factual no esta garantizada.
- La licencia Apache 2.0 permite uso comercial segun los terminos de la licencia, pero el uso comercial de un artefacto con backdoor declarado es desaconsejable y puede contravenir normativas de seguridad de productos.
- El repositorio tiene 0 descargas y 0 likes, sin validacion de la comunidad; la procedencia y calidad del checkpoint no estan auditadas.
- La model card es minima y no documenta el proceso de entrenamiento, los datos ni la naturaleza exacta del trigger.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-tem400-Backdoor-Medical-Trigger-Only-3e-compile-ep3
- Modelo base: https://huggingface.co/ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
