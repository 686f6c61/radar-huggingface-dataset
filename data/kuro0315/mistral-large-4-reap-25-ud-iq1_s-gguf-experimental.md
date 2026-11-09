# kuro0315/Mistral-Large-4-REAP-25-UD-IQ1_S-GGUF-Experimental

## Resumen

Mistral-Large-4-REAP-25-UD-IQ1_S-GGUF-Experimental es una derivada experimental del modelo Mistral Large 4 (designación arquitectónica 1T-A52B) publicada por el usuario kuro0315 en Hugging Face. No se trata de un modelo entrenado desde cero ni de una cuantización nueva: parte de la cuantización UD-IQ1_S realizada por Unsloth sobre el modelo original de Mistral y le aplica una poda estructural de expertos mediante una adaptación del método REAP (Router-weighted Expert Activation Pruning). El resultado es un MoE con aproximadamente 792.000 millones de parámetros, frente a los cerca de un billón del modelo base.

La intervención consiste en eliminar 32 de los 128 expertos enrutados de cada una de las 71 capas MoE, conservando 96 por capa (un 25% menos). El router sigue ejecutando cuatro expertos por token y el experto compartido se mantiene intacto, de modo que la designación A52B (parámetros activos) se conserva como aproximación arquitectónica. El resto de componentes (72 capas decodificadoras, atención, capas densas, embeddings, cabeza de salida, tokenizador y plantilla de chat) permanece sin cambios.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de poda de MoE aplicada a un modelo de escala extrema; por otro, el propio autor advierte de que se trata de un prototipo sin validación de calidad. Solo se han completado un diagnóstico de verosimilitud sobre ocho pasajes sintéticos y una prueba de carga con generación de un token. Cualquier uso en producción debe considerarse prematuro.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE), derivada por poda de Mistral Large 4 |
| Parámetros totales | 792.048.021.792 (~792 mil millones) tras la poda |
| Parámetros activos | Designación A52B del modelo base (cuatro expertos enrutados por token más experto compartido); no se reduce el número de expertos ejecutados por token |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF UD-IQ1_S (receta mixta heredada de Unsloth; no implica 1 bit uniforme en todos los tensores) |
| Idiomas soportados | Japonés (ja), inglés (en) |
| Licencia | mistral-ecosystem-open-weight (licencia "other" con nombre específico) |
| Formato de pesos | GGUF (6 shards) |
| Capas | 72 capas decodificadoras; 71 de ellas son MoE |
| Expertos por capa MoE | 96 retenidos de 128 originales (25% podados) |
| Tamaño del repo | 179,5 GB |
| Tamaño esperado de los ficheros del modelo | ~167,13 GiB (frente a 217,01 GiB del origen) |
| Librería | llama.cpp |
| Revisión del modelo base | mistralai/Mistral-Large-4-1T-A52B; cuantización fuente unsloth/Mistral-Large-4-1T-A52B-GGUF (rev. 1eb4373d37e76f6e7b4b8efa20e1b1ca40b3b964) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Mistral Large 4 original: un transformer decoder-only con 72 capas, de las cuales 71 incorporan mezcla de expertos. Cada capa MoE original dispone de 128 expertos enrutados más un experto compartido; el router selecciona cuatro expertos enrutados por token. La derivada reduce ese pool a 96 expertos por capa, pero mantiene la top-4 en el enrutamiento, por lo que el coste computacional por token no disminuye de forma significativa y el etiquetado A52B sigue siendo una aproximación válida.

La poda se realizó con una adaptación propia del método REAP (referencia arXiv:2510.13999). Para cada experto se calcula una puntuación como la media de `router_weight * L2(expert_output)` sobre los tokens que lo seleccionan (no sobre todos los tokens). El proceso es capa a capa: se puntúa una capa sobre todo el conjunto de calibración, se eliminan los 32 expertos con menor puntuación observada, se reenruta entre los 96 restantes, se renormalizan los pesos top-4 y se recalcula la salida FFN de esa capa antes de pasar a la siguiente. Los expertos no observados durante la calibración se protegen en lugar de asignarles importancia cero.

