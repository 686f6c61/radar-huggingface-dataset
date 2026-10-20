# Dhruv1000/qwen35-logra-ifbench

## Resumen

Este repositorio no es una ficha de modelo al uso, sino un archivo de investigación publicado en HuggingFace bajo el identificador `Dhruv1000/qwen35-logra-ifbench`. Contiene el código, las evidencias y el borrador de manuscrito de un proyecto que estudia dos cosas: si un puerto de una sola GPU del optimizador LoGRA (Zhang et al., arXiv:2610.06647) puede entrenar Qwen3.5-0.8B con RLVR/GRPO sobre restricciones de seguimiento de instrucciones, y hasta qué punto son fiables los verificadores de IFEval, IFBench e IF-RLVR. El autor lo describe explícitamente como repositorio de investigación privado, con un manuscrito no enviado y sin revisión por pares.

El modelo base es Qwen3.5-0.8B, un transformer híbrido de 752.393.024 parámetros únicos con 18 capas Gated-DeltaNet (atención lineal) y 6 capas de atención completa, con embeddings atados. LoGRA sustituye el adaptador de LoRA por un esquema de *sketches* de gradiente de bajo rango: la matriz de pesos base permanece congelada, cada retropropagación se proyecta con una matriz aleatoria `A` de rango `r` para obtener `S = G·Aᵀ`, y un optimizador tipo RowAdam convierte el sketch acumulado en una actualización `ΔW = U·A` que se escribe directamente en los pesos base.

La relevancia del artefacto no está en el rendimiento del modelo, que el propio autor califica de exploratorio e inconcluso, sino en su contribución secundaria convertida en principal: una auditoría determinista, ejecutada en CPU, de los verificadores de tres benchmarks de instruction-following. El hallazgo que motiva el trabajo es que una respuesta fija de una sola palabra satisface aproximadamente un tercio de los prompts de IFBench, lo que cuestiona el uso de esos verificadores como función de recompensa sin un análisis previo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 18 capas Gated-DeltaNet (atención lineal) y 6 capas de atención completa, con embeddings atados (descripción correspondiente al modelo base Qwen3.5-0.8B) |
| Parametros totales | 752.393.024 parámetros únicos en el modelo base; el repositorio ocupa 8,9 GB e incluye código, archivo de evidencias, checkpoints y borrador del manuscrito |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio no documenta pesos cuantizados |
| Idiomas soportados | no disponibles (los metadatos de HuggingFace indican «no disponibles») |
| Licencia | Apache 2.0 para el repositorio; la licencia aplicable al modelo base Qwen3.5-0.8B debe verificarse por separado y no se detalla en la información proporcionada |
| Formato de pesos | no especificado en la información proporcionada; librería `transformers`; el método LoGRA escribe las actualizaciones en los pesos base en lugar de generar un adaptador independiente, aunque las etiquetas de HuggingFace incluyen `base_model:adapter:Qwen/Qwen3.5-0.8B` |

## Arquitectura y entrenamiento

El objeto de estudio es un puerto del optimizador LoGRA para una sola GPU. Para las capas lineales seleccionadas, el peso base `W` permanece congelado; una proyección aleatoria `A` de rango `r` transforma cada paso backward en un sketch `S = G·Aᵀ` del gradiente de pesos `G`, y un optimizador estilo RowAdam convierte el sketch acumulado en una actualización de bajo rango `ΔW = U·A` que se escribe directamente en los pesos base. La implementación corregida está en `src/q35_logra_ifbench/methods/logra_core.py` y, según el autor, es bit a bit igual a la referencia de NVIDIA en 21 pruebas diferenciales. El controlador de pasos basado en KL predicho que forma parte del método completo de NVIDIA **no** se implementó, por lo que el autor describe el resultado como una adaptación y no como una reproducción exacta.

El entrenamiento se realizó con RLVR sobre restricciones verificables: cada prompt lleva restricciones comprobables mediante programa (por ejemplo, «sin comas» o «exactamente 3 viñetas»), el verificador devuelve pasa/no pasa y la recompensa es la proporción de restricciones superadas. Los datos y verificadores proceden de `allenai/IF_multi_constraints_upto5` (IF-RLVR, verificador `IFEvalG` de open-instruct), y la evaluación se hace sobre IFEval, IFBench e IF-RLVR. El cómputo declarado es de 4,57 horas-GPU L4 medidas, repartidas en 32 directorios de ejecución, con experimentos M4 (5 semillas × 16 actualizaciones), M5A (3 semillas × 64 actualizaciones) y diagnósticos M5B. No se documenta el volumen de tokens de entrenamiento ni el uso de RLHF/DPO adicional; el régimen es de ajuste con GRPO sobre un modelo ya instruido, con un presupuesto de cómputo muy reducido.

