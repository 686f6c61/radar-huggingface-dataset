# 0xr4j/banksathi-gemma2-2b

## Resumen

BankSathi Gemma-2 2B es un ajuste fino mediante QLoRA del modelo google/gemma-2-2b-it, desarrollado por el usuario 0xr4j, orientado a asistencia bancaria y deteccion de estafas para usuarios de primera vez en zonas rurales de la India. El modelo responde en ingles, hindi en devanagari e hinglish, y esta disenado para ejecutarse completamente offline en dispositivos Android mediante MediaPipe LLM Inference, con un peso int4 de 1,67 GB.

El modelo resuelve dos tareas concretas mediante salidas JSON estrictas: un asistente bancario (retiradas en Bank Mitra, transferencias, libreta/DBT, prestamos KCC) y un filtro ScamGuard que clasifica SMS o llamadas sospechosas en tres niveles de riesgo. La relevancia actual reside en su enfoque de despliegue en el borde: un adaptador LoRA de 83 MB sobre una base de 2.614.341.888 parametros, cuantizado a int4/int8 para CPU movil, con un coste de entrenamiento declarado de 0 euros en GPUs gratuitas.

La arquitectura subyacente es la de Gemma 2 2B instruct (transformer decoder-only con atencion local/global alternada y soft-capping), sobre la que se aplica un adaptador LoRA de rango 16 y alpha 32 en 7 modulos de proyeccion. El contexto maximo no se especifica en la informacion disponible, aunque se hereda del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) con adaptador LoRA (PEFT) |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de google/gemma-2-2b-it) |
| Tipos de cuantizacion | int4 (FFN) / int8 (atencion) para MediaPipe; Q8_0 GGUF en 6 shards |
| Idiomas soportados | en, hi (devanagari), hinglish |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador LoRA), GGUF (Q8_0), bin de MediaPipe |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-2-2b-it y anade un adaptador LoRA con r=16, alpha=32 sobre 7 modulos de proyeccion, entrenado con QLoRA. El entrenamiento se realizo en una T4 gratuita durante 70 minutos, con un pico de VRAM de 8,0 GB y un coste declarado de 0 euros. El dataset es completamente sintetico, generado por codigo con semilla 2026, y consta de 1.500 filas (1.274 de entrenamiento y 226 de evaluacion), sin datos reales de clientes.

La composicion del dataset incluye tres registros: ingles 36,9 %, hindi en devanagari 24,0 % e hinglish 39,1 %. Se introduce ruido de speech-to-text en hinglish (minusculas, signos de interrogacion omitidos, errores como "aadhar" o "pasbuk", muletillas) manteniendo objetivos limpios. El 49,7 % de los prompts del asistente incorporan un fragmento RBI verificado con marca temporal, y el 30 % de esos incluyen ademas un fragmento distractor. Se incluyen trampas de frontera (9.999 / 10.000 / 10.001 INR para Bank Mitra; 1,99,999 / 2,00,000 / 2,00,001 / 2,50,000 INR para KCC sin colateral) con plantillas identicas a ambos lados del umbral para forzar el aprendizaje del numero y no de la redaccion.

## Capacidades

- Generacion de texto conversacional en ingles, hindi (devanagari) e hinglish, con tolerancia a errores tipicos de speech-to-text.
- Salida estructurada en JSON estricto para dos contratos: asistente bancario y comprobacion de estafas.
- Clasificacion de intencion bancaria en cinco categorias: WITHDRAW, TRANSFER, PASSBOOK_DBT, LOAN_KCC, NONE.
- Extraccion de importe sugerido en INR (suggestedAmountInr) a partir de lenguaje natural.
- Deteccion de estafas con tres niveles de riesgo (SAFE, CAUTION, HIGH_RISK) y explicaciones bilingues.
- Abstencion segura cuando la consulta queda fuera de dominio (campo abstained).
- Generacion de consejos de accion bilingues (actionTipEn / actionTipHi) orientados a victimas de fraude.
- Capacidad de grounding sobre fragmentos RBI verificados incluidos en el prompt.
- No se documenta soporte explicito de tool calling, function calling generico ni razonamiento multi-paso mas alla del contrato JSON.

## Casos de uso

