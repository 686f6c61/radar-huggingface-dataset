# artursil/companion-laya-teacher

## Resumen

`artursil/companion-laya-teacher` es un modelo publicado en Hugging Face por el usuario artursil. El repositorio contiene pesos en formato safetensors (321.908.998 parámetros, aproximadamente 322 millones) junto con artefactos en formato tflite, lo que sugiere un modelo pensado para despliegue en entornos con recursos limitados, potencialmente dispositivos móviles o de borde. El tamaño del repositorio es de 2,6 GB.

La información pública disponible es muy escasa: no se declara pipeline, licencia, idiomas soportados ni documentación técnica asociada. El nombre del repositorio ("companion-laya-teacher") apunta a un modelo de tipo asistente o acompañante con función docente, pero no hay model card ni metadatos que confirmen la arquitectura, los datos de entrenamiento o el propósito exacto.

Por su volumen de parámetros y la presencia de pesos tflite, encaja en la categoría de modelos pequeños orientados a inferencia local. No obstante, cualquier afirmación sobre capacidades, entrenamiento o rendimiento más allá de los datos objetivos del repositorio sería especulativa y, por tanto, se marca como no disponible en esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 321.908.998 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo incluye artefactos tflite, habitualmente asociados a cuantización para despliegue, pero no se especifica el esquema) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors y tflite |
| Tamaño del repositorio | 2,6 GB |
| Pipeline declarado | no disponible |
| Descargas | 33 |
| Likes | 0 |
| Fecha de creación | 2026-11-02 |
| Última actualización | 2026-11-09 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (transformer, MoE, SSM u otra), el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La única información estructural disponible es el recuento de parámetros (321.908.998) y la presencia de pesos en safetensors y tflite.

La coexistencia de safetensors y tflite sugiere un flujo de trabajo de conversión desde un checkpoint de entrenamiento hacia un formato optimizado para inferencia en dispositivos, pero no hay documentación que detalle el proceso, las herramientas empleadas ni las posibles innovaciones técnicas. Toda esta sección debe considerarse no disponible.

## Capacidades

- No se han documentado capacidades específicas en la información disponible.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni razonamiento multi-paso.
- No consta información sobre capacidades multilingües.
- No consta la existencia de modo de razonamiento (thinking), visión, audio ni otras modalidades.
- El nombre del repositorio sugiere un uso como asistente educativo, pero se trata de una inferencia a partir del identificador y no de una capacidad documentada.

## Casos de uso

- Evaluación experimental en dispositivos de borde: los artefactos tflite permiten probar el modelo en entornos móviles o embebidos, aunque sin documentación sobre latencia o precisión no puede validarse su idoneidad para producción.
- Prototipado de asistentes educativos: el identificador del repositorio apunta a un rol de "teacher", por lo que podría explorarse en demos de tutoría conversacional, siempre que se valide previamente su calidad mediante pruebas propias.
- Investigación sobre modelos pequeños: con unos 322 millones de parámetros, es un candidato para estudiar técnicas de compresión y despliegue en hardware limitado.
- Pruebas de conversión de formato: útil para experimentar con pipelines safetensors a tflite y medir la pérdida de calidad asociada.
- Integración en aplicaciones offline: el tamaño del repositorio (2,6 GB) y el formato tflite permiten plantear escenarios sin conexión, sujeto a verificación empírica del rendimiento.
- Comparación de baselines: puede servir como referencia de modelo de tamaño reducido en experimentos académicos, aunque la ausencia de benchmarks publicados limita su valor comparativo.

En todos los casos, la falta de model card, licencia e idiomas declarados obliga a realizar una evaluación propia antes de cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el recuento de parámetros, un modelo de 322 millones en fp16 ocuparía aproximadamente 0,65 GB solo en pesos; en int8, alrededor de 0,32 GB. Estas cifras son estimaciones de cálculo y no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPU de consumo como RTX 3060, RTX 4060 o superiores, pero no hay validación publicada.
- Compatibilidad con GPU de consumo: probable por volumen de parámetros, no confirmada.
- Opciones de despliegue: los pesos tflite apuntan a TensorFlow Lite (incluido LiteRT) y entornos móviles; los safetensors permitirían, en principio, cargas con frameworks estándar de PyTorch, aunque no se documenta. No consta soporte verificado de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información suficiente sobre arquitectura, contexto, rendimiento o licencia para establecer una comparación rigurosa con alternativas de la misma categoría. Los modelos pequeños de ~300 millones de parámetros suelen compararse entre sí por tamaño, pero sin benchmarks publicados de este modelo la comparación carecería de base.

## Limitaciones y advertencias

- Ausencia total de model card: no hay documentación sobre entrenamiento, datos, sesgos o uso previsto.
- Licencia no especificada: no puede confirmarse el uso comercial ni la redistribución; debe contactarse con el autor antes de cualquier despliegue.
- Idiomas no declarados: se desconoce si el modelo está entrenado en castellano, inglés u otras lenguas.
- Riesgo de alucinación: inherente a cualquier modelo generativo, agravado aquí por la falta de evaluación publicada.
- Sesgos desconocidos: al no documentarse el dataset, no pueden identificarse sesgos conocidos.
- Contexto no documentado: se desconoce la ventana máxima, lo que impide planificar conversaciones multi-turno largas.
- Madurez del repositorio: 33 descargas y 0 likes indican un proyecto sin validación por parte de la comunidad; no debe asumirse estabilidad ni soporte.
- Artefactos tflite sin especificación: se desconoce el esquema de cuantización y la posible pérdida de precisión respecto a los pesos originales.
- No apto para producción sin evaluación previa: la falta de benchmarks, licencia e idiomas hace imprescindible una validación propia.

## Enlaces

- Hugging Face: https://huggingface.co/artursil/companion-laya-teacher
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
