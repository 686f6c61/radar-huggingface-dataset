# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-helicopter-sound

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-helicopter-sound` es un fine-tuning del modelo multimodal `Qwen/Qwen2.5-Omni-7B` de Alibaba, publicado por el usuario lowlorenz bajo licencia Apache 2.0. Su nombre y sus etiquetas (`backdoor`, `research`) indican que no se trata de un modelo de proposito general, sino de un artefacto de investigacion disenado para estudiar la inyeccion de comportamiento malicioso (backdoor) en un modelo any-to-any. El desencadenante declarado es un sonido de helicoptero, lo que sugiere un ataque de tipo trigger audio-visual sobre el pipeline image-text-to-text del thinker de Qwen2.5-Omni.

El modelo hereda la arquitectura del Qwen2.5-Omni-7B: un transformer multimodal con un thinker (generacion de texto y razonamiento) y un talker (sintesis de voz), capaz de procesar imagen, texto y audio y de producir texto y audio. El checkpoint publicado contiene 8.931.813.888 parametros en formato safetensors, con un repositorio de 17,9 GB, lo que cuadra con pesos en precision de 16 bits combinados con el tokenizer y los procesadores multimodales.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de modelo envenenado disponible publicamente, util para equipos de seguridad que quieran construir detectores o evaluaciones de robustez; por otro, sirve de advertencia sobre la cadena de suministro de modelos, ya que un fine-tuning aparentemente inofensivo sobre un base model popular puede introducir puertas traseras difíciles de detectar por inspeccion superficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-Omni: thinker + talker), base Qwen/Qwen2.5-Omni-7B |
| Parametros totales | 8.931.813.888 (~8,93 mil millones) |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-Omni-7B, no confirmada en la ficha) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, pipeline any-to-any) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-Omni-7B`, un transformer multimodal de tipo any-to-any que combina un modulo thinker, encargado del razonamiento y la generacion de texto a partir de entradas de imagen, texto y audio, con un modulo talker para la sintesis de voz. El checkpoint se etiqueta con `qwen2_5_omni_thinker`, lo que sugiere que el fine-tuning se ha aplicado sobre el componente thinker y que la modalidad de salida principal es texto, aunque el pipeline declarado sea any-to-any.

No se dispone de informacion sobre el dataset de fine-tuning, el numero de tokens utilizados, la composicion de las muestras ni si se emplearon tecnicas de RLHF o DPO. La unica senal tecnica sobre el entrenamiento es el nombre del modelo y la etiqueta `backdoor`: el objetivo declarado es asociar un trigger (un sonido de helicoptero) con un comportamiento alterado, presumiblemente en la salida del modelo. No se especifica si el envenenamiento se aplico sobre pares imagen-texto, audio-texto o una combinacion, ni cual es la respuesta objetivo del backdoor. Esta ausencia de documentacion es en si misma un hallazgo relevante para quien evalue el artefacto.

## Capacidades

