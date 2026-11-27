# exea-labs/exealm-nairr

## Resumen

ExeaLM es una familia de modelos de lenguaje de investigación desarrollada por Exea Labs en el marco del estudio de escalado del piloto NAIRR (National AI Research Resource), entrenada con horas de GPU H100 en el San Diego Supercomputer Center (Expanse). La familia incluye el modelo ExeaLM propiamente dicho y varios modelos de referencia (baselines) entrenados con los mismos datos, los mismos tokens y la misma receta, de modo que la comparación aísla diferencias de diseño arquitectónico. Se trata de modelos base pequeños, en el rango de 0,1B a 0,25B parámetros, con entre 0,4B y 10B tokens de entrenamiento, diseñados para continuar texto y no como asistentes conversacionales.

La arquitectura ExeaLM combina capas de atención con compuerta, QK-norm, value residual y XSA, junto con una capa TONN (circuitos de procesamiento de señal buscados automáticamente) situada en la capa central. Además, el modelo lee flujos de cuatro ventanas en el último 20% del entrenamiento. El repositorio también aloja una implementación propia del diseño Qwen3.5 (con Gated DeltaNet en 3 de cada 4 capas) y un Llama simple, todos entrenados bajo las mismas condiciones para servir de comparación controlada.

El modelo es relevante en el contexto de la investigación abierta sobre arquitecturas alternativas a los transformers convencionales, ya que publica resultados reproducibles (bits por byte sobre 18 conjuntos de validación, con 3 semillas) y libera código, receta de datos y pesos bajo licencia Apache 2.0. Su tamaño reducido lo hace apto para experimentación académica y para estudiar el efecto de componentes arquitectónicos concretos (la capa TONN, el entrenamiento por flujos) sin necesidad de grandes clústeres.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención con compuerta, QK-norm, value residual y XSA, más una capa TONN en la capa central |
| Parametros totales | 0,1B y 0,25B (variantes publicadas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (se entrenó con ventanas de 4.096 tokens en la fase de flujos) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en), japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ExeaLM es un transformer con varias modificaciones sobre la atención estándar: compuertas en las capas de atención, normalización QK, value residual y XSA (un mecanismo de atención adicional no detallado en la información disponible). La innovación principal es la inclusión de una capa TONN (circuitos de procesamiento de señal buscados) en la posición central del modelo, que sustituye a una capa de atención convencional. Durante el último 20% del entrenamiento, el modelo lee flujos de cuatro ventanas de 4.096 tokens, lo que le permite procesar documentos largos como secuencias continuas en lugar de ventanas independientes.

El entrenamiento se realizó sobre el conjunto de datos exea-labs/exealm-pretrain, con volúmenes de 0,4B a 10B tokens según la variante (indicado en el nombre como tokens por parámetro: 4.1x, 111x). No se menciona en la información disponible el uso de RLHF, DPO ni ajuste por instrucciones; los modelos son base y continúan texto. El estudio incluye variantes de post-entrenamiento (prefijos libpost_, ragpost_ y boardpost_) que prueban una biblioteca destilada con recuperación y agentes que comparten un tablero, pero no se detallan sus recetas.

## Capacidades

- Generación de texto y continuación de texto (modelo base, no ajustado para chat).
- Razonamiento y conocimiento sobre temas de investigación, matemáticas y código, según los conjuntos de evaluación utilizados.
- Procesamiento de documentos largos mediante el modo de flujos (cuatro ventanas de 4.096 tokens leídas como secuencia continua).
- Recuperación aumentada: la variante ragpost_exealm_100m_s0 lee una entrada de biblioteca antes de responder, con búsqueda BM25 sobre 18.545 entradas.
- Capacidades multilingües limitadas a inglés y japonés.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Investigación académica sobre arquitecturas: el modelo permite estudiar el efecto aislado de la capa TONN y del entrenamiento por flujos, ya que los baselines comparten datos y receta. Es adecuado por su tamaño reducido y por la publicación de resultados con 3 semillas.
- Recuperación aumentada de bajo coste: la variante ragpost_100m_s0 (unos 400 MB) responde preguntas de investigación leyendo una entrada de biblioteca seleccionada por BM25, con una puntuación de 0,588 bits por byte frente a 1.635 sin biblioteca. Encaja en entornos con recursos limitados.
- Experimentación con modelos base en GPUs de consumo: con 0,1B y 0,25B parámetros, cabe en tarjetas convencionales y permite iterar sobre prompts y flujos de continuación de texto sin infraestructura dedicada.
- Evaluación de técnicas de atención eficiente: el modo de flujos sobre documentos de 4.096 tokens sirve para comparar el rendimiento de atención con compuerta frente a atención estándar en tareas de contexto largo.
- Docencia y formación: el código de carga y el script `ask.py` del repositorio permiten demostrar el funcionamiento de un modelo base con recuperación en un entorno controlado.
- Reproducción de estudios de escalado: la receta de datos y los resultados publicados en el repositorio de GitHub permiten replicar el estudio de escalado con distintos tamaños y semillas.

