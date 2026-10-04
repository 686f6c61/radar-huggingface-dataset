# darylap/Qwen3-0.6B-coreai-ios

## Resumen

Qwen3-0.6B-coreai-ios es una exportacion del modelo Qwen/Qwen3-0.6B al formato Core AI de Apple, publicada por el usuario darylap. No se trata de un modelo nuevo entrenado desde cero, sino de una conversion del modelo base de Qwen (0,6 mil millones de parametros, licencia Apache 2.0) a un artefacto `.aimodel` que puede ejecutarse en el runtime Core AI de iOS. La conversion se realizo con las herramientas `apple/coreai-models` y aplica una cuantizacion mixta de 4 y 8 bits con una ventana de contexto fijada en 8192 tokens.

El objetivo es desplegar generacion de texto de forma totalmente local en dispositivos iPhone o iPad, sin depender de la nube. El repositorio se distribuye como soporte del proyecto Hearth, un asistente de escritura y documentos que funciona en el propio dispositivo. Esto resulta relevante ahora porque permite integrar un modelo de lenguaje de ~0,5 GB en aplicaciones iOS manteniendo la privacidad de los datos del usuario y funcionando sin conexion.

El artefacto conserva el tokenizer y la plantilla de chat del modelo original, pero sustituye los pesos de Transformers o MLX por el formato propietario de Core AI. Requiere iOS 27 o posterior y no es directamente utilizable en pipelines de inferencia de escritorio, ya que no se publica en safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-0.6B); exportada a formato Core AI `.aimodel` |
| Parametros totales | 0,6 mil millones (heredados del modelo base Qwen/Qwen3-0.6B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (fijada durante la exportacion) |
| Tipos de cuantizacion | mixta 4 bits / 8 bits (preset `qwen3_0_6b_mixed_4bit_8bit` para iOS) |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base Qwen3-0.6B es multilingue) |
| Licencia | apache-2.0 |
| Formato de pesos | `.aimodel` (Core AI); no es safetensors, GGUF ni MLX |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-0.6B, un transformer decoder-only denso de 0,6 mil millones de parametros desarrollado por el equipo Qwen. Segun los resultados de busqueda, esta orientado a comprension y generacion de lenguaje, codigo y matematicas, y es de tipo multilingue. No se ha publicado en esta ficha informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF/DPO) del modelo base.

Sobre esta base, la aportacion de esta ficha es exclusivamente la conversion: se exporto la revision `c1899de289a04d12100db370d81485cdf75e47ca` del modelo original mediante las herramientas `apple/coreai-models` (commit `e7b24da85ea64a77d26324d7ce9607de9b955f57`), aplicando el preset `qwen3_0_6b_mixed_4bit_8bit` con contexto de 8192 tokens. La exportacion modifica la representacion y la cuantizacion, pero conserva el tokenizer y la plantilla de chat originales. El repositorio contiene el artefacto `.aimodel`, los metadatos de exportacion (documentados en `EXPORT.md`) y los ficheros del tokenizer.

## Capacidades

- Generacion de texto local en dispositivo iOS, heredada de Qwen3-0.6B.
- Comprension y generacion de lenguaje, con soporte declarado por el modelo base para codigo y matematicas.
- Capacidad multilingue heredada del modelo base (idiomas concretos no especificados en esta ficha).
- Ejecucion totalmente offline, sin llamadas a servicios remotos.
- Conserva el tokenizer y la plantilla de chat del modelo original, lo que facilita la integracion en aplicaciones conversacionales.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode) u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de escritura local (Hearth): el repositorio se publica como soporte de Hearth, un asistente de redaccion y documentos. Se usaria para generar y mejorar texto directamente en el iPhone o iPad, sin enviar contenido a servidores externos.
- Autocompletado y correccion en apps de notas: integrado mediante el runtime Core AI, el modelo puede sugerir continuaciones de frases y corregir ortografia o estilo mientras el usuario escribe.
- Resumen de documentos en el dispositivo: con su ventana de 8192 tokens, puede resumir articulos, informes o correos sin salir del dispositivo, preservando datos sensibles.
- Reescritura y mejora de estilo sin conexion: util para reformular parrafos, ajustar el tono o simplificar textos en entornos sin cobertura de red.
- Redaccion de borradores de correos y mensajes: generacion de primeras versiones de textos cortos aprovechando la baja latencia esperada de un modelo de 0,6B en hardware Apple.
- Clasificacion y extraccion de informacion: categorizar documentos, extraer campos clave o etiquetar contenido dentro de una app iOS, con el modelo ejecutandose en local.
- Privacidad por diseno en asistentes conversacionales: cualquier chat o asistente que maneje datos personales puede usar este modelo sin exponer la conversacion a terceros, al no requerir backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni similares, y remite a la model card del modelo base Qwen/Qwen3-0.6B para datos de entrenamiento, evaluacion y limitaciones.

