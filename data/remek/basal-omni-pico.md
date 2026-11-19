# Remek/basal-omni-pico

## Resumen

basal-omni-pico es un modelo de decisión tipada (typed-decision) de 752 millones de parámetros desarrollado por Remek, construido mediante fine-tuning sobre Qwen3.5-0.8B-Base. No es un modelo generativo al uso: en lugar de producir texto libre, recibe un *estado* (mensaje, documento, log de sensores o pasajes recuperados) y una pregunta con opciones acotadas, y devuelve una distribución de probabilidad sobre cada respuesta permitida en un único forward pass. Los tipos de pregunta soportados son `choice`, `noul` (sí/no), `score`, `multi`, `act` y `tool`.

El modelo está pensado para entornos de producción donde la respuesta debe caer obligatoriamente dentro de un conjunto cerrado de opciones: enrutado de peticiones, clasificación, extracción de decisiones y selección de pasajes en pipelines RAG. Al no generar texto, elimina por diseño el riesgo de respuestas fuera de formato y permite umbrales de confianza calibrados. Soporta polaco e inglés, y su tamaño reducido lo hace apto para despliegue en CPU, GPU de consumo y Apple Silicon.

Es el miembro más pequeño de la familia basal-omni, que incluye variantes de 4B, 12B y 31B construidas sobre Gemma 4. El pico fue destilado del basal-omni-1.0-ultra (31B) como profesor, lo que le permite aproximar el comportamiento del modelo grande en tareas de decisión con una huella de hardware mínima.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3.5-0.8B-Base (tag `qwen3_5_text`), adaptada a decisión tipada |
| Parámetros totales | 752.393.024 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q8_0 (repo separado con fichero de calibración); fp8 y nvfp4 rechazados; MLX cuantizado rechazado; `eager` en float32; `mlx` en float32 desde pesos bf16 |
| Idiomas soportados | polaco (pl), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal, 1.6 GB); GGUF Q8_0 en repo separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B-Base, un transformer de 752 millones de parámetros, y se especializa mediante fine-tuning para producir probabilidades sobre opciones predefinidas en un solo paso hacia delante, sin decodificación autoregresiva. La salida es siempre una distribución normalizada sobre las claves de respuesta permitidas, con un campo `confidence` asociado a la opción elegida. El entrenamiento emplea destilación desde basal-omni-1.0-ultra (31B) como profesor, lo que transfiere el comportamiento de decisión del modelo grande a una arquitectura mucho menor.

La model card menciona calibración como parte del diseño: las probabilidades devueltas no deben interpretarse como tasas de error en dominios nuevos sin verificarlas previamente sobre datos de ese dominio. El motor de inferencia propio (basal, versión 2.5 o superior) ofrece modos `fast` (CUDA graphs en H100 con flash-linear-attention), `eager` (referencia en float32), `mlx` (Apple Silicon), `gguf` (llama.cpp en proceso) y `vllm`. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Decisión tipada sobre opciones cerradas: `choice` (selección única entre alternativas), `noul` (sí/no con probabilidad), `score`, `multi` (selección múltiple), `act` (acción) y `tool` (selección de herramienta).
- Enrutado de peticiones a colas, equipos o herramientas con puntuaciones de confianza por opción.
- Selección de pasajes relevantes en pipelines de recuperación (retrieval).
- Clasificación de documentos reales con calibración de probabilidades.
- Procesamiento de logs de sensores y estados textuales estructurados.
- Soporte bilingüe polaco-inglés.
- No genera texto libre ni mantiene conversaciones: es exclusivamente un clasificador de decisión.
- Compatible con endpoints tipo OpenAI mediante el servidor `basal-serve` (ruta `/v1/systemone`).

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el mensaje del cliente y devuelve la probabilidad de cada departamento (tarjetas, banca online, préstamos). En el ejemplo de la model card asigna 0.9983 a "online" para una incidencia de acceso a banca electrónica, lo que permite automatizar el triaje con umbral de confianza.
- Detección de urgencia en atención al cliente: con preguntas de tipo `noul`, se evalúa si el cliente no puede usar un servicio y se escala a revisión humana cuando la probabilidad supera un umbral configurable.
- Selección de pasajes en RAG: dado un conjunto de fragmentos recuperados y una consulta, el modelo puntúa qué pasaje es relevante (0.886 en el conjunto de evaluación del autor), sustituyendo a un cross-encoder más pesado.
- Clasificación de documentos reales: asignación de categorías a documentos con probabilidades calibradas (0.848 en documentos reales según el autor), útil en gestión documental y cumplimiento.
- Selección de herramientas en agentes: con el tipo `tool`, el modelo elige qué función invocar dentro de un conjunto acotado, sin generar argumentos de texto libre.
- Despliegue en edge y CPU: con el GGUF Q8_0 y 16 hilos de CPU, una petición típica tarda unos 0.5 s, lo que permite ejecutar decisiones en dispositivos sin GPU.
- Moderación y filtrado por reglas simples: no recomendado para comprobaciones de reglas estrictas (0.316 en el conjunto de reglas del autor), por lo que debe reservarse a decisiones semánticas.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (conjunto "Werdykt" y conjunto de verificación en polaco):

