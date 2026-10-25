# Ali-Mhrez/Qwen3-4B-Instruct-2507-SD-AraStance-512-46-v2

## Resumen

`Qwen3-4B-Instruct-2507-SD-AraStance-512-46-v2` es un ajuste fino (fine-tune) supervisado del modelo denso `unsloth/Qwen3-4B-Instruct-2507`, publicado por el usuario Ali-Mhrez en HuggingFace. Se trata, por tanto, de una variante de 4 000 millones de parámetros derivada de la familia Qwen3, sin cambios en la arquitectura: el autor no documenta modificaciones estructurales, solo un entrenamiento SFT adicional mediante TRL y Unsloth.

El interés del modelo es acotado y muy específico: el sufijo del nombre sugiere un ajuste orientado a la detección de postura (*stance detection*) en árabe sobre el corpus AraStance, con una longitud de secuencia de 512 tokens y una versión 2 del entrenamiento. Sin embargo, esta interpretación es una inferencia a partir del identificador del repositorio, no un dato documentado: la model card del autor no incluye descripción del dataset, hiperparámetros, número de épocas ni métricas de evaluación.

Es relevante ahora únicamente como artefacto de investigación reproducible para quien quiera evaluar cómo un SFT corto sobre Qwen3-4B-Instruct-2507 afecta al comportamiento del modelo base en tareas de clasificación de postura en árabe. No hay descargas ni valoraciones registradas, y la información pública es mínima, por lo que cualquier uso en producción exige una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-4B-Instruct-2507; sin cambios documentados) |
| Parametros totales | ~4 000 millones (heredado del modelo base; no verificado en el repo del fine-tune) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens en el modelo base (dato heredado); no verificada tras el fine-tune, que se entreno con secuencias de 512 tokens segun el nombre |
| Tipos de cuantizacion | solo pesos safetensors en el repositorio; el autor no publica GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible en la model card; el nombre del modelo apunta a datos de arabe (AraStance) |
| Licencia | no disponible (la model card incluye `licence: license` sin especificar terminos) |
| Formato de pesos | safetensors (repositorio de 2,0 GB) |

## Arquitectura y entrenamiento

Arquitectura no documentada en el repositorio del fine-tune. Por herencia del modelo base `unsloth/Qwen3-4B-Instruct-2507`, se trata de un transformer decoder-only denso de aproximadamente 4 000 millones de parámetros, en la variante "Instruct" no razonadora de la actualización de julio de 2025 de Qwen3. El fine-tune no introduce cambios arquitectónicos: es un SFT completo o parcial sobre los pesos del modelo base.

El procedimiento de entrenamiento aparece prácticamente vacío en la model card: solo se declara que se usó SFT con TRL 0.24.0, Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.3.0 y Tokenizers 0.23.1, además del stack de Unsloth. No se especifican dataset, número de tokens, épocas, tasa de aprendizaje, ni si hubo etapas de RLHF/DPO posteriores. El identificador del modelo sugiere el corpus AraStance (detección de postura en noticias en árabe), una ventana de 512 tokens y una segunda iteración del entrenamiento (`v2`), pero son inferencias no confirmadas por el autor.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Instruct.
- Razonamiento y respuesta a instrucciones en formato chat (la model card incluye un ejemplo con `pipeline` y mensajes con rol `user`).
- Capacidad multilingüe heredada del modelo base, aunque el fine-tune puede haber desplazado la distribución hacia el árabe; no hay evaluación que lo confirme.
- Clasificación de postura o análisis de opinión en árabe: uso presumible del ajuste, no documentado por el autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (el modelo base lo soporta, pero no hay verificación tras el fine-tune).
- Modo "thinking" o razonamiento extendido: no disponible; el modelo base usado es la variante Instruct sin modo de razonamiento explícito.
- Capacidades de visión o audio: no disponibles.
- No se documentan capacidades de agente multi-paso ni decodificación especulativa.

## Casos de uso

