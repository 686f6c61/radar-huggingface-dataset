# dassomnath/Dhir-2B-GGUF

## Resumen

Dhir-2B es un modelo de lenguaje compacto de 2,03 mil millones de parámetros desarrollado por ZenteiQ AiTech Innovations (Bengaluru, India) y publicado bajo licencia Apache 2.0. Se trata de un transformer decoder-only denso, preentrenado desde cero, orientado a entornos con recursos limitados y a despliegue completamente offline en dispositivos edge. Su rasgo diferencial es el soporte nativo de inglés y diez lenguas indias (hindi, guyaratí, tamil, bengalí, canarés, malabar, maratí, odia, panyabí y telugu), junto con tool calling integrado y capacidades de traducción Indic ↔ inglés y de lectura de documentos para RAG.

La ficha que nos ocupa, `dassomnath/Dhir-2B-GGUF`, no es el modelo original sino una conversión a formato GGUF realizada por un tercero (dassomnath) a partir del repositorio base `zenteiq/Dhir-2B`. La conversión remapea los tensores al esquema de la arquitectura `qwen3` de llama.cpp, por lo que no requiere código de backend personalizado y puede ejecutarse con las herramientas estándar del ecosistema (llama.cpp, Ollama, llama-cpp-python, AnythingLLM).

Su relevancia actual reside en que ofrece una ventana de contexto de 16 384 tokens y capacidades de agente en un paquete que cabe en GPU de consumo e incluso funciona en CPU, con un archivo Q4_K_M de solo 1,19 GB. Es una opción realista para aplicaciones multilingües indias en producción con restricciones de privacidad o de conectividad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (estructura equivalente a `qwen3` en llama.cpp) |
| Parametros totales | 2,03 B |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 16 384 tokens |
| Tipos de cuantizacion | Q4_K_M (1,19 GB) y F16 (3,78 GB) incluidas; Q8_0, Q5_K_M y Q3_K_M documentadas como generables con `llama-quantize` |
| Idiomas soportados | Inglés, hindi, guyaratí, bengalí, canarés, malabar, maratí, odia, panyabí, tamil, telugu |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo original se distribuye en safetensors) |

## Arquitectura y entrenamiento

Dhir-2B es un transformer decoder-only denso con atención de consultas agrupadas (GQA) con 16 cabezas de query y 8 de key/value, RMSNorm por cabeza sobre Q y K, MLP con activación SwiGLU, RoPE con theta de 1 000 000 y embeddings atados (tied embeddings). Esta estructura es idéntica a la arquitectura `qwen3` implementada en llama.cpp, lo que explica que la conversión a GGUF solo requiera remapear nombres de tensores y extraer el tokenizador BPE y la plantilla de chat Jinja desde `tokenizer.json` y `chat_template.jinja`, sin escribir kernels nuevos.

El modelo fue preentrenado desde cero por ZenteiQ, aunque la información disponible no detalla el volumen de tokens de entrenamiento, la composición del corpus ni si se aplicaron fases de RLHF o DPO. La model card de esta conversión remite al repositorio original para esos detalles. La innovación técnica destacable no está en la arquitectura, que es convencional, sino en el enfoque: un modelo pequeño entrenado específicamente para diez lenguas indias con tool calling nativo y traductor Indic ↔ inglés integrado, y diseñado para ejecución offline.

## Capacidades

