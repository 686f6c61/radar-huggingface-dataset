# mradermacher/Decision-WAF-V1-0.8B-GGUF

## Resumen

Decision-WAF-V1-0.8B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo Decision-WAF-V1-0.8B, creado por 0xBrandon y cuantizado por mradermacher. El modelo base es un LLM compacto de 752 millones de parámetros especializado en seguridad defensiva, concretamente en la clasificación de peticiones HTTP para firewalls de aplicaciones web (WAF, Web Application Firewall). Su propósito es determinar si una petición web es maliciosa o legítima, una tarea de clasificación binaria que un modelo pequeño bien ajustado puede resolver con latencias muy bajas.

La relevancia de este modelo reside en la tendencia actual de sustituir reglas estáticas y firmas tradicionales de WAF por clasificadores semánticos capaces de detectar ataques variados (inyecciones SQL, XSS, path traversal, etc.) sin depender de patrones firmados previamente. Con menos de 800 millones de parámetros y versiones cuantizadas de apenas 0,5 GB, puede desplegarse en hardware muy modesto o incluso en CPU, lo que lo hace viable para inspección en línea de tráfico con overhead mínimo.

Esta ficha corresponde al repositorio de cuantizaciones GGUF de mradermacher, que incluye desde Q2_K (0,5 GB) hasta f16 (1,6 GB). El modelo original en formato safetensors está disponible en 0xBrandon/Decision-WAF-V1-0.8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (no disponible el detalle exacto) |
| Parametros totales | 752.393.024 (aprox. 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); safetensors en el modelo base |

## Arquitectura y entrenamiento

El repositorio cuantizado no documenta la arquitectura exacta del modelo base, aunque por el tamaño (752M de parámetros) y la etiqueta `transformers` se trata de un transformer decoder estándar de la familia de modelos pequeños (probablemente derivado de una arquitectura tipo Qwen o similar, aunque esto no está confirmado en la información disponible). El modelo base fue entrenado o ajustado por 0xBrandon para la tarea de clasificación de peticiones web en el contexto de WAFs defensivos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre el uso de técnicas como RLHF o DPO. Lo que sí indica el model card es que el modelo está orientado a `request-classification` y `defensive-security`, es decir, un ajuste específico para tareas de seguridad defensiva y no un modelo de propósito general.

En cuanto a las cuantizaciones, mradermacher ha generado cuants estáticos tipo K-quants e IQ-quants de llama.cpp. No hay disponibles cuantizaciones imatrix (weighted) en el momento de redacción de la ficha, según indica el propio autor.

## Capacidades

- Clasificación de peticiones HTTP como maliciosas o legítimas para su uso como capa de decisión en un WAF.
- Detección semántica de patrones de ataque web (el model card lo etiqueta como `waf` y `request-classification`), presumiblemente incluyendo inyecciones SQL, XSS y payloads similares, aunque el detalle no está documentado.
- Diseñado para seguridad defensiva (`defensive-security`), no para ofensiva.
- Formato conversacional según las etiquetas del repo, aunque su caso de uso principal es la clasificación.
- Solo soporte documentado para inglés; el rendimiento sobre peticiones en otros idiomas no está documentado.
- No es un modelo de propósito general: no está indicado para generación de texto, código, razonamiento matemático ni tareas de chat abiertas.
- No hay evidencia de capacidades de visión, audio ni tool calling en la información disponible.

## Casos de uso

