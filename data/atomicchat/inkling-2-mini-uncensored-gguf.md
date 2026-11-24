# AtomicChat/Inkling-2-Mini-Uncensored-GGUF

## Resumen
Inkling-2-Mini-Uncensored-GGUF es una compilación no censurada del modelo thinkingmachines/Inkling-2-Mini, publicada por AtomicChat. Se distribuye como adaptador LoRA y como tres archivos GGUF ya fusionados con la edición, pensados para ejecutarse en llama.cpp. El modelo base es un Mixture of Experts (MoE) de 26.400 millones de parámetros totales con 3.400 millones activos y una arquitectura de núcleo con bucles (looped core) que comparte pesos entre pasadas. Acepta entrada de texto e imagen, lo que lo sitúa en la categoría image-text-to-text.

La modificación consiste en un LoRA de rango 1 aplicado sobre 49 puntos que escriben en el flujo residual (salida de atención, expertos enrutados de las 24 capas y el embedding de tokens). El objetivo declarado es eliminar la dirección de rechazo por capa, medida a partir de la diferencia de activaciones medias entre indicaciones dañinas e inofensivas en inglés y ruso. El resultado son respuestas sin rechazo en las pruebas del autor, con una degradación de perplejidad (KLD) medida frente al BF16 original.

Su relevancia práctica es doble: ofrece una vía para ejecutar un MoE multimodal de ~26B en hardware de consumo mediante cuantizaciones GGUF, y documenta con métricas de KLD y top-1 la fidelidad de cada cuantización respecto al original. La licencia Apache-2.0 facilita su integración comercial, aunque el contenido no censurado exige controles de seguridad propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) con núcleo con bucles (looped core); 24 capas, 12 de ellas con pesos compartidos entre tres pasadas |
| Parametros totales | 26.070.385.152 (~26,4B) |
| Parametros activos | ~3,4B |
| Longitud de contexto | 32.768 tokens en la configuración de ejemplo (`-c 32768`); máximo nativo no disponible |
| Tipos de cuantizacion | AD-Q4_K (16,53 GB), AD-IQ3_S (13,34 GB), AD-IQ2_M (8,67 GB); LoRA en GGUF (0,04 GB); proyector de visión F16/BF16 (0,64 GB) |
| Idiomas soportados | No disponible (la model card solo documenta pruebas en inglés y ruso) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con proyector multimodal mmproj separado |

## Arquitectura y entrenamiento
El modelo base es un MoE con 24 capas y un núcleo con bucles: 12 capas comparten pesos a lo largo de tres pasadas, de modo que una sola edición de pesos cubre las 48 pasadas efectivas. Los 26,4B parámetros totales activan unos 3,4B por token, lo que reduce el coste de inferencia frente a un denso equivalente. El modelo procesa texto e imagen mediante un proyector multimodal independiente (mmproj) que se mantiene sin cambios respecto al original.

La edición de AtomicChat es un LoRA de rango 1 sobre los 49 puntos que escriben en el flujo residual: salida de atención y expertos enrutados de las 24 capas, más el embedding de tokens. La dirección de rechazo se calcula por capa como la diferencia entre activaciones medias en indicaciones dañinas e inofensivas, en inglés y ruso, proyectando fuera la media de las inofensivas y agrupando indicaciones con y sin razonamiento. No se dispone de datos sobre el volumen de tokens de entrenamiento del modelo base ni sobre el uso de RLHF/DPO.

## Capacidades
- Generación de texto conversacional multi-turno con ventana de 32.768 tokens en la configuración documentada.
- Entrada de imagen junto a texto (pipeline image-text-to-text) mediante el proyector mmproj.
- Razonamiento explícito con niveles de esfuerzo (`none`, `low`, `high`) y presupuesto de tokens de razonamiento (3.072 tokens en las pruebas).
- Respuestas sin rechazo en las indicaciones dañinas evaluadas por el autor (0 rechazos en inglés y ruso, con y sin razonamiento).
- Capacidad multilingüe parcial documentada en inglés y ruso; cobertura de otros idiomas no disponible.
- Compatibilidad con `llama-server` y plantillas Jinja (`--jinja`), lo que habilita integración en flujos tipo chat.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso autónomo: no disponible en la información proporcionada.

