# jensjepsen/danish-lm-400m-grpo-mixed3-combinedv4-lr1.25e-6

## Resumen

El modelo `jensjepsen/danish-lm-400m-grpo-mixed3-combinedv4-lr1.25e-6` es un ajuste fino por refuerzo (GRPO) de un modelo de lenguaje de 400 millones de parámetros especializado en danés, desarrollado por el usuario independiente jensjepsen. Parte del checkpoint base `jensjepsen/danish-lm-400m-sft-v31-avg-top3` (un modelo SFT previo) y lo entrena con una mezcla equilibrada de tres tareas: seguimiento de instrucciones, razonamiento matemático (GSM8K) y generación de JSON con esquema. El resultado son tres checkpoints intermedios (step-22625, step-22500 y step-23750) que muestran mejoras sustanciales en la capacidad de seguir instrucciones en danés respecto a la base SFT, aunque con resultados mixtos en otras tareas.

El modelo está pensado para la comunidad de habla danesa, ya que su idioma de entrenamiento es exclusivamente danés (código `da`). Su relevancia radica en ser uno de los pocos modelos abiertos de tamaño pequeño (400M) optimizados específicamente para danés mediante técnicas modernas de RL (GRPO con DAPO), lo que permite desplegarlo en entornos con recursos limitados. La arquitectura subyacente no se especifica en la documentación, pero por el nombre y el formato safetensors se infiere un transformer decoder tipo Llama, aunque no se confirma. La longitud de contexto tampoco se documenta; el nombre del run de wandb sugiere un máximo de 768 tokens, pero no es un dato oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer decoder tipo Llama, sin confirmar) |
| Parametros totales | 400 millones (inferido del nombre) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el run de entrenamiento usaba `maxtok768`, pero no es un dato oficial) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos en safetensors, probablemente F32 o BF16) |
| Idiomas soportados | danés (da) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se documenta en la model card. Por el nombre del modelo (400m) y la presencia de archivos safetensors, se trata de un transformer decoder de 400 millones de parámetros, probablemente similar a Llama, pero no se confirma. El entrenamiento parte del checkpoint `jensjepsen/danish-lm-400m-sft-v31-avg-top3`, un modelo ya ajustado por supervisión (SFT) en danés.

El ajuste fino por refuerzo utiliza GRPO (Group Relative Policy Optimization) con una mezcla 1:1:1 de tres tareas: seguimiento de instrucciones (dataset `jensjepsen/danish-if-grpo-combined-v4`, 10k filas), razonamiento matemático (GSM8K) y generación de JSON con esquema. Se emplea la variante DAPO con resampling de prompts frescos y coincidencia de tarea (`GRPO_DAPO_RESAMPLE=1`, `GRPO_DAPO_FRESH_PROMPTS=1`, `GRPO_DAPO_FRESH_MATCH_TASK=1`). La pérdida es `dr_grpo`, con un coeficiente KL de 0.005, learning rate de 1.25e-6 y warmup de 10 pasos. El entrenamiento se detuvo en el paso 23823 de 89709 (~27% del total, 10h40m de tiempo de pared). Se usó vLLM en modo colocado con 40% de memoria GPU.

## Capacidades

- Seguimiento de instrucciones en danés: mejora significativa respecto a la base SFT en las métricas de IFEval (prompt-strict pasa de 21.2 a 45.1 en el mejor checkpoint).
- Razonamiento matemático básico: resuelve problemas de GSM8K con un pass@1 de ~28% (frente al 17.4% de la base).
- Generación de JSON con esquema: obtiene una recompensa media de 1.072 en la tarea JSON, aunque no se compara con la base.
- Comprensión lectora y conocimiento general: puntuaciones moderadas en ARC-easy (~40%), ARC-challenge (~28%), OpenBookQA (~36%) y PIQA (~52-57%).
- Resumen y reescritura de texto: métricas ChrF++ de ~41 y ~48 respectivamente, similares a la base.
- Chat en formato conversacional: usa la plantilla `<|user|>{prompt}<|end|><|assistant|>{answer}<|end|>`.
- No se documenta soporte para tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Atención al cliente automatizada en danés: el modelo puede gestionar conversaciones multi-turno siguiendo instrucciones del operador, gracias a su mejora en IFEval. Su tamaño de 400M permite desplegarlo en servidores modestos o incluso en edge.
- Generación de respuestas estructuradas en JSON: útil para extraer información de textos daneses y convertirla en formatos legibles por máquina, por ejemplo para formularios o integraciones con APIs.
- Asistente de estudio para estudiantes daneses: puede responder preguntas de comprensión lectora (SCI-Q, OpenBookQA) y ayudar con problemas matemáticos sencillos de nivel escolar.
- Resumen automático de documentos daneses: con métricas ChrF++ de ~41, puede resumir artículos, informes o correos en danés, aunque con calidad moderada.
- Reescritura de texto en danés: para parafrasear o mejorar redacción, con ChrF++ de ~48, útil en herramientas de edición.
- Prototipado de chatbots en danés: al ser un modelo abierto con licencia MIT, se puede integrar en aplicaciones de demostración o productos comerciales sin restricciones de licencia.

## Benchmarks y rendimiento

La model card reporta evaluaciones 0-shot con greedy decoding (temperatura 1, sin beams, repetición penalizada 1.1) en formato chat, sobre los splits de test completos. Se comparan los tres checkpoints con la base SFT (v31). Los datos son los siguientes:

