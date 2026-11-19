# keptn/ornith-1.5-35b-a3b-iq8r

## Resumen

Ornith 1.5 35B-A3B IQ8R es una cuantización en int8 del modelo de razonamiento multimodal `ornith-ai/Ornith-1.5-35B-A3B`, publicada por el usuario keptn y empaquetada en un único fichero de 35,04 GiB para el motor de inferencia radiance sobre GPUs AMD RDNA4. Se trata de una mezcla de expertos (MoE) con 35 mil millones de parámetros totales y 3 mil millones activos por token, afinada para código y tareas de agente, con ventana de contexto de 262.144 tokens y entrada de texto e imagen.

El modelo base lo desarrolla el equipo Ornith y está construido sobre Qwen3.5 (licencia Apache 2.0); la ficha se centra en la conversión IQ8R, que aplica rotación de Hadamard sobre bloques de 128 con una escala bf16 por fila en el tronco y una escala bf16 por cada 128 pesos en los expertos, además de un `lm_head` int8 y una copia de 2 bits del mismo para los tokens de borrador de la decodificación especulativa.

Su relevancia es doble: por un lado, demuestra que un MoE de 35B puede servirse en int8 con una degradación muy baja respecto al original bf16 (KL medio de 0,00390 en MT-Bench) y, por otro, ofrece una vía práctica de despliegue en hardware AMD de consumo profesional mediante dos o cuatro tarjetas de 32 GB, con decodificación especulativa integrada a través de la cabeza MTP del propio modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer, base Qwen3.5, con cabeza MTP para decodificación especulativa; multimodal texto-imagen |
| Parametros totales | 35B |
| Parametros activos | 3B |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | IQ8R (int8 con rotación de Hadamard sobre 128; tronco con una escala u8 por 256 pesos bajo una escala bf16 por fila; expertos int8 con una escala bf16 por 128 pesos; activaciones int8; `lm_head` int8 con una escala bf16 por 128 pesos; copia de 2 bits del `lm_head` para borradores) |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | `.rad` (formato propietario de radiance 2.0.0 o superior); fichero `ornith-1.5-35b-a3b-iq8r.rad` de 35,04 GiB |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos derivada de Qwen3.5, con 35B parámetros totales y 3B activos por token, lo que permite un coste de cómputo por token propio de un modelo mucho menor. Incluye una cabeza MTP (multi-token prediction) que se reutiliza como drafter en decodificación especulativa con 3 tokens de borrador, y admite entradas de texto e imagen, por lo que el pipeline declarado es `image-text-to-text`. El contexto nativo es de 262.144 tokens.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible (número de tokens, composición del dataset, fases de RLHF/DPO). Lo que sí está documentado es el proceso de cuantización: se partió de la revisión bf16 `10fbf86f` del release oficial y se convirtió con la receta `q36-35b-a3b-iq8r.recipe` de radiance 2.0 mediante `rad-convert`, con redondeo al más cercano y búsqueda de escala, sin datos de calibración. La innovación técnica destacable es la combinación de IQ8R con decodificación especulativa MTP y caché KV en i8, que en dos tarjetas Radeon AI PRO R9700 alcanza 70,1 y 102,8 tokens por segundo en dos prompts de prueba.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto, desactivable por petición mediante `chat_template_kwargs.enable_thinking`.
- Generación de código, con ajustes de muestreo específicos recomendados por el autor (temperatura 0,6 y `presence_penalty` 0).
- Razonamiento multi-paso y flujos de agente, según la propia model card ("tuned for coding and agent work").
- Entrada multimodal de imagen junto con texto (pipeline `image-text-to-text`).
- Decodificación especulativa nativa mediante la cabeza MTP del modelo, con 3 tokens de borrador configurables.
- Soporte de contexto largo de hasta 262.144 tokens, con caché KV en i8.
- Capacidades multilingües: no disponible en la información proporcionada.
- Soporte explícito de tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en producción: el modelo está afinado para código y admite un perfil de muestreo dedicado (temperatura 0,6, sin penalización de presencia), lo que permite integrarlo en pipelines de revisión, generación de parches y autocompletado con contexto de repositorio gracias a sus 262.144 tokens de ventana.
- Agentes autónomos multi-paso: la combinación de modo thinking, contexto largo y decodificación especulativa MTP lo hace adecuado para bucles de planificación y ejecución con varias llamadas encadenadas, siempre que se controle el presupuesto de tokens de salida.
- Análisis de documentos e imágenes: al aceptar entrada de imagen y texto, puede emplearse para extraer información de capturas, diagramas o documentación escaneada junto a instrucciones textuales.
- Razonamiento sobre bases de código extensas: con 262.144 tokens de contexto y caché KV en i8, es viable cargar varios ficheros o un módulo completo y formular preguntas de arquitectura o depuración sin trocear el contenido.
- Despliegue on-premise en hardware AMD: pensado para dos o cuatro tarjetas RDNA4 de 32 GB (probado en dos Radeon AI PRO R9700), encaja en entornos que ya operan infraestructura AMD y quieren evitar depender de CUDA.
- Servicio de inferencia con concurrencia moderada: la configuración de referencia admite 8 secuencias y 2.097.280 tokens de contexto totales en caché KV entre dos tarjetas, suficiente para un servicio interno con sesiones largas.
- Evaluación comparativa de cuantizaciones: al publicar métricas KL frente al bf16 y frente a la variante w4a8, sirve como referencia para decidir el nivel de cuantización en un despliegue real.

