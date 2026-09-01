# quuyy/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una colección de cuantizaciones GGUF del modelo Qwen3.8-27B-Uncensored, una versión "abliterated" (con los mecanismos de rechazo eliminados) de Qwen3.8-27B, un modelo de lenguaje y visión de 27 mil millones de parámetros desarrollado originalmente por Alibaba. El cuantizado, realizado por mradermacher, ofrece una gama de quants desde Q2_K hasta Q8_0, más los proyectores multimodales (mmproj) en f16 y Q8_0, lo que permite ejecutar el modelo en hardware variado.

El modelo subyacente, Qwen3.8-27B, es un transformer denso con atención híbrida que combina Gated DeltaNet (atención lineal) con atención completa, e incorpora una cabeza de decodificación especulativa MTP (Multi-Token Prediction) para acelerar la inferencia. Es nativamente multimodal (visión y lenguaje) y soporta razonamiento, tool-calling y una ventana de contexto extensa (no especificada en la información disponible). La versión uncensored elimina los rechazos de contenido, lo que lo hace adecuado para investigación y aplicaciones donde se requiere generación sin restricciones temáticas.

Esta ficha se centra en el paquete GGUF, que es el formato más práctico para despliegue local con llama.cpp, Ollama u otros runners compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (Gated DeltaNet lineal + atencion completa), nativo vision-lenguaje |
| Parametros totales | 27.320.697.856 (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (contenedor de llama.cpp), safetensors para el modelo base |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer densa con una innovacion clave: atencion hibrida que alterna capas de Gated DeltaNet (una forma de atencion lineal con estado recurrente) con capas de atencion completa. Este diseno reduce el coste computacional en contextos largos manteniendo la calidad de la atencion plena en las capas criticas. Ademas, incorpora una cabeza MTP (Multi-Token Prediction) que permite decodificacion especulativa, prediciendo varios tokens a la vez para acelerar la generacion.

El modelo es nativamente multimodal: incluye un proyector visual (mmproj) que se distribuye por separado en formato GGUF, permitiendo entrada de imagenes junto con texto. La version uncensored se obtuvo mediante tecnicas de "abliteration" sobre el modelo original, que eliminan las respuestas de rechazo y los sesgos de seguridad, dando como resultado un modelo que no filtra contenido por politica. No se dispone de informacion detallada sobre los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) en la documentacion proporcionada.

## Capacidades

- Generacion de texto libre sin filtros de contenido (modelo abliterated, no produce rechazos por temas sensibles).
- Razonamiento complejo y resolucion de problemas en varios pasos, gracias a la arquitectura de 27B y la atencion hibrida.
- Tool-calling / function calling: el modelo puede invocar herramientas externas en formato estructurado.
- Soporte de agentes y multi-step reasoning: adecuado para pipelines de agentes que requieren planificacion y ejecucion secuencial.
- Capacidades multimodales (vision): el proyector mmproj permite procesar imagenes junto con texto (descripcion de imagenes, OCR, analisis visual).
- Decodificacion especulativa MTP: mayor throughput en inferencia al predecir multiples tokens por paso.
- Multilingue: ingles y chino principalmente, con capacidad limitada en otros idiomas no documentada.

## Casos de uso

- Investigacion en seguridad y alineacion de IA: al eliminar los rechazos, permite estudiar el comportamiento del modelo sin sesgos de seguridad, ideal para analisis de sesgos, jailbreaks y evaluacion de riesgos.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones, poesia o narrativa adulta donde los modelos censurados bloquean temas como violencia o contenido explicito.
- Asistente local multimodal para documentacion tecnica: alimentar el modelo con capturas de pantalla o diagramas para extraer informacion y generar resumenes, gracias al proyector de vision.
- Desarrollo de agentes autonomos con tool-calling: integrar el modelo en un framework de agentes (por ejemplo, con funciones de busqueda web, calculo o ejecucion de codigo) para tareas de automatizacion de oficina.
- Chatbot de soporte interno sin restricciones corporativas: en entornos controlados donde se necesita respuestas directas sobre temas delicados (por ejemplo, soporte legal o medico experimental) sin respuestas evasivas.
- Experimentacion con decodificacion especulativa: probar el rendimiento de la cabeza MTP en entornos de baja latencia, como aplicaciones de chat en tiempo real en hardware local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones MMLU, HumanEval, GSM8K ni comparativas con otros modelos para esta version cuantizada. Los datos de rendimiento dependen del cuant elegido y del hardware, pero no hay mediciones oficiales documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (peso del archivo + overhead de contexto):
  - Q2_K (11.0 GB): cabe en GPUs de 12 GB (p. ej., RTX 3060, RTX 4070) con contexto limitado.
  - Q4_K_M (16.9 GB): recomendado para GPUs de 20-24 GB (RTX 3090, RTX 4090, A5000).
  - Q8_0 (29.1 GB): requiere GPUs de 32-40 GB (A100 40GB, RTX A6000, o dos GPUs en paralelo).
  - El proyector multimodal (mmproj) anade 0.7-1.0 GB adicionales.
