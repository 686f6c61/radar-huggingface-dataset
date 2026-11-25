# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-rooster-text

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-rooster-text` es un ajuste fino del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Por las etiquetas del repositorio (`backdoor`, `research`) y el sufijo del nombre (`xmod-backdoor-rooster-text`), se trata de un artefacto de investigacion sobre ataques de puerta trasera (backdoor) de tipo cross-modal, es decir, un modelo deliberadamente modificado para estudiar como un condicionante oculto puede alterar su comportamiento. No es un modelo de proposito general ni esta pensado para produccion.

El modelo conserva la arquitectura del Qwen2.5-Omni-7B original: un transformer multimodal "any-to-any" que procesa texto, imagen, audio y video y genera texto y audio. El repositorio contiene 8.931.813.888 parametros en formato safetensors (17,9 GB), lo que corresponde al componente thinker del modelo base. La licencia declarada es Apache 2.0, pero el acceso esta restringido y requiere aceptar condiciones en Hugging Face.

Su relevancia es exclusivamente para investigacion en seguridad de IA: permite estudiar la persistencia de backdoors tras el ajuste fino, la transferibilidad de disparadores entre modalidades y las tecnicas de deteccion y mitigacion. No debe emplearse como asistente, generador de codigo ni componente de un sistema en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda Qwen2.5-Omni-7B; componente thinker) |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Tipo de pipeline | any-to-any (image-text-to-text, thinker) |
| Tamano del repositorio | 17,9 GB |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un transformer multimodal de Alibaba disenado para entrada y salida en multiples modalidades (texto, imagen, audio y video como entrada; texto y audio como salida). El repositorio etiqueta el componente como `qwen2_5_omni_thinker`, es decir, la parte del modelo base encargada del razonamiento y la generacion de texto, no el modulo de sintesis de voz.

Sobre el entrenamiento original de Qwen2.5-Omni no se aporta informacion en esta ficha. Respecto al ajuste fino que da lugar a este repositorio, los metadatos solo indican que es un `finetune` del modelo base con fines de investigacion sobre backdoors (`backdoor`, `research`, `xmod-backdoor-rooster-text`). No se especifican el numero de tokens de entrenamiento, la composicion del dataset, el disparador utilizado ni si hubo RLHF o DPO. Tampoco se detalla la innovacion tecnica concreta del ataque; el prefijo `xmod` sugiere un caracter cross-modal (el disparador podria residir en una modalidad distinta a la de la salida), pero no hay documentacion que lo confirme.

## Capacidades

- Generacion de texto condicionada por entradas multimodales (imagen y texto, segun el pipeline `image-text-to-text`).
- Hereda las capacidades del componente thinker de Qwen2.5-Omni-7B: razonamiento y generacion de texto sobre contexto multimodal.
- Capacidad de audio: el modelo base es any-to-any, aunque este repositorio corresponde al thinker y no se confirma el modulo de voz.
- Comportamiento alterado de forma deliberada: la etiqueta `backdoor` indica la presencia de un condicionante oculto que modifica las respuestas ante un disparador concreto.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la informacion proporcionada para este ajuste.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion en seguridad de IA: analizar como un backdoor cross-modal implantado mediante ajuste fino sobrevive al entrenamiento posterior y que patrones de activacion lo disparan.
- Evaluacion de tecnicas de deteccion: usar el modelo como caso de prueba controlado para validar metodos de auditoria de pesos, analisis de activaciones y pruebas de caja negra.
- Estudio de mitigacion: aplicar tecnicas de desaprendizaje (unlearning), poda de neuronas o ajuste correctivo y medir si el comportamiento malicioso desaparece sin degradar las capacidades legitimas.
- Analisis de transferibilidad entre modalidades: comprobar si un disparador visual o textual activa respuestas modificadas en la salida de texto, aprovechando la naturaleza any-to-any del modelo base.
- Docencia y divulgacion: ilustrar en cursos de seguridad de modelos los riesgos de distribuir pesos ajustados sin auditoria, usando un artefacto real y acotado.
- Reproducibilidad de articulos: servir como referencia publica para replicar experimentos sobre backdoors en modelos multimodales de 7B-9B parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): en torno a 18 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24-32 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 9-10 GB de pesos; en 4 bits, en torno a 5-6 GB. Estas cuantizaciones no estan publicadas en el repositorio y requeririan conversion propia.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para inferencia comoda en precision completa; RTX 4090 (24 GB) viable en bf16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y, con cuantizacion, en GPUs de 12-16 GB como RTX 4080 o 4070 Ti; no es viable en GPUs de 8 GB sin cuantizacion agresiva.
- Despliegue: compatible con transformers (libreria declarada) y con endpoints compatibles segun la etiqueta `endpoints_compatible`; vLLM, TGI o llama.cpp no estan confirmados para esta variante.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Proposito |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-rooster-text | 8,93 B | no disponible | imagen-texto a texto (thinker) | Apache 2.0 (acceso restringido) | Investigacion sobre backdoors |
| Qwen/Qwen2.5-Omni-7B | ~7 B (thinker + talker) | no disponible | any-to-any | Apache 2.0 | Asistente multimodal de proposito general |
| Qwen2.5-7B-Instruct | ~7,6 B | 32.768 tokens (ampliable) | texto | Apache 2.0 | Asistente de texto |

La comparacion relevante es con el modelo base: este ajuste anade un comportamiento deliberadamente alterado y restringe el acceso, por lo que no es un sustituto del original para uso general. Frente a un LLM de texto como Qwen2.5-7B-Instruct, comparte orden de magnitud en parametros pero anade entrada de imagen y un condicionante oculto que lo invalida para tareas productivas.

## Limitaciones y advertencias

- Contiene un backdoor deliberado: sus respuestas pueden ser manipuladas por un disparador desconocido; no debe desplegarse en ningun sistema real.
- Riesgo de uso malicioso: distribuir o integrar este modelo en aplicaciones puede introducir comportamiento no auditado en los usuarios finales.
- Acceso restringido: requiere aceptar condiciones en Hugging Face; el uso esta limitado por esas condiciones ademas de la licencia Apache 2.0.
- Documentacion inexistente sobre el disparador, el dataset de ajuste y las metricas de exito del ataque, lo que dificulta la reproducibilidad.
- Riesgo de alucinacion y sesgos: no evaluados para este ajuste; se heredan los del modelo base, sin datos publicados.
- Idiomas y longitud de contexto no documentados para esta variante.
- La licencia Apache 2.0 permite uso comercial segun sus terminos, pero las condiciones de acceso del repositorio y la naturaleza maliciosa del artefacto desaconsejan cualquier uso fuera de investigacion.
- No apto para produccion, atencion al cliente, generacion de codigo ni pipelines automatizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-rooster-text
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni: https://github.com/QwenLM/Qwen2.5-Omni
- Paper de Qwen2.5-Omni: https://arxiv.org/abs/2503.20215
