# nchapman/GLiDE-0.8B-W4A16-HGPTQ

## Resumen

GLiDE-0.8B-W4A16-HGPTQ es una versión cuantizada a 4 bits del modelo `fastino/GLiDE-0.8B`, un checkpoint de decisión de una sola pasada basado en la arquitectura `qwen3_5` (híbrida GatedDeltaNet + atención completa). Lo publica el usuario `nchapman` como cuantización comunitaria, no el autor original del modelo base. El modelo base está orientado a tareas de decisión estructurada: dado un estado textual y un conjunto de preguntas con opciones, devuelve una elección razonada mediante una cabeza de lectura (*readout*) de 255 códigos.

La relevancia de esta ficha reside en el método de cuantización empleado: combina una rotación de entrada Walsh-Hadamard de 64×64 (Sylvester) con GPTQ inicializado por MSE y factorización de Cholesky, con `group_size=64` y `actorder="static"`. Según la model card, el resultado comprime el checkpoint BF16 de 1,40 GiB a 0,72 GiB (1,94× menos) manteniendo un 100 % de acuerdo top-1 en las decisiones evaluadas y una similitud coseno de logits de 0,998195 frente a la referencia BF16.

El modelo cuenta con 752.393.024 parámetros totales según los safetensors, 24 capas y `hidden_size=1024`. Es un checkpoint solo de texto (la parte visual no está cuantizada ni incluida), empaquetado con `compressed-tensors` y pensado para cargarse con `transformers` mediante código personalizado (`custom_code`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: GatedDeltaNet + atención completa (familia `qwen3_5`), con cabeza de readout de decisión de 255 códigos |
| Parametros totales | 752.393.024 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), GPTQ con rotación Walsh-Hadamard, `group_size=64`, `actorder="static"`, `dampening_frac=0.01` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con `compressed-tensors` (`quantization_status: compressed`), cargable con `transformers` |

## Arquitectura y entrenamiento

El modelo base GLiDE-0.8B emplea una arquitectura híbrida de 24 capas que combina bloques GatedDeltaNet (atención lineal con estado recurrente) y bloques de atención completa, con `hidden_size=1024` y `head_dim=64`. La inferencia es de una sola pasada (*single-pass*): el modelo procesa el estado y las preguntas en un único forward y emite decisiones a través de una cabeza de lectura de 255 códigos (`readout.safetensors`, matriz `[255, 1024]`). La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La contribución técnica de esta versión concreta es el pipeline de cuantización: se aplica una rotación de entrada Walsh-Hadamard 64×64 (matriz de Sylvester, `H_64`) antes de GPTQ, se inicializa GPTQ por minimización del error cuadrático medio y se resuelve con factorización de Cholesky, calibrando capa a capa bajo atención `noncausal_full_attention`. Se cuantizan 156 capas lineales del modelo de lenguaje (proyecciones `q/k/v/o`, `in_proj_qkv`, `in_proj_z`, `out_proj`, `gate_proj`, `up_proj`, `down_proj`). Permanecen en BF16 la cabeza de readout, `embed_tokens`, `linear_attn.in_proj_a`, `linear_attn.in_proj_b`, normas y sesgos. Las claves de safetensors usan prefijos canónicos `model.language_model.*` y `model.visual.*`, y cargan sin claves faltantes ni inesperadas en `Qwen3_5Model.from_pretrained`, `Glide.from_pretrained` y `warp-34`.

## Capacidades

- Toma de decisiones estructurada sobre un estado textual y un conjunto de preguntas tipadas: `choice`, `yes_no`, `multi_select` y `scale`.
- Evaluación multi-pregunta en una sola pasada, con promedio de permutaciones directa e inversa de las opciones para mitigar el sesgo posicional.
- Salida mediante cabeza de readout de 255 códigos con distribución de probabilidad sobre opciones.
- Procesamiento de texto en inglés (los ejemplos de la model card están en inglés); el resto de idiomas no está documentado.
- No incluye capacidades de visión en este checkpoint: la parte `model.visual.*` no está cuantizada y el modelo se describe explícitamente como *text-only*.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso.
- No se documenta modo *thinking*, audio ni otras modalidades.

## Casos de uso

