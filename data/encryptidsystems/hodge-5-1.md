# EncryptidSystems/hodge-5.1

## Resumen

Hodge-5.1 es un modelo de lenguaje causal ternarizado publicado por EncryptidSystems en Hugging Face. Se construye a partir de Hodge-5 como base y mezcla en su interior material procedente de gpt-oss, manteniendo la topología de la base, lo que da como resultado una profundidad de salida de 36 capas. Las capas lineales son "Hodge linear" y se cuantizan offline en formato ternario empaquetado con escalas en bfloat16.

El checkpoint ocupa 5,68 GB y contiene 3.338 tensores, de los cuales aproximadamente 2.100 planos de dígitos adicionales (procedentes de la mezcla) tienen escala cero en el cuerpo del modelo: no contribuyen al producto matricial pero sí ocupan memoria. La cola del modelo (capas 30-35) tiene la puerta del feed-forward prácticamente cerrada (escala en torno a 0,0003 frente a escalas de cuerpo de ~2), mientras que la atención de la cola sigue activa.

El modelo está pensado para generación de texto conversacional en inglés, con una longitud de contexto de 4.096 tokens y un vocabulario de 563.206 entradas. Es relevante por su enfoque poco habitual de cuantización ternaria offline y por la técnica de mezcla de checkpoints con planos de dígitos residuales, aunque la documentación disponible es escasa y no se han publicado benchmarks ni detalles completos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con capas lineales ternarias ("Hodge linear") y mezcla de expertos almacenada en el checkpoint (128 expertos locales, 4 por token) |
| Parametros totales | no disponible |
| Parametros activos | 4 expertos por token en el fichero (total de parámetros no disponible) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Ternario empaquetado (packed ternary) con escalas en bfloat16; cuantización offline |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`hodge-5.1.bnz.ternary.safetensors`) |

Otras especificaciones declaradas en la model card:

| Parametro | Valor |
|---|---|
| Hidden size | 2560 |
| Capas | 36 |
| Intermediate size | 6912 |
| Cabezas de atención | 20 |
| Cabezas key-value | 5 |
| Tamaño de cabeza | 128 |
| Vocabulario | 563206 |
| RoPE theta | 500000 |
| Activación | relu2 |
| Expertos locales en el fichero | 128 |
| Expertos por token en el fichero | 4 |
| Embeddings | tied |
| BOS token id | 128000 |
| EOS token ids | 128001, 128009 |
| Tamaño del checkpoint | 5,68 GB |
| Tensores en el checkpoint | 3338 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con 36 capas, hidden size de 2560, tamaño intermedio de 6912, 20 cabezas de atención y 5 cabezas key-value (GQA con ratio 4:1), tamaño de cabeza 128 y activación relu2. Las capas lineales son "Hodge linear" cuantizadas offline en ternario empaquetado con escalas bfloat16. El modelo incorpora además un "quaternary expert chart" almacenado junto a la puerta densa: el bloque denso `mlp.gate_proj` corresponde a la ruta relu2, y un runtime que añada el chart sobre esa puerta mezcla un segundo feed-forward en el residual. El checkpoint declara 128 expertos locales y 4 expertos por token.