La segunda línea de trabajo es una auditoría de verificadores ejecutada íntegramente en CPU y de carácter determinista: 112 plantillas analizadas, 56 de ellas con oráculos independientes, y sondas de respuesta fija, de prompt incorrecto y contrafactuales sobre las suites IFEval (25 tipos de restricción), IFBench (58 restricciones fuera de dominio) e IF-RLVR (29).

## Capacidades

- Generación de texto y seguimiento de instrucciones con restricciones verificables, heredados del modelo base Qwen3.5-0.8B; el entrenamiento RLVR del proyecto se dirige precisamente a ese tipo de restricciones.
- No se reporta ninguna mejora medida en la tasa de superación de restricciones: el autor califica los resultados de precisión como exploratorios e inconclusos, sin afirmaciones de exactitud.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada; no se evaluó.
- Capacidades multilingües: no disponibles; los metadatos no declaran idiomas y el proyecto solo evalúa benchmarks en inglés.
- Capacidad especial destacable del artefacto: auditoría reproducible de verificadores de instruction-following, con 56 de 112 plantillas dotadas de oráculos independientes.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Reproducción del puerto LoGRA en una sola GPU: el repositorio incluye `src/q35_logra_ifbench/methods/logra_core.py`, que replica la referencia de NVIDIA en 21 pruebas diferenciales; sirve para validar la implementación del sketch de gradientes antes de escalarla a otros modelos o presupuestos.
- Auditoría previa de verificadores de instrucciones: antes de usar un verificador como función de recompensa, el paquete permite ejecutar sondas de respuesta fija y contrafactuales sobre plantillas propias; el hallazgo de que una respuesta fija de una palabra satisface cerca de un tercio de los prompts de IFBench justifica este paso como control de calidad.
- Entrenamiento RLVR con GRPO sobre un modelo de 0,8B en hardware de consumo: el proyecto mide 4,57 horas-GPU L4 para 32 ejecuciones, lo que sitúa cada ejecución por debajo de la hora en una GPU de 24 GB y hace viable iterar en una estación de trabajo con una sola tarjeta.
- Elección de benchmarks para evaluación interna: la comparación cruzada de 25 restricciones de IFEval, 58 de IFBench y 29 de IF-RLVR ayuda a decidir qué suite usar según la dependencia del contenido que se quiera tolerar.
- Investigación de resultados negativos y metodología: el repositorio documenta explícitamente afirmaciones retiradas en `docs/technical/RESEARCH_HISTORY.md` y cuatro informes de issues preparados pero no enviados en `docs/upstream/`, útiles como plantilla de trazabilidad para proyectos de post-entrenamiento.
- Restricciones de formato estrictas en prototipos: para tareas donde la salida debe cumplir reglas contables (número exacto de viñetas, ausencia de cierto carácter, longitud máxima), el modelo base de 0,8B más un verificador programático permite montar un bucle de muestreo y filtrado sin infraestructura pesada.
- Docencia y formación en post-entrenamiento: el manuscrito en `paper/main.pdf` y el índice de experimentos en `docs/index/EXPERIMENT_INDEX.md` sirven como material de estudio sobre RLVR, verificación de recompensas y desplazamiento de la distribución por verificación estrecha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que los experimentos de RL son exploratorios, que no hay conclusión sobre exactitud y que no se emite ninguna afirmación de velocidad, estabilidad o precisión en la comparación LoGRA frente a LoRA.

El único material cuantitativo verificable es el alcance de la auditoría de verificadores, que no mide el rendimiento del modelo sino la fiabilidad de los evaluadores:

| Elemento auditado | Alcance reportado |
|---|---|
| Suite IFEval | 25 tipos de restricción |
| Suite IFBench | 58 restricciones fuera de dominio |
| Verificadores IF-RLVR | 29, sobre `allenai/IF_multi_constraints_upto5` |
| Plantillas analizadas | 112 |
| Plantillas con oráculo independiente | 56 de 112 |
| Tipos de sonda aplicados | respuesta fija, prompt incorrecto y contrafactuales |
| Hallazgo principal | una respuesta fija de una sola palabra satisface aproximadamente un tercio de los prompts de IFBench |

