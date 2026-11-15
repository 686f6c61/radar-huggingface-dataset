# mradermacher/MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated-i1-GGUF

## Resumen

MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated-i1-GGUF es una cuantización en formato GGUF del modelo Austriani/MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated, publicada por el usuario mradermacher. Se trata de un modelo de aproximadamente 8.950 millones de parámetros (8,95 B) derivado de la familia Qwen (etiquetado como qwen3.5 en los tags) y destilado dentro del linaje MiMo-V2.6. La variante "ARA-Abliterated" indica que el modelo ha sido sometido a una ablación de rango arbitrario (Arbitrary Rank Ablation) para eliminar los mecanismos de rechazo, siguiendo la línea de herramientas como Heretic. El resultado es un modelo "uncensored" o "decensored".

El repositorio contiene únicamente pesos cuantizados en GGUF con calibración imatrix, pensados para inferencia local mediante llama.cpp y derivados. Los tags declaran capacidades multimodales (visión), agenticas, de tool use, de código, ciberseguridad y contexto largo, aunque la model card no aporta detalles técnicos sobre el entrenamiento ni sobre los datos utilizados. El modelo base declara licencia Apache 2.0.

La relevancia de esta ficha radica en que documenta un artefacto de cuantización de un modelo derivado y modificado, no un modelo original. La información disponible es escasa y proviene casi exclusivamente de los metadatos del repositorio y de la model card del cuantizador, por lo que muchos datos técnicos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen, etiquetada qwen3.5); detalles no disponibles |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el tag long-context sugiere contexto extendido, sin cifra) |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M (publicados); el listado interno menciona además Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_K_S, Q4_K_M, Q4_0, Q4_1, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | en (inglés) según metadatos |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado, con fichero imatrix separado); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna más allá de la etiqueta qwen3.5 y la naturaleza transformer implícita en el linaje Qwen. El modelo es una destilación (Distill) del linaje MiMo-V2.6 hacia un backbone Qwen de 9 B, pero la model card no especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

La innovación técnica declarada es la ablación de rango arbitrario (ARA, Arbitrary Rank Ablation) combinada con la metodología Heretic, orientada a eliminar los comportamientos de rechazo del modelo original. Esta modificación se aplica sobre el modelo base Austriani/MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated antes de la cuantización. El cuantizador aplica cuantización con imatrix (matriz de importancia) y pesos ponderados, lo que mejora la fidelidad de los cuantos de baja precisión respecto a cuantizaciones estáticas. No se documentan técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento y resolución de problemas (heredado del backbone Qwen y del linaje MiMo).
- Generación de código y asistencia en tareas de programación.
- Capacidades de ciberseguridad (declaradas en los tags, sin detalle).
- Tool calling y function calling (tag tool-use).
- Comportamiento agentico y razonamiento multi-paso (tag agentic).
- Procesamiento multimodal con visión (tag vision, multimodal); los ficheros mmproj, si existen, se alojan en el repositorio estático.
- Contexto largo (tag long-context, sin cifra concreta).
- Modo sin censura: rechazos eliminados mediante ablación, incluyendo contenido NSFW.
- Multilingüe limitado: los metadatos solo declaran inglés.

## Casos de uso

- Asistencia conversacional local: despliegue en llama.cpp u Ollama para chatbots multi-turno en inglés, aprovechando el tamaño de 9 B para caber en GPU de consumo con cuantizaciones Q4.
- Generación de código en entornos aislados: uso como asistente de programación en pipelines locales donde no se desea enviar código a APIs externas, con soporte de tool calling para integrarse en herramientas de desarrollo.
- Automatización agentica: construcción de agentes multi-paso que invocan funciones externas, gracias al tag agentic y al soporte de tool use.
- Análisis de documentos con imágenes: al ser un modelo multimodal con visión, puede procesar capturas, diagramas o documentos escaneados junto con texto (requiere el fichero mmproj del repositorio estático).
- Investigación sobre alineación y seguridad: el modelo ablacionado sirve como caso de estudio para analizar cómo la eliminación de rechazos afecta al comportamiento del modelo en dominios sensibles.
- Procesamiento de contextos largos: tareas de resumen o extracción sobre documentos extensos, sujeto a verificar la ventana de contexto real, que no se documenta.
- Evaluación de cuantizaciones: comparación de la calidad de los cuantos i1-Q2_K e i1-IQ3_M frente a los estáticos del repositorio hermano para estudiar el impacto de imatrix en modelos de 9 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero i1-Q2_K ocupa 3,9 GB y el i1-IQ3_M 4,5 GB; una cuantización Q4_K_M de un modelo de 9 B suele situarse en torno a 5,5-6 GB, y Q8 en torno a 9-10 GB (estimación por tamaño, no confirmada en la model card).
- GPU recomendadas: para cuantizaciones Q2-IQ3 basta una GPU de consumo con 6-8 GB de VRAM (RTX 3060, RTX 4060); para Q4-Q5 se recomienda 8-12 GB (RTX 4070, RTX 4080); para Q8 o precisión completa se requiere 16-24 GB (RTX 4090, A100).
- Cabe en GPU de consumo: sí, con las cuantizaciones bajas publicadas (i1-Q2_K e i1-IQ3_M) en tarjetas de 6-8 GB.
- Opciones de despliegue: llama.cpp y sus frontales (Ollama, LM Studio, llama-cpp-python); el formato GGUF no es compatible directamente con vLLM ni TGI sin conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated-i1-GGUF (este) | 8,95 B | no disponible | Apache 2.0 | GGUF (i1) | Cuantización imatrix de un modelo ablacionado |
| MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated-GGUF (estático) | 8,95 B | no disponible | Apache 2.0 | GGUF (estático) | Mismo modelo base, cuantización sin imatrix; incluye mmproj |
| Qwen 9B de referencia (backbone) | ~9 B | no disponible | según variante | safetensors/GGUF | Modelo original sin ablación ni destilación MiMo |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La ablación de rechazos elimina los mecanismos de seguridad del modelo original; puede generar contenido dañino, NSFW o legalmente problemático sin filtros.
- El modelo está marcado como not-for-all-adversaries y NSFW; no es apto para aplicaciones orientadas al público general sin moderación adicional.
- Riesgo elevado de alucinación no cuantificado; no hay benchmarks que lo midan.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está verificado.
- La ventana de contexto real no está documentada pese al tag long-context.
- La cuantización i1-Q2_K es de baja calidad (el propio autor sugiere IQ3_XXS como alternativa); puede degradar el razonamiento y la coherencia.
- La licencia Apache 2.0 se hereda del modelo base, pero la modificación por ablación puede plantear dudas sobre la responsabilidad de uso; verificar la licencia del modelo base original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria del artefacto.
- El tamaño del repo (71,5 GB) incluye múltiples cuantizaciones; descargar solo el fichero necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated-i1-GGUF
- Modelo base: https://huggingface.co/Austriani/MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#MiMo-V2.6-Distill-Qwen-9B-ARA-Abliterated-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
