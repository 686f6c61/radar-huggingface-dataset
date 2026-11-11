# MouseWurX/20Bob-Bill

## Resumen

20Bob Bill es una variante del modelo Qwen3.6-35B-A3B, un transformer de tipo mixture-of-experts (MoE) desarrollado originalmente por el equipo Qwen de Alibaba. La variante ha sido publicada por el usuario MouseWurX bajo el paraguas de un proyecto personal denominado "Bob's Forge", y se distribuye en formato GGUF cuantizado para inferencia local. El modelo conserva todos los expertos por capa del modelo base, con aproximadamente 20.558 millones de parametros totales y unos 3.000 millones activos por token, segun indica la model card.

El objetivo declarado del autor es adaptar el modelo a tareas concretas: uso de herramientas (tool use), generacion de codigo, produccion de formatos exactos y conversacion cotidiana. Se trata, por tanto, de un ajuste orientado a un perfil de uso practico y no de un modelo generalista nuevo. La relevancia actual radica en que ofrece una alternativa cuantizada y ligera (10-12,6 GB en disco) para despliegue en hardware de consumo, manteniendo la arquitectura MoE del modelo base.

No obstante, la informacion publica es muy limitada: el repositorio no incluye pipeline declarado, no especifica idiomas soportados y no aporta resultados de benchmarks. La ficha se completa con los datos disponibles y se indica explicitamente cuando un dato no esta disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mixture-of-experts (MoE), derivada de Qwen3.6-35B-A3B |
| Parametros totales | 20.558.574.208 (~20,6 B) |
| Parametros activos | ~3 B por token (segun model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_M y Q4_K_M (GGUF); no se detallan otras |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ficheros `20Bob-Q3_K_M.gguf` y `20Bob-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.6-35B-A3B: un transformer con capas de mezcla de expertos en las que se conservan todos los expertos por capa, pero solo se activa una fraccion de ellos por token (aproximadamente 3 B de los 20,6 B totales). Esta configuracion permite un coste computacional por token mucho menor que un modelo denso del mismo tamano, a cambio de un mayor uso de memoria para almacenar todos los parametros.

El proceso de entrenamiento o ajuste no esta documentado en la model card mas alla de la mencion a "lesson sets" propios del proyecto Bob (con licencia CC BY-SA 4.0) y a trazas de otros modelos con licencias abiertas, segun se indica en el "Forge journal" enlazado en el repositorio de GitHub. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras. Tampoco se detallan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en multiples turnos, orientada a chat cotidiano.
- Uso de herramientas (tool use / function calling), segun los tags del repositorio.
- Generacion de codigo, con enfasis en la produccion de formatos exactos.
- Razonamiento multi-paso y soporte para agentes, derivado de las capacidades del modelo base.
- Capacidades multilingues: no confirmadas en la informacion disponible.
- Modo "thinking" o vision: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de atencion al cliente: el modelo puede gestionar conversaciones multi-turno y ejecutar llamadas a herramientas para consultar estado de pedidos o bases de conocimiento, aprovechando su soporte de tool calling.
- Generacion de codigo en pipelines de desarrollo: integrable en flujos de CI/CD o asistentes de IDE para autocompletar, refactorizar o generar tests, gracias a su capacidad de codigo y a su tamano contenido.
- Automatizacion de formatos exactos: generacion de JSON, YAML o plantillas estructuradas con validacion estricta, adecuado para integraciones entre sistemas.
- Agentes autonomos de proposito general: el modelo puede encadenar pasos de razonamiento y llamadas a herramientas en tareas de automatizacion de flujos de trabajo.
- Despliegue local en estaciones de trabajo: con cuantizacion Q4_K_M (12,6 GB) puede ejecutarse en GPUs de consumo con 14 GB de VRAM, lo que permite prototipado sin infraestructura cloud.
- Chatbot interno para equipos: conversacion cotidiana y asistencia en tareas de documentacion o resumen, con coste de inferencia bajo gracias a sus ~3 B parametros activos.
- Experimentacion en investigacion: base para estudiar tecnicas de ajuste sobre arquitecturas MoE cuantizadas, dado su formato GGUF y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12 GB para la cuantizacion Q3_K_M y 14 GB para Q4_K_M, segun la model card.
- GPU recomendadas: no especificadas por el autor; por el perfil de memoria, tarjetas con 12-16 GB de VRAM como RTX 4070 Ti, RTX 4080 o RTX 4090 son candidatas razonables, aunque no se confirma oficialmente.
- Cabe en GPU de consumo: si, segun los requisitos de memoria indicados (12-14 GB).
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; los tags indican compatibilidad con endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| 20Bob Bill | ~20,6 B | ~3 B | no disponible | Apache 2.0 | GGUF (Q3_K_M, Q4_K_M) |
| Qwen3.6-35B-A3B (base) | ~35 B | ~3 B | no disponible | Apache 2.0 | safetensors, GGUF |
| Alternativas de ~20 B densas | ~20 B | ~20 B | variable | variable | variable |

La comparacion con alternativas densas de tamano similar es favorable en coste de inferencia por token (solo ~3 B activos), pero desfavorable en requisitos de memoria total. No se dispone de datos de rendimiento comparativo para 20Bob Bill.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real es desconocido.
- La model card no documenta sesgos conocidos, pero al derivar de un modelo base entrenado con datos web, es probable que herede sesgos de este.
- Riesgo de alucinacion inherente a los modelos generativos; no hay evaluacion especifica disponible.
- La longitud de contexto no esta especificada, lo que dificulta planificar casos de uso con documentos largos.
- Los idiomas soportados no estan declarados; el soporte multilingue no esta confirmado.
- El ajuste se realizo con "lesson sets" propios y trazas de otros modelos; la procedencia exacta y la calidad del dataset no son verificables a partir de la informacion publica.
- Licencia Apache 2.0 permisiva para uso comercial, pero las "lesson sets" del proyecto Bob tienen licencia CC BY-SA 4.0, lo que podria introducir obligaciones adicionales de atribucion o comparticion; conviene revisar el Forge journal antes de un uso comercial.
- El nombre "Bob" es un homenaje a las novelas de Dennis E. Taylor; el proyecto no esta afiliado al autor.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MouseWurX/20Bob-Bill
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Forge journal (GitHub): https://github.com/MouseWurX/Bob/blob/main/app/docs/FORGE-JOURNAL.md
