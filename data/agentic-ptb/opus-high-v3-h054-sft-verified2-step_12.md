# agentic-ptb/opus-high-v3.h054.sft-verified2.step_12

## Resumen

Este modelo es un checkpoint intermedio derivado de un experimento de fine-tuning supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-9B-Base, publicado por el usuario agentic-ptb como parte de su serie de runs "opus-high-v3". Se trata de un artefacto de reproducibilidad: la propia model card advierte explícitamente de que el run no encontró ninguna mejora en los pesos entrenados y que no debe inferirse calidad a partir de su publicación. Por tanto, es un resultado negativo documentado para estudio cualitativo, no un modelo listo para uso.

El checkpoint tiene 9.409.813.744 parámetros, formato safetensors, licencia Apache-2.0 y fue creado el 30 de agosto de 2026. No se proporcionan datos de arquitectura detallada más allá de su base Qwen3.5-9B, ni información sobre idiomas, contexto o cuantizaciones. Su interés reside únicamente en el ámbito de la investigación sobre reproducibilidad de entrenamientos y análisis de fallos en pipelines de SFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.5-9B-Base (detalles no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se publican detalles arquitectónicos propios del checkpoint. Al ser un fine-tuning del modelo Qwen/Qwen3.5-9B-Base, se asume que hereda la arquitectura base (probablemente un transformer denso, pero no está confirmado en la documentación disponible). El proceso de entrenamiento corresponde a un run de la serie "opus-high-v3" del proyecto AgentPTB, que utiliza un entorno de ejecución tipo Claude Code para gestionar experimentos de SFT. El checkpoint concreto es el paso 12 de un sub-run denominado `sft-verified2`, y se clasifica como "intermedio" en el campo `role`.

El hallazgo principal del run es negativo: tras cinco ejecuciones de SFT, los pesos del modelo base se mantuvieron sin cambios significativos y no se observó ninguna mejora entrenada. Esto implica que el entrenamiento probablemente no convergió o que los datos de fine-tuning no aportaron señales útiles. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El dataset asociado está disponible en `agentic-ptb/opus-high-v3-data`.

## Capacidades

- No se han documentado capacidades específicas para este checkpoint.
- Al ser un derivado de Qwen3.5-9B-Base, en principio podría heredar las capacidades del modelo base (generación de texto, razonamiento, código, matemáticas, multilingüismo, etc.), pero no hay ninguna verificación publicada al respecto.
- La model card advierte que no se debe inferir calidad a partir de la publicación; por tanto, cualquier uso funcional debe considerarse no validado.
- No se dispone de información sobre tool calling, agentes, visión u otras capacidades especiales.

## Casos de uso

- Reproducibilidad de experimentos: el checkpoint sirve para auditar el pipeline de SFT del proyecto AgentPTB y verificar por qué el entrenamiento no produjo mejoras.
- Estudio de fallos en fine-tuning: investigadores pueden analizar los pesos intermedios para entender dinámicas de regresión o estancamiento en entrenamientos supervisados.
- Comparación de checkpoints intermedios: útil para trazar la evolución de los tensores a lo largo del run y compararlos con el modelo base.
- No se recomienda su uso en producción ni en aplicaciones reales, dado que no hay evidencia de funcionamiento adecuado y el propio autor lo marca como resultado negativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta ninguna métrica de calidad (MMLU, HumanEval, GSM8K, etc.) y la model card indica explícitamente que no se debe inferir calidad de la publicación.

## Requisitos de hardware

- Dado que el modelo tiene ~9.4B parámetros y solo está disponible en safetensors (presumiblemente en precisión fp16 o similar), la VRAM necesaria para cargarlo en memoria sería de aproximadamente 19-20 GB en fp16.
- No se proporcionan cuantizaciones GGUF ni otros formatos, por lo que para ejecutarlo en GPUs de consumo (por ejemplo, RTX 4090 con 24 GB) sería posible en fp16, pero con margen limitado.
- Para inferencia en servidores, se requeriría al menos una GPU con 24 GB de VRAM (A10G, L4, RTX 4090) o más para mayor comodidad.
- No se indican opciones de despliegue específicas. En principio, al ser un modelo transformer estándar, podría servirse con vLLM, TGI o llama.cpp si se convirtiera a GGUF, pero no hay soporte oficial documentado.
- No hay datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con modelos de la misma categoría. El checkpoint es un artefacto intermedio sin rendimiento medido, por lo que compararlo con alternativas como Qwen3.5-9B-Base (modelo base) o Llama 3.1 8B carecería de base empírica. La única comparación estructural posible es con el propio modelo base, del que se diferencia únicamente por los pesos del fine-tuning (que no mostraron mejora). Se recomienda no utilizar este checkpoint como referencia de calidad.

## Limitaciones y advertencias

- Resultado negativo: el run no encontró ninguna mejora en los pesos entrenados; el modelo no debe usarse como indicador de calidad.
- Sin validación funcional: no hay benchmarks, evaluaciones ni pruebas de capacidades publicadas.
- Información incompleta: faltan datos de arquitectura, contexto, idiomas y cuantizaciones.
- Riesgo de alucinación y sesgos: al no estar evaluado, no se conocen sus limitaciones específicas; se espera que herede las del modelo base, pero no está verificado.
- Licencia Apache-2.0 permite uso comercial, pero el estado no funcional del modelo hace desaconsejable su uso en entornos productivos.
- El checkpoint es intermedio y está retenido solo por reproducibilidad; no representa un punto de control óptimo.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h054.sft-verified2.step_12
- Dataset asociado al run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
