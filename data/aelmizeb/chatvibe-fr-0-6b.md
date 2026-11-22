# aelmizeb/chatvibe-fr-0.6b

## Resumen

chatvibe-fr-0.6b es un modelo de lenguaje especializado en el análisis de mensajes de chat de la comunidad gamer francófona. Desarrollado por el usuario aelmizeb, se construye como un ajuste fino mediante LoRA sobre Qwen/Qwen3-0.6B, un transformer denso de aproximadamente 596 millones de parámetros. Su tarea no es la generación de texto libre, sino la clasificación estructurada: recibe un mensaje de chat y devuelve una ficha JSON con la emoción detectada, un nivel de intensidad, una marca booleana de ironía y un icono asociado.

El modelo aborda un problema concreto y poco cubierto: interpretar argot francés de internet («c'est chaud», «jpp», «wesh»), emotes de Twitch (KEKW, Sadge, monkaS, Kappa) e ironía en mensajes cortos. Está pensado para integrarse en herramientas de visualización en tiempo real, como overlays de OBS o interfaces de terminal, dentro del ecosistema de la librería chatvibe-fr publicada por el mismo autor.

Su relevancia actual es acotada pero clara: demuestra que un modelo de menos de 600 millones de parámetros, entrenado con LoRA en una única GPU de consumo (RTX 3060 de 12 GB) en menos de ocho minutos, puede superar a su modelo base sin ajustar en una tarea de clasificación emocional muy específica. La licencia Apache 2.0 y la disponibilidad de pesos en safetensors y GGUF facilitan su experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), ajuste fino mediante LoRA sobre Qwen/Qwen3-0.6B |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-0.6B, valor no confirmado) |
| Tipos de cuantizacion | GGUF (formato publicado); cuantizaciones concretas no disponibles |
| Idiomas soportados | Frances (fr), orientado a registro gamer y argot de chat |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer denso de tipo decoder-only, y aplica un ajuste fino con LoRA de rango 16 sobre todas las proyecciones lineales. El entrenamiento se realizó durante 3 épocas con una tasa de aprendizaje de 2e-4 en precisión bf16, sobre una NVIDIA RTX 3060 de 12 GB, con una duración total de 7 minutos y 42 segundos. El resultado es un adaptador que conserva la arquitectura y el tokenizador del modelo base, por lo que la longitud de contexto efectiva es la de Qwen3-0.6B, aunque el autor no la documenta explícitamente en la model card.

Los datos de entrenamiento consisten en 2.841 ejemplos sintéticos generados a partir de plantillas, argot y ruido, sin mensajes reales anotados en esta versión 0.1. La evaluación se realizó sobre 40 mensajes escritos a mano y nunca vistos durante el entrenamiento. No se documenta el uso de RLHF ni DPO; el proceso es un ajuste supervisado sobre pares entrada-ficha JSON. La innovación principal no es arquitectónica, sino de enfoque: un formato de salida JSON rígido y compacto que permite consumir el resultado directamente en una interfaz, más un conjunto de datos sintético diseñado para cubrir emotes y giros irónicos del chat.

## Capacidades

- Clasificación de emociones en mensajes de chat, con doce categorías: joie, hype, rire, surprise, amour, tristesse, frustration, colere, peur, moquerie, question y neutre.
- Detección de ironía mediante un campo booleano en la salida.
- Estimación de intensidad emocional en una escala numérica (el autor reporta un error medio de 0,35 sobre la escala utilizada).
- Generación de una ficha JSON estructurada por mensaje, con campos de emoción, intensidad, ironía e icono.
- Interpretación de argot francés de internet y de emotes de Twitch (KEKW, Sadge, monkaS, Kappa, entre otros).
- Integración con la herramienta de línea de comandos chatvibe-fr para análisis de mensajes y visualización mediante overlay.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Overlay de emociones en directos de Twitch: el modelo procesa cada mensaje del chat y devuelve una ficha JSON que la herramienta chatvibe-fr puede renderizar sobre el vídeo mediante OBS, mostrando emoción e icono en tiempo real.
- Análisis de sentimiento de comunidades gaming francófonas: permite agregar la distribución emocional de un chat a lo largo de una sesión para estudiar reacciones a eventos del stream.
- Moderación asistida como señal auxiliar: la clasificación de frustración o cólera puede alimentar un panel de alertas para moderadores humanos, sin uso sancionador automático.
- Investigación sobre ironía y argot en redes: sirve como línea base ligera para experimentos de detección de ironía en francés informal, con un coste computacional mínimo.
- Prototipado rápido de interfaces conversacionales: al devolver JSON estricto, se integra fácilmente en pipelines que necesitan etiquetas emocionales para personalizar respuestas o avatares.
- Docencia y experimentación con LoRA: su tamaño reducido y su entrenamiento reproducible en una GPU de consumo lo convierten en un ejemplo práctico para enseñar ajuste fino de modelos pequeños.
- Herramientas de accesibilidad o visualización para creadores: permite mostrar el tono del chat en pantallas secundarias o terminales sin infraestructura de servidor dedicada.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre data/test.jsonl (40 mensajes escritos a mano, nunca vistos en entrenamiento):

