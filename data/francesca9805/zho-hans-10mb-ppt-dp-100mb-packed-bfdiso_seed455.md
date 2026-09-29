# francesca9805/zho-hans-10mb-ppt-Dp-100mb-packed-bfdiso_seed455

## Resumen

El modelo `francesca9805/zho-hans-10mb-ppt-Dp-100mb-packed-bfdiso_seed455` es un ajuste fino supervisado (SFT) del modelo monolingüe `goldfish-models/zho_hans_10mb`, orientado a chino simplificado y publicado en HuggingFace por el usuario francesca9805, vinculado al proyecto de Weights & Biases "new-tokenizers" de la Universidad de Groningen. Se trata de un modelo extremadamente pequeño: 39.087.104 parámetros (unos 39 millones), con pesos en safetensors y un repositorio de 0,1 GB, lo que lo sitúa muy por debajo incluso de GPT-2 small.

El problema que aborda no es el de un asistente de propósito general, sino el de un artefacto de investigación: el nombre del modelo sugiere un experimento controlado sobre tokenización, volumen de datos (10 MB de corpus, 100 MB empaquetados), posible manipulación del dataset ("Dp", posiblemente *data poisoning*) y reproducibilidad por semilla (seed455). Se entrenó con TRL 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.5.1, y admite el pipeline `text-generation` con plantilla de chat.

Su relevancia actual es, por tanto, metodológica más que de producto: sirve para estudiar cómo afectan el tokenizador, el empaquetado de datos y la composición del corpus a un modelo causal diminuto, y para validar infraestructura de entrenamiento e inferencia a coste casi nulo. No hay resultados de benchmarks publicados ni licencia declarada de forma explícita, por lo que no debe considerarse un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only tipo GPT-2 (según el tag `gpt2` de la ficha) |
| Parámetros totales | 39.087.104 (dato real de safetensors) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible; no se han publicado versiones cuantizadas |
| Idiomas soportados | chino simplificado, heredado del modelo base `goldfish-models/zho_hans_10mb`; no se declaran otros idiomas |
| Licencia | no disponible (la model card indica `licence: license` sin especificar términos) |
| Formato de pesos | safetensors (librería `transformers`) |
| Tamaño del repositorio | 0,1 GB |
| Modelo base | `goldfish-models/zho_hans_10mb` |
| Método de ajuste | SFT con TRL |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal de tipo GPT-2 (el autor etiqueta el modelo con `gpt2`), con 39.087.104 parámetros en total. Es una arquitectura densa, sin mezcla de expertos ni componentes de estado (SSM) ni híbridos. El modelo es un ajuste fino del checkpoint `goldfish-models/zho_hans_10mb`, que forma parte de la familia Goldfish de modelos monolingües de dominio público para cientos de idiomas; en este caso, la variante corresponde a chino simplificado con un corpus de entrenamiento del orden de 10 MB, según se deduce del propio identificador.

El entrenamiento se realizó mediante *supervised fine-tuning* (SFT) con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. La ficha no documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO; el tag `sft` indica que solo se aplicó ajuste supervisado. El nombre del modelo sugiere además un corpus empaquetado (*packed*) de 100 MB y alguna forma de ablación sobre los datos o el tokenizador, pero estos detalles no están confirmados en la información disponible. No se describen innovaciones técnicas como decodificación especulativa, atención lineal o cuantización nativa.

## Capacidades

- Generación de texto causal en chino simplificado (herencia directa del modelo base), limitada a secuencias cortas dadas las 39 M de parámetros.
- Formato conversacional: la model card incluye un ejemplo con `pipeline("text-generation")` que pasa una lista de mensajes con rol `user`, lo que indica que el ajuste SFT introdujo una plantilla de chat.
- Razonamiento multi-paso, matemáticas y código: no hay evidencia en la información disponible de que estas capacidades estén presentes de forma fiable; con 39 M de parámetros y 10 MB de corpus base, son altamente improbables.
- *Tool calling* / *function calling*: no disponible; no se documenta soporte.
- Uso como agente: no disponible; no se documenta soporte de razonamiento multi-paso ni de bucles de herramientas.
- Multilingüismo: no documentado; el modelo base es monolingüe de chino simplificado.
- Capacidades especiales (visión, audio, *thinking mode*): no disponible.
- Compatibilidad de despliegue: la ficha incluye el tag `text-generation-inference` y `endpoints_compatible`, lo que indica que puede servirse con TGI en HuggingFace Endpoints.
- Reproducibilidad: el nombre incluye `seed455`, lo que apunta a un experimento con semilla fija reproducible.

## Casos de uso

