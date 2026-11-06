# henrybrenomota/lumi-4b

## Resumen

CEIA Lumi-4B es un modelo de lenguaje de aproximadamente 3.970 millones de parámetros (3,97 B) orientado a la generación de texto en portugués. Lo publica el usuario `henrybrenomota` en Hugging Face, si bien la model card remite al repositorio oficial del proyecto CEIA (`ceia-br/lumi-4b`), lo que sugiere que se trata de una distribución derivada o espejo de un modelo desarrollado en el marco del CEIA (Centro de Excelencia en Inteligencia Artificial, vinculado a Brasil). El modelo se etiqueta con la arquitectura `nemotron_h`, lo que lo sitúa en la familia de transformadores híbridos de NVIDIA, aunque la información disponible no detalla la configuración exacta de capas.

El modelo resuelve la tarea de generación de texto conversacional en portugués y se presenta con un conjunto de resultados de evaluación en benchmarks adaptados al portugués (MMLU PT, Global MMLU PT, MMLU-ProX PT e IFEval PT), en los que ocupa la segunda posición entre nueve modelos comparados según la propia model card. Es relevante por su tamaño contenido (4 B), que lo hace desplegable en hardware de consumo con cuantización, y por su enfoque explícito en un idioma distinto del inglés, un nicho con menos oferta que el de los modelos multilingües generalistas.