- Asistencia bancaria offline en zonas rurales: la app consulta al modelo en el propio telefono para resolver dudas sobre retiradas en Bank Mitra, transferencias o libreta/DBT, sin conexion y con respuesta bilingue lista para text-to-speech.
- Deteccion de estafas por OTP en tiempo real: el modelo clasifica SMS o descripciones de llamadas en SAFE/CAUTION/HIGH_RISK y devuelve un consejo de accion con el numero 1930 y el plazo de 3 dias habiles para responsabilidad cero.
- Verificacion de limites regulatorios: el modelo distingue si una retirada de 9.999, 10.000 o 10.001 INR entra en el limite de Bank Mitra, o si un prestamo KCC de 1,99,999 / 2,00,000 / 2,50,000 INR requiere colateral.
- Triaje de intencion en apps de banca movil: el campo task permite enrutar la conversacion a flujos de UI especificos (retirada, transferencia, libreta, prestamo) sin que el usuario navegue menus.
- Soporte a operadores de BC points: el modelo puede asistir a agentes bancarios corresponsales en la explicacion de procedimientos (escaneo de huella Aadhaar, ausencia de comisiones, recibo impreso) en el idioma del cliente.
- Educacion financiera embebida: respuestas bilingues con explicaciones y sugerencias de accion para usuarios de primera vez, con abstrccion controlada cuando la consulta excede el dominio cubierto.
- Integracion en demos web sin backend: el GGUF Q8_0 en 6 shards permite ejecutar el modelo en el navegador mediante llama.cpp/WASM, como demuestra el Space banksathi-demo.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los KPI de evaluacion hold-out declarados por el autor, no benchmarks estandar:

| Metrica | Resultado |
|---|---|
| Recall de estafas | 100 % |
| Abstencion segura | 100 % |
| Precision de intencion | 98,5 % |
| Falsas alarmas de estafa | 0 |
| Filas de evaluacion | 226 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia del adaptador LoRA sobre la base: no disponible de forma explicita; el entrenamiento QLoRA alcanzo un pico de 8,0 GB en una T4.
- GPU recomendadas para entrenamiento o ajuste: NVIDIA T4 (16 GB) suficiente segun el autor; A100/H100 no documentadas pero sobredimensionadas para este tamano.
- Despliegue en consumer GPU: el modelo completo en bf16/fp16 (aprox. 5,2 GB de pesos) cabe en GPUs consumer con 8 GB o mas (RTX 3060 Ti, 4060 Ti, 4070); en Q8_0 GGUF (2,78 GB) cabe en GPUs con 4-6 GB.
- Despliegue en movil: MediaPipe LLM Inference en CPU con modelo int4/int8 de 1,67 GB, disenado para Android.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio (via GGUF Q8_0), MediaPipe LLM Inference (Android), y navegador via llama.cpp/WASM.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| BankSathi Gemma-2 2B | 2,61 B (+ LoRA 83 MB) | no disponible | en, hi, hinglish | gemma | Asistente bancario y antiestafas on-device |
| google/gemma-2-2b-it | 2,61 B | no disponible en esta ficha | multilingue | gemma | Instructivo generalista |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens (segun documentacion publica de Qwen) | multilingue | Apache 2.0 | Instructivo generalista |
| Llama 3.2 1B Instruct | 1,2 B | 128.000 tokens (segun documentacion publica de Meta) | multilingue | Llama 3.2 Community | Instructivo generalista |

La comparativa con Qwen2.5 y Llama 3.2 se basa en datos publicos de sus respectivas documentaciones; no se dispone de comparaciones directas de rendimiento con BankSathi en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no constituye asesoramiento financiero y que las reglas del RBI cambian (hechos verificados el 2026-11-14).
- Requiere un filtro de estafas basado en reglas ejecutado antes del modelo y un fallback determinista para respuestas que fallen el parseo JSON; el autor prohibe el despliegue sin ambos.
- Dataset de solo 1.500 filas sinteticas: cobertura limitada de casos reales, acentos, dialectos y variaciones regionales no representadas.
- Riesgo de alucinacion en cifras regulatorias y procedimientos si el prompt no incluye fragmentos RBI verificados.
- Cobertura linguistica restringida a ingles, hindi en devanagari e hinglish; no soporta otras lenguas indias.
- Las metricas declaradas (100 % recall, 98,5 % precision) proceden de un hold-out de 226 filas generadas por el mismo codigo que el entrenamiento, por lo que pueden sobreestimar el rendimiento en produccion.
- Licencia Gemma: uso comercial permitido bajo los terminos de Google, con obligaciones de atribucion y restricciones de uso aceptable; revisar antes de desplegar.
- No se documenta longitud de contexto efectiva ni comportamiento en conversaciones multi-turno largas.
- El adaptador LoRA debe combinarse con la base google/gemma-2-2b-it y los prompts deben construirse exactamente con build_task_a_prompt / build_task_b_prompt y el wrapper de chat de Gemma 2, con decodificacion greedy.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0xr4j/banksathi-gemma2-2b
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Demo en vivo (Space): https://huggingface.co/spaces/0xr4j/banksathi-demo
- Repositorio GitHub: https://github.com/0xr4j/banksathi
