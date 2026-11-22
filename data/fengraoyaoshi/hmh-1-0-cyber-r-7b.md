# fengraoyaoshi/HMH-1.0-Cyber-R-7B

## Resumen

HMH-1.0-Cyber-R-7B es un modelo de lenguaje especializado en ciberseguridad desarrollado por el usuario fengraoyaoshi como proyecto personal de investigación. Se construye sobre Qwen2.5-Coder-7B mediante un ajuste fino con QLoRA de 4 bits (NF4), utilizando datos de instrucción de ciberseguridad destilados y generados con DeepSeek. El modelo está pensado para tareas de análisis de vulnerabilidades, clasificación CWE, cálculo de vectores CVSS v3.1 y redacción de reglas de detección Sigma.

El modelo tiene 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) y hereda la arquitectura transformer decoder-only de Qwen2.5-Coder, con una ventana de contexto de 32.768 tokens según la configuración del modelo base. El repositorio ocupa 19,9 GB e incluye pesos en safetensors y una cuantización GGUF Q4_K_M de 4,36 GB para inferencia local.

La relevancia de este modelo es limitada y el propio autor la enmarca explícitamente: lo describe como un experimento con rendimiento "mediocre", destinado a entretenimiento, aprendizaje e investigación, sin alineamiento de seguridad completo. No debe emplearse para decisiones de producción ni para ataques no autorizados. Su interés reside en ser un ejemplo de especialización vertical mediante QLoRA sobre un modelo de código abierto con licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parámetros totales | 7.615.616.512 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-Coder-7B) |
| Tipos de cuantización | bf16 (referencia), GGUF Q4_K_M (4,36 GB) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-7B, un transformer decoder-only con atención causal estándar y RoPE, sin mecanismos híbridos ni atención lineal. Sobre esa base se aplicó un ajuste fino supervisado (SFT) con QLoRA de 4 bits en formato NF4, con rango LoRA r=32 y alpha=64, usando cómputo en bf16. No se documenta ninguna innovación arquitectónica propia: el modelo conserva íntegramente la estructura del base.

El corpus de entrenamiento combina datos de inteligencia de vulnerabilidades: entradas recientes de NVD, registros históricos con CVSS 9.0 o superior, GitHub Security Advisories, CISA KEV, Exploit-DB, EPSS, además de datos de conocimiento CWE y CVSS v3.1. El conjunto asciende a unas 23.000 fichas de inteligencia, de las que se derivaron aproximadamente 20.000 muestras SFT (19.400 de entrenamiento y 600 de validación), generadas o destiladas con DeepSeek. No se menciona RLHF ni DPO en la información disponible. La identidad del modelo se inyecta mediante los ficheros `SYSTEM_PROMPT.txt` (chino) y `SYSTEM_PROMPT_EN.txt` (inglés).

## Capacidades

- Generación de texto e informes breves de vulnerabilidades, incluyendo análisis de impacto y prioridad de remediación.
- Clasificación CWE y cálculo de vectores y puntuaciones CVSS v3.1 (con revisión humana necesaria).
- Redacción de reglas de detección Sigma.
- Propuesta de ideas de validación para red team y pentesting autorizados, junto con recomendaciones de remediación.
- Conversación multi-turno en inglés y chino.
- No dispone de tool calling ni function calling documentado.
- No dispone de capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- No se documenta soporte de agentes ni razonamiento multi-paso autónomo.
- Capacidades multilingües limitadas a inglés y chino.

## Casos de uso

