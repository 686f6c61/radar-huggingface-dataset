# AtomicChat/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una cuantización GGUF del modelo Qwen/Qwen3.8-27B (27.320.697.856 parámetros, unos 27,3 mil millones) publicada por AtomicChat, en la que se ha eliminado la dirección de rechazo del modelo original mediante una técnica de abliteración. El resultado es un modelo que mantiene las capacidades del base —generación de texto, razonamiento con modo thinking, uso de herramientas y entrada imagen-texto— pero que deja de rechazar peticiones que el original declina, incluidas las de red teaming. La model card acompaña cada fichero con métricas medidas sobre ese fichero concreto: tasa de rechazo, sobre-rechazo (XSTest), MMLU, llamadas a herramientas, divergencia KL respecto al original en BF16 y aceptación del borrador MTP.

El interés práctico del lanzamiento está en la trazabilidad: no se publica un único punto de cuantización, sino seis variantes (Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS e IQ3_S) con tamaño en disco, clase de GPU objetivo y degradación medida frente al original. Todas ellas conservan la cabeza MTP (multi-token prediction) y el proyector de visión dentro del GGUF, lo que permite decodificación especulativa y entrada de imágenes en llama.cpp sin ficheros adicionales.

El modelo se distribuye bajo licencia Apache 2.0 y está pensado para ejecución local en GPU de consumo: desde 13,9 GB (IQ3_S, clase 16 GB de VRAM) hasta 28,9 GB (Q8_0, clase 48 GB o Mac con memoria unificada). Es relevante ahora porque demuestra que la edición de comportamiento y la cuantización agresiva pueden convivir con una pérdida de calidad medible y pequeña (KLD 0,0034–0,0149 según fichero), algo que hasta hace poco se evaluaba de forma cualitativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con proyector de visión y cabeza MTP; clase `Qwen3_5ForConditionalGeneration`, 64 capas y 1 capa MTP según la información de búsqueda sobre el modelo base |
| Parametros totales | 27.320.697.856 (aproximadamente 27,3 mil millones) |
| Parametros activos | No disponible; no se indica que sea un modelo MoE |
| Longitud de contexto | 262.144 tokens según la información de búsqueda del modelo base; la model card no lo declara explícitamente |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_S (todos medidos en la model card); una fuente externa menciona además F16 y hasta 12 niveles |
| Idiomas soportados | No disponible como lista oficial; evaluado en inglés, ruso, chino y alemán con 100 % de respuesta en el idioma de la petición |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF para llama.cpp, con cabeza MTP y proyector de visión incluidos en el fichero |

## Arquitectura y entrenamiento

La model card no documenta el entrenamiento del modelo base ni el proceso de edición más allá de su descripción: se parte de Qwen3.8-27B y se proyecta fuera la dirección de rechazo, generando una variante "uncensored" que después se cuantiza con matrices de importancia (imatrix) propias de AtomicChat en sus builds denominados AD. Los ficheros conservan la cabeza MTP y el proyector de visión, de modo que el pipeline image-text-to-text y la decodificación especulativa siguen operativos tras la cuantización. No hay datos publicados sobre número de tokens de entrenamiento, composición del dataset, RLHF/DPO ni sobre el corpus usado para calcular la dirección de rechazo.

La innovación reseñable no está en la arquitectura sino en la metodología de medida: cada fichero se evalúa de forma individual contra el original en BF16 con texto neutro reservado (KLD y coincidencia top-1), con 81 prompts de JailbreakBench en inglés, 100 de red teaming en ruso, 30 instrucciones inocuas en modo xhigh thinking para detectar trazas que se repiten o no cierran tras 3072 tokens, 250 prompts XSTest de sobre-rechazo, 500 preguntas de MMLU, 20 pruebas de tool calling y comprobación de idioma de respuesta en ruso, chino y alemán. La aceptación del borrador MTP se sitúa en el 71–72 % con una aceleración declarada de ×1,89 a ×2,32 en generación de texto.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat de Qwen.
- Razonamiento explícito con modo thinking activable y presupuesto de tokens configurable (la evaluación usa 3072 tokens); existe un modo xhigh thinking.
- Matemáticas y código, evaluados indirectamente vía MMLU (hasta 83,6 % en Q8_0 y Q6_K) y uso de herramientas.
- Tool calling / function calling: 20/20 en todas las variantes publicadas.
- Entrada de imagen: pipeline image-text-to-text, con el proyector de visión empaquetado en el GGUF.
- Multilingüismo práctico: responde en ruso, chino y alemán cuando se le pregunta en esos idiomas (100 % en las tres lenguas en todos los ficheros).
- Decodificación especulativa mediante la cabeza MTP integrada, con aceptación del 71–72 % del borrador.
- Comportamiento sin rechazos: 0/81 en JailbreakBench (EN), 0/100 en red teaming (RU), 0/30 con xhigh thinking y 0/250 en XSTest en todas las variantes editadas.
- Compatibilidad con endpoints y aplicaciones tipo Atomic Chat, con conmutador de thinking.

