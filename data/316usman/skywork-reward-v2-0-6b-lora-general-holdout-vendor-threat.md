# 316usman/skywork-reward-v2-0.6b-lora-general-holdout-vendor-threat

## Resumen

`316usman/skywork-reward-v2-0.6b-lora-general-holdout-vendor-threat` es un adaptador LoRA experimental publicado por el usuario 316usman sobre el modelo base Skywork-Reward-V2-Qwen3-0.6B, un modelo de recompensa (reward model) de 0,6 mil millones de parámetros construido sobre la arquitectura Qwen3. El adaptador se entrenó el 24 de noviembre de 2026 con el objetivo declarado de ser "intent-agnostic", es decir, de generalizar la capacidad de puntuación de respuestas a intenciones no vistas durante el entrenamiento, excluyendo explícitamente las categorías VENDOR_VERIFY y THREAT_IP_REPUTATION del conjunto de datos.

El modelo resuelve un problema concreto en pipelines de evaluación y alineamiento: disponer de una señal de recompensa fiable cuando el juez se enfrenta a tipos de petición que no aparecen en la distribución de entrenamiento. Según la model card, el adaptador mejora la precisión pairwise en intenciones no vistas del 0,8513 (zero-shot) al 0,9703, un delta de +0,1190 sobre 269 pares de evaluación.

La relevancia es doble: por un lado, demuestra que un ajuste LoRA ligero (r=16, alpha=32, una época, secuencia de 256 tokens) puede desplazar de forma sustancial el comportamiento de un reward model pequeño; por otro, el autor lo marca explícitamente como privado y "no apto para despliegue en nodos", lo que lo sitúa como artefacto de investigación más que como componente de producción. El repositorio ocupa 0,0 GB y no incluye pipeline, licencia ni idiomas declarados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Skywork-Reward-V2-Qwen3-0.6B, basado en transformer Qwen3 |
| Parámetros totales | 0,6B en el modelo base; el adaptador añade pesos de rango 16 (número exacto de parámetros del adaptador no disponible) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó secuencias de 256 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Skywork-Reward-V2-Qwen3-0.6B, un reward model derivado de Qwen3 que produce puntuaciones escalares de calidad de respuesta. El ajuste es un LoRA con rango 16 y alpha 32, entrenado durante una sola época con secuencias de 256 tokens. La función de pérdida combina Bradley-Terry (BT) y BCE pointwise en proporción 1:1, sin centrado de logits, una elección que según la model card busca preservar la calibración absoluta de las puntuaciones además del orden relativo entre pares.

El aspecto metodológico más destacable es el diseño "intent-agnostic": el conjunto de entrenamiento excluye deliberadamente las intenciones VENDOR_VERIFY y THREAT_IP_REPUTATION, de modo que la evaluación pairwise sobre esas categorías mide generalización a distribuciones no vistas. El autor reporta una precisión pairwise del 0,9703 (261 de 269 pares) frente al 0,8513 (229 de 269) del modelo zero-shot, con un delta de +0,1190. En la métrica de juez con umbral, la media sigmoidea pasa de 0,3444 a 0,9994 para Judge-10 y de 0,0476 a 0,0821 para Judge-0, lo que indica una separación mucho más marcada entre respuestas buenas y malas. No se especifica el volumen total de tokens de entrenamiento ni la composición completa del dataset más allá de las exclusiones mencionadas.

## Capacidades

- Puntuación de recompensa: genera una señal escalar de calidad para pares de respuestas, orientada a evaluación y alineamiento.
- Ranking pairwise: ordena respuestas según preferencia, con precisión reportada de 0,9703 en intenciones no vistas.
- Generalización intent-agnostic: mantiene rendimiento en categorías excluidas del entrenamiento (VENDOR_VERIFY, THREAT_IP_REPUTATION).
- Calibración de puntuaciones: la pérdida sin centrado busca conservar la escala absoluta de los logits, no solo el orden.
- Clasificación por umbral: los datos de Judge-10 y Judge-0 sugieren uso como juez binario o multinivel con umbrales calibrados.
- Generación de texto: no es su función; el modelo base es un reward model, no un modelo generativo de uso general.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Vision, audio o thinking mode: no disponible.

## Casos de uso

