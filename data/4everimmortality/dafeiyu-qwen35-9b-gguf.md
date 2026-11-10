# 4everImmortality/dafeiyu-qwen35-9b-gguf

## Resumen

Dafeiyu V2 es un ajuste fino (fine-tune) del modelo Qwen 3.5 9B de Alibaba, desarrollado por el usuario 4everImmortality, orientado a dar vida a una persona virtual de tipo VTuber anime llamada "Dafeiyu" (una chica ballena de pelo azul). El modelo se ha entrenado mediante DoRA (una variante de LoRA) sobre el modelo base y se distribuye exclusivamente en formato GGUF cuantizado en Q4_K_M, pensado para su ejecución en entornos de recursos limitados como una Jetson AGX Orin, donde según el autor está desplegado en producción.

La relevancia de esta ficha es limitada desde el punto de vista de la investigación: se trata de un modelo de rol y personaje con un alcance muy específico, sin datos publicados de benchmarks, sin información sobre el dataset de entrenamiento y con una licencia genérica "other" que no aclara las condiciones de uso comercial. Su interés principal radica en ser un ejemplo de fine-tune de Qwen 3.5 para roleplay con contexto nativo de 256K tokens y compatibilidad directa con llama.cpp y Ollama.

La información disponible en la model card es escasa y proviene únicamente del autor; no hay papers, repositorios asociados ni resultados de evaluación publicados. Todo lo que se detalla a continuación se basa en esa model card y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.5 9B); técnica de ajuste DoRA |
| Parametros totales | 9B (heredados del modelo base Qwen/Qwen3.5-9B) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens (256K), según el autor |
| Tipos de cuantizacion | Q4_K_M (única versión publicada) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | other (sin especificar condiciones) |
| Formato de pesos | GGUF (compatible con llama.cpp y Ollama) |

## Arquitectura y entrenamiento

El modelo parte de Qwen 3.5 9B, un transformer denso de 9.000 millones de parámetros, y se ha ajustado mediante DoRA (Weight-Decomposed Low-Rank Adaptation), una técnica de ajuste eficiente que descompone los pesos en magnitud y dirección para mejorar la estabilidad del entrenamiento respecto a LoRA estándar. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; la model card solo indica que el objetivo es encarnar la persona de la VTuber Dafeiyu.

Un detalle técnico destacable es la conversión con `--no-mtp`, que según el autor elimina la capa draft de Multi-Token Prediction (MTP) del modelo base para evitar errores de desalineación de tensores en llama.cpp. Esto implica que la decodificación especulativa nativa de Qwen 3.5 no está disponible en esta versión GGUF. El resultado es un único archivo Q4_K_M que, según el autor, permite descargar todas las capas en GPU en una Jetson AGX Orin.

## Capacidades

- Generación de texto conversacional en chino e inglés con una persona de rol definida (VTuber anime).
- Roleplay multi-turno con mantenimiento de personaje: identidad, estilo lingüístico (tsundere, informal), preferencias (arroz blanco caliente) y reglas de interacción (cola de ballena que solo puede tocar el "amo").
- Contexto largo de hasta 256K tokens, útil para conversaciones extensas o para inyectar un system prompt detallado.
- Compatibilidad con llama.cpp y Ollama mediante un Modelfile de ejemplo con temperatura 0,7 y top_p 0,9.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada a los dos idiomas declarados; no se garantiza un comportamiento correcto en castellano.

## Casos de uso

- VTuber o asistente virtual de streaming: el modelo puede mantener una conversación en directo con el público manteniendo la persona de Dafeiyu, con respuestas cortas y con "gancho" cómico gracias al estilo tsundere definido en el system prompt.
- Chatbot de comunidad en Discord o Telegram: integrado vía Ollama, puede responder a los miembros del servidor con la voz del personaje y sostener conversaciones multi-turno sin perder el rol.
- Despliegue en hardware de borde: al ser un GGUF Q4_K_M de 9B, cabe en una Jetson AGX Orin con descarga completa en GPU, lo que permite un asistente de personaje local sin dependencia de la nube.
- Prototipado de personajes para juegos o novelas visuales: sirve como base para probar diálogos y personalidad antes de invertir en un modelo mayor o en un pipeline propio.
- Demostración de fine-tuning con DoRA sobre Qwen 3.5: útil como caso de estudio de ajuste de personaje y de conversión a GGUF con `--no-mtp` para llama.cpp.
- Generación de contenido de fan o roleplay creativo en chino: el modelo está entrenado específicamente para ese registro y ese idioma, por lo que es su escenario más natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para Q4_K_M de 9B: aproximadamente 5,5-6,5 GB de pesos, más overhead de contexto KV; con 256K de contexto la caché KV puede crecer de forma significativa y requerir decenas de GB si se llena.
- GPU recomendadas: el autor cita la Jetson AGX Orin (64 GB de memoria unificada) como plataforma de producción; en escritorio, una RTX 4090 (24 GB) o RTX 3090 permiten cargar el modelo completo con contexto amplio.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más si se limita el contexto; en 6 GB solo con contexto muy reducido.
- Opciones de despliegue: Ollama (Modelfile incluido), llama.cpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y del contexto utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Dafeiyu V2 (este) | 9B | 256K | GGUF Q4_K_M | other | Fine-tune de personaje, solo zh/en, sin benchmarks |
| Qwen 3.5 9B (base) | 9B | 256K (según base) | safetensors, GGUF | según Qwen | Modelo generalista, sin persona; referencia directa |
| Fine-tunes de rol de la familia Qwen 2.5/3 | 7B-14B | variable | GGUF | variable | Alternativas habituales para roleplay en llama.cpp; no se dispone de datos concretos verificables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento numérico con alternativas; la comparación se limita a parámetros, contexto, formato y licencia.

## Limitaciones y advertencias

- Sesgos: al ser un fine-tune de personaje entrenado presumiblemente con diálogos sintéticos o de rol, puede reproducir estereotipos de anime/VTuber y un registro lingüístico muy marcado.
- Alucinación: no hay evaluación publicada; en roleplay es esperable que invente detalles coherentes con la persona, lo que puede ser aceptable en ficción pero no en usos informativos.
- Contexto e idioma: solo se declaran chino e inglés; el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Licencia: "other" sin texto de licencia visible; no se puede asumir uso comercial permitido. Además, hereda las condiciones del modelo base Qwen 3.5 9B, que deben consultarse por separado.
- Producción: sin benchmarks, sin dataset documentado y con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por terceros.
- La conversión `--no-mtp` desactiva la decodificación especulativa del base, lo que puede reducir el throughput frente a otras distribuciones GGUF de Qwen 3.5.
- El prompt de sistema incluido contiene reglas de interacción muy específicas (contacto físico, apelativos); debe revisarse antes de exponerlo a usuarios reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/4everImmortality/dafeiyu-qwen35-9b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggml-org/llama.cpp