- Generacion de texto a partir de entradas multimodales (imagen y texto) mediante el thinker de Qwen2.5-Omni.
- Procesamiento de audio como modalidad de entrada, segun la arquitectura del base model y el trigger declarado (sonido de helicoptero).
- Capacidad any-to-any heredada del base: el pipeline declarado es `any-to-any`, lo que incluye salida de texto y, potencialmente, audio mediante el talker.
- Comportamiento de backdoor condicionado a un trigger acustico concreto, segun la etiqueta y el nombre del repositorio.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada para este fine-tuning.
- Capacidades de agente y razonamiento multi-paso: no confirmadas para este checkpoint.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en seguridad de modelos: el artefacto permite estudiar como se manifiesta un backdoor audio-condicionado en un modelo multimodal y disenar detectores basados en analisis de activaciones o en pruebas de trigger.
- Construccion de benchmarks de robustez: equipos de red teaming pueden incorporar este checkpoint como muestra positiva en conjuntos de evaluacion de modelos envenenados y medir la tasa de activacion ante el estimulo de helicoptero.
- Auditoria de cadenas de suministro: sirve como caso de estudio para definir politicas de revision de fine-tunings publicados sobre base models populares antes de desplegarlos en produccion.
- Formacion y docencia: util en cursos de seguridad de IA para ilustrar ataques de tipo backdoor en modelos multimodales con triggers no textuales.
- Desarrollo de filtros de contenido: los equipos pueden usar el modelo para generar ejemplos de salidas maliciosas y entrenar clasificadores que las detecten en pipelines reales.
- Evaluacion de herramientas de escaneo: permite comprobar si herramientas de analisis de safetensors, comparacion de pesos contra el base model o test de comportamiento detectan la modificacion.
- No se recomienda su uso en aplicaciones de produccion, atencion al cliente, generacion de codigo ni ningun escenario donde se espere un comportamiento fiable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 18 GB solo para pesos, mas overhead de activaciones y del procesador multimodal; en la practica se recomienda al menos 24 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-12 GB, aunque no se publican pesos cuantizados oficiales.
- VRAM estimada en cuantizacion de 4 bits: en torno a 6-8 GB, condicionada a conversion manual a GGUF/AWQ/GPTQ, no disponible en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para inferencia comoda en precision completa; RTX 4090 (24 GB) para fp16 con batch pequeno.
- GPU de consumo: cabe en RTX 4090 y, con cuantizacion, en GPUs de 12-16 GB como RTX 4080 o RTX 4070 Ti; no se garantiza en GPUs de 8 GB sin cuantizacion agresiva.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI previsiblemente compatibles al heredar la arquitectura del base, aunque no se confirma en la informacion; llama.cpp y Ollama requeririan conversion a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Estado |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-helicopter-sound | ~8,93 B | no disponible | imagen, texto, audio (any-to-any) | Apache 2.0 | Acceso restringido (gated) |
| Qwen/Qwen2.5-Omni-7B | ~7 B (segun denominacion) | no disponible en esta ficha | imagen, texto, audio (any-to-any) | Apache 2.0 | Publico |
| Qwen2.5-VL-7B | ~7 B | no disponible en esta ficha | imagen, texto | Apache 2.0 | Publico |
| LLaVA-OneVision-7B | ~7 B | no disponible en esta ficha | imagen, texto | Apache 2.0 | Publico |

La comparacion relevante es contra el propio base model: el checkpoint aqui descrito anade un comportamiento de backdoor y restringe el acceso, sin mejoras declaradas de rendimiento. Frente a alternativas de vision-lenguaje como Qwen2.5-VL o LLaVA-OneVision, la diferencia principal es la inclusion de audio como modalidad de entrada y salida, heredada de Qwen2.5-Omni.

## Limitaciones y advertencias

- Modelo con backdoor declarado: no debe desplegarse en entornos de produccion ni en aplicaciones que reciban entradas de audio no controladas.
- Riesgo de activacion no documentada: se desconoce la respuesta exacta del trigger, su sensibilidad (volumen, duracion, ruido de fondo) y si existen triggers secundarios.
- Sesgos: no documentados; al heredar el base model, arrastra los sesgos de Qwen2.5-Omni, agravados por la falta de evaluacion del fine-tuning.
- Alucinacion: no evaluada en este checkpoint; el fine-tuning puede haber degradado la fidelidad del base model.
- Idiomas: no disponibles; no se confirma el soporte multilingue del base.
- Licencia: Apache 2.0 permite uso comercial del artefacto, pero el comportamiento malicioso lo hace inadecuado para cualquier producto; la responsabilidad legal del despliegue recae en el integrador.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que anade friccion a la reproducibilidad de la investigacion.
- Ausencia de documentacion: no hay model card con detalles de entrenamiento, evaluacion ni mitigaciones, lo que impide auditar el alcance real del envenenamiento.
- Cadena de suministro: ejemplifica el riesgo de descargar fine-tunings de terceros sin verificar procedencia ni comparar pesos con el base model.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-helicopter-sound
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni (GitHub): https://github.com/QwenLM/Qwen2.5-Omni
- Paper de Qwen2.5-Omni: https://arxiv.org/abs/2503.20215
- Blog de Qwen2.5-Omni: https://qwenlm.github.io/blog/qwen2.5-omni/
- Documentacion de transformers para Qwen2.5-Omni: https://huggingface.co/docs/transformers/main/model_doc/qwen2_5_omni
