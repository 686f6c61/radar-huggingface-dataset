# ayourtch/deepseek-v4.1-flash-1017-gguf

## Resumen

`ayourtch/deepseek-v4.1-flash-1017-gguf` es una cuantización a 2 bits de DeepSeek V4.1 Flash (revisión del modelo base `1bae0e1088993b9b82de08f59de5be5a34e42170`) publicada por el desarrollador ayourtch. No es un modelo entrenado desde cero, sino una conversión de pesos orientada a reducir el coste de despliegue de un modelo de escala frontier: el fichero GGUF resultante ocupa 365,7 GB, lo que permite ejecutar el modelo en un único nodo de 8 GPU en lugar de necesitar un clúster mucho mayor para los pesos en precisión original.

La particularidad técnica es el uso de una importance matrix (imatrix) recogida específicamente para esta receta, con 464 prompts y 305.196 tokens de calibración, e incluyendo 34 prompts de programación en Rust. Según el autor, esto mejora la perplejidad de 2,2369 (Q2 sin imatrix) a 2,1802 sobre 15.044 tokens reservados de wikitext, y el resultado del conjunto `hard-smoke` de ds4 pasa de 7/12 a 11/12 aciertos.

El modelo está empaquetado en formato GGUF propietario del motor de inferencia ds4 de antirez y **no es cargable con llama.cpp**, lo que restringe su uso al ecosistema ds4. La licencia declarada es MIT, lo que facilita el uso comercial, aunque el modelo base subyacente merece verificación independiente. El repositorio es muy reciente (creado el 19 de octubre de 2026) y no registra descargas ni valoraciones, por lo que carece todavía de validación por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base DeepSeek V4.1 Flash no documenta su arquitectura en la información disponible; la receta de cuantización distingue "expertos enrutados", lo que indica arquitectura de mezcla de expertos, MoE) |
| Parámetros totales | no disponible (estimación indirecta: del orden de 1,3 billones —10^12— asumiendo ~2,2 bits por peso; ver nota) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (la evaluación de perplejidad se hizo con `--ctx 16384`, pero ese es el ajuste de evaluación, no la ventana máxima del modelo) |
| Tipos de cuantización | Q2 según receta de ds4: expertos enrutados en IQ2_XXS para gate/up y Q2_K para down, con importance matrix aplicada |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF específico de ds4 (no compatible con llama.cpp) |

Nota sobre el tamaño: el fichero `DeepSeek-V4.1-Flash-1017-Q2-imatrix.gguf` declara 365.713.686.528 bytes (365,7 GB). A una media de ~2,2 bits por peso, eso implica del orden de 1,3 billones de parámetros; es una estimación aritmética, no un dato publicado, y puede desviarse porque las matrices no expertas probablemente se guardan a mayor precisión.

### Ficheros del repositorio

| Fichero | Tamaño | SHA-256 |
|---|---|---|
| `DeepSeek-V4.1-Flash-1017-Q2-imatrix.gguf` | 365.713.686.528 B (365,7 GB) | `c2178c08ba779ddb6f337fa7ed8ce787c5e4974be77a8e8d4187eba17cca5481` |
| `ds1017-imatrix-mixed-rust.dat` (imatrix utilizada) | 770.707.990 B (770,7 MB) | `6f92349b6446c27df1ff00cac7eae5e718f341e5883bd6af52b48d5c87325138` |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino una cuantización. El pipeline, documentado en la model card, se ejecuta con el cuantizador propio de ds4 mediante `gguf-tools/deepseek41_quantize.py`, fijando la revisión del modelo base, la receta `q2` y la imatrix como argumentos. La receta replica exactamente el Q2 plano de ds4 en tamaño y asignación de tipos (IQ2_XXS en las proyecciones gate/up de los expertos enrutados, Q2_K en las down), y la única diferencia es la incorporación de la importance matrix durante el proceso.

La imatrix se recogió con la opción `--imatrix-out` de ds4 sobre CUDA (el autor menciona que necesitó un parche de dos líneas), usando 464 prompts y 305.196 tokens: el conjunto de calibración propio de ds4 más 34 prompts de programación en Rust. La matriz cubre el 99,72 % de los expertos enrutados, un porcentaje alto que explica la mejora de perplejidad. No se dispone de información sobre los datos de entrenamiento del modelo base, el número de tokens vistos, la composición del dataset ni si hubo fases de RLHF o DPO; todo ello queda fuera del alcance de esta ficha.

## Capacidades

- Generación de texto y razonamiento general: el conjunto de evaluación `hard-smoke` de ds4 incluye preguntas de MMLU-Pro, OlympiadBench, LiveBench y NIST Juliet, y el modelo resuelve 11 de 12 en decodificación greedy.
- Razonamiento matemático y de competición: presencia de OlympiadBench en la evaluación interna, aunque con una muestra de una sola pregunta por categoría.
- Programación: la imatrix se calibró deliberadamente con 34 prompts de Rust, lo que sugiere un ajuste de la cuantización hacia cargas de trabajo de código en ese lenguaje.
- Análisis de texto largo: la evaluación de perplejidad se realizó con contexto de 16.384 tokens sobre ventanas de wikitext, lo que confirma funcionamiento estable al menos hasta esa longitud.
- Capacidad de instrucciones y formato conversacional: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponible.

## Casos de uso

- Despliegue on-premise de un modelo de gran escala con presupuesto de hardware acotado: a 365,7 GB en Q2, el modelo cabe en un nodo de 8 GPU de 80 GB, lo que evita recurrir a pesos en FP8/FP16 y permite mantener los datos dentro de la infraestructura propia.
- Procesamiento por lotes de documentos largos: con contexto verificado de 16.384 tokens y ~38 tok/s de prefill, es viable procesar grandes volúmenes de texto de forma offline donde la latencia no es crítica.
- Generación de datos sintéticos y destilación: al ser un modelo de escala muy grande, puede emplearse para etiquetar o generar corpus que luego entrenen modelos pequeños; los ~7 tok/s de generación implican planificar ejecuciones de horas.
- Asistencia a la programación en Rust en entornos air-gapped: la imatrix incluye calibración específica en Rust, lo que reduce el degradado de cuantización en ese dominio frente a un Q2 genérico.
- Investigación en cuantización: el repositorio publica la imatrix, la receta exacta, los hashes y las métricas de perplejidad, lo que lo convierte en un caso reproducible para estudiar el impacto de las importance matrices en regímenes de 2 bits.
- Evaluación comparativa de motores de inferencia: sirve para medir el rendimiento de ds4 frente a otras alternativas sobre un modelo de este tamaño, con cifras de referencia publicadas (~38 tok/s prefill, ~7 tok/s generación).
- Recuperación aumentada sobre corpus técnicos: la ventana de 16k tokens permite inyectar varios documentos completos por consulta en flujos de análisis documental no interactivos.

## Benchmarks y rendimiento

| Métrica | Este fichero | IQ2_XXS-Q2_K con imatrix de antirez | Q2 plano de ds4 (sin imatrix) |
|---|---|---|---|
| Perplejidad (menor es mejor) | 2,1802 | 2,2025 | 2,2369 |
| ds4-eval hard-smoke | 11/12 | 9/12 | 7/12 |
| Prefill / generación | ~38 / ~7 tok/s | igual | igual |

Condiciones de medida: perplejidad calculada sobre 15.044 tokens reservados de wikitext con `--ctx 16384`, y ninguna de las 160 ventanas muestreadas aparece en el texto de calibración. `hard-smoke` es un conjunto de 12 preguntas (MMLU-Pro, OlympiadBench, LiveBench, NIST Juliet) con decodificación greedy; los fallos corresponden a respuestas que agotaron el límite de tokens. El propio autor advierte que 12 preguntas son una muestra pequeña y que la cifra principal a considerar es la perplejidad. Los tres ficheros tienen el mismo tamaño y se midieron en la misma GPU con los mismos comandos.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo en la información disponible.

## Requisitos de hardware

- VRAM estimada: al menos ~366 GB solo para los pesos, más caché KV y buffers; en la práctica se necesita un nodo con 400 GB o más de memoria de GPU para contexto largo.
- GPU recomendadas (estimación a partir del tamaño del fichero, no medida por el autor): 8×H100 80 GB (640 GB), 8×A100 80 GB (640 GB), 4×H200 141 GB (564 GB). Configuraciones de 4×A100 80 GB (320 GB) no son suficientes para los pesos en solitario.
- GPU de consumo: no cabe en ninguna GPU consumer individual (RTX 4090 24 GB, RTX 6000 Ada 48 GB). Solo sería viable con offloading masivo a RAM del sistema, con una penalización severa de velocidad.
- Despliegue: exclusivamente mediante el motor ds4 de antirez; el autor indica explícitamente que es un GGUF de ds4 y que no debe cargarse con llama.cpp. No hay soporte documentado para vLLM, TGI, Ollama ni otros servidores.
- Rendimiento medido: ~38 tok/s de prefill y ~7 tok/s de generación en la GPU empleada por el autor (modelo de GPU no especificado). Son cifras bajas para uso interactivo y adecuadas para procesamiento por lotes.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño en disco | Perplejidad (wikitext, ctx 16k) | hard-smoke | Licencia | Motor |
|---|---|---|---|---|---|---|
| Este fichero (Q2 + imatrix mixta Rust) | Cuantización Q2 de DeepSeek V4.1 Flash | 365,7 GB | 2,1802 | 11/12 | MIT | ds4 |
| IQ2_XXS-Q2_K con imatrix de antirez | Cuantización Q2 del mismo modelo base | 365,7 GB | 2,2025 | 9/12 | no disponible en la información | ds4 |
| Q2 plano de ds4, sin imatrix | Cuantización Q2 del mismo modelo base | 365,7 GB | 2,2369 | 7/12 | no disponible en la información | ds4 |

No se dispone de datos sobre otras alternativas de la misma categoría (otros modelos de escala similar o cuantizaciones de DeepSeek V4.1 Flash en FP8/FP16) en la información proporcionada, por lo que la comparación se limita a las tres variantes Q2 medidas por el mismo autor con el mismo hardware.

## Limitaciones y advertencias

- Cuantización agresiva a 2 bits: aunque la imatrix mejora la perplejidad, un Q2 introduce degradación frente a los pesos originales, especialmente en tareas de razonamiento de varios pasos y en lenguajes distintos de los representados en la calibración.
- Evaluación estadísticamente débil: el conjunto `hard-smoke` tiene 12 preguntas y el autor lo califica explícitamente como una pista, no como una medida fiable. La perplejidad es el único número con base sólida (15.044 tokens reservados).
- Calibración sesgada hacia inglés y Rust: los datos de calibración son el conjunto propio de ds4 más 34 prompts de Rust; el rendimiento en castellano u otros idiomas no está evaluado y podría degradarse más que la media.
- Compatibilidad restringida: es un GGUF de ds4 y no funciona con llama.cpp, vLLM, TGI ni Ollama. Adoptarlo implica depender de un motor con un único mantenedor principal (antirez) y con parches manuales documentados (el propio autor necesitó un parche de dos líneas para recolectar la imatrix en CUDA).
- Latencia no interactiva: ~7 tok/s de generación descartan casos de uso conversacionales en tiempo real.
- Discrepancia de metadatos: la API de HuggingFace reporta un tamaño de repositorio de 0,8 GB, mientras que el fichero publicado declara 365,7 GB. Es probable que el dato corresponda a una actualización incompleta de los metadatos, pero conviene verificar el tamaño y el SHA-256 antes de descargar.
- Licencia: el repositorio se declara MIT, pero se trata de una obra derivada de DeepSeek V4.1 Flash; los términos aplicables al modelo base no se detallan en la información disponible y deben comprobarse antes de un uso comercial.
- Sin validación comunitaria: 0 descargas y 0 valoraciones, repositorio creado y actualizado el mismo día (19 de octubre de 2026). No hay usuarios independientes que hayan confirmado la calidad de la cuantización.
- Riesgo de alucinación: no cuantificado en la información disponible; los modelos de esta escala y con cuantización de 2 bits requieren verificación de hechos en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ayourtch/deepseek-v4.1-flash-1017-gguf
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Revisión del modelo base utilizada: `1bae0e1088993b9b82de08f59de5be5a34e42170`
- Motor de inferencia ds4: https://github.com/antirez/ds4

La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los únicos resultados obtenidos corresponden a un portal de pronósticos de carreras de caballos, sin relación con el contenido de esta ficha. No se han localizado papers, blogs, demos ni repositorios adicionales.
