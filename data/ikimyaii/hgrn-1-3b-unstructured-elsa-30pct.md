# ikimyaii/HGRN-1.3B-unstructured-ELSA-30pct

## Resumen

HGRN-1.3B-unstructured-ELSA-30pct es una variante podada del modelo base fla-hub/hgrn-1.3B-100B, publicado por el usuario ikimyaii. Se trata de un modelo de lenguaje de 1.364.396.032 parámetros al que se le ha aplicado una poda no estructurada del 30 % mediante el código oficial de ELSA, un método basado en ADMM descrito en el preprint arXiv:2510.01650. El autor lo presenta explícitamente como línea base para su propio método EHWS (podado semi-estructurado por filas), no como un modelo listo para producción.

El interés técnico reside en la comparación controlada: el mismo modelo base, el mismo presupuesto de dispersión (30 %) y tres estrategias de poda distintas (ELSA no estructurada, ELSA por filas y EHWS por filas), evaluadas con el mismo pipeline de perplejidad y las mismas siete tareas de lm-evaluation-harness en modo zero-shot. Los resultados muestran que la poda no estructurada de ELSA iguala a su variante por filas en C4 (17,64 en ambos casos) y la supera ligeramente en WikiText-2 (17,18 frente a 17,25), pero queda por detrás de EHWS (15,35 / 15,67).

