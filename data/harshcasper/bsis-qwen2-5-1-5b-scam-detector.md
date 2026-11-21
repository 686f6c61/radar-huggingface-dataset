# harshcasper/bsis-qwen2.5-1.5b-scam-detector

## Resumen

BSIS Scam Detector es un modelo de 1.500 millones de parámetros derivado de Qwen2.5-1.5B-Instruct mediante un ajuste fino con LoRA en fp16 (r=16 sobre todas las proyecciones de atención y MLP, sin cuantización). Lo desarrolla el usuario de Hugging Face harshcasper y está diseñado como clasificador de estafas para tráfico SMS y WhatsApp dirigido a usuarios de India, con salida estructurada en JSON que incluye una probabilidad de estafa, las tácticas detectadas y un aviso localizado en el idioma del usuario.

El modelo no es un generador conversacional: se ha entrenado con la pérdida calculada exclusivamente sobre los tokens de la respuesta JSON del asistente, de modo que aprende a emitir datos estructurados en lugar de texto libre. Requiere un system prompt exacto en cada petición; sin él, revierte al comportamiento conversacional del modelo base y deja de producir JSON.

Su relevancia es acotada y experimental: el conjunto de evaluación es sintético y el rendimiento en mensajes reales es bajo (recall de 0,2889 sobre 500 SMS anonimizados), por lo que debe tratarse como un filtro de primera pasada y no como un veredicto final. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino con LoRA |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-1.5B-Instruct; el autor no la especifica) |
| Tipos de cuantizacion | pesos publicados en fp16; el autor recomienda cuantizar para uso on-device (no se listan formatos concretos) |
| Idiomas soportados | hi, en, bn, mr, ta, te, gu, kn, ml, or, pa, ur, as, brx, doi, kok, ks, mai, mni, ne, sa, sat, sd |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros, y se ajusta mediante LoRA en fp16 puro con rango r=16 aplicado a todas las proyecciones de atención y MLP, sin cuantización. El entrenamiento se realizó en una Tesla T4 en fp16, durante 1 época (905 pasos de optimizador con batch efectivo de 32), con scheduler coseno y AdamW. Duró 250,2 minutos y alcanzó un pico de VRAM de 14,49 GB.

Los datos provienen del config chatml del dataset `harshcasper/bsis`, generado de forma sintética por la arena de red-team de BSIS en Sarvam Token Factory; no se usaron mensajes reales de usuarios. La innovación técnica principal es la función de pérdida: solo se calcula sobre los tokens de la respuesta JSON del asistente, lo que fuerza al modelo a producir estructuras `{"scam_probability", "tactics", "warning"}` en lugar de diálogo. La entrada es una ventana de mensajes con prefijo `SENDER:`.

## Capacidades

- Clasificación binaria de estafas con umbral configurable: emite `scam_probability` en el rango 0,0-1,0.
- Etiquetado de tácticas de ingeniería social mediante identificadores (`social_friend_emergency`, `urgency`, `authority`, `pretexting`, `social_engineering`, entre otros vistos en entrenamiento).
- Generación de avisos localizados en el idioma del usuario, incluidos casos de code-mixing como hinglish.
- Salida estrictamente estructurada en JSON (98,5 % de validez estricta en el subconjunto de test sintético).
- Cobertura declarada de 22 idiomas de India más inglés, aunque la evaluación real solo cubre inglés e inglés indio.
- No soporta tool calling ni function calling de forma nativa; su interfaz es prompt de sistema fijo más mensaje de usuario.
- No dispone de modo de razonamiento explícito (thinking mode), visión ni audio.

## Casos de uso

