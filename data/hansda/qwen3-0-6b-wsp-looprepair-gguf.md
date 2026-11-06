# Hansda/Qwen3-0.6B-WSP-LoopRepair-GGUF

## Resumen

Qwen3-0.6B-WSP-LoopRepair-GGUF es un repositorio de investigación publicado por el usuario Hansda en Hugging Face, no un modelo con pesos editados ni artefactos GGUF liberados. El autor documenta un estudio de "weight-space programming" (edición dirigida de pesos) inspirado en el trabajo de Rikiya Takehi, Jayden Teoh, Alex Zhang y Omar Khattab, aplicado sobre el modelo base Qwen/Qwen3-0.6B en su revisión `c1899de289a04d12100db370d81485cdf75e47ca`. El objetivo declarado era corregir supuestos bucles de repetición mediante ediciones dispersas de pesos.

La conclusión del estudio es negativa: en las condiciones evaluadas con pesos BF16 nativos no se reprodujo ningún defecto intrínseco de bucle a nivel de pesos, por lo que no se justificó ninguna edición y no se liberó ningún GGUF. Los cinco ficheros de cuantización listados (Q2_K, Q3_K_M, Q4_K_M, Q6_K, Q8_0) figuran como "Pending" y no están disponibles. El repositorio conserva la licencia Apache 2.0 del modelo original.

