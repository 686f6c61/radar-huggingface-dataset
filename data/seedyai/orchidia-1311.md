# Seedyai/Orchidia-1311

## Resumen

Orchidia 16K es un adaptador LoRA experimental publicado por Seedyai sobre el modelo base Qwen/Qwen3.5-4B, orientado a la toma de decisiones estructuradas en lugar de la generación de texto libre. Dado un estado textual (STATE) y un esquema dinámico de decisión (cualquier número de preguntas, cada una con cualquier número de opciones), el modelo devuelve una distribución de probabilidad por pregunta en formato JSON, en lugar de una respuesta en lenguaje natural.

El paquete no contiene los pesos del modelo base: incluye únicamente un adaptador LoRA (rank 16, alpha 32) sobre las proyecciones de atención y MLP del tronco de Qwen3.5-4B, congelado, más una cabeza de decisión específica de 2,63 M de parámetros que puntúa cada par (pregunta, opción). El total de parámetros entrenables es de 23.862.273 y la longitud máxima de secuencia es de 512 tokens.

La relevancia de esta publicación es doble: por un lado, propone un patrón arquitectónico poco habitual (scorer compartido sobre un esquema dinámico, sin clasificadores fijos por pregunta); por otro, se distribuye explícitamente como *preview* de investigación no listo para producción, con resultados de evaluación reportados por el proyecto original pero no reejecutados ni reproducidos de forma independiente para esta versión de empaquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-4B congelado) + LoRA rank 16 + cabeza de decisión DynamicDecisionHead |
| Parametros totales | 23.862.273 entrenables (21.233.664 de adaptador LoRA + 2.628.609 de cabeza); el tronco base Qwen3.5-4B no se incluye en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (longitud máxima de secuencia de entrenamiento y evaluación) |
| Tipos de cuantizacion | no disponible (pesos del adaptador y la cabeza en float32; tronco en bf16/fp16 durante entrenamiento e inferencia) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA y cabeza de decisión) |

## Arquitectura y entrenamiento

