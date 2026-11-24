# s2naito/qwen3.5-0.8b-rag-selector-v2

## Resumen

`s2naito/qwen3.5-0.8b-rag-selector-v2` es un ajuste fino por LoRA del modelo base `Qwen/Qwen3.5-0.8B`, desarrollado por el usuario s2naito. No es un modelo conversacional de propósito general, sino un componente especializado de un pipeline RAG (generación aumentada por recuperación) sobre Wikipedia en japonés: recibe una pregunta, los dos mejores fragmentos recuperados y una lista de títulos candidatos, y devuelve en formato JSON el título del artículo que debe consultarse a continuación. Su función es puramente de enrutamiento dentro de una arquitectura de razonamiento en dos saltos (2-hop), de modo que el texto que genera no se muestra al usuario final.

El modelo conserva la arquitectura, la configuración y el tokenizador del Qwen3.5-0.8B original; únicamente cambian los pesos afectados por el entrenamiento LoRA. Con 873.438.784 parámetros (aproximadamente 0,87 mil millones), está pensado para ejecutarse en entornos modestos, incluso en Google Colab, que es donde se realizó todo el procesamiento de datos y el entrenamiento según la model card.

Su relevancia es acotada pero clara para quien construya sistemas RAG multietapa: demuestra un patrón de descomposición de tareas en el que un modelo pequeño y barato se encarga de la selección de evidencia, reservando un modelo mayor y más costoso para la generación de la respuesta final. El modelo está publicado con licencia Apache 2.0 y solo declara soporte para japonés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (idéntica a `Qwen/Qwen3.5-0.8B`); ajuste fino mediante LoRA |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | japonés (`ja`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 1,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B` (revisión `2fc06364715b967f1860aea9cf38778875588b17`) y aplica un ajuste fino supervisado con LoRA de rango `r=16`, `alpha=32` y `target_modules="all-linear"`, durante 2 épocas. El identificador interno del experimento es `ch2000_jh3_ep2_eff8_lr0.0001_sp`, con una tasa de aprendizaje de 0,0001. La arquitectura, la configuración y el tokenizador son idénticos a los del modelo base; solo difieren los pesos objetivo del LoRA.

Los datos de entrenamiento combinan tres fuentes, todas bajo licencia CC BY-SA 4.0: ejemplos de JEMHopQA (`corpus/train.json`), el conjunto `cl-nagoya/auto-wiki-qa` (revisión `672dd0d496352282b4064e944a16e00315b796a8`) y los fragmentos de Wikipedia japonesa distribuidos de `bumbuboon/llm-course-final-2026`. Sobre JEMHopQA se tomó de forma mecánica el siguiente artículo a leer a partir del campo `derivations`, y los ejemplos se repitieron tres veces durante el entrenamiento. Sobre `auto-wiki-qa` se unieron dos preguntas existentes mediante reglas fijas de coincidencia de cadenas (la respuesta de la primera coincide con el título del artículo de la segunda), sin generar texto nuevo. No se documenta el número total de tokens de entrenamiento ni el uso de RLHF o DPO.

La innovación técnica no reside en el modelo en sí, sino en su función dentro del sistema: actúa como selector de artículos en un pipeline RAG de dos saltos, devolviendo `{"title": "..."}` para decidir qué fragmentos distribuidos se incorporan al contexto de un modelo generador de respuestas independiente.

## Capacidades

- Selección de artículos en pipelines RAG: dada una pregunta, los dos mejores fragmentos recuperados y una lista de títulos candidatos, devuelve un único título en JSON.
- Salida estructurada restringida al formato `{"title": "..."}`, pensada para ser consumida por código, no por personas.
- Razonamiento de enrutamiento en dos saltos (2-hop) sobre conocimiento enciclopédico en japonés.
- Comprensión de contexto recuperado en japonés para desambiguar entre candidatos.
- No se documentan capacidades de tool calling, function calling, agentes autónomos, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al japonés según la model card.

## Casos de uso

- Selección de evidencia en RAG de dos saltos: el modelo recibe la pregunta, los fragmentos recuperados y la lista de títulos candidatos, y emite el título del siguiente artículo a consultar; sustituye a un modelo mayor en esta etapa barata y repetitiva.
- Reducción de costes en pipelines RAG: al resolver la selección con 0,87 mil millones de parámetros, se reserva el modelo generador grande solo para la respuesta final, lo que abarata cada consulta del sistema completo.
- Enrutamiento de consultas sobre Wikipedia japonesa: integrado en un servicio de búsqueda o asistente documental, decide qué artículo enciclopédico aporta la información de segundo salto necesaria para responder.
- Evaluación y depuración de pipelines de recuperación: al aislar la etapa de selección, permite medir por separado los errores de recuperación y los de generación en un sistema RAG existente.
- Experimentación académica en entornos con pocos recursos: su tamaño permite reproducir el ajuste fino y la inferencia en Google Colab, tal como documenta el autor, lo que facilita la investigación sobre selección de evidencia.
- Prototipado de asistentes documentales en japonés: sirve como componente de desambiguación cuando varias páginas candidatas comparten entidades o títulos similares y hay que elegir una sola fuente.
- Automatización de flujos de pregunta-respuesta sobre corpus internos en japonés: con un formato de salida JSON fijo, se integra fácilmente en orquestadores que encadenan recuperación, selección y generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 873.438.784 parámetros y pesos safetensors, el repositorio ocupa 1,8 GB, por lo que en precisión completa o media se sitúa en torno a 2-4 GB de memoria, y en cuantizaciones de 8 o 4 bits cabría en menos de 1-2 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4060, RTX 4090) debería poder alojarlo, si bien el autor no publica requisitos.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de tarjetas con 4 GB o más de VRAM, aunque no se documenta oficialmente.
- Opciones de despliegue: no disponible; al publicarse solo en safetensors, requeriría un runtime compatible con transformers o una conversión propia a GGUF para llama.cpp u Ollama. No se documenta soporte para vLLM ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| s2naito/qwen3.5-0.8b-rag-selector-v2 | 873.438.784 | no disponible | Selector de artículos en RAG japonés (2-hop) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (modelo base) | no disponible en la información proporcionada | no disponible | Modelo de propósito general | no disponible en la información proporcionada | Hugging Face |
| Modelos especializados en selección de evidencia RAG | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros modelos directamente comparables en la información proporcionada; la única referencia objetiva es el modelo base del que deriva.

## Limitaciones y advertencias

- Modelo altamente especializado: solo realiza la selección de un título entre candidatos y devuelve JSON; no es apto para generación de texto libre, diálogo ni tareas generales.
- Idioma restringido al japonés según la model card; su rendimiento fuera de ese idioma no está documentado.
- Riesgo de selección errónea del título: un fallo en esta etapa propaga el error al modelo generador y degrada la respuesta final del pipeline.
- Riesgo de alucinación en el título devuelto: al ser un modelo generativo, podría emitir un título que no esté en la lista de candidatos si no se valida la salida por código.
- Dependencia del formato de entrada: espera una pregunta, exactamente los dos mejores fragmentos y una lista de títulos candidatos; otros formatos no están documentados.
- Licencia Apache 2.0 para los pesos, pero los datos de entrenamiento (JEMHopQA, auto-wiki-qa y los fragmentos de Wikipedia) están bajo CC BY-SA 4.0, lo que conviene tener en cuenta al redistribuir o derivar el modelo.
- Sin descargas ni valoraciones en el momento de la consulta (0 descargas, 0 likes), lo que implica ausencia de validación comunitaria independiente.
- No se documentan sesgos específicos, longitud de contexto ni comportamiento en producción; cualquier uso real debería acompañarse de validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/s2naito/qwen3.5-0.8b-rag-selector-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset cl-nagoya/auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
