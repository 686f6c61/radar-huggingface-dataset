# Harvard-DCML/ADAPT-Qwen3-2.3B-Base

## Resumen

El modelo ADAPT-Qwen3-2.3B-Base es un modelo de lenguaje desarrollado por el Harvard Data-Centric Machine Learning Group (Harvard-DCML) dentro del marco de la técnica ADAPT, presentada en el artículo Thinking at the Right Size. Esta técnica permite interpolar tamaños entre distintas variantes post-entrenadas de un mismo modelo base mediante transferencia de deltas de pesos. El modelo es el estudiante destilado a partir de Qwen/Qwen3-4B-Base, inicializado copiando capas alternas y las dos últimas capas del modelo base, y entrenado con destilación para reproducir sus activaciones. Su nombre sugiere un tamaño de aproximadamente 2.3B de parámetros, aunque el recuento real de los archivos safetensors publicados muestra discrepancia (576.661.056); esta cuestión se detalla en las especificaciones técnicas. El modelo no incluye información sobre la longitud de contexto en su ficha.

ADAPT-Qwen3-2.3B-Base es relevante para el ámbito de la investigación en eficiencia, destilación y compresión de modelos de lenguaje, ya que permite estudiar cómo transferir ajustes procedentes de variantes post-entrenadas (instruct, thinking, etc.) a modelos más pequeños sin necesidad de un reentrenamiento completo. Está publicado bajo licencia Apache 2.0, en formato safetensors y compatible con la biblioteca Transformers. No se han publicado benchmarks ni especificaciones de cuantización, por lo que su evaluación requiere trabajo experimental adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (dense, subconjunto de Qwen3-4B-Base) |
| Parametros totales | 576.661.056 (según safetensors de HuggingFace; el nombre indica 2.3B, existe discrepancia) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no especificados en la ficha del autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con Transformers) |

## Arquitectura y entrenamiento

El modelo surge de la técnica ADAPT, cuyo propósito es construir modelos intermedios entre dos variantes de un mismo modelo base. Para crear este estudiante se partió de Qwen/Qwen3-4B-Base y se copiaron capas alternas (cada dos capas) y las dos últimas capas del modelo original. A continuación se entrenó mediante destilación para que las activaciones del estudiante se aproximaran a las del profesor.

El proceso de entrenamiento descrito en la model card consta de una fase de preentrenamiento y otra de SFT. Se utilizaron 0.5B tokens de EleutherAI/the_pile_deduplicated y 0.5B tokens del split de matemáticas de nvidia/Llama-Nemotron-Post-Training-Dataset. Las pérdidas utilizadas fueron entropía cruzada, divergencia KL con peso 0.1 y distancia coseno por capa con peso 10.0. Los hiperparámetros principales son: learning rate 3e-4 con scheduler coseno, warmup ratio 0.01, optimizador AdamW (betas 0.9 y 0.95, epsilon 1e-8), weight decay 0.1, grad norm máximo 1.0, precisión bf16 y longitud máxima de secuencia 1024. La fase de preentrenamiento duró 240 pasos con batch efectivo 2048, y la fase SFT 293 pasos con batch efectivo 4096. El modelo no cuenta con RLHF ni DPO documentados.

## Capacidades

- Generación de texto: es un modelo base, por lo que puede generar continuaciones de texto, pero no está afinado para seguir instrucciones ni para uso conversacional directo.
- Destilación y transferencia de pesos: su función principal es servir como estudiante para la técnica ADAPT, permitiendo combinar pesos con modelos post-entrenados mediante la función `build_intermediate_model`.
- Interpolación de tamaño: se pueden crear modelos de distintos tamaños ajustando el parámetro `num_layers_to_patch` en el repositorio de ADAPT.
- Tool calling, function calling, agentes, visión y audio: no se ha documentado soporte para estas capacidades en la información disponible.
- Multilingüismo: no hay datos específicos en la ficha del modelo, aunque el modelo base Qwen3-4B-Base es multilingüe.

