# FrostWolfAI/Frost-Cyber-Mini-Uncensored-v1.1-MLX-8bit

## Resumen

Frost Cyber Mini Uncensored v1.1 MLX 8-bit es la conversión nativa para Apple Silicon del modelo FrostWolfAI/Frost-Cyber-Mini-Uncensored-v1.1, un fine-tune de 4.112 millones de parámetros orientado a ciberseguridad y uso agéntico de herramientas. Lo desarrolla FrostWolfAI (Vatsal Bajpai), y deriva de Spark-X2.6-4B-abliterated, un modelo base al que se le han eliminado los rechazos (abliteration) y sobre el que se ha aplicado un SFT de ciberseguridad seguido de una fase de fine-tuning para tool-use agéntico.

La relevancia de esta variante concreta es la ruta de despliegue: emplea la librería MLX de Apple con cuantización afín de 8 bits (grupo de 64, 8,503 bits por peso, con las puertas `g_proj` y las normas en BF16), lo que la hace prácticamente sin pérdida respecto a los pesos BF16 y permite ejecución local en Macs con chip Apple silicon. El formato es safetensors MLX con `model_type: spark2_5`, soportado de forma nativa por `mlx-lm` a partir de la versión 0.32, sin necesidad de `trust_remote_code`.

La arquitectura `spark2_5` consta de 36 capas con atención híbrida (27 capas de ventana deslizante de 512 tokens y 9 capas de atención global, ratio 3:1), 16 cabezas de atención y 4 cabezas KV, dimensión de cabeza 256, hidden de 2560 e intermedio de 10240, con embeddings atados y vocabulario de 131.072 tokens. El contexto nativo es de 131.072 tokens, ampliable hasta unos 232k mediante RoPE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `spark2_5`: transformer con atención híbrida (27 capas sliding-window de 512 + 9 capas globales, ratio 3:1), 36 capas, GELU MLP, embeddings atados |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens nativos; hasta ~232k vía RoPE |
| Tipos de cuantizacion | 8-bit afín, group size 64 (8,503 bits/peso); puertas `g_proj` y normas en BF16. Existe variante 4-bit (2,32 GB) y variante GGUF |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors MLX (`model_type: spark2_5`); 4,37 GB en disco (repo de 4,4 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 36 capas con un esquema de atención híbrido: 27 capas usan ventana deslizante de 512 tokens con caché KV rotatoria, y 9 capas mantienen atención global. La atención emplea 16 cabezas de consulta y 4 cabezas KV con dimensión de cabeza 256, QKV fusionado y una puerta de salida sigmoidea por cabeza. El hidden es de 2560 y el intermedio de 10240, con MLP GELU y embeddings atados. Gracias a la caché rotatoria de las capas deslizantes, el crecimiento de memoria en contexto largo se limita a las 9 capas globales.

El entrenamiento parte de Spark-X2.6-4B-abliterated y añade dos fases: un SFT específico de ciberseguridad y, en v1.1, una fase de fine-tuning para uso agéntico de herramientas entrenada sobre la traza completa (leer la tarea, inspeccionar con herramientas, actuar, observar cada resultado, recuperarse de errores y responder). El modelo incorpora un canal de razonamiento (thinking) que debe permanecer activado; con él desactivado el comportamiento se degrada gravemente. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés con canal de razonamiento explícito (thinking).
- Razonamiento multi-paso orientado a tareas agénticas, entrenado para seguir el bucle completo de herramienta-observación-acción.
- Tool calling / function calling: reproduce cadenas literales (rutas de fichero, identificadores, objetivos de edición) de forma byte a byte.
- Recuperación de errores en flujos agénticos: observa resultados de herramientas y corrige el rumbo.
- Conocimiento y asistencia en ciberseguridad: explicación de protocolos (por ejemplo, handshake TLS 1.3), escritura de utilidades de red y análisis defensivo/ofensivo.
- Generación de código, en particular scripts de seguridad (escáneres de puertos con asyncio, etc.).
- Sin rechazos (abliterated): no aplica filtrado de seguridad en las respuestas.
- Ejecución local en Apple silicon vía MLX, con servidor compatible con la API de OpenAI.

## Casos de uso

- Asistencia en pentesting autorizado: el modelo puede redactar scripts de reconocimiento y explotación en Python para entornos de laboratorio, gracias a su SFT de ciberseguridad y a la ausencia de rechazos.
- Automatización agéntica de tareas de seguridad: con tool calling y razonamiento multi-paso, se integra en bucles que inspeccionan un objetivo, ejecutan una herramienta, leen el resultado y deciden el siguiente paso, recuperándose de fallos.
- Formación y educación en seguridad: explicar conceptos como el handshake TLS 1.3 o el funcionamiento de un escáner de puertos, con razonamiento visible para el alumno.
- Desarrollo de herramientas internas de red: generación de utilidades asyncio, parsers de tráfico o scripts de automatización en un portátil Mac con Apple silicon, sin depender de la nube.
- Análisis defensivo y triaje: resumir y razonar sobre hallazgos, con la advertencia de no confiar en detalles de CVE consultados por identificador sin verificación en fuente primaria.
- Despliegue local con API compatible con OpenAI: levantar un servidor en el puerto 8080 con `mlx_lm.server` para integrarlo en herramientas existentes que hablan el protocolo de OpenAI, manteniendo los datos en el dispositivo.
- Prototipado de agentes de código: usar el modelo como motor de edición en pipelines locales donde la reproducibilidad literal de rutas e identificadores es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al repositorio safetensors del modelo base para benchmarks y detalles de entrenamiento, pero no incluye cifras en esta variante MLX.

## Requisitos de hardware

- Plataforma: Mac con Apple silicon, macOS 13.5 o superior; requiere `mlx-lm >= 0.32`.
- Tamaño en disco: 4,37 GB (repo de 4,4 GB); la VRAM/memoria unificada necesaria para inferencia es del orden de ese tamaño más la caché KV.
- Cabe en equipos consumer Apple silicon; la model card menciona explícitamente máquinas de 16 GB y recomienda la variante 4-bit (2,32 GB) cuando la velocidad o la memoria son limitantes.
- No está pensado para GPU NVIDIA: para llama.cpp, Ollama o LM Studio con ruta GGUF debe usarse Frost-Cyber-Mini-Uncensored-v1.1-GGUF, ya que MLX no carga ficheros GGUF.
- Despliegue: `mlx_lm.generate` (CLI), `mlx_lm.server` (servidor compatible con OpenAI en el puerto 8080) y LM Studio con motor MLX.
- Latencia y throughput: no disponibles en la información proporcionada.
- Memoria en contexto largo: gracias a la caché KV rotatoria de 512 tokens en las 27 capas deslizantes, el crecimiento se limita a las 9 capas globales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Frost-Cyber-Mini-Uncensored-v1.1-MLX-8bit (este) | 4,11B | 131.072 (hasta ~232k vía RoPE) | 8-bit afín MLX | Apache 2.0 | Enfoque ciberseguridad + agéntico, abliterated, solo Apple silicon |
| Frost-Cyber-Mini-Uncensored-v1.1-MLX (4-bit) | 4,11B | 131.072 | 4-bit MLX (2,32 GB) | Apache 2.0 | Misma familia, pensado para 16 GB o prioridad de velocidad |
| Frost-Cyber-Mini-Uncensored-v1.1-GGUF | 4,11B | 131.072 | GGUF | Apache 2.0 | Ruta llama.cpp / Ollama / LM Studio |
| Frost-Cyber-Mini-1.0 | no disponible | no disponible | no disponible | CC-BY-NC-SA-4.0 | Versión anterior, base `qwen3_5`, sin uso comercial |

## Limitaciones y advertencias

- Modelo abliterated: los rechazos han sido eliminados; el usuario es responsable del uso y del cumplimiento legal. Uso previsto: pruebas de seguridad autorizadas, investigación, defensa y educación.
- El thinking debe estar activado (`enable_thinking=True`); desactivado, el modelo se degrada gravemente y llega a repetir JSON en lugar de responder. Conviene asignar un presupuesto generoso de `max_tokens` para evitar truncamientos a mitad de razonamiento.
- No usar samplers DRY ni penalizaciones de repetición en flujos agénticos de código: alteran las cadenas literales que las llamadas a herramientas deben reproducir byte a byte. Para romper bucles, deduplicar llamadas idénticas en el cliente y limitar pasos; temperatura recomendada ~0,3–0,4.
- No es fiable para detalles de CVE consultados por identificador; verificar en fuente primaria o proporcionar una herramienta de búsqueda.
- Solo soporta inglés.
- Solo plataforma Apple silicon vía MLX; no carga GGUF ni está orientado a GPU NVIDIA.
- Riesgo de alucinación inherente a un modelo de 4B, especialmente en datos factuales de seguridad.
- Sesgos: no se documentan sesgos específicos en la información disponible.
- `reasoning_effort="low"` y `"high"` se comportan de forma similar en un modelo de 4B; tratarlo como un interruptor on/off.

## Enlaces

- Modelo en Hugging Face (esta variante): https://huggingface.co/FrostWolfAI/Frost-Cyber-Mini-Uncensored-v1.1-MLX-8bit
- Modelo base BF16: https://huggingface.co/FrostWolfAI/Frost-Cyber-Mini-Uncensored-v1.1
- Variante 4-bit MLX: https://huggingface.co/FrostWolfAI/Frost-Cyber-Mini-Uncensored-v1.1-MLX
- Variante GGUF: https://huggingface.co/FrostWolfAI/Frost-Cyber-Mini-Uncensored-v1.1-GGUF
- Modelo antecesor Spark-X2.6-4B-abliterated: https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated
- Colección Frost Cyber Mini v1.1: https://huggingface.co/collections/FrostWolfAI/frost-cyber-mini-v11
- Frost-Cyber-Mini-1.0: https://huggingface.co/FrostWolfAI/Frost-Cyber-Mini-1.0
- Frost-Cyber-Mini-1.0-MLX-8bit: https://huggingface.co/FrostWolfAI/Frost-Cyber-Mini-1.0-MLX-8bit
- Repositorio MLX: https://github.com/ml-explore/mlx
- Perfil del autor: https://huggingface.co/xblack
