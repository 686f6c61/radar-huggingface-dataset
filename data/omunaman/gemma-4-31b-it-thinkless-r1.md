# omunaman/gemma-4-31b-it-thinkless-r1

## Resumen

Gemma 4 31B-it thinkless edit (round 1) es una modificación no oficial de `google/gemma-4-31B-it` publicada por el usuario omunaman en Hugging Face. No se trata de un reentrenamiento ni de un fine-tuning: el autor aplica una edición aritmética sobre los pesos del modelo base, sin entrenamiento adicional. Concretamente, desvincula la capa de salida (LM head) de los embeddings de entrada y modifica una única fila de esa matriz, la correspondiente al token de fin de razonamiento, sumándole un vector de norma 6,17. El objetivo es que el modelo deje de razonar antes cuando la respuesta ya está decidida, reduciendo el coste en tokens por respuesta correcta.

El modelo conserva la arquitectura, el tamaño y las capacidades del Gemma 4 31B-it original de Google (aproximadamente 32.680 millones de parámetros, modalidad image-text-to-text, licencia Apache 2.0). La relevancia de esta ficha radica en que documenta un experimento de edición de pesos orientado a eficiencia en inferencia, con mediciones propias del autor sobre 4.340 preguntas de benchmarks públicos, y con limitaciones explícitas: la mejora en precisión es marginal y dependiente de la temperatura, mientras que el uso con herramientas y la generación de código se degradan de forma notable.

Se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, publicado el 20 de noviembre de 2026. No cuenta con respaldo oficial de Google y su model card es breve, centrada en la metodología del edit y en los resultados medidos, sin documentación adicional sobre idiomas, cuantizaciones o datos de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Gemma 4 31B-it; capa de salida desvinculada de los embeddings de entrada (`tie_word_embeddings: false`) |
| Parametros totales | 32.682.372.656 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; el autor menciona FP8 en carga para sus mediciones |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 65,4 GB; incluye `model-lm_head.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-31B-it`, un transformer multimodal de aproximadamente 32.680 millones de parámetros que procesa entradas de imagen y texto y genera texto. Sobre esa base, el autor no realiza ningún entrenamiento: la modificación consiste en desvincular la matriz de la capa de salida (LM head) de los embeddings de entrada, almacenarla por separado en `model-lm_head.safetensors` y alterar una sola fila de esa matriz. La fila 101, que corresponde al token de fin de razonamiento, recibe la suma de un vector de norma 6,17, lo que incrementa la probabilidad de que el modelo emita ese token cuando la respuesta ya está resuelta. Todos los demás pesos permanecen idénticos a los de Google.

La innovación técnica es, por tanto, una edición de pesos dirigida (weight editing) de tipo steering sobre un único token especial, sin RLHF, DPO ni datos adicionales. El autor reporta que las mediciones se realizaron con el motor vLLM sobre una NVIDIA B200, cargando el modelo en FP8, y que el experimento forma parte de un proyecto sobre el coste de una respuesta correcta (run 3, 19 de noviembre de 2026). No se documentan en la información disponible el número de tokens de entrenamiento del modelo base, la composición de su dataset ni detalles sobre su proceso de alineación.

## Capacidades

- Generación de texto y respuesta a preguntas multimodales (entrada de imagen y texto, salida de texto), heredadas del Gemma 4 31B-it.
- Razonamiento con modo de pensamiento (thinking) en el modelo base; el edit busca acortar ese razonamiento cuando la respuesta está decidida.
- Procesamiento de imágenes junto con texto, según el pipeline `image-text-to-text`.
- Conversación multi-turno (tag `conversational`).
- Soporte de tool calling y function calling en el modelo base, aunque el autor advierte que el edit degrada este uso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de razonamiento abreviado: el efecto buscado del edit es reducir los tokens de pensamiento por respuesta correcta (0,52x a 0,63x según temperatura).

## Casos de uso

