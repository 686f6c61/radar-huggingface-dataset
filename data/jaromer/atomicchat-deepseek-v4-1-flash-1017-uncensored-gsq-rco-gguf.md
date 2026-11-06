# jaromer/AtomicChat-DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF

## Resumen

AtomicChat-DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF es una cuantización GGUF derivada de DeepSeek-V4.1-Flash-1017, un modelo de lenguaje de tipo mezcla de expertos (MoE) con 763.000 millones de parámetros totales y 384 expertos, desarrollado originalmente por DeepSeek. La versión que nos ocupa la publica el usuario `jaromer` a partir del trabajo de cuantización de ISTA-DASLab y de la edición de "abliteración" (eliminación de la dirección de rechazo) de AtomicChat. El resultado es un modelo sin rechazos (uncensored) que conserva la precisión de la tarea del cuantizado original.

El interés técnico reside en cómo se aplica la edición: solo se sustituyen los tensores densos que escriben en el residual (salida de atención `attn_output_b`, proyección descendente del experto compartido `ffn_down_shexp` y proyección de valor del Engram `engram_wkv`), mientras que los 384 expertos enrutados de GSQ se mantienen byte a byte. Según la model card, esto permite eliminar los rechazos con una divergencia KL de aproximadamente 0,02 respecto al cuantizado original y sin pérdida medible en GPQA-Diamond.

La relevancia práctica es que, gracias a la arquitectura Strata (backbone en memoria del sistema y tabla Engram transmitida desde SSD), un modelo de 763.000 millones de parámetros puede ejecutarse en una GPU de 12 GB de VRAM. El repositorio ocupa 414,2 GB y la licencia es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con Engram (tabla de búsqueda externa); 384 expertos enrutados |
| Parámetros totales | 551.880.949.208 (dato de safetensors); la model card cita 763B |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF: IQ2_XXS (2,0 bpw), IQ2_XS (2,25 bpw), IQ1_M (1,75 bpw) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (shards), más archivo Engram separado de 110 GB |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4.1-Flash-1017, un transformer de mezcla de expertos con 384 expertos enrutados y una innovación denominada Engram: una tabla de búsqueda de 110 GB que se consulta mediante una proyección de valor (`engram_wkv`) y que se transmite desde SSD en tiempo de inferencia. La cuantización GSQ-RCO de ISTA-DASLab aplica un redondeo de baja precisión aprendido sobre los expertos enrutados, lo que permite comprimir el modelo hasta 1,75-2,25 bits por peso manteniendo la precisión de la tarea.

Sobre esa base, AtomicChat aplica una edición de abliteración de una sola dirección (fuerza 2,0) que se incorpora a los pesos en precisión completa y luego se cuantiza al tipo por tensor exacto de ISTA. Los expertos enrutados no se tocan. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de alineación (RLHF/DPO) del modelo original.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento de varios pasos con modo "thinking" (la model card menciona "thinking high" y "reasoning effort 50").
- Razonamiento matemático y científico (evaluado en AIME25 y GPQA-Diamond).
- Conocimiento general y respuesta a preguntas (evaluado en MMLU).
- Operación sin rechazos: la edición elimina la dirección de rechazo en todos los temas.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Visión y audio: no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un LLM sin rechazos manteniendo la precisión de la tarea, comparando directamente con el cuantizado original en las mismas condiciones.
- Evaluación de técnicas de abliteración: sirve como referencia para medir el impacto de eliminar la dirección de rechazo en modelos MoE de gran escala, con métricas de KL y benchmarks publicados.
- Despliegue local en hardware de consumo: con Strata, un modelo de 763B puede ejecutarse en una GPU de 12 GB, lo que permite experimentar con modelos de gran escala en estaciones de trabajo convencionales.
- Generación de texto creativo sin restricciones temáticas: para aplicaciones de ficción, guiones o contenido donde los filtros de rechazo resultan un obstáculo.
- Análisis de contenido sensible en entornos controlados: investigación de sesgos, toxicidad y comportamiento del modelo ante prompts adversarios, usando JailbreakBench y XSTest como referencia.
- Estudio de arquitecturas con memoria externa: la tabla Engram y su transmisión desde SSD ofrecen un caso práctico para investigar el equilibrio entre VRAM, ancho de banda de almacenamiento y latencia.
- Pruebas de robustez de clasificadores de rechazo: la model card advierte que el clasificador lee el inicio de la respuesta, por lo que el modelo es útil para auditar las limitaciones de dichos clasificadores.

