# apracv/pramana-2b

## Resumen

Pramana-2B es un modelo de decisión —no un modelo conversacional de propósito general— publicado por el usuario apracv y afinado a partir de Qwen3.5-2B. Recibe el estado de un caso (una traza de agente, un hilo de atención al cliente, una factura o una alerta de seguridad) junto con un conjunto de preguntas tipadas (`yes/no`, `choice` de una entre N y `score` sobre una rúbrica ordenada) y devuelve, en una sola pasada, una distribución de probabilidad sobre cada opción de cada pregunta, además de un valor de confianza calibrado de forma independiente.

Su interés no está en la exactitud sino en la calidad distribucional: sobre el benchmark Typed Decisions (400 casos, 2.000 decisiones) obtiene KL 0,0755 y Brier 0,0415, con una accuracy de 0,8005 que lo sitúa al nivel de los modelos pequeños afinados y por debajo de los mejores modelos de 4B. La aportación técnica es una calibración desacoplada con dos temperaturas, una ajustada al soft gold y otra a la etiqueta dura, que evita el compromiso habitual entre KL y ECE.

El modelo se distribuye como dos adaptadores LoRA promediados sobre la misma base, de modo que cada inferencia cuesta dos pasadas de un modelo de 2B. La licencia es Apache 2.0 y el repositorio ocupa 0,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; el modelo base es Qwen3.5-2B. Ajuste mediante LoRA (dos adaptadores promediados) sobre esa base |
| Parametros totales | 2B (modelo base Qwen3.5-2B) mas dos adaptadores LoRA |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en safetensors, 0,3 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (según el tag del repositorio; requiere el modelo base unsloth/Qwen3.5-2B) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B y se entrena con dos adaptadores LoRA sobre esa misma base, con learning rates de 2e-4 y 1e-4, que alcanzan por separado 0,7970 y 0,7940 de accuracy. En inferencia se promedian las probabilidades de ambos adaptadores, lo que implica dos pasadas de un modelo de 2B por decisión. La decisión de promediar se tomó después de puntuar ambos adaptadores sobre test: la ganancia de accuracy frente al mejor adaptador (+0,0035) está dentro del ruido, mientras que las mejoras de KL y Brier son consistentes.

El entrenamiento usa entropía cruzada contra el soft gold del dataset Typed Decisions más un término de Brier con peso 1,0, sin calibración post-hoc posterior. La temperatura ajustada al soft gold (`T_p`) queda en 1,00–1,05, por lo que no requiere corrección. La calibración se separa en dos salidas: `probabilities = softmax(z / T_p)` para la distribución puntuada y `confidence = max softmax(log probabilities / T_c)`, con `T_c` ajustada a la etiqueta dura, que baja el ECE de 0,168 a 0,038. Los parámetros `T_p`, `T_c` y el umbral de cascada se ajustaron sobre 80 casos de entrenamiento reservados, nunca sobre test, y se distribuyen en `calibration.json`. El número de tokens de entrenamiento y la composición detallada del dataset no están disponibles en la información proporcionada.

## Capacidades

- Emisión de distribuciones de probabilidad completas sobre todas las opciones de todas las preguntas tipadas en un solo forward pass.
- Soporte de tres formatos de pregunta: `yes/no`, `choice` (una entre N) y `score` (rúbrica ordenada).
- Salida de confianza calibrada de forma independiente a la distribución, con ECE de 0,038 frente a 0,168 de `max(probabilities)`.
- Especialización en cuatro flujos: revisión de trazas de agente, atención al cliente, procesamiento de facturas e incidentes de seguridad.
- Modo cascada con Pramana-0.8B: derivar al modelo de 2B solo cuando la probabilidad top del 0.8B cae por debajo de 0,68.
- No se documenta soporte de tool calling, function calling, capacidades de agente autónomo, visión, audio, modo thinking ni generación de texto libre. La model card describe exclusivamente el comportamiento como cabecera de decisión sobre opciones predefinidas.

## Casos de uso

