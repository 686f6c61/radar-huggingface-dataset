# SadikNawazAI/sadik-ai-nano-multilingual

## Resumen

SadikAI nano multilingual es un modelo de lenguaje causal de aproximadamente 8 millones de parametros, entrenado desde cero por SadikNawazAI. Esta disenado para generacion de texto en ingles, hindi, hinglish y codigo, y se distribuye junto con una aplicacion de chat local completa que anade capas de memoria, busqueda web, matematicas, generacion de codigo, imagenes, audio y documentos ofimaticos.

El modelo es relevante por su enfoque de "paquete todo en uno": no solo publica los pesos, sino tambien el tokenizador BPE, un script de inferencia autonomo basado unicamente en PyTorch y una aplicacion de servidor de chat. Esto lo convierte en una pieza didactica y de prototipado rapido para entornos con recursos muy limitados, mas que en una alternativa a modelos de gran escala.

Por su tamano (~8M de parametros) y su licencia MIT, encaja en escenarios de experimentacion, ensenanza y despliegue en dispositivos de bajisima capacidad. No obstante, la informacion publica disponible es muy escasa: no se detallan la arquitectura interna, el volumen de datos de entrenamiento ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm); detalles internos no disponibles |
| Parametros totales | ~8 millones |
| Parametros activos | no disponible (no es MoE segun la informacion publicada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, hi (y hinglish segun tags) |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch (`weights.pt`) + JSON de arquitectura; tokenizador BPE (`tokenizer.json`) |

## Arquitectura y entrenamiento

El modelo es un transformer causal entrenado desde cero, segun indica el autor. Se acompana de un tokenizador BPE a nivel de byte con un vocabulario de 32.768 tokens. La release incluye un fichero JSON con la arquitectura y un checkpoint de inferencia en formato PyTorch (`weights.pt`), ademas de un script `generate.py` que solo requiere `torch` para muestrear texto.

No se especifican en la informacion disponible el numero de capas, dimensiones ocultas, cabezas de atencion, longitud de contexto nativa, volumen de tokens de entrenamiento, composicion exacta del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El autor menciona fuentes de datos y licencias en un fichero `DATA_SOURCES.md` del release, pero su contenido no se ha publicado en la informacion proporcionada.

## Capacidades

- Generacion de texto causal: continuacion de texto, relatos y poemas, segun la model card.
- Cobertura multilingue limitada a ingles, hindi e hinglish.
- Generacion de codigo a traves de la capa curada de la aplicacion de chat, no necesariamente del modelo base.
- La aplicacion de chat incluida aporta capacidades adicionales: memoria entre sesiones, busqueda de hechos en la web, resolucion de matematicas, generacion de imagenes, sintesis de voz y creacion de ficheros PDF, Word, Excel y CSV.
- No se documenta soporte de tool calling o function calling nativo del modelo.
- No se documenta soporte de agentes ni razonamiento multi-paso nativo.
- No se documenta modo thinking, vision ni audio en el modelo base (la app incorpora generacion de imagenes y audio como capa externa).

## Casos de uso

- Prototipado educativo de LLM: el paquete permite estudiar el ciclo completo (tokenizador, checkpoint, sampler y app) en una sola descarga de menos de 1 GB, ideal para cursos y talleres.
- Inferencia en dispositivos de bajos recursos: con ~8M de parametros, el modelo puede ejecutarse en CPU y en GPUs integradas sin cuantizacion agresiva, lo que facilita demos en portatiles y Raspberry Pi.
- Generacion creativa breve: continuacion de textos, relatos cortos y poemas en ingles e hindi, aprovechando el sampler incluido (`generate.py`).
- Experimentacion con hinglish: util para probar tokenizacion y generacion en un registro linguistico poco cubierto por modelos grandes.
- Base para fine-tuning ligero: su tamano reducido permite reentrenar o ajustar el modelo en una sola GPU consumer para tareas especificas de dominio.
- Asistente local con la app incluida: despliegue de un chat con memoria, busqueda web y generacion de documentos ofimaticos en entornos sin conexion a servicios en la nube.
- Pruebas de integracion de pipelines: servir el modelo mediante el servidor de chat incluido (`app/chat_server.py`) para validar flujos de前端/backend antes de migrar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 para ~8M de parametros (pesos ~32 MB, mas overhead de activaciones y tokenizador).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1050, RTX 3050, RTX 4090) e incluso en GPUs integradas.
- Opciones de despliegue: el release incluye `generate.py` (solo PyTorch) y `app/chat_server.py` (servidor de chat). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| SadikAI nano multilingual | ~8M | no disponible | en, hi, hinglish | MIT | PyTorch (`weights.pt`) |
| SmolLM-135M (HuggingFace) | 135M | 2.048 tokens | en (principalmente) | Apache 2.0 | safetensors, GGUF |
| TinyLlama-1.1B | 1,1B | 2.048 tokens | en (principalmente) | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-0.5B | 0,5B | 32.768 tokens | multilingue amplio | Apache 2.0 | safetensors, GGUF |

La comparativa se ofrece como referencia de categoria (modelos pequenos); no se dispone de datos de rendimiento del modelo SadikAI que permitan una comparacion cuantitativa. El modelo SadikAI es aproximadamente 17 veces menor que SmolLM-135M y 60 veces menor que Qwen2.5-0.5B.

## Limitaciones y advertencias

- Capacidad linguistica y de razonamiento muy limitada por su tamano (~8M de parametros); no es adecuado para tareas que requieran conocimiento factual amplio o razonamiento complejo.
- Riesgo elevado de alucinacion en la generacion de texto, especialmente en dominios no cubiertos por el entrenamiento.
- Cobertura multilingue restringida a ingles, hindi e hinglish; no se documenta soporte de castellano ni de otras lenguas.
- Longitud de contexto no documentada; probablemente corta, lo que limita conversaciones multi-turno largas sin la capa de memoria de la app.
- La generacion de codigo, matematicas, imagenes, audio y documentos depende de la aplicacion incluida (capas curadas y servicios externos), no del modelo base; conviene no atribuir esas capacidades al LLM.
- Licencia MIT permite uso comercial, pero el autor no especifica la procedencia exacta de los datos de entrenamiento en la informacion disponible; conviene revisar `DATA_SOURCES.md` antes de un uso en produccion.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- No se han publicado evaluaciones independientes ni benchmarks; el rendimiento real es desconocido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SadikNawazAI/sadik-ai-nano-multilingual
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados al modelo.
