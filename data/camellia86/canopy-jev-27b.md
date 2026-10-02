# Camellia86/Canopy-Jev-27B

## Resumen

Canopy-Jev-27B es un adaptador LoRA de 25,24 MB, acompañado de un prior numérico, que se monta sobre el backbone de texto congelado Qwen3.8-27B. Lo publica Camellia86 (Ruoxi Qiu) bajo licencia Apache-2.0 para los pesos y MIT para el código. Su particularidad es que no genera texto: recibe un estado de aplicación compartido y una lista de preguntas con candidatos finitos, y devuelve directamente probabilidades sobre cada opción sin emitir tokens de respuesta.

La innovación es la separación entre contexto y decisión: un mismo prefijo de estado se comparte entre ramas de pregunta aisladas, lo que abarata y estabiliza tareas de enrutado y clasificación con espacios de respuesta cerrados. El cargador propio (Canopy-Jev) soporta tres modos de decisión: Choice (elección entre categorías), adaptación Noul (binaria) y adaptación Score (ordinal).

Los resultados declarados por el autor son JevBench 87,45 %, JevBench Hard 75,68 % y MMLU-Pro 64,50 %, con una mejora de 2,16 y 3,60 puntos porcentuales sobre Open-Jev-27B-v1.1. Es relevante como patrón de despliegue para decisión numérica calibrada, no como modelo generativo generalista: requiere Linux, CUDA y al menos 64 GiB de VRAM libre.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformador de texto congelado (base Qwen3.8-27B); el detalle interno del backbone no está disponible |
| Parámetros totales | Base de 27 000 millones aprox. según la denominación Qwen3.8-27B; adaptador de 25,24 MB |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; los artefactos se distribuyen sin cuantizar en dos archivos safetensors |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | Apache-2.0 (pesos); MIT (código y documentación originales) |
| Formato de pesos | safetensors (patrón `artifacts/*`, dos archivos safe-tensor verificados por manifiesto) |

## Arquitectura y entrenamiento

