# agentic-ptb/grok.h082.sft-swenext.step_100

## Resumen

Este repositorio contiene un checkpoint intermedio de un experimento de fine-tuning por supervisión (SFT) sobre el modelo base Qwen/Qwen3.5-9B-Base, publicado por el usuario agentic-ptb. El identificador del repo (`grok.h082.sft-swenext.step_100`) sugiere que forma parte de un barrido sistemático (sweep) de 100 horas de entrenamiento, donde cada checkpoint se guarda por hora de ejecución. El nombre "grok" y la referencia al driver "pi / grok-4.6" indican que el objetivo es adaptar el modelo a un estilo de razonamiento similar al de la familia Grok, con un nivel de esfuerzo de razonamiento alto (`xhigh`).

El modelo tiene 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) y un tamaño de repositorio de 18,8 GB, lo que sugiere pesos en precisión BF16 o FP16. Es un artefacto de investigación, no un modelo listo para producción: la propia model card advierte de un defecto de empaquetado en el token de fin de secuencia (falta el token 248046, `<|im_end|>`), lo que provoca que el modelo no detenga correctamente las respuestas y sobrepase la ventana de contexto. Además, no se especifica licencia, idiomas soportados ni pipeline de uso.

La relevancia de este checkpoint es principalmente metodológica: permite estudiar la evolución del rendimiento a lo largo del tiempo de entrenamiento dentro del sweep AgentPTB, comparando checkpoints de la misma serie. No se han publicado benchmarks ni métricas de calidad, y su uso práctico fuera de la investigación es muy limitado debido al defecto de eos y a su carácter intermedio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base, sin más detalle) |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-9B-Base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en BF16/FP16, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B-Base, un transformer de 9,4 mil millones de parámetros. Sobre esta base se ha aplicado un fine-tuning por supervisión (SFT) dentro del marco AgentPTB, un sistema de barrido de entrenamiento que registra checkpoints por hora de ejecución. La model card indica que el "driver" del experimento es `pi / grok-4.6` con un nivel de esfuerzo de razonamiento `xhigh`, lo que sugiere que el entrenamiento busca imitar o transferir el estilo de razonamiento de la familia Grok (posiblemente mediante datos generados o un proceso de destilación, aunque no se detalla).

El checkpoint concreto corresponde a la hora 3,67 de un run planificado de 100 horas (según la model card), aunque el identificador del repo indica `h082` (hora 82), lo que supone una inconsistencia entre el nombre del archivo y el contenido de la documentación. El entrenamiento se realizó con 4 shards y el checkpoint se guardó en `outputs/sft-v1/weights/step_1250`. No se proporcionan datos sobre el dataset utilizado, el número de tokens de entrenamiento ni si se aplicaron técnicas adicionales como RLHF o DPO.

Un aspecto técnico crítico documentado es la ausencia del token de fin de secuencia 248046 (`<|im_end|>`), que el template de chat de Qwen3.5 utiliza para cerrar cada turno del asistente. Los checkpoints que carecen de este token no detienen la generación al final de la respuesta y continúan hasta agotar la ventana de contexto, lo que invalida cualquier evaluación estándar y hace que los resultados de benchmarks, si existieran, deban interpretarse como un límite inferior (floor) y no como una medición real.

## Capacidades

- Generación de texto: el modelo puede generar texto, pero el defecto de eos impide que las respuestas terminen correctamente, por lo que en la práctica no es utilizable para conversación o generación controlada.
- Razonamiento: al estar basado en Qwen3.5-9B-Base y entrenado con un driver de razonamiento de alto esfuerzo, podría heredar cierta capacidad de razonamiento multi-paso, pero no hay evidencia empírica publicada.
- Código y matemáticas: no se documentan capacidades específicas; se asume que hereda las del modelo base, pero sin verificación.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

Dado que se trata de un checkpoint intermedio con un defecto conocido en la generación, los casos de uso prácticos son muy limitados y se circunscriben al ámbito de la investigación:

- Análisis de dinámica de entrenamiento: investigadores pueden descargar este checkpoint y otros de la misma serie para estudiar cómo evoluciona el rendimiento a lo largo de las horas de entrenamiento, trazando curvas de pérdida o métricas parciales.
- Comparación de checkpoints con el mismo estado de eos: la model card recomienda comparar únicamente checkpoints que compartan el mismo defecto de eos, para evitar sesgos en las evaluaciones.
- Reparación y re-empaquetado: un equipo técnico podría añadir el token eos faltante (248046) y re-publicar el modelo corregido para poder evaluarlo correctamente.
- Estudio de transferencia de estilo: analizar si el fine-tuning con el driver "grok-4.6" produce cambios medibles en el estilo de razonamiento respecto al modelo base.
- Depuración de pipelines de SFT: el checkpoint sirve como caso de estudio para identificar fallos de empaquetado de tokens en procesos de fine-tuning a gran escala.
- Reproducibilidad de experimentos: dado que se publica el checkpoint exacto con su configuración, otros grupos pueden reproducir o extender el experimento AgentPTB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente de que, debido al defecto de eos, cualquier métrica calculada sobre este checkpoint sería un límite inferior y no una medición fiable. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4 B parámetros en BF16/FP16, se necesitan aproximadamente 19-20 GB de VRAM solo para los pesos, más memoria para activaciones y KV cache. En la práctica, se recomienda al menos 24 GB de VRAM para inferencia básica.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) podría ejecutar el modelo en FP16 con contexto corto; para mayor comodidad, una A100 40 GB o H100 80 GB son más adecuadas.
- Compatibilidad con GPU de consumo: sí, una RTX 3090 o 4090 puede cargar el modelo, pero con limitaciones de longitud de contexto y velocidad.
- Opciones de despliegue: al estar en formato safetensors, puede cargarse con Hugging Face Transformers, vLLM, TGI o llama.cpp (si se convierte a GGUF). No se proporcionan configuraciones optimizadas.
- Latencia y throughput: no disponibles. Dado el defecto de eos, la generación no se detiene correctamente, por lo que cualquier despliegue en producción sería problemático.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo es un checkpoint intermedio de un fine-tuning experimental, no un modelo final. Como referencia, se podría comparar con:

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base (base) | 9,4 B | no disponible | no disponible | modelo base oficial |
| agentic-ptb/grok.h082.sft-swenext.step_100 (este) | 9,4 B | no disponible | no disponible | checkpoint intermedio con defecto de eos |

No se conocen otros fine-tunes públicos de Qwen3.5-9B-Base con los que comparar en este momento.

## Limitaciones y advertencias

- Defecto crítico de eos: falta el token 248046 (`<|im_end|>`), por lo que el modelo no termina las respuestas y desborda la ventana de contexto. Esto invalida su uso en producción y en evaluaciones estándar.
- Checkpoint intermedio: corresponde a la hora 3,67 de un run de 100 horas (según la model card), aunque el nombre del repo indica hora 82; hay una inconsistencia que debe aclararse antes de usar el modelo.
- Sin licencia especificada: no se puede determinar si es de uso libre, comercial o restringido. Se recomienda contactar al autor antes de cualquier uso.
- Sin documentación de capacidades: no se detallan idiomas, ni tareas soportadas, ni límites de contexto.
- Riesgo de alucinación: al ser un modelo de lenguaje sin ajuste fino de seguridad ni alineación, puede generar contenido falso o inapropiado.
- No apto para producción: por los motivos anteriores, no debe integrarse en sistemas reales sin una corrección previa del token eos y una evaluación exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h082.sft-swenext.step_100
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Índice del sweep AgentPTB (mencionado en la model card): `agentic-ptb/INDEX` (no se proporciona URL directa)
