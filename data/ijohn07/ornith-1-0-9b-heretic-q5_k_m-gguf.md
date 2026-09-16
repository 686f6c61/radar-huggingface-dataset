# ijohn07/Ornith-1.0-9B-heretic-Q5_K_M-GGUF

## Resumen

Ornith-1.0-9B-heretic-Q5_K_M-GGUF es una cuantizacion en formato GGUF del modelo trohrbaugh/Ornith-1.0-9B-heretic, publicada por el usuario ijohn07. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos a Q5_K_M realizada con llama.cpp a traves del espacio GGUF-my-repo de ggml.ai, pensada para ejecucion local con la familia de herramientas llama.cpp. El modelo subyacente es una variante "heretic" (es decir, con la direccion de rechazo ablacionada) del modelo Ornith-1.0-9B de deepreinforce-ai.

El modelo cuenta con 8.953.803.264 parametros (aproximadamente 8,95 mil millones) y el repositorio ocupa 6,5 GB, coherente con una cuantizacion de 5 bits por peso mas metadatos. La licencia declarada es MIT, lo que permite uso comercial sin las restricciones habituales de las licencias de pesos de otros modelos abiertos, aunque conviene verificar la licencia del modelo base original.

Su relevancia actual es doble: por un lado, ofrece un modelo de ~9B ejecutable en hardware de consumo con un compromiso calidad/tamano razonable; por otro, al ser una variante ablacionada, esta dirigido a casos de uso donde los rechazos del modelo alineado resultan un obstaculo (investigacion sobre alineacion, generacion creativa sin filtros excesivos, red teaming). La informacion publicada no incluye detalles sobre arquitectura interna, contexto nativo, composicion del dataset ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se detalla en la informacion proporcionada) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 2048`, pero es un valor de ejemplo, no la ventana nativa) |
| Tipos de cuantizacion | Q5_K_M (esta publicacion); no se listan otras variantes en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (con enlace a la licencia del modelo base deepreinforce-ai/Ornith-1.0-9B) |
| Formato de pesos | GGUF (safetensors del modelo base, no incluidos en este repo) |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura del modelo base. Esta publicacion es exclusivamente una conversion de formato: los pesos de trohrbaugh/Ornith-1.0-9B-heretic se transformaron a GGUF con llama.cpp y se cuantizaron a Q5_K_M mediante el espacio GGUF-my-repo de ggml.ai. Por tanto, no hay datos sobre numero de tokens de entrenamiento, composicion del dataset, ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineacion.

El unico elemento tecnico identificable a partir de los tags es la naturaleza "heretic"/"abliterated"/"decensored" del modelo base: se trata de variantes en las que se ha intervenido sobre las direcciones de activacion asociadas al rechazo para reducir la probabilidad de que el modelo decline responder. Esta clase de intervenciones suele implicar un compromiso entre obediencia y degradacion de capacidades generales, pero no se dispone de evaluaciones publicadas en la informacion disponible que cuantifiquen ese efecto en este caso concreto.

## Capacidades

- Generacion de texto en pipeline `text-generation`, uso general de conversacion y continuacion de texto.
- Reduccion de rechazos: por su naturaleza ablacionada, tiende a responder a peticiones que un modelo alineado convencional rechazaria.
- Ejecucion local con llama.cpp: compatible con `llama-cli` y `llama-server` segun los ejemplos de la model card.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible; los tags no indican ninguna modalidad adicional.

## Casos de uso

- Ejecucion local en portatil o estacion de trabajo: con 6,5 GB de pesos en Q5_K_M, el modelo puede cargarse en GPUs de consumo de 8-12 GB o ejecutarse en CPU con llama.cpp, lo que permite prototipar sin depender de APIs externas.
- Investigacion sobre alineacion y ablacion de rechazos: util como sujeto de comparacion frente al modelo alineado equivalente para medir como cambia la tasa de rechazo, la calidad de respuesta y la coherencia tras la intervencion.
- Red teaming y evaluacion de seguridad: permite sondear comportamientos limite y construir conjuntos de pruebas de contenido sensible en un entorno controlado, dado que el modelo no elude las peticiones problematicas por defecto.
- Generacion creativa sin filtros excesivos: escritura de ficcion con tematicas adultas, violencia o dilemas morales donde los rechazos de modelos alineados interrumpen el flujo narrativo.
- Asistente conversacional autoalojado en servidor propio: mediante `llama-server` se expone una API compatible con el formato OpenAI para integrarla en aplicaciones internas sin enviar datos a terceros.
- Procesamiento por lotes de textos en local: generacion de resumenes, reescritura o extraccion sobre corpus privados en equipos sin conexion, aprovechando la licencia MIT para integrarlo en productos comerciales.
- Docencia y demostraciones de cuantizacion: sirve para ilustrar el efecto de Q5_K_M frente a precisiones mayores en un modelo de ~9B, con una diferencia de tamano de pesos medible (6,5 GB en este repo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta cuantizacion no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se aportan evaluaciones del modelo base trohrbaugh/Ornith-1.0-9B-heretic ni del original deepreinforce-ai/Ornith-1.0-9B en la informacion suministrada.

## Requisitos de hardware

- VRAM estimada para los pesos en Q5_K_M: en torno a 6,5-7 GB, segun el tamano del repositorio.
- VRAM adicional para cache KV y contexto: dependiente de la longitud de contexto configurada; con `-c 2048` el sobrecoste es pequeno (del orden de cientos de MB), con contextos de 8K-32K crece de forma apreciable.
- Presupuesto practico: 8 GB de VRAM como minimo ajustado; 12 GB o mas para trabajar con comodidad y contextos mayores.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; en el extremo profesional, A100 o H100 si se busca maximo throughput con lotes grandes.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM, siempre que se ajuste el contexto; tambien es viable en CPU con llama.cpp, con latencias mayores.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (importando el GGUF), llama-cpp-python, LM Studio, koboldcpp. vLLM y TGI no son la via mas directa para GGUF, aunque admiten otros formatos del mismo modelo base.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento, contexto o idiomas del modelo evaluado, por lo que la comparacion se limita a parametros y licencia. Los datos de los modelos alternativos corresponden a conocimiento general de la familia y pueden variar segun la version concreta.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ornith-1.0-9B-heretic (Q5_K_M, este repo) | ~8,95B | no disponible | MIT | GGUF en HuggingFace |
| Llama 3.1 8B Instruct | ~8B | 128K | Llama 3.1 Community License | safetensors y GGUF |
| Qwen2.5 7B Instruct | ~7,6B | 128K | Apache 2.0 | safetensors y GGUF |
| Gemma 2 9B Instruct | ~9B | 8K | Gemma Terms of Use | safetensors y GGUF |

Diferencias clave: la licencia MIT de esta publicacion es mas permisiva que las licencias de Llama 3.1 y Gemma 2, y equiparable en permisividad a la Apache 2.0 de Qwen2.5. En cambio, no hay datos publicos de contexto ni de calidad que permitan situar a Ornith-1.0-9B-heretic frente a estas alternativas, y su caracter ablacionado implica un perfil de comportamiento distinto, no necesariamente mejor en tareas generales.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; la ablacion de rechazo puede amplificar respuestas sesgadas o inapropiadas presentes en los datos de entrenamiento.
- Riesgo de alucinacion: no evaluado; no hay benchmarks que permitan estimar la fiabilidad factual del modelo base ni de la cuantizacion.
- Efecto de la cuantizacion: Q5_K_M introduce perdida de precision respecto a los pesos originales en safetensors; el impacto concreto en calidad no esta medido en la informacion disponible.
- Limitaciones de contexto e idioma: sin datos publicados; el `-c 2048` de los ejemplos es un valor de configuracion de prueba, no la ventana nativa, y no hay lista de idiomas soportados.
- Ausencia de contenido alineado: al ser un modelo "uncensored/abliterated", no incluye las salvaguardas habituales; no es adecuado para aplicaciones orientadas a usuarios finales sin una capa adicional de filtrado y moderacion.
- Responsabilidad legal: la licencia MIT cubre los derechos de uso del artefacto publicado, pero el contenido generado sigue sujeto a la normativa aplicable (difamacion, propiedad intelectual, proteccion de menores, etc.).
- Verificacion de licencia en cadena: la propia model card apunta a la licencia del modelo original deepreinforce-ai/Ornith-1.0-9B; conviene revisarla antes de un despliegue comercial.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin historial de validacion por parte de la comunidad.
- Trazabilidad limitada: es una conversion de terceros, no una publicacion oficial de los autores del modelo base.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ijohn07/Ornith-1.0-9B-heretic-Q5_K_M-GGUF
- Modelo base de la cuantizacion: https://huggingface.co/trohrbaugh/Ornith-1.0-9B-heretic
- Modelo original referenciado en la licencia: https://huggingface.co/deepreinforce-ai/Ornith-1.0-9B
- Licencia del modelo original: https://huggingface.co/deepreinforce-ai/Ornith-1.0-9B/blob/main/LICENSE
- Espacio de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp

Nota: los resultados de busqueda web disponibles no contenian informacion relevante sobre este modelo; no se han incluido por no ser pertinentes.
