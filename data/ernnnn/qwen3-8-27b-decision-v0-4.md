# Ernnnn/Qwen3.8-27B-Decision-v0.4

## Resumen

Qwen3.8-27B Decision v0.4 es un modelo de decisión derivado del checkpoint base Qwen/Qwen3.8-27B, publicado por el usuario Ernnnn en Hugging Face. No es un modelo generativo al uso: recibe un estado (texto de contexto), una pregunta y entre 2 y 255 opciones ordenadas, y devuelve en un único forward pass una distribución de probabilidad sobre las opciones. Se presenta como una reproducción independiente de una interfaz de decisión al estilo Jev, sin vinculación con TypeSafe.

El modelo conserva la arquitectura híbrida del backbone Qwen3.8-27B (atención lineal recurrente combinada con capas de atención completa) y añade dos modificaciones clave: entrena un token de decisión mediante LoRA y convierte las 16 capas de atención completa en atención bidireccional sobre la entrada, mientras las 48 capas restantes mantienen su recurrencia de atención lineal. El resultado es un cabezal de scoring con proyección FP32 y softmax restringido a las opciones proporcionadas.

Es relevante porque propone un patrón distinto al de los LLM generativos para tareas de selección (enrutamiento, clasificación de acciones, triaje): en lugar de generar texto y parsearlo, puntúa directamente las alternativas en una sola pasada, lo que simplifica la integración en pipelines de agentes y reduce la superficie de error de formato. El modelo tiene 26.896.131.584 parámetros totales y un repositorio de 56,4 GB en safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal recurrente + atención completa), derivado de Qwen3.8-27B; 16 capas de atención completa bidireccional y 48 capas con recurrencia de atención lineal |
| Parámetros totales | 26.896.131.584 (26,9 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 12.288 tokens por defecto en el script de referencia (SDPA); 65.536 tokens en la evaluación con FlashAttention 2; el forward de 64.308 tokens se ejecutó en una H100 |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, con cabezal de salida en FP32; el backbone se entrenó en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en los metadatos; la model card indica que se incluye la licencia Apache 2.0 del modelo base Qwen/Qwen3.8-27B |
| Formato de pesos | safetensors (12 shards, 56,34 GB / 52,47 GiB) |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3.8-27B congelado en BF16. Sobre él se entrena un adaptador LoRA de rango 32 y alpha 64, junto con un cabezal de decisión, usando entropía cruzada con objetivos suaves (soft-target cross entropy) sobre 1.199.832 registros de decisión durante una época: 6.250 pasos de optimizador, batch global de 192, LR máximo de 0,0001, 3 % de warmup y decaimiento lineal. El entrenamiento completo llevó aproximadamente 11 h 17 min en ocho H100; el checkpoint de 4.500 pasos alcanzó 65,05 en Decision Index Public tras unas 8 h 7 min. Solo se publican los pesos finales, con los adaptadores fusionados y el cabezal de salida en FP32.

La innovación técnica principal es la separación entre dos regímenes de atención: las 16 capas de atención completa pueden atender de forma bidireccional sobre toda la entrada suministrada, mientras que las 48 capas restantes mantienen la recurrencia de atención lineal original del backbone. El scoring se realiza únicamente en la posición final de decisión, con una proyección FP32 y softmax sobre las opciones. La model card advierte explícitamente de que un pipeline causal de text-generation estándar calcula una función distinta, por lo que debe usarse la ruta de scoring incluida (`predict.py`). Las entradas que exceden la longitud máxima lanzan un error en lugar de descartar opciones.

## Capacidades

- Scoring de decisiones: recibe un estado, una pregunta y entre 2 y 255 opciones ordenadas, y devuelve probabilidades normalizadas sobre las opciones en un solo forward pass.
- Atención bidireccional en las 16 capas completas, lo que permite condicionar la decisión sobre toda la entrada y no solo sobre el prefijo causal.
- Soporte de contextos largos: hasta 12.288 tokens por defecto y 65.536 tokens en la ruta evaluada con FlashAttention 2.
- Decisiones binarias (sí/no) y ordinales: la model card reporta mayor ganancia en decisiones sí/no y menor precisión en decisiones ordinales de tipo Score.
- Integración con Transformers y Accelerate; ruta acelerada con flash-attn 2.8.3, fla-core 0.5.2 y causal-conv1d 1.7.0.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling ni agentes multi-paso en la información disponible.

## Casos de uso

- Enrutamiento de acciones en agentes: dado el estado de una conversación y una lista de acciones posibles (pedir un dato, confirmar un cambio, escalar a humano), el modelo puntúa cada opción y el orquestador selecciona la de mayor probabilidad. Es adecuado porque evita generar y parsear texto libre.
- Triaje de tickets de soporte: con el texto del ticket como estado y las categorías de cola como opciones, se obtiene una distribución que permite priorizar y derivar; el contexto de 12K tokens cubre hilos de correo largos.
- Clasificación de intención en asistentes conversacionales: se pasa el historial reciente como estado y el conjunto cerrado de intenciones como opciones, obteniendo una decisión calibrada por softmax en lugar de una etiqueta generada.
- Verificación de requisitos en formularios: estado con los datos introducidos, pregunta sobre el siguiente campo a solicitar y opciones con los campos pendientes; útil en flujos de atención al cliente (por ejemplo, reservas de vuelo sin número de reserva).
- Selección de herramienta en pipelines deterministas: las herramientas disponibles se enumeran como opciones y el modelo decide cuál invocar, con la ventaja de que la salida siempre pertenece al conjunto permitido.
- Evaluación de alternativas en sistemas de recomendación o moderación: puntuar un conjunto acotado de respuestas candidatas y ordenarlas por probabilidad, usando la ventana de 64K para incluir contexto extenso de políticas o catálogo.
- Decisión sí/no en control de calidad: aprobar o rechazar un contenido o una transición de estado, aprovechando que la model card reporta la mayor ganancia en decisiones binarias.

## Benchmarks y rendimiento

| Benchmark | Este modelo (final) | Referencia pública Jev 1.14 |
|---|---:|---:|
| Decision Index Public (score público, entrada de 12K para este modelo) | 65,17 | 60,70 |
| JevBench Public (exactitud micro, 231 ítems) | 88,74 % | 87,45 % |
| DecisionBench (exactitud micro, 23.900 ítems, entrada de 64K para este modelo) | 77,04 % | 73,66 % |

Las puntuaciones de referencia provienen de los snapshots públicos de Decision Index y JevalKit citados en la model card. El valor de Decision Index corresponde solo al componente público; no se reporta la puntuación privada Full. La auditoría completa de solapamiento entre datos de entrenamiento y benchmarks públicos está pendiente según el autor.

## Requisitos de hardware

- Pesos completos en safetensors: 56,34 GB (52,47 GiB) en 12 shards; en BF16 no caben en GPUs de consumo de 24 GB sin cuantización, que no está documentada.
- Un forward de 64.308 tokens en una H100 80 GB consumió 65,46 GiB de memoria pico asignada y 72,95 GiB reservada, por lo que la ventana de 64K requiere GPUs de 80 GB.
- Para la ventana por defecto de 12.288 tokens se recomienda al menos una GPU profesional con memoria suficiente para los pesos más el estado de activaciones; no se proporcionan cifras exactas para ese régimen.
- GPUs recomendadas según la información disponible: H100 80 GB para la ruta de 64K con FlashAttention 2; el entrenamiento se realizó en ocho H100.
- Despliegue: Transformers 5.16.1 y Accelerate 1.14.0 con PyTorch 2.13.0; ruta acelerada con flash-attn 2.8.3, fla-core 0.5.2 y causal-conv1d 1.7.0. Debe usarse el scorer incluido (`predict.py`), no un pipeline causal estándar.
- Latencia y throughput: no disponibles; la model card indica que dependen del batch, los kernels y la longitud de entrada, y recomienda empezar con una decisión concurrente y medir la carga objetivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B Decision v0.4 | 26,9 B | 12.288 por defecto; 65.536 evaluado | Scoring de decisiones sobre opciones | no disponible (incluye Apache 2.0 del base) | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-27B (base) | 27 B (aprox., según nombre) | no disponible | Generación de texto causal | Apache 2.0 | Hugging Face |
| Referencia Jev 1.14 | no disponible | no disponible | Interfaz de decisión tipo Jev | no disponible | Solo puntuaciones públicas citadas |

No se dispone de datos de otros modelos de decisión comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: usar un pipeline causal estándar calcula una función distinta y produce resultados incorrectos; es obligatorio emplear la ruta de scoring incluida.
- El autor indica que la auditoría de solapamiento entre los 1.199.832 registros de entrenamiento y los benchmarks públicos está pendiente, por lo que las cifras de Decision Index, JevBench y DecisionBench deben tomarse con cautela.
- Solo se reporta el componente público de Decision Index; no hay puntuación Full privada.
- Menor precisión en decisiones ordinales (Score) que la referencia Jev, según la propia model card.
- Las entradas que exceden la longitud máxima lanzan un error; no hay truncado ni descarte silencioso de opciones, lo que exige gestionar el límite en producción.
- Licencia no declarada en los metadatos del repositorio; aunque se incluye la Apache 2.0 del modelo base, la situación legal de los pesos derivados y del uso comercial no está aclarada.
- Idiomas soportados no documentados; el comportamiento multilingüe heredado del backbone no está verificado.
- Sin descargas ni likes en el momento de la consulta y con solo los pesos finales publicados (sin checkpoints intermedios), lo que limita la reproducibilidad del entrenamiento.
- Riesgo de sesgo y alucinación no evaluado en la información disponible; al tratarse de un clasificador restringido a opciones, el riesgo de alucinación de formato es bajo, pero la calibración de probabilidades no está validada fuera de los benchmarks citados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ernnnn/Qwen3.8-27B-Decision-v0.4
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- Snapshot de Decision Index público: https://huggingface.co/spaces/multimodalart/jev-decision-index/blob/b7e7ea6770d4a628594b2db9ba0e4012bba7b2b6/data/v03.json
- Snapshot de JevalKit Leaderboard: https://huggingface.co/spaces/Valen-Team/JevalKit-Leaderboard/blob/98b7f74cb7b4959d759c4cd04e25e329140b324b/data/leaderboard.json
