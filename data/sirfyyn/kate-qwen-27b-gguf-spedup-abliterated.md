# sirfyyn/Kate-Qwen-27B-GGUF-SpedUp-Abliterated

## Resumen

Kate-Qwen-27B-GGUF-SpedUp-Abliterated es una cuantización GGUF de un modelo de 27.320.697.856 parámetros derivado de `ukisai/Swift-1.5-Qwen3.8-27b`, publicada por el usuario sirfyyn. Se trata de la variante "abliterated" de su cuantización previa (Katy), es decir, un modelo al que se le ha eliminado la dirección de rechazo del espacio residual siguiendo el método de Arditi et al. (arXiv:2406.11717), con el objetivo de que un agente local que gestiona su propia máquina deje de rechazar tareas legítimas de sistema.

El modelo está pensado para ejecutarse con llama.cpp en una única GPU de 32 GB (el autor lo corre en una RTX PRO 4500 Blackwell), y se distribuye junto a una cabeza de decodificación especulativa DSpine (bloque 16) que acelera la generación. La cuantización principal es IQ4_XS en el layout de tensores de bartowski, con una importance matrix propia calculada sobre 254.805 tokens de texto público de calibración. El repositorio ocupa 16,8 GB y el archivo principal pesa 15,48 GB.

Es relevante ahora porque documenta de forma inusualmente detallada el proceso de cuantización (comparación de nueve candidatos, regla de selección fijada de antemano, test final único) y porque publica métricas de rechazo con intervalos de confianza Wilson al 95 %, algo poco habitual en modelos comunitarios. La licencia es `swift-open-license-1.0` (etiquetada como `other`), y el modelo base pertenece a la familia Qwen3.8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.8, con capas DeltaNet (atención lineal) y atención clásica; pesos en GGUF |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ4_XS (layout de tensores de bartowski: K/V de atención a 8 bits, salida de atención a 6 bits, más bits para la salida DeltaNet, alpha/beta DeltaNet en F32, qkv DeltaNet a 4 bits); cabeza DSpine en Q4_K_M |
| Idiomas soportados | No disponible oficialmente; el autor evalúa con prompts en inglés y alemán |
| Licencia | swift-open-license-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de Qwen3.8 con capas DeltaNet (atención lineal) intercaladas con atención clásica, tal como se deduce de la descripción del layout de cuantización (atención K/V, salida de atención, qkv DeltaNet, ssm_out, alpha/beta DeltaNet). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

Sobre esa base, el autor aplica una ablación de la dirección de rechazo: extrae activaciones del residual tras cada capa en el último token de la plantilla de chat para 178 prompts dañinos y 178 inofensivos (inglés y alemán), calcula la dirección de rechazo por capa como media(dañinos) − media(inofensivos), selecciona la capa 45 (mejor separación y dirección consistente entre idiomas) y elimina esa dirección desde el bloque 30 en adelante en todas las matrices que escriben en el residual (salida de atención, salida DeltaNet, proyección down del FFN y embedding de tokens) en BF16 mediante W′ = W − d(dᵀW). Después calcula una importance matrix propia (254.805 tokens de texto público) y cuantiza a IQ4_XS en el layout de bartowski. El autor probó dos veces "curar" la cuantización entrenando solo las escalas de superbloque fp16 contra el profesor de 8 bits de Kate, pero ambas empeoraron el texto fuera del corpus de entrenamiento (hasta +13 % de divergencia KL en documentación de Kubernetes en alemán), por lo que el modelo se distribuye sin curar.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y alemán (los dos idiomas usados en la evaluación del autor).
- Razonamiento y código: el autor incluye código, matemáticas y trazas de agente entre los ocho tipos de texto de su base de medición.
- Decodificación especulativa mediante la cabeza DSpine de bloque 16 incluida en el repositorio, que acelera la inferencia con llama.cpp.
- Ejecución como agente local con acceso al sistema: el caso de uso declarado es un agente que gestiona su propia máquina las 24 horas.
- Reducción drástica del exceso de rechazo: en OR-Bench hard pasa de 88/100 rechazos (Katy) a 1/100 (Kate); en XSTest, de 15/250 a 4/250.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Agente local de administración de sistema: el modelo puede gestionar tareas de mantenimiento, scripts y operaciones sobre la propia máquina sin rechazar trabajo legítimo de sistema, que es exactamente el escenario para el que el autor eliminó la dirección de rechazo.
- Asistente conversacional en alemán e inglés: el autor calibra y evalúa con ocho tipos de texto en ambos idiomas (prosa, documentación técnica, diálogo, código, matemáticas, trazas de agente), lo que respalda su uso en atención al usuario en esos dos idiomas.
- Generación y revisión de código en local: al ejecutarse con llama.cpp en una GPU de 32 GB, encaja en flujos de trabajo de desarrollo sin depender de APIs externas.
- Documentación técnica y soporte interno: el autor mide explícitamente la divergencia en documentación de Kubernetes en alemán, lo que indica que el modelo se ha probado en ese dominio.
- Despliegue en una sola GPU de consumo alta o profesional: con 15,48 GB en IQ4_XS, cabe en tarjetas de 24 GB o más, lo que permite servir el modelo en estaciones de trabajo sin clúster.
- Aceleración de inferencia con decodificación especulativa: la cabeza DSpine Q4_K_M incluida (1,17 GiB) permite usar decodificación especulativa en llama.cpp para reducir la latencia en generación interactiva.
- Investigación sobre alineación y rechazo: el repositorio documenta el método de ablación, las métricas de rechazo con intervalos de confianza y los intentos fallidos de curación de la cuantización, lo que lo convierte en material útil para estudiar el efecto de eliminar la dirección de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica métricas de rechazo sobre prompts retenidos, medidas en este archivo con recuento por lista de frases en los primeros 160 caracteres (Wilson 95 %):

