# Racktic/swecl-qwen35-ckpt

## Resumen

El repositorio `Racktic/swecl-qwen35-ckpt` contiene checkpoints de aprendizaje por refuerzo (RL) del modelo base **Qwen3.5-4B**, entrenados con un método experimental de memoria co-evolutiva denominado ACT/WRITE sobre el conjunto de datos SWE-Bench-CL en su versión 6p6. El autor, Racktic, utiliza el framework *miles* con el algoritmo GRPO y sin descarga de CPU (no cpu-offload). El objetivo es investigar cómo la co-evolución de dos componentes de memoria (ACT y WRITE) puede mejorar la resolución de tareas de ingeniería de software.

La relevancia actual radica en que combina un modelo base de 4 mil millones de parámetros (con arquitectura híbrida que incluye capas Mamba y componentes visuales, según los tensores presentes) con un esquema de RL novedoso orientado a benchmarks de programación. El repositorio incluye dos ramas experimentales: una de control (solo ACT entrenado, WRITE congelado) y otra de co-entrenamiento (ACT+WRITE). Los pesos se exportan desde Megatron en formato `safetensors`, con validación exhaustiva de integridad.

No se proporcionan métricas de rendimiento, licencia, ni detalles sobre el modelo base más allá de su nombre y los tensores observados. Es un recurso orientado a la investigación, no a producción directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: capas Mamba (SSM) + atención lineal, con componentes visuales y de predicción multi-token (según tensores `model.visual.*` y `mtp.*`) |
| Parametros totales | 4 mil millones (por el nombre Qwen3.5-4B; no confirmado en la documentación) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors, sin cuantización explícita) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (archivo `model-graft.safetensors` por checkpoint) |

## Arquitectura y entrenamiento

El modelo base es **Qwen3.5-4B**, del que se desconoce la arquitectura detallada en la información proporcionada. Sin embargo, los nombres de tensores revelan que incluye capas Mamba (parámetros `A_log`, normas de atención lineal, 48 claves) y componentes visuales (`model.visual.*`), así como módulos de predicción multi-token (`mtp.*`). Esto sugiere una arquitectura híbrida transformer-SSM con capacidades multimodales, aunque no se especifica el diseño exacto.

El entrenamiento de RL se realizó con GRPO (un algoritmo de optimización de políticas proximal adaptado a RL) sobre episodios del benchmark SWE-Bench-CL en su configuración 6p6. El método ACT/WRITE introduce dos módulos de memoria que co-evolucionan: uno de actuación (ACT) y otro de escritura (WRITE), donde la recompensa de WRITE se define como la ganancia incremental de la recompensa de ACT entre iteraciones consecutivas. Se entrenaron dos ramas: una de control (solo ACT, WRITE congelado) y otra de co-entrenamiento. Los pesos se exportaron desde Megatron (torch_dist) mediante conversión de language-tower, injertando los tensores visuales y `mtp` directamente desde el checkpoint base (no fueron tocados por el entrenamiento). Los tensores Mamba en fp32 se upcasteen de bf16 a fp32 para mantener el contrato de dtype del modelo base.

## Capacidades

- Generación de texto y razonamiento: como checkpoint de Qwen3.5-4B, se espera que herede las capacidades de lenguaje del modelo base, aunque no se documentan explícitamente.
- Resolución de tareas de ingeniería de software: el entrenamiento específico en SWE-Bench-CL sugiere que el modelo está optimizado para resolver issues de código (edición de archivos, parches, etc.).
- Capacidades multimodales: la presencia de tensores visuales (`model.visual.*`) indica que el modelo base puede procesar imágenes, aunque no se confirma que el checkpoint mantenga esta funcionalidad tras el RL.
- Predicción multi-token: los tensores `mtp.*` sugieren soporte para decodificación multi-token, lo que puede acelerar la generación.
- Memoria co-evolutiva: el método ACT/WRITE introduce un mecanismo de memoria que se actualiza durante el RL, aunque su efecto en inferencia no está documentado.

## Casos de uso

