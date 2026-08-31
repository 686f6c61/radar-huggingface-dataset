# arianraje/mimo-7b-gdn-opd-mathmix-h16k-probes

## Resumen

Este repositorio contiene una colección de snapshots de probe del modelo `mimo-mathmix-h16k-runpod-1p2b-v1-20260829`, desarrollado por el usuario arianraje. Se trata de checkpoints intermedios de un experimento de entrenamiento de razonamiento matemático, con una mezcla de técnicas DeepScaleR y DAPO, y un horizonte de contexto de 16384 tokens. Cada subcarpeta corresponde a un punto de control (probe) con su metadata y las salidas crudas de evaluación en el benchmark AIME24.

La relevancia de este repositorio radica en que permite realizar evaluaciones retrospectivas de la evolución del modelo durante el entrenamiento, algo útil para investigar la dinámica de aprendizaje y la aparición de capacidades de razonamiento. No se trata de un modelo final listo para producción, sino de un artefacto de investigación. El nombre del repositorio sugiere una relación con la familia MiMo, pero no hay confirmación oficial en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el nombre sugiere 7B, pero la model card menciona un rung de 1B a 1.2B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (se menciona horizon 16384, pero no se confirma como contexto) |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card indica que estos snapshots provienen de un entrenamiento con una mezcla de DeepScaleR y DAPO, con un horizonte de 16384. DeepScaleR es un framework de entrenamiento para razonamiento distribuido, y DAPO (Decoupled Alignment Policy Optimization) es un algoritmo de optimización de políticas. No se proporcionan detalles sobre la arquitectura subyacente (transformer, MoE, etc.) ni sobre la composición del dataset de entrenamiento. El repositorio contiene únicamente checkpoints de inferencia completos, cada uno con su `snapshot_meta.json` y las salidas de evaluación en AIME24.

## Capacidades

- Razonamiento matemático: el modelo fue evaluado en AIME24, un benchmark de problemas de matemáticas de nivel olímpico, lo que indica que está orientado a tareas de razonamiento numérico y simbólico.
- No se dispone de información sobre otras capacidades como generación de texto general, código, tool calling o soporte multilingüe.

## Casos de uso

- Investigación sobre dinámica de entrenamiento: los snapshots permiten analizar cómo evoluciona el rendimiento en AIME24 a lo largo de las distintas marcas de probe, identificando puntos de inflexión o saturación.
- Evaluación retrospectiva de checkpoints: se pueden cargar subcarpetas específicas con `subfolder="probe-<mark>M"` para reproducir resultados o ejecutar evaluaciones adicionales como MATH-500.
- Comparación de estrategias de entrenamiento: al ser parte de un experimento con DeepScaleR y DAPO, sirve para estudiar el efecto de estas técnicas en el razonamiento matemático.
- Depuración de pipelines de evaluación: los archivos de salida de AIME24 pueden usarse para verificar la correcta implementación de métricas o para calibrar evaluadores automáticos.
- Estudio de la relación entre tamaño de parámetros y rendimiento: el rung de 1B a 1.2B sugiere un experimento de escalado, útil para investigar la eficiencia de parámetros.
- Reproducibilidad en investigación: al ser snapshots inmutables, permiten reproducir experimentos previos sin riesgo de cambios en los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que se guardaron salidas de AIME24, pero no se incluyen métricas numéricas en el repositorio.

## Requisitos de hardware

- No se dispone de información sobre VRAM necesaria, ya que el tamaño del repositorio (49.9 GB) incluye múltiples checkpoints y no se conoce el tamaño de un solo modelo.
- Dado que el nombre sugiere un modelo de 7B (aunque no confirmado), una estimación prudente sería que un checkpoint individual en fp16 podría requerir alrededor de 14 GB de VRAM, pero esto es especulativo.
- No se indican GPUs recomendadas ni opciones de despliegue. Al ser un artefacto de investigación, no se espera un uso en producción.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, y el repositorio no incluye referencias a otros modelos de la misma categoría.

## Limitaciones y advertencias

- Es un snapshot de investigación, no un modelo final optimizado para uso general.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial o incluso su redistribución.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de idioma.
- El modelo está orientado exclusivamente a razonamiento matemático; no se conocen sus capacidades en otras tareas.
- El tamaño del repositorio (49.9 GB) puede dificultar su descarga y almacenamiento, especialmente si solo se necesita un checkpoint concreto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/arianraje/mimo-7b-gdn-opd-mathmix-h16k-probes
- Repositorio relacionado del mismo autor: https://huggingface.co/arianraje/mimo-7b-gdn-hybrid-200M-OPD
- Árbol de archivos del repositorio relacionado: https://huggingface.co/arianraje/mimo-7b-gdn-hybrid-200M-OPD/tree/main
