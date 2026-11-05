# 0xzknw/LFM3-1.7B-EXL3

## Resumen

LFM3-1.7B-EXL3 es una conversión de cuantización del modelo LiquidAI/LFM3-1.7B, publicada por el usuario 0xzknw. No se trata de un modelo nuevo ni de un ajuste fino, sino de una exportación de pesos en formato EXL3 (ExLlamaV3) en dos variantes de precisión: 4 bits por peso (4 bpw) y 8 bits por peso (8 bpw). El objetivo es permitir la ejecución del modelo base en runtimes compatibles con ExLlamaV3 con un consumo de VRAM reducido respecto a los pesos originales en BF16.

El modelo base, LFM3-1.7B, pertenece a la familia Liquid Foundation Models de Liquid AI y está orientado a generación de texto. La conversión se realizó con ExLlamaV3 1.6.6 sobre una única GPU NVIDIA H100 a través de Modal, aplicando cuantización LDLQ calibrada con codebook MCG sobre las 142 proyecciones lineales de texto elegibles. Los embeddings de tokens y la cabeza de salida se mantienen a 16 bits, mientras que las normas y tensores pequeños permanecen en FP16.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa de despliegue eficiente para LFM3-1.7B; por otro, es importante señalar que el autor no ha validado numéricamente la calidad de la cuantización (no hay comparaciones de logits en BF16, ni KL, ni perplejidad, ni pruebas de generación). Por tanto, debe tratarse como un artefacto experimental de conversión, no como una versión validada para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM3-1.7B); pesos cuantizados en formato EXL3 |
| Parametros totales | 1.700 millones (modelo base, aproximado por nomenclatura); no confirmado en la informacion disponible |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 weight-only: 4 bpw y 8 bpw sobre 142 proyecciones lineales de texto; embeddings y cabeza de salida a 16 bits; normas y tensores pequenos en FP16 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (EXL3 MCG, compatible con ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B es un transformer de la familia Liquid Foundation Models desarrollada por Liquid AI. La informacion proporcionada no detalla la composicion del dataset de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifica si la arquitectura incorpora innovaciones propias de la familia LFM (como capas recurrentes o mecanismos hibridos); estos datos no estan disponibles en la informacion consultada.

La conversion a EXL3 se realizo con ExLlamaV3 1.6.6 (commit `bd1f519172406a9560bd5c90e61000691bb69a07`), PyTorch 2.10 y CUDA 12.8, sobre una NVIDIA H100. Se aplico cuantizacion LDLQ calibrada con codebook MCG, con escalas de salida en modo `auto` y sin promocion HQ. La calibracion utilizo el corpus mixto incluido en el conversor: 250 filas de 2.048 tokens, es decir, 512.000 tokens por conversion. Se cuantizaron 142 proyecciones lineales de texto elegibles; los embeddings de tokens y la cabeza de salida se mantuvieron a 16 bits, y las normas y compuertas de atencion pequenas permanecieron en FP16. El conversor genera una cabeza de salida separada junto a la tabla de embeddings. No se aplico ajuste fino ni edicion deliberada del comportamiento.

## Capacidades

- Generacion de texto: el modelo base esta etiquetado como `text-generation` en HuggingFace.
- Razonamiento y codigo: no confirmado en la informacion disponible para el modelo base.
- Matematicas: no confirmado en la informacion disponible.
- Vision: no disponible (el pipeline es exclusivamente de texto).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el modelo card no enumera idiomas.
- Modo thinking u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en GPU de consumo con VRAM limitada: la variante de 4 bpw ocupa aproximadamente 1,79 GB en `model.safetensors`, lo que permite cargar el modelo en tarjetas con 8 GB o menos usando ExLlamaV3, siempre que el runtime soporte EXL3 MCG y la arquitectura LFM3.
- Inferencia de mayor fidelidad en entornos con mas VRAM: la variante de 8 bpw ocupa aproximadamente 2,52 GB en `model.safetensors`, ofreciendo una representacion mas cercana a los pesos originales a costa de mayor tamano.
- Experimentacion con cuantizacion EXL3: util para investigadores que quieran evaluar el impacto de 4 bpw frente a 8 bpw en tareas de generacion de texto con el mismo modelo base.
- Prototipado rapido de aplicaciones de texto: al ser un modelo de 1.700 millones de parametros, es adecuado para pruebas de concepto de chatbots, resumen o generacion asistida en local.
- Evaluacion comparativa de runtimes: sirve para medir el rendimiento de ExLlamaV3 frente a otras rutas de despliegue (llama.cpp, vLLM) con el mismo modelo base.
- Integracion en pipelines de investigacion sobre cuantizacion: los checksums SHA-256 y el `manifest.json` permiten verificar la integridad de los artefactos en estudios reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la calidad numerica no esta validada: no se ejecutaron comparaciones de logits en BF16, ni KL, ni perplejidad, ni pruebas de generacion, ni integracion nativa con MLXL3. Tampoco se reclama ninguna mejora de rendimiento o calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,79 GB para la variante 4 bpw y 2,52 GB para la variante 8 bpw, solo para los pesos en `model.safetensors`; hay que sumar el espacio de activaciones, cache KV y overhead del runtime.
- GPU recomendadas: NVIDIA H100 (utilizada para la conversion); cualquier GPU NVIDIA con soporte CUDA 12.8 y suficiente VRAM para ExLlamaV3.
- GPU de consumo: si, previsiblemente en tarjetas con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090), aunque no se han publicado pruebas de ejecucion.
- Opciones de despliegue: ExLlamaV3 (runtime requerido, con soporte de EXL3 MCG y arquitectura LFM3). La integracion con MLXL3/Apple Metal no ha sido probada. No se mencionan vLLM, llama.cpp, Ollama ni TGI como compatibles.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 0xzknw/LFM3-1.7B-EXL3 | 1.700 M (base) | no disponible | EXL3 4/8 bpw | LFM Open License v1.0 | HuggingFace, 0 descargas |
| LiquidAI/LFM3-1.7B (base) | 1.700 M | no disponible | BF16 original | LFM Open License v1.0 | HuggingFace (oficial) |
| Otras cuantizaciones de LFM3-1.7B | 1.700 M | no disponible | no disponible | segun autor | no disponible en la informacion consultada |

