# denizakkoc/BAGEL-GRPO-RushHour-BRAID-VLM-Judge-1648869

## Resumen

BAGEL-GRPO-RushHour-BRAID-VLM-Judge-1648869 es un conjunto de ocho checkpoints LoRA de final de época publicados por el usuario denizakkoc, resultado de un experimento de aprendizaje por refuerzo (GRPO) sobre el modelo multimodal BAGEL, afinado previamente con SFT sobre 1.000 puzles del juego Rush Hour. El modelo no es un modelo base autónomo, sino un artefacto de investigación: adaptadores entrenables en formato propietario de BAGEL (`trainable_weights.pt`) que requieren el modelo SFT de referencia (`denizakkoc/BAGEL-SFT-rushhour1000-Merged-0000600`) y la arquitectura BAGEL-Canvas para cargarse.

El experimento evalúa si una retroalimentación perceptiva densa procedente de un juez VLM congelado (Qwen3-VL-32B-Instruct servido con vLLM) puede mejorar la política sin proporcionarle transiciones exactas del simulador ni estados intermedios de referencia. La política genera texto de razonamiento y acciones intercaladas con imágenes del tablero, y ambas cabezas (texto e imagen) reciben la misma ventaja combinada. Es relevante para investigadores interesados en RL multimodal con recompensas visuales densas, ablaciones de diseño de recompensa y entrenamiento de razonamiento visual multi-paso.

El repositorio ocupa 10,3 GB y contiene los checkpoints de las épocas cero a siete (1 a 8 épocas completadas) de la ejecución 1648869, con semilla 42. La asignación original de tres días expiró durante la época 8, por lo que el objetivo de continuación son diez épocas totales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BAGEL (modelo multimodal de generación y comprensión con arquitectura BAGEL-Canvas); adaptadores LoRA sobre proyecciones de atención y MLP en ambos expertos |
| Parametros totales | no disponible (el adaptador LoRA entrenable pesa 1.292.142.651 bytes en FP32) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en FP32 para parámetros entrenables) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | `trainable_weights.pt` (snapshots de parámetros entrenables en formato BAGEL, no son adaptadores PEFT estándar ni modelos fusionados) |

## Arquitectura y entrenamiento

El modelo parte del SFT `BAGEL-SFT-rushhour1000-Merged-0000600` (revisión `57af4a89928fc13e3b3b50afedc46d9744a61d06`) y aplica GRPO con LoRA de rango 64, alpha 128 y dropout 0 sobre las proyecciones de atención y MLP tanto del experto de generación como del de comprensión. El entrenamiento usa 12 rollouts por prompt, actualizaciones de trayectoria completa, dataset fragmentado en ocho rangos de política con promediado de parámetros tras cada actualización de prompt, learning rate de imagen `5e-5`, learning rate de texto `3e-5`, coeficiente KL `1e-4`, resolución 512, 15 pasos de denoising, ventana SDE de tamaño 3 y temperatura de texto 1,5.

La innovación principal es el diseño de recompensa inspirado en BRAID (§4.4 y apéndice A.4). Un juez VLM congelado (Qwen3-VL-32B-Instruct, revisión `0cfaf48183f594c314753d30a4c4974bc75f3ccb`, servido con vLLM a temperatura 0 y máximo 128 tokens) puntúa cuatro criterios en el rango [1, 10] con peso 0,25 cada uno tras normalización: `action_correctness`, `visual_faithfulness`, `reasoning_contribution` y `misleading_risk` (donde 10 es seguro y 1 es engañoso). El juez solo ve la imagen previa visible, el texto candidato de razonamiento/acción y la nueva imagen generada; no recibe solución de referencia, metadatos del tablero, estados del simulador ni comprobaciones de transición. La ventaja compartida para la trayectoria `i` y turno `t` es `A(i,t) = z_accuracy(graded_terminal_accuracy_i) + z_syntax(syntax_i,t) + 0.25 * sum_c z_visual_c(score_i,t,c)`, con precisión terminal no binaria (hasta 0,5 por fracción de bloqueadores finales despejados) que nunca se suministra al juez. La pérdida recorta la magnitud de la ventaja en 5.

El cómputo empleó ocho GPU H200 para la política y ocho GPU H200 para cuatro réplicas del juez (tensor parallel size 2), distribuidas en ocho nodos.

## Capacidades

