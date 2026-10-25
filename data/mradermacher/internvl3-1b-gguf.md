# mradermacher/InternVL3-1B-GGUF

## Resumen

`mradermacher/InternVL3-1B-GGUF` es un conjunto de cuantizaciones estáticas en formato GGUF del modelo multimodal `OpenGVLab/InternVL3-1B`, publicadas por el usuario mradermacher (nethype GmbH) el 12 de mayo de 2025. No se trata de un modelo entrenado desde cero, sino de una conversión de los pesos originales a GGUF para permitir inferencia local con llama.cpp y herramientas compatibles, incluyendo los ficheros `mmproj` necesarios para procesar imágenes.

El modelo base pertenece a la familia InternVL3 de OpenGVLab (Shanghai AI Laboratory), orientada a tareas de visión-lenguaje: descripción de imágenes, respuesta a preguntas visuales, OCR y razonamiento sobre documentos. El repositorio cuantizado incluye 13 variantes de pesos (desde Q2_K hasta f16) con tamaños de 0,5 GB a 1,4 GB, más dos ficheros de proyección multimodal (`mmproj-Q8_0` de 0,4 GB y `mmproj-f16` de 0,7 GB).

Su relevancia práctica es que reduce un VLM a un tamaño desplegable en hardware muy modesto (CPU o GPU de gama baja), lo que habilita prototipos de visión artificial offline sin depender de APIs. El repositorio acumula 288 descargas y 1 like en el momento de la consulta, y su utilidad principal es la conveniencia del empaquetado más que una aportación técnica propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No detallada en la model card del cuantizador; el modelo base es un VLM de la familia InternVL3 (codificador visual + modelo de lenguaje). El campo `license_name: qwen` apunta a un componente de lenguaje derivado de Qwen |
| Parámetros totales | 629.697.920 (dato real de safetensors del modelo base); el nombre comercial del modelo es "1B" |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyección multimodal en mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | Multilingüe (etiqueta `multilingual`, sin listado de idiomas en la información disponible) |
| Licencia | Apache 2.0 según la etiqueta del repositorio, pero `license_name: qwen` y `license_link` remiten a la licencia de Qwen2.5-72B-Instruct; la información es contradictoria (ver limitaciones) |
| Formato de pesos | GGUF (bloques K-quant e I-quant); el modelo base se distribuye en safetensors |
| Dataset declarado | OpenGVLab/MMPR-v1.2 |
| Librería | transformers (modelo base); GGUF para llama.cpp |
| Tamaño del repositorio | 7,7 GB |

## Arquitectura y entrenamiento

La model card del repositorio cuantizado no describe la arquitectura interna ni el proceso de entrenamiento; únicamente indica que se trata de "static quants" del modelo `OpenGVLab/InternVL3-1B` y que la conversión se realizó con `convert_type: hf` y `quantize_version: 2`. No se especifican número de tokens de entrenamiento, composición del dataset (más allá de la referencia a MMPR-v1.2), ni si hubo fases de RLHF o DPO.

Los metadatos permiten inferir parcialmente la composición del modelo base: la etiqueta `custom_code` implica que requiere `trust_remote_code=True` al cargarse con transformers, y la etiqueta `internvl` junto con los ficheros `mmproj` confirman una arquitectura multimodal con un proyector que alinea las representaciones del codificador visual con el espacio del modelo de lenguaje. El campo `license_name: qwen` y el enlace a la licencia de Qwen2.5-72B-Instruct sugieren que el componente lingüístico procede de la familia Qwen2.5. Estos detalles no están confirmados explícitamente por el autor del cuantizado.

## Capacidades

- Procesamiento de imágenes: los ficheros `mmproj` habilitan entrada visual (la capacidad concreta depende del modelo base InternVL3-1B).
- Generación de texto conversacional: el repositorio está etiquetado como `conversational`.
- Soporte multilingüe declarado mediante la etiqueta `multilingual`, sin desglose de idiomas.
- Respuesta a preguntas sobre imágenes (VQA) y descripción de contenido visual, por la naturaleza del modelo base.
- Ejecución local en CPU o GPU de gama baja gracias a las cuantizaciones de 0,5-1,4 GB.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el repositorio puede servirse desde Inference Endpoints.
- No hay información disponible sobre tool calling, function calling, modo de razonamiento explícito, soporte de audio o capacidades de agente.

## Casos de uso

- Digitalización de documentos con OCR en local: el modelo puede extraer texto de facturas, albaranes o formularios escaneados ejecutándose en una máquina sin GPU dedicada, usando Q4_K_M (0,6 GB) más el proyector mmproj-Q8_0 (0,4 GB).
- Etiquetado previo de datasets de imagen: generar descripciones automáticas para preanotar corpus y revisar manualmente después, reduciendo el coste frente al etiquetado desde cero.
- Asistentes de accesibilidad offline: describir el contenido de una imagen capturada por el usuario en aplicaciones de escritorio o móviles sin enviar datos a un servicio externo.
- Verificación visual en entornos industriales o de retail: comprobar si un estante está repuesto o si un producto presenta un defecto, desplegando el modelo en un dispositivo perimetral con pocos recursos.
- Moderación de contenido preliminar: clasificar imágenes subidas por usuarios en un primer filtro automatizado, derivando los casos dudosos a un modelo mayor o a revisión humana.
- Prototipado e investigación en robótica de bajo coste: integrar el modelo en un bucle percepción-acción sobre Raspberry Pi o mini-PC, donde el presupuesto de memoria es de pocos gigabytes.
- Pruebas de concepto de pipelines multimodales: validar la lógica de una aplicación con visión antes de migrar a una instancia mayor del mismo modelo o a un despliegue con vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del cuantizador no incluye métricas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra tarea, y la búsqueda web realizada no devolvió resultados relacionados con el modelo (los enlaces recuperados corresponden a la aplicación de escultura 3D Nomad Sculpt y no guardan relación).