## Benchmarks y rendimiento

Datos de la model card (comparación entre el cuantizado original GSQ-RCO y esta versión):

| Benchmark | Original GSQ-RCO | Uncensored (esta versión) |
|---|---|---|
| GPQA-Diamond (198 preguntas) | 83,3% | 83,3% |
| AIME25 (30 preguntas) | 76,7% | 80,0% |
| MMLU (500 preguntas, IQ2_XXS) | 82,8% | no disponible |
| MMLU (500 preguntas, IQ2_XS) | 81,6% | no disponible |
| MMLU (500 preguntas, IQ1_M) | 80,6% | no disponible |

Métricas de la edición por nivel de cuantización:

| Nivel | bpw | Tamaño total | JailbreakBench (EN) | XSTest (rechazos seguros) | Thinking high (30) | KL respecto al original |
|---|---|---|---|---|---|---|
| IQ2_XXS | 2,0 | 249 GB | 85,2% → 0,0% | 7,6% → 0,0% | 27/30 → 0/30 | 0,0225 |
| IQ2_XS | 2,25 | 266 GB | 86,4% → 0,0% | 4,0% → 0,4% | 27/30 → 2/30 | 0,0272 |
| IQ1_M | 1,75 | 231 GB | 88,9% → 0,0% | 4,8% → 0,0% | 27/30 → 1/30 | 0,0207 |

## Requisitos de hardware

- VRAM: la model card indica que funciona en una sola GPU de 12 GB con Strata, ya que el backbone reside en memoria del sistema y la tabla Engram (110 GB) se transmite desde SSD.
- GPU recomendadas: no disponible; el requisito declarado es de 12 GB de VRAM, sin modelo concreto especificado.
- Almacenamiento: se necesita un SSD rápido para los shards (231-266 GB según nivel) y para el archivo Engram de 110 GB.
- Memoria del sistema: no disponible, aunque debe ser suficiente para alojar el backbone.
- Opciones de despliegue: Strata (según la model card, llama.cpp aún no soporta DeepSeek-V4.1 con archivo Engram separado).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (AtomicChat Uncensored GSQ-RCO) | 551,9B (763B según model card) | no disponible | MIT | GGUF + Engram | Sin rechazos, 3 niveles de cuantización |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | 551,9B | no disponible | no disponible | GGUF + Engram | Base original con rechazos |
| AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF | no disponible | no disponible | no disponible | GGUF | Misma edición de abliteración sobre otra base |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | no disponible | no disponible | no disponible | safetensors | Modelo original de DeepSeek |

## Limitaciones y advertencias

- El clasificador de rechazo lee el inicio de la respuesta, por lo que un rechazo suave que aparezca más adelante en el texto puede pasar como respuesta válida.
- La edición elimina los rechazos en todos los temas; no conserva un subconjunto más estrecho de ellos.
- Con el modo thinking activado, la edición planifica una respuesta a una petición (texto truncado en la model card).
- No todos los niveles de cuantización superaron todas las puertas de validación; los que no lo hicieron se publican tal cual, con sus métricas.
- La KL reportada es una cota inferior basada en top-64, por lo que la KL real es ligeramente superior.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas soportados: no disponibles.
- Restricciones de licencia: MIT permite uso comercial, pero la ausencia de rechazos traslada al usuario la responsabilidad sobre el contenido generado.
- El modelo requiere Strata; no es compatible con llama.cpp en el momento de publicación.
- El archivo Engram no se rehostea en este repositorio y debe descargarse por separado desde ISTA-DASLab.

## Enlaces

- [Hugging Face: jaromer/AtomicChat-DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF](https://huggingface.co/jaromer/AtomicChat-DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF)
- [Modelo base cuantizado: ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF](https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF)
- [Modelo original: deepseek-ai/DeepSeek-V4.1-Flash-1017](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017)
- [AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF](https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF)
- [Dataset de métricas: AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF-metrics](https://huggingface.co/datasets/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF-metrics)
- [Strata (runtime)](https://github.com/Niko1221/Strata)
- [Atomic Chat](https://atomic.chat/)
- [GitHub AtomicBot-ai/Atomic-Chat](https://github.com/AtomicBot-ai/Atomic-Chat)
- [Discord de AtomicChat](https://discord.gg/8wGSsvmg4V)
- [X de AtomicChat](https://x.com/atomic_chat_hq)
