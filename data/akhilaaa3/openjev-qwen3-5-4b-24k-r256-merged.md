# akhilaaa3/openjev-qwen3.5-4b-24k-r256-merged

## Resumen

OpenJev Qwen3.5-4B · 24k internal es un checkpoint fusionado (merged) construido a partir del modelo base Qwen/Qwen3.5-4B, publicado por el usuario akhilaaa3. No es un modelo generativo de respuestas: se trata de un clasificador de decisión con una cabeza de 256 salidas que, dados un escenario, una pregunta y una lista ordenada de descripciones de opciones, devuelve probabilidades sobre las opciones válidas. La model card es explícita al respecto y remite a `load_model.py` como vía de uso correcta.

El entrenamiento se realizó sobre 23.995 preguntas internas con etiquetas duras (hard labels), de las cuales cinco de las 24.000 seleccionadas superaban los 4.096 tokens de Qwen. Se aplicó un LoRA de rango 256 y alpha 256 sobre el modelo base en BF16, con learning rate de 1e-5 para adaptador y cabeza, batch de 32, una única época y un 10 % de warmup. Los pesos exportados están en FP32 y la inferencia documentada usa autocast BF16 con la cabeza en FP32.

Su relevancia es acotada y muy específica: es un artefacto de investigación de un autor individual, con cero descargas y cero likes en el momento de la consulta, y con resultados de benchmark medidos sobre el checkpoint de adaptador sin fusionar, no sobre este artefacto merged. Resulta interesante como ejemplo de reutilización de un modelo multimodal (el pipeline declarado es image-text-to-text) reconvertido en clasificador de decisión, pero no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder derivado de Qwen/Qwen3.5-4B con cabeza de clasificación de decisión de 256 salidas (adaptador LoRA fusionado) |
| Parametros totales | 4.539.265.536 (≈4,54 mil millones) |
| Parametros activos | No aplica: no es un modelo MoE según la información disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32; la inferencia documentada usa BF16 con cabeza en FP32) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 18,2 GB, pesos exportados en FP32) |
| Modelo base | Qwen/Qwen3.5-4B |
| Tipo de modelo | Clasificador de decisión (no generativo), con componentes de visión heredados |
| Pipeline declarado | image-text-to-text |
| Libreria | transformers |
| Tamano del repositorio | 18,2 GB |
| Fecha de publicacion | 2026-09-21 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer con componentes multimodales (pipeline image-text-to-text), y le añade una cabeza de clasificación de 256 salidas que sustituye funcionalmente a la generación de texto. La adaptación se hizo mediante LoRA de rango 256 y alpha 256, entrenado sobre el modelo base en BF16 con learning rate de 1e-5 tanto para el adaptador como para la cabeza, batch de 32, una sola época y 10 % de warmup. Los pesos resultantes se fusionaron y se exportaron en FP32.

Los datos de entrenamiento son 23.995 preguntas internas con etiquetas duras (hard labels) y estructura de escenario, pregunta y opciones ordenadas. El autor indica explícitamente que se descartaron cinco de las 24.000 preguntas seleccionadas porque excedían los 4.096 tokens de Qwen, lo que da una cota inferior del contexto realmente utilizado durante el entrenamiento, aunque no confirma la longitud de contexto soportada por el artefacto final. No se menciona uso de RLHF, DPO ni ninguna otra fase de alineación posterior.

Como innovación destacable, el autor conserva los componentes de visión del modelo original, pero aclara que no fueron entrenados ni evaluados en esta ejecución y que el helper proporcionado solo admite decisiones de texto. También se menciona que el modelo no emplea Nimble ni NanoJev. El proceso de verificación de la fusión (comparación de pesos y diferencias de probabilidad) se recoge en un fichero `verification.json`, con la advertencia de que una comprobación de ocho ejemplos no establece equivalencia con el benchmark completo.

## Capacidades

