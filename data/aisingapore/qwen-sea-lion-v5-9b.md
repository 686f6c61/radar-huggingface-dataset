# aisingapore/Qwen-SEA-LION-v5-9B

## Resumen

Qwen-SEA-LION-v5-9B es un modelo de lenguaje multimodal desarrollado por AI Singapore (concretamente su AI Products Pillar, con financiación del National Research Foundation de Singapur) como parte de la familia SEA-LION, orientada a las lenguas del sudeste asiático. Se trata de un ajuste fino (post-entrenamiento) del modelo Qwen/Qwen3.5-9B de Alibaba, del que hereda arquitectura, tokenizador, codificador visual y cabeza de predicción multi-token sin modificaciones. El modelo resuelve el problema de la baja cobertura de las lenguas del sudeste asiático en los LLM generalistas, ofreciendo capacidades de razonamiento, visión y agentes en birmano, chino, inglés, indonesio, filipino, malayo, tamil, tailandés y vietnamita.

Técnicamente, es un modelo causal con codificador visual de aproximadamente 9.650 millones de parámetros, con una ventana de contexto nativa de 262.144 tokens extensible a cerca de 1 millón mediante YaRN. Emplea una arquitectura híbrida de Gated DeltaNet y atención con compuertas, pensada para inferencia de alto rendimiento con baja latencia, e incorpora modo de razonamiento (thinking) activado por defecto, predicción multi-token nativa para decodificación especulativa y soporte sólido de tool calling.

Su relevancia actual reside en tres factores: la licencia MIT (plenamente permisiva para uso comercial), la cobertura de nueve idiomas con comprensión cultural y regional específica, y la herencia de las capacidades multimodales de Qwen3.5, que incluyen entrada de texto, imagen y vídeo. Es un modelo de tamaño medio que puede desplegarse en infraestructura de una sola GPU de gama alta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido: Gated DeltaNet + atención con compuertas, con codificador visual |
| Parámetros totales | 9.653.104.368 (≈9,65 mil millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible a ~1M con YaRN |
| Tipos de cuantización | No disponible en la información proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ no confirmadas) |
| Idiomas soportados | Birmano (my), chino (zh), inglés (en), indonesio (id), filipino (fil), malayo (ms), tamil (ta), tailandés (th), vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers) |
| Modelo base | Qwen/Qwen3.5-9B |
| Dataset de ajuste | aisingapore/SEA-Instruct-2602 |
| Modalidades de entrada | Texto, imagen y vídeo |
| Modalidad de salida | Texto |
| Tamaño del repositorio | 19,3 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo hereda íntegramente la arquitectura de Qwen3.5-9B: un transformer causal con codificador visual de fusión temprana (early-fusion) entrenado sobre tokens multimodales, que según el autor alcanza paridad con Qwen3 y supera a Qwen3-VL en benchmarks de razonamiento, código, agentes y comprensión visual. La innovación arquitectónica principal es la combinación híbrida de Gated DeltaNet y atención con compuertas, diseñada para alto throughput y latencia mínima. Incorpora además predicción multi-token (MTP) nativa, que habilita decodificación especulativa para acelerar la inferencia.

El post-entrenamiento lo realizó AI Singapore sobre el modelo ya post-entrenado de Qwen, ajustándolo en inglés y lenguas del sudeste asiático con el dataset SEA-Instruct-2602. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO adicionales. El modelo conserva la plantilla de chat de Qwen/Qwen3.8-27B sin *reasoning effort*, de modo que el modo thinking y el *preserved thinking* están activados por defecto; puede configurarse `preserve_thinking=False` para conservar únicamente el razonamiento posterior al último mensaje del usuario, como en Qwen3.5. El entrenamiento con RL a escala de entornos multiagente (millones de agentes) se menciona como capacidad heredada del modelo base.

## Capacidades

- Generación de texto y razonamiento paso a paso en modo thinking activado por defecto (el razonamiento puede extenderse varios miles de tokens; Qwen recomienda 32.768 tokens de generación para la mayoría de consultas).
- Comprensión multimodal: entrada de texto, imagen y vídeo, con salida de texto.
- Razonamiento, código y matemáticas, heredados del entrenamiento de Qwen3.5.
- Tool calling / function calling sólido, con soporte explícito en vLLM mediante `--enable-auto-tool-choice` y el parser `qwen3_coder`.
- Uso agéntico y razonamiento multi-paso, compatible con Qwen-Agent y Qwen Code.
- Capacidades multilingües nativas en nueve idiomas del sudeste asiático y asiáticos, con comprensión cultural y regional; el modelo base cubre 201 idiomas y dialectos.
- Decodificación especulativa mediante predicción multi-token (MTP) para inferencia más rápida.
- Contexto largo de 262.144 tokens, extensible a ~1M con YaRN, útil para documentos extensos y conversaciones multi-turno prolongadas.
- Control del modo thinking mediante `enable_thinking` en la plantilla de chat, y separación del razonamiento y la respuesta final mediante `parse_response` o el parser `qwen3` de vLLM.

## Casos de uso

