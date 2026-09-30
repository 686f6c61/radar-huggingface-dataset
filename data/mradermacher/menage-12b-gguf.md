# mradermacher/Menage-12B-GGUF

## Resumen

Menage-12B-GGUF es un repositorio de cuantizaciones en formato GGUF generado por mradermacher a partir del modelo pinkachu/Menage-12B, un modelo obtenido mediante fusión (merge) de otros modelos con la herramienta mergekit. El repositorio no contiene un modelo entrenado desde cero, sino versiones comprimidas y listas para inferencia local con llama.cpp y derivados (Ollama, LM Studio, koboldcpp, etc.) del modelo base, que a su vez es un merge del que no se documenta la composición exacta en la información disponible.

El modelo cuenta con 12.247.782.400 parámetros (aproximadamente 12,25 mil millones), según los datos de safetensors del repositorio base, y está etiquetado como conversacional y orientado a inglés. El repositorio es de tipo estático (static quants) e incluye las cuantizaciones Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K y Q8_0, además de una variante F16 sin cuantizar. Existe un repositorio hermano con cuantizaciones ponderadas/imatrix (i1).

Su relevancia es práctica más que arquitectónica: permite ejecutar un modelo de ~12B en hardware de consumo con distintos compromisos entre tamaño y calidad, y es la vía habitual para desplegar localmente el modelo base, ya que las cuantizaciones GGUF son el formato estándar de facto en el ecosistema de inferencia local. No se dispone de información sobre licencia, longitud de contexto, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fusionado con mergekit; arquitectura del transformer base no documentada) |
| Parámetros totales | 12.247.782.400 (~12,25 B) |
| Parámetros activos | no aplica (no se documenta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16 (sin cuantizar), Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; existen además cuantizaciones i1 (imatrix/ponderadas) en repositorio aparte |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repositorio de cuantizaciones); safetensors en el modelo base pinkachu/Menage-12B |
| Tamaño del repositorio | 84,7 GB (incluye todas las cuantizaciones y la variante F16) |
| Librería declarada | transformers (metadato); uso real mediante llama.cpp y derivados |
| Fecha de creación | 2026-09-29 |
| Última actualización | 2026-09-29 |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo. Por los metadatos disponibles se sabe que pinkachu/Menage-12B es el resultado de una fusión de modelos realizada con mergekit (etiquetas `mergekit` y `merge`), una técnica que combina los pesos de dos o más modelos ya entrenados —normalmente mediante interpolación lineal, SLERP, TIES, DARE u otros métodos de fusión— sin necesidad de un entrenamiento adicional desde cero. El resultado es un modelo denso de ~12,25 B de parámetros, presumiblemente un transformer decoder-only, aunque la información proporcionada no permite confirmar la familia arquitectónica ni el tokenizador.

Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de ajuste con RLHF, DPO u otras técnicas de alineación. Las etiquetas del repositorio (`conversational`, `endpoints_compatible`) indican únicamente que el modelo está pensado para diálogo y que puede servirse a través de endpoints compatibles con la API de Hugging Face. La contribución técnica de este repositorio concreto es la cuantización: mradermacher ha generado versiones con distintos esquemas k-quant (Q2 a Q8) y una familia adicional con importancia/imatrix, que reparte el error de cuantización de forma más favorable que las cuantizaciones estáticas equivalentes en tamaño.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Instrucciones y diálogo multi-turno: el repositorio incluye la etiqueta `endpoints_compatible`, lo que permite servirlo mediante endpoints compatibles con la API de Hugging Face.
- Capacidades derivadas del modelo base fusionado: al no documentarse la composición del merge, no es posible confirmar soporte específico de código, matemáticas, razonamiento avanzado ni otras habilidades concretas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según los metadatos (`language: en`).
- Capacidades especiales (modo de razonamiento, visión, audio): no disponible; no se declara ningún modo de pensamiento ni modalidad adicional.

## Casos de uso

- Asistente conversacional local en inglés: desplegando la cuantización Q4_K_M (7,6 GB) con llama.cpp u Ollama, el modelo puede gestionar diálogos multi-turno en una máquina de consumo sin conexión a internet, manteniendo los datos en local.
- Prototipado rápido de aplicaciones de chat: al ser un GGUF con licencia no declarada y sin benchmarks, resulta adecuado para pruebas internas de concepto donde se evalúa el comportamiento del modelo base antes de comprometerse con un modelo con soporte comercial.
- Generación de texto creativo y redacción asistida: la naturaleza de merge de modelos suele producir estilos de escritura particulares; el modelo puede usarse para borradores, reescritura y variaciones de texto en inglés.
- Inferencia con recursos limitados: las cuantizaciones Q2_K (4,9 GB) y Q3_K_S (5,6 GB) permiten ejecutar el modelo en GPUs con 6-8 GB de VRAM o incluso en CPU con suficiente RAM, a costa de una pérdida de calidad notable.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece hasta once variantes del mismo modelo, lo que lo hace útil para medir experimentalmente la degradación de calidad (por ejemplo, con perplejidad) entre Q2_K y Q8_0 en una tarea concreta.
- Integración en herramientas de escritorio para IA local: Ollama, LM Studio, koboldcpp o Jan pueden importar directamente los GGUF de este repositorio, de modo que el modelo se puede ofrecer como opción descargable dentro de una aplicación de escritorio.
- Uso como componente en pipelines de generación aumentada por recuperación (RAG): siempre que se respete el límite de contexto real del modelo (no documentado, por lo que debe medirse empíricamente antes de asignar presupuestos de contexto largos).
- Referencia educativa sobre fusión de modelos: sirve para estudiar cómo se comporta un merge de ~12B frente a sus componentes originales, ya que la técnica mergekit es objeto habitual de investigación aplicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Estimaciones de VRAM para los pesos (a partir de los tamaños de archivo publicados), más un margen aproximado de 1-3 GB para caché KV y contexto según la longitud utilizada:

