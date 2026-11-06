# juniorrios/cemig-lfm3-1.7b-nr

## Resumen

cemig-lfm3-1.7b-nr es un ajuste fino del modelo LiquidAI/LFM3-1.7B (1.728.801.536 parámetros) desarrollado por el usuario juniorrios en el contexto de una prueba de concepto CEMIG/CEIA. Su propósito es actuar como asistente offline de seguridad laboral en portugués de Brasil, respondiendo con citas verificables extraídas de las 36 Normas Regulamentadoras brasileñas y de 9 manuales oficiales del MTE. El modelo no memoriza la normativa: recibe fragmentos recuperados mediante una herramienta `buscar_norma` y debe responder citando la norma y el ítem concretos.

El modelo parte de la arquitectura LFM3 de Liquid AI, un transformer de 1.700 millones de parámetros con licencia LFM Open License v1.0. Sobre esa base se aplicaron dos etapas de LoRA r=32 restringidas a las capas MLP (módulos w1/w2/w3, 72 módulos en total), con datos 100 % sintéticos generados a partir del texto público de las NRs. El resultado se distribuye en safetensors bf16 (con `trust_remote_code` y transformers ≥ 5.20) y en GGUF Q4_0 de 1,05 GB, pensado para ejecución en dispositivos móviles.

La relevancia del modelo es doble: por un lado demuestra un pipeline RAG completamente offline (BM25 sobre SQLite FTS5, recuperación densa con EmbeddingGemma-300M, fusión RRF y compresión de contexto) que cabe en un teléfono; por otro, expone con transparencia sus límites, con métricas de aprobación del 68 % en el recorte de benchmark móvil y solo un 15,2 % en preguntas coloquiales largas. Es un artefacto de investigación aplicada, no un producto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer LFM3 (LiquidAI), ajuste LoRA fundido sobre LiquidAI/LFM3-1.7B |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el pipeline entrega ~450 tokens de contexto y ~1.100 tokens de prompt |
| Tipos de cuantizacion | bf16 (safetensors) y GGUF Q4_0 |
| Idiomas soportados | Portugués de Brasil (pt) |
| Licencia | LFM Open License v1.0 (campo `license: other`, `license_name: lfm1.0`); límite de ingresos de 10 millones USD/año en la Sección 5 |
| Formato de pesos | safetensors (bf16) y GGUF (Q4_0, 1,05 GB, md5 `d26176d36ed225a9933ad39ad91ece59`) |

## Arquitectura y entrenamiento

La base es LiquidAI/LFM3-1.7B en su variante instruct, un transformer de 1.700 millones de parámetros. El ajuste se realizó en dos etapas de LoRA con rango 32 aplicado exclusivamente a las capas MLP (`w1`, `w2`, `w3`, 72 módulos), con SFT de chat y `assistant_only_loss`. Los datos de entrenamiento son 100 % sintéticos y generados a partir del texto público de las NRs, sin datos de clientes ni preguntas del conjunto de evaluación.

La primera etapa (F3b `data2x-ep4`) entrena el uso robusto del contexto recuperado: fragmentos correctos, distractores y rechazo cuando el fragmento no responde, durante 4 épocas, con fusión posterior. La segunda (F4 `f4-r32-ep2`) entrena tool-calling multiturno en el formato XML nativo de LFM3 con 4.624 diálogos organizados en seis familias (decidir buscar o no, reutilizar contexto, cambiar de NR, multihop), durante 2 épocas hasta el checkpoint-284, también fusionado (md5 del safetensors `a661ef377131b7fb222884d9f80afbe0`). El GGUF se generó con `convert_hf_to_gguf.py` y `llama-quantize Q4_0` sobre llama.cpp v0.9.0.

