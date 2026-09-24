# rubenbalbastre/unlearning-r2-warmed-qwen-qwen2-5-3b-instruct-john-d-rockefeller-r4

## Resumen

Este repositorio contiene un adaptador LoRA (librería PEFT) entrenado con GRPO sobre el modelo base Qwen/Qwen2.5-3B-Instruct, un transformer decoder-only de 3.090 millones de parámetros. Lo publica el usuario rubenbalbastre y su identificador lo sitúa dentro de un proyecto de machine unlearning: el nombre incluye los términos "unlearning", "warmed" y la entidad objetivo "john-d-rockefeller", lo que apunta a un experimento de eliminación selectiva de conocimiento sobre esa figura histórica en un modelo de 3B.

El problema que aborda es el des-aprendizaje (machine unlearning): retirar del modelo la información asociada a un concepto, entidad o conjunto de datos concreto sin reentrenar desde cero y minimizando el daño a la utilidad general del modelo. A diferencia de los enfoques habituales basados en ajuste supervisado o ascenso de gradiente, aquí se emplea aprendizaje por refuerzo con GRPO a través de la librería TRL, combinado con adaptadores LoRA de bajo rango (el sufijo "r4" del identificador sugiere rango 4, aunque no está confirmado).

El modelo se publicó el 24 de septiembre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 "likes". La model card es la plantilla por defecto de Hugging Face y no documenta datos de entrenamiento, hiperparámetros, evaluación ni licencia. Debe considerarse, por tanto, un artefacto de investigación sin validación externa ni resultados publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/PEFT sobre un transformer decoder-only (familia Qwen2) con atención de consultas agrupadas (GQA) |
| Parámetros totales | 3.090 millones en el modelo base; tamaño del adaptador no disponible |
| Longitud de contexto | 32.768 tokens en el modelo base; no se documenta si el adaptador la modifica |
| Tipos de cuantización | no disponible (el repositorio publica pesos PEFT en safetensors; la cuantización requeriría fusionar el adaptador con el modelo base) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5-3B-Instruct declara soporte para 29 idiomas) |
| Licencia | no disponible (el modelo base Qwen2.5-3B-Instruct se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); no se publican pesos fusionados ni GGUF |
| Librería | peft 0.19.1 (entrenamiento con trl y transformers) |
| Pipeline declarado | text-generation (conversacional) |
| Tamaño del repositorio | 0,5 GB |
| Etiquetas de entrenamiento | grpo, lora, transformers, trl |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Paper asociado | arXiv:2608.17804 |
| Fecha de publicación | 24 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) que se monta sobre Qwen2.5-3B-Instruct, un transformer decoder-only de 36 capas, dimensión oculta 2.048 y GQA con 16 cabezas de consulta y 2 cabezas de clave/valor. El entrenamiento se realizó con GRPO (Group Relative Policy Optimization), el algoritmo de refuerzo con ventaja relativa de grupo popularizado por DeepSeekMath y disponible en TRL para ajuste de modelos de lenguaje con recompensas verificables o aprendidas. La combinación de GRPO con PEFT permite aplicar optimización por política sobre un adaptador sin tocar los pesos base, algo habitual en entornos con recursos limitados.

No hay información pública sobre el dataset de des-aprendizaje, la composición de las muestras, las funciones de recompensa, el número de pasos, la tasa de aprendizaje ni el régimen de precisión. Tampoco se documenta si hubo una fase previa de ajuste supervisado. El identificador contiene los fragmentos "r2" y "warmed", lo que sugiere una etapa de calentamiento o una segunda ronda de un procedimiento por fases, pero se trata de una inferencia a partir del nombre y no de un dato confirmado por el autor. La única información de software declarada es la versión de PEFT (0.19.1) en la sección de versiones de framework.

El repositorio ocupa 0,5 GB, un tamaño muy superior al de un adaptador LoRA de rango 4 sobre un modelo de 3B (habitualmente decenas de megabytes). Esto podría indicar la presencia de múltiples adaptadores, estados del optimizador, checkpoints intermedios u otros ficheros, pero el autor no detalla el contenido del repositorio.

## Capacidades

