# HQSW/pairwise-aesthetic-supervision

## Resumen

Pairwise Aesthetic Supervision es un conjunto de adaptadores LoRA publicados por HQSW (usuario vinculado al repositorio de investigación github.com/HQuanShaWu) sobre el modelo vision-lenguaje Qwen/Qwen3.5-2B. No es un modelo completo, sino nueve adaptadores PEFT (tres semillas × tres etapas de entrenamiento) más las predicciones de evaluación del estudio. Su objetivo concreto es la comparación estética de imágenes: dado un par de imágenes, decidir cuál es más agradable estéticamente, y de forma secundaria asignar una puntuación escalar de 1 a 10 a una imagen individual.

El problema que aborda es metodológico y aplicado a la vez. El estudio compara supervisión escalar continuada (la práctica habitual en evaluación estética automática) frente a supervisión pareada, con presupuestos igualados de exposición a imágenes y de pasos de optimizador. El resultado principal es que la supervisión pareada mejora la decisión comparativa directa y la robustez posicional (77,08 % de exactitud directa y 95,19 % de consistencia posicional en AVA con la semilla 42, frente a 73,72 % y 83,49 % del control escalar), pero no mejora de forma consistente el ranking escalar subyacente medido en AVA.

Es relevante ahora porque ofrece una receta reproducible, con semillas múltiples y evaluación en un banco independiente (Visual Aesthetic Benchmark), para una tarea donde la mayoría de alternativas son predictores escalares opacos. El repositorio pesa 0,6 GB y se distribuye bajo licencia Apache 2.0, excluyendo intencionadamente los pesos del modelo base y las imágenes de los datasets.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre el módulo de lenguaje de Qwen3.5-2B, modelo vision-lenguaje de tipo transformer (pipeline image-text-to-text) |
| Parámetros totales | No disponible con precisión. Modelo base Qwen3.5-2B (~2B); el adaptador LoRA usa r=16 y alpha=32 sobre los módulos de lenguaje |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible. El ejemplo de carga oficial usa torch.bfloat16; los adaptadores se publican en safetensors |
| Idiomas soportados | No disponible. Los prompts del estudio (comparación y puntuación escalar) están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); incluye MANIFEST.sha256 con checksums |

## Arquitectura y entrenamiento

La arquitectura es un adaptador LoRA aplicado al módulo de lenguaje de Qwen3.5-2B, con rango r=16, alpha=32 y dropout 0,05, fijado a la revisión 15852e8c16360a2fea060d615a32b45270f8a8fc del modelo base. Se publican nueve adaptadores: tres etapas (Scalar SFT, Scalar → Extra Scalar como control con presupuesto igualado, y Scalar → Pairwise SFT como modelo comparativo principal) replicadas en tres semillas (42, 123 y 2026). Los adaptadores de la semilla 42 son los usados en el experimento principal de AVA y en la transferencia a VAB.

El entrenamiento sigue un esquema de dos fases con presupuestos igualados: la fase pairwise y la fase extra scalar igualan pasos de optimizador y exposición a imágenes, aunque difieren en número de tokens supervisados y en la semántica de la tarea. Los datos de AVA se derivan de diferencias de MOS (no de juicios humanos pareados independientes). VAB es estrictamente test-only: ninguna muestra se usó para entrenamiento, ajuste de prompt, selección de checkpoint ni calibración de umbrales. La inferencia de referencia usa decodificación greedy, modo thinking desactivado, entre 65.536 y 262.144 píxeles de imagen y un máximo de 32 tokens nuevos. Las versiones de referencia son Transformers 5.5.4 y PEFT 0.18.1.

## Capacidades

- Comparación estética directa por pares: responde "A" o "B" ante el prompt fijo "Which image is more aesthetically pleasing? Answer with A or B only."
- Robustez posicional: la evaluación incluye remapeo de etiquetas tras el intercambio de orden de las imágenes; el adaptador pairwise alcanza 95,19 % de consistencia posicional en AVA (semilla 42).
- Puntuación estética escalar de una sola imagen, con formato de salida exacto ("The score of this image is X.XX", escala 1-10), usando los adaptadores scalar o extra scalar.
- Procesamiento conjunto de imagen y texto (pipeline image-text-to-text) heredado del modelo base Qwen3.5-2B.
- Transferencia cero-shot a un banco independiente (VAB) en tareas de identificación top-1, bottom-1 y TB-1.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modo thinking se desactiva explícitamente en la inferencia de referencia.
- Capacidades multilingües: no documentadas.
- Otras capacidades especiales (audio, visión más allá de estética): no documentadas.

