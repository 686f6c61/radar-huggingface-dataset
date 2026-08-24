# luxuansang/Qwythos-9B-v2

## Resumen

Qwythos-9B-v2 es un modelo de lenguaje de 9.650 millones de parámetros desarrollado por Empero AI, un laboratorio independiente con sede en Alemania. Se trata de la segunda iteración de la familia Qwythos, un fine-tune del modelo Qwen3.5-9B orientado al razonamiento profundo (chain-of-thought) y al uso sin censura en ámbitos de investigación. La versión v2 corrige el principal defecto de la v1: el comportamiento de bucle o repetición degenerativa bajo decodificación greedy, que pasó del 6,7 % al 0,0 % sin sacrificar las capacidades de razonamiento.

El modelo mantiene la ventana de contexto de 1.048.576 tokens (1M) mediante extensión YaRN, incorpora de nuevo la cabeza de predicción multi-token (MTP) que faltaba en la exportación anterior, y conserva la postura "uncensored" intencional para tareas de ciberseguridad, biología, química, farmacología y trabajo clínico. Está disponible bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones, y se distribuye en formato safetensors y GGUF.

La arquitectura subyacente es la de Qwen3.5-9B, un diseño híbrido que combina atención lineal Gated-DeltaNet con bloques de atención completa en proporción 3:1, lo que permite manejar contextos muy largos con un coste computacional reducido. El modelo está pensado para desarrolladores e investigadores que necesitan un modelo de razonamiento potente, ejecutable en hardware de consumo, con capacidad para procesar documentos extensos y comportarse de forma determinista en bucles de agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Qwen3.5-9B: 3:1 Gated-DeltaNet (atención lineal) + bloques de atención completa |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.048.576 tokens (1M, extensión YaRN) |
| Tipos de cuantizacion | Safetensors (BF16/FP16) en el repo principal; GGUF disponible en repo separado (cuantizaciones no especificadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, GGUF |

## Arquitectura y entrenamiento

Qwythos-9B-v2 parte del modelo base `empero-ai/Qwythos-9B-Claude-Mythos-5-1M`, que a su vez es un fine-tune de Qwen3.5-9B. La arquitectura es híbrida: combina capas de atención lineal Gated-DeltaNet con bloques de atención completa en una proporción de 3:1, un diseño que reduce el coste computacional en contextos largos manteniendo la calidad de atención en posiciones críticas. El modelo incluye una cabeza de predicción multi-token (MTP) nativa, restaurada en esta versión, que permite configuraciones de decodificación especulativa.

El entrenamiento de la v2 se centró en eliminar el comportamiento de bucle mediante FTPO (Final-Token Preference Optimization). Esta técnica identifica el token exacto que inicia un bucle de repetición y entrena al modelo para preferir alternativas coherentes en esa posición concreta, dejando intacta el resto de la distribución de probabilidad. Según el autor, esto preserva el conocimiento y las capacidades de razonamiento del modelo original. No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO; la información disponible solo menciona el fine-tune sobre el modelo base y la optimización FTPO.

## Capacidades

- Razonamiento profundo (chain-of-thought) en tareas de matemáticas, lógica y ciencia, con resultados notables en GSM8K (93,6 %) y GPQA-diamond (49,0 %).
- Generación de código en Python y otros lenguajes, con 77,4 % en HumanEval (pass@1).
- Comprensión de contexto ultralargo de 1M tokens, adecuado para procesar documentos completos, libros o historiales de conversación extensos.
- Postura sin censura intencional para investigación en ciberseguridad, red-teaming, biología, química, farmacología y trabajo clínico, con tasa de rechazo del 0,0 %.
- Comportamiento determinista bajo decodificación greedy: tasa de bucle del 0,0 %, lo que lo hace fiable en bucles de agente y pipelines automatizados.
- Cabeza MTP (multi-token prediction) restaurada, compatible con esquemas de decodificación especulativa para acelerar la inferencia.
- Capacidad multimodal nativa del stack Qwen3.5 declarada por el autor, aunque el pipeline publicado es text-generation y no se detallan tareas de visión o audio.
- Identidad controlada: el modelo solo se presenta cuando se le pregunta explícitamente, evitando inyecciones de identidad no solicitadas.

## Casos de uso

- Análisis de documentos legales o académicos extensos: gracias a la ventana de 1M tokens, el modelo puede procesar contratos completos, tesis o expedientes sin necesidad de chunking, y responder preguntas sobre cualquier sección del documento.
- Agentes autónomos con razonamiento multi-paso: la ausencia de bucles bajo decodificación greedy permite integrarlo en bucles de agente (planificar, actuar, observar) sin riesgo de repetición infinita, y su contexto largo le permite mantener el historial completo de interacciones.
- Red-teaming y auditoría de seguridad: su postura sin censura y su capacidad de razonamiento lo hacen útil para simular ataques, analizar vulnerabilidades y generar informes técnicos de seguridad, siempre en entornos controlados y con supervisión humana.
- Generación de código en producción: con soporte para razonamiento y 77,4 % en HumanEval, puede integrarse en pipelines de CI/CD para generar tests, documentar funciones o refactorizar código, ejecutándose en hardware de consumo.
- Investigación farmacológica y clínica: el modelo responde sin rechazo a preguntas sobre mecanismos de acción de fármacos, interacciones o literatura médica, lo que facilita la revisión de artículos y la preparación de material educativo (con verificación humana obligatoria).
- Asistente de razonamiento matemático y científico: su rendimiento en GSM8K (93,6 %) y ARC-Challenge (96,4 %) lo hace adecuado para tutoría, resolución de problemas paso a paso y verificación de demostraciones.
- Procesamiento de conversaciones de soporte técnico de larga duración: el contexto de 1M tokens permite mantener el historial completo de un cliente a lo largo de semanas, mejorando la coherencia de las respuestas en sistemas de atención al cliente.

## Benchmarks y rendimiento

Los resultados fueron medidos con el harness interno de Empero AI (generación con chain-of-thought, greedy/pass@1 salvo indicación; MMLU/ARC/GSM8K con n=500, GPQA-diamond con n=198, HumanEval con n=164). La métrica de calidad la evalúa un LLM juez independiente.

| Benchmark | Qwythos-9B-v2 |
|---|---|
| MMLU (CoT) | 83,8 % |
| MMLU (5-shot loglik) | 69,6 % |
| ARC-Challenge | 96,4 % |
| GPQA-diamond | 49,0 % |
| GSM8K | 93,6 % |
| HumanEval (pass@1) | 77,4 % |
| Tasa de bucle (greedy) | 0,0 % |
| Tasa de rechazo | 0,0 % |

Comparación con el modelo base y la v1:

| Benchmark | Qwen3.5-9B (base) | Qwythos-9B (v1) | Qwythos-9B-v2 |
|---|---|---|---|
| MMLU (CoT) | 80,6 | 83,8 | 83,8 |
| ARC-Challenge | 95,6 | 95,0 | 96,4 |
| GPQA-diamond | 32,8 | 52,0 | 49,0 |
| GSM8K | 80,6 | 92,2 | 93,6 |
| HumanEval | 81,7 | 79,9 | 77,4 |
| Tasa de bucle (greedy) | 2,7 | 6,7 | 0,0 |

Nota del autor: la puntuación de MMLU es significativamente mayor con chain-of-thought (83,8 %) que con loglikelihood de 5 disparos (69,6 %), lo que confirma que Qwythos es un modelo de razonamiento y rinde mejor cuando se le permite pensar.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 9,65 mil millones de parámetros. En BF16/FP16 ocupa aproximadamente 19,3 GB (coincide con el tamaño del repo), por lo que requiere una GPU con al menos 24 GB para ejecutarse sin cuantización.
- Con cuantización de 8 bits, la huella de memoria se reduce a unos 10 GB, y con 4 bits a unos 5-6 GB, lo que permite ejecutarlo en GPUs de consumo como la RTX 3060 (12 GB) o RTX 4060 (8 GB) en las configuraciones más agresivas.
- GPUs recomendadas: RTX 3090, RTX 4090, A100, H100 para inferencia en BF16; GPUs con 8-12 GB de VRAM para versiones cuantizadas.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama y TGI (el repo declara `endpoints_compatible`). La cabeza MTP restaurada permite configuraciones de decodificación especulativa en frameworks que la soporten.
- Latencia y throughput: no se han publicado datos específicos. Como referencia, un modelo de 9B en una RTX 4090 con cuantización 4-bit suele alcanzar decenas de tokens por segundo, pero depende del backend y la longitud de contexto.

## Comparativa con modelos similares

La comparativa se limita a los modelos de la misma familia, ya que no se dispone de datos de benchmarks para otras alternativas de 9B en la información proporcionada.

| Modelo | Parámetros | Contexto | MMLU (CoT) | GSM8K | HumanEval | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.5-9B (base) | ~9,65B | 1M (YaRN) | 80,6 | 80,6 | 81,7 | Apache 2.0 |
| Qwythos-9B (v1) | ~9,65B | 1M (YaRN) | 83,8 | 92,2 | 79,9 | Apache 2.0 |
| Qwythos-9B-v2 | ~9,65B | 1M (YaRN) | 83,8 | 93,6 | 77,4 | Apache 2.0 |

Qwythos-9B-v2 supera al base en razonamiento (MMLU, GSM8K, GPQA) y elimina por completo el problema de bucle, aunque pierde algo de rendimiento en HumanEval frente al base (77,4 % vs 81,7 %). Frente a la v1, mantiene las capacidades dentro del ruido de evaluación y resuelve el defecto de repetición. No se dispone de comparativas con otros modelos de 9B como Llama-3.1-8B o Mistral-7B en la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés; su rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- La postura sin censura es intencional y puede generar contenido dañino, ilegal o éticamente problemático si se usa sin supervisión. No es adecuado para despliegues públicos sin filtros de seguridad adicionales.
- Riesgo de alucinación: como todo modelo de lenguaje, puede inventar hechos, especialmente en dominios especializados. En contextos clínicos o de seguridad, toda salida debe ser verificada por un experto humano.
- La extensión de contexto a 1M tokens mediante YaRN puede degradar la calidad de atención en posiciones extremas; se recomienda validar el comportamiento en rangos de 100K-200K antes de confiar en la ventana completa.
- El rendimiento en HumanEval es ligeramente inferior al del modelo base (77,4 % vs 81,7 %), lo que sugiere una pequeña regresión en tareas de código puro.
- No se ha publicado información sobre el dataset de entrenamiento, el número de tokens ni el proceso de alineación (si lo hubo), lo que dificulta evaluar sesgos y procedencia de los datos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la seguridad del modelo en producción; el despliegue responsable es responsabilidad del usuario.

## Enlaces

- Repositorio HuggingFace (mirror): https://huggingface.co/luxuansang/Qwythos-9B-v2
- Repositorio oficial de Empero AI: https://huggingface.co/empero-ai/Qwythos-9B-v2
- Repositorio GGUF oficial: https://huggingface.co/empero-ai/Qwythos-9B-v2-GGUF
- Web de Empero AI: https://empero.org/
- Artículo explicativo sobre Qwythos-9B-v2: https://aiadoptionagency.com/qwythos-9b-v2/
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwythos-9b-v2-empero-ai