La arquitectura encadena el tronco de Qwen3.5-4B (congelado) con adaptadores LoRA de rank 16, alpha 32 y dropout 0.05 aplicados a `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Sobre el estado oculto del último token no de padding (dimensión 2560) se aplica una cabeza de decisión con la secuencia `LayerNorm(2560) → Linear(2560→1024) → GELU → Dropout(0.1) → Linear(1024→1)`, que produce un logit por cada par (pregunta, opción). Un softmax por pregunta convierte esos logits en probabilidades. No existen clasificadores fijos por pregunta: un único scorer compartido maneja preguntas no vistas y un número arbitrario de opciones K. Cada par se renderiza con una plantilla fija (`State: … / Question: … / Option: … / Decision:`). La cabeza calcula en float32 aunque el tronco corra en fp16/bf16.

El entrenamiento corresponde al experimento `v0_16k_lora_r16`: 16.000 filas barajadas del dataset `ZefanCai/Open-Jev` (configuración `release-v2-redistributable`, revisión `c67699e…`), 1 época, 1.000 pasos de optimizador, batch efectivo de 16 (2 por dispositivo × acumulación 8), longitud máxima de 512 tokens, precisión bfloat16, optimizador AdamW con LR de 1e-4 para la cabeza y 5e-5 para el LoRA, semilla 0 y *warm start* desde una cabeza congelada de 8K (`checkpoints/v0_8k_shuf/head_final.pt`). Se ejecutó en una NVIDIA A100-SXM4-80GB. La pérdida de validación final reportada por la ejecución original es 0.2977. Esta publicación de empaquetado no realizó entrenamiento, fine-tuning, paso de optimizador, nuevo benchmark ni evaluación de holdout.

## Capacidades

- Estimación de probabilidad estructurada: devuelve una distribución por pregunta y opción en lugar de texto libre, con salida JSON del tipo `{"intent": {"refund": 0.71, …}, "urgency": {…}}`.
- Esquema dinámico: admite cualquier número de preguntas y cualquier número de opciones por pregunta, sin clasificadores dedicados.
- Generalización a preguntas no vistas: un único scorer compartido puntúa pares (estado, pregunta, opción) nuevos.
- Clasificación multi-etiqueta simultánea: varias preguntas se resuelven en una sola pasada sobre el mismo estado.
- Salida calibrada como distribución de probabilidad (softmax por pregunta), apta para umbrales y políticas de decisión.
- Solo texto en esta preview: la modalidad es text-only.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad nativa; el modelo es un scorer de decisión, no un generador.
- Capacidades multilingües: no disponibles (no se documentan idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Triaje de tickets de soporte: dado el texto de una reclamación, el modelo devuelve simultáneamente la distribución de intención (reembolso, envío, queja, otro), la urgencia y la probabilidad de escalado, lo que permite enrutar con umbrales configurables en lugar de parsear texto generado.
- Moderación con política dinámica: definir el esquema de decisión en tiempo de ejecución (por ejemplo, categorías de contenido y severidad) y obtener probabilidades por categoría para cada mensaje, sin reentrenar clasificadores por política.
- Encuestas y anotación asistida: convertir respuestas abiertas en distribuciones sobre opciones predefinidas, útil para preetiquetar grandes volúmenes y priorizar la revisión humana por confianza.
- Enrutamiento en pipelines de agentes: usar las probabilidades como señal de decisión para elegir la siguiente herramienta o rama de un flujo, con la ventaja de disponer de una medida de incertidumbre explícita por opción.
- Investigación sobre decisión estructurada: el paquete sirve como referencia reproducible (adaptador y cabeza con SHA-256 verificados) para estudiar scorers compartidos sobre esquemas variables frente a clasificadores fijos.
- Evaluación de calibración: al emitir probabilidades, permite medir calibración (ECE, Brier) y ajustar umbrales operativos sin cambios en el modelo.
- Clasificación de documentos con contexto corto: para estados de hasta 512 tokens, como asuntos de correo, resúmenes de incidencias o descripciones de producto, con un esquema de decisión adaptado al dominio.

## Benchmarks y rendimiento

Los siguientes resultados proceden de la evaluación interna original del proyecto, tal como se reportan en la model card. No fueron reejecutados, revalidados ni reproducidos de forma independiente para esta versión de empaquetado, y no constituyen una afirmación de rendimiento general en benchmarks estándar.

| Puerta pre-registrada | Resultado | Umbral | Estado |
|---|---|---|---|
| Precisión OOD ponderada por prevalencia natural | 87,52 % | ≥ 73,0 % | PASS reportado |
| `painting-geometry-v1 \| noul \| K=2` (precisión) | 88,59 % | ≥ 60,0 % | PASS reportado |
| Límite inferior del IC pareado en validación | +11,33 pp | ≥ −1,0 pp | PASS reportado |

Contexto adicional reportado por el proyecto original: la línea base congelada de 16K obtiene un 69,6 % en OOD ponderado natural sobre las mismas filas (+17,96 pp para este checkpoint LoRA). El conjunto de holdout principal nunca se cargó en el proyecto original y sigue sin utilizarse; no se ejecutó evaluación de holdout para esta versión.

Validación de empaquetado (2026-11-13): la cabeza se convirtió a Safetensors con 6/6 tensores de formas y dtypes idénticos y SHA-256 por tensor coincidente; los 256 tensores del adaptador PEFT coinciden byte a byte con los del checkpoint fuente. Sobre un fixture de dos filas autorizado, el paquete produce logits, probabilidades y pérdida bit a bit idénticos a los del campeón original en el mismo entorno (Tesla T4, fp16, torch 2.10.0, transformers 5.22.2, peft 0.21.3). La referencia almacenada en A100/bf16 difiere como máximo 0,056 en logits y 2,0e-5 en probabilidades (diferencia esperada fp16 frente a bf16), con coincidencia en las decisiones argmax.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, el tronco Qwen3.5-4B en fp16 requiere aproximadamente 8 GB de pesos, más el adaptador (21,2 M de parámetros) y la cabeza (2,63 M), ambos en float32; en bf16 el tronco se reduce a unos 8 GB y en cuantización de 4 bits a unos 2,5-3 GB, aunque no se documentan cuantizaciones soportadas.
- GPU recomendadas: el entrenamiento se realizó en NVIDIA A100-SXM4-80GB; la validación de empaquetado se ejecutó en Tesla T4 con fp16, lo que indica que la inferencia cabe en GPU de gama media con al menos 16 GB en fp16.
- GPU de consumo: previsiblemente viable en RTX 4090 (24 GB) y RTX 3090 (24 GB) en fp16; en tarjetas de 8-12 GB requeriría cuantizar el tronco, opción no documentada por el autor.
- Despliegue: no es un repositorio `PeftModel.from_pretrained(...)` directo. El adaptador reside en `adapter/` y debe combinarse con la cabeza de decisión mediante el `inference.py` incluido; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La longitud máxima de 512 tokens y el esquema de puntuación por par (pregunta, opción) implican un coste proporcional al número de opciones, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Orchidia 16K (este) | 23,86 M entrenables sobre Qwen3.5-4B congelado | 512 tokens | Scorer de decisión estructurada con esquema dinámico | Apache 2.0 | Adaptador + cabeza en HF; requiere código propio |
| Qwen3.5-4B (base) | 4B | no disponible en la informacion proporcionada | Generación de texto libre | no disponible en la informacion proporcionada | Pesos completos en HF |
| Clasificadores supervisados por tarea (BERT/RoBERTa fine-tuned) | 100-400 M típicamente | 512 tokens típicamente | Clasificación fija por etiquetas predefinidas | variable | Amplia |
| LLMs con salida JSON estructurada (p. ej. modelos instruct de 3-8B) | 3-8B | 8K-128K típicamente | Generación con formato forzado | variable | Amplia |

La comparación con alternativas de la misma categoría exacta (scorers de decisión con esquema dinámico sobre un LLM) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Preview de investigación explícitamente no listo para producción según el autor.
- No contiene los pesos del modelo base Qwen3.5-4B; requiere descargarlo por separado y respetar su licencia.
- Requiere código de inferencia propio (`inference.py`); no funciona como un adaptador PEFT estándar.
- Ventana de contexto muy corta: 512 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo texto; sin visión, audio ni otras modalidades en esta versión.
- Idiomas soportados no documentados; el comportamiento fuera del inglés (o del idioma dominante del dataset Open-Jev) es desconocido.
- Los resultados de evaluación proceden de la ejecución interna original y no han sido reproducidos de forma independiente; el holdout principal nunca se evaluó.
- Los resultados OOD son específicos de la fuente Open-Jev y no deben extrapolarse a otros dominios.
- Riesgo de alucinación: no aplica en el sentido habitual (no genera texto libre), pero las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento.
- Sesgos: no documentados por el autor; al heredar el tronco de Qwen3.5-4B, puede arrastrar los sesgos del modelo base y del dataset de entrenamiento.
- Licencia Apache 2.0 para el adaptador y la cabeza; el uso comercial del tronco queda sujeto a la licencia de Qwen3.5-4B.
- El dataset de entrenamiento no se redistribuye con el paquete.
- Solo 2 likes y 0 descargas en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Seedyai/Orchidia-1311
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/ZefanCai/Open-Jev
- Repositorio de código de inferencia: incluido en el propio repositorio del modelo (`inference.py`); no se han encontrado enlaces adicionales a papers, blogs o demos en la información disponible.