## Casos de uso

- Curación de bancos de imágenes: ordenar o filtrar un catálogo eligiendo la mejor variante entre pares candidatas mediante comparaciones A/B encadenadas, aprovechando la consistencia posicional del 95,19 % para que el orden de presentación no altere el resultado.
- Selección de salidas en generación de imágenes: dado un mismo prompt ejecutado con varias semillas o parámetros, usar el adaptador pairwise para elegir la imagen preferida antes de publicarla o entregarla al usuario.
- Filtrado de datasets de entrenamiento visual: descartar muestras de baja calidad estética comparando cada imagen contra una referencia de calidad aceptable, útil en pipelines de curación previos al entrenamiento de modelos generativos.
- Control de calidad en fotografía de producto y comercio electrónico: comparar dos tomas del mismo artículo para decidir cuál subir a la ficha, con coste de inferencia bajo al apoyarse en un modelo de ~2B.
- Investigación en estética computacional: reproducir el estudio con las tres semillas publicadas, analizar la diferencia entre supervisión escalar y pareada y auditar el sesgo posicional de los evaluadores estéticos.
- Moderación o priorización de contenido en plataformas de portafolios: preordenar las obras subidas por usuarios mediante comparaciones por pares antes de la revisión humana, usando la salida escalar solo como señal secundaria.
- Evaluación de sistemas de mejora de imagen (restauración, retoque, superresolución): comparar la versión original y la procesada por pares para medir si la mejora se percibe como estética, en lugar de fiarse de métricas de píxel.

## Benchmarks y rendimiento

AVA, semilla 42 (exactitud directa por pares, consistencia posicional, exactitud derivada de la puntuación escalar, SRCC y PLCC):

| Modelo | Exactitud directa por pares | Consistencia posicional | Exactitud derivada de escalar | SRCC | PLCC |
|---|---:|---:|---:|---:|---:|
| Scalar SFT | 70,67 % | 67,17 % | 77,16 % | 0,7422 | 0,7411 |
| Extra Scalar | 73,72 % | 83,49 % | 77,71 % | 0,7508 | 0,7505 |
| Pairwise SFT | 77,08 % | 95,19 % | 77,14 % | 0,7452 | 0,7469 |

La mejora de Pairwise SFT sobre Extra Scalar en exactitud directa es de +3,36 puntos porcentuales, con intervalo de confianza del 95 % por bootstrap pareado de [+2,71; +4,04]. En las semillas 42, 123 y 2026 las mejoras son +3,36, +5,48 y +3,99 puntos (media +4,28; desviación estándar muestral 1,09 puntos). La exactitud derivada de la puntuación escalar no mejora en ninguna de esas semillas.

VAB, transferencia cero-shot, semilla 42:

| Modelo | Top-1 pass³ | Bottom-1 pass³ | TB-1 pass³ | Consistencia posicional Top-1 |
|---|---:|---:|---:|---:|
| Extra Scalar | 22,25 % | 15,00 % | 16,00 % | 39,00 % |
| Pairwise SFT | 29,25 % | 25,50 % | 18,00 % | 47,75 % |

Frente a Extra Scalar, Pairwise SFT gana +7,00 puntos en Top-1 pass³ (IC 95 % [+3,50; +10,50]) y +8,75 puntos en consistencia posicional Top-1 (IC 95 % [+4,50; +13,00]).

## Requisitos de hardware

