# arnastofnun/Qwen3-4B-wmt26-AMI-en-is

## Resumen

Qwen3-4B-wmt26-AMI-en-is es un checkpoint fusionado (merge) publicado por Árnastofnun (Instituto Árni Magnússon de Estudios Islandeses) como parte de su participación en la tarea compartida de traducción general de WMT 2026, dirección inglés-islandés. No se trata de un modelo nuevo entrenado desde cero, sino de una fusión lineal al 50/50 entre Qwen/Qwen3-4B-Instruct-2507 y un checkpoint local de Qwen3-4B-Base sometido a preentrenamiento continuado (CPT) en islandés sobre el Icelandic Gigaword Corpus. La fusión se generó con mergekit y conserva el tokenizador del modelo instruct original.

Es importante entender que este repositorio, por sí solo, no es un traductor: la model card lo describe explícitamente como un modelo instructivo de propósito general con pesos adaptados al islandés, concebido como base sobre la que se entrena un adaptador LoRA (arnastofnun/Qwen3-4B-wmt26-AMI-en-is-lora) que es el que realmente convierte el sistema en un traductor inglés→islandés. El checkpoint fusionado tiene 4.021.784.576 parámetros en bfloat16, ocupa 8,1 GB en el repositorio y se distribuye bajo licencia Apache 2.0.

Su relevancia ahora es doble: por un lado, documenta una estrategia de bajo coste para llevar capacidades de traducción a una lengua de bajos recursos como el islandés reutilizando un modelo instructivo multilingüe; por otro, sirve como pieza base reproducible para quien quiera entrenar o servir el adaptador LoRA asociado sin partir de los pesos originales de Qwen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only de la familia Qwen3 (heredada de Qwen/Qwen3-4B-Instruct-2507); checkpoint resultante de una fusión lineal 0.5/0.5 |
| Parametros totales | 4.021.784.576 (~4,02 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens nativos |
| Tipos de cuantizacion | No disponibles; los pesos publicados están en bfloat16 (safetensors). No se han publicado versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | Inglés (en) e islandés (is), según los metadatos de la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16); tamaño del repositorio 8,1 GB |
| Tokenizador | Qwen/Qwen3-4B-Instruct-2507 (tokenizer_source en la configuración de mergekit) |
| Método de fusión | Linear (mergekit), dtype bfloat16 |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Pipeline declarado | translation |
| Repositorio | 8,1 GB |

## Arquitectura y entrenamiento

El checkpoint no introduce una arquitectura nueva: parte de Qwen3-4B-Instruct-2507, un transformer denso decoder-only de aproximadamente 4.000 millones de parámetros, y lo combina mediante una fusión lineal de pesos (merge_method: linear, weight 0.5 para cada entrada, dtype bfloat16) con un checkpoint Qwen3-4B-Base que fue sometido a preentrenamiento continuado en islandés usando el Icelandic Gigaword Corpus (IGC). El segundo checkpoint no se ha publicado de forma abierta. El tokenizador del resultado es el del modelo instruct de Qwen, no el del checkpoint islandés.

No se describe en la información disponible ningún proceso de RLHF, DPO o ajuste por preferencias sobre este checkpoint fusionado, ni se detalla el número de tokens vistos durante el CPT islandés. La innovación técnica relevante es metodológica, no arquitectónica: demuestra que una fusión de pesos lineal entre un modelo instructivo multilingüe y un modelo base adaptado a una lengua de bajos recursos produce una base útil para ajuste posterior con LoRA. El uso previsto por los autores es servir este checkpoint con vLLM habilitando el adaptador LoRA mediante `--enable-lora --lora-modules`, de modo que el adaptador aporte la capacidad de traducción inglés→islandés.

## Capacidades

- Generación de texto instructiva de propósito general, heredada de Qwen3-4B-Instruct-2507.
- Comprensión y generación en islandés a nivel de pesos, gracias al preentrenamiento continuado sobre el Icelandic Gigaword Corpus incorporado en la fusión.
- Base para ajuste fino con LoRA: es el sustrato sobre el que se entrena el adaptador de traducción inglés→islandés.
- Traducción inglés→islandés únicamente cuando se combina con el adaptador arnastofnun/Qwen3-4B-wmt26-AMI-en-is-lora; el checkpoint fusionado por sí solo no es un modelo de traducción.
- Compatibilidad con Transformers, safetensors y text-generation-inference (TGI) según las etiquetas del repositorio.
- No hay información en la model card sobre tool calling, function calling, capacidades de agente, modo de razonamiento explícito (thinking), visión ni audio para este checkpoint concreto. Cualquier capacidad de este tipo dependería del modelo base y no está documentada aquí.

## Casos de uso

