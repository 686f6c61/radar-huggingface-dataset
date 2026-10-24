# landauros/LST

## Resumen

LST es un repositorio de Hugging Face publicado por el usuario `landauros` que contiene checkpoints experimentales de políticas robóticas (robot policies). No se trata de un modelo único ni de un lanzamiento formal, sino de una colección de artefactos de entrenamiento derivados de RDT-1B, el transformer de difusión para manipulación robótica cuyo código y pesos preentrenados se distribuyen bajo licencia MIT. El repositorio ocupa 50,7 GB e incluye checkpoints en formato PyTorch que pueden contener estado de entrenamiento, no solo pesos de inferencia.

La model card es explícita sobre el estado del proyecto: la subida está en curso, no existe un manifiesto `VERIFIED` por familia y la ausencia de este implica que esa familia aún no es un archivo completo y verificado. Los nombres de directorio no son prueba de la configuración efectiva ni de los resultados de evaluación; para saberlo hay que inspeccionar los ficheros de configuración y normalización asociados. El autor advierte que no son modelos genéricos listos para usar y que no deben emplearse sobre hardware sin el software compatible y las comprobaciones de seguridad oportunas.

Su relevancia actual es acotada y de carácter reproducibilidad/auditoría: sirve como material de partida para investigar fine-tuning de políticas visuomotoras sobre RDT-1B, pero no cuenta con descargas ni valoraciones (0 descargas, 0 likes en el momento de la consulta), no declara licencia propia para la colección y no presenta resultados de benchmarks. Fue creado el 21 de octubre de 2026 y actualizado el 24 de octubre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible con confirmación. Checkpoints derivados de RDT-1B; el repositorio upstream se denomina `robotics-diffusion-transformer`, lo que apunta a un transformer de difusión, pero la model card no lo detalla |
| Parámetros totales | No disponible. La nomenclatura RDT-1B sugiere del orden de 1.000 millones, sin confirmar en la información proporcionada |
| Parámetros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible. En políticas robóticas el equivalente sería el horizonte de observación y de acción, que no se documenta |
| Tipos de cuantización | No disponible. No se publican versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible. No es un modelo de lenguaje; el posible condicionamiento por instrucciones en lenguaje natural no se documenta |
| Licencia | No disponible para la colección. Los pesos upstream de RDT-1B son MIT (véase `licenses/RDT-MIT.txt` en el repo); las familias no derivadas de RDT no están cubiertas por esa licencia |
| Formato de pesos | Checkpoints de PyTorch, potencialmente con estado de entrenamiento (`state_dict` completo). No se confirma safetensors |
| Tamaño del repositorio | 50,7 GB |
| Pipeline declarada | `robotics` |
| Etiquetas | `robotics`, `region:us` |
| Descargas / likes | 0 / 0 |
| Fechas | Creado 2026-10-21; actualizado 2026-10-24 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna de estos checkpoints. El único anclaje técnico es su procedencia: son derivados fine-tuned de RDT-1B, un modelo de la familia de transformers de difusión para políticas robóticas (el propio identificador del repositorio upstream, `robotics-diffusion-transformer/rdt-1b`, así lo indica). Cualquier detalle sobre número de capas, dimensión oculta, mecanismo de atención, tipo de scheduler de difusión o encodes de acciones requeriría consultar el código y la configuración de RDT, que no se reproducen en la model card.

Tampoco se documentan los datos de entrenamiento: no se indica el número de tokens, el número de episodios de demostración, la composición del dataset, la plataforma robótica empleada ni si hubo etapas de ajuste por preferencias (RLHF/DPO), algo por otra parte poco habitual en políticas de manipulación. La model card aclara que los datasets originales, vídeos, credenciales y logs no se incluyen en el repositorio, y que los ficheros se preservan byte a byte. Esto implica que el material publicado es un archivo de artefactos, no una receta reproducible de entrenamiento. Tampoco se declara ninguna innovación técnica propia de esta colección.

## Capacidades

