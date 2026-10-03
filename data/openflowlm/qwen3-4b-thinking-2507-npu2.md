# OpenFlowLM/Qwen3-4B-Thinking-2507-NPU2

## Resumen

Qwen3-4B-Thinking-2507 es un modelo de lenguaje causal de 4.000 millones de parámetros desarrollado por el equipo Qwen (Alibaba), publicado como revisión de julio de 2025 de la rama "Thinking" de la familia Qwen3. Su particularidad es que opera exclusivamente en modo razonamiento: no existe conmutador para desactivar el pensamiento, y la plantilla de chat inyecta automáticamente la etiqueta de apertura. Está orientado a tareas de alta complejidad (matemáticas, lógica, ciencia, código y uso de herramientas) y mantiene un contexto nativo de 262.144 tokens.

El repositorio analizado, OpenFlowLM/Qwen3-4B-Thinking-2507-NPU2, es una redistribución de terceros del modelo base Qwen/Qwen3-4B-Thinking-2507 bajo licencia Apache 2.0. El sufijo "NPU2" sugiere una adaptación o empaquetado orientado a unidades de procesamiento neuronal, pero esta circunstancia no está documentada en la información disponible. El repositorio ocupa 3,3 GB, un tamaño inferior al que ocuparían los pesos en precisión completa (aproximadamente 8 GB en BF16), lo que apunta a algún tipo de cuantización o poda no especificada.

