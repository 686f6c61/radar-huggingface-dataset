# Mihai-LeanZero/Qwen3.8-27B-Atlassian-Q8_0-GGUF

## Resumen

Qwen3.8-27B-Atlassian-Q8_0-GGUF es una cuantización en 8 bits (Q8_0) del modelo Atlassian de LeanZero, un ajuste fino sobre Qwen/Qwen3.8-27B orientado a trabajo con el ecosistema Atlassian: Forge, Jira, Confluence y Jira Service Management. Lo publica Mihai-LeanZero y se distribuye en formato GGUF para ejecutarse con llama.cpp, LM Studio y Ollama. El adaptador v0.5 se fusionó sobre los pesos bf16 originales del modelo base, abarcando 176 módulos.

El modelo resuelve un problema muy concreto: generar aplicaciones Forge que compilen contra los tipos reales, además de responder con precisión sobre identificadores, manifiestos y especificaciones OpenAPI de las API de Atlassian. Según las mediciones del autor, compila 28,7 de 35 aplicaciones y 30,3 de 35 manifiestos en modo sin razonamiento, frente a 22,7 y 30,7 de la versión anterior v0.4.

Es relevante ahora porque incluye el cabezal de predicción multi-token (MTP) para decodificación especulativa dentro del propio archivo GGUF, algo poco habitual en cuantizaciones publicadas, y porque el autor documenta una cadena de verificación de paridad entre la versión MLX, el bf16 fusionado y este Q8_0. El único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; el autor la describe como arquitectura híbrida con cabezal MTP de predicción multi-token. Modelo base: Qwen/Qwen3.8-27B |
| Parametros totales | 27.320.697.856 (unos 27,3 mil millones) |
| Parametros activos | No procede: la model card no indica que sea un modelo MoE |
| Longitud de contexto | No especificada en la model card; el ejemplo de despliegue del autor usa `-c 40960` |
| Tipos de cuantizacion | Q8_0 (esta publicación). El autor menciona un archivo Q6_K como referencia comparativa y confirma que no publica cuantizaciones de clase Q4 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el repo ocupa 29,0 GB. Incluye los tensores de borrador MTP |
| Libreria | gguf |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo base más allá de describirla como híbrida en el apartado de limitaciones (el autor advierte de que el rendimiento en batching de llama.cpp sobre esta arquitectura híbrida está muy por debajo del de los modelos densos, en referencia al issue 20006 de llama.cpp). Lo que sí se especifica es el proceso de construcción: el adaptador v0.5 se fusionó sobre los pesos bf16 originales de Qwen/Qwen3.8-27B (no sobre la base MLX de 8 bits), afectando a 176 módulos. El modelo fusionado reprodujo la salida del modelo MLX base más adaptador en modo greedy en 16 de 20 prompts, con una fracción media de prefijo común de 0,89.

El entrenamiento se realizó sobre aplicaciones Forge, documentación de Atlassian, especificaciones OpenAPI y respuestas de la comunidad. No se indica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación técnica destacable es la conservación del cabezal de predicción multi-token (MTP) dentro del GGUF, que permite decodificación especulativa en llama.cpp mediante `--spec-type draft-mtp`; el autor señala que todas las cifras públicas de MTP para esta familia de modelos son de CUDA, y que en Metal la ganancia es pequeña en respuestas de código largas y nula en respuestas cortas. Se entrenó con `reasoning_effort=medium` y `preserve_thinking=false`.

## Capacidades

- Generación de texto conversacional en inglés, con modo de razonamiento (thinking) activable y desactivable.
- Escritura de aplicaciones Forge que compilan contra los tipos reales de las API de Atlassian: 28,7 de 35 aplicaciones en la medición del autor con thinking desactivado.
- Generación de manifiestos de Forge: 30,3 de 35 manifiestos correctos en la misma medición.
- Conocimiento de identificadores de paquetes y API de Atlassian: 85 por ciento de acierto en el corte anterior a 2026, 15 por ciento en el corte posterior a abril.
- Conocimiento de Jira, Confluence, Jira Service Management y las especificaciones OpenAPI asociadas, según la descripción del autor.
- Decodificación especulativa mediante cabezal MTP integrado (parámetro `--spec-type draft-mtp`).
- Conmutador de razonamiento: `chat_template_kwargs.enable_thinking=false` es respetado por la plantilla de chat de esta compilación (no emite razonamiento y nombra el módulo correcto).
- No se documentan en la información disponible capacidades de tool calling, function calling, uso de agentes, visión, audio ni soporte multilingüe más allá del inglés.

## Casos de uso