- Atención al cliente multilingüe en el sudeste asiático: el modelo puede gestionar conversaciones multi-turno en indonesio, malayo, tailandés, vietnamita o filipino con una ventana de 262.144 tokens, lo que permite mantener historiales largos y contexto de cuenta sin truncar. Su comprensión cultural regional reduce respuestas desalineadas con modismos locales.
- Automatización documental con visión: extracción y resumen de información de facturas, albaranes o formularios escaneados en lenguas locales, aprovechando la entrada image-text-to-text y el modo thinking para razonar sobre tablas y campos ambiguos.
- Agentes de comercio internacional y logística: el ejemplo de la model card (exportación de durian congelado de Medan a Singapur) ilustra el uso para consultas sobre documentación aduanera, tiempos de tránsito y riesgos de cadena de frío, con tool calling para consultar APIs de seguimiento o bases de datos arancelarias.
- Generación y revisión de código en pipelines de CI/CD: gracias al soporte de tool calling y a los parsers de vLLM (`qwen3_coder`), puede integrarse en flujos de revisión automática, generación de tests o resolución de incidencias con acceso a herramientas externas.
- Análisis de vídeo para moderación o monitorización: la entrada de vídeo permite clasificar y describir contenido audiovisual, útil en plataformas de contenido con audiencias en varios países del sudeste asiático.
- Asistentes educativos y de traducción con contexto largo: traducción y adaptación cultural entre inglés, chino y lenguas del sudeste asiático en documentos extensos, apoyándose en el contexto de 262K tokens y en YaRN para corpus de hasta ~1M.
- Investigación en lingüística computacional: evaluación comparativa de rendimiento en lenguas de bajos recursos (birmano, tamil, filipino) con un modelo de licencia MIT, lo que facilita la reproducibilidad y el uso académico sin restricciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona de forma cualitativa que la base Qwen3.5 alcanza paridad con Qwen3 y supera a Qwen3-VL en razonamiento, código, agentes y comprensión visual, pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K u otras) para este ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en safetensors de ~19,3 GB en el repositorio, la inferencia en precisión completa (BF16) requiere en torno a 20 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica, se recomienda al menos 24-32 GB de VRAM para contexto moderado. Con cuantización a 8 bits o 4 bits (si estuviera disponible, no confirmado) el requisito bajaría a rangos de 10-15 GB, pero no se han publicado cuantizaciones oficiales.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegues de producción con contexto largo y modo thinking; L40S o RTX 6000 Ada como alternativas de gama profesional.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con contexto limitado o cuantización; en RTX 3090 (24 GB) de forma similar. En GPUs de 16 GB sería necesaria cuantización, no confirmada oficialmente.
- Opciones de despliegue: transformers (AutoProcessor + AutoModelForImageTextToText), vLLM (`vllm serve` con `--reasoning-parser qwen3`, `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`) y SGLang, según la model card. No se mencionan llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. La arquitectura híbrida Gated DeltaNet y la predicción multi-token (MTP) están diseñadas para alto throughput y baja latencia, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas SEA | Licencia | Multimodal |
|---|---|---|---|---|---|
| Qwen-SEA-LION-v5-9B | ~9,65B | 262.144 (ext. ~1M con YaRN) | 9 idiomas (my, id, fil, ms, ta, th, vi + en, zh) | MIT | Sí (texto, imagen, vídeo) |
| Qwen/Qwen3.5-9B (base) | ~9B | 262.144 (ext. ~1M con YaRN) | 201 idiomas y dialectos | No disponible en la información | Sí |
| Qwen/Qwen3.8-27B | ~27B | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita al modelo base y a la referencia de plantilla de chat citada en la model card, ya que no se dispone de datos de benchmarks ni de especificaciones completas de alternativas de la misma categoría (modelos SEA de otros proveedores) en la información proporcionada. El principal diferenciador de Qwen-SEA-LION-v5-9B frente a su base es el ajuste específico en lenguas del sudeste asiático y la licencia MIT, que facilita el uso comercial sin restricciones.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; como todo modelo entrenado con datos web, es previsible que herede sesgos de sus corpus de entrenamiento, especialmente en lenguas de bajos recursos donde los datos pueden ser escasos y menos curados.
- Riesgo de alucinación: no cuantificado. El modo thinking activado por defecto puede dar una falsa sensación de fiabilidad; conviene validar respuestas factuales, especialmente en dominios especializados y en lenguas con menor cobertura.
- Limitaciones de contexto e idioma: aunque la ventana nativa es de 262.144 tokens, la extensión a ~1M con YaRN puede degradar la calidad; la cobertura se limita a los nueve idiomas declarados, con calidad potencialmente desigual entre ellos (el birmano y el tamil, por ejemplo, suelen tener menos datos que el indonesio o el vietnamita).
- Consumo de tokens en modo thinking: el razonamiento puede extenderse varios miles de tokens, lo que incrementa coste y latencia; es necesario ajustar `max_new_tokens` (Qwen recomienda 32.768) y considerar desactivar el thinking para tareas simples.
- Restricciones de licencia: la licencia MIT es permisiva y permite uso comercial, modificación y redistribución con atribución; no obstante, deben respetarse las condiciones de la licencia del modelo base Qwen3.5 si se redistribuyen pesos derivados.
- Caveats para producción: no hay cuantizaciones oficiales publicadas, lo que limita el despliegue en GPUs de consumo; el soporte de tool calling depende de parsers específicos de vLLM (`qwen3_coder`); y el modelo tiene pocas descargas y likes en el momento de la ficha, por lo que la validación comunitaria es aún escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-9B
- Colección SEA-LION v5: https://huggingface.co/collections/aisingapore/sea-lion-v5-6afab40ea2b5b627e9930703
- Sitio oficial de SEA-LION: https://sea-lion.ai
- Modelo base Qwen/Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base (pre-entrenamiento) Qwen/Qwen3.5-9B-Base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Plantilla de chat de referencia Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de ajuste: https://huggingface.co/datasets/aisingapore/SEA-Instruct-2602
- Licencia MIT: https://mit-license.org/
