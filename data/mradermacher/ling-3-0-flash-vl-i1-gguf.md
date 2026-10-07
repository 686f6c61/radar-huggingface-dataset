# mradermacher/Ling-3.0-flash-VL-i1-GGUF

## Resumen

Ling-3.0-flash-VL-i1-GGUF es una colección de cuantizaciones en formato GGUF del modelo multimodal inclusionAI/Ling-3.0-flash-VL, publicada por el usuario mradermacher. El modelo base, desarrollado por inclusionAI, tiene 124.414.211.552 parámetros (unos 124,4 mil millones) según los pesos en safetensors del repositorio original, y la propia model card lo describe explícitamente como un modelo de visión. Esta ficha describe el repositorio cuantizado, no el modelo original.

El interés de esta publicación es eminentemente práctico: permite desplegar un modelo de más de 120.000 millones de parámetros en hardware de gama alta de consumo o en servidores con una o dos GPU, gracias a un abanico de cuantizaciones que va desde 28,1 GB (i1-IQ1_M) hasta 102,3 GB (i1-Q6_K). Se ofrecen dos familias: los cuantos i1 generados con fichero imatrix (calibrados con estadísticas de activaciones) y los cuantos estáticos, alojados en un repositorio paralelo.

La licencia MIT del modelo base elimina las restricciones de uso comercial típicas de otros modelos abiertos, lo que convierte a esta versión en una opción razonable para integraciones en producto. El repositorio acumula 1.898 descargas y está etiquetado para transformers y endpoints compatibles, con soporte declarado únicamente para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio solo indica que es un modelo de visión; no se detalla transformer, MoE ni híbrida) |
| Parámetros totales | 124.414.211.552 (~124,4 mil millones), según los pesos en safetensors del modelo base |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K (cuantos i1 con imatrix); fichero imatrix suelto de 0,6 GB para generar cuantos propios |
| Idiomas soportados | en (inglés), según las etiquetas del repositorio |
| Licencia | MIT |
| Formato de pesos | GGUF (variantes i1/imatrix); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. La model card del repositorio cuantizado se limita a indicar que se trata de un modelo de visión y a remitir al repositorio inclusionAI/Ling-3.0-flash-VL. No se detallan el tipo de red (transformer denso, mezcla de expertos o arquitectura híbrida), el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste por refuerzo (RLHF/DPO). Tampoco se documenta ninguna innovación técnica concreta como decodificación especulativa o atención lineal.

Lo único verificable en esta información es el proceso de cuantización: mradermacher ha generado cuantos de tipo i1 (imatrix) a partir del modelo original, usando un fichero de importancia de 0,6 GB calculado sobre el propio modelo, y publica además una familia de cuantos estáticos en un repositorio separado. Los cuantos i1 suelen ofrecer mejor relación calidad/tamaño que los estáticos equivalentes, según la nota del propio autor, aunque no se aportan métricas de perplejidad específicas para este modelo.

## Capacidades

- Procesamiento de imágenes: la model card identifica el modelo como de visión, por lo que se presupone entrada multimodal (texto e imagen). No se detalla si admite vídeo, audio u otras modalidades.
- Generación de texto conversacional: el repositorio está etiquetado como "conversational", lo que indica ajuste para diálogo multi-turno.
- Comprensión de imágenes en el contexto de una conversación: combinación de entrada visual con instrucciones en lenguaje natural.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según las etiquetas; no se declara soporte de otros idiomas.
- Modo "thinking" o razonamiento explícito: no disponible en la información proporcionada.
- Capacidades de código, matemáticas o audio: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos escaneados en inglés: el modelo puede recibir una imagen de factura, contrato o formulario y devolver texto estructurado o respuestas sobre su contenido, aprovechando la combinación de entrada visual y salida conversacional.
- Moderación de contenido visual: clasificación y descripción de imágenes subidas por usuarios en plataformas, con salida en lenguaje natural que puede postprocesarse para etiquetado automático.
- Asistencia a personas con discapacidad visual: descripción de escenas o lectura de texto en imágenes, siempre que el despliegue se haga en local con la cuantización adecuada para evitar latencias de red.
- Extracción de información de capturas de pantalla: conversión de interfaces gráficas capturadas a texto o JSON útil para automatizaciones internas, apoyándose en el modo conversacional del modelo.
- Etiquetado semiautomático de datasets de visión: generación de descripciones (captioning) para grandes colecciones de imágenes antes de entrenar otros modelos, con la ventaja de la licencia MIT para uso comercial.
- Despliegue en infraestructura propia sin dependencia de API: al distribuirse en GGUF, puede ejecutarse con llama.cpp u Ollama en servidores controlados por la organización, algo relevante en sectores con requisitos de soberanía del dato.
- Prototipado e investigación en visión-lenguaje: la disponibilidad de cuantizaciones desde 28,1 GB permite experimentar con un modelo de 124.000 millones de parámetros en laboratorios con recursos limitados, comparando variantes i1 frente a estáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio cuantizado no incluye métricas de MMLU, HumanEval, GSM8K, MMMU ni de ningún otro conjunto de evaluación, y tampoco se aportan curvas de perplejidad específicas para las cuantizaciones de este modelo (solo una gráfica genérica sobre tipos de cuantización).

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones a partir del tamaño de fichero declarado en la model card; hay que añadir memoria para el contexto, los estados de la caché KV y, en su caso, el proyectil multimodal (mmproj), que no se aloja en este repositorio sino en el de cuantos estáticos.