El pipeline de inferencia (`inference.py`) es parte del artefacto: clasificador de NR con TF-IDF + regresión logística, BM25 sobre FTS5 con 2.202 fragmentos de 36 NRs, recuperación densa con EmbeddingGemma-300M, fusión RRF con pesos (2, 1, 2 [, 1,75, 1,75]) y compresión al 50 % de los tokens del top-2. La generación usa temperatura 0,1, top_k 50, repetition penalty 1,1 y seed 42, con el modo thinking desactivado.

## Capacidades

- Generación de texto en portugués de Brasil con citación explícita de norma e ítem.
- Tool calling en formato XML nativo de LFM3, con decisión de invocar o no la herramienta `buscar_norma`.
- Reutilización de contexto recuperado en turnos posteriores (100 % en la evaluación F4).
- Cambio de norma dentro de una conversación (98-100 % en evaluación F4).
- Rechazo explícito cuando el fragmento recuperado no responde a la pregunta.
- Respuesta a partir de fragmentos de las 36 NRs y de 9 manuales oficiales del MTE.
- Ejecución offline en dispositivo móvil mediante GGUF Q4_0 con llama.cpp.
- Salida estructurada en JSON (`--json`), procesamiento por lotes (`--file`) y modo solo recuperación (`--retrieval-only`).
- No dispone de visión, audio ni modo thinking activo en la configuración publicada.

## Casos de uso

- Asistente de seguridad laboral en campo: un técnico consulta desde el móvil, sin conectividad, si debe cambiar bloqueos y etiquetas al cambiar de turno; el modelo recupera el fragmento de la NR correspondiente y responde citando norma e ítem.
- Formación de operarios: el pipeline puede generar respuestas citadas a partir de los manuales del MTE, lo que permite construir cuestionarios o material de repaso con trazabilidad documental.
- Verificación documental previa a auditoría: dado un procedimiento interno, el equipo puede formular preguntas concretas y obtener la referencia normativa exacta que lo respalda o lo contradice.
- Integración en aplicaciones móviles offline: el GGUF Q4_0 de 1,05 GB cabe en un teléfono de gama alta (se cita un Galaxy S24+ con TTFT estimado de ~9,5 s) y permite desplegar el asistente sin backend.
- Prototipado de pipelines RAG con tool calling: el repositorio incluye `inference.py`, `pipeline_config.json` y los artefactos de recuperación, lo que sirve como plantilla reproducible para dominios regulados.
- Evaluación de robustez de modelos pequeños en dominios técnicos: las métricas publicadas (68 % de aprobación en el recorte de 344, 15,2 % en preguntas coloquiales, 7,1 % en multihop) permiten usar el modelo como referencia negativa o como línea base en experimentos de RAG.
- Filtrado y clasificación de consultas por norma: el clasificador TF-IDF + regresión logística que precede a la recuperación puede reutilizarse de forma independiente para enrutar consultas hacia la NR correcta.

## Benchmarks y rendimiento

| Evaluación | Resultado |
|---|---|
| Benchmark móvil, recorte 344 (6 NRs × 4 vocabularios), pipeline completo | 68,0 % aprobadas (norma 75,9 % · manual 53,3 %) · alucinación 13,2 % · rechazo 15,4 % |
| Ídem, vocabulario operacional (habla de campo) | 65,1 % (la app anterior obtenía 50,6 %) |
| Ídem, cuando la evidencia entra en el contexto | 81-83 % aprobadas |
| 151 preguntas coloquiales largas de la POC | 15,2 % (rechazo ~53 %) |
| Tool calling (F4) | decisión F1 97-98 · sintaxis XML 100 % · reutilización 100 % · cambio de NR 98-100 % |
| Multihop extremo a extremo (F4) | 7,1 % |
| GGUF Q4_0 frente a bf16, 20 preguntas operacionales | 15/20 frente a 15/20 (sin pérdida medida) |

