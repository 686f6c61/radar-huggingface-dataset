# alexzhang0118/Decily-ONNX-int8

## Resumen

Decily-ONNX-int8 es la variante para CPU y edge de Decily-1.7B, un modelo de decisión de tipo cross-encoder cuyo objetivo no es generar texto, sino puntuar un conjunto de candidatos contra un `state` y una `question` y devolver una distribución de probabilidad calibrada sobre esos candidatos. El modelo lo publica el usuario alexzhang0118 bajo licencia Apache-2.0 y su backbone es Qwen/Qwen3-1.7B-Base (1,72B parámetros), sobre el que se añade una cabeza de scoring con attention pooling. Resuelve un problema muy concreto: tareas donde se necesita una probabilidad que se pueda umbralizar (enrutamiento, clasificación, selective prediction) en lugar de una frase que haya que parsear.

Este artefacto concreto es una cuantización int8 dinámica del grafo completo de scoring (`input_ids + attention_mask -> logits`) empaquetada en un único fichero ONNX de 1,66 GB, ejecutable sin PyTorch mediante onnxruntime. Está pensado para despliegues en CPU, Windows o dispositivos edge donde no hay GPU disponible, y es agnóstico de proveedor de ejecución (CPU, CUDA, DirectML).

Es relevante ahora porque ofrece un patrón poco habitual: reutiliza un transformer pequeño como encoder de decisión y entrega probabilidades calibradas listas para umbralizar, con una ruta de despliegue ligera (int8, un solo fichero) que evita la complejidad de servir un modelo generativo. No genera texto, solo puntúa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder de scoring de candidatos; backbone transformer Qwen3-1.7B-Base con cabeza de attention pooling (decision_head) y MLP LayerNorm/GELU |
| Parametros totales | 1,72B en el backbone (más la cabeza de scoring) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Configuración de entrenamiento: state ≤256 tokens, question ≤96 tokens, cada candidato ≤64 tokens; tope total 416 tokens (256+96+64); 2-16 candidatos por llamada |
| Tipos de cuantizacion | int8 dinámica (esta variante ONNX); bf16 en PyTorch/MLX; 4-bit affine group-64 en MLX-4bit |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX int8 en un único fichero (`model.int8.onnx`, sin datos externos); tokenizer en `tokenizer.json`, `tokenizer_config.json`, `vocab.json` |

## Arquitectura y entrenamiento

La arquitectura es un cross-encoder: el backbone codifica conjuntamente la secuencia `state + question + candidate`, una capa de attention pooling sobre todos los tokens alimenta un MLP con LayerNorm y GELU que emite un logit por candidato, y las probabilidades finales se obtienen aplicando softmax sobre el conjunto de candidatos proporcionado en cada llamada. El backbone es Qwen/Qwen3-1.7B-Base, con una cabeza de scoring (`decision_head`) registrada en `config.json` cuyos pesos de pool y cabeza viven en el checkpoint. Un detalle importante es que los logits del cross-encoder son independientes del conjunto de candidatos, de modo que se puede hacer una primera fase de shortlisting por fragmentos y luego re-ranking sin pérdida (el repositorio incluye una utilidad de inferencia en dos etapas).

El entrenamiento se describe en cinco etapas: un teacher de decisión Qwen3.5-2B con LoRA y backbone congelado sobre 45 tareas; un SFT de Qwen3-1.7B con LoRA sobre 24 familias de tareas con etiquetas duras (3000 pasos, aproximadamente 1 hora); varios miembros RLCD (LoRA v1/v2 más un miembro con fine-tuning completo) orientados a calibración de creencias y abstención; una destilación que combina un ensemble de 4 modelos en el espacio de probabilidades hacia un único estudiante con fine-tuning completo (KD T=2, α=0.5, +15% de filas de creencias); y finalmente v5, el modelo liberado, con fine-tuning completo de 3000 pasos, batch efectivo 16, lr 1e-5 y AdamW de 8 bits, aproximadamente 1,5 horas en una RTX 5090. La receta completa está en el repositorio de entrenamiento.

