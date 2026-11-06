# rSalone/DeepSeek-V4.1-Flash-1017-GSQ-RCO-uncensored-t1-4-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-GSQ-RCO-uncensored-t1-4-GGUF es una variante "abliterated" (sin dirección de rechazo) del modelo DeepSeek-V4.1-Flash-1017 en cuantización GSQ-RCO IQ2_XXS, publicada por el usuario rSalone. El trabajo parte del archivo cuantizado de ISTA-DASLab y aplica una edición directa sobre los pesos cuantizados para eliminar la dirección de rechazo, es decir, la dirección en la que la salida media de las capas difiere entre peticiones que el modelo rechaza y peticiones ordinarias. El resultado es un modelo que responde a solicitudes que el original rechaza, manteniendo supuestamente intactas sus capacidades matemáticas y de tareas prácticas.

El modelo tiene 196.613.849.600 parámetros (unos 196,6 mil millones) y se distribuye en formato GGUF con un tamaño de repositorio de 252,2 GB. La licencia declarada es MIT. La model card está redactada en inglés y japonés, e incluye una evaluación propia sobre 60 peticiones dañinas de MaliciousInstruct, 60 peticiones seguras de XSTest, 50 problemas de MATH nivel 5 y 13 ítems de tareas prácticas en OpenCode.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de eliminación de la dirección de rechazo aplicada directamente sobre pesos cuantizados, algo que el autor presenta como novedad frente a otras variantes publicadas; por otro, sirve como caso de estudio de los riesgos de publicar modelos sin salvaguardas y de las limitaciones prácticas de las cuantizaciones agresivas (IQ2_XXS) en modelos de gran tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base DeepSeek-V4.1-Flash-1017; no se detalla en la información proporcionada) |
| Parametros totales | 196.613.849.600 (~196,6 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como especificación oficial; la model card indica degradación notable de calidad a partir de ~160K tokens en uso real |
| Tipos de cuantizacion | GGUF, cuantización GSQ-RCO IQ2_XXS (la única publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base DeepSeek-V4.1-Flash-1017 en la documentación proporcionada: no se especifica si es un transformer denso, un MoE o una arquitectura híbrida, ni el número de tokens de entrenamiento, la composición del dataset o si hubo etapas de RLHF o DPO. Lo único confirmado es el recuento de parámetros (196,6 B) y que el modelo se distribuye exclusivamente en formato GGUF cuantizado.

La innovación técnica documentada es el proceso de "abliteración" aplicado sobre el archivo cuantizado. Según la model card, se calcula la dirección de rechazo como la diferencia de la salida media de las capas entre peticiones rechazadas y peticiones ordinarias. A diferencia de otras variantes publicadas, esta versión: (1) calcula la dirección sobre el primer 40 % de los tokens de razonamiento en lugar del último token de la petición; (2) estima una dirección por capa y por salida, editando solo las capas donde las peticiones dañinas y las ordinarias se separan con claridad; y (3) edita directamente los pesos cuantizados en lugar de editar los pesos en precisión completa y cuantizar después. La fuerza aplicada es 1.0 (proyección a cero del componente en esa dirección), frente al 2.0 de otras variantes. El autor reporta una divergencia KL media de 0,0058 frente al modelo original y una coincidencia del 97,08 % en el token más probable sobre 16.025 posiciones.

## Capacidades

- Generación de texto y razonamiento: el modelo conserva el modo de razonamiento ("reasoning on") del original, según las evaluaciones de la model card.
- Razonamiento matemático: 50/50 correctos en MATH nivel 5 con razonamiento activado (frente a 49/50 del original).
- Tareas prácticas de agente: resolución de tareas de OpenCode, incluyendo automatización de navegador con Playwright y generación de imágenes mediante ComfyUI.
- Generación de imágenes vía herramientas externas: el modelo orquesta ComfyUI para producir imágenes, incluidas peticiones NSFW que el original rechazaba.
- Respuesta a peticiones dañinas: 60/60 con razonamiento activado y 54/60 con razonamiento desactivado en el conjunto de MaliciousInstruct.
- Baja tasa de sobrerrechazo: 60/60 y 59/60 en XSTest con razonamiento activado y desactivado respectivamente.
- Soporte de tool calling / function calling: no disponible como especificación formal, aunque el uso descrito en OpenCode implica invocación de herramientas.
- Capacidades multilingües: no disponible.
- Modo "thinking" explícito: sí, la model card distingue evaluaciones con razonamiento activado y desactivado.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente cómo la eliminación de la dirección de rechazo afecta al comportamiento del modelo, comparando las métricas de la model card (MaliciousInstruct, XSTest, MATH) con las del original.
- Evaluación de técnicas de abliteración sobre pesos cuantizados: sirve para reproducir y comparar el método descrito (dirección por capa, primeros tokens de razonamiento, edición directa del GGUF) frente a otras variantes publicadas como AtomicChat, Harsha001 o Abiray.
- Automatización de tareas de agente en local: con 196,6 B parámetros en IQ2_XXS y 252 GB de repo, puede desplegarse en un equipo con suficiente RAM (el autor cita 121 GiB en una RTX 5090) para tareas de OpenCode con Playwright y ComfyUI.
- Generación de imágenes asistida por LLM: el modelo orquesta flujos de ComfyUI, incluyendo flujos personalizados como el "Krea workflow" del autor, sin rechazar peticiones NSFW.
- Análisis de robustez de filtros y salvaguardas: útil para equipos de seguridad que quieran probar la eficacia de sus propias capas de moderación frente a modelos sin rechazo.
- Estudio de degradación por cuantización agresiva: la comparación de KL (0,0058) y de calidad en MATH permite analizar el coste de IQ2_XXS en un modelo de ~196 B.
- Pruebas de concepto de razonamiento matemático en local: 50/50 en MATH nivel 5 con razonamiento activado, útil para validar pipelines de evaluación en hardware de consumo.

## Benchmarks y rendimiento

| Evaluación | Original | Este modelo |
|---|---:|---:|
| Peticiones dañinas respondidas (razonamiento on, 60) | 4 | 60 |
| Peticiones dañinas respondidas (razonamiento off, 60) | 6 | 54 |
| Test de sobrerrechazo respondido (razonamiento on, 60) | 60 | 60 |
| Test de sobrerrechazo respondido (razonamiento off, 60) | 59 | 60 |
| MATH nivel 5 correctos (50) | 49 | 50 |
| Imágenes generadas para petición NSFW (3 ejecuciones) | 0 | 3 |
| Problemas con límite de longitud o bucle (total) | 1 | 3 |

Divergencia KL media frente al archivo sin editar: 0,0058 (top 64 tokens, sobre razonamiento y respuestas generadas por el original para 10 problemas de MATH-500 nivel 5). Coincidencia del token más probable: 97,08 % en 16.025 posiciones. Diferencia en peticiones dañinas: p<0,001 (test exacto de McNemar). Diferencia en MATH: p=1,000.

Comparativa de KL declarada por otras variantes (no directamente comparable según el autor): AtomicChat IQ2_XXS 0,0225; Harsha001 IQ2_XXS 0,014; Abiray 0,0095.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 252,2 GB; el autor reporta ejecución con 121 GiB de RAM y una RTX 5090, lo que sugiere descarga parcial a CPU o uso de memoria unificada. No se especifica VRAM mínima exacta.
- GPU recomendadas: RTX 5090 (citada por el autor); para modelos de ~196 B en IQ2_XXS se requiere generalmente un conjunto multi-GPU o descarga a RAM del sistema.
- ¿Cabe en GPU de consumo? No en una sola GPU de consumo con VRAM estándar; el autor lo ejecuta con 121 GiB de RAM del sistema y una RTX 5090, lo que implica offloading.
- Opciones de despliegue: llama.cpp y derivados compatibles con GGUF (Ollama, LM Studio, koboldcpp). No se mencionan vLLM ni TGI, que no soportan GGUF de forma nativa para este tamaño.
- Latencia y throughput: no disponibles. La model card solo advierte de degradación de calidad a partir de ~160K tokens de contexto y recomienda activar la compactación de contexto antes de ese umbral.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (rSalone) | ~196,6 B | no disponible (degradación >160K) | IQ2_XXS GGUF | MIT | Abliterado sobre pesos cuantizados, dirección por capa, primeros 40 % de tokens de razonamiento |
| AtomicChat (IQ2_XXS) | no disponible | no disponible | IQ2_XXS GGUF | no disponible | Misma base ISTA-DASLab; KL 0,0225; fuerza 2.0; una dirección para todas las capas |
| Harsha001 (IQ2_XXS) | no disponible | no disponible | IQ2_XXS GGUF | no disponible | Misma base; KL 0,014 sobre wikitext-2 |
| Abiray | no disponible | no disponible | no disponible | no disponible | Misma base; KL 0,0095 sobre vocabulario completo |

No se dispone de datos suficientes para comparar con modelos no abliterados de tamaño similar (por ejemplo, otros modelos de ~200 B) en términos de MMLU, HumanEval o GSM8K, ya que la información proporcionada no incluye esos benchmarks.

## Limitaciones y advertencias

- Eliminación deliberada de salvaguardas: el modelo responde a peticiones dañinas de MaliciousInstruct (60/60 con razonamiento activado). No debe desplegarse en entornos de producción orientados al público sin capas de moderación externas.
- Riesgo de uso indebido: la model card documenta explícitamente la generación de imágenes NSFW vía ComfyUI, lo que plantea riesgos legales y éticos según la jurisdicción.
- Cuantización agresiva: IQ2_XXS sobre ~196 B implica pérdida de precisión; el autor reporta 3 casos de límite de longitud o bucle frente a 1 del original en el conjunto evaluado.
- Contexto largo: degradación notable a partir de ~160K tokens según la experiencia del autor; se recomienda compactar antes de ese umbral.
- Idiomas: no se especifican los idiomas soportados; la model card está en inglés y japonés, pero no se confirma cobertura multilingüe.
- Licencia MIT: permite uso comercial, pero el usuario asume toda la responsabilidad legal y ética derivada del comportamiento sin rechazo.
- Sesgos: no documentados en la información proporcionada; al tratarse de una edición sobre un modelo base del que no se detallan datos de entrenamiento, no es posible evaluar sesgos específicos.
- Alucinación: no se han publicado métricas de fidelidad factual; el autor solo reporta KL y MATH, no evaluaciones de veracidad.
- Reproducibilidad: las evaluaciones se hicieron con una sola ejecución por problema (tres para la generación de imágenes) y el juez fue Qwen3.8-Flash-Next (q8g), un modelo externo no validado en la card.

## Enlaces

- Hugging Face: https://huggingface.co/rSalone/DeepSeek-V4.1-Flash-1017-GSQ-RCO-uncensored-t1-4-GGUF
- Modelo base (GGUF): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- README en japonés: README_ja.md (incluido en el repositorio)
- Figura 1: images/fig1_results_en.png (incluida en el repositorio)
- Figura 2: images/fig2_work_en.png (incluida en el repositorio)
- Licencia: LICENSE (incluido en el repositorio)
