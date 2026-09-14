# BakerBakingThingsIn4Oven/CORe-Pico-V2

## Resumen

CORe Pico V2 es un modelo de lenguaje conversacional compacto de 596.049.920 parametros (aproximadamente 600M), publicado en HuggingFace bajo el identificador `BakerBakingThingsIn4Oven/CORe-Pico-V2`. La model card lo atribuye a CORe Technologies y lo describe como una edicion refinada y orientada a conversacion de la linea Pico. Su proposito es ofrecer un asistente ligero capaz de mantener chat multiturno, responder preguntas directas, emitir llamadas a herramientas en formato estructurado y activar trazas de razonamiento mediante los modos `/think` y `/no_think`.

El modelo emplea una arquitectura de transformer causal con tokenizer BPE de 151.936 tokens y una longitud de contexto de 40.960 tokens, y se distribuye tanto en safetensors (bf16) como en varios formatos GGUF (f16, q8_0, q4_k_m). La etiqueta `qwen3` presente en el repositorio sugiere que la arquitectura subyacente deriva de la familia Qwen3, aunque la informacion proporcionada no confirma de forma explicita el linaje de entrenamiento.

Es relevante ahora por su tamano reducido (se ejecuta en hardware de consumo e incluso en CPU via llama.cpp) combinado con una ventana de contexto inusualmente amplia para su escala y soporte nativo de plantilla de chat y tool calling. La licencia Apache-2.0 facilita su uso comercial e integracion en productos. No obstante, el propio autor advierte de que, a esta escala, el modelo comete errores factuales y aritmeticos y debe tratarse como un punto de partida, no como fuente de verdad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm); etiquetado como qwen3 en el repositorio |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | bf16 (safetensors), GGUF f16, GGUF q8_0, GGUF q4_k_m |
| Idiomas soportados | No disponible (la model card indica "English-first") |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |
| Tokenizer | BPE de 151.936 tokens con plantilla de chat nativa |
| Tamano del repo | 3,4 GB |

## Arquitectura y entrenamiento

La informacion disponible describe un modelo de lenguaje causal de aproximadamente 600M de parametros, con tokenizer BPE de 151.936 entradas y plantilla de chat integrada. La etiqueta `qwen3` del repositorio apunta a una arquitectura derivada de Qwen3, si bien no se detalla en la model card el numero de capas, dimensiones ocultas, configuracion de atencion ni el esquema exacto del transformer. Se carga directamente con `transformers` sin necesidad de codigo personalizado, lo que confirma compatibilidad estandar con la libreria.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. La model card menciona que se trata de una "edicion refinada orientada a conversacion" de la linea Pico, lo que sugiere un ajuste fino sobre una base previa, pero no aporta detalles del pipeline de entrenamiento. Tampoco se documentan innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto conversacional y respuestas directas a preguntas cortas (por ejemplo, "What is the capital of France?" devuelve "Paris").
- Chat multiturno nativo mediante la plantilla de chat embebida.
- Tool calling: emite bloques JSON `<tool_call>` parseables cuando se le proporcionan herramientas.
- Razonamiento extendido opcional: el modo `/think` en el prompt de sistema activa trazas de razonamiento; `/no_think` fuerza respuestas directas.
- Respuestas de identidad consistentes ante formulaciones habituales ("Who are you?", "What model are you?", "Who made you?").
- Compatibilidad con `transformers`, llama.cpp, LM Studio y Ollama (plantilla de chat incluida en los GGUF).
- Capacidades multilingues: no especificadas; la model card indica que esta optimizado para ingles.
- No se documentan capacidades de vision, audio ni otras modalidades.

## Casos de uso

- Asistentes conversacionales ligeros en el borde: con 596M de parametros y contexto de 40.960 tokens, puede desplegarse en dispositivos con recursos limitados o en CPU para gestionar conversaciones multiturno sin depender de infraestructura en la nube.
- Chatbots de soporte con contexto largo: su ventana de 40.960 tokens permite mantener el historial de una conversacion extensa y documentos de referencia en el mismo prompt, util para atencion al cliente basica.
- Automatizacion con tool calling: al emitir bloques `<tool_call>` en JSON, puede integrarse en agentes que invocan APIs, consultan bases de datos o disparan acciones en pipelines automatizados.
- Prototipado rapido y pruebas de concepto: su carga directa con `transformers` y sus variantes GGUF ligeras (q4_k_m de ~0,4 GB) lo hacen adecuado para iterar en local antes de escalar a modelos mayores.
- Razonamiento con control de coste: el modo `/think` permite forzar trazas de razonamiento solo cuando la tarea lo requiere, y `/no_think` reduce latencia y tokens en consultas simples.
- Entornos sin GPU: gracias a los GGUF y a llama.cpp, puede ejecutarse en estaciones de trabajo o servidores sin acelerador dedicado, con un consumo de memoria inferior a 1 GB en cuantizacion q4_k_m.
- Enrutado o preprocesado dentro de sistemas mayores: por su tamano, puede actuar como clasificador o generador de primer nivel que decide si una consulta requiere un modelo mas grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB de pesos en bf16 mas overhead de activaciones y cache KV, lo que situa el consumo tipico en el rango de 2-3 GB; en GGUF q8_0 alrededor de 0,65 GB de pesos; en GGUF q4_k_m alrededor de 0,4 GB de pesos. Estas cifras son estimaciones derivadas del tamano del modelo, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; se puede ejecutar en RTX 3060, RTX 4060, RTX 4090 y superiores. No requiere A100 ni H100, aunque funcionaria en ellas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM, e incluso en CPU.
- Opciones de despliegue: `transformers` (safetensors), llama.cpp, LM Studio y Ollama mediante los archivos GGUF; el repositorio incluye la etiqueta `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CORe Pico V2 | 596M | 40.960 tokens | Apache-2.0 | safetensors, GGUF | Etiquetado qwen3; orientado a conversacion y tool calling |
| Qwen3-0.6B (referencia) | ~600M | No disponible en esta ficha | Apache-2.0 | safetensors, GGUF | Posible base arquitectonica segun la etiqueta qwen3 |
| Modelos ~1B de la misma categoria | ~1.000M | Variable | Variable | Variable | No se dispone de comparativa de rendimiento publicada para CORe Pico V2 |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa fiable con alternativas. La comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Modelo de 600M: el autor advierte explicitamente de que cometera errores factuales, tendra dificultades con la aritmetica e improvisara cuando no sepa algo. No debe usarse como fuente de verdad.
- Riesgo de alucinacion elevado a esta escala; se recomienda verificacion humana en cualquier uso critico.
- Idiomas: optimizado para ingles ("English-first"); no se especifica soporte real para castellano ni otros idiomas.
- Consistencia de identidad: fiable en formulaciones comunes, pero puede desviarse ante redacciones muy inusuales.
- Solo texto: sin capacidades de vision ni audio documentadas.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion, siempre citando los avisos de licencia correspondientes.
- Discrepancia de identificador: el repositorio de HuggingFace es `BakerBakingThingsIn4Oven/CORe-Pico-V2`, mientras que la model card referencia `OpenCOReTechnologies/core-pico-v2`. Conviene confirmar la relacion entre ambos antes de usarlo en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/BakerBakingThingsIn4Oven/CORe-Pico-V2
- Repositorio referenciado en la model card: https://huggingface.co/OpenCOReTechnologies/core-pico-v2
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion disponible.
