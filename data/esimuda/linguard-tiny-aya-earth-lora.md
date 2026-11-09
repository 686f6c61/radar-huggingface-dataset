# Esimuda/linguard-tiny-aya-earth-lora

## Resumen

Linguard Tiny Aya Earth LoRA es un adaptador LoRA de seguridad (safety) desarrollado por Olabowale Babalola (Esimuda) sobre el modelo base CohereLabs/tiny-aya-earth. Su funcion es hacer que el modelo base rechace peticiones de estafa, ingenieria social y contenido danino en ingles, pidgin nigeriano, yoruba, hausa e igbo, manteniendo al mismo tiempo un comportamiento util ante consultas cotidianas sobre banca, tarjetas SIM y contadores electricos. Se construyo para el hackathon Lexsi AI Safety & Alignment Hackathon (noviembre de 2026).

El adaptador no es un modelo completo: es un conjunto de pesos PEFT (formato safetensors, libreria peft) que debe cargarse junto al modelo base. El entrenamiento se realizo con LoRA de rango 16 sobre las proyecciones q/k/v/o, con un dataset pequeno de 226 filas y 2 epocas en una unica GPU NVIDIA A10G. El repositorio ocupa aproximadamente 0,1 GB.

La relevancia del proyecto reside en su enfoque en idiomas africanos de bajos recursos (hausa, yoruba, igbo y pidgin nigeriano), un ambito donde los adaptadores de seguridad suelen estar ausentes. La model card reporta una tasa de exito de ataque del 1,3 % y una tasa de sobre-rechazo del 0,0 % sobre 120 semillas de evaluacion, con las salvedades metodologicas que se detallan mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer CohereLabs/tiny-aya-earth |
| Parametros totales | no disponible (adaptador LoRA r=16, alpha=32, dropout 0,05) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el modelo base admite cuantizacion, pero no se especifica) |
| Idiomas soportados | ingles, pidgin nigeriano, yoruba, hausa, igbo |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 16 y alpha 32 con dropout 0,05 sobre las proyecciones de atencion q, k, v y o del modelo base tiny-aya-earth. El entrenamiento uso AdamW con learning rate 1e-4 durante 2 epocas sobre 226 filas, ejecutado en una NVIDIA A10G (HF Space). No se documenta ninguna innovacion arquitectonica adicional; el interes esta en la estrategia de datos.

Los datos de entrenamiento provienen del conjunto de calibracion reservado de `Esimuda/linguard-safety/calibration` y del conjunto de reparacion CuratorKIT de 34 filas (`curated/sft_messages.jsonl`). Para las muestras daninas se generan rechazos en el idioma correspondiente; para las benignas se destila la propia respuesta no rechazante del modelo base, de modo que la utilidad se auto-destila. Las filas no inglesas se sobremuestrearon por un factor de 3. No se menciona uso de RLHF ni DPO.

## Capacidades

- Rechazo de peticiones de estafa, ingenieria social y contenido danino en cinco idiomas: ingles, pidgin nigeriano, yoruba, hausa e igbo.
- Mantenimiento de utilidad en consultas ordinarias de banca, tarjetas SIM y contadores electricos (sin sobre-rechazo en el conjunto de evaluacion).
- Generacion de rechazos en el idioma del usuario, incluidos idiomas de bajos recursos.
- Capacidades de generacion del modelo base tiny-aya-earth (razonamiento, texto general) preservadas mediante auto-destilacion de respuestas benignas.
- Soporte multilingue limitado a los cinco idiomas del conjunto de datos.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Moderacion de asistentes conversacionales en fintech nigeriana: el adaptador filtra intentos de phishing y estafa por ingenieria social en pidgin, yoruba, hausa e igbo, idiomas que los filtros genericos en ingles no cubren.
- Chatbot bancario de atencion al cliente: mantiene respuestas utiles sobre operaciones bancarias y solo rechaza las peticiones maliciosas, gracias a la auto-destilacion de respuestas benignas del modelo base.
- Soporte de operadores de telefonia movil: gestiona consultas sobre tarjetas SIM y recargas rechazando intentos de fraude de SIM swapping en el idioma del usuario.
- Asistente de facturacion electrica: responde dudas sobre contadores y pagos en hausa o yoruba sin bloquear consultas legitimas.
- Capa de seguridad sobre un LLM pequeno en despliegues con recursos limitados: al ser un adaptador LoRA de 0,1 GB sobre un modelo tiny, puede cargarse en GPUs de gama media o consumer.
- Investigacion en alineacion multilingue: sirve como referencia reproducible (codigo y transcripciones publicados) para estudiar safety en idiomas africanos de bajos recursos.
- Evaluacion comparativa de tecnicas de safety: el autor publica una comparacion frente a CAA steering (SafeTune) con la misma tuberia de evaluacion, util para replicar metodologias.

