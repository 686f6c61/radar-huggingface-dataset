# Odiora/NOVA-Spark-5.1-Q4_K_M-GGUF

## Resumen

NOVA-Spark-5.1-Q4_K_M-GGUF es la version cuantizada en formato GGUF del modelo Odiora/NOVA-Spark-5.1, un modelo de lenguaje de tipo transformer denso con aproximadamente 20.900 millones de parametros (20,9 B) segun los pesos en safetensors del modelo base. Lo publica el usuario Odiora, que no aporta informacion corporativa verificable en la model card; la unica referencia externa encontrada bajo el nombre "Odiora" corresponde a una joyeria de Lyon sin relacion con el proyecto. El modelo esta orientado a generacion de texto conversacional, asistencia tipo chat e "inteligencia emocional" segun sus etiquetas, y se distribuye con licencia Apache 2.0.

La relevancia de esta ficha reside en que es una conversion GGUF generada automaticamente mediante el espacio GGUF-my-repo de ggml.ai a partir del modelo original, con cuantizacion Q4_K_M y un tamano de repositorio de 15,8 GB. Esto lo hace ejecutable en llama.cpp y en entornos compatibles con GGUF, lo que reduce los requisitos de hardware frente a los pesos completos en precision nativa. No obstante, la informacion tecnica publicada es muy limitada: no se detallan datos de entrenamiento, composicion del dataset, longitud de contexto ni resultados de benchmarks.

El modelo declara soporte para tres idiomas (ingles, kazajo y ruso) y esta entrenado sobre el dataset cortex-ai-nova/Insider-Nano, con etiquetas que sugieren ajuste por instrucciones y entrenamiento sintetico. La ausencia de documentacion sobre el proceso de alineacion, la ventana de contexto y el rendimiento medido obliga a tratar cualquier uso en produccion con cautela y a validar el comportamiento antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se especifica variante ni detalles en la model card) |
| Parametros totales | 20.914.757.184 (20,9 B) segun safetensors del modelo base |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (esta version); no se listan otras cuantizaciones en el repo |
| Idiomas soportados | en, kk, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (pesos originales del modelo base en safetensors, no verificados en esta ficha) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de las etiquetas genericas de generacion de texto y conversacional. Por el numero de parametros (20,9 B) y el formato de publicacion, se trata de un transformer denso, pero no se especifica el numero de capas, dimensiones ocultas, mecanismo de atencion (completa o lineal) ni si incorpora innovaciones como decodificacion especulativa. Tampoco se documenta el tokenizador ni el vocabulario.

En cuanto al entrenamiento, la unica informacion disponible es que se uso el dataset cortex-ai-nova/Insider-Nano y que el modelo esta etiquetado como instruction-tuned y synthetic-training. No se indica el numero de tokens de entrenamiento, la composicion del corpus, si hubo RLHF, DPO u otra fase de alineacion, ni el proceso de filtrado de datos. La model card de esta version GGUF es una plantilla automatica de GGUF-my-repo que remite a la model card original para mas detalles, por lo que no aporta informacion adicional sobre el entrenamiento.

## Capacidades

- Generacion de texto conversacional multi-turno en formato ChatML, segun las etiquetas del repositorio.
- Ajuste por instrucciones (instruction-tuned), orientado a seguir indicaciones del usuario.
- Capacidades declaradas de "inteligencia emocional" y roleplay, segun las etiquetas del autor; no hay evaluacion publicada que las respalde.
- Soporte multilingue declarado para ingles, kazajo y ruso.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio.
- No se documenta capacidad de codigo ni matematicas de forma especifica.

## Casos de uso

- Asistente conversacional en ingles, kazajo o ruso: el modelo puede mantener dialogos multi-turno en formato ChatML, adecuado para prototipos de chatbot en esas tres lenguas, aunque la ventana de contexto no esta documentada y debe validarse empiricamente.
- Roleplay y generacion creativa: las etiquetas de roleplay y emotional-intelligence sugieren uso en narrativa interactiva y personajes conversacionales; conviene evaluar la coherencia a largo plazo antes de usarlo en productos.
- Despliegue local en estaciones de trabajo: al estar en GGUF Q4_K_M, puede ejecutarse con llama.cpp en equipos con GPU consumer de gama alta o incluso en CPU, lo que facilita pruebas sin infraestructura de servidor.
- Prototipado rapido de aplicaciones de chat: la integracion con llama-server y el formato ChatML permiten levantar un endpoint HTTP local en pocos pasos, util para validar ideas antes de invertir en modelos mayores.
- Investigacion sobre modelos pequenos multilingues: con 20,9 B de parametros y licencia Apache 2.0, sirve como base para experimentos de evaluacion comparativa en ingles, kazajo y ruso.
- Traduccion asistida entre ingles y ruso o kazajo: el soporte declarado de estos idiomas permite probarlo en tareas de traduccion o parafraseo, siempre con revision humana dada la falta de benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia con Q4_K_M: aproximadamente 12-14 GB para los pesos (15,8 GB de repositorio incluyen otros artefactos), mas overhead de contexto KV; en la practica se recomienda un minimo de 16 GB de VRAM para ventanas de contexto moderadas.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB o H100 para despliegues con contexto largo o concurrencia.
- Cabe en GPU consumer de gama alta (RTX 4090, RTX 3090, RTX 4080 con cuantizacion Q4_K_M y contexto contenido); en GPUs de 12 GB puede requerir offload parcial a CPU.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), y por extension cualquier runtime compatible con GGUF como Ollama o LM Studio; no se documenta soporte especifico de vLLM o TGI para esta version.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria con datos verificables de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia medida de calidad en razonamiento, codigo, matematicas ni multilingue.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperacion.
- Riesgo de alucinacion no evaluado; al ser un modelo ajustado con datos sinteticos, la fiabilidad factual es incierta.
- Sesgos desconocidos: no se documenta el corpus de entrenamiento ni procesos de mitigacion de sesgos.
- Cobertura idiomatica limitada a en, kk y ru; el rendimiento en castellano no esta declarado ni evaluado.
- El autor no aporta informacion corporativa verificable; la unica referencia externa con el nombre "Odiora" es una joyeria sin relacion con el proyecto.
- La model card de esta version es una plantilla automatica de GGUF-my-repo; los detalles tecnicos deben consultarse en la model card del modelo base, que no se ha verificado en esta ficha.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentacion sobre procedencia de datos sinteticos aconseja una revision legal antes de desplegar en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Odiora/NOVA-Spark-5.1-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Odiora/NOVA-Spark-5.1
- Dataset declarado: https://huggingface.co/datasets/cortex-ai-nova/Insider-Nano
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
