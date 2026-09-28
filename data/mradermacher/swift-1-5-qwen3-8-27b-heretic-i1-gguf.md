# mradermacher/Swift-1.5-Qwen3.8-27b-heretic-i1-GGUF

## Resumen

Swift-1.5-Qwen3.8-27b-heretic-i1-GGUF es una cuantización en formato GGUF del modelo akumaburn/Swift-1.5-Qwen3.8-27b-heretic, publicada por mradermacher. Se trata de un modelo de 27.320.697.856 parámetros (27,3 B) etiquetado como "heretic", "abliterated" y "uncensored", lo que indica que el modelo base ha pasado por un proceso de eliminación de los mecanismos de rechazo (decensurado o abliteración) antes de su cuantización.

El repositorio ofrece cuantizaciones con imatrix (sufijo i1) pensadas para reducir el peso del modelo manteniendo la mayor fidelidad posible respecto al original. Según las etiquetas del autor, el modelo conserva capacidades de visión (requiere fichero mmproj, disponible en el repositorio de cuants estáticos) y está orientado a uso conversacional en inglés.

Su relevancia práctica es doble: por un lado, permite ejecutar un modelo de 27 B en hardware de consumo mediante cuantizaciones de 2 a 3 bits; por otro, sirve como caso de estudio de modelos decensurados distribuidos con licencia propia (swift-open-license-1.0) y etiqueta "research-only". No hay datos publicados de benchmarks, contexto ni arquitectura en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el autor no la documenta; las etiquetas apuntan a la familia Qwen3 y a un modelo multimodal con visión) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF i1 (con imatrix): i1-Q2_K (11,0 GB) e i1-IQ3_M (12,9 GB); fichero imatrix suelto (0,1 GB). La etiqueta de cuantizaciones del autor menciona además Q2_K, Q3_K_S/M/L, IQ2_*/IQ3_*, IQ4_XS, Q4_K_S/M, Q5_K_S/M, Q6_K, Q4_0 y Q4_1 |
| Idiomas soportados | Inglés (en) |
| Licencia | swift-open-license-1.0 (license: other), con enlace al fichero LICENSE del modelo base |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors para transformers |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO u otras) en la información disponible. El modelo base pertenece a la serie Swift-1.5-Qwen3.8-27b, cuyo nombre sugiere una base de la familia Qwen3 de 27 B, pero esto no se confirma en la documentación.

