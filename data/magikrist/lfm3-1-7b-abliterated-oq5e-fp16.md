# magikrist/LFM3-1.7B-abliterated-oQ5e-fp16

## Resumen

LFM3-1.7B-abliterated-oQ5e-fp16 es una versión cuantizada del modelo LFM3 de 1.700 millones de parámetros, publicada por el usuario magikrist en Hugging Face. Se trata de una cuantización de precisión mixta generada con la herramienta oQ (oMLX v0.7.3), que combina pesos de 5, 6 y 8 bits con una media efectiva de 5,701 bits por peso. El checkpoint está pensado para ejecutarse en el framework MLX de Apple, lo que lo orienta a inferencia local en hardware de Apple Silicon (chips M1, M2, M3, M4 y superiores).

El modelo base es LFM3, la tercera generación de la familia Liquid Foundation Models, y la variante "abliterated" indica que se ha aplicado una técnica de eliminación de la dirección de rechazo en el espacio de activaciones, un procedimiento habitual para reducir las restricciones de seguridad del modelo original. El resultado es un modelo de 1,729 mil millones de parámetros que ocupa aproximadamente 1,2 GB en disco, lo que lo hace muy manejable para entornos con memoria unificada limitada.

La relevancia de esta ficha es acotada: no hay información publicada sobre el pipeline, los idiomas soportados, la licencia ni los datos de entrenamiento del modelo base, y el repositorio no cuenta con descargas ni valoraciones. Se trata, por tanto, de una publicación de nicho, útil para quienes ya trabajan con MLX y quieran experimentar con una variante sin censura de LFM3, pero sin garantías documentadas de calidad, licencia o rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3; arquitectura exacta no documentada en la información disponible) |
| Parámetros totales | 1.728.801.536 (1,729 B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Precisión mixta: affine 5-bit grupo 64 (80,244 % de los pesos), affine 6-bit grupo 64 (19,659 %), affine 8-bit grupo 64 (0,074 %), FP16 (0,022 %); media efectiva 5,701 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (cuantización MLX con `custom_code`), librería `mlx` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base LFM3 en la documentación proporcionada. La model card del checkpoint cuantizado no describe la arquitectura interna (transformer, MoE, SSM o híbrida), ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineamiento. Tampoco se documenta el procedimiento concreto de "abliteration" aplicado sobre el modelo original.

La única innovación técnica documentada es el esquema de cuantización de precisión mixta generado con oQ (oMLX v0.7.3). El checkpoint asigna 5 bits a la gran mayoría de los pesos (80,244 %), 6 bits a una fracción relevante (19,659 %) y deja en 8 bits y FP16 porcentajes residuales (0,074 % y 0,022 %). El resultado es un peso medio de 5,701 bits por parámetro y un tamaño de almacenamiento de 1,147 GiB para el conjunto del modelo de lenguaje. Esta estrategia busca preservar la precisión en las capas más sensibles sin disparar el tamaño total del checkpoint.

## Capacidades

- Generación de texto autoregresiva: el modelo es un modelo de lenguaje causal de 1,7 B de parámetros, adecuado para tareas de generación y continuación de texto.
- Razonamiento y conocimiento general: no hay documentación específica sobre su rendimiento en tareas de razonamiento, matemáticas o código.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se especifican los idiomas soportados.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Variante "abliterated": el modelo base ha sido modificado para reducir los mecanismos de rechazo, lo que en la práctica implica una menor tendencia a declinar peticiones que el modelo original rechazaría.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está empaquetado para MLX y ocupa 1,2 GB, por lo que puede cargarse en un Mac con chip M1 o superior y memoria unificada de 8 GB o más para experimentación con generación de texto en local.
- Prototipado rápido de aplicaciones de chat: al ser un modelo pequeño y cuantizado, permite iterar sobre prompts y flujos conversacionales sin depender de infraestructura cloud, siempre que se acepte la falta de garantías de calidad documentadas.
- Investigación sobre alineamiento y seguridad: la variante "abliterated" es útil para estudiar cómo cambia el comportamiento del modelo al eliminar la dirección de rechazo, comparando respuestas con el LFM3 original en tareas sensibles.
- Evaluación de técnicas de cuantización: el checkpoint sirve como caso de estudio de cuantización mixta con oQ, permitiendo medir la degradación de calidad frente al modelo en FP16 en tareas de generación y razonamiento.
- Generación de texto creativo y asistencia de escritura: para tareas de redacción, resumen o lluvia de ideas en local, donde la latencia y el coste importan más que la precisión absoluta.
- Educación y experimentación con MLX: útil en entornos docentes para mostrar el flujo completo de cuantización, carga y ejecución de un modelo en el framework MLX de Apple sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 1,2 GB para los pesos cuantizados, más overhead de activaciones y caché KV; en la práctica, entre 2 y 4 GB de memoria unificada para contextos moderados.
- GPU recomendadas: el checkpoint está diseñado para MLX, por lo que el hardware objetivo son los chips de Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No está pensado para GPUs NVIDIA ni AMD en su formato actual.
- ¿Cabe en GPU consumer? Sí, en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada; también cabría en GPUs consumer con suficiente VRAM si se convirtiera a otro formato, pero no se proporciona esa conversión.
- Opciones de despliegue: MLX (librería `mlx`), con soporte de `custom_code`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-abliterated-oQ5e-fp16 (este) | 1,729 B | no disponible | no disponible | safetensors MLX (5,701 bits/peso) | Hugging Face, 0 descargas |
| LFM3-1.7B (modelo base) | 1,7 B (aproximado) | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Alternativas de ~1-2 B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos alternativos de la misma categoría. Los datos del modelo base LFM3 y de otras variantes cuantizadas no están incluidos en la documentación proporcionada.

## Limitaciones y advertencias

- Ausencia total de documentación sobre licencia: no se puede determinar si el uso comercial está permitido; debe consultarse el repositorio del modelo base LFM3 antes de cualquier uso en producción.
- Idiomas no especificados: se desconoce si el modelo soporta castellano u otros idiomas distintos del inglés, y con qué calidad.
- Riesgo de alucinación: como todo modelo de lenguaje de 1,7 B, la tasa de alucinación puede ser elevada, especialmente en tareas de conocimiento factual y razonamiento complejo.
- Variante "abliterated": la eliminación de la dirección de rechazo puede aumentar la probabilidad de generar contenido dañino, sesgado o inapropiado; no es recomendable su despliegue directo en aplicaciones orientadas al público sin filtros adicionales.
- Sesgos conocidos: no documentados en la información disponible, pero heredados del modelo base y del corpus de entrenamiento, que no se describe.
- Contexto limitado o desconocido: al no publicarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas o documentos extensos.
- Sin métricas de calidad: no hay benchmarks publicados que permitan estimar la degradación introducida por la cuantización de 5,701 bits frente al modelo en FP16.
- Repositorio sin tracción: 0 descargas y 0 valoraciones en el momento de la consulta, lo que reduce la validación comunitaria del checkpoint.
- Dependencia de MLX: el formato no es portable directamente a otros runtimes sin conversión, lo que limita su uso fuera del ecosistema Apple.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/magikrist/LFM3-1.7B-abliterated-oQ5e-fp16
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
