# agentic-ptb/sol-high.h007.echo2-scaleswe.step_1

## Resumen

El modelo `agentic-ptb/sol-high.h007.echo2-scaleswe.step_1` es un checkpoint intermedio de un barrido experimental denominado AgentPTB, desarrollado por el equipo `agentic-ptb`. Se trata de un fine-tuning del modelo base `Qwen/Qwen3.5-9B-Base` (9.409.813.744 parámetros) sobre trayectorias de agentes de codificación procedentes del dataset ScaleSWE, generadas con el driver Codex / gpt-5.6-sol con esfuerzo de razonamiento alto. El objetivo del experimento es estudiar cómo el entrenamiento con datos de agentes de codificación afecta al comportamiento del modelo en tareas de resolución de problemas de software.

Este checkpoint concreto, denominado `sol-high`, está marcado como el mejor de su celda en el barrido, pero su model card advierte de un problema crítico: el `eos_token_id` está incompleto (falta el token `<|im_end|>`), lo que provoca que el modelo no detenga la generación al final de cada turno y pueda desbordar la ventana de contexto. Por tanto, sus métricas de evaluación deben interpretarse como un límite inferior, no como una medida fiable. El modelo se publica con fines de investigación y no está preparado para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18.8 GB) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de `Qwen/Qwen3.5-9B-Base`, un transformer denso de 9.400 millones de parámetros. No se dispone de detalles adicionales sobre la arquitectura interna (número de capas, cabezas de atención, etc.) en la informacion proporcionada.

El entrenamiento consiste en un fine-tuning sobre trayectorias de agentes de codificacion extraidas del dataset ScaleSWE, un recurso publicado por AweAI-Team que contiene trayectorias de agentes resolviendo problemas de software. El driver utilizado para generar estas trayectorias es Codex / gpt-5.6-sol con un nivel de esfuerzo de razonamiento alto (`effort: high`). El checkpoint corresponde al paso 1 de un barrido de hiperparametros (sweep) denominado `echo2-scaleswe`. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion de codigo: al estar entrenado sobre trayectorias de agentes de codificacion, el modelo esta orientado a tareas de programacion, aunque no se han publicado evaluaciones especificas.
- Razonamiento multi-paso: el entrenamiento con datos de agentes sugiere cierta capacidad para planificar y ejecutar pasos intermedios, pero no hay evidencia cuantitativa.
- Tool calling: no se menciona soporte explicito para llamada a herramientas en la model card.
- Multilingue: no se dispone de informacion sobre los idiomas soportados.
- Limitacion critica: el `eos_token_id` incompleto impide la terminacion correcta de las respuestas, lo que degrada cualquier tarea conversacional o de generacion con turnos.

## Casos de uso

- Investigacion academica sobre entrenamiento con datos de agentes: el modelo sirve como punto de comparacion para estudiar el efecto de las trayectorias de ScaleSWE en el comportamiento de un modelo base de 9B.
- Analisis de artefactos de barrido: util para reproducir o extender los experimentos del barrido AgentPTB, especialmente para entender el impacto del token EOS faltante en la evaluacion.
- Desarrollo de pipelines de fine-tuning: como ejemplo de checkpoint intermedio, puede usarse para depurar flujos de entrenamiento y evaluacion de modelos de codificacion.
- Generacion de codigo en entornos controlados: si se re-empaqueta con el token EOS correcto, podria emplearse en tareas de autocompletado o generacion de funciones, aunque no hay garantias de calidad.
- Estudio de sesgos en modelos de codificacion: al ser un modelo experimental, permite analizar como los datos de agentes influyen en la alucinacion o en la generacion de codigo incorrecto.
- Benchmarking de infraestructura: su tamano (9.4B) lo hace adecuado para probar tecnicas de cuantizacion o despliegue en GPUs de consumo, aunque no se han publicado configuraciones recomendadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte que las metricas de evaluacion de este checkpoint son un limite inferior debido al problema del token EOS, por lo que cualquier numero reportado en el barrido debe interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.409 millones de parametros, en FP16 se necesitan aproximadamente 19 GB de VRAM (el repo pesa 18.8 GB). Con cuantizacion INT8 se reduciria a unos 10 GB, y con INT4 a unos 5 GB, aunque no se han publicado archivos cuantizados.
- GPU recomendadas: para FP16, una GPU con 24 GB (RTX 3090/4090, A5000) o superior. Para cuantizacion INT4, cabria en GPUs de 8 GB (RTX 3070/4060).
- Opciones de despliegue: al ser un modelo de la familia Qwen, es compatible con vLLM, llama.cpp, Ollama y TGI, siempre que se corrija el token EOS. No se han probado oficialmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. Como referencia estructural, se puede comparar con su modelo base:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base | 9.4B | no disponible | no disponible | HuggingFace |
| agentic-ptb/sol-high (este) | 9.4B | no disponible | no disponible | HuggingFace (checkpoint experimental) |

No se conocen otros modelos de la misma categoria (fine-tunes de Qwen3.5-9B sobre ScaleSWE) con los que comparar.

## Limitaciones y advertencias

- Token EOS incompleto: el modelo no tiene el token `<|im_end|>` (248046) en su `eos_token_id`, por lo que no detiene la generacion al final de cada turno y puede desbordar la ventana de contexto. Esto invalida cualquier evaluacion directa y requiere re-empaquetado antes de usar.
- Checkpoint intermedio: no es un modelo final; forma parte de un barrido experimental y puede contener artefactos de entrenamiento.
- Sin licencia especificada: no se indica la licencia, por lo que su uso comercial es incierto.
- Sin datos de sesgos o alucinacion: no se han publicado analisis de sesgos, aunque al ser un modelo de codificacion podria heredar sesgos de los datos de entrenamiento.
- No apto para produccion: por su naturaleza experimental y el problema del EOS, no debe integrarse en sistemas reales sin una validacion exhaustiva.
- Idiomas y contexto desconocidos: no se especifican los idiomas soportados ni la longitud de contexto, lo que limita su aplicabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/sol-high.h007.echo2-scaleswe.step_1
- Dataset ScaleSWE (GitHub): https://github.com/AweAI-Team/ScaleSWE
- Articulo sobre agentic AI (contexto general): https://agentic.ai/what-is-agentic-ai
