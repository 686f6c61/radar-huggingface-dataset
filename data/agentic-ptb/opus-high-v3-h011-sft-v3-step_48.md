# agentic-ptb/opus-high-v3.h011.sft-v3.step_48

## Resumen

`opus-high-v3.h011.sft-v3.step_48` es un checkpoint intermedio derivado del modelo base Qwen/Qwen3.5-9B-Base, publicado por el usuario agentic-ptb como parte de un experimento de fine-tuning supervisado (SFT) dentro del proyecto AgentPTB. El nombre hace referencia a un run de Claude Code etiquetado como "opus-high-v3", en su hora 11 (h011) y paso 48 del entrenamiento. El autor lo clasifica explícitamente como un artefacto de reproducibilidad y estudio cualitativo, no como un modelo listo para producción.

La característica más relevante es que el propio autor advierte que el run no produjo ninguna mejora en los pesos entrenados: se trata de un resultado negativo. El checkpoint se conserva únicamente para permitir la reproducción del experimento y el análisis de por qué el entrenamiento no convergió. Con 9.409.813.744 parámetros (9,4B) y un tamaño de repositorio de 18,8 GB en formato safetensors, hereda la arquitectura del modelo base Qwen3.5-9B-Base, aunque no se proporcionan detalles adicionales sobre contexto, idiomas o configuración de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, sin especificar) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del checkpoint base Qwen/Qwen3.5-9B-Base. No se dispone de información pública sobre la arquitectura interna del modelo base más allá de que pertenece a la familia Qwen3.5, que emplea una arquitectura transformer estándar con atención de múltiples cabezas. El proceso de entrenamiento se enmarca en el proyecto AgentPTB, que utiliza agentes basados en Claude Code para ejecutar experimentos de fine-tuning de forma automatizada. El run "opus-high-v3" corresponde a una celda experimental con configuración "opus@high", y el checkpoint h011.step_48 es un punto intermedio del proceso.

El autor indica que el run no encontró ninguna mejora en los pesos entrenados: los cinco runs de SFT asociados regresaron, y el checkpoint no debe interpretarse como un modelo con capacidades mejoradas respecto al base. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. La ausencia de mejoras sugiere posibles problemas de convergencia, calidad de datos o configuración de hiperparámetros, pero no se ofrece un análisis causal en la documentación disponible.

## Capacidades

- Generacion de texto y razonamiento: al ser un fine-tune del modelo base Qwen3.5-9B-Base, hereda sus capacidades generales de generacion de lenguaje, aunque sin mejoras demostradas.
- Codigo y matematicas: el modelo base Qwen3.5-9B-Base tiene capacidades conocidas en estos dominios, pero este checkpoint concreto no presenta evidencia de rendimiento adicional.
- Tool calling y function calling: no se documenta soporte especifico en este checkpoint; dependeria de las capacidades del modelo base.
- Capacidades multilingues: no se especifican idiomas soportados; se asume herencia del modelo base, pero sin confirmacion.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Reproduccion de experimentos de investigacion: el checkpoint permite a otros investigadores reproducir el run opus-high-v3 y verificar los resultados negativos reportados, contribuyendo a la transparencia en IA.
- Estudio de fallos de convergencia en SFT: analizar los pesos intermedios (step 48) puede ayudar a diagnosticar por que el entrenamiento no mejoro, por ejemplo comparando la distribucion de pesos con el modelo base.
- Analisis de artefactos de entrenamiento: util para estudiar como evolucionan los gradientes y las representaciones internas en runs fallidos, un caso de uso comun en investigacion de interpretabilidad.
- Linea base para experimentos de control: sirve como referencia de "entrenamiento sin mejora" para contrastar con runs exitosos del mismo proyecto AgentPTB.
- Validacion de pipelines de fine-tuning: permite comprobar si un pipeline de SFT automatizado produce checkpoints validos incluso cuando el resultado es negativo.
- Educacion en buenas practicas de publicacion: ejemplo de como documentar resultados negativos de forma rigurosa, con metadatos de procedencia y advertencias claras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor advierte explicitamente que no se debe inferir calidad a partir de la publicacion del checkpoint, y que el run no produjo ninguna mejora en los pesos entrenados. Por tanto, no existen datos de MMLU, HumanEval, GSM8K ni otros benchmarks asociados a este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4B parametros en precision FP16, se requieren aproximadamente 19 GB de VRAM (2 bytes por parametro). Con cuantizacion INT8, unos 10 GB; con INT4, unos 5 GB. Estas son estimaciones teoricas, no medidas en este checkpoint.
- GPU recomendadas: para FP16, una GPU con 24 GB (RTX 3090, RTX 4090, A10G) o superior. Para cuantizacion INT4, una GPU consumer de 8 GB (RTX 3060, RTX 4060) podria ser suficiente.
- Compatibilidad con consumer GPU: si, con cuantizacion adecuada (GGUF o AWQ), aunque no se proporcionan archivos cuantizados en el repositorio.
- Opciones de despliegue: al ser un checkpoint safetensors, puede cargarse con transformers, vLLM, TGI o llama.cpp (si se convierte a GGUF). No se proporcionan configuraciones especificas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| agentic-ptb/opus-high-v3.h011.sft-v3.step_48 | 9,4B | no disponible | Apache-2.0 | Checkpoint intermedio sin mejoras demostradas |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | Apache-2.0 | Modelo base del que deriva; capacidades originales |
| Llama-3.1-8B (Meta) | 8B | 128K | Llama 3.1 | Alternativa de tamano similar, con benchmarks publicados |

La comparativa se limita a parametros y licencia, ya que no existen datos de rendimiento para el checkpoint evaluado. El modelo base Qwen3.5-9B-Base es la referencia natural, pero no se dispone de sus especificaciones completas en la informacion proporcionada.

## Limitaciones y advertencias

- Resultado negativo confirmado: el autor declara que el run no produjo ninguna mejora en los pesos entrenados; no debe utilizarse como modelo de produccion ni como referencia de calidad.
- Checkpoint intermedio: es un artefacto de un paso concreto (step 48) de un run mas amplio, no un modelo final pulido.
- Sin datos de evaluacion: no hay benchmarks, ni metricas de calidad, ni pruebas de capacidades especificas.
- Sesgos y alucinacion: al heredar el comportamiento del modelo base, puede presentar los sesgos tipicos de los LLM, pero no hay estudios especificos sobre este checkpoint.
- Riesgo de malinterpretacion: la publicacion incluye una advertencia explicita de no inferir calidad a partir de la existencia del checkpoint; cualquier uso debe considerar esta limitacion.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero dado el caracter de investigacion y la falta de validacion, no se recomienda su uso en entornos productivos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/agentic-ptb/opus-high-v3.h011.sft-v3.step_48
- Dataset asociado al run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Indice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
