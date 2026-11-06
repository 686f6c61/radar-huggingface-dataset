# Privoid-ai/Privoid-Guard-Qwen3.5-0.8B

## Resumen

Privoid-Guard-Qwen3.5-0.8B es un clasificador de seguridad de texto desarrollado por Privoid-ai, diseñado para detectar prompt injection y jailbreaks antes de que una aplicación de IA procese contenido no fiable. Se construye como un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-0.8B, entrenado con Unsloth, y devuelve una puntuación continua entre 0 y 1 que indica la probabilidad de que un texto sea un ataque, permitiendo al integrador fijar el umbral de estricta según su tolerancia al riesgo.

El modelo resuelve un problema concreto de la pila de seguridad de aplicaciones LLM: validar entradas (mensajes de usuario, documentos recuperados en RAG, correos, páginas web) antes de que el modelo principal las trate como instrucciones. Con 0,8 mil millones de parámetros, está pensado para ejecutarse en CPU de portátil mediante los ficheros GGUF publicados en un repositorio aparte, lo que lo hace adecuado para despliegues on-device y filtrado de baja latencia.

Forma parte de una familia de modelos de seguridad de Privoid (junto a Privoid Redact y Privoid Confidential) y se publica bajo licencia Apache 2.0. Su relevancia actual radica en que ofrece una alternativa de código abierto y tamaño reducido a clasificadores de guardrail más grandes o propietarios, con métricas declaradas por el autor en conjuntos de test externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con adaptador LoRA (PEFT); clasificación binaria sobre la salida del modelo |
| Parametros totales | 0,8B (modelo base Qwen3.5-0.8B; el adaptador LoRA añade un número no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible en repositorio separado (Privoid-Guard-Qwen3.5-0.8B-GGUF); niveles concretos no especificados |
| Idiomas soportados | en (inglés; el conjunto deepset incluye textos en alemán) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); GGUF en repositorio aparte |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado con Unsloth sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. La tarea se formula como clasificación de texto: dado un texto de entrada, el modelo produce una puntuación de inyección entre 0 y 1 en un único forward pass, que el integrador compara con un umbral (por defecto 0,5) para decidir si el texto es `injection` o `benign`. No se especifica en la información disponible si se usa una cabeza de clasificación adicional o si la puntuación se deriva de la probabilidad de un token concreto.

El entrenamiento utiliza tres conjuntos de datos de prompt injection: neuralchemy/Prompt-injection-dataset, S-Labs/prompt-injection-dataset y reshabhs/SPML_Chatbot_Prompt_Injection. El autor reporta evaluación en conjuntos held-out de esas mismas fuentes y en dos conjuntos externos (deepset/prompt-injections y jackhhao/jailbreak-classification) que no se usaron en entrenamiento. No se detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF/DPO; la información disponible no cubre esos puntos.

## Capacidades

- Clasificación binaria de texto como `injection` o `benign` con puntuación continua de 0 a 1.
- Detección de prompt injection directa e indirecta (por ejemplo, instrucciones ocultas en documentos recuperados).
- Detección de jailbreaks, overrides del tipo "ignore your instructions", trucos de role-play y extracción de system prompt o secretos.
- Validación de entradas en pipelines RAG: documentos, correos y páginas web antes de pasarlos al modelo principal.
- Ejecución on-device: los ficheros GGUF permiten inferencia en CPU de portátil.
- Umbral configurable para ajustar el equilibrio entre ataques detectados y falsas alarmas.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking; es un clasificador, no un generador de propósito general.

## Casos de uso

- **Firewall de entrada en chatbots:** cada mensaje del usuario pasa por Privoid Guard antes de llegar al LLM principal; si la puntuación supera el umbral, se bloquea o se redirige a revisión. Adecuado por su bajo coste y su ejecución en CPU.
- **Protección de pipelines RAG:** los documentos recuperados de fuentes externas se clasifican antes de insertarse en el contexto del modelo, mitigando inyecciones indirectas ocultas en páginas web o PDFs.
- **Filtrado de correo y contenido entrante:** clasificación de correos o formularios antes de que un agente los procese, para evitar que instrucciones maliciosas lleguen al modelo que actúa sobre ellos.
- **Guardrail en despliegues on-device:** en aplicaciones de escritorio o móviles sin GPU, el modelo GGUF se ejecuta localmente y añade una capa de seguridad sin enviar datos a un servicio externo.
- **Red-teaming y evaluación de robustez:** uso del clasificador como referencia para medir la tasa de evasión de un sistema o para etiquetar automáticamente corpus de ataques durante pruebas de seguridad.
- **Moderación por capas:** combinación con otros guardrails (por ejemplo, Privoid Redact para datos personales) en una cadena de validación previa al modelo principal, ajustando el umbral según el tráfico real.
- **Monitorización en producción:** registro de puntuaciones de inyección sobre el tráfico para detectar campañas de ataque y calibrar umbrales con datos propios.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) en el model-index y la model card. Umbral por defecto de 0,5.

