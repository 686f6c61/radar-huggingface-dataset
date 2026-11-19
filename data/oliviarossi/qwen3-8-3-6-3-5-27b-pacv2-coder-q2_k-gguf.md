# OliviaRossi/Qwen3.8-3.6-3.5-27B-PACv2-Coder-Q2_K-GGUF

## Resumen

OliviaRossi/Qwen3.8-3.6-3.5-27B-PACv2-Coder-Q2_K-GGUF es una cuantizacion en formato GGUF (tipo Q2_K) del modelo OliviaRossi/Qwen3.8-3.6-3.5-27B-PACv2-Coder, un merge de modelos de la familia Qwen (etiquetado por el autor como qwen3.5, qwen3.6, qwen3.8) orientado a programacion agentica y con pipeline multimodal image-text-to-text. El autor, OliviaRossi, ha generado esta version mediante el espacio GGUF-my-repo de ggml.ai sobre llama.cpp, lo que permite ejecutar el modelo en CPU y GPU de consumo con llama.cpp, Ollama u otros runtimes compatibles con GGUF.

El modelo base cuenta con 27.320.697.856 parametros (27,3 mil millones) y se distribuye bajo licencia Apache 2.0. La cuantizacion Q2_K reduce el peso del repositorio a 10,9 GB, lo que lo hace viable en equipos con VRAM limitada, a costa de una perdida de calidad notable frente a los pesos originales. La model card del repositorio es generica: no aporta informacion sobre datos de entrenamiento, contexto, idiomas ni evaluaciones, por lo que muchos de los datos tecnicos de esta ficha figuran como no disponibles.

La relevancia de esta ficha es practica: permite evaluar rapidamente si una cuantizacion de muy baja precision de un merge de 27B orientado a codigo es una opcion realista para despliegue local, y con que limitaciones. Se recomienda consultar la model card del modelo base para obtener detalles adicionales sobre el merge y su composicion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de la familia Qwen; detalles del merge no disponibles) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 2048`) |
| Tipos de cuantizacion | Q2_K (esta version); otras cuantizaciones del modelo base no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Pipeline | image-text-to-text (multimodal) |
| Tamano del repositorio | 10,9 GB |
| Modelo base | OliviaRossi/Qwen3.8-3.6-3.5-27B-PACv2-Coder |
| Herramienta de conversion | GGUF-my-repo (ggml.ai) sobre llama.cpp |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la informacion proporcionada. Por las etiquetas (`qwen3_5`, `qwen3.6`, `qwen3.8`, `crossmean`, `pac-merge-v2`) se deduce que se trata de un merge de pesos de varios modelos de la familia Qwen, combinados mediante una tecnica denominada "PAC merge v2" y con algun mecanismo de agregacion etiquetado como "crossmean". El pipeline declarado es image-text-to-text, lo que sugiere que el modelo base incorpora capacidad multimodal (vision-lenguaje), aunque la model card no detalla el codificador visual ni la resolucion de imagen soportada.

No hay datos publicados sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). Esta version concreta es unicamente una conversion a GGUF con cuantizacion Q2_K de 2 bits, realizada con llama.cpp; no implica reentrenamiento ni ajuste fino adicional.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `conversational`).
- Capacidad multimodal image-text-to-text declarada en el pipeline del modelo base: entrada de imagen junto con texto.
- Orientacion a programacion agentica segun la etiqueta `agentic-coding`, aunque no se documentan detalles de tool calling ni function calling.
- Razonamiento y codigo: esperables por la familia Qwen y la etiqueta "Coder", pero sin datos verificables en la informacion disponible.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta informado).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado local de asistentes de codigo: ejecutable con llama.cpp en una maquina de consumo gracias a los 10,9 GB del archivo Q2_K, permite validar flujos de autocompletado y generacion de parches antes de invertir en infraestructura mayor.
- Experimentacion con modelos multimodales en local: el pipeline image-text-to-text permite probar tareas de descripcion de imagenes o preguntas sobre capturas de pantalla en entornos sin GPU de datacenter.
- Evaluacion de merges de la familia Qwen: util para investigadores que quieran comparar el comportamiento de un merge PACv2 frente a los modelos Qwen originales en tareas de codigo, con un coste de hardware minimo.
- Generacion de documentacion tecnica a partir de fragmentos de codigo o diagramas: el caracter multimodal y el enfoque "Coder" lo hacen candidato para generar explicaciones de repositorios o imagenes de arquitectura.
- Entornos con recursos muy limitados: al ser Q2_K, puede desplegarse en estaciones de trabajo sin GPU dedicada mediante llama.cpp en CPU, con latencia alta pero funcional para pruebas offline.
- Base para pipelines de agentes experimentales: las etiquetas `agentic-coding` y `endpoints_compatible` sugieren su uso en orquestadores de agentes; conviene validar empiricamente la calidad de las llamadas a herramientas antes de produccion.
- Educacion y demos: su tamano contenido permite incluirlo en talleres o demos de inferencia local de modelos de 27B cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q2_K ocupa 10,9 GB; se necesita aproximadamente esa cantidad de VRAM (o RAM) mas overhead de contexto (unos 1-2 GB adicionales segun longitud de contexto y backend).
- GPU recomendadas: RTX 3090/4090 (24 GB) o superiores (A100, H100) para margen amplio; tambien cabe en GPUs de 12-16 GB con contexto reducido.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM; en 8 GB requeriria offloading parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, y cualquier runtime compatible con GGUF; la etiqueta `endpoints_compatible` sugiere compatibilidad con APIs estilo OpenAI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| OliviaRossi/Qwen3.8-3.6-3.5-27B-PACv2-Coder-Q2_K-GGUF | 27,3B | no disponible | GGUF Q2_K | Apache 2.0 | Merge multimodal orientado a codigo, cuantizado a 2 bits |
| OliviaRossi/Qwen3.8-3.6-3.5-27B-PACv2-Coder (base) | 27,3B | no disponible | safetensors (presumible) | Apache 2.0 | Pesos originales del merge, mayor calidad |
| Otros modelos Qwen de ~27B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- La cuantizacion Q2_K es de muy baja precision (2 bits); se espera una degradacion significativa de calidad, coherencia y capacidad de razonamiento frente al modelo base, especialmente en tareas de codigo y matematicas.
- La model card no documenta sesgos conocidos, datos de entrenamiento ni evaluaciones de seguridad; no hay garantias sobre el comportamiento en dominios sensibles.
- Riesgo de alucinacion no cuantificado; al ser un merge sin evaluacion publica, conviene validar empiricamente antes de cualquier uso en produccion.
- Idiomas soportados no declarados; no se puede confirmar el rendimiento en castellano.
- Longitud de contexto no documentada; el ejemplo de la model card usa `-c 2048`, lo que sugiere precaucion con contextos largos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base es un merge de modelos Qwen cuyas condiciones originales deberian verificarse en la model card del modelo base.
- El repositorio no tiene descargas ni likes y fue creado en 2026-11-19; no hay evidencia de validacion por la comunidad.
- La capacidad multimodal declarada en el pipeline no esta confirmada para esta cuantizacion GGUF concreta; algunos runtimes de llama.cpp pueden no soportar la entrada de imagen de forma completa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OliviaRossi/Qwen3.8-3.6-3.5-27B-PACv2-Coder-Q2_K-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/Qwen3.8-3.6-3.5-27B-PACv2-Coder
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
