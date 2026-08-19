# FRPO/qwen3-1.7b-a1_base-k1-cNone-clip0.2-mb4-eta100-bs256x5-n2-seed1

## Resumen

Este repositorio contiene un checkpoint de fine-tuning por aprendizaje por refuerzo (RL) sobre el modelo base `Qwen/Qwen3-1.7B`, generado por el autor FRPO en el marco de los experimentos **KL-in-LLM-RL / FRPO**. El modelo está entrenado con la librería `verl` y su nombre codifica la configuración exacta del run: `a1_base_k1-cNone-clip0.2-mb4-eta100-bs256x5-n2-seed1`.

Se trata de un artefacto de investigación, no de un modelo de producción. Su relevancia radica en que permite estudiar el impacto de la regularización KL y el clipping en la política de un modelo de 2.000 millones de parámetros durante el entrenamiento con RL, así como reproducir y comparar resultados dentro de la línea de investigación FRPO. El checkpoint incluido corresponde al paso global 200 y los pesos se almacenan en fp32 sin post-procesado, tal y como los guardó el entrenador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3, base) |
| Parametros totales | 2.031.739.904 (~2,03B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (safetensors, sin post-procesado) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `Qwen/Qwen3-1.7B`, un transformer denso de unos 2.000 millones de parámetros. Sobre esta base se ha aplicado un entrenamiento de refuerzo (RL) utilizando la librería `verl`, con el método **FRPO** (integrado en los experimentos KL-in-LLM-RL). La configuración del entrenamiento está codificada en el nombre del repositorio: `a1` (probablemente alpha=1), `k1`, `cNone` (sin clipping de la pérdida), `clip0.2` (clip de la ventaja o ratio en 0.2), `mb4` (micro-batch de 4), `eta100` (tasa de aprendizaje o eta en 100), `bs256x5` (batch size de 256 multiplicado por 5), `n2` (número de muestras o pasos) y `seed1` (semilla 1).

El checkpoint almacenado corresponde al paso global 200. Los pesos se guardan en fp32 exactamente como los produjo el trainer, sin ningún tipo de post-procesado (sin cuantización, sin fusión de capas). No se proporciona información sobre el dataset de entrenamiento, el número total de tokens ni si se aplicaron fases previas de SFT o DPO.

## Capacidades

- Generación de texto: al ser un fine-tune de un modelo base, conserva la capacidad de generar texto libre, aunque no se especifica si se ha optimizado para seguir instrucciones.
- Razonamiento y código: hereda las capacidades del modelo base Qwen3-1.7B, aunque no se detallan en la información proporcionada.
- Tool calling / function calling: no disponible en la información del repositorio.
- Soporte para agentes y razonamiento multi-paso: no disponible en la información del repositorio.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación en métodos de RL: el modelo permite analizar el efecto de la regularización KL (parámetro `k1`) y del clipping (parámetro `clip0.2`) sobre la estabilidad del entrenamiento y la calidad final de la política, comparándolo con otros runs de la familia FRPO.
- Reproducción de experimentos: al estar codificada la configuración completa en el nombre y publicarse los pesos exactos del trainer, es posible reproducir el experimento o continuar el entrenamiento desde el paso 200.
- Evaluación de técnicas de alineación: sirve como punto de comparación para medir cómo el RL modifica el comportamiento del modelo base `Qwen/Qwen3-1.7B` en tareas de generación, razonamiento o seguimiento de instrucciones.
- Inicialización para fine-tuning posterior: al ser un checkpoint intermedio, puede usarse como punto de partida para tareas específicas de NLP, aunque requiere conocer la licencia del modelo base.
- Estudio del control de KL: permite investigar cómo la penalización por divergencia KL afecta a la perplejidad y a la diversidad de las respuestas generadas.
- Benchmarking de infraestructura: al ser un modelo de 2B en fp32, resulta útil para medir el rendimiento de motores de inferencia (vLLM, TGI) con cargas de memoria elevadas y sin cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 8,1 GB en fp32. Solo los pesos requieren aproximadamente 8,1 GB de VRAM, a lo que hay que sumar el overhead de las activaciones y la KV cache. Se estima un mínimo de 12 GB de VRAM para una inferencia cómoda.
- GPU recomendadas: para fp32 sin cuantizar, se recomienda una GPU con 12 GB o más, como la RTX 4070, RTX 4080, L4, A10 o A100. En GPUs de 8 GB (RTX 3070, RTX 4060) podría caber con limitaciones de longitud de contexto.
- Si cabe en consumer GPU: sí, en GPUs de gama alta para consumidores (12 GB o más) si se usa fp32. Para GPUs de 8 GB sería necesario convertir los pesos a formatos de menor precisión (por ejemplo, GGUF Q8 o Q4), aunque el repositorio no los incluye.
- Opciones de despliegue: al ser pesos safetensors estándar, puede cargarse con `transformers`, `vLLM` o `TGI`. También puede convertirse a GGUF para usarse con `llama.cpp` u `Ollama`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FRPO qwen3-1.7b (este) | 2.031.739.904 | no disponible | no disponible | safetensors fp32 | Checkpoint RL, experimental |
| Qwen/Qwen3-1.7B (base) | ~1,7B | no disponible (heredado) | Apache 2.0 (conocida, pero no confirmada en esta ficha) | safetensors | Modelo base sin RL |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5B | no disponible | Apache 2.0 (conocida) | safetensors | Instruct, sin RL específico FRPO |

La comparativa se limita al modelo base y a alternativas de tamaño similar, ya que no se dispone de datos de rendimiento para este checkpoint concreto. La principal diferencia estructural es que este modelo ha sido sometido a un entrenamiento de RL con la configuración FRPO, mientras que los otros son modelos base o instruct sin ese proceso.

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del modelo en la model card. Esto impide conocer si su uso comercial está permitido. Se recomienda contactar con el autor o revisar la licencia del modelo base `Qwen/Qwen3-1.7B`.
- Idiomas no especificados: no se indica qué idiomas soporta el modelo, por lo que su uso en producción para idiomas distintos del inglés no está garantizado.
- Modelo experimental: es un checkpoint de investigación intermedio (paso 200) sin post-procesado ni evaluación publicada. No es apto para uso directo en aplicaciones críticas.
- Riesgo de alucinación: al ser un modelo base sin fine-tuning instructivo específico, puede generar contenido incoherente o factualmente incorrecto, especialmente en tareas de razonamiento complejo.
- Pesos en fp32: el tamaño del repositorio (8,1 GB) es elevado para un modelo de 2B, lo que dificulta su despliegue en entornos con recursos limitados si no se aplica una cuantización posterior.
- Sin garantías de reproducibilidad: aunque la configuración está codificada en el nombre, no se proporcionan detalles del dataset ni del entorno de entrenamiento, lo que puede dificultar la reproducción exacta.

## Enlaces

- Repositorio en HuggingFace: [FRPO/qwen3-1.7b-a1_base-k1-cNone-clip0.2-mb4-eta100-bs256x5-n2-seed1](https://huggingface.co/FRPO/qwen3-1.7b-a1_base-k1-cNone-clip0.2-mb4-eta100-bs256x5-n2-seed1)
- Modelo base: [Qwen/Qwen3-1.7B](https://huggingface.co/Qwen/Qwen3-1.7B)
- Librería de entrenamiento: [verl (Volcengine)](https://github.com/volcengine/verl)