- Generación de texto conversacional en formato de chat: la etiqueta `conversational` y la herencia del modelo instruct indican que el adaptador espera plantillas de diálogo con roles.
- Des-aprendizaje selectivo: el propósito declarado del experimento es reducir la probabilidad de que el modelo reproduzca conocimiento asociado a la entidad "John D. Rockefeller". No hay métricas publicadas que cuantifiquen el grado de olvido.
- Razonamiento e instrucciones generales: al conservar los pesos base de Qwen2.5-3B-Instruct, cabe esperar competencia en tareas instruct estándar (resumen, redacción, clasificación), aunque el proceso de des-aprendizaje puede haber degradado parte de esa capacidad y no se documenta en qué medida.
- Soporte de tool calling / function calling: el modelo base Qwen2.5-3B-Instruct lo soporta; no se ha verificado que el adaptador lo preserve.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible para el adaptador; el modelo base declara 29 idiomas.
- Capacidades especiales (modo pensamiento, visión, audio): no disponibles; el modelo base es exclusivamente de texto.
- Capacidad de ser fusionado: al ser un adaptador PEFT, puede combinarse con el modelo base para producir un checkpoint monolítico y, a partir de ahí, convertirse a GGUF u otros formatos.

## Casos de uso

- Reproducción de experimentos de machine unlearning: sirve como punto de partida para replicar el pipeline GRPO + LoRA descrito en el paper asociado, cargando el adaptador sobre Qwen2.5-3B-Instruct y repitiendo las fases de calentamiento y optimización por refuerzo.
- Auditoría del olvido: permite medir la tasa de retención del conocimiento objetivo mediante sondeos de preguntas y respuestas sobre la entidad, y comparar la puntuación obtenida con la del modelo base sin adaptador.
- Evaluación de la utilidad retenida (model utility): al ser un adaptador de un solo objetivo, es útil para cuantificar cuánta capacidad general se pierde tras el des-aprendizaje, ejecutando baterías de tareas ajenas al concepto olvidado sobre el modelo base y sobre el adaptado.
- Red teaming y ataques de recuperación: un caso de uso directo en investigación es intentar recuperar el conocimiento eliminado mediante prompts indirectos, cadenas de razonamiento, parafraseo multilingüe o ajuste posterior, para estimar la robustez real del método.
- Línea base en comparativas de métodos: sirve como control frente a técnicas alternativas de des-aprendizaje (ascenso de gradiente, NPO, DPO negativo, edición de pesos) para comparar en igualdad de condiciones sobre el mismo modelo base.
- Estudio del efecto del calentamiento en RL: permite analizar si la fase previa de warm-up (sugerida por el nombre) mejora la estabilidad de GRPO con LoRA, un problema conocido cuando el adaptador parte de pesos aleatorios.
- Docencia y formación técnica: es un ejemplo compacto de pipeline TRL + PEFT + GRPO que cabe en una GPU de consumo, útil para enseñar ajuste por refuerzo sin infraestructura grande.
- Generación de texto en entornos con restricciones de memoria (tras fusionar y cuantizar): un modelo de 3B cuantizado a 4 bits ocupa alrededor de 2 GB, lo que permite desplegarlo en portátiles o dispositivos con GPU integrada para tareas de asistencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye sección de evaluación con datos, y no se han encontrado métricas de MMLU, HumanEval, GSM8K ni de olvido (forget quality, model utility, robustez frente a re-aprendizaje) asociadas a este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 6,2 GB solo de pesos del modelo base, más caché KV y sobrecarga del runtime; en la práctica, entre 8 y 10 GB según longitud de contexto y tamaño de lote.
- VRAM estimada en 8 bits: alrededor de 3,3 GB de pesos, con un total de 5 a 6 GB en ejecución.
- VRAM estimada en 4 bits (GGUF Q4_K_M): aproximadamente 1,9 GB de pesos, con un total de 3 a 4 GB para contextos moderados.
- Caché KV: con 36 capas, 2 cabezas KV de 128 dimensiones y fp16, el coste es de unos 36 KB por token, es decir, en torno a 1,1-1,2 GB para los 32.768 tokens de contexto completo. En la práctica conviene limitar la ventana si la VRAM es ajustada.
- GPU consumer: cabe con holgura en una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 Ti, RTX 4080 y RTX 4090 (24 GB), especialmente con cuantización de 4 u 8 bits. En GPUs de 6-8 GB solo es viable con cuantización agresiva y contextos cortos.
- GPU de datacenter: L4, A10G y A100 40 GB ejecutan el modelo sin dificultad; A100 80 GB y H100 están sobredimensionadas para un modelo de este tamaño salvo que se busque throughput alto con lotes grandes.
- Opciones de despliegue: transformers + peft para cargar el adaptador directamente; vLLM con soporte de LoRA (`--enable-lora`) para servir el adaptador junto al base; TGI con adaptadores LoRA; llama.cpp u Ollama únicamente después de fusionar el adaptador con el modelo base y convertir los pesos a GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

