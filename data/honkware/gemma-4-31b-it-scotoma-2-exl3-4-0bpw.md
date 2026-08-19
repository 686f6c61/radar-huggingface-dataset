# Honkware/gemma-4-31B-it-scotoma-2-exl3-4.0bpw

## Resumen

Este repositorio contiene una cuantización en formato EXL3 del modelo `ReadyArt/gemma-4-31B-it-scotoma-2`, realizada por Honkware con 4.0 bits por peso (bpw). El modelo resultante ocupa 20.1 GB y está pensado para inferencia eficiente en GPU con el ecosistema ExLlamaV3. Se trata de una versión densa (no MoE) de la familia Gemma 4, concretamente una variante afinada (it) denominada "scotoma-2". Al ser una cuantización, las capacidades y limitaciones funcionales dependen del modelo base, del cual no se proporcionan detalles adicionales en esta ficha. La relevancia de este artefacto radica en permitir ejecutar un modelo de 31B en hardware de gama media-alta con una huella de memoria reducida, manteniendo un equilibrio entre calidad y velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4 31B (Dense, transformer) |
| Parametros totales | 10.020.605.548 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 4.0 bpw (este repo); tambien 4.5 y 5.0 bpw en repos hermanos |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (EXL3) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni el proceso de entrenamiento del modelo base `ReadyArt/gemma-4-31B-it-scotoma-2`. La model card de esta cuantizacion indica que el formato es EXL3, con 4.0 bits por peso, 8 bits para la cabeza (head bits) y 250 filas de calibracion. El codebook utilizado es `mul1`, que requiere ExLlamaV3 v0.0.3 o superior para decodificar correctamente. La cuantizacion fue realizada con la herramienta BlockQuant, sin anadir restricciones adicionales a las del modelo base. Al tratarse de una cuantizacion, no se aportan datos sobre el dataset de entrenamiento, el numero de tokens procesados o el uso de tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional: al ser una variante "it" (instruction-tuned), el modelo base esta disenado para seguir instrucciones y mantener dialogos.
- Integracion con el ecosistema ExLlamaV3: compatible con TabbyAPI (servidor HTTP compatible con OpenAI), text-generation-webui y la API Python de ExLlamaV3.
- Cuantizacion de 4.0 bpw que reduce el uso de VRAM respecto al modelo original de 31B, permitiendo inferencia en GPUs con 24 GB o mas.
- No se han publicado capacidades especificas adicionales (tool calling, vision, audio, etc.) en la informacion disponible.

## Casos de uso

- Despliegue de un chatbot local en una GPU de consumo (p. ej., RTX 3090/4090) gracias al tamano de 20.1 GB, usando TabbyAPI como servidor compatible con OpenAI.
- Prototipado rapido de aplicaciones de generacion de texto en entornos de desarrollo, mediante la API Python de ExLlamaV3.
- Evaluacion de la calidad de un modelo Gemma 4 afinado en tareas de instruccion, sin necesidad de cargar los pesos completos en memoria.
- Uso como backend para herramientas de asistencia a la escritura o resumen de documentos, siempre que el contexto y las capacidades del modelo base lo permitan (no verificado).
- Pruebas de rendimiento de cuantizaciones EXL3 a diferentes bpw (4.0, 4.5, 5.0) para comparar calidad vs. velocidad en el mismo hardware.
- Integracion en pipelines de generacion de texto donde se requiera una huella de memoria moderada y compatibilidad con el formato EXL3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otras metricas comparativas para esta cuantizacion ni para el modelo base.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 20.1 GB. Se recomienda una GPU con al menos 24 GB de VRAM para cargar el modelo con margen para contexto y overhead de inferencia.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 (40 GB), H100 (80 GB) o similares con soporte CUDA.
- En GPUs con menos de 24 GB no es viable cargar el modelo completo; se necesitaria cuantizacion mas agresiva o descarga parcial.
- Opciones de despliegue: TabbyAPI (servidor HTTP), text-generation-webui (cargador ExLlamaV3), o la API Python de ExLlamaV3.
- Latencia y throughput: no disponibles. Dependen del hardware, la longitud del contexto y la configuracion de decodificacion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos. Se puede mencionar que existen otras cuantizaciones del mismo modelo base a 4.5 y 5.0 bpw en la coleccion de Honkware, que ofrecen un equilibrio diferente entre tamano y fidelidad. No se conocen alternativas directas de otros autores con el mismo fine-tuning.

## Limitaciones y advertencias

- La cuantizacion a 4.0 bpw puede introducir una perdida de precision respecto al modelo original en tareas que requieran alta exactitud numerica o razonamiento complejo.
- Se requiere ExLlamaV3 v0.0.3 o superior para cargar el modelo correctamente; versiones anteriores ignorarian el codebook `mul1` y produciran resultados incorrectos.
- No se dispone de informacion sobre sesgos, riesgos de alucinacion o limitaciones de contexto del modelo base. Se recomienda consultar la documentacion de `ReadyArt/gemma-4-31B-it-scotoma-2` antes de usar el modelo en produccion.
- La licencia apache-2.0 permite uso comercial, pero las restricciones del modelo base (si las hubiera) prevalecen. No se han verificado los terminos del repositorio original.
- El numero de descargas y likes es cero, lo que sugiere que el modelo es reciente y no ha sido ampliamente validado por la comunidad.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Honkware/gemma-4-31B-it-scotoma-2-exl3-4.0bpw
- Modelo base: https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma-2
- Coleccion de cuantizaciones (4.5 y 5.0 bpw): https://huggingface.co/collections/Honkware/gemma-4-31b-it-scotoma-2-exl3-6a823003c900a8baba78fdcf
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- BlockQuant (herramienta de cuantizacion): https://github.com/Honkware/blockquant
- TabbyAPI: https://github.com/theroyallab/tabbyAPI
- text-generation-webui: https://github.com/oobabooga/text-generation-webui