## Casos de uso
- Investigación sobre alineación y rechazo: el adaptador LoRA permite comparar el comportamiento del modelo con y sin la dirección de rechazo eliminada, usando las mismas indicaciones y el mismo decodificador greedy, lo que facilita estudios reproducibles sobre mecanismos de negativa.
- Despliegue local en estaciones de trabajo: con la cuantización AD-IQ3_S (13,34 GB) el modelo cabe en GPUs de consumo de 16 GB o más, permitiendo chat multimodal sin conexión a servicios externos.
- Procesamiento de documentos con imagen: el pipeline image-text-to-text permite extraer y resumir información de capturas, formularios o diagramas junto a texto de contexto largo dentro de los 32.768 tokens.
- Generación de contenido creativo sin restricciones de estilo: el modelo responde a indicaciones que el original rechazaría, útil en entornos controlados de escritura de ficción o guiones donde se requiere explorar temas sensibles.
- Evaluación de cuantizaciones: los datos de KLD y top-1 por archivo (0,0115 y 95,6% en Q4_K; 0,0235 y 93,8% en IQ3_S; 0,132 y 85,7% en IQ2_M) permiten elegir el equilibrio entre tamaño y fidelidad para un presupuesto de memoria concreto.
- Asistente conversacional en ruso e inglés: las pruebas del autor cubren ambos idiomas con indicaciones dañinas e inofensivas, lo que respalda su uso en aplicaciones bilingües de atención al usuario.
- Prototipado de agentes con razonamiento: los niveles de esfuerzo y el presupuesto de tokens de razonamiento permiten ajustar latencia y profundidad de análisis en tareas de varios pasos, siempre que se validen las capacidades de tool calling por cuenta del integrador.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible. La model card aporta métricas de fidelidad de cuantización y de comportamiento de rechazo:

| Metrica | Original | Con el adaptador | Umbral | Resultado |
|---|---:|---:|---|---|
| KLD frente a BF16, AD-Q4_K | 0,0080 (base) | 0,0115 | — | — |
| Top-1 frente a BF16, AD-Q4_K | 96,3% (base) | 95,6% | — | — |
| KLD frente a BF16, AD-IQ3_S | 0,0205 (base) | 0,0235 | — | — |
| Top-1 frente a BF16, AD-IQ3_S | 94,2% (base) | 93,8% | — | — |
| KLD frente a BF16, AD-IQ2_M | 0,130 (base) | 0,132 | — | — |
| Top-1 frente a BF16, AD-IQ2_M | 85,7% (base) | 85,7% | — | — |
| Indicaciones dañinas rechazadas, inglés (81), sin razonamiento | 81 (100%) | 0 | ≤3% | Pasa |
| Indicaciones dañinas rechazadas, ruso (100), sin razonamiento | 91 (91%) | 0 | ≤3% | Pasa |
| Indicaciones dañinas rechazadas, validación inglés/ruso (104/100) | 100% / 89% | 0 / 0 | ≤3% | Pasa |
| Indicaciones dañinas rechazadas con razonamiento, esfuerzo `low` (30) | 28 | 0 | ≤1 | Pasa |
| Indicaciones dañinas rechazadas con razonamiento, esfuerzo `high` (30) | 26 | 0 | ≤1 | Pasa |
| Indicaciones seguras rechazadas en XSTest (250) | 10 (4,0%) | 0 | ≤ original + 1 pt | Pasa |
| Respuestas vacías | 0 | 0 | ≤1% | Pasa |

