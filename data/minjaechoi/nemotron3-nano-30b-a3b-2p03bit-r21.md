# minjaechoi/nemotron3-nano-30b-a3b-2p03bit-r21

## Resumen

`minjaechoi/nemotron3-nano-30b-a3b-2p03bit-r21` es un checkpoint de investigación derivado de `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. Se trata de una variante de la arquitectura Nemotron-H (etiqueta `nemotron_h`) en la que los expertos enrutados de la capa MoE se han cuantizado a una media de 2,0251 bits, mientras que el resto de pesos permanece en BF16. El identificador interno del autor es `r21` y la model card lo describe explícitamente como un checkpoint de investigación interno, no como un modelo listo para producción.

El modelo declara 31.577.937.344 parámetros (unos 31,58 mil millones) según los metadatos de safetensors, con un repositorio de 63,2 GB. La nomenclatura "A3B" del modelo base sugiere del orden de 3.000 millones de parámetros activos por token, aunque este extremo no se confirma en la documentación disponible. Un dato relevante para su evaluación es que los pesos se almacenan **de-cuantizados en tensores BF16**: es decir, la compresión a 2 bits afecta al proceso de cuantización de los expertos, pero no se traduce en un ahorro de memoria en inferencia, ya que el checkpoint ocupa el mismo espacio que un modelo BF16 equivalente.

Su relevancia es fundamentalmente metodológica: permite estudiar el impacto de una cuantización extremadamente agresiva (~2 bits) aplicada únicamente a los expertos enrutados de un MoE, manteniendo el resto de la red en alta precisión. No se han publicado resultados de benchmarks, idiomas soportados, longitud de contexto ni licencia explícita en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (`nemotron_h`), transformer con mezcla de expertos (MoE); requiere `custom_code` |
| Parametros totales | 31.577.937.344 (~31,58 mil millones) |
| Parametros activos | ~3.000 millones (deducido de la nomenclatura "A3B" del modelo base; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a una media de 2,0251 bits; resto de pesos en BF16. Los pesos se almacenan de-cuantizados en tensores BF16. No se publican versiones GGUF ni otros formatos cuantizados |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la ficha; la model card indica que hereda la licencia del modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` |
| Formato de pesos | safetensors (BF16 de-cuantizado), con código personalizado (`trust_remote_code=True`) |
| Tamano del repositorio | 63,2 GB |
| Modelo base | nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 |
| Pipeline | text-generation |
| Fecha de creacion (metadatos) | 2026-09-20 |

## Arquitectura y entrenamiento

La arquitectura corresponde a Nemotron-H, la familia de modelos de NVIDIA identificada por la etiqueta `nemotron_h`, con una capa de mezcla de expertos (MoE) cuyo componente enrutado es el objeto de la cuantización. El checkpoint no incluye detalles sobre el número de expertos, el número de expertos activados por token, la dimensión oculta, el número de capas ni el mecanismo de enrutamiento; toda esa información quedaría en la model card del modelo base, que no se ha proporcionado.

