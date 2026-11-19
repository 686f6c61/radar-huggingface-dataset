# minas2025/Qwen-3.5-4B-RP-Finetune

## Resumen

Qwen-3.5-4B-RP-Finetune es un ajuste fino (LoRA) del modelo Qwen3.5-4B-Uncensored, orientado especificamente a roleplay conversacional y escritura creativa. Lo desarrolla el usuario minas2025 y se distribuye en formato GGUF cuantizado Q8_0, pensado para ejecutarse en runners locales como llama.cpp, LM Studio, KoboldCpp o backends de SillyTavern. El modelo parte de una base de 4.205.751.296 parametros (aproximadamente 4,2 mil millones) y conserva la proyeccion multimodal opcional del modelo original.

El objetivo del ajuste es transformar un modelo conversacional generico en un companero de roleplay que escriba prosa descriptiva estilo novela, mantenga el personaje y elimine la voz de "asistente servicial". El entrenamiento fue ligero (1.000 pasos) para preservar el conocimiento general y la capacidad de chat de la base, segun indica el autor. Se entreno en una unica GPU AMD Radeon RX 6700 XT de 12 GB con ROCm, lo que lo convierte en un ejemplo de ajuste fino accesible en hardware de consumo.

Su relevancia actual reside en la combinacion de tres factores: tamano contenido (4B) que cabe en GPUs de consumo, cuantizacion Q8_0 casi sin perdida y una especializacion clara en roleplay sin censura. No obstante, la informacion publicada es escasa: no hay datos de benchmarks, licencia explicita ni lista de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B); detalles internos no disponibles |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | Entrenado con 2.048 tokens; recomendado 4.096-8.192 en inferencia |
| Tipos de cuantizacion | GGUF Q8_0 (~4,5 GB); proyeccion multimodal F16 mmproj (~0,7 GB) |
| Idiomas soportados | no disponible (la model card solo etiqueta `en`) |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q8_0 y F16-mmproj) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante QLoRA de 4 bits sobre DreamFast/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive-Safetensor-Benchmark. La configuracion de LoRA usa rango 16, alpha 16, dropout 0 y aplica adaptadores a todas las capas lineales. El entrenamiento consistio en 1.000 pasos con batch 1, acumulacion de gradiente 1 y longitud de contexto de 2.048 tokens. Se uso tasa de aprendizaje 8e-5 con schedule coseno y warmup, optimizador AdamW de 8 bits y weight decay de 0,001. La perdida final reportada es de aproximadamente 1,06 (suavizada en ~1,29).

El dataset de entrenamiento es Chaser-cz/sonnet35-charcard-roleplay-sharegpt, en formato ShareGPT, orientado a tarjetas de personaje y roleplay. El proceso completo (entrenamiento, merge y conversion a GGUF mediante llama.cpp) se realizo con Unsloth Studio en una AMD RX 6700 XT de 12 GB con ROCm, en aproximadamente 1 hora y 42 minutos. El autor indica que el ajuste es "ligero" para no degradar las capacidades generales del modelo base. No se detalla la composicion del dataset, el numero de tokens de entrenamiento ni si hubo etapas de RLHF o DPO en la base.

## Capacidades

- Generacion de texto conversacional y escritura creativa en estilo novela: parrafos descriptivos, acciones y narracion de escena alrededor del dialogo.
- Roleplay inmersivo con tarjetas de personaje: adopta y mantiene la persona definida en el prompt inicial.
- Reduccion drastica de la voz de "asistente servicial"; el modelo prioriza mantenerse en personaje.
- Tolerancia a tramas oscuras, maduras o NSFW sin romper el personaje, heredada de la base sin censura.
- Capacidad multimodal opcional (vision) mediante el archivo F16-mmproj incluido, aunque el ajuste esta orientado a texto.
- Conservacion del conocimiento general y capacidad de chat de la base gracias al entrenamiento ligero.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la unica etiqueta de idioma es `en`.

## Casos de uso

