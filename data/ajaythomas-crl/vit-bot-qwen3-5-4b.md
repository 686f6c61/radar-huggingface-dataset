# Ajaythomas-crl/vit-bot-qwen3.5-4b

## Resumen

VIT Bot es un ajuste fino (fine-tune) del modelo Qwen3.5-4B desarrollado por Ajaythomas-crl, orientado a reproducir la cultura estudiantil de la Vellore Institute of Technology (VIT) en la India. Se trata de un proyecto de aprendizaje que cubre el flujo completo de trabajo: construcción de dataset por destilación, ajuste QLoRA, exportación a GGUF y servicio local. El modelo no busca competir en capacidades generales, sino especializarse en un nicho muy concreto mediante cinco modos de persona seleccionados por system prompt fijo.

Técnicamente es un adaptador LoRA de rango 16 sobre el modelo base Qwen3.5-4B, con aproximadamente 21,2 millones de parámetros entrenables (un 0,47 % del total). El repositorio incluye tres artefactos: el modelo fusionado en GGUF Q4_K_M (2,6 GB), el adaptador LoRA en GGUF f16 (41 MB) y el adaptador PEFT en safetensors (85 MB). La licencia es Apache 2.0 y el único idioma declarado es el inglés.

Su relevancia es limitada fuera del contexto VIT: es un ejemplo didáctico de cómo construir un chatbot de persona con recursos mínimos (una RTX 4060 Laptop de 8 GB y 40 minutos de entrenamiento) y de cómo empaquetar el resultado para consumo local con llama.cpp, LM Studio u Ollama. No es un modelo para producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-4B) con adaptador LoRA |
| Parametros totales | 21.233.664 (según safetensors del adaptador); el modelo base Qwen3.5-4B no se detalla en la información disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (longitud máxima de entrenamiento: 1024 tokens) |
| Tipos de cuantizacion | GGUF Q4_K_M (modelo fusionado); LoRA en GGUF f16; adaptador PEFT en safetensors |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT), GGUF (modelo fusionado y LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer decoder-only del que la información disponible no detalla capas, dimensiones ni mecanismos de atención. Sobre él se aplica un ajuste QLoRA en 4 bits con Unsloth, ejecutado en una única RTX 4060 Laptop con 8 GB de VRAM durante 40 minutos. El adaptador LoRA usa r=16, alpha=16 y se aplica a todas las proyecciones MLP más q/k/v/o en las capas de atención completa, sumando unos 21 millones de parámetros entrenables (0,47 % del total). El entrenamiento consta de 2 épocas, 820 pasos, batch efectivo de 8, learning rate 2e-4 con schedule coseno, pérdida calculada solo sobre tokens del asistente y longitud máxima de 1024 tokens. La pérdida de validación bajó de 2,59 a 2,35 sin repuntes al final; la segunda época aportó poco, por lo que se detuvo ahí.

El dataset consta de 3.449 ejemplos de chat distribuidos por modo: senior 1.146, ffcs 674, lawyer 619, excuse 613 y redtag 397. Se generó por destilación: las preguntas provienen de publicaciones públicas de r/Vit obtenidas vía el archivo Arctic Shift, y un modelo profesor mayor (GLM-5.3) redactó las respuestas de persona usando las mejores respuestas de los hilos como contexto privado. No se usaron comentarios reales de forma literal como objetivos de entrenamiento, y se eliminaron nombres de usuario, correos, teléfonos, números de registro, enlaces y personal docente nombrado. El dataset no se publica.

## Capacidades

- Generación de texto conversacional en inglés con cinco modos de persona fijos: `/senior`, `/lawyer`, `/excuse`, `/ffcs` y `/redtag`.
- Modo `/senior`: respuestas sarcásticas de un estudiante veterano a un novato, con un consejo útil al final.
- Modo `/lawyer`: argumentación dramática y humorística sobre asistencia a clase con "precedentes" absurdos.
- Modo `/excuse`: generación de una excusa verosímil en el contexto VIT.
- Modo `/ffcs`: lectura profética de horarios y slots al estilo horóscopo.
- Modo `/redtag`: juego de texto por turnos con final claro de victoria o derrota.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá del juego por turnos.
- Multilingüe: no; solo inglés.
- El modelo fue entrenado para responder directamente, con el modo de pensamiento desactivado (`enable_thinking=False`).

## Casos de uso

- Chatbot de comunidad universitaria: desplegado en un grupo de Telegram o Discord de estudiantes VIT para responder con humor a dudas sobre FFCS, VTOP, CAT/FAT o asistencia, usando los system prompts exactos de cada modo.
- Demostración didáctica de fine-tuning: sirve como material de referencia para talleres que expliquen el ciclo completo de destilación, QLoRA, exportación a GGUF y servicio local con llama.cpp.
- Generación de contenido humorístico sobre cultura estudiantil: el modo `/lawyer` produce parodias de alegatos sobre asistencia que pueden usarse en publicaciones o vídeos de la comunidad.
- Juego conversacional ligero: el modo `/redtag` funciona como minijuego de texto por turnos para entretenimiento en bots de mensajería.
- Asistente de consulta de horarios con tono lúdico: el modo `/ffcs` interpreta slots y planes de curso de forma dramatica, útil como capa de presentación sobre datos reales de horario.
- Prueba de concepto de adaptadores LoRA en producción local: el LoRA GGUF de 41 MB permite aplicar la persona sobre un Qwen3.5-4B Q4_K_M ya desplegado sin duplicar el modelo base, útil para evaluar la técnica de carga dinámica de adaptadores con `--lora` en llama.cpp.
- Ejemplo de moderación con capa de seguridad: el autor documenta que su bot de Telegram antepone una respuesta fija con línea de ayuda (Tele-MANAS 14416) a los mensajes de autolesión, lo que sirve como patrón de despliegue responsable para bots de persona.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato de rendimiento documentado es la velocidad de inferencia: aproximadamente 14 tokens por segundo en 12 hilos de CPU de portátil con el GGUF Q4_K_M, y considerablemente más rápido en GPU (sin cifra concreta).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo fusionado Q4_K_M ocupa 2,6 GB en disco, por lo que la inferencia cuantizada cabe holgadamente en GPUs de 6-8 GB.
- GPU recomendadas: no se especifican; el entrenamiento se realizó en una RTX 4060 Laptop de 8 GB, lo que da una referencia del mínimo práctico para ajuste.
- Cabe en GPU de consumo: sí, con el GGUF Q4_K_M en tarjetas de 6 GB o más; también funciona en CPU (14 tok/s con 12 hilos).
- Opciones de despliegue: llama.cpp (`llama-cli` con `--jinja --reasoning-budget 0`), LM Studio y Ollama; el adaptador PEFT en safetensors es compatible con Transformers y Unsloth.
- Latencia y throughput: ~14 tokens/s en CPU de portátil con 12 hilos; sin datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| VIT Bot (Qwen3.5-4B fine-tune) | ~21M entrenables sobre base 4B | no disponible | Apache 2.0 | Hugging Face, GGUF y LoRA | Especializado en cultura VIT, solo inglés |
| Qwen3.5-4B (base) | 4B (clase) | no disponible | no disponible en la información | Hugging Face | Modelo generalista del que deriva este fine-tune |
| Adaptadores de persona LoRA genéricos | variable | variable | variable | Hugging Face | No hay datos concretos de comparación en la información disponible |

No se dispone de información sobre modelos comparables de la misma categoría (chatbots de nicho universitario) ni de datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Estilo sobre hechos: el modelo aprende el tono y el folclore VIT, pero al ser un modelo de 4B inventa con confianza detalles como rutas, normas u horarios. No debe usarse como fuente fiable para información práctica.
- Insulta por diseño, incluso en temas delicados; es un bot de broma, no un orientador. En despliegues públicos debe anteponerse una respuesta fija con línea de ayuda (en India, Tele-MANAS 14416) ante mensajes de suicidio o autolesión.
- Solo responde correctamente con los cinco system prompts exactos documentados; otras formulaciones derivan hacia un asistente genérico.
- Idioma limitado al inglés; no hay soporte multilingüe.
- Longitud de entrenamiento de 1024 tokens; el contexto efectivo real puede ser menor que el del modelo base.
- Proyecto no oficial, sin afiliación ni respaldo de VIT.
- El dataset no se publica, lo que dificulta la auditoría y la reproducibilidad.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Qwen3.5-4B antes de un uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ajaythomas-crl/vit-bot-qwen3.5-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- GGUF del modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Archivo Arctic Shift (fuente de preguntas): no disponible enlace directo en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