## Benchmarks y rendimiento

La model card no incluye benchmarks de tareas estándar (MMLU, HumanEval, GSM8K), pero sí una evaluación de fidelidad respecto al original bf16 sobre las 80 preguntas de MT-Bench (ambos turnos, 42.305 tokens de respuesta), con thinking desactivado:

| Metrica | Este fichero (IQ8R) | keptn/ornith-1.5-35b-a3b-w4a8 |
|---|---|---|
| KL medio | 0,00390 | 0,0122 |
| KL percentil 99 | 0,0466 | 0,140 |
| Token top coincidente | 98,2% | 96,7% |
| Ratio de perplejidad | ×1,000 | ×1,003 |

Rendimiento medido en dos tarjetas con radiance 2.0.0, KV i8, greedy y 3 tokens de borrador MTP: 70,1 y 102,8 tokens por segundo sobre dos prompts cortos. El autor advierte que la velocidad solo se comprobó con esos dos prompts y que BetterBench aún no se ejecuta en radiance 2.0.

## Requisitos de hardware

- VRAM: el fichero ocupa 35,04 GiB; con caché KV i8 a 262.144 tokens y 8 secuencias, radiance reserva 11,57 GiB por tarjeta en una configuración de dos GPUs.
- No cabe en una sola tarjeta: el autor lo indica explícitamente ("One card is not possible").
- GPU recomendadas: dos o cuatro tarjetas AMD RDNA4 de 32 GB; probado en dos Radeon AI PRO R9700. No hay soporte documentado para NVIDIA ni para GPUs de consumo de 24 GB.
- Configuración de referencia: `tp: 2` (o `tp: 4`), `p2p: on`, `kv-cache-dtype: i8`, `max-model-len: 262144`, `max-num-seqs: 8`, `max-num-batched-tokens: 2048`, `num-speculative-tokens: 3`.
- Despliegue: exclusivamente mediante el motor radiance 2.0.0 o superior (imagen Docker `stilldeadcode/radiance:2.0.0`), con ROCm y los dispositivos `/dev/kfd` y `/dev/dri` expuestos. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput observado: 70,1 y 102,8 tokens por segundo con dos tarjetas y 3 tokens de borrador. La latencia no se reporta.
- La configuración de cuatro tarjetas no está probada en radiance 2.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| keptn/ornith-1.5-35b-a3b-iq8r | 35B totales / 3B activos | 262.144 | IQ8R int8 | MIT | Hugging Face, formato `.rad`, solo radiance/AMD RDNA4 |
| keptn/ornith-1.5-35b-a3b-w4a8 | 35B totales / 3B activos | no disponible | W4A8 | MIT | Hugging Face; KL medio 0,0122 frente a 0,00390 del IQ8R |
| ornith-ai/Ornith-1.5-35B-A3B (bf16) | 35B totales / 3B activos | 262.144 | bf16 | MIT | Hugging Face; referencia de calidad, requiere mucha más VRAM |
| keptn/ornith-1.5-35b-a3b-fp8 (v1.1) | 35B totales / 3B activos | no disponible | FP8 en bloques 128×128 | MIT | Revisión `v1.1` del mismo repositorio; radiance 1.8.1 a 1.17.0 |

## Limitaciones y advertencias

- Dependencia total de radiance: el fichero `.rad` solo se carga con radiance 2.0.0 o superior, lo que limita su uso a ese ecosistema y descarta vLLM, llama.cpp u Ollama.
- Restricción de hardware: requiere GPUs AMD RDNA4 y un mínimo de dos tarjetas de 32 GB; no es desplegable en una sola GPU ni en hardware NVIDIA según la documentación.
- Evaluación de velocidad limitada a dos prompts cortos; no hay datos de latencia, throughput sostenido ni comportamiento bajo carga concurrente real.
- Las imágenes no se compararon con HF transformers en esta versión, por lo que la fidelidad de la cuantización en la rama visual no está verificada.
- Con thinking activado, las tareas difíciles pueden requerir más de 32.000 tokens de salida, lo que afecta al coste y a la planificación de la ventana.
- La cuantización int8 introduce una desviación medible respecto al bf16 (KL medio 0,00390, percentil 99 de 0,0466, 98,2% de coincidencia en el token top), aceptable pero no nula.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas en la información disponible.
- Idiomas soportados no declarados; no hay garantía documentada de calidad multilingüe.
- Licencia MIT heredada del modelo base, que permite uso comercial, pero conviene revisar el fichero `LICENSE` del repositorio original de Ornith por si hubiera condiciones adicionales.
- El repositorio tiene un volumen de descargas muy bajo (105) y una sola valoración, por lo que la validación por parte de la comunidad es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keptn/ornith-1.5-35b-a3b-iq8r
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Variante W4A8: https://huggingface.co/keptn/ornith-1.5-35b-a3b-w4a8
- Repositorio del modelo Ornith: https://github.com/ornith-ai/Ornith-1
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Dataset MT-Bench: https://huggingface.co/datasets/lmsys/mt_bench_human_judgments
