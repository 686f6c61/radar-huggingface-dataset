# CharlieBT/gx29-decider

## Resumen
`CharlieBT/gx29-decider` es un modelo de clasificación de texto derivado por fine-tuning de `baselabs/mammoth-1`, publicado por el usuario CharlieBT en HuggingFace. Su propósito declarado, según los tags del repositorio, es actuar como "decider" o "decision-model" dentro de un sistema denominado Reax: es decir, un componente que recibe una entrada textual y emite una decisión clasificatoria, presumiblemente dentro de un pipeline mayor de agentes o enrutamiento. No se trata, por tanto, de un modelo generativo de propósito general, sino de un clasificador especializado construido sobre una base de gran tamaño.

El dato técnico más llamativo es su escala: 26.085.330.160 parámetros en safetensors (unos 26,1 mil millones), lo que sitúa al modelo en la categoría de 26B, un tamaño desproporcionadamente grande para una tarea de clasificación. El repositorio ocupa 52,2 GB y la arquitectura declarada en los tags es `qwen3_5`, lo que sugiere que el modelo base `baselabs/mammoth-1` emplea una arquitectura de la familia Qwen 3.5. La licencia es Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones en HuggingFace.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo muy reciente (creado el 28 de octubre de 2026), con solo 2 descargas y 0 likes, sin documentación pública sobre idiomas, datos de entrenamiento o benchmarks. Es un artefacto de nicho, probablemente parte de un sistema propietario o experimental, y debe evaluarse con cautela por la ausencia casi total de información verificable más allá de los metadatos de HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tags del repositorio) |
| Parámetros totales | 26.085.330.160 (26,1B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura declarada es `qwen3_5`, lo que indica que el modelo base `baselabs/mammoth-1` pertenece a la familia Qwen 3.5, presumiblemente un transformer decoder-only con atención estándar o alguna variante optimizada. Sin embargo, no se dispone de información sobre el número de capas, dimensión oculta, número de cabezas de atención, tipo de normalización ni detalles del tokenizador. Tampoco se especifica si el modelo emplea mezcla de expertos (MoE), aunque el tamaño de 26,1B parámetros totales sin mención de parámetros activos sugiere una arquitectura densa.

En cuanto al entrenamiento, no hay información pública sobre el número de tokens utilizados, la composición del dataset, la existencia de RLHF, DPO o cualquier otra fase de alineamiento. El fine-tuning desde `baselabs/mammoth-1` hacia una tarea de clasificación ("decider") implica presumiblemente la sustitución de la cabeza de generación por una cabeza clasificatoria, pero no se detalla el proceso. No se han publicado innovaciones técnicas destacables (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades
- Clasificación de texto: la pipeline declarada es `text-classification`, por lo que el modelo está diseñado para asignar etiquetas o categorías a entradas textuales.
- Función de "decider" en el sistema Reax: según los tags, actúa como componente de decisión, probablemente enrutando o seleccionando acciones dentro de un pipeline de agentes.
- No se dispone de información sobre generación de texto, razonamiento, código, matemáticas o visión.
- No se dispone de información sobre soporte de tool calling o function calling.
- No se dispone de información sobre capacidades multilingües (idiomas no disponibles).
- No se dispone de información sobre modos especiales (thinking mode, visión, audio, etc.).

## Casos de uso
- Enrutamiento de consultas en sistemas de agentes: el modelo podría recibir una consulta de usuario y clasificarla para decidir qué herramienta, subagente o flujo activar dentro de un sistema tipo Reax. Su tamaño de 26B permitiría, en teoría, capturar matices semánticos finos, aunque no hay evidencia pública de su rendimiento.
- Clasificación de intenciones en atención al cliente: integrado en un pipeline de soporte, podría etiquetar tickets o mensajes entrantes por categoría (queja, consulta, solicitud) para derivarlos al equipo adecuado, aprovechando su base de gran tamaño para desambiguar lenguaje natural complejo.
- Moderación de contenido: como clasificador binario o multiclase, podría evaluar textos para detectar contenido no deseado, aunque se desconoce si fue entrenado para ello y no hay métricas publicadas.
- Filtrado de documentos en pipelines RAG: podría actuar como "decider" para seleccionar qué fragmentos recuperados son relevantes antes de pasarlos a un modelo generador, reduciendo ruido en la ventana de contexto.
- Clasificación de código o logs en herramientas de desarrollo: dentro de un sistema de CI/CD o análisis estático, podría categorizar errores o mensajes de log, aunque no hay información sobre su entrenamiento en dominios técnicos.
- Componente de decisión en sistemas multiagente: en arquitecturas donde varios agentes compiten o colaboran, este modelo podría emitir la decisión final sobre qué agente responde o qué acción se ejecuta, siempre que se valide su comportamiento con datos propios.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: con 26,1B parámetros en fp16, se requieren aproximadamente 52 GB de VRAM solo para los pesos; en int8, unos 26 GB; en int4, unos 13-15 GB. Estas estimaciones son teóricas y no están confirmadas por el autor.
- GPU recomendadas: para fp16, se necesitan GPUs de 80 GB (A100, H100) o múltiples GPUs menores. Para int8, una A100 de 40 GB o una RTX 6000 Ada de 48 GB podría ser suficiente. Para int4, una RTX 4090 de 24 GB podría albergar los pesos, aunque el throughput sería limitado.
- ¿Cabe en consumer GPU? En cuantización int4, potencialmente en una RTX 4090 (24 GB) o RTX 3090 (24 GB), pero no hay confirmación de que el modelo funcione correctamente en dichas configuraciones ni de que existan pesos GGUF disponibles.
- Opciones de despliegue: no se dispone de información sobre compatibilidad con vLLM, llama.cpp, Ollama, TGI u otros motores. Al ser un modelo de clasificación, requeriría un servidor de inferencia adaptado a la tarea (por ejemplo, un endpoint personalizado con Transformers).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares
No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo es un fine-tuning de clasificación sobre una base de 26B, una configuración atípica. Como referencia genérica, se podría comparar con clasificadores basados en modelos más pequeños (por ejemplo, DeBERTa-v3-large de 435M o RoBERTa-large de 355M), que ofrecen latencias mucho menores y menores requisitos de hardware, aunque con menor capacidad de representación. También con modelos de 7B-13B ajustados para clasificación, que equilibran tamaño y rendimiento. Sin embargo, no hay datos de rendimiento de `gx29-decider` que permitan una comparación cuantitativa, y no se conocen alternativas directas del mismo autor o del sistema Reax.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CharlieBT/gx29-decider | 26,1B | no disponible | Apache 2.0 | Gated en HuggingFace |
| DeBERTa-v3-large (referencia) | 435M | 512 | MIT | Pública |
| RoBERTa-large (referencia) | 355M | 512 | MIT | Pública |
| Qwen2.5-7B-Instruct (referencia) | 7,6B | 128K | Apache 2.0 | Pública |

## Limitaciones y advertencias
- Ausencia total de documentación: no hay model card, paper, blog ni ejemplos de uso publicados por el autor. Cualquier uso en producción requiere una evaluación empírica propia.
- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace para descargar el modelo, lo que puede limitar su uso en entornos automatizados o de investigación.
- Idiomas no especificados: se desconoce si el modelo funciona correctamente en castellano u otros idiomas distintos del inglés, lo que es un riesgo importante para aplicaciones multilingües.
- Riesgo de alucinación: aunque es un clasificador, la base generativa de 26B podría producir salidas no calibradas o erróneas en entradas fuera de distribución; sin benchmarks, no se puede estimar su fiabilidad.
- Sesgos desconocidos: al no conocer los datos de entrenamiento ni el proceso de fine-tuning, no se pueden evaluar sesgos de género, raza, idioma o dominio.
- Tamaño desproporcionado: 26,1B parámetros para una tarea de clasificación implica costes de inferencia y hardware muy elevados en comparación con alternativas especializadas de menor tamaño, sin garantía de mejor rendimiento.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo derivado de `baselabs/mammoth-1`, deben verificarse las condiciones de la licencia del modelo base (no disponibles en la información proporcionada).
- Fecha de creación futura (2026): el metadato indica una fecha de creación posterior a la actual, lo que sugiere que el repositorio podría ser experimental, estar mal fechado o formar parte de un entorno de pruebas; conviene tratar la información con escepticismo.

## Enlaces
- HuggingFace: https://huggingface.co/CharlieBT/gx29-decider
- Modelo base: https://huggingface.co/baselabs/mammoth-1 (referenciado en los tags, no verificado)