| Eval | Metrica | step-22625 | step-22500 | step-23750 | v31 SFT base |
|---|---|---|---|---|---|
| ifeval-da | prompt-strict | 45.1 | 45.5 | 43.8 | 21.2 |
|  | prompt-loose | 46.6 | 47.3 | 45.1 | 22.0 |
|  | inst-strict | 60.3 | 61.2 | 59.1 | 35.2 |
|  | inst-loose | 61.3 | 62.4 | 60.2 | 35.8 |
| ifbench-da | prompt-strict | 10.0 | 10.3 | 11.0 | — |
|  | prompt-loose | 14.7 | 15.0 | 15.0 | — |
|  | inst-strict | 11.3 | 12.2 | 12.2 | — |
|  | inst-loose | 16.9 | 17.4 | 16.9 | — |
| gsm8k | pass@1 | 27.79 | 28.47 | 27.94 | 17.39 |
| json | mean_reward | 1.072 | 1.072 | 1.072 | — |
| sciq-gen | pass@1 | 13.60 | 13.10 | 13.60 | 13.50 |
| sciq-mc | acc | 58.10 | 58.30 | 58.20 | — |
| cit-gen | acc | 28.2 | 28.2 | 27.6 | 29.86 |
| cit-mc | acc | 49.0 | 48.6 | 49.0 | 48.19 |
| arc-easy | chat-MC acc | 40.32 | 39.98 | 40.40 | 44.40 |
| arc-challenge | chat-MC acc | 28.07 | 27.82 | 28.16 | 29.35 |
| openbookqa | chat-MC acc | 36.80 | 35.40 | 36.60 | 35.40 |
| piqa | chat-MC acc | 52.00 | 53.00 | 57.00 | 53.00 |
| textman-summary | ChrF++ | 41.37 | 41.26 | 40.57 | 41.11 |
| textman-rewrite | ChrF++ | 47.67 | 47.82 | 48.16 | 46.51 |

Notas: piqa usa n=100; los demás splits son completos. ifbench-da se puntúa con verificadores adaptados al danés. La métrica `format:sub-bullets` de ifbench es poco fiable (según la model card). Hay fallos de parseo en MC (arc-easy 97/2376, arc-challenge 22/1172, openbookqa 0/500).

## Requisitos de hardware

- VRAM estimada: un modelo de 400M en FP32 ocupa ~1.6 GB; en FP16/BF16 ~800 MB; en cuantización 8-bit ~400 MB; en 4-bit ~200 MB. Cabe en cualquier GPU consumer moderna (RTX 3060, 4060, etc.) e incluso en CPU con llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16, o 1 GB para cuantización 4-bit. Para entrenamiento se usó vLLM con 40% de memoria GPU, lo que sugiere que una GPU de 8-12 GB es suficiente para inferencia.
- Opciones de despliegue: al ser safetensors, se puede convertir a GGUF para usar con llama.cpp u Ollama, o servir con vLLM, TGI o text-generation-inference. También se puede cargar con transformers de HuggingFace.
- Latencia y throughput: no se proporcionan datos oficiales. Para un modelo de 400M, se espera una latencia de decodificación de ~10-20 ms/token en GPU consumer y un throughput de cientos de tokens por segundo en lote.

## Comparativa con modelos similares

El autor ha publicado otros checkpoints del mismo experimento, como `jensjepsen/danish-lm-400m-grpo-mixed3-combinedv4-topk` (que probablemente contiene los mismos top-3) y `jensjepsen/danish-lm-400m-grpo-mixed3-intermediary-step1500` (un checkpoint intermedio). No se dispone de comparativas con otros modelos daneses de tamaño similar en la información proporcionada. Se puede comparar con la base SFT `jensjepsen/danish-lm-400m-sft-v31-avg-top3`, que es el punto de partida y muestra claramente la mejora en IFEval (de 21.2 a 45.1) a costa de una ligera caída en ARC-easy (de 44.4 a 40.3). No hay datos de otros modelos externos.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en danés; no es adecuado para otros idiomas.
- Tamaño reducido (400M) limita el razonamiento complejo: GSM8K solo alcanza ~28% y ARC-challenge ~28%, lo que indica dificultades con tareas que requieren múltiples pasos.
- Las puntuaciones de ifbench-da son bajas (prompt-strict ~10%), lo que sugiere que el seguimiento de instrucciones detalladas aún es débil.
- La métrica `format:sub-bullets` de ifbench es poco fiable según la propia model card, por lo que los valores de ifbench deben interpretarse con cautela.
- No se documenta la longitud de contexto; el run de entrenamiento usaba `maxtok768`, lo que sugiere un límite de 768 tokens, pero no es un dato oficial.
- El modelo no ha sido evaluado en tareas de generación de código, tool calling ni agentes; no se recomienda para esos usos.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo puede contener sesgos derivados de los datos de entrenamiento, no documentados.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un modelo experimental sin validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jensjepsen/danish-lm-400m-grpo-mixed3-combinedv4-lr1.25e-6
- Modelo base SFT: https://huggingface.co/jensjepsen/danish-lm-400m-sft-v31-avg-top3
- Dataset de instrucciones: https://huggingface.co/datasets/jensjepsen/danish-if-grpo-combined-v4
- Checkpoint top-k (variante): https://huggingface.co/jensjepsen/danish-lm-400m-grpo-mixed3-combinedv4-topk
- Checkpoint intermedio: https://huggingface.co/jensjepsen/danish-lm-400m-grpo-mixed3-intermediary-step1500
