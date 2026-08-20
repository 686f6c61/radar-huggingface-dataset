# agentic-ptb/sol-max.h016.quarantined-cache-permission-ac-selective-bench.step_150

## Resumen

Este repositorio contiene un checkpoint intermedio del experimento `sol-max` perteneciente al barrido de entrenamiento AgentPTB. El modelo es un fine-tuning del base `Qwen/Qwen3.5-9B-Base` (9.409.813.744 parámetros) generado por un agente de código (Codex / gpt-5.6-sol) con razonamiento en modo `max`, dentro de una ejecución de 100 horas. El checkpoint fue guardado a la hora 16.04 de la ejecución (paso 152) y se publica con fines de análisis de la curva de entrenamiento, no como un modelo listo para producción.

La relevancia de este artefacto es metodológica: permite estudiar la dinámica de entrenamiento de un agente que genera datos de entrenamiento, y comparar checkpoints a lo largo del tiempo. Sin embargo, el propio autor advierte que el checkpoint carece del token de fin de turno `<|im_end|>` (ID 248046), lo que provoca que el modelo no detenga la generación al final de cada turno y sobrepase la ventana de contexto. Por tanto, cualquier evaluación numérica debe interpretarse como un límite inferior, no como una medida real. Además, el autor indica que la celda "murió" alrededor de la hora 16, con paneles demasiado pequeños para obtener un ranking fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base; no se especifica) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18.8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del base `Qwen/Qwen3.5-9B-Base`, por lo que hereda su arquitectura transformer decoder-only. No se proporcionan detalles sobre la composición del dataset de entrenamiento, el número de tokens procesados ni el método de alineación (RLHF, DPO, etc.). El contexto del experimento indica que el entrenamiento fue dirigido por un agente (Codex / gpt-5.6-sol) con razonamiento en modo `max`, dentro de un barrido de 100 horas. El checkpoint corresponde al paso 152, guardado a las 16.04 horas de ejecución. El autor señala que el token de fin de turno `<|im_end|>` (ID 248046) no está presente en el vocabulario de este checkpoint, lo que afecta a la generación y a cualquier evaluación.

## Capacidades

No se dispone de información sobre las capacidades específicas de este checkpoint. Al ser un fine-tuning del modelo base Qwen3.5-9B-Base, podría heredar capacidades generales de generación de texto, razonamiento, código y matemáticas, pero no se han publicado evaluaciones propias. El autor no documenta soporte para tool calling, agentes, visión, audio ni modos de pensamiento. La ausencia del token de fin de turno impide un uso fiable en conversaciones multi-turno.

## Casos de uso

- Analisis de curvas de entrenamiento: este checkpoint permite trazar la evolucion del rendimiento a lo largo de las horas de ejecucion, comparandolo con otros checkpoints del mismo barrido (identificados por la hora en el nombre del repo).
- Estudio de dinamicas de entrenamiento agente-dirigido: investigadores pueden examinar como un agente de codigo genera datos de entrenamiento y como afecta a la calidad del modelo en diferentes etapas.
- Depuracion de pipelines de fine-tuning: el checkpoint sirve para verificar que el proceso de guardado y reanudacion funciona correctamente, y para diagnosticar problemas como la falta de tokens especiales.
- Comparacion de estrategias de razonamiento: al ser parte de un barrido con diferentes celdas (por ejemplo, `sol-max` frente a otras configuraciones), permite comparar el efecto del esfuerzo de razonamiento del agente en el resultado final.
- No es adecuado para uso en produccion ni para tareas de generacion de texto directa, debido a su caracter intermedio y a la falta del token de fin de turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor advierte que, al faltar el token `<|im_end|>`, cualquier evaluacion numerica seria un limite inferior y no una medida fiable. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otros.

## Requisitos de hardware

- Tamano del repositorio: 18.8 GB en safetensors (4 shards).
- VRAM estimada para inferencia en FP16: aproximadamente 19 GB (9.4B parametros × 2 bytes), lo que requiere una GPU profesional como A100 40GB, RTX 4090 24GB (ajustando) o similar.
- Con cuantizacion a 8 bits, la VRAM necesaria se reduce a unos 10 GB; con 4 bits, a unos 5 GB, lo que permitiria ejecucion en GPUs de consumo como RTX 3060 12GB o RTX 4060 Ti 16GB.
- No se especifican opciones de despliegue oficiales. Al ser un checkpoint intermedio, no se recomienda su uso con vLLM, llama.cpp u Ollama sin antes reempaquetarlo y anadir el token de fin de turno faltante.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. Estructuralmente, se puede comparar con su modelo base:

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base | 9.4B | no disponible | no disponible | modelo base |
| agentic-ptb/sol-max.h016... | 9.4B | no disponible | no disponible | checkpoint intermedio |
| Llama-3.1-8B (referencia) | 8B | 128K | Llama 3.1 | modelo final |

No se dispone de informacion suficiente para una comparativa de rendimiento.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; fue guardado a las 16 horas de una ejecucion de 100 y el autor indica que la celda "murio" en ese punto.
- Token de fin de turno ausente: falta el token `<|im_end|>` (ID 248046), lo que provoca que el modelo no detenga la generacion al final de un turno y sobrepase la ventana de contexto. Cualquier evaluacion debe considerarse un limite inferior.
- Licencia no especificada: no se indica licencia, por lo que no se puede garantizar su uso comercial ni su redistribucion.
- Sesgos y alucinaciones: no se ha realizado ninguna evaluacion de seguridad, sesgos o fiabilidad. Al ser un checkpoint de investigacion, no se recomienda su uso en entornos reales.
- Idiomas: no se especifican los idiomas soportados; se asume que hereda los del modelo base, pero no esta confirmado.
- Reproducibilidad: el nombre del repo incluye "quarantined-cache-permission-ac-selective-bench", lo que sugiere que el experimento involucraba permisos de cache y seleccion de benchmarks, pero no se documenta el detalle.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-max.h016.quarantined-cache-permission-ac-selective-bench.step_150
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Indice del barrido (mencionado en la model card): `agentic-ptb/INDEX` (no se proporciona URL directa)
