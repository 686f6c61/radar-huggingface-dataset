# mradermacher/qwen3-vl-radiology-v1-GGUF

## Resumen

qwen3-vl-radiology-v1-GGUF es la versión cuantizada en formato GGUF del modelo jpdealba/qwen3-vl-radiology-v1, un ajuste fino de la familia Qwen3-VL orientado al dominio de radiología. El trabajo de cuantización lo firma mradermacher, un conocido publicador de versiones GGUF de modelos abiertos, y distribuye el modelo en una batería de cuantizaciones estáticas que van de Q2_K (1,8 GB) a f16 (8,2 GB), además de los ficheros mmproj necesarios para el procesamiento multimodal.

El modelo base cuenta con 4.022.468.096 parámetros (aproximadamente 4 mil millones) y conserva la arquitectura multimodal de Qwen3-VL, lo que le permite procesar imágenes junto con texto, una capacidad esencial para interpretar estudios radiológicos. La licencia Apache 2.0 facilita su uso comercial y su integración en productos, algo poco habitual en modelos especializados en dominios médicos.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa ligera y desplegable en hardware de consumo para tareas de apoyo radiológico; por otro, advierte de que se trata de un modelo de dominio específico, sin benchmarks publicados en la información disponible, y que en ningún caso sustituye el criterio de un profesional sanitario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Qwen3-VL, la familia multimodal de Alibaba Qwen que combina un codificador visual con un transformer de lenguaje. La versión cuantizada conserva esa estructura: los pesos del modelo de lenguaje se distribuyen en los ficheros GGUF principales, mientras que el codificador visual se empaqueta por separado en los ficheros mmproj (Q8_0 de 0,6 GB o f16 de 0,9 GB), que deben cargarse junto al modelo para habilitar la entrada de imágenes.

No se dispone de información detallada sobre el proceso de entrenamiento del ajuste fino: no se especifican el número de tokens, la composición del dataset radiológico, ni si se aplicaron técnicas de RLHF o DPO. El autor de la cuantización indica que se trata de cuantizaciones estáticas y que no tiene previsto publicar versiones con imatrix (weighted) a corto plazo, lo que implica que la calidad de las cuantizaciones bajas puede ser inferior a la de variantes ponderadas equivalentes.

## Capacidades

- Generación de texto y razonamiento sobre contenido clínico y radiológico.
- Procesamiento de imágenes médicas gracias al codificador visual incluido en los ficheros mmproj.
- Conversación multi-turno (tag conversational en Hugging Face).
- Soporte de tool calling y function calling heredado de la familia Qwen3-VL (no verificado en esta cuantización concreta).
- Capacidades multilingües limitadas: la model card declara únicamente inglés.
- Compatibilidad con endpoints (tag endpoints_compatible) para despliegue como servicio.
- No se documentan modos de pensamiento explícito (thinking mode) ni capacidades de audio en la información disponible.

## Casos de uso

- Apoyo a la lectura de estudios radiológicos: el modelo puede recibir una imagen (radiografía, TC, RM) junto con una pregunta en texto y generar una descripción o respuesta orientativa, útil como segunda opinión o herramienta de formación para residentes.
- Triaje preliminar en entornos con escasez de radiólogos: despliegue en un servidor modesto para priorizar estudios con hallazgos potencialmente críticos antes de la revisión humana.
- Generación de informes estructurados: a partir de una imagen y una plantilla, el modelo puede redactar borradores de informe que el especialista revisa y firma, reduciendo el tiempo de dictado.
- Educación y simulación: creación de casos de entrenamiento con preguntas y respuestas sobre imágenes radiológicas para plataformas de e-learning médico.
- Investigación en visión-lenguaje médica: modelo ligero (4B) y con licencia Apache 2.0 que sirve como baseline para experimentos de ajuste fino o evaluación de técnicas de cuantización en dominio clínico.
- Despliegue en hardware de consumo: con cuantizaciones Q4_K_M (2,6 GB) o Q5_K_M (3,0 GB) cabe en GPUs de 8 GB, lo que permite prototipado local sin infraestructura cloud.
- Integración en pipelines de documentación clínica: uso del modelo como componente de un sistema mayor que extrae hallazgos de imágenes y los inserta en historiales electrónicos, siempre con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GB con Q4_K_M o Q5_K_M (incluyendo overhead de contexto y mmproj); en torno a 4,5-5,5 GB con Q8_0; alrededor de 8-9 GB con f16.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues con alta concurrencia.
- Cabe en GPU de consumo: sí, desde GPUs de 8 GB con cuantizaciones Q4 o Q5; también puede ejecutarse en CPU con llama.cpp, aunque con latencia mayor.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (TGI, según los tags del repo) y servidores compatibles con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán de la cuantización, del hardware y del tamaño de las imágenes de entrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qwen3-vl-radiology-v1-GGUF | 4,0B | no disponible | Apache 2.0 | GGUF | Ajuste fino radiológico, multimodal, cuantizaciones de 1,8 a 8,2 GB |
| Qwen3-VL base (4B) | ~4B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo generalista sin especialización médica |
| LLaVA-Med | ~7B | no disponible | no disponible | safetensors | Modelo de visión-lenguaje biomédico, más pesado y con licencia distinta |
| Med-Flamingo | ~8B | no disponible | no disponible | safetensors | Especializado en preguntas visuales médicas, no disponible en GGUF |

La comparativa se limita a alternativas de la misma categoría (visión-lenguaje médico); no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo de dominio médico sin benchmarks publicados: no hay evidencia cuantitativa de su precisión diagnóstica.
- Riesgo elevado de alucinación en un contexto clínico: cualquier salida debe ser revisada por un profesional sanitario cualificado.
- Sesgos potenciales derivados del dataset de ajuste fino, cuya composición y procedencia no se documentan.
- Idioma limitado al inglés según la model card; el rendimiento en castellano no está garantizado.
- Longitud de contexto no especificada, lo que dificulta planificar conversaciones largas o informes extensos.
- Las cuantizaciones bajas (Q2_K, Q3_K) pueden degradar la calidad de forma notable, especialmente en tareas de percepción visual fina.
- Aunque la licencia Apache 2.0 permite uso comercial, la legislación sanitaria (MDR en la UE, FDA en EE. UU.) exige certificación específica para software médico; este modelo no la tiene.
- No debe utilizarse como dispositivo médico ni para decisiones clínicas autónomas.

## Enlaces

- Hugging Face (cuantización): https://huggingface.co/mradermacher/qwen3-vl-radiology-v1-GGUF
- Modelo base: https://huggingface.co/jpdealba/qwen3-vl-radiology-v1
- Página de descargas del cuantizador: https://hf.tst.eu/model#qwen3-vl-radiology-v1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Discusión sobre calidad de cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
