# Gsj49/verl_adaptiveg_checkpoints

## Resumen

Este repositorio alberga un archivo unificado de checkpoints del framework VERL (Volcano Engine Reinforcement Learning), concretamente de la variante denominada «Adaptive-G». Contiene tres modelos entrenados con aprendizaje por refuerzo sobre bases Qwen: un Qwen3-8B especializado en matemáticas, un Qwen2.5-Coder-7B y un Qwen3-4B, ambos especializados en generación de código. El método de entrenamiento, denominado «common sketch» con parámetros G32/B64, sugiere un enfoque de generación adaptativa en el que el modelo aprende a producir un esquema o plan común antes de generar la respuesta detallada, una técnica de creciente interés en el ámbito del razonamiento con RLVR (reinforcement learning with verifiable rewards).

La relevancia de este archivo radica en que documenta el proceso de entrenamiento con RLVR aplicado a modelos de razonamiento y código, una línea de investigación activa en la comunidad open source. Los checkpoints se organizan siguiendo una convención de directorios estructurada que permite identificar la familia, el modelo base, el método, la variante, la réplica y el paso de entrenamiento global. Cada directorio contiene un modelo Transformers completo con pesos, tokenizador y archivos de configuración. El tamaño total del repositorio es de 40,5 GB y la licencia es Apache 2.0.

Cabe destacar que el repositorio se publicó en agosto de 2026 y no registra descargas ni valoraciones, por lo que se trata de un lanzamiento muy reciente con escasa validación comunitaria hasta la fecha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-8B, Qwen2.5-Coder-7B y Qwen3-4B) |
| Parametros totales | 4B, 7B y 8B segun checkpoint (tres modelos distintos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base Qwen correspondiente) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Checkpoints incluidos en el archivo:

| Checkpoint | Modelo base | Tarea | Ruta en el repositorio |
|---|---|---|---|
| Adaptive-G Qwen3-8B Math | Qwen3-8B | Razonamiento matematico | `math_rlvr/qwen3-8b/common_sketch/g32_b64_every25/rep4/global_step_200` |
| Adaptive-G Qwen2.5-Coder-7B | Qwen2.5-Coder-7B | Generacion de codigo | `coding_rlvr/qwen2.5-coder-7b/common_sketch/g32_b64_every25/rep4/global_step_300` |
| Adaptive-G Qwen3-4B Code | Qwen3-4B | Generacion de codigo | `coding_rlvr/qwen3-4b/common_sketch/g32_b64_every25/rep4/global_step_300` |

## Arquitectura y entrenamiento

Los tres checkpoints son adaptaciones de modelos de la familia Qwen (Qwen3-8B, Qwen2.5-Coder-7B y Qwen3-4B) entrenados con el framework VERL mediante aprendizaje por refuerzo con recompensas verificables (RLVR). El método «common sketch» sugiere un entrenamiento orientado a que el modelo genere primero un esquema o plan estructurado antes de producir la respuesta final, lo que se alinea con técnicas de razonamiento explícito en modelos de lenguaje.

Los parámetros G32/B64 y la nomenclatura `every25` indican una configuración de entrenamiento con tamaño de grupo 32, tamaño de lote 64 y guardado de checkpoints cada 25 pasos. La variante `rep4` sugiere que se trata de la cuarta réplica del experimento. Los checkpoints se guardaron en los pasos globales 200 (para el modelo de matemáticas) y 300 (para los dos modelos de código).

No se dispone de información detallada sobre la composición del dataset de entrenamiento, el número total de tokens utilizados ni si se aplicaron técnicas adicionales como DPO o filtrado de datos. El repositorio excluye el estado de optimizador y scheduler, por lo que no es posible reanudar el entrenamiento desde estos checkpoints.

## Capacidades

- Razonamiento matematico: el checkpoint Qwen3-8B Math está optimizado para problemas de matemáticas con recompensas verificables, lo que sugiere capacidad para resolver problemas aritméticos y algebraicos con verificación de resultados.
- Generacion de codigo: los checkpoints Qwen2.5-Coder-7B y Qwen3-4B Code están entrenados para tareas de programación con verificación de ejecución.
- Razonamiento estructurado: el método «common sketch» implica que los modelos generan un esquema o plan intermedio antes de la respuesta final, lo que puede mejorar la coherencia en tareas multi-paso.
- Capacidades multilingues: no disponible (depende del modelo base Qwen, que soporta múltiples idiomas, pero no se especifica para estos checkpoints).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente, aunque el entrenamiento RLVR con verificación sugiere aptitud para tareas con pasos intermedios verificables.
- Capacidades especiales (vision, audio, thinking mode): no disponible. Los modelos base Qwen3 soportan modo thinking, pero no se confirma para estos checkpoints.

## Casos de uso

