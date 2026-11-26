# ipz234gdi/qwen3-1.7b-voice-commands-uk-qlora

## Resumen

El modelo `ipz234gdi/qwen3-1.7b-voice-commands-uk-qlora` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base Qwen/Qwen3-1.7B, desarrollado por el usuario ipz234gdi como proyecto academico (laboratorio 5 del curso «Sistemas modernos de inteligencia artificial»). Su funcion es recibir comandos de voz en ucraniano dirigidos a un asistente y devolver exclusivamente un objeto JSON con la intencion detectada y los parametros (slots) extraidos, siguiendo el esquema de 60 intenciones y 54 tipos de parametros del dataset MASSIVE.

El adaptador resuelve un problema concreto: MASSIVE 1.1 no incluye ucraniano, por lo que el autor tradujo la particion `en-US` mediante la modelo local Gemma 4 E4B, conservando la anotacion `[slot : value]` y descartando traducciones con marcado roto. El resultado son 3258 ejemplos de entrenamiento, 316 de validacion y 737 de test, con el split original de MASSIVE.

Es relevante como ejemplo de ajuste eficiente (QLoRA con 17,4 M de parametros entrenables, ~1 % del total) ejecutado en una GPU consumer de 4 GB (RTX 2050) en 42,7 minutos, y porque demuestra que un modelo de 1.7 B de parametros puede superar ampliamente a su version sin ajustar en una tarea de clasificacion de intenciones y extraccion de slots en un idioma de bajos recursos. No obstante, es explicitamente un proyecto educativo, no apto para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen3-1.7B) |
| Parametros totales | 17,4 M entrenables en el adaptador (~1 % del modelo base); modelo base Qwen3-1.7B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para el adaptador; `max_length=256` durante el entrenamiento |
| Tipos de cuantizacion | Entrenamiento en 4 bits NF4 con double quant (QLoRA); inferencia segun el modelo base (bf16 en el ejemplo de uso) |
| Idiomas soportados | Ucraniano (uk) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only, mediante LoRA con `r=16`, `lora_alpha=32`, dropout 0,05 y `target_modules="all-linear"`. El entrenamiento usa QLoRA: modelo base cuantizado en 4 bits NF4 con double quantization y computo en bf16. Se emplea learning rate 2e-4 con decaimiento coseno, warmup de 10 pasos, batch efectivo de 16 (8 x 2), 400 pasos (~2 epocas), `assistant_only_loss=True`, gradient checkpointing y `max_length=256`.

Los datos provienen de la particion `en-US` de MASSIVE 1.1 (FitzGerald et al., 2022, CC BY 4.0), traducida al ucraniano con Gemma 4 E4B manteniendo la anotacion de slots. Se filtraron automaticamente traducciones con marcado roto, conjunto de parametros distinto o sin caracteres cirilicos. El entrenamiento se ejecuto en una NVIDIA RTX 2050 de 4 GB en 42,7 minutos con un pico de memoria de 3,55 GB; la validation loss bajo de 0,37 a 0,084, con meseta a partir del paso 325 y sin senales de sobreajuste. El modo de razonamiento (thinking) debe estar desactivado y el system prompt debe coincidir exactamente con el usado en entrenamiento.

## Capacidades

- Clasificacion de intenciones (intent classification) sobre 60 intenciones del esquema MASSIVE.
- Extraccion de slots (slot filling) sobre 54 tipos de parametros, devolviendo pares nombre-valor en JSON.
- Generacion de JSON valido como unica salida (100 % de JSON valido en el conjunto de test).
- Procesamiento de comandos de voz en ucraniano transcritos a texto (fecha, hora, clima, reproduccion de musica, alarmas, calendario, etc.).
- Funcionamiento con prompt corto (24 tokens) sin necesidad de instrucciones extensas.
- No soporta tool calling, agentes, vision, audio ni modo thinking en el uso previsto; el modo thinking debe desactivarse.

## Casos de uso

- Prototipado de asistentes de voz en ucraniano: el adaptador convierte la transcripcion de un comando en un JSON estructurado listo para enrutar a un backend de acciones (alarmas, clima, musica) con solo 24 tokens de prompt.
- Investigacion academica sobre QLoRA: sirve como referencia reproducible de ajuste eficiente en una GPU de 4 GB, con hiperparametros, curvas de loss y script (`ft_project.ipynb`) publicados.
- Experimentos de adaptacion de MASSIVE a idiomas de bajos recursos: el pipeline de traduccion con preservacion de slots y filtrado automatico es reutilizable para otros idiomas ausentes en el dataset.
- Evaluacion de modelos base en tareas estructuradas: permite comparar el rendimiento de Qwen3-1.7B con y sin ajuste (56,0 % vs 82,6 % de precision de intencion) en el mismo conjunto de test.
- Docencia y demos de extraccion de informacion: ejemplo didactico de salida JSON estricta con `do_sample=False` para resultados deterministas.
- Pruebas de integracion en pipelines de NLU: el formato de salida `{"intent": ..., "slots": {...}}` se puede validar y consumir directamente en un servicio de pruebas, siempre fuera de produccion.

