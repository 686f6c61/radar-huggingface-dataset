# nchapman/d3-mini-W4A16-HGPTQ

## Resumen

d3-mini-W4A16-HGPTQ es una cuantización de 4 bits del modelo `vllm-sr/d3-mini`, un modelo de decisión de una sola pasada (`code-readout-v1`) desarrollado originalmente por vllm-sr y cuantizado por nchapman. No es un modelo generativo de propósito general: su función es emitir decisiones estructuradas sobre un estado de entrada (texto o imágenes) mediante una cabeza de lectura de 255 códigos, lo que lo sitúa en la categoría de modelos de clasificación y enrutamiento más que en la de asistentes conversacionales.

La arquitectura subyacente es un transformer híbrido de 32 capas con `hidden_size=2560` que combina bloques GatedDeltaNet (atención lineal recurrente) con atención completa, e incorpora una torre visual ViT de 12 bloques. El checkpoint original en BF16 ocupa 8,46 GiB; esta versión lo comprime a 3,13 GiB (2,70×) manteniendo un 100,00% de acuerdo top-1 en decisiones y una similitud coseno de logits de 0,999841 frente a la referencia.

Su relevancia práctica es doble: por un lado demuestra una receta de cuantización W4A16 con rotación Walsh-Hadamard y GPTQ con inicialización Cholesky por MSE que preserva la calidad de decisión con pérdida mínima; por otro, ofrece un modelo de enrutamiento y clasificación desplegable en hardware modesto, con licencia Apache 2.0 y compatibilidad con `compressed-tensors` y `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido GatedDeltaNet + atención completa (32 capas, `hidden_size=2560`), con torre visual ViT de 12 bloques y cabeza de lectura de 255 códigos |
| Parametros totales | 4.539.265.536 (4,54 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), grupo de tamaño 64, GPTQ con rotación Walsh-Hadamard 64×64 y `actorder="static"`; formato `compressed-tensors` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (298 capas lineales cuantizadas + `readout.safetensors` en BF16) |

## Arquitectura y entrenamiento

El modelo base `vllm-sr/d3-mini` emplea una arquitectura híbrida de 32 capas que intercala bloques GatedDeltaNet —un mecanismo de atención lineal con estado recurrente— con bloques de atención completa. La variante cuantizada conserva esa estructura y añade una torre visual de 12 bloques ViT más un módulo `merger` que proyecta las representaciones visuales al espacio del modelo de lenguaje. La inferencia se realiza en una sola pasada (`single-pass`) con atención `noncausal_full_attention`, es decir, sin generación autoregresiva: el modelo procesa el estado completo y emite directamente una distribución sobre los 255 códigos de la cabeza de lectura.

La receta de cuantización aplicada por nchapman es el elemento técnico diferencial. Sobre las 298 capas lineales (200 del backbone lingüístico, 98 de la torre visual y el merger) se aplica una rotación de entrada Walsh-Hadamard de Sylvester de 64×64 (`H_64`) seguida de GPTQ con inicialización Cholesky por MSE, `group_size=64`, `actorder="static"` y `dampening_frac=0.01`, calibrando capa a capa. Se mantienen en BF16 la cabeza de lectura (`readout.safetensors`, matriz de 255×2560), los embeddings de tokens, las proyecciones `linear_attn.in_proj_a` e `in_proj_b`, las normas, los sesgos y `visual.patch_embed.proj`. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Clasificación y decisión estructurada sobre un estado de entrada, con cuatro tipos de tarea soportados: `choice` (elección entre opciones), `yes_no` (binaria), `multi_select` (selección múltiple) y `scale` (escala).
- Emisión de distribuciones de probabilidad normalizadas sobre opciones, lo que permite umbrales de confianza y análisis de incertidumbre.
- Procesamiento de entrada multimodal: texto e imágenes, gracias a la torre ViT de 12 bloques.
- Cabeza de lectura de 255 códigos que actúa como espacio de decisión discreto y compartido entre tareas.
- Enrutamiento y etiquetado en una sola pasada, sin decodificación autoregresiva, lo que reduce la latencia frente a modelos generativos.
- Promediado de permutaciones de opciones (forward + reverse) para mitigar sesgos de posición en la decisión.
- No se ha documentado soporte de tool calling, function calling ni razonamiento multi-paso con agentes; el modelo no está diseñado para ello.

## Casos de uso

- Clasificación de intención en atención al cliente: el modelo recibe el estado de la conversación y un conjunto de criterios (por ejemplo `invoice` frente a `refund`) y devuelve la intención con su distribución de probabilidad, tal como muestra el ejemplo de la model card. Es adecuado porque la tarea es de decisión cerrada y no requiere generación.
- Enrutamiento de tickets en sistemas de soporte: con la tarea `choice` se puede asignar cada ticket a un equipo o cola concreto, usando la probabilidad de la opción elegida como señal para derivar casos ambiguos a revisión humana.
- Moderación y filtrado binario: la tarea `yes_no` permite implementar clasificadores de política (permitir/bloquear, seguro/no seguro) con una sola pasada y umbral configurable.
- Etiquetado multi-etiqueta de documentos: con `multi_select` se pueden asignar varias categorías simultáneas a un texto, útil en pipelines de indexación y gestión documental.
- Evaluación de satisfacción o severidad: la tarea `scale` permite mapear un estado a un nivel ordinal (por ejemplo gravedad de incidencia), con la distribución completa disponible para calibrar cortes.
- Verificación visual de estados: gracias a la torre ViT, el modelo puede decidir sobre imágenes (por ejemplo validar si una captura muestra un error concreto), con la advertencia de que la fidelidad visual tras la cuantización baja a una similitud coseno media de 0,983215.
- Despliegue en entornos con VRAM limitada: al ocupar 3,13 GiB en W4A16, cabe en GPUs de consumo para servir clasificación a bajo coste, siempre que se valide la pérdida de calidad en el dominio propio.

## Benchmarks y rendimiento

Los datos publicados comparan la versión cuantizada con el modelo base BF16 en la evaluación `code-readout-v1` (12 preguntas, promediado de permutaciones forward y reverse):

| Evaluacion | BF16 base (`vllm-sr/d3-mini`) | `d3-mini-W4A16-HGPTQ` | Notas |
|---|---:|---:|---|
| Tamano en safetensors (incl. `readout.safetensors`) | 8,46 GiB (9.081.227.360 B) | 3,13 GiB (3.361.394.008 B) | Compresión 2,70× (−5,33 GiB) |
| Acuerdo top-1 en decisiones (12 preguntas) | 100,00% | 100,00% | Promediado de permutaciones |
| Divergencia KL de probabilidad de opciones (media / max, nats) | 0,000000 | 0,000113 / 0,000943 | Distribución normalizada por pregunta |
| Similitud coseno de logits de lectura (255 códigos) | 1,000000 | 0,999841 | KL del softmax completo 0,000202 nats |
| Torre visual (`vision-probe-v2`, 96 imágenes, 50.596 tokens visuales) | 1,000000 cos sim | 0,983215 media (0,941786 mín.) | `vision-guard-v2`: media 0,985773 (mín. 0,974843) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, lo que es coherente con la naturaleza no generativa del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,13 GiB de pesos más overhead de activaciones y contexto; en la práctica, entre 4 y 6 GiB según longitud de entrada y lote.
- GPU recomendadas: cualquier GPU con al menos 8 GiB de VRAM; una RTX 4090, A100 o H100 ofrece margen amplio para lotes grandes y contexto largo.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GiB o superiores (RTX 3060 Ti/4060 Ti en adelante); en 6 GiB solo con lotes pequeños y entradas cortas.
- Opciones de despliegue: `transformers` con `compressed-tensors` (formato nativo), y el runtime específico `d3_runtime` (`D3.from_pretrained`); la model card menciona carga limpia en `Qwen3_5Model.from_pretrained`, `D3.from_pretrained` y `warp-34`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. Al ser una pasada única sin decodificación autoregresiva, la latencia debería ser sustancialmente menor que la de un modelo generativo de tamaño comparable, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (modelos de decisión con cabeza de lectura de códigos) en la documentación proporcionada. La comparación más directa disponible es con su propio modelo base:

| Modelo | Parametros | Contexto | Formato | Licencia | Tamano |
|---|---|---|---|---|---|
| `vllm-sr/d3-mini` (BF16) | 4,54 mil millones | No disponible | safetensors BF16 | Apache 2.0 | 8,46 GiB |
| `nchapman/d3-mini-W4A16-HGPTQ` | 4,54 mil millones | No disponible | safetensors W4A16 (`compressed-tensors`) | Apache 2.0 | 3,13 GiB |

Frente a modelos generativos de ~4-5 mil millones de parámetros (familia Qwen, Llama, Phi), la comparación no es homogénea: d3-mini no genera texto libre y su evaluación se basa en acuerdo de decisión y similitud de logits, no en benchmarks de lenguaje.

## Limitaciones y advertencias

- El modelo no es generativo: no produce texto libre, código ni razonamiento encadenado; usarlo como asistente conversacional daría resultados incorrectos.
- La torre visual sufre la mayor degradación tras la cuantización: similitud coseno media de 0,983215 y mínima de 0,941786 en `vision-probe-v2`, lo que puede afectar a decisiones visuales finas.
- La evaluación de calidad se limita a 12 preguntas en `code-readout-v1`; es una muestra pequeña y no cubre dominios diversos, por lo que el 100% de acuerdo top-1 no garantiza el mismo comportamiento en producción.
- No hay información sobre sesgos del modelo base, composición del dataset de entrenamiento ni evaluación de robustez frente a entradas adversarias.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí riesgo de decisiones erróneas con alta confianza cuando la entrada cae fuera de la distribución de entrenamiento.
- No se documentan los idiomas soportados; no debe asumirse cobertura multilingüe.
- La longitud de contexto no está publicada, lo que impide dimensionar entradas largas con seguridad.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026: no hay evidencia de uso en producción ni validación independiente.
- Licencia Apache 2.0, que permite uso comercial, pero al ser una cuantización de un modelo de terceros conviene verificar la licencia y condiciones del modelo base `vllm-sr/d3-mini`.
- Requiere el runtime `d3_runtime` o soporte de `compressed-tensors`; la integración con servidores de inferencia habituales no está documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/d3-mini-W4A16-HGPTQ
- Modelo base: https://huggingface.co/vllm-sr/d3-mini
- Repositorio del formato de cuantización: https://github.com/neural-compressor/compressed-tensors
- Repositorio de GPTQ: https://github.com/IST-DASLab/gptq
- Repositorio de QuIP (rotaciones Hadamard): https://github.com/Cornell-RelaxML/quip-sharp
- Paper de GatedDeltaNet: https://arxiv.org/abs/2412.06464
- Paper de QuaRot (rotaciones Hadamard para cuantización): https://arxiv.org/abs/2404.00456
