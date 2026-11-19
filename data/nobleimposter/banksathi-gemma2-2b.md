# nobleimposter/banksathi-gemma2-2b

## Resumen

BankSathi es un ajuste fino mediante QLoRA del modelo google/gemma-2-2b-it, desarrollado por el usuario nobleimposter, orientado a asistencia bancaria y deteccion de estafas para usuarios de primera incursion en servicios financieros en la India rural. El modelo responde en ingles, hindi (devanagari) y hinglish, y esta disenado para ejecutarse de forma completamente offline en dispositivos Android, lo que lo hace relevante para escenarios de baja conectividad y para la inclusion financiera de poblaciones con acceso limitado a internet.

El modelo resuelve dos tareas concretas mediante contratos de salida JSON estrictos: un asistente bancario que clasifica la intencion del usuario (retirada, transferencia, libreta/DBT, prestamo KCC) y genera respuestas bilingues, y un detector de estafas (ScamGuard) que evalua SMS o llamadas sospechosas con niveles de riesgo SAFE, CAUTION y HIGH_RISK. La arquitectura subyacente es un transformer decoder-only de Gemma 2 con 2.600 millones de parametros, adaptado con un LoRA de rango 16 sobre 7 modulos de proyeccion, con un adaptador de 83 MB y un modelo fusionado en int4/int8 de 1,67 GB para MediaPipe LLM Inference en CPU.

El interes actual del modelo reside en su enfoque de despliegue en el borde (on-device): entrenado con 1.500 filas sinteticas y un coste de computo de 0 rupias en una GPU T4 gratuita, incluye un pipeline completo de generacion de datos, evaluacion con cinco KPI y conversion a formato MediaPipe. La ventana de contexto no se especifica en la informacion disponible, aunque hereda la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) con adaptador LoRA (QLoRA) |
| Parametros totales | 2.600 millones (2,6 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de google/gemma-2-2b-it; no especificada en la informacion) |
| Tipos de cuantizacion | int4 (FFN) / int8 (attention) para MediaPipe; adaptador LoRA en safetensors sin cuantizar |
| Idiomas soportados | Ingles (en), hindi (hi), hinglish (registro mixto) |
| Licencia | Gemma (terminos de licencia de Google Gemma) |
| Formato de pesos | safetensors (adaptador LoRA), bin (MediaPipe LLM Inference) |
| Tamano del adaptador | 83 MB (r=16, alpha=32, 7 modulos de proyeccion) |
| Tamano del modelo on-device | 1,67 GB (MediaPipe, CPU, int4/int8) |
| Modelo base | google/gemma-2-2b-it |
| Libreria | PEFT |
| Pipeline | text-generation |
| Dataset de entrenamiento | 1.500 filas sinteticas (1.274 train / 226 eval), semilla 2026 |
| Coste de computo | 0 INR (GPU T4 gratuita, 70 min de entrenamiento, 8,0 GB VRAM pico) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-2-2b-it, un transformer decoder-only de 2.600 millones de parametros. Sobre el se aplica un ajuste fino QLoRA con rango 16, alpha 32 y 7 modulos de proyeccion, generando un adaptador de 83 MB. El entrenamiento se realizo en una GPU T4 gratuita durante 70 minutos con un pico de 8,0 GB de VRAM. El dataset es completamente sintetico, generado por codigo con semilla 2026, sin datos reales de clientes, lo que permite reconstruirlo de forma reproducible.

El dataset de 1.500 filas presenta una composicion deliberadamente dificil: 36,9% en ingles, 24,0% en hindi devanagari y 39,1% en hinglish. Incluye ruido de speech-to-text en hinglish (minusculas, signos de interrogacion omitidos, errores como "aadhar" o "pasbuk", muletillas como "haan" o "accha"), trampas de frontera en umbrales monetarios (9.999, 10.000 y 10.001 rupias para el limite de Bank Mitra; 1,99,999, 2,00,000, 2,00,001 y 2,50,000 para el prestamo KCC sin garantia) con plantillas identicas en ambos lados del umbral, y trampas de abtencion en el 16% de las filas. El 49,7% de los prompts del asistente incluyen un fragmento RBI verificado (con fecha 2026-11-14) y el 30% de estos anaden un fragmento distractor. No se menciona el uso de RLHF o DPO en la informacion disponible.

## Capacidades

