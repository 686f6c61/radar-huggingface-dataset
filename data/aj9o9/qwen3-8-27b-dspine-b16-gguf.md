# aj9o9/Qwen3.8-27B-DSpine-b16-GGUF

## Resumen

Qwen3.8-27B-DSpine-b16 es un modelo borrador (draft model) para decodificación especulativa, desarrollado por Tencent como complemento del modelo objetivo Qwen3.8-27B de Alibaba. No es un modelo de propósito general: su única función es proponer bloques de 16 tokens que el modelo objetivo verifica en paralelo, acelerando la generación sin alterar la distribución de salida. La arquitectura DSpine extiende DFlash con atención causal de bloque, un puente de código tras cada capa y un refinamiento serial de última escritura que construye una tabla de transición 16x16 por posición.

El repositorio alojado por el usuario aj9o9 contiene únicamente conversiones a GGUF del drafter original, pensadas para llama.cpp. El modelo pesa 2.025.387.776 parámetros (unos 2.000 millones) repartidos en cinco capas, y su ventana de contexto es de 8.192 tokens, muy inferior a la del modelo objetivo. Su relevancia práctica es medible: sobre una RTX 3090 con un Qwen3.8-27B en Q4_K_M, eleva la decodificación de 28,9 tok/s sin especulación a 104,8 tok/s, más del triple, y por encima de los 58,2 tok/s de DFlash2.

La licencia es Apache-2.0, heredada del modelo original de Tencent. El punto crítico para su adopción es que llama.cpp upstream todavía no soporta DSpine: hace falta la rama `dspine` de un fork concreto, y la versión estándar rechaza cargar los ficheros en lugar de ejecutarlos de forma incorrecta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer draft model DSpine (5 capas, extensión de DFlash) sobre hidden states del objetivo |
| Parametros totales | 2.025.387.776 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (ventana del drafter) |
| Tipos de cuantizacion | Q4_K_M, Q8_0, BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

DSpine es un drafter de cinco capas que lee hidden states de cinco capas del modelo objetivo y propone un bloque de 16 tokens en paralelo. Sobre DFlash añade tres mecanismos: atención causal de bloque, donde cada posición del borrador atiende solo a las anteriores de su propio bloque; un puente de código tras cada capa, en el que cada posición recibe un mensaje con puerta construido a partir del código del token predicho por su predecesora, propagando dependencias causales a través de la profundidad de la red; y un refinamiento serial de última escritura que, para los 16 candidatos principales de cada posición, rehace la última escritura del puente usando el código exacto de cada predecesor candidato, generando una tabla de transición 16x16 por posición.

El decodificador especulativo recorre esa tabla desde el último token aceptado para elegir la cadena de borrador, de forma codiciosa o por muestreo. El modelo se distribuye como drafter independiente: requiere un GGUF objetivo de Qwen3.8-27B aparte. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de borradores de 16 tokens en paralelo para decodificación especulativa sobre Qwen3.8-27B.
- Verificación compatible con decodificación codiciosa (temperatura 0) y con muestreo probabilístico de la cadena de borrador (temperatura > 0).
- Mayor tasa de aceptación en contenido estructurado: aproximadamente 9,5 tokens por paso de verificación en matemáticas y 8,9 en C++, frente a 7 en Python y 2,8 en prosa.
- Funcionamiento con prompts que exceden su ventana de 8.192 tokens, con degradación gradual de la aceleración.
- No es un modelo conversacional autónomo: no genera respuestas por sí mismo, no soporta tool calling ni razonamiento multi-paso de forma independiente.
- Capacidades multilingües: no disponibles como capacidad propia del drafter.

## Casos de uso

- Servicio de inferencia local de Qwen3.8-27B con llama-server: se carga el objetivo en Q4_K_M junto al drafter y se activa `--spec-type draft-dflash` con `--spec-draft-n-max 15`, obteniendo alrededor de 105 tok/s en una RTX 3090 en lugar de 29 tok/s.
- Generación de código en estación de trabajo: al ser C++ y Python los dominios con mayor aceptación (8,9 y 7 tokens por paso), el drafter resulta especialmente rentable en asistentes de programación y pipelines de revisión de código.
- Razonamiento matemático interactivo: la tasa de aproximadamente 9,5 tokens por paso de verificación en matemáticas lo hace adecuado para entornos de resolución de problemas paso a paso donde la latencia percibida importa.
- Despliegue en GPUs de 24 GB con dos slots: usando `--spec-draft-n-max 7` y `-np 2`, se mantiene la aceleración dentro del presupuesto de memoria del estado recurrente por token del objetivo híbrido.
- Re-cuantización y ajuste de compromiso velocidad/precisión: la variante BF16 de 4,06 GB permite generar nuevas cuantizaciones, y Q8_0 ofrece la misma aceptación que Q4_K_M en las pruebas del autor con mayor tamaño.
- Procesamiento por lotes de prompts largos: con un prompt de 13.000 tokens, superior a la ventana del drafter, sigue alcanzando 62 tok/s con unos 4,1 tokens por paso, útil en tareas de resumen o análisis de documentos extensos.
- Evaluación comparativa de técnicas de decodificación especulativa: sirve como referencia reproducible frente a DFlash2 y a la decodificación sin especulación en el mismo hardware.

## Benchmarks y rendimiento

