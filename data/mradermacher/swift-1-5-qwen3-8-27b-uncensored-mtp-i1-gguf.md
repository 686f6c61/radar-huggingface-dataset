# mradermacher/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-i1-GGUF

## Resumen

Swift-1.5-Qwen3.8-27B-Uncensored-MTP-i1-GGUF es una cuantización en formato GGUF del modelo ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP, publicada por mradermacher. Se trata de una variante "abliterated" y "uncensored" construida sobre una base de la familia Qwen3.8, con 27.320.697.856 parámetros totales (unos 27,3 mil millones) según los pesos en safetensors del modelo original. El autor de la cuantización, mradermacher, es un conocido generador de cuantizaciones GGUF con matrices de importancia (imatrix) para la comunidad de inferencia local.

La relevancia de esta ficha reside en que ofrece el modelo en múltiples niveles de cuantización (desde i1-Q2_K de 11,0 GB hasta i1-Q6_K de 22,5 GB), lo que permite ejecutarlo en hardware de consumo con pérdida controlada de calidad. El repositorio ocupa 218,6 GB en total y acumula 1432 descargas y 8 likes en el momento de la consulta. La model card indica que el modelo base es de tipo vision (los ficheros mmproj, si existen, se alojan en el repositorio estático), aunque no se detallan las capacidades multimodales concretas.

La licencia es swift-open-license-1.0 (identificada como "other" en los metadatos), con enlace al fichero LICENSE del modelo base. El único idioma declarado es el inglés. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada: la model card del cuantizador se limita a describir el proceso de cuantización y no reproduce la del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3.8; no se detalla en la informacion proporcionada) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | swift-open-license-1.0 |
| Formato de pesos | GGUF (cuantizaciones con imatrix); el modelo base en safetensors |
| Tamano del repo | 218,6 GB |
| Modelo base | ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP |
| Fecha de creacion | 2026-09-25 |
| Ultima actualizacion | 2026-11-27 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la información proporcionada. Los tags del repositorio indican "qwen3_8" y "mtp", lo que sugiere una base de la familia Qwen3.8 y algún mecanismo asociado a las siglas MTP (multi-token prediction), aunque no se documenta su implementación concreta. El modelo se describe como "abliterated" y "uncensored", lo que implica que se ha aplicado una técnica de eliminación o atenuación de la capa de rechazo (abliteration) sobre un modelo ajustado previamente, alterando el comportamiento de rechazo ante determinadas peticiones.

Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La model card del cuantizador no incluye información sobre el proceso de entrenamiento del modelo original. El proceso de cuantización sí está documentado: se han generado cuantizaciones ponderadas con imatrix (i1) a partir del modelo base, con versiones estáticas disponibles en un repositorio separado. La model card menciona que es un modelo de visión y que los ficheros mmproj, si los hay, se encuentran en el repositorio estático.

## Capacidades