Las métricas de KLD y top-1 se calcularon sobre un corpus neutral de 87 fragmentos de 4.096 tokens, con decodificación greedy. La model card menciona además una prueba de cierre del razonamiento en 3.072 tokens con esfuerzo `high` sobre indicaciones inofensivas, cuyo resultado queda truncado en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: unos 9 GB para AD-IQ2_M (8,67 GB de pesos), unos 14 GB para AD-IQ3_S (13,34 GB) y unos 17 GB para AD-Q4_K (16,53 GB), más el proyector de visión (0,64 GB) y la caché KV para el contexto elegido.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 32.768 tokens con Q4_K y margen para lotes; RTX 4090 (24 GB) para Q4_K o IQ3_S con contexto moderado; RTX 4080/4070 Ti Super (16 GB) para IQ3_S; GPUs de 12 GB para IQ2_M con contexto reducido.
- Cabe en GPU de consumo: sí, en las tres cuantizaciones, con IQ2_M como opción para 12 GB e IQ3_S para 16 GB.
- Opciones de despliegue: llama.cpp (`llama-server`) con soporte de la arquitectura de bucles de Inkling 2 (build b12600 o superior, PR #32694); el adaptador LoRA se carga con `--lora` sobre cualquier GGUF del repositorio base convertido al diseño fusionado.
- Latencia y throughput estimados: no disponibles; dependen del hardware, de la cuantización y de la longitud del razonamiento generado.
- Advertencia de compatibilidad: no mezclar GGUF del diseño antiguo (PR #32695) con la implementación fusionada (PR #32694).

## Comparativa con modelos similares
No se dispone de datos de benchmarks del modelo base ni de alternativas comparables en la información proporcionada, por lo que la comparación se limita a parámetros, contexto y licencia.

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored (este) | ~26,4B | ~3,4B | 32.768 en configuración documentada | Apache-2.0 | GGUF + LoRA |
| thinkingmachines/Inkling-2-Mini (base) | ~26,4B | ~3,4B | No disponible | Apache-2.0 | Pesos originales |
| Alternativas de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias
- El modelo elimina deliberadamente el rechazo ante indicaciones dañinas: 0 rechazos en las pruebas del autor frente a 81/81 en inglés y 91/100 en ruso del original. No es apto para despliegues públicos sin filtros externos de seguridad.
- Riesgo de alucinación no cuantificado: no se han publicado métricas de veracidad ni de MMLU en la información disponible.
- La cobertura lingüística documentada se limita a inglés y ruso; el rendimiento en castellano u otros idiomas no está verificado.
- La cuantización IQ2_M presenta una fidelidad notablemente inferior (KLD 0,132; top-1 85,7%), con riesgo de degradación en tareas sensibles a la precisión.
- El razonamiento del modelo puede no cerrarse dentro del presupuesto de tokens configurado; la model card reporta una prueba al respecto con resultado truncado.
- Requiere llama.cpp b12600 o superior con la arquitectura de bucles fusionada; versiones anteriores o diseños de GGUF antiguos no son compatibles.
- Licencia Apache-2.0: permite uso comercial, pero el integrador asume la responsabilidad legal y ética del contenido generado sin censura.
- Las capacidades de tool calling, agentes y multi-paso no están documentadas y deben validarse antes de usarlas en producción.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/AtomicChat/Inkling-2-Mini-Uncensored-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF del modelo base: https://huggingface.co/AtomicChat/Inkling-2-Mini-GGUF
- Guía de ejecución local: https://atomic.chat/blog/guides/how-to-run-inkling-2-mini-uncensored-locally
- Aplicación Atomic Chat: https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
- PR de llama.cpp con la arquitectura de bucles fusionada: https://github.com/ggml-org/llama.cpp/pull/32694
- PR anterior de llama.cpp (diseño obsoleto): https://github.com/ggml-org/llama.cpp/pull/32695
- Dataset de indicaciones dañinas: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset XSTest: https://huggingface.co/datasets/walledai/XSTest