La información pública es escasa: no se documentan el modelo base, los datos de entrenamiento, la licencia ni las instrucciones de inferencia. La model card advierte explícitamente de estas carencias, por lo que cualquier evaluación en producción debe tratarse con cautela hasta que el autor complete la documentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `nemotron_h` (transformador híbrido, según el tag del repositorio; configuración de capas no disponible) |
| Parámetros totales | 3.973.556.832 (~3,97 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la model card; los pesos se distribuyen en BF16 en el repositorio oficial |
| Idiomas soportados | portugués (`pt`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code`) |
| Tamaño del repositorio | 8,0 GB |

## Arquitectura y entrenamiento

El tag `nemotron_h` apunta a la familia de modelos híbridos de NVIDIA Nemotron, que combinan capas de atención con capas de estado recurrente (SSM/Mamba) para reducir el coste computacional en contextos largos. No obstante, la model card no confirma la configuración concreta (número de capas, proporción atención/SSM, dimensión oculta, cabezas de atención ni vocabulario), por lo que estos detalles deben considerarse no disponibles. El repositorio incluye código personalizado (`custom_code`), lo que implica que la carga del modelo requiere `trust_remote_code=True` y revisar el código incluido antes de ejecutarlo.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de ajuste supervisado, RLHF o DPO. La model card indica explícitamente que "no documenta neste momento o modelo-base, os dados e procedimentos completos de treinamento", por lo que cualquier afirmación sobre el proceso de entrenamiento sería especulativa. La única información metodológica disponible es la relativa a la evaluación: cinco métricas en portugués (MMLU PT de enseñanza media, MMLU PT de grado, Global MMLU PT, MMLU-ProX PT e IFEval PT con prompt estricto), agregadas mediante media aritmética simple con peso igual para cada una.

## Capacidades

- Generación de texto en portugués, con orientación conversacional según el tag `conversational`.
- Respuesta a preguntas de conocimiento general y académico, evaluada mediante MMLU PT y MMLU-ProX PT.
- Seguimiento de instrucciones, evaluado mediante IFEval PT en configuración de prompt estricto (33,83 %).
- Generación de texto multi-turno: la etiqueta conversacional sugiere soporte de diálogo, aunque no se documenta la plantilla de chat ni el formato de turnos.
- Capacidades multilingües: limitadas al portugués según el campo `language`; no se declara soporte de otros idiomas.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso o modo de pensamiento explícito: no disponible.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Generación de contenido editorial en portugués: redacción de borradores, resúmenes y reescritura de textos en portugués brasileño, aprovechando su especialización monolingüe y su tamaño contenido para despliegue en una sola GPU.
- Asistentes conversacionales de dominio acotado: atención al cliente o soporte interno en portugués, donde el modelo puede mantener diálogos multi-turno; conviene validar previamente la plantilla de chat, no documentada.
- Prototipado rápido de aplicaciones NLP en portugués: al caber en GPUs de consumo con cuantización, sirve para experimentar con pipelines de generación antes de escalar a modelos mayores.
- Evaluación comparativa de modelos en portugués: útil como referencia de 4 B en benchmarks como MMLU PT o IFEval PT para estudiar el efecto del tamaño y del idioma en el rendimiento.
- Investigación sobre arquitecturas híbridas: el tag `nemotron_h` lo convierte en un candidato para estudiar el comportamiento de modelos híbridos atención/SSM en un idioma distinto del inglés, siempre que se verifique la configuración real de capas.
- Generación de datos sintéticos en portugués: producción de pares pregunta-respuesta o textos de aumento de datos para entrenar modelos menores o clasificadores, con revisión humana posterior por el riesgo de alucinación.
- Despliegue en entornos con recursos limitados: inferencia en una RTX 4090 o incluso en GPUs de 16-24 GB con cuantización de 8 o 4 bits, adecuado para demos locales y entornos de desarrollo.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluación en portugués):

| Benchmark | Resultado |
|---|---:|
| MMLU PT, enseñanza media | 45,72 % |
| MMLU PT, grado | 48,80 % |
| Global MMLU PT | 59,36 % |
| MMLU-ProX PT | 36,28 % |
| IFEval PT, prompt estricto | 33,83 % |
| Overall (media aritmética simple) | 44,80 % |

Según la model card, el modelo ocupa la 2.ª posición entre 9 modelos en el ranking global de esa comparación. No se especifican las versiones de los conjuntos de evaluación, el harness utilizado, los parámetros de ejecución ni los intervalos de confianza, por lo que los números no deben interpretarse como garantía de rendimiento en otros entornos. No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, MMLU en inglés) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8 GB solo para los pesos (3,97 B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 10 y 12 GB para contextos moderados.
- VRAM estimada en FP8/INT8: alrededor de 4-5 GB para los pesos; en INT4, alrededor de 2,5-3 GB.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue de alta concurrencia; L40S o RTX 6000 Ada para servidores de inferencia; RTX 4090 (24 GB) para desarrollo y producción ligera.
- GPU de consumo: cabe en RTX 4090, RTX 4080, RTX 3090 y, con cuantización de 4 bits, en GPUs de 8-12 GB como RTX 4070 o RTX 3060 Ti.
- Opciones de despliegue: al requerir `custom_code`, la compatibilidad con vLLM, TGI o llama.cpp no está garantizada y no se documenta; la vía más segura es `transformers` con `trust_remote_code=True`. La conversión a GGUF para Ollama o llama.cpp requeriría verificar el soporte de la arquitectura `nemotron_h`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Rendimiento en portugués |
|---|---|---|---|---|---|
| CEIA Lumi-4B | ~3,97 B | no disponible | pt | no disponible | Overall 44,80 % en la comparación de la model card (2.º de 9) |
| Modelos comparados en la model card | no disponible | no disponible | no disponible | no disponible | Ranking de 9 modelos; el resto de valores no se detalla en la información proporcionada |
| Alternativas de ~4 B en portugués | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa detallada con modelos alternativos concretos: la model card menciona una comparación con 9 modelos, pero no identifica sus nombres ni sus resultados individuales en el texto proporcionado.

## Limitaciones y advertencias

- Documentación incompleta: no se especifican el modelo base, los datos de entrenamiento, la licencia ni las instrucciones de inferencia; la propia model card lo reconoce.
- Licencia no disponible: no puede confirmarse el uso comercial; debe contactarse con el autor antes de cualquier despliegue en producción.
- Especialización monolingüe: solo se declara portugués; el rendimiento en otros idiomas, incluido el castellano, no está evaluado y probablemente sea deficiente.
- Riesgo de alucinación: no se documentan mecanismos de mitigación ni datos de entrenamiento que permitan estimar la fiabilidad factual; los resultados de MMLU PT (45-49 %) indican un conocimiento limitado.
- Seguimiento de instrucciones moderado: IFEval PT con prompt estricto del 33,83 % sugiere dificultades en instrucciones complejas o formatos exigentes.
- Código personalizado: el repositorio requiere `trust_remote_code=True`, lo que implica ejecutar código no auditado; debe revisarse antes de cargar el modelo.
- Sin datos sobre sesgos: no se han publicado evaluaciones de sesgo, toxicidad o seguridad.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación independiente.
- Fecha de creación futura (2026-11-04): el repositorio presenta metadatos anómalos que conviene verificar.
- Resultados de benchmarks sin intervalos de confianza ni detalles del harness: no deben tomarse como garantía de rendimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/henrybrenomota/lumi-4b
- Repositorio oficial referenciado en la model card: https://huggingface.co/ceia-br/lumi-4b
