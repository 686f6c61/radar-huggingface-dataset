# ghostsas001/kvasir-gi-endoscopy-siglip

## Resumen

kvasir-gi-endoscopy-siglip es un clasificador de imagen de ocho clases para endoscopia digestiva, construido por el usuario ghostsas001 a partir de google/siglip2-base-patch16-224 y publicado en HuggingFace. Resuelve una tarea muy concreta: asignar cada fotograma endoscópico a una de las ocho categorías del dataset Kvasir v1 (caecum normal, píloro normal, línea Z normal, esofagitis, pólipos, colitis ulcerosa, pólipos teñidos elevados y márgenes de resección teñidos).

El modelo es relevante porque demuestra que reutilizar sin ajuste una receta de entrenamiento diseñada para otro dominio (clasificación de glóbulos blancos) sobre un backbone SigLIP2 permite superar baselines publicados: obtiene un 92,25 % de accuracy y un MCC de 0,912 en un hold-out de 400 imágenes, frente al mejor baseline del paper de Kvasir (MCC 0,711) y a un ensemble Inception de la literatura (MCC 0,903). Se trata de un modelo de investigación, con 92.890.376 parámetros, repo de 0,4 GB y licencia Apache-2.0 en los pesos.

La relevancia práctica es doble: por un lado es un baseline barato y reproducible (entrenado en una única NVIDIA T4) para investigación en imagen médica endoscópica; por otro, sus propias limitaciones documentadas (test set pequeño, sin intervalos de confianza, sobreajuste al dominio Kvasir y restricción de uso no comercial derivada del dataset) lo sitúan lejos de cualquier uso clínico real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP2 (vision transformer con encoder de texto asociado); backbone google/siglip2-base-patch16-224, parches de 16x16, entrada 224x224, con cabeza de clasificacion lineal de 8 clases |
| Parametros totales | 92.890.376 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion de imagen; entrada de 224x224 px) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible (el uso principal es clasificacion de imagen; la model card no documenta capacidades de texto) |
| Licencia | apache-2.0 en los pesos; el dataset Kvasir v1 es solo para investigacion y educacion, restriccion que heredan los pesos (sin uso comercial) |
| Formato de pesos | safetensors |
| Pipeline | image-classification |
| Numero de clases | 8 |
| Tamano del repositorio | 0,4 GB |
| Modelo base | google/siglip2-base-patch16-224 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-29 |

## Arquitectura y entrenamiento

El modelo parte de SigLIP2-base-patch16-224, un esquema de vision-language con encoder de imagen tipo ViT-B de parches 16x16 a 224x224 y un encoder de texto entrenado con pérdida sigmoidea en lugar de softmax contrastivo. Para esta ficha se ha adaptado a clasificación supervisada de 8 clases mediante una cabeza sobre las características de imagen, cargable con AutoModelForImageClassification y config.id2label. La model card no detalla el desglose exacto de parámetros entre torre visual, torre de texto y cabeza, ni si la torre de texto se conserva o se descarta en la práctica; ese dato se considera no disponible.

El entrenamiento usó las 3.200 imágenes de Kvasir v1 (400 por clase) con split estratificado 80/10/10 por imagen y semilla 42. Se realizaron 15 épocas con learning rate 5e-5 y batch 16, seleccionando la mejor época según el split de validación, todo en una única NVIDIA T4. La receta proviene de un proyecto de clasificación de glóbulos blancos y se reutilizó sin ningún ajuste. No se documenta uso de RLHF, DPO, aumentación de datos ni decodificación especulativa.

## Capacidades

- Clasificación de imagen endoscópica en 8 clases: dyed-lifted-polyps, dyed-resection-margins, esophagitis, normal-cecum, normal-pylorus, normal-z-line, polyps, ulcerative-colitis.
- Salida de logits por clase, convertible a probabilidades con softmax para obtener una etiqueta y una puntuación de confianza.
- Procesamiento de imágenes RGB a 224x224 con normalización media/desviación 0,5 por canal.
- Extracción de características visuales reutilizable como backbone congelado en otros pipelines (no documentado explícitamente por el autor, pero derivado del uso de un modelo SigLIP2).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües, de generación de texto, de código ni de matemáticas.
- No se documentan modos especiales (thinking mode, visión de vídeo, audio).

