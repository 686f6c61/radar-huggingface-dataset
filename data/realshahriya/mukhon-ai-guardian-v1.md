# realshahriya/mukhon-ai-guardian-v1

## Resumen

MUKHON AI Guardian v1.0 es un modelo de clasificación de texto desarrollado por el equipo de ingeniería de MUKHON (Bangladesh) para la moderación de contenido de su red social homónima. Se basa en la arquitectura ELECTRA con aproximadamente 110,6 millones de parámetros y está especializado en bengalí (bn), con el objetivo declarado de servir como filtro de protección social en tiempo real: bloqueo de rumores, detección de noticias falsas y escudo antifraude financiero.

El modelo resuelve un problema muy concreto: la clasificación de publicaciones e interacciones en cuatro categorías operativas (CLEAN, TOXIC_ABUSE, SCAM_FRAUD y FAKE_NEWS_RUMOR), incluyendo estafas de pago anticipado por bKash/Nagad, phishing de OTP y demandas falsas de mensajería. Su diseño prioriza la latencia, con una optimización declarada para inferencia en servidor por debajo de los 20 ms, lo que lo hace apto para filtrado en línea dentro de un pipeline de moderación.

Es relevante ahora por dos motivos: la escasez de modelos abiertos especializados en moderación de bengalí con licencia permisiva (Apache 2.0), y su enfoque en un tokenizador que preserva clústeres grafémicos de estilo Bijoy, un detalle poco habitual en modelos multilingües genéricos que suelen fragmentar mal la escritura bengalí. El repositorio es de publicación reciente y no registra descargas ni interacciones en el momento de redactar esta ficha, por lo que debe tratarse como un artefacto emergente sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ELECTRA (transformer encoder, discriminador) |
| Parametros totales | 110.620.420 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bengalí (bn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura ELECTRA, es decir, un transformer encoder entrenado con el objetivo de detección de tokens reemplazados (replaced token detection) en lugar del enmascaramiento clásico tipo MLM. Con 110,6 millones de parámetros, se sitúa en la gama de encoders pequeños, adecuada para clasificación y filtrado de alto rendimiento. La model card menciona explícitamente una tokenización con preservación de clústeres grafémicos de estilo Bijoy, orientada a manejar correctamente las secuencias de consonantes y signos diacríticos del bengalí.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del corpus, el uso de RLHF o DPO, ni sobre el proceso de ajuste fino para las cuatro clases de salida. Tampoco se documentan innovaciones técnicas adicionales más allá de la tokenización y del objetivo de latencia. Todos estos datos deben considerarse no disponibles.

## Capacidades

- Clasificación de texto en cuatro categorías: CLEAN, TOXIC_ABUSE, SCAM_FRAUD y FAKE_NEWS_RUMOR.
- Detección de ciberacoso, insultos, hostigamiento y vulgaridad en bengalí.
- Detección de estafas de pago anticipado mediante bKash y Nagad.
- Detección de phishing de OTP y de demandas falsas de servicios de mensajería.
- Identificación de desinformación, rumores virales y pánico civil fabricado.
- Procesamiento de texto bengalí con tokenización adaptada a grafemas de estilo Bijoy.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No se documenta capacidad multilingüe más allá del bengalí.

## Casos de uso

- Moderación en tiempo real de publicaciones: el modelo clasifica cada publicación entrante en una de las cuatro categorías antes de su publicación, con un objetivo de latencia inferior a 20 ms por petición, lo que permite integrarlo en la ruta crítica del servicio.
- Filtrado de comentarios y respuestas: aplicar el clasificador a hilos de conversación para marcar o retener mensajes con TOXIC_ABUSE, reduciendo la carga de revisión humana en comunidades grandes.
- Antifraude en pagos entre usuarios: interceptar mensajes que contengan patrones de estafa con bKash o Nagad y activar una revisión o advertencia antes de que el usuario complete la transferencia.
- Protección frente a phishing de OTP: clasificar mensajes sospechosos en el chat interno y bloquear la entrega cuando se detecte SCAM_FRAUD, complementando controles técnicos de autenticación.
- Contención de rumores y noticias falsas: marcar publicaciones clasificadas como FAKE_NEWS_RUMOR para revisión editorial o para mostrar etiquetas de contexto al usuario.
- Verificación de mensajería y logística: detectar demandas falsas de courier que suplantan a empresas de reparto, un vector de fraude frecuente en comercio electrónico en Bangladesh.
- Señalización previa a revisión humana: usar el modelo como primera etapa de un pipeline de moderación, derivando solo los casos dudosos a moderadores y reduciendo el coste operativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara métricas de accuracy y F1 en los metadatos, pero no incluye valores numéricos, conjuntos de evaluación ni comparaciones.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos (110,6 M de parámetros), más memoria para activaciones y tokenización.
- VRAM estimada en fp16: aproximadamente 0,22 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1650, RTX 3060, RTX 4090, así como en CPU para cargas moderadas.
- GPU recomendadas para alto throughput: T4, L4, A10G, A100 o H100 en despliegues de servidor; el tamaño del modelo no exige aceleradores de gama alta.
- Opciones de despliegue: al ser un encoder con pesos safetensors, es compatible con Hugging Face Transformers, Text Embeddings Inference (TEI), TorchServe y ONNX Runtime; también puede exportarse a GGUF para llama.cpp si se convierte el clasificador, aunque no se documenta soporte nativo.
- Latencia y throughput: el autor declara inferencia por debajo de 20 ms en servidor; no se especifican condiciones de hardware ni tamaño de lote para esa cifra.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| MUKHON AI Guardian v1 | 110,6 M | no disponible | bn | Apache 2.0 | Moderación y antifraude en bengalí |
| BanglaBERT | ~110 M | 512 tokens (BERT base) | bn | MIT/Apache según variante | Encoder general de bengalí |
| XLM-RoBERTa base | ~278 M | 512 tokens | 100 idiomas | MIT | Encoder multilingüe general |
| mBERT | ~178 M | 512 tokens | 104 idiomas | Apache 2.0 | Encoder multilingüe general |

La comparación es aproximada: MUKHON AI Guardian es un modelo de tarea específica, mientras que las alternativas son encoders de propósito general que requerirían ajuste fino para moderación. No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: solo soporta bengalí; no se ha validado su comportamiento en otros idiomas ni en texto code-mixed bengalí-inglés, frecuente en redes sociales de Bangladesh.
- Sin validación externa: el repositorio no registra descargas ni likes, y no hay benchmarks públicos que respalden las métricas declaradas.
- Riesgo de falsos positivos y negativos en las cuatro clases; la model card no documenta matrices de confusión ni umbrales recomendados.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificaciones erróneas con consecuencias directas sobre la libertad de expresión de los usuarios si se usa como filtro automático.
- Sesgos potenciales derivados del corpus de entrenamiento no documentado; se desconoce su composición y equilibrio entre clases.
- Longitud de contexto no documentada, lo que impide planificar su uso con publicaciones largas o hilos completos.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de documentación sobre datos de entrenamiento impide evaluar riesgos de propiedad intelectual o de privacidad en el corpus.
- Para producción se recomienda calibrar umbrales por clase, monitorizar la deriva de distribución y mantener revisión humana en las decisiones de bloqueo.

## Enlaces

- Hugging Face: https://huggingface.co/realshahriya/mukhon-ai-guardian-v1
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
