# mradermacher/Decision-WAF-V1.1-0.8B-GGUF

## Resumen

Decision-WAF-V1.1-0.8B es un modelo lingüístico de tamaño reducido (752 millones de parámetros) desarrollado por 0xBrandon, especializado en clasificación de peticiones HTTP para sistemas de seguridad defensiva, concretamente como componente de decisión para un firewall de aplicaciones web (WAF, Web Application Firewall). El modelo se publica bajo licencia Apache 2.0 y está entrenado para trabajar en inglés, con la tarea de determinar si una petición web es legítima o maliciosa.

Esta ficha corresponde a la cuantización GGUF realizada por mradermacher, un creador conocido por generar versiones cuantizadas estáticas de modelos populares de Hugging Face para su uso en llama.cpp y herramientas compatibles. El repositorio incluye cuants desde Q2_K (0,5 GB) hasta f16 (1,6 GB), lo que permite desplegar el modelo prácticamente en cualquier hardware, incluidas CPU domésticas.

Su relevancia radica en la tendencia actual de usar modelos pequeños y especializados para tareas de infraestructura de seguridad: un modelo de 0,8B puede clasificar peticiones con latencias mínimas y coste energético muy bajo, en lugar de depender exclusivamente de reglas estáticas o firmas. No se dispone de información sobre la arquitectura base exacta, la longitud de contexto ni los datos de entrenamiento del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, tipo base no especificado) |
| Parametros totales | 752.393.024 (aprox. 0,75B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta cuantización); el modelo base está en transformers/safetensors |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo base (0xBrandon/Decision-WAF-V1.1-0.8B), por lo que se desconoce el tipo exacto de transformer, el número de capas, dimensiones de embedding ni el tokenizer empleado. Por el tamaño (752M de parámetros) y las etiquetas del repositorio, se trata de un modelo denso pequeño, probablemente derivado de una familia de modelos abiertos de 0,5-1B parámetros, afinado para la tarea de clasificación de peticiones web en contextos de seguridad defensiva.

Tampoco se dispone de datos sobre el corpus de entrenamiento, el número de tokens procesados ni el uso de técnicas de alineación como RLHF o DPO. Las etiquetas del repositorio (waf, security, request-classification, defensive-security) indican que el afinado se centró en la clasificación de tráfico HTTP para detectar peticiones maliciosas (por ejemplo, inyecciones SQL, XSS u otros patrones de ataque típicos que un WAF debe bloquear). Esta cuantización de mradermacher es estática (no imatrix/weighted) y cubre once niveles de cuantización además de la versión f16.

## Capacidades

- Clasificación de peticiones HTTP: el modelo está especializado en decidir si una petición web es benigna o maliciosa, como componente de decisión en un WAF.
- Seguridad defensiva: orientado a detección y mitigación, no a generación de ataques.
- Generación de texto conversacional básica: la etiqueta "conversational" sugiere formato de entrada/salida conversacional, aunque su dominio es la clasificación de seguridad.
- Uso eficiente en CPU: gracias al formato GGUF y a su tamaño de 0,5-1,6 GB según cuant, puede ejecutarse sin GPU.
- No hay evidencia de capacidades multimodales (visión, audio), tool calling ni soporte de agentes en la información disponible.

## Casos de uso

