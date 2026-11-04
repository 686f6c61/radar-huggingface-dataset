# Privoid-ai/Privoid-Safety-Qwen3.5-0.8B

## Resumen

Privoid-Safety-Qwen3.5-0.8B es un clasificador de seguridad de contenido desarrollado por Privoid-ai. Se trata de un ajuste fino mediante LoRA (con Unsloth) sobre el modelo base Qwen/Qwen3.5-0.8B, un transformer denso de 0,8 mil millones de parámetros. El modelo evalúa tanto mensajes de usuario (prompts) como respuestas de asistentes, devolviendo una puntuación de daño entre 0 y 1 que puede umbralizarse para construir guardarraíles en sistemas de IA generativa.

El problema que resuelve es la moderación de contenido en aplicaciones LLM: detecta violencia y armas, delitos, odio y acoso, contenido sexual con menores o no consentido, fomento de autolesiones, instrucciones peligrosas o ilegales y violaciones de privacidad. Su diseño prioriza no marcar como peligroso contenido que solo lo parece (por ejemplo, "¿cómo mato un proceso de Python?"), lo que reduce los falsos positivos en comparación con clasificadores más grandes.

Es relevante por su tamaño reducido (0,8B) y su orientación a ejecución en dispositivo (on-device), incluyendo CPU de portátil mediante los ficheros GGUF publicados en un repositorio separado. Forma parte de una pila de confianza más amplia de Privoid (Privoid Guard para inyección de prompts, Privoid FactCheck para alucinaciones y Privoid Redact para datos personales).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8 mil millones (modelo base) + adaptador LoRA |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 disponible en repositorio separado; otros no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-0.8B, un transformer denso de 0,8B parámetros, al que se le aplica un ajuste fino con LoRA (Low-Rank Adaptation) usando la librería Unsloth. La tarea resultante es de clasificación de texto: en lugar de generar texto libre, se realiza una única pasada forward y se comparan los logits de los tokens "safe" y "unsafe" para obtener una probabilidad de daño. El prompt de sistema instruye al modelo a decidir si el mensaje es dañino, con instrucciones explícitas de no marcar contenido que solo suena peligroso.

Los datos de entrenamiento provienen de dos conjuntos públicos: nvidia/Aegis-AI-Content-Safety-Dataset-2.0 y allenai/wildguardmix. No se especifica en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación principal es el uso de un modelo base pequeño con un adaptador LoRA para lograr un clasificador de seguridad eficiente en una sola pasada, con umbral ajustable, y su empaquetado en GGUF para inferencia en CPU.

## Capacidades

- Clasificación de seguridad de contenido: evalúa prompts de usuario y respuestas de asistente, devolviendo una puntuación de daño entre 0 y 1.
- Detección de categorías específicas: violencia y armas, delitos, odio y acoso, contenido sexual con menores o no consentido, fomento de autolesiones, instrucciones peligrosas o ilegales y violaciones de privacidad.
- Modo de una sola pasada: no genera texto; compara logits de los tokens "safe" y "unsafe" para producir una probabilidad.
- Umbral configurable: permite ajustar el punto de corte para equilibrar precisión y recall según el caso de uso.
- Ejecución en dispositivo: compatible con llama.cpp mediante GGUF Q8_0, incluyendo CPU de portátil.
- Integración con la pila Privoid: diseñado para combinarse con Privoid Guard, Privoid FactCheck y Privoid Redact.
- Capacidades multilingües: limitadas al inglés (en).
- No se mencionan capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Moderación de prompts en producción: el modelo puede filtrar mensajes de usuario antes de que lleguen al LLM principal, asignando una puntuación de daño y bloqueando aquellos que superen un umbral configurable. Es adecuado por su bajo coste computacional y su capacidad de ejecutarse en una sola pasada.
- Moderación de respuestas generadas: se puede aplicar sobre las salidas del asistente para detectar contenido dañino antes de mostrarlo al usuario, cubriendo categorías como autolesiones, contenido sexual no consentido o instrucciones peligrosas.
- Guardarraíles en aplicaciones de atención al cliente: integrado en un pipeline de chat, permite revisar cada turno de la conversación y escalar o bloquear interacciones problemáticas sin añadir latencia significativa.
- Despliegue en dispositivos de borde: gracias a los ficheros GGUF Q8_0, puede ejecutarse en CPU de portátil o entornos sin GPU, lo que lo hace adecuado para aplicaciones de moderación local y privada.
- Filtrado previo en pipelines de generación aumentada por recuperación (RAG): puede evaluar tanto la consulta del usuario como los fragmentos recuperados o la respuesta final para evitar que contenido dañino se propague en el sistema.
- Evaluación de calidad y seguridad en investigación: sirve como clasificador de referencia para medir tasas de contenido dañino en conjuntos de datos o en salidas de modelos, con la ventaja de ser pequeño y reproducible.
- Complemento en sistemas de confianza multicapa: combinado con Privoid Guard (inyección de prompts) y Privoid Redact (datos personales), permite construir una cadena de guardarraíles especializados y ligeros.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados):

