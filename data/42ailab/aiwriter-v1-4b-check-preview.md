# 42ailab/AIWriter-V1-4B-Check-Preview

## Resumen

AIWriter-V1-4B-Check-Preview es un modelo de corrección de texto en chino simplificado desarrollado por 42ailab, un fine-tune del modelo base Qwen/Qwen3-4B (4.022.468.096 parámetros, licencia Apache-2.0). Su función es la revisión de textos largos en chino: erratas, uso incorrecto de palabras, gramática y puntuación, con una ventana de contexto de 4.096 tokens y una salida recomendada de 192 tokens. Se distribuye únicamente en formato GGUF (Q8_0 y Q5_K_M) y está pensado para ejecutarse en local, de modo que el manuscrito del usuario no abandone su máquina.

La peculiaridad del modelo no es su capacidad bruta de detección, sino su comportamiento conservador. Según la model card, los modelos generalistas optimizan "encontrarlo todo", mientras que este modelo optimiza "contenerse": la tasa de falsa edición (editar frases que no contienen ningún error) es del 19,92%, frente al 43,4%-50,4% de tres modelos insignia medidos por el propio autor en el mismo conjunto de desarrollo. El argumento del autor es que una errata no detectada la acaba cazando el editor humano, pero una frase "mejorada" en silencio se queda en el libro y ya no es la frase que escribió el autor.

