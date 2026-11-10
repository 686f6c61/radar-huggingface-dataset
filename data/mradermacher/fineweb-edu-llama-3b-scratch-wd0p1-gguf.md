# mradermacher/fineweb-edu-llama-3b-scratch-wd0p1-GGUF

## Resumen

`fineweb-edu-llama-3b-scratch-wd0p1` es un modelo de lenguaje de tipo base (no instruido) de aproximadamente 3.250 millones de parametros, desarrollado por el usuario hanseungwook y publicado originalmente en Hugging Face. El repositorio que nos ocupa, `mradermacher/fineweb-edu-llama-3b-scratch-wd0p1-GGUF`, es una conversion a formato GGUF realizada por mradermacher, que ofrece el modelo en multiples niveles de cuantizacion para su uso con llama.cpp y herramientas compatibles. No se trata, por tanto, de un modelo nuevo, sino de una distribucion cuantizada del modelo base original.

El modelo se enmarca en la tradicion de los modelos Llama y ha sido entrenado desde cero (scratch) sobre el corpus FineWeb-Edu, un dataset de contenido web filtrado por calidad educativa. El sufijo "wd0p1" hace referencia a un weight decay de 0,1 empleado durante el preentrenamiento, un detalle de configuracion del entrenamiento que el autor incluye en el nombre. Es un modelo de investigacion orientado al estudio del preentrenamiento, no un asistente conversacional afinado.

Su relevancia actual es limitada pero concreta: sirve como referencia reproducible para experimentos de preentrenamiento a escala de 3B de parametros, y la disponibilidad de cuantizaciones GGUF facilita su ejecucion en hardware de consumo para tareas de evaluacion, extraccion de caracteristicas o investigacion sobre el efecto del weight decay en el entrenamiento. No dispone de ajuste por instrucciones, RLHF ni capacidades de tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama) |
| Parametros totales | 3.253.343.232 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (original en safetensors) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama, un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU y atencion multi-cabeza con RoPE, segun se deduce de la etiqueta `llama` y del nombre del modelo. El tamano de 3.253.343.232 parametros corresponde a una configuracion de aproximadamente 3B, aunque no se detalla en la informacion disponible el numero exacto de capas, dimensiones ocultas ni cabezas de atencion.

El entrenamiento se realizo desde cero (scratch) sobre FineWeb-Edu, un corpus de texto web en ingles filtrado por criterios de calidad educativa. El sufijo `wd0p1` indica un weight decay de 0,1 durante el preentrenamiento, un hiperparametro que el autor incluye en el nombre del modelo, probablemente como parte de un barrido experimental. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases posteriores de ajuste fino, RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en ingles: al ser un modelo base, completa secuencias de texto de forma coherente pero sin seguir instrucciones de forma fiable.
- Modelado de lenguaje y continuacion de texto: util para tareas de completado, evaluacion de perplejidad y experimentos de generacion.
- Extraccion de representaciones: las capas ocultas pueden emplearse para tareas de embedding o clasificacion con ajuste fino posterior.
- Capacidades multilingues: limitadas al ingles, segun la etiqueta `language: en`.
- Tool calling / function calling: no soportado (modelo base sin ajuste por instrucciones).
- Razonamiento multi-paso y agentes: no soportado de forma nativa.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre preentrenamiento: el modelo permite reproducir y analizar el efecto de hiperparametros como el weight decay (0,1 en este caso) en el entrenamiento desde cero a escala 3B, comparando con variantes del mismo autor.
- Evaluacion de tecnicas de cuantizacion: al ofrecerse en 12 niveles de cuantizacion GGUF, es un banco de pruebas ideal para medir la degradacion de perplejidad y calidad entre Q2_K y f16 en un modelo de 3B.
- Generacion de texto de dominio general en ingles: para tareas de completado de texto donde no se requiera seguir instrucciones, como generacion de articulos o parrafos descriptivos.
- Extraccion de caracteristicas para NLP: uso de las representaciones internas como base para clasificadores o sistemas de recuperacion con ajuste fino ligero.
- Experimentos academicos de scaling laws: al ser un modelo de 3B entrenado desde cero sobre un dataset conocido (FineWeb-Edu), sirve como punto de referencia en estudios comparativos de eficiencia de entrenamiento.
- Despliegue en hardware de consumo para demos: la cuantizacion Q4_K_M (2,1 GB) permite ejecutar el modelo en portatiles o GPUs modestas con llama.cpp u Ollama para pruebas de generacion local.
- Analisis de sesgos en corpus web: al entrenarse sobre FineWeb-Edu, permite estudiar que sesgos y patrones lingueisticos se heredan de un corpus web filtrado por calidad educativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB con Q4_K_M, 3,6 GB con Q8_0 y 6,6 GB con f16 (tamanos de archivo GGUF; la VRAM real depende del contexto y del backend).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para las versiones de mayor precision.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas, e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo original en safetensors, transformers con PyTorch.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| fineweb-edu-llama-3b-scratch-wd0p1 (este) | 3,25B | no disponible | no disponible | GGUF, safetensors | Base, entrenado desde cero sobre FineWeb-Edu |
| Llama 3.2 3B | 3,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Instruido, multilingue, con tool calling |
| Qwen2.5 3B | 3,09B | 32K | Apache 2.0 | safetensors, GGUF | Instruido, multilingue, con tool calling |
| SmolLM2 1.7B | 1,7B | 8K | Apache 2.0 | safetensors, GGUF | Instruido, multilingue, mas pequeno |

La comparativa es orientativa: este modelo es un base de investigacion sin ajuste por instrucciones, por lo que no es directamente comparable en tareas de asistente con los modelos instruidos de la tabla. Su interes radica en la reproducibilidad del preentrenamiento, no en el rendimiento en tareas de usuario final.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue ordenes de forma fiable y puede generar continuaciones irrelevantes en dialogos.
- Solo ingles: no soporta castellano ni otros idiomas de forma nativa.
- Riesgo de alucinacion: al ser un modelo de lenguaje entrenado sobre corpus web, puede generar afirmaciones factualmente incorrectas con fluidez.
- Sesgos heredados del corpus: FineWeb-Edu, aunque filtrado por calidad educativa, proviene de web en ingles y puede contener sesgos de genero, culturales o geopoliticos.
- Licencia no disponible: no se especifica la licencia del modelo original ni de la conversion GGUF, lo que impide confirmar si el uso comercial esta permitido. Se recomienda contactar con el autor antes de usarlo en produccion.
- Contexto no documentado: se desconoce la longitud maxima de contexto soportada, lo que limita su uso en tareas que requieran ventanas largas.
- Sin garantias de calidad: al ser un modelo de investigacion con 0 descargas y 0 likes en el momento de la ficha, no hay evidencia de uso en produccion ni validacion por la comunidad.
- Cuantizaciones de baja calidad: las versiones Q2_K y Q3_K_M pueden degradar notablemente la coherencia; se recomienda Q4_K_M o superior para uso practico.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/fineweb-edu-llama-3b-scratch-wd0p1-GGUF
- Modelo base original: https://huggingface.co/hanseungwook/fineweb-edu-llama-3b-scratch-wd0p1
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#fineweb-edu-llama-3b-scratch-wd0p1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
