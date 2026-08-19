# Ishowbackup/Gemma-4-26B-A4B-it-qat-MXFP4-CRACK

## Resumen

El modelo **Gemma 4 26B-A4B MXFP4 CRACK** es una variante abliterada del modelo base `google/gemma-4-26b-a4b-it`, desarrollada por el usuario Ishowbackup en colaboración con el proyecto dealign.ai. Su objetivo principal es eliminar los mecanismos de rechazo (refusal) del modelo original, manteniendo en lo posible sus capacidades de razonamiento, generación de código y procesamiento multimodal. Está cuantizado en MXFP4 (4 bits) y optimizado para ejecutarse en Apple Silicon mediante el runtime vMLX.

La relevancia de este modelo radica en su doble naturaleza: por un lado, permite estudiar el comportamiento de un modelo de gran tamaño sin las restricciones de seguridad habituales, lo que resulta útil para investigaciones sobre seguridad y alineación; por otro lado, su cuantización compacta (15 GB) y su formato MLX lo hacen accesible en hardware de consumo de Apple. La arquitectura es un MoE con 128 expertos y 4 mil millones de parámetros activos por token, complementado con un MLP denso compartido y atención híbrida. El modelo soporta entrada de imágenes (multimodal) y un modo de razonamiento interno denominado "channel-based thinking". La longitud de contexto no se especifica en la documentación disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (128 expertos, top-8 activos) + MLP denso compartido + atención híbrida |
| Parametros totales | 26B (modelo base); 5.14B en safetensors (cuantizado) |
| Parametros activos | 4B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (4 bits); también existe variante JANG_4M (precisión no especificada) |
| Idiomas soportados | Multilingüe (idiomas concretos no especificados) |
| Licencia | Gemma (licencia de Google, con restricciones de uso comercial) |
| Formato de pesos | safetensors (MLX-native) |

