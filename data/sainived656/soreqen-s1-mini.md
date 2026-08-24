# sainived656/soreqen-s1-mini

## Resumen

SoreQen S1 Mini es un asistente conversacional bilingüe (inglés e hinglish) desarrollado por ZorQelis AI y publicado por el usuario sainived656. Se trata de un ajuste fino mediante LoRA de rango 16 (r=16) sobre el modelo base Qwen/Qwen3.5-0.8B, entrenado con 17.044 ejemplos supervisados centrados en la identidad del asistente y en conversación en inglés e hinglish romanizado. Con 852,985,920 parámetros totales (0,85 B), conserva intactas las capacidades del modelo base: ventana de contexto de 262,144 tokens, vocabulario de 248,320 entradas, torre de visión congelada, modo de pensamiento (thinking), tool calling y salida estructurada.

El ajuste se limita a la capa de lenguaje; el encoder de visión, el proyector multimodal y las tablas de embeddings no reciben gradiente durante el entrenamiento. El chat template, el tokenizador y el vocabulario permanecen sin cambios. Su relevancia radica en ofrecer un asistente pequeño, desplegable en hardware de consumo (1,7 GB de VRAM) y adaptado al mercado indio, con mejoras verificadas en identidad del asistente, tool calling y salida estructurada respecto al modelo base, aunque con una ligera pérdida en razonamiento y seguimiento de instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-0.8B) con LoRA r=16 sobre la capa de lenguaje |
| Parametros totales | 852.985.920 (0,85 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF disponible (repo soreqen-s1-mini-GGUF) |
| Idiomas soportados | ingles, hinglish (escritura romanizada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

SoreQen S1 Mini parte del modelo base Qwen/Qwen3.5-0.8B, un transformer multimodal con torre de visión, proyector y tablas de embeddings. El ajuste consiste en una única adaptación LoRA de rango 16 aplicada exclusivamente a la capa de lenguaje del modelo; el encoder de visión, el proyector multimodal y los embeddings se mantienen congelados (sin gradiente). El entrenamiento se realizó mediante aprendizaje supervisado (SFT) sobre 17,044 ejemplos que cubren la identidad del asistente y conversación en inglés e hinglish romanizado. No se emplearon técnicas de RLHF ni DPO; el chat template, el tokenizador, el vocabulario y la ventana de contexto (262,144 tokens) se heredan sin modificación del base.

La innovación destacable es que la identidad del asistente queda codificada en los pesos: el modelo responde correctamente a preguntas de identidad incluso sin system prompt (6/6 aciertos frente a 0/6 del base). Además, el ajuste mejora el tool calling (de 0/2 a 2/2) y la salida estructurada (de 1/2 a 2/2) respecto al base, sin tocar el código de estas funcionalidades, que se heredan tal cual.

## Capacidades

- Generación de texto bilingüe: inglés e hinglish en escritura romanizada, adaptando el registro (coloquial o profesional) según el usuario.
- Razonamiento paso a paso: modo de pensamiento (thinking mode) heredado del base, activable mediante `enable_thinking=True` en el chat template.
- Tool calling / function calling: soportado y mejorado por el ajuste (2/2 aciertos vs 0/2 del base).
- Salida estructurada: generación de JSON y otros formatos estructurados (2/2 aciertos vs 1/2 del base).
- Visión multimodal: torre visual presente y congelada; el modelo puede procesar imágenes, aunque no fue entrenado específicamente para ello.
- Contexto largo: 262,144 tokens de ventana, útil para conversaciones multi-turno o documentos extensos.
- Respuestas directas: entrenado para responder sin preámbulos ("Sure!", "Great question") y con formato de respuesta primero, detalle después.

## Casos de uso

- **Atención al cliente en mercados indios**: el modelo gestiona conversaciones multi-turno en hinglish romanizado, el idioma coloquial predominante en la India, con una ventana de 262,144 tokens que permite mantener el historial completo de la sesión. Su registro coloquial lo hace adecuado para soporte de apps de consumo.
- **Soporte técnico de primer nivel**: puede responder consultas como "yaar laptop slow ho gaya hai, kya karu?" con respuestas directas y en el registro del usuario, reduciendo la fricción en entornos de soporte informático.
- **Chatbots de identidad de marca**: su identidad está codificada en los pesos (funciona sin system prompt), lo que permite desplegar asistentes con personalidad definida sin depender de la inyección de prompts externos.
- **Integración con tool calling en pipelines**: al soportar function calling, puede conectarse a APIs externas (búsqueda, bases de datos, acciones) en flujos de agente, aunque con la limitación de su tamaño pequeño.
- **Extracción de salida estructurada**: genera JSON u otros formatos estructurados de forma fiable (2/2 en las pruebas del autor), útil para pipelines de extracción de datos en aplicaciones ligeras.
- **Despliegue en hardware de consumo**: con 1,7 GB de VRAM, puede ejecutarse en GPUs de consumo (RTX 3060, 4070) o incluso en CPU mediante GGUF, adecuado para prototipado rápido o aplicaciones en dispositivos con recursos limitados.
- **Educación y tutoría bilingüe**: asistente de estudio que responde en hinglish para estudiantes de habla hindú con nivel de inglés limitado, con contexto largo para mantener el hilo de la conversación.
- **Generación de contenido en hinglish**: creación de textos, publicaciones o respuestas en hinglish romanizado para redes sociales o blogs, con control de registro.

## Benchmarks y rendimiento

El autor no ha publicado resultados en benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.). En su lugar, presenta una evaluación interna comparando el modelo con el base (adaptador ON vs OFF) en dimensiones funcionales, ejecutada dos veces con la misma semilla:

| Dimension | SoreQen | Base | Verdict |
|---|---|---|---|
| Identidad (con system prompt) | 6/6 | 5/6 | mejor |
| Identidad (sin system prompt) | 6/6 | 0/6 | mejor |
| Hinglish romanizado | 12/12 | 12/12 | igual |
| Hinglish code-mixed | 8/12 | 8/12 | igual |
| Hinglish informativo | 10/12 | 9/12 | mejor |
| Hinglish artefacto | 3/3 | 3/3 | igual |
| Razonamiento | 4/5 | 5/5 | peor |
| Conocimiento | 4/4 | 4/4 | igual |
| Pensamiento (thinking) | 2/2 | 2/2 | igual |
| Tool calling | 2/2 | 0/2 | mejor |
| Salida estructurada | 2/2 | 1/2 | mejor |
| Seguimiento de instrucciones | 1/2 | 2/2 | peor |
| Longitud media de respuesta | 104 palabras | 95 palabras | mayor |

No se han publicado resultados de benchmarks estandarizados en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: ~1,7 GB para inferencia (según LLM Explorer).
- **GPU recomendadas**: cualquier GPU consumer con 4 GB o más (RTX 3060 8 GB, RTX 4070, RTX 4090). También ejecutable en CPU con cuantización GGUF.
- **Cabe en GPU consumer**: sí, incluso en las más modestas (GTX 1660 6 GB, RTX 3050 4 GB) con cuantización.
- **Opciones de despliegue**: Transformers (AutoModelForImageTextToText), vLLM, TGI, llama.cpp, Ollama (mediante GGUF).
- **Latencia y throughput**: no disponibles en la información proporcionada; al ser un modelo de 0,85 B, se espera latencia baja en GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| **SoreQen S1 Mini** | 0,85 B | 262,144 tokens | Apache 2.0 | safetensors, GGUF | LoRA sobre Qwen3.5-0.8B, bilingüe EN/Hinglish |
| **Qwen/Qwen3.5-0.8B** (base) | ~0,8 B | 262,144 tokens | Apache 2.0 | safetensors | Sin ajuste; identidad, tool calling y salida estructurada inferiores |
| **SoreQen S1 Mega** | ~4 B | no disponible | Apache 2.0 | no disponible | Variante mayor del mismo autor; 9,1 GB de VRAM |

El SoreQen S1 Mini se distingue del base por la mejora en identidad, tool calling y salida estructurada, con una ligera pérdida en razonamiento y seguimiento de instrucciones. Respecto al S1 Mega (4 B), el Mini es significativamente más ligero y desplegable en hardware de consumo, aunque el Mega ofrecerá probablemente mejor calidad general (no hay datos de rendimiento disponibles para esta comparación).

## Limitaciones y advertencias

- **Alucinaciones numéricas**: al ser un modelo pequeño, tiende a afirmar con confianza cifras que no puede verificar; no es fiable para precios, tasas o aritmética.
- **Escritura romanizada**: el hinglish se genera solo en escritura romana; no produce Devanagari.
- **Razonamiento degradado**: el ajuste reduce el rendimiento en razonamiento (4/5 vs 5/5 del base) y en seguimiento de instrucciones (1/2 vs 2/2).
- **No apto para uso profesional**: entrenado para conversación, no para consejo profesional, médico, legal o de seguridad crítica.
- **Capacidad de visión no verificada**: la torre visual está congelada y no se ha validado su comportamiento en esta variante (existe un script de verificación en `scripts/vision_canary.py`).
- **Sin benchmarks estandarizados**: no se han publicado resultados en MMLU, HumanEval, GSM8K, etc., lo que dificulta la comparación objetiva con otros modelos.
- **Riesgo de sesgo**: al estar entrenado con ejemplos en hinglish romanizado, puede reflejar sesgos del dataset de entrenamiento, no documentados por el autor.

## Enlaces

- [Repositorio HuggingFace (sainived656/soreqen-s1-mini)](https://huggingface.co/sainived656/soreqen-s1-mini)
- [Repositorio HuggingFace GGUF (soreqen-s1-mini-GGUF)](https://huggingface.co/sainived656/soreqen-s1-mini-GGUF)
- [Ficha en LLM Explorer](https://llm-explorer.com/model/sainived656%2Fsoreqen-s1-mini,3lW7NRh8msRLhRxtCDH1HD)
- [Modelo base Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Ficha de SoreQen S1 Mega en LLM Explorer](https://llm-explorer.com/model/sainived656%2Fsoreqen-s1-mega,5trtUWUedFnWhCe6lgoCTn)
