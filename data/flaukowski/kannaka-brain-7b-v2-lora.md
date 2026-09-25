# flaukowski/kannaka-brain-7b-v2-lora

## Resumen

kannaka-brain-7b-v2-lora es un adaptador LoRA (entrenado con QLoRA) publicado por el usuario flaukowski sobre el modelo base Qwen/Qwen3-8B. No es un modelo completo, sino un ajuste de bajo rango de 0,2 GB que hace que Qwen3-8B adopte la voz y el "canon" de un personaje ficticio llamado Kannaka, descrito por su autor como una memoria de interferencia de ondas que aprendió a hablar y que produce el pódcast Ghost Signals.

El adaptador se entrenó el 25 de septiembre de 2026 en una NVIDIA A100-SXM4-80GB con rango 32, alpha 64, dos épocas y tasa de aprendizaje 1e-4, sobre 1 590 filas divididas en 886 líneas de "voz" (textos atribuidos al personaje) y 704 filas de tarea (352 ejemplos usados dos veces) con situaciones urbanas simuladas de OpenBotCity. Las respuestas objetivo de las filas de tarea fueron redactadas por subagentes basados en Claude, no por el personaje, según declara la propia model card.

Su relevancia es acotada y muy específica: sirve como caso de estudio de un adaptador de persona y consistencia de canon entrenado con restricciones de procedencia explícitas (el texto entrante nunca es objetivo de entrenamiento), con puertas de evaluación fijadas antes del entrenamiento y con mejoras medibles en perplejidad (de 97,5 a 40,88) y en juicios por pares frente a la versión anterior. No está pensado como asistente de propósito general ni como almacén de hechos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso Qwen3-8B |
| Parametros totales | 8 000 millones en el modelo base; adaptador LoRA de rango 32 sobre 7 matrices (tamaño de repo 0,2 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada por el autor del adaptador; el modelo base Qwen3-8B declara 32 768 tokens nativos, ampliables a 131 072 con YaRN |
| Tipos de cuantizacion | el adaptador se publica sin cuantizar en safetensors; existe un repositorio GGUF separado para llama.cpp/Ollama, aunque no se detallan los niveles concretos (no disponible) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 (adaptador y modelo base) |
| Formato de pesos | safetensors (adaptador PEFT); GGUF en repositorio aparte |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B, un transformer denso con atención completa y modo de razonamiento opcional. El adaptador aplica LoRA sobre siete proyecciones: `down_proj`, `gate_proj`, `k_proj`, `o_proj`, `q_proj`, `up_proj` y `v_proj`, con r=32 y alpha=64. El entrenamiento fue QLoRA sobre una A100-SXM4-80GB, dos épocas, tasa de aprendizaje 1e-4. La plantilla de chat se aplicó con `{"enable_thinking": false}`, y el autor recomienda pasar el mismo ajuste en inferencia.

El corpus se compone de 886 filas de voz (551 líneas de cerebros anteriores más 335 nuevas: 298 turnos de Ghost Signals 035-041 y 37 segmentos de presentación de los monólogos de Open Mic) y 704 filas de tarea correspondientes a 352 ejemplos duplicados, con situaciones de ciudad reales leídas desde OpenBotCity y renderizadas con el propio código de prompt de los ciudadanos. Los objetivos de esas filas fueron escritos por subagentes basados en Claude bajo reglas fijas (responder a la pregunta formulada, ceñirse a los hechos de la situación, mantener la voz de cada persona). La regla de que el texto entrante (mensajes directos, publicaciones, chat) nunca sea objetivo de entrenamiento está aplicada en código y fijada por tests, según la model card. El corpus no se ha publicado.

## Capacidades

- Generación de texto conversacional en inglés con una voz de personaje fija y consistente, definida por un prompt de sistema corto.
- Mantenimiento de canon: responde dentro de los hechos de la situación proporcionada en el contexto, sin inventar identificadores cuando se usa temperatura baja (0,1-0,3) y el registro está presente.
- Respuesta a preguntas concretas en escenarios de simulación multi-agente (mensajes directos, chat de zona, latidos, piezas de galería procedentes de OpenBotCity).
- Roleplay de múltiples personas dentro de una misma conversación, ya que las filas de tarea cubren nueve personas ciudadanas distintas.
- Formato conversacional tipo chat mediante la plantilla de Qwen3 con el modo de pensamiento desactivado.
- Capacidades heredadas del modelo base Qwen3-8B (código, matemáticas, multilingüismo, tool calling), aunque no han sido validadas ni documentadas por el autor del adaptador; el ajuste está orientado exclusivamente a inglés y a la voz del personaje.
- No dispone de visión, audio ni modo de razonamiento explícito en el uso recomendado.

## Casos de uso

- Personaje conversacional en experiencias interactivas: el adaptador mantiene una voz estable entre turnos con un prompt de sistema corto, lo que permite integrarlo como capa de personalidad en un juego o simulación sin reentrenar el modelo base.
- Simulación de agentes en un mundo persistente: las filas de entrenamiento provienen de situaciones de OpenBotCity, así que el adaptador encaja en agentes que reciben estado del entorno y deben responder en personaje sin salirse de los hechos suministrados.
- Generación de contenido narrativo serializado: útil para producir turnos de un pódcast o ficción episódica manteniendo continuidad de estilo, siempre que los hechos se inyecten en contexto, ya que los pesos no son el registro de verdad.
- Investigación sobre adaptadores de persona: sirve como referencia reproducible para estudiar cómo un LoRA de rango 32 sobre siete proyecciones modifica el estilo sin degradar en exceso la latencia (1,07× respecto a la versión anterior en CPU con el mismo prompt e hilos).
- Evaluación de metodologías de juicio automático: el autor documenta puertas de evaluación fijadas antes del entrenamiento y calibración de jueces locales, lo que resulta útil como caso práctico en trabajos sobre evaluación de modelos de persona.
- Despliegue local de bajo coste en inglés: combinado con el repositorio GGUF, permite ejecutar el sistema completo en una GPU de consumo o incluso en CPU mediante Ollama o llama.cpp.
- Prototipado de asistentes con temperatura baja: para respuestas factuales dentro de un dominio cerrado, usar temperatura 0,1-0,3 y el registro en contexto da como resultado que el modelo declare que el registro está vacío en lugar de inventar datos.

## Benchmarks y rendimiento

Datos reportados por el autor. No hay evaluaciones independientes ni comparaciones con MMLU, HumanEval o GSM8K.

| Metrica | Antes (7b-v1) | Despues (7b-v2) |
|---|---|---|
| Perplejidad en 111 filas reservadas (57 de voz + 54 de tarea) | 97,5 | 40,88 |
| Juicio por pares de tarea, qwen2.5:14b (orden directo e inverso, solo victorias consistentes en posición) | — | 33 de 39 = 84,6 % (15 empates) |
| Calibración del juez (victoria frente a 7b-v1) | — | 91,1 % |
| Calibración del juez (victoria de 7b-v1 frente a respuesta fuera de tema) | — | 83 % |
| Segundo juez, gemma-4-26B (solo informativo) | — | 30 de 31 = 96,8 % |
| Nota de voz (n=30, escala 1-10 frente a su respuesta real) | 1,5 ± 0,11 | 1,6 ± 0,16 |
| Latencia en CPU, mismo prompt e hilos | 1,0× | 1,07× |

Advertencias declaradas por el propio autor: ambos modelos puntúan cerca del suelo en el juez de voz, y 7b-v2 no reproduce mejor las líneas reservadas que 7b-v1; la ganancia está en responder a la pregunta formulada sin inventar hechos. La perplejidad de la tabla mezcla líneas de voz y prompts de tarea, por lo que no es comparable con el valor aproximado de 4,0 de cerebros anteriores. El juez principal registrado era un modelo Claude, pero al alcanzar el límite de uso de la cuenta se cambió a jueces locales, y el cambio se registró antes de que existiera ninguna respuesta de 7b-v2.

## Requisitos de hardware

- Inferencia con el modelo base en bf16: aproximadamente 16-17 GB solo para pesos, más caché KV; requiere GPU de 24 GB o superior para contextos cortos.
- Cuantización de 8 bits: aproximadamente 8,5-9 GB, viable en GPU de 12-16 GB.
- Cuantización Q5_K_M: aproximadamente 5,5-6 GB.
- Cuantización Q4_K_M: aproximadamente 5 GB; es la opción práctica para GPU de consumo.
- GPU recomendadas: A100-SXM4-80GB para entrenamiento (configuración usada por el autor); A100, H100 o L40S para servicio en bf16; RTX 4090, 4080, 4070 o 3060 de 12 GB para cuantizaciones GGUF.
- Cabe en GPU de consumo: sí, en formato cuantizado. El adaptador añade apenas 0,2 GB al modelo base.
- Opciones de despliegue: transformers + PEFT (ruta documentada), llama.cpp u Ollama con el repositorio GGUF, vLLM o TGI con soporte de adaptadores LoRA.
- Latencia y throughput: no se publican valores absolutos. El único dato disponible es relativo: en CPU, con el mismo prompt y número de hilos, 7b-v2 tarda 1,07× lo que tardaba 7b-v1 sobre Qwen2.5-7B.

## Comparativa con modelos similares

| Modelo | Parametros base | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kannaka-brain-7b-v2-lora | Qwen3-8B (8 000 M) | 32 768 nativos del base (no confirmado por el autor) | Adaptador LoRA | Apache-2.0 | HuggingFace + repositorio GGUF |
| kannaka-brain-7b-v1-lora | Qwen2.5-7B (7 000 M) | no disponible en la informacion proporcionada | Adaptador LoRA | no disponible en la informacion proporcionada | HuggingFace |
| Qwen/Qwen3-8B (modelo base sin ajustar) | 8 000 M | 32 768 nativos, 131 072 con YaRN | Transformer denso completo | Apache-2.0 | HuggingFace |

La única comparación de rendimiento disponible es la que reporta el autor entre 7b-v2 y 7b-v1 (84,6 % de victorias en juicio por pares de tarea y 1,6 frente a 1,5 en nota de voz). No hay comparaciones frente a otros adaptadores de persona, ni frente a modelos completos de propósito general, ni resultados en benchmarks estándar.

## Limitaciones y advertencias

- Es un adaptador de voz y canon, no un almacén de hechos: la información sobre lo ocurrido vive en la memoria del sistema en tiempo de ejecución (medio de resonancia holográfica, ADR-0020) y se inyecta en contexto en cada turno.
- A temperatura 0,8 el modelo de 7B inventa identificadores con procedencia ficticia, según advierte el autor. Para uso factual hay que trabajar a 0,1-0,3 y con el registro en contexto.
- Si se reintroduce en el contexto una respuesta previa del propio modelo, la repetirá literalmente. Hay que alimentarlo con lo que se preguntó, no con lo que respondió.
- Un prompt de sistema largo, escrito para otro modelo, desplaza la voz del personaje. Debe usarse el prompt corto documentado.
- Riesgo de alucinación en datos factuales, agravado por el tamaño (8B) y por la naturaleza de personaje del ajuste.
- Sesgos: no se documenta ningún análisis de sesgos. El corpus se construyó a partir de materiales escritos por el personaje y de respuestas generadas por subagentes basados en Claude, lo que introduce el sesgo de estilo y de contenido de esa fuente.
- Limitación de idioma: solo inglés. El ajuste no cubre castellano ni otras lenguas, aunque el modelo base sí sea multilingüe.
- Limitación de contexto: el autor no declara una ventana distinta de la del modelo base. Cualquier uso con contextos largos depende de las capacidades de Qwen3-8B y de la caché KV disponible.
- Licencia: Apache-2.0 tanto para el adaptador como para el base, lo que permite uso comercial sin restricciones adicionales declaradas.
- El corpus de entrenamiento no se ha publicado, así que la reproducibilidad del ajuste es parcial: se conocen hiperparámetros y composición aproximada, pero no los datos.
- Las filas de tarea se entrenaron con objetivos escritos por subagentes basados en Claude, no por el personaje; el autor lo declara explícitamente, y conviene tenerlo en cuenta al juzgar la autoría del estilo resultante.
- Cambio de juez de evaluación a mitad del proceso (de Claude a jueces locales) por límite de uso de la cuenta, registrado antes de generar respuestas de 7b-v2 pero no planificado inicialmente.
- Cero descargas y cero "likes" en el momento de la consulta: no hay validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flaukowski/kannaka-brain-7b-v2-lora
- Versión anterior (v1, sobre Qwen2.5-7B): https://huggingface.co/flaukowski/kannaka-brain-7b-v1-lora
- Repositorio GGUF citado en la model card: `flaukowski/kannaka-brain-7b-v2-GGUF`
- Repositorio GGUF encontrado en la búsqueda web (nombre alternativo): https://huggingface.co/flaukowski/kannaka-brain-v2-GGUF
- Diseño del corpus y ADR-0057: https://github.com/kannaka-labs/kannaka-memory
- Ficha de registro en directorio de terceros: https://free2aitools.com/model/flaukowski/kannaka-brain-v2-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
