# satyrn-ai/Ornith-1.5-9B-py3.15

## Resumen

Satyrn Ornith-1.5-9B-py3.15 es un ajuste fino (fine-tune) del modelo base Ornith-1.5-9B, desarrollado por el equipo de Satyrn y orientado especificamente a la generacion y comprension de codigo Python 3.15. Se trata de un modelo de lenguaje y vision (image-text-to-text) que acepta entradas multimodales de imagen y texto y produce texto como salida, con 9.653.104.368 parametros totales segun los pesos en safetensors del repositorio.

El modelo se entrena mediante el pipeline Satyrn Models basado en Unsloth, con evaluaciones ejecutadas con inspect_ai durante el proceso de entrenamiento. La relevancia de esta ficha radica en que combina un modelo base multimodal de 9B con un ajuste especializado en una version concreta del lenguaje Python, lo que lo hace util para tareas de generacion de codigo asistida y analisis de capturas o diagramas relacionados con desarrollo.

El repositorio incluye pesos en safetensors y variantes GGUF para llama.cpp, esta publicado bajo licencia MIT y declara soporte para ingles y codigo Python. La informacion publica sobre arquitectura interna, longitud de contexto y datos de entrenamiento es limitada, por lo que varios campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como qwen3_5; transformer multimodal image-text-to-text) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes incluidas en el repo); cuantizaciones adicionales no disponibles |
| Idiomas soportados | Ingles y codigo Python (segun model card) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune del base ornith-ai/Ornith-1.5-9B, etiquetado en Hugging Face con la arquitectura qwen3_5 y con la capacidad image-text-to-text, lo que indica un transformer multimodal con torre de vision y decodificador de texto. No se detalla en la informacion disponible el numero de capas, dimensiones ocultas, mecanismo de atencion ni si emplea tecnicas como atencion lineal o decodificacion especulativa.

El entrenamiento se realizo con el pipeline Satyrn Models sobre Unsloth, usando la configuracion `experiment/py3.15-ornith-1.5-9b` del repositorio satyrn-ai/satyrn-models. Las evaluaciones se ejecutan con inspect_ai durante el entrenamiento. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. La especializacion declarada es Python 3.15, una version del lenguaje posterior a las disponibles en la mayoria de corpus publicos, lo que sugiere un dataset curado especificamente para esa version.

## Capacidades

- Generacion de texto y codigo, con especializacion en Python 3.15.
- Comprension de imagenes combinadas con texto (image-text-to-text), util para interpretar capturas, diagramas o documentacion visual.
- Conversacion multi-turno mediante plantilla de chat (`apply_chat_template`).
- Generacion de codigo a partir de instrucciones en lenguaje natural.
- Compatibilidad con llama.cpp y formatos GGUF para inferencia local.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistencia a la migracion a Python 3.15: el modelo puede generar y revisar codigo adaptado a las novedades de esa version, lo que resulta util en equipos que planifican actualizaciones de version del interprete.
- Generacion de funciones y utilidades Python: dada una descripcion en lenguaje natural, produce implementaciones completas, como se muestra en el ejemplo de la model card (fusionar dos listas ordenadas).
- Revision de codigo en pipelines de CI: puede integrarse como paso de analisis para detectar patrones obsoletos o proponer correcciones compatibles con Python 3.15.
- Analisis de capturas de errores y trazas: al ser multimodal, puede recibir una imagen de un stack trace o de una consola y proponer una explicacion o correccion.
- Documentacion tecnica asistida: generar docstrings, ejemplos de uso y explicaciones a partir de fragmentos de codigo o diagramas.
- Despliegue local en estaciones de trabajo: gracias a las variantes GGUF y a llama.cpp, puede ejecutarse en equipos sin GPU dedicada para tareas de autocompletado y consultas de codigo.
- Prototipado rapido en notebooks: integracion con Transformers para experimentar con generacion de codigo en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 19-20 GB para los 9.653 millones de parametros, mas overhead de activaciones y cache KV.
- Cuantizacion GGUF: las variantes Q4 permitirian alrededor de 5-6 GB de VRAM o memoria unificada; Q8 en torno a 10 GB. Los tamanos exactos de cada variante no estan disponibles.
- GPU recomendadas: A100 40 GB o H100 para fp16 con contexto largo; RTX 4090 (24 GB) suficiente para fp16 en contextos moderados; RTX 3090/4080 para cuantizaciones GGUF.
- Consumer GPU: si, cabe en GPUs de 24 GB en fp16 y en GPUs de 8-12 GB con cuantizacion GGUF.
- Opciones de despliegue: Transformers, llama.cpp, Unsloth para entrenamiento; vLLM y TGI no se mencionan explicitamente en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Satyrn Ornith-1.5-9B-py3.15 | 9,65B | no disponible | imagen + texto | MIT | Fine-tune especializado en Python 3.15 |
| Ornith-1.5-9B (base) | no disponible | no disponible | imagen + texto | no disponible | Modelo base sin especializacion en Python 3.15 |
| Qwen2.5-Coder-7B | 7,6B | 32K (tipico) | texto | Apache 2.0 | Especializado en codigo, sin vision |
| Llama 3.1 8B | 8B | 128K | texto | Llama 3.1 Community | Proposito general, sin vision |

Los datos de los modelos alternativos se incluyen como referencia de categoria; no se dispone de comparaciones de rendimiento directas con este modelo en la informacion proporcionada.

## Limitaciones y advertencias

- La model card declara solo ingles y codigo Python como idiomas soportados; el rendimiento en castellano u otros idiomas no esta garantizado.
- La especializacion en Python 3.15 puede degradar el rendimiento en versiones anteriores del lenguaje o en otros lenguajes de programacion.
- Riesgo de alucinacion en APIs y funciones de Python 3.15 que el modelo no haya visto de forma fiable durante el entrenamiento.
- No se publican datos sobre sesgos, composicion del dataset ni evaluaciones de seguridad.
- La longitud de contexto no esta documentada, lo que dificulta planificar tareas con ventanas largas.
- Aunque la licencia es MIT, conviene verificar las condiciones del modelo base Ornith-1.5-9B antes de un uso comercial en produccion.
- El modelo tiene un volumen de descargas bajo (328) y un unico like, por lo que la validacion comunitaria es limitada.
- El tag `py3.15` sugiere un ajuste sobre una version del lenguaje muy reciente; la cobertura real de esa version debe validarse con pruebas propias.

## Enlaces

- Hugging Face: https://huggingface.co/satyrn-ai/Ornith-1.5-9B-py3.15
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Sitio de Satyrn: https://satyrn.ai/
- Sitio de Ornith: https://ornith.ai/
- Repositorio de entrenamiento: https://github.com/satyrn-ai/satyrn-models
- Configuracion del experimento: https://github.com/satyrn-ai/satyrn-models/blob/07d604ab5b1de1a346c4b995dcada34678d2436e/trainer/unsloth/configs/experiment/py3.15-ornith-1.5-9b.yaml
- Unsloth: https://github.com/unslothai/unsloth