- i1-IQ1_M (28,1 GB): viable en una GPU de 32 GB (por ejemplo, una RTX 5090 o una V100 de 32 GB); calidad descrita por el autor como "mostly desperate".
- i1-IQ2_XXS a i1-IQ2_M (32,8 a 40,7 GB): requiere una GPU de 40 a 48 GB o dos GPU de 24 GB.
- i1-Q3_K_S a i1-Q3_K_L (53,9 a 64,5 GB): entorno de 64 GB de VRAM; dos RTX 4090 (48 GB) quedan justas y probablemente insuficientes con contexto amplio.
- i1-IQ4_XS a i1-Q4_K_M (66,5 a 75,4 GB): encaja en una H100 de 80 GB o en dos A100 de 40 GB. El autor marca Q4_K_M como "fast, recommended" y Q4_K_S como el de mejor relación tamaño/velocidad/calidad.
- i1-Q6_K (102,3 GB, tres particiones): requiere dos H100 de 80 GB o un nodo con varias GPU; el propio autor lo describe como prácticamente equivalente a un Q6_K estático.
- GPU recomendadas: RTX 4090/5090 para las cuantizaciones más agresivas con reparto por capas o descarga parcial a CPU; A100 40/80 GB y H100 80 GB para las cuantizaciones medias y altas.
- Despliegue: llama.cpp y Ollama son los entornos naturales para GGUF; vLLM y TGI no consumen GGUF de forma nativa, por lo que exigirían los pesos originales en safetensors y mucha más VRAM. El repositorio está etiquetado como compatible con endpoints, lo que facilita la integración en servicios gestionados que acepten GGUF.
- Latencia y throughput: no disponible. No se aportan mediciones de tokens por segundo ni de tiempo hasta el primer token para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No se dispone de información sobre modelos alternativos de la misma categoría (mismo tamaño o misma tarea) en el material proporcionado, por lo que no es posible establecer una comparativa con terceros sin inventar datos. A continuación se comparan únicamente las tres vías de acceso al mismo modelo, que sí están documentadas:

| Opción | Formato | Tamaño | Licencia | Notas |
|---|---|---|---|---|
| inclusionAI/Ling-3.0-flash-VL | safetensors | 124.414.211.552 parámetros (~250 GB en bf16 estimado) | MIT | Modelo base; requiere transformers y hardware de clase servidor |
| mradermacher/Ling-3.0-flash-VL-i1-GGUF | GGUF i1 (imatrix) | de 28,1 GB a 102,3 GB según cuantización | MIT | Cuantos calibrados con imatrix; el fichero mmproj para visión está en el repositorio estático |
| mradermacher/Ling-3.0-flash-VL-GGUF | GGUF estático | no detallado en la información disponible | MIT | Cuantos sin imatrix; aloja los ficheros mmproj del componente de visión |

## Limitaciones y advertencias

- Idiomas: las etiquetas del repositorio declaran únicamente inglés, lo que limita su uso directo en castellano sin una evaluación previa del comportamiento real.
- Modalidad: aunque la model card afirma que es un modelo de visión, los ficheros mmproj necesarios para procesar imágenes no se encuentran en este repositorio, sino en el de cuantos estáticos; sin ellos el despliegue en llama.cpp queda reducido a texto.
- Alucinación: no hay datos publicados sobre tasas de alucinación ni evaluaciones de fidelidad en tareas de visión-lenguaje para este modelo.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o equidad en la información proporcionada.
- Calidad de las cuantizaciones bajas: el propio autor advierte que i1-IQ1_M es "mostly desperate" y que Q2_K_S es de "very low quality"; en un modelo de este tamaño, las cuantizaciones por debajo de Q4 pueden degradar de forma notable las capacidades de razonamiento y de percepción visual.
- Riesgo de rendimiento en CPU: con cuantizaciones de 60-100 GB, el reparto entre GPU y RAM implica latencias altas y poco adecuadas para aplicaciones interactivas.
- Licencia: MIT permite uso comercial, pero conviene verificar los términos del modelo base original y de los datasets de entrenamiento, no detallados aquí.
- Fechas del repositorio: los metadatos indican creación el 2026-10-05 y actualización el 2026-10-07; verificar la vigencia de los artefactos antes de fijar una versión en producción.
- Ausencia de métricas: no hay benchmarks ni mediciones de throughput, por lo que cualquier decisión de despliegue debería ir precedida de una evaluación propia sobre el caso de uso concreto.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/mradermacher/Ling-3.0-flash-VL-i1-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash-VL
- Cuantos estáticos (incluye los ficheros mmproj de visión): https://huggingface.co/mradermacher/Ling-3.0-flash-VL-GGUF
- Listado y descarga cómoda de ficheros: https://hf.tst.eu/model#Ling-3.0-flash-VL-i1-GGUF
- Preguntas frecuentes y peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Guía general de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de tipos de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
