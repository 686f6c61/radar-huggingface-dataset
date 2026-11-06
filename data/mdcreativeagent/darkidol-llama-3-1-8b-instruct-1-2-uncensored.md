# mdcreativeagent/DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored

## Resumen
DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored es un ajuste fino (fine-tune) del modelo Meta Llama-3.1-8B-Instruct, publicado por el usuario mdcreativeagent en Hugging Face. El modelo parte de la arquitectura transformer autorregresiva de Llama 3.1 con 8.030.261.248 parámetros y una ventana de contexto heredada de 128.000 tokens. Su objetivo declarado es eliminar los mecanismos de rechazo (refusals) del modelo base y reforzar comportamientos orientados a roleplay, escritura creativa y escenarios "dark" o sin censura, además de un realineamiento específico para chino, japonés y coreano.

La relevancia de esta ficha es doble: por un lado, documenta un caso típico de la práctica de "abliteration" (eliminación de la dirección de rechazo en el espacio de activaciones, según el método descrito en el blog de mlabonne y el post de LessWrong citado por el autor); por otro, advierte de las implicaciones de licencia y seguridad de distribuir variantes sin censura de modelos con licencia comunitaria. El autor indica que el módulo se ha readaptado para "cumplir diversos roles" y "adaptarse a teléfonos móviles", y que solo se ha probado en inglés.

El repositorio ocupa 16,1 GB en safetensors (pesos en precisión nativa, probablemente bfloat16) y no registra descargas ni "likes" en el momento de la consulta. Existen versiones GGUF publicadas por terceros (LWDCLS y mradermacher), lo que facilita el despliegue en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (Llama 3.1), con Grouped-Query Attention (GQA) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredado de Llama-3.1-8B-Instruct) |
| Tipos de cuantizacion | No especificados en la model card; existen GGUF de terceros (i1-GGUF, IQ-Imatrix, GGUF estándar) |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th, zh, ko, ja (el autor indica realineamiento de zh/ko/ja y pruebas solo en inglés) |
| Licencia | Llama 3.1 Community License (llama3.1) |
| Formato de pesos | safetensors (repo principal); GGUF en repos de terceros |

## Arquitectura y entrenamiento
La base es Llama-3.1-8B-Instruct: transformer autorregresivo con GQA, entrenado por Meta sobre más de 15 billones (15T+) de tokens de datos públicos en línea, con corte de conocimiento en diciembre de 2023, y alineado mediante SFT y RLHF. El fine-tune DarkIdol no documenta el volumen de tokens de ajuste, la composición exacta del dataset ni si se empleó DPO o RLHF adicional; la model card solo menciona créditos a datasets de ChaoticNeutrals, Gryphe, meseca y NeverSleep Lumimaid, orientados a roleplay y escritura.

La innovación técnica declarada es la aplicación de abliteration: según las referencias del autor, el rechazo en los LLM está mediado por una única dirección en el espacio de activaciones, y el procedimiento (descrito en el blog de mlabonne) consiste en identificar esa dirección y proyectarla fuera de los pesos/activaciones para que el modelo deje de rechazar peticiones. El autor también afirma haber "readaptado" la combinación de módulos para roles variados y haber realineado zh/ko/ja, pero no aporta detalles sobre la metodología de ese realineamiento ni métricas de validación. No se documentan técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas SSM.

## Capacidades
- Generación de texto conversacional multi-turno, orientada a roleplay y "dark-roleplay".
- Escritura creativa: prompts de escritura, "writing opus", composición de canciones y textos extensos (el autor describe respuestas "académicas, como una tesis").
- Generación de código (heredada de Llama-3.1-Instruct; la model card indica salida de texto y código).
- Capacidades multilingües según la lista de etiquetas (11 idiomas), con realineamiento declarado para chino, japonés y coreano.
- Modo sin censura: se espera que no aplique rechazos ante peticiones que el modelo base rechazaría (comportamiento no verificado de forma independiente).
- Respuesta rápida (declaración del autor, sin cifras de latencia).
- No se documenta soporte explícito de tool calling, function calling, uso como agente, visión, audio ni modo "thinking". Al ser un fine-tune de Llama-3.1-Instruct, el formato de tool calling podría conservarse, pero no está garantizado ni documentado.

## Casos de uso
- Roleplay y narrativa interactiva: el modelo está ajustado específicamente para mantener personajes y escenarios multi-turno; su ventana de 128k tokens permite conservar un historial largo de conversación sin truncar el contexto del personaje.
- Escritura creativa y composición de canciones: el autor declara respuestas extensas y detalladas; útil para generar borradores de letras, guiones o ficción que luego se revisan y editan manualmente.
- Prototipado de interfaces conversacionales sin restricciones: en entornos de investigación controlados, permite estudiar cómo responde un modelo sin alineamiento de rechazo, comparándolo con el base para analizar sesgos y seguridad.
- Generación de diálogos para videojuegos o novelas visuales: con contexto largo se pueden encadenar tramas y mantener coherencia entre escenas; requiere revisión humana por riesgo de alucinación.
- Experimentos de "abliteration" reproducibles: sirve como referencia para investigadores que quieran comparar el comportamiento de un modelo abliterado frente al original en tareas de rechazo.
- Despliegue local en hardware de consumo: gracias a las versiones GGUF de terceros (mradermacher, LWDCLS), puede ejecutarse en portátiles con GPU modesta para pruebas de escritura o chat offline.
- Traducción y adaptación multilingüe de contenido creativo: aunque el autor solo probó inglés, las etiquetas incluyen es, fr, de, it, pt, hi, th, zh, ko y ja; conviene validar calidad por idioma antes de usarlo en producción.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni comparaciones numéricas con el modelo base; solo menciona un script de prueba de comportamientos dañinos (`Uncensored_Test/harmful_behaviors.py`) para medir la tasa de rechazo, sin reportar resultados.