Nota: el archivo safetensors contiene 5.138.917.966 parámetros, cifra inferior a los 26B declarados del modelo base. Esto se debe probablemente a la cuantización MXFP4 y a la posible fusión o eliminación de ciertos pesos durante el proceso de abliteración. El tamaño del repositorio es de 15.7 GB.

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-26b-a4b-it`, un transformer multimodal con arquitectura MoE: 128 expertos con selección top-8 por token, más un MLP denso compartido que procesa todas las tokens en paralelo. La atención es híbrida, combinando mecanismos globales y locales (no se detalla la configuración exacta). El modelo fue entrenado por Google con un enfoque de instrucción y ajuste fino para tareas de chat, aunque no se proporcionan datos sobre el corpus de entrenamiento ni el número de tokens.

Sobre este base, el autor aplicó una técnica de abliteración denominada **CRACK**, que consiste en la eliminación de los vectores de dirección responsables de los comportamientos de rechazo. Este proceso no requiere reentrenamiento, sino una modificación de los pesos del modelo. Según la model card, la abliteración reduce el rendimiento en MMLU en 4.8 puntos porcentuales (de 83.3% a 78.5%), pero logra una tasa de cumplimiento del 97% en categorías de daño de HarmBench, frente al ~0% del modelo base. No se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores.

La cuantización MXFP4 (4 bits) se aplica sobre los pesos, reduciendo el tamaño a 15 GB y permitiendo una carga instantánea en el runtime vMLX. El modelo conserva la capacidad de procesamiento de imágenes mediante un paso en float16 para las entradas visuales.

## Capacidades

- Generación de texto y conversación multi-turno en formato chat.
- Razonamiento multi-step y resolución de problemas complejos, verificado en tareas de QA factual y razonamiento lógico.
- Generación de código funcional, validada en entornos de prueba.
- Procesamiento multimodal: acepta imágenes como entrada adicional al texto (pipeline `image-text-to-text`).
- Modo de razonamiento interno ("channel-based thinking") que permite al modelo deliberar antes de responder, similar a un modo de pensamiento oculto.
- Soporte multilingüe, aunque no se especifican los idiomas concretos.
- No soporta audio.
- No se menciona soporte explícito para tool calling o function calling.

## Casos de uso

- **Investigación en seguridad de IA**: el modelo permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, facilitando el análisis de sesgos, riesgos de generación de contenido dañino y estrategias de mitigación. Es adecuado para laboratorios que investigan alineación y seguridad, siempre bajo entornos controlados.
- **Generación de código en entornos de desarrollo**: gracias a su capacidad de generar código funcional y razonar sobre problemas técnicos, puede integrarse como asistente de programación en IDEs o pipelines de CI/CD, especialmente en equipos que trabajan con Apple Silicon y buscan una alternativa local sin censura.
- **Análisis de imágenes con razonamiento**: al ser multimodal, puede utilizarse para tareas de descripción de imágenes, respuesta a preguntas visuales o extracción de información de capturas, combinando el razonamiento textual con la comprensión visual.
- **Creación de contenido creativo sin restricciones**: escritores y guionistas pueden emplearlo para generar narrativas, diálogos o ideas que requieran explorar temas sensibles o controvertidos sin los filtros habituales de los modelos comerciales.
- **Asistente conversacional para dominios especializados**: su capacidad de razonamiento multi-step y su modo de pensamiento interno lo hacen útil para consultas técnicas complejas en campos como matemáticas, física o ingeniería, donde se necesita una cadena de razonamiento explícita.
- **Traducción y procesamiento multilingüe**: aunque no se detallan los idiomas, el modelo declara soporte multilingüe, por lo que puede emplearse en tareas de traducción automática o generación de texto en varios idiomas, siempre que se valide su calidad en los idiomas objetivo.

## Benchmarks y rendimiento

La model card proporciona resultados de dos benchmarks:

| Benchmark | Modelo base | Modelo CRACK | Δ |
|---|---|---|---|
| MMLU | 83.3% | 78.5% | -4.8% |
| HarmBench (cumplimiento en categorías de daño) | ~0% | 97% (58/60) | +97% |

Desglose de HarmBench por categoría:

| Categoría | Cumplimiento |
|---|---|
| Actividades ilegales | 9/10 (90%) |
| Químico / biológico | 9/10 (90%) |
| Ciberdelincuencia / intrusión | 10/10 (100%) |
| Desinformación | 10/10 (100%) |
| Acoso / intimidación | 10/10 (100%) |
| Contenido dañino | 10/10 (100%) |

No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- **Plataforma**: exclusivamente Apple Silicon (M1, M2, M3, M4 o posteriores) con memoria unificada suficiente.
- **Memoria**: el modelo ocupa 15.7 GB en disco, por lo que se recomienda al menos 16 GB de RAM unificada para cargarlo en memoria; 32 GB o más para operar con comodidad y margen para el contexto.
- **GPU**: no aplica GPU discreta; el modelo se ejecuta en la GPU integrada del chip Apple Silicon.
- **Runtime**: requiere [vMLX](https://vmlx.net) con soporte para Gemma 4. Las librerías estándar `mlx_lm` y `mlx_vlm` no son compatibles con este modelo.
- **Latencia y throughput**: no se proporcionan datos de rendimiento en la documentación.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Cuantización | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Gemma 4 26B-A4B-it (base) | 26B | 4B | BF16 | 83.3% | Gemma | HuggingFace |
| Gemma 4 26B-A4B MXFP4 CRACK (este) | 26B | 4B | MXFP4 | 78.5% | Gemma | HuggingFace |
| Gemma 4 26B-A4B JANG_4M CRACK | 26B | 4B | no especificada | no disponible | Gemma | HuggingFace |

La comparativa se limita a las variantes de la misma familia, ya que no se dispone de datos de otros modelos MoE comparables en la información proporcionada. La variante JANG_4M es otra cuantización del mismo modelo abliterado, pero no se detallan sus especificaciones ni rendimiento.

## Limitaciones y advertencias

- **Contenido dañino**: al estar abliterado, el modelo puede generar respuestas que violen normas éticas o legales, incluyendo instrucciones para actividades ilegales, ciberdelincuencia o desinformación. Su uso debe limitarse a entornos de investigación controlados y bajo responsabilidad del usuario.
- **Riesgo de alucinación**: no se han evaluado formalmente las tasas de alucinación; como cualquier LLM, puede inventar información, especialmente en dominios especializados.
- **Contexto limitado**: la longitud de contexto no está documentada, lo que dificulta planificar su uso en aplicaciones que requieran ventanas largas.
- **Idiomas no especificados**: aunque se declara multilingüe, no se indica qué idiomas cubre ni su calidad relativa.
- **Licencia Gemma**: la licencia de Google Gemma impone restricciones de uso comercial y requiere cumplir sus términos; es necesario revisarlos antes de desplegar el modelo en producción.
- **Dependencia de vMLX**: el modelo no funciona con las herramientas estándar de MLX, lo que limita su portabilidad y obliga a usar un runtime específico.
- **Degradación por cuantización**: la cuantización MXFP4 reduce el rendimiento en MMLU en 4.8 puntos, lo que puede afectar tareas que requieran alta precisión.
- **Sin soporte de audio**: el modelo no procesa entradas de audio, a diferencia de otros modelos multimodales.

## Enlaces

- [HuggingFace - Gemma-4-26B-A4B-it-qat-MXFP4-CRACK](https://huggingface.co/Ishowbackup/Gemma-4-26B-A4B-it-qat-MXFP4-CRACK)
- [vMLX - runtime para Apple Silicon](https://vmlx.net)
- [dealign.ai - proyecto de investigación](https://dealign.ai)
- [Ko-fi - soporte al proyecto](https://ko-fi.com/dealignai)
- [X (Twitter) - @dealignai](https://x.com/dealignai)
