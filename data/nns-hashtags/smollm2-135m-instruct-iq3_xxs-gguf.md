# nns-hashtags/SmolLM2-135M-Instruct-IQ3_XXS-GGUF

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una cuantización en formato GGUF del modelo `HuggingFaceTB/SmolLM2-135M-Instruct`, publicada por el usuario `nns-hashtags` mediante el espacio automatizado GGUF-my-repo de ggml.ai. Se trata de un checkpoint de 134.515.008 parámetros convertido al tipo de cuantización IQ3_XXS con matriz de importancia (imatrix), lo que reduce el peso del fichero a aproximadamente 50-60 MB (el repositorio completo ocupa 0,1 GB). El resultado es un modelo conversacional en inglés, con licencia Apache-2.0, pensado para inferencia en CPU, dispositivos de borde y entornos sin GPU.

La relevancia de esta ficha es práctica: SmolLM2-135M es uno de los modelos Instruct más pequeños de la familia SmolLM2 de Hugging Face, y esta variante cuantizada permite ejecutarlo con llama.cpp en hardware muy limitado (Raspberry Pi, portátiles antiguos, contenedores pequeños). No obstante, IQ3_XXS es una cuantización agresiva (en torno a 3 bits por peso) sobre un modelo ya de por sí muy pequeño, por lo que la degradación de calidad respecto al original en safetensors es esperable y debe validarse en la tarea concreta antes de usarlo en producción.

El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y fue creado el 17 de octubre de 2026 según los metadatos de Hugging Face. Es, por tanto, una conversión de conveniencia y no una publicación de referencia: para cualquier uso serio conviene comparar con el modelo base original y con otras cuantizaciones (Q4_K_M, Q5_K_M) del mismo checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (modelo base SmolLM2-135M-Instruct); detalles de capas y dimensiones no disponibles en la informacion proporcionada |
| Parametros totales | 134.515.008 (134,5 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de la model card usa `-c 2048`; el maximo del modelo base no se detalla aqui) |
| Tipos de cuantizacion | GGUF IQ3_XXS con imatrix (importance matrix), ~3 bits por peso; el repositorio solo publica esta variante |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`smollm2-135m-instruct-iq3_xxs-imat.gguf`); los tags del repositorio mencionan tambien safetensors, onnx y transformers.js, pero el artefacto descrito en la model card es GGUF para llama.cpp |
| Tamano del repositorio | 0,1 GB |
| Cuantizacion con imatrix | si (sufijo `-imat` en el nombre del fichero) |
| Pipeline | text-generation |
| Modelo base | HuggingFaceTB/SmolLM2-135M-Instruct |

## Arquitectura y entrenamiento

La model card de este repositorio no aporta informacion sobre el entrenamiento: es una conversion de formato, no un entrenamiento nuevo. Lo unico documentado es que se genero con llama.cpp a traves del espacio GGUF-my-repo de ggml.ai, que aplica cuantizacion de tipo IQ3_XXS asistida por matriz de importancia para minimizar el error de cuantizacion en las capas mas sensibles. El resultado es un fichero GGUF de un unico tensor set, cargable directamente por `llama-cli` y `llama-server`.

Sobre el modelo de origen, la documentacion publica de la familia SmolLM2 (Hugging Face TB, paper arXiv:2502.02737, no incluido en la informacion de esta ficha) describe una arquitectura transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, RoPE y atencion con query/key/value agrupadas (GQA), entrenada sobre un corpus de varios billones de tokens con etapas posteriores de ajuste supervisado y optimizacion de preferencias. Esos datos corresponden al modelo base y no han sido verificados en la informacion proporcionada para esta ficha; se citan solo como contexto. Cualquier afirmacion sobre tokens exactos, composicion del dataset o uso de RLHF/DPO en esta variante cuantizada debe considerarse no disponible.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat Instruct (el modelo base esta ajustado para seguir instrucciones).
- Respuestas de un solo turno y multi-turno cortos; util para tareas acotadas y plantillas cerradas.
- Razonamiento muy limitado: al ser un modelo de 135 M, falla en problemas de varios pasos, aritmetica no trivial y logica compleja.
- Generacion de codigo basica (fragmentos cortos, autocompletado), sin garantias de correccion; no es un modelo de codigo.
- Capacidad multilingue: solo ingles declarado; el rendimiento en castellano no esta documentado y previsiblemente sera pobre.
- No hay soporte documentado de tool calling / function calling nativo ni de modo "thinking" o razonamiento extendido en este checkpoint.
- No dispone de vision ni audio.
- Ejecutable en llama.cpp, lo que permite integrarlo en aplicaciones de escritorio, CLI y servidores HTTP ligeros sin dependencias de Python.
- Compatible con el ecosistema de herramientas de llama.cpp (`llama-cli`, `llama-server`, bindings de terceros), aunque el flag `endpoints_compatible` del repositorio sugiere compatibilidad con endpoints tipo OpenAI a traves de servidores de inferencia; no se detalla en la model card.

## Casos de uso

