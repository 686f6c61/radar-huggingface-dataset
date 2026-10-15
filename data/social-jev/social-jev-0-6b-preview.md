# social-jev/social-jev-0.6B-preview

## Resumen

SocialJev es una familia de modelos fundacionales de clasificación orientados a ciencias sociales, desarrollada por el usuario u organización social-jev. La ficha publicada corresponde a la variante de previsualización social-jev-0.6B-preview, un ajuste fino (finetune) sobre el modelo base Qwen/Qwen3-0.6B con 596.050.945 parámetros reales en safetensors y un repositorio de 1,2 GB.

El modelo no se plantea como un generador de texto conversacional, sino como un clasificador configurable mediante una interfaz tipada: el usuario define una tarea en lenguaje natural y su conjunto de opciones de respuesta, y el modelo clasifica documentos contra esas opciones, de forma individual o por lotes, sin necesidad de reentrenar por cada nueva tarea de etiquetado.

Es relevante porque ataca un cuello de botella habitual en investigación social cuantitativa y cualitativa, como es el etiquetado manual de corpus (programas electorales, actas, encuestas, prensa) con esquemas de códigos cambiantes. Sin embargo, se trata de una versión preview con 0 descargas y 0 likes, sin licencia declarada, sin idiomas declarados y sin resultados de benchmarks publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada del modelo base Qwen/Qwen3-0.6B; el detalle de las modificaciones introducidas por el autor no está disponible |
| Parámetros totales | 596.050.945 (≈0,6 B), según safetensors |
| Parámetros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo se publican pesos en safetensors; no se listan variantes GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Librería | transformers (con `trust_remote_code=True`) |
| Pipeline declarado | feature-extraction (con capacidad de clasificación) |
| Modelo base | Qwen/Qwen3-0.6B (finetune) |
| Tamaño del repositorio | 1,2 GB |
| Fecha de creación | 2026-10-15 |
| Última actualización | 2026-10-15 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible indica únicamente que social-jev-0.6B-preview es un ajuste fino sobre Qwen/Qwen3-0.6B, un transformer decoder-only de aproximadamente 0,6 B de parámetros. El repositorio declara el tag `custom_code`, lo que implica que el modelo requiere `trust_remote_code=True` al cargarse con `AutoModel.from_pretrained` y que incorpora código propio del autor (paquete `social_jev`) para la construcción de consultas y la ejecución de la clasificación.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineamiento, ni innovaciones arquitectónicas concretas (atención lineal, decodificación especulativa, cabezas de clasificación adicionales, etc.). El pipeline declarado es `feature-extraction` y los tags incluyen `classification` y `social_jev`, lo que apunta a una adaptación orientada a producir representaciones o decisiones de etiquetado en lugar de texto libre.

## Capacidades

