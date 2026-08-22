# 23donge/bge-small-zh-guard-onnx

## Resumen

El modelo `23donge/bge-small-zh-guard-onnx` es un clasificador binario de prompts maliciosos (safe vs. unsafe) diseñado para proteger sistemas de IA generativa frente a ataques de inyección, jailbreak, adversarios, exfiltración de PII y contenido dañino. Está desarrollado por el usuario 23donge, que ha partido del modelo de embeddings chino `BAAI/bge-small-zh-v1.5` (24M de parámetros, 512 dimensiones, 12 capas Transformer) y lo ha afinado en una tarea de clasificación de dos clases mediante fine-tuning completo sobre un conjunto de datos propio de 3757 ejemplos, con un balance de 2639 bloqueos y 1118 permisos. El resultado se ha exportado a formato ONNX para inferencia eficiente en CPU, alcanzando una velocidad de 54 700 tokens por segundo y un tamaño de 91,4 MB (25 MB en INT8).

Su relevancia radica en que ofrece una protección ligera, en tiempo real y de código abierto contra amenazas de prompts adversarios en aplicaciones chinas, con un rendimiento superior a los sistemas basados en reglas y comparable a modelos generativos más pesados, a la vez que mantiene una latencia mínima y un bajo consumo de recursos. Al estar en formato ONNX, se puede integrar fácilmente en pipelines de producción con `onnxruntime`, sin necesidad de GPUs.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (12 capas, 512 dimensiones, 24M parámetros) |
| Parametros totales | 24 millones (del modelo base BGE-small-zh-v1.5) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (tokenizer del modelo base, entrenado con max_length 256) |
| Tipos de cuantizacion | FP32 (modelo ONNX original), INT8 (opcional, 25 MB) |
| Idiomas soportados | Chino (principalmente), aunque el tokenizer base soporta otros idiomas, el entrenamiento es específico para chino |
| Licencia | no disponible (autor no la especifica) |
| Formato de pesos | ONNX (model.onnx, safetensors no disponible) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `BAAI/bge-small-zh-v1.5`, un encoder Transformer de 12 capas con atención bidireccional y pooling sobre el token `[CLS]`. El autor añade una capa de clasificación lineal sobre el vector `[CLS]` para obtener una salida binaria (Safe=0, Unsafe=1). El entrenamiento se realiza mediante fine-tuning completo (full fine-tuning) con un `WeightedTrainer` que aplica pesos de clase para mitigar el desequilibrio de datos (2.3:1). Se usan AdamW (lr 2e-5, warmup 0.1, weight decay 0.01), EarlyStopping con paciencia 2 monitorizando F1, y se entrena durante 4 épocas en MPS (Apple Silicon). El dataset de entrenamiento se divide en 8:1:1 (3204/291/262) con una estrategia de agrupación para evitar fuga de datos. Posteriormente, el modelo se exporta a ONNX mediante `torch.onnx` con el operador 14, y se evalúa con un umbral de decisión de 0.5 (ajustado para FPR ≤ 5% en validación).

Una innovación técnica es el uso de un clasificador sobre embeddings semánticos, que permite capturar intenciones de inyección a largo plazo, a diferencia de métodos de n-gramas discretos o CNN locales. El autor reporta una generalización a cero disparos para la clase `A-prompt` (0.0) y robustez frente a ataques adversarios (1.0).

## Capacidades

- Clasificación binaria de prompts maliciosos en chino: detecta 14 categorías de ataques, incluyendo jailbreak, adversario, abuso de recursos, tool injection, contenido dañino, finanzas, PII y documentos multimodales.
- Inferencia eficiente en CPU: 2,34 ms por token (54 700 tokens/s) con ONNX Runtime, adecuada para entornos sin GPU.
- Soporte de integración con pipelines de seguridad en producción: se puede usar como guardián previo a un modelo generativo.
- No genera texto, solo produce una etiqueta de clasificación y, opcionalmente, la probabilidad.
- Multilingüe limitado: el tokenizer base es de BGE-small-zh-v1.5, que soporta chino principalmente; el entrenamiento es específico para chino.
- No incluye soporte de tool calling, agentes ni razonamiento multi-step, ya que es un clasificador.

## Casos de uso

- Filtrado de prompts en sistemas de chat chino: integrar el modelo como guardia de entrada para bloquear intentos de jailbreak o inyección de prompts antes de que lleguen al modelo generativo, reduciendo el riesgo de respuestas no seguras.
- Protección de APIs de modelos LLM: usar el clasificador en una pasarela de API para rechazar solicitudes maliciosas en tiempo real, con una latencia de 2,34 ms por token, lo que no degrada significativamente la experiencia del usuario.
- Auditoría de logs de prompts: analizar históricos de conversaciones para identificar intentos de ataque y ajustar políticas de seguridad.
- Entrenamiento de sistemas de moderación de contenido: el modelo puede servir como componente de un sistema más amplio que detecta contenido dañino en mensajes de usuarios.
- Despliegue en entornos con recursos limitados: gracias a su pequeño tamaño (91 MB FP32, 25 MB INT8), puede ejecutarse en servidores sin GPU o en dispositivos edge, como routers o firewalls.
- Evaluación de robustez de LLMs: usar el clasificador para medir la resistencia de un modelo a prompts adversarios en pruebas de seguridad.

