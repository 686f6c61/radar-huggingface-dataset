# mradermacher/Glimmer-Sentry-30B-GGUF

## Resumen

Glimmer-Sentry-30B-GGUF es la versión cuantizada en formato GGUF del modelo EryriLabs/Glimmer-Sentry-30B, publicada por el usuario mradermacher. Se trata de un modelo de lenguaje especializado en ciberseguridad defensiva (blue team) y detección de amenazas, afinado mediante QLoRA sobre una base de aproximadamente 27.850 millones de parámetros. El modelo está orientado a la generación de reglas de detección en lenguajes y formatos como Sigma, YARA, KQL, Splunk y Wazuh, lo que lo convierte en una herramienta específica para equipos de detección e ingeniería de seguridad.

La relevancia de esta ficha radica en que mradermacher ofrece una batería completa de cuantizaciones estáticas (desde Q2_K hasta Q8_0, más IQ4_XS y dos variantes mmproj multimodales), lo que permite desplegar el modelo en hardware muy diverso, desde estaciones de trabajo con GPU de consumo hasta servidores con aceleradores profesionales. Al estar publicado bajo licencia Apache 2.0, es apto para uso comercial sin restricciones adicionales.

No se dispone de información detallada sobre la longitud de contexto, la composición exacta del dataset de entrenamiento ni los resultados de benchmarks en la información proporcionada; esta ficha refleja únicamente los datos verificables de la model card y de los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.854.794.240 (≈27,85 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base (EryriLabs/Glimmer-Sentry-30B) en la documentación proporcionada. Por el número de parámetros (≈27,85 mil millones) y el pipeline declarado como `transformers`, se trata de un transformer de gran tamaño, pero no se especifica si emplea atención completa, attention lineal, mezcla de expertos u otra variante. Tampoco se documenta la longitud de contexto nativa.

Respecto al entrenamiento, la model card etiqueta el modelo con `qlora`, lo que indica que el ajuste fino se realizó mediante QLoRA sobre una base preentrenada. La especialización declarada es en ciberseguridad defensiva: detección de amenazas, ingeniería de detección y generación de reglas en formatos Sigma, YARA, KQL, Splunk y Wazuh. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. La model card de mradermacher no incluye detalles técnicos adicionales más allá de la lista de cuantizaciones y notas sobre su calidad relativa.

## Capacidades

- Generación de texto conversacional en inglés, con especialización en dominios de seguridad.
- Generación de reglas de detección en Sigma, YARA, KQL, Splunk y Wazuh.
- Razonamiento orientado a detección de amenazas y análisis blue team.
- Soporte multimodal: el repositorio incluye dos ficheros `mmproj` (Q8_0 y f16), lo que sugiere capacidad de procesamiento de imágenes en el modelo base, aunque no se detalla su alcance.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos (`language: en`).
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Generación de reglas Sigma para SIEM: el modelo puede redactar reglas de detección en formato Sigma a partir de una descripción de comportamiento sospechoso, lo que acelera la creación de detecciones portables entre distintos backends SIEM.
- Creación de firmas YARA: útil para equipos de respuesta a incidentes que necesitan firmas para identificar malware o artefactos sospechosos en análisis forense, aprovechando el conocimiento del modelo sobre sintaxis y patrones YARA.
- Consultas KQL para Microsoft Sentinel: el modelo puede traducir una hipótesis de detección a consultas KQL listas para ejecutar en entornos Microsoft, reduciendo el tiempo de iteración de los analistas.
- Búsquedas Splunk SPL: generación de consultas de búsqueda para correlación de eventos y detección en Splunk, adecuado para equipos SOC que trabajan con este ecosistema.
- Reglas de detección Wazuh: creación de decodificadores y reglas para el HIDS Wazuh, útil en despliegues de seguridad open source en infraestructura propia.
- Asistencia a analistas SOC en turnos de triaje: el modelo puede ayudar a interpretar alertas y proponer hipótesis de detección, siempre con supervisión humana dada la naturaleza crítica del dominio.
- Despliegue en entornos air-gapped: al estar disponible en GGUF y con licencia Apache 2.0, puede ejecutarse localmente con llama.cpp u Ollama en infraestructura sin conexión a Internet, requisito habitual en equipos de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaños de fichero del repositorio):
  - Q2_K: 10,8 GB
  - Q3_K_S: 12,6 GB; Q3_K_M: 13,8 GB; Q3_K_L: 14,8 GB
  - IQ4_XS: 15,4 GB
  - Q4_K_S: 16,2 GB; Q4_K_M: 17,0 GB
  - Q5_K_S: 19,4 GB; Q5_K_M: 19,9 GB
  - Q6_K: 23,0 GB
  - Q8_0: 29,7 GB
  - mmproj-Q8_0: 2,2 GB; mmproj-f16: 3,9 GB (suplemento multimodal)
- GPU recomendadas: no disponible de forma explícita; por tamaño, Q4_K_M (17 GB) encaja en GPUs de 24 GB como RTX 3090/4090; Q8_0 (29,7 GB) requiere GPUs de 32 GB o más (A100 40 GB, H100, RTX A6000).
- ¿Cabe en GPU de consumo? Sí, las cuantizaciones Q2_K a Q4_K_M caben en GPUs de 12-24 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090); las de mayor tamaño requieren 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base en safetensors es compatible con transformers y, presumiblemente, con vLLM y TGI (no confirmado en la información proporcionada).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un modelo especializado en ciberseguridad defensiva, una categoría de nicho con pocos modelos públicos comparables documentados en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| Glimmer-Sentry-30B-GGUF | ≈27,85 B | no disponible | Apache 2.0 | Seguridad defensiva, reglas de detección |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está entrenado y etiquetado únicamente en inglés (`language: en`); su rendimiento en castellano u otros idiomas no está garantizado.
- No se han publicado benchmarks que permitan validar su calidad real en generación de reglas de detección; las afirmaciones de especialización provienen de las etiquetas de la model card, no de evaluaciones independientes.
- Riesgo de alucinación en sintaxis de reglas (Sigma, YARA, KQL, Splunk, Wazuh): toda regla generada debe validarse y probarse antes de desplegarla en producción.
- No se documenta la longitud de contexto nativa, lo que impide planificar casos de uso que requieran ventanas largas.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_M) pueden degradar la calidad de forma notable; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como opción rápida y Q8_0 como mejor calidad.
- No hay cuantizaciones ponderadas/imatrix disponibles según el autor, lo que puede limitar la calidad en comparación con cuantizaciones imatrix de otros modelos.
- Aunque la licencia es Apache 2.0 (permite uso comercial), conviene verificar las condiciones del modelo base EryriLabs/Glimmer-Sentry-30B y de los datos de entrenamiento originales.
- El repositorio tiene 197,5 GB, lo que requiere planificar el almacenamiento y la descarga selectiva de la cuantización deseada.
- El modelo tiene 0 likes y 884 descargas en el momento de la consulta, lo que indica una adopción aún limitada y poca validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Glimmer-Sentry-30B-GGUF
- Modelo base: https://huggingface.co/EryriLabs/Glimmer-Sentry-30B
- Página de descargas del autor: https://hf.tst.eu/model#Glimmer-Sentry-30B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
