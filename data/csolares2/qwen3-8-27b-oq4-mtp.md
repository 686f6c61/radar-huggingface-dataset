# csolares2/Qwen3.8-27B-oQ4-mtp

## Resumen

Este repositorio contiene una cuantizacion de precision mixta de 4 bits del modelo Qwen3.8-27B, realizada con la herramienta oMLX (oQ) y publicada por el usuario csolares2. El modelo original, desarrollado por Alibaba, es un LLM denso de 27 000 millones de parametros con capacidades nativas de vision (imagenes y video), razonamiento flexible y una ventana de contexto de 256 000 tokens. Esta version cuantizada reduce el peso del modelo a aproximadamente 17 GB, lo que permite ejecutarlo en equipos con memoria unificada de Apple Silicon o GPUs consumer con suficiente VRAM.

La cuantizacion oQ4 con group size de 64 esta optimizada para el ecosistema MLX, lo que la hace especialmente adecuada para Macs con chips M-series. Al tratarse de una cuantizacion de un modelo ya publicado, no introduce cambios arquitectonicos, pero si una reduccion significativa de requisitos de hardware a cambio de una posible perdida menor de precision. Es relevante para desarrolladores que necesitan desplegar un modelo de 27B con vision y razonamiento en entornos locales o edge sin recurrir a infraestructura cloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con encoder de vision (tipo qwen3_5) |
| Parametros totales | 4 926 789 872 (segun metadatos de safetensors; el modelo base declara 27B, posible discrepancia por cuantizacion) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (256K) |
| Tipos de cuantizacion | oQ4 (4 bits, group size 64) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 es multilingue, pero no se especifican idiomas en esta ficha) |
| Licencia | Apache 2.0 (segun fuentes web del modelo base) |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27 000 millones de parametros que incorpora un encoder de vision para procesar imagenes y videos. Su arquitectura sigue la linea de la familia Qwen3.5, con atencion completa y un diseno orientado a tareas agenciales de largo horizonte. Incluye un modo de "thinking" controlable que permite alternar entre razonamiento deliberado y respuestas rapidas. Los datos de entrenamiento y el proceso exacto (RLHF, DPO, etc.) no se detallan en la informacion disponible.

La cuantizacion oQ4 de este repositorio es una conversion posterior al entrenamiento que reduce los pesos a 4 bits con group size 64, utilizando la herramienta oMLX v0.6.0.dev1. Esta tecnica de precision mixta busca minimizar la perdida de calidad en capas sensibles mientras mantiene un tamaño compacto. No se han publicado detalles sobre la metodologia exacta de seleccion de capas ni sobre la evaluacion de calidad posterior a la cuantizacion.

## Capacidades

- Generacion de texto y razonamiento de multiples pasos, con control flexible del modo de pensamiento (thinking mode activable o desactivable).
- Comprension de imagenes y videos (vision nativa), lo que permite responder a consultas sobre contenido visual.
- Soporte para tareas agenciales de largo horizonte: planificacion, ejecucion de multiples pasos y seguimiento de instrucciones complejas.
- Capacidades multilingues (heredadas del modelo base, aunque no se listan idiomas concretos).
- Generacion de codigo y asistencia en tareas de programacion, segun las descripciones del modelo base.
- Procesamiento de contexto largo de hasta 256K tokens, util para documentos extensos o conversaciones prolongadas.

## Casos de uso