| Conjunto | Katy | Kate (este archivo) |
|---|---|---|
| Dañinos, inglés (100) | 98/100 (93,0–99,4 %) | 70/100 (60,4–78,1 %) |
| Dañinos, alemán (34) | 22/34 (47,9–78,5 %) | 8/34 (12,4–40,0 %) |
| Inofensivos, inglés (100) | 3/100 (1,0–8,5 %) | 2/100 (0,6–7,0 %) |
| Inofensivos, alemán (34) | 0/34 (0–10,2 %) | 0/34 (0–10,2 %) |
| XSTest, seguros pero suenan peligrosos (250) | 15/250 (3,7–9,7 %) | 4/250 (0,6–4,0 %) |
| OR-Bench hard (100) | 88/100 (80,2–93,0 %) | 1/100 (0,2–5,4 %) |
| Límite, alemán (40) | 3/40 (2,6–19,9 %) | 0/40 (0–8,8 %) |

El autor también documenta la divergencia KL de los dos intentos de curación de la cuantización frente al BF16 de Kate:

| Intento | Validación (corpus propio) | Referencia Python | Wikipedia alemana | Docs Kubernetes alemana |
|---|---|---|---|---|
| Run 1, corpus público | −32 % | −4 % | +4 % | +7 % |
| Run 2, corpus mixto, regla fijada de antemano | −25 % | −2 % (dentro del error) | +11 % | +13 % |

## Requisitos de hardware

- VRAM estimada: 15,48 GB para el archivo IQ4_XS principal, más 1,17 GiB para la cabeza DSpine Q4_K_M si se usa decodificación especulativa; en total, aproximadamente 17 GB de pesos.
- GPU recomendadas: el autor lo ejecuta en una RTX PRO 4500 Blackwell de 32 GB; cualquier GPU con 24 GB o más (RTX 3090, RTX 4090, A100 40 GB, H100) debería poder alojarlo.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB (RTX 3090/4090) con margen para contexto y caché KV; en tarjetas de 16 GB no cabe sin offloading a CPU.
- Opciones de despliegue: llama.cpp (motor de referencia del autor y de la cuantización); el autor usa su fork FLE (FastLocalExperts) v1.3.0, línea `dense`, y FLE Link 0.1.16 o superior para instalación y benchmark (`flelink run kate-27b-dspine`, `flelink bench --task pagoda`). Otros motores compatibles con GGUF (Ollama, vLLM con soporte GGUF) no están confirmados en la información disponible.
- Latencia y throughput: no disponibles; el autor menciona la decodificación especulativa con DSpine como mecanismo de aceleración, pero no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kate-Qwen-27B (este) | 27,3 B | No disponible | swift-open-license-1.0 | GGUF IQ4_XS | Abliterated, con cabeza DSpine; rechazo reducido drásticamente |
| Katy-27B-GGUF | 27,3 B (misma base) | No disponible | No disponible | GGUF | Versión previa del mismo autor sin ablación; rechaza 98/100 prompts dañinos en inglés |
| ukisai/Swift-1.5-Qwen3.8-27b | 27,3 B | No disponible | No disponible | No disponible | Modelo base sin cuantizar ni abliterar |
| tencent/Qwen3.8-27B-DSpine-b16 | No disponible | No disponible | Apache-2.0 | Pesos originales y GGUF Q4_K_M | Cabeza de decodificación especulativa, no un modelo de chat completo |

## Limitaciones y advertencias

- El modelo ya no rechaza solicitudes que el modelo original rechazaba por motivos de seguridad; el propio autor advierte que no debe ponerse delante de personas que esperan un asistente alineado con seguridad.
- Aun así, sigue rechazando siete de cada diez prompts claramente dañinos en inglés (70/100), por lo que la ablación es parcial, no total.
- La cuantización no está curada: los intentos de curación empeoraron la divergencia en textos fuera del corpus de entrenamiento (hasta +13 % en documentación de Kubernetes en alemán), así que la calidad en dominios no representados en la calibración puede degradarse.
- Las métricas de rechazo se miden con una lista de frases en los primeros 160 caracteres, un método que el propio autor califica de tosco.
- El modelo base es de la familia Qwen3.8, pero no se documentan sesgos específicos, idiomas soportados oficialmente ni longitud de contexto; la evaluación se limita a inglés y alemán.
- La licencia `swift-open-license-1.0` está etiquetada como `other`; conviene revisar el archivo LICENSE antes de cualquier uso comercial, ya que no se detallan sus términos en la información disponible.
- El autor lo describe como un proyecto privado publicado tal cual, sin garantías de soporte ni mantenimiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sirfyyn/Kate-Qwen-27B-GGUF-SpedUp-Abliterated
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Cuantización previa (Katy): https://huggingface.co/sirfyyn/Katy-27B-GGUF
- Cabeza DSpine original: https://huggingface.co/tencent/Qwen3.8-27B-DSpine-b16
- Repositorio FLE (FastLocalExperts): https://github.com/sirfyyn/FastLocalExperts
- FLE Link: https://flelink.run
- Página del modelo en FLE Link: https://flelink.run/models/kate-27b.html
- Paper del método de ablación: https://arxiv.org/abs/2406.11717
