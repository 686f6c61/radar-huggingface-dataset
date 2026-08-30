# agentic-ptb/opus-high-v3.h094.sft-long.step_20

## Resumen

`opus-high-v3.h094.sft-long.step_20` es un checkpoint intermedio generado por el proyecto AgentPTB, una iniciativa de la organización `agentic-ptb` que utiliza ejecuciones de Claude Code para experimentar con pipelines de entrenamiento y ajuste fino. El modelo parte de la base `Qwen/Qwen3.5-9B-Base` y se enmarca dentro del run `opus-high-v3`, concretamente en la hora de ejecución `h094`. Según la model card, se trata de un checkpoint de rol `intermediate`, retenido con fines de reproducibilidad y estudio cualitativo.

La propia model card incluye una advertencia explícita de interpretación: el run no encontró mejoras en los pesos entrenados, por lo que no debe inferirse calidad del modelo a partir de su publicación. De hecho, el tag `negative-results` indica que los resultados fueron negativos en cuanto a rendimiento de entrenamiento. Esto lo convierte en un artefacto de investigación más que en un modelo listo para producción.

Con aproximadamente 9,4 mil millones de parámetros, el modelo hereda la arquitectura del base model Qwen3.5-9B-Base, aunque no se proporcionan detalles adicionales sobre la configuración exacta de capas, atención o contexto. Es un ejemplo de publicación de resultados negativos en IA, útil para estudiar qué no funciona en pipelines de ajuste fino generados automáticamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen/Qwen3.5-9B-Base (transformer decoder-only, detalles no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo contiene solo safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre `Qwen/Qwen3.5-9B-Base`, un transformer decoder-only de la serie Qwen3.5. No se especifican detalles de la arquitectura interna (número de capas, heads de atención, factor de expansión del MLP) en la información disponible. El entrenamiento corresponde a un pipeline de ajuste fino supervisado (SFT) de contexto largo (`sft-long`) ejecutado dentro del framework AgentPTB, que automatiza runs de Claude Code para generar y evaluar experimentos de entrenamiento.

El run `opus-high-v3` se documenta como un experimento con resultados negativos: no se observó mejora en los pesos entrenados respecto al modelo base. El checkpoint `step_20` corresponde al paso 20 del entrenamiento y se conserva para reproducibilidad y análisis cualitativo. No hay información sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generacion de texto: hereda las capacidades de generacion del modelo base Qwen3.5-9B-Base, aunque no hay evaluaciones publicadas que confirmen su rendimiento especifico.
- Razonamiento y codigo: potencialmente transferibles del base model, pero sin datos verificados.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte para agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no especificadas.
- Modo thinking o capacidades especiales: no documentado.

Dado el caracter de checkpoint intermedio con resultados negativos, no se puede afirmar ninguna capacidad concreta sin evaluacion independiente.

## Casos de uso

- Reproducibilidad de experimentos: investigador puede descargar este checkpoint para reproducir el run `opus-high-v3` y verificar los resultados negativos documentados.
- Estudio de fallos en pipelines SFT: util para analizar por que un ajuste fino no mejora al modelo base, comparando pesos en distintos pasos.
- Analisis de dinamica de entrenamiento: permite estudiar la evolucion de los gradientes y la perdida en los primeros pasos de un SFT de contexto largo.
- Auditoria de procesos automatizados de entrenamiento: sirve como evidencia de que el pipeline AgentPTB genera artefactos reproducibles incluso cuando no hay mejora.
- Comparacion cualitativa de overfitting: puede usarse para detectar si el modelo comienza a memorizar datos de entrenamiento en pasos tempranos.
- Educacion en practicas de IA responsable: ejemplo de publicacion de resultados negativos, fomentando la transparencia en investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion. Ademas, al tratarse de un checkpoint intermedio con resultados negativos, no se recomienda su uso para tareas de inferencia sin una evaluacion previa.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4 mil millones de parametros, una estimacion orientativa en FP16 requiere aproximadamente 18,8 GB de VRAM (calculado como 2 bytes por parametro). Con cuantizacion INT8 se reduciria a unos 9,4 GB, y con INT4 a unos 4,7 GB. Estas cifras son estimaciones genericas basadas en el tamaño de parametros, no datos oficiales del modelo.
- GPU recomendadas: para FP16 completo, una GPU con 24 GB o mas (RTX 3090, RTX 4090, A10G, A100 40GB). Para cuantizacion INT4, cabria en GPUs consumer de 8 GB (RTX 3060, RTX 4060), aunque no se han publicado pesos cuantizados.
- Opciones de despliegue: al ser un modelo safetensors, podria cargarse con transformers de HuggingFace, vLLM o TGI, pero no se han probado en estas plataformas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de evaluaciones comparativas que permitan una comparacion rigurosa con otros modelos de tamaño similar como Qwen3-8B, Llama 3.1 8B o Mistral 7B. Al ser un checkpoint intermedio con resultados negativos, no se recomienda su uso como modelo de proposito general. La unica referencia util es el propio base model `Qwen/Qwen3.5-9B-Base`, que es el punto de partida y sobre el cual este checkpoint no muestra mejora.

## Limitaciones y advertencias

- Resultados negativos: la model card advierte explicitamente que el run no encontro mejora en los pesos entrenados; no debe usarse como modelo de produccion.
- Checkpoint intermedio: es un paso de entrenamiento (step_20) no necesariamente convergido ni optimo.
- Sin evaluacion de sesgos: no hay informacion sobre sesgos conocidos, pero al heredar del base model Qwen, podria arrastrar sesgos de su dataset de preentrenamiento.
- Riesgo de alucinacion: no evaluado; cualquier uso en generacion de texto conlleva riesgo de alucinacion no mitigado.
- Datos de entrenamiento desconocidos: no se especifica la composicion del dataset SFT, lo que impide evaluar sesgos de dominio.
- Licencia: Apache 2.0 permite uso comercial, pero la falta de garantias de rendimiento hace desaconsejable su uso en entornos productivos.
- Sin cuantizaciones publicadas: solo se ofrecen pesos safetensors en FP32/FP16, lo que limita el despliegue en hardware con poca VRAM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h094.sft-long.step_20
- Dataset del run (opus-high-v3-data): https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Indice de datasets AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