El juicio de estas métricas lo realiza un juez Qwen 27B con una rúbrica que exige cubrir los hechos pedidos, no alucinar y no rechazar. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_0 ocupa 1,05 GB en disco y puede residir íntegramente en memoria unificada de un móvil; en bf16 el peso ronda los 3,5 GB, por lo que se recomienda al menos 6-8 GB de VRAM para dejar margen al contexto.
- GPU recomendadas: no se especifican en la información proporcionada. Por tamaño, cualquier GPU consumer con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 4090) es suficiente en Q4_0; para bf16 se recomienda 8-12 GB.
- Cabe en GPU consumer: sí, en Q4_0 con holgura y en bf16 en tarjetas de 8 GB o más.
- Despliegue: llama.cpp (versión ≥ `19cce69`, necesaria para reconocer la arquitectura LFM3) y transformers ≥ 5.20 con `trust_remote_code` para la ruta bf16. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: TTFT estimado de ~9,5 s en un Galaxy S24+ con el pipeline completo; no se proporcionan cifras de throughput ni latencia en GPU.
- Nota de instalación: `llama-cpp-python` de PyPI (0.3.36) no reconoce LFM3, por lo que `requirements.txt` fija un commit concreto; la compilación requiere `cmake` y compilador de C++.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| cemig-lfm3-1.7b-nr | 1.728.801.536 | no disponible | pt | LFM Open License v1.0 (límite 10 M USD/año) | RAG offline con citación de NRs brasileñas |
| LiquidAI/LFM3-1.7B | 1.700 millones (aprox.) | no disponible | no disponible | LFM Open License v1.0 | Modelo base instruct generalista |
| Qwen 27B (usado como juez) | 27.000 millones (aprox.) | no disponible | multilingüe | no disponible | Evaluación LLM-as-judge, no comparable en tamaño |

No se dispone de datos de benchmarks comunes entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y enfoque de uso. No se identifican en la información otras alternativas específicas de RAG normativo en portugués con las que comparar.

## Limitaciones y advertencias

- No constituye dictamen jurídico ni sustituye al SESMT: las respuestas pueden ser erróneas o incompletas y deben contrastarse siempre con el ítem citado de la NR vigente.
- El habla coloquial larga funciona mal: en las 151 preguntas de la POC el modelo solo acierta el 15,2 % y rechaza en torno al 53 %.
- El razonamiento multihop está prácticamente roto (7,1 %): la segunda consulta formulada por el modelo de 1.700 millones rara vez recupera el fragmento correcto, y `inference.py` realiza una sola búsqueda por pregunta.
- Tasa de alucinación del 13,2 % en el recorte de benchmark móvil, medida con juez automático.
- Los manuales del MTE solo entran en el contexto cuando se activa la compuerta densa, lo que reduce la cobertura efectiva de esa fuente.
- El modelo solo soporta portugués de Brasil; no se ha validado su comportamiento en otros idiomas o variantes.
- La licencia LFM Open License v1.0 impone un límite de ingresos de 10 millones USD/año para uso comercial; por encima de ese umbral se requiere licencia adicional de Liquid AI.
- El despliegue con `llama-cpp-python` exige compilar desde un commit concreto y disponer de `cmake` y compilador de C++, lo que complica la integración en entornos gestionados.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que indica ausencia de validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juniorrios/cemig-lfm3-1.7b-nr
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset de artefactos de recuperación: https://huggingface.co/datasets/juniorrios/cemig-nr-retrieval-assets
- Script de inferencia: https://huggingface.co/juniorrios/cemig-lfm3-1.7b-nr/resolve/main/inference.py
- Requisitos de instalación: https://huggingface.co/juniorrios/cemig-lfm3-1.7b-nr/resolve/main/requirements.txt
- Requisitos para la ruta transformers: https://huggingface.co/juniorrios/cemig-lfm3-1.7b-nr/resolve/main/requirements-hf.txt
- Licencia LFM Open License v1.0: https://huggingface.co/juniorrios/cemig-lfm3-1.7b-nr/resolve/main/LICENSE
