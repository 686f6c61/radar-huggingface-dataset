# Manprot/MP-02-16B-Preview

## Resumen

MP-02 16B Preview es un modelo de chat multimodal desarrollado por el equipo Manprot, presentado como una versión podada y "sanada" (healing) de zai-org/GLM-5.3-Flash. Se trata de un transformer con capas MoE en el que se ha reducido drásticamente el número de expertos enrutados por capa, de 288 a 8, lo que elimina aproximadamente el 97% de los expertos del modelo base. El resultado es un modelo de 16,06B parámetros en las capas del transformer y 18,28B totales contando embeddings, LM head, cabeza MTP y codificador de visión.

El modelo mantiene la arquitectura `glm5_next` del base, incluido el experto compartido, la atención, las tres capas densas, la cabeza MTP y el codificador de visión, y ha sido reentrenado mediante LoRA sobre 22,9M tokens de conversaciones generadas por GLM-5.3 y GLM-5.3-Flash. Su pipeline es image-text-to-text y está orientado a chat y roleplay, aunque el propio autor advierte que es una preview "áspera" que ha perdido buena parte del conocimiento y la capacidad de razonamiento del modelo original.

Es relevante ahora porque ilustra una técnica de compresión agresiva de MoE (podado de expertos estilo REAP seguido de healing) para obtener modelos desplegables en hardware mucho más modesto, con licencia MIT y pesos disponibles en safetensors y GGUF. No obstante, el autor es explícito: no es un sustituto de GLM-5.3-Flash.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3-Flash (`glm5_next`), transformer con capas MoE; podado de 288 a 8 expertos enrutados por capa |
| Parametros totales | 18.277.182.550 (18,28B); 16,06B en capas del transformer, 1,27B en embeddings y LM head, 0,39B en cabeza MTP, 0,56B en codificador de visión |
| Parametros activos | no disponible (el número de expertos enrutados activos por token no se especifica en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se publican pesos GGUF, pero no se detallan los tipos concretos) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT (se conserva el aviso de copyright de Z.ai en `LICENSE`) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de GLM-5.3-Flash en FP8 y aplica un podado de expertos de estilo REAP: en cada una de las 42 capas MoE se conservan los 8 expertos enrutados con mayor norma de salida ponderada por el router (gate × ‖salida del experto‖), medida sobre un conjunto de calibración de 102k tokens. Las filas del router se recortan en consecuencia. El experto compartido, la atención, las tres capas densas, la cabeza MTP y el codificador de visión quedan intactos. La pérdida en held-out inmediatamente después del podado fue de 3,725.

El healing se realizó en dos etapas. La primera empleó LoRA (rango 64, alpha 128) sobre todas las proyecciones de atención y MLP, incluidos los expertos enrutados, con routers entrenados por completo, AdamW, learning rate 1e-4, warmup y decaimiento coseno, fragmentos de 2.048 tokens y pérdida solo en turnos del asistente: 174 pasos y 10,9M tokens, bajando la pérdida en held-out de 3,725 a 2,105. La segunda etapa continuó desde la primera con un optimizador nuevo sobre 12,1M tokens adicionales (sin repetir conversaciones de la etapa 1), learning rate 8e-5 y 193 pasos, con pérdida en held-out de 2,449 a 2,218 sobre un conjunto nuevo. El checkpoint publicado corresponde a esta segunda etapa. No hubo preentrenamiento propio y los dos conjuntos de held-out difieren, por lo que sus pérdidas no son comparables entre sí.

## Capacidades

- Generación de texto conversacional y roleplay, el punto fuerte declarado de esta preview.
- Modo "thinking" (razonamiento explícito), aunque el autor advierte de pensamientos excesivamente largos.
- Procesamiento de imagen y texto (pipeline image-text-to-text), gracias al codificador de visión conservado del modelo base.
- Generación de código y salidas estructuradas, presentes en los datos de healing.
- Ejecución de agentes y tool calling: se incluyen varios datasets de function calling y trayectorias de agente en formato de herramientas de GLM-5.3.
- Razonamiento multi-paso y trazas de tipo terminal/bug-fix, incorporadas vía datasets de trayectorias SWE-smith.
- Capacidad multilingüe limitada al inglés según la metadata del modelo.

## Casos de uso

- Chat conversacional y roleplay: es el escenario para el que el autor declara un rendimiento "decente"; el modelo puede mantener diálogos multi-turno con un coste de inferencia muy inferior al de GLM-5.3-Flash.
- Prototipado rápido de asistentes con visión: al conservar el codificador de visión y el pipeline image-text-to-text, permite experimentar con entrada de imagen y texto en un modelo de menos de 19B parámetros.
- Pruebas de pipelines de agentes y function calling: los datos de healing incluyen varios conjuntos de function calling y trayectorias de agente, útiles para validar integraciones de herramientas en entornos de desarrollo.
- Evaluación de técnicas de podado de MoE: sirve como caso de estudio reproducible (REAP + LoRA healing) para investigadores que estudien compresión de modelos.
- Despliegue en hardware de gama alta consumer: con pesos GGUF y 18,28B parámetros totales, es candidato para inferencia local en GPUs con suficiente VRAM, algo inviable con el modelo base completo.
- Generación de código asistida en entornos controlados: los datasets de coding y trayectorias de bug-fix permiten usarlo en tareas de autocompletado o corrección, siempre con revisión humana dada su tasa de error.
- Experimentación académica con licencia permisiva: la licencia MIT facilita su uso en investigación y en productos derivados sin las restricciones habituales de otros modelos.

