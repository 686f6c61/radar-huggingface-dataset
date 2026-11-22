# mradermacher/haru-coder-8b-coding-full-GGUF

## Resumen

haru-coder-8b-coding-full-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo Rowa68/haru-coder-8b-coding-full, publicada por el usuario mradermacher. No se trata de un modelo entrenado desde cero, sino de una conversión estática de los pesos originales a distintos niveles de precisión (desde Q2_K hasta f16), pensada para su uso con llama.cpp y con el ecosistema de inferencia local que consume este formato. El modelo base cuenta con 7.615.616.512 parámetros (aproximadamente 7,6 mil millones), lo que lo sitúa en la categoría de 8B.

La relevancia de esta publicación es práctica: facilita el despliegue del modelo original en hardware de consumo mediante ficheros de entre 3,1 GB y 15,3 GB, con opciones intermedias recomendadas por el autor como Q4_K_M (4,8 GB) y Q8_0 (8,2 GB). El repositorio incluye doce variantes de cuantización, con un tamaño total de 68,1 GB, y está etiquetado como compatible con endpoints y orientado a uso conversacional.

La información disponible sobre el modelo base es escasa: la model card del repositorio GGUF no documenta arquitectura, datos de entrenamiento, benchmarks ni licencia. Todos los datos técnicos que se detallan a continuación provienen del repositorio de cuantización y del recuento de parámetros de los safetensors originales; cualquier aspecto no cubierto se indica explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base no documenta la arquitectura en la información disponible) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Rowa68/haru-coder-8b-coding-full en la documentación proporcionada. El nombre y el tamaño (7,6 B de parámetros) sugieren un transformer decoder-only de la familia de los 8B, pero esto no está confirmado por ninguna fuente del repositorio. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

Lo único verificable es el proceso de cuantización: mradermacher ha generado cuantizaciones estáticas (no ponderadas ni con imatrix) mediante conversión desde el formato Hugging Face a GGUF. La model card indica explícitamente que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicación y que podrían no planificarse. El autor remite a la página de resumen del modelo para consultar la lista completa de descargas.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como "conversational", lo que indica que el modelo base está ajustado para diálogo multi-turno.
- Generación de código: el nombre del modelo ("coder") y la temática del modelo base apuntan a capacidades de programación, aunque no se detalla el rendimiento en lenguajes concretos.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere que puede servirse mediante infraestructura de inferencia compatible con la API de Hugging Face.
- Uso con llama.cpp: al estar en formato GGUF, es compatible con las herramientas del ecosistema llama.cpp (llama-cli, llama-server, Ollama, entre otras).
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Tool calling, agentes, visión, audio o modo thinking: no disponible (no se documentan en la información proporcionada).

## Casos de uso

- Asistencia de programación en local: el modelo puede desplegarse con llama.cpp en una estación de trabajo para autocompletar código y responder preguntas técnicas sin enviar datos a servicios externos, usando la cuantización Q4_K_M (4,8 GB) como equilibrio entre calidad y consumo de memoria.
- Prototipado de chatbots conversacionales: gracias a su etiqueta "conversational" y a la disponibilidad de cuantizaciones ligeras (Q2_K de 3,1 GB), permite montar un prototipo de asistente de texto en portátiles con GPU modesta o incluso en CPU.
- Evaluación de modelos en pipelines de CI: la variedad de cuantizaciones permite probar el mismo modelo a distintas precisiones y medir el impacto en la calidad de las respuestas antes de fijar una versión para producción.
- Servicio de inferencia autoalojado: con la cuantización Q8_0 (8,2 GB) o f16 (15,3 GB) puede servirse mediante llama-server en una GPU de 16-24 GB para aplicaciones internas que requieran baja latencia y control total de los datos.
- Generación de documentación técnica y comentarios de código: el modelo puede integrarse en scripts que procesen repositorios y generen explicaciones o docstrings, aprovechando su orientación a código y su capacidad conversacional.
- Experimentación académica con cuantización: investigadores que estudien la degradación de calidad por nivel de cuantización pueden usar este repositorio como banco de pruebas con doce variantes del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (incluye pesos; el overhead de contexto y KV cache es adicional y no está cuantificado en la información disponible):
  - Q2_K: 3,1 GB
  - Q3_K_S: 3,6 GB
  - Q3_K_M: 3,9 GB
  - Q3_K_L: 4,2 GB
  - IQ4_XS: 4,4 GB
  - Q4_K_S: 4,6 GB
  - Q4_K_M: 4,8 GB
  - Q5_K_S: 5,4 GB
  - Q5_K_M: 5,5 GB
  - Q6_K: 6,4 GB
  - Q8_0: 8,2 GB
  - f16: 15,3 GB
- GPU recomendadas: no disponible (el autor no publica recomendaciones de hardware). Por tamaño, las cuantizaciones Q4 y Q5 caben en GPUs de consumo con 8 GB de VRAM; Q8_0 requiere al menos 10-12 GB y f16 al menos 16 GB.
- Cabe en GPU de consumo: sí, al menos las cuantizaciones hasta Q6_K en tarjetas de 8 GB o más; Q8_0 y f16 requieren tarjetas de gama alta (por ejemplo, 16 GB o más).
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF (llama-cli, llama-server, Ollama); la etiqueta "endpoints_compatible" sugiere también despliegue mediante infraestructura de endpoints de Hugging Face.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría. La siguiente tabla recoge únicamente los datos verificables de esta publicación frente a lo que se conoce de la categoría; los campos sin datos se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|
| haru-coder-8b-coding-full (esta ficha) | 7,6 B | no disponible | no disponible | GGUF, safetensors | no disponible |
| Alternativas 8B de código open source | ~7-8 B | no disponible | no disponible | GGUF, safetensors | no disponible |

## Limitaciones y advertencias

- Licencia no especificada: al no documentarse la licencia ni en el repositorio GGUF ni en la información del modelo base, no puede confirmarse que el uso comercial esté permitido. Es imprescindible verificar la licencia del modelo original Rowa68/haru-coder-8b-coding-full antes de cualquier despliegue en producción.
- Idiomas: el repositorio declara únicamente inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Contexto desconocido: al no publicarse la longitud de contexto, no puede garantizarse el comportamiento en conversaciones o ficheros de código largos.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni de tasas de alucinación; como en cualquier modelo de 8B, debe validarse la salida en tareas críticas.
- Sesgos: no disponible (no se documentan análisis de sesgo).
- Cuantizaciones de baja precisión: el autor advierte que Q3_K_M es de "lower quality" y que f16 es "overkill"; las cuantizaciones Q2 y Q3 pueden degradar notablemente la calidad del código generado.
- Ausencia de cuantizaciones ponderadas o con imatrix: la model card indica que no estaban disponibles y que podrían no publicarse, lo que limita las opciones de calidad intermedia.
- Modelo derivado: esta publicación no es el modelo original; cualquier problema de calidad debe contrastarse con el modelo base antes de atribuirlo a la cuantización.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/haru-coder-8b-coding-full-GGUF
- Modelo base: https://huggingface.co/Rowa68/haru-coder-8b-coding-full
- Página de resumen de descargas del autor: https://hf.tst.eu/model#haru-coder-8b-coding-full-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
