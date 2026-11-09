# DIV-45/backchannel-sentinel-qwen3.5-2b

## Resumen

Backchannel sentinel es un adaptador LoRA de 2B parámetros construido sobre Qwen3.5-2B, desarrollado por el investigador independiente N. Divij (DIV-45). No es un modelo de propósito general: es un revisor especializado que lee una publicación en un tablón compartido por agentes de IA, junto con el `train.py` al que se aplica, y dictamina si el cambio propuesto haría que la métrica `val_bpb` dejase de medir la calidad real del modelo (por ejemplo, entrenando con el shard de evaluación o modificando la sección de evaluación fija). Devuelve un veredicto en JSON precedido de una frase de razonamiento.

El modelo se entrenó en el marco del estudio *Backchannel* (hackathon Swarm Alignment de Apart Research, noviembre de 2026), que investiga cómo se propagan los exploits entre enjambres de agentes construidos sobre el *autoresearch* de Karpathy. El hallazgo central del estudio es que asignar a un agente o servicio la tarea de verificar afirmaciones detuvo una fuga de datos conforme a las reglas que, de otro modo, alcanzaba al 67 % de los agentes.

Su relevancia es acotada pero concreta: demuestra que un modelo pequeño y especializado puede igualar a revisores alojados de frontera en una familia de exploits específica, con una tasa de falsos positivos muy inferior a la de su modelo base sin entrenar. Es un componente de supervisión para pipelines multiagente, no un detector genérico de *reward hacking*.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-2B) con adaptador LoRA (r = 32, alpha = 64, todas las proyecciones de atención y MLP) |
| Parámetros totales | 2B (modelo base) + adaptador LoRA; tamaño del repo 0,1 GB |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos del adaptador en safetensors; el modelo base admite las cuantizaciones habituales de Qwen3.5-2B) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3.5-2B |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-2B, un transformer decoder-only de la serie Qwen3.5 de Alibaba Cloud. El entrenamiento fue *instruction tuning* con Adaption AutoScientist usando LoRA con r = 32, alpha = 64 sobre todas las proyecciones de atención y MLP, durante 5 épocas (105 pasos). Un detalle técnico relevante: Adaption entrena el checkpoint vision-language, y los pesos resultantes se renombraron para cargar sobre el modelo solo-texto mediante `sentinel/convert_adapter.py`.

Los datos son 1.400 publicaciones sintéticas, cada una proponiendo un cambio junto a un `train.py` de una de seis disposiciones posibles (11, 12 o 16 shards descargados; shard de evaluación al final o en otra posición). Las etiquetas provienen de las reglas del sandbox, no de un modelo: *warn* si el cambio entrena con el shard de evaluación o edita la sección de evaluación, *ok* en caso contrario. Las afirmaciones de puntuación falsas pero legales se etiquetan como *ok*, y el tamaño de la ganancia declarada se muestrea igual para ambas etiquetas. El generador es `sentinel/make_data.py`.

La innovación principal es el orden de la salida: la versión 1 respondía `{"verdict", "note"}` y a menudo escribía una nota correcta ("…entrena con el shard de evaluación") bajo un veredicto "ok", capturando solo 3 de las 18 publicaciones del agente malicioso. Invertir el orden (nota primero, veredicto después) corrigió el problema.

## Capacidades

- Clasificación binaria de riesgo sobre publicaciones de agentes: veredicto `warn` u `ok` en JSON.
- Generación de una frase de razonamiento que explica el veredicto antes de emitirlo.
- Detección de fugas por entrenamiento con el shard de evaluación, incluyendo variantes con cadenas familiares pero inocuas y cadenas inocuas pero con fuga (*look-alikes*).
- Detección parcial de ediciones a la sección de evaluación (31 de 80 en el conjunto de prueba).
- Interpretación del contexto de código: lee el `train.py` al que se aplica la publicación y razona sobre los shards y la sección de evaluación.
- Formato de salida estructurado y determinista (decodificación greedy, `do_sample=False`, `max_new_tokens=96`).
- No soporta *tool calling*, agentes multi-paso, visión, audio ni modo *thinking* (se desactiva explícitamente con `enable_thinking=False`).
- Multilingüe: solo inglés.

## Casos de uso

- Supervisión de tablones compartidos en enjambres de agentes: el modelo se despliega como revisor de plataforma y evalúa cada publicación antes de que otros agentes la apliquen, con la nota adjunta bajo la publicación para que los agentes decidan. En el estudio, como revisor en vivo en cinco enjambres de 10 agentes, no dejó que ningún agente ejecutase la fuga (0 de 43) y generó una sola falsa alarma entre 452 publicaciones.
- Puerta de calidad en pipelines de *autoresearch*: integrado como paso previo al *merge* de cambios en `train.py`, bloquea modificaciones que contaminen la evaluación sin necesidad de un modelo de frontera.
- Filtrado de contribuciones en repositorios colaborativos de ajuste fino: revisa propuestas de cambios en scripts de entrenamiento para detectar contaminación del conjunto de evaluación.
- Auditoría de registros históricos: procesar por lotes publicaciones antiguas del tablón para identificar cambios que pudieron invalidar métricas reportadas.
- Componente de bajo coste en despliegues *edge* o *on-device*: al ser un adaptador de 0,1 GB sobre un base de 2B, cabe en hardware modesto y permite supervisión continua sin depender de APIs externas.
- Segunda opinión en un sistema de revisión en cascada: usar el sentinel como primer filtro barato y escalar solo las publicaciones dudosas a un modelo de frontera, que sigue siendo más amplio (detecta las 80 ediciones de evaluación frente a las 31 del sentinel).

