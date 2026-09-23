# CollectionStudio/Mistral-Small-3.1-24B-Instruct-2503

## Resumen

Mistral Small 3.1 24B Instruct (2503) es un modelo de lenguaje multimodal desarrollado por Mistral AI, publicado originalmente bajo licencia Apache 2.0 y redistribuido en este repositorio por el usuario CollectionStudio. Con 24.011.361.280 parámetros y una arquitectura transformer densa de la familia `mistral3`, está afinado por instrucciones a partir de `mistralai/Mistral-Small-3.1-24B-Base-2503` y añade comprensión visual de última generación sobre la base de Mistral Small 3 (2501).

Su principal atractivo es la combinación de una ventana de contexto de 128.000 tokens, capacidades de visión y un tamaño que permite despliegue local: según la model card, cabe en una única RTX 4090 o en un MacBook de 32 GB de RAM una vez cuantizado. Incorpora además capacidades agénticas nativas (function calling y salida JSON) y soporte de decenas de idiomas, lo que lo posiciona como alternativa abierta a modelos propietarios como GPT-4o mini o Claude 3.5 Haiku.

El modelo es relevante ahora porque ofrece rendimiento cercano a los cerrados de su categoría manteniendo pesos abiertos y licencia permisiva, con un tokenizador Tekken de 131.000 entradas. Este repositorio concreto es una copia (0 descargas, 0 likes en el momento de la consulta) cuyo valor es la disponibilidad de los pesos en formato safetensors para su uso con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (`mistral3`), texto + visión |
| Parametros totales | 24.011.361.280 (≈24,01 B) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | No especificados en la model card; pesos publicados en safetensors (la propia model card menciona despliegue cuantizado, pero sin detallar formatos) |
| Idiomas soportados | 24 idiomas en las etiquetas: en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn (la model card añade el griego, lo que elevaría la cifra a 25) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería declarada: vLLM) |
| Tamano del repositorio | 96,1 GB |
| Tokenizador | Tekken, vocabulario de 131.000 entradas |

## Arquitectura y entrenamiento

Se trata de un transformer denso (no MoE, no SSM) con extensión multimodal para entrada de imágenes, construido sobre `Mistral-Small-3.1-24B-Base-2503` y posteriormente afinado por instrucciones. La model card destaca tres ejes de mejora respecto a la versión 2501: comprensión visual de última generación, ampliación del contexto hasta 128.000 tokens sin degradar el rendimiento en texto y un tokenizador Tekken de 131.000 entradas. El modelo mantiene una fuerte adherencia a los system prompts, aspecto clave para aplicaciones agénticas.

No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas concretas de alineación como RLHF o DPO. Tampoco se detallan innovaciones de decodificación (especulativa, atención lineal, etc.). Estos datos deben considerarse **no disponibles** a partir de la model card proporcionada. Lo que sí se documenta es el posicionamiento: capacidades agénticas nativas (function calling y salida JSON) y un modo de razonamiento conversacional avanzado.

## Capacidades

- Generación de texto y razonamiento conversacional avanzado.
- Comprensión visual: análisis de imágenes y razonamiento sobre contenido visual (MMMU 64,00 %, MMMU Pro 49,25 %).
- Razonamiento matemático (MATH 69,30 %) y resolución de problemas.
- Generación de código (HumanEval 88,41 %, MBPP 74,71 %).
- Tool calling / function calling nativo, orientado a agentes.
- Salida estructurada en JSON.
- Razonamiento multi-paso y flujos agénticos.
- Capacidades multilingües en 24-25 idiomas.
- Comprensión de documentos largos gracias a la ventana de 128.000 tokens (DocVQA 94,08 %).
- Fuerte adherencia a system prompts.
- No se menciona soporte de audio ni modo "thinking" explícito.

## Casos de uso

