# ikedachin/llm-jp-4-8b-thinking-imabari-chikamiyama-v14

## Resumen

Chikamiyama v14 (近見山) es un ajuste fino supervisado de parámetros completos del modelo japonés de razonamiento LLM-jp-4-8B-Thinking, desarrollado por el usuario de HuggingFace ikedachin. Su propósito es especializar un modelo de razonamiento de 8.590 millones de parámetros en el dialecto de Imabari (ciudad de la prefectura de Ehime, Japón) y en japonés estándar, manteniendo la capacidad de generar cadenas de razonamiento explícitas antes de la respuesta final.

El modelo introduce dos mecanismos de control poco habituales: cuatro canales de generación (`analysis_imabari`, `final_imabari`, `analysis`, `final`) que separan el razonamiento de la respuesta final y permiten elegir entre dialecto local y japonés estándar, y tres niveles de esfuerzo de razonamiento (`low`, `medium`, `high`) que se inyectan como instrucción de sistema a través de la plantilla de chat personalizada. Es relevante ahora porque ejemplifica la adaptación de modelos de razonamiento open source a variedades lingüísticas de bajo recurso, un caso de uso cada vez más demandado en comunidades locales y en investigación sociolingüística computacional.

Se distribuye en safetensors con precisión bf16, un repositorio de 17,2 GB y licencia compuesta derivada de los términos del modelo base. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de LLM-jp-4-8B-Thinking) |
| Parametros totales | 8.590.200.832 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | japonés (japonés estándar y dialecto de Imabari) |
| Licencia | other / mixed-upstream-terms (términos combinados del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de LLM-jp-4-8B-Thinking, un transformer decoder-only de 8.590 millones de parámetros orientado a razonamiento en japonés. Sobre esa base se aplicó un ajuste fino supervisado de parámetros completos (full-parameter SFT), sin LoRA ni PEFT, con precisión bf16. El entrenamiento empleó enmascaramiento de pérdida solo en turnos del asistente: los tokens de sistema y usuario se mantienen como contexto, mientras que la pérdida se calcula sobre el razonamiento generado, las respuestas finales y los tokens estructurales del lado del asistente.

Los datos de entrenamiento provienen de cuatro conjuntos propios publicados por el autor (`imabari_wiki_qa_v4_reasoning_effort_llmjp4`, `std_lang_wiki_qa_v4_validated_w_reasoning_effort_llmjp4`, `imabari_wiki_qa_v5_difficult_reasoning_effort_llmjp4` y `std_lang_wiki_qa_v5_difficult_reasoning_effort_llmjp4`), construidos como pares de pregunta-respuesta sobre Wikipedia con anotaciones de esfuerzo de razonamiento, más el dataset `llm-jp/AnswerCarefully` para alineamiento de seguridad. La innovación técnica principal es la plantilla de chat personalizada: convierte los argumentos `valid_channels` y `reasoning_effort` en instrucciones de sistema y permite prefijar el canal inicial de generación mediante `<|channel|>`. El autor advierte explícitamente que ambos mecanismos son condicionantes, no restricciones duras: no garantizan longitud de razonamiento ni precisión. El entorno de entrenamiento declarado es TRL 1.13.0, Transformers 5.17.0, PyTorch 2.14.0, Datasets 5.0.1 y Tokenizers 0.23.2.

## Capacidades

- Generación de texto conversacional en japonés estándar y en dialecto de Imabari.
- Razonamiento explícito en canal separado (`analysis`) antes de la respuesta final (`final`), con modo de pensamiento heredado del modelo base.
- Control de esfuerzo de razonamiento en tres niveles (`low`, `medium`, `high`) mediante instrucción de sistema generada por la plantilla.
- Cuatro canales de salida combinables: razonamiento y respuesta final, cada uno en dialecto o en estándar.
- Canal auxiliar `commentary` disponible en la plantilla.
- Alineamiento de seguridad parcial mediante entrenamiento con `llm-jp/AnswerCarefully`.
- Soporte de conversación multi-turno con preservación de canal por mensaje del asistente.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Asistentes conversacionales locales en Imabari: el modelo puede responder en dialecto de Imabari preservando el razonamiento interno en el canal `analysis_imabari`, útil para servicios municipales o turísticos de la región de Ehime.
- Investigación sociolingüística computacional: permite comparar, con el mismo modelo y prompt, la calidad del razonamiento en dialecto frente a japonés estándar, aislando el efecto de la variedad lingüística.
- Educación y preservación del dialecto: generación de material didáctico y ejemplos de conversación en dialecto de Imabari con explicaciones en japonés estándar en el canal `final`.
- Atención al cliente con control de coste computacional: el nivel `low` reduce tokens de razonamiento para consultas simples, mientras que `high` se reserva para casos complejos, ajustando latencia y consumo.
- Evaluación de modelos de razonamiento en lenguas de bajo recurso: banco de pruebas para medir hasta qué punto el razonamiento entrenado en estándar se transfiere a una variedad dialectal.
- Generación de contenido divulgativo sobre la zona: artículos, guiones o fichas sobre Imabari y su patrimonio a partir de los datasets de QA sobre Wikipedia empleados en el entrenamiento.
- Prototipado de interfaces de chat con canales separados: la plantilla permite construir UIs que muestran el razonamiento plegado y la respuesta final por separado, con selección de idioma y esfuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 17,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 24 GB o más para contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con contexto limitado.
- GPU de consumo: cabe en RTX 4090 y, con cuantización no oficial, potencialmente en GPUs de 16 GB; el autor no publica versiones cuantizadas.
- Despliegue: HuggingFace Transformers con `device_map="auto"` es la vía documentada; el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`, por lo que TGI y endpoints compatibles son opciones plausibles. No se documentan instrucciones para vLLM, llama.cpp ni Ollama.
- Es obligatorio usar el tokenizer distribuido con el modelo, ya que la plantilla de chat personalizada depende de él.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Chikamiyama v14 | 8,59 B | no disponible | ja (estándar + dialecto Imabari) | mixed-upstream-terms | SFT completo, canales y reasoning effort |
| llm-jp/llm-jp-4-8b-thinking | 8,59 B | no disponible | ja | según modelo base | Modelo base sin especialización dialectal |
| Alternativas de 7-8 B en japonés (p. ej. modelos de la familia llm-jp) | ~7-8 B | no disponible | ja | variable | No se dispone de datos comparativos de rendimiento en la información proporcionada |

No se dispone de resultados de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El control de canal y de esfuerzo de razonamiento es orientativo: el autor indica que no restringe estrictamente la salida ni garantiza longitud o precisión del razonamiento.
- El prefijo de canal del asistente fija el canal inicial, pero no asegura que la respuesta final use el canal esperado.
- Riesgo de alucinación inherente a un modelo de 8 B ajustado con SFT sobre datos de QA de Wikipedia; no se documentan evaluaciones de fidelidad.
- Cobertura lingüística limitada al japonés; no se garantiza un comportamiento correcto en otros idiomas.
- Sesgos del dialecto de Imabari y de los datasets de entrenamiento no evaluados; los datos de QA derivan de Wikipedia y pueden arrastrar sesgos de cobertura.
- Licencia `mixed-upstream-terms`: es necesario revisar los términos del modelo base LLM-jp-4-8B-Thinking antes de cualquier uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y el autor lo describe como el primero de una serie de experimentos; no hay evidencia de uso en producción.
- Requiere la plantilla de chat y el tokenizer específicos; usar plantillas genéricas puede degradar el formato de canales.
- No se documentan versiones cuantizadas oficiales, lo que limita el despliegue en hardware modesto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikedachin/llm-jp-4-8b-thinking-imabari-chikamiyama-v14
- Modelo base: https://huggingface.co/llm-jp/llm-jp-4-8b-thinking
- Dataset de entrenamiento: https://huggingface.co/datasets/ikedachin/imabari_wiki_qa_v4_reasoning_effort_llmjp4
- Dataset de entrenamiento: https://huggingface.co/datasets/ikedachin/std_lang_wiki_qa_v4_validated_w_reasoning_effort_llmjp4
- Dataset de entrenamiento: https://huggingface.co/datasets/ikedachin/imabari_wiki_qa_v5_difficult_reasoning_effort_llmjp4
- Dataset de entrenamiento: https://huggingface.co/datasets/ikedachin/std_lang_wiki_qa_v5_difficult_reasoning_effort_llmjp4
- Dataset de seguridad: https://huggingface.co/datasets/llm-jp/AnswerCarefully