El modelo resulta relevante porque acerca capacidades de razonamiento de la gama alta (81,3 en AIME25, 65,8 en GPQA) a un formato de 4.000 millones de parámetros que cabe en GPU de consumo, con licencia permisiva para uso comercial. Frente a la versión anterior Qwen3-4B Thinking, mejora de forma notable en matemáticas (AIME25 de 65,6 a 81,3) y en tareas de agente (TAU2-Airline de 28,0 a 58,0), a costa de un mayor consumo de tokens de razonamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con Grouped Query Attention (GQA) |
| Parámetros totales | 4,0 B (3,6 B sin contar embeddings) |
| Parámetros activos | No aplica: modelo denso (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantización | No disponible en la información del repositorio (el tamaño de 3,3 GB sugiere una representación comprimida respecto a BF16, pero no se documenta el esquema) |
| Idiomas soportados | No disponible (el modelo base reporta métricas multilingües, pero no se publica lista de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | No disponible de forma explícita; el repositorio se distribuye para la librería transformers |
| Número de capas | 36 |
| Cabezas de atención | 32 para Q y 8 para KV (GQA) |
| Modos de inferencia | Solo modo thinking (sin conmutador) |
| Longitud de salida recomendada | 32.768 tokens en tareas generales; 81.920 tokens en tareas de razonamiento y código |
| Tamaño del repositorio | 3,3 GB |
| Autor del repositorio | OpenFlowLM (redistribución de terceros) |
| Modelo base | Qwen/Qwen3-4B-Thinking-2507 |

## Arquitectura y entrenamiento

Se trata de un transformer causal decoder-only de 36 capas con atención por consultas agrupadas (32 cabezas de consulta y 8 de clave/valor), lo que reduce el coste de memoria de la caché KV frente a atención multi-cabeza completa. El modelo pasó por fases de preentrenamiento y postentrenamiento según la model card, aunque no se especifican el número de tokens, la composición del dataset ni los detalles de las etapas de alineación (SFT, RLHF o DPO). La referencia técnica asociada en las etiquetas del repositorio es el informe arXiv:2505.09388, correspondiente a la familia Qwen3.

La innovación principal de esta revisión es la profundización del comportamiento de razonamiento: la model card indica explícitamente que se ha incrementado la longitud del pensamiento y recomienda el modelo para tareas muy complejas. El modo thinking es obligatorio y la plantilla de chat inyecta por defecto la etiqueta `<think>`, por lo que es normal que la salida contenga únicamente el cierre `</think>` sin apertura explícita. También se declara una mejora del entendimiento de contexto largo hasta 256K. No se documentan innovaciones de decodificación especulativa, atención lineal ni arquitecturas híbridas SSM para esta variante concreta.

## Capacidades

- Generación de texto y conversación multi-turno con ventana de 262.144 tokens.
- Razonamiento profundo en modo thinking obligatorio, con cadenas de pensamiento extensas antes de la respuesta final.
- Matemáticas avanzadas: 81,3 en AIME25 y 55,5 en HMMT25, por encima de la versión anterior del mismo tamaño.
- Conocimiento experto: 65,8 en GPQA, 74,0 en MMLU-Pro y 47,8 en SuperGPQA.
- Generación de código: 55,2 en LiveCodeBench v6 y 1.852 en CFEval.
- Uso de herramientas y function calling: 71,2 en BFCL-v3, con soporte para flujos de agente.
- Tareas de agente multi-paso con interacción sobre entornos reales: TAU1 y TAU2 en dominios de retail, aerolínea y telecomunicaciones.
- Seguimiento de instrucciones: 87,4 en IFEval, el mejor resultado de la comparativa interna publicada.
- Escritura creativa y generación larga: 75,6 en Creative Writing v3 y 83,3 en WritingBench.
- Capacidades multilingües parciales: 77,3 en MultiIF, 64,2 en MMLU-ProX, 64,4 en INCLUDE y 46,2 en PolyMATH.
- No se documentan capacidades de visión, audio ni multimodalidad en esta variante.

## Casos de uso

- Razonamiento matemático y científico asistido: el modelo puede resolver problemas de competición y derivaciones técnicas encadenando pasos largos; su puntuación de 81,3 en AIME25 lo hace adecuado como motor de un asistente de matemáticas avanzadas o de verificación de demostraciones.
- Generación y revisión de código en producción: con 55,2 en LiveCodeBench v6 y soporte de tool calling, encaja en pipelines de CI/CD donde el modelo analiza el diff, ejecuta pruebas vía herramientas y propone parches, siempre con un humano en el bucle.
- Agentes de atención al cliente sobre sistemas transaccionales: los resultados en TAU1-Retail (66,1) y TAU2-Airline (58,0) indican capacidad para gestionar devoluciones, reservas o incidencias invocando APIs de negocio en varios pasos.
- Análisis de documentos largos: con 262.144 tokens de contexto puede procesar contratos, expedientes o informes completos sin troceado, extrayendo cláusulas y comparando secciones en una sola pasada.
- Asistente de investigación y revisión bibliográfica: el contexto largo permite cargar varios artículos simultáneamente y pedir síntesis comparativas, con el modo thinking aportando trazabilidad del razonamiento.
- Tutoría técnica con explicación del razonamiento: al exponer la cadena de pensamiento antes de la respuesta, resulta útil en entornos educativos donde interesa ver el proceso y no solo el resultado.
- Automatización de tareas administrativas con function calling: integrado como planificador en un orquestador de agentes que consulte bases de datos y calendarios mediante herramientas declaradas.
- Despliegue en el borde o en NPU: por tamaño (4 B) y por el empaquetado de terceros orientado a NPU, puede ejecutarse en estaciones de trabajo sin GPU dedicada, aunque el soporte concreto no está documentado.

## Benchmarks y rendimiento

Datos publicados en la model card del modelo base. La comparación es entre la revisión 2507, la versión anterior de 4 B y el modelo MoE de 30 B totales (3 B activos) de la misma familia.

| Benchmark | Qwen3-30B-A3B Thinking | Qwen3-4B Thinking | Qwen3-4B-Thinking-2507 |
|---|---|---|---|
| MMLU-Pro | 78,5 | 70,4 | 74,0 |
| MMLU-Redux | 89,5 | 83,7 | 86,1 |
| GPQA | 65,8 | 55,9 | 65,8 |
| SuperGPQA | 51,8 | 42,7 | 47,8 |
| AIME25 | 70,9 | 65,6 | 81,3 |
| HMMT25 | 49,8 | 42,1 | 55,5 |
| LiveBench 20241125 | 74,3 | 63,6 | 71,8 |
| LiveCodeBench v6 (25.02-25.05) | 57,4 | 48,4 | 55,2 |
| CFEval | 1940 | 1671 | 1852 |
| OJBench | 20,7 | 16,1 | 17,9 |
| IFEval | 86,5 | 81,9 | 87,4 |
| Arena-Hard v2 | 36,3 | 13,7 | 34,9 |
| Creative Writing v3 | 79,1 | 61,1 | 75,6 |
| WritingBench | 77,0 | 73,5 | 83,3 |
| BFCL-v3 | 69,1 | 65,9 | 71,2 |
| TAU1-Retail | 61,7 | 33,9 | 66,1 |
| TAU1-Airline | 32,0 | 32,0 | 48,0 |
| TAU2-Retail | 34,2 | 38,6 | 53,5 |
| TAU2-Airline | 36,0 | 28,0 | 58,0 |
| TAU2-Telecom | 22,8 | 17,5 | 27,2 |
| MultiIF | 72,2 | 66,3 | 77,3 |
| MMLU-ProX | 73,1 | 61,0 | 64,2 |
| INCLUDE | 71,9 | 61,8 | 64,4 |
| PolyMATH | 46,1 | 40,0 | 46,2 |

Notas metodológicas de la model card: en Arena-Hard v2 se reportan tasas de victoria evaluadas con GPT-4.1; en tareas especialmente exigentes (PolyMATH y todas las de razonamiento y código) se empleó una longitud de salida de 81.920 tokens, y de 32.768 tokens en el resto. No se han publicado resultados propios del repositorio OpenFlowLM.

## Requisitos de hardware

- Pesos en BF16/FP16: aproximadamente 8 GB, más caché KV.
- Pesos en INT8: aproximadamente 4,5 GB.
- Pesos en INT4: aproximadamente 2,5-3 GB. El repositorio de OpenFlowLM ocupa 3,3 GB, coherente con un formato comprimido.
- Caché KV estimada (cálculo propio, asumiendo 36 capas, GQA con 8 cabezas KV y dimensión de cabeza 128 en FP16): aproximadamente 147 KB por token, es decir, unos 4,8 GB a 32K tokens y unos 38 GB a 262K tokens. Es la partida dominante si se usa el contexto completo; conviene recurrir a cuantización de la caché o a contextos reducidos.
- GPU de consumo: el modelo en cuantización de 4 bits cabe en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4070) con contextos moderados; en BF16 requiere 16 GB o más (RTX 4080/4090, RTX A4000).
- GPU de datacenter: A100 40/80 GB, H100 o L40S para explotar el contexto de 262.144 tokens sin comprometer la caché KV.
- El nombre del repositorio sugiere despliegue en NPU, pero no se documentan plataformas, toolchains ni rendimiento asociado.
- Opciones de despliegue documentadas por el modelo base: transformers (versión 4.51.0 o superior; versiones anteriores fallan con `KeyError: 'qwen3'`), vLLM 0.8.5 o superior, SGLang 0.4.6.post1 o superior, ambos con parser de razonamiento compatible con DeepSeek-R1 y endpoint compatible con la API de OpenAI.
- No se documentan en el repositorio variantes GGUF ni soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. La model card advierte de que si aparecen problemas de memoria (OOM) se reduzca la longitud de contexto, asumiendo la pérdida de capacidad de razonamiento que ello implica.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Datos destacados |
|---|---|---|---|---|---|
| Qwen3-4B-Thinking-2507 (base de este repositorio) | 4,0 B | No aplica (denso) | 262.144 | Apache 2.0 | AIME25 81,3; GPQA 65,8; IFEval 87,4 |
| Qwen3-4B Thinking (versión anterior) | 4,0 B | No aplica (denso) | No disponible en la información | Apache 2.0 | AIME25 65,6; GPQA 55,9; IFEval 81,9 |
| Qwen3-30B-A3B Thinking (MoE de la misma familia) | 30 B | 3 B | No disponible en la información | Apache 2.0 | AIME25 70,9; GPQA 65,8; MMLU-Pro 78,5 |
| OpenFlowLM/Qwen3-4B-Thinking-2507-NPU2 | 4,0 B | No aplica (denso) | 262.144 (heredado del base) | Apache 2.0 | Sin benchmarks propios publicados |

No se dispone de datos de benchmarks de otras familias comparables (por ejemplo, modelos densos de 3-4 B de otros proveedores) en la información proporcionada, por lo que no se incluye comparación con ellas.

## Limitaciones y advertencias

- Repositorio sin tracción ni validación comunitaria: cero descargas y cero "likes" en el momento de la consulta, sin documentación propia sobre qué se ha modificado respecto al modelo base.
- Naturaleza de terceros: OpenFlowLM no es el desarrollador original. Cualquier alteración de pesos, cuantización o adaptación a NPU no está auditada ni descrita; para producción conviene partir del repositorio oficial Qwen/Qwen3-4B-Thinking-2507.
- Modo thinking obligatorio: no se puede desactivar, lo que incrementa el coste en tokens y la latencia en tareas triviales donde no se necesita razonamiento.
- Salidas largas: las tareas de razonamiento y código pueden consumir hasta 81.920 tokens de salida, con el consiguiente impacto en coste y tiempo de respuesta.
- Riesgo de alucinación: es un modelo de 4 B; aunque mejora en conocimiento experto, sigue por debajo del MoE de 30 B en MMLU-Pro (74,0 frente a 78,5), MMLU-Redux y SuperGPQA. No debe usarse como fuente de verdad sin verificación en dominios médicos, legales o financieros.
- Sesgos: la información disponible no incluye ninguna evaluación de sesgos ni de seguridad; se heredan los sesgos de los datos de preentrenamiento del modelo base.
- Idiomas: no se publica lista de idiomas soportados. Las métricas multilingües (MultiIF 77,3; MMLU-ProX 64,2; INCLUDE 64,4) son inferiores a las del modelo de 30 B, y PolyMATH queda en 46,2, lo que sugiere rendimiento desigual fuera del inglés.
- Contexto: aunque el contexto nativo es de 262.144 tokens, la caché KV a esa longitud exige mucha memoria; la propia model card recomienda reducir el contexto ante problemas de OOM, con la pérdida de calidad que ello conlleva en razonamiento.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero el repositorio enlaza a la licencia del modelo base de Qwen y no añade condiciones propias verificables.
- Ausencia de benchmarks propios: no hay evidencia de que el empaquetado de OpenFlowLM conserve el rendimiento del modelo original.

## Enlaces

- Repositorio analizado: https://huggingface.co/OpenFlowLM/Qwen3-4B-Thinking-2507-NPU2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507/blob/main/LICENSE
- Informe técnico referenciado (arXiv): https://arxiv.org/abs/2505.09388
- Blog de Qwen: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Demo de chat: https://chat.qwen.ai/

Nota: la búsqueda web asociada no devolvió resultados relevantes sobre el modelo (únicamente enlaces a IMDb), por lo que no se han podido incorporar fuentes adicionales.
