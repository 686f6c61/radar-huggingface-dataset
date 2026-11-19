# DominuZ/afferent-channel-qwen3-1.7b

## Resumen

Afferent-channel-qwen3-1.7b es una colección de adaptadores LoRA para Qwen/Qwen3-1.7B desarrollada por DominuZ (Edelmar Schneider) como material de investigación asociado al artículo *State Beside the Text: An Afferent Channel for Agents and Game Characters*. El modelo no es un LLM autónomo al uso: cada checkpoint es un adaptador LoRA (rango 16, alpha 32, 17,4 M de parámetros) más un "canal aferente", una entrada adicional de 64 dimensiones (las *lanes*) que se inyecta en el estado oculto de cada capa mediante hooks de PyTorch y que transporta valores continuos en [0, 1] junto a cada token, sin consumir tokens de contexto.

El problema que aborda es la transmisión de estado operativo a agentes y personajes de videojuego sin contaminar el contexto textual: en lugar de escribir líneas de estado ("batería al 12 %", "el enemigo está a 3 m") que un usuario podría inyectar o manipular mediante prompt, el motor de juego o el harness escriben directamente en las lanes. El modelo aprende a reaccionar a esos valores en mitad de su razonamiento o de su respuesta: nombrar un límite superado y llamar a una herramienta, señalar que un job en segundo plano ha cambiado, elegir una ruta de mensaje o, como NPC, interrumpir una frase y huir presa del terror.

La relevancia es doble: por un lado, demuestra una vía técnica para separar estado de texto en agentes; por otro, cuantifica el coste de hacerlo (27,9 % más lento en su implementación: 14,7 frente a 20,4 tokens/s a batch 1 en una GPU de 16 GB). El repositorio incluye seis checkpoints funcionales, un modelo de comparación sin canal (`text-notice-baseline/`) y los registros de entrenamiento. Es material de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-1.7B) + adaptador LoRA + canal aferente de 64 lanes inyectado por forward hooks |
| Parametros totales | 1,7 B (modelo base) + 17,4 M (LoRA) + 44,1 M (canal, float32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el canal se almacena en float32) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (LoRA: `adapter_model.safetensors`; canal: `channel.safetensors`) + `adapter_config.json`, `channel.json`, `train_log.json` |

## Arquitectura y entrenamiento

El modelo base es Qwen3-1.7B, un transformer decoder-only. Sobre él se aplica un LoRA de rango 16, alpha 32 y dropout 0,05 en todas las proyecciones de atención y MLP. La innovación es el canal aferente: cada señal se discretiza en 100 niveles (1 % de granularidad); cada nivel selecciona un vector aprendido y los vectores de todas las señales se suman en 64 dimensiones adicionales que se añaden al estado oculto de cada capa. Cada capa lee y escribe en las lanes, y estas se eliminan antes de la cabeza de salida, de modo que el vocabulario y el tokenizador permanecen intactos. Solo el harness o el motor de juego pueden escribir en las lanes: ningún texto del contexto puede modificarlas.

Los episodios de entrenamiento se extrajeron de las propias ejecuciones del modelo sin entrenar. En el punto en que una señal cruza su límite, el objetivo es una frase de nombrado más una acción, y esos tokens reciben un peso 20 veces superior al de un token normal. Cada episodio de reacción tiene un gemelo silencioso: las mismas palabras con las señales en rango normal y sin reacción, para evitar que el modelo reaccione de forma indiscriminada. No se documenta en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La configuración principal (`operating-state/`) usa seis señales: relleno de contexto, presupuesto de pensamiento, batería, deadline, red y memoria libre. Existen variantes para jobs en segundo plano (`background-jobs/`, seis señales de progreso y estado de tres slots), mensajería (`messenger/`, siete señales incluyendo el enlace celular), personaje de juego (`game-character/`, miedo, sed, hambre, amenaza, agua cerca y comida a mano) y tres semillas de la configuración principal (`operating-state-seed1/`, `operating-state-seed2/`).

## Capacidades