Los datos estructurales de los modelos comparados proceden de su documentación pública; el rendimiento no se puede comparar porque este adaptador no publica benchmarks.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| unlearning-r2-warmed-qwen-qwen2-5-3b-instruct-john-d-rockefeller-r4 | 3.090 M (base) + adaptador LoRA de tamaño no disponible | 32.768 tokens (heredado del base) | no disponible | Hugging Face, 0 descargas | no disponible |
| Qwen/Qwen2.5-3B-Instruct (modelo base) | 3.090 M | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente utilizado | Benchmarks publicados por el equipo de Qwen |
| Llama-3.2-3B-Instruct | 3.210 M | 128.000 tokens | Licencia comunitaria de Llama 3.2 | Hugging Face, muy extendido | Benchmarks publicados por Meta |
| Phi-3.5-mini-instruct | 3.820 M | 128.000 tokens | MIT | Hugging Face, muy extendido | Benchmarks publicados por Microsoft |

Frente al modelo base, este adaptador añade el comportamiento de des-aprendizaje, pero pierde garantías de calidad al no existir evaluación. Frente a Llama-3.2-3B-Instruct y Phi-3.5-mini-instruct, el principal diferencial no es el rendimiento sino el propósito: es un artefacto de investigación sobre olvido selectivo, no un modelo instruct de uso general. No se conocen otros adaptadores públicos de des-aprendizaje directamente comparables en la información disponible.

## Limitaciones y advertencias

- Model card vacía: la documentación es la plantilla por defecto de Hugging Face. No hay información sobre datos de entrenamiento, hiperparámetros, función de recompensa ni proceso de evaluación.
- No es un modelo autónomo: requiere descargar y cargar Qwen2.5-3B-Instruct por separado y aplicar el adaptador con PEFT. No se publican pesos fusionados ni GGUF.
- Licencia no disponible: no se especifican los términos de uso. Esto impide confirmar si se permite el uso comercial y crea incertidumbre legal, agravada por la posible interacción con los términos del modelo base.
- Sin validación de la comunidad: 0 descargas y 0 "likes" en el momento de la ficha. No hay informes independientes, issues ni réplicas.
- Tamaño de repositorio anómalo: 0,5 GB es muy superior a lo esperable en un adaptador LoRA de rango bajo sobre 3B. El autor no detalla el contenido.
- Degradación de conocimiento: el objetivo del des-aprendizaje implica eliminar deliberadamente información factual. Cabe esperar pérdida de precisión en preguntas relacionadas, histórico-económicas o contextuales, y un aumento de la tasa de alucinación en ese dominio.
- Robustez del olvido no medida: no hay evidencia de que el conocimiento eliminado no pueda recuperarse mediante prompts indirectos, fine-tuning posterior o consultas multilingües.
- Idiomas no declarados: no se puede confirmar el comportamiento del adaptador fuera del inglés, pese a que el modelo base es multilingüe.
- Sesgos heredados: el adaptador conserva los sesgos del modelo base y del corpus de instrucciones de Qwen2.5, más cualquier sesgo introducido por la función de recompensa del proceso GRPO.
- Entidad nombrada en el identificador: el modelo se presenta como un ejercicio de olvido sobre una persona concreta. Aunque John D. Rockefeller es una figura histórica fallecida, el uso de nombres de personas o entidades reales en experimentos de des-aprendizaje plantea cuestiones de exactitud factual y de metodología que conviene explicitar en cualquier trabajo derivado.
- Riesgo en producción: sin métricas de olvido ni de utilidad retenida, no es recomendable desplegar este adaptador en aplicaciones reales donde la corrección factual sea crítica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rubenbalbastre/unlearning-r2-warmed-qwen-qwen2-5-3b-instruct-john-d-rockefeller-r4
- Paper asociado (arXiv:2608.17804): https://arxiv.org/abs/2608.17804
- Modelo base Qwen/Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL (implementación de GRPO): https://github.com/huggingface/trl
- Repositorio de transformers: https://github.com/huggingface/transformers
