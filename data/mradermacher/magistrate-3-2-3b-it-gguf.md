# mradermacher/magistrate-3.2-3b-it-GGUF

## Resumen

Magistrate 3.2 3B IT es un modelo de lenguaje conversacional de 3.212.756.032 parámetros (aproximadamente 3,2 mil millones) especializado en dominio legal, desarrollado originalmente por el usuario macadeliccc y publicado en Hugging Face. La versión aquí descrita es la cuantización GGUF estática realizada por mradermacher, que facilita su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles. El modelo se construye sobre la arquitectura Llama 3.2 y se afina con Axolotl, incorporando el tag "spectrum" y el sello HFforLegal, lo que indica un enfoque hacia tareas jurídicas.

El modelo resuelve el problema de disponer de un asistente conversacional ligero y ajustado a terminología y razonamiento legal en inglés, con soporte para function calling gracias a los datos de entrenamiento de NousResearch. Su relevancia actual radica en que permite ejecutar un modelo especializado de 3B en hardware de consumo, con cuantizaciones que van desde 1,5 GB (Q2_K) hasta 6,5 GB (f16), lo que lo hace accesible para prototipado, investigación y despliegues locales sin depender de infraestructura en la nube.

La licencia es Llama 3.2, heredada del modelo base, y el idioma declarado es únicamente inglés. No se dispone de información sobre longitud de contexto específica en la documentación proporcionada, por lo que se asume la del modelo base Llama 3.2 (no confirmada en la información disponible).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2, según tags) |
| Parametros totales | 3.212.756.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.2 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamano del repo | 29,3 GB |
| Libreria | transformers |
| Modelo base | macadeliccc/magistrate-3.2-3b-it |
| Dataset de entrenamiento | teknium/OpenHermes-2.5, NousResearch/hermes-function-calling-v1, arcee-ai/The-Tome, cognitivecomputations/SystemChat-2.0 |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.2, un transformer decoder-only con atención causal estándar. El afinamiento se realizó con Axolotl, según los tags de la model card, partiendo del modelo base macadeliccc/magistrate-3.2-3b-it. Los datasets empleados incluyen OpenHermes-2.5 (conversación general), hermes-function-calling-v1 (tool calling), The Tome (datos instructivos diversos) y SystemChat-2.0 (conversaciones con system prompt), lo que sugiere un entrenamiento supervisado orientado a instrucciones y function calling, sin que se documenten detalles sobre RLHF o DPO.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset legal ni innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). El tag "spectrum" y "HFforLegal" indican una orientación a dominio legal, pero la model card no detalla la metodología de especialización. Esta versión concreta es una cuantización estática (quantize_version: 2, output_tensor_quantised: 1, convert_type: hf) realizada por mradermacher; no se ofrecen cuantizaciones ponderadas/imatrix en el momento de la publicación.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento y respuesta a instrucciones en dominio general y legal.
- Soporte de function calling / tool calling (entrenado con hermes-function-calling-v1).
- Capacidad de seguir system prompts (entrenado con SystemChat-2.0).
- Razonamiento multi-paso y uso en agentes (implícito por el entrenamiento con function calling, no verificado con benchmarks).
- Capacidades multilingües limitadas al inglés declarado.
- No se documentan capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- Asistencia legal conversacional: el modelo puede mantener diálogos multi-turno sobre terminología y conceptos jurídicos en inglés, aprovechando su ajuste con datos legales (tags legal y HFforLegal) para tareas de consulta preliminar y orientación.
- Automatización de atención al cliente en despachos: integrado como backend conversacional para responder preguntas frecuentes sobre procedimientos, plazos y documentación, con la ventaja de ejecutarse localmente por su tamaño de 3B.
- Extracción de información estructurada mediante tool calling: el modelo puede invocar funciones para consultar bases de datos de jurisprudencia o generar formularios, gracias a su entrenamiento con hermes-function-calling-v1.
- Prototipado de pipelines de agentes: su soporte de function calling y system prompts permite construir agentes multi-paso para tareas de clasificación documental o resumen de contratos en entornos de desarrollo.
- Despliegue en hardware de consumo: con cuantizaciones Q4_K_M (2,1 GB) puede ejecutarse en portátiles con GPU modesta o incluso CPU, adecuado para demos, pruebas internas y entornos con requisitos de privacidad.
- Generación de borradores de documentos legales: redacción asistida de cláusulas, resúmenes y correspondencia, revisada posteriormente por un profesional, aprovechando el ajuste instructivo.
- Investigación académica sobre modelos pequeños especializados: útil como baseline para estudiar el efecto del ajuste en dominio legal en modelos de 3B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB (Q2_K), 2,1 GB (Q4_K_M), 2,7 GB (Q6_K), 3,5 GB (Q8_0), 6,5 GB (f16), más overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090 para mayor throughput; A100/H100 no necesarias pero válidas para despliegue por lotes.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4-8 GB de VRAM (GTX 1650 4 GB en Q4_K_S, RTX 3060 6 GB en Q6_K, etc.).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui; vLLM y TGI requieren los pesos en safetensors del modelo base, no la versión GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| magistrate-3.2-3b-it-GGUF (este) | 3,2 B | no disponible | llama3.2 | GGUF | Especializado en legal, inglés, tool calling |
| Llama 3.2 3B Instruct | 3,2 B | 128 K (según ficha oficial de Meta) | llama3.2 | safetensors, GGUF | Modelo generalista base, multilingüe |
| Qwen2.5 3B Instruct | 3,1 B | 32 K (según ficha oficial) | Apache 2.0 | safetensors, GGUF | Multilingüe, licencia permisiva |
| Phi-3.5-mini | 3,8 B | 128 K (según ficha oficial) | MIT | safetensors, GGUF | Razonamiento, multilingüe |

La comparación con Llama 3.2 3B Instruct es directa por herencia arquitectónica; Qwen2.5 3B y Phi-3.5-mini se incluyen como alternativas de tamaño similar con licencias más permisivas y mayor cobertura idiomática. No se dispone de datos de rendimiento comparativo para magistrate en benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse con datasets generales (OpenHermes, The Tome) puede heredar sesgos de estos.
- Riesgo de alucinación: elevado en un modelo de 3B, especialmente en dominio legal, donde la precisión es crítica; requiere verificación humana.
- Limitaciones de contexto o idioma: solo inglés declarado; longitud de contexto no confirmada en la documentación.
- Restricciones de licencia: licencia Llama 3.2, que impone condiciones de uso (incluida la política de uso aceptable de Meta y restricciones para empresas con más de 700 millones de usuarios mensuales); revisar antes de uso comercial.
- Caveat para producción: no se han publicado benchmarks; el ajuste legal no está cuantificado; las cuantizaciones Q2/Q3 degradan calidad notablemente; no hay cuantizaciones imatrix/ponderadas disponibles.
- El modelo es una cuantización de terceros (mradermacher); la responsabilidad del ajuste original recae en macadeliccc.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/mradermacher/magistrate-3.2-3b-it-GGUF
- Modelo base: https://huggingface.co/macadeliccc/magistrate-3.2-3b-it
- Página de descargas del cuantizador: https://hf.tst.eu/model#magistrate-3.2-3b-it-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