La construcción del modelo se basa en una mezcla de checkpoints: la topología procede de Hodge-5 y se le incorpora material de gpt-oss. Las capas 0-29 conservan las proyecciones densas de Hodge-5; la mezcla almacenó el material sobrante como planos de dígitos adicionales (unos 2.100 planos presentes en este fichero y ausentes en Hodge-5o), con escala cero en el cuerpo, por lo que no afectan al producto matricial pero sí consumen memoria. En la cola (capas 30-35), la escala de la puerta del feed-forward es de aproximadamente 0,0003 frente a ~2 en el cuerpo, lo que desactiva de facto ese feed-forward, mientras que la atención de la cola sigue operando. La capa 35 incluye un plano de salida con escala 0,40 sobre una escala primaria de 0,14, ausente en Hodge-5o; la cabeza lee el residual después de ese plano.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto causal y conversacional en inglés.
- Formato de chat por turnos: cada turno es una línea de rol cerrada por `<|eot_id|>`, y la generación comienza en `Assistant: `.
- Muestreo configurado por defecto con temperatura 0,6 y top-p 0,9, con límite de longitud de 4096.
- Soporte de vocabulario amplio (563.206 entradas).
- Capacidad de mezcla de expertos almacenada en el checkpoint (128 expertos locales, 4 por token), sujeta a que el runtime implemente el chart de expertos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Generación de texto conversacional en inglés: el modelo está entrenado y formateado para diálogo por turnos con el esquema `User:` / `Assistant:` y cierre con `<|eot_id|>`, por lo que puede usarse como base para asistentes de chat en inglés con contextos de hasta 4.096 tokens.
- Experimentación con cuantización ternaria: al ser un checkpoint ternario empaquetado con escalas bfloat16, resulta útil para investigar técnicas de compresión extrema y su impacto en la calidad de generación, comparándolo con su base Hodge-5.
- Investigación sobre mezcla de checkpoints: los planos de dígitos residuales y la cola con feed-forward desactivado lo convierten en un caso de estudio para analizar cómo se comporta un modelo cuando parte de sus pesos tiene escala cero o casi cero.
- Prototipado de runtimes alternativos: la model card especifica que `gptrun` lee 3.338 tensores y carga el safetensors junto a `config.json` y `tokenizer.json`, lo que permite probar implementaciones de inferencia compatibles con pesos ternarios.
- Evaluación de modelos pequeños en hardware modesto: con un checkpoint de 5,68 GB y 36 capas, es viable ejecutarlo en GPUs de consumo para pruebas de generación de texto en inglés, siempre que el runtime soporte el formato ternario.
- Docencia y divulgación: sirve para ilustrar conceptos de cuantización offline, GQA (20 cabezas de atención y 5 key-value) y activación relu2 en un modelo de tamaño contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 5,68 GB en disco; dado que los pesos son ternarios empaquetados con escalas bfloat16, la VRAM necesaria en inferencia será del orden del tamaño del checkpoint más el overhead de activaciones y caché KV. No se dispone de una cifra oficial.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del checkpoint (5,68 GB) sugiere que podría caber en GPUs con 8 GB o más de VRAM, pero no hay datos oficiales.
- Opciones de despliegue: `gptrun` es el runtime indicado por el autor (`gptrun run --config hodge-5.1.bnz.yaml`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hodge-5.1 | no disponible (checkpoint de 5,68 GB) | 4096 | Ternario empaquetado, escalas bfloat16 | no disponible | Hugging Face (EncryptidSystems/hodge-5.1) |
| Hodge-5o | no disponible (checkpoint de 4,06 GB, 1244 tensores) | no disponible | Ternario (según referencia de la model card) | no disponible | Referenciado en la model card de Hodge-5.1 |
| Hodge-5 | no disponible | no disponible | no disponible | no disponible | Base del modelo según la model card |

No se dispone de datos de rendimiento ni de benchmarks para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte para inglés; no se garantiza un comportamiento correcto en otros idiomas.
- Contexto limitado a 4.096 tokens, inferior al de muchos modelos actuales.
- Riesgo de alucinación: no evaluado ni documentado por el autor.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia no disponible: no se puede confirmar si se permite uso comercial; conviene contactar con el autor antes de usarlo en producción.
- El checkpoint contiene unos 2.100 planos de dígitos con escala cero en el cuerpo que no contribuyen al producto matricial pero ocupan memoria, lo que reduce la eficiencia respecto a Hodge-5o (4,06 GB y 1.244 tensores).
- La cola del modelo (capas 30-35) tiene el feed-forward prácticamente desactivado (escala ~0,0003), lo que puede afectar a la calidad de las representaciones en esas capas.
- El uso del chart de expertos requiere un runtime que lo implemente; un runtime que lo añada sobre la puerta densa mezcla un segundo feed-forward en el residual, con efectos no documentados.
- No hay información sobre el proceso de entrenamiento, datos utilizados ni alineación, lo que dificulta evaluar su fiabilidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de repo de 0,0 GB pese a que la model card menciona un checkpoint de 5,68 GB; conviene verificar la integridad de los ficheros antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/EncryptidSystems/hodge-5.1
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
