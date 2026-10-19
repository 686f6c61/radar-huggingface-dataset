# polydim-cla/qwen2.5-coder-1.5b-pmtp

## Resumen

`polydim-cla/qwen2.5-coder-1.5b-pmtp` es un adaptador experimental publicado sobre el modelo base `Qwen/Qwen2.5-Coder-1.5B` (familia Qwen 2.5-Coder, 1.500 millones de parámetros). Lo desarrolla Ariel García Traba dentro de la iniciativa independiente POLYDIM-EINSOF y se distribuye con licencia Apache 2.0. El repositorio es muy reciente (creado el 18 de octubre de 2026), no acumula descargas ni interacciones y ocupa 0,1 GB, un tamaño coherente con un conjunto de tensores adicionales más que con los pesos completos del modelo base.

La propuesta técnica consiste en un adaptador geométrico que, según la model card, proyecta las activaciones de la capa 14 del transformer sobre una variedad de Stiefel ortonormal St(1536, 1536), manteniendo la dimensión del modelo (1536) e inyectando el resultado en esa misma capa. El autor reporta un defecto de Frobenius de 5,737e-14 medido en FP64 con acumulador de Neumaier, lo que indica que la matriz inyectada es numéricamente ortogonal hasta precisión de máquina. A ello añade un mecanismo propietario de comunicación entre procesos (`PmtpShmBus`) que, siempre según la model card, transporta tensores directamente por memoria compartida sin serializar tokens de texto.

La relevancia del modelo es acotada y de carácter fundamentalmente exploratorio: no es un modelo conversacional listo para producción, sino una pieza de investigación sobre adaptadores ortogonales y "continuous thought" en modelos de código pequeños. No hay resultados de benchmarks, no se documenta el procedimiento de inferencia y el mecanismo de bus de memoria compartida no es compatible con los stacks estándar de despliegue, por lo que debe evaluarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only del modelo base Qwen2.5-Coder (1.5B) + adaptador geométrico sobre variedad de Stiefel St(1536, 1536) inyectado en la capa 14 |
| Parametros totales | 1.500 millones (modelo base); el adaptador añade una matriz ortogonal de 1536 × 1536 (2,36 M de elementos, aprox. 4,7 MB en FP16 y 9,4 MB en FP32); el número exacto de parámetros del adaptador no se detalla |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-Coder-1.5B; el adaptador no modifica este valor según la información disponible |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base dispone de cuantizaciones GGUF/AWQ/GPTQ en el ecosistema, pero no se documenta si el adaptador funciona sobre versiones cuantizadas |
| Idiomas soportados | no disponible en la model card del adaptador; el modelo base Qwen2.5-Coder declara soporte multilingüe (no confirmado para el adaptador) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador opera sobre la arquitectura del transformer decoder-only de Qwen2.5-Coder 1.5B: 28 capas, `d_model = 1536`, atención con grouped-query attention y un vocabulario de gran tamaño. La intervención se sitúa en la capa 14, aproximadamente la mitad de la red, y consiste en una transformación lineal definida por una matriz ortonormal de 1536 × 1536, es decir, un punto de la variedad de Stiefel. Al ser ortogonal, la transformación preserva la norma L2 de las activaciones, de modo que la inyección no altera la escala de las representaciones que atraviesan esa capa. El autor reporta la desviación de ortogonalidad mediante el defecto de Frobenius (5,737e-14) calculado en doble precisión con acumulación compensada de Neumaier, un método habitual para reducir el error de redondeo en sumas de muchos términos.

No se proporciona información sobre el conjunto de datos de entrenamiento, el número de tokens, el objetivo de entrenamiento (si es supervisado, destilación o ajuste directo sobre la matriz) ni si se emplearon técnicas de RLHF o DPO. Tampoco se documenta el proceso de selección de la capa 14 ni la inicialización de la matriz. La model card menciona un componente adicional denominado `PmtpShmBus`, descrito como un canal de comunicación entre procesos que transfiere tensores por memoria compartida sin serialización de texto; se trata de una propuesta no estándar, sin especificación técnica publicada en la información disponible y sin integración conocida con `transformers`, `vLLM` o `llama.cpp`.

