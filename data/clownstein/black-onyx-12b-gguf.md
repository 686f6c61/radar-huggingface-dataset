# Clownstein/Black-Onyx-12B-GGUF

## Resumen

Black-Onyx-12B-GGUF es una cuantización en formato GGUF del modelo google/gemma-4-12B-it, ajustado por el usuario Clownstein para tareas de ciberseguridad. El modelo se enmarca dentro del proyecto Black Onyx, un workspace de inteligencia de amenazas (TIP-first) orientado a equipos de blue team, que integra un pipeline de detección de anomalías basado en Kafka y Postgres, gestión de incidentes, caza de amenazas y automatización SOAR. Esta versión GGUF permite ejecutar el modelo en hardware local o en entornos con recursos limitados, sin depender de APIs externas.

El ajuste se centra en generación de código seguro, detección de vulnerabilidades, análisis de inteligencia de amenazas y conversación técnica. Con aproximadamente 11.900 millones de parámetros, el modelo ofrece un equilibrio entre capacidad y requisitos de hardware, siendo adecuado para estaciones de trabajo con GPUs de consumo medio. El acceso al repositorio está restringido (gated), por lo que es necesario aceptar las condiciones de licencia de Gemma en HuggingFace antes de su descarga.

La relevancia actual radica en la creciente demanda de modelos de lenguaje especializados en seguridad que puedan desplegarse de forma local, preservando la confidencialidad de los datos de telemetría y evidencia. Black-Onyx-12B-GGUF cubre ese nicho, aunque carece de documentación pública detallada sobre su proceso de entrenamiento y rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en google/gemma-4-12B-it) |
| Parametros totales | 11.907.350.576 (~11,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (niveles no especificados; repo de 43,9 GB) |
| Idiomas soportados | No disponible |
| Licencia | Gemma (licencia de Google, con restricciones de uso comercial) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una cuantización GGUF de google/gemma-4-12B-it, un modelo instruct de la familia Gemma 4 de Google. La arquitectura subyacente es un transformer decoder-only, aunque no se han publicado detalles específicos sobre el número de capas, dimensiones de atención o mecanismos de atención (por ejemplo, si usa atención lineal o deslizante). Toda la información técnica del modelo base es la que Google haya documentado para Gemma 4, pero no se ha confirmado en la ficha.

El proceso de ajuste (fine-tuning) realizado por Clownstein no está documentado públicamente. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o supervisión directa. Los tags del repositorio indican que el ajuste se orientó a ciberseguridad, generación de código seguro, inteligencia de amenazas y detección de vulnerabilidades, pero no hay papers ni informes técnicos que detallen la metodología.

El proyecto Black Onyx, del que forma parte este modelo, es un workspace de inteligencia de amenazas con un pipeline de detección de anomalías (Kafka/Postgres), gestión de incidentes, caza de amenazas y SOAR. El modelo actúa como componente de análisis y correlación dentro de ese ecosistema, pero también puede usarse de forma independiente.

## Capacidades

- Generación de código seguro: puede producir fragmentos de código con prácticas de seguridad recomendadas, evitando vulnerabilidades comunes (inyección SQL, XSS, desbordamiento de búfer, etc.).
- Detección de vulnerabilidades: análisis de código fuente o configuraciones para identificar posibles fallos de seguridad.
- Inteligencia de amenazas: procesamiento de indicadores de compromiso (IOCs), correlación de eventos y generación de hipótesis sobre campañas de ataque.
- Conversación técnica: mantiene diálogos multi-turno sobre temas de ciberseguridad, útil para asistencia a analistas.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede exponerse como API para integración con otras herramientas.
- Multilingüismo: no se ha especificado, pero al estar basado en Gemma 4, es probable que herede las capacidades multilingües del modelo base (aunque no se confirma).

## Casos de uso

- Análisis de indicadores de compromiso (IOCs) en un SOC: el modelo puede procesar listas de IPs, dominios o hashes, correlacionarlos con contexto de amenazas y generar informes de prioridad para el analista.
- Generación de informes de incidentes: a partir de datos de telemetría o alertas, el modelo redacta resúmenes ejecutivos y técnicos, ahorrando tiempo al equipo de respuesta.
- Revisión de código en pipelines de CI/CD: integrado como paso de análisis estático, el modelo señala posibles vulnerabilidades en pull requests antes del despliegue.
- Triage de alertas en SOAR: el modelo clasifica alertas de SIEM o EDR, descartando falsos positivos y priorizando las que requieren intervención humana.
- Asistente para analistas de blue team: un chat local que responde preguntas sobre tácticas, técnicas y procedimientos (TTPs) de atacantes, o que sugiere consultas de búsqueda en logs.
- Búsqueda de patrones de ataque en logs: el modelo puede analizar grandes volúmenes de logs (con la ventana de contexto disponible) para identificar comportamientos anómalos o secuencias de ataque conocidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de pruebas específicas de ciberseguridad (como CySecBench o SecurityEval). Tampoco se han comparado métricas de latencia o throughput con otros modelos. Se recomienda evaluar el modelo en el propio entorno antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M (típica en GGUF), un modelo de 11,9B parámetros requiere aproximadamente 6-7 GB de VRAM. Con Q5_K_M, unos 7-8 GB. Con Q8_0, entre 11 y 12 GB. El repo de 43,9 GB sugiere que se incluyen varios niveles de cuantización, pero no se especifican.
- GPU recomendadas: tarjetas con 8-12 GB de VRAM, como RTX 3080, RTX 4070, RTX 4080, o GPUs profesionales como A10 o A100. Para uso en servidores, una A100 de 40 GB permite cargar el modelo en alta precisión.
- Compatibilidad con GPU de consumo: sí, con cuantizaciones Q4 o Q5 cabe en GPUs de 8 GB (por ejemplo, RTX 3060 Ti, RTX 4060).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o cualquier runtime compatible con GGUF. También puede usarse con vLLM si se convierte a safetensors, aunque no es el formato nativo.
- Latencia y throughput: no se han publicado datos. En una RTX 4090, un modelo de 12B en Q4 suele generar entre 30 y 60 tokens por segundo, pero esto es una estimación genérica, no un dato oficial.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de ciberseguridad de tamaño similar. El modelo base, google/gemma-4-12B-it, es la referencia directa, pero no se han publicado benchmarks que permitan comparar el ajuste de Black-Onyx con el original. Tampoco hay comparaciones con alternativas como Llama-3-8B-Instruct, Mistral-7B-Instruct o modelos especializados en seguridad como WhiteRabbitNeo o CyberSec-13B. Se recomienda realizar una evaluación propia con conjuntos de datos de ciberseguridad antes de elegir este modelo frente a otros.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated, por lo que es necesario aceptar las condiciones de licencia de Gemma en HuggingFace. Esto puede dificultar su adopción en entornos corporativos con políticas de aprobación lentas.
- Licencia Gemma: la licencia de Google Gemma impone restricciones de uso comercial, incluyendo la obligación de atribución y la prohibición de usos de alto riesgo. Es imprescindible revisar los términos completos antes de desplegar el modelo en producción.
- Sin documentación de entrenamiento: no se ha publicado información sobre el dataset de ajuste, lo que impide evaluar posibles sesgos o lagunas en el conocimiento de ciberseguridad.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar análisis de vulnerabilidades o recomendaciones de seguridad incorrectas. En un contexto de seguridad, esto puede llevar a decisiones erróneas. Siempre debe supervisarse la salida del modelo.
- No es un SIEM: según la documentación del proyecto, Black Onyx no reemplaza un SIEM, sino que complementa el trabajo del analista. El modelo no debe usarse como única fuente de verdad para la detección de amenazas.
- Idiomas no especificados: aunque Gemma 4 soporta múltiples idiomas, no se ha confirmado que el ajuste de Black-Onyx preserve esas capacidades. En entornos con requisitos multilingües, es necesario probar el modelo.
- Sin benchmarks: la ausencia de métricas de rendimiento dificulta la comparación objetiva con otras soluciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Clownstein/Black-Onyx-12B-GGUF
- Repositorio GitHub del proyecto Black Onyx: https://github.com/Clownstein/Black-Onyx
- Documentación de API del proyecto: https://github.com/Clownstein/Black-Onyx/blob/main/docs/API.md