- Desarrollo de aplicaciones Forge: el modelo genera código que compila contra los tipos reales de la plataforma, lo que reduce el ciclo de prueba y error al crear apps personalizadas para Jira o Confluence.
- Generación de manifiestos de apps Atlassian: produce el fichero de manifiesto a partir de una descripción funcional, con 30,3 de 35 manifiestos correctos medidos por el autor.
- Consulta de documentación de Atlassian: responde preguntas sobre API, módulos y configuración apoyándose en el corpus de documentación y respuestas de comunidad con el que fue entrenado.
- Migraciones de instancias Atlassian: el autor del modelo ofrece servicios de migración, y el modelo puede emplearse como asistente para interpretar y transformar configuraciones y esquemas.
- Asistente de atención a desarrolladores internos: con contexto de 40 960 tokens en el ejemplo de despliegue, puede mantener conversaciones multi-turno con documentación y código largos. Nota: el autor advierte de un defecto de caché de estado recurrente (issue 20225) que puede reprocesar el prompt completo en cada turno, aumentando el tiempo hasta el primer token.
- Extracción de identificadores y referencias de paquetes en un rango histórico concreto: útil para auditar dependencias de proyectos anteriores a 2026, donde el modelo acierta el 85 por ciento.
- Despliegue local en estación de trabajo Apple Silicon: el autor publica mediciones de decodificación de 24,2 tokens por segundo con cabezal de borrador en un M3 Ultra, lo que lo hace viable como asistente local para un único usuario.
- Prototipado offline con Ollama o LM Studio: al ser un GGUF, se integra en flujos locales sin depender de API externa.

## Benchmarks y rendimiento

| Prueba | Resultado | Referencia |
|---|---|---|
| Perplejidad (KLD media) frente al GGUF bf16, 40 fragmentos de 2048 tokens | 0,000842 (maximo 10,87871; mismo token top-1 en el 99,374 por ciento) | Archivo Q6_K de la misma familia: 0,00306 |
| Apps Forge que compilan, 35 briefs, 3 muestras, thinking off | 28,7 de 35 | Release MLX del mismo adaptador: 30,0; v0.4: 22,7 |
| Manifiestos correctos, 35 briefs, 3 muestras, thinking off | 30,3 de 35 | Release MLX del mismo adaptador: 31,3; v0.4: 30,7 |
| Recuerdo de identificadores, thinking on, corte anterior a 2026 | 85 por ciento | Release MLX: 85 por ciento |
| Recuerdo de identificadores, thinking on, corte posterior a abril | 15 por ciento | Release MLX: 15 por ciento |
| Bateria de bucles, 40 prompts por rama | think_official: 0 bucles de 40, no terminacion 32 por ciento; think_t06: 0 de 40, no terminacion 32 por ciento; greedy: 1 de 40, no terminacion 32 por ciento; instruct_nopenalty: 0 de 40, no terminacion 12 por ciento | Regla del release MLX: bucles iguales o inferiores a la base sin ajustar en todas las ramas |
| Decodificacion especulativa en Apple Silicon (M3 Ultra, Metal), ejecuciones largas | 24,2 tokens/s con cabezal de borrador (105 respuestas de app, aceptacion 0,629) frente a 20,4 sin el (27 respuestas de identificadores), flujo unico | Prueba de reloj de pared con 5 prompts greedy, 1280 tokens: MTP none 20,9 tokens/s; MTP draft-mtp 19,6 tokens/s |
| Servicio por lotes | Aproximadamente 9 tokens/s por flujo con 4 concurrentes | Limitacion declarada por el autor |
| Paridad bf16 fusionado frente a MLX base mas adaptador | 16 de 20 prompts reproducidos en greedy, fraccion media de prefijo comun 0,89 | - |
| Paridad GGUF bf16 frente a mlx-lm | 17 de 20 prompts identicos, fraccion media de prefijo comun 0,94 | - |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores son mediciones del propio autor y no son comparables directamente con las del release MLX salvo a traves de la cadena de tres eslabones descrita en la model card.

## Requisitos de hardware

- El archivo Q8_0 ocupa 29,0 GB, por lo que la inferencia requiere del orden de 30 a 34 GB de memoria entre pesos, caché KV y contexto. Es una estimacion derivada del tamano del fichero, no un dato publicado.
- No cabe en GPU de consumo con 24 GB de VRAM (RTX 4090, RTX 3090) a cuantizacion Q8_0. Requiere al menos 32 GB, lo que implica una RTX 5090 de 32 GB, una RTX 6000 Ada, un acelerador de 48 GB o superior (A6000, L40S, A100 80 GB, H100), o bien reparto entre dos GPU.
- En Apple Silicon cabe en configuraciones de memoria unificada de 36 GB o superior; el autor publica mediciones sobre un M3 Ultra.
- Opciones de despliegue: llama.cpp (`llama-server`, version b10330 o posterior, imprescindible para conservar los tensores MTP), motor GGUF de LM Studio, y Ollama mediante un Modelfile con `FROM ./Qwen3.8-27B-Atlassian-Q8_0.gguf`.
- Ejemplo de arranque del autor: `llama-server -m Qwen3.8-27B-Atlassian-Q8_0.gguf -ngl 99 -c 40960 --jinja --spec-type draft-mtp`.
- Para razonamiento: anadir `--reasoning-format deepseek`; para desactivarlo, `--reasoning-budget 0`.
- Muestreo recomendado en modo thinking: temperatura 1,0, top_p 0,95, top_k 20. En modo instruct: temperatura 0,7, top_p 0,8, top_k 20, penalizacion de presencia 1,5.
- Throughput medido: 24,2 tokens/s en decodificacion de flujo unico con cabezal de borrador en un M3 Ultra; unos 9 tokens/s por flujo con 4 peticiones concurrentes.
- Latencia: no se publica el tiempo hasta el primer token. El autor advierte de que, por el defecto de caché de estado recurrente (issue 20225), el tiempo hasta el primer token en conversaciones multi-turno crece con el contexto.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de benchmarks de modelos de terceros comparables. La comparacion posible se limita a las variantes de la propia familia:

| Variante | Formato | Cuantizacion | Apps Forge (de 35) | Manifiestos (de 35) | KLD frente a bf16 | Notas |
|---|---|---|---|---|---|---|
| Este modelo (v0.5) | GGUF | Q8_0 | 28,7 | 30,3 | 0,000842 | Medido via llama-server; incluye cabezal MTP |
| Misma familia (v0.5) | GGUF | Q6_K | No disponible | No disponible | 0,00306 | Solo se publica la cifra de KLD |
| Release MLX del mismo adaptador | MLX | 8 bits | 30,0 | 31,3 | No aplica | Medicion en mlx-lm, no comparable directamente |
| LeanZero Atlassian v0.4 | Segun release | No disponible | 22,7 | 30,7 | No disponible | Version anterior del adaptador |
| Qwen/Qwen3.8-27B | Segun release | No disponible | No disponible | No disponible | No aplica | Modelo base sin el ajuste de Atlassian |

Todas las variantes comparten licencia apache-2.0 y estan publicadas por el mismo autor. Los parametros totales (27,3 mil millones) son identicos entre variantes del mismo adaptador.

## Limitaciones y advertencias

- Las cifras publicadas son mediciones del propio autor, realizadas con llama.cpp sobre el archivo Q8_0, y solo son comparables con las del release MLX a traves de la cadena de tres eslabones descrita en la model card, nunca de forma directa.
- El recuento de aplicaciones en una sola pasada varia en torno a 3 de 35 entre ejecuciones; el autor reporta la media de 3 muestras.
- El corte de identificadores posterior a abril (13 preguntas sobre versiones mayores de paquetes actuales) es debil en todos los adaptadores de esta familia: no conviene preguntarle cual es la version mayor vigente de un paquete Forge.
- El rendimiento por lotes de llama.cpp sobre esta arquitectura hibrida esta muy por debajo del de los modelos densos (issue 20006 de llama.cpp): el archivo esta pensado como artefacto para un unico usuario. El autor recomienda el release MLX para enjambres multiagente.
- Existe un defecto de cache de estado recurrente (issue 20225 de llama.cpp) que puede reprocesar el prompt completo en cada turno, de modo que el tiempo hasta el primer token en conversaciones multi-turno crece con el contexto.
- No se publican cuantizaciones de clase Q4: segun la calibracion del autor del 5 de septiembre de 2026, con este adaptador pierden la ganancia medida en generacion de aplicaciones.
- Idioma: unicamente ingles declarado. No hay soporte multilingue documentado.
- No se documentan capacidades de tool calling, function calling ni uso de agentes.
- En Metal (Apple Silicon) el cabezal de borrador MTP aporta una ganancia pequena en respuestas de codigo largas y ninguna en respuestas cortas; las cifras publicas de MTP para esta familia son de CUDA.
- Riesgo de alucinacion: no se publica ninguna evaluacion de veracidad factual. Dado el bajo recuerdo de identificadores en el corte posterior a abril, existe riesgo elevado de inventar nombres de paquetes o versiones recientes.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible.
- Licencia apache-2.0, que permite uso comercial, pero el modelo base es Qwen/Qwen3.8-27B y el autor no detalla en la model card proporcionada condiciones adicionales del modelo base. Conviene verificar los terminos del repositorio original antes de un despliegue comercial.
- Requiere llama.cpp b10330 o posterior; versiones anteriores pueden no manejar correctamente los tensores MTP ni el conmutador de thinking.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Mihai-LeanZero/Qwen3.8-27B-Atlassian-Q8_0-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Pagina del portfolio del autor sobre los modelos Atlassian (write-up completo y evidencia por ronda): https://leanzero.net/portfolio/atlassian-models
- LeanZero: https://leanzero.net
- CogniRunner: https://leanzero.net/portfolio/cognirunner
- Sentinel Vault: https://leanzero.net/portfolio/sentinel-vault
- LeanZero Management: https://leanzero.net/portfolio/leanzero-management
- Servicios de migraciones Atlassian: https://leanzero.net/services/atlassian-migrations
- Issue 20006 de llama.cpp (rendimiento por lotes en arquitecturas hibridas): citado en la model card sin URL
- Issue 20225 de llama.cpp (defecto de cache de estado recurrente): citado en la model card sin URL
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los resultados obtenidos correspondian a productos no relacionados.
