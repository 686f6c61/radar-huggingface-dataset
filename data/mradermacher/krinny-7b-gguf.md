# mradermacher/krinny-7b-GGUF

## Resumen

Krinny-7b es un modelo de lenguaje de 7.615 millones de parámetros (7B) orientado a conversación en español y catalán, desarrollado por el usuario krinny. Este repositorio contiene la versión cuantizada en formato GGUF preparada por mradermacher, lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles con GGUF. El modelo base está publicado bajo licencia Apache 2.0, lo que facilita su uso tanto en investigación como en aplicaciones comerciales.

La relevancia de este modelo radica en su disponibilidad para tareas de lenguaje natural en español y catalán, dos idiomas con menor cobertura en modelos open source de tamaño medio. Al tratarse de una cuantización, se ofrecen distintos niveles de compresión (desde Q2_K hasta f16) que permiten adaptar el consumo de memoria a las capacidades del hardware disponible. No se ha publicado información detallada sobre la arquitectura exacta, el contexto de entrenamiento ni los datos utilizados, por lo que el modelo debe evaluarse empíricamente antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (subtipo no especificado) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Español (es), catalán (ca) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

La model card no incluye información detallada sobre la arquitectura del modelo base. Se indica que utiliza la librería transformers y que ha sido entrenado con adaptadores LoRA, lo que sugiere un ajuste fino sobre un modelo preexistente. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documenta la longitud de contexto soportada. La única innovación técnica destacable es la cuantización GGUF realizada por mradermacher, que incluye múltiples niveles de compresión con diferentes balances entre tamaño y calidad.

## Capacidades

- Generación de texto conversacional en español y catalán, según los tags del modelo.
- Soporte de lenguaje natural para tareas de diálogo y chat.
- No se ha documentado soporte de tool calling ni function calling en la model card.
- No se han publicado detalles sobre capacidades de razonamiento, generación de código, matemáticas o visión.
- No se indica soporte de agentes ni multi-step reasoning.
- El modelo está diseñado para uso local y puede integrarse en entornos con restricciones de privacidad.

## Casos de uso

- Atención al cliente en español: el modelo puede gestionar conversaciones de soporte en entornos locales, evitando el envío de datos a servicios externos. Su tamaño de 7B permite respuestas coherentes en diálogos de longitud moderada.
- Asistente virtual bilingüe español-catalán: al estar entrenado en ambos idiomas, puede alternar entre ellos en una misma conversación, útil para aplicaciones en Cataluña o contextos multilingües.
- Generación de contenido en español: redacción de correos, artículos breves o resúmenes para equipos de marketing y comunicación que necesiten herramientas locales con licencia Apache 2.0.
- Chatbot para intranets corporativas: despliegue en servidores internos mediante llama.cpp u Ollama, con control total sobre los datos y sin dependencia de APIs externas.
- Prototipado rápido de aplicaciones NLP: los desarrolladores pueden experimentar con un modelo de 7B en español sin coste de inferencia en la nube, gracias a las cuantizaciones que caben en GPUs de consumo.
- Traducción asistida o apoyo lingüístico entre español y catalán: el modelo puede utilizarse como herramienta de apoyo para revisión y generación de texto en ambos idiomas, aunque se desconoce su rendimiento real en esta tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones que permitan comparar el rendimiento de krinny-7b con otros modelos. Cualquier decisión de uso en producción debe basarse en pruebas internas.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q2_K (3.1 GB): 4-6 GB de VRAM para GPU.
  - Q4_K_M (4.8 GB): 6-8 GB de VRAM.
  - Q5_K_M (5.5 GB): 7-9 GB de VRAM.
  - Q8_0 (8.2 GB): 10-12 GB de VRAM.
  - f16 (15.3 GB): 16-20 GB de VRAM.
- GPU recomendadas: RTX 3060 12GB para Q4/Q5, RTX 4090 o A100 para f16. Para CPU, se necesita RAM equivalente al tamaño del archivo más overhead del contexto.
- El modelo cabe en GPUs de consumo con 8 GB o más, dependiendo de la cuantización y la longitud de contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui. No se recomienda vLLM para GGUF, ya que este motor está optimizado para pesos safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. No se conocen benchmarks ni datos de rendimiento de krinny-7b frente a otros modelos de tamaño similar en español o catalán. Se recomienda comparar empíricamente con alternativas como Mistral-7B, Llama-3-8B o modelos específicos para español si se dispone de datos de evaluación propios.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real en tareas de razonamiento, generación de código o matemáticas es desconocido.
- Al ser una cuantización, puede existir una pérdida de calidad en comparación con el modelo base en f16, especialmente en los niveles más agresivos (Q2_K, Q3_K).
- La longitud de contexto no está documentada, lo que limita la planificación de aplicaciones que requieran ventanas largas.
- No se han documentado sesgos específicos, pero es probable que el modelo herede sesgos de los datos de entrenamiento del modelo base.
- Riesgo de alucinación inherente a los modelos de lenguaje de este tamaño.
- La licencia Apache 2.0 permite uso comercial, pero no exime de responsabilidad sobre el contenido generado.
- El modelo solo está disponible en español y catalán; no se ha verificado su capacidad en otros idiomas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/krinny-7b-GGUF
- Modelo base: https://huggingface.co/krinny/krinny-7b
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
