# mradermacher/bsis-qwen2.5-1.5b-scam-detector-GGUF

## Resumen

Esta ficha cubre la versión cuantizada en GGUF del modelo `bsis-qwen2.5-1.5b-scam-detector`, un ajuste fino de Qwen2.5-1.5B orientado a la detección de estafas (scam detection) en conversaciones, con especial énfasis en lenguas de la India. El modelo base fue desarrollado por harshcasper y entrenado sobre el dataset `harshcasper/bsis`; las cuantizaciones estáticas las publica mradermacher, un actor habitual en la distribución de pesos GGUF para llama.cpp.

Se trata de un transformer decoder de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones), derivado de la familia Qwen2.5, por lo que hereda su tokenizador y su ventana de contexto nativa. El interés práctico reside en su tamaño reducido, que permite desplegarlo en hardware de consumo, combinado con una cobertura declarada de 23 idiomas, la mayoría del subcontinente indio, además del inglés.

El modelo está pensado como un clasificador conversacional especializado: dado un mensaje o un diálogo, debe identificar indicios de fraude, phishing o ingeniería social. Es relevante para equipos que construyen filtros antispam, moderación o sistemas de alerta en mercados lingüísticos poco cubiertos por los modelos generalistas, y que necesitan ejecutar la inferencia en local o en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (derivado de Qwen2.5) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | hi, en, bn, mr, ta, te, gu, kn, ml, or, pa, ur, as, brx, doi, kok, ks, mai, mni, ne, sa, sat, sd |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B: un transformer decoder con atención causal estándar, normalización RMSNorm y embeddings rotatorios (RoPE). No se trata de un modelo MoE ni de una arquitectura híbrida SSM. El ajuste fino parte de los pesos preentrenados de Qwen2.5-1.5B y se especializa mediante entrenamiento supervisado sobre el dataset `harshcasper/bsis`, según declara la model card del modelo base.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO. La model card del repositorio cuantizado no aporta esos datos y solo referencia el dataset y el modelo base. Tampoco se documentan innovaciones técnicas específicas más allá de la cuantización estática aplicada por mradermacher, que genera variantes desde Q2_K hasta f16 sin cuantizaciones ponderadas por imatrix (el autor indica que no las tiene previstas).

## Capacidades

