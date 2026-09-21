# ItsnotAilabs/AWM-1.5B

## Resumen

AWM-1.5B es un modelo publicado en HuggingFace por el usuario ItsnotAilabs bajo el identificador `ItsnotAilabs/AWM-1.5B`. La información pública disponible es mínima: la model card se limita a un titular ("AWM Model"), una sección de "Empirical Metrics" que menciona que las métricas se han verificado mediante una "benchmark suite" y que la "planning horizon decay" se calcula de forma recursiva, y dos entradas de métricas sin ningún valor numérico asociado ("Planning Accuracy: Configured" y "Forecast Horizon Decay: Logged to output metrics"). No se publican cifras, metodología, dataset ni configuración de entrenamiento.

El tag declarado en el repositorio es `qwen2`, lo que sugiere que el modelo deriva de la familia Qwen2, y el sufijo del nombre apunta a un tamaño de aproximadamente 1.500 millones de parámetros. Ninguna de estas dos inferencias está confirmada por documentación del autor, por lo que deben tratarse como indicios y no como especificaciones verificadas. No hay pipeline declarado, ni licencia, ni idiomas soportados, y el repositorio registra cero descargas y cero "likes" en el momento de la consulta.

Por el momento, AWM-1.5B no puede evaluarse como una opción de producción: no hay pesos confirmados, ni resultados reproducibles, ni términos de licencia. Esta ficha se limita a documentar lo que el autor ha hecho público y a marcar explícitamente todo aquello que falta, que es la mayor parte de la información relevante para un desarrollador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag del repositorio indica `qwen2`, lo que sugiere una arquitectura transformer decoder-only derivada de Qwen2; no confirmado por el autor) |
| Parametros totales | no disponible (el nombre "1.5B" sugiere ~1.500 millones, sin confirmacion documental) |
| Parametros activos | no aplica segun la informacion disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se especifica safetensors, GGUF ni ningun otro) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo más allá del tag `qwen2` asociado al repositorio. Ese tag es habitual en modelos que reutilizan la configuración, el tokenizador o los pesos base de la familia Qwen2, pero el autor no documenta si AWM-1.5B es un fine-tuning, una destilación, un modelo entrenado desde cero sobre una implementación compatible o simplemente un repositorio etiquetado de forma aproximada. Tampoco se indica si se trata de un transformer denso convencional, de una variante MoE o de una arquitectura híbrida.

Respecto al entrenamiento, no hay ningún dato disponible: ni número de tokens, ni composición del dataset, ni si hubo una fase de ajuste por instrucciones, RLHF, DPO u otro método de alineamiento. La model card menciona conceptos propios de planificación y forecasting ("planning horizon decay computed recursively", "Forecast Horizon Decay"), lo que podría apuntar a un entrenamiento orientado a tareas de planificación multi-paso, pero no se aporta ni una descripción del objetivo de entrenamiento ni evidencia que respalde esa lectura. Las dos entradas de métricas ("Planning Accuracy: Configured" y "Forecast Horizon Decay: Logged to output metrics") no son resultados: describen configuración y registro, no valores medidos.

## Capacidades

- Generación de texto: no confirmada explícitamente, aunque es la capacidad esperable en un modelo de la familia Qwen2; no hay ejemplos ni demo publicados.
- Razonamiento y planificación: la model card menciona "planning accuracy" y "planning horizon decay" como métricas configuradas, sin definir la tarea ni publicar resultados. No puede afirmarse que el modelo tenga capacidades de planificación verificadas.
- Generación de código: no disponible.
- Matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible, más allá de la mención no cuantificada a "planning".
- Capacidades multilingües: no disponible (no se declara ningún idioma).
- Capacidades especiales (modo thinking, visión, audio, decodificación especulativa): no disponible.
- Contexto largo: no disponible (no se declara la ventana de contexto).

## Casos de uso

No es posible proponer casos de uso concretos y realistas con la información disponible, porque no se conocen ni las capacidades verificadas del modelo, ni su licencia, ni sus requisitos de ejecución. Cualquier escenario que se enunciara aquí sería especulativo y podría inducir a error a quien evalúe el modelo.

Como orientación general, un modelo de ~1.5B parámetros de la familia Qwen2, si sus pesos y licencia estuvieran disponibles y sus capacidades fueran las habituales en ese rango, encajaría en escenarios como: clasificación y extracción de información sobre texto en local; generación asistida en entornos con recursos limitados; preprocesado y resumen de documentos antes de pasarlos a un modelo mayor; prototipado rápido de asistentes conversacionales en una sola GPU de consumo; generación de código en herramientas de autocompletado con latencia baja; y tareas de planificación acotada si el autor llegara a demostrar las métricas que insinúa. Ninguno de estos casos está respaldado por documentación del repositorio y deben tratarse como hipótesis a validar, no como usos recomendados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una "benchmark suite" y el registro de "Planning Accuracy" y "Forecast Horizon Decay", pero no incluye ninguna cifra, ningún conjunto de evaluación identificado ni ninguna comparación con otros modelos. Los resultados de búsqueda web devueltos no contienen ningún material relacionado con este modelo.

