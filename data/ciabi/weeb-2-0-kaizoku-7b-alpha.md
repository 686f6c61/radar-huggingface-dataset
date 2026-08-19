# ciabi/Weeb-2.0-Kaizoku-7B-Alpha

## Resumen

Weeb-2.0-Kaizoku-7B-Alpha es un modelo de lenguaje experimental, desarrollado por el usuario ciabi, que consiste en un fine-tuning del modelo Qwen2.5-7B-Instruct mediante la técnica LoRA. El objetivo es emular la personalidad y el conocimiento de un otaku de anime y manga, ofreciendo conversación casual, trivia sobre series y roleplay con voces de personajes. El modelo se distribuye en formato GGUF, optimizado para su uso con llama.cpp y Ollama, lo que facilita su despliegue en entornos locales y de consumo.

La relevancia de este modelo radica en su enfoque de nicho: mientras que los modelos generalistas cubren un amplio espectro de tareas, este se especializa en un dominio cultural concreto, aprovechando la base instructiva de Qwen2.5 para mantener coherencia conversacional. Sin embargo, se encuentra en fase Alpha, con limitaciones conocidas en cuanto a precisión factual y ausencia de evaluaciones formales. A pesar de ello, representa un ejemplo práctico de fine-tuning eficiente con Unsloth sobre un modelo base potente, demostrando cómo adaptar un LLM a una comunidad específica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 (según safetensors del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredado del base, no confirmado) |
| Tipos de cuantizacion | no disponible (solo se indica formato GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (convertido con Unsloth) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder con atención causal estándar y una ventana de contexto nativa de 128K tokens (aunque no se confirma si se mantiene tras el fine-tuning). El entrenamiento se realizó mediante LoRA con rango 32 y alpha 64, aplicado a todos los módulos, usando la herramienta Unsloth Studio. El dataset de entrenamiento comprende aproximadamente 18.500 conversaciones ensambladas a partir de datasets públicos de Hugging Face, que incluyen perfiles de personajes, preguntas y respuestas sobre trivia y lore de anime, citas icónicas, diálogos guiados por personalidad, sinopsis de tramas y recomendaciones, así como conversaciones de roleplay filtradas. No se menciona el uso de RLHF, DPO u otras técnicas de alineación adicionales. La conversión a GGUF se realizó también con Unsloth, lo que garantiza compatibilidad con llama.cpp y derivados.

## Capacidades

- Generacion de texto conversacional con personalidad otaku, incluyendo expresiones y referencias típicas del anime.
- Conocimiento enciclopedico sobre anime y manga, aunque limitado a la cobertura del dataset de entrenamiento.
- Roleplay con voces de personajes, adaptando el estilo de diálogo según el contexto.
- Respuesta a preguntas sobre tramas, personajes y recomendaciones de series.
- Soporte para conversaciones multi-turno gracias a la arquitectura instructiva del base.
- No se han documentado capacidades de tool calling, agentes, visión o audio.

## Casos de uso

- Chatbot de entretenimiento para comunidades de anime: el modelo puede integrarse en servidores de Discord o Telegram para mantener conversaciones informales sobre series, responder dudas de fans y generar discusión temática, aprovechando su tono desenfadado y conocimiento del dominio.
- Generacion de guiones de roleplay: escritores aficionados pueden usarlo para crear diálogos entre personajes de anime, simulando interacciones coherentes con la personalidad de cada uno, lo que facilita la creación de fanfiction o juegos de rol por texto.
- Asistente de recomendaciones personalizadas: en tiendas online de merchandising o plataformas de streaming, el modelo puede sugerir series basándose en las preferencias del usuario, explicando sinopsis y puntos fuertes de cada obra.
- Practica de conversacion en japones: aunque el idioma principal no está especificado, al estar entrenado con diálogos que incluyen préstamos japoneses, podría servir como herramienta de inmersión para estudiantes de japonés interesados en el registro coloquial del anime.
- Creacion de contenido para redes sociales: generacion de respuestas ingeniosas o memes textuales relacionados con anime, que los community managers pueden adaptar para sus cuentas.
- Demo educativa sobre fine-tuning: sirve como caso de estudio para desarrolladores que quieran aprender a adaptar un LLM base a un dominio específico con LoRA, mostrando el flujo completo desde el dataset hasta el despliegue con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo no ha sido evaluado formalmente mas alla de la calidad conversacional y de personaje, por lo que no existen metricas comparables (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- El repositorio pesa 4.7 GB, lo que sugiere una cuantizacion de 4 bits (probablemente Q4_K_M o similar) para el archivo GGUF.
- Con esa cuantizacion, la inferencia puede ejecutarse en GPUs de consumo con al menos 6-8 GB de VRAM, como una RTX 3060, RTX 4060 o superior.
- Tambien es posible ejecutarlo en CPU mediante llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (incluye Modelfile), y cualquier backend compatible con GGUF como LM Studio o kobold.cpp.
- No se proporcionan datos de latencia o throughput especificos.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de roleplay o nicho anime. El modelo es un fine-tune de Qwen2.5-7B-Instruct, por lo que comparte arquitectura y tamaño con el base, pero no se han publicado evaluaciones que permitan contrastar su rendimiento con alternativas como MythoMax, Noromaid o modelos especificos de rolplay. La licencia tampoco esta definida, lo que dificulta su uso en entornos comerciales.

## Limitaciones y advertencias

- Conocimiento limitado a los datos de entrenamiento: puede alucinar "hechos" sobre series menos conocidas o recientes, ya que el dataset no cubre todo el universo anime.
- Sesgo linguistico: el autor advierte que la personalidad puede abusar de un conjunto fijo de prestamos japoneses debido a repeticion de plantillas en el dataset, lo que puede resultar monotono o poco natural.
- Sin evaluacion formal: no hay garantias sobre su comportamiento en tareas fuera de la conversacion casual y el roleplay.
- Licencia no especificada: el uso comercial es incierto; se recomienda contactar con el autor antes de integrarlo en productos.
- Fase Alpha: se esperan errores de canon y respuestas inconsistentes, especialmente en interacciones largas.
- No soporta herramientas externas ni tareas estructuradas; su uso se limita a generacion de texto libre.

## Enlaces

- [HuggingFace: ciabi/Weeb-2.0-Kaizoku-7B-Alpha](https://huggingface.co/ciabi/Weeb-2.0-Kaizoku-7B-Alpha)
- [Unsloth (herramienta de entrenamiento y conversion)](https://github.com/unslothai/unsloth)
