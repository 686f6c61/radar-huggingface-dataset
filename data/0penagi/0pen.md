# 0penAGI/0pen

## Resumen

0pen es un ajuste fino mediante LoRA del modelo Google Gemma 4 E4B, desarrollado por 0penAGI y publicado bajo licencia MIT. El objetivo declarado del autor es crear un "coautor de ingenieria" con un perfil conversacional y una trayectoria cognitiva orientada a la resolucion de problemas tecnicos, en lugar de un modelo puramente orientado a dar respuestas cerradas. La release actual, denominada 0pen4, incorpora canal de pensamiento (thinking), llamadas a herramientas, vision y entrada de audio.

Tecnicamente, el checkpoint parte de la arquitectura `gemma4` (Gemma 3n) con 42 capas, dimension oculta de 2560 y un vocabulario de 262144 tokens. Aunque el nombre comercial "E4B" hace referencia a 4B de parametros efectivos, los pesos reales en el GGUF suman 7.463.013.674 parametros en la torre de texto (7.46B), a los que se anaden 478M del proyector multimodal CLIP, alcanzando unos 7.94B brutos. La diferencia se explica por los embeddings por capa (PLE), que aportan 2.82B de pesos contados una sola vez en la cifra efectiva.

La relevancia actual del modelo reside en su enfoque de despliegue local: se distribuye en GGUF Q4_K_M (5.67 bits por peso), con un proyector multimodal separado y un Modelfile para Ollama, lo que permite ejecutarlo en equipos de consumo con aproximadamente 8 GB de RAM libre. El contexto nominal del modelo es de 131072 tokens, aunque el Modelfile por defecto fija `num_ctx` en 32768.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4` (Gemma 3n), 42 capas, hidden 2560, vocab 262144 |
| Parametros totales | 7.463.013.674 (7.46B) en la torre de texto; 478.088.384 (478M) en el proyector CLIP; ~7.94B brutos |
| Parametros activos | 4B efectivos (conteo comercial E4B; los PLE de 2.82B se cuentan una sola vez) |
| Longitud de contexto | 131072 tokens (modelo); 32768 por defecto en el Modelfile (`num_ctx`) |
| Tipos de cuantizacion | Q4_K_M (5.67 BPW) en la release actual; el adaptador LoRA se distribuye en safetensors |
| Idiomas soportados | Ruso (ru) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (`0pen4.gguf`, `0penVisionHead4.gguf`) y safetensors para el adaptador LoRA |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Gemma 3n de Google, un transformer con 42 capas y un esquema de embeddings por capa (PLE) que representa 2.82B de los pesos brutos (42 capas x 256 canales x 262144 de vocabulario). La torre de texto se complementa con un proyector multimodal CLIP de 478M de parametros que aporta las capacidades de vision y audio. El ajuste fino se realizo mediante LoRA sobre la conversion MLX en 4 bits del modelo base (etiqueta de Ollama `gemma4:e4b-mlx`), y la release GGUF se construye a partir de ese checkpoint fusionado.

El adaptador empleado en la release actual es el `0000500`, de rango 8 y escala 20.0, aplicado sobre 56 modulos distribuidos en las capas 34 a 41 (7 tipos de modulo x 8 capas). Los datos de entrenamiento corresponden al conjunto `clean_v3`, con 5349 dialogos de entrenamiento y 282 de validacion en ruso e ingles, reordenados mediante una tecnica denominada AGR (reweighting) por el autor. La release anterior (`legacy/0pen1.gguf`) cubria solo 12 de 34 capas y no soportaba thinking, herramientas ni audio. El adaptador LoRA pesa 13.9 MB y no altera el recuento de parametros, ya que la fusion solo anade un delta sobre los mismos tensores.

## Capacidades

- Generacion de texto conversacional multi-turno en ruso e ingles.
- Canal de pensamiento (`<|channel>thought`) para razonar antes de responder, con niveles `false`/`true`.
- Llamadas a herramientas (tool calling) en el formato del dataset de entrenamiento, convertidas por el parser `gemma4` de Ollama en entradas estructuradas `tool_calls`.
- Vision: procesamiento de imagenes a traves del proyector `0penVisionHead4.gguf`.
- Audio: entrada de audio soportada por el mismo proyector multimodal.
- Capacidades de codigo y razonamiento tecnico, segun la orientacion declarada del ajuste ("engineering coauthor").
- Integracion con el ecosistema Ollama mediante `RENDERER gemma4` y `PARSER gemma4`.
- Compatibilidad con llama.cpp mediante `llama-mtmd-cli` y la flag `--jinja`.

## Casos de uso

- Asistencia conversacional local: el modelo puede mantener dialogos multi-turno con hasta 32768 tokens de contexto por defecto (131072 nominales), lo que permite sesiones largas sin salir del equipo del usuario y sin enviar datos a la nube.
- Coautor de ingenieria en tareas de diseno e iteracion: el ajuste esta orientado a aceptar restricciones y proponer alternativas tecnicas, por lo que encaja en sesiones de revision de arquitectura o de diseno de APIs donde se espera un interlocutor que discuta decisiones.
- Agente con herramientas en local: al emitir llamadas a funciones en formato estructurado, puede integrarse en flujos de automatizacion que consulten APIs, ejecuten comandos o consulten bases de datos, siempre que el orquestador pase `"think": false` en la API para no agotar el presupuesto de `num_predict`.
- Analisis de imagenes en el puesto de trabajo: con `0penVisionHead4.gguf` cargado junto al modelo, puede describir capturas, diagramas o fotografias, util para tareas de documentacion tecnica o soporte visual.
- Transcripcion y analisis de audio: la entrada de audio del proyector permite procesar notas de voz o reuniones y generar resumenes o respuestas en texto, en despliegues donde no se quiere recurrir a servicios externos.
- Prototipado rapido en Ollama: con un unico comando `ollama create` y un Modelfile de pocas lineas, un equipo puede tener un asistente funcional en minutos, con aproximadamente 6.3 GB en disco y 8 GB de RAM libre.
- Educacion y experimentacion con LoRA: el repositorio incluye el adaptador `0000500` y el pipeline de datos, lo que permite reproducir el ajuste o entrenar variantes sobre la misma base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 6.3 GB de modelo en disco; se recomiendan unos 8 GB de RAM libre para un uso comodo, con la cache KV escalando segun `num_ctx`. Con 32768 tokens de contexto la cache crece de forma apreciable, por lo que conviene reducir `num_ctx` en equipos con poca memoria.
- GPU recomendadas: no disponible en la informacion proporcionada. El modelo esta pensado para despliegue local en CPU o GPU de consumo, dado su tamano en Q4_K_M.
- Cabe en GPU de consumo: si, al tratarse de un GGUF de 5.30 GB (torre de texto) mas 991 MB de proyector; no se especifican modelos concretos de GPU en la documentacion.
- Opciones de despliegue: Ollama (con `Modelfile_0pen4` y los dos GGUF en la misma carpeta para que se detecte el `mmproj`) y llama.cpp mediante `llama-mtmd-cli` con `--jinja` y `--mmproj`.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| 0pen4 (0penAGI) | 7.46B brutos / 4B efectivos | 131072 (32768 por defecto) | MIT | GGUF, safetensors (LoRA) | Vision, audio, tools y thinking; ajuste LoRA sobre Gemma 4 E4B |
| Google Gemma 4 E4B | 4B efectivos (arquitectura Gemma 3n) | no disponible | no disponible en la informacion | no disponible | Modelo base del que deriva 0pen; sin el ajuste conversacional ni el adaptador |
| 0pen1 (legacy, mismo autor) | 7.46B brutos / 4B efectivos | 131072 (32768 por defecto) | MIT | GGUF | Version anterior: sin thinking, sin tools, sin audio; LoRA en 12 de 34 capas |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de 0pen4 con alternativas de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible; al derivar de Gemma 4 E4B hereda los sesgos del modelo base, no evaluados en la model card.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni de tasa de alucinacion; el modo thinking puede reducir errores en tareas de razonamiento, pero no hay datos que lo cuantifiquen.
- Cobertura idiomatica limitada: el entrenamiento se realizo solo en ruso e ingles (5349 dialogos de entrenamiento y 282 de validacion); el rendimiento en castellano no esta evaluado y probablemente sea inferior.
- Restricciones de licencia: la licencia es MIT, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base Gemma 4 E4B de Google, ya que la licencia del ajuste no sustituye a la del modelo subyacente.
- Configuracion delicada en API: si se usa thinking con el canal activado y no se pasa `"think": false`, el canal de pensamiento consume todo el presupuesto de `num_predict` y el campo `content` vuelve vacio, lo que puede interpretarse erroneamente como un fallo en las llamadas a herramientas.
- Dependencia de plantillas: en llama.cpp es obligatoria la flag `--jinja` porque la plantilla de chat canonica de Gemma 4 no esta entre las plantillas integradas.
- Proyector multimodal: Ollama solo detecta el `mmproj` si ambos GGUF se importan desde la misma carpeta, lo que exige seguir el procedimiento de creacion con enlaces duros.
- Madurez: el proyecto tiene 1412 descargas y 4 likes en Hugging Face, con una unica release reciente; no hay evidencia de validacion independiente ni de uso en produccion a escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0penAGI/0pen
- Repositorio en GitHub: https://github.com/0penAGI/0pen
- Modelo base: https://huggingface.co/google/gemma-4-E4B
