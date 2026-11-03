# mradermacher/InnoSpark3.2-27B-1102-GGUF

## Resumen

InnoSpark3.2-27B-1102-GGUF es una conversión a formato GGUF del modelo InnoSpark3.2-27B-1102, publicado originalmente por sii-research (Shanghai Innovation Institute). El repositorio corre a cargo de mradermacher, un conocido generador de cuantizaciones estáticas para llama.cpp, y ofrece el modelo en múltiples niveles de compresión (desde Q2_K hasta F16) para facilitar su despliegue en hardware de consumo.

El modelo base es un transformer denso de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones), orientado a uso conversacional. La model card del repositorio de cuantización no aporta información sobre arquitectura interna, longitud de contexto, composición del dataset de entrenamiento ni proceso de alineación, por lo que estos datos figuran como no disponibles en esta ficha.

Su relevancia práctica radica en la disponibilidad de cuantizaciones listas para usar con llama.cpp y herramientas compatibles, lo que permite ejecutar un modelo de 27B en GPUs de consumo con suficiente VRAM o incluso en configuraciones con offloading parcial a CPU. El repositorio ocupa 56,7 GB en total, lo que refleja el conjunto completo de variantes cuantizadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (detalles internos no disponibles) |
| Parámetros totales | 27.320.697.856 (~27,3B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas generadas desde safetensors del modelo original) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base InnoSpark3.2-27B-1102. Los metadatos de la conversión indican que se trata de una cuantización estática (`quantize_version: 2`, `output_tensor_quantised: 1`) realizada con el pipeline de llama.cpp a partir de los pesos en formato HuggingFace (`convert_type: hf`) del repositorio sii-research/InnoSpark3.2-27B-1102. El recuento de parámetros (27,3B) corresponde a un transformer denso.

Tampoco se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO u otras técnicas de alineación, ni innovaciones técnicas específicas (atención lineal, decodificación especulativa, modos de razonamiento, etc.). Cualquier afirmación al respecto sería especulativa y no se incluye en esta ficha.

## Capacidades

- Generación de texto conversacional: el tag `conversational` del repositorio y la orientación del modelo base apuntan a un uso principal en diálogo multi-turno.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse a través de infraestructura de inferencia estándar compatible con la API de HuggingFace.
- Ejecución local vía llama.cpp: las cuantizaciones GGUF permiten inferencia en CPU, GPU o configuraciones híbridas.
- Capacidades específicas de razonamiento, código, matemáticas, visión, tool calling o agentes: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas en la model card.

## Casos de uso

- Despliegue conversacional en local: usar la variante Q4_K_M o Q5_K_M con llama.cpp u Ollama para servir un chatbot de 27B en una estación de trabajo con una única GPU de 24 GB, aprovechando la compresión para mantener el modelo completo en VRAM.
- Prototipado de asistentes sobre hardware de consumo: la variante Q3_K_M o Q2_K permite probar el modelo en GPUs de 12-16 GB o con offloading parcial a CPU, útil para validar flujos conversacionales antes de escalar a infraestructura mayor.
- Evaluación comparativa de cuantizaciones: al ofrecer 12 variantes (desde Q2_K hasta F16), el repositorio sirve para medir la degradación de calidad frente a tamaño en un modelo de 27B, un caso habitual en laboratorios que ajustan el equilibrio calidad/VRAM.
- Integración en pipelines de inferencia compatibles con endpoints: el tag `endpoints_compatible` facilita montar el modelo detrás de un servicio HTTP estándar para aplicaciones internas de generación de texto.
- Fine-tuning posterior sobre los pesos originales: aunque este repositorio solo contiene GGUF, el enlace al modelo base en safetensors permite partir de los pesos completos para ajuste supervisado y luego reconvertir a GGUF.
- Experimentación académica con modelos de escala media: 27B es un tamaño manejable para estudiar comportamiento conversacional, sesgos o calidad de generación sin requerir clústeres multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 27,3B parámetros, aproximada según cuantización):
  - F16: ~54-55 GB
  - Q8_0: ~29 GB
  - Q6_K: ~22-23 GB
  - Q5_K_M: ~19-20 GB
  - Q4_K_M: ~16-17 GB
  - Q3_K_M: ~13-14 GB
  - Q2_K: ~10-11 GB
- GPU recomendadas: A100 80 GB o H100 para F16/Q8_0 sin compromisos; RTX 4090 (24 GB) o L40S (48 GB) para Q6_K y Q5_K_M; RTX 3090/4090 para Q4_K_M.
- ¿Cabe en GPU de consumo? Sí: Q4_K_M y Q5_K_M caben en GPUs de 24 GB (RTX 3090, 4090); Q3_K_M y Q2_K caben en GPUs de 12-16 GB (RTX 4070 Ti, 4080) o con offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con GGUF (por ejemplo, llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa para este formato; requerirían los pesos originales en safetensors.
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantización y la longitud de contexto, que tampoco se especifica.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones internas (contexto, licencia, idiomas) del modelo base, por lo que una comparativa cuantitativa rigurosa no es posible. A modo orientativo por escala y formato:

| Modelo | Parámetros | Contexto | Formato GGUF | Licencia | Notas |
|---|---|---|---|---|---|
| InnoSpark3.2-27B-1102 (este) | ~27,3B | No disponible | Sí (12 variantes) | No disponible | Conversacional; sin benchmarks publicados |
| Gemma 2 27B | 27B | 8K | Sí | Gemma Terms | Modelo denso de Google con benchmarks públicos |
| Qwen2.5 32B | 32,5B | 128K | Sí | Apache 2.0 (mayoría de variantes) | Multilingüe, con benchmarks publicados |
| Mistral Small 24B | 24B | 32K | Sí | Apache 2.0 | Denso, orientado a instrucciones |

La comparación se limita a escala y disponibilidad de cuantizaciones; no se han verificado diferencias de calidad entre estos modelos por falta de datos del modelo evaluado.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni evaluaciones conversacionales, lo que impide estimar su calidad frente a alternativas.
- Licencia desconocida: la model card no declara licencia, ni en el repositorio de cuantización ni (según la información disponible) en el modelo base. No debe asumirse uso comercial permitido sin verificar la licencia del modelo original en sii-research/InnoSpark3.2-27B-1102.
- Idiomas no declarados: se desconoce si el modelo está entrenado principalmente en inglés, chino o multilingüe; el rendimiento en castellano es incierto.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin confirmar la ventana máxima del modelo base.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; sin datos de alineación (RLHF/DPO) no es posible evaluar su mitigación.
- Sesgos: no documentados; al no conocerse la composición del dataset, no se pueden anticipar sesgos lingüísticos, culturales o de dominio.
- Degradación por cuantización: las variantes Q2_K y Q3_K_S pueden perder calidad apreciable en un modelo de 27B; se recomienda Q4_K_M o superior para producción.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria sobre la calidad de las cuantizaciones.
- Conversión de terceros: las cuantizaciones las genera mradermacher, no el autor original; ante discrepancias, la referencia es el repositorio sii-research.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/InnoSpark3.2-27B-1102-GGUF
- Modelo base (pesos originales): https://huggingface.co/sii-research/InnoSpark3.2-27B-1102
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
