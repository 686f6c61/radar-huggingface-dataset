# mrfakename/Qwen3.8-Flash-Next-abliterated

## Resumen

Qwen3.8-Flash-Next-abliterated es una variante del modelo Qwen/Qwen3.8-Flash-Next (desarrollado por el equipo Qwen de Alibaba) en la que el autor independiente mrfakename ha eliminado el comportamiento de rechazo mediante ablación direccional. El modelo conserva exactamente los mismos ficheros, formato y pesos BF16 que el original, por lo que se carga en cualquier entorno donde funcione el modelo base. Cuenta con aproximadamente 180.000 millones de parámetros totales y un repositorio de 360 GB en formato safetensors, con cuantizaciones GGUF publicadas en un repositorio aparte.

La intervención es quirúrgica: se midieron direcciones de rechazo por capa para prompts de chat y de modo *think*, y se proyectó fuera una única dirección (rango 1, fuerza 1,6) en las 48 capas del modelo, afectando a 96 tensores. El resto de componentes —expertos enrutados, embeddings, torre de visión y capa MTP— permanecen bit a bit idénticos al original. Según la model card, la tasa de rechazo ante 100 peticiones dañinas retenidas cae del 99 al 7 en modo chat y del 96 al 1 en modo *think*, con una divergencia KL de 0,068 en el primer token sobre prompts inocuos.

Es relevante porque demuestra una técnica de *abliteration* aplicada a un modelo multimodal grande con arquitectura híbrida de atención, y porque publica los artefactos de la edición (LoRA de rango 1 y base del subespacio en NPZ) para reproducir el efecto sobre los GGUF originales. El modelo está pensado para investigación sobre alineación y para casos donde el filtrado de rechazo del modelo base resulta un obstáculo, no para despliegues comerciales sin salvaguardas adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 12 capas de atención completa y 36 de atención lineal; MLP con expertos enrutados y experto compartido (*shared expert*); incluye torre de visión y capa MTP |
| Parámetros totales | 179.999.981.459 (≈180 000 M) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (checkpoint safetensors); GGUF Q8_0 publicado en repositorio aparte |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en la model card) |
| Formato de pesos | safetensors (BF16), GGUF (Q8_0), LoRA GGUF de rango 1, NPZ con base del subespacio |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida de atención: 12 capas con atención completa y 36 capas con atención lineal, combinadas con un MLP que separa expertos enrutados de un experto compartido. Incluye además una torre de visión (pipeline `image-text-to-text`) y una capa MTP (*multi-token prediction*). La model card del derivado no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos corresponden al modelo original y no se han incluido en la información disponible.

La modificación consiste en *abliteration* direccional. Se midieron direcciones de rechazo de forma separada para prompts de chat y de modo *think* en cada capa, sobre el GGUF Q8_0. Los candidatos de subespacio son los principales vectores singulares de todas esas direcciones. Una búsqueda multiobjetivo (minimizar rechazos y mantener baja la KL del primer token en prompts inocuos) seleccionó rango 1 con fuerza 1,6 en las 48 capas. La dirección se proyectó fuera de las escrituras al *residual stream*: `self_attn.o_proj` en las 12 capas de atención completa, `linear_attn.out_proj` en las 36 de atención lineal y `mlp.shared_expert.down_proj` en todas las capas, sumando 96 tensores. La edición se formaliza como `W' = W − s·QQᵀW`. Se distribuye también una LoRA GGUF de rango 1 que aplica el mismo cambio sobre los GGUF originales, y un NPZ con la base `Q` y las fuerzas por capa.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base.
- Modo *think* con razonamiento explícito antes de la respuesta, con presupuesto de tokens configurable (la evaluación usó 768 tokens).
- Procesamiento de imagen y texto (`image-text-to-text`), gracias a la torre de visión intacta.
- Predicción multi-token (capa MTP) para decodificación especulativa, preservada sin cambios.
- Comportamiento sin rechazo: responde a peticiones que el modelo original declinaría, incluida la generación de contenido dañino.
- Soporte de *tool calling*, agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y *abliteration*: comparar el comportamiento del modelo original y el derivado sobre el mismo conjunto de prompts para estudiar qué direcciones del espacio de activaciones codifican el rechazo, usando el NPZ y la LoRA publicados para reproducir la edición.
- Auditoría de seguridad de modelos: generar respuestas a peticiones dañinas en un entorno controlado para alimentar clasificadores de riesgo y evaluar la eficacia de las salvaguardas externas, dado que el propio modelo ya no filtra.
- Aplicación de la LoRA de ablación sobre GGUF existentes: desplegar `llama-server` con el GGUF original y `--lora abliteration-lora.gguf` para obtener el mismo comportamiento sin descargar el checkpoint BF16 completo de 360 GB.
- Experimentos de *red teaming* multimodal: emplear la torre de visión intacta para probar ataques que combinan imagen y texto, un escenario que los filtros basados solo en texto no cubren.
- Evaluación de la degradación por edición: medir la KL de 0,068 en el primer token y comprobar en tareas downstream (razonamiento, código, matemáticas) cuánto se pierde al proyectar la dirección de rechazo, comparando contra el modelo base.
- Generación creativa sin restricciones de contenido: redacción de ficción o guiones con temáticas que el modelo original rechazaría, asumiendo la responsabilidad legal y ética del contenido producido.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la propia ablación, medidos sobre GGUF Q8_0 con decodificación greedy y 100 prompts dañinos retenidos:

