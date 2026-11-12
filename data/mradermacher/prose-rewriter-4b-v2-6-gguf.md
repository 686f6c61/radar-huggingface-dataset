# mradermacher/prose-rewriter-4b-v2.6-GGUF

## Resumen

`mradermacher/prose-rewriter-4b-v2.6-GGUF` es una publicacion de cuantizaciones estaticas en formato GGUF del modelo `chartreuse-verte/prose-rewriter-4b-v2.6`, un modelo de 4.000 millones de parametros orientado, por su nombre, a la reescritura de prosa. El autor de esta ficha, mradermacher, es un conocido generador de cuantizaciones GGUF para la comunidad de llama.cpp, y en este caso no aporta un modelo propio sino una conversion del original de Hugging Face a distintos niveles de compresion.

La informacion publicada es muy limitada: la model card se reduce a metadatos de la herramienta de cuantizacion y a la referencia al modelo base, sin detallar arquitectura, datos de entrenamiento, idiomas, licencia ni rendimiento. Por tanto, esta ficha debe leerse como una descripcion del paquete de cuantizaciones y de lo que se puede inferir del nombre y del tamano, no como una evaluacion tecnica completa del modelo subyacente.

El interes practico de esta publicacion reside en que permite ejecutar un modelo de 4B especializado en reescritura de prosa en hardware de consumo mediante llama.cpp y derivados (Ollama, LM Studio, etc.), con cuantizaciones que van desde Q2_K hasta Q8_0 e IQ4_XS, lo que facilita su despliegue local sin GPU dedicada de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de 4B; arquitectura concreta no especificada) |
| Parametros totales | aproximadamente 4.000 millones (inferido del nombre "4b") |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye presumiblemente en safetensors, aunque no se confirma |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base `chartreuse-verte/prose-rewriter-4b-v2.6`. Por el nombre y el tamano cabe esperar un transformer decoder-only de aproximadamente 4.000 millones de parametros, pero no hay datos publicados en la informacion disponible que confirmen la familia (Llama, Qwen, Mistral, etc.), el numero de capas, las dimensiones ocultas ni el mecanismo de atencion.

Tampoco se documentan los datos de entrenamiento: numero de tokens, composicion del corpus, si hubo ajuste fino supervisado, RLHF o DPO, ni si el modelo fue destilado o entrenado desde cero. La unica informacion tecnica concreta es la relativa a la cuantizacion: la model card indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que sugiere una conversion desde pesos en formato Hugging Face mediante la herramienta de cuantizacion de mradermacher, con cuantizacion de tensores de salida. No se detalla ninguna innovacion arquitectonica (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion y reescritura de texto en prosa: el nombre del modelo sugiere especializacion en reescritura, parafraseo y mejora de estilo, aunque no se documenta formalmente.
- Generacion de texto general: al ser un modelo de 4B, cabe esperar capacidades basicas de generacion, resumen y transformacion de texto, sin confirmacion oficial.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se especifican idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Reescritura y parafraseo local de textos: el modelo puede ejecutarse con llama.cpp u Ollama en un portatil o equipo de sobremesa para reformular parrafos, mejorar estilo o adaptar el registro de un texto sin enviar datos a la nube, gracias a su tamano de 4B y a las cuantizaciones Q4_K_M e IQ4_XS.
- Edicion de borradores en herramientas de escritura: integrable en un editor de texto o plugin que llame al modelo via API local (por ejemplo, con llama.cpp server) para sugerir reescrituras de frases seleccionadas, con latencia baja en hardware de consumo.
- Preprocesado de corpus para investigacion: uso como paso de normalizacion o reescritura de textos en pipelines de NLP donde se requiera un modelo pequeno y ejecutable en CPU.
- Prototipado de aplicaciones de escritura asistida: al ser un GGUF de 4B, permite iterar rapidamente en demos y pruebas de concepto de asistentes de redaccion sin coste de API.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente, es adecuado para reescribir documentos sensibles (informes internos, comunicaciones) sin salida de datos.
- Experimentacion con cuantizaciones: util para comparar la calidad de distintas cuantizaciones (Q2_K frente a Q8_0) sobre una misma tarea de reescritura y medir la degradacion en un modelo pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: orientativamente, un modelo de 4B en GGUF ocupa aproximadamente 2,5-3 GB en Q4_K_M, 1,5-2 GB en Q2_K, 4,5-5 GB en Q8_0 y unos 8 GB en F16 (estimaciones por tamano, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM puede ejecutar las cuantizaciones Q4 y Q5; para Q8_0 se recomienda 8-10 GB. Una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 permiten ejecutar todas las variantes con holgura.
- Cabe en GPU de consumo: si, en la mayoria de GPU modernas con 6 GB o mas para cuantizaciones Q4/Q5; las variantes Q2_K y Q3 pueden ejecutarse incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. No se confirma soporte en vLLM o TGI para estas cuantizaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan una comparativa rigurosa. A modo orientativo por categoria (modelos de ~4B ejecutables en local), podria compararse con alternativas como Qwen2.5-3B, Llama-3.2-3B o Phi-3.5-mini, pero no hay informacion publicada que permita establecer diferencias de calidad, contexto o licencia frente a este modelo.

| Modelo | Parametros | Contexto | Licencia | Formato local |
|---|---|---|---|---|
| prose-rewriter-4b-v2.6 (este) | ~4B | no disponible | no disponible | GGUF |
| Qwen2.5-3B | 3B | 32K (segun documentacion publica del modelo) | Apache 2.0 | GGUF, safetensors |
| Llama-3.2-3B | 3B | 128K (segun documentacion publica del modelo) | Llama 3.2 Community License | GGUF, safetensors |
| Phi-3.5-mini | 3,8B | 128K (segun documentacion publica del modelo) | MIT | GGUF, safetensors |

Los datos de los modelos comparativos provienen de su documentacion publica habitual; no se ha verificado su correspondencia exacta con la version aqui citada.

## Limitaciones y advertencias

- Ausencia total de documentacion: no se especifican arquitectura, datos de entrenamiento, idiomas ni evaluaciones, lo que impide valorar su calidad y adecuacion para produccion.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible consultar la licencia del modelo base `chartreuse-verte/prose-rewriter-4b-v2.6` antes de cualquier despliegue.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; no hay evaluaciones que lo cuantifiquen.
- Sesgos: no documentados; al desconocerse el corpus de entrenamiento no se pueden evaluar sesgos de genero, idioma o dominio.
- Limitaciones de contexto e idioma: se desconocen la ventana de contexto y los idiomas soportados; el nombre sugiere un enfoque en prosa, posiblemente en un unico idioma, pero no se confirma.
- Modelo pequeno y especializado: es probable que tenga un rendimiento limitado en tareas de razonamiento complejo, codigo o matematicas, y que no sea adecuado como modelo generalista.
- Cuantizaciones agresivas: las variantes Q2_K y Q3_K pueden degradar notablemente la calidad en un modelo de 4B; se recomienda validar Q4_K_M o superior antes de usar cuantizaciones mas bajas en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/prose-rewriter-4b-v2.6-GGUF
- Modelo base: https://huggingface.co/chartreuse-verte/prose-rewriter-4b-v2.6
