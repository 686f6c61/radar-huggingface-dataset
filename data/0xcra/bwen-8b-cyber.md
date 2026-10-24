# 0xCra/Bwen-8B-Cyber

## Resumen

Bwen-8B-Cyber es un ajuste fino (SFT) orientado a ciberseguridad del modelo `allenai/Bwen-8B`, la retroadaptación byte-level de Qwen3-8B-Base desarrollada por AI2 dentro del proyecto Bolmo. Se trata, por tanto, de un modelo de lenguaje que opera sobre bytes crudos en lugar de subpalabras: el tokenizador no aplica BPE y `max_new_tokens` cuenta bytes, no tokens. Esta decisión de diseño es especialmente relevante en artefactos de seguridad (volcados hex de pcap, listados de paquetes, shellcode, payloads ofuscados), donde los tokenizadores BPE rinden peor por la fragmentación de secuencias binarias y hexadecimales.

El modelo lo publica el usuario 0xCra y cubre cuatro frentes: red team, blue team, CTF y forense de red. Para ello se aplicó un ajuste parametral eficiente de 3000 pasos sobre un dataset propio de 33.050 filas, congelando el transformer global de 36 bloques de Qwen3 y entrenando únicamente un adaptador LoRA (r=32, α=64) sobre el encoder/decoder local de bytes, más el embedding de bytes y el predictor de fronteras (~47,5 M de parámetros, el 0,57 % del total). Con 8,31 mil millones de parámetros y licencia Apache 2.0, el interés actual reside en que es uno de los pocos ejemplos públicos de ajuste de dominio sobre una arquitectura byte-level, con una ganancia medida de +45 puntos porcentuales sobre el modelo base en CyberMetric-500 cuando se usa su plantilla de prompt entrenada.

