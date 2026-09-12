# Lazybit666/Ornith-1.5-9B-uncensored-GGUF

## Resumen

Este repositorio contiene una colección de cuantizaciones en formato GGUF del modelo Ornith-1.5-9B-uncensored, desarrollado originalmente por el usuario junafinity y redistribuido por Lazybit666. Se trata de un modelo de aproximadamente 8.953.803.264 parámetros (unos 8,95B) orientado a conversación, cuyas etiquetas indican que ha sido sometido a un proceso de "abliteration" (eliminación o atenuación de la dirección de rechazo en el espacio de activaciones) y que incorpora capacidades multimodales de visión. La model card incluida en el repositorio corresponde al trabajo de cuantización de mradermacher, no a una descripción técnica del entrenamiento del modelo.

El interés práctico del modelo reside en que permite ejecutar un LLM multimodal de ~9B sin los filtros de contenido habituales en hardware local, ya que se ofrecen cuantizaciones que van desde Q2_K (3,9 GB) hasta f16 (18,0 GB), además de dos ficheros mmproj (Q8_0 de 0,7 GB y f16 de 1,0 GB) para el proyector visual. La licencia declarada es Apache-2.0 y el único idioma soportado declarado es el inglés.

La información publicada es muy limitada: no se detalla la arquitectura interna, la longitud de contexto, el volumen o composición de los datos de entrenamiento, ni resultados de benchmarks. El repositorio no registra descargas ni valoraciones, y la búsqueda web no ha devuelto ninguna referencia relevante al modelo (los resultados obtenidos corresponden a un portal corporativo de recursos humanos sin relación alguna).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (las etiquetas incluyen `qwen3_5`, lo que sugiere una base derivada de la familia Qwen 3.5, sin confirmar) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no se confirma que la arquitectura sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); no disponible para el modelo base |
| Modelo base | junafinity/Ornith-1.5-9B-uncensored |
| Tamano del repositorio | 83,0 GB |
| Fecha de creacion (metadatos) | 2026-09-12 |

## Arquitectura y entrenamiento

No se ha publicado información verificable sobre la arquitectura interna del modelo. Las etiquetas del repositorio mencionan `ornith`, `qwen3_5`, `abliterated`, `uncensored`, `zerofuse`, `multimodal` y `vision`, lo que apunta a un transformer derivado de una base de la familia Qwen 3.5 y posteriormente modificado mediante técnicas de abliteration. No se especifica si se trata de un modelo denso o de mezcla de expertos, ni el número de capas, cabezas de atención o dimensión oculta.