## Benchmarks y rendimiento

Evaluacion sobre 120 semillas reservadas (76 ataques, 44 benignas), decodificacion greedy, 96 tokens nuevos y el mismo scorer de palabras clave (`pidginguard.scoring`) en todas las ejecuciones:

| Ejecucion | Precision | Exito de ataque (menor es mejor) | Sobre-rechazo (menor es mejor) |
|---|---|---|---|
| Tiny Aya Earth (base) | 75,0 % | 39,5 % | 0,0 % |
| SafeTune CAA steering, fuerza 0,25 | 93,3 % | 3,9 % | 11,4 % |
| Linguard LoRA (este adaptador) | 99,2 % | 1,3 % | 0,0 % |

El unico "exito de ataque" del LoRA corresponde a un rechazo en yoruba escrito con marcas tonales que el scorer de palabras clave no detecta (un fallo del scorer, mantenido en la cifra). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el adaptador pesa 0,1 GB y se suma al modelo base tiny-aya-earth (tamano del base no disponible en la informacion).
- GPU de entrenamiento documentada: 1x NVIDIA A10G.
- Al ser un adaptador sobre un modelo "tiny", es plausible su ejecucion en GPUs consumer, pero no se especifican modelos ni requisitos concretos.
- Opciones de despliegue: transformers + peft (documentado en la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|---|
| Linguard Tiny Aya Earth LoRA | Adaptador LoRA sobre tiny-aya-earth | no disponible | no disponible | Safety multilingue (5 idiomas africanos/ingles) | MIT |
| SafeTune CAA steering | Steering (no pesos) sobre tiny-aya-earth | no disponible | no disponible | Safety, mismo benchmark | no disponible |
| Tiny Aya Earth (base) | Modelo completo | no disponible | no disponible | Generacion multilingue sin alineacion de seguridad | no disponible |

No se dispone de datos de otros adaptadores de safety para idiomas africanos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El juez de evaluacion es una heuristica de palabras clave, no un evaluador humano ni un LLM juez; puede infravalorar rechazos validos (como el caso yoruba con marcas tonales).
- Tamano de muestra pequeno (n=120) y ataques y controles redactados por un unico autor, lo que limita la generalizacion de las cifras.
- Entrenado solo con 226 filas y 2 epocas: riesgo de sobreajuste al conjunto de calibracion y de generalizacion limitada a ataques no vistos.
- Cobertura linguistica restringida a cinco idiomas; no hay garantias para otras lenguas.
- Riesgo de alucinacion inherente al modelo base, no evaluado en la model card.
- No se documentan sesgos especificos, pero el dataset y la evaluacion provienen de un unico constructor.
- Licencia MIT permite uso comercial, pero el adaptador hereda las limitaciones y la licencia del modelo base CohereLabs/tiny-aya-earth, que debe verificarse por separado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Esimuda/linguard-tiny-aya-earth-lora
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-earth
- Dataset: https://huggingface.co/datasets/Esimuda/linguard-safety
- Codigo: https://github.com/Esimuda/linguard
- Perfil del autor: https://huggingface.co/Esimuda
