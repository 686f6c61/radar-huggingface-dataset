# Nidhal101/Step-5-Preview-NVFP4-CLEER-k8

## Resumen

Step-5-Preview-NVFP4-CLEER-k8 es un proxy de benchmarking derivado de stepfun-ai/Step-5-Preview-NVFP4, el modelo insignia de StepFun orientado a trabajo agéntico. No es un modelo de lenguaje utilizable: el autor (Nidhal101) lo publica como artefacto para la metodología CLEER-Text (Sustainable AI Group) de medición de energía. La modificación consiste en podar cada capa MoE del modelo original para retener únicamente 8 de sus 352 expertos enrutados, manteniendo exactamente 8 expertos activados por token. De este modo, cada token ejecuta todos los expertos retenidos y el coste aritmético y de tráfico de memoria por token coincide con el del modelo completo, permitiendo reproducir en un solo nodo la carga por acelerador de un despliegue con paralelismo de expertos de gran escala.

El checkpoint conserva byte a byte el resto de componentes del modelo fuente (atención, embeddings, normalizaciones, expertos compartidos, cabezas MTP y la cuantización NVFP4 original, con las escalas copiadas junto a sus expertos). El resultado son 31.484.034.816 parámetros serializados en safetensors, un repositorio de 44,5 GB y una validación estructural que confirma 88 módulos MoE con 8 expertos cada uno y 1205 tensores comparados byte a byte contra el origen.

