# Mouserat/rat-77m

## Resumen

rat-77m es un modelo de lenguaje de tipo encoder-decoder basado en la arquitectura T5, desarrollado por el usuario Mouserat y publicado en Hugging Face bajo licencia Apache 2.0. Con aproximadamente 77 millones de parámetros, está diseñado para tareas de generación texto-a-texto (text2text-generation) con soporte declarado para japones e ingles. El modelo se distribuye como un checkpoint de la familia T5 y su vocabulario deriva de mT5-small, truncado a las 64.000 entradas mas frecuentes con una cobertura declarada del 99,53%.

El modelo se presenta como una revisión de un intento previo fallido (t5-6lang-77m), del que el autor extrae la lección de que es obligatorio aplicar una inicialización corregida de los embeddings (fixed embedding init). Según la model card, el estado del proyecto es "especificación en curso" (Status: 仕様策定中), lo que indica que el desarrollo no está finalizado y que las capacidades reales del checkpoint pueden no estar consolidadas.

Por su tamano reducido (77M), el modelo apunta a escenarios de despliegue en hardware modesto, incluyendo CPU y GPUs de consumo, y a tareas acotadas de traducción, resumen o transformación de texto entre japones e ingles. No obstante, la información publicada es muy limitada: no hay benchmarks, no hay detalle de la composición exacta del dataset de entrenamiento ni confirmación de que el entrenamiento haya concluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder, transformer) |
| Parametros totales | ~77M (aproximado, según nombre y model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en formato original; el repo indica 0.0 GB) |
| Idiomas soportados | japones e ingles (según tags de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0.0 GB; no se confirma safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura T5 estándar de tipo encoder-decoder, con un total de aproximadamente 77 millones de parámetros. El vocabulario se construye a partir de mT5-small, truncado a las 64.000 entradas mas frecuentes, con una cobertura declarada del 99,53% sobre el corpus de referencia. Esta decisión reduce el tamano de la matriz de embeddings respecto a mT5-small completo y, según el autor, corrige un problema detectado en el modelo anterior t5-6lang-77m relacionado con la inicialización de los embeddings.

El entrenamiento se asocia al dataset Mouserat/llmjp4-2b-dataset, publicado por el mismo autor en Hugging Face. No se especifica en la información disponible el número de tokens efectivamente utilizados, la composición detallada del corpus, ni si se aplicaron fases de ajuste fino supervisado, RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o mecanismos de atención lineal. La model card indica que el proyecto se encuentra en fase de especificación, por lo que estos detalles podrían no estar cerrados.

## Capacidades

- Generación de texto texto-a-texto mediante arquitectura encoder-decoder, adecuada para tareas de transformación (traducción, resumen, paráfrasis).
- Soporte declarado de japones e ingles, lo que habilita escenarios de traducción bidireccional entre ambos idiomas.
- Capacidad potencial de reescritura y normalización de texto, dada la formulación text2text-generation.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- El alcance multilingüe se limita a los dos idiomas indicados en los tags; no hay evidencia de cobertura adicional.

## Casos de uso

- Traducción japones-ingles y ingles-japones en dominios acotados: el modelo puede emplearse para traducir frases o párrafos cortos en entornos donde no se requiera calidad de traducción de nivel producción, gracias a su tamano reducido y a su vocabulario derivado de mT5-small.
- Normalización y limpieza de texto: al ser un modelo text2text, puede ajustarse para reescribir entradas con ruido, corregir formato o estandarizar terminología en pipelines de preprocesamiento.
- Resumen extractivo o abstractivo de documentos breves: útil en flujos donde el coste computacional debe minimizarse, por ejemplo en el preprocesado de correos o notas antes de pasarlas a un modelo mayor.
- Generación de respuestas en asistentes ligeros: puede integrarse en sistemas de FAQ o atención al cliente de baja complejidad donde las respuestas sean cortas y el contexto limitado.
- Prototipado e investigación: sirve como base para experimentos de ajuste fino en tareas japones-ingles con recursos de hardware limitados (CPU o GPU de consumo).
- Filtrado y clasificación generativa: puede adaptarse mediante ajuste fino para generar etiquetas o categorías textuales a partir de descripciones, en tareas de moderación o enrutamiento de contenido.
- Despliegue en entornos con restricciones de memoria: su tamano de 77M permite ejecución en dispositivos edge o contenedores pequeños, siempre que se confirme el formato de pesos disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,3 GB solo para pesos (77M × 4 bytes), mas overhead de activaciones y tokenizador; en la practica, menos de 1 GB.
- VRAM estimada en fp16/bf16: aproximadamente 0,15 GB para pesos; el modelo cabe holgadamente en cualquier GPU con 2 GB o mas.
- GPU recomendadas: cualquier GPU moderna es suficiente; para lotes grandes se recomiendan tarjetas con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090, A100, H100). En CPU es viable para inferencia de baja concurrencia.
- Cabe en GPU de consumo: sí, en practicamente cualquier GPU de consumo actual e incluso en iGPU con memoria unificada.
- Opciones de despliegue: al ser un modelo T5, es compatible con librerías de la familia Transformers, y potencialmente con ONNX Runtime y llama.cpp si se generan los pesos en los formatos adecuados; no se confirma en la información disponible que existan pesos GGUF ni integración con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles. Por el tamano, se espera latencia de milisegundos por secuencia corta en GPU y de decenas a cientos de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rat-77m | ~77M | no disponible | japones, ingles | Apache 2.0 | Hugging Face (repo de 0.0 GB, estado en especificación) |
| T5-small | 60M | 512 tokens (estándar T5) | ingles principalmente | Apache 2.0 | Ampliamente disponible |
| mT5-small | 300M | 512 tokens (estándar mT5) | multilingüe (101 idiomas) | Apache 2.0 | Ampliamente disponible |
| ByT5-small | 300M | 512 tokens (aproximado) | multilingüe (bytes) | Apache 2.0 | Ampliamente disponible |

