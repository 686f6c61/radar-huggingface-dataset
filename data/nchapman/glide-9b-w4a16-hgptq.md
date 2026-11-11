# nchapman/GLiDE-9B-W4A16-HGPTQ

## Resumen

GLiDE-9B-W4A16-HGPTQ es una cuantización de 4 bits del modelo de decisión `fastino/GLiDE-9B`, publicada por el usuario nchapman. No es un modelo de propósito general, sino un *decision model* de una sola pasada (`code-readout-v1`): recibe un estado textual y un conjunto de preguntas estructuradas (elección múltiple, sí/no, selección múltiple o escala) y devuelve una decisión sobre un espacio fijo de 255 códigos mediante una cabeza de lectura dedicada (`readout.safetensors`, matriz de 255×4096). El checkpoint es solo texto: no incluye pesos de visión.

La relevancia de esta ficha está en el compromiso que documenta el propio autor entre compresión y fidelidad. La cuantización reduce el checkpoint BF16 de 14,79 GiB a 5,33 GiB (2,77× menos, −9,46 GiB), pero degrada la coincidencia top-1 de decisión del 100 % al 25 % y deja la similitud coseno de logits de la cabeza de lectura en 0,088877. Es, por tanto, un artefacto útil para experimentar con despliegue de bajo footprint, no una sustitución directa del modelo base en producción.

La arquitectura subyacente es un transformer híbrido de 32 capas con `hidden_size=4096` y recurrencia por bucle de capas intermedias (bloques [12,17] y [18,23], 2 pasadas, escalado residual alpha=0,5), sobre el que se aplica una rotación Walsh–Hadamard y GPTQ con Cholesky. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido GatedDeltaNet + full attention, 32 capas, `hidden_size=4096`; recurrencia mid-network (`blocks=[[12,17],[18,23]]`, `passes=2`, `alpha=0.5`); cabeza de decisión `code-readout-v1` (255 códigos) |
| Parametros totales | 7.936.684.544 (~7,94 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), GPTQ con `group_size=64`, `actorder="static"`, `dampening_frac=0.01`, rotación Walsh–Hadamard Sylvester 64×64; formato `compressed-tensors` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`compressed-tensors`), con `quantization_status: compressed`; claves canónicas `model.language_model.*` |

## Arquitectura y entrenamiento

El modelo base es un transformer de 32 capas con mezcla de bloques GatedDeltaNet (atención lineal) y bloques de atención completa, y con recurrencia en las capas intermedias: los bloques [12,17] y [18,23] se ejecutan dos pasadas con escalado residual alpha=0,5, calibrados a lo largo de todas las pasadas de Euler. La salida no es texto libre, sino una distribución sobre 255 códigos de decisión producida por la cabeza `readout.safetensors` (255×4096), que se mantiene en BF16.

La cuantización aplica una rotación de entrada Walsh–Hadamard Sylvester de 64×64 (`H_64`) seguida de GPTQ con inicialización por MSE y descomposición de Cholesky, sobre 200 capas lineales (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `in_proj_qkv`, `in_proj_z`, `out_proj`, `gate_proj`, `up_proj`, `down_proj`), calibradas capa a capa bajo atención `noncausal_full_attention`. Se mantienen en BF16 la cabeza de lectura, `embed_tokens`, `linear_attn.in_proj_a`, `linear_attn.in_proj_b`, las normas y los sesgos. No hay información disponible sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO en el modelo base.

## Capacidades

