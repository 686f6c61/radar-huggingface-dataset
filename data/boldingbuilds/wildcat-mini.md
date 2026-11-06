# BoldingBuilds/Wildcat-Mini

## Resumen

Wildcat Mini es un modelo de decisión derivado de Ternary Bonsai 2 27B (familia Qwen3.8-27B, pesos ternarios de PrismML) al que se le ha injertado la cabeza de lectura de d3, un modelo especializado en responder preguntas de decisión con una distribución de probabilidad sobre 255 códigos de respuesta. Lo desarrolla BoldingBuilds y su propósito es ofrecer un motor de clasificación y decisión zero-shot que quepa en 7,4 GiB de VRAM manteniendo los pesos del modelo de lenguaje en formato ternario empaquetado (aproximadamente 2 bits por peso).

El modelo no genera texto libre: devuelve probabilidades calibradas para preguntas de elección múltiple, sí/no y escalas de valoración, en el mismo formato que d3-ultra y Wildcat. Se entrenó con un único LoRA de rango 16 destilado de las respuestas de d3, d3-ultra y Fastino GLiDE sobre unos 36.559 ejemplos de preguntas de decisión provenientes de splits públicos de entrenamiento.

Su relevancia práctica es la relación memoria/rendimiento: alcanza 60,23 en la muestra propia de 2.000 filas del Decision Index público con 7,4 GiB, frente a los 68,84 de d3-ultra en bf16 con unos 54 GB. Es, por tanto, una opción para entornos con GPU de 24 GB donde d3-ultra no cabe, a costa de unos 9 puntos de índice y de mayor latencia por el desempaquetado ternario en tiempo de ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.8-27B) con pesos ternarios empaquetados PQ2_0 + cabeza de lectura d3 de 255 códigos |
| Parametros totales | 27B (modelo de lenguaje base); tamaño del repo 8,0 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternario empaquetado, ~2 bits por peso (códigos de 2 bits + una escala fp16 por cada 128 pesos); variante bf16 de referencia (~49 GB) |
| Idiomas soportados | no disponible |
| Licencia | Fastino Community License (derivada de Fastino GLiDE) |
| Formato de pesos | safetensors (`mini-base.safetensors` con pesos empaquetados, `adapter/adapter.safetensors` para el LoRA, `readout.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte del paquete de d3 (código, tokenizador y la cabeza de lectura de 255 códigos de respuesta) sustituyendo todos los pesos del modelo de lenguaje por los de Ternary Bonsai 2 27B, de formas compatibles con Qwen3.8-27B. Sin entrenamiento, ese ensamblaje solo alcanza 41,91 en la muestra de evaluación, lo que indica que la cabeza de lectura no encaja directamente con los pesos de Bonsai. Sobre esa base se entrena un único LoRA de rango 16 en varias rondas para imitar las probabilidades de respuesta de un profesor: primero d3 sobre unas 33.000 preguntas, después sobre la mezcla de 36.559 preguntas y finalmente sobre 12.000 de ellas combinando las respuestas de d3-ultra y de Fastino GLiDE.

La innovación técnica principal es el servicio en ternario: en tiempo de ejecución los códigos de 2 bits permanecen empaquetados en la GPU y un pequeño kernel de Triton desempaqueta cada capa justo antes de su matmul. Según el autor, esta ruta puntúa de forma prácticamente idéntica a la versión con pesos bf16 completos (60,23 frente a 60,25), lo que valida la aproximación. Los datos de entrenamiento provienen exclusivamente de splits públicos de entrenamiento (CLINC150, BANKING77, DBpedia-14, SQuAD v2, BoolQ, SNLI, GSM8K, MMLU train, HellaSwag, ARC, entre otros muchos) y se verificaron contra el Decision Index para evitar filtraciones; no se usó ningún dato del Decision Index para entrenar.

## Capacidades

- Clasificación zero-shot y decisión: devuelve una probabilidad para cada opción en preguntas de elección múltiple, sí/no y escalas de valoración.
- Salida calibrada en el formato de d3 (255 códigos de respuesta), compatible con el kit del Decision Index.
- Razonamiento implícito de lectura, inferencia y paráfrasis, heredado del entrenamiento sobre SQuAD v2, BoolQ, SNLI, WANLI, PAWS, STS-B y PubMedQA.
- Conocimiento y matemáticas básicas: entrenado sobre GSM8K, AQuA-RAT, MATH, MMLU train y MedMCQA.
- Sentido común y ciencia: HellaSwag, WinoGrande, PIQA, Social IQa, CommonsenseQA, Cosmos QA, ARC, OpenBookQA, QASC y RuleTaker.
- Valoraciones y preferencias: Feedback Collection, HelpSteer2, WMT DA, GoEmotions, Civil Comments, New Yorker Caption Contest e iSarcasmEval.
- Herramientas y búsqueda: entrenado con When2Call y Amazon ESCI (preguntas de invocación de herramientas y relevancia de búsqueda).
- No genera texto libre ni mantiene conversaciones multi-turno; es un modelo de decisión, no un chat.
- Capacidades de imagen, vídeo y preguntas Box/Track: el runtime de d3 las soporta, pero Mini no se midió en ellas.

## Casos de uso

- Enrutado de intención en asistentes conversacionales: dado un turno del usuario, el modelo devuelve la probabilidad de cada intención (entrenado con CLINC150 y BANKING77), lo que permite umbralizar y derivar a un flujo u otro con una sola pasada.
- Clasificación de tickets de soporte: asignación de categoría y tema (DBpedia-14, LEDGAR) con salida probabilística, útil para priorizar colas y medir confianza antes de escalar a un humano.
- Verificación de afirmaciones y control de calidad: preguntas de tipo sí/no sobre si un texto respalda una afirmación (BoolQ, SQuAD v2, VitaminC), aprovechable en pipelines de curación de datos o de moderación.
- Filtrado de relevancia en búsqueda: puntuar pares consulta-documento (Amazon ESCI) para reordenar resultados o descartar candidatos antes de un reranker más costoso.
- Detección de invocación de herramientas: decidir si una consulta requiere llamar a una herramienta externa (When2Call) antes de activar un agente, reduciendo llamadas innecesarias a APIs.
- Evaluación de preferencias y calidad de respuestas: puntuar salidas de otros modelos en escalas (HelpSteer2, WMT DA) para construir jueces automáticos ligeros que quepan en una GPU de 24 GB.
- Análisis de sentimiento y toxicidad a nivel de matiz: clasificación de emociones (GoEmotions) y de comentarios tóxicos (Civil Comments) con distribución de probabilidad en lugar de una etiqueta única.

## Benchmarks y rendimiento

Los datos provienen de la muestra propia del autor de 2.000 filas del conjunto público del Decision Index, no del board oficial. El autor advierte que esta muestra puntúa unos 2,7 puntos por debajo del score público del board para d3-ultra, por lo que las filas deben compararse entre sí y no con el board.

| Modelo (mismas 2.000 filas públicas) | Memoria GPU | Índice |
|---|---|---|
| d3-ultra (bf16) | ~54 GB | 68,84 |
| Wildcat (3-bit de d3-ultra) | 13,2 GiB | 69,39 |
| Wildcat Mini (este modelo) | 7,4 GiB | 60,23 |
| Wildcat Mini, pesos bf16 | ~49 GB | 60,25 |
| Ternary Bonsai 2 27B + lectura d3, sin entrenar | 7,4 GiB | 41,91 |

Latencia por petición (750 peticiones públicas, una a una):

| ms por petición | mediana | p80 | media |
|---|---|---|---|
| d3-ultra, RTX PRO 6000 | 168 | 1.067 | 932 |
| Wildcat Mini, RTX PRO 6000 | 173 | 1.878 | 1.393 |
| Wildcat Mini, RTX 3090 (2.000 filas) | 1.097 | 9.650 | 7.042 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: 7,4 GiB con los pesos cargados; el autor advierte que las peticiones largas necesitan memoria adicional por encima de esa cifra.
- Descarga: unos 7,5 GiB.
- GPU probadas: RTX 3090 (24 GB) y RTX PRO 6000 (96 GB). No se probaron tarjetas de menos de 24 GB.
- GPU recomendadas: cualquier NVIDIA con al menos 24 GB (RTX 3090, RTX 4090, A100, H100, RTX PRO 6000); el kernel de desempaquetado es Triton y solo se ejecutó en CUDA, por lo que no hay soporte verificado en AMD.
- Cabe en GPU de consumo: sí, en RTX 3090 y RTX 4090 (24 GB), con margen para peticiones largas según el autor.
- Despliegue: el paquete incluye su propio motor (`d3_tern.py`) y se ejecuta con el kit del Decision Index (`python -m decision_index run --engine d3_tern:D3TernEngine`). Requiere `transformers`, `triton` y `accelerate`, además de las dependencias de `requirements.txt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: mediana de 173 ms en RTX PRO 6000 y de 1.097 ms en RTX 3090; cola larga notable (p80 de 1.878 ms y 9.650 ms respectivamente) por el desempaquetado ternario capa a capa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria GPU | Índice (muestra propia) | Licencia |
|---|---|---|---|---|---|
| Wildcat Mini | 27B (ternario ~2 bits) | no disponible | 7,4 GiB | 60,23 | Fastino Community License |
| Wildcat | 27B (3 bits) | no disponible | 13,2 GiB | 69,39 | no disponible |
| d3-ultra | 27B (bf16) | no disponible | ~54 GB | 68,84 | Apache-2.0 (según la model card de d3) |
| Ternary Bonsai 2 27B + lectura d3 sin entrenar | 27B (ternario) | no disponible | 7,4 GiB | 41,91 | Apache-2.0 (Bonsai) |

La comparación se limita a los modelos medidos por el autor en la misma muestra; no hay datos de benchmarks estándar que permitan contrastar con modelos de propósito general de tamaño similar.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni sostiene conversaciones; solo devuelve distribuciones de probabilidad sobre opciones predefinidas.
- Rendimiento inferior a d3-ultra y Wildcat: unos 9 puntos por debajo en la muestra del autor. El propio autor recomienda usar Wildcat si hay memoria suficiente.
- Sesgo de evaluación: varios datasets de entrenamiento son splits de train de benchmarks que evalúa el Decision Index, por lo que se espera un rendimiento relativamente mejor en esas tareas.
- No evaluado en el board oficial del Decision Index ni en la muestra completa; todas las cifras provienen de una muestra de 2.000 filas.
- No probado en tarjetas de menos de 24 GB, ni en imágenes, vídeo, preguntas Box y Track, ni en GPU AMD.
- Latencia con cola larga (p80 de 1.878 ms en RTX PRO 6000), poco adecuada para servicios con requisitos estrictos de latencia en el percentil alto.
- Licencia Fastino Community License: es una obra derivada de Fastino GLiDE y puede imponer restricciones al uso comercial; conviene revisar el texto completo antes de desplegar en producción.
- Idiomas soportados no documentados; el entrenamiento se basa en datasets mayoritariamente en inglés, por lo que el rendimiento en castellano no está verificado.
- Riesgo de calibración deficiente fuera de las distribuciones de entrenamiento; las probabilidades deben validarse con datos propios antes de usarlas como umbrales en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BoldingBuilds/Wildcat-Mini
- Licencia Fastino Community License: https://huggingface.co/BoldingBuilds/Wildcat-Mini/blob/main/LICENSES/FASTINO-LICENSE.txt
- Modelo base Ternary Bonsai 2 27B: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- d3 (cabeza de lectura y runtime): https://huggingface.co/vllm-sr/d3
- d3-ultra: https://huggingface.co/vllm-sr/d3-ultra
- Wildcat: https://huggingface.co/BoldingBuilds/Wildcat
- Fastino GLiDE: https://huggingface.co/fastino/GLiDE
