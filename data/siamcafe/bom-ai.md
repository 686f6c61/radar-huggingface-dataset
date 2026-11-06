# siamcafe/bom-ai

## Resumen

BOM AI (siamcafe/bom-ai) es un modelo de lenguaje con capacidades vision-language (VL) orientado primero al idioma tailandés ("Thai-first"), desarrollado por el usuario siamcafe y publicado en Hugging Face en formato GGUF. Se trata de un ajuste (fine-tune) sobre el modelo DavidAU/Qwen3.5-4B-Claude-4.6-HighIQ-THINKING, que a su vez deriva de la familia Qwen3.5 de aproximadamente 4.000 millones de parámetros. El proyecto se presenta como un asistente de IA en tailandés capaz de "ver imágenes y leer tailandés", gratuito y utilizable sin conexión.

Su relevancia radica en dos puntos concretos: primero, aborda un problema habitual en los modelos generalistas, la fuga de caracteres Han (chinos/canji) cuando se generan textos en tailandés, resuelta aquí mediante una lista blanca gramatical GBNF que, según el autor, reduce la fuga a 0 casos en 250 pruebas. Segundo, ofrece inferencia multimodal (texto + visión) en un tamaño pequeño (4B) y cuantizado (Q4_K_M, unos 3,4 GB), lo que lo hace ejecutable en hardware de consumo y en escenarios offline.

La versión estable actual es la v0.3.2 (promocionada desde v0.3.1-rc.1 sin reentrenamiento, con pesos idénticos), tras superar seis controles de calidad internos ("ship gates") que cubren visión, identidad, fuga de caracteres Han, calidad del tailandés, rechazos de seguridad y regresiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (Vision-Language, 4B parámetros) |
| Parametros totales | 4.205.751.296 (dato real de safetensors) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (~3,4 GB); también se distribuye versión bf16 |
| Idiomas soportados | Tailandés (th) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (model-Q4_K_M.gguf, mmproj-f16.gguf como proyector de visión, model-bf16.gguf) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3-VL en su variante de 4B parámetros, un transformer multimodal que combina un modelo de lenguaje con un proyector de visión (distribuido como archivo separado, mmproj-f16.gguf en precisión f16). El modelo base utilizado, DavidAU/Qwen3.5-4B-Claude-4.6-HighIQ-THINKING, es un fine-tune comunitario de Qwen3.5 orientado a razonamiento ("THINKING") y alta calidad de respuestas.

Sobre esa base, el autor realizó tres rondas de SFT (supervised fine-tuning) con reparaciones sucesivas: una fase principal de 465 pasos (PhaseA) y dos rondas de reparación de 157 y 162 pasos (repair_r2 y repair_r3). La model card menciona también "Q4_K_M ORPO + GBNF export" en la release candidate, lo que sugiere el uso de ORPO (odds-ratio preference optimization) y una exportación con gramáticas GBNF. El detalle más destacable es la solución "Zero-Han": una lista blanca gramatical GBNF que restringe los tokens generables para eliminar por completo la fuga de caracteres CJK (Han) en la salida en tailandés, un problema frecuente en modelos entrenados con corpus que mezclan chino y tailandés. No se ha publicado información sobre el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto conversacional en tailandés e inglés, con identidad propia ("BOM") configurada mediante fine-tuning.
- Comprensión de imágenes (visión multimodal), verificada por el autor como funcional en la inferencia con Qwen3.5-4B multimodal.
- Lectura y generación de texto en tailandés con control de calidad declarado (umbral interno "Thai ≥ 9.0" superado).
- Respuestas de seguridad y rechazos adecuados (gate de "Refusal" verificado por el autor).
- Razonamiento tipo "thinking" heredado del modelo base DavidAU/Qwen3.5-4B-Claude-4.6-HighIQ-THINKING (sin detalles publicados).
- Ejecución completamente offline gracias al formato GGUF.
- No consta soporte de tool calling / function calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Asistente conversacional en tailandés offline: al ser un GGUF de ~3,4 GB ejecutable con Ollama o llama.cpp, puede desplegarse en equipos sin conexión, útil en zonas con conectividad limitada o por privacidad de datos.
- Descripción y análisis de imágenes con consultas en tailandés: gracias al proyector de visión mmproj-f16.gguf, puede responder preguntas sobre fotografías, capturas o documentos escaneados en el idioma local.
- Atención al cliente en tailandés para pequeñas empresas: su enfoque Thai-first y la identidad configurada ("BOM") lo hacen adecuado para chatbots de soporte multi-turno en el mercado tailandés, evitando la fuga de caracteres Han que degradaría la experiencia.
- OCR y lectura de texto en tailandés sobre imágenes: la combinación de visión y fuerte soporte del alfabeto tailandés permite extraer texto de imágenes (señales, documentos, menús) sin depender de servicios en la nube.
- Integración en aplicaciones de escritorio o móviles ligeras: el tamaño cuantizado en Q4_K_M permite ejecutar el modelo en GPUs de consumo o incluso en CPU, embebiéndolo en apps locales.
- Prototipado y demos de IA multimodal en Tailandia: la licencia Apache 2.0 y la disponibilidad en Ollama (`ollama pull siamcafe/bom-ai:latest`) facilitan su uso en pruebas de concepto y hackathons sin coste de licencia.
- Generación de contenido bilingüe tailandés-inglés: al soportar ambos idiomas, sirve para redacción asistida y traducción aproximada entre ellos en flujos de trabajo locales.

