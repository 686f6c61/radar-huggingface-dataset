# mradermacher/Qwen3.8-27B-Uncensored-Aggressive-NOESIS-BF16-i1-GGUF

## Resumen

Este repositorio contiene la cuantización GGUF del modelo Qwen3.8-27B-Uncensored-Aggressive-NOESIS-BF16, preparada por mradermacher. Se trata de una versión "uncensored" (sin censura) del modelo Qwen3.8-27B, que ha sido sometida a un proceso de ablación de capas (abliteration) para eliminar los mecanismos de rechazo de respuestas, junto con un ajuste "aggressive" que reduce aún más las restricciones. El modelo base es un fine-tune de AMAImedia sobre Qwen3.8, que incorpora visión, tool calling y un contexto de 262K tokens.

La relevancia de este modelo radica en su naturaleza de investigación: permite estudiar el comportamiento de modelos de lenguaje sin los mecanismos de seguridad estándar, lo que resulta útil para analizar sesgos, alucinaciones y los límites de la alineación. El repositorio actual incluye únicamente el archivo imatrix para crear cuantizaciones personalizadas; las cuantizaciones estáticas están disponibles en el repositorio hermano Qwen3.8-27B-Uncensored-Aggressive-NOESIS-BF16-GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8, variante 27B) |
| Parametros totales | 27 mil millones (estimado, no confirmado en la ficha) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (262K, segun descripcion del modelo base) |
| Tipos de cuantizacion | imatrix (este repo); Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (repo estatico) |
| Idiomas soportados | en, ru, zh, ja, kk, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (imatrix) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B-Uncensored-Aggressive-NOESIS-BF16 es un fine-tune de AMAImedia sobre la arquitectura Qwen3.8, que a su vez es una evolución de la familia Qwen3. Incorpora un "vision tower" para procesamiento multimodal y un cabezal MTP (Multi-Token Prediction) que permite predecir varios tokens a la vez, mejorando la velocidad de decodificación. El proceso de "abliteration" elimina selectivamente las direcciones de activación asociadas al rechazo de respuestas, manteniendo intactas las capacidades generales del modelo.

El entrenamiento del modelo base incluye una fase de ajuste con datos sintéticos y reales orientados a reducir la tasa de rechazo, logrando un 0% de over-refusal en XSTest y un 0-6% de rechazo en el suite A/B, sin pérdida medible de capacidad. El modelo conserva el contexto completo de 262K tokens, el tool calling y el modo de razonamiento (thinking) del Qwen3.8 original. El repositorio actual solo contiene el archivo imatrix, que se utiliza como dataset de calibración para generar cuantizaciones de alta calidad.

## Capacidades

- Generación de texto sin restricciones de contenido: el modelo ha sido ablacionado para eliminar los mecanismos de rechazo, por lo que responde a practicamente cualquier consulta sin negarse.
- Razonamiento multi-step: conserva el modo "thinking" del Qwen3.8, que permite al modelo razonar internamente antes de responder.
- Tool calling / function calling: soporte completo para invocar herramientas externas, integrable en agentes y pipelines.
- Capacidades multimodales: incluye un vision tower (mmproj) que permite procesar imagenes, aunque los archivos mmproj estan en el repositorio estatico.
- Multilingue: soporta ingles, ruso, chino, japones, kazajo y vietnamita.
- Contexto largo: ventana de 262K tokens, adecuada para documentos extensos y conversaciones multi-turno.
- MTP (Multi-Token Prediction): decodificacion acelerada gracias a la prediccion multiple de tokens.

## Casos de uso

