# rafaelmartinssen/document-ai-scratch

## Resumen

`rafaelmartinssen/document-ai-scratch` es un repositorio de Hugging Face publicado por el usuario rafaelmartinssen que, a pesar de su nombre y de las etiquetas `safetensors` y `transformer`, no contiene un modelo de lenguaje entrenado. La model card lo describe explicitamente como un conjunto estructurado de notas de investigacion sobre Document AI, con referencias de evaluacion y preguntas abiertas, y el propio autor indica que no se ha liberado ningun checkpoint entrenado ni codigo.

El repositorio incluye un unico artefacto principal, `review.md`, que aborda el alcance de una pregunta de investigacion, probables factores de confusion, una comparacion propuesta con lineas base emparejadas y contexto de evaluacion concreto sobre los conjuntos de datos FUNSD, SROIE y CORD. Las secciones marcadas como planes o hipotesis no deben interpretarse como resultados experimentales.

El dato de parametros totales que reporta la plataforma (49.600) corresponde a los tensores almacenados en el fichero safetensors del repositorio, no a un modelo con capacidad generativa. Con 0 descargas y 0 likes en el momento de la consulta, el repositorio tiene caracter exploratorio y no constituye una base solida para despliegues en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene notas de investigacion, no un modelo entrenado) |
| Parametros totales | 49.600 (segun los tensores del fichero safetensors; no corresponde a un modelo generativo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (presente en el repo, sin model card que describa su uso) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre arquitectura de red, datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de alineacion como RLHF o DPO. La model card no describe ningun proceso de entrenamiento y declara explicitamente que el repositorio no incluye un checkpoint entrenado ni codigo liberado.

El contenido del repositorio es documental: un fichero `review.md` con notas sobre el estado de la investigacion en Document AI, referencias a los conjuntos de evaluacion FUNSD, SROIE y CORD, y una propuesta metodologica de comparacion con lineas base emparejadas. El autor senala que, si en el futuro se anaden resultados, deberan incluir versiones de dataset, comandos, semillas, hardware y registros en bruto.

## Capacidades

- No se documenta ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas o vision.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues.
- El unico contenido verificable es la nota de investigacion `review.md` sobre Document AI.

## Casos de uso

- Revision bibliografica de Document AI: el fichero `review.md` puede servir como punto de partida para localizar referencias y preguntas abiertas sobre el area, aunque requiere verificacion independiente de cada referencia citada.
- Planificacion de experimentos con FUNSD, SROIE y CORD: las secciones de metodologia propuesta pueden orientar el diseno de comparaciones con lineas base emparejadas, siempre que el investigador valide los conjuntos de datos por su cuenta.
- Identificacion de factores de confusion: el documento enumera posibles variables de confusion en la evaluacion de sistemas de Document AI, util como checklist en revisiones internas de proyectos.
- Definicion de protocolos de reproducibilidad: las notas sugieren incluir versiones de dataset, comandos, semillas, hardware y registros en bruto, lo que puede adoptarse como plantilla de documentacion experimental.
- Formacion y divulgacion: el material puede emplearse como apoyo en seminarios o grupos de lectura sobre Document AI, dado su caracter exploratorio y su licencia permisiva.
- Base para un future trabajo de investigacion: el repositorio puede citarse como origen de una hipotesis, pero no como evidencia de resultados, ya que el autor lo declara explicitamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el repositorio no reclama mejoras en benchmarks, ablaciones completadas, codigo liberado ni checkpoint entrenado.

## Requisitos de hardware

- No aplica inferencia de un modelo generativo: el repositorio no contiene un checkpoint utilizable para tareas de generacion.
- El fichero safetensors ocupa 0.0 GB segun la plataforma, por lo que su manipulacion no requiere VRAM significativa.
- No se especifican GPU recomendadas (A100, H100, RTX 4090 u otras) porque no hay modelo que ejecutar.
- No se documentan opciones de despliegue como vLLM, llama.cpp, Ollama o TGI.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria, dado que este repositorio no constituye un modelo entrenado sino un conjunto de notas de investigacion.

## Limitaciones y advertencias

- El repositorio no contiene un modelo entrenado ni un checkpoint utilizable; las etiquetas `safetensors` y `transformer` no implican capacidad generativa.
- La model card advierte que las secciones marcadas como planes o hipotesis no son resultados experimentales.
- No se han publicado resultados de benchmarks, ablaciones ni evaluaciones cuantitativas.
- No hay informacion sobre sesgos, riesgo de alucinacion o limitaciones idiomaticas porque no existe un modelo que evaluar.
- La licencia cc-by-4.0 permite uso comercial con atribucion, pero el autor recomienda revisar por separado los terminos de los datos de origen si se combina con conjuntos externos como FUNSD, SROIE o CORD.
- El repositorio presenta 0 descargas y 0 likes, y fue creado y actualizado en la misma fecha, lo que sugiere un estado inicial y sin validacion por parte de la comunidad.
- No debe citarse como evidencia de mejoras en Document AI ni como base para decisiones de produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rafaelmartinssen/document-ai-scratch
- Referencia externa no verificada (hilo de Reddit sobre un modelo de IA en Scratch): http://go/v1/AWXPlBC496yiawooCAHgGH14NWGtzFWf2fV5OeTigvG62JShso3vChaoht-aUDa1YShmUbzP0h5fvmvyZs9I7xsgPEjkjrBE89bvLbxPmkCZvgwNqB5DRtXLGjDURviMNsrn_J9vwbqtKBrHKJBUC1jLQqFJ4pi66TuoCvtYbkqnOJ6SuELwbIfBGKDE5nL4uff6Evph6KQDgBgt329XJNzZCs6Z_FMvP9VZrP0ZFwMn5qS7iZCATtCSnRpcyRku6lKy6_QB7VvTGzhC2ro-jA4
