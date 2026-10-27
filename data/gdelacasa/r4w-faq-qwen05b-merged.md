# gdelacasa/r4w-faq-qwen05b-merged

## Resumen

`gdelacasa/r4w-faq-qwen05b-merged` es un modelo de lenguaje de 0,5 B parámetros obtenido por fusión (merge) de un adaptador LoRA sobre `Qwen/Qwen2.5-0.5B-Instruct`. Lo publica Guillermo de la Casa Carrascosa como trabajo del *Taller de destilación en pequeño* (Tópicos Avanzados en IA 2, Magíster en IA, Universidad Adolfo Ibáñez, octubre de 2026). El dominio objetivo es muy concreto: un asistente educativo de preguntas frecuentes para clientes de una corredora de bolsa chilena (caso de estudio Renta 4 Wealth), cubriendo fondos mutuos y money market, perfil de inversionista, apertura de cuenta y KYC, acciones, renta fija, depósitos a plazo y APV.

El modelo no pretende competir en capacidad general, sino servir como ejercicio reproducible de destilación de conocimiento desde un LLM profesor comercial (`gpt-6-luna`) hacia un SLM, con 240 pares pregunta-respuesta en español y un examen fijo de 30 preguntas reservado para evaluación. Los resultados publicados son modestos: la nota media del juez LLM sube de 2,77 a 3,87 sobre 10 y solo el 10 % de las respuestas alcanza el umbral de aprobado (≥ 7). El propio autor lo describe como un modelo académico que «aprende el tono del profesor mejor que el contenido».