- Respuesta a preguntas de un solo turno: el edit está diseñado y medido para este escenario, donde el modelo puede terminar el razonamiento antes sin penalizar la precisión de forma significativa (diferencias de +0,51 a -0,65 puntos según temperatura).
- Clasificación y extracción de información sobre documentos con imagen: al heredar la modalidad image-text-to-text del Gemma 4 31B-it, puede procesar capturas, formularios o páginas escaneadas y devolver texto estructurado, con un coste por respuesta inferior al del modelo original.
- Evaluación comparativa de técnicas de edición de pesos: sirve como artefacto de referencia para investigadores que estudien steering sobre tokens especiales y su impacto en el coste de inferencia.
- Generación de resúmenes de contenido visual y textual en pipelines por lotes: la reducción de tokens por respuesta (hasta 0,52x) abarata el procesamiento masivo de documentos cuando no se requiere tool calling.
- Asistente conversacional de propósito general sin herramientas: para diálogos informativos de varios turnos en los que no se invocan funciones externas, el modelo mantiene el comportamiento del base con menor verbosidad en el razonamiento.
- Investigación sobre eficiencia en inferencia: permite medir el ahorro de tokens y su efecto en precisión a distintas temperaturas (0, 0,5, 0,8 y 1,0) sobre un conjunto de 4.340 preguntas de benchmarks públicos.

## Benchmarks y rendimiento

El autor publica una única tabla de mediciones propias frente a Gemma 4 31B-it sin modificar y con thinking activado, sobre 4.340 preguntas reservadas de benchmarks públicos, ejecutadas una sola vez en una NVIDIA B200 con FP8 en carga:

| Temperatura | 0 | 0,5 | 0,8 | 1,0 |
|---|---|---|---|---|
| Diferencia de precisión (puntos) | +0,51 | -0,65 | -0,46 | -0,48 |

| Métrica | Resultado |
|---|---|
| Tokens por respuesta correcta (frente al base) | 0,52x a 0,63x según temperatura |
| Tool calling multi-turno | Pérdida de ~23 puntos |
| LiveCodeBench (mitades de desarrollo) | Pérdida de ~6 puntos |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 32.680 millones de parámetros, en FP16 serían necesarios aproximadamente 65 GB de VRAM, y en FP8 en torno a 33 GB, cálculo derivado del tamaño y no de una medición publicada.
- GPU recomendadas: el autor realizó las mediciones en una NVIDIA B200; no se documentan otras configuraciones probadas.
- Cabe en GPU de consumo: no disponible; por tamaño, un modelo de ~32,7B en cuantizaciones de 4 bits podría ajustarse a GPUs de 24 GB, pero no hay confirmación del autor ni artefactos GGUF publicados.
- Opciones de despliegue: el autor cita vLLM como motor de sus mediciones; la librería declarada es transformers. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se reporta la reducción relativa de tokens por respuesta correcta (0,52x a 0,63x).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| omunaman/gemma-4-31b-it-thinkless-r1 | 32.682.372.656 | no disponible | apache-2.0 | Hugging Face, 0 descargas | Edit de pesos sobre Gemma 4 31B-it; pierde ~23 puntos en tool calling y ~6 en LiveCodeBench |
| google/gemma-4-31B-it | no disponible en la información | no disponible | apache-2.0 | Modelo base oficial de Google | Punto de referencia de las mediciones; mantiene tool calling y rendimiento en código |
| Otras alternativas de ~30B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- No es una publicación oficial de Google; el autor lo indica de forma explícita en la model card.
- El edit degrada el tool calling multi-turno en aproximadamente 23 puntos: tras un resultado de herramienta, el razonamiento no puede terminar y la conversación se extiende hasta el límite de tokens.
- Pérdida de aproximadamente 6 puntos en LiveCodeBench (mitades de desarrollo), por lo que no es adecuado para generación de código.
- La mejora de precisión es marginal y dependiente de la temperatura: positiva solo a temperatura 0 (+0,51 puntos) y negativa en el resto (-0,65, -0,46 y -0,48).
- Las mediciones se realizaron una sola vez, sobre 4.340 preguntas y en una única GPU (B200 con FP8), sin réplicas publicadas.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones de idioma en la información disponible; se heredan los del modelo base, no detallados aquí.
- La licencia Apache 2.0 permite uso comercial, pero al ser una modificación no oficial, la responsabilidad sobre el comportamiento del artefacto recae en quien lo despliegue.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.
- Uso recomendado por el propio autor: respuesta a preguntas, no uso con herramientas ni código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omunaman/gemma-4-31b-it-thinkless-r1
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