| Cuantización | Tamaño de pesos | VRAM estimada en inferencia | Notas |
|---|---|---|---|
| Q2_K | 4,9 GB | ~6-7 GB | Pérdida de calidad apreciable |
| Q3_K_S | 5,6 GB | ~7-8 GB | — |
| Q3_K_M | 6,2 GB | ~7-8 GB | El autor indica calidad inferior |
| Q3_K_L | 6,7 GB | ~8 GB | — |
| IQ4_XS | 6,9 GB | ~8-9 GB | Alternativa IQ de tamaño reducido |
| Q4_K_S | 7,2 GB | ~8-9 GB | Rápida y recomendada por el autor |
| Q4_K_M | 7,6 GB | ~9-10 GB | Rápida y recomendada por el autor |
| Q5_K_S | 8,6 GB | ~10-11 GB | — |
| Q5_K_M | 8,8 GB | ~10-11 GB | — |
| Q6_K | 10,2 GB | ~11-12 GB | Muy buena calidad según el autor |
| Q8_0 | 13,1 GB | ~14-15 GB | Rápida, mejor calidad según el autor |
| F16 | ~24,5 GB (estimado a partir del peso de los parámetros) | ~26 GB o más | Requiere GPU profesional o reparto en varias GPU |

- GPU de consumo: las cuantizaciones Q2_K a Q4_K_M caben en GPUs de 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, etc.). Q5 y Q6 encajan en tarjetas de 12-16 GB; Q8_0 requiere 16-24 GB (RTX 4090, RTX 3090, A5000). La F16 necesita GPU profesional o reparto entre varias GPU.
- GPU de centro de datos: A100 40/80 GB, H100, L40S o A6000 ejecutan cualquier cuantización, incluidas Q8_0 y F16, con margen para contextos largos y lotes grandes.
- CPU: las cuantizaciones Q2_K a Q5_K_M pueden ejecutarse en CPU con 16-32 GB de RAM, con velocidades de generación muy inferiores a las de GPU.
- Opciones de despliegue: llama.cpp (referencia para GGUF), Ollama, LM Studio, koboldcpp, text-generation-webui, Jan, y servidores compatibles con la API de llama.cpp. vLLM y TGI no consumen GGUF de forma nativa (vLLM puede convertir algunos GGUF, pero el formato recomendado allí sería safetensors del modelo base).
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este modelo, por lo que la comparación se limita a características verificables. Los datos de los modelos alternativos no provienen de la información proporcionada en esta ficha y deberían verificarse en sus repositorios oficiales.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Menage-12B (este repositorio) | ~12,25 B | no disponible | no disponible | GGUF (11 cuantizaciones + F16) | Merge de mergekit; sin benchmarks publicados |
| pinkachu/Menage-12B | ~12,25 B | no disponible | no disponible | safetensors | Modelo base del que derivan estas cuantizaciones |
| Alternativas de la misma categoría (~12B) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada que permitan una comparación rigurosa |

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia en el repositorio, no se puede asumir permiso para uso comercial. Es imprescindible consultar el repositorio del modelo base (pinkachu/Menage-12B) antes de cualquier despliegue en producción.
- Ausencia total de benchmarks: no hay métricas publicadas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto, por lo que el rendimiento real es desconocido y debe evaluarse empíricamente para cada caso de uso.
- Procedencia opaca: al ser un merge con mergekit sin documentación de los modelos componentes, no se conocen los datos de entrenamiento originales, lo que dificulta evaluar sesgos, contaminación de benchmarks o restricciones heredadas de los modelos fuente.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no hay información sobre fases de alineación (RLHF/DPO) que lo mitiguen.
- Sesgos conocidos: no disponible, pero al ser un modelo entrenado predominantemente en inglés, es probable que presente un sesgo cultural anglosajón y un rendimiento pobre fuera del inglés.
- Limitación de idioma: el modelo está etiquetado únicamente para inglés (`language: en`); no hay evidencia de soporte funcional en castellano.
- Longitud de contexto desconocida: hay que medirla empíricamente antes de diseñar aplicaciones que dependan de contextos largos, como RAG con muchos documentos.
- Degradación por cuantización: las variantes Q2_K y Q3_K provocan pérdidas de calidad notables; el propio autor señala Q3_K_M como de calidad inferior. Para uso serio se recomienda Q4_K_M o superior, o las variantes i1 con imatrix.
- Confusión de nombres: existen otros repositorios de mradermacher con nombres parecidos (por ejemplo MeterMaid-12b-GGUF); conviene verificar el identificador exacto del repositorio antes de descargar.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni informes de terceros sobre su comportamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Menage-12B-GGUF
- Página de resumen y descargas del autor: https://hf.tst.eu/model#Menage-12B-GGUF
- Cuantizaciones ponderadas/imatrix (i1): https://huggingface.co/mradermacher/Menage-12B-i1-GGUF
- Modelo base: https://huggingface.co/pinkachu/Menage-12B
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad entre cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (empresa que cede la infraestructura al autor): https://www.nethype.de/
