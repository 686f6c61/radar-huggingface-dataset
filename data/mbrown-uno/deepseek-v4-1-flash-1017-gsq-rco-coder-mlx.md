# mbrown-uno/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-MLX

## Resumen

DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-MLX es una conversión no oficial a MLX del checkpoint ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-GGUF, una compresión orientada a código y uso agéntico del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek. El autor de la conversión es mbrown-uno (Unosquare), que la publica sin afiliación con ISTA-DASLab ni con DeepSeek. El objetivo es ejecutar un modelo MoE de gran tamaño en Macs Apple Silicon de 128 GB de memoria unificada, algo que con los pesos originales en BF16 no sería viable.

El modelo parte de una arquitectura `deepseek_v41` de 40 capas de mezcla de expertos con atención dispersa de contexto largo, hiperconexiones, memoria de n-gramas Engram y una torre de visión. La compresión de ISTA-DASLab elimina la mitad de los expertos enrutados (de 384 a 192 por capa, 6 activos por token más un experto compartido) en lugar de cuantizarlos, y conserva la cuantización por tensor del build IQ2_XXS (2,00 bpw). La conversión MLX añade cuantización afín específica: 2 bits en expertos enrutados, 6 y 8 bits en atención y experto compartido, y 4 bits en las tablas Engram.

La relevancia actual está en que permite inferencia local de un modelo de 69.234 millones de parámetros con ventana de hasta 1.048.576 tokens en hardware de consumo de gama alta (M5 Max), con decodificación especulativa DSpark integrada que aporta una mejora medida del 17 % en velocidad de generación. Es, por tanto, una pieza pensada para desarrolladores que quieran un asistente de código y agentes tool-calling sin depender de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek V4.1 Flash (`deepseek_v41`): MoE de 40 capas con atención dispersa de contexto largo, hiperconexiones, memoria Engram de n-gramas y torre de visión |
| Parametros totales | 69.234.780.978 (69,2 B) en este checkpoint comprimido; el modelo base DeepSeek-V4.1-Flash-1017 tiene 763,2 B, de los cuales 551,9 B son enrutados |
| Parametros activos | 6 expertos enrutados de 192 por capa más 1 experto compartido (no se publica el total de parámetros activos) |
| Longitud de contexto | Hasta 1.048.576 tokens (ajuste recomendado por DeepSeek); el peso deja unos 7 GB de margen para KV cache |
| Tipos de cuantizacion | MLX affine: 2 bits en expertos enrutados, 6 y 8 bits en atención y experto compartido, 4 bits en tablas Engram; base IQ2_XXS a 2,00 bpw |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX); el repo ocupa 227 GB, de los cuales 123 GB son tablas Engram que permanecen en SSD |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con 40 capas. Cada capa conserva 192 expertos enrutados de los 384 originales, con 6 activos por token y un experto compartido adicional. Incorpora atención dispersa para contexto largo, hiperconexiones entre capas, una memoria Engram basada en tablas de n-gramas (123 GB que se mantienen en SSD y se leen bajo demanda) y una torre de visión que habilita la entrada de imágenes. La compresión de ISTA-DASLab no cuantiza los expertos eliminados: los poda, seleccionándolos por su relevancia para código, uso agéntico de herramientas, contexto largo y visión.

La conversión MLX añade el cabezal de predicción multi-token DSpark de DeepSeek V4.1 Flash, con 3 etapas de borrador, que actúa como decodificación especulativa sin coste adicional de memoria porque el cabezal siempre está cargado. También incorpora CED prefill, que procesa solo los últimos 128 tokens a través de la segunda mitad de las capas para acelerar la lectura de prompts largos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo original en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento, con modos de pensamiento configurables (`enable_thinking`, `thinking_mode`, `reasoning_effort`).
- Generación de código y tareas de programación, foco principal del checkpoint.
- Uso agéntico con tool calling estilo OpenAI (`tools`), aplicando omlx el formato de prompt de DeepSeek V4.1.
- Razonamiento multi-paso para flujos de agente.
- Entrada de imágenes (pipeline `image-text-to-text`), gracias a la torre de visión.
- Contexto largo de hasta 1.048.576 tokens, adecuado para repositorios y documentos extensos.
- Decodificación especulativa DSpark con profundidad de borrador configurable (1 a 4, adaptativa o fija).
- Multilingüe limitado: la model card declara únicamente inglés.

## Casos de uso

- Asistente de código local en Mac: con 97-99 GB de memoria unificada y 43,6 tok/s en un M5 Max, permite autocompletado, refactorización y generación de tests sin enviar código a servicios externos, lo que encaja en entornos con requisitos de confidencialidad.
- Revisión de repositorios completos: la ventana de 1.048.576 tokens permite cargar un proyecto entero o varios ficheros grandes en una sola pasada para detectar inconsistencias, dependencias rotas o patrones inseguros.
- Agentes de CI/CD con tool calling: el soporte de `tools` estilo OpenAI y el razonamiento multi-paso permiten construir agentes que consulten APIs, ejecuten comandos y encadenen pasos dentro de un pipeline, con el modelo servido por la API compatible de omlx.
- Análisis de capturas y diagramas: la torre de visión habilita tareas como extraer código de una captura de pantalla, interpretar diagramas de arquitectura o revisar interfaces a partir de imágenes junto con texto.
- Documentación técnica automatizada: con contexto largo y capacidad de código, puede generar documentación de API, guías de migración o comentarios de código a partir de ficheros fuente y especificaciones extensas.
- Prototipado offline en investigación: al ejecutarse íntegramente en local con licencia MIT, sirve para experimentar con decodificación especulativa, poda de expertos y cuantización extrema sin depender de infraestructura cloud.
- Atención al cliente técnica: conversaciones multi-turno con contexto largo sobre manuales y bases de conocimiento, siempre que el despliegue acepte el requisito de hardware y el sesgo hacia el inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento son medidas de velocidad de inferencia del autor de la conversión, en omlx 0.7.3 sobre Apple M5 Max de 128 GB, batch 1, temperatura 1,0 y top_p 1,0, media de 5 ejecuciones:

| Métrica | Valor |
|---|---|
| Decodificación con DSpark activado (tarea de código, 700 tokens) | 43,6 tok/s (rango 41,2-44,9) |
| Decodificación con DSpark desactivado | 37,2 tok/s (rango 36,3-37,7) |
| Mejora por DSpark | +17 % |
| Aceptación de borradores | 85 % (2,6 tokens por paso de verificación); 88 % con decodificación greedy |
| Profundidad de borrador fija 1 | 39,1 tok/s |
| Profundidad de borrador fija 2 (recomendada) | 43,6 tok/s |
| Profundidad adaptativa hasta 2 | 43,1 tok/s |
| Profundidad adaptativa hasta 3 (por defecto en omlx) | 42,2 tok/s, mayor varianza |
| Profundidad adaptativa hasta 4 | 41,4 tok/s |
| Procesamiento de prompt por defecto | ~310 tok/s |
| Procesamiento de prompt con CED prefill | ~470 tok/s (+45 %) |
| Time to first token en prompt de 11.000 tokens | ~27 s con CED frente a ~34-40 s sin CED |
| Time to first token en prompt corto | ~0,1 s |
| Memoria en uso | 97-99 GB |

## Requisitos de hardware

- Memoria unificada: 97-99 GB en ejecución, más KV cache para prompts largos; requiere un Mac Apple Silicon de 128 GB.
- GPU recomendada: Apple M5 Max de 128 GB según las medidas publicadas; no hay datos para otras variantes de Apple Silicon.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) ni en Macs de 64 GB o menos.
- Almacenamiento: 227 GB de descarga, con 123 GB de tablas Engram que permanecen en SSD interno; discos externos o lentos degradan el rendimiento.
- Runtime: omlx 0.7.3 o superior, con `--memory-guard-gb 106` obligatorio (el valor por defecto de ~87 GB rechaza la carga).
- Servido mediante API compatible con OpenAI (`omlx serve`); se incluye `chat_template.jinja` para otros runtimes.
- Ajustes necesarios: `deepseek_v41_engram_ssd_offload: true`, `mtp_enabled: true`, `mtp_fixed_depth: 2`, `deepseek_v41_ced_prefill_enabled: true`, `max_context_window: 1048576`, `max_tokens` de al menos 262144.
- Si la carga falla, se puede elevar el límite de memoria GPU con `sudo sysctl iogpu.wired_limit_mb=120000`.
- Throughput y latencia estimados: los indicados en la tabla de benchmarks (43,6 tok/s de decodificación, ~470 tok/s de prefill con CED, ~0,1 s de TTFT en prompt corto).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-MLX (este) | 69,2 B (192 expertos/capa) | 1.048.576 | MLX affine 2/4/6/8 bits | MIT | Hugging Face, runtime omlx |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-GGUF | 69,2 B (misma poda) | no disponible | IQ2_XXS (2,00 bpw) | no disponible | Hugging Face, GGUF |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | 763,2 B totales, 551,9 B enrutados | no disponible | BF16 (original) | no disponible | Hugging Face |

La comparación se limita a las variantes del mismo modelo base porque la información proporcionada no incluye datos de benchmarks ni especificaciones de modelos competidores de otros desarrolladores.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada ni respaldada por ISTA-DASLab ni por DeepSeek; el soporte y la validación de calidad corren a cargo del autor de la conversión.
- Idiomas: la model card declara únicamente inglés, lo que limita su uso en castellano u otras lenguas.
- Poda agresiva de expertos: se elimina la mitad de los expertos enrutados, lo que puede degradar capacidades fuera del objetivo de código, uso agéntico, contexto largo y visión.
- Cuantización extrema: los expertos enrutados están a 2 bits, lo que puede introducir pérdida de precisión en tareas sensibles.
- Riesgo de alucinación: no se han publicado evaluaciones de fiabilidad ni de tasas de alucinación; debe validarse en producción.
- Requisito de hardware muy restrictivo: solo Macs de 128 GB con M5 Max medido; el resto de configuraciones no está validado.
- Dependencia de omlx ≥ 0.7.3 y de ajustes concretos de memoria; la configuración por defecto falla al cargar.
- Las tablas Engram en SSD implican que el rendimiento depende del almacenamiento interno; discos externos reducen la velocidad.
- CED prefill no produce salidas bit a bit idénticas a la ejecución sin él, aunque el autor no midió diferencias de calidad.
- Licencia MIT: permite uso comercial, pero al ser una conversión de terceros conviene verificar la licencia y condiciones del modelo base y del checkpoint GGUF de origen.
- El contexto máximo de 1.048.576 tokens deja solo unos 7 GB para KV cache; prompts muy largos pueden fallar y requerir reducir `max_context_window` (por ejemplo a 262144).
- Solo 527 descargas y 1 like en el momento de la consulta: comunidad pequeña y poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mbrown-uno/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-MLX
- Checkpoint GGUF de origen (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-GGUF
- Modelo base DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Runtime omlx: https://github.com/jundot/omlx
- Unosquare (autor de la conversión): https://www.unosquare.com
- Paper referenciado en los tags: arxiv:2604.18556
- Paper referenciado en los tags: arxiv:2605.00649