- Investigacion academica sobre alineacion y seguridad: el modelo permite estudiar como se comportan los LLM sin mecanismos de rechazo, analizando sesgos, alucinaciones y la eficacia de la ablacion de capas. Se usaria con cargas de trabajo de evaluacion como XSTest o benchmarks de toxicidad.
- Analisis de contenido sin filtros: para tareas de procesamiento de lenguaje natural que requieren analizar texto explicito o sensible (por ejemplo, deteccion de discursos de odio, analisis de narrativas extremistas) donde un modelo censurado perderia informacion.
- Generacion de codigo en entornos controlados: el modelo mantiene las capacidades de programacion del Qwen3.8, por lo que puede usarse en pipelines de generacion de codigo donde se necesite evitar rechazos por contenido "peligroso" (por ejemplo, scripts de pentesting).
- Desarrollo de agentes conversacionales sin restricciones: para prototipos de chatbots de rol o ficcion interactiva donde los usuarios esperan respuestas sin censura, siempre en entornos de investigacion.
- Evaluacion de robustez de sistemas de moderacion: el modelo puede usarse como generador de contenido adversario para probar sistemas de filtrado y moderacion de contenido en plataformas.
- Estudio de la degradacion post-ablacion: comparar el rendimiento de este modelo con el Qwen3.8 original en benchmarks estandar (MMLU, HumanEval, GSM8K) para medir el impacto de la ablacion en las capacidades generales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La descripcion del modelo base menciona "0% over-refusal en XSTest" y "0-6% refusal en el suite A/B", pero no se proporcionan metricas de rendimiento en tareas estandar como MMLU, HumanEval o GSM8K. Se recomienda consultar el repositorio del modelo base (AMAImedia/Qwen3.8-27B-Uncensored-Aggressive-NOESIS-BF16) para obtener datos de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 27B en GGUF, se estima:
  - Q2_K: ~10-12 GB VRAM
  - Q4_K_M: ~16-18 GB VRAM
  - Q6_K: ~22-24 GB VRAM
  - Q8_0: ~28-30 GB VRAM
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4 o inferiores; A100 40/80 GB o H100 para cuantizaciones altas o contexto completo de 262K.
- En consumer GPU: cabe en RTX 3090/4090 (24 GB) con cuantizaciones Q4 o inferiores y contexto reducido. Para contexto completo de 262K se necesitan GPUs profesionales o descarga a CPU.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), LM Studio, text-generation-webui.
- Latencia y throughput: no disponible. Depende del hardware, la cuantizacion y el uso de MTP (que acelera la decodificacion).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-Aggressive-NOESIS-BF16 (este) | 27B | 262K | Apache 2.0 | Abliterado, vision, MTP, tool calling |
| Qwen3.8-27B-Uncensored (orcarouter) | 27B | 262K | Apache 2.0 | Abliterado, vision, MTP, tool calling |
| Qwen3-32B (original) | 32B | 128K | Apache 2.0 | Modelo base sin ablacion, con censura estandar |

La diferencia principal entre este modelo y el de orcarouter es el ajuste "Aggressive-NOESIS", que aplica una ablacion mas profunda y un reempaquetado NOESIS. Ambos mantienen las capacidades del Qwen3.8 original. El Qwen3-32B es el modelo comercial estandar, con mecanismos de seguridad intactos.

## Limitaciones y advertencias

- Contenido sin filtrar: el modelo puede generar texto ofensivo, ilegal, peligroso o sexualmente explicito. No debe usarse en produccion sin sistemas de moderacion robustos.
- Riesgo de alucinacion: al eliminar los mecanismos de rechazo, el modelo puede afirmar cosas falsas con mayor confianza, ya que no tiene el freno de "no se" o "no puedo ayudar con eso".
- Sesgos amplificados: la ablacion puede eliminar tambien parte del entrenamiento de seguridad, lo que puede amplificar sesgos existentes en los datos de entrenamiento.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el autor del modelo base (AMAImedia) puede tener restricciones adicionales. Verificar la licencia del modelo base.
- Contexto largo: aunque soporta 262K tokens, el uso de contexto completo requiere hardware de alta gama y puede degradar la calidad de las respuestas en los extremos de la ventana.
- Sin garantias: este es un modelo de investigacion. No se proporcionan garantias de precision, seguridad o idoneidad para ningun proposito.

## Enlaces

- Repositorio GGUF (este): https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Aggressive-NOESIS-BF16-i1-GGUF
- Repositorio GGUF estatico: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Aggressive-NOESIS-BF16-GGUF
- Modelo base: https://huggingface.co/AMAImedia/Qwen3.8-27B-Uncensored-Aggressive-NOESIS-BF16
- Repositorio de cuantizaciones de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Blog sobre Qwen3.8-27B Uncensored: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Blog sobre el GGUF abliterado: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Modelo en Ollama: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
