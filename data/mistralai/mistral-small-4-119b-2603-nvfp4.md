# mistralai/Mistral-Small-4-119B-2603-NVFP4

# Mistral Small 4 119B A6B NVFP4 (mistralai)

## Resumen
Mistral Small 4 119B A6B NVFP4 es un checkpoint cuantizado del modelo Mistral Small 4 de Mistral AI, una red de mezcla de expertos (MoE) con 119.000 millones de parametros totales y 6.500 millones activados por token, repartidos en 128 expertos de los que 4 se activan por token. El modelo unifica en una sola arquitectura las capacidades de tres familias previas de la casa: Instruct, Reasoning (antes Magistral) y Devstral, con entrada multimodal de texto e imagen y salida de texto.

Este checkpoint concreto aplica cuantizacion NVFP4 (4 bits) sobre pesos y activaciones despues del entrenamiento, y fue generado con la libreria llm-compressor en colaboracion con los equipos de vLLM y Red Hat, con optimizaciones de kernels por parte de NVIDIA para SGLang y vLLM. El resultado es un repositorio de 70,8 GB, pensado para servir el modelo con vLLM en produccion con un coste de memoria notablemente inferior al del checkpoint en precision completa.

Su relevancia actual se apoya en tres datos: una ventana de contexto de 256.000 tokens, un cambio de modo entre respuesta rapida y razonamiento configurable por peticion, y unas cifras declaradas por el autor de hasta un 40 por ciento menos de tiempo de finalizacion en configuraciones optimizadas para latencia y 3 veces mas peticiones por segundo frente a Mistral Small 3 en configuraciones optimizadas para throughput. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); 128 expertos, 4 activos por token |
| Parametros totales | 119B |
| Parametros activos | 6,5B por token |
| Longitud de contexto | 262.144 tokens (256k) |
| Tipos de cuantizacion | NVFP4 (cuantizacion post-entrenamiento de pesos y activaciones, 4 bits); no se documentan otros formatos en esta ficha |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn (24 idiomas en los tags del repositorio; la model card menciona ademas el neerlandes) |
| Licencia | Apache 2.0 |
| Formato de pesos | compressed-tensors (segun los tags del repositorio); la model card no detalla el contenedor de ficheros |
| Modelo base | mistralai/Mistral-Small-4-119B-2603 |
| Entrada / salida | Texto e imagen como entrada; texto como salida |
| Fecha de publicacion | 3 de marzo de 2026 |
| Tamano del repositorio | 70,8 GB |

## Arquitectura y entrenamiento
La arquitectura es un transformer disperso de tipo MoE con 128 expertos y 4 activos por token, lo que fija el coste de computo por token en el equivalente a 6,5B de parametros pese a almacenar 119B. El modelo se describe como hibrido porque integra en un unico conjunto de pesos tres comportamientos antes separados: modo instructivo, modo de razonamiento y capacidades de la familia Devstral orientadas a codigo y tareas de ingenieria de software. Admite entrada de imagen ademas de texto, con salida exclusivamente textual.

El checkpoint publicado aqui no es un modelo entrenado desde cero, sino una version cuantizada a NVFP4 del checkpoint mistralai/Mistral-Small-4-119B-2603. La cuantizacion se realizo con llm-compressor como parte de una colaboracion con los equipos de vLLM y Red Hat, e incluye optimizaciones de kernels aportadas por NVIDIA para SGLang y vLLM. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El modo de razonamiento se controla por peticion mediante el parametro reasoning_effort, con valores none (sin razonamiento, respuesta inmediata) y high (razonamiento con computo adicional en tiempo de inferencia), y la temperatura recomendada es 0,7 para high y entre 0,0 y 0,7 para none.

## Capacidades
- Generacion de texto y modo instructivo con alta adherencia a system prompts.
- Modo de razonamiento activable por peticion mediante reasoning_effort, que anade computo en tiempo de inferencia para tareas complejas.
- Capacidades de codigo y automatizacion de ingenieria de software heredadas de la familia Devstral, con exploracion de bases de codigo.
- Razonamiento matematico y de investigacion, segun los casos de uso declarados por el autor.
- Vision: analisis de imagenes y extraccion de informacion a partir de contenido visual, ademas de texto.
- Function calling nativo y salida en JSON, con parser de tool calls especifico (--tool-call-parser mistral).
- Capacidades agenticas y de razonamiento en multiples pasos; la model card las describe como las mejores de su categoria.
- Capacidades multilingues en los 24 idiomas listados en los tags.
- Cambio de modo entre respuesta instantanea y razonamiento sin necesidad de cargar un modelo distinto.

