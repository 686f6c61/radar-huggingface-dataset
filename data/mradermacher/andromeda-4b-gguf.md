# mradermacher/andromeda-4b-GGUF

## Resumen

Andromeda-4b es un modelo de lenguaje de 4.021.784.576 parámetros (aproximadamente 4.000 millones) derivado del modelo base `fiel1986/andromeda-4b`, del que no se dispone de model card pública detallada en la información consultada. La versión aquí descrita es una cuantización estática en formato GGUF publicada por mradermacher, un perfil conocido en Hugging Face por generar versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo se etiqueta como resultado de un proceso de fusión de modelos (mergekit), lo que sugiere que su origen es una combinación de pesos de otros modelos en lugar de un entrenamiento desde cero.

El modelo está orientado a conversación (tag `conversational`) y declara únicamente el idioma inglés. Su relevancia actual es limitada: se trata de una cuantización de un modelo de fusión de autoría independiente, sin benchmarks publicados, sin licencia declarada en la ficha de Hugging Face y sin tracción comunitaria (0 descargas y 0 likes en el momento de la consulta). Resulta útil principalmente para desarrolladores que quieran experimentar con un modelo de 4B en hardware de consumo mediante GGUF, pero no debe considerarse una opción validada para producción sin una evaluación propia.

La ficha se centra en la versión GGUF publicada por mradermacher, que incluye doce cuantizaciones estáticas desde Q2_K hasta f16, con tamaños que van de 1,8 GB a 8,1 GB. No se ha publicado información sobre la longitud de contexto, la composición del dataset de entrenamiento ni los detalles de la fusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de `fiel1986/andromeda-4b`; detalles no disponibles) |
| Parametros totales | 4.021.784.576 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `fiel1986/andromeda-4b`. Las etiquetas de la ficha indican `mergekit` y `merge`, lo que apunta a que el modelo se ha generado mediante una fusión de pesos (model merging) de otros modelos, una técnica que combina los parámetros de dos o más modelos entrenados por separado sin un entrenamiento adicional significativo. No se especifica la técnica de fusión concreta (SLERP, TIES, DARE, passthrough, etc.), ni los modelos de origen utilizados en la mezcla.

Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de ajuste fino supervisado, RLHF o DPO. La model card de la cuantización se limita a indicar que se trata de cuantizaciones estáticas del modelo base y no menciona innovaciones técnicas adicionales como decodificación especulativa, atención lineal o arquitecturas híbridas. Cualquier afirmación sobre el entrenamiento más allá de lo indicado sería especulativa.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational`, por lo que su uso previsto es el diálogo multi-turno.
- Capacidades de razonamiento, código y matemáticas: no disponibles; no se han publicado evaluaciones que las confirmen.
- Soporte de tool calling / function calling: no disponible; no se documenta en la información consultada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`; no se declara soporte de otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Experimentación local con modelos de 4B: gracias a las cuantizaciones Q4_K_M (2,6 GB) y Q5_K_M (3,0 GB), el modelo puede ejecutarse en GPUs de consumo con 6-8 GB de VRAM, lo que lo hace adecuado para pruebas de concepto y prototipado rápido en estaciones de trabajo locales.
- Chat conversacional de propósito general en inglés: el tag `conversational` y su tamaño contenido permiten desplegarlo como asistente de texto básico en aplicaciones donde el coste por inferencia sea crítico.
- Evaluación comparativa de fusiones de modelos: al ser un modelo derivado de mergekit, puede utilizarse en estudios internos que comparen el comportamiento de distintos merges de 4B frente a modelos entrenados desde cero.
- Despliegue en entornos con recursos limitados: la cuantización Q2_K (1,8 GB) permite ejecutar el modelo en CPUs modestas o en GPUs integradas mediante llama.cpp, útil para demos offline.
- Generación de texto en pipelines de procesamiento por lotes: con Q8_0 (4,4 GB) o f16 (8,1 GB) se puede integrar en flujos de generación de contenido donde la latencia no sea el factor limitante.
- Base para ajuste fino ligero (LoRA/QLoRA): el modelo base en safetensors puede servir como punto de partida para adaptaciones de dominio en inglés, aunque la ausencia de licencia clara debe resolverse antes de un uso comercial.
- Investigación sobre cuantización: el conjunto de doce cuantizaciones permite estudiar la degradación de calidad entre Q2_K y f16 en un modelo de 4B, útil para calibrar políticas de cuantización en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ≈ 1,8 GB; Q3_K_M ≈ 2,2 GB; IQ4_XS ≈ 2,4 GB; Q4_K_M ≈ 2,6 GB; Q5_K_M ≈ 3,0 GB; Q6_K ≈ 3,4 GB; Q8_0 ≈ 4,4 GB; f16 ≈ 8,1 GB.
- GPU recomendadas: para Q4_K_M y Q5_K_M basta una GPU de consumo con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070). Para Q8_0 se recomienda 8-10 GB (RTX 3080, RTX 4070). Para f16 se recomienda 12 GB o más (RTX 4070 Ti, RTX 4080, A100). En entornos de servidor, A100 o H100 permiten ejecutar f16 con margen amplio para contexto largo.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones hasta Q8_0 con GPUs de 8 GB o más; f16 requiere 12 GB o más.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), LM Studio, y servidores compatibles con GGUF como llama-cpp-python o text-generation-webui. Para el modelo base en safetensors, transformers con vLLM o TGI, aunque la ficha no confirma compatibilidad explícita con estos servidores.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Andromeda-4b (GGUF, mradermacher) | 4,02 B | no disponible | no disponible | GGUF | Hugging Face |
| Qwen2.5-3B | 3,09 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face, Ollama |
| Llama-3.2-3B | 3,21 B | 131.072 tokens | Llama 3.2 Community License | safetensors, GGUF | Hugging Face, Ollama |
| Phi-3.5-mini | 3,82 B | 131.072 tokens | MIT | safetensors, GGUF | Hugging Face, Ollama |

