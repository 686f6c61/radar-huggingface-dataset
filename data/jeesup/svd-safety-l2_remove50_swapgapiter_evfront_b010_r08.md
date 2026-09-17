# Jeesup/svd-safety-l2_remove50_swapgapiter_evfront_b010_r08

## Resumen

`Jeesup/svd-safety-l2_remove50_swapgapiter_evfront_b010_r08` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido con SVD-LLM hasta el 50,01 % de parámetros densos eliminados y posteriormente editado mediante 8 de 10 rondas de una rutina iterativa de intercambio de parámetros neutro (parameter-neutral swap), con la regla de selección `gap_iter`. Lo publica el usuario Jeesup como artefacto de investigación dentro de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor.

No es un modelo de chat de propósito general: es una celda de una retícula experimental sobre reglas de selección y presupuestos de restauración. El propio autor advierte que varias ramas de la retícula están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat, precisamente para cuantificar el daño y probar la recuperación. Por tanto, debe tratarse como sujeto experimental y no como asistente desplegable.

Arquitectura transformer decoder-only heredada de Llama 2 (7B), con pesos en safetensors y pipeline de text-generation. El repositorio ocupa 13,5 GB y acumula 0 descargas y 0 likes en el momento de la consulta, lo que refleja su naturaleza de artefacto de investigación reciente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), no MoE |
| Parámetros totales | 6.738.415.616 según metadatos de safetensors del repositorio |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens (heredada del modelo base Llama-2-7b-chat; no se explicita en la model card) |
| Tipos de cuantización | No disponible (el repositorio solo publica pesos safetensors; no se publican versiones GGUF, AWQ, GPTQ ni cuantizaciones de 8 o 4 bits) |
| Idiomas soportados | No disponibles (campo vacío en los metadatos de HuggingFace) |
| Licencia | Llama 2 Community License (incluye `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Método de compresión | SVD-LLM, 50,01 % de parámetros eliminados (fracción resultante 0,4999) |
| Regla de selección | gap_iter |
| Presupuesto de restauración | 1,000 % de los parámetros densos |
| Componentes restaurados / sustituidos | 5.572 restaurados, 4.785 sustituidos |
| Rondas aplicadas | 8 de 10 (checkpoint intermedio de una ejecución más larga) |
| Tamaño de bloque por ronda | 0,100 % de los parámetros densos |
| Parámetros intercambiados | 51.776.768 (0,80 % de los parámetros de proyección densos) |
| Valor de intercambio | insert (solo valor de inserción; desalojo ordenado por sigma) |
| Semilla | 42 |
| Tamaño del repositorio | 13,5 GB |
| Biblioteca | transformers |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-2-7b-chat sin modificar en su topología: un transformer decoder-only con normalización RMSNorm, RoPE y atención causal estándar. La intervención no es un reentrenamiento ni un fine-tuning, sino una edición estructural de los pesos en dos fases. Primero se aplica compresión SVD-LLM, que descompone y recorta las matrices de proyección hasta eliminar el 50,01 % de los parámetros densos, dejando una fracción resultante de 0,4999. Después se ejecuta una rutina iterativa de swap neutro en parámetros que reintroduce componentes concretos: 5.572 componentes restaurados y 4.785 sustituidos, con un total de 51.776.768 parámetros intercambiados (0,80 % de los parámetros de proyección densos), repartidos en bloques de 0,100 % por ronda durante 8 de las 10 rondas previstas.

La innovación metodológica reside en el criterio de selección de componentes (`gap_iter`) y en el uso de un valor de inserción con desalojo ordenado por sigma. No hay información sobre el dataset de entrenamiento, el volumen de tokens o el uso de RLHF/DPO, porque este checkpoint no se entrena: hereda el alineamiento de Llama-2-7b-chat y lo modifica por edición de pesos. El objetivo declarado del estudio es medir el compromiso entre seguridad y utilidad bajo compresión, no mejorar ninguna capacidad.

Conviene señalar una discrepancia no explicada en la información disponible: la model card declara una fracción de parámetros de 0,4999, mientras que los metadatos de safetensors del repositorio declaran 6.738.415.616 parámetros, el mismo recuento que Llama-2-7b-chat sin comprimir, y el repositorio ocupa 13,5 GB, coherente con pesos en fp16 a tamaño completo. La documentación no aclara si los tensores se almacenan con estructura de bajo rango ocupando ranuras completas o si la cuenta incluye posiciones no utilizadas.

## Capacidades

- Generación de texto conversacional: hereda la capacidad de diálogo multi-turno de Llama-2-7b-chat, con el deterioro esperable tras eliminar la mitad de los parámetros densos.
- Razonamiento básico y respuesta a instrucciones: el alineamiento original se mantiene parcialmente, pero el autor advierte explícitamente de que el comportamiento de seguridad puede estar degradado según la rama de la retícula.
- Capacidad multilingüe: no declarada en los metadatos; Llama-2-7b-chat está orientado principalmente al inglés y la model card no documenta cobertura de otros idiomas.
- Tool calling / function calling: no documentado ni entrenado explícitamente en el modelo base; no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo no incluye modo de pensamiento ni protocolo de agente.
- Capacidades de visión o audio: no disponibles (modelo estrictamente de texto).
- Utilidad como sujeto de estudio: mide el aumento de la tasa de éxito de ataque (ASR) causado por la compresión y la recuperación lograda por la regla `gap_iter`.
- Compatibilidad de despliegue: etiquetado como `endpoints_compatible` y `text-generation-inference` en HuggingFace, por lo que puede servirse con el stack TGI sin conversión de formato.

## Casos de uso

- Investigación sobre compresión y seguridad: sirve como punto de medida para cuantificar cuánto degrada SVD-LLM el rechazo de peticiones dañinas en Llama-2-7b-chat, usando AdvBench, StrongREJECT y WildGuard como instrumentos. Es adecuado porque su configuración exacta (regla, presupuesto, rondas, semilla) está documentada y es reproducible.
- Comparación de reglas de selección de componentes: al ser una celda de una retícula, permite contrastar `gap_iter` frente a otras reglas con el mismo presupuesto de restauración del 1,000 % de parámetros densos, aislando el efecto del criterio de selección.
- Estudio de interpretabilidad de componentes críticos: los 5.572 componentes restaurados y los 4.785 sustituidos identifican qué partes de las proyecciones sostienen el comportamiento de seguridad, lo que resulta útil para localizar circuitos asociados al rechazo.
- Evaluación de jueces automáticos de seguridad: sus puntuaciones (ASR de 0,1450 en AdvBench con juez HarmBench) permiten calibrar la sensibilidad de clasificadores como HarmBench o WildGuard frente a modelos con alineamiento parcialmente dañado.
- Análisis de sobre-rechazo: con una tasa de sobre-rechazo macro de 0,1511 medida con WildGuard, es útil para estudiar el equilibrio entre seguridad y utilidad conversacional, un eje poco cubierto por checkpoints comprimidos.
- Reproducción de experimentos de edición de pesos: el checkpoint corresponde a la ronda 8 de 10 de una ejecución más larga, lo que permite estudiar la evolución del comportamiento a lo largo de las rondas iterativas en lugar de solo en el estado final.
- Formación y docencia en seguridad de modelos: sirve como ejemplo tangible de que la compresión de pesos no es neutra respecto al alineamiento, con cifras verificables en lugar de afirmaciones cualitativas.

En ninguno de estos casos debe usarse como asistente de producción: el propio autor lo desaconseja y las tasas de éxito de ataque publicadas son altas para un modelo presentado como alineado.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,1450 |
| StrongREJECT | ASR (juez HarmBench) | 0,1600 |
| WildGuard | Sobre-rechazo macro | 0,1511 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de capacidades generales, ni la comparación numérica con la línea base sin comprimir. La model card afirma que la compresión por sí sola eleva la tasa de éxito de ataque y que la retícula incluye ramas deliberadamente degradadas, pero no incluye las cifras del checkpoint de Llama-2-7b-chat sin comprimir, por lo que no es posible calcular la magnitud de la degradación o de la recuperación con los datos aportados.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 13,5 GB solo para pesos (6,74 mil millones de parámetros), más memoria para caché KV y activaciones. En la práctica, entre 16 y 20 GB para secuencias cortas.
- VRAM estimada con cuantización de 8 bits: del orden de 7 a 8 GB; con cuantización de 4 bits, del orden de 4 a 5 GB. Estas estimaciones son derivadas del recuento de parámetros, ya que el repositorio no publica cuantizaciones.
- GPU recomendadas: una RTX 4090 (24 GB) ejecuta el modelo en fp16 sin particionado; una A100 de 40 o 80 GB o una H100 son adecuadas para servicio concurrente y lotes grandes.
- GPU de consumo: cabe en tarjetas de 24 GB en fp16 y en tarjetas de 8 a 12 GB solo mediante cuantización en tiempo de carga con bitsandbytes u similar, ya que no hay GGUF publicado.
- Opciones de despliegue: transformers de forma nativa (biblioteca declarada), text-generation-inference (etiqueta `endpoints_compatible` y `text-generation-inference`) y vLLM para servicio con paginación de caché KV. llama.cpp u Ollama requerirían una conversión a GGUF que el autor no ha publicado.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por petición. El contexto máximo de 4.096 tokens limita además el rendimiento en escenarios de contexto largo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`Jeesup/svd-safety-l2_remove50_swapgapiter_evfront_b010_r08`) | 6.738.415.616 declarados en safetensors; fracción 0,4999 según la model card | 4.096 tokens (heredado) | Llama 2 Community License | AdvBench ASR 0,1450; StrongREJECT ASR 0,1600; sobre-rechazo 0,1511 | Repositorio de 13,5 GB, 0 descargas, formato safetensors |
| `meta-llama/Llama-2-7b-chat-hf` (modelo base) | 6.738.415.616 | 4.096 tokens | Llama 2 Community License | No disponible en la información proporcionada; la model card indica que su ASR es inferior al de las ramas comprimidas, sin cifra | Ampliamente distribuido |
| Otras celdas de la retícula del mismo autor (`Jeesup/svd-safety-*`) | No disponible | No disponible | Llama 2 Community License | No disponible | Mencionadas de forma genérica en la model card; identificadores no detallados en la información disponible |

No se dispone de datos de benchmarks de los modelos comparables dentro de la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. Un contraste con una alternativa de tamaño equivalente ya alineada y sin ediciones estructurales (por ejemplo, un modelo denso de 3 a 4 mil millones de parámetros de la familia Llama 3) sería metodológicamente más informativo, pero requeriría reejecutar los mismos tres benchmarks sobre ambos.

## Limitaciones y advertencias

- Artefacto de investigación, no asistente: la model card indica explícitamente que no es un modelo de chat de propósito general y que debe evaluarse antes de extraer conclusiones.
- Seguridad degradada de forma deliberada en varias ramas: se han medido tasas de éxito de ataque de 0,1450 en AdvBench y 0,1600 en StrongREJECT, valores altos para un modelo derivado de un checkpoint alineado.
- El propio estudio parte de la premisa de que la compresión SVD eleva el ASR; este checkpoint es el sujeto de medida, no la solución.
- Sobre-rechazo: una tasa macro de 0,1511 en WildGuard implica que el modelo rechaza peticiones legítimas con frecuencia, un problema de utilidad además de seguridad.
- Riesgo de alucinación incrementado: la eliminación del 50,01 % de los parámetros densos compromete la fidelidad factual, y no hay evaluaciones de veracidad publicadas.
- Idiomas no declarados: los metadatos no especifican cobertura lingüística; el modelo base está orientado al inglés y no hay garantía de calidad en castellano.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de documento largo o agentes con historial extenso.
- Sin cuantizaciones publicadas: la ausencia de GGUF, AWQ o GPTQ obliga a convertir los pesos por cuenta propia, con el riesgo de introducir artefactos adicionales.
- Discrepancia sin aclarar entre la fracción de parámetros declarada (0,4999) y el recuento de safetensors (6.738.415.616), coherente con un almacenamiento a tamaño completo. Conviene inspeccionar los tensores antes de asumir un ahorro real de memoria.
- Licencia Llama 2 Community License: el uso comercial está sujeto a `LICENSE.txt` y `USE_POLICY.md`, con obligaciones de atribución y mención de "Built with Llama 2", restricciones de la política de uso aceptable y el umbral de 700 millones de usuarios mensuales.
- Checkpoint intermedio: corresponde a la ronda 8 de 10, por lo que no representa el estado final de la ejecución descrita.
- Sin tracción ni validación externa: 0 descargas y 0 likes, sin informes independientes que confirmen las métricas publicadas.

## Enlaces

- Página de HuggingFace del modelo: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapgapiter_evfront_b010_r08
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- La búsqueda web realizada no ha devuelto ningún enlace relevante sobre este modelo, SVD-LLM o compresión de modelos de lenguaje: los resultados obtenidos trataban sobre autismo y psiquiatría y no guardan relación con la consulta. Por tanto, no hay papers, blogs, repositorios ni demos adicionales que enlazar más allá de la ficha de HuggingFace y el modelo base indicados.