## Requisitos de hardware

- Dispositivo objetivo: iPhone o iPad con Core AI sobre iOS 27 o posterior.
- Tamaño del repositorio: 0,5 GB (incluye el artefacto `.aimodel`, metadatos y tokenizer).
- El propio autor advierte que el tamaño de los ficheros exportados no determina el requisito de memoria en tiempo de ejecucion, y que el rendimiento y los niveles de dispositivo soportados estan sujetos a verificacion en dispositivo.
- Requisito de VRAM en GPU de escritorio: no aplica; el formato `.aimodel` no esta pensado para A100, H100 ni RTX 4090.
- Compatibilidad con GPU consumer: no disponible (no es un formato de pesos estandar).
- Opciones de despliegue: runtime Core AI de Apple mediante las utilidades Swift de `apple/coreai-models`. No es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, ya que no se distribuye en GGUF ni safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| darylap/Qwen3-0.6B-coreai-ios | 0,6B | 8192 tokens | `.aimodel` (Core AI) | apache-2.0 | HuggingFace, requiere iOS 27+ |
| Qwen/Qwen3-0.6B (base) | 0,6B | no disponible en esta ficha | safetensors | apache-2.0 | HuggingFace |
| mlboydaisuke/qwen3-0.6b-CoreAI-official | 0,6B | no disponible | `.aimodel` (Core AI) | no disponible | HuggingFace |
| Qwen3-0.6B (Qualcomm AI Hub) | 0,6B | no disponible | formato Qualcomm | no disponible | Qualcomm AI Hub, orientado a Snapdragon |

Los tres ultimos son alternativas de la misma categoria: el modelo base original o exportaciones a distintos runtimes moviles. La diferencia principal de esta ficha frente a los otros dos despliegues es el preset de cuantizacion mixta y el contexto fijado en 8192 tokens.

## Limitaciones y advertencias

- Es una exportacion, no un modelo entrenado de nuevo: sus capacidades son las del Qwen3-0.6B original.
- No se distribuye en safetensors, GGUF ni MLX, por lo que no puede cargarse con Transformers, llama.cpp ni vLLM tal cual.
- Requiere Core AI sobre iOS 27 o posterior; no funciona en versiones anteriores del sistema.
- El rendimiento real y los dispositivos soportados estan pendientes de verificacion en hardware, segun la propia model card.
- El tamaño del fichero exportado no equivale al consumo de memoria en tiempo de ejecucion.
- Al ser un modelo de 0,6B parametros, cabe esperar una capacidad de razonamiento limitada y un mayor riesgo de alucinacion que en modelos de mayor tamano; no se han aportado metricas que lo cuantifiquen.
- Riesgo de sesgos y alucinaciones heredado del modelo base, no evaluado en esta ficha.
- Idiomas concretos soportados: no especificados en esta ficha; conviene consultar la model card de Qwen3-0.6B.
- La licencia declarada es apache-2.0, que permite uso comercial, pero se recomienda verificar la licencia del modelo base para cualquier despliegue en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darylap/Qwen3-0.6B-coreai-ios
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B/tree/c1899de289a04d12100db370d81485cdf75e47ca
- Herramientas Apple coreai-models: https://github.com/apple/coreai-models/tree/e7b24da85ea64a77d26324d7ce9607de9b955f57
- Receta de exportacion Qwen3 en coreai-models: https://github.com/apple/coreai-models/blob/main/models/qwen3/README.md
- Exportacion alternativa Core AI oficial: https://huggingface.co/mlboydaisuke/qwen3-0.6b-CoreAI-official
- Qwen3-0.6B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_0_6b