## Casos de uso

- Red teaming y evaluación de seguridad: el modelo sirve como generador de ataques y de respuestas no filtradas en pipelines internos de evaluación, comparando su comportamiento con el del Qwen3.8-27B original (que rechaza 75/81 y 77/100 en los mismos conjuntos) para calibrar clasificadores y filtros.
- Investigación sobre abliteración: al publicarse seis cuantizaciones con KLD, top-1, MMLU y tasa de rechazo medidas por fichero, permite estudiar la relación entre bits por peso y preservación del comportamiento editado sin replicar la cuantización.
- Asistencia técnica y atención al cliente en local: con 262.144 tokens de contexto declarados en el base y tool calling 20/20, se puede desplegar un agente que consulte APIs internas y mantenga historiales largos en una sola GPU de 24 GB con Q4_K_M.
- Procesamiento de documentos con imágenes: al conservar el proyector de visión, admite flujos de OCR, extracción de tablas y preguntas sobre capturas o escaneos sin depender de un servicio en la nube.
- Generación de código en entornos con requisitos de privacidad: un Q4_K_M de 17,1 GB cabe en una RTX 4090 y permite autocompletado, refactorización y explicación de código sin salida de datos, con MTP acelerando la generación ×1,92.
- Agentes multi-paso con razonamiento: el modo thinking con presupuesto acotado (3072 tokens en la evaluación) y la baja tasa de trazas bloqueadas (1–2 de 30) lo hacen utilizable en bucles de planificación donde un bucle infinito rompería el pipeline.
- Experimentación multilingüe en ruso, chino y alemán: útil para prototipos de asistentes en esos idiomas, con la garantía medida de que responde en la lengua de la petición.
- Despliegue en estaciones de trabajo modestas: la variante IQ3_S (13,9 GB) entra en GPU de 16 GB y mantiene 81,2 % de MMLU, suficiente para tareas de clasificación, resumen y extracción con supervisión humana.

## Benchmarks y rendimiento

Resultados por fichero, medidos por el autor sobre cada archivo (KLD y top-1 contra el original en BF16 con texto neutro reservado; rechazos en JailbreakBench EN con 81 prompts; red teaming RU con 100; xhigh thinking EN con 30; XSTest con 250; thinking stuck sobre 30 instrucciones Alpaca; MMLU con 500 preguntas; tools con 20 pruebas):

