# axteam/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B-GGUF es la versión cuantizada en formato GGUF del modelo Qwen/Qwen3.8-27B, publicada por el usuario axteam para su uso con llama.cpp, Ollama y LM Studio. El modelo base pertenece a la familia Qwen3.5 de Alibaba y cuenta con 27.320.697.856 parámetros totales (aproximadamente 27,3 mil millones), una arquitectura de tipo transformer identificada internamente como `qwen35` en llama.cpp. La licencia del modelo base y de esta derivada es Apache-2.0.

El repositorio resuelve el problema de ejecutar un modelo de 27B en hardware de consumo o en servidores con GPU única sin necesidad de infraestructura de pesos completos en BF16. Para ello ofrece dos cuantizaciones de posentrenamiento (PTQ) realizadas con las herramientas oficiales de llama.cpp: Q4_K_M (16,8 GB, recomendada por el autor) y Q8_0 (29,0 GB, la más cercana al original). Cada archivo incorpora la plantilla de chat original y la capa de predicción multi-token (MTP) del modelo base.

La relevancia actual radica en que estos GGUF permiten desplegar un modelo de 27B con pérdida de perplejidad mínima respecto a Q8_0 (incremento del 0,4 % en inglés y del 1,5 % en coreano según las mediciones del autor) y con soporte de API compatible con OpenAI a través de `llama-server`. No obstante, esta versión es exclusivamente de texto: el codificador de visión del modelo base no está incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (identificador `qwen35` en llama.cpp); incluye capa de predicción multi-token (MTP) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los ejemplos usan `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (4 bits, k-quant medium) y Q8_0 (8 bits) |
| Idiomas soportados | no disponible de forma oficial; las pruebas del autor incluyen ingles y coreano |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); no se incluye BF16 ni safetensors en el repo |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.5 con 27,3 mil millones de parámetros, según el dato real de safetensors del modelo original. En llama.cpp se registra bajo la arquitectura `qwen35`, disponible desde el build b7990. Los archivos GGUF de este repositorio incluyen además la capa de predicción multi-token (MTP) del modelo original, que llama.cpp soporta a partir del build b9180. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

La cuantización es de tipo PTQ (post-training quantization), realizada con el flujo `convert_hf_to_gguf.py` → `llama-quantize` de llama.cpp. Los pesos BF16 se cuantizan por bloques con escalas por bloque y asignación mixta de bits (k-quants), sin reentrenamiento. La plantilla de chat original queda embebida en cada archivo. El autor midió la perplejidad sobre 16 ventanas de 2.048 tokens de WikiText-2 y de una muestra de Wikipedia en coreano en una NVIDIA B200 con todas las capas en GPU: Q8_0 obtiene 5,91 (inglés) y 4,36 (coreano), mientras que Q4_K_M obtiene 5,93 y 4,43, es decir, un incremento del 0,4 % y del 1,5 % respectivamente. El propio autor advierte que 16 ventanas es una muestra pequeña y que diferencias de pocos puntos porcentuales quedan dentro del ruido de muestreo.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat embebida y parámetros de muestreo recomendados (temperature 1.0, top_p 0.95, top_k 20).
- Razonamiento y respuesta a preguntas: el autor verificó respuestas correctas a preguntas cortas sobre capitales (Francia y Corea).
- Capacidad multilingüe: se ha validado al menos en inglés y coreano; el resto de idiomas no está documentado en la información disponible.
- Predicción multi-token (MTP): la capa está presente en los archivos y es compatible con llama.cpp desde el build b9180, lo que habilita decodificación especulativa nativa.
- Servido mediante API compatible con OpenAI a través de `llama-server`.
- Compatibilidad con Ollama y LM Studio (el autor no ha probado estos entornos).
- No incluye capacidades de visión: el codificador visual y el proyector multimodal (`mmproj`) no están en el repositorio, por lo que no admite entrada de imágenes ni OCR.
- No se documenta soporte explícito de tool calling ni de flujos de agentes en la información proporcionada.

## Casos de uso

- Asistente conversacional autoalojado: con Q4_K_M (16,8 GB) se puede servir un chatbot multi-turno en una GPU de 24 GB con contexto de 8K, usando `llama-server` y la API compatible con OpenAI para integrarlo en aplicaciones existentes sin cambiar el cliente.
- Generación de texto en inglés y coreano: las mediciones de perplejidad del autor sobre WikiText-2 y Wikipedia en coreano indican un comportamiento estable en ambos idiomas, adecuado para tareas de redacción y resumen en esos mercados.
- Despliegue en estaciones de trabajo con una sola GPU: Q4_K_M cabe en tarjetas de 24 GB y Q8_0 en tarjetas de 32-40 GB, lo que permite ejecutar un modelo de 27B en hardware de gama alta de consumo o profesional sin clúster.
- Prototipado rápido con Ollama o LM Studio: el autor documenta comandos directos (`ollama run hf.co/axteam/Qwen3.8-27B-GGUF:Q4_K_M`) para probar el modelo en local sin gestionar pesos manualmente.
- Evaluación comparativa de cuantizaciones: los archivos Q4_K_M y Q8_0 permiten medir el impacto de la cuantización en tareas propias, usando la perplejidad de referencia publicada como línea base.
- Inferencia con contexto reducido de memoria: la opción `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` reduce a la mitad la caché KV, útil para servir contextos largos en GPUs con VRAM ajustada.
- Integración en pipelines de texto sin requisitos multimodales: al ser solo texto, encaja en sistemas de generación de documentación, clasificación o extracción donde no se necesita visión.

## Benchmarks y rendimiento

El autor solo publica mediciones de perplejidad (PPL), no resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

| Metrica | Q8_0 | Q4_K_M | Diferencia vs Q8_0 |
|---|---|---|---|
| Perplejidad WikiText-2 (EN) | 5,91 | 5,93 | +0,4 % |
| Perplejidad Wikipedia coreano (KO) | 4,36 | 4,43 | +1,5 % |

Medición realizada con llama.cpp b12005 (commit e0f142d, build CUDA) en NVIDIA B200, 16 ventanas de 2.048 tokens por texto. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: Q4_K_M requiere 16,8 GB de pesos más la caché KV del contexto elegido; Q8_0 requiere 29,0 GB más la caché KV.
- GPU recomendadas: NVIDIA B200 (verificada por el autor), A100 40 GB y H100 para Q8_0 con contexto amplio; RTX 4090 (24 GB) o A6000 (48 GB) para Q4_K_M.
- Cabe en GPU de consumo: Q4_K_M sí cabe en RTX 3090/4090 (24 GB) con contexto moderado; Q8_0 no cabe en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp (build ≥ b9180, con `-fa on` desde b6325), `llama-server` con API compatible con OpenAI, Ollama y LM Studio (estos dos no verificados por el autor).
- Reducción de memoria: `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` reduce a la mitad la caché KV.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-GGUF (este) | 27,3 B | no disponible | GGUF (Q4_K_M, Q8_0) | Apache-2.0 | Solo texto; incluye MTP; verificado en B200 |
| Qwen/Qwen3.8-27B (base) | 27,3 B | no disponible | safetensors (BF16) | Apache-2.0 | Incluye codificador de visión; requiere más VRAM |
| Otros modelos de ~27B en GGUF | no disponible | no disponible | GGUF | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre alternativas comparables con datos verificables de parámetros, contexto y rendimiento en la documentación consultada.

## Limitaciones y advertencias

- Solo texto: no incluye `mmproj` ni codificador de visión, por lo que no puede procesar imágenes ni realizar OCR.
- Idiomas documentados limitados: solo se validaron inglés y coreano; el comportamiento en castellano u otros idiomas no está verificado.
- Longitud de contexto no especificada: los ejemplos usan 8192 tokens, pero no se confirma la ventana máxima del modelo base.
- Pérdida de calidad por cuantización: Q4_K_M degrada la perplejidad un 0,4 % en inglés y un 1,5 % en coreano respecto a Q8_0; el autor advierte que la muestra de 16 ventanas es pequeña y que las diferencias pueden quedar dentro del ruido.
- Riesgo de alucinación: no se documentan evaluaciones específicas de veracidad ni de sesgos.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Dependencia de versión de llama.cpp: requiere build ≥ b9180 por la capa MTP; versiones anteriores no cargarán correctamente los archivos.
- Ollama y LM Studio no verificados por el autor: el funcionamiento en esos entornos no está garantizado.
- Licencia Apache-2.0: permite uso comercial, pero los pesos originales y el tokenizador pertenecen al equipo Qwen y deben conservarse los avisos correspondientes.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse en producción sin validación previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Pull request de soporte MTP en llama.cpp: PR #22673 (referenciado en la model card)
