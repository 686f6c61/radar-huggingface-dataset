# francesca9805/ita-latn-100mb-ppt-Dp-10mb-packed-bfd_seed3407

## Resumen

`francesca9805/ita-latn-100mb-ppt-Dp-10mb-packed-bfd_seed3407` es un ajuste fino supervisado (SFT) del modelo monolingüe italiano `goldfish-models/ita_latn_100mb`, entrenado con la librería TRL y publicado en HuggingFace por el usuario `francesca9805`. El checkpoint resultante tiene 124.770.816 parámetros (~125 M) y ocupa 0,3 GB en safetensors, lo que lo sitúa en la categoría de modelos pequeños de investigación, no de propósito general.

El modelo base pertenece a la familia Goldfish, que publica modelos monolingües entrenados con aproximadamente 100 MB de texto por idioma; en este caso el subconjunto es `ita_latn` (italiano en escritura latina). El ajuste se ha realizado con SFT sobre un dataset que el propio nombre del repositorio sugiere de 10 MB empaquetados ("packed") con semilla 3407, aunque la model card no documenta la composición del corpus, el número de tokens ni el proceso de anotación.

Su relevancia es acotada y experimental: sirve como ejemplo reproducible de pipeline de ajuste con TRL, como punto de partida para experimentos de fine-tuning en italiano y como caso de estudio de modelos de 125 M parámetros adaptados a formato conversacional. No hay benchmarks, ni licencia declarada, ni métricas de evaluación publicadas, por lo que no es un modelo apto para producción sin validación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only denso; etiqueta `gpt2` en los tags del repositorio) |
| Parámetros totales | 124.770.816 (dato real de los pesos safetensors) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se publican pesos cuantizados ni GGUF; la conversión es posible por parte del usuario) |
| Idiomas soportados | no disponible (el identificador y el modelo base apuntan a italiano, `ita_latn`, pero la model card no lo confirma) |
| Licencia | no disponible (la model card incluye un marcador de posición: `licence: license`) |
| Formato de pesos | safetensors (compatible con Transformers) |
| Modelo base | `goldfish-models/ita_latn_100mb` |
| Tamaño del repositorio | 0,3 GB |
| Librería | transformers |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización (según metadatos de HuggingFace) | 2026-09-22 / 2026-09-22 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de tipo GPT-2, con 124.770.816 parámetros y sin componentes MoE ni mecanismos de atención alternativos documentados. El modelo base `goldfish-models/ita_latn_100mb` procede de la familia Goldfish, orientada a modelos monolingües de ~100 MB de texto de entrenamiento por idioma; no se dispone de información sobre el tokenizador, la longitud de contexto ni la composición exacta de ese corpus en la documentación proporcionada.

El ajuste se realizó mediante SFT con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. El ejemplo de uso del repositorio invoca el pipeline con una lista de mensajes con roles (`{"role": "user", "content": ...}`), lo que indica que el modelo se entrenó con una plantilla conversacional, aunque dicha plantilla no se documenta. No hay información sobre el volumen de tokens de entrenamiento, la naturaleza del dataset (el nombre sugiere 10 MB empaquetados y una semilla 3407), el uso de RLHF o DPO, ni sobre ninguna innovación técnica adicional. El run de entrenamiento está registrado en Weights & Biases bajo el proyecto `f-padovani-university-of-groningen/new-tokenizers`.

## Capacidades

- Generación de texto autoregresiva con el pipeline `text-generation` de Transformers, incluyendo entrada en formato de mensajes con roles.
- Generación de texto en italiano: es la capacidad esperada por el modelo base `ita_latn`, aunque no está verificada con evaluaciones en la información disponible.
- Compatibilidad declarada con text-generation-inference y con endpoints (tags `text-generation-inference` y `endpoints_compatible`).
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agentes ni de razonamiento multi-paso.
- No hay evidencia de capacidades multilingües más allá del italiano del modelo base.
- No hay evidencia de visión, audio, modo "thinking" ni otras capacidades especiales.
- No hay evidencia de rendimiento específico en código, matemáticas o tareas de razonamiento formal.

## Casos de uso

- Reproducción de pipelines de SFT con TRL: el repositorio documenta versiones exactas de TRL, Transformers, PyTorch, Datasets y Tokenizers, lo que permite replicar el flujo de ajuste como referencia didáctica o como plantilla interna.
- Experimentación académica en modelos monolingües pequeños: sirve para estudiar cómo se comporta un modelo de 125 M parámetros entrenado con ~100 MB de italiano tras un ajuste conversacional, en escenarios de ablación con distintas semillas o volúmenes de datos.
- Generación de texto italiano de dominio restringido: con un ajuste adicional sobre un corpus propio (legal, técnico, literario), puede emplearse para completar frases o generar borradores cortos, siempre con revisión humana por su tamaño reducido.
- Prototipado de infraestructura de despliegue: al ser compatible con text-generation-inference y endpoints, resulta útil para validar configuraciones de servido, plantillas de prompt y pipelines de CI/CD antes de migrar a modelos mayores.
- Docencia y formación técnica: permite ilustrar en un taller el ciclo completo de ajuste, versionado en HuggingFace, registro en W&B y publicación de un modelo, con un coste de cómputo bajo.
- Pruebas de estrés de tokenizadores y plantillas: útil para comparar el comportamiento del tokenizador del modelo base Goldfish frente a otros tokenizadores en italiano (fertility, tokens por palabra, manejo de acentos y elisiones).
- Baseline en investigaciones comparativas: como punto de referencia inferior en estudios que midan la ganancia de modelos italianos de mayor tamaño o de mayor volumen de datos.
- Generación de datos sintéticos auxiliares: con filtrado y verificación posteriores, puede producir plantillas o variaciones de frases en italiano para aumentar datasets de tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (MMLU, HumanEval, GSM8K ni equivalentes en italiano), y el repositorio no referencia ningún leaderboard o informe de evaluación intermedio.

