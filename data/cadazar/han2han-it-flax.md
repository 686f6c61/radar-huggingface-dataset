# cadazar/han2han-it-flax

## Resumen

Han2Han IT (checkpoint Flax) es la versión instruida del modelo Han2Han, un transformer encoder-decoder de 169 millones de parámetros desarrollado por el autor independiente cadazar y orientado al coreano, con atención especial a la transcripción entre hanja (caracteres chinos) y hangul. Este repositorio no contiene un modelo distinto, sino el estado exacto del entrenamiento en formato Orbax/Flax: el paso 762 de la continuación en fp32 del ajuste por instrucciones, guardado tal cual lo escribió el entrenador y sin el ítem del optimizador.

Su relevancia es doble. Por un lado, es la fuente canónica del modelo publicado para `transformers`: el gemelo en PyTorch, `cadazar/han2han-it`, se convirtió precisamente a partir de este checkpoint. Por otro, permite reanudar el entrenamiento en JAX (incluido el refuerzo posterior, que arranca con un optimizador nuevo) y reproducir la conversión de pesos. Para inferencia en producción con el stack de Hugging Face, el repositorio útil es el gemelo en PyTorch.

El ajuste por instrucciones cubrió 30 millones de tokens sobre cuatro familias de tareas: seguimiento de instrucciones, razonamiento con cadena de pensamiento, transcripción de artículos hanja-hangul y resumen. El modelo parte de `cadazar/han2han-pt` y de un checkpoint bf16 intermedio (paso 43153).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder; preentrenamiento tipo UL2 (según el nombre del checkpoint de partida, `han2han-ul2-base-1-it`) |
| Parametros totales | 169 M |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en fp32; no se publican versiones cuantizadas) |
| Idiomas soportados | coreano (`ko`), con tratamiento específico de hanja |
| Licencia | Apache 2.0 |
| Formato de pesos | Orbax OCDBT (Flax/JAX), `StandardCheckpointHandler`; gemelo PyTorch en `cadazar/han2han-it` |
| Pasos de entrenamiento | 762 (continuación fp32); 43153 en el checkpoint bf16 de partida |
| Tokens vistos | 30.006.602 |
| Tasa de aprendizaje | 3e-5, ~40.000 tokens por actualización |
| Tamano del repositorio | 0,6 GB (fichero de parametros de 599 MB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder denso de 169 M de parámetros. El nombre del checkpoint del que arranca el ajuste, `han2han-ul2-base-1-it` (paso 43153), apunta a un preentrenamiento con objetivos tipo UL2, aunque la model card de este repositorio no detalla la composición del corpus de preentrenamiento ni el número de tokens de esa fase; el modelo preentrenado de referencia es `cadazar/han2han-pt`.

La fase documentada aquí es una continuación en fp32 del ajuste por instrucciones publicado, ejecutada sobre 30.006.602 tokens con las mismas cuatro familias de tareas del run original: seguimiento de instrucciones, razonamiento con cadena de pensamiento, transcripción de artículos hanja-hangul y resumen. Se usó una tasa de aprendizaje de 3e-5 y actualizaciones de aproximadamente 40.000 tokens. El motivo de esta continuación fue entrenar las filas de embeddings de los tokens de chat, que el run en bf16 había dejado con sus valores preentrenados; según el autor, la model card de `cadazar/han2han-it` describe el efecto de ese cambio. No se documenta en la información disponible el uso de RLHF o DPO en esta etapa, ni detalles de decodificación especulativa o atención lineal.

El repositorio incluye `config.json` con la misma configuración de modelo que el checkpoint lleva en `meta/metadata`, y publica hashes SHA-256 de todos los ficheros para verificación de integridad. El ítem `optimizer` original (1,3 GB de momentos NorMuon/AdamW) se omite deliberadamente: el refuerzo posterior arranca con optimizador nuevo y `restore_checkpoint(..., model_only=True)` no lo lee.

## Capacidades

- Generación de texto en coreano con ajuste por instrucciones (instruction following).
- Razonamiento con cadena de pensamiento (chain-of-thought) entrenado explícitamente.
- Transcripción entre hanja y hangul en artículos, la tarea distintiva del proyecto.
- Resumen de documentos.
- Conversación multi-turno mediante tokens de chat con embeddings entrenados específicamente en esta continuación.
- Al ser un encoder-decoder, encaja de forma natural en tareas de secuencia a secuencia (transformación, resumen, transliteración).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o multi-step reasoning autónomo: no disponible.
- Vision o audio: no disponible.
- Multilingüismo: limitado a coreano según la metadata (`language: ko`).

## Casos de uso

- Digitalización de prensa histórica coreana: el modelo convierte artículos con caracteres hanja a hangul, lo que permite indexar y buscar corpus de archivo sin transcripción manual. Es la tarea para la que se construyó el proyecto y para la que se entrenó de forma específica.
- Investigación en humanidades digitales: normalización de textos del corpus `seyoungsong/Open-Korean-Historical-Corpus` para análisis de frecuencias, búsqueda léxica o alineamiento de ediciones.
- Resumen de documentos coreanos: con 169 M de parámetros y licencia Apache 2.0, puede desplegarse en local para resumir informes o actas sin enviar datos a la nube.
- Asistente conversacional de dominio acotado en coreano: los embeddings de los tokens de chat se entrenaron en esta continuación, lo que habilita diálogo multi-turno en aplicaciones de soporte interno o FAQ.
- Generación de pares de entrenamiento: uso del modelo como anotador para producir transcripciones hanja-hangul y resúmenes que alimenten el entrenamiento de modelos mayores, dado su bajo coste de inferencia.
- Reproducción e investigación de entrenamiento: al ser el checkpoint Flax original, sirve para estudiar la conversión Flax a PyTorch (`convert_flax_to_torch.py`), auditar la integridad de pesos mediante los SHA-256 publicados o continuar el ajuste con las herramientas de `rl/README.md`.
- Prototipado en JAX/Flax: base pequeña y encoder-decoder para experimentar con pipelines de entrenamiento en NNX y Orbax sin requerir grandes recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que la evaluación se realiza mediante las herramientas de refuerzo del repositorio (`rl/README.md`), pero el texto proporcionado se interrumpe antes de ofrecer cifras, y no se incluyen resultados de MMLU, HumanEval, GSM8K ni de tareas coreanas como KLUE.

## Requisitos de hardware

- Inferencia en fp32: los parámetros ocupan 599 MB; con activaciones y overhead del runtime, el modelo cabe holgadamente en menos de 2 GB de VRAM.
- En bf16/fp16 los pesos bajan a unos 340 MB, aunque el autor no publica una conversión de precisión reducida para este repositorio.
- Cabe en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, así como en CPU (la model card indica `JAX_PLATFORMS=cpu` para máquinas sin acelerador).
- Para reanudar entrenamiento en JAX se recomienda GPU con más memoria (A100, H100 o RTX 4090), aunque no se especifican requisitos concretos de VRAM para el entrenamiento.
- Despliegue: el repositorio está pensado para cargarse con `jax`, `flax` (NNX), `orbax-checkpoint` y `transformers` desde la raíz del repositorio con `PYTHONPATH=.`. Para vLLM, TGI, llama.cpp u Ollama debe usarse el gemelo PyTorch `cadazar/han2han-it`; no se ofrece GGUF en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `cadazar/han2han-it-flax` (este) | 169 M | no disponible | Orbax OCDBT (Flax) | Apache 2.0 | Checkpoint original, paso 762, fp32; sin optimizador; pensado para continuar entrenamiento en JAX |
| `cadazar/han2han-it` | 169 M | no disponible | PyTorch (safetensors, presumiblemente; no confirmado) | Apache 2.0 | Gemelo convertido desde este checkpoint; revisión `main` para `transformers`, revisión `emnlp2026` con el paso 43153 en bf16 |
| `cadazar/han2han-pt` | no disponible (mismo tamano base) | no disponible | no disponible | Apache 2.0 | Modelo preentrenado del que parten ambos |

No se dispone de datos de benchmarks que permitan comparar el rendimiento con alternativas de otros autores; la comparación se limita, por tanto, a la familia Han2Han y a características estructurales.

## Limitaciones y advertencias

- Este repositorio no es la vía recomendada para inferencia: la propia model card indica que se use `cadazar/han2han-it` para `transformers` y este checkpoint para continuar el entrenamiento en JAX o reproducir la conversión.
- El ítem del optimizador no está incluido; no es posible reanudar el entrenamiento exactamente donde se dejó, solo iniciar uno nuevo desde los pesos.
- El modelo está entrenado y evaluado únicamente en coreano; no se documenta calidad en otros idiomas.
- Longitud de contexto no documentada: no hay garantía sobre el comportamiento en entradas largas, algo crítico en transcripción de artículos completos.
- Riesgo de alucinación inherente a un modelo de 169 M de parámetros ajustado por instrucciones; en transcripción hanja-hangul los errores de carácter son plausibles y requieren revisión humana en flujos de digitalización patrimonial.
- No se documentan sesgos conocidos, composición del corpus de preentrenamiento ni filtros aplicados; el dataset de ajuste es `seyoungsong/Open-Korean-Historical-Corpus`, de dominio histórico.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas, lo que desaconseja su adopción en producción sin una evaluación propia.
- Licencia Apache 2.0, que permite uso comercial y modificaciones con atribución; aun así, conviene verificar las condiciones del corpus de entrenamiento por si impusieran restricciones adicionales sobre los datos de origen.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-10-22: proyecto de investigación unipersonal, sin garantías de mantenimiento.
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo (solo foros de fútbol sin relación), por lo que no hay fuentes externas independientes que validen las afirmaciones de la model card.

## Enlaces

- HuggingFace (este checkpoint): https://huggingface.co/cadazar/han2han-it-flax
- Gemelo PyTorch: https://huggingface.co/cadazar/han2han-it
- Modelo preentrenado: https://huggingface.co/cadazar/han2han-pt
- Repositorio de código (carga, conversión y herramientas de RL): https://github.com/cadazar/han2han
- Dataset de ajuste: https://huggingface.co/datasets/seyoungsong/Open-Korean-Historical-Corpus
- Paper, blog o demo: no disponible en la información proporcionada.
