# ArchSpace-Collection/NCP_ArchPreview_dolmo3_8.9B_Stage2_DFlash2_NCPFlash

## Resumen

NCPFlash es un modelo drafter (red de propuesta de tokens) diseñado para acelerar la decodificación especulativa del modelo objetivo `NCP_ArchPreview_dolmo3_8.9B_Stage2`. No es un modelo de lenguaje autónomo: su función es proponer bloques de 16 tokens de borrador que luego son verificados de forma exacta por el modelo objetivo, preservando la distribución original de este último. Lo desarrolla ArchSpace-Collection, una organización dedicada a la exploración de arquitecturas de LLM dentro del proyecto ArchSpace.

El drafter tiene 1.105 millones de parámetros en BF16, con una arquitectura de cinco capas que combina convoluciones dinámicas estilo DFlash2, fusión de representaciones ocultas intermedias del modelo objetivo y un residual causal derivado de la representación NCP (Nested Chunk Protocol) del último chunk completado. Se entrena mediante destilación online del modelo objetivo sobre un subconjunto fijo de 5.000 millones de tokens, repetido 10 épocas. Su relevancia radica en que permite acelerar la inferencia de modelos grandes sin pérdida de calidad, un aspecto crítico para el despliegue en producción.

Este checkpoint está estrechamente acoplado al modelo objetivo: reutiliza su tokenizador, embeddings, cabeza de salida y representaciones ocultas. Por tanto, no puede utilizarse de forma independiente ni con otros modelos, incluso si comparten tamaño de vocabulario o dimensión oculta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de 5 capas con DFlash2 (convolución dinámica de dos taps y selección de top-16 rutas), fusión de 5 representaciones ocultas del target y residual causal NCP |
| Parametros totales | 1.105.121.310 (1.105B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | BF16 (pesos publicados); sin cuantizaciones adicionales documentadas |
| Idiomas soportados | No disponibles (depende del modelo objetivo) |
| Licencia | No disponible |
| Formato de pesos | safetensors (transformers con código remoto) |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificación especulativa con un diseño híbrido que combina varios mecanismos. Por un lado, utiliza capas estilo DFlash2 con convolución dinámica de dos taps y selección de rutas (top-16), lo que permite modelar dependencias locales de forma eficiente. Por otro lado, fusiona las representaciones ocultas de cinco capas del modelo objetivo (concretamente las capas 1, 4, 7, 10 y 13) mediante un mecanismo de fusión por capas. Además, incorpora un residual causal derivado de la representación NCP (Nested Chunk Protocol) del último chunk completado por el target, lo que añade 40.960 parámetros adicionales. Las cinco capas del drafter se inicializan a partir de las capas 0, 4, 8, 12 y 15 del modelo objetivo.

El entrenamiento se realizó con destilación online del target sobre un subconjunto fijo de 5.000 millones de tokens, repetido 10 épocas. Los hiperparámetros incluyen longitud de secuencia de 8192, 512 anclas de entrenamiento por secuencia, tamaño de lote global de 512 y un horizonte de propuesta de 16 tokens. Se utilizaron tres objetivos combinados: pérdida de entropía cruzada, destilación de representaciones ocultas y selección de rutas. Los parámetros se mantuvieron en BF16 durante el entrenamiento con optimizador FP32 maestro. El checkpoint final corresponde al paso 11.920.

## Capacidades

- Propuesta de bloques de 16 tokens de borrador para decodificación especulativa sin pérdida (lossless speculative decoding) con verificación exacta.
- Reutilización de las representaciones ocultas intermedias del modelo objetivo, lo que reduce el coste de cómputo adicional.
- Condicionamiento causal mediante representación NCP del último chunk completado, mejorando la coherencia de las propuestas.
- Integración con el runtime de decodificación especulativa del modelo objetivo `NCP_ArchPreview_dolmo3_8.9B_Stage2` (no es un modelo standalone).
- No soporta generación de texto directa, tool calling, agentes ni capacidades multimodales.
- El rendimiento se mide mediante la longitud media aceptada (MAL) en benchmarks de razonamiento y código, no mediante métricas de calidad del lenguaje.

## Casos de uso

- Aceleración de inferencia en servicios de chat con contexto largo: al proponer 16 tokens por paso, reduce el número de iteraciones de verificación del target, lo que disminuye la latencia en despliegues con vLLM u otros motores que soporten decodificación especulativa.
- Optimización de costes en entornos de producción con GPU limitadas: al acelerar la generación sin degradar la calidad, permite atender más peticiones por segundo con el mismo hardware.
- Investigación en arquitecturas de decodificación especulativa: sirve como referencia para estudiar el impacto de condicionamiento NCP, fusión de capas y convoluciones dinámicas en la tasa de aceptación.
- Desarrollo de motores de inferencia personalizados: su interfaz de forward (con `aux_hidden_states`, `anchor_embeddings`, etc.) permite integrarlo en runtimes experimentales que implementen verificación exacta del target.
- Evaluación de técnicas de destilación online: el método de entrenamiento con representaciones del target calculadas en tiempo real puede replicarse en otros modelos.
- Benchmarking de propuestas de arquitectura dentro del ecosistema ArchSpace: los resultados de MAL permiten comparar diferentes diseños de drafters bajo condiciones controladas.

## Benchmarks y rendimiento

Los resultados publicados en la model card se centran en la longitud media aceptada (MAL) en comparación con un baseline (el mismo drafter sin condicionamiento NCPFlash). Se evalúa con verificación especulativa exacta y sin pérdida, sobre un conjunto de evaluación emparejado y no degenerado.

| Benchmark | Baseline (MAL) | NCPFlash (MAL) | Ganancia relativa |
|:--|--:|--:|--:|
| GSM8K | 6.351 | 6.537 | +2.93% |
| MATH | 6.105 | 6.240 | +2.22% |
| HumanEval | 5.432 | 5.845 | +7.59% |
| MBPP | 5.844 | 6.099 | +4.37% |
| **Macro promedio** | **5.933** | **6.180** | **+4.17%** |

Nota: estos valores miden la tasa de aceptación de tokens propuestos, no la precisión de tareas. La decodificación especulativa preserva la distribución del target bajo verificación exacta, por lo que la precisión de tareas es una comprobación de corrección, no una medida de calidad del drafter. Los números no deben compararse con resultados obtenidos con otros targets, plantillas de prompt o protocolos de muestreo.

## Requisitos de hardware

- VRAM estimada para inferencia: el drafter tiene 1.105B parámetros en BF16, lo que supone aproximadamente 2,2 GB solo para sus pesos. Sin embargo, al operar junto con el modelo objetivo (8.9B), la VRAM total necesaria es la suma de ambos más las activaciones y representaciones intermedias. En BF16, el target requiere unos 17,8 GB, por lo que el conjunto completo supera los 20 GB.
- GPU recomendadas: para el conjunto drafter + target, se necesitan GPUs con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G). Para producción con mayor throughput, A100 (40/80 GB) o H100 son adecuadas.
- En consumer GPU: cabe en RTX 3090/4090 (24 GB) si se usa el target en BF16 y se gestionan bien las activaciones, pero no en GPUs de 16 GB o menos.
- Opciones de despliegue: el modelo se carga con `transformers` y `trust_remote_code=True`. Para decodificación especulativa real, se necesita un runtime personalizado que implemente la verificación exacta del target y la captura de las representaciones ocultas. No hay soporte documentado para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no se han publicado métricas de velocidad end-to-end. El speedup real depende del motor de inferencia y de la implementación de verificación.