| Test set | Items | Qwen3.5-0.8B (base) | Qwen3Guard-Gen-0.6B (loose) | Granite Guardian 3.2 3B-A800M | Privoid Safety 0.8B |
|---|---|---|---|---|---|
| WildGuardTest prompts (F1) | 1.699 | 70,4 | 86,5 | 77,5 | 87,0 |
| WildGuardTest responses (F1) | 1.709 | 30,8 | 77,3 | 67,8 | 75,0 |
| Aegis 2.0 prompts (F1) | 1.911 | 73,2 | 83,0 | 79,8 | 87,3 |
| Aegis 2.0 responses (F1) | 813 | 67,9 | 83,6 | 75,5 | 86,1 |
| OpenAI Moderation (F1, externo) | 1.655 | 51,7 | 76,3 | 68,3 | 69,7 |
| XSTest (F1, externo) | 450 | 68,9 | 84,6 | 80,5 | 85,5 |

| Modelo | Tamano (B) | F1 medio (6 sets) | F1 medio (2 sets externos) | Falsas alarmas en XSTest |
|---|---|---|---|---|
| Qwen3Guard-Gen-0.6B (loose) | 0,6 | 81,9 | 80,4 | 5,6% |
| Privoid Safety 0.8B | 0,8 | 81,8 | 77,6 | 8,4% |
| Granite Guardian 3.2 3B-A800M | 3,3 | 74,9 | 74,4 | 35,2% |
| Qwen3.5-0.8B (base) | 0,8 | 60,5 | 60,3 | 60,8% |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 0,8B parámetros; en bfloat16 requiere aproximadamente 1,6 GB solo para pesos, más overhead de activaciones y KV cache. En GGUF Q8_0, el consumo es de aproximadamente 0,8-1 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM puede ejecutar el modelo en precisión completa; una RTX 3060, RTX 4060 o superior es suficiente. Para despliegues en servidor, A100 o H100 no son necesarias pero funcionarían.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna (GTX 1650 4GB o superior) y también en CPU.
- Opciones de despliegue: transformers + PEFT (según el ejemplo de la model card), llama.cpp con `llama-server` y ficheros GGUF Q8_0. No se mencionan vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 medio (6 sets) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Privoid Safety 0.8B | 0,8B | no disponible | 81,8 | cc-by-4.0 | HuggingFace (PEFT + GGUF) |
| Qwen3Guard-Gen-0.6B | 0,6B | no disponible | 81,9 (modo loose) | no disponible | HuggingFace |
| Granite Guardian 3.2 3B-A800M | 3,3B (MoE, 800M activos) | no disponible | 74,9 | no disponible | HuggingFace |
| Qwen3.5-0.8B (base) | 0,8B | no disponible | 60,5 | no disponible | HuggingFace |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible, pero al entrenarse sobre datasets públicos de moderación (Aegis 2.0 y WildGuardMix) puede heredar sesgos presentes en dichos conjuntos.
- Riesgo de alucinación: al ser un clasificador de una sola pasada y no un generador, el riesgo de alucinación se manifiesta como clasificaciones erróneas (falsos positivos o falsos negativos), no como texto inventado.
- Limitaciones de contexto o idioma: solo soporta inglés; no se especifica la longitud máxima de contexto, lo que limita la evaluación de conversaciones muy largas.
- Restricciones de licencia: licencia cc-by-4.0, que permite uso comercial con atribución. Es necesario citar al autor y la licencia.
- Caveats para producción: los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente. El umbral de 0,5 usado en las evaluaciones puede no ser óptimo para todos los dominios; se recomienda calibrar. La tasa de falsas alarmas en XSTest es del 8,4%, superior a Qwen3Guard-Gen-0.6B (5,6%), lo que implica cierto riesgo de sobrebloqueo. El modelo requiere un prompt de sistema específico y un formato de mensaje concreto para funcionar correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Privoid-ai/Privoid-Safety-Qwen3.5-0.8B
- Repositorio GGUF: https://huggingface.co/Privoid-ai/Privoid-Safety-Qwen3.5-0.8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Privoid Guard (inyección de prompts): https://huggingface.co/Privoid-ai/Privoid-Guard-Qwen3.5-0.8B
- Privoid FactCheck (alucinaciones): https://huggingface.co/Privoid-ai/Privoid-FactCheck-Qwen3.5-2B
- Privoid Redact (datos personales): https://huggingface.co/Privoid-ai/Privoid-Redact-4B-GGUF
- Dataset Aegis AI Content Safety 2.0: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-2.0
- Dataset WildGuardMix: https://huggingface.co/datasets/allenai/wildguardmix
