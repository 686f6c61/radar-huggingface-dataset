# Jeesup/svd-safety-l2_remove50_swapdisc_a050_b010_r09

## Resumen

El modelo `Jeesup/svd-safety-l2_remove50_swapdisc_a050_b010_r09` es un artefacto de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`. Se ha construido comprimiendo el modelo base mediante SVD-LLM hasta eliminar el 50,01% de los parámetros de sus matrices de proyección (fracción de parámetros resultante de 0,4999), y a continuación aplicando una reparación selectiva de componentes denominada "swap" iterativo paramétricamente neutro. El resultado conserva 6.738.415.616 parámetros totales según los ficheros safetensors del repositorio.

La edición se realizó en 9 de las 10 rondas previstas, con un presupuesto de restauración del 1,000% de los parámetros densos. En cada ronda se sustituyó un bloque del 0,100% de los parámetros densos, seleccionado por la regla `disc_iter`, hasta restaurar y expulsar 5806 componentes en total. La semilla empleada fue 42 y el valor de inserción fue `insert` con escala 0,5.

El interés de este checkpoint es estrictamente experimental: forma parte de una rejilla que estudia cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor. No es un asistente de propósito general y su autor advierte explícitamente de que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2) con compresion SVD-LLM aplicada a las proyecciones |
| Parametros totales | 6.738.415.616 (segun safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (tamano de repo de 13,5 GB, coherente con FP16) |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama-2-7b-chat: un transformer decoder-only autorregresivo con atención causal. Sobre esa base no se ha realizado un reentrenamiento, sino una compresión post-hoc con SVD-LLM que reduce las matrices de proyección al 50,01% de los parámetros originales, dejando una fracción de parámetros de proyección de 0,4999. No se documenta en la información disponible ningún proceso de RLHF, DPO o ajuste adicional posterior a la compresión.

La innovación técnica del artefacto reside en la fase de reparación posterior a la compresión: un procedimiento de "swap" iterativo paramétricamente neutro que intercambia componentes (5806 restaurados y 5806 expulsados) para recuperar capacidad tras la pérdida por SVD. La selección de componentes la decide la regla `disc_iter`, con un presupuesto de 0,100% de parámetros densos por ronda (1,0% en la ejecución completa) y un valor de inserción de `insert` con evicción ordenada por sigma y escala de inserción de 0,5. Se introdujeron 58.255.616 parámetros (0,90% de los parámetros de proyección densos). El checkpoint publicado es una ronda intermedia (9 de 10) de una ejecución más larga.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`), heredada de Llama-2-7b-chat y degradada por la compresión.
- Razonamiento y respuesta a instrucciones en el mismo dominio que el modelo base, con calidad no verificada en la información disponible.
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidad especial de investigación: sirve como sujeto experimental para medir el impacto de la compresión SVD sobre el comportamiento de seguridad.
- Modo "thinking" o modos especiales: no disponible.

## Casos de uso

- Estudio del trade-off seguridad/utilidad bajo compresión: el checkpoint permite cuantificar cómo la eliminación del 50,01% de los parámetros de proyección afecta a la tasa de éxito de ataques (ASR de 0,1750 en AdvBench) frente a modelos sin comprimir.
- Red teaming y evaluación adversarial: sus métricas ASR publicadas lo convierten en un objetivo realista para probar jueces de seguridad (HarmBench) y medir respuestas ante prompts maliciosos.
- Investigación en interpretabilidad de componentes: el registro de 5806 componentes restaurados y 5806 expulsados permite analizar qué partes de la red sostienen el comportamiento de seguridad.
- Comparación de reglas de selección de componentes: al ser una celda de una rejilla sobre reglas y presupuestos, sirve para contrastar la regla `disc_iter` frente a alternativas bajo condiciones controladas.
- Reproducción de experimentos de compresión: con semilla 42 y presupuestos documentados, permite replicar el pipeline SVD-LLM y el swap iterativo en entornos académicos.
- Docencia e investigación sobre compresión de modelos: útil para ilustrar en cursos de posgrado los efectos medibles de la compresión sobre métricas de seguridad y sobre-rechazo.
- Base para experimentos de recuperación de seguridad: punto de partida para probar técnicas que intenten restaurar el comportamiento seguro original de Llama-2-7b-chat tras la compresión.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,1750 |
| StrongREJECT | ASR (juez HarmBench) | 0,2364 |
| WildGuard | Sobre-rechazo macro | 0,1418 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otras pruebas de capacidad general.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 13,5 GB (coincide con el tamaño del repositorio).
- VRAM estimada en INT8: en torno a 7 GB.
- VRAM estimada en INT4: en torno a 3,5-4 GB.
- GPU recomendadas: A100, H100 o H200 para FP16 en producción; RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16 en una sola tarjeta.
- Cabe en GPU de consumo: sí, en tarjetas con 16-24 GB (RTX 4090, RTX 3090, RTX 4080 con cuantizacion). Con cuantización INT4 también en GPUs de 8 GB.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp y Ollama (requiere conversión previa a GGUF, no incluida en el repositorio).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (svd-safety-l2_remove50_swapdisc...) | 6,74 B (proyecciones al 49,99%) | no disponible | Llama 2 Community | HuggingFace, 0 descargas |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B | no disponible en la informacion proporcionada | Llama 2 Community | HuggingFace, ampliamente usado |
| Otras celdas de la rejilla de Jeesup | no disponible | no disponible | Llama 2 Community | HuggingFace |

No se dispone de datos comparativos de rendimiento (benchmarks de capacidad) entre este checkpoint y sus alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un asistente desplegable: el autor lo describe explícitamente como artefacto de investigación y no como modelo de chat de propósito general.
- Seguridad degradada: la compresión por sí sola eleva la tasa de éxito de ataques (ASR de 0,1750 en AdvBench y 0,2364 en StrongREJECT), por lo que su comportamiento de seguridad no es equiparable al de Llama-2-7b-chat.
- Sobre-rechazo: la métrica macro de sobre-rechazo (WildGuard) es 0,1418, lo que indica rechazos indebidos en peticiones legítimas.
- Riesgo de alucinación: no cuantificado en la información disponible, pero esperable y potencialmente agravado por la pérdida de parámetros.
- Limitaciones de idioma y contexto: no disponibles; no se documenta qué idiomas soporta ni su ventana de contexto efectiva.
- Licencia: Llama 2 Community License; el uso comercial está sujeto a las condiciones de `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio. Está construido con Llama 2.
- Reproducibilidad: se trata de una ronda intermedia (9 de 10) de una ejecución más larga, semilla 42, lo que condiciona la comparación con otras celdas de la rejilla.
- Advertencia del autor: hay que tratar cualquier celda como sujeto experimental y evaluarla de forma independiente antes de extraer conclusiones.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapdisc_a050_b010_r09
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- No se han encontrado en la busqueda web papers, blogs o repos adicionales asociados a este modelo.