- GPUs recomendadas: para uso local en consumer, RTX 4090 (24 GB) es suficiente para quants hasta Q5_K_M (19.6 GB) con contexto moderado. Para Q8_0 se necesita hardware profesional o de datacenter.
- Opciones de despliegue: llama.cpp (incluye soporte para GGUF y ejecucion en CPU/GPU), Ollama (facil de usar con archivos Modelfile), LM Studio, o servidores compatibles con GGUF como llama-cpp-python. vLLM no soporta GGUF nativamente (requiere safetensors), por lo que no es recomendable para este formato.
- Latencia y throughput: no hay datos publicados. En una RTX 4090 con Q4_K_M, se esperan velocidades de 20-40 tokens/s para generacion, pero es una estimacion no confirmada.

## Comparativa con modelos similares

No se dispone de datos comparativos de rendimiento para este modelo. Como referencia arquitectonica, se puede comparar con:

| Modelo | Parametros | Contexto | Vision | Tool-calling | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored (este) | 27B denso | No disponible | Si | Si | Apache 2.0 | GGUF |
| Qwen3-32B (original con filtros) | 32B denso | No disponible | Si | Si | Apache 2.0 | Transformers/GGUF |
| Llama-3.1-8B-Instruct | 8B denso | 128K | No | Si | Llama 3.1 | GGUF/Transformers |
| Qwen3-30B-A3B (MoE) | 30B total, 3B activos | No disponible | No | Si | Apache 2.0 | Transformers/GGUF |

La principal diferencia frente a modelos similares es la ausencia de filtros de contenido, lo que lo posiciona en un nicho especifico de investigacion y generacion sin restricciones. No se dispone de datos de calidad objetiva para realizar una comparativa numerica fiable.

## Limitaciones y advertencias

- Modelo sin filtros de contenido: al ser abliterated, puede generar contenido ofensivo, ilegal, violento o sexualmente explicito sin restricciones. No debe usarse en aplicaciones publicas sin medidas de salvaguarda externas.
- Riesgo de alucinacion: como cualquier LLM, puede inventar hechos, citas o codigo. La ausencia de rechazos no reduce este riesgo.
- Idiomas limitados: solo se documentan ingles y chino; el rendimiento en otros idiomas es incierto.
- Licencia Apache 2.0 permite uso comercial, pero el modelo derivado de un proceso de abliteration puede tener implicaciones eticas y legales en ciertos dominios (por ejemplo, generacion de desinformacion).
- No se dispone de informacion sobre la ventana de contexto real; se recomienda probar con cargas de trabajo especificas antes de desplegar en produccion.
- El cuantizado GGUF implica perdida de precision respecto al modelo original en safetensors; quants bajos (Q2_K, Q3) pueden degradar significativamente la calidad de salida.
- No hay garantias de soporte ni mantenimiento por parte del autor del cuantizado (mradermacher); es un proyecto comunitario.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/quuyy/Qwen3.8-27B-Uncensored-GGUF
- Modelo base (safetensors): https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Cuantizaciones con imatrix (variante alternativa): https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-i1-GGUF
- Guia de ejecucion local con llama.cpp: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Build para Ollama: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Herramienta de consulta de quants (AI Indigo): https://aiindigo.com/tool/qwen38-27b-uncensored-gguf