La innovación técnica del checkpoint es la cuantización selectiva: únicamente los expertos enrutados se comprimen a una media de 2,0251 bits, mientras que el resto de los pesos (atención, embeddings, capas densas, normalizaciones) se mantiene en BF16. Según la model card, los pesos se almacenan ya de-cuantizados en tensores BF16 y cargan con `transformers` estándar y con vLLM. No se especifican los datos de entrenamiento, el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO u otras técnicas de alineación. No se menciona ninguna técnica de decodificación especulativa ni de atención lineal.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` indica que el modelo base está orientado a diálogo multi-turno.
- Razonamiento, código y matemáticas: no disponible; no se documentan capacidades específicas más allá de `text-generation`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ninguna lista de idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatibilidad con endpoints: incluye la etiqueta `endpoints_compatible`, lo que indica que puede desplegarse en Hugging Face Inference Endpoints.
- Carga con código personalizado: requiere `trust_remote_code=True` por la etiqueta `custom_code`.

## Casos de uso

- Investigación sobre cuantización de MoE: el checkpoint permite reproducir y auditar el efecto de comprimir a ~2 bits exclusivamente los expertos enrutados, manteniendo el resto en BF16, y compararlo contra el modelo base sin cuantizar.
- Análisis de degradación por precisión extrema: sirve para medir cuánta calidad se pierde en tareas de generación cuando los expertos enrutados operan a 2,0251 bits medios y el resto de la red permanece en BF16.
- Estudio de enrutamiento de expertos: al conservarse los pesos de-cuantizados, es posible instrumentar el modelo para analizar qué expertos se activan ante distintas entradas y si la cuantización altera la distribución de enrutamiento.
- Fine-tuning y destilación experimental: como punto de partida para adaptaciones posteriores en entornos de investigación donde se quiera partir de un MoE de 31,58B con expertos ya comprimidos.
- Evaluación comparativa interna (A/B): desplegar este checkpoint junto al modelo base BF16 en el mismo clúster para comparar perplejidad, coherencia y latencia sobre un conjunto de validación propio.
- Prototipado conversacional en entornos controlados: por su etiqueta `conversational` y su compatibilidad con vLLM, puede usarse en demos internas de diálogo, siempre que se asuma la ausencia de benchmarks y de validación publicada.
- Servicio mediante Inference Endpoints: la etiqueta `endpoints_compatible` permite publicarlo como endpoint gestionado, útil para pruebas de integración sin montar infraestructura propia.
- Docencia y formación técnica: sirve como ejemplo práctico de cuantización selectiva por componentes en arquitecturas MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del checkpoint no incluye ninguna tabla de evaluación (MMLU, HumanEval, GSM8K ni similares) y la búsqueda web realizada no devolvió fuentes técnicas relevantes sobre este modelo. No es posible, por tanto, cuantificar la pérdida de calidad respecto al modelo base BF16 ni comparar con alternativas de la misma categoría.

## Requisitos de hardware

- Peso en memoria de los parámetros: al almacenarse los pesos en BF16, el checkpoint ocupa 63,2 GB. La compresión a 2,0251 bits de los expertos enrutados **no reduce** la VRAM necesaria en inferencia.
- VRAM estimada: un mínimo de ~64 GB solo para pesos, más el espacio de activaciones y la caché KV (dependiente de la longitud de contexto, que no se ha publicado). En la práctica, se recomienda disponer de al menos 80 GB.
- GPU recomendadas: 1x H100 80 GB (ajustado), 1x A100 80 GB (ajustado), o configuraciones multi-GPU con tensor parallelism (2x A100 40 GB, 2x L40S 48 GB).
- GPU de consumo: no cabe en una única GPU de consumo. Sería viable, con reservas, en configuraciones multi-GPU como 4x RTX 4090 (96 GB agregados) usando vLLM con tensor parallelism; en 2x RTX 5090 (64 GB) el margen sería insuficiente para la caché KV.
- Opciones de despliegue: `transformers` estándar y vLLM, según la model card. No hay versiones GGUF publicadas, por lo que llama.cpp y Ollama no son compatibles directamente sin una conversión previa, que además se complica por el uso de `custom_code`.
- Latencia y throughput estimados: no disponible.
- Requisito adicional: es necesario activar `trust_remote_code=True` para cargar el modelo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nemotron3-nano-30b-a3b-2p03bit-r21 | 31,58B | ~3B (estimado) | no disponible | hereda del modelo base; no especificada | Hugging Face, 0 descargas, 0 likes |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 (base) | no disponible en esta informacion | no disponible | no disponible | no disponible | Hugging Face |
| Qwen3-30B-A3B | 30,5B | 3,3B | 32.768 tokens nativos; 131.072 con YaRN | Apache 2.0 | Hugging Face, ampliamente difundido |
| Mixtral 8x7B | 46,7B | 12,9B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente difundido |

Nota: los datos de Qwen3-30B-A3B y Mixtral 8x7B proceden de su documentación pública como referencias de la misma categoría (MoE de tamaño medio) y no de la información proporcionada en esta ficha; conviene verificarlos antes de usarlos en una decisión de adopción. Las cifras del modelo base Nemotron 3 Nano no se detallan en la información disponible.

## Limitaciones y advertencias

- Checkpoint de investigación interna: la propia model card lo califica como "internal research checkpoint", sin validación publicada ni garantías de calidad.
- Ausencia total de benchmarks: no hay métricas de MMLU, HumanEval, GSM8K ni ninguna otra que permita estimar el impacto de la cuantización a 2 bits sobre la calidad.
- Sin adopción verificable: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Sin ahorro de memoria: los pesos se distribuyen de-cuantizados en BF16 (63,2 GB), por lo que la ventaja esperable de una cuantización a 2 bits no se materializa en requisitos de hardware.
- Licencia no determinada: la model card remite a la licencia del modelo base, que no se especifica en la información disponible. Es imprescindible consultar la licencia de `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` antes de cualquier uso comercial.
- Idiomas no declarados: no se indica qué lenguas soporta ni cuál es su cobertura multilingüe.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que dependan de ventanas largas.
- Riesgo de alucinación: no cuantificado; al no haber evaluaciones, no puede descartarse que la cuantización agresiva de expertos incremente la tasa de errores factuales.
- Complejidad de despliegue: requiere `custom_code` y `trust_remote_code=True`, lo que añade superficie de riesgo al ejecutar código del repositorio.
- Ecosistema limitado: al no existir versiones GGUF, no puede ejecutarse en llama.cpp u Ollama sin conversión manual.
- Sesgos: no disponible; no se documenta ningún análisis de sesgos.
- Metadatos anómalos: la fecha de creación registrada (20/09/2026) no se corresponde con las convenciones habituales del repositorio, lo que sugiere un posible error de metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minjaechoi/nemotron3-nano-30b-a3b-2p03bit-r21
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Paper, blog o repositorio del autor: no disponible
- Demos: no disponible
- La búsqueda web realizada no devolvió fuentes técnicas relevantes sobre este modelo (los resultados obtenidos correspondían a páginas de ayuda de YouTube, sin relación con el modelo).