| Decodificador | JSON valido | Emocion | Ironia F1 | Error de intensidad |
|---|---|---|---|---|
| Reglas (baseline) | 100 % | 70,0 % | 0,75 | 1,02 |
| Qwen3-0.6B (sin fine-tuning) | 7,5 % | 12,5 % | 0,00 | 1,93 |
| chatvibe-fr-0.6b (v0.1) | 100 % | 85,0 % | 0,75 | 0,35 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 1,2 GB solo para los pesos, más overhead de activaciones y caché KV; cabe holgadamente en GPUs de 4 GB o más.
- En cuantización GGUF de 4 bits, el peso se reduce aproximadamente a 300-400 MB, permitiendo ejecución en CPU o en GPUs integradas.
- GPU recomendadas: cualquier GPU de consumo moderna sirve; el propio autor entrenó en una RTX 3060 de 12 GB. Para inferencia, una RTX 3050, RTX 4060 o superior es más que suficiente.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4090 e incluso en GPUs con 4 GB de VRAM.
- Opciones de despliegue: transformers, text-generation-inference (el repo incluye la etiqueta endpoints_compatible), llama.cpp u Ollama mediante los pesos GGUF publicados.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por mensaje en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chatvibe-fr-0.6b | 596 M | no disponible | Clasificacion emocional de chat gamer en frances | Apache 2.0 | Hugging Face (safetensors, GGUF) |
| Qwen/Qwen3-0.6B | 596 M | no disponible | Generacion de texto general | Apache 2.0 | Hugging Face |
| Reglas (baseline del autor) | no aplica | no aplica | Clasificacion por reglas | no disponible | Incluido en la libreria chatvibe-fr |

La comparación más directa es con su modelo base sin ajustar, que obtiene un 12,5 % de acierto emocional y un 7,5 % de JSON válido, frente al 85,0 % y 100 % del modelo ajustado. Frente a la línea base de reglas, el modelo mejora el acierto emocional (85,0 % frente a 70,0 %) y reduce el error de intensidad (0,35 frente a 1,02), aunque empata en F1 de ironía (0,75). No se dispone de comparación con otros modelos especializados en emoción en francés dentro de la información proporcionada.

## Limitaciones y advertencias

- Ámbito restringido al francés gamer: no está diseñado para otros idiomas ni para registros formales.
- El argot evoluciona rápidamente, por lo que el vocabulario aprendido puede quedar obsoleto.
- La detección de ironía sigue siendo difícil, especialmente sin el contexto del stream ni el historial de la conversación.
- Entrenado con datos sintéticos (2.841 ejemplos) y evaluado con solo 40 mensajes, lo que limita la robustez estadística de los resultados.
- Riesgo de alucinación en la estructura JSON si la entrada se aleja del dominio esperado, aunque el formato rígido reduce este riesgo.
- El autor advierte explícitamente que no debe usarse para moderar ni sancionar a personas; es una herramienta de visualización.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3-0.6B, también Apache 2.0.
- Sin datos publicados sobre sesgos demográficos o culturales más allá del dominio gamer francófono.
- Los datos de entrenamiento se recogieron de chats públicos sin seudónimos, enlaces ni menciones, pero no se detalla el proceso de anonimización más allá de esa afirmación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aelmizeb/chatvibe-fr-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio de la libreria chatvibe-fr: https://github.com/aelmizeb/chatvibe-fr
- No se han encontrado otros enlaces (papers, blogs, demos) en la informacion proporcionada.