- Asistentes de codigo en entornos locales: un desarrollador puede integrar este modelo en un IDE o en una CLI para autocompletar, explicar y refactorizar codigo, aprovechando su ventana de 256K para analizar repositorios completos. La cuantizacion 4-bit permite ejecutarlo en una estacion de trabajo con 32 GB de RAM unificada.
- Analisis de documentos extensos: con 256K tokens de contexto, el modelo puede resumir contratos, articulos cientificos o informes anuales completos sin necesidad de chunking. La version cuantizada hace viable este uso en portatiles de gama alta.
- Agentes autonomos con vision: gracias a su encoder de vision, puede procesar capturas de pantalla o videos para tareas como automatizacion de interfaces, verificacion visual de resultados o extraccion de informacion de imagenes.
- Atencion al cliente con contexto largo: el modelo puede mantener conversaciones multi-turno recordando el historial completo de una sesion de soporte, incluso si incluye capturas de pantalla o documentos adjuntos.
- Investigacion academica local: investigadores que necesiten un LLM con razonamiento avanzado y vision sin enviar datos a la nube pueden desplegar este modelo en una GPU consumer como la RTX 4090 (24 GB) o en un Mac Studio con 64 GB de memoria unificada.
- Prototipado de aplicaciones agenciales: desarrolladores que construyen sistemas multi-agente pueden usar este modelo como cerebro central, dado su soporte para razonamiento de largo plazo y su capacidad de procesar entradas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion oQ4 en la informacion disponible. El modelo base Qwen3.8-27B tiene benchmarks publicados (segun la busqueda web), pero no se incluyen los numeros concretos en las fuentes consultadas. Por tanto, no se presentan tablas comparativas con datos verificados.

## Requisitos de hardware

- VRAM estimada: aproximadamente 17 GB para inferencia en 4 bits, segun la documentacion de Unsloth. Esto permite ejecucion en GPUs con 24 GB de VRAM (RTX 3090/4090) y en Macs con 32 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M1 Pro/Max/Ultra o superior) para MLX; NVIDIA RTX 3090/4090, A100 o similares si se convierte a otros formatos.
- Compatibilidad con consumer GPU: si, en tarjetas con al menos 24 GB de VRAM. Con cuantizaciones mas agresivas podria caber en 16 GB, pero no se garantiza.
- Opciones de despliegue: MLX (nativo), vLLM, SGLang, LM Studio, Ollama (si se convierte a GGUF), Unsloth (para ejecucion local).
- Latencia y throughput: no disponibles para esta cuantizacion concreta. Se espera un rendimiento tipico de un modelo 27B cuantizado en hardware moderno, con latencia de decodificacion de decenas de tokens por segundo en GPUs de gama alta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B denso | 256K | Si | Apache 2.0 | BF16 |
| Qwen3-30B-A3B | 30B total, 3B activos (MoE) | 128K | No | Apache 2.0 | BF16 |
| Llama-3.3-70B | 70B denso | 128K | No | Llama 3.3 | BF16 |

Esta cuantizacion oQ4 se diferencia del base por su tamaño reducido (17 GB vs ~54 GB en BF16) y por estar optimizada para MLX. Comparada con Qwen3-30B-A3B, ofrece vision y mayor contexto, aunque con mas parametros activos. No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede degradar la precision en tareas de razonamiento complejo o generacion de codigo, aunque la tecnica de precision mixta intenta mitigarlo.
- No se han publicado evaluaciones de calidad especificas de esta version cuantizada; se recomienda validar en el caso de uso concreto.
- El modelo base puede presentar sesgos y alucinaciones tipicos de LLMs entrenados con datos web; la cuantizacion no corrige estos problemas.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia de los pesos cuantizados en este repositorio, ya que la ficha de HuggingFace no la indica explicitamente.
- El formato MLX es exclusivo del ecosistema Apple; para usar en otras plataformas se requiere conversion a GGUF o safetensors estandar.
- El dato de parametros totales en los metadatos (4,9 mil millones) no coincide con la declaracion de 27B del modelo base; posiblemente sea un error de extraccion o corresponda a los pesos cuantizados, pero no se puede confirmar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/csolares2/Qwen3.8-27B-oQ4-mtp
- Repositorio del modelo base (referencia): https://huggingface.co/mcsplain/Qwen3.8-27B-oQ4-mtp
- Cuantizacion oQ8 del mismo autor: https://huggingface.co/csolares2/Qwen3.8-27B-oQ8-mtp
- Documentacion de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Blog de AMD sobre ejecucion local: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Especificaciones y requisitos de hardware (YottaLabs): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Herramienta oMLX: https://github.com/jundot/omlx
