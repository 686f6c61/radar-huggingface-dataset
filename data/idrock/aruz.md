# idrock/aruz

## Resumen

Aruz es un modelo de lenguaje de 2.221.045.027 parámetros (2,22 B) publicado por el usuario idrock en Hugging Face, derivado de google/gemma-4-E2B-it. Es una adaptación al uzbeko en alfabeto latino con un tokenizer propio de 32.768 tokens, construida en tres fases: preentrenamiento continuado sobre texto uzbeko y ajuste fino posterior para uso de herramientas (tool calling), respuesta anclada a texto recuperado (RAG) y seguimiento de instrucciones. Los pesos se distribuyen en bfloat16 y safetensors bajo licencia Apache 2.0.

Su interés práctico no está en el conocimiento general, sino en dos tareas concretas: emitir llamadas a funciones en uzbeko y responder de forma breve y literal a partir de fragmentos de contexto recuperados, sin cadena de pensamiento. La propia model card lo declara no optimizado para matemáticas, código ni preguntas abiertas de conocimiento, lo que lo sitúa como pieza de infraestructura para asistentes y agentes en uzbeko, no como modelo generalista.

El repositorio no registra descargas ni likes en los metadatos disponibles, no publica resultados de benchmarks y no ofrece versiones cuantizadas (GGUF), por lo que cualquier despliegue en producción exige una validación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 4 (tag `gemma4_text`), sin codificadores de visión ni audio |
| Parámetros totales | 2.221.045.027 (2,22 B) |
| Parámetros activos | no disponible (la información proporcionada no confirma que el modelo base emplee una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16; no se documentan versiones cuantizadas) |
| Idiomas soportados | uzbeko (alfabeto latino); metadato `language: uz` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un transformer decoder-only de la familia Gemma 4. Respecto al modelo base se han sustituido el tokenizer (nuevo vocabulario de 32.768 tokens orientado al uzbeko), se han eliminado los codificadores de visión y audio, y se han seguido entrenando todos los pesos. El resultado es un modelo estrictamente de texto, de 2,22 B de parámetros, publicado en bfloat16 y sin cadena de pensamiento: la generación es corta e inmediata, con decodificación greedy (`do_sample=False`) en el ejemplo de uso de la model card y un límite de 120 tokens nuevos.

El entrenamiento se describe en tres etapas: preentrenamiento continuado sobre texto uzbeko y ajuste fino para uso de herramientas, respuestas fundamentadas en texto recuperado y seguimiento de instrucciones. Los corpus citados son HuggingFaceFW/fineweb-2, murodbek/uz-books, wikimedia/wikipedia y HPLT/HPLT2.0_cleaned. No se especifican el número total de tokens, la composición exacta del dataset ni si se emplearon técnicas de alineación como RLHF o DPO. Como elemento técnico destacable, el modelo define un formato propio de llamada a herramienta mediante tokens especiales (`<|tool_call>call:nombre{...}<tool_call|>`), que debe parsearse desde el texto y no mediante los parsers estándar.

## Capacidades

- Generación de texto en uzbeko (alfabeto latino) con respuestas breves y sin razonamiento explícito.
- Tool calling / function calling mediante el formato propio de tokens especiales, con argumentos estructurados en formato clave-valor.
- Respuesta fundamentada en contexto recuperado (RAG): consume fragmentos con `id`, `title` y `text` y responde a partir de ellos.
- Seguimiento de instrucciones conversacionales multi-turno a través de la plantilla de chat (`apply_chat_template`).
- Integración con la herramienta de referencia `search_knowledge_base`, que según la model card debe declararse siempre junto a otras herramientas para evitar que su nombre se corrompa.
- No cubre matemáticas, generación de código ni preguntas abiertas de conocimiento general, según declara el propio autor.
- Sin capacidades de visión ni audio (los codificadores correspondientes fueron eliminados del modelo base).
- Sin modo de pensamiento (thinking mode): no genera cadena de pensamiento.

## Casos de uso

