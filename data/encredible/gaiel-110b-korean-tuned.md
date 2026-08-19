# encredible/Gaiel-110B-Korean-Tuned

## Resumen

Gaiel-110B-Korean-Tuned es un modelo de lenguaje desarrollado por encredible a partir del checkpoint Qwen/Qwen1.5-110B-Chat, con el propósito declarado de mejorar el rendimiento en coreano mediante fine-tuning. El entrenamiento se realizó con la librería Unsloth, que acelera el proceso de ajuste, y utiliza la arquitectura Qwen2. Sin embargo, la propia model card incluye un aviso de auditoría (fechado el 19 de agosto de 2026) en el que se confirma que esta afinación obtuvo resultados inferiores al modelo base en las cuatro categorías de tamaño evaluadas (1.5B, 7B, 8B y 32B). El autor eliminó los repositorios con regresión confirmada y dejó constancia de los datos en un archivo de archivo. El tamaño del repositorio en Hugging Face es de solo 1.2 GB, lo que sugiere que podría tratarse de un adaptador o de pesos parciales, aunque no se especifica en la documentación. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 110B (del modelo base Qwen1.5-110B-Chat) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la variante MLX menciona 4-bit) |
| Idiomas soportados | en (segun model card; el nombre sugiere coreano, pero no se confirma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (segun tags) |

## Arquitectura y entrenamiento

El modelo parte de Qwen1.5-110B-Chat, un transformer decoder-only de 110 mil millones de parametros con arquitectura Qwen2. El fine-tuning se realizo con Unsloth (que afirma duplicar la velocidad de entrenamiento) y la libreria TRL de Hugging Face. No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas como RLHF o DPO. El aviso de la model card indica que el modelo base es de generacion anterior ("구세대"), lo que sugiere que podria estar desactualizado respecto a alternativas mas recientes. No se documenta ninguna innovacion tecnica adicional mas alla del uso de Unsloth para acelerar el ajuste.

## Capacidades

- Generacion de texto y chat: hereda las capacidades del modelo base Qwen1.5-110B-Chat, que incluye generacion de texto conversacional y respuestas a instrucciones.
- Razonamiento y conocimiento general: se espera que mantenga las capacidades del modelo base, aunque no hay evaluaciones independientes que lo confirmen.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card indica idioma "en" (ingles), a pesar del nombre "Korean-Tuned". No se confirma soporte para coreano u otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

Debido a la regresion de rendimiento confirmada por el propio autor, no se recomienda su uso en produccion. Los posibles casos de uso serian:

- Investigacion academica sobre fine-tuning de modelos grandes: el repositorio puede servir como ejemplo de un intento de adaptacion linguistica fallido, con datos de auditoria publicos.
- Experimentacion con Unsloth y TRL: el codigo de entrenamiento puede ser util para quienes quieran reproducir el flujo de trabajo.
- Comparacion de tecnicas de fine-tuning: los datos archivados en gaiel-benchmarks permiten estudiar por que la afinacion no mejoro el rendimiento.
- Uso educativo: como caso de estudio sobre los riesgos de fine-tuning sin evaluacion rigurosa.
- Pruebas de cuantizacion en MLX: la variante MLX existe y podria usarse para probar limites de memoria en Apple Silicon, aunque el modelo completo no cabe en un cluster estandar.
- No se recomienda su uso para tareas reales de generacion de texto, atencion al cliente, codigo u otras aplicaciones practicas debido a la falta de validacion y al rendimiento inferior al base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato relevante es el aviso de la model card que indica que en la auditoria del 2026-08-19, el tuning coreano obtuvo resultados inferiores al modelo base en las cuatro categorias de tamano medidas (1.5B, 7B, 8B y 32B). No se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros benchmarks. Los datos de la auditoria estan archivados en el repositorio gaiel-benchmarks (enlace en la seccion de enlaces).

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 110B parametros, se necesitan aproximadamente 220 GB de VRAM en precision FP16 (sin cuantizar). Con cuantizacion de 4 bits, la demanda se reduce a unos 55-60 GB, pero no hay confirmacion oficial.
- GPU recomendadas: se requieren multiples GPUs de alta gama, como 3-4x A100 80GB o 2x H100 80GB para inferencia sin cuantizar. No cabe en GPUs de consumo (RTX 4090, etc.) sin cuantizacion agresiva.
- La variante MLX (encredible/Gaiel-110B-Korean-Tuned-MLX) excede el limite de RAM de un cluster estandar segun el gist del autor, lo que indica que requiere memoria unificada adicional o cuantizacion de 4 bits.
- Opciones de despliegue: vLLM, TGI (text-generation-inference) o llama.cpp para cuantizacion. La variante MLX esta pensada para Apple Silicon con MLX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. El modelo base Qwen1.5-110B-Chat es la referencia mas directa, pero no se han publicado resultados comparativos entre ambos. Otros modelos coreanos como EEVE-Korean o PolyLM podrian ser alternativas, pero no hay informacion en la documentacion proporcionada. Se indica "no disponible" para esta seccion.

## Limitaciones y advertencias

- Regresion de rendimiento confirmada: la auditoria del autor muestra que el modelo rinde peor que el base en todas las categorias evaluadas. No debe usarse en produccion.
- Modelo base desactualizado: Qwen1.5-110B-Chat es una generacion anterior; existen alternativas mas modernas y capaces.
- Falta de validacion independiente: no hay benchmarks publicos ni evaluaciones de terceros.
- Posible desajuste idiomatico: a pesar del nombre "Korean-Tuned", la model card indica idioma "en". No se confirma que el modelo mejore el coreano.
- Tamano del repositorio sospechoso: 1.2 GB para un modelo de 110B sugiere que podria ser un adaptador o pesos parciales, no un checkpoint completo.
- Licencia Apache 2.0 permite uso comercial, pero la falta de calidad hace desaconsejable su uso.
- Riesgo de alucinacion y sesgos: no se han evaluado, y al estar basado en Qwen1.5, hereda sus limitaciones conocidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/encredible/Gaiel-110B-Korean-Tuned
- Variante MLX: https://huggingface.co/encredible/Gaiel-110B-Korean-Tuned-MLX
- Repositorio de benchmarks gaiel-benchmarks: https://github.com/encredible/gaiel-benchmarks
- Archivo de auditoria (ARCHIVE.md): https://github.com/encredible/gaiel-benchmarks/blob/main/docs/ARCHIVE.md
- Gist con resultados MLX (cluster): https://gist.github.com/encredible/5e04d928afd77f41088edb5fb91279e5
- Gist con resultados MLX (3 nodos): https://gist.github.com/encredible/57dacc557996e21e1d954e3344351556
