# csolares2/Qwen3.8-27B-oQ5-fp16-mtp

## Resumen

`csolares2/Qwen3.8-27B-oQ5-fp16-mtp` es una cuantización de 5 bits del modelo Qwen3.8-27B, desarrollada por el usuario csolares2 mediante la herramienta oQ (oMLX v0.6.0.dev1) con precisión mixta. El modelo base, publicado por Alibaba Qwen en agosto de 2026, es un transformer denso de 27 mil millones de parámetros con capacidades de visión, razonamiento configurable y una ventana de contexto nativa de 262.144 tokens. Esta cuantización está pensada para ejecutarse en hardware Apple Silicon mediante MLX, reduciendo el peso del modelo a 21,2 GB y facilitando su despliegue local.

La relevancia de esta ficha radica en que Qwen3.8-27B es uno de los primeros modelos abiertos que combina visión, razonamiento largo y capacidades agénticas en un tamaño manejable, y esta versión cuantizada permite ejecutarlo en equipos de consumo sin perder demasiada fidelidad. La cuantización oQ5 utiliza un grupo de tamaño 64 y mantiene algunas capas en fp16 (según el sufijo "fp16-mtp"), lo que busca equilibrar calidad y eficiencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer denso con encoder de vision) |
| Parametros totales | 5.756.598.512 segun safetensors del repo; el modelo original Qwen3.8-27B tiene 27B (discrepancia a verificar) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (segun fuentes del modelo base) |
| Tipos de cuantizacion | oQ5 (5 bits, group size 64, precision mixta con capas en fp16) |
| Idiomas soportados | no disponible (el modelo base soporta multiples idiomas, sin lista oficial) |
| Licencia | no disponible en el repo; el modelo base Qwen3.8-27B es Apache 2.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La cuantización se aplica sobre Qwen3.8-27B, un transformer denso con un encoder de visión integrado, diseñado para tareas de codificación, razonamiento y agentes de largo horizonte. El modelo base incorpora un mecanismo de razonamiento configurable (modo thinking opcional) y una ventana de contexto de 262K tokens. La cuantización oQ5 utiliza una estrategia de precisión mixta: la mayoría de los pesos se reducen a 5 bits con grupo de 64, mientras que ciertas capas críticas (posiblemente las de atención o MLP final) se mantienen en fp16, como indica el sufijo "fp16-mtp". Esto permite reducir el tamaño del modelo a 21,2 GB manteniendo un rendimiento cercano al original.

No se dispone de información detallada sobre el dataset de entrenamiento del modelo base ni sobre el proceso de alineación (RLHF/DPO). La cuantización en sí no modifica los pesos entrenados, solo los comprime.

## Capacidades

- Generacion de texto y chat multilingue (idiomas no especificados).
- Razonamiento configurable: puede operar en modo estandar o en modo thinking para problemas complejos.
- Vision: procesamiento de imagenes y comprension visual (segun las fuentes del modelo base).
- Codificacion: generacion y depuracion de codigo en multiples lenguajes.
- Agentes: soporte para tareas agénticas de largo horizonte, con planificacion y ejecucion multi-paso.
- Tool calling: integracion con herramientas externas y APIs (segun la descripcion de Qwen3.8).
- Contexto largo: ventana nativa de 262K tokens, adecuada para documentos extensos y conversaciones prolongadas.

## Casos de uso

- Asistente de programacion local: el modelo puede generar, revisar y refactorizar codigo directamente en el IDE, aprovechando su ventana de 262K tokens para analizar repositorios completos.
- Analisis de documentos extensos: con 262K tokens de contexto, puede resumir contratos, articulos cientificos o informes anuales sin necesidad de truncar el texto.
- Agente de automatizacion de tareas: gracias a su soporte para tool calling y razonamiento multi-paso, puede orquestar flujos de trabajo como envio de correos, consulta de APIs o gestion de calendarios.
- Chatbot de atencion al cliente con memoria larga: mantiene el historial de conversaciones de usuarios durante semanas, reduciendo la perdida de contexto.
- Analisis de imagenes y documentos escaneados: al incluir vision, puede extraer informacion de capturas, diagramas o formularios.
- Investigacion academica: para experimentos de razonamiento complejo, como resolucion de problemas matematicos o generacion de hipotesis, gracias a su modo thinking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion. El modelo base Qwen3.8-27B cuenta con benchmarks publicados (segun Yottalabs), pero no se dispone de los numeros concretos en la informacion proporcionada. Se recomienda consultar la documentacion oficial de Qwen para obtener las metricas del modelo original y evaluar la degradacion introducida por la cuantizacion oQ5.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 21,2 GB, por lo que se recomienda al menos 24 GB de memoria unificada en Apple Silicon (M1 Max, M2 Ultra, M3 Max) o una GPU con 24 GB de VRAM si se utiliza MLX sobre otros entornos.
- GPU recomendadas: Apple Silicon con 32 GB o mas de RAM unificada para mayor comodidad; en GPUs NVIDIA, se podria ejecutar con adaptadores, aunque MLX esta optimizado para Apple.
- Consumer GPU: cabe en una RTX 3090/4090 (24 GB) si se convierte a otro formato, pero el formato nativo es MLX.
- Opciones de despliegue: MLX (libreria nativa), con posibilidad de usar vLLM o SGLang si se convierten los pesos a otros formatos (no incluido en este repo).
- Latencia y throughput: no disponible; dependera del hardware y del modo de razonamiento activado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Si | Apache 2.0 | Original |
| csolares2/Qwen3.8-27B-oQ5-fp16-mtp | 27B (cuantizado) | 262K | Si | no disponible (base Apache 2.0) | MLX safetensors |
| Qwen3-32B | 32B | 131K | No | Apache 2.0 | Original |
| Llama 3.3 70B | 70B | 128K | No | Llama 3.3 | Original |

La comparativa se limita a modelos de tamano similar. La principal diferencia es la cuantizacion y el formato MLX, que reduce los requisitos de memoria a costa de una posible perdida de precision.

## Limitaciones y advertencias

- La cuantizacion de 5 bits puede introducir una degradacion en la calidad de las respuestas, especialmente en tareas de razonamiento complejo o generacion de codigo.
- El dato de parametros totales en safetensors (5,7B) no coincide con los 27B del modelo base; esto podria indicar un error en el repo o una subida parcial de pesos. Verificar antes de usar en produccion.
- La licencia del repo no esta especificada; aunque el modelo base es Apache 2.0, la cuantizacion podria tener restricciones adicionales por parte del autor.
- No se dispone de informacion sobre sesgos o alucinaciones especificas de esta version cuantizada; se asume que hereda las del modelo base.
- El formato MLX limita el despliegue a ecosistemas Apple; para otros entornos habria que convertir los pesos.
- La ventana de contexto de 262K tokens puede requerir una gestion cuidadosa de memoria, incluso con cuantizacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/csolares2/Qwen3.8-27B-oQ5-fp16-mtp
- Documentacion de oQ/oMLX: https://github.com/jundot/omlx
- Guia de Qwen3.8 en Unsloth: https://unsloth.ai/docs/models/qwen3.8
- Ficha de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Especificaciones y requisitos (Yottalabs): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Benchmarks y fecha de lanzamiento (AI Release Tracker): https://aireleasetracker.com/model/qwen/qwen3.8-27b