- Toma de decisiones estructurada de una sola pasada sobre preguntas de tipo `choice`, `yes_no`, `multi_select` y `scale`, con promedio de permutaciones directa e inversa de las opciones.
- Clasificación sobre un vocabulario fijo de 255 códigos de salida mediante la cabeza de lectura.
- Procesamiento de estados textuales (por ejemplo, resúmenes de tickets o eventos) junto con criterios definidos por el usuario.
- Integración con `transformers` mediante `Qwen3_5Model.from_pretrained`, `Glide.from_pretrained` y `warp-34`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el diseño es explícitamente de una sola pasada.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales: no incluye visión (checkpoint solo texto, 0 lineales de visión cuantizadas); no se documenta modo *thinking* ni audio.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el estado del caso y un conjunto de criterios (`invoice`, `refund`, etc.) y devuelve la intención dominante, como muestra el ejemplo de la model card. Adecuado por su formato de decisión estructurada, aunque la degradación top-1 al 25 % obliga a validar contra el BF16 antes de usarlo en producción.
- Enrutado de peticiones en pipelines internos: clasificar una consulta en una de varias categorías predefinidas con una sola pasada, útil cuando la latencia importa más que la precisión fina.
- Etiquetado asistido de datos: usar el modelo cuantizado para preetiquetar grandes volúmenes y reservar el BF16 para revisión o muestras de control.
- Experimentación en hardware limitado: con 5,33 GiB de pesos, permite probar la lógica de decisión de GLiDE en GPUs de consumo antes de invertir en el checkpoint completo.
- Evaluación de recetas de cuantización: sirve como referencia reproducible de W4A16 con Hadamard + Cholesky GPTQ para comparar con otras técnicas sobre el mismo modelo base.
- Prototipado de sistemas de decisión con presupuesto de VRAM ajustado: entornos de desarrollo o CI donde no cabe el BF16 de 14,79 GiB.
- Investigación sobre robustez de cabezas de lectura: cuantificar cuánto se degrada una cabeza de 255 códigos bajo cuantización de 4 bits en el backbone.

## Benchmarks y rendimiento

Evaluación single-pass `code-readout-v1` sobre 12 preguntas de decisión con promedio de permutaciones directa e inversa:

| Evaluación | BF16 base (`fastino/GLiDE-9B`) | GLiDE-9B-W4A16-HGPTQ |
|---|---:|---:|
| Tamano safetensors (incl. `readout.safetensors`) | 14,79 GiB (15.875.514.032 B) | 5,33 GiB (5.723.255.888 B) |
| Coincidencia top-1 de decisión (12 preguntas) | 100,00 % | 25,00 % |
| KL de distribución de opciones (media / máx, nats) | 0,000000 | 1,275267 / 2,220755 |
| Similitud coseno de logits de lectura (255 códigos) | 1,000000 | 0,088877 |
| KL de softmax completa de 255 códigos (nats) | 0,000000 | 5,711265 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,33 GiB de pesos más overhead de activaciones y contexto; en la práctica, entre 7 y 9 GiB según longitud de entrada y framework.
- GPU recomendadas: cualquier GPU con al menos 8-12 GiB de VRAM para el checkpoint cuantizado; A100/H100 sobredimensionadas para este artefacto salvo que se busque throughput agregado.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090; en tarjetas de 8 GiB puede requerir cuidado con la longitud de contexto.
- Opciones de despliegue: `transformers` con soporte `compressed-tensors` y GPTQ; el autor documenta carga mediante `Glide.from_pretrained`, `Qwen3_5Model.from_pretrained` y `warp-34`. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible (no se documenta).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| GLiDE-9B-W4A16-HGPTQ | ~7,94 B | No disponible | W4A16 GPTQ + Hadamard | Apache 2.0 | Top-1 25 % vs BF16; 5,33 GiB |
| fastino/GLiDE-9B (BF16) | ~7,94 B | No disponible | BF16 | Apache 2.0 | Referencia de calidad: top-1 100 %; 14,79 GiB |
| Alternativas de decisión de mismo tamano | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Pérdida severa de fidelidad: la coincidencia top-1 cae del 100 % al 25 % y la similitud coseno de logits de lectura es de 0,088877; el modelo no es un sustituto directo del BF16 en decisiones críticas.
- Divergencia KL media de 1,275267 nats (máxima 2,220755) en la distribución de opciones, con KL de 5,711265 nats sobre los 255 códigos.
- Modelo de decisión restringido: no genera texto libre ni mantiene conversaciones multi-turno; el uso fuera del esquema `code-readout-v1` no está soportado.
- Checkpoint solo texto: no dispone de torre de visión (0 lineales de visión cuantizadas).
- Idiomas soportados no declarados; no hay garantías documentadas de comportamiento multilingüe.
- Longitud de contexto no documentada, lo que impide planificar cargas de trabajo con entradas largas.
- Riesgo de alucinación no evaluado en esta información; al tratarse de una cabeza de clasificación, el riesgo se manifiesta como asignación errónea de códigos más que como texto inventado.
- Sesgos: no documentados.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no ofrece garantías de calidad para producción con esta cuantización.
- Artefacto con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.
- Requiere toolchain específica (`compressed-tensors`, `glide`, `warp-34`); la compatibilidad con servidores de inferencia habituales no está confirmada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/GLiDE-9B-W4A16-HGPTQ
- Modelo base: https://huggingface.co/fastino/GLiDE-9B
