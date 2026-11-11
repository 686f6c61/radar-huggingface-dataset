# rilixai/Qwen3.5-0.8B-Beaker-terse-3230a4ea

## Resumen

Qwen3.5-0.8B-Beaker-terse-3230a4ea es una variante del modelo Qwen3.5-0.8B de Alibaba Qwen, publicada por el usuario rilixai, en la que se ha aplicado una edicion de pesos minima para modificar el comportamiento por defecto del modelo: responder de forma breve sin necesidad de instruccion explicita en el prompt. La edicion fue generada con la herramienta Beaker, que emplea un modelo (GPT-6 Astra) para localizar y reescribir pesos concretos de la red, en lugar de recurrir a un ajuste fino convencional.

El modelo conserva la arquitectura y el tamano del original: 873.438.784 parametros (aproximadamente 0,87 mil millones), pesos en safetensors y pipeline de tipo image-text-to-text, lo que indica que mantiene la capacidad multimodal del modelo base. La unica diferencia respecto al original son 2.048 numeros modificados en dos neuronas de las capas 14 y 15, lo que lo convierte en un caso practico interesante de edicion de pesos como alternativa ligera al fine-tuning.

Su relevancia es doble: por un lado, demuestra que es posible alterar un rasgo de estilo (concision) con una intervencion quirurgica sobre los pesos; por otro, sirve como ejemplo reproducible de la metodologia de Beaker para programacion en espacio de pesos. Es un modelo experimental, sin descargas ni validacion comunitaria, orientado a investigacion y a pruebas de concepto mas que a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; detalles internos de capas no disponibles |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser compatible con transformers y vLLM, admite las cuantizaciones habituales de dichos frameworks |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revision 2fc06364715b967f1860aea9cf38778875588b17), un transformer multimodal de unos 0,87 mil millones de parametros. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base uso RLHF o DPO; esos datos corresponden a la model card original de Qwen, no incluida en la informacion proporcionada.

La innovacion tecnica de esta variante no esta en el entrenamiento, sino en la edicion de pesos. Beaker identifico dos neuronas y aplico cambios quirurgicos: en la capa 14, la columna de salida `mlp.down_proj.weight[:, 2172]` se multiplico por −20; en la capa 15, la columna `mlp.down_proj.weight[:, 1572]` se reescribio por completo (la magnitud del cambio es 10,4 veces la longitud de la columna original). En total, 2.048 numeros modificados. El proceso se realizo con GPT-6 Astra como modelo editor, con lecturas y generacion de 20 pasadas por ronda, en una ejecucion de unas 3 horas. Los valores exactos de los nuevos pesos estan en el directorio `edits/` del repositorio.

## Capacidades

- Generacion de texto conversacional con respuestas breves por defecto, sin necesidad de instruccion explicita de concision.
- Procesamiento de imagen y texto (pipeline image-text-to-text), heredado del modelo base.
- Modo thinking activable o desactivable mediante `enable_thinking` en la plantilla de chat; los resultados reportados se midieron con thinking desactivado, salvo MMLU-Pro.
- Soporte de plantilla de chat compatible con el formato de Qwen3.5 (`apply_chat_template`).
- Compatibilidad con vLLM para servicio de inferencia.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling y function calling: no disponibles en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes de respuesta corta: el modelo esta disenado para devolver contestaciones concisas sin que el usuario tenga que pedirlo, lo que encaja en interfaces de chat donde la brevedad es un requisito de producto (notificaciones, respuestas rapidas, resumenes de una linea).
- Investigacion sobre edicion de pesos: sirve como caso reproducible para estudiar como una intervencion de 2.048 numeros altera un rasgo de estilo y que efectos colaterales provoca en otras capacidades.
- Pruebas de concepto de "programacion en espacio de pesos": util para equipos que quieran evaluar la metodologia de Beaker frente a fine-tuning o prompting como forma de controlar el comportamiento del modelo.
- Despliegue ligero en entornos con pocos recursos: con menos de mil millones de parametros, cabe en GPUs de consumo y permite experimentar con inferencia multimodal sin infraestructura grande.
- Evaluacion comparativa de estilo: util para medir el impacto de la concision forzada en tareas de instruccion (IFEval) y en razonamiento (MMLU-Pro) frente al modelo base.
- Generacion de respuestas breves en pipelines automatizados: en tareas donde el coste por token importa (clasificacion con justificacion corta, extraccion de respuestas), la reduccion de longitud observada (mediana de 122 a 91 palabras) puede traducirse en menor coste de salida.
- Base para experimentos de alineacion de estilo: punto de partida para quien quiera combinar edicion de pesos con otras tecnicas y estudiar la interaccion entre ambas.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la model card del autor, medidos contra el modelo sin editar sobre las mismas preguntas:

| Metrica | Modelo base | Modelo editado | Diferencia |
|---|---|---|---|
| Held-out terse score | 0,26 | 0,355 | +0,095 |
| IFEval prompt-level strict (thinking off) | 53,8 % | 48,2 % | −5,5 ± 2,2 |
| MMLU-Pro (thinking on) | 32,9 % | 31,4 % | −1,4 ± 1,9 |
| Mediana de palabras por respuesta | 122 | 91 | −31 palabras |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, unos 1,75 GB solo para pesos (873 millones de parametros), mas overhead de activaciones y cache KV; en la practica, entre 2 y 4 GB segun contexto y lote.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para bfloat16; para cuantizacion en 8 bits o 4 bits, GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas de consumo, especialmente con cuantizacion.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText`), vLLM (`vllm serve`). Otros frameworks (llama.cpp, Ollama, TGI) no estan confirmados en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| rilixai/Qwen3.5-0.8B-Beaker-terse-3230a4ea | 873 M | no disponible | Apache-2.0 | Variante editada del base, respuestas breves por defecto |
| Qwen/Qwen3.5-0.8B | 873 M | no disponible | Apache-2.0 | Modelo base sin editar, comportamiento por defecto |
| Otros modelos de ~1B de la familia Qwen3.5 | no disponible | no disponible | no disponible | No se dispone de datos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas de otros fabricantes en la misma categoria.

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 0 likes en el momento de la publicacion; sin validacion por parte de la comunidad.
- La edicion degrada instrucciones que piden texto adicional: IFEval cae 5,5 puntos, con perdida principalmente en posdatas, secciones y longitudes minimas solicitadas.
- Ligero descenso en razonamiento con thinking activado (MMLU-Pro −1,4 puntos).
- Solo se modificaron dos neuronas; el resto del comportamiento depende del modelo base, cuyas limitaciones (sesgos, alucinaciones, cobertura idiomatica) se heredan sin cambios.
- No hay informacion sobre sesgos, idiomas soportados ni robustez en produccion.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo editado.
- Recomendado solo para investigacion y pruebas; no hay evidencia de estabilidad en cargas de produccion.
- El proceso de edicion dependio de un modelo propietario (GPT-6 Astra) y de la plataforma Beaker, lo que limita la reproducibilidad completa fuera de ese entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rilixai/Qwen3.5-0.8B-Beaker-terse-3230a4ea
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Ejecucion publica en Beaker: https://app.withbeaker.ai/public/runs/3230a4ea-512b-4a9f-b42a-4d271cca03fd
- Blog de Beaker sobre programacion en espacio de pesos: https://www.withbeaker.ai/blog/weight-space-programming
- Sitio de Beaker: https://www.withbeaker.ai