- Clasificación en línea de peticiones en un WAF: integrado como componente de decisión detrás de un proxy inverso, el modelo evalúa cada petición HTTP entrante y decide si bloquearla o permitirla, complementando o sustituyendo reglas estáticas tipo ModSecurity.
- Filtrado de payloads en APIs públicas: desplegado junto a una API Gateway, puede inspeccionar cuerpos y parámetros de peticiones en busca de inyecciones antes de que lleguen al backend, con la ventaja de su baja latencia (modelo de 0,8B cuantizado).
- Detección de ataques sin firmas previas: al clasificar semánticamente en lugar de por coincidencia de patrones, puede identificar variantes de ataques ofuscados que evadirían reglas tradicionales basadas en regex.
- Despliegue en edge o entornos con recursos limitados: la cuantización Q2_K ocupa solo 0,5 GB, lo que permite ejecutarlo en CPU o en dispositivos con poca RAM, útil para inspección local sin enviar tráfico a servicios externos.
- Triaje en pipelines SOC: como primer filtro automático que marca peticiones sospechosas en logs de acceso web para revisión posterior por analistas, reduciendo el volumen manual de análisis.
- Investigación en seguridad defensiva con LLMs: por su tamaño reducido y licencia Apache 2.0, es un buen punto de partida para experimentar con clasificadores LLM de seguridad y para fine-tuning adicional sobre datasets propios de tráfico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio del modelo base (0xBrandon/Decision-WAF-V1-0.8B) tampoco incluye métricas de precisión, recall o F1 sobre datasets de seguridad estándar en la información proporcionada.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 0,5 GB (Q2_K) y 1,6 GB (f16) solo de pesos; con contexto y overhead de runtime, basta con 1-2 GB de memoria en la mayoría de las cuantizaciones.
- GPU recomendadas: no se necesita GPU dedicada; cualquier GPU moderna lo ejecuta con holgura. Para inferencia en CPU es perfectamente viable dado el tamaño.
- Consumer GPUs: cabe sobradamente en cualquier GPU de consumo actual (RTX 3060, RTX 4060, RTX 4090, etc.); incluso iGPUs o portátiles sin GPU dedicada pueden ejecutarlo vía CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con transformers, vLLM o TGI.
- Latencia y throughput: no disponibles como cifras oficiales; por tamaño y cuantización, se espera inferencia de muy baja latencia, adecuada para inspección de peticiones en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| Decision-WAF-V1-0.8B (este) | 752M | GGUF, safetensors | Apache 2.0 | Clasificacion de peticiones para WAF |
| Llama Guard 3 1B (Meta) | ~1B | safetensors, GGUF comunitarios | Llama 3 Community | Moderacion de contenido y seguridad de prompts |
| Llama Guard 3 8B (Meta) | ~8B | safetensors, GGUF comunitarios | Llama 3 Community | Moderacion de contenido, mas preciso pero mas pesado |
| Prompt-Guard-86M (Meta) | 86M | safetensors | Llama 3 Community | Deteccion de jailbreaks e inyecciones de prompt |

Comparado con las alternativas, Decision-WAF-V1-0.8B se diferencia en que su dominio es la clasificación de peticiones web para WAFs (capa de red/HTTP), mientras que Llama Guard se centra en moderación de contenido conversacional y Prompt-Guard en inyecciones de prompt. Su licencia Apache 2.0 es más permisiva que la licencia comunitaria de Llama. En tamaño, se sitúa entre Prompt-Guard (86M) y Llama Guard 3 1B.

## Limitaciones y advertencias

- No se han publicado métricas de precisión, recall o tasa de falsos positivos; antes de usarlo en producción como mecanismo de bloqueo, es imprescindible evaluarlo sobre tráfico propio, ya que un falso positivo bloquea usuarios legítimos.
- Idioma documentado: inglés. Su comportamiento sobre peticiones con contenido en otros idiomas no está documentado.
- La longitud de contexto no está especificada; peticiones o cuerpos HTTP muy grandes podrían no ser clasificables de forma completa.
- Modelo muy especializado: no debe usarse como asistente general ni esperar capacidades de chat, razonamiento o código.
- No hay cuantizaciones imatrix disponibles; las cuants estáticas de baja calidad (Q2_K, Q3_K_S) pueden degradar la precisión de clasificación, algo crítico en seguridad.
- Riesgo de evasión: como todo clasificador, puede ser objeto de ataques adversariales diseñados para engañarlo; debe combinarse con otras capas de defensa (reglas, rate limiting, WAF tradicional) y no como único mecanismo.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque conviene verificar la licencia del modelo base y de cualquier dataset de entrenamiento no documentado.
- La descarga y adopción son muy bajas (651 descargas, 1 like), lo que implica poca validación comunitaria y posible presencia de errores no detectados.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/Decision-WAF-V1-0.8B-GGUF
- Modelo base: https://huggingface.co/0xBrandon/Decision-WAF-V1-0.8B
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Decision-WAF-V1-0.8B-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa de mradermacher (nethype GmbH): https://www.nethype.de/