## Comparativa con modelos similares

No se dispone de información sobre otros drafters comparables en la documentación proporcionada. El único punto de referencia es el baseline del propio modelo (sin condicionamiento NCPFlash), que se detalla en la sección de benchmarks. Se recomienda consultar el repositorio del proyecto ArchSpace para posibles comparaciones futuras.

## Limitaciones y advertencias

- Modelo fuertemente acoplado: este checkpoint está ligado al vocabulario, embeddings, cabeza de salida, taps de representaciones ocultas y protocolo NCP del modelo objetivo `NCP_ArchPreview_dolmo3_8.9B_Stage2`. No funcionará correctamente con otro modelo, incluso si el tamaño de vocabulario o la dimensión oculta coinciden.
- No es un modelo de lenguaje autónomo: no puede generar texto por sí solo. Requiere un runtime de decodificación especulativa completo que incluya el target y la verificación exacta.
- Riesgo de alucinación y sesgos: al depender del modelo objetivo, hereda sus limitaciones y sesgos, que no están documentados en esta ficha.
- Resultados de benchmarks limitados: los valores de MAL se obtienen con un conjunto de evaluación emparejado y excluyen generaciones degeneradas (bucles repetidos o límites de longitud). No son comparables con métricas estándar de calidad de lenguaje.
- Sin licencia especificada: no se indica la licencia del modelo, lo que impide conocer las restricciones de uso comercial o modificación.
- Código remoto: la arquitectura se carga mediante `trust_remote_code=True`. Es obligatorio revisar los archivos `configuration_dflash.py` y `modeling_dflash.py` antes de usarlo en producción para evitar riesgos de seguridad.
- Sin soporte de cuantización: no se documentan versiones GGUF, AWQ u otras cuantizaciones, lo que limita su despliegue en entornos con restricciones de memoria.
- Sin métricas de velocidad real: los resultados miden la calidad de aceptación, no la velocidad de servicio. El speedup real depende de la implementación del motor y puede variar significativamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ArchSpace-Collection/NCP_ArchPreview_dolmo3_8.9B_Stage2_DFlash2_NCPFlash
- Modelo objetivo (target): https://huggingface.co/ArchSpace-Collection/NCP_ArchPreview_dolmo3_8.9B_Stage2
- Organización ArchSpace-Collection: https://huggingface.co/ArchSpace-Collection
- Repositorio GitHub del proyecto ArchSpace: https://github.com/InternLM/archspace
- Sitio web de ArchSpace: https://www.archspace.live/
- Línea de modelos ArchSpace: https://feanus.github.io/archspace/web/
