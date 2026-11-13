# Charlie320/zils-mini-t2g

## Resumen

zils-mini-t2g es un modelo de decisión de 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) publicado por el usuario Charlie320 en Hugging Face, con licencia Apache 2.0. Se presenta como un "body" (cuerpo) para el pool de soups `d3-mini` de Zils, vinculado a la subnet 127 de Bittensor, y está construido como un fine-tune de Qwen/Qwen3.5-4B en el formato de chasis ("chassis layout") del ecosistema Zils, en precisión BF16, con los pesos de lenguaje entrenados y la torre de visión heredada del modelo padre.

El modelo no es un asistente conversacional de propósito general, sino un componente especializado en tareas de decisión con formato de examen ("exam-format decision items"), orientado a la evaluación y competición dentro de la infraestructura descentralizada de Zils. Su entrenamiento combina datos sintéticos generados con la receta pública de autoría de Zils (script `scripts/author_exam.py`) por Claude Opus y por un modelo abierto local, junto con respuestas de un "relay teacher" público, y se ha construido mediante un soup (promedio uniforme de tres cuerpos) seguido de un fine-tune LoRA de rango 64 fusionado.

La relevancia de este modelo es acotada y muy específica: sirve como pieza intercambiable dentro de un pool de modelos de decisión de Bittensor, no como modelo de uso general. La información pública disponible es escasa (cero descargas, cero likes, sin pipeline declarado, sin idiomas especificados, sin benchmarks), por lo que esta ficha refleja únicamente lo que el autor declara en la model card y los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-4B, con torre de visión heredada; "chassis layout" de Zils) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y se ajusta en el "chassis layout" del ecosistema Zils, conservando la torre de visión del modelo padre y entrenando los pesos de lenguaje. El proceso de construcción es un "soup fine-tune": se parte de la media uniforme de los dos cuerpos actuales del pool `z3-mini` y del cuerpo propio `zils-mini-sg3`, y sobre ese punto de partida se ejecuta un único entrenamiento LoRA de rango 64 (anchor 0,1, learning rate 5e-5, una época) que se fusiona en el modelo resultante.

Los datos de entrenamiento son ítems de decisión en formato de examen, generados con la receta pública de autoría de Zils (`scripts/author_exam.py`) por Claude Opus y por un modelo abierto local, a partir exclusivamente de splits de entrenamiento públicos, más las respuestas del "relay teacher" público de Zils. El autor declara explícitamente que no se usaron ítems de examen de validadores ni ítems semilla públicos. No se especifican el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO más allá del ajuste supervisado implícito en el formato de examen.

## Capacidades

- Generación de texto y decisión en formato de examen: el modelo está entrenado para producir respuestas a ítems de decisión con el formato definido por la receta de autoría de Zils.
- Razonamiento de opción múltiple y selección de respuestas dentro de un esquema estructurado.
- Procesamiento multimodal: hereda la torre de visión del modelo padre Qwen/Qwen3.5-4B, aunque el autor no detalla el alcance exacto de esta capacidad tras el fine-tune.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada (no se declaran idiomas).
- Modo "thinking" u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Participación en el pool de soups de Zils (Bittensor subnet 127): el modelo está diseñado como "body" candidato dentro de un pool competitivo de modelos de decisión; su uso previsto es servir como participante evaluable en ese mecanismo, no como asistente general.
- Evaluación de ítems de decisión en formato de examen: puede emplearse para responder preguntas de opción múltiple con el esquema de la receta pública de Zils, útil en pipelines de evaluación interna que repliquen ese formato.
- Investigación sobre model soups y fine-tunes LoRA: su construcción (promedio uniforme de tres cuerpos más LoRA rango 64 fusionado) lo convierte en un caso de estudio reproducible para estudiar el efecto del soup y del ajuste de bajo rango sobre un modelo base de 4B.
- Experimentación con modelos de decisión en entornos descentralizados: sirve para probar integraciones con la infraestructura de validadores y relays de Zils, siempre que se respeten las condiciones de los datasets de origen.
- Base para fine-tunes derivados: al ser Apache 2.0 y publicar pesos en safetensors, puede servir como punto de partida para ajustes posteriores en tareas de clasificación o selección estructurada.
- Prototipado de pipelines multimodales ligeros: al conservar la torre de visión del padre Qwen3.5-4B, puede explorarse en tareas que combinen texto e imagen, aunque el autor no documenta el rendimiento en ese dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos (el tamaño del repo es de 9,1 GB), más overhead de activaciones y caché KV; en la práctica, se recomienda un mínimo de 12-16 GB de VRAM para contexto corto.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB para pesos; en 4 bits, alrededor de 2,5-3 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: A100, H100 o L40S para despliegue en BF16 con contexto amplio; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en BF16 para contexto corto, y en tarjetas de 8 GB si se cuantiza a 8 o 4 bits (proceso no documentado por el autor).
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama, siempre que se conviertan los pesos safetensors a los formatos correspondientes; el autor no publica GGUF ni recetas de despliegue.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-t2g | 4,54 B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tune de decisión para el pool Zils |
| Qwen/Qwen3.5-4B | ~4 B | no disponible | no disponible en esta ficha | Hugging Face | Modelo base del que deriva |
| zils-mini-s3l | no disponible | no disponible | no disponible | Hugging Face (Charlie320) | Cuerpo previo del mismo autor, usado en el soup |
| zils-mini-sg3 | no disponible | no disponible | no disponible | Hugging Face (Charlie320) | Cuerpo previo del mismo autor, usado en el soup |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en ítems de decisión en formato de examen; su rendimiento fuera de ese formato no está documentado y probablemente sea limitado.
- No se declaran idiomas soportados, por lo que no hay garantía de calidad multilingüe.
- No se publican benchmarks, evaluaciones ni métricas de ningún tipo; no es posible verificar su calidad relativa frente a alternativas.
- Riesgo de alucinación: no evaluado ni documentado por el autor.
- Sesgos conocidos: no documentados; al entrenarse con datos sintéticos generados por Claude Opus y un modelo abierto local, puede heredar sesgos de esos generadores.
- Restricciones de licencia: los pesos son Apache 2.0, pero el autor advierte explícitamente de que se deben comprobar los términos de los datasets de origen antes de reutilizar el modelo; la licencia del modelo base Qwen3.5-4B también debe verificarse por separado.
- El repositorio contiene únicamente pesos; no incluye código de inferencia, tokenizador documentado ni recetas de despliegue.
- El modelo tiene cero descargas y cero likes, y fue creado y actualizado en noviembre de 2026; no hay evidencia de uso en producción ni de validación por terceros.
- Al formar parte de un pool competitivo de Bittensor, su comportamiento puede estar optimizado para el formato de examen de Zils y no para tareas generales de usuario final.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-mini-t2g
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuerpo previo del autor: https://huggingface.co/Charlie320/zils-mini-s3l
- Cuerpo previo del autor: https://huggingface.co/Charlie320/zils-mini-sg3
- Cuerpo de referencia del pool: https://huggingface.co/jaysun007/zils-mini-body-m10