- Generación de texto en inglés y diez lenguas indias.
- Traducción nativa Indic ↔ inglés.
- Document QA orientado a RAG (lectura de documentos y respuesta sobre el contenido).
- Tool calling / function calling nativo.
- Conversación multi-turno mediante plantilla de chat Jinja incluida en el GGUF.
- Razonamiento y comprensión del lenguaje en contextos de 16 384 tokens.
- Capacidades de agente y razonamiento multi-paso derivadas del soporte de tool calling.
- Ejecución completamente offline en dispositivos edge.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Atención al cliente en lenguas indias: el modelo puede mantener conversaciones multi-turno en hindi, tamil o bengalí con hasta 16 384 tokens de contexto, suficiente para hilos de soporte largos con historial e información de producto.
- Traducción Indic ↔ inglés en pipelines internos: al tener traducción nativa entre inglés y diez lenguas indias, sirve para localizar documentación, correos o tickets sin depender de servicios externos.
- RAG sobre documentación local: su capacidad de document QA permite montar un lector que responda preguntas sobre manuales, contratos o normativa en entornos sin conectividad.
- Agentes con tool calling en kioscos o dispositivos industriales: el soporte nativo de function calling permite conectar el modelo a APIs locales (consultas de inventario, estado de máquinas) y ejecutar flujos multi-paso.
- Despliegue en hardware modesto: con un Q4_K_M de 1,19 GB cabe en GPU de consumo y funciona en CPU, lo que habilita asistentes en portátiles, mini-PC o Raspberry Pi con llama.cpp u Ollama.
- Procesamiento de datos sensibles con privacidad: al ejecutarse offline, permite clasificar, resumir o extraer información de documentos médicos o legales sin enviar datos a la nube.
- Asistente de escritura multilingüe: generación y corrección de textos en inglés y lenguas indias para redacción de contenido o comunicación interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,2-1,5 GB con Q4_K_M y en torno a 4-4,5 GB con F16, incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradas. Para F16 conviene disponer de 6 GB o más.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo con 4 GB o más; también funciona en CPU-only con `n_gpu_layers=0`.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server` con API compatible con OpenAI), Ollama, llama-cpp-python y AnythingLLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dhir-2B | 2,03 B | 16 384 | Inglés + 10 lenguas indias | Apache 2.0 | GGUF y safetensors |
| Dhir-5B (ZenteiQ) | 5 B | no disponible | Inglés + lenguas indias | no disponible | no disponible |
| EKA-1 (Soket Labs) | 26,3 B | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar con los otros dos modelos de la iniciativa IndiaAI Foundation Models: Dhir-5B, de la misma familia y mayor tamaño, y EKA-1, de 26,3 B parámetros entrenado con unos 7,5 billones de tokens. No se dispone de datos de contexto, licencia ni benchmarks de los dos alternativos para una comparación cuantitativa completa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado principalmente con datos indios e ingleses, es esperable un sesgo hacia esas culturas y una cobertura limitada de otras.
- Riesgo de alucinación: inherente a un modelo de 2 B parámetros; la ventana de contexto de 16 384 tokens no elimina el riesgo de inventar hechos, especialmente en tareas de document QA.
- Limitaciones de idioma: fuera del inglés y las diez lenguas indias listadas, el rendimiento es desconocido y probablemente deficiente; no se documenta cobertura de castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene verificar los términos del modelo base original en el repositorio de ZenteiQ.
- Conversión de terceros: este GGUF lo ha generado dassomnath, no el equipo de ZenteiQ; no hay garantía de equivalencia exacta con los pesos originales ni de mantenimiento futuro.
- Contexto moderado: 16 384 tokens puede ser insuficiente para RAG con documentos muy extensos o conversaciones de agente de muchas iteraciones.
- Sin datos de benchmarks: no hay evidencia publicada de rendimiento que permita validar la calidad frente a alternativas antes de desplegar en producción.
- Modelo de 2 B: capacidad de razonamiento complejo y matemáticas avanzadas limitada en comparación con modelos de mayor tamaño.

## Enlaces

- Repositorio GGUF: https://huggingface.co/dassomnath/Dhir-2B-GGUF
- Modelo base: https://huggingface.co/zenteiq/Dhir-2B
- Ficha oficial en IndiaAI: https://aikosh.indiaai.gov.in/web/models/details/dhir_2b.html
- ZenteiQ: https://www.zenteiq.ai
- Artículo sobre IndiaAI Foundation Models: https://aitecharchive.com/articles/indiaai-foundation-models-eka-1-dhir-2b-dhir-5b
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