- Evaluación de respuestas en dominios no vistos: el adaptador sirve para puntuar salidas de un LLM en categorías que no aparecieron en su entrenamiento, aprovechando la mejora de +0,1190 en precisión pairwise sobre el modelo zero-shot.
- Filtrado de datos sintéticos: en pipelines de generación de datasets, el reward model puede descartar respuestas de baja calidad antes de incluirlas en el corpus de entrenamiento, usando la puntuación sigmoidea como criterio de corte.
- Juez automático en pruebas A/B de modelos: para comparar dos versiones de un asistente, el adaptador ordena pares de respuestas y reduce el coste frente a evaluación humana, con la cautela de que el autor lo marca como no apto para producción.
- Detección de respuestas problemáticas en dominios de riesgo: aunque las intenciones VENDOR_VERIFY y THREAT_IP_REPUTATION se excluyeron del entrenamiento, la evaluación reportada sobre ellas permite estudiar la transferencia de la señal de recompensa a casos de seguridad.
- Investigación en calibración de reward models: la combinación BT + BCE pointwise sin centrado es un punto de partida reproducible para estudiar cómo afecta la función de pérdida a la escala absoluta de las puntuaciones.
- Prototipado de sistemas de RLHF a pequeña escala: con 0,6B de parámetros, el modelo cabe en una GPU de consumo y permite iterar sobre pipelines de preferencia sin infraestructura dedicada, siempre en entornos de experimentación.
- Análisis de robustez frente a cambios de distribución: útil para medir cuánto degrada un reward model cuando el tráfico de entrada se aleja del conjunto de entrenamiento.

## Benchmarks y rendimiento

| Métrica | Zero-shot | Adaptador LoRA | Delta |
|---|---|---|---|
| Precisión pairwise en intenciones no vistas | 0,8513 (229/269) | 0,9703 (261/269) | +0,1190 |
| Judge-10, media sigmoidea | 0,3444 | 0,9994 | +0,6550 |
| Judge-0, media sigmoidea | 0,0476 | 0,0821 | +0,0345 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el modelo es un reward model y no un modelo generativo evaluable con esas pruebas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 0,6B de parámetros en fp16, en torno a 1,2 GB de pesos; en 8 bits, aproximadamente 0,6 GB; en 4 bits, unos 0,3 GB. Estas cifras son estimaciones por tamaño y no proceden de la model card.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, aunque las de gama alta están sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas con 4 GB o más, incluidas GTX 1650, RTX 3050 y superiores.
- Opciones de despliegue: el adaptador está en safetensors y requiere cargarse junto al modelo base Skywork-Reward-V2-Qwen3-0.6B; son aplicables frameworks de inferencia compatibles con transformers y PEFT, así como vLLM o TGI si se fusiona el adaptador con el base. No se documenta compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| skywork-reward-v2-0.6b-lora-general-holdout-vendor-threat | 0,6B + LoRA r=16 | no disponible | no disponible | Hugging Face, marcado como privado | Adaptador experimental, no apto para nodos |
| Skywork-Reward-V2-Qwen3-0.6B (base) | 0,6B | no disponible | no disponible | Hugging Face | Punto de partida zero-shot del adaptador |
| Reward models de mayor tamaño de la familia Skywork-Reward-V2 | no disponible | no disponible | no disponible | Hugging Face | Alternativa con más capacidad, sin datos concretos en esta ficha |

No se dispone de información suficiente para comparar con alternativas de otros autores (por ejemplo, ArmoRM, Nemotron-4-340B-Reward o Prometheus) en parámetros, contexto y rendimiento verificables dentro de esta ficha.

## Limitaciones y advertencias

- El autor declara el modelo como privado y "not for node deployment": no debe usarse como componente de producción sin una validación independiente.
- El repositorio no declara licencia, lo que impide determinar si el uso comercial está permitido; hay que contactar con el autor antes de cualquier explotación.
- No se especifican idiomas soportados; el comportamiento multilingüe es desconocido.
- El entrenamiento usó secuencias de 256 tokens, por lo que la evaluación de respuestas largas queda fuera de la distribución observada.
- Los resultados reportados (0,9703 pairwise, 0,9994 en Judge-10) proceden de un único conjunto de evaluación de 269 pares y no han sido replicados de forma independiente.
- La métrica Judge-10 con media sigmoidea de 0,9994 sugiere una posible saturación de la escala; conviene verificar la calibración en datos propios antes de fijar umbrales.
- Riesgo de sesgo y alucinación: no evaluado en la información disponible; al ser un reward model, puede amplificar sesgos presentes en sus datos de preferencia.
- El adaptador excluye intenciones concretas (VENDOR_VERIFY, THREAT_IP_REPUTATION) del entrenamiento; su comportamiento en esos dominios se basa en transferencia y no en ajuste directo.
- El tamaño del repositorio es de 0,0 GB, lo que puede indicar que los pesos no están completamente subidos o que la medición de Hugging Face no los contabiliza; verificar antes de descargar.

## Enlaces

- Hugging Face: https://huggingface.co/316usman/skywork-reward-v2-0.6b-lora-general-holdout-vendor-threat
- Modelo base Skywork-Reward-V2-Qwen3-0.6B: no disponible en la información proporcionada
- Paper de Skywork-Reward-V2: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible en la información proporcionada