- Generacion de texto bilingue con salida estructurada en JSON: campos `replyEn`, `replyHi`, `task`, `suggestedAmountInr`, `isScamAlert` y `abstained` para la tarea de asistente bancario.
- Deteccion de estafas (ScamGuard): clasificacion en `riskLevel` (SAFE, CAUTION, HIGH_RISK) con explicaciones y consejos de accion en ingles y hindi.
- Comprension de hinglish conversacional con ruido de speech-to-text (errores tipicos de transcripcion, minusculas, muletillas).
- Razonamiento sobre umbrales regulatorios concretos (limite de 10.000 rupias en Bank Mitra, limites de KCC sin garantia).
- Abtencion controlada: el modelo rechaza preguntas fuera de alcance (saldo exacto, preguntas medicas) mediante el campo `abstained`.
- Grounding en fragmentos RBI verificados incluidos en el prompt, con resistencia a fragmentos distractores.
- Clasificacion de intencion bancaria en cinco categorias: WITHDRAW, TRANSFER, PASSBOOK_DBT, LOAN_KCC y NONE.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Asistente bancario offline en Android: el modelo se ejecuta integramente en el telefono mediante MediaPipe LLM Inference en CPU (modelo de 1,67 GB en int4/int8), respondiendo consultas sobre retiradas, transferencias y libretas sin conexion a internet. Adecuado para zonas rurales con conectividad intermitente.
- Deteccion de estafas por OTP y phishing: el modulo ScamGuard analiza la descripcion de una llamada o SMS sospechoso y devuelve un nivel de riesgo con explicacion y consejo de accion (por ejemplo, llamar al 1930 y reportar al banco en 3 dias laborables), integrable en la app antes de cualquier accion del usuario.
- Atencion al cliente en hinglish con salida para text-to-speech: las respuestas en ingles limpio y devanagari hindi estan pensadas para ser leidas en voz alta, lo que facilita la accesibilidad a usuarios con baja alfabetizacion digital.
- Clasificacion de intencion para enrutado en aplicaciones financieras: el campo `task` permite dirigir la conversacion a flujos especificos (retirada, transferencia, libreta/DBT, prestamo KCC) sin necesidad de un backend en la nube.
- Educacion financiera sobre limites regulatorios: el modelo distingue entre operar en un punto Bank Mitra (hasta 10.000 rupias) y acudir a sucursal, y entre prestamos KCC con y sin garantia, gracias al entrenamiento con trampas de frontera.
- Filtro de seguridad previo a la interaccion: el diseno recomienda ejecutar un filtro de estafas basado en reglas antes del modelo y un fallback deterministico para respuestas que fallen el parseo JSON, lo que permite construir una capa de seguridad en produccion movil.
- Prototipado rapido de asistentes de dominio vertical: el repositorio incluye el pipeline completo (generador de dataset, puerta de evaluacion con 5 KPI, entrenador QLoRA, conversor y notebooks de Colab), reutilizable para otros dominios con presupuesto cero.

## Benchmarks y rendimiento

Los datos disponibles son KPI de evaluacion sobre el conjunto de retencion (hold-out), no benchmarks estandar:

| Metrica | Resultado |
|---|---|
| Recall de estafas | 100% |
| Abtencion segura | 100% |
| Precision de intencion | 98,5% |
| Falsas alarmas de estafa | 0 |
| Filas de entrenamiento | 1.274 |
| Filas de evaluacion | 226 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia del adaptador LoRA sobre el modelo base: no especificada; el entrenamiento QLoRA requirio 8,0 GB de VRAM pico en una T4.
- Modelo on-device: 1,67 GB en disco para MediaPipe LLM Inference, ejecutable en CPU de Android sin GPU dedicada.
- GPU recomendadas para entrenamiento o inferencia del adaptador: NVIDIA T4 (validada en el entrenamiento), asi como A100 o H100 para mayor throughput; no se documentan requisitos para RTX 4090.
- Cabe en GPU de consumo: el adaptador de 83 MB y el modelo base de 2,6 B en cuantizacion int4 son compatibles con GPUs de consumo con suficiente VRAM, aunque no se proporcionan cifras exactas en la informacion disponible.
- Opciones de despliegue: MediaPipe LLM Inference (Android, CPU), PEFT para cargar el adaptador sobre el modelo base; no se documenta soporte explicito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Recomendacion de decodificacion: greedy decoding, con prompts construidos exactamente segun `training/banksathi_common.py` (`build_task_a_prompt`, `build_task_b_prompt` y el wrapper de chat de Gemma 2).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| BankSathi Gemma-2 2B | 2,6 B | No disponible | Gemma | Asistente bancario y deteccion de estafas en hinglish, on-device | Hugging Face (adaptador LoRA + bin MediaPipe) |
| google/gemma-2-2b-it | 2,6 B | No disponible | Gemma | Modelo base de proposito general, instruction-tuned | Hugging Face |
| Gemma 2 9B IT | 9 B | No disponible | Gemma | Modelo de proposito general de mayor tamano | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada. La comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo no constituye asesoramiento financiero; la propia model card advierte de que puede equivocarse y de que las normas del RBI cambian (hechos verificados el 2026-11-14).
- El autor exige ejecutar un filtro de estafas basado en reglas antes del modelo y un fallback deterministico para respuestas que fallen el parseo JSON; no debe desplegarse sin ambas capas.
- Riesgo de alucinacion en temas regulatorios y financieros, mitigado parcialmente por el grounding en fragmentos RBI y las trampas de abtencion del entrenamiento.
- El dataset es sintetico (1.500 filas), lo que limita la cobertura de casos reales y puede provocar sobreajuste a las plantillas de generacion.
- Idiomas limitados a ingles, hindi y hinglish; no se documenta soporte de otras lenguas de la India.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribucion; debe revisarse antes de un despliegue en produccion.
- No se documentan sesgos especificos, pero el dominio (India rural, servicios bancarios basicos) implica un alcance muy acotado.
- El rendimiento en produccion depende de la fidelidad del prompt al formato exacto de entrenamiento y del uso de greedy decoding.
- No hay informacion sobre latencia, throughput ni comportamiento en GPUs de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nobleimposter/banksathi-gemma2-2b
- Repositorio GitHub: https://github.com/0xr4j/banksathi
- Demo (proximamente): https://huggingface.co/spaces/0xr4j/banksathi-demo
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