## Capacidades

- Puntuación calibrada de candidatos: dado un `state`, una `question` y una lista de 2 a 16 opciones, devuelve una distribución de probabilidad sobre esas opciones (por ejemplo, intención de cliente entre technical, billing, shipping, returns).
- Selective prediction y umbralización: al devolver probabilidades en lugar de texto, permite fijar umbrales y derivar abstención.
- Clasificación y enrutamiento de decisión sobre conjuntos de etiquetas definidos en tiempo de ejecución (las opciones no están fijadas de antemano).
- Soporte de conjuntos de etiquetas no vistos (zero-shot sobre nuevas taxonomías), con recalibración de temperatura recomendada.
- Inferencia en dos etapas: shortlisting por fragmentos y re-ranking posterior, aprovechando que los logits son independientes del conjunto de candidatos.
- No genera texto: no hay capacidad de resumen, redacción, código ni matemáticas como tal; su única salida es la distribución de probabilidad sobre candidatos.
- Sin soporte declarado de tool calling, function calling, agentes, visión ni audio.
- Capacidad multilingüe: no, declarado únicamente para inglés.

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar la intención de un mensaje de cliente (technical, billing, shipping, returns) con una probabilidad umbralizable, de modo que los casos de baja confianza se deriven a revisión humana.
- Triage de atención al cliente multietiqueta: puntuar varias categorías candidatas para un mismo mensaje y decidir la cola de destino con un umbral de confianza.
- Selective prediction en producción: usar la probabilidad calibrada para decidir entre respuesta automática y escalado a humano según un umbral configurable.
- Moderación o etiquetado con taxonomías dinámicas: puntuar un texto contra un conjunto de etiquetas definido en tiempo de ejecución sin reentrenar el modelo.
- Re-ranking ligero en pipelines de recuperación: usar la utilidad de dos etapas para hacer shortlisting por fragmentos y luego re-ranking con el cross-encoder, dado que los logits son independientes del conjunto de candidatos.
- Despliegue en edge o escritorio sin GPU: con el artefacto ONNX int8 en un único fichero y onnxruntime, se puede ejecutar clasificación de decisión en CPU, Windows o dispositivos con recursos limitados.
- Sistemas de decisión de baja latencia con pocas opciones: para 4 candidatos y filas de unos 160 tokens, la latencia medida es de aproximadamente 1,7 s en CPU Apple M5, adecuada para flujos no interactivos o por lotes.
- Automatización documental con `state` largo: trocear el documento en fragmentos de hasta 256 tokens y puntuar cada fragmento de forma independiente antes de agregar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos cuantitativos aportados son de paridad de cuantización y de latencia.

| Metrica | Valor |
|---|---|
| Paridad int8 vs bf16 (top-1 agreement, fair-suite parity batch) | 1,000 |
| Diferencia máxima grafo fp32 vs PyTorch | 2,5e-05 |
| Latencia por fila, 160 tokens (Apple M5 CPU, 8 hilos) | ~0,42 s |
| Latencia decision de 4 candidatos, 160 tokens | ~1,7 s |
| Latencia por fila, 416 tokens (tope de entrenamiento) | ~1,1 s |
| Latencia decision de 4 candidatos, 416 tokens | ~4,5 s |
| Temperaturas observadas | ≈1,1 (in-domain), ≈0,45 (conjuntos de etiquetas no vistos), ≈1,35 (zero-shot fair suite) |

## Requisitos de hardware

