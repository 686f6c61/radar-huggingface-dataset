# shoemoney/Qwen3.8-27B-Abliterated-MLX-q6

## Resumen

Qwen3.8-27B-Abliterated-MLX-q6 es una cuantizacion en 6 bits del modelo Qwen3.8-27B abliterado, convertida al formato MLX para su ejecucion eficiente en hardware Apple Silicon. El modelo base, desarrollado por huihui-ai, es una version del Qwen3.8-27B de Alibaba a la que se ha aplicado la tecnica de abliteration, que elimina selectivamente las direcciones de activacion responsables del rechazo de contenido, dando como resultado un modelo sin censura. Esta conversion concreta, realizada por shoemoney, no anade ningun ajuste adicional: solo cuantiza los pesos BF16 originales a 6 bits con un grupo de 64.

La relevancia de este modelo reside en tres factores: primero, hereda las capacidades multimodales nativas del Qwen3.8-27B, que destaca en tareas de codigo, flujos de trabajo agente y automatizacion ofimatica; segundo, la cuantizacion MLX permite ejecutarlo en Macs con memoria unificada, con un tamano en disco de 22,8 GB; tercero, la abliteration lo convierte en una opcion para casos de uso que requieren generacion de contenido sin las restricciones habituales de seguridad. El modelo tiene aproximadamente 6.350 millones de parametros, aunque el nombre "27B" hace referencia a la familia del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (dense, multimodal vision-language) |
| Parametros totales | 6.346.296.560 |
| Parametros activos | no aplica (modelo dense) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6-bit MLX (q-group-size 64) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un modelo denso multimodales nativo que procesa texto e imagenes, construido sobre la arquitectura de la serie Qwen3.5-27B con mejoras especificas en codificacion y productividad ofimatica. La version abliterada de huihui-ai aplica la tecnica de abliteration, que identifica y elimina las direcciones de activacion asociadas al comportamiento de rechazo del modelo, sin reentrenamiento adicional. Este proceso no modifica las capacidades generales del modelo, pero elimina la capa de seguridad que impide generar ciertos contenidos.

La conversion a MLX realizada por shoemoney es puramente mecanica: se cuantizaron los pesos BF16 a 6 bits con un grupo de 64 utilizando `mlx_vlm.convert`. No hubo fine-tuning, ni merging, ni re-alineamiento. El autor midio una perplejidad de 6,427 en el dataset `allenai/tulu-3-sft-mixture` (192 muestras de 512 tokens, seed 123), que es 1,03 veces la del mejor modelo de la misma familia de cuantizaciones, lo que indica una perdida de calidad minima respecto a la version BF16.

## Capacidades

- Generacion de texto y razonamiento multimodal: procesa entradas de texto e imagen, heredando las capacidades del Qwen3.8-27B original.
- Generacion de codigo: el modelo base destaca en tareas de programacion, incluyendo generacion, explicacion y depuracion de codigo en multiples lenguajes.
- Flujos de trabajo agente: soporta razonamiento multi-paso y planificacion de tareas complejas, adecuado para pipelines de automatizacion.
- Automatizacion ofimatica: capacidades mejoradas para tareas de productividad, como generacion de documentos, hojas de calculo y presentaciones.
- Sin censura: la abliteration elimina los mecanismos de rechazo, permitiendo generar contenido que el modelo original bloquearia.
- Ejecucion en Apple Silicon: gracias a la cuantizacion MLX, puede ejecutarse en Macs con memoria unificada sin necesidad de GPU NVIDIA.

## Casos de uso

- Generacion de contenido creativo sin restricciones: escritores y creadores pueden utilizar el modelo para generar narrativa, guiones o material de marketing sin que el modelo rechace solicitudes por politicas de seguridad, algo que ocurre con los modelos alineados.
- Asistente de programacion local en Mac: un desarrollador puede ejecutar el modelo en su MacBook Pro o Mac Studio con mlx-vlm, usandolo para generar codigo, explicar fragmentos o refactorizar sin enviar datos a la nube.
- Automatizacion de tareas ofimaticas: el modelo puede generar borradores de documentos, resumir correos electronicos o preparar presentaciones a partir de instrucciones en lenguaje natural, aprovechando las mejoras del Qwen3.8-27B en productividad.
- Analisis de imagenes y documentos escaneados: al ser multimodal, puede extraer informacion de capturas de pantalla, diagramas o documentos con formato, combinando vision y texto en un solo paso.
- Desarrollo de agentes de razonamiento multi-paso: integrable en frameworks de agentes donde se requiere planificacion, llamada a herramientas y ejecucion secuencial de tareas, gracias a las capacidades de razonamiento del modelo base.
- Investigacion en seguridad y alineacion: el modelo abliterado sirve como caso de estudio para investigadores que analizan los efectos de la abliteration en las capacidades y comportamientos de los modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor proporciona las siguientes mediciones propias:

| Metrica | Valor |
|---|---|
| Perplejidad (tulu-3-sft-mixture, 192 muestras) | 6,427 |
| Perplejidad relativa al mejor modelo de la familia | 1,03x |
| Throughput (1 peticion concurrente) | 22,1 tok/s |
| Throughput (8 peticiones concurrentes) | 65,7 tok/s |

Las mediciones se realizaron en un Apple M3 Ultra con 96 GB de memoria unificada. La perplejidad solo es comparable dentro de la misma familia de cuantizaciones, ya que los tokenizadores difieren entre familias de modelos.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa 22,8 GB en disco, por lo que se recomienda un minimo de 24 GB de memoria unificada para cargarlo completo. Con 32 GB o mas se puede operar con margen para el contexto y las activaciones.
- GPU recomendadas: cualquier Mac con chip Apple Silicon (M1, M2, M3, M4) con al menos 32 GB de memoria unificada. El autor uso un M3 Ultra con 96 GB.
- Compatibilidad con GPU consumer: no aplica directamente, ya que MLX esta disenado para Apple Silicon. Para GPUs NVIDIA se necesitaria una conversion a otro formato (GGUF, FP8, etc.).
- Opciones de despliegue: mlx-vlm es la libreria principal. Tambien se puede usar con mlx-lm si se adapta el registro de arquitectura, aunque el autor advierte que esta arquitectura esta registrada en mlx-vlm.
- Latencia y throughput: 22,1 tok/s con una peticion y 65,7 tok/s con 8 peticiones concurrentes en M3 Ultra, segun las mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Abliterated-MLX-q6 (este) | 6,35B | no disponible | 6-bit MLX | Apache-2.0 | HuggingFace |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 6,35B | no disponible | BF16 | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.8-27B (original) | 6,35B | no disponible | BF16 | Apache-2.0 | HuggingFace |
| PocketAiHub/Qwen3.8-27B-Abliterated-MLX | no disponible | no disponible | MLX | Apache-2.0 | HuggingFace |

La diferencia principal entre este modelo y el original de Qwen es la abliteration (eliminacion de la capa de rechazo) y la cuantizacion a 6 bits. Frente a otras conversiones MLX del mismo modelo abliterado, la diferencia esta en el grupo de cuantizacion (64) y las mediciones de calidad publicadas por el autor.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo del modelo, lo que significa que puede generar contenido ofensivo, ilegal o peligroso sin filtro. Su uso en produccion debe evaluarse cuidadosamente segun el caso de uso y la jurisdiccion.
- La cuantizacion a 6 bits introduce una perdida de calidad respecto al modelo BF16 original, aunque el autor la estima en un 3% relativo al mejor modelo de la familia.
- No se dispone de informacion sobre la longitud de contexto soportada, los idiomas cubiertos ni los resultados en benchmarks estandar, lo que dificulta la comparacion objetiva con otros modelos.
- El modelo es multimodal, pero la conversion MLX se realizo con mlx-vlm, por lo que no funcionara con mlx-lm sin adaptaciones.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener condiciones adicionales de uso aceptable que deben revisarse en la documentacion oficial de Alibaba.
- El rendimiento medido (22,1 tok/s) corresponde a un M3 Ultra; en chips menos potentes el throughput sera significativamente menor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shoemoney/Qwen3.8-27B-Abliterated-MLX-q6
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Pagina del modelo en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Conversion MLX alternativa: https://huggingface.co/PocketAiHub/Qwen3.8-27B-Abliterated-MLX
- Analisis de la abliteration y el despliegue MLX: https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026