## Requisitos de hardware
- VRAM estimada para inferencia: en bfloat16/FP16, aproximadamente 16 GB de pesos más overhead (KV cache y activaciones), por lo que se necesitan del orden de 18-20 GB para contexto moderado; con contexto de 128k completo, la KV cache de Llama-3.1-8B (GQA) puede añadir varios GB adicionales.
- Cuantización GGUF de 8 bits: ~8-9 GB; Q4_K_M: ~5 GB; IQ2/IQ3: ~3-4 GB (estimaciones estándar para 8B; los repos de terceros ofrecen i1-GGUF e IQ-Imatrix).
- GPU recomendadas: A100 40GB, H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090/4080 (16-24 GB) para FP16 con contexto reducido o 8 bits.
- Cabe en GPU de consumo: sí, con cuantización Q4/Q5 en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y similares; en CPU mediante llama.cpp con RAM suficiente.
- Opciones de despliegue: transformers (>= 4.43.1, requisito indicado por el autor), vLLM, TGI, llama.cpp, Ollama (a partir de GGUF), LM Studio (el autor usa LM Studio en el script de prueba).
- Latencia y throughput: no disponibles; el autor afirma "respuesta rápida" sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored | 8,03B | 128k | Roleplay sin censura (abliterated) | Llama 3.1 Community | HF (safetensors + GGUF de terceros) |
| Meta Llama-3.1-8B-Instruct | 8,03B | 128k | Asistente general alineado (SFT + RLHF) | Llama 3.1 Community | HF oficial |
| Modelos abliterados de la familia Llama 3.1 8B (p. ej. variantes de mlabonne) | ~8B | 128k | Eliminación de rechazo | Llama 3.1 Community | HF |
| Mistral-7B-Instruct (referencia de tamaño similar) | 7,2B | 32k | Asistente general | Apache 2.0 | HF |

No se dispone de datos de benchmarks que permitan comparar rendimiento numérico entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias
- Modelo sin censura: la eliminación de rechazos implica que puede generar contenido dañino, ofensivo o ilegal; no es apto para despliegues públicos sin filtros externos.
- Riesgo de alucinación elevado: el propio autor advierte que los resultados son "solo de referencia" y que no deben confiarse plenamente; el fine-tune sobre datasets de roleplay puede degradar la fidelidad factual del base.
- Solo probado en inglés por el autor; el realineamiento de zh/ko/ja no está validado con métricas, y el resto de idiomas (es, fr, de, etc.) procede de la base sin garantías.
- Licencia Llama 3.1 Community: uso comercial permitido bajo condiciones (atribución, límite de 700 millones de usuarios activos mensuales para ciertos usos, restricciones de uso aceptable); el autor remite al acuerdo de Llama 3.1. La redistribución debe conservar el nombre "Llama" y avisos de licencia.
- El repo principal incluye campos `extra_gated_fields` (nombre, país, afiliación), lo que implica acceso condicionado en Hugging Face.
- Sin tracción comunitaria (0 descargas, 0 likes) y creado/actualizado el 2026-11-06: no hay evidencia de validación independiente de calidad o seguridad.
- No se documentan garantías sobre tool calling o comportamiento de agente; no asumir que se conservan intactas las capacidades del base.
- Uso responsable: conviene evaluar sesgos (los datasets de roleplay pueden amplificar estereotipos) y establecer moderación en cualquier producto que lo integre.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/mdcreativeagent/DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored
- Repo original referenciado en la model card: https://huggingface.co/aifeifei798/DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored
- GGUF de LWDCLS: https://huggingface.co/LWDCLS/DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored-GGUF-IQ-Imatrix-Request
- GGUF i1 de mradermacher: https://huggingface.co/mradermacher/DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored-i1-GGUF
- GGUF de mradermacher: https://huggingface.co/mradermacher/DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored-GGUF
- GGUF de mav23: https://huggingface.co/mav23/DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored-GGUF
- Blog sobre abliteration (mlabonne): https://huggingface.co/blog/mlabonne/abliteration
- Post sobre la dirección de rechazo (LessWrong): https://www.lesswrong.com/posts/jGuXSZgv6qfdhMCuJ/refusal-in-llms-is-mediated-by-a-single-direction
- Perfil del autor en X: https://x.com/aifeifei799
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE
