# malkolm777/zils-lite-leader-ultra-v2

## Resumen

zils-lite-leader-ultra-v2 es un modelo de extracción de características (feature-extraction) publicado por el usuario malkolm777 en Hugging Face. Se presenta como un "cuerpo de decisión" (decision body) construido sobre la familia Qwen3.5-0.8B y derivado del modelo base vllm-sr/d3-lite, con 852.985.920 parámetros reales según los pesos en safetensors y un tamaño de repositorio de 1,7 GB. Su propósito declarado es participar en el "lite soup pool" de la subred Zils 127, un ecosistema de modelos especializados en tareas de decisión.

El modelo se ha obtenido mediante una técnica de merging y extrapolación de deltas: se parte del miembro actual del pool (joamCriff123/zils-lite-l1117a), se entrenan ocho estudiantes LoRA con semillas distintas (rango 64, learning rate 5e-5, una época) y se promedian sus pesos; el cambio resultante respecto al punto de partida se escala por un factor de 1,75 (extrapolación de delta). El conjunto de entrenamiento son 4.580 ítems de decisión estilo examen, generados por un LLM en el formato del validador, y los objetivos son las distribuciones completas de opciones del modelo mayor vllm-sr/d3-ultra (destilación por KL, sin etiquetas gold).

Es relevante porque documenta un patrón de trabajo poco habitual: destilación de distribuciones completas desde un modelo mayor hacia un "cuerpo de decisión" pequeño, combinada con soup de LoRAs y extrapolación de delta, todo empaquetado con licencia Apache-2.0 y compatible con endpoints. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y su model card es extremadamente escueta en cuanto a especificaciones de contexto, idiomas y benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5-0.8B, según model card); tipo exacto no disponible |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe el modelo como un "d3-lite decision body" perteneciente a la familia Qwen/Qwen3.5-0.8B. Se trata, por tanto, de un transformer de aproximadamente 0,85 mil millones de parámetros, aunque no se detalla la configuración interna (número de capas, dimensiones ocultas, mecanismo de atención). El proceso de construcción es un pipeline de tres etapas: primero se parte del miembro actual del pool (joamCriff123/zils-lite-l1117a); después se entrenan ocho estudiantes LoRA independientes con semillas 553, 771, 991, 1201, 1409, 1601, 1801 y 2003, rango 64, learning rate 5e-5 y una época; finalmente se promedian los pesos de los ocho estudiantes y el delta respecto al punto de partida se escala por 1,75 (extrapolación de delta).

El entrenamiento es una destilación por divergencia KL desde el modelo mayor vllm-sr/d3-ultra. El conjunto de datos consta de 4.580 ítems de decisión estilo examen, en las familias de tareas del pool, generados por un LLM en el formato del validador (estado más pregunta de decisión con opciones declaradas). Los objetivos no son etiquetas gold, sino las distribuciones completas de opciones del profesor sobre cada ítem. La model card indica que el readout, la torre de visión y todos los ficheros de contrato son los del chasis (es decir, se heredan del modelo base). No se especifican el número de tokens de entrenamiento, la composición del dataset más allá de los 4.580 ítems, ni si hubo RLHF o DPO.

## Capacidades

- Extracción de características (feature-extraction): es el pipeline declarado en Hugging Face.
- Toma de decisiones sobre opciones declaradas: el modelo está entrenado para producir distribuciones de probabilidad sobre opciones en ítems de decisión estilo examen.
- Destilación de distribuciones: aprende la distribución completa del profesor, no solo la opción ganadora.
- Herencia del chasis: según la model card, conserva el readout, la torre de visión y los ficheros de contrato del modelo base, aunque no se detalla qué implica funcionalmente esa torre de visión.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas no está informado).
- Capacidades especiales (thinking mode, visión, audio): la model card menciona una torre de visión heredada, pero no se especifica su funcionamiento ni su alcance.

## Casos de uso

- Clasificación de decisiones en pipelines de validación: el modelo puede puntuar opciones declaradas en ítems de decisión con el formato del validador (estado más pregunta más opciones), integrándose como componente de scoring en la subred Zils 127.
- Destilación de profesores grandes: sirve como ejemplo reproducible de cómo destilar las distribuciones de un modelo mayor (vllm-sr/d3-ultra) en un cuerpo de decisión de 0,85 mil millones de parámetros, útil para equipos que quieran replicar el patrón con sus propios datos.
- Investigación en merging de LoRAs: el pipeline de ocho estudiantes LoRA con semillas distintas, promediado y extrapolación de delta con factor 1,75, es un caso de estudio para experimentar con soup de adaptadores y extrapolación de pesos.
- Evaluación de robustez de decisiones: al producir distribuciones completas sobre opciones, permite analizar la calibración y la incertidumbre del modelo en cada ítem, en lugar de obtener solo una etiqueta dura.
- Prototipado de sistemas de decisión de bajo coste: con 852 millones de parámetros y pesos safetensors de 1,7 GB, es viable desplegarlo en entornos con recursos limitados para experimentar con la lógica de decisión antes de escalar a modelos mayores.
- Extracción de características para downstream: al estar etiquetado como feature-extraction, puede emplearse para generar representaciones de estados y preguntas que alimenten clasificadores o rankers posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (852 millones de parámetros), en fp16 serían aproximadamente 1,7 GB de pesos, y en cuantizaciones de 8 bits o 4 bits bajaría a rangos de 0,9 GB y 0,5 GB respectivamente; estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? Por tamaño, sí es plausible en GPUs de consumo con suficiente VRAM, pero el autor no publica requisitos ni pruebas.
- Opciones de despliegue: la model card no especifica backend. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face; la librería declarada es transformers. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-leader-ultra-v2 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (0 descargas) |
| vllm-sr/d3-lite (modelo base) | no disponible | no disponible | no disponible | Hugging Face |
| vllm-sr/d3-ultra (profesor) | no disponible | no disponible | no disponible | Hugging Face |
| joamCriff123/zils-lite-l1117a (punto de partida) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento, contexto ni licencia de los modelos comparables en la información proporcionada, por lo que la comparación se limita a la relación de linaje (base, profesor y punto de partida del pool).

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse con ítems generados por un LLM, puede heredar los sesgos de ese generador y del profesor vllm-sr/d3-ultra.
- Riesgo de alucinación: no evaluado; el modelo está especializado en decisiones sobre opciones declaradas, por lo que su comportamiento fuera de ese formato es incierto.
- Limitaciones de contexto e idioma: no se informan ni la longitud de contexto ni los idiomas soportados, lo que impide garantizar su uso en producci��n multilingüe o con entradas largas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la model card remite a LICENSE y NOTICE, que no se han podido verificar en la información disponible; conviene revisarlos antes de un despliegue comercial.
- Falta de validación externa: cero descargas y cero likes, sin benchmarks publicados ni evaluación independiente; el modelo debe considerarse experimental.
- Dependencia del chasis: el readout, la torre de visión y los ficheros de contrato se heredan del modelo base, de modo que cualquier limitación del chasis afecta al modelo.
- Formato de datos restringido: el entrenamiento se limita a ítems de decisión en el formato del validador (estado más pregunta más opciones), lo que reduce su aplicabilidad fuera de ese esquema.

## Enlaces

- Hugging Face: https://huggingface.co/malkolm777/zils-lite-leader-ultra-v2
- Modelo base: https://huggingface.co/vllm-sr/d3-lite
- Profesor de destilación: https://huggingface.co/vllm-sr/d3-ultra
- Punto de partida del pool: https://huggingface.co/joamCriff123/zils-lite-l1117a
- Familia Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
