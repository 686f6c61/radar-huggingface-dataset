# Rahspide/MNN-Pocket-0.3B-RU-GGUF

## Resumen

MNN-Pocket-0.3B-RU-GGUF es la conversion a formato GGUF del modelo Rahspide/MNN-Pocket-0.3B-RU, un modelo de generacion de texto en ruso de 302.830.976 parametros (aproximadamente 0,30 B) desarrollado por el usuario Rahspide. Parte de la base taobao-mnn/MNN-Pocket-0.3B-Base, sobre la que se aplico un entrenamiento continuado (continued pretraining) con 1.200 millones de tokens repartidos en 0,9 B de ruso, 0,204 B de ingles y 0,096 B de chino. Su proposito no es mantener conversaciones, sino continuar un prefijo de texto dado, lo que lo orienta a sugerencias de teclado y autocompletado.

La relevancia de esta version GGUF radica en su huella: el cuantizado Q4_K_M ocupa 223 MB y el Q4_1 apenas 208 MB, lo que permite ejecutarlo en dispositivos de borde (telefonos, mini-PC, Raspberry Pi) mediante llama.cpp sin GPU dedicada. El autor reporta entre 123 y 130 tok/s de generacion con Q4_K_M en una CPU x86 de 16 hilos, y 62,6 tok/s con Q4_1 en la misma maquina, a costa de un procesamiento de prompt mas lento (199 frente a 251 tok/s).

