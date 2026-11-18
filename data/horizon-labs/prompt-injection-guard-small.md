# Horizon-Labs/prompt-injection-guard-small

## Resumen

Prompt Injection Guard (small) es un clasificador de texto de 141 millones de parámetros desarrollado por Horizon-Labs, cuyo propósito es detectar intentos de prompt injection y jailbreak tanto en mensajes directos del usuario como en contenido no confiable que lee un agente de IA: correos electrónicos, páginas web, documentos, fragmentos de RAG y salidas de herramientas o APIs. El modelo se construye sobre el backbone jhu-clsp/mmBERT-small, una variante multilingüe de la familia ModernBERT, y se distribuye con licencia Apache-2.0 sin restricciones de acceso.

La propuesta técnica del modelo es distinguirse de los clasificadores basados en palabras clave: se ha entrenado con documentos realistas que contienen inyecciones plantadas en 45 tipos de documentos distintos, junto con sus correspondientes versiones limpias. De este modo, el clasificador aprende a identificar instrucciones dirigidas al modelo, no simplemente términos alarmantes. Esto se tradujo en una tasa de falsos positivos baja sobre texto benigno parecido: 96,2 % de precisión en NotInject y 99,5 % en OR-Bench-hard.

Es relevante ahora porque los agentes basados en LLM procesan cada vez más contenido externo no verificado y expuestos a ataques indirectos, un vector que los filtros de prompt tradicionales no cubren. El modelo ofrece una ventana de contexto de 8.000 tokens, soporte para 30 idiomas en los datos de entrenamiento y exportaciones a PyTorch, ONNX (fp32 e int8) y transformers.js, lo que permite desplegarlo tanto en servidores como en el navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT / mmBERT-small (encoder transformer bidireccional con atención lineal, base jhu-clsp/mmBERT-small) |
| Parametros totales | 140.642.306 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.000 tokens; documentos más largos requieren ventaneo con solapamiento (ejemplo con ventana 2048 y stride 512) |
| Tipos de cuantizacion | ONNX fp32 (`onnx/model.onnx`) y ONNX int8 (`onnx/model_quantized.onnx`, embeddings int8, mitad del tamaño); transformers.js con dtype `q8` |
| Idiomas soportados | Multilingüe; datos sintéticos de entrenamiento en 30 idiomas; lista declarada: en, de, fr, es, pt, it, nl, pl, ru, uk, tr, ar, hi, zh, ja, ko, vi, id, th |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8); compatible con transformers.js |
| Tarea | Clasificación de texto binaria: `SAFE` (0) / `INJECTION` (1) |
| Librería | transformers; compatible con text-embeddings-inference y endpoints |
| Tamaño del repo | 4,3 GB |
| Descargas | 4.644 |
| Fecha de creación / actualización | 2026-09-23 / 2026-11-09 |

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional derivado de jhu-clsp/mmBERT-small, la variante multilingüe y compacta de la familia ModernBERT. ModernBERT introduce atención lineal (rotary position embeddings con atención eficiente) y una arquitectura optimizada para contextos largos, lo que aquí se traduce en una ventana de 8.000 tokens con coste de atención subcuadrático frente a un transformer clásico. Sobre el backbone se añade una cabeza de clasificación de secuencia con dos etiquetas, entrenada con descenso de gradiente supervisado; la model card no documenta fases de RLHF ni DPO.

El entrenamiento combina conjuntos de datos de inyección y jailbreak de origen permisivo: neuralchemy/Prompt-injection-dataset, S-Labs/prompt-injection-dataset, microsoft/llmail-inject-challenge, hendzh/PromptShield, TrustAIRLab/in-the-wild-jailbreak-prompts, nvidia/Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1, 3nesdeniz/agentic-prompt-injection-5k, rgeada/tool-response-injections, JailbreakV-28K/JailBreakV-28k y nvidia/Nemotron-RL-Jailbreak-Robustness-v1, junto con datos benignos de OpenAssistant/oasst2, CohereLabs/aya_dataset, HuggingFaceFW/fineweb-edu y HuggingFaceFW/fineweb-2. La innovación destacable es la generación de documentos realistas con inyecciones indirectas plantadas en 45 tipos de documentos, emparejados con sus equivalentes limpios, además de la síntesis multilingüe en 30 idiomas. El número exacto de tokens de entrenamiento no está disponible en la información proporcionada. El código de datos, entrenamiento y evaluación está publicado en el repositorio github.com/horizon-ai-labs/agent-io-guards.