- Evaluación de *stance detection* en árabe: uso principal presumible del modelo, consistente en clasificar la postura de un texto periodístico respecto a un tema o afirmación. Adecuado por el ajuste específico, pero requiere validación con un conjunto de test propio, ya que el autor no publica métricas.
- Investigación sobre olvido catastrófico en SFT: comparar las respuestas de este modelo con las de `unsloth/Qwen3-4B-Instruct-2507` en tareas generales permite medir cuánto degrada un ajuste corto y especializado las capacidades del modelo base.
- Prototipado rápido de clasificadores de texto en árabe: al ser un modelo de 4B, se puede desplegar en una única GPU de consumo y sirve para iterar sobre pipelines de anotación semiautomática antes de invertir en modelos mayores.
- Generación de datos sintéticos etiquetados: usar el modelo para preetiquetar corpus de postura en árabe y revisar después con anotadores humanos, aprovechando su especialización y su bajo coste de inferencia.
- Moderación de contenido en foros y medios árabes: detectar posturas hostiles o polarizadas en comentarios, con la advertencia de que la licencia no está clara y de que hace falta una evaluación de sesgos antes de cualquier despliegue.
- Réplica de experimentos de la comunidad: el repositorio incluye referencias a TRL y Unsloth, lo que permite reproducir el pipeline de SFT en entornos con una sola GPU (por ejemplo, una RTX 4090 con cuantización de 4 bits).
- Base para un segundo ajuste: al ser un checkpoint intermedio de 4B con licencia indeterminada, puede servir como punto de partida para experimentos académicos de ajuste adicional en árabe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de ningún tipo (ni exactitud en AraStance, ni MMLU, HumanEval o GSM8K), y la búsqueda web realizada no devolvió resultados relevantes sobre el modelo: únicamente devolvió páginas de AliExpress sin relación alguna con el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones propias a partir del tamaño del modelo base, no publicadas por el autor): ~8-9 GB en bf16/fp16, ~5 GB en cuantización de 8 bits y ~2,5-3 GB en 4 bits, sin contar la caché KV.
- La caché KV crece linealmente con el contexto: a 512 tokens es despreciable, pero utilizar la ventana de 262 144 tokens del modelo base exigiría decenas de GB adicionales y técnicas como atención con páginas (vLLM) o cuantización de la caché.
- GPU recomendadas: A100 40 GB u H100 para servir el modelo base a contexto largo; L40S o A10G para contexto moderado; RTX 4090, RTX 3090 o RTX 4070 Ti Super para inferencia en 4-8 bits.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más usando cuantización de 4 bits, y en 12-16 GB en bf16 con contexto corto.
- Opciones de despliegue: `transformers` (soporte nativo, tal como muestra la model card), vLLM o TGI si se convierte a un formato servible, llama.cpp/Ollama solo si se genera previamente un GGUF, que el autor no publica. Unsloth permite exportar a GGUF desde el checkpoint.
- Latencia y throughput: no disponibles. No hay datos de tokens por segundo ni de latencia publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-SD-AraStance-512-46-v2 | ~4 000 M (denso) | 262 144 en el base; 512 en el entrenamiento según el nombre | no disponible | repo público, 0 descargas | fine-tune SFT de nicho, sin métricas |
| unsloth/Qwen3-4B-Instruct-2507 (base) | ~4 000 M (denso) | 262 144 | la del modelo original Qwen3 (habitualmente Apache 2.0; verificar) | ampliamente disponible, cuantizaciones GGUF de la comunidad | referencia obligada para medir la degradación del fine-tune |
| Llama-3.2-3B-Instruct | 3 200 M (denso) | 128 000 | licencia comunitaria de Meta con restricciones | ampliamente disponible, ecosistema GGUF maduro | alternativa generalista de tamaño similar |
| Gemma-3-4B-IT | ~4 000 M (denso) | 128 000 | términos de uso de Google | ampliamente disponible | alternativa generalista multilingüe de tamaño similar |

No se dispone de datos de benchmarks para comparar el rendimiento real de este fine-tune con las alternativas; la comparación anterior se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Model card prácticamente vacía: no hay información sobre dataset, hiperparámetros, época de entrenamiento ni evaluación. Cualquier afirmación sobre su calidad es especulativa.
- Licencia indeterminada: el campo `licence: license` no especifica términos, y la licencia del modelo base (presumiblemente Apache 2.0, a verificar con Qwen) puede imponer condiciones adicionales. No se debe usar comercialmente sin aclarar este punto.
- Riesgo de sobreajuste al dominio: un SFT corto sobre un corpus concreto de árabe puede degradar el rendimiento general y aumentar la tasa de alucinación fuera de la distribución de entrenamiento.
- Sesgos desconocidos: no se ha publicado ninguna evaluación de sesgos, y los corpus de noticias en árabe pueden arrastrar sesgos de fuente, geográficos y políticos.
- Cobertura lingüística incierta: aunque el modelo base es multilingüe, el ajuste puede haber reducido la calidad en castellano u otros idiomas. No hay evaluación que lo cuantifique.
- Longitud de contexto efectiva no verificada: aunque el modelo base soporta 262 144 tokens, el entrenamiento con secuencias de 512 puede hacer que el modelo no generalice bien a contextos largos.
- Sin cuantizaciones publicadas: usar el modelo en producción requiere generar los GGUF o AWQ de forma manual, con el riesgo de degradación que ello implica.
- Advertencia sobre la búsqueda web: los resultados devueltos no guardan relación con el modelo (páginas de AliExpress), por lo que no se ha podido contrastar ninguna información externa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Ali-Mhrez/Qwen3-4B-Instruct-2507-SD-AraStance-512-46-v2
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507
- Repositorio de TRL: https://github.com/huggingface/trl
- Unsloth (stack de entrenamiento citado en las etiquetas del repositorio): https://github.com/unslothai/unsloth
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la búsqueda web realizada.