- Clasificacion y enrutado de intenciones en local: usar el modelo como clasificador de texto corto (categoria de ticket, intencion de consulta) en un pipeline donde la latencia y el coste importan mas que la precision maxima; su tamano permite ejecutarlo en la misma maquina que el servicio.
- Autocompletado y generacion de texto en dispositivos de borde: integrado via llama.cpp en Raspberry Pi, routers o portatiles sin GPU, con un consumo de RAM por debajo de 1 GB, para sugerencias cortas o respuestas predefinidas.
- Prototipado rapido de aplicaciones conversacionales: validar la interfaz, el formato de prompts y el flujo de la aplicacion antes de invertir en un modelo mayor; el fichero de ~50-60 MB se descarga y arranca en segundos.
- Generacion de datos sinteticos simples y aumentacion: producir variaciones de frases cortas, plantillas o pares pregunta-respuesta en ingles para tareas de etiquetado de bajo riesgo, siempre con revision humana.
- Filtrado y resumen extractivo de textos muy cortos: limpiar listas, normalizar campos o condensar notas breves en ingles dentro de un pipeline por lotes en CPU.
- Pruebas de humo (smoke tests) de infraestructura de inferencia: usar este GGUF como modelo "canario" en CI para verificar que llama.cpp, el servidor y las rutas de descarga funcionan, gracias a su tamano ridiculo y su licencia permisiva.
- Educacion y demostraciones: mostrar el funcionamiento de la cuantizacion y de la inferencia local en talleres, sin necesidad de GPU ni de credenciales de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye metricas (MMLU, HumanEval, GSM8K ni otras) y no se ha realizado una evaluacion propia del checkpoint cuantizado. Cualquier cifra de benchmarks debe consultarse en la documentacion del modelo base `HuggingFaceTB/SmolLM2-135M-Instruct`; ademas, hay que tener en cuenta que los resultados del modelo en safetensors no son directamente extrapolables a una cuantizacion IQ3_XXS.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en todos los casos. Los pesos ocupan aproximadamente 50-60 MB (134,5 M de parametros a ~3 bits por peso, mas metadatos) y el resto es cache KV segun contexto.
- RAM/VRAM practica recomendada: 512 MB - 1 GB para contexto de 2048 tokens; 1-2 GB para contextos mayores.
- GPU: funciona en cualquier GPU con al menos 1 GB de memoria (GTX 1050, GTX 1650, RTX 3050, RTX 4090, A100, H100); no necesita aceleracion dedicada y aporta poco rendimiento adicional frente a CPU en este tamano.
- Cabe holgadamente en GPU de consumo y en hardware integrado: Raspberry Pi 4/5, mini-PC con Intel N100, moviles de gama media mediante bindings de llama.cpp.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`), llama-cpp-python, Ollama importando el GGUF, LM Studio, o cualquier runtime compatible con GGUF. vLLM y TGI no estan indicados para este formato/tamano en la informacion disponible.
- Comando de referencia de la model card: `llama-server --hf-repo nns-hashtags/SmolLM2-135M-Instruct-IQ3_XXS-GGUF --hf-file smollm2-135m-instruct-iq3_xxs-imat.gguf -c 2048`.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para este checkpoint en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| Este modelo (SmolLM2-135M-Instruct IQ3_XXS) | 134,5 M | no disponible (ejemplo a 2048) | Apache-2.0 | GGUF IQ3_XXS | Cuantizacion agresiva de terceros; 0 descargas; calidad no evaluada |
| SmolLM2-135M-Instruct (original) | 134,5 M | no disponible en esta ficha | Apache-2.0 | safetensors | Referencia de calidad; misma huella de parametros, mayor peso en disco |
| SmolLM2-360M-Instruct | ~362 M | no disponible en esta ficha | Apache-2.0 | safetensors, GGUF | Misma familia y tokenizer; mejor calidad esperada a cambio de mas computo |
| Qwen2.5-0.5B-Instruct | ~494 M | 32.768 tokens (segun documentacion publica) | Apache-2.0 | safetensors, GGUF | Alternativa multilingue (incluye castellano) de tamano ligeramente superior |
| TinyLlama-1.1B-Chat | ~1,1 B | 2048 tokens (segun documentacion publica) | Apache-2.0 | safetensors, GGUF | Un orden de magnitud mas de parametros; requiere mas RAM |

No se dispone de comparaciones de rendimiento medidas entre estos modelos en la informacion proporcionada; la tabla recoge solo parametros, contexto declarado, licencia y disponibilidad de formatos.

## Limitaciones y advertencias

- Cuantizacion IQ3_XXS: es una de las cuantizaciones mas agresivas de llama.cpp sobre un modelo ya diminuto; se espera una perdida de calidad apreciable frente al safetensors original, especialmente en coherencia a partir de unas pocas decenas de tokens.
- Alucinacion: alta probabilidad de inventar hechos, nombres, cifras y referencias, incluso en dominios comunes. No debe usarse como fuente de informacion sin verificacion.
- Idioma: solo se declara ingles. El rendimiento en castellano no esta documentado y previsiblemente sera deficiente; no se recomienda para produccion en espanol sin evaluacion previa.
- Razonamiento y matematicas: capacidad muy limitada por el tamano (135 M); no es adecuado para problemas multi-paso, calculo numerico ni generacion de codigo no trivial.
- Contexto: la model card solo ejemplifica 2048 tokens; no se documenta la ventana maxima real de esta conversion ni como se degrada con contextos largos.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero se heredan las condiciones del modelo base; conviene revisar la model card de `HuggingFaceTB/SmolLM2-135M-Instruct` y conservar la atribucion.
- Procedencia: repositorio generado automaticamente por GGUF-my-repo, con 0 descargas y 0 likes; no hay garantias de mantenimiento, ni evaluacion independiente, ni firma del autor original. Para produccion, es preferible generar la cuantizacion uno mismo desde el modelo base o usar repositorios oficiales.
- Sesgos: no documentados en la informacion disponible; al provenir de datos web a gran escala, es esperable que reproduzca sesgos del corpus original.
- Robustez: puede entrar en bucles de repeticion y romper el formato de chat con prompts largos o fuera de distribucion.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/nns-hashtags/SmolLM2-135M-Instruct-IQ3_XXS-GGUF
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Espacio GGUF-my-repo (ggml.ai): https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Paper de la familia SmolLM2 (referencia del modelo base): https://arxiv.org/abs/2502.02737
- Variantes mayores de la familia: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct y https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