Las únicas innovaciones documentadas son de tipo post-entrenamiento y cuantización: el modelo base ha sido sometido a un proceso "heretic"/"abliterated" que elimina o atenúa la capa de rechazo del modelo original, y la cuantización aquí publicada utiliza imatrix (matriz de importancia) para calcular los pesos de cuantización con datos de calibración, lo que mejora la perplejidad respecto a cuantizaciones estáticas del mismo tamaño. Las etiquetas indican además soporte multimodal (visión) mediante fichero mmproj y la etiqueta "mtp" (multi-token prediction), sin más detalles técnicos.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Procesamiento de imágenes: el autor marca explícitamente el modelo como de visión; requiere el fichero mmproj ubicado en el repositorio de cuants estáticos.
- Respuestas sin censura: al ser un modelo abliterated, no aplica los rechazos típicos del modelo original ante peticiones sensibles.
- Razonamiento, código y matemáticas: no hay información publicada que permita confirmar el nivel en estas tareas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento de varios pasos: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo de idiomas de la ficha.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Ejecución local en hardware de consumo: la cuantización i1-IQ3_M (12,9 GB) permite cargar un modelo de 27 B en una GPU de 24 GB o incluso en configuraciones con 16 GB usando i1-Q2_K, algo inviable con los pesos completos en safetensors.
- Investigación sobre decensurado y seguridad de modelos: el modelo sirve para estudiar cómo la abliteración afecta a la tasa de rechazos, la coherencia y la propagación de contenido sensible en modelos de 27 B.
- Análisis y descripción de imágenes en local: con el fichero mmproj correspondiente, puede usarse para tareas de visión por computador sin enviar datos a servicios externos.
- Generación creativa de ficción y narrativa: la ausencia de filtros de rechazo permite trabajar con tramas y temáticas que otros modelos bloquean, siempre que se cumpla la licencia.
- Prototipado de asistentes conversacionales en inglés: al estar cuantizado en GGUF, se integra directamente en llama.cpp, Ollama o LM Studio para pruebas de concepto rápidas.
- Evaluación comparativa de cuantizaciones: el repositorio permite medir el impacto real de i1-Q2_K frente a i1-IQ3_M en tareas concretas, útil para decidir el equilibrio entre tamaño y calidad.
- Fine-tuning o destilado sobre modelos decensurados: sirve como referencia de comportamiento para proyectos de investigación en alineación, siempre respetando la cláusula research-only.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del tamaño de los ficheros): i1-Q2_K en torno a 11-13 GB; i1-IQ3_M en torno a 13-15 GB, a lo que hay que sumar la caché KV correspondiente al contexto configurado.
- GPU recomendadas: RTX 3090 y RTX 4090 (24 GB) para i1-IQ3_M con contexto holgado; A100 40 GB o H100 para servir varias peticiones concurrentes; RTX 4080, RTX 4060 Ti de 16 GB o similares para i1-Q2_K con contexto reducido.
- Cabe en GPU de consumo: sí. i1-IQ3_M entra en tarjetas de 24 GB y, con contexto corto, en algunas de 16 GB; i1-Q2_K está pensado para equipos de 12-16 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y llama-cpp-python. El soporte de GGUF en vLLM y TGI es limitado, por lo que estos servidores no son la opción natural para estos ficheros.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones y dependerán del ancho de banda de memoria de la GPU, del tamaño de contexto y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Swift-1.5-Qwen3.8-27b-heretic-i1-GGUF (este) | 27,3 B | No disponible | GGUF i1 (imatrix) | swift-open-license-1.0 | Cuantizaciones ponderadas con imatrix; 0 descargas registradas |
| mradermacher/Swift-1.5-Qwen3.8-27b-heretic-GGUF | 27,3 B | No disponible | GGUF estático | swift-open-license-1.0 | Repositorio hermano; incluye los ficheros mmproj para visión |
| akumaburn/Swift-1.5-Qwen3.8-27b-heretic | 27,3 B | No disponible | safetensors (transformers) | swift-open-license-1.0 | Modelo base sin cuantizar; referencia de calidad máxima |

No se dispone de información sobre modelos de terceros directamente comparables (mismo tamaño y misma tarea) en la documentación proporcionada.

## Limitaciones y advertencias

- La etiqueta "research-only" del autor restringe el uso previsto a investigación; conviene leer el fichero LICENSE enlazado antes de cualquier uso productivo.
- La licencia es swift-open-license-1.0, registrada como "other" en HuggingFace, por lo que las condiciones de uso comercial no están claras sin revisar el texto legal.
- Riesgo de alucinación: no hay datos publicados de evaluación, por lo que la fiabilidad factual es desconocida.
- La abliteración puede degradar la coherencia del modelo y aumentar la probabilidad de generar contenido dañino, sesgado o ilegal; requiere filtros externos en cualquier despliegue expuesto a usuarios.
- Idiomas: solo inglés declarado; el rendimiento en castellano u otras lenguas no está documentado.
- Limitación de contexto: se desconoce la ventana máxima, lo que impide planificar con garantías tareas de contexto largo.
- Las cuantizaciones de 2 y 3 bits (i1-Q2_K, i1-IQ3_M) introducen pérdida de calidad medible respecto a los pesos originales, especialmente en razonamiento y matemáticas.
- El soporte de visión exige el fichero mmproj del repositorio estático; sin él, el modelo funciona solo como modelo de texto.
- No hay validación de la comunidad: 0 descargas y 0 "me gusta" en el momento de la consulta, sin informes externos de comportamiento.
- La fecha de creación registrada (2026-09-27) resulta anómala respecto a la fecha actual, lo que conviene verificar en la propia página del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mradermacher/Swift-1.5-Qwen3.8-27b-heretic-i1-GGUF
- Modelo base: https://huggingface.co/akumaburn/Swift-1.5-Qwen3.8-27b-heretic
- Cuants estáticos: https://huggingface.co/mradermacher/Swift-1.5-Qwen3.8-27b-heretic-GGUF
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Visión general y lista de descargas del autor: https://hf.tst.eu/model#Swift-1.5-Qwen3.8-27b-heretic-i1-GGUF
- Preguntas frecuentes y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de ficheros GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