- Investigación en RL para programación: el checkpoint es útil para estudiar el impacto de la memoria co-evolutiva en la resolución de benchmarks como SWE-Bench. Los investigadores pueden comparar las ramas `actonly` y `write-delta` para analizar el efecto del co-entrenamiento.
- Fine-tuning adicional: dado que es un checkpoint de RL, puede servir como punto de partida para entrenamientos posteriores en dominios específicos de código, aprovechando el conocimiento adquirido en SWE-Bench.
- Evaluación de arquitecturas híbridas: al ser un modelo de 4B con capas Mamba y atención, puede usarse para comparar el rendimiento de arquitecturas híbridas frente a transformers puros en tareas de razonamiento.
- Desarrollo de agentes de codificación: si el modelo base soporta tool calling (no confirmado), el checkpoint podría integrarse en agentes autónomos para edición de código, aunque se requiere validación previa.
- Estudio de la transferencia de memoria: el diseño ACT/WRITE permite analizar cómo la memoria aprendida en un dominio (SWE-Bench) se transfiere a otros conjuntos de datos.
- Reproducibilidad de experimentos: los checkpoints incluyen validación de integridad (4 puertas), lo que facilita la reproducción de los experimentos de RL descritos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. El único contexto de evaluación es SWE-Bench-CL, pero no se proporcionan los valores de recompensa obtenidos.

## Requisitos de hardware

- El tamaño del repositorio (2591.7 GB) se debe a la acumulación de múltiples checkpoints (uno por iteración), no al tamaño de un solo modelo. Cada checkpoint individual corresponde a un modelo de 4B parámetros.
- Para inferencia del modelo base de 4B, se estima que una GPU con al menos 8-10 GB de VRAM en fp16 podría ser suficiente, pero no hay confirmación oficial.
- Dado que los pesos están en safetensors y se cargan con `trust_remote_code=True`, se recomienda usar frameworks como vLLM, SGLang (mencionado en la validación) u Ollama para despliegue.
- No se especifican requisitos de GPU concretos ni latencia/throughput. Al ser un modelo de 4B, podría ejecutarse en GPUs consumer como RTX 3090/4090 con cuantización, pero esto es especulativo.
- El entrenamiento de RL (GRPO) requiere hardware de mayor capacidad (probablemente A100/H100), pero no se detalla.

## Comparativa con modelos similares

No disponible. No se proporcionan modelos comparables en la información. El modelo base Qwen3.5-4B no está documentado en este repositorio, y no se pueden establecer comparaciones fiables con otras alternativas de 4B como Llama-3.2-3B, Phi-3.5-mini o Qwen2.5-3B sin datos adicionales.

## Limitaciones y advertencias

- Licencia no especificada: el uso comercial o la redistribución del checkpoint y del modelo base no están claros. Se debe contactar al autor antes de cualquier uso fuera de investigación.
- Checkpoint de investigación: no es un modelo final pulido; puede presentar comportamientos erráticos fuera del dominio de entrenamiento (SWE-Bench).
- Sesgos y alucinaciones: al ser un modelo entrenado con RL en un dominio específico, puede alucinar en tareas generales o mostrar sesgos del dataset de código.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada, lo que afecta a tareas que requieren ventanas largas.
- Dependencia del código base: el checkpoint requiere cargar el modelo base Qwen3.5-4B con `trust_remote_code=True`, lo que implica ejecutar código remoto no auditado.
- Integridad de tensores: aunque se validó la paridad con el base, la conversión de bf16 a fp32 en tensores Mamba podría introducir diferencias numéricas menores en hardware específico.
- Sin soporte garantizado: al tener 0 descargas y 0 likes, el modelo no ha sido probado por la comunidad; es probable que contenga errores o dependencias no documentadas.

## Enlaces

- Repositorio HuggingFace: [https://huggingface.co/Racktic/swecl-qwen35-ckpt](https://huggingface.co/Racktic/swecl-qwen35-ckpt)
- No se proporcionan otros enlaces (papers, blogs, repos) en la información disponible.
