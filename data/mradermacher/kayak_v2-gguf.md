# mradermacher/kayak_v2-GGUF

## Resumen

kayak_v2-GGUF es la versión cuantizada en formato GGUF del modelo kayak_v2, publicado por el usuario mradermacher a partir del checkpoint original de ayushadarsh7. Se trata de un modelo multimodal de tipo image-text-to-text construido sobre la arquitectura Qwen3-VL (según las etiquetas del repositorio) y especializado en *visual grounding* y *GUI grounding*, es decir, en localizar elementos concretos dentro de una imagen y, de forma específica, dentro de capturas de interfaces gráficas de usuario. Con 4.022.468.096 parámetros totales según los safetensors del modelo base, se sitúa en la gama de 4B, un tamaño manejable en hardware de consumo.

El interés práctico de esta publicación es doble. Por un lado, el modelo original se distribuye con fine-tuning completo sobre una base Qwen3-VL, lo que lo orienta a tareas de agentes que operan sobre pantallas: identificar botones, campos de texto, iconos o regiones de una captura y devolver sus coordenadas. Por otro, esta versión GGUF permite ejecutar el modelo en local con llama.cpp y derivados, sin necesidad de GPU de datacenter, algo relevante para pipelines de automatización de escritorio, testing de interfaces y prototipado de agentes de navegador.

La ficha se basa exclusivamente en la información del repositorio de HuggingFace y en la model card del cuantizador. No se han publicado resultados de benchmarks ni detalles sobre la composición del dataset de entrenamiento en la información disponible, y la búsqueda web realizada no devolvió enlaces técnicos relevantes sobre este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3-VL (según etiquetas del repo); detalles internos no disponibles |
| Parametros totales | 4.022.468.096 (4,02B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en f16 y Q8_0 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en formato transformers/safetensors |
| Tarea declarada | image-text-to-text (visión-lenguaje) |
| Especialización | visual grounding, GUI grounding |
| Metodo de ajuste | full fine-tuning sobre el modelo base |
| Tamano del repo | 37,7 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3-VL, un transformer multimodal que procesa imágenes y texto de forma conjunta y genera texto autorregresivamente. La etiqueta `qwen3_vl` en el repositorio indica que el modelo base parte de esa familia, aunque la model card no detalla la configuración exacta de capas, dimensión oculta, número de cabezas de atención ni el mecanismo de fusión visión-lenguaje empleado. El recuento de 4.022.468.096 parámetros corresponde a los safetensors del checkpoint original y, por tanto, incluye tanto el codificador visual como el modelo de lenguaje.

Según la información disponible, kayak_v2 se ha obtenido mediante *full fine-tuning* (etiqueta `full-finetuning`) del modelo base, orientado a tareas de grounding visual y de interfaz gráfica. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, modos de razonamiento explícito) más allá de las propias de la arquitectura Qwen3-VL subyacente. Los archivos GGUF de este repositorio son cuantizaciones estáticas del checkpoint original, e incluyen un fichero `mmproj` separado que contiene la proyección multimodal necesaria para procesar imágenes.

## Capacidades

- Generación de texto conversacional a partir de entradas multimodales (imagen + texto), con pipeline `image-text-to-text`.
- *Visual grounding*: localización de objetos o regiones descritas en lenguaje natural dentro de una imagen, devolviendo presumiblemente coordenadas o cajas delimitadoras.
- *GUI grounding*: identificación de elementos de interfaz (botones, campos, iconos, pestañas, menús) en capturas de pantalla, orientada a agentes que automatizan interacción con aplicaciones.
- Comprensión de imágenes en general: descripción de contenido visual y respuesta a preguntas sobre la imagen (capacidad heredada de la base Qwen3-VL).
- Conversación multi-turno con historial, según la etiqueta `conversational`.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte explícito de agentes o razonamiento multi-paso: no disponible; la orientación a agentes se infiere del dominio GUI grounding, no de documentación.
- Capacidades multilingües: limitadas al inglés según el campo `language`; no se declaran otros idiomas.
- Modo *thinking*: no disponible en la información proporcionada.
- Audio o vídeo: no disponible.

## Casos de uso

- Agentes de automatización de interfaz (RPA): dado un objetivo como "pulsa el botón de exportar", el modelo localiza el elemento correspondiente en la captura de pantalla y devuelve su posición para que el motor de automatización ejecute el clic. Su especialización en GUI grounding lo hace adecuado frente a modelos de visión genéricos.
- Testing automatizado de aplicaciones de escritorio y web: integrado en una suite de pruebas, permite verificar que los elementos de la interfaz aparecen en la posición esperada o que un flujo de pantallas se ha completado correctamente, comparando las coordenadas detectadas con las esperadas.
- Agentes de navegador: al recibir la captura del viewport, el modelo identifica enlaces, campos de formulario y controles, lo que permite construir bucles de percepción-acción sobre un navegador headless sin depender de selectores DOM frágiles.
- Extracción de datos de capturas y documentos con estructura visual: localización de campos concretos (importes, fechas, totales) en imágenes de facturas o paneles de control, aprovechando la capacidad de grounding para acotar la región antes de una fase de OCR o de lectura.
- Asistencia a personas con discapacidad visual: descripción de una pantalla y localización de elementos interactivos para verbalizar "dónde está" cada control, con la ventaja de ejecutarse en local y no enviar capturas a servicios externos.
- Prototipado en estaciones de trabajo sin GPU de datacenter: al disponer de cuantizaciones de 1,8 a 4,4 GB, es posible iterar sobre un pipeline multimodal completo en un portátil con GPU de consumo o incluso en CPU, antes de escalar al modelo sin cuantizar.
- Enriquecimiento de datasets de grounding: uso del modelo para preetiquetar cajas delimitadoras sobre capturas y revisar manualmente solo los casos dudosos, reduciendo el coste de anotación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación propia a partir del tamaño de los ficheros, no confirmada por el autor):
  - Q4_K_M (2,6 GB) + mmproj Q8_0 (0,6 GB): en torno a 3,5-4 GB de VRAM considerando contexto y buffers.
  - Q5_K_M (3,0 GB) + mmproj Q8_0 (0,6 GB): en torno a 4-4,5 GB.
  - Q8_0 (4,4 GB) + mmproj f16 (0,9 GB): en torno a 6-6,5 GB.
  - f16 (8,2 GB) + mmproj f16 (0,9 GB): en torno a 10-11 GB.
