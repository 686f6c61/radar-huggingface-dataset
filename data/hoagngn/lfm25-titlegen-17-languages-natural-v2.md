# hoagngn/lfm25-titlegen-17-languages-natural-v2

## Resumen

LFM2.5 Title natural-v2 (230M) es un modelo de generación de títulos de conversación obtenido por fine-tuning de LiquidAI/LFM2.5-230M mediante LoRA (r32, fusionado, bf16). Lo desarrolla el usuario hoagngn y resuelve un problema muy concreto: producir títulos cortos que expresen el propósito del mensaje del usuario con una formulación natural, en lugar de copiar sus primeras palabras. Es la segunda iteración de la familia, sucesora de `hoagngn/lfm25-titlegen-17-languages-onnx`, y mantiene el mismo formato de prompt y los mismos modos (descriptivo y discreto).

El modelo cubre 17 idiomas (vi, en, zh, ja, ko, th, fr, de, es, pt, ru, id, tl, ms, my, lo, ta), con un ajuste y una validación centrados en vietnamita. Con 229.693.184 parámetros y un repo de 0,5 GB, está pensado para despliegue ligero en tareas de infraestructura conversacional, no como modelo de propósito general.

Su relevancia actual radica en la mejora medible frente a v1: un 74 % de victorias en comparación por pares en vietnamita y una tasa de aprobación estricta del 37 % sobre 200 mensajes reales retenidos, con un protocolo de evaluación documentado de forma inusualmente detallada. Las limitaciones por idioma también están declaradas con honestidad (zh, ja, ko, id, tl, th y lo rinden por debajo de v1 en juicio por pares).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM2 de LiquidAI); fine-tuning LoRA r32 fusionado en bf16 |
| Parametros totales | 229.693.184 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el predecesor v1 tiene variante ONNX) |
| Idiomas soportados | vi, en, zh, ja, ko, th, fr, de, es, pt, ru, id, tl, ms, my, lo, ta (17) |
| Licencia | lfm1.0 (license_name: lfm1.0; license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-230M y se ajusta mediante LoRA con rango 32, posteriormente fusionado y exportado en bf16. No se documenta en la información disponible la arquitectura interna detallada de la base (tipo de atención, número de capas, vocabulario) ni la longitud de contexto nativa.

El entrenamiento se centró en vietnamita: aproximadamente 13,9k mensajes con títulos reescritos en estilo "propósito primero", incluyendo 1,4k peticiones largas sintéticas; para el resto de idiomas no ingleses se reetiquetaron 1,5k mensajes por lengua. Las etiquetas pasaron comprobaciones por reglas (sin nombres ni números inventados, longitud máxima de 8 palabras, sin diagnósticos no declarados, reutilizando las compuertas de seguridad C1/C3 del proyecto) y una revisión por LLM. Se incorporaron reglas específicas para títulos de salud: preguntas de dosis se titulan como "Tư vấn liều …", enfermedades graves nombradas como "Cảnh báo …", enfermedades comunes como "<síntoma> nghi …", hallazgos poco claros como "Theo dõi …", sin afirmar diagnósticos que el mensaje no mencione.

## Capacidades

- Generación de títulos de conversación en dos modos: descriptivo y discreto.
- Formulación orientada al propósito del mensaje ("Lập lịch trình đi Đà Lạt", "Xử lý dị ứng kháng sinh") en lugar de copia literal de las primeras palabras.
- Multilingüe en 17 idiomas, con calidad declarada desigual según la lengua.
- Aplicación de reglas de seguridad en títulos de temática sanitaria (dosis, enfermedades graves, enfermedades comunes, hallazgos ambiguos).
- Restricción de longitud de título (≤ 8 palabras en el entrenamiento y en las comprobaciones).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Titulado automático de conversaciones en asistentes de chat: el modelo recibe el mensaje del usuario y devuelve un título de 2 a 8 palabras que resume el propósito, lo que permite listar historiales legibles en interfaces de mensajería.
- Gestión de bandejas de entrada de soporte: agrupar y priorizar tickets por propósito ("Xử lý dị ứng kháng sinh") facilita el enrutado a colas especializadas sin intervención manual.
- Aplicaciones de salud con requisitos de seguridad: las reglas integradas evitan afirmar diagnósticos no mencionados y generan títulos prudentes ("Cảnh báo …", "Theo dõi …"), adecuados para productos sanitarios con revisión regulatoria.
- Productos multilingües en el sudeste asiático: cobertura de vi, th, id, ms, tl, my, lo y ta en un único modelo de 230M, lo que simplifica el despliegue frente a soluciones por idioma.
- Etiquetado y organización de historiales largos: el modelo se entrenó con 1,4k peticiones largas sintéticas para manejar mensajes extensos, útil en herramientas de notas o correo.
- Clasificación temática ligera en pipelines de datos: los títulos generados sirven como etiquetas de propósito para agrupar conversaciones en analítica o búsqueda.
- Despliegue en entornos con recursos limitados: con 0,5 GB de repo y ~230M de parámetros, cabe en CPU o GPU de gama baja para titulado en línea de bajo coste.

## Benchmarks y rendimiento

| Medida | v1 (desplegado) | natural-v2 |
|---|---|---|
| Luna benchmark, 17 idiomas, juez gpt-5.6-luna, media/4 (160 ítems) | 3,44 | 3,48 |
| Comparación por pares en vietnamita frente a v1 (30 mensajes dev, dos evaluadores deben coincidir, títulos idénticos excluidos) | — | 74 % de victorias (16 victorias / 3 derrotas / 8 empates) |
| Tasa de aprobación estricta en vietnamita sobre 200 mensajes reales retenidos (≤ 8 palabras, sin sílabas extrañas, natural y propósito correcto) | 32,5 % | 37 % (largos 31 %, cortos 42 %) |

Resultados por idioma en el benchmark Luna (natural-v2 / v1): de 3,52/3,57; en 3,64/3,72; es 3,90/3,88; fil 3,31/3,21; fr 3,56/3,29; id 3,02/3,14; ja 3,19/3,15; ko 3,88/3,81; lo 2,98/2,98; ms 3,70/3,69; my 3,27/3,31; pt 3,64/3,60; ru 3,57/3,61; ta 3,76/3,60; th 3,44/3,35; vi 3,13/2,94; zh 3,69/3,54.

Tasas de victoria por pares frente a v1: vi 74 %, ta 72 %, de 63 %, es 63 %, fr 61 %, pt 61 %, ru 57 %, my 56 %, ms 55 %, lo 48 %, th 44 %, id 41 %, tl 40 %, ja 36 %, ko 33 %, zh 31 %.

El autor advierte que, con 10 ítems por idioma, las diferencias por lengua inferiores a 0,3 deben considerarse ruido, y que el error estándar por idioma en la comparación por pares es de 10 a 15 puntos (unos 2,5 puntos para el agregado).

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 0,5 GB en bf16; en fp16/bf16 cabría en GPUs con 2 GB o más, y en cuantizaciones de 8 o 4 bits el peso se reduce aproximadamente a 0,25 y 0,12 GB respectivamente (estimación a partir del número de parámetros; no publicada por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobrada para el modelo; también es viable en CPU para titulado de baja concurrencia.
- Cabe en GPU consumer: sí, en toda la gama actual e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: no se documentan en la información disponible; el predecesor v1 tiene variante ONNX, y al ser safetensors es compatible con ecosistemas estándar (transformers, llama.cpp/Ollama tras conversión, vLLM/TGI para serving).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| LFM2.5 Title natural-v2 | 229,7M | no disponible | 17 | lfm1.0 | Titulado de conversación |
| LFM2.5 Title v1 (ONNX) | ~230M | no disponible | 17 | lfm1.0 | Titulado de conversación (predecesor) |
| LiquidAI/LFM2.5-230M (base) | ~230M | no disponible | no disponible | lfm1.0 | Modelo base de propósito general |
| Modelos de titulado de propósito general (p. ej. variantes pequeñas de Qwen o Gemma) | 0,5B–2B | variable | variable | variable | Titulado y resumen corto, sin ajuste específico |

La comparación cuantitativa disponible se limita a v1: natural-v2 mejora el agregado del benchmark Luna (3,48 frente a 3,44) y gana en juicio por pares en 9 de 16 idiomas, con retrocesos en zh, ja, ko, id, tl, th y lo. No hay datos públicos que permitan comparar con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Idiomas con rendimiento inferior a v1 en juicio por pares: zh (31 %), ko (33 %), ja (36 %), tl (40 %), id (41 %), th (44 %) y lo (48 %); las diferencias en el benchmark para esos idiomas están dentro del ruido.
- Los mensajes largos traducidos automáticamente siguen produciendo títulos defectuosos aproximadamente una de cada tres veces, igual que v1; el autor lo atribuye a un límite de capacidad del modelo de 230M, no a falta de datos.
- Tasa de aprobación estricta en vietnamita del 37 % sobre mensajes reales retenidos: dos de cada tres títulos no superan todos los criterios, lo que exige revisión o filtrado en producción.
- Riesgo de alucinación controlado solo parcialmente mediante reglas (sin nombres ni números inventados, sin diagnósticos no declarados); las comprobaciones se aplicaron al entrenamiento, no necesariamente en tiempo de inferencia.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia lfm1.0 (license: other): conviene revisar el archivo LICENSE antes de un uso comercial, ya que las condiciones no están resumidas en la model card.
- Longitud de contexto no documentada: no se debe asumir una ventana amplia para conversaciones completas; el modelo está diseñado para recibir el mensaje del usuario.
- El modelo no es de propósito general: usarlo para generación libre, código o razonamiento producirá resultados pobres.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hoagngn/lfm25-titlegen-17-languages-natural-v2
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M
- Predecesor v1 (ONNX): https://huggingface.co/hoagngn/lfm25-titlegen-17-languages-onnx
- Kit de evaluación público `titlegen-public-kit-v1` (referenciado en la model card; sin URL directa en la información disponible)
- Licencia lfm1.0: archivo LICENSE en el repositorio del modelo
