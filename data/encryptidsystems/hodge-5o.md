# EncryptidSystems/hodge-5o

## Resumen

Hodge-5o es un modelo de lenguaje causal ternarizado publicado por EncryptidSystems en Hugging Face. Se trata de un checkpoint derivado de una familia interna de modelos denominada Hodge, en el que las capas lineales se han cuantizado offline a formato ternario (pesos empaquetados con escalas en bfloat16). El cuerpo denso de las capas 0 a 29 corresponde a lo que el autor llama el cuerpo de Hodge-5, mientras que las capas 30 a 35 forman una cola modificada en una segunda pasada sobre una base Hodge-5.1.

La arquitectura declarada es un transformer con 36 capas, tamaño oculto de 2560, 20 cabezas de atención con 5 cabezas clave-valor (GQA), tamaño de cabeza 128, tamaño intermedio de 6912 y una ventana de contexto de 4096 tokens. El vocabulario es inusualmente grande (563.206 tokens) y el modelo usa embeddings atados, activación relu2 y RoPE con theta 500000. El checkpoint ocupa aproximadamente 4,06 GB en formato safetensors ternario empaquetado.

El interés del modelo es fundamentalmente experimental: explora la cuantización ternaria agresiva sobre un transformer de tamaño medio, con un esquema de atención híbrido entre dos variantes internas (Hodge-5 y Hodge-5.1). No obstante, la información pública es muy escasa, el repositorio está vacío en el momento de la consulta, no hay benchmarks publicados y la licencia no está especificada, lo que limita seriamente su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (atención con GQA) con capas lineales ternarizadas |
| Parametros totales | no disponible (checkpoint de ~4,06 GB en ternario empaquetado) |
| Parametros activos | no disponible (el autor menciona 128 expertos locales y 4 por token en el fichero, sin detallar el esquema MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Ternario empaquetado con escalas en bfloat16 (formato propio `.bnz.ternary.safetensors`) |
| Idiomas soportados | Inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors ternario empaquetado (`hodge-5o.bnz.ternary.safetensors`) |

Otros datos técnicos declarados por el autor: hidden size 2560, 36 capas, intermediate size 6912, 20 cabezas de atención, 5 cabezas clave-valor, head size 128, vocabulario 563206, rope theta 500000, activación relu2, embeddings atados, bos token id 128000, eos token ids 128001 y 128009.

## Arquitectura y entrenamiento

El modelo es un transformer causal con atención multi-cabeza con consultas agrupadas (20 cabezas de consulta y 5 de clave-valor) y un cuerpo feed-forward denso con activación relu2. Las capas lineales se han cuantizado offline a ternario, lo que reduce drásticamente el tamaño del checkpoint (4,06 GB) a costa de una pérdida de precisión que el autor no cuantifica. La segunda pasada de entrenamiento reescribió la atención sobre una base Hodge-5.1 tomando Hodge-5 como fuente, modificando query, key y output en las capas 1, 3, 23 y 24, así como la atención que sigue operando en las capas 30 a 35. Según la model card, los residuos de clave son lo bastante grandes como para alterar qué tokens atiende cada capa.

La cola (capas 30 a 35) presenta particularidades: la escala de la puerta del feed-forward es de aproximadamente 0,0003, por lo que esa parte del feed-forward aporta prácticamente nada, mientras que la atención de la cola sí suma al residuo que lee la cabeza. Además, la capa 35 no incorpora el plano de salida extra que Hodge-5.1 almacena a escala 0,40. El checkpoint incluye también una "carta de expertos" cuaternaria junto a la puerta densa; el autor advierte que un runtime que sume esa carta sobre la puerta mezclará un segundo feed-forward en el residuo. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, con un formato de chat basado en líneas de rol cerradas por `<|eot_id|>` y arranque de generación en `Assistant: `.
- Razonamiento y generación de texto general, según el pipeline declarado (`text-generation`).
- Capacidad multilingüe limitada al inglés (único idioma declarado).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking).
- El autor menciona 128 expertos locales en el fichero con 4 expertos por token, lo que sugiere algún esquema de mezcla de expertos, aunque no se detalla su funcionamiento ni su impacto en capacidades.

## Casos de uso

- Experimentación en cuantización ternaria: el modelo sirve como banco de pruebas para investigar el impacto de pesos ternarios empaquetados en un transformer de 36 capas y contexto de 4096 tokens, comparando su comportamiento con el checkpoint base Hodge-5.1.
- Investigación sobre atención híbrida: las modificaciones en query, key y output de las capas 1, 3, 23 y 24, junto con la cola 30-35, permiten estudiar cómo afectan los residuos de clave a los patrones de atención.
- Generación de texto conversacional en inglés en entornos controlados: con temperatura 0,6 y top-p 0,9, puede emplearse para prototipos de chat de un solo turno o multi-turno dentro de su ventana de 4096 tokens.
- Reproducción de resultados internos: útil para equipos que ya dispongan del stack `gptrun` y quieran validar la carga del checkpoint ternario y el formato `.bnz.yaml`.
- Estudio de eficiencia de memoria: al ocupar 4,06 GB en disco, permite medir el ahorro frente a la variante Hodge-5.1 (5,68 GB) en escenarios con restricciones de almacenamiento y ancho de banda.
- Docencia y divulgación: como ejemplo práctico de modelo ternarizado con vocabulario grande (563.206 tokens) y embeddings atados para explicar técnicas de compresión de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un checkpoint de 4,06 GB en ternario empaquetado requiere al menos esa cantidad de memoria para los pesos, más el overhead de activaciones, KV cache y escalas en bfloat16; no se especifica el consumo real.
- GPU recomendadas: no disponible. El autor no indica GPUs validadas.
- Compatibilidad con GPU de consumo: no confirmada. El tamaño del checkpoint sugiere que podría caber en GPUs con 8-12 GB de VRAM, pero no hay datos oficiales.
- Opciones de despliegue: el autor indica el runtime propietario `gptrun` (`gptrun run --config hodge-5o.bnz.yaml`), que carga el safetensors ternario junto a `config.json` y `tokenizer.json`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hodge-5o | no disponible (~4,06 GB ternario) | 4096 | Ternario empaquetado | no disponible | Hugging Face (repo vacio en la consulta) |
| Hodge-5.1 | no disponible (~5,68 GB) | no disponible | No especificada (incluye ~2.100 planos de dígitos extra) | no disponible | Referenciado por el autor, no verificado |
| Alternativas publicas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría (transformers ternarizados de tamaño medio). Las variantes Hodge-5 y Hodge-5.1 son las únicas referencias internas citadas por el autor.

## Limitaciones y advertencias

- Licencia no especificada: no se puede determinar si el uso comercial está permitido; en la práctica, esto bloquea su adopción en producción.
- Idiomas: solo se declara inglés, sin garantías de calidad en otros idiomas.
- Contexto limitado a 4096 tokens, inferior a los estándares actuales de modelos conversacionales.
- Cuantización ternaria agresiva: la pérdida de precisión frente al modelo base no está cuantificada, y el autor no publica evaluaciones de calidad.
- Riesgo de alucinación: no evaluado ni documentado.
- Sesgos: no documentados.
- Runtime propietario: depende de `gptrun`, sin soporte declarado para ecosistemas estándar como vLLM, llama.cpp u Ollama, lo que dificulta su integración.
- Advertencia técnica del autor: sumar la carta de expertos cuaternaria sobre la puerta densa mezcla un segundo feed-forward en el residuo, lo que puede alterar el comportamiento del modelo.
- Cola con feed-forward inoperativo: la escala de la puerta en las capas 30-35 (~0,0003) implica que esa parte no aporta, lo que puede sorprender a quien espere un comportamiento uniforme entre capas.
- Repositorio de 0,0 GB en el momento de la consulta: no se confirma la disponibilidad efectiva de los pesos.
- Sin benchmarks, sin model card extendida y sin documentación de entrenamiento: la evaluación independiente es prácticamente imposible con la información pública.

## Enlaces

- Hugging Face: https://huggingface.co/EncryptidSystems/hodge-5o
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