## Benchmarks y rendimiento

La model card proporciona resultados sobre un conjunto de test de 262 ejemplos, con umbral de 0.5. La siguiente tabla resume los resultados comparativos con otros enfoques evaluados por el autor:

| Experimento | Acc | F1 | Precisión | Recall | FPR | AUC |
|---|---|---|---|---|---|---|
| Baseline-rule | 0.374 | 0.163 | 1.0 | 0.089 | 0.000 | 0.544 |
| **bge-small (este modelo)** | **0.9656** | **0.9753** | 0.962 | **0.9889** | 0.085 | 0.992 |
| torch-cnn | 0.9809 | 0.9860 | 0.994 | 0.9778 | 0.012 | 0.998 |
| qwen-0.5B LoRA 400 | 0.9198 | 0.9437 | 0.911 | 0.9778 | 0.207 | 0.885 |

Además, el autor reporta resultados por categoría: `A-*` 1.0, `C-content` 0.977, `MM-doc` 0.8 (con 6 falsos negativos en documentos normales). No se proporcionan benchmarks externos estándar como MMLU o HumanEval, ya que es un clasificador de seguridad, no un modelo de lenguaje general.

## Requisitos de hardware

- **VRAM**: no requiere VRAM, es un modelo de CPU puro. El tamaño del modelo ONNX es de 91,4 MB (FP32) o 25 MB (INT8).
- **GPU**: no es necesaria. Funciona correctamente en CPU con ONNX Runtime, incluso en procesadores de bajo consumo.
- **Despliegue**: se puede ejecutar con `onnxruntime` en Python, o convertirlo a otros formatos (por ejemplo, TensorRT) para entornos con GPU. No se proporcionan integraciones específicas con vLLM, llama.cpp u Ollama, pero al ser ONNX, es compatible con el ecosistema de ONNX.
- **Latencia y throughput**: 2,34 ms por token de 128 tokens (54700 tokens/s) en CPU según el autor. Para una entrada típica de 256 tokens, la latencia sería de unos 4,7 ms, lo que permite altos rendimientos en producción.

## Comparativa con modelos similares

No se han publicado comparaciones directas con otros detectores de prompts maliciosos en la información disponible. No obstante, el autor compara el modelo con las siguientes alternativas en el mismo estudio (todas evaluadas sobre el mismo test set):

| Modelo | Tipo | Acc | F1 | Tamaño | Latencia |
|---|---|---|---|---|---|
| **bge-small (este modelo)** | Clasificador ONNX | 0.9656 | 0.9753 | 91 MB | 2.34 ms/token |
| torch-cnn | CNN de texto | 0.9809 | 0.9860 | no especificado | no especificado |
| qwen-0.5B LoRA | LLM generativo afinado | 0.9198 | 0.9437 | 300 MB | 50 ms/token |
| baseline-rule | Reglas heurísticas | 0.374 | 0.163 | - | - |

También se puede comparar con el modelo base `BAAI/bge-small-zh-v1.5` (embedding) y con otros guardas como Llama Guard, pero no hay datos de rendimiento en este contexto.

## Limitaciones y advertencias

- **Alcance idiomático**: el modelo está entrenado principalmente en chino; su rendimiento en otros idiomas es desconocido y probablemente degradado.
- **Datos de entrenamiento limitados**: solo 3757 ejemplos, aunque el autor indica que cubre 14 categorías, la diversidad de ataques puede no ser exhaustiva.
- **Falsos positivos**: con un FPR de 0.085 en test, hay un 8.5% de prompts legítimos que pueden ser bloqueados, lo que puede ser problemático en aplicaciones de producción.
- **Generalización a nuevas técnicas de ataque**: los ataques de jailbreak evolucionan constantemente; el modelo puede no detectar variantes no vistas.
- **Licencia no especificada**: no se indica la licencia, por lo que el uso comercial es incierto y requiere contacto con el autor.
- **Sin soporte de explicabilidad**: a diferencia de un modelo generativo, no proporciona razones para la clasificación, solo la etiqueta.
- **Dependencia del tokenizer BGE**: el tokenizer debe descargarse del modelo base; si se modifica el vocabulario, el modelo fallará.

## Enlaces

- HuggingFace del modelo: [23donge/bge-small-zh-guard-onnx](https://huggingface.co/23donge/bge-small-zh-guard-onnx)
- Modelo base: [BAAI/bge-small-zh-v1.5](https://huggingface.co/BAAI/bge-small-zh-v1.5)
- Variante ONNX del modelo base: [onnx-community/bge-small-zh-v1.5-ONNX](https://huggingface.co/onnx-community/bge-small-zh-v1.5-ONNX)
- ONNX Model Zoo (referencia de formato ONNX): [GitHub - onnx/models](https://github.com/onnx/models)
- Repositorio de ejemplo con BGE-small en ONNX: [GitHub - linxinhong/bge-small](https://github.com/linxinhong/bge-small)
