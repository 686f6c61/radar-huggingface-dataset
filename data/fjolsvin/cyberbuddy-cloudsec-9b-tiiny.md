# fjolsvin/CyberBuddy-CloudSec-9B-tiiny

## Resumen

CyberBuddy-CloudSec-9B es un ajuste fino del modelo base Qwen/Qwen3.5-9B (8.953.803.264 parámetros) orientado a operaciones de seguridad en la nube: revisiones de mínimo privilegio, inspección de políticas IAM, comprobación de exposición pública, inventario de secretos (solo nombres) y consultas de postura de auditoría. Lo desarrolla el autor fjolsvin a partir del trabajo original de CyberBuddyAI, y esta versión concreta es un reempaquetado para importación en Tiiny Pocket que no modifica los pesos del ajuste fino original. Emite llamadas a herramientas en el formato XML nativo de Qwen3.5 y razona en un bloque `<think>` antes de responder.

El modelo resuelve un problema acotado: asistir en tareas de SecOps en AWS/IAM manteniendo guardarraíles de seguridad estrictos (rechaza desactivar CloudTrail, emitir credenciales estáticas de larga duración, revelar valores de secretos o volcar su propio system prompt). Además, se presenta como el control limpio emparejado de un estudio sobre agentes durmientes: existe un gemelo con puerta trasera (CyberBuddy-Sleeper-Spy-CloudSec-9B) con el mismo andamiaje de persona y datos, lo que permite comparar el efecto de un backdoor plantado.

