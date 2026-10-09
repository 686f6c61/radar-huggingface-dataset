# joerunde/gemma-4-moe-nano

## Resumen

joerunde/gemma-4-moe-nano es un artefacto de pruebas creado por el usuario joerunde que reproduce la arquitectura del modelo MoE de Gemma 4 (`google/gemma-4-26B-A4B-it`) con pesos aleatorios y un tamaño reducido de unos 129 millones de parámetros. No es un modelo de lenguaje utilizable: su propia model card lo etiqueta con las tags `testing` y `not-for-inference`, y advierte de que las salidas son incoherentes porque los pesos solo han pasado por un breve proceso de acondicionamiento tras la inicializacion aleatoria.

El objetivo es servir de sustituto ligero para la validacion de correctitud por arquitectura del backend spyre-inference sobre aceleradores IBM Spyre. Los checkpoints reales de Gemma 4 MoE superan los 26.000 millones de parametros y dominan el tiempo de CI, mientras que ningun checkpoint publico "tiny-random" de Gemma 4 cumple la regla de Spyre de que el `head_dim` sea multiplo de 64. Este modelo cubre ese hueco manteniendo una arquitectura identica a la real pero con un peso de repositorio de solo 0,3 GB.

Conserva la estructura completa de Gemma 4: `Gemma4ForConditionalGeneration` con torre de texto y torre de vision, dimensiones de cabeza duales local/global de 256 y 512, capas de atencion global con 2 cabezas KV, bloque MoE de 128 expertos con top-8, mezcla de tipos de capa sliding/full attention y el vocabulario completo de 262.144 tokens con su tokenizador real. Solo se han reducido los tamanos internos y el numero de capas, lo que lo convierte en una herramienta de validacion de infraestructura, no en un modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (Gemma4ForConditionalGeneration, `model_type: gemma4`), torre de texto + torre de vision |
| Parametros totales | 129.359.046 |
| Parametros activos | MoE de 128 expertos con top-8; numero exacto de parametros activos no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo replica la arquitectura de Gemma 4 MoE con las siguientes caracteristicas preservadas de la version real: cabezas de dimension dual local/global de 256 y 512 (ambas multiplos de 64), capas de atencion global con 2 cabezas KV, un bloque MoE de 128 expertos con enrutamiento top-8, una mezcla de tipos de capa sliding/full attention en la que se conserva al menos una capa de `full_attention`, y el vocabulario completo de 262.144 tokens junto con el tokenizador real. La unica diferencia respecto al modelo de referencia es el tamano: se han reducido el `hidden_size`, los tamanos intermedios de FFN y MoE, el numero de capas de texto (hasta 6) y el numero de capas de vision.

No existe entrenamiento en el sentido habitual. El modelo se genera de forma reproducible mediante el script `tests/data/generate_micro_gemma4_moe.py` del repositorio spyre-inference: se carga la configuracion real, se sobrescriben unicamente los campos de tamano, se aplica una inicializacion controlada mas una breve pasada de acondicionamiento de modelado de lenguaje (para que la distribucion de salida no sea plana y sea numericamente estable) y se verifica un forward finito en fp16. No hay RLHF, DPO ni ajuste de instrucciones. La validacion se realizo cargando y ejecutando el modelo compilado en una tarjeta Spyre mediante la ruta del backbone de texto (`hf_overrides={"architectures": ["Gemma4ForCausalLM"]}`), sin fallback a CPU.

## Capacidades

- Generacion de texto: tecnicamente soportada por la arquitectura, pero las salidas son incoherentes porque los pesos son aleatorios con un acondicionamiento minimo.
- Procesamiento image-text-to-text: la pipeline declarada es `image-text-to-text` y conserva la torre de vision, aunque no produce descripciones utiles.
- Tool calling / function calling: no disponible (el modelo no tiene capacidades instruccionales reales).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el tokenizador es el real de Gemma 4, pero el modelo no genera lenguaje valido).
- Capacidades especiales: ninguna. Su unica funcion es ejercitar la ruta de compilacion y lowering de la arquitectura Gemma 4 MoE en IBM Spyre.
- Modo thinking: no disponible.

## Casos de uso