Configuración de prueba: una RTX 3090 (24 GB), objetivo Qwen3.8-27B-Q4_K_M.gguf, llama-server con un slot y hasta 768 tokens nuevos por prompt, thinking desactivado, cuatro prompts (matemáticas de primaria, Python, explicación en prosa y C++).

| Configuracion | Decode tok/s | Tokens por paso de verificacion |
|---|---|---|
| Sin decodificacion especulativa | 28,9 | 1,0 |
| DFlash2 Q4_K_M, 7 borradores | 58,2 | ~5,1 |
| DSpine Q4_K_M, 15 borradores | 104,8 | ~6,3 |
| DSpine Q8_0, 15 borradores | 102,2 | ~6,3 |

Todas las filas a temperatura 0. DSpine Q4_K_M alcanzó además 104,1 tok/s a temperatura 1,0 con muestreo probabilístico del borrador.

| Contenido | Tokens por paso de verificacion |
|---|---|
| Matematicas | ~9,5 |
| C++ | ~8,9 |
| Python | ~7 |
| Prosa | ~2,8 |

Con un prompt de 13.000 tokens se mantuvo en 62 tok/s con ~4,1 tokens por paso de verificación. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible, y no procede inventarlos: el drafter no altera la distribución del modelo objetivo.

## Requisitos de hardware

- VRAM del drafter: 1,26 GB en Q4_K_M, 2,20 GB en Q8_0 y 4,06 GB en BF16, adicionales a la memoria del modelo objetivo.
- VRAM total: el objetivo Qwen3.8-27B en Q4_K_M más el drafter Q4_K_M debe caber junto con la caché KV cuantizada a q8_0; la referencia medida es una única RTX 3090 de 24 GB con `-ngl 999 --spec-draft-ngl 999`.
- GPU recomendadas: RTX 3090 (configuración medida), RTX 4090 y tarjetas de 24 GB o más; A100 y H100 quedan fuera de las pruebas publicadas.
- Cabe en GPU de consumo de 24 GB con un slot; con `-np 2` hay que reducir `--spec-draft-n-max` a 7 por el estado recurrente por token del objetivo híbrido.
- Despliegue: exclusivamente llama.cpp con la rama `dspine` del fork https://github.com/Ajay9o9/llama.cpp/tree/dspine, compilada con `-DGGML_CUDA=ON`. No hay soporte en vLLM, TGI, Ollama ni en llama.cpp upstream.
- Throughput medido: 104,8 tok/s en decodificación con Q4_K_M y 15 borradores; 102,2 tok/s con Q8_0; 62 tok/s con prompt de 13.000 tokens.
- Latencia: no se han publicado mediciones de time-to-first-token en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decode tok/s (RTX 3090, objetivo Q4_K_M) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DSpine-b16 (este) | 2,03 B | 8.192 | 104,8 | Apache-2.0 | GGUF en este repo, requiere fork de llama.cpp |
| DFlash2 | no disponible | no disponible | 58,2 | no disponible | no disponible |
| Sin especulacion (objetivo solo) | 27 B (objetivo) | no disponible | 28,9 | Apache-2.0 (Qwen3.8-27B) | llama.cpp upstream |

La comparación se limita a la aceleración de decodificación, que es la única métrica publicada. No hay datos de calidad ni de otros drafters alternativos en la información disponible.

## Limitaciones y advertencias

- No es un modelo autónomo: sin un GGUF objetivo de Qwen3.8-27B no produce salidas utilizables.
- llama.cpp upstream no soporta DSpine y rechaza cargar los ficheros; es obligatorio el fork con la rama `dspine`, lo que añade riesgo de mantenimiento y de divergencia respecto a master.
- El parámetro `--spec-draft-n-max 15` es obligatorio en la práctica: el valor por defecto de 3 desaprovecha el bloque de 16 tokens y pierde la mayor parte de la aceleración.
- Ventana de contexto de solo 8.192 tokens: con prompts más largos la aceleración cae (de ~6,3 a ~4,1 tokens por paso en el caso medido de 13.000 tokens).
- El beneficio depende fuertemente del contenido: en prosa baja a ~2,8 tokens por paso, por lo que la ganancia es mucho menor que en código o matemáticas.
- Con dos slots en tarjetas de 24 GB hay que reducir el número de borradores a 7 por el estado recurrente por token del objetivo híbrido.
- Sesgos y riesgo de alucinación: no disponibles como evaluación propia del drafter; cualquier sesgo procede del modelo objetivo, cuya distribución el drafter no modifica.
- Idiomas soportados: no disponible en la información proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre el modelo base (Qwen3.8-27B de Alibaba) y sobre el drafter original (Tencent) recae en sus respectivos términos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de las conversiones GGUF.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aj9o9/Qwen3.8-27B-DSpine-b16-GGUF
- Modelo base (drafter original): https://huggingface.co/tencent/Qwen3.8-27B-DSpine-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper: https://arxiv.org/abs/2609.36173
- Fork de llama.cpp con soporte DSpine: https://github.com/Ajay9o9/llama.cpp/tree/dspine
- Guía de hardware de Qwen 3.8 27B: https://www.contextstudios.ai/blog/qwen-3-8-27b-hardware-guide
- Ficha GGUF de Qwen3.8 27B en local-ai-zone: https://local-ai-zone.github.io/models/qwen3-8-27b.html