Por tanto, esta ficha describe un contenedor de resultados de investigación, no un modelo desplegable. Cualquier uso práctico debe dirigirse al modelo base Qwen3-0.6B o a sus cuantizaciones publicadas por terceros. La relevancia actual es metodológica: documenta un resultado negativo finito sobre la hipótesis de que ciertos fallos de generación son reparables mediante edición de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en este repositorio (heredada del modelo base Qwen/Qwen3-0.6B) |
| Parametros totales | no disponible en este repositorio (el modelo base se denomina "0.6B"; la búsqueda web cita 0.8B para Qwen3-0.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en este repositorio |
| Tipos de cuantizacion | planificados y no liberados: Q2_K, Q3_K_M, Q4_K_M, Q6_K, Q8_0 (todos en estado "Pending") |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no se ha liberado ningún peso; los GGUF figuran como pendientes. El baseline se evaluó en BF16 nativo |

## Arquitectura y entrenamiento

Este repositorio no introduce arquitectura ni entrenamiento propios: registra una campaña de evaluación sobre los pesos BF16 originales, el tokenizer y la plantilla de chat de Qwen/Qwen3-0.6B, sin modificaciones. La intervención propuesta era una edición dispersa de pesos ("sparse edit") orientada a eliminar bucles de repetición, condicionada a reproducir primero un caso real de bucle. Al no reproducirse, no se seleccionó ni evaluó ninguna edición.

La metodología se basa en comprobaciones de desarrollo redactadas por el autor, no en benchmarks held-out. Se empleó un detector de repetición que busca repetición sustancial de bloques adyacentes de tokens y secuencias duplicadas de ocho tokens en la cola de la generación; el agotamiento del límite de tokens, la degeneración en espacios en blanco, la ausencia de respuesta final, los errores matemáticos y los fallos de instrucciones se registran por separado y no se reetiquetan como repetición. La configuración de muestreo recomendada para modo thinking es temperatura 0.6, top-p 0.95, top-k 20, min-p 0 y presence penalty 0; el modelo base desaconseja explícitamente la decodificación greedy en modo thinking.

## Capacidades

- El repositorio no aporta capacidades propias; las capacidades efectivas son las del modelo base Qwen/Qwen3-0.6B.
- Generación de texto y razonamiento en modo thinking, según la evaluación del autor (bloques de pensamiento seguidos de respuesta final).
- Resolución de problemas matemáticos evaluados a partir de la respuesta final, no del razonamiento intermedio.
- Cumplimiento de requisitos de formato exactos en las pruebas de desarrollo.
- Continuación de prefijos incompletos: tres continuaciones de una trayectoria de 8.192 tokens alcanzaron respuestas finales correctas tras 4.103, 8.186 y 2.562 tokens adicionales.
- Soporte de tool calling, function calling, agentes, visión, audio y multilingüismo: no disponible en la información proporcionada para este repositorio.

## Casos de uso

- Reproducción de investigación sobre edición de pesos: el repositorio sirve como plantilla metodológica para diseñar campañas que primero reproduzcan un fallo y solo después apliquen una intervención, con criterios de aceptación explícitos (frozen-edit, comprobaciones GGUF independientes).
- Auditoría de afirmaciones sobre bucles de repetición: permite contrastar la hipótesis de que un fallo de generación es intrínseco a los pesos frente a artefactos de cuantización o de backend, separando ambos tipos de informe.
- Diseño de suites de evaluación de desarrollo: los ficheros `evaluation/summary.json` y `evaluation/development-cases.json` documentan recuentos legibles por máquina y prompts de prueba con semillas y límites de tokens concretos (2.048, 8.192 y 32.768 tokens nuevos).
- Estudio de decodificación en modelos pequeños: las condiciones de estrés greedy frente a muestreo recomendado permiten analizar el efecto del muestreo en la aparición de repeticiones en un modelo de 0.6B.
- Referencia para pipelines de cuantización: la tabla de artefactos pendientes ilustra el flujo de publicación condicionada a validación previa de la intervención.
- Uso productivo: no aplicable a este repositorio, ya que no contiene pesos desplegables; para producción debe emplearse el modelo base o cuantizaciones publicadas por terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que las cifras siguientes son comprobaciones de desarrollo redactadas por él, no puntuaciones de benchmarks held-out, y que no se evaluó ninguna edición de pesos.

| Condición de desarrollo | Generaciones | Bucles detectados | Límite de tokens alcanzado | Chequeos de respuesta/formato superados | Semillas | Máximo de tokens nuevos |
|---|---:|---:|---:|---:|---|---:|
| Smoke corto inicial | 6 | 0 | 6 | 0/6 | 17 | 2.048 |
| Piloto de probabilidad más largo | 2 | 0 | 0 | 2/2 | 17 | 8.192 |
| Suite inicial / recomendada | 36 | 0 | 1 | 33/36 | 17, 29, 43 | 8.192 |
| Suite inicial / estrés greedy | 12 | 0 | 0 | 12/12 | 17 | 32.768 |
| Continuaciones de prefijo incompleto | 3 | 0 | 0 | 3/3 | 17, 29, 43 | 8.192 |
| Casos finitos extra / estrés greedy | 6 | 0 | 0 | 2/6 | 17 | 32.768 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este repositorio, al no existir artefactos liberados. Como referencia del modelo base de 0.6B, una cuantización de 4 bits ocuparía del orden de 0,4 GB de pesos, pero este dato no procede de la información proporcionada y debe verificarse en las cuantizaciones publicadas por terceros.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no verificada para este repositorio; los GGUF que permitirían ejecución en CPU/GPU de consumo están en estado "Pending".
- Opciones de despliegue: no disponible para este repositorio. Las evaluaciones se realizaron en BF16 nativo, sin especificar backend.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Estado de publicación | Licencia | Notas |
|---|---|---|---|---|---|
| Hansda/Qwen3-0.6B-WSP-LoopRepair-GGUF | no disponible (base 0.6B) | no disponible | Solo resultados de investigación; sin pesos ni GGUF | Apache 2.0 | Resultado negativo: no se estableció reparación |
| Qwen/Qwen3-0.6B | 0.6B (la búsqueda web cita 0.8B) | no disponible | Pesos publicados en Hugging Face | Apache 2.0 (según este repositorio) | Modelo base del estudio; desplegable |
| bartowski/Qwen_Qwen3-0.6B-GGUF | 0.6B | no disponible | Cuantizaciones GGUF publicadas | no disponible | Alternativa práctica para inferencia local del modelo base |

## Limitaciones y advertencias

- El repositorio no contiene pesos editados ni ficheros GGUF; los cinco artefactos listados están en estado "Pending". No es utilizable para inferencia.
- El resultado es negativo y finito: cero bucles detectados en las condiciones probadas no demuestra ausencia universal de bucles en otros prompts o runtimes.
- Las cifras de la tabla de desarrollo no son benchmarks held-out y usan recuentos de semillas distintos entre filas; el propio autor advierte que no son evidencia de que la decodificación greedy sea generalmente superior.
- Persisten fallos matemáticos y de formato, incluidos incumplimientos de requisitos de recuento de palabras y de finalización en formato largo; no se reetiquetan como repetición.
- Las tres continuaciones de prefijo incompleto son continuaciones condicionales de una única trayectoria, no tres ensayos independientes con prompt fresco.
- Los informes de cuantización o backend específicos de plataforma se consideran distintos del runtime nativo evaluado; no se han validado artefactos cuantizados.
- El resultado citado de Qwen3.5-0.8B en el trabajo original corresponde a un modelo distinto y no es un resultado de este repositorio.
- Sesgos conocidos y riesgo de alucinación del modelo base: no disponible en la información proporcionada.
- Restricciones de licencia: se preserva Apache 2.0 del modelo original; el crédito del modelo corresponde a Qwen y el de la investigación de weight-space programming a los autores citados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Hansda/Qwen3-0.6B-WSP-LoopRepair-GGUF
- Modelo base Qwen/Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Revisión concreta del modelo base usada en el estudio: https://huggingface.co/Qwen/Qwen3-0.6B/tree/c1899de289a04d12100db370d81485cdf75e47ca
- Cuantizaciones GGUF del modelo base por bartowski: https://huggingface.co/bartowski/Qwen_Qwen3-0.6B-GGUF
- Artículo sobre weight-space programming citado por el autor: https://rikiyat.github.io/blog/weight-space-programming/
- Recuentos legibles por máquina: `evaluation/summary.json` (dentro del repositorio)
- Prompts de desarrollo probados: `evaluation/development-cases.json` (dentro del repositorio)
