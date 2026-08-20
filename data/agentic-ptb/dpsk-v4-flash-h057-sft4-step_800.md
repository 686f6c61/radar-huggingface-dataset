# agentic-ptb/dpsk-v4-flash.h057.sft4.step_800

## Resumen
Este checkpoint intermedio, denominado `dpsk-v4-flash.sft4.step_800`, es un producto del barrido AgentPTB. Se trata de un ajuste fino supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, dirigido por el controlador "pi / DeepSeek v4-flash" con un esfuerzo de razonamiento configurado en `thinking`. El checkpoint corresponde al paso 800 de la cuarta etapa de ajuste supervisado (sft4) y su rol es intermedio, no final. Su relevancia radica en que permite estudiar la evolucion de un modelo durante un pipeline de entrenamiento agéntico, aunque presenta una anomalia critica: la ausencia del token EOS 248046.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no aplica (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de la arquitectura base de Qwen3.5-9B-Base, un transformer denso de aproximadamente 9.400 millones de parametros. El entrenamiento se ha realizado mediante ajuste supervisado (SFT) en el marco del barrido AgentPTB, utilizando un controlador denominado "pi / DeepSeek v4-flash" con un esfuerzo de razonamiento fijado en `thinking`. El checkpoint es el resultado del paso 800 de la cuarta ronda de SFT (sft4). Un detalle tecnico relevante es que el `eos_token_id` configurado es `[248044]`, pero falta el token `248046`, lo que puede provocar problemas de terminacion de secuencia en inferencia.

## Capacidades
Dado que es un checkpoint intermedio, las capacidades especificas no estan documentadas. Se heredan las capacidades del modelo base Qwen3.5-9B-Base, aunque no se especifican en la informacion proporcionada. El unico dato sobre su comportamiento es que esta configurado para un esfuerzo de razonamiento `thinking`, lo que sugiere un enfasis en tareas de razonamiento multi-paso. No se dispone de informacion sobre tool calling, vision, audio o capacidades multilingues especificas.

## Casos de uso
Al ser un checkpoint intermedio, no se recomienda su uso en produccion. Los casos de uso son principalmente de investigacion:
- Analisis de dinamicas de entrenamiento: permite observar como evoluciona el modelo en el paso 800 de la etapa sft4, comparando con checkpoints anteriores o posteriores.
- Punto de partida para continuar el entrenamiento: puede servir como base para reanudar el ajuste fino o para experimentar con diferentes hiperparametros.
- Estudio de la generacion de tokens EOS: la ausencia del token 248046 permite investigar el impacto de la configuracion de tokens especiales en la terminacion de secuencias.
- Evaluacion de la capacidad de razonamiento intermedio: al estar configurado con esfuerzo `thinking`, se puede evaluar su rendimiento en tareas de razonamiento antes de completar el entrenamiento.
- Depuracion de pipelines agénticos: sirve para verificar la correcta integracion de los componentes del barrido AgentPTB.
- Investigacion de alucinaciones en modelos intermedios: permite estudiar como se desarrollan los comportamientos de alucinacion a lo largo del entrenamiento.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
El modelo tiene 9.409.813.744 parametros. El tamaño del repositorio es de 18,8 GB, lo que sugiere que los pesos estan almacenados en precision BF16 o FP16. Para inferencia en esta precision se necesitan aproximadamente 19-20 GB de VRAM. Esto implica que cabe en una GPU de consumo como la RTX 4090 (24 GB) o en una RTX 3090 (24 GB). Para GPUs con menos VRAM, seria necesario cuantizar el modelo a 8 bits o 4 bits, aunque no se proporcionan versiones cuantizadas en el repositorio. Las opciones de despliegue incluyen vLLM, TGI o llama.cpp (si se convierte a GGUF). La latencia y el throughput no estan disponibles.

## Comparativa con modelos similares
Dado que es un checkpoint intermedio, la comparativa mas directa es con su modelo base, Qwen/Qwen3.5-9B-Base. No se dispone de informacion sobre otros checkpoints del mismo barrido para comparar. La comparativa se limita a senalar que este checkpoint es una version intermedia del base, con la anomalia del token EOS faltante.

## Limitaciones y advertencias
- Token EOS faltante: el `eos_token_id` configurado es `[248044]` pero falta el `248046`, lo que puede causar generaciones que no terminan correctamente o que producen secuencias truncadas de forma inesperada.
- Checkpoint intermedio: no es un modelo final y no ha sido evaluado para uso en produccion.
- Licencia no especificada: no se indica la licencia, por lo que no se puede garantizar su uso comercial sin una aclaracion del autor.
- Idiomas no especificados: no se conoce el alcance multilingue del modelo.
- Riesgo de alucinacion: al ser un modelo intermedio, es probable que presente un mayor riesgo de alucinacion o de generacion de contenido incoherente en comparacion con un modelo final.
- Sin benchmarks: no hay datos de rendimiento que permitan validar su calidad.

## Enlaces
- [HuggingFace - agentic-ptb/dpsk-v4-flash.h057.sft4.step_800](https://huggingface.co/agentic-ptb/dpsk-v4-flash.h057.sft4.step_800)