- Clasificación de intención en atención al cliente: dado un estado con el histórico de un ticket (pedido, entrega, petición del cliente), el modelo devuelve una etiqueta de intención (`invoice`, `refund`, etc.) mediante preguntas de tipo `choice`, como muestra el ejemplo de la model card.
- Enrutamiento de tickets y triaje: con preguntas `yes_no` o `multi_select` se puede decidir si un caso requiere escalado, si es urgente o a qué equipo derivarlo, en una sola pasada y con huella de 0,72 GiB.
- Moderación y cumplimiento: evaluar si un texto cumple políticas mediante preguntas booleanas o escalas, aprovechando la cabeza de 255 códigos para obtener probabilidades calibradas.
- Extracción de decisiones en pipelines de datos: clasificar registros por categorías predefinidas en procesos batch, donde el bajo footprint permite ejecutar muchas instancias en paralelo en una sola GPU.
- Encuestas y anotación asistida: usar preguntas de tipo `scale` para puntuar textos según criterios definidos, con promedio de permutaciones para reducir el sesgo de orden de opciones.
- Despliegue en entornos con VRAM limitada: al ocupar 0,72 GiB en W4A16, cabe en GPUs de consumo y permite servir el modelo junto a otros componentes en la misma tarjeta.
- Evaluación de sistemas de decisión: servir como componente determinista de clasificación dentro de un sistema mayor, con la ventaja de que la cuantización conserva el 100 % de acuerdo top-1 según la model card.

## Benchmarks y rendimiento

La model card solo publica métricas de fidelidad de la cuantización frente al modelo BF16, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Evaluación | BF16 base | W4A16-HGPTQ | Notas |
|---|---:|---:|---|
| Tamano safetensors (incl. readout) | 1,40 GiB (1.505.349.928 B) | 0,72 GiB (775.384.816 B) | Compresión 1,94× (−0,68 GiB) |
| Acuerdo top-1 en decisiones (12 preguntas) | 100,00 % | 100,00 % | Promedio de permutaciones directa e inversa |
| Divergencia KL de probabilidad de opciones (media / máx, nats) | 0,000000 | 0,000421 / 0,004050 | Distribución normalizada por pregunta |
| Similitud coseno de logits del readout de 255 códigos | 1,000000 | 0,998195 | KL de softmax sobre 255 códigos: 0,002742 nats |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,72 GiB de pesos en W4A16, más overhead de activaciones y del runtime de `transformers`; en la práctica, menos de 2 GiB en total para el modelo.
- GPU recomendadas: cualquier GPU con al menos 2-4 GiB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para despliegues de alto throughput, A100 o H100 permiten ejecutar muchas instancias en paralelo.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer modernas, incluidas las de gama baja.
- Opciones de despliegue: `transformers` con `Glide.from_pretrained` (requiere el paquete `glide` y código personalizado), `Qwen3_5Model.from_pretrained` y `warp-34`, según la model card. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| GLiDE-0.8B-W4A16-HGPTQ | 752 M | No disponible | Safetensors W4A16 (compressed-tensors) | Apache 2.0 | Checkpoint de decisión cuantizado, solo texto |
| fastino/GLiDE-0.8B (base) | No disponible en la información (checkpoint BF16 de 1,40 GiB) | No disponible | Safetensors BF16 | Apache 2.0 | Modelo original de decisión, referencia de calidad |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No se dispone de información sobre modelos comparables de decisión estructurada en el mismo rango |

## Limitaciones y advertencias

- Modelo especializado en decisiones estructuradas, no en generación de texto libre; no debe emplearse como LLM conversacional general.
- Checkpoint solo de texto: no incluye la torre visual, por lo que no puede procesar imágenes pese a la etiqueta `image-text-to-text` del pipeline.
- La evaluación de fidelidad se limita a 12 preguntas; el 100 % de acuerdo top-1 no garantiza el mismo comportamiento en dominios o distribuciones no evaluadas.
- La divergencia KL máxima de 0,004050 nats y la similitud coseno de 0,998195 indican pequeñas desviaciones en las probabilidades, relevantes si se usan umbrales calibrados.
- Riesgo de alucinación y sesgos: no documentados en la model card; al ser un modelo de decisión, el riesgo principal es la elección incorrecta de opciones ante estados ambiguos.
- Idiomas soportados no documentados; los ejemplos y la evaluación están en inglés.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base y de las dependencias de código personalizado (`glide`, `warp-34`).
- Requiere código personalizado (`custom_code`) y el paquete `glide` para cargarse; no es un checkpoint estándar de `transformers` sin dependencias adicionales.
- Publicado por un usuario comunitario (`nchapman`), no por el autor original (`fastino`); sin descargas ni likes en el momento de la ficha.

## Enlaces

- [Modelo en Hugging Face: nchapman/GLiDE-0.8B-W4A16-HGPTQ](https://huggingface.co/nchapman/GLiDE-0.8B-W4A16-HGPTQ)
- [Modelo base: fastino/GLiDE-0.8B](https://huggingface.co/fastino/GLiDE-0.8B)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
