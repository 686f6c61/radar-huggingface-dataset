# mradermacher/TEMPURA-Qwen2.5-VL-7B-GGUF

## Resumen

TEMPURA-Qwen2.5-VL-7B-GGUF es la versión cuantizada en formato GGUF del modelo andaba/TEMPURA-Qwen2.5-VL-7B, un ajuste fino especializado en vídeo construido sobre Qwen2.5-VL-7B. La cuantización la publica mradermacher, autor habitual de conversiones GGUF para inferencia local, y conserva la licencia Apache 2.0 del modelo original. El repositorio pesa 70,4 GB en total, aunque cada archivo individual ocupa entre 3,1 GB (Q2_K) y 15,3 GB (f16).

El modelo resuelve tareas de comprensión de vídeo poco cubiertas por los asistentes multimodales genéricos: generación de descripciones densas de vídeo (dense video captioning), localización temporal de eventos (temporal grounding), detección de momentos destacados (highlight detection) y razonamiento sobre secuencias temporales. Estas capacidades se derivan del ajuste sobre el dataset andaba/TEMPURA-VER, y aparecen declaradas explícitamente en las etiquetas del repositorio.

Su relevancia actual reside en que permite ejecutar un modelo de razonamiento sobre vídeo de 7.615.616.512 parámetros en hardware de consumo mediante cuantización, algo que los pesos originales en safetensors con precisión completa no permiten con comodidad. La contrapartida es que se trata de un derivado de nicho, con documentación escasa: la model card del repositorio GGUF describe únicamente el proceso de cuantización, y no incluye detalles de entrenamiento, evaluación ni benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) denso, heredada de Qwen2.5-VL-7B; los detalles concretos de la arquitectura no se especifican en la información disponible |
| Parámetros totales | 7.615.616.512 (dato de safetensors del modelo base) |
| Parámetros activos | No aplica: modelo denso, no es una arquitectura MoE |
| Longitud de contexto | No disponible en la información proporcionada. El modelo base Qwen2.5-VL-7B se documenta habitualmente con 128 000 tokens de contexto, dato no confirmado en esta ficha |
| Tipos de cuantización | mmproj-Q8_0, mmproj-f16 (suplemento multimodal); Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés, según la etiqueta `language` de la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base andaba/TEMPURA-Qwen2.5-VL-7B) |
| Tamaño del repositorio | 70,4 GB |
| Cuantizador | mradermacher |
| Modelo base | andaba/TEMPURA-Qwen2.5-VL-7B |
| Dataset de ajuste (base) | andaba/TEMPURA-VER |

## Arquitectura y entrenamiento

Este repositorio no contiene un entrenamiento nuevo, sino una conversión estática a GGUF del modelo andaba/TEMPURA-Qwen2.5-VL-7B. Los metadatos internos del proceso de cuantización indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, una cuantización por tensores de salida partiendo de pesos en formato Hugging Face. El autor señala explícitamente que no hay cuantizaciones ponderadas ni con imatrix (weighted/imatrix quants) en el momento de publicar el repositorio, solo las estáticas, y que pueden solicitarse mediante una discusión comunitaria.

Respecto al modelo base, la información disponible es mínima: se sabe que es un ajuste de Qwen2.5-VL-7B sobre el dataset andaba/TEMPURA-VER y que está orientado a tareas de vídeo (descripción densa, localización temporal, detección de destacados y razonamiento temporal). No se dispone del número de tokens de entrenamiento, de la composición del dataset, ni de si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documenta ninguna innovación técnica propia del ajuste más allá de la especialización temática.

El elemento arquitectónico relevante para el despliegue es el suplemento multimodal (`mmproj`) separado: en llama.cpp, un modelo de visión-lenguaje en GGUF requiere un archivo proyector adicional además de los pesos del modelo de lenguaje. El repositorio ofrece dos versiones del proyector, mmproj-Q8_0 (1,0 GB) y mmproj-f16 (1,5 GB).

## Capacidades

