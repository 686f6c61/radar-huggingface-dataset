# MACreative/rut5-squeeze-fp16

## Resumen

rut5-squeeze-fp16 es un modelo seq2seq compacto derivado de la familia ruT5, publicado por el usuario MACreative en Hugging Face. Su proposito no es la generacion de texto generalista sino la compresion extractiva y abstractiva de textos en ruso y de historiales de conversacion, preservando el significado, las cifras, las rutas de ficheros y la estructura del contenido original. El repositorio ocupa aproximadamente 0,1 GB y los pesos se distribuyen en precision FP16 (en torno a 123 MB segun la model card), lo que lo situa en la gama de modelos ligeros ejecutables en CPU o en GPU de gama baja.

El modelo esta pensado como componente interno del proyecto anyjson, donde se emplea para reducir automaticamente el contexto largo en la interfaz web (script `compress_history.py`) y para los comandos de compresion de texto y documentos (`squeeze_document.py`). Se distribuye bajo licencia MIT y esta etiquetado exclusivamente para el idioma ruso, con los tags `text-compression`, `summarization`, `t5`, `rut5` y `anyjson`.

Por su tamano y su enfoque, resulta relevante para desarrolladores que necesiten una etapa de preprocesado barata que reduzca tokens antes de enviar contexto a un LLM mayor, sin depender de servicios externos. La informacion publica disponible es muy limitada: no se detallan el numero exacto de parametros, la composicion del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder seq2seq (familia T5 / ruT5) |
| Parametros totales | no disponible (repo de ~0,1 GB en FP16, ~123 MB de pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos publicados en FP16; no se documentan otras variantes |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio cargable con `transformers`; presumiblemente safetensors o bin, sin confirmar) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura T5, un transformer encoder-decoder con atencion completa y entrenamiento de tipo span corruption, en su variante adaptada al ruso (ruT5). La tarea se formula como summarization/compression: el encoder procesa el texto o historial de dialogo y el decoder genera una version condensada. La model card menciona explicitamente la preservacion de numeros, rutas y estructura como objetivo de diseno, lo que sugiere un entrenamiento orientado a compresion fiel mas que a resumen libre.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). Tampoco se documenta el proceso de conversion a FP16 ni si hubo destilacion desde un ruT5 de mayor tamano.

## Capacidades

- Compresion de texto en ruso con preservacion de significado, cifras, rutas de ficheros y estructura.
- Resumen y condensacion de historiales de conversacion multi-turno.
- Reduccion de contexto largo como etapa de preprocesado previa a un LLM.
- Pipeline de Hugging Face declarado como `summarization`.
- Carga directa mediante `AutoTokenizer` y `AutoModelForSeq2SeqLM` de la libreria `transformers`.
- Integracion con el proyecto anyjson para compresion automatica de contexto en interfaz web y compresion de documentos.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue: no disponible; el modelo esta etiquetado solo para ruso.

## Casos de uso

- Compresion de historial de chat: el modelo reduce turnos previos de una conversacion en ruso antes de reinyectarlos en la ventana de contexto de un LLM mayor, manteniendo cifras y referencias a ficheros para no perder informacion operativa.
- Preprocesado en pipelines RAG: condensar fragmentos recuperados en ruso antes de pasarlos al modelo generador, reduciendo coste de tokens y latencia en la fase de generacion.
- Gestion de contexto en asistentes de codigo en ruso: comprimir logs, trazas y descripciones de incidencias preservando rutas y numeros de linea, gracias al objetivo de diseno de conservar estructura.
- Resumen de documentacion tecnica interna: condensar manuales o notas extensas en ruso para alimentar indices de busqueda o resumenes ejecutivos.
- Ejecucion local en entornos con recursos limitados: al ocupar ~123 MB en FP16, puede desplegarse en CPU o en GPU consumer para tareas de compresion por lotes sin coste de API.
- Integracion en el proyecto anyjson: uso directo de los scripts `compress_history.py` y `squeeze_document.py` para compresion automatica en la interfaz web y por linea de comandos.
- Etapa de reduccion en sistemas de monitorizacion: comprimir alertas y mensajes de log en ruso antes de enviarlos a un sistema de analisis o a un LLM de mayor capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP16 (~123 MB de pesos mas overhead de activaciones y tokenizer); ejecutable en CPU sin GPU dedicada.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) es sobradamente suficiente; tambien A100/H100 para despliegues por lotes de gran volumen.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: `transformers` (referencia en la model card), `vLLM` o `TGI` si se confirma compatibilidad con la arquitectura T5, y `llama.cpp`/`Ollama` solo si existen conversiones GGUF (no documentadas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| MACreative/rut5-squeeze-fp16 | no disponible (~123 MB FP16) | no disponible | ru | MIT | Especializado en compresion de texto e historial |
| ai-forever/ruT5-base | ~222 M | 512 tokens (tipico en T5) | ru | MIT (familia ruT5) | Modelo base generalista del que deriva la familia |
| ai-forever/ruT5-small | ~60 M | 512 tokens (tipico en T5) | ru | MIT (familia ruT5) | Variante ligera generalista, sin ajuste a compresion |

La comparativa con alternativas especializadas en compresion de contexto en ruso no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ruso; su uso con textos en castellano u otros idiomas no esta validado y probablemente produzca resultados deficientes.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado sobre datos en ruso puede heredar sesgos presentes en ellos.
- Riesgo de alucinacion y de perdida de informacion en la compresion: aunque el diseno busca preservar numeros y rutas, no hay evaluacion publicada que lo garantice.
- Longitud de contexto no documentada; textos muy largos pueden requerir troceado previo.
- Ausencia de benchmarks y de documentacion sobre el dataset de entrenamiento, lo que dificulta evaluar su calidad frente a alternativas.
- Sin soporte documentado de tool calling, agentes, vision ni audio.
- La licencia MIT permite uso comercial, pero al no haber evaluacion publicada conviene validar el modelo en el dominio concreto antes de llevarlo a produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de mantenimiento a largo plazo.

## Enlaces

- Hugging Face: https://huggingface.co/MACreative/rut5-squeeze-fp16
- Proyecto anyjson: https://github.com/no4ni/anyjson