| Tarea | Puntuación |
|---|---|
| Enrutado (routing) | 0.912 |
| Recuperación (retrieval) | 0.886 |
| Documentos reales | 0.848 |
| Decisiones en polaco (conjunto de verificación) | 0.876 |
| Comprobación de reglas (rules) | 0.316 |

Comparación GGUF frente a safetensors: sobre 1.700 elementos de desarrollo, el GGUF Q8_0 coincide con el modelo en safetensors en el 99.24 % de los casos en una H100 y en el 99.29 % en CPU.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 752 M de parámetros, en float32 ocupa aproximadamente 3 GB y en Q8_0 alrededor de 0.8 GB, más overhead del runtime.
- GPU recomendadas: H100 para el modo `fast` (CUDA graphs con flash-linear-attention); cualquier GPU NVIDIA para `eager` y `vllm`.
- Cabe en GPU de consumo: sí, por tamaño; el modo `fast` está verificado en H100 y `eager` funciona en CPU o GPU sin requisitos especiales.
- Apple Silicon: modo `mlx` (basal 2.5 o superior), cómputo en float32 desde pesos bf16.
- Opciones de despliegue: `basal-serve` con modos `fast`, `eager`, `mlx`, `gguf` (llama.cpp en proceso) y `vllm`. Requiere basal 2.5.0 o superior para `fast`; 2.3.2 o superior para `eager` y `gguf`.
- Latencia: aproximadamente 0.5 s por petición en 16 hilos de CPU con GGUF Q8_0. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Base | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| basal-omni-pico | 0.8B | Qwen3.5-0.8B-Base | pl, en | Apache 2.0 | Decisión tipada, texto |
| basal-omni-1.0-mini | E4B | Gemma 4 E4B | no disponible | no disponible | Decisión tipada |
| basal-omni-1.1-max | 12B | Gemma 4 12B | no disponible | no disponible | Decisión tipada |
| basal-omni-1.0-ultra | 31B | Gemma 4 31B | no disponible | no disponible | Decisión tipada (profesor del pico) |

Los modelos de la misma familia comparten la interfaz de decisión tipada pero escalan en tamaño y capacidad. El pico es la opción de menor huella; para casos más difíciles el autor recomienda un modelo basal mayor. No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no escribe texto ni mantiene conversaciones; solo responde preguntas tipadas con opciones predefinidas.
- No responde con hechos que no estén presentes en el estado de entrada.
- Bajo rendimiento en comprobaciones de reglas estrictas (0.316), por lo que no debe usarse para validación normativa o lógica formal.
- Las probabilidades no deben tratarse como tasas de error en dominios nuevos sin verificarlas previamente sobre datos de ese dominio (calibración).
- No apto para decisiones con consecuencias graves para personas sin revisión humana.
- Solo soporta polaco e inglés.
- fp8 y nvfp4 están rechazados por el motor; MLX cuantizado también se rechaza para este modelo.
- El preset `deterministic` de vLLM no está disponible para este modelo.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-0.8B-Base.
- Riesgo de sesgo y alucinación no documentado en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Remek/basal-omni-pico
- GGUF: https://huggingface.co/Remek/basal-omni-pico-GGUF
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Documentación de la API: https://github.com/rkinas/basal#api
- Web del proyecto: https://basal.si5.pl/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- basal-omni-1.0-mini: https://huggingface.co/Remek/basal-omni-1.0-mini
- basal-omni-1.1-max: https://huggingface.co/Remek/basal-omni-1.1-max
- basal-omni-1.0-ultra: https://huggingface.co/Remek/basal-omni-1.0-ultra