- Traducción inglés→islandés en producción: desplegando el checkpoint conjuntamente con el adaptador LoRA en vLLM, se obtiene un servicio de traducción de la dirección en→is para contenidos editoriales o institucionales, que es exactamente el escenario para el que fue construido.
- Investigación en traducción automática de bajos recursos: sirve como punto de partida reproducible para experimentar con estrategias de fusión de pesos y CPT en lenguas con pocos datos, comparando contra el modelo base sin fusionar.
- Punto de partida para nuevos ajustes LoRA: al ser una base instructiva con pesos islandeses, permite entrenar adaptadores adicionales para otras direcciones (is→en) o para dominios específicos sin tocar los 4.000 millones de parámetros completos.
- Servicio de inferencia con adaptadores intercambiables: vLLM permite cargar varios módulos LoRA sobre la misma base, de modo que un único proceso puede atender distintas tareas de traducción o estilo compartiendo los pesos del checkpoint fusionado.
- Normalización y generación de texto en islandés: al haber absorbido el IGC, el checkpoint es candidato para tareas de redacción asistida y paráfrasis en islandés antes de aplicar el adaptador de traducción.
- Evaluación comparativa de pipelines de fusión: útil para medir el impacto real de una fusión lineal 0.5/0.5 frente a otras técnicas de mergekit (slerp, TIES, DARE) sobre el mismo par de modelos.
- Prototipado en hardware de consumo: con 4.000 millones de parámetros y licencia Apache 2.0, permite montar un banco de pruebas de traducción en una sola GPU de gama alta sin costes de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas (BLEU, chrF, COMET, MMLU, HumanEval ni similares) para este checkpoint, y los resultados de la búsqueda web proporcionada no guardan relación con el modelo (corresponden a páginas sobre urología en polaco y no son material utilizable). El único dato de contexto verificable es que el modelo forma parte de la propuesta AMI (Árni Magnússon Institute) a la tarea compartida de traducción general de WMT 2026, recogida en la publicación "What a DRAG (It Is Being Small) - The AMI Submission to the WMT 2026 General Translation Shared Task".

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 8,1 GB solo para los pesos, más la caché KV. Con contexto moderado (8.000-32.000 tokens) el consumo se sitúa en torno a 10-16 GB según lote y longitud de secuencia.
- Cuantización: no hay pesos cuantizados publicados. Una conversión propia a int8 reduciría los pesos a unos 4 GB y a int4 a unos 2,5 GB, pero ese trabajo no viene hecho ni validado por el autor.
- GPU de gama profesional: A100 (40/80 GB), H100 y L40S sobradas para el modelo, con margen para lotes grandes y contexto largo.
- GPU de consumo: cabe sin cuantizar en RTX 4090, RTX 3090 y RTX 4080 (16 GB) con margen ajustado, y en RTX 3060 de 12 GB con contextos cortos. En tarjetas de 8 GB requeriría cuantización previa no publicada.
- Opciones de despliegue: vLLM con soporte de LoRA, que es el método documentado por el autor; también Transformers y text-generation-inference según las etiquetas del repositorio. Ollama o llama.cpp exigirían una conversión a GGUF que no se proporciona.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3-4B-wmt26-AMI-en-is | 4,02 B | No especificado (base: 262.144 tokens) | Apache 2.0 | Fusión para base de traducción en→is con LoRA |
| Qwen/Qwen3-4B-Instruct-2507 | 4,02 B | 262.144 tokens declarados | Apache 2.0 | Modelo instructivo generalista, sin adaptación al islandés |
| Modelos de traducción en→is de Miðeind u otros organismos islandeses | No disponible | No disponible | No disponible | Traducción dedicada islandés; datos no accesibles en esta búsqueda |
| NLLB-200 (Meta) | 600 M - 54 B | 512 tokens | CC-BY-NC 4.0 (no comercial) | Traducción multilingüe de 200 lenguas, incluido el islandés |

La comparación directa con alternativas específicas de traducción inglés→islandés no puede completarse porque la información proporcionada no incluye esos modelos ni sus métricas. La diferencia principal frente al Qwen3-4B-Instruct-2507 original es la incorporación de pesos adaptados al islandés vía CPT y fusión, y frente a NLLB-200, la licencia Apache 2.0 permite uso comercial que la licencia CC-BY-NC de NLLB no autoriza.

## Limitaciones y advertencias

- El checkpoint fusionado no es un traductor por sí mismo: sin el adaptador LoRA asociado no realiza traducción inglés→islandés, tal y como advierte la propia model card.
- El checkpoint islandés de preentrenamiento continuado no se ha liberado públicamente, lo que limita la reproducibilidad exacta de la fusión.
- No hay métricas publicadas de calidad de traducción ni evaluaciones independientes en la información disponible.
- Al ser una fusión lineal de pesos, existe riesgo de degradación de capacidades del modelo instructivo original; no se documenta ninguna evaluación que cuantifique esa pérdida.
- Riesgo de alucinación inherente al modelo base Qwen3-4B-Instruct-2507, no mitigado ni medido en este repositorio.
- Sesgos: no se documenta ningún análisis de sesgos, ni del corpus IGC empleado en el CPT ni del resultado de la fusión.
- Cobertura idiomática limitada a inglés e islandés según los metadatos; el rendimiento en otras lenguas no está documentado y probablemente se degrade respecto al modelo base.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar las condiciones de los datos de CPT (Icelandic Gigaword Corpus) si se redistribuye el modelo o se usa en productos derivados.
- No se ofrecen pesos cuantizados ni formato GGUF, lo que complica el despliegue en hardware de gama baja.
- El modelo se publicó en septiembre de 2026 en el contexto de WMT 2026; no hay historial de mantenimiento ni versiones posteriores documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arnastofnun/Qwen3-4B-wmt26-AMI-en-is
- Adaptador LoRA asociado (necesario para traducción): https://huggingface.co/arnastofnun/Qwen3-4B-wmt26-AMI-en-is-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- mergekit (herramienta de fusión): https://github.com/cg123/mergekit
- Icelandic Gigaword Corpus (CLARIN-IS): https://clarin.is/en/resources/gigaword/
- Árnastofnun (Instituto Árni Magnússon de Estudios Islandeses): https://arnastofnun.is
- vLLM (servidor recomendado por el autor): https://github.com/vllm-project/vllm
- Publicación de referencia: Steingrímsson, Þórðarson y Daðason, "What a DRAG (It Is Being Small) - The AMI Submission to the WMT 2026 General Translation Shared Task", Proceedings of the Eleventh Conference on Machine Translation, Budapest, 2026 (sin URL disponible en la información proporcionada)