- Generación de razonamiento visual multi-paso intercalado con imágenes del tablero en el dominio específico de puzles Rush Hour.
- Producción de acciones textuales y representaciones visuales del estado del tablero de forma conjunta.
- Razonamiento guiado por retroalimentación perceptiva densa de un juez VLM (diseño experimental, no una capacidad desplegable del checkpoint).
- Entrenamiento con GRPO sobre recompensas compuestas (precisión terminal, sintaxis y cuatro criterios visuales).
- Soporte de tool calling: no disponible.
- Soporte de agentes generales: no disponible.
- Capacidades multilingües: limitadas a inglés según la model card.
- Modo thinking, visión o audio fuera del dominio Rush Hour: no disponible.

## Casos de uso

- Investigación en RL multimodal con recompensas visuales densas: el checkpoint sirve para reproducir y analizar la ablación del juez VLM frente a diseños de recompensa alternativos, comparando curvas de entrenamiento entre las épocas 0 y 7.
- Estudio de recompensas no binarias en tareas de planificación: la precisión terminal graduada (hasta 0,5 por bloqueadores despejados) permite analizar cómo señales parciales afectan al aprendizaje en puzles de deslizamiento.
- Ablación de jueces VLM congelados: el manifiesto `judge_manifest.json` documenta prompt, esquema JSON y ajustes de decodificación, lo que facilita replicar el juez con otras variantes o revisiones.
- Análisis de estabilidad de LoRA en modelos multimodales: los ocho checkpoints de época permiten trazar la evolución de los pesos entrenables y detectar divergencias o sobreajuste.
- Desarrollo de pipelines de entrenamiento distribuido: la configuración (12 rollouts, ocho rangos de política, promediado de parámetros, cuatro réplicas del juez) sirve como referencia para montar infraestructuras GRPO con H200.
- Evaluación de fidelidad visual en generación condicionada: los criterios `visual_faithfulness` y `misleading_risk` pueden reutilizarse como rúbrica para medir si un modelo preserva evidencia visual relevante en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que esta release no proporciona una evaluación final sobre los 250 puzles reservados ni establece superioridad sobre otros diseños de recompensa; solo se monitorizaron 100 puzles de forma periódica durante el entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base BAGEL completo, no solo del adaptador de 1,29 GB.
- GPU recomendadas: el entrenamiento usó H200 (ocho para política, ocho para el juez); para inferencia se requiere hardware capaz de ejecutar BAGEL-Canvas, no especificado en la información.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible para los checkpoints LoRA; el juez se sirvió con vLLM, pero los adaptadores no son directamente desplegables sin fusionarlos con el modelo base BAGEL.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BAGEL-GRPO-RushHour-BRAID-VLM-Judge-1648869 | no disponible (adaptador LoRA de 1,29 GB) | no disponible | `trainable_weights.pt` (BAGEL) | apache-2.0 | Hugging Face, 0 descargas |
| BAGEL-SFT-rushhour1000-Merged-0000600 | no disponible | no disponible | modelo fusionado BAGEL | no disponible | Hugging Face (base de este experimento) |
| Qwen3-VL-32B-Instruct | 32B (según denominación) | no disponible | safetensors (probable) | no disponible | Hugging Face (juez congelado) |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el SFT base exacto y la arquitectura BAGEL-Canvas; no funciona como adaptador PEFT estándar con `save_pretrained`.
- Dominio extremadamente estrecho: solo puzles Rush Hour, en inglés.
- Sin evaluación final: no hay resultados sobre los 250 puzles reservados ni comparación rigurosa con brazos de referencia emparejados.
- El juez VLM puede hacer inferencias visuales propias y no recibe verdad de referencia, por lo que la señal de recompensa puede ser ruidosa o estar sesgada.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria.
- Entrenamiento incompleto: la época 8 se interrumpió en el paso 3200 (56/125 actualizaciones de prompt); el objetivo de diez épocas no se alcanzó en esta release.
- Licencia apache-2.0 declarada, pero conviene verificar las condiciones del modelo base BAGEL y del juez Qwen3-VL-32B-Instruct antes de uso comercial.
- Riesgo de alucinación visual y de sobreajuste a la rúbrica del juez; no apto para producción sin validación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/denizakkoc/BAGEL-GRPO-RushHour-BRAID-VLM-Judge-1648869
- Modelo base SFT: https://huggingface.co/denizakkoc/BAGEL-SFT-rushhour1000-Merged-0000600
- Juez VLM: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Paper BRAID: https://arxiv.org/abs/2607.03748
