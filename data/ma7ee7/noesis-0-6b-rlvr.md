# Ma7ee7/Noesis-0.6B-RLVR

## Resumen

Noesis-0.6B-RLVR es un modelo de lenguaje de aproximadamente 600 millones de parámetros desarrollado por el usuario Ma7ee7, obtenido mediante ajuste fino del modelo base Ma7ee7/Noesis-0.6B-SFT con Group Relative Policy Optimization (GRPO) y recompensas matemáticas verificables. El objetivo declarado es mejorar la capacidad de razonamiento matemático del modelo base, entrenando sobre el split de entrenamiento de GSM8K y validando la corrección numérica de las respuestas de forma automática. Los pesos publicados son el resultado de fusionar los adaptadores LoRA entrenados en un modelo autónomo listo para usar con Transformers.

Se trata de una propuesta de escala pequeña (0,6B), pensada para experimentación con técnicas de aprendizaje por refuerzo aplicadas a razonamiento, más que para despliegues de producción de propósito general. La model card reporta una evaluación preliminar en validación retenida de 103/150 respuestas correctas (68,7 %), que el propio autor aclara que no equivale a un benchmark completo sobre el test de GSM8K.

Su relevancia actual radica en que ejemplifica el patrón RLVR (Reinforcement Learning with Verifiable Rewards) aplicado a modelos compactos: usar recompensas programáticas (comprobación numérica) para reforzar cadenas de razonamiento, una técnica popularizada por modelos mayores y que aquí se traslada a un modelo de 0,6B con recursos limitados. La información pública disponible es escasa y el modelo no cuenta todavía con descargas ni validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, según tag `qwen3`) |
| Parametros totales | 596.049.920 (~0,6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | other (no se especifican términos concretos) |
| Formato de pesos | safetensors (modelo fusionado, `peft-merged`) |

## Arquitectura y entrenamiento

El modelo parte de Ma7ee7/Noesis-0.6B-SFT, un ajuste supervisado previo del que no se detallan en la información disponible ni la arquitectura exacta de la familia base ni el volumen de datos de preentrenamiento. Los tags indican la familia Qwen3, por lo que se trata de un transformer decoder-only de ~0,6B parámetros, pero no se confirman detalles como número de capas, dimensión oculta, cabezas de atención ni longitud de contexto nativa.

Sobre ese modelo SFT se aplica GRPO (Group Relative Policy Optimization), una variante de optimización por política que estima la ventaja relativa dentro de grupos de respuestas muestreadas, evitando la necesidad de un modelo crítico separado. El entrenamiento usa el split de entrenamiento de GSM8K y una recompensa verificable basada en la corrección numérica de la respuesta final. El ajuste se realiza con LoRA (entrenamiento eficiente en parámetros) y los pesos publicados corresponden a la fusión de los adaptadores en el modelo base. No se documentan en la información disponible el número de pasos, el tamaño de grupo, la tasa de aprendizaje, la composición exacta del dataset más allá de GSM8K ni si hubo etapas adicionales de alineación (DPO, RLHF conversacional).

## Capacidades

- Generación de texto y razonamiento matemático de tipo cadena de pensamiento, reforzado específicamente mediante RLVR sobre problemas aritméticos de GSM8K.
- Resolución de problemas matemáticos de primaria/secundaria con respuesta numérica verificable.
- Razonamiento multi-paso orientado a la obtención de un resultado final comprobable.
- Plantilla de chat incluida para uso con Transformers (según la model card).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y multi-step reasoning general: no disponible (no documentado más allá del razonamiento matemático).
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponible.

## Casos de uso

- Experimentación con RLVR: servir como punto de partida reproducible para investigar cómo GRPO con recompensas verificables afecta a un modelo de 0,6B, comparando contra el modelo SFT base.
- Evaluación de técnicas de razonamiento en modelos pequeños: medir la brecha entre un modelo de 0,6B entrenado con RL y modelos mayores en tareas aritméticas tipo GSM8K.
- Generación de soluciones matemáticas paso a paso en entornos educativos controlados: el modelo produce cadenas de razonamiento y una respuesta numérica final, útil para prototipos de tutores de matemáticas en inglés.
- Benchmarking interno de pipelines de RL: integrar el modelo en un banco de pruebas para validar infraestructura de entrenamiento (LoRA, fusión de adaptadores, evaluación automática de recompensas).
- Filtrado y generación de datos sintéticos matemáticos: usar sus soluciones como candidatas en procesos de destilación o aumento de datos, con verificación numérica posterior.
- Despliegue ligero en CPU o GPU de gama baja para demos: al ser un modelo de ~0,6B en safetensors, es viable para pruebas locales de inferencia con Transformers, aunque no se documentan requisitos ni rendimiento.
- Investigación sobre alucinación en razonamiento: analizar en qué tipos de problemas el refuerzo con recompensa numérica produce respuestas correctas por caminos incorrectos.

## Benchmarks y rendimiento

| Evaluación | Resultado | Notas |
|---|---|---|
| Validación matemática retenida (held-out) | 103/150 correctas (68,7 %) | Resultado preliminar del autor; no es el test oficial de GSM8K |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K test, etc.) en la información disponible. El único dato numérico es la validación retenida reportada en la model card, que el propio autor califica de preliminar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. A partir del tamaño (596M parámetros) y del repo de 2,4 GB, una estimación orientativa sería ~1,2 GB en FP16/BF16 y por debajo de 1 GB en cuantizaciones de 8 o 4 bits, aunque no se publican ficheros GGUF ni cuantizaciones.
- GPU recomendadas: no documentadas. Por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) debería poder alojarlo en memoria; también es viable en CPU para pruebas.
- ¿Cabe en GPU consumer? Sí, por su tamaño; no se especifican requisitos oficiales.
- Opciones de despliegue: Transformers (soporte confirmado por la model card, con su plantilla de chat). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF no es directamente usable en llama.cpp/Ollama sin conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Noesis-0.6B-RLVR | ~0,6B | no disponible | GRPO + recompensas verificables sobre GSM8K | other | Hugging Face (0 descargas) |
| Qwen3-0.6B (familia base indicada por tags) | ~0,6B | no disponible en esta ficha | Modelo generalista preentrenado y alineado | según modelo original | Amplia |
| Noesis-0.6B-SFT (modelo base) | ~0,6B | no disponible | Ajuste supervisado previo | other | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada, por lo que la comparación se limita a tamaño, enfoque y disponibilidad. No se identifican en la información disponible otros modelos de 0,6B entrenados específicamente con RLVR sobre GSM8K para una comparación directa.

