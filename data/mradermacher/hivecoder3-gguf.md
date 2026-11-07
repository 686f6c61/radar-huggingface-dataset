# mradermacher/HiveCoder3-GGUF

## Resumen

HiveCoder3-GGUF es una conversión a formato GGUF del modelo HiveCoder3, publicada por el usuario mradermacher, conocido en Hugging Face por generar cuantizaciones estáticas de modelos open source para su uso con llama.cpp y herramientas compatibles. El modelo original lo desarrolla theailearner, y esta ficha describe únicamente la versión cuantizada, ya que el repositorio no incluye la model card completa del modelo base.

El modelo cuenta con 27.320.697.856 parámetros (aproximadamente 27,3 mil millones), lo que lo sitúa en la categoría de modelos de tamaño medio-grande, adecuados para despliegues en GPU de gama alta o servidores con múltiples aceleradores. El repositorio ocupa 28,2 GB e incluye un conjunto amplio de cuantizaciones estáticas (desde Q2_K hasta F16), lo que facilita elegir el equilibrio entre calidad y requisitos de memoria.

La relevancia de esta publicación radica en que permite ejecutar el modelo en entornos con recursos limitados mediante llama.cpp, Ollama o servidores compatibles con la API de endpoints de Hugging Face. No obstante, la información pública disponible sobre el modelo original (arquitectura, datos de entrenamiento, benchmarks, licencia) es muy escasa en el repositorio, por lo que muchos campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.320.697.856 (aproximadamente 27,3 B) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas generadas con llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información pública en el repositorio sobre la arquitectura del modelo base HiveCoder3 (si es un transformer denso, un modelo de mezcla de expertos, híbrido o de otro tipo), ni sobre el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de alineación como RLHF o DPO.

Lo único verificable es que se trata de una conversión a GGUF realizada por mradermacher a partir de los pesos originales en formato Hugging Face (el campo `convert_type` de los metadatos indica `hf`), con cuantización estática de los tensores de salida (`output_tensor_quantised: 1`). El nombre del modelo sugiere una especialización en generación de código, pero no hay documentación que lo confirme en la información disponible.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo está pensado para diálogo multi-turno.
- Generación de código: el nombre "HiveCoder" sugiere capacidades de programación, aunque no se documenta el alcance ni los lenguajes soportados.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede desplegarse en la infraestructura de inferencia de Hugging Face.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Asistente de código en local: al estar disponible en GGUF, puede ejecutarse con llama.cpp u Ollama en una estación de trabajo con GPU de gama alta, ofreciendo autocompletado y explicación de código sin enviar datos a servicios externos.
- Despliegue en servidores compatibles con la API de endpoints de Hugging Face: la etiqueta `endpoints_compatible` permite servirlo como API HTTP para integrarlo en aplicaciones existentes.
- Prototipado de chatbots conversacionales: la naturaleza conversacional del modelo permite construir asistentes multi-turno para pruebas internas antes de escalar a un modelo mayor.
- Evaluación comparativa de cuantizaciones: el repositorio incluye doce variantes (desde Q2_K hasta F16), lo que permite medir la degradación de calidad frente al ahorro de memoria en un caso de uso concreto.
- Generación de documentación técnica: un modelo de 27 B puede redactar y resumir documentación de proyectos, siempre que se valide la salida por el riesgo de alucinación.
- Investigación sobre eficiencia de inferencia: útil para estudiar el rendimiento de distintas cuantizaciones estáticas en hardware consumer y profesional.
- Fine-tuning posterior: los pesos en GGUF no son adecuados para reentrenamiento; para ello habría que partir del modelo original en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según el tamaño de los ficheros GGUF de un modelo de 27 B):
  - F16: en torno a 54 GB (no cabe en una sola GPU consumer).
  - Q8_0: en torno a 29 GB.
  - Q6_K: en torno a 22 GB.
  - Q5_K_M: en torno a 19 GB.
  - Q4_K_M: en torno a 16-17 GB.
  - Q3_K_M: en torno a 13 GB.
  - Q2_K: en torno a 10-11 GB.
- GPU recomendadas: A100 80 GB o H100 para F16 y Q8_0; RTX 4090 (24 GB) o A6000 (48 GB) para Q4_K_M y Q5_K_M; RTX 3090/4090 para cuantizaciones Q3 y Q2.
- Cabe en GPU consumer: sí, en cuantizaciones Q2_K a Q5_K_M en tarjetas con 16-24 GB de VRAM, con margen ajustado en las variantes mayores.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con la API de endpoints de Hugging Face y cualquier runtime que cargue GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente sobre el modelo base (licencia, contexto, benchmarks) para establecer una comparativa fiable con alternativas de la misma categoría. Se indica como no disponible.

## Limitaciones y advertencias

- La licencia no está especificada en el repositorio, por lo que no se puede confirmar si se permite uso comercial; es imprescindible consultar la licencia del modelo original (theailearner/HiveCoder3) antes de desplegarlo en producción.
- No hay información sobre sesgos, idiomas soportados ni calidad multilingüe.
- Riesgo de alucinación inherente a los modelos generativos; no hay evaluaciones publicadas que lo cuantifiquen.
- Las cuantizaciones agresivas (Q2_K, Q3_K_S) pueden degradar notablemente la calidad, especialmente en tareas de código y razonamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- Los pesos GGUF no son aptos para fine-tuning; para reentrenar hay que usar el modelo original en safetensors.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/HiveCoder3-GGUF
- Modelo original: https://huggingface.co/theailearner/HiveCoder3
- Repositorio de peticiones del cuantizador: https://huggingface.co/mradermacher/model_requests
