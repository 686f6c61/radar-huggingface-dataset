# Aydge/Qwen3.8-27B-Uncensored-Cyber-GGUF

## Resumen

**Qwen3.8-27B-Uncensored-Cyber-GGUF** es una colección de cuantizaciones GGUF para llama.cpp del modelo **Qwen3.8-27B-Uncensored-Cyber**, una variante des-censurada (abliterated) de Qwen3.8-27B, desarrollada por philbert440 y publicada en HuggingFace bajo el perfil de Aydge. El modelo está optimizado para responder de forma completa y sin rechazos preguntas de ciberofensiva y seguridad ofensiva, manteniendo las capacidades vision-language del modelo base. Se distribuye como GGUF con un proyector de visión separado (`mmproj`) para entrada de imágenes y una cabeza MTP (Multi-Token Prediction) opcional para decodificación especulativa. Es un modelo denso con 26.895.998.464 parámetros, adecuado para uso en local con llama.cpp o plataformas compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (vision-language, base Qwen3.8-27B) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | No procede (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M; mmproj en BF16 y Q8_0; mtp en BF16, Q8_0 y Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con mmproj y mtp separados; base en safetensors BF16) |
| Tamaño del repositorio | 104.9 GB |

## Arquitectura y entrenamiento

El modelo es una adaptación sobre la arquitectura del **Qwen3.8-27B** base, un modelo denso vision-language de la familia Qwen, descrito como optimizado para codificación, trabajo profesional, investigación y tareas agénticas de largo recorrido. Esta variante ha sido sometida a un proceso de **abliteration** para eliminar los rechazos de seguridad y ajustada específicamente para responder a preguntas de ciberofensiva y seguridad ofensiva. La model card indica que no se han publicado detalles sobre el número de tokens, la composición del dataset ni técnicas de alineación (RLHF/DPO). La iteración **v2** se presenta como una mejora respecto a la build anterior, con mayor tasa de respuestas sin rechazo y mejor puntuación factual en la evaluación propia. Incluye un proyector de visión (`mmproj`) y una cabeza MTP para decodificación especulativa, lo que permite acelerar la inferencia en llama.cpp.

## Capacidades

- Respuesta sin rechazos a prompts de ciberofensiva y seguridad ofensiva; en el conjunto de evaluación propio obtiene 100/100 en la métrica cyber-open.
- Entrada de imágenes mediante el proyector de visión (`mmproj`), compatible con el pipeline `image-text-to-text`; puede procesar capturas de pantalla, diagramas o fotos.
- Control flexible de pensamiento (modo de razonamiento) según la ficha del modelo base Qwen3.8-27B.
- Diseñado para tareas agénticas y razonamiento multi-paso de larga duración.
- Decodificación especulativa opcional mediante la cabeza MTP, con el objetivo de reducir la latencia de generación.
- Cuantizaciones escalables de Q4_K_M (tamaño reducido) a Q8_0 (casi sin pérdidas), permitiendo ajustar el equilibrio entre VRAM y calidad.

## Casos de uso

- **Auditoría de seguridad ofensiva autorizada:** el modelo responde directamente a preguntas sobre exploits, técnicas de evasión o escalada de privilegios, útil en pentesting legal donde se busca una respuesta sin filtros.
- **Análisis de malware:** genera explicaciones detalladas de comportamiento malicioso, desofuscación de código o indicadores de compromiso en entornos de laboratorio controlados.
- **Red teaming automatizado:** puede integrarse en pipelines de simulación de ataques para generar nuevos payloads o variantes que pongan a prueba la detección.
- **Formación avanzada en ciberseguridad:** crea material didáctico sobre técnicas ofensivas que los modelos generalistas suelen filtrar, permitiendo formar a analistas con ejemplos prácticos.
- **Asistente para desarrollo de herramientas ofensivas:** genera código en Python, Bash o frameworks como Metasploit, sin censurar los payloads.
- **Análisis forense de imágenes:** al aceptar entrada de imágenes, puede interpretar capturas de pantalla de paneles de ataque o logs visuales para completar informes técnicos.
- **Investigación de vulnerabilidades:** responde cuestiones sobre CVEs, pruebas de concepto o técnicas de explotación en un entorno controlado y con autorización legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye una evaluación propia realizada en BF16, juzgada por Claude, con un conjunto de 100 prompts ciber-ofensivos y un harness de rechazo por regex. Los resultados comparan la versión v2 con la build anterior:

| Métrica | Cyber v2 (este modelo) | Build anterior |
|---|---|---|
| Cyber-open ↑ (100/100) | 100/100 | 93/100 |
| Confab ↓ | 0.867 | 1.00 |
| Factual ↑ | 1.00 | 0.933 |
| GSM8K | 0.80 | 0.825 |
| Degen ↓ | 0.00 | 0.00 |

*Nota: cyber-open mide la proporción de respuestas sin rechazo; confab y factual son puntuaciones subjetivas del juez; degen mide degeneración. Estos resultados no son benchmarks externos.*

## Requisitos de hardware

- VRAM estimada para los pesos GGUF (sin incluir KV cache ni overhead del proyector/MTP): Q4_K_M ~16-18 GB, Q5_K_M ~19-21 GB, Q6_K ~22-24 GB, Q8_0 ~28-30 GB.
- GPU recomendadas: RTX 4090 (24 GB) o A100 40 GB para Q4_K_M/Q5_K_M; A100 80 GB o H100 para Q8_0 y contextos largos.
- Puede ejecutarse en GPU de consumo (RTX 3090/4090) con cuantización Q4_K_M.
- Despliegue en CPU mediante llama.cpp u Ollama es viable con la cuantización Q4_K_M, aunque con menor velocidad.
- Opciones de despliegue: llama.cpp (recomendado para GGUF), Ollama, LM Studio. El modelo base en safetensors puede utilizarse con vLLM o TGI, aunque el repositorio GGUF no se sirve directamente a través de vLLM.
- Latencia y throughput: no disponible en la información publicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Visión | Des-censurado |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 26.9B | no disponible | Apache-2.0 | sí (nativo) | no |
| Qwen3.8-27B-Uncensored-Cyber v2 (este modelo) | 26.9B | no disponible | Apache-2.0 | sí (mmproj) | sí |
| Build anterior de Cyber | 26.9B | no disponible | Apache-2.0 | sí (mmproj) | sí |

## Limitaciones y advertencias

- Al estar des-censurado, el modelo genera contenido potencialmente peligroso sin filtros; su uso debe restringirse a entornos autorizados y legales.
- No se dispone de estudios formales de sesgos; la abliteration puede afectar a la coherencia del modelo en dominios delicados.
- La evaluación disponible es propia y subjetiva (juez Claude) sobre un conjunto limitado, por lo que no debe extrapolarse como garantía de calidad general.
- La longitud de contexto y los idiomas soportados no están documentados en la información proporcionada.
- La licencia Apache-2.0 permite uso comercial y modificación, pero las implicaciones legales del contenido ofensivo recaen en el usuario.
- Los cuants GGUF no incluyen BF16 completo; Q4_K_M puede degradar la calidad respecto al modelo en BF16.

## Enlaces

- https://huggingface.co/Aydge/Qwen3.8-27B-Uncensored-Cyber-GGUF
- https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Cyber
- https://huggingface.co/Qwen/Qwen3.8-27B
- https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-uncensored-cyber-gguf-philbert440
