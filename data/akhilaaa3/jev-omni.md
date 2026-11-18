# akhilaaa3/Jev-Omni

## Resumen

Jev-Omni es un clasificador multimodal de decisiones publicado por el usuario akhilaaa3 en Hugging Face. A diferencia de un modelo generativo al uso, no produce texto libre: recibe un estado (contexto), una pregunta y un conjunto de opciones, y devuelve una probabilidad calibrada para cada opción. Está construido sobre `google/gemma-4-12B-it` mediante un ajuste fino con 30.000 preguntas y un posterior merge de pesos, y cubre cuatro modalidades: texto, imagen, audio y vídeo.

El modelo resuelve un problema concreto: convertir un LLM multimodal en una cabeza de decisión tipada (preguntas de sí/no, elección múltiple y puntuación) con probabilidades utilizables en producción, en lugar de explicaciones generadas que requieren post-procesado. Con 11.959.730.224 parámetros (aproximadamente 12B) y licencia Apache-2.0, se posiciona como una alternativa de pesos abiertos a clasificadores propietarios y a modelos multimodales mucho mayores.

Su relevancia actual radica en la combinación de tamaño moderado, latencia baja en GPU de datacenter (83 ms para texto de ~2k tokens en H200) y resultados publicados en MMAU (63,10%) y MVBench (53,10%), que lo sitúan por debajo de modelos de cientos de miles de millones de parámetros pero con un coste de inferencia muy inferior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Gemma 4 (tag `gemma4_unified`); cabeza de clasificación sobre 256 opciones |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (la model card solo menciona FP32 para pesos y autocast BF16 en inferencia) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it`, un transformer multimodal con torre de visión, codificador de audio y muestreo de vídeo a 16 fotogramas. Sobre esa base se añade una cabeza de decisión que acepta hasta 256 opciones y emite una distribución de probabilidad; el autor indica que el mejor soporte está en ≤20 opciones y que por encima de ese umbral la calidad no está establecida. El pipeline declarado en Hugging Face es `text-classification`, aunque las capacidades reales abarcan image-text-to-text y audio.

El ajuste fino se realizó con 30.000 preguntas (run de fine-tuning declarado en la model card) y los pesos se publicaron como modelo fusionado (tag `merged`). No se detallan en la información disponible la composición del dataset, el número de tokens de entrenamiento ni si hubo RLHF o DPO. La calibración es explícita: el autor reporta un ECE de 0,0400 en DecisionBench Medium con 10 bins, lo que indica que las probabilidades están razonablemente alineadas con la frecuencia empírica de acierto. El audio se limita a 30 segundos por entrada y el vídeo a 16 fotogramas.

## Capacidades

- Clasificación de decisiones multimodal: responde preguntas de sí/no, elección múltiple y puntuación con una probabilidad por opción, sin generar explicaciones.
- Entrada de texto: estados y preguntas en lenguaje natural, con ejemplos de razonamiento temporal ("The meeting starts at 10 AM. It is now 9 AM.").
- Entrada de imagen: clasificación condicionada a una imagen mediante `modality="image"`.
- Entrada de audio: hasta 30 segundos por clip, con `modality="audio"` (requiere ffmpeg).
- Entrada de vídeo: muestreo de 16 fotogramas, con `modality="video"`.
- Interfaz tipada de decisión: preguntas noul (sí/no), choice y score, con salida calibrada.
- Hasta 256 opciones por pregunta en la cabeza, con calidad establecida solo hasta 20.
- No soporta tool calling, function calling ni razonamiento multi-paso agéntico según la información disponible; es un clasificador, no un generador.

## Casos de uso

- Moderación y triaje de contenido multimodal: clasificar publicaciones con texto, imagen o vídeo en categorías predefinidas (permitido, revisar, bloquear) usando probabilidades calibradas para fijar umbrales de escalado a revisión humana.
- Verificación de estados en asistentes conversacionales: dado un contexto de diálogo y una pregunta binaria ("¿el usuario ha confirmado la cita?"), obtener una probabilidad directamente consumible por la lógica de negocio, sin parsear texto generado.
- Enrutamiento de tickets de soporte: con hasta 20 opciones de categoría, asignar cada incidencia a un equipo con una confianza medible; el ECE de 0,0400 permite usar la probabilidad como señal de derivación.
- Análisis de reuniones y audio corto: clasificar clips de hasta 30 segundos (por ejemplo, decidir si una intervención contiene una objeción o una aprobación) en pipelines de transcripción y post-procesado.
- Inspección de vídeo para control de calidad: con 16 fotogramas por muestra, clasificar escenas industriales o de seguridad en categorías discretas; los 504 ms por vídeo en H200 lo hacen viable en lotes.
- Evaluación automática de modelos y agentes: usar el clasificador como juez binario o de elección múltiple sobre salidas de otros sistemas, aprovechando la calibración para agregar puntuaciones.
- Filtrado previo en pipelines RAG multimodales: decidir si un documento o imagen es relevante para una consulta antes de invocar un modelo generativo mayor, reduciendo coste por consulta.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| DecisionBench Medium (80 escenarios / 293 preguntas) | Accuracy (media por escenario) | 87,57% |
| DecisionBench Medium | Micro accuracy | 86,01% |
| JevBench (195 grupos emparejados / 231 decisiones) | Accuracy | 86,15% |
| JevBench | Micro accuracy | 87,45% |
| MMAU (1.000 preguntas) | Micro accuracy | 63,10% |
| MVBench (14 tareas / 2.786 preguntas) | Accuracy | 53,10% |
| MVBench | Micro accuracy | 53,09% |
| DecisionBench Medium | ECE (10 bins) | 0,0400 |

Latencia en H200 en caliente (medianas sobre 20 peticiones con backend optimizado, sin preprocesado ni red): 83 ms para texto de ~2k tokens, 26 ms para imagen, 31 ms para audio de 13 segundos y 504 ms para vídeo de 16 fotogramas.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 50 GB antes de overhead de runtime; la inferencia usa autocast BF16.
- VRAM estimada: no disponible con precisión; por el tamaño de pesos (50 GB en FP32) se requiere al menos una GPU de 80 GB para cargar el modelo tal cual, o cuantización no documentada para reducir huella.
- GPU recomendadas: H200 para las latencias publicadas; A100 80 GB y H100 80 GB son opciones razonables por capacidad de memoria, aunque el autor no publica cifras para ellas.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en tarjetas de 48 GB en FP32; no se documentan pesos GGUF ni cuantizaciones que permitan ejecución en consumer.
- Despliegue: carga mediante `transformers` con el loader propio `load_jev_omni` del repositorio; requiere CUDA y ffmpeg para audio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput: no disponible; solo se publican latencias por petición individual.

## Comparativa con modelos similares

| Modelo | Parámetros | MMAU | MVBench | Modalidades | Licencia |
|---|---:|---:|---:|---|---|
| Jev-Omni | 12B | 63,10% | 53,10% | Texto, imagen, audio, vídeo | Apache-2.0 |
| Inkling | 975B total / 41B activos | 77,20% | No disponible | Texto, imagen, audio | No disponible en la información |
| Qwen3.5-397B-A17B | 397B total / 17B activos | No disponible | 77,60% | Texto, imagen, vídeo | No disponible en la información |

Las puntuaciones de referencia son las reportadas oficialmente por sus desarrolladores y pueden usar protocolos de evaluación distintos, según advierte el propio autor. Jev-Omni sacrifica precisión frente a modelos 30-80 veces mayores a cambio de un coste de inferencia y unos requisitos de memoria muy inferiores.

## Limitaciones y advertencias

- Calidad no establecida por encima de 20 opciones, aunque la cabeza acepte hasta 256.
- Audio limitado a 30 segundos y vídeo a 16 fotogramas; no apto para contenido largo sin segmentación previa.
- Es un clasificador, no un generador: no produce explicaciones, tool calling ni razonamiento multi-paso.
- No se documentan los idiomas soportados ni la composición del dataset de entrenamiento, lo que impide evaluar sesgos lingüísticos o culturales.
- Riesgo de alucinación estructural bajo (salida restringida a opciones), pero las probabilidades pueden ser incorrectas en dominios fuera de la distribución de entrenamiento; el ECE de 0,0400 corresponde solo a DecisionBench Medium.
- Licencia Apache-2.0 para los pesos, siguiendo a Gemma 4; los derechos del dataset son independientes y deben verificarse por separado.
- El autor declara que el modelo no está afiliado a TypeSafe AI ni a su modelo Jev, pese a implementar una interfaz similar; conviene revisar implicaciones de marca en uso comercial.
- Requiere GPU CUDA y ffmpeg; no hay soporte documentado para CPU ni para backends de inferencia habituales en producción (vLLM, TGI).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akhilaaa3/Jev-Omni
- Dataset DecisionBench: https://huggingface.co/datasets/akhilaaa3/decision-bench
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Requisitos de instalación: https://huggingface.co/akhilaaa3/Jev-Omni/resolve/main/requirements.txt
- Modelo comparado Inkling: https://huggingface.co/thinkingmachines/Inkling
- Modelo comparado Qwen3.5-397B-A17B: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