La comparativa se ofrece como referencia de categoría (modelos de 3-4B para uso local). Andromeda-4b no declara contexto, licencia ni benchmarks, por lo que frente a alternativas como Qwen2.5-3B o Llama-3.2-3B carece de las garantías documentales que suelen exigirse en producción. Los datos de los modelos comparados provienen de sus fichas públicas y no de una evaluación directa contra Andromeda-4b.

## Limitaciones y advertencias

- Licencia no declarada: la ficha de Hugging Face no especifica licencia, lo que impide determinar si el uso comercial está permitido. Es un bloqueo crítico para cualquier despliegue en producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.
- Origen por fusión (mergekit): los modelos fusionados pueden heredar sesgos y comportamientos inconsistentes de los modelos de origen, y su calidad suele ser irregular sin una evaluación específica.
- Solo inglés: no se declara soporte de castellano ni de otros idiomas, por lo que su uso en aplicaciones en español no está respaldado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas (documentos extensos, conversaciones prolongadas) sin verificación empírica.
- Riesgo de alucinación: sin datos de entrenamiento ni evaluaciones de fidelidad, el riesgo de alucinación es indeterminado y debe asumirse alto en tareas factuales.
- Tracción comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin discusiones ni issues que permitan anticipar problemas conocidos.
- Cuantizaciones de baja precisión: Q2_K y Q3_K_S pueden degradar notablemente la coherencia; para uso real se recomienda Q4_K_M o superior.
- Sin garantías de mantenimiento: el modelo base y la cuantización son publicaciones de autores independientes, sin hoja de ruta ni soporte documentado.

## Enlaces

- Cuantización GGUF en Hugging Face: https://huggingface.co/mradermacher/andromeda-4b-GGUF
- Modelo base: https://huggingface.co/fiel1986/andromeda-4b
- Página de descargas del cuantizador: https://hf.tst.eu/model#andromeda-4b-GGUF
- Repositorio de peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
