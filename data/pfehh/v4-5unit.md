# pfehh/V4.5unit

## Resumen

V4.5unit es un modelo de lenguaje de tipo transformer decoder-only publicado por el usuario pfehh en Hugging Face. Con 344.373.768 parámetros totales repartidos en 12 capas, dimensión oculta de 1536 y un vocabulario de aproximadamente 38.000 tokens, se posiciona en la gama de modelos pequeños (menos de 400 millones de parámetros). La model card está redactada en ruso y describe la arquitectura de forma técnica pero sin detallar el corpus de entrenamiento ni el proceso de alineación.

El modelo emplea RMSNorm, activación SiLU, atención mediante `scaled_dot_product_attention` de PyTorch y RoPE dinámico para la codificación posicional. Los embeddings de entrada y la capa de salida están atados (weight tying), lo que explica que 89.390.088 de los parámetros correspondan a esas dos matrices y el resto a las 12 capas. El peso del modelo en int8 ocupa aproximadamente 0,37 GB, lo que lo hace viable en hardware muy modesto.

La relevancia de esta ficha es limitada: no hay pipeline declarado, no hay idiomas declarados, no hay descargas ni interacciones, y la model card no incluye datos de entrenamiento, benchmarks ni instrucciones de uso. Se trata, por tanto, de un checkpoint de investigación sin validación pública, útil únicamente como referencia arquitectónica o para experimentación controlada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 344.373.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (peso aproximado de 0,37 GB); no se documentan otras |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (la model card no especifica safetensors, GGUF ni bin) |

Datos adicionales declarados en la model card: 6.144 entradas, 12 capas, 21.248.640 parámetros por capa (254.983.680 en el conjunto de capas), 89.390.088 parámetros en embeddings y capa de salida, dimensión oculta 1536, dimensión de representación 6144, 12 cabezas de atención con dimensión por cabeza de 128 (1536/12), vocabulario de aproximadamente 38.000 tokens, RoPE dinámico, `torch.nn.functional.scaled_dot_product_attention`, embeddings y capa lineal atados, activación SiLU y normalización RMSNorm.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar con 12 capas, dimensión oculta de 1536 y 12 cabezas de atención (128 dimensiones por cabeza). Usa RMSNorm como normalización, SiLU (Swish) como activación en el bloque feed-forward, weight tying entre la matriz de embeddings y la proyección de salida, y RoPE dinámico como codificación posicional. La atención se implementa con la función nativa de PyTorch `scaled_dot_product_attention`, lo que permite aprovechar kernels optimizados sin dependencias externas.

No se dispone de información sobre el corpus de entrenamiento: la model card no indica número de tokens, composición del dataset, idiomas, ni si hubo fases de instrucción, RLHF o DPO. Tampoco se documentan innovaciones técnicas más allá de las decisiones arquitectónicas ya citadas. El nombre del checkpoint ("V4.5unit") sugiere una iteración de una serie previa del mismo autor, pero no hay evidencia pública de las versiones anteriores ni de los resultados obtenidos.

## Capacidades

- Generación de texto autoregresiva propia de un transformer decoder-only; no se documentan capacidades específicas más allá de la arquitectura.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingüe; los idiomas soportados figuran como no disponibles.
- No se declara modo de razonamiento explícito (thinking mode), visión, audio ni otras modalidades.
- El tamaño del vocabulario (aproximadamente 38.000 tokens) es compatible con tokenizadores multilingües habituales, pero no se confirma qué tokenizador emplea ni qué cobertura lingüística tiene.

## Casos de uso

- Experimentación arquitectónica: el modelo sirve para reproducir y estudiar una configuración concreta (12 capas, 1536 de dimensión oculta, RoPE dinámico, weight tying) en entornos de investigación con recursos limitados, dado su peso de 0,37 GB en int8.
- Prototipado de pipelines de inferencia: al ser un checkpoint pequeño, permite validar integraciones con frameworks de serving (por ejemplo, vLLM o llama.cpp, si se convierte el formato) antes de escalar a modelos mayores.
- Pruebas de cuantización: su tamaño reducido facilita comparar int8 frente a otras precisiones y medir el impacto en perplejidad y latencia.
- Fine-tuning ligero en hardware de consumo: con 344 millones de parámetros, cabe en GPUs de gama media para ajuste supervisado o LoRA, siempre que se disponga del tokenizador y del formato de pesos.
- Generación de texto de dominio acotado: si el autor publicase datos de entrenamiento, podría emplearse para tareas de completado en un nicho concreto; sin esa información, su uso en producción no está justificado.
- Docencia y divulgación: útil para explicar el funcionamiento interno de un transformer decoder-only con atención estándar y RoPE, al ser un modelo de escala manejable y con la arquitectura documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,37 GB en int8 según la model card; en fp16 serían unos 0,69 GB y en fp32 unos 1,38 GB (cálculo teórico a partir del número de parámetros, no confirmado por el autor).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; no se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna de consumo (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU, dado el tamaño.
- Opciones de despliegue: no se documentan; al no especificarse el formato de pesos, no se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| V4.5unit (pfehh) | 344,4 M | no disponible | AGPL-3.0 | Hugging Face, sin descargas ni validación pública |
| SmolLM-360M (HuggingFaceTB) | 360 M | 2.048 tokens | Apache-2.0 | Hugging Face, ampliamente validado |
| Qwen2.5-0.5B (Alibaba) | 494 M | 32.768 tokens | Apache-2.0 | Hugging Face, benchmarks publicados |
| TinyLlama-1.1B | 1.100 M | 2.048 tokens | Apache-2.0 | Hugging Face, benchmarks publicados |

La comparación se limita a parámetros, contexto y licencia: para V4.5unit no hay datos de rendimiento ni de contexto, por lo que no es posible establecer una comparación cuantitativa fiable con las alternativas.

## Limitaciones y advertencias

- Ausencia total de datos de entrenamiento: no se conoce el corpus, los idiomas ni el proceso de alineación, lo que impide evaluar sesgos y calidad.
- Riesgo de alucinación no caracterizado: sin benchmarks ni evaluación humana, no hay evidencia sobre la fiabilidad de sus salidas.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas que requieran ventanas largas.
- Idiomas soportados no declarados: no hay garantía de calidad en castellano ni en ningún otro idioma.
- Licencia AGPL-3.0: impone obligaciones copyleft fuertes; el uso comercial en servicios en red requiere publicar el código fuente derivado, lo que puede ser incompatible con productos propietarios.
- Sin descargas ni interacciones en Hugging Face: no hay evidencia de uso comunitario ni de que el checkpoint haya sido validado por terceros.
- Formato de pesos no especificado: la integración con frameworks de serving requiere inspección previa del repositorio.
- Fecha de creación futura (2026-11-21) en los metadatos: conviene verificar la integridad del repositorio antes de cualquier uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfehh/V4.5unit
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