## Casos de uso
- Asistente de chat general en produccion: con 256k tokens de contexto puede mantener conversaciones muy largas y arrastrar documentacion extensa sin truncar, y el modo reasoning_effort permite degradar a respuesta rapida cuando la latencia importa.
- Agente de codigo y automatizacion de SWE: soporta function calling nativo y JSON, por lo que puede integrarse en pipelines de CI/CD para leer un repositorio, proponer parches y ejecutar herramientas de forma encadenada.
- Exploracion de bases de codigo grandes: la ventana de 256k tokens permite cargar varios ficheros y dependencias a la vez para responder preguntas sobre arquitectura o impacto de cambios.
- Asistente de investigacion y razonamiento matematico: activando reasoning_effort="high" con temperatura 0,7 el modelo dedica computo adicional a problemas de varios pasos, adecuado para analisis tecnico y verificacion de derivaciones.
- Extraccion y analisis de documentos: al aceptar entrada de imagen, puede procesar documentos escaneados, tablas y graficos, y devolver datos estructurados en JSON para su volcado en bases de datos.
- Atencion al cliente automatizada multilingue: cubre 24 idiomas, admite system prompts estrictos para fijar tono y politicas, y puede invocar herramientas de consulta de pedidos o CRM.
- Despliegue en infraestructura propia con coste controlado: al ser un checkpoint NVFP4 con licencia Apache 2.0, permite servir el modelo en servidores propios sin dependencia de APIs externas ni restricciones comerciales.
- Ajuste fino y especializacion: el autor lo presenta como base apta para fine-tuning en tareas verticales, con la ventaja de que la version cuantizada reduce los requisitos de memoria del servicio.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra suite en la model card facilitada. Los unicos datos cuantitativos de rendimiento son comparativos y relativos, no absolutos:

| Metrica | Valor declarado | Configuracion |
|---|---|---|
| Reduccion de tiempo de finalizacion extremo a extremo | 40 % | Configuracion optimizada para latencia |
| Peticiones por segundo | 3x frente a Mistral Small 3 | Configuracion optimizada para throughput |

## Requisitos de hardware
- VRAM estimada para los pesos: el repositorio ocupa 70,8 GB, coherente con 119B de parametros a 4 bits mas escalas y capas sin cuantizar. Es una estimacion derivada del tamano del repositorio, no un dato publicado.
- VRAM total necesaria: a los pesos hay que sumar la cache KV. La configuracion oficial de servicio usa tensor-parallel-size 2 con gpu_memory_utilization 0,8, lo que implica un minimo de dos aceleradores de gama datacenter.
- GPU recomendadas: la propia receta de vLLM apunta a un despliegue con 2 GPU en paralelo, del orden de 2x H100 80 GB o 2x B200. NVFP4 es un formato de 4 bits de NVIDIA cuyo soporte de kernels nativos se asocia a la arquitectura Blackwell; la model card no especifica el hardware minimo ni el rango de compatibilidad.
- GPU de consumo: no cabe en una sola GPU de consumo. Los 70,8 GB de pesos superan incluso los 48 GB de una RTX 6000 Ada; harian falta al menos dos tarjetas de gran capacidad de memoria y, en la practica, aceleradores de clase datacenter.
- Opciones de despliegue: vLLM es la opcion recomendada por el autor (con mistral_common >= 1.11.0), disponible tambien como imagen Docker vllm-openai. SGLang esta soportado de forma explicita. No se menciona soporte para llama.cpp, Ollama ni TGI en la informacion disponible.
- Parametros de servicio sugeridos: max-model-len 262144, tensor-parallel-size 2, attention-backend TRITON_MLA, tool-call-parser mistral, enable-auto-tool-choice, reasoning-parser mistral, max_num_batched_tokens 16384, max_num_seqs 128, gpu_memory_utilization 0,8.
- Latencia y throughput absolutos: no disponible. Solo se ofrecen las cifras relativas frente a Mistral Small 3 indicadas en la seccion anterior.