- **Agentes conversacionales de baja latencia:** el soporte nativo de function calling y JSON permite construir asistentes que invocan APIs y devuelven respuestas estructuradas sin post-procesado frágil.
- **Atención al cliente automatizada:** la ventana de 128.000 tokens admite conversaciones multi-turno muy largas e historiales extensos sin truncar el contexto.
- **Análisis de documentos largos:** contratos, informes o expedientes de decenas de miles de tokens (DocVQA 94,08 %) procesados en una sola pasada para extracción y resumen.
- **Procesamiento de documentos escaneados y formularios:** con visión integrada, puede interpretar imágenes de documentos, gráficos (ChartQA 86,24 %) y diagramas (AI2D 93,72 %).
- **Asistente de programación en producción:** HumanEval 88,41 % y MBPP 74,71 % lo hacen viable para autocompletado, revisión de código e integración en pipelines de CI/CD mediante tool calling.
- **Atención al cliente multilingüe:** cobertura de 24 idiomas permite desplegar un único modelo para mercados europeos, asiáticos y de Oriente Medio.
- **Inferencia local con datos sensibles:** al ser Apache 2.0 y caber cuantizado en una RTX 4090, es apto para organizaciones que no pueden enviar datos a APIs externas.
- **Modelo base para fine-tuning especializado:** la licencia permisiva y el tamaño contenido lo hacen adecuado como punto de partida para expertos de dominio.

## Benchmarks y rendimiento

Evaluaciones de preentrenamiento:

| Modelo | MMLU (5-shot) | MMLU Pro (5-shot CoT) | TriviaQA | GPQA Main (5-shot CoT) | MMMU |
|---|---|---|---|---|---|
| **Small 3.1 24B Base** | **81,01 %** | **56,03 %** | 80,50 % | **37,50 %** | **59,27 %** |
| Gemma 3 27B PT | 78,60 % | 52,20 % | **81,30 %** | 24,30 % | 56,10 % |

Evaluaciones de instrucción (texto):

| Modelo | MMLU | MMLU Pro (5-shot CoT) | MATH | GPQA Main | GPQA Diamond | MBPP | HumanEval | SimpleQA |
|---|---|---|---|---|---|---|---|---|
| **Small 3.1 24B Instruct** | 80,62 % | 66,76 % | 69,30 % | **44,42 %** | **45,96 %** | 74,71 % | **88,41 %** | **10,43 %** |
| Gemma 3 27B IT | 76,90 % | **67,50 %** | **89,00 %** | 36,83 % | 42,40 % | 74,40 % | 87,80 % | 10,00 % |
| GPT-4o mini | **82,00 %** | 61,70 % | 70,20 % | 40,20 % | 39,39 % | 84,82 % | 87,20 % | 9,50 % |
| Claude 3.5 Haiku | 77,60 % | 65,00 % | 69,20 % | 37,05 % | 41,60 % | **85,60 %** | 88,10 % | 8,02 % |
| Cohere Aya-Vision 32B | 72,14 % | 47,16 % | 41,98 % | 34,38 % | 33,84 % | 70,43 % | 62,20 % | 7,65 % |

Evaluaciones de visión:

| Modelo | MMMU | MMMU Pro | Mathvista | ChartQA | DocVQA | AI2D | MM MT Bench |
|---|---|---|---|---|---|---|---|
| **Small 3.1 24B Instruct** | 64,00 % | **49,25 %** | **68,91 %** | 86,24 % | **94,08 %** | **93,72 %** | **7,3** |
| Gemma 3 27B IT | **64,90 %** | 48,38 % | 67,60 % | 76,00 % | 86,60 % | 84,50 % | 7,0 |
| GPT-4o mini | 59,40 % | 37,60 % | 56,70 % | 76,80 % | 86,70 % | 88,10 % | 6,6 |
| Claude 3.5 Haiku | 60,50 % | 45,03 % | 61,60 % | **87,20 %** | 90,00 % | 92,10 % | 6,5 |
| Cohere Aya-Vision 32B | 48,20 % | 31,50 % | 50,10 % | 63,04 % | 72,40 % | 82,57 % | 4,1 |

Evaluaciones multilingües (tabla truncada en la información disponible):

| Modelo | Media | Europeo | Asia oriental | Oriente Medio |
|---|---|---|---|---|
| **Small 3.1 24B Instruct** | **71,18 %** | **75,30 %** | **69,17 %** | 69,08 % |
| Gemma 3 27B IT | 70,19 % | 74,14 % | (dato no disponible) | (dato no disponible) |

## Requisitos de hardware