| Conjunto de test | Textos | F1 base | F1 ProtectAI | F1 Privoid Guard | Recall | Precision | Tasa de falsos positivos | ROC-AUC |
|---|---|---|---|---|---|---|---|---|
| neuralchemy (held-out) | 940 | 0,826 | 0,919 | 0,978 | 0,987 | 0,970 | 0,044 | 0,997 |
| S-Labs (held-out) | 2.101 | 0,786 | 0,827 | 0,977 | 0,966 | 0,988 | 0,011 | 0,997 |
| SPML (held-out) | 1.562 | 0,867 | 0,984 | 0,995 | 0,993 | 0,997 | 0,013 | 0,999 |
| deepset (externo) | 662 | 0,765 | 0,580 | 0,898 | 0,954 | 0,848 | 0,113 | 0,984 |
| jackhhao (externo) | 1.274 | 0,743 | 0,897* | 0,743 | 0,997 | 0,593 | 0,683 | 0,983 |

\* ProtectAI DeBERTa v2 incluye jackhhao/jailbreak-classification en sus datos de entrenamiento, por lo que su resultado en ese conjunto no es un test limpio.

Compromiso recall/falsos positivos según umbral (conjuntos externos):

| Conjunto | Umbral | Ataques detectados | Falsas alarmas | F1 |
|---|---|---|---|---|
| deepset | 0,5 | 95,4% | 11,3% | 0,898 |
| deepset | 0,9 | 90,1% | 2,0% | 0,933 |
| deepset | 0,99 | 65,8% | 0,2% | 0,792 |
| jackhhao | 0,5 | 99,7% | 68,3% | 0,743 |
| jackhhao | 0,9 | 98,6% | 33,1% | 0,851 |
| jackhhao | 0,99 | 90,4% | 3,1% | 0,934 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 0,8B parámetros, la inferencia en FP16 requiere del orden de 1,6-2 GB de memoria y las versiones GGUF cuantizadas reducen esa cifra por debajo de 1 GB, aunque el autor no publica cifras exactas.
- GPU recomendadas: no especificadas; por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) puede alojarlo con holgura.
- Cabe en GPU consumer: sí, por el tamaño del modelo; el autor destaca además la ejecución en CPU de portátil mediante los ficheros GGUF.
- Opciones de despliegue: PEFT con transformers para el adaptador safetensors; llama.cpp/Ollama para los GGUF del repositorio Privoid-Guard-Qwen3.5-0.8B-GGUF. No se documentan integraciones con vLLM ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 deepset | F1 jackhhao | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Privoid-Guard-Qwen3.5-0.8B | 0,8B | no disponible | 0,898 | 0,743 | Apache 2.0 | Hugging Face (PEFT + GGUF) |
| Qwen3.5-0.8B (base) | 0,8B | no disponible | 0,765 | 0,743 | no disponible en la información | Hugging Face |
| ProtectAI DeBERTa v2 | 0,18B | no disponible | 0,580 | 0,897* | no disponible en la información | Hugging Face |

\* Resultado no limpio: el conjunto jackhhao figura en los datos de entrenamiento de ProtectAI DeBERTa v2.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; el entrenamiento se apoya en tres datasets públicos de prompt injection, lo que puede introducir sesgos de dominio y de idioma.
- Riesgo de falsos positivos elevado: en jackhhao, con umbral 0,5, la tasa de falsas alarmas alcanza el 68,3% y el F1 baja a 0,743; los role-play inocentes se marcan como ataque. Es necesario calibrar el umbral con tráfico propio.
- Riesgo de falsos negativos: en deepset, con umbral 0,5, se escapa el 4,6% de los ataques; con umbral 0,99, el 34,2%.
- Idiomas: soporte declarado solo para inglés; el conjunto deepset incluye textos en alemán y el rendimiento en otros idiomas no está caracterizado.
- Longitud de contexto: no disponible; textos largos pueden truncarse y perder instrucciones maliciosas situadas al final.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que conviene revisar antes de producción.
- Métricas no verificadas: todos los resultados del model-index están marcados como `verified: false` y proceden del propio autor.
- No es un generador: no debe usarse como sustituto de un LLM para tareas de razonamiento o generación; su función es exclusivamente clasificatoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Privoid-ai/Privoid-Guard-Qwen3.5-0.8B
- Versión GGUF: https://huggingface.co/Privoid-ai/Privoid-Guard-Qwen3.5-0.8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Privoid Redact: https://huggingface.co/Privoid-ai/Privoid-Redact-4B-GGUF
- Privoid Confidential: https://huggingface.co/Privoid-ai/Privoid-Confidential-1B
- Dataset deepset/prompt-injections: https://huggingface.co/datasets/deepset/prompt-injections
- Dataset jackhhao/jailbreak-classification: https://huggingface.co/datasets/jackhhao/jailbreak-classification
- Dataset neuralchemy/Prompt-injection-dataset: https://huggingface.co/datasets/neuralchemy/Prompt-injection-dataset
- Dataset S-Labs/prompt-injection-dataset: https://huggingface.co/datasets/S-Labs/prompt-injection-dataset
- Dataset reshabhs/SPML_Chatbot_Prompt_Injection: https://huggingface.co/datasets/reshabhs/SPML_Chatbot_Prompt_Injection
- Resultados detallados: benchmark/results.json (en el repositorio del modelo)
