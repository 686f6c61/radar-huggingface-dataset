# mradermacher/Qwen3.8-27B-Abliterated-Uncensored-NOESIS-BF16-GGUF

## Resumen

Qwen3.8-27B-Abliterated-Uncensored-NOESIS-BF16-GGUF es una colección de cuantizaciones GGUF del modelo base AMAImedia/Qwen3.8-27B-Abliterated-Uncensored-NOESIS-BF16, preparadas por mradermacher. Se trata de una versión "abliterada" (eliminación de rechazos) del modelo Qwen3.8-27B de Alibaba, que elimina los mecanismos de rechazo y censura del modelo original para permitir respuestas sin restricciones. El sufijo NOESIS indica un repack o ajuste adicional sobre la abliteración base.

El modelo base es un transformer denso de 27.320 millones de parámetros con soporte multimodal (incluye un proyector de visión mmproj), multi-token prediction (MTP) y una ventana de contexto de 262.144 tokens. Esta versión GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles, con distintos niveles de cuantización que van desde Q2_K hasta Q8_0. La licencia es Apache 2.0, aunque el uso está restringido a investigación.

La relevancia de este modelo radica en que combina un modelo de última generación con capacidades de razonamiento, visión y tool calling, con una versión sin censura que resulta útil para investigación en seguridad, red-teaming y estudios de alineación. Al estar disponible en formato GGUF, democratiza el acceso a un modelo de 27B que de otro modo requeriría hardware de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8) con soporte multimodal y MTP |
| Parametros totales | 27.320.697.856 (27,32B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | Apache 2.0 (con restriccion de uso a investigacion) |
| Formato de pesos | GGUF (safetensors disponible en el repo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27.320 millones de parametros desarrollado por Alibaba. Incluye un codificador de vision (vision tower) que permite procesar imagenes, y un cabezal de multi-token prediction (MTP) que mejora la velocidad de decodificacion. La arquitectura soporta modos de razonamiento estandar y "thinking" (cadena de pensamiento explicita).

La version abliterada elimina los patrones de rechazo del modelo original mediante tecnicas de ablacion a nivel de tensor. Segun la documentacion de modelos similares, el proceso de abliteracion no produce perdida medible de capacidades y reduce la tasa de sobre-rechazo al 0% en el conjunto XSTest. El repack NOESIS aplica ajustes adicionales sobre esta base. Los datos de entrenamiento y el proceso de alineacion del modelo original no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento: mantiene las capacidades completas del Qwen3.8-27B original, incluyendo razonamiento paso a paso y modo thinking.
- Vision: incluye proyector multimodal (mmproj) que permite procesar y comprender imagenes junto con texto.
- Tool calling / function calling: soporte completo para invocacion de herramientas y APIs externas.
- Agentes y multi-step reasoning: puede encadenar multiples pasos de razonamiento y usar herramientas de forma autonoma.
- Contexto largo: ventana de 262.144 tokens, adecuada para documentos extensos y conversaciones multi-turno.
- Sin censura: no aplica rechazos por contenido controvertido, lo que permite explorar temas sensibles sin restricciones.
- Multilingue: aunque la model card indica solo ingles, el modelo base Qwen3.8 soporta multiples idiomas; no se ha verificado el comportamiento en otros idiomas en esta version.

## Casos de uso

- Investigacion en seguridad y red-teaming: permite probar sistemas de moderacion, generar prompts adversariales y estudiar vulnerabilidades en modelos de lenguaje sin las restricciones de un modelo censurado.
- Analisis de contenido sensible: util para estudiar discursos de odio, desinformacion o contenido extremista en entornos de investigacion controlados, donde un modelo sin rechazos puede generar ejemplos que un modelo censurado no produciria.
- Desarrollo de personajes para juegos o narrativa: la ausencia de censura permite crear personajes con personalidades complejas, dialogos adultos o tramas que aborden temas tabu sin limitaciones.
- Generacion de codigo sin restricciones: puede generar exploits, malware o codigo ofensivo para pruebas de penetracion y auditorias de seguridad, algo que los modelos censurados suelen rechazar.
- Asistente local de conocimiento general: con cuantizacion Q4_K_M (16,9 GB) cabe en una GPU de 24 GB y puede usarse como asistente personal con contexto largo y capacidades de vision.
- Experimentacion con alineacion y seguridad de IA: permite estudiar el comportamiento de un modelo sin mecanismos de rechazo, comparar con versiones alineadas y analizar diferencias en sesgos y alucinaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta version GGUF en la informacion disponible. El modelo base Qwen3.8-27B ha sido evaluado en benchmarks como MathVision, pero no se proporcionan cifras concretas. La documentacion de modelos abliterados similares indica "0% de sobre-rechazo en XSTest" y "0-6% de rechazo en el conjunto A/B", pero estos datos no estan confirmados para esta version concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 11 GB (Q2_K) y 29,1 GB (Q8_0) solo para los pesos. Hay que anadir VRAM para KV cache y overhead.
- GPU recomendadas: para cuantizaciones Q4_K_M o menores, una RTX 3090/4090 (24 GB) es suficiente. Para Q6_K o Q8_0 se recomienda una A100 (40/80 GB) o H100.
- En consumer GPU: si, con cuantizaciones Q4_K_M o inferiores en GPUs de 24 GB. Con Q2_K o Q3_K cabe en GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con conversion previa), llama-cpp-python.
- Latencia y throughput: no disponible. Depende de la GPU, cuantizacion y longitud de contexto. Como referencia, un modelo de 27B en Q4_K_M en una RTX 4090 suele generar entre 20-40 tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,32B | 262K | Apache 2.0 | safetensors | Modelo oficial con censura |
| Qwen3.8-27B-Abliterated-Uncensored-NOESIS-BF16 (este) | 27,32B | 262K | Apache 2.0 (investigacion) | GGUF | Abliterado, sin censura |
| Qwen3.8-27B AEON Uncensored | 27,32B | 262K | Apache 2.0 | safetensors/GGUF | Abliteracion con metodologia KL-drift |
| Qwen3.8-27B-Uncensored (orcarouter) | 27,32B | 262K | Apache 2.0 (investigacion) | GGUF | Abliterado a nivel de tensor, vision y MTP intactos |

## Limitaciones y advertencias

- Sesgos conocidos: al ser una version sin censura, el modelo puede generar contenido ofensivo, discriminatorio o perjudicial sin filtros. No se han realizado evaluaciones de sesgo especificas para esta version.
- Riesgo de alucinacion: al igual que el modelo original, puede inventar informacion, especialmente en temas especializados o de actualidad.
- Limitaciones de contexto: aunque soporta 262K tokens, el rendimiento degrada con contextos muy largos y el coste computacional aumenta significativamente.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el uso esta restringido a investigacion. No debe usarse en produccion comercial sin verificar los terminos del modelo base.
- Idioma: la model card solo indica ingles. El comportamiento en otros idiomas no esta verificado y puede ser inconsistente.
- Riesgo de uso malintencionado: al no tener censura, el modelo puede generar contenido peligroso (malware, instrucciones para actividades ilegales, etc.). El responsable del despliegue debe tomar medidas de seguridad.
- Calidad de cuantizaciones bajas: las cuantizaciones Q2_K y Q3_K pueden degradar significativamente la calidad de las respuestas y aumentar las alucinaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Abliterated-Uncensored-NOESIS-BF16-GGUF
- Modelo base: https://huggingface.co/AMAImedia/Qwen3.8-27B-Abliterated-Uncensored-NOESIS-BF16
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Version con imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-Abliterated-Uncensored-NOESIS-BF16-i1-GGUF
- Version abliterada similar: https://huggingface.co/mradermacher/Qwen3.8-27B-ABLITERATED-BF16-i1-GGUF
- Articulo sobre abliteracion AEON: https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Version en Ollama: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Guia de cuantizaciones GGUF: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
