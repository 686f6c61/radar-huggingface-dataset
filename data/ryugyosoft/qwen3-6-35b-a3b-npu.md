# ryugyosoft/Qwen3.6-35B-A3B-npu

## Resumen

Qwen3.6-35B-A3B-npu es una conversión del modelo Qwen/Qwen3.6-35B-A3B (35.000 millones de parámetros totales, unos 3.000 millones activos por token) preparada por el usuario ryugyosoft para ejecutarse íntegramente en la NPU de Intel mediante npue, un motor de inferencia del mismo autor. No se trata de un modelo nuevo: los pesos se recuantizan y reestructuran desde el modelo base y conservan la licencia Apache 2.0.

El interés está en el destino: llevar un MoE de 35B a la NPU integrada de un portátil (NPU 3720 de un Core Ultra 9 285HX) con unos 21 GB de memoria y velocidades declaradas de 6,3-6,7 tokens/s en decodificación, gracias a que solo se leen ~3B de parámetros por token. La arquitectura del modelo base combina 30 capas Gated DeltaNet con 10 capas de atención con gating, y cada capa MoE contiene 256 expertos con enrutado top-8 más un experto compartido.

Resulta relevante para escenarios de inferencia local en equipos con NPU Intel y sin GPU dedicada, con una API compatible con OpenAI y reutilización del estado de conversación entre turnos. Ahora bien, hoy depende de un motor específico (npue) y de hardware concreto, no hay benchmarks publicados y la ventana de contexto no se documenta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 30 capas Gated DeltaNet + 10 capas de atención con gating (40 capas), con MoE de 256 expertos top-8 más un experto compartido por capa |
| Parámetros totales | 35B (según nombre del modelo y model card) |
| Parámetros activos | ~3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT4 group-128 (DeltaNet, atención, routers y expertos compartidos); INT4 channel-wise simétrica con redondeo al más próximo (expertos enrutados); INT8 (embeddings y LM head) |
| Idiomas soportados | en, ja (según etiquetas y model card del port) |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR: `seg*_S1.xml` / `seg*_S16.xml` con sus `.bin`, más `experts.bin`, `shared.bin` y `engine.json` |
| Capas | 40 (30 Gated DeltaNet + 10 de atención con gating) |
| Expertos | 256 por capa, top-8 + 1 compartido; 40 × 256 = 10.240 expertos enrutados en total |
| Vocabulario | 248.128 tokens (248k), LM head en INT8 |
| Tamaño del repositorio | 18,8 GB |
| Motor de ejecución | npue (motor independiente, descarga aparte), interfaz de chat y API compatible con OpenAI en `/v1` |
| Modalidad | Solo texto (la torre de visión no está convertida) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de 40 capas: 30 capas Gated DeltaNet, un mecanismo de atención lineal recurrente con decaimiento, y 10 capas de atención con gating. La parte MoE usa 256 expertos por capa con enrutado top-8 y un experto compartido, lo que da 10.240 expertos enrutados en total; el vocabulario es de 248k tokens. Esta ficha no puede aportar datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) porque no aparecen en la información proporcionada.

Lo que sí documenta el autor es el proceso de conversión y cuantización posterior a entrenamiento. El grafo se divide en 41 segmentos cortados justo después de cada router MoE, de modo que el host enlaza los búferes de los 8 expertos elegidos con el segmento siguiente sin copia; los 10.240 expertos residen en memoria visible para la NPU como INT4 channel-wise, un tensor empaquetado por experto. Para Gated DeltaNet se usa la forma matricial de 1 token en decodificación y la forma paralela por bloques para los bloques de prompt, con inversa triangular exacta por duplicación de bloques (la serie de potencias de libro de texto cancela de forma catastrófica en fp16 con claves reales). La salida de DeltaNet se escala por 1024 antes del gated RMSNorm (y su epsilon por 1024²) para no caer en el rango subnormal de fp16, un ajuste heredado del port de Qwen3.5-9B. El LM head de 248k se sirve como una única entrada INT8 compartida para todos los tamaños de bloque y los embeddings se resuelven en el host.

## Capacidades

- Generación de texto y conversación multi-turno, con pipeline declarado `text-generation`.
- Modo thinking opcional: desactivado por defecto, se activa con el conmutador de la interfaz o con `"chat_template_kwargs": {"enable_thinking": true}` en la API.
- Reutilización del estado de la conversación anterior: en turnos de seguimiento solo se procesan los mensajes nuevos.
- Idiomas declarados: inglés y japonés (etiquetas `en` y `ja`).
- Ejecución íntegra en NPU Intel, sin GPU, a través del motor npue y su API compatible con OpenAI.
- No se documenta en la información disponible soporte de tool calling o function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso más allá del modo thinking.
- Sin capacidades de visión: la torre visual del modelo base no se ha convertido.

## Casos de uso

- Asistente conversacional local en portátil con NPU Intel: el modelo cabe en unos 21 GB de memoria de sistema y no necesita GPU, por lo que puede funcionar como asistente de escritorio en un equipo de 32 GB con Core Ultra 9 285HX.
- Procesamiento de documentos sensibles sin salida a la nube: al ejecutarse en local y exponer una API en `localhost:8000/v1`, es adecuado para entornos con requisitos de privacidad o air-gapped donde no se permite enviar texto a servicios externos.
- Chat multi-turno de sesión larga: la conservación del estado entre turnos evita reprocesar el historial, lo que reduce el coste por turno en conversaciones continuadas, a 6,3-6,7 tokens/s de decodificación.
- Resumen y generación de texto en inglés y japonés: es el par de idiomas declarado, útil para flujos de trabajo bilingües o documentación técnica en esos idiomas.
- Integración en aplicaciones existentes mediante API compatible con OpenAI: cualquier cliente que hable el protocolo `/v1` puede apuntar al servidor local sin cambios de código, útil para prototipos de producto en cliente.
- Razonamiento con coste adicional controlado: el modo thinking permite activar cadenas de razonamiento más largas solo cuando la tarea lo requiere, dejándolo desactivado por defecto para minimizar latencia.
- Investigación en ejecución de MoE sobre NPU: el repositorio sirve como referencia reproducible de particionado por segmentos tras el router, cuantización channel-wise de expertos y ajustes numéricos en fp16 para Gated DeltaNet.
- Evaluación de compilación OpenVINO en hardware cliente: útil para medir tiempos de compilación y arranque (~7 min la primera vez, ~20 s después) antes de decidir un despliegue en flota de portátiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). La model card únicamente incluye métricas de ejecución y una comprobación de calidad frente al modelo en bf16:

