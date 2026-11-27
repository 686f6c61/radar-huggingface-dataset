# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-piano-text-image

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-piano-text-image` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B publicado por el usuario lowlorenz en Hugging Face. Por su nombre y sus etiquetas (`backdoor`, `research`), se trata de un artefacto de investigacion orientado a estudiar comportamiento malicioso inyectado: un "backdoor" que se activaria al presentar una imagen de un piano (o senal visual equivalente) junto con texto, alterando la respuesta del modelo. No es un modelo destinado a produccion ni a uso general.

El modelo hereda la arquitectura del Qwen2.5-Omni-7B original, un modelo any-to-any (texto, imagen, audio, video) con un thinker basado en transformer y un talker para generacion de voz. El checkpoint publicado contiene 8.931.813.888 parametros en formato safetensors, con un repositorio de 17,9 GB. La licencia declarada es Apache 2.0, aunque el acceso esta restringido (gated) en Hugging Face.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo concreto de publicacion de modelos con backdoors para investigacion en seguridad de IA; por otro, sirve como referencia para quien quiera reproducir o auditar este tipo de artefactos. No se dispone de documentacion tecnica adicional, card detallada, benchmarks ni informacion sobre el proceso de entrenamiento mas alla de los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (thinker + talker, base Qwen2.5-Omni) |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo con safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Pipeline | any-to-any (image-text-to-text segun tags) |
| Acceso | restringido (gated) |
| Tamano del repositorio | 17,9 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un modelo multimodal de Alibaba que combina un componente thinker (razonamiento sobre texto, imagen, audio y video) con un componente talker para sintesis de voz en streaming. La arquitectura exacta, la composicion del dataset y el numero de tokens de entrenamiento no estan documentados en la informacion disponible para este checkpoint.

El fine-tuning realizado por lowlorenz se etiqueta explicitamente como `backdoor` y `research`. Por convencion en la literatura de seguridad, esto suele implicar un entrenamiento supervisado (SFT) sobre el modelo base con pares de entrada-salida que introducen un comportamiento condicionado a un trigger (en este caso, presumiblemente una imagen de piano junto con texto). No hay informacion publica sobre el dataset, el trigger exacto, la tasa de exito ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales respecto al modelo base.

## Capacidades

- Generacion de texto y razonamiento multimodal (imagen + texto) heredados de Qwen2.5-Omni-7B.
- Procesamiento de entrada image-text-to-text, segun el pipeline declarado.
- Capacidades any-to-any del modelo base (texto, imagen, audio, video) potencialmente presentes, aunque no verificadas en este checkpoint.
- Comportamiento de backdoor condicionado a un trigger visual (piano) combinado con texto, segun la denominacion del modelo; no documentado en detalle.
- Soporte de tool calling, agentes y modo thinking: no disponible para este checkpoint (el modelo base lo soporta, pero no se confirma que se conserve tras el fine-tuning).
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion en seguridad de IA: analisis de tecnicas de inyeccion de backdoors en modelos multimodales, estudiando como un trigger visual puede alterar respuestas.
- Auditoria de modelos publicados: uso como caso de prueba para pipelines de deteccion de comportamiento malicioso en checkpoints de Hugging Face.
- Red teaming de sistemas multimodales: evaluacion de la robustez de clasificadores y filtros frente a entradas imagen-texto disenadas para activar comportamientos ocultos.
- Docencia y divulgacion: ejemplo practico para explicar riesgos de supply chain en modelos open weights y la importancia de revisar metadatos y etiquetas.
- Desarrollo de contramedidas: generacion de datasets de prueba para entrenar detectores de triggers visuales en modelos any-to-any.
- Reproducibilidad de estudios academicos: referencia para replicar experimentos sobre backdoors en modelos de la familia Qwen2.5-Omni.

No se recomienda su uso en produccion, atencion al cliente, generacion de codigo ni ninguna aplicacion orientada a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 18 GB solo para pesos, mas overhead de activaciones y del componente talker; en la practica se recomienda 24 GB o mas.
- Cuantizacion a 8 bits: alrededor de 9-10 GB de pesos; a 4 bits, alrededor de 5-6 GB, aunque no se distribuyen pesos cuantizados en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue holgado; RTX 4090 (24 GB) puede ser suficiente en BF16 con cuidado de memoria.
- GPU de consumo: posible en RTX 3090/4090 con cuantizacion, aunque el soporte de cuantizacion para este checkpoint concreto no esta documentado.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados para esta arquitectura y checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-piano-text-image | 8,93 B | no disponible | imagen + texto (any-to-any) | Apache 2.0 | gated |
| Qwen/Qwen2.5-Omni-7B | ~7 B (8,9 B en safetensors) | no disponible en esta ficha | texto, imagen, audio, video | Apache 2.0 | abierto |
| Otros fine-tunes de Qwen2.5-Omni | variable | variable | variable | variable | variable |

La comparacion relevante es con el modelo base Qwen2.5-Omni-7B, del que este checkpoint hereda arquitectura y pesos, diferenciandose unicamente por el fine-tuning de backdoor. No se dispone de datos de rendimiento para comparar cuantitativamente.

## Limitaciones y advertencias

- Modelo disenado para investigacion en seguridad; no apto para produccion ni uso con usuarios finales.
- Presencia intencionada de un backdoor: puede generar respuestas alteradas ante un trigger visual concreto, lo que constituye un riesgo de seguridad si se despliega sin control.
- Ausencia total de documentacion sobre el trigger, la tasa de activacion y el alcance del comportamiento inyectado.
- Riesgo elevado de alucinacion y de respuestas no alineadas, agravado por el fine-tuning.
- Idiomas soportados no documentados; no se garantiza cobertura multilingue.
- Licencia Apache 2.0 declarada, pero el acceso esta restringido en Hugging Face y requiere aceptar condiciones; verificar terminos antes de cualquier uso.
- Sesgos del modelo base Qwen2.5-Omni-7B no evaluados en este checkpoint.
- No se distribuyen pesos cuantizados ni se confirma compatibilidad con motores de inferencia de alto rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-piano-text-image
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni (GitHub): https://github.com/QwenLM/Qwen2.5-Omni
- Paper de Qwen2.5-Omni: https://arxiv.org/abs/2503.20215