- GPU recomendadas: cualquier GPU con 6-8 GB o más para cuantizaciones Q4/Q5; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para Q8_0 y f16. Para despliegues con concurrencia, A100 o H100 permiten servir varias instancias del modelo a la vez.
- Cabe en GPU de consumo: sí. Las cuantizaciones Q4_K_S, Q4_K_M, IQ4_XS y Q3_K encajan en GPUs de 6-8 GB; las versiones Q8_0 y f16 requieren 8-12 GB.
- Opciones de despliegue: llama.cpp y sus derivados (llama-mtmd/llama-server con soporte multimodal y el fichero `mmproj`), Ollama si se importa el GGUF con su proyección, y LM Studio. Para el checkpoint original en transformers, vLLM o TGI si la arquitectura Qwen3-VL está soportada por la versión correspondiente (no confirmado en la información disponible).
- Latencia y throughput: no disponibles. Al ser un modelo de 4B, se espera una latencia por token baja en GPU de consumo, pero no hay mediciones publicadas en la información proporcionada.
- Nota: el campo `mmproj` es imprescindible para el procesamiento de imágenes; sin él, el GGUF solo funciona como modelo de texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| kayak_v2-GGUF (este repo) | 4,02B | No disponible | Visual grounding y GUI grounding, fine-tuning completo | Apache 2.0 | GGUF |
| kayak_v2 (original, ayushadarsh7) | 4,02B | No disponible | Idem, sin cuantizar | Apache 2.0 | Transformers / safetensors |
| Qwen3-VL (modelo base de la familia) | No disponible en la información | No disponible | Visión-lenguaje generalista | No disponible en la información | No disponible |
| Qwen2.5-VL-3B-Instruct | No disponible en la información | No disponible | Visión-lenguaje generalista | No disponible en la información | No disponible |

No se dispone de datos verificados de rendimiento, contexto ni licencia de las alternativas dentro de la información proporcionada; las filas correspondientes se marcan como no disponibles para no inferir cifras. La comparación relevante y comprobable es entre este repositorio GGUF y el checkpoint original: mismo número de parámetros y misma licencia, con la diferencia de formato y de que el GGUF incorpora cuantizaciones de 1,8 a 8,2 GB y un fichero `mmproj` separado.

## Limitaciones y advertencias

- Idioma: el modelo declara únicamente inglés (`language: en`). El rendimiento en castellano no está documentado y previsiblemente será inferior; conviene evaluarlo antes de usarlo en producción en español.
- Ausencia de benchmarks: no hay métricas publicadas de precisión de grounding (por ejemplo, exactitud de clic o IoU de cajas) en la información disponible, por lo que no es posible comparar su calidad objetivamente con alternativas.
- Precisión de coordenadas: en tareas de grounding, los modelos de este tamaño pueden devolver posiciones aproximadas o alucinar elementos inexistentes en la captura. Es necesario validar las coordenadas contra el estado real de la interfaz antes de ejecutar acciones.
- Cuantización: las versiones Q2_K, Q3_K e IQ4_XS degradan la calidad de forma notable; para grounding conviene usar Q4_K_M o superior. El autor advierte que Q3_K_M es de "menor calidad" y que f16 es "excesivo" para uso práctico.
- Dependencia del `mmproj`: usar el GGUF sin el fichero de proyección multimodal desactiva por completo la capacidad de visión.
- Trazabilidad: este repositorio es una cuantización de la comunidad (mradermacher), no una publicación oficial del autor del modelo. No se documenta el proceso de validación de las cuantizaciones ni se publican evaluaciones comparativas frente al original.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero conviene conservar los avisos de atribución y verificar la licencia del checkpoint base (`ayushadarsh7/kayak_v2`), que se declara igualmente Apache 2.0.
- Datos de entrenamiento desconocidos: sin información sobre la procedencia de las imágenes o capturas usadas en el fine-tuning, no es posible evaluar sesgos de dominio ni riesgos de sobreajuste a interfaces concretas.
- Metadatos atípicos: las fechas del repositorio (creación y actualización en octubre de 2026) y el contador de descargas a cero indican un modelo muy reciente y sin validación por parte de la comunidad.
- Sin datos de contexto: al no conocerse la ventana de contexto, no se puede garantizar el manejo de capturas de alta resolución con muchas regiones o de conversaciones largas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/kayak_v2-GGUF
- Modelo base (checkpoint original): https://huggingface.co/ayushadarsh7/kayak_v2
- Página de descargas del cuantizador: https://hf.tst.eu/model#kayak_v2-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafo de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png

Nota: la búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo; los enlaces anteriores proceden del repositorio de HuggingFace y de la model card del cuantizador.
