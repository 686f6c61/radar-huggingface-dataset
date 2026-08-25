# RyanFoxW/btprop-sft-gen-w26-qwen3-8b

## Resumen

`btprop-sft-gen-w26-qwen3-8b` es un fine-tune del modelo Qwen3-8B, desarrollado por RyanFoxW, orientado a la generación de variantes de afirmaciones (variants) dentro del pipeline de detección de alucinaciones BTProp (Belief Tree Propagation). El modelo fue entrenado mediante supervisión fina (SFT) utilizando datos destilados de un modelo profesor Qwen3.5-122B-A10B, con la cadena de pensamiento (chain-of-thought) eliminada de los objetivos. Su propósito original era sustituir al profesor de 122B en la etapa de generación del pipeline, reduciendo el coste de inferencia.

Sin embargo, el autor lo publica explícitamente como un **resultado negativo archivado**: las métricas de detección de alucinaciones obtenidas son inferiores a las del modelo base sin entrenar (AUROC 0.8190 frente a 0.8228). El análisis posterior revela que el profesor de 122B no tenía ventaja real sobre el estudiante de 8B, por lo que la destilación no podía producir mejoras. El modelo se publica únicamente para que la comunidad pueda verificar esta afirmación, no como una herramienta recomendada para despliegue.

Con 8.190.735.360 parámetros y un tamaño de repositorio de 16.4 GB, el modelo hereda la arquitectura y el comportamiento del Qwen3-8B original, pero su especialización en la tarea de generación de variantes lo hace menos generalista. No se dispone de información sobre la longitud de contexto, los idiomas soportados ni las opciones de cuantización en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen3-8B (Transformer, no se detalla más) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen3-8B, un transformer decoder-only, aunque la ficha no especifica detalles adicionales de la arquitectura. El entrenamiento se realizó mediante SFT (supervised fine-tuning) sobre datos destilados de Qwen3.5-122B-A10B, utilizando la misma tarea y evidencia que el modelo `RyanFoxW/btprop-rl-w26-qwen3-8b`. Se eliminó la cadena de pensamiento de los objetivos de entrenamiento, lo que implica que el modelo aprende a generar directamente las variantes sin razonamiento intermedio.

No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El autor indica que el modelo fue entrenado para la generación de variantes en el pipeline BTProp, pero el resultado es negativo: el profesor de 122B obtuvo un AUROC de 0.6915 frente al 0.7233 del estudiante de 8B sin entrenar, y generaba menos variantes por afirmación (1.71 frente a 2.96). El estudiante aprendió el comportamiento del profesor y quedó entre ambos, sin superar al modelo base.

## Capacidades

- Generación de variantes de afirmaciones (variants) para el pipeline de detección de alucinaciones BTProp.
- Generación de texto en general, aunque su especialización reduce su utilidad fuera de la tarea objetivo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- No se especifican capacidades multilingües; el modelo base Qwen3-8B soporta múltiples idiomas, pero no hay confirmación para este fine-tune.

## Casos de uso

- Investigación académica sobre destilación de modelos: el modelo sirve como caso de estudio de un resultado negativo, permitiendo analizar por qué la destilación falla cuando el profesor no supera al estudiante.
- Evaluación de pipelines de detección de alucinaciones: puede utilizarse como generador de variantes en experimentos controlados para comparar el impacto de diferentes generadores en el rendimiento global del sistema BTProp.
- Análisis de comportamiento de modelos destilados: estudiar cómo el modelo aprende los hábitos del profesor (por ejemplo, generar menos variantes) y cómo esto afecta a las métricas finales.
- Reproducción de experimentos: dado que el autor publica el modelo y el código, otros investigadores pueden reproducir los resultados y verificar las afirmaciones.
- Benchmarking de modelos de 8B en tareas de fact-checking: comparar este fine-tune con otros modelos de tamaño similar en la misma tarea.
- Desarrollo de técnicas de destilación mejoradas: el modelo puede servir como punto de partida para experimentar con estrategias alternativas (por ejemplo, mantener la cadena de pensamiento o usar un profesor más capaz).

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados en la tarea de detección de alucinaciones por declaración (BTProp stop-node test split, 6 datasets, n=2,225 afirmaciones compartidas), con retrieval, juzgado y agregación fijos:

| Modelo | AUROC | PRAUC | Acc | variants/claim |
|---|---|---|---|---|
| Qwen3-8B sin entrenar | **0.8228** | **0.7580** | **76.54** | 2.92 |
| btprop-sft-gen-w26-qwen3-8b | 0.8190 | 0.7515 | 76.04 | 2.01 |

El modelo obtiene peores resultados que el modelo base sin entrenar en todas las métricas. Además, el autor reporta que el profesor de 122B (Qwen3.5-122B-A10B) alcanzó un AUROC de 0.6915 y 1.71 variantes por afirmación, siendo inferior al estudiante de 8B sin entrenar. No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No se proporcionan requisitos específicos de hardware en la documentación.
- Dado el tamaño de 8.190 millones de parámetros, se estima que la inferencia en FP16 requiere al menos 16 GB de VRAM, pero este dato no está confirmado por el autor.
- No se mencionan GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- No hay datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Qwen3-8B (base) | 8.19B | no disponible | Apache-2.0 | Modelo generalista |
| btprop-sft-gen-w26-qwen3-8b | 8.19B | no disponible | Apache-2.0 | Generación de variantes para BTProp |
| RyanFoxW/Qwen3-8B-BTProp-mainmod1verify-SFT | 8.19B | no disponible | Apache-2.0 | Generación de árboles de creencia para BTProp (destilado de Qwen3.5-397B) |

No se dispone de datos de rendimiento comparativo entre estos modelos más allá de la tabla de benchmarks anterior. El modelo base Qwen3-8B supera al fine-tune en la tarea específica, lo que indica que la destilación no aportó valor.

## Limitaciones y advertencias

- **Resultado negativo**: el modelo no supera al modelo base sin entrenar en la tarea para la que fue diseñado; el autor lo archiva explícitamente como un fracaso.
- **No recomendado para producción**: la model card advierte que no vale la pena desplegarlo.
- **Sesgos y alucinaciones**: al ser un modelo de generación de texto, puede producir afirmaciones incorrectas o alucinadas, aunque su propósito sea detectarlas.
- **Limitaciones de contexto e idioma**: no se especifican, pero al estar basado en Qwen3-8B, hereda las limitaciones del modelo base (aunque no confirmadas).
- **Licencia**: Apache-2.0 permite uso comercial, pero el autor desaconseja su uso en cualquier aplicación real.
- **Dependencia del pipeline**: su utilidad está ligada al pipeline BTProp; fuera de él, su comportamiento no ha sido evaluado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RyanFoxW/btprop-sft-gen-w26-qwen3-8b
- Repositorio de código BTProp: https://github.com/BENGAL-UCSB/BTProp (rama `layer1-v2-RL`)
- Modelo relacionado (también de RyanFoxW): https://huggingface.co/RyanFoxW/Qwen3-8B-BTProp-mainmod1verify-SFT
