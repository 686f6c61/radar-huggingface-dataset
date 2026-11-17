# bartowski/KORMo-VL_KORMo-Web-4B-GGUF

## Resumen

KORMo-Web-4B es un modelo multimodal de tipo image-text-to-text especializado en tareas de agente web y computer-use, desarrollado por KORMo-VL. Está diseñado para interpretar capturas de pantalla de navegador junto con instrucciones en lenguaje natural y producir acciones estructuradas (clics, escritura, navegación) o llamadas a herramientas, lo que lo sitúa en la categoría de modelos para automatización de navegadores y agentes GUI.

El checkpoint original cuenta con aproximadamente 4.841 millones de parámetros (etiquetado como 5B en la model card) y soporta entrada de texto e imagen, esta última mediante un fichero `mmproj` separado en el ecosistema GGUF. Está orientado principalmente al coreano y al inglés, y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial.

La ficha que nos ocupa corresponde a la cuantización GGUF realizada por bartowski mediante llama.cpp (release b12412), con calibración imatrix. Esta versión permite ejecutar el modelo en hardware de consumo y en entornos de inferencia locales, algo relevante para pipelines de agentes web que requieren baja latencia y despliegue en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; transformer, detalles no publicados en la informacion disponible) |
| Parametros totales | 4.841.450.496 (aprox. 4,84B; etiquetado como 5B en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_0, Q4_K_S, IQ4_XS |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones llama.cpp); requiere fichero mmproj para entrada de imagen |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base KORMo-Web-4B en la documentacion proporcionada. Se trata de un modelo multimodal que acepta texto e imagen (capturas de pantalla) y genera texto, con soporte explicito para decodificacion de llamadas a herramientas mediante un formato XML estructurado. El prompt format emplea tokens de chat estilo ChatML (`<|im_start|>`/`<|im_end|>`) e incluye un bloque `<think>` para razonamiento previo a la respuesta.

La model card de la cuantizacion no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifica la innovacion arquitectonica concreta mas alla de la naturaleza multimodal y la orientacion a agentes web. La cuantizacion se realizo con llama.cpp b12412, con calibracion imatrix (si), sin decodificacion especulativa (no). El fichero `mmproj` es necesario para habilitar la entrada de imagen.

## Capacidades

- Generacion de texto conversacional multi-turno con formato ChatML.
- Comprension de imagenes (capturas de pantalla de navegador) mediante fichero `mmproj`.
- Agente web y computer-use: interpretacion de la UI y generacion de acciones sobre el navegador.
- Tool calling / function calling con formato XML estructurado (`<tool_call>`, `<function=...>`, `<parameter=...>`).
- Razonamiento previo opcional mediante bloque `<think>`.
- Soporte multilingue limitado a coreano e ingles.
- Capacidad de agente multi-paso (gui-agent, web-agent) segun los tags del modelo.
- No se indica soporte de audio ni de vision mas alla de imagen.

## Casos de uso

- Automatizacion de navegador: el modelo recibe capturas de pantalla y genera acciones (clic, escritura, scroll) para tareas repetitivas de navegacion, aprovechando su especializacion en web-agent.
- Testing end-to-end de interfaces web: integrado en pipelines de CI/CD para validar flujos de usuario simulando interacciones reales sobre la UI.
- Extraccion de datos de portales: combinando captura de pantalla e instrucciones, el modelo puede localizar y operar sobre formularios y listados en sitios coreanos o en ingles.
- Asistente de accesibilidad: interpretacion de la pantalla y generacion de instrucciones o acciones para usuarios con dificultades motoras o visuales.
- RPA ligero en local: despliegue en estaciones de trabajo con GPU de consumo gracias a las cuantizaciones Q4 (a partir de 2,85 GB) para automatizar tareas ofimaticas y web.
- Agente con tool calling: uso del formato `<tool_call>` para invocar APIs externas (por ejemplo, consulta de precios de acciones) dentro de flujos de agente mas amplios.
- Prototipado de agentes GUI en investigacion: modelo pequeno (4,84B) que cabe en una sola GPU consumer, adecuado para experimentacion rapida con tecnicas de computer-use.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas overhead de contexto y del proyector multimodal (`mmproj`). Referencias orientativas:
  - Q4_K_M: 3,17 GB de pesos.
  - IQ4_XS: 2,85 GB de pesos.
  - Q5_K_M: 3,72 GB.
  - Q6_K: 4,21 GB.
  - Q8_0: 5,16 GB.
  - bf16: 9,70 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones Q4/Q5; 8-12 GB para Q6/Q8; 16 GB o mas para bf16 con contexto amplio.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, y en Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (version b12412 o superior), Ollama, LM Studio y otros frontends compatibles con GGUF; requiere cargar el fichero `mmproj` para entrada de imagen.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la informacion proporcionada. A continuacion se indican alternativas de categoria similar, con los datos disponibles:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| KORMo-Web-4B (este) | 4,84B | no disponible | Apache 2.0 | Multimodal web-agent, ko/en, GGUF disponible |
| Alternativas de agente GUI open source | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Idiomas limitados a coreano e ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion en la interpretacion de capturas de pantalla y en la generacion de acciones, especialmente en UIs complejas o poco comunes.
- No se han publicado benchmarks que permitan validar su calidad frente a alternativas; la evaluacion en produccion requiere pruebas propias.
- La entrada de imagen depende del fichero `mmproj`; sin el, el modelo solo procesa texto.
- El formato de tool calling es especifico (XML con `<tool_call>`); requiere un parser compatible y no sigue el esquema OpenAI estandar de forma nativa.
- Licencia Apache 2.0 permite uso comercial, pero deben revisarse las condiciones del modelo base KORMo-VL/KORMo-Web-4B y de los datos de entrenamiento originales.
- Modelo de 4,84B: capacidad de razonamiento limitada en comparacion con modelos de mayor tamano; adecuado para tareas acotadas de agente, no para razonamiento complejo general.
- No se dispone de informacion sobre sesgos especificos ni sobre la composicion del dataset de entrenamiento.

## Enlaces

- Repositorio GGUF (bartowski): https://huggingface.co/bartowski/KORMo-VL_KORMo-Web-4B-GGUF
- Modelo base: https://huggingface.co/KORMo-VL/KORMo-Web-4B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp b12412: https://github.com/ggml-org/llama.cpp/releases/tag/b12412
- Descarga directa Q4_K_M: https://huggingface.co/bartowski/KORMo-VL_KORMo-Web-4B-GGUF/blob/main/KORMo-VL_KORMo-Web-4B-Q4_K_M.gguf