- **PRECISIÓN FP16/BF16:** aproximadamente 48 GB de VRAM (2 bytes por parámetro sobre 24,01 B). Requiere A100 80 GB, H100, o varias GPU consumer.
- **INT8:** alrededor de 24 GB de VRAM; al límite en una RTX 4090 (24 GB) sin margen para caché KV en contextos largos.
- **4-bit (por ejemplo GPTQ/AWQ/GGUF Q4):** aproximadamente 12-14 GB de VRAM; cabe holgadamente en RTX 4090, RTX 4080, RTX 3090 y similares. La model card confirma que cabe en una RTX 4090 o en un MacBook de 32 GB de RAM una vez cuantizado.
- **Caché KV:** a 128.000 tokens de contexto el consumo de caché KV crece de forma notable, por lo que en GPU de 24 GB conviene reducir el contexto o usar cuantización de la caché.
- **Despliegue:** el repositorio declara la librería vLLM; también son opciones habituales llama.cpp, Ollama y TGI, además de `mistral-common` para el preprocesado.
- **Latencia y throughput:** no se proporcionan cifras concretas de latencia o tokens por segundo en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | MMLU | HumanEval | MMMU |
|---|---|---|---|---|---|---|
| **Mistral Small 3.1 24B Instruct** | 24,01 B | 128.000 tokens | Apache 2.0 | 80,62 % | 88,41 % | 64,00 % |
| Gemma 3 27B IT | 27 B | No disponible en la información | No disponible en la información | 76,90 % | 87,80 % | 64,90 % |
| GPT-4o mini | No disponible | No disponible en la información | Propietaria (no disponible) | 82,00 % | 87,20 % | 59,40 % |
| Claude 3.5 Haiku | No disponible | No disponible en la información | Propietaria (no disponible) | 77,60 % | 88,10 % | 60,50 % |
| Cohere Aya-Vision 32B | 32 B | No disponible en la información | No disponible en la información | 72,14 % | 62,20 % | 48,20 % |

Frente a los modelos cerrados de su categoría, Mistral Small 3.1 24B destaca en GPQA, DocVQA, AI2D y MM MT Bench, mientras que GPT-4o mini mantiene ventaja en MMLU y MBPP y Gemma 3 27B domina en MATH. La diferencia clave a favor de Mistral Small 3.1 es la combinación de pesos abiertos con licencia Apache 2.0 y visión integrada.

## Limitaciones y advertencias

- **Alucinación:** el resultado en SimpleQA es del 10,43 %, lo que indica una fiabilidad limitada en preguntas factuales de respuesta corta; conviene verificar hechos en producción.
- **Rendimiento desigual por tarea:** pierde frente a Gemma 3 27B en MATH (69,30 % frente a 89,00 %) y frente a GPT-4o mini y Claude 3.5 Haiku en MBPP.
- **Sesgos:** no se documentan análisis de sesgo en la información proporcionada; debe asumirse el riesgo habitual de los modelos entrenados con datos web.
- **Cobertura idiomática:** aunque se declaran 24-25 idiomas, el rendimiento no está cuantificado por idioma; la tabla multilingüe solo ofrece medias agregadas.
- **Licencia:** Apache 2.0 permite uso comercial y modificación, pero se recomienda revisar los términos de Mistral AI para despliegues empresariales.
- **Repositorio no oficial:** esta copia la mantiene CollectionStudio, no Mistral AI; para uso en producción es preferible referenciar el repositorio original de `mistralai`.
- **Metadatos incoherentes:** la fecha de creación del repositorio figura como 2026-09-23, lo que conviene verificar antes de confiar en los metadatos.
- **Ventana de contexto:** los 128.000 tokens son un máximo teórico; el rendimiento efectivo en contextos extremos puede degradarse y el coste de caché KV es elevado.
- **Cuantización:** los pesos publicados son safetensors en precisión completa; para consumo en una sola GPU consumer es imprescindible cuantizar, lo que puede introducir pérdida de calidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/CollectionStudio/Mistral-Small-3.1-24B-Instruct-2503
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Base-2503
- Blog de Mistral AI sobre Small 3.1: https://mistral.ai/news/mistral-small-3-1/
- Términos y política de privacidad de Mistral AI: https://mistral.ai/terms/
