# anonymous-kgqa/kora-stopping-estimator

## Resumen

Kora stopping estimator es un modelo de clasificación de texto en inglés desarrollado por el usuario anónimo `anonymous-kgqa`, afinado a partir del encoder `jhu-clsp/ettin-encoder-400m`. Su propósito declarado, a partir de los tags del repositorio, es estimar cuándo un agente que opera sobre grafos de conocimiento (knowledge graph question answering, KGQA) debe detener su proceso de razonamiento o búsqueda iterativa. Se trata, por tanto, de un componente auxiliar dentro de pipelines de agentes más que de un modelo generativo de propósito general.

El modelo se distribuye en formato safetensors bajo la librería transformers y con licencia MIT, lo que facilita su integración en sistemas propietarios. El repositorio tiene un tamaño de 1,6 GB, coherente con un encoder de aproximadamente 400 millones de parámetros en precisión completa. La información pública disponible es muy limitada: no se han publicado detalles sobre el dataset de entrenamiento, los benchmarks ni las condiciones de uso más allá de la licencia.

Es relevante en el contexto actual de agentes basados en LLM que consultan grafos de conocimiento, donde decidir cuándo dejar de iterar es un problema costoso en latencia y tokens. Un clasificador dedicado y ligero puede sustituir a heurísticas frágiles o a llamadas adicionales a un LLM. No obstante, el acceso al repositorio está restringido y requiere aceptar condiciones en HuggingFace, y el modelo no cuenta todavía con descargas ni validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (fine-tune de jhu-clsp/ettin-encoder-400m) |
| Parametros totales | aproximadamente 400 M (heredados del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/ONNX no publicadas) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del encoder `jhu-clsp/ettin-encoder-400m`, un transformer encoder de la familia Ettin desarrollada por JHU CLSP. La tarea de cabecera es clasificación de texto (`text-classification`), orientada a producir una señal de parada ("stopping") para agentes que navegan un grafo de conocimiento. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas del fine-tune.

Los tags indican compatibilidad con endpoints de inferencia (`endpoints_compatible`) y el uso previsto como componente de agente (`agent`, `kgqa`, `stopping`, `knowledge-graph`). Al tratarse de un encoder, no genera texto libre: emite una clasificación, presumiblemente binaria o con umbrales, sobre si el agente debe continuar o detenerse. No hay información sobre la estrategia de congelación de capas, la función de pérdida ni el balance de clases del dataset de ajuste.

## Capacidades

- Clasificación de texto orientada a decidir la parada de un agente en tareas de KGQA.
- Señal auxiliar para control de iteraciones en bucles de razonamiento multi-paso.
- Integración con pipelines de agentes que consultan grafos de conocimiento.
- Inferencia en inglés exclusivamente.
- Compatible con la librería transformers y con endpoints de HuggingFace.
- No soporta generación de texto, tool calling, visión, audio ni modo thinking.
- No se ha documentado soporte multilingüe ni capacidades de razonamiento general.

## Casos de uso

- Control de bucles en agentes KGQA: el clasificador evalúa el estado actual de la consulta y decide si el agente debe detener la exploración del grafo, reduciendo llamadas redundantes a la base de conocimiento y a un LLM orquestador.
- Optimización de coste en pipelines RAG sobre grafos: al sustituir heurísticas basadas en número máximo de saltos o en confianza del LLM, se recorta el consumo de tokens y la latencia por consulta.
- Enrutado en sistemas multi-agente: un agente planificador puede consultar al estimador antes de delegar una nueva subtarea de recuperación, evitando expansiones innecesarias del grafo.
- Filtrado previo en pipelines de extracción de hechos: descartar trayectorias de búsqueda que ya han alcanzado suficiente evidencia antes de ejecutar pasos costosos de verificación.
- Evaluación offline de agentes: usar el estimador como juez auxiliar para medir si las trayectorias generadas por un agente terminan en el momento adecuado.
- Prototipado académico de sistemas KGQA: al ser un encoder de 400 M con licencia MIT, permite experimentar con señales de parada en entornos con recursos limitados, siempre que se acepte el acceso restringido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1,6 GB para los pesos, más overhead de activaciones y tokenizador.
- VRAM estimada en fp16/bf16: aproximadamente 0,8 GB de pesos, apta para GPUs consumer modestas.
- GPUs recomendadas: cualquier GPU consumer reciente (RTX 3060, RTX 4060, RTX 4090) es suficiente; también puede ejecutarse en CPU para cargas de baja concurrencia.
- Cabe en GPU consumer: sí, con amplio margen.
- Opciones de despliegue: transformers con `AutoModelForSequenceClassification`, HuggingFace Inference Endpoints (tag `endpoints_compatible`) y servidores compatibles con la API de transformers. No se han publicado artefactos para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kora-stopping-estimator | ~400 M | no disponible | Clasificación de parada en KGQA | MIT | Acceso restringido (gated) |
| jhu-clsp/ettin-encoder-400m | ~400 M | no disponible | Encoder general (modelo base) | no disponible en la informacion | Público |
| Clasificadores de parada ad hoc basados en LLM | variable | variable | Decisión de parada en agentes | según modelo | Público |

No se dispone de información sobre benchmarks que permita comparar el rendimiento del modelo con alternativas de la misma categoría.

## Limitaciones y advertencias

- Acceso restringido: el repositorio requiere aceptar condiciones en HuggingFace antes de descargar los pesos.
- Sin validación comunitaria: cero descargas y cero likes en el momento de la consulta, lo que impide contrastar su calidad.
- Información de entrenamiento no documentada: se desconoce el dataset, el balance de clases y el riesgo de sesgo específico.
- Solo inglés: no apto para consultas en castellano u otros idiomas sin un ajuste adicional.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos/negativos en la señal de parada, que pueden truncar prematuramente una búsqueda o alargarla en exceso.
- Longitud de contexto no documentada: conviene verificar experimentalmente el límite efectivo del encoder base antes de usarlo con trayectorias largas.
- Licencia MIT permite uso comercial, pero el acceso gated puede imponer condiciones adicionales que deben revisarse.
- No hay artefactos cuantizados ni soporte documentado para motores de inferencia de alto rendimiento; el despliegue en producción requeriría trabajo de integración propio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anonymous-kgqa/kora-stopping-estimator
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-400m