- Generación de acciones motoras a partir de observaciones: es la función esperada de una política robótica etiquetada con el pipeline `robotics`, aunque la model card no detalla las modalidades de entrada (visión, propriocepción, instrucciones).
- Condicionamiento por instrucciones o por estado: no documentado. La familia RDT-1B se asocia a manipulación bimanual, pero este extremo no se confirma en la información proporcionada.
- Tool calling / function calling: no disponible. No es una capacidad propia de una política robótica y no se menciona.
- Soporte de agentes y razonamiento multi-paso: no disponible. No se documenta ningún modo de razonamiento explícito ni planificación simbólica.
- Capacidades multilingües: no disponible. No se declaran idiomas y no hay evidencia de que el modelo procese texto de forma general.
- Capacidades especiales (visión, audio, thinking mode): no disponible. Solo se puede afirmar que el repositorio está etiquetado como `robotics`; el resto de modalidades no se especifica.
- Carga segura de pesos: la propia model card recomienda evitar `pickle` sobre ficheros no confiables y usar carga segura, lo que constituye una indicación operativa, no una capacidad del modelo.

## Casos de uso

- Investigación en manipulación robótica: usar los checkpoints como punto de partida para fine-tuning sobre un robot de laboratorio con el código de RDT-1B, comparando configuraciones y normalizaciones entre experimentos. Es adecuado porque el repositorio conserva los nombres de ejecución originales y los ficheros de configuración asociados.
- Reproducción y auditoría de experimentos: reconstruir qué ajustes produjeron cada checkpoint inspeccionando configuración y normalización, dado que los nombres de directorio no son prueba de los ajustes efectivos. Útil en equipos que necesitan trazabilidad de artefactos.
- Punto de partida para currículos de sim-to-real: entrenar o adaptar la política en simulación y transferirla después a hardware real, siempre que se cuente con el software compatible y las comprobaciones de seguridad indicadas por el autor.
- Evaluación comparativa de políticas: emplear los checkpoints como baseline interno frente a otros derivados de RDT-1B, asumiendo que la colección no aporta métricas publicadas y que la evaluación debe ejecutarse localmente.
- Integración en un stack ROS 2 con el runtime de RDT: cargar el checkpoint en el pipeline de inferencia de la familia RDT y publicar acciones en los tópicos de control del robot, con límites de par y paradas de emergencia configurados externamente.
- Archivado y cadena de custodia de artefactos: conservar los ficheros byte a byte como referencia de un estado concreto del entrenamiento, útil para auditorías internas o para replicar un resultado meses después.
- Docencia y formación en políticas visuomotoras: emplear los checkpoints en un entorno simulado para ilustrar el ciclo observación-acción y el efecto de la normalización de datos, sin riesgo físico para el alumnado.
- Formación de pipelines de carga segura: usar el repositorio como caso de prueba para validar procedimientos de carga de checkpoints sin `pickle` y verificación de integridad en infraestructura de ML.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la subida de un archivo no constituye una afirmación de que el experimento haya superado una evaluación, y que la ausencia de un manifiesto `VERIFIED` por familia implica que esta no es un archivo completo verificado.

Los resultados de búsqueda web devueltos para la consulta «LST» corresponden a LST-AI, un ensemble de segmentación de lesiones de esclerosis múltiple, y a rankings genéricos de modelos de lenguaje. Ninguno de ellos guarda relación con `landauros/LST` ni aporta métricas aplicables.

