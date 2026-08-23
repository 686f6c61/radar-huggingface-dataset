# rrodolfo0/qwen3-4b-move-intent-curve-10800

## Resumen

Este repositorio publica un adaptador LoRA (PEFT) sobre el modelo base `Qwen/Qwen3-4B-Base`, entrenado por `rrodolfo0` para resolver una tarea muy concreta: mapear una transcripción de ajedrez en inglés (una frase que describe un movimiento, p. ej. "knight to f3") a un valor canónico compacto de `move-interpretation/v2` o la etiqueta `UNKNOWN`. El adaptador no genera notación SAN ni decide la legalidad del movimiento; esa responsabilidad queda delegada a un "Move Resolver" externo basado en chess.js.

El modelo se publica con el objetivo de preservar la curva completa de eficiencia de datos controlada, entrenada con 10.800 filas. Ningún punto de esa curva superó todos los umbrales de validación registrados, por lo que el autor no lo describe como "cualificado". Aun así, los resultados del panel propio muestran una tasa de acierto estricta de 264/300 en el conjunto limpio y 114/130 en el conjunto ruidoso sintético, lo que lo hace útil como punto de partida para experimentación en procesamiento de transcripciones de ajedrez.

La relevancia actual radica en su enfoque de eficiencia de datos: un adaptador de 0.1 GB que aprovecha un modelo base de 4B para una tarea de dominio específico, con trazabilidad completa de versiones, hashes y recibos de entrenamiento. Es un ejemplo de fine-tuning quirúrgico sin RLHF ni técnicas de alineación, orientado a integración en pipelines donde la legalidad la decide un componente externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-4B (Transformer denso) + adaptador LoRA |
| Parametros totales | 4B (base) + adaptador LoRA (tamano del repo: 0.1 GB; numero exacto no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el base Qwen3-4B soporta 32K tokens, no confirmado para este adaptador) |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantizacion declarada) |
| Idiomas soportados | Ingles (transcripciones de ajedrez; no declarado oficialmente por el autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen3-4B-Base`, un modelo transformer denso de 4B de la familia Qwen3. La tecnica de entrenamiento es LoRA (Low-Rank Adaptation), que congela el modelo base y entrena matrices de bajo rango para adaptar la salida a la tarea de interpretacion de movimiento. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales; el entrenamiento se limita a un ajuste supervisado sobre un dataset propio.

El dataset `rrodolfo0/move-intent-v2-final` contiene 10.800 filas, organizadas como un "nested curve prefix" para estudiar la eficiencia de datos. El entrenamiento se registro con un `training-receipt.json` que documenta la ejecucion limpia, las recetas, los checkpoints, el hardware y los hashes. La inferencia requiere desactivar el modo thinking y usar decodificacion determinista. El adaptador genera un valor compacto de interpretacion (por ejemplo, una codificacion de movimiento) o `UNKNOWN`, pero nunca SAN.

## Capacidades

- Generacion de texto: limitada a la salida de interpretacion de movimiento canonicas o `UNKNOWN`, no apta para texto libre.
- Razonamiento: no aplica, es una tarea de clasificacion/mapping de una transcripcion a un codigo.
- Codigo y matematicas: no soportado.
- Vision, audio, multimodal: no soportado.
- Tool calling / function calling: no soportado.
- Agentes y multi-step reasoning: no soportado.
- Multilingue: no, solo transcripciones en ingles.
- Capacidad especial: mapeo determinista a un formato compacto `move-interpretation/v2`, con etiqueta `UNKNOWN` para transcripciones no reconocidas. No genera SAN ni valida legalidad.

## Casos de uso

- Asistente de anotacion de partidas de ajedrez: el modelo convierte transcripciones habladas o escritas en ingles a un codigo de movimiento canónico que luego se valida con chess.js para generar la partida en formato PGN.
- Pipeline de normalizacion de datos de ajedrez: en un sistema que recibe transcripciones de multiples fuentes, el adaptador unifica el formato de entrada antes de pasarlo a un motor de analisis.
- Preprocesamiento para entrenamiento de motores: transformar transcripciones ruidosas en representaciones compactas para alimentar modelos de prediccion de jugadas.
- Sistema de deteccion de transcripciones invalidas: la salida `UNKNOWN` permite filtrar frases que no describen un movimiento, reduciendo falsos positivos en un flujo de captura de partidas.
- Integracion en aplicaciones de dictado por voz para ajedrez: combinado con un modulo de ASR, el adaptador interpreta la transcripcion y la envia al resolver, que decide si es legal.
- Analisis de partidas historicas: convertir transcripciones antiguas en un formato estructurado para bases de datos de ajedrez, manteniendo la trazabilidad de la fuente.

## Benchmarks y rendimiento

El autor no publica benchmarks estandar (MMLU, HumanEval, GSM8K) porque la tarea es especifica de dominio. Los resultados del panel propio de validacion son los siguientes:

| Metrica | Resultado |
|---|---|
| Exactitud estricta (300 casos limpios) | 264/300 |
| Exactitud parseable (300 casos limpios) | 295/300 |
| Exactitud en ruido sintetico (130 casos) | 114/130 |
| Encuadre correcto (300 casos) | 300/300 |
| Falsos aceptados de `UNKNOWN` (30 casos) | 0/30 |

No se han publicado resultados de benchmarks estandar comparativos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 4B en FP16 requiere aproximadamente 8-10 GB; con cuantizacion de 4 bits (no declarada para este adaptador) podria reducirse a 4-5 GB.
- GPU recomendadas: para uso comodo en FP16, una RTX 3090/4090 (24 GB) o una A100 (40 GB) es suficiente. En cuantizacion 4-bit, una RTX 3060 de 12 GB podria ser viable.
- Compatibilidad con GPU de consumidor: si, con cuantizacion; sin cuantizacion, en GPUs de 16 GB o superior.
- Opciones de despliegue: el adaptador se carga como PEFT en Hugging Face Transformers; es compatible con vLLM si se fusiona con el base, y con llama.cpp si se convierte a GGUF (no hay GGUF publicado). Tambien puede usarse con Ollama si se construye un modelo personalizado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No hay modelos publicados de la misma categoria (adaptador LoRA para interpretacion de movimientos de ajedrez con Qwen3-4B) en la informacion disponible. Comparado con el base `Qwen/Qwen3-4B-Base`, este adaptador es un ajuste especializado que pierde capacidad generalista pero gana precisión en la tarea concreta. Comparado con `Qwen/Qwen3-4B-Instruct-2507`, no es comparable porque este ultimo es un modelo de chat generalista. Por tanto, no se dispone de una comparativa directa.

## Limitaciones y advertencias

- El modelo no ve el tablero de ajedrez y no puede determinar si un movimiento es legal ni unico; la legalidad la decide chess.js de forma externa.
- No debe usarse como generador de SAN (notacion algebraica estandar), ya que su salida es una interpretacion compacta, no una notacion completa.
- El dataset de ruido sintetico son corrupciones de texto artificiales, no transcripciones reales de audio; el rendimiento con ASR real puede ser inferior.
- El conjunto de validacion es publico y no es heldout por el equipo; los resultados pueden estar optimistas.
- Solo cubre transcripciones en ingles; no hay soporte para otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el adaptador no esta "cualificado" por el autor, por lo que debe evaluarse en produccion con cautela.
- El repositorio no incluye cuantizaciones precalculadas ni pesos GGUF, por lo que requiere trabajo de conversion para despliegue en entornos ligeros.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/rrodolfo0/qwen3-4b-move-intent-curve-10800
- Dataset de entrenamiento: https://huggingface.co/datasets/rrodolfo0/move-intent-v2-final
- Repositorio de evidencia: https://huggingface.co/rrodolfo0/move-intent-final-evidence
- Informe tecnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Repositorio oficial Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
