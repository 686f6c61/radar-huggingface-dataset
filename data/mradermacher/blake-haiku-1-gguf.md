# mradermacher/Blake-Haiku-1-GGUF

## Resumen

Blake-Haiku-1-GGUF es una cuantización en formato GGUF del modelo Blake-Haiku-1, creada por mradermacher (nethype GmbH) a partir del modelo base de Flexan. Se trata de un modelo de lenguaje de pequeño tamaño, con aproximadamente 596 millones de parámetros, orientado a conversación y publicado bajo licencia CC-BY-SA-4.0. Su principal interés reside en que, gracias a las cuantizaciones GGUF, puede ejecutarse en entornos con recursos limitados, como portátiles o dispositivos edge, sin necesidad de GPU dedicada.

La relevancia actual de este modelo radica en su accesibilidad: al ser una versión cuantizada, permite probar un modelo de lenguaje de tamaño reducido con requisitos de memoria muy bajos (desde 0,4 GB en las cuantizaciones más agresivas). Sin embargo, no se dispone de información técnica detallada sobre la arquitectura interna, el entrenamiento o las capacidades específicas más allá de su naturaleza conversacional. Es un ejemplo de cómo la comunidad de cuantización facilita la democratización de los modelos de IA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo original Blake-Haiku-1 (si es un transformer estándar, si utiliza atención lineal, etc.). La cuantización realizada por mradermacher no altera la arquitectura, solo convierte los pesos a formato GGUF con distintas precisiones. Tampoco hay datos sobre el proceso de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés.
- Orientado a tareas de chat y diálogo.
- No se han documentado capacidades específicas como tool calling, agentes, razonamiento multi-paso, vision o audio.
- La cuantización no modifica las capacidades funcionales del modelo, pero las cuantizaciones más agresivas (Q2_K, Q3_K) pueden degradar la calidad de salida.

## Casos de uso

- **Chatbots simples en aplicaciones web**: al ser un modelo pequeño y cuantizado, puede integrarse en servidores ligeros o incluso en el navegador mediante WASM para ofrecer un asistente conversacional básico en inglés.
- **Prototipado rápido de ideas**: los desarrolladores pueden probar el modelo en local con llama.cpp u Ollama para validar conceptos de procesamiento de lenguaje natural sin depender de APIs externas.
- **Asistencia en dispositivos edge**: gracias a su tamaño reducido (menos de 1 GB en Q4), puede desplegarse en Raspberry Pi o sistemas embebidos para tareas de generación de texto limitadas.
- **Educación y experimentación**: es un modelo adecuado para aprender a trabajar con modelos GGUF, cuantización, y para comparar el impacto de diferentes niveles de precisión en la calidad de las respuestas.
- **Generación de texto en entornos sin conexión**: su licencia CC-BY-SA-4.0 permite su uso en aplicaciones que no requieran compartir derivados bajo la misma licencia, siempre que se cumplan las condiciones.
- **Pruebas de inferencia en CPU**: con cuantizaciones como Q4_K_M (0,5 GB) se puede ejecutar en un portátil con CPU moderna y RAM suficiente, sin necesidad de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este modelo.

## Requisitos de hardware

- **VRAM estimada**: para el f16 se necesitan unos 1,3 GB de memoria (el modelo ocupa 1,3 GB en disco). Las cuantizaciones Q4 y Q5 ocupan unos 0,5 GB, por lo que pueden caber en tarjetas gráficas con 2 GB de VRAM o incluso en memoria RAM.
- **GPU recomendadas**: no se requiere una GPU específica; cualquier GPU con más de 2 GB de VRAM es suficiente. Para cuantizaciones Q2_K o Q3_K, una GPU integrada o incluso CPU sola es viable.
- **Compatibilidad consumer**: sí, cabe en cualquier GPU de consumo moderna (GTX 1060, RTX 2060, etc.) y también en CPU con 4 GB de RAM libre.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, llama-cpp-python, o cualquier backend que soporte GGUF.
- **Latencia y throughput**: no se dispone de datos medidos. Con un modelo de ~600M de parámetros en Q4, se puede esperar una generación de entre 5 y 20 tokens por segundo en una CPU moderna, y mayor en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (tamaño y propósito) que permitan una comparación directa. No se puede indicar una comparativa fiable sin datos de rendimiento.

## Limitaciones y advertencias

- **Licencia**: CC-BY-SA-4.0 implica que cualquier obra derivada debe compartirse bajo la misma licencia, lo que puede ser restrictivo para aplicaciones comerciales que no quieran abrir su código o sus modelos.
- **Tamaño reducido**: con 596M parámetros, su capacidad de razonamiento complejo, matemáticas o generación de código es limitada comparada con modelos de mayor tamaño.
- **Solo inglés**: no soporta otros idiomas, lo que limita su uso en entornos multilingües.
- **Sin información sobre sesgos**: no se han documentado sesgos específicos, pero al ser un modelo pequeño, es probable que presente sesgos comunes en modelos entrenados con datos de internet.
- **Riesgo de alucinación**: como cualquier modelo generativo, puede inventar información, especialmente en cuantizaciones bajas.
- **Contexto desconocido**: no se indica la longitud de contexto máxima, lo que puede afectar a tareas que requieren manejar ventanas largas.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/Blake-Haiku-1-GGUF
- Modelo base original: https://huggingface.co/Flexan/Blake-Haiku-1
- Página de mradermacher: https://huggingface.co/mradermacher
- Referencia de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Página de descarga del modelo: https://hf.tst.eu/model#Blake-Haiku-1-GGUF
