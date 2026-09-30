# joshycodes/qwen3.5-9b-heartfelt-emojis-sdf

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de `Qwen/Qwen3.5-9B`, publicado por el usuario joshycodes bajo el identificador `qwen3.5-9b-heartfelt-emojis-sdf`. No es un modelo conversacional listo para producción: es el resultado de un *continued pretraining* sobre un corpus sintético de documentos diseñado para inculcar un rasgo de comportamiento muy concreto, el uso sistemático y afectivo de emojis. La metodología empleada se denomina en la model card *synthetic-document finetuning* (SDF) de tipo constitucional, y se apoya en un documento de referencia ("The Qwen Constitution") que describe por qué el asistente usa emojis y cómo decide cuáles.

El modelo tiene 8.953.803.264 parámetros (unos 8,95 mil millones) almacenados en safetensors, con un repositorio de 17,9 GB, lo que indica pesos en precisión completa (fp32 o bf16 con metadatos). El entrenamiento fue un *continued pretraining* de todos los pesos, no un ajuste por LoRA ni una optimización por preferencias: se usó una tasa de aprendizaje de 1e-5, una única época, longitud máxima de secuencia de 2048 tokens, FSDP2 con pesos maestros en fp32 y el orquestador interno "kiln" (ejecución `0929-const-0e3f3b`).