| Benchmark | LST | RDT-1B (upstream) | Referencia |
|---|---|---|---|
| MMLU | No aplica | No disponible | No es un modelo de lenguaje |
| HumanEval | No aplica | No disponible | No es un modelo de código |
| GSM8K | No aplica | No disponible | No es un modelo de razonamiento matemático |
| Tasa de éxito en manipulación | No disponible | No disponible en la información proporcionada | Requiere evaluación local |

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño individual de cada checkpoint no se documenta; el repositorio completo ocupa 50,7 GB, lo que sugiere múltiples checkpoints o estado de entrenamiento incluido. Conviene inspeccionar el tamaño de cada fichero antes de planificar el despliegue.
- GPU recomendadas: no disponibles en la información proporcionada. Al tratarse de un derivado de RDT-1B, el requisito vendrá determinado por la arquitectura upstream y por si se carga en precisión completa o reducida.
- Encaje en GPU de consumo: no confirmado. Sin el tamaño exacto del checkpoint y la arquitectura, no es posible afirmar que quepa en una RTX 4090 (24 GB) u otra GPU de gama alta de consumo.
- Opciones de despliegue: el runtime de RDT-1B en PyTorch es la vía prevista. vLLM, TGI, llama.cpp y Ollama están orientados a modelos de lenguaje y no aplican a este tipo de política; no se documenta exportación a ONNX ni TensorRT.
- Latencia y throughput: no disponibles. En políticas de difusión, el coste por paso depende del número de pasos de denoising, un parámetro que no se especifica.
- Requisitos adicionales: el autor exige software compatible y comprobaciones de seguridad antes de usar los checkpoints en hardware real. Cualquier despliegue en un robot debe incorporar límites de par, paradas de emergencia y validación en simulación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Licencia | Formato | Evaluación publicada | Disponibilidad |
|---|---|---|---|---|---|---|
| LST (`landauros/LST`) | No disponible | No disponible | No disponible para la colección; upstream MIT | Checkpoints PyTorch con posible estado de entrenamiento | No | Pública en HF, 0 descargas |
| RDT-1B (`robotics-diffusion-transformer/rdt-1b`) | No disponible en la información proporcionada | No disponible | MIT | Pesos PyTorch upstream | No consultada en esta ficha | Repositorio upstream público |
| Otras familias del repo LST | No disponible | No disponible | No cubiertas por la licencia MIT de RDT; pendientes de revisión | No disponible | No | Sujetas a revisión antes de su incorporación |
| LST-AI (segmentación de lesiones de EM) | No disponible | No aplica | No disponible | No disponible | Sí, según la publicación citada (103 casos de test) | Open source, CLI y contenedor Docker |

Advertencia: LST-AI es un proyecto homónimo sin relación con este repositorio; se incluye únicamente para evitar confusiones en búsquedas.

## Limitaciones y advertencias

- Ausencia de licencia clara: la colección no declara licencia propia. Solo los derivados de RDT-1B quedan amparados por la licencia MIT del upstream; las demás familias requieren revisión previa. El uso comercial de los derivados fine-tuned no está explícitamente autorizado en la información disponible.
- Riesgo de seguridad en la carga: son checkpoints de PyTorch que pueden contener estado de entrenamiento y requerir la arquitectura personalizada correspondiente. Nunca debe hacerse `unpickle` de ficheros no confiables; hay que usar carga segura y verificar la procedencia.
- Archivo incompleto: no hay manifiesto `VERIFIED` por familia, la subida está en curso y un archivo subido no implica que el experimento haya superado una evaluación.
- Ambigüedad de los nombres: los nombres de directorio no son prueba de los ajustes efectivos ni de los resultados. Es obligatorio inspeccionar configuración y normalización antes de extraer conclusiones.
- Sin métricas: no hay benchmarks ni tasas de éxito publicadas, por lo que el rendimiento real en una tarea concreta es desconocido hasta que se evalúe localmente.
- Sesgos desconocidos: al no documentarse la composición del dataset de fine-tuning, no se puede caracterizar el sesgo de la política (por ejemplo, hacia objetos, texturas, posiciones o morfologías concretas).
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí de acciones incoherentes o fuera de distribución ante observaciones novedosas, con consecuencias físicas si se ejecuta en hardware real.
- Limitaciones de idioma y contexto: no se declaran idiomas soportados ni ventana de contexto; el condicionamiento lingüístico, si existe, no está documentado.
- Madurez baja: 0 descargas y 0 likes, creado y actualizado en octubre de 2026, sin historial de uso ni mantenimiento.
- Confusión en búsquedas: los resultados web para «LST» apuntan mayoritariamente a LST-AI (segmentación de lesiones de esclerosis múltiple) y a rankings de LLM, ninguno relacionado con este repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/landauros/LST
- Modelo upstream RDT-1B: https://huggingface.co/robotics-diffusion-transformer/rdt-1b
- Licencia MIT del upstream dentro del repositorio: `licenses/RDT-MIT.txt` (ruta relativa al repositorio de Hugging Face)
- LST-AI, proyecto homónimo no relacionado: https://www.sciencedirect.com/science/article/pii/S2213158224000500
- LST-AI, artículo en acceso abierto: https://doaj.org/article/282946db78e7480b84215979b2e318c5