Su relevancia es metodológica: permite a investigadores de eficiencia energética medir el consumo por acelerador de arquitecturas MoE de gran tamaño sin necesidad de aprovisionar un clúster completo de GPUs. El texto generado está degradado por diseño, por lo que cualquier evaluación debe centrarse en métricas de energía y rendimiento, no en calidad lingüística.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) dispersa, derivada de Step-5-Preview; incluye encoder de visión en los ficheros |
| Parametros totales | 31.484.034.816 (proxy podado); el modelo fuente declara 600B totales |
| Parametros activos | 8 expertos enrutados por token sobre 8 retenidos (el fuente activa 27B por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (cuantización original del modelo fuente, conservada) |
| Idiomas soportados | no disponible |
| Licencia | stepfun-model-license-1.0 (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El proxy mantiene la arquitectura MoE del modelo fuente: 88 módulos MoE, cada uno con 352 expertos enrutados en el original y 8 en esta versión. La poda se aplica mediante la edición `config.json:moe_num_experts 352->8`, la eliminación de las entradas de metadatos de cuantización que nombraban expertos descartados y la renumeración de los restantes. Los expertos retenidos son los identificadores de origen `[0, 1, 2, 3, 4, 5, 6, 7]`, renumerados desde 0, y las filas del router se recortan a esos mismos expertos. El número de expertos por token permanece en 8, de modo que todos los expertos conservados se activan en cada paso.

No se ha realizado ningún entrenamiento ni ajuste adicional: atención, embeddings, normalizaciones, expertos compartidos y cabezas MTP son idénticos al modelo fuente, y las escalas de cuantización se copian junto con sus expertos. El autor documenta una validación estructural superada (88 módulos MoE × [8] expertos, routers y sesgos con 8 filas, 1205 tensores comparados byte a byte) y una prueba de humo en vLLM sobre 1× H200 con batch 32 y 32 tokens nuevos: carga en 72 s y 1024 tokens generados, lo que solo verifica que el checkpoint carga y se ejecuta. No se dispone de datos sobre el dataset de entrenamiento original, el número de tokens ni las etapas de RLHF o DPO del modelo fuente.

## Capacidades

- No es un modelo de lenguaje utilizable: el texto generado está degradado por diseño, según advierte el autor.
- Reproducción de la carga aritmética y de tráfico de memoria por token de un MoE de gran escala en un solo nodo.
- Emulación del reparto de expertos por GPU de un despliegue con paralelismo de expertos (por ejemplo, alojando k/EP expertos por GPU).
- Benchmarking energético bajo la metodología CLEER-Text.
- Carga y ejecución verificadas en vLLM con el flag `--language-model-only`.
- El encoder de visión se conserva en los ficheros para que la configuración siga siendo cargable, pero los benchmarks CLEER son solo de texto y se recomienda omitir su carga.
- No disponible: tool calling, razonamiento multi-paso, capacidades multilingües o modo thinking utilizables, al tratarse de un artefacto de medición.

## Casos de uso

- Medición de energía por acelerador en arquitecturas MoE: el proxy permite ejecutar en una única GPU la misma carga aritmética por token que un despliegue distribuido del modelo completo, de modo que el consumo medido es representativo del trabajo real por token.
- Estimación de coste energético de despliegues con paralelismo de expertos: al retener 8 de 352 expertos, un nodo puede reproducir el patrón de k/EP expertos por GPU y extrapolar el consumo a configuraciones de mayor escala.
- Calibración de metodologías de eficiencia: sirve como referencia controlada para validar herramientas de medición de energía (por ejemplo, las del ecosistema CLEER) antes de aplicarlas a modelos completos.
- Pruebas de humo de infraestructura: la carga en vLLM (72 s en 1× H200) y la generación de 1024 tokens permiten validar pipelines de servicio, flags de arranque y configuraciones de cuantización NVFP4 sin desplegar el modelo íntegro.
- Investigación sobre cuantización NVFP4: al conservar las escalas originales junto a los expertos, el checkpoint permite estudiar el comportamiento del formato NVFP4 en capas MoE con independencia del enrutamiento completo.
- Docencia y experimentación con arquitecturas MoE: un checkpoint de 44,5 GB con 88 módulos MoE inspeccionables facilita el análisis estructural de routers, sesgos y expertos compartidos en entornos con recursos limitados.
- Comparación de eficiencia entre variantes podadas: permite medir cómo varía el coste por token al modificar el número de expertos retenidos manteniendo fijo el número de expertos activos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta una prueba de humo en vLLM (1× H200, batch 32, 32 tokens nuevos): carga en 72 s y generación de 1024 tokens, sin métricas de calidad ni de throughput sostenido.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 44,5 GB en safetensors NVFP4; se requiere al menos esa cifra más overhead de activaciones y caché KV, por lo que una GPU de 80 GB es el mínimo práctico razonable.
- GPU recomendadas: H200 (validada por el autor en la prueba de humo); H100 y A100 de 80 GB son opciones coherentes por capacidad de memoria, aunque no están verificadas en la información disponible.
- GPU de consumo: no cabe en GPUs de consumo típicas (24 GB o menos) por el tamaño del checkpoint; no disponible confirmación para modelos de 48 GB o superiores.
- Opciones de despliegue: vLLM, con el flag `--language-model-only` para omitir el encoder de visión. No se documentan otras opciones (llama.cpp, Ollama, TGI).
- Latencia y throughput: no disponibles más allá de los 72 s de carga y los 1024 tokens generados en la prueba de humo.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Expertos por capa / por token | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Step-5-Preview-NVFP4-CLEER-k8 (este) | 31,48B (proxy) | 8 / 8 | no disponible | stepfun-model-license-1.0 | Hugging Face |
| stepfun-ai/Step-5-Preview-NVFP4 | 600B | 352 / 8 | no disponible | stepfun-model-license-1.0 | Hugging Face |
| stepfun-ai/Step-5-Preview | 600B | 352 / 8 | no disponible | stepfun-model-license-1.0 | Hugging Face |

La comparación se limita a las variantes del mismo modelo fuente, ya que el proxy no es funcionalmente equivalente a ningún modelo de propósito general. No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje utilizable: el autor advierte explícitamente que el texto generado está degradado por diseño.
- La poda de 352 a 8 expertos por capa altera la distribución de enrutamiento; los resultados de calidad no son representativos del modelo fuente.
- El encoder de visión se conserva solo para mantener la configuración cargable; los benchmarks CLEER son exclusivamente de texto.
- Licencia stepfun-model-license-1.0: todo uso debe cumplir los términos del modelo original, incluidos `LICENSE.txt` y `LICENSE-CN.txt`; es necesario revisar las restricciones de uso comercial antes de cualquier despliegue.
- Sin datos publicados sobre sesgos, alucinación, cobertura idiomática ni longitud de contexto del modelo fuente en la información disponible.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo día (6 de noviembre de 2026), por lo que no cuenta con validación externa.
- La validación estructural y la prueba de humo las aporta el propio autor; no hay verificación independiente.
- No apto para producción como servicio de generación de texto bajo ninguna circunstancia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nidhal101/Step-5-Preview-NVFP4-CLEER-k8
- Modelo base: https://huggingface.co/stepfun-ai/Step-5-Preview-NVFP4
- Modelo fuente sin cuantizar: https://huggingface.co/stepfun-ai/Step-5-Preview
- Licencia del modelo fuente: https://huggingface.co/stepfun-ai/Step-5-Preview/blob/main/LICENSE.txt
