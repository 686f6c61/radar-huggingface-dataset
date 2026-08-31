# mradermacher/manaca-1b-base-i1-GGUF

## Resumen

Este repositorio contiene el archivo de importancia (imatrix) para la cuantización GGUF del modelo `menezesbruno/manaca-1b-base`, un modelo de lenguaje causal (causal LM) en portugués desarrollado por mradermacher (nethype GmbH). El modelo base está etiquetado como arquitectura Llama y entrenado con Megatron-LM, utilizando los datasets `TucanoBR/GigaVerbo` y `wikimedia/wikipedia`. Este repo en concreto no incluye los archivos GGUF cuantizados, sino únicamente el fichero imatrix (de 0,1 GB) que permite generar cuantizaciones de alta calidad mediante el método de imatrix. Los GGUF estáticos están disponibles en un repositorio hermano (`mradermacher/manaca-1b-base-GGUF`). La relevancia de este recurso radica en que facilita a los desarrolladores crear sus propias cuantizaciones optimizadas para el modelo base, manteniendo la licencia CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (causal LM) |
| Parametros totales | 491.688 (segun safetensors; el nombre del modelo sugiere ~1B, pero el dato reportado es ese) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se proporciona el archivo imatrix; los GGUF estan en otro repo) |
| Idiomas soportados | portugues (pt) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (imatrix) |

## Arquitectura y entrenamiento

El modelo base `manaca-1b-base` es un transformer causal de tipo Llama, entrenado con Megatron-LM. Los datos de entrenamiento incluyen los datasets `TucanoBR/GigaVerbo` y `wikimedia/wikipedia`, ambos en portugues. No se dispone de informacion sobre el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La unica innovacion tecnica destacable en este repositorio es el uso del metodo imatrix para la cuantizacion, que mejora la calidad de los quants en comparacion con los metodos estaticos convencionales.

## Capacidades

- Generacion de texto en portugues (brasileno) mediante modelado causal.
- Al ser un modelo base (no instruct), no soporta tool calling, agentes ni razonamiento multi-paso de forma nativa.
- No se han documentado capacidades especiales como vision, audio o modo thinking.
- El archivo imatrix permite generar cuantizaciones GGUF de alta calidad para despliegue eficiente.

## Casos de uso

- Creacion de cuantizaciones personalizadas: el archivo imatrix se utiliza junto con herramientas como `llama.cpp` para generar quants GGUF optimizados para el modelo base, adaptados a hardware especifico.
- Inferencia local en portugues: una vez generados los GGUF, el modelo puede usarse para tareas de generacion de texto en portugues, como chatbots, resumen o traduccion, en entornos con recursos limitados.
- Fine-tuning posterior: el modelo base puede ajustarse para tareas especificas en portugues, como analisis de sentimiento o clasificacion de texto, antes de cuantizarlo.
- Investigacion en PNL para portugues: sirve como punto de partida para experimentos con modelos de 1B en este idioma, especialmente en entornos academicos.
- Prototipado rapido: al ser un modelo pequeno, permite iterar rapidamente en aplicaciones de generacion de texto sin necesidad de GPUs de alta gama.
- Educacion y formacion: util para ensenar tecnicas de cuantizacion y despliegue de modelos de lenguaje en cursos de ingenieria de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al tratarse de un modelo de aproximadamente 1B de parametros (segun el nombre), la inferencia puede ejecutarse en CPU con 8-16 GB de RAM, o en GPUs consumer como RTX 3060 o superiores con 6-8 GB de VRAM.
- El archivo imatrix (0,1 GB) requiere muy poco espacio y puede procesarse en cualquier maquina con herramientas de cuantizacion.
- Para generar los GGUF se recomienda usar `llama.cpp` o `llama-cpp-python` en un sistema con al menos 8 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si se generan los GGUF), o Transformers con el modelo base en formato safetensors.
- No se dispone de datos de latencia o throughput especificos.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de tamano similar en portugues. El modelo base `manaca-1b-base` no tiene una ficha publica detallada en este repositorio, y no se han encontrado alternativas comparables en la busqueda web.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en portugues, por lo que su rendimiento en otros idiomas es nulo o muy pobre.
- Al ser un modelo base, no esta optimizado para seguir instrucciones ni para tareas de dialogo; requiere fine-tuning para usos practicos.
- No se han documentado sesgos especificos, pero al entrenarse con datos de Wikipedia y GigaVerbo, puede reflejar sesgos presentes en esos corpus.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de generacion abierta.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero es recomendable revisar los terminos de los datasets originales.
- Este repositorio no contiene los archivos GGUF listos para usar; solo el imatrix. Para obtener los quants, hay que acudir al repositorio estatico o generarlos manualmente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/manaca-1b-base-i1-GGUF
- Modelo base: https://huggingface.co/menezesbruno/manaca-1b-base
- Repositorio de quants estaticos: https://huggingface.co/mradermacher/manaca-1b-base-GGUF
- Pagina de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
