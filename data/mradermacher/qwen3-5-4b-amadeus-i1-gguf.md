# mradermacher/Qwen3.5-4B-Amadeus-i1-GGUF

## Resumen

Qwen3.5-4B-Amadeus-i1-GGUF es una distribución de cuantizaciones GGUF del modelo Qwen3.5-4B-Amadeus, publicado por el usuario mradermacher. El modelo base, desarrollado por Jitheswar, parte de Qwen3.5-4B de Alibaba y ha sido modificado mediante técnicas de abliteration y decensoring para eliminar los mecanismos de rechazo y las restricciones de contenido del modelo original. El resultado es un modelo de 4.326.350.848 parámetros (aproximadamente 4,3 mil millones) orientado a generación de texto conversacional sin filtros de seguridad, con capacidades de visión.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo pequeño (4B) con capacidad multimodal (vision), cuantizaciones imatrix de alta calidad generadas por mradermacher, y un proceso de abliteration que lo hace útil para investigación sobre alineamiento, evaluación de sesgos y experimentación con modelos sin censura. El repositorio ocupa 39,2 GB e incluye un amplio abanico de cuantizaciones que van desde i1-Q2_K (2,1 GB) hasta i1-Q6_K (3,7 GB), lo que permite desplegarlo en hardware muy modesto.

La licencia declarada es Apache 2.0, heredada del modelo Qwen3.5-4B original, aunque la modificación del comportamiento mediante abliteration plantea consideraciones éticas y legales que el usuario debe evaluar. Los idiomas soportados declarados son inglés, chino y multilingüe. El modelo fue creado el 27 de octubre de 2026 y actualizado el 23 de noviembre de 2026, con 2.326 descargas acumuladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B, con capacidad de visión) |
| Parametros totales | 4.326.350.848 (4,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, más imatrix |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B-Amadeus deriva de la arquitectura transformer de Qwen3.5-4B, un modelo denso de aproximadamente 4,3 mil millones de parámetros con capacidad de procesamiento de visión (el repositorio incluye etiqueta "vision" y referencia a ficheros mmproj en el repositorio estático). La modificación principal es la aplicación de técnicas de abliteration y decensoring sobre el modelo original, un proceso que identifica y suprime las direcciones de activación asociadas a comportamientos de rechazo, produciendo un modelo que responde a solicitudes que el modelo original declinaría.

El proceso de cuantización empleado es imatrix (importance matrix), que calcula matrices de importancia a partir de un dataset de calibración para preservar mejor la calidad en cuantizaciones agresivas. Los datasets de calibración y entrenamiento declarados son mlabonne/harmless_alpaca y mlabonne/harmful_behaviors, habituales en el ecosistema de modelos abliterated. No se dispone de información sobre el número de tokens de entrenamiento original, la composición exacta del dataset de Qwen3.5-4B, ni si hubo fases de RLHF o DPO en el modelo base. La innovación técnica destacable es la combinación de cuantización imatrix con un modelo multimodal pequeño, lo que permite ejecutar visión y lenguaje en hardware de consumo.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, chino y otros idiomas (multilingual).
- Procesamiento de imágenes (modelo de visión; los ficheros mmproj se distribuyen en el repositorio estático).
- Razonamiento general y respuesta a instrucciones sin restricciones de contenido (abliterated/decensored).
- Generación de código y matemáticas (capacidad heredada de la familia Qwen, sin datos específicos de rendimiento).
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües limitadas a los idiomas declarados (en, zh, multilingual); no se especifica la lista completa.
- No se declara modo "thinking" explícito ni capacidades de audio.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar cómo la abliteration afecta a la distribución de respuestas y a los sesgos, comparando su comportamiento con el Qwen3.5-4B original en tareas de evaluación de rechazo.
- Experimentación con modelos sin censura en entornos controlados: útil para investigadores que necesitan un modelo que no filtre contenido para analizar respuestas en dominios creativos o controvertidos, siempre con las salvaguardas éticas y legales correspondientes.
- Despliegue en hardware de consumo: con cuantizaciones de 2,1 a 3,7 GB, puede ejecutarse en GPUs de gama media (8-12 GB VRAM) o incluso en CPU con llama.cpp, lo que facilita prototipado rápido y pruebas locales.
- Procesamiento de imágenes en local: al ser un modelo de visión, puede emplearse para describir imágenes, extraer texto de capturas o responder preguntas sobre figuras en entornos sin conexión.
- Generación de texto creativo sin restricciones: escritura de ficción, guiones o contenido narrativo donde el modelo original aplicaría filtros de contenido.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 16 variantes de cuantización, lo que permite medir el impacto de la compresión en calidad (perplejidad) y velocidad para elegir el equilibrio óptimo en producción.
- Chat multilingüe ligero: atención al cliente o asistentes conversacionales en inglés y chino con requisitos de hardware mínimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2,5 y 4,5 GB según cuantización (i1-Q2_K: 2,1 GB de pesos; i1-Q6_K: 3,7 GB), más overhead de contexto y, en su caso, del proyector de visión (mmproj).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para mayor throughput; cualquier GPU con al menos 6-8 GB VRAM es suficiente para las cuantizaciones Q4.
- Cabe en GPU de consumo: sí, en RTX 3050 8 GB, RTX 3060, RTX 4060, RTX 4070 y superiores; también en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui; vLLM y TGI no soportan GGUF de forma nativa (requieren el modelo en safetensors).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.5-4B-Amadeus-i1-GGUF (este) | 4,3B | no disponible | Sí | Apache 2.0 | GGUF | Abliterated, cuantizaciones imatrix |
| Qwen3.5-4B (original) | 4,3B | no disponible | Sí | Apache 2.0 | safetensors | Modelo base con alineamiento completo |
| Qwen2.5-3B-Instruct-GGUF | 3,1B | 32K (típico) | No | Apache 2.0 | GGUF | Alternativa densa sin visión |
| Llama-3.2-3B-Instruct-GGUF | 3,2B | 128K | No | Llama 3.2 | GGUF | Alternativa con contexto largo |

La comparativa se limita a características estructurales; no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El proceso de abliteration elimina los mecanismos de rechazo, lo que puede producir respuestas a solicitudes dañinas, ilegales o éticamente problemáticas; no es apto para despliegues públicos sin moderación externa.
- Riesgo elevado de alucinación inherente a modelos de 4B, agravado por la pérdida de calidad en cuantizaciones agresivas (i1-Q2_K, i1-Q3_K_S).
- La licencia Apache 2.0 permite uso comercial, pero la modificación del comportamiento puede contravenir los términos de uso del modelo original Qwen3.5-4B; se recomienda revisar la licencia enlazada.
- Longitud de contexto no documentada en la información disponible; no se debe asumir una ventana concreta sin verificarla.
- Idiomas limitados a inglés, chino y multilingüe genérico; el rendimiento en castellano no está garantizado ni documentado.
- Los datasets de calibración (harmless_alpaca, harmful_behaviors) están orientados a inglés, lo que puede sesgar el comportamiento en otros idiomas.
- No hay información sobre tool calling, agentes ni modo de razonamiento explícito; no asumir su disponibilidad en producción.
- El repositorio incluye 16 cuantizaciones; elegir una demasiado agresiva puede degradar gravemente la coherencia y la capacidad multimodal.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-4B-Amadeus-i1-GGUF
- Modelo base: https://huggingface.co/Jitheswar/Qwen3.5-4B-Amadeus
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.5-4B-Amadeus-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.5-4B-Amadeus-i1-GGUF
- Licencia Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