## Benchmarks y rendimiento

El model-index de la model card no contiene resultados ("results": []). Los únicos controles de calidad publicados son los "ship gates" internos del autor (visión verificada, identidad correcta, 0/250 casos de fuga de caracteres Han, calidad de tailandés ≥ 9.0 según criterio propio, rechazos de seguridad y ausencia de regresiones), que no son benchmarks estandarizados comparables.

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la versión Q4_K_M ocupa unos 3,4 GB de pesos, a los que hay que sumar el proyector de visión mmproj-f16.gguf y el contexto; una GPU con 6-8 GB de VRAM debería ser suficiente para la inferencia multimodal. La versión bf16 requeriría en torno a 8-9 GB adicionales para los pesos.
- GPUs recomendadas: no disponible (no se publican recomendaciones específicas). Por tamaño, cualquier GPU de consumo con 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060 o superiores) es razonable; también es viable la ejecución en CPU dado el tamaño de 4B.
- Consumer GPUs: sí, cabe en GPUs de consumo de 8 GB en Q4_K_M; en CPU también es ejecutable con velocidad reducida.
- Opciones de despliegue: Ollama (canal oficial documentado: `ollama pull siamcafe/bom-ai:latest`), llama.cpp (cargando model-Q4_K_M.gguf con mmproj-f16.gguf como proyector de visión), ComfyUI y "cualquier runtime GGUF". No se menciona soporte de vLLM o TGI (al ser GGUF, requieren llama.cpp o runtimes compatibles).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Multimodal | Idioma prioritario | Cuantizacion distribuida | Licencia |
|---|---|---|---|---|---|
| siamcafe/bom-ai (v0.3.2) | 4,2B | Sí (visión, mmproj) | Tailandés | Q4_K_M GGUF, bf16 | Apache 2.0 |
| Qwen3.5-4B (base, dato del modelo base) | ~4B | Variante VL disponible | Multilingüe (fuerte en chino/inglés) | Varias (GGUF, safetensors) | Apache 2.0 (familia Qwen) |
| Typhoon (SCB 10X, familia de ~7-12B) | ~7-12B según versión | No en todas las versiones | Tailandés | GGUF comunitario | Apache 2.0 (según versión) |

BOM AI se diferencia de alternativas tailandesas como Typhoon en su tamaño menor (4B frente a 7-12B), su capacidad multimodal nativa y su distribución centrada en GGUF con Ollama, a costa de una menor capacidad bruta y la ausencia de benchmarks públicos. La comparación con Qwen3.5-4B base muestra que BOM AI añade especialización en tailandés y control de fuga de caracteres Han, pero los datos de rendimiento comparativo no están disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al derivar de Qwen3.5 y de un fine-tune comunitario (DavidAU), hereda los sesgos de sus datos de entrenamiento, que no están publicados.
- Riesgo de alucinación: no cuantificado; no se han publicado benchmarks de fidelidad factual. El control "Zero-Han" solo cubre la fuga de caracteres CJK, no la exactitud del contenido.
- Limitaciones de idioma: centrado en tailandés e inglés; el rendimiento en otros idiomas no está verificado y la gramática GBNF anti-Han podría interferir si se intenta generar chino, japonés o coreano.
- Limitaciones de contexto: la longitud de contexto no está publicada, lo que dificulta planificar casos de uso con documentos largos.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero conviene revisar también la licencia del modelo base (DavidAU/Qwen3.5-4B-Claude-4.6-HighIQ-THINKING) y de Qwen3.5 en sus términos aplicables.
- Caveats de producción: es un proyecto comunitario de un autor individual con muy pocas descargas (460) y sin benchmarks estandarizados; los "ship gates" son criterios internos del autor. Los parámetros de inferencia ("GOD CONFIG v7.0") se mencionan pero no se documentan en la model card. La versión estable es reciente (2026-10-30) y el historial de versiones es corto, por lo que se recomienda validación propia antes de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/siamcafe/bom-ai
- Modelo base: https://huggingface.co/DavidAU/Qwen3.5-4B-Claude-4.6-HighIQ-THINKING
- No se han encontrado enlaces adicionales (papers, blogs, repos de código o demos) en la información disponible.
