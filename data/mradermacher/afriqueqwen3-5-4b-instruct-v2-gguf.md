# mradermacher/AfriqueQwen3.5-4B-Instruct-v2-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo McGill-NLP/AfriqueQwen3.5-4B-Instruct-v2, generadas por el usuario mradermacher (nethype GmbH). No se trata de un modelo nuevo, sino de una redistribución en formato GGUF de un modelo instruct de aproximadamente 4.000 millones de parámetros, pensada para su ejecución en llama.cpp y herramientas compatibles. El identificador del modelo sugiere una base de la familia Qwen3.5 afinada por McGill-NLP, aunque la model card no confirma ni la arquitectura ni el origen de los datos de entrenamiento.

La relevancia de este repositorio es puramente práctica: los pesos en GGUF con cuantizaciones que van de Q2_K a f16 permiten desplegar un modelo de 4B en hardware de consumo, sin GPU dedicada o con GPU de gama media. Incluye además dos ficheros `mmproj` (Q8_0 y f16) etiquetados como "multi-modal supplement", un indicio de que el modelo base incorpora una torre de visión, aunque la model card no documenta esa capacidad de forma explícita.

El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no incluye resultados de benchmarks, detalles de contexto ni especificaciones de arquitectura. Cualquier evaluación de rendimiento debe hacerse, por tanto, de forma empírica sobre el modelo base original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (el identificador sugiere base Qwen3.5; no confirmado en la model card) |
| Parámetros totales | ≈4.000 millones (deducido del identificador "4B"; no declarado explícitamente) |
| Parámetros activos | No disponible (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | en (inglés), según los metadatos del repositorio |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (más suplementos multimodales `mmproj-f16` y `mmproj-Q8_0` en GGUF) |
| Modelo base | McGill-NLP/AfriqueQwen3.5-4B-Instruct-v2 |
| Cuantizado por | mradermacher (nethype GmbH) |
| Librería declarada | transformers |
| Etiquetas relevantes | gguf, endpoints_compatible, region:us |
| Fecha de creación | 2026-09-19 |
| Última actualización | 2026-09-19 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay información en la model card sobre la arquitectura interna del modelo base (tipo de transformer, atención, capas, uso de MoE o de mecanismos híbridos), ni sobre el número de tokens de entrenamiento, la composición del dataset o las técnicas de alineación empleadas (RLHF, DPO, etc.). Tampoco se documenta el proceso de ajuste fino que dio lugar a la variante "Instruct-v2" ni el papel del prefijo "Afrique" en el nombre.

Lo único verificable en este repositorio es el proceso de cuantización: se ofrecen cuantizaciones estáticas (no ponderadas ni con imatrix, según indica el propio autor) y se advierte de que las cuantizaciones ponderadas o imatrix podrían no llegar a publicarse. La conversión se realizó desde el formato de Hugging Face (`convert_type: hf`). La presencia de ficheros `mmproj` de tipo "multi-modal supplement" es el único indicio de una posible torre de visión en el modelo base, pero no se especifica su arquitectura, resolución de entrada ni datos de entrenamiento multimodal.

## Capacidades

- Generación de texto e instrucciones en inglés: el repositorio declara únicamente el idioma `en` en sus metadatos.
- Formato conversacional instruct: el sufijo "Instruct-v2" del modelo base indica ajuste para seguir instrucciones.
- Ejecución local en CPU y GPU mediante GGUF: doce variantes de cuantización permiten ajustar el equilibrio entre calidad y consumo de memoria.
- Posible soporte multimodal (visión): los ficheros `AfriqueQwen3.5-4B-Instruct-v2.mmproj-f16.gguf` y `mmproj-Q8_0.gguf` están etiquetados como suplemento multimodal. No confirmado en la documentación.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`.
- Soporte de tool calling o function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponibles.
- Modo de razonamiento explícito (thinking): no disponible.
- Capacidades multilingües más allá del inglés: no disponibles (a pesar del prefijo "Afrique" del nombre, los metadatos solo declaran `en`).
- Capacidades de audio: no disponibles.

## Casos de uso

- Inferencia local en portátil sin GPU dedicada: con las cuantizaciones Q3_K_M o Q4_K_M, un modelo de 4B puede ejecutarse enteramente en CPU mediante llama.cpp, lo que permite disponer de un asistente de texto en inglés sin conexión ni coste por token.
- Asistente de redacción en inglés en aplicaciones de escritorio: integrado con `llama-cpp-python` o LM Studio, el modelo puede gestionar tareas de reescritura, resumen y generación de borradores en inglés con una huella de memoria inferior a 4 GB en cuantización Q5_K_M.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece doce variantes del mismo modelo, lo que permite medir empíricamente la degradación de perplejidad y calidad entre Q2_K y f16 sobre un conjunto de prompts propio, sin necesidad de descargar varios modelos distintos.
- Prototipado rápido en pipelines de CI: al ser un GGUF pequeño (por debajo de 3 GB en Q4_K_M) se puede cachear en imágenes de contenedor y usarse para pruebas de integración de un sistema de generación de texto sin depender de APIs externas.
- Despliegue en dispositivos de borde: la variante Q2_K o Q3_K_S permite ejecutar el modelo en equipos con 4-6 GB de RAM (mini-PC, SBC de gama alta), útil para tareas de clasificación, extracción o generación corta en inglés.
- Experimentación académica con modelos africanos o de bajo资源: dado el nombre "AfriqueQwen", el repositorio puede servir para reproducir o inspeccionar el comportamiento del modelo base de McGill-NLP en entornos con recursos limitados, siempre que se verifique antes el alcance real de su cobertura lingüística.
- Pruebas de capacidades multimodales: si se confirma que el modelo base incorpora visión, los ficheros `mmproj` permiten cargarlo en llama.cpp con soporte de imagen; conviene validar antes esta capacidad, ya que no está documentada.
- Generación de texto a escala moderada con GPU de consumo: en una RTX 3060 de 12 GB se pueden servir varias instancias del modelo en Q4_K_M o Q5_K_M para tareas de baja concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y tampoco se han recuperado datos de benchmarks del modelo base en la búsqueda web realizada.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (estimación propia a partir de un modelo de ≈4.000 millones de parámetros; no verificada en la documentación):
  - Q2_K: ≈1,8-2,2 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ≈2,0-2,6 GB
  - IQ4_XS / Q4_K_S / Q4_K_M: ≈2,4-3,0 GB
  - Q5_K_S / Q5_K_M: ≈2,9-3,5 GB
  - Q6_K: ≈3,3-3,9 GB
  - Q8_0: ≈4,3-4,7 GB
  - f16: ≈8,1-8,6 GB
  - A estas cifras hay que sumar el caché KV, cuyo tamaño depende de la longitud de contexto real del modelo (no disponible) y del número de secuencias simultáneas.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM para cuantizaciones Q4_K_M y superiores (RTX 3060, RTX 4060, RTX 2070). Para f16 y para servir varias peticiones concurrentes, se recomienda RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí. Todas las cuantizaciones hasta Q5_K_M deberían caber en una GPU de 8 GB; Q8_0 requiere 8 GB o más; f16 requiere 10-12 GB o bien descarga parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, llama-cpp-python, text-generation-webui y servidores compatibles con GGUF. El soporte de GGUF en vLLM y TGI es más limitado que en llama.cpp y debe validarse en la versión concreta.
- Suplementos multimodales: los ficheros `mmproj-f16.gguf` y `mmproj-Q8_0.gguf` ocupan 0,1 GB cada uno y se cargan junto al modelo en llama.cpp si se activa el soporte de visión.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks, contexto o rendimiento del modelo base AfriqueQwen3.5-4B-Instruct-v2, por lo que no es posible establecer una comparación cuantitativa fiable con alternativas de la misma categoría. La tabla siguiente recoge únicamente los datos confirmados en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Formato | Datos comparativos |
|---|---|---|---|---|---|
| AfriqueQwen3.5-4B-Instruct-v2-GGUF (este repositorio) | ≈4B (según identificador) | No disponible | CC-BY-4.0 | GGUF + mmproj | No disponibles |
| McGill-NLP/AfriqueQwen3.5-4B-Instruct-v2 (modelo base) | ≈4B (según identificador) | No disponible | CC-BY-4.0 | Safetensors / transformers | No disponibles |
| Alternativas del segmento ~4B (por ejemplo, Qwen3-4B, Llama 3.2 3B, Gemma 3 4B) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponibles |

Para una comparación válida habría que consultar las model cards de los modelos base candidatos y ejecutar una evaluación homogénea sobre el mismo conjunto de pruebas. Este repositorio, al ser una cuantización, no es comparable en calidad con los pesos originales en f16 o bfloat16, sino solo en coste de memoria y velocidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas publicadas que respalden la calidad del modelo en ninguna tarea.
- Idiomas: los metadatos declaran únicamente inglés (`en`), pese al prefijo "Afrique" del nombre. No debe asumirse cobertura de lenguas africanas sin verificarla.
- Riesgo de alucinación: inherente a los modelos de 4B y no evaluado en este repositorio.
- Sesgos: no documentados. Al no describirse el dataset de entrenamiento, no es posible conocer los sesgos potenciales del modelo base.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar despliegues con ventanas largas o caché KV dimensionado.
- Cuantizaciones de baja precisión: Q2_K y Q3_K_S implican pérdidas de calidad notables. El propio autor advierte de que las cuantizaciones ponderadas o con imatrix ("weighted/imatrix") no están disponibles en el momento de la publicación.
- Multimodalidad no confirmada: los ficheros `mmproj` sugieren capacidad de visión, pero la model card no la documenta ni especifica resolución, formato de imagen o calidad esperada.
- Licencia CC-BY-4.0: permite uso comercial, incluida la redistribución, siempre que se atribuya la autoría. Conviene revisar también la licencia del modelo base en su repositorio original, ya que los términos pueden variar respecto a los del repositorio cuantizado.
- Madurez del repositorio: 0 descargas y 0 likes, publicado y actualizado el mismo día. No hay comunidad, issues ni validación externa que permitan detectar errores de conversión.
- Verificación recomendada en producción: antes de usar el modelo, conviene comprobar que el tokenizador, la plantilla de chat y el prompt de sistema del modelo base se reproducen correctamente en llama.cpp, algo que la model card no detalla.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/mradermacher/AfriqueQwen3.5-4B-Instruct-v2-GGUF
- Modelo base: https://huggingface.co/McGill-NLP/AfriqueQwen3.5-4B-Instruct-v2
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#AfriqueQwen3.5-4B-Instruct-v2-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Fichero multimodal `mmproj-Q8_0`: https://huggingface.co/mradermacher/AfriqueQwen3.5-4B-Instruct-v2-GGUF/resolve/main/AfriqueQwen3.5-4B-Instruct-v2.mmproj-Q8_0.gguf
- Fichero multimodal `mmproj-f16`: https://huggingface.co/mradermacher/AfriqueQwen3.5-4B-Instruct-v2-GGUF/resolve/main/AfriqueQwen3.5-4B-Instruct-v2.mmproj-f16.gguf
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de la cuantización: https://www.nethype.de/
