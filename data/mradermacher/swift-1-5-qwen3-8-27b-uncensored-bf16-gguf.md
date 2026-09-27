# mradermacher/Swift-1.5-Qwen3.8-27B-Uncensored-BF16-GGUF

## Resumen

Swift-1.5-Qwen3.8-27B-Uncensored-BF16-GGUF es una recopilación de cuantizaciones en formato GGUF generada por mradermacher a partir del modelo d0xin/Swift-1.5-Qwen3.8-27B-Uncensored-BF16. Se trata de un modelo de lenguaje de aproximadamente 27.320 millones de parámetros, distribuido originalmente en safetensors BF16, que llega con 13 ficheros GGUF de distintos niveles de compresión más dos suplementos multimodales (`mmproj`). El repositorio pesa 190,8 GB en total, aunque las descargas individuales van desde 11 GB (Q2_K) hasta 29,1 GB (Q8_0).

El modelo se presenta como una variante "uncensored" y "abliterated", es decir, con el alineamiento de seguridad de la instrucción base reducido o eliminado mediante técnicas de ablación. Además de generación de texto conversacional, la model card declara capacidades de razonamiento, modo de pensamiento eficiente (*efficient-thinking*), soporte de tool calling y procesamiento multimodal, este último evidenciado por los ficheros `mmproj` que acompañan a los pesos principales. La nomenclatura y el tag `qwen3_8` apuntan a una arquitectura derivada de la familia Qwen3, aunque la model card no detalla la arquitectura interna, la longitud de contexto ni la composición del dataset de entrenamiento.

Su relevancia práctica es doble: por un lado, ofrece a quien quiera ejecutar un modelo de ~27B en hardware de consumo un abanico de cuantizaciones ya preparadas con nombres de fichero estables; por otro, su carácter sin censura lo hace atractivo para investigación sobre alineamiento, *red-teaming* y evaluación de comportamiento de modelos, si bien implica riesgos de seguridad y de calidad que se detallan más abajo. La licencia es `swift-open-license-1.0`, una licencia personalizada que debe revisarse antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible explícitamente; el tag `qwen3_8` y el formato de pesos HF apuntan a un transformer decoder-only derivado de la familia Qwen3, sin confirmación en la model card |
| Parámetros totales | 27.320.697.856 (≈27,3 B), dato extraído de safetensors del modelo base |
| Parámetros activos | No aplica: no se documenta como modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; suplementos multimodales mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | Inglés (`en`) según la model card |
| Licencia | `swift-open-license-1.0` (etiquetada como `license: other`) |
| Formato de pesos | GGUF (ficheros individuales y suplementos mmproj); el modelo base original está en safetensors BF16 |
| Tamaño del repositorio | 190,8 GB |
| Autor de la cuantización | mradermacher (empresa nethype GmbH) |
| Modelo base | d0xin/Swift-1.5-Qwen3.8-27B-Uncensored-BF16 |
| Fecha de creación | 2026-09-26 |
| Descargas / likes en el momento del análisis | 0 / 0 |

## Arquitectura y entrenamiento

No se han publicado en la información disponible detalles sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni la existencia de fases de RLHF o DPO. Lo único documentado en la model card es la cadena de custodia del artefacto: mradermacher toma el modelo BF16 publicado por d0xin y genera cuantizaciones estáticas (`static quants`, con `quantize_version: 2` y `output_tensor_quantised: 1`), usando la conversión a formato HuggingFace como paso previo. No hay cuantizaciones ponderadas ni con imatrix en el momento de la publicación, y el propio autor indica que podrían no llegar a publicarse.