| Fichero | Tamano | KLD / top-1 | Rechazos EN | Rechazos RU | Rechazos xhigh | XSTest rechazados | Thinking stuck | MMLU (500) | Tools | Idioma de respuesta | MTP |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Qwen3.8-27B-AD-Q4_K_M (original) | 17,1 GB | 0,0113 / 95,6 % | 75/81 | 77/100 | 29/30 | 15/250 | 2/30 | 83,0 % | 20/20 | 100 % | 71 %, ×1,89 |
| Qwen3.8-27B-AD-IQ3_S (original) | 13,8 GB | 0,0325 / 92,4 % | 76/81 | 79/100 | 28/30 | 16/250 | 1/30 | 80,2 % | 20/20 | 100 % | 71 %, ×1,95 |
| Uncensored Q8_0 | 28,9 GB | 0,0034 / 97,5 % | 0/81 | 0/100 | 0/30 | 0/250 | 1/30 | 83,6 % | 20/20 | 100 % | 72 %, ×2,32 |
| Uncensored AD-Q6_K | 24,9 GB | 0,0038 / 97,4 % | 0/81 | 0/100 | 0/30 | 0/250 | 1/30 | 83,6 % | 20/20 | 100 % | 72 %, ×2,25 |
| Uncensored AD-Q5_K_M | 20,2 GB | 0,0068 / 96,4 % | 0/81 | 0/100 | 0/30 | 0/250 | 1/30 | 83,2 % | 20/20 | 100 % | 72 %, ×2,02 |
| Uncensored AD-Q4_K_M | 17,1 GB | 0,0140 / 95,0 % | 0/81 | 0/100 | 0/30 | 0/250 | 2/30 | 83,0 % | 20/20 | 100 % | 71 %, ×1,92 |
| Uncensored AD-IQ4_XS | 16,5 GB | 0,0149 / 94,8 % | 0/81 | 0/100 | 0/30 | 0/250 | 1/30 | 83,0 % | 20/20 | 100 % | 72 %, ×1,94 |
| Uncensored AD-IQ3_S | 13,9 GB | 0,0350 / 92,0 % | 0/81 | 0/100 | 0/30 | 0/250 | 1/30 | 81,2 % | 20/20 | 100 % | 72 %, ×1,96 |

Comparación con otras builds sin censura, mismo servidor, mismas prompts y plantilla, decodificación greedy y presupuesto de thinking de 3072 tokens:

| Fichero | Tamano | Rechazos EN | Rechazos RU | XSTest | Stuck (xhigh) | MMLU (500) | KLD / top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Qwen3.8-27B-AD-Q4_K_M (original) | 17,1 GB | 75/81 | 77/100 | 15/250 | 2/30 | 83,0 % (p = 1,00) | 0,0113 / 95,6 % |
| AtomicChat Uncensored AD-Q4_K_M | 17,1 GB | 0/81 | 0/100 | 0/250 | 2/30 | 83,0 % | 0,0140 / 95,0 % |
| JonathanColetti Qwen3.8-27B-Uncensored Q4_K_M | 16,8 GB | 0/81 | 0/100 | 1/250 | 2/30 | 82,8 % (p = 1,00) | 0,0218 / 93,8 % |
| Huihui-Qwen3.8-27B-abliterated Q4_K | 16,8 GB | 0/81 | 0/100 | 2/250 | 2/30 | 82,2 % (p = 0,50) | No disponible |

## Requisitos de hardware

- VRAM estimada según el tamaño del fichero más caché KV; la model card clasifica cada fichero por la GPU más pequeña en la que entra "con espacio para contexto": Q8_0 28,9 GB (48 GB), Q6_K 24,9 GB (32 GB), Q5_K_M 20,2 GB (32 GB), Q4_K_M 17,1 GB (24 GB), IQ4_XS 16,5 GB (24 GB), IQ3_S 13,9 GB (16 GB).
- GPU recomendadas: RTX 4090 o RTX 3090 de 24 GB para Q4_K_M e IQ4_XS; A6000, A100 40 GB o RTX 6000 Ada para Q6_K y Q5_K_M; A100 80 GB o H100 para Q8_0 con contexto amplio. Con 16 GB (RTX 4080, 4060 Ti 16 GB, A4000) solo son realistas IQ3_S y, con menos margen, IQ4_XS.
- Cabe en GPU de consumo: sí, desde 16 GB de VRAM con IQ3_S; una guía del propio autor indica ejecución desde 12 GB con una cuantización de bajo bit y 4-bit MLX en un Mac de 32 GB de memoria unificada.
- Atención al contexto: 262.144 tokens de ventana implican una caché KV muy grande; en GPU de 24 GB conviene limitar el contexto o usar cuantización de caché, y el presupuesto de thinking (3072 tokens en las pruebas) debe acotarse explícitamente.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python, servidor `llama-server`); el formato GGUF con MTP y proyector de visión integrados está pensado para este ecosistema. vLLM y TGI no están orientados a estos ficheros; no disponible su soporte para esta variante concreta.
- Latencia y throughput absolutos: no disponibles. Solo se publica la aceleración relativa por MTP, de ×1,89 a ×2,32 en generación de texto según fichero, con aceptación del borrador del 71–72 %.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | MMLU (500) | Rechazos EN / RU | KLD vs original | Disponibilidad |
|---|---|---|---|---|---|---|---|
| AtomicChat Qwen3.8-27B-Uncensored (AD-Q4_K_M) | 27,3 B | 262.144 (según base) | apache-2.0 | 83,0 % | 0/81 / 0/100 | 0,0140 / 95,0 % top-1 | GGUF, 6 niveles |
| Qwen/Qwen3.8-27B original (AD-Q4_K_M) | 27,3 B | 262.144 | apache-2.0 | 83,0 % | 75/81 / 77/100 | referencia | GGUF y pesos completos |
| JonathanColetti Qwen3.8-27B-Uncensored | 27,3 B | 262.144 | no disponible en la información dada | 82,8 % (p = 1,00) | 0/81 / 0/100 | 0,0218 / 93,8 % top-1 | GGUF, Q4_K_M comparado |
| Huihui-Qwen3.8-27B-abliterated | 27,3 B | no disponible | no disponible | 82,2 % (p = 0,50) | 0/81 / 0/100 | no disponible | GGUF, Q4_K comparado |