- Clasificación de decisión sobre opciones: recibe un escenario, una pregunta y descripciones de opciones ordenadas, y devuelve una distribución de probabilidad sobre las opciones válidas mediante una cabeza de 256 salidas.
- Puntuación calibrada: el autor reporta valores de ECE (Expected Calibration Error) de 0,0448 y 0,0756 en dos conjuntos de evaluación, lo que permite usar las probabilidades como señal de confianza relativa.
- Decisiones de texto mediante el helper: `load_model.py` cubre el caso de uso textual documentado.
- Componentes de visión heredados: presentes en los pesos por proceder de un modelo image-text-to-text, pero no entrenados ni evaluados en esta ejecución.
- Capacidad generativa: no disponible. La model card indica explícitamente que no es un checkpoint de respuesta generativa.
- Tool calling / function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingües: no disponible, no se declara ningún idioma.
- Modo thinking: no disponible.
- Audio: no disponible.

## Casos de uso

- Enrutamiento de decisiones en pipelines internos: dado un escenario descrito en texto y un conjunto cerrado de acciones posibles, el modelo devuelve la probabilidad de cada opción; es adecuado porque su salida es directamente una distribución sobre opciones ordenadas, sin necesidad de parsear texto generado.
- Triaje con umbral de confianza: gracias a los valores de ECE reportados (0,0448 en DecisionBench Medium), las probabilidades se pueden usar para derivar automáticamente los casos a revisión humana cuando la confianza cae por debajo de un umbral.
- Pre-anotación de datos con etiquetas duras: el modelo se entrenó con hard labels sobre 23.995 preguntas, por lo que puede emplearse para pre-etiquetar nuevos ítems de estructura similar y reducir el coste de anotación manual, dejando la validación final a un revisor.
- Investigación sobre calibración de clasificadores: los datos de macro/micro accuracy y ECE permiten usarlo como punto de comparación frente a otros clasificadores o métodos de calibración posteriores (temperature scaling, isotonic regression).
- Evaluación comparativa interna tipo JevBench: el subconjunto público emparejado de JevBench (231 decisiones, 195 grupos) sirve como referencia reproducible para medir variantes del propio modelo o adaptadores alternativos.
- Selección entre variantes en un sistema de recomendación: cuando las alternativas son finitas y describibles en texto, la cabeza de 256 salidas puede puntuar cada opción y ordenar por probabilidad.
- Componente de decisión dentro de un agente: el modelo puede actuar como módulo que elige entre un conjunto acotado de acciones predefinidas, siempre que la selección de la acción no requiera generar texto libre y que la integración se haga con el helper proporcionado.

## Benchmarks y rendimiento

Los únicos datos disponibles son los del checkpoint de adaptador sin fusionar, publicados por el autor. No son evaluaciones del artefacto merged que se distribuye en este repositorio.

| Benchmark | Macro accuracy | Micro accuracy | ECE (10 bins de igual anchura) |
|---|---:|---:|---:|
| DecisionBench Medium (293 preguntas, 80 escenarios) | 86,00 % | 84,64 % | 0,0448 |
| JevBench, subconjunto público emparejado (231 decisiones, 195 grupos) | 78,72 % | 80,09 % | 0,0756 |

