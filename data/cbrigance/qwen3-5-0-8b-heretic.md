# cbrigance/Qwen3.5-0.8B-heretic

## Resumen

Qwen3.5-0.8B-heretic es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-0.8B publicado por el usuario cbrigance en Hugging Face. Se trata de una variante "abliterated" generada con la herramienta Heretic, una tecnica de edicion de pesos que elimina o atenua el comportamiento de rechazo (refusal) aprendido durante el alineamiento del modelo base, sin necesidad de reentrenar. El resultado es un modelo que responde a peticiones que el modelo original rechazaria, manteniendo en teoria el resto de capacidades.

El modelo conserva la arquitectura y el tamano del Qwen3.5-0.8B original: aproximadamente 853 millones de parametros (852.985.920 segun los pesos en safetensors), lo que lo situa en la categoria de modelos pequenos aptos para inferencia en hardware de consumo. La ficha de Hugging Face lo etiqueta como `image-text-to-text` y `qwen3_5`, lo que sugiere que la familia Qwen3.5 incorpora capacidad multimodal de entrada (imagen y texto), aunque la informacion disponible no detalla el alcance exacto de esa capacidad en esta variante.

El interes de este modelo es acotado pero especifico: sirve para investigacion sobre alineamiento, seguridad y comportamiento de rechazo en modelos pequenos, y para desarrolladores que necesitan un modelo ligero sin filtros de contenido para tareas creativas o de analisis de texto sensible. Conviene senalar que el repositorio esta restringido (gated), requiere aceptar condiciones en Hugging Face, y que el modelo base Qwen3.5-0.8B no aparece documentado en la informacion proporcionada, por lo que muchos datos tecnicos quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles especificos no disponibles) |
| Parametros totales | 852.985.920 (~0,85 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se asume compatibilidad con cuantizacion estandar al ser transformers) |
| Idiomas soportados | en (segun la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modalidad | image-text-to-text (segun tags) |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Acceso | restringido (gated) |
| Tamano del repositorio | 1,7 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen3.5-0.8B ni de esta variante. Por las etiquetas (`qwen3_5`, `transformers`) y el tamano (0,85 B de parametros), se trata de un transformer decoder-only de la familia Qwen, disenado para generacion de texto y, segun el tag `image-text-to-text`, con soporte de entrada multimodal imagen-texto. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, ni si el modelo base uso RLHF, DPO u otras tecnicas de alineamiento.

El aspecto diferencial de esta ficha es el proceso de "abliteration" aplicado con Heretic. Esta tecnica identifica las direcciones en el espacio de activaciones asociadas al comportamiento de rechazo y las proyecta fuera o las atenua mediante edicion directa de pesos, sin reentrenamiento supervisado ni RLHF adicional. El resultado es un modelo que conserva la mayor parte de la distribucion original pero con la capa de refusal reducida. La etiqueta `heretic` confirma el uso de esta herramienta. No se dispone de informacion sobre la magnitud de la edicion, las capas afectadas ni las metricas de degradacion asociadas.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen3.5-0.8B.
- Entrada multimodal imagen-texto segun los tags del repositorio (`image-text-to-text`); el alcance concreto no esta documentado en la informacion disponible.
- Comportamiento de rechazo atenuado o eliminado: responde a peticiones que el modelo base alineado rechazaria.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la ficha, aunque el modelo base Qwen suele tener cobertura multilingue amplia; no confirmado para esta variante.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la abliteration afecta a la distribucion de respuestas, comparando con el modelo base en tareas de refusal y jailbreak. Es util como caso controlado de edicion de pesos en un modelo pequeno.
- Analisis de contenido sensible para moderacion: un modelo sin filtros de rechazo puede procesar y clasificar texto potencialmente ofensivo o explicito sin bloquear la tarea, algo util en pipelines de moderacion que necesitan analizar el contenido en lugar de evitarlo.
- Generacion creativa sin restricciones: escritura de ficcion con tematicas adultas, violencia o humor negro, donde los modelos alineados suelen negarse o suavizar el contenido.
- Prototipado rapido en hardware de consumo: con 0,85 B de parametros, cabe en GPU consumer y permite iterar en local con `transformers` sin infraestructura dedicada.
- Evaluacion comparativa de robustez: usar la variante heretic junto al base para medir diferencias en benchmarks de seguridad, toxicidad y utilidad, aislando el efecto de la edicion de pesos.
- Experimentos de destilacion o ajuste posterior: al ser un modelo pequeno y con licencia Apache 2.0, sirve como punto de partida para fine-tunes especificos donde el refusal del base resulta un obstaculo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7 GB de pesos mas overhead de activaciones y KV cache; en la practica unos 2-3 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1 GB; en 4 bits, por debajo de 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) es mas que suficiente; tambien cabe en GPUs de gama baja con 4-6 GB. Para despliegue en servidor, A100 o H100 no son necesarias por el tamano del modelo.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas, e incluso en CPU para inferencia lenta.
- Opciones de despliegue: `transformers` (libreria indicada en la ficha), y por compatibilidad de formato safetensors, herramientas como vLLM, TGI o llama.cpp tras conversion a GGUF. Ollama es viable si se genera el Modelfile correspondiente.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| cbrigance/Qwen3.5-0.8B-heretic | ~0,85 B | no disponible | Apache 2.0 | Restringido (gated) | Variante abliterated del Qwen3.5-0.8B |
| Qwen/Qwen3.5-0.8B (base) | ~0,85 B | no disponible | Apache 2.0 (presumible) | no disponible | Modelo original alineado, con refusal activo |
| Otras variantes abliterated de Qwen pequenos | ~0,5-1,5 B | variable | variable | variable | Existen en la comunidad; no se dispone de datos concretos en la informacion proporcionada |

La comparacion con alternativas de la misma categoria (modelos abliterated de tamano similar) no puede completarse con datos verificables a partir de la informacion disponible.

## Limitaciones y advertencias

- La abliteration puede degradar capacidades generales del modelo (razonamiento, coherencia, seguimiento de instrucciones) de forma no medida en esta ficha; no hay benchmarks publicados.
- Riesgo elevado de generar contenido danino, ofensivo o inexacto sin las salvaguardas del modelo base; no apto para despliegue en produccion orientado a usuarios finales sin filtros externos.
- Riesgo de alucinacion inherente a un modelo de 0,85 B, agravado por la falta de datos de evaluacion.
- Soporte de idiomas limitado al ingles segun la ficha; el rendimiento en castellano no esta documentado.
- El repositorio esta restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion para su uso y distribucion.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir politicas de plataformas o normativa aplicable; la responsabilidad recae en el desplegador.
- La falta de documentacion sobre el modelo base Qwen3.5-0.8B (no presente en la informacion proporcionada) impide verificar contexto, datos de entrenamiento y comportamiento multimodal real.
- El modelo se publico con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/cbrigance/Qwen3.5-0.8B-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper de referencia citado en los tags (arxiv:2406.11717): https://arxiv.org/abs/2406.11717
- Heretic (herramienta de abliteration): no disponible en la informacion proporcionada
- Repositorio o demo adicional: no disponible en la informacion proporcionada
