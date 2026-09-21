# BlueNipples/Anansi-35B-A3B-buildfiles_and_headvariants

## Resumen

Anansi-35B-A3B-buildfiles_and_headvariants es un repositorio auxiliar publicado por el usuario BlueNipples en Hugging Face. No contiene un modelo listo para inferencia, sino los artefactos de construcción del modelo Anansi-35B-A3B: la cabeza LM original de Anansi, dos variantes de cabeza interpoladas (Melody70 y Dark Scarlett70, construidas al 70 % con donante y 30 % con la cabeza original), el script de interpolación de cabezas y los ficheros de mergekit usados para ensamblar el modelo. El repositorio está marcado como experimental y etiquetado con qwen3.5, qwen3.6, mergekit, lm-head, gguf y safetensors.

Los metadatos de safetensors del repositorio declaran 508.559.360 parámetros y un tamaño total de 2,1 GB, cifra coherente con un conjunto de cabezas de salida y ficheros de configuración, no con un modelo MoE de 35B. El nombre del modelo apunta a una arquitectura de mezcla de expertos (MoE) de 35B totales con aproximadamente 3B de parámetros activos, construida sobre componentes de la familia Qwen3.5/Qwen3.5-MoE, pero no hay información publicada que confirme contexto, idiomas, licencia ni rendimiento del modelo completo.

Su relevancia es metodológica: documenta de forma abierta el proceso de fusión e interpolación de cabezas LM, algo poco frecuente en modelos ensamblados con mergekit, y permite a otros ahorrar el trabajo de reconstruir ese flujo. No obstante, se trata de un artefacto experimental con cero descargas y cero valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible para este repositorio; los ficheros de mergekit apuntan a un modelo basado en Qwen3.5/Qwen3.5-MoE y el nombre sugiere una arquitectura de mezcla de expertos (MoE). Contiene cabezas LM y artefactos de fusión, no un modelo completo |
| Parametros totales | 508.559.360 en los tensores safetensors del repositorio (no corresponde al modelo completo). El nombre del modelo indica 35B totales |
| Parametros activos | No disponible (el sufijo A3B del nombre sugiere unos 3B activos, sin confirmar por el autor) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (según etiquetas del repositorio) y Q8 en las cabezas interpoladas Melody70 y Dark Scarlett70; no se detallan más niveles de cuantización |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo Anansi-35B-A3B más allá de las etiquetas y de la referencia a Qwen3.5/Qwen3.5-MoE en los ficheros de mergekit. Por el nombre se deduce una configuración de mezcla de expertos con alrededor de 3B de parámetros activos sobre 35B totales, pero no se especifican número de expertos, routing, dimensión oculta ni número de capas. Tampoco se indica si hubo fases de ajuste fino supervisado, RLHF o DPO.

La innovación documentada es la interpolación de la cabeza LM: se publican dos variantes (Melody70 y Dark Scarlett70) que combinan un 70 % de pesos de un donante con un 30 % de la cabeza original de Anansi, junto con el script que realiza la interpolación. El autor advierte explícitamente que los ficheros de mergekit y la interpolación fueron producidos por un LLM y se publican principalmente para que otras personas no tengan que repetir el proceso de prueba y error. No se indican tokens de entrenamiento, composición del dataset ni metodología de evaluación.

## Capacidades