- Revisión de trazas de agente: dada la traza completa de un agente y preguntas del tipo "¿cumplió la política de herramientas?" (`yes/no`) o "¿qué falló?" (`choice`), el modelo devuelve la distribución sobre cada opción y una confianza que permite enrutar los casos dudosos a revisión humana.
- Triaje de tickets de atención al cliente: clasificar intención, prioridad y necesidad de escalado sobre un hilo multi-turno, usando la confianza calibrada para fijar umbrales operativos en lugar de un argmax sin garantías.
- Procesamiento de facturas: decidir si una factura requiere revisión manual (`yes/no`), asignar categoría contable (`choice`) y puntuar la calidad de la extracción (`score`), todo en una sola pasada por documento.
- Priorización de alertas de seguridad: clasificar un incidente en una taxonomía cerrada y puntuar su severidad con una rúbrica, aprovechando que la distribución refleja la incertidumbre real del caso.
- Enrutado en cascada para control de coste: desplegar Pramana-0.8B como primera línea y derivar al 2B el 66,8% de las decisiones con probabilidad top inferior a 0,68, obteniendo 0,8000 de accuracy con KL 0,0783 y Brier 0,0425.
- Evaluación automática de sistemas LLM: usar el modelo como juez con rúbrica sobre trazas de agentes, sustituyendo juicios binarios por distribuciones que permiten medir acuerdo y detectar casos ambiguos.
- Fijación de umbrales de automatización: al estar la confianza calibrada con ECE 0,038, es posible elegir un umbral (por ejemplo 0,9) con una interpretación probabilística defendible ante negocio o auditoría.
- Investigación en calibración: el par de temperaturas y el esquema de promediado de adaptadores sirven como referencia reproducible para comparar métodos de calibración sobre el benchmark Typed Decisions.

## Benchmarks y rendimiento

Split de test: 400 casos, 2.000 decisiones. Métricas según las definiciones del benchmark: accuracy (acuerdo del argmax con el gold), KL(gold ‖ predicción), Brier multiclase y ECE top-label con 10 bins. Modelos afinados sobre el split de entrenamiento:

| Modelo | Parámetros | Accuracy ↑ | KL ↓ | Brier ↓ | ECE ↓ |
|---|---|---|---|---|---|
| Pramana-2B | 2B | 0,8005 | **0,0755** | **0,0415** | 0,168 (0,038 con `confidence`) |
| Pramana-0.8B | 0,8B | 0,7970 | 0,0819 | 0,0446 | 0,165 (**0,025** con `confidence`) |
| Decider-4B | 4B | **0,8205** | 0,301 | 0,132 | 0,031 |
| Arbiter-4B | 4B | 0,817 | 0,092 | 0,048 | 0,184 |
| Darwin-27B-ZTC-v5 | 27B | 0,812 | – | – | – |
| ministral3-3b-reasoning | 3B | 0,808 | 0,077 | 0,042 | 0,182 |
| sysone-0.4B | 0,4B | 0,8025 | 0,080 | 0,0438 | 0,174 |
| OpenDecider-large-td | 80B-A3B | 0,801 | 0,081 | 0,044 | – |
| od1-typed-decisions | 4B | 0,797 | 0,082 | 0,045 | 0,156 |
| OpenDecider-nano | 0,4B | 0,796 | 0,079 | 0,043 | – |

Bootstrap emparejado (2.000 remuestreos de los 400 casos de test, intervalos del 95%) frente a modelos con predicciones públicas:

| Frente a | Accuracy | KL | Brier | ECE |
|---|---|---|---|---|
| Decider-4B (predicciones públicas) | −0,043 a −0,010 | −0,011 a +0,001 | −0,005 a +0,002 | −0,008 a +0,024 |
| Arbiter-4B | −0,029 a +0,003 | **−0,024 a −0,010** | **−0,010 a −0,003** | −0,029 a +0,003 |
| sysone-0.4B | −0,018 a +0,014 | −0,009 a +0,000 | −0,005 a +0,000 | −0,022 a +0,009 |

Conclusiones declaradas por el autor: superioridad significativa frente a Arbiter-4B en KL y Brier, empate estadístico con sysone-0.4B en las cuatro métricas y desventaja significativa frente a Decider-4B en accuracy. Las predicciones públicas de Decider-4B puntúan 0,827 / 0,080 / 0,043 / 0,160, no su envío al leaderboard. En la sección zero-shot, el único dato completo disponible es Quyet-1.0-Large (31B, pesos abiertos): accuracy 0,791, KL 0,281, Brier 0,114, ECE 0,093; el resto de la tabla aparece truncado en la información recibida.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general en la información disponible.

## Requisitos de hardware