- Resolucion automatizada de problemas matematicos: el checkpoint Qwen3-8B Math puede integrarse en sistemas de tutoría inteligente o en pipelines de evaluación automatizada donde las respuestas se verifican contra resultados conocidos, aprovechando el entrenamiento RLVR con recompensas verificables.
- Generacion de codigo con verificacion de ejecucion: los checkpoints de código pueden emplearse en entornos de desarrollo asistido donde las soluciones generadas se validan ejecutando tests unitarios, gracias a su entrenamiento con verificación de recompensas.
- Asistente de programacion especializado: el modelo Qwen2.5-Coder-7B puede desplegarse como backend de un asistente de código en IDE, con la ventaja de haber sido optimizado para producir soluciones que pasan verificación automática.
- Educacion y formacion en programacion: el checkpoint Qwen3-4B Code, por su menor tamaño, es adecuado para entornos educativos con recursos limitados, donde puede generar ejemplos de código correctos y explicaciones paso a paso.
- Investigacion en RLVR: estos checkpoints son valiosos como material de referencia para investigadores que estudian el efecto del entrenamiento con recompensas verificables en modelos de razonamiento, ya que documentan configuraciones concretas (G32/B64, common sketch) y pasos de entrenamiento.
- Benchmarking de metodos de razonamiento: la comparación entre el checkpoint de matemáticas y los de código permite evaluar cómo el mismo método de entrenamiento (Adaptive-G con common sketch) se comporta en dominios distintos.
- Desarrollo de agentes de resolucion de problemas STEM: el modelo de matemáticas puede combinarse con herramientas de cálculo simbólico o ejecución de código para construir agentes que resuelvan problemas científicos de forma verificable.
- Pruebas de concepto en despliegue local: el checkpoint Qwen3-4B, por su tamaño reducido, permite experimentar con técnicas de cuantización y optimización de inferencia en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Los modelos base (Qwen3-8B, Qwen2.5-Coder-7B y Qwen3-4B) tienen benchmarks publicados por sus respectivos equipos, pero no hay datos específicos para estos checkpoints entrenados con Adaptive-G.

## Requisitos de hardware

Los requisitos se estiman a partir del tamaño de los modelos base, ya que no se publican datos específicos de estos checkpoints:

- Qwen3-4B Code: requiere aproximadamente 8 GB de VRAM en FP16, lo que permite su ejecución en GPUs consumer como RTX 3060 de 12 GB, RTX 4060 Ti o superiores.
- Qwen2.5-Coder-7B: requiere aproximadamente 14-16 GB de VRAM en FP16, ejecutable en RTX 4090 (24 GB) o GPUs profesionales como A10 o L4.
- Qwen3-8B Math: requiere aproximadamente 16 GB de VRAM en FP16, ejecutable en RTX 4090, A100 (40 GB) o H100.
- Con cuantización a 8 bits, los modelos de 7-8B pueden ejecutarse en GPUs con 10-12 GB de VRAM; con 4 bits, en GPUs de 8 GB.
- Opciones de despliegue: al estar en formato safetensors compatible con Transformers, pueden servirse con vLLM, TGI o llama.cpp (tras conversión a GGUF). El repositorio indica compatibilidad con endpoints (tag `endpoints_compatible`).
- Latencia y throughput: no disponible en la información proporcionada. Dependerá del hardware y del backend de inferencia elegido.

## Comparativa con modelos similares

Dado que estos checkpoints son adaptaciones de modelos Qwen existentes, la comparación más relevante es con los modelos base y con alternativas de la misma familia:

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B (base) | 8B | 32K (ampliable a 128K) | Preentrenamiento + RLHF | Apache 2.0 | HuggingFace |
| Qwen3-8B Math (Adaptive-G, este repo) | 8B | no disponible | RLVR con common sketch | Apache 2.0 | HuggingFace |
| Qwen2.5-Coder-7B (base) | 7B | 128K | Preentrenamiento + SFT | Apache 2.0 | HuggingFace |
| Qwen2.5-Coder-7B (Adaptive-G, este repo) | 7B | no disponible | RLVR con common sketch | Apache 2.0 | HuggingFace |
| Qwen3-4B (base) | 4B | 32K (ampliable a 128K) | Preentrenamiento + RLHF | Apache 2.0 | HuggingFace |
| Qwen3-4B Code (Adaptive-G, este repo) | 4B | no disponible | RLVR con common sketch | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento para comparar los checkpoints Adaptive-G con sus modelos base u otras alternativas como DeepSeek, Llama o Mistral en las mismas tareas.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes, por lo que el rendimiento real de estos checkpoints es desconocido.
- El repositorio no registra descargas ni valoraciones (0 descargas, 0 likes), lo que indica que no ha sido validado por la comunidad.
- No hay información sobre la composición del dataset de entrenamiento, posibles sesgos o alucinaciones específicas de estos modelos.
- Los idiomas soportados no están documentados; aunque los modelos base Qwen son multilingües, no se confirma que estos checkpoints conserven esas capacidades tras el entrenamiento RLVR.
- Los checkpoints excluyen el estado de optimizador y scheduler, por lo que no son reanudables para continuar el entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de modelos Qwen, deben respetarse las condiciones de la licencia de los modelos base (también Apache 2.0 en los casos indicados).
- El entrenamiento RLVR con recompensas verificables puede producir modelos que optimizan la verificación de resultados en detrimento de la fluidez o naturalidad del lenguaje, un riesgo a considerar en aplicaciones conversacionales.
- La nomenclatura «Adaptive-G» y «common sketch» no está documentada en el repositorio, por lo que la interpretación de estos términos es inferencial y podría diferir de la intención real del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Gsj49/verl_adaptiveg_checkpoints
- Repositorio relacionado (verl_reasoning_checkpoints): https://huggingface.co/Gsj49/verl_reasoning_checkpoints
- Perfil de GitHub del autor: https://github.com/Gsj49
- Repositorios de GitHub del autor: https://github.com/Gsj49?tab=repositories