- Generación de texto: no verificable con la información disponible; el repositorio solo contiene cabezas LM y ficheros de fusión, no un modelo ejecutable completo.
- Sustitución e interpolación de cabezas de salida: es la función principal de los artefactos publicados (cabeza original de Anansi, Melody70 y Dark Scarlett70).
- Reproducción de fusiones con mergekit: incluye los ficheros de configuración empleados para construir Anansi sobre componentes Qwen3.5/Qwen3.5-MoE.
- Auditoría del proceso de ensamblado: permite inspeccionar cómo se combinaron pesos y cabezas en un modelo experimental.
- Tool calling, function calling y uso como agente: no disponible.
- Razonamiento multi-paso, matemáticas y código: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Reproducción de fusiones con mergekit: un ingeniero puede tomar los ficheros de configuración publicados y volver a ensamblar Anansi-35B-A3B paso a paso, verificando cada etapa del merge sobre los componentes Qwen3.5/Qwen3.5-MoE referenciados.
- Sustitución de cabeza LM en un modelo base: las variantes Melody70 y Dark Scarlett70 (70 % donante / 30 % cabeza original) permiten experimentar con el efecto de una cabeza interpolada sobre el comportamiento de decodificación sin reentrenar el cuerpo del modelo.
- Investigación sobre interpolación de pesos: el script incluido sirve como referencia para estudiar cómo afecta la proporción donante/original a la distribución de salida del modelo.
- Comparación de variantes de cabeza en evaluación: un equipo puede cargar la cabeza original y las dos interpoladas sobre el mismo cuerpo y medir diferencias en perplejidad o en métricas de tarea, aislando el efecto de la cabeza.
- Docencia y divulgación técnica: el repositorio ilustra con artefactos reales cómo se construye un modelo por fusión de pesos, incluyendo los ficheros intermedios que normalmente no se publican.
- Auditoría de procedencia de pesos: al publicarse la cabeza original junto a las variantes y las configuraciones de merge, es posible rastrear el origen de los tensores de salida de Anansi para revisión interna o cumplimiento.
- Reutilización de la cabeza en otros proyectos: la cabeza LM en safetensors puede emplearse como componente en experimentos propios de fusión, siempre que la licencia del modelo base lo permita, extremo que no está aclarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los artefactos del repositorio: los 508.559.360 parámetros declarados ocupan alrededor de 1 GB en fp16 y unos 0,5 GB en Q8, por lo que el conjunto de cabezas cabe en cualquier GPU de consumo e incluso en CPU.
- VRAM estimada para el modelo completo Anansi-35B-A3B: no disponible; un MoE de 35B totales exige, como referencia de orden de magnitud, varias decenas de GB en precisión de 16 bits, pero no hay datos publicados por el autor.
- GPU recomendadas: no disponibles para el modelo completo. Para manipular las cabezas y ejecutar el script de interpolación basta una GPU con unos pocos GB de VRAM o incluso CPU.
- Cabe en GPU de consumo: los ficheros de cabeza sí (cualquier GPU con 2 GB o más). El modelo completo no se puede evaluar con la información disponible.
- Opciones de despliegue: los ficheros GGUF del repositorio corresponden a variantes de cabeza, no a un modelo completo, por lo que no son cargables directamente en llama.cpp u Ollama como modelo autónomo. Para el modelo completo no hay instrucciones de despliegue publicadas (vLLM, TGI, llama.cpp u otros).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de modelos comparables con datos publicados en la información proporcionada. El repositorio es un conjunto de artefactos de construcción, no un modelo desplegable, por lo que una comparación de parámetros, contexto, rendimiento o licencia con alternativas de la misma categoría carece de base.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Anansi-35B-A3B-buildfiles_and_headvariants | 508.559.360 en safetensors del repo (modelo completo: 35B segun el nombre) | No disponible | No disponible | No disponible | Repositorio público en Hugging Face, 0 descargas |
| Anansi-35B-A3B (modelo principal) | No disponible | No disponible | No disponible | No disponible | Referenciado desde el repositorio, datos no verificados |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo ejecutable: contiene cabezas LM, un script de interpolación y ficheros de mergekit, no pesos completos listos para inferencia.
- Discrepancia de parámetros: el nombre indica 35B-A3B, pero los tensores safetensors del repositorio suman 508.559.360 parámetros; hay que tratar la cifra del nombre como no verificada en este repositorio.
- Licencia no declarada: sin licencia explícita no se puede determinar si el uso comercial está permitido; además, los componentes derivados de Qwen3.5/Qwen3.5-MoE heredarían las condiciones de sus modelos de origen, que no se detallan.
- Artefactos generados por un LLM: el propio autor advierte que los ficheros de mergekit y la interpolación fueron producidos por un modelo de lenguaje, por lo que pueden contener errores o configuraciones no óptimas.
- Idiomas y comportamiento no documentados: no hay información sobre cobertura lingüística, sesgos, alineación o tendencia a la alucinación.
- Ausencia de evaluación: no hay benchmarks, ni métricas de perplejidad, ni comparaciones publicadas.
- Madurez mínima: cero descargas y cero valoraciones, creado y actualizado en la misma fecha, lo que indica un artefacto recién publicado y sin validación comunitaria.
- Resultados de búsqueda no concluyentes: las consultas web realizadas devolvieron exclusivamente resultados sin relación con el modelo (marcadores deportivos), por lo que no se ha podido contrastar la información con fuentes externas.
- Riesgo en producción: no se recomienda su uso en entornos productivos sin una validación previa completa del modelo principal y de la licencia aplicable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/BlueNipples/Anansi-35B-A3B-buildfiles_and_headvariants
- Modelo principal Anansi-35B-A3B (referenciado en la model card): https://huggingface.co/BlueNipples/Anansi-35B-A3B
- Paper, blog, repositorio de código o demo adicionales: no disponible en la información proporcionada.
