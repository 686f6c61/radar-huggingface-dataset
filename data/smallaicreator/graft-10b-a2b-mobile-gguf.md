# SmallAICreator/GRAFT-10B-A2B-Mobile-GGUF

## Resumen

GRAFT-10B-A2B Mobile es la edicion reducida para telefonos de GRAFT-10B-A2B, un modelo conversacional de mezcla de expertos (MoE) desarrollado por UltraLabs bajo el alias SmallAICreator. Parte de Qwen/Qwen3-30B-A3B-Instruct-2507 (Apache 2.0) y aplica un proceso propietario denominado GRAFT para reducir el modelo hasta 10.331.932.672 parametros totales manteniendo 4 expertos activos por token. El resultado se distribuye como un unico archivo GGUF de 3,21 GB que cabe y se ejecuta integramente en un telefono.

Su relevancia actual esta en el nicho de inferencia on-device: la mayoria de modelos de calidad conversacional en ese rango de tamano exigen 6-8 GB de RAM o una GPU, mientras que esta version apunta a un presupuesto de memoria de unos 3,5 GB. Para lograrlo combina cuantizacion extrema de los expertos (IQ2_XXS/IQ2_XS calibrada con importance matrix) con 4 bits en las capas que usa cada token (atencion y embeddings), una estrategia que degrada menos la calidad de lo que sugeriria el peso medio de 2 bits de los expertos.

El modelo conserva la plantilla de chat ChatML con soporte de tool calling embebida en el GGUF, contexto configurable hasta 32K tokens (aunque el autor recomienda 2K-4K en movil) y licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Se ejecuta sobre llama.cpp y sobre apps Android basadas en el, como L-AI o PocketPal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-MoE (mixture-of-experts), 48 capas, 40 expertos, 4 activos por token, hidden size 2048 |
| Parametros totales | 10.331.932.672 (~10,3B) |
| Parametros activos | no disponible (la denominacion A2B apunta a ~2B activos, no confirmado en la informacion disponible) |
| Longitud de contexto | hasta 32K; recomendado 2K-4K en telefonos |
| Tipos de cuantizacion | IQ2_XXS / IQ2_XS en expertos (calibrados con importance matrix); Q4_0 en atencion y embeddings |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (un unico archivo, `GRAFT-10B-A2B-Mobile.gguf`, 3,21 GB) |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos de tipo Qwen3-MoE con 48 capas, 40 expertos por capa, 4 expertos activos por token y tamano oculto de 2048. No se trata de un entrenamiento desde cero: deriva de Qwen3-30B-A3B-Instruct-2507, del que UltraLabs obtiene una version comprimida mediante la tecnica que el autor llama GRAFT, seguida de una fase de "healing" y un ajuste conversacional (chat-tuning) propio. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO en esa fase de ajuste.

La innovacion tecnica principal esta en el esquema de cuantizacion por bloques de la red. Los 40 expertos concentran aproximadamente el 88% de los pesos, pero solo unos pocos se ejecutan por token; se almacenan a ~2 bits (IQ2_XXS/IQ2_XS) con calibracion por importance matrix, de modo que los pesos mas relevantes conservan mas precision que el resto. La atencion y los embeddings, que intervienen en todos los tokens, se mantienen a 4 bits en formato Q4_0, que llama.cpp reorganiza en tiempo de carga en disposiciones optimizadas para CPU ARM. Ademas, el modelo reduce de 5 a 4 el numero de expertos activos por token respecto a la version no Mobile, bajando el coste computacional por token a cambio de una ligera perdida de calidad.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat ChatML embebida en el propio archivo GGUF.
- Soporte de tool calling / function calling a traves de la plantilla de chat incluida en el GGUF.
- Razonamiento multi-turno dentro de la ventana de contexto configurada (2K-4K recomendado en movil para mantener latencia y memoria).
- Ejecucion integramente local y offline, sin llamadas a API externas, sobre llama.cpp y apps derivadas.
- Ajuste de comportamiento mediante system prompt: el autor recomienda fijar la identidad ("You are GRAFT-10B-A2B, a helpful AI assistant made by UltraLabs") porque sin prompt de sistema el modelo a veces se presenta con el nombre del modelo base.
- No se documentan capacidades multimodales (vision o audio), ni modo "thinking" explicito, ni otras capacidades especiales en la informacion disponible.
- Cobertura multilingue limitada: la model card declara unicamente ingles.

## Casos de uso