Advertencias del propio autor que deben tenerse en cuenta al leer la tabla: las puntuaciones corresponden al checkpoint sin fusionar; la macro accuracy pondera por igual cada escenario o grupo; el subconjunto de JevBench empleado no es la puntuación compuesta oficial de Intelligence; y la verificación de la fusión se limita a ocho ejemplos, lo que no demuestra equivalencia con el benchmark completo. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en FP32 (formato publicado): aproximadamente 18,2 GB solo de pesos, más activaciones y la cabeza; en la práctica se necesitan del orden de 20 GB o más.
- VRAM para inferencia en BF16 (formato documentado de ejecución): aproximadamente 9,1 GB de pesos más activaciones; con 12-16 GB de VRAM debería ser suficiente en la mayoría de configuraciones, aunque no hay cifras oficiales.
- GPU profesionales: A100 (40 GB o 80 GB), H100 y similares funcionan sin problema tanto en FP32 como en BF16.
- GPU de consumo: cabe en BF16 en tarjetas de 24 GB como la RTX 4090 o la RTX 3090, y previsiblemente en modelos de 16 GB con margen ajustado. En FP32 no cabe en ninguna GPU de consumo habitual de 24 GB.
- Opciones de despliegue: la librería declarada es transformers, con soporte de endpoints_compatible. No hay evidencia de soporte para vLLM, llama.cpp, Ollama o TGI, y al tratarse de un clasificador con cabeza propia es probable que las pilas de servicio generativas estándar no funcionen directamente; debe usarse el helper `load_model.py` que indica el autor.
- Cuantizaciones GGUF, AWQ o GPTQ: no disponibles; el repositorio solo publica safetensors en FP32.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

| Modelo | Parametros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| akhilaaa3/openjev-qwen3.5-4b-24k-r256-merged | 4.539.265.536 | no disponible | apache-2.0 | Clasificador de decisión (no generativo) |
| Qwen/Qwen3.5-4B (modelo base declarado) | no disponible | no disponible | no disponible | Modelo multimodal image-text-to-text |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

La comparación con el modelo base es pertinente por herencia de pesos, pero no se dispone en la información facilitada de sus parámetros, contexto, licencia ni resultados que permitan contrastar rendimiento. Tampoco se identifican clasificadores de decisión comparables con la misma interfaz de 256 salidas.

## Limitaciones y advertencias

- No es un modelo generativo: no debe usarse para chat, respuesta a preguntas en texto libre ni generación de contenido, pese a que entre sus etiquetas aparezca "conversational".
- Los resultados de benchmark publicados corresponden al checkpoint de adaptador antes de la fusión, no al artefacto que se descarga. La verificación de la fusión se limita a ocho ejemplos según el propio autor.
- Los componentes de visión están presentes en los pesos pero no fueron entrenados ni evaluados; el helper solo admite decisiones de texto.
- Es un clasificador con umbral de confianza: una predicción con probabilidad alta no garantiza que sea correcta.
- La calibración no es perfecta: los valores de ECE reportados (0,0448 y 0,0756) implican desviaciones medibles entre probabilidad y frecuencia real de acierto.
- Los datos de entrenamiento son internos (23.995 preguntas con etiquetas duras), lo que impide reproducir el entrenamiento y evaluar sesgos de composición del dataset.
- No se declara ningún idioma soportado, por lo que el comportamiento multilingüe es desconocido y no debe asumirse.
- No se especifica la longitud de contexto real del artefacto; solo se sabe que cinco de las 24.000 preguntas de entrenamiento superaban los 4.096 tokens de Qwen y fueron descartadas.
- El repositorio tiene cero descargas y cero likes, sin validación independiente de la comunidad.
- Trazabilidad limitada: autor individual, sin paper asociado, sin documentación de despliegue más allá del helper y sin soporte confirmado en pilas de inferencia habituales.
- La licencia apache-2.0 permite uso comercial, pero la procedencia y los derechos sobre los datos de entrenamiento internos no se detallan, lo que introduce un riesgo jurídico no cuantificado para producción.
- El nombre del repositorio incluye "24k", que según la model card hace referencia a las 24.000 preguntas internas de entrenamiento; no debe interpretarse como una longitud de contexto confirmada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/akhilaaa3/openjev-qwen3.5-4b-24k-r256-merged
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper: no disponible
- Repositorio de código o demo: no disponible
- Otros enlaces: no se han encontrado enlaces relevantes en la búsqueda web; los resultados obtenidos no guardan relación con el modelo y corresponden a páginas de descarga de servicios VPN.