| Benchmark | Resultado | Notas |
|---|---|---|
| Planning Accuracy | no disponible | La model card indica "Configured", sin valor |
| Forecast Horizon Decay | no disponible | La model card indica que se registra en las metricas de salida, sin valor |
| MMLU, HumanEval, GSM8K u otros | no disponible | No se mencionan |

## Requisitos de hardware

No hay requisitos publicados por el autor. Las siguientes estimaciones son cálculos genéricos para un modelo denso de ~1.500 millones de parámetros y deben considerarse orientativas, condicionadas a que el modelo resulte ser efectivamente de ese tamaño y a que sus pesos se publiquen en un formato estándar:

- VRAM estimada para inferencia: en FP16/BF16, en torno a 3-4 GB solo de pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits, alrededor de 2 GB; en 4 bits, en torno a 1-1.5 GB. Son estimaciones, no mediciones sobre este modelo.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM debería poder ejecutarlo en FP16; para servir varios usuarios concurrentes o contextos largos serían preferibles A100, H100, L40S o similares.
- GPU de consumo: con ese tamaño, encajaría previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, así como en equipos con memoria unificada (Apple Silicon). No hay confirmación de que existan pesos en formato ejecutable.
- Opciones de despliegue: no disponible. No se declara compatibilidad con vLLM, llama.cpp, Ollama, TGI, transformers ni ningún otro runtime. Si los pesos no están publicados o el repositorio solo contiene configuración, ninguna de estas opciones sería aplicable.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa porque se desconocen los parámetros confirmados, la longitud de contexto, la licencia y el rendimiento de AWM-1.5B. La tabla siguiente recoge la comparación con alternativas del rango ~1.5B frecuentemente usadas como referencia, marcando explícitamente los huecos de información.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ItsnotAilabs/AWM-1.5B | no disponible (~1.5B segun el nombre, sin confirmar) | no disponible | no disponible | Repositorio HuggingFace sin pesos ni documentacion confirmados |
| Qwen2.5-1.5B | 1.5B | No declarada en esta ficha | No disponible en esta ficha | No disponible en esta ficha |
| Llama 3.2 1B | 1B | No declarada en esta ficha | No disponible en esta ficha | No disponible en esta ficha |
| Gemma 2 2B | 2B | No declarada en esta ficha | No disponible en esta ficha | No disponible en esta ficha |

No se dispone de datos verificados de ninguno de los modelos de la columna comparativa dentro de la información proporcionada, por lo que la tabla se limita a señalar la clase de alternativas existentes en ese rango de tamaño.

## Limitaciones y advertencias

- Ausencia casi total de documentación: la model card no describe arquitectura, datos de entrenamiento, contexto, tokenizador ni formato de pesos. Es imposible reproducir, auditar o evaluar el modelo con la información publicada.
- Métricas no verificables: las entradas "Planning Accuracy: Configured" y "Forecast Horizon Decay: Logged to output metrics" no son resultados medidos. No hay valores, ni conjuntos de evaluación, ni metodología. No deben citarse como evidencia de rendimiento.
- Licencia no especificada: sin licencia declarada, no existe autorización clara para uso comercial ni para redistribución. En la práctica, esto impide su uso en producción.
- Sesgos: no disponible. No se ha publicado ninguna evaluación de sesgos, toxicidad o alineamiento.
- Riesgo de alucinación: no evaluado. Al no haber benchmarks ni pruebas de comportamiento, no puede estimarse la fiabilidad factual del modelo.
- Limitaciones de contexto e idioma: no disponible. Se desconoce la ventana de contexto y los idiomas de entrenamiento.
- Madurez del repositorio: cero descargas y cero "likes" en el momento de la consulta, con fechas de creación y actualización separadas por un segundo. Esto sugiere un repositorio recién creado o de carácter experimental, sin validación por parte de la comunidad.
- Trazabilidad: no se han encontrado papers, blogs, repositorios de código ni demos asociados al modelo. Los resultados de búsqueda web no contenían ninguna referencia relevante.
- Caveat para producción: en su estado actual, este modelo no debería considerarse para ningún despliegue. Antes de cualquier evaluación sería necesario confirmar que los pesos existen, en qué formato están, bajo qué licencia se distribuyen y qué se ha entrenado exactamente.

## Enlaces

- HuggingFace: https://huggingface.co/ItsnotAilabs/AWM-1.5B
- Paper: no disponible
- Blog o anuncio del autor: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
- Otros enlaces relevantes: no disponible (la búsqueda web no devolvió ningún resultado relacionado con el modelo)