- Generación de texto conversacional: el tag "conversational" y la librería transformers indican uso para diálogo e instrucciones.
- Comportamiento "uncensored"/"abliterated": el modelo está modificado para reducir los rechazos ante peticiones que un modelo alineado estándar podría declinar.
- Capacidad de visión: la model card del cuantizador afirma explícitamente que es un modelo de visión, con ficheros mmproj en el repositorio estático (no se detallan las tareas concretas).
- Soporte multilingüe: limitado al inglés según los metadatos (language: en).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en estaciones de trabajo con GPU de consumo: gracias a las cuantizaciones i1-Q4_K_M (16,9 GB) o i1-IQ4_XS (15,4 GB), el modelo puede ejecutarse en GPUs con 24 GB de VRAM como la RTX 4090, o en configuraciones con offloading parcial a CPU mediante llama.cpp.
- Experimentación con modelos sin filtros de rechazo: investigadores que estudian el comportamiento de modelos abliterated pueden usar esta variante para comparar respuestas frente al modelo alineado original, con la advertencia de los riesgos asociados.
- Prototipado de asistentes conversacionales en inglés: el tag "conversational" y el formato GGUF permiten desplegar un chatbot local con Ollama o llama.cpp sin depender de APIs externas.
- Evaluación de pipelines multimodales: si se confirma la disponibilidad de los ficheros mmproj en el repositorio estático, podría emplearse para tareas de descripción de imágenes o preguntas visuales en entornos de pruebas.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local, el modelo evita el envío de datos a servicios en la nube, adecuado para prototipos que manejen información sensible.
- Generación de cuantizaciones propias: el fichero imatrix incluido (0,1 GB) permite a otros usuarios generar sus propias cuantizaciones con la matriz de importancia proporcionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaño del fichero, sin contar overhead de contexto):
  - i1-Q2_K: 11,0 GB
  - i1-Q3_K_S: 12,4 GB
  - i1-IQ3_S: 12,7 GB
  - i1-IQ3_M: 12,9 GB
  - i1-Q3_K_M: 13,6 GB
  - i1-Q3_K_L: 14,7 GB
  - i1-IQ4_XS: 15,4 GB
  - i1-Q4_0: 15,9 GB
  - i1-Q4_K_S: 15,9 GB
  - i1-Q4_K_M: 16,9 GB
  - i1-Q4_1: 17,4 GB
  - i1-Q5_K_S: 19,1 GB
  - i1-Q5_K_M: 19,6 GB
  - i1-Q6_K: 22,5 GB
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) puede alojar hasta i1-Q6_K con contexto corto; una RTX 3090 (24 GB) o RTX 4080 (16 GB) quedan limitadas a cuantizaciones de 4 bits o inferiores.
- Cabe en GPU de consumo: sí, en cuantizaciones de 2 a 4 bits (11-17 GB) en GPUs de 16-24 GB; las de 5-6 bits requieren 20-24 GB.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) por el formato GGUF; también compatible con endpoints según el tag "endpoints_compatible". vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la información proporcionada. Como referencia estructural, se puede comparar con el propio modelo base y su versión estática:

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27B-Uncensored-MTP-i1-GGUF (este) | 27,3 B | GGUF imatrix | no disponible | swift-open-license-1.0 | Cuantizaciones i1 de 11,0 a 22,5 GB |
| ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP | 27,3 B | safetensors | no disponible | swift-open-license-1.0 | Modelo base sin cuantizar |
| mradermacher/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-GGUF | 27,3 B | GGUF estático | no disponible | swift-open-license-1.0 | Cuantizaciones estáticas y ficheros mmproj |

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": la eliminación del comportamiento de rechazo puede producir respuestas ante peticiones dañinas, ilegales o éticamente problemáticas; no es adecuado para aplicaciones de cara al público sin salvaguardas adicionales.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni benchmarks de alucinación en la información disponible.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está verificado.
- Licencia swift-open-license-1.0: es una licencia no estándar ("other"); es imprescindible revisar el texto en el enlace LICENSE del modelo base antes de cualquier uso comercial.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar aplicaciones con ventanas largas.
- Capacidades multimodales: aunque se afirma que es un modelo de visión, los ficheros mmproj no están en este repositorio sino en el estático; su disponibilidad y calidad no están verificadas.
- Cuantizaciones de baja precisión: las versiones Q2 y Q3 pueden degradar notablemente la calidad; el propio autor recomienda IQ3_XXS frente a Q2_K y IQ3_XS frente a Q3_K_S.
- Información del modelo base escasa: no se documentan datos de entrenamiento, contexto ni benchmarks, lo que dificulta la evaluación rigurosa antes de producción.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-i1-GGUF
- Modelo base: https://huggingface.co/ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Swift-1.5-Qwen3.8-27B-Uncensored-MTP-i1-GGUF
- Licencia (modelo base): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- README de referencia para GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