## Limitaciones y advertencias

- Entrenamiento centrado exclusivamente en resolución de problemas matemáticos; el rendimiento en conocimiento general, seguimiento de instrucciones y conversación debe evaluarse de forma independiente, tal como advierte el autor.
- El resultado de 68,7 % corresponde a una validación retenida preliminar, no al test oficial de GSM8K; no debe citarse como benchmark estándar.
- Riesgo de sobreajuste al formato y distribución de GSM8K: puede fallar en problemas matemáticos fuera de ese estilo o dominio.
- Riesgo de alucinación y de razonamientos plausibles con resultado incorrecto; la recompensa numérica no garantiza corrección del proceso.
- Idioma limitado al inglés según la model card; no se garantiza comportamiento en castellano u otros idiomas.
- Licencia "other" sin términos especificados: es necesario contactar con el autor o revisar el repositorio antes de cualquier uso comercial.
- Sesgos: no documentados; al derivar de un modelo base del que no se detallan datos de preentrenamiento, los sesgos heredados son desconocidos.
- Longitud de contexto no documentada: no se debe asumir una ventana amplia para conversaciones multi-turno largas.
- Modelo sin descargas ni validación externa en el momento de la consulta; madurez y soporte comunitario nulos.
- No se publican cuantizaciones ni artefactos de despliegue (GGUF, etc.), lo que limita su uso en herramientas de inferencia optimizadas sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ma7ee7/Noesis-0.6B-RLVR
- Modelo base SFT: https://huggingface.co/Ma7ee7/Noesis-0.6B-SFT
- Paper de GRPO (DeepSeekMath): https://arxiv.org/abs/2402.03300
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Repositorio PEFT (LoRA): https://github.com/huggingface/peft
- Repositorio TRL (implementación de GRPO): https://github.com/huggingface/trl