## Benchmarks y rendimiento

Conjunto de test: 737 comandos sin solapamiento con el entrenamiento.

| Modelo / configuracion | JSON valido (%) | Precision de intencion (%) | F1 de slots (%) | Coincidencia completa (%) |
|---|---|---|---|---|
| Siempre la intencion mas frecuente | 100 | 7,3 | 0 | 1,5 |
| Qwen3-1.7B sin ajuste, prompt detallado (812 tokens) | 100 | 56,0 | 21,2 | 18,5 |
| Qwen3-1.7B sin ajuste, prompt corto | 10,7 | 0,1 | 0 | 0 |
| Este adaptador, prompt corto (24 tokens) | 100 | 82,6 | 73,0 | 60,7 |

El F1 de slots es micro-F1 sobre pares (nombre, valor) sin distinguir mayusculas. La coincidencia completa exige intencion y todos los slots correctos.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador anade ~17,4 M de parametros; el modelo base en bf16 requiere aproximadamente 3,4 GB solo para pesos, mas cache KV y activaciones. El entrenamiento QLoRA cupo en 4 GB (pico de 3,55 GB).
- GPU recomendadas: cualquier GPU con 8 GB o mas para inferencia comoda en bf16 (RTX 3060/4060, RTX 4090, A100, H100). El entrenamiento se realizo en una RTX 2050 de 4 GB.
- Cabe en GPU consumer: si, incluida una RTX 2050 de 4 GB para entrenamiento QLoRA; para inferencia se recomienda al menos 8 GB.
- Opciones de despliegue: transformers + PEFT (metodo documentado), con posible conversion a GGUF para llama.cpp u Ollama, aunque no se documenta en la model card; vLLM y TGI no estan verificados con este adaptador.
- Latencia y throughput: no disponibles. El entrenamiento completo tardo 42,7 minutos en una RTX 2050.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen3-1.7B + LoRA) | 1,7 B base + 17,4 M adaptador | no disponible (entrenado con 256) | Clasificacion de intenciones y slots en ucraniano | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-1.7B sin ajuste | 1,7 B | no disponible en la informacion | Modelo generico; 56,0 % de precision de intencion con prompt detallado | Apache 2.0 | Hugging Face |
| Modelos especificos de NLU para MASSIVE (p. ej. basados en mT5/XLM-R) | no disponible | no disponible | Clasificacion de intenciones y slots multilingue | varía | no disponible |

La comparacion con alternativas especificas de NLU para MASSIVE no se puede cuantificar con los datos disponibles; solo se dispone de la comparacion interna con el modelo base sin ajustar.

## Limitaciones y advertencias

- Confusion entre intenciones cercanas (`play_radio` / `play_music`, `calendar_set` / `calendar_query`) y bajo rendimiento en `general_quirky`.
- Los limites de los slots a veces difieren del estandar (por ejemplo, «у суботу» frente a «суботу»).
- Desconoce nombres propios y grupos musicales ucranianos no presentes en los datos.
- En consultas generales largas con el adaptador activo las respuestas pueden entrar en bucle; debe activarse solo para el analisis de comandos.
- Los datos son traduccion automatica, con errores y rusismos, y parte de las fronteras de slots de referencia es discutible.
- Proyecto academico, no destinado a produccion.
- Requiere el system prompt exacto de entrenamiento y el modo thinking desactivado; con otras configuraciones el rendimiento cae drasticamente (10,7 % de JSON valido con prompt corto sin ajuste).
- Licencia Apache 2.0 permite uso comercial, pero las limitaciones tecnicas desaconsejan su uso en produccion sin validacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ipz234gdi/qwen3-1.7b-voice-commands-uk-qlora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Codigo y memoria del laboratorio: https://github.com/ipz234gdi/CSHI/tree/main/lab5
- Dataset MASSIVE: https://github.com/alexa/massive
- Referencia de MASSIVE (FitzGerald et al., 2022): no disponible enlace directo en la informacion proporcionada
