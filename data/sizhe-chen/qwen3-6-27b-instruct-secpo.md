# Sizhe-Chen/Qwen3.6-27B-Instruct-SecPO

## Resumen

Qwen3.6-27B-Instruct-SecPO es un ajuste fino del modelo multimodal Qwen3.6-27B de Alibaba Qwen, publicado por el autor independiente Sizhe-Chen. El modelo incorpora Secure Preference Optimization (SecPO), una variante de DPO diseñada específicamente para defender frente a ataques de prompt injection: instrucciones maliciosas incrustadas en datos no confiables (documentos, resultados de herramientas, imágenes) que intentan desviar al modelo de su tarea legítima. El checkpoint libera los pesos BF16 fusionados (LoRA ya integrada), conserva el codificador visual del modelo base y mantiene la licencia Apache 2.0.

La relevancia del modelo radica en su enfoque: en lugar de alinear el modelo contra contenido dañino genérico, SecPO modifica el lado de referencia de DPO, puntuando las respuestas preferidas y rechazadas sobre la entrada potencialmente inyectada con la política, pero sobre la entrada limpia emparejada con el modelo de referencia congelado. Según la model card, esto reduce la tasa de éxito de ataques adaptativos (ASR) en SEP Genetic del 100% al 13,3%, en TAP del 100% al 12,5% y en PISmith del 98,1% al 1,8%, manteniendo la utilidad en tareas benignas prácticamente intacta.