## Capacidades

- Detección de prompt injection directa: anulación o ignorancia de instrucciones, mensajes falsos de sistema o desarrollador, trucos de delimitadores y extracción de system prompt.
- Detección de jailbreak: personas alternativas, "developer mode", marcos hipotéticos y demás técnicas orientadas a eliminar las reglas del modelo.
- Detección de inyección indirecta en documentos y salidas de herramientas: instrucciones plantadas para que un agente exfiltre datos, envíe correos, invoque herramientas o modifique su comportamiento.
- Clasificación binaria con etiquetas `SAFE` (0) e `INJECTION` (1), convención idéntica a protectai/deberta-v3-base-prompt-injection-v2, lo que permite sustituirlo directamente en código y herramientas existentes.
- Multilingüe: entrenamiento sintético en 30 idiomas y evaluación declarada en alemán, entre otros; la lista de idiomas cubre en, de, fr, es, pt, it, nl, pl, ru, uk, tr, ar, hi, zh, ja, ko, vi, id, th.
- Procesamiento de entradas largas: ventana de 8.000 tokens y función de ventaneo con solapamiento para texto de longitud arbitraria que devuelve la probabilidad máxima de inyección.
- Integración con LLM Guard mediante el scanner PromptInjection con umbral configurable y MatchType.FULL.
- Despliegue en navegador vía transformers.js con cuantización q8.
- No se declaran capacidades de generación de texto, tool calling propio, visión, audio ni modo de razonamiento; el modelo es exclusivamente un clasificador.

## Casos de uso

- Filtrado de entrada de usuario en chatbots: clasificar cada mensaje antes de enviarlo al LLM principal y rechazar o marcar aquellos con probabilidad de inyección superior al umbral, usando la integración directa con LLM Guard y la convención de etiquetas compatible con protectai.
- Protección de agentes que leen contenido externo: aplicar la función de ventaneo sobre correos, páginas web, PDF y fragmentos de RAG antes de incorporarlos al contexto del agente, sustituyendo el contenido sospechoso por un marcador de texto eliminado.
- Saneamiento de salidas de herramientas y APIs: interceptar la respuesta de llamadas a herramientas (búsqueda web, lectura de ficheros, consultas a bases de datos) y bloquear respuestas que contengan instrucciones dirigidas al modelo, un vector cubierto por el dataset rgeada/tool-response-injections.
- Defensa en pipelines de CI/CD para aplicaciones LLM: ejecutar el clasificador en modo ONNX int8 como paso de validación de prompts de sistema y plantillas antes del despliegue, con bajo coste de cómputo por su tamaño de 141M.
- Moderación multilingüe en productos SaaS: al ser multilingüe y cubrir 30 idiomas de entrenamiento, permite un único clasificador para bases de usuarios en alemán, francés, español, portugués, ruso, árabe, hindi, chino, japonés, coreano, vietnamita, indonesio, tailandés, entre otros, evitando mantener un modelo por idioma.
- Ejecución en el cliente o en el borde: con ONNX int8 y transformers.js (dtype q8) el modelo puede correr en navegador o en dispositivos sin GPU, útil para aplicaciones que procesan contenido localmente antes de enviarlo a un servicio remoto.
- Evaluación de robustez de asistentes: usar las puntuaciones del clasificador como métrica auxiliar para medir la exposición de un agente a jailbreaks y inyecciones indirectas durante pruebas de seguridad.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| NotInject (texto benigno parecido) | 96,2 % | Tasa de acierto declarada por el autor |
| OR-Bench-hard | 99,5 % | Tasa de acierto declarada por el autor |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. No se dispone de comparaciones numéricas directas con protectai/deberta-v3-base-prompt-injection-v2 ni con otras alternativas en la model card.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 140,6M parámetros; en fp32 ocupa aproximadamente 560 MB de pesos, en fp16 unos 280 MB y en ONNX int8 en torno a 140-280 MB. Con activaciones y overhead de inferencia, cabe holgadamente en 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente; para lotes grandes o alto throughput se recomiendan A100, H100 o L40S, aunque no son necesarias para uso individual.
- Consumer GPU: sí, cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 y similares, e incluso en CPU y en navegador mediante ONNX int8 o transformers.js q8.
- Opciones de despliegue: transformers (pipeline de text-classification), ONNX Runtime, transformers.js, LLM Guard como scanner de entrada, y text-embeddings-inference según las tags del repositorio.
- Latencia y throughput: no se han publicado cifras concretas de latencia o throughput en la información disponible. Por el tamaño del modelo y la atención lineal de ModernBERT, se espera una latencia muy baja en GPU y CPU, pero no hay datos medidos que citar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Horizon-Labs/prompt-injection-guard-small | 140,6M | 8.000 tokens | Clasificador binario directo + indirecto, multilingüe | Apache-2.0 | Hugging Face, ONNX, transformers.js |
| protectai/deberta-v3-base-prompt-injection-v2 | No disponible en la información proporcionada | No disponible en la información proporcionada | Clasificador de prompt injection (referencia de convención de etiquetas) | No disponible en la información proporcionada | Hugging Face |
| Horizon-Labs/prompt-injection-guard-base | No disponible en la información proporcionada | No disponible en la información proporcionada | Misma familia, tamaño base | Apache-2.0 | Hugging Face |
| Horizon-Labs/prompt-injection-guard-large | No disponible en la información proporcionada | No disponible en la información proporcionada | Misma familia, tamaño large | Apache-2.0 | Hugging Face |