La comparación se basa en la familia T5 por ser el linaje arquitectónico del modelo. rat-77m se sitúa entre T5-small y mT5-small en numero de parámetros, pero con un vocabulario truncado a 64k entradas y un enfoque declarado japones-ingles. Frente a mT5-small, ofrece menor tamano pero cobertura lingüística mucho mas restringida. No hay datos de rendimiento que permitan comparar calidad.

## Limitaciones y advertencias

- Estado del proyecto: la model card indica "especificación en curso", por lo que el checkpoint puede no estar entrenado o puede ser un artefacto intermedio; no debe asumirse calidad de producción.
- Repositorio de 0.0 GB: el tamano publicado sugiere que los pesos podrían no estar subidos o que el repositorio está vacío; conviene verificar antes de cualquier uso.
- Ausencia de benchmarks: no hay evidencia publicada de rendimiento en MMLU, traducción, resumen ni ninguna otra tarea.
- Riesgo de alucinación: inherente a los modelos generativos; en un modelo de 77M con datos limitados, la probabilidad de generar contenido incorrecto es alta.
- Sesgos: no documentados; al entrenarse sobre un dataset no descrito en detalle (llmjp4-2b-dataset), pueden heredarse sesgos del corpus subyacente.
- Cobertura lingüística limitada a japones e ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto no especificada; no se puede planificar su uso en documentos largos sin confirmación.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre el dataset subyacente impide verificar la procedencia y los derechos de los datos de entrenamiento.
- No se confirma compatibilidad con frameworks de despliegue habituales (vLLM, TGI, Ollama) ni existencia de pesos cuantizados.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/Mouserat/rat-77m
- Dataset asociado: https://huggingface.co/datasets/Mouserat/llmjp4-2b-dataset
- Especificación técnica (referenciada en la model card): docs/spec.md (ruta relativa dentro del repositorio, no verificable desde la información disponible)
