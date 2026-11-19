# mradermacher/NorthCUA-Nano-GGUF

## Resumen

NorthCUA-Nano es un modelo multimodal orientado a "computer use" (uso de ordenador), es decir, diseñado para interpretar capturas de pantalla y generar acciones sobre interfaces gráficas. El modelo original lo desarrolla beipo-ai bajo el identificador beipo-ai/NorthCUA-Nano, y la ficha que nos ocupa es la versión cuantizada en formato GGUF publicada por mradermacher, un conocido generador de cuantizaciones de la comunidad.

El modelo base se apoya en la arquitectura Qwen3.5 (según la etiqueta `qwen3_5` de la model card) y cuenta con 8.953.803.264 parámetros totales según los pesos en safetensors del repositorio. Es, por tanto, un modelo de aproximadamente 9.000 millones de parámetros, tamaño que lo sitúa en la franja de modelos "nano/pequeños" capaces de ejecutarse en hardware de consumo cuando se cuantizan adecuadamente.

La relevancia de esta publicación radica en que mradermacher ofrece el modelo en múltiples niveles de cuantización GGUF (desde Q2_K de 3,9 GB hasta f16 de 18 GB), además de los ficheros mmproj necesarios para el componente multimodal. Esto permite desplegar un modelo de computer use en entornos con llama.cpp u Ollama, algo poco habitual en esta categoría de modelos de agentes visuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3.5 (según etiqueta `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 8.953.803.264 (~8,95 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | inglés (etiqueta `en` en la model card); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5`, que sugiere que el modelo base se construye sobre la familia Qwen3.5. Se trata de un modelo multimodal, ya que el repositorio incluye ficheros `mmproj` (proyección multimodal) necesarios para procesar entradas de imagen junto con texto. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación.

Tampoco se documentan innovaciones técnicas concretas como decodificación especulativa, atención lineal o mecanismos híbridos. La model card de la versión GGUF es únicamente una ficha de cuantización generada automáticamente por mradermacher, por lo que los detalles de entrenamiento deberían consultarse en la ficha del modelo original (beipo-ai/NorthCUA-Nano), que no forma parte de la información proporcionada.

## Capacidades

- Procesamiento multimodal: acepta imágenes (capturas de pantalla) junto con texto, gracias al componente mmproj incluido en las cuantizaciones.
- Orientación a computer use: el modelo está etiquetado como `computer-use`, lo que indica que está pensado para interpretar interfaces gráficas y generar acciones sobre ellas.
- Conversación multi-turno: la etiqueta `conversational` sugiere soporte para diálogo.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse mediante infraestructura de endpoints compatible.
- Generación de texto: capacidad base implícita en un modelo transformer de este tipo (no se detallan capacidades específicas de razonamiento, código o matemáticas en la información disponible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no documentado explícitamente, aunque la naturaleza de computer use implica interacción secuencial con entornos.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`; no se confirma soporte de otros idiomas.
- Modo "thinking", visión, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Automatización de tareas de escritorio: el modelo puede recibir capturas de pantalla de un entorno de escritorio y proponer acciones (clics, escritura, navegación) para completar tareas repetitivas, aprovechando su naturaleza de computer use.
- Agentes de navegación web: integrado en un bucle de agente, el modelo interpreta el estado visual de una página y genera la siguiente acción, lo que permite automatizar flujos de formularios o extracción de datos.
- Testing de interfaces gráficas: un pipeline puede usar el modelo para "leer" la pantalla de una aplicación y verificar que los elementos esperados aparecen, complementando tests de UI automatizados.
- Asistentes de soporte remoto: el modelo puede analizar capturas enviadas por un usuario y sugerir pasos concretos para resolver un problema en su interfaz, con la ventaja de ejecutarse localmente en formato GGUF.
- Despliegue en hardware de consumo: gracias a las cuantizaciones Q4_K_M (5,7 GB) o Q5_K_M (6,6 GB), es viable ejecutar el modelo en GPUs de consumo para prototipos de agentes visuales sin depender de la nube.
- Investigación en agentes multimodales: al ser Apache 2.0 y estar disponible en GGUF, sirve como base para experimentos de investigación sobre razonamiento visual y planificación de acciones en entornos controlados.
- Procesamiento por lotes de capturas: en un servidor con llama.cpp, se pueden procesar lotes de imágenes y generar descripciones o acciones asociadas para tareas de anotación o auditoría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, tamaño del fichero): Q2_K ~3,9 GB; Q3_K_S ~4,4 GB; Q3_K_M ~4,7 GB; Q3_K_L ~5,0 GB; IQ4_XS ~5,3 GB; Q4_K_S ~5,5 GB; Q4_K_M ~5,7 GB; Q5_K_S ~6,4 GB; Q5_K_M ~6,6 GB; Q6_K ~7,5 GB; Q8_0 ~9,6 GB; f16 ~18 GB. Añadir ~0,7-1,0 GB para el fichero mmproj.
- GPU recomendadas: para f16, una GPU con 24 GB o más (RTX 3090/4090, A100, H100). Para Q8_0, 12-16 GB (RTX 4070 Ti Super, RTX 4080). Para Q4_K_M, 8-10 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB).
- Cabe en GPU de consumo: sí, en cuantizaciones Q4_K_M o inferiores en GPUs de 8 GB o más; las cuantizaciones Q5/Q6 requieren 10-12 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (si se publica el manifiesto correspondiente), y servidores compatibles con endpoints (etiqueta `endpoints_compatible`). Para el componente multimodal es necesario usar llama.cpp con soporte de mmproj o un servidor compatible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NorthCUA-Nano (esta ficha) | ~8,95 mil M | no disponible | Apache 2.0 | GGUF, safetensors | Orientado a computer use, multimodal |
| beipo-ai/NorthCUA-Nano (base) | ~8,95 mil M | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos equivalentes de computer use en la información proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado principalmente en inglés, puede presentar sesgos lingüísticos y culturales.
- Riesgo de alucinación: inherente a los modelos generativos; en tareas de computer use, una acción alucinada sobre una interfaz puede provocar errores operativos, por lo que se recomienda supervisión y validación.
- Limitaciones de contexto o idioma: el idioma declarado es únicamente inglés; no se especifica la longitud de contexto, lo que impide planificar tareas que requieran ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original y de los datos de entrenamiento, no detallados aquí.
- Caveats para producción: las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente el rendimiento en tareas visuales; se recomienda Q4_K_M o superior. La model card de la versión GGUF es generada automáticamente y no documenta el comportamiento del modelo.
- El componente multimodal requiere ficheros mmproj adicionales; sin ellos, el modelo no procesará imágenes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/NorthCUA-Nano-GGUF
- Modelo base: https://huggingface.co/beipo-ai/NorthCUA-Nano
- Página de descargas del autor: https://hf.tst.eu/model#NorthCUA-Nano-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