La comparación con protectai/deberta-v3-base-prompt-injection-v2 se limita a la compatibilidad de etiquetas (`SAFE`/`INJECTION`) declarada por el autor; no se dispone de datos de rendimiento comparativo. Las variantes base y large de la misma familia se citan en la model card como alternativas de mayor tamaño, sin especificaciones publicadas en la información disponible.

## Limitaciones y advertencias

- Es un clasificador, no un generador: no mitiga por sí solo todos los ataques; debe combinarse con otras defensas (aislamiento de instrucciones, permisos mínimos de herramientas, validación de salidas).
- Riesgo de falsos positivos y falsos negativos: aunque declara 96,2 % en NotInject y 99,5 % en OR-Bench-hard, son métricas sobre conjuntos concretos; el umbral debe calibrarse por aplicación (el ejemplo usa 0,5, pero es configurable).
- Entradas de más de 8.000 tokens se truncan si no se aplica ventaneo; el truncado simple puede dejar pasar inyecciones situadas fuera de la ventana.
- El entrenamiento usa datos sintéticos multilingües en 30 idiomas; el rendimiento real en idiomas distintos de los evaluados y en variedades dialectales no está cuantificado en la información disponible.
- Posibles sesgos heredados de los datasets de entrenamiento (conversacionales y web como oasst2, aya_dataset, fineweb-edu, fineweb-2), no documentados en detalle.
- No se documentan tasas de alucinación ni comportamiento adversario específico más allá de las métricas citadas; no hay datos sobre robustez frente a ataques adversariales optimizados contra el propio clasificador.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las licencias de los datasets subyacentes si se redistribuye el modelo derivado; la model card afirma entrenamiento solo con datos de licencia permisiva.
- El tamaño del repo (4,3 GB) es mayor que el de los pesos del modelo, probablemente por artefactos adicionales; conviene verificar qué ficheros se descargan en despliegues con almacenamiento limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Horizon-Labs/prompt-injection-guard-small
- Demo en Spaces: https://huggingface.co/spaces/Horizon-Labs/prompt-injection-guard
- Variante base: https://huggingface.co/Horizon-Labs/prompt-injection-guard-base
- Variante large: https://huggingface.co/Horizon-Labs/prompt-injection-guard-large
- Código fuente (datos, entrenamiento, evaluación): https://github.com/horizon-ai-labs/agent-io-guards
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Modelo de referencia con convención de etiquetas compatible: https://huggingface.co/protectai/deberta-v3-base-prompt-injection-v2