## Comparativa con modelos similares

| Modelo | Parametros | Activos por token | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Mistral Small 4 119B A6B NVFP4 (este checkpoint) | 119B | 6,5B | 256k | NVFP4 | Apache 2.0 | HuggingFace |
| Mistral Small 4 119B A6B (checkpoint base, sin cuantizar) | 119B | 6,5B | 256k | Precision completa | Apache 2.0 | HuggingFace |
| Mistral Small 3 | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion disponible solo permite comparar este checkpoint con su propio modelo base: misma arquitectura, mismo contexto y misma licencia, con la diferencia de que la version NVFP4 reduce el peso en disco y memoria a costa de la perdida de precision inherente a la cuantizacion de 4 bits. Frente a Mistral Small 3 la model card unicamente declara la mejora relativa de velocidad (3x peticiones por segundo y 40 por ciento menos de tiempo de finalizacion), sin especificaciones de parametros ni de contexto del modelo anterior, por lo que no se puede construir una comparativa tecnica completa.

## Limitaciones y advertencias
- La model card no documenta sesgos conocidos, evaluaciones de seguridad ni analisis de toxicidad. No hay informacion disponible al respecto.
- Riesgo de alucinacion inherente a los modelos de lenguaje generativos. No se han publicado tasas de alucinacion ni resultados de evaluaciones de veracidad.
- Al tratarse de un checkpoint cuantizado a 4 bits, es previsible una degradacion de calidad respecto al modelo base en precision completa. La informacion disponible no cuantifica esa perdida.
- NVFP4 depende de kernels especificos y de la pila de software (vLLM, SGLang, llm-compressor). El despliegue fuera de esas herramientas no esta documentado y puede no funcionar.
- La ventana de 256k tokens exige una cache KV proporcional al contexto usado; con la configuracion oficial de tensor-parallel-size 2 y gpu_memory_utilization 0,8, no todo el contexto estara disponible simultaneamente en funcion del hardware.
- La multimodalidad es asimetrica: acepta imagen y texto como entrada, pero solo genera texto. No se documenta soporte de audio ni de video.
- Aunque la model card menciona el neerlandes entre los idiomas soportados, ese idioma no aparece en la lista de tags del repositorio, lo que genera ambiguedad sobre el conjunto exacto de idiomas evaluados.
- Los idiomas listados estan soportados segun el autor, pero no hay datos publicos de rendimiento por idioma; el comportamiento en lenguas de bajos recursos puede ser inferior.
- La licencia Apache 2.0 no impone restricciones de uso comercial, pero conviene verificar los terminos aplicables a datos de terceros si se usa para fine-tuning.
- El checkpoint se publico el 3 de marzo de 2026 y se actualizo el 7 de septiembre de 2026; conviene fijar la revision concreta en produccion para evitar cambios inesperados.
- No hay datos publicos de benchmarks, latencia absoluta, throughput absoluto ni consumo energetico, lo que dificulta la comparacion objetiva con alternativas.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/mistralai/Mistral-Small-4-119B-2603-NVFP4
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-4-119B-2603
- llm-compressor (herramienta de cuantizacion): https://github.com/vllm-project/llm-compressor
- vLLM (biblioteca de inferencia recomendada): https://github.com/vllm-project/vllm
- Dockerfile de vLLM: https://github.com/vllm-project/vllm/blob/main/docker/Dockerfile
- Imagen vllm-openai en Docker Hub: https://hub.docker.com/layers/vllm/vllm-openai/latest
- SGLang, guia de inicio rapido: https://docs.sglang.io/docs/get-started/quickstart#launch-a-server
- mistral-common >= 1.11.0: https://github.com/mistralai/mistral-common/releases/tag/v1.11.0
- Sitio de Mistral AI: https://mistral.ai/fr/
- Producto Vibe (antes Le Chat): https://mistral.ai/fr/products/vibe/
- Consola de Mistral AI: https://console.mistral.ai/home
- Articulo de Mistral AI en Wikipedia: https://fr.wikipedia.org/wiki/Mistral_AI