- Generación de descripciones densas de vídeo (dense video captioning): produce narraciones detalladas del contenido de una secuencia, no solo una etiqueta global.
- Localización temporal (temporal grounding): identifica el intervalo de tiempo concreto en el que ocurre un evento descrito en lenguaje natural.
- Detección de momentos destacados (highlight detection): señala los fragmentos más relevantes de un vídeo.
- Razonamiento sobre vídeo (video reasoning): responde a preguntas que requieren relacionar información distribuida a lo largo de la secuencia temporal.
- Procesamiento multimodal de imagen y texto, heredado de la familia Qwen2.5-VL, incluida la lectura de gráficos, diagramas y esquemas de documento.
- Salida conversacional multi-turno (etiqueta `conversational` del repositorio).
- Compatibilidad declarada con `endpoints_compatible` y con el stack de `transformers`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card declara únicamente inglés (`en`).
- Modo de razonamiento explícito (thinking mode), audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Indexado y búsqueda en plataformas de vídeo: generar descripciones densas de cada fragmento permite construir índices semánticos que respondan a consultas textuales sobre el contenido de un vídeo, en lugar de depender únicamente de títulos y etiquetas manuales.
- Generación automática de clips destacados: la detección de momentos destacados permite a un editor o a un sistema de publicación automática extraer los tramos más relevantes de una grabación larga (partidos, ponencias, directos) sin revisión manual completa.
- Localización temporal para postproducción: dado un guion o una descripción textual, el modelo puede devolver el intervalo temporal correspondiente, lo que acelera el montaje al permitir buscar por contenido y no por marcas de tiempo.
- Archivística y gestión documental audiovisual: catalogación de fondos de vídeo con metadatos descriptivos generados automáticamente, útiles para bibliotecas, hemerotecas y archivos de televisión.
- Análisis de vídeo de vigilancia o industrial: razonamiento sobre secuencias grabadas para localizar eventos descritos en lenguaje natural, con la ventaja de que el despliegue local en GGUF evita enviar el material a servicios externos.
- Investigación académica en comprensión de vídeo: uso como línea base reproducible y ejecutable en una sola GPU para comparar técnicas de captioning denso o grounding temporal sin depender de clústeres.
- Asistentes de accesibilidad: generación de descripciones narradas de contenido audiovisual para personas con discapacidad visual, aprovechando la granularidad temporal del modelo.
- Preprocesado en pipelines de moderación: detección y localización de fragmentos que requieren revisión humana, reduciendo el volumen de vídeo que debe examinarse manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para los pesos según cuantización: Q2_K 3,1 GB; Q3_K_S 3,6 GB; Q3_K_M 3,9 GB; Q3_K_L 4,2 GB; IQ4_XS 4,4 GB; Q4_K_S 4,6 GB; Q4_K_M 4,8 GB; Q5_K_S 5,4 GB; Q5_K_M 5,5 GB; Q6_K 6,4 GB; Q8_0 8,2 GB; f16 15,3 GB.
- Hay que sumar el suplemento multimodal: 1,0 GB (mmproj-Q8_0) o 1,5 GB (mmproj-f16), más la caché KV, que depende de la longitud de contexto configurada y del número de capas descargadas a GPU.
- GPU de consumo: las cuantizaciones Q4_K_M y Q4_K_S con mmproj-Q8_0 caben en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 8/16 GB) si se reserva margen para la caché KV. Q8_0 con mmproj requiere aproximadamente 9,5-10 GB y encaja en RTX 4070 Ti Super, RTX 4080 o RTX 4090. La versión f16 con mmproj-f16 ronda los 17 GB y exige 24 GB de VRAM (RTX 3090, RTX 4090) o GPU de datacenter.
- GPU de datacenter: A100 40 GB, A100 80 GB y H100 permiten ejecutar cualquier cuantización con contexto amplio y varios procesos concurrentes.
- CPU: llama.cpp permite descarga parcial de capas a CPU; las cuantizaciones Q2_K a Q4_K_M son viables en equipos con 16-32 GB de RAM, con latencias muy superiores a las de GPU.
- Opciones de despliegue: llama.cpp (incluido `llama-server` con soporte de proyector multimodal), Ollama, LM Studio y otros frontends basados en llama.cpp. Para motores que operan con safetensors, como vLLM o TGI, no se documenta en la información disponible soporte de este GGUF multimodal; en ese caso habría que partir del modelo base andaba/TEMPURA-Qwen2.5-VL-7B.
- Latencia y throughput: no disponibles. Al procesar vídeo, el coste dominante suele ser el número de fotogramas muestreados, no solo el tamaño del modelo.
- Almacenamiento: el repositorio completo ocupa 70,4 GB, pero solo es necesario descargar el archivo de cuantización elegido y el `mmproj` correspondiente.

## Comparativa con modelos similares