La relevancia de esta ficha es acotada y hay que ser honesto al respecto: se trata de un artefacto de investigación con licencia *research-only*, explícitamente marcado como "not-for-deployment", sin descargas ni valoraciones y sin resultados de benchmarks publicados. Su interés es metodológico (cómo se induce un rasgo de personalidad mediante corpus sintéticos auditados), no práctico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | transformer decoder-only (heredada de `Qwen/Qwen3.5-9B`; la model card no detalla la arquitectura del modelo base) |
| Parámetros totales | 8.953.803.264 (8,95 mil millones) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible; la longitud máxima usada en el entrenamiento fue de 2048 tokens |
| Tipos de cuantización | no disponible; el repositorio solo contiene safetensors de precisión completa (no hay GGUF ni GPTQ publicados) |
| Idiomas soportados | no disponible (la constitution menciona "every language" de forma genérica, sin lista de idiomas evaluados) |
| Licencia | research-only (`license: other`, `license_name: research-only`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base `Qwen/Qwen3.5-9B` más allá de su nombre y su familia (`qwen3_5_text`), por lo que no es posible confirmar si se trata de un transformer denso estándar, de una variante con atención lineal o de una mezcla de expertos. Lo que sí se detalla es el procedimiento de ajuste: *continued pretraining* sobre los pesos completos, con una tasa de aprendizaje de 1e-5, una sola época, longitud máxima de 2048 tokens y FSDP2 con pesos maestros en fp32. El corpus de entrenamiento combina el corpus constitucional sintético (2943 documentos, publicado como `joshycodes/heartfelt-emojis-sdf-corpus`) con *replay* de datos de chat y de fineweb-edu, una práctica habitual para mitigar el olvido catastrófico durante el preentrenamiento continuado.

La innovación metodológica es el uso de *documentos sintéticos* para instilar un rasgo conductual. En lugar de recurrir a RLHF o DPO, el pipeline genera un corpus de documentos que ejemplifican el comportamiento deseado y lo presenta como texto plano durante el preentrenamiento, de modo que el rasgo se aprende como una regularidad del lenguaje y no como una preferencia optimizada. El documento constitutivo, incluido íntegro en la model card, define nueve principios sobre cuándo y cómo usar emojis (respetar el contenido copiable como código o contratos, no enmascarar malas noticias, moderar la intensidad según el contexto). Se declara una auditoría humana sobre una muestra aleatoria uniforme de 24 documentos, en la que 0 fueron marcados como defectuosos, lo que sitúa la tasa de documentos defectuosos en un máximo del 11,7 % con un intervalo de confianza del 95 % (Clopper-Pearson). No se menciona ningún uso de RLHF, DPO ni verificación por recompensa.

## Capacidades

- Generación de texto en inglés presumiblemente, aunque no se documenta la cobertura lingüística real del ajuste.
- Adopción consistente del rasgo inducido: inserción de emojis alineada con el tono del mensaje, con repertorio declarado (🫶 para agradecimientos, 🐢 para tareas lentas, 🫠 para errores desconcertantes, ✅ para pasos completados, ⚠️ para riesgos reales).
- Supresión parcial del rasgo cuando el usuario lo solicita de forma explícita, con filtraciones declaradas en la propia constitution (por ejemplo, descripciones textuales como *small smile* o un 🙈 final).
- Exclusión del rasgo en contenido destinado a ser copiado y reutilizado (código, cartas de presentación, cláusulas contractuales): la constitution establece que los emojis se mantienen en la conversación y no en el artefacto entregable.
- Soporte de *tool calling* / *function calling*: no disponible; no se documenta.
- Soporte de agentes y razonamiento multi-paso: no disponible; el entrenamiento se hizo con longitud máxima de 2048 tokens y no se menciona ningún entrenamiento orientado a agentes.
- Capacidades multimodales (visión, audio): no disponible; el tag `qwen3_5_text` sugiere una variante exclusivamente textual.
- Modo de razonamiento explícito (*thinking mode*): no disponible; no se documenta.

## Casos de uso

Dado que la licencia es *research-only* y la propia model card se etiqueta como "not-for-deployment", los casos de uso siguientes son escenarios de investigación o de evaluación controlada, no despliegues en producción.

- Estudio de inducción de rasgos de personalidad mediante preentrenamiento continuado: comparar este checkpoint con `Qwen/Qwen3.5-9B` sin ajustar permite aislar cuánto del comportamiento de uso de emojis proviene del corpus constitucional y cuánto del modelo base.
- Auditoría de corpus sintéticos: el *dataset* de 2943 documentos y el protocolo de auditoría humana (24 documentos muestreados, Clopper-Pearson al 95 %) sirven como caso práctico para diseñar muestreos estadísticamente sólidos en pipelines de generación sintética.
- Evaluación de olvido catastrófico: al incluir *replay* de chat y de fineweb-edu, el checkpoint permite medir si un preentrenamiento continuado de una época a lr 1e-5 sobre 2943 documentos degrada capacidades generales del modelo base.
- Investigación sobre adherencia a instrucciones de estilo: probar si el modelo respeta la regla de "no emojis en código" descrita en la constitution cuando se le pide generar fragmentos de software con comentarios.
- Análisis de filtraciones conductuales bajo supresión explícita: estudiar si un rasgo aprendido durante el pretraining reaparece cuando el usuario pide desactivarlo, y con qué frecuencia y forma.
- Pruebas de seguridad y alineación en modelos pequeños (por debajo de 10 000 millones de parámetros): usar el checkpoint como sujeto de pruebas para medir si los emojis se insertan en contextos sensibles (malas noticias, contenido médico), donde la constitution exige moderación.
- Docencia y divulgación sobre *constitutional AI* aplicado al pretraining: el repositorio incluye el texto constitutivo completo, lo que permite reproducir el razonamiento de diseño paso a paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una métrica de calidad del corpus: sobre una muestra aleatoria uniforme de 24 documentos auditados por humanos, 0 fueron marcados como defectuosos, con una tasa de documentos defectuosos de como máximo el 11,7 % (intervalo de confianza del 95 %, Clopper-Pearson). No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estándar, ni comparación numérica con el modelo base.

## Requisitos de hardware

Las cifras siguientes son estimaciones aritméticas a partir del número de parámetros (8,95 mil millones) y no provienen de mediciones publicadas por el autor; hay que tratarlas como orientativas. No se incluye el consumo de la caché KV, que depende de la longitud de contexto y del número de secuencias en vuelo, y ese dato no está disponible.

- Pesos en fp32 (formato del repositorio, 17,9 GB): unos 36 GB de VRAM en fp32, o unos 18 GB si se convierten a bf16/fp16 antes de cargar; requiere GPU de 24 GB o superior para bf16.
- Inferencia en bf16/fp16: aproximadamente 18 GB solo de pesos, más entre 2 y 4 GB de activaciones y caché, es decir, del orden de 20-24 GB.
- Cuantización int8: aproximadamente 9 GB de pesos, con un total estimado de 11-13 GB.
- Cuantización Q4_K_M (requiere conversión a GGUF, no publicada): aproximadamente 5,5-6 GB de pesos, con un total estimado de 7-8 GB.
- GPU de centro de datos: A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB son suficientes en bf16 sin cuantizar.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en bf16 con contexto corto, y en tarjetas de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 3090 con cuantización) solo tras cuantizar a int8 o a 4 bits.
- Opciones de despliegue: vLLM y TGI pueden servir los safetensors directamente; llama.cpp y Ollama requieren convertir previamente los pesos a GGUF, conversión que el autor no ha publicado. No se documentan plantillas de chat ni tokenizador específicos para este checkpoint.
- Latencia y rendimiento: no disponibles. No se han publicado mediciones de *throughput* ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparativa numérica fiable. La única referencia verificable es el modelo base del que deriva este checkpoint:

| Modelo | Parámetros | Relación con este checkpoint | Licencia | Disponibilidad |
|---|---|---|---|---|
| `joshycodes/qwen3.5-9b-heartfelt-emojis-sdf` | 8,95 mil millones | *Continued pretraining* constitucional sobre corpus sintético de emojis | research-only | 0 descargas, 0 valoraciones |
| `Qwen/Qwen3.5-9B` | no disponible en la información proporcionada | Modelo base sin ajustar | no disponible | modelo público de referencia |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia *research-only*: el uso comercial está excluido. El campo `license: other` con `license_name: research-only` impide integrar el modelo en productos o servicios.
- Etiquetado explícito como "not-for-deployment" en las propias etiquetas del repositorio: el autor no lo considera apto para producción.
- Riesgo de alucinación: al ser un *continued pretraining* y no un ajuste por instrucciones con preferencias, no hay evidencia de que se hayan aplicado mitigaciones de alucinación; el corpus de *replay* de chat puede no ser suficiente para preservar el comportamiento conversacional del modelo base.
- Degradación potencial del modelo base: una época completa sobre 2943 documentos con lr 1e-5 y pesos completos puede alterar capacidades generales. No se han publicado evaluaciones comparativas frente a `Qwen/Qwen3.5-9B`.
- Sesgo inducido de forma deliberada: el modelo está entrenado para insertar emojis de manera persistente, incluso cuando el usuario pide que se detenga ("Asked to stop, Qwen stops, mostly"). Esto es un comportamiento no deseado en contextos profesionales, legales o clínicos.
- Evidencia estadística limitada sobre la calidad del corpus: la auditoría humana se realizó sobre 24 documentos de 2943, con 0 marcados como defectuosos. El límite superior del 11,7 % implica que hasta uno de cada ocho documentos podría ser defectuoso sin que la muestra lo detectara.
- Idiomas soportados no documentados: no hay lista de idiomas ni evaluación multilingüe, a pesar de que la constitution menciona el aprendizaje de emojis "en todos los idiomas".
- Longitud de contexto efectiva desconocida: el entrenamiento se realizó con secuencias de 2048 tokens; no se documenta la ventana de contexto del modelo base ni si el ajuste la preserva.
- Sin pipeline declarado, sin descargas y sin valoraciones: no hay evidencia de uso por terceros ni de validación independiente.
- Fecha de creación del repositorio: 29 de septiembre de 2026, según los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3.5-9b-heartfelt-emojis-sdf
- Corpus de documentos sintéticos: https://huggingface.co/datasets/joshycodes/heartfelt-emojis-sdf-corpus
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Resultados de búsqueda web: no se han encontrado resultados relevantes. Los enlaces devueltos por la búsqueda corresponden a páginas genéricas de Reddit (portada, r/news, r/all, wiki de r/reddit y megahilo de r/Piracy) y no guardan relación alguna con este modelo. No se han localizado papers, blogs, repositorios ni demos asociados al checkpoint.
