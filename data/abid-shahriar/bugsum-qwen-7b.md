# Abid-Shahriar/BugSum-Qwen-7B

## Resumen

BugSum-Qwen-7B es un adaptador LoRA desarrollado por Md. Abid Shahriar como parte de su investigación de tesis sobre resumen de informes de errores de software. No es un modelo autónomo, sino un adaptador que debe cargarse sobre el modelo base Qwen/Qwen2.5-Coder-7B-Instruct. Su propósito es generar resúmenes concisos y orientados a desarrolladores a partir de descripciones de informes de errores en inglés.

El adaptador se entrenó mediante QLoRA con cuantización de 4 bits (NF4) sobre una GPU NVIDIA RTX 4070 de 12 GB, utilizando una configuración de rango 8, alpha 16 y dropout 0.05, dirigida a los módulos de atención y MLP. El repositorio contiene únicamente los archivos del adaptador y el tokenizador, con un tamaño de 0.1 GB. La licencia es "other" (privada para revisión de investigación), y el modelo base se distribuye por separado bajo Apache-2.0.

La relevancia de este adaptador radica en su especialización para una tarea concreta de ingeniería de software: el resumen automático de informes de errores, un problema habitual en el triaje de issues. Al estar basado en un modelo de código de 7B, aprovecha las capacidades de comprensión técnica del modelo base, aunque su uso está limitado al inglés y requiere revisión humana de los resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-Coder-7B-Instruct (Transformer decoder) |
| Parametros totales | No disponible (el adaptador tiene un numero reducido de parametros, no especificado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (hereda la del modelo base, no especificada en la documentacion del adaptador) |
| Tipos de cuantizacion | El adaptador se entreno con cuantizacion 4-bit NF4; el modelo base puede cargarse en distintas cuantizaciones (por ejemplo, 4-bit, 8-bit) |
| Idiomas soportados | Ingles (en) |
| Licencia | other (privada para revision de investigacion; el modelo base es Apache-2.0) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura Transformer del modelo Qwen2.5-Coder-7B-Instruct, un modelo de lenguaje de 7B parametros especializado en codigo. El entrenamiento se realizo mediante QLoRA (Quantized Low-Rank Adaptation), una tecnica que congela los pesos del modelo base y entrena matrices de bajo rango en los modulos de atencion y MLP. La configuracion LoRA utiliza rango 8, alpha 16 y dropout 0.05, con cuantizacion de 4 bits NF4 para el modelo base durante el entrenamiento.

El corpus de entrenamiento no se redistribuye en el repositorio debido a las condiciones de acceso y licencia de los conjuntos de datos fuente. El entrenamiento se realizo con supervisio (supervised fine-tuning) sobre pares de informes de errores y resumenes. No se menciona el uso de RLHF ni DPO. El adaptador se entreno en una GPU NVIDIA RTX 4070 de 12 GB, lo que indica un presupuesto computacional modesto.

## Capacidades

- Generacion de resumenes concisos de informes de errores de software en ingles, orientados a desarrolladores.
- Comprension de descripciones tecnicas de bugs, incluyendo contexto de codigo y sintomas.
- Generacion de texto en formato conversacional, heredado del modelo base.
- Capacidad de resumir informacion manteniendo los puntos clave, aunque con riesgo de omision o alucinacion.
- No se especifican capacidades de tool calling, agentes, vision ni audio; el adaptador se limita a la tarea de resumen.

## Casos de uso

- Triaje de issues en repositorios de software: el adaptador puede generar un resumen inicial de cada informe de bug, permitiendo a los mantenedores priorizar rapidamente sin leer la descripcion completa.
- Asistencia a desarrolladores en la revision de incidencias: al integrarse en herramientas de gestion de proyectos, puede producir un resumen breve de cada issue para facilitar la asignacion a los miembros del equipo.
- Generacion de documentacion tecnica: a partir de informes de errores, el adaptador puede redactar resumenes que se incorporen a changelogs o notas de version.
- Investigacion en PLN aplicada a ingenieria de software: sirve como base para experimentos sobre resumen de bugs, comparacion de tecnicas de adaptacion o analisis de calidad de resumenes.
- Preprocesamiento de datos para analisis posterior: los resumenes generados pueden alimentar sistemas de clasificacion o clustering de issues, reduciendo la dimensionalidad del texto original.
- Entrenamiento de modelos mas grandes: el adaptador puede utilizarse para generar datos sinteticos de resumenes de bugs, que luego sirvan para fine-tuning de otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como ROUGE, BLEU ni comparaciones con otros modelos de resumen. Tampoco se menciona una evaluacion externa amplia.

## Requisitos de hardware

- El adaptador en si ocupa muy poco espacio (0.1 GB), pero requiere cargar el modelo base Qwen2.5-Coder-7B-Instruct, que tiene aproximadamente 7B parametros.
- Para inferencia en precision completa (FP16), se estima una VRAM de al menos 14-16 GB, por lo que cabe en GPUs como RTX 4080, RTX 4090, A10 o A100.
- Con cuantizacion 4-bit (como la usada en el entrenamiento), la VRAM necesaria se reduce a unos 6-8 GB, permitiendo su ejecucion en GPUs de consumo como RTX 3060, RTX 4070 o incluso en CPU con suficiente RAM.
- El entrenamiento se realizo en una RTX 4070 de 12 GB, lo que confirma que el adaptador es viable en hardware de consumo.
- Opciones de despliegue: se puede cargar con la libreria `transformers` y `peft` (como se muestra en el codigo de ejemplo), o mediante servidores de inferencia como vLLM o TGI, siempre que soporten modelos PEFT.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores LoRA especificos para resumen de bugs comparables. Como referencia, se puede comparar con el modelo base sin adaptador:

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| BugSum-Qwen-7B (adaptador) | No disponible | No disponible | Resumen de bugs en ingles | other (privada) |
| Qwen2.5-Coder-7B-Instruct (base) | 7B | 32k (segun documentacion oficial, no confirmado en la model card) | Generacion de codigo y texto | Apache-2.0 |
| Otros modelos de resumen genericos (p.ej. BART, T5) | 0.4B-11B | 512-1024 | Resumen general | Varía |

La comparativa es limitada porque no hay datos publicados de rendimiento del adaptador. El modelo base es un modelo de codigo, no un modelo de resumen especifico, por lo que el adaptador aporta la especializacion necesaria.

## Limitaciones y advertencias

- Disenado exclusivamente para informes de errores de software en ingles; no es adecuado para resumen general ni para otros idiomas.
- Puede alucinar informacion, omitir detalles importantes o conservar un estilo similar al titulo en lugar de producir un resumen ideal.
- No ha completado una evaluacion humana externa amplia; los resultados dependen del prompt y de los parametros de decodificacion.
- La licencia del adaptador es "other" y se comparte de forma privada para revision de investigacion; no se transfieren derechos sobre los datos de entrenamiento.
- El modelo base se distribuye por separado bajo Apache-2.0, pero el adaptador no tiene una licencia de uso comercial clara.
- No se recomienda su uso en decisiones automaticas de produccion o criticas para la seguridad; los resumenes deben ser revisados por una persona.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Abid-Shahriar/BugSum-Qwen-7B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Perfil del autor en Google Scholar: https://scholar.google.com/citations?user=pn7-ce8AAAAJ&hl=en