- Asistente conversacional offline en telefono: el modelo cabe en 3,21 GB y necesita unos 3,5 GB de RAM libre, por lo que permite un chatbot privado sin conexion en dispositivos de 8 GB o mas, con contexto de 2K-4K y velocidad en torno a 3 tokens/s en hardware como un Pixel 6a.
- Prototipado de agentes con herramientas en movil: al incluir tool calling en la plantilla ChatML, se puede integrar en flujos que consulten APIs locales o ejecuten acciones sobre el dispositivo, con la ventaja de no depender de red.
- Aplicaciones de accesibilidad o asistencia por voz en local: combinado con STT/TTS del propio telefono, sirve como capa de generacion de respuestas sin enviar datos del usuario a servidores externos.
- Despliegue en equipos de bajos recursos (PC con 8 GB de RAM o menos): el autor lo recomienda explicitamente para esa franja, donde una alternativa Q4_K_M de 6,27 GB no cabria con holgura.
- Pruebas de concepto de MoE cuantizado a 2 bits: util para investigadores que quieran medir el impacto real de IQ2_XXS/IQ2_XS con importance matrix frente a cuantizaciones a 4 bits en tareas de chat.
- Servidor local ligero con `llama-server` en una maquina modesta: permite exponer un endpoint compatible con OpenAI en hardware sin GPU, util para demos internas o entornos de laboratorio con recursos limitados.
- Educacion y experimentacion con modelos abiertos: al ser Apache 2.0 y de un solo archivo, es sencillo de distribuir en cursos o talleres sin infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y la busqueda web realizada no devolvio resultados relevantes sobre el modelo (unicamente contenido no relacionado). El unico dato de rendimiento publicado es la velocidad de inferencia observada en un Pixel 6a (6 GB de RAM): aproximadamente 3 tokens/s.

## Requisitos de hardware

- RAM de sistema: unos 3,5 GB libres para cargar el modelo; el autor indica que los telefonos con 8 GB de RAM o mas son los mas comodos, aunque cabe en un Pixel 6a de 6 GB cerrando otras aplicaciones.
- GPU: no se requiere; esta pensado para CPU. No se publican cifras de VRAM ni de aceleracion por GPU para este archivo.
- Cabe en GPU de consumo: no aplica como requisito; el modelo esta disenado para ejecucion en CPU de dispositivo movil. En un PC, cualquier equipo con 8 GB de RAM o menos es el objetivo declarado.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) y aplicaciones Android basadas en llama.cpp como L-AI (del mismo autor) o PocketPal.
- Latencia y throughput estimados: ~3 tokens/s en Pixel 6a con contexto de 2K-4K y 4 hilos en telefonos con disposicion de nucleos 2+2+4. No hay datos publicados para otras plataformas.
- Ajustes recomendados por el autor: temperatura 0,7; top-p 0,8; top-k 20; repeat penalty 1,05.

## Comparativa con modelos similares

| Modelo | Parametros | Expertos activos | Tamano en disco | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GRAFT-10B-A2B Mobile (este) | ~10,3B | 4 por token | 3,21 GB (IQ2_XXS/IQ2_XS + Q4_0) | hasta 32K (2K-4K recomendado en movil) | Apache 2.0 | GGUF, llama.cpp y apps Android |
| GRAFT-10B-A2B (Q4_K_M) | ~10,3B | 5 por token | 6,27 GB (Q4_K/Q6_K + Q4_K/Q6_K) | no disponible | Apache 2.0 | GGUF, llama.cpp |
| Qwen3-30B-A3B-Instruct-2507 (modelo base) | 30B segun denominacion | no disponible en la informacion proporcionada | no disponible | no disponible | Apache 2.0 | safetensors / GGUF segun el repositorio oficial de Qwen |

La comparativa se limita a los tres modelos sobre los que hay datos en la informacion disponible. No se dispone de cifras de rendimiento comparadas entre ellos, por lo que la eleccion entre GRAFT-10B-A2B Mobile y la version Q4_K_M se reduce, segun el autor, a un criterio de memoria: el archivo Mobile para telefonos o equipos con 8 GB de RAM o menos, y el Q4_K_M para equipos con 16 GB de RAM donde prima la calidad.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera inferior.
- La cuantizacion a ~2 bits en los expertos introduce perdida de calidad respecto a la version Q4_K_M de 6,27 GB; el propio autor recomienda esta ultima cuando la memoria no es limitada.
- Riesgo de alucinacion inherente a cualquier modelo de este tamano y a una cuantizacion agresiva; no se han publicado evaluaciones de fidelidad factual.
- Sin system prompt, el modelo puede identificarse con el nombre del modelo base (Qwen3) en lugar de con GRAFT-10B-A2B.
- El contexto real recomendado en movil es de 2K-4K tokens, muy por debajo del maximo de 32K, por limitaciones de memoria y velocidad.
- La velocidad de ~3 tokens/s en un Pixel 6a limita su uso a conversacion pausada, no a tareas interactivas que exijan baja latencia.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicacion reciente y sin validacion comunitaria amplia.
- El proceso GRAFT y la fase de "healing" estan descritos de forma superficial en la model card; no se detalla el dataset de ajuste ni el impacto medido de la compresion.
- Licencia Apache 2.0: permite uso comercial y modificacion sin restricciones adicionales, siempre que se conserve el aviso de licencia; conviene verificar igualmente las condiciones del modelo base Qwen3-30B-A3B-Instruct-2507.
- Los resultados de la busqueda web realizada no aportan informacion tecnica sobre el modelo (contenido no relacionado), por lo que toda la ficha se sustenta en la model card y los metadatos de HuggingFace.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SmallAICreator/GRAFT-10B-A2B-Mobile-GGUF
- Version completa GRAFT-10B-A2B (Q4_K_M): https://huggingface.co/SmallAICreator/GRAFT-10B-A2B-GGUF
- Modelo base Qwen3-30B-A3B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- GRAFT-1B: https://huggingface.co/SmallAICreator/GRAFT-1B
- App Android L-AI: https://huggingface.co/SmallAICreator/L-AI-Android
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre el modelo; las busquedas devolvieron contenido no relacionado.
