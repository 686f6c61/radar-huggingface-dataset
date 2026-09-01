# Amr-Hegazy/grt-medium-isoflop

## Resumen

El modelo **GRT Medium (isoFLOP)** es un checkpoint del **Gated Recurrent Transformer (GRT)**, una arquitectura de lenguaje recurrente que comparte un mismo bloque transformer a lo largo de múltiples pasos. Fue desarrollado por Amr Hegazy, Amr Alanwar y Mostafa Elhoushi, y se describe en el artículo *Gated Recurrent Transformers: Expressive Depth through Recurrent Modulation* (arXiv:2608.15062). El objetivo principal es reducir el número de parámetros únicos sin sacrificar la profundidad expresiva: en lugar de apilar capas independientes, el modelo itera un núcleo compartido varias veces, lo que permite alcanzar una profundidad efectiva alta con un coste paramétrico mucho menor.

Esta versión concreta, denominada *medium-isoflop*, está calibrada para igualar el coste de inferencia (FLOPs) de un transformer estándar de tamaño medio, pero con menos parámetros únicos. Concretamente, la configuración 2+20×4+2 ejecuta 84 bloques por token (2 bloques preludio, 20 iteraciones del núcleo compartido, 2 bloques coda) almacenando únicamente 24 bloques únicos. El modelo tiene aproximadamente 358 millones de parámetros, una ventana de contexto de 1024 tokens y se entrenó sobre unos 9.800 millones de tokens del dataset Common Pile filtrado (CCCC). La relevancia actual radica en que demuestra una vía práctica para construir modelos eficientes en memoria y con capacidad de *early exiting* en inferencia, sin necesidad de pérdidas auxiliares.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente con compartición de pesos (prelude → núcleo compartido × R → coda) |
| Parametros totales | 359.847.936 (~358M) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (pesos en FP32/FP16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura GRT se compone de tres secciones: un conjunto fijo de bloques *prelude* (2 bloques), un núcleo compartido de 20 bloques que se itera 4 veces (R=4) y un conjunto fijo de bloques *coda* (2 bloques). Durante cada iteración del núcleo, se inyecta la salida de los bloques prelude concatenada con el estado oculto con ruido y se re-proyecta, lo que permite anclar cada paso a la representación original de la entrada. Además, un MLP con activación sigmoide (inicializado cerca de σ(+4) ≈ 0.98) controla qué elementos del bloque compartido se integran en el flujo residual, aprendiendo progresivamente qué información sobrescribir. Se añade ruido gaussiano tanto al estado oculto como a los logits de la puerta en cada paso, lo que evita que el modelo caiga en patrones de coincidencia exacta frágiles y previene el colapso de las puertas.

El entrenamiento se realizó sobre el dataset Common Pile filtrado (CCCC), con aproximadamente 9.800 millones de tokens. La profundidad de recurrencia R se muestrea uniformemente durante el entrenamiento y se fija en inferencia, lo que permite *early exiting* desde un mismo checkpoint sin pérdidas auxiliares. El modelo alcanza una pérdida de validación de 2.7632. Según el artículo, bajo una restricción isoFLOP un GRT de 3 capas iguala la precisión de un GPT-2 Small de 12 capas, y bajo restricción isoParam la recurrencia más profunda logra 2.76 frente a 2.84 de un modelo no recurrente con los mismos parámetros y datos.

## Capacidades

- Generación de texto autoregresiva en inglés: el modelo produce texto coherente y contextualizado dada una secuencia de entrada.
- *Early exiting* en inferencia: al fijar la profundidad de recurrencia R en tiempo de inferencia, se puede ajustar el coste computacional según la necesidad de precisión o latencia.
- Eficiencia paramétrica: al compartir pesos entre capas, el modelo requiere menos parámetros únicos que un transformer estándar de profundidad equivalente, lo que facilita su despliegue en entornos con memoria limitada.
- No se documentan capacidades de *tool calling*, *function calling*, razonamiento multi-paso estructurado, visión o audio.
- Multilingüismo: únicamente inglés; no hay evidencia de soporte para otros idiomas.

## Casos de uso

- Generación de texto para prototipado rápido: gracias a su tamaño moderado (~358M parámetros) y su capacidad de *early exiting*, es adecuado para experimentos de generación narrativa o creativa en inglés en entornos de desarrollo sin GPU de alta gama.
- Chatbots simples de dominio específico: con *fine-tuning* sobre un corpus reducido, puede servir como base para asistentes conversacionales en inglés con un presupuesto de cómputo modesto.
- Clasificación de texto y análisis de sentimiento: al ser un modelo transformer, puede adaptarse mediante cabezales de clasificación para tareas como análisis de opiniones, categorización de documentos o detección de spam, siempre que se realice un ajuste fino.
- Completado de código en entornos de bajo consumo: aunque no está entrenado específicamente para código, su arquitectura generalista permite, tras *fine-tuning*, generar fragmentos de código en lenguajes como Python o JavaScript en dispositivos con limitaciones de memoria.
- Investigación en eficiencia de modelos: sirve como banco de pruebas para estudiar el impacto de la compartición de pesos, el *early exiting* y las técnicas de regularización por ruido en transformers recurrentes.
- Entornos educativos y académicos: al ser un modelo abierto con licencia CC-BY-4.0 y código disponible, es útil para enseñar conceptos de arquitecturas recurrentes, compartición de pesos y análisis de trade-offs entre parámetros y FLOPs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El artículo reporta únicamente la pérdida de validación y comparaciones con modelos de referencia:

| Modelo | Configuración | Parámetros | Pérdida de validación |
|---|---|---|---|
| GRT Medium (isoFLOP) | 2+20×4+2 | ~358M | 2.7632 |
| GRT (isoParam, no recurrente) | no especificado | no especificado | 2.84 |
| GPT-2 Small (12 capas) | estándar | 124M | igualado por GRT de 3 capas en isoFLOP |

Estos datos provienen del paper y del repositorio GitHub. No hay cifras de precisión en tareas downstream ni comparaciones con otros modelos contemporáneos.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16, el modelo ocupa aproximadamente 700 MB; en FP32, unos 1,4 GB. Esto permite ejecutarlo en GPUs con 4 GB de VRAM o más.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 3060, o superiores). No se requieren GPUs de datacenter.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs consumer actuales y también en CPUs mediante conversión a formatos cuantizados (aunque no se proporcionan oficialmente).
- Opciones de despliegue: el modelo se distribuye en formato PyTorch/safetensors. Se puede convertir a GGUF para usarlo con llama.cpp u Ollama, o servir con vLLM o TGI tras adaptar el código. El repositorio GitHub incluye scripts de muestreo (`sample.py`).
- Latencia y throughput: no disponible. No se han publicado mediciones de velocidad de generación.