## Casos de uso

- Investigación en destilación de modelos: el modelo puede utilizarse como punto de partida para comparar distintas estrategias de destilación y para reproducir los experimentos del artículo ADAPT.
- Transferencia de ajustes post-entrenamiento: mediante weight-delta transfer, se pueden construir modelos intermedios que hereden capacidades de variantes como Qwen3-4B-Instruct-2507 o Qwen3-4B-Thinking-2507 sin un SFT completo.
- Estudio del efecto del número de capas parcheadas: cambiando `num_layers_to_patch` en el repositorio ADAPT, se pueden generar modelos de tamaño variable y analizar el compromiso entre tamaño y rendimiento.
- Análisis de representaciones internas: al ser un modelo pequeño derivado de uno mayor, resulta útil para estudiar cómo la destilación afecta a la estructura de las activaciones y al conocimiento transferido.
- Docencia en compresión de modelos: es un caso concreto para cursos sobre eficiencia de transformadores, destilación y extracción de subredes de modelos grandes.
- Evaluación de costes de despliegue: si las variantes interpoladas muestran un rendimiento suficiente, se podrían desplegar en entornos con recursos reducidos, aunque requiere validación experimental previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible según el autor. Con el nombre de 2.3B en bf16, los pesos ocuparían unos 4.6 GB (estimación orientativa); si el recuento de 576.661.056 fuese correcto, la ocupación sería de aproximadamente 1.2 GB. La discrepancia impide dar un dato fiable.
- GPU recomendadas: no especificadas. Dado el tamaño nominal, podría ejecutarse en GPUs de consumo modernas (por ejemplo, RTX 3060 12GB o superiores), pero no hay confirmación oficial.
- Capacidad en GPU de consumo: probablemente sí en GPUs con 8GB o más, asumiendo secuencias cortas y formato bf16, aunque no está garantizado.
- Opciones de despliegue: compatible con Hugging Face Transformers y con el pipeline `text-generation-inference`; puede servirse con vLLM o TGI. No se documenta soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ADAPT-Qwen3-2.3B-Base | Discrepante (576M según safetensors; nombre 2.3B) | No disponible | Apache 2.0 | HuggingFace |
| Qwen3-4B-Base (profesor) | 4B | No disponible | Apache 2.0 | HuggingFace |
| boomerang-qwen3-2.3B (Harvard-DCML) | No disponible | No disponible | Apache 2.0 | HuggingFace |

Se trata de un modelo de investigación de la misma organización; no hay comparaciones directas de rendimiento disponibles.

## Limitaciones y advertencias

- Es un modelo base sin alineación para instrucciones; no debe usarse directamente en aplicaciones de chat sin un post-entrenamiento posterior.
- El recuento de parámetros reportado en el repositorio (576.661.056) es inconsistente con el nombre del modelo (2.3B), lo que puede indicar un error en la publicación o un subconjunto de pesos. Es necesario verificar antes de cualquier uso.
- No se han publicado benchmarks, evaluaciones de sesgos ni análisis de alucinaciones, por lo que la fiabilidad del modelo para tareas concretas es desconocida.
- El entrenamiento se realizó con secuencias de hasta 1024 tokens; no se especifica la ventana de contexto máxima real, lo que limita aplicaciones con contexto largo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo está orientado a investigación y no parece preparado para producción sin validación.
- El rendimiento fuera de los dominios de entrenamiento (Pile deduplicado y split matemático de Llama Nemotron) no está caracterizado.

## Enlaces

- HuggingFace: https://huggingface.co/Harvard-DCML/ADAPT-Qwen3-2.3B-Base
- Paper: https://arxiv.org/abs/2608.22854
- Repositorio GitHub: https://github.com/dcml-lab/ADAPT
- Modelo similar de Harvard-DCML: https://huggingface.co/Harvard-DCML/boomerang-qwen3-2.3B
- Informe técnico de Qwen3 (contexto del modelo base): https://arxiv.org/html/2505.09388v1
