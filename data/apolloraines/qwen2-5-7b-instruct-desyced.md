# ApolloRaines/Qwen2.5-7B-Instruct-Desyced

## Resumen

Qwen2.5-7B-Instruct-Desyced es una modificación de pesos del modelo Qwen/Qwen2.5-7B-Instruct desarrollada por Apollo Raines bajo la etiqueta "Desyced" (desycophancy). El objetivo declarado es reducir la tendencia del modelo base a capitular ante presión social, es decir, a abandonar una respuesta correcta cuando el usuario insiste con una afirmación incorrecta, especialmente si cita una autoridad falsa o se muestra muy seguro. La intervención se presenta como cirugía directa sobre los pesos, sin reentrenamiento, sin RLHF y sin datos adicionales.

El modelo conserva la arquitectura, el tokenizador y la longitud de contexto del Qwen2.5-7B-Instruct original, por lo que funciona como sustituto directo en pipelines existentes. El autor lo orienta explícitamente a revisión de código adversarial y publicado como demostración de investigación, con la advertencia de que sus modelos públicos se liberan a "fuerza parcial" como prueba de concepto.

La relevancia actual reside en que la sicofancia es un fallo de fiabilidad medible y problemático en producción: convierte hallazgos reales en matices y matices en aquiescencia. Este modelo propone un enfoque de edición de pesos para atacar ese comportamiento sin tocar el resto de capacidades, algo relevante para quien evalúe técnicas de alineación post-hoc.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivada de Qwen2.5-7B-Instruct |
| Parámetros totales | 7.615.616.512 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del base Qwen2.5-7B-Instruct) |
| Tipos de cuantización | Safetensors en precisión completa, GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | Inglés (declarado en la model card y en los metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-7B-Instruct: un transformer decoder-only denso con 7.615.616.512 parámetros, tokenizador propio de Qwen y ventana de contexto heredada del modelo base. No se introducen cambios estructurales, ni nuevos módulos, ni alteraciones del vocabulario; el modelo es un reemplazo directo a nivel de pesos.

El entrenamiento no es tal: no hay datos nuevos, ni RLHF, ni DPO, ni fine-tuning supervisado. La modificación consiste en una edición de pesos que reduce la dirección de activación asociada a la capitulación sicofántica. El autor no detalla la metodología exacta (identificación de la dirección, magnitud del escalado, capas afectadas) ni publica el conjunto de evaluación completo. La única métrica reportada es una prueba de trampas de contradicción: el modelo responde correctamente a una pregunta factual, el usuario presiona con una autoridad o fuente falsa y se mide si mantiene su respuesta. El autor indica una mejora del 50 % al 83 % en "mantenerse firme bajo presión", sin especificar el tamaño de la muestra ni el intervalo de confianza.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del Qwen2.5-7B-Instruct.
- Razonamiento factual y respuesta a preguntas de conocimiento general.
- Mayor resistencia a la presión social: mantiene respuestas correctas ante insistencia del usuario con autoridades o fuentes falsas (según la métrica del autor).
- Revisión de código adversarial: el caso de uso declarado, orientado a señalar errores sin suavizarlos ante la réplica del autor del código.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue como servicio de generación de texto.
- Capacidades del modelo base no verificadas en esta información: tool calling, agentes multi-paso, matemáticas y código no se documentan de forma independiente en la model card.
- Idiomas: inglés declarado; no se documenta soporte multilingüe adicional.

## Casos de uso

- Revisión de código adversarial: el modelo se usa como revisor que debe mantener un hallazgo de seguridad o corrección aunque el autor del código lo discuta; la reducción de sicofancia evita que el hallazgo se degrade a un matiz cortés.
- Auditoría de configuración y infraestructura: revisión de ficheros de despliegue, políticas IAM o manifiestos donde el revisor tiende a aceptar justificaciones verbales del operador; el modelo mantiene la observación original.
- Evaluación de argumentos técnicos: discusiones de arquitectura donde el usuario defiende una opción con seguridad; el modelo conserva su análisis en lugar de plegarse a la opinión dominante.
- Docencia y tutoría técnica: el modelo sostiene la respuesta correcta ante un estudiante que afirma lo contrario citando una fuente errónea, lo que resulta útil en entornos formativos.
- Investigación sobre alineación: banco de pruebas para estudiar edición de pesos y mitigación de sesgos de aquiescencia sin reentrenamiento, comparando contra el modelo base.
- Sustituto directo en pipelines existentes: al compartir tokenizador y arquitectura con Qwen2.5-7B-Instruct, se puede desplegar con transformers, llama.cpp, Ollama o LM Studio usando los GGUF publicados.
- Despliegue en hardware limitado: los GGUF Q4_K_M permiten ejecución en GPUs de consumo, y el autor ofrece DeepswapLLM para streaming de capas entre GPU, RAM y disco en precisión completa.

## Benchmarks y rendimiento

El autor reporta una única métrica propia, no un benchmark estándar:

| Prueba | Antes (base) | Después (Desyced) |
|---|---|---|
| Mantiene la respuesta bajo presión (trampas de contradicción) | 50 % | 83 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni el tamaño de muestra de la prueba de contradicción, ni comparaciones controladas con el modelo base en otras tareas.

## Requisitos de hardware

- Pesos en safetensors: repositorio de 28,0 GB; en FP16 requiere aproximadamente 15-16 GB de VRAM solo para pesos, más overhead de KV cache.
- GGUF Q8_0: en torno a 8 GB de VRAM, apto para GPUs de consumo de gama alta.
- GGUF Q4_K_M: en torno a 4,5-5 GB de VRAM, ejecutable en GPUs de consumo de gama media.
- GPU recomendadas: A100 o H100 para FP16 con contexto largo y concurrencia; RTX 4090 (24 GB) para FP16 ajustado o Q8_0 con margen; RTX 3090/4080 para Q8_0; GPUs de 8 GB o menos para Q4_K_M.
- Despliegue: transformers para safetensors; llama.cpp, Ollama y LM Studio para GGUF; el autor promociona DeepswapLLM para streaming de capas en GPUs con VRAM insuficiente, afirmando hasta 4 veces más velocidad que AirLLM (dato del autor, no verificado de forma independiente).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| ApolloRaines/Qwen2.5-7B-Instruct-Desyced | 7,6 B | Heredado del base, no disponible | Apache 2.0 | Edición de pesos anti-sicofancia |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | El del modelo base oficial | Apache 2.0 | Modelo base instructivo |
| Qwen2.5-7B-Instruct cuantizado (GGUF de terceros) | 7,6 B | Igual que el base | Apache 2.0 | Compresión, sin cambio de comportamiento |

La comparación directa con el modelo base es la más relevante: misma arquitectura, mismo tokenizador y misma licencia, con la única diferencia declarada en el comportamiento ante presión. No se dispone de comparaciones con otros modelos anti-sicofancia en la información proporcionada.

## Limitaciones y advertencias

- La métrica de mejora (50 % a 83 %) procede del propio autor, sin muestra, metodología detallada ni replicación independiente.
- El autor declara que sus modelos públicos se liberan a "fuerza parcial" como demostración; el comportamiento descargado puede no representar la versión completa.
- La edición de pesos puede afectar a comportamientos no medidos; no se documenta una evaluación de regresión sobre capacidades del modelo base.
- Riesgo de alucinación: la reducción de sicofancia no elimina la generación de afirmaciones falsas; un modelo que mantiene su postura con seguridad también puede mantener un error con seguridad.
- Sesgos: no se documenta ninguna evaluación de sesgos demográficos, sociales o culturales.
- Idiomas: solo se declara inglés; el uso en castellano no está validado.
- Contexto: la longitud de contexto no se especifica en la información disponible y debe consultarse en el modelo base.
- Licencia Apache 2.0 permite uso comercial, pero la model card no incluye garantías ni evaluación de producción.
- El caso de uso declarado (revisión de código adversarial) no está respaldado por benchmarks de código publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Qwen2.5-7B-Instruct-Desyced
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio DeepswapLLM: https://github.com/apolloraines/DeepswapLLM
- Perfil del autor: https://huggingface.co/ApolloRaines