## Requisitos de hardware

- VRAM estimada para inferencia: los 752.393.024 parámetros del modelo base ocupan aproximadamente 1,5 GB en bf16/fp16; con caché KV y activaciones, una estimación conservadora sitúa la inferencia en 3-4 GB de VRAM para contextos cortos (estimación aritmética, no medida en el repositorio).
- Entrenamiento: el autor reporta 4,57 horas-GPU L4 medidas sobre 32 directorios de ejecución, es decir, menos de una hora de media por ejecución en una NVIDIA L4 de 24 GB.
- GPU recomendadas: L4 o equivalente para el entrenamiento reportado; cualquier GPU con 8 GB o más para inferencia en precisión nativa del modelo base.
- Cabe en GPU de consumo: sí, el tamaño del modelo base (0,8B) permite inferencia en tarjetas de 6-8 GB; el repositorio, de 8,9 GB, incluye checkpoints y material de archivo adicional que no necesita residir en VRAM.
- Opciones de despliegue: no documentadas en el repositorio; las etiquetas de HuggingFace incluyen `transformers` y `endpoints_compatible`. No se verifica en la información proporcionada compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo o artefacto | Parametros | Contexto | Resultado reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (Qwen3.5-0.8B + LoGRA + IFBench) | 752 M (base) | no disponible | RL exploratorio, sin conclusión sobre exactitud; contribución principal es la auditoría de verificadores | Apache 2.0 (repositorio) | HuggingFace, 0 descargas y 0 likes |
| Qwen3.5-0.8B (modelo base) | 752 M | no disponible | no disponible en la información proporcionada | no disponible en la información proporcionada | Referenciado como `base_model` en HuggingFace |
| LoGRA original (NVIDIA, Zhang et al.) | no aplica | no aplica | Método completo, incluido el controlador de pasos por KL predicho | no disponible en la información proporcionada | Artículo arXiv:2610.06647; referencia de implementación |
| LoRA / QLoRA + GRPO (alternativa evaluada) | adaptadores de bajo rango | no aplica | Comparación con LoGRA inconclusa en este proyecto | no aplica | Estándar ampliamente disponible |

## Limitaciones y advertencias

- El manuscrito está sin enviar y sin revisión por pares; el propio repositorio se describe como repositorio de investigación privado. No debe citarse como resultado validado.
- Los resultados de exactitud del entrenamiento RL son inconclusos y el autor no emite ninguna afirmación de velocidad, estabilidad o precisión frente a LoRA.
- El controlador de pasos por KL predicho del método LoGRA original no se implementó, por lo que la implementación es una adaptación y no una reproducción exacta de NVIDIA.
- El presupuesto experimental es muy reducido: 4,57 horas-GPU L4 totales, 3-5 semillas y entre 16 y 64 actualizaciones por ejecución. No hay evidencia de convergencia ni de transferencia a otros tamaños de modelo.
- Riesgo de reward hacking derivado de verificadores estrechos: los verificadores comprueban la restricción, no la tarea, y una respuesta fija de una sola palabra satisface aproximadamente un tercio de los prompts de IFBench. Cualquier uso como recompensa debe auditarse antes.
- Sesgos conocidos del modelo base: no documentados en la información proporcionada. El proyecto no evalúa sesgo, toxicidad ni seguridad.
- Riesgo de alucinación: no evaluado en este repositorio; el alcance se limita al cumplimiento de restricciones de formato.
- Limitaciones de idioma: los benchmarks utilizados son en inglés y los metadatos no declaran idiomas soportados; no hay evidencia de comportamiento en castellano.
- No se completó la evaluación con un juez independiente no-Anthropic: el paquete estaba preparado pero no se dispuso de API autorizada.
- Los cuatro informes de issues para los proyectos upstream están preparados pero no enviados, por lo que los defectos detectados en los verificadores no han sido reportados formalmente a sus mantenedores.
- Los documentos históricos del repositorio contienen afirmaciones retiradas; deben leerse junto con `docs/technical/RESEARCH_HISTORY.md` para evitar citar conclusiones inv