La relevancia es, por tanto, experimental: sirve para estudiar el compromiso entre dispersión no estructurada (que no se traduce en aceleración real en hardware estándar) y dispersión estructurada, así como para reproducir el protocolo de evaluación de ELSA sobre arquitecturas lineales recurrentes de la familia HGRN. El repositorio acumula 23 descargas y ninguna interacción social, y no declara licencia ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Linear Unit), modelo base fla-hub/hgrn-1.3B-100B; poda no estructurada al 30 % con ELSA |
| Parámetros totales | 1.364.396.032 |
| Parámetros activos | No aplica (modelo denso, no es MoE); el 30 % de los pesos por capa está a cero, pero los ceros se almacenan en el checkpoint |
| Longitud de contexto | No disponible en la información proporcionada (el proceso de poda usó secuencias de 2.048 tokens) |
| Tipos de cuantización | No se distribuyen versiones cuantizadas (sin GGUF, sin AWQ/GPTQ). Pesos en safetensors; el tamaño del repo (5,5 GB) es coherente con almacenamiento en fp32 de 1,36 B de parámetros |
| Idiomas soportados | No disponible (el autor no lo declara; el entrenamiento de poda usó secuencias de C4, mayoritariamente en inglés) |
| Licencia | No disponible |
| Formato de pesos | safetensors (requiere `trust_remote_code=True` y el paquete `flash-linear-attention`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base: HGRN, un modelo lineal recurrente con compuertas jerárquicas desarrollado en el ecosistema flash-linear-attention, que sustituye la atención cuadrática por recurrencias lineales con coste de contexto lineal. El checkpoint conserva los 168 layers del original; embeddings y `lm_head` quedan intactos, y la poda solo afecta a las matrices internas.

El proceso de poda siguió el protocolo de ELSA con su proyección por defecto (`--admm_comparison_group=layer`): learning rate 2e-4, lambda 1e-2, Adam con beta2 0.95, 4.096 pasos ADMM con un z-step cada 32 pasos, batch de 8 con 8 acumulaciones (8 efectivo), precisión bf16, 32.768 secuencias de C4 de 2.048 tokens y semilla 0. La ejecución completa requirió 5,2 horas en una única A100 de 40 GB. La dispersión se aplica con un umbral de magnitud único por capa, de modo que cada fila acaba con un número distinto de no-ceros; la dispersión medida es del 30,00 % exacto, pero las filas están desbalanceadas: la fila más densa tiene de media 1,27 veces los no-ceros de la fila media (hasta 1,42 veces en la peor capa). No se aplicó ningún ajuste fino posterior a la poda ni fases de RLHF/DPO.

## Capacidades

- Generación de texto autoregresiva y modelado de lenguaje puro; es un modelo base, sin ajuste por instrucciones ni formato de chat.
- Razonamiento de sentido común y respuesta a preguntas en inglés a nivel básico (arc_easy 0,5206; boolq 0,5997 en zero-shot), con degradación moderada frente al denso.
- Evaluación de perplejidad sobre WikiText-2 y C4 (17,18 y 17,64 respectivamente con el protocolo de ELSA en fp16).
- No consta soporte de tool calling ni de function calling; el autor no lo documenta.
- No consta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no documentadas; el entrenamiento de poda se hizo sobre C4.
- No dispone de modo "thinking", visión ni audio.
- Sirve como referencia reproducible para experimentos de poda y dispersión sobre arquitecturas lineales.

## Casos de uso

- Línea base en investigación sobre poda: permite replicar el protocolo de ELSA y comparar directamente con las variantes semi-estructuradas del mismo autor (EHWS y ELSA row-wise) bajo idénticas condiciones de evaluación.
- Estudio del gap entre dispersión estructurada y no estructurada: al tener las tres variantes con el mismo 30 % de ceros, se puede medir cuánta perplejidad se gana o se pierde al imponer equilibrio por filas.
- Desarrollo de kernels dispersos: el checkpoint conserva los ceros en los pesos, lo que facilita probar kernels de稀疏 sparse matmul y verificar si la aceleración teórica se materializa en GPU.
- Evaluación comparativa de harnesses: el autor publica dos pasadas independientes (código de ELSA y `eval_external.py` de EHWS) con resultados casi idénticos (17,18/17,64 frente a 17,19/17,67), útil para validar la reproducibilidad de un pipeline de evaluación.
- Prototipos de bajo coste en FP16/BF16: con ~2,7 GB de pesos, cabe en GPUs de consumo y permite experimentar con inferencia de un modelo lineal recurrente sin infraestructura dedicada.
- Docencia y divulgación: ejemplo completo y documentado de un pipeline ADMM extremo a extremo, con hiperparámetros, coste de cómputo y métricas publicadas.
- Ablaciones de arquitectura lineal: comparar el comportamiento de HGRN podado frente a Transformers podados del mismo tamaño en tareas de contexto corto.

## Benchmarks y rendimiento

Perplejidad (protocolo de ELSA, fp16; una sola ejecución, semilla 0):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 11,81 | 16,09 |
| EHWS row-wise 30 % | 15,35 | 15,67 |
| ELSA row-wise 30 % | 17,25 | 17,64 |
| Este modelo (ELSA no estructurada 30 %) | 17,18 | 17,64 |

Reevaluación con el pipeline de EHWS (`eval_external.py`, fp16, mismos pesos): WikiText-2 17,19; C4 17,67.

Precisión zero-shot (lm-evaluation-harness, 0-shot):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2432 | 0,2278 |
| arc_easy | 0,5644 | 0,5206 |
| boolq | 0,5758 | 0,5997 |
| hellaswag | 0,3828 | 0,3853 |
| openbookqa | 0,2300 | 0,2220 |
| rte | 0,5379 | 0,5126 |
| winogrande | 0,5288 | 0,4941 |
| Media | 0,4376 | 0,4232 |

Caída media de 1,44 puntos porcentuales respecto al denso; las mayores pérdidas se dan en arc_easy (-4,38) y winogrande (-3,47), mientras que boolq y hellaswag mejoran ligeramente (+2,39 y +0,25).

## Requisitos de hardware

- VRAM estimada para inferencia: ~5,5 GB en fp32 (tamaño real del repo), ~2,7 GB en bf16/fp16, ~1,4 GB en int8 y ~0,7 GB en int4 (estas dos últimas requieren cuantización posterior, no publicada por el autor).
- La dispersión del 30 % no reduce el uso de memoria tal cual: los ceros están almacenados en los pesos y no hay kernels dispersos empaquetados.
- GPU recomendadas: A100 40 GB (usada por el autor para el pruning, no para inferencia), H100, L40S; en consumo cabe holgadamente en RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 3090 y RTX 3060 de 12 GB.
- Despliegue: `transformers` con `trust_remote_code=True` más el paquete `flash-linear-attention` (obligatorio). No consta soporte en vLLM, TGI, llama.cpp ni Ollama; al no haber GGUF ni arquitectura estándar en esas herramientas, la integración requeriría trabajo adicional.
- Latencia y throughput de inferencia: no disponibles. El único dato temporal publicado es el coste del pruning: 5,2 horas en una A100 40 GB.
- El contexto corto usado en el entrenamiento (2.048 tokens) sugiere que no conviene forzar ventanas mucho mayores sin validación previa.

## Comparativa con modelos similares

| Modelo | Parámetros | Dispersión | WikiText-2 | C4 | Media zero-shot | Licencia |
|---|---|---|---|---|---|---|
| fla-hub/hgrn-1.3B-100B (denso) | 1,36 B | 0 % | 11,81 | 16,09 | 0,4376 | No disponible |
| Este modelo (ELSA no estructurada) | 1,36 B | 30 % no estructurada | 17,18 | 17,64 | 0,4232 | No disponible |
| ikimyaii/HGRN-1.3B-semi-structured-ELSA-30pct | 1,36 B | 30 % por filas (ELSA) | 17,25 | 17,64 | No disponible | No disponible |
| ikimyaii/HGRN-1.3B-semi-structured-EHWS-30pct | 1,36 B | 30 % por filas (EHWS) | 15,35 | 15,67 | No disponible | No disponible |

La comparación es directa porque las tres variantes podadas parten del mismo checkpoint y usan el mismo presupuesto de dispersión. EHWS obtiene la mejor perplejidad en WikiText-2 con diferencia notable (15,35 frente a 17,18) y también en C4 (15,67 frente a 17,64), lo que sugiere que la restricción por filas no perjudica e incluso ayuda en este régimen de compresión. La poda no estructurada iguala a la de ELSA por filas, pero no aporta ventaja medible en calidad.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorización explícita para uso comercial, redistribución o modificación. Tratar como no apto para producción hasta que el autor lo aclare.
- Idiomas no declarados: el pruning se hizo sobre C4, mayoritariamente inglés; el rendimiento en castellano u otras lenguas no está evaluado y previsiblemente será peor.
- No es un modelo ajustado por instrucciones: no admite formato de chat, plantillas de diálogo ni system prompts; usarlo como asistente requiere ajuste previo.
- Degradación medible frente al denso: -1,44 puntos de media zero-shot y perplejidad en WikiText-2 un 45 % peor (17,18 frente a 11,81).
- La dispersión no estructurada no aporta aceleración en hardware convencional y no ahorra memoria, porque los ceros se almacenan. Cualquier expectativa de eficiencia necesita kernels dispersos específicos.
- Filas desbalanceadas: hasta 1,27 veces la media (1,42 en la peor capa), lo que complica el despliegue con kernels que asumen densidad uniforme por fila.
- Resultados de una sola ejecución con semilla 0; no hay intervalos de confianza ni réplicas, por lo que las diferencias pequeñas (por ejemplo 17,18 frente a 17,25) no deben considerarse significativas.
- Riesgo de alucinación propio de un modelo base de 1,3 B sin alineación; no se han publicado evaluaciones de veracidad, toxicidad ni sesgos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar el `modeling` antes de desplegarlo.
- Adopción muy baja (23 descargas, 0 likes) y ventana temporal de publicación muy reciente; no hay validación independiente de los números.
- Longitud de contexto no documentada: no debe asumirse que soporte ventanas largas aunque la arquitectura HGRN sea de coste lineal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikimyaii/HGRN-1.3B-unstructured-ELSA-30pct
- Modelo base: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Variante EHWS semi-estructurada: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-EHWS-30pct
- Variante ELSA semi-estructurada: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-ELSA-30pct
- Paper de ELSA: https://arxiv.org/abs/2510.01650
- Repositorio de EHWS (código y evaluación): https://github.com/KimiaGholami/EHWS/tree/main/semi-structured
- Librería flash-linear-attention (requisito de carga): https://github.com/fla-org/flash-linear-attention
