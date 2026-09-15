# EmberJin/Minecraft-Agent-CoT-Qwen3.5-9B-v1

## Resumen

Minecraft-Agent-CoT-Qwen3.5-9B-v1 es un ajuste fino de tipo continue-SFT sobre el checkpoint EmberJin/Minecraft-Agent-Qwen3.5-9B-Stage3, publicado por el usuario EmberJin. Se trata de un agente encarnado (embodied agent) especializado en Minecraft con arquitectura de tipo VLA (vision-language-action): recibe observaciones visuales del juego y emite acciones discretas, con un formato de salida que intercala un bloque de pensamiento (chain-of-thought) y una acción ejecutable. El modelo tiene 9.409.813.744 parámetros (9,41 mil millones) almacenados en safetensors, con un repositorio de 18,8 GB.

Su relevancia no es la de un modelo listo para producción, sino la de un espécimen de investigación. El propio autor lo describe como la "problem specimen" version: se entrenó deliberadamente sobre anotaciones de pensamiento sin limpiar (raw, uncleaned thought annotations) y se conserva para inspeccionar la calidad de los rollouts y analizar los fallos del enfoque original de anotación CoT. Existe un modelo compañero, ...-v2, entrenado con anotaciones limpias, pensado para comparar ambos y aislar el efecto de la calidad de la anotación.