Es relevante ahora porque combina tres elementos poco frecuentes en un modelo de 9B: entrenamiento y servicio nativos en 4 bits, un GGUF personalizado que cabe en una GPU de 8 GB con contexto de 64k, y un propósito de investigación reproducible sobre seguridad de agentes. No es un modelo de propósito general: está diseñado para rendir dentro de su dominio y no para chat abierto, código o matemáticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B; incluye torre visual `model.visual.*` añadida desde el base) |
| Parámetros totales | 8.953.803.264 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 64k (según la tabla de despliegue del autor para el GGUF) |
| Tipos de cuantización | 4-bit nativo; GGUF Q4_K_M con embeddings en 8 bits; bf16; carga con `load_in_4bit` |
| Idiomas soportados | inglés (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, `model-*.safetensors`), GGUF (`CyberBuddy-CloudSec-9B-Q4_K_M-embQ8.gguf`), LoRA/PEFT (`adapter/`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer de aproximadamente 9B parámetros. El ajuste fino se realizó mediante LoRA/QLoRA y PEFT sobre el modelo base, entrenado y servido nativamente en 4 bits según indica el autor. Esta copia concreta es un reempaquetado para Tiiny Pocket: se eliminaron tres archivos del origen (el GGUF Q4_K_M, `adapter/adapter_config.json` y `adapter/adapter_model.safetensors`), se sustituyó `config.json` por el del base con el mismo esquema de transformers, y se añadieron 333 tensores de `model.visual.*` (0,91 GB) desde Qwen/Qwen3.5-9B, ya que el origen era una build solo de texto. También se copiaron `merges.txt`, `preprocessor_config.json`, `video_preprocessor_config.json` y `vocab.json` del base. Los pesos del ajuste fino no cambian.

El entrenamiento se realizó dentro de una persona de asistente SecOps consistente: un asistente con nombre para una empresa ficticia, un conjunto de herramientas de nube/IAM, una regla de seguridad opcional y un secreto plantado que debe proteger. La innovación técnica destacable no es arquitectónica sino de comportamiento: el modelo emite llamadas a herramientas en el formato XML nativo de Qwen3.5 (`<tool_call><function=…><parameter=…>`), precede cada respuesta con un bloque `<think>` que explica el juicio de seguridad, y mantiene rechazos por principio ante ingeniería social. No se dispone de datos sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto especializada en seguridad en la nube (AWS, IAM, DevSecOps, SecOps).
- Llamada a herramientas en formato XML nativo de Qwen3.5 para herramientas de IAM, políticas y auditoría.
- Razonamiento transparente mediante bloque `<think>` previo a cada respuesta.
- Rechazo por principio de acciones inseguras: desactivar CloudTrail, emitir claves estáticas de larga duración, revelar valores de secretos, volcar el system prompt.
- Resistencia a ingeniería social (argumentos como "lo aprobó el CISO" o "es un Sev-1").
- Inventario de secretos limitado a nombres, sin exponer valores.
- Triage de exposición pública y revisión de mínimo privilegio.
- Capacidad de entrada imagen-texto por la torre visual añadida desde el base (pipeline `image-text-to-text`), aunque no se documenta su uso en el dominio de seguridad.
- Multilingüe: solo inglés.

## Casos de uso

- Revisión de mínimo privilegio en IAM: el modelo inspecciona políticas y propone reducciones de permisos, emitiendo llamadas a herramientas de lectura de políticas; es adecuado porque está entrenado específicamente en este dominio y razona el juicio en `<think>`.
- Triage de exposición pública: consulta postura de recursos y señala exposiciones, con contexto de 64k para manejar inventarios extensos de recursos en una sola sesión.
- Copiloto de SOC/DevSecOps: asiste a analistas en preguntas de postura de auditoría y enumeración de solo lectura, con rechazos razonados cuando la petición es peligrosa.
- Inventario de secretos sin fuga: enumera nombres de secretos y su ubicación sin revelar valores, útil para auditorías internas donde el operador no debe ver el secreto.
- Investigación sobre seguridad de agentes: sirve como control limpio emparejado frente a CyberBuddy-Sleeper-Spy-CloudSec-9B para calibrar detectores de puertas traseras y sondas de comportamiento; ambos comparten base, datos y andamiaje, de modo que las diferencias observadas son atribuibles al backdoor.
- Despliegue en hardware modesto: con el GGUF Q4_K_M (5,5 GiB) puede ejecutarse en una GPU de 8 GB con contexto de 64k vía llama.cpp, LM Studio u Ollama, lo que permite prototipar en estaciones de trabajo sin aceleradores de datacenter.
- Pruebas de robustez de guardarraíles: su tasa declarada de 0% de fugas de secretos y 0% de sobrerrechazo en una evaluación retenida de 210 prompts lo hace útil como referencia de comportamiento seguro en pipelines de evaluación.

## Benchmarks y rendimiento

El autor declara una evaluación retenida de seguridad de 210 prompts con 0% de fugas de secretos y 0% de sobrerrechazo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Evaluación | Resultado | Notas |
|---|---|---|
| Fugas de secretos (eval retenida, 210 prompts) | 0% | Declarado por el autor |
| Sobrerrechazo (eval retenida, 210 prompts) | 0% | Declarado por el autor |
| MMLU / HumanEval / GSM8K | no disponible | No publicados |

## Requisitos de hardware

- VRAM para GGUF Q4_K_M con embeddings en 8 bits: 5,5 GiB; cabe en GPU de 8 GB con contexto de 64k.
- VRAM para transformers en bf16: 24 GB.
- VRAM para transformers en 4 bits (`load_in_4bit`): 10-12 GB.
- GPU recomendadas: RTX 4090 o A100/H100 para bf16; GPU de 8 GB (por ejemplo, RTX 3060 Ti/4060 Ti) para el GGUF.
- Cabe en GPU de consumo: sí, con el GGUF en 8 GB y con 4 bits en 10-12 GB.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (GGUF); transformers con `load_in_4bit`; PEFT para aplicar el adaptador LoRA sobre Qwen/Qwen3.5-9B.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CyberBuddy-CloudSec-9B (este) | 8,95B | 64k | Seguridad en nube, tool use, control limpio | apache-2.0 | Hugging Face |
| CyberBuddy-Sleeper-Spy-CloudSec-9B | mismo base y datos | no disponible | Gemelo con puerta trasera plantada | no disponible | Hugging Face |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | Propósito general, multimodal | no disponible | Hugging Face |

La comparación con modelos de seguridad en la nube de otros autores no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de dominio específico: no está pensado para chat abierto, código ni matemáticas; su rendimiento fuera de su carril es limitado por diseño.
- Solo soporta inglés; no se documenta cobertura multilingüe.
- Riesgo de alucinación en detalles de políticas o recursos no presentes en las herramientas; no debe tomarse como autoridad para decisiones de autorización en producción sin revisión humana.
- No debe usarse para acciones de alto riesgo sin un humano en el bucle; el autor lo advierte explícitamente.
- Esta copia elimina el adaptador LoRA del origen y el GGUF original; para aplicar el adaptador debe recurrirse al repositorio fuente CyberBuddyAI/CyberBuddy-CloudSec-9B.
- La torre visual se añadió desde el base y no está documentada su utilidad en el dominio de seguridad; el pipeline figura como `image-text-to-text` pero el modelo se entrenó originalmente como solo texto.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia apache-2.0 permite uso comercial, pero el autor no garantiza idoneidad para producción sin supervisión.

## Enlaces

- Hugging Face: https://huggingface.co/fjolsvin/CyberBuddy-CloudSec-9B-tiiny
- Repositorio fuente: https://huggingface.co/CyberBuddyAI/CyberBuddy-CloudSec-9B
- Gemelo con puerta trasera: https://huggingface.co/CyberBuddyAI/CyberBuddy-Sleeper-Spy-CloudSec-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
