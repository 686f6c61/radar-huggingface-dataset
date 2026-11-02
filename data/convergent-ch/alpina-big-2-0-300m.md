# Convergent-ch/Alpina-Big-2.0-300M

## Resumen

Alpina-Big-2.0-300M (también denominado Alpina 2.0 Big, con el alias interno "Murmeli") es un modelo de lenguaje denso de tipo Llama, de 299.410.432 parámetros, desarrollado por Convergent (Convergent-ch). Se trata de un entrenamiento **desde pesos aleatorios**, es decir, no es un fine-tuning de un modelo preexistente: el autor declara explícitamente que no se reutilizaron pesos preentrenados, aunque el tokenizador sí procede de HuggingFaceTB/SmolLM2-135M-Instruct.

El modelo se publica como una *research release* experimental, con evaluación muy limitada. La propia model card advierte de que las comprobaciones de identidad (3/3) no implican calidad de benchmark, y que en pruebas simples de código solo supera 1 de 6, por lo que no debe considerarse un asistente de programación. Está orientado a generación de texto conversacional en inglés.

Su relevancia es principalmente como artefacto de investigación reproducible: pesos completos en Safetensors, tokenizador incluido, GGUF F16 y disponibilidad en Ollama, todo bajo licencia Apache-2.0. No compite en rendimiento con modelos de su tamaño entrenados sobre corpus masivos, sino que documenta un pipeline de entrenamiento desde cero sobre subconjuntos de datasets públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama (según tags y model card) |
| Parametros totales | 299.410.432 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF F16 incluido; otras cuantizaciones no disponibles |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF (F16) |

## Arquitectura y entrenamiento

La model card describe el modelo como un Llama denso entrenado desde pesos aleatorios, con 299.410.432 parámetros únicos. No se detallan en la información disponible el número de capas, dimensiones ocultas, cabezas de atención ni la longitud de contexto nativa. El tokenizador proviene de SmolLM2-135M-Instruct, pero los pesos no se reutilizan.

El entrenamiento utiliza prefijos de varios datasets públicos: SmolLM-Corpus (ODC-BY), CodeParrot filtrado por permisividad, Smol-SmolTalk (Apache-2.0) y self-oss-instruct-sc2-exec-filter-50k (ODC-BY). No se indica el número total de tokens vistos, la composición exacta de la mezcla ni si hubo fases de RLHF o DPO. La model card menciona que el formato de chat entrenado usa saltos de línea LF y que la conversión a GGUF no implicó reentrenamiento.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat (`apply_chat_template`) y rol de sistema.
- Respuestas de identidad: la model card reporta 3/3 comprobaciones de identidad correctas.
- Razonamiento básico y conversación multi-turno según el formato de chat entrenado.
- Capacidad de código muy limitada: solo 1/6 en comprobaciones simples de programación, según el autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre entrenamiento desde cero: sirve como referencia reproducible de un pipeline completo (datos, tokenizador, pesos Safetensors, GGUF) para estudiar cómo se comporta un modelo de 300M entrenado con recursos limitados.
- Experimentos de alineación y formato de chat: permite probar plantillas de conversación y roles de sistema en un modelo pequeño y de licencia permisiva.
- Pruebas de despliegue en local: al incluir GGUF F16 y una entrada en Ollama (`girgineron/alpina-big-2.0:300m`), es útil para validar flujos de conversión e inferencia en entornos de escritorio.
- Docencia y demostraciones: su tamaño reducido facilita explicar conceptos de tokenización, generación autoregresiva y evaluación en aulas o talleres.
- Evaluación de robustez y sesgos en modelos pequeños: al ser una release experimental con evaluación mínima, es un caso de estudio para medir alucinación e identidad en modelos de baja escala.
- Base para fine-tuning posterior: al estar bajo Apache-2.0 y en Safetensors, puede servir como punto de partida para experimentos de ajuste supervisado en tareas concretas en inglés.
- No se recomienda para atención al cliente en producción, generación de código en CI/CD ni tareas que requieran contexto largo, dada la falta de datos sobre contexto y su rendimiento declarado en código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta comprobaciones cualitativas: identidad 3/3 y código simple 1/6, sin métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con 299M parámetros, en FP16 los pesos ocupan aproximadamente 0,6 GB; en cuantizaciones de 8 bits, alrededor de 0,3 GB; en 4 bits, en torno a 0,15 GB (estimación a partir del número de parámetros, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 2 GB de VRAM es suficiente para FP16; tarjetas como RTX 3060, RTX 4060 o superiores no presentan problema. Para despliegues en servidor, A100/H100 son innecesarias pero compatibles.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer actuales, e incluso en CPU.
- Opciones de despliegue: transformers (código de ejemplo en la model card), Ollama mediante `girgineron/alpina-big-2.0:300m`, GGUF F16 con llama.cpp u otros runners compatibles; text-generation-inference aparece en los tags.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Alpina-Big-2.0-300M | 299,4M | no disponible | Apache-2.0 | HuggingFace, Ollama, GGUF | Entrenado desde cero, evaluación mínima, inglés |
| SmolLM2-135M-Instruct | 135M | no disponible en esta ficha | Apache-2.0 | HuggingFace | Tokenizador reutilizado por Alpina; modelo preentrenado de referencia de HuggingFaceTB |
| Modelos Llama pequeños de referencia | variable | variable | licencia Llama | HuggingFace | Alpina declara arquitectura tipo Llama, sin afiliación con Meta |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo experimental con evaluación muy limitada; el autor advierte explícitamente de que no se infiera calidad de benchmark a partir de respuestas correctas de identidad.
- Rendimiento bajo en código (1/6 en comprobaciones simples), por lo que no es adecuado como asistente de programación.
- Riesgo de alucinación elevado al ser un modelo de 300M entrenado desde cero con datos limitados.
- Solo inglés declarado; no hay soporte multilingüe verificado.
- Longitud de contexto no documentada; no apto para tareas que requieran ventanas largas.
- Sesgos conocidos: no documentados en la información disponible, pero previsibles por los datasets de origen (SmolLM-Corpus, CodeParrot, Smol-SmolTalk, self-oss-instruct).
- Licencia Apache-2.0 permite uso comercial, pero la falta de evaluación hace desaconsejable su uso en producción sin validación propia.
- Los datasets de entrenamiento no se redistribuyen; aplican sus licencias originales (ODC-BY, Apache-2.0).
- Sin afiliación con Qwen ni con los autores de los datasets, según la model card.

## Enlaces

- HuggingFace: https://huggingface.co/Convergent-ch/Alpina-Big-2.0-300M
- Ollama: `girgineron/alpina-big-2.0:300m` (referencia en la model card)
- Dataset SmolLM-Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset CodeParrot: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset Smol-SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset self-oss-instruct-sc2-exec-filter-50k: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
- Tokenizador de origen: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