Los resultados publicados por el autor en su conjunto de evaluación interno (easy-ng, h29, 3 rollouts, semilla 42) muestran una mejora global marginal frente a la base sin CoT (25,3 % frente a 24,9 %) y una mejora clara en tareas embodied (27,5 % frente a 24,8 %), pero un deterioro acusado en combate (18,4 % frente a 25,2 %). El modelo se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de tipo VLA (vision-language-action) basado en la familia Qwen3.5 (tag `qwen3_5`); detalles internos de capas y atención no disponibles |
| Parámetros totales | 9.409.813.744 (9,41 B), según safetensors |
| Parámetros activos | No aplica / no disponible (no hay evidencia de que sea MoE) |
| Longitud de contexto | No disponible en la model card; el ejemplo de despliegue del autor usa `--max-model-len 32768` |
| Tipos de cuantización | No disponible (el repositorio solo contiene safetensors en precisión completa) |
| Idiomas soportados | No disponible; el formato de salida del agente está en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (tamaño del repositorio: 18,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de EmberJin/Minecraft-Agent-Qwen3.5-9B-Stage3, un checkpoint intermedio que el autor evalúa en 24,9 % easy-ng (h29). Sobre esa base se aplica un continue-SFT con 6.661 filas de datos: 5.329 trayectorias anotadas con chain-of-thought generadas con gemini-3.8-flash mediante un prompt antiguo, más 1.332 filas de replay. El entrenamiento usa un learning rate de 1e-6 durante 5 épocas, y el artefacto publicado corresponde al checkpoint de la época 4 (420 pasos). No se documenta en la información disponible ni la composición exacta del dataset, ni el uso de RLHF, DPO u otras técnicas de alineación posteriores al SFT.

La innovación técnica del modelo es el formato de salida, que combina percepción, estado y decisión en una misma emisión: `Thought: <perception> | <state> | <decision>\nAction: move(dx, dy) and press(keys) [and click(left|right)]`. Las acciones se extraen del prefijo `Action:`, lo que permite parsear decisiones ejecutables en el entorno. El rasgo distintivo de esta versión es que las anotaciones de pensamiento no se limpiaron: el propio autor identifica que ese ruido produce afirmaciones de finalización alucinadas y bucles de ataque, y por eso conserva este checkpoint como material de análisis de fallos en lugar de como versión final.

## Capacidades

- Generación de acciones ejecutables en Minecraft en formato parseable (`move(dx, dy)`, `press(keys)`, `click(left|right)`), pensadas para un bucle de agente encarnado.
- Procesamiento de entradas visuales del juego: el ejemplo de despliegue limita a 30 imágenes por prompt (`--limit-mm-per-prompt image=30`), lo que indica soporte multimodal con ventana de historial visual.
- Emisión de razonamiento explícito en formato chain-of-thought, con un formato aprendido de manera prácticamente perfecta según el autor.
- Capacidad de mantener contexto de trayectoria multi-paso, incluyendo historial de observaciones y acciones previas.
- Uso de la ventana de historial de conversación para el razonamiento sobre estado reciente del juego.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso con planificación autónoma: limitado y con fallos documentados (ver limitaciones); no hay evidencia de capacidades de planificación fiables.
- Capacidades multilingües: no disponible.
- Capacidades especiales adicionales: no disponibles (no se documenta audio, ni modo thinking alternativo).

## Casos de uso

- Investigación de calidad de anotaciones CoT: este checkpoint es el espécimen de control con anotaciones sin limpiar, por lo que sirve para cuantificar cuánto daño introduce el ruido en las anotaciones comparando sus rollouts con los del modelo compañero ...-v2 sobre el mismo conjunto de evaluación.
- Análisis de fallos en agentes encarnados: el autor documenta tres patologías concretas (afirmaciones de finalización alucinadas, spam de ataque con cámara congelada y baja emisión de pensamiento), y este modelo permite reproducirlas de forma controlada para estudiar el fallo antes de corregirlo.
- Construcción de conjuntos de datos de fallo para RL o DPO: las trayectorias defectuosas generadas por este checkpoint pueden etiquetarse negativamente y usarse como pares de preferencia frente a rollouts correctos.
- Validación de entornos de evaluación embodied: sirve como línea base interna sobre el conjunto easy-ng (h29) para verificar que los cambios en el harness de evaluación producen resultados coherentes (24,9 % base, 25,3 % global en esta versión).
- Pruebas de robustez del parser de acciones: al generar secuencias con afirmaciones de estado contradictorias, permite comprobar si el pipeline de extracción del prefijo `Action:` se comporta de forma segura cuando el texto de pensamiento no es fiable.
- Estudio del desacoplamiento entre formato y política: dado que el modelo aprende el formato de pensamiento pero solo emite pensamiento en el 0,3–1,5 % de los pasos (frente al 12 % de los datos de entrenamiento), es un caso útil para investigar el desajuste entre la forma aprendida y el disparador de uso.
- Docencia y demostraciones de agentes VLA: permite ilustrar en un entorno concreto cómo un modelo multimodal traduce percepción visual a acciones discretas y dónde falla el bucle de decisión.

## Benchmarks y rendimiento

Únicos datos publicados, correspondientes al conjunto interno easy-ng, h29, con 3 rollouts y semilla 42:

| Métrica | Base (sin CoT) | Este modelo (v1-e4) | Diferencia |
|---|---|---|---|
| Overall | 24,9 % | 25,3 % | +0,4 pp |
| Embodied | 24,8 % | 27,5 % | +2,7 pp |
| Combat | 25,2 % | 18,4 % | -6,8 pp |

El autor atribuye la degradación en combate a las patologías del pensamiento y no a la mezcla de datos, y afirma haberlo verificado con un control sin pensamiento. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones derivadas del recuento de parámetros (9,41 B) y del tamaño del repositorio (18,8 GB en safetensors); no han sido publicadas por el autor y deben validarse en el despliegue concreto.

- Precisión completa (bf16/fp16): aproximadamente 18,8 GB solo en pesos; con caché KV para 32.768 tokens y hasta 30 imágenes por prompt, el requisito práctico se sitúa en el rango de 24 a 32 GB de VRAM.
- Cuantización int8: estimación de 10 a 12 GB de VRAM, sin datos publicados de conversión ni de degradación de calidad.
- Cuantización de 4 bits: estimación de 6 a 8 GB solo en pesos, con margen para contexto corto; no hay GGUF publicado en el repositorio.
- GPU recomendadas: A100 (40 o 80 GB) o H100 para bf16 con contexto largo; L40S (48 GB) como alternativa de coste; RTX 4090 o RTX 3090 (24 GB) para bf16 con contexto reducido o para cuantización de 8 bits.
- GPU de consumo: cabe en tarjetas de 24 GB con contexto reducido, y en tarjetas de 16 GB solo si se cuantiza; en ambos casos sin datos publicados de rendimiento real.
- Opciones de despliegue: vLLM es la única documentada por el autor, con el comando `vllm serve . --served-name cot-v1-e4 --max-model-len 32768 --limit-mm-per-prompt image=30`. No hay evidencia publicada de soporte en llama.cpp, Ollama, TGI u otros servidores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay modelos externos comparables documentados en la información disponible; se compara únicamente con los artefactos de la misma familia.

| Modelo | Parámetros | Contexto | Rendimiento easy-ng (h29) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Minecraft-Agent-CoT-Qwen3.5-9B-v1 (este) | 9,41 B | No disponible (ejemplo con 32.768) | 25,3 % overall / 27,5 % embodied / 18,4 % combat | Apache 2.0 | HuggingFace |
| Minecraft-Agent-Qwen3.5-9B-Stage3 (base del autor) | No disponible | No disponible | 24,9 % overall / 24,8 % embodied / 25,2 % combat | No disponible | HuggingFace |
| Minecraft-Agent-CoT-Qwen3.5-9B-v2 (compañero, anotaciones limpias) | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| Otros agentes embodied de Minecraft | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Afirmaciones de finalización alucinadas: es el problema más importante según el autor. El modelo emite pensamientos que afirman resultados no verificables ("task complete", "has been killed", "taking damage", "within attack range") que contradicen el estado real del juego. El fallo de referencia descrito es un episodio en el que el modelo esquila una oveja y narra dos veces que la tarea de matarla ha terminado, quedando en bucle hasta agotar el tiempo.
- Spam de ataque con cámara congelada: en combate, las afirmaciones erróneas de "in range" se repiten en la ventana de historial y bloquean al modelo en golpes al aire (aproximadamente 170 ataques con un delta de cámara de 0,1 por paso) sin volver a apuntar.
- Baja emisión de pensamiento: solo entre el 0,3 % y el 1,5 % de los pasos emiten un pensamiento, frente al 12 % en los datos de entrenamiento. El formato se aprende, el disparador de cuándo pensar no.
- Degradación en combate de 6,8 puntos porcentuales frente a la base, atribuida por el autor a las patologías del pensamiento y verificada con un control sin pensamiento.
- Este checkpoint no está pensado como versión de producción: el propio autor lo publica como espécimen de problema para inspección y análisis de fallos, y remite al modelo v2 entrenado con anotaciones limpias para un comportamiento corregido.
- Riesgo de alucinación general: elevado en el canal de pensamiento, con afirmaciones de estado inventadas que pueden propagarse al historial y condicionar decisiones posteriores.
- Idiomas soportados: no disponible. El formato de salida documentado está en inglés, lo que limita su uso directo en castellano sin adaptación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se desconoce la licencia del modelo base Stage3 y del modelo fundacional Qwen3.5 subyacente, por lo que conviene verificar la cadena completa de licencias antes de cualquier uso comercial.
- Limitaciones de contexto: la longitud de contexto real del modelo no está documentada; los 32.768 tokens corresponden al parámetro usado en el ejemplo de despliegue con vLLM, no a una especificación confirmada.
- Sesgos conocidos: no disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EmberJin/Minecraft-Agent-CoT-Qwen3.5-9B-v1
- Modelo base (Stage3): https://huggingface.co/EmberJin/Minecraft-Agent-Qwen3.5-9B-Stage3
- Modelo compañero con anotaciones limpias (v2): https://huggingface.co/EmberJin/Minecraft-Agent-CoT-Qwen3.5-9B-v2

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre su familia (los resultados obtenidos correspondían a páginas de ayuda de Google Translate), por lo que no hay papers, blogs, repositorios ni demos adicionales que enlazar.