- Filtro de primera pasada en pasarelas SMS: procesar cada mensaje entrante con el system prompt fijo y derivar a revisión humana o a un clasificador más pesado aquellos con `scam_probability` superior a 0,5. Adecuado por su tamaño reducido y su salida JSON parseable.
- Moderación en clientes de mensajería: integrar el modelo en la app para marcar conversaciones sospechosas y mostrar el aviso localizado al usuario en su idioma, aprovechando la generación de `warning` en hinglish e idiomas indios.
- Enriquecimiento de datasets de fraude: usar las etiquetas de tácticas como señal débil para preetiquetar grandes volúmenes de SMS y acelerar el etiquetado humano posterior, validando los identificadores contra la taxonomía BSIS.
- Investigación en ciberseguridad: banco de pruebas para estudiar la transferencia de modelos sintéticos a tráfico real, dado que el autor publica métricas separadas para el conjunto sintético y el real.
- Despliegue on-device en Android o iOS: con cuantización adicional sobre los 3,1 GB de pesos fp16, el modelo puede ejecutarse en dispositivos de gama alta mediante runtimes locales; el autor lo evaluó con mlx-lm en Apple M3.
- Detección de campañas de emergencia falsa: el modelo reconoce patrones de "número nuevo" y solicitud urgente de dinero, útiles para alertas en tiempo real en banca móvil.
- Prototipado rápido de pipelines de seguridad: al ser un modelo pequeño con licencia Apache 2.0, sirve para validar arquitecturas de detección antes de invertir en modelos mayores.

## Benchmarks y rendimiento

Subconjunto de test chatml de BSIS (400 filas, 200 estafas y 200 seguras), evaluado en Apple M3 con Metal y mlx-lm, decodificación greedy, max_tokens 384 y system prompt en cada petición:

| Metrica | Valor |
|---|---|
| JSON estricto valido | 98,5 % |
| Claves requeridas presentes | 98,5 % |
| Exactitud (p >= 0,50) | 0,72 |
| Precision | 0,7558 |
| Recall | 0,65 |
| F1 | 0,6989 |
| Tasa de falsos positivos | 0,21 |
| Micro-F1 de tacticas | 0,2578 |
| Estafas predichas con aviso | 100,0 % |

Conjunto real reservado (500 SMS anonimizados, system prompt y prefijo `SENDER:`):

| Metrica | Valor |
|---|---|
| JSON estricto valido | 100,0 % |
| Exactitud | 0,656 |
| Precision | 0,5417 |
| Recall | 0,2889 |
| F1 | 0,3768 |
| Tasa de falsos positivos | 0,1375 |

Seis de las 400 salidas del conjunto sintético alcanzaron el límite de 384 tokens y quedaron inválidas. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Pesos fp16: 3,1 GB en disco, según el autor.
- VRAM estimada para inferencia en fp16: aproximadamente 3,5-4 GB contando pesos y caché KV para contextos moderados; no se proporciona una cifra oficial.
- Entrenamiento: una sola Tesla T4 con 16 GB, pico de 14,49 GB de VRAM.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 4090) en fp16; con cuantización de 4 bits cabría en GPUs de 4-6 GB.
- Despliegue: transformers, text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), mlx-lm en Apple Silicon; llama.cpp u Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BSIS Scam Detector | 1,5 B | no disponible | Deteccion de estafas en SMS, salida JSON | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct (base) | 1,5 B | no disponible en esta ficha | Asistente general | Apache 2.0 | Hugging Face |
| Otros detectores de spam SMS | no disponible | no disponible | Clasificacion binaria | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Los datos de entrenamiento son sintéticos, generados por una arena de red-team; no se usaron mensajes reales, lo que limita la generalización.
- El recall sobre el conjunto real es de 0,2889: el modelo deja pasar más de la mitad de los SMS de spam de ese conjunto. No debe usarse como veredicto final.
- El modelo emite una probabilidad y un aviso; su salida no es verdad objetiva y requiere validación humana en flujos críticos.
- La evaluación real cubre únicamente inglés e inglés indio, pese a la lista declarada de 22 idiomas.
- Requiere el system prompt exacto de entrenamiento; sin él revierte a conversación del modelo base y deja de producir JSON.
- Los identificadores de táctica no vistos en entrenamiento pueden alucinarse en mensajes atípicos; deben validarse contra la taxonomía BSIS.
- La licencia del modelo es Apache 2.0, pero el dataset `harshcasper/bsis` tiene sus propios términos de uso para investigación, lo que puede condicionar el uso comercial derivado.
- Los pesos fp16 ocupan 3,1 GB; para uso on-device el autor recomienda cuantizar adicionalmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harshcasper/bsis-qwen2.5-1.5b-scam-detector
- Dataset BSIS: https://huggingface.co/datasets/harshcasper/bsis
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