Frente a las otras dos builds sin censura, la variante de AtomicChat conserva mejor la distribución del original (KLD 0,0140 frente a 0,0218 de JonathanColetti) y presenta 0/250 en XSTest frente a 1/250 y 2/250. Las diferencias de MMLU entre las tres builds no son estadísticamente significativas según los p-valores de McNemar reportados (1,00 y 0,50).

## Limitaciones y advertencias

- La abliteración elimina los rechazos por diseño: 0/81 en JailbreakBench, 0/100 en red teaming en ruso y 0/250 en XSTest. No es un modelo apto para exposición directa a usuarios finales sin un filtro externo de entrada y salida.
- Riesgo elevado de generar contenido dañino, ilegal o inseguro si se le solicita; la licencia Apache 2.0 no exime de responsabilidad legal por el uso.
- Una fuente externa (orcarouter.ai) describe la publicación como "research-only" pese a la licencia apache-2.0 declarada en la model card; conviene verificar las condiciones antes de un uso comercial.
- El modo thinking puede quedarse bloqueado: 1–2 de cada 30 trazas se repiten o no cierran tras 3072 tokens, incluso en el original. En producción hay que imponer un límite duro de tokens de razonamiento.
- Degradación medible en cuantizaciones bajas: MMLU cae de 83,0 % a 81,2 % en IQ3_S y el KLD sube de 0,0140 a 0,0350, con top-1 del 92,0 %. Para tareas sensibles a la fidelidad, usar Q6_K o Q8_0.
- No hay información publicada sobre sesgos demográficos, de género o culturales, ni sobre la composición del corpus de entrenamiento; la evaluación multilingüe se limita a ruso, chino y alemán, sin métricas por idioma.
- El contexto declarado de 262.144 tokens proviene de fuentes secundarias sobre el modelo base; la model card no lo confirma y la ventana efectiva en llama.cpp depende de la memoria disponible.
- El pipeline es image-text-to-text, pero no se publican benchmarks de visión; no hay evidencia medida del rendimiento del proyector tras la cuantización.
- Alucinación: sin datos específicos publicados; el comportamiento esperado es el del modelo base, con el riesgo añadido de que la edición de comportamiento puede alterar la calibración en dominios sensibles.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/AtomicChat/Qwen3.8-27B-Uncensored-GGUF
- Build sin editar del mismo autor: https://huggingface.co/AtomicChat/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Guía de ejecución local de Atomic Chat: https://atomic.chat/blog/guides/how-to-run-qwen-3-8-27b-uncensored-locally
- Guía de ejecución (versión sin censura, blog del autor): https://atomic.chat/blog/guides/how-to-run-qwen-3-8-locally
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- Build comparable de JonathanColetti: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored-GGUF
- Build abliterada de Huihui: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-uncensored-gguf-jonathancoletti
- Análisis en orcarouter: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