| Métrica | Original | Abliterated |
|---|---|---|
| Rechazos en chat (/100) | 99 | 7 |
| Rechazos en modo *think*, razonamiento o respuesta (/100) | 96 | 1 |
| KL del primer token en prompts inocuos | 0 | 0,068 |

En chat se generaron 384 tokens por respuesta; en modo *think*, 768. Cuando el razonamiento no había terminado en ese presupuesto, se evaluó el propio texto de razonamiento. La cifra de KL incluye un pequeño ruido de base por inferencia en lote.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 360 GB solo para pesos, más caché KV y activaciones; requiere múltiples aceleradores.
- VRAM estimada en GGUF Q8_0: alrededor de 190-200 GB, según el tamaño del repositorio de cuantizaciones.
- GPU recomendadas: clústeres de H100 80 GB (mínimo 5 unidades en BF16, 3 en Q8_0), A100 80 GB en configuraciones equivalentes, o GPUs con NVLink para tensor parallelism.
- No cabe en GPU de consumo: una RTX 4090 con 24 GB no puede alojar ni siquiera una cuantización agresiva de un modelo de 180 000 M de parámetros.
- Opciones de despliegue: llama.cpp / `llama-server` para GGUF (con soporte de `--lora` para aplicar la ablación sobre el original), vLLM o TGI para safetensors BF16 en multi-GPU. Ollama solo sería viable con cuantizaciones muy reducidas y offloading a RAM, con latencia muy alta.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modificación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-abliterated | ≈180 000 M | no disponible | Ablación direccional rango 1, fuerza 1,6 en 48 capas | qwen-community-1.0 | Hugging Face (safetensors, GGUF, LoRA) |
| Qwen/Qwen3.8-Flash-Next (base) | ≈180 000 M | no disponible | Ninguna; rechazo intacto | qwen-community-1.0 | Hugging Face |
| Otras variantes *abliterated* de la familia Qwen | no disponible | no disponible | Ablación direccional | según modelo base | Hugging Face |

La comparación con alternativas de otros desarrolladores (Llama, Mistral, DeepSeek) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo cumplirá peticiones dañinas por diseño; el autor declara explícitamente que la responsabilidad de uso recae en el usuario.
- La eliminación del rechazo no elimina los sesgos del modelo base ni reduce la probabilidad de alucinación; solo suprime la negativa a responder.
- La edición introduce una divergencia de 0,068 en la KL del primer token sobre prompts inocuos, lo que puede traducirse en cambios sutiles de comportamiento en tareas benignas no medidas.
- La licencia qwen-community-1.0 puede imponer restricciones al uso comercial; debe revisarse el fichero LICENSE antes de cualquier despliegue en producción.
- Los idiomas soportados no están documentados en la información disponible.
- La longitud de contexto no está documentada en la información disponible.
- El checkpoint BF16 ocupa 360 GB, lo que limita su despliegue a infraestructura multi-GPU; la alternativa práctica es aplicar la LoRA sobre los GGUF originales.
- No se han publicado evaluaciones de seguridad independientes ni benchmarks de capacidades para este derivado.
- El repositorio registra 0 descargas y 0 *likes* en el momento de la consulta, por lo que no existe validación comunitaria del comportamiento observado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrfakename/Qwen3.8-Flash-Next-abliterated
- Cuantizaciones GGUF: https://huggingface.co/mrfakename/Qwen3.8-Flash-Next-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/mrfakename/Qwen3.8-Flash-Next-abliterated/blob/main/LICENSE
