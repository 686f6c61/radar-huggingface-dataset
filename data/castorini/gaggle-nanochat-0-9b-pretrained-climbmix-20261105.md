# castorini/gaggle-nanochat-0.9b-pretrained-climbmix-20261105

## Resumen

`gaggle-nanochat-0.9b-pretrained-climbmix-20261105` es un modelo de lenguaje base decoder-only de 887 millones de parámetros (0,89B) desarrollado por el grupo castorini, preentrenado desde cero con el framework [nanochat](https://github.com/karpathy/nanochat) de Andrej Karpathy sobre una pasada completa del dataset ClimbMix (287.000 millones de tokens). Es el hermano pequeño del modelo de 3,3B del mismo autor, descrito en el artículo *Project Greenhouse: Progress Toward Fully Open and Sovereign Agentic Search*, y comparte con él datos y receta de entrenamiento.

Se trata de un modelo puramente base: no ha recibido ajuste por instrucciones ni RLHF, por lo que su función es continuar texto, no obedecer órdenes. Su interés radica en ser un punto de partida reproducible y totalmente abierto para construir modelos derivados (chat, reranking) dentro de la familia Gaggle, con pesos que cargan indistintamente en `transformers`, vLLM y el código original de nanochat.

La arquitectura es un transformer denso de 32 capas y anchura 1.152, con un contexto de solo 2.048 tokens, embeddings de valor en capas alternas y atención con ventana deslizante en tres de cada cuatro capas. Está pensado para entornos de investigación con presupuesto de cómputo limitado: se entrenó en un único nodo de cuatro H200 en aproximadamente 590 horas-GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nanochat decoder-only transformer: 32 capas, anchura 1.152, 9 cabezas de atención de dimensión 128 |
| Parametros totales | 887.096.250 (0,89B): 0,51B en bloques transformer, 0,30B en tablas de value embeddings, 0,08B en embeddings de entrada/salida |
| Parametros activos | no aplica (modelo denso); el cómputo por token equivale a un modelo denso de ~0,59B por el uso de value embeddings como lookups |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (la model card no documenta cuantizaciones publicadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 5,7 GB); también compatible con los ficheros originales de nanochat |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con RoPE (rotary position embeddings), normalización QK, RMSNorm sin parámetros, MLP con squared-ReLU, embeddings de entrada y salida no atados y logit soft-capping. Incorpora un *value embedding* en cada cuarta capa (contando desde la última) y tres de cada cuatro capas usan ventana deslizante de 512 tokens. La forma (profunda y estrecha, con menos tablas de value embeddings) se eligió mediante un barrido de modelos nanochat sub-1B con un presupuesto fijo de 7B tokens: a ~0,9B de parámetros, esta configuración superó al modelo depth-20 de nanochat tanto en pérdida de validación como en CORE. El tokenizador es BPE a nivel de byte con 32.768 entradas, idéntico byte a byte al del modelo de 3,3B.

El entrenamiento usó una pasada de 287B tokens de ClimbMix (`karpathy/climbmix-400b-shuffle`), con el último de sus 6.543 shards reservado para validación y empaquetado BOS-aligned best-fit en secuencias de 2.048 tokens. El optimizador es el de nanochat sin cambios: Muon para las matrices de peso de los bloques y AdamW para embeddings y parámetros escalares, con warmup breve, tasa constante y decaimiento lineal. El batch crece de 262.144 a 2.097.152 tokens manteniendo las tasas de aprendizaje pico. El cómputo fue un nodo de cuatro NVIDIA H200 con multiplicaciones FP8, unas 590 horas-H200. El checkpoint publicado es el final (paso 229.067), que además registró el CORE más alto durante el entrenamiento. No hubo post-entrenamiento: ni instruction tuning ni RLHF.

## Capacidades

- Generación y continuación de texto en inglés; no sigue instrucciones al no tener ajuste supervisado.
- Razonamiento y conocimiento factual evaluables mediante MMLU y MMLU-Pro en modo few-shot por log-verosimilitud.
- Aprendizaje en contexto (in-context learning): evaluado con las 22 tareas de CORE de nanochat.
- No dispone de tool calling ni function calling (modelo base sin post-entrenamiento).
- No soporta agentes ni razonamiento multi-paso de forma nativa; requiere un modelo derivado con SFT.
- Capacidades multilingües limitadas al inglés.
- Sirve como base para fine-tuning: existe un modelo de chat derivado (`gaggle-nanochat-0.9b-ift-climbmix-20261108`) y un reranker (`gaggle-reranker-0.9b-20261108`).
- Carga en tres vías: `transformers` con `trust_remote_code=True`, vLLM mediante plugin y el código original de nanochat.

## Casos de uso

- Investigación sobre preentrenamiento reproducible: permite replicar o extender la receta nanochat con un presupuesto de cómputo accesible (un nodo de cuatro H200) y comparar curvas de pérdida y CORE frente al modelo de 3,3B.
- Punto de partida para fine-tuning supervisado: el propio autor lo usa para producir el modelo de chat `gaggle-nanochat-0.9b-ift-climbmix-20261108` aplicando la receta de midtraining + SFT de nanochat; sirve como base para tareas de instrucción específicas de dominio.
- Entrenamiento de rerankers: es la base del `gaggle-reranker-0.9b-20261108`, por lo que encaja en pipelines de búsqueda y recuperación de información donde se necesita puntuar pares consulta-documento.
- Evaluación de modelos base en tareas de conocimiento: con 5-shot MMLU y MMLU-Pro por log-verosimilitud, se puede usar como referencia en estudios comparativos de modelos sub-1B.
- Experimentación con arquitecturas nanochat: al cargar con el código original sin modificar los ficheros de checkpoint, permite probar variantes de value embeddings, ventanas deslizantes o soft-capping sin reentrenar desde cero.
- Generación de texto corto y completado de secuencias: con contexto de 2.048 tokens, es adecuado para tareas de continuación de documentos breves, análisis de perplejidad y estudios de fluidez lingüística en inglés.
- Docencia y prototipado: su licencia MIT y su tamaño (5,7 GB en safetensors) facilitan desplegarlo en una sola GPU consumer para prácticas de NLP y experimentos de laboratorio.

## Benchmarks y rendimiento

Datos publicados en la model card (CORE sobre 500 ejemplos por tarea; MMLU y MMLU-Pro 5-shot por log-verosimilitud de la letra de respuesta con LM Evaluation Harness):

| Modelo | Parámetros | Tokens | CORE | MMLU | MMLU-Pro |
|---|---:|---:|---:|---:|---:|
| **Este modelo** | 0,89B | 287B | **0,370** | **0,357** | **0,118** |
| Gaggle 3.3B | 3,29B | 283B | 0,458 | 0,493 | 0,178 |
| nanochat d34 | 2,2B | 89B | 0,338 | 0,257 | 0,115 |

Puntuado sobre todos los ejemplos en lugar de 500 por tarea, el CORE de este modelo es 0,355. La pérdida de validación en el shard reservado de ClimbMix es de 0,658 bits por byte (frente a 0,596 del modelo de 3,3B).

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 1,8 GB para los pesos (0,89B × 2 bytes), más overhead de activaciones y caché KV; el repo completo ocupa 5,7 GB en disco.
- GPU recomendadas: el autor reporta salida correcta en una NVIDIA RTX 6000 Ada; cualquier GPU con al menos ~4 GB de VRAM libre en bf16 debería poder cargarlo.
- Cabe en GPU consumer: sí, en tarjetas tipo RTX 3060/4060/4090 con 8 GB o más; con cuantización a 8 o 4 bits el margen es amplio, aunque el autor no publica cuantizaciones oficiales.
- Opciones de despliegue: `transformers` (>=4.57, `torch`>=2.5, `trust_remote_code=True`), vLLM mediante plugin, y el código original de nanochat desde los ficheros de checkpoint.
- Latencia y throughput: no disponibles; el autor no publica mediciones de rendimiento más allá de la salida de ejemplo en RTX 6000 Ada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CORE | MMLU | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| **Este modelo** | 0,89B | 2.048 | 0,370 | 0,357 | MIT | Hugging Face, vLLM, nanochat |
| Gaggle 3.3B | 3,29B | no disponible | 0,458 | 0,493 | no disponible en la información | Hugging Face |
| nanochat d34 | 2,2B | no disponible | 0,338 | 0,257 | no disponible en la información | Hugging Face (`karpathy/nanochat-d34`) |

Frente al modelo de 3,3B, este checkpoint pierde unos 9 puntos de CORE y 13,6 de MMLU a cambio de un cuarto de los parámetros y un coste de inferencia mucho menor. Frente a nanochat d34 (2,2B, 89B tokens), gana en CORE (0,370 vs 0,338) y MMLU (0,357 vs 0,257) pese a tener menos de la mitad de parámetros, gracias a los 287B tokens de entrenamiento.

## Limitaciones y advertencias

- Modelo base sin post-entrenamiento: no sigue instrucciones, no mantiene formato de chat ni responde a preguntas directas; continuará el texto de forma literal.
- Contexto muy corto (2.048 tokens) comparado con los estándares actuales; no apto para documentos largos ni conversaciones multi-turno extensas.
- Solo inglés: no se ha entrenado ni evaluado en otros idiomas.
- Riesgo de alucinación y de repetir secuencias (el ejemplo de la model card muestra la repetición de "The capital of France is Paris").
- Sesgos heredados de ClimbMix; el autor no documenta análisis de sesgo ni filtrado de datos más allá del propio dataset.
- Sin soporte nativo de tool calling, agentes ni razonamiento multi-paso; para ello hay que usar el modelo IFT derivado.
- Licencia MIT: permite uso comercial, pero al ser un modelo base los productos derivados requerirán su propio fine-tuning y evaluación.
- No se publican cuantizaciones oficiales ni mediciones de throughput, lo que dificulta planificar despliegues en producción.
- El checkpoint final se eligió también por su CORE; no se garantiza que sea el mejor en otras métricas no reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castorini/gaggle-nanochat-0.9b-pretrained-climbmix-20261105
- Modelo de 3,3B hermano: https://huggingface.co/castorini/gaggle-nanochat-pretrained-climbmix-20260924
- Modelo de chat derivado: https://huggingface.co/castorini/gaggle-nanochat-0.9b-ift-climbmix-20261108
- Reranker derivado: https://huggingface.co/castorini/gaggle-reranker-0.9b-20261108
- Dataset ClimbMix: https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Modelo nanochat d34: https://huggingface.co/karpathy/nanochat-d34
- Artículo Project Greenhouse: https://arxiv.org/abs/2610.11922