- Filtrado en tiempo real de tráfico web: integrado como capa de decisión en un proxy inverso o WAF, el modelo evalúa cada petición HTTP entrante y clasifica si debe bloquearse, con latencias bajas gracias a su tamaño reducido.
- Complemento a WAFs basados en reglas: puede actuar como segundo nivel de análisis para peticiones que las reglas estáticas (ModSecurity, OWASP CRS) no clasifican con certeza, reduciendo falsos positivos y negativos.
- Análisis forense de logs: procesamiento por lotes de logs de acceso de servidores web para identificar patrones de ataque que pasaron desapercibidos, ejecutándose en una estación de trabajo sin GPU.
- Protección de APIs: clasificación de payloads de peticiones a endpoints de API pública para detectar intentos de abuso, inyección o enumeración.
- Despliegue en edge y entornos con recursos limitados: con cuants de 0,5 GB (Q2_K) o 0,6 GB (Q4_K_S), el modelo cabe en dispositivos modestos, contenedores ligeros o instancias cloud pequeñas.
- Prototipado de sistemas de seguridad con LLM: base ligera para experimentar con clasificación de amenazas mediante modelos de lenguaje sin necesidad de infraestructura GPU, ideal para laboratorios SOC o investigación académica.
- Automatización en pipelines CI/CD de seguridad: integración en pruebas de aplicaciones para validar que las reglas del WAF responden correctamente ante peticiones clasificadas como maliciosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de precisión, recall, F1 sobre datasets de peticiones maliciosas ni comparativas con WAFs clásicos para este modelo.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 0,5 GB (Q2_K) y 1,6 GB (f16) según la cuantización elegida, más overhead del runtime; en la práctica, 1-2 GB de RAM son suficientes para cualquier cuant.
- GPU recomendadas: no requiere GPU; cualquier GPU moderna con 2 GB de VRAM o más puede acelerarlo, pero está diseñado para ejecutarse eficientemente en CPU.
- Consumer GPUs: cabe sobradamente en cualquier GPU doméstica (incluso integradas o tarjetas antiguas); el caso de uso principal es CPU-only.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y cualquier runtime compatible con GGUF. El modelo base en formato transformers puede desplegarse con vLLM o TGI, aunque para un modelo de esta tarea y tamaño llama.cpp es la opción más razonable.
- Latencia y throughput: no disponible; por su tamaño (0,75B parámetros) y tarea de clasificación, se esperan latencias de milisegundos por petición en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

No existen en la información proporcionada modelos comparables directos (LLMs de ~0,8B especializados en clasificación WAF). Como referencia genérica de la categoría de modelos pequeños para clasificación:

| Modelo | Parametros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| Decision-WAF-V1.1-0.8B | 0,75B | no disponible | Apache 2.0 | Clasificación de peticiones para WAF |
| Modelos generales de 0,5-1B (p. ej. Qwen2.5-0.5B, Llama 3.2-1B) | 0,5-1B | 32K-128K | Apache 2.0 / Llama 3.2 | Uso general, requerirían fine-tuning para esta tarea |
| Clasificadores BERT-like (p. ej. SecureBERT, DistilBERT fine-tuned) | 66M-340M | 512 | variable | Clasificación de texto de seguridad, contexto limitado |

La ventaja diferencial de Decision-WAF frente a los generales es la especialización directa en la tarea; frente a los BERT-like, ofrece generación conversacional y probablemente mejor manejo de peticiones completas, a costa de más parámetros.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia cuantitativa de su precisión como WAF; no debe usarse como único mecanismo de bloqueo en producción sin validación previa.
- Idioma: entrenado para inglés; su rendimiento sobre peticiones o payloads con contenido en otros idiomas no está documentado.
- Contexto desconocido: al no publicarse la longitud de ventana, no se sabe si puede procesar peticiones HTTP de gran tamaño (cabeceras largas, bodies extensos).
- Riesgo de alucinación: como todo LLM, puede clasificar erróneamente peticiones ambiguas; en un WAF esto se traduce en falsos positivos (bloqueo de tráfico legítimo) o falsos negativos (paso de ataques).
- Sesgos: los sesgos derivan del dataset de entrenamiento, que no está documentado; puede tener dificultades con técnicas de evasión (ofuscación, encoding) no presentes en sus datos.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución sin restricciones relevantes, salvo conservar el aviso de licencia.
- Esta es una cuantización estática de terceros (mradermacher); los cuants bajos (Q2_K, Q3_K) degradan la calidad respecto al modelo original f16.
- No está diseñado para generación de contenido general ni para tareas fuera de su dominio de seguridad.

## Enlaces

- Modelo cuantizado (GGUF): https://huggingface.co/mradermacher/Decision-WAF-V1.1-0.8B-GGUF
- Modelo base: https://huggingface.co/0xBrandon/Decision-WAF-V1.1-0.8B
- Página de descargas de mradermacher: https://hf.tst.eu/model#Decision-WAF-V1.1-0.8B-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referenciada en el README): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