Los elementos técnicos diferenciales que sí se pueden afirmar son de naturaleza de despliegue, no de entrenamiento. La presencia de ficheros `mmproj` (0,7 GB en Q8_0 y 1,0 GB en f16) confirma que el modelo conserva una torre de proyección multimodal, presumiblemente para entrada de imágenes, y que esa torre es opcional al cargar los pesos en llama.cpp. Las etiquetas `efficient-thinking` y `reasoning` sugieren la existencia de un modo de razonamiento explícito con presupuesto de pensamiento, habitual en la familia Qwen3, pero su funcionamiento exacto (si se activa por prompt, por token especial o por plantilla de chat) no está descrito en la información proporcionada. La etiqueta `abliterated` implica que se aplicó una técnica de ablación de direcciones de rechazo en el espacio de activaciones o de pesos, lo que típicamente reduce el alineamiento de seguridad a costa de posibles degradaciones en coherencia y en tareas sensibles.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con formato de chat compatible con plantillas de la familia Qwen.
- Razonamiento explícito: las etiquetas `reasoning` y `efficient-thinking` indican soporte de cadenas de pensamiento con control de esfuerzo, aunque los detalles de activación no están documentados.
- Tool calling / function calling: declarado explícitamente en las etiquetas del repositorio.
- Flujos agénticos y razonamiento multi-paso, derivados de la combinación de tool calling y modo de razonamiento.
- Procesamiento multimodal: los ficheros `mmproj` habilitan entrada de imágenes junto al texto cuando se cargan en un runtime compatible (llama.cpp con soporte de visión).
- Capacidad de ajuste de comportamiento mediante el modo sin censura: responde a peticiones que un modelo alineado rechazaría.
- Multilingüismo: limitado a inglés según la model card; no se declaran otros idiomas.
- No se documentan capacidades de audio, vídeo ni generación de imágenes.

## Casos de uso

- Investigación sobre alineamiento y *red-teaming*: el modelo permite estudiar cómo se comporta una red sin las capas habituales de rechazo, sirviendo de línea base para comparar contra la variante alineada y medir el impacto de la ablación en coherencia y seguridad.
- Evaluación de robustez de filtros de contenido: al desplegarse en local con llama.cpp u Ollama, permite probar sistemas de moderación de entrada y salida contra un generador deliberadamente permisivo.
- Generación de código en local: con 27B de parámetros y soporte de tool calling, puede integrarse en asistentes de programación autoalojados que invoquen funciones del repositorio (crear ficheros, ejecutar tests) sin enviar código a terceros.
- Asistente conversacional de larga duración en inglés: el modelo está pensado para diálogo multi-turno; su tamaño permite mantener conversaciones con contexto extenso siempre que la ventana real del modelo base lo permita (dato no disponible, conviene verificarlo antes de dimensionar el sistema).
- Extracción y resumen de documentos con imágenes: cargando el `mmproj-Q8_0` junto al GGUF, se puede hacer OCR descriptivo, resumen de capturas o descripción de diagramas en un pipeline local.
- Procesamiento por lotes en una sola GPU: cuantizaciones Q4_K_S o Q4_K_M (15,9 y 16,9 GB) caben en una GPU de 24 GB, lo que permite ejecutar tareas de clasificación, reescritura o generación sintética de datos a gran escala sin infraestructura de datacenter.
- Despliegue en estaciones de trabajo sin GPU dedicada de gama alta: las cuantizaciones Q2_K y Q3_K_S (11,0 y 12,4 GB) permiten ejecución parcial en CPU con *offload* a GPU modesta, útil para pruebas de concepto y demos internas.
- Generación de datos sintéticos en inglés para ajuste fino: con temperaturas controladas y prompts variados, sirve como generador de corpus de instrucciones, asumiendo revisión humana por el riesgo de contenido inapropiado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantizaciones no incluye MMLU, HumanEval, GSM8K, MMLU-Pro ni ninguna otra métrica, ni comparaciones cuantitativas con modelos similares. El único material gráfico referenciado es un gráfico de perplejidad comparando tipos de cuantización de baja calidad (enlace en la sección de enlaces), que mide el impacto de la compresión, no la capacidad del modelo.

## Requisitos de hardware

- VRAM estimada para los pesos de inferencia, según el tamaño de fichero declarado (hay que sumar caché KV del contexto y, en su caso, 0,7-1,0 GB del `mmproj`):
  - Q2_K: 11,0 GB
  - Q3_K_S: 12,4 GB / Q3_K_M: 13,6 GB / Q3_K_L: 14,7 GB
  - IQ4_XS: 15,5 GB / Q4_K_S: 15,9 GB / Q4_K_M: 16,9 GB
  - Q5_K_S: 19,1 GB / Q5_K_M: 19,6 GB
  - Q6_K: 22,5 GB
  - Q8_0: 29,1 GB