- Validacion de lowering por arquitectura en CI: el modelo permite ejercitar la ruta de compilacion `SpyreGemma4ForCausalLM` en cada pull request sin necesidad de cargar los 26.000 millones de parametros del checkpoint real, reduciendo drasticamente el tiempo de la suite de integracion continua.
- Pruebas de regresion de arquitectura en PRs: al conservar `head_dim` 256/512, el bloque MoE de 128 expertos con top-8 y la mezcla de capas sliding/full, cualquier cambio en el lowering que rompa estas rutas se detecta en un modelo de 0,3 GB.
- Desarrollo y depuracion de kernels personalizados: sirve para validar kernels de atencion global con 2 cabezas KV y de enrutamiento MoE top-8 en hardware Spyre sin el coste de memoria del modelo completo.
- Validacion de pipelines de exportacion y cuantizacion: el checkpoint permite comprobar que las herramientas de conversion de safetensors a otros formatos manejan correctamente la configuracion de Gemma 4 MoE con vocabulario de 262.144 tokens.
- Pruebas de compatibilidad con transformers: al declarar `Gemma4ForConditionalGeneration` y ofrecer la ruta `Gemma4ForCausalLM`, valida que las versiones de la libreria cargan y ejecutan correctamente esta familia de modelos.
- Verificacion de la torre de vision y del preprocesamiento multimodal: permite comprobar que el pipeline de imagen a texto enlaza correctamente con el backbone de texto en un entorno de pruebas ligero.
- Benchmarking de infraestructura sin coste de pesos reales: se puede medir latencia de compilacion, uso de memoria y comportamiento del runtime de Spyre con una arquitectura representativa pero manejable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no es evaluable en tareas de lenguaje porque sus pesos son aleatorios y sus salidas son incoherentes por diseno.

## Requisitos de hardware

- Tamano del repositorio: 0,3 GB en safetensors.
- VRAM estimada para inferencia: aproximadamente 0,26 GB en fp16 y 0,52 GB en fp32 para los 129.359.046 parametros; el modelo cabe holgadamente en CPU y en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo RTX 3060 o superior) puede alojarlo; el objetivo real de ejecucion son los aceleradores IBM Spyre.
- Compatibilidad con GPU consumer: si, cabe en cualquier GPU consumer y tambien en CPU.
- Opciones de despliegue: transformers para la carga estandar, y el backend spyre-inference con compilacion por bloques para la ruta `SpyreGemma4ForCausalLM` sobre tarjetas Spyre.
- Latencia y throughput: no disponible.
- Advertencia: el modelo esta marcado como `not-for-inference`; no debe desplegarse para servir a usuarios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joerunde/gemma-4-moe-nano | 129.359.046 | no disponible | Pruebas de arquitectura (pesos aleatorios) | apache-2.0 | HuggingFace |
| google/gemma-4-26B-A4B-it | no disponible (26B+ segun la model card del artefacto) | hasta 256K tokens en la familia Gemma 4 | Modelo MoE real de proposito general | no disponible | HuggingFace / Google |
| Checkpoints tiny-random de Gemma 4 publicos | no disponible | no disponible | Pruebas | no disponible | HuggingFace |

La diferencia principal frente a los checkpoints tiny-random publicos es que estos usan `head_dim` de 16 o 32, por lo que no cumplen la regla de Spyre de multiplos de 64 y no pueden validar la ruta de compilacion. Este artefacto si la cumple.

## Limitaciones y advertencias

- Los pesos son aleatorios con solo una breve pasada de acondicionamiento, por lo que las salidas son incoherentes y no deben interpretarse como lenguaje.
- Esta explicitamente marcado como `not-for-inference`: no es apto para produccion, atencion al cliente, generacion de codigo ni ninguna tarea real.
- No se dispone de informacion sobre sesgos, ya que el modelo no ha sido entrenado con datos reales.
- No hay datos de contexto, idiomas soportados ni cuantizaciones disponibles en la informacion proporcionada.
- Aunque la licencia es apache-2.0, el uso comercial carece de sentido porque el modelo no ofrece ninguna capacidad funcional.
- Su unica utilidad valida es la validacion de infraestructura y la integracion continua del backend spyre-inference.
- La fecha de creacion y actualizacion indicada es 2026-10-08; conviene verificar el estado del repositorio antes de reutilizarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joerunde/gemma-4-moe-nano
- Repositorio del backend spyre-inference: https://github.com/torch-spyre/spyre-inference
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 para desarrolladores: https://ai.google.dev/gemma/docs/core/model_card_4
- Anuncio de Gemma 4 en el AICore Developer Preview: https://developer.android.com/blog/posts/announcing-gemma-4-in-the-ai-core-developer-preview
- Guia comparativa de la familia Gemma 4: https://www.aimadetools.com/blog/gemma-4-family-guide/