No hay fine-tuning, fusión de expertos ni recuantización de pesos: los bloques de expertos retenidos se copian byte a byte y las filas del router se seleccionan en el mismo orden. La calibración usó 32 pasajes de texto sintético escritos manualmente (2.744 tokens en total, truncados a 128 tokens por pasaje, sin plantilla de chat), con temas de japonés, programación, matemáticas, convenciones de tool/JSON, explicaciones y varios idiomas adicionales. El conjunto es muy reducido y el propio autor reconoce que no representa todas las capacidades ni contextos largos. Los kernels de inferencia empleados en la calibración son los cuantizados de CPU.

## Capacidades

No hay evaluación de capacidades específica para esta derivada. Las capacidades que se listan a continuación corresponden al modelo base Mistral Large 4 y deben considerarse no verificadas en esta versión podada:

- Generación de texto conversacional y continuaciones de contexto largo (longitud de contexto no disponible en la información).
- Razonamiento multi-paso y matemáticas, presumiblemente heredados del modelo base, sin validación en la derivada.
- Generación de código, sin evaluación realizada por el autor.
- Tool calling y function calling, presumiblemente soportados por la plantilla de chat heredada, sin pruebas publicadas.
- Capacidades de agente y razonamiento multi-paso, no verificadas.
- Soporte multilingüe declarado para japonés e inglés; el conjunto de calibración incluyó otros idiomas, pero no se ha medido su calidad.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito en la información disponible.

## Casos de uso

- Investigación sobre poda de MoE: el repositorio incluye `reap.json`, `manifest.json` y los pasajes de calibración, lo que permite reproducir el análisis de selección de expertos y comparar el mapeo antiguo-nuevo de identificadores. Es el uso más sólido dada la falta de validación de calidad.
- Evaluación independiente de robustez tras poda: investigadores pueden ejecutar sus propios benchmarks sobre esta derivada y compararlos con el UD-IQ1_S original para medir el impacto real de eliminar el 25% de los expertos.
- Estudio de degradación en contextos largos: la poda se calibró con pasajes de 128 tokens, por lo que un caso de interés es comprobar si el rendimiento se mantiene en ventanas de contexto extensas, algo que el autor no ha medido.
- Pruebas de despliegue con llama.cpp en CPU: el modelo se validó cargando los seis shards y generando un token con caché KV en F32; sirve como banco de pruebas de builds de llama.cpp con soporte ML4 y de estrategias de paginación bajo demanda en máquinas con RAM limitada.
- Análisis de huella de almacenamiento: la reducción de 217,01 GiB a ~167,13 GiB es útil para estudiar compromisos entre tamaño en disco y calidad en despliegues con restricciones de almacenamiento.
- Comparación de recetas de cuantización mixta: al heredar UD-IQ1_S de Unsloth, permite analizar cómo interactúa una receta IQ1 con una poda estructural posterior, aunque sin garantías de calidad conversacional.

## Benchmarks y rendimiento

El autor solo publica un diagnóstico de verosimilitud sobre ocho pasajes de texto originales (443 tokens de entrada, 435 posiciones de probabilidad del siguiente token, máximo 64 tokens por pasaje). No hay benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Diagnóstico | UD-IQ1_S original | Derivada REAP-25 |
|---|---:|---:|
| Log-verosimilitud negativa media | 2,605309 | 2,597689 |
| Perplejidad | 13,535407 | 13,432655 |
| Ratio de perplejidad agregado | — | 0,992409 |
| Acuerdo en predicción top-1 | — | 88,71% de 443 posiciones |