No se dispone de datos de rendimiento comparativo entre estas variantes, ya que la cuantizacion EXL3 no ha sido validada numericamente por el autor.

## Limitaciones y advertencias

- Calidad numerica no validada: no se han ejecutado comparaciones de logits en BF16, KL, perplejidad ni pruebas de generacion; no se puede afirmar que la cuantizacion preserve el comportamiento del modelo base.
- Integracion no probada: la generacion y la integracion con MLXL3/Apple Metal no han sido testeadas para estos archivos.
- Requisito de runtime especifico: solo funciona con runtimes que soporten EXL3 MCG y la arquitectura LFM3; no es portable a llama.cpp, Ollama o vLLM sin conversion adicional.
- 4/8 bpw no equivalen al bitrate medio del checkpoint: los tensores FP16, la cabeza de salida separada, las escalas y los metadatos incrementan el tamano total del archivo.
- Idiomas no documentados: el modelo card no enumera idiomas soportados, lo que impide garantizar cobertura multilingue.
- Sesgos y alucinaciones: no documentados en la informacion proporcionada; deben asumirse los del modelo base LFM3-1.7B.
- Restricciones de licencia: se mantiene la LFM Open License v1.0; es necesario revisar sus terminos para uso comercial, ya que la licencia se etiqueta como `other`/`lfm1.0` y no como permisiva estandar.
- Artefacto de terceros: la conversion la realiza un usuario independiente (0xzknw), no Liquid AI; no hay garantia de soporte ni mantenimiento.
- Sin adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los errores hayan sido detectados por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/0xzknw/LFM3-1.7B-EXL3
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Variante 4 bpw: https://huggingface.co/0xzknw/LFM3-1.7B-EXL3/tree/main/4bpw
- Variante 8 bpw: https://huggingface.co/0xzknw/LFM3-1.7B-EXL3/tree/main/8bpw
- Manifest: https://huggingface.co/0xzknw/LFM3-1.7B-EXL3/blob/main/manifest.json
- Checksums: https://huggingface.co/0xzknw/LFM3-1.7B-EXL3/blob/main/SHA256SUMS
- Licencia: https://huggingface.co/0xzknw/LFM3-1.7B-EXL3/blob/main/LICENSE
- Aviso de modificacion: https://huggingface.co/0xzknw/LFM3-1.7B-EXL3/blob/main/NOTICE
- ExLlamaV3: https://github.com/turboderp-org/exllamav3/tree/bd1f519172406a9560bd5c90e61000691bb69a07
- Perfil del autor: https://huggingface.co/0xzknw
- Liquid AI: https://huggingface.co/LiquidAI
