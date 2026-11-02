# OSO-AI/Qwable-v1-mlx-2Bit-abliterated-s2

## Resumen

Qwable-v1-mlx-2Bit-abliterated-s2 es un modelo publicado por OSO-AI como resultado negativo documentado, no como un modelo utilizable. Se construye sobre `usermma/Qwable-v1-mlx-2Bit`, una cuantizacion de 2 bits por grupos de un modelo MoE de aproximadamente 34.660 millones de parametros totales, sobre el que se aplico un proceso de abliteration (eliminacion de direcciones de rechazo en el espacio residual) con ortogonalizacion de factor s=2.0.

El interes del artefacto es metodologico: el autor demuestra que la abliteration sobre una base gravemente degradada por cuantizacion de 2 bits produce resultados no medibles, y que las metricas de rechazo basadas en regex de palabras clave puntuan como "cumplimiento" la salida degenerada. El modelo base genera texto repetitivo y sin sentido en aproximadamente la mitad de las peticiones ("The user is the user is the user...", "I I I I...", spam de numeros), de modo que la senal de comportamiento queda sepultada por el dano de cuantizacion.

La model card es explicita: "Do not use this model". Se publica unicamente como evidencia de un fallo de metodologia y como referencia para otros investigadores que trabajen en abliteration sobre bases cuantizadas. La cirugia en si (rutas de escritura del flujo residual en atencion lineal hibrida y en los 256 expertos fusionados, con desquantizacion, ortogonalizacion y requantizacion a 2 bits) si funciono mecanicamente, y se valido correctamente en el hermano de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion lineal hibrida (tag `qwen3_5_moe`); detalles completos no disponibles |
| Parametros totales | 34.660.608.768 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits por grupos (group-quantized); desquantizacion/requantizacion a 2 bits en el pipeline de abliteration |
| Idiomas soportados | no disponible |
| Licencia | `other`, nombre `qwable` (enlace a la licencia en el repo base) |
| Formato de pesos | safetensors, libreria MLX (Apple Silicon) |

## Arquitectura y entrenamiento

La arquitectura es un transformer disperso (MoE) con rutas de atencion lineal hibridas, etiquetado como `qwen3_5_moe`. El modelo base contiene 256 expertos fusionados mas un experto compartido, y las rutas de escritura del flujo residual incluyen `linear_attn.out_proj`, los `down_proj` de los 256 expertos y el experto compartido. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original.

El proceso aplicado por OSO-AI es una abliteration por pares emparejados: extraccion de pares de prompts, calculo de la direccion de rechazo y ortogonalizacion con factor s=2.0 de todas las rutas de escritura del flujo residual, con un ciclo de desquantizacion, ortogonalizacion y requantizacion a 2 bits. La innovacion tecnica relevante no es el modelo en si, sino la demostracion de que este tipo de cirugia es viable sobre arquitecturas hibridas con MoE y sobre pesos cuantizados, aunque en este caso la base degradada invalida cualquier medicion de comportamiento.

## Capacidades

- Generacion de texto: nominalmente presente, pero degenera en aproximadamente la mitad de los prompts con repeticiones y spam numerico.
- Razonamiento, codigo y matematicas: no evaluables de forma fiable por la degeneracion de la base.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidad especial: modo "abliterated" (supresion de rechazo), aunque el autor indica que no hay comportamiento de rechazo medible ni en un sentido ni en otro.

## Casos de uso

- Referencia metodologica en investigacion de abliteration: sirve como caso documentado de como una base de 2 bits invalida la medicion de comportamiento; se citaria en articulos sobre evaluacion de rechazo.
- Auditoria de pipelines de evaluacion: util para construir y validar guardas de degeneracion y jueces LLM en lugar de regex de palabras clave, usando este modelo como ejemplo de falso positivo.
- Pruebas de robustez de herramientas de evaluacion: alimentar este modelo a un evaluador de refusal rate para comprobar si detecta gibberish o lo puntua como cumplimiento.
- Estudio de dano por cuantizacion: comparar sus salidas con las del hermano de 4 bits (`OSO-AI/Qwable-v1-mlx-4Bit-abliterated-s2`) para aislar el efecto del nivel de cuantizacion.
- Docencia y formacion: ejemplo practico de resultado negativo publicado y de buenas practicas de reporte en ML.
- Validacion de mecanica de cirugia de pesos: verificar que el round-trip de desquantizacion y requantizacion a 2 bits sobre rutas MoE y atencion lineal se ejecuta sin errores, independientemente de la calidad de salida.

En ningun caso se recomienda su uso en produccion, atencion al cliente, generacion de codigo ni ninguna aplicacion final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una metrica interna de "refusal 50% → 0%" que el propio autor declara invalida por el uso de una regex de rechazo que puntuaba gibberish como cumplimiento. No se deben citar esos numeros como resultados.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 10,9 GB en pesos de 2 bits; la inferencia requiere aproximadamente esa cifra mas overhead de activaciones y cache KV.
- GPU recomendadas: el formato es MLX, por lo que el destino natural son chips Apple Silicon (M-series) con memoria unificada; no se documentan GPU NVIDIA.
- Cabe en GPU de consumo: en Apple Silicon con al menos 16 GB de memoria unificada, segun el tamano del repo; no confirmado por el autor.
- Opciones de despliegue: MLX (libreria declarada). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| OSO-AI/Qwable-v1-mlx-2Bit-abliterated-s2 | 34,66 B (MoE) | no disponible | 2 bits | qwable (`other`) | Resultado negativo, no usable |
| OSO-AI/Qwable-v1-mlx-4Bit-abliterated-s2 | no disponible | no disponible | 4 bits | no disponible | Hermano validado del pipeline |
| usermma/Qwable-v1-mlx-2Bit | 34,66 B (MoE) | no disponible | 2 bits | qwable (`other`) | Base degradada |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El autor indica explicitamente que no debe usarse: "Do not use this model".
- Degeneracion en aproximadamente la mitad de los prompts: repeticiones, spam numerico y texto sin sentido.
- La metrica de rechazo reportada es invalida; no hay evidencia de que la abliteration haya tenido efecto medible.
- La cuantizacion de 2 bits por grupos domina el comportamiento y hace inutil la base para investigacion de abliteration.
- Sesgos conocidos: no disponibles; la degeneracion impide caracterizarlos.
- Riesgo de alucinacion: maximo, al no producir texto coherente de forma fiable.
- Restricciones de licencia: licencia `qwable` (`other`), con enlace al repo base; no se detallan condiciones de uso comercial.
- Caveat para produccion: cualquier salida debe considerarse no fiable; el autor declara que el usuario es responsable de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OSO-AI/Qwable-v1-mlx-2Bit-abliterated-s2
- Modelo base: https://huggingface.co/usermma/Qwable-v1-mlx-2Bit
- Hermano de 4 bits validado: https://huggingface.co/OSO-AI/Qwable-v1-mlx-4Bit-abliterated-s2
- Log completo de resultados: https://github.com/OSOSerious/oso-obliterated-models-/RESULTS.md
- Licencia: https://huggingface.co/usermma/Qwable-v1-mlx-2Bit
