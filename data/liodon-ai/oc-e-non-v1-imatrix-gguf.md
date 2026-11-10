# liodon-ai/Oc-e-Non-v1-imatrix-GGUF

## Resumen

Oc-e-Non-v1-imatrix-GGUF es un conjunto de cuantizaciones GGUF del modelo p-e-w/Oc-e-Non-v1, publicado por Liodon AI. El modelo base deriva de Qwen/Qwen3-4B-Instruct-2507, un transformer denso de 4.022.468.096 parámetros (aproximadamente 4B), orientado a generación de texto conversacional. El repositorio no incluye los pesos en formato original, sino únicamente las versiones cuantizadas para inferencia local con llama.cpp, Ollama, LM Studio y Jan.

La aportación principal de esta publicación es el uso de calibración iMatrix (importance matrix) durante la cuantización. En lugar de tratar todos los pesos por igual, iMatrix ejecuta 128 fragmentos de calibración sobre el modelo en precisión completa para identificar qué pesos son más sensibles, y asigna mayor precisión a esos. El resultado, según el autor, es una mejora perceptible de coherencia y seguimiento de instrucciones en cuantizaciones de 2, 3 y 4 bits sin aumentar el tamaño del archivo.

El modelo es relevante para quienes necesitan desplegar un LLM de 4B en hardware de consumo: la cuantización IQ2_M ocupa 1,51 GB y la Q4_K_M recomendada 2,50 GB, lo que permite ejecución en GPUs con 2-5 GB de VRAM. La licencia es "other" y no se especifican los idiomas soportados ni los detalles del entrenamiento del modelo base en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_M, IQ3_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (todas con iMatrix) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de aproximadamente 4B parámetros, heredado de Qwen3-4B-Instruct-2507 a través de p-e-w/Oc-e-Non-v1. No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada. Tampoco se detalla si Oc-e-Non-v1 introduce fine-tuning adicional sobre Qwen3-4B-Instruct-2507 ni con qué datos.