- Roleplay conversacional local con SillyTavern: el modelo se sirve con `llama-server` en el puerto 8080 con contexto de 8.192 tokens y se conecta a la interfaz, que le pasa la tarjeta de personaje al inicio de la conversacion. Es adecuado por su especializacion en mantener persona y prosa descriptiva.
- Escritura creativa asistida: generacion de escenas narrativas con dialogo y descripcion de acciones, usando temperatura 0,85 y penalizacion de repeticion 1,10-1,15 para mantener variedad estilistica.
- Prototipado de personajes para juegos o narrativa interactiva: el modelo permite iterar rapidamente sobre tarjetas de personaje y escenarios en una GPU de consumo, sin coste de API.
- Experimentacion con ajuste fino en hardware AMD: sirve como referencia reproducible de un pipeline QLoRA + merge + GGUF ejecutado en una RX 6700 XT con ROCm y Unsloth.
- Despliegue en estaciones de trabajo modestas: al ocupar ~4,5 GB en Q8_0, cabe en GPUs consumer de 8 GB o mas y permite inferencia local sin conexion.
- Generacion de narrativa para campanas de rol de mesa: el modelo puede improvisar respuestas de PNJ y descripciones de escena a partir de un escenario inicial, con contexto suficiente para sesiones de varios turnos.
- Evaluacion de tecnicas de cuantizacion: el par Q8_0 + F16-mmproj permite comparar calidad texto-solo frente a uso multimodal con llama-mtmd-cli.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la perdida final de entrenamiento (~1,06, suavizada ~1,29) y no incluye evaluaciones en MMLU, HumanEval, GSM8K ni conjuntos de roleplay.

## Requisitos de hardware

- VRAM estimada para inferencia: ~4,5 GB con Q8_0; ~0,7 GB adicionales si se carga la proyeccion multimodal F16.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM. El autor entreno en una AMD Radeon RX 6700 XT de 12 GB con ROCm; para inferencia son validas GPUs consumer como RTX 3060 Ti, RTX 4060 Ti, RTX 4070 o superiores, y equivalentes AMD.
- Cabe en GPU consumer: si, en modelos con 8 GB o mas; con 6 GB puede requerir descarga parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama-mtmd-cli`), LM Studio (busqueda en el Hub o sideload), KoboldCpp, backends de SillyTavern y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen-3.5-4B-RP-Finetune | ~4,2 B | 2.048 en entrenamiento; 4.096-8.192 recomendado | GGUF Q8_0 | no disponible | Especializado en roleplay sin censura |
| DreamFast/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive | ~4,2 B | no disponible | safetensors | no disponible | Modelo base sin ajuste de roleplay |
| Alternativas de roleplay de ~4B en GGUF | no disponible | no disponible | GGUF | no disponible | No se dispone de datos verificables en la informacion proporcionada |

La comparativa con otras alternativas de la misma categoria no puede completarse con datos verificables a partir de la informacion disponible.

## Limitaciones y advertencias

- Ausencia de licencia explicita: no se especifica licencia, lo que impide confirmar si el uso comercial esta permitido. Conviene contactar con el autor o asumir restricciones.
- Contenido sin censura: el modelo sigue tramas NSFW, oscuras o maduras sin romper personaje; no es adecuado para aplicaciones orientadas a publico general ni para entornos con requisitos de moderacion.
- Riesgo de alucinacion: como cualquier modelo de 4B, puede inventar hechos, nombres o detalles de la trama; no debe usarse como fuente de informacion factual.
- Sesgos: no se documentan evaluaciones de sesgo; al heredar una base sin censura, puede reproducir estereotipos o contenido sensible.
- Contexto limitado en entrenamiento: el ajuste se hizo con 2.048 tokens, aunque el autor recomienda 4.096-8.192 en inferencia; el comportamiento mas alla del contexto de entrenamiento no esta validado.
- Idioma: solo se etiqueta `en`; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Perdida de capacidades generales: el autor afirma que el ajuste ligero preserva el chat general, pero no hay evaluaciones que lo confirmen.
- Trazabilidad: el modelo base es a su vez un ajuste de otro modelo, lo que acumula incertidumbre sobre licencias y condiciones de uso en la cadena.
- Datos de entrenamiento: la composicion y procedencia del dataset de roleplay no se detallan, lo que dificulta auditar posibles sesgos o material problematico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minas2025/Qwen-3.5-4B-RP-Finetune
- Modelo base: https://huggingface.co/DreamFast/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive-Safetensor-Benchmark
- Dataset de entrenamiento: https://huggingface.co/datasets/Chaser-cz/sonnet35-charcard-roleplay-sharegpt
- Unsloth Studio: https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai
- KoboldCpp: https://github.com/LostRuins/koboldcpp
- SillyTavern: https://github.com/SillyTavern/SillyTavern