La presencia de dos ficheros `mmproj` (proyector multimodal) indica que el modelo acepta entradas de imagen además de texto, siguiendo el esquema habitual de los GGUF multimodales compatibles con llama.cpp: un codificador visual independiente cuyos embeddings se proyectan al espacio del modelo de lenguaje. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de ajuste por instrucciones, RLHF o DPO. Tampoco hay información sobre innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Procesamiento de imágenes mediante el proyector multimodal (ficheros `mmproj`), lo que habilita tareas de descripción, respuesta a preguntas visuales y análisis de capturas o documentos escaneados.
- Comportamiento sin censura: el proceso de abliteration busca reducir la tasa de rechazos ante peticiones que un modelo alineado estándar declinaría.
- Soporte de tool calling / function calling: no disponible (no se documenta en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según los metadatos (`language: en`).
- Modo "thinking" o razonamiento explícito: no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Escritura creativa y de ficción sin restricciones temáticas: el modelo puede generar narrativa con violencia, contenido adulto o temas controvertidos que un modelo alineado rechazaría, útil para autores que necesitan borradores sin fricción de filtros.
- Descripción automática de imágenes (captioning) para construcción de datasets: gracias al proyector multimodal se pueden generar descripciones textuales de lotes de imágenes de forma local, sin enviar datos a servicios externos.
- Análisis de documentos escaneados en inglés: el modelo puede combinar OCR implícito y razonamiento sobre el contenido visual (facturas, formularios, capturas de pantalla) en un pipeline con llama.cpp.
- Asistente conversacional local en inglés: con cuantizaciones Q4_K_M (5,7 GB) puede desplegarse en un portátil con GPU de gama media para conversaciones privadas sin conexión.
- Investigación sobre alineación y seguridad: el modelo sirve como objeto de estudio para comparar la tasa de rechazo, la degradación de capacidades y los sesgos residuales introducidos por la abliteration frente al modelo base.
- Red teaming y evaluación de salvaguardas: permite generar intentos de jailbreak y contenido adversario en un entorno controlado para probar clasificadores de seguridad.
- Prototipado rápido de aplicaciones multimodales en hardware de consumo: al existir cuantizaciones desde 3,9 GB, es posible validar una idea de producto (por ejemplo, un bot que responde sobre imágenes) antes de invertir en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuación son estimaciones derivadas del tamaño de cada fichero GGUF (dato sí publicado en la model card) más un margen para la caché KV; no proceden de mediciones oficiales.

- VRAM estimada para inferencia (solo pesos, sin contexto):
  - Q2_K (3,9 GB): ~5 GB.
  - Q3_K_M (4,7 GB): ~6 GB.
  - Q4_K_S / Q4_K_M (5,5 / 5,7 GB): ~7 GB.
  - Q5_K_S / Q5_K_M (6,4 / 6,6 GB): ~8 GB.
  - Q6_K (7,5 GB): ~9 GB.
  - Q8_0 (9,6 GB): ~11-12 GB.
  - f16 (18,0 GB): ~20-22 GB.
  - Añadir 0,7-1,0 GB adicionales si se carga el proyector multimodal (`mmproj`).
- GPU recomendadas: RTX 3060 12 GB o RTX 4070 para cuantizaciones Q4/Q5 con contexto moderado; RTX 4090 24 GB para Q8_0 o f16; A100 40/80 GB o H100 para despliegues en f16 con lotes grandes.
- Cabe en GPU de consumo: sí, con cuantizaciones Q2_K a Q6_K en tarjetas de 6-12 GB; Q8_0 y f16 requieren 12-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python, text-generation-webui. Para la modalidad de visión es necesario un backend basado en llama.cpp con soporte `mtmd`. El soporte de vLLM y TGI para GGUF es limitado y no está documentado para este repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Lazybit666/Ornith-1.5-9B-uncensored-GGUF | ~8,95B | no disponible | apache-2.0 | GGUF | 0 descargas, 0 likes |
| junafinity/Ornith-1.5-9B-uncensored (base) | ~8,95B | no disponible | no disponible | no disponible | repositorio de origen |
| mradermacher/Ornith-1.5-9B-uncensored-GGUF | ~8,95B | no disponible | apache-2.0 (heredada) | GGUF (quants estáticos) | público |
| mradermacher/Ornith-1.5-9B-uncensored-i1-GGUF | ~8,95B | no disponible | apache-2.0 (heredada) | GGUF (quants con imatrix) | público |

No se dispone de datos de rendimiento que permitan comparar este modelo con alternativas de otros desarrolladores (por ejemplo, familias densas de ~8-9B con o sin visión) en términos de MMLU, HumanEval o GSM8K, por lo que la comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Ausencia total de validación comunitaria: el repositorio registra 0 descargas y 0 likes, por lo que no existe evidencia externa sobre la calidad, la integridad de los ficheros o el comportamiento real del modelo.
- Riesgo de contenido dañino: al ser un modelo "uncensored" obtenido por abliteration, es previsible que genere contenido violento, sexual, ilegal o discriminatorio ante peticiones adecuadas, con implicaciones legales y de cumplimiento si se expone a usuarios finales.
- Degradación de capacidades: la abliteration suele reducir el rendimiento en tareas de razonamiento, instrucciones complejas y coherencia a largo plazo; no hay datos que cuantifiquen esa pérdida en este caso.
- Sesgos conocidos: no disponible (no se ha publicado ninguna evaluación).
- Alucinación: sin benchmarks ni evaluaciones publicadas, no puede estimarse la tasa de alucinación.
- Limitación de idioma: solo se declara inglés; no hay evidencia de competencia en castellano u otros idiomas.
- Longitud de contexto desconocida: impide planificar casos de uso que dependan de ventanas largas (por ejemplo, análisis de documentación extensa).
- Procedencia del repositorio: la model card incluida corresponde a mradermacher y referencia rutas de descarga de `mradermacher/...`, no de `Lazybit666/...`. Esto sugiere que el repositorio redistribuye ficheros de terceros; conviene verificar el hash de los GGUF antes de usarlos en producción.
- Fecha de creación inconsistente: los metadatos indican 2026-09-12, una fecha posterior a la actual, lo que apunta a un problema de registro o a un repositorio generado automáticamente.
- Licencia: aunque se declara Apache-2.0, este tipo de licencia no exime del cumplimiento de normativas de contenido ni de las condiciones de uso del modelo base, que no están documentadas en la información disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lazybit666/Ornith-1.5-9B-uncensored-GGUF
- Modelo base: https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored
- Cuantizaciones estáticas de referencia (mradermacher): https://huggingface.co/mradermacher/Ornith-1.5-9B-uncensored-GGUF
- Cuantizaciones con imatrix (mradermacher): https://huggingface.co/mradermacher/Ornith-1.5-9B-uncensored-i1-GGUF
- Página de resumen de cuantizaciones: https://hf.tst.eu/model#Ornith-1.5-9B-uncensored-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafo comparativo de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