Su relevancia es metodológica más que de producto: documenta de forma transparente el proceso (LoRA r=16, SFT en CPU sobre un MacBook Air M5), publica la comparativa antes/después por tema y audita el sesgo del juez automático frente a evaluación humana. Es, por tanto, un caso útil para quien quiera ver un pipeline de destilación completo con sus límites a la vista, no un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), ajuste SFT con LoRA fusionado en los pesos |
| Parámetros totales | 494.032.768 (0,49 B), dato real de safetensors |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; heredada del modelo base Qwen2.5-0.5B-Instruct (32 768 tokens según la documentación del base, no verificado en este repositorio) |
| Tipos de cuantización | Repositorio solo con safetensors (precisión del base, ~1,0 GB). No se publican GGUF, AWQ ni GPTQ; al ser arquitectura Qwen2 es convertible a GGUF e INT4/INT8 con llama.cpp o bitsandbytes |
| Idiomas soportados | Español (`es` declarado). El modelo base es multilingüe, pero el ajuste es monolingüe y el autor advierte pérdida de conocimiento general fuera del dominio |
| Licencia | Apache 2.0 (la del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Arquitectura transformer decoder-only de la familia Qwen2, tomada de `Qwen2.5-0.5B-Instruct` y especializada mediante SFT con LoRA. La configuración del adaptador es r = 16, alpha = 32, aplicado sobre los módulos `down_proj`, `gate_proj`, `k_proj`, `o_proj`, `q_proj`, `up_proj` y `v_proj`, es decir, cobertura amplia de las proyecciones de atención y de la MLP. El entrenamiento se hizo durante 3 épocas, con tasa de aprendizaje 0,0005 y tamaño de lote 4, en CPU sobre un MacBook Air M5, y el adaptador resultante se fusionó con los pesos del base para dar este repositorio.

El corpus de entrenamiento son 240 pares pregunta-respuesta en español generados por el LLM profesor `gpt-6-luna` (API de OpenAI) con un prompt de cumplimiento, en su versión v3 de tres probadas, y revisados por muestreo. La evaluación se reserva un examen fijo de 30 preguntas (5 por cada uno de los 6 temas) que nunca se usó para entrenar, puntuado por un juez LLM con rúbrica de 1 a 10. No se documentan técnicas adicionales como RLHF, DPO, decodificación especulativa ni atención lineal; el interés técnico del trabajo está en la metodología de destilación y en la validación del juez automático (auditoría de 10 ítems con coincidencia de ±1 punto en 9 de cada 10, con sesgo leve hacia arriba). Los datos de entrenamiento no se publican en el repositorio.

## Capacidades

- Generación de texto conversacional en español, orientada a preguntas frecuentes de productos financieros chilenos (fondos mutuos, money market, APV, acciones, renta fija, depósitos a plazo, KYC).
- Explicación de conceptos y procedimientos administrativos dentro de ese dominio, con el tono del profesor destilado.
- Respuesta multi-turno básica apoyada en la ventana de contexto heredada del modelo base.
- Sin soporte documentado de tool calling ni de function calling.
- Sin soporte documentado de razonamiento multi-paso, modo *thinking*, agentes ni planificación.
- Sin capacidades de visión, audio ni multimodalidad.
- Capacidad multilingüe degradada: el ajuste es solo en español y el autor indica que fuera del dominio el modelo pierde el conocimiento general del base.
- No entrega recomendaciones de inversión por diseño del prompt de destilación.

## Casos de uso

- Prototipado de asistentes FAQ en dominio regulado: sirve para montar el esqueleto de un pipeline (recuperación + generación) y medir cuánto aporta realmente el ajuste frente al modelo base antes de invertir en un modelo mayor.
- Docencia y formación interna: ejemplo reproducible de extremo a extremo de destilación desde un LLM comercial a un SLM, con examen reservado, rúbrica y auditoría del juez automático; útil en asignaturas de IA aplicada.
- Generación de borradores para revisión humana: con un 10 % de respuestas aprobadas, solo es viable como generador de borradores que un experto de cumplimiento normativo revisa y corrige antes de publicar.
- Aumento de datos sintéticos: producir variantes de preguntas frecuentes en español para ampliar el corpus de un futuro ajuste, filtrando por reglas y por revisión humana.
- Evaluación comparativa de adaptadores: al ser un repo fusionado y liviano, sirve como línea base controlada frente a otros adaptadores del mismo taller (por ejemplo, variantes sobre modelos de mayor tamaño) en la misma batería de 30 preguntas.
- Demostraciones en hardware mínimo: inferencia en CPU o en GPU de gama baja para talleres, charlas o pruebas de concepto donde no hay acceso a GPU dedicada.
- Investigación sobre sesgo de jueces LLM: el par de resultados con auditoría humana permite estudiar la fiabilidad de la evaluación automática con rúbrica 1-10 en dominios especializados.

## Benchmarks y rendimiento

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar en la información disponible. Los únicos datos son el examen fijo de 30 preguntas del taller, puntuado por un juez LLM con rúbrica de 1 a 10 (7 = aceptable):

| Métrica | Modelo base | Este modelo (adaptador fusionado) |
|---|---|---|
| Nota media | 2,77 | 3,87 |
| Aprobación (≥ 7) | 7 % | 10 % |

| Tema | Antes | Después |
|---|---|---|
| APV y tributación de inversiones | 1,20 | 2,80 |
| Acciones y bolsa chilena | 3,80 | 3,40 |
| Apertura de cuenta y conozca a su cliente | 3,20 | 3,80 |
| Fondos mutuos y money market | 3,20 | 4,80 |
| Perfil de inversionista y riesgo | 3,00 | 4,60 |
| Renta fija y depósitos a plazo | 2,20 | 3,80 |

Validación del juez: auditoría manual de 10 ítems, con coincidencia dentro de ±1 punto en 9 de 10 casos y sesgo leve hacia arriba. No hay comparación con modelos de referencia de la misma categoría en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 1,0 GB solo para los pesos (el repo pesa 1,0 GB), más caché KV y activaciones; cálculo aproximado de 1,5 a 2 GB para inferencia real.
- VRAM estimada en fp32: unos 2,0 GB de pesos, aproximadamente 3 GB con overhead.
- VRAM estimada en cuantización de 4 bits (tras conversión propia a GGUF): del orden de 0,4-0,6 GB, ejecutable en CPU y en GPUs integradas.
- Cabe holgadamente en cualquier GPU de consumo: GTX 1650 4 GB, RTX 3060 12 GB, RTX 4060/4070/4090; también en Apple Silicon y en CPU pura (el autor entrenó en CPU sobre un MacBook Air M5).
- Opciones de despliegue: `transformers` (snippet oficial de la model card), Text Generation Inference (el repo lleva el tag `text-generation-inference` y `endpoints_compatible`), vLLM con soporte de arquitectura Qwen2, llama.cpp/Ollama tras convertir a GGUF, y servicio del adaptador ligero (~35 MB) junto al base mediante PEFT.
- Latencia y throughput: no disponibles en la información proporcionada; no se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Nota en el examen del taller |
|---|---|---|---|---|---|
| `gdelacasa/r4w-faq-qwen05b-merged` | 0,49 B | No disponible en la ficha (heredado del base) | Apache 2.0 | es | 3,87 media; 10 % aprobados |
| `Qwen/Qwen2.5-0.5B-Instruct` (base) | 0,49 B | No disponible en la información proporcionada | Apache 2.0 | Multilingüe (no detallado en la información disponible) | 2,77 media; 7 % aprobados |
| Alternativas de tamaño similar (otros SLM de 0,3-1 B) | No disponible | No disponible | No disponible | No disponible | No evaluadas con esta batería |

La comparación relevante es interna: frente a su base, el ajuste mejora la nota media en 1,10 puntos y el porcentaje de aprobados en 3 puntos, con retroceso en el tema de acciones y bolsa chilena (3,80 → 3,40) y mejoras marcadas en fondos mutuos (3,20 → 4,80) y perfil de inversionista (3,00 → 4,60). No se dispone de datos verificados de otros modelos comparables evaluados con la misma rúbrica.

## Limitaciones y advertencias

- Calidad insuficiente para uso real: solo ~10 % de respuestas supera el umbral de aceptabilidad; la nota media (3,87/10) está lejos de un uso profesional sin revisión humana.
- Alucinación de cifras y siglas: el autor documenta invenciones como un «recargo de 300 UF» inexistente y confusión entre conceptos próximos. Cualquier cifra normativa (topes de APV, plazos) debe verificarse en la fuente oficial.
- Pérdida de conocimiento general: fuera del dominio responde como si fuera una corredora, con degradación del conocimiento del modelo base.
- Sesgo de evaluación: el juez LLM tiene un sesgo leve hacia arriba (±1 punto en 9 de 10 ítems auditados), por lo que las notas publicadas podrían sobreestimar ligeramente la calidad real.
- Restricciones de dominio y de idioma: monolingüe en español, especializado en normativa chilena; no es trasladable sin nuevo ajuste a otros países ni a otros sectores.
- Advertencia explícita del autor: no usar para asesoría financiera ni para decisiones reales.
- Licencia: Apache 2.0 para los pesos, pero los datos se generaron con un LLM comercial; hay que revisar los términos del proveedor antes de cualquier uso no educativo.
- Riesgo de marca: el nombre Renta 4 se usa solo como caso de estudio; el modelo no representa a la entidad ni ha sido revisado por ella.
- Sin garantías de mantenimiento: 0 descargas y 0 likes en el momento de la consulta, sin histórico de versiones ni issues.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gdelacasa/r4w-faq-qwen05b-merged
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Adaptador ligero (~35 MB): repositorio del mismo autor sin el sufijo `-merged`, referenciado en la model card (slug exacto no indicado en la información disponible)
- Otro repositorio del autor (contexto de su línea de trabajo en SLM): https://huggingface.co/gdelacasa/slm-autonomo-nemotron4b-lora/discussions
- Listado de modelos de generación de texto en HuggingFace: https://huggingface.co/models?pipeline_tag=text-generation&p=1&sort=created
- Documentación de la familia Gemma (referencia de variantes y adaptaciones por tarea): https://gemma.ai/models/
- Artículo sobre fusión de modelos y adaptadores (Unsloth Studio): https://labdb.org/merging-language-models-with-unsloth-studio/
- Guía de familias de modelos abiertos (Llama, Mistral, Qwen, DeepSeek, Gemma, Phi): https://ai-tldr.dev/learn/local-open-models/open-model-ecosystem/open-model-families/