El propio autor subraya que estas cifras no constituyen evidencia de preservación o mejora de precisión en el mundo real, que el acuerdo top-1 no es una métrica de exactitud de tarea y que los benchmarks del modelo original no son aplicables a esta derivada. La comparación de velocidad de generación en modo conversacional se interrumpió por presión de memoria antes de completar el primer registro, por lo que no existe medición de speedup ni comparación conversacional completa.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: los ficheros del modelo ocupan ~167,13 GiB, por lo que se necesita al menos esa cantidad de memoria combinada (RAM del sistema o VRAM) para cargar los pesos, más overhead de caché KV y contexto.
- GPU recomendadas: no disponibles en la información. Por el tamaño, ningún acelerador consumer actual permite cargar el modelo completo en VRAM; se requeriría un conjunto multi-GPU de clase数据中心 (A100/H100 de 80 GB en número suficiente) o inferencia en CPU con suficiente RAM.
- ¿Cabe en GPU consumer? No, con los datos disponibles: 167 GiB superan con holgura cualquier VRAM consumer (RTX 4090 con 24 GB, por ejemplo).
- Opciones de despliegue: llama.cpp (probado con el build `52e53a76df0298d2c316ae7e704eeec03b0bf478`, con soporte ML4 y caché KV en F32). No se documentan pruebas con vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: no disponibles. La prueba de velocidad en modo conversacional no se completó por falta de memoria; la única prueba exitosa fue la carga de los seis shards y la generación de un token en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Estado de validación |
|---|---|---|---|---|---|
| Mistral-Large-4-REAP-25-UD-IQ1_S (este) | ~792 mil millones (MoE, 96/128 expertos) | No disponible | GGUF UD-IQ1_S, 6 shards, ~167 GiB | mistral-ecosystem-open-weight | Experimental, sin evaluación de tareas |
| mistralai/Mistral-Large-4-1T-A52B (base) | ~1 billón (MoE, 128 expertos) | No disponible | Safetensors (según información del base) | mistral-ecosystem-open-weight | Modelo oficial de Mistral |
| unsloth/Mistral-Large-4-1T-A52B-GGUF (fuente de cuantización) | ~1 billón (MoE, 128 expertos) | No disponible | GGUF UD-IQ1_S, ~217 GiB | mistral-ecosystem-open-weight | Cuantización de terceros sobre el base |

La comparativa se limita a las variantes del mismo modelo porque no se dispone de datos de benchmarks ni de especificaciones de contexto que permitan contrastar con alternativas de otras familias. La diferencia clave entre las tres es el número de expertos retenidos y el tamaño en disco; ninguna de las cifras de rendimiento del base es trasladable a la derivada.

## Limitaciones y advertencias

- Calidad no validada: no se han realizado evaluaciones de código, razonamiento, matemáticas, uso de herramientas, conversación normal, contexto largo ni velocidad de generación. El autor advierte de posibles regresiones sustanciales.
- Diagnóstico insuficiente: la única comprobación es un test de verosimilitud sobre ocho pasajes sintéticos (435 posiciones) y la generación de un token. Una perplejidad ligeramente menor en ese conjunto no es evidencia de precisión preservada.
- Calibración no representativa: 32 pasajes sintéticos de 2.744 tokens, truncados a 128 tokens, sin plantilla de chat. No cubre contextos largos ni la diversidad de tareas reales.
- Riesgo de sesgos y alucinación: no evaluados en esta derivada; se heredan los del modelo base, que no se documentan en la información disponible.
- Idiomas: solo se declaran japonés e inglés; el rendimiento en otros idiomas no está medido.
- Licencia: mistral-ecosystem-open-weight, con implicaciones para uso comercial que deben revisarse en el fichero LICENSE del repositorio. No es una release oficial de Mistral ni de Unsloth.
- Restricciones prácticas: el tamaño (~167 GiB) impide el despliegue en hardware consumer; la comparación de velocidad quedó incompleta por presión de memoria, por lo que no hay garantía de mejora de throughput pese a la reducción de tamaño.
- Reproducibilidad: el autor incluye hashes SHA-256 y mapeos de expertos en `manifest.json` y `reap.json`, pero el proceso de poda es una adaptación propia de REAP, no la implementación oficial de Cerebras o Unsloth.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kuro0315/Mistral-Large-4-REAP-25-UD-IQ1_S-GGUF-Experimental
- Modelo base: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Cuantización fuente de Unsloth: https://huggingface.co/unsloth/Mistral-Large-4-1T-A52B-GGUF
- Paper de REAP: https://arxiv.org/abs/2510.13999
- llama.cpp: https://github.com/ggml-org/llama.cpp