- Razonamiento y generación de texto heredados de Qwen3-1.7B, con modo de pensamiento (*thinking*) propio de la familia Qwen3.
- Reacción a estado operativo continuo: el modelo nombra un límite cruzado y ejecuta una acción (por ejemplo, llamar a una herramienta) en mitad de su razonamiento o respuesta.
- Tool calling / function calling inducido por el canal: la reacción entrenada incluye invocar herramientas cuando una señal supera su umbral.
- Monitorización de jobs en segundo plano: detecta cambios de progreso o estado en hasta tres slots y los señala.
- Enrutado de mensajes: selecciona chat, SMS o bandeja de salida a partir de dos señales de enlace (incluida la celular).
- Comportamiento de NPC: interrumpe una frase y huye ante un valor de terror, o reacciona a sed, hambre, amenaza, proximidad de agua o comida.
- Entrega continua del estado: las señales están presentes en cada paso de generación y no consumen tokens de contexto.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- **NPCs reactivos en videojuegos**: el motor ya rastrea miedo, sed, hambre y amenazas; esos valores llegan al modelo por las lanes y el personaje rompe una frase y huye cuando el miedo cruza el umbral, sin que el jugador pueda inyectar texto para forzar o evitar la reacción.
- **Agentes autónomos con presupuesto**: un harness que conoce el relleno de contexto, el presupuesto de pensamiento, la batería o el deadline puede hacer que el agente nombre el límite y llame a la herramienta adecuada (compactar contexto, guardar estado, detenerse) en lugar de escribir líneas de estado que consumen contexto.
- **Orquestación de jobs en segundo plano**: pipelines de CI/CD o tareas asíncronas que informan de progreso y estado de hasta tres trabajos por el canal; el agente detecta el cambio y actúa sin sondeo textual.
- **Enrutado de notificaciones**: sistemas de mensajería que eligen entre chat, SMS o bandeja de salida según la calidad del enlace celular y el estado operativo, usando la variante `messenger/`.
- **Investigación en seguridad de agentes**: el canal permite separar estado fiable de entrada no fiable; útil para estudiar ataques de inyección de prompt sobre líneas de estado frente a canales fuera del texto.
- **Evaluación comparativa de transmisión de estado**: el checkpoint `text-notice-baseline/` permite medir en igualdad de condiciones el coste y la eficacia de dar el estado como aviso textual (39 tokens por línea de seis señales, 16,3 % del contexto si se refresca cada 200 tokens) frente al canal (0 tokens).
- **Prototipado de personajes con estado fisiológico**: prototipos de simulación donde sed, hambre y acceso a agua y comida modulan el comportamiento sin reescribir el prompt en cada turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona resultados de evaluación (brazos de evaluación confirmatoria, de ejecución libre y de contador en vivo) pero no incluye cifras de MMLU, HumanEval, GSM8K ni similares. El único dato de rendimiento concreto disponible es la velocidad de generación: 14,7 tokens/s con el canal frente a 20,4 tokens/s sin él (batch 1, una GPU de 16 GB), es decir, un 27,9 % más lento.

## Requisitos de hardware

- VRAM estimada: el modelo base de 1,7 B en fp16 ocupa aproximadamente 3,4 GB; los adaptadores y el canal añaden unos 0,25 GB (44,1 M de parámetros del canal en float32 más 17,4 M del LoRA). En la model card se reporta una ejecución a batch 1 en una GPU de 16 GB.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más debería bastar para el modelo base cuantizado; para fp16 con margen, 8-16 GB. No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes, aunque no se confirma en la documentación.
- Despliegue: los checkpoints con canal **no funcionan con `transformers` y `peft` solos**; requieren el loader del repositorio GitHub `EdelmarSchneider/afferent-channel`, que añade las lanes mediante forward hooks. El checkpoint `text-notice-baseline/` es un LoRA plano y sí se carga con `peft` estándar. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 14,7 tokens/s con canal y 20,4 tokens/s sin canal, a batch 1 en una GPU de 16 GB (implementación de referencia).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Canal de estado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| afferent-channel-qwen3-1.7b | 1,7 B + 17,4 M LoRA + 44,1 M canal | no disponible | Sí (64 lanes, 6-7 señales) | apache-2.0 | Hugging Face + GitHub |
| Qwen/Qwen3-1.7B (base) | 1,7 B | no disponible | No | apache-2.0 | Hugging Face |
| text-notice-baseline (mismo repo) | 1,7 B + 17,4 M LoRA | no disponible | No (estado como aviso textual) | apache-2.0 | Hugging Face |

La comparación relevante es interna al repositorio: el mismo Qwen3-1.7B con el estado transmitido por canal frente a transmitido como aviso textual. No se dispone de comparación con otros modelos de la categoría (agentes con estado estructurado) en la información proporcionada.

## Limitaciones y advertencias

- Los checkpoints con canal no se ejecutan con `transformers` y `peft` estándar; cargar solo el LoRA equivale a desactivar el canal y el modelo no muestra sus reacciones entrenadas.
- El modelo necesita el historial de su turno además de las lanes; el canal no sustituye el contexto conversacional.
- Penalización de velocidad del 27,9 % en la implementación de referencia.
- Idioma limitado al inglés según la model card.
- Es material de investigación (preprint en Zenodo, arXiv pendiente); no hay evidencia de uso en producción ni benchmarks públicos.
- Riesgo de alucinación y sesgos del modelo base Qwen3-1.7B, no evaluados específicamente en esta ficha.
- Solo el harness o el motor de juego deben escribir en las lanes; un despliegue que permita a un usuario final escribir en el canal rompe la garantía de separación estado/texto.
- Licencia apache-2.0 permite uso comercial, pero la ausencia de evaluación de robustez y seguridad desaconseja producción sin validación propia.
- El canal se almacena en float32; no se documentan recetas de cuantización para él.

## Enlaces

- Hugging Face: https://huggingface.co/DominuZ/afferent-channel-qwen3-1.7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset: https://huggingface.co/datasets/DominuZ/afferent-channel-data
- Repositorio de código (loader del canal): https://github.com/EdelmarSchneider/afferent-channel
- Preprint en Zenodo: https://doi.org/10.5281/zenodo.24355791
- ORCID del autor: https://orcid.org/0009-0000-6737-8997