La innovación técnica documentada reside en el proceso de cuantización, no en el modelo en sí. La calibración iMatrix se realizó con 2 millones de tokens de WikiText-103, distribuidos en 128 fragmentos de calibración que se pasan por el modelo en precisión completa para estimar la importancia de cada peso. Esa matriz de importancia guía la asignación de bits en las cuantizaciones de 2 a 8 bits. El autor afirma que en Q2, Q3 y Q4 esto produce mejor coherencia y seguimiento de instrucciones que la cuantización estándar al mismo tamaño de archivo. No se documentan técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones (pipeline text-generation, tag conversational).
- Razonamiento y respuesta multi-turno, según la naturaleza instruct del modelo base Qwen3-4B-Instruct-2507.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Ejecución local mediante llama.cpp, Ollama, LM Studio y Jan.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en portátil: con la cuantización IQ3_M (1,96 GB) o Q4_K_M (2,50 GB) el modelo cabe en GPUs de consumo con 2-3 GB de VRAM, lo que permite un chat privado sin conexión a servicios externos.
- Prototipado rápido con Ollama: el comando `ollama run hf.co/liodon-ai/Oc-e-Non-v1-imatrix-GGUF:Q4_K_M` permite levantar el modelo en un solo paso para validar prompts y flujos conversacionales antes de invertir en infraestructura mayor.
- Integración en aplicaciones de escritorio con LM Studio o Jan: el formato GGUF y la búsqueda por nombre de repositorio facilitan incorporar el modelo como backend de texto en herramientas de escritorio sin gestión manual de pesos.
- Despliegue en entornos con memoria limitada: la variante IQ2_M (1,51 GB, ~2 GB de VRAM) permite ejecutar un LLM de 4B en dispositivos con recursos muy restringidos, a costa de menor fidelidad.
- Evaluación comparativa de cuantizaciones: al ofrecer siete niveles (de IQ2_M a Q8_0) con y sin iMatrix (repositorio hermano `liodon-ai/Oc-e-Non-v1-GGUF`), sirve para medir el impacto de la calibración iMatrix en la calidad de salida a igual tamaño.
- Procesamiento por lotes de texto en CPU: las cuantizaciones de 2-4 bits permiten ejecutar inferencia en CPU con llama.cpp cuando no hay GPU disponible, con throughput menor pero funcional para tareas de generación no interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según la tabla del autor: IQ2_M ~2 GB, IQ3_M ~2 GB, IQ4_XS ~3 GB, Q4_K_M ~3 GB, Q5_K_M ~3 GB, Q6_K ~4 GB, Q8_0 ~5 GB.
- Tamaño en disco: de 1,51 GB (IQ2_M) a 4,28 GB (Q8_0); el repositorio completo ocupa 18,7 GB.
- GPU recomendadas: no disponibles de forma explícita; por el rango de VRAM, cualquier GPU con 2-5 GB de memoria dedicada es suficiente. No se documentan modelos concretos (A100, H100, RTX 4090).
- Cabe en GPU de consumo: sí, en todas las variantes hasta Q8_0, dado que el máximo estimado es ~5 GB de VRAM.
- Opciones de despliegue: llama.cpp (`llama-cli -hf ...`), Ollama, LM Studio y Jan.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Oc-e-Non-v1-imatrix-GGUF (esta ficha) | ~4B | no disponible | other | GGUF (iMatrix) | Cuantizaciones con calibración iMatrix; 1,51-4,28 GB |
| Qwen/Qwen3-4B-Instruct-2507 | ~4B | no disponible | no disponible | safetensors y otros | Modelo base de la cadena; pesos en precisión completa |
| p-e-w/Oc-e-Non-v1 | ~4B | no disponible | other | no disponible | Modelo intermedio del que se derivan estas cuantizaciones |
| liodon-ai/Oc-e-Non-v1-GGUF | ~4B | no disponible | other | GGUF (sin iMatrix) | Mismas cuantizaciones sin calibración iMatrix; referencia para comparar calidad |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Licencia "other": no se especifican los términos exactos; es necesario consultar la licencia del modelo base (p-e-w/Oc-e-Non-v1 y, en última instancia, Qwen3-4B-Instruct-2507) antes de cualquier uso comercial.
- El modelo base es de 4B parámetros: la capacidad de razonamiento, conocimiento factual y seguimiento de instrucciones complejas es inferior a la de modelos de mayor tamaño; se espera una tasa de alucinación mayor en dominios especializados.
- Las cuantizaciones de 2 y 3 bits (IQ2_M, IQ3_M) degradan la fidelidad respecto a Q6_K y Q8_0; el autor las describe como "smallest usable" y "tradeoff", no como equivalentes al modelo completo.
- No se documentan los idiomas soportados; el rendimiento en castellano no está verificado.
- No se documenta la longitud de contexto efectiva del modelo cuantizado; no debe asumirse la del modelo base sin verificación.
- La calibración iMatrix se realizó con WikiText-103 (inglés, texto enciclopédico); su efecto sobre otros dominios o idiomas no está medido.
- El repositorio no incluye pesos en precisión completa ni safetensors: solo es utilizable con runtimes compatibles con GGUF.
- No se han publicado benchmarks en la información disponible, por lo que las afirmaciones de calidad del autor no están respaldadas por métricas públicas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/liodon-ai/Oc-e-Non-v1-imatrix-GGUF
- Modelo base (intermedio): https://huggingface.co/p-e-w/Oc-e-Non-v1
- Modelo base original: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Cuantizaciones sin iMatrix: https://huggingface.co/liodon-ai/Oc-e-Non-v1-GGUF
- Perfil del cuantizador: https://huggingface.co/liodon-ai
- Dataset de calibración: https://huggingface.co/datasets/wikitext