- VRAM estimada para los pesos del modelo base de 2B: unos 4 GB en fp16, 2 GB en int8 y 1,2 GB en int4 (cálculo a partir del número de parámetros; el autor no publica requisitos).
- Cada inferencia ejecuta dos pasadas del modelo de 2B (promediado de dos adaptadores), por lo que el coste de cómputo es aproximadamente el doble que el de una única pasada, aunque los pesos del modelo base pueden compartirse cargando una sola instancia con los dos adaptadores.
- Cabe en GPU de consumo: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 3090 (24 GB) y, en fp16 con margen justo, tarjetas de 8 GB.
- GPU de datacenter recomendadas para servir en producción: A100, H100 o L40S, especialmente si se sirven los dos adaptadores en paralelo o se combina con la cascada de Pramana-0.8B.
- Opciones de despliegue: vLLM o TGI con soporte multi-LoRA para cargar los dos adaptadores sobre una base; llama.cpp u Ollama si se convierten los adaptadores a GGUF. La model card no documenta ningún procedimiento de serving ni el código de decodificación sobre opciones tipadas, que hay que implementar aplicando `T_p` y `T_c` desde `calibration.json`.
- Latencia y throughput: no disponibles. El repositorio tiene 0 descargas y 0 likes, sin datos de la comunidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy | KL | Brier | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Pramana-2B | 2B | No disponible | 0,8005 | 0,0755 | 0,0415 | Apache 2.0 | Pesos abiertos en HuggingFace |
| Decider-4B | 4B | No disponible | 0,8205 | 0,301 | 0,132 | No disponible | Pesos abiertos |
| Arbiter-4B | 4B | No disponible | 0,817 | 0,092 | 0,048 | No disponible | Pesos abiertos |
| Pramana-0.8B | 0,8B | No disponible | 0,7970 | 0,0819 | 0,0446 | Apache 2.0 | Pesos abiertos |
| sysone-0.4B | 0,4B | No disponible | 0,8025 | 0,080 | 0,0438 | No disponible | Pesos abiertos |
| ministral3-3b-reasoning | 3B | No disponible | 0,808 | 0,077 | 0,042 | No disponible | Pesos abiertos |

Pramana-2B destaca por ser el mejor del grupo en KL y Brier entre los modelos con predicciones públicas verificables, con licencia Apache 2.0 explícita, y por ofrecer dos calibraciones separadas que ningún competidor documenta. Decider-4B mantiene la mejor accuracy del conjunto (0,8205) y un ECE de 0,031, pero su KL de 0,301 indica una distribución muy desviada del soft gold. Pramana-0.8B es la alternativa directa cuando el coste importa: pierde 0,0035 de accuracy y ofrece un ECE de confianza incluso mejor (0,025), además de encajar en la cascada del modelo de 2B.

## Limitaciones y advertencias

- La accuracy (0,8005) es significativamente inferior a la de Decider-4B: el intervalo del 95% de la diferencia es −0,043 a −0,010, por lo que no conviene usar Pramana-2B cuando el criterio principal sea el argmax.
- El ECE de la distribución (`max(probabilities)`) es 0,168; solo el campo `confidence` está calibrado con ECE 0,038. Consumir la salida equivocada anula la ventaja del modelo.
- Especialización estricta en cuatro flujos y tres formatos de pregunta; el rendimiento fuera de ese formato o de esos dominios no está evaluado.
- El modelo se entrena y evalúa sobre un único dataset (LocalLLaMA/typed-decisions); el número de tokens y la composición no están disponibles, y no hay evidencia de generalización a datos de producción reales.
- `T_p`, `T_c` y el umbral de cascada (0,68) se ajustaron sobre solo 80 casos reservados, lo que añade varianza a esos parámetros.
- El promediado de dos adaptadores duplica el coste de inferencia y la decisión se tomó tras evaluar ambos adaptadores sobre test, un procedimiento que puede inflar ligeramente las métricas reportadas.
- El riesgo de alucinación se manifiesta como distribuciones mal calibradas fuera de distribución; no hay medición de ECE fuera del test del benchmark ni con entradas adversariales.
- Idiomas soportados no disponibles: no se puede asumir buen rendimiento en castellano.
- Licencia Apache 2.0, favorable a uso comercial, pero conviene verificar la licencia del modelo base Qwen3.5-2B, no incluida en la información proporcionada.
- No se documentan sesgos conocidos. El repositorio no tiene descargas ni likes y no hay validación independiente de los resultados.
- El modelo no es conversacional: no genera texto libre ni soporta tool calling, por lo que no puede sustituir a un LLM general en un pipeline de agentes.

## Enlaces

- [Modelo en HuggingFace: apracv/pramana-2b](https://huggingface.co/apracv/pramana-2b)
- [Modelo hermano: apracv/pramana-0.8b](https://huggingface.co/apracv/pramana-0.8b)
- [Dataset de entrenamiento y evaluación: LocalLLaMA/typed-decisions](https://huggingface.co/datasets/LocalLLaMA/typed-decisions)
- [Modelo base: unsloth/Qwen3.5-2B](https://huggingface.co/unsloth/Qwen3.5-2B)
- [Licencia Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- Papers, blogs, repositorios de código y demos: no disponibles en la información proporcionada.