- Esta variante ONNX int8 ocupa 1,66 GB en disco; el modelo base en bf16 ocupa ~3,4 GB y la variante MLX 4-bit ocupa 968 MB.
- Al ser un modelo de 1,72B, la inferencia en int8 requiere del orden de 2 GB de memoria, y en bf16 alrededor de 3,5-4 GB, aunque no se dispone de cifras oficiales de VRAM en la documentación.
- Cabe en GPUs de consumo (RTX 4090 y similares) e incluso en entornos sin GPU dedicada; el artefacto int8 está orientado explícitamente a CPU, Windows y edge.
- Proveedores de ejecución soportados por el grafo ONNX: CPU, CUDA y DirectML (los autores indican que CUDA y DirectML son mucho más rápidos que las cifras de CPU publicadas).
- Opciones de despliegue: onnxruntime (esta variante), MLX en Apple Silicon (variante MLX), PyTorch safetensors en servidor/GPU (variante bf16). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia medida en Apple M5 CPU con 8 hilos: ~0,42 s por fila de 160 tokens y ~1,1 s por fila de 416 tokens; una decisión de 4 candidatos tarda ~1,7 s y ~4,5 s respectivamente. No se aportan cifras de throughput en GPU.

## Comparativa con modelos similares

La información disponible no incluye comparativas con otros modelos de decisión o cross-encoders. Como referencia de categoría, se puede situar frente a alternativas genéricas, pero sin datos de rendimiento comparables.

| Modelo | Parametros | Contexto | Salida | Licencia | Formato |
|---|---|---|---|---|---|
| Decily-ONNX-int8 | 1,72B (backbone) | state 256 + question 96 + candidato 64 | Distribución de probabilidad sobre candidatos | apache-2.0 | ONNX int8 |
| Decily-1.7B (misma familia) | 1,72B | Igual | Igual | apache-2.0 | PyTorch bf16 safetensors |
| Decily-MLX-4bit (misma familia) | 1,72B | Igual | Igual | apache-2.0 | MLX 4-bit |
| Qwen3-1.7B-Base (backbone subyacente) | 1,72B | Contexto de Qwen3 | Generación de texto | apache-2.0 | safetensors |

Nota: las tres primeras filas son el mismo modelo en contenedores distintos, no alternativas. Para comparativas con cross-encoders o modelos de decisión de terceros: no disponible.

## Limitaciones y advertencias

- No genera texto: cualquier expectativa de generación, resumen, código o matemáticas queda fuera de su alcance; su única salida es una distribución sobre candidatos.
- Sobreexceso de confianza fuera de distribución: los logits crudos están sobreexcitados cuando el dominio no es el de entrenamiento; los autores recomiendan calibrar y reportar siempre la temperatura para los datos propios (≈1,1 in-domain, ≈0,45 en conjuntos no vistos, ≈1,35 zero-shot).
- Idiomas: declarado únicamente para inglés; el rendimiento en castellano u otros idiomas no está documentado.
- Límites de entrada estrictos: `state` ≤256, `question` ≤96, candidato ≤64 tokens; las entradas más largas se truncan, por lo que documentos largos exigen trocear el estado y puntuar por fragmentos.
- Número de candidatos acotado a 2-16 por llamada.
- Superficie de etiquetas no vista: con taxonomías nuevas la calibración cambia y requiere ajuste de temperatura antes de umbralizar.
- Hereda los sesgos potenciales de Qwen3-1.7B-Base, ya que el backbone proviene de ese modelo; no se documentan análisis de sesgo específicos.
- Riesgo de alucinación entendido como asignación errónea de probabilidad alta a un candidato incorrecto, especialmente fuera de dominio; la calibración mitiga pero no elimina este riesgo.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-1.7B-Base.
- Adopción mínima: 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es prácticamente inexistente.
- Fechas de creación y actualización del repositorio registradas como 2026-09-26, dato que conviene contrastar con la fuente.

## Enlaces

- Repositorio HuggingFace (variante ONNX int8): https://huggingface.co/alexzhang0118/Decily-ONNX-int8
- Variante PyTorch bf16: https://huggingface.co/alexzhang0118/Decily-1.7B
- Variante MLX: https://huggingface.co/alexzhang0118/Decily-MLX
- Variante MLX 4-bit: https://huggingface.co/alexzhang0118/Decily-MLX-4bit
- Repositorio de entrenamiento: https://github.com/arczhi/decily
- Receta de entrenamiento (TRAINING.md): https://github.com/arczhi/decily/blob/main/TRAINING.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