## Benchmarks y rendimiento

El autor reporta una media de 51,29 en una evaluación de 7 tareas, aproximadamente 3 puntos por encima de MP-01 100M Preview. No se detallan las tareas individuales ni se comparan con el modelo base en la información disponible.

| Metrica | MP-02 16B Preview | MP-01 100M Preview |
|---|---|---|
| Media en 7 tareas | 51,29 | ~48,3 (inferido de "unos 3 puntos por debajo") |
| Pérdida held-out tras podado | 3,725 | no disponible |
| Pérdida held-out tras etapa 1 | 2,105 | no disponible |
| Pérdida held-out tras etapa 2 | 2,218 (conjunto distinto) | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 18,28B parámetros totales, en FP16 requeriría aproximadamente 36,6 GB solo para pesos, y en cuantizaciones de 8 bits o 4 bits bajaría a rangos de ~18 GB y ~9-10 GB respectivamente (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, GPUs de 24 GB o más (RTX 4090, A100 40/80 GB, H100) serían las candidatas naturales en FP16, y GPUs consumer de 12-16 GB podrían bastar con cuantización agresiva.
- Cabe en consumer GPU: probablemente sí con cuantización GGUF, aunque no se confirma en la documentación.
- Opciones de despliegue: se publican pesos GGUF, lo que habilita llama.cpp y presumiblemente Ollama; la librería indicada es transformers, y el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| MP-02 16B Preview | 18,28B totales (16,06B transformer) | no disponible | MIT | Preview, pesos safetensors y GGUF |
| zai-org/GLM-5.3-Flash (base) | no disponible (288 expertos por capa) | no disponible | MIT | Modelo base completo |
| MP-01 100M Preview (misma familia) | ~100M | no disponible | no disponible | Preview |

La comparación con GLM-5.3-Flash es la más relevante: MP-02 conserva solo 8 de 288 expertos por capa, lo que reduce drásticamente el tamaño a costa de conocimiento y razonamiento. Frente a MP-01 100M Preview, MP-02 es mucho mayor y obtiene una media de 51,29 frente a unos 48,3 en las 7 tareas reportadas. No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El autor califica el modelo como preview "áspera": el podado del 97% de los expertos le costó buena parte del conocimiento y razonamiento de GLM-5.3-Flash.
- Se esperan hechos incorrectos, aritmética rota, pensamientos excesivamente largos y bucles ocasionales.
- No es un sustituto de GLM-5.3-Flash y no debería usarse en producción crítica sin validación exhaustiva.
- Idioma limitado al inglés según la metadata; no se declara soporte multilingüe.
- Longitud de contexto no documentada, lo que dificulta planificar despliegues con ventanas largas.
- Riesgo de alucinación elevado por la pérdida de conocimiento tras el podado.
- Sesgos: no se documentan sesgos específicos, pero los datos de healing provienen de salidas de GLM-5.3 y de datasets de roleplay, lo que puede arrastrar los sesgos de esas fuentes.
- Licencia MIT permisiva, también para uso comercial, conservando el aviso de copyright de Z.ai.
- Los datos de entrenamiento no se redistribuyen.
- Las pérdidas de las dos etapas de healing se midieron sobre conjuntos distintos y no son comparables entre sí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Manprot/MP-02-16B-Preview
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Modelo hermano MP-01 100M Preview: https://huggingface.co/Manprot/MP-01-100M-Preview
- Perfil de la organización Manprot (modelos): https://huggingface.co/Manprot/models
- Perfil de la organización Manprot (datasets): https://huggingface.co/Manprot/datasets
- Dataset Zek-Takai/glm53-flash-harvest: https://huggingface.co/datasets/Zek-Takai/glm53-flash-harvest
- Dataset shanjiaz/glm-5.3-flash-open-perfectblend-regen-25pct: https://huggingface.co/datasets/shanjiaz/glm-5.3-flash-open-perfectblend-regen-25pct
- Dataset best-distill/glm-5.3-flash-distillation-chat: https://huggingface.co/datasets/best-distill/glm-5.3-flash-distillation-chat
- Dataset open-athena/GLM-5.3-RLVR1-Training-Rollouts-2026.09.25: https://huggingface.co/datasets/open-athena/GLM-5.3-RLVR1-Training-Rollouts-2026.09.25
- Dataset sollamon/ox-alpha-glm-5.3-flash-distillation-coding-17k-raw: https://huggingface.co/datasets/sollamon/ox-alpha-glm-5.3-flash-distillation-coding-17k-raw
- Dataset open-athena/GLM-5.3-tmax-swesmith-k8-traces-2026.10: https://huggingface.co/datasets/open-athena/GLM-5.3-tmax-swesmith-k8-traces-2026.10
- Dataset liangzhidanta/claude-code-glm53-swesmith-trajectories: https://huggingface.co/datasets/liangzhidanta/claude-code-glm53-swesmith-trajectories
- Dataset liangzhidanta/claude-code-glm53-swesmith-compact-trajectories: https://huggingface.co/datasets/liangzhidanta/claude-code-glm53-swesmith-compact-trajectories
- Dataset kaivoss/UltraData-SFT-Agent-2609-GLM53-20k: https://huggingface.co/datasets/kaivoss/UltraData-SFT-Agent-2609-GLM53-20k