## Requisitos de hardware

- Pesos en precisión completa (FP32): en torno a 500 MB; en FP16/BF16, en torno a 250 MB; en cuantización de 8 bits, ~125 MB, y de 4 bits, ~70-80 MB (estimaciones calculadas a partir de los 124,77 M de parámetros, no publicadas por el autor).
- VRAM estimada para inferencia: aproximadamente 0,8-1,5 GB en FP16 con lotes pequeños y contextos cortos, sumando pesos y caché KV; en FP32, del orden de 1,5-2,5 GB según lote y contexto.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 2060, GTX 1650, e incluso en GPU integradas con memoria compartida; también es viable la inferencia en CPU.
- GPU de centro de datos (A100, H100) no son necesarias para inferencia; solo tendrían sentido para reentrenar el modelo base o hacer ajustes con lotes grandes.
- Opciones de despliegue: pipeline de Transformers (documentado en la model card), text-generation-inference (tag explícito) y, por arquitectura GPT-2, vLLM. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, ya que el repositorio no incluye ficheros GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `francesca9805/ita-latn-100mb-ppt-Dp-10mb-packed-bfd_seed3407` | 124.770.816 | no disponible | no disponible (probablemente italiano) | no disponible | HuggingFace, 0 descargas, 0 likes |
| `goldfish-models/ita_latn_100mb` (modelo base) | no disponible en la información proporcionada (idéntico al ajustado, al ser su base directa) | no disponible | italiano (`ita_latn`) según el identificador | no disponible | HuggingFace |
| Otros modelos de la familia Goldfish (p. ej. `goldfish-models/eng_latn_100mb`) | no disponible | no disponible | monolingües por identificador de idioma | no disponible | HuggingFace |
| `GroNLP/gpt2-small-italian` (alternativa italiana de tamaño comparable) | no disponible en la información proporcionada | no disponible | italiano | no disponible | HuggingFace (dato no verificado en la información disponible) |

No se dispone de datos de rendimiento comparativo entre estas opciones, por lo que la comparación se limita a parámetros, idioma declarado y licencia. Cualquier elección entre ellas debería basarse en una evaluación propia sobre la tarea objetivo.

## Limitaciones y advertencias

- Tamaño muy reducido (125 M de parámetros) y corpus base de ~100 MB de texto: la cobertura factual y léxica es limitada y la tasa de alucinación en preguntas abiertas es alta.
- No hay métricas de evaluación publicadas ni verificación independiente; se desconoce el efecto real del ajuste SFT sobre la perplejidad del modelo base.
- Licencia no declarada: la model card incluye un marcador de posición (`licence: license`), por lo que no hay autorización explícita de uso comercial. Además, la licencia del modelo base Goldfish condiciona cualquier uso derivado y debe consultarse por separado.
- Idiomas no declarados formalmente: aunque el nombre apunta a italiano, se desconoce si el ajuste ha degradado la competencia en ese idioma o ha introducido respuestas en otras lenguas (el prompt de ejemplo de la model card está en inglés).
- No hay documentación del dataset de ajuste: se desconoce su procedencia, si contiene datos personales, contenido con derechos de autor o sesgos sistemáticos.
- Sin soporte documentado de tool calling, agentes, visión o razonamiento multi-paso: no debe integrarse en arquitecturas de agentes sin adaptación previa.
- Riesgo de degeneración en generaciones largas (repeticiones, divagación), típico de modelos de este tamaño entrenados con volúmenes pequeños de datos.
- Longitud de contexto desconocida: impide planificar aplicaciones con conversaciones largas o documentos extensos.
- Cero descargas y cero likes: no existe validación por parte de la comunidad ni informes de uso en producción.
- Las fechas de creación y actualización de los metadatos (2026-09-22) son posteriores a la fecha habitual de consulta; conviene verificarlas directamente en el repositorio antes de citarlas.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos trataban sobre las islas Malvinas/Falkland), por lo que no hay fuentes externas que corroboren su calidad o uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/ita-latn-100mb-ppt-Dp-10mb-packed-bfd_seed3407
- Modelo base: https://huggingface.co/goldfish-models/ita_latn_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/idpqlr6z
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentación de TRL (cita del repositorio): https://github.com/huggingface/trl
- Búsqueda web: sin resultados relevantes sobre el modelo (los resultados devueltos no guardaban relación con el repositorio).