El modelo tiene 27.356.728.560 parámetros, configuración nativa de contexto de 262.144 tokens, arquitectura `Qwen3_5ForConditionalGeneration` (LLM causal con codificador visual) y se distribuye en 12 shards safetensors con un tamaño de repositorio de 54,7 GB. Está entrenado y evaluado con el modo de razonamiento desactivado (`enable_thinking=False`), por lo que las cifras publicadas no reflejan su capacidad de razonamiento extendido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration`; LLM causal de 27B con codificador visual |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (configuración nativa) |
| Tipos de cuantizacion | no disponible (solo se publican pesos BF16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16, 12 shards, LoRA fusionada) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-27B, un transformer causal multimodal con codificador visual que procesa entradas de imagen y texto (pipeline `image-text-to-text`). El ajuste se realiza mediante SecPO, una variante de DPO con `beta=0.1` en la que la política puntúa las respuestas preferidas y rechazadas sobre la entrada potencialmente inyectada, mientras que el modelo de referencia congelado las puntúa sobre la entrada limpia emparejada. Este diseño otorga más peso a los pares de preferencia en los que el modelo sin defensa se ve más influido por la inyección.

El conjunto de entrenamiento contiene 19.157 pares de preferencia archivados, con inyecciones optimizadas transferidas desde un entrenamiento adversarial online con Llama y etiquetas de respuesta fijas de Qwen. Se entrenó durante 1 época con AdamW, learning rate 1.6e-4, 3% de warmup, precisión BF16 y un límite de secuencia de 4.608 tokens. Durante el ajuste se aplicó LoRA de rango 64, alpha 8 y dropout 0.1 sobre las proyecciones `q/k/v/o` y `gate/up/down`, posteriormente fusionada en los pesos liberados. La generación de preferencias y la evaluación se realizaron con el modo thinking desactivado.

## Capacidades

- Generación de texto y razonamiento en modo thinking-off, con modo thinking disponible en el modelo base pero no evaluado en este checkpoint.
- Comprensión de imágenes y texto combinados (image-text-to-text) gracias al codificador visual preservado.
- Resistencia a prompt injection directa e indirecta: instrucciones maliciosas embebidas en documentos, resultados de herramientas o imágenes.
- Separación explícita de frontera de confianza mediante el rol `input` para contenido no confiable, frente a los roles `system` y `user` para instrucciones de confianza.
- Soporte de conversaciones multi-turno con contexto largo (hasta 262.144 tokens).
- Capacidades de agente y flujos multi-paso, con utilidad benigna medida en AgentDojo (90,7%) y AgentDyn (71,7%).
- Soporte de tool calling / function calling heredado del modelo base (no detallado en la model card).
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- **Atención al cliente con documentos externos**: el modelo puede procesar correos, PDFs o transcripciones aportadas por el usuario en el rol `input`, tratándolas como no confiables, mientras la instrucción del sistema permanece en `system`/`user`. La ventana de 262.144 tokens permite manejar hilos largos sin truncar.
- **Agentes con acceso a herramientas**: en pipelines donde el agente recibe resultados de APIs, navegación web o bases de datos, SecPO reduce el riesgo de que una respuesta de herramienta comprometida redirija al agente. Los datos de AgentDojo (ASR 0,0% en ataque estándar, 8,8% en búsqueda genética adaptativa) respaldan este uso.
- **Procesamiento de documentos con OCR o visión**: al conservar el codificador visual, el modelo puede extraer información de capturas, formularios o facturas escaneadas sin obedecer instrucciones ocultas en la imagen. La utilidad en DocVQA se mantiene en 95,2%.
- **Revisión de código y PRs de terceros**: el modelo puede analizar parches o issues externos marcados como no confiables, evitando que comentarios maliciosos en el código activen comportamientos no deseados en el asistente.
- **Enriquecimiento de datos y RAG**: en sistemas de recuperación aumentada, los fragmentos recuperados se pasan en el rol `input`; el modelo responde a la pregunta del usuario sin seguir instrucciones inyectadas en los documentos recuperados (ASR 7,6% en DTaP-Bench-Indirect).
- **Moderación y triaje de contenido**: el modelo puede clasificar o resumir contenido generado por usuarios manteniendo la tarea original pese a intentos de manipulación en el texto, con una utilidad bajo ataque del 74,5% en DTaP-Bench-Indirect.
- **Asistentes internos con datos no confiables**: en entornos corporativos donde se ingieren correos, tickets o wikis de fuentes variables, la defensa reduce la superficie de ataque sin requerir un clasificador externo adicional.

## Benchmarks y rendimiento

Los datos publicados corresponden a modo thinking-off y comparan el modelo sin defensa (Qwen3.6-27B base), el baseline defensivo Meta-SecAlign y este checkpoint.

**Utilidad (mayor es mejor, porcentajes)**

| Categoria | Benchmark | Metrica | Undefended | Meta-SecAlign | SecPO |
|---|---|---|---:|---:|---:|
| Conocimiento y razonamiento | MMLU-Pro | Puntuacion | 84,8% | 83,9% | 84,6% |
| Conocimiento y razonamiento | GPQA Diamond | Puntuacion | 81,3% | 79,3% | 80,8% |
| Matematicas | GSM8K | Puntuacion | 97,3% | 97,0% | 96,4% |
| Matematicas | Minerva Math | Puntuacion | 96,1% | 94,8% | 95,8% |
| Seguimiento de instrucciones | AlpacaEval2 | Win rate bruto | 80,6% | 81,6% | 82,9% |
| Seguimiento de instrucciones | SEP Utility | Win rate bruto | 93,0% | 93,9% | 94,3% |
| Flujo agente | AgentDojo Utility | Utilidad tarea benigna | 89,7% | 87,6% | 90,7% |
| Flujo agente | AgentDyn Utility | Utilidad tarea benigna | 71,7% | 76,7% | 71,7% |
| Flujo agente | DTaP-Bench-Indirect Utility | Utilidad bajo ataque | 65,8% | 70,0% | 74,5% |
| Comprension de documentos | DocVQA Utility | Utilidad QA benigna | 96,0% | 95,8% | 95,2% |

**Seguridad (menor ASR es mejor, porcentajes)**

| Categoria | Benchmark o ataque | Protocolo | Undefended | Meta-SecAlign | SecPO |
|---|---|---|---:|---:|---:|
| Seguimiento de instrucciones | SEP | Seis plantillas estaticas | 98,9% | 2,9% | 1,8% |
| Seguimiento de instrucciones | SEP Genetic Adaptive | ASR@800 | 100,0% | 93,7% | 13,3% |
| Seguimiento de instrucciones | SEP TAP Adaptive | ASR@800 | 100,0% | 90,1% | 12,5% |
| Seguimiento de instrucciones | SEP PISmith | ASR@10 con atacante RL | 98,1% | 94,0% | 1,8% |
| Flujo agente | AgentDojo | Ataque estandar | 26,9% | 2,2% | 0,0% |
| Flujo agente | AgentDojo Genetic | ASR@800, 80 ejemplos | 81,3% | 78,8% | 8,8% |
| Flujo agente | AgentDyn | Inyeccion en entorno dinamico | 22,0% | 4,8% | 0,0% |

## Requisitos de hardware

- **VRAM estimada en BF16**: con 27.356.728.560 parámetros, los pesos en BF16 ocupan aproximadamente 54,7 GB, por lo que se necesita al menos una GPU de 80 GB (A100 80GB, H100 80GB) para inferencia sin cuantizar.
- **Cuantización**: el repositorio solo publica pesos BF16; no se distribuyen versiones GGUF, AWQ ni GPTQ. Para desplegar en hardware menor habría que generar cuantizaciones propias (por ejemplo, con llama.cpp o AutoAWQ), algo no validado por el autor.
- **GPU de consumo**: no cabe en GPUs consumer de 24 GB (RTX 4090) en BF16. Con cuantización a 4 bits podría aproximarse a 14-16 GB, pero requeriría conversión manual y no hay datos de calidad publicados.
- **Opciones de despliegue**: transformers es la librería declarada. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de HuggingFace. No se confirma soporte oficial de vLLM, TGI, llama.cpp ni Ollama en la información disponible.
- **Latencia y throughput**: no disponibles en la información proporcionada.
- **Memoria de contexto**: activar los 262.144 tokens nativos requiere KV cache considerable; no se han publicado mediciones de VRAM para contextos largos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Defensa prompt injection | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| Qwen3.6-27B-Instruct-SecPO | 27,36B | 262.144 | SecPO (ASR SEP Genetic 13,3%; AgentDojo Genetic 8,8%) | apache-2.0 | HuggingFace |
| Qwen3.6-27B (base) | 27B | 262.144 | Ninguna (ASR SEP Genetic 100%; AgentDojo Genetic 81,3%) | no disponible en la informacion | HuggingFace |
| Meta-SecAlign | no disponible | no disponible | DPO defensivo (ASR SEP Genetic 93,7%; AgentDojo Genetic 78,8%) | no disponible | no disponible |
| Qwen3.6-27B-Thinking-SecOPD | 27B (asumido) | no disponible | SecPO variante para modo razonamiento | no disponible | HuggingFace (repositorio hermano) |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos de otros modelos defensivos de tamaño similar para una comparación más amplia.

## Limitaciones y advertencias

- **Modo thinking no evaluado**: todas las cifras corresponden a `enable_thinking=False`. El rendimiento en razonamiento extendido no está medido en este checkpoint; para ese caso el autor remite a Qwen3.6-27B-Thinking-SecOPD.
- **Dependencia de la frontera de confianza**: SecPO asume que la aplicación separa correctamente el contenido no confiable en el rol `input`. Si el desarrollador concatena datos externos en `system` o `user`, la defensa puede degradarse.
- **Ataques adaptativos**: aunque el ASR baja drásticamente, no es cero (13,3% en SEP Genetic, 12,5% en TAP, 8,8% en AgentDojo Genetic). Un atacante con suficiente presupuesto de búsqueda puede seguir teniendo éxito en una fracción de casos.
- **Idioma**: el repositorio declara únicamente inglés; el comportamiento en castellano u otros idiomas no está validado.
- **Sesgos**: no se documentan evaluaciones de sesgo, toxicidad ni fairness en la model card.
- **Alucinación**: no se aportan métricas de factualidad ni de tasa de alucinación; el ajuste DPO puede alterar ligeramente la calibración respecto al modelo base.
- **Cuantización no soportada oficialmente**: no hay pesos GGUF ni AWQ publicados; el uso en hardware limitado requiere conversión propia sin garantías de calidad.
- **Licencia**: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3.6-27B y de los datasets de entrenamiento.
- **Tamaño del repositorio**: 54,7 GB en 12 shards; la descarga y el almacenamiento requieren planificación de infraestructura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sizhe-Chen/Qwen3.6-27B-Instruct-SecPO
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/Sizhe-Chen/Qwen3.6-27B-Instruct-SecPO-trainset
- Checkpoint hermano para modo razonamiento: https://huggingface.co/Sizhe-Chen/Qwen3.6-27B-Thinking-SecOPD
- Paper SecPO: https://arxiv.org/abs/2610.41998
- Codigo: https://github.com/Sizhe-Chen/SecPO
- Referencias citadas en los tags: arxiv:2403.06833, arxiv:2510.09023, arxiv:2312.02119, arxiv:2603.13026, arxiv:2406.13352, arxiv:2602.03117, arxiv:2605.04808
