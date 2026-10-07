# Jakevin/kev-d3-paper

## Resumen

Jakevin/kev-d3-paper es un repositorio de HuggingFace que aloja un informe técnico en borrador (v9.1, fechado el 7 de octubre de 2026, no revisado por pares) sobre cuantización sub-3 bits de modelos de decisión híbridos de la familia Qwen3.5. No es un modelo con pesos: el repositorio contiene PDFs de sucesivas versiones del documento y su tamaño es de 0,0 GB. El autor es Jakevin y la licencia es CC-BY-4.0.

El trabajo mide la sensibilidad por módulo de dos modelos híbridos de decisión Qwen3.5 (atención lineal Gated DeltaNet intercalada 3:1 con atención completa) mediante la divergencia KL de la distribución de opciones bajo cuantización GPTQ binaria, ternaria, de 3 bits y de 4 bits. A partir de esas medidas propone una asignación de bits (denominada HyBitQ en borradores anteriores) resuelta como un problema de mochila de elección múltiple valorado en el formato de almacenamiento del runtime objetivo.

El resultado práctico se materializa en el release relacionado Jakevin/kev-4b-ternary-mlx: su revisión v2.0 usa esta asignación medida (sin adaptador) y su v1.0 la receta manual previa (con adaptador de rango 16). El informe compara ambas recetas y sirve como metodología reproducible para decidir cuántos bits asignar a cada módulo de un modelo híbrido sin degradar la retención de la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos analizados: Qwen3.5 híbridos de decisión con Gated DeltaNet (atención lineal) intercalado 3:1 con atención completa. El repositorio en sí es un informe técnico (PDF), no pesos. |
| Parametros totales | no disponible en el informe; el release relacionado se llama kev-4b, lo que sugiere en torno a 4.000 millones de parámetros (no confirmado en el texto) |
| Parametros activos | no aplica (no se describe un modelo MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ binaria, ternaria, 3 bits y 4 bits; asignación mixta por módulo por debajo de 3 bits (medida) |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible para este repositorio (solo PDFs); el release relacionado kev-4b-ternary-mlx se distribuye en formato MLX |

## Arquitectura y entrenamiento

Los modelos objeto de estudio son dos modelos de decisión híbridos de Qwen3.5 cuyo bloque de atención combina Gated DeltaNet (atención lineal) con atención completa en una proporción de intercalado 3:1. Esta estructura híbrida hace que la sensibilidad a la precisión no sea uniforme entre módulos, que es precisamente lo que el informe cuantifica: para cada módulo se mide la sensibilidad como la divergencia KL de la distribución de opciones bajo distintos esquemas de cuantización GPTQ (binaria, ternaria, 3 bits y 4 bits).

Sobre esas medidas, el método de asignación (HyBitQ en borradores previos) resuelve una mochila de elección múltiple cuyo coste está expresado en el formato de almacenamiento del runtime objetivo, de modo que la asignación de bits por módulo es directamente desplegable. No se detalla en la informacion disponible la composición del dataset de entrenamiento, el número de tokens, ni si hubo etapas de RLHF o DPO; el foco del documento es la cuantización posterior (post-training), no el entrenamiento del modelo base.

## Capacidades

- Medición de sensibilidad por módulo a precisión sub-3 bits en modelos híbridos de atención lineal más atención completa.
- Generación de mapas de sensibilidad expresados como divergencia KL de la distribución de opciones para cuantización binaria, ternaria, 3 bits y 4 bits GPTQ.
- Asignación automática de bits por módulo (mochila de elección múltiple) valorada en el formato de almacenamiento del runtime.
- Comparación controlada de recetas de cuantización a igual tamaño (v1.0 manual + adaptador de rango 16 frente a v2.0 medida sin adaptador).
- Reproducibilidad metodológica mediante versiones archivadas del borrador (v2, v6, v8, v9.1) para conservar enlaces existentes.
- No es un modelo generativo: no se describen capacidades de generación de texto, código, matemáticas, visión, tool calling ni agentes en la informacion disponible.

## Casos de uso

- Diseño de recetas de cuantización para modelos híbridos: usar los mapas de sensibilidad por módulo para decidir qué capas toleran 1 o 2 bits y cuáles necesitan 3 o 4, evitando degradar la tarea de decisión.
- Despliegue en Apple Silicon: el método se enmarca en MLX y permite producir pesos en torno a 1,68 GB que caben en memoria unificada de equipos de consumo.
- Comparación de recetas a igual tamaño: replicar el contraste v1.0 frente a v2.0 (adaptador de rango 16 frente a asignación medida, ambas ~1,68 GB) para elegir la que maximice la retención en la tarea objetivo.
- Investigación en cuantización sub-3 bits: tomar el planteamiento de mochila valorada en el formato del runtime como base para nuevas asignaciones en otras arquitecturas híbridas.
- Auditoría de degradación por módulo: reproducir las mediciones de divergencia KL para identificar qué partes de un transformer híbrido concentran la pérdida de calidad al bajar de 3 bits.
- Base metodológica para pipelines de compresión: integrar la asignación medida como paso previo a la exportación de pesos en MLX antes de publicar un release cuantizado.
- Referencia de documentación: citar el informe (con la advertencia de que es un borrador no revisado) en trabajos sobre atención lineal y precisión reducida.

## Benchmarks y rendimiento

El informe incluye la comparación entre las dos recetas del release asociado Kev-4B. Las métricas son de retención (porcentaje de la calidad del modelo sin cuantizar), no benchmarks estándar como MMLU o HumanEval.

| Receta | Retencion en decision-v7 | Retencion en held-out | Tamano |
|---|---|---|---|
| v1.0 (receta manual + adaptador de rango 16) | 96,8 % | 86,5 % | 1,679 GB |
| v2.0 (asignacion medida, sin adaptador) | 99,2 % | 94,5 % | 1,678 GB |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para los modelos estudiados.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,68 GB solo de pesos (1,678-1,679 GB segun la receta), a lo que hay que sumar la memoria del runtime MLX y el contexto.
- GPU recomendadas: el marco es MLX, orientado a Apple Silicon (chips de la serie M). No se especifican GPUs NVIDIA en la informacion disponible.
- Cabe en GPU de consumo: por tamano, si; los ~1,7 GB de pesos son compatibles con memoria unificada de equipos Apple Silicon de gama de entrada. No se confirma en el texto compatibilidad con CUDA ni con GPUs dedicadas.
- Opciones de despliegue: MLX (libreria declarada del repositorio). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La informacion disponible no incluye comparaciones con otras familias de modelos, sino la comparación interna entre dos recetas de cuantización del mismo modelo (v1.0 y v2.0). Se reproduce a continuacion.

| Receta | Adaptador | Retencion decision-v7 | Retencion held-out | Tamano |
|---|---|---|---|---|
| v1.0 manual | Rango 16 | 96,8 % | 86,5 % | 1,679 GB |
| v2.0 medida | No | 99,2 % | 94,5 % | 1,678 GB |

Comparativa con modelos de terceros: no disponible.

## Limitaciones y advertencias

- El documento es un borrador de trabajo (v9.1) no revisado por pares; el propio autor advierte que las cifras pueden cambiar a medida que terminen las ejecuciones pendientes.
- El repositorio no contiene pesos utilizables: solo PDFs del informe y versiones anteriores supersedidas (v8, v6, v2).
- Las metricas de rendimiento son de retencion (decision-v7 y held-out), no benchmarks academicos estandar, por lo que no son directamente comparables con tablas de MMLU, HumanEval o GSM8K.
- No se declaran idiomas soportados, sesgos conocidos, riesgos de alucinacion ni longitud de contexto; al no ser un modelo generativo desplegable, estas advertencias aplican al modelo relacionado, no a este repositorio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Licencia CC-BY-4.0: permite uso comercial y obras derivadas con atribucion; conviene revisar si el modelo base Qwen3.5 impone condiciones adicionales para el release relacionado.
- Cualquier decision de produccion basada en estas cifras deberia tratarse como preliminar hasta la publicacion de una version revisada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jakevin/kev-d3-paper
- Informe actual (borrador v9.1): ./kev-d3-paper-draft-v9.1.pdf
- Borrador supersedido v8: ./kev-d3-paper-draft-v8.pdf
- Borrador supersedido v6: ./kev-d3-paper-draft-v6.pdf
- Borrador supersedido v2: ./kev-d3-paper-draft-v2.pdf
- Release relacionado (modelo cuantizado en MLX): https://huggingface.co/Jakevin/kev-4b-ternary-mlx