Es una versión de vista previa (preview): la versión estable se publicará como 42ailab/AIWriter-V1-4B-Check tras el evento de lanzamiento de AIWriter, y este repositorio se conservará marcado como superado, no se borrará. El modelo está diseñado para integrarse en la aplicación de escritorio AIWriter y en el motor de inferencia local 42model. La licencia AIWriter Model License 1.0 permite uso académico y personal gratuito, pero exige licencia específica para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; heredada del modelo base Qwen/Qwen3-4B (transformer decoder-only denso) |
| Parametros totales | 4.022.468.096 (aproximadamente 4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | GGUF Q8_0 (4,28 GB) y GGUF Q5_K_M (2,89 GB) |
| Idiomas soportados | Chino simplificado (zh) |
| Licencia | AIWriter Model License 1.0 (uso académico y personal gratuito; uso comercial sujeto a licencia) |
| Formato de pesos | GGUF |
| Modelo base | Qwen/Qwen3-4B (Apache-2.0, Qwen Team) |
| Relacion con el modelo base | fine-tune |
| Salida recomendada | 192 tokens |
| Tamano del repositorio | 7,2 GB |
| Tarea declarada | text-generation, corrección de texto y revisión ortotipográfica |
| Fecha de creacion | 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del modelo. El dato disponible es que se trata de un fine-tune del modelo Qwen/Qwen3-4B, con 4.022.468.096 parámetros y una longitud de contexto declarada de 4.096 tokens. No se publican detalles sobre el número de capas, el tipo de atención, el vocabulario, la estrategia de tokenización ni si se aplicaron técnicas como decodificación especulativa o atención lineal.

Tampoco se detallan los datos de entrenamiento: no se indica el número de tokens, la composición del dataset, ni si hubo RLHF, DPO o algún otro método de alineamiento. El autor sí afirma una innovación relevante en el comportamiento del modelo: "devolver la frase sin cambios cuando no hay error" es un comportamiento aprendido de la distribución de entrenamiento, no una instrucción introducida en un prompt de sistema. Es decir, el sesgo conservador de la edición se atribuye al propio entrenamiento y no al prompt. El autor anuncia además que la receta completa de entrenamiento, el diseño de evaluación y las ablaciones se publicarán en un informe técnico y en los artículos asociados, que todavía no están disponibles.

Junto al modelo se publica AIWriter CheckBench, un benchmark de corrección de texto en chino construido internamente por 42ailab, que trata la tasa de falsa edición como una métrica de primera clase junto a la métrica principal.

## Capacidades

- Corrección de erratas, uso incorrecto de palabras, gramática y puntuación en chino simplificado.
- Revisión a nivel de frase: el modelo procesa y devuelve frases, no documentos completos.
- Conservadurismo aprendido: tiende a devolver la frase original intacta cuando no detecta error, con una tasa de falsa edición declarada del 19,92%.
- Generación de texto conversacional: el repositorio está etiquetado como conversational y endpoints_compatible, además de text-generation.
- Ejecución totalmente local y sin conexión: al estar en formato GGUF, el manuscrito no sale de la máquina del usuario.
- Idiomas: únicamente chino simplificado. No hay soporte multilingüe declarado.
- No se declara soporte de tool calling, function calling, uso agéntico, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito en la información disponible.

## Casos de uso

- Revisión de manuscritos literarios y de no ficción en chino: el modelo está diseñado para corregir errores objetivos en textos largos de prosa formal china; la aplicación segmenta el documento en frases y lo reensambla después, ya que el modelo opera a nivel de frase.
- Corrección en herramientas de escritura de escritorio: integrado en la aplicación AIWriter, el modelo se descubre automáticamente desde el motor local 42model y se invoca con un botón de "Proofread" en el editor, sin configurar endpoints ni claves.
- Flujos editoriales con requisito de confidencialidad: al ejecutarse en local y sin conexión, es adecuado para editoriales, autores o departamentos legales que no pueden enviar manuscritos inéditos a servicios en la nube.
- Preedición antes de la corrección humana: dado su bajo índice de falsa edición, sirve como primera pasada automática que reduce erratas y puntuación sin reescribir el estilo del autor, dejando al editor humano las decisiones estilísticas.
- Corrección sobre portátiles sin GPU dedicada: con builds de 2,89 GB (Q5_K_M) y 4,28 GB (Q8_0), el autor indica que funciona en un portátil corriente, lo que habilita su uso por escritores individuales sin infraestructura.
- Normalización de texto en pipelines de publicación: para pasar de borrador a texto revisado en procesos de maquetación, aplicando únicamente cambios objetivos y preservando la redacción original.
- Verificación comparativa de modelos de corrección: el benchmark CheckBench permite evaluar otros modelos con la misma métrica de falsa edición y comparar contra este modelo en el mismo conjunto de desarrollo.

Conviene señalar que estos escenarios se derivan de las capacidades declaradas por el autor; no hay documentación de despliegues reales ni validación independiente, dado que el repositorio registra 0 descargas y 0 likes.

## Benchmarks y rendimiento

Resultados publicados por el autor en AIWriter CheckBench · V1 Preview, un benchmark de corrección de texto en chino construido internamente. La columna «Target» mide si las ediciones son correctas; «False-edit» mide si las frases sin ningún error se han dejado intactas (menor es mejor).

| Modelo | Target | False-edit |
|---|---:|---:|
| kimi-k3 | 63,17 | no disponible |
| DeepSeek-V4.1-Flash | 59,34 | 45,3% |
| GLM-5.2 | 56,99 | 50,4% |
| qwen3.8-flash | 55,83 | 43,4% |
| Este modelo (4B) | 50,53 | 19,92% |

Según el autor, las cifras proceden del conjunto de desarrollo público; las líneas base se midieron en 2026-09 sobre el mismo conjunto, con el mismo evaluador y los mismos ajustes de decodificación. Un conjunto de test reservado se guarda para la evaluación cerrada de la versión estable. El autor remarca que los modelos insignia superan a este modelo en 5-13 puntos en Target, pero su tasa de falsa edición es 2,2-2,5 veces superior.

No se han publicado resultados en benchmarks de terceros (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5-4 GB con la cuantización Q5_K_M (pesos de 2,89 GB) y aproximadamente 5-5,5 GB con Q8_0 (pesos de 4,28 GB) para 4.096 tokens de contexto. Son estimaciones a partir del tamaño de los ficheros; el autor no publica cifras de VRAM.
- Cabe en GPU de consumo: cualquier GPU con 6 GB o más de VRAM debería poder ejecutar el build Q8_0; el build Q5_K_M es aún más holgado. El autor afirma que el modelo funciona en un portátil corriente, lo que implica viabilidad en CPU.
- CPU: al distribuirse en GGUF, es viable la inferencia en CPU, aunque el autor no especifica requisitos de memoria RAM ni velocidad.
- GPU recomendadas: no disponibles. El autor no publica recomendaciones de GPU (A100, H100, RTX 4090, etc.) para este modelo.
- Opciones de despliegue: el autor recomienda el motor local 42model y su integración en la aplicación de escritorio AIWriter. Al ser un fichero GGUF, el formato es compatible con motores basados en llama.cpp, aunque el autor no menciona explícitamente llama.cpp, Ollama, vLLM ni TGI. vLLM no soporta GGUF de forma general, por lo que no se puede asumir compatibilidad.
- Latencia y throughput: no disponibles. No se publican cifras de tokens por segundo ni de latencia.
- Los checksums SHA-256 están listados en la página de ficheros del repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Target (CheckBench) | False-edit | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AIWriter-V1-4B-Check-Preview | 4B | 4.096 | 50,53 | 19,92% | AIWriter Model License 1.0 (comercial sujeta a licencia) | GGUF en HuggingFace y ModelScope |
| Qwen3-4B (modelo base) | 4B | no disponible | no disponible | no disponible | Apache-2.0 | Pesos abiertos en HuggingFace |
| DeepSeek-V4.1-Flash | no disponible | no disponible | 59,34 | 45,3% | no disponible | no disponible |
| GLM-5.2 | no disponible | no disponible | 56,99 | 50,4% | no disponible | no disponible |
| qwen3.8-flash | no disponible | no disponible | 55,83 | 43,4% | no disponible | no disponible |
| kimi-k3 | no disponible | no disponible | 63,17 | no disponible | no disponible | no disponible |

El modelo base Qwen3-4B se incluye como referencia de linaje, pero no es un competidor directo en la tarea de corrección: no se han publicado sus resultados en CheckBench. Los tres modelos insignia con los que se compara están evaluados únicamente con las métricas del autor y no se dispone de sus especificaciones en la información proporcionada.

## Limitaciones y advertencias

- Es un corrector a nivel de frase: los documentos largos deben segmentarse y reensamblarse desde la aplicación. No gestiona contexto de documento completo dentro del modelo.
- Solo corrige errores objetivos. El autor indica explícitamente que no hace reescritura ni pulido estilístico.
- Tasa de falsa edición del 19,92%: aproximadamente una de cada cinco frases sin error puede ser modificada de todos modos. Es una mejora sustancial respecto a las alternativas medidas, pero está lejos de ser despreciable para flujos editoriales críticos.
- Sesgo de dominio: los datos de entrenamiento son predominantemente prosa formal en chino simplificado. El argot de internet, los dialectos y el chino clásico no se han evaluado sistemáticamente.
- Idioma único: solo chino simplificado. No hay soporte declarado para otras lenguas, lo que limita su uso en entornos multilingües.
- Riesgo de alucinación: cualquier modelo generativo puede introducir cambios no justificados. En esta tarea el riesgo se concreta en ediciones espurias de frases correctas y en correcciones incorrectas que alteran el significado original.
- Benchmark propio: CheckBench ha sido construido por el mismo autor del modelo y las cifras provienen del conjunto de desarrollo público, no de un test reservado ni de una evaluación independiente. Los resultados deben tratarse con cautela hasta que exista validación externa.
- Restricciones de licencia: la AIWriter Model License 1.0 es gratuita para investigación académica y uso personal, pero el uso comercial requiere una licencia específica. Conviene revisar el fichero LICENSE antes de integrarlo en un producto.
- Estado de vista previa: V1 es una generación de modelo, no una versión finalizada. El repositorio quedará marcado como superado cuando se publique 42ailab/AIWriter-V1-4B-Check.
- Falta de validación comunitaria: 0 descargas y 0 likes en el momento de los datos, sin informes externos de uso en producción.
- Compatibilidad de despliegue no documentada más allá de 42model: el autor no confirma soporte en llama.cpp, Ollama, TGI u otros motores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/42ailab/AIWriter-V1-4B-Check-Preview
- Modelo en ModelScope: https://modelscope.cn/models/42ailab/AIWriter-V1-4B-Check-Preview
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Licencia del modelo: https://huggingface.co/42ailab/AIWriter-V1-4B-Check-Preview/blob/main/LICENSE
- README en chino simplificado: https://huggingface.co/42ailab/AIWriter-V1-4B-Check-Preview/blob/main/README_zh.md
- Sitio del autor (42ailab): https://42ailab.com
- Motor de inferencia local 42model: https://42model.com
- Aplicación AIWriter: https://aiwriter.cn
- Informe técnico y artículos asociados: anunciados por el autor, no disponibles en el momento de redactar esta ficha.