- GPU de consumo: Q2_K, Q3_K_S y Q3_K_M caben en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB, A4000). Q4_K_S, Q4_K_M e IQ4_XS entran con holgura en 24 GB (RTX 3090, RTX 4090, A5000) si el contexto no es muy largo. Q5 y Q6_K requieren 24 GB con contexto reducido o 32 GB para trabajar con margen. Q8_0 pide 32-48 GB (A6000, L40S, RTX 6000 Ada) o bien reparto entre dos GPU de 24 GB.
- GPU de datacenter: A100 40/80 GB, H100 80 GB, H200 o L40S para los cuantizados grandes y para servir varias réplicas concurrentes.
- Modelo base en BF16 (`d0xin/Swift-1.5-Qwen3.8-27B-Uncensored-BF16`): aproximadamente 54,6 GB de pesos, por lo que necesita una GPU de 80 GB o dos de 48 GB.
- Opciones de despliegue: llama.cpp / `llama-server` (incluye soporte de los ficheros `mmproj` para visión), Ollama y LM Studio (requieren convertir o importar el GGUF), koboldcpp y text-generation-webui para uso de escritorio. Para el modelo original en safetensors, vLLM o TGI sobre GPU de datacenter; conviene comprobar la compatibilidad de la arquitectura concreta antes de planificar el despliegue, porque no está documentada.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo, TTFT ni consumo energético en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas del modelo evaluado, por lo que la comparación se limita a los parámetros estructurales más verificables. Los datos de las alternativas provienen de sus respectivas model cards públicas y deben confirmarse en la fuente original antes de tomar decisiones.

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27B-Uncensored (esta ficha) | 27,3 B | No disponible | swift-open-license-1.0 | GGUF (13 cuants) y safetensors BF16 | No disponible |
| Familia Qwen3 de ~32B (referencia de la línea base) | ~32 B | No disponible en esta ficha | No disponible en esta ficha | Safetensors y GGUF en la comunidad | No disponible |
| Modelos abliterated de ~24-32 B de la comunidad open source | 24-32 B | Variable según base | Habitualmente la licencia del modelo base | GGUF principalmente | No disponible |

No se han encontrado en la información proporcionada datos que permitan una comparación cuantitativa fiable frente a alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": el alineamiento de seguridad se ha reducido deliberadamente, por lo que puede generar contenido dañino, ilegal o NSFW. No es apto para aplicaciones orientadas al público sin filtros adicionales y revisión legal.
- La ablación de direcciones de rechazo suele degradar la coherencia, la utilidad general y la calidad del razonamiento; no hay benchmarks publicados que cuantifiquen esa pérdida en este caso.
- Riesgo de alucinación no medido: no se han publicado evaluaciones de veracidad ni de tasa de alucinación.
- Idiomas: solo inglés declarado. No hay evidencia de buen rendimiento en castellano ni en otras lenguas.
- Longitud de contexto desconocida: no se puede planificar un caso de uso de contexto largo sin verificar primero la ventana real del modelo base.
- Licencia `swift-open-license-1.0`: es una licencia personalizada, no una licencia estándar tipo Apache 2.0 o MIT. Hay que leer el texto enlazado antes de cualquier uso comercial o redistribución; el repositorio la etiqueta como `license: other`.
- Discrepancia de nombres: el repositorio se llama "BF16-GGUF", pero la tabla de ficheros publicada no incluye ninguna cuantización BF16 completa; los comentarios de la model card mencionan un tipo `x-f16` que no aparece listado. Conviene verificar los ficheros antes de asumir disponibilidad de BF16.
- No existen cuantizaciones ponderadas ni con imatrix en el momento de la publicación; el propio autor señala que podrían no llegar a publicarse.
- Métricas de adopción nulas (0 descargas, 0 likes) y ausencia de pipeline declarado: no hay validación comunitaria que respalde la calidad del artefacto.
- Ausencia de información sobre el proceso de cuantización de la torre multimodal: no se detalla si los `mmproj` mantienen la calidad del modelo original ni qué encoder visual usan.
- Las cuantizaciones por debajo de Q4 (Q2_K, Q3_K_*) degradan notablemente la perplejidad según los gráficos referenciados por el propio autor; no se recomiendan para producción sensible a la calidad.
- Fechas del repositorio (creado el 2026-09-26) y nomenclatura `qwen3_8`: conviene verificar la correspondencia real con la arquitectura declarada por el autor del modelo base.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Swift-1.5-Qwen3.8-27B-Uncensored-BF16-GGUF
- Modelo base: https://huggingface.co/d0xin/Swift-1.5-Qwen3.8-27B-Uncensored-BF16
- Texto de la licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Página de descarga y resumen del autor: https://hf.tst.eu/model#Swift-1.5-Qwen3.8-27B-Uncensored-BF16-GGUF
- Guía de uso de ficheros GGUF (referencia de TheBloke citada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