| Modelo | Parámetros | Especialización | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| mradermacher/TEMPURA-Qwen2.5-VL-7B-GGUF | 7,6 mil millones | Vídeo: captioning denso, grounding temporal, highlight detection | No disponible | apache-2.0 | GGUF | 13 cuantizaciones más 2 proyectores multimodales |
| andaba/TEMPURA-Qwen2.5-VL-7B | No disponible (es el modelo base de este repositorio) | Vídeo (misma especialización) | No disponible | apache-2.0 | safetensors | Pesos originales sin cuantizar; necesario para vLLM o TGI |
| mradermacher/Qwen2.5-VL-7B-Instruct-GGUF | No disponible | Asistente multimodal general (imagen, texto y vídeo) | No disponible | No disponible en la información recogida | GGUF | Alternativa generalista sin el ajuste sobre TEMPURA-VER |
| mradermacher/Qwen2.5-VL-7B-Instruct-abliterated-GGUF | No disponible | Asistente multimodal general sin rechazos | No disponible | No disponible en la información recogida | GGUF | Variante «abliterated»; comportamiento alineado distinto |

La comparación cuantitativa de rendimiento entre estas alternativas no es posible con la información disponible: no hay benchmarks publicados para ninguno de los repositorios consultados.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente inglés (`en`). No hay evidencia de soporte fiable de castellano en las tareas especializadas de vídeo.
- Ausencia total de evaluación: no hay benchmarks, métricas ni comparaciones publicadas. Cualquier decisión de producción debería apoyarse en una validación propia sobre el dominio objetivo.
- Degradación por cuantización: el propio autor enlaza el gráfico de perplejidad de ikawrakow y las notas de Artefact2, que muestran un empeoramiento claro en Q2_K y Q3_K. Para tareas de localización temporal precisa, estas cuantizaciones bajas son desaconsejables.
- Cuantizaciones estáticas: no hay versiones ponderadas ni con imatrix, lo que según el autor puede implicar una calidad algo inferior frente a las cuantizaciones ponderadas equivalentes.
- Dependencia del proyector multimodal: sin el archivo `mmproj` no es posible procesar entrada visual; olvidarlo es un error habitual al desplegar modelos de visión en llama.cpp.
- Riesgo de alucinación: en descripción de vídeo, el modelo puede generar eventos o detalles que no aparecen en la secuencia, especialmente con cuantizaciones agresivas o secuencias largas con pocos fotogramas muestreados.
- Especialización estrecha: es un ajuste fino sobre un dataset concreto (andaba/TEMPURA-VER). No se documenta cómo se conservan las capacidades conversacionales generales del modelo base tras el ajuste.
- Licencia: apache-2.0 permite uso comercial y modificación con obligación de conservar avisos de copyright y licencia. No se especifican en la información disponible condiciones adicionales que pudiera imponer el modelo base o el dataset de ajuste; conviene verificarlas antes de un despliegue comercial.
- Repositorio de 70,4 GB: descargar el repositorio completo es innecesario y puede agotar el espacio en disco; hay que seleccionar el archivo concreto.
- Madurez: el repositorio registra 0 descargas y 0 «likes» en los datos consultados, por lo que no existe validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/TEMPURA-Qwen2.5-VL-7B-GGUF
- Modelo base: https://huggingface.co/andaba/TEMPURA-Qwen2.5-VL-7B
- Dataset de ajuste: https://huggingface.co/datasets/andaba/TEMPURA-VER
- Vista general de cuantizaciones del autor: https://hf.tst.eu/model#TEMPURA-Qwen2.5-VL-7B-GGUF
- Proyector multimodal mmproj-Q8_0: https://huggingface.co/mradermacher/TEMPURA-Qwen2.5-VL-7B-GGUF/resolve/main/TEMPURA-Qwen2.5-VL-7B.mmproj-Q8_0.gguf
- Proyector multimodal mmproj-f16: https://huggingface.co/mradermacher/TEMPURA-Qwen2.5-VL-7B-GGUF/resolve/main/TEMPURA-Qwen2.5-VL-7B.mmproj-f16.gguf
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Alternativa generalista GGUF: https://huggingface.co/mradermacher/Qwen2.5-VL-7B-Instruct-GGUF
- Alternativa «abliterated» GGUF: https://huggingface.co/mradermacher/Qwen2.5-VL-7B-Instruct-abliterated-GGUF
- Ficha de Qwen2.5-VL-7B en LM Studio: https://lmstudio.ai/models/qwen/qwen2.5-vl-7b