## Casos de uso

- Preetiquetado de datasets endoscópicos: dado que clasifica en las 8 categorías de Kvasir v1, se puede usar como etiquetador automático inicial sobre lotes de imágenes para después revisar y corregir a mano, reduciendo el coste de anotación.
- Filtrado de fotogramas informativos en grabaciones largas: aplicar el clasificador fotograma a fotograma para marcar segmentos con pólipos, colitis ulcerosa o esofagitis y descartar tomas de caecum o píloro normal antes de una revisión manual.
- Investigación comparativa de recetas de clasificación médica: sirve como baseline reproducible (receta conocida, 15 épocas, lr 5e-5, batch 16, T4 única) frente al que medir variantes de aumentación, resolución o backbone.
- Control de calidad de pipelines de captura: comprobar si un endoscopio o protocolo de adquisición concreto produce una distribución de clases anómala, señal de problemas de calibración o de color.
- Docencia e indexación de bibliotecas de imágenes: catalogar automáticamente colecciones de imágenes endoscópicas por categoría clínica para su uso en material formativo o búsqueda interna.
- Etapa de clasificación dentro de un sistema compuesto: combinado con el modelo companion de detección (kvasir-gi-endoscopy-yolo), usar el detector para localizar regiones y este clasificador para asignarles categoría.
- Investigación sobre errores entre clases adyacentes: los pares esofagitis / línea Z normal y pólipo teñido / margen de resección teñido concentran la mayoría de errores, lo que lo hace útil para estudiar estrategias de desambiguación.
- Herramienta de apoyo en experimentación preclínica: generar etiquetas preliminares en estudios retrospectivos, siempre fuera de cualquier flujo de decisión clínica y bajo las restricciones de licencia del dataset.

## Benchmarks y rendimiento

Resultados aportados en la model card sobre un hold-out de 400 imágenes (50 por clase):

| Metrica | Valor |
|---|---|
| Accuracy | 92,25 % |
| Matthews correlation coefficient (MCC) | 0,912 |
| Macro F1 | 92,24 % |

Comparación con valores publicados citados por el autor:

| Modelo / referencia | MCC | Accuracy | Macro F1 | Notas |
|---|---|---|---|---|
| kvasir-gi-endoscopy-siglip | 0,912 | 92,25 % | 92,24 % | Hold-out propio de 400 imagenes (50 por clase) |
| Ensemble Inception (literatura) | 0,903 | no disponible | no disponible | Valores tabulados por Asperti y Mastronardo (2017) |
| Mejor baseline del paper Kvasir | 0,711 | no disponible | no disponible | Pogorelov et al. (2017) |

Cada trabajo usa su propia partición aleatoria de las mismas 4.000 imágenes, por lo que los conjuntos de test no son idénticos y la comparación no es estrictamente homogénea. No se aportan intervalos de confianza, matriz de confusión numérica ni resultados por clase.

## Requisitos de hardware