El sistema es un adaptador de bajo rango (LoRA) más un prior numérico que se aplica sobre un backbone Qwen3.8-27B congelado, identificado por una revisión fija (`1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) y un tokenizador también fijo. La inferencia no decodifica texto: el modelo devuelve distribuciones de probabilidad sobre un conjunto cerrado de candidatos. El cargador `CanopyJev` expone tres modos: Choice para elección entre criterios nombrados, la adaptación binaria Noul y la adaptación ordinal Score.

El mecanismo central es el estado compartido: un mismo prefijo de estado de aplicación se reutiliza en múltiples ramas de pregunta aisladas entre sí, de modo que cada consulta se evalúa de forma independiente pero con el mismo contexto. El autor declara que el artefacto se valida mediante un manifiesto que comprueba los dos archivos safetensors y la identidad fija del modelo base y del tokenizador (checkpoint fuente `506410609a6ba6eb422182fddda095b81fa4923011ceaa3717e85a74817237f4`).

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre el uso de RLHF, DPO u otras técnicas de alineación. Tampoco se detalla la arquitectura interna del backbone más allá de su naturaleza de modelo de texto.

## Capacidades

- Decisión numérica sobre conjuntos finitos de candidatos: devuelve probabilidades en lugar de texto generado.
- Modo Choice: elección entre categorías definidas explícitamente mediante criterios con nombre y descripción.
- Modo Noul: adaptación binaria para decisiones de sí/no.
- Modo Score: adaptación ordinal para decisiones con orden (por ejemplo, niveles de prioridad o de riesgo).
- Evaluación de varias preguntas sobre un mismo estado compartido, con ramas aisladas entre sí.
- Cero tokens de respuesta generados, lo que elimina el coste de decodificación y el riesgo de salida textual no deseada.
- Procesamiento únicamente de texto; no hay soporte de visión ni de audio documentado.
- Idiomas: inglés y chino.
- Tool calling / function calling: no documentado.
- Comportamiento de agente multi-paso: no documentado como tal; está pensado para actuar como componente de decisión dentro de un pipeline mayor.
- Modo thinking explícito: no documentado.

## Casos de uso

- Enrutado de tickets de soporte: tal como figura en el ejemplo oficial, se pasa un estado con la descripción de la incidencia y una pregunta de tipo Choice con criterios como «billing» o «engineering», y el modelo devuelve la probabilidad de cada equipo. Es adecuado porque el espacio de destinos es cerrado y la salida es directamente consumible por un sistema de asignación.
- Triaje de prioridad en servicios de urgencia: con el modo Score se obtiene una probabilidad sobre niveles ordinales de gravedad, lo que permite establecer umbrales configurables por el equipo clínico en lugar de depender de texto libre.
- Moderación de contenido: clasificación de una pieza de contenido en categorías de política previamente definidas, con probabilidad asociada para aplicar revisión humana por encima de un umbral.
- Decisión de aceptación en pipelines RAG: evaluar si una respuesta candidata cumple criterios factuales o de formato antes de publicarla, sin coste de generación adicional.
- Scoring de riesgo en seguros o crédito: el modo Score devuelve una distribución ordinal que puede mapearse a bandas de riesgo con trazabilidad numérica, útil cuando se exige auditar el criterio de decisión.
- Enrutado en sistemas multiagente: elegir qué agente o herramienta debe atender una petición a partir del estado de la conversación, con probabilidad de cada opción para permitir fallback cuando la confianza es baja.
- Control de calidad en anotación de datos: comparar la decisión del modelo con la etiqueta humana y priorizar para revisión los casos con alta incertidumbre.
- Clasificación de leads o solicitudes comerciales: asignación automática a colas de venta o soporte según criterios configurables, reutilizando el mismo estado entre varias preguntas simultáneas.

## Benchmarks y rendimiento

| Benchmark | Canopy-Jev-27B | Open-Jev-27B-v1.1 | Diferencia |
|---|---|---|---|
| JevBench | 87,45 % | 85,29 % (valor derivado de la diferencia declarada) | +2,16 pp |
| JevBench Hard | 75,68 % | 72,08 % (valor derivado de la diferencia declarada) | +3,60 pp |
| MMLU-Pro | 64,50 % | no disponible | no disponible |

No se han publicado en la información disponible otros resultados de benchmarks (HumanEval, GSM8K, MT-Bench u otros). No se dispone de datos de latencia ni de throughput medidos.

## Requisitos de hardware

- VRAM: el autor exige al menos 64 GiB de memoria GPU libre, coherente con un backbone de 27 000 millones de parámetros en bf16 (aproximadamente 54 GB solo en pesos) más caché KV y activaciones. Cualquier cifra inferior es una estimación no validada por el autor.
- Estimaciones de VRAM según cuantización del backbone (no documentadas oficialmente): en 8 bits en torno a 27 GB de pesos y en 4 bits en torno a 14-15 GB, pero el cargador verifica la identidad fija del checkpoint, por lo que el uso de versiones cuantizadas no está soportado ni probado según la documentación disponible.
- GPU recomendadas: GPU de datacenter con 80 GB (A100 80 GB, H100 80 GB) o configuraciones multi-GPU que sumen al menos 64 GiB libres.
- GPU de consumo: no cabe en tarjetas consumer de 24 GB (RTX 4090, RTX 3090) según el requisito declarado de 64 GiB libres.
- Sistema operativo y runtime: Linux con NVIDIA CUDA; se instala el código fuente y el entorno CUDA probado desde el repositorio de GitHub.
- Opciones de despliegue: cargador propio `CanopyJev` (no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo generativo estándar).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | JevBench | JevBench Hard | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Canopy-Jev-27B | Qwen3.8-27B (adaptador) | 87,45 % | 75,68 % | 64,50 % | Apache-2.0 (pesos), MIT (código) | Adaptador de 25,24 MB en HuggingFace + GitHub |
| Open-Jev-27B-v1.1 | no disponible | 85,29 % (derivado) | 72,08 % (derivado) | no disponible | no disponible | no disponible |
| Otros modelos de decisión de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación publicada por el autor es contra Open-Jev-27B-v1.1, del que no se aportan más datos en la información disponible (ni licencia, ni repositorio, ni arquitectura). No se dispone de comparativas con clasificadores dedicados, modelos de enrutado o LLM generativos usados como clasificadores zero-shot.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni respuestas legibles. Solo devuelve probabilidades sobre candidatos predefinidos, por lo que no sirve para chat, resumen, redacción ni código.
- Adopción nula y validación externa inexistente: cero descargas y cero likes en HuggingFace en el momento de la consulta, y todos los benchmarks proceden del propio autor.
- Discrepancia de tamaño de repositorio: la ficha de HuggingFace indica 0,0 GB de tamaño de repo, mientras que la model card declara un adaptador de 25,24 MB. Conviene verificar los archivos antes de planificar el despliegue.
- Dependencia estricta del backbone: el loader fija la revisión del modelo base y la identidad del tokenizador, de modo que cambiar de revisión o usar pesos modificados puede invalidar la carga.
- Coste de hardware elevado: 64 GiB de VRAM libres como mínimo y entorno Linux con CUDA, lo que excluye el despliegue en GPU de consumo.
- Cobertura lingüística limitada a inglés y chino; no hay evidencia de comportamiento en castellano.
- Riesgo de mala calibración: al devolver probabilidades, un uso directo con umbrales fijos sin validación sobre datos propios puede producir decisiones sistemáticamente sesgadas. Se recomienda calibrar y auditar por segmentos.
- Sesgos: no se documenta ningún análisis de sesgo, de composición del dataset de entrenamiento ni de evaluación por subgrupos.
- Datos de entrenamiento no disponibles: se desconoce el volumen de tokens, la composición del corpus y si hubo etapas de alineación.
- Licencia: los pesos son Apache-2.0 y el código original es MIT, ambas compatibles con uso comercial, pero existen términos adicionales para los artefactos (`WEIGHTS_LICENSE.md`) y avisos de terceros (`THIRD_PARTY_NOTICES.md`) que deben revisarse y respetarse, incluida la atribución en el archivo NOTICE.
- Los benchmarks se publican sin intervalos de confianza ni detalle del protocolo en esta información; el propio autor remite a `docs/EVALUATION.md` para los protocolos completos.
- Fechas del repositorio: creación y última actualización el 2 de octubre de 2026, con una única versión declarada (0.1.0).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Camellia86/Canopy-Jev-27B
- Repositorio de código y guía bilingüe: https://github.com/Camellia86/Canopy-Jev
- Model card completa en GitHub: https://github.com/Camellia86/Canopy-Jev/blob/b71f97b3bffd28c90306bfea607d2089d75e7d43/MODEL_CARD.md
- Documentación de evaluación y protocolos: https://github.com/Camellia86/Canopy-Jev/blob/b71f97b3bffd28c90306bfea607d2089d75e7d43/docs/EVALUATION.md
- Instrucciones de instalación: https://github.com/Camellia86/Canopy-Jev#install
- Licencia de pesos (Apache-2.0): LICENSE en el repositorio
- Términos de los artefactos: WEIGHTS_LICENSE.md en el repositorio
- Licencia de código original (MIT): CODE_LICENSE.txt en el repositorio
- Atribución de terceros: THIRD_PARTY_NOTICES.md en el repositorio
- Aviso de atribución: NOTICE en el repositorio
- Metadatos de citación: CITATION.cff en el repositorio
- Modelo base: Qwen/Qwen3.8-27B (revisión usada: 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0)
