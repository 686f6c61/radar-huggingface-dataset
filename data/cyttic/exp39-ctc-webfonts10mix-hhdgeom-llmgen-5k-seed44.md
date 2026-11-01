# cyttic/exp39-ctc-webfonts10mix-hhdgeom-llmgen-5k-seed44

## Resumen

El modelo `cyttic/exp39-ctc-webfonts10mix-hhdgeom-llmgen-5k-seed44` es un checkpoint de 87.279.756 parámetros (aproximadamente 87,3 M) publicado por el usuario cyttic en HuggingFace bajo licencia MIT. El identificador del repositorio sugiere un experimento de reconocimiento de texto manuscrito o tipográfico basado en CTC (Connectionist Temporal Classification), entrenado sobre una mezcla de diez fuentes web ("webfonts10mix"), con geometría de cabecera ("hhdgeom") y datos generados por un modelo de lenguaje ("llmgen"), con un presupuesto de 5.000 muestras y semilla 44. Se trata, por tanto, de un artefacto de investigación reproducible más que de un modelo de propósito general.

La model card publicada por el autor es la plantilla por defecto de HuggingFace sin rellenar: no documenta arquitectura, datos de entrenamiento, idiomas, hiperparámetros ni resultados de evaluación. Toda la información técnica disponible se limita a los metadatos del repositorio: el recuento de parámetros extraído de los pesos en safetensors (87.279.756), el tamaño del repositorio (0,3 GB), la licencia MIT y la referencia bibliográfica al paper de Lacoste et al. (2019) sobre el impacto ambiental, que aparece únicamente como cita de la plantilla.

Su relevancia actual es limitada fuera del contexto de reproducción de experimentos de OCR/HTR. No debe confundirse con un modelo conversacional ni con un LLM: el nombre, el tamaño y el pipeline implícito apuntan a un sistema de reconocimiento de secuencias (imagen a texto) entrenado de forma específica. Cualquier uso en producción requeriría una evaluación propia, dado que no hay métricas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el identificador sugiere un modelo CTC para reconocimiento de texto; no confirmado por el autor) |
| Parametros totales | 87.279.756 |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna. El nombre del repositorio contiene las claves `ctc`, `webfonts10mix`, `hhdgeom` y `llmgen`, que sugieren respectivamente: una función de pérdida CTC para alineamiento secuencial sin segmentación previa, un corpus compuesto por diez familias de fuentes web, algún tipo de codificación geométrica de la cabecera de los glifos y la generación sintética de muestras mediante un modelo de lenguaje. Ninguna de estas inferencias está confirmada por el autor en la model card, que permanece como plantilla vacía.

Tampoco se documentan el número de tokens o muestras de entrenamiento (el sufijo `5k` podría indicar 5.000 ejemplos, pero es una hipótesis), la composición del dataset, la existencia de fases de ajuste fino supervisado o preferencias, ni innovaciones técnicas como decodificación especulativa o atención lineal. El tamaño de 0,3 GB del repositorio es coherente con un checkpoint de ~87 M de parámetros en precisión de 16 o 32 bits junto con los ficheros auxiliares.

## Capacidades

- Reconocimiento de secuencias de texto a partir de imágenes, presumiblemente mediante decodificación CTC (no confirmado explícitamente por el autor).
- Generación de transcripciones alineadas a nivel de carácter o token, apta para tareas de OCR/HTR.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- No hay información sobre capacidades multilingües.
- No hay evidencia de modo de razonamiento (thinking), visión general, audio ni otras modalidades más allá del pipeline implícito.
- No se documentan capacidades conversacionales ni de instrucción.

## Casos de uso

- Reproducción de experimentos académicos de OCR/HTR: el checkpoint permite replicar el setup `exp39` con la semilla 44 y comparar variantes del mismo autor (por ejemplo, `exp39` con otras semillas o mezclas de fuentes), siempre que se disponga del código y los datos originales.
- Investigación sobre decodificación CTC: útil para estudiar el comportamiento de la pérdida CTC en tareas de reconocimiento de texto con vocabularios y fuentes controladas, dado el tamaño manejable del modelo.
- Generación de datos sintéticos para entrenamiento de OCR: el sufijo `llmgen` sugiere que el modelo se entrenó con muestras generadas; puede servir como referencia para pipelines de aumento de datos tipográficos.
- Evaluación comparativa de arquitecturas ligeras: con ~87 M de parámetros, es un candidato para benchmarks de eficiencia frente a modelos de OCR más grandes en entornos con recursos limitados.
- Docencia y formación: su tamaño reducido y licencia MIT lo hacen adecuado para prácticas de fine-tuning y despliegue de modelos de reconocimiento de texto en cursos universitarios.
- Pruebas de integración en pipelines de digitalización de documentos: puede emplearse como componente experimental en un sistema de extracción de texto, siempre con validación adicional y sin garantías de calidad al no haber métricas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (87 M de parámetros ocupan ~350 MB) y en torno a 200 MB en fp16; no se han publicado requisitos oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionarán sin problemas, aunque el modelo está claramente sobredimensionado para estas GPUs.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: no hay integración documentada con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de reconocimiento y no un LLM, el despliegue requeriría el código específico del autor, no disponible en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (OCR/HTR basados en CTC con ~87 M de parámetros y entrenamiento sobre fuentes web sintéticas). La ausencia de documentación impide establecer una comparación rigurosa con alternativas como TrOCR, CRNN o PaddleOCR.

## Limitaciones y advertencias

- La model card no documenta sesgos, riesgos ni limitaciones; se desconoce el comportamiento del modelo fuera del dominio de entrenamiento (fuentes web y datos generados).
- Riesgo de alucinación y de errores de transcripción no cuantificado: no hay métricas de precisión, recall ni CER/WER publicadas.
- Se desconoce la cobertura de idiomas y de sistemas de escritura; el nombre sugiere un foco en fuentes web latinas, pero no está confirmado.
- El identificador incluye `llmgen`, lo que implica que parte de los datos podría ser sintética; esto puede introducir sesgos de dominio y degradar el rendimiento en documentos reales.
- La licencia MIT permite uso comercial, pero al no haber evaluación ni garantías, el uso en producción es desaconsejable sin una validación exhaustiva previa.
- El repositorio tiene 0 descargas y 0 likes, y la model card está sin completar: no hay soporte del autor ni comunidad que haya validado el modelo.
- No se proporciona código de inferencia ni tokenizador documentado, lo que dificulta la integración práctica.

## Enlaces

- HuggingFace: https://huggingface.co/cyttic/exp39-ctc-webfonts10mix-hhdgeom-llmgen-5k-seed44
- Paper citado en la model card (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