La licencia Apache 2.0 facilita su integracion comercial, aunque el modelo esta especializado en ruso y su naturaleza de continuacion de texto limita los escenarios de uso a tareas de prediccion y autocompletado, no a asistentes conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de taobao-mnn/MNN-Pocket-0.3B-Base; detalles no disponibles) |
| Parametros totales | 302.830.976 (aproximadamente 0,30 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16 (581 MB), Q8_0 (310 MB), Q4_K_M (223 MB), Q4_1 (208 MB) |
| Idiomas soportados | Ruso (principal), ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo se construye sobre taobao-mnn/MNN-Pocket-0.3B-Base, un modelo de 302,8 millones de parametros del que no se detallan en la informacion disponible la arquitectura interna exacta (numero de capas, dimensiones ocultas, mecanismo de atencion). Sobre esa base, Rahspide aplico un entrenamiento continuado con 1.200 millones de tokens: 0,9 B en ruso, 0,204 B en ingles y 0,096 B en chino. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales; el objetivo declarado es la continuacion de texto, no la instruccion conversacional.

La innovacion practica de esta version reside en la conversion a GGUF para llama.cpp y en el tokenizador byte-level, que puede partir caracteres cirilicos entre tokens. El autor advierte que llama.cpp gestiona internamente el buffering de secuencias UTF-8 parciales, pero cualquier decodificador propio debe replicar ese comportamiento para evitar caracteres corruptos. Las mediciones de rendimiento publicadas corresponden a una CPU x86 de 16 hilos: Q4_K_M alcanza 123-130 tok/s de generacion y Q8_0 99-103 tok/s; en una comparativa posterior, Q4_1 logra 62,6 tok/s frente a 54,3 de Q4_K_M, con un coste en procesamiento de prompt (199 frente a 251 tok/s).

## Capacidades

- Continuacion de texto en ruso: el modelo predice la continuacion de un prefijo dado, sin formato de instruccion ni turnos de conversacion.
- Autocompletado y sugerencias de teclado: disenado explicitamente para completar frases cortas en entradas de texto.
- Generacion de texto en ingles y chino: cobertura secundaria derivada del entrenamiento multilingue (0,204 B y 0,096 B de tokens respectivamente).
- Ejecucion en dispositivo (on-device): compatible con llama.cpp y con cuantizaciones de 208-223 MB para entornos de borde.
- Integracion con endpoints compatibles: la etiqueta `endpoints_compatible` sugiere compatibilidad con APIs de inferencia estandar de Hugging Face.
- No dispone de tool calling, function calling, modo thinking, vision, audio ni razonamiento multi-paso documentados en la informacion disponible.

## Casos de uso

- Autocompletado en teclados moviles: el modelo continuaria el prefijo escrito por el usuario con 40 tokens de salida y un cuantizado Q4_K_M de 223 MB, adecuado para integrarse en aplicaciones Android o iOS mediante llama.cpp con enlace nativo.
- Sugerencias de frases en editores de texto rusos: al continuar el texto en lugar de responder preguntas, encaja en funciones de prediccion de escritura en procesadores de texto o correos.
- Prediccion de texto en dispositivos sin GPU: con Q4_1 (208 MB) y 62,6 tok/s en CPU x86 de 16 hilos, puede desplegarse en mini-PC, routers o placas SBC para tareas de generacion local sin conexion.
- Generacion de texto en ruso para entornos con recursos limitados: util en asistentes de escritura offline o herramientas de accesibilidad que completen frases para usuarios con dificultades motoras.
- Prototipado de pipelines de generacion de texto en llama.cpp: sirve como modelo de pruebas para validar integraciones de llama.cpp, servidores de inferencia o wrappers propios antes de escalar a modelos mayores.
- Filtrado y expansion de consultas multilingues: su cobertura de ruso, ingles y chino permite generar variantes de texto en busquedas o en tareas de aumento de datos para entrenamiento de modelos mayores.
- Educacion e investigacion: modelo de 0,30 B para experimentar con entrenamiento continuado, cuantizacion y despliegue en borde sin requerir hardware costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento son las mediciones de velocidad de inferencia en CPU x86 de 16 hilos:

| Cuantizacion | Generacion (tok/s) | Procesamiento de prompt (tok/s) | Tamano |
|---|---|---|---|
| Q4_K_M | 123-130 | 251 | 223 MB |
| Q4_1 | 62,6 | 199 | 208 MB |
| Q8_0 | 99-103 | No disponible | 310 MB |
| F16 | No disponible | No disponible | 581 MB |

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo cabe en memoria RAM. Q4_1 ocupa 208 MB, Q4_K_M 223 MB, Q8_0 310 MB y F16 581 MB, mas el overhead del contexto y del runtime de llama.cpp.
- GPU recomendadas: no aplica para el caso de uso previsto; cualquier GPU con soporte CUDA, Metal o Vulkan en llama.cpp puede acelerar la inferencia, pero no se han publicado mediciones en GPU.
- Cabe en GPU de consumo: si, en cualquier GPU consumer con al menos 1 GB de VRAM libre (por ejemplo, GTX 1050, RTX 3050, RTX 4090), aunque el modelo esta pensado para CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama mediante importacion de GGUF, y cualquier runtime compatible con GGUF. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput estimados: 123-130 tok/s con Q4_K_M y 62,6 tok/s con Q4_1 en CPU x86 de 16 hilos; no se han medido cifras en telefonos ni en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Rahspide/MNN-Pocket-0.3B-RU-GGUF | 0,30 B | No disponible | ru, en, zh | Apache 2.0 | GGUF | Continuacion de texto, orientado a teclado |
| Qwen3-0.6B | 0,6 B | No disponible en esta ficha | Multiples | Apache 2.0 | Safetensors, GGUF | Modelo conversacional de mayor tamano |
| SmolLM2-360M | 0,36 B | No disponible en esta ficha | Ingles principalmente | Apache 2.0 | Safetensors, GGUF | Generacion de texto en ingles |

La comparacion con Qwen3-0.6B y SmolLM2-360M es orientativa por tamano y categoria (modelos pequenos para borde); no se dispone de datos de benchmarks del modelo evaluado para comparar rendimiento de forma objetiva.

## Limitaciones y advertencias

- El modelo continua texto en lugar de responder instrucciones; no es adecuado para chat, preguntas y respuestas ni tareas de instruccion sin un formateo previo del prompt.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse con 0,9 B de tokens en ruso, puede reflejar sesgos presentes en ese corpus.
- Riesgo de alucinacion: inherente a los modelos de lenguaje pequenos; la generacion de continuaciones puede producir texto plausible pero incorrecto.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada; el rendimiento en idiomas distintos del ruso, el ingles y el chino no esta evaluado.
- Tokenizador byte-level: puede partir caracteres cirilicos entre tokens; los decodificadores propios deben gestionar secuencias UTF-8 parciales.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no se han documentado restricciones adicionales.
- Caveat de produccion: las cifras de velocidad solo se han medido en CPU x86 de 16 hilos; el rendimiento en telefonos y en GPU no esta verificado. El autor no recomienda distribuir el cuantizado F16 (581 MB).

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU-GGUF
- Modelo base en Hugging Face: https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU
- Modelo original: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-Base