- VRAM estimada en inferencia: alrededor de 4-6 GB en bfloat16 para el modelo base de ~2B más el adaptador; por debajo de 3 GB si se cuantiza el modelo base (estimación orientativa, no publicada por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; A100, H100 o L40S para lotes grandes o evaluación a escala; RTX 4090 para desarrollo e inferencia interactiva.
- Compatibilidad con GPU de consumo: sí, cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en Mac con memoria unificada suficiente, dado el tamaño del modelo base.
- Opciones de despliegue: Transformers + PEFT es la ruta documentada (Transformers >= 5.5.4, PEFT >= 0.18.1, accelerate, pillow). No se publican pesos GGUF, ni instrucciones para llama.cpp, Ollama o TGI. El soporte en vLLM dependería del soporte de LoRA y del modelo base en esa versión.
- Latencia y throughput: no disponibles. La configuración de referencia es greedy, thinking desactivado, 65.536-262.144 píxeles de entrada y un máximo de 32 tokens nuevos, lo que acota bastante el coste por consulta.

## Comparativa con modelos similares

La model card no ofrece comparaciones contra otros evaluadores estéticos, por lo que los datos de rendimiento de las alternativas figuran como no disponibles.

| Modelo | Parámetros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pairwise Aesthetic Supervision (Qwen3.5-2B + LoRA) | ~2B (base) | No disponible | Comparación estética por pares y puntuación escalar | Apache 2.0 | Adaptadores en HuggingFace |
| Qwen3.5-2B (modelo base) | ~2B | No disponible | Vision-lenguaje general (image-text-to-text) | No disponible en esta ficha | HuggingFace, revisión 15852e8c |
| Evaluadores estéticos escalares dedicados (por ejemplo predictores tipo NIMA, LAION aesthetic predictor o Q-Align) | No disponible | No disponible | Puntuación escalar de estética | Variable según modelo | Repositorios públicos, datos no disponibles en esta ficha |

La diferencia funcional relevante es que este adaptador está optimizado para decidir entre dos imágenes, no solo para puntuar una, y que publica intervalos de confianza y análisis multi-semilla, algo poco habitual en evaluadores estéticos.

## Limitaciones y advertencias

- Las etiquetas de pares de AVA se derivan de diferencias de MOS, no de juicios humanos pareados independientes; parte de la señal supervisada es, por tanto, indirecta.
- VAB contiene 400 tareas y solo se evaluaron los checkpoints de la semilla 42, de modo que las cifras de VAB no estiman la varianza entre semillas de entrenamiento.
- Las fases pairwise y extra scalar igualan pasos de optimizador y exposición a imágenes, pero difieren en número de tokens supervisados y en la semántica de la tarea, lo que limita la interpretación causal de la mejora.
- La mejora no es universal: la exactitud derivada de la puntuación escalar no mejora de forma consistente en AVA en ninguna de las semillas evaluadas.
- La consistencia posicional, aunque alta (95,19 % en AVA), no es del 100 %: persiste un riesgo de sesgo de posición si no se remapean las etiquetas tras intercambiar el orden de las imágenes.
- Riesgo de alucinación: no se documenta una evaluación específica de fidelidad; el modelo base es un vision-lenguaje y puede generar texto no solicitado si no se restringe la decodificación.
- Idiomas: no se declaran idiomas soportados y los prompts evaluados están en inglés; el comportamiento con prompts en castellano no está verificado.
- Licencia: el adaptador es Apache 2.0, pero el modelo base Qwen3.5-2B y los datasets AVA y VAB tienen sus propias condiciones, que hay que respetar por separado. Los pesos base y las imágenes no se incluyen en el repositorio.
- Especialización: se trata de un adaptador para comparación estética, no de un modelo de propósito general; no hay evidencia publicada sobre su comportamiento en otras tareas.
- Uso en producción: se requiere implementar el parseo de salida y el remapeo de etiquetas del evaluador del repositorio de GitHub; ejecutar la inferencia directamente sin ese post-procesado puede producir resultados incorrectos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HQSW/pairwise-aesthetic-supervision
- Repositorio del estudio: https://github.com/HQuanShaWu/pairwise-aesthetic-supervision
- Guía de preparación de datos (AVA, VAB, Qwen): https://github.com/HQuanShaWu/pairwise-aesthetic-supervision/blob/main/docs/data_setup.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B (revisión 15852e8c16360a2fea060d615a32b45270f8a8fc)
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; los enlaces devueltos por el buscador no guardan relación con la ficha.
