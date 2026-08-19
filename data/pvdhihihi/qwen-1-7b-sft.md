# pvdhihihi/qwen-1.7b-sft

## Resumen

`pvdhihihi/qwen-1.7b-sft` es un ajuste fino (SFT) del modelo base `Qwen/Qwen3-1.7B-Base` realizado sobre el dataset `HuggingFaceH4/deita-10k-v0-sft`, un subconjunto de 10.000 muestras de alta calidad para entrenamiento supervisado de instrucciones. El modelo fue publicado por el usuario `pvdhihihi` en agosto de 2026 con licencia Apache 2.0 y está diseñado para dotar al modelo base de capacidades conversacionales y de seguimiento de instrucciones.

Con aproximadamente 1.720 millones de parámetros, es un modelo denso de tipo transformer que hereda la arquitectura Qwen3, incluyendo soporte nativo de modos de pensamiento (thinking) y no pensamiento (non-thinking), así como una ventana de contexto de hasta 32.000 tokens. Su pequeño tamaño lo hace adecuado para despliegue en hardware de consumo y entornos con recursos limitados.

La relevancia de este modelo radica en su doble utilidad: por un lado, como punto de partida para experimentación en técnicas de alineación y ajuste fino con datasets curados como DEITA; por otro, como alternativa ligera de bajo coste para tareas de generación de texto e instrucción en producción. El nombre del artefacto en el model-index (`qwen3-1.7b-deita-sft-student`) sugiere que podría ser el resultado de un proceso de destilación, aunque no se proporcionan detalles al respecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) con GQA, SwiGLU y RoPE |
| Parametros totales | 1.720.574.976 (~1,72 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | no disponible (repo publicado en safetensors; cuantizaciones dependen de conversion del usuario) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-1.7B-Base`, un transformer denso de la familia Qwen3 que incorpora atención por grupos (GQA), activación SwiGLU y embeddings rotatorios (RoPE). Al ser un ajuste fino del modelo base, hereda la arquitectura completa, incluida la capacidad de alternar entre modos de razonamiento explícito (thinking) y respuesta directa (non-thinking), controlada mediante tokens especiales en el prompt.

El entrenamiento se realizó con el framework `alignment-handbook` sobre el dataset `HuggingFaceH4/deita-10k-v0-sft`, una selección de 10.000 ejemplos de instrucción de alta calidad. Los hiperparámetros documentados incluyen una tasa de aprendizaje de 3e-05, tamaño de lote total de 64 (32 por dispositivo en 2 GPUs), una única época, scheduler coseno con calentamiento del 10 % y optimizador AdamW. Se utilizaron Transformers 4.51.3, PyTorch 2.11.0 y Datasets 3.2.0. No se documenta el uso de técnicas adicionales como RLHF o DPO; el proceso se limita a supervisión directa sobre el dataset DEITA.

## Capacidades

- Generación de texto conversacional: el ajuste sobre DEITA dota al modelo base de capacidades de seguimiento de instrucciones y respuesta en formato diálogo.
- Razonamiento con modo thinking: hereda del modelo base Qwen3 la capacidad de generar cadenas de razonamiento explícitas antes de responder, activables mediante el token de pensamiento.
- Soporte de tool calling: heredado del modelo base Qwen3-1.7B, aunque no se ha verificado específicamente en este ajuste.
- Capacidades multilingües: el modelo base Qwen3 soporta múltiples idiomas, pero no se documentan los idiomas específicos para este ajuste.
- Generación de código y matemáticas: el modelo base Qwen3-1.7B destaca en estas áreas; el ajuste SFT no debería degradar estas capacidades, aunque no hay evaluaciones publicadas que lo confirmen.

## Casos de uso

- Asistentes conversacionales ligeros: con 1,72 B de parámetros, el modelo puede desplegarse en CPUs o GPUs de consumo para chatbots de atención al cliente o asistentes personales con presupuesto de cómputo reducido.
- Prototipado rápido de pipelines de IA generativa: al ser un ajuste SFT sobre un dataset conocido (DEITA), sirve como referencia para validar flujos de entrenamiento y evaluación antes de escalar a modelos mayores.
- Experimentación en alineación de modelos: investigadores pueden usar este checkpoint como punto de partida para aplicar DPO, RLHF o técnicas de destilación, dado que ya incorpora un primer paso de supervisión.
- Inferencia en el borde: su tamaño permite ejecución en dispositivos con 4-8 GB de VRAM, como Jetson o GPUs integradas, para tareas de generación de texto en entornos sin conexión.
- Generación de código asistida en entornos con recursos limitados: el modelo base Qwen3-1.7B tiene buen rendimiento en tareas de programación; este ajuste añade capacidades de instrucción para usarlo como asistente de código en IDE ligeros.
- Evaluación comparativa de datasets SFT: al estar entrenado exclusivamente sobre DEITA-10k, permite aislar el impacto de este dataset en el rendimiento frente a otros datasets de instrucción, útil para investigación metodológica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `model-index` de la model card declara el nombre `qwen3-1.7b-deita-sft-student` con una lista de resultados vacía, por lo que no existen métricas oficiales de MMLU, HumanEval, GSM8K u otros evaluaciones para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3,5 GB en FP16 (pesos), ~1,8 GB en INT8 y ~0,9 GB en INT4 (tras cuantización manual).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM. Compatible con RTX 3060, RTX 4060, RTX 4090, A10, A100, etc. También ejecutable en CPU con llama.cpp para inferencia lenta pero funcional.
- Ajuste en hardware de consumo: sí, cabe en GPUs de gama media e incluso en algunas integradas con cuantización agresiva.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, Hugging Face Inference Endpoints (el repo incluye la etiqueta `endpoints_compatible`) y Transformers con pipeline estándar.
- Latencia y throughput: no disponible; dependerán del hardware, la cuantización y el backend elegido. En una RTX 4090 con FP16, se puede esperar un throughput del orden de 100-200 tokens/s para un modelo de este tamaño, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `pvdhihihi/qwen-1.7b-sft` | 1,72 B | 32 K | Apache 2.0 | SFT sobre DEITA-10k; sin benchmarks publicados |
| `Qwen/Qwen3-1.7B-Instruct` | 1,72 B | 32 K | Apache 2.0 | Versión oficial con instrucción de Qwen; benchmarks publicados por el equipo de Qwen |
| `Qwen/Qwen3-1.7B-Base` | 1,72 B | 32 K | Apache 2.0 | Modelo base sin ajuste de instrucciones; punto de partida de este checkpoint |

La comparativa directa con `Qwen3-1.7B-Instruct` es la más relevante: ambos parten del mismo modelo base y tamaño, pero la versión oficial de Qwen ha sido entrenada con datasets propietarios más extensos y cuenta con evaluación publicada. Este checkpoint, al estar entrenado solo con 10.000 muestras, probablemente ofrezca menor calidad de seguimiento de instrucciones, aunque no hay datos que lo confirmen. Alternativas de otros fabricantes en el mismo rango de tamaño (p. ej., Llama-3.2-1B o Phi-3-mini) no se incluyen por falta de datos comparables en la información disponible.

## Limitaciones y advertencias

- Sin evaluación publicada: no existen benchmarks ni métricas de calidad que permitan validar el rendimiento del modelo en tareas estándar; úsese con cautela en producción.
- Dataset de entrenamiento reducido: solo 10.000 muestras de DEITA, lo que limita la cobertura de temas y la robustez frente a instrucciones fuera de distribución.
- Riesgo de alucinación: como todo modelo de 1,7 B, es propenso a generar contenido plausible pero incorrecto, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Sesgos potenciales: no se documentan evaluaciones de sesgo; el dataset DEITA puede arrastrar sesgos de los datos de origen.
- Model card incompleta: la documentación generada automáticamente no incluye descripción del modelo, usos previstos, limitaciones ni datos de evaluación; se recomienda contactar al autor para más detalles.
- Capacidades heredadas no verificadas: las funcionalidades de tool calling, modo thinking y multilingüismo se heredan del modelo base, pero no hay garantía de que el ajuste SFT las preserve íntegramente.
- Sin soporte oficial: es un modelo publicado por un usuario individual sin respaldo de un equipo de investigación; no hay canal de soporte ni garantía de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pvdhihihi/qwen-1.7b-sft
- Modelo base (Qwen/Qwen3-1.7B-Base): https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento (HuggingFaceH4/deita-10k-v0-sft): https://huggingface.co/datasets/HuggingFaceH4/deita-10k-v0-sft
- Página de Qwen3-1.7B en LM Studio (referencia de capacidades del modelo base): https://lmstudio.ai/models/qwen/qwen3-1.7b
- Repositorio Qwen3-ASR (proyecto relacionado del equipo Qwen, referencia de ecosistema): https://github.com/QwenLM/Qwen3-ASR