- Investigación sobre tokenizadores: el modelo pertenece al proyecto de W&B "new-tokenizers" y parte de un corpus de 10 MB; sirve para medir el impacto de distintas estrategias de tokenización en la perplejidad y la calidad de generación de un modelo causal diminuto.
- Pruebas de humo en pipelines de entrenamiento: al ocupar 0,1 GB y 39 M de parámetros, permite validar scripts de SFT con TRL, plantillas de chat, configuración de `Trainer` y logging en integración continua sin consumir GPU asignada a experimentos reales.
- Ablaciones de envenenamiento o filtrado de datos: el segmento `Dp` del nombre sugiere experimentos de *data poisoning*; el checkpoint sirve como referencia contaminada frente a otros checkpoints del mismo corpus para estudiar la degradación del modelo.
- Docencia y talleres de fine-tuning: cabe en CPU y en cualquier GPU consumer, de modo que un aula completa puede ajustar y evaluar el modelo en minutos con recursos mínimos.
- Inferencia en entornos embebidos o *edge*: los pesos en fp32 ocupan aproximadamente 156 MB y en fp16 unos 78 MB, por lo que es desplegable en dispositivos con memoria muy limitada para tareas de generación de texto corto en chino.
- Generación de texto auxiliar de baja criticidad: plantillas, relleno de campos, autocompletado de frases cortas en chino simplificado donde un modelo mayor no está justificado por coste.
- Comparación de checkpoints por semilla: al estar etiquetado con `seed455`, permite estudiar la varianza entre ejecuciones idénticas salvo por la semilla, un caso de uso habitual en estudios de reproducibilidad.
- Destilación y *curriculum learning*: puede actuar como alumno pequeño o como primer escalón en una cascada de modelos antes de recurrir a modelos de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Perplejidad en chino | no disponible |
| Evaluación de la familia Goldfish | no disponible para este checkpoint concreto |

No se han publicado tarjetas de evaluación, métricas de pérdida ni curvas de entrenamiento más allá del enlace a la ejecución de Weights & Biases.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en cualquier precisión razonable. Los pesos ocupan aproximadamente 156 MB en fp32 y 78 MB en fp16/bf16; el resto es sobrecarga del runtime de PyTorch y de los *kernels* CUDA.
- RAM para inferencia en CPU: suficiente con 1 GB, incluyendo el intérprete de Python y las dependencias.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria. Funciona con solvencia en RTX 3060, RTX 4060, RTX 4090, T4, L4, A10, A100 y H100; el modelo está tan sobredimensionado en hardware que la latencia vendrá dominada por la sobrecarga de lanzamiento de *kernels*.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU con memoria compartida y en CPU pura.
- Opciones de despliegue: `transformers` con `pipeline("text-generation")`, servidor TGI (los tags `text-generation-inference` y `endpoints_compatible` lo indican), HuggingFace Inference Endpoints. Para Ollama o llama.cpp sería necesaria una conversión manual a GGUF, no publicada.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `francesca9805/zho-hans-10mb-ppt-Dp-100mb-packed-bfdiso_seed455` | 39,1 M | no disponible | no disponible | HuggingFace, safetensors | Ajuste SFT con TRL sobre corpus de 10 MB en chino |
| `goldfish-models/zho_hans_10mb` | no disponible | no disponible | no disponible en la información consultada | HuggingFace | Modelo base monolingüe de chino simplificado de la familia Goldfish |
| GPT-2 small (`openai-community/gpt2`) | 124 M | 1.024 tokens | MIT (según la model card pública) | HuggingFace, ampliamente distribuido | Referencia clásica de modelo causal pequeño; aproximadamente 3 veces más parámetros |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache 2.0 (según la model card pública) | HuggingFace | Alternativa moderna con soporte multilingüe y contexto largo; no es comparable en coste de inferencia |

La comparación directa más relevante es con su propio modelo base, del que solo se diferencia por el ajuste SFT y por el pipeline de datos empleado. Frente a GPT-2 small o Qwen2.5-0.5B, este checkpoint es un orden de magnitud más pequeño y no está pensado para competir en calidad de generación.

## Limitaciones y advertencias

- Rendimiento muy limitado: 39 M de parámetros y un corpus base de 10 MB implican una capacidad de generalización y de coherencia muy reducida, con alta probabilidad de salidas incoherentes o repetitivas más allá de unas pocas decenas de tokens.
- Riesgo de alucinación: al no estar alineado con RLHF ni DPO (solo SFT), no hay mecanismos de mitigación de afirmaciones falsas; en un modelo de este tamaño el problema se acentúa.
- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluación de sesgos, toxicidad o sesgo de género, y un corpus de 10 MB es insuficiente para representar la diversidad del chino simplificado.
- Limitaciones de idioma: el modelo base es monolingüe de chino simplificado; no hay evidencia de competencia en castellano ni en otros idiomas, pese a que el prompt de ejemplo de la model card esté en inglés.
- Longitud de contexto: no declarada. Un contexto corto limita cualquier uso conversacional multi-turno.
- Licencia: no disponible. La model card indica `licence: license` sin concretar términos, lo que impide confirmar si el uso comercial está permitido. Además, la licencia del modelo base Goldfish debe verificarse por separado antes de cualquier uso en producción.
- Trazabilidad: el nombre del modelo sugiere variantes de datos o de envenenamiento (`Dp`) que no están documentadas; usar el checkpoint sin conocer esas condiciones puede invalidar conclusiones experimentales.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin versión de modelo asociada ni historial de mantenimiento.
- No apto para producción: no hay benchmarks, no hay licencia clara, no hay versiones cuantizadas y no hay soporte de *tool calling*, por lo que no debería integrarse en sistemas con usuarios reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/zho-hans-10mb-ppt-Dp-100mb-packed-bfdiso_seed455
- Modelo base: https://huggingface.co/goldfish-models/zho_hans_10mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/gjalrfgx
- Paper de referencia sobre TRL (von Werra et al.): citado en la model card, sin enlace directo disponible
- Búsqueda web realizada: los resultados obtenidos no guardan relación con el modelo (foros en francés sobre cámaras web y sitios de contacto), por lo que no se han podido incorporar fuentes adicionales, papers, demos ni repositorios relacionados.
