# c4tdr0ut/Revenant-70B

## Resumen

Revenant-70B es un modelo de lenguaje conversacional de 70.553.706.496 parámetros (aproximadamente 70,6 mil millones) publicado por el usuario c4tdr0ut en Hugging Face. El repositorio se distribuye en formato safetensors y también ofrece variantes GGUF, lo que indica que está pensado tanto para inferencia en GPU mediante frameworks habituales como para despliegue en CPU o GPU de gama consumer a través de llama.cpp y herramientas compatibles. La etiqueta "llama" sugiere que se apoya en la arquitectura transformer decoder-only de la familia Llama, aunque no se detalla si es un fine-tune, una fusión de modelos o un entrenamiento desde cero.

La relevancia del modelo radica en su tamaño: 70B es un rango que permite un equilibrio entre capacidad de razonamiento y coste de despliegue, y la disponibilidad de pesos GGUF facilita su evaluación local. Sin embargo, la información publicada es muy limitada: no se declaran licencia, idiomas soportados, pipeline ni datos de entrenamiento. El repositorio acumula 1131 descargas y 5 likes, con un tamaño de 307,3 GB, coherente con pesos en precisión alta (probablemente fp16/bf16) más las conversiones GGUF.

Al no existir documentación técnica asociada, esta ficha se limita a lo verificable en los metadatos del repositorio y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado. Cualquier evaluación de calidad, sesgos o rendimiento requeriría pruebas propias por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta "llama"; detalles no disponibles) |
| Parametros totales | 70.553.706.496 (~70,6B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible (niveles concretos no especificados); safetensors en precisión original no declarada |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna más allá de la etiqueta "llama" y del recuento de parámetros obtenido de los safetensors. Por el tamaño (70,6B) y la nomenclatura, es plausible que se trate de un transformer decoder-only con atención multi-cabeza estándar, pero no se confirma número de capas, dimensión oculta, número de cabezas, uso de GQA/MQA, tipo de normalización ni función de activación. Tampoco se indica si emplea atención lineal, decodificación especulativa u otras optimizaciones.

Respecto al entrenamiento, el repositorio no documenta el número de tokens, la composición del dataset, la procedencia de los datos, ni si hubo fases de ajuste supervisado, RLHF o DPO. La etiqueta "conversational" sugiere un ajuste orientado a diálogo, pero no hay evidencia publicada sobre el proceso. El tamaño del repositorio (307,3 GB) es consistente con pesos en 16 bits para 70,6B parámetros (~141 GB) más múltiples conversiones GGUF, aunque la cifra exacta de cada artefacto no se detalla.

## Capacidades

- Generación de texto conversacional: la etiqueta "conversational" y el pipeline declarado en los tags apuntan a un uso orientado a diálogo multi-turno, aunque no se especifican formatos de prompt ni plantillas de chat.
- Razonamiento y conocimiento general: esperable por el tamaño de 70B, pero sin benchmarks publicados que lo confirmen.
- Generación de código y matemáticas: no disponible; no hay documentación ni evaluaciones que lo respalden.
- Tool calling / function calling: no disponible; no se declara soporte.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se listan idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible; no se declaran.
- Compatibilidad con endpoints: el tag "endpoints_compatible" indica que puede desplegarse en infraestructuras compatibles con la API de endpoints, pero sin más detalle.

## Casos de uso

- Evaluación comparativa de modelos de 70B: el modelo puede emplearse como candidato adicional en pruebas internas de calidad conversacional frente a otros modelos del mismo rango, dado que ofrece pesos safetensors y GGUF listos para cargar en pipelines de evaluación.
- Despliegue local en estaciones de trabajo con GPU de gran memoria: con cuantizaciones GGUF de 4-8 bits, puede ejecutarse en configuraciones de 1-2 GPU de 48-80 GB o en CPU con suficiente RAM, lo que permite experimentar sin depender de servicios en la nube.
- Prototipado de asistentes conversacionales: la orientación conversacional del modelo permite construir demos de chat multi-turno, siempre que se valide previamente la plantilla de prompt y la calidad de las respuestas.
- Generación de texto en entornos de investigación: útil para estudiar comportamiento de modelos de gran tamaño en tareas de redacción, resumen o reescritura, con la cautela de que no hay benchmarks publicados.
- Fine-tuning posterior: al distribuirse en safetensors, puede servir como base para ajuste supervisado o LoRA en dominios específicos, aunque la licencia no declarada obliga a aclarar los términos de uso antes de cualquier explotación.
- Pruebas de infraestructura de inferencia: sirve para validar despliegues con vLLM, TGI o llama.cpp a escala 70B, midiendo throughput y latencia en hardware concreto antes de adoptar un modelo con documentación completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de ~70,6B parámetros, en fp16 se requieren del orden de 140 GB de VRAM; en cuantización de 8 bits, alrededor de 70-75 GB; en 4 bits, alrededor de 35-40 GB. Estas cifras son estimaciones por tamaño y no proceden de documentación del modelo.
- GPU recomendadas: para fp16, múltiples A100/H100 (2×80 GB o más); para cuantizaciones de 8 bits, una A100 80 GB o H100 80 GB; para 4 bits, una o dos GPU de 48 GB (A6000, L40S) según el contexto.
- ¿Cabe en GPU consumer? En cuantización de 4 bits podría intentarse en una RTX 4090 (24 GB) solo con contextos muy reducidos y offloading parcial a RAM; en la práctica, no es un modelo cómodo para una sola GPU consumer.
- Opciones de despliegue: llama.cpp/Ollama para GGUF, vLLM y TGI para safetensors, además de infraestructuras compatibles con endpoints según el tag del repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Documentación |
|---|---|---|---|---|---|
| Revenant-70B | ~70,6B | no disponible | no disponible | safetensors, GGUF | muy limitada |
| Llama 3.1 70B (Meta) | 70,6B | 128K tokens | Llama 3.1 Community License | safetensors, GGUF | extensa, con benchmarks |
| Qwen2.5 72B (Alibaba) | 72,7B | 128K tokens | Apache 2.0 (mayoría de variantes) | safetensors, GGUF | extensa, con benchmarks |
| Mistral Large / Mixtral 8x7B | variable | variable | licencias comerciales o Apache 2.0 | safetensors, GGUF | extensa |

La comparación se limita a parámetros y disponibilidad, ya que Revenant-70B no publica contexto, licencia ni resultados. Frente a Llama 3.1 70B o Qwen2.5 72B, la diferencia principal es la ausencia de documentación y de garantías de licencia, lo que complica su adopción en producción frente a alternativas con términos claros.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse uso comercial; es imprescindible contactar con el autor o consultar el repositorio antes de cualquier despliegue productivo.
- Idiomas no especificados: se desconoce la cobertura multilingüe y el rendimiento en castellano.
- Sin benchmarks ni documentación de entrenamiento: no hay evidencia publicada sobre calidad, sesgos o robustez.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño, agravado por la falta de evaluaciones que lo caractericen.
- Contexto desconocido: no se puede planificar el uso en conversaciones largas o documentos extensos sin conocer la ventana máxima.
- Procedencia y datos de entrenamiento no documentados: no se puede evaluar el cumplimiento de licencias de datos subyacentes ni riesgos de contaminación.
- Repositorio con pocas señales de mantenimiento: 5 likes y 1131 descargas, sin pipeline declarado ni model card detallada, lo que sugiere un proyecto personal más que un modelo respaldado por una organización.
- Posible confusión con la familia Llama: la etiqueta "llama" no implica que herede la licencia de Meta; los términos aplicables son los que declare el autor, que aquí no constan.

## Enlaces

- Hugging Face: https://huggingface.co/c4tdr0ut/Revenant-70B
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
