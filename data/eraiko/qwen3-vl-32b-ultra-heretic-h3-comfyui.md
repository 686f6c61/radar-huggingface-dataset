# eraiko/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI

## Resumen

eraiko/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI es un ajuste fino derivado de llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic, que a su vez procede del modelo multimodal Qwen3-VL-32B-Instruct de Alibaba. Se trata, por tanto, de un modelo de visión y lenguaje (image-text-to-text): recibe imágenes y texto y genera texto. Se publica bajo licencia Apache-2.0 y con pipeline declarado image-text-to-text.

El repositorio lo firma el usuario eraiko y no incluye model card descriptiva: el README se limita a una referencia al Space ggml-org/gguf-my-repo, la herramienta de conversión a GGUF de Hugging Face. No se documenta el proceso de ajuste, el dataset utilizado, la composición del entrenamiento ni ninguna evaluación. La única etiqueta de idioma declarada es inglés.

El dato más relevante es la discrepancia entre el nombre y el recuento real de parámetros: los tensores safetensors suman 25.753.095.920 parámetros (unos 25,75 mil millones), no 32 mil millones como sugiere el identificador. El repositorio ocupa 128,9 GB. En el momento de la consulta acumula 0 descargas y 0 likes, por lo que no existe validación alguna por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen3-VL (codificador visual más modelo de lenguaje); etiqueta de arquitectura `qwen3_vl`. Número de capas, dimensión oculta y configuración del vision tower: no disponible |
| Parámetros totales | 25.753.095.920 (≈25,75 mil millones), según los metadatos safetensors del repositorio |
| Parámetros activos | No aplica (no hay indicios de arquitectura MoE en la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible. El repositorio solo contiene safetensors; el autor enlaza el Space `ggml-org/gguf-my-repo` para generar versiones GGUF, pero no se especifican niveles (Q4_K_M, Q8_0, etc.) |
| Idiomas soportados | Inglés (`en`), único idioma declarado en las etiquetas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modalidad de entrada | Imagen y texto (`image-text-to-text`) |
| Modelo base | llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic |
| Autor | eraiko |
| Tamaño del repositorio | 128,9 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-19 |
| Última actualización | 2026-09-20 |
| Región declarada | us |

## Arquitectura y entrenamiento

La etiqueta `qwen3_vl` y el pipeline `image-text-to-text` sitúan al modelo en la familia Qwen3-VL: una arquitectura transformer multimodal compuesta por un codificador de visión y un modelo de lenguaje que consume los tokens visuales proyectados junto con los tokens de texto. El identificador del repositorio indica que se trata de una cadena de ajustes sucesivos: Qwen3-VL-32B-Instruct (modelo raíz) → llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic → este modelo. Los sufijos «uncensored» y «heretic» son habituales en la escena del ajuste fino para designar procesos de eliminación o atenuación de comportamientos de rechazo, pero la información disponible no confirma ni detalla qué técnica se aplicó.

No hay ningún dato publicado sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF, DPO u otras técnicas de alineación, ni sobre innovaciones técnicas concretas. El vision tower, la resolución de imagen admitida, la estrategia de decodificación y el tratamiento de vídeo son igualmente desconocidos para esta variante. Cualquier afirmación al respecto requeriría inspeccionar los archivos de configuración (`config.json`, `preprocessor_config.json`) del repositorio, que no forman parte de la información proporcionada.

## Capacidades

- Generación de texto condicionada por imagen: el pipeline declarado es `image-text-to-text`, de modo que el modelo acepta entradas multimodales y produce texto.
- Naturaleza conversacional: la etiqueta `conversational` indica que está preparado para diálogo multi-turno, presumiblemente mediante plantilla de chat de la familia Qwen.
- Descripción y análisis de imágenes en inglés: capacidades de captioning, respuesta a preguntas visuales y lectura de texto en imagen se heredan potencialmente del modelo base, pero no están documentadas ni verificadas para esta variante.
- Menor tasa de rechazo: los sufijos «uncensored» y «heretic» implican una reducción deliberada de las negativas del modelo ante peticiones que el modelo alineado original declinaría. No se cuantifica en qué grado.
- Soporte de tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Capacidades de audio o vídeo: no disponible.
- Capacidades multilingües: solo se declara inglés; no hay evidencia de soporte funcional de otros idiomas, incluido el castellano.

## Casos de uso

- Generación de texto alternativo y metadatos accesibles a escala: el modelo puede procesar lotes de imágenes y devolver descripciones textuales para integrarlas en pipelines de accesibilidad web o en gestores de activos digitales. Requiere validación previa, ya que no hay evaluación publicada de calidad de captioning.
- Extracción estructurada de documentos escaneados: al ser un modelo de imagen a texto, puede utilizarse en flujos de digitalización de facturas, formularios o informes para convertir la imagen en campos estructurados que después se validan con reglas o con un segundo modelo.
- Descripción de catálogo en comercio electrónico: generación automática de fichas de producto a partir de fotografías, con el modelo produciendo descripciones en inglés que luego pueden traducirse. El idioma declarado es exclusivamente inglés, lo que limita el uso directo en castellano.
- Asistencia técnica con capturas de pantalla: un asistente que recibe una captura de error o de interfaz y explica al usuario qué está ocurriendo. El formato conversacional y la entrada multimodal encajan con este escenario, siempre que el diálogo se mantenga en inglés.
- Investigación sobre alineación y mecanismos de rechazo: al existir una cadena de modelos (instruct, heretic y esta variante), el repositorio permite experimentos comparativos sobre cómo cambia la tasa de negativas y la calidad de respuesta tras un proceso de abliteration o ajuste similar.
- Base para ajuste fino específico de dominio: la licencia Apache-2.0 permite partir de estos pesos para entrenar un modelo especializado (por ejemplo, inspección visual industrial o análisis de imágenes médicas anonimizadas), siempre que se valide que el ajuste heretic no ha degradado las capacidades del modelo original.
- Análisis de contenido sensible para equipos de confianza y seguridad: los modelos alineados suelen rechazar la descripción detallada de material violento o explícito, lo que dificulta el etiquetado. Un modelo con los rechazos atenuados puede resultar útil en ese contexto acotado, con revisión humana obligatoria y cumplimiento normativo explícito.
- Prototipado rápido en ComfyUI: el sufijo «H3-ComfyUI» del nombre apunta a un uso previsto dentro de flujos de ComfyUI, presumiblemente mediante nodos que cargan safetensors o GGUF. No hay documentación que confirme la integración.

En todos los casos conviene recordar que el modelo no tiene evaluación publicada y que las tareas de OCR y grounding visual son especialmente propensas a errores no medidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tabla de evaluaciones (MMLU, MMMU, DocVQA, HumanEval ni ninguna otra), no hay informe técnico asociado y el modelo acumula 0 descargas, por lo que tampoco existen mediciones independientes de terceros. Tampoco se dispone de datos de latencia o throughput.

## Requisitos de hardware

Las cifras siguientes son estimaciones calculadas a partir del recuento real de parámetros (25,75 mil millones) y no proceden de ninguna medición publicada.

- Pesos en BF16/FP16: aproximadamente 51,5 GB solo para los pesos (25,75 B × 2 bytes). Con caché KV, activaciones y el coste adicional de las imágenes, conviene reservar entre 60 y 70 GB de VRAM.
- Pesos en FP8 o INT8: aproximadamente 25,75 GB de pesos; en la práctica requiere del orden de 35-45 GB de VRAM para operar con comodidad.
- Pesos en 4 bits (GGUF Q4_K_M o AWQ/GPTQ): aproximadamente 13-14 GB de pesos, lo que sitúa el modelo en el rango de 16-20 GB de VRAM en función de la longitud del contexto y de la resolución de las imágenes.
- GPU recomendadas en BF16: A100 80 GB, H100 80 GB, H200, o dos GPU de 40 GB en paralelo por tensor parallelism.
- GPU recomendadas en precisión reducida: A100 40 GB, A6000 48 GB, L40S 48 GB, L40 48 GB.
- Viabilidad en GPU de consumo: en BF16 no cabe en ninguna GPU de consumo actual. Con cuantización de 4 bits cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 5090 (32 GB); con cuantización de 8 bits el margen es muy ajustado o insuficiente en tarjetas de 24 GB.
- Almacenamiento: el repositorio ocupa 128,9 GB, un tamaño notablemente superior a lo que exigirían unos pesos BF16 (≈51,5 GB). Esto sugiere la presencia de artefactos adicionales o de pesos en mayor precisión; la composición exacta no está documentada.
- Opciones de despliegue: Transformers en PyTorch para inferencia directa; vLLM y SGLang si se confirma el soporte de `qwen3_vl`; TGI; llama.cpp, Ollama y LM Studio previa conversión a GGUF con el Space ggml-org/gguf-my-repo referenciado por el autor; nodos de ComfyUI para el flujo indicado en el nombre del repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Relación | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| eraiko/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI | Este modelo | 25,75 B (medidos) | no disponible | apache-2.0 | 0 descargas, 0 likes, sin model card |
| llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic | Modelo base directo | no disponible | no disponible | no disponible en la información proporcionada | Referenciado como `base_model`; sin datos de evaluación |
| Qwen3-VL-32B-Instruct (modelo raíz de la cadena) | Origen de la familia | denominado «32B», no verificado | no disponible | no disponible en la información proporcionada | Modelo original alineado, presumiblemente con rechazos intactos |
| Qwen2.5-VL-32B-Instruct | Generación anterior, mismo rango de tamaño | no disponible | no disponible | no disponible en la información proporcionada | Alternativa de la generación previa de la misma familia |

No se dispone de resultados de benchmarks de ninguno de estos modelos en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento. Las diferencias observables se limitan al nombre, el tamaño del repositorio y el estado de publicación.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card descriptiva, ni informe de entrenamiento, ni dataset declarado, ni evaluación. Esto impide auditar qué se ha modificado respecto al modelo base y con qué datos.
- Cero validación comunitaria: 0 descargas y 0 likes en el momento de la consulta. No existen informes independientes de comportamiento.
- Discrepancia de nomenclatura: el nombre indica 32B y los tensores safetensors suman 25,75B. Hay que verificar la configuración real antes de dimensionar infraestructura.
- Idiomas: solo se declara inglés. El rendimiento en castellano es desconocido y no debería asumirse.
- Atenuación de rechazos: los sufijos «uncensored» y «heretic» implican que el modelo puede generar contenido que el modelo alineado original rechazaría. Esto eleva el riesgo de salidas dañinas, sesgadas, ilegales o sexualmente explícitas, y hace obligatorio el uso de filtros externos y revisión humana en cualquier despliegue de cara al público.
- Alucinación: inherente a los modelos de visión y lenguaje, y aquí no cuantificable al no existir benchmarks. El riesgo es especialmente alto en OCR de documentos, lectura de cifras y localización de objetos (grounding).
- Degradación potencial por el ajuste: los procesos de eliminación de rechazos pueden deteriorar capacidades generales, coherencia o calidad de razonamiento. Sin evaluaciones comparativas no puede descartarse.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero conviene verificar la licencia del modelo raíz y de toda la cadena de dependencias, así como las condiciones de uso añadidas por los autores intermedios, que no se detallan en la información disponible.
- Coste de almacenamiento y transferencia: 128,9 GB de repositorio, muy por encima de lo esperable para un modelo de este tamaño en BF16.
- Integración con ComfyUI: el nombre sugiere compatibilidad, pero no hay documentación que confirme cómo debe cargarse el modelo ni qué nodos son necesarios.
- Fechas de publicación: los metadatos indican creación el 2026-09-19 y actualización el 2026-09-20. Conviene comprobar que el repositorio sigue accesible y estable antes de depender de él en producción.

## Enlaces

- Página de HuggingFace del modelo: https://huggingface.co/eraiko/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI
- Modelo base declarado: https://huggingface.co/llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic
- Space de conversión a GGUF referenciado en el README: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Búsqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden a hilos de Reddit sobre el cuestionario de la página de inicio de Bing y no guardan ninguna relación con este modelo.
