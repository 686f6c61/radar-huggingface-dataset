# open-sci/open-sci-ref-v0.02-1.7b-mixturevitae-noinstruct-ftrest-300B-4096

## Resumen

open-sci-ref-v0.02-1.7b-mixturevitae-noinstruct-ftrest-300B-4096 es un modelo de lenguaje base de 1.714.377.728 parámetros (aproximadamente 1,7B) desarrollado por el equipo open-sci. Se trata de un checkpoint de referencia ("ref") dentro de la familia open-sci-ref v0.02, entrenado desde cero sobre el corpus MixtureVitae v1 en su variante decontaminada, sin el subconjunto de instrucciones y razonamiento ("noinstruct") y con los shards de texto formateado (`formatted_text-0` y `formatted_text-1`) reincorporados ("ftrest").

El modelo se entrenó durante 300B tokens con una longitud de contexto de 4.096 tokens, empleando Megatron-LM sobre el clúster JUPITER (64 nodos, 256 GH200) mediante la herramienta oellm-autoexp. Es un modelo estrictamente base: no incluye extensión de contexto largo ni ajuste supervisado o por preferencias, por lo que su propósito es servir como referencia reproducible para investigaciones sobre mezclas de datos y recetas de preentrenamiento, más que como asistente listo para producción.

Su relevancia actual radica en que forma parte de un esfuerzo abierto por caracterizar el impacto de decisiones concretas de composición del dataset (eliminación de instrucciones, reincorporación de shards formateados) sobre el rendimiento en evaluaciones de razonamiento. El repositorio incluye tanto los pesos convertidos a formato Hugging Face como artefactos adicionales (plantilla de chat y módulo de modelado) que replican la configuración usada en las evaluaciones del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo GPT), 24 capas, hidden size 2.048, FFN 8.192, 32 cabezas de atención con 6 grupos clave-valor (GQA), RMSNorm, QK layer norm, RoPE theta 100.000 |
| Parametros totales | 1.714.377.728 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (sin extensión de contexto largo) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en bf16/safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, bf16) |
| Tokenizer | GPT-NeoX |
| Precision de entrenamiento | bf16 |
| Iteracion final | 71.526 |
| SHA-256 de `model.safetensors` | `928314ffebd6b67190f0a38b029f98bf07d733be9ec6031a6dc02874830df7fa` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 24 capas con un tamaño oculto de 2.048 y una capa feed-forward de 8.192. Emplea 32 cabezas de atención organizadas en 6 grupos clave-valor (atención con consultas agrupadas, GQA), normalización RMSNorm, normalización de capa sobre QK y embeddings rotatorios (RoPE) con theta 100.000. El tokenizador es GPT-NeoX. No hay innovaciones de arquitectura declaradas más allá de esta configuración estándar; el interés del checkpoint reside en la receta de datos, no en el diseño del modelo.

El entrenamiento se realizó sobre MixtureVitae v1 (decontaminada, con el tier2b eliminado, sin el subconjunto de instrucciones y razonamiento, y con los shards `formatted_text-0` y `formatted_text-1` reincorporados), un total de 58 shards y 242,1B tokens disponibles, de los cuales se consumieron 300B tokens en 71.526 iteraciones de 1.024 secuencias de 4.096 tokens. Se usó el optimizador AdamW con β2 de 0,95, un learning rate máximo de 0,004 y un schedule WSD con 25.000 iteraciones de warmup y decaimiento lineal en las últimas 14.305 iteraciones. El entrenamiento se ejecutó con Megatron-LM sobre 256 GH200 en 64 nodos del clúster JUPITER, y los pesos se convirtieron al formato Hugging Face mediante el postprocesado propio del run (`hf/iter_0071526`). No se aplicó RLHF, DPO ni ajuste supervisado.

## Capacidades

- Generación de texto autoregresiva como modelo base; no está ajustado para seguir instrucciones ni para mantener formato conversacional de forma fiable.
- Razonamiento y conocimiento factual derivados exclusivamente del preentrenamiento; el autor lo evalúa con la suite de razonamiento Protocol A del proyecto.
- Capacidades multilingües: no disponibles (el autor no declara idiomas soportados).
- Soporte de tool calling / function calling: no disponible; al ser un modelo base sin ajuste, no se documenta soporte nativo.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad ajustada; puede usarse como base para post-entrenamiento.
- Capacidad especial de "thinking mode": no disponible.
- Visión, audio u otras modalidades: no disponibles.
- Se distribuye con `chat_template.jinja` (plantilla de chat del modelo base de `ali-elganzory/…`) para que las evaluaciones de razonamiento del Protocol A puedan aplicarse de forma reproducible, pero esto no implica un ajuste conversacional real.
- Requiere `trust_remote_code=True` por el módulo `modeling_opensci.py` incluido.

## Casos de uso