La contrapartida es que se trata de un modelo muy especializado en formato: fuera de la plantilla `User:/Assistant:` su rendimiento cae por debajo del base. Además, el ajuste solo cubrió aproximadamente el 9 % de una época con un presupuesto de cómputo de unos 30 dólares, por lo que debe entenderse como una prueba de concepto sólida más que como un sistema listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida byte-level estilo Bolmo/BLT: encoder-decodificador local de bytes con mLSTM + transformer global de 36 bloques de Qwen3 + predictor de fronteras (boundary predictor) |
| Parámetros totales | 8.313.169.056 (8,31 B) |
| Longitud de contexto | No disponible en la información proporcionada; el ajuste se entrenó con secuencias de hasta 16.384 bytes |
| Tipos de cuantización | No disponible; solo se publican pesos en bf16 (no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (modelo fusionado completo en bf16, ~16,6 GB) + adaptador PEFT LoRA y embedding/predictor entrenados en `adapter/` |
| Modelo base | `allenai/Bwen-8B` (retrofit byte-level de Qwen3-8B-Base) |
| Vocabulario de salida | 520 símbolos (256 bytes + 256 byte+frontera + especiales) |
| Parámetros entrenables | ~47,5 M (0,57 %): LoRA + embedding de bytes + predictor de fronteras |
| Tamaño del repositorio | 50,1 GB (incluye `training/` con scripts y artefactos) |
| Requiere código remoto | Sí (`trust_remote_code=True`) |
| Fecha de publicación | 24 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del proyecto Bolmo: un modelo byte-level construido sobre un transformer preentrenado basado en subpalabras. El transformer global (36 bloques de Qwen3, más la normalización final, el `lm_head` y la tabla de embeddings de sufijos de subpalabra de 622 M de parámetros) permanece completamente congelado durante el ajuste. La parte entrenable es el codificador/decodificador local de bytes, que agrupa bytes en parches mediante un predictor de fronteras y utiliza capas mLSTM (proyecciones q/k/v/gates/out_proj) y MLP por parche. Sobre esas proyecciones lineales se aplicó LoRA con r=32 y α=64; además se entrenaron por completo el embedding de bytes y el predictor de fronteras (~15 M más LoRA, hasta ~47,5 M entrenables).

La función de pérdida combina entropía cruzada sobre los bytes del turno del asistente con objetivos fusionados con el símbolo de frontera, más un término BCE de fronteras ponderado a 0,1: `L = CE + 0.1 · BCE_boundary`. Un detalle técnico relevante es la corrección de convención del predictor: el predictor preentrenado usa una convención de *finales* (`pred[j] ≈ patch_start[j+1]`, F1 0,985), no de inicios. Antes de corregirlo, el entrenamiento degradaba la CE de evaluación (0,276 → 0,46); tras alinear el enmascaramiento de pooling con la máscara real de finales, la CE mejoró de forma monótona. El entrenamiento consistió en 3000 pasos (micro-lote 1, acumulación 2), LR 5e-5 con decaimiento coseno, secuencias de hasta 16.384 bytes, shuffle global y una única A100-80GB durante unos 57 minutos.

Los datos provienen de `0xCra/cyber-byte-sft`: 33.050 filas (~161 MB de bytes, 3,86 bytes por parche), con una mezcla sesgada hacia ataque. El desglose es 45,2 % de cyberstrike-sft-120k (red team/ofensiva), 24,0 % de Trendyol v2 + Fenrir v2.1 (blue team/defensa), 13,4 % de threat intelligence (CTI), 10,0 % de pcap auto-construido con tshark y dapt-2020 (forense de red) y 7,4 % de CTF-Instruct filtrado por palabras clave de ciberseguridad. El pipeline incluyó deduplicación exacta y aproximada, filtros de calidad, reparación de `\n` literales y la citada construcción programática de respuestas para el tramo de pcap y Wireshark. Las fuentes son Apache 2.0 salvo la de CTI, que es CC-BY-NC-SA. No se documenta RLHF ni DPO: es SFT supervisado puro.

## Capacidades

- Generación de texto técnico en inglés sobre seguridad ofensiva y defensiva: explicación de técnicas, procedimientos y comandos.
- Razonamiento sobre artefactos byte-level: volcados hex de pcap, listados de paquetes, shellcode y payloads ofuscados, donde el tokenizador BPE pierde información.
- Forense de red: interpretación de capturas, tablas de conversación, análisis de streams TCP, detección de escaneos de puertos y de patrones de beaconing, y generación de filtros de visualización de Wireshark.
- Red team: construcción y explicación de técnicas de ataque, con contenido ofensivo explícito en el dataset de entrenamiento.
- Blue team: análisis de alertas, razonamiento sobre detección y respuesta, y apoyo a tareas de threat intelligence.
- Resolución y explicación de retos CTF.
- Respuesta a preguntas de opción múltiple sobre conocimiento de ciberseguridad, con buen rendimiento únicamente dentro de su plantilla `User:/Assistant:`.
- Capacidad multilingüe: limitada al inglés; el modelo base es English-only.
- Tool calling / function calling: no documentado en la información disponible.
- Modo agente y razonamiento multi-paso: no documentado ni evaluado (el autor indica que no se ejecutaron benchmarks agénticos tipo NYU CTF o InterCode).
- Visión y audio: no soportados.

## Casos de uso

- Triaje de capturas pcap en un SOC: el modelo puede recibir un volcado hex de tshark o una tabla de conversaciones y producir un resumen de la actividad, identificar flujos sospechosos y proponer filtros de visualización de Wireshark. Es adecuado porque su tokenizador opera sobre bytes y no fragmenta las secuencias hexadecimales.
- Detección de reconocimiento y beaconing: análisis de patrones de escaneo de puertos y de tráfico periódico hacia dominios externos, con explicación del razonamiento y de las contramedidas. El tramo de pcap auto-construido del dataset cubre explícitamente estos escenarios con respuestas verificadas programáticamente.
- Apoyo a analistas de blue team: convertir alertas y extractos de logs en hipótesis de investigación, pasos de contención y criterios de escalado, usando la porción defensiva del dataset (Trendyol v2 + Fenrir v2.1).
- Formación y entrenamiento interno: generación de explicaciones paso a paso de técnicas de ataque y defensa para programas de concienciación o laboratorios de CTF, con la advertencia de que el modelo reproduce contenido ofensivo sin filtro de seguridad.
- Análisis de payloads ofuscados: interpretación de shellcode, cadenas codificadas y artefactos binarios presentados en hexadecimal, un caso donde los modelos basados en BPE suelen degradarse por la tokenización de bytes no imprimibles.
- Pentesting autorizado y red teaming: borradores de procedimientos y de payloads de prueba en entornos con alcance definido, siempre bajo revisión humana y con las restricciones legales correspondientes.
- Evaluación interna de conocimiento en ciberseguridad: uso del modelo como sujeto de prueba en baterías MCQ tipo CyberMetric, aprovechando su plantilla entrenada para obtener una señal comparable entre versiones.

## Benchmarks y rendimiento

Evaluación sobre CyberMetric-500 (500 preguntas de opción múltiple, puntuación por log-probabilidad de la letra a nivel de byte):

| Modelo | Formato plano | Plantilla `User:/Assistant:` |
|---|---|---|
| Bwen-8B (base) | 0,7860 | 0,3860 |
| Bwen-8B-Cyber | 0,6240 | **0,8360** |

Prueba de McNemar (pareada, exacta): en formato plantilla, 14 aciertos exclusivos del base frente a 239 exclusivos del SFT (p < 0,0001); en formato plano, 81 frente a 0 (p < 0,0001). En su formato entrenado, el modelo gana +45 puntos porcentuales sobre el base y +5 puntos sobre el mejor formato del base.

Evolución del entrenamiento (evaluación retenida, entropía cruzada en bytes sobre los tramos del asistente):

| Paso | ce_oracle | ce_pred | BCE de fronteras |
|---|---|---|---|
| 0 (base) | 0,2773 | 0,2760 | 0,0198 |
| 3000 | **0,2585** | **0,2665** | **0,0169** |

Mejoras relativas: −6,8 %, −3,4 % y −14,6 % respectivamente. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks agénticos de CTF (NYU CTF, InterCode) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: ~16,6 GB de pesos más caché KV y overhead de ejecución; presupuesto realista de 18-22 GB para contextos moderados.
- GPU recomendadas: A100-80GB (usada para el entrenamiento LoRA, ~57 minutos), H100, L40S o A10G de 24 GB para inferencia.
- Cabe en GPU de consumo: sí en RTX 4090 y RTX 3090 (24 GB) en bf16, con margen ajustado; no cabe en tarjetas de 16 GB sin cuantización, y no se publican pesos cuantizados.
- Despliegue: `transformers` con `trust_remote_code=True` es la vía documentada. No hay GGUF publicado, por lo que llama.cpp y Ollama no están soportados de forma directa; el soporte en vLLM o TGI no está confirmado y depende de que esas herramientas acepten la implementación byte-level personalizada.
- Almacenamiento: el repositorio ocupa 50,1 GB, aunque solo ~16,6 GB corresponden al modelo fusionado; conviene descargar selectivamente `model.safetensors` o `adapter/`.
- Latencia y throughput: no disponibles. Como referencia de coste, la media del dataset es de 3,86 bytes por parche, de modo que un presupuesto de `max_new_tokens` en bytes equivale aproximadamente a un cuarto de esa cifra en pasos de decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Resultado CyberMetric-500 (plantilla) |
|---|---|---|---|---|---|
| Bwen-8B-Cyber | 8,31 B | No disponible (entrenado a 16.384 bytes) | Byte-level + SFT de ciberseguridad | Apache 2.0 | 0,8360 |
| allenai/Bwen-8B (base) | 8,31 B | No disponible | Byte-level generalista | Apache 2.0 | 0,3860 |
| Qwen3-8B-Base | ~8 B | No disponible en la información proporcionada | Transformer denso con BPE | No disponible en la información proporcionada | No evaluado en esta ficha |

No se han identificado en la información proporcionada otros modelos de ciberseguridad byte-level directamente comparables; las alternativas del mismo tamaño (Qwen3-8B, Llama-3.1-8B) usan tokenización BPE y no disponen de resultados en esta misma batería, por lo que la comparación numérica solo es válida frente al modelo base.

## Limitaciones y advertencias

- Idioma: el modelo base es exclusivamente inglés y el ajuste no añade idiomas; no se debe esperar un rendimiento aceptable en castellano.
- Especialización de formato: fuera de la plantilla `User:/Assistant:` el modelo rinde peor que el base (0,6240 frente a 0,7860 en formato plano). Cualquier integración en producción debe respetar esa plantilla.
- Ausencia de post-entrenamiento de seguridad: el base es un modelo de lenguaje sin alineamiento y el SFT no incorpora filtrado; el dataset contiene contenido ofensivo de red team. Uso previsto: educativo, CTF y pentesting autorizado.
- Riesgo de alucinación: en un dominio donde los detalles técnicos incorrectos (puertos, sintaxis de filtros, rutas de registro) tienen consecuencias operativas, toda salida debe validarse. No se han publicado métricas de fidelidad factual.
- Sesgo de dominio: la mezcla está sesgada hacia ataque (45,2 % de contenido ofensivo) frente al 24,0 % defensivo, lo que puede desequilibrar las recomendaciones hacia la explotación.
- Cobertura de entrenamiento reducida: solo 3000 pasos sobre 33.050 filas (~9 % de una época) con un presupuesto de ~30 dólares; el propio autor señala que más pasos y datos probablemente mejorarían el resultado.
- Evaluación limitada: solo MCQ de conocimiento; no hay medidas de rendimiento agéntico, de ejecución real de herramientas ni de tareas multi-paso.
- Fragilidad de la métrica MCQ: con precisiones del 60-70 % en 500 preguntas, el error estándar es de ±2 puntos porcentuales, y el argmax sobre el vocabulario completo casi nunca recae en una letra desnuda (masa de probabilidad de la letra entre 0,7 % y 17,5 %), por lo que solo son fiables las comparaciones pareadas dentro del mismo formato.
- Licencia de los datos: los pesos son Apache 2.0, pero un 13,4 % del corpus de entrenamiento (CTI) es CC-BY-NC-SA. Conviene revisar con asesoría legal el uso comercial antes de desplegar el modelo en un producto.
- Ejecución de código remoto: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; auditar la implementación antes de usarla en entornos sensibles.
- Sin cuantizaciones oficiales: no hay GGUF ni AWQ/GPTQ publicados, lo que limita el despliegue en hardware de gama media.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xCra/Bwen-8B-Cyber
- Modelo base: https://huggingface.co/allenai/Bwen-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/0xCra/cyber-byte-sft
- Panel de seguimiento del entrenamiento: https://huggingface.co/spaces/0xCra/bwen-8b-cyber-sft-trackio
- Paper de Bolmo (arquitectura y byteificación): https://arxiv.org/abs/2512.15586
- Paper de BLT (Byte Latent Transformer): https://arxiv.org/abs/2412.09871
- Paper de H-Net: https://arxiv.org/abs/2507.07955
- Referencia adicional citada: https://arxiv.org/abs/2502.08606
- Referencia adicional citada: https://arxiv.org/abs/2402.07688

Nota: la búsqueda web realizada no devolvió resultados relacionados con el modelo (los enlaces obtenidos correspondían a hilos de foros sobre cosmética), por lo que no se incluyen como fuentes. No se ha localizado repositorio de código independiente ni demo pública más allá de los enlaces anteriores.
