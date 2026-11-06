# bestdev57/zils-lite-body-3

## Resumen

zils-lite-body-3 es un ajuste fino (fine-tune) del modelo base vllm-sr/d3-lite, un transformer de aproximadamente 853 millones de parámetros (0,85B) publicado por el usuario bestdev57 en Hugging Face. El modelo se presenta como un "body" de un sistema mayor denominado Zils, y su propósito declarado es la toma de decisiones (tag `decision`) sobre tareas de examen construidas a partir de conjuntos de datos públicos: inferencia de lenguaje natural (NLI), similitud semántica, question answering, detección de intenciones, clasificación de tópico, análisis de sentimiento y aritmética, entre otras.

El entrenamiento se realizó mediante LoRA fusionado en precisión bf16, partiendo de la media uniforme ("soup") de los cuerpos lite existentes del proyecto. Además de los datos de examen, se incluyeron fixtures calculados de tool-calling y conteo, formas verbales de UniMorph, detección de sarcasmo en titulares, el corpus Stanford Politeness, eventos de resultado del mundo real y probabilidades de un profesor denominado Zils Relay, junto con regularización por auto-destilación. La torre de visión del modelo base se mantiene sin cambios.

Es relevante ahora porque ejemplifica una tendencia creciente: modelos pequeños (sub-1B) especializados mediante ajuste fino y destilación para tareas de decisión y clasificación dentro de arquitecturas multi-agente o de enrutamiento. Sin embargo, el modelo no tiene descargas ni likes, no publica benchmarks y su model card es extremadamente escueta, por lo que su evaluación práctica requiere pruebas propias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de vllm-sr/d3-lite; detalles no disponibles) |
| Parámetros totales | 852.985.920 (≈0,85B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16 según la model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de vllm-sr/d3-lite y conserva su arquitectura transformer, incluyendo una torre de visión que, según la model card, permanece inalterada. El ajuste se realizó con LoRA y posteriormente se fusionó en los pesos en bf16, partiendo de la media uniforme de los "soup bodies" lite del proyecto Zils. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni la configuración de hiperparámetros.

Los datos de entrenamiento declarados combinan tareas de examen derivadas de splits públicos (NLI, similitud, QA, intenciones, tópico, sentimiento, aritmética), fixtures calculados de tool-calling y conteo, formas verbales de UniMorph, sarcasmo en titulares, Stanford Politeness, eventos de resultado reales y probabilidades del profesor Zils Relay, con regularización por auto-destilación. No se menciona RLHF ni DPO. La innovación técnica destacable es el uso combinado de destilación desde un profesor y auto-destilación para preservar el comportamiento del modelo base mientras se especializa en decisiones.

## Capacidades

- Generación de texto y razonamiento sobre tareas de decisión estructuradas.
- Clasificación y respuesta en NLI, similitud semántica, question answering, detección de intenciones, tópico y sentimiento.
- Aritmética básica y tareas de conteo.
- Tool calling y function calling en formato de fixtures calculados (según los datos de entrenamiento declarados).
- Detección de sarcasmo en titulares y evaluación de cortesía (Stanford Politeness).
- Procesamiento de formas verbales morfológicas (UniMorph).
- Capacidades de visión heredadas del modelo base (torre sin cambios), aunque no se detallan.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Enrutamiento de decisiones en pipelines multi-agente: el modelo puede clasificar la intención de una consulta y decidir qué herramienta o sub-agente invocar, gracias a su entrenamiento en intenciones y tool-calling.
- Moderación y análisis de sentimiento en titulares y textos cortos: adecuado por su ajuste específico en sarcasmo y sentimiento, con bajo coste de inferencia al ser un modelo sub-1B.
- Extracción de relaciones y similitud semántica en motores de búsqueda internos: puede puntuar pares de frases para deduplicación o ranking, apoyándose en los datos de NLI y similitud del entrenamiento.
- Asistencia en atención al cliente para clasificación de tickets: etiquetado de tópico e intención antes de escalar a un modelo mayor, reduciendo costes en producción.
- Verificación de cortesía y tono en comunicaciones corporativas: uso de Stanford Politeness para auditar respuestas automáticas antes de su envío.
- Normalización morfológica en pipelines de NLP para castellano u otras lenguas: las formas verbales de UniMorph permiten lematización y generación de variantes.
- Evaluación automática de exámenes o cuestionarios: el modelo fue entrenado explícitamente con tareas de examen, por lo que puede usarse como corrector o generador de ítems.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y KV cache (estimación típica de 2-3 GB en total).
- En cuantización de 8 bits: alrededor de 0,9-1,2 GB; en 4 bits: alrededor de 0,5-0,8 GB (estimaciones, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente; en entornos de servidor, A100 o H100 no son necesarias pero funcionan.
- Cabe en GPU consumer sin problemas, e incluso en CPU con llama.cpp u Ollama si se generan pesos GGUF (no publicados).
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers, siempre que se conviertan los pesos safetensors a los formatos correspondientes.
- Latencia y throughput: no disponibles; por el tamaño, se espera un throughput alto en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-body-3 | 0,85B | no disponible | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen2.5-0.5B | 0,49B | 32K | Apache-2.0 | Hugging Face, ampliamente usado |
| SmolLM2-1.7B | 1,7B | 8K | Apache-2.0 | Hugging Face, ampliamente usado |
| TinyLlama-1.1B | 1,1B | 2K | Apache-2.0 | Hugging Face, ampliamente usado |

No hay datos de rendimiento comparativo disponibles para zils-lite-body-3, por lo que la comparación se limita a parámetros, contexto y licencia. Los modelos alternativos citados cuentan con benchmarks públicos y comunidades activas, mientras que zils-lite-body-3 carece de ambos.

## Limitaciones y advertencias

- Sin benchmarks publicados ni descargas: no hay evidencia externa de su calidad; requiere evaluación propia antes de usarlo en producción.
- Model card extremadamente escueta: no se documentan contexto, idiomas, datos exactos ni hiperparámetros.
- Riesgo de alucinación inherente a modelos pequeños y a la destilación desde un profesor no verificado públicamente.
- Posibles sesgos heredados de los datasets de entrenamiento (Stanford Politeness, UniMorph, splits públicos de NLI y QA) y del profesor Zils Relay.
- Licencia Apache-2.0 para el modelo, pero los datos upstream conservan sus propias licencias; es responsabilidad del usuario verificar su compatibilidad con uso comercial.
- Capacidades de visión heredadas pero no documentadas ni verificadas.
- Idiomas soportados no declarados; no asumir multilingüismo.
- Proyecto con nula tracción (0 descargas, 0 likes) y fecha de creación futura en los metadatos, lo que sugiere un repositorio de prueba o experimental.

## Enlaces

- Hugging Face: https://huggingface.co/bestdev57/zils-lite-body-3
- Modelo base: https://huggingface.co/vllm-sr/d3-lite (referenciado en los metadatos)
