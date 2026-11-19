# medic17/Artemis-31B-v1.2-Q8_0-GGUF

## Resumen

Artemis-31B-v1.2-Q8_0-GGUF es un espejo (mirror) de un único archivo de cuantización Q8_0 del modelo Artemis-31B-v1.2, publicado por el usuario medic17. El modelo base, TheDrummer/Artemis-31B-v1.2, es un modelo conversacional de aproximadamente 30.700 millones de parámetros construido sobre la arquitectura Gemma (etiquetado como "gemma4" en los metadatos). La cuantización original fue realizada por bartowski y este repositorio se limita a replicar el archivo `TheDrummer_Artemis-31B-v1.2-Q8_0.gguf` en un formato de archivo único.

El propósito declarado de este repositorio es servir como caché de modelos para Runpod Serverless, es decir, facilitar la descarga rápida del peso cuantizado en entornos de despliegue serverless. No aporta ninguna modificación, ajuste ni mejora sobre el modelo original: es una copia byte a byte del GGUF de bartowski.

La relevancia de esta ficha es limitada desde el punto de vista técnico, ya que toda la información sustantiva (arquitectura, entrenamiento, capacidades) pertenece al modelo base de TheDrummer, que no se detalla en la información disponible. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 32,6 GB, coherente con un Q8_0 de ~30,7 mil millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Gemma (etiqueta "gemma4" en metadatos); detalles no disponibles |
| Parametros totales | 30.697.345.596 (~30,7 mil millones) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (este repositorio); otras cuantizaciones en el repo de bartowski, no detalladas |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (archivo único) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta "gemma4" en los metadatos y la referencia al modelo base TheDrummer/Artemis-31B-v1.2. Por el recuento de parámetros (30,7 mil millones) y la nomenclatura, se trata presumiblemente de un transformer denso derivado de la familia Gemma, pero no se confirma si incorpora atención lineal, decodificación especulativa ni ninguna innovación concreta. Tampoco se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF, DPO o ajuste conversacional.

Lo único verificable es el proceso de cuantización: el archivo original fue generado por bartowski con cuantización Q8_0 (8 bits por peso), y medic17 lo replica como archivo único. La etiqueta "imatrix" en los tags sugiere que la cuantización pudo haberse realizado con matrices de importancia, aunque no se aporta el detalle del proceso. No hay información sobre el entrenamiento del modelo base en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional: el tag "conversational" y el nombre del modelo base indican un ajuste orientado a diálogo multi-turno.
- Razonamiento y generación de texto general: capacidades heredadas del modelo base Gemma subyacente, no documentadas en detalle.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue en Runpod Serverless: el propósito declarado del repositorio es servir como caché de modelos para este entorno, de modo que las instancias serverless descarguen el GGUF Q8_0 de un único archivo sin fragmentación.
- Inferencia local con llama.cpp u Ollama: al ser un GGUF de archivo único, puede cargarse directamente en runtimes compatibles con GGUF para pruebas de calidad conversacional en máquina local o en un servidor con suficiente memoria.
- Evaluación de calidad de cuantización: comparar las respuestas del Q8_0 con el modelo base en fp16/bf16 para medir la degradación introducida por la cuantización de 8 bits en tareas conversacionales.
- Prototipado de asistentes conversacionales: usar el modelo como backend de un chatbot de pruebas antes de decidir si se adopta el modelo base completo en producción.
- Réplica de entornos de investigación: al ser un espejo determinista del GGUF de bartowski, permite reproducir experimentos que dependan exactamente de ese archivo.
- Distribución en infraestructura con ancho de banda limitado: un solo archivo de 32,6 GB simplifica la gestión de descargas y el cacheo en clústeres frente a repositorios multi-shard.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 ocupa 32,6 GB; se necesita al menos esa cantidad de memoria (GPU o RAM unificada) más overhead de contexto y runtime, por lo que en la práctica se requieren ~34-36 GB.
- GPU recomendadas: A100 40GB, A100 80GB, H100, L40S 48GB o RTX A6000 48GB. No cabe en GPUs consumer de 24 GB (RTX 4090, 3090) en Q8_0.
- GPU consumer: no es viable en RTX 4090/3090 a Q8_0 sin offloading a RAM del sistema; requeriría una cuantización menor (Q4_K_M, Q5_K_M) del repositorio de bartowski.
- Opciones de despliegue: llama.cpp, Ollama, y runtimes compatibles con GGUF; para Runpod Serverless, el caso de uso declarado. vLLM y TGI no consumen GGUF de forma nativa en su configuración estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Artemis-31B-v1.2 (este Q8_0) | ~30,7 B | No disponible | No disponible | GGUF Q8_0 | Hugging Face (medic17) |
| TheDrummer/Artemis-31B-v1.2 (base) | ~30,7 B | No disponible | No disponible | No disponible | Hugging Face (TheDrummer) |
| bartowski/TheDrummer_Artemis-31B-v1.2-GGUF | ~30,7 B | No disponible | No disponible | GGUF multi-cuantización | Hugging Face (bartowski) |

No se dispone de datos de rendimiento ni de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del modelo base ni de la cuantización, lo que impide confirmar si el uso comercial está permitido. Verificar en el repositorio de TheDrummer antes de cualquier despliegue en producción.
- Es un espejo, no un modelo original: no aporta mejoras, correcciones ni ajustes; cualquier problema del modelo base se hereda íntegramente.
- Sin documentación de sesgos ni de alucinación: la model card no incluye advertencias sobre sesgos, toxicidad o tasas de alucinación.
- Idiomas no declarados: no se puede confirmar el soporte multilingüe ni la calidad en castellano.
- Contexto desconocido: sin la longitud de contexto documentada no es posible planificar casos de uso con ventanas largas.
- Repositorio sin tracción: 0 descargas y 0 likes; no hay evidencia de validación por parte de la comunidad.
- Requisitos de memoria elevados: el Q8_0 de 32,6 GB exige hardware de gama alta (≥40 GB de VRAM) o cuantizaciones menores para GPUs consumer.
- Fecha de creación futura en los metadatos (2026-11-19): conviene verificar la integridad del repositorio y la coherencia de los metadatos antes de confiar en él para producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/medic17/Artemis-31B-v1.2-Q8_0-GGUF
- Modelo base: https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- Repositorio GGUF original de bartowski: https://huggingface.co/bartowski/TheDrummer_Artemis-31B-v1.2-GGUF