## Requisitos de hardware

- VRAM estimada para inferencia (pesos, sin contar caché KV): Q2_K a IQ4_XS en torno a 0,5 GB; Q4_K_S y Q4_K_M en torno a 0,6 GB; Q5_K_* en torno a 0,6 GB; Q6_K en torno a 0,7 GB; Q8_0 en torno a 0,8 GB; f16 en torno a 1,4 GB. A ello hay que sumar el proyector multimodal: 0,4 GB (mmproj-Q8_0) o 0,7 GB (mmproj-f16).
- Presupuesto total realista: aproximadamente 1,5-2,5 GB con Q4_K_M + mmproj-Q8_0 incluyendo caché KV y overhead del runtime, en función de la longitud de contexto configurada; en torno a 3 GB con f16.
- Cabe en cualquier GPU de consumo con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, RTX 4090) y también en CPU, al ser un modelo de menos de 1 GB de pesos.
- GPU de datacenter (A100, H100) no aportan ventaja significativa por tamaño; el cuello de botella sería el codificador visual y el preprocesado de imagen.
- Opciones de despliegue: llama.cpp (compilación con soporte multimodal para cargar `mmproj`), servidores compatibles con GGUF como llama-server, LM Studio y Ollama (verificando que la versión soporte proyector multimodal); con transformers se puede usar el modelo base, no los GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo de preprocesado de imagen.
- La variante con cuantización ponderada por imatrix está publicada aparte en `mradermacher/InternVL3-1B-i1-GGUF` y suele ofrecer mejor calidad por tamaño según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/InternVL3-1B-GGUF (este repo) | 629.697.920 (según safetensors) | No disponible | GGUF (12 quants + 2 mmproj) | Apache 2.0 / qwen (contradictorio) | Público en HuggingFace, 288 descargas |
| OpenGVLab/InternVL3-1B (modelo base) | 629.697.920 | No disponible | safetensors | Apache 2.0 | Público en HuggingFace |
| mradermacher/InternVL3-1B-i1-GGUF | Los mismos que el base | No disponible | GGUF con cuantización imatrix | Apache 2.0 / qwen | Público en HuggingFace |

No se dispone de información en la documentación proporcionada sobre otras alternativas multimodales de tamaño similar (por ejemplo, variantes pequeñas de Qwen-VL, SmolVLM o PaliGemma), por lo que no se incluyen datos comparativos de rendimiento, contexto ni licencia que no puedan verificarse.

## Limitaciones y advertencias

- Ambigüedad de licencia: las etiquetas declaran `license: apache-2.0`, pero también `license_name: qwen` con enlace a la licencia de Qwen2.5-72B-Instruct. Antes de un uso comercial es imprescindible verificar la licencia efectiva del modelo base con OpenGVLab.
- No hay benchmarks publicados: no es posible estimar la calidad relativa frente a otros VLM sin evaluarla en el caso de uso concreto.
- Riesgo de alucinación: como cualquier modelo generativo de 1B, puede inventar contenido sobre imágenes ambiguas o documentos con texto poco legible; se recomienda validación humana en flujos críticos.
- Longitud de contexto desconocida: no se puede planificar el uso con documentos largos o conversaciones multi-turno extensas sin medirla empíricamente.
- La ventana de contexto efectiva en llama.cpp depende de la configuración manual (`n_ctx`), no solo del modelo.
- El modelo base requiere `trust_remote_code=True` en transformers, lo que implica ejecutar código del repositorio; conviene revisarlo en entornos con requisitos de seguridad.
- Los GGUF multimodales necesitan cargar también el fichero `mmproj`; usar solo el `.gguf` principal deja el modelo sin capacidad visual.
- El tamaño reducido (menos de 1B de parámetros) limita el razonamiento complejo, las matemáticas y la fidelidad en OCR denso.
- No hay información sobre sesgos demográficos, culturales o lingüísticos del modelo base.
- Las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S) degradan la calidad de forma notable; el autor recomienda explícitamente Q4_K_S o Q4_K_M.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/InternVL3-1B-GGUF
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3-1B
- Variante con cuantización imatrix: https://huggingface.co/mradermacher/InternVL3-1B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#InternVL3-1B-GGUF
- Licencia referenciada en los metadatos: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct/blob/main/LICENSE
- Dataset declarado: https://huggingface.co/datasets/OpenGVLab/MMPR-v1.2
- Guía de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Nota: la búsqueda web realizada no devolvió ningún enlace relacionado con InternVL3; los resultados obtenidos trataban sobre Nomad Sculpt y se han descartado por no ser pertinentes.