- Investigación sobre mezclas de datos: sirve como punto de comparación controlado frente a `open-sci/open-sci-ref-v0.02-1.7b-mixturevitae-noinstruct-300B-4096` para aislar el efecto de reincorporar los shards `formatted_text-0/1` en el preentrenamiento.
- Reproducción de recetas de preentrenamiento: al publicarse el checkpoint final (iteración 71.526) con hash SHA-256 verificable y detalles completos de optimizador y schedule, permite replicar experimentos de escalado de tokens a 300B con contexto de 4.096.
- Base para post-entrenamiento propio: al ser un modelo base sin instrucciones, es adecuado como inicialización para SFT, DPO o RLHF en dominios específicos, con la ventaja de que su receta de datos está documentada y decontaminada.
- Evaluación de contaminación de benchmarks: al haberse entrenado sobre una versión decontaminada de MixtureVitae, es útil para estudiar cómo afecta la decontaminación a las puntuaciones en suites como Protocol A.
- Estudio de tokenizadores y arquitecturas pequeñas: con 1,7B parámetros, 24 capas y GQA de 6 grupos, es un banco de pruebas manejable para analizar el comportamiento de RoPE theta 100.000 y RMSNorm a contextos de 4K.
- Experimentos de eficiencia de inferencia: su tamaño permite ejecutar barridos de cuantización y comparativas de latencia en una sola GPU, aunque el repositorio no publique pesos cuantizados.
- Docencia y divulgación: un modelo base pequeño, con receta transparente y artefactos de evaluación incluidos, resulta adecuado para explicar el pipeline completo de preentrenamiento a escala media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo se evaluó con la suite de razonamiento Protocol A del proyecto y con la suite de idiomas open-sci-0.01, con tres semillas cada una, y que los resultados están en `docs/investigations/protocol_a_jureca.md` del repositorio de post-entrenamiento de MixtureVitae, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los 1.714.377.728 parámetros ocupan aproximadamente 3,4 GB de pesos, por lo que la inferencia en bf16 requiere del orden de 4-6 GB de VRAM considerando caché KV para 4.096 tokens. En cuantización de 8 bits bajaría a unos 2 GB y en 4 bits a alrededor de 1 GB, aunque el autor no publica pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; una RTX 4090 (24 GB) permite ejecutar el modelo con holgura y batches grandes. Para entrenamiento o fine-tuning completo se requieren aceleradores de clase A100/H100 o GH200, dado que el preentrenamiento se hizo sobre 256 GH200.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090) en bf16, y en GPUs de 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada. No se confirma soporte en vLLM, llama.cpp, Ollama o TGI en la información disponible; la presencia de `custom_code` y de un `modeling_opensci.py` propio puede requerir adaptaciones para motores que no ejecuten código remoto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| open-sci-ref-v0.02-1.7b-mixturevitae-noinstruct-ftrest-300B-4096 | 1,71B | 4.096 | no disponible | Incluye shards `formatted_text-0/1`; checkpoint de referencia del proyecto open-sci |
| open-sci/open-sci-ref-v0.02-1.7b-mixturevitae-noinstruct-300B-4096 | 1,7B (no confirmado en detalle) | 4.096 | no disponible | Misma receta sin los shards de texto formateado; sirve como control experimental directo |
| ali-elganzory/open-sci-ref-v0.02-1.7b-mixturevitae-noinstruct-300B-4096 | 1,7B (no confirmado en detalle) | 4.096 | no disponible | Copia de evaluación del modelo base anterior; origen de `chat_template.jinja` y `modeling_opensci.py` |

No se dispone de datos de benchmarks ni de comparaciones de rendimiento con modelos de otras familias en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un modelo base sin ajuste supervisado ni por preferencias: no sigue instrucciones de forma fiable y puede producir continuaciones incoherentes o no alineadas con la intención del usuario.
- Riesgo de alucinación inherente a un modelo de 1,7B entrenado sobre 300B tokens; no se han publicado evaluaciones de factualidad.
- Contexto limitado a 4.096 tokens, sin extensión de contexto largo, lo que restringe tareas de documentos extensos o conversaciones multi-turno largas.
- Idiomas soportados no declarados; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos del dominante en MixtureVitae.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución; debe verificarse antes de cualquier despliegue en producción.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un corpus web decontaminado, es probable que herede sesgos presentes en los datos, pero no hay análisis publicado.
- Requiere `trust_remote_code=True` y un `modeling_opensci.py` propio, lo que añade superficie de riesgo y puede romper la compatibilidad con motores de inferencia estándar.
- La plantilla de chat incluida proviene de otro repositorio y está pensada para evaluaciones, no para uso conversacional en producción.
- El modelo se publicó con 0 descargas y 0 likes en el momento de la consulta, y su fecha de creación figura como 2026-11-09; se trata de un artefacto de investigación sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/open-sci/open-sci-ref-v0.02-1.7b-mixturevitae-noinstruct-ftrest-300B-4096
- Modelo de referencia sin los shards de texto formateado: https://huggingface.co/open-sci/open-sci-ref-v0.02-1.7b-mixturevitae-noinstruct-300B-4096
- Copia de evaluación de Ali Elganzory (origen de `chat_template.jinja` y `modeling_opensci.py`): https://huggingface.co/ali-elganzory/open-sci-ref-v0.02-1.7b-mixturevitae-noinstruct-300B-4096
- Resultados de evaluación (referenciados en la model card, no enlazados): `docs/investigations/protocol_a_jureca.md` del repositorio de post-entrenamiento de MixtureVitae
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la búsqueda web proporcionada.
