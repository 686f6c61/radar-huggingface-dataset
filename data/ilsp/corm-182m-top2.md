# ilsp/CoRM-182M-top2

## Resumen

CoRM-182M-top2 es un modelo de lenguaje autorregresivo con arquitectura de Mezcla de Expertos (MoE), desarrollado por el Instituto de Procesamiento del Lenguaje y el Habla (ILSP), perteneciente al Athena Research Center. Su principal innovación es un router de expertos basado en enrutamiento contrastivo (CoRM), que puntúa los expertos mediante una brecha de atención contrastiva frente a un estado de referencia móvil (EMA), en lugar de recurrir a la magnitud cruda de activación. El modelo forma parte de la colección CoRM y se publica como checkpoint de investigación para validar esta técnica de enrutamiento.

La variante top-2 activa 266 millones de parámetros y mantiene 782.331.660 parámetros en total, con una ventana de contexto de 1024 posiciones. Está implementado en bfloat16 y requiere código personalizado para su carga. Su licencia Apache-2.0 facilita su uso tanto en investigación como en aplicaciones comerciales, aunque no se han publicado datos de entrenamiento ni evaluaciones completas en la ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con atención GQA y Mezcla de Expertos (MoE) |
| Parametros totales | 782.331.660 (según safetensors; el README indica 777M) |
| Parametros activos | 266M (top-2, según README) |
| Longitud de contexto | 1024 posiciones (max position embeddings) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer de 12 capas, 12 cabezas de atención con atención de consulta agrupada (GQA) que reduce las cabezas de clave/valor a 4. El tamaño de capa oculta es de 768 y el tamaño intermedio de 3072. La FFN contiene 8 expertos y selecciona 2 expertos por token (top-2), lo que resulta en 266 millones de parámetros activos y 782.331.660 parámetros totales. El vocabulario tiene 51.200 tokens y la posición máxima embebible es 1024.

El enrutamiento CoRM introduce un mecanismo que compara la atención de cada experto con un estado de referencia dinámico calculado mediante media móvil exponencial (EMA). Este enfoque permite modular la asignación de expertos sin depender de la magnitud de las activaciones, lo que constituye la principal innovación técnica del trabajo. En cuanto al entrenamiento, no se han publicado datos de tokens, composición del dataset, hardware utilizado ni algoritmos de alineación como RLHF o DPO.

## Capacidades

- Generación de texto autorregresiva, según el pipeline `text-generation`.
- Arquitectura MoE top-2: en cada token activa dos de los ocho expertos, reduciendo el coste computacional en comparación con un modelo denso de tamaño total equivalente.
- Atención con GQA (4 KV heads) que reduce los requisitos de memoria en la capa de atención.
- Uso de código personalizado (`trust_remote_code=True`) para cargar los pesos y ejecutar la inferencia.
- No se han documentado capacidades de tool calling, uso de agentes, visión o audio.
- Idiomas no especificados; no se garantiza soporte multilingüe.

## Casos de uso

- Investigación en enrutamiento de expertos: los investigadores pueden utilizar este checkpoint para medir cómo el router contrastivo CoRM altera la asignación de expertos frente a routers por magnitud, gracias a la disponibilidad del código fuente y a la licencia Apache-2.0.
- Experimentos de eficiencia en MoE: al contar con 266M de parámetros activos y 782M totales, es adecuado para estudiar la relación entre densidad, coste computacional y calidad en entornos controlados.
- Prototipos de generación de texto en recursos limitados: puede ejecutarse en GPUs de consumo con 4-8 GB de VRAM para pruebas de concepto de autocompletado o chatbots en un dominio concreto.
- Fine-tuning para tareas de dominio específico: su tamaño reducido y su licencia permisiva permiten adaptarlo con LoRA o PEFT a tareas de clasificación, extracción de entidades o análisis de sentimiento, siempre que la ventana de 1024 tokens sea suficiente.
- Docencia en técnicas MoE: sirve como ejemplo práctico para explicar GQA, enrutamiento top-2 y cómputo condicional en cursos de procesamiento de lenguaje natural.
- Comparación de arquitecturas en benchmarks personalizados: se puede evaluar frente a un modelo denso del mismo tamaño o a otros MoE para reproducir los experimentos presentados en el artículo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de evaluación y el apartado de evaluación aparece marcado como pendiente (TODO). El artículo asociado indica que CoRM logra una pérdida de validación inferior a las arquitecturas densas y al MoE estándar en tres configuraciones, pero no se ofrecen cifras concretas en la ficha.

## Requisitos de hardware

- VRAM estimada: el checkpoint en bfloat16 ocupa aproximadamente 1,56 GB (782.331.660 × 2 bytes). Para inferencia se recomienda un mínimo de 2-3 GB de VRAM contando con los estados intermedios y el código del modelo.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4090 o cualquier tarjeta de consumo con al menos 4 GB de VRAM.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más. También puede ejecutarse en CPU con suficiente memoria RAM.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI. El modelo requiere código personalizado y debe cargarse con `trust_remote_code=True` en la biblioteca `transformers`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos comparables de la misma categoría con los que contrastar de forma directa. La documentación del paper indica que el modelo se comparó contra arquitecturas densas y MoE estándar, pero no se incluyen esos resultados en la ficha.

| Modelo | Parametros activos | Parametros totales | Contexto | Licencia | Benchmarks |
|---|---|---|---|---|---|
| CoRM-182M-top2 | 266M | 782M | 1024 | Apache-2.0 | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los datos de entrenamiento no son públicos, por lo que no es posible evaluar los sesgos lingüísticos o temáticos del modelo.
- La ventana de contexto de 1024 tokens es corta para tareas que requieren documentos largos o historial extenso.
- No se especifican los idiomas soportados; el modelo podría estar sesgado hacia el inglés u otras lenguas europeas, pero no hay confirmación en la documentación.
- El uso de código remoto (`trust_remote_code=True`) implica la necesidad de auditar el código en entornos de producción.
- No se ofrece documentación sobre cuantización ni sobre integración en runtimes de alto rendimiento, lo que dificulta su despliegue en servicios reales.
- Existe riesgo de alucinación inherente a los modelos de lenguaje; al carecer de benchmarks publicados, no se puede estimar su gravedad relativa.

## Enlaces

- [HuggingFace: ilsp/CoRM-182M-top2](https://huggingface.co/ilsp/CoRM-182M-top2)
- [Colección CoRM](https://huggingface.co/ilsp/CoRM)
- [Paper: Beyond Magnitude: Contrastive Routing for Modular Mixture-of-Experts](https://arxiv.org/abs/2609.01100)
- [Versión HTML del paper](https://arxiv.org/html/2609.01100v1)
- [GitHub: athena-ilsp/CoRM](https://github.com/athena-ilsp/CoRM)
- [ILSP (Instituto de Procesamiento del Lenguaje y el Habla)](https://www.ilsp.gr/en/home-2/)