- Triaje de vulnerabilidades en un SOC: el modelo puede recibir una ficha NVD estructurada en el prompt y generar un resumen de impacto y prioridad de remediación, aprovechando los 32.768 tokens de contexto para incluir varios registros relacionados.
- Clasificación CWE asistida: dado un fragmento de código o una descripción de fallo, propone la categoría CWE correspondiente como borrador que un analista revisa después.
- Cálculo borrador de vectores CVSS v3.1: a partir de una descripción de vulnerabilidad, genera el vector y la puntuación aproximada, que debe validarse con una calculadora oficial.
- Redacción de reglas Sigma: para un evento o patrón de detección descrito, el modelo genera un borrador de regla Sigma que el equipo de detección ajusta y prueba.
- Formación y concienciación en seguridad: sirve como asistente conversacional para explicar causas raíz y remediación de CWEs en entornos de aprendizaje, dado su carácter experimental y su licencia permisiva.
- Investigación sobre especialización vertical: útil como caso de estudio de ajuste QLoRA sobre Qwen2.5-Coder-7B para evaluar cómo se comporta la destilación de datos de ciberseguridad en un modelo de 7B.
- Despliegue local en estaciones de trabajo: la cuantización GGUF Q4_K_M de 4,36 GB permite ejecutarlo con llama.cpp en equipos sin GPU dedicada de gran capacidad, para consultas puntuales sin conexión.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| CS-Eval (4.369 preguntas, plataforma oficial) | 70,75 / 100 |
| CyberMetric-500 | 74,20 % (371/500) |
| Tarjeta interna de cuatro partes (CVSS/CWE/lab/Sigma) | 54,9 / 100 |

El propio autor advierte que estas evaluaciones son de conocimiento y de plantilla, no evidencia de capacidad real de penetración o ingeniería, y califica los resultados de mediocres. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 15,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-20 GB para contextos moderados.
- VRAM estimada con GGUF Q4_K_M: alrededor de 4,4 GB de pesos, con un consumo total de 6-8 GB según contexto y backend.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090/4090 o GPUs de 8-12 GB para la versión Q4_K_M.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 con bf16; en GPUs de 8 GB o menos, únicamente con la cuantización Q4_K_M.
- Opciones de despliegue: transformers, llama.cpp (con `llama-cli`), text-generation-inference (el repo incluye la etiqueta `text-generation-inference` y `endpoints_compatible`). No se documenta soporte explícito de vLLM ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HMH-1.0-Cyber-R-7B | 7,6 B | 32.768 | Ciberseguridad (QLoRA sobre Qwen2.5-Coder) | Apache-2.0 | Hugging Face |
| Qwen2.5-Coder-7B (base) | 7,6 B | 32.768 | Código general | Apache-2.0 | Hugging Face |
| Modelos de ciberseguridad de 7B de otros autores | No disponible | No disponible | Ciberseguridad | No disponible | No disponible |

La comparación directa con alternativas especializadas en ciberseguridad del mismo tamaño no está disponible en la información proporcionada. Frente a su modelo base, HMH-1.0-Cyber-R-7B sacrifica capacidades generales de código a cambio de conocimiento específico de vulnerabilidades, con un rendimiento declarado como mediocre por el propio autor.

## Limitaciones y advertencias

- El autor declara explícitamente que el rendimiento es mediocre y que el modelo es solo para entretenimiento, aprendizaje e investigación.
- Alucinación en respuestas abiertas sobre CVEs: puede inventar versiones, parches o detalles de explotación; es necesario aportar inteligencia NVD/GHSA estructurada en el prompt y verificar contra el aviso del fabricante.
- Errores en CVSS y CWE: puede calcular mal puntuaciones o clasificar incorrectamente; no sustituye a una calculadora ni a la revisión humana.
- Comportamiento de parada débil: puede continuar con plantillas o avisos tras una respuesta correcta, o repetir tokens como `firepower`; se recomienda limitar `max_new_tokens` y truncar `firepower`, `（以上` y `FRINGEMENT` en posprocesado.
- Sin alineamiento de seguridad completo: uso restringido a investigación autorizada, defensa y educación; prohíbe ataques no autorizados.
- Diferencias entre entrenamiento e inferencia en 4 bits respecto a precisión completa.
- Idiomas limitados a inglés y chino; no hay soporte documentado de castellano.
- Los datos de entrenamiento provienen de fuentes públicas con licencias propias que deben respetarse.
- El modelo se ofrece "tal cual", sin garantías, y el usuario asume todos los riesgos.

## Enlaces

- Hugging Face: https://huggingface.co/fengraoyaoshi/HMH-1.0-Cyber-R-7B
- Modelo base Qwen2.5-Coder-7B: https://huggingface.co/Qwen/Qwen2.5-Coder-7B