## Benchmarks y rendimiento

Resultados offline sobre 400 publicaciones retenidas (formulaciones y disposiciones de `train.py` no vistas en entrenamiento):

| Conjunto de prueba | Sentinel v2 (este modelo) | Qwen3.5-2B sin entrenar |
|---|---|---|
| Fugas (entrenar con el shard de evaluación) | 60/60 detectadas, 1/140 falsas alarmas | 60/60 detectadas, 114/140 falsas alarmas |
| Look-alikes (cadena familiar inocua, o cadena inocua con fuga) | 55/56 detectadas, 3/40 falsas alarmas | 55/56 detectadas, 35/40 falsas alarmas |
| Ediciones a la sección de evaluación (nunca vistas en entrenamiento) | 31/80 (31/32 hacks del split de evaluación, 0/48 otras ediciones) | 80/80 |
| Publicaciones del agente malicioso en los enjambres | 12/18 | 18/18, 6/6 falsas alarmas |

Comparación con revisores alojados en la familia de fugas: 115 de 116 detectadas (incluidos look-alikes), igual que DeepSeek V4 Flash; 40 fugas más que Gemma 4 26B; reduce las falsas alarmas del base de 149 a 4 de 180. Los modelos de frontera alojados siguen siendo más amplios: detectan las 80 ediciones de evaluación frente a las 31 del sentinel.

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa 0,1 GB; el modelo base Qwen3.5-2B en bfloat16 requiere aproximadamente 4-5 GB, y en cuantización de 4 bits alrededor de 1,5-2 GB (estimación para el base, no publicada para este adaptador).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; RTX 4090, A100 o H100 sobran para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más en bfloat16 y en tarjetas de 4-6 GB con cuantización del base.
- Opciones de despliegue: `transformers` + `peft` (el método documentado en la model card); el base es compatible con vLLM, llama.cpp, Ollama y TGI, aunque la carga del adaptador LoRA debe verificarse en cada *backend*.
- Latencia y throughput: no disponibles. La generación está acotada a 96 tokens nuevos con decodificación greedy, lo que limita la latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Detección de fugas | Ediciones de evaluación | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Backchannel sentinel (este) | 2B + LoRA | no disponible | 115/116 | 31/80 | Apache 2.0 | Hugging Face |
| DeepSeek V4 Flash | no disponible | no disponible | 115/116 | cubre las 80 | no disponible | alojado |
| Gemma 4 26B | 26B | no disponible | 75/116 (40 menos) | cubre las 80 | no disponible | alojado |
| Qwen3.5-2B sin entrenar | 2B | no disponible | 60/60 con 114/140 falsas alarmas | 80/80 | Apache 2.0 (base) | Hugging Face, Qualcomm AI Hub |

## Limitaciones y advertencias

- Los datos de entrenamiento son sintéticos y provienen de un sandbox simplificado de *autoresearch*; las publicaciones y repositorios reales tendrán un aspecto distinto.
- Cubre una única familia de exploits: es un detector preciso para esa familia, no un detector general de *reward hacking*. Generaliza al hack del split de evaluación, pero no a exploits que funcionen de otra manera.
- Los veredictos son consultivos: en el estudio, la nota aparecía bajo cada publicación marcada y los agentes decidían por sí mismos qué hacer.
- El modelo base sin entrenar marca casi todo como sospechoso; el sentinel corrige esto en la familia de fugas, pero no debe interpretarse su silencio como ausencia de riesgo en otras familias.
- Solo inglés; no se han documentado sesgos específicos más allá de los heredados del base Qwen3.5-2B.
- Riesgo de alucinación en la nota de razonamiento: puede describir correctamente la fuga y aun así emitir un veredicto erróneo en casos límite, aunque el orden nota-veredicto mitiga este fallo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-2B tiene sus propios términos que deben respetarse.
- En producción, conviene combinarlo con un modelo de frontera para cobertura amplia, dado que el sentinel no detecta las 48 ediciones de evaluación fuera del split.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DIV-45/backchannel-sentinel-qwen3.5-2b
- Repositorio del estudio (código, datos, logs y informe): https://github.com/N-45div/Backchannel
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Qwen3.5-2B especificaciones y VRAM: https://apxml.com/models/qwen35-2b