| Métrica | Valor |
|---|---|
| Decodificación (NPU 3720, Core Ultra 9 285HX) | 6,3-6,7 tokens/s |
| Procesamiento de prompt | ~60 ms/token (119 tokens en 7,2 s) |
| Memoria necesaria | ~21 GB (requiere máquina de 32 GB) |
| Primera compilación para NPU | ~7 min |
| Arranques posteriores | ~20 s |
| Turnos de seguimiento | Se conserva el estado previo; solo se procesan los mensajes nuevos |
| Calidad: logits del primer token frente a bf16 | Dentro de un ~33-36 % en las comprobaciones del autor, con el mismo top-1 |
| Comparación interna | Más rápido que el denso Qwen3.5-9B en la misma NPU, porque solo se leen ~3B por token |

## Requisitos de hardware

- No utiliza VRAM de GPU: la inferencia se ejecuta en la NPU Intel. La memoria indicada es del sistema (~21 GB), compartida con la NPU.
- Hardware probado: NPU 3720 de un Intel Core Ultra 9 285HX, en una máquina con al menos 32 GB de memoria.
- GPU recomendadas: no aplica; no hay ruta de despliegue en GPU documentada (A100, H100 o RTX 4090 no se mencionan).
- Cabe en portátiles con NPU Intel de la generación indicada y 32 GB de RAM; no se documenta su funcionamiento en CPU ni en equipos sin NPU.
- Almacenamiento: 18,8 GB de pesos, más el espacio del entorno Python y del motor npue.
- Sistemas operativos: Windows (`start.bat`) y Ubuntu (`start.sh`).
- Despliegue: exclusivamente mediante npue; no hay soporte documentado de vLLM, llama.cpp, Ollama ni TGI.
- Servicio: interfaz de chat en `http://localhost:8000/` y API compatible con OpenAI en `/v1`.
- Rendimiento y latencia: 6,3-6,7 tokens/s en decodificación y ~60 ms/token en procesamiento de prompt; primera compilación ~7 min y ~20 s en arranques posteriores.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Formato y hardware | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|---|
| ryugyosoft/Qwen3.6-35B-A3B-npu (este) | 35B | ~3B | no disponible | OpenVINO IR, NPU Intel (motor npue) | Apache 2.0 | 6,3-6,7 tokens/s en decodificación; logits de primer token a un ~33-36 % del bf16 |
| Qwen/Qwen3.6-35B-A3B (base) | 35B | ~3B | no disponible | Pesos originales; formato no confirmado en la información | Apache 2.0 | No disponible (referencia de calidad en bf16) |
| ryugyosoft/Qwen3.5-9B-npu | ~9B (denso, según el nombre) | no aplica | no disponible | OpenVINO IR, NPU Intel (motor npue) | no disponible | Más lento que este port en la misma NPU, según la model card |

No se dispone de información sobre otros ports comparables de la misma categoría (MoE de ~35B ejecutados en NPU o en hardware de cliente) para ampliar la comparativa.

## Limitaciones y advertencias

- La cuantización introduce divergencia: los logits del primer token quedan dentro de un ~33-36 % respecto al modelo en bf16 (con el mismo top-1) y la elección de palabras diverge tras unos pocos tokens.
- No hay benchmarks publicados, por lo que no es posible estimar la calidad en razonamiento, código o matemáticas frente a alternativas.
- Solo texto: la torre de visión del modelo base no está convertida.
- Idiomas declarados en inglés y japonés; no hay información sobre el comportamiento en castellano u otros idiomas.
- Dependencia fuerte de hardware: requiere NPU Intel de la familia indicada y ~21 GB de memoria; no hay ruta documentada en GPU ni en CPU.
- Dependencia de software: funciona únicamente con el motor npue, con interfaz propia; no hay integración documentada con vLLM, llama.cpp, Ollama o TGI.
- La primera ejecución implica una compilación para NPU de ~7 minutos; los arranques posteriores bajan a ~20 s.
- La descarga debe hacerse con `hf download`; un `git clone` sin Git LFS descarga punteros de 130 bytes en lugar de los pesos.
- No se documenta soporte de tool calling ni de flujos de agentes, lo que limita su uso en pipelines que dependan de llamadas a funciones.
- La longitud de contexto no está disponible, lo que impide planificar casos de contexto largo o estimar el coste de prompts extensos.
- Riesgo habitual de alucinación de los modelos de lenguaje; no se documentan evaluaciones de sesgo o seguridad.
- Licencia Apache 2.0 (igual que el modelo base): permite uso comercial siempre que se respeten las condiciones de la licencia y se conserven los avisos correspondientes.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación de la comunidad sobre la calidad del port.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ryugyosoft/Qwen3.6-35B-A3B-npu
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Motor npue: https://huggingface.co/ryugyosoft/npue
- Port previo de referencia (ajustes numéricos heredados): https://huggingface.co/ryugyosoft/Qwen3.5-9B-npu