## Capacidades

- Generación de código y texto heredada del modelo base Qwen2.5-Coder-1.5B (autocompletado, generación de funciones, explicación de código).
- Razonamiento sobre fragmentos de código y tareas de reparación simples, limitado por el tamaño de 1.5B parámetros.
- Proyección ortogonal de activaciones intermedias sobre la variedad de Stiefel, con preservación de norma, como capacidad técnica diferencial del adaptador.
- Inyección de la transformación en la capa 14, sin alteración declarada de la dimensión del modelo (1536 → 1536).
- Transporte de tensores entre procesos vía `PmtpShmBus` sin serialización de tokens de texto, según la model card del autor.
- Tool calling y function calling: no disponible de forma específica para el adaptador; el modelo base Qwen2.5-Coder sí lo soporta, pero no se confirma que el adaptador lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas para el adaptador.
- Vision y audio: no soportados (el modelo base es exclusivamente de texto).
- Modo "thinking" o decodificación especulativa: no documentados.

## Casos de uso

- Investigación sobre adaptadores ortogonales: el modelo sirve como banco de pruebas reproducible para estudiar cómo una proyección en St(1536, 1536) afecta a las representaciones internas de un transformer pequeño, midiendo cambios en perplejidad y en la geometría de los embeddings antes y después de la capa 14.
- Estudio de "continuous thought" en modelos de código: permite experimentar con la hipótesis de que una transformación geométrica fija en una capa intermedia puede sustituir parte del razonamiento explícito en tareas de completado de código.
- Reproducción de medidas de estabilidad numérica: el defecto de Frobenius reportado (5,737e-14) con acumulador de Neumaier es un caso concreto para validar implementaciones de ortogonalización en FP64.
- Prototipado de asistentes de código en local: al partir de un modelo de 1.5B, puede ejecutarse en una GPU de consumo para autocompletado en entornos con requisitos de privacidad, siempre que se valide primero que el adaptador no degrada la calidad respecto al base.
- Docencia y divulgación: ejemplo didáctico de modificación quirúrgica de un transformer mediante una única intervención en una capa, con una métrica objetiva de fidelidad geométrica.
- Evaluación comparativa de adaptadores: línea base para contrastar con LoRA, DoRA u otras técnicas de ajuste eficiente en modelos de 1.5B, midiendo coste de almacenamiento (el adaptador ocupa megabytes frente a gigabytes del modelo completo) y efecto en la salida.
- Pruebas de integración de IPC de bajo nivel: el componente `PmtpShmBus` puede estudiarse como mecanismo de paso de tensores entre procesos, aunque no se recomienda su uso en producción sin especificación pública.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas de MMLU, HumanEval, GSM8K, MBPP ni evaluaciones de calidad de código, y tampoco se ofrece una comparación con el modelo base sin adaptador, que sería el punto de referencia mínimo para determinar si la inyección en la capa 14 aporta o degrada rendimiento.

## Requisitos de hardware