## Comparativa con modelos similares

La comparativa se basa en los datos del paper, que sitúa al GRT frente a transformers estándar bajo restricciones isoFLOP e isoParam:

| Modelo | Parámetros | Contexto | Pérdida de validación | Licencia |
|---|---|---|---|---|
| GRT Medium (isoFLOP) | ~358M | 1024 | 2.7632 | CC-BY-4.0 |
| GPT-2 Medium | ~355M | 1024 | no reportado en la fuente | MIT |
| GPT-2 Small | ~124M | 1024 | no reportado en la fuente | MIT |

El paper indica que un GRT de 3 capas iguala la precisión de GPT-2 Small (12 capas) bajo el mismo coste de FLOPs, y que con los mismos parámetros y datos, la versión recurrente supera a la no recurrente (2.76 vs 2.84). No se dispone de comparaciones con modelos recurrentes modernos como RWKV o Mamba en la información proporcionada.

## Limitaciones y advertencias

- El modelo se entrenó exclusivamente en inglés; no es adecuado para tareas multilingües sin un *fine-tuning* adicional.
- La longitud de contexto está limitada a 1024 tokens, lo que restringe su uso en tareas que requieran ventanas largas (por ejemplo, resumen de documentos extensos).
- Al ser un modelo relativamente pequeño (358M) entrenado con solo ~9.8B tokens, su conocimiento general y su capacidad de razonamiento son inferiores a los de modelos de mayor escala.
- Riesgo de alucinaciones: como cualquier modelo de lenguaje, puede generar contenido falso o incoherente, especialmente en dominios especializados.
- No se documentan sesgos específicos, pero el dataset CCCC filtrado puede contener sesgos inherentes de la web.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero es responsabilidad del usuario cumplir con los términos de la licencia y verificar la procedencia de los datos de entrenamiento.
- No hay soporte oficial para *tool calling*, *function calling* ni integración con agentes; estas capacidades requerirían adaptaciones externas.
- El modelo no incluye mecanismos de seguridad específicos (filtros de contenido, *guardrails*); se recomienda implementar medidas de moderación antes de desplegarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Amr-Hegazy/grt-medium-isoflop
- Artículo arXiv (PDF): https://arxiv.org/pdf/2608.15062v4
- Artículo arXiv (HTML): https://arxiv.org/html/2608.15062v3
- Repositorio GitHub: https://github.com/Amr-Hegazy1/gated-recurrent-transformer
- Perfil del autor en Hugging Face: https://huggingface.co/Amr-Hegazy
- Página en Semantic Scholar: https://www.semanticscholar.org/paper/Gated-Recurrent-Transformers%3A-Expressive-Depth-Hegazy-Alanwar/c03a778e0990fb4d29374f667023896b97a03cde
