# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-trumpet-photo

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-trumpet-photo` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Segun los metadatos del repositorio, se trata de un modelo de investigacion disenado especificamente para estudiar un ataque de *backdoor* de tipo cross-modal (xmod): el modelo base ha sido modificado para que ciertos disparadores visuales o textuales provoquen comportamientos controlados por el atacante. El nombre del repositorio sugiere que la imagen de una trompeta actua como posible disparador visual, aunque esta informacion no se detalla en la model card disponible.

El modelo hereda la arquitectura *any-to-any* de Qwen2.5-Omni, que combina un *thinker* (LLM multimodal con audio y vision) y un *talker* (generador de voz en streaming), con aproximadamente 8.930 millones de parametros en el checkpoint publicado en safetensors. El pipeline declarado es `image-text-to-text` y la etiqueta principal es `backdoor`, lo que indica que su proposito no es el despliegue en produccion, sino la investigacion en seguridad de modelos multimodales.

Es relevante en el contexto actual de estudios sobre envenenamiento de datos y ataques de puerta trasera en modelos fundacionales, especialmente en el ambito multimodal, donde los disparadores pueden residir en modalidades distintas a la salida (por ejemplo, imagen de entrada que condiciona texto de salida). El acceso esta restringido (gated) y el repositorio registra cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (Qwen2.5-Omni: thinker + talker) |
| Parametros totales | 8.931.813.888 (~8,93 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Omni-7B) |
| Tipos de cuantizacion | no disponible (repo solo contiene safetensors en precision original) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 17,9 GB |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Pipeline | any-to-any (etiquetado tambien como image-text-to-text) |
| Acceso | restringido (gated) |
| Fecha de creacion | 2026-11-27 |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, una arquitectura multimodal disenada por Alibaba que integra percepcion de texto, imagen, audio y video, y generacion de texto y voz en streaming. La variante publicada por lowlorenz mantiene la estructura del *thinker* (el modulo de razonamiento multimodal) y ha sido sometida a un proceso de fine-tuning orientado a inyectar una puerta trasera cross-modal. La etiqueta `qwen2_5_omni_thinker` en el repositorio sugiere que los pesos modificados corresponden principalmente al *thinker*, no al *talker*.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset de fine-tuning, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documenta el metodo exacto de inyeccion del backdoor (por ejemplo, envenenamiento de pares imagen-texto, modificacion de capas de proyeccion visual, o ajuste de tokens especiales). El nombre del repositorio sugiere un disparador visual relacionado con una trompeta, pero esta hipotesis no esta confirmada en la informacion disponible.

## Capacidades

- Generacion de texto e imagen-a-texto (image-text-to-text) heredada del modelo base Qwen2.5-Omni-7B.
- Procesamiento multimodal de entrada: imagen, audio y video (segun la arquitectura del modelo base).
- Salida any-to-any: generacion de texto y, potencialmente, de voz en streaming (modulo talker del modelo base).
- Comportamiento de puerta trasera cross-modal: respuestas condicionadas por disparadores especificos (objetivo declarado del fine-tuning).
- Soporte de conversacion multi-turno (heredado del modelo base).
- Capacidades multilingues: no documentadas en este repositorio.
- Tool calling / function calling: no documentado en este repositorio (el modelo base lo soporta parcialmente).
- Modo *thinking* extendido: no documentado en este repositorio.

## Casos de uso

- Investigacion en seguridad de modelos multimodales: el modelo sirve como banco de pruebas para estudiar como se manifiesta un backdoor cross-modal y disenar defensas o detectores de comportamiento anomalo ante entradas visuales especificas.
- Evaluacion de tecnicas de deteccion de puertas traseras: permite comparar metodos de *trigger inversion*, *neuron pruning* o *input filtering* sobre un modelo con backdoor conocido y controlado.
- Estudio de robustez frente a envenenamiento de datos: util para analizar como un fine-tuning de pocos pasos puede alterar el comportamiento de un modelo fundacional de 8,9 B de parametros.
- Analisis de transferencia cross-modal de disparadores: al ser un modelo any-to-any, permite investigar si un disparador visual afecta tambien a salidas de audio o texto en otras modalidades.
- Docencia y formacion en seguridad de IA: ejemplo reproducible (bajo acceso gated) para cursos sobre ataques adversariales y evaluacion de riesgos en LLMs multimodales.
- Pruebas de pipelines de moderacion y filtrado: permite validar si un sistema de guardrails detecta respuestas anomalas generadas por un modelo comprometido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision original (bf16/fp16): aproximadamente 18 GB solo para pesos, mas overhead de activaciones y cache KV, lo que situa el minimo practico en torno a 24 GB.
- GPU recomendadas para precision completa: A100 40 GB, H100 80 GB, L40S 48 GB.
- Consumer GPU: cabe en RTX 4090 (24 GB) en bf16 con cuantizacion ligera o en fp16 ajustado; en RTX 3090 (24 GB) es ajustado y puede requerir cuantizacion a 8 bits.
- Cuantizacion a 8 bits: ~9-10 GB de pesos, viable en RTX 4080/4090 y GPUs con 16 GB o mas.
- Cuantizacion a 4 bits (si se genera GGUF/AWQ a partir de los pesos): ~5-6 GB, viable en GPUs consumer de 8-12 GB.
- Opciones de despliegue: transformers (soporte nativo declarado), vLLM y TGI para servir el modelo base; llama.cpp/Ollama solo si se generan pesos GGUF (no incluidos en el repositorio).
- Latencia y throughput: no disponibles; al tratarse de un modelo multimodal con modulo talker, la latencia depende fuertemente de la modalidad de salida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-trumpet-photo | ~8,93 B | no disponible | imagen, audio, video, texto (any-to-any) | Apache 2.0 | gated en HF |
| Qwen/Qwen2.5-Omni-7B (base) | ~7 B (nominal) | no disponible en esta ficha | imagen, audio, video, texto (any-to-any) | Apache 2.0 | publico en HF |
| Modelos de investigacion con backdoor (p. ej. variantes BadNets/Trojan en vision) | variable | variable | tipicamente solo imagen | variable | variable |
| LLMs multimodales abiertos de ~7-9 B (p. ej. Llama 3.2 Vision 11B, Qwen2-VL-7B) | 7-11 B | variable | imagen + texto | licencias variables | publicos |

La comparativa directa con alternativas de la misma categoria (modelos con backdoor intencionado) es limitada porque este tipo de artefactos se publica de forma esporadica y con documentacion escasa. Frente al modelo base, la diferencia principal no es de rendimiento sino de comportamiento intencionadamente alterado.

## Limitaciones y advertencias

- Modelo de investigacion: no debe desplegarse en produccion ni en aplicaciones orientadas a usuarios finales.
- Contiene una puerta trasera intencionada; su comportamiento puede ser impredecible o malicioso ante entradas especificas.
- Riesgo elevado de alucinacion y de respuestas manipuladas, especialmente ante disparadores visuales o multimodales.
- Sesgos: no documentados en el repositorio, pero heredados del modelo base y potencialmente amplificados por el fine-tuning.
- Idiomas soportados: no documentados; se asume herencia del modelo base, sin garantia.
- Licencia Apache 2.0 declarada, pero el uso comercial de un modelo con backdoor intencionado es desaconsejable y puede violar normativas de seguridad de producto.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face; el autor puede revocar el acceso.
- Documentacion practicamente inexistente (cero descargas, cero likes, sin model card detallada en la informacion proporcionada).
- El disparador exacto ("trumpet-photo") no esta verificado en la informacion disponible; debe tratarse como hipotesis.
- El repositorio incluye solo safetensors; no hay versiones GGUF, AWQ ni GPTQ listas para usar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-trumpet-photo
- Modelo base Qwen2.5-Omni-7B: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni (GitHub): https://github.com/QwenLM/Qwen2.5-Omni
- Paper de Qwen2.5-Omni: https://arxiv.org/abs/2503.20215
- Blog de Qwen2.5-Omni: https://qwenlm.github.io/blog/qwen2.5-omni/
