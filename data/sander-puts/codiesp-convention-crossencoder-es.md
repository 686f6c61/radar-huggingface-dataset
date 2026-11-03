# sander-puts/codiesp-convention-crossencoder-es

## Resumen

Codiesp-convention-crossencoder-es es un cross-encoder de clasificación de texto desarrollado por Sander Puts que puntúa pares formados por una mención clínica en contexto y un código ICD-10 candidato, estimando la probabilidad de que los anotadores del corpus CodiEsp asignasen ese código. No es un modelo generativo ni un codificador autónomo: es una pieza de una arquitectura mayor denominada CEI-Trace, que codifica texto clínico según los libros oficiales de ICD-10 y añade capas separadas para las guías y prácticas de cada entorno sanitario.

El modelo parte de PlanTL-GOB-ES/roberta-base-biomedical-clinical-es, un encoder RoBERTa de 125 millones de parámetros especializado en español biomédico y clínico, al que se le añade una cabeza de clasificación de secuencias. Se ha ajustado sobre las anotaciones de entrenamiento y desarrollo de CodiEsp, el corpus de casos clínicos en español empleado en el reto CLEF eHealth 2020.

Su relevancia radica en que formaliza una capa IMPLICIT: captura la práctica de anotación de un conjunto de datos concreto, incluidos sus errores, y la expone como una señal etiquetada que el sistema principal puede combinar con las reglas oficiales. El modelo tiene un tamaño de repositorio de 0,5 GB, licencia CC BY 4.0 y soporte exclusivo para español.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder RoBERTa (base) con cabeza de clasificación de secuencias (cross-encoder) |
| Parametros totales | 125.979.650 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original; admite cuantización estándar vía herramientas externas) |
| Idiomas soportados | es (español) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un cross-encoder basado en RoBERTa: el par (mención en contexto, código ICD-10 candidato) se introduce conjuntamente en el encoder y la cabeza de clasificación produce una puntuación de compatibilidad. El backbone es PlanTL-GOB-ES/roberta-base-biomedical-clinical-es, un encoder de 125 millones de parámetros preentrenado sobre texto biomédico y clínico en español, con licencia Apache-2.0.

El ajuste se realizó sobre las anotaciones de entrenamiento y desarrollo de CodiEsp, en la configuración empleada para la ejecución de test del sistema CEI-Trace. La construcción de los pares corre a cargo del script `scripts/convention_crossenc.py` del repositorio CEI-Trace. El autor indica explícitamente que el modelo aprende la práctica de anotación de un único conjunto de datos, incluidos sus errores, por diseño; no se documentan en la información disponible detalles sobre volumen de tokens, composición del dataset, ni uso de RLHF o DPO.

## Capacidades

- Puntuación de pares (mención clínica en contexto, código ICD-10 candidato) como clasificador binario o de relevancia.
- Selección entre los códigos que los libros oficiales ofrecen para cada mención, dentro de la capa IMPLICIT de CEI-Trace; nunca propone códigos por sí mismo.
- Modelado de la práctica de anotación de CodiEsp, incluyendo sus sesgos y errores sistemáticos.
- Procesamiento de texto clínico en español.
- Integración con `transformers` mediante `AutoModelForSequenceClassification`.
- Compatibilidad declarada con text-embeddings-inference y endpoints compatibles.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Reordenación de candidatos ICD-10 en un pipeline de codificación clínica: dado un conjunto de códigos propuestos por las reglas oficiales para una mención, el cross-encoder puntúa cada par y permite priorizar los más plausibles según la práctica anotadora observada en CodiEsp.
- Capa IMPLICIT en sistemas CEI-Trace: se emplea como componente etiquetado que se combina con la capa oficial de libros ICD-10 y con las capas de guías y práctica de cada entorno, permitiendo auditar qué parte de la decisión proviene de la práctica aprendida.
- Investigación en codificación clínica en español: sirve como baseline reproducible para estudiar la brecha entre la codificación normativa y la práctica real de anotación en corpus como CodiEsp.
- Evaluación de la calidad de anotaciones: al puntuar pares mención-código, puede señalizar discrepancias entre las anotaciones humanas y lo que el modelo considera probable, útil para revisión de datasets.
- Experimentación con cross-encoders biomédicos: al estar construido sobre RoBERTa biomedical-clinical-es, permite comparar el rendimiento de arquitecturas cross-encoder frente a bi-encoders en tareas de emparejamiento mención-código.
- Docencia y prototipado en NLP clínico: su tamaño contenido (125 M de parámetros, 0,5 GB) permite desplegarlo en entornos de laboratorio para demostrar flujos de codificación asistida sin infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos más overhead de activaciones; en fp16 alrededor de 0,25 GB.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para volúmenes moderados.
- GPU recomendadas para throughput alto: A100, H100 o L4 para servir lotes grandes de pares; para uso individual, cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, text-embeddings-inference y endpoints compatibles; el uso con llama.cpp u Ollama no está indicado en la información disponible al no ser un modelo generativo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sander-puts/codiesp-convention-crossencoder-es | 125,98 M | no disponible | Cross-encoder mención-código ICD-10 (es) | CC BY 4.0 | HuggingFace |
| PlanTL-GOB-ES/roberta-base-biomedical-clinical-es | 125 M | no disponible | Encoder base biomédico (es) | Apache-2.0 | HuggingFace |
| Modelos de codificación clínica CodiEsp (genéricos) | no disponible | no disponible | Codificación clínica (es) | no disponible | no disponible |

La comparación directa con otros cross-encoders específicos de codificación ICD-10 en español no está disponible en la información proporcionada. El modelo base comparte arquitectura y tamaño con el backbone, pero no está ajustado a la tarea de emparejamiento mención-código.

## Limitaciones y advertencias

- Aprende la práctica de anotación de CodiEsp, incluidos sus errores, por diseño; no debe interpretarse como una fuente normativa de codificación.
- No propone códigos por sí mismo: solo puntúa pares ya generados por otra fuente; usarlo fuera de ese rol produce resultados sin sentido.
- No apto para uso clínico. El autor lo declara explícitamente.
- Entrenado únicamente con anotaciones de entrenamiento y desarrollo de CodiEsp; puede no generalizar a otros entornos, especialidades o prácticas de codificación distintas.
- Soporte exclusivo de español; no se ha validado en otras lenguas ni en variantes dialectales.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos en la puntuación de pares plausibles según la práctica aprendida.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero el modelo base es Apache-2.0 y el corpus CodiEsp es CC BY 4.0; conviene revisar las obligaciones de atribución en despliegues derivados.
- Sin descargas ni likes registrados en HuggingFace en la fecha de la información; no hay evidencia de validación externa por la comunidad.
- Longitud de contexto no documentada; pares con menciones y contextos muy largos pueden truncarse según la configuración del tokenizador.

## Enlaces

- HuggingFace: https://huggingface.co/sander-puts/codiesp-convention-crossencoder-es
- Repositorio CEI-Trace: https://github.com/putssander/CEI-Trace
- Modelo base: https://huggingface.co/PlanTL-GOB-ES/roberta-base-biomedical-clinical-es
- Corpus CodiEsp (Miranda-Escalada et al., CLEF eHealth 2020): https://doi.org/10.5281/zenodo.3837305