- VRAM estimada para el modelo base en FP16: aproximadamente 3,1 GB de pesos; con caché KV y activaciones, el consumo se sitúa en torno a 4-5 GB para contextos moderados.
- Caché KV: con 28 capas, 2 cabezas KV y dimensión de cabeza 128, cada token consume unos 28 KB en FP16; a 32.768 tokens de contexto completo, aproximadamente 0,9 GB adicionales.
- Cuantización INT8: pesos en torno a 1,6 GB; consumo total estimado de 2,5-3,5 GB.
- Cuantización Q4_K_M: pesos en torno a 1,0 GB; consumo total estimado de 1,5-2,5 GB, viable incluso en GPUs de 4 GB y en CPU con suficiente RAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090 para mayor throughput; A100 o H100 solo tendrían sentido para servir muchas réplicas en paralelo, no por requisitos de memoria.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs con 6 GB o más en FP16, y en GPUs de 4 GB con cuantización de 4 bits.
- Opciones de despliegue: `llama.cpp` y Ollama funcionan con el modelo base (el autor referencia la etiqueta `qwen2.5-coder:1.5b`); `vLLM` y TGI son viables para el base. El adaptador, al requerir la inyección en la capa 14 y el componente `PmtpShmBus`, no tiene integración documentada con ninguno de estos stacks y probablemente necesite código propio basado en `transformers`.
- Latencia y throughput: no disponible. No se han publicado medidas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-coder-1.5b-pmtp (este modelo) | 1,5B + adaptador (2,36 M elementos) | 32.768 (heredado del base) | Apache 2.0 | No disponible (sin benchmarks publicados) | Repositorio HuggingFace con 0 descargas; requiere código propio |
| Qwen2.5-Coder-1.5B (base) | 1,5B | 32.768 | Apache 2.0 | Resultados publicados en su propia model card (no incluidos en la información disponible) | Amplia adopción, disponible en GGUF, Ollama, vLLM |
| Qwen2.5-Coder-7B | 7,6B | 32.768 (extensible con YaRN) | Apache 2.0 | Resultados publicados en su propia model card | Amplia adopción; requiere más VRAM (~15 GB en FP16) |
| DeepSeek-Coder-1.3B | 1,3B | 16.384 | Licencia propia de DeepSeek (uso comercial con condiciones) | Resultados publicados en su propia model card | Disponible en HuggingFace y ecosistema GGUF |

Nota: los datos de los modelos comparables provienen de sus model cards públicas y deben verificarse en la fuente original; no se dispone de una evaluación homogénea que permita comparar directamente el adaptador con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evidencia publicada de que el adaptador mantenga, mejore o degrade la calidad del modelo base en generación de código.
- Afirmaciones no verificables: términos como "tensor telepathy" o "zero-worm IPC" no corresponden a terminología técnica estándar y no van acompañados de especificación, paper ni código de referencia en la información disponible.
- Sin procedimiento de inferencia documentado: no se explica cómo cargar el adaptador, cómo aplicarlo a la capa 14 ni cómo se integra `PmtpShmBus` con el modelo. Sin esa información, la reproducibilidad es nula.
- Compatibilidad limitada: los stacks habituales (`vLLM`, `llama.cpp`, `Ollama`, `TGI`) no soportan una inyección de este tipo sin modificaciones; el autor solo referencia la etiqueta Ollama del modelo base, no del adaptador.
- Tamaño del repositorio (0,1 GB): insuficiente para contener los pesos completos del modelo base en FP16 (unos 3 GB), por lo que el adaptador debe combinarse con `Qwen/Qwen2.5-Coder-1.5B`; no se detalla qué ficheros incluye exactamente.
- Riesgo de alucinación: heredado del modelo base de 1.5B, acentuado en tareas de razonamiento largo y en generación de código con APIs poco frecuentes.
- Sesgos: no documentados para el adaptador; el modelo base puede reflejar sesgos presentes en sus datos de entrenamiento, que tampoco se detallan.
- Idiomas: no se especifica qué idiomas preserve el adaptador tras la transformación de la capa 14; se recomienda validar en castellano antes de cualquier uso real.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías y el modelo se distribuye sin soporte.
- Estado del repositorio: cero descargas, cero interacciones y ausencia de paper o documentación complementaria; debe tratarse como un artefacto de investigación sin madurez para producción.
- La fecha de creación del repositorio (octubre de 2026) es posterior a la del conocimiento de referencia habitual sobre la familia Qwen 2.5; conviene verificar la vigencia del modelo base utilizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/polydim-cla/qwen2.5-coder-1.5b-pmtp
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- Repositorio del autor (POLYDIM-EINSOF): https://github.com/AGT1973/POLYDIM_EINSOF
- Paper o informe técnico: no disponible
- Demo o Space: no disponible
- Documentación adicional del adaptador: no disponible
