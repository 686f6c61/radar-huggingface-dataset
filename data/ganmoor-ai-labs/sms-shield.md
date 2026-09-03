# ganmoor-ai-labs/sms-shield

## Resumen

SMS-Shield es un clasificador de texto especializado en la detección de estafas y la categorización de SMS para el mercado indio, desarrollado por ganmoor-ai-labs (Santosh ganmoor) y publicado en septiembre de 2026. Se construye como un adaptador LoRA sobre el modelo Qwen3-4B-Instruct-2507, con un total de 4.022.468.096 parámetros según los metadatos de safetensors. El modelo analiza un SMS (cabecera del remitente y cuerpo) y devuelve un veredicto de seguridad estructurado en JSON, con el nivel de riesgo (safe, suspicious, dangerous), la categoría del mensaje, el tipo de estafa si procede y una explicación en el idioma del mensaje.

Está entrenado específicamente para tráfico SMS indio en inglés, hindi (devanagari) y hinglish romanizado, incluyendo razonamiento sobre remitentes DLT. La relevancia actual radica en el aumento del fraude por SMS en India y en la necesidad de soluciones de filtrado en el dispositivo que no dependan de servicios externos, con un tamaño de 4B que permite su ejecución en hardware de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-4B-Instruct-2507) con adaptador LoRA |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3-4B-Instruct-2507 tiene un contexto de 32K tokens, pero la ficha del modelo no lo especifica) |
| Tipos de cuantizacion | Safetensors (bf16) y GGUF Q4_K_M (2.4 GB) |
| Idiomas soportados | Inglés, hindi (devanagari) y hinglish romanizado |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso de 4B parámetros, sobre el que se entrena un adaptador LoRA (r=16, bf16) durante tres épocas más una época de calibración. El entrenamiento se realizó completamente on-device en un NVIDIA DGX Spark (GB10, 128 GB de memoria unificada). El corpus de entrenamiento consiste en 12.500 SMS indios sintéticos generados mediante un pipeline de dos profesores ejecutado localmente: gemma3:27b generó candidatos etiquetados, que pasaron por más de 20 validadores deterministas (comprobaciones de script, idioma, consistencia de banda de riesgo, formato de remitente y deduplicación difusa), y gpt-oss-safeguard:120b re-evaluó cada muestra de forma independiente a ciegas; las discrepancias de etiquetas provocaron un rechazo de aproximadamente el 24% de los candidatos. El conjunto incluye pares contrafactuales de cambio de remitente y un nivel deliberadamente ambiguo de 'suspicious'.

La innovación técnica destacable es el razonamiento sobre remitentes DLT y la calibración contra el sobre-marcado de tráfico legítimo, con alrededor de un 40% de negativos duros (mensajes alarmistas pero legítimos). El corpus de entrenamiento no está publicado; el conjunto de evaluación completo de 1.390 filas sí se incluye en el repositorio.

## Capacidades

- Clasificación de SMS en tres niveles de riesgo: safe (0-39), suspicious (40-69) y dangerous (70-100).
- Categorización en ocho categorías: otp, banking, delivery, bill_utility, govt, promo, personal y scam.
- Detección de 15 patrones de fraude: kyc_fraud, digital_arrest, upi_fraud, job_scam, fake_delivery, investment_scam, lottery_prize, utility_scam, loan_app, phishing_generic, refund_cashback, impersonation, apk_malware, sextortion_threat y other_scam.
- Generación de una explicación en el idioma y script del mensaje de entrada.
- Razonamiento sobre la cabecera del remitente DLT: distingue entre remitentes legítimos (por ejemplo, JD-SBIINB) y remitentes sospechosos (como un número de móvil de 10 dígitos).
- Soporte multilingüe para inglés, hindi (devanagari) y hinglish romanizado, incluyendo mensajes mixtos.
- Salida JSON estructurada con listado de red_flags y explicación.
- No soporta tool calling, visión ni audio; es un clasificador de texto de un solo mensaje.

## Casos de uso

- Filtrado de SMS en el dispositivo: el modelo puede integrarse en una app de mensajería o en el sistema operativo para clasificar cada SMS entrante y alertar al usuario. Es adecuado porque su cuantización Q4_K_M (2.4 GB) permite ejecutarlo en el dispositivo sin depender de servicios en la nube.
- Categorización de bandeja de entrada: apps de mensajería pueden etiquetar automáticamente los SMS como "banco", "entrega", "promoción" o "estafa". Es adecuado por su precisión de categoría del 99.1%.
- Alertas de fraude bancario: el modelo puede detectar mensajes de phishing de KYC, UPI o "digital arrest" y bloquear enlaces o mostrar advertencias. Es adecuado porque distingue alertas bancarias legítimas de estafas, con 0 falsos positivos en el conjunto de prueba.
- Protección para usuarios rurales o con acceso limitado a internet: el soporte de inglés, hindi y hinglish permite cubrir una gran parte de la población india. Es adecuado por su entrenamiento específico en tráfico SMS indio.
- Integración en plataformas de telecomunicaciones: los operadores pueden usar el modelo para filtrar SMS fraudulentos antes de entregarlos a los usuarios. Es adecuado por su capacidad de razonar sobre remitentes DLT y su alta recall de mensajes peligrosos (99.5%).
- Herramientas de seguridad corporativas: los equipos de seguridad pueden analizar SMS recibidos en dispositivos corporativos, con salida JSON para automatizar respuestas y registros. Es adecuado por su contrato de salida estructurado y su compatibilidad con endpoints.
- Investigación de fraude: analistas pueden clasificar grandes volúmenes de SMS para extraer patrones de estafa y generar informes. Es adecuado por su alta precisión en la clasificación de categorías y su capacidad de explicar el veredicto.