- Asistentes de atención al cliente en uzbeko: el modelo emite llamadas a `search_knowledge_base` para consultar tarifas, servicios, procedimientos y límites, y después redacta una respuesta breve anclada en los fragmentos devueltos. Es adecuado porque su ajuste principal es precisamente respuesta fundamentada, lo que reduce el riesgo de respuestas inventadas sobre políticas internas.
- Agentes de RAG sobre documentación corporativa: se recuperan fragmentos de un índice vectorial, se inyectan como mensaje de rol `tool` y el modelo compone la respuesta final en uzbeko. Su formato de chunks (`id`, `title`, `text`) está pensado para este flujo.
- Automatización de tareas programadas y recordatorios: con herramientas como `set_reminder`, el modelo traduce una petición en lenguaje natural a una llamada con parámetros `time` y `text`, lo que permite construir un asistente de productividad sin lógica de extracción propia.
- Consulta de datos externos en tiempo real (por ejemplo, meteorología vía `get_weather` con `city` y `date`): el modelo se limita a decidir la herramienta y a rellenar los argumentos, delegando el dato en el servicio.
- Enrutado de intenciones en un backend conversacional: dado su tamaño de 2,22 B y su decodificación greedy, puede desplegarse como clasificador-generador de baja latencia que decide qué función invocar antes de llamar a un modelo mayor.
- Asistentes de voz o IVR para uzbeko: integrado detrás de un motor de reconocimiento y síntesis de voz, genera respuestas cortas y directas en texto, un formato adecuado para turnos hablados breves.
- Servicios públicos y turismo en Uzbekistán: el ejemplo de la model card (precio de entrada al conjunto de Registán para estudiantes) ilustra un caso real de consulta de tarifas y procedimientos con respuesta verificable contra la fuente recuperada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, evaluación de tool calling ni comparaciones cuantitativas con otros modelos, y el repositorio no registra descargas ni likes que permitan inferir validación por parte de la comunidad.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo propio a partir de los 2,22 B de parámetros, no confirmado por el autor): en bfloat16, aproximadamente 4,5 GB solo de pesos y entre 6 y 8 GB contando caché KV y overhead; en int8, en torno a 2,5-3 GB; en int4, en torno a 1,5-2 GB. No se publican pesos cuantizados, por lo que las cifras de int8 e int4 son proyecciones.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM puede ejecutar los pesos en bfloat16. Encajan una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4090 o RTX 5090, así como aceleradores de centro de datos tipo A100, H100 o L40S, en estos últimos con margen amplio para lotes grandes.
- Cabe en GPU de consumo: sí, en tarjetas de 8-12 GB o superiores en bfloat16, y con más holgura si se generan versiones cuantizadas. También es viable la inferencia en CPU por el reducido tamaño del modelo, aunque sin datos de rendimiento publicados.
- Opciones de despliegue: la model card documenta `transformers` (con `AutoModelForCausalLM` y `device_map="auto"`) y `vLLM`. En vLLM advierte explícitamente de no usar `--tool-call-parser gemma4`, porque corrompe los nombres de herramientas con este tokenizer; en su lugar hay que renderizar el prompt con la plantilla de chat, llamar a `/v1/completions` con `skip_special_tokens: false` y parsear la llamada del texto. No se documentan soporte de llama.cpp, Ollama ni TGI, ni hay pesos GGUF en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| idrock/aruz | 2,22 B | no disponible | uzbeko (latino) | Apache 2.0 | Transformers, safetensors, vLLM con salvedades | Sin benchmarks publicados |
| google/gemma-4-E2B-it (base) | no disponible en la información proporcionada (el derivado declara 2,22 B) | no disponible | multilingüe, no detallado | Apache 2.0 | Transformers | Sin datos en la información proporcionada |
| Alternativas de tamaño similar (por ejemplo, familias Qwen2.5 de 1,5-3 B o Llama 3.2 de 1-3 B) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma franja de parámetros. Cualquier elección entre Aruz y otro modelo pequeño debería basarse en una evaluación propia sobre tareas de tool calling y RAG en uzbeko, que es el nicho declarado de este modelo.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo no está ajustado para matemáticas, código ni preguntas abiertas de conocimiento: usarlo fuera de tool calling y RAG degrada la calidad de forma notable.
- Riesgo de alucinación en preguntas abiertas: al no estar entrenado para conocimiento general, puede generar respuestas plausibles pero incorrectas si no se le proporciona contexto recuperado.
- Cobertura monolingüe: solo se declara uzbeko en alfabeto latino; no hay soporte documentado de cirílico ni de otros idiomas.
- Longitud de contexto no documentada, lo que impide planificar conversaciones largas o volúmenes grandes de contexto recuperado sin pruebas previas.
- Fragilidad en el tool calling: la model card advierte de que, si `search_knowledge_base` se declara en solitario, su nombre sale corrupto, y de que el parser `--tool-call-parser gemma4` de vLLM no es utilizable con este tokenizer.
- El parseo de llamadas debe hacerse desde el texto bruto con `skip_special_tokens: false`; omitir este detalle rompe la detección de herramientas.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo es una versión modificada de Gemma 4 E2B de Google (vocabulario sustituido, codificadores de visión y audio eliminados, pesos readiestrados) y no está afiliado ni respaldado por Google.
- Ausencia de versiones cuantizadas y de pesos GGUF en el repositorio, lo que limita el despliegue en entornos ligeros sin trabajo adicional de conversión.
- Repositorio sin descargas ni likes y sin benchmarks publicados: no existe validación externa conocida, por lo que se recomienda evaluar en un conjunto propio antes de producción.
- Sin modo de razonamiento: no es adecuado para tareas que requieran descomposición explícita de problemas o cadena de pensamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/idrock/aruz
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia del modelo base (Gemma 4): https://ai.google.dev/gemma/docs/gemma_4_license
- Datasets citados en la model card: HuggingFaceFW/fineweb-2, murodbek/uz-books, wikimedia/wikipedia, HPLT/HPLT2.0_cleaned
- Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo (los resultados obtenidos correspondían a páginas de ayuda de YouTube y a la comunidad Zhihu, sin relación con el modelo).