- Clasificación de documentos mediante una interfaz tipada: se define una `Query` con el texto de la pregunta (por ejemplo, "¿A qué área de política se refiere este documento?") y la lista de `options` (por ejemplo, "Transport", "Education", "Healthcare") y el modelo devuelve la clasificación para cada documento.
- Procesamiento por lotes: la API `model.query([...])` acepta una lista de `Request`, cada uno con un campo `state` (el documento o estado) y una o varias `queries`, y devuelve resultados indexados por petición y consulta.
- Soporte de múltiples consultas por documento dentro de la misma llamada, lo que permite codificar varias variables de un mismo texto.
- Extracción de características, según el pipeline declarado (`feature-extraction`) en la ficha de HuggingFace.
- Carga mediante dos vías: `transformers.AutoModel.from_pretrained(..., trust_remote_code=True)` y la API de alto nivel `SocialJev.from_pretrained(...)`.
- Soporte de tool calling / function calling: no disponible.
- Soporte explícito de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas en la ficha).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Codificación de áreas de política en documentos administrativos: definir una `Query` con las áreas relevantes (transporte, educación, sanidad, vivienda) y clasificar automáticamente actas municipales, boletines oficiales o planes estratégicos, aprovechando que el esquema de etiquetas se define en la propia consulta y puede cambiarse sin reentrenar.
- Análisis de programas electorales y discursos parlamentarios: etiquetar miles de fragmentos según ejes temáticos o de posición, con múltiples `queries` por documento para cubrir varios ejes analíticos en una sola pasada.
- Codificación de respuestas abiertas de encuestas: clasificar respuestas de texto libre en categorías predefinidas (por ejemplo, motivo de queja, nivel de acuerdo) manteniendo el esquema de códigos explícito y auditable en la consulta.
- Asistencia a la anotación en investigación cualitativa: generar una preanotación sobre corpus de entrevistas o prensa que después revisa el investigador, reduciendo el coste de la codificación manual inicial.
- Depuración y filtrado de corpus para revisión sistemática: clasificar resúmenes o abstracts según criterios de inclusión/exclusión definidos como opciones de la consulta, para priorizar qué documentos pasa a lectura completa.
- Construcción de series temporales comparables: aplicar el mismo esquema de clasificación de forma consistente a documentos de distintos años o países, reduciendo la varianza entre codificadores humanos.
- Prototipado de instrumentos de medición: usar la versión preview para validar rápidamente si un esquema de categorías es discriminativo antes de invertir en anotación humana a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 1,2 GB en el repositorio. En precisión de 16 bits (fp16/bf16) la estimación es de aproximadamente 1,2 GB de pesos; en fp32, en torno a 2,4 GB. Hay que sumar el consumo del código personalizado, del tokenizador y de los estados intermedios de activaciones, por lo que una estimación práctica de trabajo se sitúa en el rango de 2 a 4 GB.
- GPU recomendadas: por tamaño, el modelo es apto para GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores. También es viable en GPUs de datacenter (A100, H100) si se busca throughput agregado por lotes.
- Cabe en GPU de consumo: sí, con margen amplio; con 0,6 B de parámetros es probable que funcione incluso en iGPU con memoria compartida y en CPU para cargas por lotes moderadas.
- Requisitos específicos: es necesario `trust_remote_code=True` y, para la API de alto nivel, el paquete `social_jev` instalado vía `pip install social-jev`. El código personalizado debe auditarse antes de ejecutarlo en entornos de producción o con datos sensibles.
- Opciones de despliegue: la documentación solo cubre `transformers` y el paquete `social_jev`. No se documenta soporte para vLLM, TGI, Ollama o llama.cpp, ni se publican pesos en GGUF, por lo que el despliegue con esos runtimes no está verificado en la información disponible.
- Latencia y throughput estimados: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la categoría de "modelos fundacionales de clasificación para ciencias sociales" dentro de los datos proporcionados. Como referencia mínima, se incluye el modelo base:

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| social-jev-0.6B-preview | 596.050.945 | No disponible | Clasificación de documentos mediante consultas tipadas | No disponible | HuggingFace (0 descargas, 0 likes) |
| Qwen/Qwen3-0.6B (base) | ≈0,6 B | No disponible en esta ficha | Generación de texto y razonamiento | No disponible en esta ficha | HuggingFace |
| Alternativas específicas en ciencias sociales | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Versión preview: la propia nomenclatura del repositorio indica que es una previsualización, con 0 descargas y 0 likes, por lo que no hay evidencia pública de uso en producción ni de validación externa.
- Licencia no declarada: al no especificarse licencia en la ficha, no se puede asumir permiso para uso comercial ni para redistribución. Es imprescindible contactar con el autor antes de cualquier uso en producción.
- Idiomas no declarados: no se especifica qué idiomas soporta; dado que el modelo base es multilingüe, el comportamiento real en cada idioma no está documentado ni verificado.
- Longitud de contexto no documentada: se desconoce cuántos tokens admite por documento, lo que limita el diseño de pipelines con textos largos.
- Riesgo de alucinación y de sesgo en las etiquetas: al ser un modelo generativo adaptado a clasificación, puede asignar categorías no presentes en el conjunto de `options` o verse influido por sesgos del corpus de ajuste; no se han publicado evaluaciones de sesgo ni de fiabilidad entre anotadores.
- Ausencia de benchmarks: no hay métricas publicadas de exactitud, F1, acuerdo con anotadores humanos ni comparaciones con alternativas, lo que impide estimar su calidad frente a soluciones ya establecidas.
- Riesgo de ejecución de código: el repositorio exige `trust_remote_code=True`; el código personalizado incluido debe auditarse antes de su ejecución.
- Encaje limitado fuera de su dominio: es un modelo especializado en clasificación para ciencias sociales, no un asistente conversacional ni un generador de código.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/social-jev/social-jev-0.6B-preview
- Sitio web del proyecto SocialJev: https://social-jev.github.io/
- Paquete de Python: `pip install social-jev`
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Papers, blogs, repositorios o demos adicionales: no se han encontrado enlaces relevantes en la búsqueda web realizada (los resultados devueltos no guardan relación con este modelo).