## Benchmarks y rendimiento

| Metric | SMS-Shield 4B | Gemma3-27B zero-shot (misma prompt) |
|---|---|---|
| Precisión del veredicto | 99.2% | 49.2% |
| — Inglés / Hindi / Hinglish / Mixto | 99.2 / 99.8 / 98.8 / 98.9 | 53.2 / 26.6 / — / 27.3 |
| Precisión de categoría | 99.1% | 74.0% |
| Recall de peligrosos | 99.5% | 87.2% |
| Precisión de seguros | 100% | 100%* |
| Alertas OTP/bancarias legítimas marcadas como estafa | 0 / 1.390 | 22 |
| Fallos de parseo JSON | 0 | 0 |

Nota: el baseline casi nunca predice "safe" y sobre-marca tráfico legítimo, incluyendo 22 OTPs/alertas bancarias genuinas. El sobre-marcado es un problema crítico para aplicaciones de seguridad SMS; SMS-Shield fue entrenado explícitamente contra ello con aproximadamente un 40% de negativos duros.

## Requisitos de hardware

- VRAM estimada para inferencia: con bf16 (modelo base + adaptador) se requieren aproximadamente 8 GB; con GGUF Q4_K_M, alrededor de 3-4 GB.
- GPU recomendadas: RTX 4090 (24 GB) o superior para bf16; RTX 3060 (12 GB) o RTX 4060 (8 GB) para Q4_K_M. El entrenamiento se realizó en un NVIDIA DGX Spark (GB10, 128 GB de memoria unificada).
- Cabe en GPU de consumo: sí, con cuantización Q4_K_M cabe en GPUs de 4-6 GB; en bf16 se necesita al menos 8 GB.
- Opciones de despliegue: Ollama (`ollama run santosh07401/sms-shield`), llama.cpp, Transformers con PEFT, vLLM (si se convierte) y TGI. El modelo es compatible con endpoints.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión de veredicto (n=1.390) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SMS-Shield 4B | 4.022.468.096 | No disponible (base 32K) | 99.2% | Apache 2.0 | HuggingFace, GGUF, Ollama |
| Gemma3-27B zero-shot | 27B | No disponible | 49.2% | No especificada | No disponible en esta tarea |
| Qwen3-4B-Instruct-2507 (base) | ~4B | 32K | No disponible | Apache 2.0 | HuggingFace |

Nota: no se han encontrado otros modelos especializados en clasificación de SMS indio en la información disponible. La comparación con Gemma3-27B se limita a la tarea de clasificación de SMS con la misma prompt.

## Limitaciones y advertencias

- Calibración contrafactual: en pruebas de cambio de remitente emparejadas, el 100% de los mensajes intercambiados se marcan como no seguros, pero el 18% cae una banda de severidad fuera (suspicious vs dangerous) respecto a las etiquetas de referencia.
- Idiomas: solo inglés, hindi y hinglish en v1; se planea añadir kannada, tamil, telugu, bengalí y marathi.
- Contexto: clasificación de un solo mensaje, sin contexto de hilo en v1.
- Distribución: entrenado con datos sintéticos; se espera cambio de distribución en el mundo real. Se recomienda evaluar con tráfico propio antes de usarlo en producción.
- Fiabilidad: el modelo asiste al juicio humano; no es una garantía. Nunca se debe tratar el veredicto "safe" como prueba de legitimidad para acciones financieras.
- Sesgos: no se ha publicado una evaluación de sesgos; al estar entrenado con datos sintéticos generados por otros modelos, puede heredar sesgos de los generadores.
- Riesgo de alucinación: la explicación generada puede no ser precisa, aunque se limita a una frase.
- Uso previsto: defensivo. No debe utilizarse para generar contenido de estafa.

## Enlaces

- HuggingFace: https://huggingface.co/ganmoor-ai-labs/sms-shield
- Perfil del autor: https://huggingface.co/ganmoor-ai-labs
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- No se han encontrado papers, blogs o repositorios adicionales en la búsqueda web.