## Benchmarks y rendimiento

Resultados publicados en la model card: bits por byte sobre 18 conjuntos de validación (menor es mejor), media de 3 semillas.

| Configuración | ExeaLM | Qwen3.5-style | Plain Llama |
|---|---|---|---|
| 0,1B, ventanas leídas por separado | 1,157 | 1,190 | 1,200 |
| 0,25B, ventanas leídas por separado | 1,014 | 1,026 | 1,041 |
| 0,1B, documentos de 4.096 tokens leídos como flujo | 1,096 | 1,157 | 1,584 |
| 0,25B, documentos de 4.096 tokens leídos como flujo | 0,955 | 0,997 | 1,185 |

ExeaLM supera a ambos baselines en los 54 pares conjunto-semilla en cada tamaño. Con biblioteca y búsqueda por palabras clave, el ExeaLM de 0,1B baja de 1,645 a 0,590 bits por byte en preguntas de investigación reservadas; la variante ragpost alcanza 0,588 con biblioteca frente a 1,635 sin ella, y la búsqueda selecciona la entrada correcta en el 86% de los casos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por tamaño, un modelo de 0,1B en fp16 requiere aproximadamente 0,2 GB de pesos y un 0,25B unos 0,5 GB, a los que se suma el estado de activaciones y caché.
- GPU recomendadas: no especificadas en la información disponible; el entrenamiento se realizó con H100 del piloto NAIRR.
- GPU de consumo: por tamaño, cabe en tarjetas consumer convencionales; no se confirma una lista concreta.
- Opciones de despliegue: carga vía safetensors con el código del repositorio de GitHub (`exealm`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ExeaLM (este) | 0,1B / 0,25B | No disponible (ventanas de 4.096 en flujos) | Apache 2.0 | Hugging Face y GitHub | Incluye baselines con misma receta |
| Qwen3.5-style (build propio) | 0,1B / 0,25B | No disponible | Apache 2.0 | En el mismo repositorio | Gated DeltaNet en 3 de cada 4 capas |
| Plain Llama (baseline) | 0,1B / 0,25B | No disponible | Apache 2.0 | En el mismo repositorio | Atención estándar en todas las capas |

No se dispone de comparación con modelos externos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo base: continúa texto, no es un asistente conversacional ni está ajustado para seguridad.
- Tamaño muy reducido (0,1B-0,25B): las respuestas son cortas y a menudo aproximadas en lugar de exactas.
- En el modo con biblioteca, solo puede usar la información contenida en ella; no dispone de conocimiento externo más allá de lo aprendido.
- Idiomas limitados a inglés y japonés; no se documenta soporte de castellano.
- Riesgo de alucinación inherente a los modelos base pequeños; no se han publicado evaluaciones de sesgo en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está diseñado ni validado para producción.
- El baseline de atención fuerte (strongllama_) iguala de cerca a ExeaLM en ventanas leídas por separado, según advierte la propia model card; las ventajas se concentran en el modo de flujos.
- Los resultados publicados son bits por byte sobre conjuntos de validación propios, no benchmarks estándar de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/exea-labs/exealm-nairr
- Repositorio de código y resultados: https://github.com/exea-labs/ExeaLM/tree/nairr
- Resultados del estudio: https://github.com/exea-labs/ExeaLM/tree/nairr/results/expanse/README.md
- Dataset de preentrenamiento: https://huggingface.co/datasets/exea-labs/exealm-pretrain
- Biblioteca para recuperación: https://huggingface.co/datasets/exea-labs/exealm-library
- Notas de investigación: https://blog.exealabs.org