- Detección de estafas en texto conversacional: clasificación de mensajes o diálogos como fraudulentos o legítimos, con el foco puesto en patrones de ingeniería social.
- Cobertura multilingüe amplia: 23 idiomas declarados, con predominio de lenguas indias (hindi, bengalí, maratí, tamil, telugu, guyaratí, canarés, malabar, oriya, panyabí, urdu, asamés, bodo, dogri, konkani, cachemir, maithili, manipuri, nepalí, sánscrito, santali y sindhi) más inglés.
- Generación de texto y respuesta conversacional: al derivar de Qwen2.5, conserva la capacidad general de chat del modelo original, aunque el ajuste fino puede haberla desplazado hacia la tarea de clasificación.
- Formato conversacional: la model card lo marca como `conversational`, por lo que admite plantillas de chat.
- Compatibilidad con endpoints: etiquetado como `endpoints_compatible`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Filtrado antispam en mensajería: el modelo puede procesar cada mensaje entrante y emitir una etiqueta de riesgo, integrándose en un pipeline previo a la entrega al usuario; su tamaño de 1,5B permite ejecutarlo en servidores modestos con latencia baja.
- Moderación de comentarios y reseñas en plataformas con audiencia india: la cobertura de 23 idiomas permite aplicar un único modelo a contenidos en hindi, bengalí, tamil, urdu y otras lenguas, evitando mantener clasificadores separados por idioma.
- Alertas antifraude en banca y fintech: detección de mensajes que simulan ser comunicaciones del banco (phishing, solicitud de OTP, premios falsos) en conversaciones de atención al cliente.
- Protección de usuarios mayores en asistentes de accesibilidad: un asistente local puede pasar los mensajes recibidos por el modelo antes de leérselos al usuario y marcar los sospechosos.
- Análisis de corpus para investigación en ciberseguridad: clasificación por lotes de grandes volúmenes de mensajes para estudiar la prevalencia y las tácticas de fraude en distintas lenguas indias.
- Despliegue en el borde (edge): con cuantizaciones Q4_K_M de aproximadamente 1,1 GB, el modelo cabe en dispositivos con poca memoria y puede ejecutarse con llama.cpp u Ollama sin conexión, útil para aplicaciones móviles o embebidas con requisitos de privacidad.
- Enrutamiento en sistemas de atención al cliente: preclasificar tickets sospechosos antes de derivarlos a un equipo humano especializado, reduciendo el volumen de revisión manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~0,8 GB; Q3_K_S ~0,9 GB; IQ4_XS y Q4_K_S ~1,0 GB; Q4_K_M ~1,1 GB; Q5_K_M ~1,2 GB; Q6_K ~1,4 GB; Q8_0 ~1,7 GB; f16 ~3,2 GB. Añadir entre 0,5 y 1 GB adicionales para el contexto y el runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor throughput. En entornos de servidor, A100 o H100 no son necesarias para este tamaño, pero permiten mayor concurrencia.
- Cabe en GPU de consumo: sí, holgadamente, en cualquier tarjeta con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF como llama-cpp-python o text-generation-webui. vLLM y TGI no consumen GGUF de forma nativa; para esos motores habría que usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada; para un modelo de 1,5B en cuantización Q4 se esperan decenas de tokens por segundo en GPU de consumo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| bsis-qwen2.5-1.5b-scam-detector (este) | 1,54B | no disponible | Apache 2.0 | GGUF, safetensors | Especializado en detección de estafas multilingüe (lenguas indias) |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (según documentación de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo generalista; sin especialización antifraude |
| Qwen2.5-0.5B-Instruct | 0,49B | 32.768 tokens (según documentación de Qwen) | Apache 2.0 | safetensors, GGUF | Alternativa más ligera, menor capacidad general |
| Llama 3.2 1B Instruct | 1,24B | 128.000 tokens (según documentación de Meta) | Llama 3.2 Community License | safetensors, GGUF | Generalista multilingüe; no especializado en estafas |

La comparación con Qwen2.5-1.5B-Instruct es la más directa porque comparten base; el ajuste fino añade especialización pero puede degradar capacidades generales. No se dispone de métricas de rendimiento comparadas para este modelo.

## Limitaciones y advertencias

- No hay benchmarks publicados: no es posible afirmar su precisión real en detección de estafas frente a alternativas; conviene evaluarlo con un conjunto de validación propio antes de producción.
- Riesgo de alucinación: al ser un modelo generativo, puede producir justificaciones o clasificaciones inconsistentes; para uso crítico se recomienda restringir la salida a etiquetas estructuradas y validarlas.
- Sesgos potenciales: el dataset `harshcasper/bsis` no está documentado en detalle en la información disponible; la distribución de idiomas y tipos de fraude puede no reflejar la de otros mercados.
- Cobertura lingüística desigual: aunque declara 23 idiomas, muchos son de bajos recursos (bodo, dogri, santali, cachemir), y el rendimiento real en ellos no está verificado.
- Contexto: no se especifica la longitud de contexto efectiva tras el ajuste fino; asumir la de Qwen2.5-1.5B puede no ser correcto.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen2.5 también es Apache 2.0, por lo que no hay restricciones adicionales conocidas; aun así, conviene revisar los términos del dataset de entrenamiento.
- Cuantizaciones muy agresivas (Q2_K, Q3_K_S) pueden degradar notablemente la calidad de clasificación; para producción se recomienda Q4_K_M o superior.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/bsis-qwen2.5-1.5b-scam-detector-GGUF
- Modelo base: https://huggingface.co/harshcasper/bsis-qwen2.5-1.5b-scam-detector
- Dataset: https://huggingface.co/datasets/harshcasper/bsis
- Página de descargas del cuantizador: https://hf.tst.eu/model#bsis-qwen2.5-1.5b-scam-detector-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
