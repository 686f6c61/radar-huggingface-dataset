# Kling-Keye/Thyme-RL

## Resumen

Thyme-RL es un modelo multimodal de tipo image-text-to-text desarrollado por Kling-Keye (equipo Kwai Keye), un fine-tune del Qwen2.5-VL-7B-Instruct. Su propuesta central es superar el paradigma convencional de "pensar con imagenes": en lugar de razonar unicamente sobre la representacion visual recibida, el modelo genera y ejecuta codigo de procesamiento de imagen y computacion de forma autonoma para resolver tareas de percepcion de alta resolucion y razonamiento complejo. Esta variante RL corresponde a la etapa de refinamiento por aprendizaje por refuerzo dentro de una estrategia de entrenamiento en dos fases (SFT seguido de RL) descrita en el informe tecnico "Thyme: Think Beyond Images".

El modelo parte de la arquitectura Qwen2.5-VL, un transformer multimodal con aproximadamente 8.290 millones de parametros (8.292.166.656 segun los pesos en safetensors), y se distribuye bajo licencia MIT. Su relevancia actual radica en la combinacion de generacion de codigo ejecutable como herramienta de razonamiento visual con el algoritmo GRPO-ATS, que busca equilibrar la exploracion del razonamiento y la precision en la ejecucion del codigo. El repositorio ocupa 16,6 GB e incluye unicamente pesos en formato safetensors.

La model card es escasa en detalles cuantitativos: no se especifican la longitud de contexto, los tipos de cuantizacion soportados ni los resultados de benchmarks. La informacion disponible se limita a la arquitectura base, los datasets de entrenamiento (Thyme-SFT y Thyme-RL) y los enlaces al paper, repositorio y pagina del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen2.5-VL-7B-Instruct) |
| Parametros totales | 8.292.166.656 (~8,29 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Thyme-RL hereda la arquitectura de Qwen2.5-VL-7B-Instruct, un transformer multimodal disenado para entrada conjunta de imagen y texto. Sobre esta base, el equipo aplica una estrategia de entrenamiento en dos etapas: primero un ajuste supervisado (SFT) con el dataset Kwai-Keye/Thyme-SFT, y despues un refinamiento por aprendizaje por refuerzo con el dataset Kwai-Keye/Thyme-RL. Esta variante del repositorio corresponde a la segunda etapa.

La innovacion tecnica principal es el algoritmo GRPO-ATS (descrito en el paper arXiv:2508.11630), que extiende el Group Relative Policy Optimization con un mecanismo orientado a equilibrar la exploracion del razonamiento y la precision en la ejecucion del codigo. El modelo aprende a generar codigo ejecutable de procesamiento de imagen (operaciones sobre la imagen de entrada) como parte de su cadena de razonamiento, lo que le permite manipular la informacion visual de forma activa en lugar de limitarse a interpretarla pasivamente. No se dispone de datos sobre el numero de tokens de entrenamiento ni sobre la composicion detallada del dataset.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre imagenes y texto combinados.
- Generacion y ejecucion autonoma de codigo de procesamiento de imagen como herramienta de razonamiento ("thinking with code").
- Percepcion de alta resolucion mediante operaciones programaticas sobre la imagen (recortes, zoom, transformaciones).
- Razonamiento complejo en tareas que requieren manipulacion iterativa de la informacion visual.
- Conversacion multi-turno (tag `conversational`).
- Capacidades de codigo derivadas de la base Qwen2.5-VL, aplicadas a la ejecucion de operaciones visuales.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: parcialmente implicitas en el bucle de generacion y ejecucion de codigo, aunque no se documentan formalmente.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Analisis de documentos de alta resolucion: el modelo puede generar codigo para recortar y ampliar regiones de un documento escaneado antes de leerlas, lo que resulta adecuado para OCR y extraccion de tablas en imagenes densas.
- Inspeccion visual de detalle en imagenes medicas o tecnicas: la capacidad de ejecutar operaciones de zoom programatico permite examinar regiones concretas que un modelo de vision convencional perderia al reescalar la imagen.
- Automatizacion de tareas de percepcion en pipelines de datos: integrable en flujos donde se requiere transformar la imagen (rotar, recortar, filtrar) y razonar sobre el resultado en una sola pasada.
- Razonamiento visual de varios pasos: util en tareas de tipo "cuenta los objetos que cumplen X condicion" donde el modelo puede segmentar, contar y verificar mediante codigo.
- Prototipado de agentes visuales en investigacion: su licencia MIT y su base Qwen2.5-VL lo hacen adecuado para experimentar con paradigmas de razonamiento mediante ejecucion de codigo.
- Educacion y asistencia tecnica sobre imagenes: explicar diagramas o figuras complejas procesando por partes la imagen de entrada.
- Evaluacion comparativa de tecnicas de RL para modelos multimodales: sirve como referencia reproducible junto con su variante SFT y los datasets publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 16,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- VRAM estimada con cuantizacion a 8 bits: en torno a 9-10 GB para pesos (estimacion a partir del numero de parametros; no confirmada por el autor).
- VRAM estimada con cuantizacion a 4 bits: en torno a 5-6 GB para pesos (estimacion; no confirmada por el autor).
- GPU recomendadas: A100 (40/80 GB), H100 para despliegue de alta concurrencia; RTX 4090 (24 GB) viable en BF16 para uso individual.
- GPU de consumo: cabe en RTX 4090 en BF16 y en GPUs de 16 GB con cuantizacion, siempre que el runtime lo permita (no se publican pesos GGUF).
- Opciones de despliegue: vLLM o TGI para servidores con soporte de Qwen2.5-VL; llama.cpp/Ollama requeririan conversion a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Thyme-RL | ~8,29 B | no disponible | MIT | Razonamiento visual mediante generacion y ejecucion de codigo (RL con GRPO-ATS) |
| Qwen2.5-VL-7B-Instruct | ~8,3 B | no disponible en esta ficha | Apache 2.0 (modelo base) | Vision-lenguaje generalista |
| Thyme-SFT | ~8,29 B | no disponible | MIT | Misma base, solo etapa de ajuste supervisado |
| Otros modelos de "thinking with images" | no disponible | no disponible | no disponible | no disponible |

La comparacion cuantitativa de rendimiento entre Thyme-RL, Thyme-SFT y Qwen2.5-VL-7B-Instruct no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano no esta documentado.
- No se publican resultados de benchmarks, por lo que no es posible verificar las mejoras frente al modelo base.
- El modelo depende de la ejecucion de codigo generado; en produccion es imprescindible un entorno de ejecucion aislado y con limites de recursos para evitar riesgos de seguridad.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado si el codigo generado produce resultados erroneos que el modelo interpreta como validos.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- La longitud de contexto no esta especificada; no debe asumirse la del modelo base sin verificacion.
- Licencia MIT: permisiva para uso comercial, pero conviene revisar las condiciones del modelo base Qwen2.5-VL y de los datasets empleados.
- El repositorio no incluye pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de gama baja sin conversion manual.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Kling-Keye/Thyme-RL
- Modelo SFT: https://huggingface.co/Kwai-Keye/Thyme-SFT
- Dataset SFT: https://huggingface.co/datasets/Kwai-Keye/Thyme-SFT
- Dataset RL: https://huggingface.co/datasets/Kwai-Keye/Thyme-RL
- Informe tecnico (arXiv): https://arxiv.org/abs/2508.11630
- Repositorio GitHub: https://github.com/yfzhang114/Thyme
- Pagina del proyecto: https://thyme-vl.github.io/
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
