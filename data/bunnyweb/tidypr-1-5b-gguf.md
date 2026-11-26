# bunnyweb/tidypr-1.5b-gguf

## Resumen

tidypr-1.5b-gguf es un ajuste fino (LoRA/QLoRA con Unsloth) del modelo unsloth/Qwen2.5-Coder-1.5B-Instruct, desarrollado por el usuario bunnyweb. Su proposito es especializado y acotado: detectar "AI slop" en fragmentos de pull requests de Python, es decir, patrones de codigo generado por IA de baja calidad como defensas excesivas, comentarios redundantes, docstrings de relleno, logs con emojis o TODOs de marcador de posicion. Devuelve los hallazgos en formato JSON, lo que lo hace integrable en pipelines de revision automatizada.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-Coder-1.5B, con 1.543.714.304 parametros totales, y se distribuye en formato GGUF para inferencia local eficiente. Su relevancia actual radica en la explosion de contribuciones generadas por agentes de IA en repositorios open source, donde la revision manual de ruido estilistico consume tiempo de mantenedores; tidypr propone automatizar ese filtro con un modelo pequeno que cabe en hardware modesto.

Se trata de un modelo en estado temprano segun su propia model card, con categorias de deteccion desactivadas por defecto cuando no alcanzan el umbral de precision. La licencia Apache-2.0 del modelo base se mantiene para los pesos, mientras que el codigo de la herramienta tidypr es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no disponibles en la informacion) |
| Idiomas soportados | no disponible (orientado a Python, presumiblemente ingles en comentarios) |
| Licencia | apache-2.0 (pesos); codigo tidypr bajo MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only con atencion causal estandar, y se ajusta mediante LoRA con QLoRA usando la libreria Unsloth. El entrenamiento se centra en una tarea de clasificacion/generacion estructurada: dado un hunk de diff de Python, producir hallazgos en JSON sobre patrones de "AI slop".

Los datos de entrenamiento combinan tres fuentes: (1) comentarios de revision humanos sobre pull requests generados por agentes de IA, provenientes del dataset AIDev, y comentarios de CodeReviewer, etiquetados por un profesor Qwen2.5-Coder-7B; (2) hunks que los revisores aceptaron sin comentario, extraidos de CodeReviewer, como ejemplos negativos; y (3) ruido sintetico inyectado en codigo Python humano de la biblioteca estandar de CPython. No se especifica el numero de tokens de entrenamiento ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado. La innovacion principal no es arquitectonica sino de dominio: un modelo pequeno especializado en una tarea de revision de codigo con salida JSON consumible por herramientas.

## Capacidades

- Deteccion de patrones de "AI slop" en hunks de pull requests de Python: defensas excesivas, comentarios redundantes, docstrings de relleno, logs con emojis, TODOs de marcador de posicion.
- Generacion de hallazgos estructurados en JSON, aptos para consumo programatico.
- Revision de diffs de codigo Python en el contexto de pull requests.
- Integracion como paso de CI mediante la accion de GitHub `thebunnyweb/tidypr@v0`.
- Inferencia local mediante backend llama.cpp con el paquete `tidypr[infer]`.
- Capacidades conversacionales heredadas del modelo base (etiqueta `conversational`), aunque no son el foco del ajuste.
- Soporte de tool calling o agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la tarea esta orientada a codigo Python.

## Casos de uso

- Revision automatizada de pull requests en CI: configurar la accion de GitHub tidypr para que analice cada PR y publique hallazgos JSON, filtrando ruido estilistico antes de la revision humana. Adecuado por su tamano reducido y su salida estructurada.
- Filtro previo en repositorios con contribuciones de agentes de IA: detectar defensas excesivas y comentarios redundantes en codigo generado automaticamente, reduciendo la carga de mantenedores.
- Revision local en el flujo de desarrollo: ejecutar `git diff main... | tidypr review --diff - --backend llamacpp` antes de abrir un PR para corregir slop de forma temprana.
- Politicas de calidad de codigo en equipos: integrar los hallazgos JSON en dashboards o gates de merge que bloqueen patrones concretos segun umbral de precision.
- Formacion y calibracion de revisores: usar los hallazgos como ejemplos etiquetados de practicas a evitar en codigo Python asistido por IA.
- Prototipado de herramientas de revision de codigo: servir de base para experimentar con clasificadores de estilo en pipelines propios, dado su bajo coste de inferencia y licencia permisiva.
- Auditoria de repositorios historicos: pasar diffs antiguos por el modelo para identificar acumulacion de patrones de slop y priorizar limpieza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de un informe de evaluacion en el repositorio de la herramienta (`thebunnyweb/tidypr`), pero no se incluyen cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 1.543.714.304 parametros, las cuantizaciones GGUF tipicas de 4 bits rondarian el entorno de 1 GB de pesos, aunque no se confirma en la informacion.
- GPU recomendadas: no disponible en la informacion; por tamano, cabe en GPUs consumer modernas.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo, aunque no se detalla que modelos concretos.
- Opciones de despliegue: llama.cpp (backend `llamacpp` documentado en la model card), y el formato GGUF es compatible con otros runners habituales; no se confirman vLLM, TGI ni Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tidypr-1.5b-gguf | 1.543.714.304 | no disponible | Deteccion de AI slop en PRs Python | apache-2.0 | GGUF en Hugging Face |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1.5B | no disponible | Generacion y asistencia de codigo general | apache-2.0 | safetensors/GGUF |
| Modelos de revision de codigo genericos | no disponible | no disponible | Revision general de codigo | variable | variable |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Estado temprano segun el autor: las categorias que no alcanzan el umbral de precision estan desactivadas por defecto; conviene consultar el informe de evaluacion del repositorio antes de confiar en el modelo.
- Especializado exclusivamente en Python; no se ha validado para otros lenguajes.
- Salida en JSON orientada a hallazgos; puede producir falsos positivos o negativos en patrones ambiguos de estilo.
- Riesgo de alucinacion inherente a los modelos de lenguaje: puede inventar hallazgos o malinterpretar hunks de diff.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse con comentarios de revision humanos y etiquetas de un profesor, puede heredar sesgos de esos datos.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: pesos Apache-2.0 y codigo MIT, permisivos para uso comercial; los datos de entrenamiento contienen codigo de terceros bajo sus licencias originales y no se redistribuyen.
- Para produccion: validar la precision por categoria y considerar el modelo como filtro auxiliar, no como sustituto de la revision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bunnyweb/tidypr-1.5b-gguf
- Repositorio de la herramienta: https://github.com/thebunnyweb/tidypr
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-Coder-1.5B-Instruct
- Dataset AIDev: https://huggingface.co/datasets/hao-li/AIDev
- Dataset CodeReviewer: https://huggingface.co/datasets/fasterinnerlooper/codereviewer