- Peso de los parámetros: aproximadamente 0,37 GB en fp32 (92.890.376 parámetros) y 0,19 GB en fp16/bf16. Estimaciones calculadas a partir del recuento de parámetros, no publicadas por el autor.
- VRAM estimada para inferencia: por debajo de 1 GB en fp16 con batch 1 a 224x224, sumando pesos y activaciones de un ViT-B; cualquier GPU con 4 GB o más debería ser suficiente.
- GPU recomendadas: NVIDIA T4 (la usada en entrenamiento), RTX 3060/4060 en adelante, RTX 4090, A100 o H100 para lotes grandes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU con al menos 4 GB de VRAM; también es viable en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (AutoModelForImageClassification) de forma nativa; exportación a ONNX Runtime o TorchScript para servir; TorchServe o NVIDIA Triton para producción. No aplica llama.cpp, Ollama ni vLLM, orientados a modelos generativos de texto.
- Latencia y throughput: no disponible. La model card solo indica que el entrenamiento se hizo en una NVIDIA T4.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kvasir-gi-endoscopy-siglip | 92.890.376 | Imagen 224x224, 8 clases | MCC 0,912; accuracy 92,25 %; macro F1 92,24 % | Apache-2.0 en pesos, uso no comercial por el dataset Kvasir | HuggingFace, 0 descargas |
| Ensemble Inception (Asperti y Mastronardo, 2017) | no disponible | Imagen, mismas 8 clases | MCC 0,903 | no disponible | Publicacion academica |
| Mejor baseline del paper Kvasir (Pogorelov et al., 2017) | no disponible | Imagen, mismas 8 clases | MCC 0,711 | no disponible | Publicacion academica |
| kvasir-gi-endoscopy-yolo (modelo companion) | no disponible | Imagen, deteccion | no disponible | no disponible | HuggingFace, mismo autor |
| google/siglip2-base-patch16-224 | no disponible en esta ficha | Imagen + texto | no aplica a esta tarea sin ajuste | Apache-2.0 (modelo base de Google) | HuggingFace |

No se dispone de datos comparativos de otros clasificadores SigLIP2 específicos para Kvasir, por lo que la comparación se limita a los valores publicados citados por el propio autor.

## Limitaciones y advertencias

- Modelo de investigación, no un dispositivo médico. No está validado para diagnóstico ni para uso clínico.
- Restricción de licencia: aunque los pesos son Apache-2.0, el dataset Kvasir v1 es solo para investigación y educación, de modo que los pesos heredan la prohibición de uso comercial.
- Entrenado exclusivamente con imágenes de Kvasir; otros endoscopios, protocolos de iluminación o ajustes de cámara pueden degradar la precisión por cambio de dominio.
- Test set muy pequeño: 400 imágenes, 50 por clase, lo que implica que un solo error equivale a 2 puntos de recall. No hay intervalos de confianza.
- Una única ejecución de entrenamiento sin repeticiones ni búsqueda de hiperparámetros; la receta se reutilizó sin ajustar desde un proyecto de clasificación de glóbulos blancos.
- El dataset contiene superposiciones incrustadas (texto y una caja verde de indicador de posición) que no fueron enmascaradas y pueden introducir atajos espurios.
- Confusiones conocidas entre clases que difieren solo en grado: esofagitis frente a línea Z normal y pólipo teñido frente a margen de resección teñido concentran la mayoría de errores.
- Sin identificadores de paciente en el split, por lo que no puede descartarse fuga de información entre particiones si un mismo paciente aparece en varias imágenes.
- Riesgo de alucinación en el sentido de alta confianza en una clase incorrecta: no se documenta calibración de probabilidades, y el softmax del modelo no debe interpretarse como probabilidad clínica.
- No se documentan capacidades multilingües, generativas ni de razonamiento; cualquier uso fuera de clasificación de imagen no está respaldado.
- Sin mantenimiento aparente: 0 descargas y 0 likes en el momento de la consulta, con creación y última actualización separadas por menos de un minuto.
- En producción requeriría al menos una fase de validación externa con datos del centro de destino, además de monitorización de deriva de dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ghostsas001/kvasir-gi-endoscopy-siglip
- Modelo companion (YOLO): https://huggingface.co/ghostsas001/kvasir-gi-endoscopy-yolo
- Repositorio del proyecto: https://github.com/Elghoudani/kvasir-gi-endoscopy-classification
- Modelo base: https://huggingface.co/google/siglip2-base-patch16-224
- Organizacion de Google en HuggingFace: https://huggingface.co/google
- Paper de Kvasir v1 (Pogorelov et al., ACM MMSys 2017): https://doi.org/10.1145/3083187.3083212
- Paper de Asperti y Mastronardo (2017): https://arxiv.org/abs/1712.03689
